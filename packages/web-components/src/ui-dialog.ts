import * as dialog from '@zag-js/dialog'
import { VanillaMachine, normalizeProps } from '@zag-js/vanilla'
import { ZagRootElement, defineOnce, type Cleanup } from './compound'

export class UiDialog extends ZagRootElement<typeof dialog> {
  protected createMachine() {
    return new VanillaMachine(dialog.machine, { id: `ui-dialog-${crypto.randomUUID()}` })
  }

  protected applyMachine(service: any, cleanup: Cleanup[]) {
    const api = dialog.connect(service, normalizeProps)
    this.applyPart('[data-part="trigger"], ui-dialog-trigger', api.getTriggerProps())
    this.applyPart('[data-part="backdrop"], ui-dialog-backdrop', api.getBackdropProps())
    this.applyPart('[data-part="positioner"], ui-dialog-positioner', api.getPositionerProps())
    this.applyPart('[data-part="content"], ui-dialog-content', api.getContentProps())
    this.applyPart('[data-part="title"], ui-dialog-title', api.getTitleProps())
    this.applyPart('[data-part="description"], ui-dialog-description', api.getDescriptionProps())
    this.applyPart('[data-part="close-trigger"], ui-dialog-close', api.getCloseTriggerProps())
  }

  private applyPart(selector: string, props: Record<string, unknown>) {
    const element = this.querySelector(selector)
    if (element) this.props(element, props)
  }
}

export class UiDialogTrigger extends HTMLElement {}
export class UiDialogBackdrop extends HTMLElement {}
export class UiDialogPositioner extends HTMLElement {}
export class UiDialogContent extends HTMLElement {}
export class UiDialogTitle extends HTMLElement {}
export class UiDialogDescription extends HTMLElement {}
export class UiDialogClose extends HTMLElement {}

defineOnce('ui-dialog', UiDialog)
defineOnce('ui-dialog-trigger', UiDialogTrigger)
defineOnce('ui-dialog-backdrop', UiDialogBackdrop)
defineOnce('ui-dialog-positioner', UiDialogPositioner)
defineOnce('ui-dialog-content', UiDialogContent)
defineOnce('ui-dialog-title', UiDialogTitle)
defineOnce('ui-dialog-description', UiDialogDescription)
defineOnce('ui-dialog-close', UiDialogClose)
