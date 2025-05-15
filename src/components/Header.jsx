// Header.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios"; // Güncel axios instance'ınız
import { useAuth } from "../context/AuthContext";
import { useCity } from "../context/CityContext";
import "./Header.css";
import profileIcon from "../assets/user.png";
import mapIcon from "../assets/map.png";
import searchIcon from "../assets/searchIcon.png"
import logoutIcon from "../assets/logout2.png";
import { Search as SearchIcon } from 'lucide-react'; // Arama ikonu için

const Header = () => {
  const [cities, setCities] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchText, setSearchText] = useState(""); // Arama çubuğu için state
  const { user, logout } = useAuth();
  const { selectedCity, setSelectedCity } = useCity();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/mainPage/getSehir")
      .then(response => {
        setCities(response.data);
      })
      .catch(error => {
        console.error("Şehirleri çekerken hata oluştu:", error);
      });
  }, []);

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setDropdownOpen(false);

    // Kullanıcı giriş yapmış ve token'ı varsa şehir bilgisini backend'e de gönder
    if (user && user.token) {
        axios.put("/Profile/updateCity", {
          plakaKodu: city.plakaKodu,
          sehirAdi: city.sehirAdi
        }, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          }
        })
        .then(() => {
          console.log("Kullanıcının seçtiği şehir başarıyla güncellendi.");
        })
        .catch((error) => {
          console.error("Kullanıcının şehri güncellenirken hata oluştu:", error);
        });
    }
  };

  const handleLogoClick = () => {
    if (user?.role === "Organizatör") {
        navigate("/organizatör-home");
    } else if (user?.role === "Kullanıcı") {
        navigate("/kullanıcı-home");
    } else if (user?.role === "Admin") { // Eğer admin rolü ve sayfası varsa
        navigate("/admin-home"); // Örnek admin yolu
    }
     else {
        navigate("/"); // Giriş yapmamışsa veya rolü tanımsızsa ana sayfaya
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault(); // Formun varsayılan submit davranışını engelle
    if (user?.role === "Kullanıcı" && searchText.trim()) {
      navigate(`/arama?sorgu=${encodeURIComponent(searchText.trim())}`);
      setSearchText("");
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="nav-item logo-container" onClick={handleLogoClick} style={{cursor: 'pointer'}}>
          {/* <img src={logo} alt="E-Tix Logo" className="logo-image" /> */}
          <h1 className="site-name">E-TİX LOGO</h1> {/* LOGO metnini güncelledim */}
        </div>

        {/* Konum seçici sadece kullanıcı rolü "Kullanıcı" ise gösterilir */}
        {user?.role === "Kullanıcı" && (
            <div
              className="location-selector"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              tabIndex={0} // Klavye erişilebilirliği
              onBlur={() => setTimeout(() => setDropdownOpen(false), 150)} // Dışarı tıklayınca kapat
            >
              <div className="location-labels">
                <span className="konum">Konum</span>
                <span className="sehir">{selectedCity?.sehirAdi || "Şehir Seç"}</span>
              </div>
              <img src={mapIcon} alt="Map Icon" className="map-icon" />
              {dropdownOpen && (
                <div className="dropdown">
                  <div className="dropdown-item" onClick={() => handleCitySelect({sehirAdi: "Tüm Şehirler", plakaKodu: null })}>
                      Tüm Şehirler
                  </div>
                  {cities.map((city) => (
                    <div
                      key={city.plakaKodu} // city.plakaKodu benzersiz olmalı
                      className="dropdown-item"
                      onClick={(e) => { e.stopPropagation(); handleCitySelect(city);}}
                    >
                      {city.sehirAdi}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
      </div>

      {/* Navigasyon menüsü sadece kullanıcı rolü "Kullanıcı" ise gösterilir */}
      {user?.role === "Kullanıcı" && (
          <nav className="nav-menu">
            <Link to="/etkinlikler/sinema" className="nav-item">Sinema</Link>
            <Link to="/etkinlikler/bale" className="nav-item">Bale</Link>
            <Link to="/etkinlikler/tiyatro" className="nav-item">Tiyatro</Link>
            <Link to="/etkinlikler/konferans" className="nav-item">Konferans</Link>
            <Link to="/etkinlikler/spor" className="nav-item">Spor</Link>
          </nav>
      )}

      <div className="header-right">
        {/* Arama çubuğu sadece kullanıcı rolü "Kullanıcı" ise gösterilir */}
        {user?.role === "Kullanıcı" && (
          <form onSubmit={handleSearchSubmit} className="search-form-header"> {/* Form ile submit yönetimi */}
            <input
              type="text"
              placeholder="Etkinlik ara..."
              className="search-input"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <button type="submit" className="search-button-header" aria-label="Ara">
              <img src={searchIcon} alt="Ara" className="custom-search-icon" />
            </button>
          </form>
        )}
        <Link to="/profil" className="profile-link-icon">
          <img src={profileIcon} alt="Profile" className="profile-icon" title="Profilim"/>
        </Link>
        {/* Çıkış butonu sadece kullanıcı giriş yapmışsa görünür */}
        {user && (
            <img
              src={logoutIcon}
              alt="Logout"
              className="profile-icon logout-icon"
              onClick={logout}
              title="Çıkış Yap"
              style={{cursor: 'pointer'}}
            />
        )}
      </div>
    </header>
  );
};

export default Header;