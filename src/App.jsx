import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Intro from './pages/Intro';
import TaiChinh from './pages/TaiChinh';
import Admin from "./pages/Admin";   // 👈 sẽ tạo file này
import AdminLogin from "./pages/AdminLogin";
import DangKy from './pages/DangKy';
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import { useEffect, useState } from "react";
import { auth } from "./firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import ThongKe from "./pages/ThongKe";

function App() {

  const [user, setUser] = useState(null);

  useEffect(() => {
  const unsub = onAuthStateChanged(auth, (u) => {
    setUser(u);
  });

  return () => unsub();
  }, []);
  return (
    <div className="app">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Intro />} />
          <Route path="/TaiChinh" element={<TaiChinh />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dang-ky" element={<DangKy />} />
          <Route path="/login" element={<Login />} />
          <Route path="/thongke" element={<ThongKe />} />
                    
          {/* chỉ hiện trong localhost */}
          {import.meta.env.DEV && (
            <>
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin-login" element={<AdminLogin />} />
            </>
          )}
          
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
