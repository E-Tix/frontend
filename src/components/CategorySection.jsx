import React, { useEffect, useState } from "react";
import axios from "axios";
import EventCard from "./EventCard";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const CategorySection = ({ category }) => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get("/api/etkinlikler");

        const filtered = response.data
          .filter((event) => event.etkinlikTur === category)
          .slice(0, 10);

        setEvents(filtered);
      } catch (error) {
        console.error(`${category} etkinlikleri alınamadı:`, error);
      }
    };

    fetchEvents();
  }, [category]);

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2 px-2">
        <h2 className="text-xl font-semibold">{category}lar</h2>
        <button onClick={() => navigate(`/etkinlikler/${category.toLowerCase()}`)}>
          <ChevronRight size={28} />
        </button>
      </div>

      <div className="flex overflow-x-auto gap-4 px-2">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};

export default CategorySection;
