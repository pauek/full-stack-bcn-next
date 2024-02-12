import ChapterHeader from "@/components/ChapterHeader";
import SlideGrid from "@/components/SlideGrid";
import { attachmentUrl } from "@/lib/urls";
import { SessionPageProps, getAttachments, getPieceWithChildrenOrNotFound } from "../common";
import { generateStaticParamsCommon } from "../static-params";

export default async function Page({ params }: SessionPageProps) {
  const piece = await getPieceWithChildrenOrNotFound({ params });
  const slides = await getAttachments(piece, "slide");

  return (
    <div className="flex flex-col gap-2">
      {slides.map(
        ({ chapter, attachments: slides }, index) =>
          slides.length > 0 && (
            <div key={chapter.hash} className="bg-card rounded min-h-[6em] relative">
              <div className="absolute -top-[3.2em]" id={chapter.id} />
              <ChapterHeader name={chapter.name} index={index + 1} />
              <SlideGrid slides={slides.map((ref) => attachmentUrl(ref))} />
            </div>
          )
      )}
    </div>
  );
}

export const generateStaticParams = generateStaticParamsCommon("slides");