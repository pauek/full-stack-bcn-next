import ChapterHeader from "@/components/ChapterHeader";
import SlideGrid from "@/components/SlideGrid";
import { attachmentUrl } from "@/lib/urls";
import { SessionPageProps, getAttachments, getPieceOrNotFound } from "../common";
import { generateStaticParamsCommon } from "../static-params";

export default async function Page({ params }: SessionPageProps) {
  const piece = await getPieceOrNotFound({ params });
  const slides = await getAttachments(piece, "slide");

  return (
    <div className="flex flex-col gap-2">
      {slides.map(({ chapter, attachments: slides }, index) => (
        <div className="bg-card rounded min-h-[6em]">
          <ChapterHeader name={chapter.name} index={index + 1} />
          {slides && <SlideGrid slides={slides.map((ref) => attachmentUrl(ref))} />}
        </div>
      ))}
    </div>
  );
}

export const generateStaticParams = generateStaticParamsCommon("slides");
