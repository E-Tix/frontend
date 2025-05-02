import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const OrganizatorProfil = () => {
    const { user } = useAuth();
    const [savedProfile, setSavedProfile] = useState(null);
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState({
        adSoyad: "",
        email: "",
        telefonNumarasi: "",
        sirketAdresi: "",
        iban: "",
    });
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.token) {
            axios
                .get("http://localhost:8080/orgProfile/getOrganizatorProfile", {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                })
                .then((res) => {
                    setProfile(res.data);
                    setSavedProfile(res.data); // Veriyi kaydediyoruz
                    setEditedProfile({
                        adSoyad: res.data.adSoyad || "",
                        email: res.data.email || "",
                        telefonNumarasi: res.data.telefonNumarasi || "",
                        sirketAdresi: res.data.sirketAdresi || "",
                        iban: res.data.iban || "",
                    });
                })
                .catch((err) => console.error("Profil verisi alınamadı:", err));
        }
    }, [user]);

    const handleInputChange = (e) => {
        setEditedProfile({ ...editedProfile, [e.target.name]: e.target.value });
    };

    const handleUpdate = () => {
        axios
            .put("http://localhost:8080/orgProfile/updateOrganizatorInfo/save", editedProfile, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            })
            .then(() => {
                alert("Bilgileriniz başarıyla güncellendi.");
                setIsEditing(false);
                setProfile({ ...profile, ...editedProfile });
            })
            .catch((err) => {
                console.error("Güncelleme başarısız:", err);
                alert("Bilgiler güncellenemedi.");
            });
    };

    //Bilgilerimi güncelle dedikten sonra iptal etmek için
    const handleCancel = () => {
        setEditedProfile(savedProfile);
        setIsEditing(false);
    };

    // Şifre güncelleme sayfasına yönlendir
    const handlePasswordUpdate = () => {
        navigate("/sifre-guncelle");
    };
    //backend ile bağlantı sağlanamazsa gösterilecek içerik
    if (!profile) return <p>Yükleniyor...</p>;

    return (
        <div className="max-w-xl mx-auto mt-10 p-6 border rounded-xl shadow-lg bg-white">
            <h2 className="text-2xl font-bold mb-6">Organizatör Profili</h2>

            {/*Profil bilgileri burada yer alıyor */}
            <div className="space-y-4">
                <div>
                    <label className="font-semibold">Ad Soyad:</label>
                    <input
                        name="adSoyad"
                        type="text"
                        value={editedProfile.adSoyad}
                        onChange={handleInputChange}
                        readOnly={!isEditing}
                        className="border p-1 w-full rounded"
                    />
                </div>

                <div>
                    <label className="font-semibold">T.C. Kimlik No:</label>
                    <input
                        name="tckNo"
                        type="text"
                        value={profile.tckNo}
                        onChange={handleInputChange}
                        readOnly
                        className="border p-1 w-full rounded"
                    />
                </div>

                <div>
                    <label className="font-semibold">Vergi Numarası:</label>
                    <input
                        name="vergiNo"
                        type="text"
                        value={profile.vergiNo}
                        onChange={handleInputChange}
                        readOnly
                        className="border p-1 w-full rounded"
                    />
                </div>

                <div>
                    <label className="font-semibold">Email:</label>
                    <input
                        name="email"
                        type="email"
                        value={editedProfile.email}
                        onChange={handleInputChange}
                        readOnly={!isEditing}
                        className="border p-1 w-full rounded"
                    />
                </div>

                <div>
                    <label className="font-semibold">Telefon Numarası:</label>
                    <input
                        name="telefonNumarasi"
                        type="tel"
                        value={editedProfile.telefonNumarasi}
                        onChange={handleInputChange}
                        readOnly={!isEditing}
                        className="border p-1 w-full rounded"
                    />
                </div>

                <div>
                    <label className="font-semibold">Şirket Adresi:</label>
                    <textArea
                        name="sirketAdresi"
                        value={editedProfile.sirketAdresi}
                        onChange={handleInputChange}
                        readOnly={!isEditing}
                        className="border p-1 w-full rounded"
                    />
                </div>

                <div>
                    <label className="font-semibold">IBAN:</label>
                    <input
                        name="iban"
                        type="text"
                        value={editedProfile.iban}
                        onChange={handleInputChange}
                        readOnly={!isEditing}
                        className="border p-1 w-full rounded"
                    />
                </div>
            </div>

            {/* Butonlar burada yer alıyor*/}
            <div className="mt-6 flex gap-4">
                {!isEditing ? (
                    <>
                    {/*Bilgilerimi güncelle butonuna tıklanmadan önce gösterilecek butonlar */}
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                        >
                            Bilgilerimi Güncelle
                        </button>

                        <button
                            onClick={handlePasswordUpdate}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                        >
                            Şifre Güncelle
                        </button>

                        <button
                            onClick={() => console.log("Etkinliklerim sayfasına yönlendirme")}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                        >
                            Etkinliklerim
                        </button>
                    </>
                ) : (
                    <>
                        {/*Bilgilerimi güncelle butonuna tıklandıktan sonra gösterilecek butonlar */}
                        <button
                            onClick={handleUpdate}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                        >
                            Güncelle
                        </button>

                        <button
                            onClick={handleCancel}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                        >
                            İptal
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default OrganizatorProfil;


