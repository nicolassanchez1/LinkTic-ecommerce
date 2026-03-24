"use client";

import { useQuery } from "@tanstack/react-query";
import { useCartStore } from "./src/store/cartStore";
import type { Product } from "./src/store/cartStore";

const fetchProducts = async () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(`${apiUrl}/products`);

  if (!res.ok) throw new Error("Error al cargar los productos");
  return res.json();
};

export default function Home() {
  const {
    data: products,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const addToCart = useCartStore((state) => state.addToCart);
  const totalItems = useCartStore((state) => state.getTotalItems());

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Catálogo de Productos
          </h1>
          <div className="flex gap-4 items-center">
            {/* Indicador del Carrito */}
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 font-medium text-gray-700">
              🛒 Carrito:{" "}
              <span className="text-blue-600 font-bold">{totalItems}</span>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              Iniciar Sesión
            </button>
          </div>
        </div>

        {isLoading && <p className="text-gray-500">Cargando productos...</p>}
        {isError && <p className="text-red-500">Error: {error.message}</p>}

        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product: Product) => (
              <div
                key={product.id}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {product.name}
                  </h2>
                  <p className="text-3xl font-bold text-blue-600 mt-4">
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
      </div>
    </main>
  );
}
