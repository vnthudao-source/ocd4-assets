/* =========================================================
   NỘP BÀI KHÔNG QUA GOOGLE FORM v1.1 – Thanh Phong Thư Môn
   v1.1: danh sách bài chỉ hiện mã + tuần + số bài đã nộp (vd "T1 - Tuần 1 - Đã nộp (1 bài)");
         "Bài khác" bắt buộc mô tả theo yêu cầu nhiệm vụ / GVCN
   ---------------------------------------------------------
   Gắn vào trang Nộp bài (Tác phẩm học viên). Thay nút "Nộp bài tập" (mở Google Form)
   bằng khung nộp bài ngay trên trang, gửi ảnh thẳng tới Apps Script (action "submitWork").
   - Họ tên / tổ / khoá do máy chủ lấy từ tab HocVien → không thể chọn nhầm tổ.
   - Máy chủ chặn ảnh giống hệt đã nộp, giới hạn số bài mỗi ngày, chỉ nhận mã ACTIVE.
   - Ảnh được thu nhỏ trên máy (cạnh dài tối đa 2000px) trước khi gửi.
   Cần: Reward Core (StudentRewardSystem + OCDAuth) và Minh Hồng (OCDStudentSession) trên trang;
        Auth.gs v1.6 trở lên.
========================================================= */
(function(){
"use strict";
if(window.OCDSubmitWork) return;
window.OCDSubmitWork={version:"1.2.1"};

const DEFAULT_API="https://script.google.com/macros/s/AKfycbwtMkodKNVrUgVWhpvhwMndPZKBrdWD4OF0XoR4i5poQsxRkEDLIkm56-MTxuOCVW9JXA/exec";
const MAX_SIDE=2000, QUALITY=0.86, TIMEOUT=120000;
const SCRIPT_BASE=(function(){ try{ const s=document.currentScript&&document.currentScript.src||""; return s.slice(0,s.lastIndexOf("/")+1); }catch(e){ return ""; } })();

/* ---------------- tiện ích ---------------- */
function $(id){ return document.getElementById(id); }
function h(tag,attrs,children){
    const e=document.createElement(tag);
    if(attrs) Object.keys(attrs).forEach(function(k){
        const v=attrs[k];
        if(v==null || v===false) return;
        if(k==="class") e.className=v;
        else if(k==="text") e.textContent=v;
        else if(k.indexOf("on")===0 && typeof v==="function") e.addEventListener(k.slice(2),v);
        else e.setAttribute(k,v===true?"":v);
    });
    (Array.isArray(children)?children:children!=null?[children]:[]).forEach(function(c){
        if(c==null || c===false) return;
        e.appendChild(typeof c==="string"?document.createTextNode(c):c);
    });
    return e;
}
function clean(v){ return String(v==null?"":v).trim(); }
function upCode(v){ return clean(v).toUpperCase().replace(/\s+/g,""); }
function API(){ const RS=window.StudentRewardSystem; return (RS&&RS.CONFIG&&RS.CONFIG.appsScriptUrl)||DEFAULT_API; }
function auth(){ return window.OCDAuth && typeof window.OCDAuth.token==="function" ? window.OCDAuth : null; }

/* ---------------- danh sách bài + số bài đã nộp ---------------- */
function parseCsv(text){
    const rows=[]; let row=[], cell="", q=false; text=String(text||"").replace(/^\uFEFF/,"");
    for(let i=0;i<text.length;i++){
        const c=text[i];
        if(q){ if(c==='"'){ if(text[i+1]==='"'){ cell+='"'; i++; } else q=false; } else cell+=c; continue; }
        if(c==='"') q=true; else if(c===","){ row.push(cell); cell=""; }
        else if(c==="\n"||c==="\r"){ if(c==="\r"&&text[i+1]==="\n") i++; row.push(cell); rows.push(row); row=[]; cell=""; }
        else cell+=c;
    }
    if(cell!==""||row.length){ row.push(cell); rows.push(row); }
    return rows;
}
const CODE_RE=/(^|[^A-Z0-9])(VPTB|LM|LB|T(?:5[0-2]|[1-4][0-9]|[1-9]))(?=$|[^A-Z0-9])/g;
/* Đếm số bài đã nộp theo mã bài (VPTB, T1…T52, LM, LB) của học viên */
async function submittedCounts(code){
    const out={};
    try{
        const RS=window.StudentRewardSystem;
        if(window.StudentRewardSystemReady) await window.StudentRewardSystemReady;
        if(!RS || typeof RS.getStudentSubmissionsCsv!=="function") return out;
        const rows=parseCsv(await RS.getStudentSubmissionsCsv(code,true)), head=(rows[0]||[]).map(function(x){ return clean(x).toLowerCase(); });
        let ci=head.findIndex(function(x){ return x.indexOf("mã học viên")===0; });
        let di=head.findIndex(function(x){ return x.indexOf("mô tả")===0; }); if(di<0) di=6;
        rows.slice(1).forEach(function(r){
            if(ci>=0 && upCode(r[ci])!==code) return;
            const text=clean(r[di]).toUpperCase(), seen={}; let m; CODE_RE.lastIndex=0;
            while((m=CODE_RE.exec(text))){ if(!seen[m[2]]){ seen[m[2]]=true; out[m[2]]=(out[m[2]]||0)+1; } }
        });
    }catch(e){}
    return out;
}
function lessonOptions(counts){
    const done=function(k){ if(!counts) return ""; const n=counts[k]||0; return n?" - Đã nộp ("+n+" bài)":" - Chưa nộp"; };
    const opts=[{value:"",text:"— Chọn bài tập —"}];
    opts.push({value:"VPTB",text:"VPTB - Chuẩn bị"+done("VPTB")});
    for(let i=1;i<=52;i++) opts.push({value:"T"+i,text:"T"+i+" - Tuần "+i+done("T"+i)});
    opts.push({value:"LM",text:"LM - Lâm mô"+done("LM")});
    opts.push({value:"LB",text:"LB - Lưu bút"+done("LB")});
    opts.push({value:"KHAC",text:"Bài khác"});
    return opts;
}

/* ---------------- học viên đang xem ---------------- */
function isMember(c){ return /^TV\d{6}$/.test(c) && !/^TV(?!00)\d{2,3}0[1-4]01$/.test(c); }
function viewer(){
    const A=auth(), me=A&&A.token()?A.me():null;
    if(me){
        const code=upCode(me.linked || (me.type!=="TV"?me.code:""));
        return {code:code,name:me.name||"",logged:true,member:!code};
    }
    let code="";
    try{ const s=window.OCDStudentSession; code=s&&typeof s.getCode==="function"?upCode(s.getCode()):""; }catch(e){}
    if(code==="ADMIN" || isMember(code)) code="";
    if(!code){ const inp=$("swpCode"); code=upCode(inp&&inp.value); }
    return {code:code,name:"",logged:false};
}
async function registryInfo(code){
    try{
        const RS=window.StudentRewardSystem;
        if(window.StudentRewardSystemReady) await window.StudentRewardSystemReady;
        if(RS && typeof RS.getStudentAccess==="function"){ const a=await RS.getStudentAccess(code,{}); return a&&a.student?a.student:null; }
    }catch(e){}
    return null;
}

/* ---------------- ảnh ---------------- */
function readAsDataUrl(file){ return new Promise(function(res,rej){ const r=new FileReader(); r.onload=function(){ res(r.result); }; r.onerror=rej; r.readAsDataURL(file); }); }
function loadImage(url){ return new Promise(function(res,rej){ const i=new Image(); i.onload=function(){ res(i); }; i.onerror=rej; i.src=url; }); }
async function prepareImage(file){
    const raw=await readAsDataUrl(file);
    try{
        const img=await loadImage(raw);
        const w=img.naturalWidth, hgt=img.naturalHeight;
        if(!w || !hgt) return raw;
        const k=Math.min(1,MAX_SIDE/Math.max(w,hgt));
        if(k===1 && file.size<1.5*1024*1024 && /jpe?g/i.test(file.type)) return raw;
        const cv=document.createElement("canvas"); cv.width=Math.round(w*k); cv.height=Math.round(hgt*k);
        const ctx=cv.getContext("2d"); ctx.fillStyle="#fff"; ctx.fillRect(0,0,cv.width,cv.height); ctx.drawImage(img,0,0,cv.width,cv.height);
        return cv.toDataURL("image/jpeg",QUALITY);
    }catch(e){ return raw; } /* trình duyệt không đọc được (vd HEIC) → gửi ảnh gốc */
}
function dataUrlBytes(d){ const i=d.indexOf(","); return Math.floor((d.length-i-1)*3/4); }

/* ---------------- gửi ---------------- */
async function send(payload){
    const ac=new AbortController(), timer=setTimeout(function(){ ac.abort(); },TIMEOUT);
    try{
        const res=await fetch(API(),{method:"POST",body:JSON.stringify({action:"enroll",op:"submitWork",token:payload.token,code:payload.code,device:navigator.userAgent.slice(0,100),
            fields:Object.assign({op:"submitWork"},payload)}), /* dữ liệu bài nằm trong fields (Code.gs có thể chỉ chuyển token + fields) */
            headers:{"Content-Type":"text/plain;charset=utf-8"},credentials:"omit",cache:"no-store",signal:ac.signal});
        const json=JSON.parse(await res.text());
        if(json && json.expired && auth()){ try{ await auth().logout(false); }catch(e){} }
        return json||{ok:false,error:"Máy chủ không phản hồi."};
    }catch(e){
        return {ok:false,network:true,error:e&&e.name==="AbortError"?"Gửi bài quá lâu, vui lòng kiểm tra mạng rồi thử lại (bài trùng sẽ không bị ghi hai lần).":"Không kết nối được máy chủ. Vui lòng thử lại."};
    }finally{ clearTimeout(timer); }
}

/* ---------------- giao diện ---------------- */
const CSS=`
.osw-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:45px;padding:0 25px;border:0;border-radius:11px;background:#172033;color:#fff;font:900 14px Arial,Helvetica,sans-serif;cursor:pointer;box-shadow:0 7px 20px rgba(23,32,51,.15)}
.osw-btn:disabled{background:#94a3b8;cursor:wait}
.osw-btn.ghost{background:#f1f5f9;color:#172033;box-shadow:none}
.osw-hidden{display:none!important}
.osw-back{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:20px 12px;background:rgba(15,23,42,.55);font-family:Arial,Helvetica,sans-serif}
.osw-back *,.osw-back *::before,.osw-back *::after{box-sizing:border-box}
.osw-back{box-sizing:border-box}
.osw-box{width:100%;max-width:520px;max-height:calc(100vh - 40px);max-height:calc(100dvh - 40px);display:flex;flex-direction:column;overflow:hidden;border-radius:18px;background:#fff;color:#172033;box-shadow:0 20px 60px rgba(0,0,0,.3);border-top:5px solid #d97706}
.osw-head{flex:0 0 auto}
.osw-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:16px 18px 4px}
.osw-title{margin:0;color:#92400e;font:900 20px/1.3 Arial,Helvetica,sans-serif}
.osw-x{border:0;background:none;color:#64748b;font-size:26px;line-height:1;cursor:pointer;padding:2px 6px}
.osw-body{flex:1 1 auto;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:8px 18px 0}
.osw-who{padding:10px 12px;border-radius:11px;background:#fffbeb;border:1px solid #fde68a;font-size:13px;line-height:1.55;color:#78350f}
.osw-who b{color:#7c2d12}
.osw-label{display:block;margin:14px 0 6px;font-size:13px;font-weight:900;color:#334155}
.osw-req{color:#dc2626}
.osw-select,.osw-text{width:100%;box-sizing:border-box;padding:12px;border:1px solid #d1d5db;border-radius:10px;background:#fff;color:#172033;font:16px Arial,Helvetica,sans-serif}
.osw-text{min-height:74px;resize:vertical}
.osw-text.osw-must{border-color:#f59e0b;background:#fffbeb}
.osw-hint{margin-top:5px;font-size:11.5px;line-height:1.5;color:#64748b}
.osw-drop{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-height:150px;padding:14px;border:2px dashed #fbbf24;border-radius:14px;background:#fffdf7;color:#92400e;text-align:center;cursor:pointer;font-size:13px;font-weight:900}
.osw-drop img{max-width:100%;max-height:300px;max-height:min(300px,32vh);border-radius:10px;object-fit:contain}
.osw-drop input{display:none}
.osw-msg{display:none;margin-top:12px;padding:10px 12px;border-radius:10px;font-size:13px;line-height:1.55}
.osw-msg.err{display:block;background:#fee2e2;color:#991b1b}
.osw-msg.ok{display:block;background:#dcfce7;color:#166534}
.osw-msg.info{display:block;background:#eff6ff;color:#1d4ed8}
.osw-actions{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.osw-foot{flex:0 0 auto;padding:10px 18px calc(12px + env(safe-area-inset-bottom,0px));background:#fff;border-top:1px solid #e2e8f0;box-shadow:0 -6px 16px rgba(15,23,42,.06)}
.osw-foot .osw-msg{margin:0 0 8px;max-height:96px;overflow:auto}
.osw-body{padding-bottom:14px!important}
.osw-done{text-align:center;padding:6px 0}
.osw-done img{max-width:100%;max-height:260px;max-height:min(260px,35vh);border-radius:12px;margin:10px 0}
.osw-noscroll{overflow:hidden!important}
@media(max-width:600px){
.osw-back{padding:8px}
.osw-box{max-height:calc(100vh - 16px);max-height:calc(100dvh - 16px);border-radius:14px}
.osw-head{padding:12px 14px 2px}.osw-title{font-size:18px}
.osw-body{padding:6px 14px 0}.osw-foot{padding:8px 14px calc(10px + env(safe-area-inset-bottom,0px))}
.osw-drop img{max-height:26vh}
.osw-drop{min-height:110px}.osw-label{margin-top:10px}
.osw-btn{width:100%}
}
`;
function injectCss(){ if($("oswCss")) return; const s=document.createElement("style"); s.id="oswCss"; s.textContent=CSS; document.head.appendChild(s); }

function say(box,text,kind){ box.className="osw-msg "+(kind||"err"); box.textContent=text; }
function closeModal(){ const m=$("oswModal"); if(m) m.remove(); document.documentElement.classList.remove("osw-noscroll"); document.removeEventListener("keydown",onKey); }
function onKey(e){ if(e.key==="Escape") closeModal(); }

async function openModal(){
    closeModal();
    const box=h("div",{class:"osw-box",role:"dialog","aria-modal":"true","aria-labelledby":"oswTitle"});
    const back=h("div",{class:"osw-back",id:"oswModal",onclick:function(e){ if(e.target===back) closeModal(); }},[box]);
    box.appendChild(h("div",{class:"osw-head"},[h("h3",{class:"osw-title",id:"oswTitle",text:"📝 Nộp bài tập"}),h("button",{type:"button",class:"osw-x","aria-label":"Đóng",text:"×",onclick:closeModal})]));
    const body=h("div",{class:"osw-body"}); box.appendChild(body);
    const foot=h("div",{class:"osw-foot osw-hidden"}); box.appendChild(foot); /* nút gửi luôn nằm ngoài vùng cuộn */
    /* chiều cao theo màn hình thật (thanh địa chỉ điện thoại co giãn) */
    const fit=function(){ if(!back.isConnected){ window.removeEventListener("resize",fit); if(window.visualViewport) visualViewport.removeEventListener("resize",fit); return; }
        const vh=window.visualViewport?window.visualViewport.height:window.innerHeight;
        back.style.height=vh+"px"; box.style.maxHeight=Math.max(280,vh-(window.innerWidth<=600?16:40))+"px"; };
    window.addEventListener("resize",fit); if(window.visualViewport) window.visualViewport.addEventListener("resize",fit);
    document.body.appendChild(back); document.documentElement.classList.add("osw-noscroll"); document.addEventListener("keydown",onKey); fit();

    const v=viewer();
    if(!v.code){
        body.appendChild(h("div",{class:"osw-msg err",text:v.member?"Tài khoản của bạn chưa có mã học viên. Hãy đăng ký khoá học trước khi nộp bài.":"Chưa nhận diện được mã học viên. Vui lòng nhập mã học viên tại Minh Hồng (biểu tượng ở góc màn hình) rồi thử lại."}));
        return;
    }
    const who=h("div",{class:"osw-who",text:"Đang kiểm tra mã học viên "+v.code+"…"});
    body.appendChild(who);
    const info=await registryInfo(v.code);
    who.innerHTML="";
    who.append("Nộp bài cho: ",h("b",{text:(info&&info.name)||v.name||"Học viên"}),
        " · Mã ",h("b",{text:v.code}),
        info&&info.group?" · Tổ "+info.group:"", info&&info.course?" · Khoá "+info.course:"");
    who.appendChild(h("div",{class:"osw-hint",text:"Tổ và khoá được lấy tự động theo danh sách học viên. Nếu thông tin chưa đúng, vui lòng báo GVCN."}));
    const shown=upCode(($("swpCode")||{}).value);
    if(shown && shown!==v.code) who.appendChild(h("div",{class:"osw-hint",style:"color:#b45309;font-weight:bold",text:"Lưu ý: bạn đang xem hồ sơ mã "+shown+", bài sẽ được nộp cho mã "+v.code+" của bạn."}));
    if(info && info.status && info.status!=="active"){
        body.appendChild(h("div",{class:"osw-msg err",text:"Mã học viên "+v.code+(info.status==="pending"?" đang chờ giáo viên phê duyệt":info.status==="paused"?" đã dừng hoạt động":" chưa được kích hoạt")+", chưa nộp bài được. Vui lòng liên hệ GVCN."}));
        return;
    }

    const sel=h("select",{class:"osw-select",id:"oswLesson"});
    const fill=function(counts){ const keep=sel.value; sel.innerHTML=""; lessonOptions(counts).forEach(function(o){ sel.appendChild(h("option",{value:o.value,text:o.text})); }); sel.value=keep; };
    fill(null);
    submittedCounts(v.code).then(fill);
    const NOTE_OPTIONAL="Không bắt buộc – ghi thêm khi GVCN yêu cầu";
    const NOTE_REQUIRED="Bắt buộc - Ghi đúng theo yêu cầu của nhiệm vụ hoặc của GVCN";
    const note=h("textarea",{class:"osw-text",id:"oswNote",maxlength:"300",placeholder:NOTE_OPTIONAL});
    const noteStar=h("span",{class:"osw-req osw-hidden",text:"*"});
    const fileInput=h("input",{type:"file",accept:"image/*"});
    const preview=h("div",{text:""});
    const drop=h("label",{class:"osw-drop"},[fileInput,h("span",{text:"📷"}),h("span",{text:"Bấm để chọn ảnh bài viết"}),preview]);
    const msg=h("div",{class:"osw-msg"});
    const submit=h("button",{type:"button",class:"osw-btn",text:"GỬI BÀI"});
    body.append(
        h("label",{class:"osw-label",for:"oswLesson"},["Bài tập ",h("span",{class:"osw-req",text:"*"})]), sel,
        h("label",{class:"osw-label",for:"oswNote"},["Mô tả thêm ",noteStar]), note,
        h("span",{class:"osw-label"},["Ảnh bài tập ",h("span",{class:"osw-req",text:"*"})]), drop,
        h("div",{class:"osw-hint",text:"Chụp thẳng, đủ sáng, thấy rõ toàn bộ tờ giấy. Mỗi ngày nộp tối đa 2 bài; ảnh đã nộp rồi sẽ không nộp lại được."})
    );
    foot.append(msg, h("div",{class:"osw-actions"},[submit]));
    foot.classList.remove("osw-hidden");
    sel.addEventListener("change",function(){
        const req=sel.value==="KHAC";
        note.placeholder=req?NOTE_REQUIRED:NOTE_OPTIONAL;
        noteStar.classList.toggle("osw-hidden",!req);
        note.classList.toggle("osw-must",req);
    });
    let picked=null;
    fileInput.addEventListener("change",async function(){
        msg.className="osw-msg";
        const f=fileInput.files&&fileInput.files[0]; picked=null; preview.innerHTML="";
        if(!f) return;
        if(!/^image\//.test(f.type) && !/\.(heic|heif|jpe?g|png|webp)$/i.test(f.name)){ say(msg,"Vui lòng chọn tệp ảnh."); return; }
        say(msg,"Đang chuẩn bị ảnh…","info");
        try{
            picked=await prepareImage(f);
            if(dataUrlBytes(picked)>8*1024*1024){ picked=null; say(msg,"Ảnh quá lớn (tối đa 8MB). Vui lòng chọn ảnh khác."); return; }
            preview.appendChild(h("img",{src:picked,alt:"Ảnh xem trước"}));
            msg.className="osw-msg";
        }catch(e){ say(msg,"Không đọc được ảnh này. Vui lòng chọn ảnh khác."); }
    });
    submit.onclick=async function(){
        msg.className="osw-msg";
        const lesson=sel.value, n=clean(note.value);
        if(!lesson){ say(msg,"Vui lòng chọn bài tập."); sel.focus(); return; }
        if(lesson==="KHAC" && !n){ say(msg,"Bài khác: bắt buộc ghi mô tả đúng theo yêu cầu của nhiệm vụ hoặc của GVCN."); note.focus(); return; }
        if(!picked){ say(msg,"Vui lòng chọn ảnh bài tập."); return; }
        submit.disabled=true; submit.textContent="ĐANG GỬI BÀI…";
        say(msg,"Đang gửi ảnh, vui lòng không đóng trang…","info");
        const A=auth();
        const r=await send({token:A&&A.token()?A.token():"",code:v.code,lesson:lesson,note:n,data:picked});
        submit.disabled=false; submit.textContent="GỬI BÀI";
        if(!r || !r.ok){
            let e=(r&&r.error)||"Chưa gửi được bài. Vui lòng thử lại.";
            if(!r || (!r.op && !r.network)) e="Máy chủ chưa nhận lệnh nộp bài mới (Apps Script cần bản Auth.gs v1.6.2 và triển khai phiên bản mới). Máy chủ trả lời: \""+((r&&r.error)||"không rõ")+"\"";
            say(msg,e); return;
        }
        body.innerHTML="";
        body.appendChild(h("div",{class:"osw-done"},[
            h("div",{class:"osw-msg ok",text:"✅ Đã nộp bài "+r.desc+" lúc "+r.time+" (bài thứ "+r.today+"/"+r.limit+" hôm nay)."}),
            h("img",{src:picked,alt:"Bài vừa nộp"}),
            h("div",{class:"osw-hint",text:"Bài sẽ hiện trong danh sách và mục Tác phẩm mới nhất sau vài phút (Google cần thời gian cập nhật dữ liệu công khai)."})
        ]));
        body.scrollTop=0;
        foot.innerHTML="";
        foot.appendChild(h("div",{class:"osw-actions"},[
            h("button",{type:"button",class:"osw-btn",text:"Tải lại trang",onclick:function(){ location.reload(); }}),
            h("button",{type:"button",class:"osw-btn ghost",text:"Đóng",onclick:closeModal})
        ]));
        try{ window.dispatchEvent(new CustomEvent("ocdWorkSubmitted",{detail:r})); }catch(e){}
    };
}

/* ---------------- gắn vào trang ---------------- */
function mount(){
    const wrap=$("swpSubmit"), link=$("swpSubmitLink");
    if(!wrap || !link || $("oswSubmitBtn")) return !!$("oswSubmitBtn");
    injectCss();
    const btn=h("button",{type:"button",class:"osw-btn",id:"oswSubmitBtn",onclick:openModal},[h("span",{text:"📝"}),h("span",{text:"Nộp bài tập"})]);
    link.parentNode.insertBefore(btn,link);
    link.classList.add("osw-hidden"); /* giữ link Form cũ trong trang (ẩn) để trang gốc vẫn chạy */
    /* trang gốc ẩn link khi đã đủ bài trong ngày → ẩn theo */
    const sync=function(){ btn.classList.toggle("osw-hidden",link.classList.contains("is-hidden")); };
    sync();
    new MutationObserver(sync).observe(link,{attributes:true,attributeFilter:["class"]});
    return true;
}
function start(){
    if(mount()) return;
    let tries=0;
    const t=setInterval(function(){ if(mount() || ++tries>120) clearInterval(t); },250);
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",start,{once:true}); else start();
window.OCDSubmitWork.open=openModal;
})();
