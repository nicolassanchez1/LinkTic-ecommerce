"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/apiClient";
import Link from "next/link";

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: string;
  userId: string;
  customerName: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price);
};

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
};

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const token = (session as any)?.accessToken;

  const {
    data: orders,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["orders", token],
    queryFn: () =>
      apiClient<Order[]>("/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    enabled: !!token, // Solo ejecuta la petición si hay un token válido
  });

  if (!isMounted) return null;

  // Si no está autenticado, lo invitamos a iniciar sesión
  if (status === "unauthenticated") {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md border border-slate-100">
          <span className="text-6xl mb-4 block">🔒</span>
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            Acceso Denegado
          </h2>
          <p className="text-slate-500 mb-6">
            Debes iniciar sesión para ver tu historial de compras.
          </p>
          <Link
            href="/"
            className="inline-block w-full bg-blue-600 text-white font-bold py-3.5 rounded-2xl hover:bg-blue-700 transition-colors shadow-lg"
          >
            Volver a la Tienda
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 font-sans pb-16">
      {/* Navbar Minimalista */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm mb-10">
        <div className="max-w-screen-xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl bg-blue-50 p-2 rounded-xl">📦</span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Mis <span className="text-blue-600 font-light">Órdenes</span>
            </h1>
          </div>
          <Link
            href="/"
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm flex items-center gap-2"
          >
            <span>←</span> Volver a la Tienda
          </Link>
        </div>
      </nav>

      <div className="max-w-screen-xl mx-auto px-6">
        <div className="mb-10">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Historial de Compras
          </h2>
          <p className="text-slate-500 font-medium mt-1">
            Revisa el detalle de todas las transacciones que has realizado en
            LinkTic Commerce.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
            <span className="text-sm font-semibold text-slate-500">
              Cargando tus órdenes...
            </span>
          </div>
        ) : isError ? (
          <div className="bg-red-50 border-2 border-red-100 text-red-700 p-6 rounded-3xl text-center font-semibold flex items-center gap-4 justify-center shadow-inner">
            <span className="text-3xl">⚠️</span> Error al cargar las órdenes:{" "}
            {(error as any).message}
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-md hover:shadow-xl transition-all flex flex-col group"
              >
                <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="inline-block px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200 mb-2">
                      Completada ✅
                    </span>
                    <p className="text-xs font-mono text-slate-400">
                      ID: {order.id.split("-")[0].toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-700">
                      {formatDate(order.createdAt).split(",")[0]}
                    </p>
                    <p className="text-xs font-medium text-slate-500">
                      {formatDate(order.createdAt).split(",")[1]}
                    </p>
                  </div>
                </div>

                <div className="flex-grow mb-6">
                  <p className="text-sm font-medium text-slate-500 mb-2">
                    Artículos en esta orden:
                  </p>
                  <ul className="space-y-2">
                    {order.items?.map((item) => (
                      <li
                        key={item.id}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="text-slate-700 font-semibold truncate pr-2">
                          {/* Muestra un ID o texto genérico ya que el nombre del producto no viene en el OrderItem directamente */}
                          Producto {item.productId.split("-")[0]}
                        </span>
                        <span className="text-slate-500 whitespace-nowrap">
                          x{item.quantity}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-end">
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                    Total Pagado
                  </span>
                  <span className="text-2xl font-black text-blue-600 tracking-tighter">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-slate-100 shadow-sm">
            <span className="text-7xl mb-4 block opacity-60">🧾</span>
            <h3 className="text-2xl font-extrabold text-slate-900 mb-2">
              Aún no tienes órdenes
            </h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6">
              Parece que todavía no has realizado ninguna compra en nuestra
              plataforma.
            </p>
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-blue-700 transition-colors shadow-md"
            >
              Explorar Catálogo
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
