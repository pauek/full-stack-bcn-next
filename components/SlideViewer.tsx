import Image from "next/image";
import { useEffect } from "react";
import CloseButton from "./CloseButton";

type Props = {
  slide: string;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
};
export default function SlideViewer({ slide, onClose, onNext, onPrev }: Props) {
  const onKeyPress = (e: KeyboardEvent) => {
    switch (e.key) {
      case "Escape":
        onClose();
        break;
      case "ArrowLeft":
        onPrev();
        break;
      case "ArrowRight":
        onNext();
        break;
      default:
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", onKeyPress);
    return () => {
      window.removeEventListener("keydown", onKeyPress);
    };
  });

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 bg-black grid p-10 z-20">
      <Image src={slide} fill alt="Slide" />
      <div
        className="fixed top-4 right-4 opacity-50 hover:opacity-100 cursor-pointer"
        onClick={onClose}
      >
        <CloseButton />
      </div>
    </div>
  );
}
