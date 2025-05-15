import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (emailOrUsername, password, role) => {
    try {
      let url = "";
      let payload = {};

      if (role === "Kullanıcı") {
        url = "/login/user";
        payload = {
          kullaniciAdi: emailOrUsername,
          sifre: password,
        };
      } else if (role === "Organizatör") {
        url = "/login/organizator";
        payload = {
          email: emailOrUsername,
          sifre: password,
        };
      } else if(role === "Admin"){
          url = "/login/admin";
          payload = {
              email: emailOrUsername,
              sifre: password,
          };
      }else {
        throw new Error("Geçersiz rol seçimi");
      }

      const response = await axios.post(url, payload);

      const token = response.data; // Backend bize token döndürüyor

      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const email = decodedToken.sub;

      const userData = { token, role }; // Kullanıcı bilgilerini ve token'ı kaydediyoruz

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      if (role === "Organizatör"){
          navigate("/organizatör-home")
      }else if (role === "Kullanıcı"){
          navigate("/kullanıcı-home"); // Giriş başarılıysa ana sayfaya yönlendir
      }else if (role === "Admin"){
          navigate("/admin-home");
      }else{
          navigate("/");
      }

    } catch (error) {
      console.error("Giriş hatası:", error);
      throw error;
    }
  };

  const register = async (userInfo, role) => {
    try {
      const url =
        role === "Kullanıcı" ? "/signup/kullanici" :
        role === "Organizatör" ? "/signup/organizator" :
        null;

      if (!url) throw new Error("Geçersiz kayıt rolü");

      const response = await axios.post(url, userInfo);

      const userData = response.data;
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      navigate("/");
    } catch (error) {
      console.error("Kayıt hatası:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/");
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  if (loading) return <div>Loading...</div>;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
