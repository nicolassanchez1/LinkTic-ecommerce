"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type ServiceStatus = "idle" | "checking" | "online" | "offline";

interface ServiceDef {
  id: string;
  name: string;
  url: string;
  description: string;
  icon: string;
}

const SERVICES: ServiceDef[] = [
  {
    id: "gateway",
    name: "API Gateway",
    url: "https://api-gateway-aslw.onrender.com",
    description: "Punto de entrada único y orquestador",
    icon: "🚪",
  },
  {
    id: "auth",
    name: "Auth Service",
    url: "https://auth-service-3qeh.onrender.com",
    description: "Gestión de identidad y JWT",
    icon: "🔐",
  },
  {
    id: "products",
    name: "Products Service",
    url: "https://product-service-3ud2.onrender.com",
    description: "Catálogo e inventario",
    icon: "📦",
  },
  {
    id: "orders",
    name: "Orders Service",
    url: "https://order-service-yazs.onrender.com",
    description: "Transacciones y pedidos",
    icon: "🧾",
  },
];

export default function StatusPage() {
  const [statuses, setStatuses] = useState<Record<string, ServiceStatus>>(
    SERVICES.reduce((acc, s) => ({ ...acc, [s.id]: "idle" }), {})
  );
  const [pingTimes, setPingTimes] = useState<Record<string, number>>({});
  const [isCheckingAll, setIsCheckingAll] = useState(false);

  const checkService = async (service: ServiceDef) => {
    setStatuses((prev) => ({ ...prev, [service.id]: "checking" }));
    const startTime = Date.now();

    try {
      await fetch(service.url, { mode: "no-cors", cache: "no-store" });

      const endTime = Date.now();
      setPingTimes((prev) => ({ ...prev, [service.id]: endTime - startTime }));
      setStatuses((prev) => ({ ...prev, [service.id]: "online" }));
    } catch (error) {
      setStatuses((prev) => ({ ...prev, [service.id]: "offline" }));
    }
  };

  const checkAllServices = async () => {
    setIsCheckingAll(true);
    await Promise.allSettled(SERVICES.map((s) => checkService(s)));
    setIsCheckingAll(false);
  };

  useEffect(() => {
    checkAllServices();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 pb-16 font-sans">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎛️</span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              System <span className="text-blue-600 font-light">Health</span>
            </h1>
          </div>
          <Link
            href="/"
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors text-sm"
          >
            ← Volver a la Tienda
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
              Monitor de Microservicios
            </h2>
            <p className="text-slate-500 max-w-2xl text-sm leading-relaxed">
              Verifica el estado de los contenedores en tiempo real.
              <strong className="text-slate-700"> Nota: </strong>
              Al usar la capa gratuita de infraestructura cloud (Render), los servicios
              dormidos pueden tardar entre{" "}
              <span className="text-orange-600 font-bold">
                30 y 50 segundos
              </span>{" "}
              en despertar en el primer ping.
            </p>
          </div>
          <button
            onClick={checkAllServices}
            disabled={isCheckingAll}
            className={`px-6 py-3 rounded-xl font-bold cursor-pointer text-white shadow-lg transition-all flex items-center gap-2 ${
              isCheckingAll
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5"
            }`}
          >
            {isCheckingAll ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Despertando ecosistema...
              </>
            ) : (
              <>
                <span>⚡</span> Hacer Ping a Todos
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service) => {
            const status = statuses[service.id];
            const ping = pingTimes[service.id];

            return (
              <div
                key={service.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group"
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${
                    status === "online"
                      ? "bg-green-500"
                      : status === "offline"
                      ? "bg-red-500"
                      : status === "checking"
                      ? "bg-yellow-400 animate-pulse"
                      : "bg-slate-200"
                  }`}
                ></div>

                <div className="flex justify-between items-start mb-4 mt-2">
                  <span className="text-4xl grayscale group-hover:grayscale-0 transition-all">
                    {service.icon}
                  </span>

                  <div
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${
                      status === "online"
                        ? "bg-green-50 border-green-200 text-green-700"
                        : status === "offline"
                        ? "bg-red-50 border-red-200 text-red-700"
                        : status === "checking"
                        ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                        : "bg-slate-50 border-slate-200 text-slate-500"
                    }`}
                  >
                    {status === "checking" && (
                      <div className="h-2 w-2 bg-yellow-500 rounded-full animate-ping"></div>
                    )}
                    {status === "online" && (
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    )}
                    {status === "offline" && (
                      <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                    )}
                    {status === "idle" && (
                      <div className="h-2 w-2 bg-slate-400 rounded-full"></div>
                    )}

                    {status === "checking"
                      ? "Waking up..."
                      : status.toUpperCase()}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  {service.name}
                </h3>
                <p className="text-xs text-slate-500 mb-6 font-medium">
                  {service.description}
                </p>

                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div
                    className="text-xs font-mono text-slate-400 truncate pr-4"
                    title={service.url}
                  >
                    {service.url.replace("https://", "")}
                  </div>
                  {status === "online" && ping && (
                    <div className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                      {ping > 5000
                        ? `${(ping / 1000).toFixed(1)}s`
                        : `${ping}ms`}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
