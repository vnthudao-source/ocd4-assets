/* =========================================================
   OCD4 · TRANG NỘP BÀI / TÁC PHẨM HỌC VIÊN · v1.7.0
   - Chỉ tải tab BaiMoiNhat (~80 bài mới nhất) thay vì toàn bộ TacPhamWeb.
   - Bài của chính học viên lấy riêng qua Reward Core (Apps Script lọc theo mã).
   - Không còn ô tra cứu: nhận diện học viên qua Minh Hồng / tài khoản.
   - Hiện ngay danh sách đã lưu lần trước, cập nhật ngầm sau.
========================================================= */
(function(){
"use strict";
/* =========================================================
   SINGLE START
========================================================= */
if(window.OCDStudentPublicWorkV170Loaded){
    return;
}
window.OCDStudentPublicWorkV170Loaded=true;
/* =========================================================
   CONFIG
========================================================= */
const CONFIG={
    version:"1.7.0",
    /* GIỚI HẠN BÌNH THƯỜNG (điện thoại và máy tính) */
    mobileLimit:10,
    desktopLimit:10,
    /* KÍNH VIỄN VỌNG */
    telescopeLimit:50,
    telescope:[
        "Kính viễn vọng"
    ],
    /* KÍNH NHÌN XUYÊN THẤU */
    glasses:[
        "Kính Nhìn Xuyên Thấu",
        "Kính Xuyên Thấu"
    ],
    warningDays:21,
    staleMs:
        5*60*1000,
    dailySubmitLimit:2,
    classPulseLimit:20,
    classPulseMaxEvents:6,
    sessionAutoSearch:true,
    sessionSource:
        "student-public-work",
    /* GOOGLE FORM NỘP BÀI - PREFILL */
    submitForm:{
        baseUrl:
            "https://docs.google.com/forms/d/e/1FAIpQLScfsWRNbv1h3XdJq1K_llPnkmmWOll480qRB5e8aWgvJj5eUw/viewform",
        entries:{
            name:"entry.1180428480",
            code:"entry.2003749470",
            group:"entry.228710484",
            course:"entry.1047156901",
            description:"entry.2115496671"
        }
    },
    studentRegistry:
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vRP5cc8duj1XrCXMrymo6Cj7aqIkWfX6bHxGeW-lXcSewfQXhM8fZ5rzbNIQ9mBeVuB8yYr_o1aBoYA/pub?gid=1603096683&single=true&output=csv",
    /* Tab BaiMoiNhat: ~80 bài mới nhất (công thức SORT/FILTER từ TacPhamWeb) */
    latestWorks:
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vRP5cc8duj1XrCXMrymo6Cj7aqIkWfX6bHxGeW-lXcSewfQXhM8fZ5rzbNIQ9mBeVuB8yYr_o1aBoYA/pub?gid=482486616&single=true&output=csv",
    /* Dự phòng khi BaiMoiNhat chưa xuất bản / lỗi: toàn bộ TacPhamWeb */
    works:
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vRP5cc8duj1XrCXMrymo6Cj7aqIkWfX6bHxGeW-lXcSewfQXhM8fZ5rzbNIQ9mBeVuB8yYr_o1aBoYA/pub?gid=1023688821&single=true&output=csv",
    latestMinRows:20,
    cacheKey:
        "ocdSwpLatest_v1",
    fallback:
        "https://docs.google.com/spreadsheets/d/1GJoTRsbq0kZfZrDdh0uCC667PwS3Bgkje2fHQnwnCKs/export?format=csv&gid=1837470623",
    deleteLog:
        "https://docs.google.com/spreadsheets/d/1GJoTRsbq0kZfZrDdh0uCC667PwS3Bgkje2fHQnwnCKs/export?format=csv&gid=521976322"
};
/* =========================================================
   UI
========================================================= */
const UI={
    user:
        String.fromCodePoint(0x1F464),
    image:
        String.fromCodePoint(0x1F5BC),
    gift:
        String.fromCodePoint(0x1F381),
    paw:
        String.fromCodePoint(0x1F43E),
    eye:
        String.fromCodePoint(0x1F441),
    lock:
        String.fromCodePoint(0x1F512),
    group:
        String.fromCodePoint(0x1F465),
    graduation:
        String.fromCodePoint(0x1F393),
    books:
        String.fromCodePoint(0x1F4DA),
    chart:
        String.fromCodePoint(0x1F4CA),
    gem:
        String.fromCodePoint(0x1F48E),
    submit:
        String.fromCodePoint(0x1F4DD),
    telescope:
        String.fromCodePoint(0x1F52D),
    up:
        String.fromCodePoint(0x25B2)
};
const CHAR={
    multiply:
        String.fromCodePoint(0x00D7),
    dot:
        String.fromCodePoint(0x00B7),
    dash:
        String.fromCodePoint(0x2014)
};
/* =========================================================
   STATE
========================================================= */
const state={
    RS:null,
    started:false,
    works:[],
    workMap:
        new Map(),
    deletedIds:
        new Set(),
    workHeader:[],
    workSourceRows:
        new Map(),
    giftMap:
        new Map(),
    accountMap:
        new Map(),
    accountPromiseMap:
        new Map(),
    studentRegistryMap:
        new Map(),
    studentRegistryPromise:null,
    legacyStudentMap:
        new Map(),
    legacyStudentPromise:null,
    currentStudent:null,
    currentAccount:null,
    /* KÍNH XUYÊN THẤU */
    hasGlasses:false,
    /* KÍNH VIỄN VỌNG */
    hasTelescope:false,
    publicPage:1,
    ownWorks:[],
    activePanel:"",
    latestLoadedAt:0,
    latestLoading:false,
    latestPromise:null,
    searching:false,
    initialSessionHandled:false,
    sessionSyncing:false,
    lastSessionSearchCode:"",
    classPulse:null,
    /* Bài của từng học viên (tải riêng, đầy đủ) */
    ownWorksMap:
        new Map(),
    ownHeaderMap:
        new Map(),
    ownPromiseMap:
        new Map(),
    latestSource:""
};
/* =========================================================
   BASIC
========================================================= */
function el(id){
    return document.getElementById(
        id
    );
}
function clean(v){
    return String(
        v===undefined||
        v===null
        ?
        ""
        :
        v
    ).trim();
}
function normalizeLocal(v){
    return clean(v)
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
function normalizeCode(v){
    if(
        state.RS &&
        typeof state.RS.normalizeCode===
        "function"
    ){
        return state.RS.normalizeCode(v);
    }
    return clean(v)
        .toUpperCase()
        .replace(
            /\s+/g,
            ""
        );
}
function normalizeReward(v){
    if(
        state.RS &&
        typeof state.RS.normalizeText===
        "function"
    ){
        return state.RS.normalizeText(v);
    }
    return normalizeLocal(v);
}
function numberText(v){
    if(
        state.RS &&
        typeof state.RS.formatNumber===
        "function"
    ){
        return state.RS.formatNumber(v);
    }
    const n=
        Number(v||0);
    return Number.isInteger(n)
        ?
        String(n)
        :
        String(
            Math.round(n*100)/100
        );
}
function showMessage(
    message,
    type
){
    const box=
        el("swpMessage");
    if(!box){
        return;
    }
    box.className=
        "swp-message "
        +
        (type||"");
    box.textContent=
        message;
}
/* =========================================================
   ICONS
========================================================= */
function initIcons(){
    const icons={
        swpGroupIcon:
            UI.group,
        swpCourseIcon:
            UI.graduation,
        swpSubmissionIcon:
            UI.books,
        swpLearningIcon:
            UI.chart,
        swpGemIcon:
            UI.gem,
        swpItemIcon:
            UI.gift,
        swpSubmitIcon:
            UI.submit,
        swpOwnToggleIcon:
            UI.books
    };
    Object.keys(
        icons
    ).forEach(
        function(id){
            const node=
                el(id);
            if(node){
                node.textContent=
                    icons[id];
            }
        }
    );
}
/* =========================================================
   CORE
   SINGLE SOURCE OF TRUTH
========================================================= */
function coreReady(){
    const RS=
        window.StudentRewardSystem;
    return Boolean(
        RS &&
        RS.version &&
        typeof RS.getStudentRewardProfile===
        "function" &&
        typeof RS.loadSharedRewardData===
        "function" &&
        typeof RS.normalizeCode===
        "function" &&
        typeof RS.fetchCSV===
        "function" &&
        typeof RS.parseCSV===
        "function"
    );
}
async function waitForCore(){
    if(coreReady()){
        state.RS=
            window.StudentRewardSystem;
        return state.RS;
    }
    for(
        let i=0;
        i<200;
        i++
    ){
        await new Promise(
            function(resolve){
                setTimeout(
                    resolve,
                    50
                );
            }
        );
        if(coreReady()){
            state.RS=
                window.StudentRewardSystem;
            return state.RS;
        }
    }
    throw new Error(
        "Không tải được OCD Reward Core dùng chung. Hãy kiểm tra gadget/widget Core."
    );
}
/* =========================================================
   CSV
========================================================= */
function parseCSV(text){
    const rows=[];
    let row=[];
    let value="";
    let quote=false;
    text=
        String(text||"")
        .replace(
            /^\uFEFF/,
            ""
        );
    for(
        let i=0;
        i<text.length;
        i++
    ){
        const c=
            text[i];
        if(c==='"'){
            if(
                quote &&
                text[i+1]==='"'
            ){
                value+='"';
                i++;
            }else{
                quote=
                    !quote;
            }
            continue;
        }
        if(
            c==="," &&
            !quote
        ){
            row.push(value);
            value="";
            continue;
        }
        if(
            (
                c==="\n" ||
                c==="\r"
            )
            &&
            !quote
        ){
            if(
                c==="\r" &&
                text[i+1]==="\n"
            ){
                i++;
            }
            row.push(value);
            if(
                row.some(
                    function(x){
                        return clean(x);
                    }
                )
            ){
                rows.push(row);
            }
            row=[];
            value="";
            continue;
        }
        value+=c;
    }
    if(
        value ||
        row.length
    ){
        row.push(value);
        if(
            row.some(
                function(x){
                    return clean(x);
                }
            )
        ){
            rows.push(row);
        }
    }
    return rows;
}
function csvObjects(text){
    const rows=
        parseCSV(text);
    if(
        rows.length<2
    ){
        return [];
    }
    const headers=
        rows[0].map(
            normalizeLocal
        );
    return rows
        .slice(1)
        .filter(
            function(row){
                return row.some(
                    function(cell){
                        return clean(cell);
                    }
                );
            }
        )
        .map(
            function(row,rowIndex){
                const item={
                    __rowIndex:
                        rowIndex+1,
                    __sourceRow:
                        row.slice()
                };
                headers.forEach(
                    function(header,index){
                        if(header){
                            item[header]=
                                row[index]||"";
                        }
                    }
                );
                return item;
            }
        );
}
function column(
    obj,
    aliases
){
    if(!obj){
        return "";
    }
    for(
        const alias of aliases
    ){
        const key=
            normalizeLocal(alias);
        if(
            Object.prototype
            .hasOwnProperty
            .call(
                obj,
                key
            )
        ){
            return obj[key];
        }
    }
    return "";
}
function csvCell(v){
    const s=
        String(
            v===undefined||
            v===null
            ?
            ""
            :
            v
        );
    return /[",\r\n]/.test(s)
        ?
        '"'
        +
        s.replace(
            /"/g,
            '""'
        )
        +
        '"'
        :
        s;
}
function rowsToCsv(rows){
    return (rows||[])
        .map(
            function(row){
                return (row||[])
                    .map(csvCell)
                    .join(",");
            }
        )
        .join("\r\n");
}
/* =========================================================
   FETCH
========================================================= */
async function fetchCSV(url){
    const response=
        await fetch(
            url,
            {
                cache:"no-cache"
            }
        );
    if(!response.ok){
        throw new Error(
            "HTTP "
            +
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
            "[Student Work]",
            error
        );
        return "";
    }
}
/* =========================================================
   DRIVE
========================================================= */
function driveId(v){
    const text=
        String(v||"");
    const patterns=[
        /\/file\/d\/([^/?&#]+)/i,
        /\/d\/([^/?&#]+)/i,
        /[?&]id=([^&#]+)/i
    ];
    for(
        const pattern of patterns
    ){
        const match=
            text.match(pattern);
        if(match){
            return match[1];
        }
    }
    return "";
}
function firstUrl(v){
    const match=
        String(v||"")
        .match(
            /https?:\/\/[^\s,]+/i
        );
    return match
        ?
        match[0]
        :
        "";
}
function imageUrl(
    v,
    size
){
    if(!v){
        return "";
    }
    if(
        state.RS &&
        typeof state.RS.convertDriveImageUrl===
        "function"
    ){
        return state.RS.convertDriveImageUrl(
            v,
            size||600
        );
    }
    const id=
        driveId(v);
    return id
        ?
        "https://drive.google.com/thumbnail?id="
        +
        encodeURIComponent(id)
        +
        "&sz=w"
        +
        (size||600)
        :
        v;
}
/* =========================================================
   TIME / ID
========================================================= */
function timeValue(v){
    const match=
        String(v||"")
        .match(
            /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})(?:[\s,]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/
        );
    if(!match){
        return Date.parse(v)||0;
    }
    return new Date(
        +match[3],
        +match[2]-1,
        +match[1],
        +(match[4]||0),
        +(match[5]||0),
        +(match[6]||0)
    ).getTime();
}
function compactTimestamp(v){
    const match=
        String(v||"")
        .match(
            /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})[\s,]+(\d{1,2}):(\d{2})(?::(\d{2}))?/
        );
    if(!match){
        return isoCompact(v);
    }
    const pad=
        function(x){
            return String(x)
                .padStart(
                    2,
                    "0"
                );
        };
    return match[3]
        +
        pad(match[2])
        +
        pad(match[1])
        +
        pad(match[4])
        +
        pad(match[5])
        +
        pad(match[6]||0);
}
/* Dữ liệu từ Apps Script có thể là chuỗi ngày ISO: đổi về giờ Việt Nam. */
function isoCompact(v){
    const t=
        Date.parse(
            String(v||"")
        );
    if(
        !t ||
        !/\d{4}-\d{2}-\d{2}T/.test(String(v||""))
    ){
        return "";
    }
    try{
        const parts={};
        new Intl.DateTimeFormat(
            "en-GB",
            {
                timeZone:"Asia/Ho_Chi_Minh",
                year:"numeric",
                month:"2-digit",
                day:"2-digit",
                hour:"2-digit",
                minute:"2-digit",
                second:"2-digit",
                hourCycle:"h23"
            }
        )
        .formatToParts(
            new Date(t)
        )
        .forEach(
            function(p){
                parts[p.type]=p.value;
            }
        );
        return parts.year+parts.month+parts.day+parts.hour+parts.minute+parts.second;
    }catch(error){
        return "";
    }
}
function submissionId(row){
    const existing=
        clean(
            column(
                row,
                ["Mã bài nộp"]
            )
        );
    if(existing){
        return existing;
    }
    const timestamp=
        column(
            row,
            ["Dấu thời gian"]
        );
    const code=
        clean(
            column(
                row,
                ["Mã học viên"]
            )
        );
    const file=
        column(
            row,
            ["Tải bài tập lên"]
        );
    return compactTimestamp(timestamp)
        +
        "|"
        +
        code
        +
        "|"
        +
        (
            driveId(file)
            ||
            clean(file)
        );
}
function buildDeletedIds(rows){
    const map=
        new Map();
    (rows||[])
    .forEach(
        function(row){
            const id=
                clean(
                    column(
                        row,
                        ["Mã bài nộp"]
                    )
                );
            if(!id){
                return;
            }
            const action=
                normalizeLocal(
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
                action==="restore"
            ){
                map.set(
                    id,
                    false
                );
                return;
            }
            if(
                !action
                ||
                action.includes("xoa")
                ||
                action==="delete"
            ){
                map.set(
                    id,
                    true
                );
            }
        }
    );
    state.deletedIds=
        new Set();
    map.forEach(
        function(deleted,id){
            if(deleted){
                state.deletedIds.add(
                    id
                );
            }
        }
    );
}
/* =========================================================
   WORKS
========================================================= */
function prepareWork(row){
    const timestamp=
        clean(
            column(
                row,
                ["Dấu thời gian"]
            )
        );
    const file=
        column(
            row,
            ["Tải bài tập lên"]
        );
    return{
        id:
            submissionId(row),
        code:
            clean(
                column(
                    row,
                    ["Mã học viên"]
                )
            ),
        name:
            clean(
                column(
                    row,
                    [
                        "Họ và tên",
                        "Họ tên"
                    ]
                )
            ),
        group:
            clean(
                column(
                    row,
                    ["Tổ"]
                )
            ),
        course:
            clean(
                column(
                    row,
                    [
                        "Khóa",
                        "Khoa"
                    ]
                )
            ),
        timestamp:
            timestamp,
        time:
            timeValue(timestamp),
        file:
            file,
        url:
            firstUrl(file),
        score:
            clean(
                column(
                    row,
                    [
                        "Điểm số",
                        "Điểm",
                        "Điểm giáo viên"
                    ]
                )
            ),
        comment:
            clean(
                column(
                    row,
                    [
                        "Nhận xét",
                        "Nhận xét GVCN"
                    ]
                )
            ),
        sourceRow:
            Array.isArray(
                row.__sourceRow
            )
            ?
            row.__sourceRow.slice()
            :
            []
    };
}
function rebuildWorkMap(){
    state.workMap=
        new Map();
    state.works.forEach(
        function(item){
            const code=
                normalizeCode(
                    item.code
                );
            if(!code){
                return;
            }
            if(
                !state.workMap.has(code)
            ){
                state.workMap.set(
                    code,
                    []
                );
            }
            state.workMap
                .get(code)
                .push(item);
        }
    );
    state.workMap.forEach(
        function(items){
            items.sort(
                function(a,b){
                    return b.time-a.time;
                }
            );
        }
    );
}
function studentWorks(code){
    const c=
        normalizeCode(code);
    if(
        state.ownWorksMap.has(c)
    ){
        return state.ownWorksMap.get(c);
    }
    return state.workMap.get(c)||[];
}
/* =========================================================
   BÀI CỦA MỘT HỌC VIÊN (đầy đủ, qua Reward Core)
========================================================= */
async function loadOwnWorks(code,force){
    const c=
        normalizeCode(code);
    if(!c){
        return [];
    }
    if(
        !force &&
        state.ownWorksMap.has(c)
    ){
        return state.ownWorksMap.get(c);
    }
    if(
        state.ownPromiseMap.has(c)
    ){
        return state.ownPromiseMap.get(c);
    }
    const promise=
        (async function(){
            await waitForCore();
            let text="";
            if(
                state.RS &&
                typeof state.RS.getStudentSubmissionsCsv===
                "function"
            ){
                text=
                    await state.RS.getStudentSubmissionsCsv(
                        c,
                        Boolean(force)
                    );
            }else{
                text=
                    await fetchCSV(
                        CONFIG.works
                    );
            }
            const rows=
                parseCSV(text);
            const items=
                csvObjects(text)
                .filter(
                    function(row){
                        return normalizeCode(
                            column(
                                row,
                                ["Mã học viên"]
                            )
                        )===c;
                    }
                )
                .filter(
                    function(row){
                        return !state.deletedIds.has(
                            submissionId(row)
                        );
                    }
                )
                .map(
                    prepareWork
                )
                .filter(
                    function(item){
                        return item.time>0;
                    }
                );
            items.sort(
                function(a,b){
                    return b.time-a.time;
                }
            );
            state.ownHeaderMap.set(
                c,
                rows[0]
                ?
                rows[0].slice()
                :
                []
            );
            state.ownWorksMap.set(
                c,
                items
            );
            return items;
        })()
        .finally(
            function(){
                state.ownPromiseMap.delete(c);
            }
        );
    state.ownPromiseMap.set(
        c,
        promise
    );
    return promise;
}
async function refreshOwnWorks(force){
    if(!state.currentStudent){
        return;
    }
    try{
        await loadOwnWorks(
            state.currentStudent.code,
            force
        );
        state.ownWorks=
            studentWorks(
                state.currentStudent.code
            );
        renderOwnWorks();
        updateSubmitAvailability();
    }catch(error){
        console.warn(
            "[Student Work] Own works:",
            error
        );
    }
}
function studentSubmissionCsv(code){
    const ownHeader=
        state.ownHeaderMap.get(
            normalizeCode(code)
        );
    const rows=[
        Array.isArray(ownHeader) &&
        ownHeader.length
        ?
        ownHeader
        :
        Array.isArray(
            state.workHeader
        )
        ?
        state.workHeader
        :
        []
    ];
    studentWorks(code)
        .forEach(
            function(item){
                if(
                    Array.isArray(
                        item.sourceRow
                    )
                    &&
                    item.sourceRow.length
                ){
                    rows.push(
                        item.sourceRow
                    );
                }
            }
        );
    return rowsToCsv(
        rows
    );
}
/* =========================================================
   LATEST WORKS
========================================================= */
function readLatestCache(){
    try{
        const raw=
            window.localStorage.getItem(
                CONFIG.cacheKey
            );
        if(!raw){
            return null;
        }
        const data=
            JSON.parse(raw);
        return(
            data &&
            typeof data.latest==="string"
        )
        ?
        data
        :
        null;
    }catch(error){
        return null;
    }
}
function writeLatestCache(latest,del){
    try{
        if(
            !latest ||
            latest.length>400000
        ){
            return;
        }
        window.localStorage.setItem(
            CONFIG.cacheKey,
            JSON.stringify({
                latest:latest,
                del:del||"",
                at:Date.now()
            })
        );
    }catch(error){}
}
/* Dựng danh sách bài mới từ CSV (BaiMoiNhat hoặc TacPhamWeb). */
function applyLatestText(text,deleteText){
    if(deleteText){
        buildDeletedIds(
            csvObjects(
                deleteText
            )
        );
    }else if(
        deleteText===null
    ){
        state.deletedIds=
            new Set();
    }
    const rows=
        parseCSV(text);
    state.workHeader=
        rows[0]
        ?
        rows[0].slice()
        :
        [];
    state.works=
        csvObjects(text)
        .filter(
            function(row){
                return !state.deletedIds.has(
                    submissionId(row)
                );
            }
        )
        .map(
            prepareWork
        )
        .filter(
            function(item){
                return item.time>0;
            }
        );
    state.works.sort(
        function(a,b){
            return b.time-a.time;
        }
    );
    rebuildWorkMap();
}
function afterLatestApplied(){
    if(
        state.currentStudent
    ){
        state.ownWorks=
            studentWorks(
                state.currentStudent.code
            );
        renderOwnWorks();
        updateSubmitAvailability();
    }
    renderLatest();
    buildClassPulse();
}
/* Hiện ngay danh sách lưu lần trước (nếu có) trong lúc chờ tải mới. */
function hydrateLatestFromCache(){
    const cached=
        readLatestCache();
    if(!cached){
        return false;
    }
    try{
        applyLatestText(
            cached.latest,
            cached.del||null
        );
        if(!state.works.length){
            return false;
        }
        state.latestSource=
            "cache";
        el("swpLoading")
            .classList
            .remove("visible");
        afterLatestApplied();
        return true;
    }catch(error){
        return false;
    }
}
async function fetchLatestText(){
    try{
        const text=
            await fetchCSV(
                CONFIG.latestWorks
            );
        if(
            csvObjects(text).length>=
            CONFIG.latestMinRows
            &&
            /m[aã] b[aà]i n[oộ]p/i.test(
                text.slice(0,600)
            )
        ){
            return{
                text:text,
                source:"BaiMoiNhat",
                small:true
            };
        }
        console.warn(
            "[Student Work] BaiMoiNhat chưa sẵn sàng (chưa xuất bản?) - dùng TacPhamWeb."
        );
    }catch(error){
        console.warn(
            "[Student Work] BaiMoiNhat:",
            error
        );
    }
    try{
        const text=
            await fetchCSV(
                CONFIG.works
            );
        if(
            csvObjects(text).length
        ){
            return{
                text:text,
                source:"TacPhamWeb",
                small:false
            };
        }
    }catch(error){
        console.warn(
            "[Student Work] Primary:",
            error
        );
    }
    return{
        text:
            await fetchCSV(
                CONFIG.fallback
            ),
        source:"Form Responses 1",
        small:false
    };
}
async function loadLatestWorks(){
    if(state.latestPromise){
        return state.latestPromise;
    }
    state.latestPromise=
        (async function(){
            if(state.latestLoading){
                return;
            }
            state.latestLoading=true;
            const showSpinner=
                !state.works.length;
            if(showSpinner){
                el("swpLoading")
                    .classList
                    .add("visible");
            }
            el("swpError")
                .classList
                .remove("visible");
            try{
                const results=
                    await Promise.all([
                        fetchLatestText(),
                        safeFetchCSV(
                            CONFIG.deleteLog
                        )
                    ]);
                const latest=
                    results[0];
                applyLatestText(
                    latest.text,
                    results[1]||null
                );
                state.latestSource=
                    latest.source;
                if(
                    latest.small
                ){
                    writeLatestCache(
                        latest.text,
                        results[1]||""
                    );
                }
                /* Bài trong danh sách mới có thể đã bị xoá: lọc lại bài riêng. */
                state.ownWorksMap.forEach(
                    function(items,code){
                        state.ownWorksMap.set(
                            code,
                            items.filter(
                                function(item){
                                    return !state.deletedIds.has(
                                        item.id
                                    );
                                }
                            )
                        );
                    }
                );
                state.latestLoadedAt=
                    Date.now();
                afterLatestApplied();
            }catch(error){
                console.error(
                    "[Student Work Latest]",
                    error
                );
                if(!state.works.length){
                    el("swpError")
                        .textContent=
                        "Không tải được danh sách tác phẩm: "
                        +
                        (
                            error.message
                            ||
                            error
                        );
                    el("swpError")
                        .classList
                        .add("visible");
                }
            }finally{
                state.latestLoading=false;
                el("swpLoading")
                    .classList
                    .remove("visible");
            }
        })()
        .finally(
            function(){
                state.latestPromise=null;
            }
        );
    return state.latestPromise;
}
/* =========================================================
   CORE CATALOG
========================================================= */
async function ensureCoreCatalog(force){
    await waitForCore();
    const shared=
        await state.RS
        .loadSharedRewardData(
            Boolean(force)
        );
    state.giftMap=
        new Map();
    if(
        shared &&
        Array.isArray(
            shared.gifts
        )
    ){
        shared.gifts.forEach(
            function(gift){
                if(
                    gift &&
                    gift.name
                ){
                    state.giftMap.set(
                        normalizeReward(
                            gift.name
                        ),
                        gift
                    );
                }
            }
        );
    }
    return shared;
}
function canonicalGift(name){
    return state.giftMap.get(
        normalizeReward(name)
    )||null;
}
/* =========================================================
   CANONICAL ACCOUNT
========================================================= */
function itemName(item){
    return clean(
        item &&
        (
            item.giftName
            ||
            item.name
            ||
            (
                item.gift &&
                item.gift.name
            )
        )
    );
}
function itemQuantity(item){
    return Math.max(
        1,
        Math.floor(
            Number(
                item &&
                item.quantity
                ||
                1
            )
            ||
            1
        )
    );
}
function groupItems(items){
    const map=
        new Map();
    (items||[])
        .forEach(
            function(item){
                const name=
                    itemName(item);
                const key=
                    normalizeReward(name);
                if(!key){
                    return;
                }
                if(
                    !map.has(key)
                ){
                    map.set(
                        key,
                        {
                            name:name,
                            quantity:0,
                            raw:item
                        }
                    );
                }
                map.get(key).quantity+=
                    itemQuantity(item);
            }
        );
    return Array.from(
        map.values()
    );
}
function ownsGift(
    items,
    names
){
    const wanted=
        (
            Array.isArray(names)
            ?
            names
            :
            [names]
        )
        .map(
            normalizeReward
        );
    return (items||[])
        .some(
            function(item){
                return wanted.includes(
                    normalizeReward(
                        itemName(item)
                    )
                );
            }
        );
}
function isBeast(name){
    return normalizeReward(name)
        .includes(
            "linh thu"
        );
}
function isGem(item){
    const name=
        itemName(item);
    const gift=
        canonicalGift(name);
    if(
        gift &&
        state.RS &&
        typeof state.RS.isGemRewardGift===
        "function"
    ){
        try{
            if(
                state.RS.isGemRewardGift(
                    gift
                )
            ){
                return true;
            }
        }catch(error){}
    }
    const key=
        normalizeReward(name);
    return[
        "hoang ngoc",
        "hai lam ngoc",
        "thach anh tim",
        "lam bao thach",
        "luc thach",
        "hong ngoc",
        "linh thach"
    ].includes(key);
}
function normalizeCanonicalAccount(profile){
    const ownedItems=
        Array.isArray(
            profile &&
            profile.ownedItems
        )
        ?
        profile.ownedItems
        :
        [];
    let gems={};
    if(
        profile &&
        profile.gems &&
        typeof profile.gems==="object"
    ){
        gems=
            profile.gems;
    }else if(
        profile &&
        profile.balance &&
        typeof profile.balance==="object"
    ){
        gems=
            profile.balance;
    }else if(
        profile &&
        profile.rewardData &&
        profile.rewardData.gems &&
        typeof profile.rewardData.gems==="object"
    ){
        gems=
            profile.rewardData.gems;
    }
    return{
        profile:
            profile,
        gems:
            gems,
        ownedItems:
            ownedItems,
        avatar:
            typeof state.RS.getProfileAvatar === "function"
                ? state.RS.getProfileAvatar(ownedItems)
                : "",
        frame:
            typeof state.RS.getProfileAvatarFrame === "function"
                ? state.RS.getProfileAvatarFrame(ownedItems)
                : "",
        background:
            typeof state.RS.getProfileBackground === "function"
                ? state.RS.getProfileBackground(ownedItems)
                : "",
        multitask:
            typeof state.RS.hasMultitaskPotion === "function"
                ? Boolean(state.RS.hasMultitaskPotion(ownedItems))
                : false,
        /* KÍNH NHÌN XUYÊN THẤU */
        glasses:
            ownsGift(
                ownedItems,
                CONFIG.glasses
            ),
        /* KÍNH VIỄN VỌNG */
        telescope:
            ownsGift(
                ownedItems,
                CONFIG.telescope
            )
    };
}
async function getAccount(
    code,
    force
){
    const normalized=
        normalizeCode(code);
    if(!normalized){
        return null;
    }
    if(
        !force &&
        state.accountMap.has(
            normalized
        )
    ){
        return state.accountMap.get(
            normalized
        );
    }
    if(
        !force &&
        state.accountPromiseMap.has(
            normalized
        )
    ){
        return state.accountPromiseMap.get(
            normalized
        );
    }
    const promise=
        (async function(){
            await ensureCoreCatalog(
                Boolean(force)
            );
            const profile=
                await state.RS
                .getStudentRewardProfile(
                    normalized,
                    studentSubmissionCsv(
                        normalized
                    ),
                    Boolean(force)
                );
            if(!profile){
                throw new Error(
                    "Core không trả về hồ sơ tài sản."
                );
            }
            const account=
                normalizeCanonicalAccount(
                    profile
                );
            state.accountMap.set(
                normalized,
                account
            );
            return account;
        })()
        .finally(
            function(){
                state.accountPromiseMap.delete(
                    normalized
                );
            }
        );
    state.accountPromiseMap.set(
        normalized,
        promise
    );
    return promise;
}
/* =========================================================
   STUDENT MASTER
========================================================= */
async function loadStudentRegistry(force){
    if(
        state.studentRegistryMap.size &&
        !force
    ){
        return state.studentRegistryMap;
    }
    if(
        state.studentRegistryPromise
    ){
        return state.studentRegistryPromise;
    }
    state.studentRegistryPromise=
        (async function(){
            await waitForCore();
            const rows=
                state.RS.parseCSV(
                    await state.RS.fetchCSV(
                        CONFIG.studentRegistry
                    )
                );
            const map=
                new Map();
            if(
                !rows ||
                rows.length<2
            ){
                state.studentRegistryMap=
                    map;
                return map;
            }
            const h=
                rows[0].map(
                    state.RS.normalizeText
                );
            const codeCol=
                state.RS.findColumn(
                    h,
                    [
                        "mã học viên",
                        "ma hoc vien"
                    ]
                );
            const nameCol=
                state.RS.findColumn(
                    h,
                    [
                        "họ và tên",
                        "ho va ten",
                        "họ tên",
                        "ho ten"
                    ]
                );
            const groupCol=
                state.RS.findColumn(
                    h,
                    [
                        "tổ",
                        "to"
                    ]
                );
            const courseCol=
                state.RS.findColumn(
                    h,
                    [
                        "khóa",
                        "khoa"
                    ]
                );
            const statusCol=
                state.RS.findColumn(
                    h,
                    [
                        "trạng thái",
                        "trang thai"
                    ]
                );
            const activationCol=
                state.RS.findColumn(
                    h,
                    [
                        "ngày kích hoạt",
                        "ngay kich hoat"
                    ]
                );
            if(codeCol<0){
                state.studentRegistryMap=
                    map;
                return map;
            }
            for(
                let i=1;
                i<rows.length;
                i++
            ){
                const code=
                    normalizeCode(
                        rows[i][codeCol]
                    );
                if(!code){
                    continue;
                }
                map.set(
                    code,
                    {
                        code:
                            code,
                        name:
                            nameCol>=0
                            ?
                            clean(
                                rows[i][nameCol]
                            )
                            ||
                            code
                            :
                            code,
                        group:
                            groupCol>=0
                            ?
                            clean(
                                rows[i][groupCol]
                            )
                            :
                            "",
                        course:
                            courseCol>=0
                            ?
                            clean(
                                rows[i][courseCol]
                            )
                            :
                            "",
                        status:
                            statusCol>=0
                            ?
                            clean(
                                rows[i][statusCol]
                            ).toUpperCase()
                            :
                            "",
                        activationDate:
                            activationCol>=0
                            ?
                            clean(
                                rows[i][activationCol]
                            )
                            :
                            "",
                        identitySource:
                            "HocVien"
                    }
                );
            }
            state.studentRegistryMap=
                map;
            return map;
        })()
        .finally(
            function(){
                state.studentRegistryPromise=null;
            }
        );
    return state.studentRegistryPromise;
}
async function loadLegacyStudents(){
    if(
        state.legacyStudentMap.size
    ){
        return state.legacyStudentMap;
    }
    if(
        state.legacyStudentPromise
    ){
        return state.legacyStudentPromise;
    }
    state.legacyStudentPromise=
        (async function(){
            await waitForCore();
            const rows=
                state.RS.parseCSV(
                    await state.RS.fetchCSV(
                        state.RS.CONFIG.studentCsv
                    )
                );
            const map=
                new Map();
            if(
                !rows ||
                rows.length<2
            ){
                state.legacyStudentMap=
                    map;
                return map;
            }
            const h=
                rows[0].map(
                    state.RS.normalizeText
                );
            const codeCol=
                state.RS.findColumn(
                    h,
                    [
                        "mã học viên",
                        "ma hoc vien"
                    ]
                );
            const nameCol=
                state.RS.findColumn(
                    h,
                    [
                        "họ và tên",
                        "ho va ten",
                        "họ tên",
                        "ho ten"
                    ]
                );
            const groupCol=
                state.RS.findColumn(
                    h,
                    [
                        "tổ",
                        "to"
                    ]
                );
            const courseCol=
                state.RS.findColumn(
                    h,
                    [
                        "khóa",
                        "khoa"
                    ]
                );
            if(codeCol<0){
                state.legacyStudentMap=
                    map;
                return map;
            }
            for(
                let i=1;
                i<rows.length;
                i++
            ){
                const code=
                    normalizeCode(
                        rows[i][codeCol]
                    );
                if(
                    !code ||
                    map.has(code)
                ){
                    continue;
                }
                map.set(
                    code,
                    {
                        code:
                            code,
                        name:
                            nameCol>=0
                            ?
                            clean(
                                rows[i][nameCol]
                            )
                            ||
                            code
                            :
                            code,
                        group:
                            groupCol>=0
                            ?
                            clean(
                                rows[i][groupCol]
                            )
                            :
                            "",
                        course:
                            courseCol>=0
                            ?
                            clean(
                                rows[i][courseCol]
                            )
                            :
                            "",
                        status:
                            "LEGACY",
                        identitySource:
                            "legacy"
                    }
                );
            }
            state.legacyStudentMap=
                map;
            return map;
        })()
        .finally(
            function(){
                state.legacyStudentPromise=null;
            }
        );
    return state.legacyStudentPromise;
}
function getStudentStatusError(
    student
){
    if(
        !student ||
        student.identitySource!==
        "HocVien"
    ){
        return "";
    }
    const status=
        clean(
            student.status
        ).toUpperCase();
    if(
        !status ||
        status==="ACTIVE"
    ){
        return "";
    }
    if(status==="PENDING"){
        return "Mã học viên chưa được kích hoạt.";
    }
    if(status==="PAUSED"){
        return "Tài khoản học viên đang tạm dừng.";
    }
    if(status==="GRADUATED"){
        return "Học viên đã tốt nghiệp.";
    }
    return "Tài khoản học viên hiện không hoạt động.";
}
async function findStudent(code){
    code=
        normalizeCode(code);
    if(!code){
        return null;
    }
    const registry=
        await loadStudentRegistry(
            false
        );
    if(
        registry.has(code)
    ){
        return registry.get(code);
    }
    const legacy=
        await loadLegacyStudents();
    return legacy.get(code)||null;
}
/* =========================================================
   SCORE / STATUS
========================================================= */
function parseScore(v){
    if(
        state.RS &&
        typeof state.RS.parseScore===
        "function"
    ){
        return state.RS.parseScore(v);
    }
    const n=
        Number(
            clean(v)
            .replace(
                ",",
                "."
            )
        );
    return Number.isFinite(n)
        ?
        n
        :
        null;
}
function averageScore(works){
    let total=0;
    let count=0;
    (works||[])
        .forEach(
            function(item){
                const score=
                    parseScore(
                        item.score
                    );
                if(score!==null){
                    total+=score;
                    count++;
                }
            }
        );
    return count
        ?
        Math.round(
            total/count*100
        )/100
        :
        0;
}
function learningStatus(works){
    if(!works.length){
        return{
            type:"warning",
            title:
                "CHƯA CÓ BÀI NỘP HỢP LỆ",
            detail:
                "Hồ sơ đã được xác minh. Hiện chưa có bài nộp hợp lệ."
        };
    }
    const latest=
        works[0];
    const days=
        Math.max(
            0,
            Math.floor(
                (
                    Date.now()
                    -
                    latest.time
                )
                /
                86400000
            )
        );
    if(
        days>
        CONFIG.warningDays
    ){
        return{
            type:"danger",
            title:
                "CẢNH BÁO: ĐÃ QUÁ 21 NGÀY CHƯA NỘP BÀI MỚI",
            detail:
                "Bài gần nhất: "
                +
                latest.timestamp
                +
                "."
        };
    }
    if(
        days===
        CONFIG.warningDays
    ){
        return{
            type:"warning",
            title:
                "NHẮC NHỞ: ĐÃ 21 NGÀY CHƯA NỘP BÀI MỚI",
            detail:
                "Bài gần nhất: "
                +
                latest.timestamp
                +
                "."
        };
    }
    return{
        type:"safe",
        title:
            "TRẠNG THÁI NỘP BÀI: TỐT",
        detail:
            "Bài gần nhất: "
            +
            latest.timestamp
            +
            ". Còn "
            +
            (
                CONFIG.warningDays
                -
                days
            )
            +
            " ngày trước khi cảnh báo."
    };
}
/* =========================================================
   GOOGLE FORM NỘP BÀI - PREFILL
========================================================= */
function buildSubmitFormUrl(student){
    if(!student){ return CONFIG.submitForm.baseUrl; }
    const url=new URL(CONFIG.submitForm.baseUrl);
    const entries=CONFIG.submitForm.entries;
    url.searchParams.set("usp","pp_url");
    url.searchParams.set(entries.name,clean(student.name));
    url.searchParams.set(entries.code,normalizeCode(student.code));
    url.searchParams.set(entries.group,clean(student.group));
    url.searchParams.set(entries.course,clean(student.course));
    /* Mô tả bài tập không tự điền; học viên nhập T1/T2/T3/VPTB... */
    return url.toString();
}
function updateSubmitFormLink(){
    const link=el("swpSubmitLink");
    if(!link){ return ""; }
    link.href=state.currentStudent?buildSubmitFormUrl(state.currentStudent):CONFIG.submitForm.baseUrl;
    return link.href;
}
function submissionDateKey(value){
    const text=clean(value);
    const match=text.match(
        /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/
    );
    if(match){
        const pad=function(part){
            return String(part).padStart(2,"0");
        };
        return match[3]+"-"+pad(match[2])+"-"+pad(match[1]);
    }
    const parsed=timeValue(text);
    if(!parsed){
        return "";
    }
    const parts=new Intl.DateTimeFormat(
        "en-CA",
        {
            timeZone:"Asia/Ho_Chi_Minh",
            year:"numeric",
            month:"2-digit",
            day:"2-digit"
        }
    ).formatToParts(new Date(parsed));
    const values={};
    parts.forEach(function(part){
        if(part.type!=="literal"){
            values[part.type]=part.value;
        }
    });
    return values.year+"-"+values.month+"-"+values.day;
}

function todayVietnamDateKey(){
    const parts=new Intl.DateTimeFormat(
        "en-CA",
        {
            timeZone:"Asia/Ho_Chi_Minh",
            year:"numeric",
            month:"2-digit",
            day:"2-digit"
        }
    ).formatToParts(new Date());
    const values={};
    parts.forEach(function(part){
        if(part.type!=="literal"){
            values[part.type]=part.value;
        }
    });
    return values.year+"-"+values.month+"-"+values.day;
}

function todaySubmissionCount(student){
    if(!student){
        return 0;
    }
    const code=normalizeCode(student.code);
    const items=studentWorks(code);
    const today=todayVietnamDateKey();
    return items.filter(function(item){
        return submissionDateKey(item.timestamp)===today;
    }).length;
}

function updateSubmitAvailability(){
    const wrap=el("swpSubmit");
    const link=el("swpSubmitLink");
    const notice=el("swpSubmitLimit");
    if(!wrap||!link){
        return;
    }
    const locked=
        Boolean(state.currentStudent) &&
        todaySubmissionCount(state.currentStudent)>=CONFIG.dailySubmitLimit;
    link.classList.toggle("is-hidden",locked);
    link.setAttribute("aria-hidden",locked?"true":"false");
    link.tabIndex=locked?-1:0;
    if(notice){
        notice.classList.toggle("visible",locked);
    }
}

function openSubmitForm(event){
    if(event){ event.preventDefault(); }
    if(!state.currentStudent){
        showMessage("Vui lòng nhận diện qua biểu tượng Minh Hồng trước khi nộp bài.","error");
        return;
    }
    if(
        todaySubmissionCount(state.currentStudent)>=
        CONFIG.dailySubmitLimit
    ){
        updateSubmitAvailability();
        return;
    }
    window.open(buildSubmitFormUrl(state.currentStudent),"_blank","noopener,noreferrer");
}


/* =========================================================
   SESSION / MINH HỒNG
========================================================= */
function getStudentSession(){
    const session=
        window.OCDStudentSession;
    return(
        session &&
        typeof session==="object"
    )
    ?
    session
    :
    null;
}
function getStudentSessionState(){
    const session=
        getStudentSession();
    if(
        !session ||
        typeof session.getState!==
        "function"
    ){
        return null;
    }
    try{
        return session.getState();
    }catch(error){
        return null;
    }
}
function confirmStudentSession(code){
    const session=
        getStudentSession();
    if(
        !session ||
        typeof session.confirmStudent!==
        "function"
    ){
        return false;
    }
    const current=
        getStudentSessionState();
    const wanted=
        normalizeCode(code);
    if(
        current &&
        current.code &&
        normalizeCode(
            current.code
        )!==wanted
    ){
        return false;
    }
    try{
        state.sessionSyncing=true;
        session.confirmStudent(
            wanted,
            CONFIG.sessionSource
        );
        return true;
    }catch(error){
        return false;
    }finally{
        state.sessionSyncing=false;
    }
}
function getMinhHongContext(){
    const api=
        window.OCDMinhHongContext;
    return(
        api &&
        typeof api==="object"
    )
    ?
    api
    :
    null;
}
function clearMinhHongContext(){
    const api=
        getMinhHongContext();
    if(
        !api ||
        typeof api.clear!==
        "function"
    ){
        return false;
    }
    try{
        api.clear(
            "tac-pham"
        );
        return true;
    }catch(error){
        return false;
    }
}
function latestTeacherComment(
    works
){
    for(
        const item of works||[]
    ){
        const comment=
            clean(
                item &&
                item.comment
            );
        if(comment){
            return{
                comment:
                    comment,
                timestamp:
                    clean(
                        item.timestamp
                    ),
                score:
                    clean(
                        item.score
                    )
            };
        }
    }
    return{
        comment:"",
        timestamp:"",
        score:""
    };
}
function buildMinhHongContextPayload(){
    const student=
        state.currentStudent;
    if(!student){
        return null;
    }
    const code=
        normalizeCode(
            student.code
        );
    const works=
        state.ownWorks||[];
    const latest=
        works[0]||null;
    const teacher=
        latestTeacherComment(
            works
        );
    const learning=
        learningStatus(
            works
        );
    const pulse=
        state.classPulse;
    const currentGroup=
        pulse &&
        pulse.currentGroup
        ?
        pulse.currentGroup
        :
        null;
    return{
        page:
            "TacPham",
        studentCode:
            code,
        data:{
            studentName:
                clean(
                    student.name
                ),
            group:
                clean(
                    student.group
                ),
            course:
                clean(
                    student.course
                ),
            ownWorkCount:
                works.length,
            averageScore:
                averageScore(
                    works
                ),
            latestSubmissionTime:
                latest
                ?
                clean(
                    latest.timestamp
                )
                :
                "",
            latestTeacherComment:
                teacher.comment,
            latestTeacherCommentTime:
                teacher.timestamp,
            latestScore:
                latest
                ?
                clean(
                    latest.score
                )
                :
                "",
            teamNewWorkCount:
                currentGroup
                ?
                Number(
                    currentGroup.submissionCount
                    ||
                    0
                )
                :
                0,
            teamReviewedCount:
                currentGroup
                ?
                Number(
                    currentGroup.reviewedCount
                    ||
                    0
                )
                :
                0,
            recentSampleSize:
                pulse
                ?
                Number(
                    pulse.sampleSize
                    ||
                    0
                )
                :
                0,
            recentGradedCount:
                pulse
                ?
                Number(
                    pulse.scoredCount
                    ||
                    0
                )
                :
                0,
            recentCommentedCount:
                pulse
                ?
                Number(
                    pulse.commentedCount
                    ||
                    0
                )
                :
                0,
            learningStatus:
                clean(
                    learning.title
                ),
            hasTelescope:
                Boolean(
                    state.hasTelescope
                )
        },
        conditions:{
            no_work:
                works.length===0,
            has_work:
                works.length>0,
            has_teacher_comment:
                Boolean(
                    teacher.comment
                ),
            team_has_new_work:
                Boolean(
                    currentGroup &&
                    currentGroup.submissionCount>0
                ),
            team_has_reviewed_work:
                Boolean(
                    currentGroup &&
                    currentGroup.reviewedCount>0
                ),
            submission_warning:
                learning.type==="warning"
                ||
                learning.type==="danger",
            has_telescope:
                Boolean(
                    state.hasTelescope
                )
        }
    };
}
function syncMinhHongContext(
    attempt
){
    attempt=
        Number(
            attempt||0
        );
    const payload=
        buildMinhHongContextPayload();
    if(!payload){
        return false;
    }
    const api=
        getMinhHongContext();
    if(
        !api ||
        typeof api.set!==
        "function"
    ){
        if(attempt<12){
            setTimeout(
                function(){
                    syncMinhHongContext(
                        attempt+1
                    );
                },
                250
            );
        }
        return false;
    }
    try{
        api.set(
            payload,
            "tac-pham"
        );
        return true;
    }catch(error){
        return false;
    }
}
/* =========================================================
   CLASS PULSE
========================================================= */
function classPulseKey(
    group,
    course
){
    return normalizeLocal(group)
        +
        "|"
        +
        normalizeLocal(course);
}
function classPulseLabel(
    group,
    course
){
    const parts=[];
    if(group){
        parts.push(
            "Tổ "
            +
            group
        );
    }
    if(course){
        parts.push(
            "Khóa "
            +
            course
        );
    }
    return parts.join(
        " "
        +
        CHAR.dot
        +
        " "
    )
    ||
    "Nhóm học viên";
}
function getCurrentPulseStudent(){
    const session=
        getStudentSessionState();
    if(
        session &&
        session.mode==="student" &&
        session.verified &&
        session.code &&
        state.currentStudent &&
        normalizeCode(
            state.currentStudent.code
        )===
        normalizeCode(
            session.code
        )
    ){
        return state.currentStudent;
    }
    return null;
}
function buildClassPulse(){
    /*
       Kính viễn vọng KHÔNG thay đổi Class Pulse.
       Pulse vẫn lấy 20 bài như v1.5.0.
    */
    const latest=
        state.works.slice(
            0,
            CONFIG.classPulseLimit
        );
    const groups=
        new Map();
    let scoredCount=0;
    let commentedCount=0;
    let reviewedCount=0;
    latest.forEach(
        function(item){
            const group=
                clean(
                    item.group
                );
            const course=
                clean(
                    item.course
                );
            const key=
                classPulseKey(
                    group,
                    course
                );
            if(
                !groups.has(key)
            ){
                groups.set(
                    key,
                    {
                        key:
                            key,
                        group:
                            group,
                        course:
                            course,
                        label:
                            classPulseLabel(
                                group,
                                course
                            ),
                        submissionCount:0,
                        scoredCount:0,
                        commentedCount:0,
                        reviewedCount:0,
                        studentCodes:
                            new Set(),
                        studentNames:
                            new Set(),
                        newestTime:0,
                        newestTimestamp:""
                    }
                );
            }
            const bucket=
                groups.get(key);
            bucket.submissionCount++;
            if(item.code){
                bucket.studentCodes.add(
                    normalizeCode(
                        item.code
                    )
                );
            }
            if(item.name){
                bucket.studentNames.add(
                    item.name
                );
            }
            const hasScore=
                clean(
                    item.score
                )!=="";
            const hasComment=
                clean(
                    item.comment
                )!=="";
            if(hasScore){
                scoredCount++;
                bucket.scoredCount++;
            }
            if(hasComment){
                commentedCount++;
                bucket.commentedCount++;
            }
            if(
                hasScore ||
                hasComment
            ){
                reviewedCount++;
                bucket.reviewedCount++;
            }
            if(
                item.time>
                bucket.newestTime
            ){
                bucket.newestTime=
                    item.time;
                bucket.newestTimestamp=
                    item.timestamp;
            }
        }
    );
    let groupStats=
        Array.from(
            groups.values()
        )
        .map(
            function(bucket){
                return{
                    key:
                        bucket.key,
                    group:
                        bucket.group,
                    course:
                        bucket.course,
                    label:
                        bucket.label,
                    submissionCount:
                        bucket.submissionCount,
                    studentCount:
                        bucket.studentCodes.size
                        ||
                        bucket.studentNames.size,
                    scoredCount:
                        bucket.scoredCount,
                    commentedCount:
                        bucket.commentedCount,
                    reviewedCount:
                        bucket.reviewedCount,
                    newestTime:
                        bucket.newestTime,
                    newestTimestamp:
                        bucket.newestTimestamp
                };
            }
        );
    groupStats.sort(
        function(a,b){
            if(
                b.submissionCount!==
                a.submissionCount
            ){
                return b.submissionCount
                    -
                    a.submissionCount;
            }
            return b.newestTime
                -
                a.newestTime;
        }
    );
    const currentStudent=
        getCurrentPulseStudent();
    const currentGroup=
        currentStudent
        ?
        (
            groupStats.find(
                function(item){
                    return item.key===
                        classPulseKey(
                            currentStudent.group,
                            currentStudent.course
                        );
                }
            )
            ||
            null
        )
        :
        null;
    const events=[];
    if(currentGroup){
        events.push({
            id:
                "class-pulse-own-"
                +
                currentGroup.key,
            type:
                "class-pulse",
            subtype:
                "own-group",
            priority:
                100,
            group:
                currentGroup.group,
            course:
                currentGroup.course,
            count:
                currentGroup.submissionCount,
            title:
                currentGroup.label,
            text:
                "Tổ của bạn có "
                +
                currentGroup.submissionCount
                +
                " bài trong "
                +
                latest.length
                +
                " bài nộp mới nhất.",
            timestamp:
                currentGroup.newestTimestamp,
            time:
                currentGroup.newestTime
        });
        if(
            currentGroup.reviewedCount>0
        ){
            events.push({
                id:
                    "class-pulse-own-review-"
                    +
                    currentGroup.key,
                type:
                    "class-pulse",
                subtype:
                    "own-reviewed",
                priority:
                    95,
                group:
                    currentGroup.group,
                course:
                    currentGroup.course,
                count:
                    currentGroup.reviewedCount,
                title:
                    currentGroup.label,
                text:
                    "Trong các bài mới của tổ bạn có "
                    +
                    currentGroup.reviewedCount
                    +
                    " bài đã có điểm hoặc nhận xét GVCN.",
                timestamp:
                    currentGroup.newestTimestamp,
                time:
                    currentGroup.newestTime
            });
        }
    }
    groupStats.forEach(
        function(item){
            if(
                currentGroup &&
                item.key===
                currentGroup.key
            ){
                return;
            }
            events.push({
                id:
                    "class-pulse-group-"
                    +
                    item.key,
                type:
                    "class-pulse",
                subtype:
                    "group-submission",
                priority:
                    50
                    +
                    item.submissionCount,
                group:
                    item.group,
                course:
                    item.course,
                count:
                    item.submissionCount,
                title:
                    item.label,
                text:
                    item.label
                    +
                    " có "
                    +
                    item.submissionCount
                    +
                    " bài trong "
                    +
                    latest.length
                    +
                    " bài nộp mới nhất.",
                timestamp:
                    item.newestTimestamp,
                time:
                    item.newestTime
            });
        }
    );
    if(reviewedCount>0){
        events.push({
            id:
                "class-pulse-reviewed",
            type:
                "class-pulse",
            subtype:
                "reviewed-summary",
            priority:
                40,
            count:
                reviewedCount,
            title:
                "Hoạt động chấm bài",
            text:
                "Trong "
                +
                latest.length
                +
                " bài nộp mới nhất có "
                +
                reviewedCount
                +
                " bài đã có điểm hoặc nhận xét GVCN.",
            timestamp:
                latest.length
                ?
                latest[0].timestamp
                :
                "",
            time:
                latest.length
                ?
                latest[0].time
                :
                0
        });
    }
    const snapshot={
        version:
            CONFIG.version,
        type:
            "class-pulse",
        generatedAt:
            Date.now(),
        source:
            "student-public-work",
        limit:
            CONFIG.classPulseLimit,
        sampleSize:
            latest.length,
        totalSubmissions:
            latest.length,
        scoredCount:
            scoredCount,
        commentedCount:
            commentedCount,
        reviewedCount:
            reviewedCount,
        groupCount:
            groupStats.length,
        groups:
            groupStats,
        currentStudent:
            currentStudent
            ?
            {
                code:
                    currentStudent.code,
                name:
                    currentStudent.name,
                group:
                    currentStudent.group,
                course:
                    currentStudent.course
            }
            :
            null,
        currentGroup:
            currentGroup,
        events:
            events
            .sort(
                function(a,b){
                    if(
                        b.priority!==
                        a.priority
                    ){
                        return b.priority
                            -
                            a.priority;
                    }
                    return b.time
                        -
                        a.time;
                }
            )
            .slice(
                0,
                CONFIG.classPulseMaxEvents
            ),
        latestIds:
            latest.map(
                function(item){
                    return item.id;
                }
            )
    };
    state.classPulse=
        snapshot;
    window.OCDClassPulse={
        version:
            CONFIG.version,
        getSnapshot:
            function(){
                return state.classPulse;
            },
        getEvents:
            function(){
                return state.classPulse
                    ?
                    state.classPulse.events.slice()
                    :
                    [];
            },
        getGroups:
            function(){
                return state.classPulse
                    ?
                    state.classPulse.groups.slice()
                    :
                    [];
            },
        isReady:
            function(){
                return Boolean(
                    state.classPulse
                );
            },
        refresh:
            function(){
                return buildClassPulse();
            }
    };
    try{
        window.dispatchEvent(
            new CustomEvent(
                "ocdClassPulseReady",
                {
                    detail:snapshot
                }
            )
        );
    }catch(error){}
    return snapshot;
}
/* =========================================================
   RENDER HELPERS
========================================================= */
function giftImage(name){
    const gift=
        canonicalGift(name);
    return gift
        ?
        (
            gift.image
            ||
            gift.icon
            ||
            ""
        )
        :
        "";
}
function giftDescription(name){
    const gift=
        canonicalGift(name);
    return gift
        ?
        (
            gift.description
            ||
            ""
        )
        :
        "";
}
function nonGemItems(account){
    return groupItems(
        account.ownedItems
    )
    .filter(
        function(item){
            return !isGem(
                item.raw
            );
        }
    );
}
function beastItems(account){
    return groupItems(
        account.ownedItems
    )
    .filter(
        function(item){
            return isBeast(
                item.name
            );
        }
    );
}
function normalItems(account){
    return groupItems(
        account.ownedItems
    )
    .filter(
        function(item){
            return(
                !isGem(
                    item.raw
                )
                &&
                !isBeast(
                    item.name
                )
            );
        }
    );
}
/* =========================================================
   PROFILE AVATAR
========================================================= */
function renderProfileAvatar(account){
    const box=
        el("swpAvatar");
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
    if(account.avatar){
        const img=
            document.createElement(
                "img"
            );
        img.src=
            account.avatar;
        img.alt=
            "Avatar";
        img.loading=
            "lazy";
        img.decoding=
            "async";
        img.onerror=
            function(){
                core.innerHTML="";
                core.textContent=
                    UI.user;
            };
        core.appendChild(
            img
        );
    }else{
        core.textContent=
            UI.user;
    }
    box.appendChild(
        core
    );
    if(account.frame){
        const frame=
            document.createElement(
                "img"
            );
        frame.className=
            "student-profile-avatar-frame";
        frame.src=
            account.frame;
        frame.alt="";
        frame.loading=
            "lazy";
        frame.onerror=
            function(){
                frame.remove();
                box.classList.remove(
                    "has-avatar-frame"
                );
            };
        box.appendChild(
            frame
        );
        box.classList.add(
            "has-avatar-frame"
        );
    }
}
/* =========================================================
   NAME
========================================================= */
function renderName(
    student,
    account
){
    const wrap=
        el("swpNameWrap");
    const name=
        el("swpName");
    if(
        typeof state.RS.clearMultitaskEffect===
        "function"
    ){
        state.RS.clearMultitaskEffect(
            wrap,
            name
        );
    }
    name.textContent=
        student.name
        ||
        student.code;
    if(
        account.multitask &&
        typeof state.RS.applyMultitaskEffect===
        "function"
    ){
        state.RS.applyMultitaskEffect(
            wrap,
            name,
            {
                size:"large"
            }
        );
    }
}
/* =========================================================
   GEMS
========================================================= */
function renderGems(account){
    const grid=
        el("swpGemGrid");
    grid.innerHTML="";
    let found=false;
    (state.RS.GEM_ORDER||[])
        .forEach(
            function(key){
                const gem=
                    state.RS.GEM_TYPES[key];
                const amount=
                    Number(
                        account.gems[key]
                        ||
                        0
                    );
                if(
                    !gem ||
                    amount<=0
                ){
                    return;
                }
                found=true;
                const card=
                    document.createElement(
                        "div"
                    );
                card.className=
                    "profile-gem-card "
                    +
                    (
                        gem.className
                        ||
                        ""
                    );
                const icon=
                    document.createElement(
                        "div"
                    );
                icon.className=
                    "profile-gem-icon";
                const img=
                    document.createElement(
                        "img"
                    );
                img.src=
                    imageUrl(
                        gem.image,
                        96
                    );
                img.alt=
                    gem.displayName;
                img.loading=
                    "lazy";
                icon.appendChild(
                    img
                );
                const info=
                    document.createElement(
                        "div"
                    );
                const name=
                    document.createElement(
                        "div"
                    );
                const value=
                    document.createElement(
                        "div"
                    );
                name.className=
                    "profile-gem-name";
                name.textContent=
                    gem.displayName;
                value.className=
                    "profile-gem-value";
                value.textContent=
                    numberText(
                        amount
                    );
                info.append(
                    name,
                    value
                );
                card.append(
                    icon,
                    info
                );
                grid.appendChild(
                    card
                );
            }
        );
    if(!found){
        grid.textContent=
            "Hiện chưa có linh thạch.";
    }
}
/* =========================================================
   ITEMS
========================================================= */
function renderItems(account){
    const grid=
        el("swpItemGrid");
    grid.innerHTML="";
    const items=
        nonGemItems(
            account
        );
    if(!items.length){
        grid.textContent=
            "Học viên chưa sở hữu vật phẩm.";
        return;
    }
    items.forEach(
        function(item){
            const card=
                document.createElement(
                    "div"
                );
            card.className=
                "profile-item-card";
            const top=
                document.createElement(
                    "div"
                );
            top.className=
                "profile-item-top";
            const imageBox=
                document.createElement(
                    "div"
                );
            imageBox.className=
                "profile-item-image";
            const source=
                giftImage(
                    item.name
                );
            if(source){
                const img=
                    document.createElement(
                        "img"
                    );
                img.src=
                    imageUrl(
                        source,
                        220
                    );
                img.alt=
                    item.name;
                img.loading=
                    "lazy";
                img.onerror=
                    function(){
                        imageBox.innerHTML="";
                        imageBox.textContent=
                            UI.gift;
                    };
                imageBox.appendChild(
                    img
                );
            }else{
                imageBox.textContent=
                    UI.gift;
            }
            const info=
                document.createElement(
                    "div"
                );
            info.className=
                "profile-item-info";
            const line=
                document.createElement(
                    "div"
                );
            line.className=
                "profile-item-name-line";
            const name=
                document.createElement(
                    "div"
                );
            name.className=
                "profile-item-name";
            name.textContent=
                item.name;
            const count=
                document.createElement(
                    "span"
                );
            count.className=
                "profile-item-quantity";
            count.textContent=
                CHAR.multiply
                +
                numberText(
                    item.quantity
                );
            line.append(
                name,
                count
            );
            info.appendChild(
                line
            );
            top.append(
                imageBox,
                info
            );
            card.appendChild(
                top
            );
            const desc=
                giftDescription(
                    item.name
                );
            if(desc){
                const text=
                    document.createElement(
                        "div"
                    );
                text.className=
                    "profile-item-description";
                text.textContent=
                    desc;
                card.appendChild(
                    text
                );
            }
            grid.appendChild(
                card
            );
        }
    );
}
/* =========================================================
   OWN WORKS
========================================================= */
function renderOwnWorks(){
    const list=
        el("swpOwnList");
    list.innerHTML="";
    const works=
        state.ownWorks;
    el("swpOwnCount")
        .textContent=
        "("
        +
        works.length
        +
        " bài hợp lệ)";
    if(!works.length){
        list.textContent=
            "Bạn chưa có bài nộp hợp lệ.";
        return;
    }
    works.forEach(
        function(item){
            const card=
                document.createElement(
                    "div"
                );
            card.className=
                "swp-own-card";
            const imageBox=
                document.createElement(
                    "div"
                );
            imageBox.className=
                "swp-own-image";
            if(item.url){
                const link=
                    document.createElement(
                        "a"
                    );
                link.href=
                    item.url;
                link.target=
                    "_blank";
                link.rel=
                    "noopener noreferrer";
                const img=
                    document.createElement(
                        "img"
                    );
                img.src=
                    imageUrl(
                        item.file,
                        350
                    );
                img.alt=
                    "Bài tập";
                img.loading=
                    "lazy";
                img.onerror=
                    function(){
                        link.innerHTML="";
                        const fallback=
                            document.createElement(
                                "div"
                            );
                        fallback.className=
                            "swp-own-fallback";
                        fallback.textContent=
                            UI.image;
                        link.appendChild(
                            fallback
                        );
                    };
                link.appendChild(
                    img
                );
                imageBox.appendChild(
                    link
                );
            }else{
                const fallback=
                    document.createElement(
                        "div"
                    );
                fallback.className=
                    "swp-own-fallback";
                fallback.textContent=
                    UI.image;
                imageBox.appendChild(
                    fallback
                );
            }
            const info=
                document.createElement(
                    "div"
                );
            const time=
                document.createElement(
                    "div"
                );
            const scoreLabel=
                document.createElement(
                    "div"
                );
            const score=
                document.createElement(
                    "div"
                );
            const commentLabel=
                document.createElement(
                    "div"
                );
            const comment=
                document.createElement(
                    "div"
                );
            time.className=
                "swp-own-time";
            time.textContent=
                item.timestamp
                ||
                CHAR.dash;
            scoreLabel.className=
                "swp-own-label";
            scoreLabel.textContent=
                "Điểm GVCN";
            score.className=
                "swp-own-score";
            score.textContent=
                item.score
                ||
                "Chưa chấm";
            commentLabel.className=
                "swp-own-label";
            commentLabel.textContent=
                "Nhận xét GVCN";
            comment.className=
                "swp-own-comment";
            comment.textContent=
                item.comment
                ||
                "Chưa có nhận xét";
            info.append(
                time,
                scoreLabel,
                score,
                commentLabel,
                comment
            );
            card.append(
                imageBox,
                info
            );
            list.appendChild(
                card
            );
        }
    );
}
/* =========================================================
   PROFILE
========================================================= */
function renderProfile(
    student,
    account
){
    state.currentStudent=
        student;
    state.currentAccount=
        account;
    state.hasGlasses=
        Boolean(
            account.glasses
        );
    state.hasTelescope=
        Boolean(
            account.telescope
        );
    /*
       Khi đổi học viên hoặc Core refresh:
       quay về trang đầu.
    */
    state.publicPage=1;
    state.ownWorks=
        studentWorks(
            student.code
        );
    const profile=
        el("swpProfile");
    profile.classList.add(
        "visible"
    );
    profile.classList.remove(
        "has-profile-background"
    );
    profile.style.backgroundImage=
        "";
    if(account.background){
        profile.style.backgroundImage=
            'url("'
            +
            account.background
            +
            '")';
        profile.classList.add(
            "has-profile-background"
        );
    }
    renderProfileAvatar(
        account
    );
    renderName(
        student,
        account
    );
    el("swpGroup")
        .textContent=
        student.group
        ||
        CHAR.dash;
    el("swpCourse")
        .textContent=
        student.course
        ||
        CHAR.dash;
    el("swpSubmissionBadge")
        .textContent=
        state.ownWorks.length
        +
        " bài";
    /* KÍNH NHÌN XUYÊN THẤU */
    const glass=
        el("swpGlass");
    glass.className=
        "swp-glass visible "
        +
        (
            state.hasGlasses
            ?
            "active"
            :
            "locked"
        );
    glass.textContent=
        state.hasGlasses
        ?
        UI.eye
        +
        " Kính Nhìn Xuyên Thấu đang hoạt động"
        :
        UI.lock
        +
        " Chưa sở hữu Kính Nhìn Xuyên Thấu";
    /* LEARNING */
    el("swpLearningGroup")
        .textContent=
        student.group
        ||
        CHAR.dash;
    el("swpLearningCourse")
        .textContent=
        student.course
        ||
        CHAR.dash;
    el("swpAverage")
        .textContent=
        numberText(
            averageScore(
                state.ownWorks
            )
        );
    el("swpSubmissionTotal")
        .textContent=
        numberText(
            state.ownWorks.length
        );
    const status=
        learningStatus(
            state.ownWorks
        );
    el("swpLearningStatus")
        .className=
        "learning-status "
        +
        status.type;
    el("swpLearningStatusTitle")
        .textContent=
        status.title;
    el("swpLearningStatusDetail")
        .textContent=
        status.detail;
    /* GEMS */
    const gemTotal=
        Object.values(
            account.gems||{}
        )
        .reduce(
            function(sum,value){
                return sum
                    +
                    Number(
                        value||0
                    );
            },
            0
        );
    el("swpGemTotal")
        .textContent=
        numberText(
            gemTotal
        );
    /* ITEMS */
    const itemTotal=
        nonGemItems(
            account
        )
        .reduce(
            function(sum,item){
                return sum
                    +
                    item.quantity;
            },
            0
        );
    el("swpItemTotal")
        .textContent=
        numberText(
            itemTotal
        );
    renderGems(
        account
    );
    renderItems(
        account
    );
    renderOwnWorks();
    updateSubmitFormLink();
    updateSubmitAvailability();

    el("swpSubmit")
        .classList
        .add("visible");
    el("swpOwnToggleWrap")
        .classList
        .add("visible");
    closePanels();
    /*
       QUAN TRỌNG:
       Sau khi Core xác nhận Kính viễn vọng,
       render lại khu vực công khai.
    */
    renderLatest();
    buildClassPulse();
    syncMinhHongContext(0);
}
/* =========================================================
   PANELS
========================================================= */
function closePanels(){
    state.activePanel="";
    [
        "swpLearningPanel",
        "swpGemPanel",
        "swpItemPanel"
    ]
    .forEach(
        function(id){
            el(id)
                .classList
                .remove("visible");
        }
    );
    [
        "swpLearningBtn",
        "swpGemBtn",
        "swpItemBtn"
    ]
    .forEach(
        function(id){
            el(id)
                .classList
                .remove("active");
        }
    );
}
function togglePanel(type){
    const map={
        learning:[
            "swpLearningPanel",
            "swpLearningBtn"
        ],
        gems:[
            "swpGemPanel",
            "swpGemBtn"
        ],
        items:[
            "swpItemPanel",
            "swpItemBtn"
        ]
    };
    if(
        state.activePanel===
        type
    ){
        closePanels();
        return;
    }
    closePanels();
    state.activePanel=
        type;
    el(map[type][0])
        .classList
        .add("visible");
    el(map[type][1])
        .classList
        .add("active");
}
/* =========================================================
   PUBLIC CARD HELPERS
========================================================= */
function miniAvatar(account){
    const root=
        document.createElement(
            "div"
        );
    root.className=
        "swp-mini-avatar";
    const core=
        document.createElement(
            "div"
        );
    core.className=
        "swp-mini-core";
    if(
        account &&
        account.avatar
    ){
        const img=
            document.createElement(
                "img"
            );
        img.src=
            account.avatar;
        img.loading=
            "lazy";
        img.onerror=
            function(){
                core.innerHTML="";
                core.textContent=
                    UI.user;
            };
        core.appendChild(
            img
        );
    }else{
        core.textContent=
            UI.user;
    }
    root.appendChild(
        core
    );
    if(
        account &&
        account.frame
    ){
        const frame=
            document.createElement(
                "img"
            );
        frame.className=
            "swp-mini-frame";
        frame.src=
            account.frame;
        frame.loading=
            "lazy";
        frame.onerror=
            function(){
                frame.remove();
            };
        root.appendChild(
            frame
        );
    }
    return root;
}
function createGift(item){
    const node=
        document.createElement(
            "div"
        );
    node.className=
        "swp-gift";
    const source=
        giftImage(
            item.name
        );
    if(source){
        const img=
            document.createElement(
                "img"
            );
        img.src=
            imageUrl(
                source,
                110
            );
        img.alt=
            item.name;
        img.loading=
            "lazy";
        img.onerror=
            function(){
                img.remove();
                node.textContent=
                    UI.gift;
            };
        node.appendChild(
            img
        );
    }else{
        node.textContent=
            UI.gift;
    }
    if(
        item.quantity>1
    ){
        const count=
            document.createElement(
                "span"
            );
        count.className=
            "swp-gift-count";
        count.textContent=
            CHAR.multiply
            +
            item.quantity;
        node.appendChild(
            count
        );
    }
    node.title=
        item.name;
    return node;
}
function createBeast(item){
    const node=
        document.createElement(
            "div"
        );
    node.className=
        "tp18-beast";
    const source=
        giftImage(
            item.name
        );
    if(source){
        const img=
            document.createElement(
                "img"
            );
        img.src=
            imageUrl(
                source,
                190
            );
        img.alt=
            item.name;
        img.loading=
            "lazy";
        img.onerror=
            function(){
                node.innerHTML="";
                node.textContent=
                    UI.paw;
            };
        node.appendChild(
            img
        );
    }else{
        node.textContent=
            UI.paw;
    }
    const tip=
        document.createElement(
            "div"
        );
    tip.className=
        "tp18-tooltip";
    tip.textContent=
        item.name;
    node.appendChild(
        tip
    );
    return node;
}
function scoreResult(item){
    const root=
        document.createElement(
            "div"
        );
    root.className=
        "swp-result";
    const head=
        document.createElement(
            "div"
        );
    head.className=
        "swp-result-head";
    head.textContent=
        UI.eye
        +
        " Kính Nhìn Xuyên Thấu";
    root.appendChild(
        head
    );
    const data=
        document.createElement(
            "div"
        );
    data.className=
        "tp18-public-data";
    [
        [
            "Điểm số",
            item.score||"Chưa chấm",
            "tp18-public-score"
        ],
        [
            "Nhận xét GVCN",
            item.comment||"Chưa có nhận xét",
            "tp18-public-comment"
        ]
    ]
    .forEach(
        function(entry){
            const box=
                document.createElement(
                    "div"
                );
            box.className=
                "tp18-public-box";
            const label=
                document.createElement(
                    "div"
                );
            label.className=
                "tp18-public-label";
            label.textContent=
                entry[0];
            const value=
                document.createElement(
                    "div"
                );
            value.className=
                entry[2];
            value.textContent=
                entry[1];
            box.append(
                label,
                value
            );
            data.appendChild(
                box
            );
        }
    );
    root.appendChild(
        data
    );
    return root;
}
function noImage(){
    const root=
        document.createElement(
            "div"
        );
    root.className=
        "tp18-no-image";
    const icon=
        document.createElement(
            "div"
        );
    icon.textContent=
        UI.image;
    const text=
        document.createElement(
            "small"
        );
    text.textContent=
        "Không tải được ảnh";
    root.append(
        icon,
        text
    );
    return root;
}
/* =========================================================
   WORK CARD
========================================================= */
function createWorkCard(
    item,
    index
){
    const account=
        state.accountMap.get(
            normalizeCode(
                item.code
            )
        )
        ||
        null;
    const card=
        document.createElement(
            "article"
        );
    card.className=
        "tp18-card";
    const imageBox=
        document.createElement(
            "div"
        );
    imageBox.className=
        "tp18-image-box";
    const number=
        document.createElement(
            "div"
        );
    number.className=
        "tp18-number";
    number.textContent=
        String(
            index+1
        );
    imageBox.appendChild(
        number
    );
    if(item.url){
        const link=
            document.createElement(
                "a"
            );
        link.className=
            "tp18-work-link";
        link.href=
            item.url;
        link.target=
            "_blank";
        link.rel=
            "noopener noreferrer";
        const img=
            document.createElement(
                "img"
            );
        img.className=
            "tp18-work-image";
        img.src=
            imageUrl(
                item.file,
                650
            );
        img.alt=
            "Tác phẩm";
        /*
           Chỉ 2 ảnh đầu của trang hiện tại eager.
           Các ảnh còn lại lazy.
        */
        img.loading=
            (
                index%publicPageSize()
            )<2
            ?
            "eager"
            :
            "lazy";
        img.onerror=
            function(){
                link.replaceWith(
                    noImage()
                );
            };
        link.appendChild(
            img
        );
        imageBox.appendChild(
            link
        );
    }else{
        imageBox.appendChild(
            noImage()
        );
    }
    card.appendChild(
        imageBox
    );
    /* LINH THÚ */
    if(account){
        const beasts=
            beastItems(
                account
            );
        if(beasts.length){
            card.classList.add(
                "has-beast"
            );
            const strip=
                document.createElement(
                    "div"
                );
            strip.className=
                "tp18-beasts";
            beasts
                .slice(
                    0,
                    8
                )
                .forEach(
                    function(beast){
                        strip.appendChild(
                            createBeast(
                                beast
                            )
                        );
                    }
                );
            card.appendChild(
                strip
            );
        }
    }
    const info=
        document.createElement(
            "div"
        );
    info.className=
        "tp18-info";
    const userRow=
        document.createElement(
            "div"
        );
    userRow.className=
        "swp-card-user";
    userRow.appendChild(
        miniAvatar(
            account
        )
    );
    const nameWrap=
        document.createElement(
            "div"
        );
    nameWrap.className=
        "swp-card-name-wrap";
    const name=
        document.createElement(
            "div"
        );
    name.className=
        "swp-card-name";
    name.textContent=
        item.name
        ||
        "Học viên";
    nameWrap.appendChild(
        name
    );
    if(
        account &&
        account.multitask &&
        typeof state.RS.applyMultitaskEffect===
        "function"
    ){
        try{
            state.RS.applyMultitaskEffect(
                nameWrap,
                name,
                {
                    size:"small"
                }
            );
        }catch(error){}
    }
    userRow.appendChild(
        nameWrap
    );
    info.appendChild(
        userRow
    );
    /* META */
    const meta=
        document.createElement(
            "div"
        );
    meta.className=
        "tp18-meta";
    if(item.group){
        const chip=
            document.createElement(
                "span"
            );
        chip.className=
            "tp18-chip";
        chip.textContent=
            UI.group
            +
            " Tổ "
            +
            item.group;
        meta.appendChild(
            chip
        );
    }
    if(item.course){
        const chip=
            document.createElement(
                "span"
            );
        chip.className=
            "tp18-chip";
        chip.textContent=
            UI.graduation
            +
            " Khóa "
            +
            item.course;
        meta.appendChild(
            chip
        );
    }
    info.appendChild(
        meta
    );
    /* ITEMS */
    if(account){
        const gifts=
            normalItems(
                account
            );
        if(gifts.length){
            const box=
                document.createElement(
                    "div"
                );
            box.className=
                "swp-gifts";
            const label=
                document.createElement(
                    "div"
                );
            label.className=
                "swp-gifts-label";
            label.textContent=
                "Vật phẩm đang sở hữu";
            const list=
                document.createElement(
                    "div"
                );
            list.className=
                "swp-gift-list";
            gifts.forEach(
                function(gift){
                    list.appendChild(
                        createGift(
                            gift
                        )
                    );
                }
            );
            box.append(
                label,
                list
            );
            info.appendChild(
                box
            );
        }
    }
    /* KÍNH NHÌN XUYÊN THẤU */
    if(
        state.currentStudent &&
        state.hasGlasses
    ){
        info.appendChild(
            scoreResult(
                item
            )
        );
    }
    /* FOOTER */
    const footer=
        document.createElement(
            "div"
        );
    footer.className=
        "tp18-footer";
    const blank=
        document.createElement(
            "div"
        );
    const time=
        document.createElement(
            "div"
        );
    time.className=
        "tp18-time";
    time.textContent=
        item.timestamp
        ||
        CHAR.dash;
    footer.append(
        blank,
        time
    );
    info.appendChild(
        footer
    );
    card.appendChild(
        info
    );
    return card;
}
/* =========================================================
   PUBLIC ACCESS
========================================================= */
function displayLimit(){
    return window
        .matchMedia(
            "(max-width:600px)"
        )
        .matches
        ?
        CONFIG.mobileLimit
        :
        CONFIG.desktopLimit;
}
/*
   Không có Kính viễn vọng:
   phạm vi = giới hạn cũ.
   Có Kính viễn vọng:
   phạm vi = tối đa 50.
*/
function publicAccessLimit(){
    if(
        state.currentStudent &&
        state.hasTelescope
    ){
        return CONFIG.telescopeLimit;
    }
    return displayLimit();
}
function accessiblePublicWorks(){
    return state.works.slice(
        0,
        publicAccessLimit()
    );
}
function publicPageSize(){
    return displayLimit();
}
function publicPageCount(){
    const total=
        accessiblePublicWorks()
        .length;
    return Math.max(
        1,
        Math.ceil(
            total
            /
            publicPageSize()
        )
    );
}
function normalizePublicPage(){
    const pages=
        publicPageCount();
    if(
        state.publicPage<1
    ){
        state.publicPage=1;
    }
    if(
        state.publicPage>pages
    ){
        state.publicPage=
            pages;
    }
    return state.publicPage;
}
function currentPublicWorks(){
    const works=
        accessiblePublicWorks();
    const size=
        publicPageSize();
    const page=
        normalizePublicPage();
    const start=
        (
            page-1
        )
        *
        size;
    return works.slice(
        start,
        start+size
    );
}
/* =========================================================
   PUBLIC PAGINATION
========================================================= */
function renderPublicPages(){
    const top=
        el(
            "swpPublicPagesTop"
        );
    const bottom=
        el(
            "swpPublicPagesBottom"
        );
    if(
        !top ||
        !bottom
    ){
        return;
    }
    top.innerHTML="";
    bottom.innerHTML="";
    const totalWorks=
        accessiblePublicWorks()
        .length;
    const size=
        publicPageSize();
    const totalPages=
        Math.ceil(
            totalWorks/size
        );
    /*
       Chỉ Kính viễn vọng mới cần mở
       nhiều trang công khai.
    */
    if(
        !state.hasTelescope ||
        totalPages<=1
    ){
        top.classList.remove(
            "visible"
        );
        bottom.classList.remove(
            "visible"
        );
        return;
    }
    normalizePublicPage();
    function build(container){
        for(
            let page=1;
            page<=totalPages;
            page++
        ){
            const button=
                document.createElement(
                    "button"
                );
            button.type=
                "button";
            button.className=
                "swp-public-page"
                +
                (
                    page===
                    state.publicPage
                    ?
                    " active"
                    :
                    ""
                );
            button.textContent=
                String(page);
            button.addEventListener(
                "click",
                function(){
                    if(
                        state.publicPage===
                        page
                    ){
                        return;
                    }
                    state.publicPage=
                        page;
                    renderLatest();
                    const section=
                        document.querySelector(
                            "#ocd4-student-work-page .swp-public"
                        );
                    if(section){
                        section.scrollIntoView({
                            behavior:
                                "smooth",
                            block:
                                "start"
                        });
                    }
                }
            );
            container.appendChild(
                button
            );
        }
    }
    build(top);
    build(bottom);
    top.classList.add(
        "visible"
    );
    bottom.classList.add(
        "visible"
    );
}
/* =========================================================
   RENDER LATEST
========================================================= */
function renderLatest(){
    const grid=
        el("swpGrid");
    grid.innerHTML="";
    const accessible=
        accessiblePublicWorks();
    const latest=
        currentPublicWorks();
    if(!accessible.length){
        el("swpEmpty")
            .classList
            .add("visible");
        const telescope=
            el("swpTelescope");
        telescope.className=
            "swp-telescope";
        telescope.textContent="";
        renderPublicPages();
        return;
    }
    el("swpEmpty")
        .classList
        .remove("visible");
    const pageSize=
        publicPageSize();
    const offset=
        (
            state.publicPage-1
        )
        *
        pageSize;
    latest.forEach(
        function(item,index){
            grid.appendChild(
                createWorkCard(
                    item,
                    offset+index
                )
            );
        }
    );
    /* =====================================================
       KÍNH VIỄN VỌNG STATUS
    ====================================================== */
    const telescope=
        el("swpTelescope");
    if(
        state.currentStudent &&
        state.hasTelescope
    ){
        telescope.className=
            "swp-telescope visible";
        telescope.textContent=
            UI.telescope
            +
            " Kính viễn vọng đang hoạt động"
            +
            " "
            +
            CHAR.dot
            +
            " "
            +
            "Bạn có thể quan sát "
            +
            accessible.length
            +
            " tác phẩm gần nhất.";
    }else{
        telescope.className=
            "swp-telescope";
        telescope.textContent="";
    }
    /* =====================================================
       PUBLIC STATUS
    ====================================================== */
    const status=
        el("swpPublicStatus");
    status.className=
        "swp-public-status visible"
        +
        (
            state.hasGlasses
            ?
            " glass"
            :
            ""
        );
    if(
        state.currentStudent &&
        state.hasGlasses &&
        state.hasTelescope
    ){
        status.textContent=
            UI.eye
            +
            " Kính Nhìn Xuyên Thấu đang hoạt động"
            +
            " "
            +
            CHAR.dot
            +
            " "
            +
            UI.telescope
            +
            " Kính viễn vọng đã mở phạm vi "
            +
            accessible.length
            +
            " tác phẩm"
            +
            " "
            +
            CHAR.dot
            +
            " "
            +
            "điểm và nhận xét GVCN được hiển thị.";
    }else if(
        state.currentStudent &&
        state.hasGlasses
    ){
        status.textContent=
            UI.eye
            +
            " Kính Nhìn Xuyên Thấu đang hoạt động"
            +
            " "
            +
            CHAR.dot
            +
            " "
            +
            "đang hiển thị "
            +
            latest.length
            +
            " tác phẩm cùng điểm và nhận xét GVCN.";
    }else if(
        state.currentStudent &&
        state.hasTelescope
    ){
        status.textContent=
            UI.telescope
            +
            " Kính viễn vọng đang hoạt động"
            +
            " "
            +
            CHAR.dot
            +
            " "
            +
            "đã mở phạm vi "
            +
            accessible.length
            +
            " tác phẩm gần nhất"
            +
            " "
            +
            CHAR.dot
            +
            " "
            +
            "điểm và nhận xét của người khác vẫn được ẩn.";
    }else if(
        state.currentStudent
    ){
        status.textContent=
            "Đang hiển thị "
            +
            latest.length
            +
            " tác phẩm mới nhất"
            +
            " "
            +
            CHAR.dot
            +
            " "
            +
            "điểm và nhận xét người khác được ẩn.";
    }else{
        status.textContent=
            "Đang hiển thị "
            +
            latest.length
            +
            " tác phẩm mới nhất.";
    }
    renderPublicPages();
}
/* =========================================================
   SEARCH
========================================================= */
async function search(){
    if(state.searching){
        return;
    }
    const input=
        el("swpCode");
    const button=
        el("swpSearch");
    const raw=
        clean(
            input.value
        );
    if(!raw){
        showMessage(
            "Vui lòng nhập Mã học viên.",
            "error"
        );
        return;
    }
    state.searching=true;
    button.disabled=true;
    button.textContent=
        "ĐANG TRA CỨU...";
    updateLookupHint("loading");
    showMessage(
        "Đang mở hồ sơ học viên...",
        "loading"
    );
    try{
        await waitForCore();
        const code=
            normalizeCode(raw);
        const previousCode=
            state.currentStudent
            ?
            normalizeCode(
                state.currentStudent.code
            )
            :
            "";
        if(
            previousCode &&
            previousCode!==code
        ){
            clearMinhHongContext();
        }
        input.value=
            code;
        const student=
            await findStudent(
                code
            );
        if(!student){
            throw new Error(
                "Không tìm thấy Mã học viên."
            );
        }
        const statusError=
            getStudentStatusError(
                student
            );
        if(statusError){
            throw new Error(
                statusError
            );
        }
        try{
            await loadOwnWorks(
                code,
                false
            );
        }catch(error){
            console.warn(
                "[Student Work] Own works:",
                error
            );
        }
        const account=
            await getAccount(
                code,
                false
            );
        if(!account){
            throw new Error(
                "Không tải được dữ liệu hồ sơ từ Core."
            );
        }
        renderProfile(
            student,
            account
        );
        confirmStudentSession(
            code
        );
        buildClassPulse();
        syncMinhHongContext(0);
        if(
            state.hasGlasses &&
            state.hasTelescope
        ){
            showMessage(
                "Đã mở hồ sơ. Kính Nhìn Xuyên Thấu và Kính viễn vọng đã được kích hoạt.",
                "success"
            );
        }else if(
            state.hasTelescope
        ){
            showMessage(
                "Đã mở hồ sơ. Kính viễn vọng đã mở quyền xem 50 tác phẩm gần nhất.",
                "success"
            );
        }else if(
            state.hasGlasses
        ){
            showMessage(
                "Đã mở hồ sơ. Kính Nhìn Xuyên Thấu đã được kích hoạt.",
                "success"
            );
        }else{
            showMessage(
                "",
                ""
            );
        }
    }catch(error){
        console.error(
            "[Student Work Search]",
            error
        );
        showMessage(
            error.message
            ||
            "Không thể tải hồ sơ.",
            "error"
        );
    }finally{
        state.searching=false;
        button.disabled=false;
        button.textContent=
            "TRA CỨU";
        updateLookupHint();
    }
}
/* =========================================================
   CORE CHANGE EVENT
========================================================= */
window.addEventListener(
    "ocdRewardProfileChanged",
    function(event){
        const detail=
            event.detail||{};
        const changedCode=
            normalizeCode(
                detail.code||""
            );
        const shownCode=
            state.currentStudent
            ?
            normalizeCode(
                state.currentStudent.code
            )
            :
            "";
        if(
            !shownCode ||
            !changedCode ||
            shownCode!==changedCode
        ){
            return;
        }
        Promise.resolve()
            .then(
                async function(){
                    const account=
                        detail.profile
                        ?
                        normalizeCanonicalAccount(
                            detail.profile
                        )
                        :
                        await getAccount(
                            shownCode,
                            true
                        );
                    state.accountMap.set(
                        shownCode,
                        account
                    );
                    /*
                       Nếu Kính viễn vọng vừa được nhận/mất,
                       renderProfile sẽ tự cập nhật quyền.
                    */
                    renderProfile(
                        state.currentStudent,
                        account
                    );
                }
            )
            .catch(
                function(error){
                    console.warn(
                        "[Student Work] Core profile refresh:",
                        error
                    );
                }
            );
    }
);
/* =========================================================
   SESSION
========================================================= */
/* =========================================================
   NHẬN DIỆN HỌC VIÊN (Minh Hồng / tài khoản) - v1.7
========================================================= */
function isMemberCode(c){
    return /^TV\d{6}$/.test(c) &&
        !/^TV(?!00)\d{2,3}0[1-4]01$/.test(c);
}
function sessionStudentCode(){
    const session=
        getStudentSessionState();
    if(
        session &&
        session.mode==="student" &&
        session.code
    ){
        const code=
            normalizeCode(
                session.code
            );
        if(
            code &&
            code!=="ADMIN" &&
            !isMemberCode(code)
        ){
            return code;
        }
    }
    try{
        const A=
            window.OCDAuth;
        const me=
            A &&
            typeof A.token==="function" &&
            A.token() &&
            typeof A.me==="function"
            ?
            A.me()
            :
            null;
        if(me){
            const code=
                normalizeCode(
                    me.linked ||
                    (
                        me.type!=="TV"
                        ?
                        me.code
                        :
                        ""
                    ) ||
                    ""
                );
            if(
                code &&
                !isMemberCode(code)
            ){
                return code;
            }
        }
    }catch(error){}
    return "";
}
function lookupParts(){
    const app=
        el("swpProfileApp");
    if(!app){
        return null;
    }
    return{
        box:
            app.querySelector(".swp-search"),
        title:
            app.querySelector(".swp-search-title"),
        note:
            app.querySelector(".swp-search-note"),
        row:
            app.querySelector(".swp-search-row"),
        desc:
            app.querySelector(".swp-desc")
    };
}
function updateLookupHint(mode){
    const parts=
        lookupParts();
    if(!parts){
        return;
    }
    if(parts.row){
        parts.row.style.display="none";
    }
    if(parts.desc){
        parts.desc.textContent=
            "Hồ sơ tự mở khi bạn đã nhận diện qua biểu tượng Minh Hồng.";
    }
    const show=
        function(title,note){
            if(parts.title){
                parts.title.style.display=
                    title?"":"none";
                parts.title.textContent=
                    title;
            }
            if(parts.note){
                parts.note.style.display=
                    note?"":"none";
                parts.note.textContent=
                    note;
            }
        };
    if(
        mode==="loading" ||
        state.searching
    ){
        if(parts.box){
            parts.box.style.display="";
        }
        show(
            "Đang nhận diện học viên...",
            ""
        );
        return;
    }
    if(state.currentStudent){
        show("","");
        if(parts.box){
            parts.box.classList.add(
                "swp-identified"
            );
            parts.box.style.display="none";
        }
        return;
    }
    if(parts.box){
        parts.box.classList.remove(
            "swp-identified"
        );
        parts.box.style.display="";
    }
    show(
        "Chưa nhận diện học viên",
        "Bấm biểu tượng Minh Hồng ở góc màn hình và nhập Mã học viên để mở hồ sơ, nộp bài và xem các bài đã nộp."
    );
}
function resetProfile(){
    state.currentStudent=null;
    state.currentAccount=null;
    state.hasGlasses=false;
    state.hasTelescope=false;
    state.ownWorks=[];
    state.lastSessionSearchCode="";
    state.publicPage=1;
    try{
        closePanels();
    }catch(error){}
    const profile=
        el("swpProfile");
    if(profile){
        profile.classList.remove(
            "visible"
        );
    }
    const input=
        el("swpCode");
    if(input){
        input.value="";
    }
    showMessage("","");
    updateSubmitAvailability();
    renderLatest();
    buildClassPulse();
    updateLookupHint();
}
async function autoSearchSession(){
    if(
        !CONFIG.sessionAutoSearch ||
        state.searching
    ){
        return;
    }
    const code=
        sessionStudentCode();
    if(!code){
        updateLookupHint();
        return;
    }
    if(
        state.currentStudent &&
        normalizeCode(
            state.currentStudent.code
        )===code
    ){
        return;
    }
    if(
        state.lastSessionSearchCode===
        code
    ){
        return;
    }
    el("swpCode").value=
        code;
    state.lastSessionSearchCode=
        code;
    await search();
}
async function initializeStudentSession(){
    if(
        state.initialSessionHandled
    ){
        return;
    }
    state.initialSessionHandled=true;
    const code=
        sessionStudentCode();
    if(!code){
        updateLookupHint();
        return;
    }
    el("swpCode").value=
        code;
    await autoSearchSession();
}
window.addEventListener(
    "ocdStudentSessionChanged",
    function(event){
        if(
            state.sessionSyncing
        ){
            return;
        }
        const current=
            (
                event.detail||{}
            ).current
            ||
            getStudentSessionState();
        buildClassPulse();
        const code=
            (
                current &&
                current.mode==="student" &&
                current.code
            )
            ?
            normalizeCode(
                current.code
            )
            :
            sessionStudentCode();
        if(!code){
            clearMinhHongContext();
            resetProfile();
            return;
        }
        el("swpCode").value=
            code;
        if(
            state.currentStudent &&
            normalizeCode(
                state.currentStudent.code
            )===code
        ){
            syncMinhHongContext(0);
            return;
        }
        state.lastSessionSearchCode="";
        Promise.resolve()
            .then(
                autoSearchSession
            )
            .catch(
                function(){}
            );
    }
);
window.addEventListener(
    "ocdAuthChanged",
    function(){
        const code=
            sessionStudentCode();
        if(!code){
            const session=
                getStudentSessionState();
            if(
                !session ||
                session.mode!=="student"
            ){
                resetProfile();
            }
            return;
        }
        state.lastSessionSearchCode="";
        Promise.resolve()
            .then(
                autoSearchSession
            )
            .catch(
                function(){}
            );
    }
);
/* Nộp bài xong (nop-bai.js): cập nhật bài của học viên + danh sách mới. */
window.addEventListener(
    "ocdWorkSubmitted",
    function(){
        if(state.currentStudent){
            const code=
                normalizeCode(
                    state.currentStudent.code
                );
            refreshOwnWorks(true)
                .then(
                    function(){
                        return getAccount(
                            code,
                            true
                        );
                    }
                )
                .then(
                    function(account){
                        if(
                            account &&
                            state.currentStudent &&
                            normalizeCode(
                                state.currentStudent.code
                            )===code
                        ){
                            renderProfile(
                                state.currentStudent,
                                account
                            );
                        }
                    }
                )
                .catch(
                    function(){}
                );
        }
        state.latestLoadedAt=0;
        setTimeout(
            loadLatestWorks,
            1500
        );
    }
);
/* =========================================================
   EVENTS
========================================================= */
function bindEvents(){
    el("swpSubmitLink")
        .addEventListener(
            "click",
            openSubmitForm
        );
    el("swpSearch")
        .addEventListener(
            "click",
            search
        );
    el("swpCode")
        .addEventListener(
            "keydown",
            function(event){
                if(
                    event.key===
                    "Enter"
                ){
                    event.preventDefault();
                    search();
                }
            }
        );
    el("swpCode")
        .addEventListener(
            "input",
            function(){
                this.value=
                    this.value
                    .toUpperCase();
            }
        );
    el("swpLearningBtn")
        .addEventListener(
            "click",
            function(){
                togglePanel(
                    "learning"
                );
            }
        );
    el("swpGemBtn")
        .addEventListener(
            "click",
            function(){
                togglePanel(
                    "gems"
                );
            }
        );
    el("swpItemBtn")
        .addEventListener(
            "click",
            function(){
                togglePanel(
                    "items"
                );
            }
        );
    el("swpOwnToggle")
        .addEventListener(
            "click",
            function(){
                const panel=
                    el("swpOwnPanel");
                const icon=
                    el("swpOwnToggleIcon");
                const text=
                    el("swpOwnToggleText");
                panel.classList.toggle(
                    "visible"
                );
                const opened=
                    panel.classList.contains(
                        "visible"
                    );
                icon.textContent=
                    opened
                    ?
                    UI.up
                    :
                    UI.books;
                text.textContent=
                    opened
                    ?
                    "Thu gọn danh sách bài"
                    :
                    "Danh sách bài đã nộp";
            }
        );
}
/* =========================================================
   VISIBILITY REFRESH
========================================================= */
document.addEventListener(
    "visibilitychange",
    function(){
        if(document.visibilityState!=="visible"){
            return;
        }
        if(state.currentStudent){
            state.latestLoadedAt=0;
            loadLatestWorks();
            refreshOwnWorks(true);
            return;
        }
        if(
            Date.now()-state.latestLoadedAt>
            CONFIG.staleMs
        ){
            loadLatestWorks();
        }
    }
);
/* =========================================================
   RESPONSIVE
========================================================= */
const mobile=
    window.matchMedia(
        "(max-width:600px)"
    );
function handleViewportChange(){
    /*
       Khi đổi mobile / desktop:
       page size thay đổi.
       Quay về trang đầu để tránh offset sai.
    */
    state.publicPage=1;
    renderLatest();
}
if(
    typeof mobile.addEventListener===
    "function"
){
    mobile.addEventListener(
        "change",
        handleViewportChange
    );
}else if(
    typeof mobile.addListener===
    "function"
){
    mobile.addListener(
        handleViewportChange
    );
}
/* =========================================================
   PUBLIC API
========================================================= */
window.OCDStudentPublicWork={
    version:
        CONFIG.version,
    getLatestWorks:
        function(){
            return state.works.slice(
                0,
                CONFIG.classPulseLimit
            );
        },
    getAccessibleWorks:
        function(){
            return accessiblePublicWorks()
                .slice();
        },
    getClassPulse:
        function(){
            return state.classPulse;
        },
    refreshClassPulse:
        function(){
            return buildClassPulse();
        },
    refreshWorks:
        function(){
            return loadLatestWorks();
        },
    refreshCurrentProfile:
        async function(){
            if(
                !state.currentStudent
            ){
                return null;
            }
            const account=
                await getAccount(
                    state.currentStudent.code,
                    true
                );
            renderProfile(
                state.currentStudent,
                account
            );
            return account;
        },
    getState:
        function(){
            return{
                version:
                    CONFIG.version,
                worksLoaded:
                    state.works.length,
                latestLoadedAt:
                    state.latestLoadedAt,
                currentStudent:
                    state.currentStudent,
                hasGlasses:
                    state.hasGlasses,
                hasTelescope:
                    state.hasTelescope,
                publicAccessLimit:
                    publicAccessLimit(),
                accessibleWorks:
                    accessiblePublicWorks()
                    .length,
                publicPage:
                    state.publicPage,
                publicPageCount:
                    publicPageCount(),
                classPulseReady:
                    Boolean(
                        state.classPulse
                    ),
                canonicalAssets:
                    true,
                coreVersion:
                    state.RS
                    ?
                    (
                        state.RS.coreVersion
                        ||
                        state.RS.version
                        ||
                        ""
                    )
                    :
                    ""
            };
        }
};
/* =========================================================
   START
========================================================= */
function start(){
    if(state.started){
        return;
    }
    state.started=true;
    initIcons();
    bindEvents();
    updateLookupHint();
    /* Hiện ngay bản đã lưu, sau đó tải mới. */
    hydrateLatestFromCache();
    waitForCore()
        .then(
            function(){
                return loadStudentRegistry(
                    false
                );
            }
        )
        .catch(
            function(error){
                console.warn(
                    "[Student Work] Core/HocVien:",
                    error
                );
            }
        );
    loadLatestWorks();
    /* Nhận diện học viên song song với tải danh sách bài mới. */
    Promise.resolve()
    .then(
        initializeStudentSession
    )
    .catch(
        function(error){
            console.warn(
                "[Student Work] Initial Session:",
                error
            );
        }
    );
    console.info(
        "[Student Work] v1.7.0 ready | BaiMoiNhat | own works via Core | Minh Hồng identify"
    );
}
if(
    document.readyState===
    "loading"
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
})();
