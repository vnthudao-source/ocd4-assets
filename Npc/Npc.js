(function(){

"use strict";

/* =========================================================
   OCD NPC QUEST SYSTEM
   npc-quest.js
   v1.0.0

   MỤC TIÊU:
   - Gadget NPC dùng chung toàn website
   - Sẵn sàng đồng bộ Minh Hồng
   - Quest/NPC ưu tiên dữ liệu Google Sheet
   - Không hard-code nghiệp vụ vào từng trang
   - Không tự cộng Linh Thạch
   - Reward Core vẫn là nguồn tài sản chuẩn
   - Có API công khai cho các module khác

   PHIÊN BẢN 1.0:
   - SAFE MODE
   - Có dữ liệu demo để dựng giao diện
   - Chưa ghi giao dịch thật
   - Chưa nối Sheet thật
========================================================= */


/* =========================================================
   DUPLICATE GUARD
========================================================= */

if(window.OCDNpcQuestSystem){
    return;
}


/* =========================================================
   CONFIG
========================================================= */

const CONFIG={

    version:"1.0.0",

    timezone:
        "Asia/Ho_Chi_Minh",

    rootId:
        "ocdNpcQuestRoot",

    /*
       true:
       dùng dữ liệu mẫu phía dưới.

       Khi Google Sheet hoàn chỉnh:
       đổi thành false.
    */
    demoMode:true,

    /*
       SAFE MODE:
       không phát thưởng thật.
    */
    rewardWriteEnabled:false,

    /*
       Sau này điền endpoint / CSV / GViz
       của Google Sheet.
    */
    sheets:{

        npc:"",
        quest:"",
        progress:"",
        questCode:""

    },

    /*
       Dùng cho nhận diện trang hiện tại.
    */
    pageAliases:{

        "/":
            "HOME",

        "/p/giang-duong.html":
            "GIANG_DUONG",

        "/p/thu-vien.html":
            "THU_VIEN",

        "/p/tra-cuu.html":
            "CHO_PHIEN"

    }

};


/* =========================================================
   STATE
========================================================= */

const state={

    ready:false,

    open:false,

    loading:false,

    studentCode:"",

    student:null,

    currentPage:"",

    npcs:[],

    quests:[],

    progress:[],

    questCodes:[],

    activeNpc:null,

    activeQuest:null,

    message:null

};


/* =========================================================
   DEMO DATA

   CHỈ ĐỂ DỰNG GIAO DIỆN.

   Sau này toàn bộ khối này có thể bỏ
   mà không phải sửa Quest Engine/UI.
========================================================= */

const DEMO={

    npcs:[

        {
            npcId:"NPC_GIANGDUONG",

            name:"Thư Sinh",

            role:"Người giữ Giảng đường",

            image:"",

            description:
                "Một thư sinh thường xuất hiện tại Giảng đường.",

            page:"GIANG_DUONG",

            enabled:true
        },

        {
            npcId:"NPC_THUVIEN",

            name:"Thủ Thư",

            role:"Người giữ Thư viện",

            image:"",

            description:
                "Người trông coi những tài liệu trong Thư viện.",

            page:"THU_VIEN",

            enabled:true
        },

        {
            npcId:"NPC_CHO",

            name:"Nghệ Nhân",

            role:"Khách của Chợ phiên",

            image:"",

            description:
                "Một nghệ nhân thường xuất hiện giữa Chợ phiên.",

            page:"CHO_PHIEN",

            enabled:true
        }

    ],


    quests:[

        {
            questId:"Q001",

            title:
                "Lời nhắn nơi Giảng đường",

            description:
                "Minh Hồng muốn bạn đến Giảng đường và tìm gặp Thư Sinh.",

            objective:
                "Đến Giảng đường, gặp Thư Sinh và nhận mật lệnh.",

            targetPage:
                "GIANG_DUONG",

            npcId:
                "NPC_GIANGDUONG",

            rewardType:
                "hoangNgoc",

            rewardAmount:
                2,

            rewardLabel:
                "2 Hoàng Ngọc",

            enabled:true
        }

    ],


    progress:[

        /*
        {
            studentCode:"OCD401",
            questId:"Q001",
            status:"ACTIVE"
        }
        */

    ],


    questCodes:[

        /*
        {
            studentCode:"OCD401",
            questId:"Q001",
            code:"GD-7K2P"
        }
        */

    ]

};


/* =========================================================
   HELPERS
========================================================= */

function cleanText(value){

    return String(
        value == null
        ?
        ""
        :
        value
    )
    .trim();

}


function normalizeCode(value){

    return cleanText(value)
        .toUpperCase()
        .replace(/\s+/g,"");

}


function escapeHtml(value){

    return cleanText(value)

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
            "&#039;"
        );

}


function getCurrentPage(){

    const path=
        window.location.pathname
        .replace(/\/+$/,"")
        ||
        "/";

    if(
        CONFIG.pageAliases[
            path
        ]
    ){

        return(
            CONFIG.pageAliases[
                path
            ]
        );

    }

    return(
        path
        .replace(/^\/+/,"")
        .replace(/[^a-zA-Z0-9]+/g,"_")
        .toUpperCase()
        ||
        "UNKNOWN"
    );

}


/* =========================================================
   GOOGLE DRIVE IMAGE
========================================================= */

function convertDriveImageUrl(
    url,
    size
){

    const raw=
        cleanText(url);

    if(!raw){
        return "";
    }


    /*
       Ưu tiên dùng hàm chuẩn từ Reward Core
       nếu đang tồn tại.
    */

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
                    raw,
                    size || 400
                )
            );

        }catch(error){

            console.warn(
                "[NPC Quest] Core image converter:",
                error
            );

        }

    }


    /*
       Fallback riêng.
    */

    const match=
        raw.match(
            /\/d\/([^/]+)/
        )
        ||
        raw.match(
            /[?&]id=([^&]+)/
        );

    if(match && match[1]){

        return(
            "https://drive.google.com/thumbnail?id="+
            encodeURIComponent(
                match[1]
            )+
            "&sz=w"+
            Number(
                size || 400
            )
        );

    }

    return raw;

}


/* =========================================================
   STUDENT CONTEXT

   Không tự tạo một hệ đăng nhập mới.

   Ưu tiên nhận context từ:
   - Minh Hồng
   - module OCD dùng chung
   - event
   - API setStudent()

========================================================= */

function detectStudentContext(){

    /*
       Các hook này là điểm chờ.
       Không phụ thuộc cứng vào một phiên bản
       Minh Hồng cụ thể.
    */

    const possible=[

        window.OCDStudentContext,

        window.OCDAssistant &&
        window.OCDAssistant.student,

        window.MinhHong &&
        window.MinhHong.student

    ];


    for(
        let i=0;
        i<possible.length;
        i++
    ){

        const item=
            possible[i];

        if(
            item &&
            (
                item.code ||
                item.studentCode
            )
        ){

            return{

                code:
                    normalizeCode(
                        item.code ||
                        item.studentCode
                    ),

                name:
                    cleanText(
                        item.name
                    ),

                course:
                    cleanText(
                        item.course
                    )

            };

        }

    }

    return null;

}


/* =========================================================
   DATA ADAPTER

   Đây là lớp DUY NHẤT sau này cần thay đổi
   để nối Google Sheet thật.
========================================================= */

const DataAdapter={


    async loadNpc(){

        if(CONFIG.demoMode){

            return(
                DEMO.npcs.slice()
            );

        }

        return(
            await loadNpcFromSheet()
        );

    },


    async loadQuests(){

        if(CONFIG.demoMode){

            return(
                DEMO.quests.slice()
            );

        }

        return(
            await loadQuestFromSheet()
        );

    },


    async loadProgress(
        studentCode
    ){

        if(CONFIG.demoMode){

            return(
                DEMO.progress
                .filter(
                    function(item){

                        return(
                            normalizeCode(
                                item.studentCode
                            )
                            ===
                            normalizeCode(
                                studentCode
                            )
                        );

                    }
                )
            );

        }

        return(
            await loadProgressFromSheet(
                studentCode
            )
        );

    },


    async loadQuestCodes(
        studentCode
    ){

        if(CONFIG.demoMode){

            return(
                DEMO.questCodes
                .filter(
                    function(item){

                        return(
                            normalizeCode(
                                item.studentCode
                            )
                            ===
                            normalizeCode(
                                studentCode
                            )
                        );

                    }
                )
            );

        }

        return(
            await loadQuestCodeFromSheet(
                studentCode
            )
        );

    }

};


/* =========================================================
   GOOGLE SHEET PLACEHOLDERS

   Cố tình chưa viết URL giả.

   Khi có Sheet thật:
   chúng ta chỉ hoàn thiện 4 hàm này.
========================================================= */

async function loadNpcFromSheet(){

    if(!CONFIG.sheets.npc){

        throw new Error(
            "Chưa cấu hình nguồn dữ liệu NPC."
        );

    }

    return [];

}


async function loadQuestFromSheet(){

    if(!CONFIG.sheets.quest){

        throw new Error(
            "Chưa cấu hình nguồn dữ liệu Quest."
        );

    }

    return [];

}


async function loadProgressFromSheet(){

    if(!CONFIG.sheets.progress){

        throw new Error(
            "Chưa cấu hình nguồn tiến độ Quest."
        );

    }

    return [];

}


async function loadQuestCodeFromSheet(){

    if(!CONFIG.sheets.questCode){

        throw new Error(
            "Chưa cấu hình nguồn mã Quest."
        );

    }

    return [];

}


/* =========================================================
   QUEST ENGINE
========================================================= */

const QuestEngine={


    getProgress(
        questId
    ){

        return(
            state.progress
            .find(
                function(item){

                    return(
                        cleanText(
                            item.questId
                        )
                        ===
                        cleanText(
                            questId
                        )
                    );

                }
            )
            ||
            null
        );

    },


    getQuestCode(
        questId
    ){

        const found=
            state.questCodes
            .find(
                function(item){

                    return(
                        cleanText(
                            item.questId
                        )
                        ===
                        cleanText(
                            questId
                        )
                    );

                }
            );

        return(
            found
            ?
            cleanText(
                found.code
            )
            :
            ""
        );

    },


    getActiveQuest(){

        /*
           ACTIVE hoặc CODE_RECEIVED
        */

        for(
            let i=0;
            i<state.progress.length;
            i++
        ){

            const progress=
                state.progress[i];

            const status=
                cleanText(
                    progress.status
                )
                .toUpperCase();

            if(
                status !== "ACTIVE" &&
                status !== "CODE_RECEIVED"
            ){
                continue;
            }

            const quest=
                state.quests
                .find(
                    function(item){

                        return(
                            cleanText(
                                item.questId
                            )
                            ===
                            cleanText(
                                progress.questId
                            )
                        );

                    }
                );

            if(quest){
                return quest;
            }

        }

        return null;

    },


    getNpcForPage(){

        const activeQuest=
            this.getActiveQuest();

        /*
           Quest đang yêu cầu NPC ở trang này
           thì NPC đó có ưu tiên cao nhất.
        */

        if(
            activeQuest &&
            activeQuest.targetPage ===
            state.currentPage
        ){

            const questNpc=
                state.npcs
                .find(
                    function(npc){

                        return(
                            npc.npcId ===
                            activeQuest.npcId
                        );

                    }
                );

            if(questNpc){
                return questNpc;
            }

        }


        /*
           Nếu không có Quest phù hợp,
           lấy NPC mặc định của trang.
        */

        return(
            state.npcs
            .find(
                function(npc){

                    return(
                        npc.enabled !== false &&
                        npc.page ===
                        state.currentPage
                    );

                }
            )
            ||
            null
        );

    },


    canNpcRevealCode(
        npc,
        quest
    ){

        if(
            !state.studentCode ||
            !npc ||
            !quest
        ){
            return false;
        }

        if(
            quest.npcId !==
            npc.npcId
        ){
            return false;
        }

        if(
            quest.targetPage !==
            state.currentPage
        ){
            return false;
        }

        const progress=
            this.getProgress(
                quest.questId
            );

        if(!progress){
            return false;
        }

        const status=
            cleanText(
                progress.status
            )
            .toUpperCase();

        return(
            status === "ACTIVE" ||
            status === "CODE_RECEIVED"
        );

    },


    validateReturnCode(
        quest,
        input
    ){

        if(
            !quest ||
            !state.studentCode
        ){

            return{
                ok:false,
                reason:
                    "Không có nhiệm vụ đang hoạt động."
            };

        }

        const expected=
            normalizeCode(
                this.getQuestCode(
                    quest.questId
                )
            );

        const received=
            normalizeCode(
                input
            );

        if(!expected){

            return{
                ok:false,
                reason:
                    "Chưa có mã xác nhận dành cho nhiệm vụ này."
            };

        }

        if(
            expected !==
            received
        ){

            return{
                ok:false,
                reason:
                    "Mã nhiệm vụ chưa chính xác."
            };

        }

        return{
            ok:true,
            reason:
                "Mã nhiệm vụ hợp lệ."
        };

    }

};


/* =========================================================
   REWARD BRIDGE

   TUYỆT ĐỐI KHÔNG:
   gems += reward

   Quest chỉ phát event.
========================================================= */

function emitQuestCompleted(
    quest
){

    const detail={

        source:
            "NPC_QUEST",

        event:
            "QUEST_COMPLETED",

        studentCode:
            state.studentCode,

        questId:
            quest.questId,

        reward:{

            type:
                quest.rewardType,

            amount:
                Number(
                    quest.rewardAmount || 0
                )

        },

        timestamp:
            new Date()
            .toISOString()

    };


    window.dispatchEvent(
        new CustomEvent(
            "ocdQuestCompleted",
            {
                detail
            }
        )
    );


    /*
       Chưa ghi Reward Core trong v1.
    */

    if(
        CONFIG.rewardWriteEnabled
    ){

        console.warn(
            "[NPC Quest] Reward write chưa được triển khai.",
            detail
        );

    }

}


/* =========================================================
   UI CREATE
========================================================= */

function createRoot(){

    let root=
        document.getElementById(
            CONFIG.rootId
        );

    if(root){
        return root;
    }


    root=
        document.createElement(
            "div"
        );

    root.id=
        CONFIG.rootId;


    root.innerHTML=`

        <button
            class="nq-launcher"
            id="nqLauncher"
            type="button"
            aria-label="Mở NPC"
        >

            <span
                class="nq-launcher-avatar"
                id="nqLauncherAvatar"
            >
                <span
                    class="nq-launcher-fallback"
                >
                    NPC
                </span>
            </span>

            <span
                class="nq-launcher-badge"
                id="nqLauncherBadge"
            >
                1
            </span>

        </button>


        <div
            class="nq-overlay"
            id="nqOverlay"
        ></div>


        <section
            class="nq-panel"
            id="nqPanel"
            aria-hidden="true"
        >

            <header
                class="nq-head"
            >

                <div
                    class="nq-avatar-wrap"
                >

                    <div
                        class="nq-avatar"
                        id="nqAvatar"
                    >
                        <span
                            class="nq-avatar-fallback"
                        >
                            NPC
                        </span>
                    </div>

                </div>


                <div
                    class="nq-role"
                    id="nqRole"
                >
                    NHÂN VẬT
                </div>


                <h3
                    class="nq-name"
                    id="nqName"
                >
                    NPC
                </h3>


                <div
                    class="nq-location"
                    id="nqLocation"
                ></div>


                <button
                    class="nq-close"
                    id="nqClose"
                    type="button"
                    aria-label="Đóng"
                >
                    ×
                </button>

            </header>


            <div
                class="nq-body"
                id="nqBody"
            ></div>

        </section>

    `;


    document.body.appendChild(
        root
    );


    return root;

}


/* =========================================================
   AVATAR
========================================================= */

function renderAvatar(
    element,
    npc
){

    if(!element){
        return;
    }


    element.innerHTML="";


    if(
        npc &&
        npc.image
    ){

        const img=
            document.createElement(
                "img"
            );

        img.src=
            convertDriveImageUrl(
                npc.image,
                400
            );

        img.alt=
            npc.name || "NPC";

        img.loading=
            "lazy";

        img.decoding=
            "async";


        img.addEventListener(
            "error",
            function(){

                element.innerHTML=
                    '<span class="nq-avatar-fallback">NPC</span>';

            }
        );


        element.appendChild(
            img
        );

        return;

    }


    element.innerHTML=
        '<span class="nq-avatar-fallback">NPC</span>';

}


/* =========================================================
   UI MESSAGE
========================================================= */

function messageHtml(){

    if(!state.message){
        return "";
    }

    return(
        '<div class="nq-message visible '+
        escapeHtml(
            state.message.type || "info"
        )+
        '">'+
        escapeHtml(
            state.message.text
        )+
        '</div>'
    );

}


function setMessage(
    text,
    type
){

    state.message={

        text:
            cleanText(text),

        type:
            type || "info"

    };

    render();

}


/* =========================================================
   RENDER
========================================================= */

function render(){

    const body=
        document.getElementById(
            "nqBody"
        );

    if(!body){
        return;
    }


    if(state.loading){

        body.innerHTML=
            '<div class="nq-loading">'+
            'Đang kiểm tra nhiệm vụ...'+
            '</div>';

        return;
    }


    const npc=
        state.activeNpc;


    if(!npc){

        body.innerHTML=`

            <div
                class="nq-empty"
            >
                Hiện chưa có NPC nào
                cần gặp tại khu vực này.
            </div>

        `;

        return;
    }


    renderHeader(
        npc
    );


    /*
       Chưa có học viên.
    */

    if(!state.studentCode){

        body.innerHTML=`

            <div
                class="nq-speech"
            >
                Chào bạn.
                Khi mã học viên được xác minh,
                tôi sẽ biết liệu có nhiệm vụ
                nào dành cho bạn tại đây hay không.
            </div>

            <div
                class="nq-status"
            >

                <span
                    class="nq-status-dot"
                ></span>

                Chưa xác định học viên

            </div>

        `;

        return;
    }


    const quest=
        state.activeQuest;


    /*
       Không có Quest tại NPC này.
    */

    if(
        !quest ||
        quest.npcId !==
        npc.npcId
    ){

        body.innerHTML=`

            <div
                class="nq-speech"
            >
                ${escapeHtml(
                    npc.description ||
                    "Hôm nay chưa có việc gì cần trao đổi."
                )}
            </div>

            <div
                class="nq-status"
            >

                <span
                    class="nq-status-dot"
                ></span>

                Không có nhiệm vụ tại đây

            </div>

            ${messageHtml()}

        `;

        return;
    }


    const progress=
        QuestEngine.getProgress(
            quest.questId
        );


    const status=
        progress
        ?
        cleanText(
            progress.status
        )
        .toUpperCase()
        :
        "";


    const canReveal=
        QuestEngine.canNpcRevealCode(
            npc,
            quest
        );


    const code=
        canReveal
        ?
        QuestEngine.getQuestCode(
            quest.questId
        )
        :
        "";


    body.innerHTML=`

        <div
            class="nq-speech"
        >
            Minh Hồng đã nhắc tôi về bạn.
            Có vẻ bạn đang tìm thứ liên quan
            đến nhiệm vụ này.
        </div>


        <div
            class="nq-status ${
                status === "COMPLETED"
                ?
                "completed"
                :
                "active"
            }"
        >

            <span
                class="nq-status-dot"
            ></span>

            ${
                status === "COMPLETED"
                ?
                "Nhiệm vụ đã hoàn thành"
                :
                "Nhiệm vụ đang thực hiện"
            }

        </div>


        <article
            class="nq-quest"
        >

            <div
                class="nq-quest-head"
            >

                <div
                    class="nq-quest-kicker"
                >
                    ${escapeHtml(
                        quest.questId
                    )}
                </div>

                <h4
                    class="nq-quest-title"
                >
                    ${escapeHtml(
                        quest.title
                    )}
                </h4>

            </div>


            <div
                class="nq-quest-content"
            >

                <div
                    class="nq-quest-description"
                >
                    ${escapeHtml(
                        quest.description
                    )}
                </div>


                <div
                    class="nq-objective"
                >

                    <span
                        class="nq-objective-title"
                    >
                        Mục tiêu
                    </span>

                    ${escapeHtml(
                        quest.objective
                    )}

                </div>


                ${
                    quest.rewardLabel
                    ?
                    `

                    <div
                        class="nq-reward"
                    >

                        <div
                            class="nq-reward-label"
                        >
                            Phần thưởng
                        </div>

                        <div
                            class="nq-reward-list"
                        >

                            <span
                                class="nq-reward-chip"
                            >
                                ${escapeHtml(
                                    quest.rewardLabel
                                )}
                            </span>

                        </div>

                    </div>

                    `
                    :
                    ""
                }


                ${
                    code
                    ?
                    `

                    <div
                        class="nq-code-box"
                    >

                        <div
                            class="nq-code-label"
                        >
                            Mật lệnh của bạn
                        </div>

                        <div
                            class="nq-code"
                            id="nqQuestCode"
                        >
                            ${escapeHtml(
                                code
                            )}
                        </div>

                        <div
                            class="nq-actions"
                        >

                            <button
                                class="nq-btn secondary"
                                id="nqCopyCode"
                                type="button"
                            >
                                SAO CHÉP MÃ
                            </button>

                        </div>

                    </div>

                    `
                    :
                    ""
                }

                ${messageHtml()}

            </div>

        </article>

    `;


    bindDynamicEvents();

}


/* =========================================================
   HEADER
========================================================= */

function renderHeader(
    npc
){

    const name=
        document.getElementById(
            "nqName"
        );

    const role=
        document.getElementById(
            "nqRole"
        );

    const location=
        document.getElementById(
            "nqLocation"
        );


    if(name){

        name.textContent=
            npc.name ||
            "NPC";

    }


    if(role){

        role.textContent=
            npc.role ||
            "NHÂN VẬT";

    }


    if(location){

        location.textContent=
            getPageLabel(
                state.currentPage
            );

    }


    renderAvatar(
        document.getElementById(
            "nqAvatar"
        ),
        npc
    );


    renderAvatar(
        document.getElementById(
            "nqLauncherAvatar"
        ),
        npc
    );

}


/* =========================================================
   PAGE LABEL
========================================================= */

function getPageLabel(
    page
){

    const labels={

        HOME:
            "Thanh Phong Thư Môn",

        GIANG_DUONG:
            "Giảng đường",

        THU_VIEN:
            "Thư viện",

        CHO_PHIEN:
            "Chợ phiên"

    };

    return(
        labels[page] ||
        "OCD"
    );

}


/* =========================================================
   DYNAMIC EVENTS
========================================================= */

function bindDynamicEvents(){

    const copy=
        document.getElementById(
            "nqCopyCode"
        );

    if(copy){

        copy.addEventListener(
            "click",
            copyQuestCode
        );

    }

}


/* =========================================================
   COPY
========================================================= */

async function copyQuestCode(){

    if(!state.activeQuest){
        return;
    }

    const code=
        QuestEngine.getQuestCode(
            state.activeQuest.questId
        );

    if(!code){
        return;
    }


    try{

        await navigator.clipboard
        .writeText(
            code
        );

        setMessage(
            "Đã sao chép mật lệnh. Hãy mang mã này về gặp Minh Hồng.",
            "success"
        );

        window.dispatchEvent(
            new CustomEvent(
                "ocdQuestCodeCopied",
                {
                    detail:{

                        studentCode:
                            state.studentCode,

                        questId:
                            state.activeQuest.questId,

                        npcId:
                            state.activeNpc
                            ?
                            state.activeNpc.npcId
                            :
                            "",

                        code:
                            code

                    }
                }
            )
        );

    }catch(error){

        console.error(
            "[NPC Quest] Copy:",
            error
        );

        setMessage(
            "Không thể tự sao chép. Bạn có thể chọn và sao chép mã thủ công.",
            "error"
        );

    }

}


/* =========================================================
   OPEN / CLOSE

   Phát event để Minh Hồng có thể
   đóng popup của mình khi NPC mở.
========================================================= */

function openPanel(){

    state.open=true;


    const panel=
        document.getElementById(
            "nqPanel"
        );

    const overlay=
        document.getElementById(
            "nqOverlay"
        );


    if(panel){

        panel.classList.add(
            "visible"
        );

        panel.setAttribute(
            "aria-hidden",
            "false"
        );

    }


    if(overlay){

        overlay.classList.add(
            "visible"
        );

    }


    window.dispatchEvent(
        new CustomEvent(
            "ocdAssistantPanelOpened",
            {
                detail:{
                    source:
                        "NPC_QUEST"
                }
            }
        )
    );

}


function closePanel(){

    state.open=false;


    const panel=
        document.getElementById(
            "nqPanel"
        );

    const overlay=
        document.getElementById(
            "nqOverlay"
        );


    if(panel){

        panel.classList.remove(
            "visible"
        );

        panel.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    if(overlay){

        overlay.classList.remove(
            "visible"
        );

    }


    window.dispatchEvent(
        new CustomEvent(
            "ocdAssistantPanelClosed",
            {
                detail:{
                    source:
                        "NPC_QUEST"
                }
            }
        )
    );

}


/* =========================================================
   LOAD DATA
========================================================= */

async function refresh(){

    state.loading=true;

    render();


    try{

        const results=
            await Promise.all([

                DataAdapter.loadNpc(),

                DataAdapter.loadQuests(),

                state.studentCode
                ?
                DataAdapter.loadProgress(
                    state.studentCode
                )
                :
                Promise.resolve([]),

                state.studentCode
                ?
                DataAdapter.loadQuestCodes(
                    state.studentCode
                )
                :
                Promise.resolve([])

            ]);


        state.npcs=
            results[0] || [];

        state.quests=
            results[1] || [];

        state.progress=
            results[2] || [];

        state.questCodes=
            results[3] || [];


        state.activeQuest=
            QuestEngine
            .getActiveQuest();


        state.activeNpc=
            QuestEngine
            .getNpcForPage();


        updateLauncher();

    }catch(error){

        console.error(
            "[NPC Quest]",
            error
        );

        state.message={

            type:"error",

            text:
                error.message ||
                "Không thể tải dữ liệu NPC."

        };

    }finally{

        state.loading=false;

        render();

    }

}


/* =========================================================
   LAUNCHER
========================================================= */

function updateLauncher(){

    const launcher=
        document.getElementById(
            "nqLauncher"
        );

    const badge=
        document.getElementById(
            "nqLauncherBadge"
        );


    if(!launcher){
        return;
    }


    /*
       Không có NPC ở trang này:
       ẩn launcher.
    */

    if(!state.activeNpc){

        launcher.style.display=
            "none";

        return;

    }


    launcher.style.display=
        "";


    const quest=
        state.activeQuest;


    const hasQuestHere=
        Boolean(
            quest &&
            quest.npcId ===
            state.activeNpc.npcId &&
            quest.targetPage ===
            state.currentPage
        );


    if(badge){

        badge.classList.toggle(
            "visible",
            hasQuestHere
        );

        badge.textContent=
            hasQuestHere
            ?
            "!"
            :
            "";

    }


    renderAvatar(
        document.getElementById(
            "nqLauncherAvatar"
        ),
        state.activeNpc
    );

}


/* =========================================================
   SET STUDENT

   Đây là API quan trọng nhất để
   Minh Hồng truyền context sang NPC.
========================================================= */

async function setStudent(
    student
){

    if(!student){

        state.student=null;
        state.studentCode="";

        await refresh();

        return;

    }


    const code=
        normalizeCode(
            student.code ||
            student.studentCode
        );


    if(!code){

        return;

    }


    state.student={

        code,

        name:
            cleanText(
                student.name
            ),

        course:
            cleanText(
                student.course
            )

    };


    state.studentCode=
        code;


    await refresh();

}


/* =========================================================
   QUEST RETURN API

   Minh Hồng sẽ gọi hàm này khi học viên
   nhập mã trả nhiệm vụ.

   NPC gadget không cần chứa form trả Quest
   nếu Minh Hồng là Quest Master.
========================================================= */

function validateQuestCode(
    questId,
    code
){

    const quest=
        state.quests
        .find(
            function(item){

                return(
                    cleanText(
                        item.questId
                    )
                    ===
                    cleanText(
                        questId
                    )
                );

            }
        );


    if(!quest){

        return{

            ok:false,

            reason:
                "Không tìm thấy nhiệm vụ."

        };

    }


    return(
        QuestEngine
        .validateReturnCode(
            quest,
            code
        )
    );

}


/* =========================================================
   COMPLETE API

   Chưa ghi Sheet thật trong v1.
========================================================= */

function completeQuest(
    questId,
    code
){

    const result=
        validateQuestCode(
            questId,
            code
        );


    if(!result.ok){

        return result;

    }


    const quest=
        state.quests
        .find(
            function(item){

                return(
                    item.questId ===
                    questId
                );

            }
        );


    /*
       Sau này:
       1. server xác minh
       2. ghi COMPLETED
       3. chống duplicate
       4. tạo Reward Transaction
       5. Core refresh

       v1 chỉ phát event.
    */

    emitQuestCompleted(
        quest
    );


    return{

        ok:true,

        reason:
            "Nhiệm vụ hợp lệ.",

        quest:
            quest

    };

}


/* =========================================================
   GLOBAL EVENTS
========================================================= */

function bindGlobalEvents(){

    /*
       Launcher
    */

    const launcher=
        document.getElementById(
            "nqLauncher"
        );

    const close=
        document.getElementById(
            "nqClose"
        );

    const overlay=
        document.getElementById(
            "nqOverlay"
        );


    if(launcher){

        launcher.addEventListener(
            "click",
            openPanel
        );

    }


    if(close){

        close.addEventListener(
            "click",
            closePanel
        );

    }


    if(overlay){

        overlay.addEventListener(
            "click",
            closePanel
        );

    }


    /*
       ESC
    */

    document.addEventListener(
        "keydown",
        function(event){

            if(
                event.key ===
                "Escape" &&
                state.open
            ){

                closePanel();

            }

        }
    );


    /*
       Context học viên do Minh Hồng
       hoặc module khác gửi tới.
    */

    window.addEventListener(
        "ocdStudentContextChanged",
        function(event){

            const detail=
                event.detail;

            if(detail){

                setStudent(
                    detail
                );

            }

        }
    );


    /*
       Khi panel khác của hệ trợ giảng mở,
       NPC tự đóng để tránh chồng popup.
    */

    window.addEventListener(
        "ocdAssistantPanelOpened",
        function(event){

            const source=
                event.detail &&
                event.detail.source;

            if(
                source &&
                source !==
                "NPC_QUEST"
            ){

                closePanel();

            }

        }
    );


    /*
       Reward Core thay đổi profile.
       NPC không tự tính lại tài sản,
       nhưng có thể refresh context Quest.
    */

    window.addEventListener(
        "ocdRewardProfileChanged",
        function(event){

            const detail=
                event.detail || {};

            const changedCode=
                normalizeCode(
                    detail.studentCode ||
                    detail.code
                );

            if(
                changedCode &&
                changedCode ===
                state.studentCode
            ){

                /*
                   Không cần reload ngay
                   ở demo mode.

                   Khi Progress Sheet hoạt động,
                   có thể refresh ở đây.
                */

                window.dispatchEvent(
                    new CustomEvent(
                        "ocdNpcQuestRewardContextChanged",
                        {
                            detail:{
                                studentCode:
                                    changedCode
                            }
                        }
                    )
                );

            }

        }
    );

}


/* =========================================================
   DEMO HELPER

   Chỉ dùng để test UI trước khi Sheet hoạt động.
========================================================= */

function demoStartQuest(
    studentCode
){

    if(!CONFIG.demoMode){
        return;
    }


    const code=
        normalizeCode(
            studentCode
        );

    if(!code){
        return;
    }


    DEMO.progress=
        DEMO.progress.filter(
            function(item){

                return !(
                    normalizeCode(
                        item.studentCode
                    )
                    ===
                    code
                    &&
                    item.questId ===
                    "Q001"
                );

            }
        );


    DEMO.progress.push({

        studentCode:
            code,

        questId:
            "Q001",

        status:
            "ACTIVE"

    });


    DEMO.questCodes=
        DEMO.questCodes.filter(
            function(item){

                return !(
                    normalizeCode(
                        item.studentCode
                    )
                    ===
                    code
                    &&
                    item.questId ===
                    "Q001"
                );

            }
        );


    DEMO.questCodes.push({

        studentCode:
            code,

        questId:
            "Q001",

        code:
            "GD-"+
            simpleCode(
                code+
                "|Q001"
            )

    });


    setStudent({

        code:
            code

    });

}


/* =========================================================
   SIMPLE DEMO CODE

   KHÔNG dùng làm cơ chế bảo mật thật.
========================================================= */

function simpleCode(
    text
){

    let hash=0;

    const source=
        cleanText(text);

    for(
        let i=0;
        i<source.length;
        i++
    ){

        hash=
            (
                (
                    hash << 5
                )
                -
                hash
            )
            +
            source.charCodeAt(i);

        hash|=0;

    }


    return(
        Math.abs(hash)
        .toString(36)
        .toUpperCase()
        .slice(0,5)
        .padStart(
            5,
            "0"
        )
    );

}


/* =========================================================
   INIT
========================================================= */

async function init(){

    if(state.ready){
        return;
    }


    state.currentPage=
        getCurrentPage();


    createRoot();

    bindGlobalEvents();


    const detected=
        detectStudentContext();

    if(detected){

        state.student=
            detected;

        state.studentCode=
            detected.code;

    }


    state.ready=true;


    await refresh();


    window.dispatchEvent(
        new CustomEvent(
            "ocdNpcQuestReady",
            {
                detail:{
                    version:
                        CONFIG.version
                }
            }
        )
    );

}


/* =========================================================
   PUBLIC API
========================================================= */

window.OCDNpcQuestSystem={

    version:
        CONFIG.version,


    init:
        init,


    open:
        openPanel,


    close:
        closePanel,


    refresh:
        refresh,


    setStudent:
        setStudent,


    getStudent:function(){

        return(
            state.student
            ?
            Object.assign(
                {},
                state.student
            )
            :
            null
        );

    },


    getActiveQuest:function(){

        return(
            state.activeQuest
            ?
            Object.assign(
                {},
                state.activeQuest
            )
            :
            null
        );

    },


    getActiveNpc:function(){

        return(
            state.activeNpc
            ?
            Object.assign(
                {},
                state.activeNpc
            )
            :
            null
        );

    },


    validateQuestCode:
        validateQuestCode,


    completeQuest:
        completeQuest,


    /*
       Chỉ phục vụ test phiên bản v1.
    */
    demoStartQuest:
        demoStartQuest

};


/* =========================================================
   AUTO START
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
