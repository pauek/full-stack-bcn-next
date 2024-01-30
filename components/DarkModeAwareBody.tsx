"use client";

import { cn } from "@/lib/utils";
import { ComponentProps, PropsWithChildren, useState } from "react";
import { DarkModeContext } from "./DarkMode";

export default function DarkModeAwareBody({
  className,
  children,
}: PropsWithChildren<ComponentProps<"body">>) {
  const [dark, setDark] = useState(false);
  return (
    <body className={cn(className, dark ? "dark" : "")}>
      <DarkModeContext.Provider value={{ dark, setDark }}>{children}</DarkModeContext.Provider>
    </body>
  );
}
