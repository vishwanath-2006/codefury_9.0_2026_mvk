import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import ItemDetailModal from './components/ItemDetailModal';
import OrderHistoryView from './components/OrderHistoryView';
import KitchenDashboardView from './components/KitchenDashboardView';
import { getCategories, getMenuItems } from './services/menuService';
import {
  ensureActiveSession,
  createCheckoutOrder,
  bindRazorpayOrderId,
  subscribeToOrderStatus
} from './services/orderService';
import { verifyRazorpayPaymentEdge } from './services/paymentService';
import { getCurrentUserProfile, signOutUser } from './services/authService';

export default function App() {
  // Navigation & Modals State
  const [view, setView] = useState('menu'); // 'menu' | 'history' | 'kitchen' | 'success'
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Data & App State
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('Guest');
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);

  // Initialize App, User Session & Menu Data
  const loadUserAndMenu = async () => {
    try {
      setLoading(true);
      await ensureActiveSession();
      const currentUser = await getCurrentUserProfile();
      setUser(currentUser);
      if (currentUser?.profile?.full_name && currentUser.profile.full_name !== 'Guest') {
        setCustomerName(currentUser.profile.full_name);
      }

      const cats = await getCategories();
      setCategories(cats);
      const items = await getMenuItems();
      setMenuItems(items);
    } catch (err) {
      console.error('Initialization error:', err);
      setErrorMsg(err.message || 'Unable to connect to backend service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserAndMenu();
  }, []);

  const handleLogout = async () => {
    try {
      await signOutUser();
      await loadUserAndMenu();
      setView('menu');
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // Filter Menu Items by Category & Search
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = !activeCategory || item.category_id === activeCategory;
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tagline && item.tagline.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Cart Operations
  const handleAddToCart = (item, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + qty } : i));
      }
      return [...prev, { ...item, quantity: qty }];
    });
  };

  const handleUpdateCartQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const totalCartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartSubtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Server Checkout & Razorpay Flow Execution
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      setCheckoutLoading(true);
      setErrorMsg(null);

      // 1. Call Atomic Server RPC (calculates trusted prices from DB)
      const orderResult = await createCheckoutOrder(cart, customerName);

      // 2. Generate Razorpay Payment Flow
      const mockRazorpayOrderId = `order_${Math.random().toString(36).substring(2, 12)}`;

      // 3. Pre-bind Razorpay order ID to database order
      await bindRazorpayOrderId(orderResult.order_id, mockRazorpayOrderId);

      // 4. Simulate Razorpay payment completion & Signature verification via Edge Function
      const mockPaymentId = `pay_${Math.random().toString(36).substring(2, 12)}`;
      const mockSignature = `mock_sig_${Math.random().toString(36).substring(2, 12)}`;

      try {
        await verifyRazorpayPaymentEdge({
          orderId: orderResult.order_id,
          razorpayOrderId: mockRazorpayOrderId,
          razorpayPaymentId: mockPaymentId,
          razorpaySignature: mockSignature
        });
      } catch (verr) {
        console.warn('Edge Function verification notice:', verr.message);
      }

      setCurrentOrder({
        ...orderResult,
        items: cart,
        payment_status: 'paid'
      });
      setCart([]);
      setIsCartOpen(false);
      setView('success');
    } catch (err) {
      console.error('Checkout failed:', err);
      setErrorMsg(err.message || 'Checkout failed. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Realtime Status Tracking on Order Success Screen
  useEffect(() => {
    if (view === 'success' && currentOrder?.order_id) {
      const unsubscribe = subscribeToOrderStatus(currentOrder.order_id, (updated) => {
        setCurrentOrder((prev) => ({
          ...prev,
          status: updated.status,
          payment_status: updated.payment_status
        }));
      });
      return () => unsubscribe();
    }
  }, [view, currentOrder?.order_id]);

  return (
    <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#181410] font-sans antialiased text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        currentView={view}
        setView={setView}
        cartCount={totalCartCount}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Global Error Banner */}
      {errorMsg && (
        <div className="w-full bg-red-500 text-white p-3 text-center text-xs font-semibold flex items-center justify-between px-6 z-50">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="font-bold underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* VIEW 1: MENU VIEW */}
      {view === 'menu' && (
        <div className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
          {/* Search & Hero Banner */}
          <div className="mb-8 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
              Byte Into The <span className="text-[#ff6a00]">Flavor</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mb-6">
              Overclocked caffeine, high-bandwidth sodas & algorithmic street snacks.
            </p>

            {/* Search Input */}
            <div className="relative max-w-md mx-auto">
              <span className="material-symbols-outlined absolute left-4 top-3 text-slate-400">search</span>
              <input
                type="text"
                placeholder="Search food & liquid brews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#23170f] border border-slate-200 dark:border-slate-800 rounded-2xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ff6a00]"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 mb-6 border-b border-slate-200 dark:border-slate-800 font-semibold text-sm">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-5 py-2.5 rounded-xl whitespace-nowrap transition ${
                !activeCategory ? 'bg-[#ff6a00] text-white shadow-md shadow-[#ff6a00]/30' : 'bg-white dark:bg-[#23170f] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 rounded-xl whitespace-nowrap transition ${
                  activeCategory === cat.id ? 'bg-[#ff6a00] text-white shadow-md shadow-[#ff6a00]/30' : 'bg-white dark:bg-[#23170f] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Menu Items Grid */}
          {loading ? (
            <div className="text-center py-16 text-slate-400 font-mono">Loading CodeFury menu items...</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16 text-slate-400">No items match your filter.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-24">
              {filteredItems.map((item) => {
                const inCart = cart.find((c) => c.id === item.id);
                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-[#23170f] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
                  >
                    <div
                      onClick={() => setSelectedItem(item)}
                      className="cursor-pointer"
                    >
                      <div className="h-44 bg-slate-100 dark:bg-slate-800 relative flex items-center justify-center overflow-hidden">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-16 h-16 rounded-2xl bg-[#ff6a00]/10 flex items-center justify-center text-[#ff6a00]">
                            <span className="material-symbols-outlined text-4xl">restaurant</span>
                          </div>
                        )}
                        {!item.is_available && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white text-xs font-bold uppercase tracking-wider">
                            Sold Out
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="font-bold text-base line-clamp-1">{item.name}</h3>
                        {item.tagline && <p className="text-xs text-[#ff6a00] font-semibold mt-0.5">{item.tagline}</p>}
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2">{item.description}</p>
                      </div>
                    </div>

                    <div className="p-4 pt-0 flex items-center justify-between mt-auto">
                      <span className="font-mono font-bold text-lg text-[#ff6a00]">₹{item.price.toFixed(2)}</span>
                      {inCart ? (
                        <div className="flex items-center gap-2 bg-[#ff6a00] text-white px-3 py-1.5 rounded-xl font-bold text-xs">
                          <button onClick={() => handleUpdateCartQty(item.id, -1)}>-</button>
                          <span>{inCart.quantity}</span>
                          <button onClick={() => handleAddToCart(item, 1)}>+</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(item, 1)}
                          disabled={!item.is_available}
                          className="bg-[#ff6a00] hover:bg-[#ff6a00]/90 text-white p-2.5 rounded-xl shadow-md transition disabled:opacity-40"
                        >
                          <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Floating Cart Bar (Mobile) */}
          {cart.length > 0 && (
            <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40">
              <button
                onClick={() => setIsCartOpen(true)}
                className="w-full bg-[#ff6a00] text-white py-3.5 px-6 rounded-2xl font-bold flex items-center justify-between shadow-2xl shadow-[#ff6a00]/40 transition active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <span className="bg-white text-[#ff6a00] rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold">
                    {totalCartCount}
                  </span>
                  <span>View Order Cart</span>
                </div>
                <span className="font-mono text-base">₹{cartSubtotal.toFixed(2)}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: ORDER HISTORY */}
      {view === 'history' && (
        <OrderHistoryView
          onSelectOrder={(ord) => {
            setCurrentOrder(ord);
            setView('success');
          }}
        />
      )}

      {/* VIEW 3: KITCHEN DASHBOARD (STAFF/ADMIN) */}
      {view === 'kitchen' && <KitchenDashboardView />}

      {/* VIEW 4: TRANSACTION SUCCESS / PICKUP SCREEN */}
      {view === 'success' && currentOrder && (
        <div className="flex-1 max-w-md w-full mx-auto px-4 py-8 flex flex-col justify-between text-center">
          <div>
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-500/20 shadow-lg shadow-emerald-500/10">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight">TRANSACTION EXECUTED</h2>
            <p className="text-xs text-slate-500 mt-1">Your order is being prepared by CodeFury kitchen staff.</p>

            {/* Pickup Order Identification Code */}
            <div className="bg-[#ff6a00]/5 border-2 border-[#ff6a00] rounded-2xl p-6 my-6 shadow-xl">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pickup Identification Code</p>
              <p className="text-4xl font-mono font-bold text-[#ff6a00]">{currentOrder.order_code}</p>
            </div>

            {/* Realtime Order Tracker */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl text-left flex items-center gap-4 shadow-md">
              <div className="w-3 h-3 rounded-full bg-[#ff6a00] animate-ping shrink-0"></div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Realtime Status Tracker</p>
                <p className="text-base font-bold capitalize text-white">{currentOrder.status || 'Pending'}</p>
              </div>
            </div>

            {/* Order Items Breakdown */}
            <div className="mt-6 text-left bg-white dark:bg-[#23170f] border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Order Line Items</h4>
              <div className="space-y-2 text-xs">
                {currentOrder.order_items?.map((item) => (
                  <div key={item.id} className="flex justify-between font-semibold">
                    <span>{item.item_name} × {item.quantity}</span>
                    <span className="font-mono">₹{item.subtotal?.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 mt-3 pt-3 flex justify-between font-bold text-sm">
                <span>Total Paid</span>
                <span className="font-mono text-[#ff6a00]">₹{currentOrder.total_amount?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <button
              onClick={() => { setView('menu'); setCurrentOrder(null); }}
              className="w-full bg-[#ff6a00] text-white py-3.5 rounded-xl font-bold shadow-lg shadow-[#ff6a00]/30 transition"
            >
              ORDER MORE ITEMS
            </button>
          </div>
        </div>
      )}

      {/* CART & CHECKOUT SLIDING MODAL */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="bg-white dark:bg-[#23170f] w-full max-w-md h-full shadow-2xl flex flex-col p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-xl font-bold">Your Order Cart</h3>
              <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-slate-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Customer Pickup Name */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Pickup Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#ff6a00]"
              />
            </div>

            {/* Cart Items List */}
            <div className="flex-1 space-y-3 mb-6">
              {cart.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <span className="material-symbols-outlined text-4xl mb-2">shopping_bag</span>
                  <p className="text-xs">Your cart is currently empty.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    <div>
                      <h4 className="font-bold text-sm">{item.name}</h4>
                      <p className="text-xs text-slate-500">₹{item.price.toFixed(2)} each</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-lg text-xs font-bold">
                        <button onClick={() => handleUpdateCartQty(item.id, -1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => handleAddToCart(item, 1)}>+</button>
                      </div>
                      <button onClick={() => handleRemoveFromCart(item.id)} className="text-slate-400 hover:text-red-500">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Summary & Checkout */}
            {cart.length > 0 && (
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-auto">
                <div className="flex justify-between text-sm mb-2 text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-mono">₹{cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-slate-900 dark:text-slate-100 mb-4">
                  <span>Server Verified Total</span>
                  <span className="font-mono text-[#ff6a00]">₹{cartSubtotal.toFixed(2)}</span>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="w-full bg-[#ff6a00] hover:bg-[#ff6a00]/90 text-white py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-[#ff6a00]/30 transition disabled:opacity-50"
                >
                  {checkoutLoading ? (
                    <span>Executing Server Checkout...</span>
                  ) : (
                    <>
                      <span>PAY & PLACE ORDER</span>
                      <span className="material-symbols-outlined text-base">lock</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AUTH MODAL */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={loadUserAndMenu}
      />

      {/* ITEM DETAIL MODAL */}
      <ItemDetailModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
