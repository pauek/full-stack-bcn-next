import MdxDocument from "@/components/mdx/MdxDocument";
import { ContentPiece } from "@/lib/adt";
import data from "@/lib/data";
import { FileReference } from "@/lib/data/data-backend";
import { getQuizPartsFromFile } from "@/lib/utils";
import CheckAnswer from "./CheckAnswer";
import { Pre } from "./mdx/Pre";
import { FileType } from "@/data/schema";

const Note = ({ children }: { children: React.ReactNode }) => {
  return <div className="mt-4 text-xs opacity-70 italic">{children}</div>
}

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

  let quizText: string = "Error";
  try {
    const { body } = getQuizPartsFromFile(text.toString());
    quizText = body;
  } catch (e) {
    const msg = `
      Error in question: 
      Chapter ${chapter.name}, index ${index}, file ${quiz.filename}
    `;
    console.log(msg);
    quizText = msg;
  }

  return (
    <div className="quiz-question mx-2.5 bg-card rounded p-5 min-h-[25em] flex flex-col justify-center items-start">
      <h4 className="mx-2.5 mb-0">{index}</h4>
      <MdxDocument
        className="p-2.5 w-full"
        text={quizText}
        syntaxHighlighting={false}
        components={{ pre: Pre, Note }}
        imageMap={imageMap}
      />
      <CheckAnswer quizHash={quiz.hash} />
    </div>
  );
}
