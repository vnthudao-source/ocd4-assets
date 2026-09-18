(function(){

"use strict";

/* =========================================================
   OCD KNOWLEDGE CORE v1.0.0
   ---------------------------------------------------------
   FOUNDATION / MASTERY ENGINE

   MỤC TIÊU
   - Một nguồn sự thật duy nhất cho trạng thái học tập.
   - KHÔNG quản lý Linh Thạch.
   - KHÔNG quản lý vật phẩm.
   - KHÔNG sửa StudentRewardSystem.
   - Có thể chạy độc lập cạnh Reward Core.

   KIẾN TRÚC

   Submission
       ↓
   Resolver
       ↓
   Exercise Evidence
       ↓
   Knowledge Evidence
       ↓
   Mastery Engine
       ↓
   Student Knowledge State

========================================================= */


/* =========================================================
   KHÔNG KHỞI TẠO LẶP
========================================================= */

if(
    window.OCDKnowledgeSystem &&
    window.OCDKnowledgeSystem.version
){

    try{

        window.dispatchEvent(
            new CustomEvent(
                "ocdKnowledgeCoreReady",
                {
                    detail:{
                        version:
                            window.OCDKnowledgeSystem.version
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

const VERSION="1.0.0";


/* =========================================================
   CONFIG
========================================================= */

const CONFIG={

    timeZone:
        "Asia/Ho_Chi_Minh",

    maxRecentEvidence:
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

    minPrimaryForMastered:
        3,

    maxMasteryFromCurriculum:
        "ACHIEVED",

    maxMasteryFromFuzzy:
        "PRACTICING"
};


/* =========================================================
   ENUMS
========================================================= */

const MASTERY_STATE={

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


const SCORE_QUALITY={

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


const TREND={

    UNKNOWN:"UNKNOWN",

    STRONG_IMPROVEMENT:
        "STRONG_IMPROVEMENT",

    IMPROVING:
        "IMPROVING",

    STABLE:
        "STABLE",

    FLUCTUATING:
        "FLUCTUATING",

    DECLINING:
        "DECLINING"
};


const STABILITY={

    LOW:"LOW",

    DEVELOPING:"DEVELOPING",

    MODERATE:"MODERATE",

    HIGH:"HIGH",

    VERY_HIGH:"VERY_HIGH"
};


const STABILITY_RANK={

    LOW:1,

    DEVELOPING:2,

    MODERATE:3,

    HIGH:4,

    VERY_HIGH:5
};


const CONFIDENCE={

    LOW:"LOW",

    MEDIUM:"MEDIUM",

    HIGH:"HIGH",

    VERY_HIGH:"VERY_HIGH"
};


const RESOLUTION_TYPE={

    EXACT:"EXACT",

    ALIAS:"ALIAS",

    COMPOSITE:"COMPOSITE",

    CURRICULUM:"CURRICULUM",

    FUZZY:"FUZZY",

    UNKNOWN:"UNKNOWN"
};


const EVIDENCE_ROLE={

    PRIMARY:"PRIMARY",

    SECONDARY:"SECONDARY",

    INCIDENTAL:"INCIDENTAL"
};


const ERROR_STATE={

    NEW:"NEW",

    REPEATED:"REPEATED",

    PERSISTENT:"PERSISTENT",

    IMPROVING:"IMPROVING",

    RESOLVED:"RESOLVED"
};


const ERROR_SEVERITY={

    MINOR:"MINOR",

    MEDIUM:"MEDIUM",

    MAJOR:"MAJOR",

    BLOCKING:"BLOCKING"
};


const RECOMMENDED_ACTION={

    START:"START",

    CONTINUE:"CONTINUE",

    PRACTICE:"PRACTICE",

    REPAIR_ERROR:"REPAIR_ERROR",

    REPAIR_PREREQUISITE:
        "REPAIR_PREREQUISITE",

    REVIEW:"REVIEW",

    ADVANCE:"ADVANCE",

    MAINTAIN:"MAINTAIN"
};


/* =========================================================
   BASIC UTILITIES
========================================================= */

function normalizeText(value){

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


function normalizeCode(value){

    return String(
        value === undefined ||
        value === null
            ? ""
            : value
    )
    .trim()
    .toUpperCase();
}


function parseScore(value){

    if(
        value === undefined ||
        value === null ||
        value === ""
    ){

        return null;
    }


    const number=
        Number(
            String(value)
            .trim()
            .replace(",",".")
        );


    if(
        !Number.isFinite(number)
    ){

        return null;
    }


    if(
        number < 1 ||
        number > 10
    ){

        return null;
    }


    return number;
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


function average(values){

    const valid=
        (values || [])
        .filter(
            function(value){

                return Number.isFinite(
                    Number(value)
                );
            }
        )
        .map(Number);


    if(!valid.length){
        return 0;
    }


    return(
        valid.reduce(
            function(total,value){

                return total+value;
            },
            0
        )
        /
        valid.length
    );
}


function unique(values){

    return Array.from(
        new Set(
            values || []
        )
    );
}


function parseDate(value){

    if(
        value instanceof Date
    ){

        return Number.isNaN(
            value.getTime()
        )
            ? null
            : value;
    }


    const text=
        String(
            value || ""
        )
        .trim();


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


function compareEvidenceOldestFirst(
    a,
    b
){

    const da=
        parseDate(
            a &&
            a.timestamp
        );


    const db=
        parseDate(
            b &&
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


    if(
        ta !== tb
    ){

        return ta-tb;
    }


    return(

        Number(
            a &&
            a.originalIndex ||
            0
        )

        -

        Number(
            b &&
            b.originalIndex ||
            0
        )
    );
}


/* =========================================================
   KNOWLEDGE REGISTRY
========================================================= */

const KNOWLEDGE_REGISTRY={};


/* =========================================================
   REGISTER KNOWLEDGE
========================================================= */

function registerKnowledge(
    id,
    name,
    domain,
    prerequisites
){

    KNOWLEDGE_REGISTRY[id]={

        id,

        name,

        domain,

        prerequisites:
            prerequisites || [],

        questEligible:true,

        questTypes:[
            "learn",
            "practice",
            "improve",
            "master"
        ]
    };
}


/* =========================================================
   K01 — LÝ LUẬN
========================================================= */

registerKnowledge(
    "K01.01",
    "Khái niệm thư pháp",
    "K01"
);

registerKnowledge(
    "K01.02",
    "Viết và vẽ chữ",
    "K01"
);

registerKnowledge(
    "K01.03",
    "Hình – Kỹ – Ý – Thần",
    "K01"
);

registerKnowledge(
    "K01.04",
    "Tính tự nhiên",
    "K01"
);


/* =========================================================
   K02 — CÔNG CỤ
========================================================= */

registerKnowledge(
    "K02.01",
    "Bút lông",
    "K02"
);

registerKnowledge(
    "K02.02",
    "Mực",
    "K02"
);

registerKnowledge(
    "K02.03",
    "Giấy",
    "K02"
);

registerKnowledge(
    "K02.04",
    "Phối hợp bút–mực–giấy",
    "K02",
    [
        "K02.01",
        "K02.02",
        "K02.03"
    ]
);


/* =========================================================
   K03 — ĐIỀU KHIỂN BÚT
========================================================= */

registerKnowledge(
    "K03.01",
    "Cầm bút",
    "K03"
);

registerKnowledge(
    "K03.02",
    "Khởi bút",
    "K03",
    ["K03.01"]
);

registerKnowledge(
    "K03.03",
    "Hành bút",
    "K03",
    ["K03.01"]
);

registerKnowledge(
    "K03.04",
    "Thu bút",
    "K03",
    [
        "K03.01",
        "K03.03"
    ]
);

registerKnowledge(
    "K03.05",
    "Điều phong",
    "K03",
    [
        "K03.02",
        "K03.03"
    ]
);

registerKnowledge(
    "K03.06",
    "Bút lực",
    "K03",
    ["K03.03"]
);

registerKnowledge(
    "K03.07",
    "Chuyển hướng",
    "K03",
    [
        "K03.03",
        "K03.05"
    ]
);


/* =========================================================
   K04 — BÚT PHÁP
========================================================= */

registerKnowledge(
    "K04.01",
    "Lộ phong",
    "K04",
    [
        "K03.02",
        "K03.05"
    ]
);

registerKnowledge(
    "K04.02",
    "Tàng phong",
    "K04",
    [
        "K03.02",
        "K03.05"
    ]
);

registerKnowledge(
    "K04.03",
    "Viên bút",
    "K04",
    [
        "K03.05",
        "K03.06"
    ]
);

registerKnowledge(
    "K04.04",
    "Phương bút",
    "K04",
    [
        "K03.05",
        "K03.06"
    ]
);

registerKnowledge(
    "K04.05",
    "Liên tục đường bút",
    "K04",
    [
        "K03.03",
        "K03.07"
    ]
);

registerKnowledge(
    "K04.06",
    "Biến hóa bút pháp",
    "K04",
    [
        "K04.01",
        "K04.02",
        "K04.03",
        "K04.04"
    ]
);


/* =========================================================
   K05 — HÌNH THÁI CHỮ
========================================================= */

registerKnowledge(
    "K05.01",
    "Tỷ lệ chữ",
    "K05"
);

registerKnowledge(
    "K05.02",
    "Trọng tâm",
    "K05"
);

registerKnowledge(
    "K05.03",
    "Kết cấu chữ",
    "K05",
    [
        "K05.01",
        "K05.02"
    ]
);

registerKnowledge(
    "K05.04",
    "Biến hóa hình thái",
    "K05",
    ["K05.03"]
);


/* =========================================================
   K06 — LÂM MÔ
========================================================= */

registerKnowledge(
    "K06.01",
    "Quan sát mẫu",
    "K06"
);

registerKnowledge(
    "K06.02",
    "Lâm hình",
    "K06",
    ["K06.01"]
);

registerKnowledge(
    "K06.03",
    "Lâm bút pháp",
    "K06",
    [
        "K06.01",
        "K04.01"
    ]
);

registerKnowledge(
    "K06.04",
    "Lâm ý",
    "K06",
    [
        "K06.02",
        "K06.03"
    ]
);


/* =========================================================
   K07 — CHƯƠNG PHÁP / BỐ CỤC
========================================================= */

registerKnowledge(
    "K07.01",
    "Đường cơ sở",
    "K07"
);

registerKnowledge(
    "K07.02",
    "Khoảng cách chữ",
    "K07"
);

registerKnowledge(
    "K07.03",
    "Kích thước chữ",
    "K07"
);

registerKnowledge(
    "K07.04",
    "Trục chữ",
    "K07"
);

registerKnowledge(
    "K07.05",
    "Cân bằng động–tĩnh",
    "K07",
    [
        "K07.01",
        "K07.02",
        "K07.03",
        "K07.04"
    ]
);

registerKnowledge(
    "K07.06",
    "Bố cục tác phẩm",
    "K07",
    ["K07.05"]
);


/* =========================================================
   K08 — MỰC / TỐC ĐỘ / TIẾT TẤU
========================================================= */

registerKnowledge(
    "K08.01",
    "Khô–nhuận",
    "K08",
    ["K02.04"]
);

registerKnowledge(
    "K08.02",
    "Tốc độ hành bút",
    "K08",
    ["K03.03"]
);

registerKnowledge(
    "K08.03",
    "Tiết tấu",
    "K08",
    [
        "K08.01",
        "K08.02"
    ]
);

registerKnowledge(
    "K08.04",
    "Phi bạch",
    "K08",
    [
        "K08.01",
        "K08.02"
    ]
);


/* =========================================================
   K09 — Ý / THẦN / TỰ NHIÊN
========================================================= */

registerKnowledge(
    "K09.01",
    "Tự nhiên trong nét",
    "K09",
    [
        "K03.05",
        "K03.06"
    ]
);

registerKnowledge(
    "K09.02",
    "Biểu đạt",
    "K09",
    [
        "K05.03",
        "K08.03"
    ]
);

registerKnowledge(
    "K09.03",
    "Thần thái",
    "K09",
    [
        "K09.01",
        "K09.02"
    ]
);


/* =========================================================
   K10 — SÁNG TÁC / PHẨM BÌNH
========================================================= */

registerKnowledge(
    "K10.01",
    "Sáng tác chữ đơn",
    "K10",
    [
        "K05.03",
        "K09.01"
    ]
);

registerKnowledge(
    "K10.02",
    "Sáng tác cụm chữ",
    "K10",
    [
        "K10.01",
        "K07.02"
    ]
);

registerKnowledge(
    "K10.03",
    "Tác phẩm hoàn chỉnh",
    "K10",
    [
        "K10.02",
        "K07.06"
    ]
);

registerKnowledge(
    "K10.04",
    "Tự đánh giá",
    "K10"
);

registerKnowledge(
    "K10.05",
    "Đánh giá tác phẩm",
    "K10",
    ["K10.04"]
);


/* =========================================================
   EXERCISE REGISTRY
========================================================= */

const EXERCISE_REGISTRY={};


function registerExercise(
    id,
    name,
    primaryKnowledge,
    secondaryKnowledge,
    aliases
){

    EXERCISE_REGISTRY[id]={

        id,

        name,

        normalizedName:
            normalizeText(name),

        primaryKnowledge:
            primaryKnowledge || [],

        secondaryKnowledge:
            secondaryKnowledge || [],

        aliases:
            unique(
                [
                    name
                ]
                .concat(
                    aliases || []
                )
            )
    };
}


/* =========================================================
   E03
========================================================= */

registerExercise(
    "EX03-01",
    "Cầm bút",
    ["K03.01"],
    [],
    [
        "cầm bút",
        "cam but",
        "bài cầm bút",
        "tập cầm bút"
    ]
);

registerExercise(
    "EX03-02",
    "Khởi hành thu bút",
    [
        "K03.02",
        "K03.03",
        "K03.04"
    ],
    [],
    [
        "khởi hành thu bút",
        "khởi bút hành bút thu bút",
        "khoi hanh thu but"
    ]
);

registerExercise(
    "EX03-03",
    "Điều phong",
    ["K03.05"],
    ["K03.03"],
    [
        "điều phong",
        "dieu phong"
    ]
);

registerExercise(
    "EX03-04",
    "Bút lực",
    ["K03.06"],
    ["K03.03"],
    [
        "bút lực",
        "but luc"
    ]
);

registerExercise(
    "EX03-05",
    "Thu bút",
    ["K03.04"],
    ["K03.03"],
    [
        "thu bút",
        "thu but"
    ]
);


/* =========================================================
   E04
========================================================= */

registerExercise(
    "EX04-01",
    "Lộ phong",
    ["K04.01"],
    [
        "K03.02",
        "K03.05"
    ],
    [
        "lộ phong",
        "lo phong",
        "bài lộ phong",
        "nộp bài lộ phong"
    ]
);

registerExercise(
    "EX04-02",
    "Tàng phong",
    ["K04.02"],
    [
        "K03.02",
        "K03.05"
    ],
    [
        "tàng phong",
        "tang phong",
        "bài tàng phong",
        "nộp bài tàng phong"
    ]
);

registerExercise(
    "EX04-03",
    "Viên bút",
    ["K04.03"],
    [
        "K03.05",
        "K03.06"
    ],
    [
        "viên bút",
        "vien but",
        "bài viên bút",
        "bài tập viên bút",
        "bài tập về nhà cũ viên bút"
    ]
);

registerExercise(
    "EX04-04",
    "Phương bút",
    ["K04.04"],
    [
        "K03.05",
        "K03.06"
    ],
    [
        "phương bút",
        "phuong but"
    ]
);

registerExercise(
    "EX04-05",
    "Chuyển hướng",
    ["K03.07"],
    ["K03.05"],
    [
        "chuyển hướng",
        "chuyen huong"
    ]
);

registerExercise(
    "EX04-06",
    "Phối hợp bút pháp",
    ["K04.06"],
    [
        "K04.01",
        "K04.02",
        "K04.03",
        "K04.04"
    ],
    [
        "phối hợp bút pháp",
        "phoi hop but phap"
    ]
);


/* =========================================================
   E05
========================================================= */

registerExercise(
    "EX05-01",
    "Tỷ lệ chữ",
    ["K05.01"]
);

registerExercise(
    "EX05-02",
    "Trọng tâm chữ",
    ["K05.02"]
);

registerExercise(
    "EX05-03",
    "Kết cấu chữ",
    ["K05.03"],
    [
        "K05.01",
        "K05.02"
    ]
);

registerExercise(
    "EX05-04",
    "Biến hóa hình thái",
    ["K05.04"],
    ["K05.03"]
);


/* =========================================================
   E06
========================================================= */

registerExercise(
    "EX06-01",
    "Lâm mô chữ đơn",
    [
        "K06.01",
        "K06.02"
    ],
    ["K05.03"],
    [
        "lâm mô chữ đơn",
        "lam mo chu don"
    ]
);

registerExercise(
    "EX06-02",
    "Lâm mô bút pháp",
    [
        "K06.01",
        "K06.03"
    ],
    ["K04.06"]
);

registerExercise(
    "EX06-03",
    "Lâm mô cụm chữ",
    [
        "K06.01",
        "K06.02"
    ],
    [
        "K07.02",
        "K07.04"
    ]
);

registerExercise(
    "EX06-04",
    "Lâm mô tổng hợp",
    [
        "K06.02",
        "K06.03",
        "K06.04"
    ],
    [
        "K07.06",
        "K09.01"
    ],
    [
        "bài lâm mô",
        "lâm mô tổng hợp"
    ]
);


/* =========================================================
   E07
========================================================= */

registerExercise(
    "EX07-01",
    "Đường cơ sở",
    ["K07.01"]
);

registerExercise(
    "EX07-02",
    "Khoảng cách chữ",
    ["K07.02"]
);

registerExercise(
    "EX07-03",
    "Lớn nhỏ",
    ["K07.03"]
);

registerExercise(
    "EX07-04",
    "Trục chữ",
    ["K07.04"]
);

registerExercise(
    "EX07-05",
    "Bố cục ngắn",
    [
        "K07.01",
        "K07.02",
        "K07.03",
        "K07.04"
    ],
    ["K07.05"]
);

registerExercise(
    "EX07-06",
    "Cân bằng động tĩnh",
    ["K07.05"],
    ["K07.06"]
);


/* =========================================================
   E08
========================================================= */

registerExercise(
    "EX08-01",
    "Khô nhuận",
    ["K08.01"]
);

registerExercise(
    "EX08-02",
    "Nhanh chậm",
    ["K08.02"]
);

registerExercise(
    "EX08-03",
    "Tiết tấu",
    ["K08.03"]
);

registerExercise(
    "EX08-04",
    "Phi bạch",
    ["K08.04"],
    [
        "K08.01",
        "K08.02"
    ]
);


/* =========================================================
   E09
========================================================= */

registerExercise(
    "EX09-01",
    "Tự nhiên trong nét",
    ["K09.01"]
);

registerExercise(
    "EX09-02",
    "Hình và ý",
    ["K09.02"]
);

registerExercise(
    "EX09-03",
    "Thần thái",
    ["K09.03"]
);


/* =========================================================
   E10
========================================================= */

registerExercise(
    "EX10-01",
    "Sáng tác chữ đơn",
    ["K10.01"]
);

registerExercise(
    "EX10-02",
    "Sáng tác cụm chữ",
    ["K10.02"]
);

registerExercise(
    "EX10-03",
    "Sáng tác tác phẩm",
    ["K10.03"]
);

registerExercise(
    "EX10-04",
    "Tự phẩm bình",
    ["K10.04"]
);

registerExercise(
    "EX10-05",
    "Phẩm bình tác phẩm",
    ["K10.05"]
);


/* =========================================================
   ALIAS INDEX
========================================================= */

const ALIAS_INDEX=new Map();


function rebuildAliasIndex(){

    ALIAS_INDEX.clear();


    Object.values(
        EXERCISE_REGISTRY
    )
    .forEach(
        function(exercise){

            exercise.aliases
            .forEach(
                function(alias){

                    const key=
                        normalizeText(
                            alias
                        );


                    if(!key){
                        return;
                    }


                    if(
                        !ALIAS_INDEX.has(key)
                    ){

                        ALIAS_INDEX.set(
                            key,
                            []
                        );
                    }


                    ALIAS_INDEX
                    .get(key)
                    .push(
                        exercise.id
                    );
                }
            );
        }
    );
}


rebuildAliasIndex();


/* =========================================================
   PRACTICE UNIT REGISTRY

   Đây là tầng tên bài thực tế.
========================================================= */

const PRACTICE_UNIT_REGISTRY={};


function registerPracticeUnit(
    id,
    name,
    exerciseIds,
    aliases
){

    PRACTICE_UNIT_REGISTRY[id]={

        id,

        name,

        exerciseIds:
            exerciseIds || [],

        aliases:
            unique(
                [name]
                .concat(
                    aliases || []
                )
            )
    };
}


/* =========================================================
   PRACTICE UNITS BAN ĐẦU
========================================================= */

registerPracticeUnit(
    "PU-NET-CHAM",
    "Nét chấm",
    [
        "EX03-02",
        "EX03-03"
    ],
    [
        "nét chấm",
        "net cham"
    ]
);

registerPracticeUnit(
    "PU-NET-LUON",
    "Nét lượn",
    [
        "EX03-03",
        "EX04-05"
    ],
    [
        "nét lượn",
        "net luon"
    ]
);

registerPracticeUnit(
    "PU-NET-MOC",
    "Nét móc",
    [
        "EX03-03",
        "EX04-05"
    ],
    [
        "nét móc",
        "net moc"
    ]
);

registerPracticeUnit(
    "PU-NET-HAT",
    "Nét hất",
    [
        "EX03-03",
        "EX04-05"
    ],
    [
        "nét hất",
        "net hat"
    ]
);

registerPracticeUnit(
    "PU-NET-CONG-VONG",
    "Nét cong vòng",
    [
        "EX03-03",
        "EX04-05"
    ],
    [
        "nét cong vòng",
        "nét cong-vòng",
        "net cong vong"
    ]
);

registerPracticeUnit(
    "PU-AM-GHEP",
    "Âm ghép",
    [
        "EX05-03",
        "EX07-02"
    ],
    [
        "âm ghép",
        "am ghep",
        "bài tập âm ghép"
    ]
);

registerPracticeUnit(
    "PU-CHU-GHEP",
    "Chữ ghép",
    [
        "EX05-03",
        "EX07-02"
    ],
    [
        "chữ ghép",
        "chu ghep"
    ]
);

registerPracticeUnit(
    "PU-CHU-THUONG",
    "Bảng chữ cái thường",
    [
        "EX05-01",
        "EX05-03"
    ],
    [
        "bảng chữ cái thường",
        "chữ viết thường",
        "chu viet thuong"
    ]
);

registerPracticeUnit(
    "PU-CHU-HOA",
    "Bảng chữ cái in hoa",
    [
        "EX05-01",
        "EX05-03"
    ],
    [
        "bảng chữ cái in hoa",
        "chữ viết hoa",
        "chu viet hoa"
    ]
);


/* =========================================================
   CURRICULUM MAP

   source = HISTORICAL_SUBMISSION
   Đây chưa phải curriculum chính thức tuyệt đối.
========================================================= */

const CURRICULUM_MAP={

    3:{
        week:3,
        title:"Vô vi",
        practiceUnits:[],
        source:
            "HISTORICAL_SUBMISSION"
    },

    4:{
        week:4,
        title:"Bền bỉ",
        practiceUnits:[],
        source:
            "HISTORICAL_SUBMISSION"
    },

    5:{
        week:5,
        title:"Biển học vô bờ",
        practiceUnits:[],
        source:
            "HISTORICAL_SUBMISSION"
    },

    7:{
        week:7,
        title:"Ân sư vĩnh ký",
        practiceUnits:[],
        source:
            "HISTORICAL_SUBMISSION"
    },

    8:{
        week:8,
        title:"Độc lập tự do",
        practiceUnits:[],
        source:
            "HISTORICAL_SUBMISSION"
    },

    9:{
        week:9,
        title:"Chữ viết hoa",
        practiceUnits:[
            "PU-CHU-HOA"
        ],
        source:
            "HISTORICAL_SUBMISSION"
    },

    10:{
        week:10,
        title:"Chữ viết thường",
        practiceUnits:[
            "PU-CHU-THUONG"
        ],
        source:
            "HISTORICAL_SUBMISSION"
    },

    11:{
        week:11,
        title:"Phật",
        practiceUnits:[],
        source:
            "HISTORICAL_SUBMISSION"
    },

    12:{
        week:12,
        title:"Căn bản",
        practiceUnits:[],
        source:
            "HISTORICAL_SUBMISSION"
    },

    15:{
        week:15,
        title:
            "Nét chấm / Vạn sự thuận lợi",

        practiceUnits:[
            "PU-NET-CHAM"
        ],

        source:
            "HISTORICAL_SUBMISSION"
    },

    17:{
        week:17,
        title:
            "Nét móc – hất / Vạn sự như ý",

        practiceUnits:[
            "PU-NET-MOC",
            "PU-NET-HAT"
        ],

        source:
            "HISTORICAL_SUBMISSION"
    },

    19:{
        week:19,
        title:
            "Nét lượn / Ôn hoà nhẫn nại",

        practiceUnits:[
            "PU-NET-LUON"
        ],

        source:
            "HISTORICAL_SUBMISSION"
    }
};


/* =========================================================
   PRACTICE UNIT RESOLVER
========================================================= */

function resolvePracticeUnits(text){

    const normalized=
        normalizeText(text);


    const result=[];


    Object.values(
        PRACTICE_UNIT_REGISTRY
    )
    .forEach(
        function(unit){

            const matched=
                unit.aliases.some(
                    function(alias){

                        const wanted=
                            normalizeText(alias);


                        return(
                            wanted &&
                            normalized.includes(
                                wanted
                            )
                        );
                    }
                );


            if(matched){

                result.push(unit);
            }
        }
    );


    return result;
}


/* =========================================================
   WEEK RESOLVER
========================================================= */

function resolveWeek(text){

    const normalized=
        normalizeText(text);


    const match=
        normalized.match(
            /\btuan\s*(\d{1,3})\b/
        );


    if(!match){

        return null;
    }


    const week=
        Number(
            match[1]
        );


    if(
        !Number.isFinite(week)
    ){

        return null;
    }


    return week;
}


/* =========================================================
   EXERCISE RESOLVER
========================================================= */

function resolveExercise(
    description
){

    const raw=
        String(
            description || ""
        )
        .trim();


    const normalized=
        normalizeText(raw);


    const emptyResult={

        rawDescription:
            raw,

        normalizedDescription:
            normalized,

        resolutionType:
            RESOLUTION_TYPE.UNKNOWN,

        confidence:
            CONFIDENCE.LOW,

        exerciseIds:[],

        exercises:[],

        practiceUnits:[],

        week:null,

        curriculum:null
    };


    if(!normalized){

        return emptyResult;
    }


    /* =====================================================
       EXACT ALIAS
    ===================================================== */

    if(
        ALIAS_INDEX.has(
            normalized
        )
    ){

        const ids=
            unique(
                ALIAS_INDEX.get(
                    normalized
                )
            );


        return Object.assign(
            {},
            emptyResult,
            {

                resolutionType:
                    ids.length === 1
                    ?
                    RESOLUTION_TYPE.EXACT
                    :
                    RESOLUTION_TYPE.COMPOSITE,

                confidence:
                    CONFIDENCE.VERY_HIGH,

                exerciseIds:
                    ids,

                exercises:
                    ids
                    .map(
                        function(id){

                            return(
                                EXERCISE_REGISTRY[id]
                                ||
                                null
                            );
                        }
                    )
                    .filter(Boolean)
            }
        );
    }


    /* =====================================================
       ALIAS CONTAINED
    ===================================================== */

    const aliasMatches=[];


    ALIAS_INDEX.forEach(
        function(
            exerciseIds,
            alias
        ){

            if(
                alias.length < 4
            ){

                return;
            }


            if(
                normalized.includes(
                    alias
                )
            ){

                exerciseIds
                .forEach(
                    function(id){

                        aliasMatches.push(
                            id
                        );
                    }
                );
            }
        }
    );


    const practiceUnits=
        resolvePracticeUnits(
            normalized
        );


    practiceUnits.forEach(
        function(unit){

            unit.exerciseIds
            .forEach(
                function(id){

                    aliasMatches.push(id);
                }
            );
        }
    );


    const week=
        resolveWeek(
            normalized
        );


    const curriculum=
        week &&
        CURRICULUM_MAP[week]
        ?
        CURRICULUM_MAP[week]
        :
        null;


    if(curriculum){

        curriculum.practiceUnits
        .forEach(
            function(unitId){

                const unit=
                    PRACTICE_UNIT_REGISTRY[
                        unitId
                    ];


                if(!unit){
                    return;
                }


                unit.exerciseIds
                .forEach(
                    function(id){

                        aliasMatches.push(id);
                    }
                );
            }
        );
    }


    const uniqueMatches=
        unique(
            aliasMatches
        );


    if(
        uniqueMatches.length
    ){

        let resolutionType=
            RESOLUTION_TYPE.ALIAS;


        let confidence=
            CONFIDENCE.HIGH;


        if(
            uniqueMatches.length > 1 ||
            practiceUnits.length > 1
        ){

            resolutionType=
                RESOLUTION_TYPE.COMPOSITE;
        }


        return Object.assign(
            {},
            emptyResult,
            {

                resolutionType,

                confidence,

                exerciseIds:
                    uniqueMatches,

                exercises:
                    uniqueMatches
                    .map(
                        function(id){

                            return(
                                EXERCISE_REGISTRY[id]
                                ||
                                null
                            );
                        }
                    )
                    .filter(Boolean),

                practiceUnits,

                week,

                curriculum
            }
        );
    }


    /* =====================================================
       CHỈ CÓ TUẦN
    ===================================================== */

    if(curriculum){

        const ids=[];


        curriculum.practiceUnits
        .forEach(
            function(unitId){

                const unit=
                    PRACTICE_UNIT_REGISTRY[
                        unitId
                    ];


                if(!unit){
                    return;
                }


                unit.exerciseIds
                .forEach(
                    function(id){

                        ids.push(id);
                    }
                );
            }
        );


        return Object.assign(
            {},
            emptyResult,
            {

                resolutionType:
                    RESOLUTION_TYPE.CURRICULUM,

                confidence:
                    CONFIDENCE.MEDIUM,

                exerciseIds:
                    unique(ids),

                exercises:
                    unique(ids)
                    .map(
                        function(id){

                            return(
                                EXERCISE_REGISTRY[id]
                                ||
                                null
                            );
                        }
                    )
                    .filter(Boolean),

                week,

                curriculum
            }
        );
    }


    return emptyResult;
}


/* =========================================================
   SCORE QUALITY
========================================================= */

function getScoreQuality(score){

    const value=
        parseScore(score);


    if(value === null){
        return null;
    }


    const rounded=
        clamp(
            Math.round(value),
            1,
            10
        );


    return SCORE_QUALITY[
        rounded
    ];
}


/* =========================================================
   GENERIC SCORE ASSESSMENT

   Đây chỉ là fallback.
   Không tạo Error Code.
========================================================= */

function getGenericScoreAssessment(
    score,
    exercise
){

    const value=
        parseScore(score);


    if(value === null){

        return "";
    }


    const name=
        exercise &&
        exercise.name
        ?
        exercise.name
        :
        "Kỹ năng";


    const descriptions={

        1:
            "chưa thể hiện được yêu cầu.",

        2:
            "mới ở giai đoạn khởi đầu.",

        3:
            "đã bắt đầu hình thành nhưng còn yếu.",

        4:
            "đã xuất hiện nhưng chưa ổn định.",

        5:
            "đã đạt mức cơ bản.",

        6:
            "đang phát triển khá rõ.",

        7:
            "đạt mức khá tốt.",

        8:
            "đạt mức tốt.",

        9:
            "đạt mức rất tốt và khá ổn định.",

        10:
            "thể hiện mức độ làm chủ rất cao ở lần thực hiện này."
    };


    return(
        name+
        " "+
        descriptions[
            clamp(
                Math.round(value),
                1,
                10
            )
        ]
    );
}


/* =========================================================
   CREATE EVIDENCE
========================================================= */

function createEvidence(input){

    input=
        input || {};


    const score=
        parseScore(
            input.score
        );


    return{

        evidenceId:
            String(
                input.evidenceId ||
                ""
            ),

        studentCode:
            normalizeCode(
                input.studentCode ||
                input.code
            ),

        timestamp:
            String(
                input.timestamp ||
                ""
            ),

        originalIndex:
            Number(
                input.originalIndex ||
                0
            ),

        exerciseId:
            String(
                input.exerciseId ||
                ""
            ),

        knowledgeId:
            String(
                input.knowledgeId ||
                ""
            ),

        score,

        quality:
            getScoreQuality(
                score
            ),

        teacherComment:
            String(
                input.teacherComment ||
                ""
            )
            .trim(),

        inferredAssessment:
            String(
                input.inferredAssessment ||
                ""
            )
            .trim(),

        assessmentSource:
            input.assessmentSource ||
            (
                input.teacherComment
                ?
                "TEACHER"
                :
                "SCORE_RUBRIC"
            ),

        errors:
            Array.isArray(
                input.errors
            )
            ?
            input.errors.slice()
            :
            [],

        evidenceRole:
            input.evidenceRole ||
            EVIDENCE_ROLE.PRIMARY,

        resolutionType:
            input.resolutionType ||
            RESOLUTION_TYPE.UNKNOWN,

        resolverConfidence:
            input.resolverConfidence ||
            CONFIDENCE.LOW,

        source:
            input.source ||
            "UNKNOWN",

        historical:
            Boolean(
                input.historical
            ),

        qualified:
            input.qualified !== false
    };
}


/* =========================================================
   SUBMISSION → KNOWLEDGE EVIDENCE
========================================================= */

function buildEvidenceFromSubmission(
    submission
){

    submission=
        submission || {};


    const resolution=
        resolveExercise(
            submission.description ||
            submission.exerciseName ||
            ""
        );


    const evidence=[];


    resolution.exercises
    .forEach(
        function(exercise){

            exercise.primaryKnowledge
            .forEach(
                function(knowledgeId){

                    evidence.push(
                        createEvidence({

                            evidenceId:
                                (
                                    submission.id ||
                                    submission.submissionId ||
                                    submission.originalIndex ||
                                    ""
                                )
                                +
                                ":"
                                +
                                exercise.id
                                +
                                ":"
                                +
                                knowledgeId,

                            studentCode:
                                submission.studentCode ||
                                submission.code,

                            timestamp:
                                submission.timestamp,

                            originalIndex:
                                submission.originalIndex,

                            exerciseId:
                                exercise.id,

                            knowledgeId,

                            score:
                                submission.score,

                            teacherComment:
                                submission.teacherComment ||
                                submission.comment,

                            inferredAssessment:
                                getGenericScoreAssessment(
                                    submission.score,
                                    exercise
                                ),

                            assessmentSource:
                                submission.teacherComment ||
                                submission.comment
                                ?
                                "TEACHER"
                                :
                                "SCORE_RUBRIC",

                            errors:
                                submission.errors ||
                                [],

                            evidenceRole:
                                EVIDENCE_ROLE.PRIMARY,

                            resolutionType:
                                resolution.resolutionType,

                            resolverConfidence:
                                resolution.confidence,

                            source:
                                submission.source ||
                                "NopBaiLuyenTap"
                        })
                    );
                }
            );


            exercise.secondaryKnowledge
            .forEach(
                function(knowledgeId){

                    evidence.push(
                        createEvidence({

                            evidenceId:
                                (
                                    submission.id ||
                                    submission.submissionId ||
                                    submission.originalIndex ||
                                    ""
                                )
                                +
                                ":"
                                +
                                exercise.id
                                +
                                ":"
                                +
                                knowledgeId
                                +
                                ":S",

                            studentCode:
                                submission.studentCode ||
                                submission.code,

                            timestamp:
                                submission.timestamp,

                            originalIndex:
                                submission.originalIndex,

                            exerciseId:
                                exercise.id,

                            knowledgeId,

                            score:
                                submission.score,

                            teacherComment:
                                submission.teacherComment ||
                                submission.comment,

                            inferredAssessment:
                                getGenericScoreAssessment(
                                    submission.score,
                                    exercise
                                ),

                            assessmentSource:
                                submission.teacherComment ||
                                submission.comment
                                ?
                                "TEACHER"
                                :
                                "SCORE_RUBRIC",

                            errors:
                                submission.errors ||
                                [],

                            evidenceRole:
                                EVIDENCE_ROLE.SECONDARY,

                            resolutionType:
                                resolution.resolutionType,

                            resolverConfidence:
                                resolution.confidence,

                            source:
                                submission.source ||
                                "NopBaiLuyenTap"
                        })
                    );
                }
            );
        }
    );


    return{

        submission,

        resolution,

        evidence
    };
}


/* =========================================================
   QUALIFIED EVIDENCE
========================================================= */

function isQualifiedEvidence(
    evidence
){

    if(
        !evidence ||
        evidence.qualified === false
    ){

        return false;
    }


    if(
        parseScore(
            evidence.score
        )
        ===
        null
    ){

        return false;
    }


    if(
        evidence.resolutionType ===
        RESOLUTION_TYPE.UNKNOWN
    ){

        return false;
    }


    return true;
}


/* =========================================================
   WEIGHTED QUALITY
========================================================= */

function calculateWeightedQuality(
    evidenceList
){

    const ordered=
        (evidenceList || [])
        .filter(
            isQualifiedEvidence
        )
        .slice()
        .sort(
            compareEvidenceOldestFirst
        )
        .reverse()
        .slice(
            0,
            CONFIG.maxRecentEvidence
        );


    let numerator=0;
    let denominator=0;


    ordered.forEach(
        function(
            evidence,
            index
        ){

            const recency=
                CONFIG.recencyWeights[
                    index
                ]
                ||
                0.40;


            const roleWeight=
                CONFIG.evidenceWeights[
                    evidence.evidenceRole
                ]
                ||
                0.25;


            const weight=
                recency *
                roleWeight;


            numerator +=
                Number(
                    evidence.score
                )
                *
                weight;


            denominator +=
                weight;
        }
    );


    if(
        denominator <= 0
    ){

        return 0;
    }


    return(
        Math.round(
            (
                numerator /
                denominator
            )
            *
            100
        )
        /
        100
    );
}


/* =========================================================
   TREND ENGINE
========================================================= */

function calculateTrend(
    evidenceList
){

    const scores=
        (evidenceList || [])
        .filter(
            isQualifiedEvidence
        )
        .slice()
        .sort(
            compareEvidenceOldestFirst
        )
        .slice(
            -CONFIG.maxRecentEvidence
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

        return TREND.UNKNOWN;
    }


    let increases=0;
    let decreases=0;


    for(
        let i=1;
        i<scores.length;
        i++
    ){

        const delta=
            scores[i]-
            scores[i-1];


        if(delta > 0){

            increases++;

        }else if(delta < 0){

            decreases++;
        }
    }


    const delta=
        scores[
            scores.length-1
        ]
        -
        scores[0];


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
        increases > decreases
    ){

        return TREND
        .STRONG_IMPROVEMENT;
    }


    if(
        delta >= 1 &&
        increases > decreases
    ){

        return TREND
        .IMPROVING;
    }


    if(
        delta <= -2 &&
        decreases > increases
    ){

        return TREND
        .DECLINING;
    }


    if(
        Math.abs(delta) <= 1 &&
        range <= 2
    ){

        return TREND
        .STABLE;
    }


    return TREND
    .FLUCTUATING;
}


/* =========================================================
   STABILITY ENGINE
========================================================= */

function calculateStability(
    evidenceList
){

    const scores=
        (evidenceList || [])
        .filter(
            isQualifiedEvidence
        )
        .slice()
        .sort(
            compareEvidenceOldestFirst
        )
        .slice(
            -CONFIG.maxRecentEvidence
        )
        .map(
            function(item){

                return Number(
                    item.score
                );
            }
        );


    const count=
        scores.length;


    if(
        count <= 1
    ){

        return STABILITY.LOW;
    }


    if(
        count === 2
    ){

        return STABILITY
        .DEVELOPING;
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
        count >= 5 &&
        range <= 1
    ){

        return STABILITY
        .VERY_HIGH;
    }


    if(
        count >= 4 &&
        range <= 2
    ){

        return STABILITY.HIGH;
    }


    if(
        count >= 3 &&
        range <= 3
    ){

        return STABILITY
        .MODERATE;
    }


    return STABILITY
    .DEVELOPING;
}


/* =========================================================
   CONFIDENCE ENGINE
========================================================= */

function calculateConfidence(
    evidenceList
){

    const valid=
        (evidenceList || [])
        .filter(
            isQualifiedEvidence
        );


    if(!valid.length){

        return CONFIDENCE.LOW;
    }


    let points=0;


    const primaryCount=
        valid.filter(
            function(item){

                return(
                    item.evidenceRole ===
                    EVIDENCE_ROLE.PRIMARY
                );
            }
        )
        .length;


    const teacherCount=
        valid.filter(
            function(item){

                return Boolean(
                    item.teacherComment
                );
            }
        )
        .length;


    const exactCount=
        valid.filter(
            function(item){

                return(
                    item.resolutionType ===
                    RESOLUTION_TYPE.EXACT
                    ||
                    item.resolutionType ===
                    RESOLUTION_TYPE.ALIAS
                );
            }
        )
        .length;


    points +=
        Math.min(
            valid.length,
            5
        );


    points +=
        Math.min(
            primaryCount,
            3
        );


    points +=
        Math.min(
            teacherCount,
            2
        );


    points +=
        Math.min(
            exactCount,
            3
        );


    if(points >= 11){

        return CONFIDENCE
        .VERY_HIGH;
    }


    if(points >= 7){

        return CONFIDENCE.HIGH;
    }


    if(points >= 4){

        return CONFIDENCE
        .MEDIUM;
    }


    return CONFIDENCE.LOW;
}


/* =========================================================
   ERROR HELPERS
========================================================= */

function normalizeErrorObject(
    error
){

    if(!error){
        return null;
    }


    if(
        typeof error ===
        "string"
    ){

        return{

            errorId:
                error,

            severity:
                ERROR_SEVERITY.MEDIUM,

            state:
                ERROR_STATE.NEW
        };
    }


    return{

        errorId:
            String(
                error.errorId ||
                error.id ||
                ""
            ),

        severity:
            error.severity ||
            ERROR_SEVERITY.MEDIUM,

        state:
            error.state ||
            ERROR_STATE.NEW,

        confidence:
            error.confidence ||
            CONFIDENCE.MEDIUM
    };
}


function collectActiveErrors(
    evidenceList
){

    const map=
        new Map();


    (evidenceList || [])
    .forEach(
        function(evidence){

            (
                evidence.errors ||
                []
            )
            .map(
                normalizeErrorObject
            )
            .filter(Boolean)
            .forEach(
                function(error){

                    if(!error.errorId){
                        return;
                    }


                    const existing=
                        map.get(
                            error.errorId
                        );


                    if(!existing){

                        map.set(
                            error.errorId,
                            Object.assign(
                                {
                                    occurrences:1
                                },
                                error
                            )
                        );

                        return;
                    }


                    existing.occurrences++;


                    if(
                        existing.occurrences >= 3
                    ){

                        existing.state=
                            ERROR_STATE
                            .PERSISTENT;

                    }else if(
                        existing.occurrences >= 2
                    ){

                        existing.state=
                            ERROR_STATE
                            .REPEATED;
                    }
                }
            );
        }
    );


    return Array.from(
        map.values()
    );
}


function hasBlockingError(
    errors
){

    return(
        errors || []
    )
    .some(
        function(error){

            return(
                error.severity ===
                ERROR_SEVERITY.BLOCKING
                &&
                error.state !==
                ERROR_STATE.RESOLVED
            );
        }
    );
}


function hasPersistentMajorError(
    errors
){

    return(
        errors || []
    )
    .some(
        function(error){

            return(
                (
                    error.severity ===
                    ERROR_SEVERITY.MAJOR
                    ||
                    error.severity ===
                    ERROR_SEVERITY.BLOCKING
                )
                &&
                (
                    error.state ===
                    ERROR_STATE.PERSISTENT
                    ||
                    error.state ===
                    ERROR_STATE.REPEATED
                )
            );
        }
    );
}


/* =========================================================
   PREREQUISITE ENGINE
========================================================= */

function evaluatePrerequisites(
    knowledgeId,
    stateMap
){

    const knowledge=
        KNOWLEDGE_REGISTRY[
            knowledgeId
        ];


    if(!knowledge){

        return{

            status:"UNKNOWN",

            required:[],

            missing:[]
        };
    }


    const required=
        knowledge.prerequisites
        ||
        [];


    if(!required.length){

        return{

            status:"PASS",

            required:[],

            missing:[]
        };
    }


    const missing=
        required.filter(
            function(id){

                const state=
                    stateMap &&
                    stateMap[id];


                if(!state){

                    return true;
                }


                const mastery=
                    state.highestMastery ||
                    state.currentMastery ||
                    MASTERY_STATE.AVAILABLE;


                return(
                    (
                        MASTERY_RANK[
                            mastery
                        ]
                        ||
                        0
                    )
                    <
                    MASTERY_RANK
                    .ACHIEVED
                );
            }
        );


    return{

        status:
            missing.length
            ?
            "BLOCKED"
            :
            "PASS",

        required,

        missing
    };
}


/* =========================================================
   MASTERY LIMIT FROM RESOLUTION
========================================================= */

function getResolutionMasteryLimit(
    evidenceList
){

    const valid=
        (evidenceList || [])
        .filter(
            isQualifiedEvidence
        );


    if(!valid.length){

        return MASTERY_STATE
        .AVAILABLE;
    }


    const hasStrong=
        valid.some(
            function(item){

                return(
                    item.resolutionType ===
                    RESOLUTION_TYPE.EXACT
                    ||
                    item.resolutionType ===
                    RESOLUTION_TYPE.ALIAS
                    ||
                    item.resolutionType ===
                    RESOLUTION_TYPE.COMPOSITE
                );
            }
        );


    if(hasStrong){

        return MASTERY_STATE
        .MASTERED;
    }


    const hasCurriculum=
        valid.some(
            function(item){

                return(
                    item.resolutionType ===
                    RESOLUTION_TYPE.CURRICULUM
                );
            }
        );


    if(hasCurriculum){

        return MASTERY_STATE
        .ACHIEVED;
    }


    const hasFuzzy=
        valid.some(
            function(item){

                return(
                    item.resolutionType ===
                    RESOLUTION_TYPE.FUZZY
                );
            }
        );


    if(hasFuzzy){

        return MASTERY_STATE
        .PRACTICING;
    }


    return MASTERY_STATE
    .AVAILABLE;
}


/* =========================================================
   APPLY MASTERY LIMIT
========================================================= */

function limitMastery(
    mastery,
    limit
){

    if(
        mastery ===
        MASTERY_STATE.REVIEW
    ){

        return mastery;
    }


    const masteryRank=
        MASTERY_RANK[
            mastery
        ]
        ||
        0;


    const limitRank=
        MASTERY_RANK[
            limit
        ]
        ||
        0;


    if(
        masteryRank <=
        limitRank
    ){

        return mastery;
    }


    const states=[

        MASTERY_STATE.LOCKED,

        MASTERY_STATE.AVAILABLE,

        MASTERY_STATE.LEARNING,

        MASTERY_STATE.PRACTICING,

        MASTERY_STATE.ACHIEVED,

        MASTERY_STATE.STABLE,

        MASTERY_STATE.MASTERED
    ];


    return(
        states.find(
            function(state){

                return(
                    MASTERY_RANK[
                        state
                    ]
                    ===
                    limitRank
                );
            }
        )
        ||
        limit
    );
}


/* =========================================================
   BASE MASTERY ENGINE
========================================================= */

function calculateBaseMastery(
    evidenceList,
    prerequisites
){

    const valid=
        (evidenceList || [])
        .filter(
            isQualifiedEvidence
        )
        .slice()
        .sort(
            compareEvidenceOldestFirst
        );


    if(!valid.length){

        if(
            prerequisites &&
            prerequisites.status ===
            "BLOCKED"
        ){

            return MASTERY_STATE
            .LOCKED;
        }


        return MASTERY_STATE
        .AVAILABLE;
    }


    const recent=
        valid.slice(-3);


    const latest=
        recent[
            recent.length-1
        ];


    const latestScore=
        Number(
            latest.score
        );


    const weightedQuality=
        calculateWeightedQuality(
            valid
        );


    const trend=
        calculateTrend(
            valid
        );


    const stability=
        calculateStability(
            valid
        );


    const activeErrors=
        collectActiveErrors(
            valid
        );


    const blockingError=
        hasBlockingError(
            activeErrors
        );


    const persistentMajor=
        hasPersistentMajorError(
            activeErrors
        );


    const primaryCount=
        valid.filter(
            function(item){

                return(
                    item.evidenceRole ===
                    EVIDENCE_ROLE.PRIMARY
                );
            }
        )
        .length;


    const recentAtLeast6=
        recent.filter(
            function(item){

                return(
                    Number(
                        item.score
                    )
                    >=
                    6
                );
            }
        )
        .length;


    const recentAll7=
        recent.length >= 3
        &&
        recent.every(
            function(item){

                return(
                    Number(
                        item.score
                    )
                    >=
                    7
                );
            }
        );


    const recentAll8=
        recent.length >= 3
        &&
        recent.every(
            function(item){

                return(
                    Number(
                        item.score
                    )
                    >=
                    8
                );
            }
        );


    /* =====================================================
       MASTERED
    ===================================================== */

    if(
        valid.length >= 5
        &&
        primaryCount >=
        CONFIG.minPrimaryForMastered
        &&
        recentAll8
        &&
        weightedQuality >= 8
        &&
        STABILITY_RANK[
            stability
        ]
        >=
        STABILITY_RANK.HIGH
        &&
        trend !==
        TREND.DECLINING
        &&
        !persistentMajor
        &&
        !blockingError
        &&
        (
            !prerequisites
            ||
            prerequisites.status ===
            "PASS"
        )
    ){

        return MASTERY_STATE
        .MASTERED;
    }


    /* =====================================================
       STABLE
    ===================================================== */

    if(
        valid.length >= 4
        &&
        recentAll7
        &&
        weightedQuality >= 7
        &&
        STABILITY_RANK[
            stability
        ]
        >=
        STABILITY_RANK.HIGH
        &&
        trend !==
        TREND.DECLINING
        &&
        !persistentMajor
        &&
        !blockingError
    ){

        return MASTERY_STATE
        .STABLE;
    }


    /* =====================================================
       ACHIEVED
    ===================================================== */

    if(
        valid.length >= 3
        &&
        recentAtLeast6 >= 2
        &&
        latestScore >= 6
        &&
        !blockingError
        &&
        (
            !prerequisites
            ||
            prerequisites.status ===
            "PASS"
        )
    ){

        return MASTERY_STATE
        .ACHIEVED;
    }


    /* =====================================================
       PRACTICING
    ===================================================== */

    if(
        latestScore >= 5
        ||
        valid.some(
            function(item){

                return(
                    Number(
                        item.score
                    )
                    >=
                    5
                );
            }
        )
    ){

        return MASTERY_STATE
        .PRACTICING;
    }


    return MASTERY_STATE
    .LEARNING;
}


/* =========================================================
   REVIEW ENGINE
========================================================= */

function shouldReview(
    evidenceList,
    highestMastery,
    activeErrors
){

    const rank=
        MASTERY_RANK[
            highestMastery
        ]
        ||
        0;


    if(
        rank <
        MASTERY_RANK
        .ACHIEVED
    ){

        return false;
    }


    const valid=
        (evidenceList || [])
        .filter(
            isQualifiedEvidence
        )
        .slice()
        .sort(
            compareEvidenceOldestFirst
        );


    if(!valid.length){

        return false;
    }


    const recent=
        valid.slice(-3);


    const latestScore=
        Number(
            recent[
                recent.length-1
            ].score
        );


    const lowCount=
        recent.filter(
            function(item){

                return(
                    Number(
                        item.score
                    )
                    <
                    6
                );
            }
        )
        .length;


    const trend=
        calculateTrend(
            valid
        );


    if(
        trend ===
        TREND.DECLINING
        &&
        latestScore < 6
    ){

        return true;
    }


    if(
        recent.length >= 3
        &&
        lowCount >= 2
    ){

        return true;
    }


    if(
        hasBlockingError(
            activeErrors
        )
    ){

        return true;
    }


    if(
        hasPersistentMajorError(
            activeErrors
        )
    ){

        return true;
    }


    return false;
}


/* =========================================================
   ACTION ENGINE
========================================================= */

function determineRecommendedAction(
    state
){

    if(
        state.prerequisites &&
        state.prerequisites.status ===
        "BLOCKED"
    ){

        return RECOMMENDED_ACTION
        .REPAIR_PREREQUISITE;
    }


    if(
        hasBlockingError(
            state.activeErrors
        )
        ||
        hasPersistentMajorError(
            state.activeErrors
        )
    ){

        return RECOMMENDED_ACTION
        .REPAIR_ERROR;
    }


    switch(
        state.currentMastery
    ){

        case MASTERY_STATE.LOCKED:

            return RECOMMENDED_ACTION
            .REPAIR_PREREQUISITE;


        case MASTERY_STATE.AVAILABLE:

            return RECOMMENDED_ACTION
            .START;


        case MASTERY_STATE.LEARNING:

            return RECOMMENDED_ACTION
            .PRACTICE;


        case MASTERY_STATE.PRACTICING:

            return RECOMMENDED_ACTION
            .CONTINUE;


        case MASTERY_STATE.ACHIEVED:

            return RECOMMENDED_ACTION
            .ADVANCE;


        case MASTERY_STATE.STABLE:

            return RECOMMENDED_ACTION
            .MAINTAIN;


        case MASTERY_STATE.MASTERED:

            return RECOMMENDED_ACTION
            .ADVANCE;


        case MASTERY_STATE.REVIEW:

            return RECOMMENDED_ACTION
            .REVIEW;


        default:

            return RECOMMENDED_ACTION
            .CONTINUE;
    }
}


/* =========================================================
   RECOMMENDED EXERCISE
========================================================= */

function findRecommendedExercise(
    knowledgeId
){

    const exercises=
        Object.values(
            EXERCISE_REGISTRY
        );


    const primary=
        exercises.find(
            function(exercise){

                return exercise
                .primaryKnowledge
                .includes(
                    knowledgeId
                );
            }
        );


    if(primary){

        return primary.id;
    }


    const secondary=
        exercises.find(
            function(exercise){

                return exercise
                .secondaryKnowledge
                .includes(
                    knowledgeId
                );
            }
        );


    return secondary
    ?
    secondary.id
    :
    null;
}


/* =========================================================
   CALCULATE KNOWLEDGE STATE
========================================================= */

function calculateKnowledgeState(
    studentCode,
    knowledgeId,
    evidenceList,
    stateMap,
    previousState
){

    const knowledge=
        KNOWLEDGE_REGISTRY[
            knowledgeId
        ];


    if(!knowledge){

        return null;
    }


    const evidence=
        (evidenceList || [])
        .filter(
            function(item){

                return(
                    item.knowledgeId ===
                    knowledgeId
                );
            }
        )
        .slice()
        .sort(
            compareEvidenceOldestFirst
        );


    const validEvidence=
        evidence.filter(
            isQualifiedEvidence
        );


    const prerequisites=
        evaluatePrerequisites(
            knowledgeId,
            stateMap
        );


    let currentMastery=
        calculateBaseMastery(
            validEvidence,
            prerequisites
        );


    const resolutionLimit=
        getResolutionMasteryLimit(
            validEvidence
        );


    currentMastery=
        limitMastery(
            currentMastery,
            resolutionLimit
        );


    const activeErrors=
        collectActiveErrors(
            validEvidence
        );


    const previousHighest=
        previousState &&
        previousState.highestMastery
        ?
        previousState.highestMastery
        :
        null;


    let highestMastery=
        currentMastery;


    if(
        previousHighest &&
        (
            MASTERY_RANK[
                previousHighest
            ]
            ||
            0
        )
        >
        (
            MASTERY_RANK[
                highestMastery
            ]
            ||
            0
        )
    ){

        highestMastery=
            previousHighest;
    }


    if(
        shouldReview(
            validEvidence,
            highestMastery,
            activeErrors
        )
    ){

        currentMastery=
            MASTERY_STATE.REVIEW;
    }


    const latest=
        validEvidence.length
        ?
        validEvidence[
            validEvidence.length-1
        ]
        :
        null;


    const primaryEvidenceCount=
        validEvidence.filter(
            function(item){

                return(
                    item.evidenceRole ===
                    EVIDENCE_ROLE.PRIMARY
                );
            }
        )
        .length;


    const state={

        studentCode:
            normalizeCode(
                studentCode
            ),

        knowledgeId,

        knowledgeName:
            knowledge.name,

        domain:
            knowledge.domain,

        currentMastery,

        highestMastery,

        currentQuality:
            calculateWeightedQuality(
                validEvidence
            ),

        qualityState:
            latest
            ?
            getScoreQuality(
                latest.score
            )
            :
            null,

        latestScore:
            latest
            ?
            Number(
                latest.score
            )
            :
            null,

        trend:
            calculateTrend(
                validEvidence
            ),

        stability:
            calculateStability(
                validEvidence
            ),

        confidence:
            calculateConfidence(
                validEvidence
            ),

        evidenceCount:
            validEvidence.length,

        primaryEvidenceCount,

        activeErrors,

        resolvedErrors:[],

        prerequisites,

        resolutionLimit,

        recommendedAction:null,

        recommendedExercise:
            findRecommendedExercise(
                knowledgeId
            ),

        evidence:
            validEvidence
    };


    state.recommendedAction=
        determineRecommendedAction(
            state
        );


    if(
        state.recommendedAction ===
        RECOMMENDED_ACTION
        .REPAIR_PREREQUISITE
        &&
        prerequisites.missing.length
    ){

        state.recommendedExercise=
            findRecommendedExercise(
                prerequisites.missing[0]
            );
    }


    return state;
}


/* =========================================================
   DEPENDENCY ORDER
========================================================= */

function getKnowledgeDependencyOrder(){

    const result=[];

    const visiting=
        new Set();

    const visited=
        new Set();


    function visit(id){

        if(
            visited.has(id)
        ){

            return;
        }


        if(
            visiting.has(id)
        ){

            return;
        }


        visiting.add(id);


        const knowledge=
            KNOWLEDGE_REGISTRY[id];


        if(knowledge){

            (
                knowledge.prerequisites ||
                []
            )
            .forEach(
                visit
            );
        }


        visiting.delete(id);

        visited.add(id);

        result.push(id);
    }


    Object.keys(
        KNOWLEDGE_REGISTRY
    )
    .forEach(
        visit
    );


    return result;
}


/* =========================================================
   STUDENT STATE
========================================================= */

function calculateStudentState(
    studentCode,
    evidenceList,
    previousState
){

    const code=
        normalizeCode(
            studentCode
        );


    const studentEvidence=
        (evidenceList || [])
        .filter(
            function(item){

                return(
                    normalizeCode(
                        item.studentCode
                    )
                    ===
                    code
                );
            }
        );


    const stateMap={};


    const previousMap=
        previousState &&
        previousState.knowledge
        ?
        previousState.knowledge
        :
        {};


    getKnowledgeDependencyOrder()
    .forEach(
        function(knowledgeId){

            stateMap[
                knowledgeId
            ]=
                calculateKnowledgeState(

                    code,

                    knowledgeId,

                    studentEvidence,

                    stateMap,

                    previousMap[
                        knowledgeId
                    ]
                );
        }
    );


    const states=
        Object.values(
            stateMap
        );


    const weakNodes=
        states
        .filter(
            function(state){

                return[

                    MASTERY_STATE.LEARNING,

                    MASTERY_STATE.PRACTICING,

                    MASTERY_STATE.REVIEW

                ]
                .includes(
                    state.currentMastery
                );
            }
        )
        .sort(
            function(a,b){

                return(
                    a.currentQuality -
                    b.currentQuality
                );
            }
        );


    const strongNodes=
        states
        .filter(
            function(state){

                return[

                    MASTERY_STATE.STABLE,

                    MASTERY_STATE.MASTERED

                ]
                .includes(
                    state.currentMastery
                );
            }
        )
        .sort(
            function(a,b){

                return(
                    b.currentQuality -
                    a.currentQuality
                );
            }
        );


    return{

        studentCode:
            code,

        generatedAt:
            new Date()
            .toISOString(),

        knowledge:
            stateMap,

        weakNodes,

        strongNodes,

        activeErrors:
            states
            .flatMap(
                function(state){

                    return state
                        .activeErrors
                        .map(
                            function(error){

                                return Object.assign(
                                    {
                                        knowledgeId:
                                            state.knowledgeId
                                    },
                                    error
                                );
                            }
                        );
                }
            ),

        evidenceCount:
            studentEvidence.length
    };
}


/* =========================================================
   BUILD EVIDENCE FROM SUBMISSIONS
========================================================= */

function buildEvidenceList(
    submissions
){

    const result=[];

    const resolutions=[];


    (
        submissions ||
        []
    )
    .forEach(
        function(
            submission,
            index
        ){

            const normalizedSubmission=
                Object.assign(
                    {
                        originalIndex:
                            index+1
                    },
                    submission
                );


            const resolved=
                buildEvidenceFromSubmission(
                    normalizedSubmission
                );


            resolutions.push(
                resolved
            );


            resolved.evidence
            .forEach(
                function(item){

                    result.push(item);
                }
            );
        }
    );


    return{

        evidence:
            result,

        resolutions
    };
}


/* =========================================================
   EXPLAIN
========================================================= */

function explainKnowledgeState(
    state
){

    if(!state){

        return null;
    }


    const reasons=[];


    reasons.push(
        "Có "+
        state.evidenceCount+
        " bằng chứng hợp lệ."
    );


    if(
        state.primaryEvidenceCount
    ){

        reasons.push(
            "Có "+
            state.primaryEvidenceCount+
            " bằng chứng trực tiếp."
        );
    }


    if(
        state.latestScore !== null
    ){

        reasons.push(
            "Điểm gần nhất: "+
            state.latestScore+
            "."
        );
    }


    if(
        state.currentQuality
    ){

        reasons.push(
            "Chất lượng có trọng số: "+
            state.currentQuality+
            "."
        );
    }


    reasons.push(
        "Xu hướng: "+
        state.trend+
        "."
    );


    reasons.push(
        "Độ ổn định: "+
        state.stability+
        "."
    );


    reasons.push(
        "Độ tin cậy: "+
        state.confidence+
        "."
    );


    if(
        state.activeErrors.length
    ){

        reasons.push(
            "Có "+
            state.activeErrors.length+
            " lỗi đang được theo dõi."
        );
    }


    if(
        state.prerequisites.status ===
        "BLOCKED"
    ){

        reasons.push(
            "Chưa đạt kiến thức tiên quyết: "+
            state.prerequisites
            .missing
            .join(", ")+
            "."
        );
    }


    return{

        knowledgeId:
            state.knowledgeId,

        knowledgeName:
            state.knowledgeName,

        currentMastery:
            state.currentMastery,

        highestMastery:
            state.highestMastery,

        recommendedAction:
            state.recommendedAction,

        recommendedExercise:
            state.recommendedExercise,

        reasons
    };
}


/* =========================================================
   EVENT ENGINE
========================================================= */

function compareStatesForEvents(
    previousState,
    currentState
){

    const events=[];


    if(
        !currentState
    ){

        return events;
    }


    const oldMastery=
        previousState
        ?
        previousState.currentMastery
        :
        null;


    const newMastery=
        currentState.currentMastery;


    if(
        oldMastery !==
        newMastery
    ){

        const map={

            AVAILABLE:
                "KNOWLEDGE_AVAILABLE",

            LEARNING:
                "KNOWLEDGE_STARTED",

            ACHIEVED:
                "KNOWLEDGE_ACHIEVED",

            STABLE:
                "KNOWLEDGE_STABLE",

            MASTERED:
                "KNOWLEDGE_MASTERED",

            REVIEW:
                "REVIEW_REQUIRED"
        };


        if(map[newMastery]){

            events.push({

                type:
                    map[newMastery],

                studentCode:
                    currentState
                    .studentCode,

                knowledgeId:
                    currentState
                    .knowledgeId,

                previousMastery:
                    oldMastery,

                currentMastery:
                    newMastery
            });
        }
    }


    if(
        previousState &&
        previousState.trend !==
        currentState.trend
    ){

        if(
            currentState.trend ===
            TREND.IMPROVING
            ||
            currentState.trend ===
            TREND.STRONG_IMPROVEMENT
        ){

            events.push({

                type:
                    "TREND_IMPROVING",

                studentCode:
                    currentState.studentCode,

                knowledgeId:
                    currentState.knowledgeId
            });
        }


        if(
            currentState.trend ===
            TREND.DECLINING
        ){

            events.push({

                type:
                    "TREND_DECLINING",

                studentCode:
                    currentState.studentCode,

                knowledgeId:
                    currentState.knowledgeId
            });
        }
    }


    return events;
}


/* =========================================================
   IN-MEMORY STUDENT STORE

   Chỉ cache trạng thái.
   KHÔNG phải nguồn dữ liệu vĩnh viễn.
========================================================= */

const STUDENT_STATE_CACHE=
    new Map();


/* =========================================================
   ANALYZE STUDENT
========================================================= */

function analyzeStudent(
    studentCode,
    submissions
){

    const code=
        normalizeCode(
            studentCode
        );


    const built=
        buildEvidenceList(
            submissions
        );


    const previous=
        STUDENT_STATE_CACHE.get(
            code
        )
        ||
        null;


    const state=
        calculateStudentState(
            code,
            built.evidence,
            previous
        );


    const events=[];


    Object.keys(
        state.knowledge
    )
    .forEach(
        function(knowledgeId){

            const oldState=
                previous &&
                previous.knowledge
                ?
                previous.knowledge[
                    knowledgeId
                ]
                :
                null;


            compareStatesForEvents(
                oldState,
                state.knowledge[
                    knowledgeId
                ]
            )
            .forEach(
                function(event){

                    events.push(event);
                }
            );
        }
    );


    state.events=
        events;


    state.resolutions=
        built.resolutions;


    STUDENT_STATE_CACHE.set(
        code,
        state
    );


    try{

        window.dispatchEvent(
            new CustomEvent(
                "ocdKnowledgeStateChanged",
                {
                    detail:{
                        studentCode:
                            code,

                        state,

                        events
                    }
                }
            )
        );

    }catch(error){}


    return state;
}


/* =========================================================
   GETTERS
========================================================= */

function getStudentState(code){

    return(
        STUDENT_STATE_CACHE.get(
            normalizeCode(code)
        )
        ||
        null
    );
}


function getKnowledgeState(
    code,
    knowledgeId
){

    const state=
        getStudentState(
            code
        );


    return(
        state &&
        state.knowledge[
            knowledgeId
        ]
    )
    ||
    null;
}


function getMastery(
    code,
    knowledgeId
){

    const state=
        getKnowledgeState(
            code,
            knowledgeId
        );


    return state
    ?
    state.currentMastery
    :
    null;
}


function getWeakNodes(code){

    const state=
        getStudentState(code);


    return state
    ?
    state.weakNodes.slice()
    :
    [];
}


function getStrongNodes(code){

    const state=
        getStudentState(code);


    return state
    ?
    state.strongNodes.slice()
    :
    [];
}


function getActiveErrors(code){

    const state=
        getStudentState(code);


    return state
    ?
    state.activeErrors.slice()
    :
    [];
}


function getEvents(code){

    const state=
        getStudentState(code);


    return state
    ?
    (
        state.events ||
        []
    )
    .slice()
    :
    [];
}


function getRecommendedExercise(code){

    const weak=
        getWeakNodes(code);


    if(!weak.length){

        return null;
    }


    return weak[0]
        .recommendedExercise;
}


function getProgress(code){

    const state=
        getStudentState(code);


    if(!state){

        return null;
    }


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


    Object.values(
        state.knowledge
    )
    .forEach(
        function(item){

            if(
                counts[
                    item.currentMastery
                ]
                !==
                undefined
            ){

                counts[
                    item.currentMastery
                ]++;
            }
        }
    );


    return{

        studentCode:
            state.studentCode,

        totalKnowledge:
            Object.keys(
                state.knowledge
            )
            .length,

        counts,

        achievedOrHigher:
            counts.ACHIEVED+
            counts.STABLE+
            counts.MASTERED,

        stableOrHigher:
            counts.STABLE+
            counts.MASTERED,

        mastered:
            counts.MASTERED,

        review:
            counts.REVIEW
    };
}


/* =========================================================
   ADVICE DATA

   Đây là dữ liệu máy đọc.
   Minh Hồng UI sẽ chuyển thành câu tự nhiên sau.
========================================================= */

function getAdvice(code){

    const state=
        getStudentState(code);


    if(!state){

        return null;
    }


    const weak=
        state.weakNodes[0]
        ||
        null;


    if(!weak){

        return{

            type:"MAINTAIN",

            knowledgeId:null,

            message:
                "Chưa phát hiện kỹ năng yếu nổi bật trong dữ liệu hiện có."
        };
    }


    if(
        weak.recommendedAction ===
        RECOMMENDED_ACTION
        .REPAIR_PREREQUISITE
    ){

        return{

            type:
                "REPAIR_PREREQUISITE",

            knowledgeId:
                weak.knowledgeId,

            prerequisiteIds:
                weak.prerequisites
                .missing
                .slice(),

            recommendedExercise:
                weak.recommendedExercise,

            confidence:
                weak.confidence
        };
    }


    if(
        weak.recommendedAction ===
        RECOMMENDED_ACTION
        .REPAIR_ERROR
    ){

        return{

            type:
                "REPAIR_ERROR",

            knowledgeId:
                weak.knowledgeId,

            errors:
                weak.activeErrors
                .slice(),

            recommendedExercise:
                weak.recommendedExercise,

            confidence:
                weak.confidence
        };
    }


    return{

        type:
            weak.recommendedAction,

        knowledgeId:
            weak.knowledgeId,

        mastery:
            weak.currentMastery,

        trend:
            weak.trend,

        recommendedExercise:
            weak.recommendedExercise,

        confidence:
            weak.confidence
    };
}


/* =========================================================
   DEBUG
========================================================= */

function debug(){

    const result={

        version:
            VERSION,

        knowledgeCount:
            Object.keys(
                KNOWLEDGE_REGISTRY
            )
            .length,

        exerciseCount:
            Object.keys(
                EXERCISE_REGISTRY
            )
            .length,

        practiceUnitCount:
            Object.keys(
                PRACTICE_UNIT_REGISTRY
            )
            .length,

        studentCacheSize:
            STUDENT_STATE_CACHE.size
    };


    console.log(
        "[OCD Knowledge Core]",
        result
    );


    return result;
}


/* =========================================================
   SELF TEST
========================================================= */

function selfTest(){

    const errors=[];


    const knowledgeCount=
        Object.keys(
            KNOWLEDGE_REGISTRY
        )
        .length;


    const exerciseCount=
        Object.keys(
            EXERCISE_REGISTRY
        )
        .length;


    if(
        knowledgeCount !== 45
    ){

        errors.push(
            "Knowledge Registry phải có 45 node, hiện có "+
            knowledgeCount+
            "."
        );
    }


    if(
        exerciseCount !== 37
    ){

        errors.push(
            "Exercise Registry phải có 37 bài, hiện có "+
            exerciseCount+
            "."
        );
    }


    Object.values(
        KNOWLEDGE_REGISTRY
    )
    .forEach(
        function(knowledge){

            knowledge.prerequisites
            .forEach(
                function(id){

                    if(
                        !KNOWLEDGE_REGISTRY[id]
                    ){

                        errors.push(
                            knowledge.id+
                            " có prerequisite không tồn tại: "+
                            id
                        );
                    }
                }
            );
        }
    );


    Object.values(
        EXERCISE_REGISTRY
    )
    .forEach(
        function(exercise){

            exercise
            .primaryKnowledge
            .concat(
                exercise
                .secondaryKnowledge
            )
            .forEach(
                function(id){

                    if(
                        !KNOWLEDGE_REGISTRY[id]
                    ){

                        errors.push(
                            exercise.id+
                            " tham chiếu Knowledge không tồn tại: "+
                            id
                        );
                    }
                }
            );
        }
    );


    const result={

        ok:
            errors.length === 0,

        version:
            VERSION,

        knowledgeCount,

        exerciseCount,

        errors
    };


    if(result.ok){

        console.log(
            "[OCD Knowledge Core] SELF TEST PASS",
            result
        );

    }else{

        console.error(
            "[OCD Knowledge Core] SELF TEST FAILED",
            result
        );
    }


    return result;
}


/* =========================================================
   PUBLIC API
========================================================= */

window.OCDKnowledgeSystem={

    version:
        VERSION,

    CONFIG,

    MASTERY_STATE,

    MASTERY_RANK,

    SCORE_QUALITY,

    TREND,

    STABILITY,

    STABILITY_RANK,

    CONFIDENCE,

    RESOLUTION_TYPE,

    EVIDENCE_ROLE,

    ERROR_STATE,

    ERROR_SEVERITY,

    RECOMMENDED_ACTION,


    /* REGISTRY */

    KNOWLEDGE_REGISTRY,

    EXERCISE_REGISTRY,

    PRACTICE_UNIT_REGISTRY,

    CURRICULUM_MAP,


    /* BASIC */

    normalizeText,

    normalizeCode,

    parseScore,

    parseDate,

    getScoreQuality,


    /* RESOLVER */

    resolveWeek,

    resolvePracticeUnits,

    resolveExercise,

    rebuildAliasIndex,


    /* EVIDENCE */

    createEvidence,

    buildEvidenceFromSubmission,

    buildEvidenceList,

    isQualifiedEvidence,


    /* ENGINE */

    calculateWeightedQuality,

    calculateTrend,

    calculateStability,

    calculateConfidence,

    collectActiveErrors,

    evaluatePrerequisites,

    calculateKnowledgeState,

    calculateStudentState,

    analyzeStudent,


    /* GETTERS */

    getStudentState,

    getKnowledgeState,

    getMastery,

    getWeakNodes,

    getStrongNodes,

    getActiveErrors,

    getProgress,

    getRecommendedExercise,

    getAdvice,

    getEvents,

    explain:
        function(
            code,
            knowledgeId
        ){

            return explainKnowledgeState(
                getKnowledgeState(
                    code,
                    knowledgeId
                )
            );
        },


    /* REGISTRATION */

    registerKnowledge,

    registerExercise,

    registerPracticeUnit,


    /* DEBUG */

    debug,

    selfTest
};


/* =========================================================
   SELF CHECK
========================================================= */

const testResult=
    selfTest();


/* =========================================================
   READY
========================================================= */

console.log(
    "[OCD Knowledge Core] v"+
    VERSION+
    " đã sẵn sàng."
);


try{

    window.dispatchEvent(
        new CustomEvent(
            "ocdKnowledgeCoreReady",
            {
                detail:{

                    version:
                        VERSION,

                    knowledgeCount:
                        Object.keys(
                            KNOWLEDGE_REGISTRY
                        )
                        .length,

                    exerciseCount:
                        Object.keys(
                            EXERCISE_REGISTRY
                        )
                        .length,

                    selfTest:
                        testResult.ok
                }
            }
        )
    );

}catch(error){}


})();
