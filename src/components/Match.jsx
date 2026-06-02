import TeamCard from "./TeamCard";
import "./Match.css";

export default function Match({ match, onPick }) {
  const pick = (teamId) => onPick(match.id, teamId);
  return (
    <div className="match">
      <TeamCard team={match.a} onPick={pick} selected={match.winner === match.a?.id} />
      <TeamCard team={match.b} onPick={pick} selected={match.winner === match.b?.id} />
    </div>
  );
}
