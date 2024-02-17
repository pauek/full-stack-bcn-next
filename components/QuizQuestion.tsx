import MdxDocument from "@/components/mdx/MdxDocument";
import { ContentPiece } from "@/lib/adt";
import data from "@/lib/data";
import { FileReference } from "@/lib/data/data-backend";

type QuizQuestionProps = {
  chapter: ContentPiece;
  quiz: FileReference;
  index: number;
};
export default async function QuizQuestion({ index, chapter, quiz }: QuizQuestionProps) {
  const text = await data.getAttachmentBytes(chapter, quiz);
  return text && <MdxDocument className="p-2.5" text={text?.toString()} />;
}
