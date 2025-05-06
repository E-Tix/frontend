import React, { useEffect, useState } from "react";
import axios from "../api/axios.js";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Etkinlik = () => {
  const { eventId } = useParams(); // URL parametresinden etkinlik ID'sini al
  const [etkinlik, setEtkinlik] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const eventIdLong = Number(eventId);
  console.log("eventId:", eventId);


  useEffect(() => {
    const fetchEtkinlik = async () => {
      try {
        const response = await axios.get(`/mainPage/${eventIdLong}`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        console.log("Etkinlik Verisi:", response.data);
        setEtkinlik(response.data);
      } catch (error) {
        console.error("Etkinlik bilgileri alınırken hata oluştu:", error);
      }
    };
    fetchEtkinlik();
  }, [eventIdLong, user?.token]);

  if (!etkinlik) {
    return <div>Yükleniyor...</div>;
  }

  const handleSalonSeansClick = (seansId) => {
    navigate(`/koltuk-secimi/${seansId}`);
  };

  return (
    <div className="p-6">
      {/* Etkinlik Üst Bilgi */}
      <div className="flex justify-between mb-8">
        {/* Sol Kısım */}
        <div className="flex flex-col space-y-4">
          <h1 className="text-3xl font-bold">{etkinlik.etkinlikAdi}</h1>
          <p className="text-lg">{etkinlik.etkinlikTur.etkinlikTurAdi}</p>
          <p className="text-gray-700">{etkinlik.etkinlikAciklamasi}</p>
          <button
            disabled
            className="bg-blue-500 text-white py-2 px-4 rounded-md cursor-not-allowed"
          >
            Bilet Al - {etkinlik.biletFiyati} TL
          </button>
        </div>

        {/* Sağ Kısım (Kapak Fotoğrafı) */}
        <div className="relative">
          <img
            src={etkinlik.kapakFotografi}
            alt={etkinlik.etkinlikAdi}
            className="w-64 h-96 object-cover rounded-md"
          />
          <div className="absolute top-0 right-0 bg-red-600 text-white text-xs px-2 py-1 rounded-bl">
            +{etkinlik.yasSiniri}
          </div>
        </div>
      </div>

      {/* Salon ve Seans Bilgisi */}
      <div className="space-y-8">
        {etkinlik.etkinlikSalonSeansEntities.map((salonSeans) => (
          <div
            key={salonSeans.etkinlikSalonSeansID}
            className="max-w-full border rounded-lg shadow-md overflow-hidden"
          >
            <div className="flex justify-between p-4">
              <div className="flex flex-col">
                <h3 className="font-semibold">{salonSeans.salon.salonAdi}</h3>
                <p className="text-sm text-gray-600">{salonSeans.salon.adres}</p>
                <p className="text-sm text-gray-500">
                  {new Date(salonSeans.seans.tarih).toLocaleDateString()} -{" "}
                  {new Date(salonSeans.seans.tarih).toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={() => handleSalonSeansClick(salonSeans.seans.seansID)}
                className="bg-green-500 text-white py-2 px-4 rounded-md"
              >
                Koltuk Seç
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Etkinlik;
