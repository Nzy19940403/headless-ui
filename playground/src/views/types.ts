import type { Component } from 'vue'
import type { ReactNode } from 'react'

export interface ViewDefinition {
  title: string
  description: string
  reactDemo: ReactNode
  vueDemo: Component
  webDemo: ReactNode
}
