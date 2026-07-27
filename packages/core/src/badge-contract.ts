import type { TagTone } from './tag-contract'

export type BadgeTone = TagTone

export interface BadgeContract {
  tone?: BadgeTone
  /** Show as a small status dot without text padding emphasis. */
  dot?: boolean
}
