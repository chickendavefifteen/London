/* Tiny chess engine for out-of-book positions.
 * Negamax + alpha-beta + simple piece-square tables.
 * Depth tuned for mobile (2–4 ply). No quiescence for speed;
 * move ordering on captures gives acceptable tactical sight.
 */
(function(){
  const V = { p:100, n:320, b:330, r:500, q:900, k:20000 };

  // Piece-square tables (from White's POV). Mirrored for Black.
  const PST = {
    p:[ 0,0,0,0,0,0,0,0,  50,50,50,50,50,50,50,50,  10,10,20,30,30,20,10,10,
        5,5,10,25,25,10,5,5,  0,0,0,20,20,0,0,0,   5,-5,-10,0,0,-10,-5,5,
        5,10,10,-20,-20,10,10,5, 0,0,0,0,0,0,0,0],
    n:[-50,-40,-30,-30,-30,-30,-40,-50,  -40,-20,0,0,0,0,-20,-40,
       -30,0,10,15,15,10,0,-30, -30,5,15,20,20,15,5,-30,
       -30,0,15,20,20,15,0,-30, -30,5,10,15,15,10,5,-30,
       -40,-20,0,5,5,0,-20,-40, -50,-40,-30,-30,-30,-30,-40,-50],
    b:[-20,-10,-10,-10,-10,-10,-10,-20, -10,0,0,0,0,0,0,-10,
       -10,0,5,10,10,5,0,-10,    -10,5,5,10,10,5,5,-10,
       -10,0,10,10,10,10,0,-10,  -10,10,10,10,10,10,10,-10,
       -10,5,0,0,0,0,5,-10,      -20,-10,-10,-10,-10,-10,-10,-20],
    r:[ 0,0,0,0,0,0,0,0,  5,10,10,10,10,10,10,5,  -5,0,0,0,0,0,0,-5,
       -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5,   -5,0,0,0,0,0,0,-5,
       -5,0,0,0,0,0,0,-5,  0,0,0,5,5,0,0,0],
    q:[-20,-10,-10,-5,-5,-10,-10,-20, -10,0,0,0,0,0,0,-10,
       -10,0,5,5,5,5,0,-10,  -5,0,5,5,5,5,0,-5,
        0,0,5,5,5,5,0,-5,  -10,5,5,5,5,5,0,-10,
       -10,0,5,0,0,0,0,-10, -20,-10,-10,-5,-5,-10,-10,-20],
    k:[-30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30,
       -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30,
       -20,-30,-30,-40,-40,-30,-30,-20, -10,-20,-20,-20,-20,-20,-20,-10,
        20,20,0,0,0,0,20,20,    20,30,10,0,0,10,30,20]
  };

  function sqIdx(sq){ // a1..h8 -> 0..63 from White's POV (a8=0)
    const f = sq.charCodeAt(0) - 97;       // 0..7
    const r = 8 - parseInt(sq[1],10);      // 0..7 (top=0)
    return r*8 + f;
  }

  function evaluate(g){
    const b = g.board();
    let score = 0;
    for (let r=0;r<8;r++) for (let f=0;f<8;f++){
      const p = b[r][f]; if (!p) continue;
      const sign = p.color === 'w' ? 1 : -1;
      const t = p.type;
      const idx = p.color === 'w' ? r*8+f : (7-r)*8+f;
      score += sign * (V[t] + (PST[t] ? PST[t][idx] : 0));
    }
    return g.turn() === 'w' ? score : -score;
  }

  function orderMoves(moves){
    // MVV-LVA-ish: captures first, then checks, then quiet.
    return moves.sort((a,b) => {
      const ca = a.captured ? (V[a.captured] - V[a.piece]/10) : 0;
      const cb = b.captured ? (V[b.captured] - V[b.piece]/10) : 0;
      if (cb !== ca) return cb - ca;
      return (b.san.includes('+')?1:0) - (a.san.includes('+')?1:0);
    });
  }

  function negamax(g, depth, alpha, beta){
    if (g.in_checkmate()) return -99999 + (100 - depth);
    if (g.in_draw() || g.in_stalemate() || g.in_threefold_repetition() || g.insufficient_material()) return 0;
    if (depth === 0) return evaluate(g);
    const moves = orderMoves(g.moves({ verbose:true }));
    let best = -1e9;
    for (const m of moves){
      g.move(m);
      const score = -negamax(g, depth-1, -beta, -alpha);
      g.undo();
      if (score > best) best = score;
      if (score > alpha) alpha = score;
      if (alpha >= beta) break;
    }
    return best;
  }

  function pickBest(g, depth, noise){
    const moves = orderMoves(g.moves({ verbose:true }));
    if (!moves.length) return null;
    let best = -1e9, bestMoves = [];
    for (const m of moves){
      g.move(m);
      const score = -negamax(g, depth-1, -1e9, 1e9) + (noise ? (Math.random()*noise - noise/2) : 0);
      g.undo();
      if (score > best + 1e-6){ best = score; bestMoves = [m]; }
      else if (Math.abs(score - best) < 1e-6) bestMoves.push(m);
    }
    return bestMoves[Math.floor(Math.random()*bestMoves.length)];
  }

  /* Public API */
  window.Engine = {
    // Returns a {san, uci} move. `level` is 1..3.
    chooseMove(game, level){
      const depth = level === 1 ? 1 : level === 2 ? 2 : 3;
      const noise = level === 1 ? 60 : level === 2 ? 20 : 0;
      const mv = pickBest(game, depth, noise);
      return mv;
    },
    evaluate
  };
})();
