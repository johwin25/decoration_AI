import type { Project, Item } from "./types";
export function selectedItems(project: Project): Item[] {
  return project.items.filter(
    (i) =>
      project.selectedItemIds === undefined ||
      project.selectedItemIds.includes(i.id),
  );
}
export function knownTotals(items: Item[]): Record<string, number> {
  return items
    .filter(
      (i) =>
        i.ownership === "wishlist" &&
        i.price !== "" &&
        Number.isFinite(Number(i.price)),
    )
    .reduce<Record<string, number>>(
      (totals, i) => ({
        ...totals,
        [i.currency]: (totals[i.currency] || 0) + Number(i.price) * i.quantity,
      }),
      {},
    );
}
