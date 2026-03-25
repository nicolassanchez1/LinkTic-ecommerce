import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/src/store/cartStore";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price);
};

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const router = useRouter();
  const cart = useCartStore((state) => state.cart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);

  const totalAmount = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-112.5 bg-slate-50 shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="px-6 py-5 bg-white border-b border-slate-100 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center gap-3">
            <span className="text-2xl bg-slate-100 p-2 rounded-xl">🛒</span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Tu Carrito
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 h-10 w-10 flex items-center justify-center rounded-full text-2xl leading-none transition-all"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
              <span className="text-7xl opacity-50 mb-2">🛍️</span>
              <p className="text-xl font-bold text-slate-600">
                Tu carrito está vacío
              </p>
              <p className="text-sm text-center max-w-62.5">
                Aún no has agregado productos de nuestro catálogo empresarial.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2.5 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                Explorar Catálogo
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex justify-between items-center group"
                >
                  <div className="flex-1 pr-4">
                    <h3 className="font-extrabold text-slate-900 line-clamp-2 leading-snug">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-1 rounded-md">
                        Cant: {item.quantity}
                      </span>
                      <span className="text-slate-400 text-sm font-medium">
                        x
                      </span>
                      <span className="text-blue-600 font-bold text-sm">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 min-w-[100px]">
                    <span className="font-black text-slate-900 text-lg tracking-tight">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-bold bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors opacity-80 group-hover:opacity-100"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] z-10">
            <div className="flex justify-between items-end mb-6">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                Total a pagar
              </span>
              <span className="text-3xl font-black text-blue-600 tracking-tighter">
                {formatPrice(totalAmount)}
              </span>
            </div>

            <button
              onClick={() => {
                onClose();
                router.push("/checkout");
              }}
              className="w-full cursor-pointer flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-2xl hover:bg-blue-700 transition-colors font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform active:scale-95"
            >
              <span>💳</span> Proceder al Pago
            </button>

            <button
              onClick={clearCart}
              className="w-full mt-4 text-slate-400 hover:text-red-600 py-2.5 text-sm font-bold transition-colors rounded-xl hover:bg-red-50"
            >
              Vaciar carrito completo
            </button>
          </div>
        )}
      </div>
    </>
  );
}
