/* ---------- levels and resources ---------- */
const LEVELS = ["A2","B1","B2","C1","C2"];
const LEVEL_INFO = {
  A2:{name:"Elementary", d:"You handle simple everyday conversations and short texts."},
  B1:{name:"Intermediate", d:"You manage most travel situations and talk about familiar topics."},
  B2:{name:"Upper intermediate", d:"You follow most TV and articles and can argue a point with some effort."},
  C1:{name:"Advanced", d:"You use English fluently and flexibly for work, study and social life."},
  C2:{name:"Proficiency", d:"You understand virtually everything and express fine shades of meaning."}
};
// Study hours to move up one level: the lower end of Cambridge's guided-learning-hours ranges,
// since the plan adds daily self-study and exposure on top.
const HOURS = {B1:170, B2:180, C1:200, C2:300};
const WORDS = {B1:"120-150", B2:"140-190", C1:"220-260", C2:"280-320"};
const LISTEN = {
  B1:[{n:"BBC Learning English: 6 Minute English",u:"https://www.bbc.co.uk/learningenglish/english/features/6-minute-english"},{n:"VOA Learning English",u:"https://learningenglish.voanews.com"},{n:"Luke's English Podcast",u:"https://teacherluke.co.uk"},{n:"TED-Ed on YouTube",u:"https://www.youtube.com/@TEDEd"}],
  B2:[{n:"BBC Learning English: 6 Minute English",u:"https://www.bbc.co.uk/learningenglish/english/features/6-minute-english"},{n:"TED Talks",u:"https://www.ted.com/talks"},{n:"Luke's English Podcast",u:"https://teacherluke.co.uk"},{n:"The Guardian: Today in Focus",u:"https://www.theguardian.com/news/series/todayinfocus"},{n:"TED-Ed on YouTube",u:"https://www.youtube.com/@TEDEd"}],
  C1:[{n:"TED Talks",u:"https://www.ted.com/talks"},{n:"BBC Radio 4: In Our Time",u:"https://www.bbc.co.uk/programmes/b006qykl"},{n:"The Guardian: Today in Focus",u:"https://www.theguardian.com/news/series/todayinfocus"},{n:"NPR: Planet Money",u:"https://www.npr.org/sections/money/"},{n:"BBC World Service: The Documentary",u:"https://www.bbc.co.uk/programmes/p02nq0lx"}],
  C2:[{n:"BBC Radio 4: In Our Time",u:"https://www.bbc.co.uk/programmes/b006qykl"},{n:"BBC World Service: The Documentary",u:"https://www.bbc.co.uk/programmes/p02nq0lx"},{n:"NPR: Planet Money",u:"https://www.npr.org/sections/money/"},{n:"BBC Radio 4: Desert Island Discs",u:"https://www.bbc.co.uk/programmes/b006qnmr"},{n:"The Guardian: Today in Focus",u:"https://www.theguardian.com/news/series/todayinfocus"}]
};
const READ = {
  B1:[{n:"News in Levels",u:"https://www.newsinlevels.com"},{n:"VOA Learning English",u:"https://learningenglish.voanews.com"},{n:"BBC Learning English",u:"https://www.bbc.co.uk/learningenglish"}],
  B2:[{n:"BBC News",u:"https://www.bbc.com/news"},{n:"BBC Future",u:"https://www.bbc.com/future"},{n:"The Guardian",u:"https://www.theguardian.com/international"},{n:"The Conversation",u:"https://theconversation.com/global"}],
  C1:[{n:"The Guardian (Opinion)",u:"https://www.theguardian.com/uk/commentisfree"},{n:"The Conversation",u:"https://theconversation.com/global"},{n:"BBC Future",u:"https://www.bbc.com/future"},{n:"Aeon",u:"https://aeon.co"},{n:"NPR",u:"https://www.npr.org"}],
  C2:[{n:"Aeon",u:"https://aeon.co"},{n:"The Atlantic",u:"https://www.theatlantic.com"},{n:"The Guardian (Long Read)",u:"https://www.theguardian.com/news/series/the-long-read"},{n:"The Conversation",u:"https://theconversation.com/global"},{n:"The New Yorker",u:"https://www.newyorker.com"}]
};
const EXAM = {
  cambridge:{B1:["B1 Preliminary","https://www.cambridgeenglish.org/exams-and-tests/preliminary/"],B2:["B2 First","https://www.cambridgeenglish.org/exams-and-tests/first/"],C1:["C1 Advanced","https://www.cambridgeenglish.org/exams-and-tests/advanced/"],C2:["C2 Proficiency","https://www.cambridgeenglish.org/exams-and-tests/proficiency/"]},
  ielts:["IELTS practice tests","https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests"]
};
const LINKS = {efset:"https://www.efset.org", wi:"https://writeandimprove.com", italki:"https://www.italki.com", tandem:"https://www.tandem.net", youglish:"https://youglish.com"};
const TIME_OPTIONS = [30,60,90,120,180];
const ALLOC = {
  30:{flash:8, input:10, focus:12},
  60:{flash:10, listen:15, read:15, focus:20},
  90:{flash:12, listen:20, read:20, focus:28, speak:10},
  120:{flash:15, listen:25, read:25, focus:40, speak:15},
  180:{flash:20, listen:40, read:35, focus:60, speak:25}
};
const ROTATION = {7:["G","W1","S","V","W2","X","R"], 6:["G","W1","S","V","W2","X"], 5:["G","W1","S","V","X"]};
const DOW = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const KEY = "percorso-c1.v1";

/* ---------- state ---------- */
const blank = () => ({profile:null, start:null, done:{}, cards:{}, custom:[], drafts:{}, tests:[], errors:"", reverse:false});
let S = blank();
try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign(S, JSON.parse(raw)); } catch(e) {}
// Earlier version: C1-only cards were stored as "t3-5".
Object.keys(S.cards).forEach(k => { if (/^t\d+-\d+$/.test(k)){ S.cards["C1-"+k.slice(1)] = S.cards[k]; delete S.cards[k]; } });
function save(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e) {} }

/* ---------- dates ---------- */
const pad = n => String(n).padStart(2,"0");
const iso = d => d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const parse = s => { const [y,m,d] = s.split("-").map(Number); return new Date(y,m-1,d); };
const addDays = (d,n) => { const x = new Date(d); x.setDate(x.getDate()+n); return x; };
const diffDays = (a,b) => Math.round((parse(iso(a)) - parse(iso(b))) / 864e5);
const today = () => parse(iso(new Date()));
function nextMonday(){ const t = today(); const wd = (t.getDay()+6)%7; return iso(wd===0 ? t : addDays(t, 7-wd)); }
const fmt = (d, o={weekday:"long", day:"numeric", month:"long"}) => d.toLocaleDateString("en-GB", o);

/* ---------- plan ---------- */
let PLAN = null;
function buildPlan(p){
  const stages = LEVELS.slice(LEVELS.indexOf(p.from)+1, LEVELS.indexOf(p.to)+1);
  const weekly = p.minutes * p.days;
  const weeks = [];
  stages.forEach(st => {
    const W = Math.max(4, Math.ceil(HOURS[st]*60/weekly)), G = STAGES[st].grammar.length, T = STAGES[st].themes.length;
    const seenG = new Set();
    for (let w = 0; w < W; w++){
      let g = []; for (let i = Math.floor(w*G/W); i < Math.floor((w+1)*G/W); i++) g.push(i);
      let t = []; for (let i = Math.floor(w*T/W); i < Math.floor((w+1)*T/W); i++) t.push(i);
      if (!g.length) g = [Math.min(G-1, Math.floor(w*G/W))];
      if (!t.length) t = [Math.min(T-1, Math.floor(w*T/W))];
      const review = g.every(i => seenG.has(i));
      g.forEach(i => seenG.add(i));
      weeks.push({stage:st, n:w+1, of:W, g, t, review, last: w === W-1});
    }
  });
  return {stages, weeks, days: weeks.length*7};
}
function milestones(plan, start){
  let w = 0;
  return plan.stages.map(st => { const n = plan.weeks.filter(x => x.stage===st).length; w += n; return {stage:st, weeks:n, cum:w, date:addDays(start, w*7-1)}; });
}
function dur(w){ if (w <= 10) return w + " weeks"; const m = Math.round(w/4.345); return m <= 24 ? m + " months" : "about " + (Math.round(w/52*2)/2) + " years"; }
const P = () => S.profile;
function startDate(){ return parse(S.profile?.start || S.start || nextMonday()); }
function realDay(){ return diffDays(today(), startDate()) + 1; }
function curDay(){ return Math.min(PLAN.days, Math.max(1, realDay())); }
function weekOf(d){ return PLAN.weeks[Math.floor((d-1)/7)]; }
function dateOf(d){ return addDays(startDate(), d-1); }
function stageNow(){ return weekOf(curDay()).stage; }
function isStudyDay(d){ return (d-1)%7 < P().days; }

/* ---------- helpers ---------- */
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const link = (u, label) => `<a href="${u}" target="_blank" rel="noopener">${esc(label)}</a>`;
const words = s => (s.trim().match(/\S+/g) || []).length;
function toast(msg){ const t = document.getElementById("toast"); t.textContent = msg; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => t.hidden = true, 1900); }
const pick = (arr, i) => arr[i % arr.length];
function examLink(st){
  const e = P().exam;
  if (e === "ielts") return link(EXAM.ielts[1], EXAM.ielts[0]);
  const c = EXAM.cambridge[st]; return link(c[1], "Cambridge " + c[0] + " sample tests");
}

/* ---------- the daily programme ---------- */
function tasksFor(d){
  if (!isStudyDay(d)) return [];
  const wk = weekOf(d), st = wk.stage, dow = (d-1)%7, a = ALLOC[P().minutes];
  const th = STAGES[st].themes[wk.t[0]], themeNames = wk.t.map(i => STAGES[st].themes[i].t).join(" and ");
  const L = pick(LISTEN[st], d-1), R = pick(READ[st], d-1);
  const T = [];
  T.push({kind:"flash", title:"Flashcards", time:a.flash, html:`<p>Review today's due cards. This week adds the phrases from <b>${esc(themeNames)}</b>.</p>`, act:[["Open flashcards","flash"]]});
  const listen = d % 2 === 1
    ? `<p>Pick 8-10 minutes from ${link(L.u, L.n)}. Listen once without a transcript, then again with it. Summarise it aloud in three sentences.</p>`
    : `<p>Listen to a full episode from ${link(L.u, L.n)} without stopping. Note three phrases you want to keep.</p>`;
  const read = `<p>Read an article from ${link(R.u, R.n)}, ideally about <b>${esc(th.t.toLowerCase())}</b>. Underline 5-8 new phrases and add them as flashcards.</p>`;
  if (a.input) T.push(d % 2 ? {kind:"listen", title:"Listening", time:a.input, html:listen} : {kind:"read", title:"Reading", time:a.input, html:read, act:[["Add cards","flash"]]});
  if (a.listen) T.push({kind:"listen", title: d%2 ? "Intensive listening" : "Extensive listening", time:a.listen, html:listen});
  if (a.read) T.push({kind:"read", title:"Reading", time:a.read, html:read, act:[["Add cards","flash"]]});
  T.push(Object.assign({kind:"focus", time:a.focus}, focus(d, wk, dow, th)));
  if (a.speak) T.push({kind:"speak", title:"Speaking and shadowing", time:a.speak, html:`<p>Record yourself for two minutes answering the question below, then listen back and log one mistake in your error notebook. Finish with a few minutes of shadowing on today's audio.</p><div class="quote">${esc(pick(th.s, dow))}</div>`});
  return T;
}
function focus(d, wk, dow, th){
  const st = wk.stage, g = STAGES[st].grammar, wi = Math.floor((d-1)/7), wcount = WORDS[st];
  const studyIdx = dow; // position in the rotation
  if (d <= 7 && studyIdx < 3){
    return [
      {title:"Placement test: grammar and vocabulary", html:`<p>Take the free ${link(LINKS.efset,"EF SET")} test (about 50 minutes) and record your CEFR result in Progress. If it is far from the level you chose, adjust your plan in Settings.</p>`, act:[["Open Progress","progress"]]},
      {title:"Placement test: reading and listening", html:`<p>Do one Reading part and one Listening part from ${examLink(st)} under timed conditions. Record your scores in Progress.</p>`, act:[["Open Progress","progress"]]},
      {title:"Placement test: writing and speaking", html:`<p>Write this week's essay in the Writing tab without a dictionary. Then record two minutes on: <i>What would you change about the place where you live?</i> Keep the recording to compare later.</p>`, act:[["Open Writing","write"],["Open Progress","progress"]]}
    ][studyIdx];
  }
  const code = ROTATION[P().days][studyIdx];
  const units = wk.g.map(i => g[i].t).join(" + ");
  switch(code){
    case "G": return {title:(wk.review ? "Grammar review: " : "Grammar: ") + units, html:`<p>Study the explanation and examples, then do the exercises. Write ten sentences of your own using the structure.</p>`, act:[["Open the lesson","grammar:"+st+"-"+wk.g[0]]]};
    case "W1": return {title:"Writing: essay", html:`<p>Write ${wcount} words. Get feedback and rewrite the sentences that were wrong.</p><div class="quote">${esc(th.w1)}</div>`, act:[["Write it","write:"+st+"-"+wk.t[0]+"a"]]};
    case "W2": return {title:"Writing: "+th.w2[0].toLowerCase(), html:`<p>Write ${wcount} words in the right register for the genre, then compare with a model answer.</p><div class="quote">${esc(th.w2[1])}</div>`, act:[["Write it","write:"+st+"-"+wk.t[0]+"b"]]};
    case "S": return {title:"Conversation", html:`<p>Have a conversation with a tutor (${link(LINKS.italki,"italki")}) or a language exchange partner (${link(LINKS.tandem,"Tandem")}) about <b>${esc(th.t.toLowerCase())}</b>. Use at least five of this week's phrases. No partner? Answer all five questions aloud.</p><ul class="clean">${th.s.map(q=>`<li>${esc(q)}</li>`).join("")}</ul>`};
    case "V": return {title:"Vocabulary: "+th.t, html:`<p>Study this week's phrases. Write one sentence about your own life for each, then review them as flashcards.</p>`, act:[["Open vocabulary","vocab:"+st+"-"+wk.t[0]],["Flashcards","flash"]]};
    case "X":
      if (wk.last) return {title:"Level check: "+st, html:`<p>Full mock test under exam conditions from ${examLink(st)}: Reading, Listening, an essay and a two-minute recording. Aim for 70-75% or more before moving on. Record the results in Progress.</p>`, act:[["Record results","progress"]]};
      if ((wi+1) % 4 === 0) return {title:"Monthly progress check", html:`<p>Timed Reading and Listening parts from ${examLink(st)}, plus a two-minute recording on the same question as your placement test. Record the results in Progress.</p>`, act:[["Record results","progress"]]};
      return {title: wi%2 ? "Exam practice: Listening" : "Exam practice: Reading", html:`<p>Do one ${wi%2?"Listening":"Reading"} part under timed conditions from ${examLink(st)}. For every mistake, work out why the right answer is right.</p>`};
    default: return {title:"Weekly review", html:`<p>Reread your error notebook and correct five sentences. Redo this week's grammar exercises. Then watch a film or two episodes of a series in English, without Italian subtitles.</p>`, act:[["Error notebook","progress"],["Exercises","grammar:"+st+"-"+wk.g[0]]]};
  }
}
const isDone = (d,i) => !!S.done[d+"-"+i];
function dayCount(d){ const n = tasksFor(d).length; let c = 0; for (let i=0; i<n; i++) if (isDone(d,i)) c++; return [c, n]; }

/* ---------- flashcards ---------- */
const INTERVALS = [0,1,2,4,8,16,32];
function deck(){
  const out = [], seen = new Set(), last = Math.floor((curDay()-1)/7);
  for (let w = 0; w <= last; w++){
    const wk = PLAN.weeks[w];
    wk.t.forEach(t => {
      const key = wk.stage+"-"+t; if (seen.has(key)) return; seen.add(key);
      const th = STAGES[wk.stage].themes[t];
      th.v.forEach((v,i) => out.push({id:`${wk.stage}-${t}-${i}`, en:v[0], it:v[1], ex:v[2], src:th.t}));
    });
  }
  S.custom.forEach(c => out.push({id:"c"+c.id, en:c.en, it:c.it, ex:c.ex||"", src:"Your cards"}));
  return out;
}
function dueCards(){ const t = iso(today()); return deck().filter(c => { const s = S.cards[c.id]; return !s || s.due <= t; }); }
let fc = {queue:null, shown:false};

/* ---------- onboarding ---------- */
let ob = null;
function startOnboarding(){
  const p = S.profile;
  ob = {step:0, d: p ? Object.assign({}, p) : {name:"", from:"B2", to:"C1", minutes:120, days:7, exam:"cambridge", start: S.start || nextMonday()}};
  render();
}
function vOnboarding(){
  const d = ob.d, steps = 6;
  const bar = `<div class="steps">${Array.from({length:steps},(_,i)=>`<i class="${i<=ob.step?"on":""}"></i>`).join("")}</div>`;
  const nav = (next="Continue", ok=true) => `<div class="nav"><button class="ghost" data-ob="back" ${ob.step===0?"hidden":""}>Back</button><span></span><button class="primary" data-ob="next" ${ok?"":"disabled"}>${next}</button></div>`;
  let body = "";
  if (ob.step === 0) body = `<div class="eyebrow">Welcome</div><h1>Build your English plan</h1><p class="sub">Tell us where you are, where you want to get to and how much time you have. You get a day-by-day programme with lessons, flashcards, writing tasks and progress checks.</p>
    <label class="f">Your first name<input id="ob-name" value="${esc(d.name)}" placeholder="e.g. Mario" autocomplete="given-name"></label>${nav("Get started")}`;
  if (ob.step === 1) body = `<div class="eyebrow">Step 1 of 4</div><h2>What's your level now?</h2><p class="sub">Not sure? Take the quick level test and we'll work it out for you.</p>
    <button class="choice" data-leveltest style="width:100%;border-style:dashed"><span class="code" style="background:var(--accent);color:var(--accent-ink)">?</span><span><b>Find my level</b><span>30 questions at most, about 10 minutes. Stops early once it has found your level.</span></span></button>
    <div class="eyebrow" style="margin-top:18px;color:var(--muted)">Or choose it yourself</div>
    <div class="choices" style="margin-top:8px">${LEVELS.slice(0,4).map(l=>`<button class="choice" data-from="${l}" aria-pressed="${d.from===l}"><span class="code">${l}</span><span><b>${LEVEL_INFO[l].name}</b><span>${LEVEL_INFO[l].d}</span></span></button>`).join("")}</div>${nav()}`;
  if (ob.step === 2){
    const opts = LEVELS.slice(LEVELS.indexOf(d.from)+1);
    if (!opts.includes(d.to)) d.to = opts[0];
    body = `<div class="eyebrow">Step 2 of 4</div><h2>Which level do you want to reach?</h2><p class="sub">Each level up takes roughly ${HOURS.B2} hours of focused study.</p>
    <div class="choices">${opts.map(l=>`<button class="choice" data-to="${l}" aria-pressed="${d.to===l}"><span class="code">${l}</span><span><b>${LEVEL_INFO[l].name}</b><span>${LEVEL_INFO[l].d}</span></span></button>`).join("")}</div>${nav()}`;
  }
  if (ob.step === 3) body = `<div class="eyebrow">Step 3 of 4</div><h2>How much time can you give it?</h2><p class="sub">Be realistic: a routine you keep beats an ambitious one you drop.</p>
    <div class="eyebrow" style="margin-top:8px;color:var(--muted)">Per study day</div>
    <div class="choices cols">${TIME_OPTIONS.map(m=>`<button class="choice simple" data-min="${m}" aria-pressed="${d.minutes===m}"><b>${m<60?m+" min":(m/60)+(m===60?" hour":" hours")}</b></button>`).join("")}</div>
    <div class="eyebrow" style="margin-top:18px;color:var(--muted)">Study days per week</div>
    <div class="choices cols">${[5,6,7].map(n=>`<button class="choice simple" data-days="${n}" aria-pressed="${d.days===n}"><b>${n} days</b><span>${n===7?"every day":n===6?"Sunday off":"weekends off"}</span></button>`).join("")}</div>${nav()}`;
  if (ob.step === 4) body = `<div class="eyebrow">Step 4 of 4</div><h2>Are you preparing for an exam?</h2><p class="sub">This decides which practice tests the plan links to.</p>
    <div class="choices">${[["cambridge","Cambridge English","B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency"],["ielts","IELTS","Academic or General Training"],["none","No exam","Practice tests are still used to measure progress"]].map(e=>`<button class="choice" data-exam="${e[0]}" aria-pressed="${d.exam===e[0]}"><span class="code">${e[0]==="none"?"–":e[0][0].toUpperCase()}</span><span><b>${e[1]}</b><span>${e[2]}</span></span></button>`).join("")}</div>
    <label class="f" style="margin-top:18px">Start date<input type="date" id="ob-start" value="${esc(d.start)}"></label>${nav("See my plan")}`;
  if (ob.step === 5){
    const plan = buildPlan(d), ms = milestones(plan, parse(d.start)), first = ms[0], hours = Math.round(plan.weeks.length*d.minutes*d.days/60);
    const ti = TIME_OPTIONS.indexOf(d.minutes), alts = [];
    if (ti < TIME_OPTIONS.length-1) alts.push([TIME_OPTIONS[ti+1], d.days]);
    if (d.days < 7) alts.push([d.minutes, 7]);
    if (ti < TIME_OPTIONS.length-1 && d.days < 7) alts.push([TIME_OPTIONS[ti+1], 7]);
    const mins = m => m<60 ? m+" min" : (m/60)+" h";
    body = `<div class="eyebrow">Your plan</div><h1>First milestone: ${first.stage} in ${dur(first.weeks)}</h1>
    <p class="sub">${ms.length>1 ? `Then on to ${esc(d.to)}, one level at a time. Each level is a real achievement in itself.` : `That's your goal level.`} You'll notice progress long before the finish line.</p>
    <div class="track">${LEVELS.map(l=>`<div class="seg ${l===d.from?"start":""} ${plan.stages.includes(l)?"in":""}">${l}</div>`).join("")}</div>
    <div class="milestones">${ms.map((m,i)=>`<div class="ms"><span class="code">${m.stage}</span><span><b>${LEVEL_INFO[m.stage].name}</b><span>${i===0?"in "+dur(m.weeks):dur(m.weeks)+" more"} · by ${fmt(m.date,{month:"long",year:"numeric"})}</span></span></div>`).join("")}</div>
    <p class="small muted" style="margin:12px 0 0">${mins(d.minutes)} a day, ${d.days} days a week: about ${hours} hours in total, starting ${fmt(parse(d.start),{day:"numeric",month:"short"})}.</p>
    ${alts.length ? `<div class="panel" style="margin-top:16px"><h3>Want to get there sooner?</h3><p class="muted small" style="margin:4px 0 10px">Tap an option to switch to it.</p><div class="choices" style="margin-top:0">${alts.map(([m,dd])=>{ const w = buildPlan(Object.assign({}, d, {minutes:m, days:dd})).weeks.length, saved = plan.weeks.length - w; return `<button class="choice simple" data-whatif="${m},${dd}"><b>${mins(m)} × ${dd} days → ${esc(d.to)} in ${dur(w)}</b><span>${dur(saved)} sooner</span></button>`; }).join("")}</div></div>` : ""}
    ${nav(S.profile ? "Save changes" : "Start my plan")}`;
  }
  return `<div class="ob">${bar}${body}</div>`;
}
function obNext(){
  const d = ob.d;
  if (ob.step === 0){ d.name = document.getElementById("ob-name").value.trim(); }
  if (ob.step === 4){ const v = document.getElementById("ob-start").value; if (v) d.start = v; }
  if (ob.step === 5){
    const changed = S.profile && (S.profile.from!==d.from || S.profile.to!==d.to || S.profile.minutes!==d.minutes || S.profile.days!==d.days);
    if (changed) S.done = {};
    S.profile = d; S.start = d.start; save(); PLAN = buildPlan(d); ob = null; tab = "today"; viewDay = curDay(); fc.queue = null;
    render(); toast(changed ? "Plan updated. Daily ticks were reset." : "Your plan is ready"); return;
  }
  ob.step++; render(); window.scrollTo(0,0);
}

/* ---------- views ---------- */
const TABS = [["today","Today"],["plan","Plan"],["flash","Flashcards"],["grammar","Grammar"],["vocab","Vocabulary"],["write","Writing"],["progress","Progress"],["settings","Settings"]];
let tab = "today", param = null, viewDay = 1;
try { const h = location.hash.slice(1); if (TABS.some(t => t[0]===h)) tab = h; } catch(e) {}

function go(spec){ const i = spec.indexOf(":"); tab = i<0 ? spec : spec.slice(0,i); param = i<0 ? null : spec.slice(i+1); if (tab==="flash") fc.queue = null; render(); window.scrollTo(0,0); }

function render(){
  const tabsEl = document.getElementById("tabs"), meta = document.getElementById("meta"), v = document.getElementById("view");
  if (lt){ tabsEl.innerHTML = ""; meta.textContent = ""; v.innerHTML = vLevelTest(); return; }
  if (ob){ tabsEl.innerHTML = ""; meta.textContent = ""; v.innerHTML = vOnboarding(); return; }
  tabsEl.innerHTML = TABS.map(([k,l]) => `<button role="tab" aria-selected="${k===tab}" data-tab="${k}">${l}</button>`).join("");
  const rd = realDay();
  meta.textContent = rd < 1 ? `Starts ${fmt(startDate(),{day:"numeric",month:"short"})}` : rd > PLAN.days ? "Plan complete" : `Day ${curDay()} of ${PLAN.days}`;
  v.innerHTML = ({today:vToday, plan:vPlan, flash:vFlash, grammar:vGrammar, vocab:vVocab, write:vWrite, progress:vProgress, settings:vSettings})[tab]();
  if (tab === "grammar" && param){ const el = document.getElementById("u-"+param); if (el){ el.open = true; el.scrollIntoView({block:"start"}); } }
}

function track(){
  const p = P(), now = stageNow(), si = LEVELS.indexOf(now);
  return `<div class="track">${LEVELS.map((l,i)=>{ const inPlan = PLAN.stages.includes(l); const cls = l===p.from?"start":(inPlan && i<si)?"done":(l===now && realDay()>=1)?"now":inPlan?"in":""; return `<div class="seg ${cls}">${l}</div>`; }).join("")}</div>`;
}
function greeting(){ const h = new Date().getHours(); return h<12 ? "Good morning" : h<18 ? "Good afternoon" : "Good evening"; }

function vToday(){
  const p = P(), d = viewDay, wk = weekOf(d), dow = (d-1)%7, T = tasksFor(d), [c, n] = dayCount(d);
  const rd = realDay(), weekNo = Math.floor((curDay()-1)/7)+1, end = dateOf(PLAN.days);
  let full = 0; for (let i=1; i<=PLAN.days; i++){ const [a,b] = dayCount(i); if (b && a===b) full++; }
  const studyDays = Math.round(PLAN.days*p.days/7);
  const ms = milestones(PLAN, startDate()), next = ms.find(m => m.cum >= weekNo) || ms[ms.length-1];
  const hero = `<section class="hero"><div><div class="eyebrow">${rd<1 ? "Starting "+fmt(startDate()) : greeting()+(p.name?", "+esc(p.name):"")}</div>
    <h1>Next stop: ${next.stage}</h1></div>${track()}
    <div class="kpis"><div class="kpi"><b>${fmt(next.date,{month:"short",year:"numeric"})}</b><span>${next.stage} reached</span></div><div class="kpi"><b>${weekNo}/${PLAN.weeks.length}</b><span>week</span></div><div class="kpi"><b>${Math.round(full/studyDays*100)}%</b><span>days completed</span></div></div>
    ${ms.length>1 ? `<div class="small" style="opacity:.8">Then ${ms.filter(m=>m.cum>next.cum).map(m=>m.stage+" by "+fmt(m.date,{month:"short",year:"numeric"})).join(", ")}.</div>` : ""}</section>`;
  const head = `<div class="daybar"><div><div class="eyebrow">Week ${Math.floor((d-1)/7)+1} · ${wk.stage} track · ${DOW[dow]}</div><h2>Day ${d} <span class="muted" style="font:500 15px var(--f-body)">${fmt(dateOf(d),{day:"numeric",month:"long"})}</span></h2></div>
    <div class="nav"><button data-day="${d-1}" ${d<=1?"disabled":""} aria-label="Previous day">‹</button><button data-day="${curDay()}">Today</button><button data-day="${d+1}" ${d>=PLAN.days?"disabled":""} aria-label="Next day">›</button></div></div>`;
  if (!T.length) return hero + head + `<div class="panel rest"><h3>Rest day</h3><p class="muted">No tasks today. If you feel like it, watch something you enjoy in English or chat with a friend.</p></div>`;
  const total = T.reduce((s,t)=>s+t.time,0);
  return hero + head + `<div class="spread small muted"><span>${c} of ${n} done</span><span>${total} min</span></div><div class="bar"><i style="width:${c/n*100}%"></i></div>
  <div class="tasks">${T.map((t,i) => `<div class="task ${isDone(d,i)?"done":""}" data-kind="${t.kind}"><input type="checkbox" id="t${d}-${i}" data-check="${d}-${i}" ${isDone(d,i)?"checked":""}><div class="body"><div class="head"><h3><label for="t${d}-${i}">${esc(t.title)}</label></h3><span class="time">${t.time} min</span></div>${t.html}${t.act?`<div class="actions">${t.act.map(a=>`<button data-go="${a[1]}">${a[0]}</button>`).join("")}</div>`:""}</div></div>`).join("")}</div>`;
}

function vPlan(){
  let html = `<h2>Your plan</h2><p class="sub">${PLAN.weeks.length} weeks from ${esc(P().from)} to ${esc(P().to)}. Tap any day to open it. Green means every task was done.</p>`;
  let last = null;
  PLAN.weeks.forEach((wk, wi) => {
    if (wk.stage !== last){ last = wk.stage; html += (wi?`</div>`:"") + `<div class="stage-h"><h3>${wk.stage} · ${LEVEL_INFO[wk.stage].name}</h3><span class="pill">${wk.of} weeks</span></div><div class="weeks">`; }
    const G = STAGES[wk.stage].grammar, Th = STAGES[wk.stage].themes;
    html += `<div class="week"><div class="wh"><h3>Week ${wi+1}: ${esc(wk.t.map(i=>Th[i].t).join(" · "))}</h3><small>${wk.review?"Review: ":""}${esc(wk.g.map(i=>G[i].t).join(" · "))}${wk.last?" · level check":""}</small></div><div class="days">`;
    for (let i=0; i<7; i++){
      const d = wi*7+i+1, [c, n] = dayCount(d), dt = dateOf(d);
      html += `<button class="day ${!n?"off":c===n?"full":c?"part":""} ${d===curDay()&&realDay()>=1?"today":""}" data-open="${d}" aria-label="Day ${d}"><b>${DOW[i].slice(0,3)}</b>${dt.getDate()}/${dt.getMonth()+1}</button>`;
    }
    html += `</div></div>`;
  });
  return html + `</div>`;
}

function vFlash(){
  if (!fc.queue){ fc.queue = dueCards().sort(() => Math.random()-.5); fc.shown = false; }
  const all = deck(), learned = all.filter(c => (S.cards[c.id]?.b||0) >= 3).length, c = fc.queue[0];
  let box;
  if (!c) box = `<div class="card-box"><h3>All caught up</h3><p class="muted">No cards are due today. Come back tomorrow, or add phrases from your reading.</p></div>`;
  else {
    const front = S.reverse ? c.en : c.it, back = S.reverse ? c.it : c.en;
    box = `<div class="card-box"><div class="eyebrow">${esc(c.src)} · ${fc.queue.length} due</div><div class="front">${esc(front)}</div>
      ${fc.shown ? `<div class="back">${esc(back)}</div>${c.ex?`<div class="ex">${esc(c.ex)}</div>`:""}<div class="row center"><button data-fc="0">I didn't know it</button><button class="primary" data-fc="1">I knew it</button></div>`
                 : `<div class="row center"><button class="primary" data-fc="show">Show answer</button></div>`}</div>`;
  }
  return `<h2>Flashcards</h2><p class="sub">${all.length} cards in your deck, ${learned} learned. Cards you know come back after 1, 2, 4, 8, 16 and 32 days; cards you miss come back tomorrow.</p>
  ${box}<div class="row center" style="margin-top:10px"><button class="ghost" data-rev>${S.reverse?"Show Italian first":"Show English first"}</button></div>
  <div class="panel" style="margin-top:18px"><h3>Add a card</h3><p class="muted small" style="margin:4px 0 12px">For phrases you find while reading and listening.</p>
  <div class="formrow"><label class="f">English<input id="nc-en" placeholder="heavily reliant on"></label><label class="f">Meaning<input id="nc-it" placeholder="fortemente dipendente da"></label></div>
  <label class="f" style="margin-top:10px">Example sentence (optional)<input id="nc-ex" placeholder="The region is heavily reliant on tourism."></label>
  <div style="margin-top:12px"><button class="primary" data-addcard>Add card</button></div></div>
  ${S.custom.length?`<div class="panel" style="margin-top:12px"><h3>Your cards (${S.custom.length})</h3><div class="tbl"><table><tbody>${S.custom.slice().reverse().map(c=>`<tr><td><b>${esc(c.en)}</b><div class="ex">${esc(c.ex||"")}</div></td><td>${esc(c.it)}</td><td><button class="ghost" data-delcard="${c.id}" aria-label="Delete card">✕</button></td></tr>`).join("")}</tbody></table></div></div>`:""}`;
}

function weekOfUnit(st, kind, i){ const w = PLAN.weeks.findIndex(wk => wk.stage===st && wk[kind].includes(i)); return w+1; }
function vGrammar(){
  return `<h2>Grammar</h2><p class="sub">One structure per week, studied on the first study day and reviewed at the end of the week. Type your answer and press Check; common variants are accepted.</p>` +
  PLAN.stages.map(st => `<div class="stage-h"><h3>${st} · ${LEVEL_INFO[st].name}</h3></div>` + STAGES[st].grammar.map((g,u) => `<details class="unit" id="u-${st}-${u}"><summary>${esc(g.t)}<span class="n">Week ${weekOfUnit(st,"g",u)}</span></summary>
    <ul class="clean">${g.e.map(e=>`<li>${e}</li>`).join("")}</ul>
    <div class="eyebrow" style="margin-top:12px">Examples</div><ul class="clean">${g.x.map(x=>`<li><i>${esc(x)}</i></li>`).join("")}</ul>
    <div class="eyebrow" style="margin-top:12px">Practice</div><div class="ex-list">${g.q.map((q,i)=>`<div class="exq"><div>${i+1}. ${esc(q[0])}</div><div class="r"><input id="g-${st}-${u}-${i}" aria-label="Answer ${i+1}" autocomplete="off" autocapitalize="off"><button data-check-ex="${st}-${u}-${i}">Check</button></div><div class="fb" id="fb-${st}-${u}-${i}"></div></div>`).join("")}</div></details>`).join("")).join("");
}
const norm = s => s.toLowerCase().replace(/[’‘]/g,"'").replace(/[.,;:!?"]/g,"").replace(/\s+/g," ").trim();

function vVocab(){
  const wk = weekOf(curDay());
  const [st, ti] = param ? [param.split("-")[0], +param.split("-")[1]] : [wk.stage, wk.t[0]];
  const th = STAGES[st].themes[ti];
  return `<h2>Vocabulary</h2><p class="sub">${th.v.length} phrases per theme, already in your flashcard deck when their week starts. Always learn the whole phrase.</p>
  <label class="f" style="max-width:420px;margin-bottom:14px">Theme<select id="vsel">${PLAN.stages.map(s=>`<optgroup label="${s}">${STAGES[s].themes.map((t,i)=>`<option value="${s}-${i}" ${s===st&&i===ti?"selected":""}>Week ${weekOfUnit(s,"t",i)}: ${esc(t.t)}</option>`).join("")}</optgroup>`).join("")}</select></label>
  <div class="panel"><div class="tbl"><table><thead><tr><th>Phrase</th><th>Italian</th></tr></thead><tbody>${th.v.map(v=>`<tr><td><b>${esc(v[0])}</b><div class="ex">${esc(v[2])}</div></td><td>${esc(v[1])}</td></tr>`).join("")}</tbody></table></div></div>
  <p class="muted small">Hear any phrase in real context on ${link(LINKS.youglish,"YouGlish")}.</p>`;
}

function vWrite(){
  const opts = [];
  PLAN.stages.forEach(s => STAGES[s].themes.forEach((t,i) => { const w = weekOfUnit(s,"t",i); opts.push([`${s}-${i}a`, `Week ${w}: essay (${t.t})`, "Essay", t.w1, s]); opts.push([`${s}-${i}b`, `Week ${w}: ${t.w2[0].toLowerCase()}`, t.w2[0], t.w2[1], s]); }));
  const wk = weekOf(curDay());
  const k = param || `${wk.stage}-${wk.t[0]}a`;
  const cur = opts.find(o => o[0]===k) || opts[0];
  const txt = S.drafts[cur[0]] || "";
  return `<h2>Writing</h2><p class="sub">Two texts a week. Drafts save automatically on this device.</p>
  <label class="f" style="max-width:420px;margin-bottom:14px">Task<select id="wsel">${opts.map(o=>`<option value="${o[0]}" ${o[0]===cur[0]?"selected":""}>${o[4]} · ${esc(o[1])}${S.drafts[o[0]]?" ✓":""}</option>`).join("")}</select></label>
  <div class="stack"><div class="panel"><div class="spread"><span class="eyebrow">${esc(cur[2])}</span><span class="pill">${WORDS[cur[4]]} words</span></div><p style="margin:8px 0 0">${esc(cur[3])}</p></div>
  <div class="panel"><textarea id="draft" data-key="${cur[0]}" placeholder="Write your text here…">${esc(txt)}</textarea>
  <div class="spread" style="margin-top:8px"><span class="pill" id="wc">${words(txt)} words</span><button data-copy>Copy text</button></div></div>
  <div class="panel"><h3>Before you hand it in</h3><ul class="clean">
  <li><b>Content</b>: have you covered every point in the task?</li><li><b>Register</b>: formal or informal to suit the genre, never a mix.</li>
  <li><b>Organisation</b>: clear paragraphs and a range of linking words.</li><li><b>Language</b>: at least two structures from your grammar lessons and five phrases from your vocabulary.</li></ul>
  <p class="muted small" style="margin:0">For feedback, paste your text into Cambridge ${link(LINKS.wi,"Write & Improve")} (free), send it to a tutor, or ask an AI assistant to mark it against the Cambridge criteria for your level.</p></div></div>`;
}

function vProgress(){
  let full = 0, streak = 0;
  for (let d=1; d<=PLAN.days; d++){ const [a,b] = dayCount(d); if (b && a===b) full++; }
  for (let d = curDay(); d >= 1; d--){ const [a,b] = dayCount(d); if (!b) continue; if (a > 0) streak++; else if (d !== curDay()) break; }
  const learned = deck().filter(c => (S.cards[c.id]?.b||0) >= 3).length;
  const texts = Object.values(S.drafts).filter(t => words(t) >= 100).length;
  const tests = S.tests.slice().sort((a,b) => a.date < b.date ? 1 : -1);
  return `<h2>Progress</h2><p class="sub">You're ready for the next level when you score 70-75% or more in Reading and Listening at that level and get 4 or 5 out of 5 for writing and speaking.</p>
  <div class="stats"><div class="stat"><b>${full}</b><span>days completed</span></div><div class="stat"><b>${streak}</b><span>study-day streak</span></div><div class="stat"><b>${learned}</b><span>phrases learned</span></div><div class="stat"><b>${texts}</b><span>texts written</span></div></div>
  <div class="panel"><h3>Test results</h3><p class="muted small" style="margin:4px 0 12px">Placement test in week 1, then a check every four weeks and a mock exam at the end of each level. Rate writing and speaking from 1 to 5.</p>
  <div class="formrow"><label class="f">Date<input type="date" id="ts-date" value="${iso(today())}"></label><label class="f">Type<select id="ts-type"><option>Placement</option><option>Monthly check</option><option>Level check</option><option>EF SET</option><option>Mock exam</option></select></label>
  <label class="f">Reading %<input type="number" inputmode="numeric" min="0" max="100" id="ts-r"></label><label class="f">Listening %<input type="number" inputmode="numeric" min="0" max="100" id="ts-l"></label>
  <label class="f">Writing 1-5<input type="number" inputmode="numeric" min="1" max="5" id="ts-w"></label><label class="f">Speaking 1-5<input type="number" inputmode="numeric" min="1" max="5" id="ts-s"></label></div>
  <label class="f" style="margin-top:10px">Notes (e.g. EF SET level, recurring mistakes)<input id="ts-n"></label>
  <div class="row" style="margin-top:12px"><button class="primary" data-addtest>Save result</button><button data-leveltest>Take the level test</button></div>
  ${tests.length?`<div class="tbl" style="margin-top:14px"><table><thead><tr><th>Date</th><th>Type</th><th>Read.</th><th>List.</th><th>Writ.</th><th>Speak.</th><th>Notes</th><th></th></tr></thead><tbody>${tests.map(t=>`<tr><td>${esc(t.date)}</td><td>${esc(t.type)}</td><td>${t.r!==""?esc(t.r)+"%":""}</td><td>${t.l!==""?esc(t.l)+"%":""}</td><td>${esc(t.w)}</td><td>${esc(t.s)}</td><td>${esc(t.n)}</td><td><button class="ghost" data-deltest="${t.id}" aria-label="Delete result">✕</button></td></tr>`).join("")}</tbody></table></div>`:""}</div>
  <div class="panel" style="margin-top:12px"><h3>Error notebook</h3><p class="muted small" style="margin:4px 0 12px">Log every recurring mistake with the corrected version. Reread it during your weekly review.</p><textarea id="errors" placeholder="I depend from my parents → I depend on my parents">${esc(S.errors)}</textarea></div>`;
}

let confirmReset = false;
function vSettings(){
  const p = P();
  return `<h2>Settings</h2><div class="stack" style="margin-top:14px">
  <div class="panel"><div class="spread"><div><h3>Your plan</h3><p class="muted small" style="margin:4px 0 0">${esc(p.name||"No name")} · ${p.from} → ${p.to} · ${p.minutes} min × ${p.days} days · ${p.exam==="none"?"no exam":p.exam==="ielts"?"IELTS":"Cambridge"} · starts ${fmt(startDate(),{day:"numeric",month:"short",year:"numeric"})}</p></div><button class="primary" data-edit>Change plan</button></div>
  <p class="muted small" style="margin:10px 0 0">Changing level, time or study days rebuilds the schedule and clears the daily ticks. Flashcards, drafts, test results and notes are kept.</p></div>
  <div class="panel"><div class="spread"><div><h3>Level test</h3><p class="muted small" style="margin:4px 0 0">Check your level again at any time. The result is saved in Progress.</p></div><button data-leveltest>Take the test</button></div></div>
  <div class="panel"><h3>Install the app</h3><ul class="clean"><li><b>iPhone</b>: open this site in Safari, tap Share, then "Add to Home Screen".</li><li><b>Android</b>: open it in Chrome, tap the ⋮ menu, then "Install app".</li><li>After the first visit it works offline. Always open it from the icon: on iPhone, the installed app and Safari keep progress separately.</li></ul></div>
  <div class="panel"><h3>Backup and transfer</h3><p class="muted small" style="margin:4px 0 12px">Your progress lives on this device. To move it, generate a code, keep it somewhere safe (a note, an email to yourself) and paste it here on the new device.</p>
  <textarea id="bk" style="min-height:110px;font:12px var(--f-mono)"></textarea>
  <div class="row" style="margin-top:10px"><button data-export>Create and copy code</button><button data-import>Restore from code</button></div></div>
  <div class="panel"><h3>Start over</h3><p class="muted small" style="margin:4px 0 12px">Deletes your plan and all progress on this device.</p>
  ${confirmReset?`<div class="row"><button class="primary" data-reset="yes">Yes, delete everything</button><button data-reset="no">Cancel</button></div>`:`<button data-reset="ask">Delete my progress</button>`}</div></div>`;
}

/* ---------- events ---------- */
document.addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  const ds = b.dataset;
  if (ds.lt){ ltClick(ds); return; }
  if ("leveltest" in ds){ ltStart(ob ? "onboarding" : "app"); return; }
  if (ob){
    if (ds.ob === "next") return obNext();
    if (ds.ob === "back"){ ob.step = Math.max(0, ob.step-1); render(); return; }
    if (ds.from){ ob.d.from = ds.from; render(); return; }
    if (ds.to){ ob.d.to = ds.to; render(); return; }
    if (ds.min){ ob.d.minutes = +ds.min; render(); return; }
    if (ds.days){ ob.d.days = +ds.days; render(); return; }
    if (ds.whatif){ const [m,dd] = ds.whatif.split(",").map(Number); ob.d.minutes = m; ob.d.days = dd; render(); return; }
    if (ds.exam){ ob.d.exam = ds.exam; const v = document.getElementById("ob-start").value; if (v) ob.d.start = v; render(); return; }
    return;
  }
  if (ds.tab){ tab = ds.tab; param = null; confirmReset = false; if (tab==="flash") fc.queue = null; if (tab==="today") viewDay = curDay(); render(); return; }
  if (ds.go){ go(ds.go); return; }
  if (ds.day){ viewDay = Math.min(PLAN.days, Math.max(1, +ds.day)); render(); return; }
  if (ds.open){ viewDay = +ds.open; tab = "today"; render(); window.scrollTo(0,0); return; }
  if (ds.fc){
    if (ds.fc === "show"){ fc.shown = true; render(); return; }
    const c = fc.queue.shift(), st = S.cards[c.id] || {b:0};
    if (ds.fc === "1"){ st.b = Math.min(6, (st.b||0) + 1); st.due = iso(addDays(today(), INTERVALS[st.b])); }
    else { st.b = 0; st.due = iso(addDays(today(), 1)); fc.queue.splice(Math.min(3, fc.queue.length), 0, c); }
    S.cards[c.id] = st; save(); fc.shown = false; render(); return;
  }
  if ("rev" in ds){ S.reverse = !S.reverse; save(); fc.shown = false; render(); return; }
  if ("addcard" in ds){
    const en = document.getElementById("nc-en").value.trim(), it = document.getElementById("nc-it").value.trim(), ex = document.getElementById("nc-ex").value.trim();
    if (!en || !it){ toast("Fill in both the phrase and its meaning"); return; }
    S.custom.push({id: Date.now().toString(36), en, it, ex}); save(); fc.queue = null; render(); toast("Card added"); return;
  }
  if (ds.delcard){ S.custom = S.custom.filter(c => c.id !== ds.delcard); delete S.cards["c"+ds.delcard]; save(); fc.queue = null; render(); return; }
  if (ds.checkEx){
    const [st,u,i] = ds.checkEx.split("-"), inp = document.getElementById(`g-${ds.checkEx}`), fb = document.getElementById(`fb-${ds.checkEx}`);
    const ans = STAGES[st].grammar[+u].q[+i][1].split("|"), ok = ans.some(a => norm(a) === norm(inp.value));
    fb.className = "fb " + (ok ? "good" : "bad");
    fb.innerHTML = ok ? "Correct." : (inp.value.trim() ? "Not quite. Answer: " : "Answer: ") + `<i>${esc(ans[0])}</i>`;
    return;
  }
  if ("copy" in ds){ const t = document.getElementById("draft"); try { navigator.clipboard.writeText(t.value).then(() => toast("Text copied"), () => { t.select(); toast("Select the text and copy it"); }); } catch(err){ t.select(); } return; }
  if ("addtest" in ds){
    const g = id => document.getElementById(id).value.trim();
    S.tests.push({id: Date.now().toString(36), date:g("ts-date"), type:g("ts-type"), r:g("ts-r"), l:g("ts-l"), w:g("ts-w"), s:g("ts-s"), n:g("ts-n")}); save(); render(); toast("Result saved"); return;
  }
  if (ds.deltest){ S.tests = S.tests.filter(t => t.id !== ds.deltest); save(); render(); return; }
  if ("edit" in ds){ startOnboarding(); return; }
  if ("export" in ds){ const t = document.getElementById("bk"); t.value = btoa(unescape(encodeURIComponent(JSON.stringify(S)))); t.select(); try { navigator.clipboard.writeText(t.value).then(() => toast("Code copied"), () => toast("Copy the selected code")); } catch(err){} return; }
  if ("import" in ds){
    try { const o = JSON.parse(decodeURIComponent(escape(atob(document.getElementById("bk").value.trim())))); if (!o || typeof o !== "object" || !("done" in o)) throw 0; S = Object.assign(blank(), o); save(); boot(); toast("Progress restored"); }
    catch(err){ toast("That code isn't valid. Paste the whole code."); }
    return;
  }
  if (ds.reset){
    if (ds.reset === "ask") confirmReset = true;
    else if (ds.reset === "yes"){ S = blank(); save(); confirmReset = false; boot(); toast("Everything was deleted"); return; }
    else confirmReset = false;
    render(); return;
  }
});
document.addEventListener("change", e => {
  const t = e.target;
  if (t.dataset.check){ if (t.checked) S.done[t.dataset.check] = 1; else delete S.done[t.dataset.check]; save(); render(); }
  if (t.id === "vsel" || t.id === "wsel"){ param = t.value; render(); }
});
document.addEventListener("input", e => {
  const t = e.target;
  if (t.id === "draft"){ S.drafts[t.dataset.key] = t.value; if (!t.value.trim()) delete S.drafts[t.dataset.key]; save(); document.getElementById("wc").textContent = words(t.value) + " words"; }
  if (t.id === "errors"){ S.errors = t.value; save(); }
});

function boot(){
  if (!S.profile){
    PLAN = null; startOnboarding(); return;
  }
  ob = null; PLAN = buildPlan(S.profile); viewDay = curDay(); render();
}
// Users of the first version (B2 → C1, 2 hours a day) keep their plan without going through setup again.
if (!S.profile && S.start && Object.keys(S.done).length){ S.profile = {name:"", from:"B2", to:"C1", minutes:120, days:7, exam:"cambridge", start:S.start}; save(); }
boot();
if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("sw.js").catch(() => {});
try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch(e) {}
