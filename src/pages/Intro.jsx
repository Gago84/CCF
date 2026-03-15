import { useEffect, useState } from "react";
import {  collection,  getDocs,  query,  orderBy,  where,  addDoc,  serverTimestamp} from "firebase/firestore";
import { db,auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import "../styles/intro.css";

function Intro() {

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMatchId, setOpenMatchId] = useState(null);
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const toggleMatch = (id) => {
    setOpenMatchId(openMatchId === id ? null : id);
  };

  // ===== ROW =====
  const Row = ({ label, value }) =>
    value ? (
      <>
        <b>{label}:</b> {value}
        <br />
      </>
    ) : null;

  // ===== FORMAT DATE =====
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };

  const formatMonthTitle = (monthStr) => {
    if (!monthStr) return "";
    const [year, month] = monthStr.split("-");
    return `${month}/${year}`;
  };

  const getResultText = (result) => {
    if (!result) return "";
    const [a, b] = result.split("-").map(Number);
    if (a > b) return "Thắng";
    if (a === b) return "Hòa";
    return "Thua";
  };

  // ===== FORMAT TIME COMMENT =====
  const formatTime = (timestamp) => {

    if (!timestamp) return "";

    const date = timestamp.toDate();

    return date.toLocaleString("vi-VN");
  };

  // ===== LẤY SHORTNAME =====
  const getShortNameByPhone = async (phone) => {

    const q = query(
      collection(db, "users"),
      where("orders.phone", "==", phone)
    );

    const snap = await getDocs(q);

    if (!snap.empty) {
      return snap.docs[0].data().orders.shortName;
    }

    return "Ẩn danh";
  };

  // ===== GỬI COMMENT =====
  const submitComment = async (matchId) => {

    if (!phone || !comment) {
      alert("Nhập số điện thoại và bình luận");
      return;
    }

    const shortName = await getShortNameByPhone(phone);

    await addDoc(collection(db, "comments"), {
      matchId,
      phone,
      shortName,
      content: comment,
      createdAt: serverTimestamp()
    });

    setComment("");
    loadComments(matchId);
  };

  // ===== LOAD COMMENTS =====
  const loadComments = async (matchId) => {

    const q = query(
      collection(db, "comments"),
      where("matchId", "==", matchId),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);

    const data = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setComments(data);
  };

    // ===== COMMENT BOX =====
    const CommentBox = ({ matchId }) => {
      useEffect(() => {
        loadComments(matchId);
      }, []);
      return (
        <div className="comment-box">
          <div className="comment-header">
            {currentUser ? (
              <div className="comment-user">
                {currentUser.shortName}
              </div>
            ) : (
              <div className="comment-login">
                Đăng nhập / đăng ký
              </div>
            )}
          </div>
          <div className="comment-list">
            {comments.map(c => (
              <div key={c.id} className="comment-item">
                <div className="comment-name">
                  {c.shortName}
                </div>
                <div className="comment-time">
                  {formatTime(c.createdAt)}
                </div>
                <div className="comment-text">
                  {c.content}
                </div>
              </div>
            ))}
          </div>
          <div className="comment-input">
            <input
              placeholder="Viết bình luận..."
              value={comment}
              onChange={(e)=>setComment(e.target.value)}
            />
            <button onClick={()=>submitComment(matchId)}>
              Gửi
            </button>
          </div>
        </div>
      );
    };

  // ===== HEAD TO HEAD =====
  const getHeadToHeadHistory = (currentMatch) => {

    if (!currentMatch.match) return [];

    return matches
      .filter(
        (m) =>
          m.match === currentMatch.match &&
          m.result &&
          m.date < currentMatch.date
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  };

  useEffect(() => {
  const unsub = onAuthStateChanged(auth, async (user) => {
    if (user) {
      const q = query(
        collection(db, "users"),
        where("uid", "==", user.uid)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        setCurrentUser(snap.docs[0].data().orders);
      }
    } else {
      setCurrentUser(null);
    }
  });
  return () => unsub();
  }, []);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const q = query(
          collection(db, "matches"),
          orderBy("date", "desc")
        );
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

  const groupByMonth = matches.reduce((acc, item) => {
    acc[item.month] = acc[item.month] || [];
    acc[item.month].push(item);
    return acc;
  }, {});

  return (
    <section className="intro-page" style={{ lineHeight: "1.6" }}>

      {Object.keys(groupByMonth).map((month) => (

        <div key={month}>

          <h1>
            📅 Lịch tháng {formatMonthTitle(month)} 🤩
          </h1>

          {groupByMonth[month].map((m) => {

            const hasResult = !!m.result;

            return (

              <div
                className="match-box"
                key={m.id}
                style={{
                  borderBottom: "1px dashed #999",
                  paddingBottom: "12px",
                  marginBottom: "12px",
                  background: "#fafafa",
                  padding: "10px",
                  borderRadius: "6px"
                }}
              >

                <div
                  onClick={() => hasResult && toggleMatch(m.id)}
                  style={{
                    cursor: hasResult ? "pointer" : "default",
                    fontWeight: "bold",
                    marginBottom: "4px",
                    color: hasResult ? "#1d4ed8" : "#000"
                  }}
                >
                  {hasResult && (openMatchId === m.id ? "▼ " : "▶ ")}

                  {m.day} — {formatDate(m.date)}

                  {hasResult &&
                    <> — {getResultText(m.result)} ({m.result})</>
                  }

                </div>

                {(openMatchId === m.id || !hasResult) && (

                  <div style={{ marginLeft: "12px" }}>

                    <Row label="Sân" value={m.field} />
                    <Row label="Thời gian" value={m.time} />
                    <Row label="Trận đấu" value={m.match} />

                    {!m.result && m.match && (
                      <div style={{ marginLeft: "12px", marginBottom: "6px" }}>
                        <b>Lịch sử đối đầu:</b>

                        {(() => {

                          const history = getHeadToHeadHistory(m);

                          if (history.length === 0) {
                            return <div>Chưa đối đầu</div>;
                          }

                          return history.map((h) => (
                            <div key={h.id}>
                              - {formatDate(h.date)}, {getResultText(h.result)}, tỷ số {h.result}
                            </div>
                          ));

                        })()}

                      </div>
                    )}

                    <Row label="Liên hệ" value={m.contact} />
                    <Row label="Trang phục" value={m.uniform} />
                    <Row label="Kết quả" value={m.result} />
                    <Row label="CCF ghi bàn" value={m.goal} />

                    {/* VIDEO */}
                    {m.highlight && (

                      <div style={{ marginTop: "8px", marginBottom: "10px" }}>

                        <b>Video highlight:</b>

                        <div style={{ marginTop: "6px" }}>
                          <iframe
                            width="100%"
                            height="315"
                            src={`https://www.youtube.com/embed/${m.highlight}`}
                            title="YouTube video player"
                            frameBorder="0"
                            allowFullScreen
                            style={{ borderRadius: "8px" }}
                          ></iframe>
                        </div>

                        <CommentBox matchId={m.id} />

                      </div>

                    )}

                    {!m.highlight && (
                      <CommentBox matchId={m.id} />
                    )}

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