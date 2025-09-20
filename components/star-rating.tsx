"use client";

import { useState, useEffect } from "react";
import { StarIcon } from "@/components/icons";

interface StarRatingProps {
  name: string;
  label: string;
  value?: number; // existing rating (from DB)
  onChange?: (value: number) => void;
  movieId?: string;
}

export function StarRating({
  name,
  label,
  value = 0,
  onChange,
  movieId,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);
  const [selectedValue, setSelectedValue] = useState(value);

  // Keep local state in sync when parent `value` changes (e.g. when editing an existing rating)
  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  const handleStarClick = async (rating: number) => {
    setSelectedValue(rating);
    onChange?.(rating);

    if (movieId) {
      try {
        // Optional: save directly here if you want
      } catch (error) {
        console.warn("Failed to save rating offline:", error);
      }
    }
  };

  const handleStarHover = (rating: number) => {
    setHoverValue(rating);
  };

  const handleMouseLeave = () => {
    setHoverValue(0);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h3 className="text-lg font-semibold text-white">{label}</h3>
      <div
        className="star-rating flex flex-row-reverse justify-end gap-1"
        onMouseLeave={handleMouseLeave}
      >
        {[5, 4, 3, 2, 1].map((rating) => {
          const isFilled =
            hoverValue >= rating || (!hoverValue && selectedValue >= rating);
          return (
            <label
              key={rating}
              className="cursor-pointer transition-all duration-200 ease-in-out hover:scale-110 active:scale-95"
              onMouseEnter={() => handleStarHover(rating)}
              onTouchStart={() => handleStarHover(rating)}
              onClick={() => handleStarClick(rating)}
            >
              <input
                type="radio"
                name={name}
                value={rating}
                checked={selectedValue === rating}
                onChange={() => handleStarClick(rating)}
                className="sr-only"
              />
              <StarIcon
                className={`h-10 w-10 transition-all duration-200 ${
                  isFilled
                    ? "text-[#F59E0B] drop-shadow-lg"
                    : "text-gray-600 hover:text-gray-500"
                }`}
                filled={isFilled}
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}
