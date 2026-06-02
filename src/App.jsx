import { useState } from "react";
import Home from "./components/Home";
import Simulador from "./components/Simulador";
import { COMPETICOES } from "./data";
import { decodePalpite } from "./lib/palpite";

function lerURL() {
  const params = new URLSearchParams(window.location.search);
  const c = params.get("c");
  if (!c || !COMPETICOES[c]) return { compId: null, inicial: null };
  const inicial = decodePalpite(params.get("p"));
  return { compId: c, inicial };
}

export default function App() {
  const [{ compId, inicial }, setState] = useState(lerURL);

  if (!compId) {
    return <Home onSelect={(id) => setState({ compId: id, inicial: null })} />;
  }
  return (
    <Simulador
      key={compId}
      compId={compId}
      inicial={inicial}
      onBack={() => {
        window.history.replaceState(null, "", window.location.pathname);
        setState({ compId: null, inicial: null });
      }}
    />
  );
}
