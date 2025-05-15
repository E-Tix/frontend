import React, { useEffect, useState } from "react";
import axios from "axios";
import { User, Mail, Phone, Ticket, Key, Edit, Save, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../components/UserProfile.css";

const AdminProfil = () => {
    const { user } = useAuth();
    const [savedInfo, setSavedInfo] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get("http://localhost:8080/admin/getAdminProfile", {
            headers: { Authorization: `Bearer ${user?.token}` }
        })
        .then((res) => {
            setSavedInfo(res.data);
            setUserInfo({
                ...res.data,

            });
        })
        .catch((err) => console.error("Veri çekme hatası:", err));
    }, [user]);

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
                            <label><Mail size={16} /> Email</label>
                            <input
                                name="email"
                                type="email"
                                value={userInfo.email || ''}
                                readOnly
                                placeholder="example@gmail.com"
                            />
                        </div>
                    </div>
                </div>

                <div className="action-buttons">
                    <button onClick={handlePasswordUpdate} className="btn warning">
                        <Key size={16} /> Şifre Değiştir
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminProfil;
