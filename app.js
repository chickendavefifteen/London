/* London Tutor — UI and app glue. */
(function(){
  const GLYPH = { // Always use the SOLID glyphs and color via CSS so white/black
                  // render with consistent contrast on every phone font.
    K:'\u265A', Q:'\u265B', R:'\u265C', B:'\u265D', N:'\u265E', P:'\u265F'
  };
  const FILES = ['a','b','c','d','e','f','g','h'];
  const RANKS = ['8','7','6','5','4','3','2','1'];

  let game;                   // chess.js instance
  let orientation = 'w';      // 'w' bottom
  let selected = null;        // selected square 'e2'
  let legalFrom = [];         // cached legal moves from selected
  let book;                   // FEN -> move entries
  let mode = 'play';          // 'play' | 'learn' | 'theory'
  let opponentLine = 'random';
  let strength = 2;
  let coachLevel = 'full';
  let hintSquare = null;      // {from, to} to highlight when hint shown
  let hintHTML = null;        // coach override shown once
  let busy = false;

  // Learn mode state
  let lesson = null, lessonIdx = 0;

  /* ---------- DOM ---------- */
  const $ = (id) => document.getElementById(id);
  const boardEl = $('board');
  const statusEl = $('status');
  const coachEl = $('coach');
  const movesEl = $('move-list');

  /* ---------- BOARD RENDER ---------- */
  function buildSquares(){
    boardEl.innerHTML = '';
    for (let r=0;r<8;r++){
      for (let f=0;f<8;f++){
        const disp = orientation === 'w'
          ? { file: FILES[f], rank: RANKS[r] }
          : { file: FILES[7-f], rank: RANKS[7-r] };
        const sq = disp.file + disp.rank;
        const el = document.createElement('div');
        el.className = 'sq ' + (((f+r)%2===0) ? 'l' : 'd');
        el.dataset.sq = sq;
        if (f === 0){
          const c = document.createElement('span'); c.className='coord rank';
          c.textContent = disp.rank; el.appendChild(c);
        }
        if (r === 7){
          const c = document.createElement('span'); c.className='coord file';
          c.textContent = disp.file; el.appendChild(c);
        }
        el.addEventListener('click', onSquareClick);
        boardEl.appendChild(el);
      }
    }
  }

  function render(){
    const b = game.board();
    // clear piece spans + marker classes, keep coords
    for (const el of boardEl.children){
      el.classList.remove('sel','hl','dot','cap','hint');
      const p = el.querySelector('.p'); if (p) p.remove();
    }
    // place pieces
    for (let r=0;r<8;r++) for (let f=0;f<8;f++){
      const p = b[r][f]; if (!p) continue;
      const sq = FILES[f] + RANKS[r];
      const el = squareEl(sq);
      const span = document.createElement('span');
      span.className = 'p ' + (p.color === 'w' ? 'pw' : 'pb');
      span.textContent = GLYPH[p.type.toUpperCase()];
      el.appendChild(span);
    }
    // highlight last move
    const h = game.history({ verbose:true });
    const last = h[h.length-1];
    if (last){
      squareEl(last.from)?.classList.add('hl');
      squareEl(last.to)?.classList.add('hl');
    }
    // selected & legal targets
    if (selected){
      squareEl(selected)?.classList.add('sel');
      for (const m of legalFrom){
        const t = squareEl(m.to); if (!t) continue;
        t.classList.add(m.captured ? 'cap' : 'dot');
      }
    }
    if (hintSquare){
      squareEl(hintSquare.from)?.classList.add('hint');
      squareEl(hintSquare.to)?.classList.add('hint');
    }
    renderStatus();
    renderMoves();
    renderCoach();
  }

  function squareEl(sq){ return boardEl.querySelector('[data-sq="'+sq+'"]'); }

  function renderStatus(){
    let s = '';
    if (game.in_checkmate())      s = (game.turn()==='w'?'White':'Black') + ' is checkmated.';
    else if (game.in_stalemate()) s = 'Stalemate — draw.';
    else if (game.in_draw())      s = 'Drawn.';
    else if (game.in_check())     s = (game.turn()==='w'?'White':'Black') + ' is in check.';
    else                          s = (game.turn()==='w'?'White to move':'Black to move');
    statusEl.textContent = s;
  }

  function renderMoves(){
    const h = game.history({ verbose:true });
    movesEl.innerHTML = '';
    for (let i=0;i<h.length;i+=2){
      const n = document.createElement('div'); n.className='n';
      n.textContent = (i/2 + 1) + '.';
      const wm = document.createElement('div'); wm.className='m';
      wm.textContent = h[i].san;
      const bm = document.createElement('div'); bm.className='m';
      bm.textContent = h[i+1] ? h[i+1].san : '';
      // mark book-ness of white's moves only
      const bk = moveWasBook(h, i);
      if (bk === true) wm.classList.add('book');
      else if (bk === false) wm.classList.add('off');
      movesEl.appendChild(n); movesEl.appendChild(wm); movesEl.appendChild(bm);
    }
    movesEl.scrollTop = movesEl.scrollHeight;
  }

  // Was white's move at history index i a book move?
  function moveWasBook(h, i){
    // Replay up to i to get FEN, then check book
    const g = new Chess();
    for (let k=0;k<i;k++) g.move(h[k].san);
    const key = g.fen().split(' ').slice(0,4).join(' ');
    const entries = book.get(key);
    if (!entries || !entries.length) return null; // out of book, no judgement
    return entries.some(e => e.san === h[i].san);
  }

  function renderCoach(){
    if (hintHTML){ coachEl.innerHTML = hintHTML; hintHTML = null; return; }
    if (mode === 'learn') { renderLessonCoach(); return; }
    if (coachLevel === 'off') { coachEl.textContent = ''; return; }
    // Show advice for whoever's turn it is if that's the user's turn
    if (game.turn() !== orientation){ coachEl.innerHTML = "<i>Engine thinking…</i>"; return; }
    if (game.game_over()) { coachEl.textContent = 'Game over.'; return; }
    const key = game.fen().split(' ').slice(0,4).join(' ');
    const entries = book.get(key);
    if (entries && entries.length){
      const top = entries.slice().sort((a,b)=>b.weight-a.weight)[0];
      if (coachLevel === 'full'){
        coachEl.innerHTML = '<b>Book:</b> ' + top.san +
          (top.note ? '<br><span class="muted">' + top.note + '</span>' : '');
      } else {
        coachEl.innerHTML = '<b>You\'re in book.</b> Remember the London skeleton.';
      }
    } else {
      // Past theory — give plan hint
      coachEl.innerHTML = '<b>Out of book.</b> Your plans: <i>Ne5 &amp; kingside attack</i>, or <i>c4 break</i> if Black is solid, or <i>Qb3 vs ...Bf5</i>.';
    }
  }

  /* ---------- INTERACTION ---------- */
  function onSquareClick(e){
    if (busy) return;
    if (mode === 'learn') return;            // learn is driven by Next button
    if (game.game_over()) return;
    if (game.turn() !== orientation) return; // not your move
    const sq = e.currentTarget.dataset.sq;
    if (selected){
      // try move
      const m = legalFrom.find(x => x.to === sq);
      if (m){
        // promotion handling
        let promotion;
        if (m.promotion){
          promotion = askPromotion();
          if (!promotion) { selected = null; legalFrom = []; render(); return; }
        }
        game.move({ from: selected, to: sq, promotion });
        selected = null; legalFrom = []; hintSquare = null;
        render();
        setTimeout(engineMove, 280);
        return;
      }
      // reselect if tapped own piece
      const piece = game.get(sq);
      if (piece && piece.color === orientation){
        selected = sq;
        legalFrom = game.moves({ square: sq, verbose:true });
        render();
        return;
      }
      selected = null; legalFrom = []; render();
      return;
    }
    const piece = game.get(sq);
    if (piece && piece.color === orientation){
      selected = sq;
      legalFrom = game.moves({ square: sq, verbose:true });
      render();
    }
  }

  function askPromotion(){
    // Very simple prompt; supports q/r/b/n
    const choice = (prompt('Promote to? q, r, b, or n', 'q') || '').trim().toLowerCase();
    return ['q','r','b','n'].includes(choice) ? choice : 'q';
  }

  /* ---------- ENGINE / BOOK REPLY ---------- */
  function engineMove(){
    if (game.game_over() || game.turn() === orientation) return;
    busy = true; renderCoach();
    // Slight delay so the UI updates first
    setTimeout(() => {
      const mv = pickEngineMove();
      if (mv){
        game.move({ from: mv.from, to: mv.to, promotion: mv.promotion });
      }
      busy = false;
      render();
    }, 30);
  }

  function pickEngineMove(){
    const key = game.fen().split(' ').slice(0,4).join(' ');
    const entries = book.get(key);
    if (entries && entries.length){
      // Filter by opponentLine preference
      let pool = entries;
      if (opponentLine !== 'random'){
        const filtered = entries.filter(e => !e.line || e.line === opponentLine);
        if (filtered.length) pool = filtered;
      }
      // Weighted pick
      const total = pool.reduce((s,e)=>s+e.weight, 0);
      let r = Math.random() * total;
      for (const e of pool){ r -= e.weight; if (r <= 0) return toMove(e.san); }
      return toMove(pool[0].san);
    }
    // Out of book — use the built-in engine
    const mv = window.Engine.chooseMove(game, strength);
    return mv;
  }

  function toMove(san){
    const moves = game.moves({ verbose:true });
    return moves.find(m => m.san === san) || null;
  }

  /* ---------- HINT ---------- */
  function showHint(){
    if (game.turn() !== orientation || game.game_over()) return;
    const key = game.fen().split(' ').slice(0,4).join(' ');
    const entries = book.get(key);
    let advice;
    if (entries && entries.length){
      advice = entries.slice().sort((a,b)=>b.weight-a.weight)[0];
      const mv = toMove(advice.san);
      if (mv){
        hintSquare = { from: mv.from, to: mv.to };
        hintHTML = '<b>Hint:</b> play <b>' + advice.san + '</b>' +
          (advice.note ? '<br><span class="muted">' + advice.note + '</span>' : '');
        render();
        return;
      }
    }
    const mv = window.Engine.chooseMove(game, 3);
    if (mv){
      hintSquare = { from: mv.from, to: mv.to };
      hintHTML = '<b>Hint (engine):</b> ' + mv.san +
        '<br><span class="muted">No book here — think London plans: Ne5, c4 break, or Qb3.</span>';
      render();
    }
  }

  /* ---------- UNDO / NEW / FLIP ---------- */
  function undoMove(){
    if (mode === 'learn') return;
    if (game.history().length === 0) return;
    // undo one full pair (engine + user) so the user is to move again
    game.undo();
    if (game.turn() !== orientation && game.history().length) game.undo();
    hintSquare = null; selected = null; legalFrom = [];
    render();
  }
  function newGame(){
    game = new Chess();
    selected = null; legalFrom = []; hintSquare = null;
    render();
    // If user plays Black, engine moves first
    if (orientation === 'b') setTimeout(engineMove, 200);
  }
  function flip(){
    orientation = orientation === 'w' ? 'b' : 'w';
    buildSquares(); render();
    if (orientation !== game.turn() && !game.game_over()) {
      // flipping mid-game shouldn't force moves
    }
  }

  /* ---------- LEARN MODE ---------- */
  function loadLessons(){
    const sel = $('lesson-select');
    sel.innerHTML = '';
    for (const L of window.LONDON_LESSONS){
      const o = document.createElement('option');
      o.value = L.id; o.textContent = L.title;
      sel.appendChild(o);
    }
    sel.addEventListener('change', () => startLesson(sel.value));
    startLesson(window.LONDON_LESSONS[0].id);
  }
  function startLesson(id){
    lesson = window.LONDON_LESSONS.find(L => L.id === id) || window.LONDON_LESSONS[0];
    lessonIdx = 0;
    game = new Chess();
    orientation = 'w';
    buildSquares();
    hintSquare = null; selected = null;
    render();
    renderLessonIntro();
  }
  function renderLessonIntro(){
    $('lesson-text').innerHTML =
      '<h3>' + lesson.title + '</h3>' +
      '<p>' + lesson.intro + '</p>' +
      '<p class="muted">Tap <b>Next ▶</b> to play through the line.</p>';
  }
  function renderLessonCoach(){
    if (!lesson) return;
    if (lessonIdx >= lesson.steps.length){
      coachEl.innerHTML = '<b>Lesson complete!</b> Tap Restart or pick another lesson.';
      return;
    }
    const [san, speaker, text] = lesson.steps[lessonIdx];
    const who = speaker === 'w' ? 'You (White)' : speaker === 'b' ? 'Black' : 'Note';
    coachEl.innerHTML = '<b>' + who + ':</b> ' + (san ? '<b>' + san + '</b> — ' : '') + (text || '');
  }
  function lessonNext(){
    if (!lesson || lessonIdx >= lesson.steps.length) return;
    const [san, speaker, text] = lesson.steps[lessonIdx];
    if (san) game.move(san);
    lessonIdx++;
    render();
    // Update lesson text panel with remaining explanation
    const lt = $('lesson-text');
    if (lessonIdx < lesson.steps.length){
      const [s2, sp2, t2] = lesson.steps[lessonIdx];
      lt.innerHTML = '<h3>Move ' + (Math.floor(game.history().length/2)+1) + '</h3>' +
        (t2 ? '<p>' + t2 + '</p>' : '<p class="muted">Tap Next to continue.</p>');
    } else {
      lt.innerHTML = '<h3>Finished</h3><p>Go to <b>Play</b> and try this line against the engine to cement it.</p>';
    }
  }
  function lessonBack(){
    if (!lesson || lessonIdx === 0) return;
    lessonIdx--;
    const [san] = lesson.steps[lessonIdx];
    if (san) game.undo();
    render();
    renderLessonCoach();
  }
  function lessonRestart(){ if (lesson) startLesson(lesson.id); }

  /* ---------- MODE SWITCHING ---------- */
  function setMode(m){
    mode = m;
    for (const t of document.querySelectorAll('.tab')) t.classList.toggle('active', t.dataset.mode === m);
    $('panel-play').classList.toggle('active', m === 'play');
    $('panel-learn').classList.toggle('active', m === 'learn');
    $('panel-theory').classList.toggle('active', m === 'theory');
    if (m === 'play'){ if (!game || game.history().length === 0) newGame(); else render(); }
    if (m === 'learn'){ if (!lesson) loadLessons(); else startLesson(lesson.id); }
    if (m === 'theory'){ /* static */ }
  }

  /* ---------- INIT ---------- */
  function init(){
    if (typeof Chess === 'undefined'){
      statusEl.textContent = 'Failed to load chess.js. Check your connection and reload.';
      return;
    }
    book = window.buildBook();
    game = new Chess();
    buildSquares();
    render();

    // Controls
    $('btn-hint').addEventListener('click', showHint);
    $('btn-undo').addEventListener('click', undoMove);
    $('btn-flip').addEventListener('click', flip);
    $('btn-new').addEventListener('click', newGame);
    $('btn-next').addEventListener('click', lessonNext);
    $('btn-back').addEventListener('click', lessonBack);
    $('btn-reset').addEventListener('click', lessonRestart);
    for (const t of document.querySelectorAll('.tab')) t.addEventListener('click', () => setMode(t.dataset.mode));

    $('opponent-line').addEventListener('change', e => { opponentLine = e.target.value; });
    $('strength').addEventListener('change', e => { strength = parseInt(e.target.value,10); });
    $('coach-level').addEventListener('change', e => { coachLevel = e.target.value; renderCoach(); });

    // Theory tab content
    $('theory-body').innerHTML = window.LONDON_THEORY;
    loadLessons();
    setMode('play');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
