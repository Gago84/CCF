import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import "../styles/header.css";

function Header() {

  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState(null);
  const [hasUser, setHasUser] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("🔥 Auth:", firebaseUser);
      // CHƯA LOGIN
      if (!firebaseUser) {
        setUser(null);
        setName("");
        setRole(null);
        const existed = localStorage.getItem("ccf_user_registered");
        if (existed) {
          setHasUser(true); // đã từng đăng ký
        } else {
          setHasUser(false); // chưa từng đăng ký
        }
        return;
      }
      setUser(firebaseUser);
      console.log("📧 Email:", firebaseUser.email);
      console.log("📱 Phone:", firebaseUser.phoneNumber);
      // ⭐ ADMIN LOGIN (EMAIL)
      if (firebaseUser.email) {
        setRole("admin");
        return;
      }
      // ⭐ USER LOGIN (PHONE)
      if (firebaseUser.phoneNumber) {
        const docRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        console.log("📄 Doc exists:", docSnap.exists());
        if (!docSnap.exists()) {
          console.log("⏳ User đang tạo profile...");
          return;
        }
        const data = docSnap.data();
        console.log("📊 Data:", data);
        if (data.role === "user") {
          setRole("user");
          setName(data.name || "");
          // đánh dấu user đã tồn tại
          localStorage.setItem("ccf_user_registered", "true");
          setHasUser(true);
          return;
        }
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  return (
    <header>

      <h1>ĐỘI BÓNG CCF</h1>

      <div className="header-row">

        <nav className="main-nav">

          <NavLink to="/" end>            Trận đấu          </NavLink>

          <NavLink to="/TaiChinh">            Tài chính          </NavLink>

        {/* 1️⃣ chưa từng đăng ký */}
        {!user && !hasUser && (
          <NavLink to="/dang-ky">
            Đăng ký
          </NavLink>
        )}

        {/* 2️⃣ đã đăng ký nhưng đang logout */}
        {!user && hasUser && (
          <NavLink to="/login">
            Đăng nhập
          </NavLink>
        )}

        {/* 3️⃣ đã login */}
        {user && role === "user" && (
          <NavLink to="/profile">
            {name || "Profile"}
          </NavLink>
        )}

          {/* DEV luôn hiện admin */}
          {import.meta.env.DEV && (
            <NavLink to="/admin">
              Admin
            </NavLink>
          )}

        </nav>

      </div>

    </header>
  );
}

export default Header;