"use client"

import { useEffect, useRef } from "react"
import { useInView, useMotionValue, useSpring, useTransform, motion } from "framer-motion"

interface CounterProps {
  value: number
  direction?: "up" | "down"
  className?: string
  suffix?: string
}

export default function Counter({
  value,
  direction = "up",
  className,
  suffix = "",
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(direction === "down" ? value : 0)
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  })
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  useEffect(() => {
    if (isInView) {
      motionValue.set(value)
    }
  }, [motionValue, isInView, value])

  const displayValue = useTransform(springValue, (latest) => Math.floor(latest))

  return (
    <span className={className} ref={ref}>
      <motion.span>{displayValue}</motion.span>
      {suffix}
    </span>
  )
}
