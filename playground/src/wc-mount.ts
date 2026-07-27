/**
 * Playground helper: put a real Web Component tree in a host div.
 *
 * React only provides the container. Markup, Zag, and onValueChange live in the DOM.
 * Not a library API — production code would just write the same HTML/JS without React.
 */
export function mountWc(
  root: HTMLElement | null,
  html: string,
  bind?: (root: HTMLElement) => void,
) {
  if (!root || root.dataset.wcReady === '1') return
  root.dataset.wcReady = '1'
  root.innerHTML = html
  bind?.(root)
}
