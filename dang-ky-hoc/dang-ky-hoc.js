/* =========================================================
   TRANG ĐĂNG KÝ HỌC v1.1 – Thanh Phong Thư Môn (thay Google Form)
   v1.1: slide tứ tổ + chọn tổ, khung lộ trình 4 giai đoạn (khoá nội dung với người chưa đăng ký),
         tiến độ học viên, bài tập đẹp và lưu bút
   ---------------------------------------------------------
   - Phần trên: tài khoản (tạo tài khoản có xác minh email,
     đăng nhập, học viên cũ nâng cấp bảo mật) + thông tin cơ bản.
   - Phần dưới: danh sách khoá học; đăng ký ghi thẳng vào
     DanhSachHocVien (cột A..Q) qua Apps Script (action "enroll").
   - Cần Reward Core có OCDAuth >= 1.1 (đã gắn sẵn trong theme).
   - Có thể thay danh sách khoá bằng window.OCD_COURSES (cùng cấu trúc COURSES).
========================================================= */
(function(){
"use strict";
if(window.OCDRegisterPage) return;
window.OCDRegisterPage={version:"1.1.0"};
const SCRIPT_BASE=(function(){ try{ const src=document.currentScript&&document.currentScript.src||""; return src.slice(0,src.lastIndexOf("/")+1); }catch(e){ return ""; } })();

const ROOT_ID="ocdRegisterApp";
const BANK={bank:"MB Bank",bin:"MB",account:"0530113118888",holder:"BUI KHAC SANG",prefix:"HOCTHUPHAP"};
const CONTACT={phone:"0395 021 559",email:"vnthudao@gmail.com",address:"Kim Mã, Giảng Võ, Hà Nội"};
const LEARNED=["Tôi là người mới hoàn toàn","Tôi đã học thư pháp trước đó"];

const RULES=[
    {title:"1. Chuẩn bị & Nhập học",items:[
        "Kênh thông tin: Học viên vui lòng tham gia các nhóm Zalo/Facebook chính thức để nhận hỗ trợ và hoàn tất thủ tục đăng ký.",
        "Dụng cụ học tập: Chủ động chuẩn bị trọn bộ \"Văn phòng tứ bảo\" trước ngày khai giảng.",
        "Tôn trọng không gian chung: Học viên tự do lựa chọn nơi mua sắm dụng cụ. Nhóm lớp chỉ phục vụ mục đích học tập, tuyệt đối không thương mại hóa, quảng cáo hoặc môi giới bán hàng."]},
    {title:"2. Kỷ luật & Tự giác",intro:"Lớp học áp dụng hình thức tạm dừng quyền tham gia đối với các trường hợp:",items:[
        "Vắng mặt 03 buổi liên tiếp không có lý do.",
        "Không nộp bài tập về nhà 03 buổi liên tiếp.",
        "Nằm trong nhóm kết quả kém nhất ở 03 bài kiểm tra liên tiếp.",
        "Ngôn từ thiếu tôn trọng người khác hoặc vi phạm các quy định pháp luật, chính trị."]},
    {title:"3. Tôn trọng Tri thức & Thương hiệu",items:[
        "Bản quyền & Danh nghĩa: Nghiêm cấm việc tự ý sử dụng danh nghĩa \"Học trò Thanh Phong\" hoặc dùng kiến thức của môn phái để mở lớp, kinh doanh khi chưa có sự đồng ý chính thức từ Giảng viên.",
        "Thời gian rèn luyện: Khi chưa hoàn thành chương trình học, học viên không tự ý mở lớp dạy lại hoặc thu phí người khác."]},
    {title:"4. Tâm thế & Tinh thần học tập",items:[
        "Rèn tâm chớ tìm vui: Học thư pháp là quá trình rèn luyện tính kiên nhẫn và đón nhận góp ý thẳng thắn. Nếu chỉ tìm kiếm sự thư giãn đơn thuần hay có lòng tự tôn quá cao, lớp học có thể chưa phải là lựa chọn phù hợp nhất với bạn.",
        "Tương tác tích cực: Khuyến khích học viên thường xuyên trao đổi, bình luận xây dựng bài."]}
];

const COURSES=[
    {
        id:"OCD-52",
        name:"Khoá Thư pháp Việt căn bản Online (OCD) – 52 buổi",
        value:"Thư pháp Online 52 buổi cơ bản (OCD)",
        open:true,
        summary:"Chương trình đào tạo toàn diện 52 buổi học chuyên sâu – hành trình giúp bạn đi từ người mới bắt đầu đến khi làm chủ nét chữ.",
        meta:["Học Online","52 buổi","Giảng viên & trợ giảng chấm bài","Có chứng nhận hoàn thành"],
        stages:[
            {no:"Giai đoạn 1 · Buổi 1–12",title:"Nhập môn & Bút pháp căn bản",text:"Lịch sử và khái niệm thư pháp, văn phòng tứ bảo, cách cầm bút, chấm mực, luyện các nét cơ bản và viết những chữ đơn giản."},
            {no:"Giai đoạn 2 · Buổi 13–26",title:"Cấu trúc chữ & Cổ pháp",text:"Kỹ thuật dựng chữ Quốc ngữ cân đối, các lối nét cổ pháp, lý thuyết căn bản về thư pháp Việt và bài kiểm tra giữa khoá."},
            {no:"Giai đoạn 3 · Buổi 27–40",title:"Bố cục tác phẩm & Đại tự",text:"Bố cục hoành phi, câu đối, thư hoạ; kỹ thuật viết chữ lớn, chữ nhỏ và cách đóng triện đúng phép."},
            {no:"Giai đoạn 4 · Buổi 41–52",title:"Sáng tác & Tốt nghiệp",text:"Sáng tác tác phẩm cá nhân, Giảng viên nhận xét 1:1 chi tiết cho từng học viên, tốt nghiệp và nhận chứng nhận hoàn thành."}
        ],
        packages:[
            {value:"Gói Miễn phí (0Đ) - Tự chuẩn bị đồ dùng dụng cụ",name:"Gói Miễn phí",price:0,
             yes:["Vào lớp khi khoá mới khai giảng","Hướng dẫn lý thuyết và kỹ thuật cơ bản","Video bài giảng ghi lại"],
             no:["Tự chuẩn bị bút, mực, giấy, nghiên","Không kèm triện và tài liệu"]},
            {value:"Gói ủng hộ",name:"Gói Ủng hộ",price:800000,
             yes:["Toàn bộ quyền lợi Gói Miễn phí","Tài liệu ebook PDF độc quyền","Được xếp lớp sớm khi khoá mở","Xem lại kho video trọn đời"],
             no:["Tự chuẩn bị dụng cụ học tập"]},
            {value:"Gói phổ thông",name:"Gói Phổ thông",price:3500000,oldPrice:5000000,hot:true,
             yes:["Trọn khoá 52 buổi","Bộ dụng cụ cao cấp: bút, mực, giấy, nghiên","Sách \"Thư pháp Việt\" gửi tận nhà","01 triện tên khắc tay (tên thật hoặc bút hiệu)","Giảng viên và trợ giảng chấm bài trực tiếp"]},
            {value:"Gói VIP",name:"Gói VIP",price:9000000,oldPrice:12000000,
             yes:["Vào học ngay khoá đang diễn ra","Bộ dụng cụ cao cấp và giáo trình nâng cao","02 triện khắc tay đá tốt (triện tên và nhàn chương)","Giảng viên nhận xét 1:1 trực tiếp","Tham gia các buổi workshop riêng"]}
        ]
    }
];

/* ---------------- tiện ích ---------------- */
function $(id){ return document.getElementById(id); }
function h(tag,attrs,children){
    const e=document.createElement(tag);
    if(attrs) Object.keys(attrs).forEach(function(k){
        const v=attrs[k];
        if(v==null || v===false) return;
        if(k==="class") e.className=v;
        else if(k==="text") e.textContent=v;
        else if(k.indexOf("on")===0 && typeof v==="function") e.addEventListener(k.slice(2),v);
        else if(k in e && k!=="list") { try{ e[k]=v; }catch(x){ e.setAttribute(k,v); } }
        else e.setAttribute(k,v===true?"":v);
    });
    (Array.isArray(children)?children:children!=null?[children]:[]).forEach(function(c){
        if(c==null || c===false) return;
        e.appendChild(typeof c==="string"?document.createTextNode(c):c);
    });
    return e;
}
function money(n){ return n?Number(n).toLocaleString("vi-VN")+"đ":"0đ"; }
function clean(v){ return String(v==null?"":v).trim(); }
function normPhone(v){ let d=String(v||"").replace(/\D/g,""); if(d.indexOf("84")===0 && d.length>=11) d="0"+d.slice(2); if(d.length===9) d="0"+d; return d; }
function validEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean(v)); }
function say(box,text,kind){ box.className="dk-msg "+(kind||"err"); box.textContent=text; }
function hush(box){ box.className="dk-msg"; box.textContent=""; }
function busy(btn,on,text){ if(on){ btn.dataset.t=btn.textContent; btn.textContent=text||"ĐANG XỬ LÝ..."; btn.disabled=true; } else { btn.textContent=btn.dataset.t||btn.textContent; btn.disabled=false; } }
function field(label,input,opts){
    opts=opts||{};
    return h("div",{class:"dk-field"+(opts.full?" dk-full":"")},[
        h("label",null,[label,opts.req?h("span",{class:"dk-req",text:" *"}):null]),
        input,
        opts.hint?h("div",{class:"dk-hint",text:opts.hint}):null
    ]);
}
function inp(type,value,ph,extra){ return h("input",Object.assign({class:"dk-input",type:type||"text",value:value||"",placeholder:ph||"",autocomplete:"off"},extra||{})); }
function pwInput(ph){
    const i=inp("password","",ph||"",{autocomplete:"new-password"});
    const eye=h("button",{type:"button",class:"dk-eye","aria-label":"Hiện mật khẩu",text:"👁",onclick:function(){ i.type=i.type==="password"?"text":"password"; }});
    const wrap=h("div",{class:"dk-pw"},[i,eye]); wrap.input=i; return wrap;
}
function courses(){ return Array.isArray(window.OCD_COURSES) && window.OCD_COURSES.length ? window.OCD_COURSES : COURSES; }

/* ---------------- trạng thái ---------------- */
const S={auth:null,profile:null,enrolled:null,tab:"register",openCourse:null,lastDone:{},team:(function(){ try{ return localStorage.getItem("ocd_dk_team_v1")||""; }catch(e){ return ""; } })()};

function A(){ return window.OCDAuth && typeof window.OCDAuth.acceptSession==="function" ? window.OCDAuth : null; }

async function loadMine(){
    const auth=A();
    if(!auth || !auth.token()){ S.profile=null; S.enrolled=null; return; }
    S.loading=true;
    try{
        const r=await Promise.all([auth.post("authProfile",{token:auth.token()}),auth.post("authEnrolled",{token:auth.token()})]);
        S.profile=r[0] && r[0].ok ? r[0].profile : null;
        S.enrolled=r[1] && r[1].ok ? (r[1].list||[]) : null;
    }finally{ S.loading=false; }
}

/* =========================================================
   KHUNG TRANG
========================================================= */
function renderAll(){
    const root=$(ROOT_ID); if(!root) return;
    root.innerHTML="";
    const logged=!!(A() && A().me());
    root.appendChild(h("div",{class:"dk-hero"},[
        h("div",{class:"dk-kicker",text:"THANH PHONG THƯ MÔN · ĐĂNG KÝ HỌC"}),
        h("h2",{text:"Tham gia cộng đồng lớp học thư pháp Online"}),
        h("p",{text:"Tạo tài khoản một lần, sau đó chọn khoá học và gói học phù hợp. Thông tin đăng ký được gửi thẳng tới giáo viên, bạn sẽ nhận email xác nhận."}),
        h("div",{class:"dk-steps"},[
            h("span",{class:"dk-step"+(logged?" done":"")},[h("b",{text:logged?"✓":"1"}),"Tài khoản"]),
            h("span",{class:"dk-step"},[h("b",{text:"2"}),"Chọn khoá học"]),
            h("span",{class:"dk-step"},[h("b",{text:"3"}),"Nhận mã học viên qua email"])
        ])
    ]));
    root.appendChild(h("section",{class:"dk-section",id:"dkAccount"}));
    root.appendChild(h("section",{class:"dk-section",id:"dkCourses"}));
    root.appendChild(h("div",{class:"dk-contact"},[
        "Cần hỗ trợ? Gọi ",h("a",{href:"tel:"+CONTACT.phone.replace(/\s/g,""),text:CONTACT.phone})," · ",
        h("a",{href:"mailto:"+CONTACT.email,text:CONTACT.email})," · "+CONTACT.address
    ]));
    renderAccount();
    renderCourses();
}

/* =========================================================
   PHẦN TÀI KHOẢN
========================================================= */
function renderAccount(){
    const box=$("dkAccount"); if(!box) return;
    box.innerHTML="";
    const auth=A();
    if(!auth){
        box.appendChild(h("div",{class:"dk-msg err",text:"Chưa tải được hệ thống tài khoản. Vui lòng tải lại trang (nếu vẫn lỗi, hãy báo giáo viên cập nhật theme)."}));
        return;
    }
    const me=auth.me();
    if(me){ renderLoggedIn(box,me); return; }
    box.appendChild(h("div",{class:"dk-section-head"},[h("div",null,[
        h("h3",{text:"Tài khoản của bạn"}),
        h("p",{text:"Tạo tài khoản mới (xác minh bằng email) hoặc đăng nhập nếu bạn đã có tài khoản / mã học viên đã bảo mật."})
    ])]));
    const tabs=[["register","Tạo tài khoản mới"],["login","Đăng nhập"],["student","Tôi là học viên cũ"]];
    box.appendChild(h("div",{class:"dk-tabs"},tabs.map(function(t){
        return h("button",{type:"button",class:"dk-tab"+(S.tab===t[0]?" active":""),text:t[1],onclick:function(){ S.tab=t[0]; renderAccount(); }});
    })));
    const body=h("div"); box.appendChild(body);
    if(S.tab==="login") renderLogin(body);
    else if(S.tab==="student") renderStudent(body);
    else renderRegister(body);
}

function renderRegister(body){
    const auth=A();
    const name=inp("text","","Nguyễn Văn A",{autocomplete:"name"}), phone=inp("tel","","09xx xxx xxx",{autocomplete:"tel"}), email=inp("email","","ban@gmail.com",{autocomplete:"email"});
    const birth=inp("text","","dd/mm/yyyy"), address=inp("text","","Tỉnh / thành phố"), zalo=inp("text","","Tên hiển thị trên Zalo");
    const p1=pwInput("Tối thiểu 6 ký tự"), p2=pwInput("Nhập lại mật khẩu");
    const msg=h("div",{class:"dk-msg"});
    const btn=h("button",{type:"button",class:"dk-btn",text:"TẠO TÀI KHOẢN"});
    body.append(
        h("div",{class:"dk-grid"},[
            field("Họ và tên",name,{req:true}),
            field("Số điện thoại",phone,{req:true}),
            field("Email",email,{req:true,hint:"Mã xác nhận 6 số sẽ được gửi tới email này."}),
            field("Ngày tháng năm sinh",birth),
            field("Địa chỉ",address),
            field("Tên Zalo của bạn",zalo),
            field("Mật khẩu",p1,{req:true}),
            field("Nhập lại mật khẩu",p2,{req:true})
        ]),
        h("div",{class:"dk-actions"},[btn]),
        msg
    );
    btn.onclick=async function(){
        hush(msg);
        if(!clean(name.value) || normPhone(phone.value).length<10 || !validEmail(email.value)){ say(msg,"Vui lòng nhập đủ họ tên, số điện thoại và email hợp lệ."); return; }
        if(p1.input.value.length<6){ say(msg,"Mật khẩu cần tối thiểu 6 ký tự."); return; }
        if(p1.input.value!==p2.input.value){ say(msg,"Hai lần nhập mật khẩu chưa giống nhau."); return; }
        busy(btn,true,"ĐANG GỬI MÃ XÁC NHẬN...");
        const r=await auth.post("regStart",{name:clean(name.value),phone:normPhone(phone.value),email:clean(email.value),password:p1.input.value,
            birth:clean(birth.value),address:clean(address.value),zalo:clean(zalo.value)});
        busy(btn,false);
        if(!r.ok){
            say(msg,r.error||"Chưa tạo được tài khoản.");
            if(r.student){
                const up=h("button",{type:"button",class:"dk-btn",text:"NÂNG CẤP BẢO MẬT MÃ "+r.student,onclick:function(){ openUpgrade(r.student); }});
                msg.appendChild(h("br")); msg.appendChild(up);
            }
            return;
        }
        renderOtp(body,clean(email.value),r.sentTo);
    };
}

function renderOtp(body,email,sentTo){
    const auth=A();
    body.innerHTML="";
    const otp=inp("text","","6 số",{inputMode:"numeric",maxLength:6});
    const msg=h("div",{class:"dk-msg info",text:"Đã gửi mã xác nhận tới "+(sentTo||email)+" (hiệu lực 15 phút). Hãy kiểm tra cả thư mục Spam / Quảng cáo."});
    const btn=h("button",{type:"button",class:"dk-btn",text:"XÁC NHẬN"});
    const back=h("button",{type:"button",class:"dk-btn dk-ghost",text:"Sửa thông tin",onclick:function(){ renderAccount(); }});
    body.append(h("div",{class:"dk-grid"},[field("Mã xác nhận",otp,{req:true})]),h("div",{class:"dk-actions"},[btn,back]),msg);
    otp.focus();
    btn.onclick=async function(){
        if(!/^\d{6}$/.test(clean(otp.value))){ say(msg,"Vui lòng nhập đúng mã 6 số."); return; }
        busy(btn,true,"ĐANG XÁC NHẬN...");
        const r=await auth.post("regVerify",{email:email,otp:clean(otp.value)});
        busy(btn,false);
        if(!r.ok){ say(msg,r.error||"Mã xác nhận chưa đúng."); return; }
        auth.acceptSession(r);
        await afterLogin("✅ Đã tạo tài khoản "+(r.me&&r.me.code||"")+". Hãy chọn khoá học bên dưới.");
    };
    otp.addEventListener("keydown",function(e){ if(e.key==="Enter") btn.click(); });
}

function renderLogin(body){
    const auth=A();
    const id=inp("text","","Mã học viên / mã thành viên / email",{autocomplete:"username"}), pw=pwInput("Mật khẩu");
    pw.input.autocomplete="current-password";
    const msg=h("div",{class:"dk-msg"});
    const btn=h("button",{type:"button",class:"dk-btn",text:"ĐĂNG NHẬP"});
    const forgot=h("button",{type:"button",class:"dk-link",text:"Quên mật khẩu?",onclick:function(){ auth.openForgot({id:clean(id.value),onSuccess:function(){ afterLogin("✅ Đã đặt lại mật khẩu và đăng nhập."); }}); }});
    body.append(h("div",{class:"dk-grid"},[field("Mã hoặc email",id,{req:true}),field("Mật khẩu",pw,{req:true})]),
        h("div",{class:"dk-actions"},[btn]),h("div",{style:"margin-top:10px"},[forgot]),msg);
    async function go(){
        hush(msg);
        if(!clean(id.value) || !pw.input.value){ say(msg,"Vui lòng nhập đủ mã (hoặc email) và mật khẩu."); return; }
        busy(btn,true,"ĐANG ĐĂNG NHẬP...");
        const r=await auth.post("authLogin",{id:clean(id.value),password:pw.input.value});
        busy(btn,false);
        if(!r.ok){
            say(msg,r.error||"Đăng nhập chưa thành công.");
            if(/chưa được bảo mật/.test(r.error||"") && /^[0-9A-Z]+$/i.test(clean(id.value)) && clean(id.value).indexOf("@")<0){
                msg.appendChild(h("br"));
                msg.appendChild(h("button",{type:"button",class:"dk-btn",text:"NÂNG CẤP BẢO MẬT MÃ "+clean(id.value).toUpperCase(),onclick:function(){ openUpgrade(clean(id.value)); }}));
            }
            return;
        }
        auth.acceptSession(r);
        await afterLogin("✅ Đăng nhập thành công.");
    }
    btn.onclick=go;
    [id,pw.input].forEach(function(x){ x.addEventListener("keydown",function(e){ if(e.key==="Enter") go(); }); });
}

function renderStudent(body){
    const auth=A();
    const code=inp("text","","Ví dụ: 610204");
    const msg=h("div",{class:"dk-msg"});
    const btn=h("button",{type:"button",class:"dk-btn",text:"TIẾP TỤC"});
    body.append(
        h("p",{class:"dk-hint",text:"Bạn đã là học viên (đã có mã học viên)? Nâng cấp bảo mật bằng số điện thoại và email đã dùng khi đăng ký học, rồi đặt mật khẩu. Tài khoản này dùng chung cho Minh Hồng, Tra cứu hồ sơ và trang đăng ký."}),
        h("div",{class:"dk-grid"},[field("Mã học viên",code,{req:true})]),
        h("div",{class:"dk-actions"},[btn]),msg
    );
    code.addEventListener("input",function(){ this.value=this.value.toUpperCase().replace(/\s+/g,""); });
    btn.onclick=async function(){
        hush(msg);
        const c=clean(code.value).toUpperCase(); if(!c){ say(msg,"Vui lòng nhập mã học viên."); return; }
        busy(btn,true,"ĐANG KIỂM TRA...");
        const r=await auth.post("authStatus",{code:c});
        busy(btn,false);
        if(!r.ok){ say(msg,r.error||"Chưa kiểm tra được mã."); return; }
        if(r.protected){
            auth.openLogin({code:c,onSuccess:function(){ afterLogin("✅ Đăng nhập thành công."); }});
            return;
        }
        openUpgrade(c);
    };
}

function openUpgrade(code){
    A().openUpgrade({code:String(code).toUpperCase(),onSuccess:function(){ afterLogin("✅ Tài khoản đã được bảo mật và đăng nhập."); }});
}

async function afterLogin(text){
    S.tab="register";
    S.busyLogin=true;
    const box=$("dkAccount");
    if(box){ box.innerHTML=""; box.appendChild(h("div",{class:"dk-loading",text:"Đang tải thông tin tài khoản..."})); }
    try{ await loadMine(); }finally{ S.busyLogin=false; }
    renderAll();
    const m=$("dkAccountMsg"); if(m && text) say(m,text,"ok");
}

function renderLoggedIn(box,me){
    const auth=A(), p=S.profile||{};
    const isTV=(me.type||p.type)==="TV";
    box.appendChild(h("div",{class:"dk-section-head"},[h("div",null,[
        h("h3",{text:"Tài khoản của bạn"}),
        h("p",{text:"Kiểm tra và bổ sung thông tin cơ bản. Thông tin này được dùng khi bạn đăng ký các khoá học."})
    ])]));
    box.appendChild(h("div",{class:"dk-me"},[
        h("div",{class:"dk-me-icon",text:isTV?"🌱":"🎓"}),
        h("div",null,[
            h("div",{class:"dk-me-name",text:me.name||p.name||""}),
            h("div",{class:"dk-me-sub",text:(isTV?"Mã thành viên ":"Mã học viên ")+(me.linked||me.code)+" · 🔒 Đã bảo mật"})
        ]),
        h("div",{class:"dk-me-actions"},[
            h("button",{type:"button",class:"dk-btn dk-ghost",text:"Đổi mật khẩu",onclick:function(){ auth.openAccount({onLogout:function(){ S.profile=null; S.enrolled=null; renderAll(); }}); }}),
            h("button",{type:"button",class:"dk-btn dk-ghost",text:"Đăng xuất",onclick:async function(){ this.disabled=true; await auth.logout(false); S.profile=null; S.enrolled=null; renderAll(); }})
        ])
    ]));
    const msg=h("div",{class:"dk-msg",id:"dkAccountMsg"});
    if(!S.profile){
        box.appendChild(h("div",{class:"dk-loading",text:"Đang tải thông tin cơ bản..."}));
        box.appendChild(msg);
        loadMine().then(function(){ if(S.profile) renderAccount(); else say(msg,"Chưa tải được thông tin tài khoản. Vui lòng tải lại trang."); renderCourses(); });
        return;
    }
    const name=inp("text",p.name,"",{readOnly:!isTV});
    const phone=inp("text",p.phone,"",{readOnly:true}), email=inp("text",p.email,"",{readOnly:true});
    const birth=inp("text",p.birth,"dd/mm/yyyy"), address=inp("text",p.address,"Tỉnh / thành phố"), zalo=inp("text",p.zalo,"Tên hiển thị trên Zalo");
    const save=h("button",{type:"button",class:"dk-btn",text:"LƯU THÔNG TIN"});
    box.append(
        h("div",{class:"dk-grid"},[
            field("Họ và tên",name,{hint:isTV?"":"Họ tên học viên do giáo viên quản lý."}),
            field("Số điện thoại",phone,{hint:"Đổi SĐT / email: vui lòng liên hệ giáo viên."}),
            field("Email",email),
            field("Ngày tháng năm sinh",birth),
            field("Địa chỉ",address),
            field("Tên Zalo của bạn",zalo)
        ]),
        h("div",{class:"dk-actions"},[save]),msg
    );
    save.onclick=async function(){
        hush(msg);
        busy(save,true,"ĐANG LƯU...");
        const r=await auth.post("authProfileSave",{token:auth.token(),name:clean(name.value),birth:clean(birth.value),address:clean(address.value),zalo:clean(zalo.value)});
        busy(save,false);
        if(!r.ok){ say(msg,r.error||"Chưa lưu được thông tin."); return; }
        S.profile=r.profile;
        say(msg,"✅ Đã lưu thông tin cơ bản.","ok");
        renderCourses();
    };
}

/* =========================================================
   DANH SÁCH KHOÁ HỌC
========================================================= */
function renderCourses(){
    const box=$("dkCourses"); if(!box) return;
    box.innerHTML="";
    box.appendChild(h("div",{class:"dk-section-head"},[h("div",null,[
        h("h3",{text:"Các khoá học"}),
        h("p",{text:"Chọn khoá học đang mở để xem chương trình, gói học và đăng ký."})
    ])]));
    courses().forEach(function(c){ box.appendChild(courseCard(c)); });
    ensureLessons().then(function(){ return loadViewer(false); }).then(function(changed){
        if(viewerKey()!==box.dataset.viewer){ box.dataset.viewer=viewerKey(); redrawCourses(); }
    }).catch(function(){});
}
function viewerKey(){ return [ST.code,ST.done.size,lessons().length,S.enrolled?S.enrolled.length:-1].join("|"); }
function redrawCourses(){
    courses().forEach(function(c){ const card=$("dkCourse-"+c.id); if(card) card.replaceWith(courseCard(c)); });
}
function ensureLessons(){ return ensureScript("lo-trinh-52"); }

function courseCard(c){
    const enrolled=isEnrolled(c);
    const card=h("article",{class:"dk-course"+(enrolled?" is-enrolled":""),id:"dkCourse-"+c.id});
    card.appendChild(h("div",{class:"dk-course-head"},[
        h("span",{class:"dk-badge"+(c.open?"":" closed"),text:enrolled?"BẠN ĐANG HỌC KHOÁ NÀY":(c.open?"ĐANG NHẬN ĐĂNG KÝ":"CHƯA MỞ ĐĂNG KÝ")}),
        h("h4",{text:c.name}),
        c.summary?h("p",{text:c.summary}):null,
        c.meta&&c.meta.length?h("div",{class:"dk-course-meta"},c.meta.map(function(m){ return h("span",{class:"dk-chip",text:m}); })):null
    ]));
    const body=h("div",{class:"dk-course-body"});
    card.appendChild(body);
    const formOpen=S.openCourse===c.id && A() && A().me() && !enrolled;
    if(c.teams!==false){
        body.appendChild(h("div",{class:"dk-sub",text:"Tứ tổ Thư Môn"}));
        body.appendChild(teamSlider(c,enrolled));
    }
    if(c.roadmap!==false){
        body.appendChild(h("div",{class:"dk-sub",text:"Lộ trình 52 buổi"}));
        body.appendChild(roadmap(c,enrolled));
    }
    if(c.packages&&c.packages.length && !formOpen){
        if(enrolled){
            body.appendChild(h("details",{class:"dk-rules"},[h("summary",{text:"💳 Các gói học"}),h("div",{class:"dk-rules-body"},[packageGrid(c,null)])]));
        }else{
            body.appendChild(h("div",{class:"dk-sub",text:"Gói học"}));
            body.appendChild(packageGrid(c,null));
        }
    }
    if(!formOpen) body.appendChild(rulesBlock());
    if(!c.open){
        body.appendChild(h("div",{class:"dk-msg info",text:"Khoá học này chưa mở đăng ký. Vui lòng quay lại sau."}));
        return card;
    }
    if(!(enrolled && ST.code)) body.appendChild(enrollArea(c));
    return card;
}

/* =========================================================
   v1.1: TỨ TỔ · LỘ TRÌNH · BÀI TẬP ĐẸP · LƯU BÚT
========================================================= */
const TEAMS=[
    {no:"1",name:"Thanh Phong mặc vũ",motto:"Mực theo gió chuyển, ý tựa mưa bay.",image:"https://drive.google.com/thumbnail?id=1VLwUU_73rOPsXNrrljhWkK3lF1EpE8KH&sz=w1600",link:"https://www.thudao.com/p/gioi-thieu-to.html?to=1"},
    {no:"2",name:"Trúc mặc thư",motto:"Tâm ngay như trúc, nét tĩnh như thư.",image:"https://drive.google.com/thumbnail?id=10OzDAfhWpGdXQoyBTs_seFMw6giTu8Vg&sz=w1600",link:"https://www.thudao.com/p/gioi-thieu-to.html?to=2"},
    {no:"3",name:"Vương triều cá biệt",motto:"Khác biệt thành thế, bản lĩnh thành danh.",image:"https://drive.google.com/thumbnail?id=1036Hsa90s_A7uuXdfv0jFP49_CfzLqMS&sz=w1600",link:"https://www.thudao.com/p/gioi-thieu-to.html?to=3"},
    {no:"4",name:"Nói ít làm nhiều",motto:"Để thành quả thay lời, để nét bút lên tiếng.",image:"https://drive.google.com/thumbnail?id=1zJr6Xw4uhFxK3klzvuwwp7ZDBTXJi7MC&sz=w1600",link:"https://www.thudao.com/p/gioi-thieu-to.html?to=4"}
];
const STAGES=[
    {from:0,to:12,no:"Giai đoạn 1",title:"Nhập môn & Bút pháp căn bản",text:"Chuẩn bị dụng cụ, cầm bút, lấy mực, các nét lộ phong – trung phong, lâm mô, vận động cổ tay và cửu dụng."},
    {from:13,to:26,no:"Giai đoạn 2",title:"Nét cơ bản & Chữ cái",text:"Hoàn thiện cửu dụng, bát pháp các nét chấm – ngang – dọc – móc – vòng, chữ cái thường và in hoa."},
    {from:27,to:40,no:"Giai đoạn 3",title:"Kết cấu chữ & Ấn chương",text:"Âm ghép, bộ chữ, bồi biểu, khắc ấn, khuyên – ý bút, giải phẫu và giàn giá chữ, bố bạch."},
    {from:41,to:52,no:"Giai đoạn 4",title:"Thể chữ, Tác phẩm & Tốt nghiệp",text:"Các thể chữ, trung đường – phiến diện – hoành phi – câu đối, lạc khoản, chương pháp và kiểm tra tốt nghiệp."}
];
const DATA={
    registry:"https://docs.google.com/spreadsheets/d/e/2PACX-1vRP5cc8duj1XrCXMrymo6Cj7aqIkWfX6bHxGeW-lXcSewfQXhM8fZ5rzbNIQ9mBeVuB8yYr_o1aBoYA/pub?gid=1603096683&single=true&output=csv",
    deleted:"https://docs.google.com/spreadsheets/d/1GJoTRsbq0kZfZrDdh0uCC667PwS3Bgkje2fHQnwnCKs/export?format=csv&gid=521976322"
};
const TEAM_KEY="ocd_dk_team_v1";

function RSX(){ return window.StudentRewardSystem && typeof window.StudentRewardSystem.fetchCSV==="function" ? window.StudentRewardSystem : null; }
function parseCsv(text){
    const RS=RSX();
    if(RS && typeof RS.parseCSV==="function") return RS.parseCSV(text);
    const rows=[]; let row=[],cell="",q=false; text=String(text||"").replace(/^﻿/,"");
    for(let i=0;i<text.length;i++){ const c=text[i],n=text[i+1];
        if(c==='"'&&q&&n==='"'){ cell+='"'; i++; continue; }
        if(c==='"'){ q=!q; continue; }
        if(c===","&&!q){ row.push(cell); cell=""; continue; }
        if((c==="\n"||c==="\r")&&!q){ if(c==="\r"&&n==="\n") i++; row.push(cell); rows.push(row); row=[]; cell=""; continue; }
        cell+=c; }
    if(cell!==""||row.length){ row.push(cell); rows.push(row); }
    return rows;
}
async function csv(url){
    const RS=RSX();
    if(RS) return parseCsv(await RS.fetchCSV(url));
    const r=await fetch(url,{cache:"no-store"}); return parseCsv(await r.text());
}
function norm(v){ return clean(v).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/đ/g,"d"); }
function col(head,keys){ const hs=head.map(norm); for(const k of keys){ const i=hs.indexOf(k); if(i>=0) return i; } for(const k of keys){ const i=hs.findIndex(function(x){ return x.indexOf(k)===0; }); if(i>=0) return i; } return -1; }
function upCode(v){ return clean(v).toUpperCase().replace(/\s+/g,""); }
function driveId(url){ const m=String(url||"").match(/[?&]id=([\w-]{10,})|\/d\/([\w-]{10,})/); return m?(m[1]||m[2]):""; }
function numScore(v){ const n=Number(String(v||"").replace(",",".")); return isFinite(n)&&String(v).trim()!==""?n:null; }
function lessons(){ return Array.isArray(window.OCD_LESSONS_52)?window.OCD_LESSONS_52:[]; }

/* ---------- dữ liệu dùng chung (tải một lần) ---------- */
const D={registry:null,deleted:null,loading:{}};
function once(key,fn){ if(!D.loading[key]) D.loading[key]=fn().catch(function(e){ D.loading[key]=null; throw e; }); return D.loading[key]; }
function loadRegistry(){ return once("registry",async function(){
    const rows=await csv(DATA.registry), h=rows[0]||[];
    const ci=col(h,["ma hoc vien"]), ni=col(h,["ho va ten","ho ten"]), ti=col(h,["to"]), ki=col(h,["khoa"]), si=col(h,["trang thai"]);
    const map=new Map();
    rows.slice(1).forEach(function(r){ const c=upCode(r[ci]); if(c) map.set(c,{code:c,name:clean(r[ni]),team:clean(r[ti]),course:clean(r[ki]),status:clean(r[si]).toUpperCase()}); });
    return (D.registry=map);
}); }
function loadDeleted(){ return once("deleted",async function(){
    const set=new Set();
    try{ const rows=await csv(DATA.deleted); rows.slice(1).forEach(function(r){ r.forEach(function(v){ const id=driveId(v); if(id) set.add(id); }); }); }catch(e){}
    return (D.deleted=set);
}); }
function vnTime(s){ const m=String(s||"").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/); return m?Date.UTC(+m[3],+m[2]-1,+m[1],+(m[4]||0),+(m[5]||0)):0; }

/* ---------- học viên đang xem (tài khoản / Minh Hồng) ---------- */
const ST={code:"",info:null,done:new Set(),loaded:false,busy:false,error:""};
async function viewerCode(){
    const auth=A(), me=auth&&auth.me();
    if(me){ if(me.linked) return upCode(me.linked); if(me.type!=="TV") return upCode(me.code); }
    let code="";
    try{ const s=window.OCDStudentSession; code=s&&typeof s.getCode==="function"?upCode(s.getCode()):""; }catch(e){}
    if(!code || code==="ADMIN") return "";
    if(auth){ try{ if(!auth.isMe(code) && await auth.isProtected(code)) return ""; }catch(e){} }
    return code;
}
function isEnrolled(c){
    if(ST.code) return true; // mọi học viên có mã đều đang học khoá 52 buổi
    return !!(A() && A().me() && enrolledFor(c));
}
async function loadViewer(force){
    if(ST.busy) return;
    const code=await viewerCode();
    if(!force && ST.loaded && code===ST.code) return;
    ST.busy=true; ST.code=code; ST.done=new Set(); ST.info=null; ST.error="";
    try{
        if(code){
            const reg=await loadRegistry().catch(function(){ return null; });
            ST.info=reg && reg.get(code) || null;
            const RS=RSX(); let text="";
            if(RS && typeof RS.getStudentSubmissionsCsv==="function") text=await RS.getStudentSubmissionsCsv(code,!!force);
            const rows=parseCsv(text), h=rows[0]||[], ci=col(h,["ma hoc vien"]), bi=col(h,["mo ta bai tap","ma bai","bai tap"]);
            const pat=/(^|[^A-Z0-9_À-ɏḀ-ỿ])(VPTB|LM|T(?:[1-9]|[1-4][0-9]|5[0-2]))(?=$|[^A-Z0-9_À-ɏḀ-ỿ])/g;
            rows.slice(1).forEach(function(r){
                if(ci>=0 && upCode(r[ci])!==code) return;
                const t=clean(r[bi]).toUpperCase(); let m; pat.lastIndex=0;
                while((m=pat.exec(t))) ST.done.add(m[2]);
            });
        }
    }catch(e){ ST.error="Chưa tải được tiến độ học tập. Vui lòng thử lại sau."; }
    finally{ ST.busy=false; ST.loaded=true; }
}
function lessonDone(l){ return (l.acceptedCodes||[l.code]).some(function(c){ return ST.done.has(c); }); }
function currentLesson(){
    const L=lessons(); let last=-1;
    L.forEach(function(l){ if(lessonDone(l)) last=l.id; });
    return Math.min(52,last+1);
}

/* ---------- modal dùng chung ---------- */
function openModal(title,build,opts){
    closeModal();
    const box=h("div",{class:"dk-modal-box"+(opts&&opts.wide?" wide":""),role:"dialog","aria-modal":"true"});
    const head=h("div",{class:"dk-modal-head"},[h("div",{class:"dk-modal-title",text:title}),h("button",{type:"button",class:"dk-modal-x","aria-label":"Đóng",text:"×",onclick:closeModal})]);
    const body=h("div",{class:"dk-modal-body"});
    box.append(head,body);
    const back=h("div",{class:"dk-modal",id:"dkModal",onclick:function(e){ if(e.target===back) closeModal(); }},[box]);
    document.body.appendChild(back);
    document.documentElement.classList.add("dk-noscroll");
    document.addEventListener("keydown",modalKey);
    build(body,head);
    return body;
}
function modalKey(e){ if(e.key==="Escape") closeModal(); }
function closeModal(){
    const m=$("dkModal"); if(m) m.remove();
    document.documentElement.classList.remove("dk-noscroll");
    document.removeEventListener("keydown",modalKey);
}

/* ---------- tứ tổ (banner cũ + chọn tổ) ---------- */
function teamSlider(c,enrolled){
    const wrap=h("div",{class:"dk-teams"});
    const host=h("div",{class:"dk-team-host"});
    wrap.appendChild(host);
    const myTeam=ST.info && ST.info.team;
    let root=null;
    ensureScript("tu-to").then(function(){
        if(window.OCDTeamSlider) root=window.OCDTeamSlider.mount(host,{team:enrolled&&myTeam?myTeam:S.team});
    });
    const pick=h("div",{class:"dk-team-pick"});
    if(enrolled && myTeam && TEAMS.some(function(t){ return t.no===myTeam; })){
        const t=TEAMS.filter(function(x){ return x.no===myTeam; })[0];
        pick.appendChild(h("div",{class:"dk-team-mine"},[h("span",{text:"Tổ của bạn"}),h("strong",{text:"Tổ "+t.no+" · "+t.name})]));
    }else if(enrolled){
        pick.appendChild(h("p",{class:"dk-hint",text:"Giáo viên sẽ xếp tổ cho bạn. Tổ của bạn sẽ hiện ở đây khi có mã học viên."}));
    }else{
        pick.appendChild(h("div",{class:"dk-team-pick-title",text:"Chọn tổ bạn muốn tham gia"}));
        const row=h("div",{class:"dk-team-chips"});
        TEAMS.concat([{no:"",name:"Để giáo viên xếp tổ"}]).forEach(function(t){
            const on=S.team===t.no;
            row.appendChild(h("button",{type:"button",class:"dk-team-chip"+(on?" on":""),"aria-pressed":on?"true":"false",onclick:function(){
                S.team=t.no; try{ localStorage.setItem(TEAM_KEY,t.no); }catch(e){}
                row.querySelectorAll(".dk-team-chip").forEach(function(b){ b.classList.remove("on"); b.setAttribute("aria-pressed","false"); });
                this.classList.add("on"); this.setAttribute("aria-pressed","true");
                if(t.no && root && root.otsShow) root.otsShow(t.no);
                const note=document.querySelector("#dkCourse-"+c.id+" .dk-team-chosen"); if(note) note.textContent=teamText();
            }},[t.no?h("b",{text:"Tổ "+t.no}):null,h("span",{text:t.name})]));
        });
        pick.append(row,h("p",{class:"dk-hint",text:"Nguyện vọng được gửi kèm đăng ký; giáo viên xếp tổ dựa trên nguyện vọng và sĩ số các tổ."}));
    }
    wrap.appendChild(pick);
    return wrap;
}
const scriptPromises={};
function ensureScript(name){
    if(name==="tu-to" && window.OCDTeamSlider) return Promise.resolve();
    if(name==="lo-trinh-52" && lessons().length) return Promise.resolve();
    if(scriptPromises[name]) return scriptPromises[name];
    return (scriptPromises[name]=new Promise(function(resolve){
        const sc=document.createElement("script");
        sc.src=(window.OCD_REGISTER_ASSETS||SCRIPT_BASE)+name+".min.js";
        sc.onload=sc.onerror=function(){ resolve(); };
        document.head.appendChild(sc);
    }));
}
function teamText(){
    const t=TEAMS.filter(function(x){ return x.no===S.team; })[0];
    return t?"Tổ "+t.no+" – "+t.name:"Để giáo viên xếp tổ";
}

/* ---------- lộ trình ---------- */
function roadmap(c,enrolled){
    const L=lessons(), wrap=h("div",{class:"dk-path"});
    if(!L.length){ wrap.appendChild(h("p",{class:"dk-hint",text:"Đang tải lộ trình…"})); return wrap; }
    const cur=enrolled?currentLesson():-1;
    if(enrolled){
        const total=L.filter(lessonDone).length;
        const pct=Math.round(total*100/L.length);
        const head=h("div",{class:"dk-path-me"},[
            h("div",null,[
                h("div",{class:"dk-path-me-title",text:ST.code?("Bạn đang ở "+(cur===0?"buổi Chuẩn bị":"Tuần "+cur)+" – "+(L[cur].shortTitle||L[cur].title).replace(/^Tuần \d+ - /,"")):"Bạn đã đăng ký khoá học"}),
                h("div",{class:"dk-path-me-sub",text:ST.code?(total+"/"+L.length+" bài đã nộp"+(ST.info&&ST.info.team?" · Tổ "+ST.info.team:"")+(ST.info&&ST.info.course?" · Khoá "+ST.info.course:"")):"Tiến độ sẽ hiện khi giáo viên cấp mã học viên. Bạn đã xem được nội dung từng bài."})
            ]),
            ST.code?h("button",{type:"button",class:"dk-btn",text:"Mở bài hiện tại",onclick:function(){ openLesson(cur,true); }}):null
        ]);
        wrap.appendChild(head);
        if(ST.code) wrap.appendChild(h("div",{class:"dk-bar"},[h("span",{style:"width:"+pct+"%"})]));
        if(ST.error) wrap.appendChild(h("div",{class:"dk-msg err",text:ST.error}));
    }else{
        wrap.appendChild(h("div",{class:"dk-path-lock"},[h("span",{text:"🔒"}),h("span",{text:"Bạn xem được tên các bài trong lộ trình. Nội dung chi tiết (hướng dẫn, nhiệm vụ) mở ra sau khi đăng ký khoá học."})]));
    }
    const grid=h("div",{class:"dk-stage-grid"});
    STAGES.forEach(function(st){
        const items=L.filter(function(l){ return l.id>=st.from && l.id<=st.to; });
        const doneN=items.filter(lessonDone).length;
        const nodes=h("div",{class:"dk-nodes"});
        items.forEach(function(l){
            const done=enrolled && lessonDone(l), isCur=l.id===cur;
            const label=l.id===0?"CB":String(l.id);
            const name=(l.shortTitle||l.title).replace(/^Tuần \d+ - /,"");
            nodes.appendChild(h("button",{type:"button",class:"dk-node"+(done?" done":"")+(isCur?" current":"")+(enrolled?"":" locked"),
                title:(l.id===0?"Chuẩn bị":"Tuần "+l.id)+" – "+name,"aria-label":(l.id===0?"Chuẩn bị":"Tuần "+l.id)+": "+name+(done?", đã nộp bài":"")+(isCur?", bài hiện tại":""),
                onclick:function(){ openLesson(l.id,enrolled); }},[h("span",{text:label})]));
        });
        grid.appendChild(h("section",{class:"dk-stage2"+(enrolled&&cur>=st.from&&cur<=st.to?" here":"")},[
            h("div",{class:"dk-stage2-head"},[
                h("div",null,[h("div",{class:"dk-stage-no",text:st.no+" · "+(st.from===0?"Chuẩn bị + buổi 1–":"Buổi "+st.from+"–")+st.to}),h("div",{class:"dk-stage-title",text:st.title})]),
                enrolled&&ST.code?h("span",{class:"dk-stage2-count",text:doneN+"/"+items.length}):null
            ]),
            h("div",{class:"dk-stage-text",text:st.text}),
            nodes
        ]));
    });
    wrap.appendChild(grid);
    wrap.appendChild(h("div",{class:"dk-legend"},enrolled?[
        h("span",null,[h("i",{class:"dk-dot done"}),"Đã nộp bài"]),h("span",null,[h("i",{class:"dk-dot current"}),"Bài hiện tại"]),h("span",null,[h("i",{class:"dk-dot"}),"Chưa học"])
    ]:[h("span",null,[h("i",{class:"dk-dot"}),"Bấm vào số để xem tên bài"]),h("span",null,[h("i",{class:"dk-dot lock"}),"Nội dung dành cho học viên"])]));
    return wrap;
}
function openLesson(id,enrolled){
    const L=lessons(), l=L[id]; if(!l) return;
    const num=id===0?"CHUẨN BỊ":"TUẦN "+String(id).padStart(2,"0")+" / 52";
    openModal(num,function(body,head){
        body.appendChild(h("h3",{class:"dk-lesson-title",text:l.title}));
        if(!enrolled){
            body.appendChild(h("div",{class:"dk-lesson-lock"},[
                h("div",{class:"dk-lesson-lock-icon",text:"🔒"}),
                h("p",{text:"Nội dung bài học (mô tả, hướng dẫn, nhiệm vụ và bài tham khảo) dành cho học viên đã đăng ký khoá Thư pháp Online 52 buổi."}),
                h("button",{type:"button",class:"dk-btn",text:A()&&A().me()?"ĐĂNG KÝ KHOÁ HỌC":"TẠO TÀI KHOẢN / ĐĂNG NHẬP",onclick:function(){
                    closeModal();
                    const me=A()&&A().me();
                    const target=me?document.querySelector(".dk-enroll-cta"):$("dkAccount");
                    if(target) target.scrollIntoView({behavior:"smooth",block:"start"});
                }})
            ]));
        }else{
            const done=lessonDone(l);
            if(ST.code) body.appendChild(h("p",{class:"dk-lesson-state"+(done?" done":""),text:done?"✓ Đã tìm thấy bài nộp của bạn cho bài này (chưa phải kết quả chấm).":"Chưa có bài nộp với mã "+(l.code||"")+"."}));
            const sec=function(t,txt,list){ const s=h("section",{class:"dk-lesson-sec"},[h("h4",{text:t})]); if(txt) s.appendChild(h("p",{text:txt})); if(list&&list.length) s.appendChild(h("ol",null,list.map(function(x){ return h("li",{text:x}); }))); body.appendChild(s); return s; };
            sec("Mô tả bài học",l.description);
            sec("Hướng dẫn","",l.guide&&l.guide.length?l.guide:["Hướng dẫn sẽ được bổ sung khi bài học được công bố."]);
            const tasks=sec("Nhiệm vụ","",l.tasks||[]);
            if(l.code) tasks.appendChild(h("p",{class:"dk-hint",text:"Mã bài khi nộp: "+(l.acceptedCodes||[l.code]).join(" hoặc ")}));
            if(l.references&&l.references.length){ const r=sec("Bài viết tham khảo"); l.references.forEach(function(x){ if(/^https:\/\//.test(x.url)) r.appendChild(h("a",{class:"dk-ref",href:x.url,target:"_blank",rel:"noopener",text:x.title})); }); }
            if(l.source) body.appendChild(h("p",{class:"dk-hint",text:"Nội dung biên soạn từ "+l.source}));
            if(l.submitUrl) body.appendChild(h("div",{class:"dk-actions"},[h("a",{class:"dk-btn",href:l.submitUrl,target:"_blank",rel:"noopener",text:l.submitLabel||"Nộp bài"})]));
        }
        const nav=h("div",{class:"dk-modal-nav"},[
            h("button",{type:"button",class:"dk-btn dk-ghost",text:"← Bài trước",disabled:id===0,onclick:function(){ openLesson(id-1,enrolled); }}),
            h("button",{type:"button",class:"dk-btn dk-ghost",text:"Bài tiếp →",disabled:id===52,onclick:function(){ openLesson(id+1,enrolled); }})
        ]);
        body.appendChild(nav);
    });
}

/* ---------- bài tập đẹp & lưu bút (cùng nguồn với trang cũ: Form Responses 1) ----------
   Bài tập đẹp: cột I (Nhận xét) có chữ "Ngon".  Lưu bút: cột G (Mô tả bài tập) có chữ "LB". */
const GALLERY={sheet:"1GJoTRsbq0kZfZrDdh0uCC667PwS3Bgkje2fHQnwnCKs",tab:"Form Responses 1",limit:30};
const galleryCache={};
function galleryQuery(kind){
    const q=kind==="lb"?"select A,B,C,D,E,F,G,H,I where lower(G) contains 'lb' order by A desc":"select A,B,C,D,E,F,G,H,I where lower(I) contains 'ngon' order by A desc";
    return "https://docs.google.com/spreadsheets/d/"+GALLERY.sheet+"/gviz/tq?tqx=out:csv&headers=1&sheet="+encodeURIComponent(GALLERY.tab)+"&tq="+encodeURIComponent(q)+"&_="+Math.floor(Date.now()/300000);
}
function loadGallery(kind){
    if(galleryCache[kind]) return galleryCache[kind];
    const word=kind==="lb"?/(^|[^a-z0-9_\u00c0-\u024f\u1e00-\u1eff])lb(?=$|[^a-z0-9_\u00c0-\u024f\u1e00-\u1eff])/i:/(^|[^a-z0-9_\u00c0-\u024f\u1e00-\u1eff])ngon(?=$|[^a-z0-9_\u00c0-\u024f\u1e00-\u1eff])/i;
    return (galleryCache[kind]=Promise.all([fetch(galleryQuery(kind),{cache:"no-store"}).then(function(r){ if(!r.ok) throw new Error("HTTP "+r.status); return r.text(); }),loadDeleted()]).then(function(res){
        const text=res[0], del=res[1];
        if(/^\s*</.test(text)||/setResponse/.test(text)) throw new Error("Sheet chưa trả về CSV");
        const rows=parseCsv(text), out=[], seen={}, seenImg={};
        rows.slice(1).forEach(function(r,i){
            if(!word.test(String(kind==="lb"?r[6]:r[8]||""))) return;
            const id=driveId(r[5]); if(!id || del.has(id) || seenImg[id]) return;
            const who=upCode(r[2])||norm(r[1]);
            if(seen[who]) return;
            seen[who]=true; seenImg[id]=true;
            out.push({time:clean(r[0]),name:clean(r[1])||"Học viên",code:upCode(r[2]),team:clean(r[3]),course:clean(r[4]),file:id,desc:clean(r[6]),score:numScore(r[7]),t:vnTime(r[0]),i:i});
        });
        out.sort(function(a,b){ return b.t-a.t||a.i-b.i; });
        return out.slice(0,GALLERY.limit);
    }).catch(function(e){ galleryCache[kind]=null; throw e; }));
}
function galleryModal(kind){
    const lb=kind==="lb";
    openModal(lb?"LƯU BÚT HỌC VIÊN KHOÁ ONLINE":"BÀI TẬP ĐẸP CỦA HỌC VIÊN",function(body){
        body.appendChild(h("h3",{class:"dk-lesson-title",text:lb?"Cảm nhận từ học viên":"Tác phẩm học viên"}));
        body.appendChild(h("p",{class:"dk-hint",text:lb?"Những trang lưu bút học viên viết tay và gửi về lớp.":"Những bài được giáo viên khen “Ngon”, mới nhất trước – mỗi học viên một bài."}));
        const grid=h("div",{class:"dk-works"+(lb?" lb":"")},[h("div",{class:"dk-loading",text:"Đang tải…"})]);
        body.appendChild(grid);
        loadGallery(kind).then(function(list){
            grid.innerHTML="";
            if(!list.length){ grid.appendChild(h("p",{class:"dk-hint",text:lb?"Chưa có lưu bút.":"Chưa có bài tập để hiển thị."})); return; }
            list.forEach(function(w){
                const img=h("img",{src:"https://drive.google.com/thumbnail?id="+w.file+"&sz=w800",alt:(lb?"Lưu bút của ":"Bài tập của ")+w.name,loading:"lazy",decoding:"async"});
                img.addEventListener("error",function(){ if(!img.dataset.r){ img.dataset.r="1"; img.src="https://lh3.googleusercontent.com/d/"+w.file+"=w800"; } else img.style.visibility="hidden"; });
                grid.appendChild(h("a",{class:"dk-work",href:"https://drive.google.com/file/d/"+w.file+"/view",target:"_blank",rel:"noopener"},[
                    h("div",{class:"dk-work-img"},[img]),
                    h("div",{class:"dk-work-name",text:w.name}),
                    h("div",{class:"dk-work-meta",text:[w.course?"Khoá "+w.course:"",w.team?"Tổ "+w.team:"",lb?"":w.desc,w.time.split(" ")[0]].filter(Boolean).join(" · ")})
                ]));
            });
        }).catch(function(){ grid.innerHTML=""; grid.appendChild(h("div",{class:"dk-msg err",text:"Chưa tải được dữ liệu. Vui lòng thử lại sau."})); });
    },{wide:true});
}
function openGoodWorks(){ galleryModal("ngon"); }
function openGuestbook(){ galleryModal("lb"); }

function packageGrid(c,selectedValue,onPick){
    const name="dkPack-"+c.id+(onPick?"-form":"");
    return h("div",{class:"dk-packages"},c.packages.map(function(p){
        const radio=onPick?h("input",{type:"radio",name:name,value:p.value,checked:selectedValue===p.value}):null;
        const label=h(onPick?"label":"div",{class:"dk-pack"+(p.hot?" hot":"")+(onPick&&selectedValue===p.value?" selected":"")},[
            radio,
            h("div",{class:"dk-pack-name",text:p.name}),
            h("div",{class:"dk-pack-price"},[money(p.price),p.oldPrice?h("span",{class:"dk-pack-old",text:money(p.oldPrice)}):null]),
            h("ul",null,(p.yes||[]).map(function(t){ return h("li",{text:t}); }).concat((p.no||[]).map(function(t){ return h("li",{class:"no",text:t}); })))
        ]);
        if(onPick){
            radio.addEventListener("change",function(){ onPick(p); });
        }
        return label;
    }));
}

function rulesBlock(){
    return h("div",{class:"dk-rules-wrap"},[rulesDetails(),h("div",{class:"dk-rules-actions"},[
        h("button",{type:"button",class:"dk-btn dk-ghost",onclick:openGoodWorks},[h("span",{text:"🖌️"}),h("span",{text:"Bài tập đẹp của học viên"})]),
        h("button",{type:"button",class:"dk-btn dk-ghost",onclick:openGuestbook},[h("span",{text:"📖"}),h("span",{text:"Lưu bút học viên khoá Online"})])
    ])]);
}
function rulesDetails(){
    return h("details",{class:"dk-rules"},[
        h("summary",{text:"📜 Nội quy lớp học Thanh Phong Thư Môn"}),
        h("div",{class:"dk-rules-body"},RULES.map(function(r){
            return h("div",null,[h("h5",{text:r.title}),r.intro?h("p",{text:r.intro}):null,h("ul",null,r.items.map(function(t){ return h("li",{text:t}); }))]);
        }))
    ]);
}

function enrolledFor(c){
    const list=S.enrolled||[];
    const want=[c.value,c.name].map(function(x){ return clean(x).toLowerCase(); });
    return list.filter(function(x){ return want.indexOf(clean(x.course).toLowerCase())>=0; })[0]||null;
}

function enrollArea(c){
    const wrap=h("div");
    const auth=A();
    const me=auth&&auth.me();
    const done=S.lastDone[c.id];
    if(done){ wrap.appendChild(doneBox(c,done.pack,done.text)); return wrap; }
    const already=me?enrolledFor(c):null;
    if(already){
        wrap.appendChild(h("div",{class:"dk-done"},[h("strong",{text:"✅ Bạn đã đăng ký khoá này"}),h("div",{text:"Thời gian: "+already.time+(already.package?" · "+already.package:"")}),
            h("div",{class:"dk-hint",text:"Giáo viên sẽ xếp tổ và gửi mã học viên qua email. Muốn đổi gói học, vui lòng liên hệ giáo viên."})]));
        const pack=(c.packages||[]).filter(function(p){ return p.value===already.package; })[0];
        if(pack && pack.price) wrap.appendChild(payBox(pack));
        return wrap;
    }
    const open=S.openCourse===c.id;
    const btn=h("button",{type:"button",class:"dk-btn dk-wide",text:open?"ĐÓNG BIỂU MẪU ĐĂNG KÝ":"ĐĂNG KÝ KHOÁ NÀY",onclick:function(){
        if(!me){
            const acc=$("dkAccount");
            if(acc) acc.scrollIntoView({behavior:"smooth",block:"start"});
            const m=$("dkNeedLogin-"+c.id); if(m) say(m,"Vui lòng tạo tài khoản hoặc đăng nhập ở phần trên trước khi đăng ký khoá học.","info");
            return;
        }
        S.openCourse=open?null:c.id;
        const card=$("dkCourse-"+c.id); if(card) card.replaceWith(courseCard(c));
        if(!open){ const f=document.querySelector("#dkCourse-"+c.id+" .dk-enroll"); if(f) f.scrollIntoView({behavior:"smooth",block:"start"}); }
    }});
    wrap.appendChild(h("div",{class:"dk-actions dk-enroll-cta"},[btn]));
    wrap.appendChild(h("div",{class:"dk-msg",id:"dkNeedLogin-"+c.id}));
    if(open && me) wrap.appendChild(enrollForm(c));
    return wrap;
}

function enrollForm(c){
    const auth=A(), p=S.profile||{};
    let pack=null;
    const form=h("div",{class:"dk-enroll"});
    form.appendChild(h("h5",{text:"Biểu mẫu đăng ký – "+c.name}));
    form.appendChild(h("div",{class:"dk-sub",text:"1. Chọn gói học"}));
    const packHolder=h("div");
    function drawPacks(){
        packHolder.innerHTML="";
        packHolder.appendChild(packageGrid(c,pack&&pack.value,function(p2){ pack=p2; drawPacks(); }));
    }
    drawPacks();
    form.appendChild(packHolder);
    form.appendChild(h("div",{class:"dk-sub",text:"2. Thông tin học viên"}));
    const birth=inp("text",p.birth,"dd/mm/yyyy"), address=inp("text",p.address,"Tỉnh / thành phố"), zalo=inp("text",p.zalo,"Tên hiển thị trên Zalo");
    const learnedName="dkLearned-"+c.id;
    const learned=h("div",{class:"dk-radio-group"},LEARNED.map(function(t){
        return h("label",{class:"dk-radio"},[h("input",{type:"radio",name:learnedName,value:t}),h("span",{text:t})]);
    }));
    const teacher=inp("text","","Tên thầy / nơi bạn đã học");
    const teacherField=field("Nếu đã học thư pháp trước đó thì thầy của bạn là ai?",teacher,{full:true});
    teacherField.style.display="none";
    learned.addEventListener("change",function(){
        const v=(learned.querySelector("input:checked")||{}).value;
        teacherField.style.display=v===LEARNED[1]?"":"none";
    });
    const thought=h("textarea",{class:"dk-textarea",placeholder:"Không bắt buộc"});
    form.appendChild(h("div",{class:"dk-grid"},[
        field("Họ và tên",inp("text",p.name||"","",{readOnly:true})),
        field("Số điện thoại",inp("text",p.phone||"","",{readOnly:true})),
        field("Ngày tháng năm sinh",birth,{req:true}),
        field("Địa chỉ",address,{req:true}),
        field("Tên Zalo của bạn",zalo,{req:true,hint:"Giáo viên dùng tên này để thêm bạn vào nhóm lớp."}),
        field("Đã học thư pháp trước đó hay chưa?",learned,{req:true,full:true}),
        teacherField,
        field("Theo bạn: \"Thư pháp là gì?\"",thought,{full:true})
    ]));
    if(c.teams!==false) form.appendChild(h("div",{class:"dk-team-chosen-row"},[h("span",{text:"Tổ muốn tham gia: "}),h("strong",{class:"dk-team-chosen",text:teamText()}),h("span",{class:"dk-hint",text:" (chọn ở phần Tứ tổ phía trên)"})]));
    form.appendChild(h("div",{class:"dk-sub",text:"3. Nội quy"}));
    form.appendChild(rulesDetails());
    const agree=h("input",{type:"checkbox"});
    form.appendChild(h("label",{class:"dk-check",style:"margin-top:12px"},[agree,h("span",{text:"Tôi đã đọc và đồng ý với nội quy lớp học Thanh Phong Thư Môn."})]));
    const msg=h("div",{class:"dk-msg"});
    const submit=h("button",{type:"button",class:"dk-btn dk-wide",text:"GỬI ĐĂNG KÝ"});
    form.appendChild(h("div",{class:"dk-actions"},[submit]));
    form.appendChild(msg);
    submit.onclick=async function(){
        hush(msg);
        const lv=(learned.querySelector("input:checked")||{}).value||"";
        if(!pack){ say(msg,"Vui lòng chọn gói học."); return; }
        if(!clean(birth.value)||!clean(address.value)||!clean(zalo.value)){ say(msg,"Vui lòng điền ngày sinh, địa chỉ và tên Zalo."); return; }
        if(!lv){ say(msg,"Vui lòng cho biết bạn đã học thư pháp trước đó hay chưa."); return; }
        if(!agree.checked){ say(msg,"Vui lòng đồng ý với nội quy lớp học."); return; }
        busy(submit,true,"ĐANG GỬI ĐĂNG KÝ...");
        const r=await auth.post("enroll",{token:auth.token(),fields:{
            course:c.value||c.name,package:pack.value,birth:clean(birth.value),address:clean(address.value),zalo:clean(zalo.value),
            learned:lv,teacher:lv===LEARNED[1]?clean(teacher.value):"",thought:clean(thought.value),agree:true,team:S.team||""
        }});
        busy(submit,false);
        if(!r.ok){
            say(msg,r.error||"Chưa gửi được đăng ký. Vui lòng thử lại.");
            if(r.already){ loadMine().then(renderCourses); }
            return;
        }
        S.openCourse=null;
        S.lastDone[c.id]={pack:pack,text:"Đã gửi đăng ký "+c.name+" – "+pack.name+"."};
        if(S.profile){ S.profile.birth=clean(birth.value); S.profile.address=clean(address.value); S.profile.zalo=clean(zalo.value); }
        const card=$("dkCourse-"+c.id); if(card){ const fresh=courseCard(c); card.replaceWith(fresh); fresh.scrollIntoView({behavior:"smooth",block:"start"}); }
        loadMine().catch(function(){});
    };
    return form;
}

function doneBox(c,pack,text){
    const wrap=h("div",{class:"dk-done"},[
        h("strong",{text:"✅ "+text}),
        h("div",{text:"Thư xác nhận đã được gửi tới email của bạn. Giáo viên sẽ xếp tổ và gửi mã học viên cho bạn qua email."})
    ]);
    if(pack && pack.price) wrap.appendChild(payBox(pack));
    return wrap;
}

function payBox(pack){
    const auth=A(), p=S.profile||{};
    const phone=normPhone(p.phone||"") || ((auth&&auth.me()&&auth.me().code)||"");
    const content=BANK.prefix+" "+phone;
    const qr="https://img.vietqr.io/image/"+BANK.bin+"-"+BANK.account+"-compact2.png?amount="+pack.price+"&addInfo="+encodeURIComponent(content)+"&accountName="+encodeURIComponent(BANK.holder);
    return h("div",{class:"dk-pay"},[
        h("img",{src:qr,alt:"Mã QR chuyển khoản",loading:"lazy"}),
        h("div",null,[
            h("div",{class:"dk-sub",style:"margin-top:0",text:"Chuyển khoản học phí "+pack.name}),
            h("dl",null,[
                h("dt",{text:"Ngân hàng"}),h("dd",{text:BANK.bank}),
                h("dt",{text:"Số tài khoản"}),h("dd",{text:BANK.account}),
                h("dt",{text:"Chủ tài khoản"}),h("dd",{text:BANK.holder}),
                h("dt",{text:"Số tiền"}),h("dd",{text:money(pack.price)}),
                h("dt",{text:"Nội dung"}),h("dd",{text:content})
            ]),
            h("div",{class:"dk-hint",text:"Quét mã QR bằng ứng dụng ngân hàng để điền sẵn số tiền và nội dung."})
        ])
    ]);
}

/* =========================================================
   KHỞI ĐỘNG
========================================================= */
function start(){
    const root=$(ROOT_ID); if(!root) return;
    root.innerHTML="";
    root.appendChild(h("div",{class:"dk-loading",text:"Đang tải trang đăng ký..."}));
    let tries=0;
    (function wait(){
        if(A() || tries>60){
            const auth=A();
            if(auth && auth.token()) loadMine().then(renderAll,renderAll);
            else renderAll();
            window.addEventListener("ocdAuthChanged",function(e){
                const d=e&&e.detail||{};
                if(!d.loggedIn){ S.profile=null; S.enrolled=null; renderAll(); return; }
                /* đăng nhập từ nơi khác trên trang (vd. Minh Hồng) */
                setTimeout(function(){ if(!S.profile && !S.loading && !S.busyLogin) afterLogin(""); },400);
            });
            return;
        }
        tries++; setTimeout(wait,250);
    })();
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",start,{once:true});
else start();
})();
