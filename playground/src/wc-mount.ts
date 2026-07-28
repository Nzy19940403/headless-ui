/**
 * Playground helper: put a real Web Component tree in a host div.
 *
 * Always re-runs `bind` even when HTML is unchanged, so property assignment
 * (e.g. h-tree.nodes = data) is not skipped on React Strict Mode remounts.
 */
export function mountWc(
  root: HTMLElement | null,
  html: string,
  bind?: (root: HTMLElement) => void,
) {
  if (!root) return

  const same = root.dataset.wcReady === '1' && root.dataset.wcHtml === html
  if (!same) {
    root.innerHTML = ''
    root.dataset.wcReady = '1'
    root.dataset.wcHtml = html
    root.innerHTML = html
  }

  bind?.(root)
}
