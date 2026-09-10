
(function(){

"use strict";

/* =========================================================
   HỒ SƠ / CHỢ PHIÊN v4.9L-R1
   MARKET RETRY / SELF-RECOVERY

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
   - Reward Core v3.6.0+

   SỬA:
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
        typeof RS.processTransactions !== "function"
    ){

        return false;
    }

    started=true;

    console.log(
        "[Profile Market v4.9L-R1] Reward Core:",
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
                            "Không tìm thấy Reward System Core v3.6.0 hoặc mới hơn.";
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
        1,

    maxProfitDealsPerDay:
        3,

    specialMerchants:[
        "gian thuong",
        "con no",
        "con nghien",
        "con bac"
    ],

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
                ownedItems
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
            ownedItems
        )
        :
        "",

        typeof RS.getProfileAvatarFrame ===
        "function"
        ?
        RS.getProfileAvatarFrame(
            ownedItems
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

    profile.style.display=
        "block";
}


/* =========================================================
   PANELS
========================================================= */

function closeProfilePanels(){

    state.activeProfilePanel=
        null;

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

    setMultitaskEffect(
        false
    );

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

                RS.fetchCSV(
                    RS.CONFIG.studentCsv
                ),

                RS.loadSharedRewardData(
                    true
                ),

                loadDeletedSubmissionIds()
            ]);

        const studentRows=
            RS.parseCSV(
                results[0]
            );

        const shared=
            results[1];

        const deletedSubmissionIds=
            results[2];

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

        let studentName="";
        let studentGroup="";
        let studentCourse="";

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

        if(
            matchedStudentRows <= 0
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

        const account=
            calculateStudentAccount(
                reward,
                shared,
                code
            );

        const scoreData=
            calculateStudentScores(
                submissions
            );

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
                account.gems
        };

        renderProfile(
            state.student,
            state.ownedItems,
            reward
        );

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
            "[Profile v4.9L-R1]",
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

    const mobileRarityIcon=
        createMobileRarityIcon(
            gift,
            "market"
        );

    if(mobileRarityIcon){

        nameLine.appendChild(
            mobileRarityIcon
        );
    }

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

function rebuildStudentFromShared(shared){

    if(!state.student){
        return null;
    }

    const currentPanel=
        state.activeProfilePanel;

    const reward=
        state.isAdmin
        ?
        createAdminReward()
        :
        state.reward;

    if(!reward){
        return null;
    }

    const account=
        calculateStudentAccount(
            reward,
            shared,
            state.student.code
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

    state.student.gems=
        account.gems;

    if(shared.gifts){

        state.gifts=
            shared.gifts;

        rebuildGiftMap();
    }

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

    if(
        state.marketLoaded
    ){

        renderMarket();
    }

    return account;
}


/* =========================================================
   VERIFY EXCHANGE
========================================================= */

async function verifyDirectExchange(
    selectedGift
){

    for(
        let attempt=0;
        attempt<CONFIG.verifyTries;
        attempt++
    ){

        await sleep(
            CONFIG.verifyInterval
        );

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

                rebuildStudentFromShared(
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

        submitGoogleFormDirect(
            gift
        );

        const result=
            await verifyDirectExchange(
                gift
            );

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
   EVENTS
========================================================= */

function bindEvents(){

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

