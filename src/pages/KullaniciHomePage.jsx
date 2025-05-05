import React, { useEffect, useState } from "react";
import axios from "../api/axios.js";
import HorizontalScrollSection from "./HorizontalScrollSection.jsx"; // her tür için
import { useNavigate } from "react-router-dom";
import { useCity } from "../context/CityContext";

const etkinlikTurleri = ["Sinema", "Tiyatro", "Bale", "Konferans", "Spor"];

const KullaniciHomePage = () => {
  const { selectedCity } = useCity();
  const [sehir, setSehir] = useState(null);
  const [etkinlikler, setEtkinlikler] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    etkinlikTurleri.forEach((tur) => {
      fetchEtkinlikler(tur, selectedCity?.sehirAdi);
    });
  }, [selectedCity]);

  const fetchEtkinlikler = async (tur, sehirAdi) => {
    try {
      const response = await axios.get("/mainPage/", {
        params: {
          etkinlikTurAdi: tur,
          sehirAdi: sehirAdi || undefined,
          page: 0,
          size: 10,
        },
      });
      setEtkinlikler((prev) => ({
        ...prev,
        [tur]: response.data.content,
      }));
    } catch (error) {
      console.error("Etkinlikler alınırken hata oluştu:", error);
    }
  };


  const handleSehirChange = (e) => {
    const value = e.target.value;
    setSehir(value === "Hepsi" ? null : value);
  };

  return (
    <div className="p-6">


      {etkinlikTurleri.map((tur) => (
        <HorizontalScrollSection
          key={tur}
          title={tur}
          etkinlikler={etkinlikler[tur] || []}
          onTitleClick={() => navigate(`/etkinlikler/${tur.toLowerCase()}`)}
        />
      ))}
    </div>
  );
};

export default KullaniciHomePage;
