import type { DailyQuestProgress } from '@/lib/types'

export function DailyQuestCard({ progress }: { progress: DailyQuestProgress }) {
  return (
    <section className="mx-5 my-3 rounded-pixel border-2 border-lime-400 bg-lime-400/15 px-4 py-3">
      <h2 className="font-pixel text-[0.875em] text-lime-400">DAILY QUEST</h2>
      <p className="mt-1 font-body text-[0.875em] text-paper/70">Completing each task will give you extra points!</p>
      <div className="mt-2">
        {progress.tasks.map((task, index) => (
          <div key={task.id} className={`flex items-center gap-3 py-2 ${index > 0 ? 'border-t border-paper/20' : ''}`}>
            <span className={`flex-1 font-body text-sm ${task.completed ? 'text-paper' : 'text-paper/80'}`}>{task.title}</span>
            <span
              className="shrink-0 rounded-pixel-sm bg-lime-300 px-1.5 py-0.5 font-pixel text-xs text-ink"
            >
              +{task.bonusPoints}
            </span>
            <span
              aria-label={task.completed ? 'Complete' : 'Incomplete'}
              className={`grid h-4 w-4 shrink-0 place-items-center rounded-pixel-sm border border-lime-400 ${
                task.completed ? 'bg-mint-100 text-forest-900' : 'bg-transparent'
              }`}
            >
              {task.completed && <span aria-hidden="true" className="text-[10px] leading-none">✓</span>}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
