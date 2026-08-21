import { supabase } from '../lib/supabaseClient';

/**
 * Ensures an active Supabase session exists (initiating Anonymous Auth if not logged in).
 */
export async function ensureActiveSession() {
  const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
  if (sessionErr) {
    console.error('Error fetching session:', sessionErr);
  }

  if (session) {
    return session;
  }

  // Sign in anonymously for guest kiosk session
  const { data: anonData, error: anonErr } = await supabase.auth.signInAnonymously();
  if (anonErr) {
    console.error('Failed to initialize anonymous kiosk session:', anonErr);
    throw new Error('Unable to establish guest checkout session.');
  }

  return anonData.session;
}

/**
 * Executes atomic server-side checkout RPC (never passing prices from frontend).
 */
export async function createCheckoutOrder(cartItems, customerName = 'Guest') {
  await ensureActiveSession();

  if (!cartItems || cartItems.length === 0) {
    throw new Error('Cart items cannot be empty.');
  }

  const payload = cartItems.map(item => ({
    menu_item_id: item.id || item.menu_item_id,
    quantity: item.quantity || 1
  }));

  const { data, error } = await supabase.rpc('create_order_at_checkout', {
    p_items: payload,
    p_customer_name: customerName
  });

  if (error) {
    console.error('Checkout RPC error:', error);
    throw new Error(error.message || 'Server error during checkout.');
  }

  return data;
}

/**
 * Binds Razorpay order ID to the database order.
 */
export async function bindRazorpayOrderId(orderId, razorpayOrderId) {
  await ensureActiveSession();

  const { data, error } = await supabase.rpc('bind_razorpay_order_id', {
    p_order_id: orderId,
    p_razorpay_order_id: razorpayOrderId
  });

  if (error) {
    console.error('Razorpay order binding RPC error:', error);
    throw new Error(error.message || 'Failed to bind Razorpay order ID.');
  }

  return data;
}

/**
 * Fetches single order details and its line items.
 */
export async function getOrderDetails(orderId) {
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .single();

  if (orderErr) {
    console.error('Error fetching order details:', orderErr);
    throw new Error('Unable to retrieve order details.');
  }

  return order;
}

/**
 * Fetches all orders belonging to the current session / user (Order History).
 */
export async function getUserOrders() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user orders history:', error);
    throw new Error(error.message || 'Failed to load order history.');
  }

  return data || [];
}

/**
 * Subscribes to live status changes for a specific order via Supabase Realtime.
 */
export function subscribeToOrderStatus(orderId, onStatusUpdate) {
  const channel = supabase
    .channel(`order-status-${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`
      },
      (payload) => {
        if (payload.new) {
          onStatusUpdate(payload.new);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Kitchen Queue: Fetches all active kitchen orders (Staff/Admin).
 */
export async function getKitchenQueueOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .in('status', ['pending', 'preparing', 'ready'])
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching kitchen queue:', error);
    throw new Error('Unable to fetch kitchen queue.');
  }

  return data || [];
}

/**
 * Kitchen Queue: Updates order fulfillment status (Staff/Admin).
 */
export async function updateOrderStatus(orderId, newStatus) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Error updating order status:', error);
    throw new Error(error.message || 'Failed to update order status.');
  }

  return data;
}
