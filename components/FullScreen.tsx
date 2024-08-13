"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import React, { useState } from "react"
import { QuizIcon } from "./icons/QuizIcon"

type Props = {
  title: string
  className?: string
  children: React.ReactNode
  icon: React.ReactNode
}
export default function FullScreen({ icon, title, className, children }: Props) {
  const [collapsed, setCollapsed] = useState(true)
  return (
    <>
      <div
        className={cn(
          collapsed ? "hidden" : "fixed z-50 top-0 bottom-0 left-0 right-0 bg-secondary",
        )}
      >
        <div className="h-full flex flex-col justify-center">{children}</div>
        <div
          className="fixed z-50 top-3 right-3 text-5xl opacity-40 hover:opacity-70 cursor-pointer"
          onClick={() => setCollapsed(true)}
        >
          &times;
        </div>
      </div>
      <div
        className={cn(
          collapsed ? "" : "pb-4",
          "rounded relative transition-all overflow-clip",
          className,
        )}
      >
        <Button
          onClick={() => setCollapsed((x) => !x)}
          className="flex flex-row gap-2 w-[10em] bg-slate-500"
        >
          {icon}
          {title}
        </Button>
      </div>
    </>
  )
}
