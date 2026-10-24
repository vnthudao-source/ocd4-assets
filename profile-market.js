(function(){
 
"use strict";
 
/* =========================================================
   HỒ SƠ / CHỢ PHIÊN v4.11.2 (Trang trí: nhận vật phẩm trong túi dù tên lệch dấu/khoảng trắng, nút Tải lại túi đồ, phiên hết hạn -> mời đăng nhập) · v4.11.1 (Lịch sử: luôn thấy nút ✕ trên iPhone, bỏ tab Minh Hồng) · v4.10.0 (danh thiếp cho hồ sơ đã bảo mật; chủ tài khoản chọn avatar · khung · nền)
   v4.9.12: hiện ngay hồ sơ lưu lần trước; báo thành công ngay khi Apps Script đã ghi
   CORE CANONICAL ASSETS / MARKET SELF-RECOVERY
 
   GIỮ:
   - startWhenReady()
   - startApp()
   - bindEvents()
   - Lazy Market
   - Lazy Submission DOM
   - ADMIN thật
   - PhieuDoi thật
   - DEAL thật
   - XoaBai
   - Reward Core 4.2+
   - Core là nguồn sự thật duy nhất cho Linh Thạch / vật phẩm
 
   KIẾN TRÚC R3:
   - Core 4.2+ là nguồn sự thật duy nhất cho tài sản học viên
   - gems / ownedItems / transactions lấy từ Reward Profile
   - Minh Hồng / Quest / Event / Exam tương lai không cần vá trang này
   - Chợ phiên chỉ tạo + xác minh DEAL, sau đó refresh Core

   GIỮ RECOVERY:
   - Chợ phiên tự retry
   - Timeout từng request
   - Cache-busting khi retry
   - Kiểm tra Sheet rỗng
   - Không cần reload trang khi request đầu tiên lỗi
========================================================= */
 
 
/* =========================================================
   WAIT CORE
========================================================= */
 
let started=false;
let waitCount=0;
 
const MAX_WAIT=200;
 
 
function startWhenReady(){
 
    if(started){
        return true;
    }
 
    const RS=
        window.StudentRewardSystem;
 
    if(
        !RS ||
        !RS.version ||
        typeof RS.loadSharedRewardData !== "function" ||
        typeof RS.mapGiftRows !== "function" ||
        typeof RS.calculateStudentRewardData !== "function" ||
        typeof RS.processTransactions !== "function" ||
        typeof RS.getStudentRewardProfile !== "function"
    ){
 
        return false;
    }
 
    started=true;
 
    console.log(
        "[Profile Market v4.9.8] Reward Core:",
        RS.version
    );
 
    startApp(
        RS
    );
 
    return true;
}
 
 
window.addEventListener(
    "studentRewardCoreReady",
    startWhenReady
);
 
 
if(
    !startWhenReady()
){
 
    const timer=
        setInterval(
            function(){
 
                waitCount++;
 
                if(
                    startWhenReady()
                ){
 
                    clearInterval(
                        timer
                    );
 
                    return;
                }
 
                if(
                    waitCount >=
                    MAX_WAIT
                ){
 
                    clearInterval(
                        timer
                    );
 
                    const message=
                        document.getElementById(
                            "rxMessage"
                        );
 
                    if(message){
 
                        message.className=
                            "rx-message error";
 
                        message.textContent=
                            "Không tìm thấy Reward System Core 4.2 hoặc mới hơn.";
                    }
                }
 
            },
            50
        );
}
 
 
/* =========================================================
   APP
========================================================= */
 
function startApp(RS){
 
 
/* =========================================================
   CONFIG
========================================================= */
 
const CONFIG={
 
    npcGid:
        "1348051654",
 
    timeZone:
        "Asia/Ho_Chi_Minh",
 
    warningDays:
        21,
 
    minNpcPerDay:
        6,
 
    maxNpcPerDay:
        9,
 
    minGiftPerMerchant:
        1,
 
    maxGiftPerMerchant:
        3,
 
    maxSpecialGiftPerMerchant:
        4,
 
    minProfitDealsPerDay:
        0,
 
    maxProfitDealsPerDay:
        2,
 
    specialMerchants:[
        "gian thuong",
        "con no",
        "con nghien",
        "con bac"
    ],
 
    /* =====================================================
       STUDENT REGISTRY - HOCVIEN
       Nguồn định danh/kích hoạt học viên.
       Lịch sử bài nộp vẫn đọc từ RS.CONFIG.studentCsv.
    ===================================================== */
 
    studentRegistryCsv:
        "https://docs.google.com/spreadsheets/d/e/" +
        "2PACX-1vRP5cc8duj1XrCXMrymo6Cj7aqIkWfX6bHxGeW-lXcSewfQXhM8fZ5rzbNIQ9mBeVuB8yYr_o1aBoYA" +
        "/pub?gid=1603096683&single=true&output=csv",
 
    deleteLogCsv:
        "https://docs.google.com/spreadsheets/d/" +
        "1GJoTRsbq0kZfZrDdh0uCC667PwS3Bgkje2fHQnwnCKs" +
        "/export?format=csv&gid=521976322",
 
    googleFormPostUrl:
        "https://docs.google.com/forms/d/e/1FAIpQLScTonPyUi75I72iQ4kUH7x39audbHd89Jz6nwajrBO-ThRpjQ/formResponse",
 
    formEntryName:
        "entry.2085588567",
 
    formEntryStudentCode:
        "entry.1070505325",
 
    formEntryGiftName:
        "entry.1518235746",
 
    formEntryConfirm:
        "entry.946114472",
 
    adminCode:
        "ADMIN",
 
    adminName:
        "Admin Test",
 
    adminGroup:
        "ADMIN",
 
    adminCourse:
        "Tài khoản kiểm thử",
 
    adminHongNgoc:
        1000,
 
    verifyTries:
        12,
 
    verifyInterval:
        1500,
 
 
    /* =====================================================
       MARKET RECOVERY
    ===================================================== */
 
    marketRetryCount:
        4,
 
    marketRetryDelay:
        900,
 
    marketFetchTimeout:
        12000
 
};
 
 
/* =========================================================
   STATE
========================================================= */
 
const state={
 
    student:null,
 
    /* CSV bài nộp đã lọc XoaBai để Core tính đúng cùng Tra cứu. */
    submissionCsvText:"",
 
    /* Hồ sơ tài sản chuẩn cuối cùng do Core trả về. */
    assetProfile:null,
 
    submissions:[],
 
    deletedSubmissionCount:0,
 
    submissionsRendered:false,
 
    reward:null,
 
    gifts:[],
 
    giftMap:new Map(),
 
    transactions:[],
 
    rawTransactions:[],
 
    ownedItems:[],
 
    offers:[],
 
    selectedGift:null,
 
    activeProfilePanel:null,
 
    marketOpen:false,
 
    marketLoaded:false,
 
    marketLoading:false,
 
    marketPromise:null,
 
    submissionOpen:false,
 
    day:null,
 
    submitting:false,

    /* v4.9.11: đang đồng bộ túi đồ sau giao dịch ghi thẳng (chặn mua tiếp để không dùng số dư cũ) */
    exchangeSyncing:false,

    /* v4.9.12: đang hiển thị số liệu lưu từ lần trước (chưa có số liệu mới) -> chặn mua */
    assetsStale:false,
 
    isAdmin:false
};
 
 
const GEM_TYPES=
    RS.GEM_TYPES;
 
const GEM_ORDER=
    RS.GEM_ORDER;
 
const ICONS=
    RS.ICONS;
 
const ONE_DAY=
    RS.ONE_DAY;
 
const HONG_KEY=
    "hongNgoc";
 
 
/* =========================================================
   SAFE CHARACTERS
========================================================= */
 
const CHAR={
 
    multiply:
        String.fromCodePoint(
            0x00D7
        ),
 
    dash:
        String.fromCodePoint(
            0x2014
        ),
 
    dot:
        String.fromCodePoint(
            0x00B7
        )
};
 
 
function el(id){
 
    return document.getElementById(
        id
    );
}

/* =========================================================
   v4.11.0 – LỊCH SỬ PHIẾU ĐỔI - QUÀ TẶNG
   - Một nút trong hồ sơ: mở danh sách giao dịch theo ngày (mới nhất trên cùng)
   - Dữ liệu lấy từ hồ sơ Reward Core đã tính (không đọc thêm Sheet):
     phiếu đổi Chợ phiên, Hộp quà bí ẩn, túi linh thạch, quà / linh thạch GVCN,
     thưởng Nhiệm vụ · Linh Thú · Phòng Luyện Công, bán cho Minh Hồng, dùng vé PLC, số dư chốt sổ
   - Ưu tiên icon: bấm vào icon để xem tên
========================================================= */
const HX_CSS=`
.hx-open{position:fixed;inset:0;z-index:2147483000;background:rgba(28,20,14,.58);display:flex;align-items:flex-end;justify-content:center}
@media(min-width:700px){.hx-open{align-items:center}}
.hx-box{width:100%;max-width:560px;max-height:85vh;max-height:calc(100dvh - 20px);overflow:hidden;box-sizing:border-box;padding-bottom:env(safe-area-inset-bottom);background:#fffaf2;border-radius:18px 18px 0 0;display:flex;flex-direction:column;box-shadow:0 -10px 40px rgba(0,0,0,.25);font-family:Arial,Helvetica,sans-serif;color:#3a2c20}
@media(min-width:700px){.hx-box{border-radius:18px;max-height:86vh;max-height:calc(100dvh - 60px)}}
.hx-head,.hx-tabs,.hx-note{flex:none}
.hx-head{display:flex;align-items:center;gap:10px;padding:14px 14px 8px;border-bottom:1px solid #eadfcd}
.hx-title{flex:1;font:700 16px/1.3 Georgia,serif;color:#6b3f24}
.hx-x{flex:none;padding:0!important;line-height:34px!important;background:#f1e6d4;border-radius:50%;width:34px;height:34px;font-size:18px;cursor:pointer;color:#6b3f24}
.hx-tabs{display:flex;gap:6px;padding:8px 14px;border-bottom:1px solid #f0e6d6;overflow-x:auto}
.hx-tab{border:1px solid #e3d3b8;background:#fff;border-radius:999px;padding:6px 12px;font-size:18px;line-height:1;cursor:pointer;display:flex;align-items:center;gap:5px;flex:0 0 auto;white-space:nowrap;width:auto;min-width:0;margin:0;height:auto}
.hx-box .hx-tab{height:36px!important;min-height:36px!important;padding:0 12px!important;box-sizing:border-box;font-size:18px!important}
.hx-tab small{font-size:11px;white-space:nowrap;color:#8a7560}
.hx-tab.on{background:#6b3f24;border-color:#6b3f24}.hx-tab.on small{color:#f6e7cf}
.hx-list{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:4px 10px 18px;-webkit-overflow-scrolling:touch}
.hx-day{position:sticky;top:0;background:#fffaf2;font:700 12px/1 Arial;color:#9a7a55;padding:12px 4px 6px;z-index:1}
.hx-row{display:flex;align-items:center;gap:8px;padding:8px 6px;border-radius:12px;margin:2px 0}
.hx-row:nth-child(even){background:#fbf3e6}
.hx-row.bad{opacity:.55}
.hx-src{width:30px;height:30px;flex:none;display:flex;align-items:center;justify-content:center;font-size:18px;border-radius:9px;background:#f3e7d3}
.hx-main{flex:1;display:flex;flex-wrap:wrap;align-items:center;gap:4px 6px;min-width:0}
.hx-chip{position:relative;display:inline-flex;align-items:center;cursor:pointer}
.hx-chip img{width:34px;height:34px;object-fit:contain;border-radius:8px;background:#fff;border:1px solid #eadcc4}
.hx-chip b{position:absolute;right:-5px;bottom:-5px;min-width:17px;height:17px;padding:0 4px;border-radius:9px;background:#6b3f24;color:#fff;font:700 10px/17px Arial;text-align:center}
.hx-gem{display:inline-flex;align-items:center;gap:2px;font:700 13px/1 Arial;cursor:pointer;white-space:nowrap}
.hx-gem img{width:20px;height:20px;object-fit:contain}
.hx-gem.plus{color:#2f7a4c}.hx-gem.minus{color:#a2443a}
.hx-arrow{color:#b49a78;font-size:14px}
.hx-time{flex:none;font-size:11px;color:#a08a70;align-self:flex-start;padding-top:2px}
.hx-empty{padding:40px 10px;text-align:center;color:#9a8670;font-size:14px}
.hx-tip{position:fixed;z-index:2147483001;max-width:240px;background:#2d2118;color:#fff;font:13px/1.35 Arial;padding:7px 10px;border-radius:9px;pointer-events:none;box-shadow:0 6px 20px rgba(0,0,0,.25)}
.hx-note{padding:6px 14px 10px;font-size:11px;color:#9a8670}
`;
const HX_SRC={
    buy:["🛒","Phiếu đổi Chợ phiên"], box:["🎲","Hộp quà bí ẩn"], gift:["🎁","Quà GVCN"], quest:["📜","Thưởng nhiệm vụ"],
    beast:["🐉","Thưởng Linh Thú"], plc:["🏯","Phòng Luyện Công"], sell:["💱","Bán cho Minh Hồng"], ticket:["🎟️","Dùng vé Phòng Luyện Công"],
    refund:["↩️","Hoàn vé Phòng Luyện Công"], snap:["📦","Số dư chốt sổ"], bad:["⛔","Phiếu không hợp lệ (không tính)"]
};
const HX_TABS=[["all","📋","Tất cả"],["buy","🛒","Đổi quà"],["gift","🎁","Quà tặng"]];
function hxEsc(v){ return String(v==null?"":v).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]; }); }
function hxTime(ts){ try{ const d=RS.parseVietnameseDate(ts); return d&&isFinite(d.getTime())?d.getTime():0; }catch(e){ return 0; } }
function hxGemKey(v){ if(GEM_TYPES[v]) return v; try{ return typeof RS.normalizeGemType==="function"?RS.normalizeGemType(v):""; }catch(e){ return ""; } }
function hxItem(name,qty){
    const src=giftImageByName(name,160)||"";
    const tip=name+(qty>1?" ×"+qty:"");
    return '<span class="hx-chip" data-tip="'+hxEsc(tip)+'">'+(src?'<img src="'+hxEsc(src)+'" alt="'+hxEsc(name)+'" loading="lazy">':'<span style="font-size:22px">🎁</span>')+(qty>1?'<b>'+qty+'</b>':'')+'</span>';
}
function hxGem(key,amount,sign){
    key=hxGemKey(key); if(!key||!amount) return "";
    const g=GEM_TYPES[key], n=RS.formatNumber?RS.formatNumber(amount):amount;
    return '<span class="hx-gem '+(sign<0?"minus":"plus")+'" data-tip="'+(sign<0?"−":"+")+hxEsc(n+" "+g.displayName)+'">'+(sign<0?"−":"+")+hxEsc(n)+'<img src="'+hxEsc(RS.convertDriveImageUrl(g.image,64))+'" alt="'+hxEsc(g.displayName)+'"></span>';
}
const HX_ARROW='<span class="hx-arrow">➜</span>';
function hxSourceOf(reason,giver){
    const r=String(reason||""), g=String(giver||"");
    if(/^BEAST:/i.test(r)) return "beast";
    if(/PLC-REFUND|Hoàn vé Phòng Luyện Công/i.test(r)) return "refund";
    if(/Phòng Luyện Công|PLC\|/i.test(r)||/Phòng Luyện Công/i.test(g)) return "plc";
    if(/^QUEST:/i.test(r)||/Minh Hồng/i.test(g)) return "quest";
    return "gift";
}
function hxReasonText(reason){
    const r=String(reason||"").trim(); if(!r) return "";
    if(/^QUEST:/i.test(r)) return "Nhiệm vụ "+r.slice(6);
    if(/^BEAST:/i.test(r)){ const m=r.match(/RANK(\d+)/i); return "Linh Thú"+(m?" · hạng "+m[1]:""); }
    return r.split("·")[0].replace(/\s*PLC[-|].*$/,"").trim()||r;
}
/* Gom dữ liệu hồ sơ thành các dòng lịch sử */
function buildHistoryEntries(p){
    const out=[];
    if(!p) return out;
    const valid=Array.isArray(p.validTransactions)?p.validTransactions:(p.transactions||[]);
    /* số dư chốt sổ: 1 dòng */
    if(p.snapshot){
        const s=p.snapshot, gems=[], items={};
        Object.keys(s.gems||{}).forEach(function(k){ if(Number(s.gems[k])>0) gems.push([k,Number(s.gems[k])]); });
        (p.teacherOwnedItems||[]).forEach(function(it){ if(it&&it.fromSnapshot){ items[it.giftName]=(items[it.giftName]||0)+Math.max(1,Number(it.quantity)||1); } });
        out.push({t:Number(s.cutMs)||hxTime(s.cutText), kind:"snap", tab:"gift", gems:gems, items:items, tip:"Số dư chốt sổ "+String(s.cutText||"").split(" ")[0]});
    }
    valid.forEach(function(tx){
        if(!tx||tx.isSnapshot) return;
        const t=hxTime(tx.timestamp);
        if(tx.transactionType==="redemption"){
            const g=tx.grantedGemReward;
            if(tx.isMysteryBox){
                out.push({t:t,kind:"box",tab:"buy",name:tx.giftName,cost:[[tx.gemType,Number(tx.price)||0]],reward:tx.mysteryRewardName||"",gem:g?[g.gemType,Number(g.amount)||0]:null});
            }else{
                out.push({t:t,kind:"buy",tab:"buy",name:tx.giftName,cost:[[tx.gemType,Number(tx.price)||0]],gem:g?[g.gemType,Number(g.amount)||0]:null});
            }
            return;
        }
        if(tx.transactionType==="teacher-gem" && !tx.isMinhHongSale){
            const src=hxSourceOf(tx.reason,tx.giver);
            out.push({t:t,kind:src,tab:"gift",gems:[[tx.rewardGemType,Number(tx.rewardGemAmount)||0]],tip:hxReasonText(tx.reason)||HX_SRC[src][1]});
        }
    });
    (p.teacherOwnedItems||[]).forEach(function(it){
        if(!it||it.fromSnapshot) return;
        const src=hxSourceOf(it.reason,it.giver), items={}; items[it.giftName]=Math.max(1,Number(it.quantity)||1);
        out.push({t:hxTime(it.timestamp),kind:src,tab:"gift",items:items,tip:hxReasonText(it.reason)||HX_SRC[src][1]});
    });
    ((p.minhHong&&p.minhHong.sales)||[]).forEach(function(s){
        const plc=/^PLC-/i.test(String(s.sellId||""));
        out.push({t:hxTime(s.timestamp),kind:plc?"ticket":"sell",tab:plc?"buy":"sell",name:s.giftName,qty:Math.max(1,Number(s.quantity)||1),gems:[[s.rewardGemType,Number(s.rewardGemAmount)||0]]});
    });
    (p.rejectedTransactions||[]).forEach(function(tx){
        if(!tx||tx.transactionType!=="redemption") return;
        out.push({t:hxTime(tx.timestamp),kind:"bad",tab:"buy",name:tx.giftName,cost:[[tx.gemType,Number(tx.price)||0]],tip:tx.rejectionReason==="insufficient-balance"?"Không đủ linh thạch lúc đổi – phiếu không được tính":tx.rejectionReason==="duplicate-deal"?"Phiếu gửi trùng – chỉ tính 1 lần":"Phiếu không hợp lệ – không được tính"});
    });
    out.sort(function(a,b){ return b.t-a.t; });
    /* gom các Hộp quà bí ẩn mua liền nhau trong cùng ngày */
    const merged=[];
    out.forEach(function(e){
        const last=merged[merged.length-1];
        if(e.kind==="box"&&last&&last.kind==="box"&&hxDay(last.t)===hxDay(e.t)){
            last.n++; last.cost[0][1]+=e.cost[0][1];
            if(e.gem&&e.gem[1]){ const k=hxGemKey(e.gem[0]); last.gemSum[k]=(last.gemSum[k]||0)+e.gem[1]; }
            else if(e.reward){ last.got[e.reward]=(last.got[e.reward]||0)+1; }
            last.tMin=Math.min(last.tMin,e.t);
            return;
        }
        if(e.kind==="box"){
            const x={t:e.t,tMin:e.t,kind:"box",tab:"buy",name:e.name,n:1,cost:[[e.cost[0][0],e.cost[0][1]]],got:{},gemSum:{}};
            if(e.gem&&e.gem[1]){ x.gemSum[hxGemKey(e.gem[0])]=e.gem[1]; } else if(e.reward){ x.got[e.reward]=1; }
            merged.push(x); return;
        }
        merged.push(e);
    });
    return merged;
}
function hxDay(t){ if(!t) return "—"; try{ return new Intl.DateTimeFormat("vi-VN",{timeZone:"Asia/Ho_Chi_Minh",day:"2-digit",month:"2-digit",year:"numeric"}).format(new Date(t)); }catch(e){ return "—"; } }
function hxClock(t){ if(!t) return ""; try{ return new Intl.DateTimeFormat("vi-VN",{timeZone:"Asia/Ho_Chi_Minh",hour:"2-digit",minute:"2-digit"}).format(new Date(t)); }catch(e){ return ""; } }
function hxRowHtml(e){
    const src=HX_SRC[e.kind]||HX_SRC.gift;
    let main="";
    if(e.kind==="buy"||e.kind==="bad"){
        main=hxItem(e.name,1)+(e.cost||[]).map(function(c){ return hxGem(c[0],c[1],-1); }).join("")+(e.gem&&e.gem[1]?HX_ARROW+hxGem(e.gem[0],e.gem[1],1):"");
    }else if(e.kind==="box"){
        const got=Object.keys(e.got).map(function(n){ return hxItem(n,e.got[n]); }).join("")+Object.keys(e.gemSum).map(function(k){ return hxGem(k,e.gemSum[k],1); }).join("");
        main=hxItem(e.name,e.n)+(e.cost||[]).map(function(c){ return hxGem(c[0],c[1],-1); }).join("")+HX_ARROW+got;
    }else if(e.kind==="sell"||e.kind==="ticket"){
        main=hxItem(e.name,e.qty)+HX_ARROW+(e.gems||[]).map(function(g){ return hxGem(g[0],g[1],1); }).join("");
    }else{
        main=Object.keys(e.items||{}).map(function(n){ return hxItem(n,e.items[n]); }).join("")+(e.gems||[]).map(function(g){ return hxGem(g[0],g[1],1); }).join("");
    }
    const tip=e.tip?src[1]+" · "+e.tip:src[1];
    return '<div class="hx-row'+(e.kind==="bad"?" bad":"")+'"><span class="hx-src" data-tip="'+hxEsc(tip)+'">'+src[0]+'</span><div class="hx-main">'+main+'</div><span class="hx-time">'+hxClock(e.kind==="box"?e.tMin:e.t)+'</span></div>';
}
function hxRender(box,entries,tab){
    const list=box.querySelector(".hx-list");
    const rows=entries.filter(function(e){ return tab==="all"||e.tab===tab; });
    if(!rows.length){ list.innerHTML='<div class="hx-empty">📭</div>'; return; }
    let html="", day="";
    rows.forEach(function(e){ const d=e.kind==="snap"?"📦 "+hxDay(e.t):hxDay(e.t); if(d!==day){ day=d; html+='<div class="hx-day">'+hxEsc(d)+'</div>'; } html+=hxRowHtml(e); });
    list.innerHTML=html;
    list.scrollTop=0;
}
function hxShowTip(target){
    document.querySelectorAll(".hx-tip").forEach(function(x){ x.remove(); });
    const text=target.getAttribute("data-tip"); if(!text) return;
    const tip=document.createElement("div"); tip.className="hx-tip"; tip.textContent=text; document.body.appendChild(tip);
    const r=target.getBoundingClientRect(), w=tip.offsetWidth, h=tip.offsetHeight;
    tip.style.left=Math.max(8,Math.min(window.innerWidth-w-8,r.left+r.width/2-w/2))+"px";
    tip.style.top=(r.top-h-8<8?r.bottom+8:r.top-h-8)+"px";
    clearTimeout(hxShowTip.timer); hxShowTip.timer=setTimeout(function(){ tip.remove(); },2200);
}
async function openHistory(){
    if(!state.student) return;
    if(!document.getElementById("hxStyle")){ const st=document.createElement("style"); st.id="hxStyle"; st.textContent=HX_CSS; (document.head||document.documentElement).appendChild(st); }
    const code=RS.normalizeCode(state.student.code);
    const wrap=document.createElement("div"); wrap.className="hx-open"; wrap.setAttribute("role","dialog"); wrap.setAttribute("aria-label","Lịch sử Phiếu đổi - Quà tặng");
    wrap.innerHTML='<div class="hx-box"><div class="hx-head"><div class="hx-title">📜 Lịch sử Phiếu đổi - Quà tặng<br><small style="font:12px Arial;color:#9a8670">'+hxEsc((state.student.name||"")+" · "+code)+'</small></div><button class="hx-x" type="button" aria-label="Đóng">✕</button></div><div class="hx-tabs">'+
        HX_TABS.map(function(t,i){ return '<button class="hx-tab'+(i?"":" on")+'" type="button" data-tab="'+t[0]+'" aria-label="'+hxEsc(t[2])+'">'+t[1]+'<small>'+hxEsc(t[2])+'</small></button>'; }).join("")+
        '</div><div class="hx-list"><div class="hx-empty">⏳</div></div><div class="hx-note">Bấm vào biểu tượng để xem tên · ⛔ phiếu không được tính · 📦 số dư lúc chốt sổ</div></div>';
    document.body.appendChild(wrap);
    /* iPhone: 100vh cao hơn vùng nhìn thấy (thanh địa chỉ) -> giới hạn theo chiều cao thật để luôn thấy nút ✕ */
    const hxBox=wrap.querySelector(".hx-box");
    const fit=function(){ const vv=window.visualViewport; const h=Math.round(vv?vv.height:window.innerHeight)||0; if(h>0) hxBox.style.maxHeight=Math.max(240,h-(window.innerWidth>=700?60:16))+"px"; };
    fit(); window.addEventListener("resize",fit); if(window.visualViewport) window.visualViewport.addEventListener("resize",fit);
    const prevOverflow=document.body.style.overflow; document.body.style.overflow="hidden";
    const close=function(){ window.removeEventListener("resize",fit); if(window.visualViewport) window.visualViewport.removeEventListener("resize",fit); wrap.remove(); document.body.style.overflow=prevOverflow; document.querySelectorAll(".hx-tip").forEach(function(x){ x.remove(); }); document.removeEventListener("keydown",onKey); };
    const onKey=function(ev){ if(ev.key==="Escape") close(); };
    document.addEventListener("keydown",onKey);
    wrap.addEventListener("click",function(ev){
        if(ev.target===wrap||ev.target.closest(".hx-x")){ close(); return; }
        const tabBtn=ev.target.closest(".hx-tab");
        if(tabBtn){ wrap.querySelectorAll(".hx-tab").forEach(function(b){ b.classList.toggle("on",b===tabBtn); }); hxRender(wrap,wrap._entries||[],tabBtn.dataset.tab); return; }
        const tipEl=ev.target.closest("[data-tip]"); if(tipEl) hxShowTip(tipEl);
    });
    let profile=state.assetProfile&&RS.normalizeCode(state.assetProfile.code||"")===code?state.assetProfile:null;
    try{ if(!profile) profile=await loadCanonicalStudentProfile(code,false); }
    catch(err){ wrap.querySelector(".hx-list").innerHTML='<div class="hx-empty">⚠️ '+hxEsc(err&&err.message||err)+'</div>'; return; }
    if(!wrap.isConnected) return;
    wrap._entries=buildHistoryEntries(profile);
    const on=wrap.querySelector(".hx-tab.on");
    hxRender(wrap,wrap._entries,on?on.dataset.tab:"all");
}
function ensureHistoryButton(){
    const bar=document.querySelector("#studentProfileModule .student-profile-actions");
    if(!bar||document.getElementById("profileHistoryButton")) return;
    const b=document.createElement("button");
    b.className="student-profile-action"; b.id="profileHistoryButton"; b.type="button";
    b.innerHTML='<span aria-hidden="true">📜</span><span>Lịch sử Phiếu đổi - Quà tặng</span>';
    b.addEventListener("click",function(){ openHistory().catch(function(e){ console.warn("[Lịch sử]",e); }); });
    bar.appendChild(b);
}
 
 
/* =========================================================
   UI
========================================================= */
 
const UI={
 
    chart:
        String.fromCodePoint(
            0x1F4CA
        ),
 
    gem:
        String.fromCodePoint(
            0x1F48E
        ),
 
    gift:
        String.fromCodePoint(
            0x1F381
        ),
 
    lantern:
        String.fromCodePoint(
            0x1F3EE
        ),
 
    book:
        String.fromCodePoint(
            0x1F4DA
        ),
 
    mystery:
        String.fromCodePoint(
            0x1F4E6
        ),
 
    sale:
        String.fromCodePoint(
            0x1F3F7
        ),
 
    admin:
        String.fromCodePoint(
            0x1F6E1
        )
};
 
 
el("profileLearningIcon").textContent=
    UI.chart;
 
el("profileGemIcon").textContent=
    UI.gem;
 
el("profileItemIcon").textContent=
    UI.gift;
 
el("marketToggleIcon").textContent=
    UI.lantern;
 
el("submissionBookIcon").textContent=
    UI.book;
 
 
/* =========================================================
   UTILITY
========================================================= */
 
function sleep(ms){
 
    return new Promise(
        function(resolve){
 
            setTimeout(
                resolve,
                ms
            );
        }
    );
}
 
 
function clean(value){
 
    return String(
        value === undefined ||
        value === null
        ?
        ""
        :
        value
    ).trim();
}
 
 
/* =========================================================
   CSV FOR CANONICAL CORE PROFILE
========================================================= */

function csvEscapeCell(value){

    const text=String(
        value === undefined || value === null
        ? ""
        : value
    );

    return /[",\r\n]/.test(text)
        ? '"'+text.replace(/"/g,'""')+'"'
        : text;
}


function rowsToCsv(rows){

    return (rows || [])
    .map(function(row){

        return (row || [])
        .map(csvEscapeCell)
        .join(",");
    })
    .join("\r\n");
}


function normalizeLocal(value){
 
    return clean(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(
        /[\u0300-\u036f]/g,
        ""
    )
    .replace(
        /đ/g,
        "d"
    )
    .replace(
        /\s+/g,
        " "
    );
}
 
 
function hashText(text){
 
    let hash=
        2166136261;
 
    text=
        String(
            text || ""
        );
 
    for(
        let i=0;
        i<text.length;
        i++
    ){
 
        hash ^=
            text.charCodeAt(i);
 
        hash=
            Math.imul(
                hash,
                16777619
            );
    }
 
    return hash >>> 0;
}
 
 
function seededRandom(seed){
 
    return function(){
 
        seed |= 0;
 
        seed=
            seed+
            0x6D2B79F5
            |0;
 
        let t=
            Math.imul(
                seed ^ seed>>>15,
                1|seed
            );
 
        t=
            t+
            Math.imul(
                t ^ t>>>7,
                61|t
            )
            ^t;
 
        return(
            (t ^ t>>>14) >>> 0
        )
        /
        4294967296;
    };
}
 
 
function seededShuffle(
    array,
    seed
){
 
    const result=
        array.slice();
 
    const random=
        seededRandom(
            seed
        );
 
    for(
        let i=result.length-1;
        i>0;
        i--
    ){
 
        const j=
            Math.floor(
                random()*
                (i+1)
            );
 
        [
            result[i],
            result[j]
        ]=[
            result[j],
            result[i]
        ];
    }
 
    return result;
}
 
 
/* =========================================================
   TIMEOUT WRAPPER
========================================================= */
 
function withTimeout(
    promise,
    timeout,
    label
){
 
    return Promise.race([
 
        promise,
 
        new Promise(
            function(
                resolve,
                reject
            ){
 
                setTimeout(
                    function(){
 
                        reject(
                            new Error(
                                label+
                                " phản hồi quá chậm."
                            )
                        );
 
                    },
                    timeout
                );
            }
        )
 
    ]);
}
 
 
/* =========================================================
   CACHE BUSTER
========================================================= */
 
function addCacheBuster(
    url,
    attempt
){
 
    const separator=
        String(url)
        .includes("?")
        ?
        "&"
        :
        "?";
 
    return(
        url+
        separator+
        "_rxm="+
        Date.now()+
        "_"+
        attempt+
        "_"+
        Math.random()
        .toString(36)
        .slice(
            2,
            7
        )
    );
}
 
 
/* =========================================================
   XOÁ BÀI
========================================================= */
 
function driveIdForSubmission(url){
 
    const value=
        String(
            url || ""
        );
 
    const patterns=[
 
        /\/file\/d\/([^/?&#]+)/i,
 
        /\/d\/([^/?&#]+)/i,
 
        /[?&]id=([^&#]+)/i
    ];
 
    for(
        const pattern
        of patterns
    ){
 
        const match=
            value.match(
                pattern
            );
 
        if(match){
 
            return match[1];
        }
    }
 
    return "";
}
 
 
function compactSubmissionTimestamp(value){
 
    const match=
        String(
            value || ""
        )
        .match(
            /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})[\s,]+(\d{1,2}):(\d{2})(?::(\d{2}))?/
        );
 
    if(!match){
 
        return "";
    }
 
    function pad(number){
 
        return String(
            number
        )
        .padStart(
            2,
            "0"
        );
    }
 
    return(
        match[3]+
        pad(match[2])+
        pad(match[1])+
        pad(match[4])+
        pad(match[5])+
        pad(match[6] || 0)
    );
}
 
 
function buildSubmissionId(
    timestamp,
    studentCode,
    file
){
 
    return(
 
        compactSubmissionTimestamp(
            timestamp
        )
 
        +
 
        "|"
 
        +
 
        clean(
            studentCode
        )
 
        +
 
        "|"
 
        +
 
        (
            driveIdForSubmission(
                file
            )
 
            ||
 
            clean(
                file
            )
        )
    );
}
 
 
function detectDeleteLogColumns(rows){
 
    if(
        !rows ||
        !rows.length
    ){
 
        return{
            submissionId:-1,
            action:-1
        };
    }
 
    const headers=
        rows[0]
        .map(
            RS.normalizeText
        );
 
    return{
 
        submissionId:
            RS.findColumn(
                headers,
                [
                    "mã bài nộp",
                    "ma bai nop",
                    "submission id",
                    "submissionid"
                ]
            ),
 
        action:
            RS.findColumn(
                headers,
                [
                    "hành động",
                    "hanh dong",
                    "action"
                ]
            )
    };
}
 
 
function buildDeletedSubmissionIds(rows){
 
    const result=
        new Set();
 
    if(
        !rows ||
        rows.length < 2
    ){
 
        return result;
    }
 
    const columns=
        detectDeleteLogColumns(
            rows
        );
 
    if(
        columns.submissionId < 0
    ){
 
        return result;
    }
 
    const states=
        new Map();
 
    for(
        let i=1;
        i<rows.length;
        i++
    ){
 
        const row=
            rows[i];
 
        const id=
            clean(
                row[
                    columns.submissionId
                ]
            );
 
        if(!id){
            continue;
        }
 
        const action=
            columns.action >= 0
            ?
            normalizeLocal(
                row[
                    columns.action
                ]
            )
            :
            "xoa";
 
        if(
            action.includes(
                "khoi phuc"
            )
            ||
            action === "restore"
        ){
 
            states.set(
                id,
                false
            );
 
            continue;
        }
 
        if(
            !action
            ||
            action === "xoa"
            ||
            action.includes(
                "xoa"
            )
            ||
            action === "delete"
        ){
 
            states.set(
                id,
                true
            );
        }
    }
 
    states.forEach(
        function(
            isDeleted,
            id
        ){
 
            if(isDeleted){
 
                result.add(
                    id
                );
            }
        }
    );
 
    return result;
}
 
 
async function loadDeletedSubmissionIds(){
 
    try{
 
        const text=
            await RS.fetchCSV(
                CONFIG.deleteLogCsv
            );
 
        return buildDeletedSubmissionIds(
            RS.parseCSV(
                text
            )
        );
 
    }catch(error){
 
        console.warn(
            "[Profile] Không tải được XoaBai:",
            error
        );
 
        return new Set();
    }
}
 
 
/* =========================================================
   EMPTY REWARD
========================================================= */
 
function createEmptyGemsSafe(){
 
    if(
        typeof RS.createEmptyGems ===
        "function"
    ){
 
        return RS.createEmptyGems();
    }
 
    const gems={};
 
    GEM_ORDER.forEach(
        function(key){
 
            gems[key]=0;
        }
    );
 
    return gems;
}
 
 
function createEmptyStudentReward(){
 
    return{
 
        gems:
            createEmptyGemsSafe(),
 
        longestStreak:0,
 
        bestHighRun:0,
 
        streakGift:null,
 
        highScoreGift:null
    };
}
 
 
function calculateStudentRewardSafe(
    submissions
){
 
    if(
        !submissions ||
        !submissions.length
    ){
 
        return createEmptyStudentReward();
    }
 
    return RS.calculateStudentRewardData(
        submissions
    );
}
 
 
/* =========================================================
   DEAL
========================================================= */
 
function createPurchaseDealId(){
 
    const student=
        state.student
        ?
        RS.normalizeCode(
            state.student.code
        )
        :
        "UNKNOWN";
 
    const raw=
        "buy-"+
        student+
        "-"+
        Date.now()
        .toString(36)+
        "-"+
        Math.random()
        .toString(36)
        .slice(
            2,
            9
        );
 
    if(
        typeof RS.sanitizeDealId ===
        "function"
    ){
 
        return RS.sanitizeDealId(
            raw
        );
    }
 
    return raw;
}
 
 
/* =========================================================
   DATE
========================================================= */
 
function getVietnamDate(){
 
    const parts=
        new Intl.DateTimeFormat(
            "en-CA",
            {
                timeZone:
                    CONFIG.timeZone,
 
                year:"numeric",
                month:"2-digit",
                day:"2-digit"
            }
        )
        .formatToParts(
            new Date()
        );
 
    const values={};
 
    parts.forEach(
        function(part){
 
            values[
                part.type
            ]=
                part.value;
        }
    );
 
    return{
 
        key:
            values.year+
            "-"+
            values.month+
            "-"+
            values.day,
 
        label:
            values.day+
            "/"+
            values.month+
            "/"+
            values.year
    };
}
 
 
/* =========================================================
   GEM IMAGE
========================================================= */
 
function createGemImage(
    key,
    className
){
 
    key=
        GEM_TYPES[key]
        ?
        key
        :
        HONG_KEY;
 
    const img=
        document.createElement(
            "img"
        );
 
    img.className=
        className ||
        "";
 
    img.src=
        RS.convertDriveImageUrl(
            GEM_TYPES[key].image,
            96
        );
 
    img.alt=
        GEM_TYPES[key]
        .displayName;
 
    img.loading=
        "lazy";
 
    img.decoding=
        "async";
 
    return img;
}
 
 
/* =========================================================
   RARITY
========================================================= */
 
function getItemRarityInfo(item){
 
    if(!item){
        return null;
    }
 
    if(
        item.rarityInfo &&
        item.rarityInfo.gemType
    ){
 
        return item.rarityInfo;
    }
 
    if(
        item.rarity &&
        typeof RS.getRarityInfo ===
        "function"
    ){
 
        const info=
            RS.getRarityInfo(
                item.rarity
            );
 
        if(info){
            return info;
        }
    }
 
    if(
        item.rawRarity &&
        typeof RS.getRarityInfo ===
        "function"
    ){
 
        const info=
            RS.getRarityInfo(
                item.rawRarity
            );
 
        if(info){
            return info;
        }
    }
 
    if(item.gift){
 
        return getItemRarityInfo(
            item.gift
        );
    }
 
    return null;
}
 
 
function getRarityThemeClass(item){
 
    const rarity=
        getItemRarityInfo(
            item
        );
 
    if(!rarity){
        return "";
    }
 
    switch(
        rarity.gemType
    ){
 
        case "hoangNgoc":
            return "rarity-hoang";
 
        case "haiLamNgoc":
            return "rarity-hailam";
 
        case "thachAnhTim":
            return "rarity-thachanh";
 
        case "lamBaoThach":
            return "rarity-lambao";
 
        case "lucThach":
            return "rarity-luc";
 
        case "hongNgoc":
            return "rarity-hong";
 
        default:
            return "";
    }
}
 
 
function createRarityBadge(
    item,
    mode
){
 
    const rarity=
        getItemRarityInfo(
            item
        );
 
    if(
        !rarity ||
        !rarity.gemType ||
        !GEM_TYPES[
            rarity.gemType
        ]
    ){
 
        return null;
    }
 
    const badge=
        document.createElement(
            "div"
        );
 
    badge.className=
        mode === "profile"
        ?
        "profile-item-rarity"
        :
        "rx-rarity-badge";
 
    badge.appendChild(
        createGemImage(
            rarity.gemType,
            mode === "profile"
            ?
            "profile-rarity-gem"
            :
            "rx-rarity-gem"
        )
    );
 
    const text=
        document.createElement(
            "span"
        );
 
    text.textContent=
        rarity.displayName ||
        "";
 
    badge.appendChild(
        text
    );
 
    return badge;
}
 
 
function createMobileRarityIcon(
    item,
    mode
){
 
    const rarity=
        getItemRarityInfo(
            item
        );
 
    if(
        !rarity ||
        !rarity.gemType ||
        !GEM_TYPES[
            rarity.gemType
        ]
    ){
 
        return null;
    }
 
    return createGemImage(
        rarity.gemType,
        mode === "profile"
        ?
        "profile-mobile-rarity-icon"
        :
        "rx-mobile-rarity-icon"
    );
}
 
 
/* =========================================================
   GEM REWARD
========================================================= */
 
function getGemRewardInfo(gift){
 
    if(!gift){
        return null;
    }
 
    if(
        gift.gemReward &&
        typeof gift.gemReward ===
        "object"
    ){
 
        const key=
            gift.gemReward.gemType ||
            gift.gemReward.type ||
            gift.gemReward.key ||
            "";
 
        const amount=
            Number(
                gift.gemReward.amount ||
                gift.gemReward.quantity ||
                0
            );
 
        if(
            GEM_TYPES[key] &&
            amount > 0
        ){
 
            return{
                gemType:key,
                amount:Math.floor(amount)
            };
        }
    }
 
    if(
        gift.rewardGemType &&
        GEM_TYPES[
            gift.rewardGemType
        ] &&
        Number(
            gift.rewardGemAmount ||
            0
        ) > 0
    ){
 
        return{
 
            gemType:
                gift.rewardGemType,
 
            amount:
                Math.floor(
                    Number(
                        gift.rewardGemAmount
                    )
                )
        };
    }
 
    return null;
}
 
 
function getHongEquivalent(reward){
 
    if(!reward){
        return 0;
    }
 
    if(
        typeof RS.getGemValueInHong ===
        "function"
    ){
 
        return RS.getGemValueInHong(
            reward.gemType,
            reward.amount
        );
    }
 
    return 0;
}
 
 
/* =========================================================
   GIFT MAP
========================================================= */
 
function rebuildGiftMap(){
 
    state.giftMap=
        new Map();
 
    (
        state.gifts ||
        []
    )
    .forEach(
        function(gift){
 
            if(
                !gift ||
                !gift.name
            ){
 
                return;
            }
 
            state.giftMap.set(
                RS.normalizeText(
                    gift.name
                ),
                gift
            );
        }
    );
}
 
 
function getCanonicalGiftByName(
    giftName
){
 
    return state.giftMap.get(
        RS.normalizeText(
            giftName
        )
    )
    ||
    null;
}
 
 
/* =========================================================
   PROFILE EFFECT
========================================================= */
 
function setMultitaskEffect(enabled){
 
    const wrapper=
        el(
            "studentProfileNameWrap"
        );
 
    const name=
        el(
            "studentProfileName"
        );
 
    if(
        typeof RS.clearMultitaskEffect ===
        "function"
    ){
 
        RS.clearMultitaskEffect(
            wrapper,
            name
        );
    }
 
    if(
        enabled &&
        typeof RS.applyMultitaskEffect ===
        "function"
    ){
 
        RS.applyMultitaskEffect(
            wrapper,
            name,
            {
                size:"large"
            }
        );
    }
}
 
 
/* =========================================================
   AVATAR
========================================================= */
 
function renderProfileAvatar(
    avatarUrl,
    frameUrl
){
 
    const box=
        el(
            "studentProfileAvatar"
        );
 
    box.innerHTML="";
 
    box.classList.remove(
        "has-avatar-frame"
    );
 
    const core=
        document.createElement(
            "div"
        );
 
    core.className=
        "student-profile-avatar-core";
 
    if(!avatarUrl){
 
        core.textContent=
            state.isAdmin
            ?
            UI.admin
            :
            ICONS.user;
 
    }else{
 
        const avatar=
            document.createElement(
                "img"
            );
 
        avatar.src=
            avatarUrl;
 
        avatar.alt=
            "Avatar học viên";
 
        avatar.loading=
            "lazy";
 
        avatar.decoding=
            "async";
 
        avatar.addEventListener(
            "error",
            function(){
 
                core.innerHTML="";
 
                core.textContent=
                    state.isAdmin
                    ?
                    UI.admin
                    :
                    ICONS.user;
            }
        );
 
        core.appendChild(
            avatar
        );
    }
 
    box.appendChild(
        core
    );
 
    if(frameUrl){
 
        const frame=
            document.createElement(
                "img"
            );
 
        frame.className=
            "student-profile-avatar-frame";
 
        frame.src=
            frameUrl;
 
        frame.alt="";
 
        frame.loading=
            "lazy";
 
        frame.decoding=
            "async";
 
        frame.addEventListener(
            "error",
            function(){
 
                this.remove();
 
                box.classList.remove(
                    "has-avatar-frame"
                );
            }
        );
 
        box.appendChild(
            frame
        );
 
        box.classList.add(
            "has-avatar-frame"
        );
    }
}
 
 
/* =========================================================
   LEARNING
========================================================= */
 
function renderLearningInfo(student){
 
    el("learningGroup").textContent=
        student.group ||
        CHAR.dash;
 
    el("learningCourse").textContent=
        student.course ||
        CHAR.dash;
 
    el("learningAverage").textContent=
        RS.formatNumber(
            student.averageScore
        );
 
    el("learningRanking").textContent=
        RS.formatNumber(
            student.rankingScore
        );
 
    const statusBox=
        el(
            "learningStatus"
        );
 
    statusBox.className=
        "learning-status "+
        student.status.type;
 
    el("learningStatusTitle").textContent=
        student.status.title;
 
    el("learningStatusDetail").textContent=
        student.status.detail;
}
 
 
/* =========================================================
   PROFILE GEMS
========================================================= */
 
function renderProfileGems(gems){
 
    const grid=
        el(
            "profileGemGrid"
        );
 
    grid.innerHTML="";
 
    let count=0;
 
    const fragment=
        document.createDocumentFragment();
 
    GEM_ORDER.forEach(
        function(key){
 
            const quantity=
                Number(
                    gems[key] ||
                    0
                );
 
            if(
                quantity <= 0
            ){
 
                return;
            }
 
            count++;
 
            const gem=
                GEM_TYPES[key];
 
            const card=
                document.createElement(
                    "div"
                );
 
            card.className=
                "profile-gem-card "+
                gem.className;
 
            const icon=
                document.createElement(
                    "div"
                );
 
            icon.className=
                "profile-gem-icon";
 
            icon.appendChild(
                createGemImage(
                    key,
                    ""
                )
            );
 
            const info=
                document.createElement(
                    "div"
                );
 
            const name=
                document.createElement(
                    "div"
                );
 
            name.className=
                "profile-gem-name";
 
            name.textContent=
                gem.displayName;
 
            const value=
                document.createElement(
                    "div"
                );
 
            value.className=
                "profile-gem-value";
 
            value.textContent=
                RS.formatNumber(
                    quantity
                );
 
            info.appendChild(
                name
            );
 
            info.appendChild(
                value
            );
 
            card.appendChild(
                icon
            );
 
            card.appendChild(
                info
            );
 
            fragment.appendChild(
                card
            );
        }
    );
 
    grid.appendChild(
        fragment
    );
 
    if(!count){
 
        const empty=
            document.createElement(
                "div"
            );
 
        empty.className=
            "profile-empty";
 
        empty.textContent=
            "Hiện chưa có linh thạch.";
 
        grid.appendChild(
            empty
        );
    }
}
 
 
/* =========================================================
   OWNED ITEMS
========================================================= */
 
function groupOwnedItems(items){
 
    const map=
        new Map();
 
    (
        items ||
        []
    )
    .forEach(
        function(item){
 
            if(
                !item ||
                !item.giftName
            ){
 
                return;
            }
 
            const canonical=
                getCanonicalGiftByName(
                    item.giftName
                );
 
            if(
                canonical &&
                typeof RS.isGemRewardGift ===
                "function" &&
                RS.isGemRewardGift(
                    canonical
                )
            ){
 
                return;
            }
 
            if(
                canonical &&
                typeof RS.isMysteryBoxGiftName ===
                "function" &&
                RS.isMysteryBoxGiftName(
                    canonical.name
                )
            ){
 
                return;
            }
 
            const normalizedName=
                RS.normalizeText(
                    item.giftName
                );
 
            if(!normalizedName){
                return;
            }
 
            const quantity=
                Math.max(
                    1,
                    Math.floor(
                        Number(
                            item.quantity ||
                            1
                        )
                    )
                );
 
            const date=
                RS.parseVietnameseDate(
                    item.timestamp
                );
 
            const time=
                date
                ?
                date.getTime()
                :
                0;
 
            if(
                !map.has(
                    normalizedName
                )
            ){
 
                map.set(
                    normalizedName,
                    {
 
                        giftName:
                            canonical
                            ?
                            canonical.name
                            :
                            item.giftName,
 
                        quantity:0,
 
                        latestTimestamp:
                            item.timestamp ||
                            "",
 
                        latestTime:
                            time
                    }
                );
            }
 
            const group=
                map.get(
                    normalizedName
                );
 
            group.quantity +=
                quantity;
 
            if(
                time >
                group.latestTime
            ){
 
                group.latestTime=
                    time;
 
                group.latestTimestamp=
                    item.timestamp ||
                    "";
            }
        }
    );
 
    return Array.from(
        map.values()
    )
    .map(
        function(group){
 
            const canonical=
                getCanonicalGiftByName(
                    group.giftName
                );
 
            return{
 
                giftName:
                    canonical
                    ?
                    canonical.name
                    :
                    group.giftName,
 
                name:
                    canonical
                    ?
                    canonical.name
                    :
                    group.giftName,
 
                gift:
                    canonical,
 
                image:
                    canonical
                    ?
                    canonical.image ||
                    ""
                    :
                    "",
 
                description:
                    canonical
                    ?
                    canonical.description ||
                    ""
                    :
                    "",
 
                rarity:
                    canonical
                    ?
                    canonical.rarity ||
                    null
                    :
                    null,
 
                rarityInfo:
                    canonical
                    ?
                    canonical.rarityInfo ||
                    null
                    :
                    null,
 
                rawRarity:
                    canonical
                    ?
                    canonical.rawRarity ||
                    ""
                    :
                    "",
 
                quantity:
                    group.quantity,
 
                timestamp:
                    group.latestTimestamp,
 
                latestTime:
                    group.latestTime
            };
        }
    )
    .sort(
        function(a,b){
 
            return(
                Number(
                    b.latestTime ||
                    0
                )
                -
                Number(
                    a.latestTime ||
                    0
                )
            );
        }
    );
}
 
 
function getOwnedItemTotal(items){
 
    return groupOwnedItems(
        items
    )
    .reduce(
        function(total,item){
 
            return(
                total+
                Number(
                    item.quantity ||
                    0
                )
            );
        },
        0
    );
}
 
 
function createGiftImageBox(item){
 
    const box=
        document.createElement(
            "div"
        );
 
    box.className=
        "profile-item-image";
 
    if(!item.image){
 
        box.textContent=
            ICONS.gift;
 
        return box;
    }
 
    const img=
        document.createElement(
            "img"
        );
 
    img.src=
        RS.convertDriveImageUrl(
            item.image,
            300
        );
 
    img.alt=
        item.giftName ||
        "";
 
    img.loading=
        "lazy";
 
    img.decoding=
        "async";
 
    img.addEventListener(
        "error",
        function(){
 
            box.innerHTML="";
 
            box.textContent=
                ICONS.gift;
        }
    );
 
    box.appendChild(
        img
    );
 
    return box;
}
 
 
function renderProfileItems(items){
 
    const grid=
        el(
            "profileItemGrid"
        );
 
    grid.innerHTML="";
 
    const groupedItems=
        groupOwnedItems(
            items
        );
 
    if(
        !groupedItems.length
    ){
 
        const empty=
            document.createElement(
                "div"
            );
 
        empty.className=
            "profile-empty";
 
        empty.textContent=
            "Học viên chưa sở hữu vật phẩm.";
 
        grid.appendChild(
            empty
        );
 
        return;
    }
 
    const fragment=
        document.createDocumentFragment();
 
    groupedItems.forEach(
        function(item){
 
            const card=
                document.createElement(
                    "div"
                );
 
            card.className=
                "profile-item-card";
 
            const themeClass=
                getRarityThemeClass(
                    item
                );
 
            if(themeClass){
 
                card.classList.add(
                    themeClass
                );
            }
 
            const top=
                document.createElement(
                    "div"
                );
 
            top.className=
                "profile-item-top";
 
            top.appendChild(
                createGiftImageBox(
                    item
                )
            );
 
            const info=
                document.createElement(
                    "div"
                );
 
            info.className=
                "profile-item-info";
 
            const nameLine=
                document.createElement(
                    "div"
                );
 
            nameLine.className=
                "profile-item-name-line";
 
            const itemName=
                document.createElement(
                    "div"
                );
 
            itemName.className=
                "profile-item-name";
 
            itemName.textContent=
                item.giftName ||
                "";
 
            nameLine.appendChild(
                itemName
            );
 
            const mobileIcon=
                createMobileRarityIcon(
                    item,
                    "profile"
                );
 
            if(mobileIcon){
 
                nameLine.appendChild(
                    mobileIcon
                );
            }
 
            const quantity=
                document.createElement(
                    "span"
                );
 
            quantity.className=
                "profile-item-quantity";
 
            quantity.textContent=
                CHAR.multiply+
                RS.formatNumber(
                    item.quantity ||
                    1
                );
 
            nameLine.appendChild(
                quantity
            );
 
            info.appendChild(
                nameLine
            );
 
            const rarityBadge=
                createRarityBadge(
                    item,
                    "profile"
                );
 
            if(rarityBadge){
 
                info.appendChild(
                    rarityBadge
                );
            }
 
            if(item.timestamp){
 
                const date=
                    document.createElement(
                        "div"
                    );
 
                date.className=
                    "profile-item-date";
 
                date.textContent=
                    item.timestamp;
 
                info.appendChild(
                    date
                );
            }
 
            top.appendChild(
                info
            );
 
            card.appendChild(
                top
            );
 
            if(item.description){
 
                const description=
                    document.createElement(
                        "div"
                    );
 
                description.className=
                    "profile-item-description";
 
                description.textContent=
                    item.description;
 
                card.appendChild(
                    description
                );
            }
 
            fragment.appendChild(
                card
            );
        }
    );
 
    grid.appendChild(
        fragment
    );
}
 
 
/* =========================================================
   PROFILE
========================================================= */
 
function renderProfile(
    student,
    ownedItems,
    reward
){
    ensureHistoryButton();

 
    const profile=
        el(
            "studentProfileModule"
        );
 
    profile.classList.toggle(
        "admin-profile",
        state.isAdmin
    );
 
    let background="";
 
    if(
        typeof RS.getProfileBackground ===
        "function"
    ){
 
        background=
            RS.getProfileBackground(
                ownedItems,
                student && student.code
            );
    }
 
    profile.classList.remove(
        "has-profile-background"
    );
 
    profile.style.backgroundImage=
        "";
 
    if(background){
 
        profile.style.backgroundImage=
            'url("'+
            background.replace(
                /"/g,
                "%22"
            )+
            '")';
 
        profile.classList.add(
            "has-profile-background"
        );
    }
 
    renderProfileAvatar(
 
        typeof RS.getProfileAvatar ===
        "function"
        ?
        RS.getProfileAvatar(
            ownedItems,
            student && student.code
        )
        :
        "",
 
        typeof RS.getProfileAvatarFrame ===
        "function"
        ?
        RS.getProfileAvatarFrame(
            ownedItems,
            student && student.code
        )
        :
        ""
    );
 
    el("studentProfileName").textContent=
        student.name;
 
    setMultitaskEffect(
        typeof RS.hasMultitaskPotion ===
        "function"
        ?
        RS.hasMultitaskPotion(
            ownedItems
        )
        :
        false
    );
 
    el("profileStreakIcon").textContent=
        reward &&
        reward.streakGift
        ?
        reward.streakGift.icon
        :
        ICONS.seed;
 
    el("profileStreakText").textContent=
        Number(
            reward &&
            reward.longestStreak ||
            0
        )+
        " ngày liên tục";
 
    el("profileHighIcon").textContent=
        reward &&
        reward.highScoreGift
        ?
        reward.highScoreGift.icon
        :
        ICONS.star;
 
    el("profileHighText").textContent=
        Number(
            reward &&
            reward.bestHighRun ||
            0
        )+
        " bài điểm cao";
 
    let title;
 
    if(state.isAdmin){
 
        title={
            icon:UI.admin,
            name:"Tài khoản kiểm thử"
        };
 
    }else if(
        typeof RS.getProfileTitle ===
        "function"
    ){
 
        title=
            RS.getProfileTitle(
                reward ||
                {}
            );
 
    }else{
 
        title={
            icon:ICONS.star,
            name:"Học viên"
        };
    }
 
    el("profileTitleIcon").textContent=
        title.icon ||
        "";
 
    el("profileTitleText").textContent=
        title.name ||
        "";
 
    const gemTotal=
        Object.values(
            student.gems ||
            {}
        )
        .reduce(
            function(
                sum,
                value
            ){
 
                return(
                    sum+
                    Number(
                        value ||
                        0
                    )
                );
            },
            0
        );
 
    el("profileGemTotal").textContent=
        RS.formatNumber(
            gemTotal
        );
 
    el("profileItemTotal").textContent=
        RS.formatNumber(
            getOwnedItemTotal(
                ownedItems
            )
        );
 
    renderLearningInfo(
        student
    );
 
    renderProfileGems(
        student.gems
    );
 
    renderProfileItems(
        ownedItems
    );

    setCardMode(false);
    updateLookUi();

    profile.style.display=
        "block";
}
 
 
/* =========================================================
   PANELS
========================================================= */
 
function closeProfilePanels(){

    state.activeProfilePanel=
        null;

    if(el("profileLookPanel")) el("profileLookPanel").classList.remove("visible");
    if(el("profileLookButton")) el("profileLookButton").classList.remove("active");
 
    [
        "profileLearningPanel",
        "profileGemPanel",
        "profileItemPanel"
    ]
    .forEach(
        function(id){
 
            el(id)
            .classList.remove(
                "visible"
            );
        }
    );
 
    [
        "profileLearningButton",
        "profileGemButton",
        "profileItemButton"
    ]
    .forEach(
        function(id){
 
            el(id)
            .classList.remove(
                "active"
            );
        }
    );
}
 
 
function toggleProfilePanel(type){
 
    if(
        state.activeProfilePanel ===
        type
    ){
 
        closeProfilePanels();
 
        return;
    }
 
    closeProfilePanels();
 
    state.activeProfilePanel=
        type;
 
    const map={
 
        learning:[
            "profileLearningPanel",
            "profileLearningButton"
        ],
 
        gems:[
            "profileGemPanel",
            "profileGemButton"
        ],
 
        items:[
            "profileItemPanel",
            "profileItemButton"
        ]
    };
 
    el(
        map[type][0]
    )
    .classList.add(
        "visible"
    );
 
    el(
        map[type][1]
    )
    .classList.add(
        "active"
    );
}
 
 
/* =========================================================
   STUDENT COLUMNS
========================================================= */
 
function detectStudentColumns(rows){
 
    const headers=
        rows[0]
        .map(
            RS.normalizeText
        );
 
    return{
 
        code:
            RS.findColumn(
                headers,
                [
                    "mã học viên",
                    "ma hoc vien"
                ]
            ),
 
        name:
            RS.findColumn(
                headers,
                [
                    "họ và tên",
                    "ho va ten",
                    "họ tên",
                    "ho ten"
                ]
            ),
 
        group:
            RS.findColumn(
                headers,
                [
                    "tổ",
                    "to"
                ]
            ),
 
        course:
            RS.findColumn(
                headers,
                [
                    "khóa",
                    "khoa"
                ]
            ),
 
        timestamp:
            RS.findColumn(
                headers,
                [
                    "dấu thời gian",
                    "dau thoi gian",
                    "thời gian",
                    "thoi gian",
                    "timestamp"
                ]
            ),
 
        file:
            RS.findColumn(
                headers,
                [
                    "tải bài",
                    "tai bai",
                    "tải bài tập lên",
                    "tai bai tap len",
                    "bài tập",
                    "bai tap"
                ]
            ),
 
        score:
            RS.findColumn(
                headers,
                [
                    "điểm",
                    "diem",
                    "điểm số",
                    "diem so",
                    "điểm giáo viên",
                    "diem giao vien"
                ]
            ),
 
        comment:
            RS.findColumn(
                headers,
                [
                    "nhận xét",
                    "nhan xet",
                    "nhận xét gvcn",
                    "nhan xet gvcn"
                ]
            ),
 
        submissionId:
            RS.findColumn(
                headers,
                [
                    "mã bài nộp",
                    "ma bai nop",
                    "submission id",
                    "submissionid"
                ]
            )
    };
}
 
 
/* =========================================================
   STUDENT REGISTRY - HOCVIEN
========================================================= */
 
function detectRegistryColumns(rows){
 
    if(
        !Array.isArray(rows) ||
        !rows.length
    ){
 
        return{
            code:-1,
            name:-1,
            group:-1,
            course:-1,
            status:-1
        };
    }
 
    const headers=
        rows[0]
        .map(
            RS.normalizeText
        );
 
    return{
 
        code:
            RS.findColumn(
                headers,
                [
                    "mã học viên",
                    "ma hoc vien"
                ]
            ),
 
        name:
            RS.findColumn(
                headers,
                [
                    "họ và tên",
                    "ho va ten",
                    "họ tên",
                    "ho ten"
                ]
            ),
 
        group:
            RS.findColumn(
                headers,
                [
                    "tổ",
                    "to"
                ]
            ),
 
        course:
            RS.findColumn(
                headers,
                [
                    "khóa",
                    "khoá",
                    "khoa"
                ]
            ),
 
        status:
            RS.findColumn(
                headers,
                [
                    "trạng thái",
                    "trang thai",
                    "status"
                ]
            )
    };
}
 
 
function findRegistryStudent(
    rows,
    code
){
 
    const columns=
        detectRegistryColumns(
            rows
        );
 
    if(columns.code < 0){
        return null;
    }
 
    for(
        let i=1;
        i<rows.length;
        i++
    ){
 
        const row=
            rows[i];
 
        if(
            RS.normalizeCode(
                row[columns.code] || ""
            ) !== code
        ){
            continue;
        }
 
        return{
 
            code,
 
            name:
                columns.name >= 0
                ?
                clean(
                    row[columns.name]
                )
                :
                "",
 
            group:
                columns.group >= 0
                ?
                clean(
                    row[columns.group]
                )
                :
                "",
 
            course:
                columns.course >= 0
                ?
                clean(
                    row[columns.course]
                )
                :
                "",
 
            status:
                columns.status >= 0
                ?
                normalizeLocal(
                    row[columns.status] || ""
                )
                :
                "active"
        };
    }
 
    return null;
}
 
 
function assertRegistryStudentStatus(
    student
){
 
    if(!student){
        return;
    }
 
    const status=
        normalizeLocal(
            student.status ||
            "active"
        );
 
    if(
        !status ||
        status === "active"
    ){
        return;
    }
 
    if(status === "paused"){
        throw new Error(
            "Mã học viên hiện đang tạm dừng."
        );
    }
 
    if(status === "graduated"){
        throw new Error(
            "Mã học viên đã chuyển sang trạng thái tốt nghiệp."
        );
    }
 
    if(status === "pending"){
        throw new Error(
            "Mã học viên hiện chưa được kích hoạt."
        );
    }
 
    throw new Error(
        "Mã học viên hiện không ở trạng thái hoạt động."
    );
}
 
 
/* =========================================================
   SCORE
========================================================= */
 
function calculateStudentScores(
    submissions
){
 
    let totalScore=0;
    let gradedCount=0;
 
    submissions.forEach(
        function(item){
 
            const score=
                RS.parseScore(
                    item.score
                );
 
            if(
                score !== null
            ){
 
                totalScore +=
                    score;
 
                gradedCount++;
            }
        }
    );
 
    return{
 
        average:
            gradedCount
            ?
            Math.round(
                totalScore/
                gradedCount*
                100
            )/100
            :
            0,
 
        ranking:
            submissions.length+
            totalScore
    };
}
 
 
/* =========================================================
   STATUS
========================================================= */
 
function getSubmissionStatus(
    submissions
){
 
    if(
        !submissions ||
        !submissions.length
    ){
 
        return{
 
            type:"warning",
 
            title:
                "CHƯA CÓ BÀI NỘP HỢP LỆ",
 
            detail:
                state.deletedSubmissionCount > 0
                ?
                "Các bài hiện có của học viên đã được đánh dấu xoá và không còn được dùng để tính học tập."
                :
                "Chưa tìm thấy bài nộp hợp lệ để xác định trạng thái học tập."
        };
    }
 
    let latest=null;
    let latestText="";
 
    submissions.forEach(
        function(item){
 
            const date=
                RS.parseVietnameseDate(
                    item.timestamp
                );
 
            if(
                date &&
                (
                    !latest ||
                    date > latest
                )
            ){
 
                latest=
                    date;
 
                latestText=
                    item.timestamp;
            }
        }
    );
 
    if(!latest){
 
        return{
 
            type:"warning",
 
            title:
                "KHÔNG XÁC ĐỊNH ĐƯỢC TRẠNG THÁI",
 
            detail:
                "Không thể xác định thời gian nộp bài hợp lệ gần nhất."
        };
    }
 
    let days=
        Math.floor(
            (
                Date.now()-
                latest.getTime()
            )
            /
            ONE_DAY
        );
 
    days=
        Math.max(
            0,
            days
        );
 
    if(
        days >
        CONFIG.warningDays
    ){
 
        return{
 
            type:"danger",
 
            title:
                "CẢNH BÁO: ĐÃ QUÁ 21 NGÀY CHƯA NỘP BÀI MỚI",
 
            detail:
                "Lần nộp hợp lệ gần nhất: "+
                latestText+
                ". Đã "+
                days+
                " ngày chưa có bài mới."
        };
    }
 
    if(
        days ===
        CONFIG.warningDays
    ){
 
        return{
 
            type:"warning",
 
            title:
                "NHẮC NHỞ: ĐÃ 21 NGÀY CHƯA NỘP BÀI MỚI",
 
            detail:
                "Lần nộp hợp lệ gần nhất: "+
                latestText+
                "."
        };
    }
 
    return{
 
        type:"safe",
 
        title:
            "TRẠNG THÁI NỘP BÀI: TỐT",
 
        detail:
            "Lần nộp hợp lệ gần nhất: "+
            latestText+
            ". Còn "+
            (
                CONFIG.warningDays-
                days
            )+
            " ngày trước khi hệ thống cảnh báo."
    };
}
 
 
/* =========================================================
   ACCOUNT
========================================================= */
 
function calculateStudentAccount(
    reward,
    shared,
    code
){
 
    const normalizedCode=
        RS.normalizeCode(
            code
        );
 
    const rawTransactions=
        shared.redemptionMap
        .get(
            normalizedCode
        )
        ||
        [];
 
    const accounting=
        RS.processTransactions(
            reward.gems,
            rawTransactions
        );
 
    const teacherOwnedItems=
        (
            shared.teacherOwnedItemMap
            &&
            shared.teacherOwnedItemMap
            .get(
                normalizedCode
            )
        )
        ||
        [];
 
    const ownedItems=
        typeof RS.mergeOwnedItems ===
        "function"
        ?
        RS.mergeOwnedItems(
            accounting.ownedItems,
            teacherOwnedItems
        )
        :
        [
            ...accounting.ownedItems,
            ...teacherOwnedItems
        ];
 
    return{
 
        rawTransactions,
 
        accounting,
 
        ownedItems,
 
        gems:
            accounting.gems
    };
}
 
 
/* =========================================================
   CANONICAL ASSET PROFILE - CORE 4.2+

   QUY TẮC KIẾN TRÚC:
   - Core là nguồn sự thật duy nhất cho tài sản học viên.
   - Profile Market không tự replay PhieuDoi / QuaTangGVCN /
     MinhHongGiaoDich để quyết định số dư cuối cùng.
   - Module tương lai (Quest / Event / Exam / Achievement...)
     chỉ cần tích hợp vào Core; trang này tiếp tục dùng cùng contract.
========================================================= */

function normalizeCanonicalProfile(profile){

    profile=(
        profile &&
        typeof profile === "object"
    )
    ? profile
    : {};

    return{
        raw:profile,

        gems:
            profile.gems ||
            profile.balance ||
            createEmptyGemsSafe(),

        ownedItems:
            Array.isArray(profile.ownedItems)
            ? profile.ownedItems
            : [],

        rawTransactions:
            Array.isArray(profile.rawTransactions)
            ? profile.rawTransactions
            : [],

        transactions:
            Array.isArray(profile.validTransactions)
            ? profile.validTransactions
            : (
                Array.isArray(profile.transactions)
                ? profile.transactions
                : []
            )
    };
}


async function loadCanonicalStudentProfile(
    code,
    force
){

    if(
        typeof RS.getStudentRewardProfile !==
        "function"
    ){

        throw new Error(
            "Reward Core chưa hỗ trợ hồ sơ tài sản thống nhất."
        );
    }

    const profile=
        await RS.getStudentRewardProfile(
            RS.normalizeCode(code),
            state.submissionCsvText || "",
            Boolean(force)
        );

    if(!profile){

        throw new Error(
            "Reward Core không trả về hồ sơ tài sản."
        );
    }

    return profile;
}


function applyCanonicalAssets(profile){

    if(!state.student){
        return null;
    }

    const canonical=
        normalizeCanonicalProfile(
            profile
        );

    state.assetProfile=
        canonical.raw;

    state.student.gems=
        canonical.gems;

    state.ownedItems=
        canonical.ownedItems;

    state.rawTransactions=
        canonical.rawTransactions;

    state.transactions=
        canonical.transactions;

    return canonical;
}


function renderCanonicalAssets(profile){

    if(
        !profile ||
        !state.student
    ){
        return;
    }

    const currentPanel=
        state.activeProfilePanel;

    applyCanonicalAssets(
        profile
    );

    renderProfile(
        state.student,
        state.ownedItems,
        state.reward
    );

    closeProfilePanels();

    if(currentPanel){

        toggleProfilePanel(
            currentPanel
        );
    }

    if(state.marketLoaded){

        renderMarket();
    }

    ensureHistoryButton();

    syncStudentSession();

    saveMarketSnapshot();
}


async function refreshCanonicalAssets(){

    if(
        !state.student ||
        state.isAdmin
    ){
        return null;
    }

    let profile;

    if(
        typeof RS.refreshStudentRewardProfile ===
        "function"
    ){

        profile=
            await RS.refreshStudentRewardProfile(
                state.student.code,
                state.submissionCsvText || ""
            );

    }else{

        profile=
            await loadCanonicalStudentProfile(
                state.student.code,
                true
            );
    }

    renderCanonicalAssets(
        profile
    );

    return profile;
}


/* =========================================================
   ADMIN
========================================================= */
 
function createAdminReward(){
 
    const gems=
        createEmptyGemsSafe();
 
    gems[
        HONG_KEY
    ]=
        Number(
            CONFIG.adminHongNgoc ||
            1000
        );
 
    return{
 
        gems,
 
        longestStreak:0,
 
        bestHighRun:0,
 
        streakGift:null,
 
        highScoreGift:null
    };
}
 
 
async function loadAdminAccount(
    sharedInput
){
 
    const shared=
        sharedInput
        ||
        await RS.loadSharedRewardData(
            true
        );
 
    state.isAdmin=
        true;
 
    state.submissionCsvText="";
    state.assetProfile=null;
 
    state.deletedSubmissionCount=
        0;
 
    state.submissions=
        [];
 
    state.submissionsRendered=
        false;
 
    state.gifts=
        shared.gifts ||
        state.gifts ||
        [];
 
    rebuildGiftMap();
 
    const code=
        RS.normalizeCode(
            CONFIG.adminCode
        );
 
    const reward=
        createAdminReward();
 
    const account=
        calculateStudentAccount(
            reward,
            shared,
            code
        );
 
    state.reward=
        reward;
 
    state.rawTransactions=
        account.rawTransactions;
 
    state.transactions=
        account.accounting
        .validTransactions ||
        [];
 
    state.ownedItems=
        account.ownedItems;
 
    state.student={
 
        code,
 
        name:
            CONFIG.adminName,
 
        group:
            CONFIG.adminGroup,
 
        course:
            CONFIG.adminCourse,
 
        averageScore:
            10,
 
        rankingScore:
            9999,
 
        status:{
 
            type:"safe",
 
            title:
                "TÀI KHOẢN KIỂM THỬ HỆ THỐNG",
 
            detail:
                "Vốn gốc 1000 Hồng Ngọc. Mọi giao dịch của tài khoản này được gửi thật vào hệ thống và được Core tính toán lại."
        },
 
        gems:
            account.gems
    };
 
    renderProfile(
        state.student,
        state.ownedItems,
        state.reward
    );
 
    resetSubmissionUi();
 
    if(
        state.marketLoaded
    ){
 
        renderMarket();
    }
 
    return account;
}
 
 
/* =========================================================
   SUBMISSION LAZY UI
========================================================= */
 
function resetSubmissionUi(){
 
    state.submissionOpen=
        false;
 
    state.submissionsRendered=
        false;
 
    el("submissionContent")
    .classList.remove(
        "visible"
    );
 
    el("submissionToggleButton")
    .classList.remove(
        "open"
    );
 
    el("submissionTableBody")
    .innerHTML=
        "";
 
    if(state.isAdmin){
 
        el("submissionSection")
        .style.display=
            "none";
 
        el("submissionCount")
        .textContent=
            "";
 
        return;
    }
 
    const validCount=
        state.submissions.length;
 
    const deletedCount=
        Number(
            state.deletedSubmissionCount ||
            0
        );
 
    let countText=
        "("+
        validCount+
        " bài hợp lệ";
 
    if(
        deletedCount > 0
    ){
 
        countText +=
            " "+
            CHAR.dot+
            " "+
            deletedCount+
            " bài đã xoá";
    }
 
    countText +=
        ")";
 
    el("submissionCount")
    .textContent=
        countText;
 
    el("submissionSection")
    .style.display=
        (
            validCount > 0
            ||
            deletedCount > 0
        )
        ?
        "block"
        :
        "none";
}
 
 
/* =========================================================
   SEARCH STUDENT
========================================================= */
 

/* =========================================================
   STUDENT SESSION (v4.9.10)
   Đã bỏ phần gửi tình trạng tra cứu sang Minh Hồng.
   Chỉ giữ việc xác nhận phiên đăng nhập học viên dùng chung (OCDStudentSession),
   để các trang Nhiệm vụ / Phòng Luyện Công nhận mã sau khi tra cứu.
========================================================= */
function syncStudentSession(){
    if(state.isAdmin || !state.student || !state.student.code) return;
    const code=RS.normalizeCode(state.student.code);
    let attempts=0;
    const maxAttempts=12;
    function apply(){
        attempts++;
        try{
            if(window.OCDStudentSession &&
               typeof window.OCDStudentSession.confirmStudent==="function"){
                window.OCDStudentSession.confirmStudent(code,"tra-cuu");
                return;
            }
        }catch(error){
            console.warn("[Profile] Không thể đồng bộ Student Session:",error);
            return;
        }
        if(attempts<maxAttempts) setTimeout(apply,250);
    }
    apply();
}
/* =========================================================
   v4.9.12: BẢN LƯU HỒ SƠ (hiện ngay khi mở lại trang)
   - Lưu số dư, túi đồ, thông tin học viên sau mỗi lần tải xong.
   - Lần tra cứu sau hiện ngay bản lưu, kèm thông báo "đang cập nhật",
     và chặn mua cho đến khi có số liệu mới.
========================================================= */

const MARKET_SNAPSHOT_KEY="ocd_market_snapshot_v1";
const MARKET_SNAPSHOT_MAX_AGE=7*24*60*60*1000;

function snapshotReplacer(key,value){
    if(value instanceof Set) return {__set:Array.from(value)};
    if(value instanceof Map) return {__map:Array.from(value.entries())};
    return value;
}
function snapshotReviver(key,value){
    if(value && typeof value==="object"){
        if(Array.isArray(value.__set)) return new Set(value.__set);
        if(Array.isArray(value.__map)) return new Map(value.__map);
    }
    return value;
}
function readMarketSnapshots(){
    try{
        const all=JSON.parse(window.localStorage.getItem(MARKET_SNAPSHOT_KEY)||"{}",snapshotReviver);
        return all && typeof all==="object" ? all : {};
    }catch(e){ return {}; }
}
function readMarketSnapshot(code){
    const snap=readMarketSnapshots()[RS.normalizeCode(code)];
    if(!snap || !snap.student || Date.now()-Number(snap.at||0)>MARKET_SNAPSHOT_MAX_AGE) return null;
    return snap;
}
function saveMarketSnapshot(){
    try{
        if(!state.student || state.isAdmin || state.assetsStale) return;
        const code=RS.normalizeCode(state.student.code);
        if(!code) return;
        const all=readMarketSnapshots();
        all[code]={
            at:Date.now(),
            student:state.student,
            reward:state.reward,
            ownedItems:state.ownedItems||[],
            gifts:state.gifts||[]
        };
        Object.keys(all)
            .sort(function(a,b){ return Number(all[b].at||0)-Number(all[a].at||0); })
            .slice(3)
            .forEach(function(k){ delete all[k]; });
        const text=JSON.stringify(all,snapshotReplacer);
        if(text.length<1500000) window.localStorage.setItem(MARKET_SNAPSHOT_KEY,text);
    }catch(e){}
}
function showMarketSnapshot(code){
    const snap=readMarketSnapshot(code);
    if(!snap) return false;
    try{
        state.student=snap.student;
        state.reward=snap.reward;
        state.ownedItems=Array.isArray(snap.ownedItems)?snap.ownedItems:[];
        if((!state.gifts || !state.gifts.length) && Array.isArray(snap.gifts) && snap.gifts.length){
            state.gifts=snap.gifts;
            rebuildGiftMap();
        }
        state.assetsStale=true;
        renderProfile(
            state.student,
            state.ownedItems,
            state.reward
        );
        return true;
    }catch(error){
        console.warn("[Profile snapshot]",error);
        state.assetsStale=false;
        return false;
    }
}

async function searchStudent(){
 
    const code=
        RS.normalizeCode(
            el(
                "rxStudentCode"
            ).value
        );
 
    if(!code){
 
        showMessage(
            "rxMessage",
            "Vui lòng nhập Mã học viên.",
            "error"
        );
 
        return;
    }
 
    /* Xoá Context cũ khi bắt đầu tra cứu mã mới. */

    const button=
        el(
            "rxSearchButton"
        );
 
    button.disabled=
        true;
 
    button.textContent=
        "ĐANG TRA CỨU...";
 
    showMessage(
        "rxMessage",
        "Đang tải hồ sơ và đồng bộ bài đã xoá...",
        "loading"
    );
 
    el("studentProfileModule")
    .style.display=
        "none";
 
    el("studentProfileModule")
    .classList.remove(
        "admin-profile"
    );
 
    closeProfilePanels();
 
    el("submissionSection")
    .style.display=
        "none";
 
    el("submissionTableBody")
    .innerHTML=
        "";
 
    state.submissionsRendered=
        false;
 
    state.submissionOpen=
        false;
 
    state.submissionCsvText="";
    state.assetProfile=null;

    setMultitaskEffect(
        false
    );

    state.assetsStale=false;
    setCardMode(false);
    hideLookUi();
    /* v4.10.0: mã đã bảo mật mà người xem không phải chủ tài khoản -> chỉ hiện danh thiếp */
    if(code !== RS.normalizeCode(CONFIG.adminCode)){
        try{
            if(await needsCardOnly(code) && await renderCardOnly(code)){
                showMessage("rxMessage","🔒 Hồ sơ "+code+" đã được bảo mật – chỉ hiển thị danh thiếp.","success");
                button.disabled=false;
                button.textContent="TRA CỨU";
                return;
            }
        }catch(error){
            console.error("[Profile card]",error);
            showMessage("rxMessage",error.message || "Không tải được danh thiếp.","error");
            button.disabled=false;
            button.textContent="TRA CỨU";
            return;
        }
    }
    /* v4.9.12: hiện ngay hồ sơ lưu từ lần trước trong lúc tải số liệu mới */
    if(
        code !== RS.normalizeCode(CONFIG.adminCode) &&
        showMarketSnapshot(code)
    ){
        showMessage(
            "rxMessage",
            "Đang hiển thị số liệu lần trước, đang cập nhật số liệu mới nhất...",
            "loading"
        );
    }

    try{
 
        if(
            code ===
            RS.normalizeCode(
                CONFIG.adminCode
            )
        ){
 
            const shared=
                await RS.loadSharedRewardData(
                    true
                );
 
            await loadAdminAccount(
                shared
            );
 
            showMessage(
                "rxMessage",
                "Đã mở tài khoản ADMIN.",
                "success"
            );
 
            return;
        }
 
        state.isAdmin=
            false;
 
        const results=
            await Promise.all([
 
                /* v4.9.7: bài nộp của riêng học viên qua Apps Script (lọc sẵn) thay vì tải cả CSV */
                typeof RS.getStudentSubmissionsCsv === "function"
                    ? RS.getStudentSubmissionsCsv(code,true)
                    : RS.fetchCSV(
                        RS.CONFIG.studentCsv
                    ),
 
                RS.loadSharedRewardData(
                    true
                ),
 
                loadDeletedSubmissionIds(),
 
                RS.fetchCSV(
                    CONFIG.studentRegistryCsv
                ),
                /* v4.9.7: kiểm tra trạng thái học viên chạy song song (gom chung 1 yêu cầu Apps Script) */
                typeof RS.assertStudentActive === "function"
                    ? RS.assertStudentActive(
                        code,
                        {
                            forceRefresh:true
                        }
                    )
                    : null
            ]);
 
        const studentRows=
            RS.parseCSV(
                results[0]
            );
 
        const shared=
            results[1];
 
        const deletedSubmissionIds=
            results[2];
 
        const registryRows=
            RS.parseCSV(
                results[3]
            );
 
        const registryStudent=
            findRegistryStudent(
                registryRows,
                code
            );
 
        if(
            typeof RS.assertStudentActive ===
            "function"
        ){

            /* v4.9.7: đã kiểm tra song song ở bước tải dữ liệu phía trên. */

        }else{

            assertRegistryStudentStatus(
                registryStudent
            );
        }
 
        state.gifts=
            shared.gifts ||
            [];
 
        rebuildGiftMap();
 
        const columns=
            detectStudentColumns(
                studentRows
            );
 
        if(
            columns.code < 0
        ){
 
            throw new Error(
                "Không tìm thấy cột Mã học viên."
            );
        }
 
        let studentName=
            registryStudent
            ?
            registryStudent.name
            :
            "";
 
        let studentGroup=
            registryStudent
            ?
            registryStudent.group
            :
            "";
 
        let studentCourse=
            registryStudent
            ?
            registryStudent.course
            :
            "";
 
        const rawStudentSubmissions=[];
 
        let matchedStudentRows=0;
 
        for(
            let i=1;
            i<studentRows.length;
            i++
        ){
 
            const row=
                studentRows[i];
 
            const rawCode=
                columns.code >= 0
                ?
                clean(
                    row[
                        columns.code
                    ]
                )
                :
                "";
 
            if(
                RS.normalizeCode(
                    rawCode
                )
                !==
                code
            ){
 
                continue;
            }
 
            matchedStudentRows++;
 
            if(
                !studentName &&
                columns.name >= 0
            ){
 
                studentName=
                    row[
                        columns.name
                    ] || "";
            }
 
            if(
                !studentGroup &&
                columns.group >= 0
            ){
 
                studentGroup=
                    row[
                        columns.group
                    ] || "";
            }
 
            if(
                !studentCourse &&
                columns.course >= 0
            ){
 
                studentCourse=
                    row[
                        columns.course
                    ] || "";
            }
 
            const timestamp=
                columns.timestamp >= 0
                ?
                row[
                    columns.timestamp
                ] || ""
                :
                "";
 
            const file=
                columns.file >= 0
                ?
                row[
                    columns.file
                ] || ""
                :
                "";
 
            const submissionId=
                (
                    columns.submissionId >= 0
                    &&
                    clean(
                        row[
                            columns.submissionId
                        ]
                    )
                )
                ||
                buildSubmissionId(
                    timestamp,
                    rawCode,
                    file
                );
 
            rawStudentSubmissions.push({
 
                timestamp,
 
                file,
 
                score:
                    columns.score >= 0
                    ?
                    row[
                        columns.score
                    ] || ""
                    :
                    "",
 
                comment:
                    columns.comment >= 0
                    ?
                    row[
                        columns.comment
                    ] || ""
                    :
                    "",
 
                submissionId,
 
                originalIndex:
                    i
            });
        }
 
        /*
           Tương thích chuyển tiếp:
           - Có trong HocVien: được phép có 0 bài nộp.
           - Chưa có trong HocVien nhưng có lịch sử cũ: vẫn hoạt động.
           - Không có ở cả hai nguồn: báo không tìm thấy.
        */
        if(
            matchedStudentRows <= 0 &&
            !registryStudent
        ){
 
            throw new Error(
                "Không tìm thấy Mã học viên."
            );
        }
 
        const submissions=
            rawStudentSubmissions
            .filter(
                function(item){
 
                    return(
                        !deletedSubmissionIds
                        .has(
                            item.submissionId
                        )
                    );
                }
            );
 
        state.deletedSubmissionCount=
            rawStudentSubmissions.length
            -
            submissions.length;
 
        state.submissions=
            submissions;
 
        state.submissionsRendered=
            false;
 
        const reward=
            calculateStudentRewardSafe(
                submissions
            );
 
        state.reward=
            reward;
 
        const scoreData=
            calculateStudentScores(
                submissions
            );
 
        /*
           Core nhận đúng cùng tập bài hợp lệ mà Tra cứu đang dùng.
           Nhờ vậy XoaBai không bị đưa trở lại khi Core tính reward.
        */
        const filteredStudentRows=[
            studentRows[0] || []
        ];
 
        submissions.forEach(
            function(item){
 
                if(
                    Number.isInteger(item.originalIndex) &&
                    studentRows[item.originalIndex]
                ){
 
                    filteredStudentRows.push(
                        studentRows[item.originalIndex]
                    );
                }
            }
        );
 
        state.submissionCsvText=
            rowsToCsv(
                filteredStudentRows
            );
 
        state.assetProfile=null;
        state.rawTransactions=[];
        state.transactions=[];
        state.ownedItems=[];
 
        state.student={
 
            code,
 
            name:
                String(
                    studentName ||
                    code
                )
                .trim(),
 
            group:
                String(
                    studentGroup ||
                    ""
                )
                .trim(),
 
            course:
                String(
                    studentCourse ||
                    ""
                )
                .trim(),
 
            averageScore:
                scoreData.average,
 
            rankingScore:
                scoreData.ranking,
 
            status:
                getSubmissionStatus(
                    submissions
                ),
 
            gems:
                createEmptyGemsSafe()
        };
 
        /*
           TÀI SẢN HỌC VIÊN: chỉ lấy từ Core.
           Profile Market không tự tính số dư cuối cùng nữa.
        */
        /* v4.9.7: dữ liệu chung vừa được làm mới ở bước trên -> không tải lại lần nữa */
        const assetProfile=
            await loadCanonicalStudentProfile(
                code,
                false
            );
 
        applyCanonicalAssets(
            assetProfile
        );

        state.assetsStale=false;

        renderProfile(
            state.student,
            state.ownedItems,
            state.reward
        );

        saveMarketSnapshot();
 
        /* Đồng bộ mã đã xác minh và Context thật sang Minh Hồng. */
        syncStudentSession();

        resetSubmissionUi();
 
        if(
            state.marketLoaded
        ){
 
            renderMarket();
        }
 
        let successMessage=
            "Tra cứu thành công.";
 
        if(
            state.deletedSubmissionCount > 0
        ){
 
            successMessage +=
                " Đã loại "+
                state.deletedSubmissionCount+
                " bài bị xoá khỏi dữ liệu học tập.";
        }
 
        showMessage(
            "rxMessage",
            successMessage,
            "success"
        );
 
    }catch(error){
 
        console.error(
            "[Profile v4.9L-R3]",
            error
        );
 
        showMessage(
            "rxMessage",
            error.message ||
            "Có lỗi khi tải dữ liệu.",
            "error"
        );
 
    }finally{
 
        button.disabled=
            false;
 
        button.textContent=
            "TRA CỨU";
    }
}
 
 
/* =========================================================
   NPC MAP
========================================================= */
 
function mapNpcRows(rows){
 
    if(
        !Array.isArray(rows) ||
        rows.length < 2
    ){
 
        return [];
    }
 
    const headers=
        rows[0]
        .map(
            RS.normalizeText
        );
 
    let nameIndex=
        RS.findColumn(
            headers,
            [
                "tên nhân vật",
                "ten nhan vat",
                "tên npc",
                "ten npc"
            ]
        );
 
    let imageIndex=
        RS.findColumn(
            headers,
            [
                "hình ảnh",
                "hinh anh",
                "icon"
            ]
        );
 
    let descriptionIndex=
        RS.findColumn(
            headers,
            [
                "mô tả",
                "mo ta"
            ]
        );
 
    if(nameIndex < 0){
        nameIndex=0;
    }
 
    if(imageIndex < 0){
        imageIndex=1;
    }
 
    if(descriptionIndex < 0){
        descriptionIndex=2;
    }
 
    return rows
    .slice(1)
    .map(
        function(
            row,
            index
        ){
 
            const name=
                String(
                    row[
                        nameIndex
                    ] || ""
                )
                .trim();
 
            return{
 
                id:
                    "npc-"+index,
 
                name,
 
                normalizedName:
                    RS.normalizeText(
                        name
                    ),
 
                image:
                    String(
                        row[
                            imageIndex
                        ] || ""
                    )
                    .trim(),
 
                description:
                    String(
                        row[
                            descriptionIndex
                        ] || ""
                    )
                    .trim()
            };
        }
    )
    .filter(
        function(npc){
 
            return Boolean(
                npc.name
            );
        }
    );
}
 
 
/* =========================================================
   DAILY NPC
========================================================= */
 
function selectDailyNpcs(
    npcs,
    dayKey
){
 
    if(!npcs.length){
        return [];
    }
 
    const priorityNames=[
        "nong dan"
    ];
 
    const priority=[];
 
    priorityNames.forEach(
        function(name){
 
            const found=
                npcs.find(
                    function(npc){
 
                        return(
                            npc.normalizedName ===
                            name
                        );
                    }
                );
 
            if(found){
 
                priority.push(
                    found
                );
            }
        }
    );
 
    const others=
        npcs.filter(
            function(npc){
 
                return(
                    priority.indexOf(
                        npc
                    ) < 0
                );
            }
        );
 
    const maximum=
        Math.min(
            CONFIG.maxNpcPerDay,
            npcs.length
        );
 
    const minimum=
        Math.min(
            Math.max(
                CONFIG.minNpcPerDay,
                priority.length
            ),
            maximum
        );
 
    const random=
        seededRandom(
            hashText(
                dayKey+
                "|npc-count-v4.1"
            )
        );
 
    const count=
        minimum+
        Math.floor(
            random()*
            (
                maximum-
                minimum+
                1
            )
        );
 
    let selected=
        priority.slice(
            0,
            count
        );
 
    if(
        selected.length <
        count
    ){
 
        selected=
            selected.concat(
 
                seededShuffle(
                    others,
                    hashText(
                        dayKey+
                        "|npc-select-v4.1"
                    )
                )
                .slice(
                    0,
                    count-
                    selected.length
                )
            );
    }
 
    return seededShuffle(
        selected,
        hashText(
            dayKey+
            "|npc-order-v4.1"
        )
    );
}
 
 
function isSpecialMerchant(npc){
 
    return(
        CONFIG.specialMerchants
        .indexOf(
            RS.normalizeText(
                npc &&
                npc.name
            )
        )
        >=
        0
    );
}
 
 
/* =========================================================
   PRICE
========================================================= */
 
function getNormalMarketPrice(
    gift,
    dayKey,
    merchantKey
){
 
    const correctPrice=
        Math.max(
            1,
            Number(
                gift.correctPrice ||
                gift.cost ||
                1
            )
        );
 
    const random=
        seededRandom(
            hashText(
                dayKey+
                "|normal-price|"+
                merchantKey+
                "|"+
                gift.name
            )
        );
 
    const minimum=
        Math.max(
            1,
            Math.ceil(
                correctPrice*
                .7
            )
        );
 
    const maximum=
        Math.max(
            minimum,
            Math.ceil(
                correctPrice*
                1.5
            )
        );
 
    let price=
        minimum+
        Math.floor(
            random()*
            (
                maximum-
                minimum+
                1
            )
        );
 
    const reward=
        getGemRewardInfo(
            gift
        );
 
    if(reward){
 
        price=
            Math.max(
                price,
                Math.ceil(
                    getHongEquivalent(
                        reward
                    )
                )
            );
    }
 
    return Math.max(
        1,
        price
    );
}
 
 
function getProfitPrice(
    gift,
    dayKey,
    merchantKey,
    slot
){
 
    const reward=
        getGemRewardInfo(
            gift
        );
 
    if(!reward){
        return null;
    }
 
    const equivalent=
        getHongEquivalent(
            reward
        );
 
    if(
        equivalent <= 1
    ){
 
        return null;
    }
 
    const maxPrice=
        Math.max(
            1,
            Math.ceil(
                equivalent
            )-1
        );
 
    const random=
        seededRandom(
            hashText(
                dayKey+
                "|profit-price|"+
                merchantKey+
                "|"+
                gift.name+
                "|"+
                slot
            )
        );
 
    const roll=
        random();
 
    let multiplier;
 
    if(
        roll < .70
    ){
 
        multiplier=.85;
 
    }else if(
        roll < .95
    ){
 
        multiplier=.70;
 
    }else{
 
        multiplier=.50;
    }
 
    let price=
        Math.floor(
            equivalent*
            multiplier
        );
 
    price=
        Math.max(
            1,
            Math.min(
                price,
                maxPrice
            )
        );
 
    return price;
}
 
 
function getDailyProfitTarget(dayKey){
 
    const random=
        seededRandom(
            hashText(
                dayKey+
                "|profit-count-v4.1"
            )
        );
 
    return(
        CONFIG.minProfitDealsPerDay
        +
        Math.floor(
            random()*
            (
                CONFIG.maxProfitDealsPerDay-
                CONFIG.minProfitDealsPerDay+
                1
            )
        )
    );
}
 
 
/* =========================================================
   DISTRIBUTE GIFTS
========================================================= */
 
function distributeDailyGifts(
    gifts,
    npcs,
    dayKey
){
 
    const offers=
        npcs.map(
            function(npc){
 
                return{
                    npc,
                    gifts:[]
                };
            }
        );
 
    if(
        !offers.length ||
        !gifts.length
    ){
 
        return offers;
    }
 
    const rewardGifts=
        gifts.filter(
            function(gift){
 
                return Boolean(
                    getGemRewardInfo(
                        gift
                    )
                );
            }
        );
 
    const allPool=
        seededShuffle(
            gifts,
            hashText(
                dayKey+
                "|gift-pool-v4.1"
            )
        );
 
    const specialOffers=
        offers.filter(
            function(offer){
 
                return isSpecialMerchant(
                    offer.npc
                );
            }
        );
 
    const target=
        getDailyProfitTarget(
            dayKey
        );
 
    const profitCandidates=
        seededShuffle(
 
            rewardGifts.filter(
                function(gift){
 
                    return(
                        getHongEquivalent(
                            getGemRewardInfo(
                                gift
                            )
                        )
                        >
                        1
                    );
                }
            ),
 
            hashText(
                dayKey+
                "|profit-candidates-v4.1"
            )
        );
 
    const usedGiftNames=
        new Set();
 
    let profitIndex=0;
    let specialCursor=0;
 
    while(
        profitIndex < target &&
        profitIndex < profitCandidates.length &&
        specialOffers.length
    ){
 
        let placed=false;
 
        for(
            let tries=0;
            tries<specialOffers.length;
            tries++
        ){
 
            const offer=
                specialOffers[
                    specialCursor %
                    specialOffers.length
                ];
 
            specialCursor++;
 
            if(
                offer.gifts.length >=
                CONFIG.maxSpecialGiftPerMerchant
            ){
 
                continue;
            }
 
            const gift=
                profitCandidates[
                    profitIndex
                ];
 
            const price=
                getProfitPrice(
                    gift,
                    dayKey,
                    offer.npc.normalizedName,
                    offer.gifts.length
                );
 
            if(
                price === null
            ){
 
                profitIndex++;
                placed=true;
                break;
            }
 
            const dealId=
                RS.createDealId(
                    dayKey,
                    offer.npc.normalizedName,
                    profitIndex,
                    gift.name
                );
 
            offer.gifts.push(
                Object.assign(
                    {},
                    gift,
                    {
 
                        merchantName:
                            offer.npc.name,
 
                        merchantKey:
                            offer.npc.normalizedName,
 
                        marketPrice:
                            price,
 
                        isProfitDeal:
                            true,
 
                        originalProfitPrice:
                            price,
 
                        dealId
                    }
                )
            );
 
            usedGiftNames.add(
                RS.normalizeText(
                    gift.name
                )
            );
 
            profitIndex++;
 
            placed=true;
 
            break;
        }
 
        if(!placed){
            break;
        }
    }
 
    let poolIndex=0;
 
 
    function getNextUnusedGift(){
 
        while(
            poolIndex <
            allPool.length
        ){
 
            const gift=
                allPool[
                    poolIndex++
                ];
 
            const key=
                RS.normalizeText(
                    gift.name
                );
 
            if(
                usedGiftNames.has(
                    key
                )
            ){
 
                continue;
            }
 
            usedGiftNames.add(
                key
            );
 
            return gift;
        }
 
        return null;
    }
 
 
    offers.forEach(
        function(offer){
 
            if(
                offer.gifts.length
            ){
 
                return;
            }
 
            const gift=
                getNextUnusedGift();
 
            if(!gift){
                return;
            }
 
            offer.gifts.push(
                Object.assign(
                    {},
                    gift,
                    {
 
                        merchantName:
                            offer.npc.name,
 
                        merchantKey:
                            offer.npc.normalizedName,
 
                        marketPrice:
                            getNormalMarketPrice(
                                gift,
                                dayKey,
                                offer.npc.normalizedName
                            ),
 
                        isProfitDeal:
                            false
                    }
                )
            );
        }
    );
 
    let progress=true;
 
    while(progress){
 
        progress=false;
 
        for(
            let i=0;
            i<offers.length;
            i++
        ){
 
            const offer=
                offers[i];
 
            const max=
                isSpecialMerchant(
                    offer.npc
                )
                ?
                CONFIG.maxSpecialGiftPerMerchant
                :
                CONFIG.maxGiftPerMerchant;
 
            if(
                offer.gifts.length >=
                max
            ){
 
                continue;
            }
 
            const random=
                seededRandom(
                    hashText(
                        dayKey+
                        "|extra-count|"+
                        offer.npc.normalizedName
                    )
                );
 
            const desired=
                CONFIG.minGiftPerMerchant+
                Math.floor(
                    random()*
                    (
                        max-
                        CONFIG.minGiftPerMerchant+
                        1
                    )
                );
 
            if(
                offer.gifts.length >=
                desired
            ){
 
                continue;
            }
 
            const gift=
                getNextUnusedGift();
 
            if(!gift){
 
                return offers;
            }
 
            offer.gifts.push(
                Object.assign(
                    {},
                    gift,
                    {
 
                        merchantName:
                            offer.npc.name,
 
                        merchantKey:
                            offer.npc.normalizedName,
 
                        marketPrice:
                            getNormalMarketPrice(
                                gift,
                                dayKey,
                                offer.npc.normalizedName
                            ),
 
                        isProfitDeal:
                            false
                    }
                )
            );
 
            progress=true;
        }
    }
 
    return offers;
}
 
 
/* =========================================================
   PROFIT USED
========================================================= */
 
function hasStudentUsedProfitDeal(gift){
 
    if(
        !state.student ||
        !gift.isProfitDeal
    ){
 
        return false;
    }
 
    if(!gift.dealId){
        return false;
    }
 
    return state.transactions.some(
        function(transaction){
 
            return(
                transaction.accountingStatus ===
                "valid"
 
                &&
 
                String(
                    transaction.dealId ||
                    ""
                )
                ===
                String(
                    gift.dealId
                )
            );
        }
    );
}
 
 
function getEffectiveGiftForStudent(gift){
 
    if(
        !gift.isProfitDeal ||
        !hasStudentUsedProfitDeal(
            gift
        )
    ){
 
        return Object.assign(
            {},
            gift,
            {
                profitConsumed:false
            }
        );
    }
 
    const reward=
        getGemRewardInfo(
            gift
        );
 
    const equivalent=
        getHongEquivalent(
            reward
        );
 
    const lossPrice=
        Math.max(
 
            Number(
                gift.correctPrice ||
                1
            ),
 
            Math.ceil(
                equivalent
            )+
            1
        );
 
    return Object.assign(
        {},
        gift,
        {
 
            marketPrice:
                lossPrice,
 
            isProfitDeal:
                false,
 
            profitConsumed:
                true,
 
            dealId:""
        }
    );
}
 
 
/* =========================================================
   PRICE STATUS
========================================================= */
 
function getPriceStatus(gift){
 
    const correct=
        Math.max(
            1,
            Number(
                gift.correctPrice ||
                gift.cost ||
                1
            )
        );
 
    const market=
        Math.max(
            1,
            Number(
                gift.marketPrice ||
                correct
            )
        );
 
    if(
        market <
        correct
    ){
 
        return{
 
            type:"discount",
 
            percent:
                Math.round(
                    (
                        1-
                        market/
                        correct
                    )
                    *
                    100
                )
        };
    }
 
    if(
        market >
        correct
    ){
 
        return{
            type:"higher",
            percent:0
        };
    }
 
    return{
        type:"correct",
        percent:0
    };
}
 
 
/* =========================================================
   NPC IMAGE
========================================================= */
 
function createNpcImage(npc){
 
    if(!npc.image){
 
        const fallback=
            document.createElement(
                "div"
            );
 
        fallback.className=
            "rx-avatar-fallback";
 
        fallback.textContent=
            ICONS.user;
 
        return fallback;
    }
 
    const img=
        document.createElement(
            "img"
        );
 
    img.className=
        "rx-avatar";
 
    img.src=
        RS.convertDriveImageUrl(
            npc.image,
            300
        );
 
    img.alt=
        npc.name;
 
    img.loading=
        "lazy";
 
    img.decoding=
        "async";
 
    img.addEventListener(
        "error",
        function(){
 
            const fallback=
                document.createElement(
                    "div"
                );
 
            fallback.className=
                "rx-avatar-fallback";
 
            fallback.textContent=
                ICONS.user;
 
            this.replaceWith(
                fallback
            );
        }
    );
 
    return img;
}
 
 
/* =========================================================
   MARKET CARD
========================================================= */
 
function createMarketGiftCard(
    rawGift,
    npc
){
 
    const gift=
        getEffectiveGiftForStudent(
            rawGift
        );
 
    const status=
        getPriceStatus(
            gift
        );
 
    const reward=
        getGemRewardInfo(
            gift
        );
 
    const isMysteryBox=
        typeof RS.isMysteryBoxGiftName ===
        "function"
        ?
        RS.isMysteryBoxGiftName(
            gift.name
        )
        :
        false;
 
    const card=
        document.createElement(
            "div"
        );
 
    card.className=
        "rx-gift";
 
    const themeClass=
        getRarityThemeClass(
            gift
        );
 
    if(themeClass){
 
        card.classList.add(
            themeClass
        );
    }
 
    if(isMysteryBox){
 
        const badge=
            document.createElement(
                "div"
            );
 
        badge.className=
            "rx-mystery-badge";
 
        badge.textContent=
            UI.mystery+
            " VẬT PHẨM NGẪU NHIÊN";
 
        card.appendChild(
            badge
        );
    }
 
    const imageBox=
        document.createElement(
            "div"
        );
 
    imageBox.className=
        "rx-gift-img-wrap";
 
    if(gift.image){
 
        const img=
            document.createElement(
                "img"
            );
 
        img.src=
            RS.convertDriveImageUrl(
                gift.image,
                500
            );
 
        img.alt=
            gift.name;
 
        img.loading=
            "lazy";
 
        img.decoding=
            "async";
 
        img.addEventListener(
            "error",
            function(){
 
                imageBox.innerHTML="";
 
                imageBox.textContent=
                    isMysteryBox
                    ?
                    UI.mystery
                    :
                    ICONS.gift;
            }
        );
 
        imageBox.appendChild(
            img
        );
 
    }else{
 
        imageBox.textContent=
            isMysteryBox
            ?
            UI.mystery
            :
            ICONS.gift;
    }
 
    card.appendChild(
        imageBox
    );
 
    const nameLine=
        document.createElement(
            "div"
        );
 
    nameLine.className=
        "rx-gift-name-line";
 
    const name=
        document.createElement(
            "span"
        );
 
    name.className=
        "rx-gift-name";
 
    name.textContent=
        gift.name;
 
    nameLine.appendChild(
        name
    );
 
    /* v4.9.10: thẻ Chợ phiên không hiện biểu tượng linh thạch phẩm cấp cạnh tên vật phẩm */
 
    card.appendChild(
        nameLine
    );
 
    const rarityBadge=
        createRarityBadge(
            gift,
            "market"
        );
 
    if(rarityBadge){
 
        card.appendChild(
            rarityBadge
        );
    }
 
    const description=
        document.createElement(
            "div"
        );
 
    description.className=
        "rx-gift-desc";
 
    description.textContent=
        gift.description ||
        (
            isMysteryBox
            ?
            "Mở ra một phần thưởng ngẫu nhiên."
            :
            "Vật phẩm tại Chợ phiên."
        );
 
    card.appendChild(
        description
    );
 
    if(reward){
 
        const preview=
            document.createElement(
                "div"
            );
 
        preview.className=
            "rx-reward-preview";
 
        preview.textContent=
            "Nhận "+
            RS.formatNumber(
                reward.amount
            )+
            " "+
            GEM_TYPES[
                reward.gemType
            ].displayName;
 
        card.appendChild(
            preview
        );
    }
 
    if(
        status.type ===
        "discount"
    ){
 
        const saleArea=
            document.createElement(
                "div"
            );
 
        saleArea.className=
            "rx-sale-area";
 
        const sale=
            document.createElement(
                "span"
            );
 
        sale.className=
            "rx-sale-badge";
 
        sale.textContent=
            UI.sale+
            " KHUYẾN MÃI -"+
            status.percent+
            "%";
 
        const oldPrice=
            document.createElement(
                "span"
            );
 
        oldPrice.className=
            "rx-old-price";
 
        oldPrice.textContent=
            "Giá chuẩn: ";
 
        const oldStrong=
            document.createElement(
                "strong"
            );
 
        oldStrong.textContent=
            RS.formatNumber(
                gift.correctPrice
            );
 
        oldPrice.appendChild(
            oldStrong
        );
 
        saleArea.appendChild(
            sale
        );
 
        saleArea.appendChild(
            oldPrice
        );
 
        card.appendChild(
            saleArea
        );
    }
 
    const button=
        document.createElement(
            "button"
        );
 
    button.className=
        "rx-exchange";
 
    button.type=
        "button";
 
    const action=
        document.createElement(
            "span"
        );
 
    action.className=
        "rx-exchange-action";
 
    action.textContent=
        isMysteryBox
        ?
        "ĐỔI HỘP QUÀ"
        :
        reward
        ?
        "ĐỔI LINH THẠCH"
        :
        "ĐỔI QUÀ";
 
    const priceBox=
        document.createElement(
            "span"
        );
 
    priceBox.className=
        "rx-exchange-price";
 
    priceBox.appendChild(
        createGemImage(
            HONG_KEY,
            "rx-price-gem"
        )
    );
 
    const amount=
        document.createElement(
            "span"
        );
 
    amount.textContent=
        RS.formatNumber(
            gift.marketPrice
        );
 
    priceBox.appendChild(
        amount
    );
 
    button.appendChild(
        action
    );
 
    button.appendChild(
        priceBox
    );
 
    button.addEventListener(
        "click",
        function(){
 
            requestExchange(
                gift,
                npc
            );
        }
    );
 
    card.appendChild(
        button
    );
 
    return card;
}
 
 
/* =========================================================
   RENDER MARKET
========================================================= */
 
function renderMarket(){
 
    const grid=
        el(
            "rxNpcGrid"
        );
 
    if(!grid){
        return;
    }
 
    grid.innerHTML="";
 
    const fragment=
        document.createDocumentFragment();
 
    state.offers.forEach(
        function(offer){
 
            const card=
                document.createElement(
                    "article"
                );
 
            card.className=
                "rx-card";
 
            if(
                isSpecialMerchant(
                    offer.npc
                )
            ){
 
                card.classList.add(
                    "special-merchant"
                );
            }
 
            card.appendChild(
                createNpcImage(
                    offer.npc
                )
            );
 
            const name=
                document.createElement(
                    "div"
                );
 
            name.className=
                "rx-npc-name";
 
            name.textContent=
                offer.npc.name;
 
            card.appendChild(
                name
            );
 
            const description=
                document.createElement(
                    "div"
                );
 
            description.className=
                "rx-npc-desc";
 
            description.textContent=
                offer.npc.description ||
                "Thương nhân ghé Chợ phiên hôm nay.";
 
            card.appendChild(
                description
            );
 
            const list=
                document.createElement(
                    "div"
                );
 
            list.className=
                "rx-offer-list";
 
            offer.gifts.forEach(
                function(gift){
 
                    list.appendChild(
                        createMarketGiftCard(
                            gift,
                            offer.npc
                        )
                    );
                }
            );
 
            card.appendChild(
                list
            );
 
            fragment.appendChild(
                card
            );
        }
    );
 
    grid.appendChild(
        fragment
    );
}
 
 
/* =========================================================
   MARKET FETCH ONE ATTEMPT
========================================================= */
 
async function fetchMarketAttempt(
    attempt
){
 
    const npcBaseUrl=
        RS.sheetCsvUrl(
            CONFIG.npcGid
        );
 
    const giftBaseUrl=
        RS.sheetCsvUrl(
            RS.CONFIG.giftGid
        );
 
 
    /*
       Mỗi attempt tạo URL khác nhau.
       Điều này rất quan trọng nếu Core/browser
       đã giữ một request lỗi trước đó.
    */
 
    const npcUrl=
        addCacheBuster(
            npcBaseUrl,
            attempt
        );
 
    const giftUrl=
        addCacheBuster(
            giftBaseUrl,
            attempt
        );
 
 
    const results=
        await Promise.all([
 
            withTimeout(
 
                RS.fetchRows(
                    npcUrl
                ),
 
                CONFIG.marketFetchTimeout,
 
                "Danh sách thương nhân"
 
            ),
 
            withTimeout(
 
                RS.fetchRows(
                    giftUrl
                ),
 
                CONFIG.marketFetchTimeout,
 
                "Danh sách quà tặng"
 
            )
        ]);
 
 
    const npcRows=
        results[0];
 
    const giftRows=
        results[1];
 
 
    if(
        !Array.isArray(
            npcRows
        )
        ||
        npcRows.length < 2
    ){
 
        throw new Error(
            "Sheet thương nhân chưa trả dữ liệu hợp lệ."
        );
    }
 
 
    if(
        !Array.isArray(
            giftRows
        )
        ||
        giftRows.length < 2
    ){
 
        throw new Error(
            "Sheet QuaTang chưa trả dữ liệu hợp lệ."
        );
    }
 
 
    const npcs=
        mapNpcRows(
            npcRows
        );
 
 
    if(
        !npcs.length
    ){
 
        throw new Error(
            "Không đọc được danh sách thương nhân."
        );
    }
 
 
    const gifts=
        RS.mapGiftRows(
            giftRows
        );
 
 
    if(
        !Array.isArray(
            gifts
        )
        ||
        !gifts.length
    ){
 
        throw new Error(
            "Không đọc được danh sách quà tặng."
        );
    }
 
 
    return{
        npcs,
        gifts
    };
}
 
 
/* =========================================================
   LOAD MARKET
   AUTO RETRY
========================================================= */
 
async function loadMarket(){
 
    if(
        state.marketLoaded
    ){
 
        return true;
    }
 
 
    if(
        state.marketPromise
    ){
 
        return state.marketPromise;
    }
 
 
    state.marketLoading=
        true;
 
 
    state.day=
        getVietnamDate();
 
 
    el("marketDayLabel")
    .textContent=
        "Phiên chợ ngày "+
        state.day.label;
 
 
    state.marketPromise=
        (async function(){
 
            let lastError=null;
 
 
            for(
                let attempt=1;
                attempt<=CONFIG.marketRetryCount;
                attempt++
            ){
 
                try{
 
                    if(
                        attempt === 1
                    ){
 
                        showMessage(
                            "rxMarketMessage",
                            "Đang gọi các thương nhân...",
                            "loading"
                        );
 
                    }else{
 
                        showMessage(
                            "rxMarketMessage",
                            "Kết nối chưa ổn định, hệ thống đang thử lại lần "+
                            attempt+
                            "/"+
                            CONFIG.marketRetryCount+
                            "...",
                            "loading"
                        );
                    }
 
 
                    const result=
                        await fetchMarketAttempt(
                            attempt
                        );
 
 
                    /*
                       Chỉ cập nhật state SAU KHI
                       cả 2 sheet đều thành công.
                    */
 
                    state.gifts=
                        result.gifts;
 
 
                    rebuildGiftMap();
 
 
                    const selectedNpcs=
                        selectDailyNpcs(
                            result.npcs,
                            state.day.key
                        );
 
 
                    const offers=
                        distributeDailyGifts(
                            result.gifts,
                            selectedNpcs,
                            state.day.key
                        );
 
 
                    if(
                        !offers.length
                    ){
 
                        throw new Error(
                            "Không tạo được phiên chợ hôm nay."
                        );
                    }
 
 
                    state.offers=
                        offers;
 
 
                    state.marketLoaded=
                        true;
 
 
                    renderMarket();
 
 
                    const marketMessage=
                        el(
                            "rxMarketMessage"
                        );
 
 
                    marketMessage.style.display=
                        "none";
 
 
                    console.log(
                        "[Market v4.9L-R1] Loaded on attempt:",
                        attempt
                    );
 
 
                    return true;
 
                }catch(error){
 
                    lastError=
                        error;
 
 
                    console.warn(
                        "[Market v4.9L-R1] Attempt "+
                        attempt+
                        " failed:",
                        error
                    );
 
 
                    /*
                       Nếu chưa phải lần cuối,
                       chờ một chút rồi tự thử lại.
                    */
 
                    if(
                        attempt <
                        CONFIG.marketRetryCount
                    ){
 
                        await sleep(
                            CONFIG.marketRetryDelay*
                            attempt
                        );
                    }
                }
            }
 
 
            /*
               Đã thử hết số lần.
               Không khoá hệ thống.
               Người dùng có thể đóng/mở để chạy
               một chu kỳ retry mới.
            */
 
            state.marketLoaded=
                false;
 
 
            state.offers=
                [];
 
 
            el("rxNpcGrid")
            .innerHTML=
                "";
 
 
            showMessage(
                "rxMarketMessage",
                "Chưa kết nối được Chợ phiên. Hãy đóng rồi mở Chợ phiên để hệ thống tự thử lại, không cần tải lại trang.",
                "error"
            );
 
 
            console.error(
                "[Market v4.9L-R1] Failed after retries:",
                lastError
            );
 
 
            return false;
 
        })()
        .finally(
            function(){
 
                state.marketLoading=
                    false;
 
                state.marketPromise=
                    null;
            }
        );
 
 
    return state.marketPromise;
}
 
 
/* =========================================================
   EXCHANGE
========================================================= */
 
function requestExchange(
    gift,
    npc
){
 
    if(!state.student){

        alert(
            "Hãy tra cứu hồ sơ học viên trước khi đổi quà."
        );

        return;
    }

    if(state.assetsStale){

        alert(
            "Đang cập nhật số dư mới nhất, vui lòng chờ vài giây rồi đổi quà."
        );

        return;
    }
 
    if(state.submitting){
        return;
    }
 
    const marketPrice=
        Math.max(
            1,
            Number(
                gift.marketPrice ||
                0
            )
        );
 
    const balance=
        Number(
            state.student.gems[
                HONG_KEY
            ] ||
            0
        );
 
    if(
        balance <
        marketPrice
    ){
 
        alert(
            "Bạn chưa đủ Hồng Ngọc.\n\n"+
            "Giá: "+
            RS.formatNumber(
                marketPrice
            )+
            " Hồng Ngọc\n"+
            "Hiện có: "+
            RS.formatNumber(
                balance
            )+
            " Hồng Ngọc"
        );
 
        return;
    }
 
    const reward=
        getGemRewardInfo(
            gift
        );
 
    const transactionDealId=
        (
            gift.isProfitDeal &&
            gift.dealId
        )
        ?
        gift.dealId
        :
        createPurchaseDealId();
 
    let formGiftValue;
 
    if(
        typeof RS.createFormGiftValue ===
        "function"
    ){
 
        formGiftValue=
            RS.createFormGiftValue(
                gift.name,
                marketPrice,
                transactionDealId
            );
 
    }else{
 
        formGiftValue=
            gift.name+
            " [PRICE:"+
            marketPrice+
            "] [DEAL:"+
            transactionDealId+
            "]";
    }
 
    state.selectedGift=
        Object.assign(
            {},
            gift,
            {
 
                marketPrice,
 
                merchantName:
                    npc.name,
 
                rewardInfo:
                    reward,
 
                transactionDealId,
 
                formGiftValue,
 
                isMysteryBox:
                    typeof RS.isMysteryBoxGiftName ===
                    "function"
                    ?
                    RS.isMysteryBoxGiftName(
                        gift.name
                    )
                    :
                    false
            }
        );
 
    renderExchangeTicket(
        state.selectedGift
    );
 
    el("rxModal")
    .style.display=
        "flex";
}
 
 
/* =========================================================
   TICKET
========================================================= */
 
function addTicketRow(
    container,
    label,
    value
){
 
    const row=
        document.createElement(
            "div"
        );
 
    row.className=
        "rx-ticket-row";
 
    const labelElement=
        document.createElement(
            "div"
        );
 
    labelElement.className=
        "rx-ticket-label";
 
    labelElement.textContent=
        label;
 
    const valueElement=
        document.createElement(
            "div"
        );
 
    valueElement.className=
        "rx-ticket-value";
 
    valueElement.textContent=
        value;
 
    row.appendChild(
        labelElement
    );
 
    row.appendChild(
        valueElement
    );
 
    container.appendChild(
        row
    );
}
 
 
function addTicketRarityRow(
    container,
    gift
){
 
    const rarity=
        getItemRarityInfo(
            gift
        );
 
    if(
        !rarity ||
        !rarity.gemType ||
        !GEM_TYPES[
            rarity.gemType
        ]
    ){
 
        return;
    }
 
    const row=
        document.createElement(
            "div"
        );
 
    row.className=
        "rx-ticket-row";
 
    const label=
        document.createElement(
            "div"
        );
 
    label.className=
        "rx-ticket-label";
 
    label.textContent=
        "Độ hiếm";
 
    const value=
        document.createElement(
            "div"
        );
 
    value.className=
        "rx-ticket-value";
 
    const rarityWrap=
        document.createElement(
            "span"
        );
 
    rarityWrap.className=
        "rx-ticket-rarity";
 
    rarityWrap.appendChild(
        createGemImage(
            rarity.gemType,
            ""
        )
    );
 
    const text=
        document.createElement(
            "span"
        );
 
    text.textContent=
        rarity.displayName;
 
    rarityWrap.appendChild(
        text
    );
 
    value.appendChild(
        rarityWrap
    );
 
    row.appendChild(
        label
    );
 
    row.appendChild(
        value
    );
 
    container.appendChild(
        row
    );
}
 
 
function renderExchangeTicket(gift){
 
    const ticket=
        el(
            "rxTicket"
        );
 
    ticket.innerHTML="";
 
    const notice=
        el(
            "rxTicketNotice"
        );
 
    notice.className=
        "rx-ticket-notice";
 
    if(gift.isMysteryBox){
 
        notice.classList.add(
            "mystery"
        );
 
        notice.textContent=
            "Xác nhận đổi Hộp quà bí ẩn.";
 
    }else{
 
        notice.textContent=
            "Kiểm tra thông tin trước khi xác nhận giao dịch.";
    }
 
    const heading=
        document.createElement(
            "div"
        );
 
    heading.className=
        "rx-ticket-heading";
 
    heading.textContent=
        "YÊU CẦU ĐỔI QUÀ";
 
    ticket.appendChild(
        heading
    );
 
    addTicketRow(
        ticket,
        "Họ tên",
        state.student.name
    );
 
    addTicketRow(
        ticket,
        "Mã học viên",
        state.student.code
    );
 
    addTicketRow(
        ticket,
        "Thương nhân",
        gift.merchantName
    );
 
    addTicketRow(
        ticket,
        "Món quà",
        gift.name
    );
 
    addTicketRarityRow(
        ticket,
        gift
    );
 
    addTicketRow(
        ticket,
        "Giá đổi",
        RS.formatNumber(
            gift.marketPrice
        )+
        " Hồng Ngọc"
    );
 
    if(
        gift.rewardInfo
    ){
 
        addTicketRow(
            ticket,
            "Nhận",
            RS.formatNumber(
                gift.rewardInfo.amount
            )+
            " "+
            GEM_TYPES[
                gift.rewardInfo.gemType
            ].displayName
        );
    }
 
    el("rxFormHelp").textContent=
        state.isAdmin
        ?
        "ADMIN là tài khoản kiểm thử nhưng giao dịch này vẫn được gửi thật vào hệ thống."
        :
        "Giao dịch sẽ được gửi trực tiếp và kiểm tra lại trước khi thông báo kết quả.";
 
    const button=
        el(
            "rxConfirmFormButton"
        );
 
    button.disabled=
        false;
 
    button.textContent=
        "XÁC NHẬN ĐỔI QUÀ";
}
 
 
/* =========================================================
   v4.9.8: GHI THẲNG VÀO SHEET QUA APPS SCRIPT (không qua Google Form)
   - Thành công / đã có sẵn (trùng DEAL)  -> "sent"
   - Máy chủ trả lỗi rõ ràng (chưa ghi)   -> "notsent"  (dùng Google Form dự phòng)
   - Mất mạng / quá giờ (không rõ đã ghi) -> "unknown"  (kiểm tra Sheet trước khi gửi Form)
========================================================= */

async function postAppendItems(items){

    const url=
        RS.CONFIG &&
        RS.CONFIG.appsScriptUrl;

    if(!url){
        return {ok:false,error:"Chưa cấu hình Apps Script."};
    }

    const ac=new AbortController();
    const timer=setTimeout(function(){ ac.abort(); },20000);

    try{
        const res=await fetch(url,{
            method:"POST",
            body:JSON.stringify({action:"append",items:items}),
            headers:{"Content-Type":"text/plain;charset=utf-8"},
            credentials:"omit",
            cache:"no-store",
            signal:ac.signal
        });
        return JSON.parse(await res.text());
    }finally{
        clearTimeout(timer);
    }
}

/* v4.9.9: Code.gs chưa nhận kind "exchange" -> nhớ 1 giờ, gửi thẳng Google Form, không gọi Apps Script thừa */
const EXCHANGE_KIND_KEY="srcApiNoKind_v447";
function exchangeKindBlocked(){
    try{ const m=JSON.parse(window.localStorage.getItem(EXCHANGE_KIND_KEY)||"{}"); return Date.now()<Number(m.exchange||0); }catch(e){ return false; }
}
function blockExchangeKind(){
    try{ const m=JSON.parse(window.localStorage.getItem(EXCHANGE_KIND_KEY)||"{}"); m.exchange=Date.now()+3600000; window.localStorage.setItem(EXCHANGE_KIND_KEY,JSON.stringify(m)); }catch(e){}
}

async function submitExchangeViaApi(gift){

    if(exchangeKindBlocked()) return "notsent";

    const row=[
        "",
        state.student.name || "",
        state.student.code,
        gift.formGiftValue,
        RS.CONFIG.formConfirmValue
    ];

    for(let attempt=0;attempt<3;attempt++){
        try{
            const t0=Date.now();
            const json=await postAppendItems([{kind:"exchange",row:row}]);
            console.info("[Direct Exchange] Apps Script "+(Date.now()-t0)+"ms:",json);
            if(json && json.ok){
                const w=json.written && json.written.exchange || 0;
                const d=json.dup && json.dup.exchange || 0;
                return (w || d) ? "sent" : "notsent";
            }
            if(json && json.ok===false && /lo[aạ]i d[uữ] li[eệ]u ghi kh[oô]ng h[oợ]p l[eệ]/i.test(String(json.error||""))){
                blockExchangeKind();
                return "notsent";
            }
            if(json && json.busy && attempt<2){
                await sleep(1500);
                continue;
            }
            return "notsent";
        }catch(error){
            console.warn("[Direct Exchange] Apps Script lỗi:",error && error.message || error);
            if(attempt<1){
                await sleep(1200);
                continue;
            }
            return "unknown";
        }
    }
    return "notsent";
}


/* =========================================================
   DIRECT GOOGLE FORM
========================================================= */
 
function submitGoogleFormDirect(gift){
 
    const form=
        document.createElement(
            "form"
        );
 
    form.method=
        "POST";
 
    form.action=
        CONFIG.googleFormPostUrl;
 
    form.target=
        "rxHiddenFormFrame";
 
    form.style.display=
        "none";
 
 
    function addField(
        name,
        value
    ){
 
        const input=
            document.createElement(
                "input"
            );
 
        input.type=
            "hidden";
 
        input.name=
            name;
 
        input.value=
            String(
                value === undefined ||
                value === null
                ?
                ""
                :
                value
            );
 
        form.appendChild(
            input
        );
    }
 
 
    addField(
        CONFIG.formEntryName,
        state.student.name
    );
 
    addField(
        CONFIG.formEntryStudentCode,
        state.student.code
    );
 
    addField(
        CONFIG.formEntryGiftName,
        gift.formGiftValue
    );
 
    addField(
        CONFIG.formEntryConfirm,
        RS.CONFIG.formConfirmValue
    );
 
    document.body.appendChild(
        form
    );
 
    form.submit();
 
    setTimeout(
        function(){
 
            form.remove();
 
        },
        2000
    );
}
 
 
/* =========================================================
   FIND DEAL
========================================================= */
 
function findRawTransactionByDeal(
    shared,
    code,
    dealId
){
 
    const normalizedCode=
        RS.normalizeCode(
            code
        );
 
    let transactions=[];
 
    if(
        shared.marketRedemptionMap &&
        shared.marketRedemptionMap.get(
            normalizedCode
        )
    ){
 
        transactions=
            shared.marketRedemptionMap
            .get(
                normalizedCode
            );
 
    }else if(
        shared.responses
    ){
 
        transactions=
            shared.responses.filter(
                function(item){
 
                    return(
                        RS.normalizeCode(
                            item.code
                        )
                        ===
                        normalizedCode
                    );
                }
            );
    }
 
    return transactions.find(
        function(item){
 
            return(
                String(
                    item.dealId ||
                    ""
                )
                ===
                String(
                    dealId ||
                    ""
                )
            );
        }
    )
    ||
    null;
}
 
 
/* =========================================================
   REFRESH ACCOUNT
========================================================= */
 
async function rebuildStudentFromShared(shared){

    if(!state.student){
        return null;
    }

    /*
       ADMIN là ngoại lệ có vốn gốc 1000 Hồng Ngọc.
       Giữ replay legacy riêng cho tài khoản kiểm thử này.
    */
    if(state.isAdmin){

        const currentPanel=
            state.activeProfilePanel;

        const reward=
            createAdminReward();

        const account=
            calculateStudentAccount(
                reward,
                shared,
                state.student.code
            );

        state.reward=reward;
        state.rawTransactions=account.rawTransactions;
        state.transactions=
            account.accounting.validTransactions || [];
        state.ownedItems=account.ownedItems;
        state.student.gems=account.gems;

        if(shared && shared.gifts){
            state.gifts=shared.gifts;
            rebuildGiftMap();
        }

        renderProfile(
            state.student,
            state.ownedItems,
            state.reward
        );

        closeProfilePanels();

        if(currentPanel){
            toggleProfilePanel(currentPanel);
        }

        if(state.marketLoaded){
            renderMarket();
        }

        return account;
    }

    /*
       Học viên thật: Core dựng lại toàn bộ tài sản.
       shared chỉ còn dùng để xác minh DEAL và metadata Chợ phiên.
    */
    if(shared && shared.gifts){
        state.gifts=shared.gifts;
        rebuildGiftMap();
    }

    /* v4.9.11: dùng luôn dữ liệu chung vừa tải (còn trong bộ nhớ đệm của Core),
       không bắt Core tải lại toàn bộ lần nữa như refreshCanonicalAssets() */
    const profile=
        await loadCanonicalStudentProfile(
            state.student.code,
            false
        );

    renderCanonicalAssets(
        profile
    );

    try{
        window.dispatchEvent(
            new CustomEvent(
                "ocdRewardProfileChanged",
                {detail:{code:RS.normalizeCode(state.student.code),profile:profile,source:"market"}}
            )
        );
    }catch(eventError){}

    return profile;
}/* =========================================================
   VERIFY EXCHANGE
========================================================= */
 
async function verifyDirectExchange(
    selectedGift,
    fast,
    tries
){
 
    for(
        let attempt=0;
        attempt<(tries || CONFIG.verifyTries);
        attempt++
    ){
 
        /* v4.9.8: đã ghi thẳng vào Sheet -> kiểm tra ngay, không chờ */
        if(!(fast && attempt===0)){
            await sleep(
                fast ? 1000 : CONFIG.verifyInterval
            );
        }
 
        try{
 
            const shared=
                await RS.loadSharedRewardData(
                    true
                );
 
            const raw=
                findRawTransactionByDeal(
                    shared,
                    state.student.code,
                    selectedGift
                    .transactionDealId
                );
 
            if(!raw){
 
                continue;
            }
 
            try{
 
                await rebuildStudentFromShared(
                    shared
                );
 
            }catch(refreshError){
 
                console.warn(
                    "[Profile refresh after exchange]",
                    refreshError
                );
            }
 
            return{
                success:true,
                raw
            };
 
        }catch(error){
 
            console.warn(
                "[Verify Exchange]",
                error
            );
        }
    }
 
    return{
        success:false
    };
}
 
 
/* =========================================================
   v4.9.11: HIỂN THỊ NGAY SAU KHI APPS SCRIPT XÁC NHẬN ĐÃ GHI
   Apps Script chỉ trả "đã ghi" sau khi dòng PhieuDoi nằm trong Sheet,
   nên trang trừ Hồng Ngọc + thêm vật phẩm ngay, rồi đồng bộ lại ở nền.
========================================================= */

function vnNowStamp(){

    const d=new Date();
    const p=function(n){ return String(n).padStart(2,"0"); };

    return p(d.getDate())+"/"+p(d.getMonth()+1)+"/"+d.getFullYear()+" "+
        p(d.getHours())+":"+p(d.getMinutes())+":"+p(d.getSeconds());
}

function applyOptimisticExchange(gift){

    if(!state.student || !gift){
        return;
    }

    const price=
        Number(gift.marketPrice || 0);

    const gems=
        Object.assign({},state.student.gems || {});

    gems[HONG_KEY]=
        Math.max(0,Number(gems[HONG_KEY] || 0)-price);

    const reward=
        gift.rewardInfo || getGemRewardInfo(gift);

    if(reward && reward.gemType){
        gems[reward.gemType]=
            Number(gems[reward.gemType] || 0)+Number(reward.amount || 0);
    }

    state.student.gems=gems;

    if(!reward && !gift.isMysteryBox){

        state.ownedItems=
            (state.ownedItems || []).concat([{
                timestamp:vnNowStamp(),
                code:state.student.code,
                dealId:gift.transactionDealId || "",
                giftName:gift.name,
                gift:gift,
                image:gift.image || "",
                description:gift.description || "",
                rarity:gift.rarity || null,
                quantity:1,
                optimistic:true
            }]);
    }

    const currentPanel=
        state.activeProfilePanel;

    renderProfile(
        state.student,
        state.ownedItems,
        state.reward
    );

    closeProfilePanels();

    if(currentPanel){
        toggleProfilePanel(currentPanel);
    }

    if(state.marketLoaded){
        renderMarket();
    }
}

async function syncAfterDirectExchange(gift){

    state.exchangeSyncing=true;

    try{

        /* Apps Script ưu tiên (Core v4.4.8 chờ lâu hơn trước khi dùng CSV); thử tối đa 6 lần */
        const result=
            await verifyDirectExchange(
                gift,
                true,
                6
            );

        if(!result.success){
            console.warn(
                "[Direct Exchange] Chưa đọc lại được phiếu "+gift.transactionDealId+
                "; giữ số liệu tạm, Core sẽ tự cập nhật khi có dữ liệu mới."
            );
        }

    }catch(error){

        console.warn(
            "[Direct Exchange] Đồng bộ nền lỗi:",
            error
        );

    }finally{

        state.exchangeSyncing=false;
    }
}


/* =========================================================
   CONFIRM EXCHANGE
========================================================= */
 
async function confirmExchangeDirect(){
 
    if(
        state.submitting ||
        !state.student ||
        !state.selectedGift
    ){
 
        return;
    }
 
    const gift=
        state.selectedGift;

    if(state.exchangeSyncing || state.assetsStale){

        const syncNotice=
            el(
                "rxTicketNotice"
            );

        syncNotice.className=
            "rx-ticket-notice";

        syncNotice.textContent=
            "Đang cập nhật túi đồ sau giao dịch trước, vui lòng chờ vài giây rồi bấm lại.";

        return;
    }
 
    const balance=
        Number(
            state.student.gems[
                HONG_KEY
            ] || 0
        );
 
    const price=
        Number(
            gift.marketPrice ||
            0
        );
 
    if(
        balance <
        price
    ){
 
        const notice=
            el(
                "rxTicketNotice"
            );
 
        notice.className=
            "rx-ticket-notice error";
 
        notice.textContent=
            "Giao dịch thất bại";
 
        return;
    }
 
    state.submitting=
        true;
 
    const button=
        el(
            "rxConfirmFormButton"
        );
 
    const notice=
        el(
            "rxTicketNotice"
        );
 
    button.disabled=
        true;
 
    button.textContent=
        "ĐANG XÁC NHẬN...";
 
    notice.className=
        "rx-ticket-notice";
 
    notice.textContent=
        "Đang xử lý giao dịch...";
 
    try{
 
        /* v4.9.8: Apps Script ghi thẳng vào PhieuDoi; lỗi thì quay về Google Form */
        const mode=
            await submitExchangeViaApi(
                gift
            );

        let result={success:false};

        if(mode==="sent"){

            /* Sheet đã có dòng PhieuDoi -> báo thành công ngay, đồng bộ lại ở nền */
            if(typeof RS.markDataFresh==="function"){
                RS.markDataFresh(90000);
            }

            applyOptimisticExchange(
                gift
            );

            syncAfterDirectExchange(
                gift
            );

            result={success:true};

        }else{

            if(mode==="unknown"){
                /* không rõ máy chủ đã ghi chưa -> xem Sheet trước để không bị ghi trùng */
                result=
                    await verifyDirectExchange(
                        gift,
                        true,
                        3
                    ).catch(function(){ return {success:false}; });
            }

            if(!result.success){
                submitGoogleFormDirect(
                    gift
                );

                result=
                    await verifyDirectExchange(
                        gift
                    );
            }
        }
 
        if(
            result.success
        ){
 
            notice.className=
                "rx-ticket-notice success";
 
            notice.textContent=
                "Giao dịch thành công";
 
            button.textContent=
                "ĐÃ HOÀN TẤT";
 
            showMessage(
                "rxMessage",
                "Giao dịch thành công",
                "success"
            );
 
            setTimeout(
                function(){
 
                    closeModal();
 
                },
                1200
            );
 
            return;
        }
 
        notice.className=
            "rx-ticket-notice error";
 
        notice.textContent=
            "Giao dịch thất bại";
 
        button.disabled=
            false;
 
        button.textContent=
            "THỬ LẠI";
 
    }catch(error){
 
        console.error(
            "[Direct Exchange]",
            error
        );
 
        notice.className=
            "rx-ticket-notice error";
 
        notice.textContent=
            "Giao dịch thất bại";
 
        button.disabled=
            false;
 
        button.textContent=
            "THỬ LẠI";
 
    }finally{
 
        state.submitting=
            false;
    }
}
 
 
/* =========================================================
   MODAL
========================================================= */
 
function closeModal(){
 
    if(state.submitting){
        return;
    }
 
    el("rxModal")
    .style.display=
        "none";
 
    state.selectedGift=
        null;
}
 
 
/* =========================================================
   FILE
========================================================= */
 
function getFirstUrl(value){
 
    const match=
        String(
            value ||
            ""
        )
        .match(
            /https?:\/\/[^\s,]+/i
        );
 
    return(
        match
        ?
        match[0]
        :
        ""
    );
}
 
 
function createFileElement(file){
 
    const container=
        document.createElement(
            "div"
        );
 
    container.className=
        "submission-image-container";
 
    const url=
        getFirstUrl(
            file
        );
 
    if(!url){
 
        container.textContent=
            file ||
            "Không có dữ liệu";
 
        return container;
    }
 
    const link=
        document.createElement(
            "a"
        );
 
    link.href=
        url;
 
    link.target=
        "_blank";
 
    link.rel=
        "noopener noreferrer";
 
    const img=
        document.createElement(
            "img"
        );
 
    img.className=
        "submission-image";
 
    img.src=
        RS.convertDriveImageUrl(
            url,
            1000
        );
 
    img.alt=
        "Ảnh bài tập";
 
    img.loading=
        "lazy";
 
    img.decoding=
        "async";
 
    img.addEventListener(
        "error",
        function(){
 
            container.innerHTML="";
 
            const fallback=
                document.createElement(
                    "a"
                );
 
            fallback.className=
                "file-link";
 
            fallback.href=
                url;
 
            fallback.target=
                "_blank";
 
            fallback.rel=
                "noopener noreferrer";
 
            fallback.textContent=
                "Xem bài tập";
 
            container.appendChild(
                fallback
            );
        }
    );
 
    link.appendChild(
        img
    );
 
    container.appendChild(
        link
    );
 
    const note=
        document.createElement(
            "div"
        );
 
    note.className=
        "submission-image-note";
 
    note.textContent=
        "Bấm vào ảnh để xem bản gốc";
 
    container.appendChild(
        note
    );
 
    return container;
}
 
 
/* =========================================================
   LAZY SUBMISSIONS
========================================================= */
 
function renderSubmissions(){
 
    if(
        state.submissionsRendered
    ){
 
        return;
    }
 
    const tbody=
        el(
            "submissionTableBody"
        );
 
    tbody.innerHTML="";
 
    const sorted=
        state.submissions
        .slice()
        .sort(
            function(a,b){
 
                const da=
                    RS.parseVietnameseDate(
                        a.timestamp
                    );
 
                const db=
                    RS.parseVietnameseDate(
                        b.timestamp
                    );
 
                if(
                    da &&
                    db &&
                    da.getTime() !==
                    db.getTime()
                ){
 
                    return(
                        db.getTime()-
                        da.getTime()
                    );
                }
 
                return(
                    b.originalIndex-
                    a.originalIndex
                );
            }
        );
 
    const fragment=
        document.createDocumentFragment();
 
    sorted.forEach(
        function(
            item,
            index
        ){
 
            const tr=
                document.createElement(
                    "tr"
                );
 
            const td1=
                document.createElement(
                    "td"
                );
 
            td1.textContent=
                index+1;
 
            td1.style.textAlign=
                "center";
 
            const td2=
                document.createElement(
                    "td"
                );
 
            td2.textContent=
                item.timestamp ||
                CHAR.dash;
 
            const td3=
                document.createElement(
                    "td"
                );
 
            td3.appendChild(
                createFileElement(
                    item.file
                )
            );
 
            const td4=
                document.createElement(
                    "td"
                );
 
            td4.style.textAlign=
                "center";
 
            const score=
                document.createElement(
                    "span"
                );
 
            if(
                String(
                    item.score ||
                    ""
                )
                .trim()
            ){
 
                score.className=
                    "score-box";
 
                score.textContent=
                    item.score;
 
            }else{
 
                score.className=
                    "score-empty";
 
                score.textContent=
                    "Chưa chấm";
            }
 
            td4.appendChild(
                score
            );
 
            const td5=
                document.createElement(
                    "td"
                );
 
            const comment=
                document.createElement(
                    "div"
                );
 
            if(
                String(
                    item.comment ||
                    ""
                )
                .trim()
            ){
 
                comment.className=
                    "comment-box";
 
                comment.textContent=
                    item.comment;
 
            }else{
 
                comment.className=
                    "comment-empty";
 
                comment.textContent=
                    "Chưa có nhận xét";
            }
 
            td5.appendChild(
                comment
            );
 
            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);
            tr.appendChild(td4);
            tr.appendChild(td5);
 
            fragment.appendChild(
                tr
            );
        }
    );
 
    tbody.appendChild(
        fragment
    );
 
    state.submissionsRendered=
        true;
}
 
 
/* =========================================================
   MESSAGE
========================================================= */
 
function showMessage(
    id,
    text,
    type
){
 
    const target=
        el(id);
 
    if(!target){
        return;
    }
 
    target.style.display=
        "";
 
    target.className=
        "rx-message "+
        type;
 
    target.textContent=
        text;
}
 
 
/* =========================================================
   CORE PROFILE CHANGE EVENT

   Minh Hồng và các module tương lai chỉ cần refresh Core.
   Nếu hồ sơ đang mở là cùng học viên, Tra cứu render ngay
   canonical profile mới mà không tự biết công thức module đó.
========================================================= */

function handleRewardProfileChanged(event){

    if(
        !state.student ||
        state.isAdmin
    ){
        return;
    }

    const detail=(
        event &&
        event.detail
    )
    ? event.detail
    : {};

    /* v4.9.11: sự kiện do chính trang này phát sau khi đã vẽ lại -> bỏ qua */
    if(detail.source==="market"){
        return;
    }

    const changedCode=
        RS.normalizeCode(
            detail.code ||
            (
                detail.profile &&
                detail.profile.code
            ) ||
            ""
        );

    const currentCode=
        RS.normalizeCode(
            state.student.code
        );

    if(
        changedCode &&
        changedCode !== currentCode
    ){
        return;
    }

    if(detail.profile){

        renderCanonicalAssets(
            detail.profile
        );

        return;
    }

    refreshCanonicalAssets()
    .catch(function(error){

        console.warn(
            "[Profile] Không thể đồng bộ tài sản từ Core:",
            error
        );
    });
}


/* =========================================================
   v4.10.0: TRANG CÁ NHÂN (tài khoản bảo mật)
   - Người khác tra cứu mã đã bảo mật: chỉ hiện DANH THIẾP
     (avatar · khung · nền chủ tài khoản đã chọn, họ tên, mã).
     Ẩn thông tin học tập, linh thạch, vật phẩm, Chợ phiên, phân tích.
   - Chủ tài khoản (đã đăng nhập): nút "Trang trí" để chọn avatar /
     khung / nền đang sở hữu; vật phẩm chưa sở hữu hiện mờ.
   - Mã chưa bảo mật: như cũ, kèm lời mời nâng cấp trong bảng Trang trí.
========================================================= */

const LOOK_KINDS=[
    {kind:"avatar",label:"Avatar",prefix:function(){ return RS.CONFIG.avatarGiftPrefix || "Thẻ đổi Avatar"; },size:300},
    {kind:"frame",label:"Khung",prefix:function(){ return RS.CONFIG.avatarFramePrefix || "Khung "; },size:300},
    {kind:"bg",label:"Nền hồ sơ",prefix:function(){ return RS.CONFIG.profileBackgroundPrefix || "Nền hồ sơ "; },size:600}
];

const LOOK_CSS=`
#rewardExchangeApp.rx-card-only .student-profile-actions,
#rewardExchangeApp.rx-card-only .rx-expand-panel,
#rewardExchangeApp.rx-card-only .market-toggle-wrap,
#rewardExchangeApp.rx-card-only #studentInsightSection{display:none!important}
.student-profile-module.card-only .student-profile-label::after{content:" · DANH THIẾP"}
.rx-card-note{margin:10px 0 0;padding:10px 12px;border-radius:10px;background:#f6efe2;border:1px solid #e3d5bd;color:#5a4a3a;font:13px/1.55 Arial,sans-serif}
.rx-card-note button{margin-top:8px;border:0;border-radius:999px;padding:8px 14px;background:#8b3328;color:#fffaf0;font:bold 12px Arial,sans-serif;cursor:pointer}
.look-panel-text{margin:0 0 10px;color:#6b5d4f;font:13px/1.55 Arial,sans-serif}
.look-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}
.look-tab{border:1px solid #e3d5bd;background:#fffaf2;color:#8b3328;border-radius:999px;padding:7px 13px;font:bold 12px Arial,sans-serif;cursor:pointer}
.look-tab.active{background:#8b3328;color:#fffaf0;border-color:#8b3328}
.look-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:10px}
.look-card{position:relative;display:flex;flex-direction:column;align-items:center;gap:6px;padding:8px 6px 9px;border:2px solid #eadfce;border-radius:12px;background:#fff;cursor:pointer;font:12px/1.35 Arial,sans-serif;color:#4b3325;text-align:center;min-width:0}
.look-card img{width:100%;aspect-ratio:1/1;object-fit:contain;border-radius:8px;background:#faf6ef}
.look-card.bg img{aspect-ratio:16/9;object-fit:cover}
.look-card.bg .look-none{aspect-ratio:16/9}
.look-card .look-none{width:100%;aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;border-radius:8px;background:#faf6ef;font-size:26px;color:#a8998a}
.look-card .look-name{overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;word-break:break-word}
.look-card.selected{border-color:#b45309;box-shadow:0 0 0 3px rgba(245,158,11,.25)}
.look-card.selected::after{content:"✓";position:absolute;top:4px;right:6px;width:20px;height:20px;border-radius:50%;background:#b45309;color:#fff;font:bold 12px/20px Arial,sans-serif}
.look-card.locked{cursor:not-allowed;opacity:.42;filter:grayscale(1)}
.look-card.locked .look-lock{font-size:10px;font-weight:bold;color:#78716c}
.look-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.look-actions button{flex:1;min-width:130px;border:0;border-radius:10px;padding:11px;font:bold 13px Arial,sans-serif;cursor:pointer}
.look-save{background:#8b3328;color:#fffaf0}
.look-save[disabled]{opacity:.6;cursor:wait}
.look-reset{background:#f1e6d3;color:#8b3328}
.look-msg{margin-top:9px;font:13px/1.5 Arial,sans-serif;min-height:1px}
.look-msg.err{color:#b91c1c}.look-msg.ok{color:#15803d}
`;

const lookState={kind:"avatar",draft:null,saving:false};

function authApi(){
    return window.OCDAuth && typeof window.OCDAuth.isMe==="function" ? window.OCDAuth : null;
}

function injectLookCss(){
    if(document.getElementById("rxLookStyle410")) return;
    const style=document.createElement("style");
    style.id="rxLookStyle410";
    style.textContent=LOOK_CSS;
    (document.head || document.documentElement).appendChild(style);
}

function giftImageByName(name,size){
    if(!name) return "";
    const gift=getCanonicalGiftByName(name);
    const image=gift && (gift.image || gift.icon);
    if(!image) return "";
    return typeof RS.convertDriveImageUrl==="function" ? RS.convertDriveImageUrl(image,size||500) : image;
}

function applyProfileBackground(url){
    const profile=el("studentProfileModule");
    profile.classList.remove("has-profile-background");
    profile.style.backgroundImage="";
    if(url){
        profile.style.backgroundImage='url("'+String(url).replace(/"/g,"%22")+'")';
        profile.classList.add("has-profile-background");
    }
}

function setCardMode(on){
    injectLookCss();
    const app=el("rewardExchangeApp");
    if(app) app.classList.toggle("rx-card-only",!!on);
    el("studentProfileModule").classList.toggle("card-only",!!on);
    const note=el("rxCardNote");
    if(note && !on) note.remove();
}

/* Mã thành viên TV (TV000001…) – KHÔNG gồm mã học viên Tự học dạng TV+STT+tổ+01 (vd TV010401) */
function isMemberTV(code){ code=String(code||"").toUpperCase(); return /^TV\d+$/.test(code) && !/^TV(?!00)\d{2,3}0[1-4]01$/.test(code); }
/* Mã cần hiện dạng danh thiếp? (đã bảo mật và người xem không phải chủ tài khoản; mã thành viên TV luôn là danh thiếp) */
async function needsCardOnly(code){
    const A=authApi();
    if(!A) return false;
    if(isMemberTV(code)) return true;
    if(A.isMe(code)) return false;
    try{
        return await A.isProtected(code);
    }catch(error){
        return false;
    }
}

async function renderCardOnly(code){
    const A=authApi();
    const results=await Promise.all([
        A.post("authCard",{code:code}),
        RS.loadSharedRewardData(false).catch(function(){ return null; })
    ]);
    const card=results[0], shared=results[1];
    if(!card || !card.ok) throw new Error((card && card.error) || "Không tải được danh thiếp.");
    if(!card.protected){
        if(isMemberTV(code)) throw new Error("Không tìm thấy mã thành viên "+code+".");
        return false; // không còn bảo mật -> tra cứu đầy đủ như cũ
    }
    if(shared && Array.isArray(shared.gifts) && shared.gifts.length){
        state.gifts=shared.gifts;
        rebuildGiftMap();
    }
    state.student=null;
    state.reward=null;
    state.ownedItems=[];
    state.isAdmin=false;
    closeProfilePanels();
    setMultitaskEffect(false);
    setCardMode(true);

    const look=card.look || {};
    const mine=A.isMe(code);
    applyProfileBackground(giftImageByName(look.bg,1600));
    renderProfileAvatar(giftImageByName(look.avatar,500),giftImageByName(look.frame,700));
    el("studentProfileName").textContent=card.name || code;
    el("profileStreakIcon").textContent="🔒";
    el("profileStreakText").textContent="Hồ sơ riêng tư";
    el("profileHighIcon").textContent="🪪";
    el("profileHighText").textContent="Mã "+(card.code || code);
    el("profileTitleIcon").textContent=card.type==="TV" ? "🌱" : "🎓";
    el("profileTitleText").textContent=card.type==="TV" ? "Thành viên" : "Học viên Thanh Phong";

    const old=el("rxCardNote");
    if(old) old.remove();
    const note=document.createElement("div");
    note.id="rxCardNote";
    note.className="rx-card-note";
    if(mine){
        note.textContent="Đây là tài khoản thành viên của bạn. Khi đăng ký khoá học và được cấp mã học viên, hồ sơ học tập sẽ hiển thị tại đây.";
        const go=document.createElement("button");
        go.type="button";
        go.textContent="ĐĂNG KÝ KHOÁ HỌC";
        go.onclick=function(){ window.location.href="https://www.thudao.com/p/dang-ky-hoc.html"; };
        note.appendChild(document.createElement("br"));
        note.appendChild(go);
    }else{
        note.textContent="Chủ tài khoản đã bảo mật hồ sơ, nên chỉ danh thiếp được hiển thị. Nếu đây là bạn, hãy đăng nhập để xem đầy đủ.";
        const login=document.createElement("button");
        login.type="button";
        login.textContent="ĐÂY LÀ TÔI – ĐĂNG NHẬP";
        login.onclick=function(){
            A.openLogin({code:code,onSuccess:function(){ searchStudent(); }});
        };
        note.appendChild(document.createElement("br"));
        note.appendChild(login);
    }
    el("studentProfileModule").insertAdjacentElement("afterend",note);
    el("studentProfileModule").style.display="block";
    return true;
}

/* ---------- Bảng Trang trí (chủ tài khoản) ---------- */

/* v4.11.2: khoá so khớp "lỏng" – bỏ dấu, bỏ khoảng trắng và ký tự lạ,
   để "Khung Trăng", "khung trang", "Khung  Trăng ×1" đều trùng nhau. */
function looseLookKey(value){
    return RS.normalizeText(value)
        .replace(/\s*[x×]\s*\d+\s*$/,"")   /* "… ×1" */
        .replace(/\[.*?\]/g,"")           /* "[DEAL:…]" */
        .replace(/\s*-\s*\d+\s*(hong ngoc|hoang ngoc|hai lam ngoc|lam bao thach|thach anh tim|luc thach)\s*$/,"")
        .replace(/[^a-z0-9]+/g,"");
}
function lookItemName(item){
    if(!item) return "";
    if(typeof item==="string") return item;
    return item.giftName || item.name || (item.gift && item.gift.name) || item.giftLabel || "";
}
/* Túi đồ hiện tại: gộp mọi nguồn (state, hồ sơ chuẩn của Core, và chính
   danh sách Vật phẩm đang hiển thị) để không bỏ sót vật phẩm nào. */
function ownedLookKeys(){
    const keys=new Set();
    function add(name){ const k=looseLookKey(name); if(k) keys.add(k); }
    (state.ownedItems || []).forEach(function(item){ add(lookItemName(item)); });
    try{
        const canonical=state.assetProfile && Array.isArray(state.assetProfile.ownedItems) ? state.assetProfile.ownedItems : [];
        canonical.forEach(function(item){ add(lookItemName(item)); });
    }catch(error){}
    try{
        document.querySelectorAll("#profileItemGrid .profile-item-name").forEach(function(node){ add(node.textContent); });
    }catch(error){}
    return keys;
}
function ownedLookNames(kindInfo){
    const prefix=looseLookKey(kindInfo.prefix());
    const set=new Set();
    ownedLookKeys().forEach(function(k){
        set.add(k);
    });
    return set;
}
function isLookOwned(owned,giftName,kindInfo){
    const key=looseLookKey(giftName);
    if(!key) return false;
    if(owned.has(key)) return true;
    /* tên trong túi có thể thiếu/thừa tiền tố ("Trăng" ↔ "Khung Trăng") */
    const prefix=looseLookKey(kindInfo.prefix());
    const short=key.indexOf(prefix)===0 ? key.slice(prefix.length) : key;
    return !!short && (owned.has(prefix+short) || owned.has(short));
}
function catalogLookGifts(kindInfo){
    const prefix=looseLookKey(kindInfo.prefix());
    const seen=new Set(), out=[];
    (state.gifts || []).forEach(function(gift){
        const n=looseLookKey(gift && gift.name);
        if(!n || n.indexOf(prefix)!==0 || seen.has(n)) return;
        seen.add(n);
        out.push(gift);
    });
    /* vật phẩm đã sở hữu nhưng không còn trong danh mục */
    (state.ownedItems || []).forEach(function(item){
        const name=lookItemName(item);
        const n=looseLookKey(name);
        if(!n || n.indexOf(prefix)!==0 || seen.has(n)) return;
        seen.add(n);
        out.push({name:name,image:item.image || (item.gift && item.gift.image) || ""});
    });
    return out;
}
function currentLook(){
    const A=authApi();
    const me=A && A.me();
    return Object.assign({avatar:"",frame:"",bg:""},(me && me.look) || {});
}

function ensureLookUi(){
    injectLookCss();
    let button=el("profileLookButton");
    if(!button){
        const actions=document.querySelector("#studentProfileModule .student-profile-actions");
        if(!actions) return false;
        button=document.createElement("button");
        button.type="button";
        button.id="profileLookButton";
        button.className="student-profile-action";
        const icon=document.createElement("span");
        icon.textContent="🎨";
        const label=document.createElement("span");
        label.textContent="Trang trí";
        button.append(icon,label);
        button.addEventListener("click",toggleLookPanel);
        actions.appendChild(button);
    }
    if(!el("profileLookPanel")){
        const panel=document.createElement("div");
        panel.id="profileLookPanel";
        panel.className="rx-expand-panel";
        const anchor=el("profileItemPanel");
        anchor.insertAdjacentElement("afterend",panel);
    }
    return true;
}

function hideLookUi(){
    const b=el("profileLookButton"), p=el("profileLookPanel");
    if(b){ b.style.display="none"; b.classList.remove("active"); }
    if(p) p.classList.remove("visible");
}

function updateLookUi(){
    const A=authApi();
    if(!A || state.isAdmin || !state.student){
        hideLookUi();
        return;
    }
    if(!ensureLookUi()) return;
    el("profileLookButton").style.display="";
    if(el("profileLookPanel").classList.contains("visible")) renderLookPanel();
}

function toggleLookPanel(){
    const panel=el("profileLookPanel"), button=el("profileLookButton");
    const open=!panel.classList.contains("visible");
    closeProfilePanels();
    if(open){
        lookState.draft=currentLook();
        renderLookPanel();
        panel.classList.add("visible");
        button.classList.add("active");
    }
}

function renderLookPanel(){
    const A=authApi(), panel=el("profileLookPanel");
    if(!A || !panel || !state.student) return;
    const code=RS.normalizeCode(state.student.code);
    panel.innerHTML="";
    const title=document.createElement("div");
    title.className="rx-panel-title";
    title.textContent="Trang trí danh thiếp";
    panel.appendChild(title);

    if(!A.isMe(code)){
        const text=document.createElement("p");
        text.className="look-panel-text";
        const actions=document.createElement("div");
        actions.className="look-actions";
        const up=document.createElement("button");
        up.type="button";
        up.className="look-save";
        /* v4.11.2: mã đã bảo mật (hoặc phiên đăng nhập vừa hết hạn) -> mời đăng nhập, không mời nâng cấp lại */
        let protectedNow=false;
        try{ protectedNow=!!(typeof A.isProtectedCached==="function" ? A.isProtectedCached(code) : false); }catch(error){}
        function paint(isProtected){
            if(isProtected){
                text.textContent="Mã "+code+" đã bảo mật. Hãy đăng nhập bằng mật khẩu của bạn để chọn avatar, khung và nền cho danh thiếp.";
                up.textContent="ĐĂNG NHẬP ĐỂ TRANG TRÍ";
                up.onclick=function(){ A.openLogin({code:code,onSuccess:function(){ searchStudent(); }}); };
            }else{
                text.textContent="Chọn avatar, khung và nền cho danh thiếp dành cho tài khoản đã nâng cấp bảo mật. Sau khi nâng cấp, người khác chỉ xem được danh thiếp của bạn.";
                up.textContent="NÂNG CẤP BẢO MẬT MÃ "+code;
                up.onclick=function(){ A.openUpgrade({code:code,onSuccess:function(){ searchStudent(); }}); };
            }
        }
        paint(protectedNow);
        if(!protectedNow && typeof A.isProtected==="function"){
            A.isProtected(code).then(function(isProtected){ if(isProtected && up.isConnected) paint(true); }).catch(function(){});
        }
        panel.appendChild(text);
        actions.appendChild(up);
        panel.appendChild(actions);
        return;
    }

    const draft=lookState.draft || (lookState.draft=currentLook());
    const intro=document.createElement("p");
    intro.className="look-panel-text";
    intro.textContent="Chọn vật phẩm bạn đang sở hữu để hiển thị trên danh thiếp. Vật phẩm mờ là vật phẩm chưa sở hữu.";
    panel.appendChild(intro);

    const tabs=document.createElement("div");
    tabs.className="look-tabs";
    LOOK_KINDS.forEach(function(k){
        const t=document.createElement("button");
        t.type="button";
        t.className="look-tab"+(lookState.kind===k.kind?" active":"");
        t.textContent=k.label;
        t.onclick=function(){ lookState.kind=k.kind; renderLookPanel(); };
        tabs.appendChild(t);
    });
    panel.appendChild(tabs);

    const info=LOOK_KINDS.find(function(k){ return k.kind===lookState.kind; }) || LOOK_KINDS[0];
    const owned=ownedLookNames(info);
    const grid=document.createElement("div");
    grid.className="look-grid";

    function addCard(name,image,isOwned,labelText){
        const card=document.createElement("div");
        card.className="look-card"+(info.kind==="bg"?" bg":"");
        const selected=RS.normalizeText(draft[info.kind]||"")===RS.normalizeText(name||"");
        if(selected) card.classList.add("selected");
        if(!isOwned) card.classList.add("locked");
        if(image){
            const img=document.createElement("img");
            img.src=image; img.alt=""; img.loading="lazy"; img.decoding="async";
            img.onerror=function(){ this.style.visibility="hidden"; };
            card.appendChild(img);
        }else{
            const none=document.createElement("div");
            none.className="look-none";
            none.textContent=name?"🎁":"✦";
            card.appendChild(none);
        }
        const label=document.createElement("div");
        label.className="look-name";
        label.textContent=labelText;
        card.appendChild(label);
        if(!isOwned){
            const lock=document.createElement("div");
            lock.className="look-lock";
            lock.textContent="Chưa sở hữu";
            card.appendChild(lock);
            card.title="Bạn chưa sở hữu vật phẩm này";
        }else{
            card.setAttribute("role","button");
            card.tabIndex=0;
            const pick=function(){ draft[info.kind]=name||""; renderLookPanel(); };
            card.addEventListener("click",pick);
            card.addEventListener("keydown",function(e){ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); pick(); } });
        }
        grid.appendChild(card);
    }

    addCard("","",true,"Mặc định (vật phẩm mới nhận)");
    const gifts=catalogLookGifts(info).sort(function(a,b){
        const ao=isLookOwned(owned,a.name,info)?0:1, bo=isLookOwned(owned,b.name,info)?0:1;
        return ao-bo;
    });
    let ownedCount=0;
    gifts.forEach(function(gift){
        const short=String(gift.name).slice(info.prefix().length).trim() || gift.name;
        const image=gift.image && typeof RS.convertDriveImageUrl==="function" ? RS.convertDriveImageUrl(gift.image,info.size) : (gift.image||"");
        const isOwned=isLookOwned(owned,gift.name,info);
        if(isOwned) ownedCount++;
        addCard(gift.name,image,isOwned,short);
    });
    /* v4.11.2: túi đồ chưa tải xong / đang dùng số liệu cũ -> nói rõ và cho tải lại */
    if(state.assetsStale || !ownedCount){
        const bag=document.createElement("p");
        bag.className="look-panel-text";
        bag.id="profileLookBagNote";
        const total=(state.ownedItems||[]).length;
        bag.textContent=state.assetsStale
            ? "Đang cập nhật túi đồ mới nhất, danh sách sẽ tự làm mới trong giây lát…"
            : (total ? "Túi đồ hiện có "+total+" vật phẩm nhưng chưa có "+info.label.toLowerCase()+" nào. Nếu bạn vừa nhận vật phẩm, hãy bấm TẢI LẠI TÚI ĐỒ." : "Túi đồ đang trống. Nếu bạn vừa nhận vật phẩm, hãy bấm TẢI LẠI TÚI ĐỒ.");
        panel.appendChild(bag);
    }
    if(!gifts.length){
        const empty=document.createElement("p");
        empty.className="look-panel-text";
        empty.textContent="Chưa có vật phẩm loại này trong danh mục.";
        panel.appendChild(grid);
        panel.appendChild(empty);
    }else{
        panel.appendChild(grid);
    }

    const actions=document.createElement("div");
    actions.className="look-actions";
    const save=document.createElement("button");
    save.type="button"; save.className="look-save"; save.textContent=lookState.saving?"ĐANG LƯU...":"LƯU LỰA CHỌN";
    save.disabled=lookState.saving;
    const reset=document.createElement("button");
    reset.type="button"; reset.className="look-reset"; reset.textContent="HOÀN TÁC";
    reset.onclick=function(){ lookState.draft=currentLook(); renderLookPanel(); };
    const reload=document.createElement("button");
    reload.type="button"; reload.className="look-reset"; reload.textContent="TẢI LẠI TÚI ĐỒ";
    reload.onclick=async function(){
        if(reload.disabled) return;
        reload.disabled=true; reload.textContent="ĐANG TẢI…";
        try{
            const profile=await refreshCanonicalAssets();
            if(profile && state.student){
                renderProfile(state.student,state.ownedItems,state.reward);
            }
        }catch(error){ console.warn("[Trang trí] tải lại túi đồ:",error); }
        /* hồ sơ vẽ lại sẽ đóng các bảng -> mở lại bảng Trang trí với lựa chọn nháp đang có */
        const p2=el("profileLookPanel"), b2=el("profileLookButton");
        if(p2 && b2 && state.student && !state.isAdmin){
            closeProfilePanels();
            renderLookPanel();
            p2.classList.add("visible");
            b2.classList.add("active");
        }
    };
    actions.append(save,reset,reload);
    panel.appendChild(actions);
    const msg=document.createElement("div");
    msg.className="look-msg";
    msg.id="profileLookMsg";
    panel.appendChild(msg);

    save.onclick=async function(){
        if(lookState.saving) return;
        lookState.saving=true;
        save.disabled=true; save.textContent="ĐANG LƯU...";
        const r=await A.post("lookSave",{token:A.token(),avatar:draft.avatar||"",frame:draft.frame||"",bg:draft.bg||""});
        lookState.saving=false;
        if(!r || !r.ok){
            save.disabled=false; save.textContent="LƯU LỰA CHỌN";
            /* v4.11.2: bảng có thể đã được vẽ lại (phiên hết hạn) -> ghi vào phần tử đang hiển thị */
            if(r && r.expired){
                lookState.draft=null;
                renderLookPanel();
                const live=el("profileLookPanel");
                if(live){
                    const note=document.createElement("div");
                    note.className="look-msg err";
                    note.textContent="Phiên đăng nhập đã hết hạn nên chưa lưu được. Hãy đăng nhập lại rồi chọn lại.";
                    live.appendChild(note);
                }
                return;
            }
            const target=el("profileLookMsg") || msg;
            target.className="look-msg err";
            target.textContent=(r && r.error) || "Chưa lưu được lựa chọn.";
            return;
        }
        A.setLook(r.look || draft);
        lookState.draft=currentLook();
        renderProfile(state.student,state.ownedItems,state.reward);
        renderLookPanel();
        const m=el("profileLookMsg");
        if(m){ m.className="look-msg ok"; m.textContent="✅ Đã lưu. Danh thiếp của bạn đã được cập nhật."; }
        el("profileLookPanel").classList.add("visible");
        el("profileLookButton").classList.add("active");
    };
}


/* =========================================================
   EVENTS
========================================================= */
 
function bindEvents(){

    window.addEventListener("ocdAuthChanged",function(){
        if(state.student && !state.isAdmin) updateLookUi();
    });
 
    window.addEventListener(
        "ocdRewardProfileChanged",
        handleRewardProfileChanged
    );
 
    el("rxSearchButton")
    .addEventListener(
        "click",
        searchStudent
    );
 
 
    el("rxStudentCode")
    .addEventListener(
        "keydown",
        function(event){
 
            if(
                event.key ===
                "Enter"
            ){
 
                event.preventDefault();
 
                searchStudent();
            }
        }
    );
 
 
    el("rxStudentCode")
    .addEventListener(
        "input",
        function(){
 
            this.value=
                this.value
                .toUpperCase();
        }
    );
 
 
    el("profileLearningButton")
    .addEventListener(
        "click",
        function(){
 
            toggleProfilePanel(
                "learning"
            );
        }
    );
 
 
    el("profileGemButton")
    .addEventListener(
        "click",
        function(){
 
            toggleProfilePanel(
                "gems"
            );
        }
    );
 
 
    el("profileItemButton")
    .addEventListener(
        "click",
        function(){
 
            toggleProfilePanel(
                "items"
            );
        }
    );
 
 
    /* =====================================================
       MARKET
 
       Một lần mở sẽ tự retry.
    ===================================================== */
 
    el("marketToggleButton")
    .addEventListener(
        "click",
        function(){
 
            state.marketOpen=
                !state.marketOpen;
 
            el("marketPanel")
            .classList.toggle(
                "visible",
                state.marketOpen
            );
 
            this.classList.toggle(
                "open",
                state.marketOpen
            );
 
 
            if(
                state.marketOpen &&
                !state.marketLoaded
            ){
 
                /*
                   Không cần kiểm tra marketLoading ở đây.
                   loadMarket tự quản lý Promise dùng chung.
                */
 
                loadMarket();
            }
        }
    );
 
 
    /* =====================================================
       SUBMISSIONS
    ===================================================== */
 
    el("submissionToggleButton")
    .addEventListener(
        "click",
        function(){
 
            state.submissionOpen=
                !state.submissionOpen;
 
            if(
                state.submissionOpen &&
                !state.submissionsRendered
            ){
 
                renderSubmissions();
            }
 
            el("submissionContent")
            .classList.toggle(
                "visible",
                state.submissionOpen
            );
 
            this.classList.toggle(
                "open",
                state.submissionOpen
            );
        }
    );
 
 
    el("rxConfirmFormButton")
    .addEventListener(
        "click",
        confirmExchangeDirect
    );
 
 
    el("rxModalClose")
    .addEventListener(
        "click",
        closeModal
    );
 
 
    el("rxModal")
    .addEventListener(
        "click",
        function(event){
 
            if(
                event.target ===
                this &&
                !state.submitting
            ){
 
                closeModal();
            }
        }
    );
}
 
 
/* =========================================================
   INIT
========================================================= */
 
bindEvents();
 
setMultitaskEffect(
    false
);
 
 
/*
   VẪN KHÔNG loadMarket() TẠI ĐÂY.
 
   => Giữ tốc độ tải trang nhanh.
   => Market chỉ tải khi người dùng mở.
   => Nhưng khi tải sẽ tự retry.
*/
 
 
}
 
})();
 



