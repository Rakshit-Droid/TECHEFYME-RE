/**
 * The services rail's scroll geometry. `span` is viewport heights of scroll per
 * panel step; each step holds its panel for the first `hold` of it, then slides; the
 * last panel holds for `holdEnd` of a step before the chapter lets go.
 */
export const RAIL = { span: 1.35, hold: 0.35, holdEnd: 0.5 } as const;

/** Where the rail layout applies; elsewhere the panels stack. */
export const RAIL_MEDIA = "(min-width: 1024px) and (min-height: 640px)";
