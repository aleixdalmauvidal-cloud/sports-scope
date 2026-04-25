"use client"

import { useEffect, useRef } from "react"

export function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    // Dot grid
    const gridSpacing = 40
    const dotSize = 1

    // Floating nodes (deterministic layout for SSR / hydration consistency)
    const nodes = Array.from({ length: 8 }, (_, idx) => ({
      x: ((idx * 0.11 + 0.07) % 0.86 + 0.07) * canvas.width,
      y: ((idx * 0.19 + 0.05) % 0.9 + 0.05) * canvas.height,
      size: 3 + (idx % 5) * 0.9,
      phase: (idx * Math.PI) / 4,
      speed: 0.2 + (idx % 4) * 0.075,
      color: idx % 2 === 0 ? "lime" : "cyan",
    }))

    // Curved paths between some nodes
    const connections = [
      [0, 1],
      [1, 2],
      [2, 3],
      [4, 5],
      [6, 7],
    ]

    let dashOffset = 0
    let animationId: number

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Multiple radial gradients for depth
      const gradient1 = ctx.createRadialGradient(
        canvas.width * 0.3,
        canvas.height * 0.4,
        0,
        canvas.width * 0.3,
        canvas.height * 0.4,
        canvas.width * 0.6
      )
      gradient1.addColorStop(0, "rgba(0, 255, 135, 0.08)")
      gradient1.addColorStop(1, "rgba(0, 255, 135, 0)")
      ctx.fillStyle = gradient1
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const gradient2 = ctx.createRadialGradient(
        canvas.width * 0.7,
        canvas.height * 0.6,
        0,
        canvas.width * 0.7,
        canvas.height * 0.6,
        canvas.width * 0.5
      )
      gradient2.addColorStop(0, "rgba(0, 212, 255, 0.05)")
      gradient2.addColorStop(1, "rgba(0, 212, 255, 0)")
      ctx.fillStyle = gradient2
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw dot grid
      ctx.fillStyle = "rgba(255, 255, 255, 0.06)"
      for (let x = 0; x < canvas.width; x += gridSpacing) {
        for (let y = 0; y < canvas.height; y += gridSpacing) {
          ctx.beginPath()
          ctx.arc(x, y, dotSize, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Update and draw nodes
      const time = Date.now() / 1000
      nodes.forEach((node) => {
        const pulse = Math.sin(time * node.speed + node.phase)
        const opacity = 0.3 + pulse * 0.3
        const size = node.size + pulse * 1.5

        const color = node.color === "lime" 
          ? `rgba(0, 255, 135, ${opacity})`
          : `rgba(0, 212, 255, ${opacity})`
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2)
        ctx.fill()

        // Glow effect
        ctx.fillStyle = node.color === "lime" 
          ? `rgba(0, 255, 135, ${opacity * 0.3})`
          : `rgba(0, 212, 255, ${opacity * 0.3})`
        ctx.beginPath()
        ctx.arc(node.x, node.y, size * 2.5, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw curved connections with animated dashes
      ctx.strokeStyle = "rgba(0, 255, 135, 0.12)"
      ctx.lineWidth = 1
      ctx.setLineDash([5, 8])
      ctx.lineDashOffset = dashOffset

      connections.forEach(([i, j]) => {
        const nodeA = nodes[i]
        const nodeB = nodes[j]
        const midX = (nodeA.x + nodeB.x) / 2
        const midY = (nodeA.y + nodeB.y) / 2 - 60

        ctx.beginPath()
        ctx.moveTo(nodeA.x, nodeA.y)
        ctx.quadraticCurveTo(midX, midY, nodeB.x, nodeB.y)
        ctx.stroke()
      })

      ctx.setLineDash([])
      dashOffset -= 0.4

      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
