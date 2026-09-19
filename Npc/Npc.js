/* =========================================================
   OCD NPC DISPLAY
   JS v5.3.1
   EXTERNAL BUILD

   BASE:
   v5.3.0 INLINE - VERIFIED WORKING

   RULE:
   - NPC mặc định ẩn.
   - Chỉ hiện khi URL có ?quest=MÃ_NPC.
   - Mã phải đúng NPC của đúng trang.
   - Sheet chỉ enrich ảnh/mô tả.
   - NPC không tự tính tài sản.
========================================================= */

(function(){

"use strict";


/* =========================================================
   DUPLICATE GUARD
========================================================= */

if(window.OCD_NPC_DISPLAY_V531){
    return;
}

window.OCD_NPC_DISPLAY_V531 = true;


/* =========================================================
   CONFIG
========================================================= */

var CONFIG = {

    version:
        "5.3.1",

    mountId:
        "ocdNpcMount",

    npcGid:
        "1348051654",

    coreWait:
        10000,

    questParam:
        "quest"

};


/* =========================================================
   EXACT PAGE MAP
========================================================= */

var PAGE_MAP = {


    /* =====================================================
       GIẢNG ĐƯỜNG
    ===================================================== */

    "/p/giang-duong.html":{

        id:
            "LECTURE",

        place:
            "Giảng đường OCD",

        npc:
            "Thư gia",

        questCode:
            "thu-gia"

    },


    /* =====================================================
       PHÒNG TRIỂN LÃM
    ===================================================== */

    "/p/trien-lam.html":{

        id:
            "EXHIBITION",

        place:
            "Phòng triển lãm OCD",

        npc:
            "Nữ hoạ gia",

        questCode:
            "nu-hoa-gia"

    },


    /* =====================================================
       BẢNG XẾP HẠNG
    ===================================================== */

    "/p/ho-so.html":{

        id:
            "RANKING",

        place:
            "Bảng xếp hạng học viên",

        npc:
            "Nghệ nhân",

        questCode:
            "nghe-nhan"

    },


    /* =====================================================
       THƯ VIỆN LÂM MÔ
    ===================================================== */

    "/p/thu-vien-lam-mo.html":{

        id:
            "LIBRARY",

        place:
            "Thư viện lâm mô",

        npc:
            "Nông dân",

        questCode:
            "nong-dan"

    },


    /* =====================================================
       NỘP BÀI
    ===================================================== */

    "/p/nop-bai.html":{

        id:
            "SUBMISSION",

        place:
            "Nộp bài",

        npc:
            "Nông dân",

        questCode:
            "nong-dan"

    },


    /* =====================================================
       NHIỆM VỤ
    ===================================================== */

    "/p/quest.html":{

        id:
            "QUEST",

        place:
            "Nhiệm vụ",

        npc:
            "Võ tướng",

        questCode:
            "vo-tuong"

    },


    /* =====================================================
       TÀI LIỆU TRẢ PHÍ
    ===================================================== */

    "/p/tai-lieu.html":{

        id:
            "PREMIUM_LIBRARY",

        place:
            "Kho tài liệu trả phí",

        npc:
            "Con nghiện",

        questCode:
            "con-nghien"

    },


    /* =====================================================
       SÁCH THƯ PHÁP
    ===================================================== */

    "/p/sach-thu-phap.html":{

        id:
            "BOOK_STORE",

        place:
            "Sách Thư pháp Việt",

        npc:
            "Con bạc",

        questCode:
            "con-bac"

    },


    /* =====================================================
       TRA CỨU / CHỢ PHIÊN
    ===================================================== */

    "/p/tra-cuu.html":{

        id:
            "PROFILE_MARKET",

        place:
            "Tra cứu / Chợ phiên",

        npc:
            "Gian thương",

        questCode:
            "gian-thuong"

    }

};


/* =========================================================
   STATE
========================================================= */

var state = {

    page:
        null,

    npc:
        null,

    sheetNpc:
        [],

    quest:
        null,

    questCode:
        "",

    simulationActive:
        false,

    dialogOpen:
        false,

    coreLoaded:
        false

};


/* =========================================================
   FALLBACK NPC DATA
========================================================= */

var DEFAULT_NPCS = {


    "thu gia":{

        name:
            "Thư gia",

        symbol:
            "書",

        dialogue:
            "Chào bạn. Ta là Thư gia. Ta đang chờ người nhận nhiệm vụ tìm đến."

    },


    "nu hoa gia":{

        name:
            "Nữ hoạ gia",

        symbol:
            "畫",

        dialogue:
            "Mỗi tác phẩm đều lưu lại một phần hành trình của người viết. Hãy quan sát thật kỹ trước khi tiếp tục nhiệm vụ."

    },


    "nghe nhan":{

        name:
            "Nghệ nhân",

        symbol:
            "藝",

        dialogue:
            "Ngươi đã nhận nhiệm vụ nên mới tìm đến đây. Hãy xem lại thành quả và tiếp tục rèn luyện."

    },


    "nong dan":{

        name:
            "Nông dân",

        symbol:
            "田",

        dialogue:
            "Đã nhận nhiệm vụ rồi sao? Vậy thì bắt tay vào việc. Muốn thu hoạch thì trước hết phải chịu khó gieo trồng."

    },


    "vo tuong":{

        name:
            "Võ tướng",

        symbol:
            "武",

        dialogue:
            "Nhiệm vụ đã bày ra trước mắt. Hãy xem kỹ yêu cầu rồi mới lên đường."

    },


    "con nghien":{

        name:
            "Con nghiện",

        symbol:
            "藏",

        dialogue:
            "Có nhiệm vụ dẫn ngươi tới kho tài liệu này sao? Vậy thì tìm cho kỹ, thứ ngươi cần có thể đang ở ngay trước mắt."

    },


    "con bac":{

        name:
            "Con bạc",

        symbol:
            "財",

        dialogue:
            "Nhiệm vụ dẫn ngươi tới đây à? Được thôi. Nhưng trước khi quyết định điều gì cũng phải xem cho kỹ."

    },


    "gian thuong":{

        name:
            "Gian thương",

        symbol:
            "商",

        dialogue:
            "Hừm... Có nhiệm vụ mới chịu tìm đến ta sao? Nói đi, ngươi cần thứ gì?"

    }

};


/* =========================================================
   HELPERS
========================================================= */

function clean(value){

    if(
        value === null ||
        value === undefined
    ){
        return "";
    }

    return String(value).trim();

}


function normalize(value){

    var text =
        clean(value)
        .toLowerCase();


    try{

        text =
            text
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            );

    }catch(error){}


    return text
        .replace(/đ/g,"d")
        .replace(/\s+/g," ")
        .trim();

}


function normalizeQuestCode(value){

    var text =
        normalize(value);


    return text
        .replace(/[^a-z0-9]+/g,"-")
        .replace(/^-+|-+$/g,"");

}


function escapeHtml(value){

    return clean(value)

        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");

}


function getMount(){

    return document.getElementById(
        CONFIG.mountId
    );

}


/* =========================================================
   PATH
========================================================= */

function getPath(){

    var path =
        (
            window.location.pathname ||
            "/"
        )
        .toLowerCase();


    if(
        path.length > 1 &&
        path.charAt(
            path.length - 1
        ) === "/"
    ){

        path =
            path.substring(
                0,
                path.length - 1
            );

    }


    return path;

}


/* =========================================================
   QUEST CODE FROM URL
========================================================= */

function getQuestCodeFromUrl(){

    var params;
    var value;


    try{

        params =
            new URLSearchParams(
                window.location.search
            );


        value =
            params.get(
                CONFIG.questParam
            );


        return normalizeQuestCode(
            value
        );


    }catch(error){

        return "";

    }

}


/* =========================================================
   DETECT PAGE
========================================================= */

function detectPage(){

    var path =
        getPath();


    if(
        Object.prototype.hasOwnProperty.call(
            PAGE_MAP,
            path
        )
    ){

        return PAGE_MAP[path];

    }


    return null;

}


/* =========================================================
   QUEST GATE
========================================================= */

function checkSimulation(){

    var questCode =
        getQuestCodeFromUrl();


    state.questCode =
        questCode;


    if(!state.page){

        state.simulationActive =
            false;

        return false;

    }


    if(!questCode){

        state.simulationActive =
            false;

        return false;

    }


    state.simulationActive =
        (
            questCode ===
            normalizeQuestCode(
                state.page.questCode
            )
        );


    return state.simulationActive;

}


/* =========================================================
   FALLBACK NPC
========================================================= */

function getFallbackNpc(name){

    var key =
        normalize(name);


    var source =
        DEFAULT_NPCS[key];


    if(source){

        return {

            name:
                source.name,

            symbol:
                source.symbol,

            image:
                "",

            dialogue:
                source.dialogue

        };

    }


    return {

        name:
            name || "NPC",

        symbol:
            "客",

        image:
            "",

        dialogue:
            "Có chuyện gì cần ta giúp?"

    };

}


/* =========================================================
   FIND NPC FROM SHEET
========================================================= */

function findSheetNpc(name){

    var target =
        normalize(name);

    var i;


    for(
        i=0;
        i<state.sheetNpc.length;
        i++
    ){

        if(
            state.sheetNpc[i].key ===
            target
        ){

            return state.sheetNpc[i];

        }

    }


    return null;

}


/* =========================================================
   GET NPC
========================================================= */

function getNpc(name){

    var fallback =
        getFallbackNpc(name);


    var sheet =
        findSheetNpc(name);


    if(!sheet){

        return fallback;

    }


    return {

        name:
            sheet.name ||
            fallback.name,

        symbol:
            fallback.symbol,

        image:
            sheet.image ||
            "",

        dialogue:
            sheet.description ||
            fallback.dialogue

    };

}


/* =========================================================
   IMAGE URL
========================================================= */

function convertImageUrl(url){

    var source =
        clean(url);

    var RS;

    var match;


    if(!source){
        return "";
    }


    RS =
        window.StudentRewardSystem;


    if(
        RS &&
        typeof RS.convertDriveImageUrl ===
            "function"
    ){

        try{

            return RS.convertDriveImageUrl(
                source,
                500
            );

        }catch(error){}

    }


    match =
        source.match(
            /\/file\/d\/([^/?]+)/
        );


    if(!match){

        match =
            source.match(
                /[?&]id=([^&]+)/
            );

    }


    if(
        match &&
        match[1]
    ){

        return (
            "https://drive.google.com/thumbnail?id=" +
            encodeURIComponent(
                match[1]
            ) +
            "&sz=w500"
        );

    }


    return source;

}


/* =========================================================
   FALLBACK VISUAL
========================================================= */

function createFallbackVisual(npc){

    var element =
        document.createElement(
            "div"
        );


    element.className =
        "ocd-npc-fallback";


    element.textContent =
        npc.symbol ||
        "客";


    return element;

}


/* =========================================================
   HIDE NPC
========================================================= */

function hideNpc(){

    var root =
        getMount();


    if(!root){
        return;
    }


    root.innerHTML =
        "";


    root.style.display =
        "none";


    state.npc =
        null;


    closeDialog();

}


/* =========================================================
   RENDER
========================================================= */

function render(){

    var root =
        getMount();

    var npc;

    var scene;
    var character;

    var bubble;

    var imageWrap;
    var image;
    var fallback;

    var mark;

    var name;
    var hint;


    if(!root){
        return;
    }


    /*
     * NPC chỉ được render nếu:
     *
     * 1. Đây là trang có mapping.
     * 2. Quest Gate hợp lệ.
     */

    if(
        !state.page ||
        !state.simulationActive
    ){

        hideNpc();

        return;

    }


    root.style.display =
        "block";


    npc =
        getNpc(
            state.page.npc
        );


    state.npc =
        npc;


    root.innerHTML =
        "";


    /* =====================================================
       SCENE
    ===================================================== */

    scene =
        document.createElement(
            "div"
        );


    scene.className =
        "ocd-npc-scene";


    /* =====================================================
       CHARACTER
    ===================================================== */

    character =
        document.createElement(
            "div"
        );


    character.className =
        "ocd-npc-character";


    character.setAttribute(
        "role",
        "button"
    );


    character.setAttribute(
        "tabindex",
        "0"
    );


    character.setAttribute(
        "aria-label",
        "Trò chuyện với " +
        npc.name
    );


    /* =====================================================
       BUBBLE
    ===================================================== */

    bubble =
        document.createElement(
            "div"
        );


    bubble.className =
        "ocd-npc-bubble";


    bubble.textContent =
        "Ta đang chờ ngươi.";


    character.appendChild(
        bubble
    );


    /* =====================================================
       IMAGE WRAP
    ===================================================== */

    imageWrap =
        document.createElement(
            "div"
        );


    imageWrap.className =
        "ocd-npc-image-wrap";


    /* =====================================================
       IMAGE
    ===================================================== */

    if(npc.image){

        image =
            document.createElement(
                "img"
            );


        image.className =
            "ocd-npc-image";


        image.src =
            convertImageUrl(
                npc.image
            );


        image.alt =
            npc.name;


        image.loading =
            "lazy";


        image.onerror =
            function(){

                if(
                    image &&
                    image.parentNode
                ){

                    image.parentNode.removeChild(
                        image
                    );

                }


                if(
                    !imageWrap.querySelector(
                        ".ocd-npc-fallback"
                    )
                ){

                    fallback =
                        createFallbackVisual(
                            npc
                        );


                    imageWrap.insertBefore(
                        fallback,
                        imageWrap.firstChild
                    );

                }

            };


        imageWrap.appendChild(
            image
        );

    }else{

        fallback =
            createFallbackVisual(
                npc
            );


        imageWrap.appendChild(
            fallback
        );

    }


    /* =====================================================
       QUEST MARK
    ===================================================== */

    mark =
        document.createElement(
            "span"
        );


    mark.className =
        "ocd-npc-mark is-quest";


    mark.textContent =
        "!";


    imageWrap.appendChild(
        mark
    );


    character.appendChild(
        imageWrap
    );


    /* =====================================================
       NAME
    ===================================================== */

    name =
        document.createElement(
            "div"
        );


    name.className =
        "ocd-npc-name";


    name.textContent =
        npc.name;


    character.appendChild(
        name
    );


    /* =====================================================
       HINT
    ===================================================== */

    hint =
        document.createElement(
            "div"
        );


    hint.className =
        "ocd-npc-hint";


    hint.textContent =
        "Chạm vào nhân vật để tiếp tục nhiệm vụ";


    character.appendChild(
        hint
    );


    /* =====================================================
       EVENTS
    ===================================================== */

    character.addEventListener(
        "click",
        openDialog
    );


    character.addEventListener(
        "keydown",
        function(event){

            if(
                event.key === "Enter" ||
                event.key === " "
            ){

                event.preventDefault();

                openDialog();

            }

        }
    );


    scene.appendChild(
        character
    );


    root.appendChild(
        scene
    );

}


/* =========================================================
   CREATE DIALOG
========================================================= */

function ensureDialog(){

    var root =
        document.getElementById(
            "ocdNpcDialogRoot"
        );


    if(root){
        return root;
    }


    root =
        document.createElement(
            "div"
        );


    root.id =
        "ocdNpcDialogRoot";


    root.innerHTML =

        '<div ' +
            'class="ocd-npc-overlay" ' +
            'id="ocdNpcOverlay">' +
        '</div>' +

        '<div ' +
            'class="ocd-npc-dialog" ' +
            'id="ocdNpcDialog" ' +
            'role="dialog" ' +
            'aria-modal="true">' +

            '<div class="ocd-npc-dialog-header">' +

                '<div ' +
                    'class="ocd-npc-dialog-avatar" ' +
                    'id="ocdNpcDialogAvatar">' +
                '</div>' +

                '<h3 ' +
                    'class="ocd-npc-dialog-name" ' +
                    'id="ocdNpcDialogName">' +
                '</h3>' +

                '<div ' +
                    'class="ocd-npc-dialog-place" ' +
                    'id="ocdNpcDialogPlace">' +
                '</div>' +

                '<button ' +
                    'type="button" ' +
                    'class="ocd-npc-close" ' +
                    'id="ocdNpcClose" ' +
                    'aria-label="Đóng">' +
                    '×' +
                '</button>' +

            '</div>' +

            '<div ' +
                'class="ocd-npc-dialog-body" ' +
                'id="ocdNpcDialogBody">' +
            '</div>' +

        '</div>';


    document.body.appendChild(
        root
    );


    document
        .getElementById(
            "ocdNpcOverlay"
        )
        .addEventListener(
            "click",
            closeDialog
        );


    document
        .getElementById(
            "ocdNpcClose"
        )
        .addEventListener(
            "click",
            closeDialog
        );


    return root;

}


/* =========================================================
   OPEN DIALOG
========================================================= */

function openDialog(){

    var npc =
        state.npc;

    var avatar;
    var image;

    var dialogue;

    var body;


    /*
     * API open() cũng không được phép
     * bỏ qua Quest Gate.
     */

    if(
        !npc ||
        !state.simulationActive
    ){
        return;
    }


    ensureDialog();


    avatar =
        document.getElementById(
            "ocdNpcDialogAvatar"
        );


    avatar.innerHTML =
        "";


    /* =====================================================
       AVATAR
    ===================================================== */

    if(npc.image){

        image =
            document.createElement(
                "img"
            );


        image.src =
            convertImageUrl(
                npc.image
            );


        image.alt =
            npc.name;


        image.onerror =
            function(){

                avatar.innerHTML =
                    "";

                avatar.textContent =
                    npc.symbol ||
                    "客";

            };


        avatar.appendChild(
            image
        );

    }else{

        avatar.textContent =
            npc.symbol ||
            "客";

    }


    /* =====================================================
       NAME
    ===================================================== */

    document
        .getElementById(
            "ocdNpcDialogName"
        )
        .textContent =
            npc.name;


    /* =====================================================
       PLACE
    ===================================================== */

    document
        .getElementById(
            "ocdNpcDialogPlace"
        )
        .textContent =
            state.page.place;


    /* =====================================================
       DIALOGUE
    ===================================================== */

    dialogue =
        npc.dialogue;


    if(
        state.quest &&
        state.quest.dialogue
    ){

        dialogue =
            state.quest.dialogue;

    }


    body =
        document.getElementById(
            "ocdNpcDialogBody"
        );


    body.innerHTML =

        '<div class="ocd-npc-dialog-speech">' +

            escapeHtml(
                dialogue
            ) +

        '</div>' +

        '<div class="ocd-npc-dialog-note">' +

            'Nhân vật này đang liên quan đến nhiệm vụ hiện tại của bạn.' +

        '</div>';


    /* =====================================================
       OPEN
    ===================================================== */

    document
        .getElementById(
            "ocdNpcOverlay"
        )
        .classList.add(
            "is-open"
        );


    document
        .getElementById(
            "ocdNpcDialog"
        )
        .classList.add(
            "is-open"
        );


    state.dialogOpen =
        true;


    /* =====================================================
       COORDINATION EVENT
    ===================================================== */

    try{

        window.dispatchEvent(

            new CustomEvent(
                "ocdAssistantPanelOpened",
                {

                    detail:{

                        source:
                            "NPC",

                        npc:
                            npc.name,

                        page:
                            state.page.id,

                        questCode:
                            state.questCode

                    }

                }
            )

        );

    }catch(error){}

}


/* =========================================================
   CLOSE DIALOG
========================================================= */

function closeDialog(){

    var overlay =
        document.getElementById(
            "ocdNpcOverlay"
        );


    var dialog =
        document.getElementById(
            "ocdNpcDialog"
        );


    if(overlay){

        overlay.classList.remove(
            "is-open"
        );

    }


    if(dialog){

        dialog.classList.remove(
            "is-open"
        );

    }


    state.dialogOpen =
        false;

}


/* =========================================================
   FIND COLUMN
========================================================= */

function findColumn(
    headers,
    aliases
){

    var i;
    var j;

    var target;


    for(
        i=0;
        i<aliases.length;
        i++
    ){

        target =
            normalize(
                aliases[i]
            );


        for(
            j=0;
            j<headers.length;
            j++
        ){

            if(
                headers[j] === target
            ){

                return j;

            }

        }

    }


    return -1;

}


/* =========================================================
   MAP NPC SHEET
========================================================= */

function mapNpcRows(rows){

    var result =
        [];

    var headers;

    var nameIndex;
    var imageIndex;
    var descriptionIndex;

    var i;
    var row;
    var name;


    if(
        !rows ||
        rows.length < 2
    ){

        return result;

    }


    headers =
        rows[0].map(
            normalize
        );


    nameIndex =
        findColumn(
            headers,
            [
                "tên nhân vật",
                "ten nhan vat",
                "tên npc",
                "ten npc"
            ]
        );


    imageIndex =
        findColumn(
            headers,
            [
                "hình ảnh",
                "hinh anh",
                "ảnh",
                "anh",
                "icon"
            ]
        );


    descriptionIndex =
        findColumn(
            headers,
            [
                "mô tả",
                "mo ta",
                "description"
            ]
        );


    if(nameIndex < 0){

        nameIndex =
            0;

    }


    for(
        i=1;
        i<rows.length;
        i++
    ){

        row =
            rows[i];


        if(!row){
            continue;
        }


        name =
            clean(
                row[nameIndex]
            );


        if(!name){
            continue;
        }


        result.push({

            name:
                name,

            key:
                normalize(
                    name
                ),

            image:
                imageIndex >= 0
                ?
                clean(
                    row[
                        imageIndex
                    ]
                )
                :
                "",

            description:
                descriptionIndex >= 0
                ?
                clean(
                    row[
                        descriptionIndex
                    ]
                )
                :
                ""

        });

    }


    return result;

}


/* =========================================================
   LOAD SHEET NPC

   NPC KHÔNG PHỤ THUỘC SHEET ĐỂ HIỂN THỊ.
========================================================= */

function loadSheetNpc(){

    var started =
        Date.now();


    function waitCore(){

        var RS =
            window.StudentRewardSystem;

        var url;


        if(
            RS &&
            typeof RS.sheetCsvUrl ===
                "function" &&
            typeof RS.fetchRows ===
                "function"
        ){

            state.coreLoaded =
                true;


            try{

                url =
                    RS.sheetCsvUrl(
                        CONFIG.npcGid
                    );


                RS.fetchRows(
                    url
                )
                .then(
                    function(rows){

                        var mapped =
                            mapNpcRows(
                                rows
                            );


                        if(
                            mapped &&
                            mapped.length
                        ){

                            state.sheetNpc =
                                mapped;


                            /*
                             * Render lại để thay fallback
                             * bằng ảnh + mô tả thật.
                             */

                            render();

                        }

                    }
                )
                .catch(
                    function(){

                        /*
                         * Sheet lỗi:
                         * giữ fallback.
                         */

                    }
                );


            }catch(error){}


            return;

        }


        if(
            Date.now() -
            started
            >=
            CONFIG.coreWait
        ){

            return;

        }


        setTimeout(
            waitCore,
            200
        );

    }


    waitCore();

}


/* =========================================================
   QUEST HOOK
========================================================= */

function setQuest(quest){

    state.quest =
        quest ||
        null;


    render();

}


function clearQuest(){

    state.quest =
        null;


    render();

}


/* =========================================================
   QUEST EVENTS
========================================================= */

window.addEventListener(
    "ocdQuestNpcChanged",
    function(event){

        var detail =
            event &&
            event.detail
            ?
            event.detail
            :
            {};


        if(
            state.page &&
            normalize(
                detail.npc ||
                detail.npcName
            )
            ===
            normalize(
                state.page.npc
            )
        ){

            setQuest(
                detail.quest ||
                {}
            );

        }

    }
);


window.addEventListener(
    "ocdQuestCleared",
    function(){

        clearQuest();

    }
);


/* =========================================================
   ESC CLOSE
========================================================= */

document.addEventListener(
    "keydown",
    function(event){

        if(
            event.key === "Escape" &&
            state.dialogOpen
        ){

            closeDialog();

        }

    }
);


/* =========================================================
   PUBLIC API
========================================================= */

window.OCDNpcSystem = {

    version:
        CONFIG.version,


    refresh:
        function(){

            state.page =
                detectPage();


            checkSimulation();


            render();

        },


    open:
        openDialog,


    close:
        closeDialog,


    setQuest:
        setQuest,


    clearQuest:
        clearQuest,


    getPage:
        function(){

            return state.page;

        },


    getNpc:
        function(){

            return state.npc;

        },


    getState:
        function(){

            return {

                version:
                    CONFIG.version,

                path:
                    getPath(),

                page:
                    state.page,

                npc:
                    state.npc,

                questCode:
                    state.questCode,

                simulationActive:
                    state.simulationActive,

                quest:
                    state.quest,

                coreLoaded:
                    state.coreLoaded,

                sheetNpcCount:
                    state.sheetNpc.length

            };

        }

};


/* =========================================================
   INIT
========================================================= */

function init(){

    var root =
        getMount();


    /*
     * Gadget chưa có mount:
     * không chạy.
     */

    if(!root){
        return;
    }


    /*
     * 1. Exact page mapping.
     */

    state.page =
        detectPage();


    /*
     * 2. Quest Gate.
     */

    checkSimulation();


    /*
     * 3. Không có quest hợp lệ:
     *    ẩn hoàn toàn.
     */

    if(!state.simulationActive){

        hideNpc();

        return;

    }


    /*
     * 4. Quest hợp lệ:
     *    render ngay.
     */

    render();


    /*
     * 5. Sau đó mới enrich dữ liệu Sheet.
     */

    loadSheetNpc();

}


/* =========================================================
   START
========================================================= */

function start(){

    /*
     * Cho phép gadget gọi start an toàn
     * sau khi external JS tải xong.
     */

    init();

}


/*
 * Export bootstrap riêng.
 */

window.OCDNpcBootstrap = {

    version:
        CONFIG.version,

    start:
        start

};


/*
 * External JS có thể được tải:
 * - trước DOMContentLoaded
 * - sau DOMContentLoaded
 *
 * Xử lý cả hai trường hợp.
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
