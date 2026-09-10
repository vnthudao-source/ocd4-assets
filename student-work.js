
(()=>{
"use strict";

/* =========================================================
   CONFIG
========================================================= */

const ADMIN_MODE = true;

const ADMIN_ACCESS_CODE = "835847";

const ADMIN_GIVER = "GVCN";

/*
   PHÂN TRANG MỚI:
   - MOBILE <= 600px : 10 bài / trang
   - WEB > 600px     : 24 bài / trang
*/
const WEB_PAGE_SIZE = 24;
const MOBILE_PAGE_SIZE = 10;

const SEARCH_DEBOUNCE_MS = 300;

const PRIORITY_DAYS = 7;

const REFRESH_MS =
5 * 60 * 1000;


/* =========================================================
   V18.4 - RELIABLE FAST GRADING
========================================================= */

const GRADE_SEND_GAP_MS = 700;

const GRADE_SYNC_FIRST_CHECK = 8000;

const GRADE_SYNC_INTERVAL = 15000;

const GRADE_SYNC_WARNING_AFTER =
2 * 60 * 1000;

const GRADE_SYNC_ACTIVE_WINDOW =
5 * 60 * 1000;

const GRADE_IFRAME_LIFETIME =
30000;


/* =========================================================
   DELETE
========================================================= */

const DELETE_VERIFY_FIRST_DELAY =
2500;

const DELETE_VERIFY_INTERVAL =
2500;

const DELETE_VERIFY_TRIES =
12;

const DELETE_IFRAME_LIFETIME =
30000;


/* =========================================================
   GIFT VERIFY
========================================================= */

const GIFT_VERIFY_TRIES = 7;

const GIFT_VERIFY_INTERVAL = 1400;


/* =========================================================
   SAFE CHARACTERS
========================================================= */

const CHAR = {

    DOT:String.fromCodePoint(0x00B7),

    CHECK:String.fromCodePoint(0x2713),

    CROSS:String.fromCodePoint(0x2715),

    DASH:String.fromCodePoint(0x2013),

    EM_DASH:String.fromCodePoint(0x2014),

    LEFT:String.fromCodePoint(0x2039),

    RIGHT:String.fromCodePoint(0x203A),

    ELLIPSIS:String.fromCodePoint(0x2026),

    MULTIPLY:String.fromCodePoint(0x00D7)
};


const UI = {

    TOOL:String.fromCodePoint(0x1F6E0),

    WARNING:String.fromCodePoint(0x26A0),

    PIN:String.fromCodePoint(0x1F4CC),

    PEOPLE:String.fromCodePoint(0x1F465),

    GRADUATION:String.fromCodePoint(0x1F393),

    GIFT:String.fromCodePoint(0x1F381),

    BOOKS:String.fromCodePoint(0x1F4DA),

    LOCK:String.fromCodePoint(0x1F510),

    IMAGE:String.fromCodePoint(0x1F5BC),

    POPCORN:String.fromCodePoint(0x1F37F),

    RULER:String.fromCodePoint(0x1F4CF),

    BRUSH:String.fromCodePoint(0x1F58C),

    SCROLL:String.fromCodePoint(0x1F4DC),

    PAW:String.fromCodePoint(0x1F43E),

    BACKPACK:String.fromCodePoint(0x1F392),

    FRAME:String.fromCodePoint(0x1F5BC),

    FOX:String.fromCodePoint(0x1F98A),

    FIRE:String.fromCodePoint(0x1F525),

    DEER:String.fromCodePoint(0x1F98C),

    UNICORN:String.fromCodePoint(0x1F984),

    CAT:String.fromCodePoint(0x1F431),

    OWL:String.fromCodePoint(0x1F989),

    TURTLE:String.fromCodePoint(0x1F422),

    EAGLE:String.fromCodePoint(0x1F985),

    DRAGON:String.fromCodePoint(0x1F409),

    SEARCH:String.fromCodePoint(0x1F50E),

    SYNC:String.fromCodePoint(0x1F504),

    TRASH:String.fromCodePoint(0x1F5D1)
};


/* =========================================================
   GOOGLE SHEETS
========================================================= */

const NOP_BAI_ID =
"1GJoTRsbq0kZfZrDdh0uCC667PwS3Bgkje2fHQnwnCKs";

const DOI_QUA_ID =
"1-IkcpEkKQtIavl5DIf6Sbwx3p0aAfnSS4HjT6dn1u_E";


const URLS = {

    works:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRP5cc8duj1XrCXMrymo6Cj7aqIkWfX6bHxGeW-lXcSewfQXhM8fZ5rzbNIQ9mBeVuB8yYr_o1aBoYA/pub?gid=1023688821&single=true&output=csv",

    worksFallback:
    "https://docs.google.com/spreadsheets/d/" +
    NOP_BAI_ID +
    "/export?format=csv&gid=1837470623",

    deleteLog:
    "https://docs.google.com/spreadsheets/d/" +
    NOP_BAI_ID +
    "/export?format=csv&gid=521976322",

    giftCatalog:
    "https://docs.google.com/spreadsheets/d/" +
    DOI_QUA_ID +
    "/export?format=csv&gid=0",

    exchanges:
    "https://docs.google.com/spreadsheets/d/" +
    DOI_QUA_ID +
    "/export?format=csv&gid=267584332",

    teacherGifts:
    "https://docs.google.com/spreadsheets/d/" +
    DOI_QUA_ID +
    "/export?format=csv&gid=1993190794"
};


/* =========================================================
   FORM CHẤM BÀI
========================================================= */

const GRADE_FORM = {

    url:
    "https://docs.google.com/forms/d/e/1FAIpQLSdd-zhAiZtu-Iv32PpJnaxLSDAwXkBno1-pkL-XPJkjiGttFw/formResponse",

    entries:{

        submissionId:"entry.651167670",
        studentName:"entry.1216519509",
        studentCode:"entry.1355978883",
        workUrl:"entry.1938510941",
        score:"entry.1045838415",
        comment:"entry.1918238409"
    }
};


/* =========================================================
   FORM TẶNG QUÀ
========================================================= */

const GIFT_FORM = {

    url:
    "https://docs.google.com/forms/d/e/1FAIpQLSc48-Y-3nf4GtAKdE-Gq4uOMgOJSBUzvFruoSeQx8qmAok06Q/formResponse",

    entries:{

        scope:"entry.1737038806",
        studentCode:"entry.583300350",
        group:"entry.1930196666",
        course:"entry.1043199349",
        rewardType:"entry.1978772868",
        giftName:"entry.1254676473",
        gemstoneType:"entry.1706258741",
        quantity:"entry.606656855",
        reason:"entry.360182186",
        giver:"entry.1383532227",
        status:"entry.1295235585"
    }
};


/* =========================================================
   FORM XOÁ BÀI
========================================================= */

const DELETE_FORM = {

    url:
    "https://docs.google.com/forms/d/e/1FAIpQLSe5IwwkOXjb3HSjK7n93ADsSOuE3S1IRCQtCQ0-0mCQRrv5NQ/formResponse",

    entries:{

        submissionId:"entry.441258267",
        studentCode:"entry.2026726963",
        studentName:"entry.1937657414",
        workUrl:"entry.1046985373",
        submittedAt:"entry.1369592128",
        actor:"entry.1199549067",
        reason:"entry.1666030213",
        action:"entry.785772148"
    }
};


/* =========================================================
   LINH THÚ
========================================================= */

const BEAST_KEYS = {

    WIND_DRAGON:
    "linh thu thanh phong long",

    TURTLE:
    "linh thu huyen giap quy"
};


const GIFT_SUBMISSION_MARKER =
"BAI_ID";


/* =========================================================
   STATE
========================================================= */

let works = [];
let adminSortedWorks = [];
let giftCatalog = [];
let exchangeData = [];
let teacherGiftData = [];
let deleteLogData = [];
let beastCatalog = [];

let ownershipMap = new Map();
let giftIconMap = new Map();
let latestSubmissionMap = new Map();
let teacherGiftStudentIndex = new Map();
let teacherGiftWorkCache = new Map();

let giftOptionsCache = "";

let deletedSubmissionIds = new Set();

let currentSearchResults = [];
let currentStudentResults = [];

let currentPage = 1;

let currentView = "latest";

let selectedStudentName = "";
let adminSearchQuery = "";
let sourceName = "";

let started = false;
let toastTimer = null;
let searchTimer = null;
let priorityCountCache = 0;


/* =========================================================
   DELETE STATE
========================================================= */

const pendingDeletes = new Map();

let deleteIframeCounter = 0;


/* =========================================================
   PENDING GRADES
========================================================= */

const pendingGrades = new Map();


/* =========================================================
   GRADE SEND QUEUE
========================================================= */

const gradeSendQueue = [];

let gradeSenderBusy = false;

let gradeIframeCounter = 0;


/* =========================================================
   CENTRAL SYNC
========================================================= */

let gradeSyncTimer = null;

let gradeSyncRunning = false;


/* =========================================================
   DOM
========================================================= */

const $ =
selector =>
document.querySelector(selector);


/* =========================================================
   RESPONSIVE PAGE SIZE
========================================================= */

function getResponsivePageSize(){

    return window.matchMedia(
        "(max-width:600px)"
    ).matches
    ?
    MOBILE_PAGE_SIZE
    :
    WEB_PAGE_SIZE;
}


/* =========================================================
   NORMALIZE
========================================================= */

function decodeNumericEntities(value){

    return String(
        value ?? ""
    )

    .replace(
        /&#x([0-9a-f]+);?/gi,
        function(match,hex){

            const code =
            parseInt(hex,16);

            if(!Number.isFinite(code)){
                return match;
            }

            try{
                return String.fromCodePoint(code);
            }catch(error){
                return match;
            }
        }
    )

    .replace(
        /&#(\d+);?/g,
        function(match,decimal){

            const code =
            parseInt(decimal,10);

            if(!Number.isFinite(code)){
                return match;
            }

            try{
                return String.fromCodePoint(code);
            }catch(error){
                return match;
            }
        }
    )

    .replace(
        /&nbsp;/gi,
        " "
    );
}


function clean(value){

    return decodeNumericEntities(
        value
    ).trim();
}


function normalize(value){

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


function setText(target,value){

    if(!target){
        return;
    }

    target.textContent =
    decodeNumericEntities(
        value
    );
}


function escapeHTML(value){

    return String(
        value ?? ""
    )
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");
}


function displayValue(value){

    return(
        clean(value)
        ||
        CHAR.EM_DASH
    );
}


function sleep(ms){

    return new Promise(
        resolve =>
        setTimeout(resolve,ms)
    );
}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    message,
    type,
    duration
){

    const box =
    $("#tp18-toast");

    if(!box){
        return;
    }

    if(toastTimer){

        clearTimeout(
            toastTimer
        );

        toastTimer = null;
    }

    box.className =
    "tp18-toast on " +
    (
        type ||
        "success"
    );

    setText(
        box,
        message
    );

    if(duration === 0){
        return;
    }

    toastTimer =
    setTimeout(
        function(){

            box.classList.remove(
                "on"
            );

        },
        Number(
            duration ||
            2600
        )
    );
}


/* =========================================================
   CSV
========================================================= */

function parseCSV(text){

    const rows = [];

    let row = [];
    let value = "";
    let quote = false;

    text =
    String(text || "")
    .replace(/^\uFEFF/,"");

    for(
        let i=0;
        i<text.length;
        i++
    ){

        const char = text[i];
        const next = text[i+1];

        if(
            char === '"' &&
            quote &&
            next === '"'
        ){

            value += '"';
            i++;
            continue;
        }

        if(char === '"'){

            quote = !quote;
            continue;
        }

        if(
            char === "," &&
            !quote
        ){

            row.push(value);
            value = "";
            continue;
        }

        if(
            (
                char === "\n" ||
                char === "\r"
            )
            &&
            !quote
        ){

            if(
                char === "\r" &&
                next === "\n"
            ){
                i++;
            }

            row.push(value);
            value = "";

            if(
                row.some(
                    cell =>
                    clean(cell)
                )
            ){
                rows.push(row);
            }

            row = [];

            continue;
        }

        value += char;
    }

    if(
        value ||
        row.length
    ){

        row.push(value);

        if(
            row.some(
                cell =>
                clean(cell)
            )
        ){
            rows.push(row);
        }
    }

    return rows;
}


function csvObjects(text){

    const rows =
    parseCSV(text);

    if(
        rows.length <
        2
    ){
        return [];
    }

    const headers =
    rows[0]
    .map(normalize);

    return rows
    .slice(1)
    .filter(
        row =>
        row.some(
            cell =>
            clean(cell)
        )
    )
    .map(
        function(row){

            const object = {};

            headers.forEach(
                function(header,index){

                    if(header){

                        object[header] =
                        row[index] ?? "";
                    }
                }
            );

            return object;
        }
    );
}


function column(
    object,
    possibleNames
){

    if(!object){
        return "";
    }

    for(
        const name
        of possibleNames
    ){

        const key =
        normalize(name);

        if(
            Object.prototype
            .hasOwnProperty.call(
                object,
                key
            )
        ){
            return object[key];
        }
    }

    return "";
}


/* =========================================================
   FETCH
========================================================= */

async function fetchCSV(url){

    const separator =
    url.includes("?")
    ?
    "&"
    :
    "?";

    const response =
    await fetch(

        url +
        separator +
        "_=" +
        Date.now(),

        {
            cache:"no-store"
        }
    );

    if(!response.ok){

        throw new Error(
            "HTTP " +
            response.status
        );
    }

    return response.text();
}


async function safeFetchCSV(url){

    try{

        return await fetchCSV(
            url
        );

    }catch(error){

        console.warn(
            "Nguồn phụ không tải được:",
            error
        );

        return "";
    }
}


/* =========================================================
   WORK SOURCE
========================================================= */

function isValidWorkData(data){

    if(
        !Array.isArray(data) ||
        !data.length
    ){
        return false;
    }

    const refError =
    data
    .slice(0,15)
    .some(
        row =>
        Object.values(row)
        .some(
            value =>
            String(value)
            .includes("#REF!")
        )
    );

    if(refError){
        return false;
    }

    return data.some(
        function(item){

            return Boolean(

                clean(
                    column(
                        item,
                        ["Mã học viên"]
                    )
                )

                &&

                clean(
                    column(
                        item,
                        ["Tải bài tập lên"]
                    )
                )
            );
        }
    );
}


async function loadWorkData(){

    try{

        const primary =
        csvObjects(
            await fetchCSV(
                URLS.works
            )
        );

        if(
            isValidWorkData(
                primary
            )
        ){

            return{
                data:primary,
                source:"TacPhamWeb"
            };
        }

    }catch(error){

        console.warn(
            "TacPhamWeb lỗi:",
            error
        );
    }

    const fallback =
    csvObjects(
        await fetchCSV(
            URLS.worksFallback
        )
    );

    if(
        isValidWorkData(
            fallback
        )
    ){

        return{
            data:fallback,
            source:"Form Responses 1"
        };
    }

    throw new Error(
        "Không tìm thấy nguồn dữ liệu bài tập hợp lệ."
    );
}


/* =========================================================
   DRIVE IMAGE
========================================================= */

function driveId(url){

    const value =
    String(url || "");

    const patterns = [

        /\/file\/d\/([^/?&#]+)/i,

        /\/d\/([^/?&#]+)/i,

        /[?&]id=([^&#]+)/i
    ];

    for(
        const pattern
        of patterns
    ){

        const match =
        value.match(pattern);

        if(match){
            return match[1];
        }
    }

    return "";
}


function imageCandidates(url){

    const source =
    clean(url);

    const id =
    driveId(source);

    if(!id){

        return source
        ?
        [source]
        :
        [];
    }

    return[

        "https://drive.google.com/thumbnail?id=" +
        encodeURIComponent(id) +
        "&sz=w600",

        "https://drive.google.com/uc?export=view&id=" +
        encodeURIComponent(id),

        "https://lh3.googleusercontent.com/d/" +
        encodeURIComponent(id) +
        "=w600"
    ];
}


function primaryImage(url){

    return(
        imageCandidates(url)[0]
        ||
        ""
    );
}


function applyImageFallback(
    image,
    source,
    onBroken
){

    const candidates =
    imageCandidates(source);

    let index = 0;

    image.addEventListener(
        "error",
        function(){

            index++;

            if(
                index <
                candidates.length
            ){

                image.src =
                candidates[index];

                return;
            }

            if(
                typeof onBroken ===
                "function"
            ){

                onBroken(image);
            }
        }
    );
}


function originalUrl(value){

    return(
        String(value || "")
        .match(
            /https?:\/\/[^\s,]+/i
        )
        ||
        []
    )[0]
    ||
    "#";
}


/* =========================================================
   TIME
========================================================= */

function timestampValue(value){

    const match =
    String(value || "")
    .match(
        /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})(?:[\s,]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/
    );

    if(!match){

        return(
            Date.parse(value)
            ||
            0
        );
    }

    return new Date(

        +match[3],

        +match[2]-1,

        +match[1],

        +match[4] || 0,

        +match[5] || 0,

        +match[6] || 0

    ).getTime();
}


function compactTimestamp(value){

    const match =
    String(value || "")
    .match(
        /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})[\s,]+(\d{1,2}):(\d{2})(?::(\d{2}))?/
    );

    if(!match){
        return "";
    }

    const pad =
    number =>
    String(number)
    .padStart(2,"0");

    return(
        match[3]
        +
        pad(match[2])
        +
        pad(match[1])
        +
        pad(match[4])
        +
        pad(match[5])
        +
        pad(match[6] || 0)
    );
}


/* =========================================================
   GOOGLE FORM DATE
========================================================= */

function toGoogleFormDate(value){

    const text =
    clean(value);

    if(!text){
        return "";
    }

    let match =
    text.match(
        /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/
    );

    if(match){

        const day =
        String(match[1])
        .padStart(2,"0");

        const month =
        String(match[2])
        .padStart(2,"0");

        const year =
        match[3];

        return(
            year +
            "-" +
            month +
            "-" +
            day
        );
    }

    match =
    text.match(
        /^(\d{4})-(\d{1,2})-(\d{1,2})/
    );

    if(match){

        return(
            match[1] +
            "-" +
            String(match[2]).padStart(2,"0") +
            "-" +
            String(match[3]).padStart(2,"0")
        );
    }

    return "";
}


/* =========================================================
   SUBMISSION ID
========================================================= */

function rawSubmissionId(item){

    const existing =
    clean(
        column(
            item,
            ["Mã bài nộp"]
        )
    );

    if(existing){
        return existing;
    }

    const timestamp =
    column(
        item,
        ["Dấu thời gian"]
    );

    const code =
    clean(
        column(
            item,
            ["Mã học viên"]
        )
    );

    const work =
    column(
        item,
        ["Tải bài tập lên"]
    );

    return(
        compactTimestamp(timestamp)
        +
        "|"
        +
        code
        +
        "|"
        +
        (
            driveId(work)
            ||
            clean(work)
        )
    );
}


/* =========================================================
   FIND SERVER WORK
========================================================= */

function findWorkBySubmissionId(
    data,
    submissionId
){

    return(
        data.find(
            item =>
            rawSubmissionId(item)
            ===
            submissionId
        )
        ||
        null
    );
}


/* =========================================================
   GRADE MATCH
========================================================= */

function workGradeMatches(
    item,
    expected
){

    if(!item){
        return false;
    }

    const score =
    clean(
        column(
            item,
            [
                "Điểm số",
                "Điểm",
                "Điểm giáo viên"
            ]
        )
    )
    .replace(
        ",",
        "."
    );

    const comment =
    clean(
        column(
            item,
            [
                "Nhận xét",
                "Nhận xét GVCN"
            ]
        )
    );

    return(

        score ===
        clean(expected.score)
        .replace(",", ".")

        &&

        comment ===
        clean(expected.comment)
    );
}


/* =========================================================
   RECONCILE PENDING GRADES
========================================================= */

function reconcilePendingGradesWithRawData(
    rawData,
    showSyncedState
){

    if(
        !pendingGrades.size ||
        !Array.isArray(rawData) ||
        !rawData.length
    ){
        return 0;
    }

    let syncedCount = 0;

    const rawMap =
    new Map();

    rawData.forEach(
        function(item){

            const id =
            rawSubmissionId(item);

            if(id){

                rawMap.set(
                    id,
                    item
                );
            }
        }
    );

    pendingGrades.forEach(
        function(
            pending,
            submissionId
        ){

            if(
                pending.state ===
                "queued" ||
                pending.state ===
                "sending"
            ){
                return;
            }

            if(
                pending.state ===
                "send-error"
            ){
                return;
            }

            const rawWork =
            rawMap.get(
                submissionId
            );

            if(!rawWork){
                return;
            }

            if(
                workGradeMatches(
                    rawWork,
                    pending
                )
            ){

                pendingGrades.delete(
                    submissionId
                );

                syncedCount++;

                if(showSyncedState){

                    setCardSyncState(
                        submissionId,
                        "synced"
                    );
                }
            }
        }
    );

    return syncedCount;
}


/* =========================================================
   OPTIMISTIC GRADE OVERLAY
========================================================= */

function applyPendingGradesToRawWorks(
    data
){

    if(
        !pendingGrades.size
    ){
        return data;
    }

    data.forEach(
        function(item){

            const id =
            rawSubmissionId(
                item
            );

            const pending =
            pendingGrades.get(
                id
            );

            if(!pending){
                return;
            }

            if(
                pending.state ===
                "send-error"
            ){
                return;
            }

            item[
                normalize("Điểm số")
            ] =
            pending.score;

            item[
                normalize("Nhận xét")
            ] =
            pending.comment;
        }
    );

    return data;
}


/* =========================================================
   DELETE LOG
========================================================= */

function buildDeletedSubmissionIds(
    data
){

    const states =
    new Map();

    (data || [])
    .forEach(
        function(row){

            const id =
            clean(
                column(
                    row,
                    ["Mã bài nộp"]
                )
            );

            if(!id){
                return;
            }

            const action =
            normalize(
                column(
                    row,
                    ["Hành động"]
                )
            );

            if(
                action === "xoa"
                ||
                action.includes("xoa")
                ||
                action === "delete"
            ){

                states.set(
                    id,
                    true
                );

                return;
            }

            if(
                action.includes(
                    "khoi phuc"
                )
                ||
                action ===
                "restore"
            ){

                states.set(
                    id,
                    false
                );
            }
        }
    );

    const next =
    new Set();

    states.forEach(
        function(
            isDeleted,
            id
        ){

            if(isDeleted){

                next.add(
                    id
                );
            }
        }
    );

    deletedSubmissionIds =
    next;
}


function filterDeletedWorks(
    data
){

    if(
        !deletedSubmissionIds.size
    ){
        return data;
    }

    return data.filter(
        function(item){

            return(
                !deletedSubmissionIds
                .has(
                    rawSubmissionId(item)
                )
            );
        }
    );
}


function deleteLogHasSubmission(
    data,
    submissionId
){

    let deleted =
    null;

    (data || [])
    .forEach(
        function(row){

            const id =
            clean(
                column(
                    row,
                    ["Mã bài nộp"]
                )
            );

            if(
                id !==
                submissionId
            ){
                return;
            }

            const action =
            normalize(
                column(
                    row,
                    ["Hành động"]
                )
            );

            if(
                action.includes(
                    "khoi phuc"
                )
                ||
                action ===
                "restore"
            ){

                deleted =
                false;

                return;
            }

            if(
                action ===
                "xoa"
                ||
                action.includes(
                    "xoa"
                )
                ||
                action ===
                "delete"
            ){

                deleted =
                true;
            }
        }
    );

    return deleted === true;
}


/* =========================================================
   WORK CACHE
========================================================= */

function prepareBaseWorkCache(){

    works.forEach(
        function(item){

            item.__name =
            clean(
                column(
                    item,
                    [
                        "Họ và tên",
                        "Họ tên"
                    ]
                )
            );

            item.__nameNorm =
            normalize(
                item.__name
            );

            item.__code =
            clean(
                column(
                    item,
                    ["Mã học viên"]
                )
            );

            item.__codeNorm =
            normalize(
                item.__code
            );

            item.__group =
            clean(
                column(
                    item,
                    ["Tổ"]
                )
            );

            item.__course =
            clean(
                column(
                    item,
                    [
                        "Khóa",
                        "Khoa"
                    ]
                )
            );

            item.__timestampText =
            clean(
                column(
                    item,
                    ["Dấu thời gian"]
                )
            );

            item.__timestamp =
            timestampValue(
                item.__timestampText
            );

            item.__score =
            clean(
                column(
                    item,
                    [
                        "Điểm số",
                        "Điểm",
                        "Điểm giáo viên"
                    ]
                )
            );

            item.__comment =
            clean(
                column(
                    item,
                    [
                        "Nhận xét",
                        "Nhận xét GVCN"
                    ]
                )
            );

            item.__rawWork =
            column(
                item,
                ["Tải bài tập lên"]
            );

            item.__workUrl =
            originalUrl(
                item.__rawWork
            );

            item.__image =
            primaryImage(
                item.__rawWork
            );

            item.__submissionId =
            rawSubmissionId(item);

            if(
                item.__codeNorm
            ){

                item.__studentKey =
                "code:" +
                item.__codeNorm;

            }else if(
                item.__nameNorm
            ){

                item.__studentKey =
                "name:" +
                item.__nameNorm;

            }else{

                item.__studentKey =
                "";
            }
        }
    );
}


function workSubmissionId(item){

    if(
        item &&
        item.__submissionId
    ){
        return item.__submissionId;
    }

    return rawSubmissionId(
        item
    );
}


function studentKeyFromWork(item){

    if(
        item &&
        item.__studentKey !==
        undefined
    ){
        return item.__studentKey;
    }

    const code =
    normalize(
        column(
            item,
            ["Mã học viên"]
        )
    );

    if(code){
        return(
            "code:" +
            code
        );
    }

    const name =
    normalize(
        column(
            item,
            [
                "Họ và tên",
                "Họ tên"
            ]
        )
    );

    return name
    ?
    "name:" + name
    :
    "";
}


/* =========================================================
   LATEST SUBMISSION
========================================================= */

function buildLatestSubmissionMap(){

    latestSubmissionMap =
    new Map();

    works.forEach(
        function(item){

            const key =
            item.__studentKey;

            if(!key){
                return;
            }

            const current =
            latestSubmissionMap.get(
                key
            );

            if(
                !current ||
                item.__timestamp >
                current.time
            ){

                latestSubmissionMap.set(

                    key,

                    {
                        time:
                        item.__timestamp,

                        id:
                        item.__submissionId
                    }
                );
            }
        }
    );
}


function isLatestSubmission(item){

    const latest =
    latestSubmissionMap.get(
        item.__studentKey
        ||
        studentKeyFromWork(item)
    );

    return Boolean(

        latest &&

        latest.id ===
        workSubmissionId(item)
    );
}


function withinLastDays(
    item,
    days
){

    const submitted =
    item.__timestamp
    ||
    timestampValue(
        column(
            item,
            ["Dấu thời gian"]
        )
    );

    if(!submitted){
        return false;
    }

    const age =
    Date.now() -
    submitted;

    return(

        age >= 0

        &&

        age <=
        days * 86400000
    );
}


/* =========================================================
   CATALOG
========================================================= */

function rarityData(value){

    const key =
    normalize(value);

    if(key.includes("cuc pham")){
        return{css:"supreme",rank:6};
    }

    if(key.includes("cao cap")){
        return{css:"premium",rank:5};
    }

    if(key.includes("thuong pham")){
        return{css:"high",rank:4};
    }

    if(key.includes("trung thuong")){
        return{css:"upper",rank:3};
    }

    if(key.includes("trung pham")){
        return{css:"medium",rank:2};
    }

    return{
        css:"common",
        rank:1
    };
}


function buildCatalogMaps(){

    giftIconMap =
    new Map();

    giftCatalog.forEach(
        function(item){

            const name =
            clean(
                column(
                    item,
                    ["Tên quà"]
                )
            );

            if(!name){
                return;
            }

            giftIconMap.set(

                normalize(name),

                {
                    name:name,

                    icon:
                    clean(
                        column(
                            item,
                            ["Icon"]
                        )
                    ),

                    description:
                    clean(
                        column(
                            item,
                            ["Mô tả"]
                        )
                    ),

                    rarity:
                    clean(
                        column(
                            item,
                            ["Độ hiếm"]
                        )
                    )
                }
            );
        }
    );

    beastCatalog =
    giftCatalog
    .map(
        function(item){

            const name =
            clean(
                column(
                    item,
                    ["Tên quà"]
                )
            );

            const rarity =
            rarityData(
                column(
                    item,
                    ["Độ hiếm"]
                )
            );

            return{

                name:name,

                key:
                normalize(name),

                icon:
                clean(
                    column(
                        item,
                        ["Icon"]
                    )
                ),

                rarity:
                clean(
                    column(
                        item,
                        ["Độ hiếm"]
                    )
                ),

                css:
                rarity.css,

                rank:
                rarity.rank
            };
        }
    )
    .filter(
        item =>
        item.key.includes(
            "linh thu"
        )
    );

    giftOptionsCache =
    buildGiftOptionsHTML();
}


/* =========================================================
   OWNERSHIP
========================================================= */

const studentCodeKey =
value =>
normalize(value)
?
"code:" +
normalize(value)
:
"";


const studentNameKey =
value =>
normalize(value)
?
"name:" +
normalize(value)
:
"";


function isActiveTeacherGift(row){

    const status =
    normalize(
        column(
            row,
            ["Trạng thái"]
        )
    );

    return(

        !status

        ||

        (
            !status.includes(
                "het hieu luc"
            )

            &&

            !status.includes(
                "da huy"
            )

            &&

            status !==
            "huy"
        )
    );
}


function addOwnedBeast(
    key,
    beast
){

    if(!key){
        return;
    }

    if(
        !ownershipMap.has(
            key
        )
    ){

        ownershipMap.set(
            key,
            []
        );
    }

    const list =
    ownershipMap.get(key);

    if(
        !list.some(
            existing =>
            existing.key ===
            beast.key
        )
    ){

        list.push(beast);
    }
}


function scanOwnership(
    row,
    isTeacherGift
){

    if(
        isTeacherGift &&
        !isActiveTeacherGift(row)
    ){
        return;
    }

    const code =
    column(
        row,
        ["Mã học viên"]
    );

    const name =
    column(
        row,
        [
            "Họ tên",
            "Họ và tên"
        ]
    );

    const giftTexts = [

        column(
            row,
            ["Món quà muốn đổi"]
        ),

        column(
            row,
            ["Quà nhận được"]
        ),

        column(
            row,
            ["Tên vật phẩm"]
        )
    ];

    giftTexts.forEach(
        function(text){

            const normalizedText =
            normalize(text);

            if(!normalizedText){
                return;
            }

            beastCatalog.forEach(
                function(beast){

                    if(
                        !normalizedText.includes(
                            beast.key
                        )
                    ){
                        return;
                    }

                    addOwnedBeast(
                        studentCodeKey(code),
                        beast
                    );

                    addOwnedBeast(
                        studentNameKey(name),
                        beast
                    );
                }
            );
        }
    );
}


function buildOwnershipMap(){

    ownershipMap =
    new Map();

    exchangeData.forEach(
        row =>
        scanOwnership(
            row,
            false
        )
    );

    teacherGiftData.forEach(
        row =>
        scanOwnership(
            row,
            true
        )
    );
}


function getStudentBeasts(
    code,
    name
){

    const result = [];

    [
        studentCodeKey(code),
        studentNameKey(name)
    ]
    .forEach(
        function(key){

            const list =
            ownershipMap.get(key)
            ||
            [];

            list.forEach(
                function(beast){

                    if(
                        !result.some(
                            existing =>
                            existing.key ===
                            beast.key
                        )
                    ){

                        result.push(beast);
                    }
                }
            );
        }
    );

    return result.sort(
        (a,b) =>
        b.rank -
        a.rank
    );
}


function studentOwns(
    code,
    name,
    beastKey
){

    const target =
    normalize(
        beastKey
    );

    return getStudentBeasts(
        code,
        name
    )
    .some(
        beast =>
        beast.key.includes(
            target
        )
    );
}


/* =========================================================
   PRIORITY
========================================================= */

function calculatePriorityState(item){

    const empty = {

        pinned:false,

        needsScore:false,

        needsComment:false,

        label:""
    };

    if(!ADMIN_MODE){
        return empty;
    }

    if(
        !isLatestSubmission(
            item
        )
    ){
        return empty;
    }

    if(
        !withinLastDays(
            item,
            PRIORITY_DAYS
        )
    ){
        return empty;
    }

    const windDragon =
    studentOwns(
        item.__code,
        item.__name,
        BEAST_KEYS.WIND_DRAGON
    );

    const turtle =
    studentOwns(
        item.__code,
        item.__name,
        BEAST_KEYS.TURTLE
    );

    const needsScore =
    Boolean(

        windDragon

        &&

        item.__score === ""
    );

    const needsComment =
    Boolean(

        turtle

        &&

        item.__comment === ""
    );

    const labels = [];

    if(needsScore){

        labels.push(
            "Ưu tiên chấm điểm"
        );
    }

    if(needsComment){

        labels.push(
            "Ưu tiên nhận xét"
        );
    }

    return{

        pinned:
        needsScore ||
        needsComment,

        needsScore:
        needsScore,

        needsComment:
        needsComment,

        label:
        labels.join(
            " " +
            CHAR.DOT +
            " "
        )
    };
}


function buildPriorityCache(){

    priorityCountCache =
    0;

    works.forEach(
        function(item){

            item.__beasts =
            getStudentBeasts(
                item.__code,
                item.__name
            );

            item.__priority =
            calculatePriorityState(
                item
            );

            if(
                item.__priority.pinned
            ){
                priorityCountCache++;
            }
        }
    );
}


/* =========================================================
   SORT
========================================================= */

function newestSort(a,b){

    return(
        (b.__timestamp || 0)
        -
        (a.__timestamp || 0)
    );
}


function prioritySort(a,b){

    const aPriority =
    a.__priority &&
    a.__priority.pinned
    ?
    1
    :
    0;

    const bPriority =
    b.__priority &&
    b.__priority.pinned
    ?
    1
    :
    0;

    if(
        bPriority !==
        aPriority
    ){

        return(
            bPriority -
            aPriority
        );
    }

    return newestSort(
        a,
        b
    );
}


function buildSortedWorks(){

    adminSortedWorks =
    works
    .slice()
    .sort(
        prioritySort
    );
}


/* =========================================================
   SEARCH
========================================================= */

function buildSearchResults(){

    const query =
    normalize(
        adminSearchQuery
    );

    if(!query){

        currentSearchResults =
        [];

        return;
    }

    currentSearchResults =
    adminSortedWorks.filter(
        function(item){

            return(

                item.__nameNorm
                .includes(query)

                ||

                item.__codeNorm
                .includes(query)
            );
        }
    );
}


function countStudents(data){

    const students =
    new Set();

    data.forEach(
        function(item){

            if(
                item.__studentKey
            ){

                students.add(
                    item.__studentKey
                );
            }
        }
    );

    return students.size;
}


function updateSearchSummary(){

    if(!ADMIN_MODE){
        return;
    }

    const info =
    $("#tp18-search-info");

    const clearButton =
    $("#tp18-search-clear");

    if(
        !info ||
        !clearButton
    ){
        return;
    }

    const query =
    clean(
        adminSearchQuery
    );

    clearButton.classList.toggle(
        "on",
        Boolean(query)
    );

    if(!query){

        info.classList.remove(
            "active"
        );

        setText(
            info,

            works.length +
            " bài " +
            CHAR.DOT +
            " " +
            countStudents(works) +
            " học viên"
        );

        return;
    }

    info.classList.add(
        "active"
    );

    setText(
        info,

        UI.SEARCH +
        ' "' +
        query +
        '" ' +
        CHAR.DOT +
        " " +
        countStudents(
            currentSearchResults
        ) +
        " học viên " +
        CHAR.DOT +
        " " +
        currentSearchResults.length +
        " bài nộp"
    );
}


function showSearchingState(){

    const info =
    $("#tp18-search-info");

    if(!info){
        return;
    }

    info.classList.add(
        "active"
    );

    setText(
        info,
        "Đang tìm..."
    );
}


function clearAdminSearch(){

    adminSearchQuery =
    "";

    currentSearchResults =
    [];

    const input =
    $("#tp18-search-input");

    if(input){
        input.value = "";
    }

    if(searchTimer){

        clearTimeout(
            searchTimer
        );

        searchTimer =
        null;
    }

    currentPage =
    1;

    showLatest();

    updateSearchSummary();

    if(input){
        input.focus();
    }
}


/* =========================================================
   TEACHER GIFTS
========================================================= */

function buildGiftReason(
    reason,
    submissionId
){

    return(
        (
            clean(reason)
            ||
            "GVCN tặng từ trang chấm bài"
        )
        +
        " [" +
        GIFT_SUBMISSION_MARKER +
        ":" +
        submissionId +
        "]"
    );
}


function extractGiftSubmissionId(reason){

    const match =
    String(reason || "")
    .match(
        /\[BAI_ID:([^\]]+)\]/i
    );

    return match
    ?
    clean(match[1])
    :
    "";
}


function buildTeacherGiftStudentIndex(){

    teacherGiftStudentIndex =
    new Map();

    teacherGiftWorkCache =
    new Map();

    teacherGiftData.forEach(
        function(row){

            const code =
            normalize(
                column(
                    row,
                    ["Mã học viên"]
                )
            );

            if(!code){
                return;
            }

            if(
                !teacherGiftStudentIndex
                .has(code)
            ){

                teacherGiftStudentIndex
                .set(
                    code,
                    []
                );
            }

            teacherGiftStudentIndex
            .get(code)
            .push(row);
        }
    );
}


function getTeacherGiftsForWork(item){

    const submissionId =
    item.__submissionId;

    if(
        teacherGiftWorkCache
        .has(submissionId)
    ){

        return teacherGiftWorkCache
        .get(submissionId);
    }

    const code =
    item.__codeNorm;

    const latest =
    isLatestSubmission(
        item
    );

    const rows =
    teacherGiftStudentIndex
    .get(code)
    ||
    [];

    const grouped =
    new Map();

    rows.forEach(
        function(row){

            if(
                !isActiveTeacherGift(
                    row
                )
            ){
                return;
            }

            const type =
            normalize(
                column(
                    row,
                    ["Loại phần thưởng"]
                )
            );

            if(
                type &&
                !type.includes(
                    "vat pham"
                )
            ){
                return;
            }

            const rowSubmission =
            extractGiftSubmissionId(
                column(
                    row,
                    ["Lý do tặng"]
                )
            );

            if(
                rowSubmission &&
                rowSubmission !==
                submissionId
            ){
                return;
            }

            if(
                !rowSubmission &&
                !latest
            ){
                return;
            }

            const giftName =
            clean(
                column(
                    row,
                    ["Tên vật phẩm"]
                )
            );

            if(!giftName){
                return;
            }

            const quantity =
            Math.max(
                1,
                Number(
                    column(
                        row,
                        ["Số lượng"]
                    )
                )
                ||
                1
            );

            const key =
            normalize(
                giftName
            );

            if(
                !grouped.has(
                    key
                )
            ){

                grouped.set(

                    key,

                    {
                        name:
                        giftName,

                        quantity:
                        0
                    }
                );
            }

            grouped.get(
                key
            )
            .quantity +=
            quantity;
        }
    );

    const result =
    [...grouped.values()];

    teacherGiftWorkCache.set(
        submissionId,
        result
    );

    return result;
}


/* =========================================================
   GIFT ICON
========================================================= */

function giftEmoji(name){

    const key =
    normalize(name);

    if(key.includes("bim bim")) return UI.POPCORN;
    if(key.includes("thuoc ke")) return UI.RULER;
    if(key.includes("but")) return UI.BRUSH;
    if(key.includes("giay")) return UI.SCROLL;
    if(key.includes("linh thu")) return UI.PAW;
    if(key.includes("tui")) return UI.BACKPACK;
    if(key.includes("khung")) return UI.FRAME;

    return UI.GIFT;
}


function createGiftOwnedNode(gift){

    const root =
    document.createElement(
        "div"
    );

    root.className =
    "tp18-gift-owned";

    const catalog =
    giftIconMap.get(
        normalize(gift.name)
    );

    if(
        catalog &&
        catalog.icon
    ){

        const image =
        document.createElement(
            "img"
        );

        image.src =
        primaryImage(
            catalog.icon
        );

        image.alt =
        gift.name;

        image.loading =
        "lazy";

        image.decoding =
        "async";

        root.appendChild(
            image
        );

        applyImageFallback(

            image,

            catalog.icon,

            function(broken){

                const fallback =
                document.createElement(
                    "div"
                );

                fallback.className =
                "tp18-gift-icon-fallback";

                setText(
                    fallback,
                    giftEmoji(
                        gift.name
                    )
                );

                broken.replaceWith(
                    fallback
                );
            }
        );

    }else{

        const fallback =
        document.createElement(
            "div"
        );

        fallback.className =
        "tp18-gift-icon-fallback";

        setText(
            fallback,
            giftEmoji(
                gift.name
            )
        );

        root.appendChild(
            fallback
        );
    }

    const count =
    document.createElement(
        "span"
    );

    count.className =
    "tp18-gift-count";

    setText(
        count,
        "+ " +
        gift.quantity
    );

    root.title =
    clean(gift.name)
    +
    " "
    +
    CHAR.MULTIPLY
    +
    " "
    +
    gift.quantity;

    root.appendChild(
        count
    );

    return root;
}


/* =========================================================
   BEAST
========================================================= */

function beastEmoji(name){

    const key =
    normalize(name);

    if(key.includes("cuu vi")) return UI.FOX;
    if(key.includes("phuong")) return UI.FIRE;
    if(key.includes("linh quang loc")) return UI.DEER;
    if(key.includes("ky lan")) return UI.UNICORN;
    if(key.includes("meo")) return UI.CAT;
    if(key.includes("cu")) return UI.OWL;
    if(key.includes("quy")) return UI.TURTLE;
    if(key.includes("kim si")) return UI.EAGLE;
    if(key.includes("rong")) return UI.DRAGON;

    return UI.PAW;
}


function createBeastNode(beast){

    const root =
    document.createElement(
        "div"
    );

    root.className =
    "tp18-beast " +
    beast.css;

    if(beast.icon){

        const image =
        document.createElement(
            "img"
        );

        image.src =
        primaryImage(
            beast.icon
        );

        image.alt =
        beast.name;

        image.loading =
        "lazy";

        image.decoding =
        "async";

        root.appendChild(
            image
        );

        applyImageFallback(

            image,

            beast.icon,

            function(broken){

                const fallback =
                document.createElement(
                    "div"
                );

                fallback.className =
                "tp18-beast-fallback";

                setText(
                    fallback,
                    beastEmoji(
                        beast.name
                    )
                );

                broken.replaceWith(
                    fallback
                );
            }
        );

    }else{

        const fallback =
        document.createElement(
            "div"
        );

        fallback.className =
        "tp18-beast-fallback";

        setText(
            fallback,
            beastEmoji(
                beast.name
            )
        );

        root.appendChild(
            fallback
        );
    }

    const tooltip =
    document.createElement(
        "div"
    );

    tooltip.className =
    "tp18-tooltip";

    setText(
        tooltip,

        beast.name
        +
        (
            beast.rarity
            ?
            " " +
            CHAR.DOT +
            " " +
            beast.rarity
            :
            ""
        )
    );

    root.appendChild(
        tooltip
    );

    return root;
}


/* =========================================================
   GIFT OPTIONS
========================================================= */

function buildGiftOptionsHTML(){

    return[

        '<option value="">-- Chọn vật phẩm GVCN tặng --</option>',

        ...giftCatalog
        .map(
            function(item){

                const name =
                clean(
                    column(
                        item,
                        ["Tên quà"]
                    )
                );

                if(!name){
                    return "";
                }

                const rarity =
                displayValue(
                    column(
                        item,
                        ["Độ hiếm"]
                    )
                );

                return(
                    '<option value="' +
                    escapeHTML(name) +
                    '">' +
                    escapeHTML(name) +
                    " " +
                    escapeHTML(CHAR.DOT) +
                    " " +
                    escapeHTML(rarity) +
                    "</option>"
                );
            }
        )
        .filter(Boolean)

    ].join("");
}


function findCatalogGift(name){

    const target =
    normalize(name);

    return giftCatalog.find(
        item =>
        normalize(
            column(
                item,
                ["Tên quà"]
            )
        )
        ===
        target
    );
}


/* =========================================================
   GIFT FORM POST
========================================================= */

function postHiddenForm(
    url,
    frameName,
    fields
){

    const form =
    document.createElement(
        "form"
    );

    form.method =
    "POST";

    form.action =
    url;

    form.target =
    frameName;

    form.acceptCharset =
    "UTF-8";

    form.style.display =
    "none";

    Object.entries(
        fields
    )
    .forEach(
        function(entry){

            const input =
            document.createElement(
                "input"
            );

            input.type =
            "hidden";

            input.name =
            entry[0];

            input.value =
            String(
                entry[1] ?? ""
            );

            form.appendChild(
                input
            );
        }
    );

    document.body
    .appendChild(
        form
    );

    form.submit();

    setTimeout(
        () =>
        form.remove(),
        2000
    );
}


/* =========================================================
   ISOLATED GRADE POST
========================================================= */

function submitGradeFormIsolated(data){

    const frameName =
    "tp18-grade-frame-" +
    Date.now() +
    "-" +
    (++gradeIframeCounter);

    const iframe =
    document.createElement(
        "iframe"
    );

    iframe.name =
    frameName;

    iframe.id =
    frameName;

    iframe.style.cssText =
    "display:none!important;" +
    "width:0!important;" +
    "height:0!important;" +
    "border:0!important;";

    document.body.appendChild(
        iframe
    );

    const form =
    document.createElement(
        "form"
    );

    form.method =
    "POST";

    form.action =
    GRADE_FORM.url;

    form.target =
    frameName;

    form.acceptCharset =
    "UTF-8";

    form.style.display =
    "none";

    const e =
    GRADE_FORM.entries;

    const fields = {};

    fields[e.submissionId] =
    data.submissionId;

    fields[e.studentName] =
    data.studentName;

    fields[e.studentCode] =
    data.studentCode;

    fields[e.workUrl] =
    data.workUrl;

    fields[e.score] =
    data.score;

    fields[e.comment] =
    data.comment;

    Object.entries(
        fields
    )
    .forEach(
        function(
            [name,value]
        ){

            const input =
            document.createElement(
                "input"
            );

            input.type =
            "hidden";

            input.name =
            name;

            input.value =
            String(
                value ?? ""
            );

            form.appendChild(
                input
            );
        }
    );

    document.body.appendChild(
        form
    );

    form.submit();

    setTimeout(
        function(){

            if(
                form.isConnected
            ){
                form.remove();
            }

        },
        1500
    );

    setTimeout(
        function(){

            if(
                iframe.isConnected
            ){
                iframe.remove();
            }

        },
        GRADE_IFRAME_LIFETIME
    );
}


/* =========================================================
   ISOLATED DELETE POST
========================================================= */

function submitDeleteFormIsolated(data){

    const frameName =
    "tp18-delete-frame-" +
    Date.now() +
    "-" +
    (++deleteIframeCounter);

    const iframe =
    document.createElement(
        "iframe"
    );

    iframe.name =
    frameName;

    iframe.id =
    frameName;

    iframe.style.cssText =
    "display:none!important;" +
    "width:0!important;" +
    "height:0!important;" +
    "border:0!important;";

    document.body.appendChild(
        iframe
    );

    const form =
    document.createElement(
        "form"
    );

    form.method =
    "POST";

    form.action =
    DELETE_FORM.url;

    form.target =
    frameName;

    form.acceptCharset =
    "UTF-8";

    form.style.display =
    "none";

    const e =
    DELETE_FORM.entries;

    const fields = {};

    fields[e.submissionId] =
    data.submissionId;

    fields[e.studentCode] =
    data.studentCode;

    fields[e.studentName] =
    data.studentName;

    fields[e.workUrl] =
    data.workUrl;

    fields[e.submittedAt] =
    data.submittedAt;

    fields[e.actor] =
    ADMIN_GIVER;

    fields[e.reason] =
    data.reason;

    fields[e.action] =
    "XÓA";

    Object.entries(
        fields
    )
    .forEach(
        function(
            [name,value]
        ){

            const input =
            document.createElement(
                "input"
            );

            input.type =
            "hidden";

            input.name =
            name;

            input.value =
            String(
                value ?? ""
            );

            form.appendChild(
                input
            );
        }
    );

    document.body.appendChild(
        form
    );

    form.submit();

    setTimeout(
        function(){

            if(
                form.isConnected
            ){
                form.remove();
            }

            if(
                iframe.isConnected
            ){
                iframe.remove();
            }

        },
        DELETE_IFRAME_LIFETIME
    );
}


/* =========================================================
   GRADE SEND QUEUE
========================================================= */

function enqueueGradeSubmission(data){

    for(
        let i =
        gradeSendQueue.length - 1;
        i >= 0;
        i--
    ){

        if(
            gradeSendQueue[i]
            .submissionId ===
            data.submissionId
        ){

            gradeSendQueue.splice(
                i,
                1
            );
        }
    }

    gradeSendQueue.push(
        data
    );

    processGradeSendQueue();
}


async function processGradeSendQueue(){

    if(
        gradeSenderBusy
    ){
        return;
    }

    gradeSenderBusy =
    true;

    try{

        while(
            gradeSendQueue.length
        ){

            const data =
            gradeSendQueue.shift();

            const pending =
            pendingGrades.get(
                data.submissionId
            );

            if(!pending){
                continue;
            }

            if(
                pending.token !==
                data.token
            ){
                continue;
            }

            pending.state =
            "sending";

            try{

                submitGradeFormIsolated(
                    data
                );

                pending.state =
                "sent";

                pending.sentAt =
                Date.now();

                setCardSyncState(
                    data.submissionId,
                    "pending"
                );

            }catch(error){

                console.error(
                    "Grade POST error:",
                    error
                );

                pending.state =
                "send-error";

                setCardGradeSendError(
                    data.submissionId
                );

                showToast(
                    UI.WARNING +
                    " Không thể khởi tạo gửi một bài chấm.",
                    "error",
                    4500
                );
            }

            await sleep(
                GRADE_SEND_GAP_MS
            );
        }

    }finally{

        gradeSenderBusy =
        false;

        scheduleGradeSyncCheck(
            GRADE_SYNC_FIRST_CHECK
        );
    }
}


/* =========================================================
   GIFT SUBMIT
========================================================= */

function submitGiftForm(data){

    const e =
    GIFT_FORM.entries;

    const fields = {};

    fields[e.scope] =
    "Cá nhân";

    fields[e.studentCode] =
    data.code;

    fields[e.group] =
    data.group;

    fields[e.course] =
    data.course;

    fields[e.rewardType] =
    "Vật phẩm";

    fields[e.giftName] =
    data.gift;

    fields[e.gemstoneType] =
    "";

    fields[e.quantity] =
    1;

    fields[e.reason] =
    data.reason;

    fields[e.giver] =
    ADMIN_GIVER;

    fields[e.status] =
    "Đang hiệu lực";

    postHiddenForm(
        GIFT_FORM.url,
        "tp18-gift-frame",
        fields
    );
}


/* =========================================================
   LOCAL GRADE
========================================================= */

function findLocalWorkById(
    submissionId
){

    return(
        works.find(
            work =>
            work.__submissionId ===
            submissionId
        )
        ||
        null
    );
}


function applyLocalGrade(
    submissionId,
    score,
    comment
){

    const item =
    findLocalWorkById(
        submissionId
    );

    if(!item){
        return;
    }

    item.__score =
    clean(score);

    item.__comment =
    clean(comment);

    item[
        normalize("Điểm số")
    ] =
    clean(score);

    item[
        normalize("Nhận xét")
    ] =
    clean(comment);

    item.__priority =
    calculatePriorityState(
        item
    );

    priorityCountCache =
    works.reduce(
        function(
            total,
            work
        ){

            return(
                total
                +
                (
                    work.__priority &&
                    work.__priority.pinned
                    ?
                    1
                    :
                    0
                )
            );

        },
        0
    );

    buildSortedWorks();

    if(
        clean(
            adminSearchQuery
        )
    ){
        buildSearchResults();
    }

    if(
        selectedStudentName
    ){

        buildCurrentStudentResults(
            selectedStudentName
        );
    }
}


/* =========================================================
   CARD SYNC STATE
========================================================= */

function getVisibleCard(
    submissionId
){

    const cards =
    document.querySelectorAll(
        ".tp18-card"
    );

    for(
        const card
        of cards
    ){

        if(
            card.dataset.id ===
            submissionId
        ){
            return card;
        }
    }

    return null;
}


function setCardSyncState(
    submissionId,
    state
){

    const card =
    getVisibleCard(
        submissionId
    );

    if(!card){
        return;
    }

    const result =
    card.querySelector(
        ".tp18-grade-result"
    );

    if(!result){
        return;
    }

    card.classList.remove(
        "grade-pending",
        "grade-synced",
        "grade-warning"
    );

    if(
        state ===
        "pending"
    ){

        card.classList.add(
            "grade-pending"
        );

        result.className =
        "tp18-grade-result wait";

        result.innerHTML =
        '<span class="tp18-sync-dot"></span>' +
        'Đã gửi · Đang đồng bộ với Google';

        return;
    }

    if(
        state ===
        "synced"
    ){

        card.classList.add(
            "grade-synced"
        );

        result.className =
        "tp18-grade-result ok";

        result.innerHTML =
        '<span class="tp18-sync-dot"></span>' +
        CHAR.CHECK +
        ' Đã đồng bộ';

        setTimeout(
            function(){

                const currentCard =
                getVisibleCard(
                    submissionId
                );

                if(
                    currentCard
                ){

                    currentCard.classList.remove(
                        "grade-synced"
                    );
                }

            },
            4000
        );
    }
}


function setCardWaitingGoogle(
    submissionId
){

    const card =
    getVisibleCard(
        submissionId
    );

    if(!card){
        return;
    }

    card.classList.remove(
        "grade-synced",
        "grade-warning"
    );

    card.classList.add(
        "grade-pending"
    );

    const result =
    card.querySelector(
        ".tp18-grade-result"
    );

    if(!result){
        return;
    }

    result.className =
    "tp18-grade-result wait";

    result.innerHTML =
    '<span class="tp18-sync-dot"></span>' +
    'Đã gửi Form · Đang chờ Google cập nhật dữ liệu';
}


function setCardGradeSendError(
    submissionId
){

    const card =
    getVisibleCard(
        submissionId
    );

    if(!card){
        return;
    }

    card.classList.remove(
        "grade-pending",
        "grade-synced"
    );

    card.classList.add(
        "grade-warning"
    );

    const result =
    card.querySelector(
        ".tp18-grade-result"
    );

    if(!result){
        return;
    }

    result.className =
    "tp18-grade-result error";

    setText(
        result,

        UI.WARNING +
        " Không thể khởi tạo gửi Form. Hãy bấm Xác nhận chấm lại."
    );
}


/* =========================================================
   CENTRAL GRADE SYNC
========================================================= */

function scheduleGradeSyncCheck(
    delay
){

    if(
        !pendingGrades.size
    ){
        return;
    }

    if(
        gradeSyncTimer
    ){
        return;
    }

    gradeSyncTimer =
    setTimeout(
        function(){

            gradeSyncTimer =
            null;

            runGradeSyncCheck();

        },
        Number(
            delay ||
            GRADE_SYNC_INTERVAL
        )
    );
}


async function runGradeSyncCheck(){

    if(
        gradeSyncRunning
        ||
        !pendingGrades.size
    ){
        return;
    }

    gradeSyncRunning =
    true;

    try{

        const freshResult =
        await loadWorkData();

        sourceName =
        freshResult.source;

        const synced =
        reconcilePendingGradesWithRawData(
            freshResult.data,
            true
        );

        if(
            synced > 0
        ){

            updateStatus();

            renderPagers();
        }

        const now =
        Date.now();

        let hasActivePending =
        false;

        pendingGrades.forEach(
            function(
                pending,
                submissionId
            ){

                if(
                    pending.state ===
                    "send-error"
                ){
                    return;
                }

                if(
                    pending.state ===
                    "queued" ||
                    pending.state ===
                    "sending"
                ){

                    hasActivePending =
                    true;

                    return;
                }

                const age =
                now -
                (
                    pending.sentAt
                    ||
                    pending.createdAt
                    ||
                    now
                );

                if(
                    age <
                    GRADE_SYNC_WARNING_AFTER
                ){

                    hasActivePending =
                    true;

                    pending.state =
                    "sent";

                    setCardSyncState(
                        submissionId,
                        "pending"
                    );

                    return;
                }

                pending.state =
                "waiting-google";

                setCardWaitingGoogle(
                    submissionId
                );

                if(
                    age <
                    GRADE_SYNC_ACTIVE_WINDOW
                ){

                    hasActivePending =
                    true;
                }
            }
        );

        updateStatus();

        renderPagers();

        if(
            pendingGrades.size &&
            hasActivePending
        ){

            scheduleGradeSyncCheck(
                GRADE_SYNC_INTERVAL
            );
        }

    }catch(error){

        console.warn(
            "Grade central sync:",
            error
        );

        if(
            pendingGrades.size
        ){

            scheduleGradeSyncCheck(
                GRADE_SYNC_INTERVAL
            );
        }

    }finally{

        gradeSyncRunning =
        false;
    }
}


/* =========================================================
   GIFT VERIFY
========================================================= */

function giftExists(
    data,
    expected
){

    return data.some(
        function(row){

            return(

                normalize(
                    column(
                        row,
                        ["Mã học viên"]
                    )
                )
                ===
                normalize(
                    expected.code
                )

                &&

                normalize(
                    column(
                        row,
                        ["Tên vật phẩm"]
                    )
                )
                ===
                normalize(
                    expected.gift
                )

                &&

                extractGiftSubmissionId(
                    column(
                        row,
                        ["Lý do tặng"]
                    )
                )
                ===
                expected.submissionId

                &&

                isActiveTeacherGift(
                    row
                )
            );
        }
    );
}


async function verifyGift(
    expected
){

    for(
        let attempt=0;
        attempt<GIFT_VERIFY_TRIES;
        attempt++
    ){

        await sleep(
            GIFT_VERIFY_INTERVAL
        );

        try{

            const fresh =
            csvObjects(
                await fetchCSV(
                    URLS.teacherGifts
                )
            );

            if(
                giftExists(
                    fresh,
                    expected
                )
            ){

                teacherGiftData =
                fresh;

                buildTeacherGiftStudentIndex();

                buildOwnershipMap();

                buildPriorityCache();

                buildSortedWorks();

                if(
                    clean(
                        adminSearchQuery
                    )
                ){
                    buildSearchResults();
                }

                return true;
            }

        }catch(error){

            console.warn(
                "Gift verify:",
                error
            );
        }
    }

    return false;
}


/* =========================================================
   HANDLE GIFT
========================================================= */

async function handleGiveGift(button){

    if(!ADMIN_MODE){
        return;
    }

    const card =
    button.closest(
        ".tp18-card"
    );

    const select =
    card.querySelector(
        ".tp18-gift-select"
    );

    const reasonInput =
    card.querySelector(
        ".tp18-gift-reason"
    );

    const result =
    card.querySelector(
        ".tp18-give-result"
    );

    const gift =
    clean(
        select.value
    );

    if(!gift){

        result.className =
        "tp18-give-result error";

        setText(
            result,
            "Hãy chọn vật phẩm."
        );

        return;
    }

    if(
        !findCatalogGift(
            gift
        )
    ){

        result.className =
        "tp18-give-result error";

        setText(
            result,
            "Không tìm thấy vật phẩm trong sheet QuaTang."
        );

        return;
    }

    const reason =
    clean(
        reasonInput.value
    )
    ||
    "GVCN tặng từ trang chấm bài";

    if(
        !window.confirm(

            "Tặng cho: " +
            card.dataset.name +

            "\nVật phẩm: " +
            gift +

            "\nSố lượng: 1" +

            "\n\nXác nhận tặng?"
        )
    ){
        return;
    }

    button.disabled =
    true;

    setText(
        button,
        "Đang gửi..."
    );

    result.className =
    "tp18-give-result wait";

    setText(
        result,
        "Đang gửi và kiểm tra QuaTangGVCN..."
    );

    const expected = {

        code:
        card.dataset.code,

        gift:
        gift,

        submissionId:
        card.dataset.id
    };

    try{

        submitGiftForm({

            code:
            card.dataset.code,

            group:
            card.dataset.group,

            course:
            card.dataset.course,

            gift:
            gift,

            reason:
            buildGiftReason(
                reason,
                card.dataset.id
            )
        });

        const success =
        await verifyGift(
            expected
        );

        if(!success){

            result.className =
            "tp18-give-result error";

            setText(
                result,

                CHAR.CROSS +
                " Chưa xác minh được " +
                gift +
                " trong QuaTangGVCN."
            );

            return;
        }

        result.className =
        "tp18-give-result ok";

        setText(
            result,

            CHAR.CHECK +
            " Đã tặng 1 " +
            CHAR.MULTIPLY +
            " " +
            gift
        );

        refreshGiftDisplay(
            card
        );

        updateStatus();

        showToast(
            "Đã tặng quà",
            "success"
        );

    }catch(error){

        result.className =
        "tp18-give-result error";

        setText(
            result,

            "Không thể tặng quà: " +
            (
                error.message ||
                error
            )
        );

    }finally{

        button.disabled =
        false;

        setText(
            button,
            UI.GIFT +
            " Xác nhận tặng"
        );
    }
}


/* =========================================================
   REFRESH GIFT DISPLAY
========================================================= */

function refreshGiftDisplay(
    card
){

    const item =
    works.find(
        work =>
        work.__submissionId ===
        card.dataset.id
    );

    if(!item){
        return;
    }

    teacherGiftWorkCache.delete(
        item.__submissionId
    );

    const box =
    card.querySelector(
        ".tp18-gifts-owned"
    );

    const icons =
    card.querySelector(
        ".tp18-gift-icons"
    );

    if(
        !box ||
        !icons
    ){
        return;
    }

    const gifts =
    getTeacherGiftsForWork(
        item
    );

    icons.innerHTML =
    "";

    if(
        !gifts.length
    ){

        box.classList.remove(
            "on"
        );

        return;
    }

    gifts.forEach(
        gift =>
        icons.appendChild(
            createGiftOwnedNode(
                gift
            )
        )
    );

    box.classList.add(
        "on"
    );
}


/* =========================================================
   SCORE VALIDATION
========================================================= */

function validateScore(value){

    const text =
    clean(value)
    .replace(
        ",",
        "."
    );

    if(!text){

        return{
            valid:true,
            value:""
        };
    }

    if(
        !/^\d+(\.\d+)?$/
        .test(text)
    ){

        return{
            valid:false,
            message:
            "Điểm phải là một số."
        };
    }

    const number =
    Number(text);

    if(
        number < 0 ||
        number > 10
    ){

        return{
            valid:false,
            message:
            "Điểm phải từ 0 đến 10."
        };
    }

    return{
        valid:true,
        value:String(number)
    };
}


function updateAdminScoreColor(
    input
){

    if(!input){
        return;
    }

    const hasScore =
    clean(
        input.value
    )
    !==
    "";

    input.classList.toggle(
        "graded",
        hasScore
    );

    input.classList.toggle(
        "ungraded",
        !hasScore
    );
}


/* =========================================================
   HANDLE GRADE
========================================================= */

function handleGrade(button){

    if(!ADMIN_MODE){
        return;
    }

    const card =
    button.closest(
        ".tp18-card"
    );

    if(!card){
        return;
    }

    if(
        card.dataset.grading ===
        "1"
    ){
        return;
    }

    const scoreInput =
    card.querySelector(
        ".tp18-score-input"
    );

    const commentInput =
    card.querySelector(
        ".tp18-comment-input"
    );

    const resultBox =
    card.querySelector(
        ".tp18-grade-result"
    );

    const validatedScore =
    validateScore(
        scoreInput.value
    );

    if(
        !validatedScore.valid
    ){

        resultBox.className =
        "tp18-grade-result error";

        setText(
            resultBox,
            validatedScore.message
        );

        return;
    }

    const newScore =
    clean(
        validatedScore.value
    );

    const newComment =
    clean(
        commentInput.value
    );

    const oldScore =
    clean(
        card.dataset.originalScore
    )
    .replace(
        ",",
        "."
    );

    const oldComment =
    clean(
        card.dataset.originalComment
    );

    if(
        newScore ===
        oldScore

        &&

        newComment ===
        oldComment
    ){

        resultBox.className =
        "tp18-grade-result error";

        setText(
            resultBox,
            "Điểm và nhận xét chưa có thay đổi."
        );

        return;
    }

    if(
        !window.confirm(

            "Học viên: " +
            card.dataset.name +

            "\nĐiểm: " +
            (
                newScore ||
                "để trống"
            ) +

            "\nNhận xét: " +
            (
                newComment ||
                "để trống"
            ) +

            "\n\nXác nhận chấm bài?"
        )
    ){
        return;
    }

    card.dataset.grading =
    "1";

    button.disabled =
    true;

    setText(
        button,
        "Đang ghi nhận..."
    );

    try{

        const gradeToken =
        Date.now()
        +
        "-"
        +
        Math.random()
        .toString(36)
        .slice(2);

        pendingGrades.set(

            card.dataset.id,

            {
                submissionId:
                card.dataset.id,

                score:
                newScore,

                comment:
                newComment,

                createdAt:
                Date.now(),

                sentAt:
                0,

                state:
                "queued",

                token:
                gradeToken
            }
        );

        applyLocalGrade(
            card.dataset.id,
            newScore,
            newComment
        );

        card.dataset.originalScore =
        newScore;

        card.dataset.originalComment =
        newComment;

        card.classList.remove(
            "grade-warning",
            "grade-synced"
        );

        card.classList.add(
            "grade-pending"
        );

        resultBox.className =
        "tp18-grade-result wait";

        resultBox.innerHTML =
        '<span class="tp18-sync-dot"></span>' +
        'Đã ghi nhận · Đang xếp hàng gửi';

        enqueueGradeSubmission({

            submissionId:
            card.dataset.id,

            studentName:
            card.dataset.name,

            studentCode:
            card.dataset.code,

            workUrl:
            card.dataset.work,

            score:
            newScore,

            comment:
            newComment,

            token:
            gradeToken
        });

        showToast(

            CHAR.CHECK +
            " Đã ghi nhận bài chấm — đang gửi tới Google.",

            "success",

            2000
        );

        card.classList.remove(
            "priority"
        );

        const priorityLabel =
        card.querySelector(
            ".tp18-priority-label"
        );

        if(priorityLabel){
            priorityLabel.remove();
        }

        updateStatus();
        updateSearchSummary();
        renderPagers();

    }catch(error){

        console.error(
            "Grade submit error:",
            error
        );

        resultBox.className =
        "tp18-grade-result error";

        setText(
            resultBox,

            "Không thể ghi nhận bài chấm: " +
            (
                error.message ||
                error
            )
        );

        showToast(
            "Gửi bài chấm thất bại",
            "error"
        );

    }finally{

        card.dataset.grading =
        "0";

        button.disabled =
        false;

        setText(
            button,
            CHAR.CHECK +
            " Xác nhận chấm"
        );
    }
}


/* =========================================================
   VERIFY DELETE
========================================================= */

async function verifyDelete(
    submissionId
){

    await sleep(
        DELETE_VERIFY_FIRST_DELAY
    );

    for(
        let attempt=1;
        attempt<=DELETE_VERIFY_TRIES;
        attempt++
    ){

        try{

            const fresh =
            csvObjects(
                await fetchCSV(
                    URLS.deleteLog
                )
            );

            if(
                deleteLogHasSubmission(
                    fresh,
                    submissionId
                )
            ){

                deleteLogData =
                fresh;

                buildDeletedSubmissionIds(
                    fresh
                );

                return true;
            }

        }catch(error){

            console.warn(
                "Delete verify " +
                attempt +
                ":",
                error
            );
        }

        if(
            attempt <
            DELETE_VERIFY_TRIES
        ){

            await sleep(
                DELETE_VERIFY_INTERVAL
            );
        }
    }

    return false;
}


/* =========================================================
   HANDLE DELETE
========================================================= */

async function handleDelete(button){

    if(!ADMIN_MODE){
        return;
    }

    const card =
    button.closest(
        ".tp18-card"
    );

    if(!card){
        return;
    }

    const submissionId =
    clean(
        card.dataset.id
    );

    if(!submissionId){

        showToast(
            "Không xác định được Mã bài nộp.",
            "error",
            4500
        );

        return;
    }

    if(
        pendingDeletes.has(
            submissionId
        )
    ){
        return;
    }

    const deleteDate =
    toGoogleFormDate(
        card.dataset.submittedAt
    );

    if(!deleteDate){

        showToast(
            "Không chuyển đổi được ngày nộp bài để gửi Form xoá.",
            "error",
            5000
        );

        return;
    }

    const defaultReason =
    "Bài nộp không hợp lệ";

    const reasonInput =
    window.prompt(

        "Lý do xoá bài của:\n" +
        card.dataset.name,

        defaultReason
    );

    if(
        reasonInput ===
        null
    ){
        return;
    }

    const reason =
    clean(
        reasonInput
    )
    ||
    defaultReason;

    if(
        !window.confirm(

            "XÁC NHẬN XOÁ BÀI\n\n" +

            "Học viên: " +
            card.dataset.name +

            "\nMã học viên: " +
            card.dataset.code +

            "\nNgày nộp: " +
            deleteDate +

            "\nLý do: " +
            reason +

            "\n\n" +

            "Bài chỉ bị loại khỏi hệ thống hiển thị.\n" +
            "Dữ liệu gốc không bị xoá vật lý."
        )
    ){
        return;
    }

    const result =
    card.querySelector(
        ".tp18-delete-result"
    );

    pendingDeletes.set(

        submissionId,

        {
            state:
            "sending",

            createdAt:
            Date.now()
        }
    );

    button.disabled =
    true;

    button.classList.add(
        "pending"
    );

    card.classList.add(
        "delete-checking"
    );

    setText(
        button,
        "…"
    );

    if(result){

        result.className =
        "tp18-delete-result on";

        setText(
            result,
            "Đang lưu vào XoaBai..."
        );
    }

    showToast(
        "Đang gửi lệnh xoá tới Google...",
        "wait",
        0
    );

    try{

        submitDeleteFormIsolated({

            submissionId:
            submissionId,

            studentCode:
            card.dataset.code,

            studentName:
            card.dataset.name,

            workUrl:
            card.dataset.work,

            submittedAt:
            deleteDate,

            reason:
            reason
        });

        pendingDeletes.get(
            submissionId
        ).state =
        "verifying";

        const success =
        await verifyDelete(
            submissionId
        );

        if(!success){

            pendingDeletes.delete(
                submissionId
            );

            button.disabled =
            false;

            button.classList.remove(
                "pending"
            );

            card.classList.remove(
                "delete-checking"
            );

            /*
               NÚT XOÁ = ×
            */
            setText(
                button,
                CHAR.MULTIPLY
            );

            if(result){

                result.className =
                "tp18-delete-result on error";

                setText(
                    result,
                    "Chưa thấy dữ liệu trong XoaBai. Bài chưa bị xoá."
                );

                setTimeout(
                    function(){

                        if(
                            result.isConnected
                        ){
                            result.classList.remove(
                                "on"
                            );
                        }

                    },
                    6000
                );
            }

            showToast(
                UI.WARNING +
                " Chưa xác minh được lệnh xoá trong XoaBai.",
                "warning",
                5000
            );

            return;
        }

        pendingDeletes.delete(
            submissionId
        );

        pendingGrades.delete(
            submissionId
        );

        deletedSubmissionIds.add(
            submissionId
        );

        works =
        works.filter(
            item =>
            item.__submissionId !==
            submissionId
        );

        buildAllRuntimeCaches();

        clampCurrentPage();

        restoreCurrentView();

        updateStatus();

        updateSearchSummary();

        showToast(
            CHAR.CHECK +
            " Đã lưu vào XoaBai và xoá bài khỏi trang.",
            "success",
            3500
        );

    }catch(error){

        console.error(
            "Delete error:",
            error
        );

        pendingDeletes.delete(
            submissionId
        );

        button.disabled =
        false;

        button.classList.remove(
            "pending"
        );

        card.classList.remove(
            "delete-checking"
        );

        /*
           NÚT XOÁ = ×
        */
        setText(
            button,
            CHAR.MULTIPLY
        );

        if(result){

            result.className =
            "tp18-delete-result on error";

            setText(
                result,
                "Không thể gửi lệnh xoá."
            );
        }

        showToast(
            "Không thể gửi lệnh xoá.",
            "error",
            4500
        );
    }
}


/* =========================================================
   WORK IMAGE
========================================================= */

function prepareWorkImage(
    image,
    source
){

    applyImageFallback(

        image,

        source,

        function(broken){

            const fallback =
            document.createElement(
                "div"
            );

            fallback.className =
            "tp18-no-image";

            const icon =
            document.createElement(
                "div"
            );

            setText(
                icon,
                UI.IMAGE
            );

            const small =
            document.createElement(
                "small"
            );

            setText(
                small,
                "Không tải được ảnh"
            );

            fallback.appendChild(
                icon
            );

            fallback.appendChild(
                small
            );

            const link =
            broken.closest(
                ".tp18-work-link"
            );

            if(link){

                link.replaceWith(
                    fallback
                );

            }else{

                broken.replaceWith(
                    fallback
                );
            }
        }
    );
}


/* =========================================================
   CREATE CARD
========================================================= */

function createCard(
    item,
    displayNumber
){

    const name =
    item.__name;

    const code =
    item.__code;

    const group =
    item.__group;

    const course =
    item.__course;

    const submittedAt =
    item.__timestampText;

    const score =
    item.__score;

    const hasScore =
    score !== "";

    const comment =
    item.__comment;

    const rawWork =
    item.__rawWork;

    const workUrl =
    item.__workUrl;

    const image =
    item.__image;

    const submissionId =
    item.__submissionId;

    const beasts =
    item.__beasts
    ||
    [];

    const priority =
    item.__priority
    ||
    {
        pinned:false,
        needsScore:false,
        needsComment:false,
        label:""
    };

    const teacherGifts =
    getTeacherGiftsForWork(
        item
    );

    const pending =
    pendingGrades.get(
        submissionId
    );

    const card =
    document.createElement(
        "article"
    );

    card.className =
    "tp18-card";

    if(
        priority.pinned
    ){

        card.classList.add(
            "priority"
        );
    }

    if(
        beasts.length
    ){

        card.classList.add(
            "has-beast"
        );
    }

    if(pending){

        if(
            pending.state ===
            "send-error"
        ){

            card.classList.add(
                "grade-warning"
            );

        }else{

            card.classList.add(
                "grade-pending"
            );
        }
    }

    Object.assign(
        card.dataset,
        {

            id:
            submissionId,

            name:
            name,

            code:
            code,

            group:
            group,

            course:
            course,

            work:
            workUrl === "#"
            ?
            ""
            :
            workUrl,

            submittedAt:
            submittedAt,

            originalScore:
            score,

            originalComment:
            comment,

            grading:
            "0"
        }
    );

    const chip =
    function(
        text,
        css
    ){

        return(
            '<span class="tp18-chip ' +
            (
                css ||
                ""
            ) +
            '">' +
            escapeHTML(
                decodeNumericEntities(
                    text
                )
            ) +
            "</span>"
        );
    };

    let chips =
    "";

    chips +=
    chip(
        UI.PEOPLE +
        " Tổ " +
        displayValue(group)
    );

    chips +=
    chip(
        UI.GRADUATION +
        " Khóa " +
        displayValue(course)
    );

    if(
        ADMIN_MODE &&
        code
    ){

        chips +=
        chip(
            "Mã: " +
            code
        );
    }

    if(
        ADMIN_MODE &&
        priority.needsScore
    ){

        chips +=
        chip(

            UI.PIN +
            " Chờ chấm điểm",

            "priority"
        );
    }

    if(
        ADMIN_MODE &&
        priority.needsComment
    ){

        chips +=
        chip(

            UI.PIN +
            " Chờ nhận xét",

            "priority"
        );
    }

    let initialSyncHTML =
    "";

    if(pending){

        if(
            pending.state ===
            "send-error"
        ){

            initialSyncHTML =
            `
                <div class="tp18-grade-result error">
                    ${escapeHTML(UI.WARNING)}
                    Không thể khởi tạo gửi Form.
                    Hãy bấm Xác nhận chấm lại.
                </div>
            `;

        }else if(
            pending.state ===
            "waiting-google"
        ){

            initialSyncHTML =
            `
                <div class="tp18-grade-result wait">
                    <span class="tp18-sync-dot"></span>
                    Đã gửi Form · Đang chờ Google cập nhật dữ liệu
                </div>
            `;

        }else if(
            pending.state ===
            "queued"
        ){

            initialSyncHTML =
            `
                <div class="tp18-grade-result wait">
                    <span class="tp18-sync-dot"></span>
                    Đã ghi nhận · Đang xếp hàng gửi
                </div>
            `;

        }else if(
            pending.state ===
            "sending"
        ){

            initialSyncHTML =
            `
                <div class="tp18-grade-result wait">
                    <span class="tp18-sync-dot"></span>
                    Đang gửi tới Google Form
                </div>
            `;

        }else{

            initialSyncHTML =
            `
                <div class="tp18-grade-result wait">
                    <span class="tp18-sync-dot"></span>
                    Đã gửi · Đang đồng bộ với Google
                </div>
            `;
        }

    }else{

        initialSyncHTML =
        `<div class="tp18-grade-result"></div>`;
    }

    let bodyHTML =
    "";

    if(ADMIN_MODE){

        bodyHTML = `

            <div class="tp18-score">

                <div class="tp18-score-row">

                    <span class="tp18-score-label">
                        Điểm GVCN
                    </span>

                    <input
                        class="tp18-score-input ${hasScore ? "graded" : "ungraded"}"
                        type="text"
                        inputmode="decimal"
                        value="${escapeHTML(score)}"
                        placeholder="0-10"
                    >

                </div>

            </div>


            <div class="tp18-comment">

                <div class="tp18-comment-title">
                    Nhận xét GVCN
                </div>

                <textarea
                    class="tp18-comment-input"
                    placeholder="Nhập nhận xét..."
                >${escapeHTML(comment)}</textarea>

            </div>


            ${initialSyncHTML}


            <!-- =================================================
                 GVCN TẶNG QUÀ - THU GỌN
            ================================================== -->

            <div class="tp18-admin-gift">

                <button
                    class="tp18-admin-gift-toggle"
                    type="button"
                    aria-expanded="false"
                >

                    <span class="tp18-admin-gift-toggle-text">
                        ${escapeHTML(UI.GIFT)}
                        GVCN tặng quà
                    </span>

                    <span class="tp18-admin-gift-arrow">
                        ▾
                    </span>

                </button>


                <div class="tp18-admin-gift-body">

                    <select class="tp18-gift-select">
                        ${giftOptionsCache}
                    </select>

                    <div class="tp18-gift-meta">
                        Linh Thú không tự thay đổi vật phẩm. GVCN tự lựa chọn.
                    </div>

                    <input
                        class="tp18-gift-reason"
                        type="text"
                        placeholder="Lý do tặng..."
                    >

                    <button
                        type="button"
                        class="tp18-give"
                    >
                        Xác nhận tặng
                    </button>

                    <div class="tp18-give-result"></div>

                </div>

            </div>


            <div class="tp18-footer">

                <button
                    class="tp18-grade"
                    type="button"
                >
                    Xác nhận chấm
                </button>

                <div class="tp18-time">
                    ${escapeHTML(
                        submittedAt ||
                        CHAR.EM_DASH
                    )}
                </div>

            </div>
        `;

    }else{

        bodyHTML = `

            <div class="tp18-public-data">

                <div class="tp18-public-box">

                    <div class="tp18-public-label">
                        Điểm số
                    </div>

                    <div
                        class="tp18-public-score ${
                            hasScore
                            ?
                            "graded"
                            :
                            "ungraded"
                        }"
                    >
                        ${
                            hasScore
                            ?
                            escapeHTML(score)
                            :
                            "Chưa chấm"
                        }
                    </div>

                </div>


                <div class="tp18-public-box">

                    <div class="tp18-public-label">
                        Nhận xét GVCN
                    </div>

                    <div class="tp18-public-comment">${
                        escapeHTML(
                            comment ||
                            "Chưa có nhận xét"
                        )
                    }</div>

                </div>

            </div>


            <div class="tp18-footer">

                <div></div>

                <div class="tp18-time">
                    ${escapeHTML(
                        submittedAt ||
                        CHAR.EM_DASH
                    )}
                </div>

            </div>
        `;
    }

    card.innerHTML = `

        ${
            ADMIN_MODE &&
            priority.pinned
            ?
            `
                <div class="tp18-priority-label">
                    ${escapeHTML(
                        UI.PIN +
                        " " +
                        priority.label
                    )}
                </div>
            `
            :
            ""
        }


        <div class="tp18-image-box">

            <div class="tp18-number">
                ${Number(displayNumber)}
            </div>


            ${
                ADMIN_MODE
                ?
                `
                    <button
                        class="tp18-delete"
                        type="button"
                        title="Xoá bài"
                        aria-label="Xoá bài"
                    >
                        ${escapeHTML(CHAR.MULTIPLY)}
                    </button>

                    <div class="tp18-delete-result"></div>
                `
                :
                ""
            }


            ${
                image
                ?
                `
                    <a
                        class="tp18-work-link"
                        href="${escapeHTML(workUrl)}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >

                        <img
                            class="tp18-work-image"
                            src="${escapeHTML(image)}"
                            alt="Tác phẩm của ${escapeHTML(name)}"
                            loading="lazy"
                            decoding="async"
                            fetchpriority="low"
                        >

                    </a>
                `
                :
                `
                    <div class="tp18-no-image">

                        <div>
                            ${escapeHTML(UI.IMAGE)}
                        </div>

                        <small>
                            Không có ảnh
                        </small>

                    </div>
                `
            }

        </div>


        <div class="tp18-info">

            <div class="tp18-name">
                ${escapeHTML(
                    name ||
                    "Học viên"
                )}
            </div>


            <div class="tp18-meta">
                ${chips}
            </div>


            <div
                class="tp18-gifts-owned ${
                    teacherGifts.length
                    ?
                    "on"
                    :
                    ""
                }"
            >

                <div class="tp18-gifts-owned-title">
                    Quà GVCN
                </div>

                <div class="tp18-gift-icons"></div>

            </div>


            ${bodyHTML}

        </div>
    `;

    if(ADMIN_MODE){

        const gradeButton =
        card.querySelector(
            ".tp18-grade"
        );

        if(gradeButton){

            setText(
                gradeButton,

                CHAR.CHECK +
                " Xác nhận chấm"
            );
        }

        const giftButton =
        card.querySelector(
            ".tp18-give"
        );

        if(giftButton){

            setText(
                giftButton,

                UI.GIFT +
                " Xác nhận tặng"
            );
        }

        const deleteButton =
        card.querySelector(
            ".tp18-delete"
        );

        if(deleteButton){

            /*
               NÚT XOÁ = ×
            */
            setText(
                deleteButton,
                CHAR.MULTIPLY
            );
        }
    }

    const workImage =
    card.querySelector(
        ".tp18-work-image"
    );

    if(workImage){

        prepareWorkImage(
            workImage,
            rawWork
        );
    }

    if(
        beasts.length
    ){

        const beastStrip =
        document.createElement(
            "div"
        );

        beastStrip.className =
        "tp18-beasts";

        beasts
        .slice(0,8)
        .forEach(
            beast =>
            beastStrip.appendChild(
                createBeastNode(
                    beast
                )
            )
        );

        card.querySelector(
            ".tp18-image-box"
        )
        .insertAdjacentElement(
            "afterend",
            beastStrip
        );
    }

    if(
        teacherGifts.length
    ){

        const giftStrip =
        card.querySelector(
            ".tp18-gift-icons"
        );

        teacherGifts.forEach(
            gift =>
            giftStrip.appendChild(
                createGiftOwnedNode(
                    gift
                )
            )
        );
    }

    return card;
}


/* =========================================================
   GIFT META
========================================================= */

function updateGiftMeta(
    select
){

    if(!ADMIN_MODE){
        return;
    }

    const card =
    select.closest(
        ".tp18-card"
    );

    const box =
    card.querySelector(
        ".tp18-gift-meta"
    );

    const gift =
    clean(
        select.value
    );

    if(!gift){

        setText(
            box,
            "Linh Thú không tự thay đổi vật phẩm. GVCN tự lựa chọn."
        );

        return;
    }

    const item =
    findCatalogGift(
        gift
    );

    if(!item){

        setText(
            box,
            "Không tìm thấy vật phẩm trong QuaTang."
        );

        return;
    }

    const rarity =
    displayValue(
        column(
            item,
            ["Độ hiếm"]
        )
    );

    const description =
    clean(
        column(
            item,
            ["Mô tả"]
        )
    );

    setText(
        box,

        rarity
        +
        (
            description
            ?
            " " +
            CHAR.DOT +
            " " +
            description
            :
            ""
        )
    );
}


/* =========================================================
   PAGINATION
========================================================= */

function getCurrentViewData(){

    if(
        currentView ===
        "search"
    ){
        return currentSearchResults;
    }

    if(
        currentView ===
        "student"
    ){
        return currentStudentResults;
    }

    return adminSortedWorks;
}


/*
   TẤT CẢ CÁC VIEW:
   MOBILE = 10
   WEB = 24
*/
function getCurrentPageSize(){

    return getResponsivePageSize();
}


function clampCurrentPage(){

    const data =
    getCurrentViewData();

    const pageSize =
    getCurrentPageSize();

    const pages =
    Math.max(
        1,
        Math.ceil(
            data.length /
            pageSize
        )
    );

    currentPage =
    Math.min(
        Math.max(
            currentPage,
            1
        ),
        pages
    );

    return pages;
}


function getPageItems(
    data,
    pageSize
){

    const pages =
    Math.max(
        1,
        Math.ceil(
            data.length /
            pageSize
        )
    );

    currentPage =
    Math.min(
        Math.max(
            currentPage,
            1
        ),
        pages
    );

    const start =
    (
        currentPage -
        1
    )
    *
    pageSize;

    return{

        items:
        data.slice(
            start,
            start +
            pageSize
        ),

        start:start,

        pages:pages
    };
}


/* =========================================================
   RENDER
========================================================= */

function renderCards(
    data,
    numberStart
){

    const grid =
    $("#tp18-grid");

    grid.innerHTML =
    "";

    $("#tp18-loading")
    .style.display =
    "none";

    $("#tp18-empty")
    .style.display =
    data.length
    ?
    "none"
    :
    "block";

    if(
        currentView ===
        "search" &&
        !data.length
    ){

        setText(
            $("#tp18-empty"),
            "Không tìm thấy học viên hoặc bài nộp phù hợp."
        );

    }else{

        setText(
            $("#tp18-empty"),
            "Chưa có tác phẩm."
        );
    }

    const fragment =
    document.createDocumentFragment();

    data.forEach(
        function(
            item,
            index
        ){

            fragment.appendChild(
                createCard(

                    item,

                    Number(
                        numberStart ||
                        1
                    )
                    +
                    index
                )
            );
        }
    );

    grid.appendChild(
        fragment
    );
}


/* =========================================================
   PAGER
========================================================= */

function createPageButton(
    label,
    page,
    current,
    disabled
){

    const button =
    document.createElement(
        "button"
    );

    button.type =
    "button";

    button.className =
    "tp18-page"
    +
    (
        current
        ?
        " current"
        :
        ""
    );

    setText(
        button,
        label
    );

    button.dataset.page =
    String(page);

    button.disabled =
    Boolean(disabled);

    return button;
}


function renderOnePager(element){

    element.innerHTML =
    "";

    if(!ADMIN_MODE){

        element.classList.remove(
            "on"
        );

        return;
    }

    const data =
    getCurrentViewData();

    const pageSize =
    getCurrentPageSize();

    const pages =
    Math.max(
        1,
        Math.ceil(
            data.length /
            pageSize
        )
    );

    currentPage =
    Math.min(
        Math.max(
            currentPage,
            1
        ),
        pages
    );

    if(
        !data.length
    ){

        element.classList.remove(
            "on"
        );

        return;
    }

    element.classList.add(
        "on"
    );

    const info =
    document.createElement(
        "div"
    );

    info.className =
    "tp18-page-info";

    const start =
    (
        currentPage -
        1
    )
    *
    pageSize
    +
    1;

    const end =
    Math.min(
        currentPage *
        pageSize,
        data.length
    );

    let infoText =
    "Trang " +
    currentPage +
    "/" +
    pages +
    " " +
    CHAR.DOT +
    " " +
    start +
    CHAR.DASH +
    end +
    " / " +
    data.length +
    " bài";

    if(
        currentView ===
        "latest"
    ){

        infoText +=
        " " +
        CHAR.DOT +
        " " +
        priorityCountCache +
        " bài đang ưu tiên";
    }

    if(
        pendingGrades.size
    ){

        infoText +=
        " " +
        CHAR.DOT +
        " " +
        UI.SYNC +
        " " +
        pendingGrades.size +
        " bài đang đồng bộ";
    }

    setText(
        info,
        infoText
    );

    element.appendChild(
        info
    );

    element.appendChild(
        createPageButton(

            CHAR.LEFT,

            currentPage - 1,

            false,

            currentPage === 1
        )
    );

    const visiblePages =
    [];

    for(
        let page=1;
        page<=pages;
        page++
    ){

        if(
            page === 1

            ||

            page === pages

            ||

            Math.abs(
                page -
                currentPage
            )
            <=
            2
        ){

            visiblePages.push(
                page
            );
        }
    }

    let previous =
    0;

    visiblePages.forEach(
        function(page){

            if(
                previous &&
                page -
                previous >
                1
            ){

                const dots =
                document.createElement(
                    "span"
                );

                setText(
                    dots,
                    CHAR.ELLIPSIS
                );

                element.appendChild(
                    dots
                );
            }

            element.appendChild(
                createPageButton(

                    String(page),

                    page,

                    page ===
                    currentPage,

                    false
                )
            );

            previous =
            page;
        }
    );

    element.appendChild(
        createPageButton(

            CHAR.RIGHT,

            currentPage + 1,

            false,

            currentPage ===
            pages
        )
    );
}


function renderPagers(){

    renderOnePager(
        $("#tp18-pages-top")
    );

    renderOnePager(
        $("#tp18-pages-bottom")
    );
}


/* =========================================================
   VIEWS
========================================================= */

function showLatest(){

    currentView =
    "latest";

    selectedStudentName =
    "";

    currentStudentResults =
    [];

    $("#tp18-student-bar")
    .classList.remove(
        "on"
    );

    const pageSize =
    getCurrentPageSize();

    if(ADMIN_MODE){

        setText(
            $("#tp18-title"),

            "Tác phẩm học viên " +
            CHAR.DOT +
            " GVCN"
        );

        setText(
            $("#tp18-subtitle"),

            "Chấm nhanh " +
            CHAR.DOT +
            " Đồng bộ an toàn " +
            CHAR.DOT +
            " Linh Thú " +
            CHAR.DOT +
            " Quà tặng " +
            CHAR.DOT +
            " Xoá bài"
        );

        const page =
        getPageItems(
            adminSortedWorks,
            pageSize
        );

        renderCards(
            page.items,
            page.start + 1
        );

    }else{

        setText(
            $("#tp18-title"),
            "Tác phẩm học viên"
        );

        const publicData =
        works
        .slice()
        .sort(
            newestSort
        )
        .slice(
            0,
            pageSize
        );

        renderCards(
            publicData,
            1
        );
    }

    renderPagers();

    updateSearchSummary();
}


function showSearchResults(){

    if(!ADMIN_MODE){
        return;
    }

    const query =
    clean(
        adminSearchQuery
    );

    if(!query){

        currentPage =
        1;

        showLatest();

        return;
    }

    currentView =
    "search";

    selectedStudentName =
    "";

    currentStudentResults =
    [];

    $("#tp18-student-bar")
    .classList.remove(
        "on"
    );

    const page =
    getPageItems(
        currentSearchResults,
        getCurrentPageSize()
    );

    setText(
        $("#tp18-title"),
        "Tìm học viên"
    );

    setText(
        $("#tp18-subtitle"),

        "Kết quả theo tên hoặc mã học viên " +
        CHAR.DOT +
        " " +
        currentSearchResults.length +
        " bài"
    );

    renderCards(
        page.items,
        page.start + 1
    );

    renderPagers();

    updateSearchSummary();
}


function buildCurrentStudentResults(
    name
){

    const target =
    normalize(
        name
    );

    currentStudentResults =
    works
    .filter(
        item =>
        item.__nameNorm ===
        target
    )
    .slice()
    .sort(
        newestSort
    );
}


function showStudent(name){

    currentView =
    "student";

    selectedStudentName =
    name;

    buildCurrentStudentResults(
        name
    );

    const page =
    getPageItems(
        currentStudentResults,
        getCurrentPageSize()
    );

    setText(
        $("#tp18-title"),

        "Tác phẩm của " +
        name
    );

    setText(
        $("#tp18-student-title"),

        UI.BOOKS +
        " " +
        name +
        " " +
        CHAR.DOT +
        " " +
        currentStudentResults.length +
        " tác phẩm"
    );

    $("#tp18-student-bar")
    .classList.add(
        "on"
    );

    renderCards(
        page.items,
        page.start + 1
    );

    renderPagers();
}


function restoreCurrentView(){

    if(
        currentView ===
        "search"

        &&

        clean(
            adminSearchQuery
        )
    ){

        showSearchResults();

        return;
    }

    if(
        currentView ===
        "student"

        &&

        selectedStudentName
    ){

        showStudent(
            selectedStudentName
        );

        return;
    }

    showLatest();
}


/* =========================================================
   STATUS
========================================================= */

function updateStatus(){

    const status =
    $("#tp18-status");

    status.className =
    "tp18-status on"
    +
    (
        sourceName ===
        "Form Responses 1"
        ?
        " warn"
        :
        ""
    );

    if(ADMIN_MODE){

        const prefix =
        sourceName ===
        "TacPhamWeb"
        ?
        CHAR.CHECK +
        " TacPhamWeb"
        :
        UI.WARNING +
        " Form Responses 1 dự phòng";

        let message =
        prefix
        +
        " " +
        CHAR.DOT +
        " " +
        works.length +
        " bài " +
        CHAR.DOT +
        " " +
        priorityCountCache +
        " bài đang cần ưu tiên";

        if(
            deletedSubmissionIds.size
        ){

            message +=
            " " +
            CHAR.DOT +
            " " +
            UI.TRASH +
            " " +
            deletedSubmissionIds.size +
            " bài đã xoá";
        }

        if(
            pendingGrades.size
        ){

            message +=
            " " +
            CHAR.DOT +
            " " +
            UI.SYNC +
            " " +
            pendingGrades.size +
            " bài đang đồng bộ";
        }

        if(
            gradeSendQueue.length
        ){

            message +=
            " " +
            CHAR.DOT +
            " " +
            gradeSendQueue.length +
            " bài trong hàng đợi gửi";
        }

        setText(
            status,
            message
        );

    }else{

        setText(
            status,

            "Đang hiển thị " +
            Math.min(
                getCurrentPageSize(),
                works.length
            )
            +
            " tác phẩm mới nhất."
        );
    }
}


/* =========================================================
   BUILD CACHE
========================================================= */

function buildAllRuntimeCaches(){

    prepareBaseWorkCache();

    buildLatestSubmissionMap();

    buildCatalogMaps();

    buildTeacherGiftStudentIndex();

    buildOwnershipMap();

    buildPriorityCache();

    buildSortedWorks();

    if(
        clean(
            adminSearchQuery
        )
    ){
        buildSearchResults();
    }

    if(
        selectedStudentName
    ){

        buildCurrentStudentResults(
            selectedStudentName
        );
    }
}


/* =========================================================
   LOAD DATA
========================================================= */

async function loadData(){

    try{

        const workResult =
        await loadWorkData();

        const deleteText =
        await safeFetchCSV(
            URLS.deleteLog
        );

        if(deleteText){

            deleteLogData =
            csvObjects(
                deleteText
            );

            buildDeletedSubmissionIds(
                deleteLogData
            );
        }

        const syncedDuringRefresh =
        reconcilePendingGradesWithRawData(

            workResult.data,

            false
        );

        let freshWorks =
        applyPendingGradesToRawWorks(
            workResult.data
        );

        freshWorks =
        filterDeletedWorks(
            freshWorks
        );

        works =
        freshWorks;

        sourceName =
        workResult.source;

        if(
            syncedDuringRefresh >
            0
        ){

            console.log(

                "V18.4 xác nhận thêm",

                syncedDuringRefresh,

                "bài chấm."
            );
        }

        const results =
        await Promise.all([

            safeFetchCSV(
                URLS.giftCatalog
            ),

            safeFetchCSV(
                URLS.exchanges
            ),

            safeFetchCSV(
                URLS.teacherGifts
            )
        ]);

        giftCatalog =
        results[0]
        ?
        csvObjects(
            results[0]
        )
        :
        [];

        exchangeData =
        results[1]
        ?
        csvObjects(
            results[1]
        )
        :
        [];

        teacherGiftData =
        results[2]
        ?
        csvObjects(
            results[2]
        )
        :
        [];

        buildAllRuntimeCaches();

        updateStatus();

        updateSearchSummary();

        clampCurrentPage();

        restoreCurrentView();

        if(
            pendingGrades.size
        ){

            scheduleGradeSyncCheck(
                GRADE_SYNC_INTERVAL
            );
        }

    }catch(error){

        $("#tp18-loading")
        .style.display =
        "none";

        $("#tp18-error")
        .style.display =
        "block";

        setText(
            $("#tp18-error"),

            "Không thể tải dữ liệu: " +
            (
                error.message ||
                error
            )
        );
    }
}


/* =========================================================
   INPUT
========================================================= */

document.addEventListener(
    "input",
    function(event){

        if(
            event.target.matches(
                ".tp18-score-input"
            )
        ){

            updateAdminScoreColor(
                event.target
            );

            return;
        }

        if(
            ADMIN_MODE

            &&

            event.target.id ===
            "tp18-search-input"
        ){

            adminSearchQuery =
            clean(
                event.target.value
            );

            currentPage =
            1;

            const clearButton =
            $("#tp18-search-clear");

            if(clearButton){

                clearButton.classList.toggle(

                    "on",

                    Boolean(
                        adminSearchQuery
                    )
                );
            }

            if(searchTimer){

                clearTimeout(
                    searchTimer
                );
            }

            if(
                !adminSearchQuery
            ){

                currentSearchResults =
                [];

                showLatest();

                return;
            }

            showSearchingState();

            searchTimer =
            setTimeout(
                function(){

                    buildSearchResults();

                    currentPage =
                    1;

                    showSearchResults();

                    searchTimer =
                    null;

                },
                SEARCH_DEBOUNCE_MS
            );
        }
    }
);


/* =========================================================
   CHANGE
========================================================= */

document.addEventListener(
    "change",
    function(event){

        if(
            ADMIN_MODE

            &&

            event.target.matches(
                ".tp18-gift-select"
            )
        ){

            updateGiftMeta(
                event.target
            );
        }
    }
);


/* =========================================================
   CLICK
========================================================= */

document.addEventListener(
    "click",
    function(event){

        /*
           ==================================================
           MỞ / ĐÓNG PHẦN GVCN TẶNG QUÀ
           ==================================================
        */

        const giftToggle =
        event.target.closest(
            ".tp18-admin-gift-toggle"
        );

        if(giftToggle){

            event.preventDefault();

            event.stopPropagation();

            const giftBox =
            giftToggle.closest(
                ".tp18-admin-gift"
            );

            if(!giftBox){
                return;
            }

            const isOpen =
            giftBox.classList.toggle(
                "open"
            );

            giftToggle.setAttribute(
                "aria-expanded",
                isOpen
                ?
                "true"
                :
                "false"
            );

            return;
        }


        /*
           XOÁ BÀI
        */

        const deleteButton =
        event.target.closest(
            ".tp18-delete"
        );

        if(deleteButton){

            event.preventDefault();

            event.stopPropagation();

            handleDelete(
                deleteButton
            );

            return;
        }


        /*
           CLEAR SEARCH
        */

        if(
            event.target.closest(
                "#tp18-search-clear"
            )
        ){

            clearAdminSearch();

            return;
        }


        /*
           GIVE GIFT
        */

        const giftButton =
        event.target.closest(
            ".tp18-give"
        );

        if(giftButton){

            handleGiveGift(
                giftButton
            );

            return;
        }


        /*
           GRADE
        */

        const gradeButton =
        event.target.closest(
            ".tp18-grade"
        );

        if(
            gradeButton

            &&

            gradeButton.id !==
            "tp18-back"
        ){

            if(!ADMIN_MODE){
                return;
            }

            handleGrade(
                gradeButton
            );

            return;
        }


        /*
           PAGE
        */

        const pageButton =
        event.target.closest(
            ".tp18-page"
        );

        if(
            ADMIN_MODE

            &&

            pageButton

            &&

            !pageButton.disabled
        ){

            currentPage =
            Number(
                pageButton.dataset.page
            );

            restoreCurrentView();

            const wrap =
            $("#tp18-wrap");

            if(wrap){

                window.scrollTo({

                    top:
                    wrap
                    .getBoundingClientRect()
                    .top
                    +
                    window.scrollY
                    -
                    15,

                    behavior:
                    "smooth"
                });
            }

            return;
        }


        /*
           BACK
        */

        if(
            event.target.closest(
                "#tp18-back"
            )
        ){

            if(
                ADMIN_MODE

                &&

                clean(
                    adminSearchQuery
                )
            ){

                currentPage =
                1;

                currentView =
                "search";

                showSearchResults();

            }else{

                currentPage =
                1;

                showLatest();
            }

            return;
        }


        /*
           STUDENT
        */

        const studentName =
        event.target.closest(
            ".tp18-name"
        );

        if(studentName){

            const card =
            studentName.closest(
                ".tp18-card"
            );

            if(card){

                currentPage =
                1;

                showStudent(
                    card.dataset.name
                );
            }
        }
    }
);


/* =========================================================
   RESPONSIVE PAGINATION UPDATE
========================================================= */

/*
   Nếu người dùng xoay điện thoại hoặc thay đổi kích thước
   trình duyệt qua mốc 600px thì tự chuyển giữa:
   10 bài <-> 24 bài.
*/

const pageSizeMedia =
window.matchMedia(
    "(max-width:600px)"
);

let lastMobileState =
pageSizeMedia.matches;


function handleResponsivePageChange(){

    const nextMobileState =
    pageSizeMedia.matches;

    if(
        nextMobileState ===
        lastMobileState
    ){
        return;
    }

    lastMobileState =
    nextMobileState;

    currentPage =
    1;

    if(started){

        restoreCurrentView();

        updateStatus();
    }
}


if(
    typeof pageSizeMedia.addEventListener ===
    "function"
){

    pageSizeMedia.addEventListener(
        "change",
        handleResponsivePageChange
    );

}else if(
    typeof pageSizeMedia.addListener ===
    "function"
){

    pageSizeMedia.addListener(
        handleResponsivePageChange
    );
}


/* =========================================================
   START
========================================================= */

function startPage(){

    $("#tp18-wrap")
    .classList.remove(
        "locked"
    );

    $("#tp18-admin-note")
    .classList.toggle(
        "on",
        ADMIN_MODE
    );

    $("#tp18-submit")
    .classList.toggle(
        "hidden",
        ADMIN_MODE
    );

    $("#tp18-admin-search")
    .classList.toggle(
        "on",
        ADMIN_MODE
    );

    if(ADMIN_MODE){

        setText(
            $("#tp18-admin-note"),

            UI.TOOL +
            " Chế độ GVCN " +
            CHAR.DOT +
            " V18.4 Reliable Grading " +
            CHAR.DOT +
            " Quà tặng " +
            CHAR.DOT +
            " Xoá bài"
        );

        setText(
            $("#tp18-search-icon"),
            UI.SEARCH
        );

        setText(
            $("#tp18-search-clear"),

            CHAR.CROSS +
            " Xóa"
        );
    }

    if(started){
        return;
    }

    started =
    true;

    loadData();

    setInterval(
        loadData,
        REFRESH_MS
    );
}


/* =========================================================
   ADMIN GATE
========================================================= */

function openGate(){

    if(!ADMIN_MODE){

        startPage();

        return;
    }

    const gate =
    document.createElement(
        "div"
    );

    gate.className =
    "tp18-gate";

    gate.innerHTML = `

        <div class="tp18-gate-box">

            <div class="tp18-gate-icon"></div>

            <h3>
                Khu vực GVCN
            </h3>

            <p>
                Nhập mã quản trị để chấm bài, tặng quà và quản lý bài nộp.
            </p>

            <input
                type="password"
                inputmode="numeric"
                autocomplete="off"
            >

            <button type="button">
                Mở trang quản trị
            </button>

            <div class="tp18-gate-error"></div>

        </div>
    `;

    document.body.appendChild(
        gate
    );

    setText(
        gate.querySelector(
            ".tp18-gate-icon"
        ),
        UI.LOCK
    );

    const input =
    gate.querySelector(
        "input"
    );

    const error =
    gate.querySelector(
        ".tp18-gate-error"
    );

    const verify =
    function(){

        if(
            input.value.trim()
            !==
            ADMIN_ACCESS_CODE
        ){

            setText(
                error,
                "Mã quản trị không đúng."
            );

            input.value =
            "";

            input.focus();

            return;
        }

        gate.remove();

        startPage();
    };

    gate.querySelector(
        "button"
    )
    .addEventListener(
        "click",
        verify
    );

    input.addEventListener(
        "keydown",
        function(event){

            if(
                event.key ===
                "Enter"
            ){
                verify();
            }
        }
    );

    input.focus();
}


/* =========================================================
   INIT
========================================================= */

openGate();

})();
