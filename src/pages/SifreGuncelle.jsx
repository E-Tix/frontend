import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../components/SifreGuncelle.css";

const SifreGuncelle = () => {
    const { user } = useAuth();
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const handleSubmit = () => {

        // Şifre eşleşmesi kontrolü
        if (newPassword !== confirmNewPassword) {
            toast.warning("Yeni şifreler eşleşmiyor!");
            return;
        }

        // Basit şifre doğrulama (örneğin, min 6 karakter)
        if (newPassword.length < 6) {
            toast.warning("Yeni şifre en az 6 karakter olmalı!");
            return;
        }

        const endpoint = user?.role === "Kullanıcı"
            ? "http://localhost:8080/Profile/ChangePassword" // Eğer rol Kullanıcı ise bu endpoint
            : user?.role === "Admin"
                ? "http://localhost:8080/admin/changePassword" // Eğer rol Admin ise bu endpoint (path'i düzelttim)
                : user?.role === "Organizatör" // Organizatör rolünü de ekledim
                    ? "http://localhost:8080/orgProfile/ChangePassword" // Eğer rol Organizatör ise bu endpoint
                    : null; // Eğer rol yukarıdakilerden hiçbiri değilse null

        axios
            .put(endpoint, {
                eskiSifre: oldPassword,
                yeniSifre: newPassword,
                yeniSifreTekrar: newPassword,
            }, {
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            })
            .then((response) => {
                if (response.data === true) {
                    if (oldPassword === newPassword){
                        toast.warning("Eski şifre ile yeni şifre aynı olamaz!");
                    }else{
                        toast.success("Şifreniz başarıyla güncellendi!");

                        // 2 saniye bekleyip yönlendir (isteğe bağlı)
                        setTimeout(() => {
                            if(user?.role === "Kullanıcı"){
                                navigate("/profil/Kullanıcı"); // profil rotanı buraya yaz
                            }else if(user?.role === "Organizatör"){
                                navigate("/profil/Organizatör");
                            }else{
                                navigate("/profil/Admin");
                            }
                        }, 2000);
                    }
                } else {
                toast.error("Eski şifre yanlış. Lütfen bilgilerinizi kontrol edin.");
                }
            })
            .catch((err) => {
                console.error(err);
                toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
            });
    };

    return (
        <div className="password-update-container">
            <h2 className="password-update-title">Şifre Güncelle</h2>

            <div className="password-form-group">
                <label className="password-form-label">Eski Şifre:</label>
                <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="password-form-input"
                />
            </div>

            <div className="password-form-group">
                <label className="password-form-label">Yeni Şifre:</label>
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="password-form-input"
                />
            </div>

            <div className="password-form-group">
                <label className="password-form-label">Yeni Şifre Tekrar:</label>
                    <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="password-form-input"
                />
            </div>

            {/* Hata ve başarı mesajları */}
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <div className="password-action-buttons">
                <button
                    onClick={handleSubmit}
                    className="password-btn password-btn-confirm"
                >
                    Onayla
                </button>
                <button
                    onClick={() => window.history.back()} // İptal butonuna tıklandığında önceki sayfaya yönlendirme
                    className="password-btn password-btn-cancel"
                >
                    İptal
                </button>
            </div>
        </div>
    );
};

export default SifreGuncelle;
