import { createListCollection, Select } from '@ark-ui/react/select'
import { Portal } from '@ark-ui/react/portal'
import { useMemo } from 'react'
import { buildSelectValueMap } from '@demo/ui-core'
import type { SelectContract, ValueChangeDetails } from '@demo/ui-core'

export interface HSelectProps<V = string | number> extends SelectContract<V> {
  onValueChange?: (details: ValueChangeDetails<V>) => void
}

export function HSelect<V extends string | number = string | number>({
  items,
  value,
  defaultValue,
  placeholder = 'Select…',
  disabled,
  label,
  name,
  onValueChange,
}: HSelectProps<V>) {
  const valueBackmap = useMemo(() => buildSelectValueMap(items), [items])

  const collection = useMemo(
    () => createListCollection({
      items: items.map(item => ({ ...item, value: String(item.value) })),
      itemToString: item => item.label,
      itemToValue: item => item.value,
    }),
    [items],
  )

  return (
    <Select.Root
      className="ui-select"
      collection={collection}
      disabled={disabled}
      name={name}
      value={value !== undefined ? [String(value)] : undefined}
      defaultValue={defaultValue !== undefined ? [String(defaultValue)] : undefined}
      onValueChange={details => {
        const rawValue = details.value[0]
        const next = rawValue !== undefined ? (valueBackmap.get(rawValue) ?? '' as V) : '' as V
        onValueChange?.({ value: next })
      }}
    >
      {label ? <Select.Label className="ui-field__label">{label}</Select.Label> : null}
      <Select.Control className="ui-select__control">
        <Select.Trigger className="ui-select__trigger">
          <Select.ValueText placeholder={placeholder} />
          <Select.Indicator className="ui-select__indicator">▾</Select.Indicator>
        </Select.Trigger>
      </Select.Control>
      <Portal>
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
      </Portal>
      <Select.HiddenSelect />
    </Select.Root>
  )
}
