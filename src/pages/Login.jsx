import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "../components/Login.css";

const Login = () => {
  const { login } = useAuth();
  const { role } = useParams(); // URL'den admin/user/organizer bilgisi geliyor
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(emailOrUsername, password, role);
    } catch (err) {
      alert("Giriş başarısız! Lütfen bilgilerinizi kontrol edin.");
    }
  };

  return (
    <div className="login-content">
      <h1 className="login-title">{role} Girişi</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
        <input
          type="text"
          placeholder={role === "Kullanıcı" ? "Kullanıcı Adı" : "Email"}
          value={emailOrUsername}
          required
          onChange={(e) => setEmailOrUsername(e.target.value)}
          className="login-input"
        />

        <input
          type="password"
          placeholder="Şifre"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
        />
        <button
          type="submit"
          className="login-submit-btn"
        >
          Giriş Yap
        </button>

        <div className="login-links-container">
          <button
            onClick={() => navigate("/choose-register")}
            className="login-register-button"
          >
            Hesabın yok mu? Kayıt ol
          </button>
          <button
            className="login-forgot-button"
            onClick={() => alert("Şifremi unuttum işlemi henüz yapılmadı.")}
          >
            Şifremi unuttum
          </button>
        </div>

      </form>
    </div>
  );
};

export default Login;
