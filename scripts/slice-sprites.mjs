// One-time: slice the 5x4 animal sheets into 20 trimmed, uniform PNGs per variant.
// See design.md §8. Run: npm run slice
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const COLS = 5
const ROWS = 4
const CANVAS = 128 // uniform output size

const SHEETS = [
  { file: 'characters_regular.png', variant: 'regular' },
  { file: 'characters_hat.png', variant: 'hat' },
  { file: 'characters_balloon.png', variant: 'balloon' },
]

// The gold "crown" watermark sits in the top-left corner of every sheet,
// overlapping cell index 0. Blank that corner before trimming so avatar 0 is usable.
const CROWN = { w: 1.0, h: 0.5 } // clear the top band of cell 0 (holds the watermark; the bear sits below)

async function sliceSheet({ file, variant }) {
  const src = path.join(ROOT, 'Assets', file)
  const meta = await sharp(src).metadata()
  const cellW = Math.floor(meta.width / COLS)
  const cellH = Math.floor(meta.height / ROWS)
  const outDir = path.join(ROOT, 'public', 'avatars', variant)
  await mkdir(outDir, { recursive: true })

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const index = r * COLS + c
      const left = c * cellW
      const top = r * cellH

      let cell = sharp(src).extract({ left, top, width: cellW, height: cellH })

      // Clear the watermark corner on cell 0.
      if (index === 0) {
        const raw = await cell.ensureAlpha().raw().toBuffer({ resolveWithObject: true })
        const { data, info } = raw
        const clearW = Math.floor(info.width * CROWN.w)
        const clearH = Math.floor(info.height * CROWN.h)
        for (let y = 0; y < clearH; y++) {
          for (let x = 0; x < clearW; x++) {
            const i = (y * info.width + x) * info.channels
            data[i + 3] = 0 // alpha -> transparent
          }
        }
        cell = sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } })
      }

      // Trim transparent border, then center on a uniform transparent canvas.
      const cellPng = await cell.png().toBuffer()
      let trimmed
      try {
        trimmed = await sharp(cellPng).trim({ threshold: 10 }).toBuffer()
      } catch {
        trimmed = cellPng // fully-uniform or empty cell: keep as-is
      }
      const tMeta = await sharp(trimmed).metadata()
      const scale = Math.min(CANVAS / tMeta.width, CANVAS / tMeta.height, 1)
      const w = Math.max(1, Math.round(tMeta.width * scale))
      const h = Math.max(1, Math.round(tMeta.height * scale))
      const resized = await sharp(trimmed).resize(w, h, { kernel: 'nearest' }).toBuffer()

      await sharp({
        create: { width: CANVAS, height: CANVAS, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
      })
        .composite([{ input: resized, gravity: 'south' }])
        .png()
        .toFile(path.join(outDir, `${String(index).padStart(2, '0')}.png`))
    }
  }
  console.log(`sliced ${variant}: 20 avatars (${cellW}x${cellH} cells -> ${CANVAS}px)`)
}

for (const sheet of SHEETS) await sliceSheet(sheet)
console.log('done.')
