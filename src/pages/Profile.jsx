// src/pages/Profile.jsx
import { useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { doc, getDoc, updateDoc,getDocs, collection } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";
import { convertToLocalPhone } from "../utils";
import { signOut } from "firebase/auth";

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [yearGoals, setYearGoals] = useState(0);
  const [monthGoals, setMonthGoals] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login");
        return;
      }

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUserData(docSnap.data());
      } else {
        console.error("❌ User document not found!");
      }
      setLoading(false);
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    if (!userData) return;
    const fetchGoals = async () => {
      const querySnapshot = await getDocs(collection(db, "matches"));
      let yearTotal = 0;
      let monthTotal = 0;
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.goal) return;
        const goals = data.goal.split(",");
        goals.forEach(g => {
          const parts = g.trim().split(" ");
          const goalNum = parseInt(parts.pop());   // lấy số cuối
          const player = parts.join(" ");          // phần còn lại là tên
          if (  player.trim().toLowerCase() ===
          userData.name.trim().toLowerCase()) {
            const [year, month, day] = data.date.split("-");
            if (parseInt(year) === currentYear) {
              yearTotal += goalNum;
            }
            if (
              parseInt(year) === currentYear &&
              parseInt(month) === currentMonth
            ) {
              monthTotal += goalNum;
            }
          }
        });
      });
      setYearGoals(yearTotal);
      setMonthGoals(monthTotal);
    };
    fetchGoals();
  }, [userData]);

    // ✅ Handle save changes
    const handleSave = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const docRef = doc(db, "users", user.uid);
        await updateDoc(docRef, {
          name: userData.name,
          birthday: userData.birthday,   // thêm dòng này
          note: userData.note,
          job: userData.job,
          map: {
            ...userData.map,
            address: userData.map.address,
          },
        });

        alert("✅ Thông tin đã được cập nhật!");
      } catch (error) {
        console.error("❌ Error updating profile:", error);
        alert("Lỗi khi lưu thông tin: " + error.message);
      }
    };

    // ✅ Handle logout
    const handleLogout = async () => {
      try {
            // ⭐ ĐÁNH DẤU USER ĐÃ TỪNG ĐĂNG KÝ

        await signOut(auth);
        navigate("/login");
      } catch (error) {
        console.error("❌ Error logging out:", error);
        alert("Lỗi khi đăng xuất: " + error.message);
      }
    };

  if (loading) return <p>Loading...</p>;
  if (!userData) return <p>No user data found.</p>;

  return (
    <div className="profile-page">
      <h2>👤 Thông tin thành viên</h2>

      <label>Họ tên:</label>
      <input
        type="text"
        value={userData.name}
        onChange={(e) =>
          setUserData({ ...userData, name: e.target.value })
        }
      />

      <label>🎂 Ngày sinh:</label>
      <input
        type="date"
        value={userData.birthday || ""}
        onChange={(e) =>
          setUserData({ ...userData, birthday: e.target.value })
        }
      />

      <label>Số điện thoại:</label>
      <input type="text" value={convertToLocalPhone(userData.phone)} disabled />

      <label>Địa chỉ:</label>
      <input
        type="text"
        value={userData.map?.address || ""}
        onChange={(e) =>
          setUserData({
            ...userData,
            map: { ...userData.map, address: e.target.value },
          })
        }
      />

      <label>💼 Công việc / Kinh doanh chính:</label>
      <input
        type="text"
        value={userData.job || ""}
        onChange={(e) =>
          setUserData({ ...userData, job: e.target.value })
        }
      />

      <h3>⚽ Thống kê cá nhân</h3>

      <p>🔥 Bàn thắng năm {new Date().getFullYear()}:
      <b>{yearGoals}</b></p>

      <p>
      📅 Bàn thắng tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}:
      <b>{monthGoals}</b>
      </p>
      
      <div className="profile-actions">
        <button onClick={handleSave} className="profile-btn-save">
          Lưu thay đổi
        </button>
        <button onClick={handleLogout} className="profile-btn-logout">
          Đăng xuất
        </button>
      </div>

    </div>
  );
}
