(() => {
  'use strict';

  // ---------- storage ----------
  const KEY = 'languages-progress-v1';
  const blank = () => ({ done: [], checks: {}, theme: 'default', medals: [], flags: {} });
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      return s && Array.isArray(s.done) ? Object.assign(blank(), s) : blank();
    } catch { return blank(); }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode etc. */ }
  }
  let state = load();

  // ---------- dates ----------
  const dateKey = (d = new Date()) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const parseKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
  const dayDiff = (a, b) => Math.round((parseKey(b) - parseKey(a)) / 86400000);
  const prettyDate = k => parseKey(k).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  // ---------- derived ----------
  const today = () => dateKey();
  const doneToday = () => state.done.find(d => d.date === today());
  const currentLesson = () => (doneToday() ? doneToday().lesson : state.done.length);
  const lessonWords = i => LESSONS[i % LESSONS.length];
  const wordsLearned = () => state.done.length * 3;

  function uniqueDates() {
    return [...new Set(state.done.map(d => d.date))].sort();
  }
  function currentStreak() {
    const dates = uniqueDates();
    if (!dates.length) return 0;
    const last = dates[dates.length - 1];
    if (dayDiff(last, today()) > 1) return 0; // broke the chain
    let s = 1;
    for (let i = dates.length - 1; i > 0; i--) {
      if (dayDiff(dates[i - 1], dates[i]) === 1) s++; else break;
    }
    return s;
  }
  function bestStreak() {
    const dates = uniqueDates();
    let best = 0, run = 0;
    dates.forEach((d, i) => {
      run = i && dayDiff(dates[i - 1], d) === 1 ? run + 1 : 1;
      best = Math.max(best, run);
    });
    return best;
  }

  // ---------- medals & prizes ----------
  const MEDALS = [
    { id: 'first', icon: '🌱', name: 'First Steps', desc: 'Finish your first day', test: s => s.lessons >= 1 },
    { id: 's3', icon: '🥉', name: 'Hat Trick', desc: '3-day streak', test: s => s.best >= 3 },
    { id: 's7', icon: '🥈', name: 'Week Warrior', desc: '7-day streak', test: s => s.best >= 7 },
    { id: 's14', icon: '🥇', name: 'Fortnight Fighter', desc: '14-day streak', test: s => s.best >= 14 },
    { id: 's30', icon: '🏆', name: 'Monthly Master', desc: '30-day streak', test: s => s.best >= 30 },
    { id: 's60', icon: '💎', name: 'Diamond Habit', desc: '60-day streak', test: s => s.best >= 60 },
    { id: 's100', icon: '👑', name: 'Legend', desc: '100-day streak', test: s => s.best >= 100 },
    { id: 'w15', icon: '📗', name: 'Word Collector', desc: 'Learn 15 words', test: s => s.words >= 15 },
    { id: 'w30', icon: '📘', name: 'Bookworm', desc: 'Learn 30 words', test: s => s.words >= 30 },
    { id: 'w60', icon: '📙', name: 'Chatterbox', desc: 'Learn 60 words', test: s => s.words >= 60 },
    { id: 'w90', icon: '📕', name: 'Wordsmith', desc: 'Learn 90 words', test: s => s.words >= 90 },
    { id: 'w150', icon: '🌍', name: 'Polyglot', desc: 'Finish all 150 words', test: s => s.words >= 150 },
    { id: 'w300', icon: '🚀', name: 'Second Lap', desc: '300 words practised', test: s => s.words >= 300 },
    { id: 'early', icon: '🐓', name: 'Early Bird', desc: 'Finish a day before 8 am', test: s => s.flags.early },
    { id: 'night', icon: '🦉', name: 'Night Owl', desc: 'Finish a day after 10 pm', test: s => s.flags.night },
    { id: 'weekend', icon: '🎉', name: 'Weekend Hero', desc: 'Learn on a Saturday or Sunday', test: s => s.flags.weekend },
    { id: 'comeback', icon: '💪', name: 'Comeback Kid', desc: 'Come back after a break', test: s => s.flags.comeback },
  ];
  const THEMES = [
    { id: 'default', name: 'Classic', sw: 'linear-gradient(90deg,#5b4bff,#ff5ea8)', need: 'Always yours', ok: () => true },
    { id: 'ocean', name: 'Ocean', sw: 'linear-gradient(90deg,#0077c8,#00b3a4)', need: '3-day streak', ok: s => s.best >= 3 },
    { id: 'sunset', name: 'Sunset', sw: 'linear-gradient(90deg,#e8590c,#d6336c)', need: '7-day streak', ok: s => s.best >= 7 },
    { id: 'forest', name: 'Forest', sw: 'linear-gradient(90deg,#2b8a3e,#94a82a)', need: '14-day streak', ok: s => s.best >= 14 },
    { id: 'galaxy', name: 'Galaxy', sw: 'linear-gradient(90deg,#14122b,#9b8cff)', need: 'Learn 60 words', ok: s => s.words >= 60 },
    { id: 'gold', name: 'Gold', sw: 'linear-gradient(90deg,#b8860b,#ffd43b)', need: '30-day streak', ok: s => s.best >= 30 },
  ];
  const summary = () => ({ lessons: state.done.length, words: wordsLearned(), best: bestStreak(), streak: currentStreak(), flags: state.flags });

  // ---------- praise ----------
  const TAP_PRAISE = ['Nice! 👏', '¡Muy bien! 🇪🇸', 'Отлично! 🇷🇺', '很好! 🇨🇳', 'Great job! ⭐', '¡Genial! ✨', 'Молодец! 💪', '加油! 🚀', 'You got it! 🎯', 'Brilliant! 💡'];
  const DONE_PRAISE = [
    ['Fantastic!', 'Three new words in three languages — that\'s nine new things in your brain today.'],
    ['¡Increíble!', 'You showed up and did the work. That\'s how fluency is built.'],
    ['Великолепно!', 'Another day, another win. Your future self says thanks.'],
    ['太棒了!', 'Little by little, every day. You\'re doing exactly that.'],
    ['Superstar!', 'Consistency beats intensity — and you\'re consistent.'],
    ['Bravo!', 'Your vocabulary just got bigger. See you tomorrow!'],
  ];
  const pick = a => a[Math.floor(Math.random() * a.length)];

  // ---------- speech ----------
  const LANGS = [
    { code: 'ru', bcp: 'ru-RU', flag: '🇷🇺', name: 'Russian', text: w => w.ru, rom: w => w.ruRom },
    { code: 'es', bcp: 'es-ES', flag: '🇪🇸', name: 'Spanish', text: w => w.es, rom: () => '' },
    { code: 'zh', bcp: 'zh-CN', flag: '🇨🇳', name: 'Chinese', text: w => w.zh, rom: w => w.py },
  ];
  const synth = window.speechSynthesis;
  let voices = [];
  function loadVoices() {
    if (!synth) return;
    voices = synth.getVoices();
    checkVoices();
  }
  function voiceFor(code) {
    const list = voices.filter(v => v.lang && v.lang.toLowerCase().replace('_', '-').startsWith(code));
    if (code === 'zh') return list.find(v => /zh-cn|cmn/i.test(v.lang)) || list[0];
    return list.find(v => /google|natural|premium|enhanced/i.test(v.name)) || list[0];
  }
  function speak(text, lang, btn) {
    if (!synth) { toast('Your browser does not support audio playback 😕'); return; }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[¿?？！!]/g, ''));
    u.lang = lang.bcp;
    const v = voiceFor(lang.code);
    if (v) u.voice = v;
    u.rate = 0.8;
    document.querySelectorAll('.say.playing').forEach(b => b.classList.remove('playing'));
    if (btn) {
      btn.classList.add('playing');
      const stop = () => btn.classList.remove('playing');
      u.onend = stop; u.onerror = stop;
      setTimeout(stop, 4000);
    }
    synth.speak(u);
  }
  function checkVoices() {
    const note = $('#voiceNote');
    if (!synth) { note.textContent = 'Audio isn\'t supported in this browser. Try Chrome, Edge or Safari.'; note.classList.remove('hidden'); return; }
    if (!voices.length) return;
    const missing = LANGS.filter(l => !voiceFor(l.code)).map(l => l.name);
    if (missing.length) {
      note.textContent = `🔈 Your device has no ${missing.join(' / ')} voice installed, so pronunciation may sound off. Add one in your system's speech/language settings, or try Chrome.`;
      note.classList.remove('hidden');
    } else note.classList.add('hidden');
  }

  // ---------- UI helpers ----------
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.add('hidden'), 1800);
  }
  function langRow(w, l, idx, small) {
    const rom = l.rom(w);
    return small
      ? `<div class="mini"><button class="say" data-say="${idx}" data-lang="${l.code}" aria-label="Play ${l.name}">🔊</button><span class="t"><b>${esc(l.text(w))}</b>${rom ? `<span class="rom">${esc(rom)}</span>` : ''}</span></div>`
      : `<div class="lang"><span class="flag" title="${l.name}">${l.flag}</span><span><div class="native ${l.code}">${esc(l.text(w))}</div>${rom ? `<div class="rom">${esc(rom)}</div>` : `<div class="rom">${l.name}</div>`}</span><button class="say" data-say="${idx}" data-lang="${l.code}" aria-label="Play ${l.name}">🔊</button></div>`;
  }

  // ---------- render: today ----------
  function renderToday() {
    const i = currentLesson();
    const words = lessonWords(i);
    const finished = !!doneToday();
    const checks = finished ? [true, true, true] : (state.checks[i] || [false, false, false]);
    const round = Math.floor(i / LESSONS.length) + 1;
    $('#lessonTitle').textContent = `Day ${i + 1}`;
    $('#lessonSub').textContent = `${new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}${round > 1 ? ` · review round ${round}` : ''}`;
    const n = checks.filter(Boolean).length;
    $('#progressBar').style.width = `${(n / 3) * 100}%`;
    $('#progressText').textContent = `${n} / 3`;

    const banner = $('#doneBanner');
    if (finished) {
      const st = currentStreak();
      banner.innerHTML = `✅ Today's words are done! 🔥 ${st}-day streak. Come back tomorrow for 3 new words.`;
      banner.classList.remove('hidden');
    } else if (state.done.length && currentStreak() === 0) {
      banner.innerHTML = `👋 Welcome back! Your streak reset, but your ${wordsLearned()} words are still yours. Let's start a new streak today.`;
      banner.classList.remove('hidden');
    } else banner.classList.add('hidden');

    $('#cards').innerHTML = words.map((w, k) => `
      <article class="card ${checks[k] ? 'done' : ''}">
        <div class="card-top"><span class="emoji">${w.emoji}</span><div><div class="en">${esc(w.en)}</div><div class="en-sub">Word ${k + 1} of 3</div></div></div>
        ${LANGS.map(l => langRow(w, l, `t${k}`, false)).join('')}
        <div class="card-actions">
          <button class="btn ghost" data-sayall="${k}" aria-label="Play all three">▶ All</button>
          <button class="check ${checks[k] ? 'on' : ''}" data-check="${k}" ${finished ? 'disabled' : ''}>${checks[k] ? '✔ Learned' : 'V  Mark learned'}</button>
        </div>
      </article>`).join('');
  }

  // ---------- render: learned ----------
  function renderLearned() {
    const q = $('#search').value.trim().toLowerCase();
    const groups = [...state.done].reverse().map(d => {
      let ws = lessonWords(d.lesson).map((w, k) => ({ w, k }));
      if (q) ws = ws.filter(({ w }) => [w.en, w.ru, w.ruRom, w.es, w.zh, w.py].some(x => x.toLowerCase().includes(q)));
      if (!ws.length) return '';
      return `<div class="day-group"><h3>Day ${d.lesson + 1} · ${prettyDate(d.date)}</h3>${ws.map(({ w, k }) => `
        <div class="row"><div class="en-cell"><span class="en">${w.emoji} ${esc(w.en)}</span></div>
        ${LANGS.map(l => langRow(w, l, `l${d.lesson}-${k}`, true)).join('')}</div>`).join('')}</div>`;
    }).join('');
    $('#learnedList').innerHTML = groups || `<div class="empty">${q ? 'No matches.' : '📭 Nothing yet — finish today\'s 3 words and they\'ll show up here.'}</div>`;
  }

  // ---------- render: medals ----------
  function renderMedals() {
    const s = summary();
    $('#statGrid').innerHTML = [
      ['🔥', s.streak, 'Current streak'], ['⚡', s.best, 'Best streak'],
      ['📚', s.words, 'Words learned'], ['📅', s.lessons, 'Days completed'],
    ].map(([i, v, l]) => `<div class="stat">${i}<b>${v}</b><span class="muted small">${l}</span></div>`).join('');
    $('#medalGrid').innerHTML = MEDALS.map(m => {
      const got = state.medals.includes(m.id);
      return `<div class="medal ${got ? 'got' : 'locked'}"><div class="icon">${m.icon}</div><div class="name">${m.name}</div><div class="desc">${got ? '✓ ' : '🔒 '}${m.desc}</div></div>`;
    }).join('');
    $('#themeGrid').innerHTML = THEMES.map(t => {
      const ok = t.ok(s);
      return `<button class="theme ${ok ? '' : 'locked'} ${state.theme === t.id ? 'current' : ''}" data-theme="${t.id}" ${ok ? '' : 'aria-disabled="true"'}>
        <div class="sw" style="background:${t.sw}"></div><b>${ok ? '' : '🔒 '}${t.name}</b><div class="muted small">${t.need}</div></button>`;
    }).join('');
  }

  function renderHeader() {
    $('#streak').textContent = currentStreak();
    $('#wordCount').textContent = wordsLearned();
    $('#medalCount').textContent = state.medals.length;
  }
  function applyTheme() {
    document.body.className = state.theme && state.theme !== 'default' ? `theme-${state.theme}` : '';
  }
  function renderAll() {
    applyTheme(); renderHeader(); renderToday(); renderLearned(); renderMedals();
  }

  // ---------- actions ----------
  function toggleCheck(k) {
    if (doneToday()) return;
    const i = currentLesson();
    const c = state.checks[i] || [false, false, false];
    c[k] = !c[k];
    state.checks[i] = c;
    save();
    if (c.every(Boolean)) return completeDay(i);
    if (c[k]) toast(pick(TAP_PRAISE));
    renderToday();
  }

  function completeDay(i) {
    const now = new Date();
    const prev = state.done[state.done.length - 1];
    if (prev && dayDiff(prev.date, today()) > 1) state.flags.comeback = true;
    if (now.getHours() < 8) state.flags.early = true;
    if (now.getHours() >= 22) state.flags.night = true;
    if (now.getDay() === 0 || now.getDay() === 6) state.flags.weekend = true;
    state.done.push({ lesson: i, date: today() });
    delete state.checks[i];

    const s = summary();
    const themesBefore = THEMES.filter(t => t.ok({ ...s, best: bestStreakExcludingToday(), words: s.words - 3 })).map(t => t.id);
    const fresh = MEDALS.filter(m => !state.medals.includes(m.id) && m.test(s));
    state.medals.push(...fresh.map(m => m.id));
    const newThemes = THEMES.filter(t => t.ok(s) && !themesBefore.includes(t.id));
    save();
    renderAll();

    const [title, text] = pick(DONE_PRAISE);
    $('#modalBig').textContent = fresh.length ? fresh[fresh.length - 1].icon : '🎉';
    $('#modalTitle').textContent = title;
    $('#modalText').textContent = `${text} 🔥 Streak: ${s.streak} day${s.streak === 1 ? '' : 's'} · 📚 ${s.words} words.`;
    $('#modalMedals').innerHTML =
      fresh.map(m => `<span>${m.icon} ${m.name}</span>`).join('') +
      newThemes.map(t => `<span>🎁 New theme: ${t.name}</span>`).join('');
    $('#modal').classList.remove('hidden');
    confetti();
  }
  function bestStreakExcludingToday() {
    const saved = state.done;
    state.done = saved.filter(d => d.date !== today());
    const b = bestStreak();
    state.done = saved;
    return b;
  }

  // ---------- confetti ----------
  function confetti() {
    const cv = $('#confetti'), ctx = cv.getContext('2d');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    cv.width = innerWidth; cv.height = innerHeight;
    const colors = ['#5b4bff', '#ff5ea8', '#ffd43b', '#16a34a', '#00b3a4', '#e8590c'];
    const ps = Array.from({ length: 160 }, () => ({
      x: Math.random() * cv.width, y: -20 - Math.random() * cv.height * .5,
      vx: (Math.random() - .5) * 4, vy: 2 + Math.random() * 4, r: 4 + Math.random() * 6,
      a: Math.random() * Math.PI, va: (Math.random() - .5) * .3, c: pick(colors),
    }));
    const end = performance.now() + 3500;
    (function frame(t) {
      ctx.clearRect(0, 0, cv.width, cv.height);
      ps.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += .05; p.a += p.va;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c;
        ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); ctx.restore();
      });
      if (t < end) requestAnimationFrame(frame); else ctx.clearRect(0, 0, cv.width, cv.height);
    })(performance.now());
  }

  // ---------- events ----------
  function findWord(id) {
    // id: t{k} (today) or l{lesson}-{k} (learned)
    if (id[0] === 't') return lessonWords(currentLesson())[+id.slice(1)];
    const [lesson, k] = id.slice(1).split('-').map(Number);
    return lessonWords(lesson)[k];
  }
  document.addEventListener('click', e => {
    const say = e.target.closest('[data-say]');
    if (say) {
      const l = LANGS.find(x => x.code === say.dataset.lang);
      return speak(l.text(findWord(say.dataset.say)), l, say);
    }
    const all = e.target.closest('[data-sayall]');
    if (all) {
      const w = lessonWords(currentLesson())[+all.dataset.sayall];
      if (!synth) return toast('Audio isn\'t supported in this browser 😕');
      synth.cancel();
      LANGS.forEach(l => {
        const u = new SpeechSynthesisUtterance(l.text(w).replace(/[¿?？！!]/g, ''));
        u.lang = l.bcp; const v = voiceFor(l.code); if (v) u.voice = v; u.rate = .8;
        synth.speak(u);
      });
      return;
    }
    const chk = e.target.closest('[data-check]');
    if (chk) return toggleCheck(+chk.dataset.check);
    const tab = e.target.closest('.tab');
    if (tab) {
      document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b === tab));
      document.querySelectorAll('.panel').forEach(p => p.classList.toggle('active', p.id === `tab-${tab.dataset.tab}`));
      return;
    }
    const th = e.target.closest('[data-theme]');
    if (th) {
      const t = THEMES.find(x => x.id === th.dataset.theme);
      if (!t.ok(summary())) return toast(`🔒 Unlock with: ${t.need}`);
      state.theme = t.id; save(); applyTheme(); renderMedals();
      return toast(`🎨 ${t.name} theme on!`);
    }
  });
  $('#modalClose').addEventListener('click', () => $('#modal').classList.add('hidden'));
  $('#modal').addEventListener('click', e => { if (e.target.id === 'modal') $('#modal').classList.add('hidden'); });
  $('#search').addEventListener('input', renderLearned);
  $('#resetBtn').addEventListener('click', () => {
    if (!confirm('Erase all progress, streaks and medals?')) return;
    state = blank(); save(); renderAll(); toast('Progress erased. Fresh start! 🌱');
  });

  // Re-render if the day rolls over while the app is open.
  let lastDay = today();
  const maybeRollover = () => { if (today() !== lastDay) { lastDay = today(); renderAll(); } };
  document.addEventListener('visibilitychange', maybeRollover);
  setInterval(maybeRollover, 60000);

  if (synth) { loadVoices(); synth.addEventListener?.('voiceschanged', loadVoices); }
  renderAll();
  checkVoices();
})();
