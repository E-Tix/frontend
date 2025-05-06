import React, { useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import EventCard from "./EventCard";
import "../components/HorizontalScrollSection.css";

const HorizontalScrollSection = ({ title, etkinlikler, onTitleClick }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += direction === "left" ? -300 : 300;
    }
  };

  return (
    <div className="horizontal-scroll-section">
      <h2
        onClick={onTitleClick}
        className="section-title"
      >
        {title}
      </h2>
      <div className="scroll-container">
        <button
          onClick={() => scroll("left")}
          className="scroll-button left"
          aria-label="Scroll left"
        >
          <FaChevronLeft />
        </button>

        <div
          ref={scrollRef}
          className="scroll-content"
        >
          {etkinlikler.map((etkinlik) => (
            <EventCard key={etkinlik.etkinlikID} etkinlik={etkinlik} />
          ))}

          <div
            onClick={onTitleClick}
            className="view-all-card"
          >
            → {title} sayfasına git
          </div>
        </div>

        <button
          onClick={() => scroll("right")}
          className="scroll-button right"
          aria-label="Scroll right"
        >
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
};

export default HorizontalScrollSection;