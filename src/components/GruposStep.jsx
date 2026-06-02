import { LETRAS, TIMES } from "../data/mundial";
import Flag from "./Flag";

const POS = ["1º", "2º", "3º", "4º"];
const tagFor = (i) => (i < 2 ? "Avança" : i === 2 ? "Disputa 3º" : "Fora");
const clsFor = (i) => (i === 0 ? "q1" : i === 1 ? "q2" : i === 2 ? "q3" : "out");

// grupos: { A: ["A0","A1","A2","A3"] } na ordem de classificação escolhida.
export default function GruposStep({ grupos, onMove }) {
  return (
    <div className="grid">
      {LETRAS.map((g) => (
        <div className="group" key={g}>
          <div className="ghead">
            <div className="gbadge">{g}</div>
            <h3>Grupo {g}</h3>
          </div>
          {grupos[g].map((id, i) => {
            const t = TIMES[id];
            return (
              <div className={`team ${clsFor(i)}`} key={id}>
                <span className="pos">{POS[i]}</span>
                <Flag cc={t.cc} emoji={t.flag} />
                <span className="tname">{t.nome}</span>
                <span className="tag">{tagFor(i)}</span>
                <span className="arrows">
                  <button disabled={i === 0} onClick={() => onMove(g, i, -1)} aria-label="subir">▲</button>
                  <button disabled={i === 3} onClick={() => onMove(g, i, 1)} aria-label="descer">▼</button>
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
