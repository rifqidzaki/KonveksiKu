"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import api from "@/lib/api";
import {
  ArrowLeft, Package, Clock, CheckCircle, Truck,
  XCircle, Eye, ChevronRight, ShoppingBag, Filter
} from "lucide-react";

interface Order {
  id: string;
  status: string;
  totalPrice: string;
  createdAt: string;
  trackingNumber: string | null;
  vendor: { businessName: string; user: { name: string } };
  items: Array<{
    id: string;
    quantity: number;
    material: string;
    size: string;
    product: { name: string };
  }>;
  payment: { status: string } | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: any; bg: string }> = {
  PENDING: { label: "Menunggu Konfirmasi", color: "text-yellow-400", icon: Clock, bg: "bg-yellow-500/10" },
  CONFIRMED: { label: "Dikonfirmasi", color: "text-blue-400", icon: CheckCircle, bg: "bg-blue-500/10" },
  IN_PRODUCTION: { label: "Dalam Produksi", color: "text-purple-400", icon: Package, bg: "bg-purple-500/10" },
  QUALITY_CHECK: { label: "Quality Check", color: "text-indigo-400", icon: Eye, bg: "bg-indigo-500/10" },
  SHIPPING: { label: "Dikirim", color: "text-coral-500", icon: Truck, bg: "bg-coral-500/10" },
  DELIVERED: { label: "Selesai", color: "text-green-400", icon: CheckCircle, bg: "bg-green-500/10" },
  CANCELLED: { label: "Dibatalkan", color: "text-red-400", icon: XCircle, bg: "bg-red-500/10" },
};

export default function OrdersPage() {
  const router = useRouter();
  const { user, loadUser } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    loadUser();
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/api/orders");
      setOrders(res.data.orders);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = filterStatus
    ? orders.filter((o) => o.status === filterStatus)
    : orders;

  const formatRupiah = (num: string | number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(num));

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

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
            <h1 className="text-lg font-semibold">Pesanan Saya</h1>
            <div className="ml-auto">
              <Link href="/order"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-coral text-white font-medium hover:opacity-90 transition text-sm shadow-lg shadow-coral-500/25">
                <ShoppingBag className="w-4 h-4" /> Buat Pesanan
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter */}
        <div className="flex gap-2 flex-wrap mb-8">
          <button onClick={() => setFilterStatus("")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition border ${
              !filterStatus ? "bg-coral-500/20 border-coral-500 text-coral-500" : "bg-navy-800 border-white/10 text-gray-400"
            }`}>
            Semua ({orders.length})
          </button>
          {Object.entries(statusConfig).map(([key, cfg]) => {
            const count = orders.filter((o) => o.status === key).length;
            if (count === 0) return null;
            return (
              <button key={key} onClick={() => setFilterStatus(key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition border ${
                  filterStatus === key ? "bg-coral-500/20 border-coral-500 text-coral-500" : "bg-navy-800 border-white/10 text-gray-400"
                }`}>
                {cfg.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-coral-500/30 border-t-coral-500 rounded-full animate-spin" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-500 text-lg mb-4">Belum ada pesanan</p>
            <Link href="/order" className="text-coral-500 hover:underline">Buat pesanan pertamamu →</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const cfg = statusConfig[order.status] || statusConfig.PENDING;
              const StatusIcon = cfg.icon;
              return (
                <Link key={order.id} href={`/dashboard/orders/${order.id}`}
                  className="glass rounded-2xl p-6 border border-white/10 hover:border-coral-500/30 transition block group">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-gray-500 text-xs mb-1">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-white font-semibold">{order.vendor.businessName}</p>
                      <p className="text-gray-500 text-sm">{formatDate(order.createdAt)}</p>
                    </div>
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${cfg.color} ${cfg.bg}`}>
                      <StatusIcon className="w-3.5 h-3.5" /> {cfg.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      {order.items.map((item) => (
                        <span key={item.id}>{item.product.name} ({item.material}, {item.size}) × {item.quantity}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-bold">{formatRupiah(order.totalPrice)}</span>
                      <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-coral-500 transition" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
