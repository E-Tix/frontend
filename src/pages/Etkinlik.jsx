import React, { useEffect, useState } from "react";
import axios from "../api/axios.js";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Etkinlik = () => {
  const { eventId } = useParams();
  const [etkinlik, setEtkinlik] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const eventIdLong = Number(eventId);

  useEffect(() => {
    const fetchEtkinlik = async () => {
      try {
        const response = await axios.get(`/mainPage/${eventIdLong}`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        setEtkinlik(response.data);
      } catch (error) {
        console.error("Etkinlik bilgileri alınırken hata oluştu:", error);
      }
    };
    fetchEtkinlik();
  }, [eventIdLong, user?.token]);

  if (!etkinlik) {
    return <div className="event-loading">Yükleniyor...</div>;
  }

  const handleSalonSeansClick = (seansId) => {
    navigate(`/koltuk-secimi/${seansId}`);
  };

  return (
    <div className="event-container">
      {/* Event Header Section */}
      <div className="event-header">
        {/* Left Section - Event Info */}
        <div className="event-info">
          <h1 className="event-title">{etkinlik.etkinlikAdi}</h1>
          <span className="event-genre">{etkinlik.etkinlikTur.etkinlikTurAdi}</span>
          <p className="event-description">{etkinlik.etkinlikAciklamasi}</p>
          <div className="event-price">
            <span>{etkinlik.biletFiyati} TL</span>
          </div>
        </div>

        {/* Right Section - Event Poster */}
        <div className="event-poster">
          <img
            src={etkinlik.kapakFotografi}
            alt={etkinlik.etkinlikAdi}
            className="poster-image"
          />
          <div className="age-restriction">+{etkinlik.yasSiniri}</div>
        </div>
      </div>

      {/* Sessions Section */}
      <div className="sessions-container">
        <h2 className="sessions-title">Seanslar</h2>
        {etkinlik.etkinlikSalonSeansEntities.map((salonSeans) => (
          <div
            key={salonSeans.etkinlikSalonSeansID}
            className="session-card"
          >
            <div className="session-info">
              <h3 className="theater-name">{salonSeans.salon.salonAdi}</h3>
              <p className="theater-address">{salonSeans.salon.adres}</p>
              <p className="session-time">
                {new Date(salonSeans.seans.tarih).toLocaleDateString()} -{" "}
                {new Date(salonSeans.seans.tarih).toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={() => handleSalonSeansClick(salonSeans.seans.seansID)}
              className="seat-selection-btn"
            >
              Koltuk Seç
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Etkinlik;