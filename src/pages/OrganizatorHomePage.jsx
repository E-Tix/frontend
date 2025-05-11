// OrganizatorHomePage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Edit3, XCircle } from "lucide-react"; // İkonlar eklendi
import '../components/OrganizatorHomePage.css';
import Modal from 'react-modal';
import { toast } from 'react-toastify'; // Toast mesajları için

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

    const fetchEtkinlikDetay = async (etkinlikId, etkinlikTuru) => { // Parametreleri değiştirdik
        if (!etkinlikId) return;
        setIsDetayLoading(true);
        setEtkinlikDetay(null); // Önceki detayı temizle
        try {
            let endpoint = '';
            // selectedEtkinlik.etkinlikTuru burada henüz set edilmemiş olabilir.
            // Ana listeden gelen etkinlik objesinde etkinlik türü bilgisi olmalı.
            // Şimdilik, openModal'a tıklanan kartın verisinden etkinlik türünü alacağız.
            // Ancak backend'den gelen EtkinlikForOrgDto'da etkinlikTuru alanı yok. Bu bir sorun.
            // Backend / endpoint'i EtkinlikForOrgDto dönerken tür bilgisini de eklemeli.
            // GEÇİCİ VARSAYIM: selectedEtkinlik.etkinlikTuru dolu olacak veya etkinlikTuru parametresi kullanılacak.

            // Backend'den gelen `EtkinlikForOrgDto` içinde etkinlik türü bilgisi olmadığı için
            // tıklanan kartın `etkinlik.id`'sini ve bir şekilde türünü bilmemiz gerekiyor.
            // Eğer `etkinlik.id` Sinema ise farklı, değilse farklı.
            // Bu bilgiye `OrganizatorHomePage`'deki `etkinlikler` listesindeki objeden ulaşamıyoruz.
            // Bu büyük bir eksiklik. Şimdilik bir TRY-CATCH ile önce birini deneyip olmazsa diğerini deneyebiliriz
            // ya da `selectedEtkinlik`'e `etkinlikTuru` diye bir alan manuel eklememiz lazım.

            // ---- EN İYİ ÇÖZÜM: Backend / endpoint'i EtkinlikForOrgDto'ya etkinlikTur alanı eklemeli. ----
            // Şimdilik, frontend'de bir ayrım yapamıyoruz. Sadece genel endpoint'i deneyelim.
            // Eğer backend'de `/getEtkinlik/{id}` ve `/getCinema?sinemaId={id}` farklı DTO'lar dönüyorsa
            // ve bu DTO'ların yapısı EtkinlikOlustur'a gönderilecek etkinlikData için önemliyse bu ayrım şart.

            // Varsayım: `etkinlikTuru` parametresi `openModal` çağrılırken doğru şekilde sağlanıyor.
            // Ya da, `selectedEtkinlik` objesine (ana listeden gelen) `etkinlikTuruAdi` gibi bir alan backend tarafından eklenmeli.
            // Biz `selectedEtkinlik` üzerinden gidelim ve `etkinlikTuru` diye bir alan bekleyelim.

            console.log("Detay için seçilen etkinlik:", selectedEtkinlik);
            console.log("Parametre olarak gelen etkinlikTuru:", etkinlikTuru);


            // ETKİNLİK TÜRÜ AYRIMI İÇİN BACKEND GÜNCELLEMESİ GEREKİYOR
            // Şimdilik, gelen `etkinlikTuru` parametresine (eğer varsa) veya `selectedEtkinlik.etkinlikTurAdi` gibi bir alana güveneceğiz.
            // `etkinlikler` listesindeki objelerde `etkinlikTurAdi` alanı OLMADIĞINDAN bu kısım sorunlu.
            // `OrganizatorLandingService.getEtkinlikler` metodunun döndürdüğü `EtkinlikForOrgDto`'ya
            // `etkinlikTurAdi` veya `isSinema` gibi bir boolean alan eklenmeli.

            // ---- GEÇİCİ ÇÖZÜM (Backend güncellenene kadar çok güvenilir değil) ----
            // Backend'den gelen EtkinlikForOrgDto'da etkinlik türü bilgisi yok.
            // Bu yüzden modal açılırken hangi endpoint'i çağıracağımızı bilemiyoruz.
            // Bu KISIM ŞU AN DOĞRU ÇALIŞMAYACAKTIR.
            // Manuel olarak bir etkinlik türü belirlememiz gerekiyor ya da backend'i güncellememiz.
            // `etkinlik.id` üzerinden her iki endpoint'i de denemek kötü bir pratik olur.

            // ---- DÜZELTİLMESİ GEREKEN YER ----
            // Varsayalım ki `selectedEtkinlik.isSinema` diye bir alan backend'den geliyor (İDEAL DURUM)
            // if (selectedEtkinlik.isSinema) {
            // VEYA `etkinlikTuru` parametresini kullanalım (eğer `openModal`'a eklersek)
            if (etkinlikTuru === "Sinema") { // Bu "Sinema" string'i backend'deki tür adıyla eşleşmeli
                endpoint = `http://localhost:8080/organizatorMainPage/getCinema?sinemaId=${etkinlikId}`;
            } else {
                endpoint = `http://localhost:8080/organizatorMainPage/getEtkinlik/${etkinlikId}`;
            }
            console.log("Detay için endpoint:", endpoint);

            const response = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setEtkinlikDetay(response.data);
            console.log("Yüklenen Etkinlik Detayı:", response.data);

        } catch (err) {
            console.error('Etkinlik detayları alınamadı:', err);
            toast.error('Etkinlik detayları yüklenirken bir sorun oluştu.');
            // Eğer bir endpoint hata verirse diğerini denemek (çok kötü bir pattern ama geçici):
            // Bu kısım ciddi şekilde refactor edilmeli veya backend güncellenmeli.
            // if (err.response && (etkinlikTuru !== "Sinema")) { // Eğer ilk deneme normal etkinliktiyse ve hata verdiyse, sinemayı dene
            //     try {
            //         const altEndpoint = `http://localhost:8080/organizatorMainPage/getCinema?sinemaId=${etkinlikId}`;
            //         const altResponse = await axios.get(altEndpoint, { headers: { Authorization: `Bearer ${token}` } });
            //         setEtkinlikDetay(altResponse.data);
            //         setSelectedEtkinlik(prev => ({...prev, actualEtkinlikTuru: "Sinema"})); // Gerçek türü kaydet
            //     } catch (altErr) {
            //         console.error('Alternatif etkinlik detayı da alınamadı:', altErr);
            //     }
            // }
        } finally {
            setIsDetayLoading(false);
        }
    };


    const openModal = (etkinlik) => {
        // ETKİNLİK TÜRÜ SORUNU: `etkinlik` objesinde (EtkinlikForOrgDto'dan gelen) tür bilgisi yok.
        // Bu yüzden fetchEtkinlikDetay hangi endpoint'i çağıracağını bilemez.
        // Geçici olarak, tüm etkinliklerin "Normal" olduğunu varsayalım veya
        // `etkinlik.id`'si üzerinden bir mantık kurmaya çalışalım (önerilmez).
        // İDEAL: `etkinlik` objesi `etkinlikTuruAdi` veya `isSinema` gibi bir alan içermeli.
        setSelectedEtkinlik(etkinlik); // id, etkinlikAdi, kapakFotografi, yasSiniri, etkinlikSuresi var. TÜR YOK!

        // ---- BACKEND GÜNCELLEMESİ GEREKLİ ----
        // Şimdilik türü "Bilinmiyor" olarak yollayalım veya fetchEtkinlikDetay içinde zor bir mantık kuralım.
        // `WorkspaceEtkinlikDetay` fonksiyonu bu haliyle doğru çalışmayacak.
        // Bu sorunu çözmek için `EtkinlikForOrgDto`'ya backend'de `etkinlikTurAdi` eklenmeli.
        // O zamana kadar, fetchEtkinlikDetay içinde iki endpoint'i de deneme gibi kötü bir yola başvurulabilir
        // ya da kullanıcıya tür seçtirilebilir (ki bu anlamsız olur).
        // Şimdilik, fetchEtkinlikDetay'ı tüm etkinlikler normalmiş gibi çağıralım,
        // sinema detayı gelmeyecektir veya hata verecektir.
        // VEYA etkinlik objesine manuel bir özellik ekleyebiliriz (test için)
        // const etkinlikTuruForDetay = etkinlik.etkinlikAdi.toLowerCase().includes("sinema") ? "Sinema" : "Normal";
        // fetchEtkinlikDetay(etkinlik.id, etkinlikTuruForDetay);

        // Şimdilik, etkinlik türünü manuel olarak gönderemiyoruz, çünkü bilmiyoruz.
        // fetchEtkinlikDetay fonksiyonu `selectedEtkinlik` üzerinden bir çıkarım yapmaya çalışacak
        // veya default bir endpoint kullanacak. Bu kısım DÜZELTİLMELİ.
        // Geçici olarak, etkinlik ID'sini yollayalım, fetchEtkinlikDetay içinde bir endpoint'i default seçsin.
        // Bu, sinema detaylarının yüklenmemesine neden olabilir.
        fetchEtkinlikDetay(etkinlik.id, "Normal"); // GEÇİCİ: Türü "Normal" varsayıyoruz. SİNEMALAR İÇİN YANLIŞ ÇALIŞIR.
                                                  // EtkinlikForOrgDto'ya etkinlikTurAdi eklenmeli.

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
        // Etkinlik türünü etkinlikDetay'dan almamız lazım.
        // etkinlikDetay.etkinlikTur.etkinlikTurAdi veya etkinlikDetay.sinemaId gibi.
        const isSinema = !!etkinlikDetay.sinemaId; // Eğer SinemaForOrgDetayDto ise sinemaId olacak
                                                 // EtkinlikForOrgDetayDto ise etkinlikDetay.etkinlikTur.etkinlikTurAdi

        navigate("/etkinlik-olustur", {
            state: {
                editMode: true,
                etkinlikData: etkinlikDetay, // Bu etkinlikDetay, SinemaForOrgDetayDto veya EtkinlikForOrgDetayDto olmalı
                // EtkinlikOlustur.jsx bu iki farklı DTO yapısını da handle edebilmeli (isSinema bilgisiyle)
            }
        });
        closeModal();
    };

    const handleDelete = async () => {
        if (!selectedEtkinlik || !selectedEtkinlik.id) {
            toast.error("Silinecek etkinlik bulunamadı.");
            return;
        }

        // ETKİNLİK TÜRÜ SORUNU: Silme için de türü bilmemiz gerekiyor.
        // `selectedEtkinlik` (EtkinlikForOrgDto'dan gelen) tür bilgisini içermiyor.
        // `etkinlikDetay` yüklendiyse oradan alabiliriz.
        let isSinemaEvent = false;
        let eventIdToDelete = selectedEtkinlik.id;

        if (etkinlikDetay) { // Detay yüklendiyse oradan türü al
            isSinemaEvent = !!etkinlikDetay.sinemaId; // SinemaForOrgDetayDto ise sinemaId olacak
            if (isSinemaEvent && etkinlikDetay.sinemaId) {
                 // Normalde sinema silerken sinemaId kullanılır, etkinlikId değil.
                 // Backend /deleteCinema?sinemaId={id} bekliyor.
                 // Backend /deleteEvent/{eventId} bekliyor.
                 // `selectedEtkinlik.id` ana etkinlik ID'si mi sinema ID'si mi?
                 // Ana listedeki `etkinlik.id` alanı EtkinlikForOrgDto'dan geliyor, bu ana etkinlik ID'si (`etkinlikID`).
                 // Sinema ise `sinemaId`'yi `etkinlikDetay`'dan almamız lazım.

                // Eğer etkinlikDetay.sinemaId varsa, bu bir sinema etkinliğidir.
                // Backend /deleteCinema endpoint'i sinemaId bekler.
                // selectedEtkinlik.id, EtkinlikForOrgDto'dan gelen etkinlikID'dir.
                // Eğer sinema ise, silme işlemi için sinemaId'ye ihtiyacımız var.
                // Bu durumda `etkinlikDetay.sinemaId`'yi kullanmalıyız.
                if (etkinlikDetay.sinemaId) {
                    eventIdToDelete = etkinlikDetay.sinemaId; // Silme için sinema ID'sini kullan
                } else {
                    // Bu durum olmamalı, SinemaForOrgDetayDto'da sinemaId olmalı.
                    toast.error("Sinema ID'si bulunamadı, silme işlemi yapılamıyor.");
                    return;
                }
            }
        } else {
            // Detay yüklenmediyse, türü tahmin etmek zor.
            // Bu ciddi bir sorun. Kullanıcıya sorulabilir veya varsayım yapılabilir (önerilmez).
            // **ÇÖZÜM:** `EtkinlikForOrgDto`'ya `isSinema` veya `etkinlikTuruAdi` eklenmeli.
            // Şimdilik, silme işlemini sadece normal etkinlikler için çalışacakmış gibi yapalım
            // veya kullanıcıya sormayı deneyelim (kötü UX).
            toast.warn("Etkinlik türü belirlenemedi. Silme işlemi riskli olabilir. Lütfen etkinliği tekrar açıp silmeyi deneyin.");
            // Veya en azından bir endpoint'i deneyelim.
            // isSinemaEvent = selectedEtkinlik.etkinlikAdi.toLowerCase().includes("sinema"); // Çok zayıf bir tahmin
            // console.warn("Etkinlik türü tahmin ediliyor, bu güvenilir değil:", isSinemaEvent);
            // Eğer türü bilemiyorsak, silme işlemini yapmamak en iyisi.
            // Ama isteğiniz silme olduğu için birini deneyeceğiz.
            // KULLANICIDAN ONAY ALIRKEN TÜRÜ DE BELİRTEBİLİRİZ.
             const confirmDelete = window.confirm(
                `"${selectedEtkinlik.etkinlikAdi}" etkinliğini silmek istediğinize emin misiniz? ` +
                `Bu işlem geri alınamaz. (Tür belirlenemedi, normal etkinlik olarak silinmeye çalışılacak.)`
            );
            if (!confirmDelete) return;
            // isSinemaEvent false kalacak, /deleteEvent çağrılacak. Sinema ise hata verir.
        }


        const endpoint = isSinemaEvent
            ? `http://localhost:8080/organizatorMainPage/deleteCinema?sinemaId=${eventIdToDelete}`
            : `http://localhost:8080/organizatorMainPage/deleteEvent/${selectedEtkinlik.id}`; // Normal etkinlik için selectedEtkinlik.id (ana etkinlik ID)

        if (isSinemaEvent && !etkinlikDetay?.sinemaId) {
            toast.error("Sinema etkinliği silinemedi: Sinema ID'si bulunamadı. Lütfen etkinliği modalda açıp tekrar deneyin.");
            return;
        }

        if (!isSinemaEvent && !window.confirm(`"${selectedEtkinlik.etkinlikAdi}" adlı NORMAL etkinliği silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) return;
        if (isSinemaEvent && !window.confirm(`"${etkinlikDetay?.etkinlikAdi || selectedEtkinlik.etkinlikAdi}" adlı SİNEMA etkinliğini (${eventIdToDelete}) silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) return;


        console.log("Silme endpoint:", endpoint);
        console.log("Silinecek ID (sinema ise sinemaId, değilse etkinlikId):", isSinemaEvent ? eventIdToDelete : selectedEtkinlik.id);

        try {
            await axios.delete(endpoint, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success(`"${selectedEtkinlik.etkinlikAdi}" etkinliği başarıyla silindi.`);
            setEtkinlikler(prevEtkinlikler => prevEtkinlikler.filter(e => e.id !== selectedEtkinlik.id));
            closeModal();
        } catch (err) {
            console.error('Etkinlik silinemedi:', err.response?.data || err.message);
            toast.error(err.response?.data?.message || `Etkinlik silinirken bir hata oluştu: ${err.message}`);
        }
    };


    if (isLoading) {
        return <div className="loading-container">Etkinlikler yükleniyor...</div>;
    }

    if (error) {
        return <div className="error-container">{error} <button onClick={fetchEtkinlikler}>Tekrar Dene</button></div>;
    }

    return (
        <div className="organizator-home-page">
            <h1 className="page-title">Etkinliklerim</h1>
            {etkinlikler.length === 0 && !isLoading && (
                <div className="empty-state">
                    <p>Henüz bir etkinliğiniz bulunmuyor.</p>
                    <p>Yeni bir etkinlik oluşturmak için aşağıdaki '+' butonuna tıklayın.</p>
                </div>
            )}
            <div className="etkinlikler-container">
                {etkinlikler.map(etkinlik => (
                    <div key={etkinlik.id} className="etkinlik-kart" onClick={() => openModal(etkinlik)}>
                        <div className="kapak-container">
                            <img
                                src={etkinlik.kapakFotografi || 'https://via.placeholder.com/300x200?text=Afiş Yok'}
                                alt={etkinlik.etkinlikAdi}
                                className="kapak-fotografi"
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x200?text=Afiş Hatalı'; }}
                            />
                            {etkinlik.yasSiniri > 0 && <span className="yas-siniri">{etkinlik.yasSiniri}+ </span>}
                        </div>
                        <div className="etkinlik-kart-bilgi">
                            <h3>{etkinlik.etkinlikAdi}</h3>
                            {etkinlik.etkinlikSuresi > 0 && <p>Süre: {etkinlik.etkinlikSuresi} dk</p>}
                            {/* EtkinlikForOrgDto'da tarih bilgisi de olsaydı (örn: ilk seans tarihi) gösterilebilirdi */}
                        </div>
                    </div>
                ))}
            </div>

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
                //className="ReactModal__Content"
                //overlayClassName="ReactModal__Overlay"
                style={{ // Temel görünürlük için inline stil
                    overlay: {
                        backgroundColor: 'rgba(0, 0, 0, 0.75)',
                        zIndex: 1,
                    },
                    content: {
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '80%',
                        height: 'auto',
                        border: '1px solid #ccc',
                        background: '#fff',
                        overflow: 'auto',
                        WebkitOverflowScrolling: 'touch',
                        borderRadius: '10px',
                        outline: 'none',
                        padding: '20px',
                        zIndex: 2,
                    }
                }}
            >
                {isDetayLoading && <div className="modal-loading">Detaylar yükleniyor...</div>}
                {!isDetayLoading && etkinlikDetay && selectedEtkinlik && (
                    <>
                        <button onClick={closeModal} className="modal-close-button" aria-label="Kapat">
                            <XCircle size={24} />
                        </button>
                        <div className="modal-header">
                            <h2>{etkinlikDetay.etkinlikAdi || selectedEtkinlik.etkinlikAdi}</h2>
                            {etkinlikDetay.kapakFotografi && ( // Detayda kapak fotoğrafı varsa göster
                                <img src={etkinlikDetay.kapakFotografi} alt={etkinlikDetay.etkinlikAdi} className="modal-kapak-fotografi" />
                            )}
                        </div>

                        <div className="modal-body">
                            <p><strong>Açıklama:</strong> {etkinlikDetay.etkinlikAciklamasi}</p>
                            <p><strong>Bilet Fiyatı:</strong> {etkinlikDetay.biletFiyati} TL</p>
                            <p><strong>Süre:</strong> {etkinlikDetay.etkinlikSuresi} dakika</p>
                            <p><strong>Yaş Sınırı:</strong> {etkinlikDetay.yasSiniri}+</p>
                            {etkinlikDetay.etkinlikTur && <p><strong>Tür:</strong> {etkinlikDetay.etkinlikTur.etkinlikTurAdi}</p>}
                            {etkinlikDetay.sinemaId && etkinlikDetay.imdbPuani > 0 && <p><strong>IMDb Puanı:</strong> {etkinlikDetay.imdbPuani}</p>}
                            {etkinlikDetay.sinemaId && etkinlikDetay.fragmanLinki && (
                                <p><strong>Fragman:</strong> <a href={etkinlikDetay.fragmanLinki} target="_blank" rel="noopener noreferrer">İzle</a></p>
                            )}

                            {/* Şehir bilgisi artık etkinlikSalonSeansEntities içindeki etkinlik.sehir'den değil, doğrudan etkinlikDetay.sehir'den gelmeli (eğer DTO güncellenirse)*/}
                            {etkinlikDetay.etkinlikSalonSeansEntities?.[0]?.etkinlik?.sehir &&
                                <p><strong>Şehir:</strong> {etkinlikDetay.etkinlikSalonSeansEntities[0].etkinlik.sehir.sehirAdi}</p>
                            }


                            <h4>Seanslar:</h4>
                            {etkinlikDetay.etkinlikSalonSeansEntities && etkinlikDetay.etkinlikSalonSeansEntities.length > 0 ? (
                                <ul className="seans-listesi">
                                    {etkinlikDetay.etkinlikSalonSeansEntities.map((ess, index) => (
                                        <li key={ess.etkinlikSalonSeansID || index}>
                                            <p><strong>Mekan:</strong> {ess.salon.salonAdi}</p>
                                            <p><strong>Tarih:</strong> {new Date(ess.seans.tarih).toLocaleString('tr-TR', {
                                                weekday: 'long', year: 'numeric', month: 'long',
                                                day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}</p>
                                            <p><strong>Adres:</strong> {ess.salon.adres}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>Bu etkinlik için seans bulunmamaktadır.</p>
                            )}

                            {etkinlikDetay.organizator && (
                                <div className="organizator-bilgileri">
                                    <h4>Organizatör Bilgileri</h4>
                                    <p><strong>Ad Soyad:</strong> {etkinlikDetay.organizator.adSoyad}</p>
                                    <p><strong>Email:</strong> {etkinlikDetay.organizator.email}</p>
                                    <p><strong>Telefon:</strong> {etkinlikDetay.organizator.telefonNumarasi}</p>
                                </div>
                            )}
                        </div>

                        <div className="modal-actions">
                            <button onClick={handleUpdate} className="modal-button update">
                                <Edit3 size={18} /> Güncelle
                            </button>
                            <button onClick={handleDelete} className="modal-button delete">
                                <Trash2 size={18} /> Sil
                            </button>
                            <button onClick={closeModal} className="modal-button close-alt">
                                Kapat
                            </button>
                        </div>
                    </>
                )}
                {!isDetayLoading && !etkinlikDetay && (
                    <div className="modal-error">
                         <button onClick={closeModal} className="modal-close-button" aria-label="Kapat">
                            <XCircle size={24} />
                        </button>
                        Etkinlik detayları yüklenemedi veya bulunamadı.
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default OrganizatorHomePage;