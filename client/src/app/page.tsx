"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { ArrowRight, Scissors, MessageSquare, Truck, Star, LayoutDashboard } from "lucide-react";

export default function Home() {
  const { user, loadUser } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadUser();
    setMounted(true);
  }, []);

  const dashboardLink = user?.role === "VENDOR" ? "/vendor" : "/dashboard";

  return (
    <div className="min-h-screen bg-navy-900 text-white selection:bg-coral-500 selection:text-white">
      {/* Navigation */}
      <nav className="fixed w-full z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold bg-gradient-coral bg-clip-text text-transparent">
                KonveksiKu
              </Link>
            </div>
            <div className="hidden md:flex space-x-8">
              <Link href="#features" className="text-gray-300 hover:text-white transition">Fitur</Link>
              <Link href="#how-it-works" className="text-gray-300 hover:text-white transition">Cara Kerja</Link>
              <Link href="/vendors" className="text-gray-300 hover:text-white transition">Konveksi</Link>
            </div>
            <div className="flex space-x-4">
              {mounted && user ? (
                <Link href={dashboardLink} className="flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-coral hover:opacity-90 transition font-medium">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="px-4 py-2 text-gray-300 hover:text-white transition">
                    Masuk
                  </Link>
                  <Link href="/register" className="px-6 py-2 rounded-full bg-gradient-coral hover:opacity-90 transition font-medium">
                    Daftar
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-16 sm:pt-40 sm:pb-24 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-coral-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-3xl" />
          
          <div className="text-center relative z-10">
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-8">
              Wujudkan Desain<br />
              <span className="bg-gradient-coral bg-clip-text text-transparent">Pakaian Impianmu</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-400 mb-10">
              Platform end-to-end yang menghubungkan ide kreatifmu dengan konveksi lokal terbaik di seluruh Indonesia. Desain, pesan, dan pantau dalam satu tempat.
            </p>
            <div className="flex justify-center space-x-6">
              <Link href="/editor" className="group px-8 py-4 rounded-full bg-gradient-coral text-lg font-medium hover:opacity-90 transition flex items-center shadow-lg shadow-coral-500/25">
                Mulai Desain Sekarang
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/vendors" className="px-8 py-4 rounded-full glass text-lg font-medium hover:bg-white/5 transition border border-white/10">
                Lihat Vendor
              </Link>
            </div>
          </div>

          {/* Floating Stats */}
          <div className="mt-24 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="glass p-8 rounded-2xl text-center border border-white/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-coral opacity-0 group-hover:opacity-10 transition duration-500" />
              <p className="text-4xl font-bold text-white mb-2">500+</p>
              <p className="text-gray-400">Konveksi Terdaftar</p>
            </div>
            <div className="glass p-8 rounded-2xl text-center border border-white/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-coral opacity-0 group-hover:opacity-10 transition duration-500" />
              <p className="text-4xl font-bold text-white mb-2">10K+</p>
              <p className="text-gray-400">Desain Dibuat</p>
            </div>
            <div className="glass p-8 rounded-2xl text-center border border-white/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-coral opacity-0 group-hover:opacity-10 transition duration-500" />
              <p className="text-4xl font-bold text-white mb-2">50K+</p>
              <p className="text-gray-400">Pesanan Selesai</p>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-24 bg-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Fitur Unggulan KonveksiKu</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Kami menyediakan alat lengkap dari desain hingga pengiriman untuk pengalaman pemesanan baju custom terbaik.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="glass p-6 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-coral-500/20 flex items-center justify-center mb-6">
                <Scissors className="w-6 h-6 text-coral-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Online Editor</h3>
              <p className="text-gray-400">Desain bajumu langsung di browser tanpa perlu software tambahan.</p>
            </div>
            <div className="glass p-6 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-6">
                <Star className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Vendor Terverifikasi</h3>
              <p className="text-gray-400">Pilih dari ratusan vendor konveksi dengan rating dan review terpercaya.</p>
            </div>
            <div className="glass p-6 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
                <MessageSquare className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Live Chat</h3>
              <p className="text-gray-400">Komunikasi real-time dan negosiasi harga langsung dengan vendor.</p>
            </div>
            <div className="glass p-6 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-6">
                <Truck className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Live Tracking</h3>
              <p className="text-gray-400">Pantau status produksi hingga pengiriman barang ke alamatmu.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Cara Kerja</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Dari ide sampai di tangan kamu, hanya 4 langkah mudah.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Desain", desc: "Buat desain bajumu di editor online kami", emoji: "🎨" },
              { step: "2", title: "Pilih Vendor", desc: "Pilih konveksi berdasarkan harga & review", emoji: "🏭" },
              { step: "3", title: "Bayar & Chat", desc: "Bayar dan diskusi langsung dengan vendor", emoji: "💬" },
              { step: "4", title: "Terima", desc: "Pantau produksi & terima pesananmu", emoji: "📦" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-coral/20 flex items-center justify-center mx-auto mb-4 text-3xl">
                  {item.emoji}
                </div>
                <div className="w-8 h-8 rounded-full bg-coral-500/20 text-coral-500 font-bold flex items-center justify-center mx-auto mb-3 text-sm">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-navy-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Siap Wujudkan Desainmu?</h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan pelanggan yang sudah mempercayakan desain mereka kepada vendor terbaik di KonveksiKu.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/register" className="px-8 py-4 rounded-full bg-gradient-coral text-lg font-medium hover:opacity-90 transition shadow-lg shadow-coral-500/25">
              Daftar Gratis
            </Link>
            <Link href="/vendors" className="px-8 py-4 rounded-full glass text-lg font-medium hover:bg-white/5 transition border border-white/10">
              Lihat Vendor
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold bg-gradient-coral bg-clip-text text-transparent mb-4">KonveksiKu</h3>
              <p className="text-gray-500 text-sm">Platform pemesanan baju custom #1 di Indonesia.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-gray-300">Platform</h4>
              <div className="space-y-2 text-sm">
                <Link href="/editor" className="block text-gray-500 hover:text-gray-300 transition">Design Editor</Link>
                <Link href="/vendors" className="block text-gray-500 hover:text-gray-300 transition">Cari Vendor</Link>
                <Link href="/order" className="block text-gray-500 hover:text-gray-300 transition">Buat Pesanan</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-gray-300">Dukungan</h4>
              <div className="space-y-2 text-sm">
                <span className="block text-gray-500">FAQ</span>
                <span className="block text-gray-500">Kontak Kami</span>
                <span className="block text-gray-500">Kebijakan Privasi</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-gray-300">Ikuti Kami</h4>
              <div className="space-y-2 text-sm">
                <span className="block text-gray-500">Instagram</span>
                <span className="block text-gray-500">Twitter</span>
                <span className="block text-gray-500">YouTube</span>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; 2026 KonveksiKu. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
