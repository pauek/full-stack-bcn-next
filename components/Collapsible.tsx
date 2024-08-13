"use client"

import { cn } from "@/lib/utils"
import React, { useState } from "react"
import { CollapsibleIcon } from "./icons/CollapsibleIcon"

type Props = {
  title: string
  className?: string
  children: React.ReactNode
  icon: React.ReactNode
}
export default function CollapsibleSection({ title, className, icon, children }: Props) {
  const [collapsed, setCollapsed] = useState(true)
  return (
    <div
      className={cn(
        collapsed ? "" : "pb-4",
        "rounded relative transition-all overflow-clip bg-card",
        className,
      )}
    >
      <h4
        className={cn(
          "cursor-pointer flex flex-row items-center gap-1",
          "text-sm hover:bg-black hover:bg-opacity-5 opacity-70",
          "mb-0 py-3 sm:py-1 pl-4 sm:pl-2",
        )}
        onClick={() => setCollapsed((x) => !x)}
      >
        <CollapsibleIcon
          className={cn(collapsed ? "rotate-0" : "rotate-90", "transition-transform opacity-50")}
        />
        {icon}
        {title}
      </h4>
      <div className={cn(collapsed ? "hidden" : "", "mt-2")}>{children}</div>
    </div>
  )
}
