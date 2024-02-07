import { ContentPiece } from "@/lib/adt";
import PartHeader from "./PartHeader";
import SessionCard from "./SessionCard";

type CoursePartProps = {
  part: ContentPiece;
};
export default async function Part({ part }: CoursePartProps) {
  const { metadata, children } = part;
  if (metadata.hidden || !children) {
    return <></>;
  }
  return (
    <div id={part.id} className="w-full pt-3 pb-5">
      <PartHeader name={part.name} />
      {computeRows(children).map((row, index) => (
        <div key={index} className="flex flex-row justify-center items-center px-2">
          {row.map((session) => (
            <SessionCard key={session.hash} session={session} />
          ))}
        </div>
      ))}
    </div>
  );
}

const computeRows = (sessions: ContentPiece[]) => {
  const rows: ContentPiece[][] = [];
  for (const session of sessions) {
    const i = session.metadata.row || 0;
    const row = rows[i] || [];
    rows[i] = [...row, session];
  }
  return rows;
};
