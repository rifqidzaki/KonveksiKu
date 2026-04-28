"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import {
  Type, Image as ImageIcon, Square, Circle, Undo2, Redo2,
  ZoomIn, ZoomOut, Save, Download, Trash2, ArrowLeft,
  Palette, Layers, Move, MousePointer, Loader2, CheckCircle
} from "lucide-react";

// We'll use the fabric namespace loaded via CDN for SSR compatibility
declare const fabric: any;

export default function EditorPage() {
  const router = useRouter();
  const { user, loadUser } = useAuthStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<any>(null);
  const [activeColor, setActiveColor] = useState("#FF6B35");
  const [activeTool, setActiveTool] = useState<string>("select");
  const [shirtColor, setShirtColor] = useState("#FFFFFF");
  const [canvasReady, setCanvasReady] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [designName, setDesignName] = useState("Desain Baru");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => { loadUser(); }, []);

  const shirtColors = [
    "#FFFFFF", "#000000", "#1a1a2e", "#e94560", "#0f3460",
    "#16213e", "#533483", "#2b2d42", "#8d99ae", "#ef233c",
    "#FF6B35", "#2d6a4f", "#fca311"
  ];

  const initCanvas = useCallback(() => {
    if (!canvasRef.current || typeof fabric === 'undefined') return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 500,
      height: 600,
      backgroundColor: "transparent",
      selection: true,
    });

    fabricRef.current = canvas;
    setCanvasReady(true);

    // Draw initial t-shirt outline
    drawShirt(canvas, shirtColor);

    // Save initial state
    saveHistory(canvas);

    canvas.on("object:modified", () => saveHistory(canvas));
    canvas.on("object:added", () => saveHistory(canvas));

    return () => {
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    // Load fabric.js from CDN
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js";
    script.onload = () => initCanvas();
    document.head.appendChild(script);

    return () => {
      if (fabricRef.current) fabricRef.current.dispose();
    };
  }, [initCanvas]);

  const drawShirt = (canvas: any, color: string) => {
    // Remove old shirt if exists
    const objects = canvas.getObjects();
    const oldShirt = objects.find((o: any) => o.name === "shirt-bg");
    if (oldShirt) canvas.remove(oldShirt);

    // Create T-shirt shape
    const shirtPath = new fabric.Path(
      "M 100 80 L 50 120 L 80 140 L 100 120 L 100 280 C 100 290 110 300 130 300 L 370 300 C 390 300 400 290 400 280 L 400 120 L 420 140 L 450 120 L 400 80 L 340 60 C 320 80 280 95 250 95 C 220 95 180 80 160 60 Z",
      {
        fill: color,
        stroke: "#cccccc",
        strokeWidth: 1,
        selectable: false,
        evented: false,
        name: "shirt-bg",
        shadow: new fabric.Shadow({ color: "rgba(0,0,0,0.3)", blur: 20, offsetX: 5, offsetY: 5 }),
      }
    );

    canvas.add(shirtPath);
    canvas.sendToBack(shirtPath);
    canvas.renderAll();
  };

  const saveHistory = (canvas: any) => {
    const json = JSON.stringify(canvas.toJSON(["name"]));
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(json);
      setHistoryIndex(newHistory.length - 1);
      return newHistory;
    });
  };

  const undo = () => {
    if (historyIndex <= 0 || !fabricRef.current) return;
    const newIndex = historyIndex - 1;
    fabricRef.current.loadFromJSON(history[newIndex], () => {
      fabricRef.current.renderAll();
      setHistoryIndex(newIndex);
    });
  };

  const redo = () => {
    if (historyIndex >= history.length - 1 || !fabricRef.current) return;
    const newIndex = historyIndex + 1;
    fabricRef.current.loadFromJSON(history[newIndex], () => {
      fabricRef.current.renderAll();
      setHistoryIndex(newIndex);
    });
  };

  const addText = () => {
    if (!fabricRef.current) return;
    const text = new fabric.IText("Ketik di sini", {
      left: 200,
      top: 180,
      fontSize: 24,
      fill: activeColor,
      fontFamily: "Arial",
      name: "user-element",
    });
    fabricRef.current.add(text);
    fabricRef.current.setActiveObject(text);
    text.enterEditing();
    fabricRef.current.renderAll();
  };

  const addRect = () => {
    if (!fabricRef.current) return;
    const rect = new fabric.Rect({
      left: 200,
      top: 180,
      width: 80,
      height: 80,
      fill: activeColor,
      name: "user-element",
    });
    fabricRef.current.add(rect);
    fabricRef.current.setActiveObject(rect);
    fabricRef.current.renderAll();
  };

  const addCircle = () => {
    if (!fabricRef.current) return;
    const circle = new fabric.Circle({
      left: 220,
      top: 180,
      radius: 40,
      fill: activeColor,
      name: "user-element",
    });
    fabricRef.current.add(circle);
    fabricRef.current.setActiveObject(circle);
    fabricRef.current.renderAll();
  };

  const addImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file || !fabricRef.current) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        fabric.Image.fromURL(evt.target?.result as string, (img: any) => {
          img.set({
            left: 180,
            top: 150,
            name: "user-element",
          });
          img.scaleToWidth(140);
          fabricRef.current.add(img);
          fabricRef.current.setActiveObject(img);
          fabricRef.current.renderAll();
        });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const deleteSelected = () => {
    if (!fabricRef.current) return;
    const active = fabricRef.current.getActiveObject();
    if (active && active.name !== "shirt-bg") {
      fabricRef.current.remove(active);
      fabricRef.current.renderAll();
    }
  };

  const changeShirtColor = (color: string) => {
    setShirtColor(color);
    if (fabricRef.current) {
      drawShirt(fabricRef.current, color);
    }
  };

  const exportDesign = () => {
    if (!fabricRef.current) return;
    const dataURL = fabricRef.current.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 2,
    });
    const link = document.createElement("a");
    link.download = `${designName}.png`;
    link.href = dataURL;
    link.click();
  };

  const saveDesign = async () => {
    if (!fabricRef.current) return;

    // Check if user is logged in
    if (!user) {
      router.push("/login");
      return;
    }

    setSaving(true);
    setSaveError("");
    setSaved(false);

    try {
      const canvasData = JSON.stringify(fabricRef.current.toJSON(["name"]));
      const previewUrl = fabricRef.current.toDataURL({
        format: "png",
        quality: 0.8,
        multiplier: 1,
      });

      await api.post("/api/designs", {
        name: designName,
        canvasData,
        previewUrl,
      });

      setSaved(true);
      toast.success("Desain berhasil disimpan!");
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      const msg = err.response?.data?.error || "Gagal menyimpan desain";
      toast.error(msg);
      // If unauthorized, redirect to login
      if (err.response?.status === 401) {
        router.push("/login");
        return;
      }
      setTimeout(() => setSaveError(""), 4000);
    } finally {
      setSaving(false);
    }
  };

  const colorPresets = [
    "#FF6B35", "#ef233c", "#fca311", "#2d6a4f",
    "#0077b6", "#7209b7", "#000000", "#FFFFFF",
  ];

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col">
      {/* Top Toolbar */}
      <header className="h-16 glass border-b border-white/10 flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition p-2 rounded-lg hover:bg-white/5">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <input
            type="text"
            value={designName}
            onChange={(e) => setDesignName(e.target.value)}
            className="bg-transparent text-white font-semibold text-lg border-none outline-none focus:bg-white/5 rounded-lg px-2 py-1 transition"
          />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={undo} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition" title="Undo">
            <Undo2 className="w-5 h-5" />
          </button>
          <button onClick={redo} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition" title="Redo">
            <Redo2 className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-white/10 mx-2" />
          <button onClick={exportDesign} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={saveDesign}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-coral text-white font-medium hover:opacity-90 transition shadow-lg shadow-coral-500/25 disabled:opacity-50"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
            ) : saved ? (
              <><CheckCircle className="w-4 h-4" /> Tersimpan!</>
            ) : (
              <><Save className="w-4 h-4" /> Simpan</>
            )}
          </button>
          {saveError && (
            <span className="text-red-400 text-xs ml-2">{saveError}</span>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Tool Panel */}
        <aside className="w-16 bg-navy-800 border-r border-white/10 flex flex-col items-center py-4 gap-2">
          {[
            { icon: MousePointer, tool: "select", label: "Select" },
            { icon: Type, tool: "text", label: "Text", action: addText },
            { icon: ImageIcon, tool: "image", label: "Image", action: addImage },
            { icon: Square, tool: "rect", label: "Rectangle", action: addRect },
            { icon: Circle, tool: "circle", label: "Circle", action: addCircle },
            { icon: Trash2, tool: "delete", label: "Delete", action: deleteSelected },
          ].map(({ icon: Icon, tool, label, action }) => (
            <button
              key={tool}
              onClick={() => { setActiveTool(tool); action?.(); }}
              className={`p-3 rounded-xl transition ${
                activeTool === tool
                  ? "bg-coral-500/20 text-coral-500"
                  : "text-gray-500 hover:text-white hover:bg-white/5"
              }`}
              title={label}
            >
              <Icon className="w-5 h-5" />
            </button>
          ))}
        </aside>

        {/* Canvas Area */}
        <div className="flex-1 flex items-center justify-center bg-navy-900 relative overflow-auto">
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "20px 20px"
          }} />
          <div className="relative bg-gray-100 rounded-2xl shadow-2xl p-8" style={{ boxShadow: "0 0 80px rgba(255,107,53,0.1)" }}>
            <canvas ref={canvasRef} id="design-canvas" />
          </div>
        </div>

        {/* Right Properties Panel */}
        <aside className="w-64 bg-navy-800 border-l border-white/10 p-4 overflow-y-auto">
          {/* Design Color */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-3">
              <Palette className="w-4 h-4" />
              Warna Elemen
            </div>
            <div className="grid grid-cols-4 gap-2">
              {colorPresets.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    setActiveColor(color);
                    if (fabricRef.current) {
                      const active = fabricRef.current.getActiveObject();
                      if (active && active.name !== "shirt-bg") {
                        active.set("fill", color);
                        fabricRef.current.renderAll();
                      }
                    }
                  }}
                  className={`w-10 h-10 rounded-lg border-2 transition ${
                    activeColor === color ? "border-white scale-110" : "border-transparent hover:border-white/30"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <input
              type="color"
              value={activeColor}
              onChange={(e) => setActiveColor(e.target.value)}
              className="w-full h-8 rounded-lg cursor-pointer mt-2 bg-transparent"
            />
          </div>

          {/* Shirt Color */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-3">
              <Layers className="w-4 h-4" />
              Warna Kaos
            </div>
            <div className="grid grid-cols-4 gap-2">
              {shirtColors.map((color) => (
                <button
                  key={color}
                  onClick={() => changeShirtColor(color)}
                  className={`w-10 h-10 rounded-lg border-2 transition ${
                    shirtColor === color ? "border-coral-500 scale-110" : "border-transparent hover:border-white/30"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="mt-8 p-4 rounded-xl bg-coral-500/5 border border-coral-500/10">
            <p className="text-coral-500 text-sm font-medium mb-2">💡 Tips</p>
            <ul className="text-gray-400 text-xs space-y-1">
              <li>• Klik objek untuk memilih</li>
              <li>• Drag untuk memindahkan</li>
              <li>• Gunakan handle untuk resize</li>
              <li>• Double-click text untuk edit</li>
              <li>• Tekan Delete untuk hapus</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
