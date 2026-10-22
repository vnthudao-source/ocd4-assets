/* =========================================================
   TỨ TỔ THƯ MÔN – BANNER + SỐ LIỆU TỔ (giữ nguyên từ trang đăng ký cũ)
   OCDTeamSlider.mount(host,{team:"2"}) – thêm only:true để chỉ hiện slide tổ đó -> trả về phần tử #ocd4TeamSlider (có .otsShow(team))
========================================================= */
(function(){
"use strict";
if(window.OCDTeamSlider) return;
var OTS_HTML="<section id=\"ocd4TeamSlider\" aria-label=\"Tứ Tổ Thư Môn\">\n  <div class=\"ots-shell\"><div class=\"ots-viewport\" id=\"otsViewport\">\n    <article class=\"ots-slide is-active\" data-team=\"1\" aria-hidden=\"false\" style=\"--accent:#93bdc9;--deep:#263f4b;--rgb:147,189,201\">\n      <img class=\"ots-picture\" src=\"https://drive.google.com/thumbnail?id=1VLwUU_73rOPsXNrrljhWkK3lF1EpE8KH&amp;sz=w1600\" alt=\"Thanh Phong mặc vũ\" loading=\"eager\" decoding=\"async\" />\n      <div class=\"ots-veil\"></div><div class=\"ots-ink\"></div>\n      <div class=\"ots-copy\">\n        <p class=\"ots-kicker\">TỨ TỔ THƯ MÔN · TỔ 01</p>\n        <h2>Thanh Phong<br />mặc vũ</h2>\n        <p class=\"ots-motto\">Mực theo gió chuyển, ý tựa mưa bay.</p>\n        <div class=\"ots-live\">\n          <div class=\"ots-live-item\"><strong class=\"ots-member-count\" aria-label=\"Số lượng gốc đến số lượng hiện tại\"><span class=\"ots-member-base\">—</span><span class=\"ots-member-arrow\" aria-hidden=\"true\"> → </span><span class=\"ots-member-current\">—</span></strong></div>\n          <div class=\"ots-live-item ots-achievement\"><span>Thành tích của tổ</span><strong class=\"ots-achievement-text\">Đang tải lượt nộp bài, Hồng ngọc và điểm trung bình…</strong></div>\n        </div>\n        <a class=\"ots-team-link\" href=\"https://www.thudao.com/p/gioi-thieu-to.html?to=1\">Tìm hiểu tổ học viên &gt;&gt;&gt;</a>\n      </div>\n    </article>\n    <article class=\"ots-slide\" data-team=\"2\" aria-hidden=\"true\" style=\"--accent:#b3cc82;--deep:#34482d;--rgb:179,204,130\">\n      <img class=\"ots-picture\" src=\"https://drive.google.com/thumbnail?id=10OzDAfhWpGdXQoyBTs_seFMw6giTu8Vg&amp;sz=w1600\" alt=\"Trúc mặc thư\" loading=\"lazy\" decoding=\"async\" />\n      <div class=\"ots-veil\"></div><div class=\"ots-ink\"></div>\n      <div class=\"ots-copy\">\n        <p class=\"ots-kicker\">TỨ TỔ THƯ MÔN · TỔ 02</p>\n        <h2>Trúc mặc thư</h2>\n        <p class=\"ots-motto\">Tâm ngay như trúc, nét tĩnh như thư.</p>\n        <div class=\"ots-live\">\n          <div class=\"ots-live-item\"><strong class=\"ots-member-count\" aria-label=\"Số lượng gốc đến số lượng hiện tại\"><span class=\"ots-member-base\">—</span><span class=\"ots-member-arrow\" aria-hidden=\"true\"> → </span><span class=\"ots-member-current\">—</span></strong></div>\n          <div class=\"ots-live-item ots-achievement\"><span>Thành tích của tổ</span><strong class=\"ots-achievement-text\">Đang tải lượt nộp bài, Hồng ngọc và điểm trung bình…</strong></div>\n        </div>\n        <a class=\"ots-team-link\" href=\"https://www.thudao.com/p/gioi-thieu-to.html?to=2\">Tìm hiểu tổ học viên &gt;&gt;&gt;</a>\n      </div>\n    </article>\n    <article class=\"ots-slide\" data-team=\"3\" aria-hidden=\"true\" style=\"--accent:#d5aa58;--deep:#6b211f;--rgb:213,170,88\">\n      <img class=\"ots-picture\" src=\"https://drive.google.com/thumbnail?id=1036Hsa90s_A7uuXdfv0jFP49_CfzLqMS&amp;sz=w1600\" alt=\"Vương triều cá biệt\" loading=\"lazy\" decoding=\"async\" />\n      <div class=\"ots-veil\"></div><div class=\"ots-ink\"></div>\n      <div class=\"ots-copy\">\n        <p class=\"ots-kicker\">TỨ TỔ THƯ MÔN · TỔ 03</p>\n        <h2>Vương triều<br />cá biệt</h2>\n        <p class=\"ots-motto\">Khác biệt thành thế, bản lĩnh thành danh.</p>\n        <div class=\"ots-live\">\n          <div class=\"ots-live-item\"><strong class=\"ots-member-count\" aria-label=\"Số lượng gốc đến số lượng hiện tại\"><span class=\"ots-member-base\">—</span><span class=\"ots-member-arrow\" aria-hidden=\"true\"> → </span><span class=\"ots-member-current\">—</span></strong></div>\n          <div class=\"ots-live-item ots-achievement\"><span>Thành tích của tổ</span><strong class=\"ots-achievement-text\">Đang tải lượt nộp bài, Hồng ngọc và điểm trung bình…</strong></div>\n        </div>\n        <a class=\"ots-team-link\" href=\"https://www.thudao.com/p/gioi-thieu-to.html?to=3\">Tìm hiểu tổ học viên &gt;&gt;&gt;</a>\n      </div>\n    </article>\n    <article class=\"ots-slide\" data-team=\"4\" aria-hidden=\"true\" style=\"--accent:#d19a5b;--deep:#422f24;--rgb:209,154,91\">\n      <img class=\"ots-picture\" src=\"https://drive.google.com/thumbnail?id=1zJr6Xw4uhFxK3klzvuwwp7ZDBTXJi7MC&amp;sz=w1600\" alt=\"Nói ít làm nhiều\" loading=\"lazy\" decoding=\"async\" />\n      <div class=\"ots-veil\"></div><div class=\"ots-ink\"></div>\n      <div class=\"ots-copy\">\n        <p class=\"ots-kicker\">TỨ TỔ THƯ MÔN · TỔ 04</p>\n        <h2>Nói ít<br />làm nhiều</h2>\n        <p class=\"ots-motto\">Để thành quả thay lời, để nét bút lên tiếng.</p>\n        <div class=\"ots-live\">\n          <div class=\"ots-live-item\"><strong class=\"ots-member-count\" aria-label=\"Số lượng gốc đến số lượng hiện tại\"><span class=\"ots-member-base\">—</span><span class=\"ots-member-arrow\" aria-hidden=\"true\"> → </span><span class=\"ots-member-current\">—</span></strong></div>\n          <div class=\"ots-live-item ots-achievement\"><span>Thành tích của tổ</span><strong class=\"ots-achievement-text\">Đang tải lượt nộp bài, Hồng ngọc và điểm trung bình…</strong></div>\n        </div>\n        <a class=\"ots-team-link\" href=\"https://www.thudao.com/p/gioi-thieu-to.html?to=4\">Tìm hiểu tổ học viên &gt;&gt;&gt;</a>\n      </div>\n    </article>\n    <button class=\"ots-arrow ots-prev\" type=\"button\" data-ots-action=\"prev\" aria-label=\"Xem tổ trước\">‹</button>\n    <button class=\"ots-arrow ots-next\" type=\"button\" data-ots-action=\"next\" aria-label=\"Xem tổ tiếp theo\">›</button>\n    <div class=\"ots-dots\" role=\"group\" aria-label=\"Chọn tổ\">\n      <button class=\"ots-dot is-active\" type=\"button\" data-ots-go=\"0\" aria-label=\"Thanh Phong mặc vũ\" aria-pressed=\"true\"></button>\n      <button class=\"ots-dot\" type=\"button\" data-ots-go=\"1\" aria-label=\"Trúc mặc thư\" aria-pressed=\"false\"></button>\n      <button class=\"ots-dot\" type=\"button\" data-ots-go=\"2\" aria-label=\"Vương triều cá biệt\" aria-pressed=\"false\"></button>\n      <button class=\"ots-dot\" type=\"button\" data-ots-go=\"3\" aria-label=\"Nói ít làm nhiều\" aria-pressed=\"false\"></button>\n    </div>\n    <div class=\"ots-time\" aria-hidden=\"true\"><span id=\"otsTimeBar\"></span></div>\n  </div></div>\n</section>";
var SPREADSHEET_ID="1GJoTRsbq0kZfZrDdh0uCC667PwS3Bgkje2fHQnwnCKs";
var MEMBER_SHEET="Form Responses 1",ROSTER_SHEET="HocVien",AUTO_DELAY=8000;
var CACHE_KEY="ocd4_team_slider_stats_v5",CACHE_TTL=5*60*1000;
function sheetUrl(name){return "https://docs.google.com/spreadsheets/d/"+SPREADSHEET_ID+"/gviz/tq?tqx=out:csv&sheet="+encodeURIComponent(name)+"&_="+Math.floor(Date.now()/CACHE_TTL)}
function norm(v){return String(v==null?"":v).normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d").replace(/Đ/g,"D").trim().toLowerCase()}
function codeKey(v){return String(v==null?"":v).trim().toUpperCase().replace(/\s+/g,"")}
function num(v){var n=Number(String(v==null?"":v).replace(/\s/g,"").replace(",","."));return Number.isFinite(n)?n:0}
function teamNo(v){var m=String(v==null?"":v).match(/[1-4]/);return m?m[0]:""}
function courseNo(v){var m=norm(v).match(/^(?:d|khoa\s*)?([1-4])$/);return m?m[1]:""}
function field(row,names){var keys=Object.keys(row||{});for(var i=0;i<names.length;i++){var wanted=norm(names[i]);for(var j=0;j<keys.length;j++){if(norm(keys[j])===wanted)return row[keys[j]]}}return ""}
function parseCSV(text){
 var rows=[],row=[],cell="",quoted=false;
 for(var i=0;i<text.length;i++){
  var c=text[i],next=text[i+1];
  if(c==='"'&&quoted&&next==='"'){cell+='"';i++;continue}
  if(c==='"'){quoted=!quoted;continue}
  if(c===","&&!quoted){row.push(cell);cell="";continue}
  if((c==="\n"||c==="\r")&&!quoted){if(c==="\r"&&next==="\n")i++;row.push(cell);cell="";if(row.some(function(x){return x!==""}))rows.push(row);row=[];continue}
  cell+=c;
 }
 if(cell!==""||row.length){row.push(cell);rows.push(row)}
 if(!rows.length)return [];
 var headers=rows.shift();
 return rows.map(function(values){var out={};headers.forEach(function(h,k){out[h]=values[k]||""});return out});
}
function fetchRows(url){
 var request;
 if(window.StudentRewardSystem&&typeof window.StudentRewardSystem.fetchRows==="function")request=window.StudentRewardSystem.fetchRows(url);
 else request=fetch(url,{cache:"no-store"}).then(function(r){if(!r.ok)throw new Error("HTTP "+r.status);return r.text()}).then(parseCSV);
 return Promise.resolve(request).then(function(rows){
  if(!Array.isArray(rows)||!rows.length)return [];
  if(Array.isArray(rows[0])){var headers=rows[0];return rows.slice(1).map(function(values){var out={};headers.forEach(function(header,index){out[header]=values[index]==null?"":values[index]});return out})}
  return rows;
 });
}
function emptyStats(){return {members:0,baseMembers:0,submissionCount:0,averageScore:0,gemValue:null,scoreTotal:0,scoreCount:0}}
function waitForCore(){
 if(window.StudentRewardSystem)return Promise.resolve(window.StudentRewardSystem);
 return new Promise(function(resolve){
  var done=false;
  function finish(){if(done)return;done=true;window.removeEventListener("studentRewardCoreReady",ready);resolve(window.StudentRewardSystem||null)}
  function ready(){finish()}
  window.addEventListener("studentRewardCoreReady",ready,{once:true});setTimeout(finish,3000);
 });
}
function calculate(memberRows,rosterRows,core){
 var stats={"1":emptyStats(),"2":emptyStats(),"3":emptyStats(),"4":emptyStats()},members={},submissionsByCode={},rosterTeam={};
 /* HocVien là nguồn chuẩn cho tổ và số thành viên, kể cả chưa nộp bài. */
 rosterRows.forEach(function(r){
  var code=codeKey(field(r,["Mã học viên","Ma hoc vien"])),team=teamNo(field(r,["Tổ","To"])),course=courseNo(field(r,["Khoá","Khóa","Khoa"]));
  if(!code||!team||members[code])return;
  rosterTeam[code]=team;members[code]={code:code,team:team};stats[team].members++;
  if(course==="1"||course==="2"||course==="3")stats[team].baseMembers++;
 });
 /* Form Responses 1 chỉ tính thành tích cho mã có trong HocVien. */
 memberRows.forEach(function(r,index){
  var code=codeKey(field(r,["Mã học viên","Ma hoc vien"])),team=rosterTeam[code];if(!team)return;
  if(!submissionsByCode[code])submissionsByCode[code]=[];
  stats[team].submissionCount++;
  var scoreRaw=field(r,["Điểm","Diem","Điểm số","Diem so"]);
  submissionsByCode[code].push({code:code,timestamp:field(r,["Dấu thời gian","Dau thoi gian","Timestamp"]),score:scoreRaw,originalIndex:index+1});
  var score=num(scoreRaw);if(String(scoreRaw).trim()!==""&&score>=0){stats[team].scoreTotal+=score;stats[team].scoreCount++}
 });
 Object.keys(stats).forEach(function(team){stats[team].averageScore=stats[team].scoreCount?stats[team].scoreTotal/stats[team].scoreCount:0});
 /* Hồng ngọc quy đổi theo đúng Reward Core và giao dịch hiện có. */
 var gemWork=Promise.resolve();
 if(core&&core.calculateStudentRewardData&&core.loadSharedRewardData&&core.processTransactions&&core.getGemValueInHong&&core.cloneGems){
  gemWork=core.loadSharedRewardData().then(function(shared){
   var totals={"1":0,"2":0,"3":0,"4":0};
   Object.keys(members).forEach(function(code){
    var reward=core.calculateStudentRewardData(submissionsByCode[code]||[]),normalized=core.normalizeCode?core.normalizeCode(code):code;
    /* Reward Core v4.7.0 – chốt sổ: số dư tại mốc đã nằm trong giao dịch, chỉ cộng linh thạch học tập phát sinh sau mốc */
    var snap=shared.snapshots&&shared.snapshots.get(normalized),earned=snap&&core.snapshotStartGems?core.snapshotStartGems(reward.rawGems,snap):core.cloneGems(reward.gems);
    var transactions=shared.redemptionMap.get(normalized)||[],accounting=core.processTransactions(earned,transactions,snap?snap.deals:null),gemTypes=core.GEM_ORDER||Object.keys(accounting.gems||{});
    totals[members[code].team]+=gemTypes.reduce(function(total,type){return total+core.getGemValueInHong(type,(accounting.gems||{})[type])},0);
   });
   Object.keys(stats).forEach(function(team){stats[team].gemValue=totals[team]});
  }).catch(function(error){if(window.console)console.warn("[OCD4 Team Slider] Chưa tải được Hồng ngọc",error)});
 }
 return gemWork.then(function(){return stats});
}
function loadStats(){
 try{var saved=JSON.parse(localStorage.getItem(CACHE_KEY)||"null");if(saved&&Date.now()-saved.time<CACHE_TTL)return Promise.resolve(saved.data)}catch(e){}
 return Promise.all([fetchRows(sheetUrl(MEMBER_SHEET)),fetchRows(sheetUrl(ROSTER_SHEET)),waitForCore()]).then(function(rows){
  if(!rows[1].length)throw new Error("Tab HocVien không có dữ liệu");return calculate(rows[0],rows[1],rows[2]);
 }).then(function(data){
  var totalMembers=Object.keys(data).reduce(function(total,team){return total+data[team].members},0);if(!totalMembers)throw new Error("Không ánh xạ được mã học viên và tổ");
  try{localStorage.setItem(CACHE_KEY,JSON.stringify({time:Date.now(),data:data}))}catch(e){}
  return data;
 });
}
function init(root,opts){
 opts=opts||{};
 var slides=[].slice.call(root.querySelectorAll(".ots-slide")),dots=[].slice.call(root.querySelectorAll(".ots-dot")),bar=root.querySelector("#otsTimeBar"),viewport=root.querySelector("#otsViewport");
 var current=0,timer=null,startX=0,endX=0,paused=false;
 function formatNumber(value,digits){if(value===null||value===undefined||!Number.isFinite(Number(value)))return "—";return Number(value).toLocaleString("vi-VN",{minimumFractionDigits:digits||0,maximumFractionDigits:digits||0})}
 function restartBar(){bar.classList.remove("is-running");void bar.offsetWidth;if(!paused&&!document.hidden)bar.classList.add("is-running")}
 function stop(){if(timer)clearTimeout(timer);timer=null;bar.classList.remove("is-running")}
 function play(){stop();if(!root.isConnected||slides.length<2)return;if(paused||document.hidden)return;restartBar();timer=setTimeout(function(){show(current+1);play()},AUTO_DELAY)}
 function show(index){
  current=(index+slides.length)%slides.length;
  slides.forEach(function(slide,i){var on=i===current;slide.classList.toggle("is-active",on);slide.setAttribute("aria-hidden",on?"false":"true")});
  dots.forEach(function(dot,i){var on=i===current;dot.classList.toggle("is-active",on);dot.setAttribute("aria-pressed",on?"true":"false")});
  root.style.setProperty("--active-accent",getComputedStyle(slides[current]).getPropertyValue("--accent").trim()||"#fff");restartBar();
 }
 root.addEventListener("click",function(e){
  var button=e.target.closest("[data-ots-action],[data-ots-go]");if(!button)return;
  if(button.hasAttribute("data-ots-go"))show(Number(button.getAttribute("data-ots-go")));else show(current+(button.getAttribute("data-ots-action")==="next"?1:-1));play();
 });
 viewport.addEventListener("touchstart",function(e){startX=e.touches[0].clientX;endX=startX},{passive:true});
 viewport.addEventListener("touchmove",function(e){endX=e.touches[0].clientX},{passive:true});
 viewport.addEventListener("touchend",function(){if(Math.abs(endX-startX)>55){show(current+(endX<startX?1:-1));play()}},{passive:true});
 viewport.addEventListener("mouseenter",function(){paused=true;stop()});viewport.addEventListener("mouseleave",function(){paused=false;play()});
 document.addEventListener("visibilitychange",function onVis(){if(!root.isConnected){document.removeEventListener("visibilitychange",onVis);stop();return}if(document.hidden)stop();else play()});
 loadStats().then(function(data){
  slides.forEach(function(slide){var s=data[slide.getAttribute("data-team")];slide.querySelector(".ots-member-base").textContent=String(s.baseMembers);slide.querySelector(".ots-member-current").textContent=String(s.members);slide.querySelector(".ots-achievement-text").textContent="Lượt nộp bài: "+formatNumber(s.submissionCount)+"\nHồng ngọc: "+formatNumber(s.gemValue)+"\nĐiểm trung bình tổng: "+formatNumber(s.averageScore,2)});
 }).catch(function(error){
  slides.forEach(function(slide){slide.querySelector(".ots-member-base").textContent="—";slide.querySelector(".ots-member-current").textContent="—";slide.querySelector(".ots-achievement-text").textContent="Chưa tải được lượt nộp bài, Hồng ngọc và điểm trung bình"});if(window.console)console.warn("[OCD4 Team Slider]",error);
 });
 var startAt=slides.findIndex(function(sl){return sl.getAttribute("data-team")===String(opts.team||"")});
 show(startAt>=0?startAt:Math.floor(Math.random()*slides.length));play();
 root.otsShow=function(team){var i=slides.findIndex(function(sl){return sl.getAttribute("data-team")===String(team)});if(i>=0){show(i);play()}};
}
function mount(host,opts){
 host.innerHTML=OTS_HTML;
 var root=host.querySelector("#ocd4TeamSlider");
 /* opts.only: chỉ giữ slide của tổ opts.team (học viên đã có tổ) */
 if(opts&&opts.only&&root.querySelector('.ots-slide[data-team="'+String(opts.team)+'"]')){
  [].slice.call(root.querySelectorAll(".ots-slide")).forEach(function(sl){if(sl.getAttribute("data-team")!==String(opts.team))sl.remove()});
  [].slice.call(root.querySelectorAll(".ots-dot,[data-ots-action]")).forEach(function(el){el.remove()});
  root.classList.add("ots-single");
  var tb=root.querySelector("#otsTimeBar");if(tb)tb.style.visibility="hidden";
 }
 init(root,opts);
 return root;
}
window.OCDTeamSlider={mount:mount};
})();
