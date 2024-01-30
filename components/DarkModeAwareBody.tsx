"use client";

import { cn } from "@/lib/utils";
import { ComponentProps, PropsWithChildren, useState } from "react";
import { DarkModeContext } from "./DarkMode";

export default function DarkModeAwareBody({
  className,
  children,
}: PropsWithChildren<ComponentProps<"body">>) {
  const darkModeSetting = localStorage.getItem("darkMode") === "yes";
  const [dark, setDark] = useState(darkModeSetting);

  const setDarkMode = (dark: boolean) => {
    localStorage.setItem("darkMode", dark ? "yes" : "no");
    setDark(dark);
  };

  return (
    <html className={cn(className, dark ? "dark" : "")}>
      <DarkModeContext.Provider value={{ dark, setDark: setDarkMode }}>{children}</DarkModeContext.Provider>
    </html>
  );
}
