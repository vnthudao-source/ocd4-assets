/* Đăng ký làm ấn – thudao.com. Cấu hình (API_URL, bảng giá) đặt trong window.DLA_CONFIG trên trang Blogspot. */
(function(){
  "use strict";
  function showErr(m){ try { var w = document.getElementById("dla-who"); if (w){ w.className = "who warn"; w.textContent = "Lỗi trang: " + m; } } catch(e){} }
  window.addEventListener("error", function(ev){ if (ev && ev.message) showErr(ev.message); });

  var C = window.DLA_CONFIG || {};
  var API_URL = C.API_URL || "", DESIGN_FEE = C.DESIGN_FEE || 0, MAX_ITEMS = C.MAX_ITEMS || 10, MAX_QTY = C.MAX_QTY || 20, PRICES = C.PRICES;

  var SESSION_KEY = "ocd_student_session_v1";
  var LOCAL_KEY = "dla_contact_v1";

  /* ====== TIỆN ÍCH ====== */
  var $ = function(id){ return document.getElementById(id); };
  function money(n){ return Number(n || 0).toLocaleString("vi-VN") + "đ"; }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function normCode(s){ return String(s || "").trim().toUpperCase(); }
  function lsGet(k){ try { return JSON.parse(localStorage.getItem(k) || "null"); } catch(e){ return null; } }
  function lsSet(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} }
  function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

  /* ====== TRẠNG THÁI ====== */
  var student = null;  // kết quả tra cứu
  var items = [];
  function newItem(){ return { type: "danh", size: "s2", stone: "tot", price: 1200000, custom: "", qty: 1, content: "", extra: "", design: false }; }

  /* ====== NHẬN DIỆN HỌC VIÊN (Minh Hồng) ====== */
  function sessionCode(){
    try {
      var S = window.OCDStudentSession;
      if (S && typeof S.getCode === "function" && S.getCode()) return normCode(S.getCode());
    } catch(e){}
    var st = lsGet(SESSION_KEY);
    return st && st.code ? normCode(st.code) : "";
  }

  function setWho(cls, html){ var w = $("dla-who"); w.className = "who " + (cls || ""); w.innerHTML = html; }

  function showSaved(){
    var s = student && student.found ? student.saved || {} : {};
    toggleSaved("phone", s.hasPhone, s.phone);
    toggleSaved("addr", s.hasAddress, s.address);
    toggleSaved("mail", s.hasEmail, s.email);
  }
  function toggleSaved(key, has, text){
    var box = $("dla-saved-" + key), use = $("dla-use-" + key), wrap = $("dla-" + key + "-wrap");
    var bold = { phone: "dla-sp", addr: "dla-sa", mail: "dla-sm" }[key];
    if (has){ box.classList.remove("hidden"); use.checked = true; $(bold).textContent = text; }
    else { box.classList.add("hidden"); use.checked = false; }
    wrap.classList.toggle("hidden", !!(has && use.checked));
  }
  ["phone", "addr", "mail"].forEach(function(k){
    $("dla-use-" + k).addEventListener("change", function(){ $("dla-" + k + "-wrap").classList.toggle("hidden", this.checked); });
  });

  function lookup(code){
    code = normCode(code);
    student = null;
    lastPhoneKey = "";
    $("dla-phone-hint").textContent = "";
    showSaved();
    if (!code){
      setWho("", "Bạn đặt với tư cách <b>khách</b>. Học viên hãy đăng nhập Minh Hồng, nhập Mã học viên hoặc số điện thoại đã đăng ký học để điền sẵn thông tin.");
      return;
    }
    $("dla-code").value = code;
    if (API_URL.indexOf("http") !== 0){ setWho("warn", "Trang chưa được nối với Apps Script (thiếu API_URL)."); return; }
    setWho("", "Đang tìm học viên <b>" + esc(code) + "</b>…");
    $("dla-check").disabled = true;
    var ph = $("dla-phone").value.trim();
    fetch(API_URL + "?action=anLookup&code=" + encodeURIComponent(code) + "&phone=" + encodeURIComponent(ph) + "&_=" + Date.now(), { cache: "no-store", credentials: "omit" })
      .then(function(r){ return r.json(); })
      .then(function(j){
        if (!j || !j.ok) throw new Error(j && j.error || "Lỗi tra cứu");
        if (!j.found){
          setWho("warn", "Không tìm thấy mã <b>" + esc(code) + "</b>. Bạn vẫn có thể điền thông tin thủ công bên dưới.");
          return;
        }
        student = j;
        if (!j.code) j.code = code;
        if (j.name) $("dla-name").value = j.name;
        var miss = !(j.saved && j.saved.hasAddress);
        setWho("ok", "✓ Xin chào <b>" + esc(j.name || code) + "</b>" + (j.course ? " · Khoá " + esc(j.course) : "") +
          (miss ? ". Chưa tìm thấy SĐT/địa chỉ trong danh sách học viên — bạn điền giúp bên dưới nhé." : ". Thông tin đã được điền sẵn từ danh sách học viên."));
        showSaved();
      })
      .catch(function(){
        setWho("warn", "Chưa tra cứu được mã học viên (mạng chậm?). Bạn cứ điền thông tin thủ công, đơn vẫn gửi bình thường.");
      })
      .then(function(){ $("dla-check").disabled = false; });
  }

  /* Tra theo SĐT: khi chưa có địa chỉ đã lưu, khách gõ SĐT xong sẽ tự tìm trong danh sách học viên */
  var lastPhoneKey = "";
  function lookupPhone(){
    var ph = $("dla-phone").value.trim(), key = ph.replace(/\D/g, "");
    if (key.length < 9 || key === lastPhoneKey || API_URL.indexOf("http") !== 0) return;
    if (student && student.saved && student.saved.hasAddress) return;
    lastPhoneKey = key;
    var code = student && student.code ? student.code : normCode($("dla-code").value);
    var hint = $("dla-phone-hint");
    hint.textContent = "Đang tìm hồ sơ theo số điện thoại…";
    fetch(API_URL + "?action=anLookup&code=" + encodeURIComponent(code) + "&phone=" + encodeURIComponent(ph) + "&_=" + Date.now(), { cache: "no-store", credentials: "omit" })
      .then(function(r){ return r.json(); })
      .then(function(j){
        if (!j || !j.ok || !j.found || !(j.saved && (j.saved.hasAddress || j.saved.hasEmail))){
          hint.textContent = "Không tìm thấy hồ sơ theo số này — bạn điền địa chỉ nhận ấn bên dưới nhé.";
          return;
        }
        var keep = student;
        student = j;
        if (keep && keep.codeFound){ j.code = keep.code; j.codeFound = true; j.name = keep.name; j.course = keep.course; }
        if (!j.code) j.code = code;
        j.saved.hasPhone = false;            // giữ nguyên SĐT khách vừa gõ
        hint.textContent = "✓ Đã tìm thấy hồ sơ theo số điện thoại này.";
        showSaved();
      })
      .catch(function(){ hint.textContent = ""; lastPhoneKey = ""; });
  }
  $("dla-phone").addEventListener("change", lookupPhone);
  $("dla-phone").addEventListener("blur", lookupPhone);

  $("dla-check").addEventListener("click", function(){ lookup($("dla-code").value); });
  $("dla-code").addEventListener("keydown", function(e){ if (e.key === "Enter"){ e.preventDefault(); lookup(this.value); } });
  window.addEventListener("ocdStudentSessionChanged", function(){
    var c = sessionCode();
    if (c && c !== normCode($("dla-code").value)) lookup(c);
  });

  /* ====== CON ẤN ====== */
  function unitPrice(it){
    var st = PRICES.stone[it.stone]; if (!st) return 0;
    var p = it.price === "custom" ? Math.round(Number(String(it.custom).replace(/\D/g, "")) || 0) : Number(it.price) || 0;
    return p + ((PRICES.size[it.size] || {}).add || 0);
  }
  function lineTotal(it){ return unitPrice(it) * it.qty + (it.design ? DESIGN_FEE : 0); }

  function chipsHtml(i, field, map, cur){
    return '<div class="chips">' + Object.keys(map).map(function(k){
      return '<button type="button" class="chip' + (k === cur ? " on" : "") + '" data-i="' + i + '" data-f="' + field + '" data-v="' + k + '">' + esc(map[k].label) + "</button>";
    }).join("") + "</div>";
  }

  function itemHtml(it, i){
    var t = PRICES.type[it.type], st = PRICES.stone[it.stone];
    var h = '<div class="item"><div class="item-h"><b>Ấn số ' + (i + 1) + "</b>" +
      (items.length > 1 ? '<button type="button" class="rm" data-rm="' + i + '">Xoá</button>' : "") + "</div>";

    h += '<label class="f">Loại ấn</label><div class="seg">' + Object.keys(PRICES.type).map(function(k){
      var x = PRICES.type[k];
      return '<button type="button" class="opt' + (k === it.type ? " on" : "") + '" data-i="' + i + '" data-f="type" data-v="' + k + '"><b>' + esc(x.label) + "</b><small>" + esc(x.hint) + "</small></button>";
    }).join("") + "</div>";

    h += '<label class="f">Kích thước</label>' + chipsHtml(i, "size", PRICES.size, it.size);

    h += '<label class="f">Loại đá &amp; mức giá</label><div class="stones">' + Object.keys(PRICES.stone).map(function(k){
      var x = PRICES.stone[k], p = x.prices;
      var pr = p.length === 1 ? money(p[0]) : (x.customMin ? "Từ " + money(x.customMin) : money(p[0]) + " – " + money(p[p.length - 1]));
      return '<button type="button" class="opt' + (k === it.stone ? " on" : "") + '" data-i="' + i + '" data-f="stone" data-v="' + k + '"><b>' + esc(x.label) + "</b><small>" + esc(x.desc) + '</small><span class="pr">' + pr + "</span></button>";
    }).join("") + "</div>";

    if (st && (st.prices.length > 1 || st.customMin)){
      h += '<div class="sub"><div class="hint" style="margin:0 0 8px">Chọn mức giá ' + esc(st.label.toLowerCase()) + ":</div><div class=\"chips\">" +
        st.prices.map(function(p){
          return '<button type="button" class="chip' + (Number(it.price) === p ? " on" : "") + '" data-i="' + i + '" data-f="price" data-v="' + p + '">' + money(p) + "</button>";
        }).join("") +
        (st.customMin ? '<button type="button" class="chip' + (it.price === "custom" ? " on" : "") + '" data-i="' + i + '" data-f="price" data-v="custom">Mức khác</button>' : "") +
        "</div>" +
        (it.price === "custom" ? '<input type="number" inputmode="numeric" min="' + st.customMin + '" step="100000" style="margin-top:8px" placeholder="Ngân sách của bạn, từ ' + st.customMin + '" data-i="' + i + '" data-in="custom" value="' + esc(it.custom) + '">' : "") +
        "</div>";
    }

    h += '<label class="f">Số lượng</label><div class="qty"><button type="button" data-i="' + i + '" data-q="-1">−</button><span>' + it.qty + '</span><button type="button" data-i="' + i + '" data-q="1">+</button></div>';

    h += '<label class="f">Nội dung muốn khắc</label><input type="text" maxlength="300" data-i="' + i + '" data-in="content" placeholder="' + esc(t.ph) + '" value="' + esc(it.content) + '">';
    h += '<label class="f">Yêu cầu thêm <span style="font-weight:400">(tuỳ chọn)</span></label><textarea maxlength="500" data-i="' + i + '" data-in="extra" placeholder="Âm văn / dương văn, hình ấn vuông – tròn – đa giác, màu đá, khắc bạc ý lên thân ấn…">' + esc(it.extra) + "</textarea>";
    h += '<label class="chk"><input type="checkbox" data-i="' + i + '" data-in="design"' + (it.design ? " checked" : "") + '><span>Nhờ GVCN nghĩ và thiết kế mẫu (+' + money(DESIGN_FEE) + ")</span></label>";
    h += '<div class="hint" style="text-align:right">Thành tiền ấn này: <b style="color:var(--red)">' + money(lineTotal(it)) + "</b></div></div>";
    return h;
  }

  function render(){
    $("dla-items").innerHTML = items.map(itemHtml).join("");
    $("dla-add").classList.toggle("hidden", items.length >= MAX_ITEMS);
    renderBill();
  }

  function renderBill(){
    var total = 0, rows = items.map(function(it, i){
      var lt = lineTotal(it); total += lt;
      return "<tr><td>" + (i + 1) + ". " + esc(PRICES.type[it.type].label) + " · " + esc(PRICES.size[it.size].label) + " · " + esc(PRICES.stone[it.stone].label) +
        '<br><span class="hint">' + money(unitPrice(it)) + " × " + it.qty + (it.design ? " + thiết kế " + money(DESIGN_FEE) : "") + '</span></td><td class="r">' + money(lt) + "</td></tr>";
    }).join("");
    $("dla-bill-t").innerHTML = rows + '<tr class="tot"><td>Tổng tạm tính</td><td class="r">' + money(total) + "</td></tr>";
    $("dla-bar-t").textContent = money(total);
    // cập nhật dòng "Thành tiền ấn này" mà không vẽ lại cả form (giữ con trỏ khi gõ)
    var hints = $("dla-items").querySelectorAll(".item > .hint b");
    items.forEach(function(it, i){ if (hints[i]) hints[i].textContent = money(lineTotal(it)); });
    return total;
  }

  $("dla-items").addEventListener("click", function(e){
    var b = e.target.closest("button"); if (!b) return;
    if (b.hasAttribute("data-rm")){ items.splice(Number(b.getAttribute("data-rm")), 1); render(); return; }
    var i = Number(b.getAttribute("data-i")), it = items[i]; if (!it) return;
    if (b.hasAttribute("data-q")){
      it.qty = Math.min(MAX_QTY, Math.max(1, it.qty + Number(b.getAttribute("data-q"))));
      render(); return;
    }
    var f = b.getAttribute("data-f"), v = b.getAttribute("data-v");
    if (!f) return;
    if (f === "stone"){ it.stone = v; it.price = PRICES.stone[v].prices[0]; it.custom = ""; }
    else if (f === "price"){ it.price = v === "custom" ? "custom" : Number(v); }
    else it[f] = v;
    render();
  });

  function onInput(e){
    var el = e.target, k = el.getAttribute("data-in"); if (!k) return;
    var it = items[Number(el.getAttribute("data-i"))]; if (!it) return;
    it[k] = k === "design" ? el.checked : el.value;
    renderBill();
  }
  $("dla-items").addEventListener("input", onInput);
  $("dla-items").addEventListener("change", onInput);

  $("dla-add").addEventListener("click", function(){
    if (items.length >= MAX_ITEMS) return;
    items.push(newItem()); render();
    var all = $("dla-items").querySelectorAll(".item");
    all[all.length - 1].scrollIntoView({ behavior: "smooth", block: "start" });
  });
  $("dla-go").addEventListener("click", function(){ $("dla-bill").scrollIntoView({ behavior: "smooth", block: "start" }); });

  /* ====== GỬI ĐƠN ====== */
  var clientId = uid();

  function validate(){
    var useP = $("dla-use-phone").checked && student && student.saved && student.saved.hasPhone;
    var useA = $("dla-use-addr").checked && student && student.saved && student.saved.hasAddress;
    if (!$("dla-name").value.trim()) return "Vui lòng nhập họ và tên.";
    if (!useP && !/^[0-9+().\s-]{8,20}$/.test($("dla-phone").value.trim())) return "Vui lòng nhập số điện thoại đúng.";
    if (!useA && !$("dla-addr").value.trim()) return "Vui lòng nhập địa chỉ nhận ấn.";
    for (var i = 0; i < items.length; i++){
      var it = items[i], st = PRICES.stone[it.stone];
      if (it.price === "custom" && unitPrice(it) - ((PRICES.size[it.size] || {}).add || 0) < st.customMin) return "Ấn số " + (i + 1) + ": mức giá đá cực đẹp tối thiểu " + money(st.customMin) + ".";
      if (!String(it.content).trim() && !it.design) return "Ấn số " + (i + 1) + ': hãy ghi nội dung muốn khắc hoặc tích "Nhờ GVCN thiết kế".';
    }
    return "";
  }

  $("dla-send").addEventListener("click", function(){
    var err = validate(), btn = this;
    $("dla-err").textContent = err;
    if (err) return;
    if (API_URL.indexOf("http") !== 0){ $("dla-err").textContent = "Trang chưa được nối với Apps Script (thiếu API_URL)."; return; }

    var payload = {
      action: "anOrder", clientId: clientId, hp: $("dla-hp").value,
      code: student && student.codeFound ? student.code : normCode($("dla-code").value),
      name: $("dla-name").value.trim(),
      phone: $("dla-phone").value.trim(),
      email: $("dla-mail").value.trim(),
      address: $("dla-addr").value.trim(),
      useSavedPhone: $("dla-use-phone").checked,
      useSavedAddress: $("dla-use-addr").checked,
      useSavedEmail: $("dla-use-mail").checked,
      note: $("dla-note").value.trim(),
      items: items.map(function(it){
        return { type: it.type, size: it.size, stone: it.stone, qty: it.qty, content: it.content, extra: it.extra, design: it.design,
          price: it.price === "custom" ? Math.round(Number(String(it.custom).replace(/\D/g, "")) || 0) : Number(it.price) };
      })
    };

    btn.disabled = true; btn.textContent = "Đang gửi…";
    fetch(API_URL, { method: "POST", body: JSON.stringify(payload), headers: { "Content-Type": "text/plain;charset=utf-8" }, credentials: "omit" })
      .then(function(r){ return r.json(); })
      .then(function(j){
        if (!j || !j.ok) throw new Error(j && j.error || "Gửi chưa thành công.");
        lsSet(LOCAL_KEY, { name: payload.name, phone: payload.phone, email: payload.email, address: payload.address });
        $("dla-form").classList.add("hidden");
        $("dla-bar").classList.add("hidden");
        $("dla-done").classList.remove("hidden");
        $("dla-done-t").innerHTML = "Mã đơn <b>" + esc(j.orderId) + "</b> · Tạm tính <b style=\"color:var(--red)\">" + money(j.total) +
          "</b><br>GVCN sẽ liên hệ với bạn để xác nhận mẫu khắc, giá cuối và thời gian hoàn thành.";
        $("dla-done").scrollIntoView({ behavior: "smooth", block: "start" });
      })
      .catch(function(e){
        $("dla-err").textContent = (e && e.message && e.message !== "Failed to fetch" && e.message !== "Load failed") ? e.message : "Mạng chập chờn, chưa gửi được. Bạn bấm Gửi lại nhé (đơn sẽ không bị trùng).";
      })
      .then(function(){ btn.disabled = false; btn.textContent = "Gửi đăng ký"; });
  });

  $("dla-again").addEventListener("click", function(){
    clientId = uid(); items = [newItem()];
    $("dla-note").value = ""; $("dla-err").textContent = "";
    $("dla-done").classList.add("hidden"); $("dla-form").classList.remove("hidden"); $("dla-bar").classList.remove("hidden");
    render(); $("dla").scrollIntoView({ behavior: "smooth" });
  });

  /* ====== KHỞI ĐỘNG ====== */
  var saved = lsGet(LOCAL_KEY);
  if (saved){
    if (saved.name) $("dla-name").value = saved.name;
    if (saved.phone) $("dla-phone").value = saved.phone;
    if (saved.email) $("dla-mail").value = saved.email;
    if (saved.address) $("dla-addr").value = saved.address;
  }
  items = [newItem()];
  render();

  var code = sessionCode();
  if (code) lookup(code);
  else setTimeout(function(){ lookup(sessionCode()); }, 800); // chờ footer Minh Hồng nạp xong
})();
