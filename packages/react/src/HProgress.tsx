import { Progress } from '@ark-ui/react/progress'
import type { ProgressContract } from '@demo/ui-core'

export interface HProgressProps extends ProgressContract {
  className?: string
}

export function HProgress({
  value,
  min = 0,
  max = 100,
  label,
  indeterminate,
  className,
}: HProgressProps) {
  return (
    <Progress.Root
      className={['ui-progress', className].filter(Boolean).join(' ')}
      value={indeterminate ? null : value}
      min={min}
      max={max}
    >
      {label ? (
        <div className="ui-progress__header">
          <Progress.Label className="ui-progress__label">{label}</Progress.Label>
          {!indeterminate ? <Progress.ValueText className="ui-progress__value" /> : null}
        </div>
      ) : null}
      <Progress.Track className="ui-progress__track">
        <Progress.Range className="ui-progress__range" />
      </Progress.Track>
    </Progress.Root>
  )
}
