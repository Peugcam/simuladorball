import { useEffect, useRef } from "react";
import { FASES } from "../lib/copa";

const CORES = ["#f7c948", "#22c98a", "#ff5a5f", "#ffb02e", "#ffffff", "#1bbf7c"];

function Slot({ team, vencedor, onPick }) {
  if (!team) {
    return (
      <div className="slot empty">
        <span className="flag">·</span>
        <span className="tname" style={{ color: "var(--mut)" }}>a definir</span>
      </div>
    );
  }
  return (
    <div className={"slot" + (vencedor ? " win" : "")} onClick={() => onPick(team.id)}>
      <span className="flag">{team.flag}</span>
      <span className="tname">{team.nome}</span>
    </div>
  );
}

export default function BracketStep({ bracket, onPick }) {
  const final = bracket.rounds[bracket.rounds.length - 1][0];
  const campeao = [final.a, final.b].find((t) => t?.id === final.winner);
  const confettiRef = useRef(null);

  // dispara confete quando um campeão é cravado
  useEffect(() => {
    if (!campeao || !confettiRef.current) return;
    const c = confettiRef.current;
    for (let i = 0; i < 120; i++) {
      const d = document.createElement("div");
      d.className = "conf";
      d.style.left = Math.random() * 100 + "vw";
      d.style.top = -10 - Math.random() * 20 + "vh";
      d.style.background = CORES[i % CORES.length];
      d.style.animationDuration = 2.4 + Math.random() * 2 + "s";
      d.style.animationDelay = Math.random() * 0.5 + "s";
      d.style.transform = `rotate(${Math.random() * 360}deg)`;
      c.appendChild(d);
      setTimeout(() => d.remove(), 5200);
    }
  }, [campeao?.id]);

  return (
    <>
      <div className="confetti" ref={confettiRef} />
      <div className="bracket">
        {bracket.rounds.map((matches, r) => (
          <div className="round" key={r}>
            <div className="rtitle">{FASES[r]}</div>
            {matches.map((m) => (
              <div className="match" key={m.id}>
                <Slot team={m.a} vencedor={m.winner === m.a?.id} onPick={(id) => onPick(m.id, id)} />
                <Slot team={m.b} vencedor={m.winner === m.b?.id} onPick={(id) => onPick(m.id, id)} />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="champwrap">
        {campeao && (
          <div className="champcard">
            <span className="flag">{campeao.flag}</span>
            <span className="cl">★ Campeão Mundial ★</span>
            <span className="cn">{campeao.nome}</span>
          </div>
        )}
      </div>
    </>
  );
}
