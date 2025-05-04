import React from "react";
import { useNavigate } from "react-router-dom";
import "./EtkinlikKart.css";

const EventCard = ({ etkinlik }) => {
    const navigate = useNavigate();

    return (
        <div className="etkinlik-kart" onClick={() => navigate(`/etkinlik/${etkinlik.id}`)}>
            <div className="kapak-container">
                <img
                    src={`http://localhost:8080/uploads/${etkinlik.kapakFotografi}`}
                    alt="Kapak"
                    className="kapak-foto"
                />
                {etkinlik.yasSiniri && (
                    <span className="yas-etiketi">{etkinlik.yasSiniri}+</span>
                )}
            </div>
            <div className="etkinlik-bilgi">
                <h4>{etkinlik.etkinlikAdi}</h4>
                <p>{etkinlik.olusturulmaTarihi}</p>
                <p>Süre: {etkinlik.etkinlikSuresi} dk</p>
            </div>
        </div>
    );
};

export default EventCard;
