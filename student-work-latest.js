(()=>{
"use strict";

/* =========================================================
   OCD4 - TÁC PHẨM MỚI NHẤT
   STUDENT WORK LATEST v1.0

   MỤC TIÊU
   ---------------------------------------------------------
   - Chỉ hiển thị bài nộp mới nhất
   - Mobile <= 600px: 10 bài
   - Desktop > 600px: 25 bài
   - Không Admin
   - Không chấm bài
   - Không quà tặng
   - Không tìm kiếm
   - Không phân trang
   - Không phụ thuộc StudentRewardSystem Core
========================================================= */


/* =========================================================
   DUPLICATE GUARD
========================================================= */

if(window.OCD4StudentWorkLatestLoaded){
    return;
}

window.OCD4StudentWorkLatestLoaded = true;


/* =========================================================
   CONFIG
========================================================= */

const MOBILE_MAX_WIDTH = 600;

const MOBILE_LIMIT = 10;

const DESKTOP_LIMIT = 25;


/*
   Tự tải lại dữ liệu sau 5 phút
*/
const REFRESH_MS =
5 * 60 * 1000;


/* =========================================================
   GOOGLE SHEETS
========================================================= */

const NOP_BAI_ID =
"1GJoTRsbq0kZfZrDdh0uCC667PwS3Bgkje2fHQnwnCKs";


const URLS = {

    /*
       Nguồn chính
    */
    works:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRP5cc8duj1XrCXMrymo6Cj7aqIkWfX6bHxGeW-lXcSewfQXhM8fZ5rzbNIQ9mBeVuB8yYr_o1aBoYA/pub?gid=1023688821&single=true&output=csv",


    /*
       Nguồn dự phòng
    */
    worksFallback:
    "https://docs.google.com/spreadsheets/d/" +
    NOP_BAI_ID +
    "/export?format=csv&gid=1837470623",


    /*
       Nhật ký bài bị xoá
    */
    deleteLog:
    "https://docs.google.com/spreadsheets/d/" +
    NOP_BAI_ID +
    "/export?format=csv&gid=521976322"
};


/* =========================================================
   STATE
========================================================= */

let works = [];

let deletedSubmissionIds =
new Set();

let started = false;

let refreshTimer = null;


/* =========================================================
   DOM
========================================================= */

const $ =
selector =>
document.querySelector(selector);


/* =========================================================
   SAFE TEXT
========================================================= */

function decodeNumericEntities(value){

    return String(
        value ?? ""
    )

    .replace(
        /&#x([0-9a-f]+);?/gi,
        function(match,hex){

            const code =
            parseInt(
                hex,
                16
            );

            if(
                !Number.isFinite(
                    code
                )
            ){
                return match;
            }

            try{

                return String.fromCodePoint(
                    code
                );

            }catch(error){

                return match;
            }
        }
    )

    .replace(
        /&#(\d+);?/g,
        function(match,decimal){

            const code =
            parseInt(
                decimal,
                10
            );

            if(
                !Number.isFinite(
                    code
                )
            ){
                return match;
            }

            try{

                return String.fromCodePoint(
                    code
                );

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


function escapeHTML(value){

    return String(
        value ?? ""
    )

    .replace(
        /&/g,
        "&amp;"
    )

    .replace(
        /</g,
        "&lt;"
    )

    .replace(
        />/g,
        "&gt;"
    )

    .replace(
        /"/g,
        "&quot;"
    )

    .replace(
        /'/g,
        "&#39;"
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
    String(
        text || ""
    )
    .replace(
        /^\uFEFF/,
        ""
    );


    for(
        let i = 0;
        i < text.length;
        i++
    ){

        const char =
        text[i];

        const next =
        text[i + 1];


        if(
            char === '"' &&
            quote &&
            next === '"'
        ){

            value += '"';

            i++;

            continue;
        }


        if(
            char === '"'
        ){

            quote =
            !quote;

            continue;
        }


        if(
            char === "," &&
            !quote
        ){

            row.push(
                value
            );

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


            row.push(
                value
            );

            value = "";


            if(
                row.some(
                    cell =>
                    clean(cell)
                )
            ){

                rows.push(
                    row
                );
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

        row.push(
            value
        );


        if(
            row.some(
                cell =>
                clean(cell)
            )
        ){

            rows.push(
                row
            );
        }
    }


    return rows;
}


function csvObjects(text){

    const rows =
    parseCSV(
        text
    );


    if(
        rows.length < 2
    ){

        return [];
    }


    const headers =
    rows[0]
    .map(
        normalize
    );


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
                function(
                    header,
                    index
                ){

                    if(
                        header
                    ){

                        object[header] =
                        row[index] ??
                        "";
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

    if(
        !object
    ){

        return "";
    }


    for(
        const name
        of possibleNames
    ){

        const key =
        normalize(
            name
        );


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
            cache:
            "no-store"
        }
    );


    if(
        !response.ok
    ){

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
            "[Student Work Latest] Nguồn phụ lỗi:",
            error
        );

        return "";
    }
}


/* =========================================================
   DRIVE IMAGE
========================================================= */

function driveId(url){

    const value =
    String(
        url || ""
    );


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
        value.match(
            pattern
        );


        if(
            match
        ){

            return match[1];
        }
    }


    return "";
}


function imageCandidates(url){

    const source =
    clean(
        url
    );


    const id =
    driveId(
        source
    );


    if(
        !id
    ){

        return source
        ?
        [source]
        :
        [];
    }


    return [

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
        imageCandidates(
            url
        )[0]
        ||
        ""
    );
}


function originalUrl(value){

    return(
        String(
            value || ""
        )
        .match(
            /https?:\/\/[^\s,]+/i
        )
        ||
        []
    )[0]
    ||
    "#";
}


function applyImageFallback(
    image,
    source
){

    const candidates =
    imageCandidates(
        source
    );


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


            const box =
            image.closest(
                ".sw-latest-image-box"
            );


            if(
                !box
            ){
                return;
            }


            box.innerHTML = `
                <div class="sw-latest-no-image">
                    <div>🖼️</div>
                    <small>Không tải được ảnh</small>
                </div>
            `;
        }
    );
}


/* =========================================================
   TIME
========================================================= */

function timestampValue(value){

    const match =
    String(
        value || ""
    )
    .match(
        /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})(?:[\s,]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/
    );


    if(
        !match
    ){

        return(
            Date.parse(
                value
            )
            ||
            0
        );
    }


    return new Date(

        +match[3],

        +match[2] - 1,

        +match[1],

        +match[4] || 0,

        +match[5] || 0,

        +match[6] || 0

    ).getTime();
}


function compactTimestamp(value){

    const match =
    String(
        value || ""
    )
    .match(
        /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})[\s,]+(\d{1,2}):(\d{2})(?::(\d{2}))?/
    );


    if(
        !match
    ){

        return "";
    }


    const pad =
    number =>
    String(
        number
    )
    .padStart(
        2,
        "0"
    );


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
   SUBMISSION ID
========================================================= */

function rawSubmissionId(item){

    const existing =
    clean(
        column(
            item,
            [
                "Mã bài nộp"
            ]
        )
    );


    if(
        existing
    ){

        return existing;
    }


    const timestamp =
    column(
        item,
        [
            "Dấu thời gian"
        ]
    );


    const code =
    clean(
        column(
            item,
            [
                "Mã học viên"
            ]
        )
    );


    const work =
    column(
        item,
        [
            "Tải bài tập lên"
        ]
    );


    return(
        compactTimestamp(
            timestamp
        )
        +
        "|"
        +
        code
        +
        "|"
        +
        (
            driveId(
                work
            )
            ||
            clean(
                work
            )
        )
    );
}


/* =========================================================
   DELETE LOG
========================================================= */

function buildDeletedSubmissionIds(
    data
){

    const states =
    new Map();


    (
        data ||
        []
    )
    .forEach(
        function(row){

            const id =
            clean(
                column(
                    row,
                    [
                        "Mã bài nộp"
                    ]
                )
            );


            if(
                !id
            ){

                return;
            }


            const action =
            normalize(
                column(
                    row,
                    [
                        "Hành động"
                    ]
                )
            );


            if(
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

                return;
            }


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

            if(
                isDeleted
            ){

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
                    rawSubmissionId(
                        item
                    )
                )
            );
        }
    );
}


/* =========================================================
   VALIDATE WORK SOURCE
========================================================= */

function isValidWorkData(
    data
){

    if(
        !Array.isArray(
            data
        )
        ||
        !data.length
    ){

        return false;
    }


    const refError =
    data

    .slice(
        0,
        15
    )

    .some(
        row =>
        Object.values(
            row
        )
        .some(
            value =>
            String(
                value
            )
            .includes(
                "#REF!"
            )
        )
    );


    if(
        refError
    ){

        return false;
    }


    return data.some(
        function(item){

            return Boolean(

                clean(
                    column(
                        item,
                        [
                            "Mã học viên"
                        ]
                    )
                )

                &&

                clean(
                    column(
                        item,
                        [
                            "Tải bài tập lên"
                        ]
                    )
                )
            );
        }
    );
}


/* =========================================================
   LOAD WORK SOURCE
========================================================= */

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
                data:
                primary,

                source:
                "TacPhamWeb"
            };
        }

    }catch(error){

        console.warn(
            "[Student Work Latest] TacPhamWeb lỗi:",
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
            data:
            fallback,

            source:
            "Form Responses 1"
        };
    }


    throw new Error(
        "Không tìm thấy nguồn dữ liệu bài tập hợp lệ."
    );
}


/* =========================================================
   PREPARE WORK
========================================================= */

function prepareWork(
    item
){

    const name =
    clean(
        column(
            item,
            [
                "Họ và tên",
                "Họ tên"
            ]
        )
    );


    const group =
    clean(
        column(
            item,
            [
                "Tổ"
            ]
        )
    );


    const course =
    clean(
        column(
            item,
            [
                "Khóa",
                "Khoa"
            ]
        )
    );


    const timestampText =
    clean(
        column(
            item,
            [
                "Dấu thời gian"
            ]
        )
    );


    const rawWork =
    column(
        item,
        [
            "Tải bài tập lên"
        ]
    );


    return{

        raw:
        item,

        name:
        name,

        group:
        group,

        course:
        course,

        timestampText:
        timestampText,

        timestamp:
        timestampValue(
            timestampText
        ),

        rawWork:
        rawWork,

        workUrl:
        originalUrl(
            rawWork
        ),

        image:
        primaryImage(
            rawWork
        )
    };
}


/* =========================================================
   LIMIT
========================================================= */

function getDisplayLimit(){

    return window.matchMedia(
        "(max-width:" +
        MOBILE_MAX_WIDTH +
        "px)"
    ).matches

    ?

    MOBILE_LIMIT

    :

    DESKTOP_LIMIT;
}


/* =========================================================
   CARD
========================================================= */

function createCard(
    item,
    index
){

    const article =
    document.createElement(
        "article"
    );


    article.className =
    "sw-latest-card";


    const groupChip =
    item.group
    ?
    `
        <span class="sw-latest-chip">
            👥 Tổ ${escapeHTML(item.group)}
        </span>
    `
    :
    "";


    const courseChip =
    item.course
    ?
    `
        <span class="sw-latest-chip">
            🎓 Khóa ${escapeHTML(item.course)}
        </span>
    `
    :
    "";


    article.innerHTML = `

        <div class="sw-latest-image-box">

            <div class="sw-latest-number">
                ${index + 1}
            </div>

            ${
                item.image
                ?
                `
                    <a
                        class="sw-latest-work-link"
                        href="${escapeHTML(item.workUrl)}"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Xem tác phẩm của ${escapeHTML(item.name || "học viên")}"
                    >

                        <img
                            class="sw-latest-image"
                            src="${escapeHTML(item.image)}"
                            alt="Tác phẩm của ${escapeHTML(item.name || "học viên")}"
                            loading="${index < 2 ? "eager" : "lazy"}"
                            decoding="async"
                            fetchpriority="${index === 0 ? "high" : "low"}"
                        >

                    </a>
                `
                :
                `
                    <div class="sw-latest-no-image">
                        <div>🖼️</div>
                        <small>Không có ảnh</small>
                    </div>
                `
            }

        </div>


        <div class="sw-latest-info">

            <div class="sw-latest-name">
                ${escapeHTML(item.name || "Học viên")}
            </div>


            ${
                groupChip ||
                courseChip
                ?
                `
                    <div class="sw-latest-meta">
                        ${groupChip}
                        ${courseChip}
                    </div>
                `
                :
                ""
            }


            <div class="sw-latest-time">
                ${
                    escapeHTML(
                        item.timestampText ||
                        "Không có thời gian"
                    )
                }
            </div>

        </div>
    `;


    const image =
    article.querySelector(
        ".sw-latest-image"
    );


    if(
        image
    ){

        applyImageFallback(
            image,
            item.rawWork
        );
    }


    return article;
}


/* =========================================================
   RENDER
========================================================= */

function render(){

    const grid =
    $("#swLatestGrid");


    const empty =
    $("#swLatestEmpty");


    if(
        !grid ||
        !empty
    ){

        return;
    }


    const limit =
    getDisplayLimit();


    const latest =
    works

    .map(
        prepareWork
    )

    .filter(
        item =>
        item.timestamp >
        0
    )

    .sort(
        (
            a,
            b
        ) =>
        b.timestamp -
        a.timestamp
    )

    .slice(
        0,
        limit
    );


    grid.innerHTML =
    "";


    if(
        !latest.length
    ){

        empty.classList.add(
            "on"
        );

        return;
    }


    empty.classList.remove(
        "on"
    );


    const fragment =
    document.createDocumentFragment();


    latest.forEach(
        function(
            item,
            index
        ){

            fragment.appendChild(
                createCard(
                    item,
                    index
                )
            );
        }
    );


    grid.appendChild(
        fragment
    );


    const status =
    $("#swLatestStatus");


    if(
        status
    ){

        status.textContent =
        "Đang hiển thị " +
        latest.length +
        " tác phẩm mới nhất.";

        status.classList.add(
            "on"
        );
    }
}


/* =========================================================
   LOAD
========================================================= */

async function loadData(){

    const loading =
    $("#swLatestLoading");


    const errorBox =
    $("#swLatestError");


    try{

        if(
            loading
        ){

            loading.style.display =
            "block";
        }


        if(
            errorBox
        ){

            errorBox.classList.remove(
                "on"
            );
        }


        /*
           Tải bài và nhật ký xoá song song.
           Không tải Sheet quà, giao dịch, tặng quà...
        */

        const [
            workResult,
            deleteText
        ] =
        await Promise.all([

            loadWorkData(),

            safeFetchCSV(
                URLS.deleteLog
            )
        ]);


        if(
            deleteText
        ){

            buildDeletedSubmissionIds(
                csvObjects(
                    deleteText
                )
            );

        }else{

            deletedSubmissionIds =
            new Set();
        }


        works =
        filterDeletedWorks(
            workResult.data
        );


        render();


    }catch(error){

        console.error(
            "[Student Work Latest]",
            error
        );


        if(
            errorBox
        ){

            errorBox.textContent =
            "Không thể tải danh sách tác phẩm. Vui lòng tải lại trang.";

            errorBox.classList.add(
                "on"
            );
        }


    }finally{

        if(
            loading
        ){

            loading.style.display =
            "none";
        }
    }
}


/* =========================================================
   RESPONSIVE
========================================================= */

const media =
window.matchMedia(
    "(max-width:" +
    MOBILE_MAX_WIDTH +
    "px)"
);


let lastMobile =
media.matches;


function responsiveChange(){

    const current =
    media.matches;


    if(
        current ===
        lastMobile
    ){

        return;
    }


    lastMobile =
    current;


    if(
        works.length
    ){

        render();
    }
}


if(
    typeof media.addEventListener ===
    "function"
){

    media.addEventListener(
        "change",
        responsiveChange
    );

}else if(
    typeof media.addListener ===
    "function"
){

    media.addListener(
        responsiveChange
    );
}


/* =========================================================
   START
========================================================= */

function start(){

    if(
        started
    ){

        return;
    }


    const app =
    $("#swLatestApp");


    if(
        !app
    ){

        return;
    }


    started =
    true;


    loadData();


    refreshTimer =
    setInterval(
        loadData,
        REFRESH_MS
    );
}


/*
   Script có thể đặt cuối HTML hoặc trong HEAD.
*/
if(
    document.readyState ===
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
