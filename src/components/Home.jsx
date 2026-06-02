import { LISTA } from "../data";
import "./Home.css";

export default function Home({ onSelect }) {
  return (
    <div className="home">
      <header className="home__head">
        <h1>Simula Campeão</h1>
        <p>Monte o caminho até o título e compartilhe seu palpite.</p>
      </header>
      <div className="home__cards">
        {LISTA.map((c) => (
          <button key={c.id} type="button" className="home__card"
            style={{ "--cor": c.cor }} onClick={() => onSelect(c.id)}>
            <span className="home__card-bar" />
            <span className="home__card-nome">{c.nome}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
