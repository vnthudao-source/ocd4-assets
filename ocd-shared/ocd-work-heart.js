/* =========================================================
   OCD · NÚT THẢ TIM TÁC PHẨM (dùng chung) · v1.2.0
   v1.2.0 (29/10/2026) – thả tim nhanh:
     - Gửi tim bằng fetch và đọc luôn kết quả Apps Script trả về (doPost đã trả JSON),
       không còn chờ 1,5 giây rồi hỏi lại nhiều lần; chỉ khi fetch lỗi mới quay về cách cũ.
     - Tim đổi màu + số tim tăng ngay khi bấm, nút không bị mờ trong lúc đồng bộ.
     - Nhớ số tim lần trước trên máy (localStorage) để mở trang là hiện số ngay, rồi cập nhật ngầm.
   Dùng cho: Phòng triển lãm, trang Nộp bài.
   - Cùng một bài nộp (Mã bài nộp) thì số tim chung ở mọi trang.
   - Ghi chung tab TimBanLam qua Apps Script "Thư viện lâm mô" (Exhibition.gs v1.2.0):
     học viên đã xác minh ở Minh Hồng mới thả được, không tự thả tim bài mình,
     mỗi bài đạt 15 tim thì tác giả nhận 1 Hồng Ngọc (mỗi bài một lần).
   API:
     OCDWorkHeart.button(item)        -> nút tim mới cho bài {id, code, name}
     OCDWorkHeart.bind(button, item)  -> gắn một nút có sẵn với bài (vd. khung xem ảnh)
     OCDWorkHeart.load(force)         -> tải số tim (tự gọi khi tạo nút đầu tiên)
     OCDWorkHeart.onRules(fn)         -> nhận {goal, prize} khi Apps Script báo mốc thưởng
========================================================= */
(function(){
"use strict";

if(window.OCDWorkHeart){
    return;
}

const API=
    "https://script.google.com/macros/s/AKfycbz4pa-q_ALScuiY8tbhi5bdJ0MPtl-IBu6gjZuDeFXuailbvPYhlk1TmE_Hq4DjJxHFIg/exec";

const CSS=
    ".ocdh{position:absolute;top:8px;right:8px;z-index:1;display:inline-flex;align-items:center;gap:4px;min-height:32px;padding:5px 10px;"
    +"border:1px solid #e5ccc1;border-radius:16px;background:rgba(255,253,248,.94);color:#a04538;font:600 13px Arial,Helvetica,sans-serif;"
    +"line-height:1;cursor:pointer;box-shadow:0 3px 10px rgba(68,45,30,.12);-webkit-tap-highlight-color:transparent;margin:0}"
    +".ocdh span{font-size:16px;line-height:1}"
    +".ocdh:hover{background:#f9e2d7}"
    +".ocdh.is-liked{color:#c33235;background:#fff0f0;border-color:#efb7b7}"
    +".ocdh.is-goal{border-color:#d9b25a;box-shadow:0 0 0 2px rgba(217,178,90,.35),0 3px 10px rgba(68,45,30,.12)}"
    +".ocdh.is-own{cursor:default;opacity:.85}"
    +".ocdh:disabled{opacity:1;cursor:progress}"
    +".ocdh.is-syncing span{animation:ocdhBeat .9s ease-in-out infinite}"
    +"@keyframes ocdhBeat{0%,to{transform:scale(1)}50%{transform:scale(1.25)}}"
    +"@media(prefers-reduced-motion:reduce){.ocdh.is-syncing span{animation:none}}"
    +".ocdh.ocdh-inline{position:static;box-shadow:none}"
    +".ocdh-toast{position:fixed;left:50%;bottom:22px;z-index:100000;max-width:min(92vw,460px);padding:11px 16px;border-radius:14px;"
    +"background:#4d3225;color:#fffdf8;font:14px/1.45 Arial,Helvetica,sans-serif;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,.25);"
    +"transform:translateX(-50%);opacity:0;pointer-events:none;transition:opacity .25s ease}"
    +".ocdh-toast.visible{opacity:1}";

const S={
    goal:15,
    prize:1,
    counts:{},
    liked:new Set(),
    viewer:"",
    loaded:false,
    loading:null,
    pending:new Set(),
    items:new Map(),
    celebrated:new Set(),
    rulesListeners:[],
    toast:null,
    toastTimer:null,
    started:false
};


function injectCss(){

    if(document.getElementById("ocdh-style")){
        return;
    }

    const st=
        document.createElement("style");

    st.id="ocdh-style";

    st.textContent=CSS;

    (document.head||document.documentElement).appendChild(st);
}


function who(code){

    return String(code||"")
        .replace(/[\u200b-\u200d\ufeff]/g,"")
        .replace(/\s+/g,"")
        .toUpperCase()
        .replace(/^0+(?=\d)/,"");
}


function sessionCode(session){

    if(
        session
        &&
        String(session.mode||"").trim().toLowerCase() === "student"
        &&
        session.verified === true
        &&
        session.code
    ){
        return who(session.code);
    }

    return "";
}


/* Mã học viên đã xác minh qua Minh Hồng (giống Thư viện lâm mô) */
function viewer(){

    try{

        if(
            window.OCDStudentSession
            &&
            typeof window.OCDStudentSession.getState === "function"
        ){

            const code=
                sessionCode(window.OCDStudentSession.getState());

            if(code){
                return code;
            }
        }

    }catch(error){}

    try{

        const raw=
            localStorage.getItem("ocd_student_session_v1");

        return sessionCode(raw ? JSON.parse(raw) : null);

    }catch(error){}

    return "";
}


function jsonp(params,timeout){

    return new Promise(
        function(resolve,reject){

            const cb=
                "LMVideo_EX_" +
                Math.random().toString(36).slice(2);

            const script=
                document.createElement("script");

            let timer=null;

            function cleanup(){
                clearTimeout(timer);
                script.remove();
                try{ delete window[cb]; }catch(error){ window[cb]=undefined; }
            }

            window[cb]=
                function(result){
                    cleanup();
                    if(result && result.ok){
                        resolve(result);
                    }else{
                        reject(new Error(result && result.message ? result.message : "Apps Script báo lỗi."));
                    }
                };

            script.onerror=
                function(){
                    cleanup();
                    reject(new Error("Mất kết nối Apps Script."));
                };

            timer=
                setTimeout(
                    function(){
                        cleanup();
                        reject(new Error("Apps Script phản hồi chậm."));
                    },
                    timeout || 20000
                );

            const url=
                new URL(API);

            Object.keys(params).forEach(
                function(key){
                    url.searchParams.set(key,params[key]);
                }
            );

            url.searchParams.set("callback",cb);

            script.src=url.href;

            document.head.appendChild(script);
        }
    );
}


/* ---- nhớ số tim trên máy để hiện ngay khi mở trang ---- */
const CACHE_KEY="ocdh_cache_v1";
const CACHE_MAX_AGE=12*3600*1000;
function readCache(v){
    try{
        const c=JSON.parse(localStorage.getItem(CACHE_KEY)||"null");
        if(c && c.v===v && c.counts && Date.now()-Number(c.t||0) < CACHE_MAX_AGE){
            return c;
        }
    }catch(error){}
    return null;
}
function writeCache(){
    try{
        localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({v:S.viewer,t:Date.now(),counts:S.counts,liked:Array.from(S.liked),goal:S.goal,prize:S.prize})
        );
    }catch(error){}
}
/* Gửi tim và đọc kết quả ngay (Apps Script doPost trả JSON). null = không đọc được -> dùng cách cũ */
async function postFast(fields){
    if(typeof fetch!=="function" || typeof URLSearchParams!=="function"){
        return null;
    }
    const ac=typeof AbortController==="function" ? new AbortController() : null;
    const timer=ac ? setTimeout(function(){ ac.abort(); },25000) : null;
    try{
        const res=await fetch(API,{
            method:"POST",
            body:new URLSearchParams(fields),
            credentials:"omit",
            cache:"no-store",
            redirect:"follow",
            signal:ac ? ac.signal : undefined
        });
        const data=JSON.parse(await res.text());
        return data && typeof data==="object" ? data : null;
    }catch(error){
        return null;
    }finally{
        if(timer){ clearTimeout(timer); }
    }
}
function count(id){

    return Math.max(0,Number(S.counts[id]) || 0);
}


function isOwn(item){

    return !!(S.viewer && item && who(item.code) === S.viewer);
}


function paint(button,item){

    if(!button || !item){
        return;
    }

    const n=count(item.id);
    const liked=S.liked.has(item.id);
    const own=isOwn(item);

    button.classList.toggle("is-liked",liked);
    button.classList.toggle("is-goal",n >= S.goal);
    button.classList.toggle("is-own",own);

    button.disabled=S.pending.has(item.id);
    button.classList.toggle("is-syncing",S.pending.has(item.id));

    button.setAttribute("aria-pressed",String(liked));

    button.setAttribute(
        "aria-label",
        own
        ? "Tác phẩm của bạn: " + n + " tim"
        : (liked ? "Bỏ tim" : "Thả tim") + " (" + n + " tim)"
    );

    button.title=
        own
        ? "Tác phẩm của bạn"
        : (
            n >= S.goal
            ? "Đã đạt " + S.goal + " tim"
            : "Còn " + (S.goal - n) + " tim để tác giả nhận " + S.prize + " Hồng Ngọc"
        );

    button.innerHTML="";

    const icon=
        document.createElement("span");

    icon.textContent=liked ? "\u2665" : "\u2661";

    button.append(
        icon,
        document.createTextNode(" " + (S.loaded ? n : "\u2026"))
    );
}


function itemFor(button){

    return S.items.get(button.getAttribute("data-ocdh")) || null;
}


function repaint(){

    document
        .querySelectorAll("[data-ocdh]")
        .forEach(
            function(button){
                const item=itemFor(button);
                if(item){
                    paint(button,item);
                }
            }
        );
}


function toast(text){

    if(!S.toast || !S.toast.isConnected){

        S.toast=document.createElement("div");
        S.toast.className="ocdh-toast";
        S.toast.setAttribute("role","status");
        S.toast.setAttribute("aria-live","polite");
        document.body.appendChild(S.toast);
    }

    S.toast.textContent=text;

    S.toast.classList.add("visible");

    clearTimeout(S.toastTimer);

    S.toastTimer=
        setTimeout(
            function(){
                S.toast.classList.remove("visible");
            },
            4200
        );
}


function emitRules(){

    S.rulesListeners.forEach(
        function(fn){
            try{ fn({goal:S.goal,prize:S.prize}); }catch(error){}
        }
    );
}


function load(force){

    start();

    const v=viewer();

    if(!force && S.loading && S.viewer === v){
        return S.loading;
    }

    S.viewer=v;
    /* có số tim lần trước trên máy -> hiện ngay, tải mới ở nền */
    if(!S.loaded){
        const c=readCache(v);
        if(c){
            S.counts=Object.assign({},c.counts);
            S.liked=new Set(Array.isArray(c.liked) ? c.liked : []);
            if(Number(c.goal) > 0){ S.goal=Number(c.goal); }
            if(Number(c.prize) > 0){ S.prize=Number(c.prize); }
            S.loaded=true;
            repaint();
        }
    }
    S.loading=
        jsonp({action:"exhibitHearts",code:v},25000)
        .then(
            function(result){

                if(S.viewer !== v){
                    return;
                }
                /* giữ trạng thái các bài đang gửi dở, không để bản tải về ghi đè */
                const keep={};
                S.pending.forEach(function(id){ keep[id]={c:S.counts[id],l:S.liked.has(id)}; });
                S.counts=result.counts || {};

                S.liked=new Set(Array.isArray(result.liked) ? result.liked : []);
                Object.keys(keep).forEach(function(id){
                    S.counts[id]=keep[id].c;
                    if(keep[id].l){ S.liked.add(id); }else{ S.liked.delete(id); }
                });

                if(Number(result.rewardHearts) > 0){
                    S.goal=Number(result.rewardHearts);
                }

                if(Number(result.rewardAmount) > 0){
                    S.prize=Number(result.rewardAmount);
                }

                S.loaded=true;
                writeCache();
                emitRules();
                repaint();
            }
        )
        .catch(
            function(error){

                console.warn("[OCD Work Heart]",error);

                S.loaded=true;

                repaint();
            }
        );

    return S.loading;
}


function sendForm(fields){

    const frame=document.createElement("iframe");
    const form=document.createElement("form");

    frame.name="ocdh_" + Math.random().toString(36).slice(2);
    frame.hidden=true;
    frame.title="Đồng bộ tim";

    form.hidden=true;
    form.method="POST";
    form.action=API;
    form.target=frame.name;

    Object.keys(fields).forEach(
        function(key){
            const input=document.createElement("input");
            input.type="hidden";
            input.name=key;
            input.value=fields[key];
            form.appendChild(input);
        }
    );

    document.body.appendChild(frame);
    document.body.appendChild(form);

    form.submit();

    return function(){
        form.remove();
        frame.remove();
    };
}


async function toggle(item){

    if(!item || !item.id || S.pending.has(item.id)){
        return;
    }

    const v=viewer();

    if(!v){
        toast("Hãy xác minh mã học viên ở biểu tượng Minh Hồng để thả tim.");
        return;
    }

    if(v !== S.viewer || !S.loaded){
        await load(true);
    }

    if(isOwn(item)){
        repaint();
        toast("Không thể thả tim tác phẩm của chính mình.");
        return;
    }

    const oldLiked=S.liked.has(item.id);
    const oldCount=count(item.id);
    const active=!oldLiked;

    /* Hiện ngay, rồi xác nhận với Apps Script */
    S.pending.add(item.id);

    if(active){ S.liked.add(item.id); }else{ S.liked.delete(item.id); }

    S.counts[item.id]=Math.max(0,oldCount + (active ? 1 : -1));

    repaint();

    let cleanup=null;
    try{
        const fields={
            action:"exhibitHeart",
            studentCode:v,
            postId:item.id,
            active:String(active)
        };
        let confirmed=null;
        let lastError="";
        let fastReward=false;
        /* Cách nhanh: đọc luôn kết quả Apps Script trả về */
        const fast=await postFast(fields);
        if(fast && fast.ok === true && typeof fast.active === "boolean"){
            confirmed=fast;
            fastReward=fast.reward === "created";
        }else if(fast && fast.ok === false){
            throw new Error(fast.message || "Chưa thả được tim.");
        }else{
            /* Dự phòng: gửi kiểu cũ rồi hỏi lại trạng thái */
            cleanup=sendForm(fields);
        }
        for(let attempt=0; !confirmed && attempt<10; attempt++){
            await new Promise(function(resolve){ setTimeout(resolve,attempt === 0 ? 800 : 1200); });

            try{

                const result=
                    await jsonp({action:"exhibitHeartState",code:v,postId:item.id},12000);

                if(result.active === active){
                    confirmed=result;
                    break;
                }

            }catch(error){

                lastError=error.message;

                if(/không thể|không hợp lệ|không còn|không tồn tại/i.test(lastError)){
                    break;
                }
            }
        }

        if(!confirmed){
            throw new Error(lastError || "Chưa xác nhận được tim, hãy tải lại trang để kiểm tra.");
        }

        if(confirmed.active){ S.liked.add(item.id); }else{ S.liked.delete(item.id); }

        S.counts[item.id]=Math.max(0,Number(confirmed.hearts) || 0);

        /* Chỉ báo "được thưởng" khi Apps Script vừa ghi thưởng (mỗi bài một lần) */
        const rewardTime=Date.parse(confirmed.rewardedAt || "");
        writeCache();
        if(
            confirmed.active
            && oldCount < S.goal
            && S.counts[item.id] >= S.goal
            && (fastReward || (rewardTime && Math.abs(Date.now() - rewardTime) < 120000))
            && !S.celebrated.has(item.id)
        ){

            S.celebrated.add(item.id);

            toast(
                "Tác phẩm của " + (item.name || "học viên") + " đã đạt " + S.goal
                + " tim! Tác giả được thưởng " + S.prize + " Hồng Ngọc."
            );

        }

    }catch(error){

        if(oldLiked){ S.liked.add(item.id); }else{ S.liked.delete(item.id); }

        S.counts[item.id]=oldCount;

        toast(error.message || "Chưa thả được tim.");

    }finally{

        S.pending.delete(item.id);

        if(cleanup){ cleanup(); }

        repaint();
    }
}


function bind(button,item){

    if(!button){
        return button;
    }

    if(!item || !item.id){
        button.hidden=true;
        button.removeAttribute("data-ocdh");
        return button;
    }

    start();

    button.hidden=false;

    if(!button.classList.contains("ocdh")){
        button.classList.add("ocdh");
    }

    S.items.set(item.id,item);

    button.setAttribute("data-ocdh",item.id);

    if(!button.__ocdhBound){

        button.__ocdhBound=true;

        button.addEventListener(
            "click",
            function(event){
                event.preventDefault();
                event.stopPropagation();
                toggle(itemFor(button));
            }
        );
    }

    /* tải trước (lấy ngay số tim đã nhớ trên máy nếu có) rồi mới vẽ nút */
    if(!S.loading){
        load();
    }
    paint(button,item);
    return button;
}


function button(item,options){

    const b=document.createElement("button");

    b.type="button";

    b.className="ocdh" + (options && options.inline ? " ocdh-inline" : "");

    return bind(b,item);
}


/* Đổi học viên ở Minh Hồng (tab khác hoặc quay lại trang) -> tải lại tim */
function start(){

    if(S.started){
        return;
    }

    S.started=true;

    injectCss();

    function check(){
        if(S.loading && viewer() !== S.viewer){
            load(true);
        }
    }

    window.addEventListener("storage",check);
    window.addEventListener("focus",check);

    document.addEventListener(
        "visibilitychange",
        function(){
            if(!document.hidden){
                check();
            }
        }
    );
}


window.OCDWorkHeart={
    version:"1.2.0",
    button:button,
    bind:bind,
    load:load,
    repaint:repaint,
    onRules:function(fn){
        if(typeof fn === "function"){
            S.rulesListeners.push(fn);
            if(S.loaded){ try{ fn({goal:S.goal,prize:S.prize}); }catch(error){} }
        }
    },
    get goal(){ return S.goal; },
    get prize(){ return S.prize; }
};

})();
