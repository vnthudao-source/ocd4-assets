/* =========================================================
   THƯ ĐẠO QUỐC TẾ v1.0 – Vietnamese Calligraphy (EN / VI)
   Trang Blogspot riêng cho người nước ngoài: workshop tại Việt Nam, khoá Online,
   đăng nhập (dùng chung tài khoản thudao.com qua Auth.gs), hồ sơ, nộp bài – chấm điểm,
   bài lâm mô, video hướng dẫn.
   - window.QT_CONFIG: {API:"URL /exec của Intl.gs", AUTH_API?, PAYPAL?, HOME_VI?}
   - Cần quoc-te-data.js + quoc-te-path52.js (đã gộp sẵn trong quoc-te.min.js)
   - Định tuyến bằng #: #home #workshops #online #learn/intro/N3 #learn/path52/T5 #gallery #videos #account #profile
========================================================= */
(function(){
'use strict';
if(window.QTApp) return;
window.QTApp={version:'1.0.0'};

var CFG=Object.assign({
  API:'',
  AUTH_API:'https://script.google.com/macros/s/AKfycbwtMkodKNVrUgVWhpvhwMndPZKBrdWD4OF0XoR4i5poQsxRkEDLIkm56-MTxuOCVW9JXA/exec',
  LAMMO_SHEET:'1MmqY19BSi8L6xdsF5cg1qZssrERSrqBH6nEGZjqOMLI', LAMMO_GID:179109844,
  WORKS_SHEET:'1GJoTRsbq0kZfZrDdh0uCC667PwS3Bgkje2fHQnwnCKs', WORKS_TAB:'Form Responses 1',
  THUDAO:'https://www.thudao.com'
},window.QT_CONFIG||{});
var DATA=window.QT_DATA||{intro:[],path52:[],demo:{workshops:[],packages:[],videos:[]}};
var ROOT_ID='qt-app';
var SKEY='qt_auth_v1', LKEY='qt_lang_v1';

/* ---------------- Ngôn ngữ ---------------- */
var TXT={
en:{brand:'Thư Đạo',tag:'Vietnamese Calligraphy',nav_home:'Home',nav_ws:'Workshops in Vietnam',nav_online:'Online course',nav_gallery:'Gallery',nav_videos:'Videos',
 signin:'Sign in',account:'My account',lang:'Tiếng Việt',
 hero_k:'Thư pháp Việt · Hà Nội',hero_t:'Learn Vietnamese calligraphy with brush and ink',
 hero_p:'Join a hands-on workshop while you travel in Vietnam, or follow a structured online course from home – with personal feedback from your teacher on every piece you write.',
 cta_ws:'Book a workshop',cta_online:'Start online',
 path_ws_t:'Workshops in Vietnam',path_ws_p:'Short, small-group sessions at a real studio address. All tools provided – you leave with your own finished piece.',
 path_on_t:'Online course',path_on_p:'Video lessons, step-by-step practice, and a teacher who scores and comments on every work you upload.',
 how_t:'How the online course works',how1:'Watch the lesson',how1p:'Short videos and clear written steps in English and Vietnamese.',how2:'Practise',how2p:'Write with your own brush, following the model.',
 how3:'Upload your work',how3p:'Take a photo and submit it from your account.',how4:'Get feedback',how4p:'Your teacher scores it out of 10 and tells you what to fix next.',
 teacher_t:'Your teacher',teacher_p:'Thanh Phong – Bùi Khắc Sáng is a Vietnamese calligrapher and seal carver, author of the book “Thư pháp Việt – for beginners” and founder of the Thư Đạo school, which teaches students across Vietnam online and in person.',
 upcoming:'Upcoming workshops',see_all:'See all',none_ws:'New workshop dates will be announced soon. Leave us a message and we will tell you first.',
 seats_left:'seats left',full:'Fully booked',closed:'Closed',book:'Book now',where:'Where',when:'When',price:'Price',map:'Open map',per_person:'per person',
 f_name:'Full name',f_email:'Email',f_phone:'Phone / WhatsApp',f_country:'Country',f_people:'Number of people',f_payment:'Payment',f_note:'Message (optional)',
 pay_paypal:'PayPal (USD)',pay_bank:'Vietnamese bank transfer (VND)',pay_cash:'Pay in cash at the workshop',
 send:'Send booking',sending:'Sending…',booked_t:'Booking received',booked_p:'We have emailed you the details. Your booking code:',
 pay_now:'How to pay',paypal_btn:'Pay with PayPal',paypal_later:'We will email you a PayPal payment link.',bank_note:'Transfer note',scan_qr:'Scan with any Vietnamese banking app',
 cash_p:'Please pay in cash when you arrive.',
 online_t:'Online course',online_p:'Two ways to learn: a short Foundations course, or the complete 52-week path used by our Vietnamese students.',
 pk_choose:'Enrol',pk_enrolled:'Enrolled',pk_pending:'Waiting for payment confirmation',
 intro_t:'Foundations – 8 lessons',path_t:'Complete path – 52 weeks',free:'Free preview',locked:'Locked',open_lesson:'Open',
 enrol_need_login:'Please sign in or create an account to enrol.',enrol_t:'Enrol in',choose_pay:'Choose how you would like to pay',confirm_enrol:'Confirm enrolment',
 enrol_done:'Enrolment received. Your lessons unlock as soon as your teacher confirms the payment.',
 lesson:'Lesson',week:'Week',steps:'Practice steps',task:'Your task',video:'Video',no_video:'The video for this lesson will be added soon.',
 locked_p:'This lesson is part of a paid course. Enrol to unlock the lesson, the video and the teacher’s feedback.',
 submit_t:'Submit your work for review',choose_img:'Choose a photo of your work (JPG / PNG)',upload:'Upload for review',uploading:'Uploading…',
 uploaded:'Uploaded! Your teacher will review it soon. You will receive an email with the score.',
 prev:'Previous',next:'Next',back_course:'Back to course',full_vi:'Read the full Vietnamese lesson on thudao.com',
 acc_t:'Your account',acc_p:'One account for Thư Đạo International and thudao.com.',tab_login:'Sign in',tab_reg:'Create account',
 f_id:'Email or student code',f_pw:'Password',f_pw2:'Repeat password',forgot:'Forgot password?',f_birth:'Date of birth (optional)',
 f_city:'City, country',f_msg:'WhatsApp / Zalo / Messenger',create:'Create account',otp_sent:'We sent a 6-digit code to',otp:'Verification code',verify:'Verify',
 check_spam:'Please also check your spam folder.',reset_t:'Reset password',send_code:'Send code',new_pw:'New password',reset:'Reset password',
 prof_t:'Profile',save:'Save',saved:'Saved.',my_courses:'My courses',my_work:'My submitted works',no_work:'No submissions yet.',
 score:'Score',comment:'Teacher’s comment',waiting_review:'Waiting for review',status_ACTIVE:'Active',status_PENDING:'Waiting for payment',status_CANCELLED:'Cancelled',
 change_pw:'Change password',old_pw:'Current password',logout:'Sign out',code:'Your code',
 gal_t:'Gallery',gal_students:'Student works',gal_models:'Model works (Lâm Mô)',gal_p:'Works reviewed and selected by the teacher, and model works students copy from.',
 vid_t:'Video lessons',vid_p:'Free videos are open to everyone. Course videos unlock after enrolment.',no_vids:'No videos yet.',
 loading:'Loading…',err:'Something went wrong. Please try again.',offline:'Preview mode: the booking server is not connected yet, so sample data is shown.',
 need_fields:'Please fill in your name and a valid email.',pw_short:'Password needs at least 6 characters.',pw_diff:'The two passwords do not match.',
 E_LOGIN_REQUIRED:'Please sign in again.',E_NO_ACCESS:'This lesson is not unlocked yet. Please enrol first.',E_NOT_ENOUGH_SEATS:'Not enough seats left for that many people.',
 E_WORKSHOP_CLOSED:'Booking for this workshop is closed.',E_FILE_TOO_LARGE:'The photo is too large (max 8 MB).',E_IMAGE_ONLY:'Please upload a JPG or PNG photo.',
 E_AUTH_UNAVAILABLE:'The account server is busy. Please try again in a minute.',E_NAME_EMAIL_REQUIRED:'Please fill in your name and a valid email.',
 contact:'Contact',footer:'Thư Đạo – Vietnamese calligraphy school · Hà Nội, Vietnam',close:'Close',stage:'Stage'},
vi:{brand:'Thư Đạo',tag:'Thư pháp Việt',nav_home:'Trang chủ',nav_ws:'Workshop tại Việt Nam',nav_online:'Khoá Online',nav_gallery:'Tác phẩm',nav_videos:'Video',
 signin:'Đăng nhập',account:'Tài khoản',lang:'English',
 hero_k:'Thư pháp Việt · Hà Nội',hero_t:'Học thư pháp Việt với bút lông và mực',
 hero_p:'Tham gia workshop trực tiếp khi bạn ở Việt Nam, hoặc học khoá Online có lộ trình rõ ràng tại nhà – mỗi bài viết đều được giáo viên nhận xét, chấm điểm.',
 cta_ws:'Đăng ký workshop',cta_online:'Học Online',
 path_ws_t:'Workshop tại Việt Nam',path_ws_p:'Buổi học ngắn, nhóm nhỏ, tại địa chỉ cụ thể. Có sẵn dụng cụ – bạn mang về tác phẩm của chính mình.',
 path_on_t:'Khoá học Online',path_on_p:'Video bài giảng, hướng dẫn từng bước và giáo viên chấm điểm, nhận xét mọi bài bạn nộp.',
 how_t:'Học Online như thế nào',how1:'Xem bài học',how1p:'Video ngắn và hướng dẫn chữ song ngữ Anh – Việt.',how2:'Luyện tập',how2p:'Viết bằng bút của bạn theo bài mẫu.',
 how3:'Nộp bài',how3p:'Chụp ảnh và nộp ngay trong tài khoản.',how4:'Nhận nhận xét',how4p:'Giáo viên chấm thang 10 và chỉ ra điều cần sửa.',
 teacher_t:'Giảng viên',teacher_p:'Thanh Phong – Bùi Khắc Sáng, người viết thư pháp và khắc ấn, tác giả sách “Thư pháp Việt – Cho người mới”, sáng lập Thư Đạo, dạy học viên khắp Việt Nam qua lớp Online và lớp trực tiếp.',
 upcoming:'Workshop sắp diễn ra',see_all:'Xem tất cả',none_ws:'Lịch workshop mới sẽ sớm được công bố. Hãy để lại lời nhắn, chúng tôi sẽ báo bạn đầu tiên.',
 seats_left:'chỗ còn trống',full:'Đã đủ chỗ',closed:'Đã đóng',book:'Đăng ký',where:'Địa điểm',when:'Thời gian',price:'Học phí',map:'Mở bản đồ',per_person:'mỗi người',
 f_name:'Họ và tên',f_email:'Email',f_phone:'Điện thoại / WhatsApp',f_country:'Quốc gia',f_people:'Số người',f_payment:'Thanh toán',f_note:'Lời nhắn (không bắt buộc)',
 pay_paypal:'PayPal (USD)',pay_bank:'Chuyển khoản ngân hàng (VND)',pay_cash:'Trả tiền mặt tại buổi học',
 send:'Gửi đăng ký',sending:'Đang gửi…',booked_t:'Đã nhận đăng ký',booked_p:'Thông tin chi tiết đã gửi qua email. Mã đăng ký của bạn:',
 pay_now:'Cách thanh toán',paypal_btn:'Thanh toán PayPal',paypal_later:'Giáo viên sẽ gửi link thanh toán PayPal qua email.',bank_note:'Nội dung chuyển khoản',scan_qr:'Quét bằng ứng dụng ngân hàng',
 cash_p:'Vui lòng thanh toán tiền mặt khi đến lớp.',
 online_t:'Khoá học Online',online_p:'Hai cách học: khoá Nhập môn ngắn, hoặc lộ trình đầy đủ 52 tuần như học viên Việt Nam.',
 pk_choose:'Đăng ký',pk_enrolled:'Đã ghi danh',pk_pending:'Chờ xác nhận thanh toán',
 intro_t:'Nhập môn – 8 bài',path_t:'Lộ trình đầy đủ – 52 tuần',free:'Học thử miễn phí',locked:'Chưa mở',open_lesson:'Mở bài',
 enrol_need_login:'Vui lòng đăng nhập hoặc tạo tài khoản để đăng ký.',enrol_t:'Đăng ký',choose_pay:'Chọn cách thanh toán',confirm_enrol:'Xác nhận đăng ký',
 enrol_done:'Đã nhận đăng ký. Bài học sẽ mở ngay khi giáo viên xác nhận thanh toán.',
 lesson:'Bài',week:'Tuần',steps:'Các bước luyện tập',task:'Nhiệm vụ',video:'Video',no_video:'Video của bài này sẽ sớm được bổ sung.',
 locked_p:'Bài này thuộc khoá có phí. Đăng ký để mở bài học, video và nhận xét của giáo viên.',
 submit_t:'Nộp bài để được nhận xét',choose_img:'Chọn ảnh bài viết (JPG / PNG)',upload:'Nộp bài',uploading:'Đang tải lên…',
 uploaded:'Đã nộp! Giáo viên sẽ sớm chấm bài, bạn sẽ nhận email báo điểm.',
 prev:'Bài trước',next:'Bài sau',back_course:'Về khoá học',full_vi:'Đọc bài đầy đủ trên thudao.com',
 acc_t:'Tài khoản',acc_p:'Một tài khoản dùng chung cho Thư Đạo Quốc tế và thudao.com.',tab_login:'Đăng nhập',tab_reg:'Tạo tài khoản',
 f_id:'Email hoặc mã học viên',f_pw:'Mật khẩu',f_pw2:'Nhập lại mật khẩu',forgot:'Quên mật khẩu?',f_birth:'Ngày sinh (không bắt buộc)',
 f_city:'Thành phố, quốc gia',f_msg:'WhatsApp / Zalo / Messenger',create:'Tạo tài khoản',otp_sent:'Đã gửi mã 6 số tới',otp:'Mã xác nhận',verify:'Xác nhận',
 check_spam:'Hãy kiểm tra cả thư mục Spam.',reset_t:'Đặt lại mật khẩu',send_code:'Gửi mã',new_pw:'Mật khẩu mới',reset:'Đặt lại mật khẩu',
 prof_t:'Hồ sơ',save:'Lưu',saved:'Đã lưu.',my_courses:'Khoá học của tôi',my_work:'Bài đã nộp',no_work:'Chưa có bài nộp.',
 score:'Điểm',comment:'Nhận xét của giáo viên',waiting_review:'Đang chờ chấm',status_ACTIVE:'Đang học',status_PENDING:'Chờ thanh toán',status_CANCELLED:'Đã huỷ',
 change_pw:'Đổi mật khẩu',old_pw:'Mật khẩu hiện tại',logout:'Đăng xuất',code:'Mã của bạn',
 gal_t:'Tác phẩm',gal_students:'Bài học viên',gal_models:'Bài mẫu lâm mô',gal_p:'Bài được giáo viên chọn và các bài mẫu học viên dùng để lâm mô.',
 vid_t:'Video hướng dẫn',vid_p:'Video miễn phí mở cho mọi người. Video khoá học mở sau khi ghi danh.',no_vids:'Chưa có video.',
 loading:'Đang tải…',err:'Có lỗi xảy ra, vui lòng thử lại.',offline:'Chế độ xem thử: chưa nối máy chủ đăng ký nên đang hiện dữ liệu mẫu.',
 need_fields:'Vui lòng nhập họ tên và email hợp lệ.',pw_short:'Mật khẩu cần tối thiểu 6 ký tự.',pw_diff:'Hai lần nhập mật khẩu chưa giống nhau.',
 E_LOGIN_REQUIRED:'Vui lòng đăng nhập lại.',E_NO_ACCESS:'Bài này chưa được mở. Vui lòng đăng ký khoá học.',E_NOT_ENOUGH_SEATS:'Không còn đủ chỗ cho số người này.',
 E_WORKSHOP_CLOSED:'Workshop đã đóng đăng ký.',E_FILE_TOO_LARGE:'Ảnh quá lớn (tối đa 8 MB).',E_IMAGE_ONLY:'Vui lòng chọn ảnh JPG hoặc PNG.',
 E_AUTH_UNAVAILABLE:'Máy chủ tài khoản đang bận, vui lòng thử lại sau ít phút.',E_NAME_EMAIL_REQUIRED:'Vui lòng nhập họ tên và email hợp lệ.',
 contact:'Liên hệ',footer:'Thư Đạo – Trường thư pháp Việt · Hà Nội, Việt Nam',close:'Đóng',stage:'Giai đoạn'}
};
function qLang(){ try{ var m=location.search.match(/[?&]lang=(en|vi)/); if(m) return m[1]; return localStorage.getItem(LKEY)||''; }catch(e){ return ''; } }
var S={lang:qLang()||'en',session:null,cfg:null,live:false,me:null,videos:null,route:'home'};
function t(k){ return (TXT[S.lang]&&TXT[S.lang][k])||TXT.en[k]||k; }
function L(o){ if(o==null) return ''; if(typeof o==='string') return o; return o[S.lang]||o.en||o.vi||''; }
function F(o,base){ return S.lang==='vi'?(o[base+'_vi']||o[base+'_en']||''):(o[base+'_en']||o[base+'_vi']||''); }

/* ---------------- DOM ---------------- */
function h(tag,attrs,kids){
  var e=document.createElement(tag);
  if(attrs) Object.keys(attrs).forEach(function(k){ var v=attrs[k]; if(v==null||v===false) return;
    if(k==='text') e.textContent=v; else if(k==='class') e.className=v; else if(k.slice(0,2)==='on') e[k]=v; else e.setAttribute(k,v===true?'':v); });
  [].concat(kids||[]).forEach(function(c){ if(c==null||c===false) return; e.appendChild(typeof c==='string'?document.createTextNode(c):c); });
  return e;
}
function clean(v){ return String(v==null?'':v).replace(/\s+/g,' ').trim(); }
function validEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean(v)); }
function norm(v){ return clean(v).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d'); }
function field(label,input,hint){ return h('label',{class:'qt-field'},[h('span',{class:'qt-label',text:label}),input,hint?h('small',{class:'qt-hint',text:hint}):null]); }
function inp(type,val,ph,extra){ var i=h('input',Object.assign({type:type,placeholder:ph||''},extra||{})); i.value=val||''; return i; }
function btn(text,cls,fn){ return h('button',{type:'button',class:'qt-btn '+(cls||''),text:text,onclick:fn}); }
function busy(b,on,text){ if(on){ b.dataset.t=b.textContent; b.textContent=text||t('loading'); b.disabled=true; } else { b.textContent=b.dataset.t||b.textContent; b.disabled=false; } }
function msgBox(){ return h('div',{class:'qt-msg',role:'status','aria-live':'polite'}); }
function say(box,text,ok){ box.className='qt-msg '+(ok?'ok':'err'); box.textContent=text; }
function errText(r){
  var e=(r&&r.error)||'';
  if(TXT.en['E_'+e]) return t('E_'+e);
  if(!e) return t('err');
  if(S.lang==='en' && /[À-ỹ]/.test(e)) return t('err')+' ('+e+')';
  return e;
}
function money(usd,vnd){
  var a=[]; if(clean(usd) && usd!=='—') a.push('US$'+usd); if(clean(vnd) && vnd!=='—') a.push(Number(vnd)?Number(vnd).toLocaleString('vi-VN')+' ₫':vnd);
  return a.join(' · ')||'—';
}
function fmtDate(d){
  var m=String(d||'').match(/^(\d{4})-(\d{2})-(\d{2})/); if(!m) return d||'';
  try{ return new Date(+m[1],+m[2]-1,+m[3]).toLocaleDateString(S.lang==='vi'?'vi-VN':'en-GB',{weekday:'short',day:'numeric',month:'long',year:'numeric'}); }catch(e){ return d; }
}
function driveImg(id,w){ return 'https://drive.google.com/thumbnail?id='+encodeURIComponent(id)+'&sz=w'+(w||600); }
function img(id,alt,w){
  var i=h('img',{src:driveImg(id,w),alt:alt||'',loading:'lazy',decoding:'async'});
  i.addEventListener('error',function(){ if(!i.dataset.r){ i.dataset.r='1'; i.src='https://lh3.googleusercontent.com/d/'+id+'=w'+(w||600); } else i.style.visibility='hidden'; });
  return i;
}

/* ---------------- Máy chủ ---------------- */
function postJSON(url,body,ms){
  var ac=window.AbortController?new AbortController():null, timer=setTimeout(function(){ if(ac) ac.abort(); },ms||30000);
  return fetch(url,{method:'POST',body:JSON.stringify(body),headers:{'Content-Type':'text/plain;charset=utf-8'},credentials:'omit',cache:'no-store',signal:ac?ac.signal:undefined})
    .then(function(r){ return r.text(); }).then(function(x){ return JSON.parse(x); })
    .catch(function(){ return {ok:false,error:''}; }).finally(function(){ clearTimeout(timer); });
}
function auth(action,body){ return postJSON(CFG.AUTH_API,Object.assign({action:action,device:navigator.userAgent.slice(0,100)},body||{})); }
function api(action,body,ms){ if(!CFG.API) return Promise.resolve({ok:false,error:'OFFLINE'}); return postJSON(CFG.API,Object.assign({action:action,lang:S.lang},body||{}),ms); }

/* phiên đăng nhập */
function loadSession(){ try{ var s=JSON.parse(localStorage.getItem(SKEY)||'null'); if(s&&s.token&&s.expires>Date.now()) return s; localStorage.removeItem(SKEY); }catch(e){} return null; }
function saveSession(r){ S.session={token:r.token,expires:r.expires,me:r.me}; try{ localStorage.setItem(SKEY,JSON.stringify(S.session)); }catch(e){} S.me=null; S.videos=null; }
function dropSession(){ S.session=null; S.me=null; S.videos=null; try{ localStorage.removeItem(SKEY); }catch(e){} }
function token(){ return S.session&&S.session.expires>Date.now()?S.session.token:''; }

function loadConfig(){
  if(S.cfg && !S.cfgDirty) return Promise.resolve(S.cfg);
  S.cfgDirty=false;
  if(!CFG.API){ S.cfg=demoCfg(); return Promise.resolve(S.cfg); }
  return fetch(CFG.API+'?action=config&_='+Math.floor(Date.now()/60000),{cache:'no-store',credentials:'omit'}).then(function(r){ return r.json(); })
    .then(function(j){ if(!j||!j.ok) throw new Error('cfg'); S.cfg=j; S.live=true; return j; })
    .catch(function(){ if(!S.cfg||S.cfg.demo) S.cfg=demoCfg(); return S.cfg; });
}
function demoCfg(){ return {ok:true,demo:true,workshops:DATA.demo.workshops,packages:DATA.demo.packages,settings:{bank_name:'MB Bank',bank_bin:'MB',bank_account:'0530113118888',bank_holder:'BUI KHAC SANG',contact_email:'vnthudao@gmail.com',contact_phone:'0395 021 559',contact_address:'Kim Mã, Giảng Võ, Hà Nội'},freeVideos:DATA.demo.videos||[]}; }
function loadMe(force){
  if(!token()) return Promise.resolve(null);
  if(S.me && !force) return Promise.resolve(S.me);
  return api('me',{token:token()}).then(function(r){
    if(r && r.ok){ S.me=r; return r; }
    if(r && r.error==='LOGIN_REQUIRED'){ dropSession(); renderHeader(); }
    S.me={ok:false,access:{intro:false,path52:false},enrollments:[],submissions:[]};
    return S.me;
  });
}
function loadVideos(){
  if(S.videos) return Promise.resolve(S.videos);
  var p=token()?api('videos',{token:token()}):Promise.resolve(null);
  return Promise.all([loadConfig(),p]).then(function(r){
    var list=(r[1]&&r[1].ok)?r[1].videos:((r[0]&&r[0].freeVideos)||[]);
    S.videos=list; return list;
  });
}
function access(){ return (S.me&&S.me.access)||{intro:false,path52:false}; }

/* ---------------- Khung trang ---------------- */
var root, header, main;
function mount(){
  root=document.getElementById(ROOT_ID); if(!root) return;
  root.innerHTML=''; root.className='qt'; root.setAttribute('lang',S.lang);
  header=h('header',{class:'qt-head'}); main=h('main',{class:'qt-main',id:'qt-main',tabindex:'-1'});
  root.append(header,main,footer());
  S.session=loadSession();
  renderHeader();
  window.addEventListener('hashchange',route);
  route();
}
function go(hash){ if(location.hash==='#'+hash) route(); else location.hash=hash; }
function setLang(l){ S.lang=l; try{ localStorage.setItem(LKEY,l); }catch(e){} root.setAttribute('lang',l); document.documentElement.setAttribute('lang',l); renderHeader(); route(true); var f=root.querySelector('.qt-foot'); if(f) f.replaceWith(footer()); }
function renderHeader(){
  if(!header) return;
  header.innerHTML='';
  var nav=h('nav',{class:'qt-nav','aria-label':'Main'});
  [['home','nav_home'],['workshops','nav_ws'],['online','nav_online'],['gallery','nav_gallery'],['videos','nav_videos']].forEach(function(x){
    nav.appendChild(h('a',{href:'#'+x[0],class:'qt-nav-a','data-r':x[0],text:t(x[1])}));
  });
  var me=S.session&&S.session.me;
  var acct=h('a',{href:me?'#profile':'#account',class:'qt-acct','data-r':me?'profile':'account'},[h('span',{class:'qt-dot','aria-hidden':'true',text:me?(clean(me.name).slice(0,1)||'•'):'→'}),me?(clean(me.name).split(' ').slice(-1)[0]||t('account')):t('signin')]);
  var lang=btn(t('lang'),'qt-lang',function(){ setLang(S.lang==='en'?'vi':'en'); });
  lang.setAttribute('aria-label',S.lang==='en'?'Đổi sang tiếng Việt':'Switch to English');
  var menu=btn('☰','qt-menu',function(){ header.classList.toggle('open'); });
  menu.setAttribute('aria-label','Menu');
  header.append(
    h('a',{href:'#home',class:'qt-logo'},[h('span',{class:'qt-seal','aria-hidden':'true'},[h('i',{text:'THƯ'}),h('i',{text:'ĐẠO'})]),h('span',{class:'qt-logo-t'},[h('b',{text:t('brand')}),h('small',{text:t('tag')})])]),
    menu,h('div',{class:'qt-right'},[nav,lang,acct])
  );
  markNav();
}
function markNav(){ if(!header) return; header.querySelectorAll('[data-r]').forEach(function(a){ var r=S.route.split('/')[0]; a.classList.toggle('on',a.getAttribute('data-r')===r||(r==='learn'&&a.getAttribute('data-r')==='online')); }); }
function footer(){
  var s=(S.cfg&&S.cfg.settings)||{};
  return h('footer',{class:'qt-foot'},[
    h('div',{class:'qt-wrap qt-foot-in'},[
      h('div',{},[h('b',{text:t('footer')}),h('p',{text:[s.contact_address,s.contact_phone,s.contact_email].filter(Boolean).join(' · ')||'vnthudao@gmail.com'})]),
      h('a',{href:CFG.THUDAO,class:'qt-link',text:'thudao.com',rel:'noopener'})
    ])
  ]);
}
function route(keepScroll){
  if(!main) return;
  header.classList.remove('open');
  var hs=decodeURIComponent((location.hash||'#home').slice(1))||'home';
  S.route=hs; markNav();
  var p=hs.split('/');
  main.innerHTML='';
  var view={home:vHome,workshops:vWorkshops,online:vOnline,learn:vLearn,gallery:vGallery,videos:vVideos,account:vAccount,profile:vProfile}[p[0]]||vHome;
  view(p.slice(1));
  if(keepScroll!==true){ try{ root.scrollIntoView({block:'start'}); }catch(e){} }
  try{ document.title=t('brand')+' · '+t('tag'); }catch(e){}
}
function wrap(kids,cls){ return h('div',{class:'qt-wrap '+(cls||'')},kids); }
function section(title,lead,kids,cls){ return h('section',{class:'qt-sec '+(cls||'')},[wrap([title?h('h2',{class:'qt-h2',text:title}):null,lead?h('p',{class:'qt-lead',text:lead}):null].concat(kids||[]))]); }
function loadingEl(){ return h('p',{class:'qt-muted',text:t('loading')}); }
function demoNote(){ return S.cfg&&S.cfg.demo?h('p',{class:'qt-demo',text:t('offline')}):null; }

/* ---------------- Trang chủ ---------------- */
function vHome(){
  main.append(
    h('section',{class:'qt-hero'},[wrap([
      h('div',{class:'qt-hero-txt'},[h('p',{class:'qt-kicker',text:t('hero_k')}),h('h1',{class:'qt-h1',text:t('hero_t')}),h('p',{class:'qt-hero-p',text:t('hero_p')}),
        h('div',{class:'qt-actions'},[h('a',{href:'#workshops',class:'qt-btn',text:t('cta_ws')}),h('a',{href:'#online',class:'qt-btn ghost',text:t('cta_online')})])]),
      h('div',{class:'qt-hero-art','aria-hidden':'true'},[h('span',{class:'qt-brushword',text:'Tâm'}),h('span',{class:'qt-hero-seal'},[h('i',{text:'THƯ'}),h('i',{text:'ĐẠO'})])])
    ],'qt-hero-in')]),
    section('',null,[h('div',{class:'qt-paths'},[
      h('a',{href:'#workshops',class:'qt-path'},[h('span',{class:'qt-num',text:'01'}),h('h3',{text:t('path_ws_t')}),h('p',{text:t('path_ws_p')}),h('span',{class:'qt-more',text:t('cta_ws')+' →'})]),
      h('a',{href:'#online',class:'qt-path'},[h('span',{class:'qt-num',text:'02'}),h('h3',{text:t('path_on_t')}),h('p',{text:t('path_on_p')}),h('span',{class:'qt-more',text:t('cta_online')+' →'})])
    ])]),
    section(t('how_t'),null,[h('ol',{class:'qt-steps'},[1,2,3,4].map(function(i){ return h('li',{},[h('b',{text:t('how'+i)}),h('p',{text:t('how'+i+'p')})]); }))],'qt-alt'),
    section(t('upcoming'),null,[h('div',{id:'qt-home-ws'},[loadingEl()]),h('a',{href:'#workshops',class:'qt-link',text:t('see_all')+' →'})]),
    section(t('teacher_t'),null,[h('p',{class:'qt-teacher',text:t('teacher_p')})],'qt-alt')
  );
  loadConfig().then(function(c){
    var box=document.getElementById('qt-home-ws'); if(!box) return; box.innerHTML='';
    var list=(c.workshops||[]).filter(function(w){ return w.status==='OPEN'; }).slice(0,2);
    if(!list.length){ box.appendChild(h('p',{class:'qt-muted',text:t('none_ws')})); return; }
    box.appendChild(h('div',{class:'qt-cards'},list.map(wsCard)));
  });
}

/* ---------------- Workshop ---------------- */
function vWorkshops(){
  var box=h('div',{},[loadingEl()]);
  main.append(section(t('nav_ws'),t('path_ws_p'),[box]));
  loadConfig().then(function(c){
    box.innerHTML='';
    var d=demoNote(); if(d) box.appendChild(d);
    var list=c.workshops||[];
    if(!list.length){ box.appendChild(h('p',{class:'qt-muted',text:t('none_ws')})); return; }
    box.appendChild(h('div',{class:'qt-cards'},list.map(wsCard)));
  });
}
function wsCard(w){
  var open=w.status==='OPEN';
  var left=w.left==null?'':(w.left>0?w.left+' '+t('seats_left'):t('full'));
  var card=h('article',{class:'qt-card qt-ws'+(open?'':' off')},[
    w.image?h('img',{class:'qt-ws-img',src:w.image,alt:'',loading:'lazy'}):null,
    h('p',{class:'qt-ws-date'},[h('b',{text:fmtDate(w.date)}),w.time?' · '+w.time:'']),
    h('h3',{text:F(w,'title')}),
    h('p',{text:F(w,'desc')}),
    h('dl',{class:'qt-dl'},[h('dt',{text:t('where')}),h('dd',{},[w.address||w.city||'',w.map?h('a',{href:w.map,target:'_blank',rel:'noopener',class:'qt-link',text:' '+t('map')}):null]),
      h('dt',{text:t('price')}),h('dd',{text:money(w.price_usd,w.price_vnd)+' '+(money(w.price_usd,w.price_vnd)!=='—'?t('per_person'):'')})]),
    h('div',{class:'qt-card-foot'},[h('span',{class:'qt-badge'+(open?'':' off'),text:open?left:t(w.left===0?'full':'closed')}),
      open?btn(t('book'),'',function(){ bookingModal(w); }):null])
  ]);
  return card;
}
function payChoices(name,allowCash,def){
  var wrapEl=h('div',{class:'qt-radios',role:'radiogroup'});
  var opts=[['paypal',t('pay_paypal')],['bank',t('pay_bank')]]; if(allowCash) opts.push(['cash',t('pay_cash')]);
  opts.forEach(function(o,i){
    var r=h('input',{type:'radio',name:name,value:o[0]}); if((def||opts[0][0])===o[0]) r.checked=true;
    wrapEl.appendChild(h('label',{class:'qt-radio'},[r,h('span',{text:o[1]})]));
  });
  wrapEl.value=function(){ var c=wrapEl.querySelector('input:checked'); return c?c.value:opts[0][0]; };
  return wrapEl;
}
function bookingModal(w){
  var me=S.session&&S.session.me;
  var name=inp('text',me?me.name:'','',{autocomplete:'name'}), email=inp('email',me?me.email:'','',{autocomplete:'email'}),
      phone=inp('tel','','+1 …',{autocomplete:'tel'}), country=inp('text','','',{autocomplete:'country-name'}),
      people=inp('number','1','',{min:1,max:Math.min(10,w.left||10)}), note=h('textarea',{rows:3});
  var pay=payChoices('qt-ws-pay',true,'cash'), msg=msgBox();
  var send=btn(t('send'));
  var m=modal(t('book')+' · '+F(w,'title'),[
    h('p',{class:'qt-muted',text:fmtDate(w.date)+' · '+(w.time||'')+' · '+(w.address||'')}),
    h('div',{class:'qt-grid'},[field(t('f_name'),name),field(t('f_email'),email),field(t('f_phone'),phone),field(t('f_country'),country),field(t('f_people'),people)]),
    field(t('f_payment'),pay),field(t('f_note'),note),h('div',{class:'qt-actions'},[send]),msg
  ]);
  send.onclick=function(){
    if(!clean(name.value)||!validEmail(email.value)){ say(msg,t('need_fields')); return; }
    if(!CFG.API){ say(msg,t('offline')); return; }
    busy(send,true,t('sending'));
    api('bookWorkshop',{workshopId:w.id,name:clean(name.value),email:clean(email.value),phone:clean(phone.value),country:clean(country.value),
      people:Math.max(1,parseInt(people.value,10)||1),payment:pay.value(),note:clean(note.value),token:token()}).then(function(r){
      busy(send,false);
      if(!r||!r.ok){ say(msg,errText(r)); return; }
      S.cfgDirty=true;
      m.body.innerHTML='';
      m.body.append(h('h3',{class:'qt-ok-t',text:'✓ '+t('booked_t')}),h('p',{},[t('booked_p')+' ',h('b',{text:r.bookingId})]),payBox(r.payment,r.amount,r.bookingId),
        btn(t('close'),'ghost',function(){ m.close(); if(S.route==='workshops'||S.route==='home') route(true); }));
    });
  };
  name.focus();
}
function payBox(payment,amount,ref){
  var s=(S.cfg&&S.cfg.settings)||{};
  var box=h('div',{class:'qt-pay'},[h('h4',{text:t('pay_now')})]);
  if(payment==='bank'){
    var acct=clean(s.bank_account), bin=clean(s.bank_bin);
    if(acct&&bin) box.appendChild(h('img',{class:'qt-qr',alt:'VietQR',src:'https://img.vietqr.io/image/'+encodeURIComponent(bin)+'-'+encodeURIComponent(acct)+'-compact2.png?amount='+(Number(amount)||'')+'&addInfo='+encodeURIComponent(ref)+'&accountName='+encodeURIComponent(s.bank_holder||'')}));
    box.appendChild(h('p',{class:'qt-muted',text:t('scan_qr')}));
    box.appendChild(h('dl',{class:'qt-dl'},[h('dt',{text:'Bank'}),h('dd',{text:s.bank_name||''}),h('dt',{text:'Account'}),h('dd',{text:acct+' – '+(s.bank_holder||'')}),
      h('dt',{text:t('price')}),h('dd',{text:(Number(amount)||0).toLocaleString('vi-VN')+' ₫'}),h('dt',{text:t('bank_note')}),h('dd',{},[h('b',{text:ref})])]));
  }else if(payment==='paypal'){
    var pp=clean(s.paypal_me||CFG.PAYPAL||'');
    if(pp) box.appendChild(h('a',{class:'qt-btn',href:'https://paypal.me/'+encodeURIComponent(pp)+'/'+(Number(amount)||'')+'USD',target:'_blank',rel:'noopener',text:t('paypal_btn')+' · US$'+(Number(amount)||'')}));
    else box.appendChild(h('p',{text:t('paypal_later')}));
    if(s.paypal_email) box.appendChild(h('p',{class:'qt-muted',text:'PayPal: '+s.paypal_email}));
    box.appendChild(h('p',{class:'qt-muted',text:t('bank_note')+': '+ref}));
  }else{
    box.appendChild(h('p',{text:t('cash_p')}));
  }
  return box;
}

/* ---------------- Modal ---------------- */
function modal(title,kids){
  var prev=document.activeElement;
  var body=h('div',{class:'qt-modal-body'},kids);
  var x=btn('×','qt-x',close); x.setAttribute('aria-label',t('close'));
  var box=h('div',{class:'qt-modal',role:'dialog','aria-modal':'true','aria-label':title},[h('div',{class:'qt-modal-head'},[h('h3',{text:title}),x]),body]);
  var back=h('div',{class:'qt-overlay',onclick:function(e){ if(e.target===back) close(); }},[box]);
  function key(e){ if(e.key==='Escape') close(); }
  function close(){ back.remove(); document.removeEventListener('keydown',key); try{ prev&&prev.focus(); }catch(e){} }
  document.addEventListener('keydown',key);
  root.appendChild(back);
  return {body:body,close:close};
}

/* ---------------- Khoá Online ---------------- */
function vOnline(){
  var pk=h('div',{},[loadingEl()]), intro=h('div'), path=h('div');
  main.append(section(t('online_t'),t('online_p'),[pk]),section(t('intro_t'),null,[intro],'qt-alt'),section(t('path_t'),null,[path]));
  Promise.all([loadConfig(),loadMe()]).then(function(){
    pk.innerHTML=''; var d=demoNote(); if(d) pk.appendChild(d);
    pk.appendChild(h('div',{class:'qt-cards'},(S.cfg.packages||[]).map(pkCard)));
    intro.appendChild(lessonList('intro',DATA.intro));
    path.appendChild(path52List());
  });
}
function myEnrol(pkId){ var l=(S.me&&S.me.enrollments)||[]; return l.filter(function(e){ return e.packageId===pkId&&e.status!=='CANCELLED'; })[0]; }
function pkCard(p){
  var en=myEnrol(p.id), feats=String(F(p,'features')||'').split('|').map(clean).filter(Boolean);
  return h('article',{class:'qt-card qt-pk'},[
    h('h3',{text:F(p,'name')}),
    h('p',{class:'qt-price',text:money(p.price_usd,p.price_vnd)}),
    h('ul',{class:'qt-ticks'},feats.map(function(f){ return h('li',{text:f}); })),
    h('div',{class:'qt-card-foot'},[en?h('span',{class:'qt-badge'+(en.status==='ACTIVE'?'':' off'),text:en.status==='ACTIVE'?t('pk_enrolled'):t('pk_pending')}):btn(t('pk_choose'),'',function(){ enrolModal(p); })])
  ]);
}
function enrolModal(p){
  if(!token()){ sessionStorage.setItem('qt_after','online'); var m0=modal(t('enrol_t')+' · '+F(p,'name'),[h('p',{text:t('enrol_need_login')}),h('div',{class:'qt-actions'},[h('a',{href:'#account',class:'qt-btn',text:t('signin'),onclick:function(){ m0.close(); }})])]); return; }
  var pay=payChoices('qt-en-pay',false,'paypal'), note=h('textarea',{rows:2}), msg=msgBox(), ok=btn(t('confirm_enrol'));
  var m=modal(t('enrol_t')+' · '+F(p,'name'),[h('p',{class:'qt-price',text:money(p.price_usd,p.price_vnd)}),field(t('choose_pay'),pay),field(t('f_note'),note),h('div',{class:'qt-actions'},[ok]),msg]);
  ok.onclick=function(){
    if(!CFG.API){ say(msg,t('offline')); return; }
    busy(ok,true,t('sending'));
    api('enroll',{token:token(),packageId:p.id,payment:pay.value(),note:clean(note.value)}).then(function(r){
      busy(ok,false);
      if(!r||!r.ok){ say(msg,errText(r)); if(r&&r.error==='LOGIN_REQUIRED'){ dropSession(); renderHeader(); } return; }
      S.me=null;
      m.body.innerHTML='';
      m.body.append(h('h3',{class:'qt-ok-t',text:'✓ '+t('enrol_done')}),payBox(r.payment,r.amount,r.enrollId),btn(t('close'),'ghost',function(){ m.close(); route(true); }));
    });
  };
}
function canOpen(course,l){ var a=access(); return (course==='intro'&&l.free)||a[course]; }
function lessonList(course,list){
  return h('ol',{class:'qt-lessons'},list.map(function(l){
    var open=canOpen(course,l);
    return h('li',{},[h('a',{href:'#learn/'+course+'/'+l.code,class:'qt-lesson'+(open?'':' lock')},[
      h('span',{class:'qt-lnum',text:String(l.n)}),h('span',{class:'qt-lt'},[h('b',{text:L(l.title)}),h('small',{text:L(l.summary)})]),
      h('span',{class:'qt-tagx',text:l.free?t('free'):(open?t('open_lesson'):'🔒 '+t('locked'))})])]);
  }));
}
var STAGES=[[0,13],[14,26],[27,39],[40,52]];
function path52List(){
  var out=h('div',{class:'qt-stages'});
  STAGES.forEach(function(r,i){
    var items=DATA.path52.filter(function(l){ return l.n>=r[0]&&l.n<=r[1]; });
    var d=h('details',{class:'qt-stage',open:i===0?true:null},[h('summary',{text:t('stage')+' '+(i+1)+' · '+t('week')+' '+r[0]+'–'+r[1]}),lessonList('path52',items)]);
    out.appendChild(d);
  });
  return out;
}

/* ---------------- Bài học ---------------- */
function vLearn(p){
  var course=p[0]==='path52'?'path52':'intro', list=course==='path52'?DATA.path52:DATA.intro;
  var idx=Math.max(0,list.findIndex(function(l){ return l.code===String(p[1]||'').toUpperCase(); }));
  var l=list[idx]; if(!l){ go('online'); return; }
  var box=h('div',{},[loadingEl()]);
  main.append(section('',null,[h('a',{href:'#online',class:'qt-link',text:'← '+t('back_course')}),box]));
  Promise.all([loadMe(),loadVideos()]).then(function(){
    box.innerHTML='';
    var open=canOpen(course,l);
    box.append(
      h('p',{class:'qt-kicker',text:(course==='intro'?t('intro_t'):t('path_t'))+' · '+(course==='intro'?t('lesson')+' '+l.n:(l.n?t('week')+' '+l.n:''))}),
      h('h1',{class:'qt-h1 sm',text:L(l.title)}),
      h('p',{class:'qt-lead',text:L(l.summary)})
    );
    if(!open){
      box.appendChild(h('div',{class:'qt-locked'},[h('p',{text:t('locked_p')}),h('a',{href:'#online',class:'qt-btn',text:t('pk_choose')})]));
    }else{
      var vids=(S.videos||[]).filter(function(v){ return v.course===course&&v.lesson===l.code&&v.youtube; });
      box.appendChild(h('h3',{class:'qt-h3',text:t('video')}));
      if(vids.length) vids.forEach(function(v){ box.appendChild(ytEl(v)); });
      else box.appendChild(h('p',{class:'qt-muted',text:t('no_video')}));
      if(l.steps){
        box.append(h('h3',{class:'qt-h3',text:t('steps')}),h('ol',{class:'qt-steplist'},(l.steps[S.lang]||l.steps.en).map(function(s){ return h('li',{text:s}); })));
      }
      if(course==='path52') box.appendChild(h('p',{},[h('a',{class:'qt-link',href:CFG.THUDAO+'/p/dang-ky-hoc.html',target:'_blank',rel:'noopener',text:t('full_vi')+' ↗'})]));
      if(l.task) box.append(h('h3',{class:'qt-h3',text:t('task')}),h('p',{class:'qt-task',text:L(l.task)}));
      box.appendChild(submitBox(course,l));
    }
    var nav=h('div',{class:'qt-pager'});
    if(idx>0) nav.appendChild(h('a',{class:'qt-btn ghost',href:'#learn/'+course+'/'+list[idx-1].code,text:'← '+t('prev')}));
    if(idx<list.length-1) nav.appendChild(h('a',{class:'qt-btn ghost',href:'#learn/'+course+'/'+list[idx+1].code,text:t('next')+' →'}));
    box.appendChild(nav);
  });
}
function ytEl(v){
  var id=v.youtube, title=F(v,'title');
  var b=h('button',{type:'button',class:'qt-yt','aria-label':title||'Video'},[h('img',{src:'https://i.ytimg.com/vi/'+id+'/hqdefault.jpg',alt:'',loading:'lazy'}),h('span',{class:'qt-play',text:'▶'}),title?h('span',{class:'qt-yt-t',text:title}):null]);
  b.onclick=function(){ b.replaceWith(h('div',{class:'qt-yt-frame'},[h('iframe',{src:'https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0',title:title||'Video',allow:'autoplay; encrypted-media; picture-in-picture',allowfullscreen:true})])); };
  return b;
}
function submitBox(course,l){
  var box=h('div',{class:'qt-submit'},[h('h3',{class:'qt-h3',text:t('submit_t')})]);
  if(!token()){ box.append(h('p',{text:t('enrol_need_login')}),h('a',{href:'#account',class:'qt-btn ghost',text:t('signin'),onclick:function(){ try{ sessionStorage.setItem('qt_after',S.route); }catch(e){} }})); return box; }
  var file=h('input',{type:'file',accept:'image/jpeg,image/png,image/webp'}), prev=h('div',{class:'qt-preview'}), note=h('textarea',{rows:2}), msg=msgBox(), up=btn(t('upload'));
  file.onchange=function(){ prev.innerHTML=''; var f=file.files&&file.files[0]; if(f) prev.appendChild(h('img',{src:URL.createObjectURL(f),alt:''})); };
  box.append(field(t('choose_img'),file),prev,field(t('f_note'),note),h('div',{class:'qt-actions'},[up]),msg);
  up.onclick=function(){
    var f=file.files&&file.files[0]; if(!f){ say(msg,t('choose_img')); return; }
    if(!/^image\/(jpeg|png|webp)$/.test(f.type)){ say(msg,t('E_IMAGE_ONLY')); return; }
    if(!CFG.API){ say(msg,t('offline')); return; }
    busy(up,true,t('uploading'));
    shrink(f).then(function(x){
      return api('submit',{token:token(),course:course,lesson:l.code,mime:x.mime,data:x.data,note:clean(note.value)},90000);
    }).then(function(r){
      busy(up,false);
      if(!r||!r.ok){ say(msg,errText(r)); return; }
      S.me=null; file.value=''; prev.innerHTML=''; note.value='';
      say(msg,'✓ '+t('uploaded'),true);
    }).catch(function(){ busy(up,false); say(msg,t('err')); });
  };
  return box;
}
/* thu nhỏ ảnh về cạnh dài 2000px, JPEG 0.86 */
function shrink(f){
  return new Promise(function(res,rej){
    var rd=new FileReader();
    rd.onerror=rej;
    rd.onload=function(){
      var im=new Image();
      im.onerror=function(){ res({mime:f.type,data:String(rd.result).split(',')[1]}); };
      im.onload=function(){
        var max=2000, sc=Math.min(1,max/Math.max(im.width,im.height));
        if(sc===1 && f.size<2500000){ res({mime:f.type,data:String(rd.result).split(',')[1]}); return; }
        var c=document.createElement('canvas'); c.width=Math.round(im.width*sc); c.height=Math.round(im.height*sc);
        var g=c.getContext('2d'); g.fillStyle='#fff'; g.fillRect(0,0,c.width,c.height); g.drawImage(im,0,0,c.width,c.height);
        res({mime:'image/jpeg',data:c.toDataURL('image/jpeg',0.86).split(',')[1]});
      };
      im.src=rd.result;
    };
    rd.readAsDataURL(f);
  });
}

/* ---------------- Tài khoản ---------------- */
function afterLogin(){ var to='profile'; try{ to=sessionStorage.getItem('qt_after')||'profile'; sessionStorage.removeItem('qt_after'); }catch(e){} renderHeader(); go(to); }
function vAccount(){
  if(token()){ go('profile'); return; }
  var body=h('div',{class:'qt-card qt-acc'}), tabs=h('div',{class:'qt-tabs',role:'tablist'});
  function tab(k,fn){ var b=btn(t(k),'qt-tab',function(){ tabs.querySelectorAll('.qt-tab').forEach(function(x){ x.classList.remove('on'); x.setAttribute('aria-selected','false'); }); b.classList.add('on'); b.setAttribute('aria-selected','true'); body.innerHTML=''; fn(body); }); b.setAttribute('role','tab'); tabs.appendChild(b); return b; }
  var first=tab('tab_login',loginForm); tab('tab_reg',regForm);
  main.append(section(t('acc_t'),t('acc_p'),[h('div',{class:'qt-narrow'},[tabs,body])]));
  first.click();
}
function pwField(label,ac){ var i=inp('password','','',{autocomplete:ac||'current-password'}); return {el:field(label,i),input:i}; }
function loginForm(body){
  var id=inp('text','','',{autocomplete:'username'}), pw=pwField(t('f_pw')), msg=msgBox(), b=btn(t('signin'));
  var fg=h('button',{type:'button',class:'qt-linkbtn',text:t('forgot'),onclick:function(){ body.innerHTML=''; forgotForm(body,clean(id.value)); }});
  body.append(field(t('f_id'),id),pw.el,h('div',{class:'qt-actions'},[b,fg]),msg);
  function goLogin(){
    if(!clean(id.value)||!pw.input.value){ say(msg,t('need_fields')); return; }
    busy(b,true);
    auth('authLogin',{id:clean(id.value),password:pw.input.value}).then(function(r){
      busy(b,false);
      if(!r||!r.ok){ say(msg,errText(r)); return; }
      saveSession(r); afterLogin();
    });
  }
  b.onclick=goLogin; [id,pw.input].forEach(function(x){ x.addEventListener('keydown',function(e){ if(e.key==='Enter') goLogin(); }); });
  id.focus();
}
function regForm(body){
  var name=inp('text','','',{autocomplete:'name'}), email=inp('email','','',{autocomplete:'email'}), phone=inp('tel','','+44 7700 900123',{autocomplete:'tel'}),
      city=inp('text','','',{autocomplete:'address-level2'}), chat=inp('text',''), p1=pwField(t('f_pw'),'new-password'), p2=pwField(t('f_pw2'),'new-password'), msg=msgBox(), b=btn(t('create'));
  body.append(h('div',{class:'qt-grid'},[field(t('f_name'),name),field(t('f_email'),email),field(t('f_phone'),phone),field(t('f_city'),city),field(t('f_msg'),chat),p1.el,p2.el]),h('div',{class:'qt-actions'},[b]),msg);
  b.onclick=function(){
    var ph=String(phone.value||'').replace(/\D/g,'');
    if(!clean(name.value)||!validEmail(email.value)||ph.length<8){ say(msg,t('need_fields')+' ('+t('f_phone')+')'); return; }
    if(p1.input.value.length<6){ say(msg,t('pw_short')); return; }
    if(p1.input.value!==p2.input.value){ say(msg,t('pw_diff')); return; }
    busy(b,true,t('sending'));
    auth('regStart',{name:clean(name.value),phone:ph,email:clean(email.value),password:p1.input.value,address:clean(city.value),zalo:clean(chat.value),birth:''}).then(function(r){
      busy(b,false);
      if(!r||!r.ok){ say(msg,errText(r)); return; }
      otpForm(body,clean(email.value),r.sentTo);
    });
  };
  name.focus();
}
function otpForm(body,email,sentTo){
  body.innerHTML='';
  var otp=inp('text','','______',{inputmode:'numeric',maxlength:6,autocomplete:'one-time-code'}), msg=msgBox(), b=btn(t('verify'));
  body.append(h('p',{text:t('otp_sent')+' '+(sentTo||email)+'. '+t('check_spam')}),field(t('otp'),otp),h('div',{class:'qt-actions'},[b]),msg);
  b.onclick=function(){
    if(!/^\d{6}$/.test(clean(otp.value))){ say(msg,t('otp')); return; }
    busy(b,true);
    auth('regVerify',{email:email,otp:clean(otp.value)}).then(function(r){ busy(b,false); if(!r||!r.ok){ say(msg,errText(r)); return; } saveSession(r); afterLogin(); });
  };
  otp.focus();
}
function forgotForm(body,idv){
  var id=inp('text',idv||''), msg=msgBox(), b=btn(t('send_code'));
  body.append(h('h3',{class:'qt-h3',text:t('reset_t')}),field(t('f_id'),id),h('div',{class:'qt-actions'},[b]),msg);
  b.onclick=function(){
    if(!clean(id.value)){ say(msg,t('f_id')); return; }
    busy(b,true);
    auth('authForgot',{id:clean(id.value)}).then(function(r){
      busy(b,false);
      if(!r||!r.ok||!r.sentTo){ say(msg,errText(r)); return; }
      body.innerHTML='';
      var otp=inp('text','','______',{inputmode:'numeric',maxlength:6}), p1=pwField(t('new_pw'),'new-password'), p2=pwField(t('f_pw2'),'new-password'), m2=msgBox(), b2=btn(t('reset'));
      body.append(h('p',{text:t('otp_sent')+' '+r.sentTo+'. '+t('check_spam')}),field(t('otp'),otp),p1.el,p2.el,h('div',{class:'qt-actions'},[b2]),m2);
      b2.onclick=function(){
        if(p1.input.value.length<6){ say(m2,t('pw_short')); return; } if(p1.input.value!==p2.input.value){ say(m2,t('pw_diff')); return; }
        busy(b2,true);
        auth('authReset',{id:clean(id.value),otp:clean(otp.value),password:p1.input.value}).then(function(x){ busy(b2,false); if(!x||!x.ok){ say(m2,errText(x)); return; } saveSession(x); afterLogin(); });
      };
    });
  };
}

/* ---------------- Hồ sơ ---------------- */
function vProfile(){
  if(!token()){ go('account'); return; }
  var me=S.session.me||{};
  var pBox=h('div',{class:'qt-card'},[loadingEl()]), cBox=h('div',{},[loadingEl()]), wBox=h('div',{},[loadingEl()]);
  main.append(section(t('prof_t'),null,[
    h('div',{class:'qt-profile-head'},[h('span',{class:'qt-avatar',text:clean(me.name).slice(0,1)||'•'}),h('div',{},[h('h2',{class:'qt-h2 sm',text:me.name||''}),h('p',{class:'qt-muted',text:t('code')+': '+(me.linked||me.code||'')+(me.email?' · '+me.email:'')})])]),
    h('div',{class:'qt-two'},[pBox,h('div',{},[h('h3',{class:'qt-h3',text:t('my_courses')}),cBox])]),
    h('h3',{class:'qt-h3',text:t('my_work')}),wBox,
    h('div',{class:'qt-actions'},[btn(t('change_pw'),'ghost',pwModal),btn(t('logout'),'ghost',function(){ auth('authLogout',{token:token()}); dropSession(); renderHeader(); go('home'); })])
  ]));
  auth('authProfile',{token:token()}).then(function(r){
    pBox.innerHTML='';
    if(!r||!r.ok){ if(r&&r.expired){ dropSession(); renderHeader(); go('account'); return; } pBox.appendChild(h('p',{class:'qt-msg err',text:errText(r)})); return; }
    var p=r.profile||{};
    var name=inp('text',p.name), birth=inp('text',p.birth,'dd/mm/yyyy'), city=inp('text',p.address), chat=inp('text',p.zalo), msg=msgBox(), sv=btn(t('save'));
    var isTV=/^TV/i.test(String(me.code||''));
    if(!isTV) name.readOnly=true;
    pBox.append(field(t('f_name'),name),field(t('f_email'),inp('email',p.email,'',{readonly:true})),field(t('f_phone'),inp('tel',p.phone,'',{readonly:true})),
      field(t('f_birth'),birth),field(t('f_city'),city),field(t('f_msg'),chat),h('div',{class:'qt-actions'},[sv]),msg);
    sv.onclick=function(){
      busy(sv,true);
      auth('authProfileSave',{token:token(),name:clean(name.value),birth:clean(birth.value),address:clean(city.value),zalo:clean(chat.value)}).then(function(x){
        busy(sv,false); if(!x||!x.ok){ say(msg,errText(x)); return; } say(msg,'✓ '+t('saved'),true);
        if(x.profile&&x.profile.name){ S.session.me.name=x.profile.name; try{ localStorage.setItem(SKEY,JSON.stringify(S.session)); }catch(e){} renderHeader(); }
      });
    };
  });
  Promise.all([loadConfig(),loadMe(true)]).then(function(){
    cBox.innerHTML=''; wBox.innerHTML='';
    var en=(S.me&&S.me.enrollments)||[];
    if(!en.length) cBox.append(h('p',{class:'qt-muted',text:'—'}),h('a',{href:'#online',class:'qt-btn ghost',text:t('cta_online')}));
    en.forEach(function(e){
      var pk=(S.cfg.packages||[]).filter(function(p){ return p.id===e.packageId; })[0];
      cBox.appendChild(h('div',{class:'qt-row'},[h('b',{text:pk?F(pk,'name'):e.package}),h('span',{class:'qt-badge'+(e.status==='ACTIVE'?'':' off'),text:t('status_'+e.status)||e.status}),
        e.status==='ACTIVE'?h('a',{class:'qt-link',href:'#learn/'+e.course+'/'+(e.course==='path52'?'VPTB':'N1'),text:t('open_lesson')+' →'}):null]));
    });
    var subs=(S.me&&S.me.submissions)||[];
    if(!subs.length){ wBox.appendChild(h('p',{class:'qt-muted',text:t('no_work')})); return; }
    wBox.appendChild(h('div',{class:'qt-works'},subs.map(function(s){
      return h('figure',{class:'qt-work'},[img(s.file,s.lesson,500),h('figcaption',{},[
        h('b',{text:(s.course==='path52'?t('week'):t('lesson'))+' '+s.lesson}),h('small',{text:s.time.slice(0,10)}),
        s.score!==''?h('p',{class:'qt-score'},[t('score')+': ',h('b',{text:s.score+'/10'})]):h('p',{class:'qt-muted',text:t('waiting_review')}),
        s.comment?h('p',{class:'qt-comment',text:s.comment}):null])]);
    })));
  });
}
function pwModal(){
  var o=pwField(t('old_pw')), p1=pwField(t('new_pw'),'new-password'), p2=pwField(t('f_pw2'),'new-password'), msg=msgBox(), b=btn(t('save'));
  var m=modal(t('change_pw'),[o.el,p1.el,p2.el,h('div',{class:'qt-actions'},[b]),msg]);
  b.onclick=function(){
    if(p1.input.value.length<6){ say(msg,t('pw_short')); return; } if(p1.input.value!==p2.input.value){ say(msg,t('pw_diff')); return; }
    busy(b,true);
    auth('authChangePw',{token:token(),oldPassword:o.input.value,password:p1.input.value}).then(function(r){
      busy(b,false); if(!r||!r.ok){ say(msg,errText(r)); return; }
      if(r.token){ S.session.token=r.token; S.session.expires=r.expires||S.session.expires; try{ localStorage.setItem(SKEY,JSON.stringify(S.session)); }catch(e){} }
      say(msg,'✓ '+t('saved'),true); setTimeout(m.close,900);
    });
  };
}

/* ---------------- Tác phẩm ---------------- */
function parseCsv(text){
  var rows=[],row=[],cell='',q=false; text=String(text||'').replace(/^﻿/,'');
  for(var i=0;i<text.length;i++){ var c=text[i],n=text[i+1];
    if(c==='"'&&q&&n==='"'){ cell+='"'; i++; continue; }
    if(c==='"'){ q=!q; continue; }
    if(c===','&&!q){ row.push(cell); cell=''; continue; }
    if((c==='\n'||c==='\r')&&!q){ if(c==='\r'&&n==='\n') i++; row.push(cell); rows.push(row); row=[]; cell=''; continue; }
    cell+=c; }
  if(cell!==''||row.length){ row.push(cell); rows.push(row); }
  return rows;
}
function driveId(u){ var m=String(u||'').match(/[?&]id=([\w-]{10,})|\/d\/([\w-]{10,})/); return m?(m[1]||m[2]):''; }
function csv(url){ return fetch(url,{cache:'no-store'}).then(function(r){ if(!r.ok) throw new Error('csv'); return r.text(); }).then(function(x){ if(/^\s*</.test(x)) throw new Error('csv'); return parseCsv(x); }); }
var galCache={};
function modelWorks(){
  if(galCache.m) return galCache.m;
  return (galCache.m=csv('https://docs.google.com/spreadsheets/d/'+CFG.LAMMO_SHEET+'/export?format=csv&gid='+CFG.LAMMO_GID+'&_='+Math.floor(Date.now()/600000)).then(function(rows){
    var head=(rows[0]||[]).map(norm);
    return rows.slice(1).map(function(r){ var o={}; head.forEach(function(k,i){ o[k]=clean(r[i]); }); return o; })
      .map(function(o){ return {file:driveId(o['hinh anh']),title:o['noi dung']||'',meta:[o['chu de'],o['nguoi viet']].filter(Boolean).join(' · '),week:o['tuan hoc']||''}; })
      .filter(function(x){ return x.file; });
  }).catch(function(e){ galCache.m=null; throw e; }));
}
function studentWorks(){
  if(galCache.s) return galCache.s;
  var q="select A,B,C,F,G,H,I where lower(I) contains 'ngon' order by A desc limit 40";
  var a=csv('https://docs.google.com/spreadsheets/d/'+CFG.WORKS_SHEET+'/gviz/tq?tqx=out:csv&headers=1&sheet='+encodeURIComponent(CFG.WORKS_TAB)+'&tq='+encodeURIComponent(q)+'&_='+Math.floor(Date.now()/600000))
    .then(function(rows){ return rows.slice(1).map(function(r){ return {file:driveId(r[3]),name:clean(r[1]).split(' ').slice(-1)[0],title:clean(r[4]),score:clean(r[5])}; }).filter(function(x){ return x.file; }); })
    .catch(function(){ return []; });
  var b=CFG.API?fetch(CFG.API+'?action=gallery&_='+Math.floor(Date.now()/600000),{cache:'no-store'}).then(function(r){ return r.json(); })
    .then(function(j){ return (j&&j.ok?j.list:[]).map(function(x){ return {file:x.file,name:x.name,title:x.lesson,score:x.score,intl:true}; }); }).catch(function(){ return []; }):Promise.resolve([]);
  return (galCache.s=Promise.all([b,a]).then(function(r){ var seen={}; return r[0].concat(r[1]).filter(function(x){ if(seen[x.file]) return false; seen[x.file]=1; return true; }); }));
}
function vGallery(p){
  var kind=p[0]==='models'?'models':'students';
  var tabs=h('div',{class:'qt-tabs'},[h('a',{href:'#gallery',class:'qt-tab'+(kind==='students'?' on':''),text:t('gal_students')}),h('a',{href:'#gallery/models',class:'qt-tab'+(kind==='models'?' on':''),text:t('gal_models')})]);
  var grid=h('div',{class:'qt-gallery'},[loadingEl()]);
  main.append(section(t('gal_t'),t('gal_p'),[tabs,grid]));
  (kind==='models'?modelWorks():studentWorks()).then(function(list){
    grid.innerHTML='';
    if(!list.length){ grid.appendChild(h('p',{class:'qt-muted',text:'—'})); return; }
    list.slice(0,60).forEach(function(w){
      var fig=h('figure',{class:'qt-gitem',tabindex:'0'},[img(w.file,w.title,500),h('figcaption',{},[h('b',{text:w.title||w.name||''}),h('small',{text:w.meta||(w.name&&w.title?w.name:'')})])]);
      fig.onclick=function(){ modal(w.title||w.name||t('gal_t'),[h('img',{class:'qt-big',src:driveImg(w.file,1600),alt:w.title||''}),w.meta?h('p',{class:'qt-muted',text:w.meta}):null]); };
      fig.onkeydown=function(e){ if(e.key==='Enter') fig.click(); };
      grid.appendChild(fig);
    });
  }).catch(function(){ grid.innerHTML=''; grid.appendChild(h('p',{class:'qt-msg err',text:t('err')})); });
}

/* ---------------- Video ---------------- */
function vVideos(){
  var box=h('div',{},[loadingEl()]);
  main.append(section(t('vid_t'),t('vid_p'),[box]));
  Promise.all([loadMe(),loadVideos()]).then(function(){
    box.innerHTML='';
    var list=S.videos||[];
    if(!list.length){ box.appendChild(h('p',{class:'qt-muted',text:t('no_vids')})); return; }
    box.appendChild(h('div',{class:'qt-vgrid'},list.map(function(v){
      var lessons=v.course==='path52'?DATA.path52:DATA.intro, l=lessons.filter(function(x){ return x.code===v.lesson; })[0];
      return h('div',{class:'qt-vitem'},[ytEl(v),h('p',{},[h('b',{text:F(v,'title')||(l?L(l.title):v.lesson)}),' ',l?h('a',{class:'qt-link',href:'#learn/'+v.course+'/'+v.lesson,text:'→'}):null])]);
    })));
  });
}

/* ---------------- Khởi động ---------------- */
function start(){
  var r=document.getElementById(ROOT_ID); if(!r||r.getAttribute('data-qt')) return;
  r.setAttribute('data-qt','1');
  document.documentElement.setAttribute('lang',S.lang);
  mount();
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
window.QTApp.go=go; window.QTApp.state=S;
})();
