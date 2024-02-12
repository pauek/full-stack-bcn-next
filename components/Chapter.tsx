import { ContentPiece } from "@/lib/adt";
import data from "@/lib/data";
import MdxDocument from "./mdx/MdxDocument";
import ChapterHeader from "./ChapterHeader";

type ChapterProps = {
  index: number;
  chapter: ContentPiece;
};
export default async function Chapter({ index, chapter }: ChapterProps) {
  const doc = await data.getPieceDocument(chapter);
  const images = await data.getPieceAttachmentList(chapter, "image");
  const chapterImageMap = new Map(images.map((ref) => [ref.filename, ref]));

  return (
    <div key={chapter.hash} className="bg-card rounded relative">
      <div className="absolute -top-[3.2em]" id={chapter.id} />
      <ChapterHeader name={chapter.name} index={index + 1} />
      {doc && (
        <div className="mx-5 pt-2 pb-5">
          <MdxDocument
            text={doc.buffer.toString()}
            imageMap={chapterImageMap}
            className="bg-card rounded relative"
          />
        </div>
      )}
    </div>
  );
}
