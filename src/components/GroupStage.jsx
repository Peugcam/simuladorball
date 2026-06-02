import { useState } from "react";
import "./GroupStage.css";

const LETRAS = "ABCDEFGHIJKL".split("");

// grupos: { A: [id1,id2,id3,id4] } na ordem de classificação escolhida.
// Default = ordem do JSON (potes). Clicar num time o promove uma posição.
export default function GroupStage({ mundial, grupos, terceiros, onGruposChange, onTerceirosChange, onConfirm }) {
  const ordemDe = (g) => grupos[g] ?? mundial.grupos[g].map(([id]) => id);

  const promover = (g, id) => {
    const ordem = [...ordemDe(g)];
    const i = ordem.indexOf(id);
    if (i > 0) { [ordem[i - 1], ordem[i]] = [ordem[i], ordem[i - 1]]; }
    onGruposChange({ ...grupos, [g]: ordem });
  };

  const nomeDe = (id) => {
    for (const sels of Object.values(mundial.grupos)) {
      const m = sels.find(([sid]) => sid === id);
      if (m) return m[1];
    }
    return id;
  };

  const toggleTerceiro = (id) => {
    if (terceiros.includes(id)) {
      onTerceirosChange(terceiros.filter((t) => t !== id));
    } else if (terceiros.length < 8) {
      onTerceirosChange([...terceiros, id]);
    }
  };

  const todosOrdenados = LETRAS.every((g) => grupos[g]);
  const pronto = todosOrdenados && terceiros.length === 8;

  return (
    <div className="groupstage">
      <p className="groupstage__hint">
        Clique nos times para subir na classificação do grupo (1º no topo).
        Depois marque os <strong>8 melhores terceiros</strong> que avançam.
      </p>
      <div className="groupstage__grid">
        {LETRAS.map((g) => {
          const ordem = ordemDe(g);
          const terceiroId = ordem[2];
          return (
            <div className="grupo" data-testid={`grupo-${g}`} key={g}>
              <h3>Grupo {g}</h3>
              <ol>
                {ordem.map((id, idx) => (
                  <li key={id}>
                    <button type="button" onClick={() => promover(g, id)}>
                      {idx + 1}. {nomeDe(id)}
                    </button>
                    {idx === 2 && (
                      <label className="grupo__terceiro">
                        <input type="checkbox"
                          checked={terceiros.includes(terceiroId)}
                          onChange={() => toggleTerceiro(terceiroId)} />
                        avança?
                      </label>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          );
        })}
      </div>
      <div className="groupstage__footer">
        <span>{terceiros.length}/8 terceiros</span>
        <button type="button" disabled={!pronto} onClick={onConfirm}>
          Montar mata-mata →
        </button>
      </div>
    </div>
  );
}
