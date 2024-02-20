import MdxDocument from "@/components/mdx/MdxDocument";
import { ContentPiece } from "@/lib/adt";
import data from "@/lib/data";
import { FileReference } from "@/lib/data/data-backend";
import { getQuizPartsFromFile } from "@/lib/utils";
import CheckAnswer from "./CheckAnswer";
import { Pre } from "./mdx/Pre";
import { FileType } from "@/data/schema";

type QuizQuestionProps = {
  chapter: ContentPiece;
  quiz: FileReference;
  index: number;
};
export default async function QuizQuestion({ index, chapter, quiz }: QuizQuestionProps) {
  const text = await data.getAttachmentBytes(chapter, quiz);
  const images = await data.getPieceAttachmentList(chapter, FileType.image);
  const imageMap = new Map(images.map((ref) => [ref.filename, ref]));

  if (!text) {
    return null;
  }
  const { body } = getQuizPartsFromFile(text.toString());
  return (
    <div className="mx-2.5 bg-card rounded p-2.5">
      <h4 className="mx-2.5 mb-0">{index}</h4>
      <MdxDocument
        className="p-2.5"
        text={body}
        syntaxHighlighting={false}
        components={{ pre: Pre }}
        imageMap={imageMap}
      />
      <CheckAnswer quizHash={quiz.hash} />
    </div>
  );
}
