(function () {
    "use strict";

    /* =========================================================
       OCD NPC SYSTEM
       Npc/Npc.js
       v4.2.0 - CLEAN REBUILD

       NGUYÊN TẮC:
       - NPC chỉ render vào #ocdNpcMount
       - Không launcher
       - Không floating
       - Không phụ thuộc Sheet để xuất hiện
       - Sheet chỉ bổ sung ảnh + mô tả
       - Mỗi trang có NPC riêng
    ========================================================= */


    /* =========================================================
       CONFIG
    ========================================================= */

    var CONFIG = {
        version: "4.2.0",
        mountId: "ocdNpcMount",
        npcGid: "1348051654"
    };


    /* =========================================================
       STATE
    ========================================================= */

    var state = {
        page: null,
        npc: null,
        npcData: [],
        questNpc: "",
        quest: null,
        dialogOpen: false
    };


    /* =========================================================
       HELPERS
    ========================================================= */

    function clean(value) {
        if (value === null || value === undefined) {
            return "";
        }

        return String(value).trim();
    }


    function normalize(value) {
        var source = clean(value).toLowerCase();

        try {
            source = source
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");
        } catch (error) {}

        return source
            .replace(/đ/g, "d")
            .replace(/\s+/g, " ")
            .trim();
    }


    function escapeHtml(value) {
        return clean(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function getMount() {
        return document.getElementById(CONFIG.mountId);
    }


    function getPath() {
        var path = window.location.pathname || "/";

        path = path.toLowerCase();

        if (path.length > 1 && path.charAt(path.length - 1) === "/") {
            path = path.substring(0, path.length - 1);
        }

        return path;
    }


    /* =========================================================
       PAGE DETECTION

       NPC THEO YÊU CẦU HIỆN TẠI
    ========================================================= */

    function detectPage() {
        var path = getPath();


        /* -----------------------------------------------------
           TRANG CHỦ
        ----------------------------------------------------- */

        if (
            path === "/" ||
            path === "/index.html"
        ) {
            return {
                id: "HOME",
                npc: "",
                place: "Trang chủ",
                questOnly: false
            };
        }


        /* -----------------------------------------------------
           PHÒNG TRIỂN LÃM
        ----------------------------------------------------- */

        if (
            path === "/p/trien-lam.html" ||
            path.indexOf("/p/trien-lam") !== -1
        ) {
            return {
                id: "EXHIBITION",
                npc: "Thư gia",
                place: "Phòng triển lãm",
                questOnly: false
            };
        }


        /* -----------------------------------------------------
           TRANG NHIỆM VỤ
        ----------------------------------------------------- */

        if (
            path === "/p/quest.html" ||
            path.indexOf("/p/quest") !== -1
        ) {
            return {
                id: "QUEST",
                npc: "Võ tướng",
                place: "Trang nhiệm vụ",
                questOnly: false
            };
        }


        /* -----------------------------------------------------
           GIẢNG ĐƯỜNG
        ----------------------------------------------------- */

        if (
            path === "/p/giang-duong.html" ||
            path.indexOf("giang-duong") !== -1
        ) {
            return {
                id: "LECTURE",
                npc: "Thư gia",
                place: "Giảng đường",
                questOnly: false
            };
        }


        /* -----------------------------------------------------
           BẢNG XẾP HẠNG
        ----------------------------------------------------- */

        if (
            path.indexOf("bang-xep-hang") !== -1 ||
            path.indexOf("xep-hang") !== -1 ||
            path.indexOf("xephang") !== -1
        ) {
            return {
                id: "RANKING",
                npc: "Nghệ nhân",
                place: "Bảng xếp hạng",
                questOnly: false
            };
        }


        /* -----------------------------------------------------
           THƯ VIỆN LÂM MÔ
        ----------------------------------------------------- */

        if (
            path.indexOf("thu-vien-lam-mo") !== -1 ||
            path.indexOf("thu-vien") !== -1
        ) {
            return {
                id: "LIBRARY",
                npc: "Nông dân",
                place: "Thư viện lâm mô",
                questOnly: false
            };
        }


        /* -----------------------------------------------------
           TRA CỨU / CHỢ PHIÊN

           Gian thương chỉ hiện khi Quest gọi.
        ----------------------------------------------------- */

        if (
            path.indexOf("tra-cuu") !== -1 ||
            path.indexOf("ho-so") !== -1 ||
            path.indexOf("cho-phien") !== -1
        ) {
            return {
                id: "PROFILE",
                npc: "Gian thương",
                place: "Tra cứu hồ sơ / Chợ phiên",
                questOnly: true
            };
        }


        /* -----------------------------------------------------
           TRANG KHÁC
        ----------------------------------------------------- */

        return {
            id: "OTHER",
            npc: "",
            place: "",
            questOnly: false
        };
    }


    /* =========================================================
       FALLBACK NPC

       RẤT QUAN TRỌNG:
       NPC phải xuất hiện kể cả Sheet chưa tải được.
    ========================================================= */

    function createFallbackNpc(name) {
        return {
            name: name,
            key: normalize(name),
            image: "",
            description: getDefaultDialogue(name)
        };
    }


    function getDefaultDialogue(name) {
        var key = normalize(name);


        if (key === "thu gia") {
            return "Chào bạn. Ta là Thư gia. Có lẽ hành trình hôm nay đã đưa bạn đến đây vì một lý do.";
        }


        if (key === "nghe nhan") {
            return "Chào bạn. Ta vẫn đang quan sát những bước tiến của các học viên.";
        }


        if (key === "nong dan") {
            return "Chào bạn. Nếu đang tìm một thứ cần thiết cho việc luyện tập, có lẽ ta có thể giúp.";
        }


        if (key === "vo tuong") {
            return "Đã đến đây thì hãy xem nhiệm vụ nào đang chờ bạn.";
        }


        if (key === "gian thuong") {
            return "Hừm... Có vẻ ngươi tìm ta vì một nhiệm vụ.";
        }


        return "Có chuyện gì cần ta giúp?";
    }


    /* =========================================================
       SHOULD SHOW
    ========================================================= */

    function shouldShowNpc() {
        if (!state.page) {
            return false;
        }


        if (!state.page.npc) {
            return false;
        }


        if (!state.page.questOnly) {
            return true;
        }


        return (
            normalize(state.questNpc) ===
            normalize(state.page.npc)
        );
    }


    /* =========================================================
       FIND REAL NPC DATA
    ========================================================= */

    function findNpcData(name) {
        var target = normalize(name);
        var i;
        var npc;


        for (i = 0; i < state.npcData.length; i++) {
            npc = state.npcData[i];

            if (npc.key === target) {
                return npc;
            }
        }


        for (i = 0; i < state.npcData.length; i++) {
            npc = state.npcData[i];

            if (
                npc.key.indexOf(target) !== -1 ||
                target.indexOf(npc.key) !== -1
            ) {
                return npc;
            }
        }


        return null;
    }


    /* =========================================================
       IMAGE URL
    ========================================================= */

    function convertImageUrl(url) {
        var source = clean(url);
        var RS;
        var match;


        if (!source) {
            return "";
        }


        RS = window.StudentRewardSystem;


        if (
            RS &&
            typeof RS.convertDriveImageUrl === "function"
        ) {
            try {
                return RS.convertDriveImageUrl(
                    source,
                    500
                );
            } catch (error) {}
        }


        match = source.match(
            /\/file\/d\/([^/?]+)/
        );


        if (!match) {
            match = source.match(
                /[?&]id=([^&]+)/
            );
        }


        if (match && match[1]) {
            return (
                "https://drive.google.com/thumbnail?id=" +
                encodeURIComponent(match[1]) +
                "&sz=w500"
            );
        }


        return source;
    }


    /* =========================================================
       RENDER NPC

       CHỈ RENDER VÀO GADGET.
    ========================================================= */

    function renderNpc() {
        var mount = getMount();
        var realNpc;
        var npc;
        var scene;
        var actor;
        var imageBox;
        var img;
        var fallback;
        var mark;
        var name;
        var hint;


        if (!mount) {
            return;
        }


        if (!shouldShowNpc()) {
            mount.innerHTML = "";
            mount.style.display = "none";

            state.npc = null;

            return;
        }


        /*
           Tìm dữ liệu thật.

           Nếu chưa có:
           dùng fallback ngay.
        */

        realNpc = findNpcData(
            state.page.npc
        );


        npc = realNpc ||
            createFallbackNpc(
                state.page.npc
            );


        state.npc = npc;


        mount.style.display = "block";
        mount.innerHTML = "";


        /* =====================================================
           SCENE
        ===================================================== */

        scene = document.createElement("div");
        scene.className = "ocd-npc-scene";


        /* =====================================================
           ACTOR
        ===================================================== */

        actor = document.createElement("button");

        actor.type = "button";
        actor.className = "ocd-npc-actor";

        actor.setAttribute(
            "aria-label",
            "Trò chuyện với " + npc.name
        );


        /* =====================================================
           IMAGE
        ===================================================== */

        imageBox = document.createElement("span");
        imageBox.className = "ocd-npc-image";


        if (npc.image) {
            img = document.createElement("img");

            img.src = convertImageUrl(
                npc.image
            );

            img.alt = npc.name;
            img.loading = "lazy";


            img.onerror = function () {
                imageBox.innerHTML = "";

                fallback =
                    document.createElement("span");

                fallback.className =
                    "ocd-npc-fallback";

                fallback.textContent =
                    npc.name.substring(0, 1);

                imageBox.appendChild(
                    fallback
                );
            };


            imageBox.appendChild(img);

        } else {
            fallback =
                document.createElement("span");

            fallback.className =
                "ocd-npc-fallback";

            fallback.textContent =
                npc.name.substring(0, 1);

            imageBox.appendChild(
                fallback
            );
        }


        /* =====================================================
           QUEST MARK
        ===================================================== */

        mark = document.createElement("span");
        mark.className = "ocd-npc-symbol";
        mark.textContent = "!";

        imageBox.appendChild(mark);


        actor.appendChild(imageBox);


        /* =====================================================
           NAME
        ===================================================== */

        name = document.createElement("span");
        name.className = "ocd-npc-name";
        name.textContent = npc.name;

        actor.appendChild(name);


        /* =====================================================
           HINT
        ===================================================== */

        hint = document.createElement("span");
        hint.className = "ocd-npc-talk";
        hint.textContent = "Chạm để trò chuyện";

        actor.appendChild(hint);


        actor.onclick = function () {
            openDialog();
        };


        scene.appendChild(actor);
        mount.appendChild(scene);
    }


    /* =========================================================
       DIALOG
    ========================================================= */

    function ensureDialog() {
        var existing =
            document.getElementById(
                "ocdNpcDialogRoot"
            );

        var root;


        if (existing) {
            return existing;
        }


        root = document.createElement("div");
        root.id = "ocdNpcDialogRoot";


        root.innerHTML =
            '<div class="ocd-npc-overlay" id="ocdNpcOverlay"></div>' +

            '<div class="ocd-npc-dialog" id="ocdNpcDialog" aria-hidden="true">' +

                '<div class="ocd-npc-dialog-header">' +

                    '<div class="ocd-npc-dialog-picture" id="ocdNpcDialogPicture"></div>' +

                    '<h3 class="ocd-npc-dialog-name" id="ocdNpcDialogName"></h3>' +

                    '<div class="ocd-npc-dialog-place" id="ocdNpcDialogPlace"></div>' +

                    '<button type="button" class="ocd-npc-close" id="ocdNpcClose">×</button>' +

                '</div>' +

                '<div class="ocd-npc-dialog-body" id="ocdNpcDialogBody"></div>' +

            '</div>';


        document.body.appendChild(root);


        document.getElementById(
            "ocdNpcOverlay"
        ).onclick = closeDialog;


        document.getElementById(
            "ocdNpcClose"
        ).onclick = closeDialog;


        return root;
    }


    /* =========================================================
       OPEN DIALOG
    ========================================================= */

    function openDialog() {
        var npc = state.npc;
        var picture;
        var img;
        var body;
        var dialogue;


        if (!npc) {
            return;
        }


        ensureDialog();


        picture =
            document.getElementById(
                "ocdNpcDialogPicture"
            );


        picture.innerHTML = "";


        if (npc.image) {
            img = document.createElement("img");

            img.src =
                convertImageUrl(
                    npc.image
                );

            img.alt =
                npc.name;

            picture.appendChild(img);
        }


        document.getElementById(
            "ocdNpcDialogName"
        ).textContent = npc.name;


        document.getElementById(
            "ocdNpcDialogPlace"
        ).textContent =
            state.page.place;


        dialogue =
            npc.description ||
            getDefaultDialogue(
                npc.name
            );


        if (
            state.quest &&
            state.quest.dialogue
        ) {
            dialogue =
                state.quest.dialogue;
        }


        body =
            document.getElementById(
                "ocdNpcDialogBody"
            );


        body.innerHTML =
            '<div class="ocd-npc-speech">' +
                escapeHtml(dialogue) +
            '</div>' +

            '<div class="ocd-npc-dialog-note">' +
                (
                    state.quest
                    ?
                    'Nhân vật này đang liên quan đến nhiệm vụ hiện tại của bạn.'
                    :
                    'Hiện chưa có bước nhiệm vụ cần xác nhận tại nhân vật này.'
                ) +
            '</div>';


        document.getElementById(
            "ocdNpcOverlay"
        ).classList.add(
            "is-open"
        );


        document.getElementById(
            "ocdNpcDialog"
        ).classList.add(
            "is-open"
        );


        state.dialogOpen = true;


        try {
            window.dispatchEvent(
                new CustomEvent(
                    "ocdAssistantPanelOpened",
                    {
                        detail: {
                            source: "NPC",
                            npc: npc.name,
                            page: state.page.id
                        }
                    }
                )
            );
        } catch (error) {}
    }


    /* =========================================================
       CLOSE DIALOG
    ========================================================= */

    function closeDialog() {
        var overlay =
            document.getElementById(
                "ocdNpcOverlay"
            );

        var dialog =
            document.getElementById(
                "ocdNpcDialog"
            );


        if (overlay) {
            overlay.classList.remove(
                "is-open"
            );
        }


        if (dialog) {
            dialog.classList.remove(
                "is-open"
            );
        }


        state.dialogOpen = false;
    }


    /* =========================================================
       LOAD REAL SHEET IN BACKGROUND

       KHÔNG ĐƯỢC PHÉP CHẶN NPC.
    ========================================================= */

    function loadRealNpcData() {
        var attempts = 0;


        function tryCore() {
            var RS =
                window.StudentRewardSystem;

            var url;


            attempts++;


            if (
                RS &&
                typeof RS.sheetCsvUrl === "function" &&
                typeof RS.fetchRows === "function"
            ) {
                try {
                    url =
                        RS.sheetCsvUrl(
                            CONFIG.npcGid
                        );


                    RS.fetchRows(
                        url +
                        (
                            url.indexOf("?") !== -1
                            ?
                            "&"
                            :
                            "?"
                        ) +
                        "_npc=" +
                        Date.now()
                    )
                    .then(function (rows) {
                        state.npcData =
                            mapNpcRows(rows);

                        /*
                           Sheet đã về.
                           Render lại để thay fallback
                           bằng ảnh thật.
                        */
                        renderNpc();
                    })
                    .catch(function () {
                        /*
                           Sheet lỗi:
                           giữ nguyên fallback.
                        */
                    });

                } catch (error) {}

                return;
            }


            /*
               Chờ Core tối đa khoảng 10 giây.
            */

            if (attempts < 100) {
                setTimeout(
                    tryCore,
                    100
                );
            }
        }


        tryCore();
    }


    /* =========================================================
       MAP SHEET
    ========================================================= */

    function mapNpcRows(rows) {
        var headers;
        var nameIndex;
        var imageIndex;
        var descriptionIndex;
        var result = [];
        var i;
        var row;
        var name;


        if (
            !rows ||
            !rows.length ||
            rows.length < 2
        ) {
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
                    "icon",
                    "ảnh",
                    "anh"
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


        if (nameIndex < 0) {
            nameIndex = 0;
        }


        if (imageIndex < 0) {
            imageIndex = 1;
        }


        if (descriptionIndex < 0) {
            descriptionIndex = 2;
        }


        for (
            i = 1;
            i < rows.length;
            i++
        ) {
            row = rows[i];

            name =
                clean(
                    row[nameIndex]
                );


            if (!name) {
                continue;
            }


            result.push({
                name: name,

                key:
                    normalize(name),

                image:
                    clean(
                        row[imageIndex]
                    ),

                description:
                    clean(
                        row[
                            descriptionIndex
                        ]
                    )
            });
        }


        return result;
    }


    /* =========================================================
       FIND COLUMN
    ========================================================= */

    function findColumn(
        headers,
        aliases
    ) {
        var i;
        var j;
        var alias;


        for (
            i = 0;
            i < aliases.length;
            i++
        ) {
            alias =
                normalize(
                    aliases[i]
                );


            for (
                j = 0;
                j < headers.length;
                j++
            ) {
                if (
                    headers[j] === alias
                ) {
                    return j;
                }
            }
        }


        for (
            i = 0;
            i < aliases.length;
            i++
        ) {
            alias =
                normalize(
                    aliases[i]
                );


            for (
                j = 0;
                j < headers.length;
                j++
            ) {
                if (
                    headers[j].indexOf(
                        alias
                    ) !== -1
                ) {
                    return j;
                }
            }
        }


        return -1;
    }


    /* =========================================================
       QUEST API
    ========================================================= */

    function setQuestNpc(
        npcName,
        quest
    ) {
        state.questNpc =
            clean(npcName);

        state.quest =
            quest || null;

        renderNpc();
    }


    function clearQuest() {
        state.questNpc = "";
        state.quest = null;

        renderNpc();
    }


    /* =========================================================
       QUEST EVENTS
    ========================================================= */

    window.addEventListener(
        "ocdQuestNpcChanged",
        function (event) {
            var detail =
                event.detail || {};


            setQuestNpc(
                detail.npc ||
                detail.npcName ||
                "",
                detail.quest ||
                null
            );
        }
    );


    window.addEventListener(
        "ocdQuestCleared",
        function () {
            clearQuest();
        }
    );


    /* =========================================================
       PUBLIC API

       ĐƯỢC TẠO TRƯỚC KHI INIT.
       Vì vậy test gadget luôn nhìn thấy API.
    ========================================================= */

    window.OCDNpcSystem = {
        version: CONFIG.version,

        refresh: function () {
            state.page =
                detectPage();

            renderNpc();
        },

        setQuestNpc:
            setQuestNpc,

        clearQuest:
            clearQuest,

        close:
            closeDialog,

        getPage: function () {
            return state.page;
        },

        getNpc: function () {
            return state.npc;
        }
    };


    /* =========================================================
       INIT

       QUAN TRỌNG:
       RENDER FALLBACK TRƯỚC.
       SHEET SAU.
    ========================================================= */

    function init() {
        var mount =
            getMount();


        if (!mount) {
            return;
        }


        state.page =
            detectPage();


        /*
           Hiện NPC ngay lập tức.
        */

        renderNpc();


        /*
           Sau đó mới tải dữ liệu thật.
        */

        if (
            state.page &&
            state.page.npc
        ) {
            loadRealNpcData();
        }
    }


    /* =========================================================
       START
    ========================================================= */

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            init,
            {
                once: true
            }
        );
    } else {
        init();
    }

})();
