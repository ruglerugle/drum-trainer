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

// ---- パターンと曲 ----
// STAGES・SONGS は content.js（drum-billing の build-free が書き出す無料の範囲）にある。この data.js より先に読み込む。
// locked: true のパターン・曲のまとまりは有料版の続き（中身は /api/content から受け取り、applyContent で差し替える）
const lanesOf = (p) => INSTS.map((i) => i.id).filter((id) => p[id]);
const SONG = {};

// パターンに番号を付け、曲を小節の並びに展開し、練習の段階（まとまりごと → つなげる → 通し）を作る
const prepareContent = () => {
  STAGES.forEach((st, si) => st.patterns.forEach((p, pi) => {
    p.id = `${si + 1}-${pi + 1}`;
    Object.keys(p).filter((k) => INST[k]).forEach((k) => {
      if (!/^[x.]{16}$/.test(p[k])) throw new Error(`パターン ${p.id} の ${k} が16文字の x/. ではありません: ${p[k]}`);
    });
  }));
  SONGS.forEach((s) => {
    Object.entries(s.parts).forEach(([name, p]) => Object.keys(p).forEach((k) => {
      if (!INST[k]) throw new Error(`曲 ${s.id} のパート ${name} に知らない楽器 ${k} があります`);
      if (!/^[x.]{16}$/.test(p[k])) throw new Error(`曲 ${s.id} のパート ${name} の ${k} が16文字の x/. ではありません: ${p[k]}`);
      if (s.swing && [...p[k]].some((c, slot) => c === 'x' && slot % 2 === 1)) throw new Error(`曲 ${s.id} のパート ${name}（${k}）：シャッフルの曲に16分音符があります`);
    }));
    s.bars = [];
    // 鍵つきの曲は、中身のあるまとまり（最初のまとまり）だけを展開する
    s.sections = s.form.filter((f) => f.bars).map((f) => {
      const start = s.bars.length;
      f.bars.split(' ').forEach((n) => {
        if (!s.parts[n]) throw new Error(`曲 ${s.id} の「${f.name}」に無いパート ${n} があります`);
        s.bars.push(s.parts[n]);
      });
      return { name: f.name, start, end: s.bars.length };
    });
    s.sectionNames = s.form.map((f) => f.name);
    s.fullBars = s.fullBars ?? s.bars.length;
    const n = s.form.length;
    const half = Math.ceil(n / 2);
    // 鍵つきの曲の続きの段階（locked）は、最初のまとまりの範囲を仮に入れておく（選ぶと有料版の案内を出す）
    const range = (a, b) => (s.locked ? { start: s.sections[0].start, end: s.sections[0].end } : { start: s.sections[a].start, end: s.sections[b].end });
    const lock = (open) => (s.locked && !open ? { locked: true } : {});
    const names = s.sectionNames;
    s.steps = [
      ...names.map((nm, i) => ({ key: `p${i + 1}`, label: `${i + 1}. ${nm}`, short: nm, factor: 0.7, ...range(i, i), ...lock(i === 0) })),
      { key: 'j1', label: `つなげる（${names[0]}〜${names[half - 1]}）`, short: 'つなげる前半', factor: 0.8, ...range(0, half - 1), ...lock(false) },
      { key: 'j2', label: `つなげる（${names[half]}〜${names[n - 1]}）`, short: 'つなげる後半', factor: 0.8, ...range(half, n - 1), ...lock(false) },
      { key: 't60', label: '通し（テンポ60%）', short: '通し60%', factor: 0.6, stars: 1, ...range(0, n - 1), ...lock(false) },
      { key: 't80', label: '通し（テンポ80%）', short: '通し80%', factor: 0.8, stars: 2, ...range(0, n - 1), ...lock(false) },
      { key: 't100', label: '通し（テンポ100%）', short: '通し100%', factor: 1, stars: 3, ...range(0, n - 1), ...lock(false) },
    ];
  });
  Object.keys(SONG).forEach((k) => { delete SONG[k]; });
  SONGS.forEach((s) => { SONG[s.id] = s; });
};
prepareContent();

// 有料版の完全版（/api/content の stages・songs）に差し替える
const applyContent = (stages, songs) => {
  STAGES.splice(0, STAGES.length, ...stages);
  SONGS.splice(0, SONGS.length, ...songs);
  prepareContent();
};
// 鍵つき（有料版の続き）が残っているか
const hasLocked = () => STAGES.some((st) => st.patterns.some((p) => p.locked)) || SONGS.some((s) => s.locked);
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
