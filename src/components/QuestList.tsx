import { Info } from '@phosphor-icons/react'
import type { DailyQuestProgress } from '@/lib/types'

/**
 * Daily quests.
 *
 * There is deliberately NO checkbox: completion is computed from the user's food
 * logs (see lib/dailyQuest.ts) and can never be toggled by hand. A finished
 * quest strikes its title through and turns its number into a filled green mark.
 */
export function QuestList({ progress }: { progress: DailyQuestProgress }) {
  return (
    <div className="rounded-card border border-ink bg-paper-2">
      {progress.tasks.map((task, i) => (
        <div
          key={task.id}
          className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-ink/15' : ''}`}
        >
          {/* Quest number — circles in the accent green once earned. */}
          <span
            aria-hidden
            className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border font-mono text-[12px] ${
              task.completed ? 'border-grass bg-grass text-paper-2' : 'border-ink text-ink'
            }`}
          >
            {i + 1}
          </span>

          <div className="min-w-0 flex-1">
            <div
              className={`font-mono text-[14px] leading-snug ${
                task.completed ? 'text-muted line-through decoration-ink/50' : 'text-ink'
              }`}
            >
              {task.title}
            </div>
            <div className="mt-0.5 flex items-center gap-1 font-mono text-[11px] text-muted">
              <Info size={13} aria-hidden />
              Get more information
            </div>
          </div>

          {/* Points go solid ink once the quest is banked. */}
          <span className={`shrink-0 font-mono text-[13px] ${task.completed ? 'text-ink' : 'text-muted'}`}>
            +{task.bonusPoints}
          </span>
        </div>
      ))}
    </div>
  )
}
