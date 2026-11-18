import { beforeEach, describe, expect, it, vi } from "vitest";
import { listOrdersForExport } from "./repo";
import { resolveA2bOrders } from "./exportSelection";

vi.mock("./repo", () => ({
  listOrdersForExport: vi.fn().mockResolvedValue([]),
  listOrdersByIds: vi.fn().mockResolvedValue([]),
  listLinkedOrders: vi.fn().mockResolvedValue([]),
}));

const listOrdersForExportMock = vi.mocked(listOrdersForExport);

function request(url: string) {
  return new Request(url, { method: "POST" });
}

describe("A2B export selection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("includes delivered orders only for an explicitly confirmed re-export", async () => {
    await resolveA2bOrders(
      request("https://example.test/api/admin/orders/export-a2b?from=2026-11-09&to=2026-11-17&includeDelivered=1")
    );

    expect(listOrdersForExportMock).toHaveBeenCalledWith(
      expect.objectContaining({ statusIn: ["NEW", "CONFIRMED", "DELIVERED"] })
    );
  });

  it("does not include delivered orders in the normal A2B export", async () => {
    await resolveA2bOrders(
      request("https://example.test/api/admin/orders/export-a2b?from=2026-11-09&to=2026-11-17")
    );

    expect(listOrdersForExportMock).toHaveBeenCalledWith(
      expect.objectContaining({ statusIn: ["NEW", "CONFIRMED"] })
    );
  });

  it("does not re-export every delivered order when no date is provided", async () => {
    await resolveA2bOrders(
      request("https://example.test/api/admin/orders/export-a2b?includeDelivered=1")
    );

    expect(listOrdersForExportMock).toHaveBeenCalledWith(
      expect.objectContaining({ statusIn: ["NEW", "CONFIRMED"] })
    );
  });
});
