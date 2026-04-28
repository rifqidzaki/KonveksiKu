"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import {
  ArrowLeft, CreditCard, CheckCircle, Clock, Building2,
  Wallet, QrCode, Shield, ArrowRight
} from "lucide-react";

interface Order {
  id: string;
  totalPrice: string;
  status: string;
  vendor: { businessName: string };
  items: Array<{ product: { name: string }; quantity: number; material: string; size: string; subtotal: string }>;
}

interface Payment {
  id: string;
  status: string;
  amount: string;
  paymentMethod: string | null;
  paidAt: string | null;
}

const paymentMethods = [
  { id: "bank_transfer", label: "Transfer Bank", icon: Building2, desc: "BCA, Mandiri, BNI, BRI" },
  { id: "e_wallet", label: "E-Wallet", icon: Wallet, desc: "GoPay, OVO, DANA, ShopeePay" },
  { id: "qris", label: "QRIS", icon: QrCode, desc: "Scan QR dari semua aplikasi" },
];

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");

  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [selectedMethod, setSelectedMethod] = useState("bank_transfer");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/api/orders/${orderId}`);
      setOrder(res.data.order);

      // Check existing payment
      try {
        const payRes = await api.get(`/api/payments/status/${orderId}`);
        setPayment(payRes.data.payment);
        if (payRes.data.payment.status === "PAID") setPaymentSuccess(true);
      } catch {
        // No payment yet
      }
    } catch (err) {
      console.error("Failed to fetch order:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!orderId) return;
    setProcessing(true);

    try {
      // Step 1: Create payment
      const createRes = await api.post("/api/payments/create", { orderId });
      const paymentData = createRes.data.payment;

      // Step 2: Simulate payment processing (in production, redirect to Midtrans)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Step 3: Confirm payment
      await api.post("/api/payments/confirm", {
        paymentId: paymentData.id,
        paymentMethod: selectedMethod,
      });

      setPaymentSuccess(true);
      toast.success("Pembayaran berhasil dikonfirmasi");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Pembayaran gagal");
    } finally {
      setProcessing(false);
    }
  };

  const formatRupiah = (num: string | number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(num));

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
        Pesanan tidak ditemukan. <Link href="/dashboard/orders" className="text-coral-500 ml-2">Kembali</Link>
      </div>
    );
  }

  // Payment Success View
  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center text-white">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Pembayaran Berhasil!</h1>
          <p className="text-gray-400 mb-2">Terima kasih! Pembayaran Anda telah diterima.</p>
          <p className="text-gray-500 text-sm mb-8">Vendor akan segera memproses pesanan Anda.</p>
          <div className="glass rounded-2xl p-6 border border-white/10 mb-8 text-left">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Order ID</span>
                <span className="text-white font-mono">#{order.id.slice(0, 8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Vendor</span>
                <span className="text-white">{order.vendor.businessName}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-3">
                <span className="text-gray-400">Total Dibayar</span>
                <span className="text-green-400 font-bold">{formatRupiah(order.totalPrice)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <Link href={`/dashboard/orders/${order.id}`}
              className="px-6 py-3 rounded-xl bg-gradient-coral text-white font-medium hover:opacity-90 transition">
              Lihat Pesanan
            </Link>
            <Link href="/dashboard"
              className="px-6 py-3 rounded-xl glass text-gray-300 font-medium hover:bg-white/5 transition border border-white/10">
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-900 text-white">
      <nav className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center h-20 gap-4">
            <Link href={`/dashboard/orders/${order.id}`} className="text-gray-400 hover:text-white transition p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link href="/" className="text-2xl font-bold bg-gradient-coral bg-clip-text text-transparent">KonveksiKu</Link>
            <span className="text-gray-500 mx-2">/</span>
            <h1 className="text-lg font-semibold">Pembayaran</h1>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Payment Methods */}
          <div className="lg:col-span-3 space-y-6">
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-coral-500" /> Pilih Metode Pembayaran
              </h2>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl transition border text-left ${
                      selectedMethod === method.id
                        ? "border-coral-500 bg-coral-500/5"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      selectedMethod === method.id ? "bg-coral-500/20 text-coral-500" : "bg-white/5 text-gray-400"
                    }`}>
                      <method.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{method.label}</p>
                      <p className="text-gray-500 text-sm">{method.desc}</p>
                    </div>
                    {selectedMethod === method.id && <CheckCircle className="w-5 h-5 text-coral-500" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Shield className="w-4 h-4 text-green-400" />
                <span>Pembayaran Anda dilindungi dengan enkripsi SSL 256-bit</span>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="glass rounded-2xl p-6 border border-white/10 sticky top-28">
              <h3 className="font-bold mb-4">Ringkasan Pembayaran</h3>
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-400">Order</span>
                  <span className="text-white font-mono">#{order.id.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Vendor</span>
                  <span className="text-white">{order.vendor.businessName}</span>
                </div>
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-gray-400">{item.product.name} × {item.quantity}</span>
                    <span className="text-white">{formatRupiah(item.subtotal)}</span>
                  </div>
                ))}
                <div className="border-t border-white/10 pt-3 flex justify-between text-white font-bold text-lg">
                  <span>Total</span>
                  <span className="text-coral-500">{formatRupiah(order.totalPrice)}</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={processing}
                className="w-full py-4 rounded-xl bg-gradient-coral text-white font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-coral-500/25"
              >
                {processing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    Bayar {formatRupiah(order.totalPrice)}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-coral-500/30 border-t-coral-500 rounded-full animate-spin" />
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}
