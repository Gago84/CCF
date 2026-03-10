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
let assistStats = {};

matches2026.forEach(m => {


total++;

const [a, b] = m.result.split("-").map(Number);
totalGoals += a;

if (a > b) win++;
else if (a === b) draw++;
else lose++;

// ===== BÀN THẮNG =====
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

// ===== KIẾN TẠO =====
if (m.assist) {

  const players = m.assist.split(",");

  players.forEach(p => {

    const parts = p.trim().split(" ");
    const assists = Number(parts.pop());
    const name = parts.join(" ");

    if (!assistStats[name]) assistStats[name] = 0;
    assistStats[name] += assists;

  });
}


});

const topScorers = Object.entries(playerStats)
.map(([name, goals]) => ({ name, goals }))
.sort((a, b) => b.goals - a.goals);

const topAssists = Object.entries(assistStats)
.map(([name, assists]) => ({ name, assists }))
.sort((a, b) => b.assists - a.assists);

// ===== THỐNG KÊ THEO THÁNG =====
let scorersByMonth = {};
let assistsByMonth = {};

matches.forEach((m) => {


if (!m.result) return;

const monthKey = m.date.slice(0, 7);

// ===== GOAL =====
if (m.goal) {

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
}

// ===== ASSIST =====
if (m.assist) {

  if (!assistsByMonth[monthKey])
    assistsByMonth[monthKey] = {};

  const players = m.assist.split(",");

  players.forEach((p) => {

    const parts = p.trim().split(" ");
    const assists = Number(parts.pop());
    const name = parts.join(" ");

    if (!assistsByMonth[monthKey][name])
      assistsByMonth[monthKey][name] = 0;

    assistsByMonth[monthKey][name] += assists;

  });
}


});

const topScorerEachMonth = Object.entries(scorersByMonth)
.map(([month, players]) => {


  const topPlayers = Object.entries(players)
    .map(([name, goals]) => ({ name, goals }))
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 3);

  return { month, players: topPlayers };

}).sort((a, b) => b.month.localeCompare(a.month));


const topAssistEachMonth = Object.entries(assistsByMonth)
.map(([month, players]) => {


  const topPlayers = Object.entries(players)
    .map(([name, assists]) => ({ name, assists }))
    .sort((a, b) => b.assists - a.assists)
    .slice(0, 3);

  return { month, players: topPlayers };

}).sort((a, b) => b.month.localeCompare(a.month));


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

  {/* ===== 2 CỘT ===== */}
  <div style={{display:"flex", gap:"80px"}}>

    <div>
      <h3>🔥 Vua phá lưới 2026</h3>
      <ul>
        {topScorers.map(p => (
          <li key={p.name}>
            {p.name}: <b>{p.goals}</b> bàn
          </li>
        ))}
      </ul>
    </div>

    <div>
      <h3>🎯 Vua kiến tạo 2026</h3>
      <ul>
        {topAssists.map(p => (
          <li key={p.name}>
            {p.name}: <b>{p.assists}</b>
          </li>
        ))}
      </ul>
    </div>

  </div>

  {/* ===== THEO THÁNG ===== */}
  <table style={{width:"100%", borderCollapse:"collapse", marginTop:"20px"}}>

    <thead>
      <tr>
      <th style={{border:"1px solid #ccc", padding:"8px"}}>
      🔥 Vua phá lưới theo tháng
      </th>

      <th style={{border:"1px solid #ccc", padding:"8px"}}>
      🎯 Vua kiến tạo theo tháng
      </th>
      </tr>
    </thead>

    <tbody>

      {topScorerEachMonth.map((m,index)=>{

      const assists = topAssistEachMonth[index];

      return(

      <tr key={m.month}>

      <td style={{border:"1px solid #ccc", padding:"8px", verticalAlign:"top"}}>

      <p>👑 Tháng {formatMonthTitle(m.month)}</p>

      {m.players.map((p,i)=>{

      const medals=["🥇","🥈","🥉"];

      return(
      <p key={p.name}>
      {medals[i]} {p.name} ({p.goals})
      </p>
      );

      })}

      </td>

      <td style={{border:"1px solid #ccc", padding:"8px", verticalAlign:"top"}}>

      {assists && (
      <>
      <p>👑 Tháng {formatMonthTitle(assists.month)}</p>

      {assists.players.map((p,i)=>{

      const medals=["🥇","🥈","🥉"];

      return(
      <p key={p.name}>
      {medals[i]} {p.name} ({p.assists})
      </p>
      );

      })}
      </>
      )}

      </td>

      </tr>

      );

      })}

    </tbody>
  </table>

</section>


);
}

export default ThongKe;
