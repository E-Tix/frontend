import React from "react";

const EventCard = ({ event }) => {
  return (
    <div className="min-w-[200px] bg-white rounded-lg shadow-md p-4">
      <img src={event.kapakFotografi} alt={event.etkinlikAdi} className="w-full h-40 object-cover rounded-md mb-3" />
      <h3 className="font-bold text-lg mb-1">{event.etkinlikAdi}</h3>
      <p className="text-sm text-gray-600 mb-2">{event.etkinlikAciklamasi}</p>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">Bilet: ${event.biletFiyati}</span>
        <span className="text-sm text-gray-500">{event.yasSiniri}+ Yaş</span>
      </div>
    </div>
  );
};

export default EventCard;
