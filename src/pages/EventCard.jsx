import React from "react";
import { useNavigate } from "react-router-dom";

const EventCard = ({ etkinlik }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (etkinlik?.etkinlikID) {
        navigate(`/etkinlik/${etkinlik.etkinlikID}`);
      } else {
        console.error("Etkinlik ID bulunamadı.");
      } // Etkinlik detay sayfasına yönlendir
  };

  return (
    <div
      className="relative w-64 h-72 border rounded overflow-hidden shadow hover:shadow-lg cursor-pointer"
      onClick={handleCardClick} // Kart tıklama olayını bağladık
    >
      <div className="relative h-2/3">
        <img
          src={etkinlik.kapakFotografi}
          alt={etkinlik.etkinlikAdi}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 right-0 bg-red-600 text-white px-2 py-1 text-sm rounded-bl">
          +{etkinlik.yasSiniri}
        </div>
      </div>
      <div className="p-2 h-1/3 flex flex-col justify-between">
        <h3 className="font-semibold text-md">{etkinlik.etkinlikAdi}</h3>
        <p className="text-sm text-gray-500">{etkinlik.etkinlikSuresi} dakika</p>
      </div>
    </div>
  );
};

export default EventCard;
