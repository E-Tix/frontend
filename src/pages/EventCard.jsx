import React from "react";
import { useNavigate } from "react-router-dom";
import "../components/EventCard.css";

const EventCard = ({ etkinlik }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (etkinlik?.etkinlikID) {
      navigate(`/etkinlik/${etkinlik.etkinlikID}`);
    } else {
      console.error("Etkinlik ID bulunamadı.");
    }
  };

  return (
    <div className="event-card" onClick={handleCardClick}>
      <div className="card-image-container">
        <img
          src={etkinlik.kapakFotografi || 'https://via.placeholder.com/300x200'}
          alt={etkinlik.etkinlikAdi}
          className="card-image"
        />
        {etkinlik.yasSiniri && (
          <span className="age-badge">+{etkinlik.yasSiniri}</span>
        )}
        {etkinlik.ucret && (
          <span className="price-tag">{etkinlik.ucret} TL</span>
        )}
      </div>
      <div className="card-content">
        <h3 className="card-title">{etkinlik.etkinlikAdi}</h3>
        {etkinlik.etkinlikSuresi && (
          <p className="card-duration">{etkinlik.etkinlikSuresi} dakika</p>
        )}
      </div>
    </div>
  );
};

export default EventCard;