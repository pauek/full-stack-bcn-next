"use client";

import Image from "next/image";
import SlideViewer from "./SlideViewer";
import { useState } from "react";

function slideUrl(path: string[], slide: string) {
  const url = `/content/${path.join("/")}/slides/${slide}`;
  return url;
}

type Props = {
  path: string[];
  slides: Array<string> | null;
};
export default function SlideGrid({ path, slides }: Props) {
  const [currentSlide, setCurrentSlide] = useState<number>(-1);

  if (!slides) {
    return <></>;
  }

  const numSlides = slides ? slides.length : 0;

  const closeSlideViewer = () => setCurrentSlide(-1);

  const nextSlide = () => {
    setCurrentSlide((x) => Math.min(x + 1, numSlides - 1));
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
      <div className="max-w-[54em] m-auto">
        <div
          className={
            `mx-5 grid xl:grid-cols-8 lg:grid-cols-6 ` +
            `md:grid-cols-6 sm:grid-cols-4 grid-cols-2 gap-2 pt-4`
          }
        >
          {slides &&
            slides.map((s: any, i: number) => (
              <Image
                key={s}
                className="border-2 rounded shadow-md hover:border-stone-400"
                src={slideUrl(path, s)}
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
