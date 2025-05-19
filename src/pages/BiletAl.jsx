import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import "../components/BiletAl.css";
import { ChevronDown, ChevronUp } from 'lucide-react'; // Açılır/kapanır ikonları için ekledik (lucide-react yüklü olmalı)

const BiletAl = () => {
  const { seansId, salonId, etkinlikId } = useParams();
  const [koltuklar, setKoltuklar] = useState([]);
  const [doluKoltuklar, setDoluKoltuklar] = useState([]);
  const [secilenKoltuklar, setSecilenKoltuklar] = useState([]);
  const [etkinlikFiyati, setEtkinlikFiyati] = useState(0);
  const { user } = useAuth();

  // Yeni state: Bilet fişinin açık/kapalı durumu
  const [isBiletFisiOpen, setIsBiletFisiOpen] = useState(false);

  // Etkinlik fiyatı çek
  useEffect(() => {
    axios.get(`http://localhost:8080/mainPage/${etkinlikId}`, {
      headers: { Authorization: `Bearer ${user?.token}` }
    })
    .then(res => setEtkinlikFiyati(res.data.biletFiyati))
    .catch(err => console.error("Etkinlik fiyatı alınamadı", err));
  }, [etkinlikId, user?.token]);

  // Koltuk ve dolu koltuk verilerini çek
  useEffect(() => {
    const fetchKoltuklar = async () => {
      try {
        const [koltukRes, doluRes] = await Promise.all([
          axios.get(`http://localhost:8080/api/koltuklar?salonId=${salonId}`, {
            headers: { Authorization: `Bearer ${user?.token}` }
          }),
          axios.get(`http://localhost:8080/api/koltuklar/dolu?seansId=${seansId}`, {
            headers: { Authorization: `Bearer ${user?.token}` }
          })
        ]);
        setKoltuklar(koltukRes.data);
        setDoluKoltuklar(doluRes.data);
        console.log("Dolu koltuklar:", doluRes.data);
      } catch (err) {
        console.error("Koltuk verileri alınamadı", err);
      }
    };

    fetchKoltuklar();
  }, [salonId, seansId, user?.token]);

  // Bu koltuk dolu mu?
  const isDolu = (koltukID) =>
    doluKoltuklar.some(k => k.koltukId === koltukID && k.doluMu);

  // Seçimi değiştir
  const toggleKoltukSec = (koltuk) => {
    if (isDolu(koltuk.koltukID)) {
      alert("Bu koltuk dolu!");
      return;
    }

    setSecilenKoltuklar(prev => {
      const seciliMi = prev.find(k => k.koltukID === koltuk.koltukID);
      if (seciliMi) {
        return prev.filter(k => k.koltukID !== koltuk.koltukID);
      } else {
        // Yeni koltuk seçildiğinde, eğer bilet fişi kapalıysa açabiliriz (isteğe bağlı)
        // setIsBiletFisiOpen(true);
        return [...prev, { ...koltuk }];
      }
    });
  };

  // Bilet fişini açıp kapatma fonksiyonu
  const toggleBiletFisi = () => {
    setIsBiletFisiOpen(prev => !prev);
  };


  // Biletleri satın al
  const handleBiletAl = async () => {
    if (secilenKoltuklar.length === 0) {
      alert("Lütfen en az bir koltuk seçin.");
      return;
    }

    try {
      for (const koltuk of secilenKoltuklar) {
        const dto = {
          seansId: Number(seansId),
          koltukId: koltuk.koltukID,
          odenenMiktar: etkinlikFiyati,
          odendiMi: true
        };

        await axios.post("http://localhost:8080/biletAl/", dto, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
      }


      // İşlem başarılı ise
      alert("Bilet(ler) başarıyla alındı."); // Daha iyi bir bildirim (toast gibi) kullanın
      setSecilenKoltuklar([]); // Seçili koltukları temizle
      setIsBiletFisiOpen(false); // Fişi kapat (isteğe bağlı)

      // Dolu koltukları tekrar yükle (güncel durumu görmek için)
      const res = await axios.get(`http://localhost:8080/api/koltuklar/dolu?seansId=${seansId}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setDoluKoltuklar(res.data);

    } catch (err) {
      alert("Bilet alınırken bir hata oluştu. Detaylar için konsola bakınız."); // Kullanıcıya hata mesajı göster
      console.error("Bilet alma hatası:", err.response?.data || err.message);
    } finally {
       // setIsBuying(false); // İşlem bitti, butonu tekrar aktif et
    }
  };


  // Toplam fiyatı hesapla
  const toplamFiyat = secilenKoltuklar.length * etkinlikFiyati;

  return (
    <div className="salon-container">
      <h2 className="baslık-mesafesi">Koltuk Seç</h2>

      {/* Koltuk Grid */}
      <div className="koltuk-grid">
        {koltuklar.map((k) => {
          const dolu = isDolu(k.koltukID);
          const secili = secilenKoltuklar.some(s => s.koltukID === k.koltukID);
          return (
            <button
              key={k.koltukID}
              className={`koltuk-button ${dolu ? 'dolu' : ''} ${secili ? 'secili' : ''}`}
              onClick={() => toggleKoltukSec(k)}
              disabled={dolu}
            >
              {k.koltukNumarasi}
            </button>
          );
        })}
      </div>

      {/* Sabitlenmiş Açılır Kapanır Bilet Fişi */}
      {/* CSS sınıfları ile pozisyonlama ve açılıp kapanma kontrol edilecek */}
      <div className={`bilet-fisi-fixed-container ${isBiletFisiOpen ? 'is-open' : ''}`}>
          {/* Başlık ve Açma/Kapama İkonu */}
          <div className="bilet-fisi-header" onClick={toggleBiletFisi}>
              <h3>Biletler ({secilenKoltuklar.length})</h3> {/* Seçili koltuk sayısını başlıkta göster */}
              {isBiletFisiOpen ? <ChevronUp size={20} color="white"/> : <ChevronDown size={20} />}
          </div>

          {/* Açılıp Kapanan İçerik */}
          {/* Bu div'in görünürlüğü/yüksekliği CSS tarafından .is-open sınıfına göre yönetilecek */}
          <div className="bilet-fisi-collapsible-content">
               {secilenKoltuklar.length === 0 ? (
                 <p>Henüz koltuk seçilmedi.</p>
               ) : (
                 <ul>
                   {secilenKoltuklar.map(k => (
                     <li key={k.koltukID}>
                       Koltuk No: {k.koltukNumarasi} - {etkinlikFiyati} TL
                     </li>
                   ))}
                 </ul>
               )}
          </div>

          {/* Toplam Tutar Kısmı - Her zaman görünür */}
           <div className="bilet-fisi-total">
                <p><strong>Toplam Tutar:</strong> {toplamFiyat} TL</p>
           </div>

          {/* Satın Al butonu - Fişin içinde olabilir */}
           <button
              className="buton bilet-al-button-fisi" // Farklı bir sınıf verilebilir
              onClick={handleBiletAl}
              disabled={secilenKoltuklar.length === 0}
           >
            Bilet(leri) Satın Al ({secilenKoltuklar.length})
           </button>
      </div>


      {/* Orijinal Bilet Al Butonu - Artık fişin içine taşıdık, bu kaldırılabilir */}
      {/* <button
        className="buton"
        onClick={handleBiletAl}
        disabled={secilenKoltuklar.length === 0}
      >
        Bilet(leri) Satın Al
      </button> */}

    </div>
  );
};

export default BiletAl;