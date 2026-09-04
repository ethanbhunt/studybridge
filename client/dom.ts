export function byId<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (element === null) {
    throw new Error(`Expected an element with id '${id}'.`);
  }
  return element as T;
}

export function clear(element: HTMLElement): void {
  element.replaceChildren();
}

export function text<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  content: string,
  className?: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  element.textContent = content;
  if (className !== undefined) {
    element.className = className;
  }
  return element;
}

export function button(
  label: string,
  className: string,
  onClick: () => void | Promise<void>,
): HTMLButtonElement {
  const element = text("button", label, className);
  element.type = "button";
  element.addEventListener("click", () => void onClick());
  return element;
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
