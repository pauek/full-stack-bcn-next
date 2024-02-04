"use client";

import Image from "next/image";
import SlideViewer from "./SlideViewer";
import { useState } from "react";
import { attachmentUrl } from "@/lib/urls";
import { FileReference } from "@/lib/data/data-backend";

type Props = {
  slides: Array<string>;
};
export default function SlideGrid({ slides }: Props) {
  const [currentSlide, setCurrentSlide] = useState<number>(-1);

  if (slides.length === 0) {
    return <></>;
  }

  const closeSlideViewer = () => setCurrentSlide(-1);

  const nextSlide = () => {
    setCurrentSlide((x) => Math.min(x + 1, slides.length - 1));
  };
  const prevSlide = () => {
    setCurrentSlide((x) => Math.max(x - 1, 0));
  };

  return (
    <>
      {currentSlide >= 0 && (
        <SlideViewer
          slide={slides[currentSlide]}
          onClose={closeSlideViewer}
          onNext={nextSlide}
          onPrev={prevSlide}
        />
      )}
      <div className="max-w-[54em] m-auto">
        <div
          className={
            `mx-5 grid xl:grid-cols-8 lg:grid-cols-6 ` +
            `md:grid-cols-6 sm:grid-cols-4 grid-cols-2 gap-2 pt-4`
          }
        >
          {slides &&
            slides.map((url, i: number) => (
              <Image
                key={url}
                className="border-2 rounded shadow-md hover:border-stone-400"
                src={url}
                alt="Slide"
                width={400}
                height={300}
                onClick={() => setCurrentSlide(i)}
              />
            ))}
        </div>
      </div>
    </>
  );
}
