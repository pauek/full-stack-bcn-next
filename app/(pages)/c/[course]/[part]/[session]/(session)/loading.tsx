export default function Loading() {

  const ChapterSkeleton = () => (
    <div className="p-2 px-3 rounded flex flex-col bg-skeleton">
      <span className="text-[.65em] opacity-50 mr-3 text-transparent">CHAPTER X</span>
      <h4 className="m-0 leading-5 text-transparent">Chapter Name</h4>
    </div>
  )

  return (
    <div className="w-full max-w-[54rem] flex flex-col gap-2 mx-auto pt-2 blur-xs">
      {[1, 2, 3, 4, 5, 6].map((index) => (
        <ChapterSkeleton key={index} />
      ))}
    </div>
  )
}
