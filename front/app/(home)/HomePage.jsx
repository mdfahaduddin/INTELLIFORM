"use client";
import { useState, useRef, useEffect } from "react";
import {
  Upload,
  FileText,
  File,
  Loader2,
  Sparkles,
  FileJson,
  Zap,
  Shield,
  Cpu,
  ArrowRight,
  Github,
  Table2,
} from "lucide-react";
import BackToTopButton from "@/components/BackToTopButton";
import Link from "next/link";

export default function HomePage() {
  const [file, setFile] = useState(null);
  const [exportType, setExportType] = useState("json");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef(null);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://intelliformbackend.onrender.com";

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setResult(null);
    setError(null);

    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("exportType", exportType);

    try {
      const response = await fetch(`${API_URL}/api/parse`, {
        method: "POST",
        body: formData,
      });

      if (exportType === "excel") {
        if (!response.ok) {
          const errorData = await response.json();

          if (response.status === 429 || errorData.isRateLimit) {
            setError("⏰ Rate limit reached! All API keys are temporarily exhausted. Please wait a few minutes and try again.");
          } else {
            setError(errorData.error || "Failed to generate Excel file");
          }
          return;
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "extracted-data.xlsx";
        link.click();
        window.URL.revokeObjectURL(url);
        setResult({ message: "Excel file downloaded successfully!" });
      } else if (exportType === "word") {
        if (!response.ok) {
          const errorData = await response.json();

          if (response.status === 429 || errorData.isRateLimit) {
            setError("⏰ Rate limit reached! All API keys are temporarily exhausted. Please wait a few minutes and try again.");
          } else {
            setError(errorData.error || "Failed to generate Word file");
          }
          return;
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "extracted-data.docx";
        link.click();
        window.URL.revokeObjectURL(url);
        setResult({ message: "Word file downloaded successfully!" });
      } else {
        const data = await response.json();

        if (response.status === 429 || data.isRateLimit) {
          setError("⏰ Rate limit reached! All API keys are temporarily exhausted. Please wait a few minutes and try again.");
          return;
        }

        if (data.success) {
          setResult(data.data);
          const dataStr = JSON.stringify(data.data, null, 2);
          const dataBlob = new Blob([dataStr], { type: "application/json" });
          const url = URL.createObjectURL(dataBlob);
          const link = document.createElement("a");
          link.href = url;
          link.download = "extracted-data.json";
          link.click();
          URL.revokeObjectURL(url);
        } else {
          setError(data.error || "Failed to parse file");
        }
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = () => {
    if (!file) return <Upload className="w-12 h-12" />;
    if (file.type === "application/pdf")
      return <FileText className="w-12 h-12 text-red-500" />;
    if (file.type.startsWith("image/"))
      return (
        <svg
          className="w-12 h-12 text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      );
    return <File className="w-12 h-12 text-gray-500" />;
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[800px] h-[800px] rounded-full opacity-20 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(99,102,241,1) 0%, transparent 80%)",
            left: `${mousePosition.x - 400}px`,
            top: `${mousePosition.y - 400}px`,
            transition: "left 0.3s ease-out, top 0.3s ease-out",
          }}
        />
        <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-purple-900/10 via-transparent to-blue-900/10" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(99,102,241,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.1) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/10 backdrop-blur-xl bg-black/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <img src="/logo/IntelliFormLogo.png" alt="Logo" className="w-40" />
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://github.com/mdfahaduddin/INTELLIFORM" target="_blank" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 pt-20 pb-12 relative z-10">
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-linear-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 px-4 py-2 rounded-full text-sm font-medium mt-6 mb-2 backdrop-blur-sm">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Powered by Advanced AI
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-2 ">
            <span className="bg-linear-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
              Transform
            </span>
            <br />
            <span className="bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
              Documents to Data
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Extract structured JSON, Excel & Word from any document using cutting-edge AI and
            OCR technology.
            <br/>
            <span className="text-indigo-400"> Lightning fast.</span>
            <span className="text-purple-400"> Incredibly accurate.</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto mb-12">
            <div className="bg-linear-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6 backdrop-blur-sm">
              <div className="text-2xl font-bold bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-1">
                99%
              </div>
              <div className="text-sm text-gray-400">Accuracy</div>
            </div>
            <div className="bg-linear-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-sm">
              <div className="text-2xl font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">
                &lt;10s
              </div>
              <div className="text-sm text-gray-400">Processing</div>
            </div>
            <div className="bg-linear-to-br from-pink-500/10 to-red-500/10 border border-pink-500/20 rounded-2xl p-6 backdrop-blur-sm">
              <div className="text-2xl font-bold bg-linear-to-r from-pink-400 to-red-400 bg-clip-text text-transparent mb-1">
                3
              </div>
              <div className="text-sm text-gray-400">Formats</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 max-w-7xl mx-auto">
          <div className="space-y-4">
            <div className="bg-linear-to-br from-white/5 to-white/2 backdrop-blur-2xl rounded-3xl border border-white/10 p-4 shadow-2xl relative overflow-hidden group h-full">
              <div className="absolute inset-0 bg-linear-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/50">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold">Upload Document</h2>
                </div>

                <div
                  className={`relative border-2 border-dashed rounded-2xl p-6 transition-all duration-300 ${dragActive
                    ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/20"
                    : "border-white/20 bg-white/5 hover:border-indigo-500/50 hover:bg-white/10"
                    }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {error && <p className="text-red-500 mb-2 text-center">{error}</p>}
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                    className="hidden"
                  />

                  {!file ? (
                    <div className="text-center">
                      <div className="flex justify-center mb-6">
                        <div className="relative">
                          <div className="absolute inset-0 bg-linear-to-r from-indigo-500 to-purple-600 rounded-full blur-xl opacity-50 animate-pulse" />
                          <div className="relative bg-linear-to-br from-indigo-500 to-purple-600 p-6 rounded-full shadow-xl">
                            <Upload className="w-10 h-10" />
                          </div>
                        </div>
                      </div>
                      <p className="text-xl font-semibold mb-3">
                        Drop your file here
                      </p>
                      <p className="text-gray-400 mb-6">or</p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="group relative px-8 py-4 bg-linear-to-r from-indigo-600 to-purple-600 rounded-xl font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all duration-200 shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/40 hover:scale-105"
                      >
                        <span className="flex items-center gap-2">
                          Browse Files
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </button>
                      <p className="text-md text-gray-500 mt-4 font-bold">PDF • IMAGES</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      {preview ? (
                        <div className="relative mb-6">
                          <div className="absolute inset-0 bg-linear-to-r from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-30" />
                          <img
                            src={preview}
                            alt="Preview"
                            className="relative max-h-48 mx-auto rounded-2xl shadow-2xl border border-white/20"
                          />
                        </div>
                      ) : (
                        <div className="flex justify-center mb-6">
                          <div className="relative">
                            <div className="absolute inset-0 bg-linear-to-r from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-50" />
                            <div className="relative bg-linear-to-br from-white/10 to-white/5 p-6 rounded-2xl border border-white/20">
                              {getFileIcon()}
                            </div>
                          </div>
                        </div>
                      )}
                      <p className="font-semibold text-lg mb-2 truncate block w-full">{file.name}</p>
                      <p className="text-sm text-gray-400 mb-6">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                      <div className="mb-6 max-w-md mx-auto">
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Choose Export Format
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <button
                            onClick={() => setExportType("json")}
                            className={`px-4 py-3 rounded-xl transition-all duration-200 font-medium ${exportType === "json"
                              ? "bg-teal-500 text-white border-2 border-teal-500 shadow-lg shadow-teal-500/50"
                              : "bg-white/10 text-gray-300 border-2 border-white/10 hover:bg-white/20 hover:border-white/20"
                              }`}
                          >
                            <FileJson className="w-5 h-5 mx-auto mb-1" />
                            <span className="text-xs">JSON</span>
                          </button>
                          <button
                            onClick={() => setExportType("excel")}
                            className={`px-4 py-3 rounded-xl transition-all duration-200 font-medium ${exportType === "excel"
                              ? "bg-green-600 text-white border-2 border-green-500 shadow-lg shadow-green-500/50"
                              : "bg-white/10 text-gray-300 border-2 border-white/10 hover:bg-white/20 hover:border-white/20"
                              }`}
                          >
                            <Table2 className="w-5 h-5 mx-auto mb-1" />
                            <span className="text-xs">Excel</span>
                          </button>
                          <button
                            onClick={() => setExportType("word")}
                            className={`px-4 py-3 rounded-xl transition-all duration-200 font-medium ${exportType === "word"
                              ? "bg-blue-600 text-white border-2 border-blue-500 shadow-lg shadow-blue-500/50"
                              : "bg-white/10 text-gray-300 border-2 border-white/10 hover:bg-white/20 hover:border-white/20"
                              }`}
                          >
                            <FileText className="w-5 h-5 mx-auto mb-1" />
                            <span className="text-xs">Word</span>
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                          onClick={reset}
                          className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 border border-white/10"
                        >
                          Remove
                        </button>
                        <button
                          onClick={handleUpload}
                          disabled={loading}
                          className="group relative px-8 py-3 bg-linear-to-r from-indigo-600 to-purple-600 rounded-xl font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all duration-200 shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100"
                        >
                          {loading ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Processing...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <Sparkles className="w-5 h-5" />
                              Parse with AI
                              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 mt-8">
                  <div className="group bg-linear-to-br from-blue-500/10 to-blue-600/10 hover:from-blue-500/20 hover:to-blue-600/20 border border-blue-500/20 rounded-2xl p-4 text-center transition-all duration-300 hover:scale-105 cursor-pointer">
                    <FileText className="w-8 h-8 text-blue-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-semibold text-blue-300">
                      PDF Extract
                    </p>
                  </div>
                  <div className="group bg-linear-to-br from-purple-500/10 to-purple-600/10 hover:from-purple-500/20 hover:to-purple-600/20 border border-purple-500/20 rounded-2xl p-4 text-center transition-all duration-300 hover:scale-105 cursor-pointer">
                    <svg
                      className="w-8 h-8 text-purple-400 mx-auto mb-3 group-hover:scale-110 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-xs font-semibold text-purple-300">
                      Image OCR
                    </p>
                  </div>
                  <div className="group bg-linear-to-br from-pink-500/10 to-pink-600/10 hover:from-pink-500/20 hover:to-pink-600/20 border border-pink-500/20 rounded-2xl p-4 text-center transition-all duration-300 hover:scale-105 cursor-pointer">
                    <Cpu className="w-8 h-8 text-pink-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-semibold text-pink-300">
                      AI Parse
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto mt-16">
          <div className="group bg-linear-to-br from-white/5 to-white/2 backdrop-blur-2xl rounded-2xl border border-white/10 p-8 hover:border-indigo-500/50 transition-all duration-300 hover:scale-105">
            <div className="w-14 h-14 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/50 group-hover:scale-110 transition-transform">
              <Zap className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold mb-3">Lightning Fast</h3>
            <p className="text-gray-400">
              Process documents in seconds with our optimized AI pipeline
            </p>
          </div>
          <div className="group bg-linear-to-br from-white/5 to-white/2 backdrop-blur-2xl rounded-2xl border border-white/10 p-8 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
            <div className="w-14 h-14 bg-linear-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/50 group-hover:scale-110 transition-transform">
              <Shield className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold mb-3">Secure & Private</h3>
            <p className="text-gray-400">
              Your data is processed securely and never stored permanently
            </p>
          </div>
          <div className="group bg-linear-to-br from-white/5 to-white/2 backdrop-blur-2xl rounded-2xl border border-white/10 p-8 hover:border-pink-500/50 transition-all duration-300 hover:scale-105">
            <div className="w-14 h-14 bg-linear-to-br from-pink-500 to-red-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-pink-500/50 group-hover:scale-110 transition-transform">
              <Cpu className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold mb-3">AI Powered</h3>
            <p className="text-gray-400">
              Advanced machine learning for accurate data extraction
            </p>
          </div>
        </div>

        <div className="text-center mt-20 pb-8">
          <p className="text-white text-lg font-bold">Created by Md. Fahad Uddin</p>
        </div>
      </div>
      <BackToTopButton />
    </div>
  );
}