// Monta a estrutura de rounds de um bracket mata-mata e propaga vencedores.
// comp.confrontos_iniciais: array de pares [idA, idB] (potência de 2).
// winners: { [matchId]: teamId }
export function montarBracket(comp, winners = {}) {
  const time = (id) => (id ? { id, ...comp.times[id] } : null);
  const rounds = [];
  let counter = 0;

  // round 0: confrontos iniciais
  const round0 = comp.confrontos_iniciais.map(([a, b]) => {
    const id = "m" + counter++;
    return { id, a: time(a), b: time(b), winner: winners[id] ?? null };
  });
  rounds.push(round0);

  // rounds seguintes: vencedor de cada par de matches do round anterior
  let prev = round0;
  while (prev.length > 1) {
    const round = [];
    for (let i = 0; i < prev.length; i += 2) {
      const id = "m" + counter++;
      const a = time(prev[i].winner);
      const b = time(prev[i + 1].winner);
      round.push({ id, a, b, winner: winners[id] ?? null });
    }
    rounds.push(round);
    prev = round;
  }

  const half = round0.length / 2;
  const side = {
    left: round0.slice(0, half).map((m) => m.id),
    right: round0.slice(half).map((m) => m.id),
  };
  return { rounds, side };
}
