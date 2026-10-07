/* =========================================================
   NGŨ GIÁC CHỈ SỐ v1.1.0 – Trang Tra cứu hồ sơ / Chợ phiên
   ---------------------------------------------------------
   - Dùng đúng danh sách bài nộp mà trang đã tải (analysis.works,
     đã loại bài bị xoá) -> không gọi thêm Sheet / Apps Script.
   - 5 chỉ số thang 10, tối thiểu 1:
       Học lực   : điểm TB mọi bài đã chấm
       Dụng bút  : điểm TB các bài có mô tả "Dụng bút"
       Thức thế  : điểm TB các bài có mô tả "Thức thế"
       Khoả thúc : điểm TB các bài có mô tả "Khoả thúc"
       Kiên trì  : chuỗi ngày nộp bài liên tiếp dài nhất trong 30 ngày gần nhất / 30 × 10
     Dưới 10 bài -> mặc định: Dụng bút / Thức thế / Khoả thúc = 3 (bài đúng mô tả đã chấm);
     Học lực = 1 (bài đã chấm); Kiên trì = 1 (tổng số bài).
   - Banner là nút: bấm để mở / đóng phần "Hồ sơ phân tích cá nhân" (.insight-shell).
   Trang gọi: OCDPentagon.loading(mã) / render(analysis) / fail() / hide().
========================================================= */
(function(){
"use strict";
if(window.OCDPentagon && window.OCDPentagon.version) return;

const CONFIG={
    version:"1.1.0",
    timeZone:"Asia/Ho_Chi_Minh",
    minWorks:10,          // dưới số bài này -> chỉ số = 1
    streakWindowDays:30,  // Kiên trì: xét 30 ngày gần nhất
    floor:1,
    skillDefault:3,       // v1.1.0: Dụng bút / Thức thế / Khoả thúc chưa đủ bài -> 3
    max:10,
    sectionId:"studentInsightSection",
    shellSelector:".insight-shell"
};

/* Thứ tự đỉnh: bắt đầu từ trên cùng, theo chiều kim đồng hồ */
const AXES=[
    {key:"hocLuc",   label:"Học lực"},
    {key:"dungBut",  label:"Dụng bút"},
    {key:"thucThe",  label:"Thức thế"},
    {key:"khoaThuc", label:"Khoả thúc"},
    {key:"kienTri",  label:"Kiên trì"}
];

/* Nhận diện mô tả bài (đã bỏ dấu, chữ thường) */
const MATCHERS={
    dungBut: [/dung\s*but/],
    thucThe: [/thuc\s*the/],
    khoaThuc:[/khoa\s*thuc/]
};

function clean(v){ return String(v===undefined||v===null?"":v).trim(); }
function plain(v){
    return clean(v).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/đ/g,"d").replace(/\s+/g," ");
}
function round1(n){ return Math.round(n*10)/10; }
function clamp(n){ return Math.max(CONFIG.floor,Math.min(CONFIG.max,n)); }
function mean(list){ return list.length?list.reduce(function(a,b){return a+b;},0)/list.length:0; }

function scoreOf(work){
    let n=NaN;
    const RS=window.StudentRewardSystem;
    try{
        if(RS && typeof RS.parseScore==="function") n=RS.parseScore(work && work.score);
    }catch(e){}
    if(!Number.isFinite(n)){
        const t=clean(work && work.score).replace(",",".");
        n=t===""?NaN:Number(t);
    }
    return (Number.isFinite(n) && n>=0 && n<=10) ? n : null;
}

function dayKey(ms){
    try{
        const s=new Intl.DateTimeFormat("en-CA",{timeZone:CONFIG.timeZone,year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(ms));
        const p=s.split("-").map(Number);
        return Math.floor(Date.UTC(p[0],p[1]-1,p[2])/86400000);
    }catch(e){
        const d=new Date(ms);
        return Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/86400000);
    }
}

/* Chuỗi ngày nộp bài liên tiếp dài nhất trong N ngày gần nhất (tính cả hôm nay) */
function streakInWindow(works,nowMs){
    const today=dayKey(nowMs);
    const from=today-CONFIG.streakWindowDays+1;
    const days=new Set();
    (works||[]).forEach(function(w){
        const t=Number(w && w.time);
        if(!Number.isFinite(t) || t<=0) return;
        const d=dayKey(t);
        if(d>=from && d<=today) days.add(d);
    });
    let best=0,run=0;
    for(let d=from;d<=today;d++){
        if(days.has(d)){ run++; if(run>best) best=run; } else run=0;
    }
    return best;
}

function compute(works,nowMs){
    works=Array.isArray(works)?works:[];
    nowMs=Number.isFinite(nowMs)?nowMs:Date.now();
    const graded=[];
    const byKey={dungBut:[],thucThe:[],khoaThuc:[]};
    works.forEach(function(w){
        const s=scoreOf(w);
        if(s===null) return;
        graded.push(s);
        const d=plain(w && (w.description||w.desc||""));
        if(!d) return;
        Object.keys(MATCHERS).forEach(function(k){
            if(MATCHERS[k].some(function(re){ return re.test(d); })) byKey[k].push(s);
        });
    });
    function avgOrDefault(list,fallback){
        return list.length>=CONFIG.minWorks ? clamp(round1(mean(list))) : fallback;
    }
    const streak=streakInWindow(works,nowMs);
    const values={
        hocLuc: avgOrDefault(graded,CONFIG.floor),
        dungBut: avgOrDefault(byKey.dungBut,CONFIG.skillDefault),
        thucThe: avgOrDefault(byKey.thucThe,CONFIG.skillDefault),
        khoaThuc: avgOrDefault(byKey.khoaThuc,CONFIG.skillDefault),
        kienTri: works.length>=CONFIG.minWorks ? clamp(round1(streak/CONFIG.streakWindowDays*10)) : CONFIG.floor
    };
    return {
        values:values,
        counts:{hocLuc:graded.length,dungBut:byKey.dungBut.length,thucThe:byKey.thucThe.length,khoaThuc:byKey.khoaThuc.length,kienTri:works.length},
        streak:streak
    };
}

/* ===================== GIAO DIỆN ===================== */
function injectStyle(){
    if(document.getElementById("ocdPentagonStyle110")) return;
    const st=document.createElement("style");
    st.id="ocdPentagonStyle110";
    st.textContent=`
#ocdPentagon{margin:0 0 14px}
.pg-card{display:block;width:100%;text-align:left;cursor:pointer;font:inherit;color:#332b26;background:linear-gradient(160deg,#fffdf8 0%,#fbf1e1 100%);border:1px solid #eadfce;border-radius:22px;box-shadow:0 10px 30px rgba(72,48,30,.10);padding:18px 18px 14px;-webkit-tap-highlight-color:transparent}
.pg-card:focus-visible{outline:3px solid #d28b32;outline-offset:3px}
.pg-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
.pg-kicker{font-size:11px;letter-spacing:.14em;font-weight:800;color:#a06a2c;text-transform:uppercase}
.pg-title{margin:4px 0 0;font:700 22px/1.2 Georgia,"Times New Roman",serif;color:#352b24}
.pg-total{flex:0 0 auto;text-align:right}
.pg-total b{display:block;font:800 26px/1 Georgia,serif;color:#9a3f2c}
.pg-total span{font-size:10px;color:#80756c}
.pg-body{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:14px;align-items:center;margin-top:8px}
.pg-svg{width:100%;height:auto;display:block;max-width:380px;margin:0 auto}
.pg-list{list-style:none;margin:0;padding:0;display:grid;gap:7px}
.pg-row{display:grid;grid-template-columns:76px 1fr 30px;align-items:center;gap:8px;font-size:12px}
.pg-row-name{font-weight:700;color:#4c3326}
.pg-bar{height:7px;border-radius:99px;background:#efe3cf;overflow:hidden}
.pg-bar i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#c4673f,#9a3f2c)}
.pg-row-val{text-align:right;font-weight:800;color:#9a3f2c}
.pg-row.is-low .pg-row-val{color:#a2958a}
.pg-hint{margin-top:12px;padding:10px 12px;border-radius:14px;background:rgba(210,139,50,.10);font-size:12px;line-height:1.55;color:#5c4a3d}
.pg-hint b{color:#352b24}
.pg-toggle{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:12px;padding:10px 12px;border-radius:12px;background:#352b24;color:#fffdf8;font-weight:700;font-size:13px}
.pg-toggle .pg-caret{display:inline-block;transition:transform .25s ease}
#ocdPentagon.is-open .pg-caret{transform:rotate(180deg)}
.pg-loading{padding:26px 0;text-align:center;font-size:13px;color:#80756c}
.pg-collapsed{display:none!important}
@media (max-width:640px){
  .pg-body{grid-template-columns:1fr}
  .pg-title{font-size:20px}
  .pg-svg{max-width:360px}
}
@media (prefers-reduced-motion:reduce){.pg-toggle .pg-caret{transition:none}}
`;
    document.head.appendChild(st);
}

const SVGNS="http://www.w3.org/2000/svg";
function svg(tag,attrs,text){
    const n=document.createElementNS(SVGNS,tag);
    Object.keys(attrs||{}).forEach(function(k){ n.setAttribute(k,attrs[k]); });
    if(text!==undefined) n.textContent=text;
    return n;
}
function point(i,r,cx,cy){
    const a=-Math.PI/2+i*2*Math.PI/AXES.length;
    return [cx+r*Math.cos(a), cy+r*Math.sin(a)];
}
function poly(r,cx,cy,valuesFn){
    return AXES.map(function(_,i){
        const p=point(i,valuesFn?valuesFn(i)*r:r,cx,cy);
        return p[0].toFixed(1)+","+p[1].toFixed(1);
    }).join(" ");
}

function drawPentagon(values){
    const W=380,H=304,cx=190,cy=160,R=100;
    const root=svg("svg",{viewBox:"0 0 "+W+" "+H,class:"pg-svg",role:"img",
        "aria-label":"Ngũ giác chỉ số: "+AXES.map(function(a){ return a.label+" "+values[a.key]; }).join(", ")+" (thang 10)"});
    /* nền ngũ giác + vòng thang 2-4-6-8-10 */
    root.appendChild(svg("polygon",{points:poly(R,cx,cy),fill:"#f6ead6",stroke:"#d9c3a0","stroke-width":"1.5"}));
    [0.8,0.6,0.4,0.2].forEach(function(k,j){
        root.appendChild(svg("polygon",{points:poly(R*k,cx,cy),fill:j%2?"#f6ead6":"#fbf3e6",stroke:"#e3d1b4","stroke-width":"1"}));
    });
    AXES.forEach(function(_,i){
        const p=point(i,R,cx,cy);
        root.appendChild(svg("line",{x1:cx,y1:cy,x2:p[0].toFixed(1),y2:p[1].toFixed(1),stroke:"#e3d1b4","stroke-width":"1"}));
    });
    [2,4,6,8,10].forEach(function(n){
        const p=point(0,R*n/10,cx,cy);
        root.appendChild(svg("text",{x:(p[0]+4).toFixed(1),y:(p[1]+3).toFixed(1),"font-size":"8",fill:"#b19f87","font-family":"Arial,sans-serif"},String(n)));
    });
    /* lớp chỉ số của học viên */
    const frac=function(i){ return values[AXES[i].key]/CONFIG.max; };
    root.appendChild(svg("polygon",{points:poly(R,cx,cy,frac),fill:"rgba(176,72,46,.30)",stroke:"#9a3f2c","stroke-width":"2.5","stroke-linejoin":"round"}));
    AXES.forEach(function(a,i){
        const p=point(i,R*frac(i),cx,cy);
        root.appendChild(svg("circle",{cx:p[0].toFixed(1),cy:p[1].toFixed(1),r:"4",fill:"#fffdf8",stroke:"#9a3f2c","stroke-width":"2"}));
    });
    /* nhãn đỉnh */
    AXES.forEach(function(a,i){
        const p=point(i,R+26,cx,cy);
        const anchor=Math.abs(p[0]-cx)<6?"middle":(p[0]<cx?"end":"start");
        const t=svg("text",{x:p[0].toFixed(1),y:(p[1]-2).toFixed(1),"text-anchor":anchor,"font-family":"Arial,sans-serif"});
        t.appendChild(svg("tspan",{"font-size":"12","font-weight":"700",fill:"#4c3326"},a.label));
        t.appendChild(svg("tspan",{x:p[0].toFixed(1),dy:"14","font-size":"12","font-weight":"800",fill:"#9a3f2c"},String(values[a.key])));
        root.appendChild(t);
    });
    return root;
}

let mount=null,shell=null,open=false,lastCode="";

/* v1.1.0: tên học viên lấy từ thẻ hồ sơ trang đã hiện (#studentProfileName); không có thì "bạn" */
function studentName(code){
    try{
        const n=clean((document.getElementById("studentProfileName")||{}).textContent);
        if(n && n!=="-" && n.toUpperCase()!==clean(code).toUpperCase()) return n;
    }catch(e){}
    return "bạn";
}

function ensureMount(){
    const section=document.getElementById(CONFIG.sectionId);
    if(!section) return null;
    shell=section.querySelector(CONFIG.shellSelector);
    if(!mount || !document.body.contains(mount)){
        injectStyle();
        mount=document.createElement("div");
        mount.id="ocdPentagon";
        if(shell && shell.parentNode) shell.parentNode.insertBefore(mount,shell);
        else section.insertBefore(mount,section.firstChild);
    }
    applyOpen();
    return mount;
}
function applyOpen(){
    if(mount) mount.classList.toggle("is-open",open);
    if(shell) shell.classList.toggle("pg-collapsed",!open);
    const btn=mount&&mount.querySelector(".pg-card");
    if(btn) btn.setAttribute("aria-expanded",open?"true":"false");
    const label=mount&&mount.querySelector(".pg-toggle-label");
    if(label) label.textContent=open?"Thu gọn hồ sơ phân tích":"Xem hồ sơ phân tích cá nhân";
}
function toggle(){
    open=!open;
    applyOpen();
    if(open && shell && shell.scrollIntoView){
        try{ shell.scrollIntoView({behavior:"smooth",block:"nearest"}); }catch(e){}
    }
}

function build(code,result){
    const m=ensureMount();
    if(!m) return;
    m.innerHTML="";
    const card=document.createElement("button");
    card.type="button";
    card.className="pg-card";
    card.setAttribute("aria-controls",CONFIG.sectionId);
    card.addEventListener("click",toggle);

    const head=document.createElement("div"); head.className="pg-head";
    const left=document.createElement("div");
    const k=document.createElement("div"); k.className="pg-kicker"; k.textContent="Ngũ giác chỉ số"+(code?" · "+code:"");
    const h=document.createElement("div"); h.className="pg-title"; h.textContent=result?"Năng lực của "+studentName(code):"Đang tính chỉ số...";
    left.appendChild(k); left.appendChild(h); head.appendChild(left);
    if(result){
        const total=document.createElement("div"); total.className="pg-total";
        const avg=round1(mean(AXES.map(function(a){ return result.values[a.key]; })));
        total.innerHTML="<b></b><span>trung bình / 10</span>";
        total.querySelector("b").textContent=String(avg);
        head.appendChild(total);
    }
    card.appendChild(head);

    if(result){
        const body=document.createElement("div"); body.className="pg-body";
        body.appendChild(drawPentagon(result.values));
        const list=document.createElement("ul"); list.className="pg-list";
        AXES.forEach(function(a){
            const v=result.values[a.key];
            const li=document.createElement("li");
            li.className="pg-row"+(result.counts[a.key]<CONFIG.minWorks?" is-low":"");
            const n=document.createElement("span"); n.className="pg-row-name"; n.textContent=a.label;
            const bar=document.createElement("span"); bar.className="pg-bar";
            const fill=document.createElement("i"); fill.style.width=(v/CONFIG.max*100).toFixed(0)+"%"; bar.appendChild(fill);
            const val=document.createElement("span"); val.className="pg-row-val"; val.textContent=String(v);
            li.title=a.key==="kienTri"
                ? "Chuỗi dài nhất trong 30 ngày: "+result.streak+" ngày"+(result.counts.kienTri<CONFIG.minWorks?" · cần ít nhất "+CONFIG.minWorks+" bài":"")
                : result.counts[a.key]+" bài đã chấm"+(result.counts[a.key]<CONFIG.minWorks?" · cần ít nhất "+CONFIG.minWorks+" bài":"");
            li.appendChild(n); li.appendChild(bar); li.appendChild(val);
            list.appendChild(li);
        });
        body.appendChild(list);
        card.appendChild(body);

        const hint=document.createElement("div"); hint.className="pg-hint";
        hint.innerHTML="<b>Tăng chỉ số:</b> khi nộp bài, ghi vào mô tả <b>“Dụng bút”</b>, <b>“Thức thế”</b> hay <b>“Khoả thúc”</b> để thầy chú ý chấm điểm phần đó. "+
            "<b>Học lực</b> và <b>Kiên trì</b> được tính tự động.";
        card.appendChild(hint);
    }else{
        const l=document.createElement("div"); l.className="pg-loading"; l.textContent="Đang đọc bài nộp của bạn...";
        card.appendChild(l);
    }

    const tg=document.createElement("div"); tg.className="pg-toggle";
    tg.innerHTML='<span class="pg-toggle-label"></span><span class="pg-caret" aria-hidden="true">▾</span>';
    card.appendChild(tg);
    m.appendChild(card);
    applyOpen();
}

function render(analysis){
    try{
        const code=clean(analysis&&analysis.code);
        if(code!==lastCode){ open=false; lastCode=code; }
        const result=compute(analysis&&analysis.works);
        build(code,result);
        return result;
    }catch(error){
        console.warn("[Ngũ giác chỉ số]",error);
        /* lỗi thì trả lại phần hồ sơ như cũ */
        if(shell) shell.classList.remove("pg-collapsed");
        if(mount) mount.innerHTML="";
        return null;
    }
}
function loading(code){
    try{
        code=clean(code);
        if(code!==lastCode){ open=false; lastCode=code; }
        build(code,null);
    }catch(e){}
}
/* Trang không tải được dữ liệu phân tích -> bỏ banner, mở lại phần hồ sơ để hiện thông báo lỗi như cũ */
function fail(){
    if(mount) mount.innerHTML="";
    if(shell) shell.classList.remove("pg-collapsed");
}
function hide(){
    if(mount) mount.innerHTML="";
    open=false;
    if(shell) shell.classList.add("pg-collapsed");
}

window.OCDPentagon={version:CONFIG.version,render:render,loading:loading,fail:fail,hide:hide,compute:compute,config:CONFIG};
})();
