import React, { useEffect, useState } from "react";
import axios from "axios";
import { User, Mail, Phone, Key, Edit, Save, X, Home, CreditCard } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../components/OrganizatorProfile.css";

const OrganizatorProfil = () => {
    const { user } = useAuth();
    const [savedInfo, setSavedInfo] = useState(null);
    const [organizatorInfo, setOrganizatorInfo] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [errors, setErrors] = useState({
        email: '',
        telefonNumarasi: '',
        iban: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        axios.get("http://localhost:8080/orgProfile/getOrganizatorProfile", {
            headers: { Authorization: `Bearer ${user?.token}` }
        })
        .then((res) => {
            setSavedInfo(res.data);
            setOrganizatorInfo({
                ...res.data,
                telefonNumarasi: formatPhoneNumber(res.data.telefonNumarasi || '')
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

    const formatIBAN = (iban) => {
        if (!iban) return '';
        const cleaned = iban.replace(/\s/g, '').toUpperCase();
        if (cleaned.length > 2) {
            return `${cleaned.substring(0, 2)} ${cleaned.substring(2, 6)} ${cleaned.substring(6, 10)} ${cleaned.substring(10, 14)} ${cleaned.substring(14, 18)} ${cleaned.substring(18, 22)} ${cleaned.substring(22, 26)}`;
        }
        return cleaned;
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

    const validateIBAN = (iban) => {
        if (!iban) return true;
        return /^TR\d{22}$/i.test(iban.replace(/\s/g, ''));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === 'telefonNumarasi') {
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
                telefonNumarasi: formattedValue.trim() && !validatePhone(formattedValue)
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

        if (name === 'iban') {
            const cleaned = value.replace(/\s/g, '').toUpperCase();
            formattedValue = formatIBAN(cleaned);

            setErrors({
                ...errors,
                iban: cleaned && !validateIBAN(cleaned)
                    ? "Geçerli bir IBAN girin (TRXX XXXX XXXX XXXX XXXX XXXX XX)"
                    : ""
            });
        }

        setOrganizatorInfo({ ...organizatorInfo, [name]: formattedValue });
    };

    const handleUpdate = () => {
        const newErrors = {
            email: organizatorInfo.email && !validateEmail(organizatorInfo.email)
                ? "Email formatı XXXX@gmail.com şeklindedir"
                : "",
            telefonNumarasi: organizatorInfo.telefonNumarasi && !validatePhone(organizatorInfo.telefonNumarasi)
                ? "Geçerli bir telefon numarası girin (5XX XXX XX XX)"
                : "",
            iban: organizatorInfo.iban && !validateIBAN(organizatorInfo.iban)
                ? "Geçerli bir IBAN girin (TRXX XXXX XXXX XXXX XXXX XXXX XX)"
                : ""
        };

        setErrors(newErrors);

        if (newErrors.email || newErrors.telefonNumarasi || newErrors.iban) {
            return;
        }

        const dataToSend = {
            ...organizatorInfo,
            telefonNumarasi: organizatorInfo.telefonNumarasi ? organizatorInfo.telefonNumarasi.replace(/\D/g, '') : '',
            iban: organizatorInfo.iban ? organizatorInfo.iban.replace(/\s/g, '') : ''
        };

        axios.put("http://localhost:8080/orgProfile/updateOrganizatorInfo/save", dataToSend, {
            headers: { Authorization: `Bearer ${user?.token}` }
        })
        .then((res) => {
            if (res.data === true) {
                setSavedInfo(organizatorInfo);
                setIsEditing(false);
            } else {
                alert("Güncelleme başarısız.");
            }
        })
        .catch((err) => console.error("Güncelleme hatası:", err));
    };

    const handleCancel = () => {
        setOrganizatorInfo(savedInfo);
        setIsEditing(false);
        setErrors({ email: '', telefonNumarasi: '', iban: '' });
    };

    const handlePasswordUpdate = () => navigate("/sifre-guncelle");

    if (!organizatorInfo) return (
        <div className="profil-organizator-app">
            <div className="profil-organizator-loading-spinner"></div>
        </div>
    );

    return (
        <div className="profil-organizator-app">
            <div className="profil-organizator-bubble-background">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="profil-organizator-bubble" style={{
                        width: `${[40, 60, 30, 50, 25][i]}px`,
                        height: `${[40, 60, 30, 50, 25][i]}px`,
                        top: `${[80, 70, 85, 75, 90][i]}%`,
                        left: `${[10, 30, 60, 80, 45][i]}%`,
                        animationDelay: `${[0, 2, 4, 1, 3][i]}s`,
                        animationDuration: `${[10, 12, 8, 15, 7][i]}s`
                    }} />
                ))}
            </div>

            <div className="profil-organizator-container">
                <div className="profil-organizator-header">
                    <div className="profil-organizator-avatar">
                        <User size={40} />
                    </div>
                    <h1>Organizatör Profili</h1>
                </div>

                <div className="profil-organizator-grid">
                    <div className="profil-organizator-input-row">
                        <div className="profil-organizator-input-group">
                            <label><User size={16} /> Ad Soyad</label>
                            <input
                                name="adSoyad"
                                value={organizatorInfo.adSoyad || ''}
                                onChange={handleChange}
                                readOnly={!isEditing}
                            />
                        </div>

                        <div className="profil-organizator-input-group">
                            <label><User size={16} /> T.C. Kimlik No</label>
                            <input
                                name="tckNo"
                                value={organizatorInfo.tckNo || ''}
                                readOnly
                                className="profil-organizator-disabled"
                            />
                        </div>

                        <div className="profil-organizator-input-group">
                            <label><Mail size={16} /> Email</label>
                            <input
                                name="email"
                                type="email"
                                value={organizatorInfo.email || ''}
                                onChange={handleChange}
                                readOnly={!isEditing}
                                placeholder="example@gmail.com"
                                className={errors.email && isEditing ? 'profil-organizator-invalid' : ''}
                            />
                            {errors.email && isEditing && (
                                <div className="profil-organizator-error-message">{errors.email}</div>
                            )}
                        </div>
                    </div>

                    <div className="profil-organizator-input-row">
                        <div className="profil-organizator-input-group">
                            <label><User size={16} /> Vergi Numarası</label>
                            <input
                                name="vergiNo"
                                value={organizatorInfo.vergiNo || ''}
                                readOnly
                                className="profil-organizator-disabled"
                            />
                        </div>

                        <div className="profil-organizator-input-group">
                            <label><Phone size={16} /> Telefon Numarası</label>
                            <input
                                name="telefonNumarasi"
                                type="tel"
                                value={organizatorInfo.telefonNumarasi || ''}
                                onChange={handleChange}
                                readOnly={!isEditing}
                                placeholder="5XX XXX XX XX"
                                className={errors.telefonNumarasi && isEditing ? 'profil-organizator-invalid' : ''}
                            />
                            {errors.telefonNumarasi && isEditing && (
                                <div className="profil-organizator-error-message">{errors.telefonNumarasi}</div>
                            )}
                        </div>

                        <div className="profil-organizator-input-group">
                            <label><CreditCard size={16} /> IBAN</label>
                            <input
                                name="iban"
                                type="text"
                                value={organizatorInfo.iban || ''}
                                onChange={handleChange}
                                readOnly={!isEditing}
                                placeholder="TRXX XXXX XXXX XXXX XXXX XXXX XX"
                                className={errors.iban && isEditing ? 'profil-organizator-invalid' : ''}
                            />
                            {errors.iban && isEditing && (
                                <div className="profil-organizator-error-message">{errors.iban}</div>
                            )}
                        </div>
                    </div>

                    <div className="profil-organizator-input-row">
                        <div className="profil-organizator-input-group profil-organizator-full-width">
                            <label><Home size={16} /> Şirket Adresi</label>
                            <textarea
                                name="sirketAdresi"
                                value={organizatorInfo.sirketAdresi || ''}
                                onChange={handleChange}
                                readOnly={!isEditing}
                                rows={3}
                            />
                        </div>
                    </div>
                </div>

                <div className="profil-organizator-action-buttons">
                    {!isEditing ? (
                        <>
                            <button onClick={() => navigate()} className="profil-organizator-btn profil-organizator-primary">
                                Etkinliklerim
                            </button>
                            <button onClick={() => setIsEditing(true)} className="profil-organizator-btn profil-organizator-success">
                                <Edit size={16} /> Bilgileri Düzenle
                            </button>
                            <button onClick={handlePasswordUpdate} className="profil-organizator-btn profil-organizator-warning">
                                <Key size={16} /> Şifre Değiştir
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleUpdate}
                                className="profil-organizator-btn profil-organizator-success"
                                disabled={!!errors.email || !!errors.telefonNumarasi || !!errors.iban}
                            >
                                <Save size={16} /> Kaydet
                            </button>
                            <button onClick={handleCancel} className="profil-organizator-btn profil-organizator-secondary">
                                <X size={16} /> İptal
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrganizatorProfil;