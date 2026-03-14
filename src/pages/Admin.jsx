import { useEffect, useState } from "react";
import {collection,getDocs,addDoc,updateDoc,deleteDoc,doc,query,orderBy} from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { getDoc } from "firebase/firestore";

const emptyForm = {  date: "",  day: "",  month: "",  field: "",  time: "",  match: "",  contact: "",  uniform: "",  result: "",  goal: "", assist: "",  highlight: ""};

function Admin() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [users, setUsers] = useState([]);

  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/admin-login");
    } catch (err) {
      console.error("Logout error:", err);
    }
    };

    const loadUsers = async () => {
      const snap = await getDocs(collection(db, "users"));
      const data = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      setUsers(data);
    };

    const updateShortName = async (id, shortName) => {
      try {
        await updateDoc(doc(db, "users", id), {
          shortName: shortName
        });
        loadUsers();
      } catch (err) {
        console.error(err);
        alert("Không cập nhật được shortName");
      }
    };

  // 🔐 Check login
useEffect(() => {
  const unsub = onAuthStateChanged(auth, async (user) => {

    console.log("Auth user:", user);

    if (!user) {
      navigate("/admin-login");
      return;
    }

    // DEBUG USER ROLE
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    console.log("UID:", user.uid);
    console.log("User doc exists:", snap.exists());
    console.log("User data:", snap.data());

    loadMatches();
    loadUsers();
  });

  return () => unsub();
}, []);

  // Load matches
  const loadMatches = async () => {
    setLoading(true);

    const q = query(collection(db, "matches"), orderBy("date", "desc"));
    const snap = await getDocs(q);

    const data = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    setMatches(data);
    setLoading(false);
  };

  // Form change
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "date") {
      const m = value.slice(0, 7);

      setForm(prev => ({
        ...prev,
        date: value,
        month: m
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.date || !form.match) {
      alert("Thiếu ngày hoặc trận đấu");
      return;
    }

    try {
      if (editingId) {
        await updateDoc(doc(db, "matches", editingId), form);
      } else {
        await addDoc(collection(db, "matches"), form);
      }

      setForm(emptyForm);
      setEditingId(null);

      loadMatches();
    } catch (err) {
      console.error(err);
      alert("Không có quyền cập nhật (Firestore rules)");
    }
  };

  // Edit
  const handleEdit = (m) => {
    const { id, ...rest } = m;

    setForm({
      ...emptyForm,
      ...rest
    });

    setEditingId(id);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Xóa trận này?")) return;

    try {
      await deleteDoc(doc(db, "matches", id));
      loadMatches();
    } catch (err) {
      console.error(err);
      alert("Không có quyền xóa");
    }
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>🔐 ADMIN QUẢN LÝ TRẬN ĐẤU</h2>

      <button onClick={handleLogout} style={styles.logoutBtn}>
        🚪 Đăng xuất
      </button>

    <h3>👥 Thành viên đội bóng</h3>

    <div style={{background:"#fff",padding:10,borderRadius:10}}>
    {users.map(u => (
      <div key={u.id} style={{
        display:"flex",
        gap:10,
        alignItems:"center",
        marginBottom:6
      }}>
        <div style={{width:180}}>
          {u.name || "Chưa đặt tên"}
        </div>
        <input
          placeholder="shortName"
          defaultValue={u.shortName || ""}
          onBlur={(e)=>updateShortName(u.id,e.target.value)}
          style={{
            padding:4,
            border:"1px solid #ccc",
            borderRadius:6
          }}
        />
      </div>
    ))}

    </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} style={styles.form}>
        <h3>{editingId ? "✏️ Sửa trận" : "➕ Thêm trận mới"}</h3>

        <input type="date" name="date" value={form.date} onChange={handleChange} />
        <input name="day" placeholder="Thứ (vd: Thứ 5)" value={form.day} onChange={handleChange} />
        <input name="time" placeholder="Thời gian" value={form.time} onChange={handleChange} />
        <input name="field" placeholder="Sân" value={form.field} onChange={handleChange} />
        <input name="match" placeholder="Trận đấu" value={form.match} onChange={handleChange} />
        <input name="contact" placeholder="Liên hệ" value={form.contact} onChange={handleChange} />
        <input name="uniform" placeholder="Trang phục" value={form.uniform} onChange={handleChange} />
        <input name="result" placeholder="Kết quả (vd: 2-0)" value={form.result} onChange={handleChange} />

        <textarea
          name="goal"
          placeholder="Ghi bàn (vd: Giang 1, Tùng 1)"
          value={form.goal}
          onChange={handleChange}
        />
        <textarea
          name="assist"
          placeholder="Kiến tạo (vd: Bình 1, Khánh 1)"
          value={form.assist}
          onChange={handleChange}
        />

        <input
          name="highlight"
          placeholder="Video highlight (YouTube ID)"
          value={form.highlight}
          onChange={handleChange}
        />

        <button type="submit" style={styles.saveBtn}>
          {editingId ? "💾 Cập nhật" : "✅ Lưu trận"}
        </button>

        {editingId && (
          <button
            type="button"
            style={styles.cancelBtn}
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm);
            }}
          >
            ❌ Hủy
          </button>
        )}
      </form>

      {/* LIST */}
      <h3 style={{ marginTop: 20 }}>📋 Danh sách trận</h3>

      {loading && <p>Đang tải...</p>}

      {matches.map(m => (
        <div key={m.id} style={styles.card}>
          <b>{m.date} — {m.match}</b>

          <div style={styles.small}>
            {m.field} | {m.time}
          </div>

<div style={styles.small}>
  KQ: {m.result || "Chưa có"} | ⚽ {m.goal || "—"} | 🎯 {m.assist || "—"}
</div>

          <div style={styles.actions}>
            <button onClick={() => handleEdit(m)} style={styles.editBtn}>
              ✏️ Sửa
            </button>

            <button onClick={() => handleDelete(m.id)} style={styles.deleteBtn}>
              🗑 Xóa
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Admin;
const styles = {
  page: {
    padding: 12,
    maxWidth: 700,
    margin: "0 auto"
  },
  title: {
    textAlign: "center",
    marginBottom: 10
  },
  form: {
    background: "#f8fafc",
    padding: 12,
    borderRadius: 10,
    display: "grid",
    gap: 8
  },
  saveBtn: {
    background: "#16a34a",
    color: "#fff",
    border: "none",
    padding: 10,
    borderRadius: 8,
    fontWeight: "bold"
  },
  cancelBtn: {
    background: "#9ca3af",
    color: "#000",
    border: "none",
    padding: 8,
    borderRadius: 8
  },
  card: {
    background: "#fff",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    boxShadow: "0 2px 5px rgba(0,0,0,0.08)"
  },
  small: {
    fontSize: 13,
    color: "#374151",
    marginTop: 4
  },
  actions: {
    display: "flex",
    gap: 8,
    marginTop: 8
  },
  editBtn: {
    flex: 1,
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: 8,
    borderRadius: 6
  },
  deleteBtn: {
    flex: 1,
    background: "#dc2626",
    color: "#fff",
    border: "none",
    padding: 8,
    borderRadius: 6
  },
  logoutBtn: {
  background: "#111",
  color: "#fff",
  border: "none",
  padding: "8px 12px",
  borderRadius: 8,
  cursor: "pointer",
  marginBottom: 10
},
  
};