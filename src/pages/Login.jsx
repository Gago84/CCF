import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
import { signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { isValidVietnamesePhone, convertToE164, clearForm } from "../utils";
import "../styles/AuthForm.css";
// ⭐ THÊM
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";


export default function Login() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpSection, setShowOtpSection] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [needRegister, setNeedRegister] = useState(false);  

  const navigate = useNavigate();

  // ✅ Initialize reCAPTCHA once when component mounts
  useEffect(() => {
    console.log("🔄 useEffect → initialize reCAPTCHA");
    if (!window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(
          "recaptcha-login-container",
          {
            size: "invisible",
            callback: (response) => {
              console.log("✅ reCAPTCHA solved:", response);
            },
            "expired-callback": () => {
              console.warn("⚠️ reCAPTCHA expired. Please retry.");
            },
          },
          auth
        );
        console.log("✅ reCAPTCHA verifier initialized", window.recaptchaVerifier);
      } catch (err) {
        console.error("❌ Error initializing reCAPTCHA:", err);
      }
    }
  }, []);

  // ✅ Send OTP
  const sendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!isValidVietnamesePhone(phone)) {
        alert("⚠️ Please enter a valid Vietnamese phone number (e.g. 0912345678)");
        setLoading(false);
        return;
      }

      const formattedPhone = convertToE164(phone);
      console.log("📞 Normalized phone:", formattedPhone);

      const appVerifier = window.recaptchaVerifier;
      if (!appVerifier) throw new Error("reCAPTCHA not ready yet");

      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      setShowOtpSection(true);

      console.log("✅ OTP sent successfully to", formattedPhone);
      alert("✅ OTP sent to your phone!");
    } catch (error) {
      console.error("❌ Error sending OTP:", error);
      alert("❌ " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Verify OTP
  const verifyOtp = async (e) => {
    e.preventDefault();

    if (!confirmationResult) {
      alert("⚠️ No OTP confirmation found. Please request OTP again.");
      return;
    }

    setLoading(true);
    try {
      console.log("🔍 Verifying OTP:", otp);
      const result = await confirmationResult.confirm(otp);
      const user = result.user;

      // ⭐ CHECK FIRESTORE
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        alert("✅ Đăng nhập thành công!");
        clearForm(setPhone, setOtp);
        navigate("/profile");
      } else {
        console.log("👤 User mới → cần nhập tên");
setNeedRegister(true);
setShowOtpSection(false);
      }
      
    } catch (error) {
      console.error("❌ OTP verification failed:", error);
      alert("❌ Incorrect OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };



  // ✅ Cancel button handler
  const handleCancel = () => {
    clearForm(setPhone, setOtp, setShowOtpSection);
    navigate("/");
  };

  return (
    <div className="auth-page">
      <div className="auth-form-container">
        <h2>Login with Phone</h2>

        {!showOtpSection && (
          <form onSubmit={sendOtp}>
            <input
              type="tel"
              placeholder="09XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            {/* ✅ reCAPTCHA container */}
            <div id="recaptcha-login-container"></div>

            <div className="form-buttons">
              <button type="submit" className="auth-btn-primary" disabled={loading}>
                {loading ? "Sending..." : "Send OTP"}
              </button>
              <button
                type="button"
                className="auth-btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {showOtpSection && (
          <form onSubmit={verifyOtp} className="auth-otp-section">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <button type="submit" className="auth-btn-primary" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button
              type="button"
              className="auth-btn-secondary"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </form>
        )}
          {needRegister && (
  <div className="auth-otp-section">
    <h3>Nhập tên của bạn</h3>

    <input
      type="text"
      placeholder="Họ tên"
      value={name}
      onChange={(e) => setName(e.target.value)}
    />

    <button
      className="auth-btn-primary"
      onClick={async () => {

        const user = auth.currentUser;
        if (!name.trim()) {
        alert("Vui lòng nhập tên");
        return;
        }

        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: name,
          phone: user.phoneNumber,
          role: "user",
          createdAt: serverTimestamp(),

          note: "",
          map: {
            address: "",
            url: "",
          },

          orders: [],
          points: 0,
        });

        alert("✅ Hồ sơ đã tạo!");

        navigate("/profile");
        window.location.reload();
      }}
    >
      Hoàn tất đăng ký
    </button>
  </div>
)}
      </div>
    </div>
  );
}
