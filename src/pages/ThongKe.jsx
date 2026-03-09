import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

function ThongKe() {

  const [matches, setMatches] = useState([]);
const formatMonthTitle = (monthStr) => {
  const [year, month] = monthStr.split("-");
  return `${month}/${year}`;
};
  useEffect(() => {
    const fetchMatches = async () => {
      const snapshot = await getDocs(collection(db, "matches"));

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setMatches(data);
    };

    fetchMatches();
  }, []);

  // ===== THỐNG KÊ 2026 =====
  const matches2026 = matches.filter(
    m => m.date >= "2026-01-01" && m.result
  );

  let total = 0;
  let win = 0;
  let draw = 0;
  let lose = 0;
  let totalGoals = 0;
  let playerStats = {};

  matches2026.forEach(m => {

    total++;

    const [a, b] = m.result.split("-").map(Number);
    totalGoals += a;

    if (a > b) win++;
    else if (a === b) draw++;
    else lose++;

    if (m.goal) {

      const players = m.goal.split(",");

      players.forEach(p => {

        const parts = p.trim().split(" ");
        const goals = Number(parts.pop());
        const name = parts.join(" ");

        if (!playerStats[name]) playerStats[name] = 0;
        playerStats[name] += goals;

      });
    }
  });

  const topScorers = Object.entries(playerStats)
    .map(([name, goals]) => ({ name, goals }))
    .sort((a, b) => b.goals - a.goals);
// ===== VUA PHÁ LƯỚI THEO THÁNG =====
let scorersByMonth = {};

matches.forEach((m) => {

  if (!m.result || !m.goal) return;

  const monthKey = m.date.slice(0, 7);

  if (!scorersByMonth[monthKey])
    scorersByMonth[monthKey] = {};

  const players = m.goal.split(",");

  players.forEach((p) => {

    const parts = p.trim().split(" ");
    const goals = Number(parts.pop());
    const name = parts.join(" ");

    if (!scorersByMonth[monthKey][name])
      scorersByMonth[monthKey][name] = 0;

    scorersByMonth[monthKey][name] += goals;

  });

});

const topScorerEachMonth = Object.entries(scorersByMonth)
  .map(([month, players]) => {

    const topPlayers = Object.entries(players)
      .map(([name, goals]) => ({ name, goals }))
      .sort((a, b) => b.goals - a.goals)
      .slice(0, 3); // ⭐ lấy top 3

    return { month, players: topPlayers };

  })
  .sort((a, b) => b.month.localeCompare(a.month));
  return (

    <section className="intro-page">

      <h1>📊 Thống kê CCF năm 2026</h1>

      <p>⚽ Tổng số trận: <b>{total}</b></p>

      <p>
        ✅ Thắng: <b>{win}</b> |
        🤝 Hòa: <b>{draw}</b> |
        ❌ Thua: <b>{lose}</b>
      </p>

      <p>🥅 Tổng bàn thắng: <b>{totalGoals}</b></p>

      <h3>🔥 Vua phá lưới 2026</h3>

      <ul>
        {topScorers.map(p => (
          <li key={p.name}>
            {p.name}: <b>{p.goals}</b> bàn
          </li>
        ))}
      </ul>
<h3>🔥 Vua phá lưới theo tháng</h3>

        {topScorerEachMonth.map((m) => (
        <div key={m.month}>

            <p>👑 Tháng {formatMonthTitle(m.month)}</p>

<div style={{ display: "flex", gap: "28px", marginLeft: "12px", flexWrap: "wrap" }}>
  {m.players.map((p, index) => {

    const medals = ["🥇", "🥈", "🥉"];

    return (
      <span
        key={p.name}
        style={{
          background: "#f5f5f5",
          padding: "6px 10px",
          borderRadius: "8px",
          fontWeight: "500"
        }}
      >
        {medals[index]} {p.name} ({p.goals})
      </span>
    );
  })}
</div>

        </div>
        ))}

    </section>
  );
}

export default ThongKe;