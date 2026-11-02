// クレープ作り: 3Dのクレープパン + 生地の流れ(うすい膜の流体) + 焼け具合 + ひっくり返し + 具材
// 生地は N×N のマスに「厚み h」を持つ。流れやすさは厚みの3乗(うすいほど動かない)＋焼けて固まると止まる。
// 傾けると低い方へ流れ、ふち(フライパンの壁)で止まる。
(() => {
  const $ = (id) => document.getElementById(id);
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const sstep = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const rnd = (a, b) => a + Math.random() * (b - a);
  let toastT = 0;
  function toast(s, ms = 1800, bad = false) { const el = $("toast"); el.textContent = s; el.classList.toggle("bad", bad); el.classList.add("show"); document.body.classList.add("toasting"); clearTimeout(toastT); toastT = setTimeout(() => { el.classList.remove("show"); document.body.classList.remove("toasting"); }, ms); }
  const guide = (s) => { const el = $("guide"); if (el.innerHTML !== s) el.innerHTML = s; };

  // ---------- 音(その場で合成) ----------
  let ac = null, master = null, noise = null, crackBuf = null, sizzleG = null, crackG = null;
  function initAudio() {
    if (ac) { if (ac.state !== "running") ac.resume().catch(() => {}); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ac = new AC(); master = ac.createGain(); master.gain.value = 0.85; master.connect(ac.destination);
    noise = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    // パチパチ(まばらな小さいはじけ)
    crackBuf = ac.createBuffer(1, ac.sampleRate * 3, ac.sampleRate);
    const c = crackBuf.getChannelData(0);
    for (let k = 0; k < 520; k++) { const at = (Math.random() * (c.length - 800)) | 0, a = Math.random() ** 2, len = 80 + (Math.random() * 500) | 0; for (let i = 0; i < len; i++) c[at + i] += (Math.random() * 2 - 1) * a * Math.exp(-i / (len / 5)); }
    // ジューー: 高い所のノイズ + 少しこもった音
    const s = ac.createBufferSource(); s.buffer = noise; s.loop = true;
    const hp = ac.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 2300;
    const pk = ac.createBiquadFilter(); pk.type = "peaking"; pk.frequency.value = 5200; pk.Q.value = 0.8; pk.gain.value = 6;
    sizzleG = ac.createGain(); sizzleG.gain.value = 0;
    s.connect(hp).connect(pk).connect(sizzleG).connect(master); s.start();
    const s2 = ac.createBufferSource(); s2.buffer = crackBuf; s2.loop = true;
    const bp = ac.createBiquadFilter(); bp.type = "highpass"; bp.frequency.value = 1800;
    crackG = ac.createGain(); crackG.gain.value = 0;
    s2.connect(bp).connect(crackG).connect(master); s2.start();
  }
  function nz(freq, q, vol, dur, type = "bandpass", atk = 0.01) {
    if (!ac) return;
    const t = ac.currentTime, s = ac.createBufferSource(); s.buffer = noise;
    const f = ac.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + atk); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(master); s.start(t, Math.random()); s.stop(t + dur + 0.05);
  }
  const jyuwa = () => { nz(3600, 0.5, 0.55, 1.1, "highpass", 0.03); nz(7000, 0.7, 0.25, 0.7, "bandpass", 0.02); };

  // ---------- 生地の流体 ----------
  const N = 64, DX = 2 / N, NN = N * N;
  const h = new Float32Array(NN), cd = new Float32Array(NN), cu = new Float32Array(NN); // 厚み(mm)・下の面の焼け・上の面の焼け
  const bed = new Float32Array(NN), heat = new Float32Array(NN), mask = new Uint8Array(NN), cxs = new Float32Array(NN), cys = new Float32Array(NN);
  const fR = new Float32Array(NN), fD = new Float32Array(NN), outF = new Float32Array(NN), sc = new Float32Array(NN), pr = new Float32Array(NN);
  const K = 0.004;   // 流れやすさ(厚みの3乗にかける)
  const TS = 110;     // 傾きの強さ(高さの差に直す)
  const COOK = 0.032; // 焼ける速さ(きつね色まで約30秒)
  // なめらかなノイズ(値ノイズ)
  function hash(x, y, s) { let n = x * 374761393 + y * 668265263 + s * 982451653; n = (n ^ (n >>> 13)) * 1274126177; return ((n ^ (n >>> 16)) >>> 0) / 4294967295; }
  function vnoise(x, y, s) { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
  function fbm(x, y, s, oct) { let t = 0, a = 0.5, f = 1, n = 0; for (let o = 0; o < oct; o++) { t += a * vnoise(x * f, y * f, s + o * 17); n += a; a *= 0.5; f *= 2.03; } return t / n; }
  let seed = 1;
  function initField() {
    seed = (Math.random() * 1e6) | 0;
    for (let gy = 0; gy < N; gy++) for (let gx = 0; gx < N; gx++) {
      const i = gy * N + gx, x = -1 + (gx + 0.5) * DX, y = -1 + (gy + 0.5) * DX, r = Math.hypot(x, y);
      cxs[i] = x; cys[i] = y; mask[i] = r < 0.985 ? 1 : 0;
      // フライパンの底のわずかなでこぼこ(生地のふちが自然にゆらぐ)
      bed[i] = (fbm(x * 3.2 + 9, y * 3.2 + 4, seed, 3) - 0.5) * 0.22;
      // 火の当たり方: バーナーの輪が熱い + まだら
      heat[i] = 0.82 + 0.32 * Math.exp(-(((r - 0.5) / 0.32) ** 2)) + (fbm(x * 2.4, y * 2.4, seed + 5, 3) - 0.5) * 0.45 - 0.18 * sstep(0.8, 1, r);
      h[i] = 0; cd[i] = 0; cu[i] = 0;
    }
  }
  const setOf = (i) => (flipped ? 1 : sstep(0.077, 0.66, cd[i]));
  const mob = new Float32Array(NN), HC = 3; // マスごとの流れやすさ(固まり具合)・流れやすさの厚みの上限
  function fluidStep(dt, tx, ty) {
    // 生地のある範囲(+1マス)だけ計算する
    let hm = 0, x0 = N, x1 = -1, y0 = N, y1 = -1;
    for (let i = 0; i < NN; i++) {
      if (!mask[i] || h[i] < 1e-4) { mob[i] = 0; continue; }
      const st = 1 - setOf(i); mob[i] = st * st; const m = Math.min(h[i], HC) * st; if (m > hm) hm = m;
      const gx = i % N, gy = (i / N) | 0; if (gx < x0) x0 = gx; if (gx > x1) x1 = gx; if (gy < y0) y0 = gy; if (gy > y1) y1 = gy;
    }
    if (hm < 0.02) return;
    x0 = Math.max(0, x0 - 3); y0 = Math.max(0, y0 - 3); x1 = Math.min(N - 1, x1 + 3); y1 = Math.min(N - 1, y1 + 3);
    const tl = Math.hypot(tx, ty), lim = Math.min(0.22 * DX * DX / (K * hm * hm * hm + 1e-6), 0.4 * DX / (K * hm * hm * TS * tl + 1e-6));
    const n = Math.min(30, Math.ceil(dt / lim)), sdt = dt / n, kd = K / (DX * DX);
    for (let s = 0; s < n; s++) {
      for (let gy = y0; gy <= y1; gy++) for (let gx = x0; gx <= x1; gx++) { const i = gy * N + gx; if (mask[i]) { pr[i] = h[i] + (h[i] > 0.01 ? bed[i] : 0) - TS * (tx * cxs[i] + ty * cys[i]); outF[i] = 0; } }
      for (let gy = y0; gy <= y1; gy++) for (let gx = x0; gx <= x1; gx++) {
        const i = gy * N + gx; fR[i] = 0; fD[i] = 0; if (!mask[i]) continue;
        if (gx < x1 && mask[i + 1]) { const j = i + 1, d = pr[i] - pr[j], u = d > 0 ? i : j; if (mob[u] > 0) { const hu = h[u] < HC ? h[u] : HC, f = kd * hu * hu * hu * mob[u] * d; fR[i] = f; outF[u] += f > 0 ? f : -f; } }
        if (gy < y1 && mask[i + N]) { const j = i + N, d = pr[i] - pr[j], u = d > 0 ? i : j; if (mob[u] > 0) { const hu = h[u] < HC ? h[u] : HC, f = kd * hu * hu * hu * mob[u] * d; fD[i] = f; outF[u] += f > 0 ? f : -f; } }
      }
      // 出ていく量が今ある量をこえないように(マイナスにならない)
      for (let gy = y0; gy <= y1; gy++) for (let gx = x0; gx <= x1; gx++) { const i = gy * N + gx, o = outF[i] * sdt; sc[i] = o > h[i] ? h[i] / o : 1; }
      for (let gy = y0; gy <= y1; gy++) for (let gx = x0; gx <= x1; gx++) {
        const i = gy * N + gx; if (!mask[i]) continue;
        let f = fR[i]; if (f) { const j = i + 1; f *= f > 0 ? sc[i] : sc[j]; h[i] -= f * sdt; h[j] += f * sdt; if (!mob[j]) mob[j] = mob[i]; }
        f = fD[i]; if (f) { const j = i + N; f *= f > 0 ? sc[i] : sc[j]; h[i] -= f * sdt; h[j] += f * sdt; if (!mob[j]) mob[j] = mob[i]; }
      }
    }
    for (let i = 0; i < NN; i++) if (h[i] < 0) h[i] = 0;
  }
  // 流しこむ: 落ちた所のまわりに生地を足す
  function deposit(ux, uy, vol) {
    const sg = 0.05, R = Math.ceil(sg * 2.5 / DX), gx0 = Math.floor((ux + 1) / DX), gy0 = Math.floor((uy + 1) / DX);
    let ws = 0; const idx = [], w = [];
    for (let gy = gy0 - R; gy <= gy0 + R; gy++) for (let gx = gx0 - R; gx <= gx0 + R; gx++) {
      if (gx < 0 || gy < 0 || gx >= N || gy >= N) continue; const i = gy * N + gx; if (!mask[i]) continue;
      const q = Math.exp(-((cxs[i] - ux) ** 2 + (cys[i] - uy) ** 2) / (2 * sg * sg)); if (q < 0.01) continue; idx.push(i); w.push(q); ws += q;
    }
    if (!ws) return 0;
    for (let k = 0; k < idx.length; k++) h[idx[k]] += vol * w[k] / ws / (DX * DX);
    return vol;
  }
  // 焼ける: うすい所ほど早く、火の当たる所ほど早く
  let flipped = false, flips = 0, crumpleSev = 0;
  const crn = new Float32Array(NN); // ぐちゃっとなった時のしわ
  // 早すぎてひっくり返した: 生地がちぢんで、しわくちゃ・穴だらけになる
  function crumble(sev, cx, cy) {
    const k = 1 + 0.9 * sev, H2 = new Float32Array(NN), D2 = new Float32Array(NN), U2 = new Float32Array(NN), sd = seed + 41 + flips * 7;
    for (let i = 0; i < NN; i++) {
      if (!mask[i]) continue; const qx = cx + (cxs[i] - cx) * k + (fbm(cxs[i] * 3, cys[i] * 3, sd, 2) - 0.5) * 0.25 * sev, qy = cy + (cys[i] - cy) * k + (fbm(cxs[i] * 3 + 7, cys[i] * 3, sd, 2) - 0.5) * 0.25 * sev;
      const gx = Math.floor((qx + 1) / DX), gy = Math.floor((qy + 1) / DX); if (gx < 0 || gy < 0 || gx >= N || gy >= N) continue; const j = gy * N + gx; if (!mask[j]) continue;
      let hv = h[j] * k * k * 0.8;
      if (fbm(cxs[i] * 5 + 3, cys[i] * 5, sd + 3, 3) > 0.64 - 0.1 * sev) hv = 0; // やぶれた穴
      H2[i] = hv; D2[i] = cd[j]; U2[i] = cu[j];
    }
    h.set(H2); cd.set(D2); cu.set(U2);
    for (let i = 0; i < NN; i++) crn[i] = fbm(cxs[i] * 4.5 + 11, cys[i] * 4.5, sd + 9, 3);
    crumpleSev = Math.max(crumpleSev, sev);
  }
  function cookStep(dt) {
    for (let i = 0; i < NN; i++) {
      if (h[i] < 0.02) continue;
      cd[i] += dt * COOK * heat[i] * 1.5 / (0.65 + h[i]) * (cd[i] < 0.55 ? 2.2 : 1); // 「生」の間は早めに進む
      if (cu[i] < 0.22) cu[i] += dt * 0.012 * heat[i]; // 上の面はかわくだけ
    }
  }
  // 重さ付きの平均(厚みで重み)
  function stats() {
    let v = 0, a = 0, cdS = 0, cuS = 0, burnt = 0, raw = 0, setS = 0, wet = 0, minx = 9, maxx = -9, miny = 9, maxy = -9, sx = 0, sy = 0;
    for (let i = 0; i < NN; i++) {
      if (h[i] < 0.05) continue; const w = 1; a += w; v += h[i] * DX * DX; cdS += cd[i]; cuS += cu[i]; setS += setOf(i);
      if (cd[i] > 2.3) burnt++; if (cd[i] < 0.35) raw++; wet += h[i] * (1 - setOf(i));
      sx += cxs[i]; sy += cys[i]; if (cxs[i] < minx) minx = cxs[i]; if (cxs[i] > maxx) maxx = cxs[i]; if (cys[i] < miny) miny = cys[i]; if (cys[i] > maxy) maxy = cys[i];
    }
    if (!a) return { area: 0, vol: 0, cd: 0, cu: 0, set: 0, burnt: 0, raw: 0, wet: 0, cx: 0, cy: 0 };
    return { area: a * DX * DX, vol: v, cd: cdS / a, cu: cuS / a, set: setS / a, burnt: burnt / a, raw: raw / a, wet: wet * DX * DX, cx: sx / a, cy: sy / a, w: maxx - minx, hgt: maxy - miny };
  }
  // ひっくり返す: (cx,cy)を通る、向き d に垂直な線で鏡うつし(=その線を軸に半回転) + 上下の面を入れかえ
  function mirrorField(cx, cy, dx, dy) {
    const H2 = new Float32Array(NN), D2 = new Float32Array(NN), U2 = new Float32Array(NN); blurH();
    for (let i = 0; i < NN; i++) {
      if (!mask[i]) continue; const px = cxs[i], py = cys[i], k = (px - cx) * dx + (py - cy) * dy, qx = px - 2 * k * dx, qy = py - 2 * k * dy;
      const gx = Math.floor((qx + 1) / DX), gy = Math.floor((qy + 1) / DX); if (gx < 0 || gy < 0 || gx >= N || gy >= N) continue;
      const j = gy * N + gx, rq = Math.hypot(qx, qy); if (rq > 0.999) continue;
      // 厚みはなめらかに読み直す(元のふち=丸いフライパンの形を、階段にしない)
      H2[i] = Math.max(0, bsplineH(qx, qy)) * sstep(0.997, 0.975, rq);
      // 焼け具合も、生地のある所だけでなめらかに読む(ふちの色が階段にならない)
      let fx = (qx + 1) / DX - 0.5, fy = (qy + 1) / DX - 0.5; fx = clamp(fx, 0, N - 1.001); fy = clamp(fy, 0, N - 1.001);
      const ix = fx | 0, iy = fy | 0, u = fx - ix, v = fy - iy; let ws = 0, a1 = 0, a2 = 0;
      for (const [jj, w] of [[iy * N + ix, (1 - u) * (1 - v)], [iy * N + ix + 1, u * (1 - v)], [iy * N + ix + N, (1 - u) * v], [iy * N + ix + N + 1, u * v]]) if (h[jj] > 0.02 && w > 0) { ws += w; a1 += cu[jj] * w; a2 += cd[jj] * w; }
      if (!ws) for (let oy = -2; oy <= 2; oy++) for (let ox = -2; ox <= 2; ox++) { const x2 = ix + ox, y2 = iy + oy; if (x2 < 0 || y2 < 0 || x2 >= N || y2 >= N) continue; const jj = y2 * N + x2; if (h[jj] > 0.02) { ws++; a1 += cu[jj]; a2 += cd[jj]; } }
      if (ws > 0) { D2[i] = a1 / ws; U2[i] = a2 / ws; } else { D2[i] = cu[j]; U2[i] = cd[j]; }
    }
    h.set(H2); cd.set(D2); cu.set(U2);
    for (const a of [mot, lace]) { const b = new Float32Array(TT * TT); for (let p = 0; p < TT * TT; p++) { const px = -1 + ((p % TT) + 0.5) * 2 / TT, py = -1 + (((p / TT) | 0) + 0.5) * 2 / TT, k = (px - cx) * dx + (py - cy) * dy, qx = px - 2 * k * dx, qy = py - 2 * k * dy; const ix = Math.floor((qx + 1) / 2 * TT), iy = Math.floor((qy + 1) / 2 * TT); b[p] = ix < 0 || iy < 0 || ix >= TT || iy >= TT ? 0.5 : a[iy * TT + ix]; } a.set(b); }
  }

  // ---------- 生地の見た目(絵) ----------
  const TT = 256, mot = new Float32Array(TT * TT), lace = new Float32Array(TT * TT);
  function initNoiseTex() {
    for (let py = 0; py < TT; py++) for (let px = 0; px < TT; px++) {
      const x = px / TT * 2 - 1, y = py / TT * 2 - 1, p = py * TT + px;
      // 焼き目のまだら(クレープ特有の網目っぽいムラ)
      const m1 = fbm(x * 7 + 3, y * 7 + 1, seed + 11, 4), m2 = Math.abs(fbm(x * 15, y * 15, seed + 23, 3) - 0.5) * 2;
      mot[p] = clamp(m1 * 0.75 + (1 - m2) * 0.45 - 0.1, 0, 1);
      lace[p] = fbm(x * 22, y * 22, seed + 31, 3);
    }
  }
  // まだら/レースの模様をなめらかに読む(拡大してもドットにならない)
  function texAt(a, x, y) {
    let fx = (x + 1) / 2 * TT - 0.5, fy = (y + 1) / 2 * TT - 0.5; fx = clamp(fx, 0, TT - 1.001); fy = clamp(fy, 0, TT - 1.001);
    const ix = fx | 0, iy = fy | 0, u = fx - ix, v = fy - iy, i = iy * TT + ix;
    return (a[i] * (1 - u) + a[i + 1] * u) * (1 - v) + (a[i + TT] * (1 - u) + a[i + TT + 1] * u) * v;
  }
  // 焼け具合 → 色
  const RAMP = [[0, [238, 216, 166]], [0.25, [242, 224, 178]], [0.55, [236, 200, 128]], [0.85, [214, 156, 78]], [1.15, [190, 122, 52]], [1.6, [140, 80, 32]], [2.1, [82, 46, 20]], [2.6, [36, 24, 14]], [3.2, [16, 12, 10]]];
  const LUT = new Uint8Array(256 * 3);
  for (let k = 0; k < 256; k++) { const c = k / 255 * 3.2; let a = 0; while (a < RAMP.length - 2 && RAMP[a + 1][0] < c) a++; const [c0, p0] = RAMP[a], [c1, p1] = RAMP[a + 1], t = clamp((c - c0) / (c1 - c0), 0, 1); for (let j = 0; j < 3; j++) LUT[k * 3 + j] = p0[j] + (p1[j] - p0[j]) * t; }
  const lutI = (c) => clamp((c / 3.2 * 255) | 0, 0, 255) * 3;
  // 見た目用に厚みを少しぼかす(マスのカクカクを消す)
  const hr = new Float32Array(NN), htmp = new Float32Array(NN);
  function blurH() {
    hr.set(h);
    for (let pass = 0; pass < 1; pass++) for (const [src, dst, st] of [[hr, htmp, 1], [htmp, hr, N]]) {
      for (let i = 0; i < NN; i++) {
        if (!mask[i]) { dst[i] = 0; continue; }
        let a = src[i] * 2, w = 2; const gx = i % N, gy = (i / N) | 0;
        const ok = (j, inb) => inb && mask[j];
        if (ok(i - st, st === 1 ? gx > 0 : gy > 0)) { a += src[i - st]; w++; }
        if (ok(i + st, st === 1 ? gx < N - 1 : gy < N - 1)) { a += src[i + st]; w++; }
        dst[i] = a / w;
      }
    }
    // フライパンの外のマスには、すぐ内側の値を入れておく(ふちが階段にならないように)
    for (let i = 0; i < NN; i++) {
      if (mask[i]) continue; const gx = i % N, gy = (i / N) | 0; let a = 0, w = 0;
      for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) { const x = gx + ox, y = gy + oy; if (x < 0 || y < 0 || x >= N || y >= N) continue; const j = y * N + x; if (mask[j]) { a += hr[j]; w++; } }
      hr[i] = w ? a / w : 0;
    }
  }
  // 厚みは3次Bスプラインでなめらかに読む(ふちの輪郭が丸くなる)
  function bw(t) { const t2 = t * t, t3 = t2 * t; return [(1 - 3 * t + 3 * t2 - t3) / 6, (4 - 6 * t2 + 3 * t3) / 6, (1 + 3 * t + 3 * t2 - 3 * t3) / 6, t3 / 6]; }
  function bsplineH(x, y) {
    const gx = (x + 1) / DX - 0.5, gy = (y + 1) / DX - 0.5, ix = Math.floor(gx), iy = Math.floor(gy), wx = bw(gx - ix), wy = bw(gy - iy);
    let v = 0;
    for (let b = 0; b < 4; b++) { const yy = iy - 1 + b; if (yy < 0 || yy >= N) continue; let row = 0; for (let a = 0; a < 4; a++) { const xx = ix - 1 + a; if (xx < 0 || xx >= N) continue; row += hr[yy * N + xx] * wx[a]; } v += row * wy[b]; }
    return v;
  }
  function sampleFields(x, y) {
    let gx = (x + 1) / DX - 0.5, gy = (y + 1) / DX - 0.5; gx = clamp(gx, 0, N - 1.001); gy = clamp(gy, 0, N - 1.001);
    const ix = gx | 0, iy = gy | 0, i = iy * N + ix; let fx = gx - ix, fy = gy - iy; fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
    const w00 = (1 - fx) * (1 - fy), w10 = fx * (1 - fy), w01 = (1 - fx) * fy, w11 = fx * fy;
    return [bsplineH(x, y), cd[i] * w00 + cd[i + 1] * w10 + cd[i + N] * w01 + cd[i + N + 1] * w11, cu[i] * w00 + cu[i + 1] * w10 + cu[i + N] * w01 + cu[i + N + 1] * w11];
  }
  // face: "up"(上の面) か "down"(下の面)。T: 絵の大きさ
  function paintFace(cv, face) {
    const T = cv.width, g = cv.getContext("2d"), img = g.createImageData(T, T), d = img.data; blurH();
    for (let py = 0; py < T; py++) for (let px = 0; px < T; px++) {
      const x = (px + 0.5) / T * 2 - 1, y = (py + 0.5) / T * 2 - 1, o = (py * T + px) * 4;
      if (x * x + y * y > 1) { d[o + 3] = 0; continue; }
      const [hh, dd, uu] = sampleFields(x, y), mo = texAt(mot, x, y), la = texAt(lace, x, y);
      const cook = face === "down" ? dd : uu, other = face === "down" ? uu : dd;
      // ふち: 焼けてくると、うすい所がレースのように穴あき
      const th = 0.06 + 0.16 * la * sstep(0.4, 1.6, Math.max(dd, uu)) * sstep(0.7, 0.1, hh);
      if (hh < th - 0.03) { d[o + 3] = 0; continue; }
      const al = sstep(th - 0.03, th + 0.03, hh) * sstep(0.997, 0.975, Math.sqrt(x * x + y * y));
      const c = cook * (0.68 + 0.64 * mo);
      let k = lutI(c), r = LUT[k], gg = LUT[k + 1], b = LUT[k + 2];
      if (face === "up" && cook < 0.3) {
        // まだ焼いていない面: 生地の色。うすいふちは下の焼き色が透けて見える
        const e = sstep(0.55, 0.12, hh) * sstep(0.1, 0.9, other), k2 = lutI(other * (0.68 + 0.64 * mo)), dry = sstep(0.1, 0.6, other);
        r = r + (LUT[k2] - r) * e; gg = gg + (LUT[k2 + 1] - gg) * e; b = b + (LUT[k2 + 2] - b) * e;
        // 固まってくると小さな気泡の穴
        if (dry > 0.3 && la > 0.72 && mo > 0.55) { r *= 0.9; gg *= 0.88; b *= 0.85; }
        if (dry < 0.5) { const s = 1 - dry * 2; r += (236 - r) * 0.25 * s; gg += (210 - gg) * 0.25 * s; b += (150 - b) * 0.25 * s; }
      }
      // 厚い所は少し影
      let sh = 1 - clamp((hh - 1.2) * 0.05, 0, 0.12);
      if (crumpleSev) { const w = crn[clamp(((y + 1) / DX) | 0, 0, N - 1) * N + clamp(((x + 1) / DX) | 0, 0, N - 1)], f = Math.abs(2 * w - 1); sh *= 1 - crumpleSev * (f > 0.75 ? 0.35 : f * 0.2); }
      d[o] = r * sh; d[o + 1] = gg * sh; d[o + 2] = b * sh; d[o + 3] = al * 255;
    }
    g.putImageData(img, 0, 0);
  }

  // ---------- 3D ----------
  if (!window.THREE) { $("startBtn").textContent = "このブラウザでは3Dが使えません"; return; }
  const V = THREE.Vector3, lin = (x) => new THREE.Color(x).convertSRGBToLinear();
  const RI = 1.0, RO = 1.09, BOTTOM = 0.04;
  const cv3 = $("c3"), lab = $("lab"), lg = lab.getContext("2d");
  const r = new THREE.WebGLRenderer({ canvas: cv3, antialias: true });
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0f0d0b);
  const cam = new THREE.PerspectiveCamera(34, 1, 0.05, 60);
  const ray = new THREE.Raycaster();
  function canvasTex(w, hh, draw, rep) {
    const c = document.createElement("canvas"); c.width = w; c.height = hh; draw(c.getContext("2d"), w, hh);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8;
    if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); }
    return t;
  }
  {
    const s = new THREE.Scene();
    s.add(new THREE.Mesh(new THREE.BoxGeometry(20, 12, 20), new THREE.MeshBasicMaterial({ color: 0x141210, side: THREE.BackSide })));
    const panel = (w, hh, col, x, y, z, ry, rx = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, hh), new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide })); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); s.add(m); };
    panel(3, 1.5, 0xfff2dc, 0, 5.9, -1, 0, Math.PI / 2); panel(2, 3, 0xffe0b8, -9.9, 2, 0, Math.PI / 2); panel(2.5, 2, 0xd8e4ff, 9.9, 2.5, -2, -Math.PI / 2);
    const pm = new THREE.PMREMGenerator(r); scene.environment = pm.fromScene(s, 0.02).texture; pm.dispose();
  }
  scene.add(new THREE.HemisphereLight(0xffeedd, 0x1a120c, 0.4));
  const spot = new THREE.SpotLight(0xfff0dc, 2.5, 14, 0.66, 0.55, 1.2); spot.position.set(-0.7, 5.5, 0.9); spot.target.position.set(0, 0, -0.4);
  spot.castShadow = true; spot.shadow.mapSize.set(2048, 2048); spot.shadow.radius = 5; spot.shadow.bias = -0.0004; scene.add(spot, spot.target);
  const shine = new THREE.PointLight(0xfff4e0, 0.8, 7, 1.5); shine.position.set(0.4, 2.6, 1.0); scene.add(shine);
  // 台
  const counterTex = canvasTex(512, 512, (g, w, hh) => { g.fillStyle = "#6f6a64"; g.fillRect(0, 0, w, hh); for (let i = 0; i < 14000; i++) { g.fillStyle = Math.random() < 0.5 ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.08)"; g.fillRect(Math.random() * w, Math.random() * hh, 2, 2); } }, 4);
  const counter = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.MeshStandardMaterial({ map: counterTex, roughness: 0.85 }));
  counter.rotation.x = -Math.PI / 2; counter.position.y = -0.32; counter.receiveShadow = true; scene.add(counter);
  // コンロ
  const iron = new THREE.MeshStandardMaterial({ color: lin(0x1a1a1b), roughness: 0.55, metalness: 0.6 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.035, 8, 64), iron); ring.rotation.x = Math.PI / 2; ring.position.y = -0.24; ring.castShadow = true; scene.add(ring);
  for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2 + 0.3, bar = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.06, 0.06), iron); bar.position.set(Math.cos(a) * 0.85, -0.2, Math.sin(a) * 0.85); bar.rotation.y = -a; bar.castShadow = true; scene.add(bar); }
  const flames = [], fmat = new THREE.MeshBasicMaterial({ color: 0x4a8cff, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });
  for (let k = 0; k < 30; k++) { const a = k / 30 * Math.PI * 2, f = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.14, 6), fmat); f.position.set(Math.cos(a) * 0.55, -0.2, Math.sin(a) * 0.55); f.rotation.z = Math.cos(a) * -0.5; f.rotation.x = Math.sin(a) * 0.5; scene.add(f); flames.push(f); }
  const glow = new THREE.PointLight(0x4f7dff, 0.6, 3); glow.position.set(0, -0.15, 0); scene.add(glow);
  // ガスの火: フライパンのふちの外まで、ゆらゆら燃えるほのお(上から見ても見える)
  const fireTex = canvasTex(64, 128, (g, w, hh) => {
    const gr = g.createRadialGradient(w / 2, hh * 0.9, 2, w / 2, hh * 0.75, hh * 0.75); gr.addColorStop(0, "rgba(220,240,255,1)"); gr.addColorStop(0.25, "rgba(90,150,255,.95)"); gr.addColorStop(0.6, "rgba(40,80,255,.5)"); gr.addColorStop(1, "rgba(20,40,200,0)");
    g.fillStyle = gr; g.beginPath(); g.moveTo(w / 2, 4); g.bezierCurveTo(w * 0.95, hh * 0.45, w * 0.9, hh * 0.95, w / 2, hh - 2); g.bezierCurveTo(w * 0.1, hh * 0.95, w * 0.05, hh * 0.45, w / 2, 4); g.fill();
  });
  const fires = [];
  for (let k = 0; k < 44; k++) {
    const a = k / 44 * Math.PI * 2 + Math.random() * 0.05, sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: fireTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.9 }));
    const rr = RO + 0.05 + Math.random() * 0.04; sp.position.set(Math.cos(a) * rr, -0.13, Math.sin(a) * rr); sp.center.set(0.5, 0.05); scene.add(sp); fires.push({ sp, a, ph: Math.random() * 10, s: 0.8 + Math.random() * 0.4 });
  }

  // ---- クレープパン(鉄・うすくて平ら・ふちが低い) ----
  const panG = new THREE.Group(); scene.add(panG);
  const PP = [[0, BOTTOM], [RI, BOTTOM], [RI + 0.03, BOTTOM + 0.01], [RO - 0.015, 0.1], [RO, 0.112], [RO + 0.01, 0.104], [RO - 0.01, 0.092], [RI + 0.02, -0.01], [RI - 0.03, -0.025], [0, -0.025]];
  const speck = canvasTex(512, 512, (g, w, hh) => { g.fillStyle = "#2a2a2c"; g.fillRect(0, 0, w, hh); for (let i = 0; i < 12000; i++) { g.fillStyle = Math.random() < 0.5 ? "rgba(255,255,255,.045)" : "rgba(0,0,0,.25)"; g.fillRect(Math.random() * w, Math.random() * hh, 1.5, 1.5); } g.strokeStyle = "rgba(255,255,255,.03)"; for (let k = 1; k < 40; k++) { g.beginPath(); g.arc(w / 2, hh / 2, k * 6.4, 0, 7); g.stroke(); } });
  const panMat = new THREE.MeshPhysicalMaterial({ map: speck, color: lin(0xffffff), roughness: 0.4, metalness: 0.45, clearcoat: 0.3, clearcoatRoughness: 0.35, side: THREE.DoubleSide });
  const panBody = new THREE.Mesh(new THREE.LatheGeometry(PP.map(([x, y]) => new THREE.Vector2(x, y)), 112), panMat);
  panBody.castShadow = true; panBody.receiveShadow = true; panG.add(panBody);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(RI, 96), panMat); floor.rotation.x = -Math.PI / 2; floor.position.y = BOTTOM + 0.001; floor.receiveShadow = true; panG.add(floor);
  // 取っ手(金具 + 木)
  const wood = canvasTex(256, 64, (g, w, hh) => { g.fillStyle = "#6e3c1a"; g.fillRect(0, 0, w, hh); for (let i = 0; i < 46; i++) { g.strokeStyle = `rgba(${Math.random() < 0.5 ? "40,18,6" : "190,120,60"},${0.15 + Math.random() * 0.2})`; g.lineWidth = 1 + Math.random() * 2; const y = Math.random() * hh; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + 3, w * 0.6, y - 3, w, y + 1); g.stroke(); } });
  const metal = new THREE.MeshStandardMaterial({ color: lin(0x8d9196), roughness: 0.3, metalness: 1 });
  const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.05, 0.42), metal); bracket.position.set(0, 0.1, RO + 0.17); bracket.rotation.x = -0.12; bracket.castShadow = true; panG.add(bracket);
  const ferrule = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.12, 20), metal); ferrule.rotation.x = Math.PI / 2 - 0.12; ferrule.position.set(0, 0.14, RO + 0.42); panG.add(ferrule);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.095, 1.05, 20), new THREE.MeshStandardMaterial({ map: wood, roughness: 0.55 }));
  handle.rotation.x = Math.PI / 2 - 0.12; handle.position.set(0, 0.2, RO + 1.0); handle.castShadow = true; panG.add(handle);
  const handleHit = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.5, 8), new THREE.MeshBasicMaterial({ visible: false })); handleHit.rotation.copy(handle.rotation); handleHit.position.set(0, 0.2, RO + 0.85); panG.add(handleHit);

  // ---- 生地(格子のメッシュ。上の面と下の面で別の絵) ----
  const crepeG = new THREE.Group(), crepeIn = new THREE.Group(); crepeG.add(crepeIn); panG.add(crepeG);
  const NV = N + 1, cpos = new Float32Array(NV * NV * 3), cuv = new Float32Array(NV * NV * 2), cidx = [];
  for (let vy = 0; vy < NV; vy++) for (let vx = 0; vx < NV; vx++) { const k = vy * NV + vx; cpos[k * 3] = (-1 + vx * DX) * RI; cpos[k * 3 + 2] = (-1 + vy * DX) * RI; cuv[k * 2] = vx / N; cuv[k * 2 + 1] = 1 - vy / N; }
  for (let vy = 0; vy < N; vy++) for (let vx = 0; vx < N; vx++) { const a = vy * NV + vx, b = a + 1, c = a + NV, d = c + 1; cidx.push(a, c, b, b, c, d); }
  const cgeo = new THREE.BufferGeometry(); cgeo.setAttribute("position", new THREE.BufferAttribute(cpos, 3)); cgeo.setAttribute("uv", new THREE.BufferAttribute(cuv, 2)); cgeo.setIndex(cidx);
  const upCv = document.createElement("canvas"), dnCv = document.createElement("canvas"); upCv.width = upCv.height = dnCv.width = dnCv.height = 256;
  const upTex = new THREE.CanvasTexture(upCv), dnTex = new THREE.CanvasTexture(dnCv); for (const t of [upTex, dnTex]) { t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; }
  const upMat = new THREE.MeshPhysicalMaterial({ map: upTex, bumpMap: upTex, bumpScale: 0.004, transparent: true, alphaTest: 0.02, depthWrite: false, roughness: 0.55, clearcoat: 0.6, clearcoatRoughness: 0.15, side: THREE.FrontSide });
  const dnMat = new THREE.MeshPhysicalMaterial({ map: dnTex, bumpMap: dnTex, bumpScale: 0.004, transparent: true, alphaTest: 0.02, roughness: 0.6, side: THREE.BackSide });
  const upMesh = new THREE.Mesh(cgeo, upMat), dnMesh = new THREE.Mesh(cgeo, dnMat); upMesh.receiveShadow = true; upMesh.castShadow = true; dnMesh.visible = false;
  // 影は生地の形どおりに(四角いメッシュ全体の影にしない)
  const shapeDepth = (tex) => new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.5, side: THREE.DoubleSide });
  upMesh.customDepthMaterial = shapeDepth(upTex);
  crepeIn.add(upMesh, dnMesh);
  function updateGeo(bend) {
    for (let vy = 0; vy < NV; vy++) for (let vx = 0; vx < NV; vx++) {
      const k = vy * NV + vx; let s = 0, c = 0;
      for (const [gx, gy] of [[vx - 1, vy - 1], [vx, vy - 1], [vx - 1, vy], [vx, vy]]) if (gx >= 0 && gy >= 0 && gx < N && gy < N) { s += hr[gy * N + gx]; c++; }
      const hv = c ? s / c : 0; let y = BOTTOM + 0.004 + hv * 0.006;
      if (crumpleSev && hv > 0.03) { const gx = Math.min(N - 1, vx), gy = Math.min(N - 1, vy), w = crn[gy * N + gx]; y += crumpleSev * 0.1 * (1 - Math.abs(2 * w - 1)) * sstep(0.03, 0.3, hv); }
      if (bend) y += bend(cpos[k * 3], cpos[k * 3 + 2]);
      cpos[k * 3 + 1] = y;
    }
    cgeo.attributes.position.needsUpdate = true; cgeo.computeVertexNormals();
  }

  // ---- 生地のボウルとお玉 ----
  const BOWL = new V(-1.05, -0.32, -1.85);
  const bowl = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [0.3, 0], [0.45, 0.05], [0.56, 0.2], [0.6, 0.34], [0.62, 0.35], [0.58, 0.34], [0.54, 0.2], [0.44, 0.07], [0.3, 0.025], [0, 0.025]].map(([x, y]) => new THREE.Vector2(x, y)), 64),
    new THREE.MeshStandardMaterial({ color: lin(0xd8dce0), roughness: 0.22, metalness: 1, side: THREE.DoubleSide }));
  bowl.position.copy(BOWL); bowl.castShadow = true; bowl.receiveShadow = true; scene.add(bowl);
  const batterMat = new THREE.MeshPhysicalMaterial({ color: lin(0xf0d9a0), roughness: 0.25, clearcoat: 0.8, clearcoatRoughness: 0.1 });
  const bowlBatter = new THREE.Mesh(new THREE.CircleGeometry(0.55, 48), batterMat); bowlBatter.rotation.x = -Math.PI / 2; bowlBatter.position.set(BOWL.x, BOWL.y + 0.26, BOWL.z); scene.add(bowlBatter);
  const ladle = new THREE.Group(); scene.add(ladle);
  const steel = new THREE.MeshStandardMaterial({ color: lin(0xcfd3d8), roughness: 0.2, metalness: 1, side: THREE.DoubleSide });
  const cupPts = []; for (let k = 0; k <= 12; k++) { const a = k / 12 * Math.PI / 2; cupPts.push(new THREE.Vector2(Math.sin(a) * 0.2, -Math.cos(a) * 0.15 + 0.15)); }
  const cup = new THREE.Mesh(new THREE.LatheGeometry(cupPts, 40), steel); cup.castShadow = true; ladle.add(cup);
  const ladleBatter = new THREE.Mesh(new THREE.CircleGeometry(0.19, 32), batterMat); ladleBatter.rotation.x = -Math.PI / 2; ladleBatter.position.y = 0.12; ladle.add(ladleBatter);
  const lh = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.026, 1.25, 10), steel); lh.position.set(0.62, 0.45, 0); lh.rotation.z = -1.0; lh.castShadow = true; ladle.add(lh);
  const lhEnd = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 8), steel); lhEnd.position.set(1.15, 0.79, 0); ladle.add(lhEnd);
  const ladleHit = new THREE.Mesh(new THREE.SphereGeometry(0.45, 10, 8), new THREE.MeshBasicMaterial({ visible: false })); ladleHit.position.set(0.35, 0.2, 0); ladle.add(ladleHit);
  const qFlat = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
  const LIP = new V(0, 0.15, 0.2); // お玉の注ぎ口(手前のふち)
  const LADLE_HOME = new V(BOWL.x - 0.05, BOWL.y + 0.2, BOWL.z + 0.05);
  ladle.position.copy(LADLE_HOME); ladle.rotation.y = -0.5;
  // 生地の流れ落ちる筋
  const streamMat = new THREE.MeshPhysicalMaterial({ color: lin(0xf0d9a0), roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.05 });
  let streamMesh = null;
  // 湯気・煙
  const smokeTex = canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,.55)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
  const steams = []; for (let i = 0; i < 80; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, transparent: true, depthWrite: false, opacity: 0 })); s.visible = false; scene.add(s); steams.push({ s, t: -1 }); }

  // ---------- カメラ ----------
  let layoutBot = 9999;
  function place() {
    const W = innerWidth, H = innerHeight;
    if (r.__w !== W || r.__h !== H) { r.setSize(W, H, false); r.__w = W; r.__h = H; lab.width = W * Math.min(2, devicePixelRatio || 1); lab.height = H * Math.min(2, devicePixelRatio || 1); }
    cam.aspect = W / H;
    const pr0 = $("panel").getBoundingClientRect(); layoutBot = pr0.height ? Math.min(H, pr0.top) : H;
    const hh = Math.atan(Math.tan(THREE.MathUtils.degToRad(17)) * cam.aspect);
    let dist = Math.max(4.3, 1.42 / Math.tan(hh));
    const el = 1.02, cy = (100 + layoutBot) / 2;
    const set = () => { cam.position.set(0, Math.sin(el) * dist, Math.cos(el) * dist + 0.25); cam.lookAt(0, 0, -0.3); cam.setViewOffset(W, H, 0, H / 2 - cy, W, H); cam.updateProjectionMatrix(); cam.updateMatrixWorld(true); };
    const sy = (x, y, z) => (1 - new V(x, y, z).project(cam).y) / 2 * H;
    set();
    for (let i = 0; i < 24; i++) { if (sy(0, 0.25, RO + 1.5) <= layoutBot - 6 && sy(BOWL.x, 0.1, BOWL.z - 0.6) >= 100) break; dist *= 1.05; set(); }
  }
  const ndc = (x, y) => new THREE.Vector2(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1);
  // 画面の点 → フライパンの底の単位座標(半径1)
  function unitAt(x, y) {
    ray.setFromCamera(ndc(x, y), cam);
    const inv = new THREE.Matrix4().copy(panG.matrixWorld).invert();
    const o = ray.ray.origin.clone().applyMatrix4(inv), d = ray.ray.direction.clone().transformDirection(inv);
    if (Math.abs(d.y) < 1e-6) return null; const t = (BOTTOM - o.y) / d.y; if (t < 0) return null;
    const p = o.addScaledVector(d, t); return [p.x / RI, p.z / RI];
  }
  const toPanWorld = (ux, uy, y) => new V(ux * RI, y, uy * RI).applyMatrix4(panG.matrixWorld);

  // ---------- 状態 ----------
  let stage = "title", tilt = [0, 0], tgt = [0, 0], ptrs = new Map();
  let batter = 1, scoops = 1, pouring = false, pourT = 0, pourAt = null, flip = null, lastSt = null, playT = 0, smokeAcc = 0, wasPour = false, redrawT = 0;
  const SCOOP = 2.3; // お玉1杯の生地の量(ちょうど1枚分くらい)
  const POUR_RATE = 1.5;
  function reset() {
    initField(); initNoiseTex(); flipped = false; flips = 0; crumpleSev = 0; flip = null; batter = 1; scoops = 1; pouring = false; pourAt = null; tilt = [0, 0]; tgt = [0, 0]; playT = 0; ptrs.clear();
    crepeG.position.set(0, 0, 0); crepeG.quaternion.identity(); crepeIn.position.set(0, 0, 0); dnMesh.visible = false;
    ladle.position.copy(LADLE_HOME); ladle.rotation.set(0, -0.5, 0); ladleBatter.visible = true; ladleBatter.scale.setScalar(1);
    paintFace(upCv, "up"); paintFace(dnCv, "down"); upTex.needsUpdate = dnTex.needsUpdate = true; updateGeo();
    lastSt = stats(); stage = "cook";
  }

  // ---------- 操作 ----------
  function pick(x, y) {
    ray.setFromCamera(ndc(x, y), cam);
    const hits = ray.intersectObjects([ladleHit, handleHit, bowl], false);
    for (const ht of hits) { if (ht.object === ladleHit || ht.object === bowl) return "ladle"; if (ht.object === handleHit) return "handle"; }
    const u = unitAt(x, y);
    if (u && Math.hypot(u[0], u[1]) < 1.0) {
      // 生地の上(近く)か
      for (let a = 0; a < 9; a++) { const [hh] = sampleFields(u[0] + (a % 3 - 1) * 0.05, u[1] + ((a / 3 | 0) - 1) * 0.05); if (hh > 0.08) return "crepe"; }
      return "pan";
    }
    return null;
  }
  cv3.addEventListener("pointerdown", (e) => {
    if (stage !== "cook") return; initAudio();
    const kind = pick(e.clientX, e.clientY); if (!kind) return;
    try { cv3.setPointerCapture(e.pointerId); } catch (er) {}
    const p = { kind, sx: e.clientX, sy: e.clientY, x: e.clientX, y: e.clientY, u0: unitAt(e.clientX, e.clientY) };
    if (kind === "ladle") {
      if (flipped) { toast("ひっくり返したら、もう生地は足せないよ"); return; }
      if (batter <= 0.01) { batter = 1; scoops++; ladleBatter.visible = true; toast("お玉にもう1杯すくった"); }
    }
    if (kind === "pan") { toast("取っ手をつかんで傾けよう"); return; }
    ptrs.set(e.pointerId, p);
  });
  cv3.addEventListener("pointermove", (e) => {
    const p = ptrs.get(e.pointerId); if (!p) return; p.x = e.clientX; p.y = e.clientY;
    if (p.kind === "handle") {
      const s = Math.min(innerWidth, innerHeight) * 0.32; let dx = (p.x - p.sx) / s, dy = (p.y - p.sy) / s; const l = Math.hypot(dx, dy); if (l > 1) { dx /= l; dy /= l; }
      tgt = [dx, dy];
    } else if (p.kind === "crepe" && !flip) {
      const dd = Math.hypot(p.x - p.sx, p.y - p.sy);
      if (dd > 34) tryFlip(p);
    }
  });
  const endPtr = (e) => {
    const p = ptrs.get(e.pointerId); if (!p) return; ptrs.delete(e.pointerId);
    if (p.kind === "handle") tgt = [0, 0];
    if (p.kind === "ladle") { pouring = false; }
  };
  cv3.addEventListener("pointerup", endPtr); cv3.addEventListener("pointercancel", endPtr);

  function tryFlip(p) {
    p.kind = "done";
    const st = stats();
    if (st.area < 0.05) return;
    const u1 = unitAt(p.x, p.y), u0 = p.u0; if (!u0 || !u1) return;
    let dx = u1[0] - u0[0], dy = u1[1] - u0[1]; const l = Math.hypot(dx, dy); if (l < 1e-4) return; dx /= l; dy /= l;
    // めくれるのは、つまんだ側。外へ引っぱった時(つまんだ所が重心より指の進む側)は向きを逆にして、つまんだ側が持ち上がる
    if ((u0[0] - st.cx) * dx + (u0[1] - st.cy) * dy > 0) { dx = -dx; dy = -dy; }
    // 生地がやぶれるかも(生の所が多い)
    // 「生」のうちにひっくり返すと、ぐちゃっとくずれる
    const sev = flipped || st.cd >= 0.55 ? 0 : clamp(0.4 + (0.55 - st.cd) / 0.4, 0.4, 1); // メーターが「生」なら必ずくずれる
    flip = { t: 0, cx: st.cx, cy: st.cy, dx, dy, sev };
    nz(2600, 0.7, 0.35, 0.25, "highpass"); // ペリッ
    if (sizzleG) sizzleG.gain.setTargetAtTime(0.02, ac.currentTime, 0.05);
  }

  // ---------- 毎コマ ----------
  function stepFlip(dt) {
    flip.t += dt / 0.75; const u = Math.min(1, flip.t), e = u < 0.5 ? 2 * u * u : 1 - 2 * (1 - u) * (1 - u);
    const c = new V(flip.cx * RI, 0, flip.cy * RI), axis = new V(flip.dy, 0, -flip.dx).normalize(); // 上 × d
    crepeIn.position.set(-c.x, 0, -c.z);
    crepeG.position.set(c.x, Math.sin(u * Math.PI) * 0.55, c.z);
    crepeG.quaternion.setFromAxisAngle(axis, Math.PI * e);
    dnMesh.visible = true;
    // めくる時に生地がたわむ
    const sag = Math.sin(u * Math.PI) * (0.18 + 0.5 * flip.sev);
    updateGeo((x, z) => { const s = ((x - c.x) * flip.dx + (z - c.z) * flip.dy); return -sag * (s * s) * 1.2 + sag * 0.15; });
    if (u >= 1) {
      mirrorField(flip.cx, flip.cy, flip.dx, flip.dy); if (flip.sev > 0) crumble(flip.sev, flip.cx, flip.cy); flipped = true; flips++;
      crepeG.position.set(0, 0, 0); crepeG.quaternion.identity(); crepeIn.position.set(0, 0, 0); dnMesh.visible = false;
      paintFace(upCv, "up"); paintFace(dnCv, "down"); upTex.needsUpdate = dnTex.needsUpdate = true; updateGeo();
      jyuwa(); nz(160, 1, 0.5, 0.18, "lowpass"); // ペタン
      if (flip.sev > 0) { toast(flip.sev > 0.7 ? "ぐちゃっ！！ まだ生だった…" : "ベリッ…まだ生だった！ やぶれた", 3000, true); nz(300, 0.8, 0.5, 0.35, "lowpass"); nz(1800, 1.5, 0.3, 0.3); }
      else toast(flips === 1 ? "くるっ！ 裏も焼こう" : "くるっ！");
      flip = null;
    }
  }
  function frame(dt) {
    if (stage !== "cook") return;
    playT += dt;
    // 傾き(取っ手を動かした向きが低くなる)
    tilt = [tilt[0] + (tgt[0] - tilt[0]) * Math.min(1, dt * 9), tilt[1] + (tgt[1] - tilt[1]) * Math.min(1, dt * 9)];
    panG.rotation.set(tilt[1] * 0.26, 0, -tilt[0] * 0.26); panG.updateMatrixWorld(true);
    for (const f of flames) { const k = 0.75 + 0.25 * Math.sin(playT * 22 + f.position.x * 9); f.scale.set(1, k, 1); }
    for (const f of fires) { const n = 0.7 + 0.2 * Math.sin(playT * 17 + f.ph) + 0.15 * Math.sin(playT * 31 + f.ph * 2.3) + 0.1 * Math.random(); f.sp.scale.set(0.1 * f.s, 0.3 * f.s * n, 1); f.sp.material.opacity = 0.65 + 0.3 * n; }
    glow.intensity = 0.55 + 0.12 * Math.sin(playT * 23) + 0.06 * Math.random();
    // お玉
    let lp = null; for (const p of ptrs.values()) if (p.kind === "ladle") lp = p;
    pouring = false;
    if (lp) {
      const u = unitAt(lp.x, lp.y); let tgtPos, over = false;
      if (u) { const rr = Math.hypot(u[0], u[1]); over = rr < 0.93; const k = rr > 1.3 ? 1.3 / rr : 1; tgtPos = toPanWorld(u[0] * k, u[1] * k, BOTTOM + 0.62); } else tgtPos = LADLE_HOME.clone();
      // 注ぎ口(お玉のふち)が指の真上に来るように
      const tip = over && batter > 0 ? 1.2 : 0.15;
      ladle.rotation.set(tip, 0, 0);
      const lipOff = LIP.clone().applyEuler(new THREE.Euler(tip, 0, 0));
      ladle.position.lerp(tgtPos.clone().sub(lipOff), Math.min(1, dt * 16));
      if (over && batter > 0) { pouring = true; pourAt = u; }
    } else {
      ladle.position.lerp(LADLE_HOME, Math.min(1, dt * 8)); ladle.rotation.set(0, -0.5, 0);
      if (ladle.position.distanceTo(LADLE_HOME) < 0.05 && batter < 1 && !flipped && batter > 0) { /* そのまま */ }
    }
    ladle.updateMatrixWorld(true);
    // お玉の中の生地はいつも水平
    ladleBatter.quaternion.copy(ladle.quaternion).invert().multiply(qFlat);
    ladleBatter.visible = batter > 0.02; ladleBatter.scale.setScalar(0.45 + 0.55 * Math.sqrt(batter)); ladleBatter.position.y = 0.04 + 0.08 * batter;
    // 注ぐ
    if (pouring) {
      const v = Math.min(batter * SCOOP, POUR_RATE * dt);
      const wob = 0.012; deposit(pourAt[0] + rnd(-wob, wob), pourAt[1] + rnd(-wob, wob), v); batter -= v / SCOOP; if (batter < 0.002) batter = 0;
      if (!wasPour) { jyuwa(); } // 鉄板に着いた瞬間にジュワッ
      // 筋: お玉のふち → 落ちる所
      const lip = LIP.clone().applyMatrix4(ladle.matrixWorld);
      const [hh] = sampleFields(pourAt[0], pourAt[1]); const land = toPanWorld(pourAt[0], pourAt[1], BOTTOM + 0.004 + hh * 0.006);
      const pts = []; for (let k = 0; k <= 8; k++) { const t = k / 8; const pnt = lip.clone().lerp(land, t); pnt.x += Math.sin(playT * 30 + k) * 0.004 * t; pnt.y += (1 - t) * t * 0.06; pts.push(pnt); }
      if (streamMesh) { scene.remove(streamMesh); streamMesh.geometry.dispose(); }
      const curve = new THREE.CatmullRomCurve3(pts), geo = new THREE.TubeGeometry(curve, 16, 0.022, 8, false);
      const pa = geo.attributes.position; // 下ほど細く
      for (let i = 0; i < pa.count; i++) { const seg = Math.floor(i / 9) / 16, ctr = curve.getPoint(seg), k = 1 - 0.55 * seg; pa.setXYZ(i, ctr.x + (pa.getX(i) - ctr.x) * k, ctr.y + (pa.getY(i) - ctr.y) * k, ctr.z + (pa.getZ(i) - ctr.z) * k); }
      geo.computeVertexNormals(); streamMesh = new THREE.Mesh(geo, streamMat); scene.add(streamMesh);
    } else if (streamMesh) { scene.remove(streamMesh); streamMesh.geometry.dispose(); streamMesh = null; }
    wasPour = pouring;
    // 生地
    if (!flip) { fluidStep(Math.min(dt, 1 / 30), tilt[0], tilt[1]); cookStep(dt); }
    else { cookStep(dt * 0.3); stepFlip(dt); }
    redrawT += dt;
    if (redrawT > (pouring ? 0.05 : 0.12)) { redrawT = 0; if (!flip) { paintFace(upCv, "up"); upTex.needsUpdate = true; updateGeo(); } else { paintFace(upCv, "up"); paintFace(dnCv, "down"); upTex.needsUpdate = dnTex.needsUpdate = true; } lastSt = stats(); }
    const st = lastSt;
    upMat.clearcoat = 0.1 + 0.7 * clamp(st.wet / Math.max(0.05, st.vol), 0, 1) * (flipped ? 0 : 1);
    // 音: 生の生地が熱い鉄にふれているほどジュー
    if (ac && sizzleG) {
      const wetA = clamp(st.wet * 0.9, 0, 1), cookA = st.area ? 0.12 + 0.25 * clamp(st.cd - 1.5, 0, 1) : 0;
      const lvl = flip ? 0.02 : (pouring ? 0.5 : 0) + wetA * 0.5 + cookA * clamp(st.area, 0, 1);
      sizzleG.gain.setTargetAtTime(Math.min(0.55, lvl * 0.5), ac.currentTime, 0.08);
      crackG.gain.setTargetAtTime(Math.min(0.5, (wetA * 0.6 + (pouring ? 0.3 : 0) + clamp(st.cd - 1.2, 0, 1) * 0.3) * 0.6), ac.currentTime, 0.1);
    }
    // 湯気/こげの煙
    // 焼いている間は白い湯気、こげてくると灰色 → 真っ黒な煙がもくもく
    const burning = st.cd > 1.45 && st.area > 0.05, steamy = st.area > 0.05;
    smokeAcc += dt * (burning ? 8 + 22 * clamp(st.cd - 1.45, 0, 1.5) : steamy ? 4 + 4 * clamp(st.wet * 2, 0, 1) : 0);
    while (smokeAcc > 1) {
      smokeAcc--; const sp = steams.find((q) => q.t < 0); if (!sp) break;
      let i = 0; for (let k = 0; k < 20; k++) { i = (Math.random() * NN) | 0; if (h[i] > 0.1) break; }
      if (h[i] <= 0.1) break;
      const cc = flipped || !flip ? cd[i] : cd[i]; sp.t = 0; sp.dark = burning ? clamp((cc - 1.3) / 0.9, 0, 1) : 0; const w = toPanWorld(cxs[i], cys[i], BOTTOM + 0.05); sp.x = w.x; sp.z = w.z; sp.y = w.y; sp.s.visible = true;
      const gcol = new THREE.Color(0xffffff).lerp(new THREE.Color(0x14110e), sp.dark); sp.s.material.color.copy(gcol);
    }
    for (const sp of steams) if (sp.t >= 0) { sp.t += dt / (2.2 + sp.dark * 0.8); const u = sp.t; sp.s.position.set(sp.x + Math.sin(u * 5 + sp.x * 9) * (0.08 + sp.dark * 0.1), sp.y + u * (1.4 + sp.dark * 0.6), sp.z); sp.s.scale.setScalar(0.35 + u * (1 + sp.dark * 0.9)); sp.s.material.opacity = (0.5 + sp.dark * 0.42) * Math.sin(Math.min(1, u) * Math.PI); if (u >= 1) { sp.t = -1; sp.s.visible = false; } }
    ui(st);
  }
  function cookWord(c) { return c < 0.55 ? "生" : c < 0.9 ? "いい感じ" : c < 1.3 ? "かんぺき！" : c < 1.9 ? "こげてる！" : "真っ黒…"; }
  let readyShown = false;
  function ui(st) {
    $("batM").querySelector("i").style.width = (batter * 100).toFixed(0) + "%"; $("batT").textContent = scoops > 1 ? `${Math.round(batter * 100)}%(${scoops}杯目)` : Math.round(batter * 100) + "%";
    $("cookM").querySelector("i").style.left = (clamp(st.cd / 2.4, 0, 1) * 100).toFixed(1) + "%"; $("cookT").textContent = st.area > 0.03 ? cookWord(st.cd) : "—";
    let g;
    if (st.area < 0.03) g = "<b>お玉</b>をつかんで、フライパンの上へ持っていくと生地が流れる！";
    else if (!flipped && (st.wet > 0.18 * st.vol || pouring)) g = "<b>取っ手</b>をつかんで動かすと傾く！ 生地を流して<b>うすく丸く</b>広げよう";
    else if (!flipped && st.cd < 0.55) g = "焼けるのを待とう…<b>焼き色メーター</b>が「いい感じ」になるまで";
    else if (!flipped) g = "焼けた！ 生地を<b>指でめくって</b>ひっくり返そう";
    else if (st.cd < 0.55) g = "裏も焼こう。メーターが「いい感じ」になったら「具材をのせる」！";
    else g = "焼けた！ 下の<b>具材をのせる</b>へ（焼きすぎると真っ黒）";
    guide(g);
    const ready = flipped && st.cd >= 0.55;
    if (ready !== readyShown) { readyShown = ready; $("topBtn").classList.toggle("ready", ready); }
    $("topBtn").classList.toggle("hide", st.area < 0.03 && !pouring);
    // こげ警告
    if (st.cd > 2.0 && !ui.warn) { ui.warn = true; toast("こげてる！！ 早く！"); }
    if (st.cd < 1.9) ui.warn = false;
  }
  function drawLabels() {
    const D = lab.width / innerWidth; lg.setTransform(D, 0, 0, D, 0, 0); lg.clearRect(0, 0, innerWidth, innerHeight);
    if (stage !== "cook") return;
    const lb = (txt, w3) => { const v = w3.clone().project(cam), x = (v.x + 1) / 2 * innerWidth, y = (1 - v.y) / 2 * innerHeight; lg.font = "800 13px system-ui, sans-serif"; const w = lg.measureText(txt).width + 18; lg.fillStyle = "rgba(20,16,12,.72)"; lg.beginPath(); lg.roundRect ? lg.roundRect(x - w / 2, y - 13, w, 26, 13) : lg.rect(x - w / 2, y - 13, w, 26); lg.fill(); lg.fillStyle = "#f3e7d3"; lg.textAlign = "center"; lg.textBaseline = "middle"; lg.fillText(txt, x, y); };
    let lp = false; for (const p of ptrs.values()) if (p.kind === "ladle") lp = true;
    if (!lp && !flipped) lb("お玉", new V(BOWL.x, 0.55, BOWL.z + 0.1));
    let hp = false; for (const p of ptrs.values()) if (p.kind === "handle") hp = true;
    if (!hp && playT < 40) lb("取っ手", new V(0, 0.45, RO + 1.05).applyMatrix4(panG.matrixWorld));
    // 焼けてきたら、生地のそばに「指でひっくり返してね」
    let cp = false; for (const p of ptrs.values()) if (p.kind === "crepe") cp = true;
    const st = lastSt;
    if (!flipped && !flip && !cp && st && st.area > 0.05 && st.cd >= 0.55 && st.wet < 0.18 * st.vol) {
      const v = toPanWorld(st.cx, Math.min(0.8, st.cy + 0.35), BOTTOM + 0.05).project(cam), x = (v.x + 1) / 2 * innerWidth, y = (1 - v.y) / 2 * innerHeight + Math.sin(playT * 5) * 4;
      const txt = "👆 指でめくって ひっくり返してね"; lg.font = "900 14px system-ui, sans-serif"; const w = lg.measureText(txt).width + 22;
      lg.fillStyle = "#ffd23f"; lg.strokeStyle = "#2b2b2b"; lg.lineWidth = 2.5; lg.beginPath(); lg.roundRect ? lg.roundRect(x - w / 2, y - 15, w, 30, 15) : lg.rect(x - w / 2, y - 15, w, 30); lg.fill(); lg.stroke();
      lg.fillStyle = "#2b2b2b"; lg.textAlign = "center"; lg.textBaseline = "middle"; lg.fillText(txt, x, y + 1);
    }
  }
  let last = performance.now();
  function loop(now) {
    requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (stage === "cook") { frame(dt); place(); r.render(scene, cam); drawLabels(); }
    else if (stage === "title") { place(); r.render(scene, cam); }
    else if (stage === "top") renderTop(dt);
  }
  requestAnimationFrame(loop);

  // ---------- 具材をのせる画面(3D) ----------
  const TOPS = [
    { id: "cream", e: "☁️", n: "ホイップ", draw: true }, { id: "banana", e: "🍌", n: "バナナ" }, { id: "berry", e: "🍓", n: "いちご" }, { id: "choco", e: "🍫", n: "チョコソース", draw: true },
    { id: "ice", e: "🍨", n: "アイス" }, { id: "blue", e: "🫐", n: "ブルーベリー" }, { id: "kiwi", e: "🥝", n: "キウイ" }, { id: "cherry", e: "🍒", n: "さくらんぼ" },
    { id: "sprinkle", e: "🌈", n: "カラースプレー", draw: true }, { id: "jam", e: "🍯", n: "いちごジャム", draw: true },
    { id: "mikan", e: "🍊", n: "みかん" }, { id: "marsh", e: "☁️", n: "マシュマロ", draw: true },
  ];
  let tool = TOPS[0], items = [], cur = null, liquid = null;
  const tc = $("tc");
  $("tray").innerHTML = TOPS.map((t, i) => `<button class="ing${i ? "" : " sel"}" data-i="${i}"><b>${t.e}</b><span>${t.n}</span></button>`).join("");
  $("tray").addEventListener("click", (e) => { const b = e.target.closest(".ing"); if (!b) return; tool = TOPS[+b.dataset.i]; for (const x of $("tray").children) x.classList.toggle("sel", x === b); });

  // ---- シーン: 明るいテーブル・白いお皿 ----
  const tScene = new THREE.Scene(); tScene.background = new THREE.Color(0xd9cbb8);
  {
    const s = new THREE.Scene();
    s.add(new THREE.Mesh(new THREE.BoxGeometry(20, 12, 20), new THREE.MeshBasicMaterial({ color: 0x2e2a26, side: THREE.BackSide })));
    const panel = (w, hh, col, x, y, z, ry, rx = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, hh), new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide })); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); s.add(m); };
    panel(5, 3, 0xcfc8bc, -2, 5.9, -1, 0, Math.PI / 2); panel(3, 4, 0x9a9184, -9.9, 3, 0, Math.PI / 2); panel(3, 2, 0x7c8494, 9.9, 3, -2, -Math.PI / 2);
    const pm = new THREE.PMREMGenerator(r); tScene.environment = pm.fromScene(s, 0.03).texture; pm.dispose();
  }
  tScene.add(new THREE.HemisphereLight(0xfff8f0, 0x6a5a48, 0.3));
  const key = new THREE.DirectionalLight(0xfff3e2, 1.05); key.position.set(-2.2, 5, 2.4); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -2, right: 2, top: 2, bottom: -2, near: 1, far: 12 }); key.shadow.radius = 4; key.shadow.bias = -0.0005; tScene.add(key);
  const fill = new THREE.DirectionalLight(0xdfe8ff, 0.2); fill.position.set(3, 2, -1); tScene.add(fill);
  const woodTex = canvasTex(1024, 1024, (g, w, hh) => {
    g.fillStyle = "#c9a57a"; g.fillRect(0, 0, w, hh);
    for (let b = 0; b < 8; b++) { g.fillStyle = b % 2 ? "rgba(120,80,40,.06)" : "rgba(255,240,220,.05)"; g.fillRect(0, b * hh / 8, w, hh / 8); g.fillStyle = "rgba(70,45,20,.35)"; g.fillRect(0, b * hh / 8, w, 2); }
    for (let i = 0; i < 260; i++) { g.strokeStyle = `rgba(${Math.random() < 0.5 ? "110,70,35" : "235,205,165"},${0.05 + Math.random() * 0.12})`; g.lineWidth = 1 + Math.random() * 2.5; const y = Math.random() * hh; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + rnd(-6, 6), w * 0.7, y + rnd(-6, 6), w, y + rnd(-3, 3)); g.stroke(); }
  }, 3);
  const table = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.62 }));
  table.rotation.x = -Math.PI / 2; table.receiveShadow = true; tScene.add(table);
  const PLATE_Y = 0.035; // お皿の内側の平らな面の高さ
  const platePts = [[0, PLATE_Y], [1.08, PLATE_Y], [1.2, PLATE_Y + 0.02], [1.4, 0.1], [1.47, 0.115], [1.49, 0.108], [1.47, 0.095], [1.3, 0.05], [1.0, 0.012], [0.82, 0.012], [0.8, 0], [0, 0]];
  const plate = new THREE.Mesh(new THREE.LatheGeometry(platePts.map(([x, y]) => new THREE.Vector2(x, y)), 128),
    new THREE.MeshPhysicalMaterial({ color: lin(0xfbfaf7), roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05, side: THREE.DoubleSide }));
  plate.castShadow = true; plate.receiveShadow = true; tScene.add(plate);
  const tGroup = new THREE.Group(); tScene.add(tGroup);
  const tCam = new THREE.PerspectiveCamera(32, 1, 0.05, 60);
  function placeTop() {
    const W = innerWidth, H = innerHeight;
    if (r.__w !== W || r.__h !== H) { r.setSize(W, H, false); r.__w = W; r.__h = H; }
    tCam.aspect = W / H;
    const bot = $("tools").getBoundingClientRect().top - 8, top = 92, cy = (top + bot) / 2, el = 1.05;
    let dist = 4;
    const set = () => { tCam.position.set(0, Math.sin(el) * dist, Math.cos(el) * dist); tCam.lookAt(0, 0, 0); tCam.setViewOffset(W, H, 0, H / 2 - cy, W, H); tCam.updateProjectionMatrix(); tCam.updateMatrixWorld(true); };
    const fits = () => { for (const [x, z] of [[-1.5, 0], [1.5, 0], [0, -1.5], [0, 1.5]]) { const v = new V(x, 0.1, z).project(tCam), sx = (v.x + 1) / 2 * W, sy = (1 - v.y) / 2 * H; if (sx < 6 || sx > W - 6 || sy < top || sy > bot) return false; } return true; };
    set(); for (let i = 0; i < 30 && !fits(); i++) { dist *= 1.06; set(); }
    // 完成したら: ゆっくり回る・指でくるっと回せる・2本指で拡大
    if (orb.on) {
      const d = dist * orb.zoom, ce = Math.cos(orb.el), se = Math.sin(orb.el);
      tCam.position.set(orb.cx + Math.sin(orb.az) * ce * d, se * d, orb.cz + Math.cos(orb.az) * ce * d); tCam.lookAt(orb.cx, 0.06, orb.cz); tCam.updateProjectionMatrix(); tCam.updateMatrixWorld(true);
    }
  }
  const orb = { on: false, cx: 0, cz: 0, az: 0, el: 1.05, tEl: 1.05, zoom: 1, spin: 0, drag: null, touches: new Map(), pinch0: 0, zoom0: 1 };
  function stepOrbit(dt) {
    if (!orb.on) return;
    if (orb.spin < 1) { const u0 = orb.spin; orb.spin = Math.min(1, orb.spin + dt / 1.3); const e = (u) => 1 - Math.pow(1 - u, 3); orb.az += (e(orb.spin) - e(u0)) * Math.PI * 2; } // くるっと1回転
    else if (!orb.touches.size) orb.az += dt * 0.3; // そのあとは ゆっくり回る
    orb.el += (orb.tEl - orb.el) * Math.min(1, dt * 8);
  }

  // ---- お皿の上のクレープ(焼いた形・厚みのまま) ----
  // お皿の上のクレープは、焼く時より細かい網目(折り目がなめらかに曲がるように)
  const TN = 128, TNV = TN + 1, TD = 2 / TN, tuv = new Float32Array(TNV * TNV * 2), tidx = [];
  for (let vy = 0; vy < TNV; vy++) for (let vx = 0; vx < TNV; vx++) { const k = vy * TNV + vx; tuv[k * 2] = vx / TN; tuv[k * 2 + 1] = 1 - vy / TN; }
  for (let vy = 0; vy < TN; vy++) for (let vx = 0; vx < TN; vx++) { const a = vy * TNV + vx, b = a + 1, c = a + TNV, d = c + 1; tidx.push(a, c, b, b, c, d); }
  const tGeo = new THREE.BufferGeometry(), tPos = new Float32Array(TNV * TNV * 3);
  tGeo.setAttribute("position", new THREE.BufferAttribute(tPos, 3)); tGeo.setAttribute("uv", new THREE.BufferAttribute(tuv, 2)); tGeo.setIndex(tidx);
  const plateCv = document.createElement("canvas"); plateCv.width = plateCv.height = 512;
  const plateTex = new THREE.CanvasTexture(plateCv); plateTex.encoding = THREE.sRGBEncoding; plateTex.anisotropy = 8;
  const crepeMat = new THREE.MeshPhysicalMaterial({ map: plateTex, bumpMap: plateTex, bumpScale: 0.003, transparent: true, alphaTest: 0.02, roughness: 0.6, clearcoat: 0.15, side: THREE.DoubleSide });
  const crepeOnPlate = new THREE.Mesh(tGeo, crepeMat); crepeOnPlate.receiveShadow = true; crepeOnPlate.castShadow = true; crepeOnPlate.customDepthMaterial = shapeDepth(plateTex); tScene.add(crepeOnPlate);
  let tc0 = [0, 0], tS = 1;
  function fillTopGeo(hk) {
    for (let vy = 0; vy < TNV; vy++) for (let vx = 0; vx < TNV; vx++) {
      const k = vy * TNV + vx, ux = -1 + vx * TD, uy = -1 + vy * TD;
      const hv = Math.max(0, bsplineH(ux, uy)); let y = PLATE_Y + 0.003 + hv * hk;
      if (crumpleSev && hv > 0.03) { const w = crn[clamp(((uy + 1) / DX) | 0, 0, N - 1) * N + clamp(((ux + 1) / DX) | 0, 0, N - 1)]; y += crumpleSev * 0.1 * (1 - Math.abs(2 * w - 1)) * sstep(0.03, 0.3, hv); }
      tPos[k * 3] = (ux - tc0[0]) * tS; tPos[k * 3 + 1] = y; tPos[k * 3 + 2] = (uy - tc0[1]) * tS;
    }
    tGeo.attributes.position.needsUpdate = true; tGeo.computeVertexNormals(); tGeo.computeBoundingSphere(); tGeo.computeBoundingBox();
  }

  // ---- まだトロトロ: お皿に注がれて広がる ----
  function paintLiquid() {
    blurH(); const T = 256, g = plateCv.getContext("2d"), img = g.createImageData(T, T), d = img.data;
    for (let py = 0; py < T; py++) for (let px = 0; px < T; px++) {
      const x = (px + 0.5) / T * 2 - 1, y = (py + 0.5) / T * 2 - 1, o = (py * T + px) * 4;
      if (x * x + y * y > 1) { d[o + 3] = 0; continue; }
      const hh = bsplineH(x, y); if (hh < 0.03) { d[o + 3] = 0; continue; }
      const e = sstep(0.05, 0.4, hh); d[o] = 236 + 6 * e; d[o + 1] = 214 + 10 * e; d[o + 2] = 160 + 14 * e; d[o + 3] = 255 * sstep(0.03, 0.07, hh);
    }
    if (plateCv.width !== T) { plateCv.width = plateCv.height = T; }
    g.putImageData(img, 0, 0); plateTex.needsUpdate = true;
  }
  const liqStreamMat = new THREE.MeshPhysicalMaterial({ color: lin(0xf0d9a0), roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.05 });
  let liqStream = null;
  function stepLiquid(dt) {
    const q = liquid; q.t += dt;
    if (q.t < q.pourT) { const v = q.V * dt / q.pourT; deposit(q.lx + Math.sin(q.t * 9) * 0.02, q.ly + Math.cos(q.t * 7) * 0.02, v); }
    if (q.t < 9) { fluidStep(dt, 0, 0); fluidStep(dt, 0, 0); paintLiquid(); fillTopGeo(0.016); }
    if (q.t < q.pourT && ac && Math.random() < dt * 6) nz(500 + Math.random() * 500, 2, 0.06, 0.12); // とぽとぽ
    // 上から落ちてくる生地の筋
    if (liqStream) { tScene.remove(liqStream); liqStream.geometry.dispose(); liqStream = null; }
    if (q.t < q.pourT + 0.25) {
      const end = q.t > q.pourT ? (q.t - q.pourT) / 0.25 : 0, x = q.lx * tS, z = q.ly * tS, y1 = PLATE_Y + 0.02, y0 = 3 - (3 - y1) * end;
      const pts = []; for (let k = 0; k <= 10; k++) { const t = k / 10; pts.push(new V(x + Math.sin(q.t * 13 + t * 6) * 0.006 * t, y0 + (y1 - y0) * t, z)); }
      const curve = new THREE.CatmullRomCurve3(pts), geo = new THREE.TubeGeometry(curve, 20, 0.04 * (1 - end * 0.5), 10, false);
      const pa = geo.attributes.position; for (let i = 0; i < pa.count; i++) { const seg = Math.floor(i / 11) / 20, c = curve.getPoint(seg), k = 1 - 0.5 * seg; pa.setXYZ(i, c.x + (pa.getX(i) - c.x) * k, pa.getY(i), c.z + (pa.getZ(i) - c.z) * k); }
      geo.computeVertexNormals(); liqStream = new THREE.Mesh(geo, liqStreamMat); tScene.add(liqStream);
    }
  }

  // ---- 具材(本物っぽい3D) ----
  const M = {}; // 共有の形と材質
  function mkTex(w, hh, draw) { const t = canvasTex(w, hh, draw); return t; }
  function buildToppings() {
    if (M.ok) return; M.ok = true;
    // いちご(半分に切って、切り口が上)
    const sp = [[0, 0], [0.035, 0.02], [0.07, 0.07], [0.1, 0.14], [0.118, 0.2], [0.122, 0.24], [0.11, 0.28], [0.075, 0.305], [0.03, 0.315], [0, 0.312]].map(([x, y]) => new THREE.Vector2(x, y));
    const skin = mkTex(512, 256, (g, w, hh) => {
      const gr = g.createLinearGradient(0, 0, 0, hh); gr.addColorStop(0, "#9e0f1a"); gr.addColorStop(0.5, "#d0202b"); gr.addColorStop(1, "#c41a26"); g.fillStyle = gr; g.fillRect(0, 0, w, hh);
      for (let row = 0; row < 14; row++) for (let i = 0; i < 18; i++) { const x = (i + (row % 2) * 0.5) / 18 * w, y = (row + 0.5) / 14 * hh; g.fillStyle = "rgba(90,0,10,.45)"; g.beginPath(); g.ellipse(x, y, 7, 9, 0, 0, 7); g.fill(); g.fillStyle = "#f2d35a"; g.beginPath(); g.ellipse(x, y + 1, 2.6, 4, 0, 0, 7); g.fill(); }
    });
    M.berrySkin = new THREE.MeshPhysicalMaterial({ map: skin, bumpMap: skin, bumpScale: 0.004, roughness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.2, side: THREE.DoubleSide });
    M.berryGeo = new THREE.LatheGeometry(sp, 28, 0, Math.PI);
    const shape = new THREE.Shape(); sp.forEach((p, i) => (i ? shape.lineTo(p.x, p.y) : shape.moveTo(p.x, p.y))); for (let i = sp.length - 1; i >= 0; i--) shape.lineTo(-sp[i].x, sp[i].y);
    M.cutGeo = new THREE.ShapeGeometry(shape, 12);
    { const uv = M.cutGeo.attributes.uv, pa = M.cutGeo.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, (pa.getX(i) + 0.125) / 0.25, pa.getY(i) / 0.32); }
    const cutTex = mkTex(256, 320, (g, w, hh) => {
      g.fillStyle = "#c8202c"; g.fillRect(0, 0, w, hh);
      const gr = g.createRadialGradient(w / 2, hh * 0.45, 10, w / 2, hh * 0.45, w * 0.55); gr.addColorStop(0, "#fff1ee"); gr.addColorStop(0.45, "#f7b2b4"); gr.addColorStop(0.8, "#e04652"); gr.addColorStop(1, "rgba(200,30,40,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, hh);
      g.fillStyle = "rgba(255,250,248,.85)"; g.beginPath(); g.ellipse(w / 2, hh * 0.55, w * 0.07, hh * 0.32, 0, 0, 7); g.fill(); // 芯
      g.strokeStyle = "rgba(255,255,255,.35)"; for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; g.beginPath(); g.moveTo(w / 2, hh * 0.55); g.lineTo(w / 2 + Math.cos(a) * w * 0.4, hh * 0.55 + Math.sin(a) * hh * 0.42); g.stroke(); }
    });
    M.cutMat = new THREE.MeshPhysicalMaterial({ map: cutTex, roughness: 0.3, clearcoat: 0.7, clearcoatRoughness: 0.15 });
    // バナナの輪切り
    const banTop = mkTex(256, 256, (g, w) => {
      const gr = g.createRadialGradient(w / 2, w / 2, 4, w / 2, w / 2, w / 2); gr.addColorStop(0, "#f3e6b0"); gr.addColorStop(0.5, "#f8eec4"); gr.addColorStop(0.9, "#f1df9c"); gr.addColorStop(1, "#e8cf7e"); g.fillStyle = gr; g.fillRect(0, 0, w, w);
      g.fillStyle = "rgba(170,140,80,.35)"; for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2 + 0.3; g.beginPath(); g.ellipse(w / 2 + Math.cos(a) * 12, w / 2 + Math.sin(a) * 12, 12, 5, a, 0, 7); g.fill(); }
      g.fillStyle = "rgba(90,60,30,.55)"; for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2; g.beginPath(); g.arc(w / 2 + Math.cos(a) * 22, w / 2 + Math.sin(a) * 22, 1.8, 0, 7); g.fill(); }
      for (let i = 0; i < 300; i++) { g.fillStyle = "rgba(255,255,255,.12)"; g.fillRect(Math.random() * w, Math.random() * w, 2, 2); }
    });
    const banSide = new THREE.MeshPhysicalMaterial({ color: lin(0xf2e2a6), roughness: 0.45, clearcoat: 0.3 });
    const banFace = new THREE.MeshPhysicalMaterial({ map: banTop, roughness: 0.4, clearcoat: 0.4, clearcoatRoughness: 0.3 });
    M.banGeo = new THREE.CylinderGeometry(0.11, 0.108, 0.05, 36); M.banMats = [banSide, banFace, banFace];
    // キウイの輪切り
    const kiwiTop = mkTex(256, 256, (g, w) => {
      g.fillStyle = "#6b4a2a"; g.beginPath(); g.arc(w / 2, w / 2, w / 2, 0, 7); g.fill();
      const gr = g.createRadialGradient(w / 2, w / 2, 8, w / 2, w / 2, w / 2 - 6); gr.addColorStop(0, "#f4f1d0"); gr.addColorStop(0.22, "#e6eaa8"); gr.addColorStop(0.32, "#9cc23a"); gr.addColorStop(0.85, "#6fa524"); gr.addColorStop(1, "#5c9420"); g.fillStyle = gr; g.beginPath(); g.arc(w / 2, w / 2, w / 2 - 6, 0, 7); g.fill();
      g.strokeStyle = "rgba(220,240,170,.35)"; g.lineWidth = 2; for (let k = 0; k < 48; k++) { const a = k / 48 * Math.PI * 2; g.beginPath(); g.moveTo(w / 2 + Math.cos(a) * 34, w / 2 + Math.sin(a) * 34); g.lineTo(w / 2 + Math.cos(a) * (w / 2 - 10), w / 2 + Math.sin(a) * (w / 2 - 10)); g.stroke(); }
      g.fillStyle = "#1b1410"; for (let k = 0; k < 40; k++) { const a = k / 40 * Math.PI * 2 + rnd(-0.05, 0.05), rr = 38 + rnd(-3, 5); g.beginPath(); g.ellipse(w / 2 + Math.cos(a) * rr, w / 2 + Math.sin(a) * rr, 4.5, 2, a, 0, 7); g.fill(); }
    });
    M.kiwiGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.035, 40);
    M.kiwiMats = [new THREE.MeshStandardMaterial({ color: lin(0x6b4a2a), roughness: 0.9 }), new THREE.MeshPhysicalMaterial({ map: kiwiTop, roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.15 }), new THREE.MeshStandardMaterial({ map: kiwiTop, roughness: 0.5 })];
    // ブルーベリー(白い粉をふいた表面 + 先のくぼみ)
    M.blueGeo = new THREE.SphereGeometry(0.055, 24, 16);
    M.blueMat = new THREE.MeshPhysicalMaterial({ color: lin(0x2c3364), roughness: 0.55, clearcoat: 0.2, sheen: new THREE.Color(0x9aa4d0) });
    M.crownGeo = new THREE.TorusGeometry(0.014, 0.006, 6, 10); M.crownMat = new THREE.MeshStandardMaterial({ color: lin(0x1a1830), roughness: 0.8 });
    // さくらんぼ
    M.cherryGeo = new THREE.SphereGeometry(0.075, 28, 20); { const pa = M.cherryGeo.attributes.position; for (let i = 0; i < pa.count; i++) { const y = pa.getY(i); if (y > 0.05) pa.setY(i, y - (y - 0.05) * 0.6 * (1 - Math.hypot(pa.getX(i), pa.getZ(i)) / 0.075)); } M.cherryGeo.computeVertexNormals(); }
    M.cherryMat = new THREE.MeshPhysicalMaterial({ color: lin(0x9a0716), roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.03 });
    M.stemMat = new THREE.MeshStandardMaterial({ color: lin(0x6d7a2c), roughness: 0.7 });
    // アイス(バニラ・ディッシャーですくったデコボコ)
    M.iceGeo = new THREE.IcosahedronGeometry(0.2, 5);
    { const pa = M.iceGeo.attributes.position; for (let i = 0; i < pa.count; i++) { let x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i); const n = fbm(x * 9 + 3, z * 9 + y * 5, 77, 3) - 0.5, th = Math.atan2(z, x); let k = 1 + n * 0.12; if (y < -0.08) { k *= 1.08 + 0.05 * Math.sin(th * 9); y = -0.08 - (y + 0.08) * 0.15; } pa.setXYZ(i, x * k, y * (y > 0 ? 0.92 : 1), z * k); } M.iceGeo.computeVertexNormals(); }
    const iceTex = mkTex(256, 128, (g, w, hh) => { g.fillStyle = "#f7efd9"; g.fillRect(0, 0, w, hh); for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(40,25,15,${0.3 + Math.random() * 0.4})`; g.fillRect(Math.random() * w, Math.random() * hh, 1.3, 1.3); } });
    M.iceMat = new THREE.MeshPhysicalMaterial({ map: iceTex, roughness: 0.72, emissive: lin(0x2a2418), emissiveIntensity: 0.25 });
    // ホイップクリーム(星口金でしぼった1つぶ: ねじれた溝のある とんがり)
    { const R = 18, S = 48, pos = [], idx = [];
      for (let j = 0; j <= R; j++) { const v = j / R; for (let i = 0; i <= S; i++) { const th = i / S * Math.PI * 2, ridge = 1 + 0.14 * Math.pow(0.5 + 0.5 * Math.cos(8 * th + v * 5), 2) - 0.07; const rr = 0.115 * Math.pow(1 - v, 0.72) * (1 + 0.18 * Math.sin(Math.PI * Math.min(1, v * 1.6))) * ridge; pos.push(Math.cos(th) * rr + 0.018 * v * v * v, 0.17 * v, Math.sin(th) * rr); } }
      for (let j = 0; j < R; j++) for (let i = 0; i < S; i++) { const a = j * (S + 1) + i, b = a + 1, c = a + S + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
      M.creamGeo = new THREE.BufferGeometry(); M.creamGeo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); M.creamGeo.setIndex(idx); M.creamGeo.computeVertexNormals(); }
    M.creamMat = new THREE.MeshPhysicalMaterial({ color: lin(0xfffbf2), roughness: 0.55, emissive: lin(0x3a3226), emissiveIntensity: 0.18, sheen: new THREE.Color(0xffffff) });
    // チョコソース
    M.chocoMat = new THREE.MeshPhysicalMaterial({ color: lin(0x3a1a0b), roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.05 });
    // カラースプレー: 小さな棒(両はしが丸い)・つやのある砂糖がけ
    { const g = new THREE.CylinderGeometry(0.008, 0.008, 0.038, 8, 1), pa = g.attributes.position;
      for (let i = 0; i < pa.count; i++) { const y = pa.getY(i), r = Math.hypot(pa.getX(i), pa.getZ(i)); if (Math.abs(y) > 0.0189 && r < 0.005) pa.setY(i, y * 1.22); }
      g.computeVertexNormals(); g.rotateX(Math.PI / 2); M.sprGeo = g; }
    M.sprMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.2 });
    M.sprCols = [0xff6fa5, 0xffd93b, 0x5ec8ff, 0x7be07b, 0xffffff, 0xff9a3c, 0xb98cff, 0xff4b4b].map((c) => lin(c));
    // みかん(缶づめのひとふさ): 三日月の形・ぷっくり・透けるオレンジに つぶつぶのすじ
    { const sh = new THREE.Shape(), R = 0.13, n = 24;
      for (let i = 0; i <= n; i++) { const a = Math.PI * (0.12 + 0.76 * i / n); const x = Math.cos(a) * R, y = Math.sin(a) * R - 0.06; i ? sh.lineTo(x, y) : sh.moveTo(x, y); }
      for (let i = n; i >= 0; i--) { const a = Math.PI * (0.12 + 0.76 * i / n); sh.lineTo(Math.cos(a) * R * 0.92, Math.sin(a) * R * 0.38 - 0.045); }
      const g = new THREE.ExtrudeGeometry(sh, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.022, bevelSize: 0.02, bevelSegments: 5, curveSegments: 24 });
      g.rotateX(-Math.PI / 2); g.translate(0, 0.022, 0.0); g.computeVertexNormals();
      const uv = g.attributes.uv, pa = g.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, (pa.getX(i) + 0.15) / 0.3, (pa.getZ(i) + 0.1) / 0.2);
      M.mikanGeo = g; }
    { const t = canvasTex(256, 256, (g, w, hh) => {
        const gr = g.createRadialGradient(w / 2, hh * 1.05, 10, w / 2, hh * 1.05, w * 0.8); gr.addColorStop(0, "#ffb347"); gr.addColorStop(0.6, "#f7931e"); gr.addColorStop(1, "#ec7a12"); g.fillStyle = gr; g.fillRect(0, 0, w, hh);
        for (let k = 0; k < 140; k++) { const a = Math.PI * (0.1 + Math.random() * 0.8), r0 = rnd(20, 60), r1 = r0 + rnd(30, 80); g.strokeStyle = `rgba(255,${200 + (Math.random() * 40 | 0)},120,${rnd(0.15, 0.4)})`; g.lineWidth = rnd(2, 5); g.beginPath(); g.moveTo(w / 2 + Math.cos(a) * r0, hh * 1.05 - Math.sin(a) * r0 * 1.6); g.lineTo(w / 2 + Math.cos(a) * r1, hh * 1.05 - Math.sin(a) * r1 * 1.6); g.stroke(); }
      });
      M.mikanMat = new THREE.MeshPhysicalMaterial({ map: t, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05, transparent: true, opacity: 0.93, emissive: lin(0x5a2400), emissiveIntensity: 0.3 }); }
    // ミニマシュマロ: ふちが丸い小さな円柱・粉っぽいマット
    { const pr = [[0, 0], [0.024, 0], [0.03, 0.004], [0.032, 0.012], [0.032, 0.03], [0.03, 0.038], [0.024, 0.042], [0, 0.042]].map(([x, y]) => new THREE.Vector2(x, y));
      M.marshGeo = new THREE.LatheGeometry(pr, 20); M.marshGeo.translate(0, -0.021, 0); M.marshGeo.computeVertexNormals(); }
    M.marshMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.92, sheen: new THREE.Color(0xffffff), emissive: lin(0x2a2622), emissiveIntensity: 0.25 });
    M.marshCols = [0xffffff, 0xffffff, 0xfff6f0, 0xffd6e4, 0xfff1b8, 0xd8f5d0, 0xd9e8ff].map((c) => lin(c));
    // いちごジャム: 透きとおった深い赤・つやつや。種と果肉のつぶ
    M.jamMat = new THREE.MeshPhysicalMaterial({ color: lin(0x8e0614), roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.01, transparent: true, opacity: 0.84, emissive: lin(0x4a0008), emissiveIntensity: 0.45, envMapIntensity: 1.6 });
    M.seedGeo = new THREE.SphereGeometry(0.0045, 6, 4); M.seedGeo.scale(1, 0.6, 1.7);
    M.seedMat = new THREE.MeshStandardMaterial({ color: lin(0xd9b24a), roughness: 0.5 });
    M.chunkGeo = new THREE.IcosahedronGeometry(0.02, 1); { const pa = M.chunkGeo.attributes.position; for (let i = 0; i < pa.count; i++) { const k = 0.75 + Math.random() * 0.45; pa.setXYZ(i, pa.getX(i) * k, pa.getY(i) * k * 0.6, pa.getZ(i) * k); } M.chunkGeo.computeVertexNormals(); }
    M.chunkMat = new THREE.MeshPhysicalMaterial({ color: lin(0xc0182a), roughness: 0.15, clearcoat: 1, transparent: true, opacity: 0.92 });
  }
  // 具材ボタンの絵: 本物の3Dの具材を小さく撮った写真
  function makeThumbs() {
    if (M.thumbs) return; M.thumbs = true;
    const T = 160, rt = new THREE.WebGLRenderTarget(T, T, { encoding: THREE.sRGBEncoding }), buf = new Uint8Array(T * T * 4);
    const sc = new THREE.Scene(); sc.environment = tScene.environment;
    sc.add(new THREE.HemisphereLight(0xfff8f0, 0x8a7a68, 0.55)); const dl = new THREE.DirectionalLight(0xfff3e2, 1.2); dl.position.set(-1.2, 2.5, 1.6); sc.add(dl);
    const cam2 = new THREE.PerspectiveCamera(30, 1, 0.01, 20);
    const shot = (obj, rad, cy) => {
      sc.add(obj); const d = rad / Math.sin(THREE.MathUtils.degToRad(15)) * 1.05; cam2.position.set(0, cy + d * Math.sin(0.85), d * Math.cos(0.85)); cam2.lookAt(0, cy, 0); cam2.updateMatrixWorld(true);
      const old = r.getRenderTarget(), cc = r.getClearColor(new THREE.Color()), ca = r.getClearAlpha();
      r.setRenderTarget(rt); r.setClearColor(0x000000, 0); r.clear(); r.render(sc, cam2); r.readRenderTargetPixels(rt, 0, 0, T, T, buf); r.setRenderTarget(old); r.setClearColor(cc, ca); sc.remove(obj);
      const c = document.createElement("canvas"); c.width = c.height = T; const g = c.getContext("2d"), img = g.createImageData(T, T);
      for (let y = 0; y < T; y++) img.data.set(buf.subarray((T - 1 - y) * T * 4, (T - y) * T * 4), y * T * 4);
      g.putImageData(img, 0, 0); return c.toDataURL();
    };
    const grp = (...a) => { const g = new THREE.Group(); a.forEach((o) => g.add(o)); return g; };
    const tube = (mat, r0, pts, flat) => { const st = { obj: new THREE.Mesh(new THREE.BufferGeometry(), mat), pts: pts.map(([x, y, z]) => new V(x, y, z)), r: r0, flat, wob: mat === M.jamMat }; rebuildChoco(st); return st.obj; };
    const U = {
      berry: () => [grp(makeItem("berry")), 0.17, 0.06], banana: () => { const a = makeItem("banana"), b = makeItem("banana"); b.position.set(0.09, 0, 0.06); return [grp(a, b), 0.17, 0.03]; },
      kiwi: () => { const a = makeItem("kiwi"); a.rotation.x = -0.25; return [grp(a), 0.15, 0.03]; }, ice: () => [grp(makeItem("ice")), 0.22, 0.12],
      blue: () => { const a = makeItem("blue"), b = makeItem("blue"), c = makeItem("blue"); b.position.set(0.075, 0, 0.02); c.position.set(0.035, 0, -0.06); return [grp(a, b, c), 0.11, 0.04]; },
      cherry: () => [grp(makeItem("cherry")), 0.17, 0.13],
      mikan: () => { const a = makeItem("mikan"), b = makeItem("mikan"); b.position.set(0.04, 0.0, 0.08); b.rotation.y = 0.5; return [grp(a, b), 0.16, 0.03]; },
      marsh: () => { const g = new THREE.Group(); [[0, 0, 0, 0], [0.065, 0, 0.02, 1], [-0.06, 0, 0.03, 1], [0.01, 0, -0.06, 0], [0.03, 0.04, 0.0, 1]].forEach(([x, y, z, lie], k) => { const m = new THREE.Mesh(M.marshGeo, new THREE.MeshPhysicalMaterial({ color: M.marshCols[[0, 3, 4, 5, 0][k]], roughness: 0.92, emissive: lin(0x2a2622), emissiveIntensity: 0.25 })); m.position.set(x, y + (lie ? 0.032 : 0.021), z); if (lie) m.rotation.set(Math.PI / 2, 0, k); g.add(m); }); return [g, 0.12, 0.03]; },
      cream: () => { const ms = [[0, 0, 0], [0.11, 0, 0.03], [-0.1, 0, 0.04]].map(([x, y, z], k) => { const m = new THREE.Mesh(M.creamGeo, M.creamMat); m.position.set(x, y, z); m.rotation.y = k; return m; }); return [grp(...ms), 0.18, 0.06]; },
      choco: () => [grp(tube(M.chocoMat, 0.022, [[-0.15, 0.02, 0.05], [-0.07, 0.02, -0.05], [0, 0.02, 0.05], [0.08, 0.02, -0.05], [0.15, 0.02, 0.04]], 0.45)), 0.17, 0.02],
      jam: () => { const t = tube(M.jamMat, 0.046, [[-0.15, 0.02, 0.04], [-0.05, 0.02, -0.04], [0.05, 0.02, 0.04], [0.15, 0.02, -0.03]], 0.66), g = grp(t); for (let k = 0; k < 14; k++) { const m = new THREE.Mesh(M.seedGeo, M.seedMat); m.position.set(rnd(-0.14, 0.14), 0.045, rnd(-0.03, 0.03)); g.add(m); } return [g, 0.17, 0.03]; },
      sprinkle: () => { const g = new THREE.Group(); for (let k = 0; k < 70; k++) { const m = new THREE.Mesh(M.sprGeo, new THREE.MeshPhysicalMaterial({ color: M.sprCols[k % M.sprCols.length], roughness: 0.35, clearcoat: 0.6 })); const a = Math.random() * 6.28, rr = Math.sqrt(Math.random()) * 0.13; m.position.set(Math.cos(a) * rr, Math.random() * 0.03 * (1 - rr / 0.13), Math.sin(a) * rr); m.rotation.y = Math.random() * 6.28; g.add(m); } return [g, 0.15, 0.01]; },
    };
    TOPS.forEach((t, i) => { if (!U[t.id]) return; try { const [o, rad, cy] = U[t.id](); const url = shot(o, rad, cy); const b = $("tray").children[i].querySelector("b"); b.innerHTML = `<img src="${url}" alt="">`; } catch (e) { console.warn(e); } });
    rt.dispose();
  }
  function makeItem(id) {
    const g = new THREE.Group(), sh = (m) => { m.castShadow = true; m.receiveShadow = true; return m; }; g.userData.id = id;
    if (id === "berry") {
      const inner = new THREE.Group(), body = sh(new THREE.Mesh(M.berryGeo, M.berrySkin)), cut = sh(new THREE.Mesh(M.cutGeo, M.cutMat)); cut.rotation.y = -Math.PI / 2;
      inner.add(body, cut); inner.rotation.z = -Math.PI / 2; inner.position.set(-0.16, 0.115, 0); g.add(inner); g.userData.lift = 0;
    } else if (id === "banana") { const m = sh(new THREE.Mesh(M.banGeo, M.banMats)); m.position.y = 0.025; g.add(m); }
    else if (id === "mikan") { const m = sh(new THREE.Mesh(M.mikanGeo, M.mikanMat)); g.add(m); }
    else if (id === "kiwi") { const m = sh(new THREE.Mesh(M.kiwiGeo, M.kiwiMats)); m.position.y = 0.018; g.add(m); }
    else if (id === "blue") { const m = sh(new THREE.Mesh(M.blueGeo, M.blueMat)); m.scale.set(1, 0.86, 1); m.position.y = 0.045; const c = new THREE.Mesh(M.crownGeo, M.crownMat); c.rotation.x = Math.PI / 2; c.position.y = 0.093; g.add(m, c); g.rotation.z = rnd(-0.6, 0.6); }
    else if (id === "cherry") {
      const m = sh(new THREE.Mesh(M.cherryGeo, M.cherryMat)); m.position.y = 0.07; g.add(m);
      const curve = new THREE.CatmullRomCurve3([new V(0, 0.13, 0), new V(0.01, 0.2, 0), new V(0.05, 0.27, 0.01), new V(0.1, 0.3, 0.02)]);
      g.add(sh(new THREE.Mesh(new THREE.TubeGeometry(curve, 12, 0.006, 6, false), M.stemMat)));
    } else if (id === "ice") { const m = sh(new THREE.Mesh(M.iceGeo, M.iceMat)); m.position.y = 0.075; g.add(m); }
    return g;
  }
  // 指の点 → お皿/クレープ/具材の表面(位置と向き)
  function hitTop(x, y, skip) { ray.setFromCamera(ndc(x, y), tCam); return hitRay(skip); }
  // 真上から下へ: その場所のいちばん上の表面(ソースやクリームが具材の形にそって流れるように)
  function surfaceAt(x, z, skip) { ray.set(new V(x, 4, z), new V(0, -1, 0)); return hitRay(skip); }
  function hitRay(skip) {
    // クリーム(つぶがたくさん)は重いので、当たり判定は つぶの位置で軽く見る
    const objs = [crepeOnPlate, plate, ...tGroup.children.filter((o) => o !== skip && !o.isInstancedMesh)];
    const hs = ray.intersectObjects(objs, true); let res = null;
    for (const h0 of hs) { if (h0.object.material && h0.object.material.alphaTest && h0.uv) { /* 透けている所(穴)は下へ */ const a = alphaAt(h0.uv); if (a < 0.5) continue; } const n = h0.face ? h0.face.normal.clone().transformDirection(h0.object.matrixWorld) : new V(0, 1, 0); if (n.y < 0) n.negate(); res = { p: h0.point.clone(), n }; break; }
    if (!res) { const t = (PLATE_Y - ray.ray.origin.y) / ray.ray.direction.y; if (t > 0) res = { p: ray.ray.origin.clone().addScaledVector(ray.ray.direction, t), n: new V(0, 1, 0) }; }
    if (res) { let top = -1; for (const c of creamPts) { if (skip && c.im === skip) continue; const d = Math.hypot(c.x - res.p.x, c.z - res.p.z); if (d < c.r) { const y = c.y + c.hgt * Math.sqrt(1 - (d / c.r) ** 2); if (y > top) top = y; } } if (top > res.p.y) { res.p.y = top; res.n = new V(0, 1, 0); } }
    return res;
  }
  let creamPts = [];
  let alphaData = null;
  function alphaAt(uv) { if (!alphaData) return 1; const T = alphaData.w, x = clamp((uv.x * T) | 0, 0, T - 1), y = clamp(((1 - uv.y) * T) | 0, 0, T - 1); return alphaData.d[(y * T + x) * 4 + 3] / 255; }
  function grabAlpha() { const g = plateCv.getContext("2d"); alphaData = { w: plateCv.width, d: g.getImageData(0, 0, plateCv.width, plateCv.height).data }; }
  const upQ = (n) => new THREE.Quaternion().setFromUnitVectors(new V(0, 1, 0), n.clone().lerp(new V(0, 1, 0), 0.35).normalize());

  function goTopping() {
    const st = stats(); buildToppings(); makeThumbs();
    for (const o of [...tGroup.children]) tGroup.remove(o); items = []; cur = null; creamPts = []; resetFold();
    if (sizzleG) { sizzleG.gain.setTargetAtTime(0, ac.currentTime, 0.2); crackG.gain.setTargetAtTime(0, ac.currentTime, 0.2); }
    if (streamMesh) { scene.remove(streamMesh); streamMesh.geometry.dispose(); streamMesh = null; }
    stage = "top"; $("top").classList.add("on"); $("panel").style.display = "none"; guide(""); lg.clearRect(0, 0, lab.width, lab.height);
    if (!flipped && (st.wet > 0.3 * st.vol || pouring)) {
      // 生のまま: フライパンの生地をお皿に流す
      const V0 = st.vol + (pouring ? 0.2 : 0);
      initField(); flipped = false; crumpleSev = 0; pouring = false; tc0 = [0, 0]; tS = 1.02; plateBase = null;
      liquid = { t: 0, V: V0, pourT: 0.9 + V0 * 0.35, lx: rnd(-0.12, 0.12), ly: rnd(-0.15, 0.05) };
      crepeMat.clearcoat = 1; crepeMat.clearcoatRoughness = 0.05; crepeMat.roughness = 0.25; crepeMat.bumpScale = 0;
      alphaData = null; paintLiquid(); fillTopGeo(0.016);
      toast("トロトロのまま…お皿に流れた！ これは飲みもの？", 3000, true); cookWordTop = "トロトロ";
      return;
    }
    liquid = null;
    // 上を向いている面(最初に焼いた面)の絵 + 焼いた形のままの立体
    if (plateCv.width !== 512) plateCv.width = plateCv.height = 512;
    paintFace(plateCv, "up"); plateTex.needsUpdate = true; grabAlpha();
    plateBase = document.createElement("canvas"); plateBase.width = plateBase.height = plateCv.width; plateBase.getContext("2d").drawImage(plateCv, 0, 0); drawGuide(true);
    let sx = 0, sy = 0, n = 0; for (let i = 0; i < NN; i++) if (h[i] > 0.06) { sx += cxs[i]; sy += cys[i]; n++; }
    tc0 = n ? [sx / n, sy / n] : [0, 0]; let mr = 0.3; for (let i = 0; i < NN; i++) if (h[i] > 0.06) mr = Math.max(mr, Math.hypot(cxs[i] - tc0[0], cys[i] - tc0[1]));
    tS = Math.min(1.05, 1.12 / (mr + DX));
    crepeMat.clearcoat = 0.15; crepeMat.clearcoatRoughness = 0.4; crepeMat.roughness = 0.6; crepeMat.bumpScale = 0.003;
    fillTopGeo(0.008);
    const word = crumpleSev > 0.5 ? "ぐちゃぐちゃ…でも味は同じ！" : st.burnt > 0.3 || st.cd > 2.2 ? "真っ黒こげ…これはこれで" : st.cd > 1.6 ? "こんがり焼けた" : st.cd >= 0.85 ? "きれいなきつね色！" : !flipped || st.cd < 0.3 ? "生焼け…まだ焼けてなかった！" : "ちょっと白っぽい";
    toast(word, 2200); cookWordTop = word;
  }
  // ---- 置く・しぼる・かける ----
  function addCreamAt(stroke, hit) {
    const im = stroke.obj; if (im.count >= im.userData.max) return;
    const m = new THREE.Matrix4(), q = upQ(hit.n).multiply(new THREE.Quaternion().setFromAxisAngle(new V(0, 1, 0), Math.random() * 6.28)), s = rnd(0.85, 1.1);
    const sy = s * rnd(0.9, 1.15), at = hit.p.clone().addScaledVector(hit.n, -0.01);
    m.compose(at, q, new V(s, sy, s)); im.setMatrixAt(im.count, m); im.count++; im.instanceMatrix.needsUpdate = true;
    creamPts.push({ im, x: at.x, z: at.z, y: at.y, r: 0.1 * s, hgt: 0.14 * sy });
    im.computeBoundingSphere && im.computeBoundingSphere();
  }
  function rebuildChoco(stroke) {
    if (stroke.obj.geometry) stroke.obj.geometry.dispose();
    const pts = stroke.pts.length > 1 ? stroke.pts : [stroke.pts[0], stroke.pts[0].clone().add(new V(0.01, 0, 0))];
    const segs = Math.min(900, pts.length * 2), curve = new THREE.CatmullRomCurve3(pts, false, "centripetal"), geo = new THREE.TubeGeometry(curve, segs, stroke.r || 0.022, 8, false), fl = stroke.flat || 0.45;
    // 平らな所では少しつぶれて広がる(たれている所=縦の所は丸いまま)
    const pa = geo.attributes.position;
    for (let r0 = 0; r0 <= segs; r0++) {
      const t = r0 / segs, c = curve.getPointAt(t), tg = curve.getTangentAt(t), k = 1 - fl * (1 - tg.y * tg.y);
      // ジャムは太さがぽってり不ぞろい
      const wk = stroke.wob ? 0.8 + 0.3 * Math.sin(t * 41 + 1.3) * Math.sin(t * 17) + 0.12 * Math.sin(t * 93) : 1;
      for (let j = 0; j <= 8; j++) { const i = r0 * 9 + j; pa.setXYZ(i, c.x + (pa.getX(i) - c.x) * wk, c.y + (pa.getY(i) - c.y) * k * wk, c.z + (pa.getZ(i) - c.z) * wk); }
    }
    geo.computeVertexNormals(); stroke.obj.geometry = geo;
  }
  // カラースプレー: 指のまわりにパラパラ(表面にそって寝る・色はいろいろ)
  function addSprinkles(stroke, hit) {
    const im = stroke.obj, m = new THREE.Matrix4(), n0 = 14 + (Math.random() * 8 | 0);
    for (let k = 0; k < n0 && im.count < im.userData.max; k++) {
      const a = Math.random() * 6.28, rr = Math.sqrt(Math.random()) * 0.12, x = hit.p.x + Math.cos(a) * rr, z = hit.p.z + Math.sin(a) * rr;
      const q = surfaceAt(x, z, null) || hit, up = q.n || new V(0, 1, 0);
      const qq = new THREE.Quaternion().setFromUnitVectors(new V(0, 1, 0), up).multiply(new THREE.Quaternion().setFromAxisAngle(new V(0, 1, 0), Math.random() * 6.28)).multiply(new THREE.Quaternion().setFromAxisAngle(new V(1, 0, 0), rnd(-0.25, 0.25)));
      m.compose(q.p.clone().addScaledVector(up, 0.007), qq, new V(1, 1, rnd(0.8, 1.2)));
      im.setMatrixAt(im.count, m); im.setColorAt(im.count, M.sprCols[(Math.random() * M.sprCols.length) | 0]); im.count++;
    }
    im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
    if (ac && Math.random() < 0.6) nz(5000 + Math.random() * 3000, 3, 0.05, 0.08); // パラパラ
  }
  // ミニマシュマロ: 指のまわりに ころころ(寝たり立ったり)
  function addMarsh(stroke, hit) {
    const im = stroke.obj, m = new THREE.Matrix4(), n0 = 4 + (Math.random() * 4 | 0);
    for (let k = 0; k < n0 && im.count < im.userData.max; k++) {
      const a = Math.random() * 6.28, rr = Math.sqrt(Math.random()) * 0.1, x = hit.p.x + Math.cos(a) * rr, z = hit.p.z + Math.sin(a) * rr;
      const q = surfaceAt(x, z, null) || hit, up = q.n || new V(0, 1, 0), lie = Math.random() < 0.55;
      const qq = new THREE.Quaternion().setFromUnitVectors(new V(0, 1, 0), up).multiply(new THREE.Quaternion().setFromAxisAngle(new V(0, 1, 0), Math.random() * 6.28));
      if (lie) qq.multiply(new THREE.Quaternion().setFromAxisAngle(new V(1, 0, 0), Math.PI / 2));
      const s0 = rnd(0.85, 1.15);
      m.compose(q.p.clone().addScaledVector(up, lie ? 0.03 * s0 : 0.021 * s0), qq, new V(s0, s0 * rnd(0.85, 1.1), s0));
      im.setMatrixAt(im.count, m); im.setColorAt(im.count, M.marshCols[(Math.random() * M.marshCols.length) | 0]); im.count++;
    }
    im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
    nz(700, 2, 0.08, 0.06);
  }
  // ジャムの種と果肉のつぶ
  function addJamBits(stroke, p) {
    const m = new THREE.Matrix4();
    const ns = Math.random() < 0.7 ? 1 + (Math.random() * 2 | 0) : 0;
    for (let k = 0; k < ns && stroke.seeds.count < stroke.seeds.userData.max; k++) {
      const a = Math.random() * 6.28, at = p.clone().add(new V(Math.cos(a) * rnd(0, 0.022), rnd(0.004, 0.012), Math.sin(a) * rnd(0, 0.022)));
      m.compose(at, new THREE.Quaternion().setFromAxisAngle(new V(0, 1, 0), Math.random() * 6.28), new V(1, 1, 1)); stroke.seeds.setMatrixAt(stroke.seeds.count++, m);
    }
    if (Math.random() < 0.16 && stroke.chunks.count < stroke.chunks.userData.max) {
      const s = rnd(0.7, 1.2); m.compose(p.clone().add(new V(rnd(-0.01, 0.01), 0.004, rnd(-0.01, 0.01))), new THREE.Quaternion().setFromAxisAngle(new V(0, 1, 0), Math.random() * 6.28), new V(s, s, s)); stroke.chunks.setMatrixAt(stroke.chunks.count++, m);
    }
    stroke.seeds.instanceMatrix.needsUpdate = true; stroke.chunks.instanceMatrix.needsUpdate = true;
  }
  // 前の点 → 今の点 の間を、表面にそって細かく足す
  function drapeTo(stroke, hit, step, add) {
    const a = stroke.last, dx = hit.p.x - a.x, dz = hit.p.z - a.z, d = Math.hypot(dx, dz); if (d < step) return false;
    const n = Math.min(40, Math.ceil(d / step));
    for (let k = 1; k <= n; k++) { const x = a.x + dx * k / n, z = a.z + dz * k / n, q = surfaceAt(x, z, stroke.obj) || { p: new V(x, hit.p.y, z), n: hit.n }; add(q); }
    stroke.last = new V(hit.p.x, hit.p.y, hit.p.z); return true;
  }
  tc.addEventListener("pointerdown", (e) => {
    if (stage !== "top") return; initAudio();
    if (orb.on) { orb.touches.set(e.pointerId, [e.clientX, e.clientY]); orb.spin = 1; if (orb.touches.size === 2) { const [a, b] = [...orb.touches.values()]; orb.pinch0 = Math.hypot(a[0] - b[0], a[1] - b[1]); orb.zoom0 = orb.zoom; } try { tc.setPointerCapture(e.pointerId); } catch (er) {} return; }
    // たたむ中でも、生地の外(お皿)なら いつもどおり具材をのせたり描いたりできる
    if (foldMode && foldDown(e)) return;
    const hit = hitTop(e.clientX, e.clientY); if (!hit) return;
    if (tool.id === "cream") {
      const im = new THREE.InstancedMesh(M.creamGeo, M.creamMat, 400); im.count = 0; im.userData.max = 400; im.userData.id = "cream"; im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false;
      tGroup.add(im); cur = { kind: "cream", obj: im, last: hit.p.clone() }; addCreamAt(cur, hit); items.push(im); hist.push({ t: "item", objs: [im] });
      try { tc.setPointerCapture(e.pointerId); } catch (er) {}
      nz(2400, 0.8, 0.08, 0.2);
    } else if (tool.id === "sprinkle") {
      const im = new THREE.InstancedMesh(M.sprGeo, M.sprMat, 900); im.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(900 * 3), 3); im.count = 0; im.userData.max = 900; im.userData.id = "sprinkle"; im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false;
      tGroup.add(im); cur = { kind: "sprinkle", obj: im, last: hit.p.clone() }; addSprinkles(cur, hit); items.push(im); hist.push({ t: "item", objs: [im] });
      try { tc.setPointerCapture(e.pointerId); } catch (er) {}
    } else if (tool.id === "marsh") {
      const im = new THREE.InstancedMesh(M.marshGeo, M.marshMat, 300); im.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(300 * 3), 3); im.count = 0; im.userData.max = 300; im.userData.id = "marsh"; im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false;
      tGroup.add(im); cur = { kind: "marsh", obj: im, last: hit.p.clone() }; addMarsh(cur, hit); items.push(im); hist.push({ t: "item", objs: [im] });
      try { tc.setPointerCapture(e.pointerId); } catch (er) {}
    } else if (tool.id === "jam") {
      const mesh = new THREE.Mesh(new THREE.BufferGeometry(), M.jamMat); mesh.userData.id = "jam"; mesh.userData.sauce = true; mesh.castShadow = true; mesh.receiveShadow = true; mesh.frustumCulled = false;
      const seeds = new THREE.InstancedMesh(M.seedGeo, M.seedMat, 500); seeds.count = 0; seeds.userData.max = 500; seeds.userData.id = "seed"; seeds.frustumCulled = false;
      const chunks = new THREE.InstancedMesh(M.chunkGeo, M.chunkMat, 120); chunks.count = 0; chunks.userData.max = 120; chunks.userData.id = "seed"; chunks.castShadow = true; chunks.frustumCulled = false;
      mesh.userData.link = [seeds, chunks];
      tGroup.add(seeds, chunks, mesh); items.push(seeds, chunks, mesh); hist.push({ t: "item", objs: [seeds, chunks, mesh] });
      cur = { kind: "jam", obj: mesh, seeds, chunks, r: 0.046, flat: 0.66, wob: true, pts: [hit.p.clone().addScaledVector(hit.n, 0.016)], last: hit.p.clone() }; rebuildChoco(cur); addJamBits(cur, cur.pts[0]);
      try { tc.setPointerCapture(e.pointerId); } catch (er) {}
      nz(600, 1.5, 0.1, 0.25);
    } else if (tool.id === "choco") {
      const mesh = new THREE.Mesh(new THREE.BufferGeometry(), M.chocoMat); mesh.userData.id = "choco"; mesh.userData.sauce = true; mesh.castShadow = true; mesh.receiveShadow = true; mesh.frustumCulled = false;
      tGroup.add(mesh); cur = { kind: "choco", obj: mesh, pts: [hit.p.clone().addScaledVector(hit.n, 0.012)], last: hit.p.clone() }; rebuildChoco(cur); items.push(mesh); hist.push({ t: "item", objs: [mesh] });
      try { tc.setPointerCapture(e.pointerId); } catch (er) {}
    } else {
      placeItem(hit);
    }
  });
  tc.addEventListener("pointermove", (e) => {
    if (orb.on) {
      const prev = orb.touches.get(e.pointerId); if (!prev) return; orb.touches.set(e.pointerId, [e.clientX, e.clientY]);
      if (orb.touches.size === 1) { orb.az -= (e.clientX - prev[0]) * 0.01; orb.tEl = clamp(orb.tEl + (e.clientY - prev[1]) * 0.006, 0.2, 1.45); }
      else if (orb.touches.size === 2 && orb.pinch0) { const [a, b] = [...orb.touches.values()]; orb.zoom = clamp(orb.zoom0 * orb.pinch0 / Math.max(10, Math.hypot(a[0] - b[0], a[1] - b[1])), 0.45, 1.6); }
      return;
    }
    if (foldDrag) { foldMove(e); return; }
    if (!cur || stage !== "top") return;
    const hit = hitTop(e.clientX, e.clientY, cur.obj); if (!hit) return;
    if (cur.kind === "cream") drapeTo(cur, hit, 0.055, (q) => addCreamAt(cur, q));
    else if (cur.kind === "sprinkle") drapeTo(cur, hit, 0.07, (q) => addSprinkles(cur, q));
    else if (cur.kind === "marsh") drapeTo(cur, hit, 0.09, (q) => addMarsh(cur, q));
    else if (cur.kind === "jam") { if (cur.pts.length < 600 && drapeTo(cur, hit, 0.02, (q) => { const p = q.p.clone().addScaledVector(q.n, 0.016); cur.pts.push(p); addJamBits(cur, p); })) rebuildChoco(cur); }
    else if (cur.pts.length < 600 && drapeTo(cur, hit, 0.02, (q) => cur.pts.push(q.p.clone().addScaledVector(q.n, 0.012)))) rebuildChoco(cur);
  });
  const endTop = (e) => { orb.touches.delete(e.pointerId); cur = null; if (foldDrag) foldUp(e); };
  tc.addEventListener("pointerup", endTop); tc.addEventListener("pointercancel", endTop);
  // 1つ戻す: 最後にしたこと(具材をのせた・たたんだ)を1つ取り消す
  let hist = [];
  $("undoBtn").onclick = () => {
    if (stage !== "top" || fold || foldDrag) return;
    const h = hist.pop(); if (!h) { toast("もう戻せないよ", 1200); return; }
    if (h.t === "item") { for (const o of h.objs) { tGroup.remove(o); const k = items.indexOf(o); if (k >= 0) items.splice(k, 1); } creamPts = creamPts.filter((c) => !h.objs.includes(c.im)); }
    else {
      for (const o of h.added) { tGroup.remove(o); const k = items.indexOf(o); if (k >= 0) items.splice(k, 1); }
      spills = []; squeezes = []; restoreState(h.snap); for (const o of h.spilled) o.userData.spilled = false; creamPts = h.cream; foldDirs.pop(); nz(900, 1, 0.08, 0.3);
    }
  };
  // ---- 完成: くるっと回って、名前がつく。Xでシェア・画像保存 ----
  const TNAME = { cream: "ホイップ", berry: "いちご", banana: "バナナ", choco: "チョコ", ice: "アイス", blue: "ブルーベリー", kiwi: "キウイ", cherry: "さくらんぼ", sprinkle: "カラフル", jam: "いちごジャム", mikan: "みかん", marsh: "マシュマロ" };
  let fin = null, cookWordTop = "";
  // ---- めじるし: クリームをのせる所(黒い点線のV)と、折る所(赤い点線) ----
  // 奥に向かって開いたVの中にクリーム → 左右を赤い線で折ると、先が手前を向いた扇形(コーン)になる
  const GH = 0.34, CREAM_APEX = [0, 0.14], FOLD_APEX = [0, 0.4];
  const GUIDES = [-1, 1].map((sg) => { const n = [sg * Math.cos(GH), Math.sin(GH)]; return { n, c: n[0] * FOLD_APEX[0] + n[1] * FOLD_APEX[1] }; });
  let plateBase = null;
  function drawGuide(on) {
    if (!plateBase) return; const T = plateCv.width, g = plateCv.getContext("2d");
    g.clearRect(0, 0, T, T); g.drawImage(plateBase, 0, 0);
    if (on) {
      const px = (x, z) => [((x / tS + tc0[0]) + 1) / 2 * T, ((z / tS + tc0[1]) + 1) / 2 * T];
      g.save(); g.globalCompositeOperation = "source-atop"; g.lineCap = "round"; g.lineWidth = T * 0.011;
      const line = (a, b, col, dash) => { g.strokeStyle = col; g.setLineDash(dash); g.beginPath(); g.moveTo(...px(a[0], a[1])); g.lineTo(...px(b[0], b[1])); g.stroke(); };
      // クリームの所(うすく色をつけて、黒い点線でかこむ)
      const L = 1.2, dl = [-Math.sin(GH), -Math.cos(GH)], dr = [Math.sin(GH), -Math.cos(GH)];
      g.fillStyle = "rgba(255,255,255,.28)"; g.beginPath(); g.moveTo(...px(...CREAM_APEX)); g.lineTo(...px(CREAM_APEX[0] + dl[0] * L, CREAM_APEX[1] + dl[1] * L)); g.lineTo(...px(CREAM_APEX[0] + dr[0] * L, CREAM_APEX[1] + dr[1] * L)); g.closePath(); g.fill();
      line(CREAM_APEX, [CREAM_APEX[0] + dl[0] * L, CREAM_APEX[1] + dl[1] * L], "rgba(30,24,20,.85)", [T * 0.02, T * 0.025]);
      line(CREAM_APEX, [CREAM_APEX[0] + dr[0] * L, CREAM_APEX[1] + dr[1] * L], "rgba(30,24,20,.85)", [T * 0.02, T * 0.025]);
      // 折る所(赤い点線・手前まで長く)
      for (const d of [dl, dr]) line([FOLD_APEX[0] - d[0] * 0.6, FOLD_APEX[1] - d[1] * 0.6], [FOLD_APEX[0] + d[0] * 1.6, FOLD_APEX[1] + d[1] * 1.6], "rgba(235,40,60,.9)", [T * 0.03, T * 0.03]);
      g.setLineDash([]); g.globalCompositeOperation = "source-atop";
      g.fillStyle = "rgba(30,24,20,.85)"; g.font = `900 ${T * 0.04}px system-ui, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
      const [lx, ly] = px(CREAM_APEX[0], CREAM_APEX[1] - 0.5); g.fillText("クリーム", lx, ly);
      g.fillStyle = "rgba(220,30,50,.95)"; g.font = `900 ${T * 0.032}px system-ui, sans-serif`;
      for (const sg of [-1, 1]) { const [qx, qy] = px(FOLD_APEX[0] + sg * 0.42, FOLD_APEX[1] + 0.12); g.fillText("ここで折る", qx, qy); }
      g.restore();
    }
    plateTex.needsUpdate = true;
  }
  function crepeName() {
    const cnt = {}; for (const o of items) { const id = o.userData.id; if (!TNAME[id]) continue; cnt[id] = (cnt[id] || 0) + (o.isInstancedMesh ? Math.max(1, Math.round(o.count / 8)) : 1); }
    const ids = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a]), total = Object.values(cnt).reduce((a, b) => a + b, 0);
    const shape = foldDirs.length === 0 ? "まんまる" : foldDirs.length === 1 ? "半月" : foldDirs.length === 2 ? "扇形" : "ちっちゃくたたんだ";
    const pre = /真っ黒/.test(cookWordTop) ? "真っ黒こげ" : /ぐちゃ/.test(cookWordTop) ? "ぐちゃぐちゃ" : /生焼け/.test(cookWordTop) ? "生焼け" : "";
    const spilled = items.some((o) => o.userData.spilled);
    const top = ids.length ? ids.slice(0, 2).map((k) => TNAME[k]).join("") : "なにものせない";
    const name = `${pre}${ids.length >= 5 ? "全部のせ" : ""}${top}の${shape}クレープ${spilled ? "（あふれた）" : ""}`;
    return { name, kinds: ids.length, total, shape };
  }
  // 3Dのお皿を、そのままの角度で撮る
  function snapTop(size) {
    const W = innerWidth, H = innerHeight; placeTop(); r.render(tScene, tCam);
    const c = document.createElement("canvas"); c.width = c.height = size; const g = c.getContext("2d");
    const sw = cv3.width, sh = cv3.height, cyPx = ((92 + $("tools").getBoundingClientRect().top) / 2) / H * sh, side = Math.min(sw, sh * 0.62);
    g.drawImage(cv3, (sw - side) / 2, Math.max(0, cyPx - side / 2), side, side, 0, 0, size, size); return c;
  }
  function shareCard() {
    const c = document.createElement("canvas"); c.width = 1200; c.height = 630; const g = c.getContext("2d");
    g.fillStyle = "#f6ead8"; g.fillRect(0, 0, 1200, 630); g.drawImage(snapTop(630), 0, 0, 630, 630);
    const w = 510, cx = 660 + w / 2; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillStyle = "#ffd23f"; g.strokeStyle = "#2b2b2b"; g.lineWidth = 5; g.font = "900 36px system-ui, sans-serif";
    const t0 = "🥞 クレープできた！", rw = Math.min(w, g.measureText(t0).width + 50); g.beginPath(); g.roundRect ? g.roundRect(cx - rw / 2, 70, rw, 64, 32) : g.rect(cx - rw / 2, 70, rw, 64); g.fill(); g.stroke(); g.fillStyle = "#2b2b2b"; g.fillText(t0, cx, 103);
    g.fillStyle = "#b8321f"; let fs = 46; const lines = (f) => { g.font = `900 ${f}px system-ui, sans-serif`; const out = []; let cur = ""; for (const ch of fin.name) { if (g.measureText(cur + ch).width > w - 20) { out.push(cur); cur = ch; } else cur += ch; } if (cur) out.push(cur); return out; };
    let L = lines(fs); while (L.length > 3 && fs > 26) { fs -= 3; L = lines(fs); } L.slice(0, 4).forEach((t, i) => g.fillText(t, cx, 230 + i * fs * 1.3));
    g.fillStyle = "#2b2b2b"; g.font = "800 30px system-ui, sans-serif"; g.fillText(`焼き色：${fin.cook}`, cx, 440); g.fillText(`具材 ${fin.kinds}種類`, cx, 490);
    g.fillStyle = "#777"; g.font = "800 26px system-ui, sans-serif"; g.fillText("piko2game.com/crepe  #クレープ作り", cx, 590);
    return new Promise((res) => c.toBlob(res, "image/jpeg", 0.86));
  }
  async function ensureShareUrl() {
    if (!fin || fin.shareUrl || fin.sharing) return fin && fin.sharing;
    fin.sharing = (async () => { try { const blob = await shareCard(); const res = await fetch("/api/crepe/share", { method: "POST", body: blob, headers: { "Content-Type": "image/jpeg" } }); const d = await res.json(); if (d && d.ok) fin.shareUrl = `https://piko2game.com/crepe/s/${d.id}`; } catch (e) { console.warn(e); } })();
    return fin.sharing;
  }
  // Xアプリを直接ひらく(iPhone: twitter:// / Android: Xアプリ指定のintent)。アプリが無ければWebのXへ
  function openXApp(msg) {
    const enc = encodeURIComponent, web = "https://x.com/intent/post?text=" + enc(msg);
    if (/Android/i.test(navigator.userAgent)) { location.href = "intent://x.com/intent/post?text=" + enc(msg) + "#Intent;scheme=https;package=com.twitter.android;S.browser_fallback_url=" + enc(web) + ";end"; return; }
    let left = false; const bye = () => { left = true; };
    document.addEventListener("visibilitychange", bye, { once: true }); window.addEventListener("pagehide", bye, { once: true }); window.addEventListener("blur", bye, { once: true });
    location.href = "twitter://post?message=" + enc(msg);
    setTimeout(() => { if (!left && document.visibilityState === "visible") location.href = web; }, 1600);
  }
  $("shareBtn").onclick = async () => {
    if (!fin) return;
    const text = `クレープ作ったよ！\n「${fin.name}」\n焼き色：${fin.cook}\n#クレープ作り #ぴこぴこゲーム\n`;
    if (window.xShareMobile) { openXApp(text + (fin.shareUrl || "https://piko2game.com/crepe/")); return; } // スマホ: 共有メニューを出さず、Xアプリの投稿画面を直接ひらく
    const win = window.open("about:blank", "_blank"); let link = "https://piko2game.com/crepe/";
    try { await ensureShareUrl(); if (fin.shareUrl) link = fin.shareUrl; } catch (e) {}
    const intent = "https://x.com/intent/post?text=" + encodeURIComponent(text + link);
    if (win) win.location.href = intent; else if (window.xShare) window.xShare(text + link, ""); else location.href = intent;
  };
  $("saveBtn").onclick = () => {
    if (!fin) return;
    const S = 1080, c = document.createElement("canvas"); c.width = c.height = S; const g = c.getContext("2d");
    g.drawImage(snapTop(S), 0, 0); g.fillStyle = "rgba(255,255,255,.78)"; g.fillRect(0, S - 170, S, 170);
    g.textAlign = "center"; g.fillStyle = "#b8321f"; let fs = 52; g.font = `900 ${fs}px system-ui, sans-serif`; while (g.measureText(fin.name).width > S - 80 && fs > 24) { fs -= 2; g.font = `900 ${fs}px system-ui, sans-serif`; } g.fillText(fin.name, S / 2, S - 100);
    g.fillStyle = "#777"; g.font = "800 30px system-ui, sans-serif"; g.fillText("piko2game.com/crepe  #クレープ作り", S / 2, S - 45);
    c.toBlob(async (blob) => {
      if (!blob) return; const file = new File([blob], "crepe.png", { type: "image/png" });
      try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text: "#クレープ作り" }); return; } } catch (e) {}
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "crepe.png"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 3000);
    }, "image/png");
  };
  function endFinish() { orb.on = false; orb.cx = orb.cz = 0; orb.az = 0; orb.el = orb.tEl = 1.05; orb.zoom = 1; orb.touches.clear(); $("fin").classList.add("hide"); $("tools").style.visibility = ""; $("topGuide").style.visibility = ""; }
  $("againBtn").onclick = () => { endFinish(); fin = null; liquid = null; if (liqStream) { tScene.remove(liqStream); liqStream = null; } $("top").classList.remove("on"); $("panel").style.display = ""; reset(); };
  $("finClose").onclick = () => { endFinish(); fin = null; drawGuide(true); };
  $("doneBtn").onclick = () => {
    if (foldMode) setFoldMode(false); if (fold) return;
    drawGuide(false); const nm = crepeName(); fin = { name: nm.name, kinds: nm.kinds, cook: cookWordTop.replace(/[！…].*$/, "") || "ふつう" };
    $("finName").textContent = fin.name; $("finMsg").textContent = `焼き色：${fin.cook} ・ 具材 ${fin.kinds}種類`;
    orb.on = true; orb.spin = 0; orb.az = 0; orb.el = orb.tEl = 0.9; orb.zoom = 0.92;
    // 回る中心 = クレープ(生地のある所)のまん中
    { let x0 = 9, x1 = -9, z0 = 9, z1 = -9; for (let k = 0, nv = tPos.length / 3; k < nv; k += 3) { if (alphaV(k) < 0.5) continue; const x = tPos[k * 3], z = tPos[k * 3 + 2]; if (x < x0) x0 = x; if (x > x1) x1 = x; if (z < z0) z0 = z; if (z > z1) z1 = z; } orb.cx = x0 < x1 ? (x0 + x1) / 2 : 0; orb.cz = z0 < z1 ? (z0 + z1) / 2 : 0; }
    $("tools").style.visibility = "hidden"; $("topGuide").style.visibility = "hidden"; $("fin").classList.remove("hide");
    nz(2000, 1, 0.1, 0.3);
    if (window.xShareMobile) setTimeout(ensureShareUrl, 1500); // スマホ: 先に画像を用意(押した瞬間に共有を出すため)
  };
  // ---- たたむ: 指でスワイプした向きに、いまの形を半分に折る(何回でも・どの向きでも) ----
  // 重なる高さは「真上から撮った高さ地図」で調べる → 具材の上にふんわりかぶさり、つきぬけない
  const FY = PLATE_Y + 0.004, HM = 128, HR = 1.7, HMAX = 1.2;
  const hmRT = new THREE.WebGLRenderTarget(HM, HM);
  const hmCam = new THREE.OrthographicCamera(-HR, HR, HR, -HR, 0.1, 10); hmCam.position.set(0, 5, 0); hmCam.up.set(0, 0, -1); hmCam.lookAt(0, 0, 0); hmCam.updateMatrixWorld(true);
  const hmMat = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    vertexShader: "varying float vY; void main() { vec4 wp = vec4(position, 1.0);\n#ifdef USE_INSTANCING\nwp = instanceMatrix * wp;\n#endif\nwp = modelMatrix * wp; vY = wp.y; gl_Position = projectionMatrix * viewMatrix * wp; }",
    fragmentShader: `varying float vY; void main() { float t = clamp(vY / ${HMAX.toFixed(2)}, 0.0, 0.9999) * 255.0; gl_FragColor = vec4(floor(t) / 255.0, fract(t), 0.0, 1.0); }`,
  });
  const hmBuf = new Uint8Array(HM * HM * 4);
  function heightMap() {
    const vis = [plate.visible, table.visible, liqStream && liqStream.visible], bg = tScene.background, oldRT = r.getRenderTarget(), cc = r.getClearColor(new THREE.Color()), ca = r.getClearAlpha();
    plate.visible = table.visible = false; if (liqStream) liqStream.visible = false; tScene.background = null; tScene.overrideMaterial = hmMat;
    r.setRenderTarget(hmRT); r.setClearColor(0x000000, 0); r.clear(); r.render(tScene, hmCam); r.readRenderTargetPixels(hmRT, 0, 0, HM, HM, hmBuf);
    r.setRenderTarget(oldRT); r.setClearColor(cc, ca); tScene.overrideMaterial = null; tScene.background = bg; plate.visible = vis[0]; table.visible = vis[1]; if (liqStream) liqStream.visible = vis[2];
    const out = new Float32Array(HM * HM);
    for (let j = 0; j < HM; j++) for (let i = 0; i < HM; i++) { const o = (j * HM + i) * 4; out[j * HM + i] = hmBuf[o + 3] ? (hmBuf[o] + hmBuf[o + 1] / 255) / 255 * HMAX : FY; }
    return out;
  }
  // 地図の読み方: まわり5×5のいちばん高い所(生地の三角形のすき間から、具材の頭がつきぬけないように)
  function hAt(map, x, z) {
    const i0 = Math.floor((x + HR) / (2 * HR) * HM), j0 = Math.floor((HR - z) / (2 * HR) * HM); let m = FY;
    for (let dj = -2; dj <= 2; dj++) for (let di = -2; di <= 2; di++) { const i = i0 + di, j = j0 + dj; if (i < 0 || j < 0 || i >= HM || j >= HM) continue; m = Math.max(m, map[j * HM + i]); }
    return m;
  }
  function alphaV(k) { return alphaAt({ x: tuv[k * 2], y: tuv[k * 2 + 1] }); }
  function dilateMap(m, r) { const o = new Float32Array(HM * HM); for (let j = 0; j < HM; j++) for (let i = 0; i < HM; i++) { let v = FY; for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) { const a = i + di, b = j + dj; if (a >= 0 && b >= 0 && a < HM && b < HM && di * di + dj * dj <= r * r) v = Math.max(v, m[b * HM + a]); } o[j * HM + i] = v; } return o; }
  function blurMap(m, n) { let a = m, b = new Float32Array(HM * HM); for (let k = 0; k < n; k++) { for (const st of [1, HM]) { for (let p = 0; p < HM * HM; p++) { const i = p % HM, j = (p / HM) | 0, okL = st === 1 ? i > 0 : j > 0, okR = st === 1 ? i < HM - 1 : j < HM - 1; b[p] = (a[p] * 2 + (okL ? a[p - st] : a[p]) + (okR ? a[p + st] : a[p])) / 4; } [a, b] = [b, a]; } } return a; }
  function sampleMap(m, x, z) { let fx = (x + HR) / (2 * HR) * HM - 0.5, fz = (HR - z) / (2 * HR) * HM - 0.5; fx = clamp(fx, 0, HM - 1.001); fz = clamp(fz, 0, HM - 1.001); const i = fx | 0, j = fz | 0, u = fx - i, v = fz - j, p = j * HM + i; return (m[p] * (1 - u) + m[p + 1] * u) * (1 - v) + (m[p + HM] * (1 - u) + m[p + HM + 1] * u) * v; }
  let foldMode = false, fold = null, foldA = 0, foldGoalA = 0, foldDrag = null, origin = null, foldItems = 0, creamPts0 = [];
  function snapState() {
    return { pos: tPos.slice(), its: items.map((o) => {
      if (o.isInstancedMesh) return { o, m: o.instanceMatrix.array.slice(), n: o.count };
      if (o.userData.sauce) return { o, g: o.geometry.attributes.position.array.slice() };
      return { o, p: o.position.clone(), q: o.quaternion.clone() };
    }) };
  }
  function restoreState(st) {
    tPos.set(st.pos); tGeo.attributes.position.needsUpdate = true; tGeo.computeVertexNormals(); tGeo.computeBoundingSphere(); tGeo.computeBoundingBox();
    for (const s of st.its) {
      if (s.m) { s.o.instanceMatrix.array.set(s.m); s.o.instanceMatrix.needsUpdate = true; }
      else if (s.g) { s.o.geometry.attributes.position.array.set(s.g); s.o.geometry.attributes.position.needsUpdate = true; s.o.geometry.computeVertexNormals(); s.o.geometry.computeBoundingSphere(); }
      else { s.o.position.copy(s.p); s.o.quaternion.copy(s.q); }
    }
  }
  // 折り始め: 向き n(めくれる側)・折り目の位置 c を決めて、高さ地図を用意
  // つかんだ所: 高さ地図を用意(生地だけ / 具材だけ)。折り目は指を動かすたびに決め直す
  function beginGrab(G) {
    const st = snapState();
    tGroup.visible = false; const Hc = heightMap(); tGroup.visible = true;
    crepeOnPlate.visible = false; const Ht = heightMap(); crepeOnPlate.visible = true;
    const HcD = dilateMap(Hc, 2); if (sampleMap(HcD, G.x, G.z) < FY + 0.002) return null; // 生地の上じゃない
    const Hall = new Float32Array(HM * HM); for (let i = 0; i < Hall.length; i++) Hall[i] = Math.max(Hc[i], Ht[i]);
    const vis = []; for (let k = 0, nv = st.pos.length / 3; k < nv; k++) if (alphaV(k) > 0.5) vis.push(k);
    return { st, vis, HcD, Hc, HallS: blurMap(dilateMap(Hall, 2), 2), HallD: dilateMap(Hall, 2), HallF: dilateMap(Hall, 1), HtS: blurMap(dilateMap(Ht, 2), 2), G, nx: 1, nz: 0, c: 0, rc: 0.04, side: null, target: null };
  }
  // 折り目 = つかんだ点 G と 指の点 F のまん中を通る線(紙を折る時と同じ)。G の側がめくれる
  function setLine(f, F) {
    const dx = f.G.x - F.x, dz = f.G.z - F.z, L = Math.hypot(dx, dz) || 1e-6;
    // きれいに折れるように: 向きは「前の折り目と平行・直角」や 縦横ななめ に近ければ、ぴったりそろえる
    let ang = Math.atan2(dz, dx); const cands = []; for (let k = 0; k < 8; k++) cands.push(k * Math.PI / 4);
    for (const [ax, az] of foldDirs) { const b = Math.atan2(az, ax); for (let k = 0; k < 4; k++) cands.push(b + k * Math.PI / 2); }
    let best = null, bd = 0.28; for (const cd of cands) { let d = Math.abs(((ang - cd) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI); if (d < bd) { bd = d; best = cd; } }
    if (best !== null) ang = best;
    let nx = Math.cos(ang), nz = Math.sin(ang);
    // 折れるのは半分まで: 折り目は、いまの形のまん中より手前(つまんだ側)にしか来ない → 生地の位置はずれない
    let mn = 9, mx = -9; for (const k of f.vis) { const p = f.st.pos[k * 3] * nx + f.st.pos[k * 3 + 2] * nz; if (p < mn) mn = p; if (p > mx) mx = p; }
    let c = ((f.G.x + F.x) * nx + (f.G.z + F.z) * nz) / 2; const mid = (mn + mx) / 2;
    if (Math.abs(c - mid) < 0.16) c = mid; // まん中の近くなら、ちょうど半分に(ふちがぴったり重なる)
    c = Math.max(c, mid);
    // めじるしの赤い線の近くなら、ぴったりその線で折る(扇形がきれいにできる)
    if (!foldDirs.length || foldDirs.length === 1) {
      const raw = Math.atan2(dz, dx), cr = ((f.G.x + F.x) * Math.cos(raw) + (f.G.z + F.z) * Math.sin(raw)) / 2;
      for (const gd of GUIDES) {
        const ga = Math.atan2(gd.n[1], gd.n[0]), da = Math.abs(((raw - ga) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI);
        const cg = gd.n[0] * FOLD_APEX[0] + gd.n[1] * FOLD_APEX[1], crg = ((f.G.x + F.x) * gd.n[0] + (f.G.z + F.z) * gd.n[1]) / 2;
        if (da < 0.4 && Math.abs(crg - cg) < 0.3) { nx = gd.n[0]; nz = gd.n[1]; c = cg; let m2 = -9; for (const k of f.vis) m2 = Math.max(m2, f.st.pos[k * 3] * nx + f.st.pos[k * 3 + 2] * nz); mx = m2; break; }
      }
    }
    f.smax = mx - c;
    f.nx = nx; f.nz = nz; f.c = c; f.side = (x, z) => x * nx + z * nz - c;
    // つまんだ所がめくれる側に入っていない(=外へ引っぱった)時は、折れない
    f.valid = f.side(f.G.x, f.G.z) > 0.01;
    if (!f.valid) return;
    // 折り目の太さ: 折り目のそばにある具材の高さを包めるだけ(線にそって一定)
    let tmax = 0, smax = 0; const tx = -nz, tz = nx;
    for (let t = -1.4; t <= 1.4; t += 0.035) {
      const bx = c * nx + t * tx, bz = c * nz + t * tz;
      for (const o of [0.02, 0.06, 0.1, 0.14]) { const ax = bx - o * nx, az = bz - o * nz; if (sampleMap(f.HcD, ax, az) > FY + 0.002) tmax = Math.max(tmax, sampleMap(f.HallD, ax, az) - FY); const qx = bx + o * nx, qz = bz + o * nz; smax = Math.max(smax, sampleMap(f.HcD, qx, qz) - FY); }
    }
    // 折り目の丸みは小さめ(めくれる生地の はばの1/4以下・最大0.1)。大きいと生地が立ったままの貝がらになる
    f.tmax = tmax; f.rc = clamp((tmax + smax) / 2 + 0.012, 0.025, Math.max(0.025, Math.min(0.1, 0.25 * f.smax / Math.PI)));
    f.target = (x, y, z) => { const s = x * nx + z * nz - c, X = x - 2 * s * nx, Z = z - 2 * s * nz; return [X, y + sampleMap(f.HcD, X, Z) - sampleMap(f.HcD, x, z), Z]; };
    const exposed = (x, y, z, tol) => y >= sampleMap(f.HcD, x, z) - tol;
    // お皿の上(生地の外)にある物は動かさない: その場所に生地がなければ、折る対象にしない
    const onCrepe = (x, z) => sampleMap(f.HcD, x, z) > FY + 0.003;
    const kindOf = (x, y, z, tol) => (f.side(x, z) > 0 && onCrepe(x, z) ? (exposed(x, y, z, tol) ? 1 : 2) : 0);
    const m = new THREE.Matrix4(), pp = new V(), q = new THREE.Quaternion(), sc = new V();
    for (const s of f.st.its) {
      if (s.m) { s.k = []; for (let i = 0; i < s.n; i++) { m.fromArray(s.m, i * 16); m.decompose(pp, q, sc); s.k.push(kindOf(pp.x, pp.y, pp.z, 0.03)); } }
      else if (s.g) { s.k = []; for (let i = 0; i < s.g.length; i += 3) s.k.push(kindOf(s.g[i], s.g[i + 1], s.g[i + 2], 0.04)); }
      else s.k = s.o.userData.spilled ? 0 : kindOf(s.p.x, s.p.y, s.p.z, 0.03);
    }
  }
  // めくれる側の点(生地・中に包まれた具材)の行き先: 折り目で丸く巻いて、反対側のいちばん上に重なる
  function flapPt(f, x, y, z, a) {
    const s = f.side(x, z), dy = Math.max(0, y - FY), S = Math.max(sampleMap(f.Hc, x, z) - FY, dy); let floor = -9; // S = その場所の、めくれる生地の重なりの高さ(ふくらませない)
    // 折り目は1本の線にそって同じ太さで丸く巻く(折り目の近くの具材も包む)。その先は、重なる場所の具材の高さにそってかぶさる
    const rc = f.rc, rho = Math.max(0.002, rc - dy), th = s / rc;
    let fs, fy;
    if (th < Math.PI) { fs = rho * Math.sin(th); fy = FY + rc - rho * Math.cos(th); }
    else { const k = f.smax > Math.PI * rc * 1.5 ? f.smax / (f.smax - Math.PI * rc) : 1; fs = -(s - Math.PI * rc) * k; fy = FY + rc + rho; } // ふちが下の生地のふちとそろうように
    const lx = x + (fs - s) * f.nx, lz = z + (fs - s) * f.nz; let T = 0;
    if (th >= Math.PI) {
      // 重なる場所の高さ = そこにある物 と、こちらからすべりこむ具材 の高い方(なめらかにふくらませた地図)
      T = Math.max(sampleMap(f.HallS, lx, lz), sampleMap(f.HtS, x, z) - sampleMap(f.HcD, x, z) + sampleMap(f.HcD, lx, lz)) - FY;
      // 具材の山には、ゆるやかに登ってかぶさる(いきなり壁にならない)
      const want = FY + T + S + 0.014 - dy; fy += (want - fy) * sstep(0, 0.14, -fs); // 折り目の丸みの高さは折り目のそばだけ。その先は下の物にそって下がる(はみ出した所が浮かない)
      // つきぬけない下限(ふくらませない地図で): 下の物のてっぺん + 自分より上の重なり
      floor = FY + Math.max(0, Math.max(sampleMap(f.HallF, lx, lz), sampleMap(f.HtS, x, z) - sampleMap(f.HcD, x, z) + sampleMap(f.HcD, lx, lz)) - FY) + (S - dy) + 0.006;
    }
    const cs = Math.cos(a), sn = Math.sin(a), rs = s * cs - dy * sn, ry = FY + s * sn + dy * cs, w = Math.pow((1 - cs) / 2, 2.2);
    const ns = rs + (fs - rs) * w, ny = Math.max(ry + (fy - ry) * w, FY + T * w + dy);
    return [x + (ns - s) * f.nx, ny, z + (ns - s) * f.nz, floor];
  }
  const flapY = new Float32Array(TNV * TNV), flapF = new Float32Array(TNV * TNV), flapM = new Uint8Array(TNV * TNV);
  function applyFoldState(f, a) {
    const e = (1 - Math.cos(a)) / 2, st = f.st;
    const nv = st.pos.length / 3;
    for (let k = 0; k < nv; k++) { const x = st.pos[k * 3], y = st.pos[k * 3 + 1], z = st.pos[k * 3 + 2]; const isF = f.side(x, z) > 0, p = isF ? flapPt(f, x, y, z, a) : [x, y, z]; tPos[k * 3] = p[0]; tPos[k * 3 + 1] = p[1]; tPos[k * 3 + 2] = p[2]; flapM[k] = isF && p[3] > -9 ? 1 : 0; flapF[k] = p[3] || 0; }
    // かぶせた生地は、布のようになめらかに(浮いた平らな所や、たてのカーテンをならす)。下の物よりは下がらない
    if (a > Math.PI * 0.8) {
      const wgt = Math.min(1, (a - Math.PI * 0.8) / (Math.PI * 0.2));
      for (let k = 0; k < nv; k++) flapY[k] = tPos[k * 3 + 1];
      for (let it = 0; it < 10; it++) for (let k = 0; k < nv; k++) {
        if (!flapM[k]) continue; let sm = flapY[k] * 2, n = 2;
        for (const j of [k - 1, k + 1, k - TNV, k + TNV]) if (j >= 0 && j < nv && flapM[j]) { sm += flapY[j]; n++; }
        flapY[k] = Math.max(flapF[k], sm / n);
      }
      for (let k = 0; k < nv; k++) if (flapM[k]) tPos[k * 3 + 1] += (flapY[k] - tPos[k * 3 + 1]) * wgt;
    }
    tGeo.attributes.position.needsUpdate = true; tGeo.computeVertexNormals(); tGeo.computeBoundingSphere(); tGeo.computeBoundingBox();
    const ax = new V(-f.nz, 0, f.nx).normalize(), qa = new THREE.Quaternion(); // n × 上 の向きの軸
    const mv = (kind, x, y, z, q) => {
      if (kind === 1) { const t = f.target(x, y, z); return [x + (t[0] - x) * e, y + (t[1] - y) * e + Math.sin(e * Math.PI) * 0.05, z + (t[2] - z) * e]; }
      if (kind === 2) { if (q) { qa.setFromAxisAngle(ax, a); q.premultiply(qa); } return flapPt(f, x, y, z, a); }
      return [x, y, z];
    };
    const m = new THREE.Matrix4(), pp = new V(), q = new THREE.Quaternion(), sc = new V();
    for (const s of st.its) {
      if (s.m) { for (let i = 0; i < s.n; i++) { m.fromArray(s.m, i * 16); m.decompose(pp, q, sc); const p = mv(s.k[i], pp.x, pp.y, pp.z, q); m.compose(pp.set(p[0], p[1], p[2]), q, sc); s.o.setMatrixAt(i, m); } s.o.instanceMatrix.needsUpdate = true; }
      else if (s.g) { const g = s.o.geometry.attributes.position; for (let i = 0; i < g.count; i++) { const p = mv(s.k[i], s.g[i * 3], s.g[i * 3 + 1], s.g[i * 3 + 2]); g.setXYZ(i, p[0], p[1], p[2]); } g.needsUpdate = true; s.o.geometry.computeVertexNormals(); s.o.geometry.computeBoundingSphere(); }
      else { q.copy(s.q); const p = mv(s.k, s.p.x, s.p.y, s.p.z, q); s.o.position.set(p[0], p[1], p[2]); s.o.quaternion.copy(q); }
    }
  }
  function stepFold(dt) {
    if (!fold || foldDrag) return;
    if (foldA !== foldGoalA) {
      const d = foldGoalA - foldA, stp = Math.min(Math.abs(d), dt * Math.PI / 0.45); foldA += Math.sign(d) * stp; applyFoldState(fold, foldA);
      if (foldA === foldGoalA) { if (foldA === 0) restoreState(fold.st); else { nz(300, 1, 0.12, 0.15, "lowpass"); afterFold(fold); } fold = null; foldA = foldGoalA = 0; creamPts = foldedOnce() ? [] : creamPts; }
    }
  }
  const foldedOnce = () => true;
  function planeAt(x, y) { ray.setFromCamera(ndc(x, y), tCam); const t = (FY - ray.ray.origin.y) / ray.ray.direction.y; return t > 0 ? ray.ray.origin.clone().addScaledVector(ray.ray.direction, t) : null; }
  // 指で生地のはしをつまむ → 持ち上げたまま動かす → はなすと、そこにパタンと重なる
  function placeItem(hit) {
    const it = makeItem(tool.id); it.position.copy(hit.p); it.quaternion.copy(upQ(hit.n)); it.rotateY(Math.random() * 6.28);
    tGroup.add(it); items.push(it); hist.push({ t: "item", objs: [it] }); nz(700, 2, 0.18, 0.08); nz(200, 1, 0.15, 0.1, "lowpass");
  }
  function foldDown(e) {
    if (fold) return true; const p = planeAt(e.clientX, e.clientY); if (!p) return false;
    const f = beginGrab(p); if (!f) return false; // 生地の外 → 具材のほうへ
    f.creamBefore = creamPts.slice();
    fold = f; foldA = foldGoalA = 0; foldDrag = { id: e.pointerId, moved: false, sx: e.clientX, sy: e.clientY };
    try { tc.setPointerCapture(e.pointerId); } catch (er) {}
    return true;
  }
  function foldMove(e) {
    const d0 = foldDrag; if (!d0 || d0.id !== e.pointerId || !fold) return; const F = planeAt(e.clientX, e.clientY); if (!F) return;
    const L = Math.hypot(F.x - fold.G.x, F.z - fold.G.z);
    if (L < 0.02) { foldA = 0; restoreState(fold.st); return; }
    setLine(fold, F); d0.L = fold.valid ? L : 0;
    if (!fold.valid) { foldA = 0; restoreState(fold.st); return; }
    // 持ち上げている間は少し立てたまま(指の下に、つまんだはしが来る)
    foldA = Math.PI * 0.8 * sstep(0, 0.18, L); applyFoldState(fold, foldA);
  }
  function foldUp(e) {
    const d0 = foldDrag; if (!d0 || d0.id !== e.pointerId) return; foldDrag = null;
    if (!fold) return;
    // たたむ中に生地をタップしただけ(動かしていない)なら、その所に具材をのせる(チョコやクリームはなぞって描く時は「たたむ」を消してね)
    if (Math.hypot(e.clientX - d0.sx, e.clientY - d0.sy) < 10 && !(d0.L > 0.02)) {
      restoreState(fold.st); fold = null; foldA = foldGoalA = 0;
      if (!tool.draw) { const hit = hitTop(e.clientX, e.clientY); if (hit) placeItem(hit); } else toast("チョコやクリームを生地にかける時は「たたみ中」をおして戻してね", 2200);
      return;
    }
    nz(900, 1, 0.06, 0.2);
    foldGoalA = (d0.L || 0) > 0.1 ? Math.PI : 0; if (foldGoalA === foldA) { if (!foldA) restoreState(fold.st); fold = null; foldA = foldGoalA = 0; }
  }
  function setFoldMode(on) { foldMode = on; $("foldBtn").classList.toggle("on", on); $("foldBtn").textContent = on ? "✋ たたみ中" : "👐 たたむ"; $("topGuide").textContent = on ? "生地のはしを指でつまんで、かぶせたい所まで動かして はなす（何回でもOK）" : "クリームは点線のVの中へ。赤い点線で左右を折ると扇形に！"; if (on) $("topGuide").textContent = "生地のはしをつまんで動かすと たたむ。お皿の上には具材ものせられるよ"; }
  $("foldBtn").onclick = () => {
    if (stage !== "top") return;
    if (liquid) { toast("トロトロすぎて、たためない！", 2000, true); return; }
    setFoldMode(!foldMode);
  };
  let foldDirs = [];
  function resetFold() { spills = []; squeezes = []; hist = []; foldDirs = []; fold = null; foldA = foldGoalA = 0; foldDrag = null; setFoldMode(false); }
  // ---- 入れすぎ → 具材がこぼれる / クリームが むにゅっと はみ出す ----
  const VOL = { ice: 3, berry: 1, banana: 0.7, kiwi: 0.6, blue: 0.25, cherry: 0.5, mikan: 0.45 };
  let spills = [], squeezes = [];
  function afterFold(f) {
    const n0 = items.length, sp0 = new Set(items.filter((o) => o.userData.spilled));
    afterFold0(f);
    hist.push({ t: "fold", snap: f.st, cream: f.creamBefore || [], added: items.slice(n0), spilled: items.filter((o) => o.userData.spilled && !sp0.has(o)) }); foldDirs.push([f.nx, f.nz]);
  }
  function afterFold0(f) {
    const covered = (x, z) => { const sd = f.side(x, z); if (sd > 0) return false; const mx = x - 2 * sd * f.nx, mz = z - 2 * sd * f.nz; return sampleMap(f.HcD, mx, mz) > FY + 0.002; };
    // ふたの広さ → 入る量
    let flapN = 0; for (const k of f.vis) if (f.side(f.st.pos[k * 3], f.st.pos[k * 3 + 2]) > 0) flapN++;
    const cell = TD * tS, cap = flapN * cell * cell * 15; // かなり多い時だけあふれる(半分に折って アイス7こ分くらい)
    // 中に入った具材(ふたの下)
    const inside = [], creamIn = []; let vol = 0;
    const m = new THREE.Matrix4(), pp = new V(), q = new THREE.Quaternion(), sc = new V();
    for (const s0 of f.st.its) {
      if (s0.m) { if (s0.o.userData.id !== "cream") continue; for (let i = 0; i < s0.n; i++) { m.fromArray(s0.m, i * 16); m.decompose(pp, q, sc); const was = new V(pp.x, pp.y, pp.z); if (s0.k[i] === 1 || (s0.k[i] === 0 && covered(was.x, was.z))) { s0.o.getMatrixAt(i, m); m.decompose(pp, q, sc); creamIn.push(pp.clone()); vol += 0.05; } } }
      else if (!s0.g) { const id = s0.o.userData.id; if (s0.o.userData.spilled || !VOL[id]) continue; if (s0.k === 1 || (s0.k === 0 && covered(s0.p.x, s0.p.z))) { inside.push(s0.o); vol += VOL[id]; } }
    }
    const over = vol - cap;
    // こぼれる: 折り目から遠い(=口に近い)具材から、外へ転がり出る
    if (over > 0 && inside.length) {
      inside.sort((a, b) => f.side(a.position.x, a.position.z) - f.side(b.position.x, b.position.z));
      let out = 0;
      for (const o of inside) {
        if (out >= over) break; out += VOL[o.userData.id];
        const dir = new V(-f.nx + rnd(-0.6, 0.6), 0, -f.nz + rnd(-0.6, 0.6)).normalize();
        const to = o.position.clone(); for (let k = 0; k < 40 && sampleMap(f.HcD, to.x, to.z) > FY + 0.002; k++) to.addScaledVector(dir, 0.04);
        to.addScaledVector(dir, rnd(0.08, 0.22)); to.y = PLATE_Y; if (Math.hypot(to.x, to.z) > 1.3) to.multiplyScalar(1.3 / Math.hypot(to.x, to.z));
        o.userData.spilled = true;
        spills.push({ o, p0: o.position.clone(), q0: o.quaternion.clone(), to, t: -spills.length * 0.12, ax: new V(dir.z, 0, -dir.x), spin: rnd(1.5, 3) * Math.PI });
      }
      toast("入れすぎ！ 具材がこぼれた〜", 2200, true);
    }
    // クリームが はみ出す: ふたのふち(生地の外がわ)のうち、クリームに近い所から むにゅっ
    // クリームがはみ出すのも、ぎゅうぎゅうの時だけ(入る量の8割をこえた分だけ)
    const full = vol - cap * 0.8;
    if (creamIn.length && full > 0) {
      const nBlob = Math.min(70, Math.round(Math.min(creamIn.length, 10 + full * 8) * 0.6 + Math.max(0, over) * 5));
      const edge = []; let cx = 0, cz = 0, cn = 0;
      for (const k of f.vis) { if (f.side(f.st.pos[k * 3], f.st.pos[k * 3 + 2]) <= 0) continue; cx += tPos[k * 3]; cz += tPos[k * 3 + 2]; cn++; }
      cx /= cn || 1; cz /= cn || 1;
      for (const k of f.vis) {
        if (f.side(f.st.pos[k * 3], f.st.pos[k * 3 + 2]) <= 0) continue;
        if (alphaV(k + 1) > 0.5 && alphaV(k - 1) > 0.5 && alphaV(k + TNV) > 0.5 && alphaV(k - TNV) > 0.5) continue; // ふちだけ
        const p = new V(tPos[k * 3], tPos[k * 3 + 1], tPos[k * 3 + 2]); let near = 9; for (const c of creamIn) near = Math.min(near, Math.hypot(c.x - p.x, c.z - p.z)); if (near < 0.3) edge.push(p);
      }
      if (edge.length && nBlob > 0) {
        const im = new THREE.InstancedMesh(M.creamGeo, M.creamMat, nBlob); im.count = nBlob; im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false; im.userData.id = "squeeze";
        const list = [];
        for (let i = 0; i < nBlob; i++) {
          const e = edge[(Math.random() * edge.length) | 0], out = new V(e.x - cx, 0, e.z - cz).normalize(), at = e.clone().addScaledVector(out, rnd(0.01, 0.05)); at.y = Math.max(PLATE_Y, e.y - rnd(0.02, 0.05));
          const q2 = new THREE.Quaternion().setFromUnitVectors(new V(0, 1, 0), new V(out.x * 0.9, 1, out.z * 0.9).normalize()).multiply(new THREE.Quaternion().setFromAxisAngle(new V(0, 1, 0), Math.random() * 6.28));
          list.push({ at, q: q2, s: rnd(0.6, 1.0), d: rnd(0, 0.35) }); im.setMatrixAt(i, new THREE.Matrix4().makeScale(0.001, 0.001, 0.001));
        }
        tGroup.add(im); items.push(im); squeezes.push({ im, list, t: 0 });
        nz(380, 2, 0.22, 0.45); setTimeout(() => nz(300, 2, 0.18, 0.4), 160);
        if (!(over > 0)) toast("むにゅっ…クリームがはみ出た！", 1800);
      }
    }
  }
  function stepSpills(dt) {
    for (const sp of spills) {
      sp.t += dt / 0.7; const u = clamp(sp.t, 0, 1); if (sp.t < 0) continue;
      const e = u * u * (3 - 2 * u), p = sp.p0.clone().lerp(sp.to, e); p.y = sp.p0.y + (sp.to.y - sp.p0.y) * u * u + Math.sin(u * Math.PI) * 0.12;
      if (u >= 1 && !sp.done) { sp.done = true; nz(500, 2, 0.15, 0.08); nz(160, 1, 0.12, 0.1, "lowpass"); }
      sp.o.position.copy(p); sp.o.quaternion.copy(sp.q0).premultiply(new THREE.Quaternion().setFromAxisAngle(sp.ax, sp.spin * e));
    }
    spills = spills.filter((sp) => sp.t < 1.2);
    for (const sq of squeezes) {
      sq.t += dt; const m = new THREE.Matrix4();
      sq.list.forEach((b, i) => { const u = clamp((sq.t - b.d) / 0.45, 0, 1), k = u <= 0 ? 0.001 : 1 + 1.7 * Math.pow(u - 1, 3) + 0.7 * Math.pow(u - 1, 2); const s = b.s * Math.max(0.001, k); m.compose(b.at, b.q, new V(s * 1.15, s * 0.75, s * 1.15)); sq.im.setMatrixAt(i, m); });
      sq.im.instanceMatrix.needsUpdate = true;
    }
    squeezes = squeezes.filter((sq) => sq.t < 1.2);
  }
  function renderTop(dt) { if (liquid) stepLiquid(dt); stepFold(dt); stepSpills(dt); stepOrbit(dt); placeTop(); r.render(tScene, tCam); }

  // ---------- ボタン ----------
  $("startBtn").onclick = () => { initAudio(); $("title").classList.add("hide"); reset(); };
  $("topBtn").onclick = () => {
    const st = stats();
    if (st.area < 0.03 && !pouring) { toast("まずは生地を流して焼こう！"); return; }
    if (flip) return;
    goTopping();
  };
  initField(); initNoiseTex(); updateGeo(); paintFace(upCv, "up"); upTex.needsUpdate = true;
})();
