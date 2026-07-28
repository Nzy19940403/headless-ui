export interface UiChartThemeTokens {
  color: string[]
  text: string
  textSecondary: string
  muted: string
  hairline: string
  surface: string
  primary: string
  success: string
  warning: string
  danger: string
  info: string
}

function cssVar(el: Element, name: string, fallback: string): string {
  const value = getComputedStyle(el).getPropertyValue(name).trim()
  return value || fallback
}

/** Read design tokens from host / document for ECharts option styling. */
export function readUiChartTheme(el: Element = document.documentElement): UiChartThemeTokens {
  const root = el instanceof Element ? el : document.documentElement
  // Prefer :root tokens; component host may not define --ui-*.
  const scope = document.documentElement
  void root

  return {
    color: [
      cssVar(scope, '--ui-color-primary', '#2563eb'),
      cssVar(scope, '--ui-color-success', '#16a34a'),
      cssVar(scope, '--ui-color-warning', '#d97706'),
      cssVar(scope, '--ui-color-danger', '#dc2626'),
      cssVar(scope, '--ui-color-info', '#0284c7'),
      cssVar(scope, '--ui-color-ai', '#722ed1'),
      cssVar(scope, '--ui-color-primary-hover', '#1d4ed8'),
      cssVar(scope, '--ui-color-muted', '#66738b'),
    ],
    text: cssVar(scope, '--ui-color-text', '#172033'),
    textSecondary: cssVar(scope, '--ui-color-text-secondary', '#405577'),
    muted: cssVar(scope, '--ui-color-muted', '#66738b'),
    hairline: cssVar(scope, '--ui-color-hairline', '#e0e7f2'),
    surface: cssVar(scope, '--ui-color-surface', '#ffffff'),
    primary: cssVar(scope, '--ui-color-primary', '#2563eb'),
    success: cssVar(scope, '--ui-color-success', '#16a34a'),
    warning: cssVar(scope, '--ui-color-warning', '#d97706'),
    danger: cssVar(scope, '--ui-color-danger', '#dc2626'),
    info: cssVar(scope, '--ui-color-info', '#0284c7'),
  }
}
