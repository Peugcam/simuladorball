import { useState } from "react";
import { toPng } from "html-to-image";
import "./ShareBar.css";

export default function ShareBar({ getLink, targetRef }) {
  const [msg, setMsg] = useState("");

  const copiarLink = async () => {
    await navigator.clipboard.writeText(getLink());
    setMsg("Link copiado!");
    setTimeout(() => setMsg(""), 2000);
  };

  const baixarImagem = async () => {
    if (!targetRef.current) return;
    const dataUrl = await toPng(targetRef.current, { backgroundColor: "#0f1115" });
    const link = document.createElement("a");
    link.download = "simula-campeao.png";
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="sharebar">
      <button type="button" onClick={copiarLink}>🔗 Copiar link</button>
      <button type="button" onClick={baixarImagem}>📷 Baixar imagem</button>
      {msg && <span className="sharebar__msg">{msg}</span>}
    </div>
  );
}
