/* Thiết kế ấn triện – thudao.com.
   Trang Blogspot chỉ cần <div id="atx"></div> + window.ATX_CONFIG = { API_URL: "<URL /exec của Apps Script>" }.
   Mặt ấn: lưới ô vuông, nét đều đầu tròn (dữ liệu lưới dùng cho bộ chữ Điền thể). Thân ấn: bản trải 4 mặt + biên khoản.
   v2: các tính năng dựa theo 《怎样学篆刻》 (Vương Bản Hưng): biên lan theo chu/bạch văn, bo góc 内方外圆,
   bố cục chữ (章法) + vách ngăn, tàn khuyết (残缺), ảnh mẫu để lâm mô, soát chương pháp, bản khắc in, biên khoản. */
(function(){
'use strict';
var VERSION='2.0.0';
function decodeEnt(s){return String(s).replace(/&#(\d+);/g,function(m,n){return String.fromCharCode(+n);}).replace(/&#x([0-9a-f]+);/gi,function(m,n){return String.fromCharCode(parseInt(n,16));}).replace(/&amp;/g,'&');}
var CFG=window.ATX_CONFIG||{};
var SCRIPT_URL=decodeEnt(CFG.API_URL||'').trim();
var root=document.getElementById('atx');
if(!root){root=document.createElement('div');root.id='atx';(document.currentScript&&document.currentScript.parentNode||document.body).appendChild(root);}

function sec(title,open,body){return '<details class="sec"'+(open?' open':'')+'><summary>'+title+'</summary>'+body+'</details>';}
function seg(k,items,on){return '<div class="seg" data-k="'+k+'">'+items.map(function(it){return '<button data-v="'+it[0]+'"'+(String(it[0])===String(on)?' class="on"':'')+'>'+it[1]+'</button>';}).join('')+'</div>';}
function row(label,html,id){return '<div class="row"'+(id?' id="atx-'+id+'"':'')+'><label>'+label+'</label>'+html+'</div>';}
function range(id,min,max,step,val){return '<input type="range" id="atx-'+id+'" min="'+min+'" max="'+max+'" step="'+step+'" value="'+val+'"><span class="val" id="atx-'+id+'v"></span>';}
function chk(id,label,on){return '<label class="free"><input type="checkbox" id="atx-'+id+'"'+(on?' checked':'')+'> '+label+'</label>';}

var FACE_HTML=[
'<section id="atx-face"><div class="wrap">',
'<div class="card">',
'<div class="row"><label>Tên ấn</label><input type="text" id="atx-name" placeholder="VD: Thanh Phong"></div>',
sec('Hình &amp; biên lan',true,[
  row('Hình',seg('shape',[['square','Vuông'],['round','Tròn'],['oval','Bầu dục'],['ya','Chữ 亚']],'square')),
  row('Ngang (cm)','<input type="number" id="atx-w" value="2.5" min="0.5" max="20" step="0.1">').replace('<label>Ngang (cm)</label>','<label id="atx-wlab">Ngang (cm)</label>'),
  row('Cao (cm)','<input type="number" id="atx-h" value="2.5" min="0.5" max="20" step="0.1">','hrow'),
  row('Khuyết góc 亚',range('ya',8,40,1,22),'yarow'),
  row('Kiểu khắc',seg('mode',[['am','Âm văn (白文)'],['duong','Dương văn (朱文)']],'am')),
  row('Kiểu viền',seg('fstyle',[['plain','Viền đơn'],['double','Viền kép'],['none','Không viền']],'plain')),
  row('<span id="atx-frlab">Viền (mm)</span>',range('fr',0,5,0.1,1.2),'frrow'),
  row('Nét trong (mm)',range('ln',0.2,3,0.1,0.6),'lnrow'),
  row('Cách viền (mm)',range('gap',0,5,0.1,0.8)),
  row('Bo góc ngoài',range('co',0,6,0.1,0.5),'corow'),
  row('Bo góc trong',range('ci',0,4,0.1,0),'cirow'),
  '<p class="hint" id="atx-fhint"></p>'
].join('')),
sec('Lưới &amp; nét',true,[
  row('Hàng × Cột','<input type="number" id="atx-rows" value="12" min="2" max="80"> × <input type="number" id="atx-cols" value="12" min="2" max="80">'),
  row('',chk('showgrid','Hiện lưới',true)),
  row('Độ dày nét',range('ratio',40,100,1,86)),
  row('Đầu nét',seg('cap',[['round','Tròn'],['square','Vuông']],'round')),
  row('Góc gập',seg('join',[['round','Tròn'],['square','Vuông']],'round')),
  row('Nối chéo',chk('diag','Nối 2 ô chéo nhau',false))
].join('')),
sec('Bố cục chữ · 章法',true,[
  row('Nội dung','<input type="text" id="atx-text" placeholder="VD: 长乐未央 hoặc Thanh Phong">'),
  row('Số chữ','<input type="number" id="atx-layn" value="0" min="0" max="30"> <span class="hint" style="margin:0">0 = không chia</span>'),
  row('Cách xếp','<select id="atx-lay"></select>'),
  row('Vách ngăn',seg('div',[['none','Không'],['v','Dọc · 栅栏'],['all','Dọc + ngang']],'none')),
  row('',chk('showlay','Hiện khung bố cục',true)),
  '<p class="hint" id="atx-layhint"></p>'
].join('')),
sec('Công cụ vẽ',true,[
  '<div class="row">'+seg('tool',[['toggle','Chấm / bỏ'],['paint','Chỉ tô'],['erase','Chỉ xoá']],'toggle')+'</div>',
  '<div class="row">'+seg('tool2',[['dmg','Tàn khuyết'],['dmgx','Bỏ tàn khuyết'],['ref','Dời ảnh mẫu']],'')+'</div>',
  row('Đối xứng','<select id="atx-sym"><option value="none">Không</option><option value="lr">Trái – phải</option><option value="tb">Trên – dưới</option><option value="both">Cả hai</option></select>'),
  '<div class="btns"><button id="atx-undo">↶ Hoàn tác</button><button id="atx-clear">Xoá hết nét</button></div>',
  '<div class="btns"><span class="hint" style="align-self:center;margin:0 4px 0 0">Dịch hình:</span><button data-sh="0,-1">←</button><button data-sh="-1,0">↑</button><button data-sh="1,0">↓</button><button data-sh="0,1">→</button></div>',
  row('Đường gióng',chk('gdiag','Đường chéo',false)+' '+chk('gthird','Chia ba',false))
].join('')),
sec('Tàn khuyết · 残缺',false,[
  '<p class="hint">Theo sách: tàn khuyết dùng có chủ ý để bù chỗ thưa–dày, nặng–nhẹ (章法八要 điều 4); khi khắc thật, chỗ vỡ ở viền để làm sau cùng. Chọn công cụ “Tàn khuyết” rồi chấm lên mặt ấn.</p>',
  row('Cỡ vết (mm)',range('dr',0.2,3,0.1,0.8)),
  row('Số vết',range('dn',2,40,1,10)),
  '<div class="btns"><button id="atx-dauto">Tạo vết vỡ ở viền</button><button id="atx-dclear">Xoá mọi tàn khuyết</button></div>'
].join('')),
sec('Ảnh mẫu · lâm mô',false,[
  '<p class="hint">Mở ảnh dấu ấn mẫu, chữ tra từ điển hay chữ bút lông để đồ theo trên lưới, hoặc cho máy chuyển ảnh thành nét.</p>',
  '<div class="btns"><button class="pri" id="atx-rpick" style="flex:1">Chọn ảnh mẫu…</button><button id="atx-rdel">Bỏ ảnh</button></div>',
  '<input type="file" id="atx-rfile" accept="image/*" class="hide">',
  row('Độ mờ',range('rop',5,100,1,45)),
  row('Cỡ ảnh',range('rsc',20,400,1,100)),
  row('',chk('rshow','Hiện ảnh',true)+' '+chk('rmir','Lật trái–phải',false)),
  row('Màu nét',seg('rink',[['dark','Tối'],['red','Đỏ'],['light','Sáng']],'dark')),
  row('Ngưỡng',range('rth',5,95,1,45)),
  '<div class="btns"><button id="atx-rconv" style="flex:1">Chuyển ảnh thành nét lưới</button></div>',
  '<p class="hint">Dấu ấn bạch văn (chữ trắng) chọn “Sáng”, dấu chu văn chọn “Đỏ”, chữ mực đen chọn “Tối”. Kéo ảnh bằng công cụ “Dời ảnh mẫu”.</p>'
].join('')),
sec('Chốt &amp; lưu',true,[
  '<div class="btns"><button class="pri" id="atx-confirm" style="flex:1">✔ Chốt ấn · lưu Drive &amp; in bản khắc</button></div>',
  '<div class="btns"><button id="atx-print">In bản khắc thử</button><button id="atx-png">Tải PNG</button><button id="atx-json">Tải dữ liệu</button><button id="atx-openjson">Mở tệp…</button></div>',
  '<input type="file" id="atx-jsonfile" accept=".json,application/json" class="hide">',
  '<div class="row"><select id="atx-saved"><option value="">— Ấn đã lưu trên Drive —</option></select><button id="atx-loadlist">Tải</button></div>',
  '<details><summary>Cài đặt lưu</summary><div class="row"><label>Mã lưu</label><input type="password" id="atx-key" placeholder="(nếu đã đặt AT_KEY)"></div></details>',
  '<div class="msg" id="atx-msg"></div>'
].join('')),
'</div>',
'<div class="stage" id="atx-stage-face">',
'  <canvas class="ed" id="atx-ed"></canvas>',
'  <div class="info" id="atx-info"></div>',
'  <div class="prev">',
'    <figure><canvas id="atx-pv1"></canvas>Dấu in · kích thước thật</figure>',
'    <figure><canvas id="atx-pv2"></canvas>Mặt khắc (lật ngược)</figure>',
'  </div>',
'  <div class="check"><div class="chk-h"><b>Soát chương pháp</b>'+chk('heat','Bản đồ thưa–dày',false)+'</div><ul id="atx-check"></ul><p class="hint">Ngưỡng độ dày nét là ngưỡng tham khảo, không phải số liệu của sách.</p></div>',
'</div>',
'</div></section>'
].join('\n');

var BODY_HTML=[
'<section id="atx-body" class="hide"><div class="wrap">',
'<div class="card">',
'<div class="row"><label>Tên</label><input type="text" id="atx-bname" placeholder="Mặc định lấy tên ấn"></div>',
sec('Kích thước thân ấn',true,[
  row('Ngang (cm)','<input type="number" id="atx-bw" value="2" min="0.5" max="30" step="0.1">'),
  row('Sâu (cm)','<input type="number" id="atx-bd" value="2" min="0.5" max="30" step="0.1">'),
  row('Cao (cm)','<input type="number" id="atx-bh" value="5" min="0.5" max="30" step="0.1">'),
  row('',chk('btab','Thêm mép dán 0,6 cm',true))
].join('')),
sec('Biên khoản · 边款',true,[
  row('',chk('kon','Hiện khoản trên bản trải',true)),
  row('Kiểu khoản',seg('kt',[['don','Đơn khoản'],['song','Song khoản'],['tu','Tự soạn']],'don')),
  row('Chữ',seg('ks',[['viet','Chữ Việt'],['han','Chữ Hán']],'viet')),
  row('Người khắc','<input type="text" id="atx-kau" placeholder="Tên hoặc hiệu"> <select id="atx-kverb" style="flex:none;width:auto"></select>','kaurow'),
  row('Người nhận','<input type="text" id="atx-krec" placeholder="Tên người được tặng"> <select id="atx-khum" style="flex:none;width:auto"></select>','krecrow'),
  row('Thời gian',chk('kyear','Năm',true)+' <span class="val" id="atx-kcc" style="text-align:left"></span> <select id="atx-kseason" style="flex:none;width:auto"></select>','kyrow'),
  row('Nơi khắc','<input type="text" id="atx-kplace" placeholder="(tuỳ chọn)">','kplrow'),
  '<div class="row"><textarea id="atx-ktext" rows="3" placeholder="Nội dung khoản. Xuống dòng = sang cột mới."></textarea></div>',
  row('Cỡ chữ (mm)',range('kfont',1.5,10,0.1,3.2)),
  row('Thứ tự mặt',seg('korder',[['start','Bắt đầu mặt trái'],['end','Kết thúc mặt trái']],'start')),
  '<p class="hint" id="atx-kinfo"></p>',
  '<p class="hint">Sách: chọn mặt khoản <b>trước</b> khi khắc mặt ấn; khoản một mặt đặt ở mặt trái. Khoản đơn đao không cần viết trước; khoản song đao viết mực chữ <b>xuôi</b> lên đá rồi khắc.</p>'
].join('')),
sec('Ảnh trang trí',false,[
  '<div class="row">'+seg('bmode',[['one','1 ảnh quấn 4 mặt'],['four','Mỗi mặt 1 ảnh']],'one')+'</div>',
  '<div class="row hide" id="atx-bfacerow">'+seg('bface',[['0','Trước'],['1','Phải'],['2','Sau'],['3','Trái']],'0')+'</div>',
  '<div class="btns"><button class="pri" id="atx-bpick" style="flex:1">Chọn ảnh…</button></div>',
  '<input type="file" id="atx-bfile" accept="image/*" class="hide">',
  '<div class="row"><label>Cỡ ảnh</label><input type="range" id="atx-bscale" min="10" max="400" step="1" value="100"><span class="val" id="atx-bscalev">100%</span></div>',
  '<div class="btns"><button id="atx-brot">⟳ Xoay 90°</button><button id="atx-bflip">⇋ Lật</button><button id="atx-bcover">Phủ kín</button><button id="atx-bcontain">Vừa trong</button><button id="atx-bcenter">Căn giữa</button><button id="atx-bdel">Bỏ ảnh</button></div>',
  '<div class="btns hide" id="atx-ballrow"><button id="atx-ball">Dùng ảnh này cho cả 4 mặt</button></div>',
  '<p class="hint">Kéo ảnh trên bản vẽ để căn chỉnh. Lăn chuột hoặc chụm 2 ngón để phóng to, thu nhỏ.</p>'
].join('')),
sec('Lưu &amp; in',true,[
  '<div class="btns"><button class="pri" id="atx-bconfirm" style="flex:1">✔ Lưu Drive &amp; in</button></div>',
  '<div class="btns"><button id="atx-bprint">In thử</button><button id="atx-bpng">Tải PNG</button></div>',
  '<div class="msg" id="atx-bmsg"></div>'
].join('')),
'</div>',
'<div class="stage" id="atx-stage-body">',
'  <canvas class="ed" id="atx-bed" style="cursor:move"></canvas>',
'  <div class="info" id="atx-binfo"></div>',
'</div>',
'</div></section>'
].join('\n');

root.innerHTML='<div class="seg tabs" data-k="tab"><button data-v="face" class="on">① Mặt ấn</button><button data-v="body">② Thân ấn · biên khoản</button></div>\n'+FACE_HTML+'\n'+BODY_HTML+'\n<p class="ver">Thiết kế ấn triện · phiên bản '+VERSION+'</p>';

var RED='#b8261c', PAPER='#ffffff', DPI=600;
function $(id){return document.getElementById('atx-'+id);}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function num(id,d){var v=parseFloat(String($(id).value).replace(',','.'));return isFinite(v)?v:d;}
function fmt(n){return (Math.round(n*100)/100).toString().replace('.',',');}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function safeName(s){return String(s||'an-trien').trim().replace(/[\\\/:*?"<>|]+/g,'_')||'an-trien';}
function dpr(){return Math.min(window.devicePixelRatio||1,3);}
function stamp(){var d=new Date();function p(n){return(n<10?'0':'')+n;}return p(d.getDate())+'/'+p(d.getMonth()+1)+'/'+d.getFullYear()+' '+p(d.getHours())+':'+p(d.getMinutes());}
function rng(seed){var a=seed>>>0;return function(){a=(a+0x6D2B79F5)>>>0;var t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}

function segOn(k,cb){root.querySelector('.seg[data-k="'+k+'"]').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;setSeg(k,b.getAttribute('data-v'));cb(b.getAttribute('data-v'));});}
function setSeg(k,v){Array.prototype.forEach.call(root.querySelectorAll('.seg[data-k="'+k+'"] button'),function(b){b.classList.toggle('on',b.getAttribute('data-v')===String(v));});}
function show(id,on){$(id).classList.toggle('hide',!on);}

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
  d.write('<!doctype html><html><head><meta charset="utf-8"><title>'+esc(title)+'</title><style>@page{size:A4 '+(landscape?'landscape':'portrait')+';margin:12mm}body{font-family:Arial,Helvetica,sans-serif;color:#222;margin:0}h1{font-size:15pt;margin:0 0 2mm}h2{font-size:11.5pt;margin:6mm 0 2mm}.meta{font-size:9.5pt;color:#555;margin-bottom:7mm;line-height:1.5}.row{display:flex;flex-wrap:wrap;gap:12mm;align-items:flex-end;margin-bottom:9mm}figure{margin:0;text-align:center;font-size:8.5pt;color:#555;max-width:60mm}img{display:block;margin:0 auto 2mm;-webkit-print-color-adjust:exact;print-color-adjust:exact}ol,ul{font-size:9.5pt;line-height:1.55;margin:0 0 3mm;padding-left:6mm}li{margin:0 0 1mm}.pb{break-before:page}</style></head><body>'+body+'</body></html>');
  d.close();
  var imgs=d.images,left=imgs.length;
  function go(){setTimeout(function(){f.contentWindow.focus();f.contentWindow.print();setTimeout(function(){f.remove();},60000);},200);}
  if(!left)return go();
  Array.prototype.forEach.call(imgs,function(im){if(im.complete){if(--left===0)go();}else im.onload=im.onerror=function(){if(--left===0)go();};});
}

/* ---------- Tabs ---------- */
segOn('tab',function(v){$('face').classList.toggle('hide',v!=='face');$('body').classList.toggle('hide',v!=='body');if(v==='body')drawBody();else drawFace();});

/* =====================================================
   MẶT ẤN
   ===================================================== */
var DEF={shape:'square',w:2.5,h:2.5,mode:'am',rows:12,cols:12,ratio:.86,cap:'round',join:'round',diag:false,frameMm:1.2,gapMm:.8,
  frameStyle:'plain',lineMm:.6,cornerOut:.5,cornerIn:0,yaPct:22,text:'',layoutN:0,layoutId:'',divider:'none',damage:[]};
var FIELDS=Object.keys(DEF);
var S=JSON.parse(JSON.stringify(DEF));
var grid=new Uint8Array(S.rows*S.cols),hist=[],tool='toggle',sym='none',showGrid=true,showLay=true,guides={diag:false,third:false},heat=false;
var hover=null,drag=null,edG=null,edPPC=1,saved=[],lastDmg=null,REF=null,refDrag=null;

function sealH(){return S.shape==='round'?S.w:S.h;}
var at=function(r,c){return(r>=0&&c>=0&&r<S.rows&&c<S.cols)?grid[r*S.cols+c]:0;};
function count(){var n=0;for(var i=0;i<grid.length;i++)n+=grid[i];return n;}

/* Bề dày từ mép ngoài vào tới lưới (mm), tuỳ kiểu viền và kiểu khắc. */
function borderMm(){
  var fs=S.frameStyle;
  if(fs==='none')return S.gapMm;
  if(fs==='double')return S.mode==='am'?S.frameMm+S.lineMm+S.gapMm:S.frameMm+S.gapMm+S.lineMm+S.gapMm;
  return S.frameMm+S.gapMm;
}
function geo(ppc){
  var W=S.w*ppc,H=sealH()*ppc,mm=ppc/10,g={W:W,H:H,mm:mm,fr:S.frameMm*mm,ln:S.lineMm*mm,gp:S.gapMm*mm,ins:borderMm()*mm};
  if(S.shape==='round'){g.R=Math.max(W/2-g.ins,W*.05);g.cell=Math.min(2*g.R/S.cols,2*g.R/S.rows);}
  else g.cell=Math.min(Math.max(W-2*g.ins,W*.1)/S.cols,Math.max(H-2*g.ins,H*.1)/S.rows);
  g.gx=(W-g.cell*S.cols)/2;g.gy=(H-g.cell*S.rows)/2;
  return g;
}
function yaN(g){return Math.min(g.W,g.H)*S.yaPct/100;}
function cornerR(g,ins){var ro=S.cornerOut*g.mm,ri=S.cornerIn*g.mm;return ins<=0?ro:Math.max(ri,ro-ins);}
function shapePath(ctx,g,ins){
  var W=g.W,H=g.H;ctx.beginPath();
  if(S.shape==='round'){ctx.arc(W/2,H/2,Math.max(0,W/2-ins),0,Math.PI*2);return;}
  if(S.shape==='oval'){ctx.ellipse(W/2,H/2,Math.max(0,W/2-ins),Math.max(0,H/2-ins),0,0,Math.PI*2);return;}
  var x0=ins,y0=ins,x1=W-ins,y1=H-ins;if(x1<=x0||y1<=y0)return;
  var r=Math.min(cornerR(g,ins),(x1-x0)/2,(y1-y0)/2);
  if(S.shape==='ya'){
    var n=Math.min(yaN(g),(W/2)-ins-1,(H/2)-ins-1);if(n<=0){ctx.rect(x0,y0,x1-x0,y1-y0);return;}
    var a=n+ins,P=[[a,y0],[W-a,y0],[W-a,a],[x1,a],[x1,H-a],[W-a,H-a],[W-a,y1],[a,y1],[a,H-a],[x0,H-a],[x0,a],[a,a]];
    r=Math.min(r,n/2);
    roundPoly(ctx,P,r);return;
  }
  roundPoly(ctx,[[x0,y0],[x1,y0],[x1,y1],[x0,y1]],r);
}
/* Đa giác bo góc (chỉ bo các góc lồi; góc lõm của chữ 亚 giữ vuông). */
function roundPoly(ctx,P,r){
  var n=P.length;
  function convex(i){var a=P[(i+n-1)%n],b=P[i],c=P[(i+1)%n];return((b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]))>0;}
  var s=P[0],nx=P[1],m=[(s[0]+nx[0])/2,(s[1]+nx[1])/2];
  ctx.moveTo(m[0],m[1]);
  for(var k=1;k<=n;k++){var i=k%n,b=P[i],c=P[(i+1)%n];if(r>0&&convex(i))ctx.arcTo(b[0],b[1],c[0],c[1],r);else ctx.lineTo(b[0],b[1]);}
  ctx.closePath();
}
function inside(g,x,y,m){
  if(S.shape==='round'){var dx=x-g.W/2,dy=y-g.H/2;return Math.sqrt(dx*dx+dy*dy)+m<=g.R;}
  if(S.shape==='oval'){var a=g.W/2-g.ins-m,b=g.H/2-g.ins-m;if(a<=0||b<=0)return false;var ex=(x-g.W/2)/a,ey=(y-g.H/2)/b;return ex*ex+ey*ey<=1;}
  if(S.shape==='ya'){var n=yaN(g)+g.ins+m;var lx=x<n||x>g.W-n,ly=y<n||y>g.H-n;return !(lx&&ly);}
  return true;
}
function active(g,r,c){return inside(g,g.gx+(c+.5)*g.cell,g.gy+(r+.5)*g.cell,g.cell*.3);}

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
function withActive(g,fn){var at0=at;at=function(r,c){return at0(r,c)&&active(g,r,c)?1:0;};try{return fn();}finally{at=at0;}}
function drawStrokes(ctx,g,ink){withActive(g,function(){drawStrokes0(ctx,g,ink);});}
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

/* ---------- Bố cục chữ (章法) ---------- */
var LAYOUTS={
  1:[['1','Một chữ chiếm cả mặt',[1]]],
  2:[['lr','Phải – trái (dọc đôi)',[1,1]],['tb','Trên – dưới','rows'],['cheo','Đối góc (2 góc để trống)','cheo']],
  3:[['21','Phải 2 · trái 1',[2,1]],['12','Phải 1 · trái 2',[1,2]],['111','Ba cột',[1,1,1]],['rows','Ba hàng ngang','rows']],
  4:[['22','2 × 2',[2,2]],['31','Phải 3 · trái 1',[3,1]],['13','Phải 1 · trái 3',[1,3]],['121','1 – 2 – 1',[1,2,1]],['hoi','Hồi văn (đọc vòng)','hoi'],['rows','Bốn hàng ngang','rows']],
  5:[['221','2 – 2 – 1',[2,2,1]],['122','1 – 2 – 2',[1,2,2]],['212','2 – 1 – 2',[2,1,2]],['32','Phải 3 · trái 2',[3,2]],['23','Phải 2 · trái 3',[2,3]],['rows','Năm hàng ngang','rows']],
  6:[['222','3 cột × 2',[2,2,2]],['33','2 cột × 3',[3,3]],['42','Phải 4 · trái 2',[4,2]],['321','3 – 2 – 1',[3,2,1]],['312','3 – 1 – 2',[3,1,2]],['231','2 – 3 – 1',[2,3,1]]],
  7:[['322','3 – 2 – 2',[3,2,2]],['232','2 – 3 – 2',[2,3,2]],['223','2 – 2 – 3',[2,2,3]],['421','4 – 2 – 1',[4,2,1]],['313','3 – 1 – 3',[3,1,3]],['133','1 – 3 – 3',[1,3,3]],['34','Phải 3 · trái 4',[3,4]],['43','Phải 4 · trái 3',[4,3]]],
  8:[['44','2 cột × 4',[4,4]],['323','3 – 2 – 3',[3,2,3]],['332','3 – 3 – 2',[3,3,2]],['2222','4 cột × 2',[2,2,2,2]],['233','2 – 3 – 3',[2,3,3]]],
  9:[['333','3 × 3',[3,3,3]]]
};
function layoutList(n){
  if(LAYOUTS[n])return LAYOUTS[n];
  if(n<1)return[];
  var nc=Math.ceil(Math.sqrt(n)),base=Math.floor(n/nc),ex=n%nc,a=[];for(var i=0;i<nc;i++)a.push(base+(i<ex?1:0));
  return[['auto','Tự chia '+a.join(' – '),a]];
}
function tokens(){
  var t=String(S.text||'').trim();if(!t)return[];
  if(/\s/.test(t))return t.split(/\s+/);
  return Array.from(t);
}
function curLayout(){var L=layoutList(S.layoutN);for(var i=0;i<L.length;i++)if(L[i][0]===S.layoutId)return L[i];return L[0]||null;}
/* Vùng chữ theo ô lưới: {r0,r1,c0,c1,idx}; idx=thứ tự đọc (0 = ô trống). Mặc định đọc cột dọc, phải → trái. */
function zones(){
  var L=curLayout();if(!L||S.layoutN<1)return[];
  var spec=L[2],R=S.rows,C=S.cols,Z=[],i;
  if(spec==='rows'){for(i=0;i<S.layoutN;i++)Z.push({r0:Math.round(i*R/S.layoutN),r1:Math.round((i+1)*R/S.layoutN),c0:0,c1:C,idx:i+1});return Z;}
  var hr=Math.round(R/2),hc=Math.round(C/2);
  if(spec==='cheo'){Z.push({r0:0,r1:hr,c0:hc,c1:C,idx:1},{r0:hr,r1:R,c0:0,c1:hc,idx:2},{r0:0,r1:hr,c0:0,c1:hc,idx:0},{r0:hr,r1:R,c0:hc,c1:C,idx:0});return Z;}
  if(spec==='hoi'){Z.push({r0:0,r1:hr,c0:hc,c1:C,idx:1},{r0:0,r1:hr,c0:0,c1:hc,idx:2},{r0:hr,r1:R,c0:0,c1:hc,idx:3},{r0:hr,r1:R,c0:hc,c1:C,idx:4});return Z;}
  var nc=spec.length,k=1;
  for(var j=0;j<nc;j++){
    var c1=C-Math.round(j*C/nc),c0=C-Math.round((j+1)*C/nc),m=spec[j];
    for(i=0;i<m;i++)Z.push({r0:Math.round(i*R/m),r1:Math.round((i+1)*R/m),c0:c0,c1:c1,idx:k++});
  }
  return Z;
}
/* Vách ngăn = các cạnh trong của vùng chữ (nằm trên đường lưới). */
function dividerSegs(){
  if(S.divider==='none')return[];
  var Z=zones(),seen={},out=[];
  Z.forEach(function(z){
    var E=[['v',z.c0,z.r0,z.r1],['v',z.c1,z.r0,z.r1]];
    if(S.divider==='all')E.push(['h',z.r0,z.c0,z.c1],['h',z.r1,z.c0,z.c1]);
    E.forEach(function(e){
      var lim=e[0]==='v'?S.cols:S.rows;if(e[1]<=0||e[1]>=lim)return;
      var key=e.join(',');if(seen[key])return;seen[key]=1;out.push(e);
    });
  });
  return out;
}
function drawDividers(ctx,g,ink){
  var segs=dividerSegs();if(!segs.length)return;
  var cs=g.cell,big=Math.max(g.W,g.H);
  ctx.strokeStyle=ink;ctx.lineWidth=Math.max(1,g.ln);ctx.lineCap='butt';ctx.beginPath();
  segs.forEach(function(e){
    if(e[0]==='v'){var x=g.gx+e[1]*cs,y0=e[2]===0?-big:g.gy+e[2]*cs,y1=e[3]===S.rows?2*big:g.gy+e[3]*cs;ctx.moveTo(x,y0);ctx.lineTo(x,y1);}
    else{var y=g.gy+e[1]*cs,x0=e[2]===0?-big:g.gx+e[2]*cs,x1=e[3]===S.cols?2*big:g.gx+e[3]*cs;ctx.moveTo(x0,y);ctx.lineTo(x1,y);}
  });
  ctx.stroke();
}

/* ---------- Tàn khuyết (残缺): vết vỡ tô màu giấy, toạ độ mm theo dấu in ---------- */
function drawDamage(ctx,g){
  if(!S.damage.length)return;
  ctx.save();shapePath(ctx,g,0);ctx.clip();ctx.fillStyle=PAPER;
  S.damage.forEach(function(d){
    var R=rng(d[3]||1),x=d[0]*g.mm,y=d[1]*g.mm,r=d[2]*g.mm,n=9,a0=R()*Math.PI*2;
    ctx.beginPath();
    for(var i=0;i<n;i++){var a=a0+i*Math.PI*2/n+(R()-.5)*.5,rr=r*(.55+.45*R());if(i)ctx.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);else ctx.moveTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}
    ctx.closePath();ctx.fill();
  });
  ctx.restore();
}

/* ---------- Ảnh mẫu ---------- */
function refBox(g){
  var gw=g.cell*S.cols,gh=g.cell*S.rows,iw=REF.img.width,ih=REF.img.height,s=Math.min(gw/iw,gh/ih)*REF.scale/100;
  return{cx:g.W/2+REF.ox*g.mm,cy:g.H/2+REF.oy*g.mm,w:iw*s,h:ih*s};
}
function drawRefImg(ctx,g,alpha){
  var b=refBox(g);ctx.save();ctx.globalAlpha=alpha;ctx.translate(b.cx,b.cy);if(REF.mirror)ctx.scale(-1,1);
  ctx.drawImage(REF.img,-b.w/2,-b.h/2,b.w,b.h);ctx.restore();
}

/* ---------- Lớp hỗ trợ trong khung vẽ ---------- */
function drawGrid(ctx,g,am,hv){
  var cs=g.cell,r,c,i;
  ctx.save();if(S.shape!=='square'){shapePath(ctx,g,0);ctx.clip();}
  if(S.shape!=='square'){
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
function drawGuides(ctx,g,am){
  var cs=g.cell,x0=g.gx,y0=g.gy,x1=g.gx+S.cols*cs,y1=g.gy+S.rows*cs,col=am?'rgba(255,240,200,.85)':'rgba(29,111,216,.75)';
  ctx.save();ctx.lineWidth=Math.max(1,cs*.05);ctx.strokeStyle=col;ctx.setLineDash([cs*.3,cs*.2]);ctx.beginPath();
  if(guides.diag){ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.moveTo(x1,y0);ctx.lineTo(x0,y1);}
  if(guides.third){for(var k=1;k<3;k++){var x=x0+(x1-x0)*k/3,y=y0+(y1-y0)*k/3;ctx.moveTo(x,y0);ctx.lineTo(x,y1);ctx.moveTo(x0,y);ctx.lineTo(x1,y);}}
  ctx.stroke();ctx.setLineDash([]);
  if(showLay){
    var Z=zones(),T=tokens();
    Z.forEach(function(z){
      if(!z.idx)return;
      var x=g.gx+z.c0*cs,y=g.gy+z.r0*cs,w=(z.c1-z.c0)*cs,h=(z.r1-z.r0)*cs,pad=cs*.12;
      ctx.lineWidth=Math.max(1.5,cs*.07);ctx.strokeStyle=am?'rgba(255,255,255,.75)':'rgba(29,111,216,.7)';ctx.strokeRect(x+pad,y+pad,w-2*pad,h-2*pad);
      var tk=T[z.idx-1];
      if(tk){var fs=Math.min(h*.8,w*.8/Math.max(1,tk.length*.62));ctx.font='600 '+fs+'px "Noto Serif CJK SC","Songti SC","Noto Serif",serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=am?'rgba(255,255,255,.28)':'rgba(29,111,216,.18)';ctx.fillText(tk,x+w/2,y+h/2);}
      var rr=Math.max(7,cs*.42);ctx.beginPath();ctx.arc(x+w-pad-rr,y+pad+rr,rr,0,Math.PI*2);ctx.fillStyle='#1d6fd8';ctx.fill();
      ctx.fillStyle='#fff';ctx.font='700 '+Math.round(rr*1.2)+'px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(z.idx),x+w-pad-rr,y+pad+rr+.5);
    });
  }
  ctx.restore();
}
function drawHeat(ctx,g){
  var cs=g.cell,R=2,r,c;
  ctx.save();
  for(r=0;r<S.rows;r++)for(c=0;c<S.cols;c++){
    if(!active(g,r,c))continue;var n=0,t=0;
    for(var i=-R;i<=R;i++)for(var j=-R;j<=R;j++){var rr=r+i,cc=c+j;if(rr<0||cc<0||rr>=S.rows||cc>=S.cols||!active(g,rr,cc))continue;t++;n+=at(rr,cc);}
    var d=t?n/t:0;
    if(d<.18)ctx.fillStyle='rgba(40,120,230,'+(.32*(1-d/.18))+')';
    else if(d>.42)ctx.fillStyle='rgba(240,140,0,'+Math.min(.55,(d-.42)*1.1)+')';
    else continue;
    ctx.fillRect(g.gx+c*cs,g.gy+r*cs,cs,cs);
  }
  ctx.restore();
}

function renderFace(ctx,ppc,o){
  o=o||{};var g=geo(ppc),am=S.mode==='am',fs=S.frameStyle,clipIns;
  ctx.save();
  if(o.mirror){ctx.translate(g.W,0);ctx.scale(-1,1);}
  function fill(ins,col){shapePath(ctx,g,ins);ctx.fillStyle=col;ctx.fill();}
  if(am){
    fill(0,RED);
    if(fs==='double'&&g.ln>0){fill(g.fr,PAPER);fill(g.fr+g.ln,RED);}
    clipIns=fs==='none'?0:g.fr;
  }else{
    fill(0,PAPER);
    if(fs!=='none'&&g.fr>0){fill(0,RED);fill(g.fr,PAPER);}
    if(fs==='double'&&g.ln>0){fill(g.fr+g.gp,RED);fill(g.fr+g.gp+g.ln,PAPER);}
    clipIns=0;
  }
  /* vách ngăn chạy tới mép trong của viền trong cùng */
  var divIns=am?clipIns:(fs==='none'?0:fs==='double'?g.fr+g.gp+g.ln*.5:g.fr*.5);
  ctx.save();shapePath(ctx,g,divIns);ctx.clip();drawDividers(ctx,g,am?PAPER:RED);ctx.restore();
  ctx.save();shapePath(ctx,g,clipIns);ctx.clip();
  drawStrokes(ctx,g,am?PAPER:RED);
  ctx.restore();
  drawDamage(ctx,g);
  if(o.ref&&REF&&REF.show)drawRefImg(ctx,g,REF.op);
  if(o.heat)drawHeat(ctx,g);
  if(o.grid)drawGrid(ctx,g,am,o.hover);
  if(o.guides)drawGuides(ctx,g,am);
  if(o.outline&&!am){shapePath(ctx,g,.5);ctx.lineWidth=1;ctx.strokeStyle='rgba(0,0,0,.28)';ctx.stroke();}
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
  var k=dpr(),ppc=avail/Math.max(S.w,sealH())*k,g=geo(ppc);edPPC=ppc;
  ed.width=Math.round(g.W);ed.height=Math.round(g.H);ed.style.width=(g.W/k)+'px';ed.style.height=(g.H/k)+'px';
  edG=renderFace(edx,ppc,{grid:showGrid,outline:true,hover:hover,guides:true,ref:true,heat:heat});
  var cellMm=edG.cell/ppc*10;
  $('info').textContent='Ô lưới '+fmt(cellMm)+' mm · nét dày '+fmt(cellMm*S.ratio)+' mm · đã tô '+count()+' ô'+(S.damage.length?' · '+S.damage.length+' vết tàn khuyết':'');
  drawPreview();renderCheck();
}
function drawPreview(){
  var k=dpr(),ppc=37.795*k;
  [['pv1',false],['pv2',true]].forEach(function(p){
    var cv=$(p[0]),g=geo(ppc);cv.width=Math.round(g.W);cv.height=Math.round(g.H);
    cv.style.width=S.w+'cm';cv.style.height=sealH()+'cm';
    renderFace(cv.getContext('2d'),ppc,{mirror:p[1],outline:true});
  });
}

/* ---------- Soát chương pháp (theo 章法八要 và kinh nghiệm khắc) ---------- */
/* Khoảng cách hẹp nhất (mm) giữa hai nét không nối nhau: hai ô chéo không nối, hoặc hai ô cách một ô trống. */
function minWall(g,cellMm,stroke){
  var sq=S.cap==='square'||S.join==='square',best=null,r,c;
  function upd(v){if(best===null||v<best)best=v;}
  withActive(g,function(){
    for(r=0;r<S.rows;r++)for(c=0;c<S.cols;c++){
      if(!at(r,c))continue;
      [[1,1],[1,-1]].forEach(function(d){
        var rr=r+d[0],cc=c+d[1];if(!at(rr,cc)||at(rr,c)||at(r,cc)||S.diag)return;
        upd(sq?Math.SQRT2*(cellMm-stroke):Math.SQRT2*cellMm-stroke);
      });
      if(at(r,c+2)&&!at(r,c+1))upd(2*cellMm-stroke);
      if(at(r+2,c)&&!at(r+1,c))upd(2*cellMm-stroke);
    }
  });
  return best;
}
function analyze(){
  var g=geo(100),cellMm=g.cell/10,out=[],act=0,n=0,sr=0,sc=0,top=0,bot=0,lef=0,rig=0,iso=0,symHit=0,r,c;
  function add(lv,t){out.push([lv,t]);}
  withActive(g,function(){
    for(r=0;r<S.rows;r++)for(c=0;c<S.cols;c++){
      if(!active(g,r,c))continue;act++;
      if(!at(r,c))continue;n++;sr+=r+.5;sc+=c+.5;
      if(r+.5<S.rows/2)top++;else if(r+.5>S.rows/2)bot++;
      if(c+.5<S.cols/2)lef++;else if(c+.5>S.cols/2)rig++;
      if(at(r,S.cols-1-c))symHit++;
      if(!links(r,c).length)iso++;
    }
  });
  var am=S.mode==='am',stroke=cellMm*S.ratio,wall=minWall(g,cellMm,stroke);
  /* Khả năng khắc: bề dày nét và khoảng cách thật giữa hai nét gần nhau nhất */
  if(am){
    if(wall!==null&&wall<.35)add('warn','Có chỗ vách đá giữa hai nét trắng chỉ khoảng '+fmt(Math.max(0,wall))+' mm — dễ vỡ khi khắc (破碎). Giãn hai nét ra hoặc giảm độ dày nét.');
    if(stroke<.35)add('warn','Nét trắng rộng khoảng '+fmt(stroke)+' mm — rất mảnh, khó đi dao đều.');
  }else{
    if(stroke<.45)add('warn','Nét đỏ dày khoảng '+fmt(stroke)+' mm — nét đá mảnh dễ gãy khi khắc chu văn (破碎).');
    if(wall!==null&&wall<.35)add('warn','Có chỗ khoảng trống giữa hai nét đỏ chỉ khoảng '+fmt(Math.max(0,wall))+' mm — khó đưa dao khắc bỏ nền.');
    if(S.frameStyle!=='none'&&S.frameMm<.5)add('warn','Viền đỏ '+fmt(S.frameMm)+' mm — mảnh, dễ sứt khi khắc và khi đóng.');
    if(S.frameStyle==='double'&&S.lineMm<.4)add('warn','Nét viền trong '+fmt(S.lineMm)+' mm — mảnh, dễ gãy.');
  }
  if(!out.length)add('ok','Nét dày '+fmt(stroke)+' mm'+(wall!==null?', khoảng cách hẹp nhất giữa hai nét '+fmt(wall)+' mm':'')+' — đủ để khắc.');
  if(!n){add('info','Chưa có nét nào. Có thể đặt “Bố cục chữ” trước để chia vùng cho từng chữ.');return out;}
  /* Trọng tâm */
  var dy=sr/n/S.rows-.5,dx=sc/n/S.cols-.5;
  if(dy>.05||bot>top*1.2)add('warn','Trọng tâm thấp: phần dưới nặng hơn phần trên (重心低沉 — “đầu nhẹ chân nặng”). Sách khuyên trên chặt dưới lỏng (上紧下松).');
  else if(dy<-.03)add('ok','Phần trên chặt hơn phần dưới — hợp “trên chặt dưới lỏng”.');
  else add('ok','Trọng tâm nằm giữa mặt ấn.');
  if(Math.abs(dx)>.06)add('info','Khối nét lệch về bên '+(dx>0?'phải':'trái')+'. Nếu không có chủ ý, cân lại cho đoan trang (端庄对称).');
  if(n>8&&symHit/n>.92)add('info','Gần như đối xứng trái–phải tuyệt đối: đoan trang nhưng dễ cứng (呆板). Có thể thêm chút biến hoá dày mảnh hay so le (错落).');
  /* Thưa – dày */
  var Z=zones().filter(function(z){return z.idx;}),dens=[];
  withActive(g,function(){
    var blocks=Z.length?Z:(function(){var B=[];for(var i=0;i<3;i++)for(var j=0;j<3;j++)B.push({r0:Math.round(i*S.rows/3),r1:Math.round((i+1)*S.rows/3),c0:Math.round(j*S.cols/3),c1:Math.round((j+1)*S.cols/3)});return B;})();
    blocks.forEach(function(z){var a=0,k=0;for(var rr=z.r0;rr<z.r1;rr++)for(var cc=z.c0;cc<z.c1;cc++){if(!active(g,rr,cc))continue;a++;k+=at(rr,cc);}if(a)dens.push({d:k/a,z:z});});
  });
  if(Z.length){
    var empty=dens.filter(function(o){return o.d===0;}).map(function(o){return o.z.idx;});
    if(empty.length)add('warn','Vùng chữ số '+empty.join(', ')+' chưa có nét.');
  }
  var ds=dens.map(function(o){return o.d;}).filter(function(d){return d>0;});
  if(ds.length>1&&n>=20){
    var mx=Math.max.apply(null,ds),mn=Math.min.apply(null,ds),ct=mx/mn;
    if(ct<1.4)add('info','Mật độ nét khá đều khắp mặt ấn (chênh '+fmt(ct)+' lần). Thử để vài chỗ thưa, vài chỗ dày cho có “疏密有致”.');
    else if(ct>5)add('info','Thưa–dày chênh rất mạnh ('+fmt(ct)+' lần). Hợp với lối “thưa cho ngựa chạy, dày gió không lọt” nếu có chủ ý.');
    else add('ok','Thưa–dày có chênh lệch ('+fmt(ct)+' lần).');
  }
  var dAll=n/act;
  if(am&&dAll>.55)add('info','Mặt ấn dày nét ('+Math.round(dAll*100)+'% ô). Sách khuyên chữ nhiều nét hợp dương văn (朱文).');
  if(!am&&dAll<.22)add('info','Mặt ấn ít nét ('+Math.round(dAll*100)+'% ô). Sách khuyên chữ ít nét hợp âm văn (白文).');
  if(iso)add('warn','Có '+iso+' chấm rời không nối nét nào — kiểm tra xem có chủ ý không (dễ thành nét vỡ vụn).');
  var T=tokens();if(S.layoutN&&T.length&&T.length!==S.layoutN)add('info','Nội dung có '+T.length+' chữ nhưng bố cục chia '+S.layoutN+' vùng.');
  return out;
}
function renderCheck(){
  var ic={ok:'✓',warn:'!',info:'i'};
  $('check').innerHTML=analyze().map(function(it){return'<li class="'+it[0]+'"><span>'+ic[it[0]]+'</span>'+esc(it[1])+'</li>';}).join('');
}

/* --- Vẽ bằng chạm / chuột --- */
function evPx(e){var rc=ed.getBoundingClientRect(),k=ed.width/rc.width;return[(e.clientX-rc.left)*k,(e.clientY-rc.top)*k];}
function hit(e){
  if(!edG)return null;
  var p=evPx(e),c=Math.floor((p[0]-edG.gx)/edG.cell),r=Math.floor((p[1]-edG.gy)/edG.cell);
  if(r<0||c<0||r>=S.rows||c>=S.cols||!active(edG,r,c))return null;
  return[r,c];
}
function pushHist(){hist.push({rows:S.rows,cols:S.cols,g:grid.slice(),dmg:S.damage.slice()});if(hist.length>200)hist.shift();}
function setCell(r,c,v){
  var P=[[r,c]];
  if(sym==='lr'||sym==='both')P.push([r,S.cols-1-c]);
  if(sym==='tb'||sym==='both')P.push([S.rows-1-r,c]);
  if(sym==='both')P.push([S.rows-1-r,S.cols-1-c]);
  P.forEach(function(p){grid[p[0]*S.cols+p[1]]=v;});
}
function mmPt(e){var p=evPx(e);return[p[0]/edG.mm,p[1]/edG.mm];}
function addDmg(p){var r=num('dr',.8);S.damage.push([+p[0].toFixed(2),+p[1].toFixed(2),r,(Math.random()*1e9)|0]);lastDmg=p;}
function delDmg(p){var r=num('dr',.8);S.damage=S.damage.filter(function(d){return Math.hypot(d[0]-p[0],d[1]-p[1])>d[2]+r*.5;});}
ed.addEventListener('pointerdown',function(e){
  if(!edG)return;
  if(tool==='ref'){if(!REF)return;e.preventDefault();refDrag={p:mmPt(e),ox:REF.ox,oy:REF.oy};try{ed.setPointerCapture(e.pointerId);}catch(_){}return;}
  if(tool==='dmg'||tool==='dmgx'){e.preventDefault();pushHist();var p=mmPt(e);if(tool==='dmg')addDmg(p);else delDmg(p);drag='d';try{ed.setPointerCapture(e.pointerId);}catch(_){}drawFace();return;}
  var h=hit(e);if(!h)return;e.preventDefault();pushHist();
  var cur=at(h[0],h[1]);drag=tool==='paint'?1:tool==='erase'?0:(cur?0:1);
  setCell(h[0],h[1],drag);try{ed.setPointerCapture(e.pointerId);}catch(_){}
  hover=e.pointerType==='mouse'?h:null;drawFace();
});
ed.addEventListener('pointermove',function(e){
  if(!edG)return;
  if(refDrag){var q=mmPt(e);REF.ox=refDrag.ox+q[0]-refDrag.p[0];REF.oy=refDrag.oy+q[1]-refDrag.p[1];drawFace();return;}
  if(drag==='d'){var p=mmPt(e),r=num('dr',.8);if(tool==='dmg'){if(!lastDmg||Math.hypot(p[0]-lastDmg[0],p[1]-lastDmg[1])>r*.7){addDmg(p);drawFace();}}else{delDmg(p);drawFace();}return;}
  if(tool==='dmg'||tool==='dmgx'||tool==='ref')return;
  var h=hit(e),ch=String(h)!==String(hover);
  if(e.pointerType==='mouse')hover=h;
  if(drag!==null&&h&&at(h[0],h[1])!==drag){setCell(h[0],h[1],drag);ch=true;}
  if(ch)drawFace();
});
function endDrag(){drag=null;refDrag=null;lastDmg=null;}
ed.addEventListener('pointerup',endDrag);ed.addEventListener('pointercancel',endDrag);
ed.addEventListener('pointerleave',function(){if(hover){hover=null;drawFace();}});
function setTool(v){tool=v;setSeg('tool',v);setSeg('tool2',v);ed.style.cursor=v==='ref'?'move':'crosshair';}

/* --- Điều khiển --- */
function setGridSize(nr,nc){
  nr=clamp(Math.round(nr)||S.rows,2,80);nc=clamp(Math.round(nc)||S.cols,2,80);
  if(nr===S.rows&&nc===S.cols)return;
  pushHist();
  var ng=new Uint8Array(nr*nc);
  if(count())for(var r=0;r<nr;r++)for(var c=0;c<nc;c++)ng[r*nc+c]=grid[Math.floor((r+.5)*S.rows/nr)*S.cols+Math.floor((c+.5)*S.cols/nc)];
  S.rows=nr;S.cols=nc;grid=ng;drawFace();
}
var FS_LABEL={am:{plain:'Lưu hồng',double:'Khung trắng 口',none:'Ép sát mép'},duong:{plain:'Viền đơn',double:'Viền kép',none:'Không viền'}};
var FS_HINT={
  am:{plain:'Lưu hồng (留红): phần đỏ chừa quanh chữ chính là biên của ấn bạch văn; lề rộng thì ấn thoáng, lề hẹp thì ấn chặt.',
      double:'Khung trắng (口字形边栏): thêm một đường viền trắng quanh chữ, ngoài cùng vẫn chừa đỏ.',
      none:'Ép sát mép (逼边): chữ chạm hoặc gần chạm mép ấn, khí thế mở và căng.'},
  duong:{plain:'Viền đơn: viền dày hơn nét chữ (粗边) cho khung nặng, vững; viền mảnh bằng nét chữ (细边) cho vẻ thanh thoát.',
      double:'Viền kép (双边): hai đường viền đỏ, trang trọng, tăng tính trang trí.',
      none:'Không viền (无边栏): phải xếp chữ vuông, chặt để tạo “biên vô hình”. Nét chạm mép sẽ thành viền mượn (借边).'}};
function syncFaceUI(){
  $('w').value=S.w;$('h').value=S.h;$('rows').value=S.rows;$('cols').value=S.cols;
  $('fr').value=S.frameMm;$('gap').value=S.gapMm;$('ln').value=S.lineMm;$('co').value=S.cornerOut;$('ci').value=S.cornerIn;$('ya').value=S.yaPct;
  $('ratio').value=Math.round(S.ratio*100);$('diag').checked=S.diag;
  setSeg('shape',S.shape);setSeg('mode',S.mode);setSeg('cap',S.cap);setSeg('join',S.join);setSeg('fstyle',S.frameStyle);setSeg('div',S.divider);
  var L=FS_LABEL[S.mode];Array.prototype.forEach.call(root.querySelectorAll('.seg[data-k="fstyle"] button'),function(b){b.textContent=L[b.getAttribute('data-v')];});
  show('hrow',S.shape!=='round');show('yarow',S.shape==='ya');
  show('corow',S.shape==='square'||S.shape==='ya');show('cirow',S.shape==='square'||S.shape==='ya');
  show('frrow',S.frameStyle!=='none');show('lnrow',S.frameStyle==='double'||S.divider!=='none');
  $('frlab').textContent=S.mode==='am'?'Lề đỏ (mm)':'Viền (mm)';
  $('wlab').textContent=S.shape==='round'?'Đường kính (cm)':'Ngang (cm)';
  $('frv').textContent=fmt(S.frameMm)+' mm';$('gapv').textContent=fmt(S.gapMm)+' mm';$('lnv').textContent=fmt(S.lineMm)+' mm';
  $('cov').textContent=fmt(S.cornerOut)+' mm';$('civ').textContent=fmt(S.cornerIn)+' mm';$('yav').textContent=S.yaPct+'%';
  $('ratiov').textContent=Math.round(S.ratio*100)+'%';
  $('fhint').textContent=FS_HINT[S.mode][S.frameStyle]+(S.shape==='square'||S.shape==='ya'?' Sách: góc ngoài thiên tròn, góc trong thiên vuông (内方外圆).':'');
  $('text').value=S.text;$('layn').value=S.layoutN;syncLayoutUI();
}
function syncLayoutUI(){
  var L=layoutList(S.layoutN),sel=$('lay');
  sel.innerHTML=L.length?L.map(function(it){return'<option value="'+it[0]+'">'+esc(it[1])+'</option>';}).join(''):'<option value="">—</option>';
  var c=curLayout();if(c){S.layoutId=c[0];sel.value=c[0];}
  sel.disabled=!L.length;
  var h='';
  if(S.layoutN>0&&c){
    h=c[2]==='hoi'?'Hồi văn: đọc vòng phải trên → trái trên → trái dưới → phải dưới.':c[2]==='rows'?'Các hàng ngang đọc từ trên xuống.':c[2]==='cheo'?'Hai chữ đặt chéo góc, hai góc còn lại để trống.':'Đọc theo cột dọc, từ phải sang trái, trên xuống dưới. Số trong vòng tròn là thứ tự đọc.';
    var nm={'2:tb:all':'日字格','4:22:all':'田字格','3:12:all':'T字格','3:21:all':'T字格','9:333:all':'井字格'}[S.layoutN+':'+c[0]+':'+S.divider];
    if(S.divider==='v')nm=nm||'栅栏式';else if(S.divider==='all'&&!nm)nm='多口形';
    if(nm)h+=' Vách ngăn hiện tại là kiểu '+nm+(S.frameStyle==='none'&&nm==='田字格'?' (không viền ngoài = 十字格)':'')+'.';
    h+=' Sách: chữ ít nét nên chiếm trọn một cột hoặc ô lớn.';
  }else h='Nhập nội dung ấn rồi chọn cách xếp; máy chia lưới thành vùng cho từng chữ theo các mẫu bố cục 1–9 chữ của sách.';
  $('layhint').textContent=h;
}
segOn('shape',function(v){S.shape=v;syncFaceUI();drawFace();});
segOn('mode',function(v){S.mode=v;syncFaceUI();drawFace();});
segOn('fstyle',function(v){S.frameStyle=v;syncFaceUI();drawFace();});
segOn('cap',function(v){S.cap=v;drawFace();});
segOn('join',function(v){S.join=v;drawFace();});
segOn('div',function(v){S.divider=v;syncFaceUI();drawFace();});
segOn('tool',function(v){setTool(v);});
segOn('tool2',function(v){if(v==='ref'&&!REF){setTool('toggle');say($('msg'),'Hãy chọn ảnh mẫu trước (mục Ảnh mẫu).',1);return;}setTool(v);});
$('w').addEventListener('input',function(){S.w=clamp(num('w',S.w),.5,20);drawFace();});
$('h').addEventListener('input',function(){S.h=clamp(num('h',S.h),.5,20);drawFace();});
[['fr','frameMm',0,5],['gap','gapMm',0,5],['ln','lineMm',.2,3],['co','cornerOut',0,6],['ci','cornerIn',0,4],['ya','yaPct',8,40]].forEach(function(a){
  $(a[0]).addEventListener('input',function(){S[a[1]]=clamp(num(a[0],S[a[1]]),a[2],a[3]);syncFaceUI();drawFace();});
});
$('ratio').addEventListener('input',function(){S.ratio=num('ratio',86)/100;syncFaceUI();drawFace();});
$('diag').addEventListener('change',function(){S.diag=this.checked;drawFace();});
$('showgrid').addEventListener('change',function(){showGrid=this.checked;drawFace();});
$('showlay').addEventListener('change',function(){showLay=this.checked;drawFace();});
$('gdiag').addEventListener('change',function(){guides.diag=this.checked;drawFace();});
$('gthird').addEventListener('change',function(){guides.third=this.checked;drawFace();});
$('heat').addEventListener('change',function(){heat=this.checked;drawFace();});
$('sym').addEventListener('change',function(){sym=this.value;});
$('rows').addEventListener('change',function(){setGridSize(num('rows',S.rows),S.cols);syncFaceUI();});
$('cols').addEventListener('change',function(){setGridSize(S.rows,num('cols',S.cols));syncFaceUI();});
$('text').addEventListener('input',function(){S.text=this.value;var n=tokens().length;if(n){S.layoutN=Math.min(n,30);$('layn').value=S.layoutN;}syncLayoutUI();drawFace();});
$('layn').addEventListener('input',function(){S.layoutN=clamp(Math.round(num('layn',0)),0,30);syncLayoutUI();drawFace();});
$('lay').addEventListener('change',function(){S.layoutId=this.value;syncLayoutUI();drawFace();});
$('undo').addEventListener('click',function(){var h=hist.pop();if(!h)return;S.rows=h.rows;S.cols=h.cols;grid=h.g;S.damage=h.dmg||[];syncFaceUI();drawFace();});
$('clear').addEventListener('click',function(){if(!count())return;if(!confirm('Xoá hết các ô đã tô?'))return;pushHist();grid=new Uint8Array(S.rows*S.cols);drawFace();});
Array.prototype.forEach.call(root.querySelectorAll('[data-sh]'),function(b){b.addEventListener('click',function(){
  var d=b.getAttribute('data-sh').split(',').map(Number),ng=new Uint8Array(S.rows*S.cols);pushHist();
  for(var r=0;r<S.rows;r++)for(var c=0;c<S.cols;c++){var rr=r-d[0],cc=c-d[1];ng[r*S.cols+c]=at(rr,cc);}
  grid=ng;drawFace();
});});
document.addEventListener('keydown',function(e){if((e.ctrlKey||e.metaKey)&&e.key==='z'&&!$('face').classList.contains('hide')&&!/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)){e.preventDefault();$('undo').click();}});

/* --- Tàn khuyết --- */
['dr','dn'].forEach(function(id){$(id).addEventListener('input',function(){$(id+'v').textContent=id==='dr'?fmt(num('dr',.8))+' mm':num('dn',10);});});
$('drv').textContent=fmt(.8)+' mm';$('dnv').textContent='10';
$('dauto').addEventListener('click',function(){
  var g=geo(100),N=Math.round(num('dn',10)),rr=num('dr',.8),R=rng((Date.now()&0xffffff)|1),W=S.w*10,H=sealH()*10,band=S.frameStyle==='none'?.6:Math.max(.4,S.mode==='am'?S.frameMm*.7:S.frameMm),k=0,tries=0;
  pushHist();
  while(k<N&&tries<N*20){
    tries++;var x,y,d=R()*band;
    if(S.shape==='round'||S.shape==='oval'){var a=R()*Math.PI*2,ax=W/2-d,ay=(S.shape==='round'?W:H)/2-d;x=W/2+Math.cos(a)*ax;y=H/2+Math.sin(a)*ay;}
    else{var side=Math.floor(R()*4),t=R();x=side===0||side===2?t*W:side===1?W-d:d;y=side===1||side===3?t*H:side===0?d:H-d;
      if(S.shape==='ya'&&!inside(g,x*10,y*10,0))continue;}
    S.damage.push([+x.toFixed(2),+y.toFixed(2),+(rr*(.5+.8*R())).toFixed(2),(R()*1e9)|0]);k++;
  }
  drawFace();say($('msg'),'Đã thêm '+k+' vết vỡ ở viền. Không vừa ý thì bấm Hoàn tác.');
});
$('dclear').addEventListener('click',function(){if(!S.damage.length)return;pushHist();S.damage=[];drawFace();});

/* --- Ảnh mẫu --- */
function refUI(){['rop','rsc','rth'].forEach(function(id){$(id+'v').textContent=num(id,0)+'%';});}
refUI();
$('rpick').addEventListener('click',function(){$('rfile').click();});
$('rfile').addEventListener('change',function(){
  var f=this.files[0];if(!f)return;var rd=new FileReader();
  rd.onload=function(){var im=new Image();im.onload=function(){REF={img:im,op:num('rop',45)/100,scale:num('rsc',100),ox:0,oy:0,mirror:$('rmir').checked,show:$('rshow').checked,ink:REF?REF.ink:'dark'};REF.ink=root.querySelector('.seg[data-k="rink"] .on').getAttribute('data-v');drawFace();say($('msg'),'Đã mở ảnh mẫu. Dùng công cụ “Dời ảnh mẫu” để kéo cho khớp.');};im.src=rd.result;};
  rd.readAsDataURL(f);this.value='';
});
$('rdel').addEventListener('click',function(){REF=null;if(tool==='ref')setTool('toggle');drawFace();});
$('rop').addEventListener('input',function(){refUI();if(REF){REF.op=num('rop',45)/100;drawFace();}});
$('rsc').addEventListener('input',function(){refUI();if(REF){REF.scale=num('rsc',100);drawFace();}});
$('rth').addEventListener('input',refUI);
$('rshow').addEventListener('change',function(){if(REF){REF.show=this.checked;drawFace();}});
$('rmir').addEventListener('change',function(){if(REF){REF.mirror=this.checked;drawFace();}});
segOn('rink',function(v){if(REF)REF.ink=v;});
$('rconv').addEventListener('click',function(){
  if(!REF){say($('msg'),'Hãy chọn ảnh mẫu trước.',1);return;}
  var ppc=120,g=geo(ppc),cv=document.createElement('canvas');cv.width=Math.round(g.W);cv.height=Math.round(g.H);
  var cx=cv.getContext('2d');cx.fillStyle='#fff';cx.fillRect(0,0,cv.width,cv.height);drawRefImg(cx,g,1);
  var D=cx.getImageData(0,0,cv.width,cv.height).data,thr=num('rth',45)/100,ink=REF.ink||'dark',cs=g.cell,changed=0;
  function score(x,y){x=clamp(Math.round(x),0,cv.width-1);y=clamp(Math.round(y),0,cv.height-1);var i=(y*cv.width+x)*4,r=D[i],gg=D[i+1],b=D[i+2],lum=(.299*r+.587*gg+.114*b)/255;
    if(ink==='light')return lum;if(ink==='red')return clamp((r-(gg+b)/2)/140,0,1);return 1-lum;}
  pushHist();
  for(var r=0;r<S.rows;r++)for(var c=0;c<S.cols;c++){
    if(!active(g,r,c))continue;var s=0,k=0;
    for(var i=0;i<5;i++)for(var j=0;j<5;j++){s+=score(g.gx+(c+.2+.15*j)*cs,g.gy+(r+.2+.15*i)*cs);k++;}
    var v=s/k>=thr?1:0;if(grid[r*S.cols+c]!==v){grid[r*S.cols+c]=v;changed++;}
  }
  drawFace();say($('msg'),'Đã chuyển ảnh thành nét ('+changed+' ô thay đổi). Chỉnh “Ngưỡng” rồi chuyển lại nếu nét quá dày hoặc quá mảnh; bấm Hoàn tác để trở lại.');
});

/* --- Dữ liệu ấn (dùng cho lưu, mở lại, và phân tích cấu trúc chữ) --- */
function faceData(){var d={v:2,grid:Array.prototype.join.call(grid,'')};FIELDS.forEach(function(k){d[k]=S[k];});d.h=sealH();return d;}
function gridText(){var out=[];for(var r=0;r<S.rows;r++){var s='';for(var c=0;c<S.cols;c++)s+=at(r,c)?'█':'·';out.push(s);}return out.join('\n');}
function shapeLabel(){return{square:'Vuông',round:'Tròn',oval:'Bầu dục',ya:'Chữ 亚'}[S.shape];}
function faceMeta(){return{shapeLabel:shapeLabel(),w:S.w,h:sealH(),modeLabel:S.mode==='am'?'Âm văn':'Dương văn',rows:S.rows,cols:S.cols,count:count(),gridText:gridText()};}
function loadFace(d,name){
  if(!d||!d.grid)throw new Error('dữ liệu không hợp lệ');
  pushHist();
  var nS=JSON.parse(JSON.stringify(DEF));if(!d.v||d.v<2)nS.cornerOut=0;
  FIELDS.forEach(function(k){if(d[k]!==undefined)nS[k]=d[k];});
  nS.h=d.h||nS.w;if(!Array.isArray(nS.damage))nS.damage=[];
  S=nS;grid=new Uint8Array(S.rows*S.cols);for(var i=0;i<grid.length;i++)grid[i]=d.grid.charAt(i)==='1'?1:0;
  if(name)$('name').value=name;
  syncFaceUI();drawFace();
}
function faceTitle(){return $('name').value.trim();}
function faceInfoLine(){
  var cellMm=geo(100).cell/10;
  return (S.shape==='round'?'Tròn Ø '+fmt(S.w)+' cm':shapeLabel()+' '+fmt(S.w)+' × '+fmt(S.h)+' cm')+' · '+(S.mode==='am'?'Âm văn (白文)':'Dương văn (朱文)')+' · '+FS_LABEL[S.mode][S.frameStyle]+' · lưới '+S.rows+' × '+S.cols+' (ô '+fmt(cellMm)+' mm, nét '+fmt(cellMm*S.ratio)+' mm)';
}
function carveSteps(){
  var am=S.mode==='am',s=[];
  s.push('Mài phẳng mặt đá: mài thô trên đĩa đá mài, mài tinh trên gạch xanh vừa xối nước, đưa tay theo hình số 8.');
  s.push('Chuyển bản lên đá: úp <b>bản thuận</b> mặt mực xuống mặt đá rồi miết (cách thủy ấn), hoặc nhìn <b>bản lật ngược</b> mà chép, can lên đá. Soi gương nhỏ để kiểm tra trước khi hạ dao.');
  s.push(am?'Âm văn (白文): góc dao <b>hướng vào nét</b> (向线落刀). Khắc tất cả nét ngang trước, rồi nét dọc, cuối cùng nét cong và xiên.':'Dương văn (朱文): góc dao <b>quay lưng khỏi nét</b> (背线落刀), áp sát mép ngoài nét mà cắt, xoay đá để khắc phía bên kia; khắc bỏ nền giữa các nét.');
  if(dividerSegs().length)s.push('Vách ngăn: khắc như một nét dài; giữ thẳng và đều với viền.');
  if(S.damage.length||S.frameStyle!=='none')s.push('Viền và các chỗ tàn khuyết: <b>để làm sau cùng</b>, khi chữ đã xong.');
  s.push('Chải sạch vụn đá (không thổi), đóng thử, soát 12 nét bệnh và 8 ấn bệnh. Sửa ít, rồi hoàn thiện góc, viền, nền (收拾). Giữ 四要四不: 稳·准·狠·匀, không dừng dao giữa nét, không sửa lặp tuỳ tiện.');
  return s;
}
function printFace(){
  var name=faceTitle()||'(chưa đặt tên)';
  var imp=faceCanvas(DPI).toDataURL('image/png'),mir=faceCanvas(DPI,{mirror:true}).toDataURL('image/png');
  var big=Math.min(16,Math.max(8,S.w*3)),bigH=big*sealH()/S.w;
  if(bigH>15){big=big*15/bigH;bigH=15;}
  var gm=faceCanvas(300,{mirror:true,grid:true},big).toDataURL('image/png');
  var W=S.w+'cm',H=sealH()+'cm',T=tokens();
  var chk=analyze().map(function(it){return'<li>'+(it[0]==='warn'?'⚠ ':'')+esc(it[1])+'</li>';}).join('');
  printHTML('Ấn '+name,
    '<h1>Ấn: '+esc(name)+'</h1><div class="meta">'+esc(faceInfoLine())+(T.length?'<br>Nội dung: '+esc(S.text.trim())+(curLayout()?' · bố cục '+esc(curLayout()[1]):''):'')+'<br>In lúc '+stamp()+' · in đúng tỷ lệ 100% (không “vừa trang”)</div>'+
    '<div class="row"><figure><img src="'+imp+'" style="width:'+W+';height:'+H+'">Dấu in · kích thước thật</figure>'+
    '<figure><img src="'+imp+'" style="width:'+W+';height:'+H+'">Bản thuận · úp mặt mực xuống đá</figure>'+
    '<figure><img src="'+mir+'" style="width:'+W+';height:'+H+'">Bản lật ngược · để chép, can lên đá</figure></div>'+
    '<figure style="text-align:left;max-width:none"><img src="'+gm+'" style="width:'+big+'cm;height:'+fmt(bigH).replace(',','.')+'cm;margin:0 0 2mm">Bản lưới phóng to (đã lật ngược) để dựng nét khi khắc</figure>'+
    '<h2 class="pb">Trình tự khắc</h2><ol>'+carveSteps().map(function(s){return'<li>'+s+'</li>';}).join('')+'</ol>'+
    '<h2>Soát chương pháp</h2><ul>'+chk+'</ul>');
}
$('print').addEventListener('click',printFace);
$('png').addEventListener('click',function(){faceCanvas(DPI).toBlob(function(b){download(b,safeName(faceTitle())+'.png');});});
$('json').addEventListener('click',function(){var d=faceData();d.name=faceTitle();download(new Blob([JSON.stringify(d,null,1)],{type:'application/json'}),safeName(faceTitle())+'.json');});
$('openjson').addEventListener('click',function(){$('jsonfile').click();});
$('jsonfile').addEventListener('change',function(){var f=this.files[0];if(!f)return;var rd=new FileReader();rd.onload=function(){try{var d=JSON.parse(rd.result);loadFace(d,d.name);say($('msg'),'Đã mở “'+esc(d.name||f.name)+'”.');}catch(err){say($('msg'),'Không đọc được tệp: '+esc(err.message),1);}};rd.readAsText(f);this.value='';});

$('confirm').addEventListener('click',function(){
  var name=faceTitle(),m=$('msg');
  if(!name){say(m,'Hãy đặt tên ấn trước khi chốt.',1);$('name').focus();return;}
  if(!count()){say(m,'Mặt ấn chưa có nét nào.',1);return;}
  var warn=analyze().filter(function(it){return it[0]==='warn';}).length;
  if(!confirm('Chốt ấn “'+name+'”?'+(warn?'\nPhần soát chương pháp còn '+warn+' điểm cần xem lại.':'')+'\nẢnh sẽ được lưu lên Drive và mở bản in khắc.'))return;
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
   THÂN ẤN · bản trải 4 mặt + biên khoản
   ===================================================== */
var B={w:2,d:2,h:5,tab:true,mode:'one',face:0},LY={all:null,f:[null,null,null,null]},NAMES=['Trước','Phải','Sau','Trái'],TAB=.6;
var K={on:true,kt:'don',script:'viet',author:'',verb:0,rec:'',hum:0,year:true,season:0,place:'',text:'',font:3.2,order:'start'};
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

/* --- Biên khoản --- */
var KW={
  viet:{verb:['khắc','triện','chế','tạc','san','tuyên'],hum:['nhã chúc','chỉ chính','phủ chính','chính chi'],season:['','xuân','hạ','thu','đông'],
        stem:['Giáp','Ất','Bính','Đinh','Mậu','Kỷ','Canh','Tân','Nhâm','Quý'],branch:['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi']},
  han:{verb:['刻','篆','制','凿','刊','镌'],hum:['雅属','指正','斧正','正之'],season:['','春','夏','秋','冬'],
        stem:'甲乙丙丁戊己庚辛壬癸'.split(''),branch:'子丑寅卯辰巳午未申酉戌亥'.split('')}
};
function canChi(sc){var y=new Date().getFullYear(),w=KW[sc];return w.stem[((y-4)%10+10)%10]+(sc==='viet'?' ':'')+w.branch[((y-4)%12+12)%12];}
function fillKSelects(){
  var w=KW[K.script];
  $('kverb').innerHTML=w.verb.map(function(v,i){return'<option value="'+i+'">'+v+'</option>';}).join('');
  $('khum').innerHTML=w.hum.map(function(v,i){return'<option value="'+i+'">'+v+'</option>';}).join('');
  $('kseason').innerHTML=w.season.map(function(v,i){return'<option value="'+i+'">'+(v||'(không mùa)')+'</option>';}).join('');
  $('kverb').value=K.verb;$('khum').value=K.hum;$('kseason').value=K.season;$('kcc').textContent=canChi(K.script);
}
function composeK(){
  if(K.kt==='tu')return;
  var w=KW[K.script],sp=K.script==='viet'?' ':'',time=[];
  if(K.year)time.push(canChi(K.script));if(+K.season)time.push(w.season[K.season]);
  var tail=[time.join(sp),K.place,K.author,K.author?w.verb[K.verb]:''].filter(Boolean).join(sp);
  var t=K.kt==='song'?[[K.rec,K.rec?w.hum[K.hum]:''].filter(Boolean).join(sp),tail].filter(Boolean).join('\n'):tail;
  K.text=t;$('ktext').value=t;
}
function syncK(){
  $('kon').checked=K.on;setSeg('kt',K.kt);setSeg('ks',K.script);setSeg('korder',K.order);
  $('kau').value=K.author;$('krec').value=K.rec;$('kyear').checked=K.year;$('kplace').value=K.place;$('ktext').value=K.text;$('kfont').value=K.font;$('kfontv').textContent=fmt(K.font)+' mm';
  show('krecrow',K.kt==='song');['kaurow','kyrow','kplrow'].forEach(function(id){show(id,K.kt!=='tu');});
  fillKSelects();
}
/* Xếp chữ khoản: cột dọc, đọc từ phải sang trái; hết mặt thì sang mặt kế theo 始于左 hoặc 终于左. */
var mctx=document.createElement('canvas').getContext('2d');
function kFont(px){return K.script==='han'?'500 '+px+'px "Noto Serif CJK SC","Songti SC","SimSun",serif':'500 '+px+'px "Noto Serif","Times New Roman",serif';}
function kLines(){
  return String(K.text||'').split('\n').map(function(l){l=l.trim();return K.script==='han'?Array.from(l.replace(/\s+/g,'')):(l?l.split(/\s+/):[]);}).filter(function(a){return a.length;});
}
function kFlow(seq){
  var F=faces(),fm=K.font/10,lh=fm*1.28,cw=fm*1.5,lines=kLines(),out=[],fi=0,col=0,rowi=0;
  if(!lines.length)return{items:[],used:[],over:false};
  function geom(i){var f=F[seq[i]],m=Math.max(.15,f.w*.1),mt=Math.max(.25,B.h*.06);return{f:f,m:m,mt:mt,ncol:Math.max(1,Math.floor((f.w-2*m)/cw)),nrow:Math.max(1,Math.floor((B.h-2*mt)/lh))};}
  var G=geom(0),used=[seq[0]];
  function nextCol(){col++;rowi=0;if(col>=G.ncol){fi++;col=0;if(fi>=seq.length)return false;G=geom(fi);used.push(seq[fi]);}return true;}
  for(var li=0;li<lines.length;li++){
    if(li>0&&!nextCol())return{items:out,used:used,over:true};
    var L=lines[li];
    for(var t=0;t<L.length;t++){
      if(rowi>=G.nrow&&!nextCol())return{items:out,used:used,over:true};
      var colW=(G.f.w-2*G.m)/G.ncol,x=G.f.x+G.f.w-G.m-(col+.5)*colW,y=G.mt+(rowi+.5)*lh;
      out.push({t:L[t],x:x,y:y,face:seq[fi],colW:Math.min(colW,cw)});rowi++;
    }
  }
  return{items:out,used:used,over:false};
}
function kLayout(){
  if(!K.on)return null;
  if(K.order==='start')return kFlow([3,2,1,0]);
  for(var k=1;k<=4;k++){var r=kFlow([0,1,2,3].slice(4-k));if(!r.over||k===4)return r;}
}
function drawKhoan(ctx,ppc,o){
  var L=kLayout();if(!L||!L.items.length)return L;
  var fm=K.font/10;
  if(o.labels){var F=faces();ctx.save();ctx.strokeStyle='rgba(184,38,28,.55)';ctx.setLineDash([.08*ppc,.06*ppc]);ctx.lineWidth=Math.max(1,.02*ppc);L.used.forEach(function(i){var f=F[i];ctx.strokeRect((f.x+.06)*ppc,.06*ppc,(f.w-.12)*ppc,(B.h-.12)*ppc);});ctx.restore();}
  ctx.save();ctx.fillStyle='#2b2520';ctx.textAlign='center';ctx.textBaseline='middle';
  L.items.forEach(function(it){
    var px=fm*ppc;mctx.font=kFont(100);var tw=mctx.measureText(it.t).width/100*px,mw=it.colW*ppc*.95;
    if(tw>mw)px=px*mw/tw;ctx.font=kFont(px);ctx.fillText(it.t,it.x*ppc,it.y*ppc);
  });
  ctx.restore();return L;
}

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
  var KL=drawKhoan(ctx,ppc,o);
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
    ctx.textBaseline='bottom';ctx.fillStyle='#8a7d70';ctx.font=Math.round(fs*.85)+'px Arial';ctx.fillText('▼ mặt ấn',6,H*ppc-4);
    if(B.mode==='four'){var f=F[B.face];ctx.strokeStyle='#1d6fd8';ctx.lineWidth=2*dpr();ctx.strokeRect(f.x*ppc+dpr(),dpr(),f.w*ppc-2*dpr(),f.h*ppc-2*dpr());}
  }
  return KL;
}
function bodyCanvas(dpi){var ppc=dpi/2.54,cv=document.createElement('canvas');cv.width=Math.round(total()*ppc);cv.height=Math.round(B.h*ppc);renderBody(cv.getContext('2d'),ppc,{});return cv;}
function drawBody(){
  var box=$('stage-body'),availW=Math.min((box.clientWidth||600)-28,900),k=dpr();if(availW<160)availW=320;
  var css=Math.min(availW/total(),460/B.h);bPPC=css*k;
  bed.width=Math.round(total()*bPPC);bed.height=Math.round(B.h*bPPC);bed.style.width=(bed.width/k)+'px';bed.style.height=(bed.height/k)+'px';
  var KL=renderBody(bctx,bPPC,{labels:true});
  $('binfo').textContent='Bản trải '+fmt(total())+' × '+fmt(B.h)+' cm · Trước '+fmt(B.w)+' · Phải '+fmt(B.d)+' · Sau '+fmt(B.w)+' · Trái '+fmt(B.d)+' cm · mép trên = đỉnh ấn, mép dưới = mặt ấn · nét liền = cắt, nét đứt = gấp';
  var l=cur();$('bscale').value=l?Math.round(l.pct):100;$('bscalev').textContent=(l?Math.round(l.pct):100)+'%';
  var info='';
  if(K.on&&KL&&KL.items.length){info='Khoản '+KL.items.length+' chữ, trên '+KL.used.length+' mặt: '+KL.used.map(function(i){return NAMES[i];}).join(' → ')+'.';if(KL.over)info+=' Khoản dài hơn chỗ chứa — giảm cỡ chữ hoặc bớt chữ.';}
  else if(K.on)info='Chưa có nội dung khoản.';
  $('kinfo').textContent=info;
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
/* điều khiển khoản */
$('kon').addEventListener('change',function(){K.on=this.checked;drawBody();});
segOn('kt',function(v){K.kt=v;syncK();composeK();drawBody();});
segOn('ks',function(v){K.script=v;K.verb=0;K.hum=0;K.season=0;syncK();composeK();drawBody();});
segOn('korder',function(v){K.order=v;drawBody();});
[['kau','author'],['krec','rec'],['kplace','place']].forEach(function(a){$(a[0]).addEventListener('input',function(){K[a[1]]=this.value.trim();composeK();drawBody();});});
[['kverb','verb'],['khum','hum'],['kseason','season']].forEach(function(a){$(a[0]).addEventListener('change',function(){K[a[1]]=+this.value;composeK();drawBody();});});
$('kyear').addEventListener('change',function(){K.year=this.checked;composeK();drawBody();});
$('ktext').addEventListener('input',function(){K.text=this.value;drawBody();});
$('kfont').addEventListener('input',function(){K.font=num('kfont',3.2);$('kfontv').textContent=fmt(K.font)+' mm';drawBody();});

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
  var name=bodyName()||'(chưa đặt tên)',T=total(),land=T>18.5,KL=kLayout();
  var kl=K.on&&KL&&KL.items.length?'<br>Biên khoản: '+esc(String(K.text).replace(/\n/g,' / '))+' · trên mặt '+KL.used.map(function(i){return NAMES[i];}).join(' → ')+' · khắc chữ xuôi':'';
  printHTML('Thân ấn '+name,'<h1>Thân ấn: '+esc(name)+'</h1><div class="meta">Thân '+fmt(B.w)+' × '+fmt(B.d)+' × cao '+fmt(B.h)+' cm · bản trải '+fmt(T)+' × '+fmt(B.h)+' cm (Trước – Phải – Sau – Trái'+(B.tab?' – mép dán':'')+')'+kl+'<br>Mép trên = đỉnh ấn, mép dưới = mặt ấn · nét liền: cắt · nét đứt: gấp · in đúng tỷ lệ 100% · '+stamp()+'</div>'+
    '<img src="'+bodyCanvas(DPI).toDataURL('image/png')+'" style="width:'+T+'cm;height:'+B.h+'cm;margin:0">',land);
}
$('bprint').addEventListener('click',printBody);
$('bpng').addEventListener('click',function(){bodyCanvas(DPI).toBlob(function(b){download(b,safeName(bodyName())+' - than an.png');});});
$('bconfirm').addEventListener('click',function(){
  var name=bodyName(),m=$('bmsg');
  if(!name){say(m,'Hãy đặt tên (hoặc đặt tên ấn ở thẻ Mặt ấn).',1);$('bname').focus();return;}
  say(m,'Đang lưu lên Drive…');
  post({action:'save',type:'body',name:name,png:bodyCanvas(DPI).toDataURL('image/png'),meta:{shapeLabel:'Thân 4 mặt',w:B.w,h:B.h,d:B.d},data:{v:2,w:B.w,d:B.d,h:B.h,tab:B.tab,mode:B.mode,khoan:K}})
    .then(function(j){say(m,'Đã lưu · <a href="'+esc(j.url)+'" target="_blank" rel="noopener">mở ảnh trên Drive</a>');})
    .catch(function(err){say(m,'Chưa lưu được: '+esc(err.message)+'. Bạn vẫn có thể Tải PNG.',1);});
  printBody();
});

/* ---------- Khởi động ---------- */
syncFaceUI();syncK();drawFace();
var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){if($('body').classList.contains('hide'))drawFace();else drawBody();},150);});
window.ATX={S:function(){return S;},grid:function(){return grid;},load:loadFace,data:faceData,analyze:analyze,K:K,kLayout:kLayout,version:VERSION};
})();
