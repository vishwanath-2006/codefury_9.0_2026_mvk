import React, { useState, useEffect } from 'react';
import { getKitchenQueueOrders, updateOrderStatus } from '../services/orderService';
import { getMenuItems } from '../services/menuService';
import { supabase } from '../lib/supabaseClient';

export default function KitchenDashboardView() {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'menu'
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const queue = await getKitchenQueueOrders();
      setOrders(queue);
      const items = await getMenuItems();
      setMenuItems(items);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await updateOrderStatus(orderId, newStatus);
      await loadData();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      setUpdatingId(item.id);
      const { error } = await supabase
        .from('menu_items')
        .update({ is_available: !item.is_available })
        .eq('id', item.id);

      if (error) throw error;
      await loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update item availability.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-500">soup_kitchen</span>
            Kitchen Queue & Admin Control
          </h2>
          <p className="text-xs text-slate-500">Manage incoming order fulfillment & menu item availability</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'orders' ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
          >
            ACTIVE QUEUE ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'menu' ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
          >
            MENU AVAILABILITY ({menuItems.length})
          </button>
          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-slate-900 dark:hover:text-white"
            title="Refresh Data"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-sm mb-6">
          {errorMsg}
        </div>
      )}

      {/* ORDERS QUEUE TAB */}
      {activeTab === 'orders' && (
        <div>
          {loading ? (
            <div className="text-center py-12 text-slate-400 font-mono">Loading active kitchen queue...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-[#23170f] rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
              <span className="material-symbols-outlined text-5xl text-emerald-500/30 mb-3">check_circle</span>
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Kitchen Queue Clear</h3>
              <p className="text-xs text-slate-400 mt-1">All orders are completed. Waiting for new incoming kiosk orders!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white dark:bg-[#23170f] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                      <span className="font-mono font-bold text-xl text-[#ff6a00]">{ord.order_code}</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                        ord.status === 'ready' ? 'bg-green-500 text-white' :
                        ord.status === 'preparing' ? 'bg-blue-500 text-white' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {ord.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mb-3">
                      Customer: <strong className="text-slate-800 dark:text-slate-200">{ord.customer_name}</strong> | Time: {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>

                    <div className="space-y-1 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl mb-4">
                      {ord.order_items?.map((item) => (
                        <div key={item.id} className="flex justify-between text-xs font-semibold">
                          <span>{item.item_name}</span>
                          <span className="font-mono bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">× {item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                    {ord.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(ord.id, 'preparing')}
                        disabled={updatingId === ord.id}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-xs transition"
                      >
                        START PREPARING
                      </button>
                    )}
                    {ord.status === 'preparing' && (
                      <button
                        onClick={() => handleStatusChange(ord.id, 'ready')}
                        disabled={updatingId === ord.id}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs transition"
                      >
                        MARK READY FOR PICKUP
                      </button>
                    )}
                    {ord.status === 'ready' && (
                      <button
                        onClick={() => handleStatusChange(ord.id, 'completed')}
                        disabled={updatingId === ord.id}
                        className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 rounded-xl text-xs transition"
                      >
                        MARK COMPLETED
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MENU AVAILABILITY TAB */}
      {activeTab === 'menu' && (
        <div className="bg-white dark:bg-[#23170f] border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">Toggle Item Availability</h3>
          <div className="space-y-3">
            {menuItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <div>
                  <h4 className="font-bold text-sm">{item.name}</h4>
                  <p className="text-xs text-slate-500">₹{item.price.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => handleToggleAvailability(item)}
                  disabled={updatingId === item.id}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    item.is_available ? 'bg-green-500/10 text-green-500 border border-green-500/30' : 'bg-red-500/10 text-red-500 border border-red-500/30'
                  }`}
                >
                  {item.is_available ? 'AVAILABLE' : 'UNAVAILABLE'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
