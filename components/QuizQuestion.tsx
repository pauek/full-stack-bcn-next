import MdxDocument from "@/components/mdx/MdxDocument";
import { ContentPiece } from "@/lib/adt";
import data from "@/lib/data";
import { FileReference } from "@/lib/data/data-backend";
import { getQuizPartsFromFile } from "@/lib/utils";
import CheckAnswer from "./CheckAnswer";
import { Pre } from "./mdx/Pre";

type QuizQuestionProps = {
  chapter: ContentPiece;
  quiz: FileReference;
  index: number;
};
export default async function QuizQuestion({ index, chapter, quiz }: QuizQuestionProps) {
  const text = await data.getAttachmentBytes(chapter, quiz);
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
      />
      <CheckAnswer quizHash={quiz.hash} />
    </div>
  );
}
