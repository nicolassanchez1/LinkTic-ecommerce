import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/src/store/cartStore";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

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
          className="fixed inset-0 bg-black/40 z-40 transition-opacity backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full md:w-105 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-900">Carrito 🛒</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-800 text-3xl leading-none transition-colors"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <span className="text-6xl mb-4">🛍️</span>
              <p className="text-lg">Tu carrito está vacío</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center border-b border-gray-100 pb-4"
              >
                <div>
                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    Cant:{" "}
                    <span className="font-medium text-gray-700">
                      {item.quantity}
                    </span>{" "}
                    x ${item.price}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-bold text-gray-900">
                    ${item.price * item.quantity}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 text-xs font-medium bg-red-50 px-2 py-1 rounded transition-colors"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-medium text-gray-500">
                Total a pagar:
              </span>
              <span className="text-3xl font-bold text-blue-600">
                ${totalAmount.toLocaleString()}
              </span>
            </div>

            <button
              onClick={() => {
                onClose();
                router.push("/checkout");
              }}
              className="w-full bg-gray-900 text-white py-3.5 rounded-xl hover:bg-gray-800 transition-colors font-bold text-lg active:scale-95 transform"
            >
              Proceder al Pago
            </button>

            <button
              onClick={clearCart}
              className="w-full mt-4 text-gray-500 hover:text-gray-900 py-2 text-sm font-medium transition-colors"
            >
              Vaciar carrito completo
            </button>
          </div>
        )}
      </div>
    </>
  );
}
