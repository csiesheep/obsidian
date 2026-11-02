// ゲームのページが開かれたら「あそばれた回数」に記録(同じ人は1日1回まで)
(() => {
  const s = document.currentScript, game = s && s.dataset.game;
  if (!game) return;
  let uid = null;
  try { uid = localStorage.getItem("piko_uid"); } catch {}
  if (!uid) {
    uid = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now()).replace(/[^A-Za-z0-9_-]/g, "");
    try { localStorage.setItem("piko_uid", uid); } catch {}
  }
  const day = new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10), k = "visit_" + game;
  try { if (localStorage.getItem(k) === day) return; } catch {}
  fetch("/api/visit", { method: "POST", body: JSON.stringify({ game, uid }), keepalive: true })
    .then((r) => { if (r.ok) { try { localStorage.setItem(k, day); } catch {} } }).catch(() => {});
})();
