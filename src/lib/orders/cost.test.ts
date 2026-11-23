import { describe, expect, it } from "vitest";
import { mergeCostSnapshots } from "./cost";

describe("mergeCostSnapshots", () => {
  it("keeps the purchase cost of both packages when orders are merged", () => {
    expect(
      mergeCostSnapshots([
        { quantity: 1, costPrice: 12, costTotal: 12 },
        { quantity: 1, costPrice: 12, costTotal: 12 },
      ])
    ).toEqual({ quantity: 2, costPrice: 12, costTotal: 24 });
  });

  it("uses a weighted average when merged orders have different unit costs", () => {
    expect(
      mergeCostSnapshots([
        { quantity: 1, costPrice: 10, costTotal: 10 },
        { quantity: 2, costPrice: 15, costTotal: 30 },
      ])
    ).toEqual({ quantity: 3, costPrice: 13.33, costTotal: 40 });
  });
});