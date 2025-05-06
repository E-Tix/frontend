import './App.css';
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CityProvider } from "./context/CityContext";
import MainLayout from "./layouts/MainLayout";  // MainLayout'ı import ettik
import LoginLayout from "./layouts/LoginLayout";
import Sinema from "./pages/Sinema";
import Bale from "./pages/Bale";
import Tiyatro from "./pages/Tiyatro";
import Konferans from "./pages/Konferans";
import Spor from "./pages/Spor";
import Profil from "./pages/Profil";
import ChooseRole from "./pages/ChooseRole";
import Login from "./pages/Login";
import ChooseRegisterRole from "./pages/ChooseRegisterRole";
import RegisterUser from "./pages/RegisterUser";
import RegisterOrganizator from "./pages/RegisterOrganizator";
import ProfileRedirect from "./pages/ProfileRedirect";
import KullanıcıProfil from "./pages/KullanıcıProfil";
import OrganizatorProfil from "./pages/OrganizatorProfil";
import AdminProfil from "./pages/AdminProfil";
import SifreGuncelle from "./pages/SifreGuncelle";
import KullaniciHomePage from "./pages/KullaniciHomePage";
import OrganizatorHomePage from "./pages/OrganizatorHomePage";
import KategoriSayfasi from "./pages/KategoriSayfasi";
import Etkinliklerim from "./pages/Etkinliklerim";
import EtkinlikOlustur from "./pages/EtkinlikOlustur";
import Etkinlik from "./pages/Etkinlik"
import BiletAl from "./pages/BiletAl"

function App() {
  return (
     <Router>
        <AuthProvider>
            <CityProvider>
              <Routes>
                {/* LoginLayout altında toplanan sayfalar */}
                <Route path="/" element={<LoginLayout />}>
                  <Route path="login/:role" element={<Login />} />
                  {/*<Route path="register" element={<Register />} />*/}
                  <Route index element={<ChooseRole />} />
                  <Route path="/choose-register" element={<ChooseRegisterRole />} />
                  <Route path="/register/Kullanıcı" element={<RegisterUser />} />
                  <Route path="/register/Organizatör" element={<RegisterOrganizator />} />
                  <Route path="/sifre-guncelle" element={<SifreGuncelle />} />
                </Route>

                {/* Authenticated layout için MainLayout kullan */}
                <Route path="/" element={<MainLayout />}>
                  {/*<Route index element={<Home />} />*/}
                  <Route path="/kullanıcı-home" element={<KullaniciHomePage/>} />
                  <Route path="/organizatör-home" element={<OrganizatorHomePage />} />
                  <Route path="/kategori/:kategoriId" element={<KategoriSayfasi />} />
                  <Route path="/etkinlik/:eventId" element={<Etkinlik />} />
                  <Route path="/etkinliklerim" element={<Etkinliklerim />} />
                  <Route path="/etkinlik-olustur" element={<EtkinlikOlustur />} />
                  <Route path="etkinlikler/sinema" element={<Sinema />} />
                  <Route path="etkinlikler/bale" element={<Bale />} />
                  <Route path="etkinlikler/tiyatro" element={<Tiyatro />} />
                  <Route path="etkinlikler/konferans" element={<Konferans />} />
                  <Route path="etkinlikler/spor" element={<Spor />} />
                  {/*<Route path="profil" element={<Profil />} />*/}
                  <Route path="/koltuk-secimi/:seansId" element={<BiletAl />} />
                  <Route path="/profil" element={<ProfileRedirect />} />
                  <Route path="/profil/Kullanıcı" element={<KullanıcıProfil />} />
                  <Route path="/profil/Organizatör" element={<OrganizatorProfil />} />
                  <Route path="/profil/Admin" element={<AdminProfil />} />


                </Route>
              </Routes>
            </CityProvider>
        </AuthProvider>
     </Router>
  );
}

export default App;

