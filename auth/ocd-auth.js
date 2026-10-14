/* =========================================================
   OCD AUTH v1.0 – Tài khoản bảo mật (đi kèm Reward Core)
   ---------------------------------------------------------
   - window.OCDAuth / StudentRewardSystem.auth
   - Lưu phiên đăng nhập (localStorage, dùng chung mọi trang thudao.com)
   - Tự gắn mã phiên vào mọi yêu cầu gửi tới Apps Script của hệ thống
   - Chặn tra cứu hồ sơ đã bảo mật nếu người xem không phải chủ tài khoản
   - Hộp thoại: Đăng nhập · Nâng cấp bảo mật · Quên mật khẩu · Tài khoản
========================================================= */
(function(){
"use strict";
if(window.OCDAuth) return;

const KEY="ocd_auth_v1", PUB_KEY="ocd_auth_public_v1", PUB_TTL=60*1000;
const RS0=window.StudentRewardSystem;
const API=(RS0&&RS0.CONFIG&&RS0.CONFIG.appsScriptUrl)||"https://script.google.com/macros/s/AKfycbwtMkodKNVrUgVWhpvhwMndPZKBrdWD4OF0XoR4i5poQsxRkEDLIkm56-MTxuOCVW9JXA/exec";

function up(v){ return String(v==null?"":v).trim().toUpperCase().replace(/\s+/g,""); }
function store(k,v){ try{ if(v===undefined) return JSON.parse(localStorage.getItem(k)||"null"); if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,JSON.stringify(v)); }catch(e){ return null; } }
function emit(name,detail){ try{ window.dispatchEvent(new CustomEvent(name,{detail:detail||{}})); }catch(e){} }

/* ---------------- Phiên đăng nhập ---------------- */
let session=store(KEY);
if(session && (!session.token || !session.expires || session.expires<Date.now())){ session=null; store(KEY,null); }
function token(){ return session&&session.expires>Date.now()?session.token:""; }
function me(){ return token()?session.me:null; }
function myCodes(){ const m=me(); if(!m) return []; return [up(m.code),up(m.linked)].filter(Boolean); }
function isMe(code){ code=up(code); return !!code && myCodes().indexOf(code)>=0; }
function saveSession(res){
    session={token:res.token,expires:res.expires,me:res.me,checked:Date.now()};
    store(KEY,session);
    const code=up(res.me&&(res.me.linked||res.me.code));
    try{ if(code && window.OCDStudentSession && window.OCDStudentSession.confirmStudent) window.OCDStudentSession.confirmStudent(code,"ocd-auth"); }catch(e){}
    try{ sessionStorage.removeItem(PUB_KEY); }catch(e){}
    emit("ocdAuthChanged",{loggedIn:true,me:res.me});
}
function dropSession(clearStudent){
    const was=me(); session=null; store(KEY,null);
    if(clearStudent){ try{ if(window.OCDStudentSession && window.OCDStudentSession.clear) window.OCDStudentSession.clear("ocd-auth-logout"); }catch(e){} }
    emit("ocdAuthChanged",{loggedIn:false,previous:was});
}

/* ---------------- Gắn mã phiên vào yêu cầu Apps Script ---------------- */
const nativeFetch=window.fetch.bind(window);
window.fetch=function(input,init){
    try{
        const url=typeof input==="string"?input:(input&&input.url)||"";
        const t=token();
        if(t && url.indexOf(API)===0){
            init=init?Object.assign({},init):{};
            const method=String(init.method||(typeof input!=="string"&&input.method)||"GET").toUpperCase();
            if(method==="GET" && typeof input==="string" && !/[?&]token=/.test(input)){
                input=input+(input.indexOf("?")>=0?"&":"?")+"token="+encodeURIComponent(t);
            }else if(method==="POST" && typeof init.body==="string"){
                try{ const b=JSON.parse(init.body); if(b && typeof b==="object" && !b.token){ b.token=t; init.body=JSON.stringify(b); } }catch(e){}
            }
        }
    }catch(e){}
    return nativeFetch(input,init);
};

/* ---------------- Gọi máy chủ ---------------- */
async function post(action,body){
    const ac=new AbortController(), timer=setTimeout(function(){ ac.abort(); },25000);
    try{
        const payload=Object.assign({action:action,device:navigator.userAgent.slice(0,100)},body||{});
        const res=await nativeFetch(API,{method:"POST",body:JSON.stringify(payload),headers:{"Content-Type":"text/plain;charset=utf-8"},credentials:"omit",cache:"no-store",signal:ac.signal});
        const json=JSON.parse(await res.text());
        if(json && json.expired && action!=="authMe") dropSession(false);
        return json||{ok:false,error:"Máy chủ không phản hồi."};
    }catch(e){
        return {ok:false,error:"Không kết nối được máy chủ. Vui lòng thử lại."};
    }finally{ clearTimeout(timer); }
}

/* Danh sách công khai: mã đã bảo mật + lựa chọn avatar/khung/nền */
let pubPromise=null;
function publicInfo(force){
    if(!force){
        try{ const c=JSON.parse(sessionStorage.getItem(PUB_KEY)||"null"); if(c && Date.now()-c.at<PUB_TTL) return Promise.resolve(c); }catch(e){}
        if(pubPromise) return pubPromise;
    }
    pubPromise=(async function(){
        try{
            const res=await nativeFetch(API+"?action=authPublic&_="+Date.now(),{cache:"no-store",credentials:"omit"});
            const j=JSON.parse(await res.text());
            if(!j || !j.ok) throw new Error("authPublic");
            const out={at:Date.now(),protected:(j.protected||[]).map(up),look:j.look||{}};
            try{ sessionStorage.setItem(PUB_KEY,JSON.stringify(out)); }catch(e){}
            return out;
        }catch(e){
            return {at:0,protected:[],look:{},failed:true};
        }finally{ setTimeout(function(){ pubPromise=null; },0); }
    })();
    return pubPromise;
}
async function isProtected(code){ const p=await publicInfo(); return p.protected.indexOf(up(code))>=0; }
async function canView(code){ code=up(code); if(!code) return true; if(isMe(code)) return true; return !(await isProtected(code)); }
async function lookOf(code){ const p=await publicInfo(); return p.look[up(code)]||null; }

/* Kiểm tra lại phiên (mỗi 10 phút) */
async function refreshMe(){
    if(!token()) return null;
    if(session.checked && Date.now()-session.checked<10*60*1000) return session.me;
    const r=await post("authMe",{token:token()});
    if(r.ok){ session.me=r.me; session.checked=Date.now(); store(KEY,session); return r.me; }
    if(r.expired){ dropSession(false); }
    return me();
}

/* ---------------- Giao diện ---------------- */
const CSS=`
.oa-back{position:fixed;inset:0;z-index:2147483600;background:rgba(30,22,16,.55);display:flex;align-items:center;justify-content:center;padding:16px;font-family:Arial,sans-serif}
.oa-box{background:#fffaf2;color:#2c241b;border-radius:14px;max-width:400px;width:100%;max-height:92vh;overflow:auto;box-shadow:0 18px 50px rgba(0,0,0,.3);border-top:5px solid #8b3328}
.oa-head{display:flex;align-items:center;justify-content:space-between;padding:16px 18px 6px}
.oa-title{font:bold 17px/1.4 Georgia,"Times New Roman",serif;color:#8b3328;margin:0}
.oa-x{border:0;background:none;font-size:24px;line-height:1;color:#8b7b6a;cursor:pointer;padding:2px 6px}
.oa-body{padding:6px 18px 18px}
.oa-text{font-size:14px;line-height:1.6;margin:0 0 12px;color:#4e4436}
.oa-label{display:block;font-size:13px;font-weight:bold;margin:10px 0 4px;color:#5a4a3a}
.oa-field{position:relative}
.oa-input{box-sizing:border-box;width:100%;padding:11px 12px;border:1px solid #d8ccb8;border-radius:8px;font-size:16px;background:#fff;color:#2c241b}
.oa-input:focus{outline:2px solid #c9a45c;border-color:#c9a45c}
.oa-eye{position:absolute;right:6px;top:50%;transform:translateY(-50%);border:0;background:none;cursor:pointer;font-size:16px;padding:6px;color:#8b7b6a}
.oa-btn{display:block;width:100%;margin-top:16px;padding:12px;border:0;border-radius:8px;background:#8b3328;color:#fffaf0;font:bold 14px Arial,sans-serif;letter-spacing:.5px;cursor:pointer}
.oa-btn[disabled]{opacity:.6;cursor:wait}
.oa-btn.oa-ghost{background:#f1e6d3;color:#8b3328}
.oa-links{display:flex;justify-content:space-between;gap:10px;margin-top:12px;font-size:13px}
.oa-link{border:0;background:none;color:#8b3328;text-decoration:underline;cursor:pointer;padding:0;font-size:13px}
.oa-msg{margin-top:12px;font-size:13px;line-height:1.5;padding:9px 11px;border-radius:7px;display:none}
.oa-msg.err{display:block;background:#fbe9e6;color:#8b2a1f}
.oa-msg.ok{display:block;background:#e9f4e6;color:#2f5d26}
.oa-hint{font-size:12px;color:#8b7b6a;margin-top:6px;line-height:1.5}
.oa-steps{font-size:12px;color:#8b7b6a;margin:0 0 8px;letter-spacing:.5px}
.oa-badge{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:bold;color:#2f5d26}
.oa-card{margin:10px 0;padding:12px 13px;border-radius:10px;background:#f6efe2;border:1px solid #e3d5bd;font-family:Arial,sans-serif}
.oa-card-title{font-weight:bold;font-size:13px;letter-spacing:.5px;color:#8b3328;margin-bottom:6px}
.oa-card-text{font-size:13px;line-height:1.55;color:#4e4436;margin:0 0 8px}
.oa-card .oa-btn{margin-top:6px;padding:10px}
.oa-card-row{display:flex;gap:8px;flex-wrap:wrap}
.oa-card-row .oa-btn{flex:1;min-width:120px}
.oa-toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:2147483500;max-width:min(440px,calc(100% - 32px));background:#2c241b;color:#fffaf0;border-radius:12px;padding:14px 16px;box-shadow:0 10px 30px rgba(0,0,0,.35);font:14px/1.5 Arial,sans-serif}
.oa-toast .oa-btn{margin-top:10px;padding:10px}
.oa-toast-x{position:absolute;right:8px;top:4px;border:0;background:none;color:#d8ccb8;font-size:20px;cursor:pointer}
`;
function css(){ if(document.getElementById("oa-style")) return; const s=document.createElement("style"); s.id="oa-style"; s.textContent=CSS; (document.head||document.documentElement).appendChild(s); }
function el(tag,cls,text){ const e=document.createElement(tag); if(cls) e.className=cls; if(text!==undefined) e.textContent=text; return e; }
function input(label,type,value,ph){
    const wrap=el("div"); wrap.appendChild(el("label","oa-label",label));
    const f=el("div","oa-field"), i=el("input","oa-input"); i.type=type||"text"; i.value=value||""; if(ph) i.placeholder=ph;
    i.autocomplete=type==="password"?"current-password":"off"; f.appendChild(i);
    if(type==="password"){ const eye=el("button","oa-eye","👁"); eye.type="button"; eye.setAttribute("aria-label","Hiện mật khẩu"); eye.onclick=function(){ i.type=i.type==="password"?"text":"password"; }; f.appendChild(eye); }
    wrap.appendChild(f); wrap.input=i; return wrap;
}

let modal=null;
function closeModal(){ if(modal){ modal.remove(); modal=null; document.removeEventListener("keydown",onKey); } }
function onKey(e){ if(e.key==="Escape") closeModal(); }
function shell(title){
    css(); closeModal();
    const back=el("div","oa-back"), box=el("div","oa-box"), head=el("div","oa-head"), body=el("div","oa-body");
    box.setAttribute("role","dialog"); box.setAttribute("aria-modal","true");
    head.appendChild(el("h3","oa-title",title));
    const x=el("button","oa-x","×"); x.type="button"; x.setAttribute("aria-label","Đóng"); x.onclick=closeModal; head.appendChild(x);
    box.append(head,body); back.appendChild(box);
    back.addEventListener("click",function(e){ if(e.target===back) closeModal(); });
    document.body.appendChild(back); modal=back; document.addEventListener("keydown",onKey);
    const msg=el("div","oa-msg");
    return {body:body,msg:msg,
        say:function(text,ok){ msg.className="oa-msg "+(ok?"ok":"err"); msg.textContent=text; },
        hush:function(){ msg.className="oa-msg"; msg.textContent=""; }};
}
function busy(btn,on,text){ if(on){ btn.dataset.t=btn.textContent; btn.textContent=text||"ĐANG XỬ LÝ..."; btn.disabled=true; } else { btn.textContent=btn.dataset.t||btn.textContent; btn.disabled=false; } }
function onEnter(inputs,fn){ inputs.forEach(function(w){ w.input.addEventListener("keydown",function(e){ if(e.key==="Enter") fn(); }); }); }
function pwCheck(a,b){ if(a.length<6) return "Mật khẩu cần tối thiểu 6 ký tự."; if(a!==b) return "Hai lần nhập mật khẩu chưa giống nhau."; return ""; }

/* Đăng nhập */
function openLogin(opts){
    opts=opts||{};
    const s=shell("🔒 Đăng nhập tài khoản");
    s.body.appendChild(el("p","oa-text",opts.code?("Mã "+up(opts.code)+" đã được bảo mật. Vui lòng nhập mật khẩu để tiếp tục."):"Đăng nhập bằng mã học viên, mã thành viên hoặc email."));
    const id=input("Mã học viên / mã thành viên / email","text",opts.code||""), pw=input("Mật khẩu","password");
    const btn=el("button","oa-btn","ĐĂNG NHẬP"); btn.type="button";
    const links=el("div","oa-links"), forgot=el("button","oa-link","Quên mật khẩu?"), other=el("button","oa-link",opts.code?"Nhập mã khác":"Đóng");
    forgot.type=other.type="button"; links.append(forgot,other);
    s.body.append(id,pw,btn,links,s.msg);
    async function go(){
        s.hush(); if(!id.input.value.trim()||!pw.input.value){ s.say("Vui lòng nhập đủ mã (hoặc email) và mật khẩu."); return; }
        busy(btn,true,"ĐANG ĐĂNG NHẬP...");
        const r=await post("authLogin",{id:id.input.value.trim(),password:pw.input.value});
        busy(btn,false);
        if(!r.ok){ s.say(r.error||"Đăng nhập chưa thành công."); pw.input.select(); return; }
        saveSession(r); closeModal(); if(opts.onSuccess) opts.onSuccess(r.me);
    }
    btn.onclick=go; onEnter([id,pw],go);
    forgot.onclick=function(){ openForgot({id:id.input.value.trim(),onSuccess:opts.onSuccess}); };
    other.onclick=function(){ closeModal(); if(opts.onCancel) opts.onCancel(); };
    (opts.code?pw:id).input.focus();
}

/* Nâng cấp bảo mật: 2 bước */
function openUpgrade(opts){
    opts=opts||{}; const code=up(opts.code);
    const s=shell("🔒 Nâng cấp bảo mật");
    s.body.appendChild(el("div","oa-steps","BƯỚC 1/2 · XÁC MINH CHỦ TÀI KHOẢN"));
    s.body.appendChild(el("p","oa-text","Mã học viên "+code+". Nhập đúng số điện thoại và email bạn đã dùng khi đăng ký khoá học."));
    const ph=input("Số điện thoại đã đăng ký","tel"), em=input("Email đã đăng ký","email");
    const btn=el("button","oa-btn","XÁC MINH"); btn.type="button";
    s.body.append(ph,em,btn,s.msg);
    async function go(){
        s.hush(); if(!ph.input.value.trim()||!em.input.value.trim()){ s.say("Vui lòng nhập đủ số điện thoại và email."); return; }
        busy(btn,true,"ĐANG XÁC MINH...");
        const r=await post("authUpgradeStart",{code:code,phone:ph.input.value,email:em.input.value});
        busy(btn,false);
        if(!r.ok){ s.say(r.error||"Chưa xác minh được."); return; }
        step2(r.ticket,r.name);
    }
    btn.onclick=go; onEnter([ph,em],go); ph.input.focus();

    function step2(ticket,name){
        s.body.innerHTML=""; s.hush();
        s.body.appendChild(el("div","oa-steps","BƯỚC 2/2 · ĐẶT MẬT KHẨU"));
        s.body.appendChild(el("p","oa-text","Xin chào "+(name||code)+". Hãy đặt mật khẩu cho tài khoản "+code+"."));
        const p1=input("Mật khẩu mới","password"), p2=input("Nhập lại mật khẩu","password");
        p1.input.autocomplete=p2.input.autocomplete="new-password";
        s.body.append(p1,p2,el("div","oa-hint","Tối thiểu 6 ký tự. Không dùng mã học viên hay số điện thoại làm mật khẩu."));
        const b2=el("button","oa-btn","LƯU MẬT KHẨU"); b2.type="button"; s.body.append(b2,s.msg);
        async function save(){
            s.hush(); const bad=pwCheck(p1.input.value,p2.input.value); if(bad){ s.say(bad); return; }
            busy(b2,true,"ĐANG LƯU...");
            const r=await post("authUpgradeFinish",{ticket:ticket,password:p1.input.value});
            busy(b2,false);
            if(!r.ok){ s.say(r.error||"Chưa lưu được mật khẩu."); return; }
            saveSession(r); done();
        }
        b2.onclick=save; onEnter([p1,p2],save); p1.input.focus();
    }
    function done(){
        s.body.innerHTML="";
        s.body.appendChild(el("p","oa-text","✅ Tài khoản "+code+" đã được bảo mật. Từ nay người khác không thể tra cứu hồ sơ của bạn. Bạn đang đăng nhập trên thiết bị này (30 ngày)."));
        const b=el("button","oa-btn","HOÀN TẤT"); b.type="button"; b.onclick=function(){ closeModal(); if(opts.onSuccess) opts.onSuccess(me()); };
        s.body.appendChild(b);
    }
}

/* Quên mật khẩu */
function openForgot(opts){
    opts=opts||{};
    const s=shell("Quên mật khẩu");
    s.body.appendChild(el("p","oa-text","Nhập mã học viên, mã thành viên hoặc email. Minh Hồng sẽ gửi mã xác nhận 6 số tới email đã đăng ký của tài khoản."));
    const id=input("Mã / email","text",opts.id||""), btn=el("button","oa-btn","GỬI MÃ XÁC NHẬN"); btn.type="button";
    s.body.append(id,btn,s.msg);
    async function send(){
        s.hush(); if(!id.input.value.trim()){ s.say("Vui lòng nhập mã hoặc email."); return; }
        busy(btn,true,"ĐANG GỬI...");
        const r=await post("authForgot",{id:id.input.value.trim()});
        busy(btn,false);
        if(!r.ok){ s.say(r.error||"Chưa gửi được mã."); return; }
        if(!r.sentTo){ s.say("Không tìm thấy tài khoản đã bảo mật với thông tin này, hoặc tài khoản chưa có email. Vui lòng liên hệ giáo viên."); return; }
        step2(id.input.value.trim(),r.sentTo);
    }
    btn.onclick=send; onEnter([id],send); id.input.focus();
    function step2(idv,to){
        s.body.innerHTML=""; s.hush();
        s.body.appendChild(el("p","oa-text","Đã gửi mã xác nhận tới "+to+" (có hiệu lực 15 phút). Kiểm tra cả thư mục Spam/Quảng cáo."));
        const otp=input("Mã xác nhận 6 số","text","","______"), p1=input("Mật khẩu mới","password"), p2=input("Nhập lại mật khẩu","password");
        otp.input.inputMode="numeric"; p1.input.autocomplete=p2.input.autocomplete="new-password";
        const b=el("button","oa-btn","ĐẶT LẠI MẬT KHẨU"); b.type="button";
        s.body.append(otp,p1,p2,b,s.msg);
        async function reset(){
            s.hush(); const bad=pwCheck(p1.input.value,p2.input.value); if(bad){ s.say(bad); return; }
            busy(b,true,"ĐANG ĐẶT LẠI...");
            const r=await post("authReset",{id:idv,otp:otp.input.value.trim(),password:p1.input.value});
            busy(b,false);
            if(!r.ok){ s.say(r.error||"Chưa đặt lại được mật khẩu."); return; }
            saveSession(r); closeModal(); if(opts.onSuccess) opts.onSuccess(r.me);
        }
        b.onclick=reset; onEnter([otp,p1,p2],reset); otp.input.focus();
    }
}

/* Tài khoản: đổi mật khẩu, đăng xuất */
function openAccount(opts){
    opts=opts||{}; const m=me();
    if(!m){ openLogin(opts); return; }
    const s=shell("Tài khoản của bạn");
    s.body.appendChild(el("div","oa-badge","🔒 "+(m.name||"")+" · "+(m.linked||m.code)));
    s.body.appendChild(el("p","oa-hint","Email: "+(m.email||"–")+" · Đăng nhập trên thiết bị này đến "+new Date(session.expires).toLocaleDateString("vi-VN")));
    const change=el("button","oa-btn oa-ghost","ĐỔI MẬT KHẨU"), out=el("button","oa-btn","ĐĂNG XUẤT"), outAll=el("button","oa-btn oa-ghost","ĐĂNG XUẤT KHỎI MỌI THIẾT BỊ");
    [change,out,outAll].forEach(function(b){ b.type="button"; });
    s.body.append(change,out,outAll,s.msg);
    out.onclick=async function(){ busy(out,true); await post("authLogout",{token:token()}); dropSession(true); closeModal(); if(opts.onLogout) opts.onLogout(); };
    outAll.onclick=async function(){ if(!confirm("Đăng xuất tài khoản trên tất cả thiết bị?")) return; busy(outAll,true); await post("authLogout",{token:token(),all:true}); dropSession(true); closeModal(); if(opts.onLogout) opts.onLogout(); };
    change.onclick=function(){
        s.body.innerHTML=""; s.hush();
        const o=input("Mật khẩu hiện tại","password"), p1=input("Mật khẩu mới","password"), p2=input("Nhập lại mật khẩu mới","password");
        p1.input.autocomplete=p2.input.autocomplete="new-password";
        const b=el("button","oa-btn","LƯU MẬT KHẨU MỚI"); b.type="button";
        s.body.append(o,p1,p2,el("div","oa-hint","Sau khi đổi, các thiết bị khác sẽ phải đăng nhập lại."),b,s.msg);
        b.onclick=async function(){
            s.hush(); const bad=pwCheck(p1.input.value,p2.input.value); if(bad){ s.say(bad); return; }
            busy(b,true);
            const r=await post("authChangePw",{token:token(),oldPassword:o.input.value,password:p1.input.value});
            busy(b,false);
            if(!r.ok){ s.say(r.error||"Chưa đổi được mật khẩu."); return; }
            session.token=r.token; session.expires=r.expires; store(KEY,session);
            s.body.innerHTML=""; s.body.appendChild(el("p","oa-text","✅ Đã đổi mật khẩu."));
            const ok=el("button","oa-btn","ĐÓNG"); ok.type="button"; ok.onclick=closeModal; s.body.appendChild(ok);
        };
        o.input.focus();
    };
}

/* Thông báo khi tra cứu hồ sơ đã bảo mật */
let toast=null;
function lockedToast(code,onSuccess){
    css(); if(toast) toast.remove();
    toast=el("div","oa-toast"); toast.setAttribute("role","alert");
    const x=el("button","oa-toast-x","×"); x.type="button"; x.onclick=function(){ toast.remove(); toast=null; };
    toast.append(x,el("div","","🔒 Hồ sơ "+up(code)+" đã được chủ tài khoản bảo mật."));
    const b=el("button","oa-btn","ĐÂY LÀ TÔI – ĐĂNG NHẬP"); b.type="button";
    b.onclick=function(){ toast.remove(); toast=null; openLogin({code:code,onSuccess:onSuccess||function(){ location.reload(); }}); };
    toast.appendChild(b); document.body.appendChild(toast);
}

/* Đảm bảo được dùng mã (Minh Hồng gọi khi người dùng nhập mã) */
async function ensureAccess(code,opts){
    code=up(code); if(!code) return false;
    if(isMe(code)) return true;
    let st=null;
    try{ st=await post("authStatus",{code:code}); }catch(e){}
    if(!st || !st.ok) return !(await isProtected(code));
    if(!st.protected) return true;
    openLogin(Object.assign({},opts||{},{code:code}));
    return false;
}

/* Thẻ bảo mật cho khung Minh Hồng */
function securityCard(code,onChange){
    css(); code=up(code);
    const card=el("div","oa-card"); card.appendChild(el("div","oa-card-text","Đang kiểm tra bảo mật tài khoản…"));
    const refresh=function(){ if(onChange) onChange(); };
    (async function(){
        if(isMe(code)){
            const m=me(); card.innerHTML="";
            card.appendChild(el("div","oa-badge","🔒 "+(m.name||"")+" · Đã bảo mật"));
            const row=el("div","oa-card-row"), acc=el("button","oa-btn oa-ghost","TÀI KHOẢN"); acc.type="button";
            acc.onclick=function(){ openAccount({onLogout:refresh}); }; row.appendChild(acc); card.appendChild(row);
            return;
        }
        let st=null; try{ st=await post("authStatus",{code:code}); }catch(e){}
        card.innerHTML="";
        if(!st || !st.ok){ card.appendChild(el("div","oa-card-text","Chưa kiểm tra được trạng thái bảo mật. Vui lòng thử lại sau.")); return; }
        if(st.protected){
            card.appendChild(el("div","oa-card-title","🔒 MÃ ĐÃ ĐƯỢC BẢO MẬT"));
            card.appendChild(el("p","oa-card-text","Mã "+code+" đã được bảo mật. Đăng nhập để xem hồ sơ và sử dụng các chức năng học tập."));
            const b=el("button","oa-btn","ĐĂNG NHẬP"); b.type="button"; b.onclick=function(){ openLogin({code:code,onSuccess:refresh}); };
            card.appendChild(b); return;
        }
        card.appendChild(el("div","oa-card-title","🔒 BẢO MẬT TÀI KHOẢN"));
        card.appendChild(el("p","oa-card-text","Hiện ai biết mã "+code+" cũng xem được hồ sơ và dùng mã này trên các trang. Nâng cấp để chỉ bạn xem và dùng được."));
        const b=el("button","oa-btn","NÂNG CẤP BẢO MẬT"); b.type="button"; b.onclick=function(){ openUpgrade({code:code,onSuccess:refresh}); };
        card.appendChild(b);
    })();
    return card;
}

/* ---------------- Chặn tra cứu hồ sơ đã bảo mật ---------------- */
function bulkAllowed(options){
    if(options && (options.publicList||options.ocdAuthBulk)) return true;
    if(window.OCD_AUTH_PUBLIC_LIST===true) return true;
    return !!document.getElementById("rankingContent"); // Bảng xếp hạng hiển thị toàn bộ học viên
}
function lockedError(code){
    const e=new Error("🔒 Hồ sơ "+up(code)+" đã được chủ tài khoản bảo mật. Nếu đây là bạn, hãy đăng nhập tại icon Minh Hồng.");
    e.code="STUDENT_PROTECTED"; e.studentCode=up(code); return e;
}
function installGuard(RS){
    if(!RS || RS.__ocdAuthGuard || typeof RS.assertStudentActive!=="function") return;
    RS.__ocdAuthGuard=true;
    const original=RS.assertStudentActive.bind(RS);
    RS.assertStudentActive=async function(code,options){
        if(!bulkAllowed(options) && !(await canView(code))){
            lockedToast(code);
            emit("ocdProfileLocked",{code:up(code)});
            throw lockedError(code);
        }
        return original(code,options);
    };
    RS.auth=window.OCDAuth;
}

window.OCDAuth={
    version:"1.0.0",
    token:token, me:me, isMe:isMe, refreshMe:refreshMe,
    publicInfo:publicInfo, isProtected:isProtected, canView:canView, lookOf:lookOf,
    post:post, ensureAccess:ensureAccess, securityCard:securityCard, lockedToast:lockedToast,
    openLogin:openLogin, openUpgrade:openUpgrade, openForgot:openForgot, openAccount:openAccount, close:closeModal,
    logout:async function(all){ if(token()) await post("authLogout",{token:token(),all:!!all}); dropSession(true); },
    lockedError:lockedError
};
installGuard(RS0);
if(window.StudentRewardSystemReady && window.StudentRewardSystemReady.then){
    window.StudentRewardSystemReady.then(function(RS){ installGuard(RS||window.StudentRewardSystem); }).catch(function(){});
}
if(token()) setTimeout(refreshMe,1500);
})();
