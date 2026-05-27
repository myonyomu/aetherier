import type { CSSProperties } from "react";
import type { Category } from "../types";

export function findCategory(categories: Category[], categoryId: string | null): Category | undefined {
  return categories.find((category) => category.id === categoryId);
}

export function categoryStyle(category?: Category): CSSProperties {
  return category ? ({ "--category-color": category.color } as CSSProperties) : {};
}
