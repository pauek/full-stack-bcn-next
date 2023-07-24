"use client";

import Image from "next/image";
import SlideViewer from "./SlideViewer";
import { useState } from "react";

function slideUrl(path: string[], slide: string) {
  return `${process.env.NEXT_PUBLIC_CONTENT_SERVER}/${path.join("/")}/slides/${slide}`;
}

type Props = {
  path: string[];
  slides: Array<any>;
};
export default function SlideGrid({ path, slides }: Props) {
  const [currentSlide, setCurrentSlide] = useState<number>(-1);

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
          slide={slideUrl(path, slides[currentSlide])}
          onClose={closeSlideViewer}
          onNext={nextSlide}
          onPrev={prevSlide}
        />
      )}
      <div
        className={
          `max-w-6xl m-auto grid xl:grid-cols-6 lg:grid-cols-6 ` +
          `md:grid-cols-4 sm:grid-cols-2 gap-2 p-8`
        }
      >
        {slides &&
          slides.map((s: any, i: number) => (
            <Image
              className="border-2 rounded shadow-md hover:border-stone-400"
              src={slideUrl(path, s)}
              key={s}
              alt="Slide"
              width={400}
              height={300}
              onClick={() => setCurrentSlide(i)}
            />
          ))}
      </div>
    </>
  );
}
