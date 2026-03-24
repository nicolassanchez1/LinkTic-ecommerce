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
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Catálogo de Productos
          </h1>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => setIsCartOpen(true)}
              className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 font-medium text-gray-700 hover:bg-gray-50 hover:shadow transition-all cursor-pointer flex items-center gap-2"
            >
              <span>🛒 Carrito:</span>
              <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md">
                {isMounted ? totalItems : 0}
              </span>
            </button>

            {status === "unauthenticated" && (
              <div className="flex gap-2">
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Registrarse
                </Link>
                <button
                  onClick={() => signIn()}
                  className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Iniciar Sesión
                </button>
              </div>
            )}

            {status === "authenticated" && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">
                  Hola,{" "}
                  <span className="font-bold text-gray-900">
                    {session?.user?.name}
                  </span>
                </span>
                <button
                  onClick={() => setModalState({ isOpen: true, product: null })}
                  className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100"
                >
                  + Crear Producto
                </button>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Salir
                </button>
              </div>
            )}
          </div>
        </div>

        {isLoading && <p className="text-gray-500">Cargando productos...</p>}
        {isError && <p className="text-red-500">Error: {error.message}</p>}

        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product: Product) => (
              <div
                key={product.id}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="w-full h-48 bg-gray-50 rounded-lg mb-4 overflow-hidden flex items-center justify-center border border-gray-100">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-5xl opacity-50">🛍️</span>
                    )}
                  </div>

                  <h2 className="text-xl font-semibold text-gray-800 line-clamp-1">
                    {product.name}
                  </h2>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    ${product.price}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Stock: {product.stock}
                  </p>
                </div>
                <button
                  onClick={() => addToCart(product)}
                  className="w-full mt-6 bg-gray-900 text-white py-2.5 rounded-lg hover:bg-gray-800 transition-colors font-medium active:scale-95 transform"
                >
                  Agregar al Carrito
                </button>
                {status === "authenticated" &&
                  product.userId === (session?.user as any)?.id && (
                    <button
                      onClick={() =>
                        setModalState({ isOpen: true, product: product })
                      }
                    >
                      Editar
                    </button>
                  )}
              </div>
            ))}
          </div>
        ) : (
          !isLoading &&
          !isError && (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
              <p className="text-gray-500 text-lg">
                No hay productos disponibles.
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
