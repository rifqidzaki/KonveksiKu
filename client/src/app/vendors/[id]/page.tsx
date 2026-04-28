"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import {
  ArrowLeft, Star, MapPin, CheckCircle, Phone,
  Package, Clock, MessageSquare, ShoppingBag
} from "lucide-react";

interface Vendor {
  id: string;
  businessName: string;
  description: string;
  location: string;
  specialization: string[];
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  minOrderQty: number;
  portfolio: any;
  user: { name: string; avatar: string | null; phone: string | null };
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    user: { name: string; avatar: string | null };
  }>;
}

export default function VendorDetailPage() {
  const params = useParams();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) fetchVendor();
  }, [params.id]);

  const fetchVendor = async () => {
    try {
      const res = await api.get(`/api/vendors/${params.id}`);
      setVendor(res.data.vendor);
    } catch (err) {
      console.error("Failed to fetch vendor:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-coral-500/30 border-t-coral-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center text-gray-400">
        Vendor tidak ditemukan
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-900 text-white">
      {/* Header */}
      <nav className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-20 gap-4">
            <Link href="/vendors" className="text-gray-400 hover:text-white transition p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link href="/" className="text-2xl font-bold bg-gradient-coral bg-clip-text text-transparent">
              KonveksiKu
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vendor Card */}
            <div className="glass rounded-2xl p-8 border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-coral-500/5 rounded-full blur-3xl -mr-20 -mt-20" />
              <div className="relative z-10">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-coral flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
                    {vendor.businessName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-bold">{vendor.businessName}</h1>
                      {vendor.isVerified && (
                        <span className="flex items-center gap-1 text-blue-400 text-sm bg-blue-500/10 px-2.5 py-1 rounded-full">
                          <CheckCircle className="w-3.5 h-3.5" /> Terverifikasi
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-gray-400 text-sm mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {vendor.location}
                      </span>
                      {vendor.user.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" /> {vendor.user.phone}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      <span className="text-white font-bold text-lg">{vendor.rating}</span>
                      <span className="text-gray-500">({vendor.totalReviews} review)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h2 className="text-lg font-bold mb-4">Tentang Konveksi</h2>
              <p className="text-gray-400 leading-relaxed">{vendor.description}</p>
            </div>

            {/* Specializations */}
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h2 className="text-lg font-bold mb-4">Spesialisasi</h2>
              <div className="flex flex-wrap gap-3">
                {vendor.specialization.map((spec) => (
                  <span key={spec} className="px-4 py-2 rounded-xl bg-coral-500/10 text-coral-500 text-sm font-medium capitalize">
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h2 className="text-lg font-bold mb-6">Review ({vendor.totalReviews})</h2>
              {vendor.reviews.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Belum ada review</p>
              ) : (
                <div className="space-y-4">
                  {vendor.reviews.map((review) => (
                    <div key={review.id} className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center text-sm font-bold">
                          {review.user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{review.user.name}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      {review.comment && <p className="text-gray-400 text-sm">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Card */}
            <div className="glass rounded-2xl p-6 border border-white/10 sticky top-28">
              <h3 className="font-bold mb-4">Pesan dari Vendor Ini</h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Package className="w-4 h-4 text-coral-500" />
                  <span>Min. order: <strong className="text-white">{vendor.minOrderQty} pcs</strong></span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>Estimasi produksi: <strong className="text-white">7-14 hari</strong></span>
                </div>
              </div>
              <Link
                href={`/order?vendor=${vendor.id}`}
                className="block w-full py-3.5 rounded-xl bg-gradient-coral text-white text-center font-semibold hover:opacity-90 transition shadow-lg shadow-coral-500/25 mb-3"
              >
                <ShoppingBag className="w-4 h-4 inline mr-2" />
                Buat Pesanan
              </Link>
              <Link href="/dashboard/messages"
                className="block w-full py-3.5 rounded-xl glass text-gray-300 text-center font-medium hover:bg-white/5 transition border border-white/10">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Hubungi Vendor
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
