import React, { useState, useEffect } from 'react';
import { getUserOrders } from '../services/orderService';

export default function OrderHistoryView({ onSelectOrder }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        const data = await getUserOrders();
        setOrders(data);
      } catch (err) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Order History</h2>
          <p className="text-xs text-slate-500">Track and view your past CodeFury street kiosk orders</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-sm mb-6">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-400 font-mono">Loading order history...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#23170f] rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">receipt_long</span>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Orders Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            You have not placed any orders in this session yet. Explore the menu to place your first order!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord.id}
              onClick={() => onSelectOrder(ord)}
              className="bg-white dark:bg-[#23170f] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-[#ff6a00]/50 transition cursor-pointer shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-lg text-[#ff6a00]">{ord.order_code}</span>
                  <span className="text-xs text-slate-400">
                    {new Date(ord.created_at).toLocaleDateString()} {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                    ord.payment_status === 'paid' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {ord.payment_status}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                    ord.status === 'completed' ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300' :
                    ord.status === 'ready' ? 'bg-green-500 text-white' :
                    ord.status === 'preparing' ? 'bg-blue-500 text-white' : 'bg-[#ff6a00]/10 text-[#ff6a00]'
                  }`}>
                    {ord.status}
                  </span>
                </div>
              </div>

              <div className="space-y-1 mb-3">
                {ord.order_items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>{item.item_name} × {item.quantity}</span>
                    <span className="font-mono">₹{item.subtotal?.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800 text-sm">
                <span className="text-xs text-slate-400">Customer: <strong className="text-slate-700 dark:text-slate-300">{ord.customer_name}</strong></span>
                <span className="font-mono font-bold text-[#ff6a00]">Total: ₹{ord.total_amount?.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
