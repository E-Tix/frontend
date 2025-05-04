import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import "../components/RegisterOrganizator.css";

const RegisterOrganizer = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [organizerInfo, setOrganizerInfo] = useState({
        adSoyad: "",
        tckNo: "",
        vergiNo: "",
        sifre: "",
        sifreTekrar: "",
        email: "",
        telefonNumarasi: "",
        sirketAdresi: "",
        iban: "",
    });

    const handleChange = (e) => {
        setOrganizerInfo({ ...organizerInfo, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Şifre eşleşme kontrolü
        if (organizerInfo.sifre !== organizerInfo.sifreTekrar) {
            alert("Şifreler eşleşmiyor!");
            return;
        }

        // Şifre uzunluğu kontrolü
        if (organizerInfo.sifre.length < 6) {
            alert("Şifre en az 6 karakter olmalıdır!");
            return;
        }

        // Telefon numarası formatı kontrolü
        const phoneRegex = /^\d{10,15}$/;
        if (!phoneRegex.test(organizerInfo.telefonNumarasi)) {
            alert("Telefon numarası geçersiz!");
            return;
        }

        // Vergi numarası formatı kontrolü
        const taxNumberRegex = /^\d{10}$/;
        if (!taxNumberRegex.test(organizerInfo.vergiNo)) {
            alert("Vergi numarası 10 haneli olmalıdır ve sadece rakamlardan oluşmalıdır!");
            return;
        }

        // IBAN formatı kontrolü
        const ibanRegex = /^TR\d{24}$/;
        if (!ibanRegex.test(organizerInfo.iban)) {
            alert("IBAN geçersiz. Örnek: TR000000000000000000000000");
            return;
        }

        try {
            await register(organizerInfo, "Organizatör");
        } catch (err) {
            alert("Kayıt başarısız!");
        }
    };

    return (
        <div className="register-organizator-background">
            <div className="register-organizator-background-image"></div>
            <div className="register-organizator-outer-circle">
                <div className="register-organizator-inner-circle">
                    <div className="register-organizator-content-box">
                        <div className="register-organizator-content">
                            <h1 className="register-organizator-title">Organizatör Kayıt</h1>

                            <form onSubmit={handleSubmit} className="register-organizator-form">
                                <input
                                    type="text"
                                    name="adSoyad"
                                    placeholder="Ad Soyad"
                                    value={organizerInfo.adSoyad}
                                    onChange={handleChange}
                                    required
                                    className="register-organizator-input"
                                />

                                <input
                                    type="text"
                                    name="tckNo"
                                    placeholder="T.C. Kimlik No"
                                    value={organizerInfo.tckNo}
                                    onChange={handleChange}
                                    required
                                    className="register-organizator-input"
                                />

                                <input
                                    type="text"
                                    name="vergiNo"
                                    placeholder="Vergi Numarası"
                                    value={organizerInfo.vergiNo}
                                    onChange={handleChange}
                                    required
                                    className="register-organizator-input"
                                />

                                <input
                                    type="password"
                                    name="sifre"
                                    placeholder="Şifre"
                                    value={organizerInfo.sifre}
                                    onChange={handleChange}
                                    required
                                    className="register-organizator-input"
                                />

                                <input
                                    type="password"
                                    name="sifreTekrar"
                                    placeholder="Şifre Tekrar"
                                    value={organizerInfo.sifreTekrar}
                                    onChange={handleChange}
                                    required
                                    className="register-organizator-input"
                                />

                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={organizerInfo.email}
                                    onChange={handleChange}
                                    required
                                    className="register-organizator-input"
                                />

                                <input
                                    type="text"
                                    name="telefonNumarasi"
                                    placeholder="Telefon Numarası"
                                    value={organizerInfo.telefonNumarasi}
                                    onChange={handleChange}
                                    required
                                    className="register-organizator-input"
                                />

                                <input
                                    type="text"
                                    name="sirketAdresi"
                                    placeholder="Şirket Adresi"
                                    value={organizerInfo.sirketAdresi}
                                    onChange={handleChange}
                                    required
                                    className="register-organizator-input"
                                />

                                <input
                                    type="text"
                                    name="iban"
                                    placeholder="IBAN"
                                    value={organizerInfo.iban}
                                    onChange={handleChange}
                                    required
                                    className="register-organizator-input"
                                />

                                <button
                                    type="submit"
                                    className="register-organizator-button"
                                >
                                    Kayıt Ol
                                </button>
                            </form>

                            <div className="register-organizator-login-container">
                                <p className="register-organizator-login-text">Hesabınız var mı?</p>
                                <button onClick={() => navigate("/login/Organizatör")} className="register-organizator-login-button">
                                    <span className="register-organizator-button-icon">→</span>
                                    <span>Giriş Yap</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="register-organizator-overlay-image"></div>
        </div>
    );
};

export default RegisterOrganizer;
