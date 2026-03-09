import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const navigate = useNavigate(); // ⭐ THÊM DÒNG NÀY
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const login = async (e) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password);

      navigate("/admin"); // ✅ không reload
    } catch (e) {
      setErr("Sai email hoặc mật khẩu");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🔐 Đăng nhập Admin</h2>

      <form onSubmit={login} style={{ display: "grid", gap: 10, maxWidth: 300 }}>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Mật khẩu" value={password} onChange={e => setPassword(e.target.value)} />
        <button>Đăng nhập</button>
        {err && <span style={{ color: "red" }}>{err}</span>}
      </form>
    </div>
  );
}

export default AdminLogin;
