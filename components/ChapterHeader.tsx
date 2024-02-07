type ChapterHeaderProps = {
  name: string;
  index: number;
};
export default function ChapterHeader({ name, index }: ChapterHeaderProps) {
  return (
    <div className="ml-5">
      <h2 className="text-2xl font-bold pb-0">
        <div className="text-xs font-light">CHAPTER {index}</div>
        {name}
      </h2>
    </div>
  );
}
