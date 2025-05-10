import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";
import EventCard from "./EventCard";
import "../components/EtkinlikTurSayfasi.css";

const capitalizeFirstLetter = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const EtkinlikTurSayfasi = () => {
  const { tur } = useParams(); // Örn: "sinema"
  const [etkinlikler, setEtkinlikler] = useState([]);

  useEffect(() => {
    const fetchEtkinlikler = async () => {
      try {
        const response = await axios.get("/mainPage/", {
          params: {
            etkinlikTurAdi: capitalizeFirstLetter(tur),
            page: 0,
            size: 100, // Daha fazla etkinlik almak için
          },
        });
        setEtkinlikler(response.data.content || []);
      } catch (error) {
        console.error("Etkinlik türüne göre veri alınamadı:", error);
      }
    };

    fetchEtkinlikler();
  }, [tur]);

  return (
    <div className="etkinlik-tur-sayfasi">
      <h2 className="etkinlik-tur-baslik">{capitalizeFirstLetter(tur)} Etkinlikleri</h2>
      <div className="etkinlikler-grid">
        {etkinlikler.length === 0 ? (
          <p>Bu kategoriye ait etkinlik bulunamadı.</p>
        ) : (
          etkinlikler.map((etkinlik) => (
            <EventCard key={etkinlik.etkinlikID} etkinlik={etkinlik} />
          ))
        )}
      </div>
    </div>
  );
};

export default EtkinlikTurSayfasi;
