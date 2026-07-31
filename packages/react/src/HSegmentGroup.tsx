import { SegmentGroup } from '@ark-ui/react/segment-group'
import type { SegmentGroupContract, ValueChangeDetails } from '@demo/ui-core'

export interface HSegmentGroupProps extends SegmentGroupContract {
  onValueChange?: (details: ValueChangeDetails) => void
  className?: string
}

export function HSegmentGroup({
  items,
  value,
  defaultValue,
  disabled,
  name,
  label,
  fullWidth = false,
  size = 'md',
  onValueChange,
  className,
}: HSegmentGroupProps) {
  const rootClass = [
    'ui-segment-group',
    `ui-segment-group--${size}`,
    fullWidth ? 'ui-segment-group--full-width' : null,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const itemsClass = [
    'ui-segment-group__items',
    fullWidth ? 'ui-segment-group__items--full-width' : null,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <SegmentGroup.Root
      className={rootClass}
      data-full-width={fullWidth ? '' : undefined}
      data-size={size}
      data-disabled={disabled ? '' : undefined}
      style={fullWidth ? { width: '100%', alignSelf: 'stretch' } : undefined}
      value={value}
      defaultValue={defaultValue}
      disabled={disabled}
      name={name}
      onValueChange={details => onValueChange?.({ value: details.value ?? '' })}
    >
      {label ? <SegmentGroup.Label className="ui-field__label">{label}</SegmentGroup.Label> : null}
      <div
        className={itemsClass}
        data-size={size}
        style={fullWidth ? { width: '100%', display: 'flex' } : undefined}
      >
        {items.map(item => (
          <SegmentGroup.Item
            key={item.value}
            value={item.value}
            disabled={item.disabled || disabled}
            className="ui-segment"
          >
            <SegmentGroup.ItemText className="ui-segment__text">{item.label}</SegmentGroup.ItemText>
            <SegmentGroup.ItemControl className="ui-segment__control" />
            <SegmentGroup.ItemHiddenInput />
          </SegmentGroup.Item>
        ))}
        <SegmentGroup.Indicator className="ui-segment-group__indicator" />
      </div>
    </SegmentGroup.Root>
  )
}
