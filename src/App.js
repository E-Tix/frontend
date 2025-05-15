import './App.css';
import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CityProvider } from "./context/CityContext";
import MainLayout from "./layouts/MainLayout";  // MainLayout'ı import ettik
import LoginLayout from "./layouts/LoginLayout";
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
import EtkinlikOlustur from "./pages/EtkinlikOlustur";
import Etkinlik from "./pages/Etkinlik"
import BiletAl from "./pages/BiletAl"
import PaymentSuccess from "./pages/PaymentSuccess"
import EtkinlikTurSayfasi from "./pages/EtkinlikTurSayfasi"
import Biletlerim from "./pages/Biletlerim";
import AramaSonuclariPage from './pages/AramaSonuclariPage';
import Payment from './pages/Payment.jsx';
import AdminHomePage from "./pages/AdminHomePage";

function App() {
  return (
  <>
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
                  <Route path="/admin-home" element={<AdminHomePage/>} />

                  <Route path="/etkinlik/:eventId" element={<Etkinlik />} />
                  <Route path="/biletlerim" element={<Biletlerim />} />
                  <Route path="/etkinlik-olustur" element={<EtkinlikOlustur />} />
                  <Route path="etkinlikler/:tur" element={<EtkinlikTurSayfasi />} />

                  <Route path="/bilet-al/:seansId/:salonId/:etkinlikId" element={<BiletAl />} />
                  <Route path="/profil" element={<ProfileRedirect />} />
                  <Route path="/profil/Kullanıcı" element={<KullanıcıProfil />} />
                  <Route path="/profil/Organizatör" element={<OrganizatorProfil />} />
                  <Route path="/profil/Admin" element={<AdminProfil />} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route path="/arama" element={<AramaSonuclariPage />} />
                  <Route path="/payment" element={<Payment/>} />

                </Route>
              </Routes>
            </CityProvider>
        </AuthProvider>
     </Router>
      <ToastContainer position="top-center" autoClose={3000} />
      </>
  );
}

export default App;

