"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { useCartStore } from "@/src/store/cartStore";
import { apiClient } from "@/src/lib/apiClient";

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
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Resumen de tu Orden
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 font-medium">
            {error}
          </div>
        )}

        {cart.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">
              No tienes productos para procesar.
            </p>
            <button
              onClick={() => router.push("/")}
              className="text-blue-600 font-medium hover:underline"
            >
              Volver al catálogo
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center pb-4 border-b border-gray-100"
                >
                  <div>
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-500">
                      Cantidad: {item.quantity}
                    </p>
                  </div>
                  <span className="font-bold text-gray-900">
                    ${(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-8">
                <span className="text-xl font-medium text-gray-700">
                  Total a pagar:
                </span>
                <span className="text-4xl font-bold text-blue-600">
                  ${totalAmount.toLocaleString()}
                </span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing || status !== "authenticated"}
                className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-colors font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing
                  ? "Procesando orden..."
                  : status === "authenticated"
                  ? "Confirmar y Pagar"
                  : "Inicia sesión para pagar"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
