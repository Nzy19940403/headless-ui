import { createListCollection, Combobox } from '@ark-ui/react/combobox'
import { Portal } from '@ark-ui/react/portal'
import { useMemo } from 'react'
import { buildSelectValueMap } from '@demo/ui-core'
import type { ComboboxContract, ValueChangeDetails } from '@demo/ui-core'

export interface HComboboxProps<V = string | number> extends ComboboxContract<V> {
  onValueChange?: (details: ValueChangeDetails<V>) => void
}

export function HCombobox<V extends string | number = string | number>({
  items,
  value,
  defaultValue,
  placeholder = 'Search…',
  disabled,
  name,
  label,
  onValueChange,
}: HComboboxProps<V>) {
  const valueBackmap = useMemo(() => buildSelectValueMap(items), [items])

  const collection = useMemo(
    () =>
      createListCollection({
        items: items.map(item => ({ ...item, value: String(item.value) })),
        itemToString: item => item.label,
        itemToValue: item => item.value,
      }),
    [items],
  )

  return (
    <Combobox.Root
      className="ui-combobox"
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
      {label ? <Combobox.Label className="ui-field__label">{label}</Combobox.Label> : null}
      <Combobox.Control className="ui-combobox__control">
        <Combobox.Input className="ui-combobox__input" placeholder={placeholder} />
        <Combobox.Trigger className="ui-combobox__trigger" type="button">
          ▾
        </Combobox.Trigger>
      </Combobox.Control>
      <Portal>
      <Combobox.Positioner>
        <Combobox.Content className="ui-combobox__content">
          {collection.items.map(item => (
            <Combobox.Item key={item.value} item={item} className="ui-combobox__item">
              <Combobox.ItemText>{item.label}</Combobox.ItemText>
              <Combobox.ItemIndicator className="ui-combobox__item-indicator">✓</Combobox.ItemIndicator>
            </Combobox.Item>
          ))}
        </Combobox.Content>
      </Combobox.Positioner>
      </Portal>
    </Combobox.Root>
  )
}
