import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import "../components/EtkinlikOlustur.css";

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
    const [fragmanLinki, setFragmanLinki] = useState('');

    useEffect(() => {
        axios.get('http://localhost:8080/sehir/sehirler')
            .then(res => setSehirler(res.data))
            .catch((err) => {
                console.error("Şehirleri alma başarısız:", err);
            });
        axios.get('http://localhost:8080/veri/etkinlik-turleri').then(res => setEtkinlikTurleri(res.data))
            .catch((err) => {
                console.error("Türleri alma başarısız:", err);
                alert("Türleri alma başarısız:");
            });
    }, []);

    useEffect(() => {
        if (secilenSehir) {
            const sehirObje = sehirler.find(s => s.plakaKodu === parseInt(secilenSehir));
            axios.post('http://localhost:8080/organizatorMainPage/getSalonsForSehir', sehirObje,
              {headers: {
                Authorization: `Bearer ${user.token}`,
              }
            })
                .then(res => {
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

    const handleSeansSil = (index) => {
        setSeanslar(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        // Etkinlik türüne göre gönderilecek veriyi hazırlıyoruz.
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

        // Sinema türü seçildiyse fragman linkini de ekliyoruz.
        if (etkinlikTurleri.find(tur => tur.etkinlikTurID === Number(secilenTur))?.etkinlikTurAdi === 'Sinema') {
            if (!fragmanLinki || fragmanLinki.trim() === '') {
                toast.error("Fragman linki boş olamaz!");
                return;
            }

            const sinemaDto = {
                etkinlikEkleDto: dto,
                fragmanLinki
            };
            console.log("Gönderilen sinemaDto:", JSON.stringify(sinemaDto));
            try {
                const res = await axios.post('http://localhost:8080/organizatorMainPage/addCinema/save', sinemaDto, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });

                if (res.data === true) {
                    toast.success("Etkinlik başarıyla kaydedildi!");
                    // Formu sıfırlama işlemleri
                    resetForm();
                } else {
                    alert(res.data);
                }
            } catch (error) {
                console.error('Sinema etkinliği kaydedilemedi', error);
            }
        } else {
            console.log("Gönderilen dto:", JSON.stringify(dto));
            // Diğer etkinlik türleri için
            try {
                const res = await axios.post('http://localhost:8080/organizatorMainPage/addEvent/save', dto, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });

                if (res.data === true) {
                    toast.success("Etkinlik başarıyla kaydedildi!");
                    // Formu sıfırlama işlemleri
                    resetForm();
                } else {
                    alert(res.data);
                }
            } catch (error) {
                console.error('Etkinlik kaydedilemedi', error);
            }
        }
    };

    // Formu sıfırlamak için bir fonksiyon ekleyebiliriz
    const resetForm = () => {
        setEtkinlikAdi('');
        setEtkinlikAciklamasi('');
        setYasSiniri('');
        setBiletFiyati('');
        setEtkinlikSuresi('');
        setKapakFotografi('');
        setSeanslar([]);
        setYeniSeans('');
        setSecilenSehir('');
        setSecilenSalon('');
        setSecilenTur('');
        setFragmanLinki('');
    };

    return (
        <div className="etkinlik-page-container">
            <div className="etkinlik-form-wrapper">
                <div className="etkinlik-form-container">
                    <div className="etkinlik-form-header">
                        <h1 className="etkinlik-form-title">Etkinlik Ekle</h1>
                        <div className="etkinlik-form-divider"></div>
                    </div>

                    <div className="etkinlik-form-content">
                        <div className="etkinlik-form-grid">
                            <div className="etkinlik-form-column">
                                <div className="etkinlik-form-group">
                                    <label className="etkinlik-form-label">Etkinlik Adı</label>
                                    <input
                                        type="text"
                                        className="etkinlik-form-input"
                                        value={etkinlikAdi}
                                        onChange={e => setEtkinlikAdi(e.target.value)}
                                        placeholder="Etkinlik adını giriniz"
                                    />
                                </div>

                                <div className="etkinlik-form-group">
                                    <label className="etkinlik-form-label">Etkinlik Açıklaması</label>
                                    <textarea
                                        className="etkinlik-form-textarea"
                                        value={etkinlikAciklamasi}
                                        onChange={e => setEtkinlikAciklamasi(e.target.value)}
                                        placeholder="Etkinlik açıklamasını giriniz"
                                    />
                                </div>

                                <div className="etkinlik-form-group">
                                    <label className="etkinlik-form-label">Etkinlik Afişi</label>
                                    <div className="etkinlik-file-upload">
                                        <input
                                            type="text"
                                            className="etkinlik-form-input"
                                            onChange = {e => setKapakFotografi(e.target.value)}
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="etkinlik-form-column">
                                <div className="etkinlik-form-row">
                                    <div className="etkinlik-form-group half-width">
                                        <label className="etkinlik-form-label">Yaş Sınırı</label>
                                        <input
                                            type="number"
                                            className="etkinlik-form-input"
                                            value={yasSiniri}
                                            onChange={e => setYasSiniri(e.target.value)}
                                            placeholder="18+"
                                        />
                                    </div>

                                    <div className="etkinlik-form-group half-width">
                                        <label className="etkinlik-form-label">Bilet Fiyatı (₺)</label>
                                        <input
                                            type="number"
                                            className="etkinlik-form-input"
                                            value={biletFiyati}
                                            onChange={e => setBiletFiyati(e.target.value)}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div className="etkinlik-form-group">
                                    <label className="etkinlik-form-label">Etkinlik Süresi (dakika)</label>
                                    <input
                                        type="number"
                                        className="etkinlik-form-input"
                                        value={etkinlikSuresi}
                                        onChange={e => setEtkinlikSuresi(e.target.value)}
                                        placeholder="120"
                                    />
                                </div>

                                <div className="etkinlik-form-row">
                                    <div className="etkinlik-form-group half-width">
                                        <label className="etkinlik-form-label">Şehir</label>
                                        <select
                                            value={secilenSehir}
                                            onChange={e => setSecilenSehir(e.target.value)}
                                            className="etkinlik-form-select"
                                        >
                                            <option value="">Şehir seçin</option>
                                            {sehirler.map(sehir => (
                                                <option key={sehir.plakaKodu} value={sehir.plakaKodu}>
                                                    {sehir.sehirAdi}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="etkinlik-form-group half-width">
                                        <label className="etkinlik-form-label">Etkinlik Türü</label>
                                        <select
                                            value={secilenTur}
                                            onChange={e => setSecilenTur(e.target.value)}
                                            className="etkinlik-form-select"
                                        >
                                            <option value="">Tür seçin</option>
                                            {etkinlikTurleri.map(tur => (
                                                <option key={tur.etkinlikTurID} value={tur.etkinlikTurID}>
                                                    {tur.etkinlikTurAdi}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {salonlar.length > 0 && (
                                    <div className="etkinlik-form-group">
                                        <label className="etkinlik-form-label">Mekan</label>
                                        <select
                                            value={secilenSalon}
                                            onChange={e => setSecilenSalon(e.target.value)}
                                            className="etkinlik-form-select"
                                        >
                                            <option value="">Mekan seçin</option>
                                            {salonlar.map(salon => (
                                                <option key={salon.salonID} value={salon.salonID}>
                                                    {salon.salonAdi} - {salon.salonAdresi}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {etkinlikTurleri.find(tur => tur.etkinlikTurID === Number(secilenTur))?.etkinlikTurAdi === 'Sinema' && (
                                    <div className="etkinlik-form-group">
                                        <label
                                            className="etkinlik-form-label"
                                        >
                                            Fragman Linki:
                                        </label>
                                        <input
                                            type="text"
                                            value={fragmanLinki}
                                            onChange={e => setFragmanLinki(e.target.value)}
                                            required
                                            className="etkinlik-form-input"
                                            placeholder="https://..."
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {secilenSalon && (
                            <div className="etkinlik-sessions-section">
                                <h3 className="etkinlik-sessions-title">Etkinlik Seansları</h3>

                                <div className="etkinlik-session-controls">
                                    <input
                                        type="datetime-local"
                                        value={yeniSeans}
                                        onChange={e => setYeniSeans(e.target.value)}
                                        className="etkinlik-session-input"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSeansEkle}
                                        className="etkinlik-add-session-btn"
                                    >
                                        Seans Ekle
                                    </button>
                                </div>

                                {seanslar.length > 0 && (
                                    <div className="etkinlik-sessions-list">
                                        {seanslar.map((seans, index) => (
                                            <div key={index} className="etkinlik-session-item">
                                                <span className="etkinlik-session-time">
                                                    {new Date(seans.tarih).toLocaleString('tr-TR', {
                                                        weekday: 'short',
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                                <button
                                                    onClick={() => handleSeansSil(index)}
                                                    className="etkinlik-remove-session"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="etkinlik-form-footer">
                            <button
                                onClick={handleSubmit}
                                className="etkinlik-submit-btn"
                            >
                                Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddEvent;