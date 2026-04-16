"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

interface PlayerAvatarProps {
  name: string
  imageUrl?: string
  size?: "sm" | "md" | "lg"
  ringColor?: string
  className?: string
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
}

const ringColors = [
  "ring-purple-500",
  "ring-blue-500",
  "ring-emerald-500",
  "ring-amber-500",
  "ring-rose-500",
  "ring-cyan-500",
]

export function PlayerAvatar({
  name,
  imageUrl,
  size = "md",
  ringColor,
  className,
}: PlayerAvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  // Deterministic color based on name
  const colorIndex = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % ringColors.length
  const selectedRing = ringColor || ringColors[colorIndex]

  return (
    <div
      className={cn(
        "relative rounded-full ring-2 overflow-hidden flex items-center justify-center bg-background-elevated",
        sizeClasses[size],
        selectedRing,
        className
      )}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
        />
      ) : (
        <span className="text-xs font-medium text-foreground-secondary">
          {initials}
        </span>
      )}
    </div>
  )
}
