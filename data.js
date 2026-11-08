'use strict';
// 練習画面（index.html）と練習記録（mypage/）で共通に使うデータ

// ---- 楽器 ----
// key: 打楽器譜での位置。voice: up = 手（符尾が上）/ down = 足（符尾が下）
const INSTS = [
  { id: 'cr', name: 'クラッシュ', pad: 'クラッシュ', key: 'a/5/x2', voice: 'up', kind: 'cym', code: 'KeyY', label: 'Y', midi: [49, 57, 55, 52] },
  { id: 'ho', name: 'ハイハット（オープン）', pad: 'HH オープン', key: 'g/5/x2', open: true, voice: 'up', kind: 'cym', code: 'KeyI', label: 'I', midi: [46, 26] },
  { id: 'hh', name: 'ハイハット（クローズ）', pad: 'HH クローズ', key: 'g/5/x2', voice: 'up', kind: 'cym', code: 'KeyK', label: 'K', midi: [42, 22] },
  { id: 'rd', name: 'ライド', pad: 'ライド', key: 'f/5/x2', voice: 'up', kind: 'cym', code: 'KeyP', label: 'P', midi: [51, 59, 53] },
  { id: 't1', name: 'タム1（ハイタム）', pad: 'タム1', key: 'e/5', voice: 'up', kind: 'drum', code: 'KeyU', label: 'U', midi: [48, 50] },
  { id: 't2', name: 'タム2（ロータム）', pad: 'タム2', key: 'd/5', voice: 'up', kind: 'drum', code: 'KeyO', label: 'O', midi: [45, 47] },
  { id: 'sd', name: 'スネア', pad: 'スネア', key: 'c/5', voice: 'up', kind: 'drum', code: 'KeyJ', label: 'J', midi: [38, 40, 37] },
  { id: 'ft', name: 'フロアタム', pad: 'フロアタム', key: 'a/4', voice: 'up', kind: 'drum', code: 'KeyL', label: 'L', midi: [43, 41, 58] },
  { id: 'bd', name: 'キック（バスドラム）', pad: 'キック', key: 'f/4', voice: 'down', kind: 'foot', code: 'Space', label: 'Space', midi: [36, 35] },
  { id: 'hp', name: 'ハイハット（ペダル）', pad: 'HH ペダル', key: 'd/4/x2', voice: 'down', kind: 'foot', code: 'KeyN', label: 'N', midi: [44] },
];
const INST = Object.fromEntries(INSTS.map((i) => [i.id, i]));
const PAD_ORDER = ['ho', 'cr', 't1', 't2', 'rd', 'hh', 'hp', 'sd', 'bd', 'ft'];
const CODE_TO_INST = { ...Object.fromEntries(INSTS.map((i) => [i.code, i.id])), KeyF: 'bd' };
const keyStep = (key) => { const [l, o] = key.split('/'); return Number(o) * 7 + 'cdefgab'.indexOf(l); };
const defaultMidiMap = () => Object.fromEntries(INSTS.map((i) => [i.id, [...i.midi]]));

// ---- パターン（1小節 = 16分音符16個、x = 叩く）----
const HH8 = 'x.x.x.x.x.x.x.x.';
const SD24 = '....x.......x...';
const HH16 = 'xxxx.xxxxxxx.xxx';
const STAGES = [
  { short: '4分', title: '4分音符のビート', desc: '1拍に1つずつ。拍に合わせて叩くことに慣れましょう。', patterns: [
    { name: 'キックだけ', bd: 'x...x...x...x...' },
    { name: 'キックとスネア', sd: SD24, bd: 'x.......x.......' },
    { name: 'ハイハットを足す', hh: 'x...x...x...x...', sd: SD24, bd: 'x.......x.......' },
    { name: 'キックを3つ', hh: 'x...x...x...x...', sd: SD24, bd: 'x...x...x.......' },
    { name: '休符のある小節', hh: 'x...x...x.......', sd: '....x...........', bd: 'x.......x.......' },
    { name: 'クラッシュとライド', cr: 'x...............', rd: '....x...x...x...', sd: SD24, bd: 'x.......x.......' },
  ] },
  { short: '8ビート', title: '8ビート', desc: 'ハイハットを8分音符で刻む、いちばん基本のリズム。キックの位置が少しずつ変わります。', patterns: [
    { name: '基本の8ビート', hh: HH8, sd: SD24, bd: 'x.......x.......' },
    { name: '3拍目のウラにキック', hh: HH8, sd: SD24, bd: 'x.......x.x.....' },
    { name: '1拍目のウラにキック', hh: HH8, sd: SD24, bd: 'x.x.....x.......' },
    { name: '2拍目のウラにキック', hh: HH8, sd: SD24, bd: 'x.....x.x.......' },
    { name: '4拍目のウラにキック', hh: HH8, sd: SD24, bd: 'x.......x.....x.' },
    { name: 'キックを4つ', hh: HH8, sd: SD24, bd: 'x.x.....x.x.....' },
    { name: 'ライドで刻む', rd: HH8, sd: SD24, bd: 'x.....x.x.......' },
  ] },
  { short: 'シンバル', title: 'シンバルとオープンハイハット', desc: '記号の違いを読み分けます。○の付いたハイハットは、足をゆるめて開いた音です。', patterns: [
    { name: '4拍目のウラでオープン', hh: 'x.x.x.x.x.x.x...', ho: '..............x.', sd: SD24, bd: 'x.......x.......' },
    { name: '2拍目のウラでオープン', hh: 'x.x.x...x.x.x.x.', ho: '......x.........', sd: SD24, bd: 'x.......x.x.....' },
    { name: '1拍目にクラッシュ', cr: 'x...............', hh: '..x.x.x.x.x.x.x.', sd: SD24, bd: 'x.......x.......' },
    { name: 'ライドとペダル', rd: HH8, sd: SD24, bd: 'x.......x.......', hp: '....x.......x...' },
    { name: 'ウラでペダル', rd: 'x...x...x...x...', sd: SD24, bd: 'x.......x.......', hp: '..x...x...x...x.' },
    { name: 'スネアを続けて', hh: HH8, sd: '....x.......x.x.', bd: 'x.......x.x.....' },
  ] },
  { short: '16分HH', title: '16分のハイハット', desc: 'ハイハットを16分音符で。両手で交互に刻み、スネアを叩く所だけハイハットを休みます。', patterns: [
    { name: '16分の基本', hh: HH16, sd: SD24, bd: 'x.......x.......' },
    { name: '3拍目のウラにキック', hh: HH16, sd: SD24, bd: 'x.......x.x.....' },
    { name: 'キックを4つ', hh: HH16, sd: SD24, bd: 'x.x.....x.x.....' },
    { name: '2拍目のウラにキック', hh: HH16, sd: SD24, bd: 'x.....x.x.......' },
    { name: '最後にオープン', hh: 'xxxx.xxxxxxx.x..', ho: '..............x.', sd: SD24, bd: 'x.......x.......' },
  ] },
  { short: '16分キック', title: '16分のキック', desc: 'ハイハットは8分のまま、キックが16分音符の位置に入ります。', patterns: [
    { name: '2拍目の最後', hh: HH8, sd: SD24, bd: 'x......xx.......' },
    { name: '1拍目の最後', hh: HH8, sd: SD24, bd: 'x..x....x.......' },
    { name: '3拍目の最後', hh: HH8, sd: SD24, bd: 'x.......x..x....' },
    { name: 'ウラと16分', hh: HH8, sd: SD24, bd: 'x.x....xx.......' },
    { name: '1拍目に2つ', hh: HH8, sd: SD24, bd: 'x..x..x.x.......' },
    { name: '16分を2か所', hh: HH8, sd: SD24, bd: 'x......xx..x....' },
  ] },
  { short: '16分スネア', title: '16分のスネア', desc: 'スネアが拍のウラや16分音符の位置に入るリズム。', patterns: [
    { name: '2拍目の最後にスネア', hh: HH8, sd: '....x..x....x...', bd: 'x.......x.x.....' },
    { name: '小節の最後にスネア', hh: HH8, sd: '....x.......x..x', bd: 'x.......x.x.....' },
    { name: 'スネアを3つ', hh: HH8, sd: '....x..x.x..x...', bd: 'x.......x.......' },
    { name: 'ハーフタイム', hh: HH8, sd: '........x.......', bd: 'x......x..x.....' },
    { name: 'すき間を埋める', hh: HH8, sd: '....x..x.x..x..x', bd: 'x.x.....x.x.....' },
  ] },
  { short: 'フィル', title: 'フィルイン', desc: '最後の拍やまる1小節で、スネアやタムを回します。', patterns: [
    { name: '4拍目にスネア16分', hh: 'x.x.x.x.x.x.....', sd: '....x.......xxxx', bd: 'x.......x.......' },
    { name: '4拍目でタムを回す', hh: 'x.x.x.x.x.x.....', sd: '....x.......x...', t1: '.............x..', t2: '..............x.', ft: '...............x', bd: 'x.......x.......' },
    { name: '8分で1周', sd: 'x.x.............', t1: '....x.x.........', t2: '........x.x.....', ft: '............x.x.', bd: 'x...x...x...x...' },
    { name: '16分で1周', sd: 'xxxx............', t1: '....xxxx........', t2: '........xxxx....', ft: '............xxxx', bd: 'x...x...x...x...' },
    { name: '後半でフィル', hh: 'x.x.x.x.........', sd: '....x...xxxx....', t2: '............xx..', ft: '..............xx', bd: 'x.......x.......' },
    { name: '手・手・足', sd: 'xx..xx..xx..xx..', bd: '..x...x...x...x.' },
  ] },
  { short: 'ウラ拍', title: 'ウラ拍とシンコペーション', desc: '拍の頭ではない所に大事な音がくるリズム。', patterns: [
    { name: 'ウラでオープン', hh: 'x...x...x...x...', ho: '..x...x...x...x.', sd: SD24, bd: 'x...x...x...x...' },
    { name: 'ウラだけハイハット', hh: '..x...x...x...x.', sd: SD24, bd: 'x...x...x...x...' },
    { name: 'ウラでクラッシュ', cr: '......x.........', hh: 'x.x.x...x.x.x.x.', sd: SD24, bd: 'x.....x.........' },
    { name: 'キメ', cr: 'x.....x.....x...', sd: '..............x.', bd: 'x.....x.....x...' },
    { name: 'ウラのキック', hh: HH8, sd: SD24, bd: 'x.....x.......x.' },
  ] },
];
STAGES.forEach((st, si) => st.patterns.forEach((p, pi) => {
  p.id = `${si + 1}-${pi + 1}`;
  Object.keys(p).filter((k) => INST[k]).forEach((k) => {
    if (!/^[x.]{16}$/.test(p[k])) throw new Error(`パターン ${p.id} の ${k} が16文字の x/. ではありません: ${p[k]}`);
  });
}));
const lanesOf = (p) => INSTS.map((i) => i.id).filter((id) => p[id]);

// ---- 曲（ジャンルごとのオリジナル練習曲）----
// parts：この曲で使う1小節のパターン。form：まとまり（ふつう4小節）ごとの小節の並び
// swing: true の曲は8分音符のウラを3連符の3つ目（2/3拍）にずらして叩く（16分音符は使わない）
const END = { cr: 'x...............', bd: 'x...............' };
const SONGS = [
  {
    id: 'rock8', title: 'はじめての8ビート', genre: 'ロック', tempo: 96,
    desc: '基本の8ビートに、クラッシュとかんたんなフィルを足した曲。',
    parts: {
      C: { cr: 'x...............', hh: '..x.x.x.x.x.x.x.', sd: SD24, bd: 'x.......x.......' },
      A: { hh: HH8, sd: SD24, bd: 'x.......x.......' },
      B: { hh: HH8, sd: SD24, bd: 'x.......x.x.....' },
      F: { hh: 'x.x.x.x.x.x.....', sd: '....x.......xxxx', bd: 'x.......x.......' },
      G: { hh: 'x.x.x.x.........', sd: '....x...x.x.....', t2: '............x...', ft: '..............x.', bd: 'x.......x.......' },
      E: END,
    },
    form: [
      { name: 'イントロ', bars: 'C A A F' },
      { name: 'Aメロ', bars: 'A B A G' },
      { name: 'サビ', bars: 'C B C F' },
      { name: 'エンディング', bars: 'A B G E' },
    ],
  },
  {
    id: 'pop8', title: 'ポップス8ビート', genre: 'ポップス', tempo: 108,
    desc: 'キックがウラに入る8ビートと、オープンハイハット。Bメロでタムが出てきます。',
    parts: {
      R: { cr: 'x...............', hh: '..x.x.x.x.x.x.x.', sd: SD24, bd: 'x.....x.x.......' },
      S: { hh: HH8, sd: SD24, bd: 'x.....x.x.x.....' },
      A: { hh: HH8, sd: SD24, bd: 'x.....x.x.......' },
      B: { hh: 'x.x.x.x.x.x.x...', ho: '..............x.', sd: SD24, bd: 'x.....x.x.x.....' },
      F: { hh: 'x.x.x.x.........', sd: '....x...x.x.x.x.', bd: 'x.......x.......' },
      G: { hh: 'x.x.x.x.x.x.....', sd: '....x.......xx..', t2: '..............x.', ft: '...............x', bd: 'x.......x.......' },
      E: { cr: 'x.....x.........', bd: 'x.....x.........' },
    },
    form: [
      { name: 'イントロ', bars: 'R S R F' },
      { name: 'Aメロ', bars: 'A A A B' },
      { name: 'Bメロ', bars: 'A B A G' },
      { name: 'サビ', bars: 'R S R F' },
      { name: 'エンディング', bars: 'R S G E' },
    ],
  },
  {
    id: 'beat16', title: '16ビート', genre: '16ビート', tempo: 84,
    desc: 'ハイハットを16分音符で刻む曲。スネアの所だけハイハットを休みます。',
    parts: {
      C: { cr: 'x...............', hh: '.xxx.xxxxxxx.xxx', sd: SD24, bd: 'x.......x.x.....' },
      A: { hh: HH16, sd: SD24, bd: 'x.......x.x.....' },
      B: { hh: HH16, sd: SD24, bd: 'x..x....x.x.....' },
      F: { hh: 'xxxx.xxxxxxx....', sd: '....x.......xxxx', bd: 'x.......x.x.....' },
      G: { hh: 'xxxx.xxx........', sd: '....x...xx......', t1: '..........xx....', t2: '............xx..', ft: '..............xx', bd: 'x.......x.......' },
      E: END,
    },
    form: [
      { name: 'イントロ', bars: 'C A B F' },
      { name: 'Aメロ', bars: 'A B A G' },
      { name: 'サビ', bars: 'C B A F' },
      { name: 'エンディング', bars: 'A B G E' },
    ],
  },
  {
    id: 'disco', title: '4つ打ちディスコ', genre: 'ディスコ', tempo: 112,
    desc: 'キックが4分音符で続き、ハイハットはウラで開きます。',
    parts: {
      A: { hh: 'x...x...x...x...', ho: '..x...x...x...x.', sd: SD24, bd: 'x...x...x...x...' },
      B: { hh: 'x...x...x...x...', ho: '..x...x...x...x.', sd: '....x.......x..x', bd: 'x...x...x...x...' },
      C: { cr: 'x...............', hh: '....x...x...x...', ho: '..x...x...x...x.', sd: SD24, bd: 'x...x...x...x...' },
      F: { hh: 'x...x...........', ho: '..x...x.........', sd: '....x...xxxxxxxx', bd: 'x...x...x...x...' },
      E: END,
    },
    form: [
      { name: 'イントロ', bars: 'A A A F' },
      { name: 'Aメロ', bars: 'A B A B' },
      { name: 'サビ', bars: 'C A C F' },
      { name: 'エンディング', bars: 'C A F E' },
    ],
  },
  {
    id: 'funk', title: 'ファンク', genre: 'ファンク', tempo: 88,
    desc: 'キックとスネアが16分音符のすき間に入る、はねたリズム。最後はキメ。',
    parts: {
      C: { cr: 'x...............', hh: '..x.x.x.x.x.x.x.', sd: '....x..x.x..x...', bd: 'x..x......x..x..' },
      A: { hh: HH8, sd: '....x..x.x..x...', bd: 'x..x......x..x..' },
      B: { hh: HH8, sd: '....x..x....x..x', bd: 'x.x...x...xx....' },
      F: { hh: 'x.x.x.x.........', sd: '....x...xx.xx.x.', bd: 'x..x......x..x..' },
      K: { cr: 'x.....x.....x...', sd: '..............x.', bd: 'x.....x.....x...' },
      E: END,
    },
    form: [
      { name: 'イントロ', bars: 'C A B F' },
      { name: 'Aメロ', bars: 'A B A B' },
      { name: 'サビ', bars: 'C A K F' },
      { name: 'エンディング', bars: 'A B K E' },
    ],
  },
  {
    id: 'shuffle', title: 'シャッフル', genre: 'シャッフル', tempo: 100, swing: true,
    desc: '8分音符を「タッ・カ」とはねて叩きます（ウラの音は拍の3分の2の所）。サビからはライドとペダル。',
    parts: {
      C: { cr: 'x...............', hh: '..x.x.x.x.x.x.x.', sd: SD24, bd: 'x.......x.......' },
      A: { hh: HH8, sd: SD24, bd: 'x.......x.......' },
      B: { hh: HH8, sd: SD24, bd: 'x.....x.x.......' },
      R: { rd: HH8, sd: SD24, bd: 'x.....x.x.......', hp: '....x.......x...' },
      F: { hh: 'x.x.x.x.........', sd: '....x...x.x.x.x.', bd: 'x.......x.......' },
      G: { hh: 'x.x.x.x.........', sd: '....x...x.x.....', t1: '............x...', ft: '..............x.', bd: 'x.......x.......' },
      E: END,
    },
    form: [
      { name: 'イントロ', bars: 'C A B F' },
      { name: 'Aメロ', bars: 'A B A G' },
      { name: 'サビ', bars: 'C R R F' },
      { name: 'エンディング', bars: 'R R G E' },
    ],
  },
  {
    id: 'halftime', title: 'ハーフタイム', genre: 'ハーフタイム', tempo: 120,
    desc: 'スネアを3拍目だけにして、ゆったり聞こえるリズム。速いテンポでも叩く数は少なめです。',
    parts: {
      C: { cr: 'x...............', hh: '..x.x.x.x.x.x.x.', sd: '........x.......', bd: 'x......x..x.....' },
      A: { hh: HH8, sd: '........x.......', bd: 'x......x..x.....' },
      B: { hh: HH8, sd: '........x.......', bd: 'x.x.......x.....' },
      G: { hh: HH8, sd: '........x.....x.', bd: 'x.x.......x.x...' },
      F: { hh: 'x.x.x.x.........', sd: '........xxxx....', t2: '............xx..', ft: '..............xx', bd: 'x.......x.......' },
      E: END,
    },
    form: [
      { name: 'イントロ', bars: 'C A B F' },
      { name: 'Aメロ', bars: 'A B A G' },
      { name: 'サビ', bars: 'C G B F' },
      { name: 'エンディング', bars: 'A G F E' },
    ],
  },
  {
    id: 'ballad', title: 'バラード', genre: 'バラード', tempo: 68,
    desc: 'ゆっくりの曲。サビでライドとクラッシュに持ちかえ、16分音符のタム回しで盛り上げます。',
    parts: {
      A: { hh: HH8, sd: SD24, bd: 'x.......x.......' },
      B: { hh: HH8, sd: SD24, bd: 'x......xx.......' },
      F: { hh: 'x.x.x.x.x.x.....', sd: '....x.......xxxx', bd: 'x.......x.......' },
      C: { cr: 'x...............', rd: '..x.x.x.x.x.x.x.', sd: SD24, bd: 'x.......x.x.....' },
      R: { rd: HH8, sd: SD24, bd: 'x.......x.x.....' },
      G: { hh: 'x.x.x.x.........', sd: '....x...xx......', t1: '..........xx....', t2: '............xx..', ft: '..............xx', bd: 'x.......x.......' },
      E: END,
    },
    form: [
      { name: 'イントロ', bars: 'A B A F' },
      { name: 'Aメロ', bars: 'A B A F' },
      { name: 'サビ', bars: 'C R R G' },
      { name: 'エンディング', bars: 'C R G E' },
    ],
  },
];

// 曲を小節の並びに展開し、練習の段階（まとまりごと → つなげる → 通し）を作る
SONGS.forEach((s) => {
  Object.entries(s.parts).forEach(([name, p]) => Object.keys(p).forEach((k) => {
    if (!INST[k]) throw new Error(`曲 ${s.id} のパート ${name} に知らない楽器 ${k} があります`);
    if (!/^[x.]{16}$/.test(p[k])) throw new Error(`曲 ${s.id} のパート ${name} の ${k} が16文字の x/. ではありません: ${p[k]}`);
    if (s.swing && [...p[k]].some((c, slot) => c === 'x' && slot % 2 === 1)) throw new Error(`曲 ${s.id} のパート ${name}（${k}）：シャッフルの曲に16分音符があります`);
  }));
  s.bars = [];
  s.sections = s.form.map((f) => {
    const start = s.bars.length;
    f.bars.split(' ').forEach((n) => {
      if (!s.parts[n]) throw new Error(`曲 ${s.id} の「${f.name}」に無いパート ${n} があります`);
      s.bars.push(s.parts[n]);
    });
    return { name: f.name, start, end: s.bars.length };
  });
  const n = s.sections.length;
  const half = Math.ceil(n / 2);
  const range = (a, b) => ({ start: s.sections[a].start, end: s.sections[b].end });
  s.steps = [
    ...s.sections.map((sec, i) => ({ key: `p${i + 1}`, label: `${i + 1}. ${sec.name}`, short: sec.name, factor: 0.7, ...range(i, i) })),
    { key: 'j1', label: `つなげる（${s.sections[0].name}〜${s.sections[half - 1].name}）`, short: 'つなげる前半', factor: 0.8, ...range(0, half - 1) },
    { key: 'j2', label: `つなげる（${s.sections[half].name}〜${s.sections[n - 1].name}）`, short: 'つなげる後半', factor: 0.8, ...range(half, n - 1) },
    { key: 't60', label: '通し（テンポ60%）', short: '通し60%', factor: 0.6, stars: 1, ...range(0, n - 1) },
    { key: 't80', label: '通し（テンポ80%）', short: '通し80%', factor: 0.8, stars: 2, ...range(0, n - 1) },
    { key: 't100', label: '通し（テンポ100%）', short: '通し100%', factor: 1, stars: 3, ...range(0, n - 1) },
  ];
});
const SONG = Object.fromEntries(SONGS.map((s) => [s.id, s]));
const stepBpm = (song, step) => Math.round(song.tempo * step.factor);
// ★：通しを 60% でクリア→1つ、80%→2つ、100%→3つ
const songStars = (song, rec) => Math.max(0, ...song.steps.filter((st) => st.stars && rec?.steps?.[st.key]?.cleared).map((st) => st.stars));
const starText = (n) => '★'.repeat(n) + '☆'.repeat(3 - n);

// ---- 日ごとの練習の記録 ----
const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const emptyDay = () => ({ sec: 0, bars: 0, offN: 0, offSum: 0, offSq: 0 });
// 今日まで続けて練習した日数（今日まだ叩いていなければ昨日から数える）
const streakDays = (daily) => {
  const d = new Date();
  if (!(daily[dayKey(d)]?.sec > 0)) d.setDate(d.getDate() - 1);
  let n = 0;
  while (daily[dayKey(d)]?.sec > 0) { n += 1; d.setDate(d.getDate() - 1); }
  return n;
};
