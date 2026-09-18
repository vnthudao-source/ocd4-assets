(function(){

"use strict";

/* =========================================================
   OCD KNOWLEDGE ENGINE
   v1.1.0

   KIẾN TRÚC:
   ---------------------------------------------------------
   NopBaiLuyenTap
        ↓
   Submission Adapter
        ↓
   Normalizer
        ↓
   Exercise / Curriculum Resolver
        ↓
   Evidence Engine
        ↓
   Error Engine
        ↓
   Mastery Engine
        ↓
   Student Knowledge State
        ↓
   Minh Hồng / Tra cứu / Quest

   NGUYÊN TẮC:
   ---------------------------------------------------------
   - KHÔNG sửa StudentRewardSystem.
   - KHÔNG cộng/trừ Linh Thạch.
   - KHÔNG quản lý vật phẩm.
   - KHÔNG ghi Google Sheet.
   - Reward Core vẫn là nguồn sự thật tài sản.
   - Knowledge Engine là nguồn sự thật học tập.
========================================================= */


/* =========================================================
   GUARD
========================================================= */

if(
    window.OCD &&
    window.OCD.knowledge &&
    window.OCD.knowledge.version
){

    try{

        window.dispatchEvent(
            new CustomEvent(
                "ocdKnowledgeEngineReady",
                {
                    detail:{
                        version:
                            window.OCD.knowledge.version
                    }
                }
            )
        );

    }catch(error){}

    return;
}


/* =========================================================
   VERSION
========================================================= */

const VERSION="1.1.0";


/* =========================================================
   CONFIG
========================================================= */

const CONFIG={

    /*
       FILE NopBaiLuyenTap thật.
    */
    spreadsheetId:
        "1GJoTRsbq0kZfZrDdh0uCC667PwS3Bgkje2fHQnwnCKs",

    submissionSheetName:
        "Form Responses 1",

    gradingSheetName:
        "ChamDiem",

    timeZone:
        "Asia/Ho_Chi_Minh",

    cacheTtl:
        30000,

    maxEvidencePerNode:
        5,

    recencyWeights:[
        1.00,
        0.85,
        0.70,
        0.55,
        0.40
    ],

    evidenceWeights:{

        PRIMARY:1.00,

        SECONDARY:0.50,

        INCIDENTAL:0.25
    },

    confidenceWeights:{

        VERY_HIGH:1.00,

        HIGH:0.90,

        MEDIUM:0.70,

        LOW:0.40
    }
};


/* =========================================================
   STATES
========================================================= */

const MASTERY_STATES={

    LOCKED:"LOCKED",

    AVAILABLE:"AVAILABLE",

    LEARNING:"LEARNING",

    PRACTICING:"PRACTICING",

    ACHIEVED:"ACHIEVED",

    STABLE:"STABLE",

    MASTERED:"MASTERED",

    REVIEW:"REVIEW"
};


const MASTERY_RANK={

    LOCKED:0,

    AVAILABLE:1,

    LEARNING:2,

    PRACTICING:3,

    ACHIEVED:4,

    STABLE:5,

    MASTERED:6,

    REVIEW:3
};


const QUALITY_STATES={

    NOT_PERFORMED:"NOT_PERFORMED",

    INITIAL:"INITIAL",

    FORMING:"FORMING",

    UNSTABLE:"UNSTABLE",

    BASIC:"BASIC",

    DEVELOPING:"DEVELOPING",

    GOOD:"GOOD",

    VERY_GOOD:"VERY_GOOD",

    EXCELLENT:"EXCELLENT",

    OUTSTANDING:"OUTSTANDING"
};


const TREND_STATES={

    STRONG_IMPROVEMENT:
        "STRONG_IMPROVEMENT",

    IMPROVING:
        "IMPROVING",

    STABLE:
        "STABLE",

    FLUCTUATING:
        "FLUCTUATING",

    DECLINING:
        "DECLINING",

    UNKNOWN:
        "UNKNOWN"
};


const STABILITY_STATES={

    LOW:"LOW",

    DEVELOPING:"DEVELOPING",

    MODERATE:"MODERATE",

    HIGH:"HIGH",

    VERY_HIGH:"VERY_HIGH"
};


const CONFIDENCE_STATES={

    LOW:"LOW",

    MEDIUM:"MEDIUM",

    HIGH:"HIGH",

    VERY_HIGH:"VERY_HIGH"
};


const ERROR_SEVERITIES={

    MINOR:"MINOR",

    MEDIUM:"MEDIUM",

    MAJOR:"MAJOR",

    BLOCKING:"BLOCKING"
};


const ERROR_LIFECYCLE={

    NEW:"NEW",

    REPEATED:"REPEATED",

    PERSISTENT:"PERSISTENT",

    IMPROVING:"IMPROVING",

    RESOLVED:"RESOLVED"
};


/* =========================================================
   BASIC FALLBACK UTILITIES
========================================================= */

function fallbackNormalizeText(value){

    return String(
        value === undefined ||
        value === null
            ? ""
            : value
    )
    .trim()
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
        /[^a-z0-9\s\-]/g,
        " "
    )
    .replace(
        /\s+/g,
        " "
    )
    .trim();
}


function fallbackNormalizeCode(value){

    return String(
        value === undefined ||
        value === null
            ? ""
            : value
    )
    .trim()
    .toUpperCase();
}


function normalizeText(value){

    const RS=
        window.StudentRewardSystem;

    if(
        RS &&
        typeof RS.normalizeText ===
        "function"
    ){

        return RS.normalizeText(value);
    }

    return fallbackNormalizeText(value);
}


function normalizeCode(value){

    const RS=
        window.StudentRewardSystem;

    if(
        RS &&
        typeof RS.normalizeCode ===
        "function"
    ){

        return RS.normalizeCode(value);
    }

    return fallbackNormalizeCode(value);
}


function parseScore(value){

    const RS=
        window.StudentRewardSystem;

    if(
        RS &&
        typeof RS.parseScore ===
        "function"
    ){

        return RS.parseScore(value);
    }


    if(
        value === null ||
        value === undefined ||
        String(value).trim() === ""
    ){

        return null;
    }


    const number=
        Number(
            String(value)
            .replace(",",".")
        );


    return Number.isFinite(number)
        ? number
        : null;
}


function parseDate(value){

    const RS=
        window.StudentRewardSystem;

    if(
        RS &&
        typeof RS.parseVietnameseDate ===
        "function"
    ){

        return RS.parseVietnameseDate(value);
    }


    const date=
        new Date(value);


    return Number.isNaN(
        date.getTime()
    )
        ? null
        : date;
}


function round(
    value,
    decimals
){

    const factor=
        Math.pow(
            10,
            decimals === undefined
                ? 2
                : decimals
        );


    return Math.round(
        Number(value || 0) *
        factor
    ) / factor;
}


function clamp(
    value,
    min,
    max
){

    return Math.max(
        min,
        Math.min(
            max,
            value
        )
    );
}


/* =========================================================
   CSV / SHEET
========================================================= */

function sheetUrl(sheetName){

    const RS=
        window.StudentRewardSystem;


    if(
        RS &&
        typeof RS.sheetNameCsvUrl ===
        "function"
    ){

        return RS.sheetNameCsvUrl(
            sheetName,
            CONFIG.spreadsheetId
        );
    }


    return(
        "https://docs.google.com/spreadsheets/d/"
        +
        encodeURIComponent(
            CONFIG.spreadsheetId
        )
        +
        "/gviz/tq?tqx=out:csv&sheet="
        +
        encodeURIComponent(
            sheetName
        )
    );
}


async function fetchRows(sheetName){

    const RS=
        window.StudentRewardSystem;


    if(
        RS &&
        typeof RS.fetchRows ===
        "function"
    ){

        return RS.fetchRows(
            sheetUrl(sheetName)
        );
    }


    const response=
        await fetch(
            sheetUrl(sheetName),
            {
                cache:"no-store"
            }
        );


    if(!response.ok){

        throw new Error(
            "Không tải được dữ liệu Knowledge Engine."
        );
    }


    const text=
        await response.text();


    if(
        RS &&
        typeof RS.parseCSV ===
        "function"
    ){

        return RS.parseCSV(text);
    }


    throw new Error(
        "StudentRewardSystem.parseCSV chưa sẵn sàng."
    );
}


function findColumn(
    headers,
    aliases
){

    const RS=
        window.StudentRewardSystem;


    if(
        RS &&
        typeof RS.findColumn ===
        "function"
    ){

        return RS.findColumn(
            headers,
            aliases
        );
    }


    const normalized=
        headers.map(
            normalizeText
        );


    for(
        let i=0;
        i<aliases.length;
        i++
    ){

        const wanted=
            normalizeText(
                aliases[i]
            );


        const exact=
            normalized.indexOf(
                wanted
            );


        if(exact >= 0){
            return exact;
        }
    }


    return -1;
}


/* =========================================================
   KNOWLEDGE REGISTRY
   45 NODES
========================================================= */

const KNOWLEDGE_NODES=[

/* K01 */

{
    id:"K01.01",
    domain:"K01",
    name:"Khái niệm thư pháp",
    prerequisites:[]
},

{
    id:"K01.02",
    domain:"K01",
    name:"Viết và vẽ chữ",
    prerequisites:["K01.01"]
},

{
    id:"K01.03",
    domain:"K01",
    name:"Hình – Kỹ – Ý – Thần",
    prerequisites:["K01.01"]
},

{
    id:"K01.04",
    domain:"K01",
    name:"Tính tự nhiên",
    prerequisites:["K01.02","K01.03"]
},


/* K02 */

{
    id:"K02.01",
    domain:"K02",
    name:"Bút lông",
    prerequisites:[]
},

{
    id:"K02.02",
    domain:"K02",
    name:"Mực",
    prerequisites:[]
},

{
    id:"K02.03",
    domain:"K02",
    name:"Giấy",
    prerequisites:[]
},

{
    id:"K02.04",
    domain:"K02",
    name:"Phối hợp bút–mực–giấy",
    prerequisites:[
        "K02.01",
        "K02.02",
        "K02.03"
    ]
},


/* K03 */

{
    id:"K03.01",
    domain:"K03",
    name:"Cầm bút",
    prerequisites:[]
},

{
    id:"K03.02",
    domain:"K03",
    name:"Khởi bút",
    prerequisites:["K03.01"]
},

{
    id:"K03.03",
    domain:"K03",
    name:"Hành bút",
    prerequisites:["K03.01"]
},

{
    id:"K03.04",
    domain:"K03",
    name:"Thu bút",
    prerequisites:[
        "K03.02",
        "K03.03"
    ]
},

{
    id:"K03.05",
    domain:"K03",
    name:"Điều phong",
    prerequisites:[
        "K03.02",
        "K03.03"
    ]
},

{
    id:"K03.06",
    domain:"K03",
    name:"Bút lực",
    prerequisites:["K03.03"]
},

{
    id:"K03.07",
    domain:"K03",
    name:"Chuyển hướng",
    prerequisites:[
        "K03.03",
        "K03.05"
    ]
},


/* K04 */

{
    id:"K04.01",
    domain:"K04",
    name:"Lộ phong",
    prerequisites:[
        "K03.02",
        "K03.05"
    ]
},

{
    id:"K04.02",
    domain:"K04",
    name:"Tàng phong",
    prerequisites:[
        "K03.02",
        "K03.05"
    ]
},

{
    id:"K04.03",
    domain:"K04",
    name:"Viên bút",
    prerequisites:[
        "K03.05",
        "K03.06"
    ]
},

{
    id:"K04.04",
    domain:"K04",
    name:"Phương bút",
    prerequisites:[
        "K03.05",
        "K03.06"
    ]
},

{
    id:"K04.05",
    domain:"K04",
    name:"Liên tục đường bút",
    prerequisites:[
        "K03.03",
        "K03.07"
    ]
},

{
    id:"K04.06",
    domain:"K04",
    name:"Biến hóa bút pháp",
    prerequisites:[
        "K04.01",
        "K04.02",
        "K04.03",
        "K04.04"
    ]
},


/* K05 */

{
    id:"K05.01",
    domain:"K05",
    name:"Tỷ lệ chữ",
    prerequisites:[]
},

{
    id:"K05.02",
    domain:"K05",
    name:"Trọng tâm",
    prerequisites:["K05.01"]
},

{
    id:"K05.03",
    domain:"K05",
    name:"Kết cấu chữ",
    prerequisites:[
        "K05.01",
        "K05.02"
    ]
},

{
    id:"K05.04",
    domain:"K05",
    name:"Biến hóa hình thái",
    prerequisites:["K05.03"]
},


/* K06 */

{
    id:"K06.01",
    domain:"K06",
    name:"Quan sát mẫu",
    prerequisites:[]
},

{
    id:"K06.02",
    domain:"K06",
    name:"Lâm hình",
    prerequisites:[
        "K06.01",
        "K05.01"
    ]
},

{
    id:"K06.03",
    domain:"K06",
    name:"Lâm bút pháp",
    prerequisites:[
        "K06.01",
        "K03.05"
    ]
},

{
    id:"K06.04",
    domain:"K06",
    name:"Lâm ý",
    prerequisites:[
        "K06.02",
        "K06.03"
    ]
},


/* K07 */

{
    id:"K07.01",
    domain:"K07",
    name:"Đường cơ sở",
    prerequisites:[]
},

{
    id:"K07.02",
    domain:"K07",
    name:"Khoảng cách chữ",
    prerequisites:["K07.01"]
},

{
    id:"K07.03",
    domain:"K07",
    name:"Kích thước chữ",
    prerequisites:["K05.01"]
},

{
    id:"K07.04",
    domain:"K07",
    name:"Trục chữ",
    prerequisites:["K05.02"]
},

{
    id:"K07.05",
    domain:"K07",
    name:"Cân bằng động–tĩnh",
    prerequisites:[
        "K07.02",
        "K07.03",
        "K07.04"
    ]
},

{
    id:"K07.06",
    domain:"K07",
    name:"Bố cục tác phẩm",
    prerequisites:[
        "K07.01",
        "K07.02",
        "K07.03",
        "K07.04",
        "K07.05"
    ]
},


/* K08 */

{
    id:"K08.01",
    domain:"K08",
    name:"Khô–nhuận",
    prerequisites:["K02.04"]
},

{
    id:"K08.02",
    domain:"K08",
    name:"Tốc độ hành bút",
    prerequisites:["K03.03"]
},

{
    id:"K08.03",
    domain:"K08",
    name:"Tiết tấu",
    prerequisites:[
        "K08.02",
        "K03.07"
    ]
},

{
    id:"K08.04",
    domain:"K08",
    name:"Phi bạch",
    prerequisites:[
        "K08.01",
        "K08.02"
    ]
},


/* K09 */

{
    id:"K09.01",
    domain:"K09",
    name:"Tự nhiên trong nét",
    prerequisites:[
        "K03.05",
        "K03.06"
    ]
},

{
    id:"K09.02",
    domain:"K09",
    name:"Biểu đạt",
    prerequisites:[
        "K01.03",
        "K09.01"
    ]
},

{
    id:"K09.03",
    domain:"K09",
    name:"Thần thái",
    prerequisites:[
        "K09.01",
        "K09.02"
    ]
},


/* K10 */

{
    id:"K10.01",
    domain:"K10",
    name:"Sáng tác chữ đơn",
    prerequisites:[
        "K05.03",
        "K04.06"
    ]
},

{
    id:"K10.02",
    domain:"K10",
    name:"Sáng tác cụm chữ",
    prerequisites:[
        "K10.01",
        "K07.02"
    ]
},

{
    id:"K10.03",
    domain:"K10",
    name:"Tác phẩm hoàn chỉnh",
    prerequisites:[
        "K10.02",
        "K07.06",
        "K09.03"
    ]
},

{
    id:"K10.04",
    domain:"K10",
    name:"Tự đánh giá",
    prerequisites:["K10.01"]
},

{
    id:"K10.05",
    domain:"K10",
    name:"Đánh giá tác phẩm",
    prerequisites:[
        "K10.03",
        "K10.04"
    ]
}

];


/* =========================================================
   KNOWLEDGE MAP
========================================================= */

const KNOWLEDGE_MAP=
    new Map();


KNOWLEDGE_NODES.forEach(
    function(node){

        KNOWLEDGE_MAP.set(
            node.id,
            Object.assign(
                {
                    questEligible:true,

                    questTypes:[
                        "learn",
                        "practice",
                        "improve",
                        "master"
                    ]
                },
                node
            )
        );
    }
);


/* =========================================================
   EXERCISE REGISTRY
   37 STANDARD EXERCISES
========================================================= */

const EXERCISES=[

{
 id:"EX03-01",
 name:"Cầm bút",
 primary:["K03.01"],
 secondary:[],
 aliases:[
    "cam but",
    "bai cam but"
 ]
},

{
 id:"EX03-02",
 name:"Khởi–hành–thu bút",
 primary:[
    "K03.02",
    "K03.03"
 ],
 secondary:["K03.04"],
 aliases:[
    "khoi hanh thu but",
    "khoi but hanh but thu but"
 ]
},

{
 id:"EX03-03",
 name:"Điều phong",
 primary:["K03.05"],
 secondary:["K03.03"],
 aliases:[
    "dieu phong",
    "bai dieu phong"
 ]
},

{
 id:"EX03-04",
 name:"Bút lực",
 primary:["K03.06"],
 secondary:["K03.03"],
 aliases:[
    "but luc",
    "bai but luc"
 ]
},

{
 id:"EX03-05",
 name:"Thu bút",
 primary:["K03.04"],
 secondary:[],
 aliases:[
    "thu but",
    "bai thu but"
 ]
},


{
 id:"EX04-01",
 name:"Lộ phong",
 primary:["K04.01"],
 secondary:[
    "K03.02",
    "K03.05"
 ],
 aliases:[
    "lo phong",
    "bai lo phong",
    "nop bai lo phong"
 ]
},

{
 id:"EX04-02",
 name:"Tàng phong",
 primary:["K04.02"],
 secondary:[
    "K03.02",
    "K03.05"
 ],
 aliases:[
    "tang phong",
    "bai tang phong",
    "nop bai tang phong"
 ]
},

{
 id:"EX04-03",
 name:"Viên bút",
 primary:["K04.03"],
 secondary:[
    "K03.05",
    "K03.06"
 ],
 aliases:[
    "vien but",
    "bai vien but",
    "bai tap vien but",
    "bai tap ve nha cu vien but"
 ]
},

{
 id:"EX04-04",
 name:"Phương bút",
 primary:["K04.04"],
 secondary:[
    "K03.05",
    "K03.06"
 ],
 aliases:[
    "phuong but",
    "bai phuong but"
 ]
},

{
 id:"EX04-05",
 name:"Chuyển hướng",
 primary:["K03.07"],
 secondary:[
    "K04.05"
 ],
 aliases:[
    "chuyen huong",
    "bai chuyen huong"
 ]
},

{
 id:"EX04-06",
 name:"Phối hợp bút pháp",
 primary:["K04.06"],
 secondary:[
    "K04.01",
    "K04.02",
    "K04.03",
    "K04.04"
 ],
 aliases:[
    "phoi hop but phap",
    "but phap tong hop"
 ]
},


{
 id:"EX05-01",
 name:"Tỷ lệ chữ",
 primary:["K05.01"],
 secondary:[],
 aliases:[
    "ty le chu"
 ]
},

{
 id:"EX05-02",
 name:"Trọng tâm chữ",
 primary:["K05.02"],
 secondary:[],
 aliases:[
    "trong tam",
    "trong tam chu"
 ]
},

{
 id:"EX05-03",
 name:"Kết cấu chữ",
 primary:["K05.03"],
 secondary:[],
 aliases:[
    "ket cau",
    "ket cau chu"
 ]
},

{
 id:"EX05-04",
 name:"Biến hóa hình thái",
 primary:["K05.04"],
 secondary:[],
 aliases:[
    "bien hoa hinh thai"
 ]
},


{
 id:"EX06-01",
 name:"Lâm mô chữ đơn",
 primary:[
    "K06.01",
    "K06.02"
 ],
 secondary:["K05.03"],
 aliases:[
    "lam mo chu don"
 ]
},

{
 id:"EX06-02",
 name:"Lâm mô bút pháp",
 primary:["K06.03"],
 secondary:[
    "K03.05",
    "K04.06"
 ],
 aliases:[
    "lam mo but phap"
 ]
},

{
 id:"EX06-03",
 name:"Lâm mô cụm chữ",
 primary:[
    "K06.02",
    "K07.02"
 ],
 secondary:[
    "K07.03",
    "K07.04"
 ],
 aliases:[
    "lam mo cum chu"
 ]
},

{
 id:"EX06-04",
 name:"Lâm mô tổng hợp",
 primary:[
    "K06.04"
 ],
 secondary:[
    "K06.02",
    "K06.03",
    "K07.06"
 ],
 aliases:[
    "lam mo tong hop"
 ]
},


{
 id:"EX07-01",
 name:"Đường cơ sở",
 primary:["K07.01"],
 secondary:[],
 aliases:[
    "duong co so"
 ]
},

{
 id:"EX07-02",
 name:"Khoảng cách chữ",
 primary:["K07.02"],
 secondary:[],
 aliases:[
    "khoang cach chu"
 ]
},

{
 id:"EX07-03",
 name:"Lớn nhỏ",
 primary:["K07.03"],
 secondary:["K05.01"],
 aliases:[
    "lon nho",
    "kich thuoc chu"
 ]
},

{
 id:"EX07-04",
 name:"Trục chữ",
 primary:["K07.04"],
 secondary:["K05.02"],
 aliases:[
    "truc chu"
 ]
},

{
 id:"EX07-05",
 name:"Bố cục ngắn",
 primary:["K07.06"],
 secondary:[
    "K07.01",
    "K07.02",
    "K07.03",
    "K07.04"
 ],
 aliases:[
    "bo cuc",
    "bo cuc ngan"
 ]
},

{
 id:"EX07-06",
 name:"Cân bằng động–tĩnh",
 primary:["K07.05"],
 secondary:["K07.06"],
 aliases:[
    "can bang dong tinh"
 ]
},


{
 id:"EX08-01",
 name:"Khô–nhuận",
 primary:["K08.01"],
 secondary:["K02.04"],
 aliases:[
    "kho nhuan"
 ]
},

{
 id:"EX08-02",
 name:"Nhanh–chậm",
 primary:["K08.02"],
 secondary:["K03.03"],
 aliases:[
    "nhanh cham",
    "toc do"
 ]
},

{
 id:"EX08-03",
 name:"Tiết tấu",
 primary:["K08.03"],
 secondary:["K08.02"],
 aliases:[
    "tiet tau"
 ]
},

{
 id:"EX08-04",
 name:"Phi bạch",
 primary:["K08.04"],
 secondary:[
    "K08.01",
    "K08.02"
 ],
 aliases:[
    "phi bach"
 ]
},


{
 id:"EX09-01",
 name:"Tự nhiên trong nét",
 primary:["K09.01"],
 secondary:[
    "K03.05",
    "K03.06"
 ],
 aliases:[
    "tu nhien trong net"
 ]
},

{
 id:"EX09-02",
 name:"Hình và ý",
 primary:["K09.02"],
 secondary:["K01.03"],
 aliases:[
    "hinh va y"
 ]
},

{
 id:"EX09-03",
 name:"Thần thái",
 primary:["K09.03"],
 secondary:["K09.02"],
 aliases:[
    "than thai"
 ]
},


{
 id:"EX10-01",
 name:"Sáng tác chữ đơn",
 primary:["K10.01"],
 secondary:[],
 aliases:[
    "sang tac chu don"
 ]
},

{
 id:"EX10-02",
 name:"Sáng tác cụm chữ",
 primary:["K10.02"],
 secondary:[
    "K07.02"
 ],
 aliases:[
    "sang tac cum chu"
 ]
},

{
 id:"EX10-03",
 name:"Sáng tác tác phẩm",
 primary:["K10.03"],
 secondary:[
    "K07.06",
    "K09.03"
 ],
 aliases:[
    "sang tac tac pham"
 ]
},

{
 id:"EX10-04",
 name:"Tự phẩm bình",
 primary:["K10.04"],
 secondary:[],
 aliases:[
    "tu pham binh"
 ]
},

{
 id:"EX10-05",
 name:"Phẩm bình tác phẩm",
 primary:["K10.05"],
 secondary:["K10.04"],
 aliases:[
    "pham binh tac pham"
 ]
}

];


/* =========================================================
   EXERCISE MAP
========================================================= */

const EXERCISE_MAP=
    new Map();


EXERCISES.forEach(
    function(exercise){

        EXERCISE_MAP.set(
            exercise.id,
            exercise
        );
    }
);


/* =========================================================
   PRACTICE UNITS
========================================================= */

const PRACTICE_UNITS=[

{
 id:"PU-NET-CHAM",
 name:"Nét chấm",
 aliases:[
    "net cham",
    "cham"
 ],
 exercises:[
    "EX03-02",
    "EX03-03"
 ]
},

{
 id:"PU-NET-LUON",
 name:"Nét lượn",
 aliases:[
    "net luon",
    "bt net luon"
 ],
 exercises:[
    "EX04-05",
    "EX03-03"
 ]
},

{
 id:"PU-NET-MOC",
 name:"Nét móc",
 aliases:[
    "net moc",
    "moc"
 ],
 exercises:[
    "EX04-05",
    "EX03-03"
 ]
},

{
 id:"PU-NET-HAT",
 name:"Nét hất",
 aliases:[
    "net hat",
    "hat"
 ],
 exercises:[
    "EX04-05",
    "EX03-03"
 ]
},

{
 id:"PU-NET-CONG",
 name:"Nét cong-vòng",
 aliases:[
    "net cong vong",
    "net cong",
    "net vong"
 ],
 exercises:[
    "EX04-05",
    "EX03-03"
 ]
},

{
 id:"PU-AM-GHEP",
 name:"Âm ghép",
 aliases:[
    "am ghep",
    "bai tap am ghep"
 ],
 exercises:[
    "EX05-03",
    "EX07-02"
 ]
},

{
 id:"PU-CHU-GHEP",
 name:"Chữ ghép",
 aliases:[
    "chu ghep",
    "bai tap chu ghep"
 ],
 exercises:[
    "EX05-03",
    "EX07-02"
 ]
},

{
 id:"PU-CHU-THUONG",
 name:"Bảng chữ cái thường",
 aliases:[
    "bang chu cai thuong",
    "chu viet thuong"
 ],
 exercises:[
    "EX05-01",
    "EX05-03"
 ]
},

{
 id:"PU-CHU-HOA",
 name:"Bảng chữ cái in hoa",
 aliases:[
    "bang chu cai in hoa",
    "chu viet hoa",
    "viet chu hoa"
 ],
 exercises:[
    "EX05-01",
    "EX05-03"
 ]
}

];


/* =========================================================
   CURRICULUM MAP
========================================================= */

const CURRICULUM_MAP={

    3:{
        practiceNames:[
            "Vô vi"
        ],
        exercises:[
            "EX06-03"
        ]
    },

    4:{
        practiceNames:[
            "Bền bỉ"
        ],
        exercises:[
            "EX06-03"
        ]
    },

    5:{
        practiceNames:[
            "Biển học vô bờ"
        ],
        exercises:[
            "EX06-03"
        ]
    },

    7:{
        practiceNames:[
            "Ân sư vĩnh ký"
        ],
        exercises:[
            "EX06-03"
        ]
    },

    8:{
        practiceNames:[
            "Độc lập tự do"
        ],
        exercises:[
            "EX06-03"
        ]
    },

    9:{
        practiceNames:[
            "Chữ viết hoa"
        ],
        exercises:[
            "EX05-01",
            "EX05-03"
        ]
    },

    10:{
        practiceNames:[
            "Chữ viết thường"
        ],
        exercises:[
            "EX05-01",
            "EX05-03"
        ]
    },

    11:{
        practiceNames:[
            "Phật"
        ],
        exercises:[
            "EX06-01"
        ]
    },

    12:{
        practiceNames:[
            "Căn bản"
        ],
        exercises:[
            "EX06-03"
        ]
    },

    15:{
        practiceNames:[
            "Nét chấm",
            "Vạn sự thuận lợi"
        ],
        exercises:[
            "EX03-02",
            "EX03-03",
            "EX06-03"
        ]
    },

    17:{
        practiceNames:[
            "Nét móc",
            "Nét hất",
            "Vạn sự như ý"
        ],
        exercises:[
            "EX04-05",
            "EX03-03",
            "EX06-03"
        ]
    },

    19:{
        practiceNames:[
            "Nét lượn",
            "Ôn hoà nhẫn nại"
        ],
        exercises:[
            "EX04-05",
            "EX03-03",
            "EX06-03"
        ]
    }
};


/* =========================================================
   LÂM MÔ TITLES
========================================================= */

const LAM_MO_TITLES=[

    "van su nhu y",
    "van su thuan loi",
    "gia hoa van su hung",
    "am thuy tu nguyen",
    "doc lap tu do",
    "on hoa nhan nai",
    "bien hoc vo bo",
    "an su vinh ky",
    "ben bi",
    "vo vi",
    "tet doan vien",
    "an khang thinh vuong",
    "ton su trong dao"
];


/* =========================================================
   ERROR MAP
   v1.1
========================================================= */

const ERROR_MAP={};


/* =========================================================
   REGISTER ERROR
========================================================= */

function registerErrors(
    exerciseId,
    knowledgeId,
    definitions
){

    definitions.forEach(
        function(definition){

            ERROR_MAP[
                definition[0]
            ]={

                id:
                    definition[0],

                name:
                    definition[1],

                exerciseId,

                knowledgeId,

                severity:
                    definition[2] ||
                    ERROR_SEVERITIES.MEDIUM,

                keywords:
                    definition[3] ||
                    []
            };
        }
    );
}


/* =========================================================
   E03
========================================================= */

registerErrors(
"EX03-01",
"K03.01",
[
["GRIP01","Sai vị trí cầm","MAJOR",
 ["sai vi tri cam","cam but sai"]],

["GRIP02","Cầm bút quá chặt","MEDIUM",
 ["cam qua chat","but qua chat"]],

["GRIP03","Cầm bút quá lỏng","MEDIUM",
 ["cam qua long"]],

["GRIP04","Cổ tay gượng","MEDIUM",
 ["co tay guong","co tay cung"]],

["GRIP05","Góc bút không phù hợp","MEDIUM",
 ["goc but","do nghieng but"]]
]
);


registerErrors(
"EX03-02",
"K03.02",
[
["STK01","Khởi bút lỗi","MEDIUM",
 ["khoi but chua dung","khoi but sai"]],

["STK02","Hành bút mất kiểm soát","MAJOR",
 ["hanh but mat kiem soat"]],

["STK03","Thu bút đột ngột","MEDIUM",
 ["thu but dot ngot"]],

["STK04","Đường bút đứt","MEDIUM",
 ["duong but dut","net dut"]],

["STK05","Dừng không cần thiết","MEDIUM",
 ["dung qua lau","dung khong can thiet"]]
]
);


registerErrors(
"EX03-03",
"K03.05",
[
["FNG01","Đầu bút tán","MEDIUM",
 ["dau but tan","but tan"]],

["FNG02","Không thu phong","MAJOR",
 ["khong thu phong"]],

["FNG03","Mất trung tâm","MAJOR",
 ["mat trung tam","mat trung phong"]],

["FNG04","Điều chỉnh quá nhiều","MEDIUM",
 ["dieu chinh qua nhieu"]],

["FNG05","Mất phong khi đổi hướng","MAJOR",
 ["mat phong khi doi huong"]]
]
);


registerErrors(
"EX03-04",
"K03.06",
[
["PWR01","Nét yếu","MEDIUM",
 ["net yeu","luc yeu","thieu luc"]],

["PWR02","Ấn quá mạnh","MEDIUM",
 ["an qua manh","luc qua manh"]],

["PWR03","Lực không đều","MEDIUM",
 ["luc khong deu"]],

["PWR04","Lực cứng","MEDIUM",
 ["luc cung","net cung"]],

["PWR05","Thiếu biến hóa lực","MINOR",
 ["thieu bien hoa luc"]]
]
);


registerErrors(
"EX03-05",
"K03.04",
[
["END01","Dừng đột ngột","MEDIUM",
 ["dung dot ngot"]],

["END02","Kéo đuôi","MEDIUM",
 ["keo duoi"]],

["END03","Tụ mực cuối nét","MEDIUM",
 ["tu muc cuoi"]],

["END04","Thu quá gấp","MEDIUM",
 ["thu qua gap"]],

["END05","Tô sửa cuối nét","BLOCKING",
 ["to sua cuoi","sua cuoi net"]]
]
);


/* =========================================================
   E04
========================================================= */

registerErrors(
"EX04-01",
"K04.01",
[
["LF01","Đầu nét không rõ","MEDIUM",
 ["dau net khong ro"]],

["LF02","Sai hướng vào","MAJOR",
 ["sai huong vao","dau net sai huong"]],

["LF03","Thừa mực đầu nét","MEDIUM",
 ["thua muc dau","du muc dau"]],

["LF04","Đầu nét thiếu lực","MEDIUM",
 ["dau net thieu luc"]],

["LF05","Tô sửa","BLOCKING",
 ["to sua","sua net"]],

["LF06","Khởi bút ngập ngừng","MEDIUM",
 ["khoi but ngap ngung","ngap ngung"]]
]
);


registerErrors(
"EX04-02",
"K04.02",
[
["TF01","Lộ đầu bút","MAJOR",
 ["lo dau but"]],

["TF02","Hồi phong quá mạnh","MEDIUM",
 ["hoi phong qua manh"]],

["TF03","Đầu nét phình","MEDIUM",
 ["dau net phinh"]],

["TF04","Thao tác gượng","MEDIUM",
 ["thao tac guong"]],

["TF05","Mất phong","MAJOR",
 ["mat phong"]]
]
);


registerErrors(
"EX04-03",
"K04.03",
[
["VB01","Viên bút bị bẹt","MEDIUM",
 ["vien but bet","net bet","con bet"]],

["VB02","Viên bút méo","MEDIUM",
 ["vien but meo","net meo"]],

["VB03","Viên bút thiếu lực","MEDIUM",
 ["vien but thieu luc","luc yeu"]],

["VB04","Đầu bút tán","MAJOR",
 ["dau but tan"]],

["VB05","Độ dày bất thường","MEDIUM",
 ["do day khong deu","do day bat thuong"]]
]
);


registerErrors(
"EX04-04",
"K04.04",
[
["PB01","Góc mờ","MEDIUM",
 ["goc mo"]],

["PB02","Góc quá cứng","MEDIUM",
 ["goc qua cung"]],

["PB03","Sai hướng","MAJOR",
 ["sai huong"]],

["PB04","Đầu nét méo","MEDIUM",
 ["dau net meo"]],

["PB05","Cố tạo góc bằng tô","BLOCKING",
 ["tao goc bang to","to goc"]]
]
);


registerErrors(
"EX04-05",
"K03.07",
[
["TURN01","Gãy nét","MAJOR",
 ["gay net"]],

["TURN02","Dừng lâu","MEDIUM",
 ["dung lau"]],

["TURN03","Tụ mực","MEDIUM",
 ["tu muc"]],

["TURN04","Mất phong","MAJOR",
 ["mat phong"]],

["TURN05","Đổi hướng quá cứng","MEDIUM",
 ["doi huong qua cung"]]
]
);


registerErrors(
"EX04-06",
"K04.06",
[
["COMB01","Kỹ thuật rời rạc","MEDIUM",
 ["ky thuat roi rac"]],

["COMB02","Lạm dụng kỹ thuật","MEDIUM",
 ["lam dung ky thuat"]],

["COMB03","Thiếu nhất quán","MEDIUM",
 ["thieu nhat quan"]],

["COMB04","Chuyển kỹ thuật gượng","MEDIUM",
 ["chuyen ky thuat guong"]],

["COMB05","Kỹ thuật lấn át nội dung","MAJOR",
 ["ky thuat lan at noi dung"]]
]
);


/* =========================================================
   E05
========================================================= */

registerErrors(
"EX05-01",
"K05.01",
[
["PROP01","Chữ quá cao","MEDIUM",["chu qua cao"]],
["PROP02","Chữ quá rộng","MEDIUM",["chu qua rong"]],
["PROP03","Co kéo chữ","MEDIUM",["co keo"]],
["PROP04","Tỷ lệ không nhất quán","MEDIUM",
 ["ty le khong nhat quan","ty le chua dung"]]
]
);


registerErrors(
"EX05-02",
"K05.02",
[
["CTR01","Lệch trọng tâm","MAJOR",
 ["lech trong tam","trong tam lech"]],

["CTR02","Chữ đổ","MEDIUM",["chu do"]],

["CTR03","Nặng một phía","MEDIUM",
 ["nang mot phia"]],

["CTR04","Cân bằng quá cứng","MINOR",
 ["can bang qua cung"]]
]
);


registerErrors(
"EX05-03",
"K05.03",
[
["STR01","Bộ phận rời","MEDIUM",
 ["bo phan roi"]],

["STR02","Khoảng trong sai","MEDIUM",
 ["khoang trong sai"]],

["STR03","Phân bố trọng lượng sai","MAJOR",
 ["phan bo trong luong sai"]],

["STR04","Cấu trúc cứng","MEDIUM",
 ["cau truc cung"]]
]
);


registerErrors(
"EX05-04",
"K05.04",
[
["VAR01","Biến dạng quá mức","MAJOR",
 ["bien dang qua muc"]],

["VAR02","Mất nhận diện","BLOCKING",
 ["mat nhan dien"]],

["VAR03","Biến hóa tùy tiện","MAJOR",
 ["bien hoa tuy tien"]],

["VAR04","Lặp hình thái","MINOR",
 ["lap hinh thai"]],

["VAR05","Gượng ép","MEDIUM",
 ["guong ep"]]
]
);


/* =========================================================
   E06
========================================================= */

registerErrors(
"EX06-01",
"K06.02",
[
["COPY01","Nhìn sai tỷ lệ","MEDIUM",
 ["sai ty le"]],

["COPY02","Bỏ đặc điểm chính","MAJOR",
 ["bo dac diem chinh"]],

["COPY03","Sao chép máy móc","MEDIUM",
 ["sao chep may moc"]],

["COPY04","Chỉ nhìn đường viền","MEDIUM",
 ["chi nhin duong vien"]]
]
);


registerErrors(
"EX06-02",
"K06.03",
[
["COPYB01","Giống hình nhưng sai bút","MAJOR",
 ["giong hinh nhung sai but"]],

["COPYB02","Sai khởi bút","MAJOR",
 ["sai khoi but"]],

["COPYB03","Sai tốc độ","MEDIUM",
 ["sai toc do"]],

["COPYB04","Tô để giống mẫu","BLOCKING",
 ["to de giong mau"]]
]
);


registerErrors(
"EX06-03",
"K06.02",
[
["COPYG01","Sai khoảng cách","MEDIUM",
 ["sai khoang cach"]],

["COPYG02","Sai lớn nhỏ","MEDIUM",
 ["sai lon nho"]],

["COPYG03","Sai trục","MEDIUM",
 ["sai truc"]],

["COPYG04","Từng chữ đúng nhưng tổng thể sai","MAJOR",
 ["tong the sai"]]
]
);


registerErrors(
"EX06-04",
"K06.04",
[
["COPYX01","Chép máy móc","MEDIUM",
 ["chep may moc"]],

["COPYX02","Chỉ giống hình","MEDIUM",
 ["chi giong hinh"]],

["COPYX03","Mất tiết tấu","MEDIUM",
 ["mat tiet tau"]],

["COPYX04","Mất thần thái","MAJOR",
 ["mat than thai"]]
]
);


/* =========================================================
   E07
========================================================= */

registerErrors(
"EX07-01",
"K07.01",
[
["BASE01","Lên xuống vô thức","MEDIUM",
 ["duong co so","len xuong vo thuc"]],

["BASE02","Đường chữ nghiêng","MEDIUM",
 ["duong chu nghieng"]],

["BASE03","Đường cơ sở quá cứng","MINOR",
 ["duong co so qua cung"]]
]
);


registerErrors(
"EX07-02",
"K07.02",
[
["SPACE01","Khoảng cách quá sát","MEDIUM",
 ["qua sat"]],

["SPACE02","Khoảng cách quá xa","MEDIUM",
 ["qua xa"]],

["SPACE03","Khoảng cách đều máy móc","MINOR",
 ["deu may moc"]],

["SPACE04","Khoảng trống vô nghĩa","MEDIUM",
 ["khoang trong vo nghia"]]
]
);


registerErrors(
"EX07-03",
"K07.03",
[
["SIZE01","Lớn nhỏ tùy tiện","MEDIUM",
 ["lon nho tuy tien"]],

["SIZE02","Tất cả bằng nhau","MINOR",
 ["tat ca bang nhau"]],

["SIZE03","Tương phản quá mạnh","MEDIUM",
 ["tuong phan qua manh"]]
]
);


registerErrors(
"EX07-04",
"K07.04",
[
["AXIS01","Trục đổ","MEDIUM",
 ["truc do"]],

["AXIS02","Trục đơn điệu","MINOR",
 ["truc don dieu"]],

["AXIS03","Đổi trục vô lý","MEDIUM",
 ["doi truc vo ly"]]
]
);


registerErrors(
"EX07-05",
"K07.06",
[
["LAY01","Lệch bố cục","MAJOR",
 ["lech bo cuc"]],

["LAY02","Khoảng trống chết","MEDIUM",
 ["khoang trong chet"]],

["LAY03","Dồn một phía","MEDIUM",
 ["don mot phia"]],

["LAY04","Thiếu điểm nhấn","MINOR",
 ["thieu diem nhan"]]
]
);


registerErrors(
"EX07-06",
"K07.05",
[
["BAL01","Quá tĩnh","MINOR",["qua tinh"]],
["BAL02","Quá động","MINOR",["qua dong"]],
["BAL03","Tương phản gượng","MEDIUM",
 ["tuong phan guong"]],
["BAL04","Thiếu điểm nghỉ","MEDIUM",
 ["thieu diem nghi"]]
]
);


/* =========================================================
   E08
========================================================= */

registerErrors(
"EX08-01",
"K08.01",
[
["INK01","Quá ướt","MEDIUM",["qua uot"]],
["INK02","Quá khô","MEDIUM",["qua kho"]],
["INK03","Tụ mực","MEDIUM",["tu muc"]],
["INK04","Thay đổi vô thức","MEDIUM",
 ["thay doi vo thuc"]]
]
);


registerErrors(
"EX08-02",
"K08.02",
[
["SPD01","Quá nhanh","MEDIUM",["qua nhanh"]],
["SPD02","Quá chậm","MEDIUM",["qua cham"]],
["SPD03","Đều máy móc","MINOR",["deu may moc"]],
["SPD04","Đổi tốc độ vô lý","MEDIUM",
 ["doi toc do vo ly"]]
]
);


registerErrors(
"EX08-03",
"K08.03",
[
["RHY01","Đều đều","MINOR",["deu deu"]],
["RHY02","Nhịp vụn","MEDIUM",["nhip vun"]],
["RHY03","Tương phản quá mức","MEDIUM",
 ["tuong phan qua muc"]],
["RHY04","Thiếu điểm nghỉ","MEDIUM",
 ["thieu diem nghi"]]
]
);


registerErrors(
"EX08-04",
"K08.04",
[
["DRY01","Phi bạch giả","MAJOR",
 ["phi bach gia"]],

["DRY02","Quá khô","MEDIUM",
 ["qua kho"]],

["DRY03","Cào giấy","MAJOR",
 ["cao giay"]],

["DRY04","Phi bạch vô cớ","MEDIUM",
 ["phi bach vo co"]],

["DRY05","Cố tạo bằng sửa nét","BLOCKING",
 ["sua net","co tao phi bach"]]
]
);


/* =========================================================
   E09
========================================================= */

registerErrors(
"EX09-01",
"K09.01",
[
["NAT01","Tô sửa","BLOCKING",["to sua"]],
["NAT02","Ngập ngừng","MEDIUM",["ngap ngung"]],
["NAT03","Cố tạo hiệu ứng","MAJOR",
 ["co tao hieu ung"]],
["NAT04","Thao tác phô diễn","MEDIUM",
 ["thao tac pho dien"]]
]
);


registerErrors(
"EX09-02",
"K09.02",
[
["IDEA01","Chỉ chú trọng hình","MEDIUM",
 ["chi chu trong hinh"]],

["IDEA02","Ý áp đặt","MEDIUM",
 ["y ap dat"]],

["IDEA03","Kỹ thuật không phục vụ nội dung","MAJOR",
 ["ky thuat khong phuc vu noi dung"]]
]
);


registerErrors(
"EX09-03",
"K09.03",
[
["SPIRIT01","Nét rời","MEDIUM",["net roi"]],
["SPIRIT02","Phong cách bất nhất","MEDIUM",
 ["phong cach bat nhat"]],
["SPIRIT03","Hiệu ứng lấn át","MEDIUM",
 ["hieu ung lan at"]],
["SPIRIT04","Giả tạo","BLOCKING",["gia tao"]]
]
);


/* =========================================================
   E10
========================================================= */

registerErrors(
"EX10-01",
"K10.01",
[
["CRE01","Lệ thuộc mẫu","MEDIUM",
 ["le thuoc mau"]],
["CRE02","Kỹ thuật rời rạc","MEDIUM",
 ["ky thuat roi rac"]],
["CRE03","Tạo hình tùy tiện","MAJOR",
 ["tao hinh tuy tien"]]
]
);


registerErrors(
"EX10-02",
"K10.02",
[
["CREG01","Chữ không liên hệ","MEDIUM",
 ["chu khong lien he"]],
["CREG02","Khoảng cách sai","MEDIUM",
 ["khoang cach sai"]],
["CREG03","Thiếu nhịp","MEDIUM",
 ["thieu nhip"]]
]
);


registerErrors(
"EX10-03",
"K10.03",
[
["WORK01","Thiếu tổng thể","MAJOR",
 ["thieu tong the"]],
["WORK02","Điểm nhấn yếu","MEDIUM",
 ["diem nhan yeu"]],
["WORK03","Bố cục/mực/bút xung đột","MAJOR",
 ["bo cuc muc but xung dot"]],
["WORK04","Quá nhiều hiệu ứng","MEDIUM",
 ["qua nhieu hieu ung"]]
]
);


registerErrors(
"EX10-04",
"K10.04",
[
["SELF01","Chỉ nói đẹp/xấu","MEDIUM",
 ["chi noi dep xau"]],
["SELF02","Không chỉ ra nguyên nhân","MEDIUM",
 ["khong chi ra nguyen nhan"]],
["SELF03","Không đề xuất sửa","MEDIUM",
 ["khong de xuat sua"]]
]
);


registerErrors(
"EX10-05",
"K10.05",
[
["CRIT01","Chỉ dựa sở thích","MEDIUM",
 ["dua so thich"]],
["CRIT02","Chỉ nhìn hình","MEDIUM",
 ["chi nhin hinh"]],
["CRIT03","Bỏ bút pháp","MEDIUM",
 ["bo but phap"]],
["CRIT04","Kết luận không có bằng chứng","MAJOR",
 ["khong co bang chung"]]
]
);


/* =========================================================
   GENERIC TEACHER FEEDBACK
========================================================= */

const GENERAL_FEEDBACK_RULES=[

{
    id:"GENERAL_BASELINE",

    keywords:[
        "duong co so"
    ],

    knowledgeId:
        "K07.01",

    errorId:
        "BASE01"
},

{
    id:"GENERAL_ACCURACY",

    keywords:[
        "chuan xac duong net",
        "su chuan xac cua duong net",
        "chu y duong net"
    ],

    knowledgeId:null,

    errorId:null
}

];


/* =========================================================
   SCORE RUBRIC
========================================================= */

function qualityFromScore(score){

    if(
        score === null ||
        score === undefined
    ){

        return QUALITY_STATES
            .NOT_PERFORMED;
    }


    const rounded=
        Math.max(
            1,
            Math.min(
                10,
                Math.round(score)
            )
        );


    const map={

        1:"NOT_PERFORMED",

        2:"INITIAL",

        3:"FORMING",

        4:"UNSTABLE",

        5:"BASIC",

        6:"DEVELOPING",

        7:"GOOD",

        8:"VERY_GOOD",

        9:"EXCELLENT",

        10:"OUTSTANDING"
    };


    return map[rounded];
}


/* =========================================================
   RESOLUTION
========================================================= */

function detectWeek(text){

    const normalized=
        normalizeText(text);


    const match=
        normalized.match(
            /(?:tuan|week)\s*(\d{1,2})/
        );


    if(!match){
        return null;
    }


    const week=
        Number(match[1]);


    return Number.isFinite(week)
        ? week
        : null;
}


/* =========================================================
   FIND PRACTICE UNITS
========================================================= */

function findPracticeUnits(text){

    const normalized=
        normalizeText(text);


    const result=[];


    PRACTICE_UNITS.forEach(
        function(unit){

            const found=
                unit.aliases.some(
                    function(alias){

                        return normalized.includes(
                            normalizeText(alias)
                        );
                    }
                );


            if(found){

                result.push(unit);
            }
        }
    );


    return result;
}


/* =========================================================
   FIND EXACT EXERCISES
========================================================= */

function findExercisesByAlias(text){

    const normalized=
        normalizeText(text);


    const result=[];


    EXERCISES.forEach(
        function(exercise){

            const names=[
                exercise.name
            ]
            .concat(
                exercise.aliases || []
            );


            const found=
                names.some(
                    function(alias){

                        const key=
                            normalizeText(alias);


                        return(
                            normalized === key
                            ||
                            normalized.includes(key)
                        );
                    }
                );


            if(found){

                result.push(exercise);
            }
        }
    );


    return result;
}


/* =========================================================
   DETECT LÂM MÔ
========================================================= */

function detectLamMo(text){

    const normalized=
        normalizeText(text);


    if(
        !normalized.includes(
            "lam mo"
        )
    ){

        return null;
    }


    const knownTitle=
        LAM_MO_TITLES.find(
            function(title){

                return normalized.includes(
                    title
                );
            }
        );


    return{

        detected:true,

        title:
            knownTitle || "",

        exerciseId:
            knownTitle
            ?
            "EX06-03"
            :
            "EX06-04",

        confidence:
            knownTitle
            ?
            "HIGH"
            :
            "MEDIUM"
    };
}


/* =========================================================
   GENERIC DESCRIPTIONS
========================================================= */

function isGenericDescription(text){

    const normalized=
        normalizeText(text);


    return[

        "",
        ".",
        "bai tap",
        "bt",
        "luyen tap",
        "da nop",
        "bai tap bo sung"

    ].includes(normalized);
}


/* =========================================================
   RESOLVE DESCRIPTION
========================================================= */

function resolveDescription(rawDescription){

    const raw=
        String(
            rawDescription || ""
        )
        .trim();


    const normalized=
        normalizeText(raw);


    if(
        isGenericDescription(raw)
    ){

        return{

            rawDescription:
                raw,

            normalizedDescription:
                normalized,

            resolutionType:
                "UNKNOWN",

            confidence:
                "LOW",

            week:null,

            practiceUnits:[],

            exercises:[],

            knowledgeEvidence:[]
        };
    }


    const week=
        detectWeek(raw);


    const aliasExercises=
        findExercisesByAlias(raw);


    const practiceUnits=
        findPracticeUnits(raw);


    const lamMo=
        detectLamMo(raw);


    const exerciseIds=
        new Set();


    aliasExercises.forEach(
        function(exercise){

            exerciseIds.add(
                exercise.id
            );
        }
    );


    practiceUnits.forEach(
        function(unit){

            unit.exercises.forEach(
                function(id){

                    exerciseIds.add(id);
                }
            );
        }
    );


    if(lamMo){

        exerciseIds.add(
            lamMo.exerciseId
        );
    }


    let resolutionType=
        "UNKNOWN";


    let confidence=
        "LOW";


    if(
        aliasExercises.length === 1 &&
        !week &&
        practiceUnits.length <= 1
    ){

        resolutionType=
            "EXACT";

        confidence=
            "VERY_HIGH";

    }else if(
        exerciseIds.size > 0
    ){

        resolutionType=
            exerciseIds.size > 1
            ?
            "COMPOSITE"
            :
            "ALIAS";

        confidence=
            "HIGH";

    }else if(
        week &&
        CURRICULUM_MAP[week]
    ){

        CURRICULUM_MAP[
            week
        ]
        .exercises
        .forEach(
            function(id){

                exerciseIds.add(id);
            }
        );


        resolutionType=
            "CURRICULUM";

        confidence=
            "MEDIUM";
    }


    const exercises=
        Array.from(
            exerciseIds
        )
        .map(
            function(id){

                return EXERCISE_MAP.get(id);
            }
        )
        .filter(Boolean);


    const evidenceMap=
        new Map();


    exercises.forEach(
        function(exercise){

            exercise.primary
            .forEach(
                function(knowledgeId){

                    const current=
                        evidenceMap.get(
                            knowledgeId
                        );


                    if(
                        !current ||
                        current.evidenceType !==
                        "PRIMARY"
                    ){

                        evidenceMap.set(
                            knowledgeId,
                            {
                                knowledgeId,
                                exerciseId:
                                    exercise.id,
                                evidenceType:
                                    "PRIMARY",
                                weight:
                                    CONFIG
                                    .evidenceWeights
                                    .PRIMARY
                            }
                        );
                    }
                }
            );


            exercise.secondary
            .forEach(
                function(knowledgeId){

                    if(
                        evidenceMap.has(
                            knowledgeId
                        )
                    ){

                        return;
                    }


                    evidenceMap.set(
                        knowledgeId,
                        {
                            knowledgeId,
                            exerciseId:
                                exercise.id,
                            evidenceType:
                                "SECONDARY",
                            weight:
                                CONFIG
                                .evidenceWeights
                                .SECONDARY
                        }
                    );
                }
            );
        }
    );


    return{

        rawDescription:
            raw,

        normalizedDescription:
            normalized,

        resolutionType,

        confidence,

        week,

        practiceUnits:
            practiceUnits.map(
                function(unit){

                    return{
                        id:unit.id,
                        name:unit.name
                    };
                }
            ),

        exercises:
            exercises.map(
                function(exercise){

                    return{
                        id:
                            exercise.id,

                        name:
                            exercise.name
                    };
                }
            ),

        knowledgeEvidence:
            Array.from(
                evidenceMap.values()
            )
    };
}


/* =========================================================
   SUBMISSION COLUMNS
========================================================= */

function detectSubmissionColumns(rows){

    if(
        !rows ||
        !rows.length
    ){

        return {};
    }


    const headers=
        rows[0];


    return{

        timestamp:
            findColumn(
                headers,
                [
                    "Dấu thời gian",
                    "Timestamp"
                ]
            ),

        name:
            findColumn(
                headers,
                [
                    "Họ và tên",
                    "Họ tên"
                ]
            ),

        code:
            findColumn(
                headers,
                [
                    "Mã học viên"
                ]
            ),

        group:
            findColumn(
                headers,
                [
                    "Tổ"
                ]
            ),

        course:
            findColumn(
                headers,
                [
                    "Khóa",
                    "Khoá"
                ]
            ),

        image:
            findColumn(
                headers,
                [
                    "Tải bài tập lên"
                ]
            ),

        description:
            findColumn(
                headers,
                [
                    "Mô tả bài tập"
                ]
            ),

        score:
            findColumn(
                headers,
                [
                    "Điểm",
                    "Điểm số"
                ]
            ),

        comment:
            findColumn(
                headers,
                [
                    "Nhận xét"
                ]
            )
    };
}


/* =========================================================
   MAP SUBMISSIONS
========================================================= */

function mapSubmissionRows(rows){

    if(
        !rows ||
        rows.length < 2
    ){

        return [];
    }


    const c=
        detectSubmissionColumns(rows);


    return rows
    .slice(1)
    .map(
        function(row,index){

            const description=
                c.description >= 0
                ?
                row[c.description]
                :
                "";


            const resolution=
                resolveDescription(
                    description
                );


            return{

                source:
                    "NopBaiLuyenTap",

                rowIndex:
                    index+2,

                originalIndex:
                    index+1,

                timestamp:
                    c.timestamp >= 0
                    ?
                    String(
                        row[c.timestamp] || ""
                    ).trim()
                    :
                    "",

                studentName:
                    c.name >= 0
                    ?
                    String(
                        row[c.name] || ""
                    ).trim()
                    :
                    "",

                code:
                    c.code >= 0
                    ?
                    normalizeCode(
                        row[c.code]
                    )
                    :
                    "",

                group:
                    c.group >= 0
                    ?
                    String(
                        row[c.group] || ""
                    ).trim()
                    :
                    "",

                course:
                    c.course >= 0
                    ?
                    String(
                        row[c.course] || ""
                    ).trim()
                    :
                    "",

                image:
                    c.image >= 0
                    ?
                    String(
                        row[c.image] || ""
                    ).trim()
                    :
                    "",

                rawDescription:
                    String(
                        description || ""
                    ).trim(),

                score:
                    c.score >= 0
                    ?
                    parseScore(
                        row[c.score]
                    )
                    :
                    null,

                teacherComment:
                    c.comment >= 0
                    ?
                    String(
                        row[c.comment] || ""
                    ).trim()
                    :
                    "",

                resolution
            };
        }
    )
    .filter(
        function(item){

            return Boolean(
                item.code
            );
        }
    );
}


/* =========================================================
   CHAMDIEM
========================================================= */

function detectGradingColumns(rows){

    if(
        !rows ||
        !rows.length
    ){

        return {};
    }


    const headers=
        rows[0];


    return{

        timestamp:
            findColumn(
                headers,
                ["Dấu thời gian"]
            ),

        submissionId:
            findColumn(
                headers,
                ["Mã bài nộp"]
            ),

        name:
            findColumn(
                headers,
                ["Họ và tên"]
            ),

        code:
            findColumn(
                headers,
                ["Mã học viên"]
            ),

        image:
            findColumn(
                headers,
                ["Link tác phẩm"]
            ),

        score:
            findColumn(
                headers,
                [
                    "Điểm giáo viên",
                    "Điểm"
                ]
            ),

        comment:
            findColumn(
                headers,
                [
                    "Nhận xét GVCN",
                    "Nhận xét"
                ]
            )
    };
}


function mapGradingRows(rows){

    if(
        !rows ||
        rows.length < 2
    ){

        return [];
    }


    const c=
        detectGradingColumns(rows);


    return rows
    .slice(1)
    .map(
        function(row,index){

            return{

                source:
                    "ChamDiem",

                rowIndex:
                    index+2,

                timestamp:
                    c.timestamp >= 0
                    ?
                    String(
                        row[c.timestamp] || ""
                    ).trim()
                    :
                    "",

                submissionId:
                    c.submissionId >= 0
                    ?
                    String(
                        row[c.submissionId] || ""
                    ).trim()
                    :
                    "",

                studentName:
                    c.name >= 0
                    ?
                    String(
                        row[c.name] || ""
                    ).trim()
                    :
                    "",

                code:
                    c.code >= 0
                    ?
                    normalizeCode(
                        row[c.code]
                    )
                    :
                    "",

                image:
                    c.image >= 0
                    ?
                    String(
                        row[c.image] || ""
                    ).trim()
                    :
                    "",

                score:
                    c.score >= 0
                    ?
                    parseScore(
                        row[c.score]
                    )
                    :
                    null,

                teacherComment:
                    c.comment >= 0
                    ?
                    String(
                        row[c.comment] || ""
                    ).trim()
                    :
                    ""
            };
        }
    )
    .filter(
        function(item){

            return Boolean(
                item.code
            );
        }
    );
}


/* =========================================================
   ERROR DETECTION

   CHỈ TEACHER COMMENT ĐƯỢC TẠO ERROR CỤ THỂ.
   SCORE KHÔNG TỰ SINH ERROR CODE.
========================================================= */

function detectErrorsFromComment(
    comment,
    resolution
){

    const normalized=
        normalizeText(comment);


    if(!normalized){

        return [];
    }


    const exerciseIds=
        new Set(
            (
                resolution &&
                resolution.exercises ||
                []
            )
            .map(
                function(item){

                    return item.id;
                }
            )
        );


    const results=[];


    Object.keys(
        ERROR_MAP
    )
    .forEach(
        function(errorId){

            const error=
                ERROR_MAP[errorId];


            /*
               Nếu biết exercise,
               ưu tiên chỉ dò lỗi liên quan.
            */
            if(
                exerciseIds.size &&
                !exerciseIds.has(
                    error.exerciseId
                )
            ){

                return;
            }


            const matched=
                error.keywords.some(
                    function(keyword){

                        return normalized.includes(
                            normalizeText(keyword)
                        );
                    }
                );


            if(matched){

                results.push(
                    Object.assign(
                        {},
                        error,
                        {
                            source:
                                "TEACHER",

                            confidence:
                                "HIGH"
                        }
                    )
                );
            }
        }
    );


    GENERAL_FEEDBACK_RULES
    .forEach(
        function(rule){

            const matched=
                rule.keywords.some(
                    function(keyword){

                        return normalized.includes(
                            normalizeText(keyword)
                        );
                    }
                );


            if(!matched){
                return;
            }


            if(
                rule.errorId &&
                ERROR_MAP[
                    rule.errorId
                ]
            ){

                if(
                    !results.some(
                        function(item){

                            return(
                                item.id ===
                                rule.errorId
                            );
                        }
                    )
                ){

                    results.push(
                        Object.assign(
                            {},
                            ERROR_MAP[
                                rule.errorId
                            ],
                            {
                                source:
                                    "TEACHER",

                                confidence:
                                    "MEDIUM"
                            }
                        )
                    );
                }
            }
        }
    );


    return results;
}


/* =========================================================
   EVIDENCE BUILDER
========================================================= */

function buildKnowledgeEvidence(
    submissions
){

    const evidenceByNode=
        new Map();


    KNOWLEDGE_NODES.forEach(
        function(node){

            evidenceByNode.set(
                node.id,
                []
            );
        }
    );


    (
        submissions ||
        []
    )
    .forEach(
        function(submission){

            const resolution=
                submission.resolution;


            if(
                !resolution ||
                resolution.resolutionType ===
                "UNKNOWN"
            ){

                return;
            }


            const score=
                parseScore(
                    submission.score
                );


            if(score === null){
                return;
            }


            const errors=
                detectErrorsFromComment(
                    submission.teacherComment,
                    resolution
                );


            resolution
            .knowledgeEvidence
            .forEach(
                function(link){

                    if(
                        !evidenceByNode.has(
                            link.knowledgeId
                        )
                    ){

                        return;
                    }


                    const relatedErrors=
                        errors.filter(
                            function(error){

                                return(
                                    error.knowledgeId ===
                                    link.knowledgeId
                                );
                            }
                        );


                    evidenceByNode
                    .get(
                        link.knowledgeId
                    )
                    .push({

                        timestamp:
                            submission.timestamp,

                        date:
                            parseDate(
                                submission.timestamp
                            ),

                        rowIndex:
                            submission.rowIndex,

                        score,

                        qualityState:
                            qualityFromScore(
                                score
                            ),

                        exerciseId:
                            link.exerciseId,

                        evidenceType:
                            link.evidenceType,

                        evidenceWeight:
                            link.weight,

                        resolutionType:
                            resolution
                            .resolutionType,

                        confidence:
                            resolution
                            .confidence,

                        teacherComment:
                            submission
                            .teacherComment ||
                            "",

                        teacherEvidence:
                            Boolean(
                                submission
                                .teacherComment
                            ),

                        errors:
                            relatedErrors,

                        source:
                            submission.source
                    });
                }
            );
        }
    );


    evidenceByNode
    .forEach(
        function(items){

            items.sort(
                function(a,b){

                    const ta=
                        a.date
                        ?
                        a.date.getTime()
                        :
                        0;


                    const tb=
                        b.date
                        ?
                        b.date.getTime()
                        :
                        0;


                    if(
                        tb !== ta
                    ){

                        return tb-ta;
                    }


                    return(
                        Number(
                            b.rowIndex || 0
                        )
                        -
                        Number(
                            a.rowIndex || 0
                        )
                    );
                }
            );
        }
    );


    return evidenceByNode;
}


/* =========================================================
   CURRENT QUALITY
========================================================= */

function calculateCurrentQuality(
    evidence
){

    const recent=
        (
            evidence ||
            []
        )
        .slice(
            0,
            CONFIG.maxEvidencePerNode
        );


    if(!recent.length){

        return{

            value:0,

            state:
                QUALITY_STATES
                .NOT_PERFORMED,

            evidenceCount:0
        };
    }


    let numerator=0;
    let denominator=0;


    recent.forEach(
        function(item,index){

            const recencyWeight=
                CONFIG.recencyWeights[
                    index
                ]
                ||
                0.40;


            const evidenceWeight=
                Number(
                    item.evidenceWeight ||
                    1
                );


            const confidenceWeight=
                CONFIG
                .confidenceWeights[
                    item.confidence
                ]
                ||
                0.40;


            const weight=
                recencyWeight *
                evidenceWeight *
                confidenceWeight;


            numerator +=
                Number(item.score) *
                weight;


            denominator +=
                weight;
        }
    );


    const value=
        denominator > 0
        ?
        numerator /
        denominator
        :
        0;


    return{

        value:
            round(value,2),

        state:
            qualityFromScore(
                value
            ),

        evidenceCount:
            recent.length
    };
}


/* =========================================================
   TREND
========================================================= */

function calculateTrend(
    evidence
){

    const chronological=
        (
            evidence ||
            []
        )
        .slice(
            0,
            5
        )
        .reverse();


    if(
        chronological.length < 2
    ){

        return TREND_STATES.UNKNOWN;
    }


    const scores=
        chronological.map(
            function(item){

                return Number(
                    item.score
                );
            }
        );


    const first=
        scores[0];


    const last=
        scores[
            scores.length-1
        ];


    const delta=
        last-first;


    let positive=0;
    let negative=0;


    for(
        let i=1;
        i<scores.length;
        i++
    ){

        const diff=
            scores[i]-
            scores[i-1];


        if(diff > 0){
            positive++;
        }

        if(diff < 0){
            negative++;
        }
    }


    const range=
        Math.max.apply(
            null,
            scores
        )
        -
        Math.min.apply(
            null,
            scores
        );


    if(
        delta >= 3 &&
        positive >=
        Math.max(
            2,
            scores.length-2
        )
    ){

        return TREND_STATES
            .STRONG_IMPROVEMENT;
    }


    if(
        delta >= 1 &&
        positive > negative
    ){

        return TREND_STATES
            .IMPROVING;
    }


    if(
        delta <= -2 &&
        negative > positive
    ){

        return TREND_STATES
            .DECLINING;
    }


    if(
        range >= 3 &&
        positive > 0 &&
        negative > 0
    ){

        return TREND_STATES
            .FLUCTUATING;
    }


    return TREND_STATES.STABLE;
}


/* =========================================================
   STABILITY
========================================================= */

function calculateStability(
    evidence
){

    const recent=
        (
            evidence ||
            []
        )
        .slice(
            0,
            5
        );


    if(
        recent.length <= 1
    ){

        return STABILITY_STATES.LOW;
    }


    const scores=
        recent.map(
            function(item){

                return Number(
                    item.score
                );
            }
        );


    const mean=
        scores.reduce(
            function(a,b){

                return a+b;
            },
            0
        )
        /
        scores.length;


    const variance=
        scores.reduce(
            function(total,value){

                return(
                    total+
                    Math.pow(
                        value-mean,
                        2
                    )
                );
            },
            0
        )
        /
        scores.length;


    const deviation=
        Math.sqrt(
            variance
        );


    if(
        recent.length >= 5 &&
        deviation <= 0.65
    ){

        return STABILITY_STATES
            .VERY_HIGH;
    }


    if(
        recent.length >= 4 &&
        deviation <= 1
    ){

        return STABILITY_STATES
            .HIGH;
    }


    if(
        recent.length >= 3 &&
        deviation <= 1.5
    ){

        return STABILITY_STATES
            .MODERATE;
    }


    if(
        recent.length >= 2
    ){

        return STABILITY_STATES
            .DEVELOPING;
    }


    return STABILITY_STATES.LOW;
}


/* =========================================================
   CONFIDENCE
========================================================= */

function calculateConfidence(
    evidence
){

    const recent=
        (
            evidence ||
            []
        )
        .slice(
            0,
            5
        );


    if(!recent.length){

        return CONFIDENCE_STATES.LOW;
    }


    let points=0;


    recent.forEach(
        function(item){

            points +=
                CONFIG
                .confidenceWeights[
                    item.confidence
                ]
                ||
                0.4;


            if(
                item.teacherEvidence
            ){

                points += 0.25;
            }


            if(
                item.evidenceType ===
                "PRIMARY"
            ){

                points += 0.15;
            }
        }
    );


    const average=
        points /
        recent.length;


    if(
        recent.length >= 4 &&
        average >= 1
    ){

        return CONFIDENCE_STATES
            .VERY_HIGH;
    }


    if(
        recent.length >= 3 &&
        average >= 0.8
    ){

        return CONFIDENCE_STATES
            .HIGH;
    }


    if(
        recent.length >= 2
    ){

        return CONFIDENCE_STATES
            .MEDIUM;
    }


    return CONFIDENCE_STATES.LOW;
}


/* =========================================================
   ERROR STATE
========================================================= */

function calculateErrorState(
    evidence
){

    const history=
        new Map();


    (
        evidence ||
        []
    )
    .slice()
    .reverse()
    .forEach(
        function(item){

            (
                item.errors ||
                []
            )
            .forEach(
                function(error){

                    if(
                        !history.has(
                            error.id
                        )
                    ){

                        history.set(
                            error.id,
                            []
                        );
                    }


                    history
                    .get(
                        error.id
                    )
                    .push({
                        timestamp:
                            item.timestamp,
                        score:
                            item.score,
                        error
                    });
                }
            );
        }
    );


    const active=[];
    const resolved=[];


    history.forEach(
        function(records,errorId){

            const definition=
                ERROR_MAP[errorId];


            const occurrences=
                records.length;


            const recentEvidence=
                (
                    evidence ||
                    []
                )
                .slice(
                    0,
                    3
                );


            const recentOccurrences=
                recentEvidence.filter(
                    function(item){

                        return(
                            item.errors ||
                            []
                        )
                        .some(
                            function(error){

                                return(
                                    error.id ===
                                    errorId
                                );
                            }
                        );
                    }
                )
                .length;


            let lifecycle=
                ERROR_LIFECYCLE.NEW;


            if(
                occurrences >= 3
            ){

                lifecycle=
                    ERROR_LIFECYCLE
                    .PERSISTENT;

            }else if(
                occurrences >= 2
            ){

                lifecycle=
                    ERROR_LIFECYCLE
                    .REPEATED;
            }


            if(
                occurrences > 0 &&
                recentOccurrences === 0 &&
                recentEvidence.length >= 2
            ){

                lifecycle=
                    ERROR_LIFECYCLE
                    .RESOLVED;
            }


            const object=
                Object.assign(
                    {},
                    definition,
                    {
                        occurrences,
                        recentOccurrences,
                        lifecycle
                    }
                );


            if(
                lifecycle ===
                ERROR_LIFECYCLE.RESOLVED
            ){

                resolved.push(object);

            }else{

                active.push(object);
            }
        }
    );


    return{
        active,
        resolved
    };
}


/* =========================================================
   BLOCKING ERROR
========================================================= */

function hasBlockingError(errors){

    return(
        errors ||
        []
    )
    .some(
        function(error){

            return(
                error.severity ===
                ERROR_SEVERITIES.BLOCKING
            );
        }
    );
}


function hasRepeatedMajorError(errors){

    return(
        errors ||
        []
    )
    .some(
        function(error){

            return(
                error.severity ===
                ERROR_SEVERITIES.MAJOR
                &&
                (
                    error.lifecycle ===
                    ERROR_LIFECYCLE.REPEATED
                    ||
                    error.lifecycle ===
                    ERROR_LIFECYCLE.PERSISTENT
                )
            );
        }
    );
}


/* =========================================================
   BASE MASTERY
========================================================= */

function calculateBaseMastery(
    evidence,
    currentQuality,
    trend,
    stability,
    activeErrors
){

    const count=
        evidence.length;


    if(count === 0){

        return MASTERY_STATES
            .AVAILABLE;
    }


    const recentScores=
        evidence
        .slice(0,3)
        .map(
            function(item){

                return Number(
                    item.score
                );
            }
        );


    const latest=
        recentScores.length
        ?
        recentScores[0]
        :
        0;


    const blocking=
        hasBlockingError(
            activeErrors
        );


    const repeatedMajor=
        hasRepeatedMajorError(
            activeErrors
        );


    /*
       MASTERED
    */
    if(
        count >= 5
        &&
        recentScores.length >= 3
        &&
        recentScores.every(
            function(score){

                return score >= 7;
            }
        )
        &&
        recentScores.slice(0,3)
        .every(
            function(score){

                return score >= 8;
            }
        )
        &&
        (
            stability ===
            STABILITY_STATES.HIGH
            ||
            stability ===
            STABILITY_STATES.VERY_HIGH
        )
        &&
        !blocking
        &&
        !repeatedMajor
    ){

        return MASTERY_STATES.MASTERED;
    }


    /*
       STABLE
    */
    if(
        count >= 4
        &&
        recentScores.length >= 3
        &&
        recentScores
        .slice(0,3)
        .every(
            function(score){

                return score >= 7;
            }
        )
        &&
        currentQuality.value >= 7
        &&
        trend !==
        TREND_STATES.DECLINING
        &&
        !blocking
        &&
        !repeatedMajor
    ){

        return MASTERY_STATES.STABLE;
    }


    /*
       ACHIEVED
    */
    if(
        count >= 3
        &&
        latest >= 6
        &&
        recentScores
        .slice(0,3)
        .filter(
            function(score){

                return score >= 6;
            }
        )
        .length >= 2
        &&
        !blocking
    ){

        return MASTERY_STATES.ACHIEVED;
    }


    /*
       PRACTICING
    */
    if(
        currentQuality.value >= 5
    ){

        return MASTERY_STATES.PRACTICING;
    }


    return MASTERY_STATES.LEARNING;
}


/* =========================================================
   PREREQUISITES
========================================================= */

function prerequisitesPass(
    node,
    states
){

    if(
        !node.prerequisites ||
        !node.prerequisites.length
    ){

        return true;
    }


    return node.prerequisites.every(
        function(id){

            const state=
                states[id];


            if(!state){
                return false;
            }


            return(
                MASTERY_RANK[
                    state.mastery
                ]
                >=
                MASTERY_RANK
                .ACHIEVED
            );
        }
    );
}


/* =========================================================
   BUILD INITIAL NODE STATES
========================================================= */

function buildInitialStates(
    evidenceByNode
){

    const states={};


    KNOWLEDGE_NODES.forEach(
        function(node){

            const evidence=
                evidenceByNode.get(
                    node.id
                )
                ||
                [];


            const currentQuality=
                calculateCurrentQuality(
                    evidence
                );


            const trend=
                calculateTrend(
                    evidence
                );


            const stability=
                calculateStability(
                    evidence
                );


            const confidence=
                calculateConfidence(
                    evidence
                );


            const errorState=
                calculateErrorState(
                    evidence
                );


            const mastery=
                calculateBaseMastery(
                    evidence,
                    currentQuality,
                    trend,
                    stability,
                    errorState.active
                );


            states[
                node.id
            ]={

                id:
                    node.id,

                name:
                    node.name,

                domain:
                    node.domain,

                mastery,

                highestMastery:
                    mastery,

                currentQuality:
                    currentQuality.value,

                qualityState:
                    currentQuality.state,

                trend,

                stability,

                confidence,

                evidenceCount:
                    evidence.length,

                activeErrors:
                    errorState.active,

                resolvedErrors:
                    errorState.resolved,

                prerequisites:
                    node.prerequisites.slice(),

                prerequisitesPass:true,

                recommendedAction:
                    "CONTINUE",

                recommendedExercise:null,

                evidence:
                    evidence.slice(
                        0,
                        CONFIG.maxEvidencePerNode
                    )
            };
        }
    );


    return states;
}


/* =========================================================
   APPLY PREREQUISITES
========================================================= */

function applyPrerequisiteRules(
    states
){

    KNOWLEDGE_NODES.forEach(
        function(node){

            const state=
                states[node.id];


            const pass=
                prerequisitesPass(
                    node,
                    states
                );


            state.prerequisitesPass=
                pass;


            /*
               Chỉ LOCK nếu chưa có evidence.
               Nếu đã có dữ liệu lịch sử thì không xóa trạng thái.
            */
            if(
                !pass &&
                state.evidenceCount === 0
            ){

                state.mastery=
                    MASTERY_STATES.LOCKED;


                state.recommendedAction=
                    "UNLOCK_PREREQUISITE";
            }


            /*
               Đã luyện nhưng nền tảng chưa đạt.
            */
            if(
                !pass &&
                state.evidenceCount > 0
            ){

                state.recommendedAction=
                    "REVIEW_PREREQUISITE";


                if(
                    MASTERY_RANK[
                        state.mastery
                    ]
                    >
                    MASTERY_RANK
                    .PRACTICING
                ){

                    state.mastery=
                        MASTERY_STATES
                        .PRACTICING;
                }
            }
        }
    );
}


/* =========================================================
   REVIEW
========================================================= */

function applyReviewRules(
    states
){

    Object.keys(states)
    .forEach(
        function(id){

            const state=
                states[id];


            /*
               Trong v1.1 chưa có persistent historical state
               giữa các lần tải.

               Ta suy highestMastery từ evidence lịch sử.
            */

            const chronological=
                state.evidence
                .slice()
                .reverse();


            if(
                chronological.length < 4
            ){

                return;
            }


            const scores=
                chronological.map(
                    function(item){

                        return Number(
                            item.score
                        );
                    }
                );


            let hadStableWindow=false;


            for(
                let i=0;
                i<=scores.length-3;
                i++
            ){

                const windowScores=
                    scores.slice(
                        i,
                        i+3
                    );


                if(
                    windowScores.every(
                        function(score){

                            return score >= 7;
                        }
                    )
                ){

                    hadStableWindow=true;
                    break;
                }
            }


            if(hadStableWindow){

                state.highestMastery=
                    MASTERY_STATES.STABLE;
            }


            const latest=
                state.evidence[0]
                ?
                Number(
                    state.evidence[0].score
                )
                :
                0;


            if(
                hadStableWindow
                &&
                (
                    latest < 6
                    ||
                    state.trend ===
                    TREND_STATES.DECLINING
                )
            ){

                state.mastery=
                    MASTERY_STATES.REVIEW;


                state.recommendedAction=
                    "REVIEW";
            }
        }
    );
}


/* =========================================================
   RECOMMENDED EXERCISE
========================================================= */

function findRecommendedExercise(
    knowledgeId
){

    const primary=
        EXERCISES.find(
            function(exercise){

                return exercise.primary.includes(
                    knowledgeId
                );
            }
        );


    if(primary){
        return primary.id;
    }


    const secondary=
        EXERCISES.find(
            function(exercise){

                return exercise.secondary.includes(
                    knowledgeId
                );
            }
        );


    return secondary
        ? secondary.id
        : null;
}


/* =========================================================
   FINALIZE RECOMMENDATIONS
========================================================= */

function finalizeRecommendations(
    states
){

    Object.keys(states)
    .forEach(
        function(id){

            const state=
                states[id];


            state.recommendedExercise=
                findRecommendedExercise(
                    id
                );


            if(
                state.recommendedAction !==
                "CONTINUE"
            ){

                return;
            }


            if(
                state.activeErrors.some(
                    function(error){

                        return(
                            error.severity ===
                            ERROR_SEVERITIES.BLOCKING
                            ||
                            error.lifecycle ===
                            ERROR_LIFECYCLE.PERSISTENT
                        );
                    }
                )
            ){

                state.recommendedAction=
                    "CORRECT_ERROR";

                return;
            }


            switch(
                state.mastery
            ){

                case "LOCKED":

                    state.recommendedAction=
                        "UNLOCK_PREREQUISITE";
                    break;


                case "AVAILABLE":

                    state.recommendedAction=
                        "START";
                    break;


                case "LEARNING":

                    state.recommendedAction=
                        "LEARN";
                    break;


                case "PRACTICING":

                    state.recommendedAction=
                        "PRACTICE";
                    break;


                case "ACHIEVED":

                    state.recommendedAction=
                        "STABILIZE";
                    break;


                case "STABLE":

                    state.recommendedAction=
                        "ADVANCE";
                    break;


                case "MASTERED":

                    state.recommendedAction=
                        "MAINTAIN";
                    break;


                case "REVIEW":

                    state.recommendedAction=
                        "REVIEW";
                    break;
            }
        }
    );
}


/* =========================================================
   PROGRESS
========================================================= */

function calculateProgress(states){

    const values=
        Object.values(states);


    const counts={

        LOCKED:0,

        AVAILABLE:0,

        LEARNING:0,

        PRACTICING:0,

        ACHIEVED:0,

        STABLE:0,

        MASTERED:0,

        REVIEW:0
    };


    values.forEach(
        function(state){

            if(
                counts[
                    state.mastery
                ] !== undefined
            ){

                counts[
                    state.mastery
                ]++;
            }
        }
    );


    const achievedOrHigher=
        values.filter(
            function(state){

                return(
                    state.mastery ===
                    MASTERY_STATES.ACHIEVED
                    ||
                    state.mastery ===
                    MASTERY_STATES.STABLE
                    ||
                    state.mastery ===
                    MASTERY_STATES.MASTERED
                );
            }
        )
        .length;


    const percentage=
        values.length
        ?
        round(
            achievedOrHigher /
            values.length *
            100,
            1
        )
        :
        0;


    return{

        totalNodes:
            values.length,

        counts,

        achievedOrHigher,

        percentage
    };
}


/* =========================================================
   WEAK NODES
========================================================= */

function getWeakNodesFromStates(
    states,
    limit
){

    const max=
        Number(
            limit || 5
        );


    return Object.values(states)
    .filter(
        function(state){

            return(
                state.evidenceCount > 0
                &&
                (
                    state.mastery ===
                    MASTERY_STATES.LEARNING
                    ||
                    state.mastery ===
                    MASTERY_STATES.PRACTICING
                    ||
                    state.mastery ===
                    MASTERY_STATES.REVIEW
                    ||
                    state.activeErrors.length > 0
                )
            );
        }
    )
    .sort(
        function(a,b){

            const aBlocking=
                hasBlockingError(
                    a.activeErrors
                )
                ? 1
                : 0;


            const bBlocking=
                hasBlockingError(
                    b.activeErrors
                )
                ? 1
                : 0;


            if(
                bBlocking !==
                aBlocking
            ){

                return bBlocking-aBlocking;
            }


            if(
                a.currentQuality !==
                b.currentQuality
            ){

                return(
                    a.currentQuality-
                    b.currentQuality
                );
            }


            return(
                b.evidenceCount-
                a.evidenceCount
            );
        }
    )
    .slice(
        0,
        max
    );
}


/* =========================================================
   ADVICE
========================================================= */

function buildAdvice(
    studentState
){

    const weak=
        studentState.weakNodes;


    if(!weak.length){

        const strong=
            Object.values(
                studentState.mastery
            )
            .filter(
                function(state){

                    return(
                        state.mastery ===
                        MASTERY_STATES.STABLE
                        ||
                        state.mastery ===
                        MASTERY_STATES.MASTERED
                    );
                }
            );


        if(strong.length){

            return{

                type:
                    "PROGRESS",

                confidence:
                    "HIGH",

                title:
                    "Tiếp tục duy trì",

                message:
                    "Các kết quả gần đây cho thấy bạn đang duy trì khá tốt những nội dung đã luyện. Hãy tiếp tục luyện đều và chuyển dần sang những nội dung kế tiếp.",

                knowledgeId:
                    strong[0].id,

                recommendedExercise:
                    strong[0]
                    .recommendedExercise
            };
        }


        return{

            type:
                "START",

            confidence:
                "LOW",

            title:
                "Bắt đầu từ nền tảng",

            message:
                "Hiện chưa có đủ bài tập được xác định rõ để đánh giá từng kỹ năng. Hãy tiếp tục nộp bài với tên bài tập cụ thể để Minh Hồng theo dõi tiến bộ chính xác hơn.",

            knowledgeId:null,

            recommendedExercise:null
        };
    }


    const target=
        weak[0];


    const blocking=
        target.activeErrors.find(
            function(error){

                return(
                    error.severity ===
                    ERROR_SEVERITIES.BLOCKING
                );
            }
        );


    if(blocking){

        return{

            type:
                "CORRECT_ERROR",

            confidence:
                target.confidence,

            title:
                "Ưu tiên sửa lỗi",

            message:
                "Nhận xét gần đây cho thấy “"+
                blocking.name+
                "”. Bạn nên sửa điểm này trước khi tăng độ khó của bài tập.",

            knowledgeId:
                target.id,

            errorId:
                blocking.id,

            recommendedExercise:
                target.recommendedExercise
        };
    }


    if(
        target.recommendedAction ===
        "REVIEW_PREREQUISITE"
    ){

        const node=
            KNOWLEDGE_MAP.get(
                target.id
            );


        const prerequisite=
            node.prerequisites
            .map(
                function(id){

                    return studentState
                        .mastery[id];
                }
            )
            .find(
                function(state){

                    return(
                        !state
                        ||
                        MASTERY_RANK[
                            state.mastery
                        ]
                        <
                        MASTERY_RANK
                        .ACHIEVED
                    );
                }
            );


        return{

            type:
                "REVIEW_PREREQUISITE",

            confidence:
                target.confidence,

            title:
                "Củng cố kỹ năng nền",

            message:
                prerequisite
                ?
                (
                    "Trước khi tiếp tục “"+
                    target.name+
                    "”, bạn nên củng cố “"+
                    prerequisite.name+
                    "”. Đây là kỹ năng nền đang chưa đủ ổn định."
                )
                :
                (
                    "Bạn nên củng cố kỹ năng nền trước khi tiếp tục nội dung này."
                ),

            knowledgeId:
                target.id,

            prerequisiteId:
                prerequisite
                ?
                prerequisite.id
                :
                null,

            recommendedExercise:
                prerequisite
                ?
                prerequisite
                .recommendedExercise
                :
                target
                .recommendedExercise
        };
    }


    if(
        target.mastery ===
        MASTERY_STATES.REVIEW
    ){

        return{

            type:
                "REVIEW",

            confidence:
                target.confidence,

            title:
                "Nên ôn lại",

            message:
                "Bạn từng thể hiện khá tốt ở “"+
                target.name+
                "”, nhưng kết quả gần đây đang giảm. Nên dành một bài để ôn lại trước khi tiếp tục.",

            knowledgeId:
                target.id,

            recommendedExercise:
                target.recommendedExercise
        };
    }


    if(
        target.trend ===
        TREND_STATES.IMPROVING
        ||
        target.trend ===
        TREND_STATES.STRONG_IMPROVEMENT
    ){

        return{

            type:
                "IMPROVING",

            confidence:
                target.confidence,

            title:
                "Đang tiến bộ",

            message:
                "Dựa trên kết quả các bài gần đây, “"+
                target.name+
                "” đang có xu hướng tiến bộ. Hãy tiếp tục luyện thêm để biến kết quả tốt thành kỹ năng ổn định.",

            knowledgeId:
                target.id,

            recommendedExercise:
                target.recommendedExercise
        };
    }


    if(
        target.mastery ===
        MASTERY_STATES.PRACTICING
    ){

        return{

            type:
                "PRACTICE",

            confidence:
                target.confidence,

            title:
                "Cần luyện thêm",

            message:
                "Dựa trên kết quả các bài gần đây, “"+
                target.name+
                "” đã hình thành ở mức cơ bản nhưng chưa đủ ổn định. Hãy tiếp tục luyện cùng dạng bài này.",

            knowledgeId:
                target.id,

            recommendedExercise:
                target.recommendedExercise
        };
    }


    return{

        type:
            "LEARN",

        confidence:
            target.confidence,

        title:
            "Ưu tiên nội dung này",

        message:
            "Dựa trên kết quả các bài gần đây, bạn nên tập trung thêm vào “"+
            target.name+
            "” trước khi chuyển sang kỹ thuật khó hơn.",

        knowledgeId:
            target.id,

        recommendedExercise:
            target.recommendedExercise
    };
}


/* =========================================================
   QUEST EVENTS
========================================================= */

function buildQuestEvents(states){

    const events=[];


    Object.values(states)
    .forEach(
        function(state){

            if(
                state.mastery ===
                MASTERY_STATES.ACHIEVED
            ){

                events.push({
                    type:
                        "KNOWLEDGE_ACHIEVED",
                    knowledgeId:
                        state.id
                });
            }


            if(
                state.mastery ===
                MASTERY_STATES.STABLE
            ){

                events.push({
                    type:
                        "KNOWLEDGE_STABLE",
                    knowledgeId:
                        state.id
                });
            }


            if(
                state.mastery ===
                MASTERY_STATES.MASTERED
            ){

                events.push({
                    type:
                        "KNOWLEDGE_MASTERED",
                    knowledgeId:
                        state.id
                });
            }


            if(
                state.mastery ===
                MASTERY_STATES.REVIEW
            ){

                events.push({
                    type:
                        "REVIEW_REQUIRED",
                    knowledgeId:
                        state.id
                });
            }


            state.activeErrors
            .forEach(
                function(error){

                    events.push({

                        type:
                            error.lifecycle ===
                            ERROR_LIFECYCLE
                            .PERSISTENT
                            ?
                            "ERROR_PERSISTENT"
                            :
                            "ERROR_DETECTED",

                        knowledgeId:
                            state.id,

                        errorId:
                            error.id
                    });
                }
            );


            if(
                state.trend ===
                TREND_STATES.IMPROVING
                ||
                state.trend ===
                TREND_STATES
                .STRONG_IMPROVEMENT
            ){

                events.push({
                    type:
                        "TREND_IMPROVING",
                    knowledgeId:
                        state.id
                });
            }


            if(
                state.trend ===
                TREND_STATES.DECLINING
            ){

                events.push({
                    type:
                        "TREND_DECLINING",
                    knowledgeId:
                        state.id
                });
            }
        }
    );


    return events;
}


/* =========================================================
   CACHE
========================================================= */

let dataCache=null;
let dataCacheTime=0;

const studentStateCache=
    new Map();


/* =========================================================
   LOAD RAW DATA
========================================================= */

async function loadData(forceRefresh){

    const now=
        Date.now();


    if(
        !forceRefresh &&
        dataCache &&
        (
            now-dataCacheTime
        )
        <
        CONFIG.cacheTtl
    ){

        return dataCache;
    }


    const results=
        await Promise.all([

            fetchRows(
                CONFIG.submissionSheetName
            ),

            fetchRows(
                CONFIG.gradingSheetName
            )

        ]);


    const submissions=
        mapSubmissionRows(
            results[0]
        );


    const grading=
        mapGradingRows(
            results[1]
        );


    dataCache={

        submissions,

        grading,

        rawSubmissionRows:
            results[0],

        rawGradingRows:
            results[1]
    };


    dataCacheTime=
        now;


    studentStateCache.clear();


    return dataCache;
}


/* =========================================================
   GET STUDENT SUBMISSIONS
========================================================= */

async function getStudentSubmissions(
    code,
    forceRefresh
){

    const studentCode=
        normalizeCode(code);


    if(!studentCode){

        return [];
    }


    const data=
        await loadData(
            forceRefresh
        );


    return data.submissions
    .filter(
        function(item){

            return(
                item.code ===
                studentCode
            );
        }
    )
    .sort(
        function(a,b){

            const da=
                parseDate(
                    a.timestamp
                );


            const db=
                parseDate(
                    b.timestamp
                );


            const ta=
                da
                ?
                da.getTime()
                :
                0;


            const tb=
                db
                ?
                db.getTime()
                :
                0;


            return(
                tb-ta
                ||
                b.rowIndex-a.rowIndex
            );
        }
    );
}


/* =========================================================
   BUILD STUDENT STATE
========================================================= */

async function buildStudentState(
    code,
    forceRefresh
){

    const studentCode=
        normalizeCode(code);


    if(!studentCode){

        throw new Error(
            "Mã học viên không hợp lệ."
        );
    }


    if(
        !forceRefresh &&
        studentStateCache.has(
            studentCode
        )
    ){

        return studentStateCache.get(
            studentCode
        );
    }


    const submissions=
        await getStudentSubmissions(
            studentCode,
            forceRefresh
        );


    const evidenceByNode=
        buildKnowledgeEvidence(
            submissions
        );


    const mastery=
        buildInitialStates(
            evidenceByNode
        );


    applyPrerequisiteRules(
        mastery
    );


    applyReviewRules(
        mastery
    );


    finalizeRecommendations(
        mastery
    );


    const weakNodes=
        getWeakNodesFromStates(
            mastery,
            5
        );


    const progress=
        calculateProgress(
            mastery
        );


    const state={

        version:
            VERSION,

        code:
            studentCode,

        generatedAt:
            new Date()
            .toISOString(),

        submissions,

        mastery,

        weakNodes,

        progress,

        activeErrors:
            Object.values(
                mastery
            )
            .flatMap(
                function(item){

                    return item
                    .activeErrors
                    .map(
                        function(error){

                            return Object.assign(
                                {
                                    knowledgeId:
                                        item.id,

                                    knowledgeName:
                                        item.name
                                },
                                error
                            );
                        }
                    );
                }
            ),

        resolvedErrors:
            Object.values(
                mastery
            )
            .flatMap(
                function(item){

                    return item
                    .resolvedErrors
                    .map(
                        function(error){

                            return Object.assign(
                                {
                                    knowledgeId:
                                        item.id,

                                    knowledgeName:
                                        item.name
                                },
                                error
                            );
                        }
                    );
                }
            )
    };


    state.advice=
        buildAdvice(
            state
        );


    state.questEvents=
        buildQuestEvents(
            mastery
        );


    studentStateCache.set(
        studentCode,
        state
    );


    return state;
}


/* =========================================================
   PUBLIC GETTERS
========================================================= */

async function getStudentState(
    code,
    forceRefresh
){

    return buildStudentState(
        code,
        Boolean(forceRefresh)
    );
}


async function getMastery(
    code,
    knowledgeId,
    forceRefresh
){

    const state=
        await getStudentState(
            code,
            forceRefresh
        );


    return(
        state.mastery[
            knowledgeId
        ]
        ||
        null
    );
}


async function getWeakNodes(
    code,
    limit,
    forceRefresh
){

    const state=
        await getStudentState(
            code,
            forceRefresh
        );


    return getWeakNodesFromStates(
        state.mastery,
        limit || 5
    );
}


async function getProgress(
    code,
    forceRefresh
){

    const state=
        await getStudentState(
            code,
            forceRefresh
        );


    return state.progress;
}


async function getAdvice(
    code,
    forceRefresh
){

    const state=
        await getStudentState(
            code,
            forceRefresh
        );


    return state.advice;
}


/* =========================================================
   RECOMMENDED LESSON
========================================================= */

async function getRecommendedLesson(
    code,
    forceRefresh
){

    const state=
        await getStudentState(
            code,
            forceRefresh
        );


    const advice=
        state.advice;


    if(
        !advice ||
        !advice.recommendedExercise
    ){

        return null;
    }


    const exercise=
        EXERCISE_MAP.get(
            advice.recommendedExercise
        );


    if(!exercise){

        return null;
    }


    return{

        exerciseId:
            exercise.id,

        name:
            exercise.name,

        knowledgeId:
            advice.knowledgeId,

        reason:
            advice.type,

        confidence:
            advice.confidence
    };
}


/* =========================================================
   REFRESH
========================================================= */

async function refresh(
    code
){

    dataCache=null;
    dataCacheTime=0;

    studentStateCache.clear();


    const state=
        code
        ?
        await getStudentState(
            code,
            true
        )
        :
        await loadData(true);


    try{

        window.dispatchEvent(
            new CustomEvent(
                "ocdKnowledgeStateChanged",
                {
                    detail:{
                        code:
                            code
                            ?
                            normalizeCode(code)
                            :
                            "",

                        state,

                        version:
                            VERSION
                    }
                }
            )
        );

    }catch(error){}


    return state;
}


/* =========================================================
   DEBUG
========================================================= */

async function debug(code){

    const result={

        version:
            VERSION,

        config:
            CONFIG,

        knowledgeNodes:
            KNOWLEDGE_NODES.length,

        exercises:
            EXERCISES.length,

        practiceUnits:
            PRACTICE_UNITS.length,

        errorCount:
            Object.keys(
                ERROR_MAP
            ).length,

        cache:
            dataCache
    };


    if(code){

        result.student=
            await getStudentState(
                code
            );
    }


    console.log(
        "[OCD Knowledge Engine]",
        result
    );


    return result;
}


/* =========================================================
   TEST MASTERY
========================================================= */

function createTestEvidence(scores){

    return(
        scores ||
        []
    )
    .slice()
    .reverse()
    .map(
        function(score,index){

            return{

                score:
                    Number(score),

                timestamp:
                    "",

                rowIndex:
                    index,

                evidenceWeight:1,

                confidence:
                    "VERY_HIGH",

                evidenceType:
                    "PRIMARY",

                teacherEvidence:false,

                errors:[]
            };
        }
    );
}


function testScoreSequence(scores){

    const evidence=
        createTestEvidence(
            scores
        );


    const quality=
        calculateCurrentQuality(
            evidence
        );


    const trend=
        calculateTrend(
            evidence
        );


    const stability=
        calculateStability(
            evidence
        );


    const errors=
        calculateErrorState(
            evidence
        );


    const mastery=
        calculateBaseMastery(

            evidence,

            quality,

            trend,

            stability,

            errors.active
        );


    return{

        scores,

        currentQuality:
            quality,

        trend,

        stability,

        mastery
    };
}


/* =========================================================
   SELF TEST
========================================================= */

function selfTest(){

    const tests=[

        [3,4,6,7,8],

        [5,6,6,7,7],

        [8,8,9,8,8],

        [8,5,8,4,7],

        [9,8,7,5,4],

        [10],

        [8,8,8],

        [7,7,7,7],

        [8,8,8,8,8]

    ];


    const results=
        tests.map(
            testScoreSequence
        );


    console.table(
        results.map(
            function(item){

                return{

                    scores:
                        item.scores.join(
                            " → "
                        ),

                    quality:
                        item.currentQuality
                        .value,

                    trend:
                        item.trend,

                    stability:
                        item.stability,

                    mastery:
                        item.mastery
                };
            }
        )
    );


    return results;
}


/* =========================================================
   OCD ROOT
========================================================= */

if(!window.OCD){

    window.OCD={};
}


/* =========================================================
   PUBLIC API
========================================================= */

window.OCD.knowledge={

    version:
        VERSION,

    CONFIG,

    MASTERY_STATES,

    QUALITY_STATES,

    TREND_STATES,

    STABILITY_STATES,

    CONFIDENCE_STATES,

    ERROR_SEVERITIES,

    ERROR_LIFECYCLE,


    /* REGISTRY */

    KNOWLEDGE_NODES,

    KNOWLEDGE_MAP,

    EXERCISES,

    EXERCISE_MAP,

    PRACTICE_UNITS,

    CURRICULUM_MAP,

    ERROR_MAP,


    /* BASIC */

    normalizeText,

    normalizeCode,

    parseScore,

    parseDate,

    qualityFromScore,


    /* RESOLVER */

    detectWeek,

    findPracticeUnits,

    findExercisesByAlias,

    detectLamMo,

    resolveDescription,


    /* DATA */

    detectSubmissionColumns,

    mapSubmissionRows,

    detectGradingColumns,

    mapGradingRows,

    loadData,

    getStudentSubmissions,


    /* ERROR */

    detectErrorsFromComment,

    calculateErrorState,

    hasBlockingError,

    hasRepeatedMajorError,


    /* EVIDENCE */

    buildKnowledgeEvidence,

    calculateCurrentQuality,

    calculateTrend,

    calculateStability,

    calculateConfidence,


    /* MASTERY */

    calculateBaseMastery,

    prerequisitesPass,

    buildInitialStates,

    applyPrerequisiteRules,

    applyReviewRules,

    finalizeRecommendations,


    /* STUDENT */

    getStudentState,

    getMastery,

    getWeakNodes,

    getProgress,

    getRecommendedLesson,

    getAdvice,


    /* QUEST */

    buildQuestEvents,


    /* SYSTEM */

    refresh,

    debug,

    selfTest,

    testScoreSequence
};


/* =========================================================
   READY
========================================================= */

console.log(
    "[OCD Knowledge Engine] v"+
    VERSION+
    " đã sẵn sàng."
);


console.log(
    "[OCD Knowledge Engine] "+
    KNOWLEDGE_NODES.length+
    " Knowledge Nodes / "+
    EXERCISES.length+
    " Standard Exercises / "+
    Object.keys(ERROR_MAP).length+
    " Error Codes."
);


try{

    window.dispatchEvent(
        new CustomEvent(
            "ocdKnowledgeEngineReady",
            {
                detail:{

                    version:
                        VERSION,

                    knowledgeNodes:
                        KNOWLEDGE_NODES.length,

                    exercises:
                        EXERCISES.length,

                    errors:
                        Object.keys(
                            ERROR_MAP
                        ).length
                }
            }
        )
    );

}catch(error){}


})();
