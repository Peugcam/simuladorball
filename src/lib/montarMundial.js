// Monta os 16 confrontos do Round of 32 a partir dos grupos ordenados
// e dos 8 terceiros escolhidos. Determinístico (aproximação para simulação).
const GRUPOS = "ABCDEFGHIJKL".split("");

export function montarR32(grupos, terceiros) {
  const primeiros = GRUPOS.map((g) => grupos[g][0]);
  const segundos = GRUPOS.map((g) => grupos[g][1]);

  const confrontos = [];
  for (let i = 0; i < 12; i++) {
    confrontos.push([primeiros[i], segundos[(i + 1) % 12]]);
  }
  for (let i = 0; i < 8; i += 2) {
    confrontos.push([terceiros[i], terceiros[i + 1]]);
  }
  return confrontos; // 16 confrontos
}

// Constrói um "comp" mata-mata sintético para reaproveitar montarBracket.
export function montarCompMundial(mundial, grupos, terceiros) {
  const confrontos_iniciais = montarR32(grupos, terceiros);
  const times = {};
  Object.values(mundial.grupos).forEach((sels) => {
    sels.forEach(([id, nome, cor]) => {
      times[id] = { nome, sigla: id.toUpperCase(), cor };
    });
  });
  return {
    fases: mundial.fases,
    times,
    confrontos_iniciais,
  };
}
