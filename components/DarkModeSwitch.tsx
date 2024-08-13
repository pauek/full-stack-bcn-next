"use client"

import { cn } from "@/lib/utils"
import { useDarkMode } from "./DarkMode"
import { DarkMode } from "./icons/DarkMode"
import { LightMode } from "./icons/LightMode"

export default function DarkModeSwitch({ className }: { className?: string }) {
  const { dark, setDark } = useDarkMode()
  return (
    <div className={cn("cursor-pointer", className)} onClick={() => setDark(!dark)}>
      {dark ? <LightMode /> : <DarkMode />}
    </div>
  )
}
