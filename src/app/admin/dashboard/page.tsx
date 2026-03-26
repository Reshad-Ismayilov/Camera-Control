"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, TrendingUp, Camera, ShieldAlert, ShieldCheck, VideoOff } from "lucide-react";

export default function DashboardPage() {
    const [stats, setStats] = useState({
        daily: { success: 0, failed: 0, total: 0 }
    });
    const [logs, setLogs] = useState<any[]>([]);
    const [hardwareStatus, setHardwareStatus] = useState({ camera: "offline", barrier: "offline" });

    const fetchDashboardData = async () => {
        try {
            const statsRes = await fetch("/api/stats");
            const logsRes = await fetch("/api/logs?date=" + new Date().toISOString());
            const hardwareRes = await fetch("/api/hardware-status");

            if (statsRes.ok) setStats(await statsRes.json());
            if (logsRes.ok) setLogs(await logsRes.json());
            if (hardwareRes.ok) setHardwareStatus(await hardwareRes.json());
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 5000); // Polling every 5 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-8 font-sans">
            <h1 className="text-2xl font-bold text-gray-800">Bugünkü Statistika</h1>

            {/* Günlük Statistika Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Ümumi Giriş Cəhdi</p>
                        <p className="text-3xl font-bold text-gray-800">{stats.daily.total}</p>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-500 rounded-full border border-blue-100">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Uğurlu Keçid</p>
                        <p className="text-3xl font-bold text-green-600">{stats.daily.success}</p>
                    </div>
                    <div className="p-3 bg-green-50 text-green-500 rounded-full border border-green-100">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Uğursuz (Rədd edilib)</p>
                        <p className="text-3xl font-bold text-red-600">{stats.daily.failed}</p>
                    </div>
                    <div className="p-3 bg-red-50 text-red-500 rounded-full border border-red-100">
                        <XCircle className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Sistem Avadanlıqları */}
            <div className="pt-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Sistem Avadanlıqları</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Kamera Statusu */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className={`p-3 rounded-full border ${hardwareStatus.camera === "online" ? "bg-green-50 text-green-500 border-green-100" : "bg-red-50 text-red-500 border-red-100"}`}>
                                {hardwareStatus.camera === "online" ? <Camera className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Kamera Mühərriki</h3>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-sm text-gray-500">Status:</span>
                                    {hardwareStatus.camera === "online" ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">İşlək Vəziyyətdə</span>
                                    ) : (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Problem (Xəta)</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Baryer Statusu */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className={`p-3 rounded-full border ${hardwareStatus.barrier === "online" ? "bg-green-50 text-green-500 border-green-100" : "bg-red-50 text-red-500 border-red-100"}`}>
                                {hardwareStatus.barrier === "online" ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Baryer (Şlaqbaum) Aygıtı</h3>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-sm text-gray-500">Status:</span>
                                    {hardwareStatus.barrier === "online" ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">İşlək Vəziyyətdə</span>
                                    ) : (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Problem (Xəta)</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Son Real-time Girişlər</h2>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Nömrə</th>
                                    <th className="px-6 py-4 font-semibold">Müəllim</th>
                                    <th className="px-6 py-4 font-semibold">Vaxt</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {logs.slice(0, 100).map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-800 tracking-wider">
                                            {log.plate_number}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-700">
                                            {log.teacher?.full_name || "Naməlum"}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {log.entry_time ? new Date(log.entry_time).toLocaleString("az-AZ") : "-"}
                                        </td>
                                        <td className="px-6 py-4">
                                            {log.status === "success" ? (
                                                <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                                                    <span>Uğurlu</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                                                    <span>Uğursuz</span>
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {logs.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Bugün üçün log tapılmadı.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
