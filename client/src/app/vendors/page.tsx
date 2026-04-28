"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import {
  ArrowLeft, Star, MapPin, Search, Filter,
  CheckCircle, Package, ChevronRight
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
  user: { name: string; avatar: string | null };
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSpec, setFilterSpec] = useState("");

  useEffect(() => {
    fetchVendors();
  }, [filterSpec]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const params: any = { sort: "rating" };
      if (filterSpec) params.specialization = filterSpec;
      const res = await api.get("/api/vendors", { params });
      setVendors(res.data.vendors);
    } catch (err) {
      console.error("Failed to fetch vendors:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter(
    (v) =>
      v.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const specializations = ["kaos", "polo", "hoodie", "jaket", "seragam", "sweater"];

  return (
    <div className="min-h-screen bg-navy-900 text-white">
      {/* Header */}
      <nav className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-20 gap-4">
            <Link href="/" className="text-gray-400 hover:text-white transition p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link href="/" className="text-2xl font-bold bg-gradient-coral bg-clip-text text-transparent">
              KonveksiKu
            </Link>
            <span className="text-gray-500 mx-2">/</span>
            <h1 className="text-lg font-semibold">Vendor Konveksi</h1>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari vendor berdasarkan nama atau lokasi..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-navy-800 border border-white/10 text-white placeholder-gray-500 focus:border-coral-500 focus:ring-1 focus:ring-coral-500 outline-none transition"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterSpec("")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition border ${
                filterSpec === ""
                  ? "bg-coral-500/20 border-coral-500 text-coral-500"
                  : "bg-navy-800 border-white/10 text-gray-400 hover:border-white/20"
              }`}
            >
              Semua
            </button>
            {specializations.map((spec) => (
              <button
                key={spec}
                onClick={() => setFilterSpec(spec)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition border capitalize ${
                  filterSpec === spec
                    ? "bg-coral-500/20 border-coral-500 text-coral-500"
                    : "bg-navy-800 border-white/10 text-gray-400 hover:border-white/20"
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Vendor Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-coral-500/30 border-t-coral-500 rounded-full animate-spin" />
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Tidak ada vendor ditemukan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVendors.map((vendor) => (
              <Link
                key={vendor.id}
                href={`/vendors/${vendor.id}`}
                className="glass rounded-2xl p-6 border border-white/10 hover:border-coral-500/30 transition group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-coral-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-coral-500/10 transition" />

                <div className="relative z-10">
                  {/* Vendor Avatar & Name */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-coral flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {vendor.businessName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white truncate">{vendor.businessName}</h3>
                        {vendor.isVerified && (
                          <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 text-sm mt-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {vendor.location}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {vendor.description}
                  </p>

                  {/* Specialization Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {vendor.specialization.map((spec) => (
                      <span
                        key={spec}
                        className="px-2.5 py-1 rounded-lg bg-white/5 text-gray-300 text-xs capitalize"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>

                  {/* Rating & Min Order */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-white font-semibold">{vendor.rating}</span>
                      <span className="text-gray-500 text-sm">({vendor.totalReviews})</span>
                    </div>
                    <div className="text-gray-400 text-sm">
                      Min. {vendor.minOrderQty} pcs
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
