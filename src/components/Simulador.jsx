import { useRef, useState, useEffect } from "react";
import { COMPETICOES } from "../data";
import { montarBracket, sanearWinners } from "../lib/montarBracket";
import { montarCompMundial } from "../lib/montarMundial";
import { encodePalpite } from "../lib/palpite";
import Bracket from "./Bracket";
import GroupStage from "./GroupStage";
import ShareBar from "./ShareBar";
import "./Simulador.css";

export default function Simulador({ compId, inicial, onBack }) {
  const comp = COMPETICOES[compId];
  const ehMundial = comp.tipo === "grupos";

  const [winners, setWinners] = useState(inicial?.winners ?? {});
  const [grupos, setGrupos] = useState(inicial?.grupos ?? {});
  const [terceiros, setTerceiros] = useState(inicial?.terceiros ?? []);
  const [fase, setFase] = useState(
    ehMundial && !(inicial?.terceiros?.length === 8) ? "grupos" : "bracket"
  );
  const bracketRef = useRef(null);

  const compBracket = ehMundial ? montarCompMundial(comp, grupos, terceiros) : comp;

  const estado = ehMundial
    ? { comp: compId, grupos, terceiros, winners }
    : { comp: compId, winners };

  // mantém a URL sincronizada com o palpite
  useEffect(() => {
    const code = encodePalpite(estado);
    const url = `${window.location.pathname}?c=${compId}&p=${code}`;
    window.history.replaceState(null, "", url);
  }, [winners, grupos, terceiros]); // eslint-disable-line

  const onPick = (matchId, teamId) => {
    setWinners((w) => sanearWinners(compBracket, { ...w, [matchId]: teamId }));
  };

  const getLink = () =>
    `${window.location.origin}${window.location.pathname}?c=${compId}&p=${encodePalpite(estado)}`;

  if (ehMundial && fase === "grupos") {
    return (
      <div className="simulador">
        <button className="simulador__back" onClick={onBack}>← Trocar competição</button>
        <h2 style={{ "--cor": comp.cor }}>{comp.nome}</h2>
        <GroupStage
          mundial={comp}
          grupos={grupos}
          terceiros={terceiros}
          onGruposChange={setGrupos}
          onTerceirosChange={setTerceiros}
          onConfirm={() => setFase("bracket")}
        />
      </div>
    );
  }

  const bracket = montarBracket(compBracket, winners);

  return (
    <div className="simulador">
      <button className="simulador__back" onClick={onBack}>← Trocar competição</button>
      <h2 style={{ "--cor": comp.cor }}>{comp.nome}</h2>
      {ehMundial && (
        <button className="simulador__edit" onClick={() => setFase("grupos")}>
          ← Editar grupos
        </button>
      )}
      <div ref={bracketRef}>
        <Bracket bracket={bracket} fases={compBracket.fases} onPick={onPick} />
      </div>
      <ShareBar getLink={getLink} targetRef={bracketRef} />
      <footer className="simulador__disclaimer">
        Site não-oficial, feito por fãs. Sem vínculo com FIFA, CONMEBOL ou CBF.
        Nomes dos clubes/seleções pertencem às respectivas entidades.
      </footer>
    </div>
  );
}
