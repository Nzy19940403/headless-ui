/**
 * Pin text caret to the end of an input/textarea when it is focused.
 * Used by NumberInput so step/format value rewrites do not leave the caret mid-string.
 */
export function pinCaretToEnd(input: HTMLInputElement | HTMLTextAreaElement | null | undefined) {
  if (!input || typeof document === 'undefined') return
  if (document.activeElement !== input) return
  const len = input.value.length
  try {
    input.setSelectionRange(len, len)
  } catch {
    /* some input types reject selection */
  }
}

/** After focus settles, pin caret to end (browser may place caret at 0 first). */
export function pinCaretToEndOnFocus(event: { currentTarget: EventTarget | null }) {
  const input = event.currentTarget as HTMLInputElement | HTMLTextAreaElement | null
  if (!input) return
  const run = () => {
    const len = input.value.length
    try {
      input.setSelectionRange(len, len)
    } catch {
      /* ignore */
    }
  }
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(run)
  else run()
}
