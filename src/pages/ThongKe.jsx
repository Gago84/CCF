import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

function ThongKe() {

const [matches, setMatches] = useState([]);
const [members, setMembers] = useState([]);
const formatMonthTitle = (monthStr) => {
const [year, month] = monthStr.split("-");
return `${month}/${year}`;
};

useEffect(() => {

  const fetchData = async () => {

    // ===== MATCHES =====
    const matchSnap = await getDocs(collection(db, "matches"));
    const matchData = matchSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setMatches(matchData);

    // ===== USERS =====
    const userSnap = await getDocs(collection(db, "users"));
    const userData = userSnap.docs.map(doc => doc.data());

    setMembers(userData);

  };

  fetchData();

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

        // ===== MVP THEO THÁNG (GOAL + ASSIST) =====
        let mvpByMonth = {};
        matches.forEach((m) => {
          if (!m.result) return;
          const monthKey = m.date.slice(0,7);
          if (!mvpByMonth[monthKey])
            mvpByMonth[monthKey] = {};
          // GOAL
          if (m.goal) {
            const players = m.goal.split(",");
            players.forEach(p => {
              const parts = p.trim().split(" ");
              const goals = Number(parts.pop());
              const name = parts.join(" ");
              if (!mvpByMonth[monthKey][name])
                mvpByMonth[monthKey][name] = {goals:0, assists:0};
              mvpByMonth[monthKey][name].goals += goals;
            });
          }
          // ASSIST
          if (m.assist) {
            const players = m.assist.split(",");
            players.forEach(p => {
              const parts = p.trim().split(" ");
              const assists = Number(parts.pop());
              const name = parts.join(" ");
              if (!mvpByMonth[monthKey][name])
                mvpByMonth[monthKey][name] = {goals:0, assists:0};
              mvpByMonth[monthKey][name].assists += assists;
            });
          }
        });

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

      // ===== MVP CẢ NĂM =====
      let mvpYear = {};
      matches2026.forEach(m => {
        // GOAL
        if (m.goal) {
          const players = m.goal.split(",");
          players.forEach(p => {
            const parts = p.trim().split(" ");
            const goals = Number(parts.pop());
            const name = parts.join(" ");
            if (!mvpYear[name])
              mvpYear[name] = {goals:0, assists:0};
            mvpYear[name].goals += goals;
          });
        }
        // ASSIST
        if (m.assist) {
          const players = m.assist.split(",");
          players.forEach(p => {
            const parts = p.trim().split(" ");
            const assists = Number(parts.pop());
            const name = parts.join(" ");
            if (!mvpYear[name])
              mvpYear[name] = {goals:0, assists:0};
            mvpYear[name].assists += assists;
          });
        }
      });

      const topMvpYear = Object.entries(mvpYear)
      .map(([name, stats]) => ({
        name,
        goals: stats.goals,
        assists: stats.assists,
        total: stats.goals + stats.assists
      }))
      .sort((a,b)=>{

        if (b.total !== a.total)
          return b.total - a.total;

        return b.goals - a.goals;

      });

          const topMvpEachMonth = Object.entries(mvpByMonth)
          .map(([month, players]) => {

            const topPlayers = Object.entries(players)
              .map(([name, stats]) => ({
                name,
                goals: stats.goals,
                assists: stats.assists,
                total: stats.goals + stats.assists
              }))
              .sort((a,b)=>{

                // 1️⃣ tổng bàn + kiến tạo
                if (b.total !== a.total)
                  return b.total - a.total;

                // 2️⃣ nếu bằng tổng → ai ghi nhiều bàn hơn
                return b.goals - a.goals;

              })
              .slice(0,3);

            return {month, players:topPlayers};

          })
          .sort((a,b)=> b.month.localeCompare(a.month));

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

  // ===== 5 TRẬN GẦN NHẤT =====
  const lastMatches = matches2026
    .sort((a,b) => b.date.localeCompare(a.date)) // mới nhất trước
    .slice(0,5);

  const form = lastMatches.map(m => {
    const [a,b] = m.result.split("-").map(Number);

    if (a > b) return "W";
    if (a === b) return "D";
    return "L";
  });


return (
<section className="intro-page">

  <h3>👥 Thành viên đội bóng</h3>
    <div style={{display:"flex", gap:"15px", flexWrap:"wrap"}}>
    {members
      .filter(m => m.name)   // bỏ dòng trống
      .map((m,i)=>{

        let icon = "⚽"; // mặc định

        if (m.name.toLowerCase().includes("giang"))
          icon = "🛡️";   // hậu vệ

        if (m.name.toLowerCase().includes("tùng"))
          icon = "🎯";   // tiền vệ

        return(
          <span key={i}>
            {icon} {m.name}
          </span>
        )
      })
    }
</div>

  <h1>📊 Thống kê CCF năm 2026</h1>

  <p>⚽ Tổng số trận: <b>{total}</b></p>

  <p>
    ✅ Thắng: <b>{win}</b> |
    🤝 Hòa: <b>{draw}</b> |
    ❌ Thua: <b>{lose}</b>
  </p>

  <p>🥅 Tổng bàn thắng: <b>{totalGoals}</b></p>

  <p>📊 5 trận gần nhất:</p>

    <div style={{display:"flex", gap:"8px", marginBottom:"10px"}}>
      {[...form].reverse().map((f,i)=>{
        let color="#999";
        let icon="➖";

        if (f==="W"){
          color="#2ecc71";
          icon="✓";
        }
        if (f==="D"){
          color="#888";
          icon="–";
        }
        if (f==="L"){
          color="#e74c3c";
          icon="✕";
        }

        return(
          <div key={i}
            style={{
              width:"28px",
              height:"28px",
              borderRadius:"50%",
              background:color,
              color:"#fff",
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
              fontWeight:"bold"
            }}
          >
            {icon}
          </div>
        )
      })}
    </div>

  {/* ===== 3 CỘT ===== */}
      <div style={{display:"flex", gap:"20px"}}>

        <div>
          <h3>🔥 Vua phá lưới 2026</h3>
          <ul>
            {topScorers.map((p,i)=>{
            const medals=["🥇","🥈","🥉"];
            return(
            <li key={p.name}>
            {i < 3 ? medals[i] : "👉"} {p.name}: <b>{p.goals}</b> bàn
            </li>
            );
            })}
          </ul>
        </div>

        <div>
          <h3>🎯 Vua kiến tạo 2026</h3>
          <ul>
            {topAssists.map((p,i)=>{
            const medals=["🥇","🥈","🥉"];
            return(
            <li key={p.name}>
            {i < 3 ? medals[i] : "👉"} {p.name}: <b>{p.assists}</b>
            </li>
            );
            })}
          </ul>
        </div>

        <div>
          <h3>⭐ Xuất sắc nhất năm 2026</h3>
        <ul>
          {topMvpYear.map((p,i)=>{
          const medals = ["🥇","🥈","🥉"];
          return(
          <li key={p.name}>
          {i < 3 ? medals[i] : "👉"} {p.name} ({p.goals}⚽ + {p.assists}🎯)
          </li>
          );
          })}
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
        <th style={{border:"1px solid #ccc", padding:"8px"}}>
        ⭐ Xuất sắc nhất
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
        <td style={{border:"1px solid #ccc", padding:"8px", verticalAlign:"top"}}>
          {topMvpEachMonth[index] && (
          <>
            <p>👑 Tháng {formatMonthTitle(topMvpEachMonth[index].month)}</p>
              {topMvpEachMonth[index].players.map((p,i)=>{
              const medals=["🥇","🥈","🥉"];
              return(
                <p key={p.name}>
                {medals[i]} {p.name} ({p.goals}⚽ + {p.assists}🎯)
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
