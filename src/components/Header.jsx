import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import "../styles/header.css";
import useAdmin from "../hooks/useAdmin";

function Header() {
  const { isAdmin, loading } = useAdmin();
  const isDev = import.meta.env.MODE === "development";

  const [user, setUser] = useState(null);
  const [name, setName] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        // lấy name từ firestore
        const docRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setName(docSnap.data().name);
        }
      } else {
        setUser(null);
        setName("");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <header>
      <h1>ĐỘI BÓNG CCF</h1>

      <div className="header-row">
        <nav className="main-nav">

          <NavLink to="/" end>
            Trận đấu
          </NavLink>

          <NavLink to="/TaiChinh">
            Tài chính
          </NavLink>

          {/* 👇 Nếu chưa login */}
          {!user && (
            <NavLink to="/login">
              Đăng nhập
            </NavLink>
          )}

          {/* 👇 Nếu đã login */}
          {user && (
            <NavLink to="/profile">
              {name}
            </NavLink>
          )}

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