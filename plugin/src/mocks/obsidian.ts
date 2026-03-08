// biome-ignore lint/correctness/noUnusedFunctionParameters: mocks with empty impl
export function setIcon(parent: HTMLElement, iconId: string, size?: number): void {}

// biome-ignore lint/correctness/noUnusedFunctionParameters: mocks with empty impl
export function setTooltip(el: HTMLElement, text: string, options?: TooltipOptions): void {}

export type TooltipOptions = {
  placement?: string;
};

export class App {}
export class PluginSettingTab {}
export class Setting {}

export class MarkdownRenderChild {
  containerEl: HTMLElement;
  constructor(containerEl: HTMLElement) {
    this.containerEl = containerEl;
  }
}

export class Notice {}

export class Menu {
  addItem(cb: (item: MenuItem) => void): this {
    cb(new MenuItem());
    return this;
  }
  // biome-ignore lint/correctness/noUnusedFunctionParameters: mocks with empty impl
  showAtPosition(position: { x: number; y: number }): this {
    return this;
  }
}

export class MenuItem {
  // biome-ignore lint/correctness/noUnusedFunctionParameters: mocks with empty impl
  setTitle(title: string): this {
    return this;
  }
  // biome-ignore lint/correctness/noUnusedFunctionParameters: mocks with empty impl
  onClick(cb: (evt: MouseEvent | KeyboardEvent) => void): this {
    return this;
  }
}

// biome-ignore lint/complexity/noStaticOnlyClass: mock must match Obsidian's class-based API
export class MarkdownRenderer {
  static renderMarkdown(
    markdown: string,
    el: HTMLElement,
    _sourcePath: string,
    _component: unknown,
  ): Promise<void> {
    el.textContent = markdown;
    return Promise.resolve();
  }
}
