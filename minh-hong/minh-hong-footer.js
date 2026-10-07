(function(){
 
"use strict";
 
 
/* =========================================================
   DUPLICATE GUARD
========================================================= */
 
if(
    window.__OCD_MINH_HONG_FOOTER_V1574__
){
    return;
}
 
window.__OCD_MINH_HONG_FOOTER_V1574__=
    true;
 
 
/* =========================================================
   CONFIG
========================================================= */
 
const CONFIG={
 
    version:
        "1.5.8.0",
 
    enabled:
        true,
 
 
    /* =====================================================
       AVATAR
    ===================================================== */
 
    avatarUrl:
        "https://drive.google.com/thumbnail?id=1mHxTCbL1vxiveuALFl6cdY-Ajwew2vpJ&sz=w400",
 
 
    /* =====================================================
       COMMUNITY CSV
    ===================================================== */
 
    csvUrl:
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vRP5cc8duj1XrCXMrymo6Cj7aqIkWfX6bHxGeW-lXcSewfQXhM8fZ5rzbNIQ9mBeVuB8yYr_o1aBoYA/pub?output=csv",
 
    /* =====================================================
       STUDENT VERIFICATION SOURCE 2 - HocVien
       Chỉ dùng để xác minh mã học viên.
       Không thay thế COMMUNITY CSV và không đổi logic module khác.
    ===================================================== */
 
    studentSpreadsheetId:
        "1GJoTRsbq0kZfZrDdh0uCC667PwS3Bgkje2fHQnwnCKs",
 
    studentSheetName:
        "HocVien",
 
    teacherName:
        "Thầy Thanh Phong",
 
 
    /* =====================================================
       STORAGE
    ===================================================== */
 
    communityCacheKey:
        "ocd_minh_hong_community_cache_v1",
 
    communityCacheTime:
        10*60*1000,
 
    sessionKey:
        "ocd_student_session_v1",
 
    preferenceKey:
        "ocd_minh_hong_preferences_v1",
 
    insightStorageKey:
        "ocd_minh_hong_student_insight_v1",
 
    insightMaxAge:
        24*60*60*1000,
 
 
    /* =====================================================
       MINH HỒNG CONTENT SHEET v1.5.4
    ===================================================== */
 
    contentSpreadsheetId:
        "1-J6sXAbiepK6C3Bx0JQ3916Y7JNfBIyGrxvQuJYqx74",
 
    contentCachePrefix:
        "ocd_minh_hong_content_v155_",
 
    contentCacheTime:
        20*60*1000,
 
    guestJourneyKey:
        "ocd_minh_hong_guest_journey_v1",
 
    guestJourneyMaxSeen:
        120,
 
    /* =====================================================
       CONTEXT SPEECH v1.5.6.1
    ===================================================== */
    speechCooldownKey:
        "ocd_minh_hong_speech_cooldown_v1",
 
    speechCooldownTime:
        12*60*60*1000,
 
    speechMaxHistory:
        160,
 
 
    /* =====================================================
       COMMUNITY EVENT LIMIT
    ===================================================== */
 
    gemEventLimit:
        15,
 
    uploadEventLimit:
        5,
 
    commentEventLimit:
        5,
 
    eventWindow:
        24*60*60*1000,
 
 
    /* =====================================================
       NOTIFICATION
    ===================================================== */
 
    initializeDelay:
        3500,
 
    firstNotificationDelay:
        1500,
 
    personalFirstDelay:
        1800,
 
    visibleTime:
        6500,
 
    gapTime:
        5000,
 
    personalGapTime:
        5500,
 
    maxPersonalNotifications:
        5,
 
    oneDay:
        24*60*60*1000
 
};
 
 
if(
    !CONFIG.enabled
){
    return;
}
 
 
/* =========================================================
   SAFE CHARACTERS
========================================================= */
 
const CHAR={
 
    quoteOpen:
        String.fromCodePoint(0x201C),
 
    quoteClose:
        String.fromCodePoint(0x201D),
 
    close:
        String.fromCodePoint(0x00D7),
 
    arrow:
        String.fromCodePoint(0x2192),
 
    check:
        String.fromCodePoint(0x2713),
 
    bullet:
        String.fromCodePoint(0x2022),
 
    dot:
        String.fromCodePoint(0x00B7)
 
};
 
 
/* =========================================================
   ICONS
========================================================= */
 
const ICONS={
 
    gem:
        String.fromCodePoint(0x1F48E),
 
    crown:
        String.fromCodePoint(0x1F451),
 
    upload:
        String.fromCodePoint(0x1F4E4),
 
    teacher:
        String.fromCodePoint(
            0x1F9D1,
            0x200D,
            0x1F3EB
        ),
 
    success:
        String.fromCodePoint(0x2705),
 
    bell:
        String.fromCodePoint(0x1F514),
 
    mute:
        String.fromCodePoint(0x1F515),
 
    user:
        String.fromCodePoint(0x1F464),
 
    home:
        String.fromCodePoint(0x1F3E0),
 
    book:
        String.fromCodePoint(0x1F4D6),
 
    info:
        String.fromCodePoint(0x2139),
 
    community:
        String.fromCodePoint(0x1F4E2),
 
    activity:
        String.fromCodePoint(0x26A1),
 
    logout:
        String.fromCodePoint(0x21AA),
 
    back:
        String.fromCodePoint(0x2190),
 
    key:
        String.fromCodePoint(0x1F511),
 
    brain:
        String.fromCodePoint(0x1F9E0),
 
    chart:
        String.fromCodePoint(0x1F4CA),
 
    up:
        String.fromCodePoint(0x2197),
 
    down:
        String.fromCodePoint(0x2198),
 
    stable:
        String.fromCodePoint(0x2192),
 
    target:
        String.fromCodePoint(0x1F3AF),
 
    gift:
        String.fromCodePoint(0x1F381),
 
    warning:
        String.fromCodePoint(0x26A0),
 
    tip:
        String.fromCodePoint(0x1F4A1),
 
    fire:
        String.fromCodePoint(0x1F525)
 
};
 
 
/* =========================================================
   GIFT RULES
========================================================= */
 
const GIFT_RULES=[
 
    {
        id:1,
        type:"streak",
        value:5,
        hoangNgocValue:1
    },
 
    {
        id:2,
        type:"streak",
        value:7,
        hoangNgocValue:2
    },
 
    {
        id:3,
        type:"streak",
        value:14,
        hoangNgocValue:4
    },
 
    {
        id:4,
        type:"streak",
        value:30,
        hoangNgocValue:8
    },
 
    {
        id:5,
        type:"highBlock",
        block:3,
        count:1,
        hoangNgocValue:2
    },
 
    {
        id:6,
        type:"highBlock",
        block:4,
        count:1,
        hoangNgocValue:3
    },
 
    {
        id:7,
        type:"highBlock",
        block:5,
        count:1,
        hoangNgocValue:4
    },
 
    {
        id:8,
        type:"highBlock",
        block:3,
        count:2,
        hoangNgocValue:4
    },
 
    {
        id:9,
        type:"highBlock",
        block:4,
        count:2,
        hoangNgocValue:6
    },
 
    {
        id:10,
        type:"highBlock",
        block:5,
        count:2,
        hoangNgocValue:8
    }
 
];
 
 
/* =========================================================
   BASIC HELPERS
========================================================= */
 
/* v1.5.7.5: mọi request tải dữ liệu đều có giới hạn 20 giây và bị huỷ thật khi quá giờ
   (trước đây không có giới hạn: mạng điện thoại chập chờn có thể để request treo mãi). */
const MH_FETCH_TIMEOUT_MS=20000;
function fetchWithTimeout(url,options){
    const ac=new AbortController();
    let timedOut=false;
    const timer=setTimeout(function(){ timedOut=true; ac.abort(); },MH_FETCH_TIMEOUT_MS);
    return fetch(url,Object.assign({},options||{},{signal:ac.signal}))
        .catch(function(error){
            if(timedOut) throw new Error("Nguồn dữ liệu không phản hồi sau 20 giây.");
            throw error;
        })
        .finally(function(){ clearTimeout(timer); });
}


function clean(value){
 
    return String(
        value===undefined ||
        value===null
        ?
        ""
        :
        value
    )
    .replace(
        /\uFEFF/g,
        ""
    )
    .trim();
 
}
 
 
function normalizeCode(value){
 
    return clean(
        value
    )
    .toUpperCase()
    .replace(
        /\s+/g,
        ""
    );
 
}
 
 
function normalizeHeader(value){
 
    return clean(
        value
    )
    .toLowerCase();
 
}
 
 
function parseScore(value){
 
    const text=
        clean(
            value
        )
        .replace(
            ",",
            "."
        );
 
 
    if(!text){
 
        return null;
    }
 
 
    const number=
        Number(
            text
        );
 
 
    return Number.isNaN(
        number
    )
    ?
    null
    :
    number;
 
}
 
 
/* =========================================================
   PAGE CONTEXT
========================================================= */
 
function isHomePage(){
 
    let path=
        String(
            window.location.pathname ||
            "/"
        );
 
 
    if(
        path.length>1
    ){
 
        path=
            path.replace(
                /\/+$/,
                ""
            );
 
    }
 
 
    return(
 
        path==="/"
 
        ||
 
        path==="/index.html"
 
        ||
 
        path==="/index.htm"
 
    );
 
}
 
 
/* =========================================================
   CONTEXT ROUTER v1.4.0
 
   - Trang chủ: COMMUNITY
   - Trang tác phẩm/nộp bài: CLASS PULSE
   - Tất cả trang còn lại: PERSONAL INSIGHT
 
   Mục tiêu v1.4.6:
   Minh Hồng dùng cùng lời khuyên học tập cá nhân đã lưu
   từ trang Tra cứu trên mọi trang còn lại.
   Không yêu cầu các trang con sửa JS và không fetch thêm dữ liệu.
 
   Ưu tiên context do trang con công bố.
   Có fallback theo DOM để tương thích các trang hiện tại.
========================================================= */
function normalizePageContext(value){
    const context=clean(value).toLowerCase();
    if(context==="community" || context==="personal" || context==="class-pulse" || context==="silent"){
        return context;
    }
    return "";
}
 
function getPageContext(){
    if(isHomePage()){
        return "community";
    }
 
    const explicit=normalizePageContext(window.OCDMinhHongPageContext);
    if(explicit){
        return explicit;
    }
 
    if(document.getElementById("ocd4-student-work-page")){
        return "class-pulse";
    }
 
    if(document.getElementById("rewardExchangeApp")){
        return "personal";
    }
 
    /*
       v1.4.6
       Mặc định mọi trang còn lại dùng PERSONAL INSIGHT.
       Dữ liệu lấy từ InsightStore đã có sẵn, không tải thêm Sheet.
    */
    return "personal";
}
 
function isCommunityContext(){ return getPageContext()==="community"; }
function isPersonalContext(){ return getPageContext()==="personal"; }
function isClassPulseContext(){ return getPageContext()==="class-pulse"; }
function isSilentContext(){ return getPageContext()==="silent"; }
 
 
/* =========================================================
   CONTENT TAB ROUTER v1.5.4
 
   Mục tiêu:
   - Khách chỉ tải nội dung của đúng trang đang xem.
   - Guest là fallback chung, không tải đồng thời toàn bộ 9 tab.
   - Trang con có thể khai báo chính xác bằng:
       window.OCDMinhHongContentTab = "LamMo";
========================================================= */
function normalizeContentTab(value){
    const wanted=clean(value).toLowerCase();
    const allowed=[
        "Guest","TrangChu","TraCuu","TacPham","LamMo",
        "ThuVien","GiangDuong","ThiTotNghiep","FAQ"
    ];
    return allowed.find(function(name){
        return name.toLowerCase()===wanted;
    }) || "";
}
 
function getPageContentTab(){
    const explicit=normalizeContentTab(window.OCDMinhHongContentTab);
    if(explicit) return explicit;
 
    if(isHomePage()) return "TrangChu";
 
    /* DOM nhận diện các trang đã biết */
    if(document.getElementById("ocd4-student-work-page")) return "TacPham";
    if(document.getElementById("rewardExchangeApp")) return "TraCuu";
    if(document.getElementById("lectureHallPage")) return "GiangDuong";
    if(document.getElementById("ocdGraduationExamPage")) return "ThiTotNghiep";
 
    const path=String(window.location.pathname || "").toLowerCase();
    const title=String(document.title || "").toLowerCase();
    const haystack=path+" "+title;
 
    if(/tra[-_ ]?cuu|ch[oợ][- _]?phi[eê]n/.test(haystack)) return "TraCuu";
    if(/tac[-_ ]?pham|student[-_ ]?work|n[oộ]p[-_ ]?b[aà]i/.test(haystack)) return "TacPham";
    if(/lam[-_ ]?mo|l[aâ]m[-_ ]?m[oô]/.test(haystack)) return "LamMo";
    if(/giang[-_ ]?duong|gi[aả]ng[-_ ]?[dđ][uư][oơ]ng|lecture[-_ ]?hall/.test(haystack)) return "GiangDuong";
    if(/thi[-_ ]?tot[-_ ]?nghiep|t[oố]t[-_ ]?nghi[eệ]p|graduation/.test(haystack)) return "ThiTotNghiep";
    if(/faq|hoi[-_ ]?dap|h[oỏ]i[-_ ]?[dđ][aá]p/.test(haystack)) return "FAQ";
    if(/thu[-_ ]?vien|th[uư][-_ ]?vi[eệ]n|library/.test(haystack)) return "ThuVien";
 
    return "Guest";
}
 
/* =========================================================
   SAFE STORAGE
========================================================= */
 
function safeStorageGet(key){
 
    try{
 
        return localStorage.getItem(
            key
        );
 
    }catch(error){
 
        return null;
    }
 
}
 
 
function safeStorageSet(
    key,
    value
){
 
    try{
 
        localStorage.setItem(
            key,
            value
        );
 
 
        return true;
 
    }catch(error){
 
        return false;
    }
 
}
 
 
function safeStorageRemove(key){
 
    try{
 
        localStorage.removeItem(
            key
        );
 
    }catch(error){}
 
}
 
 
/* =========================================================
   STUDENT SESSION
========================================================= */
 
const OCDStudentSession=
(function(){
 
    const DEFAULT_STATE={
 
        mode:
            "guest",
 
        code:
            "",
 
        verified:
            false,
 
        updatedAt:
            0
 
    };
 
 
    let memoryState=
        Object.assign(
            {},
            DEFAULT_STATE
        );
 
 
    function sanitizeState(value){
 
        if(
            !value ||
            typeof value!=="object"
        ){
 
            return Object.assign(
                {},
                DEFAULT_STATE
            );
 
        }
 
 
        let mode=
            clean(
                value.mode
            )
            .toLowerCase();
 
 
        const code=
            normalizeCode(
                value.code
            );
 
 
        if(
            mode!=="guest" &&
            mode!=="student"
        ){
 
            mode=
                "guest";
 
        }
 
 
        if(!code){
 
            mode=
                "guest";
 
        }
 
 
        return{
 
            mode:
                mode,
 
            code:
                mode==="guest"
                ?
                ""
                :
                code,
 
            verified:
                mode==="guest"
                ?
                false
                :
                Boolean(
                    value.verified
                ),
 
            updatedAt:
                Number(
                    value.updatedAt ||
                    0
                )
 
        };
 
    }
 
 
    function read(){
 
        const raw=
            safeStorageGet(
                CONFIG.sessionKey
            );
 
 
        if(!raw){
 
            return Object.assign(
                {},
                memoryState
            );
 
        }
 
 
        try{
 
            memoryState=
                sanitizeState(
                    JSON.parse(
                        raw
                    )
                );
 
        }catch(error){
 
            memoryState=
                Object.assign(
                    {},
                    DEFAULT_STATE
                );
 
        }
 
 
        return Object.assign(
            {},
            memoryState
        );
 
    }
 
 
    function save(state){
 
        memoryState=
            sanitizeState(
                state
            );
 
 
        safeStorageSet(
            CONFIG.sessionKey,
            JSON.stringify(
                memoryState
            )
        );
 
 
        return Object.assign(
            {},
            memoryState
        );
 
    }
 
 
    function emit(
        previous,
        current,
        source
    ){
 
        try{
 
            window.dispatchEvent(
                new CustomEvent(
                    "ocdStudentSessionChanged",
                    {
                        detail:{
 
                            previous:
                                Object.assign(
                                    {},
                                    previous
                                ),
 
                            current:
                                Object.assign(
                                    {},
                                    current
                                ),
 
                            source:
                                source ||
                                "unknown"
 
                        }
                    }
                )
            );
 
        }catch(error){}
 
    }
 
 
    function apply(
        state,
        source
    ){
 
        const previous=
            read();
 
 
        const current=
            save(
                state
            );
 
 
        emit(
            previous,
            current,
            source
        );
 
 
        return current;
 
    }
 
 
    function getState(){
 
        return read();
 
    }
 
 
    function getCode(){
 
        return read().code;
 
    }
 
 
    function isGuest(){
 
        return(
            read().mode===
            "guest"
        );
 
    }
 
 
    function isStudent(){
 
        return(
            read().mode===
            "student"
        );
 
    }
 
 
    function isVerified(){
 
        const state=
            read();
 
 
        return Boolean(
 
            state.mode===
            "student"
 
            &&
 
            state.code
 
            &&
 
            state.verified===
            true
 
        );
 
    }
 
 
    function rememberStudent(
        code,
        source
    ){
 
        const normalized=
            normalizeCode(
                code
            );
 
 
        if(!normalized){
 
            return getState();
        }
 
 
        return apply(
            {
                mode:
                    "student",
 
                code:
                    normalized,
 
                verified:
                    false,
 
                updatedAt:
                    Date.now()
            },
            source ||
            "rememberStudent"
        );
 
    }
 
 
    function confirmStudent(
        code,
        source
    ){
 
        const normalized=
            normalizeCode(
                code
            );
 
 
        if(!normalized){
 
            return getState();
        }
 
 
        return apply(
            {
                mode:
                    "student",
 
                code:
                    normalized,
 
                verified:
                    true,
 
                updatedAt:
                    Date.now()
            },
            source ||
            "confirmStudent"
        );
 
    }
 
 
    function clear(source){
 
        const previous=
            read();
 
 
        safeStorageRemove(
            CONFIG.sessionKey
        );
 
 
        memoryState=
            Object.assign(
                {},
                DEFAULT_STATE
            );
 
 
        emit(
            previous,
            memoryState,
            source ||
            "clear"
        );
 
 
        return Object.assign(
            {},
            memoryState
        );
 
    }
 
 
    window.addEventListener(
        "storage",
        function(event){
 
            if(
                event.key!==
                CONFIG.sessionKey
            ){
 
                return;
            }
 
 
            const previous=
                Object.assign(
                    {},
                    memoryState
                );
 
 
            const current=
                read();
 
 
            emit(
                previous,
                current,
                "storage"
            );
 
        }
    );
 
 
    return{
 
        version:
            CONFIG.version,
 
        getState:
            getState,
 
        getCode:
            getCode,
 
        isGuest:
            isGuest,
 
        isStudent:
            isStudent,
 
        isVerified:
            isVerified,
 
        rememberStudent:
            rememberStudent,
 
        confirmStudent:
            confirmStudent,
 
        clear:
            clear,
 
        normalizeCode:
            normalizeCode
 
    };
 
})();
 
 
window.OCDStudentSession=
    OCDStudentSession;
 
 
/* =========================================================
   PREFERENCES
========================================================= */
 
const Preferences=
(function(){
 
    const DEFAULT={
 
        notificationsMuted:
            false
 
    };
 
 
    function get(){
 
        const raw=
            safeStorageGet(
                CONFIG.preferenceKey
            );
 
 
        if(!raw){
 
            return Object.assign(
                {},
                DEFAULT
            );
 
        }
 
 
        try{
 
            const data=
                JSON.parse(
                    raw
                );
 
 
            return{
 
                notificationsMuted:
                    Boolean(
                        data.notificationsMuted
                    )
 
            };
 
        }catch(error){
 
            return Object.assign(
                {},
                DEFAULT
            );
 
        }
 
    }
 
 
    function set(partial){
 
        const next=
            Object.assign(
                {},
                get(),
                partial ||
                {}
            );
 
 
        safeStorageSet(
            CONFIG.preferenceKey,
            JSON.stringify(
                next
            )
        );
 
 
        return next;
 
    }
 
 
    return{
 
        get:
            get,
 
        set:
            set
 
    };
 
})();
 
 
/* =========================================================
   STUDENT INSIGHT STORE
========================================================= */
 
const InsightStore=
(function(){
    /* v1.5.8.0: đã bỏ Lời khuyên học tập cá nhân (không có trang nào gửi dữ liệu ocdStudentInsightReady).
       Giữ lại dạng rỗng để các chỗ gọi cũ không lỗi. */
    return{
        save:function(){ return null; },
        read:function(){ return null; },
        getForCurrentStudent:function(){ return null; },
        clearMemory:function(){}
    };
})();
 
 
/* =========================================================
   GUEST JOURNEY v1.5.4
 
   - Ghi nhớ nhẹ hành trình của khách trong localStorage.
   - Kích hoạt đúng điều kiện first_visit / returning_guest.
   - Ưu tiên nội dung chưa xem, nhưng KHÔNG làm mất fallback.
   - Không chứa dữ liệu học viên và không can thiệp Student Session.
========================================================= */
const GuestJourney=
(function(){
 
    const DEFAULT_STATE={
        firstSeenAt:0,
        lastSeenAt:0,
        visitCount:0,
        pageVisits:{},
        seenItems:{}
    };
 
    let registeredThisPage=false;
 
    function sanitize(value){
        value=(value && typeof value==="object") ? value : {};
        return {
            firstSeenAt:Number(value.firstSeenAt || 0),
            lastSeenAt:Number(value.lastSeenAt || 0),
            visitCount:Math.max(0,Number(value.visitCount || 0)),
            pageVisits:(value.pageVisits && typeof value.pageVisits==="object") ? value.pageVisits : {},
            seenItems:(value.seenItems && typeof value.seenItems==="object") ? value.seenItems : {}
        };
    }
 
    function read(){
        const raw=safeStorageGet(CONFIG.guestJourneyKey);
        if(!raw) return sanitize(DEFAULT_STATE);
        try{ return sanitize(JSON.parse(raw)); }
        catch(error){ return sanitize(DEFAULT_STATE); }
    }
 
    function save(state){
        state=sanitize(state);
        safeStorageSet(CONFIG.guestJourneyKey,JSON.stringify(state));
        return state;
    }
 
    function registerVisit(tab){
        if(registeredThisPage) return read();
        registeredThisPage=true;
 
        tab=normalizeContentTab(tab) || "Guest";
        const state=read();
        const now=Date.now();
 
        if(!state.firstSeenAt) state.firstSeenAt=now;
        state.lastSeenAt=now;
        state.visitCount+=1;
        state.pageVisits[tab]=Math.max(0,Number(state.pageVisits[tab] || 0))+1;
        return save(state);
    }
 
    function getContext(tab){
        tab=normalizeContentTab(tab) || "Guest";
        const state=read();
        const visits=Math.max(0,Number(state.visitCount || 0));
        const pageVisits=Math.max(0,Number(state.pageVisits[tab] || 0));
        return {
            firstVisit:visits<=1,
            returningGuest:visits>1,
            pageFirstVisit:pageVisits<=1,
            pageReturning:pageVisits>1,
            visitCount:visits,
            pageVisitCount:pageVisits
        };
    }
 
    function itemKey(tab,item){
        tab=normalizeContentTab(tab) || "Guest";
        const id=clean(item && item.id);
        return tab+":"+(id || clean(item && item.title) || "item");
    }
 
    function isSeen(tab,item){
        const state=read();
        return Boolean(state.seenItems[itemKey(tab,item)]);
    }
 
    function markSeen(tab,items){
        if(!Array.isArray(items) || !items.length) return;
        const state=read();
        const now=Date.now();
 
        items.forEach(function(item){
            state.seenItems[itemKey(tab,item)]=now;
        });
 
        const keys=Object.keys(state.seenItems).sort(function(a,b){
            return Number(state.seenItems[b] || 0)-Number(state.seenItems[a] || 0);
        });
        keys.slice(CONFIG.guestJourneyMaxSeen).forEach(function(key){
            delete state.seenItems[key];
        });
        save(state);
    }
 
    function preferUnseen(tab,items){
        if(!Array.isArray(items) || !items.length) return [];
        const unseen=items.filter(function(item){ return !isSeen(tab,item); });
        return unseen.length ? unseen : items.slice();
    }
 
    return {
        version:"1.5.4",
        registerVisit:registerVisit,
        getContext:getContext,
        isSeen:isSeen,
        markSeen:markSeen,
        preferUnseen:preferUnseen
    };
 
})();
 
window.OCDMinhHongGuestJourney=GuestJourney;
 
 
/* =========================================================
   CONTENT ENGINE v1.5.4
 
   - Đọc nội dung điều khiển từ Google Sheet MinhHong
   - Chỉ tải tab được yêu cầu (lazy-load)
   - Cache riêng từng tab trong localStorage
   - Sheet lỗi: trả dữ liệu cache cũ hoặc [] và KHÔNG làm hỏng Minh Hồng
   - Ngày trống = luôn có hiệu lực
   - Ưu tiên số lớn hiển thị trước
========================================================= */
 
 
/* =========================================================
   MINH HỒNG CONTEXT BRIDGE v1.5.4
   Trang học tính dữ liệu; Minh Hồng chỉ đọc context.
========================================================= */
const MinhHongContextStore=(function(){
    let state={page:"",studentCode:"",data:{},conditions:{},updatedAt:0,source:""};
 
    function obj(v){return v&&typeof v==="object"&&!Array.isArray(v)?v:{};}
    function clone(v){try{return JSON.parse(JSON.stringify(v));}catch(e){return v;}}
    function emit(previous,current){
        try{
            window.dispatchEvent(new CustomEvent("ocdMinhHongContextChanged",{
                detail:{previous:clone(previous),current:clone(current)}
            }));
        }catch(e){}
    }
    function set(next,source){
        next=obj(next);
        const previous=clone(state);
        state={
            page:clean(next.page),
            studentCode:OCDStudentSession.normalizeCode(next.studentCode),
            data:Object.assign({},obj(next.data)),
            conditions:Object.assign({},obj(next.conditions)),
            updatedAt:Date.now(),
            source:clean(source||next.source||"page")
        };
        emit(previous,state);
        return clone(state);
    }
    function patch(next,source){
        next=obj(next);
        return set({
            page:next.page!==undefined?next.page:state.page,
            studentCode:next.studentCode!==undefined?next.studentCode:state.studentCode,
            data:Object.assign({},state.data,obj(next.data)),
            conditions:Object.assign({},state.conditions,obj(next.conditions))
        },source||next.source||state.source||"page");
    }
    function clear(source){
        const previous=clone(state);
        state={page:"",studentCode:"",data:{},conditions:{},updatedAt:Date.now(),source:clean(source||"clear")};
        emit(previous,state);
        return clone(state);
    }
    function getState(){return clone(state);}
    function getForStudent(code){
        const wanted=OCDStudentSession.normalizeCode(code);
        const current=OCDStudentSession.normalizeCode(state.studentCode);
        if(wanted&&current&&wanted!==current){
            return {page:"",studentCode:wanted,data:{},conditions:{},updatedAt:0,source:""};
        }
        return clone(state);
    }
    return{version:"1.5.4",set:set,patch:patch,clear:clear,getState:getState,getForStudent:getForStudent};
})();
window.OCDMinhHongContext=MinhHongContextStore;
 
const MinhHongContentEngine=
(function(){
 
    const memory=Object.create(null);
    const loading=Object.create(null);
 
    const ALLOWED_TABS=[
        "Guest",
        "TrangChu",
        "TraCuu",
        "TacPham",
        "LamMo",
        "ThuVien",
        "GiangDuong",
        "ThiTotNghiep",
        "FAQ"
    ];
 
    function normalizeTab(tab){
        const wanted=clean(tab);
        const found=ALLOWED_TABS.find(function(name){
            return name.toLowerCase()===wanted.toLowerCase();
        });
        return found || "";
    }
 
    function cacheKey(tab){
        return CONFIG.contentCachePrefix+tab.toLowerCase();
    }
 
    function parseCSV(text){
        const rows=[];
        let row=[];
        let cell="";
        let quoted=false;
 
        for(let i=0;i<text.length;i++){
            const ch=text[i];
            const next=text[i+1];
 
            if(ch==='"' && quoted && next==='"'){
                cell+='"';
                i++;
            }else if(ch==='"'){
                quoted=!quoted;
            }else if(ch==="," && !quoted){
                row.push(cell);
                cell="";
            }else if((ch==="\n" || ch==="\r") && !quoted){
                if(ch==="\r" && next==="\n") i++;
                row.push(cell);
                if(row.some(function(v){ return clean(v)!==""; })) rows.push(row);
                row=[];
                cell="";
            }else{
                cell+=ch;
            }
        }
 
        if(cell!=="" || row.length){
            row.push(cell);
            if(row.some(function(v){ return clean(v)!==""; })) rows.push(row);
        }
 
        return rows;
    }
 
    function headerKey(value){
        return clean(value)
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g,"")
            .replace(/đ/g,"d")
            .replace(/[^a-z0-9]+/g,"");
    }
 
    function parseVNDate(value,endOfDay){
        const text=clean(value);
        if(!text) return null;
 
        let m=text.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
        if(m){
            const hasTime=m[4]!==undefined;
            const hour=hasTime ? Number(m[4]) : (endOfDay ? 23 : 0);
            const minute=hasTime ? Number(m[5]||0) : (endOfDay ? 59 : 0);
            const second=hasTime ? Number(m[6]||0) : (endOfDay ? 59 : 0);
            return Date.UTC(Number(m[3]),Number(m[2])-1,Number(m[1]),hour-7,minute,second);
        }
 
        const d=new Date(text);
        return Number.isNaN(d.getTime()) ? null : d.getTime();
    }
 
    function mapRows(csv){
        const rows=parseCSV(csv);
        if(rows.length<2) return [];
 
        const headers=rows[0].map(headerKey);
        function idx(name){ return headers.indexOf(headerKey(name)); }
 
        const col={
            id:idx("ID"),
            status:idx("Trạng thái"),
            audience:idx("Đối tượng"),
            condition:idx("Điều kiện"),
            title:idx("Tiêu đề"),
            content:idx("Nội dung"),
            button:idx("Nút"),
            link:idx("Link"),
            priority:idx("Ưu tiên"),
            start:idx("Ngày bắt đầu"),
            end:idx("Ngày kết thúc"),
            display:idx("Hiển thị")
        };
 
        const now=Date.now();
 
        return rows.slice(1).map(function(row,index){
            function val(i){ return i>=0 ? clean(row[i]) : ""; }
            const start=parseVNDate(val(col.start),false);
            const end=parseVNDate(val(col.end),true);
            return {
                id:val(col.id) || ("ROW"+(index+2)),
                status:val(col.status).toUpperCase(),
                audience:val(col.audience).toLowerCase(),
                condition:val(col.condition).toLowerCase() || "always",
                title:val(col.title),
                content:val(col.content),
                button:val(col.button),
                link:val(col.link),
                priority:Number(val(col.priority)) || 0,
                startAt:start,
                endAt:end,
                display:val(col.display).toLowerCase() || "panel"
            };
        }).filter(function(item){
            if(item.status && item.status!=="ON") return false;
            if(item.startAt!==null && now<item.startAt) return false;
            if(item.endAt!==null && now>item.endAt) return false;
            return Boolean(item.title || item.content);
        }).sort(function(a,b){
            return b.priority-a.priority;
        });
    }
 
    function readCache(tab,allowExpired){
        const raw=safeStorageGet(cacheKey(tab));
        if(!raw) return null;
        try{
            const data=JSON.parse(raw);
            if(!data || !Array.isArray(data.items) || !data.savedAt) return null;
            if(!allowExpired && Date.now()-Number(data.savedAt)>CONFIG.contentCacheTime) return null;
            return data.items;
        }catch(error){
            return null;
        }
    }
 
    function saveCache(tab,items){
        safeStorageSet(cacheKey(tab),JSON.stringify({savedAt:Date.now(),items:items}));
    }
 
    function csvUrl(tab){
        return "https://docs.google.com/spreadsheets/d/"+
            encodeURIComponent(CONFIG.contentSpreadsheetId)+
            "/gviz/tq?tqx=out:csv&sheet="+
            encodeURIComponent(tab)+
            "&_="+Date.now();
    }
 
    function load(tab,options){
        tab=normalizeTab(tab);
        options=options || {};
        if(!tab) return Promise.resolve([]);
 
        if(memory[tab] && !options.force){
            return Promise.resolve(memory[tab].slice());
        }
 
        const cached=readCache(tab,false);
        if(cached && !options.force){
            memory[tab]=cached;
            return Promise.resolve(cached.slice());
        }
 
        if(loading[tab]) return loading[tab];
 
        loading[tab]=fetchWithTimeout(csvUrl(tab),{cache:"no-store",credentials:"omit"})
            .then(function(response){
                if(!response.ok) throw new Error("HTTP "+response.status);
                return response.text();
            })
            .then(function(text){
                const items=mapRows(text);
                memory[tab]=items;
                saveCache(tab,items);
                return items.slice();
            })
            .catch(function(error){
                console.warn("[Minh Hồng] Content "+tab+":",error);
                const stale=readCache(tab,true) || [];
                if(stale.length) memory[tab]=stale;
                return stale.slice();
            })
            .finally(function(){
                loading[tab]=null;
            });
 
        return loading[tab];
    }
 
    function get(tab){
        tab=normalizeTab(tab);
        if(!tab) return [];
        if(memory[tab]) return memory[tab].slice();
        return (readCache(tab,false) || []).slice();
    }
 
    /* =====================================================
       AUDIENCE / CONDITION MATCHER v1.5.4
 
       Guest:
       - Đối tượng trống / all / guest
       - always / first_visit / returning_guest
 
       Student:
       - Đối tượng trống / all / student
       - Chỉ dùng khi Student Session đã VERIFIED
       - always / verified_student
 
       Các điều kiện dữ liệu học tập nâng cao sẽ được bổ sung
       sau; Content Engine không tự trở thành Reward Core.
    ===================================================== */
    function matches(item,context){
        context=context || {};
 
        const mode=
            clean(context.mode).toLowerCase() || "guest";
 
        const audience=
            clean(item.audience).toLowerCase();
 
        if(mode==="student"){
            if(
                audience &&
                audience!=="all" &&
                audience!=="student"
            ){
                return false;
            }
        }else{
            if(
                audience &&
                audience!=="all" &&
                audience!=="guest"
            ){
                return false;
            }
        }
 
        const condition=
            clean(item.condition).toLowerCase();
 
        if(!condition || condition==="always"){
            return true;
        }
 
        if(mode==="student"){
            if(condition==="verified_student"){
                return Boolean(context.verified);
            }
            if(
                context.conditions &&
                Object.prototype.hasOwnProperty.call(context.conditions,condition)
            ){
                return Boolean(context.conditions[condition]);
            }
            return false;
        }
 
        if(condition==="first_visit"){
            return Boolean(context.firstVisit);
        }
 
        if(condition==="returning_guest"){
            return Boolean(context.returningGuest);
        }
 
        return false;
    }
 
    function getForGuest(tab,context){
        context=Object.assign({},context || {},{
            mode:"guest"
        });
 
        return get(tab).filter(function(item){
            return matches(item,context);
        });
    }
 
    function getForStudent(tab,context){
        context=Object.assign({},context || {},{
            mode:"student",
            verified:Boolean(
                context && context.verified
            )
        });
 
        if(!context.verified){
            return [];
        }
 
        return get(tab).filter(function(item){
            return matches(item,context);
        });
    }
 
    return {
        version:"1.5.5",
        load:load,
        get:get,
        getForGuest:getForGuest,
        getForStudent:getForStudent,
        tabs:ALLOWED_TABS.slice()
    };
 
})();
 
window.OCDMinhHongContent=MinhHongContentEngine;
 
 
/* =========================================================
   COMMUNITY ENGINE
========================================================= */
 
const CommunityEngine=
(function(){
 
    /* v1.5.8.0: đã bỏ Bảng tin cộng đồng (tự tính lại linh thạch từ toàn bộ CSV bài nộp).
       Module chỉ còn phần xác minh mã học viên – GIỮ NGUYÊN quy tắc 2 nguồn của v1.5.7.5.
       load / getEvents / isReady giữ lại dạng rỗng để các chỗ gọi cũ không lỗi.
       Bản đầy đủ: minh-hong/minh-hong-footer.v1.5.7.5.js */
 
    function parseCSV(text){
 
        const rows=[];
 
        let row=[];
 
        let cell="";
 
        let insideQuotes=false;
 
 
        for(
            let i=0;
            i<text.length;
            i++
        ){
 
            const char=
                text[i];
 
 
            const next=
                text[i+1];
 
 
            if(
                char==='"' &&
                insideQuotes &&
                next==='"'
            ){
 
                cell+='"';
 
                i++;
 
            }
 
            else if(
                char==='"'
            ){
 
                insideQuotes=
                    !insideQuotes;
 
            }
 
            else if(
                char==="," &&
                !insideQuotes
            ){
 
                row.push(
                    cell
                );
 
 
                cell="";
 
            }
 
            else if(
                (
                    char==="\n" ||
                    char==="\r"
                )
                &&
                !insideQuotes
            ){
 
                if(
                    char==="\r" &&
                    next==="\n"
                ){
 
                    i++;
 
                }
 
 
                row.push(
                    cell
                );
 
 
                rows.push(
                    row
                );
 
 
                row=[];
 
                cell="";
 
            }
 
            else{
 
                cell+=char;
 
            }
 
        }
 
 
        if(
            cell!=="" ||
            row.length
        ){
 
            row.push(
                cell
            );
 
 
            rows.push(
                row
            );
 
        }
 
 
        return rows;
 
    }


    function getColumns(rows){
 
        const headers=
            rows[0]
            .map(
                normalizeHeader
            );
 
 
        const codeIndex=
            headers.findIndex(
                function(header){
 
                    return header.includes(
                        "mã học viên"
                    );
 
                }
            );
 
 
        const nameIndex=
            headers.findIndex(
                function(header){
 
                    return header.includes(
                        "họ và tên"
                    );
 
                }
            );
 
 
        const timeIndex=
            headers.findIndex(
                function(header){
 
                    return(
                        header.includes(
                            "dấu thời gian"
                        )
                        ||
                        header.includes(
                            "thời gian"
                        )
                        ||
                        header.includes(
                            "timestamp"
                        )
                    );
 
                }
            );
 
 
        const scoreIndex=
            headers.findIndex(
                function(header){
 
                    return(
                        header==="điểm"
                        ||
                        header.includes(
                            "điểm số"
                        )
                    );
 
                }
            );
 
 
        const fileIndex=
            headers.findIndex(
                function(header){
 
                    return(
                        header.includes(
                            "tải bài"
                        )
                        ||
                        header.includes(
                            "bài tập"
                        )
                        ||
                        header.includes(
                            "tệp"
                        )
                        ||
                        header.includes(
                            "file"
                        )
                    );
 
                }
            );
 
 
        let commentIndex=
            headers.findIndex(
                function(header){
 
                    return header.includes(
                        "nhận xét"
                    );
 
                }
            );
 
 
        if(
            commentIndex===
            -1
        ){
 
            commentIndex=8;
 
        }
 
 
        return{
            codeIndex,
            nameIndex,
            timeIndex,
            scoreIndex,
            fileIndex,
            commentIndex
        };
 
    }


    async function verifyStudentCode(code){

        const wanted=normalizeCode(code);

        if(!wanted){
            return {
                ok:false,
                code:"",
                name:"",
                reason:"empty"
            };
        }


        function findStudentInRows(rows,sourceName){

            if(!rows || rows.length<2){
                return null;
            }

            const columns=getColumns(rows);

            if(columns.codeIndex<0){
                return null;
            }

            for(let i=1;i<rows.length;i++){

                const row=rows[i] || [];
                const rowCode=normalizeCode(row[columns.codeIndex]);

                if(rowCode===wanted){

                    return {
                        ok:true,
                        code:wanted,
                        name:columns.nameIndex>=0
                            ? clean(row[columns.nameIndex])
                            : "",
                        reason:"found",
                        source:sourceName
                    };
                }
            }

            return null;
        }


        /* v1.5.8.0: nguồn 1 (bài nộp) – hỏi Reward Core đúng bài nộp của mã này
           (Apps Script lọc sẵn ở máy chủ; Core tự quay về CSV khi lỗi).
           Trang không có Reward Core -> tải CSV toàn bộ như v1.5.7.5. Quy tắc xác minh giữ nguyên. */
        async function loadOriginalVerificationSource(){

            const RS=window.StudentRewardSystem;

            if(RS && typeof RS.getStudentSubmissionsCsv==="function"){
                try{
                    if(window.StudentRewardSystemReady){
                        await window.StudentRewardSystemReady;
                    }
                    return parseCSV(await RS.getStudentSubmissionsCsv(wanted));
                }catch(error){
                    console.warn("[Minh Hồng] Reward Core chưa đọc được bài nộp, dùng CSV:",error && error.message || error);
                }
            }

            const separator=
                CONFIG.csvUrl.indexOf("?")>=0
                ? "&"
                : "?";

            const response=await fetchWithTimeout(
                CONFIG.csvUrl+separator+"mh_verify="+Date.now(),
                {
                    cache:"no-store",
                    credentials:"omit"
                }
            );

            if(!response.ok){
                throw new Error("Không thể tải nguồn xác minh học viên hiện tại.");
            }

            const csv=await response.text();

            return parseCSV(csv);
        }


        async function loadHocVienVerificationSource(){

            const url=
                "https://docs.google.com/spreadsheets/d/"
                +CONFIG.studentSpreadsheetId
                +"/gviz/tq?tqx=out:csv&sheet="
                +encodeURIComponent(CONFIG.studentSheetName)
                +"&mh_verify="
                +Date.now();

            const response=await fetchWithTimeout(
                url,
                {
                    cache:"no-store",
                    credentials:"omit"
                }
            );

            if(!response.ok){
                throw new Error("Không thể tải tab HocVien.");
            }

            const csv=await response.text();

            return parseCSV(csv);
        }


        const results=await Promise.allSettled([
            loadOriginalVerificationSource(),
            loadHocVienVerificationSource()
        ]);


        if(results[0].status==="fulfilled"){

            const foundOriginal=
                findStudentInRows(
                    results[0].value,
                    "community"
                );

            if(foundOriginal){
                return foundOriginal;
            }
        }


        if(results[1].status==="fulfilled"){

            const foundHocVien=
                findStudentInRows(
                    results[1].value,
                    "HocVien"
                );

            if(foundHocVien){
                return foundHocVien;
            }
        }


        if(
            results[0].status==="rejected"
            &&
            results[1].status==="rejected"
        ){

            console.warn(
                "[Minh Hồng] Cả hai nguồn xác minh học viên đều lỗi.",
                results[0].reason,
                results[1].reason
            );

            throw new Error("Không thể tải dữ liệu xác minh học viên.");
        }


        if(results[0].status==="rejected"){
            console.warn(
                "[Minh Hồng] Nguồn xác minh hiện tại tạm lỗi:",
                results[0].reason
            );
        }

        if(results[1].status==="rejected"){
            console.warn(
                "[Minh Hồng] Tab HocVien tạm lỗi:",
                results[1].reason
            );
        }


        return {
            ok:false,
            code:wanted,
            name:"",
            reason:"not-found"
        };
    }


    return{
 
        load:
            function(){
                return Promise.resolve([]);
            },
 
        getEvents:
            function(){
                return [];
            },
 
        verifyStudentCode,
 
        isReady:
            function(){
                return true;
            }
 
    };
 
})();
 
 
window.OCDCommunityActivity=
    CommunityEngine;
 
 
/* =========================================================
   MINH HỒNG UI
========================================================= */
 
const MinhHongAssistant=
(function(){
 
    let root=null;
 
    let launcher=null;
 
    let notification=null;
 
    let notificationLabel=null;
 
    let notificationTitle=null;
 
    let notificationText=null;
 
    let notificationTime=null;
 
    let notificationIcon=null;
 
    let panelBody=null;
 
    let muteButton=null;
 
    let panelOpen=false;
 
    let guestView="home";
 
 
    let notificationsMuted=
        Preferences
        .get()
        .notificationsMuted;
 
 
    let communityNotificationEvents=[];
 
    let personalNotificationEvents=[];
 
    let classPulseNotificationEvents=[];
 
    /* Context → chủ động nói, nhưng dùng chung notification UI cũ. */
    let contextSpeechEvents=[];
 
    let classPulseState=null;
 
 
    let currentIndex=0;
 
    let firstTimer=null;
 
    let nextTimer=null;
 
    let hideTimer=null;
 
 
    function makeElement(
        tag,
        className,
        text
    ){
 
        const element=
            document.createElement(
                tag
            );
 
 
        if(className){
 
            element.className=
                className;
 
        }
 
 
        if(
            text!==undefined
        ){
 
            element.textContent=
                text;
 
        }
 
 
        return element;
 
    }
 
 
    function clearNode(node){
 
        if(!node){
 
            return;
        }
 
 
        while(
            node.firstChild
        ){
 
            node.removeChild(
                node.firstChild
            );
 
        }
 
    }
 
 
    function relativeTime(time){
 
        const diff=
            Date.now()-
            Number(
                time
            );
 
 
        const minutes=
            Math.floor(
                diff/60000
            );
 
 
        if(minutes<1){
 
            return "Vừa xong";
        }
 
 
        if(minutes<60){
 
            return(
                minutes+
                " phút trước"
            );
 
        }
 
 
        const hours=
            Math.floor(
                minutes/60
            );
 
 
        if(hours<24){
 
            return(
                hours+
                " giờ trước"
            );
 
        }
 
 
        return(
            Math.floor(
                hours/24
            )+
            " ngày trước"
        );
 
    }
 
 
    /* =====================================================
       CSS
    ===================================================== */
 
    function createStyles(){
 
        /* CSS được tải từ minh-hong-footer.css */
 
    }
 
 
    function appendAvatar(
        container,
        className
    ){
 
        const image=
            document.createElement(
                "img"
            );
 
 
        image.className=
            className ||
            "";
 
 
        image.src=
            CONFIG.avatarUrl;
 
 
        image.alt=
            "Minh Hồng";
 
 
        image.referrerPolicy=
            "no-referrer";
 
 
        image.onerror=
            function(){
 
                image.remove();
 
 
                if(
                    container.querySelector(
                        ".mh-avatar-fallback"
                    )
                ){
 
                    return;
                }
 
 
                container.appendChild(
                    makeElement(
                        "span",
                        "mh-avatar-fallback",
                        "MH"
                    )
                );
 
            };
 
 
        container.appendChild(
            image
        );
 
    }
 
 
    /* =====================================================
       CREATE DOM
    ===================================================== */
 
    function createDOM(){
 
        if(root){
 
            return;
        }
 
 
        createStyles();
 
 
        root=
            makeElement(
                "div"
            );
 
 
        root.id=
            "ocdMinhHongRoot";
 
 
        notification=
            makeElement(
                "div",
                "mh-notification"
            );
 
 
        notificationIcon=
            makeElement(
                "div",
                "mh-notification-icon"
            );
 
 
        const content=
            makeElement(
                "div",
                "mh-notification-content"
            );
 
 
        notificationLabel=
            makeElement(
                "div",
                "mh-notification-label",
                "MINH HỒNG THÔNG BÁO"
            );
 
 
        notificationTitle=
            makeElement(
                "div",
                "mh-notification-title"
            );
 
 
        notificationText=
            makeElement(
                "div",
                "mh-notification-text"
            );
 
 
        notificationTime=
            makeElement(
                "div",
                "mh-notification-time"
            );
 
 
        content.appendChild(
            notificationLabel
        );
 
 
        content.appendChild(
            notificationTitle
        );
 
 
        content.appendChild(
            notificationText
        );
 
 
        content.appendChild(
            notificationTime
        );
 
 
        const notificationClose=
            makeElement(
                "button",
                "mh-notification-close",
                CHAR.close
            );
 
 
        notificationClose.type=
            "button";
 
 
        const progress=
            makeElement(
                "div",
                "mh-notification-progress"
            );
 
 
        progress.appendChild(
            makeElement(
                "div",
                "mh-notification-progress-bar"
            )
        );
 
 
        notification.appendChild(
            notificationIcon
        );
 
 
        notification.appendChild(
            content
        );
 
 
        notification.appendChild(
            notificationClose
        );
 
 
        notification.appendChild(
            progress
        );
 
 
        const panel=
            makeElement(
                "div",
                "mh-panel"
            );
 
 
        const header=
            makeElement(
                "div",
                "mh-panel-header"
            );
 
 
        const panelAvatar=
            makeElement(
                "div",
                "mh-panel-avatar"
            );
 
 
        appendAvatar(
            panelAvatar,
            ""
        );
 
 
        const identity=
            makeElement(
                "div"
            );
 
 
        identity.appendChild(
            makeElement(
                "div",
                "mh-panel-name",
                "Minh Hồng"
            )
        );
 
 
        identity.appendChild(
            makeElement(
                "div",
                "mh-panel-role",
                "Trợ giảng Online "+
                CHAR.dot+
                " Hướng dẫn và thông báo"
            )
        );
 
 
        const headerActions=
            makeElement(
                "div",
                "mh-header-actions"
            );
 
 
        muteButton=
            makeElement(
                "button",
                "mh-header-button"
            );
 
 
        muteButton.type=
            "button";
 
 
        const closePanelButton=
            makeElement(
                "button",
                "mh-header-button",
                CHAR.close
            );
 
 
        closePanelButton.type=
            "button";
 
 
        headerActions.appendChild(
            closePanelButton
        );
 
 
        header.appendChild(
            panelAvatar
        );
 
 
        header.appendChild(
            identity
        );
 
 
        header.appendChild(
            headerActions
        );
 
 
        const scroll=
            makeElement(
                "div",
                "mh-panel-scroll"
            );
 
 
        panelBody=
            makeElement(
                "div",
                "mh-panel-body"
            );
 
 
        scroll.appendChild(
            panelBody
        );
 
 
        panel.appendChild(
            header
        );
 
 
        panel.appendChild(
            scroll
        );
 
 
        panel.appendChild(
            makeElement(
                "div",
                "mh-panel-footer",
                "Minh Hồng "+
                CHAR.dot+
                " Trợ giảng Online"
            )
        );
 
 
        launcher=
            makeElement(
                "button",
                "mh-launcher"
            );
 
 
        launcher.type=
            "button";
 
 
        launcher.setAttribute(
            "aria-label",
            "Mở Minh Hồng"
        );
 
 
        const launcherWrap=
            makeElement(
                "div",
                "mh-launcher-image-wrap"
            );
 
 
        appendAvatar(
            launcherWrap,
            "mh-launcher-image"
        );
 
 
        launcher.appendChild(
            launcherWrap
        );
 
 
        launcher.appendChild(
            makeElement(
                "span",
                "mh-online-dot"
            )
        );
 
 
        root.appendChild(
            panel
        );
 
 
        root.appendChild(
            launcher
        );
 
 
        document.body.appendChild(
            root
        );
 
 
        launcher.addEventListener(
            "click",
            togglePanel
        );
 
 
        closePanelButton.addEventListener(
            "click",
            closePanel
        );
 
 
        renderPanel();
 
    }
 
 
    /* =====================================================
       COMMUNITY FORMAT
    ===================================================== */
 
    function getCommunityEventIcon(event){
 
        if(
            event.type==="upload"
        ){
 
            return ICONS.upload;
        }
 
 
        if(
            event.type==="comment"
        ){
 
            return ICONS.teacher;
        }
 
 
        const hasHong=
            Array.isArray(
                event.items
            )
            &&
            event.items.some(
                function(item){
 
                    return(
                        item.type==="hong"
                    );
 
                }
            );
 
 
        return hasHong
        ?
        ICONS.crown
        :
        ICONS.gem;
 
    }
 
 
    function getCommunityEventClass(event){
 
        if(
            event.type==="upload"
        ){
 
            return "mh-upload";
        }
 
 
        if(
            event.type==="comment"
        ){
 
            return "mh-comment";
        }
 
 
        return "mh-gem";
 
    }
 
 
    function getCommunityEventText(event){
 
        if(
            event.type==="upload"
        ){
 
            return(
                "vừa tải thành công một bài tập lên hệ thống."
            );
 
        }
 
 
        if(
            event.type==="comment"
        ){
 
            return(
                CONFIG.teacherName+
                " vừa nhận xét: "+
                CHAR.quoteOpen+
                clean(
                    event.comment
                )+
                CHAR.quoteClose
            );
 
        }
 
 
        return(
            "vừa đổi thành công "+
            clean(
                event.outcome
            )+
            "."+
            (
                event.reason
                ?
                (
                    " Do "+
                    event.reason+
                    "."
                )
                :
                ""
            )
        );
 
    }
 
 
    /* =====================================================
       PERSONAL NOTIFICATION – đã bỏ ở v1.5.8.0 (dựa trên Lời khuyên cá nhân)
    ===================================================== */
    function buildPersonalNotificationEvents(){
        return [];
    }


    /* =====================================================
       CONTEXT SPEECH CONTROLLER v1.5.5
 
       - Không tạo popup mới.
       - Dùng notification/lời thoại Minh Hồng hiện có.
       - Chỉ Student Session VERIFIED.
       - Chỉ các dòng Hiển thị = speech / both.
       - Mỗi lần chọn tối đa 1 lời thoại Context có ưu tiên cao nhất.
       - Cooldown theo mã học viên + tab + ID + nội dung đã render.
       - Dòng không có cột Hiển thị vẫn là panel để tương thích v1.5.4.
    ===================================================== */
    function speechDisplayMode(item){
        const mode=clean(item&&item.display).toLowerCase();
        if(mode==="speech" || mode==="both") return mode;
        return "panel";
    }
 
    function speechHash(value){
        let hash=2166136261;
        const source=String(value||"");
        for(let i=0;i<source.length;i++){
            hash^=source.charCodeAt(i);
            hash=Math.imul(hash,16777619);
        }
        return (hash>>>0).toString(36);
    }
 
    function readSpeechCooldowns(){
        const raw=safeStorageGet(CONFIG.speechCooldownKey);
        if(!raw) return {};
        try{
            const data=JSON.parse(raw);
            return data && typeof data==="object" ? data : {};
        }catch(error){
            return {};
        }
    }
 
    function saveSpeechCooldowns(data){
        const entries=Object.keys(data||{}).map(function(key){
            return [key,Number(data[key])||0];
        }).sort(function(a,b){return b[1]-a[1];})
          .slice(0,CONFIG.speechMaxHistory);
 
        const compact={};
        entries.forEach(function(pair){compact[pair[0]]=pair[1];});
        safeStorageSet(CONFIG.speechCooldownKey,JSON.stringify(compact));
    }
 
    function speechKey(state,pageTab,item,title,text){
        return [
            normalizeCode(state.code),
            pageTab,
            clean(item.id),
            speechHash(title+"|"+text)
        ].join("|");
    }
 
    function buildSpeechContext(state){
        const pageTab=getPageContentTab();
        const bridge=MinhHongContextStore.getForStudent(state.code);
        const bridgePage=normalizeContentTab(bridge&&bridge.page);
 
        /*
           FIX v1.5.5.1
           Chỉ dùng Context do đúng trang hiện tại công bố.
           Tránh dữ liệu/điều kiện cũ của một trang khác tác động tới
           nội dung Sheet của TraCuu, TacPham, LamMo, ThuVien,
           GiangDuong hoặc ThiTotNghiep.
        */
        const samePage=!bridgePage || bridgePage===pageTab;
 
        return {
            mode:"student",
            verified:true,
            code:state.code,
            page:pageTab,
            data:samePage?Object.assign({},bridge.data||{}):{},
            conditions:samePage?Object.assign({},bridge.conditions||{}):{}
        };
    }
 
    function refreshContextSpeech(options){
        options=options||{};
 
        const state=OCDStudentSession.getState();
 
        if(isSilentContext()){
            contextSpeechEvents=[];
            return Promise.resolve([]);
        }
 
        const pageTab=getPageContentTab();
        const isVerifiedStudent=Boolean(
            state &&
            state.mode==="student" &&
            state.verified &&
            state.code
        );
 
        const context=isVerifiedStudent
            ? buildSpeechContext(state)
            : Object.assign(
                {
                    mode:"guest",
                    verified:false,
                    code:"",
                    page:pageTab,
                    data:{},
                    conditions:{}
                },
                GuestJourney.getContext(pageTab) || {}
            );
 
        function select(){
            const templateData=Object.assign(
                {
                    studentCode:isVerifiedStudent ? (state.code||"") : "",
                    page:pageTab
                },
                context.data||{}
            );
 
            /*
               v1.5.6.1
               Sheet đã sort theo priority giảm dần trong Content Engine.
               Không chọn 1 câu rồi break nữa: đưa TOÀN BỘ speech/both
               hợp lệ và chưa cooldown vào hàng đợi theo đúng thứ tự ưu tiên.
            */
            const candidates=(
                isVerifiedStudent
                ? MinhHongContentEngine.getForStudent(pageTab,context)
                : MinhHongContentEngine.getForGuest(pageTab,context)
            ).filter(function(item){
                const mode=speechDisplayMode(item);
                return mode==="speech" || mode==="both";
            });
 
            const cooldowns=readSpeechCooldowns();
            const now=Date.now();
            const queue=[];
 
            candidates.forEach(function(item){
                const title=renderContextTemplate(
                    item.title || (isVerifiedStudent ? "Lời khuyên dành cho bạn" : "Minh Hồng chào bạn"),
                    templateData
                );
                const body=renderContextTemplate(item.content||"",templateData);
                const speechState=isVerifiedStudent
                    ? state
                    : {code:"GUEST"};
                const key=speechKey(speechState,pageTab,item,title,body);
                const last=Number(cooldowns[key])||0;
 
                if(now-last<CONFIG.speechCooldownTime){
                    return;
                }
 
                queue.push({
                    personal:true,
                    guestSpeech:!isVerifiedStudent,
                    contextSpeech:true,
                    type:isVerifiedStudent ? "context-speech" : "guest-speech",
                    icon:isVerifiedStudent ? ICONS.tip : ICONS.user,
                    title:title,
                    text:body,
                    contentId:item.id,
                    priority:item.priority||0,
                    speechKey:key
                });
            });
 
            contextSpeechEvents=queue;
            currentIndex=0;
 
            /*
               Không ghi cooldown ở đây.
               Cooldown chỉ được ghi khi câu thật sự xuất hiện trên màn hình.
            */
            if(
                !panelOpen &&
                !notificationsMuted &&
                contextSpeechEvents.length
            ){
                startNotificationLoop();
            }
 
            return contextSpeechEvents.slice();
        }
 
        if(options.cachedOnly){
            return Promise.resolve(select());
        }
 
        return MinhHongContentEngine.load(pageTab).then(select);
    }
 
    function activeEvents(){
        const context=getPageContext();
 
        if(context==="community"){
            if(!OCDStudentSession.isVerified()){
                return contextSpeechEvents
                    .concat(communityNotificationEvents.slice(0,CONFIG.maxPersonalNotifications));
            }
            return communityNotificationEvents;
        }
 
        if(context==="personal"){
            /*
               v1.5.6.1
               Không cắt hàng đợi Sheet bằng maxPersonalNotifications.
               Tất cả speech/both hợp lệ được nói trước; notification động theo sau.
            */
            return contextSpeechEvents
                .concat(personalNotificationEvents.slice(0,CONFIG.maxPersonalNotifications));
        }
 
        if(context==="class-pulse"){
            return contextSpeechEvents
                .concat(classPulseNotificationEvents.slice(0,CONFIG.maxPersonalNotifications));
        }
 
        return [];
    }
 
 
    function activeFirstDelay(){
        return isCommunityContext()
        ? CONFIG.firstNotificationDelay
        : CONFIG.personalFirstDelay;
    }
 
 
    function activeGapTime(){
        return isCommunityContext()
        ? CONFIG.gapTime
        : CONFIG.personalGapTime;
    }
 
 
    function renderNotification(event){
 
        if(event && event.classPulse){
            notification.className=
                "mh-notification mh-personal";
 
            notificationLabel.textContent=
                "NHỊP LỚP HỌC";
 
            notificationIcon.textContent=
                event.icon || ICONS.activity;
 
            notificationTitle.textContent=
                event.title || "Hoạt động lớp học";
 
            notificationText.textContent=
                event.text || event.message || "";
 
            notificationTime.textContent=
                "20 bài nộp mới nhất";
 
            return;
        }
 
        if(event && event.guestSpeech){
            notification.className=
                "mh-notification mh-personal";
 
            notificationLabel.textContent=
                "MINH HỒNG CHÀO BẠN";
 
            notificationIcon.textContent=
                event.icon || ICONS.user;
 
            notificationTitle.textContent=
                event.title || "Thông tin dành cho bạn";
 
            notificationText.textContent=
                event.text || "";
 
            notificationTime.textContent=
                "Dành cho khách";
 
            return;
        }
 
        if(
            event.personal
        ){
 
            notification.className=
                "mh-notification mh-personal";
 
 
            notificationLabel.textContent=
                "MINH HỒNG GỢI Ý";
 
 
            notificationIcon.textContent=
                event.icon ||
                ICONS.tip;
 
 
            notificationTitle.textContent=
                event.title ||
                "Lời khuyên dành cho bạn";
 
 
            notificationText.textContent=
                event.text ||
                "";
 
 
            notificationTime.textContent=
                "Dành riêng cho bạn";
 
 
            return;
        }
 
 
        notification.className=
            "mh-notification "+
            getCommunityEventClass(
                event
            );
 
 
        notificationLabel.textContent=
            "MINH HỒNG THÔNG BÁO";
 
 
        notificationIcon.textContent=
            getCommunityEventIcon(
                event
            );
 
 
        if(
            event.type==="comment"
        ){
 
            notificationTitle.textContent=
                CONFIG.teacherName+
                " vừa nhận xét bài của "+
                event.name;
 
        }else{
 
            notificationTitle.textContent=
                event.name;
 
        }
 
 
        notificationText.textContent=
            getCommunityEventText(
                event
            );
 
 
        notificationTime.textContent=
            relativeTime(
                event.time
            );
 
    }
 
 
    function showNotification(event){
 
        if(
            panelOpen ||
            notificationsMuted ||
            !event
        ){
 
            return;
        }
 
 
 
        renderNotification(
            event
        );
 
 
        notification.classList.remove(
            "mh-show"
        );
 
 
        void notification.offsetWidth;
 
 
        notification.classList.add(
            "mh-show"
        );
 
 
        clearTimeout(
            hideTimer
        );
 
 
        hideTimer=
            setTimeout(
                hideNotification,
                CONFIG.visibleTime
            );
 
    }
 
 
    function hideNotification(){
 
        if(!notification){
 
            return;
        }
 
 
        notification.classList.remove(
            "mh-show"
        );
 
 
        clearTimeout(
            hideTimer
        );
 
 
        hideTimer=null;
 
    }
 
 
    function stopNotificationLoop(){
 
        clearTimeout(
            firstTimer
        );
 
 
        clearTimeout(
            nextTimer
        );
 
 
        clearTimeout(
            hideTimer
        );
 
 
        firstTimer=null;
        nextTimer=null;
        hideTimer=null;
 
 
        hideNotification();
 
    }
 
 
    function scheduleNext(delay){
 
        clearTimeout(
            nextTimer
        );
 
 
        nextTimer=null;
 
 
        const list=
            activeEvents();
 
 
        if(
            panelOpen ||
            notificationsMuted ||
            !list.length
        ){
 
            return;
        }
 
 
 
        nextTimer=
            setTimeout(
                nextNotification,
                delay
            );
 
    }
 
 
    function markContextSpeechShown(event){
        if(!event || !event.contextSpeech || !event.speechKey){
            return;
        }
 
        const cooldowns=readSpeechCooldowns();
        cooldowns[event.speechKey]=Date.now();
        saveSpeechCooldowns(cooldowns);
 
        /*
           Bỏ đúng câu vừa nói khỏi queue để câu ưu tiên kế tiếp
           trở thành phần tử đầu tiên. Nhờ vậy không lặp lại câu cũ.
        */
        contextSpeechEvents=contextSpeechEvents.filter(function(item){
            return item.speechKey!==event.speechKey;
        });
    }
 
 
    function nextNotification(){
 
        const list=activeEvents();
 
        if(
            panelOpen ||
            notificationsMuted ||
            !list.length
        ){
            return;
        }
 
        if(currentIndex>=list.length){
            currentIndex=0;
        }
 
        const event=list[currentIndex];
 
        showNotification(event);
 
        if(event && event.contextSpeech){
            /*
               v1.5.6.1
               Chỉ bắt đầu cooldown sau khi câu đã thật sự được hiển thị.
               Sau khi xóa câu vừa nói, câu Sheet tiếp theo nằm ở index 0.
            */
            markContextSpeechShown(event);
            currentIndex=0;
        }else{
            currentIndex++;
        }
 
        scheduleNext(
            CONFIG.visibleTime+
            activeGapTime()
        );
 
    }
 
 
    function startNotificationLoop(){
 
        stopNotificationLoop();
 
 
        const list=
            activeEvents();
 
 
        if(
            notificationsMuted ||
            panelOpen ||
            !list.length
        ){
 
            return;
        }
 
 
 
        currentIndex=0;
 
 
        firstTimer=
            setTimeout(
                nextNotification,
                activeFirstDelay()
            );
 
    }
 
 
    /* =====================================================
       MUTE
    ===================================================== */
 
    function renderMuteButton(){
 
        if(!muteButton){
 
            return;
        }
 
 
        muteButton.textContent=
            notificationsMuted
            ?
            ICONS.mute
            :
            ICONS.bell;
 
    }
 
 
    function toggleMute(){
 
        notificationsMuted=
            !notificationsMuted;
 
 
        Preferences.set({
 
            notificationsMuted
 
        });
 
 
        renderMuteButton();
 
 
        if(
            notificationsMuted
        ){
 
            stopNotificationLoop();
 
        }else if(
            !panelOpen
        ){
 
            scheduleNext(
                500
            );
 
        }
 
    }
 
 
    /* =====================================================
       PANEL
    ===================================================== */
 
    function openPanel(){
 
        panelOpen=true;
 
 
        root.classList.add(
            "mh-panel-open"
        );
 
 
        stopNotificationLoop();
 
 
        renderPanel();
 
    }
 
 
    function closePanel(){
 
        panelOpen=false;
 
 
        root.classList.remove(
            "mh-panel-open"
        );
 
 
        if(
            !notificationsMuted
        ){
 
            scheduleNext(
                800
            );
 
        }
 
    }
 
 
    function togglePanel(){
 
        if(panelOpen){
 
            closePanel();
 
        }else{
 
            openPanel();
 
        }
 
    }
 
 
    function createActionButton(
        text,
        primary,
        callback
    ){
 
        const button=
            makeElement(
                "button",
                primary
                ?
                "mh-action-button mh-action-button-primary"
                :
                "mh-action-button"
            );
 
 
        button.type=
            "button";
 
 
        button.appendChild(
            makeElement(
                "span",
                "",
                text
            )
        );
 
 
        button.appendChild(
            makeElement(
                "span",
                "",
                CHAR.arrow
            )
        );
 
 
        button.addEventListener(
            "click",
            callback
        );
 
 
        return button;
 
    }
 
 
    /* =====================================================
       COMMUNITY PANEL – đã bỏ ở v1.5.8.0
    ===================================================== */
    function appendCommunitySection(){}


    /* =====================================================
       CLASS PULSE PANEL – đã bỏ ở v1.5.8.0 (không có trang nào gửi OCDClassPulse)
    ===================================================== */
    function readClassPulse(){
        return null;
    }
    function normalizeClassPulseEvents(){
        return [];
    }
    function setClassPulse(){
        classPulseState=null;
        classPulseNotificationEvents=[];
    }
    function appendClassPulseSection(){}


    /* =====================================================
       PERSONAL INSIGHT PANEL – đã bỏ ở v1.5.8.0
    ===================================================== */
    function appendPersonalInsight(){}


    /* =====================================================
       GUEST
    ===================================================== */
 
    function renderGuestHome(){
 
        panelBody.appendChild(
            makeElement(
                "div",
                "mh-status",
                ICONS.user+
                " KHÁCH MỚI"
            )
        );
 
 
        panelBody.appendChild(
            makeElement(
                "div",
                "mh-intro-title",
                "Chào bạn, mình là Minh Hồng."
            )
        );
 
 
        panelBody.appendChild(
            makeElement(
                "div",
                "mh-intro-text",
                "Mình là trợ giảng Online của website. Nếu bạn đã có mã học viên, hãy nhập mã để các trang học tập có thể dùng lại thông tin này."
            )
        );
 
 
        const section=
            makeElement(
                "div",
                "mh-section"
            );
 
 
        section.appendChild(
            makeElement(
                "div",
                "mh-section-title",
                ICONS.activity+
                " BẮT ĐẦU"
            )
        );
 
 
        const actions=
            makeElement(
                "div",
                "mh-actions"
            );
 
 
        const codeBox=
            makeElement(
                "div",
                "mh-inline-box"
            );
 
 
        codeBox.style.display=
            "none";
 
 
        const codeInput=
            makeElement(
                "input",
                "mh-code-input"
            );
 
 
        codeInput.type=
            "text";
 
 
        codeInput.placeholder=
            "Nhập mã học viên";
 
 
        codeInput.autocomplete=
            "off";
 
 
        const submit=
            makeElement(
                "button",
                "mh-code-submit",
                "TRA CỨU MÃ HỌC VIÊN"
            );
 
 
        submit.type=
            "button";
 
 
        async function saveCode(){
 
            const code=
                normalizeCode(
                    codeInput.value
                );
 
 
            if(!code){
 
                codeInput.focus();
 
                return;
            }
 
 
            if(submit.disabled){
                return;
            }
 
 
            const originalText=submit.textContent;
 
            submit.disabled=true;
            submit.textContent="ĐANG XÁC MINH...";
 
 
            try{
 
                const result=
                    await CommunityEngine
                    .verifyStudentCode(code);
 
 
                if(!result.ok){
 
                    alert(
                        "Không tìm thấy mã học viên "+code+". Vui lòng kiểm tra lại mã đã nhập."
                    );
 
                    codeInput.focus();
                    codeInput.select();
 
                    return;
                }
 
 
                OCDStudentSession
                .confirmStudent(
                    result.code,
                    "minh-hong-lookup"
                );
 
 
                guestView=
                    "home";
 
 
                refreshContext();
 
            }catch(error){
 
                console.warn(
                    "[Minh Hồng] Xác minh mã học viên:",
                    error
                );
 
                alert(
                    "Minh Hồng chưa thể kiểm tra mã học viên lúc này. Vui lòng kiểm tra kết nối mạng và thử lại."
                );
 
            }finally{
 
                submit.disabled=false;
                submit.textContent=originalText;
 
            }
 
        }
 
 
        submit.addEventListener(
            "click",
            saveCode
        );
 
 
        codeInput.addEventListener(
            "keydown",
            function(event){
 
                if(
                    event.key==="Enter"
                ){
 
                    saveCode();
 
                }
 
            }
        );
 
 
        codeBox.appendChild(
            codeInput
        );
 
 
        codeBox.appendChild(
            submit
        );
 
 
        codeBox.appendChild(
            makeElement(
                "div",
                "mh-small-note",
                "Minh Hồng sẽ kiểm tra mã trực tiếp. Khi mã hợp lệ, phiên học viên được xác minh ngay cả trên thiết bị mới hoặc tab ẩn danh."
            )
        );
 
 
        actions.appendChild(
            createActionButton(
                "Tôi đã có mã học viên",
                true,
                function(){
 
                    codeBox.style.display=
                        codeBox.style.display==="none"
                        ?
                        "block"
                        :
                        "none";
 
 
                    if(
                        codeBox.style.display==="block"
                    ){
 
                        codeInput.focus();
 
                    }
 
                }
            )
        );
 
 
        actions.appendChild(
            createActionButton(
                "Tôi là người mới",
                false,
                function(){
 
                    guestView=
                        "newcomer";
 
 
                    renderPanel();
 
                }
            )
        );
 
 
        section.appendChild(
            actions
        );
 
 
        section.appendChild(
            codeBox
        );
 
 
        panelBody.appendChild(
            section
        );
 
 
        appendCommunitySection();
 
    }
 
 
    /* =====================================================
       NEWCOMER
    ===================================================== */
 
    function renderNewcomerGuide(){
 
        const back=makeElement("button","mh-action-back",ICONS.back+" Quay lại");
        back.type="button";
        back.addEventListener("click",function(){
            guestView="home";
            renderPanel();
        });
        panelBody.appendChild(back);
 
        panelBody.appendChild(
            makeElement("div","mh-status",ICONS.book+" DÀNH CHO NGƯỜI MỚI")
        );
 
        panelBody.appendChild(
            makeElement("div","mh-intro-title","Làm quen với Thanh Phong Thư Môn")
        );
 
        panelBody.appendChild(
            makeElement(
                "div",
                "mh-intro-text",
                "Minh Hồng sẽ giới thiệu những thông tin cơ bản để bạn hiểu website, khóa học và các chức năng dành cho học viên."
            )
        );
 
        const guideSection=makeElement("div","mh-section");
        guideSection.appendChild(
            makeElement("div","mh-section-title",ICONS.book+" THÔNG TIN DÀNH CHO NGƯỜI MỚI")
        );
 
        const loadingCard=makeElement("div","mh-guide-card");
        loadingCard.appendChild(
            makeElement("div","mh-guide-text","Đang tải nội dung dành cho người mới...")
        );
        guideSection.appendChild(loadingCard);
        panelBody.appendChild(guideSection);
 
        function appendGuideItems(items){
            clearNode(guideSection);
            guideSection.appendChild(
                makeElement("div","mh-section-title",ICONS.book+" THÔNG TIN DÀNH CHO NGƯỜI MỚI")
            );
 
            if(!items || !items.length){
                items=[
                    {
                        title:"1. Giới thiệu website",
                        content:"Đây là trang chia sẻ thông tin, kiến thức, hoạt động của Thanh Phong Thư Môn. Bạn có thể đăng ký khóa học thư pháp Online tại Trang chủ.",
                        button:"Khám phá website",
                        link:"/"
                    },
                    {
                        title:"2. Khóa học thư pháp Online",
                        content:"Khóa học thư pháp Online dành cho người muốn học thư pháp theo lộ trình có hướng dẫn.",
                        button:"Tìm hiểu khóa học",
                        link:"/"
                    },
                    {
                        title:"3. Nội dung công khai",
                        content:"Bạn có thể khám phá các nội dung công khai trên website trước khi đăng ký khóa học.",
                        button:"Bắt đầu khám phá",
                        link:"/"
                    },
                    {
                        title:"4. Khi trở thành học viên",
                        content:"Sau khi có mã học viên, Minh Hồng có thể hỗ trợ bạn trên các trang đã được kết nối.",
                        button:"Tôi đã có mã học viên",
                        link:""
                    }
                ];
            }
 
            items.forEach(function(item,index){
                const card=makeElement("div","mh-guide-card");
                card.appendChild(
                    makeElement("div","mh-guide-title",item.title || ("Thông tin "+(index+1)))
                );
                card.appendChild(
                    makeElement("div","mh-guide-text",item.content || "")
                );
 
                if(item.button){
                    const button=createActionButton(item.button,false,function(){
                        const link=clean(item.link);
                        if(link && link!=="#"){
                            window.location.href=link;
                        }else if(item.id==="G004"){
                            guestView="home";
                            renderPanel();
                            setTimeout(function(){
                                const input=panelBody.querySelector(".mh-code-input");
                                const box=input ? input.closest(".mh-inline-box") : null;
                                if(box) box.style.display="block";
                                if(input) input.focus();
                            },0);
                        }
                    });
                    card.appendChild(button);
                }
 
                guideSection.appendChild(card);
            });
        }
 
        const pageTab=getPageContentTab();
        const journeyContext=GuestJourney.getContext(pageTab);
 
        function selectItems(tab){
            const matched=MinhHongContentEngine.getForGuest(tab,journeyContext);
            return GuestJourney.preferUnseen(tab,matched);
        }
 
        function showItems(tab,items){
            appendGuideItems(items);
            if(items && items.length){
                GuestJourney.markSeen(tab,items);
            }
        }
 
        function getGuestItemsForCurrentPage(){
            const pageItems=selectItems(pageTab);
            if(pageItems.length) return {tab:pageTab,items:pageItems};
            const guestItems=selectItems("Guest");
            return {tab:"Guest",items:guestItems};
        }
 
        const cached=getGuestItemsForCurrentPage();
        if(cached.items.length){
            showItems(cached.tab,cached.items);
        }
 
        MinhHongContentEngine.load(pageTab).then(function(){
            if(!panelOpen || guestView!=="newcomer") return;
 
            const matched=selectItems(pageTab);
            if(matched.length){
                showItems(pageTab,matched);
                return;
            }
 
            if(pageTab==="Guest"){
                appendGuideItems([]);
                return;
            }
 
            /* Chỉ khi tab trang không có nội dung phù hợp mới tải Guest. */
            MinhHongContentEngine.load("Guest").then(function(){
                if(!panelOpen || guestView!=="newcomer") return;
                const fallback=selectItems("Guest");
                showItems("Guest",fallback);
            });
        });
 
        const actions=makeElement("div","mh-section");
        const actionWrap=makeElement("div","mh-actions");
 
        actionWrap.appendChild(
            createActionButton("Tôi đã có mã học viên",true,function(){
                guestView="home";
                renderPanel();
                setTimeout(function(){
                    const input=panelBody.querySelector(".mh-code-input");
                    const box=input ? input.closest(".mh-inline-box") : null;
                    if(box) box.style.display="block";
                    if(input) input.focus();
                },0);
            })
        );
 
        actions.appendChild(actionWrap);
        panelBody.appendChild(actions);
 
    }
 
 
    /* =====================================================
       STUDENT PANEL
    ===================================================== */
 
    /* =====================================================
       STUDENT SHEET CONTENT v1.5.4
       - Chỉ chạy khi session đã VERIFIED.
       - Đọc đúng tab của trang hiện tại.
       - Chỉ nhận Đối tượng student / all / trống.
       - Không có nội dung phù hợp: không hiện section.
       - Lỗi Sheet: không ảnh hưởng các chức năng Student cũ.
    ===================================================== */
    function renderContextTemplate(value,data){
        const source=String(value===undefined||value===null?"":value);
        data=data&&typeof data==="object"?data:{};
        return source.replace(/\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}/g,function(match,key){
            const parts=key.split(".");
            let current=data;
            for(let i=0;i<parts.length;i++){
                if(current===null||current===undefined||typeof current!=="object"||
                   !Object.prototype.hasOwnProperty.call(current,parts[i])) return match;
                current=current[parts[i]];
            }
            if(current===null||current===undefined) return "";
            if(typeof current==="object") return match;
            return String(current);
        });
    }
 
    function appendStudentSheetContent(state){
        if(!state||!state.verified) return;
 
        const pageTab=getPageContentTab();
        const section=makeElement("div","mh-section");
        section.style.display="none";
 
        function buildContext(){
            const bridge=MinhHongContextStore.getForStudent(state.code);
            return{
                verified:true,
                code:state.code||"",
                pageTab:pageTab,
                data:Object.assign({},bridge.data||{}),
                conditions:Object.assign({},bridge.conditions||{})
            };
        }
 
        function renderItems(items,context){
            clearNode(section);
            items=(items||[]).filter(function(item){
                const mode=speechDisplayMode(item);
                return mode==="panel" || mode==="both";
            });
            if(!items.length){section.style.display="none";return;}
            section.style.display="";
            section.appendChild(makeElement("div","mh-section-title",ICONS.book+" GỢI Ý TRÊN TRANG NÀY"));
 
            const templateData=Object.assign(
                {studentCode:state.code||"",page:pageTab},
                context&&context.data?context.data:{}
            );
 
            items.forEach(function(item,index){
                const card=makeElement("div","mh-guide-card");
                card.appendChild(makeElement(
                    "div","mh-guide-title",
                    renderContextTemplate(item.title||("Gợi ý "+(index+1)),templateData)
                ));
                if(item.content){
                    card.appendChild(makeElement(
                        "div","mh-guide-text",
                        renderContextTemplate(item.content,templateData)
                    ));
                }
                if(item.button){
                    const button=createActionButton(
                        renderContextTemplate(item.button,templateData),
                        false,
                        function(){
                            const link=renderContextTemplate(clean(item.link),templateData);
                            if(link&&link!=="#") window.location.href=link;
                        }
                    );
                    card.appendChild(button);
                }
                section.appendChild(card);
            });
        }
 
        function refresh(){
            if(!panelOpen) return;
            const current=OCDStudentSession.getState();
            if(!current.verified||current.code!==state.code) return;
            const context=buildContext();
            renderItems(
                MinhHongContentEngine.getForStudent(pageTab,context),
                context
            );
        }
 
        panelBody.appendChild(section);
 
        const initial=buildContext();
        const cached=MinhHongContentEngine.getForStudent(pageTab,initial);
        if(cached.length) renderItems(cached,initial);
 
        MinhHongContentEngine.load(pageTab).then(refresh);
 
        const onContextChanged=function(){
            if(!panelOpen||!document.body.contains(section)){
                window.removeEventListener("ocdMinhHongContextChanged",onContextChanged);
                return;
            }
            refresh();
        };
        window.addEventListener("ocdMinhHongContextChanged",onContextChanged);
    }
 
 
    /* =====================================================
       MINH HỒNG THU MUA v1.5.7.4
       - Core là nguồn sự thật duy nhất cho vật phẩm/Linh Thạch.
       - Minh Hồng chỉ đọc offer và gửi yêu cầu SELL qua Core.
       - Chỉ báo thành công sau khi SELL_ID xuất hiện trong Sheet.
    ===================================================== */
    const MinhHongSellPanel=(function(){
        let submissionCsvPromise=null;
        let selling=false;
        let pendingSale=null;

        function getCore(){ return window.StudentRewardSystem||null; }

        function coreReady(){
            const RS=getCore();
            return !!(
                RS &&
                typeof RS.getStudentRewardProfile==="function" &&
                typeof RS.getMinhHongOffers==="function" &&
                typeof RS.createMinhHongSaleRequest==="function" &&
                typeof RS.submitMinhHongSaleRequest==="function" &&
                typeof RS.confirmMinhHongSale==="function"
            );
        }

        function waitCore(timeout){
            timeout=Math.max(1000,Number(timeout||12000));
            return new Promise(function(resolve,reject){
                const start=Date.now();
                (function check(){
                    if(coreReady()) return resolve(getCore());
                    if(Date.now()-start>=timeout) return reject(new Error("Reward Core v4.2.2+ chưa sẵn sàng."));
                    setTimeout(check,100);
                })();
            });
        }

        function loadSubmissionCsv(force){
            if(submissionCsvPromise && !force) return submissionCsvPromise;
            const sep=CONFIG.csvUrl.indexOf("?")>=0?"&":"?";
            const url=CONFIG.csvUrl+sep+"_mh_sell="+Date.now();
            submissionCsvPromise=fetchWithTimeout(url,{cache:"no-store",credentials:"omit"})
                .then(function(r){
                    if(!r.ok) throw new Error("Không thể tải dữ liệu học viên.");
                    return r.text();
                })
                .catch(function(err){
                    submissionCsvPromise=null;
                    throw err;
                });
            return submissionCsvPromise;
        }

        function gemLabel(RS,key){
            const info=RS.GEM_TYPES&&RS.GEM_TYPES[key];
            return info&&info.displayName?info.displayName:key;
        }

        function injectStyle(){
            if(document.getElementById("mhSellStyle1572")) return;
            const style=document.createElement("style");
            style.id="mhSellStyle1572";
            style.textContent=`
                .mh-sell-wrap{margin-top:10px}
                .mh-sell-toggle{width:100%;border:1px solid rgba(121,83,55,.25);border-radius:12px;padding:11px 12px;background:#fffaf1;color:#5d4030;font-weight:700;cursor:pointer;text-align:left}
                .mh-sell-box{margin-top:9px;border:1px solid rgba(121,83,55,.18);border-radius:12px;padding:10px;background:rgba(255,252,246,.82)}
                .mh-sell-note{font-size:12px;line-height:1.55;opacity:.78;margin-bottom:8px}
                .mh-sell-status{font-size:12px;line-height:1.55;padding:8px 9px;border-radius:9px;background:rgba(121,83,55,.07);margin-bottom:8px}
                .mh-sell-item{padding:10px 0;border-top:1px solid rgba(121,83,55,.13)}
                .mh-sell-item:first-of-type{border-top:0}
                .mh-sell-name{display:flex;align-items:center;gap:8px;font-weight:700;margin-bottom:4px}
                .mh-sell-item-icon{width:30px;height:30px;flex:0 0 30px;border-radius:8px;object-fit:contain;background:rgba(255,255,255,.75);border:1px solid rgba(121,83,55,.13)}
                .mh-sell-item-icon-fallback{width:30px;height:30px;flex:0 0 30px;display:flex;align-items:center;justify-content:center;border-radius:8px;background:rgba(121,83,55,.07);font-size:17px}
                .mh-sell-meta{font-size:12px;line-height:1.5;opacity:.78}
                .mh-sell-actions{display:flex;gap:7px;align-items:center;margin-top:8px}
                .mh-sell-qty{width:72px;min-width:72px;border:1px solid rgba(121,83,55,.25);border-radius:9px;padding:8px;background:#fff}
                .mh-sell-btn{flex:1;border:0;border-radius:9px;padding:9px 10px;background:#765344;color:#fff;font-weight:700;cursor:pointer}
                .mh-sell-btn:disabled,.mh-sell-qty:disabled{opacity:.5;cursor:not-allowed}
            `;
            document.head.appendChild(style);
        }

        function append(state){
            if(!state||!state.verified) return;
            injectStyle();

            const section=makeElement("div","mh-section mh-sell-wrap");
            const toggle=makeElement("button","mh-sell-toggle","Rao bán vật phẩm cho Minh Hồng");
            toggle.type="button";
            const box=makeElement("div","mh-sell-box");
            box.style.display="none";
            section.appendChild(toggle);
            section.appendChild(box);
            panelBody.appendChild(section);

            let opened=false;
            let loaded=false;
            let disposed=false;
            let retryRequest=null;

            function status(text){
                clearNode(box);
                box.appendChild(makeElement("div","mh-sell-status",text));
            }

            function alive(){
                return !disposed && document.body.contains(section);
            }

            async function render(force){
                if(selling) return;
                status("Đang tải vật phẩm và chính sách thu mua...");
                try{
                    const RS=await waitCore(12000);
                    const csv=await loadSubmissionCsv(false);
                    const profile=await RS.getStudentRewardProfile(state.code,csv,Boolean(force));
                    const offers=(profile&&profile.minhHong&&Array.isArray(profile.minhHong.offers))
                        ? profile.minhHong.offers
                        : await RS.getMinhHongOffers(state.code,csv,Boolean(force));

                    if(!alive()) return;
                    clearNode(box);
                    const available=(offers||[]).filter(function(o){
                        return o && o.available && Number(o.maxQuantity||0)>0;
                    });

                    if(!available.length){
                        box.appendChild(makeElement("div","mh-sell-status",
                            "Hiện chưa có vật phẩm phù hợp để rao bán, hoặc bạn đã đạt giới hạn thu mua hôm nay."));
                        loaded=true;
                        return;
                    }

                    available.forEach(function(offer){
                        const item=makeElement("div","mh-sell-item");
                        const nameRow=makeElement("div","mh-sell-name");
                        const ownedItems=(profile&&Array.isArray(profile.ownedItems))?profile.ownedItems:[];
                        const wanted=String(offer.giftName||"").trim().toLowerCase();
                        const ownedItem=ownedItems.find(function(x){
                            const n=String(x&&(x.giftName||x.name||(x.gift&&x.gift.name))||"").trim().toLowerCase();
                            return n===wanted || n.replace(/^gói\s+/i,"")===wanted.replace(/^gói\s+/i,"");
                        });
                        const imageUrl=ownedItem&&(
                            ownedItem.image ||
                            (ownedItem.gift&&ownedItem.gift.image)
                        );
                        if(imageUrl){
                            const icon=document.createElement("img");
                            icon.className="mh-sell-item-icon";
                            icon.src=imageUrl;
                            icon.alt=offer.giftName||"Vật phẩm";
                            icon.loading="lazy";
                            icon.decoding="async";
                            icon.onerror=function(){
                                const fallback=makeElement("span","mh-sell-item-icon-fallback",ICONS.gift);
                                if(icon.parentNode) icon.parentNode.replaceChild(fallback,icon);
                            };
                            nameRow.appendChild(icon);
                        }else{
                            nameRow.appendChild(makeElement("span","mh-sell-item-icon-fallback",ICONS.gift));
                        }
                        nameRow.appendChild(makeElement("span","",offer.giftName||"Vật phẩm"));
                        item.appendChild(nameRow);
                        item.appendChild(makeElement("div","mh-sell-meta",
                            "Đang có: "+Number(offer.ownedQuantity||offer.quantity||0)+
                            " / Có thể bán: "+Number(offer.maxQuantity||0)+
                            " / Giá: "+Number(offer.price||0)+" "+gemLabel(RS,offer.gemType)+" / vật phẩm"));

                        const actions=makeElement("div","mh-sell-actions");
                        const qty=document.createElement("input");
                        qty.type="number"; qty.className="mh-sell-qty"; qty.min="1";
                        qty.max=String(Math.max(1,Number(offer.maxQuantity||1)));
                        qty.step="1"; qty.value="1"; qty.setAttribute("aria-label","Số lượng bán");

                        const sell=makeElement("button","mh-sell-btn","BÁN VẬT PHẨM");
                        sell.type="button";
                        sell.addEventListener("click",async function(){
                            if(selling||pendingSale) return;
                            if(retryRequest){
                                const retry=retryRequest;
                                pendingSale={request:retry.request,csv:retry.csv};
                                sell.disabled=true; qty.disabled=true; sell.textContent="ĐANG KIỂM TRA...";
                                try{
                                    const confirmed=await RS.confirmMinhHongSale(retry.request.sellId,retry.csv,state.code);
                                    pendingSale=null;
                                    if(confirmed&&confirmed.sale){
                                        retryRequest=null;
                                        await render(true);
                                    }else{
                                        sell.disabled=false; qty.disabled=false; sell.textContent="KIỂM TRA LẠI";
                                    }
                                }catch(error){
                                    pendingSale=null;
                                    sell.disabled=false; qty.disabled=false; sell.textContent="KIỂM TRA LẠI";
                                }
                                return;
                            }
                            const q=Math.floor(Number(qty.value||0));
                            const max=Math.floor(Number(offer.maxQuantity||0));
                            if(!Number.isFinite(q)||q<1||q>max){ qty.focus(); return; }

                            const reward=q*Number(offer.price||0);
                            if(!window.confirm("Xác nhận bán "+q+" × "+offer.giftName+
                                " cho Minh Hồng để nhận "+reward+" "+gemLabel(RS,offer.gemType)+"?")) return;

                            selling=true; sell.disabled=true; qty.disabled=true; sell.textContent="ĐANG GỬI...";
                            try{
                                const csv=await loadSubmissionCsv(false);
                                const request=await RS.createMinhHongSaleRequest(state.code,offer.giftName,q,csv);
                                await RS.submitMinhHongSaleRequest(request);

                                pendingSale={request:request,csv:csv};
                                selling=false;
                                sell.textContent="ĐANG CHỜ XÁC NHẬN...";
                                if(alive()){
                                    const pending=makeElement("div","mh-sell-status",
                                        "Đã gửi giao dịch "+request.sellId+". Đang chờ Google Sheet đồng bộ; không cần bấm bán lại.");
                                    box.insertBefore(pending,box.firstChild);
                                }

                                RS.confirmMinhHongSale(request.sellId,csv,state.code).then(async function(confirmed){
                                    if(!pendingSale||pendingSale.request.sellId!==request.sellId) return;
                                    pendingSale=null;
                                    if(!confirmed||!confirmed.sale){
                                        if(alive()){
                                            retryRequest={request:request,csv:csv};
                                            sell.disabled=false; qty.disabled=false; sell.textContent="KIỂM TRA LẠI";
                                            const wait=makeElement("div","mh-sell-status",
                                                "Giao dịch đã gửi nhưng Sheet chưa đồng bộ kịp. Bấm KIỂM TRA LẠI để xác nhận đúng SELL_ID này; nút này không tạo giao dịch mới.");
                                            box.insertBefore(wait,box.firstChild);
                                        }
                                        return;
                                    }
                                    if(alive()){
                                        await render(true);
                                        if(alive()){
                                            const success=makeElement("div","mh-sell-status",
                                                "Đã xác nhận giao dịch. Reward Core đã đồng bộ lại hành trang và Linh Thạch.");
                                            box.insertBefore(success,box.firstChild);
                                        }
                                    }
                                }).catch(function(error){
                                    pendingSale=null;
                                    console.warn("[Minh Hồng] Xác nhận giao dịch:",error);
                                    if(alive()){
                                        sell.disabled=false; qty.disabled=false; sell.textContent="KIỂM TRA LẠI";
                                    }
                                });
                            }catch(err){
                                selling=false; pendingSale=null;
                                sell.disabled=false; qty.disabled=false; sell.textContent="BÁN VẬT PHẨM";
                                window.alert(err&&err.message?err.message:"Không thể gửi giao dịch. Vui lòng thử lại.");
                            }
                        });

                        actions.appendChild(qty); actions.appendChild(sell);
                        item.appendChild(actions); box.appendChild(item);
                    });
                    loaded=true;
                }catch(err){
                    status(err&&err.message?err.message:"Không thể tải hệ thống thu mua.");
                }
            }

            toggle.addEventListener("click",function(){
                opened=!opened;
                box.style.display=opened?"":"none";
                toggle.textContent=opened?"Đóng rao bán vật phẩm":"Rao bán vật phẩm cho Minh Hồng";
                if(opened&&!loaded) render(false);
            });

            const onProfileChanged=function(event){
                if(!alive()){
                    disposed=true;
                    window.removeEventListener("ocdRewardProfileChanged",onProfileChanged);
                    return;
                }
                if(!opened||selling||pendingSale) return;
                const detail=event&&event.detail?event.detail:{};
                if(!detail.code||String(detail.code).toUpperCase()===String(state.code).toUpperCase()){
                    render(true);
                }
            };
            window.addEventListener("ocdRewardProfileChanged",onProfileChanged);
        }

        return {append:append};
    })();
 
    function renderStudentPanel(state){
 
        panelBody.appendChild(
            makeElement(
                "div",
                "mh-status",
                state.verified
                ?
                (
                    CHAR.check+
                    " HỌC VIÊN "+
                    state.code
                )
                :
                (
                    ICONS.user+
                    " "+
                    state.code+
                    " "+
                    CHAR.dot+
                    " CHỜ XÁC MINH"
                )
            )
        );
 
 
        panelBody.appendChild(
            makeElement(
                "div",
                "mh-intro-title",
                state.verified
                ?
                "Chào mừng bạn quay lại."
                :
                "Minh Hồng đã ghi nhớ mã của bạn."
            )
        );
 
 
        panelBody.appendChild(
            makeElement(
                "div",
                "mh-intro-text",
                state.verified
                ?
                (
                    isCommunityContext()
                    ? "Mã học viên đã được xác minh. Minh Hồng sẽ đồng hành cùng bạn trên các trang của Thư Môn."
                    : isPersonalContext()
                    ? "Mã học viên đã được xác minh. Minh Hồng sẽ ưu tiên những lời khuyên học tập liên quan trực tiếp đến bạn."
                    : isClassPulseContext()
                    ? "Mã học viên đã được xác minh. Minh Hồng sẽ ưu tiên những lời khuyên học tập liên quan trực tiếp đến bạn."
                    : "Mã học viên đã được xác minh. Trang này không phát thông báo tự động."
                )
                :
                "Mã hiện đang được ghi nhớ nhưng chưa được một trang học viên xác minh."
            )
        );
 
 
        /* Nội dung Google Sheet dành riêng cho học viên.
           Đặt trước Community / Insight / Class Pulse để
           không thay đổi logic của các engine cũ. */
        appendStudentSheetContent(state);
 
        /* Rao bán vật phẩm: chỉ hiện với học viên đã xác minh. */
        MinhHongSellPanel.append(state);
 
 
        if(isCommunityContext()){
            appendCommunitySection();
        }else if(isPersonalContext()){
            appendPersonalInsight();
        }else if(isClassPulseContext()){
            appendClassPulseSection();
        }
 
 
        const sessionSection=
            makeElement(
                "div",
                "mh-section"
            );
 
 
        sessionSection.appendChild(
            makeElement(
                "div",
                "mh-section-title",
                ICONS.key+
                " MÃ HỌC VIÊN"
            )
        );
 
 
        const actions=
            makeElement(
                "div",
                "mh-actions"
            );
 
 
        const changeBox=
            makeElement(
                "div",
                "mh-inline-box"
            );
 
 
        changeBox.style.display=
            "none";
 
 
        const input=
            makeElement(
                "input",
                "mh-code-input"
            );
 
 
        input.type=
            "text";
 
 
        input.placeholder=
            "Nhập mã học viên mới";
 
 
        const submit=
            makeElement(
                "button",
                "mh-code-submit",
                "XÁC MINH MÃ MỚI"
            );
 
 
        submit.type=
            "button";
 
 
        async function saveNewCode(){
 
            const code=
                normalizeCode(
                    input.value
                );
 
 
            if(!code){
 
                input.focus();
 
                return;
            }
 
 
            if(submit.disabled){
                return;
            }
 
 
            const originalText=submit.textContent;
 
            submit.disabled=true;
            submit.textContent="ĐANG XÁC MINH...";
 
 
            try{
 
                const result=
                    await CommunityEngine
                    .verifyStudentCode(code);
 
 
                if(!result.ok){
 
                    alert(
                        "Không tìm thấy mã học viên "+code+". Vui lòng kiểm tra lại mã đã nhập."
                    );
 
                    input.focus();
                    input.select();
 
                    return;
                }
 
 
                OCDStudentSession
                .confirmStudent(
                    result.code,
                    "minh-hong-change-code"
                );
 
 
                refreshContext();
 
            }catch(error){
 
                console.warn(
                    "[Minh Hồng] Đổi mã học viên:",
                    error
                );
 
                alert(
                    "Minh Hồng chưa thể kiểm tra mã học viên lúc này. Vui lòng kiểm tra kết nối mạng và thử lại."
                );
 
            }finally{
 
                submit.disabled=false;
                submit.textContent=originalText;
 
            }
 
        }
 
 
        submit.addEventListener(
            "click",
            saveNewCode
        );
 
 
        input.addEventListener(
            "keydown",
            function(event){
 
                if(
                    event.key==="Enter"
                ){
 
                    saveNewCode();
 
                }
 
            }
        );
 
 
        changeBox.appendChild(
            input
        );
 
 
        changeBox.appendChild(
            submit
        );
 
 
        changeBox.appendChild(
            makeElement(
                "div",
                "mh-small-note",
                "Mã mới sẽ ở trạng thái chờ xác minh cho tới khi một trang học viên kiểm tra thành công."
            )
        );
 
 
        actions.appendChild(
            createActionButton(
                "Đổi mã học viên",
                false,
                function(){
 
                    changeBox.style.display=
                        changeBox.style.display==="none"
                        ?
                        "block"
                        :
                        "none";
 
 
                    if(
                        changeBox.style.display==="block"
                    ){
 
                        input.focus();
 
                    }
 
                }
            )
        );
 
 
        actions.appendChild(
            createActionButton(
                "Thoát phiên học viên",
                false,
                function(){
 
                    OCDStudentSession
                    .clear(
                        "minh-hong-logout"
                    );
 
 
                    guestView=
                        "home";
 
 
                    refreshContext();
 
                }
            )
        );
 
 
        sessionSection.appendChild(
            actions
        );
 
 
        sessionSection.appendChild(
            changeBox
        );
 
 
        panelBody.appendChild(
            sessionSection
        );
 
    }
 
 
    /* =====================================================
       RENDER
    ===================================================== */
 
    function renderPanel(){
 
        if(
            !panelBody ||
            !panelOpen
        ){
 
            return;
        }
 
 
        clearNode(
            panelBody
        );
 
 
        const session=
            OCDStudentSession
            .getState();
 
 
        if(
            session.mode==="student"
            &&
            session.code
            &&
            session.verified===true
        ){
 
            renderStudentPanel(
                session
            );
 
 
            return;
        }
 
 
        if(
            guestView==="newcomer"
        ){
 
            renderNewcomerGuide();
 
        }else{
 
            renderGuestHome();
 
        }
 
    }
 
 
    function refreshPersonalEvents(){
        personalNotificationEvents=
            isPersonalContext()
            ? buildPersonalNotificationEvents()
            : [];
    }
 
 
    function refreshContext(){
 
        refreshPersonalEvents();
 
        refreshContextSpeech();
 
 
        renderPanel();
 
 
        if(
            !panelOpen &&
            !notificationsMuted
        ){
 
            startNotificationLoop();
 
        }
 
    }
 
 
    /* =====================================================
       COMMUNITY
    ===================================================== */
 
    function setCommunityEvents(events){
 
        communityNotificationEvents=
            Array.isArray(
                events
            )
            ?
            events
            :
            [];
 
 
        if(isCommunityContext()){
 
            renderPanel();
 
 
            if(
                !panelOpen &&
                !notificationsMuted
            ){
 
                startNotificationLoop();
 
            }
 
        }
 
    }
 
 
    function initializeCommunity(){
 
        /* v1.5.8.0: đã bỏ Bảng tin cộng đồng – không tải CSV bài nộp ở trang chủ */
        return;
 
        if(!isCommunityContext()){
            return;
        }
 
 
        CommunityEngine
        .load()
        .then(
            function(events){
 
                setCommunityEvents(
                    events
                );
 
            }
        );
 
    }
 
 
    function scheduleCommunityInitialization(){
 
        if(
            !isHomePage()
        ){
 
            return;
        }
 
 
        setTimeout(
            function(){
 
                if(
                    "requestIdleCallback"
                    in
                    window
                ){
 
                    window.requestIdleCallback(
                        initializeCommunity,
                        {
                            timeout:
                                2000
                        }
                    );
 
                }else{
 
                    initializeCommunity();
 
                }
 
            },
            CONFIG.initializeDelay
        );
 
    }
 
 
    /* =====================================================
       EVENTS
    ===================================================== */
 
    window.addEventListener(
        "ocdStudentInsightReady",
        function(event){
 
            const detail=
                event.detail;
 
 
            if(
                !detail ||
                !detail.code
            ){
 
                return;
            }
 
 
            InsightStore.save(
                detail
            );
 
 
            refreshContext();
 
        }
    );
 
 
    window.addEventListener(
        "ocdMinhHongContextChanged",
        function(){
            /*
               FIX v1.5.5.1
               Context mới phải cập nhật đồng thời lời thoại Sheet và panel.
               Không để UI/engine cũ giữ nội dung trước đó khi trang con
               vừa công bố trạng thái mới.
            */
            refreshContextSpeech();
 
            if(panelOpen){
                renderPanel();
            }
        }
    );
 
 
    window.addEventListener(
        "ocdStudentSessionChanged",
        function(){
 
            guestView=
                "home";
 
 
            refreshContext();
 
        }
    );
 
 
    window.addEventListener(
        "ocdCommunityActivityReady",
        function(event){
 
            if(!isCommunityContext()){
                return;
            }
 
 
            const detail=
                event.detail ||
                {};
 
 
            setCommunityEvents(
                detail.events ||
                []
            );
 
        }
    );
 
 
    window.addEventListener(
        "ocdClassPulseReady",
        function(event){
            const detail=event.detail || null;
            setClassPulse(detail);
        }
    );
 
    window.addEventListener(
        "ocdMinhHongPageContextReady",
        function(event){
            const detail=event.detail || {};
            const context=normalizePageContext(detail.context);
            if(context){
                window.OCDMinhHongPageContext=context;
            }
            refreshPersonalEvents();
            refreshContextSpeech();
            if(isClassPulseContext()){
                setClassPulse(readClassPulse());
            }else{
                renderPanel();
                if(!panelOpen && !notificationsMuted){
                    startNotificationLoop();
                }
            }
        }
    );
 
    window.addEventListener(
        "storage",
        function(event){
 
            if(
                event.key===
                CONFIG.insightStorageKey
            ){
 
                InsightStore.clearMemory();
 
 
                refreshContext();
 
            }
 
        }
    );
 
 
    /* =====================================================
       START
    ===================================================== */
 
    function start(){
 
        createDOM();
 
 
        refreshPersonalEvents();
 
        if(!isSilentContext()){
            refreshContextSpeech();
        }
 
        if(isClassPulseContext()){
            setClassPulse(readClassPulse());
        }
 
 
        if(
            document.readyState==="complete"
        ){
 
            scheduleCommunityInitialization();
 
        }else{
 
            window.addEventListener(
                "load",
                scheduleCommunityInitialization,
                {
                    once:true
                }
            );
 
        }
 
 
        if(
            !isCommunityContext()
            && !isSilentContext()
            && !notificationsMuted
        ){
            startNotificationLoop();
        }
 
 
        try{
 
            window.dispatchEvent(
                new CustomEvent(
                    "ocdMinhHongReady",
                    {
                        detail:{
 
                            version:
                                CONFIG.version,
 
                            home:
                                isHomePage(),
 
                            pageContext:
                                getPageContext(),
 
                            session:
                                OCDStudentSession
                                .getState()
 
                        }
                    }
                )
            );
 
        }catch(error){}
 
    }
 
 
    if(
        document.readyState==="loading"
    ){
 
        document.addEventListener(
            "DOMContentLoaded",
            start,
            {
                once:true
            }
        );
 
    }else{
 
        start();
 
    }
 
 
    /* =====================================================
       CONTENT PRELOAD v1.5.4
       Khách chỉ preload đúng tab của trang hiện tại.
       Guest chỉ được tải sau nếu tab trang không có nội dung.
       Không chặn UI và không ảnh hưởng Student Mode.
    ===================================================== */
 
    if(!OCDStudentSession.isVerified()){
        GuestJourney.registerVisit(getPageContentTab());
        setTimeout(function(){
            MinhHongContentEngine.load(getPageContentTab());
        },1200);
    }
 
 
    /* =====================================================
       PUBLIC API
    ===================================================== */
 
    return{
 
        version:
            CONFIG.version,
 
        open:
            openPanel,
 
        close:
            closePanel,
 
        toggle:
            togglePanel,
 
        refresh:
            refreshContext,
 
        getState:
            function(){
 
                return{
 
                    panelOpen,
 
                    notificationsMuted,
 
                    home:
                        isHomePage(),
 
                    pageContext:
                        getPageContext(),
 
                    contentTab:
                        getPageContentTab(),
 
                    context:
                        MinhHongContextStore.getState(),
 
                    notificationMode:
                        getPageContext(),
 
                    student:
                        OCDStudentSession
                        .getState(),
 
                    communityActivityCount:
                        CommunityEngine
                        .getEvents()
                        .length,
 
                    personalSuggestionCount:
                        personalNotificationEvents.length,
 
                    contextSpeechCount:
                        contextSpeechEvents.length,
 
                    classPulseEventCount:
                        classPulseNotificationEvents.length,
 
                    hasInsight:
                        Boolean(
                            InsightStore
                            .getForCurrentStudent()
                        )
 
                };
 
            }
 
    };
 
})();
 
 
window.MinhHongAssistant=
    MinhHongAssistant;
 
 
/* =========================================================
   DEBUG
========================================================= */
 
console.info(
    "[Minh Hồng] Footer v"+
    CONFIG.version+
    " ready | mode:",
    getPageContext()
);
 
 
})();
 
 
 
 

