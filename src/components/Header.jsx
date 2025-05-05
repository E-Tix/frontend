import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useCity } from "../context/CityContext";
import "./Header.css";
import logo from "../assets/E-Tix LOGO.png";
import profileIcon from "../assets/user.png";
import mapIcon from "../assets/map.png";
import logoutIcon from "../assets/logout2.png";

const Header = () => {
  const [cities, setCities] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const { user, logout } = useAuth();
  const { selectedCity, setSelectedCity } = useCity(); // context'ten alındı
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:8080/sehir/sehirler")
      .then(response => {
        setCities(response.data);
      })
      .catch(error => {
        console.error("Şehirleri çekerken hata oluştu:", error);
      });
  }, []);

  const handleCitySelect = (city) => {
    setSelectedCity(city); // CityContext güncellemesi
    setDropdownOpen(false);

    axios.put("http://localhost:8080/Profile/updateCity", {
      plakaKodu: city.plakaKodu,
      sehirAdi: city.sehirAdi
    }, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      }
    })
    .then(() => {
      console.log("Şehir başarıyla güncellendi.");
    })
    .catch((error) => {
      console.error("Şehir güncellenirken hata oluştu:", error);
    });
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="nav-item" onClick={() => {
          if (user?.role === "Organizatör") {
            navigate("/organizatör-home");
          } else if (user?.role === "Kullanıcı") {
            navigate("/kullanıcı-home");
          } else {
            navigate("/");
          }
        }}>
          <h1 className="site-name">E-TİX LOGO</h1>
        </div>

        {user?.role === "Kullanıcı" && (
            <div
              className="location-selector"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="location-labels">
                <span className="konum">Konum</span>
                <span className="sehir">{selectedCity?.sehirAdi || "Şehir Seç"}</span>
              </div>
              <img src={mapIcon} alt="Map Icon" className="map-icon" />
              {dropdownOpen && (
                <div className="dropdown">
                  {cities.map((city, index) => (
                    <div
                      key={index}
                      className="dropdown-item"
                      onClick={() => handleCitySelect(city)}
                    >
                      {city.sehirAdi}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
      </div>

      <nav className="nav-menu">
        <Link to="etkinlikler/sinema" className="nav-item">Sinema</Link>
        <Link to="etkinlikler/bale" className="nav-item">Bale</Link>
        <Link to="etkinlikler/tiyatro" className="nav-item">Tiyatro</Link>
        <Link to="etkinlikler/konferans" className="nav-item">Konferans</Link>
        <Link to="etkinlikler/spor" className="nav-item">Spor</Link>
      </nav>

      <div className="header-right">
        <input
          type="text"
          placeholder="Tiyatro, Sinema, Konferans ara..."
          className="search-input"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Link to="/profil">
          <img src={profileIcon} alt="Profile" className="profile-icon" />
        </Link>
        <img
          src={logoutIcon}
          alt="Logout"
          className="profile-icon"
          onClick={logout}
          title="Çıkış Yap"
        />
      </div>
    </header>
  );
};

export default Header;
