import type { Component } from 'vue'
import type { ReactNode } from 'react'
import type { ComponentApiDoc, ComponentApiKey } from '../api-catalog'

export interface ViewDefinition {
  title: string
  description: string
  reactDemo: ReactNode
  vueDemo: Component
  webDemo: ReactNode
  examples?: Array<{
    title: string
    description?: string
    reactDemo: ReactNode
    vueDemo: Component
    webDemo: ReactNode
  }>
  /** Prefer catalog key so API tables stay in one place. */
  apiKey?: ComponentApiKey
  /** Or pass a full doc object for one-off pages. */
  api?: ComponentApiDoc
}
