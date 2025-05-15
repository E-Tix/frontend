// src/pages/AramaSonuclariPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios'; // axios instance'ınız
import EventCard from './EventCard.jsx'; // EventCard component'inizin doğru yolu
import '../components/AramaSonuclariPage.css'; // Bu CSS dosyasını oluşturun
import { AlertTriangle, ArrowLeft } from 'lucide-react'; // İkonlar

const AramaSonuclariPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const aramaSorgusu = searchParams.get('sorgu');

    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchSearchResults = useCallback(async (sorgu) => {
        if (!sorgu || sorgu.trim() === "") {
            setResults([]);
            setError("Lütfen aramak için bir terim girin."); // Sorgu boşsa hata mesajı
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get('/mainPage/search', {
                params: { arananEtkinlikAdi: sorgu }
            });
            if (response.data && Array.isArray(response.data)) {
                if (response.data.length > 0) {
                    // AramaDto: etkinlikId, etkinlikAdi, kapakFotografi, sehirAdi, etkinlikTurAdi
                    // EventCard'ın beklediği prop'lara göre map'leme:
                    const mappedResults = response.data.map(dto => ({
                        etkinlikID: dto.etkinlikId, // EventCard'ın etkinlikID beklediğini varsayıyorum
                        etkinlikAdi: dto.etkinlikAdi,
                        kapakFotografi: dto.kapakFotografi,
                        etkinlikTur: { etkinlikTurAdi: dto.etkinlikTurAdi }, // EventCard etkinlikTur objesi bekliyorsa
                        sehir: { sehirAdi: dto.sehirAdi }, // EventCard sehir objesi bekliyorsa
                        // AramaDto'da olmayan ama EventCard'da olabilecek diğer alanlar için varsayılanlar:
                        // Bu alanlar EventCard component'inizde opsiyonel olmalı veya null/undefined kontrolü yapılmalı
                        yasSiniri: dto.yasSiniri || null, // Eğer AramaDto'da bu alanlar varsa
                        biletFiyati: dto.biletFiyati || null, // Eğer AramaDto'da bu alanlar varsa
                    }));
                    setResults(mappedResults);
                } else {
                    setResults([]);
                    setError(`"${sorgu}" için sonuç bulunamadı.`);
                }
            } else {
                setResults([]);
                setError("Arama sonuçları alınamadı veya format hatalı.");
            }
        } catch (err) {
            console.error("Arama sonuçları alınırken hata:", err);
            setError("Arama sonuçları yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.");
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSearchResults(aramaSorgusu);
    }, [aramaSorgusu, fetchSearchResults]);

    return (
        <div className="arama-sonuclari-container">
            <button onClick={() => navigate(-1)} className="geri-git-butonu">
                <ArrowLeft size={20} /> Geri
            </button>
            <h1 class="arama-ekrani-title">Arama Sonuçları: "{aramaSorgusu || ''}"</h1> {/* sorgu null ise boş string */}

            {isLoading && <p className="arama-mesaj">Sonuçlar yükleniyor...</p>}
            {error && !isLoading && <p className="arama-mesaj hata"><AlertTriangle size={18} style={{marginRight: "8px"}}/>{error}</p>}

            {!isLoading && !error && results.length > 0 && (
                <div className="arama-sonuclari-grid">
                    {results.map(etkinlik => (
                        // EventCard'ın 'etkinlik' prop'unu beklediğini varsayıyorum
                        <EventCard key={etkinlik.etkinlikID} etkinlik={etkinlik} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AramaSonuclariPage;