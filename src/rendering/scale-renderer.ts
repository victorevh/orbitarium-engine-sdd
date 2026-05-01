/**
 * Computes the visual mesh radius for a celestial body given its `size` value.
 *
 * Body `size` values in the scene config are approximate Earth radii:
 *   Moon 0.27 | Mercury 0.38 | Mars 0.53 | Venus 0.95 | Earth 1.0
 *   Neptune 3.88 | Uranus 4.01 | Saturn 9.45 | Jupiter 11.21
 *
 * Square-root mapping preserves the relative size ordering while
 * compressing the 40× range down to a ~6× visual range, keeping
 * both small and large bodies readable in the same viewport.
 * The floor (0.3) ensures tiny bodies are never invisible.
 */
export const scaleBodySize = (size: number): number => Math.max(0.3, Math.sqrt(size));
