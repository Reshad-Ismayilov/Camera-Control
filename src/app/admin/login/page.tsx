"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                router.push("/admin/dashboard");
            } else {
                const data = await res.json();
                setError(data.error || "Giriş uğursuzdur");
            }
        } catch (err) {
            setError("Sistem xətası baş verdi. Yenidən cəhd edin.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-md w-full space-y-8 bg-[#1e293b] p-8 rounded-2xl shadow-2xl border border-slate-700/50 relative z-10 pointer-events-auto">
                <div>
                    <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold border-4 border-[#0f172a] shadow-lg">
                        N
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
                        NDU Admin Panel
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-400">
                        Nəqliyyat sisteminin idarəetmə paneli
                    </p>
                    <div className="mt-4 text-center">
                        <Link href="/" className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors cursor-pointer relative z-20">
                            ← Kameraya Qayıt
                        </Link>
                    </div>
                </div>

                <form className="mt-8 space-y-6 relative z-20" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-lg relative text-center text-sm font-medium" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">E-poçt ünvanı</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full px-4 py-2.5 bg-[#0f172a] border border-slate-600 rounded-lg text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-500"
                                placeholder="E-poçt daxil edin"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Şifrə</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-4 py-2.5 bg-[#0f172a] border border-slate-600 rounded-lg text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-500"
                                placeholder="Şifrəni daxil edin"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1e293b] focus:ring-blue-500 disabled:bg-blue-800 transition-colors shadow-lg cursor-pointer z-30"
                        >
                            {loading ? "Giriş edilir..." : "Daxil ol"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
