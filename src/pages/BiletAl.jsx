import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
    <div>
      <h2>Koltuk Seç</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 40px)', gap: '8px' }}>
        {koltuklar.map((k, index) => (
          <button
            key={k.koltukID}
            onClick={() => handleKoltukSec(k)}
            style={{
              backgroundColor: secilenKoltuk?.koltukID === k.koltukID ? 'green' : '#ccc',
              padding: '10px',
              borderRadius: '4px'
            }}
          >
            {k.satir}-{k.sutun}
          </button>
        ))}
      </div>
      <br />
      <button onClick={handleBiletAl} disabled={!secilenKoltuk}>Bileti Satın Al</button>
    </div>
  );
};

export default BiletAl;
