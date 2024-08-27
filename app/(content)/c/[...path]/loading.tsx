import LoadingSpinner from "@/components/icons/LoadingSpinner"

export default async function Loading() {
  return (
    <div className="mt-4 flex-1 flex flex-col items-center">
      <div className="flex-[1]" />
      <LoadingSpinner className="w-12 h-12 opacity-60" />
      <div className="flex-[2]" />
    </div>
  )
}
