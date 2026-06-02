// Grupos oficiais da Copa do Mundo 2026 (sorteio de 5/dez/2025, Washington D.C.).
// Ordem dentro do grupo = potes do sorteio; o usuário reordena para simular.
export const GRUPOS = {
  A: [["México", "🇲🇽"], ["África do Sul", "🇿🇦"], ["Coreia do Sul", "🇰🇷"], ["Rep. Tcheca", "🇨🇿"]],
  B: [["Canadá", "🇨🇦"], ["Bósnia", "🇧🇦"], ["Catar", "🇶🇦"], ["Suíça", "🇨🇭"]],
  C: [["Brasil", "🇧🇷"], ["Marrocos", "🇲🇦"], ["Haiti", "🇭🇹"], ["Escócia", "🏴󠁧󠁢󠁳󠁣󠁴󠁿"]],
  D: [["Estados Unidos", "🇺🇸"], ["Paraguai", "🇵🇾"], ["Austrália", "🇦🇺"], ["Turquia", "🇹🇷"]],
  E: [["Alemanha", "🇩🇪"], ["Curaçao", "🇨🇼"], ["Costa do Marfim", "🇨🇮"], ["Equador", "🇪🇨"]],
  F: [["Holanda", "🇳🇱"], ["Japão", "🇯🇵"], ["Suécia", "🇸🇪"], ["Tunísia", "🇹🇳"]],
  G: [["Bélgica", "🇧🇪"], ["Egito", "🇪🇬"], ["Irã", "🇮🇷"], ["Nova Zelândia", "🇳🇿"]],
  H: [["Espanha", "🇪🇸"], ["Cabo Verde", "🇨🇻"], ["Arábia Saudita", "🇸🇦"], ["Uruguai", "🇺🇾"]],
  I: [["França", "🇫🇷"], ["Senegal", "🇸🇳"], ["Iraque", "🇮🇶"], ["Noruega", "🇳🇴"]],
  J: [["Argentina", "🇦🇷"], ["Argélia", "🇩🇿"], ["Áustria", "🇦🇹"], ["Jordânia", "🇯🇴"]],
  K: [["Portugal", "🇵🇹"], ["RD Congo", "🇨🇩"], ["Uzbequistão", "🇺🇿"], ["Colômbia", "🇨🇴"]],
  L: [["Inglaterra", "🏴󠁧󠁢󠁥󠁮󠁧󠁿"], ["Croácia", "🇭🇷"], ["Gana", "🇬🇭"], ["Panamá", "🇵🇦"]],
};

export const LETRAS = Object.keys(GRUPOS);

// Mapa de todas as 48 seleções por id estável "<grupo><índice no pote>" (ex.: "A0").
export const TIMES = {};
for (const g of LETRAS) {
  GRUPOS[g].forEach(([nome, flag], i) => {
    TIMES[`${g}${i}`] = { id: `${g}${i}`, nome, flag, grupo: g };
  });
}
