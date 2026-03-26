"use client";

import { useEffect, useState } from "react";
import { Download, CheckCircle2, XCircle, Calendar, AlertTriangle, Search, FilterX } from "lucide-react";

export default function LogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [dateFilter, setDateFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [searchFilter, setSearchFilter] = useState("");

    // Stats
    const [stats, setStats] = useState({
        daily: { success: 0, failed: 0, total: 0 },
        monthly: { success: 0, failed: 0, total: 0 }
    });

    const fetchData = async (date?: string) => {
        setLoading(true);
        try {
            const logsUrl = date ? `/api/logs?date=${date}` : "/api/logs";
            const [logsRes, statsRes] = await Promise.all([
                fetch(logsUrl),
                fetch("/api/stats")
            ]);

            if (logsRes.ok) {
                const data = await logsRes.json();
                setLogs(data);
                applyFilters(data, statusFilter, searchFilter);
            }
            if (statsRes.ok) {
                setStats(await statsRes.json());
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const applyFilters = (data: any[], status: string, search: string) => {
        let result = [...data];
        if (status) {
            result = result.filter(l => l.status === status);
        }
        if (search) {
            const query = search.toUpperCase();
            result = result.filter(l =>
                l.plate_number?.includes(query) ||
                l.teacher?.full_name?.toUpperCase().includes(query)
            );
        }
        setFilteredLogs(result);
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        setDateFilter(newDate);
        fetchData(newDate);
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        setStatusFilter(newStatus);
        applyFilters(logs, newStatus, searchFilter);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSearch = e.target.value;
        setSearchFilter(newSearch);
        applyFilters(logs, statusFilter, newSearch);
    };

    const handleClearFilters = () => {
        setDateFilter("");
        setStatusFilter("");
        setSearchFilter("");
        fetchData("");
    };

    const handleExport = () => {
        window.location.href = "/api/logs/export";
    };

    return (
        <div className="space-y-6 font-sans">
            {/* Header Card */}
            <div className="bg-[#1e293b] rounded-xl shadow-lg border border-slate-700 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Giriş Logları və Statistika</h1>
                    <p className="text-slate-400 text-sm">Sistemin qeydə aldığı bütün girişlər, rədd edilənlər və qrafiklər.</p>
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg transition-colors shadow-sm text-sm font-medium"
                >
                    <Download className="w-4 h-4" />
                    <span>Excel Çıxarış</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-700 flex justify-between items-center shadow-lg">
                    <div>
                        <p className="text-sm font-medium text-slate-400 mb-1">Bu Gün (Uğurlu)</p>
                        <p className="text-2xl font-bold text-white flex items-baseline gap-1">
                            {stats.daily.success} <span className="text-xs text-slate-500 font-normal">nəfər</span>
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-full border border-green-900 bg-green-900/20 flex items-center justify-center text-green-500 shadow-inner">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-700 flex justify-between items-center shadow-lg">
                    <div>
                        <p className="text-sm font-medium text-slate-400 mb-1">Bu Gün (Rədd)</p>
                        <p className="text-2xl font-bold text-white flex items-baseline gap-1">
                            {stats.daily.failed} <span className="text-xs text-slate-500 font-normal">nəfər</span>
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-full border border-red-900 bg-red-900/20 flex items-center justify-center text-red-500 shadow-inner">
                        <XCircle className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-700 flex justify-between items-center shadow-lg">
                    <div>
                        <p className="text-sm font-medium text-slate-400 mb-1">Bu Ay (Uğurlu Cəmi)</p>
                        <p className="text-2xl font-bold text-white">
                            {stats.monthly.success}
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-full border border-blue-900 bg-blue-900/20 flex items-center justify-center text-blue-500 shadow-inner">
                        <Calendar className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-700 flex justify-between items-center shadow-lg">
                    <div>
                        <p className="text-sm font-medium text-slate-400 mb-1">Bu Ay (Rədd Cəmi)</p>
                        <p className="text-2xl font-bold text-white">
                            {stats.monthly.failed}
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-full border border-yellow-900 bg-yellow-900/20 flex items-center justify-center text-yellow-500 shadow-inner">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Filters Row */}
            <div className="bg-[#1e293b] p-4 rounded-xl shadow-lg border border-slate-700 flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Tarixə görə</label>
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={handleDateChange}
                        className="w-full bg-[#0f172a] border border-slate-600 text-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                </div>
                <div className="flex-1 w-full">
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Statusa görə</label>
                    <select
                        value={statusFilter}
                        onChange={handleStatusChange}
                        className="w-full bg-[#0f172a] border border-slate-600 text-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm appearance-none"
                    >
                        <option value="">Bütün Nəticələr</option>
                        <option value="success">Uğurlu (Təsdiqləndi)</option>
                        <option value="failed">Uğursuz (Rədd edildi)</option>
                    </select>
                </div>
                <div className="flex-[1.5] w-full">
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Nömrəyə görə (Axtar)</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-500" />
                        </div>
                        <input
                            type="text"
                            value={searchFilter}
                            onChange={handleSearchChange}
                            placeholder="MƏS: 99 AA 999"
                            className="w-full bg-[#0f172a] border border-slate-600 text-slate-200 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        />
                    </div>
                </div>
                <button
                    onClick={handleClearFilters}
                    className="flex items-center justify-center space-x-2 bg-transparent hover:bg-slate-700 text-slate-300 border border-slate-600 px-5 py-2.5 rounded-lg transition-colors shadow-sm text-sm font-medium w-full md:w-auto h-[42px]"
                >
                    <FilterX className="w-4 h-4" />
                    <span>Təmizlə</span>
                </button>
            </div>

            {/* Dark Table */}
            <div className="bg-[#1e293b] rounded-xl shadow-lg border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-[#0f172a]/50 text-slate-400 font-bold border-b border-slate-700 text-xs tracking-wider">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">NÖMRƏ</th>
                                <th className="px-6 py-4">MÜƏLLİM</th>
                                <th className="px-6 py-4">TARİX</th>
                                <th className="px-6 py-4">GİRİŞ VAXTI</th>
                                <th className="px-6 py-4">ÇIXIŞ VAXTI</th>
                                <th className="px-6 py-4">STATUS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Yüklənir...</td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Məlumat tapılmadı.</td>
                                </tr>
                            ) : (
                                filteredLogs.map((log, index) => (
                                    <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-slate-500">#{index + 1}</td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono bg-[#0f172a] border border-slate-700 px-3 py-1 rounded text-slate-300 font-bold tracking-wider">{log.plate_number}</span>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-white">
                                            {log.teacher?.full_name || "Naməlum"}
                                        </td>
                                        <td className="px-6 py-4 text-slate-400">
                                            {new Date(log.date).toLocaleDateString("az-AZ").replace(/\./g, " ")}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-300">
                                            {log.entry_time ? new Date(log.entry_time).toLocaleTimeString("az-AZ") : "-"}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-400">
                                            {log.exit_time ? new Date(log.exit_time).toLocaleTimeString("az-AZ") : "-"}
                                        </td>
                                        <td className="px-6 py-4">
                                            {log.status === "success" ? (
                                                <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold border bg-green-900/20 text-green-400 border-green-800">
                                                    <span>TƏSDİQLƏNDİ</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold border bg-red-900/20 text-red-400 border-red-800">
                                                    <span>RƏDD EDİLDİ</span>
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
