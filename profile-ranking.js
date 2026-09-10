(function(){

"use strict";


/* =========================================================
   PROFILE RANKING v4.7
   FULL DELETE SYNC
   REWARD CORE v3.6.0+

   NGUYÊN TẮC TÍNH TOÀN HỆ THỐNG
   ---------------------------------------------------------
   BƯỚC 1:
   - Đọc toàn bộ bài nộp.

   BƯỚC 2:
   - Đọc tab XoaBai.
   - XÓA       => loại bài.
   - KHÔI PHỤC => đưa bài trở lại.

   BƯỚC 3:
   - Chỉ giữ BÀI HỢP LỆ.

   BƯỚC 4:
   - Tính lại toàn bộ chỉ số từ bài hợp lệ.

   RANK TỔNG:
   ---------------------------------------------------------
   Rank =
   số bài hợp lệ
   +
   tổng điểm các bài hợp lệ đã chấm

   Ví dụ:
   10 bài + tổng điểm 78
   => 88 Rank.

   Nếu xoá 1 bài 9 điểm:
   9 bài + tổng điểm 69
   => 78 Rank.

   CÁC CHỈ SỐ ĐƯỢC ĐỒNG BỘ XOABAI:
   ---------------------------------------------------------
   - Rank tổng cá nhân.
   - Rank tổng tổ.
   - Tổng Rank toàn hệ thống.
   - Tổng lượt nộp.
   - Điểm trung bình.
   - Top bền bỉ.
   - Top năng nổ.
   - Reward streak.
   - Reward high score.
   - Linh thạch học tập.
   - Top phú hào.
   - Tài sản tính lại bởi Core.
   - Mục tiêu 100 bài.

   SHEET XepHang:
   ---------------------------------------------------------
   Chỉ còn dùng để lấy:
   - Tên học viên.
   - Mã học viên.
   - Tổ.
   - Khóa.

   Cột điểm / Rank trong XepHang
   KHÔNG còn quyết định thứ hạng.
========================================================= */


/* =========================================================
   WAIT REWARD CORE
========================================================= */

let rankingStarted=false;
let coreWaitCount=0;

const CORE_MAX_WAIT=200;


function startRankingWhenCoreReady(){

    if(rankingStarted){
        return true;
    }


    const RS=
        window.StudentRewardSystem;


    if(
        !RS ||
        !RS.version ||
        typeof RS.loadSharedRewardData !== "function" ||
        typeof RS.calculateStudentRewardData !== "function" ||
        typeof RS.processTransactions !== "function" ||
        typeof RS.getProfileAvatar !== "function" ||
        typeof RS.getProfileAvatarFrame !== "function" ||
        typeof RS.getProfileBackground !== "function" ||
        typeof RS.hasMultitaskPotion !== "function" ||
        typeof RS.getGemValueInHong !== "function"
    ){

        return false;
    }


    rankingStarted=true;


    console.log(
        "[Ranking v4.5] Reward Core:",
        RS.version
    );


    startRankingApp(
        RS
    );


    return true;
}


window.addEventListener(
    "studentRewardCoreReady",
    startRankingWhenCoreReady
);


if(
    !startRankingWhenCoreReady()
){

    const coreTimer=
        setInterval(
            function(){

                coreWaitCount++;


                if(
                    startRankingWhenCoreReady()
                ){

                    clearInterval(
                        coreTimer
                    );

                    return;
                }


                if(
                    coreWaitCount >=
                    CORE_MAX_WAIT
                ){

                    clearInterval(
                        coreTimer
                    );


                    const content=
                        document.getElementById(
                            "rankingContent"
                        );


                    if(content){

                        content.innerHTML=

                            '<div class="ranking-error">' +

                            'Không tìm thấy Reward System Core v3.6.0 hoặc mới hơn.' +

                            '</div>';
                    }
                }

            },
            50
        );
}


/* =========================================================
   APP
========================================================= */

function startRankingApp(RS){


/* =========================================================
   CONFIG
========================================================= */

const ADMIN_CONFIG=
    Object.assign(
        {

            enabled:false,

            code:"ADMIN",

            name:"Admin Test",

            group:"ADMIN",

            course:"TEST",

            rankingPoints:999999,

            submissions:0,

            baseGems:{
                hoangNgoc:0,
                haiLamNgoc:0,
                thachAnhTim:0,
                lamBaoThach:0,
                lucThach:0,
                hongNgoc:1000
            }

        },

        window.RANKING_ADMIN_CONFIG ||
        {}
    );


/*
   XepHang:
   từ v4.5 chỉ dùng danh sách học viên,
   mã, tổ, khóa.
*/
const RANKING_CSV_URL=
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRP5cc8duj1XrCXMrymo6Cj7aqIkWfX6bHxGeW-lXcSewfQXhM8fZ5rzbNIQ9mBeVuB8yYr_o1aBoYA/pub?gid=1326884435&single=true&output=csv";


/*
   Dữ liệu bài nộp chuẩn của Reward Core.
*/
const SUBMISSION_CSV_URL=
    RS.CONFIG.studentCsv;


/*
   Cùng tab XoaBai với trang chấm bài V18.4D.
*/
const DELETE_LOG_CSV_URL=
    "https://docs.google.com/spreadsheets/d/" +
    "1GJoTRsbq0kZfZrDdh0uCC667PwS3Bgkje2fHQnwnCKs" +
    "/export?format=csv&gid=521976322";


const ITEMS_PER_PAGE=50;


/* =========================================================
   UI
========================================================= */

const UI={

    medal1:
        String.fromCodePoint(0x1F947),

    medal2:
        String.fromCodePoint(0x1F948),

    medal3:
        String.fromCodePoint(0x1F949),

    star:
        String.fromCodePoint(0x2B50),

    user:
        String.fromCodePoint(0x1F464),

    box:
        String.fromCodePoint(0x1F4E6),

    gem:
        String.fromCodePoint(0x1F48E),

    people:
        String.fromCodePoint(0x1F465),

    chart:
        String.fromCodePoint(0x1F4CA),

    trophy:
        String.fromCodePoint(0x1F3C6),

    fire:
        String.fromCodePoint(0x1F525),

    lightning:
        String.fromCodePoint(0x26A1),

    target:
        String.fromCodePoint(0x1F3AF),

    money:
        String.fromCodePoint(0x1F4B0),

    book:
        String.fromCodePoint(0x1F4D8),

    left:
        String.fromCodePoint(0x2039),

    right:
        String.fromCodePoint(0x203A),

    ellipsis:
        String.fromCodePoint(0x2026)

};


/* =========================================================
   GEM TYPES
========================================================= */

const GEM_TYPES=
    RS.GEM_ORDER.map(
        function(key){

            return{

                key:key,

                name:
                    RS.GEM_TYPES[key]
                    .displayName,

                icon:
                    RS.GEM_TYPES[key]
                    .image

            };

        }
    );


/* =========================================================
   LEVEL
========================================================= */

const LEVELS=[

    {min:0,max:100,name:"Tân thủ nhập môn"},

    {min:100,max:300,name:"Cầm bút chắc chắn"},

    {min:300,max:700,name:"Biết cách lấy mực"},

    {min:700,max:1500,name:"Lộ phong đều đặn"},

    {min:1500,max:3000,name:"Trung phong sắc nét"},

    {min:3000,max:5000,name:"Nhãn lực nâng cao"},

    {min:5000,max:8000,name:"Chương pháp ổn định"},

    {min:8000,max:12000,name:"Cao thủ"},

    {min:12000,max:20000,name:"Thoát tục tự nhiên"},

    {min:20000,max:Infinity,name:"Thư gia tố chất"}

];


/* =========================================================
   STATE
========================================================= */

let students=[];

let filteredStudents=[];

let currentPage=1;

let selectedGroup="";
let selectedCourse="";

let rankingMode="rank";

let selectedTeamCourse="";

let teamRankingMode="rank";

let deletedSubmissionCount=0;

/*
   v4.6 FAST START
   true khi Reward / giao dịch / vật phẩm đã được tính xong
   cho toàn bộ học viên.
*/
let rewardDataReady=false;


/* =========================================================
   HELPERS
========================================================= */

function escapeHTML(value){

    return String(
        value === undefined ||
        value === null
        ?
        ""
        :
        value
    )
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&apos;");
}


function clean(value){

    return String(
        value === undefined ||
        value === null
        ?
        ""
        :
        value
    )
    .trim();
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


function normalizeGroup(value){

    return RS.normalizeText(
        value
    )
    .replace(
        /^to\s*/,
        ""
    )
    .trim();
}


function normalizeCourse(value){

    return RS.normalizeText(
        value
    );
}


function safeQuantity(value){

    const quantity=
        Math.floor(
            Number(
                value ||
                1
            )
        );


    return(
        Number.isFinite(
            quantity
        )
        &&
        quantity > 0
        ?
        quantity
        :
        1
    );
}


function formatDecimal(
    value,
    maximumDigits
){

    return Number(
        value ||
        0
    )
    .toLocaleString(
        "vi-VN",
        {
            minimumFractionDigits:0,

            maximumFractionDigits:
                maximumDigits === undefined
                ?
                2
                :
                maximumDigits
        }
    );
}


/* =========================================================
   DRIVE ID
   Đồng bộ V18.4D
========================================================= */

function driveIdForSubmission(url){

    const value=
        String(
            url ||
            ""
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


/* =========================================================
   COMPACT TIMESTAMP
   Đồng bộ V18.4D
========================================================= */

function compactSubmissionTimestamp(value){

    const match=
        String(
            value ||
            ""
        )
        .match(
            /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})[\s,]+(\d{1,2}):(\d{2})(?::(\d{2}))?/
        );


    if(!match){

        return "";
    }


    const pad=
        function(number){

            return String(
                number
            )
            .padStart(
                2,
                "0"
            );
        };


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
   Đồng bộ V18.4D

   YYYYMMDDHHMMSS|MAHV|DRIVE_ID
========================================================= */

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


/* =========================================================
   LEVEL
========================================================= */

function getLevel(points){

    points=
        Number(points) ||
        0;


    for(
        let i=
            LEVELS.length-1;
        i>=0;
        i--
    ){

        if(
            points >=
            LEVELS[i].min
        ){

            return LEVELS[i];
        }
    }


    return LEVELS[0];
}


function getProgress(points){

    points=
        Number(points) ||
        0;


    const level=
        getLevel(
            points
        );


    if(
        level.max ===
        Infinity
    ){

        return{
            percent:100,
            remaining:0
        };
    }


    const range=
        level.max -
        level.min;


    const current=
        points -
        level.min;


    return{

        percent:
            Math.max(
                0,
                Math.min(
                    100,
                    range > 0
                    ?
                    current /
                    range *
                    100
                    :
                    0
                )
            ),

        remaining:
            Math.max(
                0,
                level.max -
                points
            )

    };
}


/* =========================================================
   EMPTY REWARD SAFE
========================================================= */

function createEmptyGemsSafe(){

    if(
        typeof RS.createEmptyGems ===
        "function"
    ){

        return RS.createEmptyGems();
    }


    const gems={};


    RS.GEM_ORDER.forEach(
        function(key){

            gems[key]=0;
        }
    );


    return gems;
}


function createEmptyReward(){

    return{

        gems:
            createEmptyGemsSafe(),

        longestStreak:
            0,

        bestHighRun:
            0,

        streakGift:
            null,

        highScoreGift:
            null

    };
}


function calculateRewardSafe(
    submissions
){

    if(
        !submissions ||
        !submissions.length
    ){

        return createEmptyReward();
    }


    return RS.calculateStudentRewardData(
        submissions
    );
}


/* =========================================================
   SCORE DATA

   CHỈ nhận bài hợp lệ.
========================================================= */

function calculateScoreData(
    submissions
){

    let totalScore=0;

    let gradedCount=0;


    (
        submissions ||
        []
    )
    .forEach(
        function(item){

            const score=
                RS.parseScore(
                    item &&
                    item.score
                );


            if(
                score === null
            ){

                return;
            }


            totalScore +=
                score;


            gradedCount++;
        }
    );


    const submissionCount=
        (
            submissions ||
            []
        ).length;


    /*
       =====================================================
       CÔNG THỨC RANK CHÍNH THỨC
       =====================================================

       Rank =
       số bài hợp lệ
       +
       tổng điểm hợp lệ đã chấm
    */

    const rankingPoints=
        submissionCount +
        totalScore;


    return{

        submissionCount:
            submissionCount,

        totalScore:
            totalScore,

        gradedCount:
            gradedCount,

        averageScore:
            gradedCount > 0
            ?
            totalScore /
            gradedCount
            :
            0,

        rankingPoints:
            rankingPoints

    };
}


/* =========================================================
   WEALTH
========================================================= */

function calculateWealthInHoangNgoc(
    gems
){

    let hongValue=0;


    RS.GEM_ORDER
    .forEach(
        function(key){

            const quantity=
                Number(
                    gems &&
                    gems[key] ||
                    0
                );


            if(
                quantity <= 0
            ){

                return;
            }


            hongValue +=
                RS.getGemValueInHong(
                    key,
                    quantity
                );
        }
    );


    return(
        hongValue *
        15
    );
}


/* =========================================================
   SORT HELPERS
========================================================= */

function compareName(a,b){

    return a.name.localeCompare(
        b.name,
        "vi",
        {
            sensitivity:"base"
        }
    );
}


/* =========================================================
   SORT RANK
========================================================= */

function sortByRank(a,b){

    if(
        b.experience !==
        a.experience
    ){

        return(
            b.experience -
            a.experience
        );
    }


    if(
        b.submissions !==
        a.submissions
    ){

        return(
            b.submissions -
            a.submissions
        );
    }


    if(
        b.totalGradedScore !==
        a.totalGradedScore
    ){

        return(
            b.totalGradedScore -
            a.totalGradedScore
        );
    }


    return compareName(
        a,
        b
    );
}


/* =========================================================
   SORT AVERAGE
========================================================= */

function sortByAverage(a,b){

    if(
        b.averageScore !==
        a.averageScore
    ){

        return(
            b.averageScore -
            a.averageScore
        );
    }


    if(
        b.gradedCount !==
        a.gradedCount
    ){

        return(
            b.gradedCount -
            a.gradedCount
        );
    }


    if(
        b.experience !==
        a.experience
    ){

        return(
            b.experience -
            a.experience
        );
    }


    return compareName(
        a,
        b
    );
}


/* =========================================================
   SORT STREAK
========================================================= */

function sortByStreak(a,b){

    const streakA=
        Number(
            a.reward &&
            a.reward.longestStreak ||
            0
        );


    const streakB=
        Number(
            b.reward &&
            b.reward.longestStreak ||
            0
        );


    if(
        streakB !==
        streakA
    ){

        return(
            streakB -
            streakA
        );
    }


    if(
        b.experience !==
        a.experience
    ){

        return(
            b.experience -
            a.experience
        );
    }


    if(
        b.submissions !==
        a.submissions
    ){

        return(
            b.submissions -
            a.submissions
        );
    }


    return compareName(
        a,
        b
    );
}


/* =========================================================
   SORT ACTIVITY
========================================================= */

function sortByActivity(a,b){

    if(
        b.submissions !==
        a.submissions
    ){

        return(
            b.submissions -
            a.submissions
        );
    }


    if(
        b.experience !==
        a.experience
    ){

        return(
            b.experience -
            a.experience
        );
    }


    return compareName(
        a,
        b
    );
}


/* =========================================================
   SORT WEALTH
========================================================= */

function sortByWealth(a,b){

    if(
        b.wealthHoangNgoc !==
        a.wealthHoangNgoc
    ){

        return(
            b.wealthHoangNgoc -
            a.wealthHoangNgoc
        );
    }


    if(
        b.experience !==
        a.experience
    ){

        return(
            b.experience -
            a.experience
        );
    }


    return compareName(
        a,
        b
    );
}


/* =========================================================
   SORT CURRENT MODE
========================================================= */

function sortFilteredStudents(){

    if(
        rankingMode ===
        "average"
    ){

        filteredStudents.sort(
            sortByAverage
        );

        return;
    }


    if(
        rankingMode ===
        "streak"
    ){

        filteredStudents.sort(
            sortByStreak
        );

        return;
    }


    if(
        rankingMode ===
        "active"
    ){

        filteredStudents.sort(
            sortByActivity
        );

        return;
    }


    if(
        rankingMode ===
        "wealth"
    ){

        filteredStudents.sort(
            sortByWealth
        );

        return;
    }


    filteredStudents.sort(
        sortByRank
    );
}


/* =========================================================
   RANKING COLUMNS

   v4.5:
   Không cần cột số bài / điểm Rank trong XepHang.
========================================================= */

function detectRankingColumns(rows){

    const headers=
        rows[0].map(
            RS.normalizeText
        );


    function find(
        aliases,
        fallback
    ){

        const index=
            RS.findColumn(
                headers,
                aliases
            );


        return(
            index >= 0
            ?
            index
            :
            fallback
        );
    }


    return{

        name:
            find(
                [
                    "họ và tên",
                    "ho va ten",
                    "họ tên",
                    "ho ten",
                    "tên học viên",
                    "ten hoc vien"
                ],
                1
            ),

        code:
            find(
                [
                    "mã học viên",
                    "ma hoc vien"
                ],
                2
            ),

        group:
            find(
                [
                    "tổ",
                    "to",
                    "nhóm",
                    "nhom"
                ],
                3
            ),

        course:
            find(
                [
                    "khóa",
                    "khoa"
                ],
                4
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

        return{

            code:-1,

            timestamp:-1,

            file:-1,

            score:-1,

            submissionId:-1
        };
    }


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
                    "tải bài tập lên",
                    "tai bai tap len",
                    "tải bài",
                    "tai bai",
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
   DELETE COLUMNS
========================================================= */

function detectDeleteColumns(rows){

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


/* =========================================================
   BUILD DELETED IDS
========================================================= */

function buildDeletedSubmissionIds(
    deleteCsvText
){

    const rows=
        RS.parseCSV(
            deleteCsvText ||
            ""
        );


    const deleted=
        new Set();


    if(
        !rows ||
        rows.length < 2
    ){

        return deleted;
    }


    const columns=
        detectDeleteColumns(
            rows
        );


    if(
        columns.submissionId < 0
    ){

        throw new Error(
            "Không tìm thấy cột Mã bài nộp trong XoaBai."
        );
    }


    const states=
        new Map();


    rows
    .slice(1)
    .forEach(
        function(row){

            const id=
                clean(
                    row[
                        columns.submissionId
                    ]
                );


            if(!id){

                return;
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


            /*
               KHÔI PHỤC
            */

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


                return;
            }


            /*
               XÓA
            */

            if(
                !action
                ||
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

                states.set(
                    id,
                    true
                );
            }
        }
    );


    states.forEach(
        function(
            isDeleted,
            id
        ){

            if(isDeleted){

                deleted.add(
                    id
                );
            }
        }
    );


    return deleted;
}


/* =========================================================
   BUILD SUBMISSION MAP

   Đây là cổng dữ liệu chính.

   Sau hàm này:
   bài đã xoá KHÔNG còn tồn tại
   trong dữ liệu ranking.
========================================================= */

function buildSubmissionMap(
    submissionCsvText,
    deletedIds
){

    const rows=
        RS.parseCSV(
            submissionCsvText
        );


    const map=
        new Map();


    deletedSubmissionCount=0;


    if(
        !rows.length
    ){

        return map;
    }


    const columns=
        detectSubmissionColumns(
            rows
        );


    if(
        columns.code < 0
    ){

        throw new Error(
            "Không tìm thấy cột Mã học viên trong dữ liệu bài nộp."
        );
    }


    rows
    .slice(1)
    .forEach(
        function(row,index){

            const rawCode=
                clean(
                    row[
                        columns.code
                    ]
                );


            const code=
                RS.normalizeCode(
                    rawCode
                );


            if(!code){

                return;
            }


            const timestamp=
                columns.timestamp >= 0
                ?
                (
                    row[
                        columns.timestamp
                    ]
                    ||
                    ""
                )
                :
                "";


            const file=
                columns.file >= 0
                ?
                (
                    row[
                        columns.file
                    ]
                    ||
                    ""
                )
                :
                "";


            const storedSubmissionId=
                columns.submissionId >= 0
                ?
                clean(
                    row[
                        columns.submissionId
                    ]
                )
                :
                "";


            const submissionId=
                storedSubmissionId

                ||

                buildSubmissionId(
                    timestamp,
                    rawCode,
                    file
                );


            /*
               =================================================
               LOẠI BÀI XOÁ
               =================================================
            */

            if(
                submissionId &&
                deletedIds &&
                deletedIds.has(
                    submissionId
                )
            ){

                deletedSubmissionCount++;

                return;
            }


            if(
                !map.has(
                    code
                )
            ){

                map.set(
                    code,
                    []
                );
            }


            map
            .get(
                code
            )
            .push(
                {

                    code:
                        code,

                    timestamp:
                        timestamp,

                    file:
                        file,

                    score:
                        columns.score >= 0
                        ?
                        (
                            row[
                                columns.score
                            ]
                            ||
                            ""
                        )
                        :
                        "",

                    submissionId:
                        submissionId,

                    originalIndex:
                        index + 1

                }
            );

        }
    );


    return map;
}


/* =========================================================
   AVATAR
========================================================= */

function renderAvatar(
    student,
    isTop
){

    const shellClass=
        isTop
        ?
        "top-avatar-shell"
        :
        "student-avatar-shell";


    const coreClass=
        isTop
        ?
        "top-avatar-core"
        :
        "student-avatar-core";


    const frameClass=
        isTop
        ?
        "top-avatar-frame"
        :
        "student-avatar-frame";


    let avatarHTML=
        UI.user;


    if(
        student.avatar
    ){

        avatarHTML=`

            <img
                src="${escapeHTML(
                    student.avatar
                )}"
                alt=""
                loading="lazy"
                decoding="async"
                onerror="
                    this.style.display='none';
                    this.parentNode.textContent='${UI.user}';
                "
            >

        `;
    }


    let frameHTML="";


    if(
        student.avatarFrame
    ){

        frameHTML=`

            <img
                class="${frameClass}"
                src="${escapeHTML(
                    student.avatarFrame
                )}"
                alt=""
                loading="lazy"
                decoding="async"
                onerror="
                    this.style.display='none';
                "
            >

        `;
    }


    return`

        <div class="${shellClass}">

            <div class="${coreClass}">
                ${avatarHTML}
            </div>

            ${frameHTML}

        </div>

    `;
}


/* =========================================================
   NAME
========================================================= */

function renderStudentName(
    student,
    isTop
){

    return`

        <span
            class="
                synced-name-wrap
                ${
                    isTop
                    ?
                    "top-name-wrap"
                    :
                    ""
                }
            "
            data-multitask="${
                student.hasMultitaskPotion
                ?
                "1"
                :
                "0"
            }"
            data-effect-size="${
                isTop
                ?
                "large"
                :
                "small"
            }"
        >

            <span
                class="
                    synced-name
                    ${
                        isTop
                        ?
                        "top-name"
                        :
                        "student-name"
                    }
                "
            >

                ${escapeHTML(
                    student.name
                )}

            </span>

        </span>

    `;
}


function hydrateEffects(){

    if(
        typeof RS.applyMultitaskEffect !==
        "function"
    ){

        return;
    }


    document
    .querySelectorAll(
        "#student-ranking-app .synced-name-wrap[data-multitask='1']"
    )
    .forEach(
        function(wrapper){

            const nameElement=
                wrapper.querySelector(
                    ".synced-name"
                );


            if(!nameElement){

                return;
            }


            RS.applyMultitaskEffect(
                wrapper,
                nameElement,
                {
                    size:
                        wrapper.dataset.effectSize ||
                        "small"
                }
            );

        }
    );
}


/* =========================================================
   ACHIEVEMENTS
========================================================= */

function renderAchievementIcons(
    student
){

    if(
        !student.reward
    ){

        return "";
    }


    const achievements=[];


    if(
        student.reward.streakGift
    ){

        achievements.push(
            {

                icon:
                    student.reward
                    .streakGift
                    .icon,

                title:
                    student.reward
                    .streakGift
                    .name
                    +
                    " - Chuỗi học dài nhất: "
                    +
                    Number(
                        student.reward
                        .longestStreak ||
                        0
                    )
                    +
                    " ngày"

            }
        );
    }


    if(
        student.reward.highScoreGift
    ){

        achievements.push(
            {

                icon:
                    student.reward
                    .highScoreGift
                    .icon,

                title:
                    student.reward
                    .highScoreGift
                    .name
                    +
                    " - Chuỗi điểm cao nhất: "
                    +
                    Number(
                        student.reward
                        .bestHighRun ||
                        0
                    )
                    +
                    " bài"

            }
        );
    }


    if(
        !achievements.length
    ){

        return "";
    }


    return(

        '<span class="achievement-icons">'

        +

        achievements
        .map(
            function(item){

                return(

                    '<span ' +

                    'class="achievement-icon" ' +

                    'title="' +

                    escapeHTML(
                        item.title
                    )

                    +

                    '">' +

                    item.icon +

                    '</span>'

                );

            }
        )
        .join("")

        +

        '</span>'

    );
}


/* =========================================================
   OWNED ITEM GROUPING
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

            if(!item){

                return;
            }


            const giftName=
                String(
                    item.giftName ||
                    item.name ||
                    ""
                )
                .replace(
                    /\s+/g,
                    " "
                )
                .trim();


            const key=
                RS.normalizeText(
                    giftName
                );


            if(!key){

                return;
            }


            if(
                !map.has(
                    key
                )
            ){

                map.set(
                    key,
                    {

                        giftName:
                            giftName,

                        image:
                            item.image ||
                            "",

                        quantity:
                            0

                    }
                );
            }


            const current=
                map.get(
                    key
                );


            current.quantity +=
                safeQuantity(
                    item.quantity
                );


            if(
                !current.image &&
                item.image
            ){

                current.image=
                    item.image;
            }

        }
    );


    return Array.from(
        map.values()
    );
}


/* =========================================================
   OWNED ASSETS
========================================================= */

function renderOwnedAssets(items){

    const grouped=
        groupOwnedItems(
            items
        );


    let html="";


    grouped.forEach(
        function(item){

            const image=
                item.image
                ?
                RS.convertDriveImageUrl(
                    item.image,
                    100
                )
                :
                "";


            html+=`

                <span
                    class="
                        asset-chip
                        redeemed-asset
                    "
                    title="${escapeHTML(
                        item.giftName
                    )}"
                >

                    ${
                        image
                        ?
                        `
                            <img
                                src="${escapeHTML(
                                    image
                                )}"
                                alt=""
                                loading="lazy"
                                decoding="async"
                                onerror="
                                    this.style.display='none';
                                "
                            >
                        `
                        :
                        `
                            <span class="asset-fallback">
                                ${UI.box}
                            </span>
                        `
                    }

                    ${
                        item.quantity > 1
                        ?
                        `
                            <span class="asset-count">

                                ${item.quantity.toLocaleString(
                                    "vi-VN"
                                )}

                            </span>
                        `
                        :
                        ""
                    }

                </span>

            `;

        }
    );


    return html;
}


/* =========================================================
   GEM ASSETS
========================================================= */

function renderGemAssets(
    gems,
    showZero
){

    let html="";


    GEM_TYPES.forEach(
        function(gem){

            const count=
                Number(
                    gems &&
                    gems[
                        gem.key
                    ]
                    ||
                    0
                );


            if(
                count <= 0 &&
                !showZero
            ){

                return;
            }


            const image=
                RS.convertDriveImageUrl(
                    gem.icon,
                    96
                );


            html+=`

                <span
                    class="
                        asset-chip
                        gem-asset
                    "
                    title="${escapeHTML(
                        gem.name
                    )}"
                >

                    <img
                        src="${escapeHTML(
                            image
                        )}"
                        alt=""
                        loading="lazy"
                        decoding="async"
                        onerror="
                            this.style.display='none';
                        "
                    >

                    <span class="asset-count">

                        ${count.toLocaleString(
                            "vi-VN"
                        )}

                    </span>

                </span>

            `;

        }
    );


    return html;
}


/* =========================================================
   DIRECT ASSETS
========================================================= */

function renderDirectAssets(
    student
){

    if(
        student &&
        student.rewardDataReady === false
    ){

        return`

            <span class="no-assets">
                Đang cập nhật…
            </span>

        `;
    }


    const itemHTML=
        renderOwnedAssets(
            student.ownedItems
        );


    const gemHTML=
        renderGemAssets(
            student.gems,
            false
        );


    if(
        !itemHTML &&
        !gemHTML
    ){

        return`

            <span class="no-assets">
                —
            </span>

        `;
    }


    return`

        <div class="direct-assets">

            ${itemHTML}

            ${gemHTML}

        </div>

    `;
}


/* =========================================================
   STUDENT METRIC
========================================================= */

function getStudentMetric(
    student
){

    if(
        rankingMode ===
        "average"
    ){

        return{

            icon:
                UI.target,

            value:
                formatDecimal(
                    student.averageScore,
                    2
                ),

            note:
                student.gradedCount
                .toLocaleString(
                    "vi-VN"
                )
                +
                " bài hợp lệ đã chấm"

        };
    }


    if(
        rankingMode ===
        "streak"
    ){

        return{

            icon:
                UI.fire,

            value:
                Number(
                    student.reward &&
                    student.reward.longestStreak ||
                    0
                )
                .toLocaleString(
                    "vi-VN"
                )
                +
                " ngày",

            note:
                "Chuỗi liên tục từ bài hợp lệ"

        };
    }


    if(
        rankingMode ===
        "active"
    ){

        return{

            icon:
                UI.lightning,

            value:
                student.submissions
                .toLocaleString(
                    "vi-VN"
                )
                +
                " bài",

            note:
                "Tổng lượt nộp hợp lệ"

        };
    }


    if(
        rankingMode ===
        "wealth"
    ){

        return{

            icon:
                UI.money,

            value:
                formatDecimal(
                    student.wealthHoangNgoc,
                    2
                ),

            note:
                "Hoàng Ngọc tương đương"

        };
    }


    return{

        icon:
            UI.star,

        value:
            formatDecimal(
                student.experience,
                2
            ),

        note:
            "Bài hợp lệ + tổng điểm"

    };
}


function renderStudentMetric(
    student
){

    const metric=
        getStudentMetric(
            student
        );


    return`

        <div class="metric-box">

            <span class="metric-value">

                ${metric.icon}

                ${escapeHTML(
                    metric.value
                )}

            </span>

            <span class="metric-note">

                ${escapeHTML(
                    metric.note
                )}

            </span>

        </div>

    `;
}


/* =========================================================
   TOP EXTRA
========================================================= */

function renderTopRankingExtra(
    student
){

    if(
        student.isAdmin ||
        rankingMode ===
        "rank"
    ){

        return "";
    }


    const metric=
        getStudentMetric(
            student
        );


    return`

        <span
            class="top-ranking-extra"
            title="${escapeHTML(
                metric.note
            )}"
        >

            ${metric.icon}

            ${escapeHTML(
                metric.value
            )}

        </span>

    `;
}


/* =========================================================
   ACCOUNTING
========================================================= */

function buildStudentRewardProfile(
    basicStudent,
    submissions,
    transactions,
    teacherOwnedItems
){

    /*
       submissions ở đây đã loại XoaBai.
    */

    const reward=
        calculateRewardSafe(
            submissions
        );


    const accounting=
        RS.processTransactions(
            reward.gems,
            transactions ||
            []
        );


    const ownedItems=
        typeof RS.mergeOwnedItems ===
        "function"
        ?
        RS.mergeOwnedItems(
            accounting.ownedItems ||
            [],
            teacherOwnedItems ||
            []
        )
        :
        [
            ...(
                accounting.ownedItems ||
                []
            ),
            ...(
                teacherOwnedItems ||
                []
            )
        ];


    const finalGems=
        accounting.gems;


    const wealthHoangNgoc=
        calculateWealthInHoangNgoc(
            finalGems
        );


    return Object.assign(
        {},
        basicStudent,
        {

            reward:
                reward,

            gems:
                finalGems,

            wealthHoangNgoc:
                wealthHoangNgoc,

            rawTransactions:
                transactions ||
                [],

            transactions:
                accounting.validTransactions ||
                [],

            validTransactions:
                accounting.validTransactions ||
                [],

            rejectedTransactions:
                accounting.rejectedTransactions ||
                [],

            ownedItems:
                ownedItems,

            gemRewards:
                accounting.gemRewards ||
                [],

            consumedDealIds:
                accounting.consumedDealIds ||
                [],

            avatar:
                RS.getProfileAvatar(
                    ownedItems
                ),

            avatarFrame:
                RS.getProfileAvatarFrame(
                    ownedItems
                ),

            profileBackground:
                RS.getProfileBackground(
                    ownedItems
                ),

            hasMultitaskPotion:
                RS.hasMultitaskPotion(
                    ownedItems
                )

        }
    );
}


/* =========================================================
   ADMIN
========================================================= */

function createAdminStudent(
    shared
){

    if(
        !ADMIN_CONFIG.enabled
    ){

        return null;
    }


    const code=
        RS.normalizeCode(
            ADMIN_CONFIG.code
        );


    const rawTransactions=
        shared.redemptionMap
        .get(
            code
        )
        ||
        [];


    const teacherOwnedItems=
        (
            shared.teacherOwnedItemMap &&
            shared.teacherOwnedItemMap.get(
                code
            )
        )
        ||
        [];


    const baseGems=
        typeof RS.cloneGems ===
        "function"
        ?
        RS.cloneGems(
            ADMIN_CONFIG.baseGems
        )
        :
        Object.assign(
            {},
            ADMIN_CONFIG.baseGems
        );


    const accounting=
        RS.processTransactions(
            baseGems,
            rawTransactions
        );


    const ownedItems=
        typeof RS.mergeOwnedItems ===
        "function"
        ?
        RS.mergeOwnedItems(
            accounting.ownedItems ||
            [],
            teacherOwnedItems
        )
        :
        [
            ...(
                accounting.ownedItems ||
                []
            ),
            ...teacherOwnedItems
        ];


    /*
       ADMIN vẫn giữ rankingPoints test riêng.
    */

    const experience=
        Number(
            ADMIN_CONFIG.rankingPoints
        )
        ||
        0;


    return{

        name:
            ADMIN_CONFIG.name,

        code:
            code,

        group:
            ADMIN_CONFIG.group,

        course:
            ADMIN_CONFIG.course,

        groupKey:
            normalizeGroup(
                ADMIN_CONFIG.group
            ),

        courseKey:
            normalizeCourse(
                ADMIN_CONFIG.course
            ),

        submissions:
            Number(
                ADMIN_CONFIG.submissions
            )
            ||
            0,

        experience:
            experience,

        totalGradedScore:
            0,

        gradedCount:
            0,

        averageScore:
            0,

        level:
            getLevel(
                experience
            ),

        reward:
            null,

        gems:
            accounting.gems,

        wealthHoangNgoc:
            calculateWealthInHoangNgoc(
                accounting.gems
            ),

        rawTransactions:
            rawTransactions,

        transactions:
            accounting.validTransactions ||
            [],

        validTransactions:
            accounting.validTransactions ||
            [],

        rejectedTransactions:
            accounting.rejectedTransactions ||
            [],

        ownedItems:
            ownedItems,

        gemRewards:
            accounting.gemRewards ||
            [],

        consumedDealIds:
            accounting.consumedDealIds ||
            [],

        avatar:
            RS.getProfileAvatar(
                ownedItems
            ),

        avatarFrame:
            RS.getProfileAvatarFrame(
                ownedItems
            ),

        profileBackground:
            RS.getProfileBackground(
                ownedItems
            ),

        hasMultitaskPotion:
            RS.hasMultitaskPotion(
                ownedItems
            ),

        isAdmin:
            true

    };
}


/* =========================================================
   FAST START / YIELD

   Nhường luồng cho trình duyệt giữa các lô tính Reward.
   Không thay đổi dữ liệu hay công thức tính.
========================================================= */

function yieldRankingThread(){

    return new Promise(
        function(resolve){

            if(
                typeof window.requestIdleCallback ===
                "function"
            ){

                window.requestIdleCallback(
                    function(){
                        resolve();
                    },
                    {timeout:80}
                );

                return;
            }

            setTimeout(
                resolve,
                0
            );
        }
    );
}


/* =========================================================
   LOAD DATA
========================================================= */

async function loadData(){

    try{

        /*
           =================================================
           FAST START

           Khởi động CẢ 4 nguồn cùng lúc như bản cũ,
           nhưng không bắt giao diện phải chờ Reward Shared
           mới được dựng bảng Rank cơ bản.
           =================================================
        */

        const rankingPromise=
            RS.fetchCSV(
                RANKING_CSV_URL
            );


        const submissionPromise=
            RS.fetchCSV(
                SUBMISSION_CSV_URL
            );


        const sharedPromise=
            RS.loadSharedRewardData();


        const deletePromise=
            RS.fetchCSV(
                DELETE_LOG_CSV_URL
            );


        /*
           Rank / điểm / bài nộp / XoaBai có thể dựng trước.
        */

        const basicResults=
            await Promise.all(
                [
                    rankingPromise,
                    submissionPromise,
                    deletePromise
                ]
            );


        const rankingRows=
            RS.parseCSV(
                basicResults[0]
            );


        if(
            rankingRows.length < 2
        ){

            throw new Error(
                "Sheet bảng xếp hạng chưa có dữ liệu."
            );
        }


        /*
           =================================================
           XOABAI
           =================================================
        */

        const deletedIds=
            buildDeletedSubmissionIds(
                basicResults[2]
            );


        const submissionMap=
            buildSubmissionMap(
                basicResults[1],
                deletedIds
            );


        const columns=
            detectRankingColumns(
                rankingRows
            );


        rewardDataReady=false;


        /*
           =================================================
           PHA 1 — HỒ SƠ XẾP HẠNG CƠ BẢN

           Chưa replay giao dịch / chưa dựng tài sản.
           Rank, bài nộp và điểm vẫn là số chính thức.
           =================================================
        */

        students=
            rankingRows
            .slice(1)
            .map(
                function(row){

                    const name=
                        String(
                            row[
                                columns.name
                            ]
                            ||
                            ""
                        )
                        .replace(
                            /\s+/g,
                            " "
                        )
                        .trim();


                    const code=
                        RS.normalizeCode(
                            row[
                                columns.code
                            ]
                        );


                    if(
                        !name ||
                        !code
                    ){

                        return null;
                    }


                    const group=
                        String(
                            row[
                                columns.group
                            ]
                            ||
                            ""
                        )
                        .replace(
                            /\s+/g,
                            " "
                        )
                        .trim();


                    const course=
                        String(
                            row[
                                columns.course
                            ]
                            ||
                            ""
                        )
                        .replace(
                            /\s+/g,
                            " "
                        )
                        .trim();


                    const rewardSubmissions=
                        submissionMap.get(
                            code
                        )
                        ||
                        [];


                    const scoreData=
                        calculateScoreData(
                            rewardSubmissions
                        );


                    const experience=
                        scoreData.rankingPoints;


                    return{

                        name:name,
                        code:code,
                        group:group,
                        course:course,

                        groupKey:
                            normalizeGroup(
                                group
                            ),

                        courseKey:
                            normalizeCourse(
                                course
                            ),

                        submissions:
                            scoreData.submissionCount,

                        experience:
                            experience,

                        totalGradedScore:
                            scoreData.totalScore,

                        gradedCount:
                            scoreData.gradedCount,

                        averageScore:
                            scoreData.averageScore,

                        level:
                            getLevel(
                                experience
                            ),

                        /*
                           Các trường Reward để render an toàn
                           trong thời gian Pha 2 đang chạy.
                        */
                        reward:null,
                        gems:createEmptyGemsSafe(),
                        wealthHoangNgoc:0,
                        rawTransactions:[],
                        transactions:[],
                        validTransactions:[],
                        rejectedTransactions:[],
                        ownedItems:[],
                        gemRewards:[],
                        consumedDealIds:[],
                        avatar:"",
                        avatarFrame:"",
                        profileBackground:"",
                        hasMultitaskPotion:false,
                        rewardDataReady:false,
                        isAdmin:false

                    };

                }
            )
            .filter(
                Boolean
            );


        filteredStudents=
            students.slice();


        sortFilteredStudents();

        buildFilters();

        buildTeamCourseFilter();

        updateStatistics();

        updateFilterText();

        updateTeamFilterText();

        /*
           Cho người dùng thấy Rank / điểm / số bài sớm.
           Reward và tài sản được bổ sung ở Pha 2 ngay sau đây.
        */
        renderTeamRanking();

        render();


        /*
           Nhường một nhịp để trình duyệt có cơ hội paint.
        */
        await yieldRankingThread();


        /*
           =================================================
           PHA 2 — REWARD / GIAO DỊCH / VẬT PHẨM
           =================================================
        */

        const shared=
            await sharedPromise;


        const ENRICH_BATCH_SIZE=24;


        for(
            let index=0;
            index<students.length;
            index++
        ){

            const student=
                students[index];


            const rewardSubmissions=
                submissionMap.get(
                    student.code
                )
                ||
                [];


            const rawTransactions=
                shared.redemptionMap
                .get(
                    student.code
                )
                ||
                [];


            const teacherOwnedItems=
                (
                    shared.teacherOwnedItemMap &&
                    shared.teacherOwnedItemMap.get(
                        student.code
                    )
                )
                ||
                [];


            const enriched=
                buildStudentRewardProfile(
                    student,
                    rewardSubmissions,
                    rawTransactions,
                    teacherOwnedItems
                );


            enriched.rewardDataReady=true;

            students[index]=enriched;


            if(
                (
                    index + 1
                ) %
                ENRICH_BATCH_SIZE ===
                0
            ){

                await yieldRankingThread();
            }
        }


        /*
           =================================================
           ADMIN TEST
           =================================================
        */

        const adminStudent=
            createAdminStudent(
                shared
            );


        if(
            adminStudent
        ){

            adminStudent.rewardDataReady=true;


            students=
                students.filter(
                    function(student){

                        return(
                            student.code !==
                            adminStudent.code
                        );
                    }
                );


            students.push(
                adminStudent
            );
        }


        rewardDataReady=true;


        /*
           Đồng bộ lại danh sách hiện tại để các object đã
           enrichment được dùng cho mọi chế độ lọc / xếp hạng.
        */
        filteredStudents=
            students.filter(
                function(student){

                    if(
                        student.isAdmin &&
                        rankingMode !==
                        "rank"
                    ){

                        return false;
                    }


                    if(
                        student.isAdmin &&
                        (
                            selectedGroup ||
                            selectedCourse
                        )
                    ){

                        return false;
                    }


                    return(

                        (
                            !selectedGroup ||
                            student.groupKey ===
                            selectedGroup
                        )

                        &&

                        (
                            !selectedCourse ||
                            student.courseKey ===
                            selectedCourse
                        )

                    );
                }
            );


        sortFilteredStudents();

        buildFilters();

        buildTeamCourseFilter();

        updateStatistics();

        updateFilterText();

        updateTeamFilterText();

        renderTeamRanking();

        render();


        console.log(
            "[Ranking v4.6 Fast Start] Học viên:",
            students.length
        );


        console.log(
            "[Ranking v4.6 Fast Start] Mã bài đang bị xoá:",
            deletedIds.size
        );


        console.log(
            "[Ranking v4.6 Fast Start] Số bài thực tế đã loại:",
            deletedSubmissionCount
        );


        console.log(
            "[Ranking v4.6 Fast Start] Rank = bài hợp lệ + tổng điểm hợp lệ."
        );


    }catch(error){

        console.error(
            "[Ranking v4.6 Fast Start]",
            error
        );


        const rankingContent=
            document.getElementById(
                "rankingContent"
            );


        if(
            rankingContent
        ){

            rankingContent.innerHTML=

                '<div class="ranking-error">' +

                'Không thể tải bảng xếp hạng.<br>' +

                escapeHTML(
                    error.message ||
                    "Lỗi không xác định."
                )

                +

                '</div>';
        }


        const teamContent=
            document.getElementById(
                "teamRankingContent"
            );


        if(
            teamContent
        ){

            teamContent.innerHTML=

                '<div class="ranking-error">' +

                'Không thể tải xếp hạng tổ.' +

                '</div>';
        }
    }
}

/* =========================================================
   FILTER OPTIONS
========================================================= */

function buildFilters(){

    const groupSelect=
        document.getElementById(
            "groupFilter"
        );


    const courseSelect=
        document.getElementById(
            "courseFilter"
        );


    const groups=
        new Map();


    const courses=
        new Map();


    students.forEach(
        function(student){

            if(
                student.isAdmin
            ){

                return;
            }


            if(
                student.groupKey &&
                !groups.has(
                    student.groupKey
                )
            ){

                groups.set(
                    student.groupKey,
                    student.group
                );
            }


            if(
                student.courseKey &&
                !courses.has(
                    student.courseKey
                )
            ){

                courses.set(
                    student.courseKey,
                    student.course
                );
            }

        }
    );


    groupSelect.innerHTML=
        '<option value="">Tất cả tổ</option>';


    courseSelect.innerHTML=
        '<option value="">Tất cả khóa</option>';


    Array.from(
        groups.entries()
    )
    .sort(
        function(a,b){

            return a[1]
            .localeCompare(
                b[1],
                "vi",
                {
                    numeric:true
                }
            );
        }
    )
    .forEach(
        function(item){

            const option=
                document.createElement(
                    "option"
                );


            option.value=
                item[0];


            option.textContent=
                item[1];


            groupSelect.appendChild(
                option
            );

        }
    );


    Array.from(
        courses.entries()
    )
    .sort(
        function(a,b){

            return a[1]
            .localeCompare(
                b[1],
                "vi",
                {
                    numeric:true
                }
            );
        }
    )
    .forEach(
        function(item){

            const option=
                document.createElement(
                    "option"
                );


            option.value=
                item[0];


            option.textContent=
                item[1];


            courseSelect.appendChild(
                option
            );

        }
    );
}


/* =========================================================
   TEAM COURSE FILTER
========================================================= */

function buildTeamCourseFilter(){

    const select=
        document.getElementById(
            "teamCourseFilter"
        );


    const courses=
        new Map();


    students.forEach(
        function(student){

            if(
                student.isAdmin
            ){

                return;
            }


            if(
                student.courseKey &&
                !courses.has(
                    student.courseKey
                )
            ){

                courses.set(
                    student.courseKey,
                    student.course
                );
            }

        }
    );


    select.innerHTML=
        '<option value="">Tất cả khóa</option>';


    Array.from(
        courses.entries()
    )
    .sort(
        function(a,b){

            return a[1]
            .localeCompare(
                b[1],
                "vi",
                {
                    numeric:true
                }
            );
        }
    )
    .forEach(
        function(item){

            const option=
                document.createElement(
                    "option"
                );


            option.value=
                item[0];


            option.textContent=
                item[1];


            select.appendChild(
                option
            );

        }
    );
}


/* =========================================================
   STATISTICS

   TẤT CẢ dùng số mới sau XoaBai.
========================================================= */

function updateStatistics(){

    let submissions=0;

    let experience=0;


    const teams=
        new Set();


    const realStudents=
        students.filter(
            function(student){

                return(
                    !student.isAdmin
                );
            }
        );


    realStudents.forEach(
        function(student){

            submissions +=
                Number(
                    student.submissions
                )
                ||
                0;


            experience +=
                Number(
                    student.experience
                )
                ||
                0;


            if(
                student.groupKey &&
                student.courseKey
            ){

                teams.add(
                    student.courseKey +
                    "||" +
                    student.groupKey
                );
            }

        }
    );


    document.getElementById(
        "totalStudents"
    ).textContent=
        realStudents.length
        .toLocaleString(
            "vi-VN"
        );


    document.getElementById(
        "totalTeams"
    ).textContent=
        teams.size
        .toLocaleString(
            "vi-VN"
        );


    document.getElementById(
        "totalSubmissions"
    ).textContent=
        submissions
        .toLocaleString(
            "vi-VN"
        );


    document.getElementById(
        "totalExperience"
    ).textContent=
        formatDecimal(
            experience,
            2
        );
}


/* =========================================================
   TEAM BUILD
========================================================= */

function buildTeams(){

    const teamMap=
        new Map();


    students.forEach(
        function(student){

            if(
                student.isAdmin
            ){

                return;
            }


            if(
                selectedTeamCourse &&
                student.courseKey !==
                selectedTeamCourse
            ){

                return;
            }


            if(
                !student.groupKey ||
                !student.courseKey
            ){

                return;
            }


            const key=
                student.courseKey +
                "||" +
                student.groupKey;


            let team=
                teamMap.get(
                    key
                );


            if(!team){

                team={

                    group:
                        student.group,

                    course:
                        student.course,

                    members:
                        0,

                    experience:
                        0,

                    submissions:
                        0,

                    totalGradedScore:
                        0,

                    gradedCount:
                        0,

                    averageScore:
                        0,

                    streakSum:
                        0,

                    averageStreak:
                        0,

                    bestStreak:
                        0,

                    wealthHoangNgoc:
                        0,

                    gems:
                        typeof RS.createEmptyGems ===
                        "function"
                        ?
                        RS.createEmptyGems()
                        :
                        {}

                };


                GEM_TYPES.forEach(
                    function(gem){

                        if(
                            team.gems[
                                gem.key
                            ] === undefined
                        ){

                            team.gems[
                                gem.key
                            ]=0;
                        }

                    }
                );


                teamMap.set(
                    key,
                    team
                );
            }


            team.members++;


            /*
               Tổng Rank tổ =
               tổng Rank đã tính lại của học viên.
            */

            team.experience +=
                Number(
                    student.experience
                )
                ||
                0;


            /*
               Tổng bài hợp lệ.
            */

            team.submissions +=
                Number(
                    student.submissions
                )
                ||
                0;


            /*
               Tổng điểm hợp lệ.
            */

            team.totalGradedScore +=
                Number(
                    student.totalGradedScore
                )
                ||
                0;


            team.gradedCount +=
                Number(
                    student.gradedCount
                )
                ||
                0;


            const studentStreak=
                Number(
                    student.reward &&
                    student.reward.longestStreak ||
                    0
                );


            team.streakSum +=
                studentStreak;


            team.bestStreak=
                Math.max(
                    team.bestStreak,
                    studentStreak
                );


            team.wealthHoangNgoc +=
                Number(
                    student.wealthHoangNgoc
                )
                ||
                0;


            GEM_TYPES.forEach(
                function(gem){

                    team.gems[
                        gem.key
                    ] +=
                        Number(
                            student.gems &&
                            student.gems[
                                gem.key
                            ]
                            ||
                            0
                        );

                }
            );

        }
    );


    const teams=
        Array.from(
            teamMap.values()
        );


    teams.forEach(
        function(team){

            team.averageScore=
                team.gradedCount > 0
                ?
                team.totalGradedScore /
                team.gradedCount
                :
                0;


            team.averageStreak=
                team.members > 0
                ?
                team.streakSum /
                team.members
                :
                0;

        }
    );


    return teams;
}


/* =========================================================
   TEAM SORT
========================================================= */

function sortTeams(
    teams
){

    teams.sort(
        function(a,b){


            if(
                teamRankingMode ===
                "average"
            ){

                if(
                    b.averageScore !==
                    a.averageScore
                ){

                    return(
                        b.averageScore -
                        a.averageScore
                    );
                }


                if(
                    b.gradedCount !==
                    a.gradedCount
                ){

                    return(
                        b.gradedCount -
                        a.gradedCount
                    );
                }


                return(
                    b.experience -
                    a.experience
                );
            }


            if(
                teamRankingMode ===
                "streak"
            ){

                if(
                    b.averageStreak !==
                    a.averageStreak
                ){

                    return(
                        b.averageStreak -
                        a.averageStreak
                    );
                }


                if(
                    b.bestStreak !==
                    a.bestStreak
                ){

                    return(
                        b.bestStreak -
                        a.bestStreak
                    );
                }


                return(
                    b.experience -
                    a.experience
                );
            }


            if(
                teamRankingMode ===
                "active"
            ){

                if(
                    b.submissions !==
                    a.submissions
                ){

                    return(
                        b.submissions -
                        a.submissions
                    );
                }


                return(
                    b.experience -
                    a.experience
                );
            }


            if(
                teamRankingMode ===
                "wealth"
            ){

                if(
                    b.wealthHoangNgoc !==
                    a.wealthHoangNgoc
                ){

                    return(
                        b.wealthHoangNgoc -
                        a.wealthHoangNgoc
                    );
                }


                return(
                    b.experience -
                    a.experience
                );
            }


            /*
               TOP RANK TỔ:
               dùng Rank được tính lại.
            */

            if(
                b.experience !==
                a.experience
            ){

                return(
                    b.experience -
                    a.experience
                );
            }


            if(
                b.submissions !==
                a.submissions
            ){

                return(
                    b.submissions -
                    a.submissions
                );
            }


            return a.group.localeCompare(
                b.group,
                "vi",
                {
                    numeric:true
                }
            );

        }
    );


    return teams;
}


/* =========================================================
   TEAM RENDER
========================================================= */

function renderTeamRanking(){

    const container=
        document.getElementById(
            "teamRankingContent"
        );


    const teams=
        sortTeams(
            buildTeams()
        );


    if(
        !teams.length
    ){

        container.innerHTML=

            '<div class="ranking-loading">' +

            'Không có dữ liệu tổ phù hợp.' +

            '</div>';


        return;
    }


    let html=`

        <div class="team-table-wrapper">

            <table class="team-table">

                <thead>

                    <tr>

                        <th>
                            ${UI.trophy}
                            Hạng
                        </th>

                        <th>
                            ${UI.people}
                            Tổ
                        </th>

                        <th>
                            ${UI.user}
                            Thành viên
                        </th>

                        <th>
                            ${UI.star}
                            Rank tổng
                        </th>

                        <th>
                            ${UI.book}
                            Bài nộp
                        </th>

                        <th>
                            ${UI.target}
                            Điểm TB
                        </th>

                        <th>
                            ${UI.gem}
                            Linh thạch
                        </th>

                    </tr>

                </thead>

                <tbody>

    `;


    teams.forEach(
        function(team,index){

            const rank=
                index + 1;


            html+=`

                <tr>

                    <td class="team-position">

                        ${
                            rank === 1
                            ?
                            UI.medal1
                            :
                            rank === 2
                            ?
                            UI.medal2
                            :
                            rank === 3
                            ?
                            UI.medal3
                            :
                            rank
                        }

                    </td>


                    <td>

                        <strong>
                            ${escapeHTML(
                                team.group
                            )}
                        </strong>

                        <div class="team-secondary">

                            ${escapeHTML(
                                team.course
                            )}

                        </div>

                    </td>


                    <td>

                        ${team.members
                        .toLocaleString(
                            "vi-VN"
                        )}

                    </td>


                    <td>

                        <strong
                            style="color:#fde68a;"
                            title="Rank = số bài hợp lệ + tổng điểm hợp lệ"
                        >

                            ${formatDecimal(
                                team.experience,
                                2
                            )}

                        </strong>

                    </td>


                    <td>

                        ${team.submissions
                        .toLocaleString(
                            "vi-VN"
                        )}

                        <div class="team-secondary">
                            bài hợp lệ
                        </div>

                    </td>


                    <td>

                        <strong
                            style="color:#86efac;"
                        >

                            ${formatDecimal(
                                team.averageScore,
                                2
                            )}

                        </strong>

                        <div class="team-secondary">

                            ${team.gradedCount
                            .toLocaleString(
                                "vi-VN"
                            )}
                            bài hợp lệ đã chấm

                        </div>

                    </td>


                    <td>

                        <div class="team-gems">

                            ${
                                rewardDataReady
                                ?
                                renderGemAssets(
                                    team.gems,
                                    true
                                )
                                :
                                '<span class="no-assets">Đang cập nhật…</span>'
                            }

                        </div>

                    </td>

                </tr>

            `;

        }
    );


    html+=`

                </tbody>

            </table>

        </div>

    `;


    container.innerHTML=
        html;
}


/* =========================================================
   STUDENT FILTER
========================================================= */

function applyFilters(){

    rankingMode=
        document.getElementById(
            "rankingModeFilter"
        ).value
        ||
        "rank";


    selectedGroup=
        normalizeGroup(
            document.getElementById(
                "groupFilter"
            ).value
        );


    selectedCourse=
        normalizeCourse(
            document.getElementById(
                "courseFilter"
            ).value
        );


    filteredStudents=
        students.filter(
            function(student){

                if(
                    student.isAdmin &&
                    rankingMode !==
                    "rank"
                ){

                    return false;
                }


                if(
                    student.isAdmin &&
                    (
                        selectedGroup ||
                        selectedCourse
                    )
                ){

                    return false;
                }


                return(

                    (
                        !selectedGroup ||
                        student.groupKey ===
                        selectedGroup
                    )

                    &&

                    (
                        !selectedCourse ||
                        student.courseKey ===
                        selectedCourse
                    )

                );

            }
        );


    sortFilteredStudents();


    currentPage=1;


    updateFilterText();

    render();
}


/* =========================================================
   CLEAR STUDENT FILTER
========================================================= */

function clearFilters(){

    selectedGroup="";

    selectedCourse="";

    rankingMode="rank";


    document.getElementById(
        "rankingModeFilter"
    ).value=
        "rank";


    document.getElementById(
        "groupFilter"
    ).value=
        "";


    document.getElementById(
        "courseFilter"
    ).value=
        "";


    filteredStudents=
        students.slice();


    sortFilteredStudents();


    currentPage=1;


    updateFilterText();

    render();
}


/* =========================================================
   STUDENT MODE LABEL
========================================================= */

function getRankingModeLabel(){

    if(
        rankingMode ===
        "average"
    ){

        return(
            "Top điểm trung bình cao nhất"
        );
    }


    if(
        rankingMode ===
        "streak"
    ){

        return(
            "Top bền bỉ nhất"
        );
    }


    if(
        rankingMode ===
        "active"
    ){

        return(
            "Top năng nổ nhất"
        );
    }


    if(
        rankingMode ===
        "wealth"
    ){

        return(
            "Top phú hào"
        );
    }


    return(
        "Top rank tổng"
    );
}


function getRankingModeDescription(){

    if(
        rankingMode ===
        "average"
    ){

        return(
            "Điểm trung bình chỉ tính các bài hợp lệ chưa bị xoá và đã được giáo viên chấm."
        );
    }


    if(
        rankingMode ===
        "streak"
    ){

        return(
            "Chuỗi học liên tục được tính lại hoàn toàn từ các bài hợp lệ."
        );
    }


    if(
        rankingMode ===
        "active"
    ){

        return(
            "Xếp theo tổng số lượt bài hợp lệ sau khi loại toàn bộ bài đã xoá."
        );
    }


    if(
        rankingMode ===
        "wealth"
    ){

        return(
            "Phần thưởng học tập được tính lại từ bài hợp lệ trước khi tính tài sản linh thạch."
        );
    }


    return(
        "Rank tổng = số bài hợp lệ + tổng điểm các bài hợp lệ đã được chấm."
    );
}


function updateFilterText(){

    const box=
        document.getElementById(
            "activeFilterText"
        );


    box.innerHTML=

        'Đang xếp theo ' +

        '<span class="filter-mode">' +

        escapeHTML(
            getRankingModeLabel()
        )

        +

        '</span>. ' +

        '<span class="filter-count">' +

        filteredStudents.length
        .toLocaleString(
            "vi-VN"
        )

        +

        ' học viên</span>. ' +

        escapeHTML(
            getRankingModeDescription()
        );
}


/* =========================================================
   TEAM MODE LABEL
========================================================= */

function getTeamModeLabel(){

    if(
        teamRankingMode ===
        "average"
    ){

        return(
            "Top điểm trung bình"
        );
    }


    if(
        teamRankingMode ===
        "streak"
    ){

        return(
            "Top bền bỉ"
        );
    }


    if(
        teamRankingMode ===
        "active"
    ){

        return(
            "Top năng nổ"
        );
    }


    if(
        teamRankingMode ===
        "wealth"
    ){

        return(
            "Top phú hào"
        );
    }


    return(
        "Top rank tổng"
    );
}


function getTeamModeDescription(){

    if(
        teamRankingMode ===
        "average"
    ){

        return(
            "Các tổ được xếp theo điểm trung bình của toàn bộ bài hợp lệ đã chấm."
        );
    }


    if(
        teamRankingMode ===
        "streak"
    ){

        return(
            "Các tổ được xếp theo khả năng duy trì chuỗi học tập sau khi loại bài đã xoá."
        );
    }


    if(
        teamRankingMode ===
        "active"
    ){

        return(
            "Các tổ được xếp theo tổng số bài hợp lệ của thành viên."
        );
    }


    if(
        teamRankingMode ===
        "wealth"
    ){

        return(
            "Các tổ được xếp theo tổng tài sản linh thạch hiện tại sau khi tính lại Reward."
        );
    }


    return(
        "Rank tổ = tổng của công thức số bài hợp lệ + tổng điểm hợp lệ của các thành viên."
    );
}


function updateTeamFilterText(){

    const box=
        document.getElementById(
            "teamActiveFilterText"
        );


    if(!box){

        return;
    }


    box.innerHTML=

        'Đang xếp tổ theo ' +

        '<span class="filter-mode">' +

        escapeHTML(
            getTeamModeLabel()
        )

        +

        '</span>. ' +

        escapeHTML(
            getTeamModeDescription()
        );
}


/* =========================================================
   TOP 3
========================================================= */

function renderTopThree(){

    if(
        currentPage !==
        1
    ){

        return "";
    }


    const top=
        filteredStudents.slice(
            0,
            3
        );


    if(!top.length){

        return "";
    }


    let html=
        '<div class="top-three">';


    top.forEach(
        function(student,index){

            const rank=
                index + 1;


            html+=`

                <article
                    class="
                        top-card
                        rank-${rank}
                    "
                    data-student-code="${escapeHTML(
                        student.code
                    )}"
                >

                    <div class="top-medal">

                        ${
                            rank === 1
                            ?
                            UI.medal1
                            :
                            rank === 2
                            ?
                            UI.medal2
                            :
                            UI.medal3
                        }

                    </div>


                    ${renderAvatar(
                        student,
                        true
                    )}


                    ${renderStudentName(
                        student,
                        true
                    )}


                    <div class="top-meta-line">


                        ${renderAchievementIcons(
                            student
                        )}


                        ${
                            student.isAdmin
                            ?
                            `
                                <span class="meta-pill">
                                    ADMIN TEST
                                </span>
                            `
                            :
                            `
                                <span class="meta-pill">

                                    ${escapeHTML(
                                        student.group ||
                                        "—"
                                    )}

                                </span>

                                <span class="meta-pill">

                                    ${escapeHTML(
                                        student.course ||
                                        "—"
                                    )}

                                </span>
                            `
                        }


                        <span
                            class="
                                meta-pill
                                meta-score
                            "
                            title="Rank = số bài hợp lệ + tổng điểm hợp lệ"
                        >

                            ${UI.star}

                            ${formatDecimal(
                                student.experience,
                                2
                            )}

                        </span>


                        ${renderTopRankingExtra(
                            student
                        )}


                    </div>


                    <div class="top-title">

                        ${escapeHTML(
                            student.level.name
                        )}

                    </div>


                    <div class="top-assets">

                        ${renderDirectAssets(
                            student
                        )}

                    </div>

                </article>

            `;

        }
    );


    html+=
        "</div>";


    return html;
}


/* =========================================================
   TOP BACKGROUND
========================================================= */

function hydrateTopBackgrounds(){

    document
    .querySelectorAll(
        "#student-ranking-app .top-card[data-student-code]"
    )
    .forEach(
        function(card){

            const code=
                RS.normalizeCode(
                    card.getAttribute(
                        "data-student-code"
                    )
                );


            const student=
                filteredStudents.find(
                    function(item){

                        return(
                            item.code ===
                            code
                        );
                    }
                );


            if(
                !student ||
                !student.profileBackground
            ){

                return;
            }


            card.style.backgroundImage=

                "linear-gradient(" +

                "180deg," +

                "rgba(5,12,23,.12)," +

                "rgba(5,12,23,.86)" +

                ")," +

                'url("' +

                student.profileBackground
                .replace(
                    /"/g,
                    "%22"
                )

                +

                '")';

        }
    );
}


/* =========================================================
   STUDENT TABLE
========================================================= */

function renderTable(){

    if(
        !filteredStudents.length
    ){

        return`

            <div class="ranking-loading">
                Không tìm thấy học viên.
            </div>

        `;
    }


    const start=
        (
            currentPage -
            1
        )
        *
        ITEMS_PER_PAGE;


    const pageStudents=
        filteredStudents.slice(
            start,
            start +
            ITEMS_PER_PAGE
        );


    let html=`

        <div class="table-container">

            <table class="rank-table">

                <thead>

                    <tr>

                        <th>
                            Hạng
                        </th>

                        <th>
                            Học viên
                        </th>

                        <th>
                            ${UI.chart}
                            Chỉ số đang xếp
                        </th>

                        <th>
                            Vật phẩm
                        </th>

                        <th>
                            Tiến độ Rank
                        </th>


                    </tr>

                </thead>

                <tbody>

    `;


    pageStudents.forEach(
        function(student,index){

            const rank=
                start +
                index +
                1;


            const progress=
                getProgress(
                    student.experience
                );


            html+=`

                <tr>


                    <td class="rank-number">

                        ${
                            rank === 1
                            ?
                            UI.medal1
                            :
                            rank === 2
                            ?
                            UI.medal2
                            :
                            rank === 3
                            ?
                            UI.medal3
                            :
                            rank
                        }

                    </td>


                    <td>

                        <div class="student-main">

                            ${renderAvatar(
                                student,
                                false
                            )}


                            <div class="student-main-content">

                                ${renderStudentName(
                                    student,
                                    false
                                )}


                                <div class="student-meta-line">


                                    ${renderAchievementIcons(
                                        student
                                    )}


                                    ${
                                        student.isAdmin
                                        ?
                                        `
                                            <span class="admin-test-label">
                                                ADMIN TEST
                                            </span>
                                        `
                                        :
                                        `
                                            <span class="student-group">

                                                ${escapeHTML(
                                                    student.group ||
                                                    "—"
                                                )}

                                            </span>

                                            <span class="student-course">

                                                ${escapeHTML(
                                                    student.course ||
                                                    "—"
                                                )}

                                            </span>
                                        `
                                    }


                                    <span
                                        class="student-score-pill"
                                        title="Rank = bài hợp lệ + tổng điểm hợp lệ"
                                    >

                                        ${UI.star}

                                        ${formatDecimal(
                                            student.experience,
                                            2
                                        )}

                                    </span>


                                </div>

                            </div>

                        </div>

                    </td>


                    <td>

                        ${renderStudentMetric(
                            student
                        )}

                    </td>


                    <td>

                        ${renderDirectAssets(
                            student
                        )}

                    </td>


                    <td>

                        <div>

                            ${formatDecimal(
                                student.experience,
                                2
                            )}
                            Rank

                        </div>


                        <div class="level-progress">

                            <div
                                class="level-progress-fill"
                                style="
                                    width:${progress.percent.toFixed(1)}%;
                                "
                            ></div>

                        </div>

                        <span class="level-badge">

                            ${escapeHTML(
                                student.level.name
                            )}

                        </span>
                    </td>




                </tr>

            `;

        }
    );


    html+=`

                </tbody>

            </table>

        </div>

    `;


    return html;
}


/* =========================================================
   PAGINATION
========================================================= */

function renderPagination(){

    const totalPages=
        Math.ceil(
            filteredStudents.length /
            ITEMS_PER_PAGE
        );


    if(
        totalPages <=
        1
    ){

        return "";
    }


    let html=
        '<div class="pagination">';


    html+=`

        <button
            type="button"
            class="page-btn"
            data-page="${currentPage-1}"
            ${
                currentPage === 1
                ?
                "disabled"
                :
                ""
            }
        >

            ${UI.left}

        </button>

    `;


    const pages=[];


    for(
        let page=1;
        page<=totalPages;
        page++
    ){

        if(
            page === 1 ||
            page === totalPages ||
            Math.abs(
                page -
                currentPage
            )
            <=
            2
        ){

            pages.push(
                page
            );
        }
    }


    let previous=null;


    pages.forEach(
        function(page){

            if(
                previous !== null &&
                page -
                previous >
                1
            ){

                html+=`

                    <span class="page-info">

                        ${UI.ellipsis}

                    </span>

                `;
            }


            html+=`

                <button
                    type="button"
                    class="
                        page-btn
                        ${
                            page === currentPage
                            ?
                            "active"
                            :
                            ""
                        }
                    "
                    data-page="${page}"
                >

                    ${page}

                </button>

            `;


            previous=
                page;

        }
    );


    html+=`

        <button
            type="button"
            class="page-btn"
            data-page="${currentPage+1}"
            ${
                currentPage === totalPages
                ?
                "disabled"
                :
                ""
            }
        >

            ${UI.right}

        </button>


        <span class="page-info">

            Trang
            ${currentPage}
            /
            ${totalPages}

        </span>

    `;


    html+=
        "</div>";


    return html;
}


/* =========================================================
   RENDER
========================================================= */

function render(){

    const container=
        document.getElementById(
            "rankingContent"
        );


    if(
        !filteredStudents.length
    ){

        container.innerHTML=`

            <div class="ranking-loading">
                Không tìm thấy học viên phù hợp.
            </div>

        `;


        return;
    }


    container.innerHTML=

        renderTopThree()

        +

        renderTable()

        +

        renderPagination();


    hydrateEffects();

    hydrateTopBackgrounds();
}


/* =========================================================
   TEAM FILTER
========================================================= */

function applyTeamFilters(){

    teamRankingMode=
        document.getElementById(
            "teamRankingModeFilter"
        ).value
        ||
        "rank";


    selectedTeamCourse=
        normalizeCourse(
            document.getElementById(
                "teamCourseFilter"
            ).value
        );


    updateTeamFilterText();

    renderTeamRanking();
}


function clearTeamFilters(){

    teamRankingMode="rank";

    selectedTeamCourse="";


    document.getElementById(
        "teamRankingModeFilter"
    ).value=
        "rank";


    document.getElementById(
        "teamCourseFilter"
    ).value=
        "";


    updateTeamFilterText();

    renderTeamRanking();
}


/* =========================================================
   CLICK EVENTS
========================================================= */

document.addEventListener(
    "click",
    function(event){

        if(
            !event.target.closest(
                "#student-ranking-app"
            )
        ){

            return;
        }


        const sectionButton=
            event.target.closest(
                "[data-section-toggle]"
            );


        if(
            sectionButton
        ){

            const section=
                document.getElementById(
                    sectionButton.dataset
                    .sectionToggle
                );


            if(section){

                section.classList.toggle(
                    "open"
                );
            }


            return;
        }


        if(
            event.target.closest(
                "#applyFilterBtn"
            )
        ){

            applyFilters();

            return;
        }


        if(
            event.target.closest(
                "#clearFilters"
            )
        ){

            clearFilters();

            return;
        }


        if(
            event.target.closest(
                "#applyTeamFilterBtn"
            )
        ){

            applyTeamFilters();

            return;
        }


        if(
            event.target.closest(
                "#clearTeamFilterBtn"
            )
        ){

            clearTeamFilters();

            return;
        }


        const pageButton=
            event.target.closest(
                ".page-btn[data-page]"
            );


        if(pageButton){

            if(
                pageButton.disabled
            ){

                return;
            }


            const page=
                Number(
                    pageButton.dataset.page
                );


            const totalPages=
                Math.ceil(
                    filteredStudents.length /
                    ITEMS_PER_PAGE
                );


            if(
                page >= 1 &&
                page <= totalPages
            ){

                currentPage=
                    page;


                render();


                const section=
                    document.getElementById(
                        "studentRankingSection"
                    );


                if(section){

                    section.scrollIntoView(
                        {
                            behavior:"smooth",
                            block:"start"
                        }
                    );
                }
            }


            return;
        }

    }
);


/* =========================================================
   STUDENT FILTER EVENTS
========================================================= */

document.getElementById(
    "rankingModeFilter"
)
.addEventListener(
    "change",
    applyFilters
);


document.getElementById(
    "groupFilter"
)
.addEventListener(
    "change",
    applyFilters
);


document.getElementById(
    "courseFilter"
)
.addEventListener(
    "change",
    applyFilters
);


/* =========================================================
   TEAM FILTER EVENTS
========================================================= */

document.getElementById(
    "teamRankingModeFilter"
)
.addEventListener(
    "change",
    applyTeamFilters
);


document.getElementById(
    "teamCourseFilter"
)
.addEventListener(
    "change",
    applyTeamFilters
);


/* =========================================================
   START
========================================================= */

loadData();


}

})();
