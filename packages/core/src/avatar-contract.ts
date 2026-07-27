export type AvatarSize = 'sm' | 'md' | 'lg'

export interface AvatarContract {
  src?: string
  alt?: string
  /** Fallback initials or short text when image fails / is missing. */
  fallback?: string
  size?: AvatarSize
}
