import { useState, useMemo, useRef, useEffect } from "react";
import { GRUPOS, LETRAS, TIMES } from "./data/mundial";
import { montarConfrontos, FASES } from "./lib/copa";
import { montarBracket, sanearWinners } from "./lib/montarBracket";
import { encodePalpite, decodePalpite } from "./lib/palpite";
import Flag from "./components/Flag";
import GruposStep from "./components/GruposStep";
import TerceirosStep from "./components/TerceirosStep";
import BracketStep from "./components/BracketStep";
import ShareBar from "./components/ShareBar";

const gruposPadrao = () =>
  Object.fromEntries(LETRAS.map((g) => [g, GRUPOS[g].map((_, i) => `${g}${i}`)]));

const PASSOS = ["Fase de Grupos", "Melhores 3ºs", "Mata-mata"];

function estadoInicial() {
  const inicial = decodePalpite(new URLSearchParams(window.location.search).get("p"));
  return {
    grupos: inicial?.grupos ?? gruposPadrao(),
    terceiros: inicial?.terceiros ?? [...LETRAS],
    winners: inicial?.winners ?? {},
  };
}

export default function App() {
  const init = useMemo(estadoInicial, []);
  const [grupos, setGrupos] = useState(init.grupos);
  const [terceiros, setTerceiros] = useState(init.terceiros);
  const [winners, setWinners] = useState(init.winners);
  const [step, setStep] = useState(0);
  const bracketRef = useRef(null);

  const comp = useMemo(
    () => ({ fases: FASES, times: TIMES, confrontos_iniciais: montarConfrontos(grupos, terceiros.slice(0, 8)) }),
    [grupos, terceiros]
  );
  const winnersValidos = useMemo(() => sanearWinners(comp, winners), [comp, winners]);
  const bracket = useMemo(() => montarBracket(comp, winnersValidos), [comp, winnersValidos]);

  // mantém a URL sincronizada com o palpite (para compartilhar)
  useEffect(() => {
    const code = encodePalpite({ grupos, terceiros, winners: winnersValidos });
    window.history.replaceState(null, "", `${window.location.pathname}?p=${code}`);
  }, [grupos, terceiros, winnersValidos]);

  const moverGrupo = (g, i, d) => {
    setGrupos((prev) => {
      const ordem = [...prev[g]];
      [ordem[i], ordem[i + d]] = [ordem[i + d], ordem[i]];
      return { ...prev, [g]: ordem };
    });
  };
  const moverTerceiro = (i, d) => {
    setTerceiros((prev) => {
      const ordem = [...prev];
      [ordem[i], ordem[i + d]] = [ordem[i + d], ordem[i]];
      return ordem;
    });
  };
  const onPick = (matchId, teamId) =>
    setWinners((w) => sanearWinners(comp, { ...w, [matchId]: teamId }));

  const irPara = (n) => {
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getLink = () =>
    `${window.location.origin}${window.location.pathname}?p=${encodePalpite({ grupos, terceiros, winners: winnersValidos })}`;

  return (
    <div className="wrap">
      <header>
        <div className="kicker">EUA · México · Canadá — 11 jun a 19 jul 2026</div>
        <h1>Bolão da Copa</h1>
        <p className="sub">
          48 seleções, 12 grupos, um campeão. Ordene cada grupo do jeito que você acha que vai
          terminar, escolha os melhores terceiros e crave o seu campeão.
        </p>
        <div className="flagline">
          {["br", "ar", "fr", "es", "de", "pt", "nl", "gb-eng"].map((cc) => (
            <Flag key={cc} cc={cc} className="flagline__f" />
          ))}
        </div>
      </header>

      <div className="steps">
        {PASSOS.map((label, i) => (
          <button
            key={i}
            className={"stepbtn" + (i === step ? " active" : "") + (i < step ? " done" : "")}
            onClick={() => irPara(i)}
          >
            <span className="n">{i + 1}</span>
            {label}
          </button>
        ))}
      </div>

      {step === 0 && (
        <section className="screen">
          <h2 className="secttitle">Fase de grupos</h2>
          <p className="secthint">
            Use as setas <b>▲▼</b> para reordenar cada grupo.{" "}
            <b style={{ color: "var(--green)" }}>1º e 2º</b> avançam direto. O <b>3º</b> entra na
            disputa pelas 8 vagas extras. O 4º está fora.
          </p>
          <div className="qualbar">
            <span><i style={{ background: "var(--green)" }} />Classificado direto</span>
            <span><i style={{ background: "var(--amber)" }} />Disputa de 3º</span>
            <span><i style={{ background: "var(--red)" }} />Eliminado</span>
          </div>
          <GruposStep grupos={grupos} onMove={moverGrupo} />
          <div className="navrow">
            <span />
            <button className="btn primary" onClick={() => irPara(1)}>Próximo: melhores 3ºs →</button>
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="screen">
          <h2 className="secttitle">Os 8 melhores terceiros</h2>
          <p className="secthint">
            São 12 terceiros colocados, mas só <b>8 avançam</b>. Ordene do melhor para o pior — os
            8 de cima se classificam.
          </p>
          <TerceirosStep terceiros={terceiros} grupos={grupos} onMove={moverTerceiro} />
          <div className="navrow">
            <button className="btn ghost" onClick={() => irPara(0)}>← Voltar aos grupos</button>
            <button className="btn primary" onClick={() => irPara(2)}>Montar o mata-mata →</button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="screen">
          <h2 className="secttitle">Mata-mata</h2>
          <p className="secthint">
            Clique na seleção que você acha que vence cada confronto. Avance rodada a rodada até
            cravar o <b>campeão do mundo</b>.{" "}
            <span style={{ opacity: 0.7 }}>(chaveamento oficial da Copa 2026)</span>
          </p>
          <div ref={bracketRef}>
            <BracketStep bracket={bracket} onPick={onPick} />
          </div>
          <ShareBar getLink={getLink} targetRef={bracketRef} />
          <div className="navrow">
            <button className="btn ghost" onClick={() => irPara(1)}>← Voltar aos 3ºs</button>
            <button className="btn ghost" onClick={() => setWinners({})}>↺ Refazer mata-mata</button>
          </div>
        </section>
      )}

      <footer>
        Grupos e chaveamento oficiais do sorteio de 5 de dezembro de 2025 (Washington, D.C.).<br />
        Bolão para diversão — seus palpites ficam só nesta tela e no link que você compartilhar.
      </footer>
    </div>
  );
}
