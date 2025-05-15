import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";
import EventCard from "./EventCard";
import "../components/EtkinlikTurSayfasi.css";

const capitalizeFirstLetter = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const EtkinlikTurSayfasi = () => {
  const { tur } = useParams(); // Örn: "sinema"
  const [etkinlikler, setEtkinlikler] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEtkinliklerData = useCallback(async () => {
      if (!tur) return;
      setIsLoading(true);
      setError(null);
      try {
        const formattedTurAdi = capitalizeFirstLetter(tur);
        console.log(`EtkinlikTurSayfasi: Fetching events for tur: ${formattedTurAdi}`);

        const response = await axios.get("/mainPage/", { // Backend endpoint'i
          params: {
            etkinlikTurAdi: formattedTurAdi,
            page: 0,
            size: 50, // Sayfa başına gösterilecek etkinlik sayısı, artırılabilir
          },
        });
        if (response.data && response.data.content) {
          setEtkinlikler(response.data.content);
        } else {
          setEtkinlikler([]);
        }
      } catch (err) {
        console.error(`Etkinlik türüne (${tur}) göre veri alınamadı:`, err);
        setError(`Etkinlikler yüklenirken bir sorun oluştu.`);
        setEtkinlikler([]);
      } finally {
        setIsLoading(false);
      }
    }, [tur]);

    useEffect(() => {
      fetchEtkinliklerData();
    }, [fetchEtkinliklerData]);

    if (isLoading) {
      return <div className="page-loading">Yükleniyor...</div>;
    }

    if (error) {
      return <div className="page-error">{error}</div>;
    }

  return (
    <div className="etkinlik-tur-sayfasi">
      <h2 className="etkinlik-tur-baslik">{capitalizeFirstLetter(tur)} Etkinlikleri</h2>
      <div className="etkinlikler-grid">
        {etkinlikler.length === 0 ? (
          <p className="etkinlik-yok">Bu kategoriye ait etkinlik bulunamadı.</p>
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
