import { createListCollection, Select } from '@ark-ui/react/select'
import { useMemo } from 'react'
import type { SelectContract, ValueChangeDetails } from '@demo/ui-core'

export interface HSelectProps extends SelectContract {
  onValueChange?: (details: ValueChangeDetails) => void
}

export function HSelect({
  items,
  value,
  defaultValue,
  placeholder = 'Select…',
  disabled,
  label,
  name,
  onValueChange,
}: HSelectProps) {
  const collection = useMemo(
    () => createListCollection({ items, itemToString: item => item.label, itemToValue: item => item.value }),
    [items],
  )

  return (
    <Select.Root
      className="ui-select"
      collection={collection}
      disabled={disabled}
      name={name}
      value={value ? [value] : undefined}
      defaultValue={defaultValue ? [defaultValue] : undefined}
      onValueChange={details => onValueChange?.({ value: details.value[0] ?? '' })}
    >
      {label ? <Select.Label className="ui-field__label">{label}</Select.Label> : null}
      <Select.Control className="ui-select__control">
        <Select.Trigger className="ui-select__trigger">
          <Select.ValueText placeholder={placeholder} />
          <Select.Indicator className="ui-select__indicator">▾</Select.Indicator>
        </Select.Trigger>
      </Select.Control>
      <Select.Positioner>
        <Select.Content className="ui-select__content">
          {collection.items.map(item => (
            <Select.Item key={item.value} item={item} className="ui-select__item">
              <Select.ItemText>{item.label}</Select.ItemText>
              <Select.ItemIndicator className="ui-select__item-indicator">✓</Select.ItemIndicator>
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Positioner>
      <Select.HiddenSelect />
    </Select.Root>
  )
}
