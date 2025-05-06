import React, { useEffect, useState } from 'react';
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import '../components/OrganizatorHomePage.css'; // CSS için stil dosyası

const OrganizatorHomePage = () => {
  const [etkinlikler, setEtkinlikler] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:8080/organizatorMainPage/', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // varsa token
      },
    })
    .then(response => {
      setEtkinlikler(response.data.content);
       console.log(response.data.content)// Page objesi dönüyor, bu yüzden .content
    })
    .catch(error => {
      console.error('Etkinlikler yüklenemedi:', error);
    });
  }, []);

  return (
    <div className="etkinlikler-container">
      {etkinlikler.map(etkinlik => (
        <div key={etkinlik.id} className="etkinlik-kart">
          <div className="kapak-container">
            <img
              src={etkinlik.kapakFotografi || 'https://via.placeholder.com/300x200'}
              alt={etkinlik.etkinlikAdi}
              className="kapak-fotografi"
            />
            <span className="yas-siniri">{etkinlik.yasSiniri}+ </span>
          </div>
          <h3>{etkinlik.etkinlikAdi}</h3>
          <p>Süre: {etkinlik.etkinlikSuresi} dakika</p>
        </div>
      ))}
        <button
            className="plus-button"
            onClick={() => navigate("/etkinlik-olustur")}
        >
            <Plus size={28} />
        </button>
    </div>
  );
};

export default OrganizatorHomePage;
