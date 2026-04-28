"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/stores/authStore";
import api from "@/lib/api";
import {
  LayoutDashboard, Package, MessageSquare, Star,
  TrendingUp, Clock, CheckCircle, Truck, Eye,
  ArrowRight, Users, DollarSign, BarChart3, LogOut
} from "lucide-react";

interface VendorStats {
  totalOrders: number;
  pendingOrders: number;
  inProductionOrders: number;
  completedOrders: number;
  totalRevenue: number;
}

interface Order {
  id: string;
  status: string;
  totalPrice: string;
  createdAt: string;
  user: { name: string; email: string };
  items: Array<{ product: { name: string }; quantity: number; material: string; size: string }>;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "Menunggu", color: "text-yellow-400", bg: "bg-yellow-500/10" },
  CONFIRMED: { label: "Dikonfirmasi", color: "text-blue-400", bg: "bg-blue-500/10" },
  IN_PRODUCTION: { label: "Produksi", color: "text-purple-400", bg: "bg-purple-500/10" },
  QUALITY_CHECK: { label: "QC", color: "text-indigo-400", bg: "bg-indigo-500/10" },
  SHIPPING: { label: "Dikirim", color: "text-coral-500", bg: "bg-coral-500/10" },
  DELIVERED: { label: "Selesai", color: "text-green-400", bg: "bg-green-500/10" },
  CANCELLED: { label: "Batal", color: "text-red-400", bg: "bg-red-500/10" },
};

export default function VendorDashboardPage() {
  const router = useRouter();
  const { user, loadUser, logout } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<VendorStats>({ totalOrders: 0, pendingOrders: 0, inProductionOrders: 0, completedOrders: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      if (user.role !== "VENDOR") {
        router.push("/dashboard");
        return;
      }
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/api/orders");
      const allOrders = res.data.orders;
      setOrders(allOrders);

      // Calculate stats
      setStats({
        totalOrders: allOrders.length,
        pendingOrders: allOrders.filter((o: Order) => o.status === "PENDING" || o.status === "CONFIRMED").length,
        inProductionOrders: allOrders.filter((o: Order) => o.status === "IN_PRODUCTION" || o.status === "QUALITY_CHECK").length,
        completedOrders: allOrders.filter((o: Order) => o.status === "DELIVERED").length,
        totalRevenue: allOrders.filter((o: Order) => o.status === "DELIVERED").reduce((sum: number, o: Order) => sum + Number(o.totalPrice), 0),
      });
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.patch(`/api/orders/${orderId}/status`, { status: newStatus });
      toast.success("Status pesanan diperbarui");
      fetchOrders(); // Refresh
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Gagal update status");
    }
  };

  const getNextStatus = (current: string): string | null => {
    const flow: Record<string, string> = {
      PENDING: "CONFIRMED",
      CONFIRMED: "IN_PRODUCTION",
      IN_PRODUCTION: "QUALITY_CHECK",
      QUALITY_CHECK: "SHIPPING",
      SHIPPING: "DELIVERED",
    };
    return flow[current] || null;
  };

  const filteredOrders = activeTab === "all"
    ? orders
    : orders.filter((o) => o.status === activeTab);

  const formatRupiah = (num: number | string) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(num));

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  const handleLogout = () => { logout(); router.push("/"); };

  const statCards = [
    { label: "Total Pesanan", value: stats.totalOrders, icon: Package, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Menunggu Proses", value: stats.pendingOrders, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "Dalam Produksi", value: stats.inProductionOrders, icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Selesai", value: stats.completedOrders, icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10" },
  ];

  return (
    <div className="min-h-screen bg-navy-900 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-navy-800 border-r border-white/10 flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="text-2xl font-bold bg-gradient-coral bg-clip-text text-transparent">KonveksiKu</Link>
          <p className="text-gray-500 text-xs mt-1">Vendor Dashboard</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { icon: LayoutDashboard, label: "Dashboard", href: "/vendor" },
            { icon: Package, label: "Pesanan", href: "/vendor" },
            { icon: MessageSquare, label: "Chat", href: "/dashboard/messages" },
            { icon: Star, label: "Review", href: "/vendor" },
            { icon: BarChart3, label: "Statistik", href: "/vendor" },
          ].map((item) => (
            <Link key={item.label} href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition text-sm">
              <item.icon className="w-5 h-5" /> {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-gradient-coral flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0) || "V"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-gray-500 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition text-sm">
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">Selamat Datang, {user?.name} 👋</h1>
              <p className="text-gray-500 mt-1">Kelola pesanan dan produksi Anda</p>
            </div>
            <div className="glass rounded-xl px-5 py-3 border border-white/10">
              <p className="text-gray-500 text-xs">Total Pendapatan</p>
              <p className="text-coral-500 font-bold text-lg">{formatRupiah(stats.totalRevenue)}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((card) => (
              <div key={card.label} className="glass rounded-2xl p-5 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                    <card.icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">{card.value}</p>
                <p className="text-gray-500 text-sm mt-1">{card.label}</p>
              </div>
            ))}
          </div>

          {/* Orders Table */}
          <div className="glass rounded-2xl border border-white/10">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-lg font-bold">Pesanan Masuk</h2>
              <div className="flex gap-2 mt-4 flex-wrap">
                {[
                  { key: "all", label: "Semua" },
                  { key: "PENDING", label: "Menunggu" },
                  { key: "CONFIRMED", label: "Dikonfirmasi" },
                  { key: "IN_PRODUCTION", label: "Produksi" },
                  { key: "QUALITY_CHECK", label: "QC" },
                  { key: "SHIPPING", label: "Dikirim" },
                  { key: "DELIVERED", label: "Selesai" },
                ].map((tab) => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                      activeTab === tab.key
                        ? "bg-coral-500/20 text-coral-500"
                        : "bg-white/5 text-gray-500 hover:text-gray-300"
                    }`}>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-2 border-coral-500/30 border-t-coral-500 rounded-full animate-spin" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Belum ada pesanan</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filteredOrders.map((order) => {
                  const cfg = statusConfig[order.status] || statusConfig.PENDING;
                  const nextStatus = getNextStatus(order.status);
                  const nextLabel = nextStatus ? statusConfig[nextStatus]?.label : null;

                  return (
                    <div key={order.id} className="p-6 hover:bg-white/[0.02] transition">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3">
                            <p className="text-white font-medium">{order.user.name}</p>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${cfg.color} ${cfg.bg}`}>
                              {cfg.label}
                            </span>
                          </div>
                          <p className="text-gray-600 text-xs mt-1 font-mono">#{order.id.slice(0, 8)} • {formatDate(order.createdAt)}</p>
                        </div>
                        <p className="text-white font-bold">{formatRupiah(order.totalPrice)}</p>
                      </div>

                      {/* Items */}
                      <div className="text-gray-400 text-sm mb-4">
                        {order.items.map((item, i) => (
                          <span key={i}>
                            {i > 0 && ", "}
                            {item.product.name} ({item.material}, {item.size}) ×{item.quantity}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/orders/${order.id}`}
                          className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 text-xs font-medium hover:bg-white/10 transition">
                          <Eye className="w-3.5 h-3.5 inline mr-1" /> Detail
                        </Link>
                        <Link href="/dashboard/messages"
                          className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 text-xs font-medium hover:bg-white/10 transition">
                          <MessageSquare className="w-3.5 h-3.5 inline mr-1" /> Chat
                        </Link>
                        {nextStatus && (
                          <button
                            onClick={() => updateStatus(order.id, nextStatus)}
                            className="px-3 py-1.5 rounded-lg bg-coral-500/10 text-coral-500 text-xs font-medium hover:bg-coral-500/20 transition ml-auto"
                          >
                            <ArrowRight className="w-3.5 h-3.5 inline mr-1" />
                            Update: {nextLabel}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
