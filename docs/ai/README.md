# AI component references

This directory contains the official Ark UI and Zag documentation snapshots used when implementing components.

## Which file to consult

| Task | Reference |
| --- | --- |
| Understand Ark UI component anatomy | `ark-ui-llms-full.txt` |
| Implement React renderer | `ark-ui-llms-react.txt` |
| Implement Vue renderer | `ark-ui-llms-vue.txt` |
| Implement framework-agnostic behavior | `zag-llms-full.txt` |
| Implement a Web Component renderer | `zag-llms-full.txt`, then the component-specific Zag section |

## Implementation rule

1. Find the component in the Ark UI reference.
2. Find the matching machine and `connect` API in the Zag reference.
3. Keep React and Vue on Ark UI's official renderers.
4. Implement Web Components with the same Zag machine, anatomy, and DOM props.
5. Keep styling in the shared design tokens and renderer styles.

The files are snapshots. Refresh them when upgrading Ark UI or Zag.
