import { env } from "@/lib/env.mjs"
import { redirect } from "next/navigation"

export default function Page() {
  redirect(`/c/${env.COURSE_ID}`)
}
