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
    <main
      suppressHydrationWarning
      className="min-h-screen pb-16 bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:24px_24px] bg-no-repeat bg-center"
    >
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm mb-12">
        <div className="max-w-screen-2xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-24">
            <h1 className="text-3xl md:text-4xl font-black text-slate-950 tracking-tighter">
              LinkTic{" "}
              <span className="text-blue-600 font-extralight">Commerce</span>
            </h1>

            <div className="flex items-center justify-end min-w-50 h-14">
              {!isMounted ? (
                <div className="flex gap-4 items-center animate-pulse">
                  <div className="h-10 w-24 bg-slate-100 rounded-xl"></div>
                  <div className="h-10 w-px bg-slate-100 mx-2"></div>
                  <div className="h-12 w-32 bg-slate-100 rounded-2xl"></div>
                </div>
              ) : (
                <div className="flex items-center gap-2 sm:gap-4">
                  {status === "unauthenticated" && (
                    <div className="flex gap-2 sm:gap-4">
                      <Link
                        href="/register"
                        className="hidden sm:flex px-5 py-3 text-sm font-semibold text-slate-600 hover:text-slate-950 transition-colors items-center rounded-xl hover:bg-slate-50"
                      >
                        Registrarse
                      </Link>
                      <button
                        onClick={() => signIn()}
                        className="px-6 py-3 text-sm font-bold text-white bg-slate-950 rounded-2xl hover:bg-slate-800 transition-all shadow-md hover:shadow-lg"
                      >
                        Iniciar Sesión
                      </button>
                    </div>
                  )}

                  {status === "authenticated" && (
                    <div className="flex items-center gap-2 sm:gap-4">
                      <button
                        onClick={() =>
                          setModalState({ isOpen: true, product: null })
                        }
                        className="px-5 py-3 text-sm font-bold text-blue-700 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-colors border border-blue-100 hidden md:block"
                      >
                        + Nuevo Producto
                      </button>
                      <button
                        onClick={() => signOut()}
                        className="px-4 sm:px-5 py-3 text-sm font-semibold text-red-600 bg-white border border-slate-200 rounded-2xl hover:border-red-200 hover:bg-red-50 transition-colors"
                      >
                        Salir
                      </button>

                      <div className="h-10 w-px bg-slate-100 mx-1 sm:mx-2 hidden sm:block"></div>

                      <div className="hidden sm:flex items-center gap-3">
                        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-slate-100 text-slate-500 font-bold text-lg border-2 border-slate-200">
                          {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-500">
                            Bienvenido,
                          </span>
                          <span className="text-base font-extrabold text-slate-950 -mt-0.5 truncate max-w-30">
                            {session?.user?.name || "Usuario"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="h-10 w-px bg-slate-100 mx-1 sm:mx-2"></div>

                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="group relative px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl border-2 border-slate-100 bg-white hover:border-blue-500 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2.5"
                  >
                    <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                      🛒
                    </span>
                    <span className="font-bold text-slate-800 hidden sm:block">
                      Carrito
                    </span>
                    {totalItems > 0 && (
                      <span className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white shadow-lg ring-2 ring-white">
                        {totalItems}
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-screen-2xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="mb-10 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">
            Explora nuestro Catálogo Empresarial
          </h2>
          <div className="text-sm text-slate-500 font-medium">
            Mostrando {products?.length || 0} productos disponibles
          </div>
        </div>

        {isLoading && (
          <div className="flex flex-col justify-center items-center py-28 gap-4">
            <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-blue-600"></div>
            <span className="text-sm font-semibold text-slate-500">
              Cargando productos...
            </span>
          </div>
        )}

        {isError && (
          <div className="bg-red-50 border-2 border-red-100 text-red-700 p-6 rounded-3xl text-center font-semibold flex items-center gap-4 justify-center shadow-inner">
            <span className="text-3xl">⚠️</span> Error al cargar el catálogo
            comercial: {error.message}
          </div>
        )}

        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {products.map((product: Product) => (
              <div
                key={product.id}
                className="group flex flex-col bg-white rounded-3xl shadow-lg hover:shadow-2xl border border-slate-100 overflow-hidden transition-all duration-500 ease-in-out hover:-translate-y-2 ring-0 hover:ring-2 ring-blue-100"
              >
                <div className="relative w-full h-64 bg-slate-50/50 border-b border-slate-100 overflow-hidden flex items-center justify-center p-6">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <span className="text-7xl opacity-20 group-hover:scale-110 transition-transform duration-700">
                      🛍️
                    </span>
                  )}
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center gap-2 px-3 text-black py-1.5 text-xs font-bold rounded-full backdrop-blur-lg bg-white/80 shadow-sm border border-slate-100">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          product.stock > 5
                            ? "bg-green-500 animate-pulse"
                            : "bg-orange-500"
                        }`}
                      ></span>
                      Invetario:{" "}
                      <span className="text-slate-900 font-black">
                        {product.stock}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 flex flex-col grow">
                  <h3
                    className="text-xl font-extrabold text-slate-950 line-clamp-2 leading-snug mb-1.5"
                    title={product.name}
                  >
                    {product.name}
                  </h3>

                  <p className="text-3xl font-black text-blue-600 tracking-tighter mt-auto pt-5">
                    {formatPrice(product.price)}
                  </p>

                  <div className="mt-6 space-y-3">
                    <button
                      onClick={() => addToCart(product)}
                      className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-2xl hover:bg-blue-700 transition-colors active:scale-95 transform shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      🛒 Agregar al Carrito
                    </button>

                    {status === "authenticated" &&
                      product.userId === (session?.user as any)?.id && (
                        <button
                          onClick={() =>
                            setModalState({ isOpen: true, product: product })
                          }
                          className="w-full bg-slate-100 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-200 hover:text-slate-950 transition-colors border border-slate-200"
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
            <div className="text-center py-36 bg-white rounded-3xl border-2 border-slate-100 shadow-lg">
              <span className="text-7xl mb-6 block animate-bounce">📦</span>
              <h3 className="text-2xl font-extrabold text-slate-950 mb-3">
                Catálogo vacío
              </h3>
              <p className="text-slate-600 max-w-md mx-auto font-medium">
                Aún no hay productos disponibles en la plataforma de gestión
                comercial de LinkTic Store.
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
