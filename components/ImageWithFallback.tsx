"use client"

import Image, { ImageProps } from "next/image"
import { useEffect, useState } from "react"

interface Props extends ImageProps {
  fallback?: ImageProps["src"]
}

export default function ImageWithFallback({ alt, src, ...props }: Props) {
  const [error, setError] = useState<React.SyntheticEvent<HTMLImageElement, Event> | null>(null)

  useEffect(() => {
    setError(null)
  }, [src])

  if (error) {
    return <></>
  }
  return <Image alt={alt} onError={setError} src={src} {...props} />
}
