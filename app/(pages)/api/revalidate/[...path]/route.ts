import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

type Params = {
  params: {
    path: string[]
  }
}

export async function GET(req: NextRequest, { params }: Params) {
  const { path } = params
  const idjpath = path.join("/")

  revalidatePath(`/c/${idjpath}`)
  console.log(`Revalidated ${idjpath}`)

  return NextResponse.json({
    ok: true,
    idjpath,
    revalidatedAt: new Date(),
  })
}
