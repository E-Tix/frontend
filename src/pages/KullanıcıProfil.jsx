import React, { useEffect, useState } from "react";
import axios from "axios";
import { User, Mail, Phone, Ticket, Key, Edit, Save, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../components/UserProfile.css";

const KullaniciProfil = () => {
    const { user } = useAuth();
    const [savedInfo, setSavedInfo] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [errors, setErrors] = useState({
        email: '',
        telNo: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        axios.get("http://localhost:8080/Profile/getUserProfile", {
            headers: { Authorization: `Bearer ${user?.token}` }
        })
        .then((res) => {
            setSavedInfo(res.data);
            setUserInfo({
                ...res.data,
                telNo: formatPhoneNumber(res.data.telNo || '')
            });
        })
        .catch((err) => console.error("Veri çekme hatası:", err));
    }, [user]);

    const formatPhoneNumber = (phone) => {
        if (!phone) return '';
        const cleaned = phone.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})$/);
        if (match) {
            return `${match[1]}${match[2]} ${match[3]} ${match[4]} ${match[5]}`;
        }
        return phone;
    };

    const validateEmail = (email) => {
        const re = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        return re.test(String(email).toLowerCase());
    };

    const validatePhone = (phone) => {
        if (!phone) return true;
        const cleaned = phone.replace(/\D/g, '');
        return /^5\d{9}$/.test(cleaned);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === 'telNo') {
            formattedValue = value.replace(/[^\d\s]/g, '');
            const cleaned = formattedValue.replace(/\D/g, '');

            if (cleaned.length <= 1) {
                formattedValue = cleaned;
            } else if (cleaned.length <= 4) {
                formattedValue = `${cleaned[0]}${cleaned.substring(1)}`;
            } else if (cleaned.length <= 7) {
                formattedValue = `${cleaned[0]}${cleaned.substring(1, 4)} ${cleaned.substring(4)}`;
            } else if (cleaned.length <= 9) {
                formattedValue = `${cleaned[0]}${cleaned.substring(1, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7)}`;
            } else {
                formattedValue = `${cleaned[0]}${cleaned.substring(1, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7, 9)} ${cleaned.substring(9, 11)}`;
            }

            setErrors({
                ...errors,
                telNo: formattedValue.trim() && !validatePhone(formattedValue)
                    ? "Geçerli bir telefon numarası girin (5XX XXX XX XX)"
                    : ""
            });
        }

        if (name === 'email') {
            setErrors({
                ...errors,
                email: value.trim() && !validateEmail(value)
                    ? "Email formatı XXXX@gmail.com şeklindedir"
                    : ""
            });
        }

        setUserInfo({ ...userInfo, [name]: formattedValue });
    };

    const handleUpdate = () => {
        const newErrors = {
            email: userInfo.email && !validateEmail(userInfo.email)
                ? "Email formatı XXXX@gmail.com şeklindedir"
                : "",
            telNo: userInfo.telNo && !validatePhone(userInfo.telNo)
                ? "Geçerli bir telefon numarası girin (5XX XXX XX XX)"
                : ""
        };

        setErrors(newErrors);

        if (newErrors.email || newErrors.telNo) {
            return;
        }

        const dataToSend = {
            ...userInfo,
            telNo: userInfo.telNo ? userInfo.telNo.replace(/\D/g, '') : ''
        };

        axios.put("http://localhost:8080/Profile/updateUserInfo", dataToSend, {
            headers: { Authorization: `Bearer ${user?.token}` }
        })
        .then((res) => {
            if (res.data === true) {
                setSavedInfo(userInfo);
                setIsEditing(false);
            } else {
                alert("Güncelleme başarısız.");
            }
        })
        .catch((err) => console.error("Güncelleme hatası:", err));
    };

    const handleCancel = () => {
        setUserInfo(savedInfo);
        setIsEditing(false);
        setErrors({ email: '', telNo: '' });
    };

    const handlePasswordUpdate = () => navigate("/sifre-guncelle");

    if (!userInfo) return (
        <div className="profile-app">
            <div className="loading-spinner"></div>
        </div>
    );

    return (
        <div className="profile-app">
            <div className="bubble-background">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="bubble" style={{
                        width: `${[40, 60, 30, 50, 25][i]}px`,
                        height: `${[40, 60, 30, 50, 25][i]}px`,
                        top: `${[80, 70, 85, 75, 90][i]}%`,
                        left: `${[10, 30, 60, 80, 45][i]}%`,
                        animationDelay: `${[0, 2, 4, 1, 3][i]}s`,
                        animationDuration: `${[10, 12, 8, 15, 7][i]}s`
                    }} />
                ))}
            </div>

            <div className="profile-container">
                <div className="profile-header">
                    <div className="avatar">
                        <User size={40} />
                    </div>
                    <h1>Profil Bilgileri</h1>
                </div>

                <div className="profile-grid">
                    <div className="input-row">
                        <div className="input-group">
                            <label><User size={16} /> Kullanıcı Adı</label>
                            <input
                                name="kullaniciAdi"
                                value={userInfo.kullaniciAdi}
                                onChange={handleChange}
                                readOnly
                                className="disabled"
                            />
                        </div>

                        <div className="input-group">
                            <label><User size={16} /> Ad Soyad</label>
                            <input
                                name="adSoyad"
                                value={userInfo.adSoyad || ''}
                                onChange={handleChange}
                                readOnly={!isEditing}
                            />
                        </div>
                    </div>

                    <div className="input-row">
                        <div className="input-group">
                            <label><Mail size={16} /> Email</label>
                            <input
                                name="email"
                                type="email"
                                value={userInfo.email || ''}
                                onChange={handleChange}
                                readOnly={!isEditing}
                                placeholder="example@gmail.com"
                            />
                            {errors.email && isEditing && (
                                <div className="error-message">{errors.email}</div>
                            )}
                        </div>

                        <div className="input-group">
                            <label><Phone size={16} /> Telefon</label>
                            <input
                                name="telNo"
                                type="tel"
                                value={userInfo.telNo || ''}
                                onChange={handleChange}
                                readOnly={!isEditing}
                                placeholder="5XX XXX XX XX"
                            />
                            {errors.telNo && isEditing && (
                                <div className="error-message">{errors.telNo}</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="action-buttons">
                    {!isEditing ? (
                        <>
                            <button onClick={() => navigate("")} className="btn primary">
                                <Ticket size={16} /> Biletlerim
                            </button>
                            <button onClick={() => setIsEditing(true)} className="btn success">
                                <Edit size={16} /> Bilgileri Düzenle
                            </button>
                            <button onClick={handlePasswordUpdate} className="btn warning">
                                <Key size={16} /> Şifre Değiştir
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleUpdate}
                                className="btn success"
                                disabled={!!errors.email || !!errors.telNo}
                            >
                                <Save size={16} /> Kaydet
                            </button>
                            <button onClick={handleCancel} className="btn secondary">
                                <X size={16} /> İptal
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KullaniciProfil;