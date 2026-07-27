import { Slider } from '@ark-ui/react/slider'
import type { NumberValueChangeDetails, SliderContract } from '@demo/ui-core'

export interface HSliderProps extends SliderContract {
  onValueChange?: (details: NumberValueChangeDetails) => void
}

export function HSlider({
  label,
  value,
  defaultValue = 0,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  name,
  onValueChange,
}: HSliderProps) {
  return (
    <Slider.Root
      className="ui-slider"
      value={value === undefined ? undefined : [value]}
      defaultValue={[defaultValue]}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      name={name}
      onValueChange={details => onValueChange?.({ value: details.value[0] ?? min })}
    >
      <div className="ui-slider__header">
        {label ? <Slider.Label className="ui-field__label">{label}</Slider.Label> : null}
        <Slider.ValueText className="ui-slider__value" />
      </div>
      <Slider.Control className="ui-slider__control">
        <Slider.Track className="ui-slider__track">
          <Slider.Range className="ui-slider__range" />
        </Slider.Track>
        <Slider.Thumb index={0} className="ui-slider__thumb">
          <Slider.HiddenInput />
        </Slider.Thumb>
      </Slider.Control>
    </Slider.Root>
  )
}
