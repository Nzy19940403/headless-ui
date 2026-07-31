<script setup lang="ts">
import { Slider } from '@ark-ui/vue/slider'
import type { NumberValueChangeDetails, SliderContract } from '@demo/ui-core'

withDefaults(defineProps<SliderContract>(), {
  defaultValue: 0,
  min: 0,
  max: 100,
  step: 1,
})
const emit = defineEmits<{
  'update:value': [value: number]
  'value-change': [details: NumberValueChangeDetails]
}>()

function onValueChange(details: { value: number[] }) {
  const value = details.value[0] ?? 0
  emit('value-change', { value })
  emit('update:value', value)
}
</script>

<template>
  <!-- Ark Vue Slider: controlled state is modelValue (number[]), not value -->
  <Slider.Root
    class="ui-slider"
    :model-value="value === undefined ? undefined : [value]"
    :default-value="[defaultValue]"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    :name="name"
    @value-change="onValueChange"
  >
    <div class="ui-slider__header">
      <Slider.Label v-if="label" class="ui-field__label">{{ label }}</Slider.Label>
      <Slider.ValueText class="ui-slider__value" />
    </div>
    <Slider.Control class="ui-slider__control">
      <Slider.Track class="ui-slider__track">
        <Slider.Range class="ui-slider__range" />
      </Slider.Track>
      <Slider.Thumb :index="0" class="ui-slider__thumb">
        <Slider.HiddenInput />
      </Slider.Thumb>
    </Slider.Control>
  </Slider.Root>
</template>
