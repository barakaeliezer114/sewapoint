import { describe, it, expect } from "vitest";
import { isRangeFree } from "@/lib/catalog";
const occ = [{ start: "2026-11-10", end: "2026-11-12" }];
describe("isRangeFree", () => {
  it("rejects overlapping dates", () => expect(isRangeFree({ start: "2026-11-12", end: "2026-11-14" }, occ)).toBe(false));
  it("accepts free dates", () => expect(isRangeFree({ start: "2026-11-13", end: "2026-11-14" }, occ)).toBe(true));
});
