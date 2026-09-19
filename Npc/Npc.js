(function(){

"use strict";

/* =========================================================
   OCD NPC SYSTEM
   Npc/Npc.js
   v4.0.0

   NPC:
   - chỉ render vào #ocdNpcMount
   - không floating
   - không launcher
   - mỗi trang một NPC
========================================================= */


/* =========================================================
   GUARD
========================================================= */

if(window.OCDNpcSystemV4){
    return;
}

window.OCDNpcSystemV4=true;


/* =========================================================
   CONFIG
========================================================= */

const CONFIG={

    version:"4.0.0",

    mountId:"ocdNpcMount",

    /*
       Sheet thương nhân Chợ phiên.
    */
    npcGid:"1348051654",

    coreWaitMs:12000

};


/* =========================================================
   URL MAP

   QUAN TRỌNG:
   Các URL chính xác biết chắc được đặt trước.

   Những trang chưa biết URL chính xác
   có aliases dự phòng phía dưới.
========================================================= */

const PAGE_MAP=[

    /* -----------------------------------------------------
       HOME
    ----------------------------------------------------- */

    {
        id:"HOME",

        npc:null,

        place:"Trang chủ",

        exact:[
            "/",
            "/index.html"
        ],

        contains:[],

        questOnly:false
    },


    /* -----------------------------------------------------
       TRIỂN LÃM
       URL ĐÃ XÁC NHẬN
    ----------------------------------------------------- */

    {
        id:"EXHIBITION",

        npc:"Thư gia",

        place:"Phòng triển lãm",

        exact:[
            "/p/trien-lam.html"
        ],

        contains:[
            "/p/trien-lam"
        ],

        questOnly:false
    },


    /* -----------------------------------------------------
       QUEST
       URL ĐÃ XÁC ĐỊNH
    ----------------------------------------------------- */

    {
        id:"QUEST",

        npc:"Võ tướng",

        place:"Trang nhiệm vụ",

        exact:[
            "/p/quest.html"
        ],

        contains:[
            "/p/quest"
        ],

        questOnly:false
    },


    /* -----------------------------------------------------
       GIẢNG ĐƯỜNG
    ----------------------------------------------------- */

    {
        id:"LECTURE",

        npc:"Thư gia",

        place:"Giảng đường",

        exact:[
            "/p/giang-duong.html"
        ],

        contains:[
            "/p/giang-duong"
        ],

        questOnly:false
    },


    /* -----------------------------------------------------
       BẢNG XẾP HẠNG
    ----------------------------------------------------- */

    {
        id:"RANKING",

        npc:"Nghệ nhân",

        place:"Bảng xếp hạng",

        exact:[
            "/p/bang-xep-hang.html"
        ],

        contains:[
            "/p/bang-xep-hang",
            "/p/xep-hang"
        ],

        questOnly:false
    },


    /* -----------------------------------------------------
       THƯ VIỆN LÂM MÔ
    ----------------------------------------------------- */

    {
        id:"LIBRARY",

        npc:"Nông dân",

        place:"Thư viện lâm mô",

        exact:[
            "/p/thu-vien-lam-mo.html"
        ],

        contains:[
            "/p/thu-vien-lam-mo",
            "/p/thu-vien"
        ],

        questOnly:false
    },


    /* -----------------------------------------------------
       TRA CỨU / CHỢ PHIÊN

       GIAN THƯƠNG CHỈ HIỆN KHI CÓ QUEST.
    ----------------------------------------------------- */

    {
        id:"PROFILE",

        npc:"Gian thương",

        place:"Tra cứu hồ sơ / Chợ phiên",

        exact:[
            "/p/tra-cuu.html"
        ],

        contains:[
            "/p/tra-cuu",
            "/p/ho-so",
            "/p/cho-phien"
        ],

        questOnly:true
    }

];


/* =========================================================
   STATE
========================================================= */

const state={

    rule:null,

    npcs:[],

    npc:null,

    questNpc:"",

    quest:null,

    dialogOpen:false

};


/* =========================================================
   HELPERS
========================================================= */

function str(value){

    return String(
        value == null ? "" : value
    ).trim();

}


function norm(value){

    let s=
        str(value)
        .toLowerCase();


    try{

        s=
            s.normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            );

    }catch(error){}


    return s
        .replace(/đ/g,"d")
        .replace(/\s+/g," ")
        .trim();

}


function esc(value){

    return str(value)

        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");

}


function path(){

    let p=
        String(
            location.pathname || "/"
        )
        .toLowerCase();


    if(
        p.length > 1 &&
        p.endsWith("/")
    ){

        p=
            p.slice(0,-1);

    }


    return p;

}


/* =========================================================
   PAGE DETECTION
========================================================= */

function detectPage(){

    const current=
        path();


    /*
       Exact URL ưu tiên tuyệt đối.
    */

    for(
        const rule of PAGE_MAP
    ){

        if(
            rule.exact.includes(
                current
            )
        ){

            return rule;

        }

    }


    /*
       Alias fallback.
    */

    for(
        const rule of PAGE_MAP
    ){

        if(
            rule.contains.some(
                function(fragment){

                    return(
                        current.includes(
                            fragment
                        )
                    );

                }
            )
        ){

            return rule;

        }

    }


    return{

        id:"NONE",

        npc:null,

        place:"",

        exact:[],

        contains:[],

        questOnly:false

    };

}


/* =========================================================
   MOUNT

   CHỈ CÓ MỘT VỊ TRÍ RENDER NPC.
========================================================= */

function mount(){

    return(
        document.getElementById(
            CONFIG.mountId
        )
    );

}


function hideNpc(){

    const target=
        mount();


    if(!target){
        return;
    }


    target.innerHTML="";

    target.style.display=
        "none";


    state.npc=null;

}


/* =========================================================
   WAIT CORE
========================================================= */

function waitCore(){

    return new Promise(
        function(resolve){

            const start=
                Date.now();


            function check(){

                const RS=
                    window.StudentRewardSystem;


                if(
                    RS &&
                    typeof RS.sheetCsvUrl ===
                    "function"
                ){

                    resolve(RS);

                    return;

                }


                if(
                    Date.now() - start >
                    CONFIG.coreWaitMs
                ){

                    resolve(null);

                    return;

                }


                setTimeout(
                    check,
                    100
                );

            }


            check();

        }
    );

}


/* =========================================================
   LOAD SHEET
========================================================= */

async function loadNpcSheet(){

    const RS=
        await waitCore();


    if(!RS){

        throw new Error(
            "Reward Core chưa sẵn sàng."
        );

    }


    const url=
        RS.sheetCsvUrl(
            CONFIG.npcGid
        );


    if(
        typeof RS.fetchRows ===
        "function"
    ){

        return(
            await RS.fetchRows(
                url+
                (
                    url.includes("?")
                    ?
                    "&"
                    :
                    "?"
                )+
                "_npcv4="+
                Date.now()
            )
        );

    }


    throw new Error(
        "Reward Core không có fetchRows()."
    );

}


/* =========================================================
   COLUMN
========================================================= */

function column(
    headers,
    aliases
){

    for(
        const alias of aliases
    ){

        const exact=
            headers.indexOf(
                norm(alias)
            );


        if(exact >= 0){
            return exact;
        }

    }


    for(
        const alias of aliases
    ){

        const key=
            norm(alias);


        const index=
            headers.findIndex(
                function(header){

                    return(
                        header.includes(key)
                    );

                }
            );


        if(index >= 0){
            return index;
        }

    }


    return -1;

}


/* =========================================================
   MAP NPC
========================================================= */

function mapNpcRows(rows){

    if(
        !Array.isArray(rows) ||
        rows.length < 2
    ){

        return [];

    }


    const headers=
        rows[0].map(norm);


    let iName=
        column(
            headers,
            [
                "Tên nhân vật",
                "Tên NPC"
            ]
        );


    let iImage=
        column(
            headers,
            [
                "Hình ảnh",
                "Icon",
                "Ảnh"
            ]
        );


    let iDescription=
        column(
            headers,
            [
                "Mô tả",
                "Description"
            ]
        );


    /*
       Sheet Chợ phiên cũ.
    */

    if(iName < 0){
        iName=0;
    }


    if(iImage < 0){
        iImage=1;
    }


    if(iDescription < 0){
        iDescription=2;
    }


    return rows
        .slice(1)
        .map(
            function(row,index){

                const name=
                    str(
                        row[iName]
                    );


                return{

                    id:
                        "NPC_"+index,

                    name:name,

                    key:norm(name),

                    image:
                        str(
                            row[iImage]
                        ),

                    description:
                        str(
                            row[iDescription]
                        )

                };

            }
        )
        .filter(
            function(item){

                return Boolean(
                    item.name
                );

            }
        );

}


/* =========================================================
   FIND NPC

   Exact name first.
========================================================= */

function findNpc(name){

    const key=
        norm(name);


    let result=
        state.npcs.find(
            function(item){

                return(
                    item.key === key
                );

            }
        );


    if(result){
        return result;
    }


    /*
       Fallback cho Sheet có thêm chữ
       phía trước/sau tên.
    */

    result=
        state.npcs.find(
            function(item){

                return(
                    item.key.includes(key)
                    ||
                    key.includes(
                        item.key
                    )
                );

            }
        );


    return result || null;

}


/* =========================================================
   IMAGE URL
========================================================= */

function imageUrl(url){

    const source=
        str(url);


    if(!source){
        return "";
    }


    const RS=
        window.StudentRewardSystem;


    if(
        RS &&
        typeof RS.convertDriveImageUrl ===
        "function"
    ){

        try{

            return(
                RS.convertDriveImageUrl(
                    source,
                    500
                )
            );

        }catch(error){}

    }


    let match=
        source.match(
            /\/file\/d\/([^/?]+)/
        );


    if(!match){

        match=
            source.match(
                /[?&]id=([^&]+)/
            );

    }


    if(match){

        return(
            "https://drive.google.com/thumbnail?id="+
            encodeURIComponent(
                match[1]
            )+
            "&sz=w500"
        );

    }


    return source;

}


/* =========================================================
   SHOULD SHOW
========================================================= */

function shouldShow(){

    const rule=
        state.rule;


    if(
        !rule ||
        !rule.npc
    ){

        return false;
    }


    /*
       Trang bình thường.
    */

    if(!rule.questOnly){

        return true;

    }


    /*
       Tra cứu / Chợ phiên.

       Gian thương chỉ xuất hiện khi
       Quest gọi đúng NPC.
    */

    return(
        norm(
            state.questNpc
        )
        ===
        norm(
            rule.npc
        )
    );

}


/* =========================================================
   RENDER

   TUYỆT ĐỐI KHÔNG APPEND VÀO BODY.
========================================================= */

function render(){

    const target=
        mount();


    if(!target){

        console.warn(
            "[NPC] Không tìm thấy #ocdNpcMount."
        );

        return;

    }


    if(!shouldShow()){

        hideNpc();

        return;

    }


    const npc=
        findNpc(
            state.rule.npc
        );


    if(!npc){

        console.warn(
            "[NPC] Sheet không tìm thấy nhân vật:",
            state.rule.npc
        );


        hideNpc();

        return;

    }


    state.npc=
        npc;


    target.style.display=
        "block";


    target.innerHTML="";


    const scene=
        document.createElement(
            "div"
        );


    scene.className=
        "ocd-npc-scene";


    /*
       Đây là button semantic để accessibility,
       nhưng CSS biến nó thành nhân vật đứng,
       không phải launcher tròn.
    */

    const actor=
        document.createElement(
            "button"
        );


    actor.type=
        "button";


    actor.className=
        "ocd-npc-actor";


    actor.setAttribute(
        "aria-label",
        "Trò chuyện với "+
        npc.name
    );


    const picture=
        document.createElement(
            "span"
        );


    picture.className=
        "ocd-npc-image";


    if(npc.image){

        const img=
            document.createElement(
                "img"
            );


        img.src=
            imageUrl(
                npc.image
            );


        img.alt=
            npc.name;


        img.loading=
            "lazy";


        picture.appendChild(
            img
        );

    }else{

        const fallback=
            document.createElement(
                "span"
            );


        fallback.className=
            "ocd-npc-fallback";


        fallback.textContent=
            "NPC";


        picture.appendChild(
            fallback
        );

    }


    /*
       Quest symbol.
    */

    const symbol=
        document.createElement(
            "span"
        );


    symbol.className=
        "ocd-npc-symbol";


    symbol.textContent=
        "!";


    picture.appendChild(
        symbol
    );


    actor.appendChild(
        picture
    );


    const name=
        document.createElement(
            "span"
        );


    name.className=
        "ocd-npc-name";


    name.textContent=
        npc.name;


    actor.appendChild(
        name
    );


    const talk=
        document.createElement(
            "span"
        );


    talk.className=
        "ocd-npc-talk";


    talk.textContent=
        "Chạm để trò chuyện";


    actor.appendChild(
        talk
    );


    actor.addEventListener(
        "click",
        openDialog
    );


    scene.appendChild(
        actor
    );


    /*
       CHỈ append vào gadget.
    */

    target.appendChild(
        scene
    );

}


/* =========================================================
   DIALOG
========================================================= */

function ensureDialog(){

    let root=
        document.getElementById(
            "ocdNpcDialogRoot"
        );


    if(root){
        return root;
    }


    root=
        document.createElement(
            "div"
        );


    root.id=
        "ocdNpcDialogRoot";


    root.innerHTML=`

        <div
            class="ocd-npc-overlay"
            id="ocdNpcOverlay"
        ></div>


        <div
            class="ocd-npc-dialog"
            id="ocdNpcDialog"
            aria-hidden="true"
        >

            <div
                class="ocd-npc-dialog-header"
            >

                <div
                    class="ocd-npc-dialog-picture"
                    id="ocdNpcDialogPicture"
                ></div>


                <h3
                    class="ocd-npc-dialog-name"
                    id="ocdNpcDialogName"
                ></h3>


                <div
                    class="ocd-npc-dialog-place"
                    id="ocdNpcDialogPlace"
                ></div>


                <button
                    type="button"
                    class="ocd-npc-close"
                    id="ocdNpcClose"
                    aria-label="Đóng"
                >
                    ×
                </button>

            </div>


            <div
                class="ocd-npc-dialog-body"
                id="ocdNpcDialogBody"
            ></div>

        </div>

    `;


    /*
       Modal append body là đúng,
       vì nó chỉ xuất hiện khi click.

       NPC chính KHÔNG append body.
    */

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
        "ocdNpcClose"
    )
    .addEventListener(
        "click",
        closeDialog
    );


    return root;

}


/* =========================================================
   DEFAULT SPEECH
========================================================= */

function speech(){

    if(
        state.quest &&
        str(
            state.quest.dialogue
        )
    ){

        return(
            state.quest.dialogue
        );

    }


    if(
        state.npc &&
        state.npc.description
    ){

        return(
            state.npc.description
        );

    }


    switch(
        state.rule.id
    ){

        case "LECTURE":

            return(
                "Chào bạn. Đây là Giảng đường. Ta sẽ giúp bạn khi có nhiệm vụ cần hoàn thành tại đây."
            );


        case "EXHIBITION":

            return(
                "Đây là Phòng triển lãm. Hãy quan sát những tác phẩm được trưng bày và tìm điều bạn cần."
            );


        case "RANKING":

            return(
                "Ta đang theo dõi những bước tiến của các học viên. Thành tích chỉ là một dấu mốc trên hành trình."
            );


        case "LIBRARY":

            return(
                "Trong thư viện có nhiều tư liệu lâm mô. Hãy tìm đúng nội dung phù hợp với việc luyện tập của bạn."
            );


        case "QUEST":

            return(
                "Ta phụ trách những nhiệm vụ trong hành trình của bạn. Khi đã sẵn sàng, hãy xem việc gì đang chờ."
            );


        case "PROFILE":

            return(
                "Ta biết vì sao ngươi tìm đến đây. Hãy xem nhiệm vụ của mình trước khi tiếp tục."
            );


        default:

            return(
                "Có chuyện gì cần ta giúp?"
            );

    }

}


/* =========================================================
   OPEN DIALOG
========================================================= */

function openDialog(){

    if(!state.npc){
        return;
    }


    ensureDialog();


    const picture=
        document.getElementById(
            "ocdNpcDialogPicture"
        );


    picture.innerHTML="";


    if(state.npc.image){

        const img=
            document.createElement(
                "img"
            );


        img.src=
            imageUrl(
                state.npc.image
            );


        img.alt=
            state.npc.name;


        picture.appendChild(
            img
        );

    }


    document.getElementById(
        "ocdNpcDialogName"
    )
    .textContent=
        state.npc.name;


    document.getElementById(
        "ocdNpcDialogPlace"
    )
    .textContent=
        state.rule.place;


    document.getElementById(
        "ocdNpcDialogBody"
    )
    .innerHTML=`

        <div class="ocd-npc-speech">
            ${
                esc(
                    speech()
                )
            }
        </div>

        <div class="ocd-npc-dialog-note">
            ${
                state.quest
                ?
                "Nhân vật đang liên quan đến nhiệm vụ hiện tại của bạn."
                :
                "Hiện chưa có bước nhiệm vụ cần xác nhận tại nhân vật này."
            }
        </div>

    `;


    document.getElementById(
        "ocdNpcOverlay"
    )
    .classList.add(
        "is-open"
    );


    const dialog=
        document.getElementById(
            "ocdNpcDialog"
        );


    dialog.classList.add(
        "is-open"
    );


    dialog.setAttribute(
        "aria-hidden",
        "false"
    );


    state.dialogOpen=true;


    window.dispatchEvent(
        new CustomEvent(
            "ocdAssistantPanelOpened",
            {
                detail:{
                    source:"NPC",
                    npc:
                        state.npc.name,
                    page:
                        state.rule.id
                }
            }
        )
    );

}


/* =========================================================
   CLOSE
========================================================= */

function closeDialog(){

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
            "is-open"
        );

    }


    if(dialog){

        dialog.classList.remove(
            "is-open"
        );


        dialog.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    state.dialogOpen=false;

}


/* =========================================================
   QUEST EVENTS
========================================================= */

window.addEventListener(
    "ocdQuestNpcChanged",
    function(event){

        const detail=
            event.detail || {};


        state.questNpc=
            str(
                detail.npc ||
                detail.npcName
            );


        state.quest=
            detail.quest ||
            null;


        render();

    }
);


window.addEventListener(
    "ocdQuestCleared",
    function(){

        state.questNpc="";

        state.quest=null;


        render();

    }
);


/* =========================================================
   PUBLIC API

   Có thêm hàm test không cần Console.
========================================================= */

window.OCDNpcSystem={

    version:
        CONFIG.version,


    refresh:function(){

        state.rule=
            detectPage();

        render();

    },


    getPage:function(){

        return(
            Object.assign(
                {},
                state.rule
            )
        );

    },


    getNpc:function(){

        return(
            state.npc
            ?
            Object.assign(
                {},
                state.npc
            )
            :
            null
        );

    },


    setQuestNpc:function(
        npc,
        quest
    ){

        state.questNpc=
            str(npc);


        state.quest=
            quest || null;


        render();

    },


    clearQuest:function(){

        state.questNpc="";

        state.quest=null;


        render();

    },


    close:
        closeDialog

};


/* =========================================================
   INIT
========================================================= */

async function init(){

    const target=
        mount();


    /*
       Nếu không có gadget thì KHÔNG tạo NPC
       ở bất kỳ nơi nào khác.
    */

    if(!target){

        console.warn(
            "[NPC] Gadget #ocdNpcMount không tồn tại."
        );

        return;

    }


    state.rule=
        detectPage();


    /*
       Trang chủ / trang chưa khai báo:
       dừng hoàn toàn.
    */

    if(
        !state.rule.npc
    ){

        hideNpc();

        return;

    }


    target.innerHTML=`
        <div class="ocd-npc-loading">
            Đang gọi nhân vật...
        </div>
    `;


    try{

        const rows=
            await loadNpcSheet();


        state.npcs=
            mapNpcRows(
                rows
            );


        render();


    }catch(error){

        console.error(
            "[NPC]",
            error
        );


        hideNpc();

    }

}


/* =========================================================
   DOM READY
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
