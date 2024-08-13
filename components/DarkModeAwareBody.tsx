"use client"

import { cn } from "@/lib/utils"
import { ComponentProps, PropsWithChildren, useState } from "react"
import { DarkModeContext } from "./DarkMode"

const loadDarkModeState = () => {
  if (typeof window !== "undefined") {
    return window.localStorage.getItem("darkMode") === "yes"
  }
}

const saveDarkModeState = (value: boolean) => {
  if (typeof window !== "undefined") {
    return window.localStorage.setItem("darkMode", value ? "yes" : "no")
  }
}

export default function DarkModeAwareBody({
  className,
  children,
}: PropsWithChildren<ComponentProps<"body">>) {
  const [dark, setDark] = useState(loadDarkModeState() || false)

  const setDarkMode = (dark: boolean) => {
    saveDarkModeState(dark)
    setDark(dark)
  }

  return (
    <html className={cn(className, dark ? "dark" : "")}>
      <DarkModeContext.Provider value={{ dark, setDark: setDarkMode }}>
        {children}
      </DarkModeContext.Provider>
    </html>
  )
}
