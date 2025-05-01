import React, { useEffect, useState } from "react";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const KullaniciProfil = () => {
  const { user } = useAuth();
  const [savedInfo, setSavedInfo] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Bilgileri çek
  useEffect(() => {
    axios
      .get("http://localhost:8080/Profile/getUserProfile", {
        headers: {
          Authorization: `Bearer ${user?.token}`, // Eğer JWT varsa
        },
      })
      .then((res) => {
        setSavedInfo(res.data);
        setUserInfo(res.data);
      })
      .catch((err) => console.error("Veri çekme hatası:", err));
  }, [user]);

  const handleChange = (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  const handleUpdate = () => {
    axios
      .put("http://localhost:8080/Profile/updateUserInfo", userInfo, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
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
  };

  const handlePasswordUpdate = () => {
      // Şifre güncelleme sayfasına yönlendir
      navigate("/sifre-guncelle");
    };

  if (!userInfo) return <div>Yükleniyor...</div>;

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 border rounded-xl shadow-lg bg-white space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Kullanıcı Profili</h2>

        <div>
          <label className="font-semibold">Kullanıcı Adı:</label>
          <input
            name="kullaniciAdi"
            type="text"
            value={userInfo.kullaniciAdi}
            onChange={handleChange}
            readOnly
            className="border px-2 py-1 rounded w-full"
          />
        </div>
      <div>
        <label className="font-semibold">Ad Soyad:</label>
        <input
          name="adSoyad"
          type="text"
          value={userInfo.adSoyad}
          onChange={handleChange}
          readOnly={!isEditing}
          className="border px-2 py-1 rounded w-full"
        />
      </div>

      <div>
        <label className="font-semibold">Email:</label>
        <input
          name="email"
          type="email"
          value={userInfo.email}
          onChange={handleChange}
          readOnly={!isEditing}
          className="border px-2 py-1 rounded w-full"
        />
      </div>

      {/*<div>
        <label className="font-semibold">Şifre:</label>
        <div className="flex items-center gap-2">
          <input
            type={showPassword ? "text" : "password"}
            value="******"
            readOnly
            className="border px-2 py-1 rounded w-full"
          />
          <button onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>*/}

      {/*<div>
        <label className="font-semibold">Doğum Tarihi:</label>
        <input
          name="birthDate"
          type="date"
          value={userInfo.birthDate || ""}
          onChange={handleChange}
          readOnly={!isEditing}
          className="border px-2 py-1 rounded w-full"
        />
      </div>*/}

      <div>
        <label className="font-semibold">Telefon:</label>
        <input
          name="telNo"
          type="tel"
          value={userInfo.telNo}
          onChange={handleChange}
          readOnly={!isEditing}
          className="border px-2 py-1 rounded w-full"
        />
      </div>

      <div className="flex flex-wrap gap-4 mt-6">
        {!isEditing ? (
          <>
            <button
              onClick={() => console.log("Biletlerim sayfasına yönlendirme")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Biletlerim
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Bilgileri Güncelle
            </button>
            <button
              onClick={handlePasswordUpdate}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
            >
              Şifre Güncelle
            </button>
          </>
        ) : (
          <>
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

export default KullaniciProfil;
