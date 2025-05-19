// OrganizatorHomePage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Edit3, XCircle, Film, VenetianMask } from "lucide-react"; // İkonlar eklendi
import '../components/OrganizatorHomePage.css';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import fragmanIcon from "../assets/fragmanIcon.png";

const OrganizatorHomePage = () => {
    const [etkinlikler, setEtkinlikler] = useState([]);
    const [selectedEtkinlik, setSelectedEtkinlik] = useState(null);
    const [etkinlikDetay, setEtkinlikDetay] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Yükleme durumu için state
    const [error, setError] = useState(null); // Hata durumu için state
    const [isDetayLoading, setIsDetayLoading] = useState(false); // Modal detay yükleme durumu

    const navigate = useNavigate();
    const token = localStorage.getItem("token"); // Token'ı bir değişkene alalım

    const fetchEtkinlikler = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get('http://localhost:8080/organizatorMainPage/', {
                headers: { Authorization: `Bearer ${token}` },
                // Sayfalama parametrelerini de ekleyebiliriz, şimdilik varsayılan
                // params: { page: 0, size: 10 }
            });
            if (response.data && response.data.content) {
                setEtkinlikler(response.data.content);
                console.log("Yüklenen etkinlikler:", response.data.content); // Gelen veriyi kontrol et
            } else {
                setEtkinlikler([]); // Beklenmedik yanıt formatı
            }
        } catch (err) {
            console.error('Etkinlikler yüklenemedi:', err);
            setError('Etkinlikler yüklenirken bir sorun oluştu.');
            toast.error('Etkinlikler yüklenemedi!');
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        Modal.setAppElement('#root');
        fetchEtkinlikler();
    }, [fetchEtkinlikler]);

    const fetchEtkinlikDetay = async (idToUse, etkinlikTurAdi) => {
            // idToUse artık sinemalar için doğru sinemaId'yi, diğerleri için etkinlikId'yi içermeli
            if (typeof idToUse === 'undefined' || idToUse === null || !etkinlikTurAdi) {
                toast.error("Etkinlik ID veya türü eksik, detaylar yüklenemiyor.");
                console.error("fetchEtkinlikDetay HATA: idToUse veya etkinlikTurAdi eksik.", { idToUse, etkinlikTurAdi });
                setEtkinlikDetay(null); // Detayı temizle
                setIsDetayLoading(false);
                return;
            }
            // ... (geri kalan kodunuz aynı, endpoint seçimi doğru ID (idToUse) ile yapılacak)
            setIsDetayLoading(true);
            setEtkinlikDetay(null);
            try {
                let endpoint = '';
                if (etkinlikTurAdi.toLowerCase() === "sinema") {
                    endpoint = `http://localhost:8080/organizatorMainPage/getCinema?sinemaId=${idToUse}`;
                } else {
                    endpoint = `http://localhost:8080/organizatorMainPage/getEtkinlik/${idToUse}`;
                }
                console.log("Detay için endpoint:", endpoint); // Bu logu kontrol edin!

                const response = await axios.get(endpoint, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setEtkinlikDetay(response.data);
                console.log("Yüklenen Etkinlik Detayı:", response.data);
            } catch (err) {
                console.error('Etkinlik detayları alınamadı:', err.response?.data || err.message);
                toast.error(err.response?.data?.message || 'Etkinlik detayları yüklenirken bir sorun oluştu.');
                setEtkinlikDetay(null);
            } finally {
                setIsDetayLoading(false);
            }
        };


    const openModal = (etkinlik) => {
            // 1. Temel veri kontrolü (etkinlik, id ve etkinlikTurAdi olmalı)
            if (!etkinlik || typeof etkinlik.id === 'undefined' || !etkinlik.etkinlikTurAdi) {
                console.error("openModal HATA: Etkinlik objesi eksik veya bozuk!", JSON.stringify(etkinlik, null, 2));
                toast.error("Etkinlik detayları açılamıyor: Temel etkinlik verisi eksik veya hatalı.");
                return;
            }
            console.log("openModal çağrıldı, gelen etkinlik:", JSON.stringify(etkinlik, null, 2));
            setSelectedEtkinlik(etkinlik);

            let idForDetailFetch = etkinlik.id; // Varsayılan olarak ana etkinlik ID'si
            const isSinemaEvent = etkinlik.etkinlikTurAdi.toLowerCase() === "sinema";

            if (isSinemaEvent) {
                if (typeof etkinlik.sinemaId !== 'undefined' && etkinlik.sinemaId !== null) {
                    // Backend'den EtkinlikForOrgDto içinde sinemaId (SinemaEntity'nin ID'si) geliyorsa onu kullan
                    idForDetailFetch = etkinlik.sinemaId;
                    console.log(`openModal (SİNEMA): fetchEtkinlikDetay için sinemaId (${idForDetailFetch}) kullanılacak.`);
                } else {
                    // EĞER EtkinlikForOrgDto'da sinemaId alanı yoksa veya null ise:
                    console.error("openModal HATA (SİNEMA): EtkinlikForOrgDto'dan beklenen 'sinemaId' alanı gelmedi veya null!", JSON.stringify(etkinlik, null, 2));
                    toast.error("Sinema etkinliği için gerekli Sinema ID'si bulunamadı. Detaylar yüklenemeyebilir.");
                }
            } else {
                console.log(`openModal (DİĞER): fetchEtkinlikDetay için etkinlik.id (${idForDetailFetch}) kullanılacak.`);
            }

            // fetchEtkinlikDetay çağrılırken doğru ID ve tür gönderilmeli
            fetchEtkinlikDetay(idForDetailFetch, etkinlik.etkinlikTurAdi);
            setIsModalOpen(true);
        };


    const closeModal = () => {
        setIsModalOpen(false);
        setEtkinlikDetay(null); // Modal kapanınca detayı temizle
        setSelectedEtkinlik(null);
    };

    const handleUpdate = () => {
        if (!etkinlikDetay) {
            toast.error("Güncellenecek etkinlik detayı bulunamadı.");
            return;
        }
        navigate("/etkinlik-olustur", {
            state: {
                editMode: true,
                etkinlikData: etkinlikDetay,
            }
        });
        closeModal();
    };

    const handleDelete = async () => {
            if (!selectedEtkinlik || typeof selectedEtkinlik.id === 'undefined' || !selectedEtkinlik.etkinlikTurAdi) {
                toast.error("Silinecek etkinlik veya etkinlik türü bilgisi bulunamadı.");
                return;
            }
            // selectedEtkinlik, EtkinlikForOrgDto'dan geliyor ve 'sinemaId' alanını içermeli.
            const { id: anaEtkinlikId, etkinlikAdi, etkinlikTurAdi, sinemaId: dtoSinemaId } = selectedEtkinlik;

            let endpoint = '';
            let idToDelete;
            const isSinemaEvent = etkinlikTurAdi.toLowerCase() === "sinema";

            if (isSinemaEvent) {
                if (typeof dtoSinemaId !== 'undefined' && dtoSinemaId !== null) { // EtkinlikForOrgDto'dan gelen sinemaId'yi kullan
                    idToDelete = dtoSinemaId;
                    endpoint = `http://localhost:8080/organizatorMainPage/deleteCinema?sinemaId=${idToDelete}`;
                    console.log(`handleDelete (SİNEMA): Endpoint: ${endpoint}, Silinecek Sinema ID: ${idToDelete}`);
                } else {
                    toast.error("Silinecek sinema etkinliği için Sinema ID bulunamadı. Backend DTO'sunu kontrol edin.");
                    console.error("handleDelete HATA (SİNEMA): selectedEtkinlik.sinemaId eksik veya null!", selectedEtkinlik);
                    // Sinema silme için etkinlikDetay.sinemaId'ye güvenmek yerine doğrudan DTO'dan almalıyız.
                    // Eğer DTO'da yoksa, silme işlemi yapılamaz.
                    return; // Silme işlemini yapma
                }
            } else {
                idToDelete = anaEtkinlikId;
                endpoint = `http://localhost:8080/organizatorMainPage/deleteEvent/${idToDelete}`;
                console.log(`handleDelete (DİĞER): Endpoint: ${endpoint}, Silinecek Etkinlik ID: ${idToDelete}`);
            }

            const confirmMessage = `"${etkinlikAdi}" adlı ${etkinlikTurAdi} etkinliğini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`;
            if (!window.confirm(confirmMessage)) {
                return;
            }

            try {
                await axios.delete(endpoint, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success(`"${etkinlikAdi}" etkinliği başarıyla silindi.`);
                setEtkinlikler(prevEtkinlikler => prevEtkinlikler.filter(e => e.id !== anaEtkinlikId));
                closeModal();
            } catch (err) {
                console.error('Etkinlik silinemedi:', err.response?.data || err.message);
                toast.error(err.response?.data?.message || `Etkinlik silinirken bir hata oluştu.`);
            }
        };
    console.log("etkinlik payload", etkinlikler);
    const currentEtkinlikler = etkinlikler.filter(etkinlik => !etkinlik.tarihiGectiMi);
    const pastEtkinlikler = etkinlikler.filter(etkinlik => etkinlik.tarihiGectiMi);

    if (isLoading) {
        return <div className="loading-container">Etkinlikler yükleniyor...</div>;
    }

    if (error) {
        return <div className="error-container">{error} <button onClick={fetchEtkinlikler}>Tekrar Dene</button></div>;
    }

    return (
        <div className="organizator-home-page">
            <h1 className="ohp-page-title">ETKİNLİKLERİM</h1>
            {etkinlikler.length === 0 && !isLoading && (
                <div className="empty-state">
                    <p>Henüz bir etkinliğiniz bulunmuyor.</p>
                    <p>Yeni bir etkinlik oluşturmak için aşağıdaki '+' butonuna tıklayın.</p>
                </div>
            )}

            {/*Güncel etkinlikler kısmı */}
            {!isLoading && etkinlikler.length > 0 && (
                <div className="current-events-section">
                    <h2 className="ohp-section-title">Güncel Etkinlikler</h2>
                    {currentEtkinlikler.length === 0 ? (
                        <p className="section-empty-message">Aktif veya gelecekteki etkinliğiniz bulunmuyor.</p>
                    ) : (
                        <div className="etkinlikler-container">
                            {currentEtkinlikler.map(etkinlik => (
                                <div
                                    key={etkinlik.id}
                                    className={`etkinlik-kart ${etkinlik.tarihiGectiMi ? 'past-event-card' : ''}`}
                                    onClick={() => openModal(etkinlik)}
                                >
                                    <div className="etkinlik-kart-header">
                                        <span className={`ohp-etkinlik-tur-adi ${etkinlik.etkinlikTurAdi?.toLowerCase()}`}>
                                            {etkinlik.etkinlikTurAdi?.toLowerCase() === "sinema" ? <Film size={20}/> : <VenetianMask size={20}/>}
                                            {etkinlik.etkinlikTurAdi || "Belirsiz"}
                                        </span>
                                        {etkinlik.yasSiniri > 0 && <span className="yas-siniri">{etkinlik.yasSiniri}+ </span>}
                                    </div>
                                    <div className="kapak-container">
                                        <img
                                            src={etkinlik.kapakFotografi || 'https://via.placeholder.com/300x200?text=Afiş+Yok'}
                                            alt={etkinlik.etkinlikAdi}
                                            className="kapak-fotografi"
                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x200?text=Afiş+Hatalı'; }}
                                        />
                                    </div>
                                    <div className="etkinlik-kart-bilgi">
                                        <h3>{etkinlik.etkinlikAdi}</h3>
                                        {etkinlik.etkinlikSuresi > 0 && <p className="sure">Süre: {etkinlik.etkinlikSuresi} dk</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/*Güncel etkinlikler kısmı */}
            {!isLoading && etkinlikler.length > 0 && (
                <div className="past-events-section">
                    <h2 className="ohp-section-title">Geçmiş Etkinlikler</h2>
                    {pastEtkinlikler.length === 0 ? (
                        <p className="section-empty-message">Geçmiş etkinliğiniz bulunmuyor.</p>
                    ) : (
                        <div className="etkinlikler-container">
                            {pastEtkinlikler.map(etkinlik => (
                                <div
                                    key={etkinlik.id}
                                    className={`etkinlik-kart ${etkinlik.tarihiGectiMi ? 'past-event-card' : ''}`}
                                    onClick={() => openModal(etkinlik)}
                                >
                                    <div className="etkinlik-kart-header">
                                        <span className={`ohp-etkinlik-tur-adi ${etkinlik.etkinlikTurAdi?.toLowerCase()}`}>
                                            {etkinlik.etkinlikTurAdi?.toLowerCase() === "sinema" ? <Film size={20}/> : <VenetianMask size={20}/>}
                                            {etkinlik.etkinlikTurAdi || "Belirsiz"}
                                        </span>
                                        {etkinlik.yasSiniri > 0 && <span className="yas-siniri">{etkinlik.yasSiniri}+ </span>}
                                    </div>
                                    <div className="kapak-container">
                                        <img
                                            src={etkinlik.kapakFotografi || 'https://via.placeholder.com/300x200?text=Afiş+Yok'}
                                            alt={etkinlik.etkinlikAdi}
                                            className="kapak-fotografi"
                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x200?text=Afiş+Hatalı'; }}
                                        />
                                    </div>
                                    <div className="etkinlik-kart-bilgi">
                                        <h3>{etkinlik.etkinlikAdi}</h3>
                                        {etkinlik.etkinlikSuresi > 0 && <p className="sure">Süre: {etkinlik.etkinlikSuresi} dk</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <button
                className="plus-button"
                onClick={() => navigate("/etkinlik-olustur")}
                title="Yeni Etkinlik Oluştur"
            >
                <Plus size={32} />
            </button>

            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Etkinlik Detayları"
                className="ReactModal__Content" // CSS'te stil verilecek
                overlayClassName="ReactModal__Overlay" // CSS'te stil verilecek
            >
                {isDetayLoading && <div className="modal-loading">Detaylar yükleniyor...</div>}
                {!isDetayLoading && etkinlikDetay && selectedEtkinlik && (
                    <>
                        <button onClick={closeModal} className="modal-close-button" aria-label="Kapat">
                            <XCircle size={24} />
                        </button>

                        {(() => {
                            const isSinema = selectedEtkinlik.etkinlikTurAdi?.toLowerCase() === "sinema";

                            // Eğer sinema ise ve etkinlikDetay.etkinlikForOrgDetayDto varsa onu kullan,
                            // değilse (veya normal etkinlikse) doğrudan etkinlikDetay'ı kullan.
                            const gosterilecekEtkinlikBilgileri = isSinema && etkinlikDetay.etkinlikForOrgDetayDto
                                ? etkinlikDetay.etkinlikForOrgDetayDto
                                : etkinlikDetay;
                            if (!gosterilecekEtkinlikBilgileri || typeof gosterilecekEtkinlikBilgileri.etkinlikID === 'undefined') {
                                return (
                                    <div className="modal-error">
                                        Etkinlik detayları tam olarak yüklenemedi. Veri yapısı beklenenden farklı.
                                    </div>
                                );
                            }

                            const isPastEvent = selectedEtkinlik.tarihiGectiMi;

                            return (
                                <>
                                    <div className="modal-header">
                                        <h2>{selectedEtkinlik.etkinlikAdi} ({selectedEtkinlik.etkinlikTurAdi})</h2>
                                        {(gosterilecekEtkinlikBilgileri.kapakFotografi || selectedEtkinlik.kapakFotografi) && (
                                            <img
                                                src={gosterilecekEtkinlikBilgileri.kapakFotografi || selectedEtkinlik.kapakFotografi}
                                                alt={selectedEtkinlik.etkinlikAdi}
                                                className="modal-kapak-fotografi"
                                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x250?text=Afiş+Hatalı'; }}
                                            />
                                        )}
                                    </div>

                                    <div className="modal-body">
                                        <p><strong>Açıklama:</strong> {gosterilecekEtkinlikBilgileri.etkinlikAciklamasi}</p>
                                        <p><strong>Bilet Fiyatı:</strong> {gosterilecekEtkinlikBilgileri.biletFiyati?.toFixed(2)} TL</p>
                                        <p><strong>Süre:</strong> {gosterilecekEtkinlikBilgileri.etkinlikSuresi} dakika</p>
                                        <p><strong>Yaş Sınırı:</strong> {gosterilecekEtkinlikBilgileri.yasSiniri}+</p>

                                        {/* Sinemaya özel alanlar - Bunlar ana etkinlikDetay objesinden (SinemaForOrgDetayDto) gelir */}
                                        {isSinema && etkinlikDetay.sinemaId && ( // etkinlikDetay.sinemaId kontrolü de eklendi
                                            <>
                                                {etkinlikDetay.imdbPuani > 0 && <p><strong>IMDb Puanı:</strong> {etkinlikDetay.imdbPuani}</p>}
                                                {etkinlikDetay.fragmanLinki && (
                                                    <p>
                                                        <a
                                                            href={etkinlikDetay.fragmanLinki}
                                                            target="_blank" rel="noopener noreferrer"
                                                            className="fragman-linki"
                                                        >
                                                            Fragman
                                                            <img
                                                                src={fragmanIcon}
                                                                alt="fragman ikonu"
                                                                className="fragman-icon"
                                                            />
                                                        </a>
                                                    </p>
                                                )}
                                            </>
                                        )}

                                        {gosterilecekEtkinlikBilgileri.etkinlikSalonSeansEntities?.[0]?.etkinlik?.sehir &&
                                            <p><strong>Şehir:</strong> {gosterilecekEtkinlikBilgileri.etkinlikSalonSeansEntities[0].etkinlik.sehir.sehirAdi}</p>
                                        }

                                        <h3 className="modal-ara-baslik">Seanslar:</h3>
                                        {gosterilecekEtkinlikBilgileri.etkinlikSalonSeansEntities && gosterilecekEtkinlikBilgileri.etkinlikSalonSeansEntities.length > 0 ? (
                                            <ul className="seans-listesi">
                                                {gosterilecekEtkinlikBilgileri.etkinlikSalonSeansEntities.map((ess, index) => (
                                                    <li key={ess.etkinlikSalonSeansID || index}>
                                                        <p><strong>Mekan:</strong> {ess.salon.salonAdi}</p>
                                                        <p><strong>Tarih:</strong> {new Date(ess.seans.tarih).toLocaleString('tr-TR', {
                                                            weekday: 'long', year: 'numeric', month: 'long',
                                                            day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul'
                                                        })}</p>
                                                        <p><strong>Adres:</strong> {ess.salon.adres}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p>Bu etkinlik için seans bulunmamaktadır.</p>
                                        )}

                                        {gosterilecekEtkinlikBilgileri.organizator && (
                                            <div className="organizator-bilgileri">
                                                <h3 className="modal-ara-baslik">Organizatör Bilgileri</h3>
                                                <p><strong>Ad Soyad:</strong> {gosterilecekEtkinlikBilgileri.organizator.adSoyad}</p>
                                                <p><strong>Email:</strong> {gosterilecekEtkinlikBilgileri.organizator.email}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="modal-actions">
                                        {/* Eğer etkinlik geçmişte DEĞİLSE (tarihiGectiMi false ise) bu butonları göster */}
                                        {!isPastEvent && (
                                            <>
                                                <button onClick={handleUpdate} className="modal-button update">
                                                    <Edit3 size={18} /> Güncelle
                                                </button>
                                                <button onClick={handleDelete} className="modal-button delete">
                                                    <Trash2 size={18} /> Sil
                                                </button>
                                            </>
                                        )}
                                        <button onClick={closeModal} className="modal-button close-alt">
                                            Kapat
                                        </button>
                                    </div>
                                </>
                            );
                        })()}
                    </>
                )}
                {!isDetayLoading && !etkinlikDetay && isModalOpen && ( // Modal açıksa ve detay yoksa hata göster
                    <div className="modal-error">
                         <button onClick={closeModal} className="modal-close-button" aria-label="Kapat">
                            <XCircle size={24} />
                        </button>
                        Etkinlik detayları yüklenemedi veya bulunamadı. Lütfen tekrar deneyin.
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default OrganizatorHomePage;