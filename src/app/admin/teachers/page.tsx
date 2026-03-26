"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, Upload, Download } from "lucide-react";

export default function TeachersPage() {
    const [teachers, setTeachers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [fullName, setFullName] = useState("");
    const [plateNumber, setPlateNumber] = useState("");
    const [carModelBrand, setCarModelBrand] = useState("");
    const [formError, setFormError] = useState("");

    // Edit state
    const [editId, setEditId] = useState<string | null>(null);
    const [editFullName, setEditFullName] = useState("");
    const [editPlateNumber, setEditPlateNumber] = useState("");
    const [editCarModelBrand, setEditCarModelBrand] = useState("");

    const fetchTeachers = async () => {
        try {
            const res = await fetch("/api/teachers");
            if (res.ok) {
                setTeachers(await res.json());
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    const handleAddTeacher = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");

        const res = await fetch("/api/teachers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ full_name: fullName, plate_number: plateNumber, car_model_brand: carModelBrand }),
        });

        if (res.ok) {
            setFullName("");
            setPlateNumber("");
            setCarModelBrand("");
            setShowForm(false);
            fetchTeachers();
        } else {
            const data = await res.json();
            setFormError(data.error || "Müəllim əlavə edilə bilmədi");
        }
    };

    const handleEditSave = async (id: string) => {
        const res = await fetch(`/api/teachers/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ full_name: editFullName, plate_number: editPlateNumber, car_model_brand: editCarModelBrand }),
        });
        if (res.ok) {
            setEditId(null);
            fetchTeachers();
        } else {
            alert("Məlumatı yeniləmək mümkün olmadı");
        }
    };

    const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        setLoading(true);
        const res = await fetch("/api/teachers/import", {
            method: "POST",
            body: formData,
        });

        if (res.ok) {
            alert("Müəllimlər uğurla əlavə edildi");
            fetchTeachers();
        } else {
            alert("Excel yüklənərkən xəta baş verdi");
            setLoading(false);
        }
    };

    const toggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === "active" ? "inactive" : "active";
        await fetch(`/api/teachers/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
        });
        fetchTeachers();
    };

    const handleDelete = async (id: string) => {
        if (confirm("Silmək istədiyinizə əminsiniz?")) {
            await fetch(`/api/teachers/${id}`, { method: "DELETE" });
            fetchTeachers();
        }
    };

    return (
        <div className="space-y-6 font-sans">
            {/* Dark Header Card */}
            <div className="bg-[#1e293b] rounded-xl shadow-lg border border-slate-700 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Müəllimlərin İdarə Paneli</h1>
                    <p className="text-slate-400 text-sm">Sistemdə qeydiyyatdan keçmiş bütün müəllimlərin siyahısı və idarəsi.</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <label className="flex items-center space-x-2 bg-transparent border border-slate-600 hover:bg-slate-700 text-slate-300 px-5 py-2.5 rounded-lg transition-colors cursor-pointer text-sm font-medium">
                        <Upload className="w-4 h-4" />
                        <span>Excel Yüklə (Import)</span>
                        <input type="file" className="hidden" accept=".xlsx,.xls" onChange={handleImportExcel} />
                    </label>
                    <button
                        onClick={() => { window.location.href = "/api/teachers/export"; }}
                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg transition-colors shadow-sm text-sm font-medium"
                    >
                        <Download className="w-4 h-4" />
                        <span>Excel Çıxarış (Export)</span>
                    </button>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-colors shadow-sm text-sm font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        <span>{showForm ? "Ləğv Et" : "Yeni Müəllim"}</span>
                    </button>
                </div>
            </div>

            {/* Add/Edit Form inside its own dark card if toggled */}
            {showForm && (
                <div className="bg-[#1e293b] p-6 rounded-xl shadow-lg border border-slate-700">
                    <h2 className="text-lg font-semibold text-white mb-4">Yeni Müəllim / Maşın</h2>
                    {formError && <div className="text-red-400 mb-4 text-sm bg-red-900/20 p-3 rounded">{formError}</div>}
                    <form onSubmit={handleAddTeacher} className="flex flex-col md:flex-row gap-4 md:items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-300 mb-1">Ad Soyad</label>
                            <input
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-[#0f172a] border border-slate-600 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                placeholder="Məsələn: Əli Əliyev"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-300 mb-1">Maşın Nömrəsi</label>
                            <input
                                type="text"
                                required
                                value={plateNumber}
                                onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                                className="w-full bg-[#0f172a] border border-slate-600 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none uppercase"
                                placeholder="Məsələn: 99-XX-999"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-300 mb-1">Model / Marka</label>
                            <input
                                type="text"
                                value={carModelBrand}
                                onChange={(e) => setCarModelBrand(e.target.value)}
                                className="w-full bg-[#0f172a] border border-slate-600 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                placeholder="Məsələn: Toyota Prius"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg transition-colors font-medium h-fit"
                        >
                            Yadda Saxla
                        </button>
                    </form>
                </div>
            )}

            {/* Dark Table */}
            <div className="bg-[#1e293b] rounded-xl shadow-lg border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-[#0f172a]/50 text-slate-400 font-bold border-b border-slate-700 text-xs tracking-wider">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">AD SOYAD</th>
                                <th className="px-6 py-4">AVTOMOBIL NÖMRƏSİ</th>
                                <th className="px-6 py-4">MODEL / MARKA</th>
                                <th className="px-6 py-4">STATUS</th>
                                <th className="px-6 py-4 text-right">ƏMƏLİYYATLAR</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Yüklənir...</td>
                                </tr>
                            ) : teachers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Məlumat tapılmadı.</td>
                                </tr>
                            ) : (
                                teachers.map((teacher, index) => (
                                    <tr key={teacher.id} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-slate-500">#{index + 1}</td>

                                        {editId === teacher.id ? (
                                            <>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="text"
                                                        value={editFullName}
                                                        onChange={(e) => setEditFullName(e.target.value)}
                                                        className="w-full bg-[#0f172a] border border-slate-600 rounded px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none text-white font-medium"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="text"
                                                        value={editPlateNumber}
                                                        onChange={(e) => setEditPlateNumber(e.target.value.toUpperCase())}
                                                        className="w-full bg-[#0f172a] border border-slate-600 rounded px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none font-mono tracking-wider text-white uppercase"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="text"
                                                        value={editCarModelBrand}
                                                        onChange={(e) => setEditCarModelBrand(e.target.value)}
                                                        className="w-full bg-[#0f172a] border border-slate-600 rounded px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none text-white"
                                                    />
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-6 py-4 font-bold text-white">{teacher.full_name}</td>
                                                <td className="px-6 py-4">
                                                    <span className="font-mono bg-[#0f172a] border border-slate-700 px-3 py-1 rounded text-slate-300 font-bold tracking-wider">{teacher.plate_number}</span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-300 font-medium">{teacher.car_model_brand || "-"}</td>
                                            </>
                                        )}

                                        <td className="px-6 py-4 flex items-center h-full">
                                            <button
                                                onClick={() => toggleStatus(teacher.id, teacher.status)}
                                                className={`px-3 py-1 rounded-full text-xs font-bold border ${teacher.status === "active"
                                                    ? "bg-green-900/30 text-green-400 border-green-800"
                                                    : "bg-red-900/30 text-red-400 border-red-800"
                                                    }`}
                                            >
                                                {teacher.status === "active" ? "AKTİV" : "PASSİV"}
                                            </button>
                                        </td>

                                        <td className="px-6 py-4 text-right space-x-2">
                                            {editId === teacher.id ? (
                                                <>
                                                    <button onClick={() => handleEditSave(teacher.id)} className="text-green-400 hover:bg-green-900/30 px-3 py-1.5 rounded-lg font-medium text-xs border border-green-800">Yadda Saxla</button>
                                                    <button onClick={() => setEditId(null)} className="text-slate-400 hover:bg-slate-700 px-3 py-1.5 rounded-lg font-medium text-xs border border-slate-600">İmtina</button>
                                                </>
                                            ) : (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditId(teacher.id);
                                                            setEditFullName(teacher.full_name);
                                                            setEditPlateNumber(teacher.plate_number);
                                                            setEditCarModelBrand(teacher.car_model_brand || "");
                                                        }}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-blue-900/20 text-blue-400 border border-blue-800 hover:bg-blue-900/40 transition-colors"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" /> Redaktə
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(teacher.id)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-red-900/20 text-red-400 border border-red-800 hover:bg-red-900/40 transition-colors"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" /> Sil
                                                    </button>
                                                </div>
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
