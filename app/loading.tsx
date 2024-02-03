
export default function Loading() {
  return (
    <div className="w-full sm:w-[36em]">
      <PartSkeleton numCards={1} />
      <PartSkeleton numCards={3} />
      <PartSkeleton numCards={7} />
      <PartSkeleton numCards={4} />
    </div>
  );
}

const PartSkeleton = ({ numCards }: { numCards: number }) => {
  const rows = Array.from({ length: numCards / 3 }).map((_) => 3);
  if (numCards % 3 !== 0) rows.push(numCards % 3);

  return (
    <div className="blur-xs">
      <div className="pt-3 pb-5">
        <div className="h-8"></div>
        {rows.map((numCards) => (
          <div className="flex flex-row justify-center px-2">
            {Array.from({ length: numCards }).map((_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const CardSkeleton = () => (
  <div className="w-1/3 flex flex-col relative items-stretch bg-skeleton rounded-md m-1">
    <div className="flex-1 relative w-full aspect-[4/3]"></div>
  </div>
);
