// Serializa o estado do palpite em uma string segura para URL (base64 url-safe).
export function encodePalpite(estado) {
  const json = JSON.stringify(estado);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodePalpite(code) {
  if (!code) return null;
  try {
    const b64 = code.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(escape(atob(b64)));
    return JSON.parse(json);
  } catch {
    return null;
  }
}
