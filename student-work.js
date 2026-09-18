/* =========================================================
   OCD ADMIN CHẤM BÀI
   CORE CANONICAL ASSETS BRIDGE v18.5

   MỤC ĐÍCH
   - Giữ nguyên toàn bộ giao diện/chấm bài/xóa bài/phân trang V18.4.
   - QuaTangGVCN vẫn là nơi GVCN GHI giao dịch tặng quà.
   - KHÔNG tự tính quyền sở hữu Linh Thú từ PhieuDoi/QuaTangGVCN.
   - Quyền sở hữu cuối cùng lấy từ StudentRewardSystem Core dùng chung.
   - XoaBai được lọc trước khi tạo CSV gửi vào Core.
   - Sau khi tặng quà thành công, ép Core làm mới hồ sơ học viên.

   CÁCH DÙNG
   1. Giữ nguyên toàn bộ script V18.4 hiện tại.
   2. Áp dụng các khối thay thế dưới đây đúng theo tiêu đề.
   3. Không nhúng lại student-reward-core.js vào trang Admin.
========================================================= */


/* =========================================================
   [A] THÊM VÀO STATE
   Đặt ngay sau:
       let priorityCountCache = 0;
========================================================= */

let rewardCoreReadyPromise = null;

/*
   Cache hồ sơ tài sản chuẩn từ Core.
   key = mã học viên đã normalize
   value = {
       code,
       profile,
       ownedItems,
       ownedItemKeys,
       gems
   }
*/
let canonicalAssetMap = new Map();

/*
   Chống nhiều request Core cùng lúc cho cùng học viên.
*/
let canonicalAssetPromises = new Map();

/*
   Khi Core phát sự kiện thay đổi tài sản, debounce refresh.
*/
let canonicalRefreshTimer = null;


/* =========================================================
   [B] CORE READY
========================================================= */

function getRewardCore(){

    return window.StudentRewardSystem || null;
}


function isRewardCoreReady(){

    const RS = getRewardCore();

    return Boolean(
        RS &&
        RS.version &&
        typeof RS.getStudentRewardProfile === "function" &&
        typeof RS.loadSharedRewardData === "function" &&
        typeof RS.normalizeCode === "function"
    );
}


function waitRewardCore(){

    if(isRewardCoreReady()){
        return Promise.resolve(
            getRewardCore()
        );
    }

    if(rewardCoreReadyPromise){
        return rewardCoreReadyPromise;
    }

    rewardCoreReadyPromise =
    new Promise(
        function(resolve,reject){

            let tries = 0;
            const MAX_TRIES = 200;

            const timer =
            setInterval(
                function(){

                    tries++;

                    if(isRewardCoreReady()){

                        clearInterval(timer);

                        resolve(
                            getRewardCore()
                        );

                        return;
                    }

                    if(tries >= MAX_TRIES){

                        clearInterval(timer);

                        rewardCoreReadyPromise = null;

                        reject(
                            new Error(
                                "StudentRewardSystem Core chưa sẵn sàng."
                            )
                        );
                    }

                },
                100
            );
        }
    );

    return rewardCoreReadyPromise;
}


/* =========================================================
   [C] NORMALIZE PROFILE TỪ CORE
========================================================= */

function normalizeCanonicalRewardProfile(
    RS,
    rawProfile,
    studentCode
){

    const raw =
    rawProfile &&
    typeof rawProfile === "object"
    ?
    rawProfile
    :
    {};

    const root =
    raw.profile &&
    typeof raw.profile === "object"
    ?
    raw.profile
    :
    raw;

    let gems = {};

    if(
        root.gems &&
        typeof root.gems === "object"
    ){

        gems = root.gems;

    }else if(
        root.balance &&
        typeof root.balance === "object"
    ){

        gems = root.balance;

    }else if(
        root.rewardData &&
        root.rewardData.gems &&
        typeof root.rewardData.gems === "object"
    ){

        gems = root.rewardData.gems;
    }

    const ownedItems =
    Array.isArray(root.ownedItems)
    ?
    root.ownedItems
    :
    [];

    const ownedItemKeys =
    new Set();

    ownedItems.forEach(
        function(item){

            let name = "";

            if(typeof item === "string"){

                name = item;

            }else if(
                item &&
                typeof item === "object"
            ){

                name =
                item.name ||
                item.itemName ||
                item.giftName ||
                item.tenVatPham ||
                item.title ||
                "";
            }

            const key =
            normalize(name);

            if(key){
                ownedItemKeys.add(key);
            }
        }
    );

    return{

        code:
        RS.normalizeCode
        ?
        RS.normalizeCode(studentCode)
        :
        normalize(studentCode),

        profile:
        root,

        ownedItems:
        ownedItems,

        ownedItemKeys:
        ownedItemKeys,

        gems:
        gems
    };
}


/* =========================================================
   [D] CSV DÀNH RIÊNG CHO CORE
   Dữ liệu ở đây đã đi qua filterDeletedWorks().
========================================================= */

function csvEscapeCell(value){

    const text =
    String(value ?? "");

    if(
        /[",\r\n]/.test(text)
    ){

        return(
            '"' +
            text.replace(/"/g,'""') +
            '"'
        );
    }

    return text;
}


function objectRowsToCSV(rows){

    if(
        !Array.isArray(rows) ||
        !rows.length
    ){
        return "";
    }

    /*
       csvObjects() của trang Admin đã normalize header.
       Core cũng normalize tên cột nên vẫn nhận được các cột:
       ma hoc vien, dau thoi gian, diem so, ...
    */
    const headerSet =
    new Set();

    rows.forEach(
        function(row){

            Object.keys(row || {})
            .forEach(
                function(key){

                    /*
                       Không gửi các cache runtime __...
                       sang Reward Core.
                    */
                    if(
                        key &&
                        !key.startsWith("__")
                    ){
                        headerSet.add(key);
                    }
                }
            );
        }
    );

    const headers =
    [...headerSet];

    if(!headers.length){
        return "";
    }

    const lines = [];

    lines.push(
        headers
        .map(csvEscapeCell)
        .join(",")
    );

    rows.forEach(
        function(row){

            lines.push(
                headers
                .map(
                    key =>
                    csvEscapeCell(
                        row[key] ?? ""
                    )
                )
                .join(",")
            );
        }
    );

    return lines.join("\n");
}


function getValidStudentWorksForCore(
    studentCode
){

    const target =
    normalize(studentCode);

    if(!target){
        return [];
    }

    /*
       works tại thời điểm này đã bị loại XoaBai trong loadData().
       Tuy nhiên vẫn kiểm tra deletedSubmissionIds lần cuối
       để không có bài đã xóa lọt sang Core.
    */
    return works.filter(
        function(item){

            if(
                deletedSubmissionIds.has(
                    workSubmissionId(item)
                )
            ){
                return false;
            }

            return(
                normalize(
                    item.__code ||
                    column(
                        item,
                        ["Mã học viên"]
                    )
                )
                ===
                target
            );
        }
    );
}


function buildStudentSubmissionCSVForCore(
    studentCode
){

    return objectRowsToCSV(
        getValidStudentWorksForCore(
            studentCode
        )
    );
}


/* =========================================================
   [E] TẢI TÀI SẢN CHUẨN CỦA 1 HỌC VIÊN
========================================================= */

async function loadCanonicalStudentAssets(
    studentCode,
    force
){

    const code =
    clean(studentCode);

    if(!code){
        return null;
    }

    const key =
    normalize(code);

    if(
        !force &&
        canonicalAssetMap.has(key)
    ){
        return canonicalAssetMap.get(key);
    }

    if(
        !force &&
        canonicalAssetPromises.has(key)
    ){
        return canonicalAssetPromises.get(key);
    }

    const promise =
    (async function(){

        const RS =
        await waitRewardCore();

        /*
           Bảo đảm dữ liệu dùng chung của Core đã sẵn sàng.
        */
        await RS.loadSharedRewardData(
            Boolean(force)
        );

        /*
           Chỉ gửi bài hợp lệ của đúng học viên.
           Bài trong XoaBai không được phép quay lại Core.
        */
        const submissionCSV =
        buildStudentSubmissionCSVForCore(
            code
        );

        const rawProfile =
        await RS.getStudentRewardProfile(
            code,
            submissionCSV,
            Boolean(force)
        );

        const canonical =
        normalizeCanonicalRewardProfile(
            RS,
            rawProfile,
            code
        );

        canonicalAssetMap.set(
            key,
            canonical
        );

        return canonical;

    })();

    canonicalAssetPromises.set(
        key,
        promise
    );

    try{

        return await promise;

    }finally{

        canonicalAssetPromises.delete(
            key
        );
    }
}


/* =========================================================
   [F] TẢI TÀI SẢN CORE CHO CÁC HỌC VIÊN ĐANG CÓ BÀI
========================================================= */

async function loadCanonicalAssetsForWorks(
    force
){

    const codes =
    [
        ...new Set(
            works
            .map(
                item =>
                clean(
                    item.__code ||
                    column(
                        item,
                        ["Mã học viên"]
                    )
                )
            )
            .filter(Boolean)
        )
    ];

    if(!codes.length){
        return;
    }

    /*
       Chia batch để không tạo hàng trăm request đồng thời.
    */
    const BATCH_SIZE = 6;

    for(
        let start=0;
        start<codes.length;
        start+=BATCH_SIZE
    ){

        const batch =
        codes.slice(
            start,
            start + BATCH_SIZE
        );

        await Promise.all(
            batch.map(
                function(code){

                    return loadCanonicalStudentAssets(
                        code,
                        force
                    )
                    .catch(
                        function(error){

                            console.warn(
                                "Không tải được tài sản Core:",
                                code,
                                error
                            );

                            return null;
                        }
                    );
                }
            )
        );
    }
}


/* =========================================================
   [G] THAY TOÀN BỘ OWNERSHIP CŨ
   XÓA/NGỪNG DÙNG:
   - scanOwnership()
   - addOwnedBeast()
   - buildOwnershipMap() kiểu cũ
   - ownershipMap lấy từ exchangeData/teacherGiftData

   Dùng các hàm dưới đây.
========================================================= */

function canonicalItemName(item){

    if(typeof item === "string"){
        return clean(item);
    }

    if(
        !item ||
        typeof item !== "object"
    ){
        return "";
    }

    return clean(
        item.name ||
        item.itemName ||
        item.giftName ||
        item.tenVatPham ||
        item.title ||
        ""
    );
}


function getCanonicalAssetRecord(
    code
){

    return(
        canonicalAssetMap.get(
            normalize(code)
        )
        ||
        null
    );
}


function getStudentBeasts(
    code,
    name
){

    /*
       name giữ lại trong tham số để không phải sửa
       những nơi cũ đang gọi getStudentBeasts(code,name).
       Nhưng quyền sở hữu KHÔNG còn dò theo tên.
       Core dùng mã học viên làm định danh.
    */

    const canonical =
    getCanonicalAssetRecord(
        code
    );

    if(!canonical){
        return [];
    }

    const result = [];

    canonical.ownedItems.forEach(
        function(owned){

            const ownedName =
            canonicalItemName(
                owned
            );

            const ownedKey =
            normalize(
                ownedName
            );

            if(!ownedKey){
                return;
            }

            /*
               Ghép metadata/icon/độ hiếm từ QuaTang.
               QuaTang chỉ là catalog metadata,
               KHÔNG phải nguồn xác định quyền sở hữu.
            */
            let beast =
            beastCatalog.find(
                function(item){

                    return(
                        ownedKey === item.key
                        ||
                        ownedKey.includes(item.key)
                        ||
                        item.key.includes(ownedKey)
                    );
                }
            );

            if(!beast){

                if(
                    !ownedKey.includes(
                        "linh thu"
                    )
                ){
                    return;
                }

                beast = {

                    name:
                    ownedName,

                    key:
                    ownedKey,

                    icon:
                    "",

                    rarity:
                    "",

                    css:
                    "common",

                    rank:
                    1
                };
            }

            if(
                !result.some(
                    existing =>
                    existing.key === beast.key
                )
            ){

                result.push(
                    beast
                );
            }
        }
    );

    return result.sort(
        (a,b) =>
        b.rank - a.rank
    );
}


function studentOwns(
    code,
    name,
    beastKey
){

    const target =
    normalize(
        beastKey
    );

    if(!target){
        return false;
    }

    const canonical =
    getCanonicalAssetRecord(
        code
    );

    if(!canonical){
        return false;
    }

    /*
       Kiểm tra trực tiếp ownedItems chuẩn từ Core.
    */
    for(
        const ownedKey
        of canonical.ownedItemKeys
    ){

        if(
            ownedKey === target
            ||
            ownedKey.includes(target)
            ||
            target.includes(ownedKey)
        ){
            return true;
        }
    }

    return false;
}


/* =========================================================
   [H] BUILD CACHE MỚI
   THAY TOÀN BỘ buildAllRuntimeCaches() CŨ BẰNG HÀM NÀY.
========================================================= */

function buildAllRuntimeCaches(){

    prepareBaseWorkCache();

    buildLatestSubmissionMap();

    /*
       QuaTang vẫn dùng làm catalog:
       tên, icon, mô tả, độ hiếm.
    */
    buildCatalogMaps();

    /*
       QuaTangGVCN vẫn dùng để hiển thị quà GVCN
       gắn với từng bài và xác minh giao dịch.
    */
    buildTeacherGiftStudentIndex();

    /*
       KHÔNG gọi buildOwnershipMap() nữa.
       Quyền sở hữu đã nằm trong canonicalAssetMap từ Core.
    */

    buildPriorityCache();

    buildSortedWorks();

    if(
        clean(
            adminSearchQuery
        )
    ){
        buildSearchResults();
    }

    if(
        selectedStudentName
    ){
        buildCurrentStudentResults(
            selectedStudentName
        );
    }
}


/* =========================================================
   [I] THAY loadData() CŨ BẰNG BẢN NÀY
========================================================= */

async function loadData(){

    try{

        const workResult =
        await loadWorkData();

        const deleteText =
        await safeFetchCSV(
            URLS.deleteLog
        );

        if(deleteText){

            deleteLogData =
            csvObjects(
                deleteText
            );

            buildDeletedSubmissionIds(
                deleteLogData
            );
        }

        const syncedDuringRefresh =
        reconcilePendingGradesWithRawData(
            workResult.data,
            false
        );

        let freshWorks =
        applyPendingGradesToRawWorks(
            workResult.data
        );

        /*
           QUAN TRỌNG:
           XoaBai phải được lọc trước khi works được dùng
           để dựng CSV gửi sang Reward Core.
        */
        freshWorks =
        filterDeletedWorks(
            freshWorks
        );

        works =
        freshWorks;

        sourceName =
        workResult.source;

        if(
            syncedDuringRefresh > 0
        ){

            console.log(
                "V18.5 xác nhận thêm",
                syncedDuringRefresh,
                "bài chấm."
            );
        }

        /*
           Không còn tải exchanges để tự replay tài sản.
           Chỉ tải:
           - QuaTang = catalog metadata
           - QuaTangGVCN = giao dịch/hiển thị/xác minh quà GVCN
        */
        const results =
        await Promise.all([

            safeFetchCSV(
                URLS.giftCatalog
            ),

            safeFetchCSV(
                URLS.teacherGifts
            )
        ]);

        giftCatalog =
        results[0]
        ?
        csvObjects(
            results[0]
        )
        :
        [];

        teacherGiftData =
        results[1]
        ?
        csvObjects(
            results[1]
        )
        :
        [];

        /*
           Chuẩn bị cache cơ bản trước để có __code,
           __submissionId... cho CSV gửi Core.
        */
        prepareBaseWorkCache();

        buildLatestSubmissionMap();

        buildCatalogMaps();

        buildTeacherGiftStudentIndex();

        /*
           TÀI SẢN CUỐI CÙNG CHỈ LẤY TỪ CORE.
        */
        await loadCanonicalAssetsForWorks(
            false
        );

        /*
           Sau khi Core đã có tài sản, mới tính Linh Thú
           và cơ chế ưu tiên chấm.
        */
        buildPriorityCache();

        buildSortedWorks();

        if(
            clean(
                adminSearchQuery
            )
        ){
            buildSearchResults();
        }

        if(
            selectedStudentName
        ){
            buildCurrentStudentResults(
                selectedStudentName
            );
        }

        updateStatus();

        updateSearchSummary();

        clampCurrentPage();

        restoreCurrentView();

        if(
            pendingGrades.size
        ){

            scheduleGradeSyncCheck(
                GRADE_SYNC_INTERVAL
            );
        }

    }catch(error){

        $("#tp18-loading")
        .style.display =
        "none";

        $("#tp18-error")
        .style.display =
        "block";

        setText(
            $("#tp18-error"),

            "Không thể tải dữ liệu: " +
            (
                error.message ||
                error
            )
        );
    }
}


/* =========================================================
   [J] THAY PHẦN THÀNH CÔNG TRONG verifyGift()
   Trong verifyGift(), sau đoạn:
       teacherGiftData = fresh;
       buildTeacherGiftStudentIndex();

   XÓA:
       buildOwnershipMap();

   VÀ DÙNG ĐOẠN SAU:
========================================================= */

/*
await loadCanonicalStudentAssets(
    expected.code,
    true
);

buildPriorityCache();

buildSortedWorks();

if(
    clean(
        adminSearchQuery
    )
){
    buildSearchResults();
}

return true;
*/


/* =========================================================
   [K] verifyGift() HOÀN CHỈNH
   Có thể thay nguyên hàm cũ bằng hàm này.
========================================================= */

async function verifyGift(
    expected
){

    for(
        let attempt=0;
        attempt<GIFT_VERIFY_TRIES;
        attempt++
    ){

        await sleep(
            GIFT_VERIFY_INTERVAL
        );

        try{

            const fresh =
            csvObjects(
                await fetchCSV(
                    URLS.teacherGifts
                )
            );

            if(
                giftExists(
                    fresh,
                    expected
                )
            ){

                teacherGiftData =
                fresh;

                buildTeacherGiftStudentIndex();

                /*
                   QuaTangGVCN đã xác nhận giao dịch tồn tại.
                   Bây giờ ép Reward Core replay lại hồ sơ.
                */
                await loadCanonicalStudentAssets(
                    expected.code,
                    true
                );

                /*
                   Linh Thú có thể làm thay đổi ưu tiên chấm,
                   nên dựng lại cache ưu tiên sau khi Core refresh.
                */
                buildPriorityCache();

                buildSortedWorks();

                if(
                    clean(
                        adminSearchQuery
                    )
                ){
                    buildSearchResults();
                }

                return true;
            }

        }catch(error){

            console.warn(
                "Gift verify:",
                error
            );
        }
    }

    return false;
}


/* =========================================================
   [L] THÊM EVENT ĐỒNG BỘ CORE
   Đặt trước INIT/openGate().
========================================================= */

function eventStudentCode(detail){

    if(
        !detail ||
        typeof detail !== "object"
    ){
        return "";
    }

    return clean(
        detail.studentCode ||
        detail.code ||
        detail.maHocVien ||
        ""
    );
}


window.addEventListener(
    "ocdRewardProfileChanged",
    function(event){

        const code =
        eventStudentCode(
            event.detail
        );

        if(!code){
            return;
        }

        /*
           Chỉ refresh nếu học viên đó đang xuất hiện
           trong dữ liệu Admin hiện tại.
        */
        const exists =
        works.some(
            item =>
            normalize(
                item.__code
            )
            ===
            normalize(code)
        );

        if(!exists){
            return;
        }

        if(canonicalRefreshTimer){

            clearTimeout(
                canonicalRefreshTimer
            );
        }

        canonicalRefreshTimer =
        setTimeout(
            async function(){

                canonicalRefreshTimer =
                null;

                try{

                    await loadCanonicalStudentAssets(
                        code,
                        true
                    );

                    buildPriorityCache();

                    buildSortedWorks();

                    if(
                        clean(
                            adminSearchQuery
                        )
                    ){
                        buildSearchResults();
                    }

                    if(
                        selectedStudentName
                    ){
                        buildCurrentStudentResults(
                            selectedStudentName
                        );
                    }

                    restoreCurrentView();

                    updateStatus();

                }catch(error){

                    console.warn(
                        "Core asset event refresh:",
                        error
                    );
                }

            },
            150
        );
    }
);


/* =========================================================
   [M] THAY startPage() CŨ BẰNG BẢN NÀY
========================================================= */

async function startPage(){

    $("#tp18-wrap")
    .classList.remove(
        "locked"
    );

    $("#tp18-admin-note")
    .classList.toggle(
        "on",
        ADMIN_MODE
    );

    $("#tp18-submit")
    .classList.toggle(
        "hidden",
        ADMIN_MODE
    );

    $("#tp18-admin-search")
    .classList.toggle(
        "on",
        ADMIN_MODE
    );

    if(ADMIN_MODE){

        setText(
            $("#tp18-admin-note"),

            UI.TOOL +
            " Chế độ GVCN " +
            CHAR.DOT +
            " V18.5 Core Canonical Assets " +
            CHAR.DOT +
            " Quà tặng " +
            CHAR.DOT +
            " Xoá bài"
        );

        setText(
            $("#tp18-search-icon"),
            UI.SEARCH
        );

        setText(
            $("#tp18-search-clear"),

            CHAR.CROSS +
            " Xóa"
        );
    }

    if(started){
        return;
    }

    started = true;

    /*
       Trang Admin không nhúng Core.
       Core phải được gadget/widget chung tải sẵn.
    */
    try{

        await waitRewardCore();

    }catch(error){

        started = false;

        $("#tp18-loading")
        .style.display =
        "none";

        $("#tp18-error")
        .style.display =
        "block";

        setText(
            $("#tp18-error"),
            "Không tìm thấy Reward Core dùng chung. " +
            "Hãy kiểm tra gadget/widget StudentRewardSystem."
        );

        console.error(error);

        return;
    }

    loadData();

    setInterval(
        loadData,
        REFRESH_MS
    );
}


/* =========================================================
   [N] DỌN CONFIG/DỮ LIỆU CŨ

   1. URLS.exchanges có thể xóa.
   2. Biến:
        let exchangeData = [];
        let ownershipMap = new Map();
      có thể xóa.
   3. Các hàm:
        studentCodeKey
        studentNameKey
        addOwnedBeast
        scanOwnership
        buildOwnershipMap
      có thể xóa.
   4. KHÔNG xóa:
        giftCatalog
        teacherGiftData
        buildTeacherGiftStudentIndex
        getTeacherGiftsForWork
        giftExists
        verifyGift
      vì đây vẫn là catalog + giao dịch GVCN.
========================================================= */


/* =========================================================
   KẾT QUẢ KIẾN TRÚC

   GVCN bấm TẶNG
        ↓
   Google Form
        ↓
   QuaTangGVCN
        ↓
   verifyGift() xác minh giao dịch
        ↓
   StudentRewardSystem.getStudentRewardProfile(..., true)
        ↓
   Core replay tài sản chuẩn
        ↓
   Admin đọc ownedItems từ Core
        ↓
   Linh Thú / ưu tiên chấm đồng nhất với Tra cứu và trang khác

   Admin KHÔNG còn là một "Core tài sản thứ hai".
========================================================= */


