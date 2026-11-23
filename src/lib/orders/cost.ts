export interface OrderCostSnapshot {
  quantity: number;
  costPrice: number;
  costTotal: number;
}

/** Kombinuje snimljene troškove pri spajanju više narudžbi u jedan paket. */
export function mergeCostSnapshots(
  orders: readonly OrderCostSnapshot[]
): OrderCostSnapshot {
  const quantity = orders.reduce((sum, order) => sum + order.quantity, 0);
  const costTotal =
    Math.round(orders.reduce((sum, order) => sum + order.costTotal, 0) * 100) / 100;

  return {
    quantity,
    costTotal,
    costPrice: quantity > 0 ? Math.round((costTotal / quantity) * 100) / 100 : 0,
  };
}