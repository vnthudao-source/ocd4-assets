 (function(){

"use strict";


/* =========================================================
   KHÔNG KHỞI TẠO LẶP
========================================================= */

if(
    window.StudentRewardSystem &&
    window.StudentRewardSystem.version
){

    try{

        window.dispatchEvent(
            new CustomEvent(
                "studentRewardCoreReady",
                {
                    detail:{
                        version:
                            window.StudentRewardSystem.version
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
    "3.6.0";


/* =========================================================
   CONFIG
========================================================= */

const CONFIG={

    spreadsheetId:
        "1-IkcpEkKQtIavl5DIf6Sbwx3p0aAfnSS4HjT6dn1u_E",

    giftGid:
        "0",

    npcGid:
        "1348051654",


    /*
       Giao dịch Chợ phiên.
    */
    formSheetName:
        "PhieuDoi",


    /*
       Quà giáo viên tặng.
    */
    teacherGiftSheetName:
        "QuaTangGVCN",


    formConfirmValue:
        "Tôi xác nhận đổi món quà này",

    studentCsv:
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vRP5cc8duj1XrCXMrymo6Cj7aqIkWfX6bHxGeW-lXcSewfQXhM8fZ5rzbNIQ9mBeVuB8yYr_o1aBoYA/pub?output=csv",

    timeZone:
        "Asia/Ho_Chi_Minh",

    marketCurrency:
        "hongNgoc",

    avatarGiftPrefix:
        "Thẻ đổi Avatar",

    avatarFramePrefix:
        "Khung ",

    profileBackgroundPrefix:
        "Nền hồ sơ ",

    multitaskPotionGiftName:
        "Thuốc đa nhiệm",

    mysteryBoxGiftName:
        "Hộp quà bí ẩn",

    mysteryRewardColumn:
        "Quà nhận được",

    cacheTtl:
        15000
};


/* =========================================================
   CONSTANT
========================================================= */

const ONE_DAY=
    24 * 60 * 60 * 1000;


/* =========================================================
   ICONS
========================================================= */

const ICONS={

    user:
        String.fromCodePoint(
            0x1F464
        ),

    gift:
        String.fromCodePoint(
            0x1F381
        ),

    seed:
        String.fromCodePoint(
            0x1F331
        ),

    medal:
        String.fromCodePoint(
            0x1F3C5
        ),

    tree:
        String.fromCodePoint(
            0x1F333
        ),

    fire:
        String.fromCodePoint(
            0x1F525
        ),

    star:
        String.fromCodePoint(
            0x2B50
        ),

    target:
        String.fromCodePoint(
            0x1F3AF
        ),

    rocket:
        String.fromCodePoint(
            0x1F680
        ),

    sparkles:
        String.fromCodePoint(
            0x2728
        ),

    eagle:
        String.fromCodePoint(
            0x1F985
        ),

    crown:
        String.fromCodePoint(
            0x1F451
        ),

    box:
        String.fromCodePoint(
            0x1F4E6
        ),

    gem:
        String.fromCodePoint(
            0x1F48E
        )
};


/* =========================================================
   GEM TYPES
========================================================= */

const GEM_TYPES={

    hoangNgoc:{

        key:"hoangNgoc",

        displayName:
            "Hoàng Ngọc",

        className:
            "gem-hoang",

        image:
            "1w28sOWzHppnD9AzudfcwxLK9T7-DJMfp"
    },


    haiLamNgoc:{

        key:"haiLamNgoc",

        displayName:
            "Hải Lam Ngọc",

        className:
            "gem-hailam",

        image:
            "1ZMMPqWp5Qi-qUU5_rZoJXz7CnxUsmBV0"
    },


    thachAnhTim:{

        key:"thachAnhTim",

        displayName:
            "Thạch Anh Tím",

        className:
            "gem-thachanh",

        image:
            "1fFkMfitQcIj5lSBthnIttyEw3B1MwStw"
    },


    lamBaoThach:{

        key:"lamBaoThach",

        displayName:
            "Lam Bảo Thạch",

        className:
            "gem-lambao",

        image:
            "1aCYy67a4Zw-buU_Q6CaZH_zBtvRyM2AE"
    },


    lucThach:{

        key:"lucThach",

        displayName:
            "Lục Thạch",

        className:
            "gem-luc",

        image:
            "1xGRw4wu4YhavP57uN8VJuJkEWKQnQaq3"
    },


    hongNgoc:{

        key:"hongNgoc",

        displayName:
            "Hồng Ngọc",

        className:
            "gem-hong",

        image:
            "1H7QqdmKcZl-S39T8r7Kp8Vql2aKgHXVn"
    }
};


const GEM_ORDER=[

    "hoangNgoc",
    "haiLamNgoc",
    "thachAnhTim",
    "lamBaoThach",
    "lucThach",
    "hongNgoc"

];


/* =========================================================
   RARITY
========================================================= */

const RARITY_TYPES={

    phoThong:{

        key:"phoThong",

        displayName:
            "Phổ thông",

        gemType:
            "hoangNgoc",

        rank:1
    },


    trungPham:{

        key:"trungPham",

        displayName:
            "Trung phẩm",

        gemType:
            "haiLamNgoc",

        rank:2
    },


    trungThuongPham:{

        key:"trungThuongPham",

        displayName:
            "Trung thượng phẩm",

        gemType:
            "thachAnhTim",

        rank:3
    },


    thuongPham:{

        key:"thuongPham",

        displayName:
            "Thượng phẩm",

        gemType:
            "lamBaoThach",

        rank:4
    },


    caoCap:{

        key:"caoCap",

        displayName:
            "Cao cấp",

        gemType:
            "lucThach",

        rank:5
    },


    cucPham:{

        key:"cucPham",

        displayName:
            "Cực phẩm",

        gemType:
            "hongNgoc",

        rank:6
    }
};


const RARITY_ORDER=[

    "phoThong",
    "trungPham",
    "trungThuongPham",
    "thuongPham",
    "caoCap",
    "cucPham"

];


/* =========================================================
   GEM CONVERSION

   GIỮ ĐÚNG CÔNG THỨC HỆ THỐNG
========================================================= */

const GEM_CONVERSION={

    hoangNgocToLuc:
        5,

    haiLamNgocToLuc:
        4,

    thachAnhTimToLuc:
        3,

    lamBaoThachToLuc:
        2,

    lucThachToHong:
        3
};


/* =========================================================
   BASIC
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
        /\s+/g,
        " "
    );
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


function parseNumber(value){

    if(
        value === null ||
        value === undefined ||
        value === ""
    ){

        return 0;
    }


    let text=
        String(value)
        .trim()
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
        : 0;
}


function parseScore(value){

    if(
        value === null ||
        value === undefined
    ){

        return null;
    }


    const text=
        String(value)
        .trim();


    if(!text){

        return null;
    }


    const number=
        parseNumber(text);


    return Number.isFinite(number)
        ? number
        : null;
}


function formatNumber(value){

    const number=
        Number(
            value || 0
        );


    if(
        Number.isInteger(number)
    ){

        return String(number);
    }


    return String(
        Math.round(
            number * 100
        ) / 100
    );
}


/* =========================================================
   COLUMN
========================================================= */

function findColumn(
    headers,
    aliases
){

    const normalizedHeaders=
        (headers || [])
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


        const exact=
            normalizedHeaders
            .indexOf(
                wanted
            );


        if(
            exact >= 0
        ){

            return exact;
        }
    }


    for(
        let i=0;
        i<aliases.length;
        i++
    ){

        const wanted=
            normalizeText(
                aliases[i]
            );


        const found=
            normalizedHeaders
            .findIndex(
                function(header){

                    return header.includes(
                        wanted
                    );
                }
            );


        if(
            found >= 0
        ){

            return found;
        }
    }


    return -1;
}


/* =========================================================
   CSV
========================================================= */

function parseCSV(text){

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

            row.push(
                value
            );

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


            row.push(
                value
            );


            rows.push(
                row
            );


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

        row.push(
            value
        );

        rows.push(
            row
        );
    }


    return rows.filter(
        function(item){

            return item.some(
                function(cell){

                    return String(
                        cell || ""
                    )
                    .trim() !== "";
                }
            );
        }
    );
}


async function fetchCSV(url){

    const response=
        await fetch(
            url,
            {
                cache:"no-store"
            }
        );


    if(
        !response.ok
    ){

        throw new Error(
            "Không tải được dữ liệu CSV."
        );
    }


    return response.text();
}


async function fetchRows(url){

    return parseCSV(
        await fetchCSV(url)
    );
}


/* =========================================================
   SHEETS
========================================================= */

function sheetCsvUrl(
    gid,
    spreadsheetId
){

    const id=
        spreadsheetId ||
        CONFIG.spreadsheetId;


    return(
        "https://docs.google.com/spreadsheets/d/"
        +
        encodeURIComponent(id)
        +
        "/gviz/tq?tqx=out:csv&gid="
        +
        encodeURIComponent(
            String(gid)
        )
    );
}


function sheetNameCsvUrl(
    sheetName,
    spreadsheetId
){

    const id=
        spreadsheetId ||
        CONFIG.spreadsheetId;


    return(
        "https://docs.google.com/spreadsheets/d/"
        +
        encodeURIComponent(id)
        +
        "/gviz/tq?tqx=out:csv&sheet="
        +
        encodeURIComponent(
            sheetName
        )
    );
}


/* =========================================================
   DRIVE
========================================================= */

function extractDriveFileId(value){

    const text=
        String(
            value || ""
        )
        .trim();


    if(!text){
        return "";
    }


    if(
        /^[a-zA-Z0-9_-]{20,}$/
        .test(text)
    ){

        return text;
    }


    let match=
        text.match(
            /\/d\/([a-zA-Z0-9_-]+)/
        );


    if(match){
        return match[1];
    }


    match=
        text.match(
            /[?&]id=([a-zA-Z0-9_-]+)/
        );


    if(match){
        return match[1];
    }


    return "";
}


function convertDriveImageUrl(
    value,
    size
){

    const text=
        String(
            value || ""
        )
        .trim();


    if(!text){
        return "";
    }


    const id=
        extractDriveFileId(
            text
        );


    if(!id){
        return text;
    }


    const width=
        Math.max(
            96,
            Number(
                size || 500
            )
        );


    return(
        "https://drive.google.com/thumbnail?id="
        +
        encodeURIComponent(id)
        +
        "&sz=w"
        +
        Math.round(width)
    );
}


/* =========================================================
   DATE
========================================================= */

function parseVietnameseDate(value){

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


    match=
        text.match(
            /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})(?:[T\s]+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/
        );


    if(match){

        const date=
            new Date(

                Number(match[1]),

                Number(match[2])-1,

                Number(match[3]),

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


function getCalendarDayKey(date){

    if(!date){
        return "";
    }


    const y=
        date.getFullYear();


    const m=
        String(
            date.getMonth()+1
        )
        .padStart(
            2,
            "0"
        );


    const d=
        String(
            date.getDate()
        )
        .padStart(
            2,
            "0"
        );


    return(
        y+
        "-"+
        m+
        "-"+
        d
    );
}


/* =========================================================
   GEMS
========================================================= */

function createEmptyGems(){

    return{

        hoangNgoc:0,

        haiLamNgoc:0,

        thachAnhTim:0,

        lamBaoThach:0,

        lucThach:0,

        hongNgoc:0
    };
}


function cloneGems(gems){

    const result=
        createEmptyGems();


    GEM_ORDER.forEach(
        function(key){

            result[key]=
                Math.max(
                    0,
                    Number(
                        gems &&
                        gems[key] ||
                        0
                    )
                );
        }
    );


    return result;
}


function normalizeGemType(value){

    const normalized=
        normalizeText(value);


    if(!normalized){
        return null;
    }


    for(
        let i=0;
        i<GEM_ORDER.length;
        i++
    ){

        const key=
            GEM_ORDER[i];


        if(
            normalizeText(key)
            ===
            normalized
            ||
            normalizeText(
                GEM_TYPES[key]
                .displayName
            )
            ===
            normalized
        ){

            return key;
        }
    }


    const aliases={

        "hoang":
            "hoangNgoc",

        "hoang ngoc":
            "hoangNgoc",

        "hai lam":
            "haiLamNgoc",

        "hai lam ngoc":
            "haiLamNgoc",

        "thach anh":
            "thachAnhTim",

        "thach anh tim":
            "thachAnhTim",

        "lam bao":
            "lamBaoThach",

        "lam bao thach":
            "lamBaoThach",

        "luc":
            "lucThach",

        "luc thach":
            "lucThach",

        "hong":
            "hongNgoc",

        "hong ngoc":
            "hongNgoc"
    };


    return aliases[
        normalized
    ] || null;
}


/* =========================================================
   NORMALIZE GEM BALANCE

   ĐÂY LÀ HÀM CHUẨN DUY NHẤT
========================================================= */

function normalizeGemBalance(gems){

    const result=
        cloneGems(
            gems
        );


    function convertToLuc(
        key,
        divisor
    ){

        const amount=
            Math.floor(
                result[key]
            );


        const converted=
            Math.floor(
                amount /
                divisor
            );


        if(
            converted > 0
        ){

            result[key] -=
                converted *
                divisor;


            result.lucThach +=
                converted;
        }
    }


    /*
       5 Hoàng → 1 Lục
    */
    convertToLuc(
        "hoangNgoc",
        GEM_CONVERSION
        .hoangNgocToLuc
    );


    /*
       4 Hải Lam → 1 Lục
    */
    convertToLuc(
        "haiLamNgoc",
        GEM_CONVERSION
        .haiLamNgocToLuc
    );


    /*
       3 Thạch Anh Tím → 1 Lục
    */
    convertToLuc(
        "thachAnhTim",
        GEM_CONVERSION
        .thachAnhTimToLuc
    );


    /*
       2 Lam Bảo → 1 Lục
    */
    convertToLuc(
        "lamBaoThach",
        GEM_CONVERSION
        .lamBaoThachToLuc
    );


    /*
       3 Lục → 1 Hồng
    */
    const hong=
        Math.floor(
            result.lucThach /
            GEM_CONVERSION
            .lucThachToHong
        );


    if(
        hong > 0
    ){

        result.lucThach -=
            hong *
            GEM_CONVERSION
            .lucThachToHong;


        result.hongNgoc +=
            hong;
    }


    GEM_ORDER.forEach(
        function(key){

            result[key]=
                Math.max(
                    0,
                    Math.floor(
                        Number(
                            result[key] ||
                            0
                        )
                    )
                );
        }
    );


    return result;
}


/* =========================================================
   ADD GEM REWARD

   Mọi nguồn linh thạch đều phải đi qua hàm này.
========================================================= */

function addGemReward(
    gems,
    gemType,
    amount
){

    const result=
        cloneGems(
            gems
        );


    const key=
        normalizeGemType(
            gemType
        );


    const quantity=
        Math.floor(
            Number(
                amount || 0
            )
        );


    if(
        !key ||
        quantity <= 0
    ){

        return normalizeGemBalance(
            result
        );
    }


    result[key] +=
        quantity;


    return normalizeGemBalance(
        result
    );
}


function getGemValueInHong(
    gemType,
    amount
){

    const key=
        normalizeGemType(
            gemType
        );


    const quantity=
        Number(
            amount || 0
        );


    if(
        !key ||
        quantity <= 0
    ){

        return 0;
    }


    switch(key){

        case "hongNgoc":
            return quantity;

        case "lucThach":
            return quantity / 3;

        case "lamBaoThach":
            return quantity / 6;

        case "thachAnhTim":
            return quantity / 9;

        case "haiLamNgoc":
            return quantity / 12;

        case "hoangNgoc":
            return quantity / 15;

        default:
            return 0;
    }
}


/* =========================================================
   RARITY
========================================================= */

function normalizeRarity(value){

    const normalized=
        normalizeText(
            value
        );


    if(!normalized){
        return null;
    }


    for(
        let i=0;
        i<RARITY_ORDER.length;
        i++
    ){

        const key=
            RARITY_ORDER[i];


        if(
            normalizeText(key)
            ===
            normalized
            ||
            normalizeText(
                RARITY_TYPES[key]
                .displayName
            )
            ===
            normalized
        ){

            return key;
        }
    }


    const aliases={

        "pho thong":
            "phoThong",

        "trung pham":
            "trungPham",

        "trung thuong pham":
            "trungThuongPham",

        "thuong pham":
            "thuongPham",

        "cao cap":
            "caoCap",

        "cuc pham":
            "cucPham",

        "hoang ngoc":
            "phoThong",

        "hai lam ngoc":
            "trungPham",

        "thach anh tim":
            "trungThuongPham",

        "lam bao thach":
            "thuongPham",

        "luc thach":
            "caoCap",

        "hong ngoc":
            "cucPham"
    };


    return aliases[
        normalized
    ] || null;
}


function getRarityInfo(value){

    const key=
        normalizeRarity(
            value
        );


    return(
        key &&
        RARITY_TYPES[key]
    )
    ||
    null;
}


function getRarityGem(value){

    const rarity=
        getRarityInfo(
            value
        );


    return(
        rarity &&
        rarity.gemType
        &&
        GEM_TYPES[
            rarity.gemType
        ]
    )
    ||
    null;
}


/* =========================================================
   GEM MARKER
========================================================= */

function parseGemRewardMarker(description){

    const raw=
        String(
            description || ""
        );


    const match=
        raw.match(
            /\[\s*GEM\s*:\s*([^:\]]+)\s*:\s*(\d+)\s*\]/i
        );


    if(!match){

        return{

            isGemReward:false,

            gemType:null,

            amount:0,

            marker:"",

            cleanDescription:
                raw.trim()
        };
    }


    const gemType=
        normalizeGemType(
            match[1]
        );


    const amount=
        Math.max(
            0,
            Math.floor(
                Number(
                    match[2] ||
                    0
                )
            )
        );


    return{

        isGemReward:
            Boolean(
                gemType &&
                amount > 0
            ),

        gemType:
            gemType,

        amount:
            amount,

        marker:
            match[0],

        cleanDescription:
            raw
            .replace(
                match[0],
                ""
            )
            .replace(
                /\s{2,}/g,
                " "
            )
            .trim()
    };
}


function isGemRewardGift(gift){

    return Boolean(

        gift

        &&

        gift.isGemReward

        &&

        gift.rewardGemType

        &&

        Number(
            gift.rewardGemAmount ||
            0
        ) > 0
    );
}


/* =========================================================
   GIFTS
========================================================= */

function mapGiftRows(rows){

    if(
        !rows ||
        !rows.length
    ){

        return [];
    }


    const headers=
        rows[0]
        .map(
            normalizeText
        );


    let nameIndex=
        findColumn(
            headers,
            [
                "tên quà",
                "ten qua"
            ]
        );


    let imageIndex=
        findColumn(
            headers,
            [
                "icon",
                "hình ảnh",
                "hinh anh"
            ]
        );


    let descriptionIndex=
        findColumn(
            headers,
            [
                "mô tả",
                "mo ta"
            ]
        );


    let priceIndex=
        findColumn(
            headers,
            [
                "điểm cần thiết",
                "diem can thiet",
                "giá",
                "gia"
            ]
        );


    let rarityIndex=
        findColumn(
            headers,
            [
                "độ hiếm",
                "do hiem",
                "phẩm cấp",
                "pham cap"
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

    if(priceIndex < 0){
        priceIndex=3;
    }


    return rows
    .slice(1)
    .map(
        function(row,index){

            const name=
                String(
                    row[
                        nameIndex
                    ] || ""
                )
                .trim();


            const image=
                String(
                    row[
                        imageIndex
                    ] || ""
                )
                .trim();


            const rawDescription=
                String(
                    row[
                        descriptionIndex
                    ] || ""
                )
                .trim();


            const correctPrice=
                Math.max(
                    0,
                    parseNumber(
                        row[
                            priceIndex
                        ]
                    )
                );


            const rawRarity=
                rarityIndex >= 0
                ?
                String(
                    row[
                        rarityIndex
                    ] || ""
                )
                .trim()
                :
                "";


            const rarity=
                normalizeRarity(
                    rawRarity
                );


            const rarityInfo=
                rarity
                ?
                RARITY_TYPES[
                    rarity
                ]
                :
                null;


            const reward=
                parseGemRewardMarker(
                    rawDescription
                );


            return{

                index:
                    index+1,

                name,

                normalizedName:
                    normalizeText(
                        name
                    ),

                image,

                rawDescription,

                description:
                    reward.cleanDescription,

                correctPrice,

                cost:
                    correctPrice,

                rawRarity,

                rarity,

                rarityInfo,

                rarityGemType:
                    rarityInfo
                    ?
                    rarityInfo.gemType
                    :
                    null,

                gemType:
                    CONFIG.marketCurrency,

                isGemReward:
                    reward.isGemReward,

                rewardGemType:
                    reward.gemType,

                rewardGemAmount:
                    reward.amount,

                gemReward:
                    reward.isGemReward
                    ?
                    {
                        gemType:
                            reward.gemType,

                        amount:
                            reward.amount
                    }
                    :
                    null,

                rewardMarker:
                    reward.marker
            };
        }
    )
    .filter(
        function(gift){

            return Boolean(
                gift.name
            );
        }
    );
}


function createGiftMap(gifts){

    const map={};


    (gifts || [])
    .forEach(
        function(gift){

            map[
                normalizeText(
                    gift.name
                )
            ]=
                gift;
        }
    );


    return map;
}


/* =========================================================
   ECONOMY
========================================================= */

function analyzeGemOfferEconomy(
    gift,
    price
){

    const paid=
        Number(
            price ||
            gift &&
            gift.correctPrice ||
            0
        );


    if(
        !isGemRewardGift(
            gift
        )
    ){

        return{

            isGemReward:false,

            paidHong:
                paid,

            rewardHongValue:0,

            difference:0,

            ratio:0,

            type:"item"
        };
    }


    const rewardValue=
        getGemValueInHong(

            gift.rewardGemType,

            gift.rewardGemAmount
        );


    const difference=
        rewardValue -
        paid;


    let type=
        "break-even";


    if(
        difference > 0.000001
    ){

        type=
            "profit";

    }else if(
        difference < -0.000001
    ){

        type=
            "loss";
    }


    return{

        isGemReward:true,

        paidHong:
            paid,

        rewardHongValue:
            rewardValue,

        difference,

        ratio:
            paid > 0
            ?
            rewardValue /
            paid
            :
            0,

        type
    };
}


/* =========================================================
   MYSTERY
========================================================= */

function isMysteryBoxGiftName(value){

    const name=
        normalizeText(
            value
        );


    const configured=
        normalizeText(
            CONFIG.mysteryBoxGiftName
        );


    return(
        name === configured
        ||
        name.startsWith(
            configured+" "
        )
    );
}


/* =========================================================
   DEAL
========================================================= */

function sanitizeDealId(value){

    return String(
        value || ""
    )
    .trim()
    .replace(
        /[^a-zA-Z0-9._:-]/g,
        ""
    )
    .slice(
        0,
        120
    );
}


function createDealMarker(
    dealId
){

    const clean=
        sanitizeDealId(
            dealId
        );


    return clean
    ?
    "[DEAL:"+clean+"]"
    :
    "";
}


function parseDealMarker(value){

    const raw=
        String(
            value || ""
        );


    const match=
        raw.match(
            /\[\s*DEAL\s*:\s*([a-zA-Z0-9._:-]+)\s*\]/i
        );


    if(!match){

        return{

            hasDeal:false,

            dealId:"",

            marker:"",

            cleanValue:
                raw.trim()
        };
    }


    const dealId=
        sanitizeDealId(
            match[1]
        );


    return{

        hasDeal:
            Boolean(
                dealId
            ),

        dealId,

        marker:
            match[0],

        cleanValue:
            raw
            .replace(
                match[0],
                ""
            )
            .replace(
                /\s{2,}/g,
                " "
            )
            .trim()
    };
}


function hashDealText(text){

    let hash=
        2166136261;


    const value=
        String(
            text || ""
        );


    for(
        let i=0;
        i<value.length;
        i++
    ){

        hash ^=
            value.charCodeAt(i);


        hash=
            Math.imul(
                hash,
                16777619
            );
    }


    return hash >>> 0;
}


function createDealId(
    dayKey,
    merchantKey,
    slot,
    giftName
){

    const merchant=
        normalizeText(
            merchantKey
        )
        .replace(
            /[^a-z0-9]+/g,
            "-"
        )
        .replace(
            /^-+|-+$/g,
            ""
        )
        ||
        "npc";


    const raw=

        String(
            dayKey || ""
        )

        +"|"+

        merchant

        +"|"+

        String(
            slot || 0
        )

        +"|"+

        normalizeText(
            giftName
        );


    const hash=
        hashDealText(
            raw
        )
        .toString(36);


    return sanitizeDealId(

        String(
            dayKey || ""
        )
        .replace(
            /[^0-9]/g,
            ""
        )

        +

        "-"

        +

        merchant

        +

        "-"

        +

        String(
            slot || 0
        )

        +

        "-"

        +

        hash
    );
}


function getConsumedDealIds(
    transactions
){

    const result=
        new Set();


    (transactions || [])
    .forEach(
        function(item){

            if(
                item &&
                item.dealId &&
                item.accountingStatus ===
                "valid"
            ){

                result.add(
                    sanitizeDealId(
                        item.dealId
                    )
                );
            }
        }
    );


    return result;
}


/* =========================================================
   FORM VALUE
========================================================= */

function createFormGiftValue(
    giftName,
    price,
    thirdArg,
    fourthArg
){

    let dealId="";


    const oldGemType=
        normalizeGemType(
            thirdArg
        );


    if(fourthArg){

        dealId=
            fourthArg;

    }else if(
        thirdArg &&
        !oldGemType
    ){

        dealId=
            thirdArg;
    }


    let result=

        String(
            giftName || ""
        )
        .trim()

        +

        " - "

        +

        formatNumber(
            price
        )

        +

        " "

        +

        GEM_TYPES[
            CONFIG.marketCurrency
        ].displayName;


    const marker=
        createDealMarker(
            dealId
        );


    if(marker){

        result +=
            " "+
            marker;
    }


    return result;
}


function parseFormGiftValue(
    value,
    giftMap
){

    const raw=
        String(
            value || ""
        )
        .trim();


    const deal=
        parseDealMarker(
            raw
        );


    const cleanRaw=
        deal.cleanValue;


    const map=
        giftMap ||
        {};


    if(!cleanRaw){

        return{

            giftName:"",

            gift:null,

            price:0,

            gemType:null,

            dealId:
                deal.dealId,

            hasDeal:
                deal.hasDeal,

            dealMarker:
                deal.marker,

            format:
                "invalid"
        };
    }


    const separator=
        " - ";


    const splitIndex=
        cleanRaw.lastIndexOf(
            separator
        );


    if(
        splitIndex > 0
    ){

        const giftName=
            cleanRaw
            .slice(
                0,
                splitIndex
            )
            .trim();


        const transactionText=
            cleanRaw
            .slice(
                splitIndex+
                separator.length
            )
            .trim();


        const match=
            transactionText.match(
                /^([0-9]+(?:[.,][0-9]+)?)\s+(.+)$/
            );


        if(match){

            const price=
                parseNumber(
                    match[1]
                );


            const parsedGemType=
                normalizeGemType(
                    match[2]
                );


            const gift=
                map[
                    normalizeText(
                        giftName
                    )
                ]
                ||
                null;


            if(
                price > 0 &&
                parsedGemType
            ){

                return{

                    giftName:
                        gift
                        ?
                        gift.name
                        :
                        giftName,

                    gift,

                    price,

                    gemType:
                        parsedGemType,

                    dealId:
                        deal.dealId,

                    hasDeal:
                        deal.hasDeal,

                    dealMarker:
                        deal.marker,

                    format:
                        "priced"
                };
            }
        }
    }


    const directGift=
        map[
            normalizeText(
                cleanRaw
            )
        ]
        ||
        null;


    if(directGift){

        return{

            giftName:
                directGift.name,

            gift:
                directGift,

            price:
                Number(
                    directGift.correctPrice ||
                    0
                ),

            gemType:
                CONFIG.marketCurrency,

            dealId:
                deal.dealId,

            hasDeal:
                deal.hasDeal,

            dealMarker:
                deal.marker,

            format:
                "legacy"
        };
    }


    return{

        giftName:
            cleanRaw,

        gift:null,

        price:0,

        gemType:null,

        dealId:
            deal.dealId,

        hasDeal:
            deal.hasDeal,

        dealMarker:
            deal.marker,

        format:
            "invalid"
    };
}


/* =========================================================
   PHIEUDOI COLUMNS
========================================================= */

function detectFormColumns(rows){

    if(
        !rows ||
        !rows.length
    ){

        return {};
    }


    const headers=
        rows[0]
        .map(
            normalizeText
        );


    function column(
        aliases,
        fallback
    ){

        const found=
            findColumn(
                headers,
                aliases
            );


        return found >= 0
        ?
        found
        :
        fallback;
    }


    return{

        timestamp:
            column(
                [
                    "dấu thời gian",
                    "dau thoi gian",
                    "timestamp"
                ],
                0
            ),

        name:
            column(
                [
                    "họ tên",
                    "ho ten",
                    "họ và tên",
                    "ho va ten"
                ],
                1
            ),

        code:
            column(
                [
                    "mã học viên",
                    "ma hoc vien"
                ],
                2
            ),

        gift:
            column(
                [
                    "món quà muốn đổi",
                    "mon qua muon doi"
                ],
                3
            ),

        confirm:
            column(
                [
                    "xác nhận",
                    "xac nhan"
                ],
                4
            ),

        isMystery:
            column(
                [
                    "là hộp bí ẩn",
                    "la hop bi an"
                ],
                5
            ),

        mysteryCode:
            column(
                [
                    "mã quay",
                    "ma quay"
                ],
                6
            ),

        mysteryRoll:
            column(
                [
                    "số quay",
                    "so quay"
                ],
                7
            ),

        mysteryReward:
            column(
                [
                    "quà nhận được",
                    "qua nhan duoc"
                ],
                8
            ),

        mysteryStatus:
            column(
                [
                    "trạng thái",
                    "trang thai"
                ],
                9
            )
    };
}


/* =========================================================
   MAP PHIEUDOI
========================================================= */

function mapFormResponseRows(
    rows,
    gifts
){

    if(
        !rows ||
        rows.length < 2
    ){

        return [];
    }


    const giftMap=
        createGiftMap(
            gifts
        );


    const columns=
        detectFormColumns(
            rows
        );


    const confirmWanted=
        normalizeText(
            CONFIG.formConfirmValue
        );


    return rows
    .slice(1)
    .map(
        function(row,index){

            const rawGiftValue=
                String(
                    row[
                        columns.gift
                    ] || ""
                )
                .trim();


            const parsed=
                parseFormGiftValue(
                    rawGiftValue,
                    giftMap
                );


            const code=
                normalizeCode(
                    row[
                        columns.code
                    ]
                );


            const confirmation=
                String(
                    row[
                        columns.confirm
                    ] || ""
                )
                .trim();


            const confirmed=
                normalizeText(
                    confirmation
                )
                ===
                confirmWanted;


            const mysteryFlag=
                normalizeText(
                    row[
                        columns.isMystery
                    ] || ""
                );


            const mysteryRewardName=
                String(
                    row[
                        columns.mysteryReward
                    ] || ""
                )
                .trim();


            const isMysteryBox=

                isMysteryBoxGiftName(
                    parsed.giftName
                )

                ||

                mysteryFlag ===
                "true"

                ||

                mysteryFlag ===
                "co"

                ||

                mysteryFlag ===
                "yes";


            const mysteryRewardGift=
                mysteryRewardName
                ?
                (
                    giftMap[
                        normalizeText(
                            mysteryRewardName
                        )
                    ]
                    ||
                    null
                )
                :
                null;


            return{

                index:
                    index+1,

                rowIndex:
                    index+2,

                transactionType:
                    "redemption",

                timestamp:
                    String(
                        row[
                            columns.timestamp
                        ] || ""
                    )
                    .trim(),

                studentName:
                    String(
                        row[
                            columns.name
                        ] || ""
                    )
                    .trim(),

                code,

                confirmation,

                confirmed,

                rawGiftValue,

                giftName:
                    parsed.giftName,

                gift:
                    parsed.gift,

                price:
                    Number(
                        parsed.price ||
                        0
                    ),

                gemType:
                    parsed.gemType,

                format:
                    parsed.format,

                dealId:
                    parsed.dealId ||
                    "",

                hasDeal:
                    Boolean(
                        parsed.hasDeal
                    ),

                dealMarker:
                    parsed.dealMarker ||
                    "",

                isGemReward:
                    isGemRewardGift(
                        parsed.gift
                    ),

                isMysteryBox,

                mysteryRewardName,

                mysteryRewardGift,

                mysteryCode:
                    String(
                        row[
                            columns.mysteryCode
                        ] || ""
                    )
                    .trim(),

                mysteryRoll:
                    String(
                        row[
                            columns.mysteryRoll
                        ] || ""
                    )
                    .trim(),

                mysteryStatus:
                    String(
                        row[
                            columns.mysteryStatus
                        ] || ""
                    )
                    .trim()
            };
        }
    )
    .filter(
        function(item){

            return(
                item.confirmed
                &&
                Boolean(
                    item.code
                )
                &&
                Boolean(
                    item.giftName
                )
            );
        }
    );
}


/* =========================================================
   QUATANGGVCN COLUMNS
========================================================= */

function detectTeacherGiftColumns(rows){

    if(
        !rows ||
        !rows.length
    ){

        return {};
    }


    const headers=
        rows[0]
        .map(
            normalizeText
        );


    function column(
        aliases,
        fallback
    ){

        const found=
            findColumn(
                headers,
                aliases
            );


        return found >= 0
        ?
        found
        :
        fallback;
    }


    return{

        timestamp:
            column(
                [
                    "dấu thời gian",
                    "dau thoi gian"
                ],
                0
            ),

        scope:
            column(
                [
                    "phạm vi tặng",
                    "pham vi tang"
                ],
                1
            ),

        code:
            column(
                [
                    "mã học viên",
                    "ma hoc vien"
                ],
                2
            ),

        group:
            column(
                [
                    "tổ",
                    "to"
                ],
                3
            ),

        rewardType:
            column(
                [
                    "loại phần thưởng",
                    "loai phan thuong"
                ],
                4
            ),

        giftName:
            column(
                [
                    "tên vật phẩm",
                    "ten vat pham"
                ],
                5
            ),

        gemType:
            column(
                [
                    "loại linh thạch",
                    "loai linh thach"
                ],
                6
            ),

        quantity:
            column(
                [
                    "số lượng",
                    "so luong"
                ],
                7
            ),

        reason:
            column(
                [
                    "lý do tặng",
                    "ly do tang"
                ],
                8
            ),

        giver:
            column(
                [
                    "người tặng",
                    "nguoi tang"
                ],
                9
            ),

        status:
            column(
                [
                    "trạng thái",
                    "trang thai"
                ],
                10
            ),

        course:
            column(
                [
                    "khóa",
                    "khoa"
                ],
                11
            )
    };
}


/* =========================================================
   QUÀ GVCN ACTIVE
========================================================= */

function isTeacherGiftActive(status){

    const value=
        normalizeText(
            status
        );


    if(!value){

        /*
           Dữ liệu cũ không trạng thái:
           mặc định còn hiệu lực.
        */
        return true;
    }


    return ![

        "het hieu luc",

        "da huy",

        "huy",

        "khong hieu luc",

        "thu hoi",

        "da thu hoi"

    ]
    .some(
        function(word){

            return value.includes(
                word
            );
        }
    );
}


/* =========================================================
   DETECT TEACHER GEM REWARD

   HỖ TRỢ 2 KIỂU:

   1. Loại phần thưởng = Linh thạch
      Loại linh thạch = Hải Lam Ngọc
      Số lượng = 4

   2. Tên vật phẩm là món trong QuaTang có:
      [GEM:haiLamNgoc:4]

      Nếu Số lượng = 2 túi:
      → nhận 8 Hải Lam.
========================================================= */

function resolveTeacherGemReward(
    rewardType,
    gemTypeText,
    quantity,
    gift
){

    const type=
        normalizeText(
            rewardType
        );


    const count=
        Math.max(
            1,
            Math.floor(
                Number(
                    quantity || 1
                )
            )
        );


    /*
       Cách 1:
       Form GVCN chọn trực tiếp loại linh thạch.
    */
    const directGem=
        normalizeGemType(
            gemTypeText
        );


    if(
        directGem &&
        (
            type.includes(
                "linh thach"
            )
            ||
            !type
        )
    ){

        return{

            isGemReward:true,

            gemType:
                directGem,

            amount:
                count,

            source:
                "teacher-direct-gem"
        };
    }


    /*
       Cách 2:
       Vật phẩm/túi linh thạch trong QuaTang.
    */
    if(
        gift &&
        isGemRewardGift(
            gift
        )
    ){

        return{

            isGemReward:true,

            gemType:
                gift.rewardGemType,

            /*
               2 túi × 4 ngọc/túi = 8
            */
            amount:
                Math.max(
                    1,
                    Number(
                        gift.rewardGemAmount ||
                        0
                    )
                )
                *
                count,

            source:
                "teacher-gem-bag"
        };
    }


    return{

        isGemReward:false,

        gemType:null,

        amount:0,

        source:""
    };
}


/* =========================================================
   MAP QUATANGGVCN
========================================================= */

function mapTeacherGiftRows(
    rows,
    gifts
){

    if(
        !rows ||
        rows.length < 2
    ){

        return [];
    }


    const columns=
        detectTeacherGiftColumns(
            rows
        );


    const giftMap=
        createGiftMap(
            gifts
        );


    return rows
    .slice(1)
    .map(
        function(row,index){

            const code=
                normalizeCode(
                    row[
                        columns.code
                    ] || ""
                );


            const giftNameRaw=
                String(
                    row[
                        columns.giftName
                    ] || ""
                )
                .trim();


            const gift=
                giftMap[
                    normalizeText(
                        giftNameRaw
                    )
                ]
                ||
                null;


            const quantity=
                Math.max(
                    1,
                    Math.floor(
                        parseNumber(
                            row[
                                columns.quantity
                            ] || 1
                        )
                    )
                );


            const rewardType=
                String(
                    row[
                        columns.rewardType
                    ] || ""
                )
                .trim();


            const gemTypeText=
                String(
                    row[
                        columns.gemType
                    ] || ""
                )
                .trim();


            const status=
                String(
                    row[
                        columns.status
                    ] || ""
                )
                .trim();


            const gemReward=
                resolveTeacherGemReward(

                    rewardType,

                    gemTypeText,

                    quantity,

                    gift
                );


            return{

                index:
                    index+1,

                rowIndex:
                    index+2,

                transactionType:
                    gemReward.isGemReward
                    ?
                    "teacher-gem"
                    :
                    "teacher-item",

                timestamp:
                    String(
                        row[
                            columns.timestamp
                        ] || ""
                    )
                    .trim(),

                code,

                scope:
                    String(
                        row[
                            columns.scope
                        ] || ""
                    )
                    .trim(),

                group:
                    String(
                        row[
                            columns.group
                        ] || ""
                    )
                    .trim(),

                course:
                    String(
                        row[
                            columns.course
                        ] || ""
                    )
                    .trim(),

                rewardType,

                giftName:
                    gift
                    ?
                    gift.name
                    :
                    giftNameRaw,

                gift,

                quantity,

                teacherGemType:
                    gemReward.gemType,

                teacherGemAmount:
                    gemReward.amount,

                teacherGemSource:
                    gemReward.source,

                isTeacherGemReward:
                    gemReward.isGemReward,

                reason:
                    String(
                        row[
                            columns.reason
                        ] || ""
                    )
                    .trim(),

                giver:
                    String(
                        row[
                            columns.giver
                        ] || ""
                    )
                    .trim(),

                status,

                active:
                    isTeacherGiftActive(
                        status
                    ),

                ownershipSource:
                    gemReward.isGemReward
                    ?
                    "teacher-gem"
                    :
                    "teacher-gift"
            };
        }
    )
    .filter(
        function(item){

            return(
                Boolean(
                    item.code
                )
                &&
                item.active
                &&
                (
                    item.isTeacherGemReward
                    ||
                    Boolean(
                        item.giftName
                    )
                )
            );
        }
    );
}


/* =========================================================
   TEACHER GEM TRANSACTIONS

   Chuyển quà linh thạch GVCN thành transaction đặc biệt.

   KHÔNG có giá.
   KHÔNG trừ Hồng Ngọc.
========================================================= */

function buildTeacherGemTransactions(
    teacherRows
){

    return(
        teacherRows ||
        []
    )
    .filter(
        function(item){

            return(
                item.isTeacherGemReward
                &&
                item.teacherGemType
                &&
                Number(
                    item.teacherGemAmount ||
                    0
                ) > 0
            );
        }
    )
    .map(
        function(item){

            return{

                index:
                    item.index,

                rowIndex:
                    item.rowIndex,

                transactionType:
                    "teacher-gem",

                timestamp:
                    item.timestamp,

                code:
                    item.code,

                studentName:"",

                giftName:
                    item.giftName ||
                    (
                        "Tặng "+
                        GEM_TYPES[
                            item.teacherGemType
                        ].displayName
                    ),

                gift:
                    item.gift ||
                    null,

                rewardGemType:
                    item.teacherGemType,

                rewardGemAmount:
                    Number(
                        item.teacherGemAmount
                    ),

                /*
                   Không phải giao dịch mua.
                */
                price:0,

                gemType:null,

                dealId:"",

                accountingStatus:
                    "pending",

                ownershipSource:
                    "teacher-gem",

                reason:
                    item.reason,

                giver:
                    item.giver,

                teacherGiftRow:
                    item
            };
        }
    );
}


/* =========================================================
   TEACHER OWNED ITEMS

   Túi linh thạch KHÔNG xuất hiện trong kho vật phẩm.
   Nó được chuyển thành số dư linh thạch.
========================================================= */

function buildTeacherOwnedItems(
    teacherRows
){

    const result=[];


    (
        teacherRows ||
        []
    )
    .forEach(
        function(item){

            /*
               Quà linh thạch:
               không tạo item.
            */
            if(
                item.isTeacherGemReward
            ){

                return;
            }


            if(
                !item.gift
            ){

                return;
            }


            /*
               Hộp bí ẩn do GVCN tặng
               chưa sử dụng cơ chế quay.
            */
            if(
                isMysteryBoxGiftName(
                    item.gift.name
                )
            ){

                return;
            }


            result.push({

                index:
                    item.index,

                rowIndex:
                    item.rowIndex,

                timestamp:
                    item.timestamp,

                studentName:"",

                code:
                    item.code,

                giftName:
                    item.gift.name,

                gift:
                    item.gift,

                image:
                    item.gift.image ||
                    "",

                description:
                    item.gift.description ||
                    "",

                rarity:
                    item.gift.rarity ||
                    null,

                rarityInfo:
                    item.gift.rarityInfo ||
                    null,

                rarityGemType:
                    item.gift.rarityGemType ||
                    null,

                /*
                   Giá 0 vì được GVCN tặng.
                */
                price:0,

                gemType:null,

                quantity:
                    Math.max(
                        1,
                        Number(
                            item.quantity ||
                            1
                        )
                    ),

                format:
                    "teacher-gift",

                ownershipSource:
                    "teacher-gift",

                accountingStatus:
                    "valid",

                reason:
                    item.reason ||
                    "",

                giver:
                    item.giver ||
                    "GVCN",

                status:
                    item.status ||
                    "",

                group:
                    item.group ||
                    "",

                course:
                    item.course ||
                    ""
            });
        }
    );


    return result;
}


/* =========================================================
   MAP TEACHER ITEMS
========================================================= */

function buildTeacherOwnedItemMap(
    teacherRows
){

    const map=
        new Map();


    buildTeacherOwnedItems(
        teacherRows
    )
    .forEach(
        function(item){

            const code=
                normalizeCode(
                    item.code
                );


            if(!code){
                return;
            }


            if(
                !map.has(code)
            ){

                map.set(
                    code,
                    []
                );
            }


            map.get(code)
            .push(item);
        }
    );


    return map;
}


/* =========================================================
   MAP TEACHER GEM
========================================================= */

function buildTeacherGemTransactionMap(
    teacherRows
){

    const map=
        new Map();


    buildTeacherGemTransactions(
        teacherRows
    )
    .forEach(
        function(item){

            const code=
                normalizeCode(
                    item.code
                );


            if(!code){
                return;
            }


            if(
                !map.has(code)
            ){

                map.set(
                    code,
                    []
                );
            }


            map.get(code)
            .push(item);
        }
    );


    return map;
}


/* =========================================================
   SORT TRANSACTIONS
========================================================= */

function sortTransactionsChronologically(
    transactions
){

    return(
        transactions ||
        []
    )
    .slice()
    .sort(
        function(a,b){

            const da=
                parseVietnameseDate(
                    a.timestamp
                );


            const db=
                parseVietnameseDate(
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
                    a.rowIndex ||
                    a.index ||
                    0
                )

                -

                Number(
                    b.rowIndex ||
                    b.index ||
                    0
                )
            );
        }
    );
}


/* =========================================================
   AFFORD
========================================================= */

function canAffordTransaction(
    balance,
    gemType,
    price
){

    const key=
        normalizeGemType(
            gemType
        );


    const amount=
        Number(
            price || 0
        );


    if(
        !key ||
        amount <= 0
    ){

        return false;
    }


    return(
        Number(
            balance &&
            balance[key] ||
            0
        )
        >=
        amount
    );
}


/* =========================================================
   PROCESS TRANSACTIONS v3.6.0

   QUAN TRỌNG:

   Teacher Gem:
   → cộng vào balance
   → normalize ngay
   → không trừ tiền
========================================================= */

function processTransactions(
    startingGems,
    transactions
){

    const normalizedStart=
        normalizeGemBalance(
            startingGems ||
            createEmptyGems()
        );


    let balance=
        cloneGems(
            normalizedStart
        );


    const validTransactions=[];
    const rejectedTransactions=[];
    const ownedItems=[];
    const gemRewards=[];

    const consumedDealIds=
        new Set();


    const ordered=
        sortTransactionsChronologically(
            transactions
        );


    ordered.forEach(
        function(item){


            /* =================================================
               QUÀ LINH THẠCH GVCN
            ================================================= */

            if(
                item.transactionType ===
                "teacher-gem"
            ){

                const gemType=
                    normalizeGemType(
                        item.rewardGemType
                    );


                const amount=
                    Math.max(
                        0,
                        Math.floor(
                            Number(
                                item.rewardGemAmount ||
                                0
                            )
                        )
                    );


                if(
                    !gemType ||
                    amount <= 0
                ){

                    rejectedTransactions.push(

                        Object.assign(
                            {},
                            item,
                            {
                                accountingStatus:
                                    "rejected-invalid-teacher-gem",

                                rejectionReason:
                                    "invalid-teacher-gem"
                            }
                        )
                    );


                    return;
                }


                const balanceBefore=
                    cloneGems(
                        balance
                    );


                /*
                   Cộng và gộp ngay.
                */
                balance=
                    addGemReward(
                        balance,
                        gemType,
                        amount
                    );


                const reward={

                    index:
                        item.index,

                    rowIndex:
                        item.rowIndex,

                    timestamp:
                        item.timestamp,

                    code:
                        item.code,

                    source:
                        "teacher-gift",

                    sourceGiftName:
                        item.giftName,

                    giftName:
                        item.giftName,

                    gemType,

                    amount,

                    giver:
                        item.giver ||
                        "GVCN"
                };


                gemRewards.push(
                    reward
                );


                validTransactions.push(

                    Object.assign(
                        {},
                        item,
                        {

                            accountingStatus:
                                "valid",

                            balanceBefore,

                            balanceAfter:
                                cloneGems(
                                    balance
                                ),

                            grantedGemReward:
                                reward
                        }
                    )
                );


                return;
            }


            /* =================================================
               GIAO DỊCH CHỢ PHIÊN
            ================================================= */

            const price=
                Number(
                    item.price ||
                    0
                );


            const gemType=
                normalizeGemType(
                    item.gemType
                );


            const dealId=
                sanitizeDealId(
                    item.dealId ||
                    ""
                );


            const balanceBefore=
                cloneGems(
                    balance
                );


            if(
                !item.gift ||
                !gemType ||
                price <= 0
            ){

                rejectedTransactions.push(

                    Object.assign(
                        {},
                        item,
                        {

                            dealId,

                            accountingStatus:
                                "rejected-invalid",

                            rejectionReason:
                                "invalid-transaction",

                            balanceBefore,

                            balanceAfter:
                                cloneGems(
                                    balance
                                )
                        }
                    )
                );


                return;
            }


            if(
                dealId &&
                consumedDealIds.has(
                    dealId
                )
            ){

                rejectedTransactions.push(

                    Object.assign(
                        {},
                        item,
                        {

                            dealId,

                            accountingStatus:
                                "rejected-duplicate-deal",

                            rejectionReason:
                                "duplicate-deal",

                            balanceBefore,

                            balanceAfter:
                                cloneGems(
                                    balance
                                )
                        }
                    )
                );


                return;
            }


            if(
                !canAffordTransaction(
                    balance,
                    gemType,
                    price
                )
            ){

                rejectedTransactions.push(

                    Object.assign(
                        {},
                        item,
                        {

                            dealId,

                            accountingStatus:
                                "rejected-insufficient-balance",

                            rejectionReason:
                                "insufficient-balance",

                            balanceBefore,

                            balanceAfter:
                                cloneGems(
                                    balance
                                )
                        }
                    )
                );


                return;
            }


            balance[gemType] -=
                price;


            let grantedGemReward=
                null;


            /* =================================================
               HỘP BÍ ẨN
            ================================================= */

            if(
                item.isMysteryBox
            ){

                const rewardGift=
                    item.mysteryRewardGift;


                if(
                    rewardGift &&
                    isGemRewardGift(
                        rewardGift
                    )
                ){

                    grantedGemReward={

                        index:
                            item.index,

                        timestamp:
                            item.timestamp,

                        code:
                            item.code,

                        dealId,

                        source:
                            "mystery-box",

                        sourceGiftName:
                            item.giftName,

                        giftName:
                            rewardGift.name,

                        gemType:
                            rewardGift.rewardGemType,

                        amount:
                            Number(
                                rewardGift.rewardGemAmount ||
                                0
                            )
                    };


                    /*
                       Cộng → gộp chung.
                    */
                    balance=
                        addGemReward(

                            balance,

                            grantedGemReward
                            .gemType,

                            grantedGemReward
                            .amount
                        );


                    gemRewards.push(
                        grantedGemReward
                    );
                }
            }


            /* =================================================
               ĐỔI GÓI LINH THẠCH TRỰC TIẾP
            ================================================= */

            else if(
                isGemRewardGift(
                    item.gift
                )
            ){

                grantedGemReward={

                    index:
                        item.index,

                    timestamp:
                        item.timestamp,

                    code:
                        item.code,

                    dealId,

                    source:
                        "redemption",

                    sourceGiftName:
                        item.giftName,

                    giftName:
                        item.giftName,

                    gemType:
                        item.gift
                        .rewardGemType,

                    amount:
                        Number(
                            item.gift
                            .rewardGemAmount ||
                            0
                        )
                };


                balance=
                    addGemReward(

                        balance,

                        grantedGemReward
                        .gemType,

                        grantedGemReward
                        .amount
                    );


                gemRewards.push(
                    grantedGemReward
                );
            }


            balance=
                normalizeGemBalance(
                    balance
                );


            if(dealId){

                consumedDealIds.add(
                    dealId
                );
            }


            const validItem=
                Object.assign(
                    {},
                    item,
                    {

                        dealId,

                        accountingStatus:
                            "valid",

                        balanceBefore,

                        balanceAfter:
                            cloneGems(
                                balance
                            ),

                        grantedGemReward
                    }
                );


            validTransactions.push(
                validItem
            );


            /* =================================================
               OWNED FROM MYSTERY
            ================================================= */

            if(
                item.isMysteryBox
            ){

                const rewardGift=
                    item.mysteryRewardGift;


                if(
                    rewardGift &&
                    !isMysteryBoxGiftName(
                        rewardGift.name
                    )
                    &&
                    !isGemRewardGift(
                        rewardGift
                    )
                ){

                    ownedItems.push({

                        index:
                            item.index,

                        timestamp:
                            item.timestamp,

                        studentName:
                            item.studentName,

                        code:
                            item.code,

                        dealId,

                        giftName:
                            rewardGift.name,

                        gift:
                            rewardGift,

                        image:
                            rewardGift.image ||
                            "",

                        description:
                            rewardGift.description ||
                            "",

                        rarity:
                            rewardGift.rarity ||
                            null,

                        rarityInfo:
                            rewardGift.rarityInfo ||
                            null,

                        rarityGemType:
                            rewardGift.rarityGemType ||
                            null,

                        quantity:1,

                        price:0,

                        gemType:null,

                        format:
                            "mystery-reward",

                        ownershipSource:
                            "mystery-box",

                        accountingStatus:
                            "valid",

                        sourceGiftName:
                            item.giftName
                    });
                }
            }


            /* =================================================
               OWNED DIRECT
            ================================================= */

            else if(
                !isGemRewardGift(
                    item.gift
                )
            ){

                ownedItems.push(

                    Object.assign(
                        {},
                        validItem,
                        {

                            image:
                                item.gift.image ||
                                "",

                            description:
                                item.gift.description ||
                                "",

                            rarity:
                                item.gift.rarity ||
                                null,

                            rarityInfo:
                                item.gift.rarityInfo ||
                                null,

                            rarityGemType:
                                item.gift.rarityGemType ||
                                null,

                            quantity:1,

                            ownershipSource:
                                "redemption"
                        }
                    )
                );
            }

        }
    );


    const finalBalance=
        normalizeGemBalance(
            balance
        );


    return{

        startingGems:
            cloneGems(
                normalizedStart
            ),

        gems:
            cloneGems(
                finalBalance
            ),

        balance:
            cloneGems(
                finalBalance
            ),

        validTransactions,

        transactions:
            validTransactions,

        rejectedTransactions,

        ownedItems,

        redeemedItems:
            ownedItems,

        gemRewards,

        consumedDealIds
    };
}


/* =========================================================
   COMPATIBILITY
========================================================= */

function applyRedeemedItems(
    startingGems,
    transactions
){

    return processTransactions(
        startingGems,
        transactions
    ).gems;
}


function applyTransactions(
    startingGems,
    transactions
){

    return processTransactions(
        startingGems,
        transactions
    );
}


function calculateGemBalance(
    startingGems,
    transactions
){

    return processTransactions(
        startingGems,
        transactions
    );
}


/* =========================================================
   LEGACY OWNED ITEMS
========================================================= */

function buildOwnedItems(
    transactions
){

    const items=[];


    (
        transactions ||
        []
    )
    .forEach(
        function(item){


            /*
               Teacher gem:
               không phải vật phẩm.
            */
            if(
                item &&
                item.transactionType ===
                "teacher-gem"
            ){

                return;
            }


            if(
                !item ||
                !item.gift
            ){

                return;
            }


            if(
                item.isMysteryBox
            ){

                const rewardGift=
                    item.mysteryRewardGift;


                if(
                    rewardGift &&
                    !isGemRewardGift(
                        rewardGift
                    )
                    &&
                    !isMysteryBoxGiftName(
                        rewardGift.name
                    )
                ){

                    items.push({

                        index:
                            item.index,

                        timestamp:
                            item.timestamp,

                        studentName:
                            item.studentName,

                        code:
                            item.code,

                        dealId:
                            item.dealId ||
                            "",

                        giftName:
                            rewardGift.name,

                        gift:
                            rewardGift,

                        image:
                            rewardGift.image ||
                            "",

                        description:
                            rewardGift.description ||
                            "",

                        rarity:
                            rewardGift.rarity ||
                            null,

                        rarityInfo:
                            rewardGift.rarityInfo ||
                            null,

                        rarityGemType:
                            rewardGift.rarityGemType ||
                            null,

                        quantity:1,

                        price:0,

                        gemType:null,

                        ownershipSource:
                            "mystery-box"
                    });
                }


                return;
            }


            if(
                isGemRewardGift(
                    item.gift
                )
            ){

                return;
            }


            items.push(

                Object.assign(
                    {},
                    item,
                    {

                        image:
                            item.gift.image ||
                            "",

                        description:
                            item.gift.description ||
                            "",

                        rarity:
                            item.gift.rarity ||
                            null,

                        rarityInfo:
                            item.gift.rarityInfo ||
                            null,

                        rarityGemType:
                            item.gift.rarityGemType ||
                            null,

                        quantity:
                            Number(
                                item.quantity ||
                                1
                            ),

                        ownershipSource:
                            item.ownershipSource ||
                            "redemption"
                    }
                )
            );
        }
    );


    return items;
}


/* =========================================================
   MERGE OWNED ITEMS
========================================================= */

function mergeOwnedItems(
    redemptionItems,
    teacherItems
){

    return [

        ...(
            redemptionItems ||
            []
        ),

        ...(
            teacherItems ||
            []
        )

    ]
    .sort(
        function(a,b){

            const da=
                parseVietnameseDate(
                    a.timestamp
                );


            const db=
                parseVietnameseDate(
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
                tb !== ta
            ){

                return tb-ta;
            }


            return(

                Number(
                    b.rowIndex ||
                    b.index ||
                    0
                )

                -

                Number(
                    a.rowIndex ||
                    a.index ||
                    0
                )
            );
        }
    );
}


function getOwnedItemsFromShared(
    shared,
    code
){

    const key=
        normalizeCode(
            code
        );


    return(
        shared &&
        shared.ownedItemMap &&
        shared.ownedItemMap.get(
            key
        )
    )
    ||
    [];
}


function hasOwnedItem(
    items,
    giftName
){

    const wanted=
        normalizeText(
            giftName
        );


    return(
        items ||
        []
    )
    .some(
        function(item){

            return normalizeText(
                item.giftName
            )
            ===
            wanted;
        }
    );
}


function getOwnedItemQuantity(
    items,
    giftName
){

    const wanted=
        normalizeText(
            giftName
        );


    return(
        items ||
        []
    )
    .reduce(
        function(total,item){

            if(
                normalizeText(
                    item.giftName
                )
                !==
                wanted
            ){

                return total;
            }


            return(
                total +
                Math.max(
                    1,
                    Number(
                        item.quantity ||
                        1
                    )
                )
            );
        },
        0
    );
}


/* =========================================================
   ACHIEVEMENT
========================================================= */

const STREAK_RULES=[

    {
        days:5,
        icon:ICONS.seed,
        name:"Mầm cây chăm chỉ",
        hoangNgocValue:1
    },

    {
        days:7,
        icon:ICONS.medal,
        name:"Phiếu bé ngoan",
        hoangNgocValue:2
    },

    {
        days:14,
        icon:ICONS.tree,
        name:"Cây nhỏ bền bỉ",
        hoangNgocValue:4
    },

    {
        days:30,
        icon:ICONS.fire,
        name:"Ngọn lửa không tắt",
        hoangNgocValue:8
    }
];


const HIGH_SCORE_RULES=[

    {
        blockSize:3,
        requiredBlocks:1,
        icon:ICONS.star,
        name:"Ngôi sao ổn định",
        hoangNgocValue:2
    },

    {
        blockSize:4,
        requiredBlocks:1,
        icon:ICONS.target,
        name:"Mũi tên tập trung",
        hoangNgocValue:3
    },

    {
        blockSize:5,
        requiredBlocks:1,
        icon:ICONS.rocket,
        name:"Tên lửa tiến bộ",
        hoangNgocValue:4
    },

    {
        blockSize:3,
        requiredBlocks:2,
        icon:ICONS.sparkles,
        name:"Song tinh bền bỉ",
        hoangNgocValue:4
    },

    {
        blockSize:4,
        requiredBlocks:2,
        icon:ICONS.eagle,
        name:"Đôi cánh vững vàng",
        hoangNgocValue:6
    },

    {
        blockSize:5,
        requiredBlocks:2,
        icon:ICONS.crown,
        name:"Vương miện ổn định",
        hoangNgocValue:8
    }
];


/* =========================================================
   STREAK
========================================================= */

function calculateLongestStreak(
    submissions
){

    const uniqueDays=
        new Set();


    (
        submissions ||
        []
    )
    .forEach(
        function(item){

            const date=
                parseVietnameseDate(
                    item.timestamp
                );


            if(date){

                uniqueDays.add(
                    getCalendarDayKey(
                        date
                    )
                );
            }
        }
    );


    const dates=
        Array.from(
            uniqueDays
        )
        .map(
            function(key){

                const parts=
                    key.split("-");


                return new Date(

                    Number(parts[0]),

                    Number(parts[1])-1,

                    Number(parts[2])
                );
            }
        )
        .sort(
            function(a,b){

                return(
                    a.getTime() -
                    b.getTime()
                );
            }
        );


    if(!dates.length){
        return 0;
    }


    let longest=1;
    let current=1;


    for(
        let i=1;
        i<dates.length;
        i++
    ){

        const difference=
            Math.round(

                (
                    dates[i]
                    .getTime()

                    -

                    dates[i-1]
                    .getTime()
                )

                /

                ONE_DAY
            );


        if(
            difference === 1
        ){

            current++;

            longest=
                Math.max(
                    longest,
                    current
                );

        }else{

            current=1;
        }
    }


    return longest;
}


/* =========================================================
   HIGH SCORE
========================================================= */

function calculateHighScoreRuns(
    submissions
){

    const ordered=
        (
            submissions ||
            []
        )
        .slice()
        .sort(
            function(a,b){

                const da=
                    parseVietnameseDate(
                        a.timestamp
                    );


                const db=
                    parseVietnameseDate(
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
                        a.originalIndex ||
                        0
                    )

                    -

                    Number(
                        b.originalIndex ||
                        0
                    )
                );
            }
        );


    const runs=[];

    let current=0;


    ordered.forEach(
        function(item){

            const score=
                parseScore(
                    item.score
                );


            if(
                score === null
            ){

                return;
            }


            if(
                score >= 6
            ){

                current++;

                return;
            }


            if(
                current > 0
            ){

                runs.push(
                    current
                );

                current=0;
            }
        }
    );


    if(
        current > 0
    ){

        runs.push(
            current
        );
    }


    return runs;
}


/* =========================================================
   SCORE GEMS
========================================================= */

function calculateScoreGems(
    submissions
){

    const counts={

        score5:0,

        score6:0,

        score7:0,

        score89:0,

        score10:0
    };


    (
        submissions ||
        []
    )
    .forEach(
        function(item){

            const score=
                parseScore(
                    item.score
                );


            if(
                score === null
            ){

                return;
            }


            if(
                score === 5
            ){

                counts.score5++;

            }else if(
                score === 6
            ){

                counts.score6++;

            }else if(
                score === 7
            ){

                counts.score7++;

            }else if(
                score === 8 ||
                score === 9
            ){

                counts.score89++;

            }else if(
                score === 10
            ){

                counts.score10++;
            }
        }
    );


    const gems=
        createEmptyGems();


    gems.hoangNgoc +=
        Math.floor(
            counts.score5 / 2
        );


    gems.haiLamNgoc +=
        Math.floor(
            counts.score6 / 2
        );


    gems.thachAnhTim +=
        Math.floor(
            counts.score7 / 2
        );


    gems.lamBaoThach +=
        Math.floor(
            counts.score89 / 2
        );


    gems.lucThach +=
        counts.score10;


    return{
        counts,
        gems
    };
}


/* =========================================================
   REWARD
========================================================= */

function calculateStudentRewardData(
    submissions
){

    const longestStreak=
        calculateLongestStreak(
            submissions
        );


    const streakUnlocked=
        STREAK_RULES.filter(
            function(rule){

                return(
                    longestStreak >=
                    rule.days
                );
            }
        );


    const streakGift=
        streakUnlocked.length
        ?
        streakUnlocked[
            streakUnlocked.length-1
        ]
        :
        null;


    const runs=
        calculateHighScoreRuns(
            submissions
        );


    const bestHighRun=
        runs.length
        ?
        Math.max.apply(
            null,
            runs
        )
        :
        0;


    const blockCounts={};


    [3,4,5]
    .forEach(
        function(blockSize){

            blockCounts[
                blockSize
            ]=
                runs.reduce(
                    function(
                        total,
                        run
                    ){

                        return(
                            total+
                            Math.floor(
                                run /
                                blockSize
                            )
                        );
                    },
                    0
                );
        }
    );


    const unlockedHighScoreGifts=
        HIGH_SCORE_RULES.filter(
            function(rule){

                return(
                    Number(
                        blockCounts[
                            rule.blockSize
                        ] || 0
                    )
                    >=
                    rule.requiredBlocks
                );
            }
        );


    let highScoreGift=
        null;


    unlockedHighScoreGifts
    .forEach(
        function(rule){

            if(
                !highScoreGift ||
                rule.hoangNgocValue >=
                highScoreGift
                .hoangNgocValue
            ){

                highScoreGift=
                    rule;
            }
        }
    );


    const scoreResult=
        calculateScoreGems(
            submissions
        );


    const earned=
        cloneGems(
            scoreResult.gems
        );


    if(streakGift){

        earned.hoangNgoc +=
            Number(
                streakGift
                .hoangNgocValue ||
                0
            );
    }


    unlockedHighScoreGifts
    .forEach(
        function(rule){

            earned.hoangNgoc +=
                Number(
                    rule.hoangNgocValue ||
                    0
                );
        }
    );


    const normalized=
        normalizeGemBalance(
            earned
        );


    return{

        longestStreak,

        streakGift,

        streakUnlocked,

        highScoreRuns:
            runs,

        bestHighRun,

        highScoreBlocks:
            blockCounts,

        highScoreGift,

        unlockedHighScoreGifts,

        scoreCounts:
            scoreResult.counts,

        rawGems:
            earned,

        gems:
            normalized
    };
}


/* =========================================================
   PROFILE TITLE
========================================================= */

function getProfileTitle(reward){

    reward=
        reward || {};


    if(
        reward.highScoreGift
    ){

        return{

            icon:
                reward.highScoreGift
                .icon ||
                ICONS.star,

            name:
                reward.highScoreGift
                .name ||
                "Học viên"
        };
    }


    if(
        reward.streakGift
    ){

        return{

            icon:
                reward.streakGift
                .icon ||
                ICONS.seed,

            name:
                reward.streakGift
                .name ||
                "Học viên"
        };
    }


    return{

        icon:
            ICONS.seed,

        name:
            "Học viên mới"
    };
}


/* =========================================================
   OWNED SORT
========================================================= */

function sortOwnedItemsNewest(
    items
){

    return(
        items ||
        []
    )
    .slice()
    .sort(
        function(a,b){

            const da=
                parseVietnameseDate(
                    a.timestamp
                );


            const db=
                parseVietnameseDate(
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
                tb !== ta
            ){

                return tb-ta;
            }


            return(

                Number(
                    b.rowIndex ||
                    b.index ||
                    0
                )

                -

                Number(
                    a.rowIndex ||
                    a.index ||
                    0
                )
            );
        }
    );
}


/* =========================================================
   PROFILE ASSETS
========================================================= */

function getLatestOwnedItemByPrefix(
    items,
    prefix
){

    const wanted=
        normalizeText(
            prefix
        );


    return(
        sortOwnedItemsNewest(
            items
        )
        .find(
            function(item){

                return normalizeText(
                    item.giftName
                )
                .startsWith(
                    wanted
                );
            }
        )
    )
    ||
    null;
}


function getProfileAvatar(
    items
){

    const item=
        getLatestOwnedItemByPrefix(

            items,

            CONFIG.avatarGiftPrefix
        );


    return(
        item &&
        item.image
    )
    ?
    convertDriveImageUrl(
        item.image,
        500
    )
    :
    "";
}


function getProfileAvatarFrame(
    items
){

    const item=
        getLatestOwnedItemByPrefix(

            items,

            CONFIG.avatarFramePrefix
        );


    return(
        item &&
        item.image
    )
    ?
    convertDriveImageUrl(
        item.image,
        700
    )
    :
    "";
}


function getProfileBackground(
    items
){

    const item=
        getLatestOwnedItemByPrefix(

            items,

            CONFIG.profileBackgroundPrefix
        );


    return(
        item &&
        item.image
    )
    ?
    convertDriveImageUrl(
        item.image,
        1600
    )
    :
    "";
}


function hasMultitaskPotion(
    items
){

    const wanted=
        normalizeText(
            CONFIG
            .multitaskPotionGiftName
        );


    return(
        items ||
        []
    )
    .some(
        function(item){

            return normalizeText(
                item.giftName
            )
            ===
            wanted;
        }
    );
}


/* =========================================================
   MULTITASK DOM
========================================================= */

function clearMultitaskEffect(
    wrapper,
    nameElement
){

    if(wrapper){

        wrapper.classList.remove(

            "reward-multitask-wrap",

            "reward-multitask-size-small",

            "reward-multitask-size-medium",

            "reward-multitask-size-large"
        );


        wrapper
        .querySelectorAll(
            ".reward-multitask-star"
        )
        .forEach(
            function(star){

                star.remove();
            }
        );
    }


    if(nameElement){

        nameElement
        .classList.remove(
            "reward-multitask-name"
        );
    }
}


function applyMultitaskEffect(
    wrapper,
    nameElement,
    options
){

    if(
        !wrapper ||
        !nameElement
    ){

        return;
    }


    clearMultitaskEffect(
        wrapper,
        nameElement
    );


    const size=
        options &&
        options.size
        ?
        options.size
        :
        "medium";


    wrapper.classList.add(
        "reward-multitask-wrap"
    );


    wrapper.classList.add(
        "reward-multitask-size-"+
        size
    );


    nameElement.classList.add(
        "reward-multitask-name"
    );


    const sparkleA=
        String.fromCodePoint(
            0x2726
        );


    const sparkleB=
        String.fromCodePoint(
            0x2727
        );


    [

        [
            "reward-multitask-star-left",
            sparkleA
        ],

        [
            "reward-multitask-star-right",
            sparkleB
        ],

        [
            "reward-multitask-star-bottom-left",
            sparkleB
        ],

        [
            "reward-multitask-star-bottom-right",
            sparkleA
        ]

    ]
    .forEach(
        function(config){

            const star=
                document.createElement(
                    "span"
                );


            star.className=

                "reward-multitask-star "

                +

                config[0];


            star.textContent=
                config[1];


            star.setAttribute(
                "aria-hidden",
                "true"
            );


            wrapper.appendChild(
                star
            );
        }
    );
}


/* =========================================================
   SHARED CACHE
========================================================= */

let sharedCache=null;
let sharedCacheTime=0;


/* =========================================================
   LOAD SHARED DATA v3.6

   QuaTang
   + PhieuDoi
   + QuaTangGVCN
========================================================= */

async function loadSharedRewardData(
    forceRefresh
){

    const now=
        Date.now();


    if(
        !forceRefresh &&
        sharedCache &&
        (
            now-
            sharedCacheTime
        )
        <
        CONFIG.cacheTtl
    ){

        return sharedCache;
    }


    const results=
        await Promise.all([

            /*
               QuaTang
            */
            fetchRows(
                sheetCsvUrl(
                    CONFIG.giftGid
                )
            ),

            /*
               PhieuDoi
            */
            fetchRows(
                sheetNameCsvUrl(
                    CONFIG.formSheetName
                )
            ),

            /*
               QuaTangGVCN
            */
            fetchRows(
                sheetNameCsvUrl(
                    CONFIG.teacherGiftSheetName
                )
            )
        ]);


    const giftRows=
        results[0];


    const responseRows=
        results[1];


    const rawTeacherRows=
        results[2];


    /* =====================================================
       QUATANG
    ===================================================== */

    const gifts=
        mapGiftRows(
            giftRows
        );


    const giftMap=
        createGiftMap(
            gifts
        );


    /* =====================================================
       PHIEUDOI
    ===================================================== */

    const responses=
        mapFormResponseRows(
            responseRows,
            gifts
        );


    const marketRedemptionMap=
        new Map();


    responses.forEach(
        function(item){

            if(
                !marketRedemptionMap
                .has(
                    item.code
                )
            ){

                marketRedemptionMap
                .set(
                    item.code,
                    []
                );
            }


            marketRedemptionMap
            .get(
                item.code
            )
            .push(item);
        }
    );


    /* =====================================================
       QUATANGGVCN
    ===================================================== */

    const teacherGifts=
        mapTeacherGiftRows(
            rawTeacherRows,
            gifts
        );


    const teacherOwnedItemMap=
        buildTeacherOwnedItemMap(
            teacherGifts
        );


    const teacherGemTransactionMap=
        buildTeacherGemTransactionMap(
            teacherGifts
        );


    /* =====================================================
       COMBINED TRANSACTIONS

       Để Profile Market v4.4 tiếp tục chạy:
       redemptionMap bao gồm:
       - giao dịch Chợ
       - quà gem GVCN

       Quà item GVCN KHÔNG đi vào đây.
    ===================================================== */

    const redemptionMap=
        new Map();


    const allTransactionCodes=
        new Set();


    marketRedemptionMap
    .forEach(
        function(value,code){

            allTransactionCodes.add(
                code
            );
        }
    );


    teacherGemTransactionMap
    .forEach(
        function(value,code){

            allTransactionCodes.add(
                code
            );
        }
    );


    allTransactionCodes
    .forEach(
        function(code){

            redemptionMap.set(

                code,

                sortTransactionsChronologically([

                    ...(
                        marketRedemptionMap
                        .get(code)
                        ||
                        []
                    ),

                    ...(
                        teacherGemTransactionMap
                        .get(code)
                        ||
                        []
                    )
                ])
            );
        }
    );


    /* =====================================================
       OWNED ITEM MAP
    ===================================================== */

    const ownedItemMap=
        new Map();


    const allItemCodes=
        new Set();


    redemptionMap
    .forEach(
        function(value,code){

            allItemCodes.add(
                code
            );
        }
    );


    teacherOwnedItemMap
    .forEach(
        function(value,code){

            allItemCodes.add(
                code
            );
        }
    );


    allItemCodes
    .forEach(
        function(code){

            const redemptionItems=
                buildOwnedItems(

                    redemptionMap
                    .get(code)
                    ||
                    []
                );


            const teacherItems=
                teacherOwnedItemMap
                .get(code)
                ||
                [];


            ownedItemMap.set(

                code,

                mergeOwnedItems(
                    redemptionItems,
                    teacherItems
                )
            );
        }
    );


    /* =====================================================
       GEM REWARD MAP
    ===================================================== */

    const gemRewardMap=
        new Map();


    redemptionMap
    .forEach(
        function(
            transactions,
            code
        ){

            gemRewardMap.set(

                code,

                transactions.filter(
                    function(item){

                        return(

                            item.transactionType ===
                            "teacher-gem"

                            ||

                            item.isGemReward

                            ||

                            (
                                item.isMysteryBox
                                &&
                                isGemRewardGift(
                                    item.mysteryRewardGift
                                )
                            )
                        );
                    }
                )
            );
        }
    );


    sharedCache={

        gifts,

        giftMap,


        /*
           Chỉ giao dịch Chợ.
        */
        responses,

        marketRedemptionMap,


        /*
           Tương thích các trang cũ:
           Chợ + gem GVCN.
        */
        redemptionMap,


        /*
           Teacher.
        */
        teacherGifts,

        teacherOwnedItemMap,

        teacherGemTransactionMap,


        /*
           Kho chuẩn.
        */
        ownedItemMap,

        gemRewardMap,


        rawGiftRows:
            giftRows,

        rawResponseRows:
            responseRows,

        rawTeacherGiftRows:
            rawTeacherRows
    };


    sharedCacheTime=
        now;


    return sharedCache;
}


/* =========================================================
   GET STUDENT PROFILE
========================================================= */

async function getStudentRewardProfile(
    code,
    submissionCsvText
){

    const studentCode=
        normalizeCode(
            code
        );


    const shared=
        await loadSharedRewardData();


    let submissions=[];


    if(
        submissionCsvText
    ){

        const rows=
            parseCSV(
                submissionCsvText
            );


        if(rows.length){

            const headers=
                rows[0]
                .map(
                    normalizeText
                );


            const codeIndex=
                findColumn(
                    headers,
                    [
                        "mã học viên",
                        "ma hoc vien"
                    ]
                );


            const timestampIndex=
                findColumn(
                    headers,
                    [
                        "dấu thời gian",
                        "dau thoi gian",
                        "timestamp"
                    ]
                );


            const scoreIndex=
                findColumn(
                    headers,
                    [
                        "điểm",
                        "diem",
                        "điểm số",
                        "diem so"
                    ]
                );


            if(
                codeIndex >= 0
            ){

                submissions=
                    rows
                    .slice(1)
                    .map(
                        function(row,index){

                            return{

                                code:
                                    normalizeCode(
                                        row[
                                            codeIndex
                                        ]
                                    ),

                                timestamp:
                                    timestampIndex >= 0
                                    ?
                                    (
                                        row[
                                            timestampIndex
                                        ] || ""
                                    )
                                    :
                                    "",

                                score:
                                    scoreIndex >= 0
                                    ?
                                    (
                                        row[
                                            scoreIndex
                                        ] || ""
                                    )
                                    :
                                    "",

                                originalIndex:
                                    index+1
                            };
                        }
                    )
                    .filter(
                        function(item){

                            return(
                                item.code ===
                                studentCode
                            );
                        }
                    );
            }
        }
    }


    /*
       Linh thạch học tập.
    */
    const rewardData=
        calculateStudentRewardData(
            submissions
        );


    const earnedGems=
        cloneGems(
            rewardData.gems
        );


    /*
       Giao dịch Chợ
       + quà linh thạch GVCN.
    */
    const rawTransactions=
        shared.redemptionMap
        .get(
            studentCode
        )
        ||
        [];


    /*
       TẤT CẢ linh thạch được hợp nhất tại đây.
    */
    const accounting=
        processTransactions(
            earnedGems,
            rawTransactions
        );


    /*
       Kho item chuẩn:
       PhieuDoi + Mystery + GVCN.
    */
    const unifiedOwnedItems=
        getOwnedItemsFromShared(
            shared,
            studentCode
        );


    return{

        code:
            studentCode,

        rewardData,

        earnedGems,


        /*
           SỐ DƯ CUỐI CÙNG
           đã bao gồm gem GVCN.
        */
        gems:
            accounting.gems,

        balance:
            accounting.balance,

        rawTransactions,

        transactions:
            accounting.validTransactions,

        validTransactions:
            accounting.validTransactions,

        rejectedTransactions:
            accounting.rejectedTransactions,


        /*
           KHO HỢP NHẤT.
        */
        ownedItems:
            unifiedOwnedItems,

        redeemedItems:
            unifiedOwnedItems,


        redemptionOwnedItems:
            accounting.ownedItems,

        teacherOwnedItems:
            (
                shared.teacherOwnedItemMap
                .get(
                    studentCode
                )
                ||
                []
            ),


        teacherGemTransactions:
            (
                shared.teacherGemTransactionMap
                .get(
                    studentCode
                )
                ||
                []
            ),


        gemRewards:
            accounting.gemRewards,

        consumedDealIds:
            accounting.consumedDealIds,


        avatar:
            getProfileAvatar(
                unifiedOwnedItems
            ),

        avatarFrame:
            getProfileAvatarFrame(
                unifiedOwnedItems
            ),

        profileBackground:
            getProfileBackground(
                unifiedOwnedItems
            ),

        hasMultitaskPotion:
            hasMultitaskPotion(
                unifiedOwnedItems
            ),

        accounting
    };
}


/* =========================================================
   DEBUG
========================================================= */

function debug(){

    console.log(
        "[Reward Core] Version:",
        VERSION
    );


    console.log(
        "[Reward Core] CONFIG:",
        CONFIG
    );


    if(sharedCache){

        console.log(
            "[Reward Core] Shared:",
            sharedCache
        );
    }


    return{

        version:
            VERSION,

        config:
            CONFIG,

        cache:
            sharedCache
    };
}


/* =========================================================
   PUBLIC API
========================================================= */

window.StudentRewardSystem={

    version:
        VERSION,

    CONFIG,

    ONE_DAY,

    ICONS,

    GEM_TYPES,

    GEM_ORDER,

    GEM_CONVERSION,

    RARITY_TYPES,

    RARITY_ORDER,

    STREAK_RULES,

    HIGH_SCORE_RULES,


    /* BASIC */

    normalizeText,

    normalizeCode,

    parseNumber,

    parseScore,

    formatNumber,

    findColumn,


    /* CSV */

    parseCSV,

    fetchCSV,

    fetchRows,

    sheetCsvUrl,

    sheetNameCsvUrl,


    /* DRIVE */

    extractDriveFileId,

    convertDriveImageUrl,


    /* DATE */

    parseVietnameseDate,

    getCalendarDayKey,


    /* GEMS */

    createEmptyGems,

    cloneGems,

    normalizeGemType,

    normalizeGemBalance,

    addGemReward,

    getGemValueInHong,

    parseGemRewardMarker,

    isGemRewardGift,

    analyzeGemOfferEconomy,


    /* RARITY */

    normalizeRarity,

    getRarityInfo,

    getRarityGem,


    /* GIFTS */

    mapGiftRows,

    createGiftMap,

    isMysteryBoxGiftName,


    /* DEAL */

    sanitizeDealId,

    createDealMarker,

    parseDealMarker,

    createDealId,

    getConsumedDealIds,


    /* FORM */

    createFormGiftValue,

    parseFormGiftValue,

    detectFormColumns,

    mapFormResponseRows,


    /* TEACHER */

    detectTeacherGiftColumns,

    isTeacherGiftActive,

    resolveTeacherGemReward,

    mapTeacherGiftRows,

    buildTeacherGemTransactions,

    buildTeacherOwnedItems,

    buildTeacherOwnedItemMap,

    buildTeacherGemTransactionMap,


    /* ACCOUNTING */

    sortTransactionsChronologically,

    canAffordTransaction,

    processTransactions,

    applyTransactions,

    calculateGemBalance,

    applyRedeemedItems,

    buildOwnedItems,

    mergeOwnedItems,

    getOwnedItemsFromShared,

    hasOwnedItem,

    getOwnedItemQuantity,


    /* ACHIEVEMENT */

    calculateLongestStreak,

    calculateHighScoreRuns,

    calculateScoreGems,

    calculateStudentRewardData,

    getProfileTitle,


    /* PROFILE */

    sortOwnedItemsNewest,

    getLatestOwnedItemByPrefix,

    getProfileAvatar,

    getProfileAvatarFrame,

    getProfileBackground,

    hasMultitaskPotion,


    /* EFFECT */

    clearMultitaskEffect,

    applyMultitaskEffect,


    /* SHARED */

    loadSharedRewardData,

    getStudentRewardProfile,


    /* DEBUG */

    debug
};


/* =========================================================
   READY
========================================================= */

console.log(
    "[Reward Core] StudentRewardSystem v3.6.0 đã sẵn sàng."
);


try{

    window.dispatchEvent(
        new CustomEvent(
            "studentRewardCoreReady",
            {
                detail:{
                    version:
                        VERSION
                }
            }
        )
    );

}catch(error){}


})();

