import { beforeEach, describe, expect, it, vi } from "vitest";
import { listOrdersForExport } from "./repo";
import { resolveExportOrders, resolvePackingOrders } from "./exportSelection";

vi.mock("./repo", () => ({
  listOrdersForExport: vi.fn().mockResolvedValue([]),
  listOrdersByIds: vi.fn().mockResolvedValue([]),
  listLinkedOrders: vi.fn().mockResolvedValue([]),
}));

const listOrdersForExportMock = vi.mocked(listOrdersForExport);

function request(url: string) {
  return new Request(url, { method: "POST" });
}

describe("order export selection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("keeps A2B export limited to new and confirmed orders", async () => {
    await resolveExportOrders(
      request("https://example.test/api/admin/orders/export-a2b?from=2026-11-09&to=2026-11-17")
    );

    expect(listOrdersForExportMock).toHaveBeenCalledWith(
      expect.objectContaining({ statusIn: ["NEW", "CONFIRMED"] })
    );
  });

  it("includes A2B-exported orders in packing list for the selected inclusive dates", async () => {
    await resolvePackingOrders(
      request("https://example.test/api/admin/orders/export-packing?from=2026-11-09&to=2026-11-17")
    );

    expect(listOrdersForExportMock).toHaveBeenCalledWith({
      search: undefined,
      status: "ALL",
      statusIn: ["NEW", "CONFIRMED", "PACKING", "DELIVERED"],
      from: "2026-11-08T23:00:00.000Z",
      to: "2026-11-17T22:59:59.999Z",
      product: undefined,
      city: undefined,
      unsyncedOnly: false,
    });
  });
});
