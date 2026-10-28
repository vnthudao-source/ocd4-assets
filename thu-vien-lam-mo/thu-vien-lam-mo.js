

(function(){


"use strict";




/* ==================================================
CẤU HÌNH
================================================== */


const sheetURL =
"https://docs.google.com/spreadsheets/d/1MmqY19BSi8L6xdsF5cg1qZssrERSrqBH6nEGZjqOMLI/export?format=csv&gid=179109844";


const sheetHocVienURL =
"https://docs.google.com/spreadsheets/d/1GJoTRsbq0kZfZrDdh0uCC667PwS3Bgkje2fHQnwnCKs/export?format=csv&gid=1326884435";
const STORAGE_KEY =
"lammo_ma_hoc_vien";




/* ==================================================
BIẾN
================================================== */


let duLieu = [];
let duLieuHocVien = [];
let duLieuDuocMo = [];
let duLieuHienTai = [];


let diemHocVien = 0;
let hocVienDangNhap = null;


let hienOMe = true;
let dangXem = null;


let trangHienTai = 1;


let duLieuLamMoDaTai = false;
let duLieuHocVienDaTai = false;


let dangDongBoMinhHong = false;


const soLuongMoiTrang = 20;


// Điền URL /exec sau khi deploy Apps Script. Không dùng URL /dev.
const VIDEO_CONTRIBUTION_APP_URL = "https://script.google.com/macros/s/AKfycbz4pa-q_ALScuiY8tbhi5bdJ0MPtl-IBu6gjZuDeFXuailbvPYhlk1TmE_Hq4DjJxHFIg/exec";
let contributionRequestToken=0;
let contributionVideos=[];
let cancelContributionRequest=null;




/* ==================================================
MINH HỒNG CONTEXT - BIẾN
================================================== */


let minhHongContextRetryTimer = null;
let minhHongContextRetryCount = 0;


const MINH_HONG_CONTEXT_RETRY_MAX = 12;
const MINH_HONG_CONTEXT_RETRY_DELAY = 250;




/* ==================================================
HELPER DOM
================================================== */


function byId(id){
    return document.getElementById(id);
}




/* ==================================================
CHUẨN HÓA MÃ
================================================== */


function chuanHoaMa(value){


    return String(
        value === undefined ||
        value === null
        ?
        ""
        :
        value
    )
    .replace(/[\u200B-\u200D\uFEFF]/g,"")
    .trim()
    .toUpperCase()
    .replace(/\s+/g,"");
}




/* ==================================================
PARSE CSV
================================================== */


function parseCSV(text){


    let rows = [];
    let row = [];
    let cell = "";
    let insideQuotes = false;


    for(let i = 0; i < text.length; i++){


        let char = text[i];
        let next = text[i + 1];


        if(char === '"'){


            if(insideQuotes && next === '"'){
                cell += '"';
                i++;
            }else{
                insideQuotes = !insideQuotes;
            }


        }


        else if(char === "," && !insideQuotes){


            row.push(cell);
            cell = "";


        }


        else if(
            (char === "\n" || char === "\r")
            &&
            !insideQuotes
        ){


            if(char === "\r" && next === "\n"){
                i++;
            }


            row.push(cell);


            if(
                row.some(
                    x => String(x).trim() !== ""
                )
            ){
                rows.push(row);
            }


            row = [];
            cell = "";


        }


        else{
            cell += char;
        }


    }


    if(cell !== "" || row.length){


        row.push(cell);


        if(
            row.some(
                x => String(x).trim() !== ""
            )
        ){
            rows.push(row);
        }


    }


    return rows;
}




/* ==================================================
CHUẨN HÓA CHỮ
================================================== */


function boDau(text){


    return String(text || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"")
        .replace(/đ/g,"d")
        .replace(/Đ/g,"D")
        .toLowerCase()
        .trim();


}




/* ==================================================
TÌM CỘT
================================================== */


function timCot(headers,danhSachTen){


    let hs = headers.map(
        x => boDau(x)
    );


    for(let ten of danhSachTen){


        let canTim = boDau(ten);


        let index = hs.findIndex(
            x =>
            x === canTim
            ||
            x.includes(canTim)
        );


        if(index !== -1){
            return index;
        }


    }


    return -1;
}




/* ==================================================
ĐỌC ĐIỂM
================================================== */


function docDiem(value){


    if(value === undefined || value === null){
        return 0;
    }


    let s = String(value)
        .trim()
        .replace(/\s/g,"");


    if(/^\d{1,3}(\.\d{3})+$/.test(s)){


        s = s.replace(/\./g,"");


    }


    else if(/^\d{1,3}(,\d{3})+$/.test(s)){


        s = s.replace(/,/g,"");


    }


    else{


        s = s.replace(",",".");


    }


    s = s.replace(/[^\d.-]/g,"");


    let n = parseFloat(s);


    return isNaN(n) ? 0 : n;
}




/* ==================================================
GOOGLE DRIVE
================================================== */


function layIdDrive(url){


    if(!url){
        return "";
    }


    url = String(url).trim();


    let patterns = [
        /\/file\/d\/([^\/?]+)/,
        /\/d\/([^\/?]+)/,
        /[?&]id=([^&]+)/,
        /thumbnail\?id=([^&]+)/,
        /uc\?.*?[?&]id=([^&]+)/
    ];


    for(let pattern of patterns){


        let match = url.match(pattern);


        if(match && match[1]){
            return match[1];
        }


    }


    return "";
}




function anhDrive(url){


    if(!url){
        return "";
    }


    url = String(url).trim();


    let id = layIdDrive(url);


    if(id){


        return "https://drive.google.com/thumbnail?id="
        + encodeURIComponent(id)
        + "&sz=w1200";


    }


    return url;
}




/* ==================================================
ẢNH DỰ PHÒNG
================================================== */


function xuLyLoiAnh(img,linkGoc){


    if(!img || !linkGoc){
        return;
    }


    let id = layIdDrive(linkGoc);


    if(!id){


        img.onerror = null;
        return;


    }


    let lan = Number(
        img.getAttribute("data-thu-anh") || "0"
    );


    if(lan === 0){


        img.setAttribute(
            "data-thu-anh",
            "1"
        );


        img.src =
        "https://drive.google.com/uc?export=view&id="
        +
        encodeURIComponent(id);


        return;
    }


    if(lan === 1){


        img.setAttribute(
            "data-thu-anh",
            "2"
        );


        img.src =
        "https://lh3.googleusercontent.com/d/"
        +
        encodeURIComponent(id)
        +
        "=w1200";


        return;
    }


    img.onerror = null;
}




/* ==================================================
ESCAPE HTML
================================================== */


function escapeHTML(text){


    return String(
        text === undefined || text === null
        ?
        ""
        :
        text
    )
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");
}




/* ==================================================
MINH HỒNG STUDENT SESSION
================================================== */


function layMinhHongSession(){


    try{


        if(
            window.OCDStudentSession
            &&
            typeof window.OCDStudentSession.getState === "function"
        ){


            return window.OCDStudentSession.getState();


        }


    }catch(error){


        console.warn(
            "[Lâm Mô] Không đọc được OCDStudentSession:",
            error
        );


    }


    return null;
}




function layMaDaXacMinhTuMinhHong(){


    let session =
        layMinhHongSession();


    if(!session){
        return "";
    }


    let mode =
        String(
            session.mode || ""
        )
        .trim()
        .toLowerCase();


    let verified =
        session.verified === true;


    let code =
        chuanHoaMa(
            session.code
        );


    if(
        mode === "student"
        &&
        verified
        &&
        code
    ){
        return code;
    }


    return "";
}




/* ==================================================
ĐỌC SESSION MINH HỒNG TỪ STORAGE
================================================== */


function layMaMinhHongTuStorage(){


    try{


        let raw =
            localStorage.getItem(
                "ocd_student_session_v1"
            );


        if(!raw){
            return "";
        }


        let session =
            JSON.parse(raw);


        if(!session){
            return "";
        }


        let mode =
            String(
                session.mode || ""
            )
            .trim()
            .toLowerCase();


        let code =
            chuanHoaMa(
                session.code
            );


        if(
            mode === "student"
            &&
            session.verified === true
            &&
            code
        ){
            return code;
        }


    }catch(error){}


    return "";
}




/* ==================================================
ĐỒNG BỘ MÃ LÂM MÔ -> MINH HỒNG
================================================== */


function dongBoMaSangMinhHong(ma){


    ma =
        chuanHoaMa(ma);


    if(!ma){
        return;
    }


    if(dangDongBoMinhHong){
        return;
    }


    try{


        let session =
            layMinhHongSession();


        let maHienTai =
            session
            ?
            chuanHoaMa(
                session.code
            )
            :
            "";


        let daXacMinh =
            Boolean(
                session
                &&
                session.mode === "student"
                &&
                session.verified === true
            );


        if(
            maHienTai === ma
            &&
            daXacMinh
        ){
            return;
        }


        if(
            window.OCDStudentSession
            &&
            typeof window.OCDStudentSession.confirmStudent === "function"
        ){


            dangDongBoMinhHong = true;


            window.OCDStudentSession.confirmStudent(
                ma,
                "lam-mo"
            );


            setTimeout(function(){
                dangDongBoMinhHong = false;
            },100);


            return;
        }


        if(
            window.OCDStudentSession
            &&
            typeof window.OCDStudentSession.rememberStudent === "function"
        ){


            dangDongBoMinhHong = true;


            window.OCDStudentSession.rememberStudent(
                ma,
                "lam-mo"
            );


            setTimeout(function(){
                dangDongBoMinhHong = false;
            },100);


        }


    }catch(error){


        dangDongBoMinhHong = false;


        console.warn(
            "[Lâm Mô] Không đồng bộ được mã sang Minh Hồng:",
            error
        );


    }


}




/* ==================================================
MINH HỒNG CONTEXT BRIDGE
================================================== */


/*
Context Bridge KHÔNG tải thêm Sheet.


Nó chỉ sử dụng dữ liệu mà trang Lâm Mô
đã có sẵn:


- học viên
- XP
- tổng số bài
- số bài đã mở
- số bài chưa mở
- bài đang xem


Sheet Minh Hồng sẽ quyết định nội dung
cần hiển thị dựa trên conditions.
*/




function layMinhHongContextAPI(){


    try{


        if(
            window.OCDMinhHongContext
            &&
            typeof window.OCDMinhHongContext.set === "function"
        ){


            return window.OCDMinhHongContext;


        }


    }catch(error){}


    return null;
}




/* ==================================================
XÓA CONTEXT LÂM MÔ
================================================== */


function xoaMinhHongContext(){


    clearTimeout(
        minhHongContextRetryTimer
    );


    minhHongContextRetryTimer = null;
    minhHongContextRetryCount = 0;


    try{


        if(
            window.OCDMinhHongContext
            &&
            typeof window.OCDMinhHongContext.clear === "function"
        ){


            window.OCDMinhHongContext.clear(
                "lam-mo"
            );


        }


    }catch(error){


        console.warn(
            "[Lâm Mô] Không xóa được Minh Hồng Context:",
            error
        );


    }


}




/* ==================================================
TẠO PAYLOAD CONTEXT
================================================== */


function taoMinhHongContext(){


    if(!hocVienDangNhap){


        return null;


    }


    let tong =
        Number(
            duLieu.length || 0
        );


    let daMo =
        Number(
            duLieuDuocMo.length || 0
        );


    let chuaMo =
        Math.max(
            0,
            tong - daMo
        );


    let currentTitle = "";
    let currentTopic = "";
    let currentAuthor = "";
    let currentRequiredXp = 0;


    if(dangXem){


        currentTitle =
            String(
                dangXem.noiDung || ""
            ).trim();


        currentTopic =
            String(
                dangXem.chuDe || ""
            ).trim();


        currentAuthor =
            String(
                dangXem.nguoiViet || ""
            ).trim();


        currentRequiredXp =
            Number(
                dangXem.diemMoKhoa || 0
            );


    }


    return {


        page:"LamMo",


        studentCode:
            chuanHoaMa(
                hocVienDangNhap.ma
            ),


        data:{


            studentName:
                String(
                    hocVienDangNhap.ten || ""
                ).trim(),


            xp:
                Number(
                    diemHocVien || 0
                ),


            totalCount:
                tong,


            unlockedCount:
                daMo,


            lockedCount:
                chuaMo,


            currentTitle:
                currentTitle,


            currentTopic:
                currentTopic,


            currentAuthor:
                currentAuthor,


            currentRequiredXp:
                currentRequiredXp


        },


        conditions:{


            has_unlocked_content:
                daMo > 0,


            has_locked_content:
                tong > 0
                &&
                chuaMo > 0,


            all_content_unlocked:
                tong > 0
                &&
                daMo === tong,


            viewing_content:
                Boolean(
                    dangXem
                    &&
                    currentTitle
                )


        }


    };


}




/* ==================================================
GỬI CONTEXT -> MINH HỒNG
================================================== */


function dongBoMinhHongContext(){


    let payload =
        taoMinhHongContext();


    /*
    Không còn học viên hợp lệ:
    xóa Context của Lâm Mô.
    */


    if(!payload){


        xoaMinhHongContext();


        return false;


    }


    let api =
        layMinhHongContextAPI();


    /*
    Minh Hồng có thể tải sau script Lâm Mô.


    Chỉ retry ngắn hạn.
    Không dùng setInterval.
    */


    if(!api){


        if(
            minhHongContextRetryCount
            >=
            MINH_HONG_CONTEXT_RETRY_MAX
        ){


            minhHongContextRetryCount = 0;


            return false;


        }


        minhHongContextRetryCount++;


        clearTimeout(
            minhHongContextRetryTimer
        );


        minhHongContextRetryTimer =
        setTimeout(
            dongBoMinhHongContext,
            MINH_HONG_CONTEXT_RETRY_DELAY
        );


        return false;


    }


    clearTimeout(
        minhHongContextRetryTimer
    );


    minhHongContextRetryTimer = null;
    minhHongContextRetryCount = 0;


    try{


        api.set(
            payload,
            "lam-mo"
        );


        return true;


    }catch(error){


        console.warn(
            "[Lâm Mô] Không đồng bộ được Minh Hồng Context:",
            error
        );


        return false;


    }


}




/* ==================================================
ÁP DỤNG MÃ TỪ MINH HỒNG
================================================== */


function apDungMaTuMinhHong(){


    if(!duLieuHocVienDaTai){
        return false;
    }


    let ma =
        layMaDaXacMinhTuMinhHong()
        ||
        layMaMinhHongTuStorage();


    if(!ma){
        return false;
    }


    let input =
        byId("maHocVien");


    if(!input){
        return false;
    }


    if(
        hocVienDangNhap
        &&
        chuanHoaMa(
            hocVienDangNhap.ma
        ) === ma
    ){


        input.value = ma;


        /*
        Session đã đúng học viên.
        Đồng bộ lại Context nếu Minh Hồng
        vừa mới tải xong.
        */


        dongBoMinhHongContext();


        return true;


    }


    /*
    Trước khi chuyển sang mã mới,
    bỏ Context của học viên trước.
    */


    xoaMinhHongContext();


    dangXem = null;


    input.value = ma;


    kiemTraHocVien({
        source:"minh-hong",
        syncMinhHong:false
    });


    return true;
}




/* ==================================================
CHỜ MINH HỒNG NẾU SCRIPT TẢI SAU
================================================== */


function thuDongBoMinhHong(){


    if(
        apDungMaTuMinhHong()
    ){
        return;
    }


    let soLan = 0;
    const toiDa = 12;


    function thuLai(){


        soLan++;


        if(
            apDungMaTuMinhHong()
        ){
            return;
        }


        if(soLan >= toiDa){
            return;
        }


        setTimeout(
            thuLai,
            250
        );


    }


    setTimeout(
        thuLai,
        100
    );


}




/* ==================================================
LẮNG NGHE MINH HỒNG ĐỔI MÃ
================================================== */


window.addEventListener(
    "ocdStudentSessionChanged",
    function(event){


        if(dangDongBoMinhHong){
            return;
        }


        const current =
            event
            &&
            event.detail
            &&
            event.detail.current
            ?
            event.detail.current
            :
            null;


        const mode =
            String(
                current
                &&
                current.mode
                ||
                ""
            )
            .trim()
            .toLowerCase();


        const code =
            chuanHoaMa(
                current
                &&
                current.code
            );


        const verified =
            Boolean(
                current
                &&
                current.verified === true
            );


        if(
            mode === "student"
            &&
            verified
            &&
            code
        ){


            if(duLieuHocVienDaTai){


                kiemTraHocVien({
                    ma:code,
                    source:"minh-hong",
                    syncMinhHong:false
                });


            }


            return;
        }


        /*
        Minh Hồng không còn phiên học viên hợp lệ:
        xóa và ẩn toàn bộ thông tin của lần tra cứu trước.
        */


        xoaMaHocVien();
    }
);






/* ==================================================
TẢI SHEET LÂM MÔ
================================================== */


async function fetchSheetText(url,timeout=15000){
    const controller=new AbortController();let timer;
    const deadline=new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error('Nguồn dữ liệu phản hồi chậm. Vui lòng tải lại trang.'));},timeout);});
    try{return await Promise.race([fetch(url,{signal:controller.signal}).then(res=>{if(!res.ok)throw Error('Không tải được nguồn dữ liệu.');return res.text();}),deadline]);}
    finally{clearTimeout(timer);}
}


function taiDuLieuLamMo(){


    return fetchSheetText(sheetURL + "&_=" + Date.now())


    .then(csv=>{


        let bang = parseCSV(csv);


        if(bang.length <= 1){


            throw new Error(
                "Sheet lâm mô không có dữ liệu"
            );


        }


        bang.shift();


        duLieu = bang


        .map((col,index)=>{


            return{


                id:
                    String(col[10] || "").trim() || "lammo_" + index,


                nguoiViet:
                    String(col[1] || "").trim(),


                hinhAnh:
                    String(col[2] || "").trim(),


                noiDung:
                    String(col[3] || "").trim(),


                soLuong:
                    String(col[4] || "").trim(),


                tacGia:
                    String(col[5] || "").trim(),


                video:
                    String(col[6] || "").trim(),


                moTa:
                    String(col[7] || "").trim(),


                chuDe:
                    String(col[8] || "").trim(),


                diemMoKhoa:
                    docDiem(
                        col[9] || 0
                    )


            };


        })


        .filter(item =>


            item.hinhAnh !== ""
            ||
            item.noiDung !== ""


        );


        /*
        BÀI MỚI NHẤT HIỆN TRƯỚC
        */


        duLieu.reverse();


        duLieuLamMoDaTai = true;


        capNhatThuVienTheoDiem();


        /*
        Nếu học viên đã được xác minh trước
        khi dữ liệu Lâm Mô tải xong,
        cập nhật lại Context với tổng bài thật.
        */


        if(hocVienDangNhap){
            dongBoMinhHongContext();
        }


        return duLieu;


    });


}




/* ==================================================
TẢI SHEET XepHang
================================================== */


function taiDuLieuHocVien(){


    return fetchSheetText(sheetHocVienURL + "&_=" + Date.now())


    .then(csv=>{


        let bang = parseCSV(csv);


        if(bang.length <= 1){


            throw new Error(
                "Sheet XepHang không có dữ liệu"
            );


        }


        let headers = bang[0];


        let cotMa = timCot(
            headers,
            [
                "Mã học viên",
                "Ma hoc vien"
            ]
        );


        let cotTen = timCot(
            headers,
            [
                "Họ và tên",
                "Ho va ten"
            ]
        );


        let cotDiem = timCot(
            headers,
            [
                "Điểm kinh nghiệm",
                "Diem kinh nghiem"
            ]
        );


        if(cotMa === -1){


            throw new Error(
                "Không tìm thấy cột Mã học viên trong sheet XepHang"
            );


        }


        if(cotDiem === -1){


            throw new Error(
                "Không tìm thấy cột Điểm kinh nghiệm trong sheet XepHang"
            );


        }


        duLieuHocVien = bang


        .slice(1)


        .map(row=>{


            return{


                ma:
                    chuanHoaMa(
                        row[cotMa] || ""
                    ),


                ten:
                    cotTen !== -1
                    ?
                    String(
                        row[cotTen] || ""
                    ).trim()
                    :
                    "",


                diem:
                    docDiem(
                        row[cotDiem]
                    )


            };


        })


        .filter(
            item => item.ma !== ""
        );


        duLieuHocVienDaTai = true;


        return duLieuHocVien;


    });


}




/* ==================================================
KHỞI ĐỘNG
================================================== */


Promise.allSettled([


    taiDuLieuLamMo(),


    taiDuLieuHocVien()


])


.then(results=>{


    if(results[0].status === "rejected"){


        console.error(
            "Lỗi lâm mô:",
            results[0].reason
        );


        byId(
            "list"
        ).innerHTML =


        `
        <div class="loading">
        Nguồn thư viện phản hồi chậm hoặc chưa mở quyền đọc. Hãy tải lại trang.
        </div>
        `;


    }


    if(results[0].status === "rejected"){byId("thong-ke-mo-khoa").textContent="Chưa tải được thư viện. Vui lòng tải lại trang.";}


    if(results[1].status === "rejected"){


        console.error(
            "Lỗi XepHang:",
            results[1].reason
        );


        /*
        Không hiển thị lỗi tra cứu tại đây.
        Minh Hồng vẫn là nguồn xác thực học viên;
        điểm sẽ tạm là 0 nếu XepHang chưa đồng bộ.
        */


        duLieuHocVien = [];
        duLieuHocVienDaTai = true;
    }




    /*
    =================================================
    ƯU TIÊN 1:
    MINH HỒNG VERIFIED SESSION
    =================================================
    */


    let maMinhHong =
        layMaDaXacMinhTuMinhHong()
        ||
        layMaMinhHongTuStorage();


    if(maMinhHong){


        byId(
            "maHocVien"
        ).value = maMinhHong;


        kiemTraHocVien({
            source:"minh-hong",
            syncMinhHong:false
        });


        return;
    }






    /*
    Không dùng lại mã lưu riêng của trang Lâm Mô.
    Nếu Minh Hồng tải sau, cơ chế chờ sẽ tự đồng bộ.
    */


    /*
    Minh Hồng có thể tải sau trang này.
    */


    thuDongBoMinhHong();


});




/* ==================================================
CENTRAL STUDENT STATUS GATE
================================================== */


async function kiemTraTrangThaiHocVien(ma){


    const rewardSystem =
    window.StudentRewardSystem;


    if(
        !rewardSystem ||
        typeof rewardSystem.assertStudentActive !== "function"
    ){


        throw new Error(
            "Hệ thống trạng thái học viên chưa sẵn sàng."
        );
    }


    return rewardSystem.assertStudentActive(
        ma,
        {
            forceRefresh:true
        }
    );
}




/* ==================================================
KIỂM TRA HỌC VIÊN
================================================== */


async function kiemTraHocVien(options){


    options =
        options || {};


    const thongTin =
        byId("thong-tin-hoc-vien");


    if(thongTin){
        thongTin.hidden = true;
        thongTin.innerHTML = "";
    }


    /*
    Minh Hồng là nơi duy nhất tra cứu và xác minh mã.
    Trang Lâm Mô chỉ tiếp nhận phiên học viên đã xác minh.
    */


    let ma =
        chuanHoaMa(
            options.ma
            ||
            layMaDaXacMinhTuMinhHong()
            ||
            layMaMinhHongTuStorage()
        );


    const input =
        byId("maHocVien");


    if(input){
        input.value = ma;
    }


    if(!ma){


        hocVienDangNhap = null;
        diemHocVien = 0;
        dangXem = null;


        xoaMinhHongContext();
        capNhatThuVienTheoDiem();


        return;
    }


    let studentAccess;


    try{


        studentAccess =
            await kiemTraTrangThaiHocVien(
                ma
            );


    }catch(accessError){


        console.warn(
            "[Thu vien Lam mo Student Status Gate]",
            accessError
        );


        hocVienDangNhap = null;
        diemHocVien = 0;
        dangXem = null;


        xoaMinhHongContext();
        capNhatThuVienTheoDiem();


        return;
    }


    /*
    Điểm vẫn lấy từ XepHang. Nếu sheet đang chậm đồng bộ,
    giữ phiên Minh Hồng hợp lệ và tạm dùng 0 điểm thay vì
    báo sai rằng không tìm thấy mã học viên.
    */


    const student =
        studentAccess
        &&
        studentAccess.student
        ?
        studentAccess.student
        :
        {};


    function timHocVienTrongXepHang(){


        let ketQua =
            duLieuHocVien.find(
                item =>
                chuanHoaMa(item.ma) === ma
            );


        if(
            !ketQua
            &&
            student.name
        ){


            const tenCanTim =
                boDau(student.name);


            const trungTen =
                duLieuHocVien.filter(
                    item =>
                    boDau(item.ten) === tenCanTim
                );


            if(trungTen.length === 1){
                ketQua = trungTen[0];
            }
        }


        return ketQua || null;
    }


    let hv =
        timHocVienTrongXepHang();


    /*
    Tải mới XepHang một lần khi dữ liệu ban đầu chưa có
    hoặc chưa kịp đồng bộ, sau đó đối chiếu lại mã/tên.
    */


    if(!hv){


        try{


            await taiDuLieuHocVien();
            hv = timHocVienTrongXepHang();


        }catch(refreshError){


            console.warn(
                "[Thu vien Lam mo] Không tải mới được điểm XepHang:",
                refreshError
            );
        }
    }


    if(!hv){


        hv = {
            ma: ma,
            ten: String(student.name || "").trim(),
            diem: 0
        };


        console.warn(
            "[Thu vien Lam mo] Học viên hợp lệ nhưng chưa có điểm trong XepHang:",
            ma
        );
    }


    hv.diem =
        docDiem(
            hv.diem
        );




    if(
        hocVienDangNhap
        &&
        chuanHoaMa(
            hocVienDangNhap.ma
        )
        !==
        chuanHoaMa(
            hv.ma
        )
    ){


        xoaMinhHongContext();
        dangXem = null;


    }


    hocVienDangNhap = hv;
    diemHocVien = hv.diem;


    let tenHTML =


    hv.ten
    ?
    `
    <b>
    ${escapeHTML(hv.ten)}
    </b>
    <br>
    `
    :
    "";


    if(thongTin){


        thongTin.innerHTML =


        `
        <div class="hv-thanh-cong">


        ${tenHTML}


        Mã học viên:


        <b>
        ${escapeHTML(hv.ma)}
        </b>


        <br>


        Điểm kinh nghiệm:


        <span class="diem-noi-bat">


        ${escapeHTML(hv.diem)}


        </span>


        <br>


        Hệ thống đã mở khóa
        các bài lâm mô phù hợp
        với điểm kinh nghiệm hiện tại.


        </div>
        `;


        thongTin.hidden = false;
    }


    capNhatThuVienTheoDiem();
    dongBoMinhHongContext();


}




/* ==================================================
XÓA MÃ
================================================== */


function xoaMaHocVien(){


    const input =
        byId("maHocVien");


    if(input){
        input.value = "";
    }


    hocVienDangNhap = null;
    diemHocVien = 0;
    dangXem = null;


    xoaMinhHongContext();


    const thongTin =
        byId("thong-tin-hoc-vien");


    if(thongTin){
        thongTin.innerHTML = "";
        thongTin.hidden = true;
    }


    capNhatThuVienTheoDiem();


}






/* ==================================================
MỞ KHÓA
================================================== */


/* ==================================================
LIEN KET THANG TOI 1 BAN MAU
thu-vien-lam-mo.html?lm=LM_xxx  (trang Giang duong dung link nay)
================================================== */


let lamMoLienKet = (function(){
    try{
        const q = new URLSearchParams(location.search).get("lm") ||
            (location.hash.match(/(?:^#|&)lm=([^&]+)/) || [])[1] || "";
        return decodeURIComponent(q).trim();
    }catch(e){
        return "";
    }
})();


let lamMoLienKetHen = null;


function moLamMoTuLienKet(){
    if(!lamMoLienKet){
        return;
    }
    const id = lamMoLienKet;
    if(duLieuDuocMo.some(x => x.id === id)){
        lamMoLienKet = "";
        clearTimeout(lamMoLienKetHen);
        setTimeout(() => moLamMo(id), 0);
        return;
    }
    if(!duLieu.some(x => x.id === id)){
        lamMoLienKet = "";
        return;
    }
    /* bai con khoa: cho hoc vien dang nhap / cap nhat diem roi thu lai */
    clearTimeout(lamMoLienKetHen);
    lamMoLienKetHen = setTimeout(() => {
        if(lamMoLienKet === id){
            lamMoLienKet = "";
            alert("Bản mẫu này chưa mở khóa với điểm kinh nghiệm hiện tại. Hãy đăng nhập hoặc tích thêm điểm để xem.");
        }
    }, 8000);
}




function capNhatThuVienTheoDiem(){


    if(!duLieu.length){
        return;
    }


    duLieuDuocMo =
        duLieu.filter(


            item =>


            Number(
                item.diemMoKhoa || 0
            )


            <=


            Number(
                diemHocVien || 0
            )


        );


    trangHienTai = 1;


    byId(
        "search"
    ).value = "";


    byId(
        "locSoLuong"
    ).innerHTML =


    `
    <option value="">
    Tất cả số lượng chữ
    </option>
    `;


    byId(
        "locChuDe"
    ).innerHTML =


    `
    <option value="">
    Tất cả chủ đề
    </option>
    `;


    byId(
        "locDiem"
    ).innerHTML =


    `
    <option value="">
    Tất cả mốc điểm kinh nghiệm
    </option>
    `;


    taoBoLoc();


    hienThi(
        duLieuDuocMo
    );


    capNhatThongKe();


    moLamMoTuLienKet();


    /*
    Nếu đã có học viên,
    cập nhật lại số bài mở khóa.
    */


    if(hocVienDangNhap){
        dongBoMinhHongContext();
    }


}




/* ==================================================
THỐNG KÊ
================================================== */


function capNhatThongKe(){


    let tong = duLieu.length;
    let daMo = duLieuDuocMo.length;
    let biKhoa = tong - daMo;


    if(hocVienDangNhap){


        byId(
            "thong-ke-mo-khoa"
        ).innerHTML =


        `
        Điểm kinh nghiệm:


        <b>
        ${escapeHTML(diemHocVien)}
        </b>


        &nbsp;•&nbsp;


        Đã mở:


        <b>
        ${daMo}
        </b>


        bài


        &nbsp;•&nbsp;


        Chưa mở:


        <b>
        ${biKhoa}
        </b>


        bài
        `;


    }


    else{


        byId(
            "thong-ke-mo-khoa"
        ).innerHTML =


        `
        Hiện đang hiển thị


        <b>
        ${daMo}
        </b>


        bài lâm mô mốc 0 điểm.


        Nhập mã học viên để mở thêm tài liệu.
        `;


    }


}




/* ==================================================
TẠO BỘ LỌC
================================================== */


function taoBoLoc(){


    let soLuong = [];
    let chuDe = [];
    let diem = [];


    duLieuDuocMo.forEach(item=>{


        if(
            item.soLuong
            &&
            !soLuong.includes(
                item.soLuong
            )
        ){


            soLuong.push(
                item.soLuong
            );


        }


        if(
            item.chuDe
            &&
            !chuDe.includes(
                item.chuDe
            )
        ){


            chuDe.push(
                item.chuDe
            );


        }


        let diemItem =
            Number(
                item.diemMoKhoa || 0
            );


        if(
            !diem.includes(
                diemItem
            )
        ){


            diem.push(
                diemItem
            );


        }


    });


    diem.sort(
        (a,b) => a-b
    );


    soLuong.forEach(x=>{


        let option =
            document.createElement(
                "option"
            );


        option.value = x;
        option.textContent = x + " chữ";


        byId(
            "locSoLuong"
        ).appendChild(option);


    });


    chuDe.forEach(x=>{


        let option =
            document.createElement(
                "option"
            );


        option.value = x;
        option.textContent = x;


        byId(
            "locChuDe"
        ).appendChild(option);


    });


    diem.forEach(x=>{


        let option =
            document.createElement(
                "option"
            );


        option.value = x;


        option.textContent =
            "Mốc " + x + " điểm";


        byId(
            "locDiem"
        ).appendChild(option);


    });


}




/* ==================================================
HIỂN THỊ
================================================== */


function hienThi(data){


    duLieuHienTai = data;


    let html = "";


    let tongTrang =
        Math.ceil(
            data.length
            /
            soLuongMoiTrang
        );


    if(
        tongTrang > 0
        &&
        trangHienTai > tongTrang
    ){
        trangHienTai = 1;
    }


    let batDau =
        (
            trangHienTai - 1
        )
        *
        soLuongMoiTrang;


    let ketThuc =
        batDau
        +
        soLuongMoiTrang;


    let dsTrang =
        data.slice(
            batDau,
            ketThuc
        );


    if(dsTrang.length === 0){


        html =


        `
        <div class="loading">
        Không tìm thấy tác phẩm
        </div>
        `;


    }


    else{


        dsTrang.forEach(item=>{


            if(item.hinhAnh){


                let nhan = "";


                if(item.diemMoKhoa > 0){


                    nhan =


                    `
                    <div class="nhan-mo-khoa">


                    Mốc
                    ${escapeHTML(
                        item.diemMoKhoa
                    )}
                    điểm


                    </div>
                    `;


                }


                let linkAnh =
                    anhDrive(
                        item.hinhAnh
                    );


                html +=


                `
                <div
                class="the"
                onclick="moLamMo('${item.id}')"
                >


                ${nhan}


                <img
                src="${escapeHTML(linkAnh)}"
                data-thu-anh="0"
                loading="lazy"
                alt="${escapeHTML(item.noiDung)}"
                onerror="xuLyLoiAnh(this,'${escapeHTML(item.hinhAnh)}')"
                >


                <h3>
                ${escapeHTML(item.noiDung)}
                </h3>


                <div class="thong-tin">


                <b>Người viết:</b>
                ${escapeHTML(item.nguoiViet)}


                <br>


                <b>Tác giả:</b>
                ${escapeHTML(item.tacGia)}


                <br>


                <b>Chủ đề:</b>
                ${escapeHTML(item.chuDe)}


                </div>


                </div>
                `;


            }


        });


    }


    byId(
        "list"
    ).innerHTML = html;


    taoPhanTrang(data);


}




/* ==================================================
PHÂN TRANG
================================================== */


function taoPhanTrang(data){


    let tongTrang =
        Math.ceil(
            data.length
            /
            soLuongMoiTrang
        );


    let html = "";


    if(tongTrang <= 1){


        byId(
            "phan-trang"
        ).innerHTML = "";


        return;
    }


    if(trangHienTai > 1){


        html +=


        `
        <button
        class="nut"
        onclick="doiTrang(${trangHienTai - 1})"
        >
        ←
        </button>
        `;


    }


    let batDau =
        Math.max(
            1,
            trangHienTai - 3
        );


    let ketThuc =
        Math.min(
            tongTrang,
            trangHienTai + 3
        );


    if(batDau > 1){


        html +=


        `
        <button
        class="nut"
        onclick="doiTrang(1)"
        >
        1
        </button>
        `;


        if(batDau > 2){
            html += " ... ";
        }


    }


    for(
        let i = batDau;
        i <= ketThuc;
        i++
    ){


        html +=


        `
        <button
        class="nut"
        onclick="doiTrang(${i})"
        style="${
            i === trangHienTai
            ?
            'background:#b06b2c;'
            :
            ''
        }"
        >
        ${i}
        </button>
        `;


    }


    if(ketThuc < tongTrang){


        if(
            ketThuc
            <
            tongTrang - 1
        ){
            html += " ... ";
        }


        html +=


        `
        <button
        class="nut"
        onclick="doiTrang(${tongTrang})"
        >
        ${tongTrang}
        </button>
        `;


    }


    if(
        trangHienTai
        <
        tongTrang
    ){


        html +=


        `
        <button
        class="nut"
        onclick="doiTrang(${trangHienTai + 1})"
        >
        →
        </button>
        `;


    }


    byId(
        "phan-trang"
    ).innerHTML = html;


}




function doiTrang(trang){


    trangHienTai = trang;


    hienThi(
        duLieuHienTai
    );


    window.scrollTo({
        top:300,
        behavior:"smooth"
    });


}




/* ==================================================
TÌM KIẾM
================================================== */


function timKiem(){


    trangHienTai = 1;


    let key =
        byId(
            "search"
        )
        .value
        .toLowerCase()
        .trim();


    let sl =
        byId(
            "locSoLuong"
        ).value;


    let cd =
        byId(
            "locChuDe"
        ).value;


    let diem =
        byId(
            "locDiem"
        ).value;


    let ketQua =
        duLieuDuocMo.filter(item=>{


            let text =
                item.noiDung
                +
                " "
                +
                item.nguoiViet
                +
                " "
                +
                item.tacGia
                +
                " "
                +
                item.moTa
                +
                " "
                +
                item.chuDe;


            let dungTim =
                key === ""
                ||
                text
                .toLowerCase()
                .includes(key);


            let dungSL =
                sl === ""
                ||
                item.soLuong === sl;


            let dungCD =
                cd === ""
                ||
                item.chuDe === cd;


            let dungDiem =
                diem === ""
                ||
                Number(
                    item.diemMoKhoa || 0
                )
                ===
                Number(diem);


            return (
                dungTim
                &&
                dungSL
                &&
                dungCD
                &&
                dungDiem
            );


        });


    hienThi(
        ketQua
    );


}




/* ==================================================
XÓA TÌM KIẾM
================================================== */


function xoaTimKiem(){


    byId(
        "search"
    ).value = "";


    byId(
        "locSoLuong"
    ).value = "";


    byId(
        "locChuDe"
    ).value = "";


    byId(
        "locDiem"
    ).value = "";


    trangHienTai = 1;


    hienThi(
        duLieuDuocMo
    );


}




/* ==================================================
LỌC
================================================== */


function locDuLieu(){
    timKiem();
}




/* ==================================================
MỞ CHI TIẾT
================================================== */


function moLamMo(id){


    let item =
        duLieuDuocMo.find(
            x => x.id === id
        );


    if(!item){


        alert(
            "Bài lâm mô này chưa được mở khóa."
        );


        return;
    }


    dangXem = item;


    /*
    Ngay khi mở bài:
    viewing_content = true.
    */


    dongBoMinhHongContext();


    byId(
        "thu-vien"
    ).style.display = "none";


    byId(
        "chi-tiet"
    ).style.display = "block";


    byId(
        "ten-noi-dung"
    ).textContent = item.noiDung;


    let anhChinh =
        byId(
            "anh-chinh"
        );


    anhChinh.setAttribute(
        "data-thu-anh",
        "0"
    );


    anhChinh.onerror = function(){


        xuLyLoiAnh(
            this,
            item.hinhAnh
        );


    };


    anhChinh.src =
        anhDrive(
            item.hinhAnh
        );


    byId(
        "ct-nguoi"
    ).textContent =
        item.nguoiViet;


    byId(
        "ct-noi-dung"
    ).textContent =
        item.noiDung;


    byId(
        "ct-so-luong"
    ).textContent =
        item.soLuong;


    byId(
        "ct-tac-gia"
    ).textContent =
        item.tacGia;


    byId(
        "ct-mo-ta"
    ).textContent =
        item.moTa;


    byId(
        "ct-chu-de"
    ).textContent =
        item.chuDe;


    hienThiVideo(
        item.video
    );
    loadContributionVideos(item.id,++contributionRequestToken);
    loadShowcaseGallery();


    hienThiCungNoiDung(
        item.noiDung
    );


    hienThiCungChuDe(
        item.chuDe,
        item.noiDung
    );


    window.scrollTo({
        top:0,
        behavior:"smooth"
    });


}




/* ==================================================
VIDEO
================================================== */


function hienThiVideo(url){
    const id=youtubeIdForPlayer(url);
    byId('video').innerHTML='<h2>Video hướng dẫn viết</h2>'+
      (id?'<button class="nut" onclick="playTeacherVideo(\''+id+'\')">Xem video hướng dẫn của giáo viên</button><div class="lm-player" id="lm-teacher-player"></div>':'<p>Bài này chưa có video hướng dẫn của giáo viên.</p>')+
      '<p><button class="nut" onclick="openContributionForm()">Đóng góp video hướng dẫn</button></p>'+
      '<h3>Video hướng dẫn từ học viên</h3><p id="lm-video-status" role="status">Đang tải video đóng góp\u2026</p><div class="lm-video-cards" id="lm-video-cards"></div><div class="lm-player" id="lm-student-player"></div>';
}




/* ==================================================
CÁC BẢN LÂM KHÁC
================================================== */


function hienThiCungNoiDung(noiDung){
    const ds=duLieuDuocMo.filter(item=>item.noiDung===noiDung&&(!dangXem||item.id!==dangXem.id));
    renderSuggestionSlider('ds-dich-ban',ds,'nguoiViet');
}




/* ==================================================
GỢI Ý CÙNG CHỦ ĐỀ
================================================== */


function hienThiCungChuDe(chuDe,noiDung){
    const ds=duLieuDuocMo.filter(item=>item.chuDe===chuDe&&item.noiDung!==noiDung);
    renderSuggestionSlider('ds-chu-de',ds,'noiDung');
}




/* ==================================================
Ô MỄ
================================================== */


function batTatOMe(){


    hienOMe =
        !hienOMe;


    byId(
        "grid"
    ).style.display =
        hienOMe
        ?
        "block"
        :
        "none";


}




/* ==================================================
TẠO BẢN IN
================================================== */


function taoBanIn(){


    if(!dangXem){


        alert(
            "Chưa chọn bản lâm mô"
        );


        return;
    }


    let win =
        window.open("");


    if(!win){


        alert(
            "Trình duyệt đang chặn cửa sổ in."
        );


        return;
    }


    let linkAnh =
        anhDrive(
            dangXem.hinhAnh
        );


    win.document.write(


    `


    <html>


    <head>


    <meta charset="UTF-8">


    <title>
    ${escapeHTML(dangXem.noiDung)}
    </title>


    <style>


    body{
        text-align:center;
        font-family:KaiTi,Arial,sans-serif;
    }


    h1{
        font-size:40px;
    }


    img{
        max-width:90%;
        max-height:850px;
    }


    </style>


    </head>


    <body>


    <h1>
    ${escapeHTML(dangXem.noiDung)}
    </h1>


    <img
    src="${escapeHTML(linkAnh)}"
    >


    <script>


    window.onload=function(){


        setTimeout(function(){


            window.print();


        },500);


    };


    <\/script>


    </body>


    </html>


    `);


    win.document.close();


}




/* ==================================================
GỬI BÀI TẬP
================================================== */


function guiBaiTap(){


    window.open(
        "https://docs.google.com/forms/d/e/1FAIpQLScfsWRNbv1h3XdJq1K_llPnkmmWOll480qRB5e8aWgvJj5eUw/viewform",
        "_blank"
    );


}




/* ==================================================
QUAY LẠI
================================================== */


function quayLai(){


    showcaseToken++;if(cancelShowcaseLoad)cancelShowcaseLoad();closeShowcaseDialog(false);byId('lm-show-image').close();
    contributionRequestToken++;
    if(cancelContributionRequest){cancelContributionRequest();cancelContributionRequest=null;}
    closeContributionForm();
    byId('video').innerHTML='';


    /*
    Không còn xem một bài cụ thể.
    */


    dangXem = null;


    /*
    viewing_content trở về false.
    */


    dongBoMinhHongContext();


    byId(
        "chi-tiet"
    ).style.display = "none";


    byId(
        "thu-vien"
    ).style.display = "block";


    window.scrollTo({
        top:0,
        behavior:"smooth"
    });


}




/* ==================================================
PUBLIC FUNCTIONS
================================================== */


function renderSuggestionSlider(containerId,items,label){
    const track=byId(containerId);if(!track)return;
    track.parentElement.hidden=items.length===0;
    track.innerHTML=items.map(item=>'<button type="button" class="dich-ban-item" data-lammo-id="'+escapeHTML(item.id)+'" aria-label="Xem '+escapeHTML(item[label]||item.noiDung)+'"><img src="'+escapeHTML(anhDrive(item.hinhAnh))+'" alt="'+escapeHTML(item.noiDung)+'" loading="lazy" data-thu-anh="0" data-original-image="'+escapeHTML(item.hinhAnh)+'"><p>'+escapeHTML(item[label])+'</p></button>').join('');
    track.scrollLeft=0;
    track.onclick=e=>{const button=e.target.closest('[data-lammo-id]');if(button&&track.contains(button))moLamMo(button.dataset.lammoId);};
    track.querySelectorAll&&track.querySelectorAll('img').forEach(img=>{img.onerror=()=>xuLyLoiAnh(img,img.dataset.originalImage);img.onload=()=>updateSliderControls(containerId);});
    requestAnimationFrame(()=>updateSliderControls(containerId));
}
function updateSliderControls(id){
    const t=byId(id),prev=byId(id+'-prev'),next=byId(id+'-next');if(!t||!prev||!next)return;
    const overflow=t.scrollWidth>t.clientWidth+2;prev.hidden=next.hidden=!overflow;
    prev.disabled=t.scrollLeft<=2;next.disabled=t.scrollLeft+t.clientWidth>=t.scrollWidth-2;
}
function moveSlider(id,direction){
    const t=byId(id);if(t)t.scrollBy({left:direction*Math.max(140,t.clientWidth*.8),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
}
function youtubeIdForPlayer(input){
    try{const u=new URL(String(input||''));if(u.protocol!=='https:')return '';let id='';
    if(['youtu.be','www.youtu.be'].includes(u.hostname))id=u.pathname.slice(1).replace(/\/$/,'');
    else if(['youtube.com','www.youtube.com','m.youtube.com'].includes(u.hostname)){if(u.pathname==='/watch')id=u.searchParams.get('v')||'';else id=(u.pathname.match(/^\/(?:shorts|embed)\/([A-Za-z0-9_-]{11})\/?$/)||[])[1]||'';}
    return /^[A-Za-z0-9_-]{11}$/.test(id)?id:'';}catch(e){return '';}
}
function playTeacherVideo(id){
    if(!/^[A-Za-z0-9_-]{11}$/.test(id))return;
    const other=byId('lm-student-player');if(other)other.innerHTML='';
    byId('lm-teacher-player').innerHTML='<iframe src="https://www.youtube.com/embed/'+id+'" title="Video của giáo viên" allow="fullscreen; picture-in-picture" allowfullscreen></iframe>';
}
function contributionEndpoint(){
    const url=String(VIDEO_CONTRIBUTION_APP_URL||'').trim();return /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url)?url:'';
}
function nativeFormRpc(method,payload){
    if(!['submitVideo','submitShowcase','getShowcaseChoices'].includes(method))return Promise.reject(Error('Thao tác không hợp lệ.'));
    const endpoint=contributionEndpoint();if(!endpoint)return Promise.reject(Error('Chưa kết nối Apps Script.'));
    return new Promise((resolve,reject)=>{
        const nonce=Array.from(crypto.getRandomValues(new Uint32Array(4))).join('_'),frame=document.createElement('iframe');let child=null,sent=false,timer;
        const cleanup=()=>{clearTimeout(timer);window.removeEventListener('message',receive);frame.remove();};
        const receive=e=>{if(!/^https:\/\/(?:script|[a-z0-9-]+-script)\.googleusercontent\.com$/.test(e.origin)||!e.data||e.data.nonce!==nonce)return;
            if(e.data.type==='LM_RPC_READY'&&!sent){sent=true;child=e.source;child.postMessage({type:'LM_RPC_CALL',nonce,method,payload},e.origin);}
            else if(e.data.type==='LM_RPC_RESULT'&&child&&e.source===child){cleanup();if(e.data.ok)resolve(e.data.result);else reject(Error(e.data.message||'Apps Script xử lý thất bại.'));}
        };
        window.addEventListener('message',receive);timer=setTimeout(()=>{cleanup();reject(Error('Chưa nhận được kết quả. Nếu vừa gửi bài/video, hãy kiểm tra danh sách trước khi gửi lại. Kiểm tra phiên bản Apps Script có Bridge.html và đã triển khai mới.'));},45000);
        frame.title='Kết nối dữ liệu';frame.setAttribute('aria-hidden','true');frame.style.cssText='position:fixed;left:-10000px;top:0;width:1px;height:1px;border:0;pointer-events:none';
        const url=new URL(endpoint);url.searchParams.set('action','bridge');url.searchParams.set('nonce',nonce);url.searchParams.set('parentOrigin',location.origin);frame.src=url.href;document.body.appendChild(frame);
    });
}
let nativeVideoContext=null;
function openContributionForm(item){
    item=item||dangXem;if(!item||!/^LM_[A-Za-z0-9_-]+$/.test(item.id)){alert('Bài này chưa có mã cố định.');return;}
    if(!contributionEndpoint()){alert('Chưa kết nối Apps Script.');return;}
    nativeVideoContext={lessonId:item.id,requestId:'REQ_'+Array.from(crypto.getRandomValues(new Uint32Array(4))).join('_'),busy:false,done:false};
    byId('lm-video-native-form').reset();byId('lm-native-video-code').value=showcaseActor();byId('lm-native-video-lesson').textContent='Bản mẫu: '+item.noiDung;byId('lm-native-video-status').textContent='';byId('lm-native-video-send').disabled=false;
    const dialog=byId('lm-contribution-dialog');dialog.querySelector('.lm-modal-body').scrollTop=0;if(!dialog.open)dialog.showModal();
}
function closeContributionForm(){const d=byId('lm-contribution-dialog');if(d&&d.open)d.close();nativeVideoContext=null;}
// Listen on document: Blogger's keyword linker recreates all post elements.
document.addEventListener('submit',async e=>{
    if(e.target.id!=='lm-video-native-form')return;
    e.preventDefault();const ctx=nativeVideoContext;if(!ctx||ctx.busy||ctx.done)return;ctx.busy=true;byId('lm-native-video-send').disabled=true;byId('lm-native-video-status').textContent='Đang gửi video\u2026';
    try{const r=await nativeFormRpc('submitVideo',{lessonId:ctx.lessonId,studentCode:byId('lm-native-video-code').value,url:byId('lm-native-video-url').value,title:byId('lm-native-video-title').value,description:byId('lm-native-video-description').value,ownsVideo:byId('lm-native-video-owns').checked,requestId:ctx.requestId});ctx.done=true;if(ctx===nativeVideoContext)byId('lm-native-video-status').textContent=r.message||'Đã gửi video để duyệt.';}
    catch(err){if(ctx===nativeVideoContext){byId('lm-native-video-status').textContent=err.message;byId('lm-native-video-send').disabled=false;}}finally{ctx.busy=false;}
});
function loadContributionVideos(lessonId,token){
    if(cancelContributionRequest){cancelContributionRequest();cancelContributionRequest=null;}closeContributionForm();contributionVideos=[];
    const endpoint=contributionEndpoint();if(!endpoint){byId('lm-video-status').textContent='Chưa kết nối hệ thống đóng góp video.';return;}
    if(!/^LM_[A-Za-z0-9_-]+$/.test(lessonId)){byId('lm-video-status').textContent='Bài chưa có mã cố định.';return;}
    const callback='LMVideo_'+token+'_'+Math.random().toString(36).slice(2),script=document.createElement('script');let timer,cleaned=false;
    const cleanup=()=>{if(cleaned)return;cleaned=true;clearTimeout(timer);script.remove();delete window[callback];};cancelContributionRequest=cleanup;
    window[callback]=result=>{cleanup();applyContributionResult(lessonId,token,result);};
    script.onerror=()=>{cleanup();applyContributionResult(lessonId,token,{ok:false});};
    timer=setTimeout(()=>{cleanup();applyContributionResult(lessonId,token,{ok:false});},30000);
    script.src=endpoint+'?action=list&lessonId='+encodeURIComponent(lessonId)+'&callback='+callback;document.head.appendChild(script);
}
function applyContributionResult(lessonId,token,result){
    if(!dangXem||dangXem.id!==lessonId||token!==contributionRequestToken)return;
    if(!result||!result.ok){byId('lm-video-status').innerHTML='Kết nối video học viên phản hồi chậm. <button type="button" class="nut" onclick="loadContributionVideos(dangXem.id,contributionRequestToken)">Thử lại</button>';return;}
    renderContributionCards(Array.isArray(result.videos)?result.videos:[]);
}
function renderContributionCards(videos){
    contributionVideos=videos.slice(0,100);
    byId('lm-video-status').textContent=contributionVideos.length?'Các video đã được giáo viên chấp thuận.':'Chưa có video đóng góp được chấp thuận.';
    byId('lm-video-cards').innerHTML=contributionVideos.map((v,i)=>'<article class="lm-video-card">'+(v.provider==='youtube'&&/^[A-Za-z0-9_-]{11}$/.test(v.videoKey)?'<img src="https://i.ytimg.com/vi/'+v.videoKey+'/hqdefault.jpg" alt="" loading="lazy">':'<div class="lm-video-placeholder">'+(v.provider==='drive'?'Video Google Drive':'Video Facebook')+'</div>')+'<h4>'+escapeHTML(v.title)+'</h4><p>Đóng góp: '+escapeHTML(v.displayName)+'</p><button class="nut" onclick="playApprovedVideo('+i+')">Xem video</button></article>').join('');
}
function drivePreviewForPlayer(video){
    try{const u=new URL(String(video.canonicalUrl||''));const m=u.pathname.match(/^\/file\/d\/([A-Za-z0-9_-]{10,})\/view$/);
        if(u.protocol!=='https:'||u.hostname!=='drive.google.com'||!m||m[1]!==video.videoKey)return '';
        const resourceKey=u.searchParams.get('resourcekey');if(resourceKey&&!/^[A-Za-z0-9_-]{1,200}$/.test(resourceKey))return '';
        return 'https://drive.google.com/file/d/'+m[1]+'/preview'+(resourceKey?'?resourcekey='+encodeURIComponent(resourceKey):'');
    }catch(e){return '';}
}
function playApprovedVideo(index){
    if(!Number.isInteger(index)||index<0||index>=contributionVideos.length)return;
    const video=contributionVideos[index];
    if(!video)return;let src='';
    if(video.provider==='youtube'&&/^[A-Za-z0-9_-]{11}$/.test(video.videoKey)&&youtubeIdForPlayer(video.canonicalUrl)===video.videoKey)src='https://www.youtube.com/embed/'+video.videoKey;
    if(video.provider==='facebook'&&/^\d{5,30}$/.test(video.videoKey)){
      const allowed=['https://www.facebook.com/watch/?v='+video.videoKey,'https://www.facebook.com/reel/'+video.videoKey+'/'];
      if(allowed.includes(video.canonicalUrl))src='https://www.facebook.com/plugins/video.php?href='+encodeURIComponent(video.canonicalUrl)+'&show_text=false&width=560';
    }
    if(video.provider==='drive')src=drivePreviewForPlayer(video);
    if(!src){alert('Link video không hợp lệ.');return;}
    const other=byId('lm-teacher-player');if(other)other.innerHTML='';
    byId('lm-student-player').innerHTML='<iframe src="'+escapeHTML(src)+'" title="'+escapeHTML(video.title)+'" allow="fullscreen; picture-in-picture" allowfullscreen></iframe><a href="'+escapeHTML(video.canonicalUrl)+'" target="_blank" rel="noopener noreferrer">Mở video gốc nếu không phát được</a>';
}
window.addEventListener('resize',()=>{updateSliderControls('ds-dich-ban');updateSliderControls('ds-chu-de');updateSliderControls('lm-show-track');});
['updateSliderControls','moveSlider','playTeacherVideo','openContributionForm','closeContributionForm','playApprovedVideo','loadContributionVideos'].forEach(name=>{window[name]=({updateSliderControls,moveSlider,playTeacherVideo,openContributionForm,closeContributionForm,playApprovedVideo,loadContributionVideos})[name];});
// Inline handler chỉ nhận chỉ số, không nhận mã HTML từ API.
document.addEventListener('close',e=>{if(e.target.id==='lm-contribution-dialog'&&!e.target.open)nativeVideoContext=null;},true);


/* Khoe bản lâm: đọc công khai, ghi qua HTML Service; không ghi thưởng. */
let showcasePosts=[],showcaseToken=0,cancelShowcaseLoad=null;
const showcaseProfileCache=new Map();
function showcaseActor(){return chuanHoaMa((hocVienDangNhap&&hocVienDangNhap.ma)||layMaDaXacMinhTuMinhHong()||'');}
function loadShowcaseGallery(){
    if(!dangXem)return;const lessonId=dangXem.id,token=++showcaseToken;showcasePosts=[];byId('lm-show-posts').innerHTML='';
    if(cancelShowcaseLoad){cancelShowcaseLoad();cancelShowcaseLoad=null;}closeShowcaseDialog(false);byId('lm-show-image').close();
    const track=byId('lm-show-track');track.scrollLeft=0;requestAnimationFrame(()=>updateSliderControls('lm-show-track'));
    const endpoint=contributionEndpoint(),status=byId('lm-show-status');status.textContent='';status.hidden=true;if(!endpoint)return;
    const cb='LMVideo_SHOW_'+token+'_'+Math.random().toString(36).slice(2),script=document.createElement('script');let timer,done=false;
    const cleanup=()=>{if(done)return;done=true;clearTimeout(timer);script.remove();delete window[cb];};cancelShowcaseLoad=cleanup;
    const receive=result=>{cleanup();if(!dangXem||dangXem.id!==lessonId||token!==showcaseToken)return;if(!result||!result.ok){status.textContent='Chưa tải được bản lâm học viên.';status.hidden=false;return;}renderShowcasePosts(Array.isArray(result.posts)?result.posts:[],token);};
    window[cb]=receive;script.onerror=()=>receive({ok:false});timer=setTimeout(()=>receive({ok:false}),15000);script.src=endpoint+'?action=showcaseList&lessonId='+encodeURIComponent(lessonId)+'&code='+encodeURIComponent(showcaseActor())+'&callback='+cb;document.head.appendChild(script);
}
function renderShowcasePosts(posts,token){
    showcasePosts=posts.slice(0,100).sort((a,b)=>Number(b.hearts)-Number(a.hearts)||(Date.parse(b.date)||0)-(Date.parse(a.date)||0)||String(a.id).localeCompare(String(b.id)));
    byId('lm-show-status').textContent='';byId('lm-show-status').hidden=true;
    byId('lm-show-posts').innerHTML=showcasePosts.map((p,i)=>'<article class="lm-show-card"><button class="lm-show-photo" onclick="openShowcaseImage('+i+')" aria-label="Xem ảnh bản lâm"><img src="https://drive.google.com/thumbnail?id='+encodeURIComponent(p.photoId)+'&sz=w320" alt="Bản lâm của '+escapeHTML(p.name)+'" loading="'+(i<3?'eager':'lazy')+'" decoding="async" onerror="this.style.display=\'none\';this.parentElement.classList.add(\'lm-photo-error\')"></button><button class="lm-show-heart'+(p.liked?' is-liked':'')+'" onclick="toggleShowcaseHeart('+i+',this)" aria-label="Thả hoặc bỏ tim" aria-pressed="'+!!p.liked+'"><span>'+(p.liked?'\u2665':'\u2661')+'</span> '+Math.max(0,Number(p.hearts)||0)+'</button><div class="lm-show-owner" data-show-index="'+i+'"><div class="lm-show-avatar"><span class="lm-show-avatar-core">\u270d</span></div><div><b title="'+escapeHTML(p.name)+'">'+escapeHTML(p.name)+'</b><small>Tổ '+escapeHTML(p.group||'—')+' \u00B7 Khóa '+escapeHTML(p.course||'—')+'</small></div></div></article>').join('');
    requestAnimationFrame(()=>updateSliderControls('lm-show-track'));
    const cards=byId('lm-show-posts').querySelectorAll('.lm-show-owner');
    if(window.IntersectionObserver){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){observer.unobserve(e.target);hydrateShowcaseProfile(e.target,showcasePosts[Number(e.target.dataset.showIndex)],token);}}));cards.forEach(c=>observer.observe(c));}else cards.forEach(c=>hydrateShowcaseProfile(c,showcasePosts[Number(c.dataset.showIndex)],token));
}
function safeShowcaseImage(url){try{const u=new URL(String(url||''));return u.protocol==='https:'?u.href:'';}catch(e){return '';}}
async function hydrateShowcaseProfile(node,post,token){
    /* Thẻ học viên dùng chung (avatar, khung, nền hồ sơ, hiệu ứng thuốc đa nhiệm chuẩn) – ocd-shared/ocd-identity.js */
    if(post&&window.OCDIdentity){
        if(token!==showcaseToken||!node.isConnected)return;
        node.innerHTML='';
        node.classList.add('lm-show-owner-shared');
        node.appendChild(window.OCDIdentity.create({code:post.studentCode,name:post.name,meta:'Tổ '+(post.group||'—')+' · Khóa '+(post.course||'—'),size:'sm',background:node}));
        return;
    }
    const core=window.StudentRewardSystem;if(!post||!core||typeof core.getStudentRewardProfile!=='function')return;
    try{let promise=showcaseProfileCache.get(post.studentCode);if(!promise){promise=core.getStudentRewardProfile(post.studentCode);showcaseProfileCache.set(post.studentCode,promise);}const profile=await promise;if(token!==showcaseToken||!node.isConnected)return;const box=node.querySelector('.lm-show-avatar'),avatar=safeShowcaseImage(profile.avatar),frame=safeShowcaseImage(profile.avatarFrame),bg=safeShowcaseImage(profile.profileBackground);box.innerHTML='<span class="lm-show-avatar-core">'+(avatar?'<img src="'+escapeHTML(avatar)+'" alt="Avatar học viên" loading="lazy" onerror="this.parentNode.textContent=\'\u270d\'">':'\u270d')+'</span>'+(frame?'<img class="lm-show-frame" src="'+escapeHTML(frame)+'" alt="Khung avatar" loading="lazy" onerror="this.remove()">':'');if(bg)node.style.backgroundImage='linear-gradient(90deg,rgba(255,253,248,.88),rgba(255,253,248,.88)),url("'+bg.replace(/["\\]/g,'')+'")';if(profile.hasMultitaskPotion){const badge=document.createElement('span');badge.className='lm-show-potion';badge.textContent='\u2697';badge.title='Đang có Thuốc đa nhiệm';box.appendChild(badge);}}
    catch(e){showcaseProfileCache.delete(post.studentCode);console.warn('[Bản lâm] Không tải được avatar',e);}
}
let nativeShowContext=null;
const nativeChoicesCache=new Map();
function readNativeShowChoices(code,lessonId){
    return new Promise((resolve,reject)=>{
        const cb='LMVideo_CHOICES_'+Math.random().toString(36).slice(2),script=document.createElement('script');let timer,done=false;
        const cleanup=()=>{if(done)return;done=true;clearTimeout(timer);script.remove();delete window[cb];};
        window[cb]=r=>{cleanup();r&&r.ok&&r.student&&Array.isArray(r.works)?resolve(r):reject(Error(r&&r.message||'Không tải được bài đã nộp.'))};
        script.onerror=()=>{cleanup();reject(Error('Mất kết nối. Hãy thử lại.'));};timer=setTimeout(()=>{cleanup();reject(Error('Danh sách bài nộp phản hồi chậm. Hãy thử lại; kiểm tra Apps Script đã triển khai phiên bản mới.'));},30000);
        script.src=contributionEndpoint()+'?action=showcaseChoices&code='+encodeURIComponent(code)+'&lessonId='+encodeURIComponent(lessonId)+'&callback='+cb;document.head.appendChild(script);
    });
}
function getNativeShowChoices(code,lessonId){
    const key=code+'|'+lessonId,old=nativeChoicesCache.get(key);if(old&&(old.pending||old.until>Date.now()))return old.promise;
    const entry={pending:true,until:0,promise:null};
    entry.promise=readNativeShowChoices(code,lessonId).then(r=>{entry.pending=false;entry.until=Date.now()+20000;return r;},err=>{if(nativeChoicesCache.get(key)===entry)nativeChoicesCache.delete(key);throw err;});
    if(nativeChoicesCache.size>=12)nativeChoicesCache.delete(nativeChoicesCache.keys().next().value);nativeChoicesCache.set(key,entry);return entry.promise;
}
async function loadNativeShowChoices(ctx){
    byId('lm-native-show-status').textContent='Đang tải bài đã nộp của bạn\u2026';byId('lm-native-works').innerHTML='';byId('lm-native-show-send').hidden=true;byId('lm-native-show-retry').hidden=true;
    try{const r=await getNativeShowChoices(ctx.code,ctx.lessonId);if(ctx!==nativeShowContext)return;
        byId('lm-native-show-identity').textContent=r.student.name+' \u00B7 Tổ '+r.student.group+' \u00B7 Khóa '+r.student.course;
        byId('lm-native-show-status').textContent=r.works.length?'Chọn bản lâm phù hợp với mẫu đang xem.':'Chưa có bài nộp hợp lệ để chọn.';
        byId('lm-native-works').innerHTML=r.works.map((w,i)=>'<label class="lm-native-work"><input type="radio" name="lm-native-work" value="'+escapeHTML(w.key)+'"><img src="https://drive.google.com/thumbnail?id='+encodeURIComponent(w.photoId)+'&sz=w240" loading="'+(i<4?'eager':'lazy')+'" decoding="async" alt="Bài đã nộp"><small>'+escapeHTML(w.description||'Bài chưa có mô tả')+'</small><small>'+escapeHTML(w.date)+'</small></label>').join('');byId('lm-native-show-send').hidden=!r.works.length;byId('lm-native-show-send').disabled=false;
    }catch(err){if(ctx===nativeShowContext){byId('lm-native-show-status').textContent=err.message;byId('lm-native-show-retry').hidden=false;}}
}
function openShowcaseForm(){
    if(!dangXem)return;const code=showcaseActor();if(!code){alert('Hãy đăng nhập trên trang thư viện trước khi khoe bài.');return;}
    const ctx={code,lessonId:dangXem.id,busy:false,done:false};nativeShowContext=ctx;setShowcaseSubmitState('idle','');byId('lm-native-show-lesson').textContent='Bản mẫu: '+dangXem.noiDung;byId('lm-native-show-identity').textContent='';
    const d=byId('lm-show-dialog');d.querySelector('.lm-modal-body').scrollTop=0;if(!d.open)d.showModal();loadNativeShowChoices(ctx);
}
function closeShowcaseDialog(refresh=true){const d=byId('lm-show-dialog');if(d.open)d.close();nativeShowContext=null;if(refresh&&dangXem)loadShowcaseGallery();}


function setShowcaseSubmitState(state,message){
    const b=byId('lm-native-show-send');b.hidden=false;b.disabled=state!=='idle';b.dataset&&(b.dataset.state=state);b.setAttribute?.('aria-busy',String(state==='busy'));
    const hourglass='<svg class="lm-submit-icon lm-submit-hourglass" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 3h12M6 21h12M7 3v5l5 4-5 4v5M17 3v5l-5 4 5 4v5"/></svg>';
    const check='<svg class="lm-submit-icon lm-submit-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m7 12 3 3 7-7"/></svg>';
    b.innerHTML=state==='busy'?hourglass+'<span>Đang cập nhật</span>':state==='done'?check+'<span>Đã đưa lên hệ thống</span>':'Khoe bản lâm';
    byId('lm-native-show-status').textContent=message||'';
}
async function submitNativeShowcase(){
    const ctx=nativeShowContext;if(!ctx){setShowcaseSubmitState('idle','Phiên chọn bài không còn sẵn sàng. Hãy đóng và mở lại Khoe bản lâm.');return;}if(ctx.busy||ctx.done)return;
    const selected=byId('lm-native-works').querySelector('input:checked');if(!selected){setShowcaseSubmitState('idle','Bạn chưa chọn bài.');return;}
    ctx.busy=true;setShowcaseSubmitState('busy','Đang gửi bản lâm đã chọn. Vui lòng chờ hệ thống xác nhận.');
    try{const r=await nativeFormRpc('submitShowcase',{studentCode:ctx.code,lessonId:ctx.lessonId,workKey:selected.value});if(!r||r.ok!==true||!r.id)throw Error(r&&r.message||'Hệ thống chưa xác nhận đã lưu bản lâm.');ctx.done=true;if(ctx===nativeShowContext)setShowcaseSubmitState('done',r.message||'Bản lâm đã lưu. Bấm Đóng và cập nhật danh sách để xem.');}
    catch(err){if(ctx===nativeShowContext)setShowcaseSubmitState('idle',err.message||'Không gửi được bản lâm. Hãy thử lại.');}
    finally{ctx.busy=false;}
}
/* BEGIN durable showcase events */
// Blogger highlightSearchTerms rewrites the post's innerHTML after this script.
// Delegate to document so replacement controls retain their behavior.
document.addEventListener('change',e=>{
    if(!e.target.closest?.('#lm-native-works input[name="lm-native-work"]'))return;
    const ctx=nativeShowContext;if(ctx&&!ctx.busy&&!ctx.done)setShowcaseSubmitState('idle','Đã chọn ảnh. Bấm Khoe bản lâm ở phía trên.');
});
document.addEventListener('click',e=>{
    const button=e.target.closest?.('#lm-native-show-send, #lm-native-show-retry');
    if(!button||button.disabled)return;
    e.preventDefault();
    if(button.id==='lm-native-show-send')submitNativeShowcase();
    else if(nativeShowContext&&!nativeShowContext.busy)loadNativeShowChoices(nativeShowContext);
});
/* END durable showcase events */




function openShowcaseImage(index){if(!Number.isInteger(index)||!showcasePosts[index])return;const p=showcasePosts[index],url='https://drive.google.com/thumbnail?id='+encodeURIComponent(p.photoId)+'&sz=w1600',d=byId('lm-show-image');byId('lm-show-image-src').src=url;if(d.showModal)d.showModal();else window.open(url,'_blank','noopener');}
// close does not bubble; capture it on document, including recreated dialogs.
document.addEventListener('close',e=>{
    if(e.target.open)return;
    if(e.target.id==='lm-show-dialog')nativeShowContext=null;
    if(e.target.id==='lm-show-image')byId('lm-show-image-src').removeAttribute('src');
},true);


const showcaseHeartPending=new Set();
function readShowcaseHeartState(lessonId,code,postId){
    return new Promise((resolve,reject)=>{const cb='LMVideo_HEART_'+Math.random().toString(36).slice(2),s=document.createElement('script');let timer;const cleanup=()=>{clearTimeout(timer);s.remove();delete window[cb];};window[cb]=r=>{cleanup();r&&r.ok?resolve(r):reject(Error(r&&r.message||'Không đọc được trạng thái tim.'));};s.onerror=()=>{cleanup();reject(Error('Mất kết nối Apps Script.'));};timer=setTimeout(()=>{cleanup();reject(Error('Apps Script phản hồi chậm.'));},8000);s.src=contributionEndpoint()+'?action=heartState&lessonId='+encodeURIComponent(lessonId)+'&code='+encodeURIComponent(code)+'&postId='+encodeURIComponent(postId)+'&callback='+cb;document.head.appendChild(s);});
}
async function toggleShowcaseHeart(index,button){
    const post=showcasePosts[index],code=showcaseActor(),endpoint=contributionEndpoint();if(!post||!dangXem||showcaseHeartPending.has(post.id))return;if(!code||!endpoint){alert('Phiên học viên hoặc kết nối Apps Script chưa sẵn sàng.');return;}if(chuanHoaMa(post.studentCode)===code){alert('Không thể thả tim bản lâm của chính mình.');return;}
    const lessonId=dangXem.id,token=showcaseToken,active=!post.liked,oldCount=Number(post.hearts)||0;showcaseHeartPending.add(post.id);button.disabled=true;button.classList.toggle('is-liked',active);button.setAttribute('aria-pressed',String(active));button.innerHTML='<span>'+(active?'\u2665':'\u2661')+'</span> '+Math.max(0,oldCount+(active?1:-1));
    const frame=document.createElement('iframe'),form=document.createElement('form');frame.name='lmHeart_'+Math.random().toString(36).slice(2);frame.hidden=true;frame.title='Đồng bộ tim';form.hidden=true;form.method='POST';form.action=endpoint;form.target=frame.name;
    const fields={action:'heart',studentCode:code,lessonId:lessonId,postId:post.id,active:String(active)};Object.keys(fields).forEach(k=>{const input=document.createElement('input');input.type='hidden';input.name=k;input.value=fields[k];form.appendChild(input);});document.body.appendChild(frame);document.body.appendChild(form);
    try{form.submit();let confirmed=null,lastError='';for(let attempt=0;attempt<8;attempt++){await new Promise(resolve=>setTimeout(resolve,1500));try{const state=await readShowcaseHeartState(lessonId,code,post.id);if(state.active===active){confirmed=state;break;}}catch(e){lastError=e.message;}}
      if(!confirmed)throw Error(lastError||'Chưa xác nhận được tim. Hãy tải lại bản mẫu để kiểm tra.');post.liked=confirmed.active;post.hearts=confirmed.hearts;if(dangXem&&dangXem.id===lessonId&&token===showcaseToken)renderShowcasePosts(showcasePosts,token);
    }catch(e){button.classList.toggle('is-liked',!!post.liked);button.setAttribute('aria-pressed',String(!!post.liked));button.innerHTML='<span>'+(post.liked?'\u2665':'\u2661')+'</span> '+oldCount;const status=byId('lm-show-status');if(token===showcaseToken){status.textContent=e.message;status.hidden=false;}}
    finally{showcaseHeartPending.delete(post.id);button.disabled=false;form.remove();frame.remove();}
}
[loadShowcaseGallery,openShowcaseForm,closeShowcaseDialog,openShowcaseImage,toggleShowcaseHeart].forEach(fn=>window[fn.name]=fn);


window.kiemTraHocVien =
    kiemTraHocVien;


window.xoaMaHocVien =
    xoaMaHocVien;


window.timKiem =
    timKiem;


window.xoaTimKiem =
    xoaTimKiem;


window.locDuLieu =
    locDuLieu;


window.doiTrang =
    doiTrang;


window.moLamMo =
    moLamMo;


window.xuLyLoiAnh =
    xuLyLoiAnh;


window.batTatOMe =
    batTatOMe;


window.taoBanIn =
    taoBanIn;


window.guiBaiTap =
    guiBaiTap;


window.quayLai =
    quayLai;




/* ==================================================
API RIÊNG CHO TRANG LÂM MÔ
================================================== */


window.OCDLamMoLibrary = {


    getStudent:function(){


        return hocVienDangNhap
        ?
        Object.assign(
            {},
            hocVienDangNhap
        )
        :
        null;


    },


    getCode:function(){


        return hocVienDangNhap
        ?
        hocVienDangNhap.ma
        :
        "";


    },


    getExperience:function(){


        return Number(
            diemHocVien || 0
        );


    },


    getUnlockState:function(){


        return {


            totalCount:
                Number(
                    duLieu.length || 0
                ),


            unlockedCount:
                Number(
                    duLieuDuocMo.length || 0
                ),


            lockedCount:
                Math.max(
                    0,
                    Number(
                        duLieu.length || 0
                    )
                    -
                    Number(
                        duLieuDuocMo.length || 0
                    )
                )


        };


    },


    getCurrentContent:function(){


        return dangXem
        ?
        Object.assign(
            {},
            dangXem
        )
        :
        null;


    },


    getMinhHongContext:function(){


        let context =
            taoMinhHongContext();


        return context
        ?
        JSON.parse(
            JSON.stringify(context)
        )
        :
        null;


    },


    syncMinhHongContext:function(){


        return dongBoMinhHongContext();


    },


    syncFromMinhHong:function(){


        return apDungMaTuMinhHong();


    }


};




console.log(
    "[Thư viện lâm mô] Student Session + Minh Hồng Context Bridge ready."
);


})();


