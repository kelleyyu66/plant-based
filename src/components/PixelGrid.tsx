import { useMemo } from 'react'

interface PixelGridProps {
  rows: string[]
  palette: Record<string, string | null>
  /** Rendered pixel size (px) of one grid cell. */
  scale?: number
  className?: string
}

/**
 * Renders a string-grid of colored cells as a crisp, seamless image.
 * Draws to a canvas at native (1px/cell) resolution, then upscales with
 * image-rendering: pixelated — no inter-rect seams even under CSS transforms.
 */
export function PixelGrid({ rows, palette, scale = 8, className }: PixelGridProps) {
  const w = rows[0]?.length ?? 0
  const h = rows.length

  const src = useMemo(() => {
    if (typeof document === 'undefined' || w === 0) return ''
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')!
    for (let y = 0; y < rows.length; y++) {
      for (let x = 0; x < rows[y].length; x++) {
        const fill = palette[rows[y][x]]
        if (!fill) continue
        ctx.fillStyle = fill
        ctx.fillRect(x, y, 1, 1)
      }
    }
    return canvas.toDataURL()
  }, [rows, palette, w, h])

  return (
    <img
      src={src}
      width={w * scale}
      height={h * scale}
      className={`pixelated ${className ?? ''}`}
      aria-hidden
      draggable={false}
    />
  )
}
