"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Webcam from "react-webcam";
import { CheckCircle2, XCircle, Settings } from "lucide-react";
import Tesseract from "tesseract.js";

export default function CameraPage() {
  const webcamRef = useRef<Webcam>(null);
  const [debugText, setDebugText] = useState<string>("Gözlənilir...");
  const [isAutoScanning] = useState(true);

  // States for Real-Time Notification System
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' | null }>({ message: "", type: null });

  const autoScanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hideNotificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showNotification = useCallback((message: string, type: 'success' | 'error') => {
    // Eyni anda birdən çox bildiriş göstərilməməsi
    if (notification.type !== null) return;

    setNotification({ message, type });

    // Statusu reset et 3 saniyə sonra
    if (hideNotificationTimeoutRef.current) clearTimeout(hideNotificationTimeoutRef.current);
    hideNotificationTimeoutRef.current = setTimeout(() => {
      setNotification({ message: "", type: null });
    }, 3000);
  }, [notification.type]);

  const handleScan = useCallback(async (isSilent = false) => {
    if (!webcamRef.current) return;

    // Capture screenshot in base64
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    try {
      // Preprocess image to improve OCR before converting to Blob
      const img = new Image();
      img.src = imageSrc;
      await new Promise((resolve) => (img.onload = resolve));

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      const roiW = Math.floor(canvas.width * 0.6);
      const roiH = Math.floor(canvas.height * 0.4);
      const roiX = Math.floor((canvas.width - roiW) / 2);
      const roiY = Math.floor((canvas.height - roiH) / 2);
      const roi = ctx.getImageData(roiX, roiY, roiW, roiH);
      const d = roi.data;
      for (let i = 0; i < d.length; i += 4) {
        const avg = (d[i] + d[i + 1] + d[i + 2]) / 3;
        const color = avg > 120 ? 255 : 0;
        d[i] = d[i + 1] = d[i + 2] = color;
      }
      const roiCanvas = document.createElement("canvas");
      roiCanvas.width = roiW;
      roiCanvas.height = roiH;
      const roiCtx = roiCanvas.getContext("2d");
      if (!roiCtx) return;
      roiCtx.putImageData(roi, 0, 0);
      const worker = await Tesseract.createWorker("eng", 1, { logger: () => { } });
      await worker.setParameters({ tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789- " });
      const { data: { text } } = await worker.recognize(roiCanvas);
      await worker.terminate();
      const plateText = text || "";
      setDebugText(plateText || "Heç nə oxunmadı");
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: plateText }),
      });

      const backendData = await res.json();

      // ANPR Qaydalara Uyğun Pop-up Bildiriş Sistemi
      if (backendData.message === "Uğurlu: Giriş icazəsi verildi") {
        const name = backendData.teacher ? ` — ${backendData.teacher}` : "";
        const carDetails = backendData.carModelBrand ? ` — ${backendData.carModelBrand}` : "";
        showNotification(backendData.message + name + carDetails, 'success');
      }
      else if (backendData.message === "Xəta: Giriş icazəsi yoxdur" || backendData.message === "Xəta: Avtomobil və ya nömrə aşkar olunmadı") {
        showNotification(backendData.message, 'error');
      }

    } catch {
    }
  }, [webcamRef, showNotification]);

  // Auto-scan effect
  useEffect(() => {
    if (isAutoScanning) {
      autoScanIntervalRef.current = setInterval(() => {
        handleScan(true); // silent auto-scan
      }, 2000); // 2 saniyədən bir yoxla ki kompüter donmasın
    } else {
      if (autoScanIntervalRef.current) clearInterval(autoScanIntervalRef.current);
    }

    return () => {
      if (autoScanIntervalRef.current) clearInterval(autoScanIntervalRef.current);
    };
  }, [isAutoScanning, handleScan]);

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center font-sans">
      <div className="w-full p-6 flex justify-end relative z-[9999] pointer-events-auto mt-4 px-8">
        <Link href="/admin/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-xl cursor-pointer transition-all flex items-center gap-2">
          <Settings className="w-5 h-5" /> Admin Panel
        </Link>
      </div>

      <div className="flex-1 w-full max-w-4xl p-6 flex flex-col items-center justify-start space-y-8 mt-[-20px] relative">

        {/* Real-time Alert Notification */}
        {notification.type && (
          <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-xl shadow-2xl transition-all animate-in slide-in-from-top-4 flex items-center gap-3 border-2 ${notification.type === 'success' ? 'bg-green-600 border-green-400 text-white' : 'bg-red-600 border-red-400 text-white'}`}>
            {notification.type === 'success' ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
            <p className="text-xl font-bold tracking-wide">{notification.message}</p>
          </div>
        )}

        <div className="text-center space-y-2 mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
            Naxçıvan Dövlət Universiteti Nəqliyyat Sistemi
          </h1>
          <p className="text-slate-400 text-sm md:text-base">
            Nəqliyyat Vasitələrinin Giriş-Çıxış Yoxlanışı
          </p>
        </div>

        <div className={`relative w-full aspect-video bg-[#1e293b] rounded-xl overflow-hidden shadow-2xl border-2 transition-colors duration-300 max-w-3xl pointer-events-none ${notification.type === 'error' ? 'border-red-500/80 shadow-red-500/20' : notification.type === 'success' ? 'border-green-500/80 shadow-green-500/20' : 'border-slate-700 ring-1 ring-blue-500/20'}`}>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              facingMode: "environment"
            }}
            className="w-full h-full object-cover pointer-events-auto"
          />
          {/* Faint box inside video area similar to the screenshot */}
          <div className={`absolute inset-4 border max-w-[95%] mx-auto rounded-lg pointer-events-none transition-colors duration-300 ${notification.type === 'error' ? 'border-red-500/50' : notification.type === 'success' ? 'border-green-500/50' : 'border-blue-500/30'}`}></div>
        </div>

        <div className="flex flex-col items-center gap-2 mt-4">
          <div className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium ${isAutoScanning ? 'bg-green-600/20 text-green-400 border border-green-500/30' : 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/30'}`}>
            <div className={`w-2.5 h-2.5 rounded-full ${isAutoScanning ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
            {isAutoScanning ? "Avtomatik İzləmə Aktivdir..." : "Nəticə Göstərilir (Gözləyin)"}
          </div>
          <div className="text-xs text-slate-500 font-mono bg-slate-800/50 px-3 py-1 rounded max-w-sm truncate text-center">
            Son Oxunan: <span className="text-slate-300">{debugText}</span>
          </div>
        </div>

        {/* Removed static large card box, relying fully on the alert popups as requested */}
      </div>

      <div className="absolute bottom-6 left-6">
        <div className="w-10 h-10 bg-black rounded-full text-white flex items-center justify-center font-bold text-lg border border-slate-800">
          N
        </div>
      </div>
    </div>
  );
}
