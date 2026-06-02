// Grupos oficiais da Copa do Mundo 2026 (sorteio de 5/dez/2025, Washington D.C.).
// Ordem dentro do grupo = potes do sorteio; o usuário reordena para simular.
// Cada seleção: [nome, emoji (fallback), código ISO p/ bandeira SVG do flag-icons].
export const GRUPOS = {
  A: [["México", "🇲🇽", "mx"], ["África do Sul", "🇿🇦", "za"], ["Coreia do Sul", "🇰🇷", "kr"], ["Rep. Tcheca", "🇨🇿", "cz"]],
  B: [["Canadá", "🇨🇦", "ca"], ["Bósnia", "🇧🇦", "ba"], ["Catar", "🇶🇦", "qa"], ["Suíça", "🇨🇭", "ch"]],
  C: [["Brasil", "🇧🇷", "br"], ["Marrocos", "🇲🇦", "ma"], ["Haiti", "🇭🇹", "ht"], ["Escócia", "🏴󠁧󠁢󠁳󠁣󠁴󠁿", "gb-sct"]],
  D: [["Estados Unidos", "🇺🇸", "us"], ["Paraguai", "🇵🇾", "py"], ["Austrália", "🇦🇺", "au"], ["Turquia", "🇹🇷", "tr"]],
  E: [["Alemanha", "🇩🇪", "de"], ["Curaçao", "🇨🇼", "cw"], ["Costa do Marfim", "🇨🇮", "ci"], ["Equador", "🇪🇨", "ec"]],
  F: [["Holanda", "🇳🇱", "nl"], ["Japão", "🇯🇵", "jp"], ["Suécia", "🇸🇪", "se"], ["Tunísia", "🇹🇳", "tn"]],
  G: [["Bélgica", "🇧🇪", "be"], ["Egito", "🇪🇬", "eg"], ["Irã", "🇮🇷", "ir"], ["Nova Zelândia", "🇳🇿", "nz"]],
  H: [["Espanha", "🇪🇸", "es"], ["Cabo Verde", "🇨🇻", "cv"], ["Arábia Saudita", "🇸🇦", "sa"], ["Uruguai", "🇺🇾", "uy"]],
  I: [["França", "🇫🇷", "fr"], ["Senegal", "🇸🇳", "sn"], ["Iraque", "🇮🇶", "iq"], ["Noruega", "🇳🇴", "no"]],
  J: [["Argentina", "🇦🇷", "ar"], ["Argélia", "🇩🇿", "dz"], ["Áustria", "🇦🇹", "at"], ["Jordânia", "🇯🇴", "jo"]],
  K: [["Portugal", "🇵🇹", "pt"], ["RD Congo", "🇨🇩", "cd"], ["Uzbequistão", "🇺🇿", "uz"], ["Colômbia", "🇨🇴", "co"]],
  L: [["Inglaterra", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "gb-eng"], ["Croácia", "🇭🇷", "hr"], ["Gana", "🇬🇭", "gh"], ["Panamá", "🇵🇦", "pa"]],
};

export const LETRAS = Object.keys(GRUPOS);

// Mapa de todas as 48 seleções por id estável "<grupo><índice no pote>" (ex.: "A0").
export const TIMES = {};
for (const g of LETRAS) {
  GRUPOS[g].forEach(([nome, flag, cc], i) => {
    TIMES[`${g}${i}`] = { id: `${g}${i}`, nome, flag, cc, grupo: g };
  });
}
