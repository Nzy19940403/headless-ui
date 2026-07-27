import { createListCollection, Combobox } from '@ark-ui/react/combobox'
import { useMemo } from 'react'
import type { ComboboxContract, ValueChangeDetails } from '@demo/ui-core'

export interface HComboboxProps extends ComboboxContract {
  onValueChange?: (details: ValueChangeDetails) => void
}

export function HCombobox({
  items,
  value,
  defaultValue,
  placeholder = 'Search…',
  disabled,
  name,
  label,
  onValueChange,
}: HComboboxProps) {
  const collection = useMemo(
    () =>
      createListCollection({
        items,
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
      value={value ? [value] : undefined}
      defaultValue={defaultValue ? [defaultValue] : undefined}
      onValueChange={details => onValueChange?.({ value: details.value[0] ?? '' })}
    >
      {label ? <Combobox.Label className="ui-field__label">{label}</Combobox.Label> : null}
      <Combobox.Control className="ui-combobox__control">
        <Combobox.Input className="ui-combobox__input" placeholder={placeholder} />
        <Combobox.Trigger className="ui-combobox__trigger" type="button">
          ▾
        </Combobox.Trigger>
      </Combobox.Control>
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
    </Combobox.Root>
  )
}
