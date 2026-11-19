/* ElderEase — front-end prototype script (no dependencies). Needs translations.js first. */
const views = ["home", "contacts", "help", "messages", "settings", "pills", "feedback"];
const STORE_KEY = "elderease-settings-v1";
const LEVELS = [0.9, 1, 1.2, 1.4, 1.6];   // Small, Normal, Large, Larger, Largest

const $ = (id) => document.getElementById(id);
const toast = $("toast");
let toastTimer, modalAction = () => {}, lastFocus = null, currentView = "home";

const settings = { lang: "en", level: 2, contrast: false, spacing: false };

/* ---------- Translation helpers ---------- */
function t(key, vars) {
  let s = (TRANSLATIONS[settings.lang] && TRANSLATIONS[settings.lang][key]) || TRANSLATIONS.en[key] || key;
  if (vars) for (const k in vars) s = s.replace("{" + k + "}", vars[k]);
  return s;
}
function greeting() {
  const h = new Date().getHours();
  return t(h < 12 ? "g_morning" : h < 17 ? "g_afternoon" : "g_evening");
}
function viewTitle(name) {
  return name === "home" ? greeting() : t({ contacts: "t_contacts", help: "t_help", messages: "t_messages", settings: "t_settings", pills: "t_pills", feedback: "t_fb" }[name]);
}
function applyLanguage() {
  const lang = settings.lang;
  document.documentElement.lang = lang;
  document.title = t("doc_title");
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => el.setAttribute("aria-label", t(el.dataset.i18nAria)));
  document.querySelectorAll("[data-i18n-title]").forEach((el) => el.setAttribute("title", t(el.dataset.i18nTitle)));
  document.querySelectorAll(".lang-controls button").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.lang === lang)));
  $("page-title").textContent = viewTitle(currentView);
  $("today-label").textContent = new Date().toLocaleDateString(LANG_META[lang].locale, { weekday: "long", month: "long", day: "numeric" }).toUpperCase();
  updateSizeLabel();
  afterLang();
}

/* ---------- Toast ---------- */
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 5000);
}

/* ---------- Navigation ---------- */
function showView(name) {
  stopSpeaking();
  currentView = name;
  views.forEach((v) => $(v + "-view").classList.toggle("active", v === name));
  document.querySelectorAll(".nav-item").forEach((b) => {
    const on = b.dataset.view === name;
    b.classList.toggle("active", on);
    if (on) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
  });
  $("page-title").textContent = viewTitle(name);
  window.scrollTo({ top: 0, behavior: "smooth" });
}
document.querySelectorAll(".nav-item").forEach((b) => b.addEventListener("click", () => showView(b.dataset.view)));
document.querySelector(".brand").addEventListener("click", (e) => { e.preventDefault(); showView("home"); });

document.querySelectorAll("[data-action]").forEach((b) => b.addEventListener("click", () => {
  const a = b.dataset.action;
  if (a === "call") openModal("☎", t("mod_call_t"), t("mod_call_c"), t("mod_call_ok"), () => showView("contacts"));
  if (a === "contacts") showView("contacts");
  if (a === "messages") showView("messages");
  if (a === "help") showView("help");
  if (a === "pills") showView("pills");
  if (a === "feedback") showView("feedback");
}));
$("settings-shortcut").addEventListener("click", () => showView("settings"));
$("open-settings").addEventListener("click", () => showView("settings"));

/* ---------- Modal (focus handling + Escape) ---------- */
const modal = $("modal");
function openModal(symbol, title, copy, confirmText, action = () => {}) {
  lastFocus = document.activeElement;
  $("modal-symbol").textContent = symbol;
  $("modal-title").textContent = title;
  $("modal-copy").textContent = copy;
  $("modal-confirm").textContent = confirmText || t("okay");
  modalAction = action;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  $("modal-confirm").focus();
}
function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
}
$("modal-close").addEventListener("click", closeModal);
$("modal-cancel").addEventListener("click", closeModal);
$("modal-confirm").addEventListener("click", () => { closeModal(); modalAction(); });
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", (e) => {
  if (!modal.classList.contains("open")) return;
  if (e.key === "Escape") { closeModal(); return; }
  if (e.key === "Tab") {
    const f = [...modal.querySelectorAll("button")].filter((b) => b.offsetParent !== null);
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

/* ---------- Demo actions ---------- */
document.querySelectorAll(".call-small").forEach((b) => b.addEventListener("click", () => {
  const name = t("n_" + b.dataset.contact);
  openModal("☎", t("mod_cc_t", { name }), t("mod_cc_c", { name }), t("mod_cc_ok"), () => showToast(t("toast_nocall")));
}));
$("demo-sos").addEventListener("click", () => openModal("!", t("mod_sos_t"), t("mod_sos_c"), t("mod_sos_ok"), () => showToast(t("toast_sos"))));
$("demo-family").addEventListener("click", () => showView("contacts"));
$("demo-instructions").addEventListener("click", () => speak(t("sp_ins")));

/* ---------- Speech ---------- */
function stopSpeaking() { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); }
function speak(text) {
  if (!("speechSynthesis" in window)) { showToast(t("toast_nospeech")); return; }
  stopSpeaking();
  const speechLang = LANG_META[settings.lang].speech;
  const u = new SpeechSynthesisUtterance(text.replace(/\s+/g, " ").trim());
  u.rate = 0.88; u.pitch = 1; u.lang = speechLang;
  const voices = window.speechSynthesis.getVoices();
  const vLang = LANG_META[settings.lang].pending ? "en" : settings.lang;
  const match = voices.find((v) => v.lang.replace("_", "-").toLowerCase().startsWith(vLang));
  if (match) u.voice = match;
  else if (voices.length && vLang !== "en") showToast(t("toast_novoice"));
  u.onerror = () => showToast(t("toast_voicefail"));
  window.speechSynthesis.speak(u);
  if (match || vLang === "en" || !voices.length) showToast(t("toast_reading"));
}
$("read-page").addEventListener("click", () => speak(document.querySelector(".view.active").innerText));
$("test-voice").addEventListener("click", () => speak(t("sp_test")));

/* ---------- Settings (saved on this device) ---------- */
function loadSettings() {
  try { Object.assign(settings, JSON.parse(localStorage.getItem(STORE_KEY)) || {}); } catch (_) {}
  if (!LANG_META[settings.lang]) settings.lang = "en";
  settings.level = Math.min(LEVELS.length - 1, Math.max(0, Number.isInteger(settings.level) ? settings.level : 1));
}
function saveSettings() { try { localStorage.setItem(STORE_KEY, JSON.stringify(settings)); } catch (_) {} }
function updateSizeLabel() { $("size-label").textContent = $("w-size-label").textContent = t("lvl" + settings.level); }
function applySettings() {
  document.documentElement.style.setProperty("--font-scale", LEVELS[settings.level]);
  document.body.classList.toggle("high-contrast", settings.contrast);
  document.body.classList.toggle("extra-spacing", settings.spacing);
  document.body.classList.toggle("text-xl", settings.level >= 3);
  $("contrast-toggle").checked = $("w-contrast").checked = settings.contrast;
  $("spacing-toggle").checked = settings.spacing;
  $("larger-text").disabled = $("w-larger").disabled = settings.level >= LEVELS.length - 1;
  $("smaller-text").disabled = $("w-smaller").disabled = settings.level <= 0;
  updateSizeLabel();
}
function changeLevel(step) {
  settings.level = Math.min(LEVELS.length - 1, Math.max(0, settings.level + step));
  applySettings(); saveSettings();
  showToast(t(step > 0 ? "toast_up" : "toast_down"));
}
$("larger-text").addEventListener("click", () => changeLevel(1));
$("smaller-text").addEventListener("click", () => changeLevel(-1));
$("w-larger").addEventListener("click", () => changeLevel(1));
$("w-smaller").addEventListener("click", () => changeLevel(-1));
$("w-contrast").addEventListener("change", (e) => { settings.contrast = e.target.checked; applySettings(); saveSettings(); showToast(t(settings.contrast ? "toast_hc_on" : "toast_hc_off")); });
$("contrast-toggle").addEventListener("change", (e) => { settings.contrast = e.target.checked; applySettings(); saveSettings(); showToast(t(settings.contrast ? "toast_hc_on" : "toast_hc_off")); });
$("spacing-toggle").addEventListener("change", (e) => { settings.spacing = e.target.checked; applySettings(); saveSettings(); showToast(t(settings.spacing ? "toast_sp_on" : "toast_sp_off")); });
document.querySelectorAll(".lang-controls button").forEach((b) => b.addEventListener("click", () => {
  settings.lang = b.dataset.lang;
  stopSpeaking(); applyLanguage(); saveSettings();
  showToast(t("toast_lang"));
}));

/* ---------- Welcome / language screen ---------- */
const isPending = () => !!LANG_META[settings.lang].pending;
function updateWelcomeExtras() {
  const note = $("w-pending");
  note.hidden = !isPending();
  note.textContent = t("w_pending");
  if (isPending()) $("w-other-list").hidden = false;
  $("w-other").setAttribute("aria-expanded", String(!$("w-other-list").hidden));
}
function showWelcome() {
  stopSpeaking();
  document.body.classList.add("on-welcome");
  updateWelcomeExtras();
  window.scrollTo(0, 0);
  $("w-title").focus();
}
function enterApp() {
  stopSpeaking();
  document.body.classList.remove("on-welcome");
  showView("home");
  $("main").focus({ preventScroll: true });
}
document.querySelectorAll(".w-langs button").forEach((b) => b.addEventListener("click", () => {
  updateWelcomeExtras();
  if (isPending()) showToast(t("w_pending"));
  speak(t("sp_welcome"));
}));
$("w-other").addEventListener("click", () => {
  const list = $("w-other-list");
  list.hidden = !list.hidden;
  $("w-other").setAttribute("aria-expanded", String(!list.hidden));
});
$("w-hear").addEventListener("click", () => speak($("welcome-screen").innerText));
$("w-continue").addEventListener("click", enterApp);
$("change-lang").addEventListener("click", showWelcome);

/* ---------- Big "Home" button on every inner page ---------- */
["contacts", "help", "messages", "settings", "pills", "feedback"].forEach((v) => {
  const b = document.createElement("button");
  b.type = "button"; b.className = "back-home"; b.dataset.i18n = "back_home";
  b.addEventListener("click", () => showView("home"));
  $(v + "-view").prepend(b);
});

/* ---------- Extra features: emergency contact, daily pills, messages, feedback & testing ---------- */
const XKEY = "elderease-extra-v1";
const HOSPITAL_DEFAULT_PHONE = ""; // put the real hospital reception number here, e.g. "+918012345678"
const X = { hospital: { name: "", phone: HOSPITAL_DEFAULT_PHONE }, contact: { name: "", phone: "98765 43210" }, day: "", pills: null, replies: {}, log: [], tasks: {} };
let rate = 0;
function loadX() { try { Object.assign(X, JSON.parse(localStorage.getItem(XKEY)) || {}); } catch (_) {} }
function saveX() { try { localStorage.setItem(XKEY, JSON.stringify(X)); } catch (_) {} }
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const SLOTS = ["m", "a", "e", "n"];
const TASKS = ["tk1", "tk2", "tk3", "tk4", "tk5"];
const RESULTS = ["f_none", "f_easy", "f_hard", "f_fail"];
const MSGS = [
  { id: "anita", from: "n_anita", time: "m_time", body: "m_body", c: "peach", i: "A" },
  { id: "rahul", from: "n_rahul", time: "m_time2", body: "m_body2", c: "blue", i: "R" },
  { id: "doc", from: "n_doc", time: "m_time3", body: "m_body3", c: "lilac", i: "D" }
];
function afterLang() { renderSOS(); renderEC(); renderPills(); renderMessages(); renderFeedback(); }

/* Emergency contact (welcome page + Get help page) */
const ecName = () => X.contact.name || t("c_anita");
function renderEC() {
  document.querySelectorAll(".ec-mount").forEach((m) => {
    m.innerHTML = `<div class="ec-card"><span class="ec-icon" aria-hidden="true">☎</span><div class="ec-info"><strong>${esc(ecName())}</strong><small>${esc(X.contact.phone)}</small><small>${t("e_note")}</small></div>
      <div class="ec-btns"><button type="button" class="primary-button" data-x="ecCall">${t("e_call")}</button><button type="button" class="secondary-button" data-x="ecEdit">${t("e_edit")}</button></div></div>
      <div class="ec-form" hidden><label><span>${t("e_name")}</span><input class="ec-n" maxlength="40"></label><label><span>${t("e_phone")}</span><input class="ec-p" type="tel" inputmode="tel" maxlength="14"></label>
      <div class="ec-btns"><button type="button" class="primary-button" data-x="ecSave">${t("e_save")}</button><button type="button" class="secondary-button" data-x="ecCancel">${t("e_cancel")}</button></div></div>`;
  });
}

/* Red hospital button: one tap starts a real phone call (tel: link) */
const hosName = () => X.hospital.name || t("hs_def");
const hosPhone = () => (X.hospital.phone || "").replace(/[^\d+]/g, "");
function renderSOS() {
  document.querySelectorAll(".sos-mount").forEach((m) => {
    m.innerHTML = `<a class="sos-btn" data-x="sosCall" href="${hosPhone() ? "tel:" + hosPhone() : "#"}" role="button"><span>${t("hs_btn")}</span><small>${esc(hosName())} · ${esc(X.hospital.phone || "—")}</small></a>
      <p class="sos-sub">${t("hs_sub")}</p><button type="button" class="secondary-button" data-x="sosEdit">${t("hs_set")}</button>
      <div class="ec-form" hidden><label><span>${t("hs_name")}</span><input class="sos-n" maxlength="40"></label><label><span>${t("e_phone")}</span><input class="sos-p" type="tel" inputmode="tel" maxlength="16"></label>
      <div class="ec-btns"><button type="button" class="primary-button" data-x="sosSave">${t("e_save")}</button><button type="button" class="secondary-button" data-x="sosCancel">${t("e_cancel")}</button></div></div>`;
  });
}
function openSosForm(m) { const f = m.querySelector(".ec-form"); f.hidden = false; f.querySelector(".sos-n").value = X.hospital.name; f.querySelector(".sos-p").value = X.hospital.phone; f.querySelector(".sos-p").focus(); }

/* Daily pills (tick marks reset every new day) */
const pName = (p) => (p.key ? t(p.key) : p.name);
function ensurePills() {
  const d = new Date().toLocaleDateString("en-CA");
  if (!X.pills) X.pills = [{ id: "s1", key: "p_s1", slot: "m", done: false }, { id: "s2", key: "p_s2", slot: "a", done: false }, { id: "s3", key: "p_s3", slot: "n", done: false }];
  if (X.day !== d) { X.day = d; X.pills.forEach((p) => { p.done = false; }); saveX(); }
}
const sortedPills = () => [...X.pills].sort((a, b) => SLOTS.indexOf(a.slot) - SLOTS.indexOf(b.slot));
function renderPills() {
  ensurePills();
  const list = sortedPills(), n = list.filter((p) => p.done).length;
  $("pills-mount").innerHTML = `<div class="pill-progress" role="status"><strong>${t("p_prog", { n, total: list.length })}</strong><div class="bar"><span style="width:${list.length ? (n / list.length) * 100 : 0}%"></span></div></div>` +
    list.map((p) => `<article class="pill-card${p.done ? " done" : ""}"><div><small>${t("p_" + p.slot)}</small><strong>${esc(pName(p))}</strong><small>${t(p.done ? "p_taken" : "p_not")}</small></div>
      <div class="pill-btns"><button class="primary-button" data-x="take:${p.id}">${t(p.done ? "p_undo" : "p_take")}</button><button class="secondary-button" data-x="rm:${p.id}">${t("p_rm")}</button></div></article>`).join("") +
    `<div class="add-pill"><h3>${t("p_add_h")}</h3><label><span>${t("p_name")}</span><input id="pill-name" maxlength="40"></label>
      <label><span>${t("p_slot")}</span><select id="pill-slot">${SLOTS.map((s) => `<option value="${s}">${t("p_" + s)}</option>`).join("")}</select></label>
      <div class="ec-btns"><button class="primary-button" data-x="padd">${t("p_add")}</button><button class="secondary-button" data-x="pread">${t("p_read")}</button></div></div>`;
}

/* Messages with read-aloud and one-tap replies */
function renderMessages() {
  $("msg-list").innerHTML = MSGS.map((m) => {
    const rs = (X.replies[m.id] || []).map((r) => `<p class="msg-reply"><b>${t("m_you")}:</b> ${t(r)}</p>`).join("");
    return `<article class="message-card msg-block"><span class="contact-avatar ${m.c}" aria-hidden="true">${m.i}</span><div><strong>${t(m.from)}</strong><small>${t(m.time)}</small><p>${t(m.body)}</p>${rs}
      <div class="msg-btns"><button class="secondary-button" data-x="mread:${m.id}">${t("m_read")}</button>${["r1", "r2", "r3"].map((r) => `<button class="call-small" data-x="mreply:${m.id}:${r}">${t(r)}</button>`).join("")}</div></div></article>`;
  }).join("");
}

/* Feedback, usability tasks and testing log */
const doneTasks = () => TASKS.filter((k) => X.tasks[k] === "f_easy" || X.tasks[k] === "f_hard").length;
function renderFeedback() {
  $("fb-mount").innerHTML = `<div class="fb-box"><h3>${t("f_tasks_h")}</h3><p>${t("f_tasks_p")}</p>` +
    TASKS.map((k) => `<div class="task-row"><span>${t(k)}</span><select data-task="${k}" aria-label="${esc(t(k))}">${RESULTS.map((r) => `<option value="${r}"${(X.tasks[k] || "f_none") === r ? " selected" : ""}>${t(r)}</option>`).join("")}</select></div>`).join("") +
    `<p><strong id="task-sum">${t("f_sum", { n: doneTasks(), total: TASKS.length })}</strong></p></div>
    <div class="fb-box"><h3>${t("f_log_h")}</h3>${X.log.length ? X.log.slice().reverse().map((l) => `<p class="log-row">${esc(l.date)} · ${"★".repeat(l.rate)} ${esc(l.name || "")} ${esc(l.comment || "")}</p>`).join("") : `<p>${t("f_log_empty")}</p>`}
    <div class="ec-btns"><button class="secondary-button" data-x="fdl">${t("f_dl")}</button><button class="secondary-button" data-x="fclear">${t("f_clear")}</button></div></div>`;
}
function downloadCSV() {
  const q = (v) => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
  const rows = [["type", "name_or_task", "result_or_rating", "comment", "date"]];
  X.log.forEach((l) => rows.push(["feedback", l.name || "", l.rate, l.comment || "", l.date]));
  TASKS.forEach((k) => rows.push(["task", TRANSLATIONS.en[k], TRANSLATIONS.en[X.tasks[k] || "f_none"], "", ""]));
  const blob = new Blob(["\ufeff" + rows.map((r) => r.map(q).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = "ElderEase-testing-results.csv";
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/* One click handler for all the new buttons */
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-x]");
  if (!b) return;
  const [k, a, c] = b.dataset.x.split(":");
  const mount = b.closest(".ec-mount");
  if (k === "sosCall") {
    if (!hosPhone()) { e.preventDefault(); showToast(t("hs_unset")); openSosForm(b.closest(".sos-mount")); }
    else showToast(t("hs_calling", { name: hosName() }));
  }
  else if (k === "sosEdit") openSosForm(b.closest(".sos-mount"));
  else if (k === "sosCancel") b.closest(".ec-form").hidden = true;
  else if (k === "sosSave") {
    const f = b.closest(".ec-form"), p = f.querySelector(".sos-p").value.replace(/[^\d+]/g, "");
    if (p.replace(/\D/g, "").length < 8 || p.replace(/\D/g, "").length > 13) { showToast(t("hs_bad")); return; }
    X.hospital = { name: f.querySelector(".sos-n").value.trim(), phone: p }; saveX(); renderSOS(); showToast(t("hs_saved"));
  }
  else if (k === "ecCall") openModal("☎", t("mod_cc_t", { name: ecName() }), t("mod_cc_c", { name: ecName() }), t("mod_cc_ok"), () => showToast(t("toast_nocall")));
  else if (k === "ecEdit") { const f = mount.querySelector(".ec-form"); f.hidden = false; f.querySelector(".ec-n").value = ecName(); f.querySelector(".ec-p").value = X.contact.phone; f.querySelector(".ec-n").focus(); }
  else if (k === "ecCancel") mount.querySelector(".ec-form").hidden = true;
  else if (k === "ecSave") {
    const f = mount.querySelector(".ec-form"), name = f.querySelector(".ec-n").value.trim(), d = f.querySelector(".ec-p").value.replace(/\D/g, "");
    if (!name || d.length !== 10) { showToast(t("e_bad")); return; }
    X.contact = { name, phone: d.slice(0, 5) + " " + d.slice(5) }; saveX(); renderEC(); showToast(t("e_saved"));
  }
  else if (k === "take") { const p = X.pills.find((x) => x.id === a); p.done = !p.done; saveX(); renderPills(); if (p.done) showToast(t("p_t_done")); }
  else if (k === "rm") { const p = X.pills.find((x) => x.id === a); openModal("!", t("p_rm_t"), pName(p), t("p_rm"), () => { X.pills = X.pills.filter((x) => x.id !== a); saveX(); renderPills(); }); }
  else if (k === "padd") {
    const name = $("pill-name").value.trim();
    if (!name) { showToast(t("p_t_name")); return; }
    X.pills.push({ id: "c" + Date.now(), name, slot: $("pill-slot").value, done: false }); saveX(); renderPills(); showToast(t("p_t_add"));
  }
  else if (k === "pread") speak(t("p_prog", { n: sortedPills().filter((p) => p.done).length, total: X.pills.length }) + ". " + sortedPills().map((p) => t("p_" + p.slot) + ": " + pName(p) + ". " + t(p.done ? "p_taken" : "p_not")).join(". "));
  else if (k === "mread") { const m = MSGS.find((x) => x.id === a); speak(m.id === "anita" ? t("sp_msg") : t(m.from) + ": " + t(m.body)); }
  else if (k === "mreply") { (X.replies[a] = X.replies[a] || []).push(c); saveX(); renderMessages(); showToast(t("m_sent")); }
  else if (k === "rate") { rate = +a; document.querySelectorAll(".rate button").forEach((x) => { const on = x.dataset.x === "rate:" + rate; x.classList.toggle("sel", on); x.setAttribute("aria-checked", String(on)); }); }
  else if (k === "fsave") {
    if (!rate) { showToast(t("f_t_rate")); return; }
    X.log.push({ rate, name: $("fb-name").value.trim(), comment: $("fb-comment").value.trim(), date: new Date().toLocaleDateString("en-CA") });
    saveX(); $("fb-name").value = ""; $("fb-comment").value = ""; rate = 0;
    document.querySelectorAll(".rate button").forEach((x) => { x.classList.remove("sel"); x.setAttribute("aria-checked", "false"); });
    renderFeedback(); showToast(t("f_t_ok"));
  }
  else if (k === "fdl") downloadCSV();
  else if (k === "fclear") openModal("!", t("f_clear_t"), t("f_clear_c"), t("f_clear_ok"), () => { X.log = []; X.tasks = {}; saveX(); renderFeedback(); });
});
document.addEventListener("change", (e) => {
  const k = e.target.dataset && e.target.dataset.task;
  if (!k) return;
  X.tasks[k] = e.target.value; saveX();
  $("task-sum").textContent = t("f_sum", { n: doneTasks(), total: TASKS.length });
});

/* ---------- Init ---------- */
loadSettings();
loadX();
applySettings();
applyLanguage();
updateWelcomeExtras();
if ("speechSynthesis" in window) window.speechSynthesis.getVoices(); // warm up the voice list
