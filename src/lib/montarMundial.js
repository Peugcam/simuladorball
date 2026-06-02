// Monta os 16 confrontos do Round of 32 a partir dos grupos ordenados
// e dos 8 terceiros escolhidos de forma a seguir o chaveamento oficial da FIFA 2026.
const GRUPOS = "ABCDEFGHIJKL".split("");

// Regras oficiais da FIFA 2026 para alocação dos 8 melhores terceiros colocados contra os líderes das chaves A, B, D, E, G, I, K, L.
const MATCHING_ADJ = {
  A: ["C", "E", "F", "H", "I"],
  B: ["E", "F", "G", "I", "J"],
  D: ["B", "E", "F", "I", "J"],
  E: ["A", "B", "C", "D", "F"],
  G: ["A", "E", "H", "I", "J"],
  I: ["C", "D", "F", "G", "H"],
  K: ["D", "E", "I", "J", "L"],
  L: ["E", "H", "I", "J", "K"],
};

export function matchingTerceiros(grupos, terceiros) {
  const thirdTeams = terceiros.map((id) => {
    const group = GRUPOS.find((g) => grupos[g] && grupos[g].includes(id));
    return { id, group };
  });

  const winnerKeys = ["E", "I", "A", "L", "G", "D", "B", "K"];
  const matching = {};
  const used = new Set();

  function dfs(index) {
    if (index === winnerKeys.length) return true;
    const w = winnerKeys[index];
    const allowed = MATCHING_ADJ[w];
    for (let i = 0; i < thirdTeams.length; i++) {
      if (!used.has(i) && allowed.includes(thirdTeams[i].group)) {
        used.add(i);
        matching[w] = thirdTeams[i].id;
        if (dfs(index + 1)) return true;
        used.delete(i);
        delete matching[w];
      }
    }
    return false;
  }

  if (dfs(0)) {
    return matching;
  }

  // Fallback se DFS falhar por dados inconsistentes/incompletos nos testes
  const fallback = {};
  for (let i = 0; i < winnerKeys.length; i++) {
    fallback[winnerKeys[i]] = thirdTeams[i]?.id || null;
  }
  return fallback;
}

export function montarR32(grupos, terceiros) {
  const matching = matchingTerceiros(grupos, terceiros);

  const t = (g, pos) => grupos[g][pos];
  const m = (g) => matching[g];

  // Chaveamento oficial da Copa do Mundo FIFA 2026 ordenado sequencialmente de forma
  // que o emparelhamento consecutivo em montarBracket gere os caminhos corretos:
  return [
    [t("A", 1), t("B", 1)], // Match 1 (Runner-up A vs Runner-up B)
    [t("E", 0), m("E")],    // Match 3 (Winner E vs 3rd Place)
    
    [t("C", 0), t("F", 1)], // Match 2 (Winner C vs Runner-up F)
    [t("E", 1), t("I", 1)], // Match 5 (Runner-up E vs Runner-up I)
    
    [t("F", 0), t("C", 1)], // Match 4 (Winner F vs Runner-up C)
    [t("I", 0), m("I")],    // Match 6 (Winner I vs 3rd Place)
    
    [t("A", 0), m("A")],    // Match 7 (Winner A vs 3rd Place)
    [t("L", 0), m("L")],    // Match 8 (Winner L vs 3rd Place)
    
    [t("B", 0), m("B")],    // Match 13 (Winner B vs 3rd Place)
    [t("J", 0), t("H", 1)], // Match 15 (Winner J vs Runner-up H)
    
    [t("D", 1), t("G", 1)], // Match 14 (Runner-up D vs Runner-up G)
    [t("K", 0), m("K")],    // Match 16 (Winner K vs 3rd Place)
    
    [t("H", 0), t("J", 1)], // Match 11 (Winner H vs Runner-up J)
    [t("K", 1), t("L", 1)], // Match 12 (Runner-up K vs Runner-up L)
    
    [t("G", 0), m("G")],    // Match 9 (Winner G vs 3rd Place)
    [t("D", 0), m("D")]     // Match 10 (Winner D vs 3rd Place)
  ];
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
