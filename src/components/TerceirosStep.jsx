import { TIMES } from "../data/mundial";
import Flag from "./Flag";

// terceiros: array de 12 letras de grupo, na ordem de força escolhida (os 8 primeiros avançam).
// grupos: usado para descobrir quem é o 3º colocado atual de cada grupo (grupos[g][2]).
export default function TerceirosStep({ terceiros, grupos, onMove }) {
  return (
    <div className="thirdslist">
      {terceiros.map((g, i) => {
        const t = TIMES[grupos[g][2]];
        return (
          <div key={g}>
            {i === 8 && <div className="cut">linha de corte — abaixo está eliminado</div>}
            <div className={`third ${i < 8 ? "in8" : "outx"}`}>
              <span className="pos">{i + 1}</span>
              <span className="grpref">3º {g}</span>
              <Flag cc={t.cc} emoji={t.flag} />
              <span className="tname">{t.nome}</span>
              <span
                className="tag"
                style={{
                  background: i < 8 ? "rgba(34,201,138,.16)" : "rgba(255,90,95,.14)",
                  color: i < 8 ? "var(--green)" : "var(--red)",
                }}
              >
                {i < 8 ? "Classificado" : "Fora"}
              </span>
              <span className="arrows">
                <button disabled={i === 0} onClick={() => onMove(i, -1)} aria-label="subir">▲</button>
                <button disabled={i === 11} onClick={() => onMove(i, 1)} aria-label="descer">▼</button>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
