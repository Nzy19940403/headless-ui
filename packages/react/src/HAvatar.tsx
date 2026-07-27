import { Avatar } from '@ark-ui/react/avatar'
import type { AvatarContract } from '@demo/ui-core'

export interface HAvatarProps extends AvatarContract {
  className?: string
}

export function HAvatar({ src, alt, fallback, size = 'md', className }: HAvatarProps) {
  const initials = fallback ?? (alt ? alt.slice(0, 2).toUpperCase() : '?')
  return (
    <Avatar.Root className={['ui-avatar', `ui-avatar--${size}`, className].filter(Boolean).join(' ')}>
      <Avatar.Fallback className="ui-avatar__fallback">{initials}</Avatar.Fallback>
      {src ? <Avatar.Image className="ui-avatar__image" src={src} alt={alt ?? ''} /> : null}
    </Avatar.Root>
  )
}
