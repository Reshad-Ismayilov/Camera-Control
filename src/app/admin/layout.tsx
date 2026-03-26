"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/admin/login");
    };

    const navItems = [
        { name: "Ana Səhifə (Dashboard)", href: "/admin/dashboard" },
        { name: "Müəllimlər", href: "/admin/teachers" },
        { name: "Nəqliyyat Hesabatı", href: "/admin/logs" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-[#0f172a] shadow-lg flex-shrink-0 flex flex-col hidden md:flex text-slate-300">
                <div className="p-6 border-b border-slate-700/50 flex items-center justify-center">
                    <h2 className="text-xl font-bold text-white tracking-wider">NDU Admin</h2>
                </div>
                <nav className="flex-1 py-6 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center px-8 py-3 transition-colors ${isActive
                                    ? "text-white font-semibold"
                                    : "text-slate-400 hover:text-white"
                                    }`}
                            >
                                <span>{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>
                <div className="mt-auto space-y-2">
                    <Link
                        href="/"
                        className="w-full flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 transition-colors font-medium border border-slate-700"
                    >
                        <span>← Kameraya Qayıt</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white py-4 transition-colors font-semibold"
                    >
                        <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-xs">N</div>
                        <span>Çıxış Et</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-white">
                <header className="bg-[#0f172a] shadow-sm border-b border-slate-700 px-6 py-4 flex items-center justify-between md:hidden">
                    <h1 className="text-lg font-bold text-white">NDU Admin</h1>
                    <button onClick={handleLogout} className="text-sm text-red-500 font-medium">Çıxış</button>
                </header>
                <div className="flex-1 p-8 overflow-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
