// EtkinlikOlustur.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from '../api/axios'; // Projenizdeki axios instance'ı
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import "../components/EtkinlikOlustur.css"; // CSS dosyanızın yolu
import { useLocation, useNavigate } from "react-router-dom";

const AddEvent = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { editMode = false, etkinlikData: etkinlikDataFromState = null } = location.state || {};

    // Form State'leri
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

    const [initialFormData, setInitialFormData] = useState(null);
    const [isDataLoaded, setIsDataLoaded] = useState(false); // etkinlikData'nın işlendiğini takip et

    // Şehir ve etkinlik türlerini çek
    useEffect(() => {
        axios.get('http://localhost:8080/sehir/sehirler') // Controller'daki doğru endpoint
            .then(res => setSehirler(res.data))
            .catch(err => console.error("Şehirleri alma başarısız:", err));

        axios.get('http://localhost:8080/veri/etkinlik-turleri')
            .then(res => setEtkinlikTurleri(res.data))
            .catch(err => console.error("Türleri alma başarısız:", err));
    }, []);

    const resetForm = useCallback(() => {
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
        setInitialFormData(null);
        setIsDataLoaded(false);
    }, []);


    // Düzenleme modunda formu doldur
    useEffect(() => {
        if (editMode && etkinlikDataFromState && sehirler.length > 0 && etkinlikTurleri.length > 0 && !isDataLoaded) {
            console.log("Formu doldurmak için gelen etkinlikDataFromState:", etkinlikDataFromState);
            const isSinema = etkinlikDataFromState.sinemaId || etkinlikDataFromState.etkinlikForOrgDetayDto; // Sinema olup olmadığını anlamak için bir yol
            const baseEtkinlikData = isSinema ? etkinlikDataFromState.etkinlikForOrgDetayDto : etkinlikDataFromState;

            if (!baseEtkinlikData) {
                console.error("Temel etkinlik verisi bulunamadı!", etkinlikDataFromState);
                toast.error("Etkinlik verileri yüklenirken bir sorun oluştu.");
                navigate("/organizator-home");
                return;
            }

            const kapakFoto = baseEtkinlikData.kapakFotografi || // İdeal durum: EtkinlikForOrgDetayDto'da direkt kapakFotografi alanı var
                              etkinlikDataFromState.kapakFotografi || // Ya da bir üst seviyede
                              baseEtkinlikData.etkinlikSalonSeansEntities?.[0]?.etkinlik?.kapakFotografi || ""; // En kötü senaryo

            const formData = {
                etkinlikAdi: baseEtkinlikData.etkinlikAdi || "",
                etkinlikAciklamasi: baseEtkinlikData.etkinlikAciklamasi || "",
                yasSiniri: baseEtkinlikData.yasSiniri?.toString() || "",
                biletFiyati: baseEtkinlikData.biletFiyati?.toString() || "",
                etkinlikSuresi: baseEtkinlikData.etkinlikSuresi?.toString() || "",
                kapakFotografi: kapakFoto,
                secilenTur: baseEtkinlikData.etkinlikTur?.etkinlikTurID?.toString() || "",
                fragmanLinki: isSinema ? (etkinlikDataFromState.fragmanLinki || "") : "",
                secilenSehir: baseEtkinlikData.etkinlikSalonSeansEntities?.[0]?.etkinlik?.sehir?.plakaKodu?.toString() || baseEtkinlikData.sehir?.plakaKodu?.toString() || "",
                // secilenSalon daha sonra ayarlanacak
                formattedSeanslar: baseEtkinlikData.etkinlikSalonSeansEntities?.map(ess => {
                    const seansTarih = new Date(ess.seans.tarih);
                    const bitisTarihi = ess.seans.bitisTarih
                        ? new Date(ess.seans.bitisTarih)
                        : new Date(seansTarih.getTime() + (parseInt(baseEtkinlikData.etkinlikSuresi, 10) || 0) * 60000);
                    return {
                        tarih: seansTarih.toISOString().slice(0, 16),
                        bitisTarihi: bitisTarihi.toISOString(),
                        id: ess.seans.seansID, // Backend'den gelen seansID
                    };
                }) || []
            };

            setInitialFormData(JSON.parse(JSON.stringify(formData))); // Deep copy

            setEtkinlikAdi(formData.etkinlikAdi);
            setEtkinlikAciklamasi(formData.etkinlikAciklamasi);
            setYasSiniri(formData.yasSiniri);
            setBiletFiyati(formData.biletFiyati);
            setEtkinlikSuresi(formData.etkinlikSuresi);
            setKapakFotografi(formData.kapakFotografi);
            setSecilenTur(formData.secilenTur);
            setFragmanLinki(formData.fragmanLinki);
            setSeanslar(formData.formattedSeanslar);

            if (formData.secilenSehir) {
                setSecilenSehir(formData.secilenSehir);
            }
            setIsDataLoaded(true); // Verinin işlendiğini işaretle
        } else if (!editMode && !isDataLoaded) { // Sayfa ilk yüklendiğinde ve yeni etkinlik modunda
           // resetForm(); // Zaten başlangıç state'leri boş
           setIsDataLoaded(true); // Yeni form için de yüklendi sayılabilir
        }
    }, [editMode, etkinlikDataFromState, sehirler, etkinlikTurleri, isDataLoaded, navigate, resetForm]);


    // Seçilen şehre göre salonları çek
    useEffect(() => {
        if (secilenSehir && user?.token) { // user.token kontrolü eklendi
            const sehirObje = sehirler.find(s => s.plakaKodu?.toString() === secilenSehir);
            if (sehirObje) {
                axios.post('http://localhost:8080/organizatorMainPage/getSalonsForSehir', sehirObje, {
                    headers: { Authorization: `Bearer ${user.token}` }
                })
                .then(res => {
                    setSalonlar(res.data);
                    // Eğer düzenleme modundaysak ve salonlar yeni yüklendiyse, initial salonu ayarla
                    if (editMode && etkinlikDataFromState && isDataLoaded && initialFormData) {
                        const baseEtkinlikData = etkinlikDataFromState.etkinlikForOrgDetayDto || etkinlikDataFromState;
                        const etkinlikSalonId = baseEtkinlikData.etkinlikSalonSeansEntities?.[0]?.salon?.salonID?.toString();
                        if (etkinlikSalonId && res.data.some(s => s.salonID.toString() === etkinlikSalonId)) {
                            setSecilenSalon(etkinlikSalonId);
                            // initialFormData'ya salonu da ekleyebiliriz ama iptal için navigate(-1) daha basit
                            setInitialFormData(prev => prev ? {...prev, secilenSalon: etkinlikSalonId } : null);
                        } else if (etkinlikSalonId) {
                            console.warn("Etkinlikteki salon, yeni yüklenen salonlar listesinde bulunamadı veya şehir değişti.");
                            setSecilenSalon("");
                        }
                    }
                })
                .catch(err => {
                    console.error("Salonları alma başarısız:", err);
                    setSalonlar([]); // Hata durumunda salonları boşalt
                    setSecilenSalon("");
                });
            } else {
                setSalonlar([]);
                setSecilenSalon("");
            }
        } else if (!secilenSehir) { // Şehir seçimi kaldırılırsa salonları ve seçili salonu temizle
            setSalonlar([]);
            setSecilenSalon("");
        }
    }, [secilenSehir, user?.token, sehirler, editMode, etkinlikDataFromState, isDataLoaded, initialFormData]);


    const handleSeansEkle = () => {
        if (!yeniSeans) {
            toast.warn("Lütfen seans için bir tarih ve saat seçin.");
            return;
        }
        if (!etkinlikSuresi || parseInt(etkinlikSuresi, 10) <= 0) {
            toast.warn("Lütfen geçerli bir etkinlik süresi giriniz.");
            return;
        }
        const seansBaslangic = new Date(yeniSeans);
        const seansBitis = new Date(seansBaslangic.getTime() + parseInt(etkinlikSuresi, 10) * 60000);

        // Aynı tarih ve saatte seans var mı kontrolü
        const cakisanSeans = seanslar.find(s => new Date(s.tarih).getTime() === seansBaslangic.getTime());
        if (cakisanSeans) {
            toast.error("Bu tarih ve saatte zaten bir seans mevcut!");
            return;
        }

        setSeanslar([...seanslar, {
            tarih: yeniSeans, // YYYY-MM-DDTHH:mm
            bitisTarihi: seansBitis.toISOString(),
            // Yeni eklendiği için 'id'si yok
        }]);
        setYeniSeans('');
    };

    const handleSeansSil = (indexToRemove) => {
        setSeanslar(seanslar.filter((_, index) => index !== indexToRemove));
        toast.info("Seans listeden kaldırıldı. Değişiklikleri kaydetmeyi unutmayın.");
    };

    const handleCancel = () => {
        if (editMode && initialFormData) {
            // Basitçe bir önceki sayfaya yönlendirme
            if (window.confirm("Yapılan değişiklikler kaybolacak. İptal etmek istediğinize emin misiniz?")) {
                navigate(-1);
            }
        } else {
            resetForm();
            navigate("/organizatör-home");
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault(); // Formun default submit davranışını engelle

        // Temel Validasyonlar
        if (!etkinlikAdi.trim() || !etkinlikAciklamasi.trim() || !kapakFotografi.trim() ||
            !yasSiniri || !biletFiyati || !etkinlikSuresi ||
            !secilenSehir || !secilenTur || !secilenSalon) {
            toast.error("Lütfen tüm zorunlu alanları doldurunuz.");
            return;
        }

        if (parseInt(etkinlikSuresi, 10) <=0) {
            toast.error("Etkinlik süresi pozitif bir değer olmalıdır.");
            return;
        }
        if (seanslar.length === 0) {
            toast.error("En az bir seans eklemelisiniz.");
            return;
        }

        const isSinema = etkinlikTurleri.find(tur => tur.etkinlikTurID?.toString() === secilenTur)?.etkinlikTurAdi === 'Sinema';
        if (isSinema && !fragmanLinki.trim()) {
            toast.error("Sinema türü için fragman linki zorunludur.");
            return;
        }

        // DTO Hazırlama
        const sehirEntity = sehirler.find(s => s.plakaKodu?.toString() === secilenSehir);
        const salonEntity = salonlar.find(s => s.salonID?.toString() === secilenSalon);
        const etkinlikTurEntity = etkinlikTurleri.find(t => t.etkinlikTurID?.toString() === secilenTur);

        if (!sehirEntity || !salonEntity || !etkinlikTurEntity) {
            toast.error("Şehir, salon veya etkinlik türü bilgileri bulunamadı. Lütfen seçimleri kontrol edin.");
            return;
        }

        const seansEkleDtoList = [];
        const seansDuzenleDtoList = [];

        seanslar.forEach(seans => {
            const seansTarihi = new Date(seans.tarih).toISOString(); // UTC'ye çevirip gönderelim.

            if (editMode && seans.id) { // Var olan ve ID'si olan seans (düzenlenecek)
                seansDuzenleDtoList.push({
                    seansId: seans.id,
                    tarih: seansTarihi // Backend bu string'i Timestamp'e çevirmeli
                });
            } else { // Yeni eklenen seans
                seansEkleDtoList.push({
                    tarih: seansTarihi // Backend bu string'i Timestamp'e çevirmeli
                });
            }
        });

        const etkinlikTemelDto = {
            etkinlikAdi: etkinlikAdi.trim(),
            kapakFotografi: kapakFotografi.trim(),
            etkinlikAciklamasi: etkinlikAciklamasi.trim(),
            yasSiniri: parseInt(yasSiniri, 10),
            etkinlikSuresi: parseInt(etkinlikSuresi, 10),
            biletFiyati: parseFloat(biletFiyati),
            etkinlikTur: etkinlikTurEntity, // Tam entity objesi
            salon: salonEntity,             // Tam entity objesi
            sehir: sehirEntity,             // Tam entity objesi
            // seansEkleDtoList ve seansDuzenleDtoList DTO'nun kendisine eklenecek
        };


        let payload;
        let endpoint = '';
        let method;

        if (editMode) { // GÜNCELLEME MODU
            const etkinlikGuncelleDto = {
                ...etkinlikTemelDto,
                etkinlikId: etkinlikDataFromState?.etkinlikID || (etkinlikDataFromState?.etkinlikForOrgDetayDto?.etkinlikID), // Ana etkinlik ID'si
                seansDuzenleDtoList: seansDuzenleDtoList,
                seansEkleDtoList: seansEkleDtoList, // Yeni eklenen seanslar güncellemede de olabilir
                // Backend'de silinecekSeansIdList için bir alan olsaydı burada onu da eklerdik.
                // Bu alana daha sonra bakacağım
            };

            if (isSinema) {
                endpoint = 'http://localhost:8080/organizatorMainPage/updateCinema/save';
                method = axios.put;
                payload = {
                    // SinemaGuncelleDto'nun backend'deki yapısına göre:
                    sinemaId: etkinlikDataFromState?.sinemaId, // Sinema etkinliğinin kendi ID'si
                    etkinlikGuncelleDto: etkinlikGuncelleDto,
                    fragmanLinki: fragmanLinki.trim(),
                };
            } else {
                endpoint = 'http://localhost:8080/organizatorMainPage/updateEvent/save';
                method = axios.put;
                payload = etkinlikGuncelleDto;
            }
        } else { // YENİ EKLEME MODU
            const etkinlikEkleDto = {
                ...etkinlikTemelDto,
                seansEkleDtoList: seansEkleDtoList, // Sadece yeni seanslar
            };

            if (isSinema) {
                endpoint = 'http://localhost:8080/organizatorMainPage/addCinema/save';
                method = axios.post;
                payload = {
                    // SinemaEkleDto'nun backend'deki yapısına göre:
                    etkinlikEkleDto: etkinlikEkleDto,
                    fragmanLinki: fragmanLinki.trim(),
                };
            } else {
                endpoint = 'http://localhost:8080/organizatorMainPage/addEvent/save';
                method = axios.post;
                payload = etkinlikEkleDto;
            }
        }

        console.log("Gönderilecek Payload:", JSON.stringify(payload, null, 2));
        console.log("Endpoint:", endpoint);
        console.log("Method:", method === axios.post ? "POST" : "PUT");

        try {
            const response = await method(endpoint, payload, {
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            });

            // Backend her zaman 'true' dönüyor.
            if (response.data === true) {
                toast.success(`Etkinlik başarıyla ${editMode ? 'güncellendi' : 'oluşturuldu'}!`);
                if (!editMode) {
                    resetForm(); // Yeni eklemede formu sıfırla
                }
                // Kullanıcıyı etkinlik listeleme sayfasına yönlendir
                navigate("/organizatör-home");
            } else {
                // response.data 'true' değilse, backend'den beklenmedik bir yanıt gelmiş demektir.
                toast.error(`Etkinlik ${editMode ? 'güncellenirken' : 'oluşturulurken'} bir sorun oluştu. Yanıt: ${response.data}`);
                console.error("Beklenmedik yanıt:", response.data);
            }
        } catch (error) {
            console.error(`Etkinlik ${editMode ? 'güncelleme' : 'oluşturma'} hatası:`, error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || error.response?.data || `Etkinlik ${editMode ? 'güncellenirken' : 'oluşturulurken'} bir hata oluştu.`;
            toast.error(errorMessage.toString());
        }
    };

    return (
        <form onSubmit={handleSubmit} className="etkinlik-page-container"> {/* Form tag'i eklendi */}
            <div className="etkinlik-form-wrapper">
                <div className="etkinlik-form-container">
                    <div className="etkinlik-form-header">
                        <h1 className="etkinlik-form-title">{editMode ? "Etkinlik Güncelle" : "Yeni Etkinlik Oluştur"}</h1>
                        <div className="etkinlik-form-divider"></div>
                    </div>

                    <div className="etkinlik-form-content">
                        <div className="etkinlik-form-grid">
                            {/* Sol Sütun */}
                            <div className="etkinlik-form-column">
                                <div className="etkinlik-form-group">
                                    <label className="etkinlik-form-label" htmlFor="etkinlikAdi">Etkinlik Adı</label>
                                    <input
                                        id="etkinlikAdi"
                                        type="text"
                                        className="etkinlik-form-input"
                                        value={etkinlikAdi}
                                        onChange={e => setEtkinlikAdi(e.target.value)}
                                        placeholder="Etkinlik adını giriniz"
                                        required
                                    />
                                </div>

                                <div className="etkinlik-form-group">
                                    <label className="etkinlik-form-label" htmlFor="etkinlikAciklamasi">Etkinlik Açıklaması</label>
                                    <textarea
                                        id="etkinlikAciklamasi"
                                        className="etkinlik-form-textarea"
                                        value={etkinlikAciklamasi}
                                        onChange={e => setEtkinlikAciklamasi(e.target.value)}
                                        placeholder="Etkinlik açıklamasını giriniz"
                                        required
                                    />
                                </div>

                                <div className="etkinlik-form-group">
                                    <label className="etkinlik-form-label" htmlFor="kapakFotografi">Etkinlik Afişi (URL)</label>
                                    <input
                                        id="kapakFotografi"
                                        type="url" // URL tipinde olması daha uygun
                                        className="etkinlik-form-input"
                                        value={kapakFotografi}
                                        onChange={e => setKapakFotografi(e.target.value)}
                                        placeholder="https://example.com/afis.jpg"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Sağ Sütun */}
                            <div className="etkinlik-form-column">
                                <div className="etkinlik-form-row">
                                    <div className="etkinlik-form-group half-width">
                                        <label className="etkinlik-form-label" htmlFor="yasSiniri">Yaş Sınırı</label>
                                        <input
                                            id="yasSiniri"
                                            type="number"
                                            className="etkinlik-form-input"
                                            value={yasSiniri}
                                            onChange={e => setYasSiniri(e.target.value)}
                                            placeholder="Örn: 18"
                                            min="0"
                                            required
                                        />
                                    </div>
                                    <div className="etkinlik-form-group half-width">
                                        <label className="etkinlik-form-label" htmlFor="biletFiyati">Bilet Fiyatı (₺)</label>
                                        <input
                                            id="biletFiyati"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            className="etkinlik-form-input"
                                            value={biletFiyati}
                                            onChange={e => setBiletFiyati(e.target.value)}
                                            placeholder="Örn: 150.00"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="etkinlik-form-group">
                                    <label className="etkinlik-form-label" htmlFor="etkinlikSuresi">Etkinlik Süresi (dakika)</label>
                                    <input
                                        id="etkinlikSuresi"
                                        type="number"
                                        className="etkinlik-form-input"
                                        value={etkinlikSuresi}
                                        onChange={e => {
                                            setEtkinlikSuresi(e.target.value);
                                            // Etkinlik süresi değişirse mevcut seansların bitiş tarihlerini güncellemek iyi bir fikir olabilir
                                            // Şimdilik bu detayı atlıyoruz.
                                        }}
                                        placeholder="Örn: 120"
                                        min="1"
                                        required
                                    />
                                </div>

                                <div className="etkinlik-form-row">
                                    <div className="etkinlik-form-group half-width">
                                        <label className="etkinlik-form-label" htmlFor="secilenSehir">Şehir</label>
                                        <select
                                            id="secilenSehir"
                                            value={secilenSehir}
                                            onChange={e => {
                                                setSecilenSehir(e.target.value);
                                                setSecilenSalon(''); // Şehir değişince salonu sıfırla
                                                setSalonlar([]); // Salon listesini de sıfırla ki yeniden yüklensin
                                            }}
                                            className="etkinlik-form-select"
                                            required
                                        >
                                            <option value="">Şehir seçin</option>
                                            {sehirler.map(sehir => (
                                                <option key={sehir.plakaKodu} value={sehir.plakaKodu.toString()}>
                                                    {sehir.sehirAdi}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="etkinlik-form-group half-width">
                                        <label className="etkinlik-form-label" htmlFor="secilenTur">Etkinlik Türü</label>
                                        <select
                                            id="secilenTur"
                                            value={secilenTur}
                                            onChange={e => setSecilenTur(e.target.value)}
                                            className="etkinlik-form-select"
                                            required
                                        >
                                            <option value="">Tür seçin</option>
                                            {etkinlikTurleri.map(tur => (
                                                <option key={tur.etkinlikTurID} value={tur.etkinlikTurID.toString()}>
                                                    {tur.etkinlikTurAdi}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                { (secilenSehir && salonlar.length > 0) && (
                                    <div className="etkinlik-form-group">
                                        <label className="etkinlik-form-label" htmlFor="secilenSalon">Mekan</label>
                                        <select
                                            id="secilenSalon"
                                            value={secilenSalon}
                                            onChange={e => setSecilenSalon(e.target.value)}
                                            className="etkinlik-form-select"
                                            required
                                        >
                                            <option value="">Mekan seçin</option>
                                            {salonlar.map(salon => (
                                                <option key={salon.salonID} value={salon.salonID.toString()}>
                                                    {salon.salonAdi}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                { secilenSehir && salonlar.length === 0 && <p>Bu şehir için mekan bulunamadı veya yükleniyor...</p>}


                                {etkinlikTurleri.find(tur => tur.etkinlikTurID?.toString() === secilenTur)?.etkinlikTurAdi === 'Sinema' && (
                                    <div className="etkinlik-form-group">
                                        <label className="etkinlik-form-label" htmlFor="fragmanLinki">Fragman Linki</label>
                                        <input
                                            id="fragmanLinki"
                                            type="url"
                                            value={fragmanLinki}
                                            onChange={e => setFragmanLinki(e.target.value)}
                                            className="etkinlik-form-input"
                                            placeholder="https://youtube.com/..."
                                            required // Sinema ise zorunlu
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Seanslar Bölümü */}
                        {secilenSalon && (
                            <div className="etkinlik-sessions-section">
                                <h3 className="etkinlik-sessions-title">Etkinlik Seansları</h3>
                                <div className="etkinlik-session-controls">
                                    <input
                                        type="datetime-local"
                                        value={yeniSeans}
                                        onChange={e => setYeniSeans(e.target.value)}
                                        className="etkinlik-session-input"
                                        min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0,16)} // Geçmiş tarih seçilemesin (lokal zamana göre)
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
                                            <div key={seans.id || `new-${index}`} className="etkinlik-session-item">
                                                <span className="etkinlik-session-time">
                                                    {new Date(seans.tarih + "Z").toLocaleString('tr-TR', { // 'Z' ekleyerek UTC olduğunu belirt
                                                        weekday: 'short', year: 'numeric', month: 'short',
                                                        day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul'
                                                    })}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleSeansSil(index)}
                                                    className="etkinlik-remove-session"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {seanslar.length === 0 && <p>Henüz seans eklenmedi.</p>}
                            </div>
                        )}

                        <div className="etkinlik-form-footer">
                            {editMode ? (
                                <>
                                    <button type="submit" className="etkinlik-submit-btn">
                                        Değişiklikleri Kaydet
                                    </button>
                                    <button type="button" onClick={handleCancel} className="etkinlik-cancel-btn" style={{ marginLeft: '10px', backgroundColor: '#6c757d', color: 'white' }}>
                                        İptal
                                    </button>
                                </>
                            ) : (
                                <button type="submit" className="etkinlik-submit-btn">
                                    Kaydet
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default AddEvent;