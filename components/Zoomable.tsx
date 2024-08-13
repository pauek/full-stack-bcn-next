"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

// https://stackoverflow.com/questions/4770025/how-to-disable-scrolling-temporarily

const makeScrollEnablerDisabler = () => {
  // left: 37, up: 38, right: 39, down: 40,
  // spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
  var keys: Record<string, number> = { 37: 1, 38: 1, 39: 1, 40: 1 }

  function preventDefault(e: Event) {
    e.preventDefault()
  }

  function preventDefaultForScrollKeys(e: KeyboardEvent) {
    if (keys[e.code]) {
      preventDefault(e)
      return false
    }
  }

  // modern Chrome requires { passive: false } when adding event
  var supportsPassive = false
  try {
    const obj = Object.defineProperty({}, "passive", {
      get: () => (supportsPassive = true),
    })
    window.addEventListener("test", () => {}, obj)
  } catch (e) {}

  var wheelOpt: any = supportsPassive ? { passive: false } : false
  var wheelEvent = "onwheel" in document.createElement("div") ? "wheel" : "mousewheel"

  // call this to Disable
  function disableScroll() {
    window.addEventListener("DOMMouseScroll", preventDefault, false) // older FF
    window.addEventListener(wheelEvent, preventDefault, wheelOpt) // modern desktop
    window.addEventListener("touchmove", preventDefault, wheelOpt) // mobile
    window.addEventListener("keydown", preventDefaultForScrollKeys, false)
  }

  // call this to Enable
  function enableScroll() {
    window.removeEventListener("DOMMouseScroll", preventDefault, false)
    window.removeEventListener(wheelEvent, preventDefault, wheelOpt)
    window.removeEventListener("touchmove", preventDefault, wheelOpt)
    window.removeEventListener("keydown", preventDefaultForScrollKeys, false)
  }

  return { disableScroll, enableScroll }
}

type _Props = {
  bgColor?: string
  children: React.ReactNode
}
export default function Zoomable({ bgColor, children }: _Props) {
  const [zoomed, setZoomed] = useState<boolean>(false)
  const toggleZoom = () => setZoomed((z) => !z)

  const closeOnEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setZoomed(false)
    }
  }

  useEffect(() => {
    if (zoomed) {
      const { disableScroll, enableScroll } = makeScrollEnablerDisabler()
      disableScroll()
      window.addEventListener("keydown", closeOnEscape)
      return () => {
        enableScroll()
        window.removeEventListener("keydown", closeOnEscape)
      }
    }
  }, [zoomed])

  return (
    <div className="cursor-pointer zoomable" onClick={toggleZoom}>
      {zoomed ? <_ZoomedVersion bgColor={bgColor}>{children}</_ZoomedVersion> : children}
    </div>
  )
}

const _ZoomedVersion = ({ bgColor, children }: _Props) => {
  return (
    <div
      className={cn(
        bgColor ? `bg-${bgColor}` : `bg-black`,
        "fixed inset-0 bg-opacity-[.98] z-50 flex items-center justify-center",
      )}
    >
      {children}
    </div>
  )
}
