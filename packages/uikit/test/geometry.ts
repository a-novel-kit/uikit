/** How far an element's middle sits from the middle of its row's content box, in CSS pixels; negative is above. */
export function offsetFromMiddle(content: Element, row: Element): number {
  const box = row.getBoundingClientRect();
  const style = getComputedStyle(row);
  const top = box.top + parseFloat(style.borderTopWidth) + parseFloat(style.paddingTop);
  const bottom = box.bottom - parseFloat(style.borderBottomWidth) - parseFloat(style.paddingBottom);
  const own = content.getBoundingClientRect();
  return (own.top + own.bottom - top - bottom) / 2;
}
