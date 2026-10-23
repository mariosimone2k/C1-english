// Level test: six questions per CEFR band, easiest first. A band counts as reached with 4/6 or more;
// the test stops early when a band scores 2/6 or less.
const LT_BANDS = ["A2","B1","B2","C1","C2"];
const LT_Q = {
  A2:[["She ___ to work by bus every day.",["go","goes","going","is go"],1],
      ["There aren't ___ apples left.",["some","any","no","much"],1],
      ["I ___ my keys yesterday.",["lose","lost","have lost","losing"],1],
      ["This is ___ film I've ever seen.",["the better","the best","best","more good"],1],
      ["We ___ dinner when the phone rang.",["had","were having","have","are having"],1],
      ["Can you tell me where ___?",["is the station","the station is","is station","station is it"],1]],
  B1:[["I ___ here since 2019.",["live","am living","have lived","lived"],2],
      ["If it rains tomorrow, we ___ at home.",["stay","will stay","would stay","stayed"],1],
      ["You ___ wear a uniform; it's optional.",["mustn't","don't have to","can't","shouldn't"],1],
      ["The man ___ car was stolen called the police.",["who","which","whose","that"],2],
      ["I'm not used to ___ up so early.",["get","getting","got","have got"],1],
      ["She asked me where I ___.",["live","lived","am living","have lived"],1]],
  B2:[["By the time we arrived, the film ___.",["started","has started","had started","was starting"],2],
      ["If I ___ harder, I would have passed.",["studied","had studied","would study","have studied"],1],
      ["He's not here yet. He must ___ the bus.",["miss","have missed","missed","be missed"],1],
      ["The new bridge ___ next year.",["will build","will be built","is building","builds"],1],
      ["___ the bad weather, the match went ahead.",["Although","Despite","However","Even though"],1],
      ["I wish I ___ more time to travel.",["have","had","would have","will have"],1]],
  C1:[["Never ___ such a beautiful view.",["I have seen","have I seen","I saw","did I saw"],1],
      ["___ you need any help, please call me.",["Should","Would","Were","Had"],0],
      ["It's high time you ___ a job.",["find","found","will find","have found"],1],
      ["She is thought ___ the country last week.",["to leave","leaving","to have left","having left"],2],
      ["The project succeeded, ___ was largely thanks to her.",["that","what","which","it"],2],
      ["He's far too reliant ___ his parents.",["of","from","on","to"],2]],
  C2:[["___ as it may seem, I actually enjoyed the exam.",["Strange","Strangely","However strange","So strange"],0],
      ["The committee recommended that he ___ immediately.",["resigns","resign","resigned","will resign"],1],
      ["___ for your help, I would never have finished.",["Had it not been","If not","Without","Were it not"],0],
      ["The link between the two is too ___ to support such a strong conclusion.",["tenuous","tender","tentative","tedious"],0],
      ["Much ___ I admire her work, I can't agree with her.",["as","though","that","like"],0],
      ["Critics called her performance a ___ de force.",["tour","coup","pièce","raison"],0]]
};
let lt = null; // {band, i, scores:{}, answered:null, from:"onboarding"|"app"}

function ltStart(from){ lt = {band:0, i:0, scores:{}, picked:null, from, done:false}; render(); window.scrollTo(0,0); }
function ltLevel(){
  let lvl = null;
  for (const b of LT_BANDS){ const s = lt.scores[b]; if (s === undefined || s < 4) break; lvl = b; }
  return lvl; // null = below A2
}
function ltAnswer(k){
  if (lt.picked !== null) return;
  const b = LT_BANDS[lt.band], q = LT_Q[b][lt.i];
  lt.picked = k; lt.scores[b] = (lt.scores[b] || 0) + (k === q[2] ? 1 : 0);
  render();
}
function ltNext(){
  const b = LT_BANDS[lt.band];
  lt.picked = null; lt.i++;
  if (lt.i >= LT_Q[b].length){
    lt.scores[b] = lt.scores[b] || 0;
    if (lt.scores[b] <= 2 || lt.band === LT_BANDS.length-1) lt.done = true;
    else { lt.band++; lt.i = 0; }
  }
  if (lt.done){
    const lvl = ltLevel();
    S.tests.push({id: Date.now().toString(36), date: iso(today()), type:"Level test", r:"", l:"", w:"", s:"", n:`Estimated level: ${lvl || "below A2"} (${LT_BANDS.filter(x=>lt.scores[x]!==undefined).map(x=>x+" "+lt.scores[x]+"/6").join(", ")})`});
    save();
  }
  render(); window.scrollTo(0,0);
}
function vLevelTest(){
  const total = LT_BANDS.length*6, n = lt.band*6 + lt.i + (lt.picked!==null ? 1 : 0);
  if (lt.done){
    const lvl = ltLevel(), start = !lvl ? "A2" : lvl === "C2" ? null : lvl;
    const msg = !lvl ? "Your English is around A2 or below. Start from A2 and the plan will build up the basics."
      : lvl === "C2" ? "Impressive: you are already at C2 level in grammar. Keep it up with reading, writing and speaking practice."
      : `Your grammar is at ${lvl} level (${LEVEL_INFO[lvl].name}). Your plan should start from ${lvl}.`;
    return `<div class="ob"><div class="eyebrow">Level test result</div><h1>${lvl || "A2 or below"}</h1>
      <div class="track">${LEVELS.map(l=>`<div class="seg ${l===lvl?"now":lvl && LEVELS.indexOf(l)<LEVELS.indexOf(lvl)?"done":""}">${l}</div>`).join("")}</div>
      <p class="sub" style="margin-top:16px">${msg}</p>
      <div class="panel"><table><thead><tr><th>Level</th><th>Score</th></tr></thead><tbody>${LT_BANDS.map(b=>`<tr><td>${b}</td><td>${lt.scores[b]!==undefined ? lt.scores[b]+" / 6" : "<span class='muted'>not reached</span>"}</td></tr>`).join("")}</tbody></table></div>
      <p class="muted small">This quick test measures grammar only. Your first study days include a fuller placement test with reading, listening, writing and speaking. The result is saved in Progress.</p>
      <div class="nav" style="display:flex;justify-content:space-between;gap:10px;margin-top:18px"><button class="ghost" data-lt="close">${lt.from==="onboarding"?"Back to setup":"Close"}</button>${start?`<button class="primary" data-lt="use" data-level="${start}">Start my plan from ${start}</button>`:""}</div></div>`;
  }
  const b = LT_BANDS[lt.band], q = LT_Q[b][lt.i];
  return `<div class="ob"><div class="spread"><div class="eyebrow">Level test · question ${lt.band*6+lt.i+1}</div><button class="ghost" data-lt="close">Quit</button></div>
    <div class="bar"><i style="width:${n/total*100}%"></i></div>
    <h2 style="margin-top:8px">${esc(q[0]).replace("___","<span style=\"color:var(--accent)\">_____</span>")}</h2>
    <div class="choices">${q[1].map((o,k)=>{ let st = ""; if (lt.picked!==null){ if (k===q[2]) st = "border-color:var(--ok);background:var(--ok-soft)"; else if (k===lt.picked) st = "border-color:var(--accent);background:var(--accent-soft)"; }
      return `<button class="choice simple" style="${st}" data-lt="ans" data-k="${k}" ${lt.picked!==null?"disabled":""}><b>${esc(o)}</b></button>`; }).join("")}</div>
    <div style="display:flex;justify-content:flex-end;margin-top:18px">${lt.picked!==null?`<button class="primary" data-lt="next">Next</button>`:`<span class="muted small">Choose one answer. Don't guess wildly: "I don't know" is better than luck.</span>`}</div>
    ${lt.picked===null?`<div style="display:flex;justify-content:flex-end;margin-top:8px"><button class="ghost" data-lt="ans" data-k="-1">I don't know</button></div>`:""}</div>`;
}
function ltClick(ds){
  if (ds.lt === "ans") return ltAnswer(+ds.k);
  if (ds.lt === "next") return ltNext();
  if (ds.lt === "close"){ lt = null; render(); return; }
  if (ds.lt === "use"){
    const level = ds.level, wasOnboarding = lt.from === "onboarding"; lt = null;
    if (!ob){ startOnboarding(); }
    ob.d.from = level; if (LEVELS.indexOf(ob.d.to) <= LEVELS.indexOf(level)) ob.d.to = LEVELS[LEVELS.indexOf(level)+1];
    ob.step = 2; render(); window.scrollTo(0,0);
  }
}
