/* London System opening book.
 * A SAN move-tree for White. Each node carries an explanation that Coach shows
 * when the position is reached. Children keyed by SAN moves that can follow.
 * Weights bias Black's choice when the engine plays a book reply.
 *
 * At load time, walkBook() converts this tree into a FEN-indexed map for fast
 * lookup regardless of move-order transpositions.
 */
window.LONDON_TREE = {
  note: "You're starting position. The London begins 1.d4.",
  plan: "Main setup: d4, Nf3, Bf4, e3, c3, Nbd2, Bd3, h3, O-O.",
  children: {
    d4: { w:1, note:"1.d4 — claim the centre and prepare the London bishop.",
      children: {
        // ---- Black plays ...Nf6 ----
        Nf6: { w:3, line:"kid", children: {
          Nf3: { w:1, note:"2.Nf3 — flexible. Keeps Bg5/Bf4 options and avoids ...e5 breaks.",
            children: {
              // KID-style
              g6: { w:2, line:"kid", children: {
                Bf4: { w:1, note:"3.Bf4 — the London bishop goes out before e3 locks it in.",
                  children: {
                    Bg7: { w:2, children: {
                      e3: { w:1, note:"4.e3 — supports d4 and frees Bd3 and short castling.",
                        children: {
                          "O-O": { w:2, children: {
                            h3: { w:1, note:"5.h3 — key London move: stops ...Nh5 hitting the Bf4.",
                              children: {
                                d6: { w:2, children: {
                                  Be2: { w:1, note:"6.Be2 — against ...g6 setups, Be2 is safer than Bd3 (no Nh5 traps, ready for kingside).",
                                    children: {
                                      Nbd7: { w:1, children: {
                                        "O-O": { w:1, note:"7.O-O — castle and then play c3 & prepare e4 or Ne5.",
                                          children: {
                                            c5: { w:2, children: {
                                              c3: { w:1, note:"8.c3 — keep the pawn chain. If ...cxd4 9.exd4 reaching a Carlsbad-like structure; if ...Qb6 defend b2 with Qb3 or Rb1.", children: {} } } },
                                            Re8: { w:1, children: {
                                              c4: { w:1, note:"When Black delays ...c5, you can play c4 to claim more space.", children: {} } } }
                                          } } } }
                                    } } } },
                                c5: { w:2, children: {
                                  c3: { w:1, note:"Meet ...c5 with c3, keeping the d4–e3–c3 triangle. If ...cxd4 exd4 and continue with Nbd2/Bd3/O-O.", children: {} } } }
                              } } } }
                        } } } }
                    } } } },
              // Symmetrical ...d5
              d5: { w:2, line:"qgd", children: {
                Bf4: { w:1, note:"3.Bf4 — classical London. Black's main tries are ...c5, ...e6, ...c6, or ...Bf5.",
                  children: {
                    c5: { w:2, children: {
                      e3: { w:1, note:"4.e3 — keep the centre fluid. Don't take on c5 yet.",
                        children: {
                          Nc6: { w:2, children: {
                            Nbd2: { w:1, note:"5.Nbd2 — supports the e4 break and stops ...Nb4 hitting Bd3 ideas later. c3 is also main.",
                              children: {
                                e6: { w:1, children: {
                                  c3: { w:1, note:"6.c3 — finish the pawn triangle. Main plan is Bd3, Qe2, dxc5, e4.", children: {} } } },
                                cxd4: { w:1, children: {
                                  exd4: { w:1, note:"Recapture with exd4 — symmetrical Carlsbad-like structure with good piece play (minority attack is NOT your plan; kingside attack is).", children: {} } } }
                              } } } }
                        } } } },
                    e6: { w:2, children: {
                      e3: { w:1, note:"4.e3 — then develop Nbd2, Bd3, c3, O-O. A calm position where you have Ne5 ideas.",
                        children: {
                          Bd6: { w:1, note:"Black tries to trade the London bishop. You can allow it (Bxd6 cxd6 doubles Black's c-pawns after ...c7-c6) or sidestep with Bg3.",
                            children: {
                              Bg3: { w:2, note:"Bg3 keeps the bishop. Play Nbd2, Bd3, c3, O-O, then Ne5 and f4.", children: {} },
                              Bxd6: { w:1, note:"Also fine: after ...cxd6 the open c-file and doubled d-pawns give White long-term targets.", children: {} }
                            } },
                          c5: { w:1, children: {
                            c3: { w:1, note:"c3, Nbd2, Bd3, O-O — standard London setup.", children: {} } } }
                        } } } },
                    c6: { w:2, line:"slav", children: {
                      e3: { w:1, children: {
                        Bf5: { w:1, note:"Black's main Slav-London try. Meet ...Bf5 with c4 or Bd3 Bxd3 Qxd3 then Nbd2 and c4.",
                          children: {
                            Bd3: { w:2, note:"Bd3 invites the trade: after ...Bxd3 Qxd3 you have a small space edge and a clear plan of c4/Nbd2.",
                              children: {
                                Bxd3: { w:1, children: {
                                  Qxd3: { w:1, children: {
                                    e6: { w:1, children: {
                                      Nbd2: { w:1, note:"Nbd2, then c4 or O-O and Ne5. Target the light squares Black gave up.", children: {} }
                                    } }
                                  } }
                                } }
                              } },
                            c4: { w:1, note:"Also excellent: the Jobava-spirit c4 grabs more central space immediately.", children: {} }
                          } } } } } },
                    Bf5: { w:2, children: {
                      c4: { w:1, note:"Aggressive: challenge Black's setup at once. 4.c4 hits d5 and opens lines.", children: {} },
                      Nc3: { w:1, note:"Jobava London flavour: Nc3 supports e4 and Nb5 ideas hitting the Bd6 square.", children: {} }
                    } }
                  } } } },
              // Benoni-ish after 2...c5
              c5: { w:1, line:"c5", children: {
                d5: { w:1, note:"Close the centre: in Benoni territory you play d5 and later c4/Nc3 with a space advantage.", children: {} },
                e3: { w:1, note:"Alternative: 3.e3 keeps it a true London and just develops normally.",
                  children: {
                    cxd4: { w:1, children: {
                      exd4: { w:1, note:"exd4 and develop Bf4, Nf3, c3. Symmetrical but you're a tempo up.", children: {} }
                    } }
                  } }
              } }
            } }
        } },
        // ---- Black plays 1...d5 (move-order ...d5 before ...Nf6) ----
        d5: { w:3, line:"qgd", children: {
          Nf3: { w:1, note:"2.Nf3 — flexible; Bf4 next move.", children: {
            Nf6: { w:2, children: {
              Bf4: { w:1, note:"3.Bf4 — the London. Identical to lines reached via 1...Nf6.", children: {} }
            } },
            c5: { w:1, children: {
              Bf4: { w:1, note:"Bf4 anyway — you're not afraid of ...cxd4 because exd4 gives good structure.", children: {} }
            } },
            Nc6: { w:1, children: {
              Bf4: { w:1, note:"Bf4 — Black's ...Nc6 is a sideline. Follow with e3/Nbd2/c3/Bd3.", children: {} }
            } }
          } }
        } },
        // ---- Black plays 1...c5 (Benoni intent) ----
        c5: { w:1, line:"c5", children: {
          d5: { w:1, note:"2.d5 — refuse the transposition and play a space-grabbing Benoni.", children: {} },
          Nf3: { w:1, note:"2.Nf3 — more Londonish. After ...cxd4 Nxd4 is fine, or you can play e3 to reach true London structures.", children: {} }
        } },
        // ---- Black plays 1...f5 (Dutch) ----
        f5: { w:1, line:"dutch", children: {
          Bg5: { w:1, note:"The Hopton / Staunton-ish anti-Dutch. Strong practical weapon.", children: {} },
          Nf3: { w:1, note:"Or 2.Nf3 and 3.Bf4 — a London-style setup still works well against the Dutch.", children: {} }
        } },
        // ---- Black plays 1...e6 ----
        e6: { w:1, children: {
          Nf3: { w:1, note:"2.Nf3 keeps options; if ...d5 go 3.Bf4 London.", children: {} }
        } },
        // ---- Black plays 1...g6 ----
        g6: { w:1, line:"kid", children: {
          Nf3: { w:1, note:"2.Nf3 with Bf4 next — the London works against …g6 too.", children: {} }
        } },
        // ---- Minor ----
        Nc6: { w:1, children: {
          Nf3: { w:1, note:"2.Nf3 — ignore ...Nc6 and continue with normal London development.", children: {} }
        } }
      }
    }
  }
};

/* Structured lessons for Learn mode. Each lesson is a list of steps;
 * each step is [SAN, speaker, text]. speaker is 'w' (your move), 'b' (reply), or 'n' (note).
 * The runner plays the moves on the board in sequence. */
window.LONDON_LESSONS = [
  {
    id:"basic-setup", title:"The London setup (vs ...d5)",
    intro:"Learn the engine-approved move order: d4, Nf3, Bf4, e3, c3, Nbd2, Bd3, h3, O-O.",
    steps:[
      ["d4", "w", "The London begins with 1.d4. You claim the centre and prepare to put the dark-squared bishop on f4."],
      ["d5", "b", "Black plays ...d5, the most common reply."],
      ["Nf3","w", "2.Nf3 — flexible. Don't rush Bf4 before Nf3; it keeps your options open."],
      ["Nf6","b", "Black mirrors."],
      ["Bf4","w", "3.Bf4 — the London bishop. Out before e3 locks it in!"],
      ["e6", "b", "A common reply: Black plans ...Bd6 to trade your key bishop."],
      ["e3", "w", "4.e3 — supports d4 and frees Bd3."],
      ["Bd6","b", "Black challenges the bishop."],
      ["Bg3","w", "5.Bg3 — step back. The bishop is too valuable to trade here."],
      ["O-O","b", "Black castles."],
      ["Nbd2","w","6.Nbd2 — support e4 and keep c3 free for the pawn."],
      ["c5", "b", "Now Black strikes in the centre."],
      ["c3", "w", "7.c3 — complete the pawn triangle c3–d4–e3."],
      ["Nc6","b", "Black develops."],
      ["Bd3","w", "8.Bd3 — the other bishop goes to its best diagonal."],
      ["b6", "b", "Black prepares ...Bb7."],
      ["O-O","w", "9.O-O — king to safety. You've completed the London setup!"],
      [null,"n","Memorise this skeleton: d4, Nf3, Bf4, e3, c3, Nbd2, Bd3, h3, O-O. The move order varies but the *pieces* always land on these squares."]
    ]
  },
  {
    id:"vs-kid", title:"London vs ...g6 (KID structure)",
    intro:"Against ...g6 setups the bishop goes to e2, not d3, and you play h3 early.",
    steps:[
      ["d4","w","1.d4."],
      ["Nf6","b","..."],
      ["Nf3","w","2.Nf3."],
      ["g6","b","A KID/Grünfeld setup."],
      ["Bf4","w","3.Bf4 — still the London bishop."],
      ["Bg7","b","Black fianchettoes."],
      ["e3","w","4.e3."],
      ["O-O","b","Black castles quickly."],
      ["h3","w","5.h3 — vital! Without this, ...Nh5 hits your Bf4."],
      ["d6","b","Black prepares ...Nbd7 and ...e5 or ...c5."],
      ["Be2","w","6.Be2 — NOT Bd3 here. On e2 the bishop avoids ...Nh5-f4 ideas and supports Nf3."],
      ["Nbd7","b","Black develops."],
      ["O-O","w","7.O-O — plan Ne5 next, or c3 and a3/b4 on the queenside."],
      [null,"n","Key difference vs ...d5 lines: against ...g6, use Be2 and play h3 *before* castling."]
    ]
  },
  {
    id:"vs-bf5", title:"Punishing ...Bf5 with Qb3",
    intro:"The tactical idea every Londoner must know: Qb3 hits b7 and d5 at once.",
    steps:[
      ["d4","w","1.d4."],
      ["d5","b","..."],
      ["Nf3","w","2.Nf3."],
      ["Nf6","b","..."],
      ["Bf4","w","3.Bf4."],
      ["Bf5","b","Black mirrors with ...Bf5."],
      ["e3","w","4.e3 — now the Bf4 is defended by e3 pawn."],
      ["e6","b","Black prepares ...Bd6."],
      ["Nc3","w","5.Nc3 — Jobava-style. Prepares Qb3 hitting the weak b7 square."],
      ["Bd6","b","Black tries to trade."],
      ["Bxd6","w","6.Bxd6 cxd6 leaves Black with a doubled d-pawn and a dark-square hole."],
      [null,"n","Remember: once Black plays ...Bf5, the b7 pawn is loose. Qb3 and Nb5 are thematic."]
    ]
  },
  {
    id:"ne5-attack", title:"The Ne5 kingside attack",
    intro:"The classic London attacking plan: Ne5, f4 or Qf3, and a mating attack.",
    steps:[
      ["d4","w","Standard London setup first."],
      ["d5","b",""],
      ["Nf3","w",""],
      ["Nf6","b",""],
      ["Bf4","w",""],
      ["e6","b",""],
      ["e3","w",""],
      ["Be7","b","Black plays calmly."],
      ["Bd3","w","Bd3 — now the attack begins."],
      ["O-O","b",""],
      ["Nbd2","w",""],
      ["c5","b",""],
      ["c3","w",""],
      ["Nc6","b",""],
      ["Ne5","w","The key move! The knight on e5 supports f4-f5 and Qf3-h3 ideas. If Black trades with ...Nxe5, recapture with the d-pawn (dxe5) to open lines toward the king."],
      [null,"n","The Ne5 + Qf3/Qh5 + Rf3-h3 manoeuvre is the London's main attacking weapon."]
    ]
  },
  {
    id:"carlsbad", title:"Exchange structure (cxd4 exd4)",
    intro:"When Black trades on d4, recapture with the e-pawn for a Carlsbad-like structure.",
    steps:[
      ["d4","w",""],
      ["d5","b",""],
      ["Nf3","w",""],
      ["Nf6","b",""],
      ["Bf4","w",""],
      ["c5","b","Black strikes."],
      ["e3","w","Keep calm."],
      ["Nc6","b",""],
      ["c3","w","Triangle first."],
      ["cxd4","b","Black exchanges."],
      ["exd4","w","exd4! — NOT cxd4. This gives you the classic Carlsbad structure with a half-open e-file and kingside majority."],
      [null,"n","Your plan in this structure: Bd3, Nbd2, O-O, Ne5, and Qf3-h3. Don't play the minority attack — that's Black's plan; you play for a kingside attack."]
    ]
  }
];

/* Theory reference shown in the Theory tab. */
window.LONDON_THEORY = `
<h3>Why play the London?</h3>
<ul>
<li>One setup, many move orders. Easy to learn, hard to crack.</li>
<li>Clear strategic plans at every phase — no memorising 20-move theory.</li>
<li>Universal: works vs …d5, …Nf6, …g6, …c5, …Bf5, …f5.</li>
</ul>
<h3>The skeleton</h3>
<p>Pieces always land on these squares (order varies):
<code>d4, e3, c3</code> pawns · <code>Nf3, Nbd2</code> knights · <code>Bf4</code> dark bishop · <code>Bd3</code> or <code>Be2</code> light bishop · <code>h3</code> · <code>O-O</code>.</p>
<h3>Bd3 vs Be2 — choosing the right square</h3>
<ul>
<li>Vs <b>…d5</b> setups (Bf5, e6, c5, c6): play <b>Bd3</b> — eyes h7.</li>
<li>Vs <b>…g6</b> setups (KID, Grünfeld): play <b>Be2</b> — Bd3 runs into ...Nh5 threats.</li>
</ul>
<h3>Don't forget h3</h3>
<p>Played early (moves 4–6) to prevent …Nh5 hitting Bf4 and to give the Bf4 a retreat square on h2. Without h3, the whole system falls apart.</p>
<h3>Three main plans</h3>
<ol>
<li><b>Kingside attack</b> — Ne5, f4 or Qf3-h3, Rf1-f3-h3.</li>
<li><b>Queenside pressure</b> — Qb3 hitting b7/d5, Nb5 when …Bf5 is played.</li>
<li><b>Central break</b> — c4 once Black commits, especially vs …g6.</li>
</ol>
<h3>Pawn structures you'll see</h3>
<ul>
<li><b>Triangle</b> (d4+e3+c3 vs d5+e6+c6) — manoeuvring; Ne5 is the key.</li>
<li><b>Carlsbad</b> (after …cxd4 exd4) — play for a kingside attack, NOT minority attack.</li>
<li><b>Benoni</b> (after …c5 d5) — space advantage, play on the queenside.</li>
</ul>
<h3>Thematic tactics</h3>
<ul>
<li><b>Qb3 double attack</b> on b7 and d5 after …Bf5.</li>
<li><b>Bxh7+</b> sac with Ng5+ and Qh5 when Black castles short and you have Bd3, Ne5, Qc2 lined up.</li>
<li><b>Ne5 xc6</b> shattering Black's queenside pawns when the d-file opens.</li>
</ul>
<h3>Top traps to avoid</h3>
<ul>
<li>Don't play <b>Bf4 before Nf3</b> — …c5 hits d4 and you lack Nf3-support.</li>
<li>Don't skip <b>h3</b> — …Nh5 traps your bishop.</li>
<li>Don't take on <b>c5</b> — it releases tension in Black's favour.</li>
<li>Don't play <b>Bd3 vs …g6</b> — …Nh5 wins the bishop pair.</li>
</ul>
`;

/* Build FEN-indexed lookup from the tree above.
 * Uses chess.js. Each FEN (position + side to move only) maps to a list of
 * next-move entries: {san, weight, note, plan, line}.
 */
window.buildBook = function(){
  const out = new Map();
  const walk = (node, game) => {
    const key = game.fen().split(' ').slice(0,4).join(' ');
    if (!out.has(key)) out.set(key, []);
    const bucket = out.get(key);
    for (const san of Object.keys(node.children || {})){
      const child = node.children[san];
      const mv = game.move(san);
      if (!mv) { console.warn("book: illegal", san, game.fen()); continue; }
      bucket.push({
        san, weight: child.w || 1,
        note: child.note || "",
        plan: child.plan || "",
        line: child.line || null
      });
      walk(child, game);
      game.undo();
    }
  };
  const g = new Chess();
  walk(window.LONDON_TREE, g);
  return out;
};
