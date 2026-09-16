import { notFound } from "next/navigation";
import { getOrder, listEvents } from "@/lib/orders/repo";
import OrderDetail from "@/components/admin/OrderDetail";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  return <OrderDetail order={order} events={await listEvents(id)} />;
}
