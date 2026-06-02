import { useState } from "react";
import { toPng } from "html-to-image";

export default function ShareBar({ getLink, targetRef }) {
  const [msg, setMsg] = useState("");

  const copiarLink = async () => {
    await navigator.clipboard.writeText(getLink());
    setMsg("Link copiado!");
    setTimeout(() => setMsg(""), 2000);
  };

  const baixarImagem = async () => {
    if (!targetRef.current) return;
    const dataUrl = await toPng(targetRef.current, { backgroundColor: "#0a0e1a" });
    const link = document.createElement("a");
    link.download = "bolao-copa-2026.png";
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="sharebar">
      <button type="button" className="btn ghost" onClick={copiarLink}>🔗 Copiar link</button>
      <button type="button" className="btn ghost" onClick={baixarImagem}>📷 Baixar imagem</button>
      {msg && <span className="sharebar__msg">{msg}</span>}
    </div>
  );
}
