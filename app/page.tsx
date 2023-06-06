import { readDirs } from "@/lib/content/content";

export default async function Home() {
  const dirs = await readDirs();
  return <main>
    {dirs.map(dir => <div>{dir}</div>)}
  </main>;
}
