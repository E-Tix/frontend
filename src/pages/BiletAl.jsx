import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../components/BiletAl.css";

const BiletAl = ({ seansId, salonId, kullaniciId }) => {
  const [koltuklar, setKoltuklar] = useState([]);
  const [secilenKoltuk, setSecilenKoltuk] = useState(null);

  useEffect(() => {
    axios.get(`/api/koltuklar?salonId=${salonId}`)
      .then(res => setKoltuklar(res.data))
      .catch(err => console.error("Koltuklar getirilemedi", err));
  }, [salonId]);

  const handleKoltukSec = (koltuk) => {
    setSecilenKoltuk(koltuk);
  };

  const handleBiletAl = () => {
    if (!secilenKoltuk) return alert("Lütfen bir koltuk seçin!");

    const dto = {
      seansId,
      koltukId: secilenKoltuk.koltukID,
      kullaniciId,
      odendiMi: true,
      odenenMiktar: 100.0  // Örnek ücret
    };

    axios.post('/api/bilet/al', dto)
      .then(() => alert("Bilet alındı!"))
      .catch(() => alert("Bilet alınamadı!"));
  };

  return (
    <div className="salon-container">
      <h2>Koltuk Seç</h2>

      <div className="koltuk-grid">
        {koltuklar.map((k) => (
          <button
            key={k.koltukID}
            className={`koltuk-button ${
              secilenKoltuk?.koltukID === k.koltukID ? 'secili' : ''
            }`}
            onClick={() => handleKoltukSec(k)}
          >
            {k.satir}-{k.sutun}
          </button>
        ))}
      </div>

      <div className="perde">PERDE</div>

      <button className="buton" onClick={handleBiletAl} disabled={!secilenKoltuk}>
        Bileti Satın Al
      </button>
    </div>
  );

};

export default BiletAl;