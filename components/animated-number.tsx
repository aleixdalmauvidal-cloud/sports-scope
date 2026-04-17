"use client"

import { useEffect, useState } from "react"
import { motion, useSpring, useTransform } from "framer-motion"

interface AnimatedNumberProps {
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
}

export function AnimatedNumber({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
}: AnimatedNumberProps) {
  const [isClient, setIsClient] = useState(false)
  
  const spring = useSpring(0, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  const display = useTransform(spring, (current) =>
    `${prefix}${current.toFixed(decimals)}${suffix}`
  )

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  if (!isClient) {
    return (
      <span className={`font-mono font-semibold ${className}`}>
        {prefix}{value.toFixed(decimals)}{suffix}
      </span>
    )
  }

  return (
    <motion.span className={`font-mono font-semibold ${className}`}>
      {display}
    </motion.span>
  )
}
