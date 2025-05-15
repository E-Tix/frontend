// src/pages/Biletlerim.jsx
import React, { useEffect, useState, useCallback } from 'react';
import axios from '../api/axios'; // axios instance'ınızın doğru yolu
import { useAuth } from '../context/AuthContext'; // AuthContext'inizin doğru yolu
import { Link, useNavigate } from 'react-router-dom'; // Eğer etkinlik detayına link verebilirsek, useNavigate eklendi
import '../components/Biletlerim.css'; // Bu CSS dosyasını oluşturun (yolunu kontrol edin)
import { Tag, CalendarX, CalendarCheck, Ticket, MapPin, Home, Trash2, ImageOff, AlertTriangle, ExternalLink, Loader2 } from 'lucide-react'; // İkonlar, Loader2 eklendi
import { toast } from 'react-toastify'; // Toast bildirimleri için eklendi

const Biletlerim = () => {
    const [aktifBiletler, setAktifBiletler] = useState([]);
    const [gecmisBiletler, setGecmisBiletler] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    // Bilet bazında iptal talebi gönderilirken yüklenme durumunu tutmak için map
    const [isCancellingMap, setIsCancellingMap] = useState({});
    const { user, token, logout } = useAuth(); // token ve logout da alındı
    const navigate = useNavigate(); // Yönlendirme için

    const fetchBiletler = useCallback(async () => {
        // Token ve kullanıcı bilgisi yoksa fetch yapma
        if (!user?.token) { // user ve user.token kontrolü
            // Eğer kullanıcı yoksa ama bir token bekleniyorsa (örn: ProtectedRoute kullanılmıyorsa)
            // veya login olmadığı halde bu sayfaya gelindiyse, hata mesajı gösterilebilir.
            // navigate("/giris"); // Eğer login olmayanlar buraya geliyorsa yönlendir
            setError("Biletlerinizi görüntülemek için giriş yapmalısınız.");
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
                const aktif = [];
                const gecmis = [];
                const now = new Date();

                response.data.forEach(bilet => {
                    // Güvenlik ve geçerlilik kontrolü
                     if (!bilet || typeof bilet.biletId === 'undefined' || bilet.biletId === null) {
                         console.warn("API'den gelen bir bilet objesi eksik veya hatalıydı.", bilet);
                         // Bu hatalı bileti listeye eklemiyoruz
                         return;
                     }

                    let seansTarihiGecti = true; // Varsayılan: geçmiş kabul et
                    let seansBilgisiVar = false;

                    if (bilet.seansEntity) {
                         // Öncelikle backend'den gelen boolean tarihiGectiMi'yi kullan
                        if (typeof bilet.seansEntity.tarihiGectiMi === 'boolean') {
                            seansTarihiGecti = bilet.seansEntity.tarihiGectiMi;
                            seansBilgisiVar = true;
                        } else if (bilet.seansEntity.tarih) { // Yoksa veya boolean değilse tarih stringini parse et
                            try {
                                const seansTarihDate = new Date(bilet.seansEntity.tarih);
                                if (!isNaN(seansTarihDate.getTime())) {
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

                     // Seans bilgisi yoksa veya geçmişse (backend'den gelen tarihiGectiMi veya frontend hesaplaması)
                    if (!seansBilgisiVar || seansTarihiGecti) {
                        gecmis.push(bilet);
                    } else {
                        aktif.push(bilet);
                    }
                });

                // Tarihlere göre sıralama
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
            // Yetkilendirme hatası durumunda çıkış yaptır (App.js'de ProtectedRoute varsa bu daha az gerekli)
             if (err.response?.status === 401 || err.response?.status === 403) {
                 toast.error("Oturum süreniz dolmuş veya yetkiniz yok. Lütfen tekrar giriş yapın.");
                 logout(); // useAuth hook'undan logout çağrılır
                 navigate("/giris"); // Login sayfasına yönlendir
             }
        } finally {
            setIsLoading(false);
        }
    }, [user, token, logout, navigate]); // useAuth'tan gelenler dependency olarak eklendi

    useEffect(() => {
        // Eğer kullanıcı (user) bilgisi context'ten yüklenmişse fetchBiletler'i çalıştır
        // user null değilse, fetchBiletler içindeki !user.token kontrolü yeterli olacaktır.
        if (user !== null) { // Sadece kullanıcı objesi null olmaktan çıktığında fetch yap
           fetchBiletler();
        }
         // Eğer user Local Storage'dan yüklenirken AuthContext'in loading state'i varsa,
         // AuthContext'in loading state'i false olduğunda fetch'i tetiklemek daha iyi olabilir.
         // Ancak mevcut AuthContext'inizde loading state'i doğrudan dışa aktarılmıyor gibi.
         // Şimdilik user !== null kontrolü yeterli olabilir.
    }, [user, fetchBiletler]); // user objesi değiştiğinde (login/logout) veya fetchBiletler callback'i değiştiğinde


     // **** BİLET İPTAL TALEBİ GÖNDERME İŞLEVİ ****
     const handleIptalEt = useCallback(async (biletId) => { // Make the function async
         if (typeof biletId === 'undefined' || biletId === null) {
             toast.error("İptal edilecek bilet ID'si bulunamadı."); // Use toast
             return;
         }
         if (!user.token) {
             toast.error("Yetkilendirme token'ı bulunamadı. Lütfen tekrar giriş yapın.");
             // logout(); navigate("/giris"); // Gerekirse yönlendir
             return;
         }

         // Onay isteme
         // Mesajı backend'deki işleme göre ayarlayın: Bu bir silme değil, iptal talebi gönderme işlemi.
         const isConfirmed = window.confirm(`Bilet ID ${biletId} için iptal talebi oluşturulacak. Emin misiniz?`);
         if (!isConfirmed) {
             return; // Kullanıcı iptal ettiyse fonksiyondan çık
         }

         setIsCancellingMap(prev => ({ ...prev, [biletId]: true })); // İlgili bilet için yüklenme durumunu başlat

         try {
             // Backend endpoint: DELETE /biletAl/deleteBilet
             // Method: DELETE
             // Parameter: biletId as @RequestParam, so use params in axios delete
             const response = await axios.delete('/biletAl/deleteBilet', {
                 params: { biletId: biletId }, // Query parameter
                 headers: { Authorization: `Bearer ${user.token}` } // Auth header
             });

             if (response.data === true) { // Backend boolean true döndüyse (talep alındı)
                 toast.success(`Bilet ID ${biletId} için iptal talebi başarıyla oluşturuldu.`);
                 // UI'ı güncelle: Aktif listesinden bu bileti kaldır
                 setAktifBiletler(prevAktif => prevAktif.filter(bilet => bilet.biletId !== biletId));
                 // İsterseniz buraya iptal talebi bekleyenler listesi eklenebilir
             } else { // Backend boolean false döndürdüyse (örn: kullanıcı bilete sahip değil)
                 toast.error(`Bilet ID ${biletId} için iptal talebi oluşturulamadı.`);
             }

         } catch (err) {
             console.error(`Bilet ID ${biletId} iptal talebi gönderilirken hata oluştu:`, err.response?.data || err.message || err);
             const errorMessage = err.response?.data?.message || err.response?.data || "Sunucu hatası oluştu.";
             toast.error(`Talep gönderilirken bir sorun oluştu: ${errorMessage}`);

              // Yetkilendirme hatası durumunda
             if (err.response?.status === 401 || err.response?.status === 403) {
                 toast.warning("Oturum süresi dolmuş veya yetkisizsiniz. Lütfen tekrar giriş yapın.");
                 logout();
                 navigate("/");
             }

         } finally {
             // İlgili bilet için yüklenme durumunu bitir
             setIsCancellingMap(prev => {
                 const newState = { ...prev };
                 delete newState[biletId];
                 return newState;
             });
         }
     }, [token, logout, navigate]); // Dependencies

    // renderBiletKarti fonksiyonu (iptal butonu güncellendi)
    const renderBiletKarti = (bilet, isAktif) => {
        // Güvenlik: bilet objesinin ve biletId'nin varlığını render anında da kontrol et
        if (!bilet || typeof bilet.biletId === 'undefined' || bilet.biletId === null) {
            console.error("Render edilecek bilet objesi veya biletId eksik:", bilet);
            return ( // Hatalı bilet için bir placeholder göster
                <div key={`error-${Math.random()}`} className="bilet-karti hatalı-veri"> {/* Eşsiz key */}
                    <AlertTriangle size={24} /> Bilet bilgileri yüklenemedi.
                </div>
            );
        }

        const sehir = bilet.sehirDto?.sehirAdi || "Belirtilmemiş";
        const salon = bilet.salonDto?.salonAdi || "Belirtilmemiş";
        const salonAdres = bilet.salonDto?.adres || ""; // DTO'da salonAdresi mi adres mi kontrol edin
        const seansTarihi = bilet.seansEntity?.tarih
            ? new Date(bilet.seansEntity.tarih).toLocaleString('tr-TR', {
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })
            : "Belirtilmemiş";

        // Backend DTO'sunda olduğunu varsaydığımız veya placeholder kullandığımız alanlar
        // Etkinlik detayı linki için backend'den etkinlikId ve etkinlikTuruAdi gelmesi lazım
        const etkinlikKapakFotografi = bilet.etkinlikKapakFotografi; // DTO'da varsa
        const odenenMiktar = bilet.odenenMiktar; // DTO'da varsa
        const etkinlikId = bilet.etkinlikId; // DTO'da varsa
        const etkinlikTuruAdi = bilet.etkinlikTuruAdi; // DTO'da varsa


        const etkinlikDetayLinkVerilebilir = etkinlikId && etkinlikTuruAdi;
        const isCancelling = isCancellingMap[bilet.biletId]; // Bu bilet şu an iptal ediliyor mu?


        return (
            // `key` prop'u map içinde verilmeli
            <div key={bilet.biletId} className={`bilet-karti ${isAktif ? 'aktif' : 'gecmis'}`}>
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

                    {/* Sadece aktif biletler için iptal butonu */}
                    {isAktif && (
                        <button
                             onClick={() => handleIptalEt(bilet.biletId)}
                             className="iptal-et-button"
                             disabled={isCancellingMap[bilet.biletId]} // Bu bilete ait işlem sürerken butonu devre dışı bırak
                        >
                             {isCancellingMap[bilet.biletId] ? (
                                <Loader2 size={16} className="loading-icon" /> // Yüklenme ikonu
                             ) : (
                                <Trash2 size={16} />
                             )}
                            {isCancellingMap[bilet.biletId] ? 'Talep Gönderiliyor...' : 'İptal Talebi Oluştur'} {/* Buton metni ve ikon */}
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

    // Genel bir iptal işlemi loading mesajı (isteğe bağlı, isCancellingMap varken çok gerekli olmayabilir)
    {/* {Object.keys(isCancellingMap).length > 0 && <p className="biletlerim-cancelling-message">İptal talepleri işleniyor...</p>} */}

    return (
        <div className="biletlerim-container">
            <h1>Biletlerim</h1>
            <section className="bilet-bolumu">
                <h2><CalendarCheck size={24} /> Aktif Biletler ({aktifBiletler.length})</h2>
                {aktifBiletler.length > 0 ? (
                    <div className="bilet-listesi">
                        {aktifBiletler.map(bilet => (
                             // renderBiletKarti'yı çağırırken key prop'unu map içinde verin
                            <React.Fragment key={bilet.biletId}>
                                {renderBiletKarti(bilet, true)}
                            </React.Fragment>
                         ))}
                    </div>
                ) : (
                    <p>Henüz aktif bir biletiniz bulunmamaktadır.</p>
                )}
            </section>
            <section className="bilet-bolumu">
                <h2><CalendarX size={24} /> Geçmiş Biletler ({gecmisBiletler.length})</h2>
                {gecmisBiletler.length > 0 ? (
                    <div className="bilet-listesi">
                         {gecmisBiletler.map(bilet => (
                             <React.Fragment key={bilet.biletId}>
                                {renderBiletKarti(bilet, false)}
                            </React.Fragment>
                         ))}
                    </div>
                ) : (
                    <p>Geçmiş bir biletiniz bulunmamaktadır.</p>
                )}
            </section>
        </div>
    );
};

export default Biletlerim;