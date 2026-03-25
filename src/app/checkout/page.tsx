"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { useCartStore } from "@/src/store/cartStore";
import { apiClient } from "@/src/lib/apiClient";
import Link from "next/link";
import { formatPrice } from "@/src/utils/price";

export default function CheckoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, status } = useSession();
  const cart = useCartStore((state) => state.cart);
  const clearCart = useCartStore((state) => state.clearCart);

  const [isMounted, setIsMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return null;

  const totalAmount = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handlePlaceOrder = async () => {
    if (status !== "authenticated") {
      setError("Debes iniciar sesión para completar la compra.");
      return;
    }

    if (cart.length === 0) {
      setError("Tu carrito está vacío.");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const orderPayload = {
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      };

      await apiClient("/orders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${(session as any).accessToken}`,
        },
        body: JSON.stringify(orderPayload),
      });

      await queryClient.invalidateQueries({ queryKey: ["products"] });

      alert("¡Orden creada con éxito! Gracias por tu compra.");
      clearCart();
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Hubo un problema al procesar tu orden.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans pb-16">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm mb-10">
        <div className="max-w-3xl mx-auto px-6 h-20 flex justify-between items-center">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            LinkTic <span className="text-blue-600 font-light">Checkout</span>
          </h1>
          <Link
            href="/"
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm flex items-center gap-2"
          >
            <span>←</span> Volver a la Tienda
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-blue-600"></div>

          <div className="flex items-center gap-4 mb-10">
            <span className="text-4xl bg-blue-50 p-3 rounded-2xl">🧾</span>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Resumen de tu Orden
              </h2>
              <p className="text-slate-500 font-medium mt-1">
                Verifica tus productos antes de finalizar la compra.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-8 p-5 bg-red-50 text-red-700 rounded-2xl border-2 border-red-100 font-bold flex items-center gap-3">
              <span className="text-2xl">⚠️</span> {error}
            </div>
          )}

          {cart.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <span className="text-6xl mb-4 block opacity-50">🛒</span>
              <p className="text-xl font-bold text-slate-700 mb-2">
                No tienes productos para procesar
              </p>
              <p className="text-slate-500 mb-6">
                Agrega productos desde el catálogo para continuar.
              </p>
              <Link
                href="/"
                className="inline-block bg-white border-2 border-slate-200 text-slate-700 font-bold px-6 py-3 rounded-xl hover:border-blue-300 hover:text-blue-600 transition-colors shadow-sm"
              >
                Ir al Catálogo Empresarial
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-2 mb-10">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center py-5 border-b border-slate-100 group"
                  >
                    <div className="flex items-center gap-4">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-14 w-14 object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center text-xl border border-slate-100 group-hover:scale-110 transition-transform">
                          📦
                        </div>
                      )}
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-lg line-clamp-1">
                          {item.name}
                        </h3>
                        <p className="text-sm font-medium text-slate-500 mt-0.5">
                          Cant:{" "}
                          <span className="text-slate-700 font-bold">
                            {item.quantity}
                          </span>{" "}
                          <span className="mx-1 text-slate-300">|</span>{" "}
                          {formatPrice(item.price)} c/u
                        </p>
                      </div>
                    </div>
                    <span className="font-black text-slate-900 text-xl tracking-tight">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-end mb-8">
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                    Total a pagar
                  </span>
                  <span className="text-4xl md:text-5xl font-black text-blue-600 tracking-tighter">
                    {formatPrice(totalAmount)}
                  </span>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || status !== "authenticated"}
                  className={`w-full py-4 sm:py-5 rounded-2xl font-black text-lg sm:text-xl transition-all flex items-center justify-center gap-3 shadow-lg ${
                    isProcessing || status !== "authenticated"
                      ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                      : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transform"
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <div className="h-6 w-6 border-4 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                      Procesando transacción...
                    </>
                  ) : status === "authenticated" ? (
                    <>
                      <span>💳</span> Confirmar y Pagar Orden
                    </>
                  ) : (
                    "Inicia sesión para pagar"
                  )}
                </button>

                {status !== "authenticated" && (
                  <p className="text-center text-sm font-medium text-red-500 mt-4">
                    * Requieres una cuenta activa para realizar la transacción.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
