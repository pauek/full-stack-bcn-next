import { cn } from "@/lib/utils";

type _Props = {
  params: {
    course: string;
    part: string;
    session: string;
  };
};
export default function Loading({ params }: _Props) {
  const widths = [8.2, 16, 12, 11, 9, 13.2, 9.3, 14.6, 8];
  return (
    <div className="w-full p-4 blur-xs">
      <div className="md:max-w-[54em] m-auto py-4 pt-2 border rounded-lg bg-background">
        <div className="pt-4 mx-4">
          <div className="w-[4em] h-3 rounded bg-skeleton"></div>
          <div className="w-[20em] h-8 rounded bg-skeleton mt-2 mb-4"></div>
        </div>
        <div className="border-b mb-5"></div>
        <div className="flex flex-col gap-5 mb-1">
          {widths.map((w, i) => (
            <div key={i} className="mx-5">
              <div className="w-[4.2em] h-3 rounded bg-skeleton"></div>
              <div
                className={"h-5 rounded bg-skeleton mt-2"}
                style={{ width: `${w}em` }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
