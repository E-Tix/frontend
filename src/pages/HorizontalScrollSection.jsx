import React, { useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import EventCard from "./EventCard";

const HorizontalScrollSection = ({ title, etkinlikler, onTitleClick }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += direction === "left" ? -300 : 300;
    }
  };

  return (
    <div className="mb-8">
      <h2 onClick={onTitleClick} className="text-xl font-bold cursor-pointer mb-2 hover:underline">
        {title}
      </h2>
      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-300 p-2 rounded-full z-10"
        >
          <FaChevronLeft />
        </button>
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 scrollbar-hide px-8"
          style={{ scrollBehavior: "smooth" }}
        >
          {etkinlikler.map((etkinlik) => (
            <EventCard key={etkinlik.etkinlikID} etkinlik={etkinlik} />
          ))}
          <div
            onClick={onTitleClick}
            className="w-64 h-72 flex items-center justify-center border border-dashed border-gray-400 cursor-pointer hover:bg-gray-100"
          >
            → {title} sayfasına git
          </div>
        </div>
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-300 p-2 rounded-full z-10"
        >
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
};

export default HorizontalScrollSection;
