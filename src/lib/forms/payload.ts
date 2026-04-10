/**
 * Remove `undefined` entries so JSON bodies match Laravel optional fields.
 */
export function omitUndefined<T extends Record<string, unknown>>(
  obj: T,
): { [K in keyof T]?: T[K] } {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as { [K in keyof T]?: T[K] };
}
