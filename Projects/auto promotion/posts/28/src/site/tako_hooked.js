// たこ焼き作り: 生地を流す → 具を入れる → ピックで回す(下の面だけ焼ける) → お皿 → ソース・マヨ・青のり・かつお節 → 採点
(() => {
  const $ = (id) => document.getElementById(id);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  // ---------- 3D ----------
  const cv = $("c");
  const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x2a1d16);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
  scene.add(new THREE.HemisphereLight(0xfff1dc, 0x3a2418, 0.75));
  const sun = new THREE.DirectionalLight(0xffffff, 0.85); sun.position.set(-6, 16, 9); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12 }); scene.add(sun);
  const fire = new THREE.PointLight(0xff7a2a, 0, 14, 2); fire.position.set(0, -1.6, 0); scene.add(fire); // 下の火(焼いている間ほんのり)

  // 屋台の台(木)
  const table = new THREE.Mesh(new THREE.BoxGeometry(140, 1, 100), new THREE.MeshStandardMaterial({ color: 0x8a5a36, roughness: 0.85 }));
  table.position.y = -2.4; table.receiveShadow = true; scene.add(table);

  // たこ焼き器: 3×4 の穴。平面の頂点を穴の所だけ半球にへこませる
  const HR = 1, COLS = 4, ROWS = 2, GAP = 2.55; // 4×2 = 8個
  const holes = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) holes.push({ i: holes.length, x: (c - (COLS - 1) / 2) * GAP, z: (r - (ROWS - 1) / 2) * GAP });
  const PW = COLS * GAP + 1.4, PD = ROWS * GAP + 1.4;
  const pan = new THREE.Group(); scene.add(pan); let panTopGeo = null;
  {
    const g = new THREE.PlaneGeometry(PW, PD, 220, 160); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i); let y = 0;
      for (const h of holes) { const d = Math.hypot(x - h.x, z - h.z); if (d < HR) { y = -Math.sqrt(HR * HR - d * d); break; } if (d < HR + 0.12) y = Math.min(y, -0.03 * (1 - (d - HR) / 0.12)); }
      p.setY(i, y);
    }
    g.computeVertexNormals();
    const iron = new THREE.MeshStandardMaterial({ color: 0x2b2b2e, roughness: 0.55, metalness: 0.55 });
    const top = new THREE.Mesh(g, iron); top.receiveShadow = true; pan.add(top); panTopGeo = g;
    const body = new THREE.Mesh(new THREE.BoxGeometry(PW, 1.1, PD), iron); body.position.y = -1.62; /* 上の面は穴の底より下に(前は穴の底をかくしていた) */ pan.add(body);
    const rim = new THREE.MeshStandardMaterial({ color: 0x1d1d20, roughness: 0.5, metalness: 0.6 });
    for (const [w, d, x, z] of [[PW + 0.5, 0.25, 0, PD / 2], [PW + 0.5, 0.25, 0, -PD / 2], [0.25, PD, PW / 2, 0], [0.25, PD, -PW / 2, 0]]) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, 2.3, d), rim); m.position.set(x, -0.9, z); pan.add(m); /* ふちの壁は下まで(横から中が見えないように) */ }
    const handle = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.35, 0.7), new THREE.MeshStandardMaterial({ color: 0x5a3820, roughness: 0.8 })); handle.position.set(PW / 2 + 1.6, -0.3, 0); pan.add(handle);
  }
  // 舟皿(お皿): 経木(うすい木)の舟。細長く、底は平らで細め・両はしは細くなって持ち上がる・ふちはまんなかが低く両はしが高い・白っぽい木にまっすぐな木目
  const plate = new THREE.Group(); plate.visible = false; scene.add(plate);
  let toothpicks = null;
  {
    // 舟の3Dモデル(boat.bin = 頂点数,index数 / 位置xyz / uv / index)。底の内側がy=-0.95になるように置く
    const S = 17, wood = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8, side: THREE.DoubleSide });
    new THREE.TextureLoader().load("boat.jpg?v=1", (t) => { t.encoding = THREE.sRGBEncoding; t.flipY = true; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); wood.map = t; wood.needsUpdate = true; });
    fetch("boat.bin?v=1").then((r) => r.arrayBuffer()).then((buf) => {
      const h = new Uint32Array(buf, 0, 2), vc = h[0], ic = h[1];
      const pos = new Float32Array(buf, 8, vc * 3), uv = new Float32Array(buf, 8 + vc * 12, vc * 2), io = 8 + vc * 20;
      const idx = vc < 65536 ? new Uint16Array(buf, io, ic) : new Uint32Array(buf, io, ic);
      const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); geo.setIndex(new THREE.BufferAttribute(idx, 1)); geo.computeVertexNormals();
      const boat = new THREE.Mesh(geo, wood); boat.scale.setScalar(S); boat.position.y = -0.95 - 0.012 * S; boat.receiveShadow = true; boat.castShadow = true; plate.add(boat);
    }).catch(() => {});
    // つまようじ2本
    toothpicks = new THREE.Group(); const tp = new THREE.MeshStandardMaterial({ color: 0xe0c48e, roughness: 0.7 });
    for (const s2 of [-1, 1]) { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.012, 2.2, 8), tp); m.position.set(s2 * 0.18, 0.95, 0); m.rotation.set(0.25, 0, s2 * 0.18); toothpicks.add(m); }
    toothpicks.visible = false; plate.add(toothpicks);
  }

  // ---------- 材料・具 ----------
  const COL = { batter: new THREE.Color(0xf1d48a), gold: new THREE.Color(0xc06a1c), brown: new THREE.Color(0x7a3a10), burnt: new THREE.Color(0x221208) };
  function doneColor(d, out) {
    if (d < 0.25) return out.copy(COL.batter);
    if (d < 1.0) return out.copy(COL.batter).lerp(COL.gold, (d - 0.25) / 0.75);
    if (d < 1.4) return out.copy(COL.gold).lerp(COL.brown, (d - 1.0) / 0.4);
    return out.copy(COL.brown).lerp(COL.burnt, clamp((d - 1.4) / 0.4, 0, 1));
  }
  const TOOLS_COOK = [
    { id: "tako", e: "🐙", name: "たこ" },
    { id: "tenkasu", e: "🟡", name: "天かす" },
    { id: "negi", e: "🌿", name: "ねぎ" },
    { id: "beni", e: "🔴", name: "紅しょうが" },
    { id: "cheese", e: "🧀", name: "チーズ" },
    { id: "choco", e: "🍫", name: "チョコ", joke: true },
    { id: "banana", e: "🍌", name: "バナナ", joke: true },
    { id: "ichigo", e: "🍓", name: "いちご", joke: true },
    { id: "budou", e: "🍇", name: "ぶどう", joke: true },
    { id: "mikan", e: "🍊", name: "みかん", joke: true },
  ];
  const TOOLS_TOP = [
    { id: "sauce", e: "🟤", name: "ソース" },
    { id: "mayo", e: "⚪", name: "マヨ" },
    { id: "nori", e: "🟢", name: "青のり" },
    { id: "katsuo", e: "🐟", name: "かつお節" },
    { id: "ketchup", e: "🍅", name: "ケチャップ" },
  ];
  const BIT = { // 小さい具(穴の生地の上に浮かぶ)
    tenkasu: { col: 0xf1d38a, n: 7, s: [0.09, 0.13] },
    negi: { col: 0x58b043, n: 7, s: [0.06, 0.1] },
    beni: { col: 0xe2304e, n: 9, s: [0.16, 0.24], strip: true }, // 細切り
    banana: { col: 0xfff0b8, n: 3, s: [0.2, 0.26], slice: true }, // 輪切り
    cheese: { col: 0xffd84a, n: 3, s: [0.14, 0.2] },
    choco: { col: 0x4a2412, n: 3, s: [0.14, 0.2] },
    ichigo: { col: 0xd8203a, n: 1, s: [0.3, 0.3], big: 0.12 }, // 1回で1個(大きいので)。big = 大きさ(半径)
    budou: { col: 0x4a1d5c, n: 1, s: [0.26, 0.26], big: 0.12 },
    mikan: { col: 0xffa21f, n: 1, s: [0.3, 0.3], big: 0.001 }, // むいたみかんの小さいひと房
  };
  const bitGeo = new THREE.BoxGeometry(1, 0.5, 1), stripGeo = new THREE.BoxGeometry(1, 0.11, 0.11), sliceGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.22, 18), bitMats = {};
  for (const k in BIT) bitMats[k] = new THREE.MeshStandardMaterial({ color: BIT[k].col, roughness: 0.7 });
  const takoMat = new THREE.MeshStandardMaterial({ color: 0xb8323e, roughness: 0.45 }), takoMat2 = new THREE.MeshStandardMaterial({ color: 0xf2d2c8, roughness: 0.5 });
  // ---- 本物っぽい3Dの具(形をでこぼこにして、色むらをつける) ----
  function lumpy(geo, amt, seed) { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), n = 1 + amt * (Math.sin(x * 23 + seed) * Math.cos(y * 19 - seed) + Math.sin(z * 17 + seed * 2) * 0.6); p.setXYZ(i, x * n, y * n, z * n); } geo.computeVertexNormals(); return geo; }
  function vcol(geo, f) { const p = geo.attributes.position, c = new Float32Array(p.count * 3), t = new THREE.Color(); for (let i = 0; i < p.count; i++) { f(p.getX(i), p.getY(i), p.getZ(i), t, i); c[i * 3] = t.r; c[i * 3 + 1] = t.g; c[i * 3 + 2] = t.b; } geo.setAttribute("color", new THREE.Float32BufferAttribute(c, 3)); return geo; }
  const VC = (rough, extra) => new THREE.MeshStandardMaterial(Object.assign({ vertexColors: true, roughness: rough }, extra || {}));
  const skinA = new THREE.Color(0x6e1428), skinB = new THREE.Color(0xb3354f), flesh = new THREE.Color(0xf2dfd2);
  const suckMat = new THREE.MeshStandardMaterial({ color: 0xf1c9c4, roughness: 0.4 });
  function takoMesh() { // ぶつ切りのたこ: 外は赤紫の皮・中は白い身・皮の側に吸盤
    const g = new THREE.Group(), sd = Math.random() * 10;
    const geo = vcol(lumpy(new THREE.IcosahedronGeometry(0.2, 2), 0.12, sd), (x, y, z, t) => { const k = clamp((y + 0.03) / 0.14, 0, 1); t.copy(flesh).lerp(skinA, k).lerp(skinB, k * (0.4 + 0.3 * Math.sin(x * 30 + z * 20))); });
    const m = new THREE.Mesh(geo, VC(0.38)); m.scale.set(1.25, 0.85, 1); m.castShadow = true; g.add(m);
    for (let i = 0; i < 4; i++) { const su = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), suckMat); const a = -0.6 + i * 0.4; su.position.set(Math.sin(a) * 0.17, 0.11 + Math.cos(a) * 0.03, -0.06 + (i % 2) * 0.05); su.rotation.x = -0.3; g.add(su); }
    g.rotation.set(rnd(-0.4, 0.4), rnd(0, 6), rnd(-0.4, 0.4)); return g;
  }
  let bananaTex = null;
  function makeBit(kind) { // 1つぶ(上=+Y)
    const sd = Math.random() * 10;
    if (kind === "tenkasu") return new THREE.Mesh(vcol(lumpy(new THREE.IcosahedronGeometry(0.075, 1), 0.3, sd), (x, y, z, t) => t.setHex(0xefc882).lerp(new THREE.Color(0xc98c3e), 0.5 + 0.5 * Math.sin(x * 60 + y * 40))), VC(0.85));
    if (kind === "negi") { // 輪切りのねぎ: 外が緑・内側がうす緑
      const g = new THREE.Group(), mo = new THREE.MeshStandardMaterial({ color: 0x3e8a2c, roughness: 0.5, side: THREE.DoubleSide }), mi = new THREE.MeshStandardMaterial({ color: 0xd3e9a6, roughness: 0.6, side: THREE.DoubleSide });
      g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.035, 18, 1, true), mo)); g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.035, 18, 1, true), mi));
      for (const y of [0.0176, -0.0176]) { const r = new THREE.Mesh(new THREE.RingGeometry(0.052, 0.07, 18), new THREE.MeshStandardMaterial({ color: 0x86c45c, roughness: 0.5, side: THREE.DoubleSide })); r.rotation.x = -Math.PI / 2; r.position.y = y; g.add(r); }
      g.scale.setScalar(rnd(0.85, 1.15)); return g;
    }
    if (kind === "beni") { // 紅しょうがの千切り: 細く曲がった赤
      const pts = []; for (let i = 0; i < 5; i++) pts.push(new THREE.Vector3(i * 0.07 - 0.14, Math.sin(i + sd) * 0.012, Math.sin(i * 1.7 + sd) * 0.03));
      return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.013, 5), new THREE.MeshStandardMaterial({ color: 0xd31c44, roughness: 0.3, emissive: 0x3a0010 }));
    }
    if (kind === "cheese") { // 角の丸いチーズ
      const geo = new THREE.BoxGeometry(0.15, 0.13, 0.15, 4, 4, 4), p = geo.attributes.position, v = new THREE.Vector3();
      for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const n = v.clone().normalize().multiplyScalar(0.1); v.lerp(n, 0.35); p.setXYZ(i, v.x, v.y, v.z); } geo.computeVertexNormals();
      return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xffc93a, roughness: 0.42 }));
    }
    if (kind === "choco") return new THREE.Mesh(lumpy(new THREE.BoxGeometry(0.18, 0.07, 0.13, 3, 2, 3), 0.06, sd), new THREE.MeshStandardMaterial({ color: 0x3a1c0e, roughness: 0.28, metalness: 0.05 }));
    if (kind === "banana") { // バナナの輪切り(切り口に種の模様)
      if (!bananaTex) { const c = document.createElement("canvas"); c.width = c.height = 64; const x = c.getContext("2d"); const gr = x.createRadialGradient(32, 32, 4, 32, 32, 32); gr.addColorStop(0, "#f6e2a0"); gr.addColorStop(1, "#fbf1c8"); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); x.fillStyle = "#6b4a22"; for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; x.beginPath(); x.arc(32 + Math.cos(a) * 7, 32 + Math.sin(a) * 7, 1.6, 0, 7); x.fill(); } bananaTex = new THREE.CanvasTexture(c); }
      const face = new THREE.MeshStandardMaterial({ map: bananaTex, roughness: 0.55 }), side = new THREE.MeshStandardMaterial({ color: 0xf3e3a0, roughness: 0.6 });
      return new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.055, 26), [side, face, face]);
    }
    if (kind === "ichigo") { // いちご: 先がとがった赤い実・表面に黄色いつぶつぶ・緑のへた(横にねかせる形: 長い方向=X)
      const g = new THREE.Group(), pts = []; for (let i = 0; i <= 14; i++) { const t = i / 14, r = Math.sin(Math.PI * Math.pow(t, 0.8)) * 0.13 * (1 - 0.35 * t * t); pts.push(new THREE.Vector2(Math.max(0.001, r), -0.17 + t * 0.32)); }
      const geo = new THREE.LatheGeometry(pts, 22); geo.rotateZ(Math.PI / 2); // 先(とがった方)が -X、へたが +X
      const berry = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xd61c35, roughness: 0.32 })); g.add(berry);
      const seedM = new THREE.MeshStandardMaterial({ color: 0xf0d36a, roughness: 0.5 }), seedG = new THREE.SphereGeometry(0.009, 5, 4), p2 = geo.attributes.position, n2 = geo.attributes.normal;
      for (let i = 0; i < 70; i++) { const t = rnd(0.12, 0.93), ph = rnd(0, 6.28), r = Math.sin(Math.PI * Math.pow(t, 0.8)) * 0.13 * (1 - 0.35 * t * t) + 0.003, y = -0.17 + t * 0.32; const sd2 = new THREE.Mesh(seedG, seedM); sd2.position.set(-y, r * Math.cos(ph), r * Math.sin(ph)); g.add(sd2); } // 表面ぜんたいに、つぶつぶ
      const leafM = new THREE.MeshStandardMaterial({ color: 0x3f8a2a, roughness: 0.6, side: THREE.DoubleSide });
      for (let i = 0; i < 6; i++) { const lf = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.11, 4), leafM); const a = i / 6 * 6.28; lf.position.set(0.15, Math.cos(a) * 0.05, Math.sin(a) * 0.05); lf.rotation.set(a, 0, -Math.PI / 2 - 0.9); g.add(lf); }
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.01, 0.05, 6), leafM); stem.rotation.z = Math.PI / 2; stem.position.x = 0.18; g.add(stem);
      return g;
    }
    if (kind === "budou") { // ぶどう: つやのある紫の実・うっすら白い粉・へたのあと
      const g = new THREE.Group(), geo = new THREE.SphereGeometry(0.12, 24, 18); geo.scale(1, 1.08, 1);
      g.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x4b1c5e, roughness: 0.38, metalness: 0.02 })));
      const bloom = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xc8b8d8, roughness: 1, transparent: true, opacity: 0.18, depthWrite: false })); bloom.scale.setScalar(1.01); g.add(bloom);
      const nub = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.018, 0.03, 6), new THREE.MeshStandardMaterial({ color: 0x6b5a2a, roughness: 0.8 })); nub.position.y = 0.13; g.add(nub);
      return g;
    }
    if (kind === "mikan") { // むいたみかんの、小さいひと房(おうぎ形)。平らな面が下・ふくらんだ背中が上(+Y)
      const phiL = 0.85, R = 0.17, geo = new THREE.SphereGeometry(R, 20, 14, 0, phiL); geo.scale(1, 0.9, 1);
      const pulp = new THREE.MeshStandardMaterial({ color: 0xff8a12, roughness: 0.32, emissive: 0x3a1500 }), memb = new THREE.MeshStandardMaterial({ color: 0xffa83a, roughness: 0.55, side: THREE.DoubleSide, emissive: 0x2a1000 });
      const g = new THREE.Group(); g.add(new THREE.Mesh(geo, pulp));
      for (const ph of [0, phiL]) { const f = new THREE.Mesh(new THREE.CircleGeometry(R, 18, Math.PI / 2, Math.PI), memb); f.scale.set(1, 0.9, 1); f.rotation.y = ph; g.add(f); } // 両わきのうす皮
      g.rotation.x = -Math.PI / 2; g.position.x = R * 0.5; // 平らな面(z=0)を下にねかせる
      const o = new THREE.Group(); o.add(g); return o;
    }
    return new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.1), new THREE.MeshStandardMaterial({ color: 0xcccccc }));
  }
  // 具の大きさ(全体): 見やすいように少し大きめ
  const GU = { small: 2.0, fruit: 2.6, tako: 1.8 };
  { const mb = makeBit, tm = takoMesh;
    makeBit = (k) => { const m = mb(k); m.scale.multiplyScalar(BIT[k] && BIT[k].big ? GU.fruit : GU.small); return m; };
    takoMesh = () => { const m = tm(); m.scale.multiplyScalar(GU.tako); return m; }; }
  const FLAT = { negi: 1, banana: 1, cheese: 1, choco: 1, ichigo: 1, budou: 1, mikan: 1 }; // 平らに置く具(上が+Y のまま、向きだけ回す)

  // ---------- 1つの穴(=1個のたこ焼き) ----------
  const liquidMat = new THREE.MeshStandardMaterial({ color: 0xf3dd9e, roughness: 0.12, metalness: 0.05, transparent: true, opacity: 0.9 }); // つやつやの液体
  const SEG = [32, 22];
  const crust = (() => { // 焼けた表面のざらざら(凹凸用の細かい点)
    const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d"); g.fillStyle = "#808080"; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 2600; i++) { const v = 90 + Math.random() * 120 | 0; g.fillStyle = `rgb(${v},${v},${v})`; const r = Math.random() * 2.2 + 0.4; g.beginPath(); g.arc(Math.random() * 256, Math.random() * 256, r, 0, 7); g.fill(); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 2); return t;
  })();
  const bubbleGeo = new THREE.TorusGeometry(0.07, 0.018, 6, 14), bubbleMat = new THREE.MeshStandardMaterial({ color: 0xd9bb6a, roughness: 0.4 });
  function makeBall(h) {
    const disk = new THREE.Mesh(new THREE.CircleGeometry(1, 36), liquidMat.clone()); disk.rotation.x = -Math.PI / 2; disk.visible = false; pan.add(disk);
    const puddle = new THREE.Mesh(new THREE.CircleGeometry(1, 30), liquidMat.clone()); puddle.rotation.x = -Math.PI / 2; puddle.position.set(h.x, 0.025, h.z); puddle.visible = false; pan.add(puddle);
    const geo = new THREE.SphereGeometry(HR * 0.97, SEG[0], SEG[1]);
    geo.setAttribute("color", new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count * 3), 3));
    const ball = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5, bumpMap: crust, bumpScale: 0.035 }));
    ball.castShadow = true; ball.visible = false;
    const holder = new THREE.Group(); holder.position.set(h.x, 0, h.z); holder.add(ball); pan.add(holder);
    const extras = new THREE.Group(); disk.add(extras); // 生地の上の具(焼く前に見えるもの)
    const edge = new THREE.Mesh(new THREE.RingGeometry(0.72, 1.0, 40, 1), new THREE.MeshStandardMaterial({ color: 0xf3dd9e, roughness: 0.25, transparent: true, opacity: 0.85 })); edge.position.z = 0.003; disk.add(edge); // ふちから焼けてくる
    // お皿でのトッピング
    const sauce = new THREE.Mesh(new THREE.SphereGeometry(HR * 0.995, 24, 12, 0, Math.PI * 2, 0, 0.01), new THREE.MeshStandardMaterial({ color: 0x4a2310, roughness: 0.25, metalness: 0.05 }));
    sauce.visible = false; holder.add(sauce);
    const tops = new THREE.Group(); holder.add(tops);
    return { h, disk, puddle, ball, holder, extras, sauce, tops, edge, bubbles: [], tints: [], started: false, rot: 0, rotAcc: 0, dn: null, rotLeft: 0, fill: 0, sec: [0, 0, 0, 0], turns: 0, rotT: 0, rotFrom: 0, rotTo: 0, broke: 0, items: {}, round: 1, lumps: null, sauceAmt: 0, mayo: 0, nori: 0, katsuo: 0, flakes: [], made: false };
  }
  let balls = [];
  // 油: はけでなぞった所だけに付く(鉄板の表面・穴の中のカーブにぴったり沿う膜)。穴の上をなぞると、底にたまる
  const OCW = 512, OCH = Math.round(512 * PD / PW), OC = document.createElement("canvas"); OC.width = OCW; OC.height = OCH; const octx = OC.getContext("2d");
  const oilTex = new THREE.CanvasTexture(OC);
  const oilMat = new THREE.MeshStandardMaterial({ color: 0x9c7a34, roughness: 0.02, metalness: 0.55, transparent: true, opacity: 0.38, alphaMap: oilTex, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  const oilFilm = new THREE.Mesh(panTopGeo.clone(), oilMat); oilFilm.position.y = 0.004; pan.add(oilFilm);
  const toOC = (x, z) => [(x / PW + 0.5) * OCW, (z / PD + 0.5) * OCH], ocK = OCW / PW;
  let lastOil = null, oilDirty = false;
  function oilStroke(a, b) { // はけの筋: 何本かの細い線(毛の跡)
    const [u0, v0] = toOC(a.x, a.z), [u1, v1] = toOC(b.x, b.z), len = Math.hypot(u1 - u0, v1 - v0) || 1, nx = -(v1 - v0) / len, ny = (u1 - u0) / len, w = 1.0 * ocK;
    octx.lineCap = "round";
    for (let i = 0; i < 11; i++) { const off = (i / 10 - 0.5) * w; octx.strokeStyle = `rgba(255,255,255,${rnd(0.08, 0.22)})`; octx.lineWidth = rnd(0.04, 0.1) * ocK; octx.beginPath(); octx.moveTo(u0 + nx * off, v0 + ny * off); octx.lineTo(u1 + nx * off, v1 + ny * off); octx.stroke(); }
    oilDirty = true;
  }
  function oilPool(x, z, r, a) { const [u, v] = toOC(x, z), R = r * ocK, g = octx.createRadialGradient(u, v, 0, u, v, R); g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(1, "rgba(255,255,255,0)"); octx.fillStyle = g; octx.beginPath(); octx.arc(u, v, R, 0, 7); octx.fill(); oilDirty = true; }
  function oilClear() { octx.clearRect(0, 0, OCW, OCH); oilDirty = true; lastOil = null; }
  const brush = new THREE.Group(); brush.visible = false; scene.add(brush);
  {
    const wood = new THREE.MeshStandardMaterial({ color: 0xc9a06a, roughness: 0.6 }), hair = new THREE.MeshStandardMaterial({ color: 0xe9d9b0, roughness: 0.8 }), band = new THREE.MeshStandardMaterial({ color: 0x9a9a9a, metalness: 0.7, roughness: 0.35 });
    const h = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.6, 10), wood); h.position.y = 1.1; brush.add(h);
    const bd = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.18, 14), band); bd.position.y = 0.32; brush.add(bd);
    const hr = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.12, 0.34, 14), hair); hr.position.y = 0.08; brush.add(hr);
    brush.rotation.z = -0.35; brush.scale.setScalar(1.5);
  }
  function oilAt(p) { // はけで塗る: なぞった所に油・穴の上なら底にたまる
    if (!p) return;
    if (lastOil && Math.hypot(lastOil.x - p.x, lastOil.z - p.z) < 3) oilStroke(lastOil, p); else oilStroke(p, p.clone().add(new THREE.Vector3(0.05, 0, 0)));
    lastOil = p.clone();
    for (const b of balls) { const d = Math.hypot(p.x - b.h.x, p.z - b.h.z); if (d < HR * 1.2) { b.oil = Math.min(1, (b.oil || 0) + 0.15); oilPool(b.h.x + rnd(-0.05, 0.05), b.h.z + rnd(-0.05, 0.05), HR * (0.25 + 0.2 * b.oil), 0.25); } } // 穴の中: 油が底へ流れてたまる
    if (oilDirty) { oilTex.needsUpdate = true; oilDirty = false; }
  }
  // あふれた生地: 鉄板の上に広がる(キャンバスに塗った所だけ見える)
  const SCW = 512, SCH = Math.round(512 * PD / PW), SC = document.createElement("canvas"); SC.width = SCW; SC.height = SCH; const sctx = SC.getContext("2d");
  const sheetTex = new THREE.CanvasTexture(SC);
  const sheet = new THREE.Mesh(new THREE.PlaneGeometry(PW - 0.3, PD - 0.3, 170, 128), new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.2, alphaMap: sheetTex, transparent: true, depthWrite: false }));
  sheet.rotation.x = -Math.PI / 2; sheet.position.y = 0.035; pan.add(sheet);
  let sheetCook = 0, sheetDirty = false, sheetCookT = 0;
  // 点ごと: 焼け具合(こぼれた時からの時間で焼ける) / 生地の濃さ / 穴の上なら穴の中へ流れこむ深さ
  const shN = sheet.geometry.attributes.position.count, sheetCV = new Float32Array(shN), sheetA = new Float32Array(shN), sheetDip = new Float32Array(shN);
  sheet.geometry.setAttribute("color", new THREE.Float32BufferAttribute(new Float32Array(shN * 3).fill(1), 3));
  const toSC = (x, z) => [(x / (PW - 0.3) + 0.5) * SCW, (z / (PD - 0.3) + 0.5) * SCH], scK = SCW / (PW - 0.3);
  function sheetPaint(x, z, r, a) { const [u, v] = toSC(x, z), R = r * scK, g = sctx.createRadialGradient(u, v, R * 0.3, u, v, R); g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(1, "rgba(255,255,255,0)"); sctx.globalCompositeOperation = "source-over"; sctx.fillStyle = g; sctx.beginPath(); sctx.arc(u, v, R, 0, 7); sctx.fill(); sheetDirty = true; }
  function sheetErase(x, z, r) { const [u, v] = toSC(x, z); sctx.globalCompositeOperation = "destination-out"; sctx.fillStyle = "#000"; sctx.beginPath(); sctx.arc(u, v, r * scK, 0, 7); sctx.fill(); sctx.globalCompositeOperation = "source-over"; sheetDirty = true; }
  function sheetClear() { sctx.clearRect(0, 0, SCW, SCH); sheetDirty = true; sheetCook = 0; sheetCV.fill(0); spreads.length = 0; tucks.length = 0; lastPour = null; sheetHeights(true); }
  // 不規則なふちの液だまり(ぐにゃっとした形)
  function sheetBlob(x, z, r, a) {
    const [u, v] = toSC(x, z), R = r * scK, n = 18, ph = Math.random() * 6.28; sctx.globalCompositeOperation = "source-over"; sctx.fillStyle = `rgba(255,255,255,${a})`; sctx.beginPath();
    for (let i = 0; i <= n; i++) { const t = i / n * 6.283, k = 1 + 0.18 * Math.sin(t * 3 + ph) + 0.1 * Math.sin(t * 5 + ph * 2) + rnd(-0.05, 0.05); sctx.lineTo(u + Math.cos(t) * R * k, v + Math.sin(t) * R * k); }
    sctx.fill(); sheetDirty = true;
  }
  function sheetLine(x0, z0, x1, z1, w, a) { const [u0, v0] = toSC(x0, z0), [u1, v1] = toSC(x1, z1); sctx.globalCompositeOperation = "source-over"; sctx.strokeStyle = `rgba(255,255,255,${a})`; sctx.lineWidth = w * scK; sctx.lineCap = "round"; sctx.beginPath(); sctx.moveTo(u0, v0); sctx.lineTo(u1, v1); sctx.stroke(); sheetDirty = true; }
  const spreads = [], tucks = []; let lastPour = null; // tucks = 回したたこ焼きが、まわりの生地を少しずつ巻きこむ // spreads = 落ちた所から、じわっと広がる液だまり
  function spreadTick(dt) {
    for (let i = tucks.length - 1; i >= 0; i--) { const q = tucks[i]; q.t += dt; const k = Math.min(1, q.t / 1.5); sheetErase(q.b.h.x, q.b.h.z, HR * (1.02 + 0.22 * k)); if (k >= 1) tucks.splice(i, 1); }
    for (let i = spreads.length - 1; i >= 0; i--) { const q = spreads[i]; q.t += dt; const r = q.r0 + (q.r1 - q.r0) * Math.min(1, q.t / q.dur); sheetBlob(q.x, q.z, r, 0.16); if (q.hole) sheetErase(q.hole.h.x, q.hole.h.z, HR * 0.9); if (q.t >= q.dur) spreads.splice(i, 1); }
  }
  // 液だまりに厚み(キャンバスの濃さ → 高さ)。ふちは丸く盛り上がる
  let hgtAt = 0;
  function sheetDipInit() { const pos = sheet.geometry.attributes.position; for (let i = 0; i < shN; i++) { const x = pos.getX(i), z = -pos.getY(i); let d0 = 0; for (const h of holes) { const d = Math.hypot(x - h.x, z - h.z); if (d < HR) d0 = Math.min(d0, -Math.sqrt(HR * HR - d * d) * 0.97 - 0.03); } sheetDip[i] = d0; } }
  function sheetColors() { const c = sheet.geometry.attributes.color; for (let i = 0; i < shN; i++) { if (sheetA[i] < 0.02) continue; doneColor(Math.min(1.35, sheetCV[i]), tmpC); c.setXYZ(i, tmpC.r, tmpC.g, tmpC.b); } c.needsUpdate = true; }
  function sheetHeights(force) {
    if (!sheetDip.inited) { sheetDipInit(); sheetDip.inited = true; }
    const now = performance.now(); if (!force && now - hgtAt < 120) return; hgtAt = now;
    const img = sctx.getImageData(0, 0, SCW, SCH).data, pos = sheet.geometry.attributes.position, gw = PW - 0.3, gd = PD - 0.3;
    for (let i = 0; i < pos.count; i++) { const u = Math.min(SCW - 1, Math.max(0, ((pos.getX(i) / gw) + 0.5) * SCW | 0)), v = Math.min(SCH - 1, Math.max(0, (0.5 - pos.getY(i) / gd) * SCH | 0)); const a = img[(v * SCW + u) * 4 + 3] / 255; sheetA[i] = a; if (a < 0.02) sheetCV[i] = 0; pos.setZ(i, sheetDip[i] + Math.sqrt(a) * 0.09); } // 穴の上は宙に浮かず、穴の内側にそって流れこむ
    pos.needsUpdate = true; sheet.geometry.computeVertexNormals();
  }
  // 生地入れ(アルミのピッチャー)と、落ちる生地の筋・波紋
  const pitcher = new THREE.Group(); pitcher.visible = false; scene.add(pitcher);
  const TIP = new THREE.Vector3(0.95, 0.62, 0);
  {
    const al = new THREE.MeshStandardMaterial({ color: 0xd9dcdf, metalness: 0.8, roughness: 0.28, side: THREE.DoubleSide });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.5, 1.3, 26, 1, true), al); pitcher.add(body);
    const bot = new THREE.Mesh(new THREE.CircleGeometry(0.5, 26), al); bot.rotation.x = Math.PI / 2; bot.position.y = -0.65; pitcher.add(bot);
    const inside = new THREE.Mesh(new THREE.CircleGeometry(0.58, 26), liquidMat); inside.rotation.x = -Math.PI / 2; inside.position.y = 0.35; pitcher.add(inside);
    const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.2, 0.55, 12, 1, true), al); spout.rotation.z = -1.0; spout.position.set(0.78, 0.5, 0); pitcher.add(spout);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.06, 8, 18, Math.PI), al); handle.rotation.z = Math.PI / 2; handle.position.set(-0.62, 0.05, 0); pitcher.add(handle);
  }
  const streamMat = new THREE.MeshStandardMaterial({ color: 0xf3dd9e, roughness: 0.1, transparent: true, opacity: 0.95 });
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 1, 10, 10, true), streamMat); stream.visible = false; scene.add(stream);
  const ripples = []; const rippleGeo = new THREE.RingGeometry(0.8, 1, 32);
  let tilt = 0, rippleT = 0; const pourPos = new THREE.Vector3(), tipW = new THREE.Vector3();
  const drops = []; const dropGeo = new THREE.SphereGeometry(0.06, 10, 8);
  // 机の上に置いてある「油」と「生地」: 指(マウス)でつかんで、たこ焼き器へ。名前の札つき
  const props = new THREE.Group(); scene.add(props);
  function nameTag(text) {
    const c = document.createElement("canvas"); c.width = 256; c.height = 128; const g = c.getContext("2d");
    g.fillStyle = "#fffaf0"; g.strokeStyle = "#2b2b2b"; g.lineWidth = 10; g.beginPath(); g.roundRect ? g.roundRect(8, 8, 240, 112, 30) : g.rect(8, 8, 240, 112); g.fill(); g.stroke();
    g.fillStyle = "#2b2b2b"; g.font = "900 70px sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, 128, 68);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false })); sp.scale.set(1.5, 0.75, 1); sp.renderOrder = 5; return sp;
  }
  const TABLE_Y = -1.9, PROP_Z = PD / 2 + 1.25;
  const oilProp = new THREE.Group(); { // 油の入った小さい器＋はけ
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.45, 0.6, 24), new THREE.MeshStandardMaterial({ color: 0xf4f0e6, roughness: 0.5 })); pot.position.y = 0.3; oilProp.add(pot);
    const oil = new THREE.Mesh(new THREE.CircleGeometry(0.5, 24), new THREE.MeshStandardMaterial({ color: 0xe0b23a, roughness: 0.05, metalness: 0.2 })); oil.rotation.x = -Math.PI / 2; oil.position.y = 0.52; oilProp.add(oil);
    const br = brush.clone(true); br.visible = true; br.scale.setScalar(1.0); br.rotation.set(0, 0, -0.45); br.position.set(0.05, 0.35, 0); oilProp.add(br);
    const tag = nameTag("油"); tag.position.set(0, 2.3, 0); oilProp.add(tag);
    oilProp.scale.setScalar(1.35); oilProp.position.set(-4.1, TABLE_Y, PROP_Z); oilProp.userData.tool = "oil"; props.add(oilProp);
  }
  const batterProp = new THREE.Group(); { // 生地の入ったピッチャー
    const pt = pitcher.clone(true); pt.visible = true; pt.scale.setScalar(0.8); pt.position.y = 0.65 * 0.8; batterProp.add(pt);
    const tag = nameTag("生地"); tag.position.set(0, 2.1, 0); batterProp.add(tag);
    batterProp.scale.setScalar(1.35); batterProp.position.set(4.1, TABLE_Y, PROP_Z); batterProp.userData.tool = "batter"; props.add(batterProp);
  }
  function propHit(e) { // 机の上の油・生地に、さわったか
    const r = cv.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(props.children.filter((g) => g.visible), true)[0]; if (!hit) return null;
    let o = hit.object; while (o && !o.userData.tool) o = o.parent; return o ? o.userData.tool : null;
  }
  const onPan = (p) => p && Math.abs(p.x) < PW / 2 + 0.1 && Math.abs(p.z) < PD / 2 + 0.1; // たこ焼き器の上か
  function propsTick() { props.visible = stage === "cook"; oilProp.visible = tool !== "oil"; batterProp.visible = tool !== "batter"; } // 手に持っている方は、机から消える
  function brushTick(now) {
    const on = stage === "cook" && tool === "oil" && brushAt && now - brushT < 250;
    brush.visible = stage === "cook" && tool === "oil" && !!brushAt && now - brushT < 600;
    if (brush.visible) brush.position.set(brushAt.x + 0.15, on ? 0.02 : 0.25, brushAt.z);
  }
  function pitcherTick(dt, now) {
    // 注ぎ終わり: 注ぎ口から、しずくがポタポタ
    if (!pourAt && tilt > 0.6 && pitcher.visible && drops.length < 4 && Math.random() < dt * 9) { const d = new THREE.Mesh(dropGeo, streamMat); tipW.copy(TIP).applyEuler(pitcher.rotation).add(pitcher.position); d.position.copy(tipW); d.scale.set(1, 1.6, 1); d.userData.v = 0; scene.add(d); drops.push(d); }
    for (let i = drops.length - 1; i >= 0; i--) { const d = drops[i]; d.userData.v += 18 * dt; d.position.y -= d.userData.v * dt; if (d.position.y <= 0.05) { const b = holeAt(d.position, 0.95); if (b && b.started && b.noBatter) unClump(b); if (b && !b.started) b.fill = Math.min(2, b.fill + 0.02); else sheetBlob(d.position.x, d.position.z, 0.12, 0.5); scene.remove(d); drops.splice(i, 1); } }
    const on = stage === "cook" && tool === "batter" && !!pourAt;
    tilt += ((on ? 1.05 : 0) - tilt) * Math.min(1, dt * 8);
    if (pourAt) pourPos.lerp(pourAt, pitcher.visible ? Math.min(1, dt * 14) : 1);
    pitcher.visible = stage === "cook" && tool === "batter" && (on || tilt > 0.05);
    if (pitcher.visible) {
      pitcher.rotation.set(0, 0, -tilt);
      tipW.copy(TIP).applyEuler(pitcher.rotation);
      pitcher.position.set(pourPos.x - tipW.x, 2.4 - tipW.y, pourPos.z - tipW.z);
    }
    const flowing = on && tilt > 0.75;
    stream.visible = flowing;
    if (flowing) {
      const b = holeAt(pourPos, 1.0), surf = b && !b.started ? Math.min(0.02, -HR + Math.min(b.fill, 1.02) * HR) : 0.04;
      const top = 2.4, len = top - surf; stream.position.set(pourPos.x + Math.sin(now / 70) * 0.02, (top + surf) / 2, pourPos.z); stream.scale.set(1, len, 1); stream.rotation.z = Math.sin(now / 90) * 0.015;
      rippleT -= dt; if (rippleT <= 0) { rippleT = 0.14; const m = new THREE.Mesh(rippleGeo, new THREE.MeshStandardMaterial({ color: 0xfff3cf, roughness: 0.1, transparent: true, opacity: 0.8 })); m.rotation.x = -Math.PI / 2; m.position.set(pourPos.x, surf + 0.02, pourPos.z); m.scale.setScalar(0.12); m.userData.t = 0; scene.add(m); ripples.push(m); }
    }
    for (let i = ripples.length - 1; i >= 0; i--) { const m = ripples[i]; m.userData.t += dt; const t = m.userData.t / 0.7; m.scale.setScalar(0.12 + t * 0.7); m.material.opacity = 0.8 * (1 - t); if (t >= 1) { scene.remove(m); m.material.dispose(); ripples.splice(i, 1); } }
  }

  // ---------- 状態 ----------
  let stage = "title"; // title / cook / top / result
  let tool = "batter", heatK = 0.6, cookT = 0, startedAt = 0;
  const tall = () => innerWidth / innerHeight < 0.8; // スマホの縦画面: 下のボタンに隠れないよう、少し引いて上に寄せる
  const camPan = { get pos() { return tall() ? new THREE.Vector3(0, 17.5, 9.8) : new THREE.Vector3(0, 13.5, 8.2); }, get at() { return new THREE.Vector3(0, -0.4, 0.9 + 0.5 + 2.5 * panFocus); } }; let panFocus = 0; // 0=たこ焼き器に寄る / 1=手前のお皿まで入れる(お皿に盛る時)
  const camPlate = { get pos() { return tall() ? new THREE.Vector3(0, 15, 9) : new THREE.Vector3(0, 11, 7.4); }, get at() { return new THREE.Vector3(0, -0.6, 0.8); } };
  const camNow = { pos: camPan.pos.clone(), at: camPan.at.clone() }; let camGoal = camPan;
  // 視点: yaw=まわりこむ角度 / pitch=見下ろす角度(0=真横・1.57=真上) / zoom=近さ。最初は斜め上から
  const VIEW0 = { yaw: 0, pitch: 0.82, zoom: 1 }, view = { ...VIEW0 }, viewGoal = { ...VIEW0 }; let autoSpin = false;
  function viewBy(dy, dp, dz) { viewGoal.yaw += dy; viewGoal.pitch = clamp(viewGoal.pitch + dp, 0.38, 1.45); viewGoal.zoom = clamp(viewGoal.zoom * (dz || 1), 0.55, 1.7); }

  function resize() {
    const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h;
    camera.fov = w / h < 0.8 ? 52 : 42; camera.clearViewOffset(); camera.updateProjectionMatrix();
  }
  addEventListener("resize", resize); resize();

  // ---------- 音(その場で合成) ----------
  let ac = null, sizzleG = null, noiseBuf = null, lastJyu = -1;
  function initAudio() {
    if (ac || !window.AudioContext && !window.webkitAudioContext) return;
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      const buf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      noiseBuf = buf; const src = ac.createBufferSource(); src.buffer = buf; src.loop = true;
      const hp = ac.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 2500;
      sizzleG = ac.createGain(); sizzleG.gain.value = 0; src.connect(hp).connect(sizzleG).connect(ac.destination); src.start();
    } catch { ac = null; }
  }
  function jyu(vol = 1) { // 具が鉄板に当たった「じゅーっ」(はじめ強く、パチパチしながら消えていく)
    if (!ac || !noiseBuf) return; const t = ac.currentTime; if (t - lastJyu < 0.16) return; lastJyu = t;
    const v = 0.11 * vol * (0.6 + 0.4 * heatK), dur = 0.9 + 0.5 * vol;
    const src = ac.createBufferSource(); src.buffer = noiseBuf; src.playbackRate.value = 0.9 + Math.random() * 0.25;
    const hp = ac.createBiquadFilter(); hp.type = "highpass"; hp.frequency.setValueAtTime(1500, t); hp.frequency.linearRampToValueAtTime(2600, t + dur);
    const pk = ac.createBiquadFilter(); pk.type = "peaking"; pk.frequency.value = 4200; pk.gain.value = 6; pk.Q.value = 0.8;
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.025); g.gain.setTargetAtTime(v * 0.45, t + 0.08, 0.12); g.gain.setTargetAtTime(0.0001, t + 0.35, dur / 3.5);
    const cr = ac.createGain(); cr.gain.setValueAtTime(1, t); for (let x = 0.04; x < dur; x += 0.02 + Math.random() * 0.05) cr.gain.setValueAtTime(Math.random() < 0.3 ? 1.8 : 0.55 + Math.random() * 0.5, t + x); // パチパチ
    src.connect(hp).connect(pk).connect(cr).connect(g).connect(ac.destination); src.start(t, Math.random() * 1); src.stop(t + dur + 0.2);
  }
  function blip(f, dur, type = "sine", vol = 0.08) { if (!ac) return; const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime; o.type = type; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.6, t + dur); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur); o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur); }

  // ---------- UI ----------
  let toastT = 0;
  function toast(t, ms = 1300) { const e = $("toast"); e.textContent = t; e.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => e.classList.remove("show"), ms); }
  function guide(t) { $("guide").innerHTML = t || ""; }
  const ghost = $("ghost");
  function buildPanel() {
    const P = $("panel"); P.classList.remove("hide");
    const list = stage === "cook" ? TOOLS_COOK : TOOLS_TOP;
    P.innerHTML = (stage === "cook" ? `<div id="heat">🔥火力 <button class="hb" data-h="0.6">弱火</button><button class="hb" data-h="1">中火</button><button class="hb" data-h="1.5">強火</button></div>` : "")
      + `<div class="tools">${list.map((t) => `<button class="tool${t.joke ? " joke" : ""}" data-t="${t.id}"><b>${THUMB[t.id] ? `<img src="${THUMB[t.id]}" alt="">` : t.e}</b><span>${t.name}</span></button>`).join("")}</div>`
      + `<div class="btns">${stage === "cook" ? `<button class="btn pk" id="ingBtn" style="display:none">🧂 材料</button><button class="btn pk" id="pickBtn">🥢 回す</button>${buildPanel.carryShown ? `<button class="btn pk" id="carryBtn">🍽 お皿に盛る</button>` : ""}` : `<button class="btn go" id="nextBtn">✨ 完成！</button>`}</div>`;
    for (const b of P.querySelectorAll(".tool")) b.onclick = () => { tool = stage === "cook" && tool === b.dataset.t ? "pick" : b.dataset.t; markTools(); initAudio(); }; // 選んでいるのをもう一度タップ → 選ぶのをやめて、指で回す
    for (const b of P.querySelectorAll(".hb")) b.onclick = () => { heatK = +b.dataset.h; markTools(); };
    if ($("nextBtn")) $("nextBtn").onclick = () => finish();
    if ($("pickBtn")) $("pickBtn").onclick = () => { tool = "pick"; initAudio(); if (!buildPanel.carryShown) { buildPanel.carryShown = true; buildPanel(); } else markTools(); }; // 回す(材料とは別のボタン)。押したら「お皿に盛る」も出る
    if ($("carryBtn")) $("carryBtn").onclick = () => { tool = "carry"; markTools(); initAudio(); };
    if ($("ingBtn")) $("ingBtn").onclick = () => { tool = "free"; markTools(); }; // 材料の一覧にもどる
    markTools();
  }
  function markTools() {
    for (const b of document.querySelectorAll(".tool")) b.classList.toggle("on", b.dataset.t === tool);
    if ($("pickBtn")) $("pickBtn").classList.toggle("on", tool === "pick");
    { const rolling = stage === "cook" && (tool === "pick" || tool === "carry"), tl = document.querySelector("#panel .tools"); if (tl) tl.style.display = rolling ? "none" : ""; if ($("ingBtn")) $("ingBtn").style.display = rolling ? "" : "none"; } // 回す・お皿に盛る の時は、材料の一覧をかくす
    if ($("carryBtn")) $("carryBtn").classList.toggle("on", tool === "carry");
    for (const b of document.querySelectorAll(".hb")) b.classList.toggle("on", +b.dataset.h === heatK);
    setCursor(); const T = [...TOOLS_COOK, ...TOOLS_TOP].find((t) => t.id === tool); ghost.innerHTML = T ? (THUMB[T.id] ? `<img src="${THUMB[T.id]}" alt="" style="width:30px;height:30px;display:block">` : T.e) : "";
    const tips = {
      free: "机の<b>油</b>（はけ）を指でつかんで、たこ焼き器をなぞろう。次に<b>生地</b>をつかんで穴に流そう",
      oil: "まず<b>油をひこう</b>：はけで<b>たこ焼き器をなぞる</b>（油がないと、回すときにくっつく）",
      batter: "穴の上を<b>なぞって生地を流そう</b>。少し<b>あふれるくらい</b>がまんまるのコツ",
      tako: "穴をタップして<b>たこ</b>を入れよう（1個に1つ）",
      tenkasu: "穴をタップ・なぞって<b>天かす</b>をパラパラ", negi: "<b>ねぎ</b>をパラパラ", beni: "<b>紅しょうが</b>をパラパラ",
      cheese: "<b>チーズ</b>入りもおいしい", ichigo: "<b>いちご</b>…？ スイーツたこ焼き", budou: "<b>ぶどう</b>…？ ひとつぶ入れてみる", mikan: "むいた<b>みかん</b>…？ ひと房", ketchup: "たこ焼きを<b>なぞってケチャップ</b>（なぞった所だけ）", choco: "<b>チョコ</b>…？ ロシアンたこ焼き", banana: "<b>バナナ</b>…？ デザートたこ焼き",
      pick: "🥢 たこ焼きを<b>指でなぞると回る</b>（何回も回して、だんだん丸く）。焼けたら<b>「お皿に盛る」</b>で手前のお皿へ",
      carry: "🍽 たこ焼きを<b>押したまま、手前のお皿へ引っぱって</b>はなす（好きな所に・重ねてもOK）。<b>ぜんぶのせたらトッピングへ</b>",
      sauce: "たこ焼きを<b>なぞってソース</b>（なぞった所だけ・何回も重ねると、こく）", mayo: "<b>マヨ</b>をシュッシュッと", nori: "<b>青のり</b>をパラパラ", katsuo: "<b>かつお節</b>をのせよう（ゆらゆら）",
    };
    guide(tips[tool] || "");
  }

  // ---------- はじめる ----------
  function reset() {
    drips.length = 0;
    for (const b of balls) { pan.remove(b.disk); pan.remove(b.puddle); pan.remove(b.holder); plate.remove(b.holder); if (b.dry) pan.remove(b.dry); }
    oilClear(); oilTex.needsUpdate = true;
    balls = holes.map(makeBall); cookT = 0; startedAt = 0; heatK = 0.6; sheetClear(); /* はじめは弱火 */
    pan.visible = true; plate.visible = true; plate.position.set(0, PLATE_COOK.y, PLATE_COOK.z); plate.scale.setScalar(PLATE_COOK.s); camGoal = camPan; if (toothpicks) toothpicks.visible = false; // 焼いている時も、手前にお皿
  }
  function start() {
    initAudio(); reset();
    $("title").classList.add("hide"); $("result").classList.add("hide");
    Object.assign(viewGoal, VIEW0); Object.assign(view, VIEW0); autoSpin = false; $("viewCtl").style.display = VIEW_LOCK ? "none" : "";
    stage = "cook"; tool = "free"; $("step").textContent = "🔥 焼く"; buildPanel.pickTold = false; buildPanel.carryShown = false; lastResult = null; buildPanel();
  }
  $("startBtn").onclick = start;
  for (const b of document.querySelectorAll("#viewCtl button")) b.onclick = () => { const a = b.dataset.v; if (a === "l") viewBy(0.45, 0); else if (a === "r") viewBy(-0.45, 0); else if (a === "u") viewBy(0, 0.18); else if (a === "d") viewBy(0, -0.18); else if (a === "in") viewBy(0, 0, 1 / 1.15); else if (a === "out") viewBy(0, 0, 1.15); else Object.assign(viewGoal, VIEW0); };
  $("againBtn").onclick = start;

  // ---------- 入力 ----------
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), yPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hitV = new THREE.Vector3();
  let down = null;
  function pointAt(e, y = 0) {
    const r = cv.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera); yPlane.constant = -y; return ray.ray.intersectPlane(yPlane, hitV) ? hitV.clone() : null;
  }
  const holeAt = (p, k = 1.05) => (p ? balls.find((b) => Math.hypot(p.x - b.h.x, p.z - b.h.z) < HR * k) : null);
  function ballHit(e) { // 立体のたこ焼きに当たったか
    const r = cv.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera);
    const objs = balls.filter((b) => b.ball.visible).map((b) => b.ball); const hit = ray.intersectObjects(objs)[0];
    if (hit) return { b: balls.find((x) => x.ball === hit.object), p: hit.point, mesh: true };
    const p = pointAt(e, stage === "top" ? 0.4 : 0); const b = holeAt(p, 1.1); return b ? { b, p } : null;
  }
  const touches = new Map(); let orbit = null; // orbit = 視点を動かしている(2本指 / 右ドラッグ)
  function orbitInfo() { const ps = [...touches.values()]; const cx = ps.reduce((a, q) => a + q.x, 0) / ps.length, cy = ps.reduce((a, q) => a + q.y, 0) / ps.length; const d = ps.length > 1 ? Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y) : 0; return { cx, cy, d }; }
  cv.addEventListener("contextmenu", (e) => e.preventDefault());
  cv.addEventListener("wheel", (e) => { if (stage !== "result") return; e.preventDefault(); autoSpin = false; viewBy(0, 0, e.deltaY > 0 ? 1.1 : 1 / 1.1); }, { passive: false });
  const VIEW_LOCK = true; // 視点はずっとこの角度(変えられないようにした)
  cv.addEventListener("pointerdown", (e) => {
    touches.set(e.pointerId, { x: e.clientX, y: e.clientY }); try { cv.setPointerCapture(e.pointerId); } catch {}
    if (!VIEW_LOCK && (e.button === 2 || touches.size >= 2)) { // 2本目の指 / 右クリック → 視点を動かす(やっていた作業はやめる)
      if (down) { down = null; pourAt = null; lastPour = null; }
      orbit = { ...orbitInfo(), right: e.button === 2 }; ghost.style.display = "none"; return;
    }
    if (stage === "result") { autoSpin = false; orbit = { ...orbitInfo(), right: false }; return; } // 完成: 指でぐるっと回して見られる(2本指で拡大)
    if (orbit) return;
    if (stage !== "cook" && stage !== "top") return;
    initAudio();
    down = { id: e.pointerId, x: e.clientX, y: e.clientY, last: performance.now(), lastSpr: 0 };
    if (stage === "cook") { const t = propHit(e); if (t) { tool = t; markTools(); down.prop = true; blip(700, 0.05, "triangle", 0.05); return; } } // 机の油・生地をつかむ
    showGhost(e); act(e, true);
  });
  cv.addEventListener("pointermove", (e) => {
    if (touches.has(e.pointerId)) touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (orbit) { const o = orbitInfo(); viewBy(-(o.cx - orbit.cx) * 0.008, (o.cy - orbit.cy) * 0.006, orbit.d && o.d ? orbit.d / o.d : 1); orbit = { ...o, right: orbit.right }; return; }
    showGhost(e); if (down && e.pointerId === down.id) act(e, false);
  });
  const up = (e) => {
    touches.delete(e.pointerId);
    if (orbit) { if (!touches.size) orbit = null; else orbit = { ...orbitInfo(), right: orbit.right }; down = null; pourAt = null; return; } if (down && e.pointerId === down.id && down.prop) { tool = "free"; markTools(); } // 机の油・生地は、はなしたら机にもどる
    if (down && e.pointerId === down.id) { if (down.drag && down.drag.lift) dropBall(down.drag.b, e); else if (down.drag && !down.drag.moved && !down.drag.carry) turnBall(down.drag.b); down = null; } if (e.pointerType !== "mouse") ghost.style.display = "none"; pourAt = null; lastPour = null; };
  cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
  cv.addEventListener("pointerleave", () => { ghost.style.display = "none"; });
  function showGhost(e) { // マウス: カーソルそのものが具の絵(ぴったりその位置) / 指: 指のすぐ上に小さく
    if (stage !== "cook" && stage !== "top") return;
    if (e.pointerType === "mouse") { ghost.style.display = "none"; return; }
    ghost.style.display = tool === "batter" || tool === "oil" ? "none" : "block"; ghost.style.left = e.clientX + "px"; ghost.style.top = e.clientY + "px";
  }
  const CUR = {}; // マウスカーソル用の小さい絵(32px・まんなかが指す所)
  function cursorFor(id) {
    if (CUR[id] !== undefined) return CUR[id];
    CUR[id] = ""; if (!THUMB[id]) return "";
    const im = new Image(); im.onload = () => { const c = document.createElement("canvas"); c.width = c.height = 32; c.getContext("2d").drawImage(im, 0, 0, 32, 32); CUR[id] = c.toDataURL("image/png"); if (tool === id) setCursor(); }; im.src = THUMB[id];
    return "";
  }
  function setCursor() { const u = (stage === "cook" || stage === "top") && tool !== "batter" && tool !== "oil" ? cursorFor(tool) : ""; cv.style.cursor = u ? `url(${u}) 16 16, crosshair` : stage === "cook" || stage === "top" ? "crosshair" : ""; }

  let pourAt = null, brushAt = null, brushT = 0; // 生地を流している場所(毎フレーム量をふやす)
  function act(e, first) {
    const now = performance.now();
    if (stage === "cook") {
      if (tool === "batter") { const q = pointAt(e, 0); pourAt = onPan(q) ? q : null; return; } // たこ焼き器の上に来たら、注ぐ
      if (tool === "oil") { const q0 = pointAt(e, 0), q = onPan(q0) ? q0 : null; if (first || !q) lastOil = null; oilAt(q); if (q) { brushAt = q; brushT = performance.now(); } if (first || Math.random() < 0.2) blip(2600, 0.02, "sine", 0.015); return; }
      if (tool === "carry") { // お皿に盛る: 回したたこ焼きを押したまま、手前のお皿へ運ぶ(マウスはクリックしたまま・スマホは指で)
        if (first) { const h = ballHit(e); if (h && h.b.made) { if (!h.b.started) startBall(h.b); down.drag = { b: h.b, x: e.clientX, y: e.clientY, carry: true }; } return; } // まだ丸めていないのも運べる(半分のまま)
        const d = down.drag; if (!d) return;
        if (!d.lift && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 5) startLift(d);
        if (d.lift) liftTo(d.b, e);
        return;
      }
      if (first && tool !== "pick" && tool !== "free") { const h = ballHit(e); if (h && h.b.started && !h.b.onPlate) { down.drag = { b: h.b, x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, moved: false }; return; } } // 回した玉は、どの道具でも指で回せる
      if (tool === "pick" || tool === "free" || down.drag) { // 回す: 指でなぞると、その向きにくるくる回る。動かさずに離すとタップ=ちょっとつつく
        if (first) { const h = ballHit(e); if (h && !h.b.onPlate) down.drag = { b: h.b, x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, moved: false }; return; }
        const d = down.drag; if (!d) return;
        if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 12) { d.moved = true; d.lx = e.clientX; d.ly = e.clientY; } // 少しさわっただけでは回らない
        if (d.moved) { rotateBy(d.b, (e.clientX - d.lx) * 0.028, (e.clientY - d.ly) * 0.028); d.lx = e.clientX; d.ly = e.clientY; }
        return;
      }
      const b = holeAt(pointAt(e, 0)); if (!b) return;
      if (tool === "tako") { if (first) addTako(b); return; }
      if (first || now - down.lastSpr > 70) { down.lastSpr = now; addBits(b, tool); } // なぞると、どんどん入る
      return;
    }
    if (stage === "top") {
      const h = ballHit(e); if (!h) return;
      if (tool === "sauce") { if (h.mesh) brushSauce(h.b, h.p); return; } // なぞった所だけ
      if (tool === "ketchup") { if (h.mesh) brushKetchup(h.b, h.p); return; }
      if (tool !== "mayo" && now - down.lastSpr < 110 && !first) return; down.lastSpr = now;
      if (tool === "mayo") { mayoStroke(e, first); } else if (tool === "nori") addNori(h.b); else if (tool === "katsuo") addKatsuo(h.b);
    }
  }

  // ---------- 生地・具 ----------
  function pourTick(dt) {
    if (!pourAt) return;
    let b = holeAt(pourAt, 1.0);
    if (!b) { const near = balls.map((x) => [x, Math.hypot(pourAt.x - x.h.x, pourAt.z - x.h.z)]).sort((a, c) => a[1] - c[1])[0]; if (near && near[1] < HR * 1.7) b = near[0]; } // 穴のまわりにこぼれた生地は、その穴の「あふれ」
    const inHole = !!holeAt(pourAt, 0.95);
    if (!inHole || (b && b.started)) { // 穴の外(と、もう回した穴の中: 玉のまわりにたまる)に流した生地は、なぞった跡にそって流れて、じわっと広がる
      if (lastPour && Math.hypot(lastPour.x - pourAt.x, lastPour.z - pourAt.z) < 3) sheetLine(lastPour.x, lastPour.z, pourAt.x, pourAt.z, 0.42, 0.55);
      sheetBlob(pourAt.x, pourAt.z, 0.28, 0.35);
      if (!lastPour || Math.hypot(lastPour.x - pourAt.x, lastPour.z - pourAt.z) > 0.25 || Math.random() < dt * 4) spreads.push({ x: pourAt.x + rnd(-0.1, 0.1), z: pourAt.z + rnd(-0.1, 0.1), r0: 0.25, r1: rnd(0.55, 0.85), t: 0, dur: rnd(0.8, 1.4) });
    }
    lastPour = pourAt.clone();
    if (b && b.started && b.noBatter && inHole) unClump(b); // 具だけ丸めた穴に生地 → 具が生地の中へ(ふつうの穴にもどる)
    if (!b || b.started) return;
    if (!startedAt) startedAt = performance.now();
    b.fill = Math.min(2, Math.max(b.fill, 0.15) + dt * 0.85); b.made = true; // 当たった瞬間に少したまって、そこからゆっくり(1穴 約1.2秒でちょうど)
    if (b.fill > 1.0 && Math.random() < dt * 10) spreads.push({ x: b.h.x + rnd(-0.5, 0.5), z: b.h.z + rnd(-0.5, 0.5), r0: HR * 0.8, r1: HR * (1.05 + (b.fill - 1) * 0.9) * rnd(0.85, 1.15), t: 0, dur: rnd(0.6, 1.1), hole: b }); // あふれた分は、穴のまわりにじわっと(不規則な形で)
    if (sizzleG && ac) sizzleG.gain.setTargetAtTime(0.05, ac.currentTime, 0.05);
  }
  const TINT = { negi: [0x6cbf46, 0.55], beni: [0xe2405f, 0.5], choco: [0x5a2e14, 0.65], cheese: [0xffcf3c, 0.5], banana: [0xf2e39c, 0.35], tenkasu: [0xd6a256, 0.3], tako: [0xd3788a, 0.3], ichigo: [0xe8344a, 0.55], budou: [0x5a2a6a, 0.55], mikan: [0xffa21f, 0.5] };
  function addTint(b, kind, x, y) { // その具のまわりの生地に色がうつる(液体の面に色むら＋丸めた後の表面にも残す)
    const T = TINT[kind]; if (!T) return;
    const v = new THREE.Vector3(rnd(-1, 1), rnd(-1, 0.6), rnd(-1, 1)).normalize(); b.tints.push({ dir: v, col: new THREE.Color(T[0]), s: T[1], r: rnd(0.35, 0.6) });
    if (b.fill > 0.05 && Math.random() < 0.8) { const d = new THREE.Mesh(new THREE.CircleGeometry(rnd(0.16, 0.3), 16), new THREE.MeshStandardMaterial({ color: T[0], roughness: 0.3, transparent: true, opacity: Math.min(0.85, T[1] * 1.15), depthWrite: false })); d.position.set(x, y, 0.004); d.scale.set(rnd(0.8, 1.4), rnd(0.7, 1.2), 1); d.rotation.z = rnd(0, 6.28); b.extras.add(d); }
  }
  function placeItem(b, m, kind, rmax) {
    m.traverse((o) => { if (o.isMesh) o.userData.kind = kind; }); // 生地があれば生地の面の上(+Zが上) / なければ穴の底に転がる(+Yが上)
    const big = ((BIT[kind] && BIT[kind].big) || 0) * GU.fruit, a = rnd(0, 6.28), rr = Math.sqrt(Math.random()) * rmax * (big ? 0.55 : 1); // 大きい果物は、まん中寄り(ふちにめりこまない)
    if (b.fill > 0.05) {
      m.position.set(Math.cos(a) * rr, Math.sin(a) * rr, kind === "tako" ? 0.06 : 0.03); addTint(b, kind, m.position.x, m.position.y);
      if (FLAT[kind]) m.rotation.set(Math.PI / 2 + rnd(-0.25, 0.25), rnd(0, 6.28), rnd(-0.25, 0.25), "XYZ"); else if (kind !== "tako") m.rotation.set(rnd(0, 6.28), rnd(0, 6.28), rnd(0, 6.28));
      if (kind === "negi") { m.position.z += rnd(0, Math.min(0.22, (b.items.negi || 0) * 0.012)) * (1 - rr / rmax * 0.6); m.rotation.x += rnd(-0.7, 0.7); m.rotation.z += rnd(-0.7, 0.7); flutter(m, "z"); } // ふんわり積もる(多いほど山に)
      b.extras.add(m);
    } else {
      if (!b.dry) { b.dry = new THREE.Group(); b.dry.position.set(b.h.x, 0, b.h.z); pan.add(b.dry); }
      addTint(b, kind, 0, 0); const r2 = rr * 0.7; m.position.set(Math.cos(a) * r2, -Math.sqrt(Math.max(0, HR * HR - r2 * r2)) * 0.97 + 0.06 + big, Math.sin(a) * r2); // 大きいのは、底にのるように中心を上げる
      if (FLAT[kind]) m.rotation.set(rnd(-0.3, 0.3), rnd(0, 6.28), rnd(-0.3, 0.3)); else if (kind !== "tako") m.rotation.set(rnd(0, 6.28), rnd(0, 6.28), rnd(0, 6.28));
      if (kind === "negi") { m.position.y += rnd(0, Math.min(0.25, (b.items.negi || 0) * 0.014)); m.rotation.x += rnd(-0.6, 0.6); flutter(m, "y"); }
      b.dry.add(m);
    }
  }
  const flutters = []; // ふわっと舞い落ちる具(ひらひら揺れながら、ゆっくり着地)
  function flutter(m, up) { const h = rnd(1.0, 1.6); flutters.push({ m, par: null, up, end: m.position.clone(), rot: m.rotation.clone(), h, t: 0, dur: rnd(0.55, 0.85), ph: rnd(0, 6.28), sw: rnd(0.08, 0.16) }); m.position[up] += h; }
  function flutterTick(dt) {
    for (let i = flutters.length - 1; i >= 0; i--) { const f = flutters[i], m = f.m; if (!f.par) f.par = m.parent; if (!m.parent || m.parent !== f.par) { flutters.splice(i, 1); continue; } /* 丸めて玉に入ったら、もう動かさない */ f.t += dt; const k = Math.min(1, f.t / f.dur), e = 1 - (1 - k) * (1 - k), s = (1 - k) * f.sw;
      m.position.copy(f.end); m.position[f.up] += f.h * (1 - e); const o = f.up === "z" ? ["x", "y"] : ["x", "z"]; m.position[o[0]] += Math.sin(f.ph + k * 9) * s; m.position[o[1]] += Math.cos(f.ph + k * 7) * s * 0.6;
      m.rotation.set(f.rot.x + Math.sin(f.ph + k * 11) * (1 - k) * 0.9, f.rot.y + (1 - k) * 2, f.rot.z + Math.cos(f.ph + k * 8) * (1 - k) * 0.8, f.rot.order);
      if (k >= 1 || !m.parent) flutters.splice(i, 1); }
  }
  const VOL = { tako: 0.12, tenkasu: 0.05, negi: 0.06, beni: 0.05, cheese: 0.08, choco: 0.08, banana: 0.08, ichigo: 0.09, budou: 0.06, mikan: 0.07 };
  function addVol(b, kind) { b.vol = (b.vol || 0) + VOL[kind]; if (b.fill > 0.05) b.fill = Math.min(2, b.fill + VOL[kind] * 0.25); }
  function addTako(b) {
    if (b.started) { toast("もう回したので入れられない"); return; }
    b.items.tako = (b.items.tako || 0) + 1; addVol(b, "tako"); if (b.fill <= 0.05) b.takoDry = (b.takoDry || 0) + 1; // 生地より先に入れたたこ(あとで、はみ出す)
    placeItem(b, takoMesh(), "tako", 0.35);
    blip(520, 0.08, "triangle", 0.06); jyu(b.fill > 0.05 ? 0.9 : 1.2); // たこ(水分多い) → じゅーっ
  }
  function addBits(b, kind) {
    if (b.started) { toast("もう回したので入れられない"); return; }
    const B = BIT[kind]; b.items[kind] = (b.items[kind] || 0) + 1; addVol(b, kind);
    for (let i = 0; i < B.n; i++) placeItem(b, makeBit(kind), kind, 0.8);
    blip(1400, 0.03, "square", 0.02); jyu((kind === "tenkasu" ? 0.5 : kind === "choco" ? 0.6 : 0.8) * (b.fill > 0.05 ? 0.85 : 1.15)); // 具が熱い所に落ちて、じゅーっ(生地なしの鉄板はもっと強く)
  }

  // ---------- ピックで回す ----------
  function tooEarly(b) { // まだ固まっていないのに回した → くずれる(2回くずすと、そのまま回す)
    b.broke++; b.sec[0] *= 0.6; blip(180, 0.15, "sawtooth", 0.05);
    return b.broke >= 2;
  }
  const AX = new THREE.Vector3(1, 0, 0), AZ = new THREE.Vector3(0, 0, 1), tmpQ = new THREE.Quaternion(), tmpQ2 = new THREE.Quaternion(), tmpM = new THREE.Matrix4();
  function applySize(b) { // 今の大きさ(生地ありは回すほど目標の大きさへ)。穴の中では底につく/大きいとふちに乗る
    const k = b.noBatter ? 1 : clamp(((b.formFrac ?? 0.5) - 0.5) / 0.5, 0, 1), sz = (b.sz0 ?? b.sz) + (b.sz - (b.sz0 ?? b.sz)) * k;
    b.ball.scale.setScalar(sz); b.tops.scale.setScalar(sz); b.sauce.scale.setScalar(sz); b.curSz = sz;
    if (b.holder.parent === pan && !b.lifting) b.holder.position.y = sz >= 1 ? (sz - 1) * HR * 0.8 : -(1 - sz) * HR * 0.97;
  }
  function rotBall(b, axis, ang) { // 鉄板の上で、どの向きにも転がす(前後=X軸 / 左右=Z軸)
    if (!ang) return;
    b.ball.quaternion.premultiply(tmpQ.setFromAxisAngle(axis, ang)); b.rotAcc += Math.abs(ang); shapeBall(b); if (b.sz && !b.noBatter) applySize(b); b.turns = Math.floor(b.rotAcc / (Math.PI / 2) + 0.05);
  }
  function rotateBy(b, ax, ay) { // 指でくるくる: 上下になぞる=前後に / 左右になぞる=横に / ななめ=ななめに
    if ((!ax && !ay) || !noBatterOK(b)) return;
    if (!b.started) startBall(b);
    if (b.rotLeft) { rotBall(b, AX, b.rotLeft); b.rotLeft = 0; }
    messAdd(b, Math.hypot(ax, ay)); // まだ固まっていないのに回すと、ぐちゃぐちゃ
    const before = b.turns; rotBall(b, AX, ay); rotBall(b, AZ, -ax);
    if (b.turns !== before) blip(700 + Math.random() * 120, 0.04, "triangle", 0.04); // コロッ
  }
  function messAdd(b, d) { // 下の面がまだ固まっていない(0.35未満)うちに回す → 形がゆがんで、生地が飛び散る
    // くずれるのは、最初に穴から持ち上げる(はじめの下の面が固まっているか)ときだけ。そのあとは殻ができているので大丈夫
    if (b.noBatter) return; // 具だけ: もともとボロボロ
    const left = Math.PI / 2 - b.rotAcc; if (left <= 0) return; const dd = Math.min(Math.abs(d), left);
    const stick = 1 - (b.oil || 0); // 油が足りないと、くっついてはがれにくい
    const k = Math.max(clamp((0.35 - b.sec[0]) / 0.35, 0, 1), stick * 0.55); if (k <= 0) return;
    const m = dd * k * 0.6; b.mess = Math.min(1.6, (b.mess || 0) + m); b.round = Math.max(0.2, b.round - m * 0.45);
    for (let i = 0; i < 1 + m * 6; i++) { const a = rnd(0, 6.28), r = HR * rnd(1.0, 1.7); sheetBlob(b.h.x + Math.cos(a) * r, b.h.z + Math.sin(a) * r, rnd(0.1, 0.25), 0.6); } // 飛び散った生地
    const now = performance.now(); if (now - (b.messTold || 0) > 1500) { b.messTold = now; if (b.sec[0] >= 0.35 && (b.oil || 0) < 0.6) toast("くっついた！ 油をひいてなかった…", 1100); /* まだ固まってない時の文字は出さない(形と音でわかる) */ blip(180, 0.15, "sawtooth", 0.05); }
    shapeBall(b); pokeTako(b);
  }
  function unClump(b) { // 具だけのかたまり → ばらけて、流した生地の上に浮かぶ(生地の中で、もう一度ちゃんと焼ける)
    const s = b.sz || 1, pieces = [...b.ball.children];
    for (const m of pieces) { b.ball.remove(m); let kind = null; m.traverse((o) => { if (o.userData.kind) kind = o.userData.kind; }); if (!kind) continue; m.scale.multiplyScalar(s); m.position.set(0, 0, 0); m.rotation.set(0, 0, 0);
      const a = rnd(0, 6.28), rr = Math.sqrt(Math.random()) * (kind === "tako" ? 0.35 : 0.8); m.position.set(Math.cos(a) * rr, Math.sin(a) * rr, kind === "tako" ? 0.06 : 0.03);
      if (FLAT[kind]) m.rotation.set(Math.PI / 2 + rnd(-0.25, 0.25), rnd(0, 6.28), rnd(-0.25, 0.25), "XYZ"); else if (kind !== "tako") m.rotation.set(rnd(0, 6.28), rnd(0, 6.28), rnd(0, 6.28)); b.extras.add(m); }
    if (b.dry) { pan.remove(b.dry); b.dry = null; } sheetErase(b.h.x, b.h.z, HR * 0.95); /* 穴の内側にたまっていた分は、液の中へ */
    b.started = false; b.noBatter = false; b.ball.visible = false; b.ball.material.visible = true; b.ball.quaternion.identity(); b.ball.scale.setScalar(1); b.tops.scale.setScalar(1); b.sauce.scale.setScalar(1);
    b.holder.position.y = 0; b.rotAcc = 0; b.rotLeft = 0; b.turns = 0; b.round = 1; b.mess = 0; b.basePos = null; b.set = null; b.dn = null; b.cap = null; b.formFrac = undefined; b.sz = undefined; b.sz0 = undefined; b.curSz = undefined; b.sec = [0, 0, 0, 0]; b.fill = Math.max(b.fill, 0.1);
    for (const t of b.tints) t.r /= 2.6; // 生地なし用に広げた色うつりを元に
  }
  function noBatterOK(b) { // 生地を入れずに回した: 具があれば「具だけのかたまり」に / なければ、からっぽ
    if (b.made) return true;
    if (!b.dry || !b.dry.children.length) { const now = performance.now(); if (now - (b.emptyTold || 0) > 1200) { b.emptyTold = now; toast("からっぽ…（生地も具もない）", 1000); } return false; }
    b.made = true; b.noBatter = true; if (!startedAt) startedAt = performance.now(); return true;
  }
  function turnBall(b) { // タップ: 90°
    if (!noBatterOK(b)) return;
    if (b.rotLeft) { rotBall(b, AX, b.rotLeft); b.rotLeft = 0; } // 回している途中にもう一度タップ → 今の回転をすぐ終わらせて、続けて回す
    if (!b.started) startBall(b);
    messAdd(b, Math.PI / 6);
    b.rotLeft = Math.PI / 6; // タップはちょっとつつくだけ(30°)
    blip(760, 0.06, "triangle", 0.06);
  }
  function startBall(b) { // 液体 → 丸いたこ焼き(まわりにあふれた生地は、くるっと中に巻きこむ)
    if (b.started) return; b.started = true; if (b.dry) b.dry.visible = false;
    b.disk.visible = false; b.puddle.visible = false; b.ball.visible = true; sheetErase(b.h.x, b.h.z, HR * 1.02); tucks.push({ b, t: 0 }); // 穴のふちだけ消して、まわりの生地は少しずつ巻きこむ
    for (const m of b.bubbles) b.disk.remove(m); b.bubbles.length = 0;
    const f = b.noBatter ? 0.95 : b.fill;
    let round = f < 0.95 ? clamp(1 - (0.95 - f) * 1.6, 0.25, 1) : f > 1.45 ? clamp(1 - (f - 1.45) * 0.5, 0.55, 1) : 1;
    round -= b.broke * 0.18; b.round = clamp(round, 0.2, 1);
    // 丸くないほど、でこぼこ＆半分つぶれ
    const p = b.ball.geometry.attributes.position, k = 1 - b.round;
    if (!b.origPos) b.origPos = Float32Array.from(p.array); else { p.array.set(b.origPos); } // 何度丸めても、もとの球から
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i), y = p.getY(i), z = p.getZ(i); const n = 1 + (Math.sin(x * 7 + b.h.i) * Math.cos(z * 6) * 0.08 + rnd(-0.03, 0.03)) * k * 2.2;
      if (f < 0.95 && y > 0) y *= lerp(1, 0.45, k); // 生地が足りない → 上が平たい
      p.setXYZ(i, x * n, y * n, z * n);
    }
    b.basePos = Float32Array.from(p.array); b.cap = new Uint8Array(p.count);
    b.set = new Float32Array(p.count); { const L0 = Math.min(0, -HR + Math.min(b.fill || 1, 1) * HR), k0 = clamp(b.sec[0] / 0.35, 0.25, 1); for (let i = 0; i < p.count; i++) { const y = p.getY(i); if (y < L0 - 0.02) b.set[i] = y < L0 - 0.25 ? 1 : k0; } } // 穴の中で生地にひたっていた所は、もう(ほぼ)殻
    if (b.noBatter) b.set.fill(1);
    // 表面の点ごとの焼け具合(dn): 穴の中で焼けていた下側から引きつぐ
    b.dn = new Float32Array(p.count); const side = (b.sec[1] + b.sec[3]) / 2;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), c = -y / (Math.hypot(x, y, z) || 1); b.dn[i] = b.sec[0] * Math.max(0, c) ** 1.2 + side * Math.max(0, 1 - Math.abs(c)) * 0.6; }
    // 具の色うつり: 表面の点ごとに、近い色の具の色をまぜる
    if (b.noBatter) for (const t of b.tints) t.r *= 2.6; // 生地なし: 具の色がほぼ全体に
    b.tintK = new Float32Array(p.count); b.tintC = new Float32Array(p.count * 3); const dv = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) { dv.set(p.getX(i), p.getY(i), p.getZ(i)).normalize(); let best = 0, col = null; for (const t of b.tints) { const k = Math.max(0, 1 - Math.acos(clamp(dv.dot(t.dir), -1, 1)) / t.r) * t.s * (b.noBatter ? 1.6 : 1); if (k > best) { best = k; col = t.col; } } if (col) { b.tintK[i] = Math.min(0.9, best); b.tintC[i * 3] = col.r; b.tintC[i * 3 + 1] = col.g; b.tintC[i * 3 + 2] = col.b; } }
    if (b.noBatter && b.tints.length) for (let i = 0; i < p.count; i++) { if (b.tintK[i] < 0.85) { const t = b.tints[i % b.tints.length].col; if (!b.tintK[i]) { b.tintC[i * 3] = t.r; b.tintC[i * 3 + 1] = t.g; b.tintC[i * 3 + 2] = t.b; } b.tintK[i] = 0.88; } } // 生地なし: 本体も具の色(生地の色は見せない)
    if (b.noBatter) { // 生地なし: 小さい具のかたまり(具がぜんぶ表面に出る)
      const n = b.dry ? b.dry.children.length : 1, sz = clamp((0.02 + 0.04 * Math.sqrt(n)) * 1.7, 0.2, 0.95); b.sz = sz; /* 具の数だけのかたまり(少しなら小さい) */ b.rotAcc = Math.PI * 1.3; b.round = 0.3; b.ball.scale.setScalar(sz);
      b.ball.material.visible = false; // 生地の玉は見せない: 具そのものが、ぎゅっと集まって丸くなる
      if (b.dry) { for (const m of [...b.dry.children]) { b.dry.remove(m); const d2 = new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).normalize(); m.position.copy(d2).multiplyScalar(HR * 0.97 * Math.max(0.35, Math.pow(Math.random(), 0.35))); m.rotation.set(rnd(0, 6.28), rnd(0, 6.28), rnd(0, 6.28)); m.scale.multiplyScalar(1 / sz); b.ball.add(m); } }
    }
    if (!b.noBatter) { // 生地の量で大きさが変わる(ちょうど=1・満タン=1.45倍・少ないと小さめ)。大きいと穴のふちに乗るので少し浮く
      b.sz = f < 1 ? 0.8 + 0.2 * f : 1 + (Math.min(f, 2) - 1) * 0.25; b.sz0 = 1; // 最初は穴の大きさ → 回して、まわりの生地を巻きこむほど、だんだん大きく
    }
    applySize(b);
    shapeBall(b); // 元の形をおぼえて、回した分だけ丸くしていく
    if (f > 1.45) addFins(b); // 入れすぎ → まわりにはみ出た「ひれ」
    if (!b.noBatter) { addStickOuts(b); pokeTako(b); }
    paintBall(b); // 色(具の色うつり)をすぐ反映
  }
  // 具の入れすぎ → 表面からはみ出す(たこ焼きと一緒に回る)
  function stickAt(b, m, out) { // 表面のどこかに、半分うまった感じで(はじめは液体の面=上側をさけて、下〜横に)
    const a = rnd(0, 6.28), y = rnd(-0.95, 0.25), r = Math.sqrt(1 - y * y), dir = new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r);
    m.position.copy(dir).multiplyScalar(HR * (0.9 + out)); m.lookAt(dir.clone().multiplyScalar(3)); b.ball.add(m); b.sticks = (b.sticks || 0) + 1;
  }
  function addStickOuts(b) {
    const nt = b.takoDry || 0; for (let i = 0; i < nt - 1; i++) { /* 生地より先に入れたたこが2個以上 → 多い分もはみ出す(生地のあとのたこは中に) */ const m = takoMesh(); m.traverse((o) => { if (o.isMesh) o.userData.kind = "tako"; }); m.scale.setScalar(1.15); stickAt(b, m, 0.08); b.takoOut = (b.takoOut || 0) + 1; } // たこ3個以上 → 多い分がはみ出す
    for (const k in BIT) { const c = b.items[k] || 0; for (let i = 0; i < (c - 2) * (BIT[k].big ? 1 : 2); i++) { const m = makeBit(k); m.traverse((o) => { if (o.isMesh) o.userData.kind = k; }); m.scale.multiplyScalar(1.3); stickAt(b, m, 0.03); } } // 同じ具を3回以上 → はみ出す
  }
  function pokeTako(b) { // 丸めるのが下手(形がくずれた) → たこが少しだけ顔を出す
    if (b.poked || !(b.takoDry > 0)) return; // はみ出すのは、生地より先にたこを入れた時だけ(生地のあとに入れたたこは、ちゃんと中に包まれる)
    b.poked = true; const m = takoMesh(); m.traverse((o) => { if (o.isMesh) o.userData.kind = "tako"; }); stickAt(b, m, 0.02); b.takoOut = (b.takoOut || 0) + 1;
  }
  const COOKED = { tako: 0x8a3a24, tenkasu: 0x9a5a1c, negi: 0x4a5a1c, beni: 0x8a2a2a, cheese: 0xc98a2a, choco: 0x2a1006, banana: 0xa86a24, ichigo: 0x8a1e22, budou: 0x3a1530, mikan: 0xb5651a }; // 焼けた時の色
  function cookItems(b) { // たこ焼きにくっついた具・穴の底の具: 焼けた分だけ色が変わる
    const d = b.started ? (b.dn ? avgDn(b) : 0) : b.sec[0];
    const k = clamp((d - 0.2) / 1.1, 0, 1), burn = clamp((d - 1.4) / 0.6, 0, 1);
    const each = (o) => o.traverse((m) => { if (!m.isMesh || !m.userData.kind) return; if (!m.userData.own) { m.material = Array.isArray(m.material) ? m.material.map((x) => x.clone()) : m.material.clone(); m.userData.own = true; m.userData.base = (Array.isArray(m.material) ? m.material : [m.material]).map((x) => x.color.clone()); }
      (Array.isArray(m.material) ? m.material : [m.material]).forEach((x, j) => { x.color.copy(m.userData.base[j]).lerp(tmpC2.setHex(COOKED[m.userData.kind] || 0x6a3a1a), k * 0.85).lerp(COL.burnt, burn * 0.8); }); });
    each(b.ball); if (b.dry) each(b.dry);
  }
  function avgDn(b) { let t = 0, n = 0; for (let i = 0; i < b.dn.length; i += 7) if (!b.cap[i]) { t += b.dn[i]; n++; } return n ? t / n : 0; }
  function addFins(b) {
    const m = new THREE.Mesh(new THREE.TorusGeometry(HR * 0.98, 0.12, 6, 24), new THREE.MeshStandardMaterial({ color: 0xd9a75a, roughness: 0.7 }));
    m.scale.z = 0.5; b.ball.add(m);
  }

  // ---------- 焼く ----------
  const tmpC = new THREE.Color(), tmpC2 = new THREE.Color();
  // だんだん丸くなる(本物と同じしくみ): 穴の中で生地にひたっている所だけが、少しずつ固まって殻になる。
  // まだ固まっていない所は液体 → いつも「穴の生地の高さ」で平らな面になる(玉をどう回しても、液は下にたまる)。
  // だから回して、まだの所を穴の中へ入れていくと、殻がだんだん広がって、最後にまんまる
  const shV = new THREE.Vector3();
  function shapeBall(b, dt = 0) {
    if (!b.basePos) return;
    const p = b.ball.geometry.attributes.position, B = b.basePos, mess = b.mess || 0, n = p.count;
    if (!b.set) { b.set = new Float32Array(n); if (b.noBatter) b.set.fill(1); }
    const s = b.curSz || b.sz || 1, hy = b.holder.parent === pan ? b.holder.position.y : 0;
    const Lh = Math.min(0, -HR + Math.min(b.fill || 1, 1) * HR) - hy; // 液の高さ(この玉から見て)
    const q = b.ball.quaternion, qi = tmpQ2.copy(q).invert(), k = dt * 0.75 * heatK; // 中火で約1.3秒ひたすと固まる
    let setN = 0;
    for (let i = 0; i < n; i++) {
      shV.set(B[i * 3], B[i * 3 + 1], B[i * 3 + 2]);
      if (b.set[i] >= 1) { p.setXYZ(i, shV.x, shV.y, shV.z); b.cap[i] = 0; setN++; continue; }
      shV.multiplyScalar(s).applyQuaternion(q); // いまの向き(穴の中の座標)
      if (shV.y < Lh - 0.03 && k > 0) b.set[i] = Math.min(1, b.set[i] + k * clamp((Lh - shV.y) * 6, 0.3, 1)); // 生地にひたっている → 固まっていく
      if (shV.y > Lh) { // まだ液体 → 平らな液の面(上の部分を、そのまま円盤にひらく=面が折れ重ならない)
        const r = shV.length() || 1, th = Math.acos(clamp(shV.y / r, -1, 1)), thc = Math.acos(clamp(Lh / r, -1, 1)), rc = Math.sqrt(Math.max(0, r * r - Lh * Lh)), rho = rc * th / Math.max(1e-4, thc), h = Math.hypot(shV.x, shV.z) || 1;
        shV.set(shV.x / h * rho, Lh, shV.z / h * rho);
      }
      shV.applyQuaternion(qi).multiplyScalar(1 / s); p.setXYZ(i, shV.x, shV.y, shV.z); b.cap[i] = 1;
    }
    b.formFrac = setN / n;
    if (mess > 0) for (let i = 0; i < n; i++) { // ぐちゃぐちゃ: でこぼこに・少しつぶれる
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i), m2 = 1 + mess * 0.17 * (Math.sin(x * 4.3 + b.h.i * 1.7) * Math.cos(z * 3.9 - y * 2.7) + Math.sin(x * 9.1 - z * 6.7) * 0.4 + Math.sin(i * 12.9898) * 0.12);
      p.setXYZ(i, x * m2 * (1 + mess * 0.08), y * m2 * (1 - mess * 0.18), z * m2 * (1 + mess * 0.08));
    }
    p.needsUpdate = true; b.ball.geometry.computeVertexNormals(); b.ball.geometry.boundingSphere = null; b.ball.geometry.boundingBox = null; paintBall(b); /* 形が変わったら、当たり判定の範囲も作りなおす(奥のたこ焼きにもトッピングできるように) */
  }
  function paintBall(b) { // 表面の点ごとの焼け具合を、頂点の色に
    const g = b.ball.geometry, n = g.attributes.normal, c = g.attributes.color; if (!b.dn) return;
    for (let i = 0; i < n.count; i++) {
      const d = b.dn[i];
      if (b.cap && b.cap[i]) { tmpC.copy(COL.batter).lerp(liquidMat.color, 0.6); c.setXYZ(i, tmpC.r, tmpC.g, tmpC.b); continue; } // まだ液体の所
      doneColor(d + Math.sin(i * 12.9898) * 0.04, tmpC);
      if (b.tintK && b.tintK[i] > 0) { tmpC2.setRGB(b.tintC[i * 3], b.tintC[i * 3 + 1], b.tintC[i * 3 + 2]); if (d > 1.0) tmpC2.lerp(COL.brown, Math.min(1, (d - 1) * 1.5)); tmpC.lerp(tmpC2, b.tintK[i]); } // 具の色がうつった所(こげればその色も茶色く)
      c.setXYZ(i, tmpC.r, tmpC.g, tmpC.b);
    }
    c.needsUpdate = true; sauceOverlay(b);
  }
  // こげると、けむりがもくもく
  const smokes = [], smokeTex = (() => { const c = document.createElement("canvas"); c.width = c.height = 64; const g = c.getContext("2d"), gr = g.createRadialGradient(32, 32, 2, 32, 32, 30); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  function puff(x, y, z, k) { if (smokes.length > 90) return; const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, color: new THREE.Color().setHSL(0, 0, 0.55 - 0.35 * k), transparent: true, opacity: 0, depthWrite: false })); m.position.set(x + rnd(-0.3, 0.3), y, z + rnd(-0.3, 0.3)); m.userData = { t: 0, life: rnd(1.6, 2.6), vx: rnd(-0.15, 0.15), k }; m.scale.setScalar(0.5); scene.add(m); smokes.push(m); }
  function smokeTick(dt) { for (let i = smokes.length - 1; i >= 0; i--) { const m = smokes[i], u = m.userData; u.t += dt; const f = u.t / u.life; m.position.y += dt * (1.1 + f); m.position.x += u.vx * dt; m.scale.setScalar(0.5 + f * 1.8); m.material.opacity = Math.min(1, f * 5) * (1 - f) * (0.35 + 0.35 * u.k); if (f >= 1 || stage !== "cook") { scene.remove(m); m.material.dispose(); smokes.splice(i, 1); } } }
  function cookTick(dt) {
    if (stage !== "cook" || !startedAt) return;
    cookT += dt;
    const rate = 0.075 * heatK; let any = false; // 中火: 1面がきつね色(1.0)まで約10秒・こげ(1.6)まで約16秒
    for (const b of balls) {
      if (!b.made || b.onPlate || b.lifting) continue; any = true;
      if (b.rotLeft > 0) { const st = Math.min(b.rotLeft, (Math.PI / 2) * dt / 0.22); b.rotLeft -= st; rotBall(b, AX, st); } // タップのひと押し
      let downMax = 0;
      if (!b.started) { // 穴の中の液体: はじめの下の面(sec[0])と、横がうっすら
        b.sec[0] += rate * dt * 0.38; b.sec[1] += rate * dt * 0.25 * 0.38; b.sec[3] += rate * dt * 0.25 * 0.38; // 液体のうちは、ゆっくり(具を入れる時間をたっぷり)
      } else { // 丸くなってから: 表面の点ごとに、いま下を向いている所が焼ける(どの向きに回しても)
        if (!b.noBatter && (b.formFrac ?? 0) < 1) { shapeBall(b, dt); applySize(b); } // まだの所が穴の中で、少しずつ固まる
        const e = tmpM.makeRotationFromQuaternion(b.ball.quaternion).elements, n = b.ball.geometry.attributes.normal, dn = b.dn;
        for (let i = 0; i < n.count; i++) {
          if (b.cap[i]) continue;
          const wy = e[1] * n.getX(i) + e[5] * n.getY(i) + e[9] * n.getZ(i); // その点が、いまどれだけ下を向いているか
          if (wy < -0.15) { dn[i] += rate * dt * wy * wy; if (wy < -0.8 && dn[i] > downMax) downMax = dn[i]; } else if (wy < 0.35) dn[i] += rate * dt * 0.12; // 穴のふちに当たる横も少し
        }
      }
      // 液体の見た目(穴の中の生地の高さ・あふれ)
      if (!b.started) {
        const f = Math.min(b.fill, 1.02), y = -HR + f * HR, rr = Math.sqrt(Math.max(0.01, HR * HR - y * y));
        doneColor(b.sec[0] * 0.55, b.edge.material.color); // ふちから色づく
        if (b.sec[0] > 0.2 && b.sec[0] < 1.4 && b.bubbles.length < 5 && Math.random() < dt * 2.2) { const m = new THREE.Mesh(bubbleGeo, bubbleMat); const a = rnd(0, 6.28), r2 = Math.sqrt(Math.random()) * 0.8; m.position.set(Math.cos(a) * r2, Math.sin(a) * r2, 0.012); m.userData.t = 0; m.scale.setScalar(0.3); b.disk.add(m); b.bubbles.push(m); } // ぷつぷつ泡
        for (let i = b.bubbles.length - 1; i >= 0; i--) { const m = b.bubbles[i]; m.userData.t += dt; const t = m.userData.t / 1.3; m.scale.setScalar((0.3 + t) / rr); if (t >= 1) { b.disk.remove(m); b.bubbles.splice(i, 1); } }
        b.disk.visible = b.fill > 0.03; b.disk.position.set(b.h.x, y + 0.01, b.h.z); b.disk.scale.setScalar(rr);
        b.extras.scale.set(1 / rr, 1 / rr, 1); // 具は円の大きさで伸びないように
        const ov = Math.max(0, b.fill - 1); b.puddle.visible = ov > 0.02; b.puddle.scale.setScalar(HR * (1 + ov * 0.55));
        const c = b.disk.material.color; doneColor(Math.min(0.2, b.sec[0] * 0.15), c); b.puddle.material.color.copy(c);
        if (b.sec[0] > 1.3 && !b.smokeTold) { b.smokeTold = true; toast("💨 下がこげてきた！ 回して！", 1800); }
      } else paintBall(b);
      if ((b.cookItemsT = (b.cookItemsT || 0) + dt) > 0.4) { b.cookItemsT = 0; cookItems(b); } // 具の色も焼けて変わる
      { const burn = b.started ? clamp((downMax - 1.3) / 0.5, 0, 1) : clamp((b.sec[0] - 1.15) / 0.5, 0, 1); if (burn > 0 && Math.random() < dt * (2 + burn * 7)) { const w = b.holder.getWorldPosition(new THREE.Vector3()); puff(w.x, 0.3 + (b.started ? 0.6 : 0), w.z, burn); } } // こげ具合で、けむり
      if (b.started && downMax > 1.45 && !b.burnTold) { b.burnTold = true; toast("💨 こげてる！！ 回して！", 1600); }
    }
    fire.intensity = any ? 1.2 * heatK : 0;
    if (any && (sheetCookT += dt) > 0.2) { const k = rate * sheetCookT * 0.75; for (let i = 0; i < shN; i++) if (sheetA[i] >= 0.02) sheetCV[i] += k; sheetCookT = 0; sheetColors(); } // こぼれた生地: こぼれた時から焼けはじめる(あとからこぼした所は白いまま)
    spreadTick(dt);
    if (sheetDirty) { sheetTex.needsUpdate = true; sheetDirty = false; sheetHeights(false); }
    if (sizzleG && ac) sizzleG.gain.setTargetAtTime(any ? 0.02 + 0.015 * heatK : 0, ac.currentTime, 0.2);
    const ready = balls.filter((b) => b.made).length;
    if (ready && tool !== "pick" && tool !== "carry" && balls.some((b) => b.made && b.sec[0] > 0.6 && !b.started) && !buildPanel.pickTold) { buildPanel.pickTold = true; toast("🥢 そろそろ回せそう！ 「回す」を押して、指でくるっと", 5000); }
  }

  // ---------- お皿 ----------
  const PLATE_COOK = { z: PD / 2 + 4.0, y: -1.9 + 1.154 * 0.6, s: 0.6 }, SLOT = [];
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) SLOT.push(new THREE.Vector3((c - 1.5) * 3.15, 0, (r - 0.5) * 2.9));
  const PLATE_BALL = 1.6; // 焼いている時のお皿の上の玉の大きさ(お皿は0.6倍なので、玉は戻して少し大きめ)
  const ballR = (b) => (b.curSz || b.sz || 0.62) * HR * 0.97 * b.holder.scale.x;
  const extV = new THREE.Vector3();
  function ballExt(b) { // 今の形・向きで、玉のいちばん下と上(お皿の座標・玉の中心から)。半分の玉や平らな面が下でも、ちゃんと底につく
    const p = b.ball.geometry.attributes.position, k = b.ball.scale.x * b.holder.scale.x; let lo = 1e9, hi = -1e9;
    for (let i = 0; i < p.count; i += 3) { extV.set(p.getX(i), p.getY(i), p.getZ(i)).applyQuaternion(b.ball.quaternion); const y = extV.y * k; if (y < lo) lo = y; if (y > hi) hi = y; }
    return { lo, hi };
  }
  const FLOOR = -0.95 + 0.03; // 舟のお皿の底(お皿の座標)
  function platePlace(b, want) { // 置きたい所のいちばん近い「空いている場所」にきれいに並べる。たこ焼きの真上ではなしたら、その上に重ねる
    pan.remove(b.holder); plate.add(b.holder); b.holder.scale.setScalar(PLATE_BALL); b.onPlate = false;
    const e = ballExt(b), on = balls.filter((o) => o !== b && o.onPlate), r = ballR(b);
    const top = want && on.map((o) => [o, Math.hypot(want.x - o.holder.position.x, want.z - o.holder.position.z)]).filter(([o, d]) => d < ballR(o) * 0.75).sort((p1, p2) => p1[1] - p2[1])[0];
    const isFree = (q) => on.every((o) => o.onPlate && Math.hypot(q.x - o.holder.position.x, q.z - o.holder.position.z) > (r + ballR(o)) * 0.85 || o.holder.position.y > FLOOR + ballR(o) * 1.5);
    let x, z, y;
    const free = SLOT.filter(isFree).sort((q1, q2) => (want ? Math.hypot(q1.x - want.x, q1.z - want.z) - Math.hypot(q2.x - want.x, q2.z - want.z) : 0))[0];
    if (top || !free) { // 重ねる: 下の玉の上にのせる
      const o = top ? top[0] : on.sort((o1, o2) => o1.holder.position.y - o2.holder.position.y)[0]; const oe = ballExt(o);
      x = o.holder.position.x + rnd(-0.15, 0.15); z = o.holder.position.z + rnd(-0.15, 0.15); y = o.holder.position.y + oe.hi - e.lo - 0.05;
    } else { x = free.x + rnd(-0.1, 0.1); z = free.z + rnd(-0.08, 0.08); y = FLOOR - e.lo; } // お皿の底に、ぴったり
    b.onPlate = true; b.slot = 0; b.holder.position.set(x, y, z);
    b.disk.visible = false; b.puddle.visible = false; for (const m of [...b.extras.children]) b.extras.remove(m); if (b.dry) b.dry.visible = false;
    return true;
  }
  const liftV = new THREE.Vector3();
  function liftTo(b, e) { const p = pointAt(e, 0.6); if (p) b.holder.position.set(p.x, 1.6, p.z); }
  function liftTick(now) { // 動かさずに長押し → たこ焼きを持ち上げる
    return; // (長押しの持ち上げは、やめた: 運ぶのは「お皿に盛る」で)
  }
  function startLift(d) {
    if (d.b.onPlate) { const b = d.b; b.fromPlate = b.holder.position.clone(); const w = b.holder.getWorldPosition(new THREE.Vector3()); plate.remove(b.holder); pan.add(b.holder); b.holder.position.copy(w); b.holder.scale.setScalar(1); b.onPlate = false; } else d.b.fromPlate = null;
    d.lift = true; d.b.lifting = true; d.b.rotLeft = 0; d.b.holder.position.y = 1.6; blip(900, 0.06, "triangle", 0.05); 
  }
  function dropBall(b, e) { // お皿の上ではなす → お皿へ / それ以外 → 穴にもどる
    const p = pointAt(e, 0); let ok = false; b.lifting = false;
    if (p && Math.abs(p.x) < 6.8 * PLATE_COOK.s + 0.6 && Math.abs(p.z - PLATE_COOK.z) < 3.2 * PLATE_COOK.s + 0.6) { const loc = plate.worldToLocal(p.clone()); ok = platePlace(b, loc); if (ok) { blip(520, 0.08, "triangle", 0.06); const left = balls.filter((x) => x.made && !x.onPlate).length; /* 文字は出さない(じゃまなので) */ if (!left) setTimeout(() => { if (stage === "cook") toPlate(true); }, 900); } }
    if (!ok) { if (b.fromPlate) { platePlace(b, b.fromPlate); } else { b.holder.position.set(b.h.x, 0, b.h.z); applySize(b); } } // お皿から持ち上げたのは、お皿にもどす
  }
  function toPlate(auto) {
    const made = balls.filter((b) => b.made);
    if (!made.length) { toast("まだ何も焼いてないよ"); return; }
    { const left = made.filter((b) => !b.onPlate).length; // 自分でのせたい人のために: いきなり全部はもらない
      if (left && !auto && !confirm(`鉄板にまだ ${left}個 あります。
残りもぜんぶお皿にもって、トッピングへ進みますか？

（自分でのせる時は「キャンセル」→「回す」を選んで、たこ焼きを押したまま手前のお皿へ引っぱってはなす）`)) { toast("たこ焼きを押したまま、お皿へ引っぱる", 1600); return; } }
    const raw = made.filter((b) => !b.noBatter && (b.formFrac ?? 0) < 0.92).length;
    if (raw && !auto && !confirm(`まだ回していない（半分の）たこ焼きが ${raw}個 あります。お皿にもりますか？`)) return;
    for (const b of made) { if (!b.started) startBall(b); paintBall(b); }
    pitcher.visible = false; stream.visible = false;
    stage = "top"; tool = "sauce"; $("step").textContent = "🍽 トッピング";
    fire.intensity = 0; if (sizzleG && ac) sizzleG.gain.setTargetAtTime(0, ac.currentTime, 0.2);
    // お皿へ移す(上から見えるのは、いま上にある面)
    plate.visible = true; pan.visible = false; camGoal = camPlate; plate.position.set(0, 0, 0); plate.scale.setScalar(PLATE_COOK.s); // お皿は小さめのまま → たこ焼きが大きく見える
    for (const b of made) if (!b.onPlate) platePlace(b, null); // 自分でのせた所はそのまま・残りは空いている所へ
    for (const b of balls) if (!b.made) { b.disk.visible = false; b.puddle.visible = false; }
    if (toothpicks && made[0]) { toothpicks.position.copy(made[Math.min(made.length - 1, 1)].holder.position); toothpicks.scale.setScalar(PLATE_BALL); toothpicks.visible = true; } // つまようじを1個にさしておく
    buildPanel();
  }
  const sauceC = new THREE.Color(0x4e1806), sauceC2 = new THREE.Color(0x2c0c02); // とろっとした赤茶色のソース(重ねると、こく)
  const sauceL = new THREE.Vector3();
  const ketC = new THREE.Color(0xa80c14), ketC2 = new THREE.Color(0x76060a);
  function brushKetchup(b, wp) { // ケチャップ: なぞった所に、赤いのがのる
    const g = b.ball.geometry, p = g.attributes.position; if (!b.ketV) b.ketV = new Float32Array(p.count);
    b.ball.worldToLocal(sauceL.copy(wp)); const R = 0.3;
    for (let i = 0; i < p.count; i++) { const d = Math.hypot(p.getX(i) - sauceL.x, p.getY(i) - sauceL.y, p.getZ(i) - sauceL.z); if (d < R) b.ketV[i] = Math.min(1.6, b.ketV[i] + 0.2 * Math.pow(1 - d / R, 0.7)); }
    let t = 0; for (let i = 0; i < p.count; i++) t += Math.min(1, b.ketV[i]); b.ketchupAmt = t / p.count * 2.4; paintBall(b);
  }
  function brushSauce(b, wp) { // なぞった所にだけ、少しずつソースがのる(何回も重ねると、こく・広く)
    const g = b.ball.geometry, p = g.attributes.position; if (!b.sauceV) b.sauceV = new Float32Array(p.count);
    b.ball.worldToLocal(sauceL.copy(wp)); const R = 0.42;
    for (let i = 0; i < p.count; i++) { const d = Math.hypot(p.getX(i) - sauceL.x, p.getY(i) - sauceL.y, p.getZ(i) - sauceL.z); if (d < R) { b.sauceV[i] = Math.min(1.6, b.sauceV[i] + 0.16 * Math.pow(1 - d / R, 0.7)); if (b.sauceV[i] > 1.5 && d < R * 0.3) maybeDrip(b, i); } } // こく塗ると、垂れる
    let t = 0; for (let i = 0; i < p.count; i++) t += Math.min(1, b.sauceV[i]); b.sauceAmt = Math.min(1.6, t / p.count * 2.4 + (b.sauceV.reduce((x, v) => x + Math.max(0, v - 1), 0) / p.count) * 2); // 採点用: 上半分をちょうど塗ると約1.2
    updSauce(b);
  }
  // ソースが垂れる: こく塗った所から、しずくが下へつーっと流れて、跡が残る
  const drips = [], dripMat = new THREE.MeshStandardMaterial({ color: 0x3a1a08, roughness: 0.18, metalness: 0.05 }), dripGeo = new THREE.SphereGeometry(0.07, 10, 8), dV = new THREE.Vector3(), dDown = new THREE.Vector3(), dQ = new THREE.Quaternion();
  function maybeDrip(b, i) {
    if (drips.length > 12 || (b.dripN || 0) >= 2 || Math.random() > 0.06) return; b.dripN = (b.dripN || 0) + 1; // 垂れるのは、こく塗った時に たまに(1個に2本まで)
    const p = b.ball.geometry.attributes.position, dir = new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i)); const r = dir.length() || 0.97; dir.normalize();
    const m = new THREE.Mesh(dripGeo, dripMat); b.ball.add(m); drips.push({ b, dir, r, m, t: 0, life: rnd(0.9, 1.4), sp: rnd(0.35, 0.5) });
  }
  function dripTick(dt) {
    for (let k = drips.length - 1; k >= 0; k--) {
      const d = drips[k], b = d.b; d.t += dt;
      dQ.copy(b.ball.quaternion).invert(); dDown.set(0, -1, 0).applyQuaternion(dQ); // 玉から見た「下」
      const ax = dV.crossVectors(d.dir, dDown); const sn = ax.length(); if (sn > 1e-3) { ax.multiplyScalar(1 / sn); d.dir.applyAxisAngle(ax, Math.min(Math.asin(Math.min(1, sn)), d.sp * dt * Math.min(1, 2.2 * (1 - d.t / d.life)))); }
      d.m.position.copy(d.dir).multiplyScalar(d.r + 0.025); // しずく
      const p = b.ball.geometry.attributes.position, v = b.sauceV; if (v) for (let i = 0; i < p.count; i++) { const dd = Math.hypot(p.getX(i) / d.r - d.dir.x, p.getY(i) / d.r - d.dir.y, p.getZ(i) / d.r - d.dir.z); if (dd < 0.13) v[i] = Math.max(v[i], 0.9 * (1 - dd / 0.13) + 0.2); } // 流れた跡
      if ((d.paintT = (d.paintT || 0) + dt) > 0.12) { d.paintT = 0; paintBall(b); }
      if (d.t >= d.life || dDown.dot(d.dir) > 0.97) { d.m.scale.multiplyScalar(0.98); if (d.t >= d.life + 0.6 || !b.ball.parent) { b.ball.remove(d.m); drips.splice(k, 1); paintBall(b); } }
    }
  }
  function updSauce(b) { // 塗った分だけ色をのせる(重ねた所は、こい色)
    paintBall(b);
  }
  function sauceOverlay(b) {
    const v = b.sauceV || [], c = b.ball.geometry.attributes.color; let any = false; if (!b.sauceV && !b.ketV) return;
    for (let i = 0; i < v.length; i++) { if (v[i] <= 0.01) continue; any = true; const k = Math.min(1, v[i] / 0.35), e = k * k * (3 - 2 * k); tmpC2.copy(sauceC).lerp(sauceC2, clamp((v[i] - 0.6) / 1.0, 0, 1)); tmpC.setRGB(c.getX(i), c.getY(i), c.getZ(i)).lerp(tmpC2, 0.97 * e); c.setXYZ(i, tmpC.r, tmpC.g, tmpC.b); }
    const kv = b.ketV; if (kv) for (let i = 0; i < kv.length; i++) { if (kv[i] <= 0.01) continue; any = true; const k = Math.min(1, kv[i] / 0.35), e = k * k * (3 - 2 * k); tmpC2.copy(ketC).lerp(ketC2, clamp((kv[i] - 0.6) / 1.0, 0, 1)); tmpC.setRGB(c.getX(i), c.getY(i), c.getZ(i)).lerp(tmpC2, 0.97 * e); c.setXYZ(i, tmpC.r, tmpC.g, tmpC.b); } // ケチャップ(ソースの上)
    if (any) { c.needsUpdate = true; b.ball.material.roughness = 0.14; b.ball.material.metalness = 0.04; } // ソースでつやつや
  }
  const mayoMat = new THREE.MeshStandardMaterial({ color: 0xf6ead0, roughness: 0.3 }), mayoGeo = new THREE.SphereGeometry(0.075, 8, 6);
  const mayoSeg = new THREE.CylinderGeometry(1, 1, 1, 10, 1, true), mayoJoint = new THREE.SphereGeometry(1, 10, 8), mUp = new THREE.Vector3(0, 1, 0);
  function mayoStroke(e, first) { // マヨ: 前の指の位置との間を細かくうめて、つながった線にする(速くなぞっても、とぎれない)
    const r = cv.getBoundingClientRect(), x1 = e.clientX, y1 = e.clientY, prev = first ? null : down.mayoXY;
    const steps = prev ? Math.max(1, Math.ceil(Math.hypot(x1 - prev[0], y1 - prev[1]) / 4)) : 1;
    for (let k = 1; k <= steps; k++) {
      const x = prev ? prev[0] + (x1 - prev[0]) * k / steps : x1, y = prev ? prev[1] + (y1 - prev[1]) * k / steps : y1;
      ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(balls.filter((b) => b.ball.visible).map((b) => b.ball))[0]; if (!hit) { down.mayoBall = null; continue; }
      const b = balls.find((q) => q.ball === hit.object); addMayo(b, hit.point, down.mayoBall !== b); down.mayoBall = b;
    }
    down.mayoXY = [x1, y1];
  }
  function addMayo(b, p, first) { // なぞった線にそって、太いマヨの線(ぷっくり)
    if (b.mayo > 900) return; b.mayo++;
    const local = b.tops.worldToLocal(p.clone()); const len = local.length() || 1; local.multiplyScalar((0.97 * Math.max(0.72, b.round) + 0.035) / len);
    const w = 0.065;
    const prev = !first && b.mayoPrev; if (prev && prev.distanceTo(local) < 0.03) return; b.mayoPrev = local.clone(); // ほぼ同じ所は、かさねない
    const j = new THREE.Mesh(mayoJoint, mayoMat); j.position.copy(local); j.scale.set(w, w * 0.8, w); b.tops.add(j);
    if (prev && prev.distanceTo(local) < 0.7) { // 前の点とつなぐ
      const d = local.clone().sub(prev), L = d.length(), m = new THREE.Mesh(mayoSeg, mayoMat);
      m.position.copy(prev).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(mUp, d.normalize()); m.scale.set(w, L, w * 0.8); b.tops.add(m);
    }
  }
  const noriMat = new THREE.MeshStandardMaterial({ color: 0x2f7d2a, roughness: 0.8 }), noriGeo = new THREE.BoxGeometry(0.05, 0.015, 0.05);
  function addNori(b) {
    b.nori++;
    for (let i = 0; i < 18; i++) { const th = Math.acos(rnd(0.35, 1)), ph = rnd(0, 6.28), R0 = HR * Math.max(0.75, b.round) + 0.03; const m = new THREE.Mesh(noriGeo, noriMat); m.position.set(Math.sin(th) * Math.cos(ph) * R0, Math.cos(th) * R0, Math.sin(th) * Math.sin(ph) * R0); m.rotation.set(rnd(0, 3), rnd(0, 3), 0); b.tops.add(m); }
  }
  const katsuoMat = new THREE.MeshStandardMaterial({ color: 0xd9a27a, roughness: 0.8, side: THREE.DoubleSide, transparent: true, opacity: 0.95 });
  function addKatsuo(b) {
    b.katsuo++;
    for (let i = 0; i < 7; i++) {
      const g = new THREE.PlaneGeometry(rnd(0.32, 0.58), rnd(0.2, 0.36), 4, 2); const p = g.attributes.position; for (let j = 0; j < p.count; j++) p.setZ(j, Math.sin(p.getX(j) * 8 + i) * 0.06 + p.getY(j) * p.getY(j) * 0.8); // くるっと丸まった薄いけずり節
      const mat = katsuoMat.clone(); mat.color.setHex(0xd8ab94).lerp(new THREE.Color(0x9c644c), Math.random() * 0.6); mat.roughness = 0.9;
      const m = new THREE.Mesh(g, mat); const ph = rnd(0, 6.28), rr = rnd(0, 0.48), R0 = HR * Math.max(0.75, b.round), up = Math.min(0.12, b.katsuo * 0.012);
      m.position.set(Math.cos(ph) * rr, Math.sqrt(Math.max(0.05, R0 * R0 - rr * rr)) + 0.06 + up + rnd(0, 0.08), Math.sin(ph) * rr); m.rotation.set(-Math.PI / 2 + rnd(-1.0, 1.0), rnd(0, 6), rnd(-0.7, 0.7)); // 上にこんもり、いろんな向き
      m.userData = { base: m.rotation.clone(), sp: rnd(2.5, 5), ph: rnd(0, 6) }; b.tops.add(m); b.flakes.push(m);
    }
  }

  // ---------- 採点 ----------
  function finish() {
    stage = "result"; $("panel").classList.add("hide"); guide(""); ghost.style.display = "none"; cv.style.cursor = "";
    const made = balls.filter((b) => b.made), n = made.length, cm = [];
    const avg = (f) => made.reduce((a, b) => a + f(b), 0) / Math.max(1, n);
    const secScore = (d) => (d < 0.75 ? clamp(d / 0.75, 0, 1) : d <= 1.3 ? 1 : clamp(1 - (d - 1.3) * 1.6, 0, 1));
    const roundS = avg((b) => (b.noBatter ? 0.85 : (b.formFrac ?? 0) >= 0.92 ? b.round : b.round * (0.3 + 0.5 * (b.formFrac ?? 0)))); // 生地なしの玉は、形では減点しない // ひっくり返していない(半分)のは、まるくない
    const pts = (b, f) => { let t = 0, n = 0; for (let i = 0; i < b.dn.length; i++) if (!b.cap[i]) { t += f(b.dn[i]); n++; } return n ? t / n : 0; }; // 表面の点の平均
    const colorS = avg((b) => pts(b, secScore));
    const inner = (b) => clamp(pts(b, (d) => Math.min(d, 1.3)) * 1.25, 0, 1.3);
    const innerS = avg((b) => { const v = inner(b); return v < 0.55 ? v / 0.55 * 0.6 : v <= 1.05 ? 1 : 0.8; });
    const takoN = made.map((b) => b.items.tako || 0), takoOk = takoN.filter((t) => t >= 1 && t <= 2).length / Math.max(1, n);
    const has = (k) => made.some((b) => b.items[k]);
    const gu = (has("tenkasu") ? 1 : 0) + (has("negi") ? 1 : 0) + (has("beni") ? 1 : 0);
    const sauceS = avg((b) => (b.sauceAmt < 0.3 ? b.sauceAmt / 0.3 * 0.5 : b.sauceAmt <= 1.2 ? 1 : 0.7));
    const topS = sauceS * 0.55 + (made.some((b) => b.mayo) ? 0.15 : 0) + (made.some((b) => b.nori) ? 0.15 : 0) + (made.some((b) => b.katsuo) ? 0.15 : 0);
    let score = n ? roundS * 25 + colorS * 30 + innerS * 10 + takoOk * 15 + gu / 3 * 5 + topS * 15 : 0;
    const burnt = made.filter((b) => pts(b, (d) => (d > 1.6 ? 1 : 0)) > 0.15).length, rawN = made.filter((b) => inner(b) < 0.5).length;
    const choco = has("choco");
    if (n < 4) { score *= 0.6 + n / 10; cm.push(["bad", `${n}個しか焼いてない…（8個焼けるよ）`]); }
    // コメント
    if (roundS > 0.9) cm.push(["good", "まんまる！ 回すのがうまい"]); else if (roundS < 0.6) cm.push(["bad", "形がくずれ気味…（生地は少しあふれるくらい・固まってから回す）"]);
    if (burnt) cm.push(["bad", `${burnt}個こげこげ…`]); else if (colorS > 0.85) cm.push(["good", "焼き色がきれいなきつね色"]);
    const bad = made.filter((b) => b.round < 0.75 && !b.noBatter).length; if (bad && roundS >= 0.6) cm.push(["bad", `${bad}個は形がくずれた`]);
    score -= burnt * 3 + bad * 2; // こげ・くずれは1個ずつ減点
    if (rawN) cm.push(["bad", `${rawN}個は中がまだドロドロ`]); else if (innerS > 0.9) cm.push(["good", "外カリ中トロ！"]);
    if (takoN.every((t) => t === 0)) cm.push(["bad", "タコが入っていない…（ただの『焼き』）"]); else if (takoOk > 0.9) cm.push(["good", "全部にたこ入り"]); else if (takoN.some((t) => t >= 4)) cm.push(["", "タコだらけの1個がある"]); else cm.push(["bad", "たこが入っていないのが混ざってる"]);
    if (gu === 3) cm.push(["good", "天かす・ねぎ・紅しょうがで本格的"]);
    if (sauceS > 0.9) cm.push(["good", "ソースがちょうどいい"]); else if (made.every((b) => b.sauceAmt < 0.1)) cm.push(["bad", "ソースなし（素焼き派？）"]);
    if (made.some((b) => b.katsuo)) cm.push(["good", "かつお節がゆらゆら踊ってる"]);
    if (choco) cm.push(["", "🍫 チョコ入り…ロシアンたこ焼き"]);
    if (has("cheese")) cm.push(["good", "🧀 チーズ入りでとろーり"]);
    if (has("banana")) cm.push(["", "🍌 バナナ入り…デザート？"]);
    if (has("ichigo") || has("budou") || has("mikan")) cm.push(["", "🍓 フルーツ入り…スイーツ？"]);
    if (made.some((b) => (b.ketchupAmt || 0) > 0.1)) cm.push(["", "🍅 ケチャップ…オムライス風？"]);
    { const oiled = made.filter((b) => (b.oil || 0) >= 0.6).length; if (oiled === made.length) cm.push(["good", "油をしっかりひいた"]); else if (oiled < made.length / 2) cm.push(["bad", "油をひいてない穴が多い（くっつく）"]); }
    { const to = made.filter((b) => b.takoOut).length, so = made.filter((b) => (b.sticks || 0) > (b.takoOut || 0)).length; if (to) cm.push(["bad", `${to}個はたこがはみ出てる`]); if (so) cm.push(["", `${so}個は具がはみ出てる（入れすぎ）`]); score -= to * 1.5; }
    score = Math.round(clamp(score, 0, 100));
    lastResult = null;
    const rank = score >= 90 ? "大阪の名店レベル" : score >= 75 ? "人気の屋台" : score >= 55 ? "お祭りの屋台" : score >= 35 ? "見習いたこ焼き職人" : "これはこれで…";
    // 名前: 「焼き加減」＋「具(多い順に2つ・マシマシ/多め)」＋「たこ焼き / 〜だけ焼き / 〜焼き」(Xで『こんなのできたんだけど』と投稿したくなる名前)
    const JP = { negi: "ねぎ", cheese: "チーズ", choco: "チョコ", banana: "バナナ", beni: "紅しょうが", tenkasu: "天かす", ichigo: "いちご", budou: "ぶどう", mikan: "みかん" };
    const sumIt = {}; for (const b of made) for (const k in b.items) sumIt[k] = (sumIt[k] || 0) + b.items[k];
    const per = (k) => (sumIt[k] || 0) / Math.max(1, n);
    const avgD = avg((b) => pts(b, (d) => d)), takoBalls = made.filter((b) => (b.items.tako || 0) > 0).length, noBat = made.filter((b) => b.noBatter).length > n / 2;
    const done = avgD < 0.5 ? "生焼け" : avgD < 0.85 ? "ふわとろ" : avgD < 1.3 ? "こんがり" : avgD < 1.65 ? "こげこげ" : "まっくろ";
    const ings = Object.keys(JP).filter((k) => per(k) >= 0.25).sort((a, b) => per(b) - per(a)).slice(0, 2);
    const ingStr = ings.map((k) => JP[k] + (noBat ? "" : per(k) >= 3 ? "マシマシ" : per(k) >= 1.8 ? "多め" : "")).join(""); // 生地なしは「〇〇だけ焼き」
    const noun = takoBalls >= n / 2 ? "たこ焼き" : noBat ? (ingStr ? "だけ焼き" : "焼き") : ingStr ? "焼き" : "生地だけ焼き";
    let name = (made.filter((b) => (b.ketchupAmt || 0) > 0.15).length >= n / 2 ? "ケチャップがけ" : "") + (roundS < 0.5 && !noBat ? "ぐちゃぐちゃ" : "") + done + (takoBalls >= n / 2 && per("tako") >= 3 ? "たこマシマシ" : "") + ingStr + noun;
    lastResult = { score, rank, name };
    $("rankName").textContent = rank; $("takoName").textContent = `「${name}」`; $("scoreNum").innerHTML = `${score}<small>点</small>`;
    cm.sort((a, b) => (a[0] === "bad" ? 0 : 1) - (b[0] === "bad" ? 0 : 1)); // 悪いところを先に
    $("comments").innerHTML = cm.slice(0, 8).map(([k, t]) => `<li class="${k}">${k === "good" ? "◎ " : k === "bad" ? "× " : k === "made" ? "🍽 " : "・ "}${t}</li>`).join("");
    camGoal = { pos: camPlate.pos, at: new THREE.Vector3(0, -0.3, 0) }; viewGoal.pitch = 0.6; viewGoal.zoom = 0.72; autoSpin = true; // 斜め横から、ぐるっと回って見せる
    setTimeout(() => $("result").classList.remove("hide"), 700);
    blip(880, 0.12, "triangle", 0.07); setTimeout(() => blip(1320, 0.18, "triangle", 0.07), 120);
  }
  let lastResult = null;
  function ballType(b) { // その1個が何になったか
    const it = b.items, has = (k) => (it[k] || 0) > 0, kinds = Object.keys(it).filter((k) => it[k] > 0);
    if (b.noBatter) {
      if (kinds.length === 1) return { negi: "ねぎ焼き", choco: "チョコボール", cheese: "チーズボール", banana: "焼きバナナ", ichigo: "焼きいちご", budou: "焼きぶどう", mikan: "焼きみかん", tako: "焼きダコ団子", tenkasu: "天かす団子", beni: "紅しょうが玉" }[kinds[0]] || "具だけ団子";
      if (has("choco") && has("banana") && kinds.length === 2) return "チョコバナナ（生地なし）";
      return "具だけ団子";
    }
    if (has("choco") && has("banana")) return "チョコバナナ焼き";
    if (has("choco") && !has("tako")) return "チョコ焼き（ベビーカステラ風）";
    if (has("banana") && !has("tako")) return "バナナ焼き";
    if ((has("ichigo") || has("budou") || has("mikan")) && !has("tako")) return "フルーツ焼き";
    if (has("cheese") && has("tako")) return "チーズたこ焼き";
    if ((it.negi || 0) >= 3 && has("tako")) return "ねぎたこ";
    if ((it.negi || 0) >= 3) return "ねぎ焼き";
    if ((it.beni || 0) >= 3) return "紅しょうが焼き";
    if (!kinds.length) return "生地だけ焼き";
    if (!has("tako")) return "たこなし焼き";
    return "たこ焼き";
  }
  function openXShare(text, url) { // スマホは Xのアプリを開く(入っていなければ Web の X) / PC は Web の X
    if (window.xShare) return window.xShare(text, url); // 共通のシェア(/assets/xshare.js)
    const web = "https://x.com/intent/post?text=" + encodeURIComponent(text) + "&url=" + encodeURIComponent(url), msg = encodeURIComponent(text + "\n" + url), ua = navigator.userAgent;
    if (/Android/i.test(ua)) { location.href = "intent://post?message=" + msg + "#Intent;scheme=twitter;package=com.twitter.android;S.browser_fallback_url=" + encodeURIComponent(web) + ";end"; return; }
    if (/iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) {
      let gone = false; const bye = () => { gone = true; }; document.addEventListener("visibilitychange", bye, { once: true }); window.addEventListener("pagehide", bye, { once: true }); window.addEventListener("blur", bye, { once: true });
      location.href = "twitter://post?message=" + msg; setTimeout(() => { if (!gone && !document.hidden) location.href = web; }, 1600); return;
    }
    window.open(web, "_blank", "noopener");
  }
  $("shareBtn").onclick = () => { if (!lastResult) return; openXShare(`🐙 こんなのできたんだけど→「${lastResult.name}」${lastResult.score}点（${lastResult.rank}）` + "\n#たこ焼き作り #ピコピコP", "https://piko2game.com/takoyaki/"); };
  $("saveBtn").onclick = () => {
    if (!lastResult) return;
    const src = renderer.domElement, c = document.createElement("canvas"); c.width = src.width; c.height = src.height + Math.round(src.width * 0.16);
    const g = c.getContext("2d"); g.fillStyle = "#fff6e3"; g.fillRect(0, 0, c.width, c.height); g.drawImage(src, 0, 0);
    const fs = Math.round(c.width * 0.045); g.fillStyle = "#2b2b2b"; g.font = `900 ${fs}px sans-serif`; g.textAlign = "center";
    g.fillText(`「${lastResult.name}」 ${lastResult.score}点`, c.width / 2, src.height + fs * 1.5); g.font = `800 ${Math.round(fs * 0.6)}px sans-serif`; g.fillText(`${lastResult.rank} ・ たこ焼き作り piko2game.com`, c.width / 2, src.height + fs * 2.6);
    const a = document.createElement("a"); a.href = c.toDataURL("image/jpeg", 0.9); a.download = "takoyaki.jpg"; a.click();
  };

  // ---------- ループ ----------
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (stage === "cook") { pourTick(dt); cookTick(dt); } smokeTick(dt);
    pitcherTick(dt, now); brushTick(now); propsTick(); flutterTick(dt); liftTick(now);
    if (stage === "top" || stage === "result") dripTick(dt);
    if (stage === "top" || stage === "result") for (const b of balls) for (const f of b.flakes) { const u = f.userData; f.rotation.x = u.base.x + Math.sin(now / 1000 * u.sp + u.ph) * 0.35; f.rotation.z = u.base.z + Math.cos(now / 1000 * u.sp * 0.8 + u.ph) * 0.25; } // かつお節がおどる
    if (stage === "result" && autoSpin) viewGoal.yaw += dt * 0.35; // 完成: ゆっくり回る
    { const want = stage === "cook" && (tool === "carry" || balls.some((b) => b.lifting || b.onPlate)) ? 1 : 0; panFocus += (want - panFocus) * Math.min(1, dt * 3); } // お皿に盛る時だけ、引いてお皿も映す
    camNow.pos.lerp(camGoal.pos, Math.min(1, dt * 3)); camNow.at.lerp(camGoal.at, Math.min(1, dt * 3));
    { // 下のボタンの板・上の説明に重ならないように: 空いている所の高さに合わせて少し引いて、真ん中をずらす
      const H = innerHeight, W = innerWidth, pnl = $("panel"), res = $("result");
      const bottom = !pnl.classList.contains("hide") ? pnl.getBoundingClientRect().height + 18 : !res.classList.contains("hide") ? res.querySelector(".card").getBoundingClientRect().height + 18 : 0;
      const top = $("guide").innerHTML ? $("guide").getBoundingClientRect().bottom + 6 : 56, availH = Math.max(120, H - bottom - top), availW = W - 24 - (W < 700 ? 52 : 0); // せまい画面は、右はしの視点ボタンの分もあける
      // たこ焼き器(お皿)の大きさが、空いている所の縦にも横にもちょうど収まる距離
      let objW = stage === "cook" || stage === "title" ? (W < 700 && stage === "cook" ? PW - 1.0 : PW + 1.2) : stage === "top" ? 8.4 : 16.0 * 0.6 + 0.8, objD = stage === "cook" || stage === "title" ? PD + 1.2 + 1.6 + 5.0 * panFocus : stage === "top" ? 4.4 : 7.4 * 0.6 + 0.8; // トッピングは、たこ焼きに寄る(塗りやすく) // 焼いている時は、手前のお皿も入るように
      for (const k of ["yaw", "pitch", "zoom"]) view[k] += (viewGoal[k] - view[k]) * Math.min(1, dt * 8);
      const tv = Math.tan(camera.fov * Math.PI / 360), dist0 = camNow.pos.distanceTo(camNow.at);
      const dir = new THREE.Vector3(Math.sin(view.yaw) * Math.cos(view.pitch), Math.sin(view.pitch), Math.cos(view.yaw) * Math.cos(view.pitch));
      const cosT = Math.abs(dir.y); // 真上から見るほど、奥行きがそのまま見える
      { const cy = Math.abs(Math.cos(view.yaw)), sy = Math.abs(Math.sin(view.yaw)); const w2 = objW * cy + objD * sy, d2 = objD * cy + objW * sy; objW = w2; objD = d2; } // まわりこむと、横幅と奥行きが入れかわる
      const dH = (objD * (0.35 + 0.65 * cosT) + 1.2) / (2 * tv * (availH / H)), dW = objW * (1 + 0.45 * (1 - cosT)) / (2 * tv * camera.aspect * (availW / W)); // ななめから見ると、手前ほど大きく見える分の余裕
      const dist = Math.max(dH, dW, 6) * (stage === "result" ? 0.92 : 1) * view.zoom;
      camera.position.copy(camNow.at).addScaledVector(dir, stage === "title" ? dist0 : dist); camera.lookAt(camNow.at);
      const shift = (bottom - top) / 2; if (Math.abs(shift - (camera.view ? camera.view.offsetY : 0)) > 0.5 || (camera.view && camera.view.offsetX !== (W < 700 ? 22 : 0))) camera.setViewOffset(W, H, W < 700 ? 22 : 0, shift, W, H);
    }
    if (stage === "title") { const t = now / 4000; camera.position.set(Math.sin(t) * 3, 12, 9 + Math.cos(t) * 1.5); camera.lookAt(0, -0.4, 0.4); }
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  // ボタンの絵: 3Dの具を小さく描いて画像にする(絵文字ではなく)
  const THUMB = {};
  function makeThumbs() {
    let r2; try { r2 = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); } catch { return; }
    r2.setSize(112, 112, false); r2.outputEncoding = THREE.sRGBEncoding;
    const sc = new THREE.Scene(); sc.add(new THREE.HemisphereLight(0xffffff, 0x8a6a50, 0.9)); const dl = new THREE.DirectionalLight(0xffffff, 0.9); dl.position.set(-2, 4, 3); sc.add(dl);
    const cam = new THREE.PerspectiveCamera(32, 1, 0.01, 50);
    const pile = (kind, n, spread) => { const g = new THREE.Group(); for (let i = 0; i < n; i++) { const m = makeBit(kind); const a = i / n * 6.28; m.position.set(Math.cos(a) * spread * (i ? 1 : 0), FLAT[kind] ? i * 0.01 : 0, Math.sin(a) * spread * (i ? 1 : 0)); if (!FLAT[kind]) m.rotation.set(rnd(0, 6), rnd(0, 6), rnd(0, 6)); else m.rotation.set(rnd(-0.3, 0.3), rnd(0, 6), rnd(-0.3, 0.3)); g.add(m); } return g; };
    const sticks = () => { const g = new THREE.Group(), mat = new THREE.MeshStandardMaterial({ color: 0xd9b07a, roughness: 0.6 }), tip = new THREE.MeshStandardMaterial({ color: 0xc82a3a, roughness: 0.5 }); for (const s of [-1, 1]) { const st = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.02, 0.9, 8), mat); st.rotation.z = s * 0.18; st.position.x = s * 0.06; g.add(st); const t = new THREE.Mesh(new THREE.CylinderGeometry(0.021, 0.021, 0.12, 8), tip); t.position.set(s * 0.06 + s * 0.07, 0.38, 0); t.rotation.z = s * 0.18; g.add(t); } return g; };
    const sauce = () => { const g = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color: 0x3e1a08, roughness: 0.15 }); const a = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 16), m); a.scale.set(1, 0.45, 1); g.add(a); const d = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), m); d.position.set(0.18, -0.02, 0.12); d.scale.set(1, 0.4, 1); g.add(d); return g; };
    const mayo = () => { const pts = []; for (let i = 0; i < 9; i++) pts.push(new THREE.Vector3(i * 0.06 - 0.24, 0, (i % 2 ? 0.08 : -0.08))); return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.03, 8), new THREE.MeshStandardMaterial({ color: 0xfffaea, roughness: 0.3 })); };
    const nori = () => { const g = new THREE.Group(); for (let i = 0; i < 60; i++) { const m = new THREE.Mesh(noriGeo, noriMat); m.scale.setScalar(2.2); m.position.set(rnd(-0.18, 0.18), rnd(0, 0.04), rnd(-0.18, 0.18)); m.rotation.set(rnd(0, 3), rnd(0, 3), 0); g.add(m); } return g; };
    const katsuo = () => { const g = new THREE.Group(); for (let i = 0; i < 6; i++) { const geo = new THREE.PlaneGeometry(0.3, 0.2, 4, 1), p2 = geo.attributes.position; for (let j = 0; j < p2.count; j++) p2.setZ(j, Math.sin(p2.getX(j) * 12 + i) * 0.03); const m = new THREE.Mesh(geo, katsuoMat); m.position.set(rnd(-0.1, 0.1), i * 0.015, rnd(-0.1, 0.1)); m.rotation.set(-Math.PI / 2 + rnd(-0.5, 0.5), rnd(0, 6), 0); g.add(m); } return g; };
    const make = { oil: () => { const g = brush.clone(true); g.visible = true; g.rotation.set(0, 0, -0.6); return g; }, batter: () => pitcher.clone(true), ichigo: () => makeBit("ichigo"), budou: () => { const g = new THREE.Group(); for (let i = 0; i < 3; i++) { const m = makeBit("budou"); m.position.set((i - 1) * 0.2, i === 1 ? 0.12 : 0, 0); g.add(m); } return g; }, mikan: () => makeBit("mikan"), ketchup: () => { const g = new THREE.Group(); const bt = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.55, 18), new THREE.MeshStandardMaterial({ color: 0xd0141c, roughness: 0.3 })); g.add(bt); const cap = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.22, 16), new THREE.MeshStandardMaterial({ color: 0xf4f0e6, roughness: 0.4 })); cap.position.y = 0.38; g.add(cap); g.rotation.z = -0.5; return g; }, tako: () => takoMesh(), tenkasu: () => pile("tenkasu", 6, 0.09), negi: () => pile("negi", 4, 0.08), beni: () => pile("beni", 5, 0.05), cheese: () => pile("cheese", 2, 0.08), choco: () => pile("choco", 2, 0.07), banana: () => pile("banana", 2, 0.08), pick: sticks, sauce, mayo, nori, katsuo };
    for (const id in make) {
      try {
        const o = make[id](); o.visible = true; if (id === "batter") o.rotation.set(0, -0.6, -0.35); sc.add(o);
        const box = new THREE.Box3().setFromObject(o), c = box.getCenter(new THREE.Vector3()), r = box.getSize(new THREE.Vector3()).length() / 2 || 0.2;
        cam.position.copy(c).add(new THREE.Vector3(0, 0.7, 1).normalize().multiplyScalar(r / Math.sin(16 * Math.PI / 180) * 0.8)); cam.lookAt(c);
        r2.render(sc, cam); THUMB[id] = r2.domElement.toDataURL("image/png"); sc.remove(o);
      } catch {}
    }
    r2.dispose(); try { r2.forceContextLoss(); } catch {}
  }
  window.__T = { get balls(){return balls}, get stage(){return stage}, get tool(){return tool}, get heatK(){return heatK}, camera, cv, pan, plate, props, oilProp, batterProp, AX, AZ, HR }; // read-only hook for the recording script
  makeThumbs();
  reset(); requestAnimationFrame(loop);
})();
