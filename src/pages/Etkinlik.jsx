import React, { useEffect, useState, useCallback } from "react";
import axios from "../api/axios.js";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../components/Etkinlik.css";
import fragmanIcon from "../assets/fragmanIcon.png";
//Fragman görüntülenmesi için
import { XCircle } from 'lucide-react';

//video içeriği oynatılsın diye
const getEmbedUrl = (url) => {
    if (!url) return null;

    // Basic YouTube embed URL conversion
    const youtubeMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/);
    if (youtubeMatch && youtubeMatch[1]) {
        // Add autoplay=1 and modestbranding=1 for better popup experience
        return `https://www.youtube.com/embed/${youtubeMatch[1].split('&')[0]}?autoplay=1&modestbranding=1`;
    }

    // Basic Vimeo embed URL conversion
    const vimeoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com)\/(.+)/);
    if (vimeoMatch && vimeoMatch[1]) {
         // Add autoplay=1 for better popup experience
        return `https://player.vimeo.com/video/${vimeoMatch[1].split('?')[0]}?autoplay=1`;
    }

    // Return original URL if not recognized (might not work as embed)
    console.warn("Unknown video URL format, using original:", url);
    return url;
};

const Etkinlik = () => {
  const { eventId } = useParams();
  const location = useLocation();
  //const [etkinlik, setEtkinlik] = useState(null); //Bu artık gereksiz gibi ama emin olmak için silmedim
  const navigate = useNavigate();
  const { user } = useAuth();

  const [detay, setDetay] = useState(null); // Hem EtkinlikDetayDto hem de SinemaDetayDto için ortak state
  const [isSinema, setIsSinema] = useState(false); // Etkinliğin sinema olup olmadığını tutar
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const eventIdLong = Number(eventId);

  //Fragman popup'ı açık mı kapalı mı kontrol için
  const [isTrailerPopupOpen, setIsTrailerPopupOpen] = useState(false);

  const fetchEtkinlikDetayi = useCallback(async () => {
      if (!eventIdLong) {
        setError("Geçersiz Etkinlik ID.");
        setIsLoading(false);
        return;
      }

      const queryParams = new URLSearchParams(location.search);
      const etkinlikTuruQuery = queryParams.get('tur'); // EventCard'dan gelen ?tur=Değer

      setIsLoading(true);
      setError(null);
      setDetay(null); // Önceki detayı temizle
      setIsSinema(false);

      try {
        let endpoint = '';
        let fetchedIsSinema = false;

        if (etkinlikTuruQuery && etkinlikTuruQuery.toLowerCase() === 'sinema') {
          endpoint = `/mainPage/sinema/${eventIdLong}`; // SinemaDetayDto bekliyoruz
          fetchedIsSinema = true;
          console.log(`Etkinlik.jsx: Fetching SİNEMA detayı: ${endpoint}`);
        } else {
          endpoint = `/mainPage/${eventIdLong}`; // EtkinlikDetayDto bekliyoruz
          // Eğer tür query'den gelmediyse, bu endpoint'ten gelen yanıttaki türü kontrol edebiliriz.
          console.log(`Etkinlik.jsx: Fetching NORMAL etkinlik detayı: ${endpoint}`);
        }

        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });

        if (response.data) {
          setDetay(response.data);
          if (fetchedIsSinema) {
              setIsSinema(true);
          } else {
              const turAdiApi = response.data.etkinlikTur?.etkinlikTurAdi;
              if (turAdiApi && turAdiApi.toLowerCase() === 'sinema') {
                  setIsSinema(true);
                  console.warn("Etkinlik.jsx: Normal endpoint sinema türünde etkinlik döndürdü. Görüntüleme eksik olabilir. Tür query parametresiyle gelinmeliydi.");
              }
          }
        } else {
          throw new Error("Etkinlik detayı alınamadı veya boş.");
        }
      } catch (err) {
        console.error("Etkinlik detayları alınırken hata oluştu:", err);
        setError("Etkinlik bilgileri yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.");
      } finally {
        setIsLoading(false);
      }
    }, [eventIdLong, user?.token, location.search]);

    useEffect(() => {
      fetchEtkinlikDetayi();
    }, [fetchEtkinlikDetayi]);

    if (isLoading) {
      return <div className="event-loading">Yükleniyor...</div>;
    }

    if (error) {
      return <div className="event-error-container"><p>{error}</p></div>;
    }

    if (!detay) {
      return <div className="event-error-container"><p>Etkinlik bulunamadı.</p></div>;
    }

    // Render edilecek veriyi DTO yapısına göre belirliyoruz
    // `detay` state'i ya EtkinlikDetayDto ya da SinemaDetayDto olacak.
    const etkinlikRenderData = isSinema ? detay.etkinlikDetayDto : detay;
    const sinemaOzelRenderData = isSinema ? detay : null;

    // etkinlikRenderData'nın varlığını kontrol et (özellikle sinema durumunda iç DTO için)
    if (!etkinlikRenderData || typeof etkinlikRenderData.etkinlikID === 'undefined') {
        return <div className="event-error-container"><p>Etkinlik temel bilgileri yüklenemedi.</p></div>;
    }

    // Fragman linkini embed formatına dönüştür
    const embedTrailerUrl = sinemaOzelRenderData?.fragmanLinki ? getEmbedUrl(sinemaOzelRenderData.fragmanLinki) : null;

    const handleSalonSeansClick = (seansId, salonId, etkinlikId) => {
      if (!seansId || !salonId || !etkinlikId) {
          console.error("Bilet al için gerekli ID'ler eksik:", {seansId, salonId, etkinlikId});
          alert("Seans veya salon bilgisi eksik, bilet alma işlemi yapılamaz.");
          return;
      }
      navigate(`/bilet-al/${seansId}/${salonId}/${etkinlikId}`);
    };

    // Popup'ı kapatma fonksiyonu
    const closeTrailerPopup = () => {
        setIsTrailerPopupOpen(false);
    };

    return (
        <div className="event-container">
            {/* Event Header Section */}
            <div className="event-header">
                {/* Left Section - Event Info */}
                <div className="event-info">
                    <h1 className="event-title">{etkinlikRenderData.etkinlikAdi}</h1>
                    <span className="event-genre">{etkinlikRenderData.etkinlikTur?.etkinlikTurAdi}</span>
                    <p className="event-description">{etkinlikRenderData.etkinlikAciklamasi}</p>
                    {/* IMDb ve Fragman linki (Sadece Sinema) */}
                    {isSinema && sinemaOzelRenderData && (
                      <div className="cinema-specific-info"> {/* Bu kısmı ayrı bir div'e alabiliriz veya event-price'dan önce gösterebiliriz */}
                        {sinemaOzelRenderData.imdbPuani > 0 && <p>IMDb Puanı: {sinemaOzelRenderData.imdbPuani.toFixed(1)}</p>}
                        {/* Fragman linki buradan kaldırılıp fiyatın yanına taşınacak */}
                      </div>
                    )}

                    {/* Fiyat ve koşullu Fragman Butonu */}
                    <div className="event-price">
                      {etkinlikRenderData.biletFiyati !== null && typeof etkinlikRenderData.biletFiyati !== 'undefined' && (
                        <div className="price-display-button">
                          {etkinlikRenderData.biletFiyati?.toFixed(2)}
                        </div>
                      )}
                      {isSinema && sinemaOzelRenderData && sinemaOzelRenderData.fragmanLinki && (
                        <button
                            onClick={() => setIsTrailerPopupOpen(true)} // Pop-up'ı aç
                            className="trailer-button"
                        >
                            Fragman
                            <img
                                src={fragmanIcon}
                                alt="fragman ikonu"
                                className="fragman-icon"
                            />
                        </button>
                      )}
                    </div>
                </div>

                {/* Right Section - Event Poster */}
                <div className="event-poster">
                    <img
                        src={etkinlikRenderData.kapakFotografi}
                        alt={etkinlikRenderData.etkinlikAdi}
                        className="poster-image"
                    />
                    <div className="age-restriction">
                        +{etkinlikRenderData.yasSiniri}
                    </div>
                </div>
            </div>

            {/* Sessions Section */}
            <div className="sessions-container">
                <h2 className="sessions-title">Seanslar</h2>
                {etkinlikRenderData.etkinlikSalonSeansEntities && etkinlikRenderData.etkinlikSalonSeansEntities.length > 0 ? (
                    <div className="sessions-grid">
                        {etkinlikRenderData.etkinlikSalonSeansEntities.map((salonSeans) => (
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
                                    onClick={() => handleSalonSeansClick(salonSeans.seans.seansID, salonSeans.salon.salonID, etkinlikRenderData.etkinlikID)}
                                    className="seat-selection-btn"
                                >
                                    Koltuk Seç
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-sessions-message">Bu etkinlik için henüz seans bulunmamaktadır.</p>
                )}
            </div>

            {/* TRAILER POPUP */}
            {isTrailerPopupOpen && embedTrailerUrl && (
                <div className="trailer-popup-overlay" onClick={closeTrailerPopup}>
                    <div className="trailer-popup-content" onClick={(e) => e.stopPropagation()}> {/* İçeriğe tıklayınca overlay click olayı tetiklenmesin */}
                        <button className="trailer-popup-close" onClick={closeTrailerPopup}>
                            <XCircle size={32} color="#fff" /> {/* Kapatma ikonu */}
                        </button>
                        <iframe
                            src={embedTrailerUrl}
                            title="Etkinlik Fragmanı"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Etkinlik;