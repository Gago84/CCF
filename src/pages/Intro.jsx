import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";

function Intro() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // trạng thái mở / đóng accordion
  const [openMatchId, setOpenMatchId] = useState(null);

  const toggleMatch = (id) => {
    setOpenMatchId(openMatchId === id ? null : id);
  };

  // ===== COMPONENT HIỂN THỊ DÒNG =====
  const Row = ({ label, value }) =>
    value ? (
      <>
        <b>{label}:</b> {value}
        <br />
      </>
    ) : null;

  // YYYY-MM-DD → DD/MM/YYYY
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };

  // YYYY-MM → MM/YYYY
  const formatMonthTitle = (monthStr) => {
    if (!monthStr) return "";
    const [year, month] = monthStr.split("-");
    return `${month}/${year}`;
  };

  // Thắng / Hòa / Thua
  const getResultText = (result) => {
    if (!result) return "";
    const [a, b] = result.split("-").map(Number);
    if (a > b) return "Thắng";
    if (a === b) return "Hòa";
    return "Thua";
  };

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const q = query(collection(db, "matches"), orderBy("date", "desc"));
        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setMatches(data);
      } catch (err) {
        console.error("Firebase error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  if (loading) return <p>⏳ Đang tải lịch thi đấu...</p>;

  // ===== THỐNG KÊ 2026 =====
  const matches2026 = matches.filter(
    (m) => m.date >= "2026-01-01" && m.result
  );

  let total = 0;
  let win = 0;
  let draw = 0;
  let lose = 0;
  let totalGoals = 0;
  let playerStats = {};

  matches2026.forEach((m) => {
    total++;

    const [a, b] = m.result.split("-").map(Number);
    totalGoals += a;

    if (a > b) win++;
    else if (a === b) draw++;
    else lose++;

    if (m.goal) {
      const players = m.goal.split(",");

      players.forEach((p) => {
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
      const top = Object.entries(players)
        .map(([name, goals]) => ({ name, goals }))
        .sort((a, b) => b.goals - a.goals)[0];

      return { month, ...top };
    })
    .sort((a, b) => b.month.localeCompare(a.month));

  // ===== GROUP THEO THÁNG =====
  const groupByMonth = matches.reduce((acc, item) => {
    acc[item.month] = acc[item.month] || [];
    acc[item.month].push(item);
    return acc;
  }, {});

  return (
    <section className="intro-page" style={{ lineHeight: "1.6" }}>

      {/* ===== STATS ===== */}
      <div className="stats-box">

        <h1>📊 Thống kê CCF năm 2026</h1>

        <p>⚽ Tổng số trận: <b>{total}</b></p>

        <p>
          ✅ Thắng: <b>{win}</b> |
          🤝 Hòa: <b>{draw}</b> |
          ❌ Thua: <b>{lose}</b>
        </p>

        <p>🥅 Tổng bàn thắng: <b>{totalGoals}</b></p>

        <h3>🔥 Vua phá lưới theo tháng</h3>

        {topScorerEachMonth.map((m) => (
          <p key={m.month}>
            👑 Tháng {formatMonthTitle(m.month)}:
            <b> {m.name}</b> ({m.goals} bàn)
          </p>
        ))}

        <hr />

        <h3>🔥 Vua phá lưới 2026</h3>

        {topScorers.length === 0 && <p>Chưa có dữ liệu.</p>}

        <ul>
          {topScorers.map((p) => (
            <li key={p.name}>
              {p.name}: <b>{p.goals}</b> bàn
            </li>
          ))}
        </ul>

        <hr />

      </div>


      {/* ===== LỊCH ===== */}
      {Object.keys(groupByMonth).map((month) => (

        <div key={month}>

          <h1>
            📅 Lịch tháng {formatMonthTitle(month)} 🤩
          </h1>


          {groupByMonth[month].map((m) => {

            const hasResult = !!m.result;

            return (

              <div className="match-box" key={m.id}>

                {/* HEADER */}
                <div
                  onClick={() => hasResult && toggleMatch(m.id)}
                  style={{
                    cursor: hasResult ? "pointer" : "default",
                    fontWeight: "bold",
                    marginBottom: "4px"
                  }}
                >
                  ⚽ {m.day} — {formatDate(m.date)}

                  {hasResult &&
                    <> — {getResultText(m.result)}</>
                  }

                  {/* HIỆN NGAY CẦU THỦ GHI BÀN */}
                  {hasResult && m.goal && (
                    <div style={{ marginLeft: "22px", marginBottom: "4px" }}>
                      <b>CCF ghi bàn:</b> {m.goal}
                    </div>
                  )}

                </div>

                {/* DETAIL */}
                {(openMatchId === m.id || !hasResult) && (

                  <div style={{ marginLeft: "12px" }}>

                    <Row label="Sân" value={m.field} />
                    <Row label="Thời gian" value={m.time} />
                    <Row label="Trận đấu" value={m.match} />
                    <Row label="Liên hệ" value={m.contact} />
                    <Row label="Trang phục" value={m.uniform} />
                    <Row label="Kết quả" value={m.result} />
                    <Row label="CCF ghi bàn" value={m.goal} />

                  </div>

                )}

              </div>

            );

          })}

        </div>

      ))}

    </section>
  );
}

export default Intro;