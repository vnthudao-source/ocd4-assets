(function(){

"use strict";


/* =========================================================
   OCD KNOWLEDGE CORE
   v1.0.0

   KNOWLEDGE / LEARNING ENGINE

   ---------------------------------------------------------

   NGUYÊN TẮC

   1. KHÔNG quản lý Linh Thạch.
   2. KHÔNG quản lý vật phẩm.
   3. KHÔNG sửa StudentRewardSystem.
   4. KHÔNG ghi Google Sheet.
   5. Chỉ đọc dữ liệu học tập.
   6. Một bài nộp có thể tạo nhiều Evidence.
   7. Không dùng điểm trung bình đơn thuần để xác định Mastery.
   8. Nhận xét GVCN có độ ưu tiên cao hơn suy luận từ điểm.
   9. Không đoán Knowledge Node nếu dữ liệu không đủ rõ.
   10. Có sẵn extension point cho Minh Hồng / Quest Engine.

========================================================= */


/* =========================================================
   KHÔNG KHỞI TẠO LẶP
========================================================= */

if(
    window.OCDKnowledge &&
    window.OCDKnowledge.version
){

    try{

        window.dispatchEvent(
            new CustomEvent(
                "ocdKnowledgeReady",
                {
                    detail:{
                        version:
                            window.OCDKnowledge.version
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

const VERSION=
    "1.0.0";


/* =========================================================
   CONFIG
========================================================= */

const CONFIG={

    /*
       Sheet bài nộp hiện tại.
    */

    submissionSpreadsheetId:
        "1GJoTRsbq0kZfZrDdh0uCC667PwS3Bgkje2fHQnwnCKs",

    submissionSheetName:
        "Form Responses 1",

    timeZone:
        "Asia/Ho_Chi_Minh",


    /*
       Cache Knowledge Data.
    */

    cacheTtl:
        15000,


    /*
       Evidence >= mức này mới được phép
       tác động trực tiếp lên Skill Mastery.
    */

    directEvidenceConfidence:
        0.80,


    /*
       Evidence từ 0.50 trở lên có thể dùng
       như Supporting Evidence.
    */

    supportingEvidenceConfidence:
        0.50,


    /*
       Số bài gần nhất ưu tiên khi đánh giá.
    */

    recentEvidenceLimit:
        5,


    /*
       Số Evidence tối thiểu để xét ổn định.
    */

    stableEvidenceMinimum:
        3,


    /*
       Điểm được coi là đạt kỹ thuật.
    */

    achievedScore:
        7,


    /*
       Điểm mạnh.
    */

    strongScore:
        8
};


/* =========================================================
   CONSTANTS
========================================================= */

const EVIDENCE_SOURCE={

    TEACHER_COMMENT:
        "TEACHER_COMMENT",

    TEACHER_ERROR:
        "TEACHER_ERROR",

    SCORE_RUBRIC:
        "SCORE_RUBRIC",

    EXERCISE_EXACT:
        "EXERCISE_EXACT",

    EXERCISE_ALIAS:
        "EXERCISE_ALIAS",

    PRACTICE_UNIT:
        "PRACTICE_UNIT",

    CURRICULUM:
        "CURRICULUM",

    HISTORICAL:
        "HISTORICAL"
};


const RESOLUTION_TYPE={

    EXACT:
        "EXACT",

    ALIAS:
        "ALIAS",

    PRACTICE_UNIT:
        "PRACTICE_UNIT",

    COMPOSITE:
        "COMPOSITE",

    WEEK_PLUS_CONTENT:
        "WEEK_PLUS_CONTENT",

    WEEK_ONLY:
        "WEEK_ONLY",

    EVENT:
        "EVENT",

    GENERIC:
        "GENERIC",

    UNKNOWN:
        "UNKNOWN"
};


const ACTIVITY_TYPE={

    COURSE:
        "COURSE",

    PRACTICE:
        "PRACTICE",

    EVENT:
        "EVENT",

    EXAM:
        "EXAM",

    FREE_PRACTICE:
        "FREE_PRACTICE",

    UNKNOWN:
        "UNKNOWN"
};


const MASTERY_STATE={

    LOCKED:
        "LOCKED",

    AVAILABLE:
        "AVAILABLE",

    LEARNING:
        "LEARNING",

    PRACTICING:
        "PRACTICING",

    ACHIEVED:
        "ACHIEVED",

    STABLE:
        "STABLE",

    MASTERED:
        "MASTERED",

    REVIEW:
        "REVIEW"
};


const SCORE_STATE={

    1:"NOT_FORMED",

    2:"VERY_WEAK",

    3:"FORMING",

    4:"UNSTABLE",

    5:"BASIC",

    6:"DEVELOPING",

    7:"GOOD",

    8:"VERY_GOOD",

    9:"STABLE",

    10:"EXCELLENT"
};


/* =========================================================
   BASIC
========================================================= */

function clean(value){

    return String(
        value === undefined ||
        value === null
            ? ""
            : value
    )
    .trim();
}


function normalizeText(value){

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
            /[“”"'.,:;!?()[\]{}]/g,
            " "
        )

        .replace(
            /[-_/]+/g,
            " "
        )

        .replace(
            /\s+/g,
            " "
        )

        .trim();
}


function normalizeCode(value){

    return clean(value)
        .toUpperCase();
}


function parseNumber(value){

    if(
        value === null ||
        value === undefined ||
        value === ""
    ){

        return null;
    }


    let text=
        clean(value)
        .replace(
            /\s+/g,
            ""
        );


    if(
        text.includes(",") &&
        !text.includes(".")
    ){

        text=
            text.replace(
                ",",
                "."
            );
    }


    const number=
        Number(text);


    return Number.isFinite(number)
        ? number
        : null;
}


function parseScore(value){

    const number=
        parseNumber(value);


    if(
        number === null
    ){

        return null;
    }


    if(
        number < 0 ||
        number > 10
    ){

        return null;
    }


    return number;
}


function parseDate(value){

    /*
       Ưu tiên dùng parser của Reward Core
       nếu Core đang tồn tại.
    */

    const RS=
        window.StudentRewardSystem;


    if(
        RS &&
        typeof RS.parseVietnameseDate ===
        "function"
    ){

        return RS.parseVietnameseDate(
            value
        );
    }


    const text=
        clean(value);


    if(!text){

        return null;
    }


    let match=
        text.match(
            /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/
        );


    if(match){

        const date=
            new Date(

                Number(match[3]),

                Number(match[2])-1,

                Number(match[1]),

                Number(match[4] || 0),

                Number(match[5] || 0),

                Number(match[6] || 0)
            );


        return Number.isNaN(
            date.getTime()
        )
            ? null
            : date;
    }


    const nativeDate=
        new Date(text);


    return Number.isNaN(
        nativeDate.getTime()
    )
        ? null
        : nativeDate;
}


/* =========================================================
   SCORE RUBRIC - GLOBAL SEMANTIC LEVEL

   Đây chỉ là nghĩa chung của điểm.

   Exercise chuyên biệt có thể override
   interpretation/defaultFeedback.
========================================================= */

const GLOBAL_SCORE_RUBRIC={

    1:{
        state:"NOT_FORMED",
        label:"Chưa thực hiện được",
        level:1
    },

    2:{
        state:"VERY_WEAK",
        label:"Rất yếu",
        level:2
    },

    3:{
        state:"FORMING",
        label:"Đang hình thành",
        level:3
    },

    4:{
        state:"UNSTABLE",
        label:"Chưa ổn định",
        level:4
    },

    5:{
        state:"BASIC",
        label:"Tạm đạt mức cơ bản",
        level:5
    },

    6:{
        state:"DEVELOPING",
        label:"Đang phát triển",
        level:6
    },

    7:{
        state:"GOOD",
        label:"Tốt",
        level:7
    },

    8:{
        state:"VERY_GOOD",
        label:"Rất tốt",
        level:8
    },

    9:{
        state:"STABLE",
        label:"Tốt và ổn định",
        level:9
    },

    10:{
        state:"EXCELLENT",
        label:"Xuất sắc",
        level:10
    }
};


/* =========================================================
   KNOWLEDGE NODES
========================================================= */

const KNOWLEDGE_NODES={


    /* =====================================================
       K02 - CÔNG CỤ / VẬT LIỆU
    ===================================================== */

    "K02.01":{
        id:"K02.01",
        domain:"K02",
        name:"Bút lông",
        prerequisites:[],
        questEligible:true,
        npcRoles:["MINH_HONG","NGHE_NHAN"]
    },


    "K02.02":{
        id:"K02.02",
        domain:"K02",
        name:"Mực",
        prerequisites:[],
        questEligible:true,
        npcRoles:["MINH_HONG","NGHE_NHAN"]
    },


    "K02.03":{
        id:"K02.03",
        domain:"K02",
        name:"Giấy",
        prerequisites:[],
        questEligible:true,
        npcRoles:["MINH_HONG","NGHE_NHAN"]
    },


    /* =====================================================
       K03 - ĐIỀU KHIỂN BÚT
    ===================================================== */

    "K03.01":{
        id:"K03.01",
        domain:"K03",
        name:"Cầm bút",
        prerequisites:[],
        questEligible:true,
        npcRoles:["MINH_HONG","NGHE_NHAN"]
    },


    "K03.02":{
        id:"K03.02",
        domain:"K03",
        name:"Khởi động bút",
        prerequisites:["K03.01"],
        questEligible:true,
        npcRoles:["NGHE_NHAN"]
    },


    "K03.03":{
        id:"K03.03",
        domain:"K03",
        name:"Hành bút",
        prerequisites:["K03.01"],
        questEligible:true,
        npcRoles:["NGHE_NHAN"]
    },


    "K03.04":{
        id:"K03.04",
        domain:"K03",
        name:"Điều phong",
        prerequisites:[
            "K03.01",
            "K03.03"
        ],
        questEligible:true,
        npcRoles:["MINH_HONG","NGHE_NHAN"]
    },


    "K03.05":{
        id:"K03.05",
        domain:"K03",
        name:"Chuyển hướng",
        prerequisites:[
            "K03.03",
            "K03.04"
        ],
        questEligible:true,
        npcRoles:["NGHE_NHAN"]
    },


    "K03.06":{
        id:"K03.06",
        domain:"K03",
        name:"Bút lực",
        prerequisites:[
            "K03.03"
        ],
        questEligible:true,
        npcRoles:["MINH_HONG","NGHE_NHAN"]
    },


    "K03.07":{
        id:"K03.07",
        domain:"K03",
        name:"Liên tục đường bút",
        prerequisites:[
            "K03.03",
            "K03.04"
        ],
        questEligible:true,
        npcRoles:["NGHE_NHAN"]
    },


    /* =====================================================
       K04 - BÚT PHÁP
    ===================================================== */

    "K04.01":{
        id:"K04.01",
        domain:"K04",
        name:"Khởi bút",
        prerequisites:["K03.03"],
        questEligible:true,
        npcRoles:["NGHE_NHAN"]
    },


    "K04.02":{
        id:"K04.02",
        domain:"K04",
        name:"Hành bút",
        prerequisites:[
            "K03.03",
            "K03.04"
        ],
        questEligible:true,
        npcRoles:["NGHE_NHAN"]
    },


    "K04.03":{
        id:"K04.03",
        domain:"K04",
        name:"Thu bút",
        prerequisites:["K04.02"],
        questEligible:true,
        npcRoles:["NGHE_NHAN"]
    },


    "K04.04":{
        id:"K04.04",
        domain:"K04",
        name:"Lộ phong",
        prerequisites:[
            "K03.03",
            "K03.04"
        ],
        questEligible:true,
        npcRoles:["MINH_HONG","NGHE_NHAN"]
    },


    "K04.05":{
        id:"K04.05",
        domain:"K04",
        name:"Tàng phong",
        prerequisites:[
            "K03.03",
            "K03.04"
        ],
        questEligible:true,
        npcRoles:["MINH_HONG","NGHE_NHAN"]
    },


    "K04.06":{
        id:"K04.06",
        domain:"K04",
        name:"Viên bút",
        prerequisites:[
            "K03.04",
            "K03.06"
        ],
        questEligible:true,
        npcRoles:["MINH_HONG","NGHE_NHAN"]
    },


    "K04.07":{
        id:"K04.07",
        domain:"K04",
        name:"Phương bút",
        prerequisites:[
            "K03.04",
            "K03.06"
        ],
        questEligible:true,
        npcRoles:["NGHE_NHAN"]
    },


    /* =====================================================
       K05 - HÌNH THÁI CHỮ
    ===================================================== */

    "K05.01":{
        id:"K05.01",
        domain:"K05",
        name:"Đường nét cơ bản",
        prerequisites:["K03.03"],
        questEligible:true,
        npcRoles:["MINH_HONG","NGHE_NHAN"]
    },


    "K05.02":{
        id:"K05.02",
        domain:"K05",
        name:"Tỷ lệ chữ",
        prerequisites:["K05.01"],
        questEligible:true,
        npcRoles:["MINH_HONG","THU_GIA"]
    },


    "K05.03":{
        id:"K05.03",
        domain:"K05",
        name:"Kết cấu chữ",
        prerequisites:["K05.02"],
        questEligible:true,
        npcRoles:["THU_GIA"]
    },


    /* =====================================================
       K06 - LÂM MÔ
    ===================================================== */

    "K06.01":{
        id:"K06.01",
        domain:"K06",
        name:"Quan sát mẫu",
        prerequisites:[],
        questEligible:true,
        npcRoles:["MINH_HONG","THU_GIA"]
    },


    "K06.02":{
        id:"K06.02",
        domain:"K06",
        name:"Lâm mô hình",
        prerequisites:[
            "K06.01",
            "K05.01"
        ],
        questEligible:true,
        npcRoles:["MINH_HONG","THU_GIA"]
    },


    "K06.03":{
        id:"K06.03",
        domain:"K06",
        name:"Lâm mô ý",
        prerequisites:["K06.02"],
        questEligible:true,
        npcRoles:["THU_GIA"]
    },


    /* =====================================================
       K07 - CHƯƠNG PHÁP / BỐ CỤC
    ===================================================== */

    "K07.01":{
        id:"K07.01",
        domain:"K07",
        name:"Đường cơ sở",
        prerequisites:["K05.01"],
        questEligible:true,
        npcRoles:["MINH_HONG","NU_HOA_GIA"]
    },


    "K07.02":{
        id:"K07.02",
        domain:"K07",
        name:"Khoảng cách chữ",
        prerequisites:["K07.01"],
        questEligible:true,
        npcRoles:["NU_HOA_GIA"]
    },


    "K07.03":{
        id:"K07.03",
        domain:"K07",
        name:"Trục chữ",
        prerequisites:["K07.01"],
        questEligible:true,
        npcRoles:["NU_HOA_GIA"]
    },


    "K07.04":{
        id:"K07.04",
        domain:"K07",
        name:"Cân bằng bố cục",
        prerequisites:[
            "K07.01",
            "K07.02",
            "K07.03"
        ],
        questEligible:true,
        npcRoles:["MINH_HONG","NU_HOA_GIA"]
    },


    /* =====================================================
       K08 - MỰC / TỐC ĐỘ / TIẾT TẤU
    ===================================================== */

    "K08.01":{
        id:"K08.01",
        domain:"K08",
        name:"Khô – nhuận",
        prerequisites:[
            "K02.02",
            "K03.03"
        ],
        questEligible:true,
        npcRoles:["NGHE_NHAN"]
    },


    "K08.02":{
        id:"K08.02",
        domain:"K08",
        name:"Tốc độ hành bút",
        prerequisites:["K03.03"],
        questEligible:true,
        npcRoles:["NGHE_NHAN"]
    },


    "K08.03":{
        id:"K08.03",
        domain:"K08",
        name:"Tiết tấu",
        prerequisites:["K08.02"],
        questEligible:true,
        npcRoles:["MINH_HONG","NGHE_NHAN"]
    },


    "K08.04":{
        id:"K08.04",
        domain:"K08",
        name:"Phi bạch",
        prerequisites:[
            "K08.01",
            "K08.02",
            "K03.06"
        ],
        questEligible:true,
        npcRoles:["NGHE_NHAN"]
    },


    /* =====================================================
       K09
    ===================================================== */

    "K09.01":{
        id:"K09.01",
        domain:"K09",
        name:"Hình và ý",
        prerequisites:[
            "K06.02"
        ],
        questEligible:true,
        npcRoles:["MINH_HONG","THU_GIA"]
    },


    "K09.02":{
        id:"K09.02",
        domain:"K09",
        name:"Thần thái",
        prerequisites:[
            "K09.01"
        ],
        questEligible:true,
        npcRoles:["THU_GIA"]
    },


    "K09.03":{
        id:"K09.03",
        domain:"K09",
        name:"Tính tự nhiên",
        prerequisites:[
            "K09.01"
        ],
        questEligible:true,
        npcRoles:["THU_GIA"]
    },


    /* =====================================================
       K10
    ===================================================== */

    "K10.01":{
        id:"K10.01",
        domain:"K10",
        name:"Sáng tác",
        prerequisites:[
            "K06.02",
            "K07.04",
            "K09.01"
        ],
        questEligible:true,
        npcRoles:[
            "MINH_HONG",
            "NU_HOA_GIA",
            "THU_GIA"
        ]
    },


    "K10.02":{
        id:"K10.02",
        domain:"K10",
        name:"Phẩm bình",
        prerequisites:[
            "K10.01"
        ],
        questEligible:true,
        npcRoles:["THU_GIA"]
    }

};


/* =========================================================
   ERROR MAP
========================================================= */

const ERROR_MAP={


    /* =====================================================
       CẦM BÚT / ĐIỀU PHONG
    ===================================================== */

    "CB01":{
        id:"CB01",
        node:"K03.01",
        name:"Cầm bút chưa đúng",
        keywords:[
            "cam but chua dung",
            "cam but sai",
            "tu the cam but"
        ]
    },


    "DF01":{
        id:"DF01",
        node:"K03.04",
        name:"Điều phong chưa ổn định",
        keywords:[
            "dieu phong chua on",
            "dieu phong chua tot",
            "dieu phong"
        ]
    },


    "DF02":{
        id:"DF02",
        node:"K03.04",
        name:"Phong bút lệch",
        keywords:[
            "phong but lech",
            "dau but lech",
            "ngon but lech"
        ]
    },


    "BL01":{
        id:"BL01",
        node:"K03.06",
        name:"Nét thiếu lực",
        keywords:[
            "net thieu luc",
            "thieu but luc",
            "but luc yeu",
            "net yeu"
        ]
    },


    "BL02":{
        id:"BL02",
        node:"K03.06",
        name:"Lực không đều",
        keywords:[
            "luc khong deu",
            "but luc khong deu"
        ]
    },


    /* =====================================================
       LỘ PHONG
    ===================================================== */

    "LF01":{
        id:"LF01",
        node:"K04.04",
        name:"Đầu nét Lộ phong chưa rõ",
        keywords:[
            "lo phong chua ro",
            "dau net chua ro",
            "dau lo phong"
        ]
    },


    "LF02":{
        id:"LF02",
        node:"K04.04",
        name:"Hướng phong bút chưa đúng",
        keywords:[
            "sai huong phong",
            "huong phong chua dung",
            "huong but chua dung"
        ]
    },


    "LF03":{
        id:"LF03",
        node:"K04.04",
        name:"Lộ phong thừa mực",
        keywords:[
            "lo phong thua muc",
            "dau net thua muc"
        ]
    },


    "LF04":{
        id:"LF04",
        node:"K04.04",
        name:"Lộ phong thiếu lực",
        keywords:[
            "lo phong thieu luc"
        ]
    },


    "LF05":{
        id:"LF05",
        node:"K04.04",
        name:"Tô hoặc sửa lại nét",
        severity:"SERIOUS",
        keywords:[
            "to lai",
            "sua lai net",
            "ve lai net",
            "chinh sua net"
        ]
    },


    "LF06":{
        id:"LF06",
        node:"K04.04",
        name:"Khởi bút ngập ngừng",
        keywords:[
            "khoi but ngap ngung",
            "ngap ngung"
        ]
    },


    /* =====================================================
       TÀNG PHONG
    ===================================================== */

    "TF01":{
        id:"TF01",
        node:"K04.05",
        name:"Chưa giấu được phong bút",
        keywords:[
            "tang phong chua ro",
            "chua giau phong",
            "lo dau but"
        ]
    },


    "TF02":{
        id:"TF02",
        node:"K04.05",
        name:"Động tác hồi phong chưa đúng",
        keywords:[
            "hoi phong chua dung",
            "hoi phong sai"
        ]
    },


    "TF03":{
        id:"TF03",
        node:"K04.05",
        name:"Khởi bút bị nặng",
        keywords:[
            "khoi but nang",
            "dau net nang"
        ]
    },


    /* =====================================================
       VIÊN BÚT
    ===================================================== */

    "VB01":{
        id:"VB01",
        node:"K04.06",
        name:"Nét chưa tròn",
        keywords:[
            "net chua tron",
            "vien but chua tron",
            "chua tron"
        ]
    },


    "VB02":{
        id:"VB02",
        node:"K04.06",
        name:"Thân nét không đầy",
        keywords:[
            "than net khong day",
            "net khong day"
        ]
    },


    "VB03":{
        id:"VB03",
        node:"K04.06",
        name:"Viên bút thiếu lực",
        keywords:[
            "vien but thieu luc"
        ]
    },


    "VB04":{
        id:"VB04",
        node:"K04.06",
        name:"Điều phong trong Viên bút chưa ổn",
        keywords:[
            "vien but dieu phong",
            "dieu phong vien but"
        ]
    },


    /* =====================================================
       PHƯƠNG BÚT
    ===================================================== */

    "PB01":{
        id:"PB01",
        node:"K04.07",
        name:"Góc nét chưa rõ",
        keywords:[
            "goc net chua ro",
            "phuong but chua ro"
        ]
    },


    "PB02":{
        id:"PB02",
        node:"K04.07",
        name:"Nét bị tròn hóa",
        keywords:[
            "net bi tron",
            "phuong but bi tron"
        ]
    },


    /* =====================================================
       HÌNH THÁI
    ===================================================== */

    "HT01":{
        id:"HT01",
        node:"K05.01",
        name:"Đường nét chưa chuẩn xác",
        keywords:[
            "duong net chua chinh xac",
            "duong net chua chuan",
            "net chua chuan",
            "chuan xac cua duong net"
        ]
    },


    "HT02":{
        id:"HT02",
        node:"K05.02",
        name:"Tỷ lệ chữ chưa hợp lý",
        keywords:[
            "ti le chu",
            "ty le chu",
            "chu khong can doi"
        ]
    },


    "HT03":{
        id:"HT03",
        node:"K05.03",
        name:"Kết cấu chữ chưa vững",
        keywords:[
            "ket cau chu",
            "ket cau chua vung"
        ]
    },


    /* =====================================================
       LÂM MÔ
    ===================================================== */

    "LM01":{
        id:"LM01",
        node:"K06.01",
        name:"Quan sát mẫu chưa kỹ",
        keywords:[
            "quan sat mau",
            "nhin mau chua ky"
        ]
    },


    "LM02":{
        id:"LM02",
        node:"K06.02",
        name:"Hình chưa sát mẫu",
        keywords:[
            "chua sat mau",
            "hinh chua sat mau",
            "khong giong mau"
        ]
    },


    "LM03":{
        id:"LM03",
        node:"K06.03",
        name:"Lâm mô còn máy móc",
        keywords:[
            "may moc",
            "lam mo may moc"
        ]
    },


    /* =====================================================
       BỐ CỤC
    ===================================================== */

    "BASE01":{
        id:"BASE01",
        node:"K07.01",
        name:"Đường cơ sở chưa ổn định",
        keywords:[
            "duong co so",
            "chu y duong co so",
            "co so chua deu"
        ]
    },


    "SPACE01":{
        id:"SPACE01",
        node:"K07.02",
        name:"Khoảng cách chữ chưa đều",
        keywords:[
            "khoang cach chu",
            "khoang cach chua deu"
        ]
    },


    "AXIS01":{
        id:"AXIS01",
        node:"K07.03",
        name:"Trục chữ chưa ổn định",
        keywords:[
            "truc chu",
            "truc chua on"
        ]
    },


    "LAYOUT01":{
        id:"LAYOUT01",
        node:"K07.04",
        name:"Bố cục chưa cân bằng",
        keywords:[
            "bo cuc chua can bang",
            "bo cuc chua on",
            "bo cuc"
        ]
    },


    /* =====================================================
       MỰC / TỐC ĐỘ
    ===================================================== */

    "INK01":{
        id:"INK01",
        node:"K08.01",
        name:"Thừa mực",
        keywords:[
            "thua muc",
            "muc nhieu",
            "qua nhieu muc"
        ]
    },


    "INK02":{
        id:"INK02",
        node:"K08.01",
        name:"Thiếu mực",
        keywords:[
            "thieu muc",
            "muc kho"
        ]
    },


    "SPEED01":{
        id:"SPEED01",
        node:"K08.02",
        name:"Tốc độ hành bút chưa phù hợp",
        keywords:[
            "toc do",
            "di but nhanh",
            "di but cham",
            "hanh but nhanh",
            "hanh but cham"
        ]
    },


    "PBK01":{
        id:"PBK01",
        node:"K08.04",
        name:"Phi bạch chưa tự nhiên",
        keywords:[
            "phi bach chua tu nhien",
            "phi bach chua tot"
        ]
    },


    /* =====================================================
       Ý / THẦN
    ===================================================== */

    "YT01":{
        id:"YT01",
        node:"K09.01",
        name:"Hình và ý chưa thống nhất",
        keywords:[
            "hinh va y",
            "hinh y"
        ]
    },


    "THAN01":{
        id:"THAN01",
        node:"K09.02",
        name:"Thần thái chưa rõ",
        keywords:[
            "than thai",
            "thieu than",
            "chua co than"
        ]
    },


    "TN01":{
        id:"TN01",
        node:"K09.03",
        name:"Nét viết chưa tự nhiên",
        keywords:[
            "chua tu nhien",
            "net cung",
            "go bo"
        ]
    }

};


/* =========================================================
   EXERCISE REGISTRY

   Registry v1 có 37 Exercise.

   Một Exercise có thể liên quan nhiều Node nhưng
   primaryNode là Node chính dùng cho Rubric.
========================================================= */

const EXERCISES={

    "EX01":{
        id:"EX01",
        name:"Cầm bút cơ bản",
        primaryNode:"K03.01",
        nodes:["K03.01"],
        aliases:[
            "cam but",
            "cam but co ban",
            "bai cam but"
        ]
    },


    "EX02":{
        id:"EX02",
        name:"Khởi động bút",
        primaryNode:"K03.02",
        nodes:["K03.01","K03.02"],
        aliases:[
            "khoi dong but",
            "luyen but"
        ]
    },


    "EX03":{
        id:"EX03",
        name:"Hành bút cơ bản",
        primaryNode:"K03.03",
        nodes:["K03.03"],
        aliases:[
            "hanh but",
            "hanh but co ban"
        ]
    },


    "EX04":{
        id:"EX04",
        name:"Điều phong",
        primaryNode:"K03.04",
        nodes:["K03.03","K03.04"],
        aliases:[
            "dieu phong",
            "bai dieu phong",
            "bai tap dieu phong"
        ]
    },


    "EX05":{
        id:"EX05",
        name:"Chuyển hướng",
        primaryNode:"K03.05",
        nodes:["K03.04","K03.05"],
        aliases:[
            "chuyen huong",
            "chuyen huong but"
        ]
    },


    "EX06":{
        id:"EX06",
        name:"Bút lực",
        primaryNode:"K03.06",
        nodes:["K03.03","K03.06"],
        aliases:[
            "but luc",
            "bai but luc"
        ]
    },


    "EX07":{
        id:"EX07",
        name:"Đường bút liên tục",
        primaryNode:"K03.07",
        nodes:["K03.03","K03.04","K03.07"],
        aliases:[
            "duong but lien tuc",
            "lien tuc duong but"
        ]
    },


    "EX08":{
        id:"EX08",
        name:"Lộ phong",
        primaryNode:"K04.04",
        nodes:[
            "K03.04",
            "K04.01",
            "K04.04"
        ],
        aliases:[
            "lo phong",
            "bai lo phong",
            "bai tap lo phong",
            "nop bai lo phong"
        ]
    },


    "EX09":{
        id:"EX09",
        name:"Tàng phong",
        primaryNode:"K04.05",
        nodes:[
            "K03.04",
            "K04.01",
            "K04.05"
        ],
        aliases:[
            "tang phong",
            "bai tang phong",
            "bai tap tang phong",
            "nop bai tang phong"
        ]
    },


    "EX10":{
        id:"EX10",
        name:"Viên bút",
        primaryNode:"K04.06",
        nodes:[
            "K03.04",
            "K03.06",
            "K04.06"
        ],
        aliases:[
            "vien but",
            "bai vien but",
            "bai tap vien but",
            "nop bai vien but"
        ]
    },


    "EX11":{
        id:"EX11",
        name:"Phương bút",
        primaryNode:"K04.07",
        nodes:[
            "K03.04",
            "K03.06",
            "K04.07"
        ],
        aliases:[
            "phuong but",
            "bai phuong but",
            "bai tap phuong but"
        ]
    },


    "EX12":{
        id:"EX12",
        name:"Nét chấm",
        primaryNode:"K05.01",
        nodes:[
            "K03.03",
            "K05.01"
        ],
        aliases:[
            "net cham",
            "cham",
            "abc cham"
        ]
    },


    "EX13":{
        id:"EX13",
        name:"Nét ngang",
        primaryNode:"K05.01",
        nodes:[
            "K03.03",
            "K05.01"
        ],
        aliases:[
            "net ngang"
        ]
    },


    "EX14":{
        id:"EX14",
        name:"Nét dọc",
        primaryNode:"K05.01",
        nodes:[
            "K03.03",
            "K05.01"
        ],
        aliases:[
            "net doc"
        ]
    },


    "EX15":{
        id:"EX15",
        name:"Nét lượn",
        primaryNode:"K05.01",
        nodes:[
            "K03.04",
            "K03.05",
            "K05.01"
        ],
        aliases:[
            "net luon",
            "bai net luon"
        ]
    },


    "EX16":{
        id:"EX16",
        name:"Nét móc",
        primaryNode:"K05.01",
        nodes:[
            "K03.04",
            "K03.05",
            "K05.01"
        ],
        aliases:[
            "net moc",
            "moc"
        ]
    },


    "EX17":{
        id:"EX17",
        name:"Nét hất",
        primaryNode:"K05.01",
        nodes:[
            "K03.04",
            "K03.05",
            "K05.01"
        ],
        aliases:[
            "net hat",
            "hat"
        ]
    },


    "EX18":{
        id:"EX18",
        name:"Nét cong vòng",
        primaryNode:"K05.01",
        nodes:[
            "K03.04",
            "K03.05",
            "K05.01"
        ],
        aliases:[
            "net cong vong",
            "cong vong"
        ]
    },


    "EX19":{
        id:"EX19",
        name:"Âm ghép",
        primaryNode:"K05.03",
        nodes:[
            "K05.01",
            "K05.02",
            "K05.03"
        ],
        aliases:[
            "am ghep",
            "bai am ghep",
            "bai tap am ghep"
        ]
    },


    "EX20":{
        id:"EX20",
        name:"Chữ ghép",
        primaryNode:"K05.03",
        nodes:[
            "K05.02",
            "K05.03"
        ],
        aliases:[
            "chu ghep"
        ]
    },


    "EX21":{
        id:"EX21",
        name:"Bảng chữ cái thường",
        primaryNode:"K05.03",
        nodes:[
            "K05.01",
            "K05.02",
            "K05.03"
        ],
        aliases:[
            "bang chu cai thuong",
            "chu viet thuong"
        ]
    },


    "EX22":{
        id:"EX22",
        name:"Bảng chữ cái in hoa",
        primaryNode:"K05.03",
        nodes:[
            "K05.01",
            "K05.02",
            "K05.03"
        ],
        aliases:[
            "bang chu cai in hoa",
            "bang chu cai hoa",
            "chu viet hoa"
        ]
    },


    "EX23":{
        id:"EX23",
        name:"Lâm mô chữ đơn",
        primaryNode:"K06.02",
        nodes:[
            "K06.01",
            "K06.02"
        ],
        aliases:[
            "lam mo chu don"
        ]
    },


    "EX24":{
        id:"EX24",
        name:"Lâm mô cụm chữ",
        primaryNode:"K06.02",
        nodes:[
            "K06.01",
            "K06.02",
            "K07.02"
        ],
        aliases:[
            "lam mo cum chu"
        ]
    },


    "EX25":{
        id:"EX25",
        name:"Lâm mô bút pháp",
        primaryNode:"K06.02",
        nodes:[
            "K04.02",
            "K06.01",
            "K06.02"
        ],
        aliases:[
            "lam mo but phap"
        ]
    },


    "EX26":{
        id:"EX26",
        name:"Lâm mô hình và ý",
        primaryNode:"K06.03",
        nodes:[
            "K06.02",
            "K06.03",
            "K09.01"
        ],
        aliases:[
            "lam mo hinh va y",
            "lam mo hinh y"
        ]
    },


    "EX27":{
        id:"EX27",
        name:"Đường cơ sở",
        primaryNode:"K07.01",
        nodes:[
            "K07.01"
        ],
        aliases:[
            "duong co so",
            "bai duong co so"
        ]
    },


    "EX28":{
        id:"EX28",
        name:"Khoảng cách chữ",
        primaryNode:"K07.02",
        nodes:[
            "K07.01",
            "K07.02"
        ],
        aliases:[
            "khoang cach chu"
        ]
    },


    "EX29":{
        id:"EX29",
        name:"Trục chữ",
        primaryNode:"K07.03",
        nodes:[
            "K07.01",
            "K07.03"
        ],
        aliases:[
            "truc chu"
        ]
    },


    "EX30":{
        id:"EX30",
        name:"Bố cục tác phẩm ngắn",
        primaryNode:"K07.04",
        nodes:[
            "K07.01",
            "K07.02",
            "K07.03",
            "K07.04"
        ],
        aliases:[
            "bo cuc",
            "bo cuc tac pham",
            "bo cuc tac pham ngan"
        ]
    },


    "EX31":{
        id:"EX31",
        name:"Khô – nhuận",
        primaryNode:"K08.01",
        nodes:[
            "K02.02",
            "K08.01"
        ],
        aliases:[
            "kho nhuan"
        ]
    },


    "EX32":{
        id:"EX32",
        name:"Tốc độ hành bút",
        primaryNode:"K08.02",
        nodes:[
            "K03.03",
            "K08.02"
        ],
        aliases:[
            "toc do hanh but",
            "nhanh cham"
        ]
    },


    "EX33":{
        id:"EX33",
        name:"Tiết tấu",
        primaryNode:"K08.03",
        nodes:[
            "K08.02",
            "K08.03"
        ],
        aliases:[
            "tiet tau",
            "tiet tau but"
        ]
    },


    "EX34":{
        id:"EX34",
        name:"Phi bạch",
        primaryNode:"K08.04",
        nodes:[
            "K08.01",
            "K08.02",
            "K08.04"
        ],
        aliases:[
            "phi bach"
        ]
    },


    "EX35":{
        id:"EX35",
        name:"Hình và ý",
        primaryNode:"K09.01",
        nodes:[
            "K06.02",
            "K09.01"
        ],
        aliases:[
            "hinh va y",
            "hinh y"
        ]
    },


    "EX36":{
        id:"EX36",
        name:"Biểu đạt thần thái",
        primaryNode:"K09.02",
        nodes:[
            "K09.01",
            "K09.02",
            "K09.03"
        ],
        aliases:[
            "than thai",
            "bieu dat than thai"
        ]
    },


    "EX37":{
        id:"EX37",
        name:"Sáng tác tác phẩm",
        primaryNode:"K10.01",
        nodes:[
            "K07.04",
            "K09.01",
            "K09.02",
            "K10.01"
        ],
        aliases:[
            "sang tac",
            "sang tac tac pham",
            "tac pham sang tac"
        ]
    }

};


/* =========================================================
   PRACTICE UNIT REGISTRY
========================================================= */

const PRACTICE_UNITS={

    "PU-STROKE-DOT":{
        id:"PU-STROKE-DOT",
        name:"Nét chấm",
        exercise:"EX12",
        aliases:[
            "net cham",
            "abc cham"
        ]
    },


    "PU-STROKE-CURVE":{
        id:"PU-STROKE-CURVE",
        name:"Nét lượn",
        exercise:"EX15",
        aliases:[
            "net luon"
        ]
    },


    "PU-STROKE-HOOK":{
        id:"PU-STROKE-HOOK",
        name:"Nét móc",
        exercise:"EX16",
        aliases:[
            "net moc"
        ]
    },


    "PU-STROKE-LIFT":{
        id:"PU-STROKE-LIFT",
        name:"Nét hất",
        exercise:"EX17",
        aliases:[
            "net hat"
        ]
    },


    "PU-STROKE-CURVE-LOOP":{
        id:"PU-STROKE-CURVE-LOOP",
        name:"Nét cong vòng",
        exercise:"EX18",
        aliases:[
            "net cong vong"
        ]
    },


    "PU-SOUND-COMPOUND":{
        id:"PU-SOUND-COMPOUND",
        name:"Âm ghép",
        exercise:"EX19",
        aliases:[
            "am ghep"
        ]
    },


    "PU-LETTER-COMPOUND":{
        id:"PU-LETTER-COMPOUND",
        name:"Chữ ghép",
        exercise:"EX20",
        aliases:[
            "chu ghep"
        ]
    },


    "PU-LOWERCASE":{
        id:"PU-LOWERCASE",
        name:"Bảng chữ cái thường",
        exercise:"EX21",
        aliases:[
            "bang chu cai thuong"
        ]
    },


    "PU-UPPERCASE":{
        id:"PU-UPPERCASE",
        name:"Bảng chữ cái in hoa",
        exercise:"EX22",
        aliases:[
            "bang chu cai in hoa",
            "bang chu cai hoa"
        ]
    }

};


/* =========================================================
   COPY PRACTICE REGISTRY

   Đây KHÔNG phải Knowledge Node.
========================================================= */

const COPY_PRACTICES={

    "PU-COPY-VANSUTHUANLOI":{
        id:"PU-COPY-VANSUTHUANLOI",
        name:"Vạn sự thuận lợi",
        exercise:"EX24",
        aliases:[
            "van su thuan loi",
            "lam mo van su thuan loi"
        ]
    },


    "PU-COPY-VANSUNHUY":{
        id:"PU-COPY-VANSUNHUY",
        name:"Vạn sự như ý",
        exercise:"EX24",
        aliases:[
            "van su nhu y",
            "lam mo van su nhu y"
        ]
    },


    "PU-COPY-ONHOANNHANNAI":{
        id:"PU-COPY-ONHOANNHANNAI",
        name:"Ôn hoà nhẫn nại",
        exercise:"EX24",
        aliases:[
            "on hoa nhan nai",
            "lam mo on hoa nhan nai"
        ]
    },


    "PU-COPY-BENBI":{
        id:"PU-COPY-BENBI",
        name:"Bền bỉ",
        exercise:"EX24",
        aliases:[
            "ben bi",
            "lam mo ben bi"
        ]
    },


    "PU-COPY-VOVI":{
        id:"PU-COPY-VOVI",
        name:"Vô vi",
        exercise:"EX24",
        aliases:[
            "vo vi",
            "lam mo vo vi"
        ]
    },


    "PU-COPY-BIENHOCVOBO":{
        id:"PU-COPY-BIENHOCVOBO",
        name:"Biển học vô bờ",
        exercise:"EX24",
        aliases:[
            "bien hoc vo bo"
        ]
    },


    "PU-COPY-ANSUVINHKY":{
        id:"PU-COPY-ANSUVINHKY",
        name:"Ân sư vĩnh ký",
        exercise:"EX24",
        aliases:[
            "an su vinh ky"
        ]
    },


    "PU-COPY-DOCLOPTUDO":{
        id:"PU-COPY-DOCLOPTUDO",
        name:"Độc lập tự do",
        exercise:"EX24",
        aliases:[
            "doc lap tu do"
        ]
    },


    "PU-COPY-PHAT":{
        id:"PU-COPY-PHAT",
        name:"Phật",
        exercise:"EX23",
        aliases:[
            "lam mo phat",
            "chu phat"
        ]
    },


    "PU-COPY-CANBAN":{
        id:"PU-COPY-CANBAN",
        name:"Căn bản",
        exercise:"EX24",
        aliases:[
            "lam mo can ban"
        ]
    },


    "PU-COPY-THANDOC":{
        id:"PU-COPY-THANDOC",
        name:"Thận độc",
        exercise:"EX24",
        aliases:[
            "than doc"
        ]
    },


    "PU-COPY-HOAKHISINHTAI":{
        id:"PU-COPY-HOAKHISINHTAI",
        name:"Hoà khí sinh tài",
        exercise:"EX24",
        aliases:[
            "hoa khi sinh tai"
        ]
    },


    "PU-COPY-TETDOANVIEN":{
        id:"PU-COPY-TETDOANVIEN",
        name:"Tết đoàn viên",
        exercise:"EX24",
        aliases:[
            "tet doan vien"
        ]
    },


    "PU-COPY-ANKHANGTHINHVUONG":{
        id:"PU-COPY-ANKHANGTHINHVUONG",
        name:"An khang thịnh vượng",
        exercise:"EX24",
        aliases:[
            "an khang thinh vuong"
        ]
    }

};


/* =========================================================
   CURRICULUM MAP

   HISTORICAL = dữ liệu suy ra từ lịch sử.

   Không coi đây là chương trình chính thức.
========================================================= */

const CURRICULUM_MAP={

    3:{
        units:["PU-COPY-VOVI"],
        source:"HISTORICAL"
    },

    4:{
        units:["PU-COPY-BENBI"],
        source:"HISTORICAL"
    },

    5:{
        units:["PU-COPY-BIENHOCVOBO"],
        source:"HISTORICAL"
    },

    7:{
        units:["PU-COPY-ANSUVINHKY"],
        source:"HISTORICAL"
    },

    8:{
        units:["PU-COPY-DOCLOPTUDO"],
        source:"HISTORICAL"
    },

    9:{
        units:["PU-UPPERCASE"],
        source:"HISTORICAL"
    },

    10:{
        units:["PU-LOWERCASE"],
        source:"HISTORICAL"
    },

    11:{
        units:["PU-COPY-PHAT"],
        source:"HISTORICAL"
    },

    12:{
        units:["PU-COPY-CANBAN"],
        source:"HISTORICAL"
    },

    15:{
        units:[
            "PU-STROKE-DOT",
            "PU-COPY-VANSUTHUANLOI"
        ],
        source:"HISTORICAL"
    },

    17:{
        units:[
            "PU-STROKE-HOOK",
            "PU-STROKE-LIFT",
            "PU-COPY-VANSUNHUY"
        ],
        source:"HISTORICAL"
    },

    19:{
        units:[
            "PU-STROKE-CURVE",
            "PU-COPY-ONHOANNHANNAI"
        ],
        source:"HISTORICAL"
    }

};


/* =========================================================
   GENERIC DESCRIPTIONS
========================================================= */

const GENERIC_DESCRIPTIONS=[

    "bai tap",
    "bt",
    "bai cu",
    "bai tap cu",
    "luyen tap",
    "bai luyen tap",
    "bo sung",
    "bai tap bo sung",
    "nop bai",
    "da nop"
];


/* =========================================================
   EVENT KEYWORDS
========================================================= */

const EVENT_KEYWORDS=[

    "mini event",
    "mini game",
    "quoc khanh",
    "chao mung",
    "su kien"
];


/* =========================================================
   SPECIALIZED RUBRIC BUILDERS
========================================================= */

function createSkillRubric(
    skillName,
    phrases
){

    return{

        1:{
            state:"NOT_FORMED",
            interpretation:
                phrases[1] ||
                "Chưa thực hiện được "+skillName+"."
        },

        2:{
            state:"VERY_WEAK",
            interpretation:
                phrases[2] ||
                "Đã thử "+skillName+" nhưng đặc điểm kỹ thuật chưa rõ."
        },

        3:{
            state:"FORMING",
            interpretation:
                phrases[3] ||
                "Bắt đầu hình thành "+skillName+" nhưng còn nhiều bất ổn."
        },

        4:{
            state:"UNSTABLE",
            interpretation:
                phrases[4] ||
                "Đã thể hiện một phần "+skillName+" nhưng khả năng kiểm soát chưa ổn định."
        },

        5:{
            state:"BASIC",
            interpretation:
                phrases[5] ||
                "Thực hiện được "+skillName+" ở mức cơ bản nhưng chất lượng chưa ổn định."
        },

        6:{
            state:"DEVELOPING",
            interpretation:
                phrases[6] ||
                skillName+" đã tương đối rõ và đang phát triển."
        },

        7:{
            state:"GOOD",
            interpretation:
                phrases[7] ||
                "Thực hiện "+skillName+" khá tốt, kỹ thuật đã rõ."
        },

        8:{
            state:"VERY_GOOD",
            interpretation:
                phrases[8] ||
                skillName+" được thực hiện rất tốt và tương đối ổn định."
        },

        9:{
            state:"STABLE",
            interpretation:
                phrases[9] ||
                skillName+" tốt và ổn định."
        },

        10:{
            state:"EXCELLENT",
            interpretation:
                phrases[10] ||
                "Thực hiện "+skillName+" xuất sắc trong phạm vi bài tập."
        }
    };
}


/* =========================================================
   EXERCISE RUBRICS
========================================================= */

const EXERCISE_RUBRICS={};


/*
   Tạo rubric nền cho toàn bộ 37 bài.
*/

Object.keys(EXERCISES)
.forEach(
    function(id){

        const exercise=
            EXERCISES[id];


        EXERCISE_RUBRICS[id]=
            createSkillRubric(
                exercise.name,
                {}
            );
    }
);


/* =========================================================
   RUBRIC CHUYÊN BIỆT - LỘ PHONG
========================================================= */

EXERCISE_RUBRICS.EX08=
createSkillRubric(
    "Lộ phong",
    {

        1:
            "Chưa hình thành được nét Lộ phong theo yêu cầu.",

        2:
            "Đã thử thực hiện nhưng đặc điểm Lộ phong chưa rõ.",

        3:
            "Bắt đầu tạo được Lộ phong nhưng khởi bút và hướng phong còn bất ổn.",

        4:
            "Đã thể hiện được Lộ phong ở một số nét nhưng khả năng kiểm soát khởi bút chưa ổn định.",

        5:
            "Thực hiện được Lộ phong ở mức cơ bản; đầu nét và chất lượng đường bút còn cần luyện thêm.",

        6:
            "Lộ phong đã tương đối rõ; cần tiếp tục luyện để khởi bút và đường nét ổn định hơn.",

        7:
            "Lộ phong thể hiện tốt, đặc điểm kỹ thuật rõ và khả năng kiểm soát tương đối tốt.",

        8:
            "Lộ phong rất tốt, đầu nét rõ và khả năng điều khiển bút tương đối ổn định.",

        9:
            "Lộ phong tốt và ổn định qua bài tập, chất lượng đường nét cao.",

        10:
            "Lộ phong được thực hiện xuất sắc trong phạm vi bài tập."
    }
);


/* =========================================================
   RUBRIC CHUYÊN BIỆT - TÀNG PHONG
========================================================= */

EXERCISE_RUBRICS.EX09=
createSkillRubric(
    "Tàng phong",
    {

        1:
            "Chưa hình thành được kỹ thuật Tàng phong.",

        2:
            "Đã thử Tàng phong nhưng chưa giấu được phong bút.",

        3:
            "Bắt đầu hiểu động tác Tàng phong nhưng hồi phong còn bất ổn.",

        4:
            "Đã thực hiện được một phần Tàng phong nhưng khởi bút và hồi phong chưa ổn định.",

        5:
            "Tàng phong đạt mức cơ bản nhưng khả năng giấu phong và chuyển động đầu bút còn cần luyện.",

        6:
            "Tàng phong tương đối rõ; động tác đã tốt hơn nhưng cần tăng độ ổn định.",

        7:
            "Tàng phong tốt, động tác hồi phong và khởi bút khá rõ.",

        8:
            "Tàng phong rất tốt, phong bút được kiểm soát tốt và đường nét tương đối ổn định.",

        9:
            "Tàng phong tốt và ổn định qua bài tập.",

        10:
            "Tàng phong được thực hiện xuất sắc trong phạm vi bài tập."
    }
);


/* =========================================================
   RUBRIC CHUYÊN BIỆT - VIÊN BÚT
========================================================= */

EXERCISE_RUBRICS.EX10=
createSkillRubric(
    "Viên bút",
    {

        1:
            "Chưa hình thành được đặc điểm Viên bút.",

        2:
            "Đã thử Viên bút nhưng nét chưa có đặc điểm tròn và đầy.",

        3:
            "Bắt đầu hình thành Viên bút nhưng độ tròn, độ đầy và điều phong còn yếu.",

        4:
            "Đã tạo được một số nét Viên bút nhưng hình thái và điều phong chưa ổn định.",

        5:
            "Viên bút đạt mức cơ bản nhưng độ tròn, độ đầy và khả năng điều phong còn cần luyện.",

        6:
            "Viên bút tương đối rõ; cần tiếp tục luyện để nét tròn và ổn định hơn.",

        7:
            "Viên bút tốt, nét khá tròn và khả năng điều khiển bút tương đối tốt.",

        8:
            "Viên bút rất tốt, nét tròn, đầy và tương đối ổn định.",

        9:
            "Viên bút tốt và ổn định, chất lượng đường nét cao.",

        10:
            "Viên bút được thực hiện xuất sắc trong phạm vi bài tập."
    }
);


/* =========================================================
   RUBRIC CHUYÊN BIỆT - PHƯƠNG BÚT
========================================================= */

EXERCISE_RUBRICS.EX11=
createSkillRubric(
    "Phương bút",
    {

        1:
            "Chưa hình thành được đặc điểm Phương bút.",

        2:
            "Đã thử nhưng hình thái góc cạnh của Phương bút chưa rõ.",

        3:
            "Bắt đầu tạo được Phương bút nhưng góc nét và hướng bút còn bất ổn.",

        4:
            "Đã thể hiện được một phần Phương bút nhưng góc nét chưa ổn định.",

        5:
            "Phương bút đạt mức cơ bản; hình thái góc cạnh và lực nét còn cần luyện.",

        6:
            "Phương bút tương đối rõ và đang dần ổn định.",

        7:
            "Phương bút tốt, đặc điểm góc nét khá rõ.",

        8:
            "Phương bút rất tốt, góc nét rõ và khả năng kiểm soát tương đối ổn định.",

        9:
            "Phương bút tốt và ổn định qua bài tập.",

        10:
            "Phương bút được thực hiện xuất sắc trong phạm vi bài tập."
    }
);


/* =========================================================
   RUBRIC CHUYÊN BIỆT - ĐIỀU PHONG
========================================================= */

EXERCISE_RUBRICS.EX04=
createSkillRubric(
    "Điều phong",
    {

        1:
            "Chưa kiểm soát được phong bút.",

        2:
            "Đã bắt đầu điều chỉnh phong bút nhưng đầu bút thường xuyên mất kiểm soát.",

        3:
            "Bắt đầu hình thành khả năng Điều phong nhưng chuyển động còn bất ổn.",

        4:
            "Có thể Điều phong ở một số nét nhưng chưa duy trì ổn định.",

        5:
            "Điều phong đạt mức cơ bản nhưng khi chuyển hướng hoặc thay đổi lực vẫn chưa ổn định.",

        6:
            "Khả năng Điều phong khá hơn và có thể duy trì trong phần lớn đường bút.",

        7:
            "Điều phong tốt, đầu bút được kiểm soát khá rõ.",

        8:
            "Điều phong rất tốt và tương đối ổn định trong các chuyển động.",

        9:
            "Điều phong tốt và ổn định qua nhiều đường nét.",

        10:
            "Khả năng Điều phong xuất sắc trong phạm vi bài tập."
    }
);


/* =========================================================
   RUBRIC CHUYÊN BIỆT - BÚT LỰC
========================================================= */

EXERCISE_RUBRICS.EX06=
createSkillRubric(
    "Bút lực",
    {

        1:
            "Chưa hình thành được khả năng kiểm soát Bút lực.",

        2:
            "Đường nét còn yếu và lực bút chưa rõ.",

        3:
            "Bắt đầu tạo được lực nhưng lực nét còn thất thường.",

        4:
            "Đã có Bút lực ở một số nét nhưng chưa duy trì đều.",

        5:
            "Bút lực đạt mức cơ bản nhưng độ chắc và sự ổn định còn cần luyện.",

        6:
            "Bút lực tương đối rõ và đang dần ổn định.",

        7:
            "Bút lực tốt, đường nét có độ chắc tương đối rõ.",

        8:
            "Bút lực rất tốt, đường nét chắc và tương đối ổn định.",

        9:
            "Bút lực tốt và ổn định qua bài tập.",

        10:
            "Khả năng kiểm soát Bút lực xuất sắc trong phạm vi bài tập."
    }
);


/* =========================================================
   RUBRIC CHUYÊN BIỆT - LÂM MÔ
========================================================= */

["EX23","EX24","EX25","EX26"]
.forEach(
    function(id){

        const name=
            EXERCISES[id].name;


        EXERCISE_RUBRICS[id]=
        createSkillRubric(
            name,
            {

                1:
                    "Chưa tái hiện được đặc điểm cơ bản của mẫu.",

                2:
                    "Đã quan sát và thử lâm mô nhưng hình thái còn sai lệch nhiều.",

                3:
                    "Bắt đầu tái hiện được một số đặc điểm của mẫu nhưng chưa ổn định.",

                4:
                    "Đã nắm được một phần hình thái mẫu nhưng độ chuẩn xác còn hạn chế.",

                5:
                    "Lâm mô đạt mức cơ bản; hình thái chính đã có nhưng cần quan sát kỹ hơn.",

                6:
                    "Khả năng lâm mô khá; hình thái tương đối sát mẫu.",

                7:
                    "Lâm mô tốt, hình thái và quan hệ đường nét khá rõ.",

                8:
                    "Lâm mô rất tốt, hình thái sát mẫu và kỹ thuật tương đối ổn định.",

                9:
                    "Lâm mô tốt và ổn định, thể hiện khả năng quan sát và tái hiện cao.",

                10:
                    "Lâm mô xuất sắc trong phạm vi bài tập."
            }
        );
    }
);


/* =========================================================
   RUBRIC CHUYÊN BIỆT - BỐ CỤC
========================================================= */

EXERCISE_RUBRICS.EX30=
createSkillRubric(
    "Bố cục",
    {

        1:
            "Chưa hình thành được bố cục theo yêu cầu.",

        2:
            "Đã sắp xếp chữ nhưng quan hệ không gian còn rời rạc.",

        3:
            "Bắt đầu hình thành bố cục nhưng trục, khoảng cách và cân bằng còn yếu.",

        4:
            "Bố cục đã có cấu trúc nhưng chưa ổn định.",

        5:
            "Bố cục đạt mức cơ bản; khoảng cách, trục và cân bằng vẫn cần điều chỉnh.",

        6:
            "Bố cục khá rõ và đang dần cân bằng hơn.",

        7:
            "Bố cục tốt, quan hệ không gian tương đối hợp lý.",

        8:
            "Bố cục rất tốt và tương đối cân bằng.",

        9:
            "Bố cục tốt, ổn định và có sự thống nhất cao.",

        10:
            "Bố cục xuất sắc trong phạm vi bài tập."
    }
);


/* =========================================================
   ALIAS INDEX
========================================================= */

let aliasIndex=null;


function buildAliasIndex(){

    const index=[];


    Object.keys(EXERCISES)
    .forEach(
        function(id){

            const exercise=
                EXERCISES[id];


            const aliases=
                [
                    exercise.name
                ]
                .concat(
                    exercise.aliases ||
                    []
                );


            aliases.forEach(
                function(alias){

                    const normalized=
                        normalizeText(alias);


                    if(!normalized){
                        return;
                    }


                    index.push({

                        type:"EXERCISE",

                        id,

                        normalized,

                        length:
                            normalized.length
                    });
                }
            );
        }
    );


    Object.keys(PRACTICE_UNITS)
    .forEach(
        function(id){

            const unit=
                PRACTICE_UNITS[id];


            [
                unit.name
            ]
            .concat(
                unit.aliases ||
                []
            )
            .forEach(
                function(alias){

                    const normalized=
                        normalizeText(alias);


                    if(!normalized){
                        return;
                    }


                    index.push({

                        type:"PRACTICE_UNIT",

                        id,

                        normalized,

                        length:
                            normalized.length
                    });
                }
            );
        }
    );


    Object.keys(COPY_PRACTICES)
    .forEach(
        function(id){

            const unit=
                COPY_PRACTICES[id];


            [
                unit.name
            ]
            .concat(
                unit.aliases ||
                []
            )
            .forEach(
                function(alias){

                    const normalized=
                        normalizeText(alias);


                    if(!normalized){
                        return;
                    }


                    index.push({

                        type:"COPY_PRACTICE",

                        id,

                        normalized,

                        length:
                            normalized.length
                    });
                }
            );
        }
    );


    /*
       Alias dài hơn được xét trước.
    */

    index.sort(
        function(a,b){

            return b.length-a.length;
        }
    );


    aliasIndex=
        index;


    return index;
}


/* =========================================================
   WEEK
========================================================= */

function extractWeek(text){

    const normalized=
        normalizeText(text);


    const match=
        normalized.match(
            /\btuan\s*(\d{1,2})\b/
        );


    if(!match){

        return null;
    }


    const week=
        Number(
            match[1]
        );


    return Number.isFinite(week)
        ? week
        : null;
}


/* =========================================================
   EVENT DETECTION
========================================================= */

function isEventDescription(text){

    const normalized=
        normalizeText(text);


    return EVENT_KEYWORDS.some(
        function(keyword){

            return normalized.includes(
                keyword
            );
        }
    );
}


/* =========================================================
   GENERIC DETECTION
========================================================= */

function isGenericDescription(text){

    const normalized=
        normalizeText(text);


    if(!normalized){

        return true;
    }


    return GENERIC_DESCRIPTIONS.some(
        function(value){

            return normalized === value;
        }
    );
}


/* =========================================================
   FIND ALIASES
========================================================= */

function findAliasMatches(text){

    const normalized=
        normalizeText(text);


    if(!aliasIndex){

        buildAliasIndex();
    }


    const found=[];

    const seen=
        new Set();


    aliasIndex.forEach(
        function(item){

            if(
                !normalized.includes(
                    item.normalized
                )
            ){

                return;
            }


            const key=
                item.type+
                ":"+
                item.id;


            if(
                seen.has(key)
            ){

                return;
            }


            seen.add(key);

            found.push(
                item
            );
        }
    );


    return found;
}


/* =========================================================
   RESOLVE DESCRIPTION
========================================================= */

function resolveExerciseDescription(
    description
){

    const raw=
        clean(description);


    const normalized=
        normalizeText(raw);


    const week=
        extractWeek(
            normalized
        );


    const result={

        rawDescription:
            raw,

        normalizedDescription:
            normalized,

        activityType:
            ACTIVITY_TYPE.UNKNOWN,

        resolutionType:
            RESOLUTION_TYPE.UNKNOWN,

        confidence:0,

        week,

        exercises:[],

        practiceUnits:[],

        copyPractices:[],

        knowledgeNodes:[],

        primaryNode:null,

        source:""
    };


    if(!normalized){

        return result;
    }


    if(
        isEventDescription(
            normalized
        )
    ){

        result.activityType=
            ACTIVITY_TYPE.EVENT;
    }


    const matches=
        findAliasMatches(
            normalized
        );


    const exerciseSet=
        new Set();

    const practiceSet=
        new Set();

    const copySet=
        new Set();

    const nodeSet=
        new Set();


    matches.forEach(
        function(match){

            if(
                match.type ===
                "EXERCISE"
            ){

                exerciseSet.add(
                    match.id
                );
            }


            if(
                match.type ===
                "PRACTICE_UNIT"
            ){

                practiceSet.add(
                    match.id
                );


                const unit=
                    PRACTICE_UNITS[
                        match.id
                    ];


                if(
                    unit &&
                    unit.exercise
                ){

                    exerciseSet.add(
                        unit.exercise
                    );
                }
            }


            if(
                match.type ===
                "COPY_PRACTICE"
            ){

                copySet.add(
                    match.id
                );


                const unit=
                    COPY_PRACTICES[
                        match.id
                    ];


                if(
                    unit &&
                    unit.exercise
                ){

                    exerciseSet.add(
                        unit.exercise
                    );
                }
            }
        }
    );


    /*
       Nếu chỉ có Tuần và không có nội dung cụ thể,
       dùng Curriculum ở confidence thấp hơn.
    */

    if(
        exerciseSet.size === 0 &&
        week &&
        CURRICULUM_MAP[week]
    ){

        const curriculum=
            CURRICULUM_MAP[week];


        (
            curriculum.units ||
            []
        )
        .forEach(
            function(unitId){

                if(
                    PRACTICE_UNITS[
                        unitId
                    ]
                ){

                    practiceSet.add(
                        unitId
                    );


                    exerciseSet.add(
                        PRACTICE_UNITS[
                            unitId
                        ].exercise
                    );
                }


                if(
                    COPY_PRACTICES[
                        unitId
                    ]
                ){

                    copySet.add(
                        unitId
                    );


                    exerciseSet.add(
                        COPY_PRACTICES[
                            unitId
                        ].exercise
                    );
                }
            }
        );


        result.resolutionType=
            RESOLUTION_TYPE.WEEK_ONLY;

        result.confidence=
            0.55;

        result.source=
            EVIDENCE_SOURCE.CURRICULUM;
    }


    /*
       Exact/alias.
    */

    else if(
        exerciseSet.size === 1 &&
        matches.length === 1
    ){

        const match=
            matches[0];


        result.resolutionType=
            normalized ===
            match.normalized
            ?
            RESOLUTION_TYPE.EXACT
            :
            RESOLUTION_TYPE.ALIAS;


        result.confidence=
            result.resolutionType ===
            RESOLUTION_TYPE.EXACT
            ?
            1
            :
            0.95;


        result.source=
            result.resolutionType ===
            RESOLUTION_TYPE.EXACT
            ?
            EVIDENCE_SOURCE.EXERCISE_EXACT
            :
            EVIDENCE_SOURCE.EXERCISE_ALIAS;
    }


    /*
       Composite.
    */

    else if(
        exerciseSet.size > 0
    ){

        result.resolutionType=
            week
            ?
            RESOLUTION_TYPE.WEEK_PLUS_CONTENT
            :
            RESOLUTION_TYPE.COMPOSITE;


        result.confidence=
            week
            ?
            0.90
            :
            0.90;


        result.source=
            EVIDENCE_SOURCE.EXERCISE_ALIAS;
    }


    /*
       Generic.
    */

    else if(
        isGenericDescription(
            normalized
        )
    ){

        result.resolutionType=
            RESOLUTION_TYPE.GENERIC;

        result.confidence=
            0.20;

        result.source=
            EVIDENCE_SOURCE.HISTORICAL;
    }


    if(
        result.activityType ===
        ACTIVITY_TYPE.UNKNOWN
    ){

        result.activityType=
            exerciseSet.size
            ?
            ACTIVITY_TYPE.PRACTICE
            :
            ACTIVITY_TYPE.UNKNOWN;
    }


    exerciseSet.forEach(
        function(id){

            const exercise=
                EXERCISES[id];


            if(!exercise){
                return;
            }


            (
                exercise.nodes ||
                []
            )
            .forEach(
                function(node){

                    nodeSet.add(
                        node
                    );
                }
            );
        }
    );


    result.exercises=
        Array.from(
            exerciseSet
        );


    result.practiceUnits=
        Array.from(
            practiceSet
        );


    result.copyPractices=
        Array.from(
            copySet
        );


    result.knowledgeNodes=
        Array.from(
            nodeSet
        );


    if(
        result.exercises.length === 1
    ){

        const exercise=
            EXERCISES[
                result.exercises[0]
            ];


        result.primaryNode=
            exercise
            ?
            exercise.primaryNode
            :
            null;
    }


    return result;
}


/* =========================================================
   SCORE ASSESSMENT
========================================================= */

function getScoreAssessment(
    exerciseId,
    score
){

    const value=
        parseScore(
            score
        );


    if(
        value === null
    ){

        return null;
    }


    /*
       Rubric 1–10 dùng số nguyên gần nhất.

       Không làm thay đổi điểm gốc.
    */

    const rubricScore=
        Math.max(
            1,
            Math.min(
                10,
                Math.round(value)
            )
        );


    const global=
        GLOBAL_SCORE_RUBRIC[
            rubricScore
        ];


    const rubric=
        EXERCISE_RUBRICS[
            exerciseId
        ];


    const specialized=
        rubric
        ?
        rubric[
            rubricScore
        ]
        :
        null;


    return{

        score:
            value,

        rubricScore,

        state:
            specialized
            ?
            specialized.state
            :
            global.state,

        label:
            global.label,

        interpretation:
            specialized
            ?
            specialized.interpretation
            :
            global.label,

        source:
            EVIDENCE_SOURCE.SCORE_RUBRIC,

        confidence:
            0.75
    };
}


/* =========================================================
   ERROR RESOLVER
========================================================= */

function resolveTeacherErrors(
    comment
){

    const normalized=
        normalizeText(
            comment
        );


    if(!normalized){

        return [];
    }


    const result=[];


    Object.keys(ERROR_MAP)
    .forEach(
        function(id){

            const error=
                ERROR_MAP[id];


            const matched=
                (
                    error.keywords ||
                    []
                )
                .some(
                    function(keyword){

                        return normalized.includes(
                            normalizeText(
                                keyword
                            )
                        );
                    }
                );


            if(!matched){
                return;
            }


            result.push({

                errorId:
                    id,

                knowledgeNode:
                    error.node,

                name:
                    error.name,

                severity:
                    error.severity ||
                    "NORMAL",

                source:
                    EVIDENCE_SOURCE.TEACHER_ERROR,

                confidence:
                    0.95
            });
        }
    );


    return result;
}


/* =========================================================
   SUBMISSION EVIDENCE
========================================================= */

function resolveSubmission(
    submission
){

    submission=
        submission || {};


    const description=
        submission.rawDescription !==
        undefined
        ?
        submission.rawDescription
        :
        (
            submission.description ||
            submission.exerciseDescription ||
            ""
        );


    const resolution=
        resolveExerciseDescription(
            description
        );


    const score=
        parseScore(
            submission.score
        );


    const teacherComment=
        clean(
            submission.teacherComment ||
            submission.comment ||
            ""
        );


    const teacherErrors=
        resolveTeacherErrors(
            teacherComment
        );


    const scoreAssessments=[];


    /*
       Chỉ tạo Score → Skill khi bài đủ rõ.

       WEEK_ONLY 0.55 không được tự biến
       một điểm thành điểm của từng kỹ năng.
    */

    if(
        score !== null &&
        resolution.confidence >=
        CONFIG.directEvidenceConfidence
    ){

        resolution.exercises
        .forEach(
            function(exerciseId){

                const assessment=
                    getScoreAssessment(
                        exerciseId,
                        score
                    );


                if(assessment){

                    scoreAssessments.push({

                        exerciseId,

                        primaryNode:
                            EXERCISES[
                                exerciseId
                            ]
                            ?
                            EXERCISES[
                                exerciseId
                            ].primaryNode
                            :
                            null,

                        assessment
                    });
                }
            }
        );
    }


    /*
       Composite không được biến điểm thành
       điểm chính thức cho từng kỹ năng.

       Chỉ một Exercise rõ ràng mới có
       direct score evidence.
    */

    const directScoreEvidence=

        resolution.exercises.length === 1

        &&

        resolution.confidence >=
        CONFIG.directEvidenceConfidence;


    return{

        submissionId:
            clean(
                submission.submissionId ||
                submission.id ||
                ""
            ),

        originalIndex:
            Number(
                submission.originalIndex ||
                submission.rowIndex ||
                0
            ),

        studentCode:
            normalizeCode(
                submission.studentCode ||
                submission.code ||
                ""
            ),

        course:
            clean(
                submission.course ||
                ""
            ),

        timestamp:
            clean(
                submission.submittedAt ||
                submission.timestamp ||
                ""
            ),

        date:
            parseDate(
                submission.submittedAt ||
                submission.timestamp
            ),

        rawDescription:
            clean(description),

        normalizedDescription:
            resolution.normalizedDescription,

        activityType:
            resolution.activityType,

        resolutionType:
            resolution.resolutionType,

        resolutionConfidence:
            resolution.confidence,

        curriculum:{
            week:
                resolution.week
        },

        exercises:
            resolution.exercises.slice(),

        practiceUnits:
            resolution.practiceUnits.slice(),

        copyPractices:
            resolution.copyPractices.slice(),

        knowledgeNodes:
            resolution.knowledgeNodes.slice(),

        primaryNode:
            resolution.primaryNode,

        score,

        directScoreEvidence,

        scoreAssessments,

        teacherComment,

        teacherErrors,

        assessmentSource:
            teacherComment
            ?
            "TEACHER"
            :
            (
                score !== null
                ?
                "SCORE_MAP"
                :
                "NONE"
            )
    };
}


/* =========================================================
   TREND
========================================================= */

function calculateTrend(
    evidence
){

    const scores=
        (
            evidence ||
            []
        )
        .filter(
            function(item){

                return(
                    item &&
                    item.score !== null &&
                    item.score !== undefined
                );
            }
        )
        .map(
            function(item){

                return Number(
                    item.score
                );
            }
        );


    if(
        scores.length < 2
    ){

        return{

            type:"INSUFFICIENT",

            delta:0,

            recent:
                scores
        };
    }


    const recent=
        scores.slice(
            -CONFIG.recentEvidenceLimit
        );


    let weightedDelta=0;
    let weightTotal=0;


    for(
        let i=1;
        i<recent.length;
        i++
    ){

        const weight=
            i;


        weightedDelta +=
            (
                recent[i]-
                recent[i-1]
            )
            *
            weight;


        weightTotal +=
            weight;
    }


    const delta=
        weightTotal
        ?
        weightedDelta/
        weightTotal
        :
        0;


    let type=
        "STABLE";


    if(
        delta >= 0.75
    ){

        type=
            "STRONG_IMPROVEMENT";

    }else if(
        delta >= 0.25
    ){

        type=
            "IMPROVING";

    }else if(
        delta <= -0.75
    ){

        type=
            "STRONG_DECLINE";

    }else if(
        delta <= -0.25
    ){

        type=
            "DECLINING";
    }


    return{

        type,

        delta:

            Math.round(
                delta*100
            )/100,

        recent
    };
}


/* =========================================================
   STABILITY
========================================================= */

function calculateStability(
    evidence
){

    const scores=
        (
            evidence ||
            []
        )
        .filter(
            function(item){

                return(
                    item.score !== null &&
                    item.score !== undefined
                );
            }
        )
        .map(
            function(item){

                return Number(
                    item.score
                );
            }
        )
        .slice(
            -CONFIG.recentEvidenceLimit
        );


    if(
        scores.length <
        CONFIG.stableEvidenceMinimum
    ){

        return{

            stable:false,

            reason:
                "INSUFFICIENT_EVIDENCE",

            scoreCount:
                scores.length
        };
    }


    const mean=
        scores.reduce(
            function(total,value){

                return total+value;
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


    const standardDeviation=
        Math.sqrt(
            variance
        );


    return{

        stable:
            standardDeviation <= 1,

        mean:
            Math.round(
                mean*100
            )/100,

        standardDeviation:
            Math.round(
                standardDeviation*100
            )/100,

        scoreCount:
            scores.length
    };
}


/* =========================================================
   NODE EVIDENCE
========================================================= */

function buildNodeEvidence(
    submissions
){

    const map=
        new Map();


    function ensure(nodeId){

        if(
            !map.has(nodeId)
        ){

            map.set(
                nodeId,
                []
            );
        }


        return map.get(
            nodeId
        );
    }


    (
        submissions ||
        []
    )
    .forEach(
        function(submission){

            const resolved=
                submission &&
                submission.resolutionType
                ?
                submission
                :
                resolveSubmission(
                    submission
                );


            /*
               Direct score evidence.
            */

            if(
                resolved.directScoreEvidence
            ){

                resolved.scoreAssessments
                .forEach(
                    function(item){

                        if(
                            !item.primaryNode
                        ){

                            return;
                        }


                        ensure(
                            item.primaryNode
                        )
                        .push({

                            type:
                                "SCORE",

                            source:
                                EVIDENCE_SOURCE.SCORE_RUBRIC,

                            submission:
                                resolved,

                            exerciseId:
                                item.exerciseId,

                            score:
                                resolved.score,

                            assessment:
                                item.assessment,

                            confidence:
                                Math.min(
                                    resolved.resolutionConfidence,
                                    item.assessment.confidence
                                ),

                            date:
                                resolved.date
                        });
                    }
                );
            }


            /*
               Teacher Error Evidence.

               Đây là Evidence trực tiếp vì GVCN
               đã chỉ ra vấn đề cụ thể.
            */

            resolved.teacherErrors
            .forEach(
                function(error){

                    if(
                        !error.knowledgeNode
                    ){

                        return;
                    }


                    ensure(
                        error.knowledgeNode
                    )
                    .push({

                        type:
                            "ERROR",

                        source:
                            EVIDENCE_SOURCE.TEACHER_ERROR,

                        submission:
                            resolved,

                        error,

                        score:
                            resolved.score,

                        confidence:
                            error.confidence,

                        date:
                            resolved.date
                    });
                }
            );


            /*
               Supporting evidence.

               Composite / Week không gán điểm trực tiếp.
            */

            if(
                !resolved.directScoreEvidence &&
                resolved.resolutionConfidence >=
                CONFIG.supportingEvidenceConfidence
            ){

                resolved.knowledgeNodes
                .forEach(
                    function(nodeId){

                        ensure(
                            nodeId
                        )
                        .push({

                            type:
                                "SUPPORTING",

                            source:
                                resolved.resolutionType ===
                                RESOLUTION_TYPE.WEEK_ONLY
                                ?
                                EVIDENCE_SOURCE.CURRICULUM
                                :
                                EVIDENCE_SOURCE.EXERCISE_ALIAS,

                            submission:
                                resolved,

                            score:
                                null,

                            rawScore:
                                resolved.score,

                            confidence:
                                resolved.resolutionConfidence,

                            date:
                                resolved.date
                        });
                    }
                );
            }

        }
    );


    return map;
}


/* =========================================================
   SORT EVIDENCE
========================================================= */

function sortEvidence(
    evidence
){

    return(
        evidence ||
        []
    )
    .slice()
    .sort(
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
                ta !== tb
            ){

                return ta-tb;
            }


            return(

                Number(
                    a.submission &&
                    a.submission.originalIndex ||
                    0
                )

                -

                Number(
                    b.submission &&
                    b.submission.originalIndex ||
                    0
                )
            );
        }
    );
}


/* =========================================================
   PREREQUISITES
========================================================= */

function prerequisitesSatisfied(
    nodeId,
    stateMap
){

    const node=
        KNOWLEDGE_NODES[
            nodeId
        ];


    if(
        !node ||
        !node.prerequisites ||
        !node.prerequisites.length
    ){

        return true;
    }


    return node.prerequisites.every(
        function(requiredId){

            const state=
                stateMap &&
                stateMap[
                    requiredId
                ];


            if(!state){

                return false;
            }


            return [

                MASTERY_STATE.ACHIEVED,

                MASTERY_STATE.STABLE,

                MASTERY_STATE.MASTERED

            ]
            .includes(
                state.mastery
            );
        }
    );
}


/* =========================================================
   EVALUATE NODE
========================================================= */

function evaluateNode(
    nodeId,
    evidence
){

    const node=
        KNOWLEDGE_NODES[
            nodeId
        ];


    const ordered=
        sortEvidence(
            evidence
        );


    const scoreEvidence=
        ordered.filter(
            function(item){

                return(
                    item.type ===
                    "SCORE"
                    &&
                    item.score !== null
                );
            }
        );


    const errorEvidence=
        ordered.filter(
            function(item){

                return item.type ===
                "ERROR";
            }
        );


    const supportingEvidence=
        ordered.filter(
            function(item){

                return item.type ===
                "SUPPORTING";
            }
        );


    const trend=
        calculateTrend(
            scoreEvidence
        );


    const stability=
        calculateStability(
            scoreEvidence
        );


    const scores=
        scoreEvidence.map(
            function(item){

                return Number(
                    item.score
                );
            }
        );


    const recentScores=
        scores.slice(
            -CONFIG.recentEvidenceLimit
        );


    const latestScore=
        recentScores.length
        ?
        recentScores[
            recentScores.length-1
        ]
        :
        null;


    const recentErrors=
        errorEvidence.slice(
            -3
        );


    const seriousError=
        recentErrors.some(
            function(item){

                return(
                    item.error &&
                    item.error.severity ===
                    "SERIOUS"
                );
            }
        );


    let mastery=
        MASTERY_STATE.AVAILABLE;


    if(
        !ordered.length
    ){

        mastery=
            MASTERY_STATE.AVAILABLE;
    }


    else if(
        !scoreEvidence.length
    ){

        mastery=
            MASTERY_STATE.LEARNING;
    }


    else if(
        latestScore < 5
    ){

        mastery=
            MASTERY_STATE.PRACTICING;
    }


    else if(
        latestScore >=
        CONFIG.achievedScore
    ){

        mastery=
            MASTERY_STATE.ACHIEVED;
    }


    else{

        mastery=
            MASTERY_STATE.PRACTICING;
    }


    /*
       STABLE

       Ít nhất 3 evidence,
       điểm gần đây >= 7,
       độ lệch thấp,
       không có serious error.
    */

    if(
        scoreEvidence.length >=
        CONFIG.stableEvidenceMinimum

        &&

        stability.stable

        &&

        stability.mean >=
        CONFIG.achievedScore

        &&

        !seriousError
    ){

        mastery=
            MASTERY_STATE.STABLE;
    }


    /*
       MASTERED

       Điều kiện chặt hơn STABLE.
    */

    if(
        scoreEvidence.length >= 4

        &&

        stability.stable

        &&

        stability.mean >=
        CONFIG.strongScore

        &&

        latestScore >=
        CONFIG.strongScore

        &&

        !seriousError

        &&

        ![
            "DECLINING",
            "STRONG_DECLINE"
        ]
        .includes(
            trend.type
        )
    ){

        mastery=
            MASTERY_STATE.MASTERED;
    }


    /*
       REVIEW

       Đã từng có kết quả tốt nhưng
       các bài gần đây giảm rõ.
    */

    const historicalHigh=
        scores.some(
            function(score){

                return score >=
                    CONFIG.strongScore;
            }
        );


    if(
        historicalHigh

        &&

        (
            trend.type ===
            "STRONG_DECLINE"

            ||

            (
                trend.type ===
                "DECLINING"

                &&

                latestScore !== null

                &&

                latestScore < 7
            )
        )
    ){

        mastery=
            MASTERY_STATE.REVIEW;
    }


    return{

        nodeId,

        node:
            node || null,

        mastery,

        evidenceCount:
            ordered.length,

        scoreEvidenceCount:
            scoreEvidence.length,

        supportingEvidenceCount:
            supportingEvidence.length,

        errorEvidenceCount:
            errorEvidence.length,

        latestScore,

        recentScores,

        trend,

        stability,

        recentErrors:
            recentErrors.map(
                function(item){

                    return item.error;
                }
            ),

        seriousError,

        evidence:
            ordered
    };
}


/* =========================================================
   STUDENT STATE
========================================================= */

function getStudentKnowledgeState(
    submissions,
    studentCode
){

    const code=
        normalizeCode(
            studentCode
        );


    const resolved=
        (
            submissions ||
            []
        )
        .map(
            function(item){

                return(
                    item &&
                    item.resolutionType
                )
                ?
                item
                :
                resolveSubmission(
                    item
                );
            }
        )
        .filter(
            function(item){

                if(!code){
                    return true;
                }


                return(
                    !item.studentCode ||
                    item.studentCode ===
                    code
                );
            }
        );


    const evidenceMap=
        buildNodeEvidence(
            resolved
        );


    const nodes={};


    Object.keys(
        KNOWLEDGE_NODES
    )
    .forEach(
        function(nodeId){

            nodes[nodeId]=
                evaluateNode(

                    nodeId,

                    evidenceMap.get(
                        nodeId
                    )
                    ||
                    []
                );
        }
    );


    /*
       Áp dụng prerequisite lock sau khi
       đã đánh giá Evidence.
    */

    Object.keys(nodes)
    .forEach(
        function(nodeId){

            const state=
                nodes[nodeId];


            if(
                state.evidenceCount > 0
            ){

                return;
            }


            if(
                !prerequisitesSatisfied(
                    nodeId,
                    nodes
                )
            ){

                state.mastery=
                    MASTERY_STATE.LOCKED;
            }
        }
    );


    return{

        studentCode:
            code,

        submissions:
            resolved,

        nodes,

        generatedAt:
            new Date()
            .toISOString()
    };
}


/* =========================================================
   WEAK NODES
========================================================= */

function getWeakNodes(
    studentState
){

    if(
        !studentState ||
        !studentState.nodes
    ){

        return [];
    }


    const priority={

        REVIEW:1,

        PRACTICING:2,

        LEARNING:3,

        AVAILABLE:4,

        LOCKED:5,

        ACHIEVED:6,

        STABLE:7,

        MASTERED:8
    };


    return Object.values(
        studentState.nodes
    )
    .filter(
        function(state){

            return [

                MASTERY_STATE.REVIEW,

                MASTERY_STATE.PRACTICING,

                MASTERY_STATE.LEARNING

            ]
            .includes(
                state.mastery
            );
        }
    )
    .sort(
        function(a,b){

            const pa=
                priority[
                    a.mastery
                ] || 99;


            const pb=
                priority[
                    b.mastery
                ] || 99;


            if(
                pa !== pb
            ){

                return pa-pb;
            }


            return(
                Number(
                    a.latestScore === null
                    ?
                    99
                    :
                    a.latestScore
                )

                -

                Number(
                    b.latestScore === null
                    ?
                    99
                    :
                    b.latestScore
                )
            );
        }
    );
}


/* =========================================================
   PROGRESS
========================================================= */

function getProgress(
    studentState
){

    if(
        !studentState ||
        !studentState.nodes
    ){

        return{

            total:0,
            started:0,
            achieved:0,
            stable:0,
            mastered:0,
            review:0
        };
    }


    const states=
        Object.values(
            studentState.nodes
        );


    return{

        total:
            states.length,

        started:
            states.filter(
                function(item){

                    return(
                        item.evidenceCount >
                        0
                    );
                }
            ).length,

        achieved:
            states.filter(
                function(item){

                    return [

                        MASTERY_STATE.ACHIEVED,

                        MASTERY_STATE.STABLE,

                        MASTERY_STATE.MASTERED

                    ]
                    .includes(
                        item.mastery
                    );
                }
            ).length,

        stable:
            states.filter(
                function(item){

                    return(
                        item.mastery ===
                        MASTERY_STATE.STABLE
                    );
                }
            ).length,

        mastered:
            states.filter(
                function(item){

                    return(
                        item.mastery ===
                        MASTERY_STATE.MASTERED
                    );
                }
            ).length,

        review:
            states.filter(
                function(item){

                    return(
                        item.mastery ===
                        MASTERY_STATE.REVIEW
                    );
                }
            ).length
    };
}


/* =========================================================
   ADVICE CONTEXT

   Chỉ tạo dữ liệu cho Minh Hồng.

   Không trực tiếp render UI.
========================================================= */

function getAdviceContext(
    studentState
){

    const weak=
        getWeakNodes(
            studentState
        );


    const focus=
        weak.length
        ?
        weak[0]
        :
        null;


    if(!focus){

        return{

            type:"GENERAL",

            focusNode:null,

            message:
                "Chưa có đủ dữ liệu để xác định kỹ năng cần ưu tiên.",

            source:"KNOWLEDGE_ENGINE"
        };
    }


    let message="";


    if(
        focus.mastery ===
        MASTERY_STATE.REVIEW
    ){

        message=
            focus.node.name+
            " từng có kết quả tốt nhưng các bài gần đây có dấu hiệu giảm. Nên ôn lại kỹ thuật này trước khi tiếp tục nâng độ khó.";
    }


    else if(
        focus.mastery ===
        MASTERY_STATE.PRACTICING
    ){

        message=
            focus.node.name+
            " đang trong giai đoạn luyện tập và chưa thật sự ổn định. Nên tiếp tục luyện kỹ năng này.";
    }


    else if(
        focus.mastery ===
        MASTERY_STATE.LEARNING
    ){

        message=
            "Bạn đã tiếp cận "+
            focus.node.name+
            " nhưng hiện chưa có đủ kết quả chấm điểm để đánh giá mức độ thành thạo.";
    }


    return{

        type:
            focus.mastery,

        focusNode:
            focus.nodeId,

        nodeName:
            focus.node.name,

        latestScore:
            focus.latestScore,

        trend:
            focus.trend,

        recentErrors:
            focus.recentErrors,

        message,

        source:
            "KNOWLEDGE_ENGINE"
    };
}


/* =========================================================
   RECOMMENDED EXERCISE
========================================================= */

function getRecommendedExercise(
    studentState
){

    const weak=
        getWeakNodes(
            studentState
        );


    if(!weak.length){

        return null;
    }


    const nodeId=
        weak[0].nodeId;


    const exercise=
        Object.values(
            EXERCISES
        )
        .find(
            function(item){

                return(
                    item.primaryNode ===
                    nodeId
                );
            }
        );


    return exercise || null;
}


/* =========================================================
   CSV
========================================================= */

function parseCSV(text){

    const RS=
        window.StudentRewardSystem;


    if(
        RS &&
        typeof RS.parseCSV ===
        "function"
    ){

        return RS.parseCSV(
            text
        );
    }


    text=
        String(
            text || ""
        );


    const rows=[];

    let row=[];
    let value="";
    let quoted=false;


    for(
        let i=0;
        i<text.length;
        i++
    ){

        const char=
            text[i];


        if(
            char === '"'
        ){

            if(
                quoted &&
                text[i+1] === '"'
            ){

                value += '"';

                i++;

            }else{

                quoted=
                    !quoted;
            }


            continue;
        }


        if(
            char === "," &&
            !quoted
        ){

            row.push(value);

            value="";

            continue;
        }


        if(
            (
                char === "\n" ||
                char === "\r"
            )
            &&
            !quoted
        ){

            if(
                char === "\r" &&
                text[i+1] === "\n"
            ){

                i++;
            }


            row.push(value);

            rows.push(row);

            row=[];

            value="";

            continue;
        }


        value += char;
    }


    if(
        value.length ||
        row.length
    ){

        row.push(value);

        rows.push(row);
    }


    return rows;
}


/* =========================================================
   COLUMN
========================================================= */

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


    const normalizedHeaders=
        (
            headers ||
            []
        )
        .map(
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


        const index=
            normalizedHeaders.indexOf(
                wanted
            );


        if(
            index >= 0
        ){

            return index;
        }
    }


    return -1;
}


/* =========================================================
   MAP SUBMISSION CSV

   Hỗ trợ trực tiếp cấu trúc NopBaiLuyenTap.
========================================================= */

function mapSubmissionRows(
    rows
){

    if(
        !rows ||
        rows.length < 2
    ){

        return [];
    }


    const headers=
        rows[0];


    const timestampIndex=
        findColumn(
            headers,
            [
                "Dấu thời gian",
                "Timestamp"
            ]
        );


    const nameIndex=
        findColumn(
            headers,
            [
                "Họ và tên",
                "Họ tên"
            ]
        );


    const codeIndex=
        findColumn(
            headers,
            [
                "Mã học viên"
            ]
        );


    const groupIndex=
        findColumn(
            headers,
            [
                "Tổ"
            ]
        );


    const courseIndex=
        findColumn(
            headers,
            [
                "Khóa",
                "Khoá"
            ]
        );


    const fileIndex=
        findColumn(
            headers,
            [
                "Tải bài tập lên"
            ]
        );


    const descriptionIndex=
        findColumn(
            headers,
            [
                "Mô tả bài tập",
                "Tên bài tập",
                "Bài tập"
            ]
        );


    const scoreIndex=
        findColumn(
            headers,
            [
                "Điểm",
                "Điểm số"
            ]
        );


    const commentIndex=
        findColumn(
            headers,
            [
                "Nhận xét",
                "Nhận xét GVCN"
            ]
        );


    return rows
    .slice(1)
    .map(
        function(row,index){

            return{

                submissionId:
                    "SUB-"+(
                        index+2
                    ),

                rowIndex:
                    index+2,

                originalIndex:
                    index+1,

                timestamp:
                    timestampIndex >= 0
                    ?
                    clean(
                        row[
                            timestampIndex
                        ]
                    )
                    :
                    "",

                studentName:
                    nameIndex >= 0
                    ?
                    clean(
                        row[
                            nameIndex
                        ]
                    )
                    :
                    "",

                studentCode:
                    codeIndex >= 0
                    ?
                    normalizeCode(
                        row[
                            codeIndex
                        ]
                    )
                    :
                    "",

                group:
                    groupIndex >= 0
                    ?
                    clean(
                        row[
                            groupIndex
                        ]
                    )
                    :
                    "",

                course:
                    courseIndex >= 0
                    ?
                    clean(
                        row[
                            courseIndex
                        ]
                    )
                    :
                    "",

                file:
                    fileIndex >= 0
                    ?
                    clean(
                        row[
                            fileIndex
                        ]
                    )
                    :
                    "",

                rawDescription:
                    descriptionIndex >= 0
                    ?
                    clean(
                        row[
                            descriptionIndex
                        ]
                    )
                    :
                    "",

                score:
                    scoreIndex >= 0
                    ?
                    parseScore(
                        row[
                            scoreIndex
                        ]
                    )
                    :
                    null,

                teacherComment:
                    commentIndex >= 0
                    ?
                    clean(
                        row[
                            commentIndex
                        ]
                    )
                    :
                    ""
            };
        }
    )
    .filter(
        function(item){

            return Boolean(
                item.studentCode ||
                item.studentName ||
                item.file
            );
        }
    );
}


/* =========================================================
   FETCH
========================================================= */

function getSubmissionCsvUrl(){

    return(
        "https://docs.google.com/spreadsheets/d/"
        +
        encodeURIComponent(
            CONFIG.submissionSpreadsheetId
        )
        +
        "/gviz/tq?tqx=out:csv&sheet="
        +
        encodeURIComponent(
            CONFIG.submissionSheetName
        )
    );
}


async function fetchSubmissionRows(){

    const response=
        await fetch(
            getSubmissionCsvUrl(),
            {
                cache:"no-store"
            }
        );


    if(
        !response.ok
    ){

        throw new Error(
            "Không tải được dữ liệu bài nộp OCD."
        );
    }


    const text=
        await response.text();


    return parseCSV(
        text
    );
}


/* =========================================================
   CACHE
========================================================= */

let submissionCache=null;

let submissionCacheTime=0;


/* =========================================================
   LOAD SUBMISSIONS
========================================================= */

async function loadSubmissions(
    forceRefresh
){

    const now=
        Date.now();


    if(
        !forceRefresh &&
        submissionCache &&
        (
            now-
            submissionCacheTime
        )
        <
        CONFIG.cacheTtl
    ){

        return submissionCache;
    }


    const rows=
        await fetchSubmissionRows();


    const raw=
        mapSubmissionRows(
            rows
        );


    const resolved=
        raw.map(
            resolveSubmission
        );


    submissionCache={

        raw,

        resolved,

        rows,

        loadedAt:
            new Date()
            .toISOString()
    };


    submissionCacheTime=
        now;


    return submissionCache;
}


/* =========================================================
   GET STUDENT SUBMISSIONS
========================================================= */

async function getStudentSubmissions(
    code,
    forceRefresh
){

    const studentCode=
        normalizeCode(
            code
        );


    if(!studentCode){

        return [];
    }


    const data=
        await loadSubmissions(
            forceRefresh
        );


    return data.resolved.filter(
        function(item){

            return(
                item.studentCode ===
                studentCode
            );
        }
    );
}


/* =========================================================
   GET STUDENT STATE ASYNC
========================================================= */

async function loadStudentKnowledgeState(
    code,
    forceRefresh
){

    const submissions=
        await getStudentSubmissions(
            code,
            forceRefresh
        );


    return getStudentKnowledgeState(
        submissions,
        code
    );
}


/* =========================================================
   GET MASTERY
========================================================= */

async function getMastery(
    code,
    nodeId,
    forceRefresh
){

    const state=
        await loadStudentKnowledgeState(
            code,
            forceRefresh
        );


    return(
        state.nodes[
            nodeId
        ]
        ||
        null
    );
}


/* =========================================================
   GET STUDENT PROGRESS
========================================================= */

async function loadStudentProgress(
    code,
    forceRefresh
){

    const state=
        await loadStudentKnowledgeState(
            code,
            forceRefresh
        );


    return getProgress(
        state
    );
}


/* =========================================================
   GET STUDENT ADVICE
========================================================= */

async function getAdvice(
    code,
    forceRefresh
){

    const state=
        await loadStudentKnowledgeState(
            code,
            forceRefresh
        );


    return getAdviceContext(
        state
    );
}


/* =========================================================
   QUEST CONTEXT

   Chưa tạo Quest.
   Chỉ cung cấp hook dữ liệu.
========================================================= */

async function getQuestContext(
    code,
    forceRefresh
){

    const state=
        await loadStudentKnowledgeState(
            code,
            forceRefresh
        );


    const weak=
        getWeakNodes(
            state
        );


    const recommendedExercise=
        getRecommendedExercise(
            state
        );


    return{

        studentCode:
            normalizeCode(
                code
            ),

        weakNodes:
            weak,

        recommendedExercise,

        progress:
            getProgress(
                state
            ),

        advice:
            getAdviceContext(
                state
            ),

        generatedAt:
            new Date()
            .toISOString()
    };
}


/* =========================================================
   DEBUG RESOLUTION
========================================================= */

function debugResolve(
    text
){

    const result=
        resolveExerciseDescription(
            text
        );


    console.log(
        "[OCD Knowledge] Resolve:",
        text,
        result
    );


    return result;
}


/* =========================================================
   DEBUG STUDENT
========================================================= */

async function debugStudent(
    code
){

    const state=
        await loadStudentKnowledgeState(
            code,
            true
        );


    console.log(
        "[OCD Knowledge] Student:",
        code,
        state
    );


    console.log(
        "[OCD Knowledge] Progress:",
        getProgress(
            state
        )
    );


    console.log(
        "[OCD Knowledge] Weak:",
        getWeakNodes(
            state
        )
    );


    console.log(
        "[OCD Knowledge] Advice:",
        getAdviceContext(
            state
        )
    );


    return state;
}


/* =========================================================
   VALIDATION
========================================================= */

function validateRegistry(){

    const errors=[];


    Object.keys(EXERCISES)
    .forEach(
        function(id){

            const exercise=
                EXERCISES[id];


            if(
                !KNOWLEDGE_NODES[
                    exercise.primaryNode
                ]
            ){

                errors.push(
                    id+
                    ": primaryNode không tồn tại."
                );
            }


            (
                exercise.nodes ||
                []
            )
            .forEach(
                function(nodeId){

                    if(
                        !KNOWLEDGE_NODES[
                            nodeId
                        ]
                    ){

                        errors.push(
                            id+
                            ": node "+
                            nodeId+
                            " không tồn tại."
                        );
                    }
                }
            );


            if(
                !EXERCISE_RUBRICS[id]
            ){

                errors.push(
                    id+
                    ": thiếu Score Rubric."
                );
            }
        }
    );


    Object.keys(ERROR_MAP)
    .forEach(
        function(id){

            const error=
                ERROR_MAP[id];


            if(
                !KNOWLEDGE_NODES[
                    error.node
                ]
            ){

                errors.push(
                    id+
                    ": Error Node không tồn tại."
                );
            }
        }
    );


    return{

        valid:
            errors.length === 0,

        errors,

        exerciseCount:
            Object.keys(
                EXERCISES
            ).length,

        knowledgeNodeCount:
            Object.keys(
                KNOWLEDGE_NODES
            ).length,

        errorCount:
            Object.keys(
                ERROR_MAP
            ).length
    };
}


/* =========================================================
   PUBLIC API
========================================================= */

window.OCDKnowledge={

    version:
        VERSION,

    CONFIG,

    EVIDENCE_SOURCE,

    RESOLUTION_TYPE,

    ACTIVITY_TYPE,

    MASTERY_STATE,

    SCORE_STATE,


    /* REGISTRY */

    KNOWLEDGE_NODES,

    EXERCISES,

    PRACTICE_UNITS,

    COPY_PRACTICES,

    CURRICULUM_MAP,

    ERROR_MAP,

    GLOBAL_SCORE_RUBRIC,

    EXERCISE_RUBRICS,


    /* BASIC */

    normalizeText,

    normalizeCode,

    parseNumber,

    parseScore,

    parseDate,


    /* RESOLVER */

    buildAliasIndex,

    extractWeek,

    findAliasMatches,

    resolveExerciseDescription,

    resolveTeacherErrors,

    resolveSubmission,


    /* RUBRIC */

    getScoreAssessment,


    /* EVIDENCE */

    buildNodeEvidence,

    sortEvidence,


    /* ANALYTICS */

    calculateTrend,

    calculateStability,

    evaluateNode,

    prerequisitesSatisfied,


    /* STUDENT */

    getStudentKnowledgeState,

    getWeakNodes,

    getProgress,

    getAdviceContext,

    getRecommendedExercise,


    /* DATA */

    parseCSV,

    findColumn,

    mapSubmissionRows,

    getSubmissionCsvUrl,

    fetchSubmissionRows,

    loadSubmissions,

    getStudentSubmissions,

    loadStudentKnowledgeState,

    getMastery,

    loadStudentProgress,

    getAdvice,

    getQuestContext,


    /* DEBUG */

    debugResolve,

    debugStudent,

    validateRegistry
};


/* =========================================================
   VALIDATE ON START
========================================================= */

const validation=
    validateRegistry();


if(
    !validation.valid
){

    console.error(
        "[OCD Knowledge] Registry lỗi:",
        validation.errors
    );

}else{

    console.log(
        "[OCD Knowledge] Registry hợp lệ.",
        validation
    );
}


/* =========================================================
   READY
========================================================= */

console.log(
    "[OCD Knowledge] OCDKnowledge v"+
    VERSION+
    " đã sẵn sàng."
);


try{

    window.dispatchEvent(
        new CustomEvent(
            "ocdKnowledgeReady",
            {
                detail:{

                    version:
                        VERSION,

                    exerciseCount:
                        validation.exerciseCount,

                    knowledgeNodeCount:
                        validation.knowledgeNodeCount,

                    errorCount:
                        validation.errorCount
                }
            }
        )
    );

}catch(error){}


})();
