import React, { useEffect, useState } from "react";
import axios from "axios";
import EtkinlikKart from "../components/EventCard.jsx";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import "../components/OrganizatorHomePage.css";

const OrganizatorHomePage = () => {
  const [etkinlikler, setEtkinlikler] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const organizatorId = localStorage.getItem("organizatorId");
    axios
      .get(`http://localhost:8080/api/etkinlik/organizator/${organizatorId}?limit=10`)
      .then((res) => setEtkinlikler(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="organizator-home-container">
      <h2>Oluşturduğunuz Etkinlikler</h2>
      <div className="etkinlikler-scroll">
        {etkinlikler.map((etkinlik) => (
          <EtkinlikKart key={etkinlik.id} etkinlik={etkinlik} />
        ))}
        <div
          className="ok-butonu"
          onClick={() => navigate("/organizator/etkinliklerim")}
        >
          ➡
        </div>
      </div>

      <button
        className="plus-button"
        onClick={() => navigate("/etkinlik-olustur")}
      >
        <Plus size={28} />
      </button>
    </div>
  );
};

export default OrganizatorHomePage;
