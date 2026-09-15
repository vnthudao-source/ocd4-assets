/* =========================================================
   MINH HỒNG COMMUNITY ASSISTANT
   FOOTER GLOBAL v1.4.0
   EXTERNAL JS
   Tách từ Footer v1.4.0 hiện tại.
   CSS đã chuyển sang minh-hong-footer.css.
========================================================= */

(function(){

"use strict";


/* =========================================================
   DUPLICATE GUARD
========================================================= */

if(
    window.__OCD_MINH_HONG_FOOTER_V140__
){
    return;
}

window.__OCD_MINH_HONG_FOOTER_V140__=
    true;


/* =========================================================
   CONFIG
========================================================= */

const CONFIG={

    version:
        "1.4.0",

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
   - Trang tra cứu/hồ sơ: PERSONAL INSIGHT
   - Trang tác phẩm/nộp bài: CLASS PULSE
   - Trang khác: SILENT

   Ưu tiên context do trang con công bố.
   Có fallback theo DOM để tương thích các trang hiện tại.
========================================================= */

function normalizePageContext(value){

    const context=
        clean(value)
        .toLowerCase();

    if(
        context==="community" ||
        context==="personal" ||
        context==="class-pulse" ||
        context==="silent"
    ){
        return context;
    }

    return "";

}


function getPageContext(){

    if(isHomePage()){
        return "community";
    }

    const explicit=
        normalizePageContext(
            window.OCDMinhHongPageContext
        );

    if(explicit){
        return explicit;
    }

    if(
        document.getElementById(
            "ocd4-student-work-page"
        )
    ){
        return "class-pulse";
    }

    if(
        document.getElementById(
            "rewardExchangeApp"
        )
    ){
        return "personal";
    }

    return "silent";

}


function isCommunityContext(){
    return getPageContext()==="community";
}

function isPersonalContext(){
    return getPageContext()==="personal";
}

function isClassPulseContext(){
    return getPageContext()==="class-pulse";
}

function isSilentContext(){
    return getPageContext()==="silent";
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

    let memoryData=
        null;


    function sanitize(data){

        if(
            !data ||
            !data.code
        ){

            return null;
        }


        const result=
            Object.assign(
                {},
                data
            );


        delete result.marketAdvice;


        result.code=
            normalizeCode(
                result.code
            );


        result.savedAt=
            Number(
                result.savedAt ||
                Date.now()
            );


        return result;

    }


    function save(data){

        const result=
            sanitize(
                data
            );


        if(!result){

            return null;
        }


        result.savedAt=
            Date.now();


        memoryData=
            result;


        safeStorageSet(
            CONFIG.insightStorageKey,
            JSON.stringify(
                result
            )
        );


        return result;

    }


    function read(){

        if(memoryData){

            if(
                Date.now()-
                Number(
                    memoryData.savedAt ||
                    0
                )
                <=
                CONFIG.insightMaxAge
            ){

                return Object.assign(
                    {},
                    memoryData
                );

            }


            memoryData=
                null;

        }


        const raw=
            safeStorageGet(
                CONFIG.insightStorageKey
            );


        if(!raw){

            return null;
        }


        try{

            const data=
                sanitize(
                    JSON.parse(
                        raw
                    )
                );


            if(!data){

                return null;
            }


            if(
                Date.now()-
                Number(
                    data.savedAt ||
                    0
                )
                >
                CONFIG.insightMaxAge
            ){

                safeStorageRemove(
                    CONFIG.insightStorageKey
                );


                return null;
            }


            memoryData=
                data;


            return Object.assign(
                {},
                memoryData
            );

        }catch(error){

            return null;
        }

    }


    function getForCurrentStudent(){

        const data=
            read();


        const session=
            OCDStudentSession
            .getState();


        if(
            !data ||
            !session.code
        ){

            return null;
        }


        if(
            normalizeCode(
                data.code
            )
            !==
            normalizeCode(
                session.code
            )
        ){

            return null;
        }


        return data;

    }


    function clearMemory(){

        memoryData=
            null;

    }


    return{

        save:
            save,

        read:
            read,

        getForCurrentStudent:
            getForCurrentStudent,

        clearMemory:
            clearMemory

    };

})();
