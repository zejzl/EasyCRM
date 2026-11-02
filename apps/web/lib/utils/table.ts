/** Read the dotted keys used by CRM columns, without walking object prototypes. */
export function getColumnValue(item: unknown, key: string): unknown {
  let value = item;
  for (const part of key.split('.')) {
    if (
      value === null ||
      typeof value !== 'object' ||
      !Object.prototype.hasOwnProperty.call(value, part)
    )
      return undefined;
    value = (value as Record<string, unknown>)[part];
  }
  return value;
}

export function resultRange(page: number, limit: number, total: number, count: number) {
  if (count === 0 || total === 0) return { start: 0, end: 0, total };
  const start = (page - 1) * limit + 1;
  return { start, end: Math.min(start + count - 1, total), total };
}
