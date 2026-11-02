// Rare rooms: now and then one of these comes down the crane instead of an ordinary extra.
// Each: id, name, footprint w × h, fill (plan floor), out (stands outdoors: no walls of its own),
// kit + opt (how iso.js draws it), text(q) the flyer's headline, verb (what the family does there),
// rent (万円 added). q = { near(ids) → the room touches one of those, bath, wc } for the headline.

const BED = ['wa', 'yo'];

// RARE_V1: how many of RARE existed before 2026-10-21 (the 15 rooms after the cut were added then).
// Their TYPES indices (9..46) are baked into every shared `?h=` code, so they must never move:
// house.js keeps this first block where it is and puts the newer 15 rooms after `li` (index 47).
export const RARE_V1 = 38;
// RARE_V2: how many existed before 2026-10-22 (38 + 15). The 13 after it go after `roka` and the shops
// in TYPES (70..82; see house.js), again so no index that a shared `?h=` code uses ever moves.
export const RARE_V2 = 53;

export const RARE = [
  { id: 'haka', theme: 'temple', name: '墓地', w: 2, h: 1, fill: '#e6e4de', out: true, kit: 'haka', verb: 'お墓参り', rent: -2,
    text: (q) => (q.near(BED) ? '寝室の隣が墓地。夜はとても静か' : '墓地つき。ご先祖さまと同居') },
  { id: 'tera', theme: 'temple', name: '本堂', w: 2, h: 2, fill: '#efe9da', kit: 'roof', opt: { color: '#3a3a3f', wall: 0.95 }, verb: 'お参り', rent: 3,
    text: (q) => (q.through ? '寝室へは本堂を通って。毎晩お参り' : '本堂つき。毎朝お経で目が覚める') },
  { id: 'tower', name: 'タワー', w: 1, h: 1, kit: 'tall', opt: { z: 5.6, windows: true }, verb: 'タワーに上る', rent: 4,
    text: (q) => (q.near(['wc']) ? 'トイレの隣にタワー。眺望良好' : 'タワーつき。眺望良好（エレベーターなし）') },
  { id: 'pool', name: 'プール', w: 2, h: 2, fill: '#cfe8f1', kit: 'water', verb: 'ひと泳ぎ', rent: 2,
    text: (q) => (q.bath ? '室内プールつき。浴室と迷う' : '風呂なし。プールあり') },
  { id: 'wheel', theme: 'park', name: '観覧車', w: 2, h: 1, fill: '#ecebe6', out: true, kit: 'wheel', verb: '観覧車に乗る', rent: 5,
    text: (q) => (q.near(['ldk']) ? '観覧車つき。リビングから乗れます' : '庭に観覧車。休日の遠出が不要に') },
  { id: 'torii', theme: 'temple', name: '鳥居', w: 1, h: 1, fill: '#e3e0d8', out: true, kit: 'torii', verb: '鳥居をくぐる', rent: 1,
    text: (q) => (q.near(['gen']) ? '玄関の前に鳥居。毎日がお参り' : q.other ? `家の中に鳥居。くぐると${q.other}` : '鳥居だけが建っている') },
  { id: 'onsen', theme: 'spa', name: '露天風呂', w: 2, h: 2, fill: '#cfe8f1', out: true, kit: 'water', opt: { rocks: true }, verb: '温泉に入る', rent: 3,
    text: (q) => (q.bath ? '露天風呂つき。浴室の出番なし' : '風呂なし。源泉かけ流しの露天風呂あり') },
  { id: 'taki', name: '滝', w: 1, h: 2, fill: '#cfe8f1', kit: 'taki', verb: '滝に打たれる', rent: 2,
    text: (q) => (q.near(BED) ? '寝室の隣に滝。夜も水の音' : '室内に滝。マイナスイオン完備') },
  { id: 'tanbo', name: '田んぼ', w: 2, h: 2, fill: '#d5e6bd', out: true, kit: 'rows', verb: '田植え', rent: -1,
    text: (q) => (q.near(['ldk']) ? 'リビングの隣が田んぼ。お米は自給自足' : '田んぼつき。お米は自給自足') },
  { id: 'ushi', theme: 'zoo', name: '牛舎', w: 2, h: 1, fill: '#ece3cf', kit: 'animals', opt: { kind: 'cow', n: 2 }, verb: '乳しぼり', rent: 0,
    text: (q) => (q.near(BED) ? '寝室の隣で牛が鳴く' : '牛舎つき。毎朝しぼりたて') },
  { id: 'dohyo', name: '土俵', w: 2, h: 2, fill: '#e8d9b5', kit: 'dohyo', verb: '四股を踏む', rent: 1,
    text: () => '土俵つき。夫婦げんかは相撲で' },
  { id: 'chashitsu', name: '茶室', w: 1, h: 1, fill: '#efe9da', out: true, kit: 'hut', opt: { color: '#6d5a3c' }, verb: 'お茶をたてる', rent: 1,
    text: () => '茶室つき。にじり口から出入り' },
  { id: 'tenshu', name: '天守閣', w: 2, h: 2, fill: '#d9d6cd', out: true, kit: 'castle', verb: '天守閣から見下ろす', rent: 6,
    text: () => '天守閣つき。一国一城の主に' },
  { id: 'toudai', name: '灯台', w: 1, h: 1, fill: '#e3e0d8', out: true, kit: 'tall', opt: { z: 4.2, stripes: true, round: true }, verb: '灯台を灯す', rent: 2,
    text: () => '灯台つき。海はありません' },
  { id: 'suberi', theme: 'park', name: '滑り台', w: 1, h: 2, fill: '#fff', kit: 'slide', verb: '滑り台をすべる', rent: 0,
    text: (q) => (q.near(['kai']) ? '階段で上って、滑り台で下りる家' : '滑り台つき。どこから滑るかは不明') },
  { id: 'jihanki', name: '自販機', w: 1, h: 1, kit: 'cabinet', opt: { color: '#d23a2c' }, verb: 'ジュースを買う', rent: 0.5,
    text: (q) => (q.near(['ldk']) ? 'リビングに自販機。お茶は有料' : '自販機つき。ジュースは有料') },
  { id: 'denwa', name: '電話ボックス', w: 1, h: 1, fill: '#e3e0d8', out: true, kit: 'booth', opt: { color: '#4f9a62' }, verb: '電話をかける', rent: 0,
    text: () => '電話ボックスつき。家の電話は有料' },
  { id: 'koban', theme: 'kancho', name: '交番', w: 1, h: 1, fill: '#e3e0d8', out: true, kit: 'hut', opt: { color: '#3a3a3f', lamp: true }, verb: '道を聞く', rent: 1,
    text: (q) => (q.near(['gen']) ? '玄関の隣に交番。防犯性は日本一' : '交番つき。家の中で道に迷っても安心') },
  { id: 'eki', theme: 'terminal', name: '駅', w: 3, h: 1, fill: '#e3e0d8', kit: 'station', verb: '電車に乗る', rent: 6, walk: 0,
    text: () => '家の中に駅。駅徒歩0分' },
  { id: 'heli', theme: 'terminal', name: 'ヘリポート', w: 2, h: 2, fill: '#d6d4cd', out: true, kit: 'heli', verb: 'ヘリで出かける', rent: 8,
    text: () => 'ヘリポートつき。通勤はヘリで' },
  { id: 'kinko', name: '金庫室', w: 1, h: 1, kit: 'safe', verb: '金庫を確かめる', rent: 2,
    text: () => '金庫室つき。中身は空' },
  { id: 'tosho', theme: 'kancho', name: '図書館', w: 2, h: 2, kit: 'shelves', verb: '本を読む', rent: 2,
    text: () => '図書館つき。返却期限なし' },
  { id: 'eiga', name: '映画館', w: 2, h: 2, kit: 'cinema', verb: '映画を見る', rent: 3,
    text: () => '映画館つき。ポップコーンは自前' },
  { id: 'zou', theme: 'zoo', name: 'ゾウ舎', w: 2, h: 2, fill: '#e6dcc4', out: true, kit: 'animals', opt: { kind: 'elephant', n: 1 }, verb: 'ゾウにえさをやる', rent: 1,
    text: () => 'ゾウ舎つき。ペット可（ゾウも可）' },
  { id: 'funsui', name: '噴水', w: 1, h: 1, fill: '#e3e0d8', out: true, kit: 'fountain', verb: '噴水に小銭を投げる', rent: 1,
    text: (q) => (q.near(['gen']) ? '玄関前に噴水。セレブの証' : '噴水つき。小銭が貯まる') },
  { id: 'pyramid', name: 'ピラミッド', w: 2, h: 2, fill: '#e8d9b5', out: true, kit: 'pyramid', verb: 'ピラミッドを拝む', rent: 4,
    text: () => 'ピラミッドつき。中は見られません' },
  { id: 'kane', theme: 'temple', name: '鐘つき堂', w: 1, h: 1, fill: '#e3e0d8', out: true, kit: 'bell', verb: '鐘をつく', rent: 1,
    text: () => '鐘つき堂つき。目覚ましは除夜の鐘' },
  { id: 'sushi', name: '回転寿司', w: 2, h: 1, kit: 'sushi', verb: '寿司を食べる', rent: 2,
    text: (q) => (q.near(['ldk']) ? 'リビングの隣に回転寿司。毎日が外食気分' : '回転寿司つき。皿は自分で洗う') },
  { id: 'yatai', name: '屋台', w: 1, h: 1, fill: '#e3e0d8', out: true, kit: 'yatai', verb: 'ラーメンをすする', rent: 0.5,
    text: () => 'ラーメン屋台つき。夜食に困らない' },
  { id: 'niwatori', theme: 'zoo', name: '鶏小屋', w: 1, h: 1, fill: '#e6dcc4', out: true, kit: 'animals', opt: { kind: 'chicken', n: 3 }, verb: '卵を拾う', rent: -0.5,
    text: (q) => (q.near(BED) ? '寝室の隣に鶏小屋。目覚まし不要' : '鶏小屋つき。朝ごはんは卵') },
  { id: 'daibutsu', theme: 'temple', name: '大仏', w: 2, h: 2, fill: '#e3e0d8', out: true, kit: 'buddha', verb: '大仏を拝む', rent: 3,
    text: () => '大仏つき。ご利益あり' },
  { id: 'fusha', name: '風車', w: 1, h: 1, fill: '#e3e0d8', out: true, kit: 'windmill', verb: '風車をながめる', rent: 1,
    text: () => '風車つき。電気代ゼロ（たぶん）' },
  { id: 'iwa', name: '大岩', w: 1, h: 1, fill: '#e3e0d8', out: true, kit: 'rock', verb: '岩をなでる', rent: -1,
    text: (q) => (q.near(['ldk']) ? 'リビングの隣に大岩。動かせません' : '動かせない大岩つき') },
  { id: 'konbini', name: 'コンビニ', w: 2, h: 1, kit: 'store', verb: 'コンビニへ', rent: 3,
    text: () => '家の中にコンビニ。24時間営業' },
  { id: 'sento', theme: 'spa', name: '銭湯', w: 2, h: 2, fill: '#cfe8f1', kit: 'roof', opt: { color: '#3a3a3f', wall: 0.95, chimney: true }, verb: '銭湯へ', rent: 2,
    text: (q) => (q.bath ? '銭湯つき。番台はお父さん' : '風呂なし。銭湯あり（家の中に）') },
  { id: 'ana', name: '謎の穴', w: 1, h: 1, fill: '#2b2b2e', kit: 'hole', verb: '穴をのぞく', rent: -1,
    text: () => '地下へ続く穴あり（中は不明）' },
  { id: 'sauna', theme: 'spa', name: 'サウナ', w: 1, h: 1, kit: 'cabinet', opt: { color: '#b98a55', vent: true }, verb: 'サウナでととのう', rent: 1,
    text: () => 'サウナつき。毎日ととのう家' },
  { id: 'bowling', name: 'ボウリング場', w: 3, h: 1, kit: 'lanes', verb: 'ボウリング', rent: 3,
    text: () => 'ボウリング場つき。夜は少しうるさい' },
  // --- added 2026-10-21 (indices 48..62 in TYPES, after `li`; see RARE_V1) ---
  { id: 'rou', theme: 'kancho', name: '牢屋', w: 1, h: 1, fill: '#c9c6bd', kit: 'jail', verb: '牢屋をのぞく', rent: -1,
    text: (q) => (q.near(BED) ? '寝室が牢屋の隣。早寝が義務' : '牢屋つき。鍵は外側') },
  { id: 'kamidana', theme: 'temple', name: '神棚の間', w: 2, h: 1, kit: 'kamidana', verb: '神棚に手を合わせる', rent: 1,
    text: (q) => (q.near(['wc']) ? 'トイレの隣に神棚。罰当たり物件' : '神棚の間つき。毎朝二礼二拍手一礼') },
  { id: 'tsuribori', name: '釣り堀', w: 2, h: 2, fill: '#cfe8f1', kit: 'water', opt: { rods: true }, verb: '釣り糸を垂らす', rent: 2,
    text: (q) => (q.near(['bath']) ? '浴室の隣に釣り堀。夕飯は自分で釣る' : '釣り堀つき。休日は一日中ここ') },
  { id: 'shonyu', name: '鍾乳洞', w: 2, h: 2, fill: '#5b5650', kit: 'cave', verb: '鍾乳洞を探検する', rent: 2,
    text: (q) => (q.near(BED) ? '寝室の奥が鍾乳洞。夏でも涼しい' : '鍾乳洞つき。奥がどこまで続くか不明') },
  { id: 'fumikiri', theme: 'terminal', name: '踏切', w: 2, h: 1, out: true, fill: '#d6d4cd', kit: 'crossing', verb: '踏切を渡る', rent: -1,
    text: (q) => (q.near(['gen']) ? '玄関の前に踏切。開かずの家' : '家の中に踏切。カンカン鳴ったら待つ') },
  { id: 'takarakuji', name: '宝くじ売り場', w: 1, h: 1, out: true, fill: '#e3e0d8', kit: 'booth', opt: { color: '#d23a2c', sign: '#f2c230' }, verb: '宝くじを買う', rent: 1,
    text: () => '宝くじ売り場つき。家賃は当たってから' },
  { id: 'tohyo', theme: 'kancho', name: '投票所', w: 2, h: 2, kit: 'ballot', verb: '投票に行く', rent: 1,
    text: () => '投票所つき。選挙のたびに知らない人が来る' },
  { id: 'hotei', theme: 'kancho', name: '法廷', w: 2, h: 2, fill: '#e8dcc4', kit: 'court', verb: '判決を聞く', rent: 3,
    text: () => '法廷つき。夫婦げんかは判決で' },
  { id: 'penguin', theme: 'zoo', name: 'ペンギン舎', w: 2, h: 1, fill: '#e6f2f7', kit: 'animals', opt: { kind: 'penguin', n: 3 }, verb: 'ペンギンにえさをやる', rent: 2,
    text: () => 'ペンギン舎つき。冷房は常に全開' },
  { id: 'wani', theme: 'zoo', name: 'ワニ池', w: 2, h: 2, fill: '#a9c9a0', out: true, kit: 'water', opt: { croc: true }, verb: 'ワニを数える', rent: 1,
    text: () => 'ワニ池つき。夜トイレに行けない' },
  { id: 'himitsu', name: '秘密基地', w: 1, h: 1, out: true, fill: '#e3e0d8', kit: 'base', verb: '秘密基地にこもる', rent: 0,
    text: () => '秘密基地つき。家族にも秘密' },
  { id: 'hassha', theme: 'terminal', name: '発射台', w: 2, h: 2, out: true, fill: '#d6d4cd', kit: 'rocket', verb: 'ロケットを打ち上げる', rent: 10,
    text: () => '発射台つき。通勤は宇宙経由' },
  { id: 'somen', name: '流しそうめん', w: 4, h: 1, kit: 'somen', verb: 'そうめんをすくう', rent: 1,
    text: () => '家を一周する流しそうめん' },
  { id: 'choujo', name: '万里の長城', w: 4, h: 1, out: true, fill: '#d9d6cd', kit: 'greatwall', verb: '長城を歩く', rent: 5,
    text: () => '長城つき。お隣と国交断絶' },
  { id: 'meiro', theme: 'park', name: '迷路', w: 2, h: 2, fill: '#d5e6bd', out: true, kit: 'maze', verb: '迷路を抜ける', rent: 0,
    text: () => '玄関からリビングまで迷路' },
  // --- added 2026-10-22 (indices 70..82 in TYPES, after `roka` and the shops; see RARE_V2) ---
  { id: 'basutei', theme: 'terminal', name: 'バス停', w: 1, h: 1, out: true, fill: '#e3e0d8', kit: 'busstop', verb: 'バスを待つ', rent: 0.5,
    text: (q) => (q.near(['gen']) ? '玄関の前にバス停。ただし1日1本' : '家の中にバス停。バスは1日1本') },
  { id: 'moai', name: 'モアイ', w: 1, h: 1, out: true, fill: '#d5e6bd', kit: 'moai', verb: 'モアイと見つめ合う', rent: 1,
    text: (q) => (q.near(BED) ? '寝室をモアイがのぞいている' : 'モアイつき。いつも見られている') },
  { id: 'kamakura', name: 'かまくら', w: 1, h: 1, out: true, fill: '#eef3f6', kit: 'kamakura', verb: 'かまくらで餅を焼く', rent: 0,
    text: () => '庭にかまくら。夏には消える' },
  { id: 'planeta', name: 'プラネタリウム', w: 2, h: 2, fill: '#2f3448', kit: 'dome', verb: '星を見る', rent: 3,
    text: (q) => (q.near(BED) ? '寝室の隣にプラネタリウム。毎晩、満天の星（天井）' : 'プラネタリウムつき。曇りの日も星が見える') },
  { id: 'karaoke', name: 'カラオケ', w: 1, h: 1, fill: '#efe3f2', kit: 'karaoke', verb: '一曲歌う', rent: 1,
    text: (q) => (q.near(BED) ? '寝室の隣にカラオケ。防音は気持ちだけ' : 'カラオケつき。十八番はお父さん') },
  { id: 'dojo', name: '道場', w: 2, h: 2, fill: '#e8d9b5', kit: 'dojo', verb: '稽古する', rent: 2,
    text: () => '道場つき。家族全員が師範代' },
  { id: 'merry', theme: 'park', name: 'メリーゴーランド', w: 2, h: 2, out: true, fill: '#ecebe6', kit: 'merry', verb: '木馬に乗る', rent: 4,
    text: () => 'メリーゴーランドつき。朝から回っている' },
  { id: 'coaster', theme: 'park', name: 'ジェットコースター', w: 4, h: 1, out: true, fill: '#ecebe6', kit: 'coaster', verb: 'ジェットコースターに乗る', rent: 6,
    text: () => 'ジェットコースターつき。通勤は速いが家に戻る' },
  { id: 'suizoku', theme: 'zoo', name: '水族館', w: 2, h: 2, fill: '#dbeef5', kit: 'aquarium', verb: '魚をながめる', rent: 3,
    text: (q) => (q.near(['ldk']) ? 'リビングの隣が水族館。焼き魚の日は気まずい' : '水族館つき。イルカショーは週末だけ') },
  { id: 'esca', name: 'エスカレーター', w: 1, h: 2, kit: 'escalator', verb: 'エスカレーターに乗る', rent: 2,
    text: (q) => (q.near(['kai']) ? '階段の隣にエスカレーター。どちらも2階はない' : 'エスカレーターつき。上った先は天井') },
  { id: 'ufo', theme: 'terminal', name: 'UFO発着場', w: 2, h: 2, out: true, fill: '#d6d4cd', kit: 'ufo', verb: '宇宙人を待つ', rent: 5,
    text: () => 'UFO発着場つき。たまに来る' },
  { id: 'ashiyu', theme: 'spa', name: '足湯', w: 1, h: 1, fill: '#cfe8f1', kit: 'ashiyu', verb: '足湯につかる', rent: 1,
    text: (q) => (q.near(['gen']) ? '玄関に足湯。帰ったらまず足だけ温泉' : '足湯つき。足だけ毎日温泉') },
  { id: 'tsuribashi', name: '吊り橋', w: 3, h: 1, out: true, fill: '#9fbf8a', kit: 'bridge', verb: '吊り橋を渡る', rent: 0,
    text: (q) => (q.through ? '寝室へは吊り橋を渡って。毎晩ゆれる' : '家の中に吊り橋。下は見ないで') },
];

// 店舗付き住宅 (2026-10-22): now and then (SHOP_P in house.js) one ordinary extra room of the house is a
// shop instead. Not rare rooms (no 図鑑, not counted as rare): TYPES 64..69, after `roka`.
// text(q): q.road → the shop faces the road (customers can find it); q.near as for rare rooms.
// color: the awning and the sign (iso.js 'shop' kit, render.js plan).
export const SHOPS = [
  { id: 'kissa', name: '喫茶店', w: 2, h: 1, fill: '#efe6d6', kit: 'shop', opt: { kind: 'kissa', color: '#7a4e2d' }, verb: 'コーヒーを淹れる', rent: 2,
    text: (q) => (q.road ? '1階は喫茶店。朝ごはんはモーニングで' : '奥に喫茶店。隠れ家すぎて客が来ない') },
  { id: 'dagashi', name: '駄菓子屋', w: 2, h: 1, fill: '#f6ead2', kit: 'shop', opt: { kind: 'dagashi', color: '#e07b39' }, verb: 'ラムネを飲む', rent: 1,
    text: (q) => (q.road ? '駄菓子屋つき。近所の子が勝手に入ってくる' : '奥に駄菓子屋。おやつは仕入れ値') },
  { id: 'nazo', name: '謎の店', w: 1, h: 1, fill: '#e6deef', kit: 'shop', opt: { kind: 'nazo', color: '#6a4c8c' }, verb: '謎の店をのぞく', rent: 1,
    text: (q) => (q.road ? '道路に面して謎の店。何を売っているかは不明' : '奥に謎の店。何屋かは家族も知らない') },
  { id: 'yaoya', name: '八百屋', w: 2, h: 1, fill: '#e4efd9', kit: 'shop', opt: { kind: 'yaoya', color: '#4f9a62' }, verb: 'キャベツを売る', rent: 1,
    text: (q) => (q.road ? '1階は八百屋。夕飯は売れ残り' : '奥に八百屋。野菜は家族で食べきる') },
  { id: 'tokoya', name: '床屋', w: 1, h: 1, fill: '#f2f0ea', kit: 'shop', opt: { kind: 'tokoya', color: '#d23a2c' }, verb: '髪を切ってもらう', rent: 1,
    text: (q) => (q.road ? '床屋つき。家族の髪型がそろう' : '奥に床屋。お客は家族だけ') },
  { id: 'takoyaki', name: 'たこ焼き屋', w: 1, h: 1, fill: '#f6e6cf', kit: 'shop', opt: { kind: 'takoyaki', color: '#c9762c' }, verb: 'たこ焼きを焼く', rent: 1,
    text: (q) => (q.road ? '1階はたこ焼き屋。夕飯はだいたいたこ焼き' : '奥にたこ焼き屋。においだけが道に出る') },
];

// テーマ揃いの見出し (2026-10-23): a house with THEME_MIN or more distinct rare rooms of one theme
// gets that theme as its headline (priority 96.5, above the rare rooms' 96). Each theme: id, name
// (the Japanese tag shown above the headline), rooms (its member rare rooms), and text(a, b) — a and b
// are the first two distinct member-room names in the order the rooms sit in the plan. The array order
// is the tie-break when two themes hold at once (first wins on equal counts).
export const THEME_MIN = 2;
export const THEMES = [
  { id: 'zoo', name: '動物園物件', rooms: ['ushi', 'zou', 'niwatori', 'penguin', 'wani', 'suizoku'],
    text: (a, b) => `${a}と${b}つき。家族より動物が多い` },
  { id: 'park', name: 'テーマパーク付き', rooms: ['wheel', 'suberi', 'merry', 'coaster', 'meiro'],
    text: (a, b) => `${a}と${b}つき。年パスは家賃込み` },
  { id: 'temple', name: '門前町', rooms: ['tera', 'torii', 'haka', 'kane', 'daibutsu', 'kamidana'],
    text: (a, b) => `${a}と${b}つき。朝から参拝客が通り抜ける` },
  { id: 'terminal', name: 'ターミナル直結', rooms: ['eki', 'heli', 'fumikiri', 'hassha', 'basutei', 'ufo'],
    text: (a, b) => `${a}と${b}つき。乗り換えは家の中で` },
  { id: 'kancho', name: '官公庁街', rooms: ['koban', 'tohyo', 'hotei', 'rou', 'tosho'],
    text: (a, b) => `${a}と${b}つき。役所の手続きは家の中で` },
  { id: 'spa', name: '温泉街', rooms: ['onsen', 'sento', 'ashiyu', 'sauna'],
    text: (a, b) => `${a}と${b}つき。毎日が湯めぐり` },
  // 出る物件 (2026-10-24, ハロウィン期間限定の生成)。rooms に既存の墓地・謎の穴・牢屋・鍾乳洞も含むが、
  // gate の新しい部屋が1つも無い家では成立しない（期間外の家・古い ?h= の見出しは変わらない）。
  // 成立したら他テーマより優先（house.js の themeOf）。
  { id: 'deru', name: '出る物件', gate: ['ido', 'akazu', 'ofuda', 'obake', 'butsuma', 'kagami'],
    rooms: ['ido', 'akazu', 'ofuda', 'obake', 'butsuma', 'kagami', 'haka', 'ana', 'rou', 'shonyu'],
    text: (a, b) => `${a}と${b}つき。告知事項あり` },
];

// ハロウィン「出る物件」(2026-10-24〜11/01 JST)。常設の RARE には入れない。TYPES の末尾
// （house.js、添字 83〜）にだけ足し、期間中の applyHalloween だけが袋へ入れる。
// 期間が終わったあとも、その家の ?h= はここの id で描ける。
export const HALLOWEEN_CLASSIC = ['haka', 'ana', 'rou', 'shonyu'];
export const HALLOWEEN = [
  { id: 'ido', theme: 'deru', name: '井戸', w: 1, h: 1, fill: '#c5d0d4', out: true, kit: 'ido', verb: '井戸をのぞく', rent: -1,
    text: (q) => (q.near(BED) ? '寝室の隣に井戸。底から名前を呼ばれる' : '庭に井戸。夜、水面が揺れる') },
  { id: 'akazu', theme: 'deru', name: '開かずの間', w: 2, h: 2, fill: '#2a2430', kit: 'akazu', verb: '開かずの間の前で立ち止まる', rent: -2,
    text: (q) => (q.near(['oshi']) ? '押入れの奥が開かずの間。家族は誰も開けない' : '開かずの間つき。扉は内側から押されている') },
  { id: 'ofuda', theme: 'deru', name: 'お札の間', w: 1, h: 1, fill: '#f4efe2', kit: 'ofuda', verb: 'お札を貼り直す', rent: 0,
    text: (q) => (q.near(BED) ? '寝室の隣がお札の間。貼った本人はもういない' : 'お札の間つき。壁が全部お札') },
  { id: 'obake', theme: 'deru', name: 'お化け屋敷', w: 2, h: 2, fill: '#3a2a38', kit: 'obake', verb: 'お化け屋敷のバイトに入る', rent: 1,
    text: (q) => (q.near(['gen']) ? '玄関の隣がお化け屋敷。お客と家族が迷う' : 'お化け屋敷つき。スタッフは家族') },
  { id: 'butsuma', theme: 'deru', name: '仏間', w: 2, h: 1, fill: '#4a3c30', kit: 'butsuma', verb: '線香をあげる', rent: 0,
    text: (q) => (q.near(BED) ? '寝室の隣が仏間。毎晩、線香のにおい' : '仏間つき。線香は切れない') },
  { id: 'kagami', theme: 'deru', name: '鏡の間', w: 1, h: 1, fill: '#d5dee6', kit: 'kagami', verb: '鏡の人数を数える', rent: -0.5,
    text: () => '鏡の間つき。人数が一人多い' },
];
