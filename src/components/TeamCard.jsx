import "./TeamCard.css";

export default function TeamCard({ team, onPick, selected }) {
  if (!team) {
    return <div className="team-card team-card--empty">A definir</div>;
  }
  return (
    <button
      type="button"
      className={"team-card" + (selected ? " team-card--win" : "")}
      style={{ "--team-cor": team.cor }}
      onClick={() => onPick && onPick(team.id)}
    >
      <span className="team-card__bar" />
      <span className="team-card__nome">{team.nome}</span>
    </button>
  );
}
