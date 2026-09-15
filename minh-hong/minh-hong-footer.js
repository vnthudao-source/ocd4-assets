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
        "1.4.3",

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

    return "silent";
}

function isCommunityContext(){ return getPageContext()==="community"; }
function isPersonalContext(){ return getPageContext()==="personal"; }
function isClassPulseContext(){ return getPageContext()==="class-pulse"; }
function isSilentContext(){ return getPageContext()==="silent"; }

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


/* =========================================================
   COMMUNITY ENGINE
========================================================= */

const CommunityEngine=
(function(){

    let events=[];

    let ready=false;

    let loadingPromise=null;


    function saveCache(list){

        safeStorageSet(
            CONFIG.communityCacheKey,
            JSON.stringify(
                {
                    savedAt:
                        Date.now(),

                    events:
                        list
                }
            )
        );

    }


    function getCache(){

        const raw=
            safeStorageGet(
                CONFIG.communityCacheKey
            );


        if(!raw){

            return null;
        }


        try{

            const data=
                JSON.parse(
                    raw
                );


            if(
                !data ||
                !Array.isArray(
                    data.events
                ) ||
                !data.savedAt
            ){

                return null;
            }


            if(
                Date.now()-
                Number(
                    data.savedAt
                )
                >
                CONFIG.communityCacheTime
            ){

                return null;
            }


            return data.events;

        }catch(error){

            return null;
        }

    }


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


    function parseDate(value){

        const text=
            clean(
                value
            );


        if(!text){

            return null;
        }


        const match=
            text.match(
                /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/
            );


        if(match){

            return{

                time:
                    Date.UTC(

                        Number(
                            match[3]
                        ),

                        Number(
                            match[2]
                        )-1,

                        Number(
                            match[1]
                        ),

                        Number(
                            match[4] ||
                            0
                        )-7,

                        Number(
                            match[5] ||
                            0
                        ),

                        Number(
                            match[6] ||
                            0
                        )

                    )

            };

        }


        const date=
            new Date(
                text
            );


        if(
            Number.isNaN(
                date.getTime()
            )
        ){

            return null;
        }


        return{

            time:
                date.getTime()

        };

    }


    function longestStreak(
        submissions
    ){

        const unique=
            new Set();


        submissions.forEach(
            function(item){

                const vietnamDate=
                    new Date(
                        item.dateInfo.time+
                        7*60*60*1000
                    );


                const dayNumber=
                    Math.floor(

                        Date.UTC(

                            vietnamDate.getUTCFullYear(),

                            vietnamDate.getUTCMonth(),

                            vietnamDate.getUTCDate()

                        )

                        /

                        CONFIG.oneDay

                    );


                unique.add(
                    dayNumber
                );

            }
        );


        const days=
            Array.from(
                unique
            )
            .sort(
                function(a,b){

                    return a-b;

                }
            );


        if(!days.length){

            return 0;
        }


        let current=1;

        let best=1;


        for(
            let i=1;
            i<days.length;
            i++
        ){

            if(
                days[i]-
                days[i-1]
                ===
                1
            ){

                current++;

            }else{

                current=1;

            }


            best=
                Math.max(
                    best,
                    current
                );

        }


        return best;

    }


    function highRuns(
        submissions
    ){

        const graded=
            submissions
            .slice()
            .sort(
                function(a,b){

                    if(
                        a.dateInfo.time!==
                        b.dateInfo.time
                    ){

                        return(
                            a.dateInfo.time-
                            b.dateInfo.time
                        );

                    }


                    return(
                        a.originalIndex-
                        b.originalIndex
                    );

                }
            )
            .filter(
                function(item){

                    return(
                        parseScore(
                            item.score
                        )
                        !==
                        null
                    );

                }
            );


        const runs=[];

        let current=0;


        graded.forEach(
            function(item){

                if(
                    parseScore(
                        item.score
                    )
                    >=
                    6
                ){

                    current++;

                }else{

                    if(current){

                        runs.push(
                            current
                        );

                    }


                    current=0;

                }

            }
        );


        if(current){

            runs.push(
                current
            );

        }


        return runs;

    }


    function countBlocks(
        runs,
        size
    ){

        return runs.reduce(
            function(
                total,
                run
            ){

                return(
                    total+
                    Math.floor(
                        run/
                        size
                    )
                );

            },
            0
        );

    }


    function calculateAchievement(
        submissions
    ){

        const streak=
            longestStreak(
                submissions
            );


        const runs=
            highRuns(
                submissions
            );


        const blockCounts={

            3:
                countBlocks(
                    runs,
                    3
                ),

            4:
                countBlocks(
                    runs,
                    4
                ),

            5:
                countBlocks(
                    runs,
                    5
                )

        };


        let bestStreak=null;

        const highRewards=[];


        GIFT_RULES.forEach(
            function(gift){

                if(
                    gift.type===
                    "streak"
                ){

                    if(
                        streak>=
                        gift.value
                    ){

                        if(
                            !bestStreak ||
                            gift.value>
                            bestStreak.value
                        ){

                            bestStreak=
                                gift;

                        }

                    }

                }else{

                    if(
                        (
                            blockCounts[
                                gift.block
                            ] || 0
                        )
                        >=
                        gift.count
                    ){

                        highRewards.push(
                            gift
                        );

                    }

                }

            }
        );


        let hoangNgoc=0;


        if(bestStreak){

            hoangNgoc+=
                bestStreak
                .hoangNgocValue;

        }


        highRewards.forEach(
            function(gift){

                hoangNgoc+=
                    gift.hoangNgocValue;

            }
        );


        return{

            bestStreak:
                bestStreak,

            highRewards:
                highRewards,

            hoangNgoc:
                hoangNgoc

        };

    }


    function calculateSnapshot(
        submissions
    ){

        let score5=0;
        let score6=0;
        let score7=0;
        let score89=0;
        let score10=0;


        submissions.forEach(
            function(item){

                const score=
                    parseScore(
                        item.score
                    );


                if(score===5){

                    score5++;

                }

                else if(score===6){

                    score6++;

                }

                else if(score===7){

                    score7++;

                }

                else if(
                    score===8 ||
                    score===9
                ){

                    score89++;

                }

                else if(score===10){

                    score10++;

                }

            }
        );


        const achievement=
            calculateAchievement(
                submissions
            );


        const hoangNgoc=
            Math.floor(
                score5/2
            )
            +
            achievement.hoangNgoc;


        const haiLam=
            Math.floor(
                score6/2
            );


        const thachAnh=
            Math.floor(
                score7/2
            );


        const lamBao=
            Math.floor(
                score89/2
            );


        const lucFromHoang=
            Math.floor(
                hoangNgoc/5
            );


        const lucFromHai=
            Math.floor(
                haiLam/4
            );


        const lucFromThach=
            Math.floor(
                thachAnh/3
            );


        const lucFromLam=
            Math.floor(
                lamBao/2
            );


        const lucFrom10=
            score10;


        const totalLuc=
            lucFromHoang+
            lucFromHai+
            lucFromThach+
            lucFromLam+
            lucFrom10;


        return{

            score5,
            score6,
            score7,
            score89,
            score10,

            achievement,

            hoangNgoc,
            haiLam,
            thachAnh,
            lamBao,

            lucFromHoang,
            lucFromHai,
            lucFromThach,
            lucFromLam,
            lucFrom10,

            totalLuc,

            hongNgoc:
                Math.floor(
                    totalLuc/3
                )

        };

    }


    function calculateOutcome(
        before,
        after
    ){

        const items=[];


        const hong=
            after.hongNgoc-
            before.hongNgoc;


        if(hong>0){

            items.push({
                type:"hong",
                name:"Hồng Ngọc",
                count:hong,
                weight:1000
            });

        }


        const newLuc=
            after.totalLuc-
            before.totalLuc;


        const consumedLuc=
            hong*3;


        const lucRemaining=
            Math.max(
                0,
                newLuc-consumedLuc
            );


        if(lucRemaining>0){

            items.push({
                type:"luc",
                name:"Lục Thạch",
                count:lucRemaining,
                weight:250
            });

        }


        const lamDelta=
            after.lamBao-
            before.lamBao;


        const lamConsumed=
            (
                after.lucFromLam-
                before.lucFromLam
            )*2;


        if(
            lamDelta-
            lamConsumed>
            0
        ){

            items.push({
                type:"lam",
                name:"Lam Bảo Thạch",
                count:lamDelta-lamConsumed,
                weight:90
            });

        }


        const thachDelta=
            after.thachAnh-
            before.thachAnh;


        const thachConsumed=
            (
                after.lucFromThach-
                before.lucFromThach
            )*3;


        if(
            thachDelta-
            thachConsumed>
            0
        ){

            items.push({
                type:"thach",
                name:"Thạch Anh Tím",
                count:thachDelta-thachConsumed,
                weight:70
            });

        }


        const haiDelta=
            after.haiLam-
            before.haiLam;


        const haiConsumed=
            (
                after.lucFromHai-
                before.lucFromHai
            )*4;


        if(
            haiDelta-
            haiConsumed>
            0
        ){

            items.push({
                type:"hai",
                name:"Hải Lam Ngọc",
                count:haiDelta-haiConsumed,
                weight:50
            });

        }


        const hoangDelta=
            after.hoangNgoc-
            before.hoangNgoc;


        const hoangConsumed=
            (
                after.lucFromHoang-
                before.lucFromHoang
            )*5;


        if(
            hoangDelta-
            hoangConsumed>
            0
        ){

            items.push({
                type:"hoang",
                name:"Hoàng Ngọc",
                count:hoangDelta-hoangConsumed,
                weight:25
            });

        }


        return items;

    }


    function outcomeText(items){

        return items
        .map(
            function(item){

                return(
                    item.count+
                    " "+
                    item.name
                );

            }
        )
        .join(
            " và "
        );

    }


    function getGemReason(
        before,
        after,
        submission
    ){

        const score=
            parseScore(
                submission.score
            );


        if(
            after.hongNgoc>
            before.hongNgoc
        ){

            if(score===10){

                return(
                    "bài vừa chấm đạt 10 điểm và tích đủ 3 Lục Thạch"
                );

            }


            return(
                "tích đủ 3 Lục Thạch để hợp thành Hồng Ngọc"
            );

        }


        if(
            after.achievement.bestStreak &&
            (
                !before.achievement.bestStreak

                ||

                after.achievement.bestStreak.id
                !==
                before.achievement.bestStreak.id
            )
        ){

            return(
                "duy trì chuỗi "+
                after.achievement.bestStreak.value+
                " ngày luyện tập liên tiếp"
            );

        }


        const oldIds=
            new Set(
                before
                .achievement
                .highRewards
                .map(
                    function(gift){

                        return gift.id;

                    }
                )
            );


        const newlyUnlocked=
            after
            .achievement
            .highRewards
            .filter(
                function(gift){

                    return(
                        !oldIds.has(
                            gift.id
                        )
                    );

                }
            );


        if(newlyUnlocked.length){

            newlyUnlocked.sort(
                function(a,b){

                    return(
                        b.hoangNgocValue-
                        a.hoangNgocValue
                    );

                }
            );


            return(
                "đạt chuỗi "+
                newlyUnlocked[0].block+
                " bài liên tiếp từ 6 điểm"
            );

        }


        if(score===10){

            return(
                "bài vừa chấm đạt 10 điểm"
            );

        }


        if(
            after.lamBao>
            before.lamBao
        ){

            return(
                "hoàn thành đủ 2 bài đạt 8-9 điểm"
            );

        }


        if(
            after.thachAnh>
            before.thachAnh
        ){

            return(
                "hoàn thành đủ 2 bài đạt 7 điểm"
            );

        }


        if(
            after.haiLam>
            before.haiLam
        ){

            return(
                "hoàn thành đủ 2 bài đạt 6 điểm"
            );

        }


        return(
            "đạt đủ điều kiện quy đổi linh thạch"
        );

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


    function groupStudents(
        rows,
        columns
    ){

        const students=
            Object.create(
                null
            );


        for(
            let i=1;
            i<rows.length;
            i++
        ){

            const row=
                rows[i];


            const dateInfo=
                parseDate(
                    row[
                        columns.timeIndex
                    ]
                );


            if(!dateInfo){

                continue;
            }


            const studentCode=
                columns.codeIndex>=0
                ?
                normalizeCode(
                    row[
                        columns.codeIndex
                    ]
                )
                :
                "";


            const name=
                columns.nameIndex>=0
                ?
                clean(
                    row[
                        columns.nameIndex
                    ]
                )
                :
                "";


            if(
                !studentCode &&
                !name
            ){

                continue;
            }


            const key=
                studentCode
                ?
                "CODE:"+studentCode
                :
                "NAME:"+name.toUpperCase();


            if(
                !students[key]
            ){

                students[key]={

                    key,

                    code:
                        studentCode,

                    name:
                        name ||
                        studentCode ||
                        "Một học viên",

                    submissions:
                        []

                };

            }


            students[key]
            .submissions
            .push({

                score:
                    columns.scoreIndex>=0
                    ?
                    (
                        row[
                            columns.scoreIndex
                        ] || ""
                    )
                    :
                    "",

                file:
                    columns.fileIndex>=0
                    ?
                    (
                        row[
                            columns.fileIndex
                        ] || ""
                    )
                    :
                    "",

                comment:
                    (
                        columns.commentIndex>=0
                        &&
                        columns.commentIndex<
                        row.length
                    )
                    ?
                    (
                        row[
                            columns.commentIndex
                        ] || ""
                    )
                    :
                    "",

                dateInfo,

                originalIndex:
                    i

            });

        }


        return students;

    }


    function buildGemEvents(
        students
    ){

        const now=
            Date.now();


        const list=[];


        Object.keys(
            students
        )
        .forEach(
            function(key){

                const student=
                    students[key];


                const ordered=
                    student
                    .submissions
                    .slice()
                    .sort(
                        function(a,b){

                            if(
                                a.dateInfo.time!==
                                b.dateInfo.time
                            ){

                                return(
                                    a.dateInfo.time-
                                    b.dateInfo.time
                                );

                            }


                            return(
                                a.originalIndex-
                                b.originalIndex
                            );

                        }
                    );


                let before=
                    calculateSnapshot(
                        []
                    );


                const history=[];


                ordered.forEach(
                    function(submission){

                        history.push(
                            submission
                        );


                        const after=
                            calculateSnapshot(
                                history
                            );


                        const age=
                            now-
                            submission.dateInfo.time;


                        if(
                            age>=0
                            &&
                            age<=
                            CONFIG.eventWindow
                        ){

                            const items=
                                calculateOutcome(
                                    before,
                                    after
                                );


                            if(items.length){

                                list.push({

                                    type:
                                        "gem",

                                    studentKey:
                                        key,

                                    studentCode:
                                        student.code,

                                    name:
                                        student.name,

                                    time:
                                        submission.dateInfo.time,

                                    items,

                                    outcome:
                                        outcomeText(
                                            items
                                        ),

                                    weight:
                                        items.reduce(
                                            function(
                                                total,
                                                item
                                            ){

                                                return(
                                                    total+
                                                    item.weight*
                                                    item.count
                                                );

                                            },
                                            0
                                        ),

                                    reason:
                                        getGemReason(
                                            before,
                                            after,
                                            submission
                                        )

                                });

                            }

                        }


                        before=
                            after;

                    }
                );

            }
        );


        list.sort(
            function(a,b){

                if(
                    b.weight!==
                    a.weight
                ){

                    return(
                        b.weight-
                        a.weight
                    );

                }


                return(
                    b.time-
                    a.time
                );

            }
        );


        const seen=
            new Set();


        return list
        .filter(
            function(event){

                if(
                    seen.has(
                        event.studentKey
                    )
                ){

                    return false;
                }


                seen.add(
                    event.studentKey
                );


                return true;

            }
        )
        .slice(
            0,
            CONFIG.gemEventLimit
        );

    }


    function buildUploadEvents(
        students
    ){

        const now=
            Date.now();


        const list=[];


        Object.keys(
            students
        )
        .forEach(
            function(key){

                const student=
                    students[key];


                student
                .submissions
                .forEach(
                    function(submission){

                        const age=
                            now-
                            submission.dateInfo.time;


                        if(
                            age<0
                            ||
                            age>
                            CONFIG.eventWindow
                        ){

                            return;
                        }


                        if(
                            !clean(
                                submission.file
                            )
                        ){

                            return;
                        }


                        list.push({

                            type:
                                "upload",

                            studentKey:
                                key,

                            studentCode:
                                student.code,

                            name:
                                student.name,

                            time:
                                submission.dateInfo.time

                        });

                    }
                );

            }
        );


        list.sort(
            function(a,b){

                return(
                    b.time-
                    a.time
                );

            }
        );


        const seen=
            new Set();


        return list
        .filter(
            function(event){

                if(
                    seen.has(
                        event.studentKey
                    )
                ){

                    return false;
                }


                seen.add(
                    event.studentKey
                );


                return true;

            }
        )
        .slice(
            0,
            CONFIG.uploadEventLimit
        );

    }


    function buildCommentEvents(
        students
    ){

        const list=[];


        Object.keys(
            students
        )
        .forEach(
            function(key){

                const student=
                    students[key];


                student
                .submissions
                .forEach(
                    function(submission){

                        const comment=
                            clean(
                                submission.comment
                            );


                        if(!comment){

                            return;
                        }


                        list.push({

                            type:
                                "comment",

                            studentKey:
                                key,

                            studentCode:
                                student.code,

                            name:
                                student.name,

                            comment,

                            time:
                                submission.dateInfo.time

                        });

                    }
                );

            }
        );


        list.sort(
            function(a,b){

                return(
                    b.time-
                    a.time
                );

            }
        );


        const seen=
            new Set();


        return list
        .filter(
            function(event){

                if(
                    seen.has(
                        event.studentKey
                    )
                ){

                    return false;
                }


                seen.add(
                    event.studentKey
                );


                return true;

            }
        )
        .slice(
            0,
            CONFIG.commentEventLimit
        );

    }


    function mergeEvents(
        gems,
        comments,
        uploads
    ){

        const result=[];


        let g=0;
        let c=0;
        let u=0;


        while(
            g<gems.length
            ||
            c<comments.length
            ||
            u<uploads.length
        ){

            for(
                let i=0;
                i<2;
                i++
            ){

                if(
                    g<
                    gems.length
                ){

                    result.push(
                        gems[g]
                    );

                    g++;

                }

            }


            if(
                c<
                comments.length
            ){

                result.push(
                    comments[c]
                );

                c++;

            }


            if(
                u<
                uploads.length
            ){

                result.push(
                    uploads[u]
                );

                u++;

            }


            if(
                g>=
                gems.length
            ){

                while(
                    c<comments.length
                    ||
                    u<uploads.length
                ){

                    if(
                        c<
                        comments.length
                    ){

                        result.push(
                            comments[c]
                        );

                        c++;

                    }


                    if(
                        u<
                        uploads.length
                    ){

                        result.push(
                            uploads[u]
                        );

                        u++;

                    }

                }

            }

        }


        return result;

    }


    function fetchAndBuild(){

        return fetch(
            CONFIG.csvUrl
        )
        .then(
            function(response){

                if(
                    !response.ok
                ){

                    throw new Error(
                        "Không thể tải dữ liệu cộng đồng."
                    );

                }


                return response.text();

            }
        )
        .then(
            function(csv){

                const rows=
                    parseCSV(
                        csv
                    );


                if(
                    !rows ||
                    rows.length<2
                ){

                    return [];
                }


                const columns=
                    getColumns(
                        rows
                    );


                if(
                    columns.timeIndex<
                    0
                ){

                    return [];
                }


                const students=
                    groupStudents(
                        rows,
                        columns
                    );


                const result=
                    mergeEvents(

                        buildGemEvents(
                            students
                        ),

                        buildCommentEvents(
                            students
                        ),

                        buildUploadEvents(
                            students
                        )

                    );


                saveCache(
                    result
                );


                return result;

            }
        );

    }


    function emitReady(){

        try{

            window.dispatchEvent(
                new CustomEvent(
                    "ocdCommunityActivityReady",
                    {
                        detail:{

                            events:
                                events.slice(),

                            count:
                                events.length

                        }
                    }
                )
            );

        }catch(error){}

    }


    function load(){

        if(ready){

            return Promise.resolve(
                events.slice()
            );

        }


        if(loadingPromise){

            return loadingPromise;
        }


        const cached=
            getCache();


        if(
            cached &&
            cached.length
        ){

            events=
                cached;


            ready=
                true;


            emitReady();


            return Promise.resolve(
                events.slice()
            );

        }


        loadingPromise=
            fetchAndBuild()
            .then(
                function(result){

                    events=
                        result ||
                        [];


                    ready=
                        true;


                    emitReady();


                    return events.slice();

                }
            )
            .catch(
                function(error){

                    console.warn(
                        "[Minh Hồng] Community:",
                        error
                    );


                    events=[];

                    ready=true;


                    emitReady();


                    return [];

                }
            )
            .finally(
                function(){

                    loadingPromise=
                        null;

                }
            );


        return loadingPromise;

    }


    function getEvents(){

        return events.slice();

    }


    return{

        load,
        getEvents,

        isReady:
            function(){

                return ready;

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
            muteButton
        );


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
            notification
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


        notificationClose.addEventListener(
            "click",
            function(){

                hideNotification();


                scheduleNext(
                    activeGapTime()
                );

            }
        );


        notification.addEventListener(
            "click",
            function(event){

                if(
                    event.target.closest(
                        ".mh-notification-close"
                    )
                ){

                    return;
                }


                if(
                    !isHomePage()
                ){

                    openPanel();

                }

            }
        );


        muteButton.addEventListener(
            "click",
            toggleMute
        );


        renderMuteButton();


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
       PERSONAL NOTIFICATION
    ===================================================== */

    function buildPersonalNotificationEvents(){

        const data=
            InsightStore
            .getForCurrentStudent();


        if(
            !data ||
            !OCDStudentSession.isVerified()
        ){

            return [];
        }


        const list=[];


        if(
            data.trend &&
            data.trend.text
        ){

            let icon=
                ICONS.stable;


            if(
                data.trend.type==="up"
            ){

                icon=ICONS.up;

            }

            else if(
                data.trend.type==="down"
            ){

                icon=ICONS.down;

            }


            list.push({

                personal:true,

                type:"trend",

                icon,

                title:
                    "Tiến độ học tập",

                text:
                    clean(
                        data.trend.text
                    )

            });

        }


        if(
            Array.isArray(
                data.advices
            )
        ){

            data.advices
            .slice(
                0,
                3
            )
            .forEach(
                function(advice){

                    if(
                        !advice ||
                        !advice.text
                    ){

                        return;
                    }


                    list.push({

                        personal:true,

                        type:"advice",

                        icon:
                            advice.icon ||
                            ICONS.tip,

                        title:
                            "Minh Hồng nhắc bạn",

                        text:
                            clean(
                                advice.text
                            )

                    });

                }
            );

        }


        if(
            data.goal &&
            (
                data.goal.name ||
                data.goal.detail
            )
        ){

            list.push({

                personal:true,

                type:"goal",

                icon:
                    ICONS.target,

                title:
                    clean(
                        data.goal.name ||
                        "Mục tiêu tiếp theo"
                    ),

                text:
                    clean(
                        data.goal.detail
                    )

            });

        }


        if(
            data.priorityGift &&
            data.priorityGift.name
        ){

            const gift=
                data.priorityGift;


            list.push({

                personal:true,

                type:"gift",

                icon:
                    ICONS.gift,

                title:
                    "Vật phẩm nên ưu tiên: "+
                    clean(
                        gift.name
                    ),

                text:
                    clean(
                        gift.statusText ||
                        gift.description ||
                        ""
                    )

            });

        }


        return list.slice(
            0,
            CONFIG.maxPersonalNotifications
        );

    }


    function activeEvents(){
        const context=getPageContext();

        if(context==="community"){
            return communityNotificationEvents;
        }

        if(context==="personal"){
            return personalNotificationEvents;
        }

        if(context==="class-pulse"){
            return classPulseNotificationEvents;
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


        if(
            !isHomePage()
            &&
            !OCDStudentSession.isVerified()
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


        if(
            !isHomePage()
            &&
            !OCDStudentSession.isVerified()
        ){

            return;
        }


        nextTimer=
            setTimeout(
                nextNotification,
                delay
            );

    }


    function nextNotification(){

        const list=
            activeEvents();


        if(
            panelOpen ||
            notificationsMuted ||
            !list.length
        ){

            return;
        }


        if(
            currentIndex>=
            list.length
        ){

            currentIndex=0;
        }


        showNotification(
            list[
                currentIndex
            ]
        );


        currentIndex++;


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


        if(
            !isHomePage()
            &&
            !OCDStudentSession.isVerified()
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
       COMMUNITY PANEL
    ===================================================== */

    function appendCommunityActivityList(
        container,
        list,
        max
    ){

        const wrap=
            makeElement(
                "div",
                "mh-activity-list"
            );


        const items=
            list.slice(
                0,
                max || 6
            );


        if(!items.length){

            wrap.appendChild(
                makeElement(
                    "div",
                    "mh-empty",
                    CommunityEngine.isReady()
                    ?
                    "Hiện chưa có hoạt động cộng đồng mới."
                    :
                    "Minh Hồng đang chuẩn bị dữ liệu hoạt động..."
                )
            );


            container.appendChild(
                wrap
            );


            return;
        }


        items.forEach(
            function(event){

                const item=
                    makeElement(
                        "div",
                        "mh-activity-item "+
                        getCommunityEventClass(
                            event
                        )
                    );


                item.appendChild(
                    makeElement(
                        "div",
                        "mh-activity-icon",
                        getCommunityEventIcon(
                            event
                        )
                    )
                );


                const content=
                    makeElement(
                        "div",
                        "mh-activity-content"
                    );


                const main=
                    makeElement(
                        "div",
                        "mh-activity-main"
                    );


                const strong=
                    document.createElement(
                        "strong"
                    );


                strong.textContent=
                    event.name;


                main.appendChild(
                    strong
                );


                main.appendChild(
                    document.createTextNode(
                        " "+
                        getCommunityEventText(
                            event
                        )
                    )
                );


                content.appendChild(
                    main
                );


                content.appendChild(
                    makeElement(
                        "div",
                        "mh-activity-time",
                        relativeTime(
                            event.time
                        )
                    )
                );


                item.appendChild(
                    content
                );


                wrap.appendChild(
                    item
                );

            }
        );


        container.appendChild(
            wrap
        );

    }


    function appendCommunitySection(){

        if(!isCommunityContext()){
            return;
        }


        const section=
            makeElement(
                "div",
                "mh-section"
            );


        section.appendChild(
            makeElement(
                "div",
                "mh-section-title",
                ICONS.community+
                " HOẠT ĐỘNG CỘNG ĐỒNG GẦN ĐÂY"
            )
        );


        appendCommunityActivityList(
            section,
            CommunityEngine.getEvents(),
            6
        );


        panelBody.appendChild(
            section
        );

    }


    /* =====================================================
       CLASS PULSE PANEL
    ===================================================== */

    function readClassPulse(){
        try{
            if(window.OCDClassPulse && typeof window.OCDClassPulse.getState==="function"){
                return window.OCDClassPulse.getState() || null;
            }
        }catch(error){}
        return classPulseState;
    }

    function normalizeClassPulseEvents(pulse){
        if(!pulse || !Array.isArray(pulse.events)){
            return [];
        }

        return pulse.events.slice(0,5).map(function(event){
            return{
                classPulse:true,
                type:clean(event.type || "class-pulse"),
                icon:event.icon || ICONS.activity,
                title:clean(event.title || "Nhịp lớp học"),
                text:clean(event.text || event.message || "")
            };
        }).filter(function(event){
            return Boolean(event.text);
        });
    }

    function setClassPulse(pulse){
        classPulseState=pulse || readClassPulse();
        classPulseNotificationEvents=normalizeClassPulseEvents(classPulseState);

        if(isClassPulseContext()){
            renderPanel();
            if(!panelOpen && !notificationsMuted){
                startNotificationLoop();
            }
        }
    }

    function appendClassPulseSection(){
        if(!isClassPulseContext()){
            return;
        }

        const pulse=readClassPulse();
        const section=makeElement("div","mh-insight-wrap");
        section.appendChild(makeElement("div","mh-insight-head",ICONS.activity+" NHỊP LỚP HỌC"));

        if(!pulse){
            section.appendChild(makeElement("div","mh-empty","Đang chờ trang Tác phẩm học viên tổng hợp 20 bài nộp mới nhất. Minh Hồng không tải lại Sheet nên trang vẫn nhẹ."));
            panelBody.appendChild(section);
            return;
        }

        const summary=makeElement("div","mh-insight-summary");
        function stat(value,label){
            const box=makeElement("div","mh-insight-stat");
            box.appendChild(makeElement("div","mh-insight-stat-value",String(value===undefined || value===null ? "—" : value)));
            box.appendChild(makeElement("div","mh-insight-stat-label",label));
            summary.appendChild(box);
        }

        stat(pulse.total || 0,"Bài mới nhất");
        stat(pulse.uniqueStudents || 0,"Học viên hoạt động");
        stat(pulse.gradedCount || 0,"Bài đã chấm");
        panelBody.appendChild(section);
        section.appendChild(summary);

        const events=normalizeClassPulseEvents(pulse);
        if(!events.length){
            section.appendChild(makeElement("div","mh-empty","Chưa có đủ dữ liệu để tạo thông báo Nhịp lớp học."));
            return;
        }

        events.forEach(function(event){
            const card=makeElement("div","mh-advice-card");
            const title=makeElement("div","mh-advice-title",(event.icon || ICONS.activity)+" "+event.title);
            const text=makeElement("div","mh-advice-text",event.text);
            card.appendChild(title);
            card.appendChild(text);
            section.appendChild(card);
        });
    }

    /* =====================================================
       PERSONAL INSIGHT PANEL
    ===================================================== */

    function appendPersonalInsight(){

        if(!isPersonalContext()){
            return;
        }


        const data=
            InsightStore
            .getForCurrentStudent();


        const session=
            OCDStudentSession
            .getState();


        const section=
            makeElement(
                "div",
                "mh-insight-wrap"
            );


        section.appendChild(
            makeElement(
                "div",
                "mh-insight-head",
                ICONS.brain+
                " LỜI KHUYÊN DÀNH CHO BẠN"
            )
        );


        if(
            !session.verified
        ){

            section.appendChild(
                makeElement(
                    "div",
                    "mh-empty",
                    "Mã học viên đang chờ xác minh. Hãy tra cứu hồ sơ thành công để Minh Hồng có thể đưa ra đề xuất cá nhân."
                )
            );


            panelBody.appendChild(
                section
            );


            return;
        }


        if(!data){

            section.appendChild(
                makeElement(
                    "div",
                    "mh-empty",
                    "Chưa có dữ liệu phân tích cá nhân cho học viên này. Khi một trang học tập gửi dữ liệu sang, Minh Hồng sẽ hiển thị lời khuyên tại đây."
                )
            );


            panelBody.appendChild(
                section
            );


            return;
        }


        const summary=
            makeElement(
                "div",
                "mh-insight-summary"
            );


        function stat(
            value,
            label
        ){

            const box=
                makeElement(
                    "div",
                    "mh-insight-stat"
                );


            box.appendChild(
                makeElement(
                    "span",
                    "mh-insight-stat-value",
                    value || "-"
                )
            );


            box.appendChild(
                makeElement(
                    "span",
                    "mh-insight-stat-label",
                    label
                )
            );


            return box;

        }


        summary.appendChild(
            stat(
                data.latestDisplay,
                "Bài gần nhất"
            )
        );


        summary.appendChild(
            stat(
                data.averageDisplay,
                "Trung bình"
            )
        );


        summary.appendChild(
            stat(
                data.rankDisplay,
                "Rank"
            )
        );


        section.appendChild(
            summary
        );


        if(
            data.trend &&
            data.trend.text
        ){

            let icon=
                ICONS.stable;


            if(
                data.trend.type==="up"
            ){

                icon=ICONS.up;

            }

            else if(
                data.trend.type==="down"
            ){

                icon=ICONS.down;

            }


            const trend=
                makeElement(
                    "div",
                    "mh-insight-trend"
                );


            trend.appendChild(
                makeElement(
                    "span",
                    "mh-insight-trend-icon",
                    icon
                )
            );


            trend.appendChild(
                makeElement(
                    "span",
                    "",
                    data.trend.text
                )
            );


            section.appendChild(
                trend
            );

        }


        if(
            Array.isArray(
                data.advices
            )
            &&
            data.advices.length
        ){

            const list=
                makeElement(
                    "div",
                    "mh-insight-advice-list"
                );


            data.advices
            .slice(
                0,
                5
            )
            .forEach(
                function(advice){

                    const box=
                        makeElement(
                            "div",
                            "mh-insight-advice "+
                            (
                                advice.type ||
                                ""
                            )
                        );


                    box.appendChild(
                        makeElement(
                            "span",
                            "mh-insight-advice-icon",
                            advice.icon ||
                            ICONS.tip
                        )
                    );


                    box.appendChild(
                        makeElement(
                            "span",
                            "",
                            advice.text ||
                            ""
                        )
                    );


                    list.appendChild(
                        box
                    );

                }
            );


            section.appendChild(
                list
            );

        }


        if(data.goal){

            const goal=
                makeElement(
                    "div",
                    "mh-insight-goal"
                );


            goal.appendChild(
                makeElement(
                    "div",
                    "mh-insight-goal-title",
                    ICONS.target+
                    " "+
                    (
                        data.goal.name ||
                        "Mục tiêu tiếp theo"
                    )
                )
            );


            goal.appendChild(
                makeElement(
                    "div",
                    "mh-insight-goal-text",
                    data.goal.detail ||
                    ""
                )
            );


            section.appendChild(
                goal
            );

        }


        if(
            data.priorityGift &&
            data.priorityGift.name
        ){

            const gift=
                data.priorityGift;


            const card=
                makeElement(
                    "div",
                    "mh-insight-gift"
                );


            const imageBox=
                makeElement(
                    "div",
                    "mh-insight-gift-image"
                );


            if(gift.image){

                const image=
                    document.createElement(
                        "img"
                    );


                image.src=
                    gift.image;


                image.alt=
                    gift.name;


                image.loading=
                    "lazy";


                image.decoding=
                    "async";


                image.onerror=
                    function(){

                        imageBox.textContent=
                            ICONS.gift;

                    };


                imageBox.appendChild(
                    image
                );

            }else{

                imageBox.textContent=
                    ICONS.gift;

            }


            const content=
                makeElement(
                    "div"
                );


            content.appendChild(
                makeElement(
                    "div",
                    "mh-insight-gift-name",
                    ICONS.gift+
                    " "+
                    gift.name
                )
            );


            if(gift.description){

                content.appendChild(
                    makeElement(
                        "div",
                        "mh-insight-gift-desc",
                        gift.description
                    )
                );

            }


            if(gift.statusText){

                content.appendChild(
                    makeElement(
                        "div",
                        "mh-insight-gift-status"+
                        (
                            gift.affordable
                            ?
                            " ready"
                            :
                            ""
                        ),
                        gift.statusText
                    )
                );

            }


            card.appendChild(
                imageBox
            );


            card.appendChild(
                content
            );


            section.appendChild(
                card
            );

        }


        if(data.note){

            section.appendChild(
                makeElement(
                    "div",
                    "mh-insight-note",
                    data.note
                )
            );

        }


        panelBody.appendChild(
            section
        );

    }


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
                "GHI NHỚ MÃ HỌC VIÊN"
            );


        submit.type=
            "button";


        function saveCode(){

            const code=
                normalizeCode(
                    codeInput.value
                );


            if(!code){

                codeInput.focus();

                return;
            }


            OCDStudentSession
            .rememberStudent(
                code,
                "minh-hong"
            );


            guestView=
                "home";


            refreshContext();

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
                "Mã được ghi nhớ trên thiết bị. Mã chỉ chuyển sang trạng thái đã xác minh sau khi một trang học viên kiểm tra thành công."
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

        const back=
            makeElement(
                "button",
                "mh-action-back",
                ICONS.back+
                " Quay lại"
            );


        back.type=
            "button";


        back.addEventListener(
            "click",
            function(){

                guestView=
                    "home";


                renderPanel();

            }
        );


        panelBody.appendChild(
            back
        );


        panelBody.appendChild(
            makeElement(
                "div",
                "mh-status",
                ICONS.book+
                " DÀNH CHO NGƯỜI MỚI"
            )
        );


        panelBody.appendChild(
            makeElement(
                "div",
                "mh-intro-title",
                "Làm quen với website"
            )
        );


        panelBody.appendChild(
            makeElement(
                "div",
                "mh-intro-text",
                "Nếu đây là lần đầu bạn đến với website, Minh Hồng sẽ giúp bạn hiểu cách hệ thống hoạt động trước khi bắt đầu học."
            )
        );


        const guideSection=
            makeElement(
                "div",
                "mh-section"
            );


        guideSection.appendChild(
            makeElement(
                "div",
                "mh-section-title",
                ICONS.book+
                " HƯỚNG DẪN NHANH"
            )
        );


        const guides=[

            {
                title:
                    "1. Khám phá nội dung",

                text:
                    "Bạn có thể xem những nội dung công khai trên website để tìm hiểu cách học và các chức năng đang có."
            },

            {
                title:
                    "2. Khi trở thành học viên",

                text:
                    "Sau khi có mã học viên, bạn chỉ cần nhập mã vào Minh Hồng. Các trang đã được kết nối có thể sử dụng lại mã này."
            },

            {
                title:
                    "3. Theo dõi cộng đồng",

                text:
                    "Tại Trang chủ, Minh Hồng sẽ thông báo những hoạt động nổi bật của cộng đồng như nộp bài, nhận xét và phần thưởng."
            },

            {
                title:
                    "4. Hỗ trợ cá nhân",

                text:
                    "Khi mã đã được xác minh, tại các trang học tập Minh Hồng sẽ ưu tiên những lời khuyên và mục tiêu liên quan trực tiếp đến bạn."
            }

        ];


        guides.forEach(
            function(guide){

                const card=
                    makeElement(
                        "div",
                        "mh-guide-card"
                    );


                card.appendChild(
                    makeElement(
                        "div",
                        "mh-guide-title",
                        guide.title
                    )
                );


                card.appendChild(
                    makeElement(
                        "div",
                        "mh-guide-text",
                        guide.text
                    )
                );


                guideSection.appendChild(
                    card
                );

            }
        );


        panelBody.appendChild(
            guideSection
        );


        const actions=
            makeElement(
                "div",
                "mh-section"
            );


        const actionWrap=
            makeElement(
                "div",
                "mh-actions"
            );


        actionWrap.appendChild(
            createActionButton(
                "Tôi đã có mã học viên",
                true,
                function(){

                    guestView=
                        "home";


                    renderPanel();


                    setTimeout(
                        function(){

                            const input=
                                panelBody.querySelector(
                                    ".mh-code-input"
                                );


                            const box=
                                input
                                ?
                                input.closest(
                                    ".mh-inline-box"
                                )
                                :
                                null;


                            if(box){

                                box.style.display=
                                    "block";

                            }


                            if(input){

                                input.focus();

                            }

                        },
                        0
                    );

                }
            )
        );


        actions.appendChild(
            actionWrap
        );


        panelBody.appendChild(
            actions
        );

    }


    /* =====================================================
       STUDENT PANEL
    ===================================================== */

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
                    ? "Mã học viên đã được xác minh. Tại Trang chủ, Minh Hồng sẽ ưu tiên cập nhật những hoạt động chung của cộng đồng."
                    : isPersonalContext()
                    ? "Mã học viên đã được xác minh. Ở trang Tra cứu, Minh Hồng ưu tiên những đề xuất liên quan trực tiếp đến bạn."
                    : isClassPulseContext()
                    ? "Mã học viên đã được xác minh. Ở trang Tác phẩm học viên, Minh Hồng tổng hợp Nhịp lớp từ 20 bài nộp mới nhất."
                    : "Mã học viên đã được xác minh. Trang này không phát thông báo tự động."
                )
                :
                "Mã hiện đang được ghi nhớ nhưng chưa được một trang học viên xác minh."
            )
        );


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
                "GHI NHỚ MÃ MỚI"
            );


        submit.type=
            "button";


        function saveNewCode(){

            const code=
                normalizeCode(
                    input.value
                );


            if(!code){

                input.focus();

                return;
            }


            OCDStudentSession
            .rememberStudent(
                code,
                "minh-hong-change-code"
            );


            refreshContext();

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



