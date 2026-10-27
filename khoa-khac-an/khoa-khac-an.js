/* Khoá học Khắc ấn triện Online 52 buổi – thudao.com.
   Trang Blogspot: <div id="kka"></div> + window.KKA_CONFIG = { DESIGN_URL: "<link trang Thiết kế ấn triện>" }
   Cần tải khoa-khac-an-data.js trước tệp này. */
(function(){
'use strict';
var VERSION='1.0.1';
var D=window.KKA_DATA;
var root=document.getElementById('kka');
if(!root){root=document.createElement('div');root.id='kka';(document.currentScript&&document.currentScript.parentNode||document.body).appendChild(root);}
if(!D){root.textContent='Chưa tải được dữ liệu khoá học.';return;}
root.textContent='';
var CFG=window.KKA_CONFIG||{},DESIGN=String(CFG.DESIGN_URL||'').replace(/&amp;/g,'&').trim();
var TERM={};D.terms.forEach(function(t){TERM[t.id]=t;t.n=[];});
D.lessons.forEach(function(l){l.k.forEach(function(k){if(TERM[k]&&TERM[k].n.indexOf(l.n)<0)TERM[k].n.push(l.n);});});

function el(tag,cls,text){var e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e;}
function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d');}
var done={};try{done=JSON.parse(localStorage.getItem('kka-done')||'{}')||{};}catch(_){done={};}
function saveDone(){try{localStorage.setItem('kka-done',JSON.stringify(done));}catch(_){}}

/* ---------- Khung trang ---------- */
var head=el('header','kka-head');
head.appendChild(el('p','kka-kicker','Thư Đạo · Khoá học Online'));
head.appendChild(el('h2','kka-title','Khắc ấn triện cho người mới · 52 buổi'));
head.appendChild(el('p','kka-lead','Đi từ cầm dao, mài đá, viết chữ triện đến khắc trọn một con ấn, lâm mô ấn cổ, bố cục, viền, sáng tác, biên khoản và dùng ấn trên thư pháp. Mỗi buổi có mục tiêu, nội dung và bài tập nộp cho lớp.'));
var stats=el('div','kka-stats');
[['52','buổi học'],[String(D.phases.length),'giai đoạn'],[String(D.terms.length),'khái niệm'],['','']].forEach(function(s,i){if(i===3){var p=el('div','kka-stat kka-prog');p.id='kka-prog';stats.appendChild(p);return;}var b=el('div','kka-stat');b.appendChild(el('b',null,s[0]));b.appendChild(el('span',null,s[1]));stats.appendChild(b);});
head.appendChild(stats);
root.appendChild(head);

var bar=el('div','kka-bar');
var tabs=el('div','kka-tabs');
var tbL=el('button','on','Lộ trình 52 buổi'),tbT=el('button',null,'Mục lục khái niệm');
tabs.appendChild(tbL);tabs.appendChild(tbT);
var search=el('input','kka-search');search.type='search';search.placeholder='Tìm buổi học, khái niệm… (gõ không dấu được)';
bar.appendChild(tabs);bar.appendChild(search);
root.appendChild(bar);

var paneL=el('section','kka-pane'),paneT=el('section','kka-pane kka-hide');
root.appendChild(paneL);root.appendChild(paneT);
var ver=el('p','kka-ver','Biên soạn, diễn giải từ sách “Học triện khắc thế nào” (Vương Bản Hưng, 2007) và kiến thức chung về nghề khắc ấn; bài tập là nhiệm vụ của lớp. Phiên bản '+VERSION+'.');
root.appendChild(ver);

/* ---------- Lộ trình ---------- */
var chips=el('div','kka-chips'),phaseOn='all';
function chip(id,label){var b=el('button','kka-chip'+(id==='all'?' on':''),label);b.setAttribute('data-p',id);chips.appendChild(b);}
chip('all','Tất cả');D.phases.forEach(function(p,i){chip(p.id,(i+1)+'. '+p.name);});
paneL.appendChild(chips);
var lessonEls={},phaseEls={};
D.phases.forEach(function(p,pi){
  var sec=el('div','kka-phase');sec.setAttribute('data-p',p.id);
  var h=el('div','kka-phase-h');
  h.appendChild(el('span','kka-phase-no','Giai đoạn '+(pi+1)));
  h.appendChild(el('h3',null,p.name));
  h.appendChild(el('span','kka-phase-range','Buổi '+p.from+'–'+p.to));
  sec.appendChild(h);
  sec.appendChild(el('p','kka-phase-desc',p.desc));
  D.lessons.filter(function(l){return l.n>=p.from&&l.n<=p.to;}).forEach(function(l){
    var d=el('details','kka-lesson');d.id='kka-b'+l.n;l.text=norm([l.t,l.g,l.c.join(' '),l.b.join(' ')].join(' '));
    var s=el('summary');
    var no=el('span','kka-no',String(l.n));s.appendChild(no);
    var tw=el('span','kka-sum');tw.appendChild(el('b',null,l.t));tw.appendChild(el('span',null,l.g));s.appendChild(tw);
    var ck=el('label','kka-done');var cb=el('input');cb.type='checkbox';cb.checked=!!done[l.n];cb.title='Đánh dấu đã học';
    cb.addEventListener('click',function(e){e.stopPropagation();});
    cb.addEventListener('change',function(){if(cb.checked)done[l.n]=1;else delete done[l.n];saveDone();d.classList.toggle('is-done',cb.checked);prog();});
    ck.appendChild(cb);ck.appendChild(el('span',null,'Đã học'));ck.addEventListener('click',function(e){e.stopPropagation();});s.appendChild(ck);
    d.classList.toggle('is-done',!!done[l.n]);
    d.appendChild(s);
    var body=el('div','kka-body');
    body.appendChild(el('h4',null,'Nội dung'));
    var ul=el('ul');l.c.forEach(function(x){ul.appendChild(el('li',null,x));});body.appendChild(ul);
    body.appendChild(el('h4',null,'Bài tập'));
    var ol=el('ol','kka-tasks');l.b.forEach(function(x){ol.appendChild(el('li',null,x));});body.appendChild(ol);
    if(l.k.length){
      body.appendChild(el('h4',null,'Khái niệm trong buổi'));
      var kc=el('div','kka-terms');
      l.k.forEach(function(k){var t=TERM[k];if(!t)return;var b=el('button','kka-tchip',t.t);b.title=t.d;b.addEventListener('click',function(){showTerm(k);});kc.appendChild(b);});
      body.appendChild(kc);
    }
    if(l.design){
      var dz=el('div','kka-design');
      if(DESIGN){var a=el('a','kka-btn','Mở trang Thiết kế ấn triện');a.href=DESIGN;a.target='_blank';a.rel='noopener';dz.appendChild(a);}
      else dz.appendChild(el('span',null,'Buổi này dùng trang Thiết kế ấn triện của lớp.'));
      body.appendChild(dz);
    }
    d.appendChild(body);sec.appendChild(d);lessonEls[l.n]=d;
  });
  sec.appendChild(el('p','kka-src','Nguồn: '+p.src));
  paneL.appendChild(sec);phaseEls[p.id]=sec;
});
var emptyL=el('p','kka-empty kka-hide','Không có buổi học nào khớp với từ tìm kiếm.');paneL.appendChild(emptyL);
chips.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;phaseOn=b.getAttribute('data-p');Array.prototype.forEach.call(chips.children,function(c){c.classList.toggle('on',c===b);});filter();});
function prog(){var n=Object.keys(done).length;var p=document.getElementById('kka-prog');p.textContent='';p.appendChild(el('b',null,n+'/52'));p.appendChild(el('span',null,'đã học'));var bar=el('i');bar.style.width=Math.round(n/52*100)+'%';p.appendChild(bar);}
prog();

/* ---------- Mục lục khái niệm ---------- */
var sorted=D.terms.slice().sort(function(a,b){return a.t.localeCompare(b.t,'vi');});
function letter(t){var c=t.t.charAt(0).toUpperCase();var b=norm(c).toUpperCase();return c==='Đ'?'Đ':b;}
var idx=el('div','kka-alpha'),groups={},order=[];
sorted.forEach(function(t){var L=letter(t);if(!groups[L]){groups[L]=[];order.push(L);}groups[L].push(t);});
paneT.appendChild(el('p','kka-phase-desc','Các khái niệm cơ bản của nghề khắc ấn, xếp theo vần. Bấm số buổi để mở bài học có khái niệm đó.'));
paneT.appendChild(idx);
var termEls={};
order.forEach(function(L){
  var a=el('button',null,L);a.addEventListener('click',function(){var g=document.getElementById('kka-g-'+norm(L)+(L==='Đ'?'dd':''));if(g)g.scrollIntoView({behavior:'smooth',block:'start'});});idx.appendChild(a);
  var g=el('div','kka-group');g.id='kka-g-'+norm(L)+(L==='Đ'?'dd':'');g.appendChild(el('h3','kka-letter',L));
  groups[L].forEach(function(t){
    var c=el('div','kka-term');c.id='kka-t-'+t.id;t.text=norm([t.t,t.a,t.d].join(' '));
    var h=el('div','kka-term-h');h.appendChild(el('b',null,t.t));if(t.a)h.appendChild(el('span',null,t.a));c.appendChild(h);
    c.appendChild(el('p',null,t.d));
    if(t.n.length){var r=el('div','kka-term-n');r.appendChild(el('span',null,'Buổi:'));t.n.sort(function(a,b){return a-b;}).forEach(function(n){var b=el('button',null,String(n));b.title=D.lessons[n-1].t;b.addEventListener('click',function(){showLesson(n);});r.appendChild(b);});c.appendChild(r);}
    g.appendChild(c);termEls[t.id]=c;
  });
  paneT.appendChild(g);
});
var emptyT=el('p','kka-empty kka-hide','Không có khái niệm nào khớp với từ tìm kiếm.');paneT.appendChild(emptyT);

/* ---------- Điều hướng & tìm kiếm ---------- */
function setTab(t){tbL.classList.toggle('on',t==='L');tbT.classList.toggle('on',t==='T');paneL.classList.toggle('kka-hide',t!=='L');paneT.classList.toggle('kka-hide',t!=='T');}
tbL.addEventListener('click',function(){setTab('L');});
tbT.addEventListener('click',function(){setTab('T');});
function flash(e){e.classList.remove('kka-flash');void e.offsetWidth;e.classList.add('kka-flash');}
function showTerm(id){if(search.value){search.value='';filter();}setTab('T');var e=termEls[id];if(!e)return;e.scrollIntoView({behavior:'smooth',block:'center'});flash(e);}
function showLesson(n){if(search.value){search.value='';}phaseOn='all';Array.prototype.forEach.call(chips.children,function(c){c.classList.toggle('on',c.getAttribute('data-p')==='all');});filter();setTab('L');var e=lessonEls[n];if(!e)return;e.open=true;e.scrollIntoView({behavior:'smooth',block:'start'});flash(e);}
function filter(){
  var q=norm(search.value.trim()),shownL=0,shownT=0;
  D.phases.forEach(function(p){
    var any=0;
    D.lessons.forEach(function(l){if(l.n<p.from||l.n>p.to)return;var ok=(phaseOn==='all'||phaseOn===p.id)&&(!q||l.text.indexOf(q)>=0);lessonEls[l.n].classList.toggle('kka-hide',!ok);if(ok){any++;if(q)lessonEls[l.n].open=true;}});
    phaseEls[p.id].classList.toggle('kka-hide',!any);shownL+=any;
  });
  D.terms.forEach(function(t){var ok=!q||t.text.indexOf(q)>=0;termEls[t.id].classList.toggle('kka-hide',!ok);if(ok)shownT++;});
  Array.prototype.forEach.call(paneT.querySelectorAll('.kka-group'),function(g){g.classList.toggle('kka-hide',!g.querySelector('.kka-term:not(.kka-hide)'));});
  idx.classList.toggle('kka-hide',!!q);
  emptyL.classList.toggle('kka-hide',shownL>0);emptyT.classList.toggle('kka-hide',shownT>0);
  if(q){tbL.textContent='Lộ trình ('+shownL+')';tbT.textContent='Khái niệm ('+shownT+')';}else{tbL.textContent='Lộ trình 52 buổi';tbT.textContent='Mục lục khái niệm';}
}
var st;search.addEventListener('input',function(){clearTimeout(st);st=setTimeout(filter,120);});

/* Mở theo đường dẫn: #buoi-12 hoặc #kn-xung-dao */
function fromHash(){var h=decodeURIComponent(location.hash||'');var m=h.match(/^#buoi-(\d+)$/);if(m)return showLesson(+m[1]);m=h.match(/^#kn-(.+)$/);if(m&&TERM[m[1]])showTerm(m[1]);}
window.addEventListener('hashchange',fromHash);fromHash();
window.KKA={version:VERSION,showLesson:showLesson,showTerm:showTerm};
})();
