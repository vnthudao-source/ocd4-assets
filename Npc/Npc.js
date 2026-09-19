(function(){

"use strict";

/* =========================================================
   OCD NPC SYSTEM
   Npc/Npc.js
   v3.0.0

   KIẾN TRÚC
   ---------------------------------------------------------
   - Gadget ở đâu -> NPC xuất hiện ở đó.
   - KHÔNG cần chèn NPC vào từng trang.
   - KHÔNG fixed.
   - Trang hiện tại quyết định NPC.
   - Ảnh NPC lấy từ Sheet thương nhân Chợ phiên.
   - Trang chủ không có NPC.
   - Profile/Market: Gian thương chỉ xuất hiện khi Quest gọi.
========================================================= */


/* =========================================================
   DUPLICATE GUARD
========================================================= */

if(window.OCDNpcSystem){
    return;
}


/* =========================================================
   CONFIG
========================================================= */

const CONFIG={

    version:"3.0.0",

    /*
       Sheet thương nhân thật
       đang dùng trong Chợ phiên.
    */
    npcGid:"1348051654",

    fetchTimeout:12000,

    mountId:"ocdNpcMount",

    dialogRootId:"ocdNpcDialogRoot"

};


/* =========================================================
   PAGE RULES

   ĐÂY LÀ BẢNG PHÂN NPC CHO TỪNG TRANG.
========================================================= */

const PAGE_RULES=[

    /* =====================================================
       TRANG CHỦ
       Không NPC.
    ===================================================== */

    {
        id:"HOME",

        test:function(path){

            return(
                path === "/" ||
                path === ""
            );

        },

        npc:null,

        place:"Trang chủ",

        mode:"NONE"
    },


    /* =====================================================
       PHÒNG TRIỂN LÃM
    ===================================================== */

    {
        id:"EXHIBITION",

        test:function(path){

            return(
                path === "/p/trien-lam.html" ||
                path.includes(
                    "/p/trien-lam"
                )
            );

        },

        npc:"Thư gia",

        place:"Phòng triển lãm",

        mode:"ALWAYS"
    },


    /* =====================================================
       TRANG XEM NHIỆM VỤ
    ===================================================== */

    {
        id:"QUEST",

        test:function(path){

            return(
                path === "/p/quest.html" ||
                path.includes(
                    "/p/quest"
                )
            );

        },

        npc:"Võ tướng",

        place:"Nhiệm vụ",

        mode:"ALWAYS"
    },


    /* =====================================================
       GIẢNG ĐƯỜNG

       Hỗ trợ nhiều URL có thể đang dùng.
    ===================================================== */

    {
        id:"LECTURE_HALL",

        test:function(path){

            return(
                path.includes(
                    "giang-duong"
                )
                ||
                path.includes(
                    "lecture"
                )
            );

        },

        npc:"Thư gia",

        place:"Giảng đường",

        mode:"ALWAYS"
    },


    /* =====================================================
       BẢNG XẾP HẠNG
    ===================================================== */

    {
        id:"RANKING",

        test:function(path){

            return(
                path.includes(
                    "bang-xep-hang"
                )
                ||
                path.includes(
                    "xep-hang"
                )
                ||
                path.includes(
                    "xephang"
                )
            );

        },

        npc:"Nghệ nhân",

        place:"Bảng xếp hạng",

        mode:"ALWAYS"
    },


    /* =====================================================
       THƯ VIỆN LÂM MÔ
    ===================================================== */

    {
        id:"LIBRARY",

        test:function(path){

            return(
                path.includes(
                    "thu-vien"
                )
                ||
                path.includes(
                    "thu-vien-lam-mo"
                )
                ||
                path.includes(
                    "library"
                )
            );

        },

        npc:"Nông dân",

        place:"Thư viện lâm mô",

        mode:"ALWAYS"
    },


    /* =====================================================
       TRA CỨU / HỒ SƠ / CHỢ PHIÊN

       Gian thương KHÔNG tự xuất hiện.

       Chỉ xuất hiện khi Quest Engine báo:
       NPC cần gặp = Gian thương.
    ===================================================== */

    {
        id:"PROFILE_MARKET",

        test:function(path){

            return(
                path.includes(
                    "tra-cuu"
                )
                ||
                path.includes(
                    "ho-so"
                )
                ||
                path.includes(
                    "cho-phien"
                )
            );

        },

        npc:"Gian thương",

        place:"Tra cứu hồ sơ / Chợ phiên",

        mode:"QUEST_ONLY"
    }

];


/* =========================================================
   STATE
========================================================= */

const state={

    initialized:false,

    loading:false,

    npcRowsLoaded:false,

    npcs:[],

    pageRule:null,

    currentNpc:null,

    dialogOpen:false,

    questNpc:"",

    questData:null

};


/* =========================================================
   HELPERS
========================================================= */

function text(value){

    return String(
        value == null
        ?
        ""
        :
        value
    ).trim();

}


function normalize(value){

    let source=
        text(value)
        .toLowerCase();


    try{

        source=
            source
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            );

    }catch(error){}


    return source
        .replace(/đ/g,"d")
        .replace(/\s+/g," ")
        .trim();

}


function escapeHtml(value){

    return text(value)

        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");

}


function getPath(){

    return(
        String(
            window.location.pathname ||
            "/"
        )
        .toLowerCase()
        .replace(/\/+$/,"")
        ||
        "/"
    );

}


/* =========================================================
   PAGE DETECTION
========================================================= */

function detectPage(){

    const path=
        getPath();


    for(
        let i=0;
        i<PAGE_RULES.length;
        i++
    ){

        const rule=
            PAGE_RULES[i];


        try{

            if(
                rule.test(
                    path
                )
            ){

                return rule;

            }

        }catch(error){

            console.warn(
                "[OCD NPC] PAGE_RULE error:",
                rule.id,
                error
            );

        }

    }


    /*
       Trang không được khai báo
       -> không hiện NPC.
    */

    return{

        id:"UNKNOWN",

        npc:null,

        place:"",

        mode:"NONE"

    };

}


/* =========================================================
   MOUNT
========================================================= */

function getMount(){

    return(
        document.getElementById(
            CONFIG.mountId
        )
    );

}


function clearMount(){

    const mount=
        getMount();


    if(mount){

        mount.innerHTML="";

        mount.style.display=
            "none";

    }


    state.currentNpc=null;

}


/* =========================================================
   COLUMN HELPERS
========================================================= */

function findColumn(
    headers,
    candidates
){

    const normalizedCandidates=
        candidates.map(
            normalize
        );


    for(
        let i=0;
        i<normalizedCandidates.length;
        i++
    ){

        const exact=
            headers.indexOf(
                normalizedCandidates[i]
            );


        if(exact >= 0){
            return exact;
        }

    }


    for(
        let i=0;
        i<normalizedCandidates.length;
        i++
    ){

        const found=
            headers.findIndex(
                function(header){

                    return(
                        header.includes(
                            normalizedCandidates[i]
                        )
                    );

                }
            );


        if(found >= 0){
            return found;
        }

    }


    return -1;

}


/* =========================================================
   DRIVE IMAGE
========================================================= */

function convertImageUrl(
    url,
    size
){

    const source=
        text(url);


    if(!source){
        return "";
    }


    const RS=
        window.StudentRewardSystem;


    /*
       Ưu tiên hàm của Core nếu có.
    */

    if(
        RS &&
        typeof RS.convertDriveImageUrl ===
        "function"
    ){

        try{

            return(
                RS.convertDriveImageUrl(
                    source,
                    size || 500
                )
            );

        }catch(error){}

    }


    let match=
        source.match(
            /\/file\/d\/([^/?]+)/i
        );


    if(!match){

        match=
            source.match(
                /[?&]id=([^&]+)/i
            );

    }


    if(match && match[1]){

        return(
            "https://drive.google.com/thumbnail?id="+
            encodeURIComponent(
                match[1]
            )+
            "&sz=w"+
            Number(
                size || 500
            )
        );

    }


    return source;

}


/* =========================================================
   CREATE IMAGE
========================================================= */

function createNpcImage(
    npc
){

    if(!npc.image){

        const fallback=
            document.createElement(
                "span"
            );


        fallback.className=
            "ocd-npc-avatar-fallback";


        fallback.textContent=
            "NPC";


        return fallback;

    }


    const img=
        document.createElement(
            "img"
        );


    img.src=
        convertImageUrl(
            npc.image,
            500
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
                    "span"
                );


            fallback.className=
                "ocd-npc-avatar-fallback";


            fallback.textContent=
                "NPC";


            if(img.parentNode){

                img.parentNode
                .replaceChild(
                    fallback,
                    img
                );

            }

        },
        {
            once:true
        }
    );


    return img;

}


/* =========================================================
   WAIT REWARD CORE
========================================================= */

function waitForCore(){

    return new Promise(
        function(resolve){

            const existing=
                window.StudentRewardSystem;


            if(
                existing &&
                typeof existing.sheetCsvUrl ===
                "function"
            ){

                resolve(
                    existing
                );

                return;

            }


            let attempts=0;


            const timer=
                setInterval(
                    function(){

                        attempts++;


                        const RS=
                            window.StudentRewardSystem;


                        if(
                            RS &&
                            typeof RS.sheetCsvUrl ===
                            "function"
                        ){

                            clearInterval(
                                timer
                            );


                            resolve(
                                RS
                            );


                            return;

                        }


                        if(attempts >= 200){

                            clearInterval(
                                timer
                            );


                            resolve(
                                null
                            );

                        }

                    },
                    50
                );

        }
    );

}


/* =========================================================
   LOAD NPC SHEET

   Dùng chính cơ chế Core đang dùng cho Chợ phiên.
========================================================= */

async function loadNpcRows(){

    const RS=
        await waitForCore();


    if(
        !RS ||
        typeof RS.sheetCsvUrl !==
        "function"
    ){

        throw new Error(
            "Không tìm thấy Reward Core."
        );

    }


    const baseUrl=
        RS.sheetCsvUrl(
            CONFIG.npcGid
        );


    const url=
        baseUrl+
        (
            baseUrl.includes("?")
            ?
            "&"
            :
            "?"
        )+
        "_npc="+
        Date.now();


    if(
        typeof RS.fetchRows ===
        "function"
    ){

        return(
            await RS.fetchRows(
                url
            )
        );

    }


    const controller=
        new AbortController();


    const timer=
        setTimeout(
            function(){

                controller.abort();

            },
            CONFIG.fetchTimeout
        );


    try{

        const response=
            await fetch(
                url,
                {
                    cache:"no-store",
                    credentials:"omit",
                    signal:
                        controller.signal
                }
            );


        if(!response.ok){

            throw new Error(
                "Không tải được Sheet NPC."
            );

        }


        const csv=
            await response.text();


        return parseCsv(
            csv
        );


    }finally{

        clearTimeout(
            timer
        );

    }

}


/* =========================================================
   CSV FALLBACK
========================================================= */

function parseCsv(csv){

    const rows=[];

    let row=[];
    let cell="";
    let quoted=false;


    const source=
        String(csv || "")
        .replace(/^\uFEFF/,"");


    for(
        let i=0;
        i<source.length;
        i++
    ){

        const char=
            source[i];

        const next=
            source[i+1];


        if(
            char === '"' &&
            quoted &&
            next === '"'
        ){

            cell+='"';

            i++;

            continue;

        }


        if(char === '"'){

            quoted=!quoted;

            continue;

        }


        if(
            char === "," &&
            !quoted
        ){

            row.push(cell);

            cell="";

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
                next === "\n"
            ){

                i++;

            }


            row.push(cell);


            if(
                row.some(
                    function(value){

                        return(
                            text(value) !== ""
                        );

                    }
                )
            ){

                rows.push(
                    row
                );

            }


            row=[];
            cell="";

            continue;

        }


        cell+=char;

    }


    if(
        cell !== "" ||
        row.length
    ){

        row.push(cell);


        if(
            row.some(
                function(value){

                    return(
                        text(value) !== ""
                    );

                }
            )
        ){

            rows.push(
                row
            );

        }

    }


    return rows;

}


/* =========================================================
   MAP NPC SHEET

   Tương thích Sheet thương nhân Chợ phiên:
   - Tên nhân vật / Tên NPC
   - Hình ảnh / Icon
   - Mô tả
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
            normalize
        );


    let nameIndex=
        findColumn(
            headers,
            [
                "tên nhân vật",
                "ten nhan vat",
                "tên npc",
                "ten npc"
            ]
        );


    let imageIndex=
        findColumn(
            headers,
            [
                "hình ảnh",
                "hinh anh",
                "icon",
                "ảnh",
                "anh"
            ]
        );


    let descriptionIndex=
        findColumn(
            headers,
            [
                "mô tả",
                "mo ta",
                "description"
            ]
        );


    /*
       Fallback tương thích Sheet cũ.
    */

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
            function(row,index){

                const name=
                    text(
                        row[
                            nameIndex
                        ]
                    );


                return{

                    id:
                        "NPC_"+index,

                    name:
                        name,

                    key:
                        normalize(
                            name
                        ),

                    image:
                        text(
                            row[
                                imageIndex
                            ]
                        ),

                    description:
                        text(
                            row[
                                descriptionIndex
                            ]
                        )

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
   FIND NPC BY NAME
========================================================= */

function findNpc(
    npcName
){

    const key=
        normalize(
            npcName
        );


    if(!key){
        return null;
    }


    /*
       Exact trước.
    */

    let npc=
        state.npcs.find(
            function(item){

                return(
                    item.key ===
                    key
                );

            }
        );


    if(npc){
        return npc;
    }


    /*
       Partial fallback.
    */

    npc=
        state.npcs.find(
            function(item){

                return(
                    item.key.includes(
                        key
                    )
                    ||
                    key.includes(
                        item.key
                    )
                );

            }
        );


    return(
        npc ||
        null
    );

}


/* =========================================================
   QUEST NPC CHECK

   PROFILE/MARKET chỉ hiện Gian thương
   nếu Quest hiện tại yêu cầu Gian thương.
========================================================= */

function isQuestNpcActive(
    npcName
){

    const target=
        normalize(
            npcName
        );


    if(!target){
        return false;
    }


    /*
       Nguồn 1:
       state được Quest Engine gửi trực tiếp.
    */

    if(
        normalize(
            state.questNpc
        )
        ===
        target
    ){

        return true;

    }


    /*
       Nguồn 2:
       API Quest Engine tương lai.

       Không phụ thuộc bắt buộc.
    */

    const QE=
        window.OCDQuestEngine;


    if(QE){

        try{

            if(
                typeof QE.getActiveQuest ===
                "function"
            ){

                const quest=
                    QE.getActiveQuest();


                if(
                    quest &&
                    normalize(
                        quest.npc ||
                        quest.npcName
                    )
                    ===
                    target
                ){

                    state.questData=
                        quest;


                    return true;

                }

            }

        }catch(error){

            console.warn(
                "[OCD NPC] Quest check:",
                error
            );

        }

    }


    return false;

}


/* =========================================================
   SHOULD DISPLAY
========================================================= */

function shouldDisplay(
    rule
){

    if(
        !rule ||
        !rule.npc ||
        rule.mode === "NONE"
    ){

        return false;
    }


    if(
        rule.mode ===
        "ALWAYS"
    ){

        return true;
    }


    if(
        rule.mode ===
        "QUEST_ONLY"
    ){

        return(
            isQuestNpcActive(
                rule.npc
            )
        );

    }


    return false;

}


/* =========================================================
   RENDER NPC AT GADGET POSITION
========================================================= */

function renderNpc(){

    const mount=
        getMount();


    if(!mount){
        return;
    }


    state.pageRule=
        detectPage();


    if(
        !shouldDisplay(
            state.pageRule
        )
    ){

        clearMount();

        return;

    }


    const npc=
        findNpc(
            state.pageRule.npc
        );


    if(!npc){

        /*
           Không hiển thị NPC giả nếu
           Sheet không có đúng nhân vật.
        */

        clearMount();


        console.warn(
            "[OCD NPC] Không tìm thấy:",
            state.pageRule.npc
        );


        return;

    }


    state.currentNpc=
        npc;


    mount.style.display=
        "";


    mount.innerHTML="";


    const area=
        document.createElement(
            "div"
        );


    area.className=
        "ocd-npc-area";


    const character=
        document.createElement(
            "button"
        );


    character.type=
        "button";


    character.className=
        "ocd-npc-character";


    character.setAttribute(
        "aria-label",
        "Trò chuyện với "+
        npc.name
    );


    const avatarWrap=
        document.createElement(
            "span"
        );


    avatarWrap.className=
        "ocd-npc-avatar-wrap";


    const avatar=
        document.createElement(
            "span"
        );


    avatar.className=
        "ocd-npc-avatar";


    avatar.appendChild(
        createNpcImage(
            npc
        )
    );


    avatarWrap.appendChild(
        avatar
    );


    /*
       Dấu nhiệm vụ.
    */

    const mark=
        document.createElement(
            "span"
        );


    mark.className=
        "ocd-npc-mark";


    mark.textContent=
        "!";


    avatarWrap.appendChild(
        mark
    );


    character.appendChild(
        avatarWrap
    );


    const name=
        document.createElement(
            "span"
        );


    name.className=
        "ocd-npc-name";


    name.textContent=
        npc.name;


    character.appendChild(
        name
    );


    const hint=
        document.createElement(
            "span"
        );


    hint.className=
        "ocd-npc-hint";


    hint.textContent=
        "Chạm để trò chuyện";


    character.appendChild(
        hint
    );


    character.addEventListener(
        "click",
        function(){

            openDialog();

        }
    );


    area.appendChild(
        character
    );


    mount.appendChild(
        area
    );

}


/* =========================================================
   DIALOG ROOT
========================================================= */

function ensureDialogRoot(){

    let root=
        document.getElementById(
            CONFIG.dialogRootId
        );


    if(root){
        return root;
    }


    root=
        document.createElement(
            "div"
        );


    root.id=
        CONFIG.dialogRootId;


    root.innerHTML=`

        <div
            class="ocd-npc-overlay"
            id="ocdNpcOverlay"
        ></div>


        <section
            class="ocd-npc-dialog"
            id="ocdNpcDialog"
            aria-hidden="true"
        >

            <header
                class="ocd-npc-dialog-head"
            >

                <div
                    class="ocd-npc-dialog-avatar"
                    id="ocdNpcDialogAvatar"
                ></div>


                <div>

                    <div
                        class="ocd-npc-dialog-label"
                    >
                        NHÂN VẬT
                    </div>


                    <h3
                        class="ocd-npc-dialog-name"
                        id="ocdNpcDialogName"
                    ></h3>


                    <div
                        class="ocd-npc-dialog-place"
                        id="ocdNpcDialogPlace"
                    ></div>

                </div>


                <button
                    type="button"
                    class="ocd-npc-close"
                    id="ocdNpcDialogClose"
                    aria-label="Đóng"
                >
                    ×
                </button>

            </header>


            <div
                class="ocd-npc-dialog-body"
                id="ocdNpcDialogBody"
            ></div>

        </section>

    `;


    document.body.appendChild(
        root
    );


    document.getElementById(
        "ocdNpcOverlay"
    )
    .addEventListener(
        "click",
        closeDialog
    );


    document.getElementById(
        "ocdNpcDialogClose"
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

    const npc=
        state.currentNpc;


    const rule=
        state.pageRule;


    if(
        !npc ||
        !rule
    ){

        return;

    }


    ensureDialogRoot();


    const avatar=
        document.getElementById(
            "ocdNpcDialogAvatar"
        );


    avatar.innerHTML="";


    avatar.appendChild(
        createNpcImage(
            npc
        )
    );


    document.getElementById(
        "ocdNpcDialogName"
    )
    .textContent=
        npc.name;


    document.getElementById(
        "ocdNpcDialogPlace"
    )
    .textContent=
        rule.place ||
        document.title;


    renderDialogBody();


    document.getElementById(
        "ocdNpcOverlay"
    )
    .classList.add(
        "visible"
    );


    const dialog=
        document.getElementById(
            "ocdNpcDialog"
        );


    dialog.classList.add(
        "visible"
    );


    dialog.setAttribute(
        "aria-hidden",
        "false"
    );


    state.dialogOpen=true;


    /*
       Cho Minh Hồng biết NPC đã mở.
       Minh Hồng có thể đóng popup của mình.
    */

    window.dispatchEvent(
        new CustomEvent(
            "ocdAssistantPanelOpened",
            {
                detail:{
                    source:"NPC",
                    npc:npc.name,
                    page:rule.id
                }
            }
        )
    );

}


/* =========================================================
   DIALOG CONTENT
========================================================= */

function renderDialogBody(){

    const body=
        document.getElementById(
            "ocdNpcDialogBody"
        );


    const npc=
        state.currentNpc;


    const rule=
        state.pageRule;


    if(
        !body ||
        !npc ||
        !rule
    ){

        return;

    }


    let html=`

        <div
            class="ocd-npc-speech"
        >
            ${
                escapeHtml(
                    npc.description ||
                    getDefaultDialogue(
                        rule,
                        npc
                    )
                )
            }
        </div>

    `;


    /*
       Nếu Quest Engine đã truyền Quest,
       hiển thị nhiệm vụ.
    */

    if(state.questData){

        const quest=
            state.questData;


        const title=
            text(
                quest.title ||
                quest.name ||
                quest.questName
            );


        const content=
            text(
                quest.npcDialogue ||
                quest.dialogue ||
                quest.description
            );


        if(
            title ||
            content
        ){

            html+=`

                <div
                    class="ocd-npc-quest-box"
                >

                    <div
                        class="ocd-npc-quest-head"
                    >

                        <div
                            class="ocd-npc-quest-label"
                        >
                            NHIỆM VỤ ĐANG THỰC HIỆN
                        </div>


                        <h4
                            class="ocd-npc-quest-title"
                        >
                            ${
                                escapeHtml(
                                    title ||
                                    "Nhiệm vụ"
                                )
                            }
                        </h4>

                    </div>


                    ${
                        content
                        ?
                        `

                        <div
                            class="ocd-npc-quest-content"
                        >
                            ${
                                escapeHtml(
                                    content
                                )
                            }
                        </div>

                        `
                        :
                        ""
                    }

                </div>

            `;

        }

    }


    /*
       Tạm thời chưa tự thưởng / tự hoàn thành Quest.
    */

    html+=`

        <div
            class="ocd-npc-status"
        >
            Hãy trò chuyện với nhân vật để tiếp tục
            hành trình nhiệm vụ của bạn.
        </div>

    `;


    body.innerHTML=
        html;

}


/* =========================================================
   DEFAULT DIALOGUE
========================================================= */

function getDefaultDialogue(
    rule,
    npc
){

    switch(rule.id){

        case "LECTURE_HALL":

            return(
                "Chào bạn. Đây là Giảng đường. Nếu có việc cần hoàn thành tại đây, ta sẽ hướng dẫn bạn."
            );


        case "EXHIBITION":

            return(
                "Phòng triển lãm lưu giữ những bài viết nổi bật. Hãy xem thật kỹ trước khi tiếp tục hành trình."
            );


        case "RANKING":

            return(
                "Thành tích chỉ là một dấu mốc. Điều quan trọng hơn là bạn tiến bộ thế nào qua từng bài viết."
            );


        case "LIBRARY":

            return(
                "Thư viện có nhiều tư liệu lâm mô. Hãy tìm đúng nội dung bạn đang cần luyện tập."
            );


        case "QUEST":

            return(
                "Ta phụ trách việc dẫn đường cho những nhiệm vụ đang chờ bạn."
            );


        case "PROFILE_MARKET":

            return(
                "Có vẻ bạn tìm ta vì một nhiệm vụ. Đừng vội, hãy xem mình cần mang gì trở về."
            );


        default:

            return(
                npc.description ||
                "Có chuyện gì cần ta giúp?"
            );

    }

}


/* =========================================================
   CLOSE DIALOG
========================================================= */

function closeDialog(){

    state.dialogOpen=false;


    const overlay=
        document.getElementById(
            "ocdNpcOverlay"
        );


    const dialog=
        document.getElementById(
            "ocdNpcDialog"
        );


    if(overlay){

        overlay.classList.remove(
            "visible"
        );

    }


    if(dialog){

        dialog.classList.remove(
            "visible"
        );


        dialog.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    window.dispatchEvent(
        new CustomEvent(
            "ocdAssistantPanelClosed",
            {
                detail:{
                    source:"NPC"
                }
            }
        )
    );

}


/* =========================================================
   QUEST EVENT

   Quest Engine sau này chỉ cần phát:

   window.dispatchEvent(
       new CustomEvent(
           "ocdQuestNpcChanged",
           {
               detail:{
                   npc:"Gian thương",
                   quest:{...}
               }
           }
       )
   );

========================================================= */

window.addEventListener(
    "ocdQuestNpcChanged",
    function(event){

        const detail=
            (
                event &&
                event.detail
            )
            ||
            {};


        state.questNpc=
            text(
                detail.npc ||
                detail.npcName
            );


        state.questData=
            detail.quest ||
            null;


        renderNpc();

    }
);


/* =========================================================
   QUEST CLEARED
========================================================= */

window.addEventListener(
    "ocdQuestCleared",
    function(){

        state.questNpc="";

        state.questData=null;


        renderNpc();

    }
);


/* =========================================================
   ESC
========================================================= */

document.addEventListener(
    "keydown",
    function(event){

        if(
            event.key ===
            "Escape" &&
            state.dialogOpen
        ){

            closeDialog();

        }

    }
);


/* =========================================================
   LOAD NPC DATA
========================================================= */

async function loadNpcData(){

    if(state.loading){
        return;
    }


    state.loading=true;


    try{

        const rows=
            await loadNpcRows();


        state.npcs=
            mapNpcRows(
                rows
            );


        state.npcRowsLoaded=
            true;


        if(!state.npcs.length){

            throw new Error(
                "Sheet thương nhân không có dữ liệu NPC hợp lệ."
            );

        }


        renderNpc();


        window.dispatchEvent(
            new CustomEvent(
                "ocdNpcReady",
                {
                    detail:{
                        version:
                            CONFIG.version,

                        count:
                            state.npcs.length,

                        page:
                            state.pageRule
                            ?
                            state.pageRule.id
                            :
                            ""
                    }
                }
            )
        );


    }catch(error){

        console.error(
            "[OCD NPC]",
            error
        );


        clearMount();


    }finally{

        state.loading=false;

    }

}


/* =========================================================
   REFRESH
========================================================= */

function refresh(){

    state.pageRule=
        detectPage();


    if(
        !state.npcRowsLoaded
    ){

        return(
            loadNpcData()
        );

    }


    renderNpc();

}


/* =========================================================
   PUBLIC QUEST API

   Cho phép test ngay bằng Console:

   OCDNpcSystem.setQuestNpc(
       "Gian thương",
       {
           title:"Gặp Gian thương",
           description:"Hãy hỏi hắn về mật lệnh."
       }
   );

========================================================= */

function setQuestNpc(
    npcName,
    quest
){

    state.questNpc=
        text(
            npcName
        );


    state.questData=
        quest ||
        null;


    renderNpc();

}


function clearQuestNpc(){

    state.questNpc="";

    state.questData=null;


    renderNpc();

}


/* =========================================================
   INIT
========================================================= */

async function init(){

    if(state.initialized){
        return;
    }


    state.initialized=true;


    state.pageRule=
        detectPage();


    /*
       Trang không có NPC:
       dừng sớm.

       Đặc biệt Trang chủ sẽ không tải
       Sheet NPC vô ích.
    */

    if(
        !state.pageRule ||
        state.pageRule.mode ===
        "NONE"
    ){

        clearMount();

        return;

    }


    /*
       Profile Market QUEST_ONLY vẫn cần hệ thống
       để Quest có thể gọi Gian thương sau đó.
    */

    ensureDialogRoot();


    await loadNpcData();

}


/* =========================================================
   PUBLIC API
========================================================= */

window.OCDNpcSystem={

    version:
        CONFIG.version,


    init:
        init,


    refresh:
        refresh,


    close:
        closeDialog,


    setQuestNpc:
        setQuestNpc,


    clearQuestNpc:
        clearQuestNpc,


    getCurrentPage:function(){

        return(
            Object.assign(
                {},
                state.pageRule ||
                detectPage()
            )
        );

    },


    getCurrentNpc:function(){

        if(!state.currentNpc){
            return null;
        }


        return(
            Object.assign(
                {},
                state.currentNpc
            )
        );

    },


    getNpcs:function(){

        return(
            state.npcs.map(
                function(npc){

                    return(
                        Object.assign(
                            {},
                            npc
                        )
                    );

                }
            )
        );

    }

};


/* =========================================================
   AUTO INIT
========================================================= */

if(
    document.readyState ===
    "loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        init,
        {
            once:true
        }
    );

}else{

    init();

}

})();
