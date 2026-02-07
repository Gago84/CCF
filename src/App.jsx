import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Intro from './pages/Intro';
import Combo from './pages/Combo';
import Admin from "./pages/Admin";   // 👈 sẽ tạo file này
import AdminLogin from "./pages/AdminLogin";

function App() {
  return (
    <div className="app">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Intro />} />
          <Route path="/combo" element={<Combo />} />
          <Route path="/admin" element={<Admin />} /> {/* 👈 ADMIN */}
          <Route path="/admin-login" element={<AdminLogin />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
