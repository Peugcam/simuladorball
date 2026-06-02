import { useState, useEffect } from "react";
import Match from "./Match";
import "./Bracket.css";

// true quando a tela é de celular; alterna o layout em tempo real.
function useIsMobile(query = "(max-width: 720px)") {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e) => setIsMobile(e.matches);
    mql.addEventListener("change", onChange);
    setIsMobile(mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return isMobile;
}

// Para cada round (exceto a final), os matches se dividem em esquerda/direita.
// O conjunto de ids de cada lado é derivado de bracket.side propagando pares.
function ladosPorRound(bracket) {
  // round 0: usa bracket.side. Rounds seguintes: pais dos matches do lado.
  const lados = [];
  let left = new Set(bracket.side.left);
  let right = new Set(bracket.side.right);
  bracket.rounds.forEach((round, ri) => {
    if (ri === bracket.rounds.length - 1) {
      lados.push({ left: [], right: [], center: round });
      return;
    }
    lados.push({
      left: round.filter((m) => left.has(m.id)),
      right: round.filter((m) => right.has(m.id)),
    });
    // próximos pais: um match do round ri+1 pertence ao lado se algum filho pertence.
    const nextLeft = new Set();
    const nextRight = new Set();
    const next = bracket.rounds[ri + 1];
    if (next) {
      next.forEach((m, idx) => {
        const childIds = [round[idx * 2]?.id, round[idx * 2 + 1]?.id];
        if (childIds.some((id) => left.has(id))) nextLeft.add(m.id);
        if (childIds.some((id) => right.has(id))) nextRight.add(m.id);
      });
    }
    left = nextLeft;
    right = nextRight;
  });
  return lados;
}

export default function Bracket({ bracket, fases, onPick }) {
  const isMobile = useIsMobile();
  const lados = ladosPorRound(bracket);
  const nRounds = bracket.rounds.length;
  const final = bracket.rounds[nRounds - 1][0];
  const campeao = [final.a, final.b].find((t) => t?.id === final.winner)?.nome;

  // No celular o bracket espelhado não cabe: empilha fase a fase, de cima para baixo.
  if (isMobile) {
    return (
      <div className="bracket-mobile">
        {bracket.rounds.map((round, ri) => (
          <section className="bracket-mobile__fase" key={ri}>
            <div className="bracket__fase">{fases[ri]}</div>
            <div className="bracket-mobile__matches">
              {round.map((m) => (
                <Match key={m.id} match={m} onPick={onPick} />
              ))}
            </div>
          </section>
        ))}
        {campeao && <div className="bracket__campeao">🏆 {campeao}</div>}
      </div>
    );
  }

  const colunaLado = (lado, ri) =>
    lados[ri][lado].length > 0 && (
      <div className="bracket__col" key={`${lado}-${ri}`}>
        <div className="bracket__fase">{fases[ri]}</div>
        {lados[ri][lado].map((m) => (
          <Match key={m.id} match={m} onPick={onPick} />
        ))}
      </div>
    );

  return (
    <div className="bracket">
      <div className="bracket__side bracket__side--left">
        {bracket.rounds.slice(0, -1).map((_, ri) => colunaLado("left", ri))}
      </div>
      <div className="bracket__center">
        <div className="bracket__fase">{fases[nRounds - 1]}</div>
        <Match match={final} onPick={onPick} />
        {campeao && <div className="bracket__campeao">🏆 {campeao}</div>}
      </div>
      <div className="bracket__side bracket__side--right">
        {bracket.rounds.slice(0, -1).map((_, ri) => colunaLado("right", ri)).reverse()}
      </div>
    </div>
  );
}
