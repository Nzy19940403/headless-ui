export type TagTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info'
export type TagSize = 'sm' | 'md' | 'lg'

export interface TagContract {
  tone?: TagTone
  size?: TagSize
  /** Text content used when the framework adapter has no children/slot content. */
  content?: string
}
