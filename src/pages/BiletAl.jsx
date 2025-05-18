import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import "../components/BiletAl.css";

const BiletAl = () => {
  const { seansId, salonId, etkinlikId } = useParams();
  const { user } = useAuth();

  const [koltuklar, setKoltuklar] = useState([]);
  const [doluKoltuklar, setDoluKoltuklar] = useState([]);
  const [secilenKoltuklar, setSecilenKoltuklar] = useState([]);
  const [etkinlikFiyati, setEtkinlikFiyati] = useState(0);

  // 1) Etkinlik fiyatını çek
  useEffect(() => {
    axios.get(`http://localhost:8080/mainPage/${etkinlikId}`, {
      headers: { Authorization: `Bearer ${user?.token}` }
    })
        .then(res => setEtkinlikFiyati(res.data.biletFiyati))
        .catch(err => console.error("Etkinlik fiyatı alınamadı", err));
  }, [etkinlikId, user?.token]);

  // 2) Koltuk verilerini çek
  useEffect(() => {
    async function fetchData() {
      try {
        const [allRes, doluRes] = await Promise.all([
          axios.get(`http://localhost:8080/api/koltuklar?salonId=${salonId}`, { headers: { Authorization: `Bearer ${user?.token}` } }),
          axios.get(`http://localhost:8080/api/koltuklar/dolu?seansId=${seansId}`, { headers: { Authorization: `Bearer ${user?.token}` } })
        ]);
        setKoltuklar(allRes.data);
        setDoluKoltuklar(doluRes.data);
      } catch (err) {
        console.error("Koltuk verileri alınamadı", err);
      }
    }
    fetchData();
  }, [salonId, seansId, user?.token]);

  // 3) Layout ve gruplama
  const layout = [8, 8, 7, 6, 5, 5];
  const groupedKoltuklar = useMemo(() => {
    let idx = 0;
    return layout.map(count => {
      const slice = koltuklar.slice(idx, idx + count);
      idx += count;
      return slice;
    });
  }, [koltuklar]);

  const isDolu = id => doluKoltuklar.some(k => k.koltukId === id && k.doluMu);
  const toggleKoltukSec = koltuk => {
    if (isDolu(koltuk.koltukID)) return alert("Bu koltuk dolu!");
    setSecilenKoltuklar(prev => {
      const exists = prev.find(x => x.koltukID === koltuk.koltukID);
      if (exists) return prev.filter(x => x.koltukID !== koltuk.koltukID);
      return [...prev, koltuk];
    });
  };

  const handleBiletAl = async () => {
    if (!secilenKoltuklar.length) return alert("Lütfen en az bir koltuk seçin.");
    try {
      for (const k of secilenKoltuklar) {
        await axios.post("http://localhost:8080/biletAl/", { seansId: Number(seansId), koltukId: k.koltukID, odenenMiktar: etkinlikFiyati, odendiMi: true }, { headers: { Authorization: `Bearer ${user?.token}` } });
      }
      alert("Bilet(ler) başarıyla alındı.");
      setSecilenKoltuklar([]);
      const res = await axios.get(`http://localhost:8080/api/koltuklar/dolu?seansId=${seansId}`, { headers: { Authorization: `Bearer ${user?.token}` } });
      setDoluKoltuklar(res.data);
    } catch (err) {
      alert("Bilet alınırken bir hata oluştu."); console.error(err);
    }
  };

  // Inline panel stil
  const panelStyle = {
    position: 'absolute',
    top: '20px',
    right: '20px',
    width: '200px',
    backgroundColor: '#2a2a2a',
    padding: '16px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
    color: '#fff',
    zIndex: 1000
  };

  return (
      <div className="salon-container" style={{ position: 'relative', height: '78vh', overflow: 'hidden', margin: 0 }}>
        <h2 style={{ margin: 0 }}>Koltuk Seçimi</h2>

        {/* Sağ üstte info panel */}
        <div style={panelStyle}>
          <h4 style={{ margin: '0 0 8px', fontSize: '16px' }}>Seçilen Koltuklar</h4>
          {secilenKoltuklar.length === 0 ? (
              <p style={{ fontSize: '14px' }}>Henüz seçim yok</p>
          ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 8px' }}>
                {secilenKoltuklar.map(k => (
                    <li key={k.koltukID} style={{ fontSize: '14px', marginBottom: '4px' }}>{k.koltukNumarasi}</li>
                ))}
              </ul>
          )}
          <p style={{ fontSize: '14px', margin: '0 0 12px' }}><strong>Toplam:</strong> {secilenKoltuklar.length * etkinlikFiyati} TL</p>
          <button
              className="buton buy-button"
              onClick={handleBiletAl}
              disabled={!secilenKoltuklar.length}
              style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          >Satın Al</button>
        </div>

        {/* Koltuk durumu legend (sol alt) */}
        <div
            className="seat-legend"
            style={{position: 'absolute', textAlign: 'left', bottom: '20px', left: '20px'}}
        >
          <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <button className="koltuk-button"></button>
            Boş
          </div>
          <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <button className="koltuk-button dolu"></button>
            Dolu
          </div>
          <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <button className="koltuk-button secili"></button>
            Seçilmiştir
          </div>
        </div>
        <div className="koltuk-grid">
          {groupedKoltuklar.map((row, i) => (
              <div key={i} className="koltuk-row">
                {row.map(k => {
                  const dolu = isDolu(k.koltukID);
                  const secili = secilenKoltuklar.some(s => s.koltukID === k.koltukID);
                  return (
                      <button
                          key={k.koltukID}
                          className={`koltuk-button ${dolu ? 'dolu' : ''} ${secili ? 'secili' : ''}`}
                          onClick={() => toggleKoltukSec(k)}
                          disabled={dolu}
                      >{k.koltukNumarasi}</button>
                  );
                })}
              </div>
          ))}
        </div>
      </div>
  );
};

export default BiletAl;
