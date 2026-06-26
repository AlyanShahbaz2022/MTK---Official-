import { getAdminOrders } from '@/server/admin/data';
import { OrdersClient, type AdminOrderRow } from '@/components/admin/orders-client';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const orders = await getAdminOrders();

  const rows: AdminOrderRow[] = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customer: o.fullName || o.user?.name || 'Guest',
    email: o.email,
    phone: o.phone,
    date: new Date(o.createdAt).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    itemCount: o.items.reduce((n, i) => n + i.quantity, 0),
    total: o.total,
    subtotal: o.subtotal,
    shipping: o.shipping,
    discount: o.discount,
    status: o.status,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    address: [
      o.line1,
      o.line2,
      o.city,
      o.state,
      o.postalCode,
      o.country,
    ]
      .filter(Boolean)
      .join(', '),
    items: o.items.map((i) => ({
      id: i.id,
      productName: i.productName,
      variantLabel: i.variantLabel,
      quantity: i.quantity,
      lineTotal: i.lineTotal,
      image: i.image,
    })),
  }));

  return <OrdersClient orders={rows} />;
}
