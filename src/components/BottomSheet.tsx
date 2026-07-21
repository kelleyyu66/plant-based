import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

/** Slide-up sheet with scrim. design.md §6–§7. */
export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-center">
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="absolute bottom-0 w-full max-w-phone rounded-t-[16px] border-t-2 border-ink bg-paper-2 p-5 pb-8"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-ink/20" />
            {title && (
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-pixel text-lg text-ink">{title}</h2>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="grid h-8 w-8 place-items-center rounded-full border-2 border-ink text-ink"
                >
                  ✕
                </button>
              </div>
            )}
            <div className="max-h-[70vh] overflow-y-auto no-scrollbar">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
