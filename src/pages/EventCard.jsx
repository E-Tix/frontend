import React from "react";
import { useNavigate } from "react-router-dom";
import "../components/EventCard.css";

const EventCard = ({ etkinlik }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
      if (etkinlik?.etkinlikID) {
        const turAdi = etkinlik.etkinlikTur?.etkinlikTurAdi; // EtkinlikEntity'den tür adını al

        if (turAdi) {
        console.log(`EventCard Click: ID=${etkinlik.etkinlikID}, Tür=${turAdi}`);
        navigate(`/etkinlik/${etkinlik.etkinlikID}?tur=${encodeURIComponent(turAdi)}`);
        } else {
        console.warn("EventCard: Etkinlik türü bilgisi EtkinlikEntity'de bulunamadı. Sadece ID ile yönlendiriliyor.", etkinlik);
        navigate(`/etkinlik/${etkinlik.etkinlikID}`);
        }
      } else {
        console.error("EventCard: Etkinlik ID bulunamadı.", etkinlik);
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
        {etkinlik.biletFiyati && (
          <span className="price-tag">{etkinlik.biletFiyati.toFixed(2)} TL</span>
        )}
      </div>
      <div className="card-content">
        <h3 className="card-title">{etkinlik.etkinlikAdi}</h3>
        {typeof etkinlik.etkinlikSuresi === 'number' && etkinlik.etkinlikSuresi > 0 && (
          <p className="card-duration">{etkinlik.etkinlikSuresi} dakika</p>
        )}
      </div>
    </div>
  );
};

export default EventCard;