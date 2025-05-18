import React from 'react';
import './SeatMap.css';

export default function SeatMap({
                                    rows,
                                    bookedSeats,
                                    selectedSeats,
                                    onToggle
                                }) {
    return (
        <div className="seat-map-wrapper">
            {rows.map((seatRow, rowIndex) => (
                <div key={rowIndex} className="seat-map-row">
                    {seatRow.map(seat => {
                        const isBooked = bookedSeats.includes(seat.id);
                        const isSelected = selectedSeats.includes(seat.id);
                        return (
                            <button
                                key={seat.id}
                                className={[
                                    'seat',
                                    isBooked ? 'booked' : 'available',
                                    isSelected ? 'selected' : ''
                                ].join(' ')}
                                disabled={isBooked}
                                onClick={() => onToggle(seat.id)}
                            >
                                {seat.number}
                            </button>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}
