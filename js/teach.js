// "Teach me": a guided lesson built from one grammar unit and its week's vocabulary.
// Warm-up from the previous unit, explanation one point at a time, examples, practice with instant
// feedback (mistakes come back at the end), vocabulary quiz, a short writing task, then a summary.
let tc = null;

function unitKey(st, u){ return st + "-" + u; }
function prevUnit(st, u){
  if (u > 0) return [st, u-1];
  const si = PLAN.stages.indexOf(st);
  if (si > 0){ const ps = PLAN.stages[si-1]; return [ps, STAGES[ps].grammar.length-1]; }
  return null;
}
function shuffle(a){ const b = a.slice(); for (let i = b.length-1; i > 0; i--){ const j = Math.floor(Math.random()*(i+1)); [b[i],b[j]] = [b[j],b[i]]; } return b; }

function teachStart(st, u){
  const g = STAGES[st].grammar[u], steps = [];
  const pv = prevUnit(st, u);
  if (pv){ const pg = STAGES[pv[0]].grammar[pv[1]]; pg.q.slice(0,2).forEach(q => steps.push({type:"ex", q, warm:true, from:pg.t})); }
  g.e.forEach((e,i) => steps.push({type:"explain", e, i, n:g.e.length}));
  steps.push({type:"examples"});
  g.q.forEach(q => steps.push({type:"ex", q}));
  const wk = PLAN.weeks.find(w => w.stage===st && w.g.includes(u)) || PLAN.weeks[0];
  const th = STAGES[st].themes[wk.t[0]], picks = shuffle(th.v).slice(0,5);
  steps.push({type:"vshow", th, picks});
  picks.forEach(v => { const others = shuffle(th.v.filter(x => x !== v)).slice(0,3).map(x => x[0]); steps.push({type:"vq", v, opts:shuffle([v[0], ...others])}); });
  steps.push({type:"produce"});
  steps.push({type:"done"});
  tc = {st, u, g, steps, i:0, state:null, score:0, total:0, wrong:[], retried:new Set(), text:""};
  render(); window.scrollTo(0,0);
}

function teachAdvance(){ tc.i++; tc.state = null; render(); window.scrollTo(0,0); }

function vTeach(){
  const s = tc.steps[tc.i], g = tc.g, pct = Math.round(tc.i/(tc.steps.length-1)*100);
  const head = `<div class="ob"><div class="spread"><div class="eyebrow">Teach me · ${esc(tc.st)} · ${esc(g.t)}</div><button class="ghost" data-tc="quit">Quit</button></div><div class="bar"><i style="width:${pct}%"></i></div>`;
  const next = (label="Continue") => `<div style="display:flex;justify-content:flex-end;margin-top:18px"><button class="primary" data-tc="next">${label}</button></div>`;
  let body = "";
  if (s.type === "explain") body = `<div class="eyebrow" style="color:var(--muted)">Key point ${s.i+1} of ${s.n}</div><div class="panel" style="margin-top:10px;font-size:17px;line-height:1.6">${s.e}</div>${s.i===0?`<p class="muted small">Read it, then try to say the rule in your own words before moving on.</p>`:""}${next()}`;
  if (s.type === "examples") body = `<h2>See it in action</h2><p class="sub">Read each example aloud. Notice where the structure sits in the sentence.</p><div class="stack">${g.x.map(x=>`<div class="quote" style="margin:0;font-size:16px"><i>${esc(x)}</i></div>`).join("")}</div>${next("Start practising")}`;
  if (s.type === "ex"){
    const ans = s.q[1].split("|"), st8 = tc.state;
    body = `${s.warm?`<div class="pill warn">Warm-up from: ${esc(s.from)}</div>`:s.retry?`<div class="pill accent">Second try</div>`:`<div class="eyebrow" style="color:var(--muted)">Practice</div>`}
      <h2 style="margin-top:10px">${esc(s.q[0]).replace(/___/g,"<span style=\"color:var(--accent)\">_____</span>")}</h2>
      <div class="exq" style="margin-top:14px"><div class="r"><input id="tc-in" autocomplete="off" autocapitalize="off" ${st8?"disabled":""} value="${st8?esc(st8.val):""}" placeholder="Type your answer"><button class="primary" data-tc="check" ${st8?"hidden":""}>Check</button></div></div>
      ${st8 ? `<div class="panel" style="margin-top:12px;border-color:${st8.ok?"var(--ok)":"var(--accent)"};background:${st8.ok?"var(--ok-soft)":"var(--accent-soft)"}"><b>${st8.ok?"Correct!":"Not quite."}</b>${st8.ok?"":` The answer is: <i>${esc(ans[0])}</i>.<br><span class="small">It's in your error notebook, and you'll see it again before the end.</span>`}</div>${next()}`
             : `<div style="display:flex;justify-content:flex-end;margin-top:8px"><button class="ghost" data-tc="reveal">Show me the answer</button></div>`}`;
  }
  if (s.type === "vshow") body = `<h2>Vocabulary: ${esc(s.th.t)}</h2><p class="sub">Five phrases from this week. Read each one and its example, then you'll be quizzed.</p>
    <div class="panel"><div class="tbl"><table><tbody>${s.picks.map(v=>`<tr><td><b>${esc(v[0])}</b><div class="ex">${esc(v[2])}</div></td><td>${esc(v[1])}</td></tr>`).join("")}</tbody></table></div></div>${next("Quiz me")}`;
  if (s.type === "vq"){
    const st8 = tc.state;
    body = `<div class="eyebrow" style="color:var(--muted)">Which phrase means…</div><h2 style="margin-top:8px">${esc(s.v[1])}</h2>
      <div class="choices">${s.opts.map(o=>{ let css = ""; if (st8){ if (o===s.v[0]) css = "border-color:var(--ok);background:var(--ok-soft)"; else if (o===st8.val) css = "border-color:var(--accent);background:var(--accent-soft)"; } return `<button class="choice simple" style="${css}" data-tc="pick" data-v="${esc(o)}" ${st8?"disabled":""}><b>${esc(o)}</b></button>`; }).join("")}</div>
      ${st8?`<p class="muted" style="margin-top:12px"><i>${esc(s.v[2])}</i></p>${next()}`:""}`;
  }
  if (s.type === "produce") body = `<h2>Now make it yours</h2><p class="sub">Write three sentences about your own life using <b>${esc(g.t.toLowerCase())}</b>. Try to include one phrase from the vocabulary.</p>
    <textarea id="tc-text" style="min-height:150px" placeholder="1.&#10;2.&#10;3.">${esc(tc.text)}</textarea>
    <ul class="clean small muted"><li>Is the structure formed correctly?</li><li>Would a native speaker say it this way?</li><li>Read it aloud: does it sound natural?</li></ul>${next("Finish lesson")}`;
  if (s.type === "done"){
    const pct2 = tc.total ? Math.round(tc.score/tc.total*100) : 100;
    body = `<div class="eyebrow">Lesson complete</div><h1>${pct2 >= 80 ? "Great work" : pct2 >= 50 ? "Good progress" : "Keep going"}</h1>
      <div class="summary"><div><b>${tc.score}/${tc.total}</b><span>right first time</span></div><div><b>${tc.wrong.length}</b><span>added to your error notebook</span></div><div><b>5</b><span>phrases practised</span></div></div>
      <p class="sub" style="margin-top:14px">${pct2 >= 80 ? "You've got this structure. It will come back in your weekly review." : "Run the lesson again in a day or two: repetition is what makes it stick."}</p>
      <div class="row" style="justify-content:flex-end;margin-top:12px"><button data-tc="again">Repeat lesson</button><button class="primary" data-tc="quit">Done</button></div>`;
  }
  return head + body + `</div>`;
}

function teachClick(ds){
  const s = tc.steps[tc.i];
  if (ds.tc === "quit"){ tc = null; render(); window.scrollTo(0,0); return; }
  if (ds.tc === "again"){ teachStart(tc.st, tc.u); return; }
  if (ds.tc === "check" || ds.tc === "reveal"){
    const val = ds.tc === "reveal" ? "" : document.getElementById("tc-in").value;
    const ans = s.q[1].split("|"), ok = ds.tc === "check" && ans.some(a => norm(a) === norm(val));
    if (!s.retry){ tc.total++; if (ok) tc.score++; }
    if (!ok){
      if (!s.retry && !tc.retried.has(s.q[0])){ tc.retried.add(s.q[0]); tc.steps.splice(tc.steps.findIndex(x => x.type==="vshow"), 0, {type:"ex", q:s.q, retry:true}); }
      if (!s.retry){ tc.wrong.push(s.q); S.errors = (S.errors ? S.errors.trimEnd() + "\n" : "") + `${s.q[0]} → ${ans[0]}`; save(); }
    }
    tc.state = {ok, val}; render(); return;
  }
  if (ds.tc === "pick"){
    const ok = ds.v === s.v[0]; tc.total++; if (ok) tc.score++;
    if (!ok){ tc.wrong.push([s.v[1], s.v[0]]); S.errors = (S.errors ? S.errors.trimEnd() + "\n" : "") + `${s.v[1]} → ${s.v[0]}`; save(); }
    tc.state = {ok, val:ds.v}; render(); return;
  }
  if (ds.tc === "next"){
    if (s.type === "produce"){
      tc.text = document.getElementById("tc-text").value;
      if (tc.text.trim()) S.drafts["lesson-"+unitKey(tc.st,tc.u)] = tc.text;
      S.lessons = S.lessons || {}; S.lessons[unitKey(tc.st,tc.u)] = {score:tc.score, total:tc.total, date:iso(today())}; save();
    }
    teachAdvance();
  }
}
