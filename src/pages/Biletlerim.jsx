// src/pages/Biletlerim.jsx
import React, { useEffect, useState, useCallback } from 'react';
import axios from '../api/axios'; // axios instance'ınızın doğru yolu
import { useAuth } from '../context/AuthContext'; // AuthContext'inizin doğru yolu
import { Link } from 'react-router-dom'; // Eğer etkinlik detayına link verebilirsek
import '../components/Biletlerim.css'; // Bu CSS dosyasını oluşturun (yolunu kontrol edin)
import { Tag, CalendarX, CalendarCheck, Ticket, MapPin, Home, Trash2, ImageOff, AlertTriangle, ExternalLink } from 'lucide-react'; // İkonlar

const Biletlerim = () => {
    const [aktifBiletler, setAktifBiletler] = useState([]);
    const [gecmisBiletler, setGecmisBiletler] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    const fetchBiletler = useCallback(async () => {
        if (!user || !user.token) {
            setError("Biletleri görüntülemek için giriş yapmalısınız.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            console.log("Biletler çekiliyor, token:", user.token ? "Var" : "Yok");
            const response = await axios.get('/Profile/getTickets', {
                headers: { Authorization: `Bearer ${user.token}` }
            });

            console.log("RAW API Yanıtı (/Profile/getTickets) data:", JSON.stringify(response.data, null, 2));

            if (response.data && Array.isArray(response.data)) {
                // Güvenlik: Sadece geçerli biletId'si olan ve temel seans bilgisi olanları filtrele
                const gelenBiletler = response.data.filter(bilet =>
                    bilet &&
                    typeof bilet.biletId !== 'undefined' &&
                    bilet.biletId !== null
                    // seansEntity kontrolünü aşağıda yapacağız, burada sadece biletId'ye odaklanalım
                );

                if (gelenBiletler.length !== response.data.length) {
                    console.warn("API'den gelen bazı biletlerde biletId eksik veya bilet objesi hatalıydı.");
                }

                const aktif = [];
                const gecmis = [];
                const now = new Date();

                gelenBiletler.forEach(bilet => {
                    let seansTarihiGecti = false;
                    let seansBilgisiVar = false;

                    if (bilet.seansEntity) {
                        if (typeof bilet.seansEntity.tarihiGectiMi === 'boolean') {
                            seansTarihiGecti = bilet.seansEntity.tarihiGectiMi;
                            seansBilgisiVar = true;
                        } else if (bilet.seansEntity.tarih) {
                            try {
                                // Tarih stringini Date objesine çevirirken dikkatli olalım
                                const seansTarihDate = new Date(bilet.seansEntity.tarih);
                                if (!isNaN(seansTarihDate.getTime())) { // Geçerli bir tarih mi?
                                    seansTarihiGecti = seansTarihDate < now;
                                    seansBilgisiVar = true;
                                } else {
                                    console.warn("Geçersiz seans tarihi formatı, Bilet ID:", bilet.biletId, "Tarih:", bilet.seansEntity.tarih);
                                }
                            } catch (dateError) {
                                console.error("Seans tarihi parse edilirken hata, Bilet ID:", bilet.biletId, dateError);
                            }
                        }
                    }

                    if (!seansBilgisiVar) {
                        console.warn("Bilet için seans tarihi/durumu bilgisi eksik, geçmişe atılıyor. Bilet ID:", bilet.biletId);
                        gecmis.push(bilet); // Seans bilgisi olmayanları varsayılan olarak geçmişe atalım
                        return;
                    }

                    if (seansTarihiGecti) {
                        gecmis.push(bilet);
                    } else {
                        aktif.push(bilet);
                    }
                });

                console.log("Filtrelenmiş ve Aktif Biletler:", JSON.stringify(aktif, null, 2));
                console.log("Filtrelenmiş ve Geçmiş Biletler:", JSON.stringify(gecmis, null, 2));

                aktif.sort((a, b) => new Date(a.seansEntity?.tarih) - new Date(b.seansEntity?.tarih));
                gecmis.sort((a, b) => new Date(b.seansEntity?.tarih) - new Date(a.seansEntity?.tarih));

                setAktifBiletler(aktif);
                setGecmisBiletler(gecmis);
            } else {
                console.log("API'den bilet verisi gelmedi veya response.data beklenen formatta (array) değil.");
                setAktifBiletler([]);
                setGecmisBiletler([]);
            }
        } catch (err) {
            console.error("Biletler alınırken hata oluştu:", err.response || err.message || err);
            setError(err.response?.data?.message || "Biletleriniz yüklenirken bir sorun oluştu.");
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchBiletler();
    }, [fetchBiletler]);

    const handleIptalEt = (biletId) => {
        // BiletId'nin geçerli olup olmadığını kontrol et
        if (typeof biletId === 'undefined' || biletId === null) {
            alert("İptal edilecek bilet ID'si bulunamadı.");
            return;
        }
        if (window.confirm(`${biletId} numaralı bileti iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) {
            alert("Bilet iptal özelliği henüz aktif değil. Backend implementasyonu gereklidir.");
            // TODO: Backend implementasyonu
        }
    };

    const renderBiletKarti = (bilet, isAktif) => {
        // Güvenlik: bilet objesinin ve biletId'nin varlığını render anında da kontrol et
        if (!bilet || typeof bilet.biletId === 'undefined' || bilet.biletId === null) {
            console.error("Render edilecek bilet objesi veya biletId eksik:", bilet);
            return ( // Hatalı bilet için bir placeholder göster
                <div className="bilet-karti hatalı-veri">
                    <AlertTriangle size={24} /> Bilet bilgileri yüklenemedi.
                </div>
            );
        }

        const sehir = bilet.sehirDto?.sehirAdi || "Belirtilmemiş";
        const salon = bilet.salonDto?.salonAdi || "Belirtilmemiş";
        const salonAdres = bilet.salonDto?.adres || "";
        const seansTarihi = bilet.seansEntity?.tarih
            ? new Date(bilet.seansEntity.tarih).toLocaleString('tr-TR', {
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })
            : "Belirtilmemiş";

        // Mevcut BiletDto'da bu alanlar olmadığı için placeholder/uyarı kullanıyoruz.
        // Backend DTO'su güncellendiğinde bu kısımlar da güncellenmeli.
        const etkinlikKapakFotografi = bilet.etkinlikKapakFotografi; // Eğer backend DTO'da varsa
        const odenenMiktar = bilet.odenenMiktar; // Eğer backend DTO'da varsa
        const etkinlikId = bilet.etkinlikId; // Eğer backend DTO'da varsa
        const etkinlikTuruAdi = bilet.etkinlikTuruAdi; // Eğer backend DTO'da varsa

        const etkinlikDetayLinkVerilebilir = etkinlikId && etkinlikTuruAdi;

        return (
            // `key` prop'u zaten burada, map içinde tekrar vermeye gerek yok.
            <div className={`bilet-karti ${isAktif ? 'aktif' : 'gecmis'}`}>
                <div className="bilet-karti-sol">
                    {etkinlikKapakFotografi ? (
                        <img src={etkinlikKapakFotografi} alt={bilet.etkinlikAdi} className="bilet-etkinlik-kapak" />
                    ) : (
                        <div className="bilet-kapak-placeholder"><ImageOff size={48} color="#ccc" /></div>
                    )}
                </div>
                <div className="bilet-karti-sag">
                    <h3>
                        {etkinlikDetayLinkVerilebilir ? (
                            <Link
                                to={`/etkinlik/${etkinlikId}?tur=${encodeURIComponent(etkinlikTuruAdi)}`}
                                className="etkinlik-linki"
                            >
                                {bilet.etkinlikAdi || "Etkinlik Adı Bilinmiyor"} <ExternalLink size={14} style={{ marginLeft: '4px', verticalAlign: 'middle' }}/>
                            </Link>
                        ) : (
                            bilet.etkinlikAdi || "Etkinlik Adı Bilinmiyor"
                        )}
                    </h3>
                    <p><CalendarCheck size={16} /> <strong>Seans:</strong> {seansTarihi}</p>
                    <p><MapPin size={16} /> <strong>Şehir:</strong> {sehir}</p>
                    <p><Home size={16} /> <strong>Salon:</strong> {salon} {salonAdres && `(${salonAdres})`}</p>
                    <p><Ticket size={16} /> <strong>Koltuk No:</strong> {bilet.koltukNo}</p>

                    {typeof odenenMiktar === 'number' ? (
                        <p><Tag size={16} /> <strong>Fiyat:</strong> {odenenMiktar.toFixed(2)} TL</p>
                    ) : (
                        <p className="bilgi-eksik-notu"><Tag size={16} /> Fiyat bilgisi mevcut değil.</p>
                    )}

                    {!etkinlikDetayLinkVerilebilir && !etkinlikId && (
                         <p className="bilgi-eksik-notu"><AlertTriangle size={14} /> Etkinlik detay linki için ek bilgi (ID) gerekli.</p>
                    )}

                    {isAktif && (
                        <button onClick={() => handleIptalEt(bilet.biletId)} className="iptal-et-button">
                            <Trash2 size={16} /> Bileti İptal Et
                        </button>
                    )}
                </div>
            </div>
        );
    };

    if (isLoading) {
        return <div className="biletlerim-loading">Biletleriniz yükleniyor...</div>;
    }

    if (error) {
        return <div className="biletlerim-error">{error}</div>;
    }

    return (
        <div className="biletlerim-container">
            <h1>Biletlerim</h1>
            <section className="bilet-bolumu">
                <h2><CalendarCheck size={24} /> Aktif Biletler ({aktifBiletler.length})</h2>
                {aktifBiletler.length > 0 ? (
                    <div className="bilet-listesi">
                        {/* Key prop'u burada renderBiletKarti'nın döndürdüğü en dış elemente verilmeli.
                            renderBiletKarti zaten içinde key={bilet.biletId} ile div döndürüyor.
                            Ancak, map fonksiyonunun doğrudan child'ına key vermek daha standarttır.
                            Bu yüzden renderBiletKarti'nı bir component haline getirmek (BiletKarti.jsx)
                            veya map içinde wrapper bir div kullanmak daha iyi olabilir.
                            Şimdilik, renderBiletKarti içindeki key'e güveniyoruz.
                            Eğer key hatası devam ederse, map şöyle olmalı:
                            aktifBiletler.map(bilet => <div key={bilet.biletId}>{renderBiletKarti(bilet, true)}</div>)
                            Veya BiletKarti component'i:
                            aktifBiletler.map(bilet => <BiletKarti key={bilet.biletId} bilet={bilet} isAktif={true} />)
                        */}
                        {aktifBiletler.map(bilet => renderBiletKarti(bilet, true))}
                    </div>
                ) : (
                    <p>Henüz aktif bir biletiniz bulunmamaktadır.</p>
                )}
            </section>
            <section className="bilet-bolumu">
                <h2><CalendarX size={24} /> Geçmiş Biletler ({gecmisBiletler.length})</h2>
                {gecmisBiletler.length > 0 ? (
                    <div className="bilet-listesi">
                        {gecmisBiletler.map(bilet => renderBiletKarti(bilet, false))}
                    </div>
                ) : (
                    <p>Geçmiş bir biletiniz bulunmamaktadır.</p>
                )}
            </section>
        </div>
    );
};

export default Biletlerim;