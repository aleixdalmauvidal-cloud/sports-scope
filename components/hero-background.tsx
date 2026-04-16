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
    const gridSpacing = 32
    const dotSize = 1

    // Floating nodes
    const nodes = Array.from({ length: 7 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 4 + Math.random() * 4,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.4,
    }))

    // Curved paths between some nodes
    const connections = [
      [0, 1],
      [1, 2],
      [3, 4],
      [5, 6],
    ]

    let dashOffset = 0
    let animationId: number

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Radial gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height) / 2
      )
      gradient.addColorStop(0, "rgba(0, 229, 160, 0.06)")
      gradient.addColorStop(1, "rgba(0, 229, 160, 0)")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw dot grid
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)"
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
        const opacity = 0.4 + pulse * 0.3
        const size = node.size + pulse * 1

        ctx.fillStyle = `rgba(0, 229, 160, ${opacity})`
        ctx.beginPath()
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw curved connections with animated dashes
      ctx.strokeStyle = "rgba(0, 229, 160, 0.15)"
      ctx.lineWidth = 1
      ctx.setLineDash([4, 6])
      ctx.lineDashOffset = dashOffset

      connections.forEach(([i, j]) => {
        const nodeA = nodes[i]
        const nodeB = nodes[j]
        const midX = (nodeA.x + nodeB.x) / 2
        const midY = (nodeA.y + nodeB.y) / 2 - 50

        ctx.beginPath()
        ctx.moveTo(nodeA.x, nodeA.y)
        ctx.quadraticCurveTo(midX, midY, nodeB.x, nodeB.y)
        ctx.stroke()
      })

      ctx.setLineDash([])
      dashOffset -= 0.5

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
