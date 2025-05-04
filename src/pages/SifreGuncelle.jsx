import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

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
            setError("Yeni şifreler eşleşmiyor!");
            return;
        }

        // Basit şifre doğrulama (örneğin, min 6 karakter)
        if (newPassword.length < 6) {
            setError("Yeni şifre en az 6 karakter olmalı!");
            return;
        }

        const endpoint =
            user?.role === "Kullanıcı"
                ? "http://localhost:8080/Profile/ChangePassword"
                : "http://localhost:8080/orgProfile/ChangePassword";

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
                    setSuccess("Şifreniz başarıyla güncellendi!");
                    setError("");

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
                } else {
                setError("Şifre güncellenemedi. Lütfen bilgilerinizi kontrol edin.");
                }
            })
            .catch((err) => {
                console.error(err);
                setError("Bir hata oluştu. Lütfen tekrar deneyin.");
            });
    };

    return (
        <div className="max-w-xl mx-auto mt-10 p-6 border rounded-xl shadow-lg bg-white space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Şifre Güncelle</h2>

            <div>
                <label className="font-semibold">Eski Şifre:</label>
                <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="border px-2 py-1 rounded w-full"
                />
            </div>

            <div>
                <label className="font-semibold">Yeni Şifre:</label>
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="border px-2 py-1 rounded w-full"
                />
            </div>

            <div>
                <label className="font-semibold">Yeni Şifre Tekrar:</label>
                    <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="border px-2 py-1 rounded w-full"
                />
            </div>

            {/* Hata ve başarı mesajları */}
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-500">{success}</p>}

            <div className="flex mt-6 gap-4">
                <button
                    onClick={handleSubmit}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                    Onayla
                </button>
                <button
                    onClick={() => window.history.back()} // İptal butonuna tıklandığında önceki sayfaya yönlendirme
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                    İptal
                </button>
            </div>
        </div>
    );
};

export default SifreGuncelle;
