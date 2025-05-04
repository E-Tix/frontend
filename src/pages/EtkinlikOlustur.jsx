import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from "../context/AuthContext";

const AddEvent = () => {
    const { user } = useAuth();
    const [etkinlikAdi, setEtkinlikAdi] = useState('');
    const [etkinlikAciklamasi, setEtkinlikAciklamasi] = useState('');
    const [yasSiniri, setYasSiniri] = useState('');
    const [biletFiyati, setBiletFiyati] = useState('');
    const [etkinlikSuresi, setEtkinlikSuresi] = useState('');
    const [kapakFotografi, setKapakFotografi] = useState('');
    const [seanslar, setSeanslar] = useState([]);
    const [yeniSeans, setYeniSeans] = useState('');
    const [sehirler, setSehirler] = useState([]);
    const [salonlar, setSalonlar] = useState([]);
    const [etkinlikTurleri, setEtkinlikTurleri] = useState([]);
    const [secilenSehir, setSecilenSehir] = useState('');
    const [secilenSalon, setSecilenSalon] = useState('');
    const [secilenTur, setSecilenTur] = useState('');

    useEffect(() => {
        axios.get('http://localhost:8080/sehir/sehirler')
            .then(res => setSehirler(res.data))
            .catch((err) => {
                console.error("Sehirleri alma başarısız:", err);
            });
        axios.get('http://localhost:8080/veri/etkinlik-turleri').then(res => setEtkinlikTurleri(res.data))
            .catch((err) => {
                console.error("Turleri alma başarısız:", err);
                alert("Türleri alma başarısız:");
            });
    }, []);

    useEffect(() => {
        console.log("secilenSehir: ", secilenSehir);
        if (secilenSehir) {
        console.log("user.token", user.token);
        const sehirObje = sehirler.find(s => s.plakaKodu === parseInt(secilenSehir));
        axios.post('http://localhost:8080/organizatorMainPage/getSalonsForSehir', sehirObje,
          {headers: {
            Authorization: `Bearer ${user.token}`,
          }
        }
        )
            .then(res => {
                console.log("Salonlar:", res.data);
                setSalonlar(res.data)})
            .catch((err) => {
                console.error("Salonları alma başarısız:", err);
                alert("Salonları alma başarısız:");
            });
        } else {
            setSalonlar([]);
            setSecilenSalon('');
        }
    }, [secilenSehir, user.token])

    const handleKapakYukle = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await axios.post('http://localhost:8080/etkinlikler/kapak-foto/${eventId}', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setKapakFotografi(res.data);   // Fotoğraf ile ilişkilendirilen veri
        } catch (err) {
            console.error('Kapak fotoğrafı yüklenemedi', err);
        }
    };

    const handleSeansEkle = () => {
        if (yeniSeans && etkinlikSuresi) {
          const seansTarih = new Date(yeniSeans);
          const bitisTarih = new Date(seansTarih.getTime() + etkinlikSuresi * 60000);
          setSeanslar([...seanslar, {
            tarih: seansTarih.toISOString(),
            bitisTarihi: bitisTarih.toISOString()
          }]);
          setYeniSeans('');
        }
      };

    const handleSalonSecimi = (salonID) => {
        setSecilenSalon(prev =>
          prev.includes(salonID)
            ? prev.filter(id => id !== salonID)
            : [...prev, salonID]
        );
      };

  const handleSubmit = async () => {
    const dto = {
      etkinlikAdi,
      etkinlikAciklamasi,
      yasSiniri: parseInt(yasSiniri),
      biletFiyati: parseFloat(biletFiyati),
      etkinlikSuresi: parseInt(etkinlikSuresi),
      kapakFotografi,
      sehir: sehirler.find(s => s.plakaKodu === parseInt(secilenSehir)),
      salon: salonlar.find(s => s.salonID === parseInt(secilenSalon)),
      etkinlikTur: etkinlikTurleri.find(t => t.etkinlikTurID === parseInt(secilenTur)),
      seansEkleDtoList: seanslar.map(s => ({ tarih: s.tarih, bitisTarihi: s.bitisTarihi }))
    };

    try {

      const res = await axios.post('http://localhost:8080/organizatorMainPage/addEvent/save', dto, {
            headers: {
                Authorization: `Bearer ${user.token}`,
            },
          });
      if (res.data === true) {
        alert("Etkinlik başarıyla kaydedildi!");
        // yönlendirme veya form reset işlemleri yapılabilir
      }else{
        console.error("axios'a geldi")
        alert(res.data);
      }
    } catch (error) {
      console.error('Etkinlik kaydedilemedi', error);
    }
  };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Etkinlik Ekle</h1>

            <div>
                <label className="">Etkinlik Adı</label>
                <input
                    type="text"
                    placeholder="Etkinlik Adı"
                    className="input"
                    value={etkinlikAdi}
                    onChange={e => setEtkinlikAdi(e.target.value)}
                />
            </div>

            <div>
                <label className="">Etkinlik Açıklaması</label>
                <textarea
                    placeholder="Etkinlik Açıklaması"
                    className="input"
                    value={etkinlikAciklamasi}
                    onChange={e => setEtkinlikAciklamasi(e.target.value)}
                />
            </div>

            <div>
                <label className="">Yaş Sınırı</label>
                <input
                    type="number"
                    placeholder="Yaş Sınırı"
                    className="input"
                    value={yasSiniri}
                    onChange={e => setYasSiniri(e.target.value)}
                />
            </div>

            <div>
                <label className="">Bilet Fiyatı</label>
                <input
                    type="number"
                    placeholder="Bilet Fiyatı"
                    className="input"
                    value={biletFiyati}
                    onChange={e => setBiletFiyati(e.target.value)}
                />
            </div>

            <div>
                <label className="">Etkinlik Süresi</label>
                <input
                    type="number"
                    placeholder="Etkinlik Süresi"
                    className="input"
                    value={etkinlikSuresi}
                    onChange={e => setEtkinlikSuresi(e.target.value)}
                />
            </div>

            <div>
                <label className="">Etkinlik Afişi</label>
                <input
                    type="file"
                    onChange={handleKapakYukle}
                />
            </div>

            <div>
                <label className="">Sehir</label>
                <select value={secilenSehir} onChange={e => setSecilenSehir(e.target.value)}>
                    <option>Şehir Seçin</option>
                    {sehirler.map(sehir => <option key={sehir.plakaKodu} value={sehir.plakaKodu}>{sehir.sehirAdi}</option>)}
                </select>
            </div>

            <div>
                <select value={secilenTur} onChange={e => setSecilenTur(e.target.value)}>
                    <option>Tür Seçin</option>
                    {etkinlikTurleri.map(tur => <option key={tur.etkinlikTurID} value={tur.etkinlikTurID}>{tur.etkinlikTurAdi}</option>)}
                </select>
            </div>

            {salonlar.length > 0 && (
                    <>
                      <label>Salon</label>
                      <select value={secilenSalon} onChange={e => setSecilenSalon(e.target.value)} required>
                        <option value="">Salon seçiniz</option>
                        {salonlar.map((salon) => (
                          <option key={salon.salonID} value={salon.salonID}>
                            {salon.salonAdi} - {salon.salonAdresi}
                          </option>
                        ))}
                      </select>
                    </>
                  )}

                  {secilenSalon && (
                    <>
                      <label>Yeni Seans Ekle (YYYY-MM-DDTHH:mm)</label>
                      <input
                        type="datetime-local"
                        value={yeniSeans}
                        onChange={e => setYeniSeans(e.target.value)}
                      />
                      <button type="button" onClick={handleSeansEkle}>Seans Ekle</button>

                      <ul>
                        {seanslar.map((seans, idx) => (
                          <li key={idx}>{seans.tarih}</li>
                        ))}
                      </ul>
                    </>
                  )}

            <div>
                <button
                    onClick={handleSubmit}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Kaydet
                </button>
            </div>
        </div>
    );
};

export default AddEvent;
