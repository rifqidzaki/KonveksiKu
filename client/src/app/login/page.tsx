"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/stores/authStore";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Check role from localStorage (set by login)
      const userData = localStorage.getItem("user");
      const role = userData ? JSON.parse(userData).role : "USER";
      toast.success(`Selamat datang kembali, ${JSON.parse(userData).name}!`);
      router.push(role === "VENDOR" ? "/vendor" : "/dashboard");
    } catch {
      // error is handled by store
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex">
      {/* Left side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-coral-600/30 to-blue-600/20" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-coral-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-3xl" />
        <div className="relative z-10 px-16 text-center">
          <h2 className="text-5xl font-extrabold text-white mb-6">
            Selamat Datang<br />
            <span className="bg-gradient-coral bg-clip-text text-transparent">Kembali</span>
          </h2>
          <p className="text-gray-300 text-lg max-w-md mx-auto">
            Masuk ke akunmu dan lanjutkan membuat desain baju impianmu bersama KonveksiKu.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="text-3xl font-bold bg-gradient-coral bg-clip-text text-transparent mb-2 inline-block">
            KonveksiKu
          </Link>
          <h1 className="text-2xl font-bold text-white mt-6 mb-2">Masuk ke akun</h1>
          <p className="text-gray-400 mb-8">Belum punya akun?{" "}
            <Link href="/register" className="text-coral-500 hover:text-coral-600 transition font-medium">
              Daftar sekarang
            </Link>
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
              <button onClick={clearError} className="ml-2 text-red-300 hover:text-white">✕</button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-navy-800 border border-white/10 text-white placeholder-gray-500 focus:border-coral-500 focus:ring-1 focus:ring-coral-500 outline-none transition"
                  placeholder="nama@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-navy-800 border border-white/10 text-white placeholder-gray-500 focus:border-coral-500 focus:ring-1 focus:ring-coral-500 outline-none transition"
                  placeholder="Masukkan password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-coral text-white font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-coral-500/25"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Masuk
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
