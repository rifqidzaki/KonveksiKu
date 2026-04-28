"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import {
  ArrowLeft, Clock, CheckCircle, Package, Truck,
  XCircle, Eye, MapPin, Phone, MessageSquare
} from "lucide-react";

interface Order {
  id: string;
  status: string;
  totalPrice: string;
  shippingAddress: string;
  trackingNumber: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  vendor: { businessName: string; location: string; user: { name: string; phone: string | null } };
  user: { name: string; email: string; phone: string | null; address: string | null };
  items: Array<{
    id: string;
    quantity: number;
    material: string;
    size: string;
    color: string;
    unitPrice: string;
    subtotal: string;
    product: { name: string; category: string };
  }>;
  payment: { status: string; paymentMethod: string | null; paidAt: string | null } | null;
}

const trackingSteps = [
  { status: "PENDING", label: "Pesanan Dibuat", icon: Clock, desc: "Menunggu konfirmasi vendor" },
  { status: "CONFIRMED", label: "Dikonfirmasi", icon: CheckCircle, desc: "Vendor menerima pesanan" },
  { status: "IN_PRODUCTION", label: "Dalam Produksi", icon: Package, desc: "Pesanan sedang diproduksi" },
  { status: "QUALITY_CHECK", label: "Quality Check", icon: Eye, desc: "Pengecekan kualitas" },
  { status: "SHIPPING", label: "Dikirim", icon: Truck, desc: "Pesanan sedang dikirim" },
  { status: "DELIVERED", label: "Selesai", icon: CheckCircle, desc: "Pesanan telah diterima" },
];

export default function OrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) fetchOrder();
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/api/orders/${params.id}`);
      setOrder(res.data.order);
    } catch (err) {
      console.error("Failed to fetch order:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (num: string | number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(num));

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-coral-500/30 border-t-coral-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center text-gray-400">
        Pesanan tidak ditemukan
      </div>
    );
  }

  const currentStepIndex = trackingSteps.findIndex((s) => s.status === order.status);
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="min-h-screen bg-navy-900 text-white">
      <nav className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-20 gap-4">
            <Link href="/dashboard/orders" className="text-gray-400 hover:text-white transition p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link href="/" className="text-2xl font-bold bg-gradient-coral bg-clip-text text-transparent">KonveksiKu</Link>
            <span className="text-gray-500 mx-2">/</span>
            <h1 className="text-lg font-semibold">Detail Pesanan</h1>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tracking Timeline */}
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h2 className="text-lg font-bold mb-6">Status Pesanan</h2>
              {isCancelled ? (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <XCircle className="w-6 h-6 text-red-400" />
                  <span className="text-red-400 font-medium">Pesanan dibatalkan</span>
                </div>
              ) : (
                <div className="space-y-0">
                  {trackingSteps.map((step, i) => {
                    const isCompleted = i <= currentStepIndex;
                    const isCurrent = i === currentStepIndex;
                    const Icon = step.icon;
                    return (
                      <div key={step.status} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition ${
                            isCompleted
                              ? isCurrent
                                ? "border-coral-500 bg-coral-500/20 text-coral-500"
                                : "border-green-500 bg-green-500/20 text-green-400"
                              : "border-white/10 bg-navy-800 text-gray-600"
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          {i < trackingSteps.length - 1 && (
                            <div className={`w-0.5 h-12 ${isCompleted && i < currentStepIndex ? "bg-green-500/50" : "bg-white/10"}`} />
                          )}
                        </div>
                        <div className="pb-8">
                          <p className={`font-medium ${isCompleted ? "text-white" : "text-gray-600"}`}>{step.label}</p>
                          <p className={`text-sm ${isCompleted ? "text-gray-400" : "text-gray-700"}`}>{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {order.trackingNumber && (
                <div className="mt-4 p-4 rounded-xl bg-coral-500/5 border border-coral-500/10">
                  <p className="text-sm text-gray-400">Nomor Resi</p>
                  <p className="text-coral-500 font-bold text-lg">{order.trackingNumber}</p>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h2 className="text-lg font-bold mb-4">Detail Produk</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: item.color + "30" }}>
                        👕
                      </div>
                      <div>
                        <p className="text-white font-medium">{item.product.name}</p>
                        <p className="text-gray-400 text-sm">{item.material} • {item.size} • {item.quantity} pcs</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">{formatRupiah(item.unitPrice)}/pcs</p>
                      <p className="text-white font-semibold">{formatRupiah(item.subtotal)}</p>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between pt-4 border-t border-white/10">
                  <span className="text-gray-400 font-medium">Total</span>
                  <span className="text-coral-500 font-bold text-xl">{formatRupiah(order.totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Info */}
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h3 className="font-bold mb-4">Info Pesanan</h3>
              <div className="space-y-3 text-sm">
                <div><span className="text-gray-500">Order ID</span><p className="text-white font-mono text-xs">#{order.id.slice(0, 12)}</p></div>
                <div><span className="text-gray-500">Tanggal</span><p className="text-white">{formatDate(order.createdAt)}</p></div>
                <div><span className="text-gray-500">Pembayaran</span><p className={order.payment?.status === "PAID" ? "text-green-400" : "text-yellow-400"}>{order.payment?.status || "Menunggu"}</p></div>
              </div>
            </div>

            {/* Vendor Info */}
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h3 className="font-bold mb-4">Vendor</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-coral flex items-center justify-center text-white font-bold">
                  {order.vendor.businessName.charAt(0)}
                </div>
                <div>
                  <p className="text-white font-medium">{order.vendor.businessName}</p>
                  <p className="text-gray-500 text-xs flex items-center gap-1"><MapPin className="w-3 h-3" /> {order.vendor.location}</p>
                </div>
              </div>
              {order.vendor.user.phone && (
                <p className="text-gray-400 text-sm flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {order.vendor.user.phone}</p>
              )}
            </div>

            {/* Shipping */}
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h3 className="font-bold mb-4 flex items-center gap-2"><Truck className="w-4 h-4 text-coral-500" /> Pengiriman</h3>
              <p className="text-gray-400 text-sm">{order.shippingAddress}</p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {(!order.payment || order.payment.status !== "PAID") && (
                <Link
                  href={`/payment?order=${order.id}`}
                  className="block w-full py-3.5 rounded-xl bg-gradient-coral text-white text-center font-semibold hover:opacity-90 transition shadow-lg shadow-coral-500/25"
                >
                  💳 Bayar Sekarang
                </Link>
              )}
              <Link
                href="/dashboard/messages"
                className="block w-full py-3.5 rounded-xl glass text-gray-300 text-center font-medium hover:bg-white/5 transition border border-white/10"
              >
                <MessageSquare className="w-4 h-4 inline mr-2" /> Chat Vendor
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
