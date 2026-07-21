// Moo the cow, drawn as a pixel grid so the mascot is fully owned (no asset-license risk).
// Each string is one row; each char maps to a color in MOO_PALETTE.
// design.md §8. Frames: idle (sitting) and dance (one arm up, legs kicked).

export const MOO_PALETTE: Record<string, string | null> = {
  '.': null, // transparent
  K: '#2A2320', // outline / spots / eyes
  W: '#FFFFFF', // body
  P: '#E39B9B', // nose / cheeks
  H: '#F0E0D0', // horns / hooves cream
  E: '#2A2320', // eyes
}

// 16 x 16
export const MOO_IDLE = [
  '....K......K....',
  '...KHK....KHK...',
  '..KWWKKKKKKWWK..',
  '..KWWWWWWWWWWK..',
  '.KWWKKWWWWKKWWK.',
  '.KWKEWWWWWWEKWK.',
  '.KWWWKPPPPKWWWK.',
  '.KWWWPPPPPPWWWK.',
  '.KWWWKPPPPKWWWK.',
  '..KWWWWWWWWWWK..',
  '.KWWKKWWWWKKWWK.',
  '.KWWKKWWWWKKWWK.',
  '.KWWWWWWWWWWWWK.',
  '.KWWWWWWWWWWWWK.',
  '..KHK.KWWK.KHK..',
  '..KKK.KKKK.KKK..',
]

// 16 x 16 — arm raised, mid-hop (used on log celebration).
export const MOO_DANCE = [
  '..K.K......K....',
  '.KWKHK....KHK...',
  '.KWKWKKKKKKWWK..',
  '..KWWWWWWWWWWK..',
  '.KWWKKWWWWKKWWK.',
  '.KWKEWWWWWWEKWK.',
  '.KWWWKPPPPKWWWK.',
  '.KWWWPPPPPPWWWK.',
  '.KWWWKPPPPKWWWK.',
  '..KWWWWWWWWWWK..',
  '.KWWKKWWWWKKWWK.',
  '.KWWKKWWWWKKWWK.',
  '.KWWWWWWWWWWWWK.',
  '..KWWWWWWWWWWK..',
  '.KHK........KHK.',
  '.KKK........KKK.',
]

// 16 x 16 — eyes closed, resting (streak asleep state).
export const MOO_SLEEP = [
  '....K......K....',
  '...KHK....KHK...',
  '..KWWKKKKKKWWK..',
  '..KWWWWWWWWWWK..',
  '.KWWWWWWWWWWWWK.',
  '.KWKKWWWWWWKKWK.',
  '.KWWWKPPPPKWWWK.',
  '.KWWWPPPPPPWWWK.',
  '.KWWWKPPPPKWWWK.',
  '..KWWWWWWWWWWK..',
  '.KWWKKWWWWKKWWK.',
  '.KWWKKWWWWKKWWK.',
  '.KWWWWWWWWWWWWK.',
  '.KWWWWWWWWWWWWK.',
  '..KHK.KWWK.KHK..',
  '..KKK.KKKK.KKK..',
]

export const MOO_FRAMES = { idle: MOO_IDLE, dance: MOO_DANCE, sleep: MOO_SLEEP } as const
export type MooMood = keyof typeof MOO_FRAMES
