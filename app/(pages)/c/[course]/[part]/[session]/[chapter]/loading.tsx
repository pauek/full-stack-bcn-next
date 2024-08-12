import { cn } from "@/lib/utils";

export const runtime = "edge";

export default function Loading() {
  return (
    <div className="w-full flex flex-col items-center blur-xs">
      <div className="w-full border-skeleton border-b mx-4 mb-6">
        <div className="max-w-[54rem] m-auto">
          <div className="max-w-[40em]">
            <div className="pt-[1.4em] m-auto mx-4">
              <div className="w-[15em] h-10 bg-skeleton mt-2.5 mb-2.5"></div>
              <div className="flex flex-row gap-2 cursor-pointer">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="p-0">
                    <div className="m-1 p-1 px-2 bg-skeleton rounded transition-color text-sm">
                      <div className="w-[5em] h-5 bg-skeleton"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full max-w-[54rem] m-auto">
        <div className="max-w-[38em]">
          <div className="mx-6 h-6 w-[20em] bg-skeleton"></div>
          <Paragraph lines={3} />
          <Paragraph lines={7} />
          <Paragraph lines={5} />
          <Paragraph lines={5} />
          <div className="mx-6 mt-9 h-6 w-[20em] bg-skeleton"></div>
          <Paragraph lines={6} />
          <div className="mx-6 mt-9 h-6 w-[12em] bg-skeleton"></div>
          <Paragraph lines={2} />
          <Paragraph lines={1} />
          <Paragraph lines={4} />
          <div className="mx-6 mt-9 h-6 w-[20em] bg-skeleton"></div>
          <Paragraph lines={2} />
          <Paragraph lines={2} />
          <Paragraph lines={2} />
        </div>
      </div>
    </div>
  );
}

const Paragraph = ({ lines }: { lines: number }) => {
  return (
    <div className="mx-6 mt-3 mb-6 flex flex-col gap-[0.2em]">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn("mt-[0.2em] h-[0.8em] bg-skeleton", i === lines - 1 ? "w-2/3" : "w-full")}
        ></div>
      ))}
    </div>
  );
};
