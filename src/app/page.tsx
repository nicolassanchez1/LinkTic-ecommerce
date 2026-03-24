"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useCartStore } from "@/src/store/cartStore";
import { apiClient } from "@/src/lib/apiClient";
import CartSidebar from "@/src/components/CartSidebar";
import ProductModal from "@/src/components/ProductModal";
import type { Product } from "@/src/store/cartStore";

const fetchProducts = async () => apiClient<Product[]>("/products");

// Función helper para formatear precios a moneda local
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price);
};

export default function Home() {
  const {
    data: products,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const addToCart = useCartStore((state) => state.addToCart);
  const totalItems = useCartStore((state) => state.getTotalItems());

  const { data: session, status } = useSession();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    product: Product | null;
  }>({
    isOpen: false,
    product: null,
  });

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <main className="min-h-screen pb-12 bg-gray-50/50">
      {/* Navbar Minimalista */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              LinkTic <span className="text-blue-600 font-light">Store</span>
            </h1>

            <div className="flex gap-3 md:gap-5 items-center">
              <button
                onClick={() => setIsCartOpen(true)}
                className="group relative px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:border-blue-600 hover:shadow-md transition-all flex items-center gap-2"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">
                  🛒
                </span>
                <span className="font-semibold text-gray-700">Carrito</span>
                {isMounted && totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                    {totalItems}
                  </span>
                )}
              </button>

              <div className="h-8 w-px bg-gray-200 hidden md:block"></div>

              {status === "unauthenticated" && (
                <div className="flex gap-3">
                  <Link
                    href="/register"
                    className="hidden md:flex px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors items-center"
                  >
                    Registrarse
                  </Link>
                  <button
                    onClick={() => signIn()}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-all shadow-sm hover:shadow"
                  >
                    Iniciar Sesión
                  </button>
                </div>
              )}

              {status === "authenticated" && (
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex flex-col items-end mr-2">
                    <span className="text-xs text-gray-500">Bienvenido</span>
                    <span className="text-sm font-bold text-gray-900">
                      {session?.user?.name}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      setModalState({ isOpen: true, product: null })
                    }
                    className="px-4 py-2.5 text-sm font-semibold text-blue-700 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors border border-blue-100"
                  >
                    + Nuevo Producto
                  </button>
                  <button
                    onClick={() => signOut()}
                    className="px-4 py-2.5 text-sm font-semibold text-red-600 bg-white border border-gray-200 rounded-xl hover:border-red-200 hover:bg-red-50 transition-colors"
                  >
                    Salir
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Estados de Carga y Error */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {isError && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-center font-medium">
            Error al cargar el catálogo: {error.message}
          </div>
        )}

        {/* Grid de Productos */}
        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product: Product) => (
              <div
                key={product.id}
                className="group flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-1"
              >
                {/* Contenedor de Imagen Premium */}
                <div className="relative w-full h-56 bg-gray-50 border-b border-gray-100 overflow-hidden flex items-center justify-center p-4">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <span className="text-6xl opacity-20 group-hover:scale-110 transition-transform duration-500">
                      🛍️
                    </span>
                  )}
                  {/* Etiqueta de Stock flotante */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-2.5 py-1 text-xs font-bold rounded-full backdrop-blur-md shadow-sm border ${
                        product.stock > 5
                          ? "bg-green-100/80 text-green-700 border-green-200"
                          : "bg-orange-100/80 text-orange-700 border-orange-200"
                      }`}
                    >
                      Stock: {product.stock}
                    </span>
                  </div>
                </div>

                {/* Contenido de la Tarjeta */}
                <div className="p-5 flex flex-col flex-grow">
                  <h2
                    className="text-lg font-bold text-gray-900 line-clamp-2 mb-1"
                    title={product.name}
                  >
                    {product.name}
                  </h2>
                  <p className="text-2xl font-black text-blue-600 tracking-tight mt-auto pt-4">
                    {formatPrice(product.price)}
                  </p>

                  <div className="mt-5 space-y-2">
                    <button
                      onClick={() => addToCart(product)}
                      className="w-full bg-gray-900 text-white font-semibold py-3 rounded-xl hover:bg-blue-600 transition-colors active:scale-95 transform shadow-md hover:shadow-lg"
                    >
                      Agregar al Carrito
                    </button>

                    {/* Botón Editar arreglado */}
                    {status === "authenticated" &&
                      product.userId === (session?.user as any)?.id && (
                        <button
                          onClick={() =>
                            setModalState({ isOpen: true, product: product })
                          }
                          className="w-full bg-gray-50 text-gray-600 font-medium py-2.5 rounded-xl hover:bg-gray-100 hover:text-gray-900 transition-colors border border-gray-200"
                        >
                          ✎ Editar Producto
                        </button>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !isLoading &&
          !isError && (
            <div className="text-center py-32 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <span className="text-6xl mb-4 block">📦</span>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Catálogo vacío
              </h3>
              <p className="text-gray-500">
                Aún no hay productos disponibles en la tienda.
              </p>
            </div>
          )
        )}

        <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

        <ProductModal
          isOpen={modalState.isOpen}
          product={modalState.product}
          onClose={() => setModalState({ isOpen: false, product: null })}
          onSuccess={() => refetch()}
        />
      </div>
    </main>
  );
}
