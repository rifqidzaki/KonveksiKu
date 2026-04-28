"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import api from "@/lib/api";
import {
  LayoutDashboard, Palette, ShoppingBag, MessageSquare,
  Truck, Settings, LogOut, Plus, Package, Clock,
  CheckCircle, ArrowRight, Star, TrendingUp, Eye
} from "lucide-react";

interface DashboardData {
  totalDesigns: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  recentOrders: Array<{
    id: string;
    status: string;
    totalPrice: string;
    createdAt: string;
    vendor: { businessName: string; user: { name: string } };
    items: Array<{ product: { name: string }; quantity: number }>;
  }>;
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

export default function DashboardPage() {
  const router = useRouter();
  const { user, loadUser, logout } = useAuthStore();
  const [data, setData] = useState<DashboardData>({
    totalDesigns: 0, totalOrders: 0, pendingOrders: 0, completedOrders: 0, recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      if (user.role === "VENDOR") {
        router.push("/vendor");
        return;
      }
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [designsRes, ordersRes] = await Promise.all([
        api.get("/api/designs").catch(() => ({ data: { designs: [] } })),
        api.get("/api/orders").catch(() => ({ data: { orders: [] } })),
      ]);

      const orders = ordersRes.data.orders || [];
      setData({
        totalDesigns: designsRes.data.designs?.length || 0,
        totalOrders: orders.length,
        pendingOrders: orders.filter((o: any) => !["DELIVERED", "CANCELLED"].includes(o.status)).length,
        completedOrders: orders.filter((o: any) => o.status === "DELIVERED").length,
        recentOrders: orders.slice(0, 5),
      });
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (num: string | number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(num));

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short" });

  const handleLogout = () => { logout(); router.push("/"); };

  const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", active: true },
    { icon: Palette, label: "Desain Saya", href: "/editor" },
    { icon: ShoppingBag, label: "Pesanan", href: "/dashboard/orders" },
    { icon: Truck, label: "Tracking", href: "/dashboard/tracking" },
    { icon: MessageSquare, label: "Chat", href: "/dashboard/messages" },
  ];

  const quickActions = [
    { icon: Plus, label: "Buat Desain", desc: "Desain baju custom", href: "/editor", gradient: "from-orange-500 to-pink-500" },
    { icon: ShoppingBag, label: "Buat Pesanan", desc: "Pesan dari vendor", href: "/order", gradient: "from-blue-500 to-purple-500" },
    { icon: Star, label: "Cari Vendor", desc: "Temukan konveksi", href: "/vendors", gradient: "from-green-500 to-teal-500" },
    { icon: Truck, label: "Track Pesanan", desc: "Pantau produksi", href: "/dashboard/tracking", gradient: "from-purple-500 to-indigo-500" },
  ];

  const statCards = [
    { label: "Desain Saya", value: data.totalDesigns, icon: Palette, color: "text-coral-500", bg: "bg-coral-500/10" },
    { label: "Total Pesanan", value: data.totalOrders, icon: Package, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Dalam Proses", value: data.pendingOrders, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "Selesai", value: data.completedOrders, icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10" },
  ];

  return (
    <div className="min-h-screen bg-navy-900 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-navy-800 border-r border-white/10 flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="text-2xl font-bold bg-gradient-coral bg-clip-text text-transparent">KonveksiKu</Link>
          <p className="text-gray-500 text-xs mt-1">User Dashboard</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => (
            <Link key={item.label} href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                item.active
                  ? "bg-coral-500/10 text-coral-500 font-medium"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}>
              <item.icon className="w-5 h-5" /> {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-gradient-coral flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0) || "U"}
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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold">
              Halo, {user?.name?.split(" ")[0] || "User"} 👋
            </h1>
            <p className="text-gray-500 mt-1">Selamat datang di dashboard KonveksiKu</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((card) => (
              <div key={card.label} className="glass rounded-2xl p-5 border border-white/10 hover:border-white/20 transition">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                    <card.icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">{loading ? "..." : card.value}</p>
                <p className="text-gray-500 text-sm mt-1">{card.label}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <h2 className="text-lg font-bold mb-4">Aksi Cepat</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {quickActions.map((action) => (
              <Link key={action.label} href={action.href}
                className="glass rounded-2xl p-5 border border-white/10 hover:border-white/20 transition group">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-white font-medium">{action.label}</p>
                <p className="text-gray-500 text-sm mt-0.5">{action.desc}</p>
              </Link>
            ))}
          </div>

          {/* Recent Orders */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Pesanan Terakhir</h2>
            <Link href="/dashboard/orders" className="text-coral-500 text-sm hover:underline flex items-center gap-1">
              Lihat Semua <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="glass rounded-2xl p-10 border border-white/10 flex justify-center">
              <div className="w-6 h-6 border-2 border-coral-500/30 border-t-coral-500 rounded-full animate-spin" />
            </div>
          ) : data.recentOrders.length === 0 ? (
            <div className="glass rounded-2xl p-10 border border-white/10 text-center">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="text-gray-500">Belum ada pesanan</p>
              <Link href="/order" className="text-coral-500 text-sm mt-2 inline-block hover:underline">
                Buat pesanan pertamamu →
              </Link>
            </div>
          ) : (
            <div className="glass rounded-2xl border border-white/10 divide-y divide-white/5">
              {data.recentOrders.map((order) => {
                const cfg = statusConfig[order.status] || statusConfig.PENDING;
                return (
                  <Link key={order.id} href={`/dashboard/orders/${order.id}`}
                    className="flex items-center justify-between p-5 hover:bg-white/[0.02] transition">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-coral/20 flex items-center justify-center text-lg">👕</div>
                      <div>
                        <p className="text-white text-sm font-medium">
                          {order.items.map((i) => `${i.product.name} ×${i.quantity}`).join(", ")}
                        </p>
                        <p className="text-gray-600 text-xs">{order.vendor.businessName} • {formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${cfg.color} ${cfg.bg}`}>
                        {cfg.label}
                      </span>
                      <span className="text-white font-medium text-sm">{formatRupiah(order.totalPrice)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
