// src/pages/Combo.jsx
import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import "../styles/Combo.css";
import FinanceTable from "../components/FinanceTable";


function Combo() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Nghe realtime collection tpbank_transactions
    const q = query(
      collection(db, "tpbank_transactions"),
      orderBy("createdAt", "desc") // mới nhất lên trên
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTransactions(list);
        setLoading(false);
      },
      (error) => {
        console.error("❌ Lỗi khi listen giao dịch:", error);
        setLoading(false);
      }
    );

    // cleanup
    return () => unsubscribe();
  }, []);

  return (
    <section className="combo-page">
      <h2>Bảng tính tài chính</h2>
      <FinanceTable />
      <h2>
        Tài khoản Online
        {transactions.length > 0 && (() => {
            const raw = transactions[0].availableBalanceFormatted ||
                        transactions[0].availableBalance?.toString() ||
                        "0";

            // Chuyển thành số thật
            const numeric = Number(raw.replace(/,/g, ""));

            // Format lại có dấu
            const formatted =
              (numeric > 0 ? "+" : numeric < 0 ? "-" : "") +
              Math.abs(numeric).toLocaleString("en-US");

            return (
              <span className="current-balance">
                : {formatted} VND
              </span>
            );
        })()}
      </h2>


      {loading ? (
        <p>Đang tải dữ liệu tài chính...</p>
      ) : transactions.length === 0 ? (
        <p>Chưa có giao dịch nào được ghi nhận.</p>
      ) : (
        <ul className="transactions-list">
          {transactions.map((tx) => {
            const type = (tx.type || "").toUpperCase(); // IN / OUT
            const amount =
              tx.amountFormatted ||
              (typeof tx.amount === "number"
                ? tx.amount.toLocaleString("en-US")
                : "0");
            const desc = tx.description || "";
            const dateTime =
              tx.date && tx.time ? `${tx.date} ${tx.time}` : null;

            return (
              <li
                key={tx.id}
                className={`transaction-item ${
                  type === "OUT" ? "transaction-out" : "transaction-in"
                }`}
              >
                {type === "OUT" ? (
                  // A. type = OUT → thanh toán
                  <p>
                    Quỹ đội bóng thanh toán khoản{" "}
                    <strong>{amount} VND</strong> cho việc{" "}
                    <strong>{desc}</strong>
                    {dateTime && (
                      <span className="tx-meta"> — {dateTime}</span>
                    )}
                  </p>
                ) : (
                  // B. type = IN → nạp tiền
                  <p>
                    Thành viên đội bóng (<strong>{desc}</strong>) vừa góp{" "}
                    <strong>{amount} VND</strong> cho quỹ đội bóng
                    {dateTime && (
                      <span className="tx-meta"> — {dateTime}</span>
                    )}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default Combo;
