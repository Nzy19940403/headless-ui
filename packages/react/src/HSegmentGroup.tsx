import { SegmentGroup } from '@ark-ui/react/segment-group'
import type { SegmentGroupContract, ValueChangeDetails } from '@demo/ui-core'

export interface HSegmentGroupProps extends SegmentGroupContract {
  onValueChange?: (details: ValueChangeDetails) => void
}

export function HSegmentGroup({
  items,
  value,
  defaultValue,
  disabled,
  name,
  label,
  onValueChange,
}: HSegmentGroupProps) {
  return (
    <SegmentGroup.Root
      className="ui-segment-group"
      value={value}
      defaultValue={defaultValue}
      disabled={disabled}
      name={name}
      onValueChange={details => onValueChange?.({ value: details.value ?? '' })}
    >
      {label ? <SegmentGroup.Label className="ui-field__label">{label}</SegmentGroup.Label> : null}
      <div className="ui-segment-group__items">
        {items.map(item => (
          <SegmentGroup.Item
            key={item.value}
            value={item.value}
            disabled={item.disabled}
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
