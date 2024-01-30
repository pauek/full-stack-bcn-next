import ChapterPageBody from "@/components/ChapterPageBody";
import SessionPageBody from "@/components/SessionPageBody";
import data from "@/lib/data";
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
      // We don't render course Parts
      notFound();
    case 1:
      return <div>Course!</div>;
  }
}

export async function generateStaticParams() {
  const course = await data.getPiece([process.env.COURSE_ID!]);
  if (!course) {
    return [];
  }
  const idpaths = await data.getAllIdpaths(course);
  console.log(`allIdpaths:\n${idpaths.map((p) => `${p.join("/")}\n`).join("")}`);
  return idpaths.map((idpath) => ({ idpath }));
}
