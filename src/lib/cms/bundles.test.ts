import { describe, expect, it } from "vitest";
import { declaredPackQuantity, withCorrectBundleQuantity } from "./bundles";

describe("declaredPackQuantity", () => {
  it.each(["2 pakovanja zvečki", "2 seta (6 zvečki)", "3 paketa", "4x set"])(
    "reads the sold package count from %s",
    (name) => {
      expect(declaredPackQuantity(name)).toBe(Number(name.match(/^\d+/)?.[0]));
    }
  );

  it.each(["Najbolja ponuda", "Set od 2 komada", "6 zvečki"])(
    "does not guess a package count from %s",
    (name) => {
      expect(declaredPackQuantity(name)).toBeNull();
    }
  );
});

describe("withCorrectBundleQuantity", () => {
  it("uses the explicit package count instead of a stale quantity of one", () => {
    expect(
      withCorrectBundleQuantity({ id: "bundle", naziv: "2 pakovanja zvečki", kolicina: 1 })
    ).toEqual({ id: "bundle", naziv: "2 pakovanja zvečki", kolicina: 2 });
  });

  it("leaves bundle quantity unchanged when its name is not explicit", () => {
    expect(
      withCorrectBundleQuantity({ id: "bundle", naziv: "Najbolja ponuda", kolicina: 1 })
    ).toEqual({ id: "bundle", naziv: "Najbolja ponuda", kolicina: 1 });
  });
});