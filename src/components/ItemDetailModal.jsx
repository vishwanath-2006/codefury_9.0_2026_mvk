import React, { useState } from 'react';

export default function ItemDetailModal({ item, isOpen, onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !item) return null;

  const handleAdd = () => {
    onAddToCart(item, quantity);
    setQuantity(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#23170f] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative border border-slate-200 dark:border-slate-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-md"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        {/* Item Image / Header Header Visual */}
        <div className="w-full h-48 bg-slate-100 dark:bg-slate-800 relative flex items-center justify-center overflow-hidden">
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-[#ff6a00]/10 flex items-center justify-center text-[#ff6a00]">
              <span className="material-symbols-outlined text-5xl">restaurant</span>
            </div>
          )}
        </div>

        {/* Item Details */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-xl font-bold">{item.name}</h3>
              {item.tagline && <p className="text-xs text-[#ff6a00] font-semibold">{item.tagline}</p>}
            </div>
            <span className="text-xl font-mono font-bold text-[#ff6a00]">₹{item.price.toFixed(2)}</span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 mb-6 leading-relaxed">
            {item.description || 'Artisanal street food algorithmically crafted for maximum flavor & low latency.'}
          </p>

          {/* Quantity Controls */}
          <div className="flex items-center justify-between border-t border-b border-slate-100 dark:border-slate-800 py-4 mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Quantity</span>
            <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl font-bold">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                -
              </button>
              <span className="w-6 text-center text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAdd}
            className="w-full bg-[#ff6a00] hover:bg-[#ff6a00]/90 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#ff6a00]/30 transition flex items-center justify-between px-6"
          >
            <span>ADD TO ORDER</span>
            <span className="font-mono">₹{(item.price * quantity).toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
