import { useState } from "react";
import { toPng, toBlob } from "html-to-image";

const TEXTO = "Montei meu palpite do Bolão da Copa 2026 ⚽🏆 Faça o seu:";
const FUNDO = "#0a0e1a";

export default function ShareBar({ getLink, targetRef }) {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const flash = (t) => {
    setMsg(t);
    setTimeout(() => setMsg(""), 2200);
  };

  // Captura o chaveamento INTEIRO. No celular o bracket tem scroll horizontal,
  // então expandimos ele à largura total (classe .capturando) antes de gerar a
  // imagem — senão a foto compartilhada sai cortada e perde o caminho do campeão.
  const capturar = async (render) => {
    const wrap = targetRef.current;
    if (!wrap) return null;
    wrap.classList.add("capturando");
    await new Promise(requestAnimationFrame); // garante o reflow antes de medir
    try {
      return await render(wrap, {
        backgroundColor: FUNDO,
        pixelRatio: 2,
        width: wrap.scrollWidth,
        height: wrap.scrollHeight,
      });
    } finally {
      wrap.classList.remove("capturando");
    }
  };

  // Botão principal: usa o menu de compartilhamento nativo do celular
  // (WhatsApp, Instagram, Stories...). Anexa a imagem do chaveamento quando
  // o aparelho permite; senão compartilha o link; sem suporte, copia o link.
  const compartilhar = async () => {
    const url = getLink();
    setBusy(true);
    try {
      const blob = await capturar(toBlob);
      const file = blob && new File([blob], "bolao-copa-2026.png", { type: "image/png" });

      if (file && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: "Bolão da Copa 2026", text: TEXTO, url, files: [file] });
      } else if (navigator.share) {
        await navigator.share({ title: "Bolão da Copa 2026", text: `${TEXTO} ${url}`, url });
      } else {
        await navigator.clipboard.writeText(url);
        flash("Link copiado!");
      }
    } catch (err) {
      if (err?.name !== "AbortError") {
        try {
          await navigator.clipboard.writeText(url);
          flash("Link copiado!");
        } catch {
          flash("Não foi possível compartilhar");
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const copiarLink = async () => {
    await navigator.clipboard.writeText(getLink());
    flash("Link copiado!");
  };

  const baixarImagem = async () => {
    const dataUrl = await capturar(toPng);
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.download = "bolao-copa-2026.png";
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="sharebar">
      <button type="button" className="btn primary" onClick={compartilhar} disabled={busy}>
        {busy ? "Gerando…" : "📤 Compartilhar palpite"}
      </button>
      <button type="button" className="btn ghost" onClick={copiarLink}>🔗 Copiar link</button>
      <button type="button" className="btn ghost" onClick={baixarImagem}>📷 Baixar imagem</button>
      {msg && <span className="sharebar__msg">{msg}</span>}
    </div>
  );
}
