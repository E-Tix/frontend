// src/pages/Home.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";
import CategorySection from "../components/CategorySection";
import { useNavigate } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { useParams } from "react-router-dom";

const categories = ["Sinema", "Tiyatro", "Bale", "Spor", "Konferans"];

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { role } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Hoş Geldin, {user?.role || "Ziyaretçi"}!</h1>

      {categories.map((category) => (
        <CategorySection key={category} category={category} />
      ))}

      {/* Eğer kullanıcı organizatör ise sağ altta + butonu göster */}
      {user?.role === "Organizatör" && (
        <button
          onClick={() => navigate("/etkinlik-olustur")}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-800 text-white p-4 rounded-full shadow-xl"
        >
          <PlusCircle size={32} />
        </button>
      )}
    </div>
  );
};

export default Home;
