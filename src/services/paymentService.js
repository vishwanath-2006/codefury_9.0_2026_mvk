import { supabase } from '../lib/supabaseClient';

/**
 * Invokes the Supabase Edge Function to verify Razorpay signature securely.
 * The frontend NEVER sees or passes RAZORPAY_KEY_SECRET.
 */
export async function verifyRazorpayPaymentEdge({
  orderId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature
}) {
  if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new Error('Missing payment verification details.');
  }

  const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
    body: {
      order_id: orderId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature
    }
  });

  if (error) {
    console.error('Edge Function Payment Verification error:', error);
    throw new Error(error.message || 'Payment verification failed on server.');
  }

  if (!data || !data.success) {
    throw new Error(data?.error || 'Payment signature verification failed.');
  }

  return data;
}
