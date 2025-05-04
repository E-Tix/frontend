import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import "../components/RegisterUser.css";

const RegisterUser = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState({
        adSoyad: "",
        kullaniciAdi: "",
        dogumTarihi: "",
        email: "",
        sifre: "",
        sifreTekrar: "",
        telNo: "",
    });

    const handleChange = (e) => {
        setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Şifre eşleşme kontrolü
        if (userInfo.sifre !== userInfo.sifreTekrar) {
            alert("Şifreler eşleşmiyor!");
            return;
        }

        // Şifre uzunluğu kontrolü
        if (userInfo.sifre.length < 6) {
            alert("Şifre en az 6 karakter olmalıdır!");
            return;
        }

        // Telefon numarası formatı kontrolü
        const phoneRegex = /^\d{10,15}$/;
        if (!phoneRegex.test(userInfo.telNo)) {
            alert("Telefon numarası geçersiz!");
            return;
        }

        try {
            await register(userInfo, "Kullanıcı");
        } catch (err) {
            alert("Kayıt başarısız!");
        }
    };

    return (
        <div className="register-user-background">
            <div className="register-user-outer-circle">
                <div className="register-user-inner-circle">
                    <div className="register-user-content-box">
                        <div className="register-user-content">
                            <h1 className="register-user-title">Kullanıcı Kayıt</h1>

                            <form onSubmit={handleSubmit} className="register-user-form">
                                <input
                                    type="text"
                                    name="adSoyad"
                                    placeholder="Ad Soyad"
                                    value={userInfo.adSoyad}
                                    onChange={handleChange}
                                    required
                                    className="register-user-input"
                                />

                                <input
                                    type="text"
                                    name="kullaniciAdi"
                                    placeholder="Kullanıcı Adı"
                                    value={userInfo.kullaniciAdi}
                                    onChange={handleChange}
                                    required
                                    className="register-user-input"
                                />

                                <input
                                    type="date"
                                    name="dogumTarihi"
                                    placeholder="Doğum Tarihi"
                                    value={userInfo.dogumTarihi}
                                    onChange={handleChange}
                                    required
                                    className="register-user-input"
                                />

                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={userInfo.email}
                                    onChange={handleChange}
                                    required
                                    className="register-user-input"
                                />

                                <input
                                    type="password"
                                    name="sifre"
                                    placeholder="Şifre"
                                    value={userInfo.sifre}
                                    onChange={handleChange}
                                    required
                                    className="register-user-input"
                                />

                                <input
                                    type="password"
                                    name="sifreTekrar"
                                    placeholder="Şifre Tekrar"
                                    value={userInfo.sifreTekrar}
                                    onChange={handleChange}
                                    required
                                    className="register-user-input"
                                />

                                <input
                                    type="text"
                                    name="telNo"
                                    placeholder="Telefon Numarası"
                                    value={userInfo.telNo}
                                    onChange={handleChange}
                                    required className="register-user-input"
                                />

                                <button
                                    type="submit"
                                    className="register-user-button"
                                >
                                    Kayıt Ol
                                </button>
                            </form>

                            <div className="register-user-login-container">
                                <p className="register-user-login-text">Hesabınız var mı?</p>
                                <button
                                    onClick={() => navigate("/login/Kullanıcı")}
                                    className="register-user-login-button"
                                >
                                    <span className="register-user-button-icon">→</span>
                                    <span>Giriş Yap</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterUser;
