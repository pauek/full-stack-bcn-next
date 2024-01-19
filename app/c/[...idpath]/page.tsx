import ChapterPageBody from "@/components/ChapterPageBody";
import SessionPageBody from "@/components/SessionPageBody";
import { notFound } from "next/navigation";

type _Props = {
  params: {
    idpath: string[];
  };
};

export default async function Page({ params }: _Props) {
  const { idpath } = params;
  switch (idpath.length) {
    case 4:
      return <ChapterPageBody idpath={idpath} />;
    case 3:
      return <SessionPageBody idpath={idpath} />;
    case 2:
      // We don't render parts
      notFound();
    case 1:
      return <div>Course!</div>;
  }
}
