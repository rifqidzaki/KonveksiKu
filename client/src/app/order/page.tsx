"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/stores/authStore";
import api from "@/lib/api";
import {
  ArrowLeft, ArrowRight, Check, ShoppingBag,
  Package, Ruler, Palette, Hash, Truck, MapPin, Star
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  availableMaterials: string[];
  availableSizes: string[];
  availableColors: string[];
  basePrice: string;
}

interface Vendor {
  id: string;
  businessName: string;
  location: string;
  rating: number;
  totalReviews: number;
  minOrderQty: number;
  specialization: string[];
  user: { name: string };
}

interface PriceCalc {
  basePrice: number;
  unitPrice: number;
  quantity: number;
  discountPercent: number;
  materialSurcharge: number;
  subtotal: number;
}

function OrderPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loadUser } = useAuthStore();

  const [step, setStep] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [priceCalc, setPriceCalc] = useState<PriceCalc | null>(null);

  // Order state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(12);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [shippingAddress, setShippingAddress] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadUser();
    fetchData();
  }, []);

  useEffect(() => {
    if (user?.address) setShippingAddress(user.address);
  }, [user]);

  const fetchData = async () => {
    try {
      const [prodRes, vendRes] = await Promise.all([
        api.get("/api/products"),
        api.get("/api/vendors", { params: { sort: "rating" } }),
      ]);
      setProducts(prodRes.data.products);
      setVendors(vendRes.data.vendors);

      // Pre-select vendor from URL
      const vendorId = searchParams.get("vendor");
      if (vendorId) {
        const v = vendRes.data.vendors.find((v: Vendor) => v.id === vendorId);
        if (v) setSelectedVendor(v);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate price when relevant fields change
  useEffect(() => {
    if (selectedProduct && selectedMaterial && quantity > 0) {
      calculatePrice();
    }
  }, [selectedProduct, selectedMaterial, quantity]);

  const calculatePrice = async () => {
    if (!selectedProduct) return;
    try {
      const res = await api.post("/api/orders/calculate-price", {
        productId: selectedProduct.id,
        material: selectedMaterial,
        quantity,
      });
      setPriceCalc(res.data);
    } catch (err) {
      console.error("Price calc error:", err);
    }
  };

  const handleSubmitOrder = async () => {
    if (!selectedProduct || !selectedVendor || !shippingAddress) return;
    if (!user) { router.push("/login"); return; }
    setSubmitting(true);
    try {
      const res = await api.post("/api/orders", {
        vendorId: selectedVendor.id,
        shippingAddress,
        notes,
        items: [
          {
            productId: selectedProduct.id,
            material: selectedMaterial,
            size: selectedSize,
            color: selectedColor,
            quantity,
          },
        ],
      });
      // Redirect to payment page with the new order
      router.push(`/payment?order=${res.data.order.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Gagal membuat pesanan");
    } finally {
      setSubmitting(false);
    }
  };

  const formatRupiah = (num: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);

  const canProceed = () => {
    switch (step) {
      case 1: return !!selectedProduct;
      case 2: return !!selectedMaterial && !!selectedSize && !!selectedColor;
      case 3: return !!selectedVendor;
      case 4: return !!shippingAddress;
      default: return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-coral-500/30 border-t-coral-500 rounded-full animate-spin" />
      </div>
    );
  }

  const steps = [
    { num: 1, label: "Pilih Produk", icon: Package },
    { num: 2, label: "Kustomisasi", icon: Palette },
    { num: 3, label: "Pilih Vendor", icon: Star },
    { num: 4, label: "Konfirmasi", icon: Check },
  ];

  return (
    <div className="min-h-screen bg-navy-900 text-white">
      {/* Header */}
      <nav className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-20 gap-4">
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link href="/" className="text-2xl font-bold bg-gradient-coral bg-clip-text text-transparent">
              KonveksiKu
            </Link>
            <span className="text-gray-500 mx-2">/</span>
            <h1 className="text-lg font-semibold">Buat Pesanan</h1>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <button
                onClick={() => s.num < step && setStep(s.num)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                  step === s.num
                    ? "bg-coral-500/20 text-coral-500 border border-coral-500"
                    : step > s.num
                    ? "bg-green-500/10 text-green-400 border border-green-500/30"
                    : "bg-navy-800 text-gray-500 border border-white/10"
                }`}
              >
                {step > s.num ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < steps.length - 1 && (
                <div className={`w-8 h-px mx-1 ${step > s.num ? "bg-green-500/50" : "bg-white/10"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Select Product */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold mb-6">Pilih Jenis Produk</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    setSelectedProduct(product);
                    setSelectedMaterial(product.availableMaterials[0] || "");
                    setSelectedSize(product.availableSizes[0] || "");
                    setSelectedColor(product.availableColors[0] || "");
                  }}
                  className={`glass p-6 rounded-2xl text-left transition border ${
                    selectedProduct?.id === product.id
                      ? "border-coral-500 bg-coral-500/5"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-coral/20 flex items-center justify-center text-coral-500 text-2xl">
                      👕
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{product.name}</h3>
                      <p className="text-gray-400 text-sm">Mulai dari {formatRupiah(Number(product.basePrice))}</p>
                      <p className="text-gray-500 text-xs mt-1">{product.availableMaterials.length} bahan • {product.availableSizes.length} ukuran</p>
                    </div>
                    {selectedProduct?.id === product.id && (
                      <Check className="w-6 h-6 text-coral-500 ml-auto" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Customize */}
        {step === 2 && selectedProduct && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Material */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="font-bold mb-4 flex items-center gap-2"><Package className="w-5 h-5 text-coral-500" /> Pilih Bahan</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedProduct.availableMaterials.map((mat) => (
                    <button key={mat} onClick={() => setSelectedMaterial(mat)}
                      className={`p-4 rounded-xl text-left text-sm transition border ${
                        selectedMaterial === mat
                          ? "border-coral-500 bg-coral-500/10 text-coral-500"
                          : "border-white/10 text-gray-400 hover:border-white/20"
                      }`}>
                      {mat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="font-bold mb-4 flex items-center gap-2"><Ruler className="w-5 h-5 text-blue-400" /> Pilih Ukuran</h3>
                <div className="flex flex-wrap gap-3">
                  {selectedProduct.availableSizes.map((size) => (
                    <button key={size} onClick={() => setSelectedSize(size)}
                      className={`w-14 h-14 rounded-xl font-bold transition border ${
                        selectedSize === size
                          ? "border-coral-500 bg-coral-500/10 text-coral-500"
                          : "border-white/10 text-gray-400 hover:border-white/20"
                      }`}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="font-bold mb-4 flex items-center gap-2"><Palette className="w-5 h-5 text-purple-400" /> Pilih Warna</h3>
                <div className="flex flex-wrap gap-3">
                  {selectedProduct.availableColors.map((color) => (
                    <button key={color} onClick={() => setSelectedColor(color)}
                      className={`w-12 h-12 rounded-xl border-2 transition ${
                        selectedColor === color ? "border-coral-500 scale-110" : "border-transparent hover:border-white/30"
                      }`}
                      style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="font-bold mb-4 flex items-center gap-2"><Hash className="w-5 h-5 text-green-400" /> Jumlah</h3>
                <div className="flex items-center gap-4">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-xl bg-white/5 text-white hover:bg-white/10 transition font-bold">−</button>
                  <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 text-center py-2 rounded-xl bg-navy-800 border border-white/10 text-white outline-none focus:border-coral-500" />
                  <button onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-xl bg-white/5 text-white hover:bg-white/10 transition font-bold">+</button>
                </div>
                {priceCalc && priceCalc.discountPercent > 0 && (
                  <p className="text-green-400 text-sm mt-3">🎉 Diskon {priceCalc.discountPercent}% untuk pembelian {quantity} pcs!</p>
                )}
              </div>
            </div>

            {/* Price Summary Sidebar */}
            <div className="glass rounded-2xl p-6 border border-white/10 h-fit sticky top-28">
              <h3 className="font-bold mb-4">Ringkasan Harga</h3>
              {priceCalc ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Harga dasar</span>
                    <span>{formatRupiah(priceCalc.basePrice)}</span>
                  </div>
                  {priceCalc.discountPercent > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Diskon ({priceCalc.discountPercent}%)</span>
                      <span>-{formatRupiah(priceCalc.basePrice - priceCalc.unitPrice + (priceCalc.materialSurcharge > 0 ? priceCalc.basePrice * priceCalc.materialSurcharge / 100 : 0))}</span>
                    </div>
                  )}
                  {priceCalc.materialSurcharge > 0 && (
                    <div className="flex justify-between text-yellow-400">
                      <span>Bahan premium (+{priceCalc.materialSurcharge}%)</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-400">
                    <span>Harga/pcs</span>
                    <span>{formatRupiah(priceCalc.unitPrice)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Jumlah</span>
                    <span>× {priceCalc.quantity}</span>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between text-white font-bold text-lg">
                    <span>Total</span>
                    <span className="text-coral-500">{formatRupiah(priceCalc.subtotal)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Pilih produk dan bahan untuk melihat harga</p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Select Vendor */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold mb-6">Pilih Vendor Konveksi</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {vendors.map((vendor) => (
                <button key={vendor.id} onClick={() => setSelectedVendor(vendor)}
                  className={`glass p-6 rounded-2xl text-left transition border ${
                    selectedVendor?.id === vendor.id
                      ? "border-coral-500 bg-coral-500/5"
                      : "border-white/10 hover:border-white/20"
                  }`}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-coral flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {vendor.businessName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white">{vendor.businessName}</h3>
                      <p className="text-gray-400 text-sm flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5" /> {vendor.location}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-white text-sm font-semibold">{vendor.rating}</span>
                        <span className="text-gray-500 text-xs">({vendor.totalReviews})</span>
                        <span className="text-gray-600 text-xs ml-2">Min. {vendor.minOrderQty} pcs</span>
                      </div>
                    </div>
                    {selectedVendor?.id === vendor.id && <Check className="w-6 h-6 text-coral-500" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              {/* Shipping Address */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="font-bold mb-4 flex items-center gap-2"><Truck className="w-5 h-5 text-coral-500" /> Alamat Pengiriman</h3>
                <textarea value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)}
                  rows={3} placeholder="Masukkan alamat lengkap pengiriman"
                  className="w-full rounded-xl bg-navy-800 border border-white/10 text-white placeholder-gray-500 p-4 outline-none focus:border-coral-500 transition resize-none" />
              </div>
              {/* Notes */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="font-bold mb-4">Catatan (opsional)</h3>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                  rows={2} placeholder="Catatan tambahan untuk vendor..."
                  className="w-full rounded-xl bg-navy-800 border border-white/10 text-white placeholder-gray-500 p-4 outline-none focus:border-coral-500 transition resize-none" />
              </div>
            </div>

            {/* Order Summary */}
            <div className="glass rounded-2xl p-6 border border-white/10 h-fit">
              <h3 className="font-bold mb-4">Ringkasan Pesanan</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Produk</span><span className="text-white">{selectedProduct?.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Bahan</span><span className="text-white">{selectedMaterial}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Ukuran</span><span className="text-white">{selectedSize}</span></div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Warna</span>
                  <span className="flex items-center gap-2"><span className="w-5 h-5 rounded-md border border-white/20" style={{ backgroundColor: selectedColor }} />{selectedColor}</span>
                </div>
                <div className="flex justify-between"><span className="text-gray-400">Jumlah</span><span className="text-white">{quantity} pcs</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Vendor</span><span className="text-white">{selectedVendor?.businessName}</span></div>
                {priceCalc && (
                  <>
                    <div className="border-t border-white/10 pt-3 flex justify-between">
                      <span className="text-gray-400">Harga/pcs</span><span className="text-white">{formatRupiah(priceCalc.unitPrice)}</span>
                    </div>
                    <div className="flex justify-between text-white font-bold text-lg">
                      <span>Total</span><span className="text-coral-500">{formatRupiah(priceCalc.subtotal)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-10">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl glass text-gray-300 font-medium hover:bg-white/5 transition border border-white/10">
              <ArrowLeft className="w-5 h-5" /> Kembali
            </button>
          ) : <div />}

          {step < 4 ? (
            <button onClick={() => canProceed() && setStep(step + 1)} disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-coral text-white font-semibold hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-coral-500/25">
              Lanjut <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button onClick={handleSubmitOrder} disabled={submitting || !canProceed()}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-coral text-white font-semibold hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-coral-500/25">
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><ShoppingBag className="w-5 h-5" /> Buat Pesanan</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-coral-500/30 border-t-coral-500 rounded-full animate-spin" />
      </div>
    }>
      <OrderPageContent />
    </Suspense>
  );
}
