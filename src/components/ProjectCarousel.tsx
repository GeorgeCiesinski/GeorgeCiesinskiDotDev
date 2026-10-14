/**
 * Accessible image/GIF carousel for project detail pages.
 */

import { useState } from "react";
import type { ProjectSlide } from "../data/projects";

interface ProjectCarouselProps {
  slides: ProjectSlide[];
  title: string;
}

/**
 * Image carousel with optional prev/next controls and slide dots.
 *
 * @param props - Component props.
 * @param props.slides - Screenshots/GIFs to cycle through.
 * @param props.title - Project title used for accessibility labels.
 * @returns Carousel UI, or `null` when `slides` is empty.
 */
export function ProjectCarousel({ slides, title }: ProjectCarouselProps) {
  const [index, setIndex] = useState(0);

  if (slides.length === 0) {
    return null;
  }

  const slide = slides[index];
  const hasMultiple = slides.length > 1;

  // Wrap around so prev on first / next on last stays in range.
  const go = (next: number) => {
    setIndex((next + slides.length) % slides.length);
  };

  return (
    <div
      className="carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label={title}
    >
      <div className="carousel__frame">
        <img
          className="carousel__image"
          src={slide.src}
          alt={`${title} screenshot ${index + 1}`}
        />
        {slide.caption ? (
          <p className="carousel__caption">{slide.caption}</p>
        ) : null}
      </div>

      {hasMultiple ? (
        <>
          <div className="carousel__controls">
            <button
              className="carousel__btn"
              type="button"
              aria-label="Previous slide"
              onClick={() => go(index - 1)}
            >
              ‹
            </button>
            <div className="carousel__dots" role="group" aria-label="Slides">
              {slides.map((_, i) => (
                <button
                  key={slides[i].src}
                  type="button"
                  className={`carousel__dot${i === index ? " carousel__dot--active" : ""}`}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === index ? "true" : undefined}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
            <button
              className="carousel__btn"
              type="button"
              aria-label="Next slide"
              onClick={() => go(index + 1)}
            >
              ›
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
