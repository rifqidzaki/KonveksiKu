"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import api from "@/lib/api";
import {
  ArrowLeft, Clock, CheckCircle, Package, Truck,
  Eye, XCircle, MapPin, Search, RefreshCw
} from "lucide-react";

interface Order {
  id: string;
  status: string;
  totalPrice: string;
  trackingNumber: string | null;
  createdAt: string;
  updatedAt: string;
  vendor: { businessName: string; location: string; user: { name: string } };
  items: Array<{ product: { name: string }; quantity: number }>;
}

const statusSteps = [
  { key: "PENDING", label: "Pesanan Dibuat", icon: Clock, color: "yellow" },
  { key: "CONFIRMED", label: "Dikonfirmasi", icon: CheckCircle, color: "blue" },
  { key: "IN_PRODUCTION", label: "Dalam Produksi", icon: Package, color: "purple" },
  { key: "QUALITY_CHECK", label: "Quality Check", icon: Eye, color: "indigo" },
  { key: "SHIPPING", label: "Dikirim", icon: Truck, color: "coral" },
  { key: "DELIVERED", label: "Selesai", icon: CheckCircle, color: "green" },
];

export default function TrackingPage() {
  const { loadUser } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadUser();
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/orders");
      // Only show active orders (not delivered/cancelled)
      setOrders(res.data.orders);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((o) =>
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.vendor.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.trackingNumber && o.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStepIndex = (status: string) => statusSteps.findIndex((s) => s.key === status);

  const getProgressPercent = (status: string) => {
    const idx = getStepIndex(status);
    if (idx < 0) return 0;
    return Math.round((idx / (statusSteps.length - 1)) * 100);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  const formatRupiah = (num: string | number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(num));

  return (
    <div className="min-h-screen bg-navy-900 text-white">
      <nav className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-20 gap-4">
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link href="/" className="text-2xl font-bold bg-gradient-coral bg-clip-text text-transparent">KonveksiKu</Link>
            <span className="text-gray-500 mx-2">/</span>
            <h1 className="text-lg font-semibold">Tracking Pesanan</h1>
            <div className="ml-auto">
              <button onClick={fetchOrders} className="p-2 text-gray-400 hover:text-white transition rounded-lg hover:bg-white/5">
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan Order ID, vendor, atau nomor resi..."
            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-navy-800 border border-white/10 text-white placeholder-gray-500 focus:border-coral-500 focus:ring-1 focus:ring-coral-500 outline-none transition"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-coral-500/30 border-t-coral-500 rounded-full animate-spin" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <Truck className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-500 text-lg">Tidak ada pesanan untuk di-track</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const currentIdx = getStepIndex(order.status);
              const progress = getProgressPercent(order.status);
              const isCancelled = order.status === "CANCELLED";

              return (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}`}
                  className="glass rounded-2xl p-6 border border-white/10 hover:border-coral-500/30 transition block"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-semibold">{order.vendor.businessName}</p>
                        <span className="text-gray-600 text-xs">•</span>
                        <span className="text-gray-500 text-xs font-mono">#{order.id.slice(0, 8)}</span>
                      </div>
                      <p className="text-gray-500 text-sm flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {order.vendor.location}
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        {order.items.map((i) => `${i.product.name} × ${i.quantity}`).join(", ")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-coral-500 font-bold">{formatRupiah(order.totalPrice)}</p>
                      <p className="text-gray-600 text-xs mt-1">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>

                  {isCancelled ? (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      <XCircle className="w-4 h-4" /> Pesanan dibatalkan
                    </div>
                  ) : (
                    <>
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-2">
                          <span>{statusSteps[currentIdx]?.label || "Pending"}</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-navy-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-coral rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Status Steps */}
                      <div className="flex items-center justify-between">
                        {statusSteps.map((step, i) => {
                          const isCompleted = i <= currentIdx;
                          const isCurrent = i === currentIdx;
                          const Icon = step.icon;
                          return (
                            <div key={step.key} className="flex flex-col items-center flex-1">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                                isCompleted
                                  ? isCurrent
                                    ? "bg-coral-500/20 text-coral-500 ring-2 ring-coral-500/50"
                                    : "bg-green-500/20 text-green-400"
                                  : "bg-navy-700 text-gray-600"
                              }`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <p className={`text-[10px] mt-1.5 text-center ${isCompleted ? "text-gray-300" : "text-gray-600"}`}>
                                {step.label}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Tracking Number */}
                      {order.trackingNumber && (
                        <div className="mt-4 p-3 rounded-xl bg-coral-500/5 border border-coral-500/10 flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Nomor Resi:</span>
                          <span className="text-coral-500 font-mono font-medium">{order.trackingNumber}</span>
                        </div>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
