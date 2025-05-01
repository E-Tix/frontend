import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProfileRedirect = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/chooserole" replace />;
  }

  if (user.role === "Kullanıcı") {
    return <Navigate to="/profil/Kullanıcı" replace />;
  }

  if (user.role === "Organizatör") {
    return <Navigate to="/profil/Organizatör" replace />;
  }

  if (user.role === "Admin") {
    return <Navigate to="/profil/Admin" replace />;
  }

  return <Navigate to="/" replace />; // rol tanımsızsa ana sayfaya
};

export default ProfileRedirect;
