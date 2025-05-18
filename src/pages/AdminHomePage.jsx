// src/pages/AdminHomePage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import axios from '../api/axios'; // axios instance'ınızın doğru yolu
import { useAuth } from '../context/AuthContext'; // useAuth hook'unuz
import { toast } from 'react-toastify'; // Toast bildirimleri için
import '../components/AdminHomePage.css'; // Bu CSS dosyasını oluşturun
import { Trash2, AlertTriangle, Ticket, CalendarCheck, MapPin, Home, Tag, User } from 'lucide-react'; // İkonlar

// Bilet kartı göstermek için ayrı bir component oluşturmak temizlik sağlar
const AdminSilinecekBiletKarti = ({ biletData, onDelete }) => {
    // biletData SilinecekBiletDto yapısında: { kullanici: KullaniciEntity, biletDto: BiletDto }
    const { kullaniciDtoForSilinecekBiletDto, biletDto } = biletData;

    // BiletDto'dan gelen bilgiler
    const biletId = biletDto?.biletId; // DTO alan adı biletId
    const etkinlikAdi = biletDto?.etkinlikAdi || 'Bilinmiyor';
    const koltukNo = biletDto?.koltukNo || 'N/A';
    const odenenMiktar = biletDto?.odenenMiktar;
    const sehirAdi = biletDto?.sehirDto?.sehirAdi || 'Belirtilmemiş';
    const salonAdi = biletDto?.salonDto?.salonAdi || 'Belirtilmemiş';
    const salonAdres = biletDto?.salonDto?.salonAdresi || ''; // SalonDto'daki alan adı salonAdresi olarak görünüyor
    const seansTarih = biletDto?.seansEntity?.tarih
        ? new Date(biletDto.seansEntity.tarih).toLocaleString('tr-TR', {
              year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
          })
        : 'Belirtilmemiş';

    // Kullanıcı bilgisinden (SilinecekBiletDto'daki kullanici alanından)
    const kullaniciAdi = kullaniciDtoForSilinecekBiletDto?.kullaniciAdi || kullaniciDtoForSilinecekBiletDto?.email || 'Bilinmiyor'; // KullaniciEntity'deki alanları kontrol edin

    const handleSilClick = () => {
        if (biletId && onDelete) {
            onDelete(biletId);
        }
    };

    if (!biletDto || typeof biletId === 'undefined' || biletId === null) {
         console.error("AdminSilinecekBiletKarti: Bilet verisi eksik veya hatalı", biletData);
         return (
             <div className="admin-bilet-karti hatalı-veri">
                 <AlertTriangle size={24} /> Bilet bilgileri yüklenemedi.
             </div>
         );
     }


    return (
        <div className="admin-bilet-karti">
            <div className="bilet-bilgi-kolon">
                <h3>{etkinlikAdi}</h3>
                <p><CalendarCheck size={16} /> <strong>Seans:</strong> {seansTarih}</p>
                <p><MapPin size={16} /> <strong>Şehir:</strong> {sehirAdi}</p>
                <p><Home size={16} /> <strong>Salon:</strong> {salonAdi} {salonAdres && `(${salonAdres})`}</p>
                <p><Ticket size={16} /> <strong>Koltuk No:</strong> {koltukNo}</p>
                {typeof odenenMiktar === 'number' && (
                    <p><Tag size={16} /> <strong>Fiyat:</strong> {odenenMiktar.toFixed(2)} TL</p>
                )}
                <p><User size={16} /> <strong>Kullanıcı:</strong> {kullaniciAdi}</p>
            </div>
            <div className="bilet-sil-kolon">
                 <span>ID: {biletId}</span> {/* Bilet ID'si görünmesi admin için faydalı olabilir */}
                 <button onClick={handleSilClick} className="sil-butonu">
                    <Trash2 size={16} /> Sil
                </button>
            </div>
        </div>
    );
};


const AdminHomePage = () => {
    const { user } = useAuth(); // Admin kullanıcısı token'a sahip olmalı
    const [bilets, setBilets] = useState([]); // Silinecek biletler listesi
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    // Silme işlemi için loading state'i (isteğe bağlı, her bilet için ayrı tutulabilir)
    const [isDeleting, setIsDeleting] = useState(false);
    const token = user && user.token ? user.token : null;

    const fetchBilets = useCallback(async () => {
        if (!token) {
            setError("Yetkilendirme token'ı bulunamadı.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            // Backend endpoint'i: /adminMainPage/
            const response = await axios.get('/adminMainPage/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Silinecek Biletler API Yanıtı:", response.data);

            if (response.data && Array.isArray(response.data)) {
                 // Gelen veri SilinecekBiletDto listesi
                 // Kontrol: biletDto ve biletDto.biletId var mı?
                 const validBilets = response.data.filter(item =>
                     item && item.biletDto && typeof item.biletDto.biletId !== 'undefined' && item.biletDto.biletId !== null
                 );
                setBilets(validBilets);
                if (response.data.length !== validBilets.length) {
                    console.warn("API'den gelen bazı biletler eksik/hatalı bilgi içeriyordu (biletDto veya biletId).");
                }
                console.log(token);
            } else {
                setBilets([]); // Boş dizi set et
            }
        } catch (err) {
            console.error("Silinecek biletler alınırken hata oluştu:", err);
            setError(err.response?.data?.message || "Biletler yüklenirken bir sorun oluştu.");
            // Yetkilendirme hatası durumunda otomatik çıkış yaptırılabilir
             if (err.response?.status === 401 || err.response?.status === 403) {
                 toast.error("Bu sayfaya erişim yetkiniz yok veya oturum süreniz dolmuş.");
                 // logout(); // useAuth hook'undan logout çağrılır
                 // navigate("/giris"); // Login sayfasına yönlendir
             }
        } finally {
            setIsLoading(false);
        }
    }, [token]); // token değiştiğinde yeniden fetch yap

    useEffect(() => {
        fetchBilets();
    }, [fetchBilets]); // fetchBilets callback'i değiştiğinde (initial mount ve token değişimi)

    const handleDeleteBilet = useCallback(async (biletId) => {
         if (!token) {
             toast.error("Yetkilendirme token'ı bulunamadı. Lütfen tekrar giriş yapın.");
             return;
         }

        // Onay isteme
        const isConfirmed = window.confirm(`Bilet ID ${biletId} silinecek. Bu işlem geri alınamaz. Emin misiniz?`);
        if (!isConfirmed) {
            return; // Kullanıcı iptal ettiyse fonksiyondan çık
        }

        setIsDeleting(true); // Genel silme yüklenme state'i (tek bir bilet için de tutulabilir)
        try {
            // Backend endpoint'i: /adminMainPage/biletSil
            // Query parameter olduğu için params kullanıyoruz
            const response = await axios.delete('/adminMainPage/biletSil', {
                params: { biletId: biletId },
                headers: { Authorization: `Bearer ${token}` }                
            });

            if (response.data === true) {
                toast.success(`Bilet ID ${biletId} başarıyla silindi.`);
                // Listeden silinen bileti çıkar (daha hızlı güncelleme için)
                setBilets(prevBilets => prevBilets.filter(item => item.biletDto.biletId !== biletId));
            } else {
                 // Backend false döndürdüyse (örn: bilet bulunamadı)
                 toast.error(`Bilet ID ${biletId} silinemedi.`);
            }
        } catch (err) {
            console.error(`Bilet ID ${biletId} silinirken hata oluştu:`, err);
            toast.error(`Bilet silinirken bir sorun oluştu: ${err.response?.data?.message || err.message || 'Sunucu Hatası'}`);
            // Yetkilendirme hatası durumunda otomatik çıkış yaptırılabilir
             if (err.response?.status === 401 || err.response?.status === 403) {
                 toast.error("Bu işlemi yapmak için yetkiniz yok veya oturum süreniz dolmuş.");
                 // logout();
                 // navigate("/giris");
             }
        } finally {
            setIsDeleting(false); // Silme işlemi tamamlandı (başarılı veya başarısız)
        }
    }, [token]); // token değiştiğinde yeniden oluştur

    if (isLoading) {
        return <div className="admin-homepage-container loading-spinner-container"><div className="loading-spinner"></div></div>;
    }

    if (error) {
        return <div className="admin-homepage-container error-message-container"><AlertTriangle /> {error}</div>;
    }

    return (
        <div className="admin-homepage-container">
            <h1>İptal İstenen Biletler</h1>
            <p className="page-description">Onay bekleyen bilet iptal isteklerini buradan yönetebilirsiniz.</p>

            {/* Silme işlemi sürerken kullanıcıya bilgi verilebilir */}
            {isDeleting && <p className="deleting-message">Bilet siliniyor...</p>}

            {bilets.length === 0 ? (
                <p className="no-bilets-message">Silinecek bilet bulunmamaktadır.</p>
            ) : (
                <div className="admin-bilet-listesi">
                    {bilets.map(item => ( // item SilinecekBiletDto'dur
                        <AdminSilinecekBiletKarti
                            key={item.biletDto.biletId} // biletDto.biletId'yi key olarak kullanıyoruz
                            biletData={item}
                            onDelete={handleDeleteBilet}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminHomePage;