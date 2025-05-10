import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import "../components/BiletAl.css";

const BiletAl = () => {
  const { seansId, salonId, etkinlikId } = useParams();
  const [koltuklar, setKoltuklar] = useState([]);
  const [doluKoltuklar, setDoluKoltuklar] = useState([]);
  const [secilenKoltuklar, setSecilenKoltuklar] = useState([]);
  const [etkinlikFiyati, setEtkinlikFiyati] = useState(0);
  const { user } = useAuth();

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
      } catch (err) {
        console.error("Koltuk verileri alınamadı", err);
      }
    };

    fetchKoltuklar();
  }, [salonId, seansId, user?.token]);

  // Bu koltuk dolu mu?
  const isDolu = (koltukID) =>
    doluKoltuklar.some(k => k.koltukID === koltukID && k.doluMu);

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
        return [...prev, { ...koltuk }];
      }
    });
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

      alert("Bilet(ler) başarıyla alındı.");
      setSecilenKoltuklar([]);

      // Dolu koltukları tekrar yükle
      const res = await axios.get(`http://localhost:8080/api/koltuklar/dolu?seansId=${seansId}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setDoluKoltuklar(res.data);

    } catch (err) {
      alert("Bilet alınırken bir hata oluştu.");
      console.error(err);
    }
  };

  return (
    <div className="salon-container">
      <h2>Koltuk Seç</h2>

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

      <div className="bilet-fisi">
        <h3>Seçilen Koltuklar:</h3>
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
        <p><strong>Toplam Tutar:</strong> {secilenKoltuklar.length * etkinlikFiyati} TL</p>
      </div>

      <button
        className="buton"
        onClick={handleBiletAl}
        disabled={secilenKoltuklar.length === 0}
      >
        Bilet(leri) Satın Al
      </button>
    </div>
  );
};

export default BiletAl;
