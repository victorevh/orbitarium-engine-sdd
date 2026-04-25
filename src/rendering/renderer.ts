import type { RenderInput } from "../core/models";
import type { Renderer as RendererPort } from "../core/engine/system-ports";

export class Renderer implements RendererPort {
  private attached = false;

  private lastInput: RenderInput | null = null;

  attach(_container: HTMLElement): void {
    this.attached = true;
  }

  detach(): void {
    this.attached = false;
    this.lastInput = null;
  }

  render(input: RenderInput): void {
    if (!this.attached) {
      return;
    }

    this.lastInput = input;
  }

  getLastInput(): RenderInput | null {
    return this.lastInput;
  }
}
