/* =========================================================
   OCD · THẺ HỌC VIÊN (dùng chung) · v1.1.0
   v1.1.0: tải hồ sơ theo chế độ danh sách công khai (như Bảng xếp hạng) để học viên đã bảo mật vẫn hiện đủ avatar/khung/nền/thuốc;
           thử lại khi mạng lỗi; thẻ luôn tự tải theo mã nếu trang không có sẵn hồ sơ; hiệu ứng không đè lên menu trang.
   Vẽ thống nhất ở mọi trang: avatar, khung avatar, nền hồ sơ, hiệu ứng thuốc đa nhiệm (của Reward Core).
   Dữ liệu lấy từ StudentRewardSystem.getStudentRewardProfile (tải sẵn trong theme), mỗi mã học viên tải một lần.
   API:
     OCDIdentity.create({code, name, meta, size, background})  -> phần tử thẻ, tự nạp hồ sơ
         size: "sm" | "md" | "lg"   (mặc định "md")
         background: true (nền vẽ lên chính thẻ) | phần tử khác để vẽ nền | false (không vẽ nền)
     OCDIdentity.paint(card, profileOrAccount)  -> vẽ lại thẻ với hồ sơ đã có sẵn (không tải lại)
     OCDIdentity.profile(code)                  -> Promise hồ sơ đã chuẩn hoá {avatar, frame, background, multitask}
     OCDIdentity.setLoader(fn)                  -> trang có cách tải hồ sơ riêng thì đăng ký fn(code) -> Promise<profile>
     OCDIdentity.normalize(profile)             -> {avatar, frame, background, multitask}
========================================================= */
(function(){
"use strict";

if(window.OCDIdentity){
    return;
}

const CSS=
    ".ocdid{position:relative;isolation:isolate;display:flex;align-items:center;gap:10px;min-width:0;border-radius:14px}"
    +".ocdid.ocdid-has-bg{padding:6px 10px 6px 6px}"
    +".ocdid-bg{background-size:cover!important;background-position:center!important}"
    +".ocdid-av{position:relative;flex:0 0 auto;display:flex;align-items:center;justify-content:center;width:var(--ocdid-s,48px);height:var(--ocdid-s,48px)}"
    +".ocdid-face{position:relative;z-index:1;width:80%;height:80%;overflow:hidden;display:flex;align-items:center;justify-content:center;"
    +"border:2px solid #fff;border-radius:50%;background:#f3eee8;box-shadow:0 3px 9px rgba(15,23,42,.14);color:#8a6b50;"
    +"font:700 calc(var(--ocdid-s,48px)*.36)/1 Georgia,'Times New Roman',serif}"
    +".ocdid-face img{display:block;width:100%;height:100%;object-fit:cover}"
    +".ocdid-frame{position:absolute;z-index:2;inset:0;width:100%;height:100%;object-fit:contain;pointer-events:none}"
    +".ocdid-txt{display:flex;flex-direction:column;min-width:0;gap:2px}"
    +".ocdid-namewrap{max-width:100%}"
    +".ocdid-name{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;max-width:100%;overflow:hidden;overflow-wrap:anywhere;font-weight:700;line-height:1.25;color:inherit}"
    +".ocdid-meta{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;opacity:.75}"
    +".ocdid-sm{--ocdid-s:36px}.ocdid-md{--ocdid-s:48px}.ocdid-lg{--ocdid-s:68px}"
    +".ocdid-sm .ocdid-name{font-size:13px}.ocdid-md .ocdid-name{font-size:15px}.ocdid-lg .ocdid-name{font-size:18px}"
    /* Hiệu ứng thuốc đa nhiệm: chép từ student-reward-core.css để trang nào không nạp CSS core vẫn hiện đúng */
    +".reward-multitask-wrap{position:relative;display:inline-flex;align-items:center;max-width:100%}"
    +".reward-multitask-name{position:relative;color:#f59e0b!important;animation:rewardMultitaskColor 2.8s linear infinite,rewardMultitaskGlow 1.6s ease-in-out infinite alternate}"
    +".reward-multitask-star{position:absolute;z-index:30;pointer-events:none;user-select:none;line-height:1;color:#fff;text-shadow:0 0 4px rgba(255,255,255,.9),0 0 8px rgba(251,191,36,.9);animation:rewardMultitaskStar 1.6s ease-in-out infinite}"
    +".reward-multitask-star-left{left:-17px;top:-11px}.reward-multitask-star-right{right:-18px;top:-9px;animation-delay:.35s}"
    +".reward-multitask-star-bottom-left{left:-10px;bottom:-12px;animation-delay:.7s}.reward-multitask-star-bottom-right{right:-12px;bottom:-11px;animation-delay:1.05s}"
    +".reward-multitask-size-small .reward-multitask-star{font-size:10px}.reward-multitask-size-medium .reward-multitask-star{font-size:13px}.reward-multitask-size-large .reward-multitask-star{font-size:16px}"
    +"@keyframes rewardMultitaskColor{0%{color:#f59e0b}25%{color:#ec4899}50%{color:#8b5cf6}75%{color:#0ea5e9}to{color:#f59e0b}}"
    +"@keyframes rewardMultitaskGlow{0%{text-shadow:0 0 3px rgba(245,158,11,.35)}to{text-shadow:0 0 6px rgba(255,255,255,.85),0 0 12px rgba(245,158,11,.75)}}"
    +"@keyframes rewardMultitaskStar{0%,to{opacity:.25;transform:scale(.65) rotate(0)}50%{opacity:1;transform:scale(1.15) rotate(18deg)}}"
    +"@media(prefers-reduced-motion:reduce){.reward-multitask-name,.reward-multitask-star{animation:none}}";

const S={
    cache:new Map(),
    loader:null,
    styled:false
};


function injectCss(){

    if(S.styled || document.getElementById("ocdid-style")){
        S.styled=true;
        return;
    }

    S.styled=true;

    const st=document.createElement("style");

    st.id="ocdid-style";

    st.textContent=CSS;

    (document.head||document.documentElement).appendChild(st);
}


function rs(){

    return window.StudentRewardSystem || null;
}


function normCode(code){

    const R=rs();

    const raw=String(code||"").replace(/[\u200B-\u200D\uFEFF]/g,"").trim();

    if(R && typeof R.normalizeCode === "function"){
        try{ return R.normalizeCode(raw) || raw.toUpperCase(); }catch(error){}
    }

    return raw.replace(/\s+/g,"").toUpperCase();
}


function driveId(v){

    const s=String(v||"");

    const m=
        s.match(/\/file\/d\/([^/?&#]+)/i)
        || s.match(/\/d\/([^/?&#]+)/i)
        || s.match(/[?&]id=([^&#]+)/i);

    return m ? m[1] : "";
}


/* Ảnh Drive -> ảnh thu nhỏ hiển thị được; ưu tiên hàm của Reward Core */
function imageUrl(value,size){

    const R=rs();

    if(!value){
        return "";
    }

    if(R && typeof R.convertDriveImageUrl === "function"){
        try{
            const u=R.convertDriveImageUrl(value,size||200);
            if(u){ return u; }
        }catch(error){}
    }

    const id=driveId(value);

    if(id){
        return "https://drive.google.com/thumbnail?id=" + encodeURIComponent(id) + "&sz=w" + (size||200);
    }

    const s=String(value).trim();

    return /^https:\/\//i.test(s) ? s : "";
}


function letter(name){

    const words=String(name||"").trim().split(/\s+/).filter(Boolean);

    const last=words.length ? words[words.length-1] : "";

    return last ? last.charAt(0).toUpperCase() : "\u270d";
}


/* Nhận hồ sơ Reward Core hoặc "account" kiểu cũ của từng trang -> một dạng chung */
function normalize(p){

    if(!p){
        return {avatar:"",frame:"",background:"",multitask:false};
    }

    const R=rs();
    const items=Array.isArray(p.ownedItems) ? p.ownedItems : [];
    const code=p.code || "";

    function pick(keys,getter){
        for(const k of keys){
            if(p[k]){ return p[k]; }
        }
        if(getter && R && typeof R[getter] === "function" && items.length){
            try{ return R[getter](items,code) || ""; }catch(error){}
        }
        return "";
    }

    let multitask=Boolean(p.hasMultitaskPotion || p.multitask);

    if(!multitask && R && typeof R.hasMultitaskPotion === "function" && items.length){
        try{ multitask=Boolean(R.hasMultitaskPotion(items)); }catch(error){}
    }

    return {
        avatar:pick(["avatar"],"getProfileAvatar"),
        frame:pick(["avatarFrame","frame"],"getProfileAvatarFrame"),
        background:pick(["profileBackground","background"],"getProfileBackground"),
        multitask:multitask
    };
}


function waitForCore(timeout){

    return new Promise(
        function(resolve){

            const started=Date.now();

            (function tick(){

                const R=rs();

                if(R && typeof R.getStudentRewardProfile === "function"){
                    resolve(R);
                    return;
                }

                if(Date.now()-started > (timeout||15000)){
                    resolve(null);
                    return;
                }

                setTimeout(tick,150);
            })();
        }
    );
}


/* Danh thiếp công khai của hồ sơ đã bảo mật: tên vật phẩm đã chọn -> ảnh trong danh mục quà */
async function publicLook(code){

    const out={avatar:"",frame:"",background:"",multitask:false};

    try{

        const auth=window.OCDAuth;
        const R=await waitForCore(5000);

        if(!auth || typeof auth.lookOf !== "function" || !R){
            return out;
        }

        const look=await auth.lookOf(code);

        if(!look){
            return out;
        }

        const shared=typeof R.loadSharedRewardData === "function" ? await R.loadSharedRewardData(false) : null;
        const map=shared && shared.giftMap ? shared.giftMap : {};
        const norm=typeof R.normalizeText === "function" ? R.normalizeText : function(x){ return String(x||"").trim().toLowerCase(); };

        function icon(name){
            const g=name ? map[norm(name)] : null;
            return g && g.image ? g.image : "";
        }

        out.avatar=icon(look.avatar);
        out.frame=icon(look.frame);
        out.background=icon(look.bg);

    }catch(error){}

    return out;
}


/* Danh sách công khai (giống Bảng xếp hạng): chỉ dùng để vẽ avatar / khung / nền / thuốc, không hiện túi đồ.
   Lỗi mạng tạm thời thì thử lại tối đa 2 lần; hồ sơ bảo mật (STUDENT_PROTECTED) thì không thử lại. */
const PUBLIC_ACCESS={publicList:true,ocdAuthBulk:true};
async function loadWithRetry(R,key){
    let last=null;
    for(let i=0;i<3;i++){
        try{
            return await R.getStudentRewardProfile(key,undefined,false,PUBLIC_ACCESS);
        }catch(error){
            if(error && error.code === "STUDENT_PROTECTED"){
                throw error;
            }
            last=error;
            await new Promise(function(r){ setTimeout(r,1200*(i+1)); });
        }
    }
    throw last;
}

function hasLook(p){
    return Boolean(p && (p.avatar || p.frame || p.background || p.multitask));
}


/* Hồ sơ đã chuẩn hoá, mỗi mã học viên tải một lần cho cả trang */
function profile(code){

    const key=normCode(code);

    if(!key){
        return Promise.resolve(normalize(null));
    }

    if(S.cache.has(key)){
        return S.cache.get(key);
    }

    const promise=
        (async function(){

            let raw=null;

            try{

                if(S.loader){
                    raw=await S.loader(key);
                }else{
                    const R=await waitForCore();
                    if(R){
                        raw=await loadWithRetry(R,key);
                    }
                }

            }catch(error){

                /* Hồ sơ đã bảo mật: người khác không xem được túi đồ, nhưng vẫn hiện "danh thiếp"
                   (avatar / khung / nền chủ tài khoản đã chọn, công khai qua OCDAuth). */
                if(error && error.code === "STUDENT_PROTECTED"){
                    return await publicLook(key);
                }

                throw error;
            }

            if(!raw && S.loader){
                return await publicLook(key);
            }

            return normalize(raw);
        })()
        .catch(
            function(error){
                console.warn("[OCD Identity]",key,error && error.message ? error.message : error);
                S.cache.delete(key);
                return normalize(null);
            }
        );

    S.cache.set(key,promise);

    return promise;
}


function bgTarget(card){

    const t=card.__ocdidBg;

    if(t === false){
        return null;
    }

    if(t && t.nodeType === 1){
        return t;
    }

    return card;
}


/* Vẽ (hoặc vẽ lại) thẻ theo hồ sơ */
function paint(card,data){

    if(!card || !card.querySelector){
        return card;
    }

    const p=(data && ("multitask" in data) && ("background" in data)) ? data : normalize(data);

    /* Hồ sơ rỗng (trang chưa có dữ liệu / tải lỗi) không được xoá thẻ đã vẽ đầy đủ */
    if(!hasLook(p) && card.__ocdidHas){
        return card;
    }

    card.__ocdidHas=hasLook(p);

    const face=card.querySelector(".ocdid-face");
    const av=card.querySelector(".ocdid-av");
    const nameWrap=card.querySelector(".ocdid-namewrap");
    const nameEl=card.querySelector(".ocdid-name");
    const name=card.__ocdidName || "";

    /* AVATAR */
    face.innerHTML="";

    const avatar=imageUrl(p.avatar,200);

    if(avatar){

        const img=document.createElement("img");

        img.src=avatar;
        img.alt=name || "Học viên";
        img.loading="lazy";
        img.decoding="async";

        img.onerror=function(){
            img.remove();
            face.textContent=letter(name);
        };

        face.appendChild(img);

    }else{

        face.textContent=letter(name);
    }

    /* KHUNG AVATAR */
    const oldFrame=av.querySelector(".ocdid-frame");

    if(oldFrame){
        oldFrame.remove();
    }

    const frame=imageUrl(p.frame,240);

    if(frame){

        const f=document.createElement("img");

        f.className="ocdid-frame";
        f.src=frame;
        f.alt="";
        f.loading="lazy";
        f.decoding="async";

        f.onerror=function(){ f.remove(); };

        av.appendChild(f);
    }

    /* NỀN HỒ SƠ */
    const target=bgTarget(card);

    if(target){

        const bg=imageUrl(p.background,900);

        target.classList.toggle("ocdid-bg",Boolean(bg));

        card.classList.toggle("ocdid-has-bg",Boolean(bg) && target === card);

        target.style.backgroundImage=
            bg
            ? "linear-gradient(90deg,rgba(255,253,248,.9),rgba(255,253,248,.78)),url(\"" + bg.replace(/["\\]/g,"") + "\")"
            : "";
    }

    /* HIỆU ỨNG THUỐC ĐA NHIỆM (dùng đúng hàm của Reward Core) */
    const R=rs();
    const size=card.classList.contains("ocdid-lg") ? "large" : (card.classList.contains("ocdid-sm") ? "small" : "medium");

    if(R && typeof R.clearMultitaskEffect === "function"){
        try{ R.clearMultitaskEffect(nameWrap,nameEl); }catch(error){}
    }

    if(p.multitask && R && typeof R.applyMultitaskEffect === "function"){
        try{ R.applyMultitaskEffect(nameWrap,nameEl,{size:size}); }catch(error){}
    }

    card.classList.toggle("ocdid-multitask",Boolean(p.multitask));

    card.setAttribute("data-ocdid-ready","1");

    return card;
}


function create(options){

    injectCss();

    const o=options || {};

    const size=/^(sm|md|lg)$/.test(o.size) ? o.size : "md";

    const card=document.createElement("div");

    card.className="ocdid ocdid-" + size + (o.className ? " " + o.className : "");

    card.__ocdidName=o.name || "Học viên";

    card.__ocdidBg=(o.background === undefined) ? true : o.background;

    if(o.code){
        card.setAttribute("data-ocdid-code",normCode(o.code));
    }

    const av=document.createElement("span");

    av.className="ocdid-av";

    const face=document.createElement("span");

    face.className="ocdid-face";

    face.textContent=letter(o.name);

    av.appendChild(face);

    const txt=document.createElement("span");

    txt.className="ocdid-txt";

    const nameWrap=document.createElement("span");

    nameWrap.className="ocdid-namewrap";

    const nameEl=document.createElement("b");

    nameEl.className="ocdid-name";

    nameEl.textContent=o.name || "Học viên";

    nameEl.title=o.name || "";

    nameWrap.appendChild(nameEl);

    txt.appendChild(nameWrap);

    if(o.meta){

        const meta=document.createElement("small");

        meta.className="ocdid-meta";

        meta.textContent=o.meta;

        txt.appendChild(meta);
    }

    card.append(av,txt);

    const given=o.profile ? normalize(o.profile) : null;

    if(given){
        paint(card,given);
    }

    /* Hồ sơ trang đưa vào không có avatar/khung/nền/thuốc -> vẫn tự tải theo mã */
    if(o.code && !hasLook(given)){

        profile(o.code).then(
            function(p){
                paint(card,p);
            }
        );
    }

    return card;
}


window.OCDIdentity={
    version:"1.1.0",
    create:create,
    paint:paint,
    profile:profile,
    normalize:normalize,
    imageUrl:imageUrl,
    setLoader:function(fn){
        S.loader=typeof fn === "function" ? fn : null;
    },
    prime:function(code,raw){
        /* trang đã có sẵn hồ sơ (vd. tự tải) thì nạp vào bộ nhớ chung, tránh tải lại */
        const key=normCode(code);
        if(key && raw){
            S.cache.set(key,Promise.resolve(normalize(raw)));
        }
    }
};

})();
