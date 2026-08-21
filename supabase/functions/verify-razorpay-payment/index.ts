import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { hmac } from "https://deno.land/x/hmac@v2.0.1/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!order_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(
        JSON.stringify({ error: "Missing required payment verification parameters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Secret MUST be read ONLY from Supabase Secrets / Environment Variables
    const secret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!secret) {
      return new Response(
        JSON.stringify({ error: "Server misconfiguration: RAZORPAY_KEY_SECRET not configured in Supabase Secrets." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Initialize Supabase Admin Client using Service Role Key
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 3. Verify order exists and check razorpay_order_id binding
    const { data: dbOrder, error: orderErr } = await supabaseAdmin
      .from("orders")
      .select("id, user_id, payment_status, razorpay_order_id, razorpay_payment_id")
      .eq("id", order_id)
      .single();

    if (orderErr || !dbOrder) {
      return new Response(
        JSON.stringify({ error: "Order not found in database." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Idempotency: If already paid with the same razorpay_payment_id, return success
    if (dbOrder.payment_status === "paid") {
      if (dbOrder.razorpay_payment_id === razorpay_payment_id) {
        return new Response(
          JSON.stringify({ success: true, payment_status: "paid", message: "Payment already verified." }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        return new Response(
          JSON.stringify({ error: "Order is already paid under a different payment transaction." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Enforce binding check: razorpay_order_id must match bound database record
    if (dbOrder.razorpay_order_id && dbOrder.razorpay_order_id !== razorpay_order_id) {
      return new Response(
        JSON.stringify({ error: "Razorpay order ID mismatch: does not match bound database order." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Compute HMAC SHA256 signature
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = hmac("sha256", secret, payload, "utf8", "hex").toString();

    // 5. Compare signatures securely
    if (expectedSignature === razorpay_signature) {
      const { error: updateErr } = await supabaseAdmin
        .from("orders")
        .update({
          payment_status: "paid",
          razorpay_order_id: razorpay_order_id,
          razorpay_payment_id: razorpay_payment_id,
        })
        .eq("id", order_id);

      if (updateErr) throw updateErr;

      return new Response(
        JSON.stringify({ success: true, payment_status: "paid" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      await supabaseAdmin
        .from("orders")
        .update({ payment_status: "failed" })
        .eq("id", order_id);

      return new Response(
        JSON.stringify({ success: false, error: "Invalid payment signature." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
