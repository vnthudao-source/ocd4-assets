/* Thiết kế ấn triện – thudao.com.
   Trang Blogspot chỉ cần <div id="atx"></div> + window.ATX_CONFIG = { API_URL: "<URL /exec của Apps Script>" }.
   Mặt ấn: lưới ô vuông, nét đều đầu tròn (dữ liệu lưới dùng cho bộ chữ Điền thể). Thân ấn: bản trải 4 mặt. */
(function(){
'use strict';
var VERSION='1.2.0';
function decodeEnt(s){return String(s).replace(/&#(\d+);/g,function(m,n){return String.fromCharCode(+n);}).replace(/&#x([0-9a-f]+);/gi,function(m,n){return String.fromCharCode(parseInt(n,16));}).replace(/&amp;/g,'&');}
var CFG=window.ATX_CONFIG||{};
var SCRIPT_URL=decodeEnt(CFG.API_URL||'').trim();
var root=document.getElementById('atx');
if(!root){root=document.createElement('div');root.id='atx';(document.currentScript&&document.currentScript.parentNode||document.body).appendChild(root);}
root.innerHTML="<div class=\"seg tabs\" data-k=\"tab\"><button data-v=\"face\" class=\"on\">① Mặt ấn</button><button data-v=\"body\">② Thân ấn · bản in 4 mặt</button></div>\n<div class=\"viewbar\"><span class=\"hint\">Hiển thị</span><div class=\"seg\" data-k=\"view\"><button data-v=\"fit\" class=\"on\">Vừa màn hình</button><button data-v=\"real\">Kích thước thật 1:1</button></div><button id=\"atx-calbtn\" title=\"Hiệu chỉnh kích thước thật\">📏</button></div>\n<div class=\"card hide\" id=\"atx-cal\"><b>Hiệu chỉnh kích thước thật</b><p class=\"hint\" id=\"atx-caldev\"></p><p class=\"hint\">Đặt thước kẻ lên màn hình, vạch 0 trùng mép trái thước. Chỉnh cho vạch cuối của thước đỏ khớp đúng số cm ghi bên dưới.</p><div class=\"calwrap\"><canvas id=\"atx-ruler\"></canvas></div><div class=\"row\"><button id=\"atx-calm\">−</button><input type=\"range\" id=\"atx-calr\" min=\"0\" max=\"1\" step=\"0.0005\"><button id=\"atx-calp\">+</button><span class=\"val\" id=\"atx-calv\"></span></div><div class=\"btns\"><button class=\"pri\" id=\"atx-calok\">Xong</button><button id=\"atx-calreset\">Về mặc định</button></div></div>\n\n\n<!-- ================= MẶT ẤN ================= -->\n<section id=\"atx-face\"><div class=\"wrap\">\n<div class=\"card\">\n  <div class=\"row\"><label>Tên ấn</label><input type=\"text\" id=\"atx-name\" placeholder=\"VD: Thanh Phong\"></div>\n\n  <h3>Mặt ấn</h3>\n  <div class=\"row\"><label>Hình</label><div class=\"seg\" data-k=\"shape\"><button data-v=\"square\" class=\"on\">Vuông</button><button data-v=\"round\">Tròn</button></div></div>\n  <div class=\"row\"><label id=\"atx-wlab\">Ngang (cm)</label><input type=\"number\" id=\"atx-w\" value=\"2.5\" min=\"0.5\" max=\"20\" step=\"0.1\"></div>\n  <div class=\"row\" id=\"atx-hrow\"><label>Cao (cm)</label><input type=\"number\" id=\"atx-h\" value=\"2.5\" min=\"0.5\" max=\"20\" step=\"0.1\"></div>\n  <div class=\"row\"><label>Kiểu khắc</label><div class=\"seg\" data-k=\"mode\"><button data-v=\"am\" class=\"on\">Âm văn</button><button data-v=\"duong\">Dương văn</button></div></div>\n  <div class=\"row\"><label>Viền (mm)</label><input type=\"range\" id=\"atx-fr\" min=\"0\" max=\"5\" step=\"0.1\" value=\"1.2\"><span class=\"val\" id=\"atx-frv\"></span></div>\n  <div class=\"row\"><label>Cách viền (mm)</label><input type=\"range\" id=\"atx-gap\" min=\"0\" max=\"5\" step=\"0.1\" value=\"0.8\"><span class=\"val\" id=\"atx-gapv\"></span></div>\n\n  <h3>Lưới</h3>\n  <div class=\"row\"><label>Hàng × Cột</label><input type=\"number\" id=\"atx-rows\" value=\"12\" min=\"2\" max=\"80\"> × <input type=\"number\" id=\"atx-cols\" value=\"12\" min=\"2\" max=\"80\"></div>\n  <div class=\"row\"><label></label><label class=\"free\"><input type=\"checkbox\" id=\"atx-showgrid\" checked> Hiện lưới</label></div>\n\n  <h3>Nét chữ</h3>\n  <div class=\"row\"><label>Độ dày nét</label><input type=\"range\" id=\"atx-ratio\" min=\"40\" max=\"100\" step=\"1\" value=\"86\"><span class=\"val\" id=\"atx-ratiov\"></span></div>\n  <div class=\"row\"><label>Đầu nét</label><div class=\"seg\" data-k=\"cap\"><button data-v=\"round\" class=\"on\">Tròn</button><button data-v=\"square\">Vuông</button></div></div>\n  <div class=\"row\"><label>Góc gập</label><div class=\"seg\" data-k=\"join\"><button data-v=\"round\" class=\"on\">Tròn</button><button data-v=\"square\">Vuông</button></div></div>\n  <div class=\"row\"><label>Nối chéo</label><label class=\"free\"><input type=\"checkbox\" id=\"atx-diag\"> Nối 2 ô chéo nhau</label></div>\n\n  <h3>Công cụ</h3>\n  <div class=\"row\"><div class=\"seg\" data-k=\"tool\"><button data-v=\"toggle\" class=\"on\">Chấm / bỏ</button><button data-v=\"paint\">Chỉ tô</button><button data-v=\"erase\">Chỉ xoá</button><button data-v=\"curve\">Nét cong</button></div></div>\n  <div id=\"atx-curvebar\" class=\"hide\"><p class=\"hint\">Chạm lần lượt các điểm (tâm ô hoặc giao lưới) – nét cong sẽ đi trơn qua các điểm. Chạm 2 lần vào cùng một điểm để tạo góc gãy. Kéo một điểm để chỉnh. Chạm vào nét cong đã xong để sửa lại.</p><div class=\"btns\"><button class=\"pri\" id=\"atx-cdone\">✔ Xong nét</button><button id=\"atx-cclose\">◯ Khép kín</button><button id=\"atx-cback\">⌫ Bỏ điểm cuối</button><button id=\"atx-cdel\">Xoá nét này</button></div></div>\n  <div class=\"row\"><label>Đối xứng</label><select id=\"atx-sym\"><option value=\"none\">Không</option><option value=\"lr\">Trái – phải</option><option value=\"tb\">Trên – dưới</option><option value=\"both\">Cả hai</option></select></div>\n  <div class=\"btns\"><button id=\"atx-undo\">↶ Hoàn tác</button><button id=\"atx-clear\">Xoá hết</button></div>\n  <div class=\"btns\"><span class=\"hint\" style=\"align-self:center;margin:0 4px 0 0\">Dịch hình:</span><button data-sh=\"0,-1\">←</button><button data-sh=\"-1,0\">↑</button><button data-sh=\"1,0\">↓</button><button data-sh=\"0,1\">→</button></div>\n\n  <h3>Chốt &amp; lưu</h3>\n  <div class=\"btns\"><button class=\"pri\" id=\"atx-confirm\" style=\"flex:1\">✔ Chốt ấn · lưu Drive &amp; in</button></div>\n  <div class=\"btns\"><button id=\"atx-print\">In thử</button><button id=\"atx-png\">Tải PNG</button><button id=\"atx-json\">Tải dữ liệu</button><button id=\"atx-openjson\">Mở tệp…</button></div>\n  <input type=\"file\" id=\"atx-jsonfile\" accept=\".json,application/json\" class=\"hide\">\n  <div class=\"row\"><select id=\"atx-saved\"><option value=\"\">— Ấn đã lưu trên Drive —</option></select><button id=\"atx-loadlist\">Tải</button></div>\n  <details><summary>Cài đặt lưu</summary><div class=\"row\"><label>Mã lưu</label><input type=\"password\" id=\"atx-key\" placeholder=\"(nếu đã đặt AT_KEY)\"></div></details>\n  <div class=\"msg\" id=\"atx-msg\"></div>\n</div>\n\n<div class=\"stage\" id=\"atx-stage-face\">\n  <canvas class=\"ed\" id=\"atx-ed\"></canvas>\n  <div class=\"info\" id=\"atx-info\"></div>\n  <div class=\"prev\">\n    <figure><canvas id=\"atx-pv1\"></canvas>Dấu in · kích thước thật</figure>\n    <figure><canvas id=\"atx-pv2\"></canvas>Mặt khắc (lật ngược)</figure>\n  </div>\n</div>\n</div></section>\n\n<!-- ================= THÂN ẤN ================= -->\n<section id=\"atx-body\" class=\"hide\"><div class=\"wrap\">\n<div class=\"card\">\n  <div class=\"row\"><label>Tên</label><input type=\"text\" id=\"atx-bname\" placeholder=\"Mặc định lấy tên ấn\"></div>\n  <h3>Kích thước thân ấn</h3>\n  <div class=\"row\"><label>Ngang (cm)</label><input type=\"number\" id=\"atx-bw\" value=\"2\" min=\"0.5\" max=\"30\" step=\"0.1\"></div>\n  <div class=\"row\"><label>Sâu (cm)</label><input type=\"number\" id=\"atx-bd\" value=\"2\" min=\"0.5\" max=\"30\" step=\"0.1\"></div>\n  <div class=\"row\"><label>Cao (cm)</label><input type=\"number\" id=\"atx-bh\" value=\"5\" min=\"0.5\" max=\"30\" step=\"0.1\"></div>\n  <div class=\"row\"><label></label><label class=\"free\"><input type=\"checkbox\" id=\"atx-btab\" checked> Thêm mép dán 0,6 cm</label></div>\n\n  <h3>Ảnh</h3>\n  <div class=\"row\"><div class=\"seg\" data-k=\"bmode\"><button data-v=\"one\" class=\"on\">1 ảnh quấn 4 mặt</button><button data-v=\"four\">Mỗi mặt 1 ảnh</button></div></div>\n  <div class=\"row hide\" id=\"atx-bfacerow\"><div class=\"seg\" data-k=\"bface\"><button data-v=\"0\" class=\"on\">Trước</button><button data-v=\"1\">Phải</button><button data-v=\"2\">Sau</button><button data-v=\"3\">Trái</button></div></div>\n  <div class=\"btns\"><button class=\"pri\" id=\"atx-bpick\" style=\"flex:1\">Chọn ảnh…</button></div>\n  <input type=\"file\" id=\"atx-bfile\" accept=\"image/*\" class=\"hide\">\n  <div class=\"row\"><label>Cỡ ảnh</label><input type=\"range\" id=\"atx-bscale\" min=\"10\" max=\"400\" step=\"1\" value=\"100\"><span class=\"val\" id=\"atx-bscalev\">100%</span></div>\n  <div class=\"btns\"><button id=\"atx-brot\">⟳ Xoay 90°</button><button id=\"atx-bflip\">⇋ Lật</button><button id=\"atx-bcover\">Phủ kín</button><button id=\"atx-bcontain\">Vừa trong</button><button id=\"atx-bcenter\">Căn giữa</button><button id=\"atx-bdel\">Bỏ ảnh</button></div>\n  <div class=\"btns hide\" id=\"atx-ballrow\"><button id=\"atx-ball\">Dùng ảnh này cho cả 4 mặt</button></div>\n  <p class=\"hint\">Kéo ảnh trên bản vẽ để căn chỉnh. Lăn chuột hoặc chụm 2 ngón để phóng to, thu nhỏ.</p>\n\n  <h3>Lưu &amp; in</h3>\n  <div class=\"btns\"><button class=\"pri\" id=\"atx-bconfirm\" style=\"flex:1\">✔ Lưu Drive &amp; in</button></div>\n  <div class=\"btns\"><button id=\"atx-bprint\">In thử</button><button id=\"atx-bpng\">Tải PNG</button></div>\n  <div class=\"msg\" id=\"atx-bmsg\"></div>\n</div>\n<div class=\"stage\" id=\"atx-stage-body\">\n  <canvas class=\"ed\" id=\"atx-bed\" style=\"cursor:move\"></canvas>\n  <div class=\"info\" id=\"atx-binfo\"></div>\n</div>\n</div></section>\n<p class=\"ver\">Thiết kế ấn triện · phiên bản "+VERSION+"</p>";

var RED='#b8261c', PAPER='#ffffff', DPI=600;
function $(id){return document.getElementById('atx-'+id);}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function num(id,d){var v=parseFloat(String($(id).value).replace(',','.'));return isFinite(v)?v:d;}
function fmt(n){return (Math.round(n*100)/100).toString().replace('.',',');}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function safeName(s){return String(s||'an-trien').trim().replace(/[\\\/:*?"<>|]+/g,'_')||'an-trien';}
function dpr(){return Math.min(window.devicePixelRatio||1,3);}
function stamp(){var d=new Date();function p(n){return(n<10?'0':'')+n;}return p(d.getDate())+'/'+p(d.getMonth()+1)+'/'+d.getFullYear()+' '+p(d.getHours())+':'+p(d.getMinutes());}

function segOn(k,cb){root.querySelector('.seg[data-k="'+k+'"]').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;setSeg(k,b.getAttribute('data-v'));cb(b.getAttribute('data-v'));});}
function setSeg(k,v){Array.prototype.forEach.call(root.querySelectorAll('.seg[data-k="'+k+'"] button'),function(b){b.classList.toggle('on',b.getAttribute('data-v')===String(v));});}

function say(el,html,err){el.innerHTML=html;el.classList.toggle('err',!!err);}
function getKey(){var v=$('key').value;try{if(v)localStorage.setItem('atx-key',v);else v=localStorage.getItem('atx-key')||'';}catch(_){}return v||'';}
try{$('key').value=localStorage.getItem('atx-key')||'';}catch(_){}
function hasURL(){return /^https:\/\//.test(SCRIPT_URL);}
function post(payload){
  if(!hasURL())return Promise.reject(new Error('trang chưa có API_URL trong ATX_CONFIG'));
  payload.key=getKey();
  return fetch(SCRIPT_URL,{method:'POST',body:JSON.stringify(payload)}).then(function(r){return r.json();}).then(function(j){if(!j.ok)throw new Error(j.error||'lỗi máy chủ');return j;});
}
function download(blobOrUrl,name){var a=document.createElement('a');a.href=typeof blobOrUrl==='string'?blobOrUrl:URL.createObjectURL(blobOrUrl);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){a.remove();},500);}

function printHTML(title,body,landscape){
  var f=document.createElement('iframe');
  f.style.cssText='position:fixed;right:0;bottom:0;width:0;height:0;border:0';
  document.body.appendChild(f);
  var d=f.contentWindow.document;
  d.open();
  d.write('<!doctype html><html><head><meta charset="utf-8"><title>'+esc(title)+'</title><style>@page{size:A4 '+(landscape?'landscape':'portrait')+';margin:12mm}body{font-family:Arial,Helvetica,sans-serif;color:#222;margin:0}h1{font-size:15pt;margin:0 0 2mm}.meta{font-size:9.5pt;color:#555;margin-bottom:7mm;line-height:1.5}.row{display:flex;flex-wrap:wrap;gap:12mm;align-items:flex-end;margin-bottom:9mm}figure{margin:0;text-align:center;font-size:8.5pt;color:#555}img{display:block;margin:0 auto 2mm;-webkit-print-color-adjust:exact;print-color-adjust:exact}</style></head><body>'+body+'</body></html>');
  d.close();
  var imgs=d.images,left=imgs.length;
  function go(){setTimeout(function(){f.contentWindow.focus();f.contentWindow.print();setTimeout(function(){f.remove();},60000);},200);}
  if(!left)return go();
  Array.prototype.forEach.call(imgs,function(im){if(im.complete){if(--left===0)go();}else im.onload=im.onerror=function(){if(--left===0)go();};});
}

/* ---------- Kích thước thật trên màn hình ----------
   Số điểm ảnh web (CSS px) cho 1 cm = ppi / devicePixelRatio / 2,54.
   iPhone có ppi cố định theo đời máy -> tự nhận; máy khác (hoặc bật Phóng to màn hình) -> hiệu chỉnh bằng thước, lưu trong máy. */
var CAL_KEY='atx-pxcm-v1',view='fit';
try{if(localStorage.getItem('atx-view')==='real')view='real';}catch(_){}
function detectDev(){
  var d=window.devicePixelRatio||1,w=Math.min(screen.width,screen.height),h=Math.max(screen.width,screen.height),ua=navigator.userAgent||'',key=w+'x'+h+'@'+d;
  var IP={'320x568@2':326,'375x667@2':326,'414x736@3':461,'375x812@3':458,'414x896@2':326,'414x896@3':458,'360x780@3':476,'390x844@3':460,'428x926@3':458,'393x852@3':460,'430x932@3':460,'402x874@3':460,'440x956@3':460,'420x912@3':460};
  var NAME={'430x932@3':'iPhone 14 Pro Max / 15 Plus / 15 Pro Max / 16 Plus','440x956@3':'iPhone 16 Pro Max / 17 Pro Max','393x852@3':'iPhone 14 Pro / 15 / 15 Pro / 16','402x874@3':'iPhone 16 Pro / 17 / 17 Pro','390x844@3':'iPhone 12 / 13 / 14','428x926@3':'iPhone 12 Pro Max / 13 Pro Max / 14 Plus','420x912@3':'iPhone Air'};
  if(/iPhone/.test(ua)){var ppi=IP[key];if(ppi)return{v:ppi/d/2.54,name:(NAME[key]||'iPhone')+' ('+key+', '+ppi+' ppi)',known:true};return{v:(d>=3?460:326)/d/2.54,name:'iPhone '+key+' – chưa có trong bảng, nên hiệu chỉnh',known:false};}
  if(/iPad|Macintosh/.test(ua)&&'ontouchend' in document)return{v:264/d/2.54,name:'iPad ('+key+') – nên hiệu chỉnh',known:false};
  return{v:96/2.54,name:'Chưa nhận ra thiết bị ('+key+') – hãy hiệu chỉnh bằng thước',known:false};
}
var DEV=detectDev();
function vvScale(){return(window.visualViewport&&visualViewport.scale)||1;}
function baseCm(){try{var v=parseFloat(localStorage.getItem(CAL_KEY));if(v>5&&v<400)return v;}catch(_){}return DEV.v;}
function pxcm(){return baseCm()/vvScale();}  /* CSS px cho 1 cm thật, kể cả khi đang chụm phóng to trang */
function redrawAll(){if($('body').classList.contains('hide'))drawFace();else drawBody();if(!$('cal').classList.contains('hide'))drawRuler();}
function drawRuler(){
  var cv=$('ruler'),k=dpr(),pc=pxcm(),avail=($('cal').clientWidth||300)-30,n=Math.max(1,Math.min(10,Math.floor(avail/pc)));
  cv.width=Math.round((n*pc+2)*k);cv.height=Math.round(54*k);cv.style.width=(n*pc+2)+'px';cv.style.height='54px';
  var x=cv.getContext('2d');x.scale(k,k);x.fillStyle='#fff';x.fillRect(0,0,n*pc+2,54);x.strokeStyle=RED;x.fillStyle=RED;x.lineWidth=1;x.font='11px Arial';x.textAlign='center';
  x.beginPath();x.moveTo(1,.5);x.lineTo(n*pc+1,.5);x.stroke();
  for(var i=0;i<=n*10;i++){var px=1+i*pc/10,len=i%10===0?22:i%5===0?14:8;x.beginPath();x.moveTo(px,0);x.lineTo(px,len);x.stroke();if(i%10===0)x.fillText(String(i/10),Math.min(Math.max(px,6),n*pc-4),36);}
  x.textAlign='left';x.fillText('cm',2,50);
  var r=$('calr'),lo=DEV.v*.7,hi=DEV.v*1.3;r.value=(baseCm()-lo)/(hi-lo);
  $('calv').textContent=fmt(baseCm())+' px/cm';
  $('caldev').textContent='Máy: '+DEV.name+(function(){try{return localStorage.getItem(CAL_KEY)?' · đã hiệu chỉnh tay':' · đang dùng giá trị tự nhận';}catch(_){return'';}})();
}
function setCal(v){try{localStorage.setItem(CAL_KEY,String(clamp(v,6,390)));}catch(_){}redrawAll();}
setSeg('view',view);
segOn('view',function(v){view=v;try{localStorage.setItem('atx-view',v);}catch(_){}redrawAll();});
$('calbtn').addEventListener('click',function(){$('cal').classList.toggle('hide');drawRuler();});
$('calok').addEventListener('click',function(){$('cal').classList.add('hide');});
$('calreset').addEventListener('click',function(){try{localStorage.removeItem(CAL_KEY);}catch(_){}redrawAll();});
$('calr').addEventListener('input',function(){var lo=DEV.v*.7,hi=DEV.v*1.3;setCal(lo+(hi-lo)*parseFloat(this.value));});
$('calm').addEventListener('click',function(){setCal(baseCm()*.998);});
$('calp').addEventListener('click',function(){setCal(baseCm()*1.002);});
if(window.visualViewport)visualViewport.addEventListener('resize',function(){clearTimeout(window.__atxvv);window.__atxvv=setTimeout(redrawAll,120);});

/* ---------- Tabs ---------- */
segOn('tab',function(v){$('face').classList.toggle('hide',v!=='face');$('body').classList.toggle('hide',v!=='body');if(v==='body')drawBody();else drawFace();});

/* =====================================================
   MẶT ẤN
   ===================================================== */
var S={shape:'square',w:2.5,h:2.5,mode:'am',rows:12,cols:12,ratio:.86,cap:'round',join:'round',diag:false,frameMm:1.2,gapMm:.8};
var grid=new Uint8Array(S.rows*S.cols),hist=[],tool='toggle',sym='none',showGrid=true,hover=null,drag=null,edG=null,saved=[];
/* Nét cong: mỗi nét là {p:[[x,y,goc],...],closed}; x,y tính theo đơn vị ô (0..cols, 0..rows), bước 0,5 ô */
var curves=[],curC=null,cHover=null,cDrag=null;

function sealH(){return S.shape==='round'?S.w:S.h;}
var at=function(r,c){return(r>=0&&c>=0&&r<S.rows&&c<S.cols)?grid[r*S.cols+c]:0;};
function strokes(){return count()+curves.length+(curC&&curC.p.length>1?1:0);}
function count(){var n=0;for(var i=0;i<grid.length;i++)n+=grid[i];return n;}

function geo(ppc){
  var W=S.w*ppc,H=sealH()*ppc,fr=S.frameMm/10*ppc,ins=fr+S.gapMm/10*ppc,g={W:W,H:H,fr:fr,ins:ins};
  if(S.shape==='round'){g.R=Math.max(W/2-ins,W*.05);g.cell=Math.min(2*g.R/S.cols,2*g.R/S.rows);}
  else g.cell=Math.min(Math.max(W-2*ins,W*.1)/S.cols,Math.max(H-2*ins,H*.1)/S.rows);
  g.gx=(W-g.cell*S.cols)/2;g.gy=(H-g.cell*S.rows)/2;
  return g;
}
function active(g,r,c){
  if(S.shape!=='round')return true;
  var x=g.gx+(c+.5)*g.cell-g.W/2,y=g.gy+(r+.5)*g.cell-g.H/2;
  return Math.sqrt(x*x+y*y)+g.cell*.3<=g.R;
}
function shapePath(ctx,g,ins){
  ctx.beginPath();
  if(S.shape==='round')ctx.arc(g.W/2,g.H/2,Math.max(0,g.W/2-ins),0,Math.PI*2);
  else ctx.rect(ins,ins,Math.max(0,g.W-2*ins),Math.max(0,g.H-2*ins));
}

/* Dựng nét: mỗi ô tô là một "điểm nét" ở tâm ô; các ô kề nhau được nối bằng
   đoạn thẳng cùng bề dày. Đầu nét (ô có ≤1 ô nối) dùng kiểu "Đầu nét",
   chỗ gập / rẽ nhánh dùng kiểu "Góc gập". Nét đều tuyệt đối. */
function links(r,c){
  var L=[];
  if(at(r,c-1))L.push([r,c-1]);if(at(r,c+1))L.push([r,c+1]);
  if(at(r-1,c))L.push([r-1,c]);if(at(r+1,c))L.push([r+1,c]);
  if(S.diag){
    [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(function(d){
      if(at(r+d[0],c+d[1])&&!at(r+d[0],c)&&!at(r,c+d[1]))L.push([r+d[0],c+d[1]]);
    });
  }
  return L;
}
function drawStrokes(ctx,g,ink){
  var at0=at;at=function(r,c){return at0(r,c)&&active(g,r,c)?1:0;};
  try{drawStrokes0(ctx,g,ink);}finally{at=at0;}
}
function drawStrokes0(ctx,g,ink){
  var cs=g.cell,lw=cs*S.ratio,h=lw/2,r,c,x,y,L,i;
  function X(c){return g.gx+(c+.5)*cs;}function Y(r){return g.gy+(r+.5)*cs;}
  ctx.strokeStyle=ink;ctx.fillStyle=ink;ctx.lineWidth=lw;ctx.lineCap='butt';ctx.lineJoin='miter';
  ctx.beginPath();
  for(r=0;r<S.rows;r++)for(c=0;c<S.cols;c++){
    if(!at(r,c))continue;L=links(r,c);x=X(c);y=Y(r);
    for(i=0;i<L.length;i++){var q=L[i];if(q[0]>r||(q[0]===r&&q[1]>c)){ctx.moveTo(x,y);ctx.lineTo(X(q[1]),Y(q[0]));}}
  }
  ctx.stroke();
  ctx.beginPath();
  for(r=0;r<S.rows;r++)for(c=0;c<S.cols;c++){
    if(!at(r,c))continue;L=links(r,c);x=X(c);y=Y(r);
    var st=L.length<=1?S.cap:S.join;
    if(st==='round'){ctx.moveTo(x+h,y);ctx.arc(x,y,h,0,Math.PI*2);}
    else ctx.rect(x-h,y-h,lw,lw);
  }
  ctx.fill();
}
function curvePath(ctx,g,c){
  var P=c.p,n=P.length,cs=g.cell;if(n<2)return;
  function X(x){return g.gx+x*cs;}function Y(y){return g.gy+y*cs;}
  function Q(i){return c.closed?P[(i+n)%n]:P[clamp(i,0,n-1)];}
  ctx.moveTo(X(P[0][0]),Y(P[0][1]));
  var segs=c.closed?n:n-1;
  for(var i=0;i<segs;i++){
    var p0=Q(i-1),p1=Q(i),p2=Q(i+1),p3=Q(i+2);
    /* Catmull-Rom -> Bézier; điểm góc (goc=1) không có tiếp tuyến nên tạo góc gãy */
    var a=p1[2]?[p1[0],p1[1]]:[p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6];
    var b=p2[2]?[p2[0],p2[1]]:[p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6];
    ctx.bezierCurveTo(X(a[0]),Y(a[1]),X(b[0]),Y(b[1]),X(p2[0]),Y(p2[1]));
  }
  if(c.closed)ctx.closePath();
}
function strokeCurve(ctx,g,c,ink){
  var lw=g.cell*S.ratio,P=c.p;
  ctx.strokeStyle=ink;ctx.fillStyle=ink;ctx.lineWidth=lw;
  ctx.lineCap=S.cap==='round'?'round':'square';ctx.lineJoin=S.join==='round'?'round':'miter';ctx.miterLimit=4;
  if(P.length===1){var x=g.gx+P[0][0]*g.cell,y=g.gy+P[0][1]*g.cell;ctx.beginPath();if(S.cap==='round')ctx.arc(x,y,lw/2,0,Math.PI*2);else ctx.rect(x-lw/2,y-lw/2,lw,lw);ctx.fill();return;}
  ctx.beginPath();curvePath(ctx,g,c);ctx.stroke();
}
function drawCurves(ctx,g,ink){curves.forEach(function(c){strokeCurve(ctx,g,c,ink);});}
function drawCurveEdit(ctx,g,am){
  if(!curC)return;var cs=g.cell,k=Math.max(1,cs*.06);
  ctx.save();ctx.globalAlpha=.75;strokeCurve(ctx,g,curC,am?PAPER:RED);ctx.restore();
  var P=curC.p,last=P[P.length-1];
  if(last&&cHover&&!cDrag&&!curC.closed){ctx.save();ctx.strokeStyle='#1d6fd8';ctx.lineWidth=k*1.5;ctx.setLineDash([cs*.15,cs*.12]);ctx.beginPath();ctx.moveTo(g.gx+last[0]*cs,g.gy+last[1]*cs);ctx.lineTo(g.gx+cHover[0]*cs,g.gy+cHover[1]*cs);ctx.stroke();ctx.restore();}
  P.forEach(function(p,i){
    var x=g.gx+p[0]*cs,y=g.gy+p[1]*cs,r=Math.max(4,cs*.18);
    ctx.beginPath();if(p[2])ctx.rect(x-r,y-r,2*r,2*r);else ctx.arc(x,y,r,0,Math.PI*2);
    ctx.fillStyle=i===P.length-1?'#1d6fd8':'#fff';ctx.fill();ctx.lineWidth=k*1.5;ctx.strokeStyle='#1d6fd8';ctx.stroke();
  });
}
function drawGrid(ctx,g,am,hv){
  var cs=g.cell,r,c,i;
  ctx.save();if(S.shape==='round'){shapePath(ctx,g,0);ctx.clip();}
  if(S.shape==='round'){
    ctx.fillStyle=am?'rgba(0,0,0,.2)':'rgba(0,0,0,.06)';
    for(r=0;r<S.rows;r++)for(c=0;c<S.cols;c++)if(!active(g,r,c))ctx.fillRect(g.gx+c*cs,g.gy+r*cs,cs,cs);
  }
  ctx.lineWidth=Math.max(1,cs*.03);
  ctx.strokeStyle=am?'rgba(255,255,255,.32)':'rgba(120,90,60,.25)';
  ctx.beginPath();
  for(i=0;i<=S.cols;i++){ctx.moveTo(g.gx+i*cs,g.gy);ctx.lineTo(g.gx+i*cs,g.gy+S.rows*cs);}
  for(i=0;i<=S.rows;i++){ctx.moveTo(g.gx,g.gy+i*cs);ctx.lineTo(g.gx+S.cols*cs,g.gy+i*cs);}
  ctx.stroke();
  ctx.strokeStyle=am?'rgba(255,255,255,.6)':'rgba(184,38,28,.4)';
  ctx.setLineDash([cs*.18,cs*.18]);ctx.beginPath();
  ctx.moveTo(g.W/2,g.gy);ctx.lineTo(g.W/2,g.gy+S.rows*cs);ctx.moveTo(g.gx,g.H/2);ctx.lineTo(g.gx+S.cols*cs,g.H/2);
  ctx.stroke();ctx.setLineDash([]);
  if(hv){ctx.strokeStyle='#1d6fd8';ctx.lineWidth=Math.max(1.5,cs*.08);ctx.strokeRect(g.gx+hv[1]*cs,g.gy+hv[0]*cs,cs,cs);}
  ctx.restore();
}
function renderFace(ctx,ppc,o){
  o=o||{};var g=geo(ppc),am=S.mode==='am';
  ctx.save();
  if(o.mirror){ctx.translate(g.W,0);ctx.scale(-1,1);}
  shapePath(ctx,g,0);ctx.fillStyle=am?RED:PAPER;ctx.fill();
  if(!am&&g.fr>0){shapePath(ctx,g,0);ctx.fillStyle=RED;ctx.fill();shapePath(ctx,g,g.fr);ctx.fillStyle=PAPER;ctx.fill();}
  ctx.save();shapePath(ctx,g,am?g.fr:0);ctx.clip();drawStrokes(ctx,g,am?PAPER:RED);drawCurves(ctx,g,am?PAPER:RED);ctx.restore();
  if(o.grid)drawGrid(ctx,g,am,o.hover);
  if(o.edit)drawCurveEdit(ctx,g,am);
  if(o.outline&&(!am||g.fr===0)){shapePath(ctx,g,.5);ctx.lineWidth=1;ctx.strokeStyle='rgba(0,0,0,.28)';ctx.stroke();}
  ctx.restore();
  return g;
}
function faceCanvas(dpi,o,widthCm){
  var ppc=(widthCm?widthCm/S.w:1)*dpi/2.54,g=geo(ppc),cv=document.createElement('canvas');
  cv.width=Math.round(g.W);cv.height=Math.round(g.H);renderFace(cv.getContext('2d'),ppc,o||{});return cv;
}

var ed=$('ed'),edx=ed.getContext('2d');
function drawFace(){
  var box=$('stage-face'),avail=Math.min((box.clientWidth||400)-28,540);if(avail<160)avail=300;
  var real=view==='real',k=dpr(),ppc=(real?pxcm():avail/Math.max(S.w,sealH()))*k,g=geo(ppc);
  ed.classList.toggle('real',real);box.classList.toggle('wide',real&&g.W/k>(box.clientWidth||400)-28);
  ed.width=Math.round(g.W);ed.height=Math.round(g.H);ed.style.width=(g.W/k)+'px';ed.style.height=(g.H/k)+'px';
  edG=renderFace(edx,ppc,{grid:showGrid,outline:true,hover:tool==='curve'?null:hover,edit:true});
  var cellMm=edG.cell/ppc*10;
  $('info').textContent='Ô lưới '+fmt(cellMm)+' mm · nét dày '+fmt(cellMm*S.ratio)+' mm · đã tô '+count()+' ô'+(curves.length?' · '+curves.length+' nét cong':'');
  drawPreview();
}
function drawPreview(){
  var pc=pxcm(),k=dpr(),ppc=pc*k;
  [['pv1',false],['pv2',true]].forEach(function(p){
    var cv=$(p[0]),g=geo(ppc);cv.width=Math.round(g.W);cv.height=Math.round(g.H);
    cv.style.width=(S.w*pc)+'px';cv.style.height=(sealH()*pc)+'px';cv.style.maxWidth='none';
    renderFace(cv.getContext('2d'),ppc,{mirror:p[1],outline:true});
  });
}

/* --- Vẽ bằng chạm / chuột --- */
function hit(e){
  if(!edG)return null;
  var rc=ed.getBoundingClientRect(),k=ed.width/rc.width,x=(e.clientX-rc.left)*k,y=(e.clientY-rc.top)*k;
  var c=Math.floor((x-edG.gx)/edG.cell),r=Math.floor((y-edG.gy)/edG.cell);
  if(r<0||c<0||r>=S.rows||c>=S.cols||!active(edG,r,c))return null;
  return[r,c];
}
function cloneC(a){return JSON.parse(JSON.stringify(a));}
function pushHist(){hist.push({rows:S.rows,cols:S.cols,g:grid.slice(),cv:cloneC(curves)});if(hist.length>200)hist.shift();}
function setCell(r,c,v){
  var P=[[r,c]];
  if(sym==='lr'||sym==='both')P.push([r,S.cols-1-c]);
  if(sym==='tb'||sym==='both')P.push([S.rows-1-r,c]);
  if(sym==='both')P.push([S.rows-1-r,S.cols-1-c]);
  P.forEach(function(p){grid[p[0]*S.cols+p[1]]=v;});
}
function evXY(e){var rc=ed.getBoundingClientRect(),k=ed.width/rc.width;return[(e.clientX-rc.left)*k,(e.clientY-rc.top)*k];}
function cPt(e){/* điểm neo bắt vào bước 0,5 ô */
  if(!edG)return null;var q=evXY(e),x=(q[0]-edG.gx)/edG.cell,y=(q[1]-edG.gy)/edG.cell;
  if(x<-.3||y<-.3||x>S.cols+.3||y>S.rows+.3)return null;
  return[clamp(Math.round(x*2)/2,0,S.cols),clamp(Math.round(y*2)/2,0,S.rows)];
}
function hitCurve(e){
  if(!edG||!curves.length)return -1;var q=evXY(e);
  edx.save();edx.lineWidth=Math.max(edG.cell*S.ratio,14*dpr());edx.lineCap='round';
  for(var i=curves.length-1;i>=0;i--){edx.beginPath();if(curves[i].p.length<2){var p=curves[i].p[0];edx.moveTo(edG.gx+p[0]*edG.cell,edG.gy+p[1]*edG.cell);edx.lineTo(edG.gx+p[0]*edG.cell+.01,edG.gy+p[1]*edG.cell);}else curvePath(edx,edG,curves[i]);if(edx.isPointInStroke(q[0],q[1])){edx.restore();return i;}}
  edx.restore();return -1;
}
function symCurves(c){
  var out=[c],f=function(fx,fy){return{p:c.p.map(function(p){return[fx?S.cols-p[0]:p[0],fy?S.rows-p[1]:p[1],p[2]||0];}),closed:c.closed};};
  if(sym==='lr'||sym==='both')out.push(f(1,0));
  if(sym==='tb'||sym==='both')out.push(f(0,1));
  if(sym==='both')out.push(f(1,1));
  return out;
}
function finishCurve(){
  if(!curC)return;var c=curC;curC=null;cHover=null;
  function histOrig(){hist.push({rows:S.rows,cols:S.cols,g:grid.slice(),cv:c.orig});}
  if(c.p.length>=2||(c.p.length===1&&c.edit)){if(c.edit){histOrig();curves=c.base;}else pushHist();Array.prototype.push.apply(curves,c.edit?[{p:c.p,closed:c.closed}]:symCurves({p:c.p,closed:c.closed}));}
  else if(c.edit)curves=c.base;
  drawFace();
}
function curveDown(e){
  var p=cPt(e);if(!p)return;e.preventDefault();try{ed.setPointerCapture(e.pointerId);}catch(_){}
  if(curC){
    var P=curC.p,near=-1,tol=.35;
    for(var i=0;i<P.length;i++)if(Math.abs(P[i][0]-p[0])<=tol&&Math.abs(P[i][1]-p[1])<=tol){near=i;}
    if(near>=0){cDrag={i:near,moved:false};return;}
  }else{
    var ci=hitCurve(e);
    if(ci>=0){var base=cloneC(curves),c=base.splice(ci,1)[0];curC={p:c.p,closed:c.closed,edit:true,base:base,orig:cloneC(curves)};curves=base.slice();drawFace();return;}
    curC={p:[],closed:false};
  }
  if(!curC.closed)curC.p.push([p[0],p[1],0]);
  drawFace();
}
ed.addEventListener('pointerdown',function(e){
  if(tool==='curve')return curveDown(e);
  if(tool!=='paint'){var ci=hitCurve(e),hc=hit(e);if(ci>=0&&(tool==='erase'||!hc||!at(hc[0],hc[1]))){e.preventDefault();pushHist();curves.splice(ci,1);drawFace();return;}}
  var h=hit(e);if(!h)return;e.preventDefault();pushHist();
  var cur=at(h[0],h[1]);drag=tool==='paint'?1:tool==='erase'?0:(cur?0:1);
  setCell(h[0],h[1],drag);try{ed.setPointerCapture(e.pointerId);}catch(_){}
  hover=e.pointerType==='mouse'?h:null;drawFace();
});
ed.addEventListener('pointermove',function(e){
  if(tool==='curve'){
    var p=cPt(e),ch2=String(p)!==String(cHover);cHover=p;
    if(cDrag&&p&&curC){var q=curC.p[cDrag.i];if(q[0]!==p[0]||q[1]!==p[1]){q[0]=p[0];q[1]=p[1];cDrag.moved=true;ch2=true;}}
    if(ch2&&curC)drawFace();return;
  }
  var h=hit(e),ch=String(h)!==String(hover);
  if(e.pointerType==='mouse')hover=h;
  if(drag!==null&&h&&at(h[0],h[1])!==drag){setCell(h[0],h[1],drag);ch=true;}
  if(ch)drawFace();
});
function endDrag(){
  if(cDrag&&curC){var i=cDrag.i,P=curC.p;
    if(!cDrag.moved){/* chạm lại điểm cuối = đặt/bỏ góc gãy; chạm điểm đầu khi có ≥3 điểm = khép kín */
      if(i===P.length-1)P[i][2]=P[i][2]?0:1;else if(i===0&&P.length>=3&&!curC.closed)curC.closed=true;
    }
    drawFace();}
  cDrag=null;drag=null;}
ed.addEventListener('pointerup',endDrag);ed.addEventListener('pointercancel',endDrag);
ed.addEventListener('pointerleave',function(){if(cHover){cHover=null;if(curC)drawFace();}if(hover){hover=null;drawFace();}});

/* --- Điều khiển --- */
function setGridSize(nr,nc){
  nr=clamp(Math.round(nr)||S.rows,2,80);nc=clamp(Math.round(nc)||S.cols,2,80);
  if(nr===S.rows&&nc===S.cols)return;
  pushHist();
  var ng=new Uint8Array(nr*nc);
  if(count())for(var r=0;r<nr;r++)for(var c=0;c<nc;c++)ng[r*nc+c]=grid[Math.floor((r+.5)*S.rows/nr)*S.cols+Math.floor((c+.5)*S.cols/nc)];
  finishCurve();var fx=nc/S.cols,fy=nr/S.rows;curves.forEach(function(cv){cv.p.forEach(function(p){p[0]=Math.round(p[0]*fx*2)/2;p[1]=Math.round(p[1]*fy*2)/2;});});
  S.rows=nr;S.cols=nc;grid=ng;drawFace();
}
function syncFaceUI(){
  $('w').value=S.w;$('h').value=S.h;$('rows').value=S.rows;$('cols').value=S.cols;
  $('fr').value=S.frameMm;$('gap').value=S.gapMm;$('ratio').value=Math.round(S.ratio*100);$('diag').checked=S.diag;
  setSeg('shape',S.shape);setSeg('mode',S.mode);setSeg('cap',S.cap);setSeg('join',S.join);
  $('hrow').classList.toggle('hide',S.shape==='round');
  $('wlab').textContent=S.shape==='round'?'Đường kính (cm)':'Ngang (cm)';
  $('frv').textContent=fmt(S.frameMm)+' mm';$('gapv').textContent=fmt(S.gapMm)+' mm';$('ratiov').textContent=Math.round(S.ratio*100)+'%';
}
segOn('shape',function(v){S.shape=v;syncFaceUI();drawFace();});
segOn('mode',function(v){S.mode=v;drawFace();});
segOn('cap',function(v){S.cap=v;drawFace();});
segOn('join',function(v){S.join=v;drawFace();});
segOn('tool',function(v){if(tool==='curve'&&v!=='curve')finishCurve();tool=v;$('curvebar').classList.toggle('hide',v!=='curve');ed.style.cursor=v==='curve'?'copy':'crosshair';drawFace();});
$('cdone').addEventListener('click',finishCurve);
$('cclose').addEventListener('click',function(){if(curC&&curC.p.length>=3){curC.closed=!curC.closed;drawFace();}});
$('cback').addEventListener('click',function(){if(!curC)return;if(curC.closed)curC.closed=false;else curC.p.pop();drawFace();});
$('cdel').addEventListener('click',function(){if(!curC)return;if(curC.edit){hist.push({rows:S.rows,cols:S.cols,g:grid.slice(),cv:curC.orig});curves=curC.base;}curC=null;drawFace();});
document.addEventListener('keydown',function(e){if(tool!=='curve'||!curC||/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName))return;if(e.key==='Enter'){e.preventDefault();finishCurve();}else if(e.key==='Escape'){e.preventDefault();$('cdel').click();}else if(e.key==='Backspace'){e.preventDefault();$('cback').click();}});
$('w').addEventListener('input',function(){S.w=clamp(num('w',S.w),.5,20);drawFace();});
$('h').addEventListener('input',function(){S.h=clamp(num('h',S.h),.5,20);drawFace();});
$('fr').addEventListener('input',function(){S.frameMm=num('fr',0);syncFaceUI();drawFace();});
$('gap').addEventListener('input',function(){S.gapMm=num('gap',0);syncFaceUI();drawFace();});
$('ratio').addEventListener('input',function(){S.ratio=num('ratio',86)/100;syncFaceUI();drawFace();});
$('diag').addEventListener('change',function(){S.diag=this.checked;drawFace();});
$('showgrid').addEventListener('change',function(){showGrid=this.checked;drawFace();});
$('sym').addEventListener('change',function(){sym=this.value;});
$('rows').addEventListener('change',function(){setGridSize(num('rows',S.rows),S.cols);syncFaceUI();});
$('cols').addEventListener('change',function(){setGridSize(S.rows,num('cols',S.cols));syncFaceUI();});
$('undo').addEventListener('click',function(){if(curC){curC=null;drawFace();return;}var h=hist.pop();if(!h)return;S.rows=h.rows;S.cols=h.cols;grid=h.g;curves=h.cv||[];syncFaceUI();drawFace();});
$('clear').addEventListener('click',function(){if(!strokes())return;if(!confirm('Xoá hết các ô đã tô và nét cong?'))return;pushHist();grid=new Uint8Array(S.rows*S.cols);curves=[];curC=null;drawFace();});
Array.prototype.forEach.call(root.querySelectorAll('[data-sh]'),function(b){b.addEventListener('click',function(){
  var d=b.getAttribute('data-sh').split(',').map(Number),ng=new Uint8Array(S.rows*S.cols);pushHist();
  for(var r=0;r<S.rows;r++)for(var c=0;c<S.cols;c++){var rr=r-d[0],cc=c-d[1];ng[r*S.cols+c]=at(rr,cc);}
  finishCurve();curves.forEach(function(cv){cv.p.forEach(function(p){p[0]+=d[1];p[1]+=d[0];});});
  grid=ng;drawFace();
});});
document.addEventListener('keydown',function(e){if((e.ctrlKey||e.metaKey)&&e.key==='z'&&!$('face').classList.contains('hide')&&!/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)){e.preventDefault();$('undo').click();}});

/* --- Dữ liệu ấn (dùng cho lưu, mở lại, và phân tích cấu trúc chữ) --- */
function faceData(){return{v:1,shape:S.shape,w:S.w,h:sealH(),mode:S.mode,rows:S.rows,cols:S.cols,ratio:S.ratio,cap:S.cap,join:S.join,diag:S.diag,frameMm:S.frameMm,gapMm:S.gapMm,grid:Array.prototype.join.call(grid,''),curves:cloneC(curves)};}
function gridText(){var out=[];for(var r=0;r<S.rows;r++){var s='';for(var c=0;c<S.cols;c++)s+=at(r,c)?'█':'·';out.push(s);}return out.join('\n');}
function faceMeta(){return{shapeLabel:S.shape==='round'?'Tròn':'Vuông',w:S.w,h:sealH(),modeLabel:S.mode==='am'?'Âm văn':'Dương văn',rows:S.rows,cols:S.cols,count:count(),gridText:gridText()+(curves.length?'\n+ '+curves.length+' nét cong':'')};}
function loadFace(d,name){
  if(!d||!d.grid)throw new Error('dữ liệu không hợp lệ');
  pushHist();
  ['shape','w','mode','rows','cols','ratio','cap','join','diag','frameMm','gapMm'].forEach(function(k){if(d[k]!==undefined)S[k]=d[k];});
  S.h=d.h||S.w;
  grid=new Uint8Array(S.rows*S.cols);for(var i=0;i<grid.length;i++)grid[i]=d.grid.charAt(i)==='1'?1:0;
  curves=Array.isArray(d.curves)?cloneC(d.curves):[];curC=null;
  if(name)$('name').value=name;
  syncFaceUI();drawFace();
}
function faceTitle(){return $('name').value.trim();}
function faceInfoLine(){
  var cellMm=geo(100).cell;cellMm=cellMm/100*10;
  return (S.shape==='round'?'Tròn Ø '+fmt(S.w)+' cm':'Vuông '+fmt(S.w)+' × '+fmt(S.h)+' cm')+' · '+(S.mode==='am'?'Âm văn':'Dương văn')+' · lưới '+S.rows+' × '+S.cols+' (ô '+fmt(cellMm)+' mm, nét '+fmt(cellMm*S.ratio)+' mm)';
}
function printFace(){
  finishCurve();
  var name=faceTitle()||'(chưa đặt tên)';
  var imp=faceCanvas(DPI).toDataURL('image/png'),mir=faceCanvas(DPI,{mirror:true}).toDataURL('image/png');
  var big=Math.min(16,Math.max(8,S.w*3)),bigH=big*sealH()/S.w;
  if(bigH>15){big=big*15/bigH;bigH=15;}
  var gm=faceCanvas(300,{mirror:true,grid:true},big).toDataURL('image/png');
  var W=S.w+'cm',H=sealH()+'cm';
  printHTML('Ấn '+name,
    '<h1>Ấn: '+esc(name)+'</h1><div class="meta">'+esc(faceInfoLine())+'<br>In lúc '+stamp()+' · in đúng tỷ lệ 100% (không "vừa trang")</div>'+
    '<div class="row"><figure><img src="'+imp+'" style="width:'+W+';height:'+H+'">Dấu in · kích thước thật</figure>'+
    '<figure><img src="'+mir+'" style="width:'+W+';height:'+H+'">Mặt khắc · lật ngược để can lên đá</figure>'+
    '<figure><img src="'+imp+'" style="width:'+W+';height:'+H+'">Bản lưu</figure></div>'+
    '<figure style="text-align:left"><img src="'+gm+'" style="width:'+big+'cm;height:'+fmt(bigH).replace(',','.')+'cm;margin:0 0 2mm">Bản lưới phóng to (đã lật ngược) để dựng nét khi khắc</figure>');
}
$('print').addEventListener('click',printFace);
$('png').addEventListener('click',function(){finishCurve();faceCanvas(DPI).toBlob(function(b){download(b,safeName(faceTitle())+'.png');});});
$('json').addEventListener('click',function(){finishCurve();var d=faceData();d.name=faceTitle();download(new Blob([JSON.stringify(d,null,1)],{type:'application/json'}),safeName(faceTitle())+'.json');});
$('openjson').addEventListener('click',function(){$('jsonfile').click();});
$('jsonfile').addEventListener('change',function(){var f=this.files[0];if(!f)return;var rd=new FileReader();rd.onload=function(){try{var d=JSON.parse(rd.result);loadFace(d,d.name);say($('msg'),'Đã mở “'+esc(d.name||f.name)+'”.');}catch(err){say($('msg'),'Không đọc được tệp: '+esc(err.message),1);}};rd.readAsText(f);this.value='';});

$('confirm').addEventListener('click',function(){
  var name=faceTitle(),m=$('msg');
  if(!name){say(m,'Hãy đặt tên ấn trước khi chốt.',1);$('name').focus();return;}
  finishCurve();if(!strokes()){say(m,'Mặt ấn chưa có nét nào.',1);return;}
  if(!confirm('Chốt ấn “'+name+'”?\nẢnh sẽ được lưu lên Drive và mở bản in.'))return;
  say(m,'Đang lưu lên Drive…');
  post({action:'save',type:'face',name:name,png:faceCanvas(DPI).toDataURL('image/png'),meta:faceMeta(),data:faceData()})
    .then(function(j){say(m,'Đã lưu “'+esc(name)+'” · <a href="'+esc(j.url)+'" target="_blank" rel="noopener">mở ảnh trên Drive</a>');})
    .catch(function(err){say(m,'Chưa lưu được: '+esc(err.message)+'. Bạn vẫn có thể Tải PNG và Tải dữ liệu.',1);});
  printFace();
});
$('loadlist').addEventListener('click',function(){
  var m=$('msg');if(!hasURL()){say(m,'Trang chưa có API_URL trong ATX_CONFIG.',1);return;}
  say(m,'Đang tải danh sách…');
  fetch(SCRIPT_URL+'?action=list&key='+encodeURIComponent(getKey())).then(function(r){return r.json();}).then(function(j){
    if(!j.ok)throw new Error(j.error||'lỗi');saved=j.items||[];
    $('saved').innerHTML='<option value="">— Chọn ấn đã lưu ('+saved.length+') —</option>'+saved.map(function(it,i){return'<option value="'+i+'">'+esc(it.name)+' · '+esc(it.time)+'</option>';}).join('');
    say(m,'Có '+saved.length+' bản lưu.');
  }).catch(function(err){say(m,'Không tải được: '+esc(err.message),1);});
});
$('saved').addEventListener('change',function(){var it=saved[this.value];if(!it)return;try{loadFace(JSON.parse(it.data),it.name);say($('msg'),'Đã mở “'+esc(it.name)+'”.');}catch(err){say($('msg'),'Bản lưu lỗi: '+esc(err.message),1);}});

/* =====================================================
   THÂN ẤN · bản trải 4 mặt
   ===================================================== */
var B={w:2,d:2,h:5,tab:true,mode:'one',face:0},LY={all:null,f:[null,null,null,null]},NAMES=['Trước','Phải','Sau','Trái'],TAB=.6;
var bed=$('bed'),bctx=bed.getContext('2d'),bPPC=1;
function sides(){return 2*B.w+2*B.d;}
function total(){return sides()+(B.tab?TAB:0);}
function faces(){var xs=[0,B.w,B.w+B.d,2*B.w+B.d],ws=[B.w,B.d,B.w,B.d];return NAMES.map(function(n,i){return{x:xs[i],y:0,w:ws[i],h:B.h,name:n};});}
function region(i){return B.mode==='one'?{x:0,y:0,w:sides(),h:B.h}:faces()[i===undefined?B.face:i];}
function cur(){return B.mode==='one'?LY.all:LY.f[B.face];}
function setCur(l){if(B.mode==='one')LY.all=l;else LY.f[B.face]=l;}
function dims(l){return(l.rot%180)?[l.img.height,l.img.width]:[l.img.width,l.img.height];}
function fit(l,reg,how){var d=dims(l);return how==='contain'?Math.min(reg.w/d[0],reg.h/d[1]):Math.max(reg.w/d[0],reg.h/d[1]);}
function mkLayer(img,reg){var l={img:img,rot:0,flip:false,pct:100,ox:0,oy:0};l.base=fit(l,reg,'cover');return l;}

function drawLayer(ctx,l,reg,ppc){
  if(!l)return;var s=l.base*l.pct/100;
  ctx.save();ctx.beginPath();ctx.rect(reg.x*ppc,reg.y*ppc,reg.w*ppc,reg.h*ppc);ctx.clip();
  ctx.translate((reg.x+reg.w/2+l.ox)*ppc,(reg.y+reg.h/2+l.oy)*ppc);ctx.rotate(l.rot*Math.PI/180);if(l.flip)ctx.scale(-1,1);
  var iw=l.img.width*s*ppc,ih=l.img.height*s*ppc;ctx.drawImage(l.img,-iw/2,-ih/2,iw,ih);ctx.restore();
}
function renderBody(ctx,ppc,o){
  o=o||{};var T=total(),H=B.h,F=faces(),SW=sides();
  ctx.fillStyle='#fff';ctx.fillRect(0,0,T*ppc,H*ppc);
  if(B.mode==='one')drawLayer(ctx,LY.all,{x:0,y:0,w:SW,h:H},ppc);else F.forEach(function(f,i){drawLayer(ctx,LY.f[i],f,ppc);});
  if(B.tab){
    ctx.fillStyle='#efe9df';ctx.fillRect(SW*ppc,0,TAB*ppc,H*ppc);
    ctx.save();ctx.translate((SW+TAB/2)*ppc,H*ppc/2);ctx.rotate(-Math.PI/2);ctx.fillStyle='#a2968a';ctx.font=Math.round(.28*ppc)+'px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('dán',0,0);ctx.restore();
  }
  var lw=Math.max(1,.02*ppc);ctx.lineWidth=lw;ctx.strokeStyle='#222';ctx.setLineDash([]);
  ctx.strokeRect(lw/2,lw/2,T*ppc-lw,H*ppc-lw);
  ctx.strokeStyle='#777';ctx.setLineDash([.12*ppc,.08*ppc]);ctx.beginPath();
  [B.w,B.w+B.d,2*B.w+B.d].concat(B.tab?[SW]:[]).forEach(function(x){ctx.moveTo(x*ppc,0);ctx.lineTo(x*ppc,H*ppc);});
  ctx.stroke();ctx.setLineDash([]);
  if(o.labels){
    var fs=Math.max(11,Math.round(12*dpr()));ctx.font='600 '+fs+'px Arial';ctx.textBaseline='top';ctx.textAlign='left';
    F.forEach(function(f){var tw=ctx.measureText(f.name).width;ctx.fillStyle='rgba(255,255,255,.8)';ctx.fillRect(f.x*ppc+4,4,tw+8,fs+6);ctx.fillStyle='#555';ctx.fillText(f.name,f.x*ppc+8,7);});
    if(B.mode==='four'){var f=F[B.face];ctx.strokeStyle='#1d6fd8';ctx.lineWidth=2*dpr();ctx.strokeRect(f.x*ppc+dpr(),dpr(),f.w*ppc-2*dpr(),f.h*ppc-2*dpr());}
  }
}
function bodyCanvas(dpi){var ppc=dpi/2.54,cv=document.createElement('canvas');cv.width=Math.round(total()*ppc);cv.height=Math.round(B.h*ppc);renderBody(cv.getContext('2d'),ppc,{});return cv;}
function drawBody(){
  var box=$('stage-body'),availW=Math.min((box.clientWidth||600)-28,900),k=dpr();if(availW<160)availW=320;
  var real=view==='real',css=real?pxcm():Math.min(availW/total(),460/B.h);bPPC=css*k;
  bed.classList.toggle('real',real);box.classList.toggle('wide',real&&total()*css>availW);
  bed.width=Math.round(total()*bPPC);bed.height=Math.round(B.h*bPPC);bed.style.width=(bed.width/k)+'px';bed.style.height=(bed.height/k)+'px';
  renderBody(bctx,bPPC,{labels:true});
  $('binfo').textContent='Bản trải '+fmt(total())+' × '+fmt(B.h)+' cm · Trước '+fmt(B.w)+' · Phải '+fmt(B.d)+' · Sau '+fmt(B.w)+' · Trái '+fmt(B.d)+' cm · nét liền = cắt, nét đứt = gấp';
  var l=cur();$('bscale').value=l?Math.round(l.pct):100;$('bscalev').textContent=(l?Math.round(l.pct):100)+'%';
}
['bw','bd','bh'].forEach(function(id){$(id).addEventListener('input',function(){B.w=clamp(num('bw',B.w),.5,30);B.d=clamp(num('bd',B.d),.5,30);B.h=clamp(num('bh',B.h),.5,30);drawBody();});});
$('btab').addEventListener('change',function(){B.tab=this.checked;drawBody();});
segOn('bmode',function(v){B.mode=v;$('bfacerow').classList.toggle('hide',v!=='four');$('ballrow').classList.toggle('hide',v!=='four');drawBody();});
segOn('bface',function(v){B.face=+v;drawBody();});
$('bpick').addEventListener('click',function(){$('bfile').click();});
$('bfile').addEventListener('change',function(){
  var f=this.files[0];if(!f)return;var rd=new FileReader();
  rd.onload=function(){var im=new Image();im.onload=function(){setCur(mkLayer(im,region()));drawBody();};im.src=rd.result;};
  rd.readAsDataURL(f);this.value='';
});
$('bscale').addEventListener('input',function(){var l=cur();if(!l)return;l.pct=+this.value;$('bscalev').textContent=l.pct+'%';renderBody(bctx,bPPC,{labels:true});});
$('brot').addEventListener('click',function(){var l=cur();if(!l)return;l.rot=(l.rot+90)%360;l.base=fit(l,region(),'cover');l.pct=100;drawBody();});
$('bflip').addEventListener('click',function(){var l=cur();if(!l)return;l.flip=!l.flip;drawBody();});
$('bcover').addEventListener('click',function(){var l=cur();if(!l)return;l.base=fit(l,region(),'cover');l.pct=100;l.ox=l.oy=0;drawBody();});
$('bcontain').addEventListener('click',function(){var l=cur();if(!l)return;l.base=fit(l,region(),'cover');l.pct=Math.round(fit(l,region(),'contain')/l.base*100);l.ox=l.oy=0;drawBody();});
$('bcenter').addEventListener('click',function(){var l=cur();if(!l)return;l.ox=l.oy=0;drawBody();});
$('bdel').addEventListener('click',function(){setCur(null);drawBody();});
$('ball').addEventListener('click',function(){var l=cur();if(!l)return;for(var i=0;i<4;i++){if(i===B.face)continue;var n=mkLayer(l.img,region(i));n.rot=l.rot;n.flip=l.flip;n.base=fit(n,region(i),'cover');n.pct=l.pct;LY.f[i]=n;}drawBody();});

/* kéo · lăn · chụm */
var ptrs={},bdrag=null,pinch=null;
function cmPt(e){var rc=bed.getBoundingClientRect(),k=bed.width/rc.width;return[(e.clientX-rc.left)*k/bPPC,(e.clientY-rc.top)*k/bPPC];}
bed.addEventListener('pointerdown',function(e){
  e.preventDefault();ptrs[e.pointerId]=[e.clientX,e.clientY];try{bed.setPointerCapture(e.pointerId);}catch(_){}
  var p=cmPt(e);
  if(B.mode==='four'&&Object.keys(ptrs).length===1){var F=faces();for(var i=0;i<4;i++)if(p[0]>=F[i].x&&p[0]<F[i].x+F[i].w&&B.face!==i){B.face=i;setSeg('bface',i);drawBody();}}
  var l=cur();if(!l)return;
  var ids=Object.keys(ptrs);
  if(ids.length===2){var a=ptrs[ids[0]],b=ptrs[ids[1]];pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1]),pct:l.pct};bdrag=null;}
  else bdrag={p:p,ox:l.ox,oy:l.oy};
});
bed.addEventListener('pointermove',function(e){
  if(!ptrs[e.pointerId])return;ptrs[e.pointerId]=[e.clientX,e.clientY];var l=cur();if(!l)return;
  var ids=Object.keys(ptrs);
  if(pinch&&ids.length===2){var a=ptrs[ids[0]],b=ptrs[ids[1]];l.pct=clamp(pinch.pct*Math.hypot(a[0]-b[0],a[1]-b[1])/pinch.d,5,800);drawBody();return;}
  if(bdrag){var p=cmPt(e);l.ox=bdrag.ox+p[0]-bdrag.p[0];l.oy=bdrag.oy+p[1]-bdrag.p[1];renderBody(bctx,bPPC,{labels:true});}
});
function bEnd(e){delete ptrs[e.pointerId];if(Object.keys(ptrs).length<2)pinch=null;if(!Object.keys(ptrs).length)bdrag=null;}
bed.addEventListener('pointerup',bEnd);bed.addEventListener('pointercancel',bEnd);
bed.addEventListener('wheel',function(e){var l=cur();if(!l)return;e.preventDefault();l.pct=clamp(l.pct*Math.exp(-e.deltaY*.0012),5,800);drawBody();},{passive:false});

function bodyName(){return $('bname').value.trim()||faceTitle();}
function printBody(){
  var name=bodyName()||'(chưa đặt tên)',T=total(),land=T>18.5;
  printHTML('Thân ấn '+name,'<h1>Thân ấn: '+esc(name)+'</h1><div class="meta">Thân '+fmt(B.w)+' × '+fmt(B.d)+' × cao '+fmt(B.h)+' cm · bản trải '+fmt(T)+' × '+fmt(B.h)+' cm (Trước – Phải – Sau – Trái'+(B.tab?' – mép dán':'')+')<br>Nét liền: cắt · nét đứt: gấp · in đúng tỷ lệ 100% · '+stamp()+'</div>'+
    '<img src="'+bodyCanvas(DPI).toDataURL('image/png')+'" style="width:'+T+'cm;height:'+B.h+'cm;margin:0">',land);
}
$('bprint').addEventListener('click',printBody);
$('bpng').addEventListener('click',function(){bodyCanvas(DPI).toBlob(function(b){download(b,safeName(bodyName())+' - than an.png');});});
$('bconfirm').addEventListener('click',function(){
  var name=bodyName(),m=$('bmsg');
  if(!name){say(m,'Hãy đặt tên (hoặc đặt tên ấn ở thẻ Mặt ấn).',1);$('bname').focus();return;}
  say(m,'Đang lưu lên Drive…');
  post({action:'save',type:'body',name:name,png:bodyCanvas(DPI).toDataURL('image/png'),meta:{shapeLabel:'Thân 4 mặt',w:B.w,h:B.h,d:B.d},data:{v:1,w:B.w,d:B.d,h:B.h,tab:B.tab,mode:B.mode}})
    .then(function(j){say(m,'Đã lưu · <a href="'+esc(j.url)+'" target="_blank" rel="noopener">mở ảnh trên Drive</a>');})
    .catch(function(err){say(m,'Chưa lưu được: '+esc(err.message)+'. Bạn vẫn có thể Tải PNG.',1);});
  printBody();
});

/* ---------- Khởi động ---------- */
syncFaceUI();drawFace();
var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(redrawAll,150);});
})();
