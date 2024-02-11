type ChapterHeaderProps = {
  name?: string;
  index: number;
};
export default function ChapterHeader({ name, index }: ChapterHeaderProps) {
  return (
    <h2 className="mx-2.5 lg:mx-5 text-2xl font-bold pt-4 pb-2 mb-2 border-b">
      <div className="text-xs font-light pl-0.5">CHAPTER {index}</div>
      {name}
    </h2>
  );
}
