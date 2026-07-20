import React, { useState, useEffect, useRef } from "react";
import { 
  FileCode, 
  Image as ImageIcon, 
  FileText, 
  Download, 
  Trash2, 
  UploadCloud, 
  Copy, 
  Check, 
  AlertCircle,
  Loader2,
  FolderOpen,
  Lock,
  Unlock,
  Smartphone
} from "lucide-react";

interface Asset {
  name: string;
  size: number;
  type: string;
  url: string;
  updatedAt: string;
}

interface ArticleAssetsWidgetProps {
  postSlug: string;
  themeColor: string;
  isDark: boolean;
}

export function ArticleAssetsWidget({ postSlug, themeColor, isDark }: ArticleAssetsWidgetProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [deletingName, setDeletingName] = useState<string | null>(null);
  const [isAuthorMode, setIsAuthorMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch assets list from server
  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postSlug}/assets`);
      if (res.ok) {
        const data = await res.json();
        setAssets(data);
      }
    } catch (err) {
      console.error("Error fetching assets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [postSlug]);

  // Format file size helper
  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Copy to clipboard helper
  const copyToClipboard = (asset: Asset, index: number) => {
    const isImg = asset.type === "image";
    const markdownCode = isImg 
      ? `![${asset.name}](${asset.url})` 
      : `[${asset.name}](${asset.url})`;
    
    navigator.clipboard.writeText(markdownCode).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  // File upload helper (Base64 uploader)
  const uploadFile = (file: File) => {
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Content = (reader.result as string).split(",")[1];
        const response = await fetch(`/api/posts/${postSlug}/assets`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            content: base64Content
          })
        });

        if (response.ok) {
          fetchAssets();
        } else {
          const errData = await response.json();
          alert(`Upload failed: ${errData.error || "Unknown error"}`);
        }
      } catch (err) {
        console.error("Upload error:", err);
        alert("Upload failed due to a network or server error.");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  // Delete handler
  const handleDelete = async (filename: string) => {
    try {
      const res = await fetch(`/api/posts/${postSlug}/assets/${filename}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setAssets(prev => prev.filter(a => a.name !== filename));
        setDeletingName(null);
      }
    } catch (err) {
      console.error("Error deleting asset:", err);
    }
  };

  const selectColorClasses = () => {
    const norm = (themeColor || "crimson").toLowerCase();
    switch (norm) {
      case "emerald":
        return { text: "text-emerald-500", border: "border-emerald-500/20", bg: "bg-emerald-500/10", hoverBg: "hover:bg-emerald-500/20" };
      case "cyan":
        return { text: "text-cyan-500", border: "border-cyan-500/20", bg: "bg-cyan-500/10", hoverBg: "hover:bg-cyan-500/20" };
      case "amber":
        return { text: "text-amber-500", border: "border-amber-500/20", bg: "bg-amber-500/10", hoverBg: "hover:bg-amber-500/20" };
      case "violet":
        return { text: "text-violet-500", border: "border-violet-500/20", bg: "bg-violet-500/10", hoverBg: "hover:bg-violet-500/20" };
      case "indigo":
        return { text: "text-indigo-500", border: "border-indigo-500/20", bg: "bg-indigo-500/10", hoverBg: "hover:bg-indigo-500/20" };
      case "slate":
        return { text: "text-slate-400", border: "border-slate-500/20", bg: "bg-slate-500/10", hoverBg: "hover:bg-slate-500/20" };
      case "crimson":
      default:
        return { text: "text-rose-500", border: "border-rose-500/20", bg: "bg-rose-500/10", hoverBg: "hover:bg-rose-500/20" };
    }
  };

  const colors = selectColorClasses();
  const apkAssets = assets.filter(a => a.name.toLowerCase().endsWith(".apk"));

  return (
    <div className="border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#121826] rounded-xl p-5 shadow-sm space-y-4">
      
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <FolderOpen size={16} className={colors.text} />
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Post Assets & Artifacts</h3>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              setIsAuthorMode(!isAuthorMode);
              setDeletingName(null);
            }}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono font-bold uppercase border transition-all ${
              isAuthorMode
                ? "bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20 shadow-sm"
                : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
            title={isAuthorMode ? "Switch to Secure Reader Mode" : "Toggle Authoring Mode (Upload/Delete Files)"}
          >
            {isAuthorMode ? <Unlock size={10} className="text-rose-500" /> : <Lock size={10} />}
            <span>{isAuthorMode ? "AUTHOR_WRITE" : "READER_ONLY"}</span>
          </button>
          <span className="text-[9px] font-mono font-bold uppercase text-slate-400 hidden lg:inline">
            blog-assets/{postSlug}/
          </span>
        </div>
      </div>

      {/* Drag & Drop Upload Zone - Only active in Author Mode */}
      {isAuthorMode && (
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-150 animate-fade-in ${
            dragActive 
              ? `${colors.border} ${colors.bg} scale-[1.01]` 
              : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/20"
          }`}
        >
          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            onChange={handleFileInputChange} 
          />
          <div className="flex flex-col items-center justify-center gap-1.5">
            {uploading ? (
              <>
                <Loader2 className={`animate-spin ${colors.text}`} size={20} />
                <p className="text-[11px] font-semibold text-slate-500 font-mono">UPLOADING_RAW_BYTE_STREAM...</p>
              </>
            ) : (
              <>
                <UploadCloud size={20} className="text-slate-450 group-hover:text-rose-500" />
                <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  Drag & drop or <span className={`${colors.text} font-semibold hover:underline`}>browse</span>
                </p>
                <p className="text-[9px] text-slate-400 font-mono">Any image, Frida script, APK sample, payload, or PCAP</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Prominent APK Download Section */}
      {apkAssets.length > 0 && (
        <div className="border border-rose-500/30 bg-rose-500/5 rounded-lg p-3.5 space-y-2.5 animate-fade-in">
          <div className="flex items-center gap-2">
            <Smartphone size={14} className="text-rose-500 animate-pulse" />
            <span className="text-[10px] font-bold font-mono text-rose-500 uppercase tracking-wider">
              ANALYST_RESOURCE: APK_TARGET
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
            Advisory contains active/deactivated mobile application packages. Execute only in sandboxed or emulator analysis systems.
          </p>
          <div className="space-y-1.5">
            {apkAssets.map(apk => (
              <a
                key={apk.name}
                href={apk.url}
                download={apk.name}
                className="flex items-center justify-between gap-3 px-3 py-2 rounded-md bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-500 text-white transition-all shadow-sm font-mono text-[11px] font-bold"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Download size={12} className="shrink-0" />
                  <span className="truncate">{apk.name}</span>
                </div>
                <span className="text-[9px] bg-rose-600 dark:bg-rose-700 px-1.5 py-0.5 rounded text-white/90 shrink-0">
                  {formatSize(apk.size)}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Assets Listing */}
      {loading ? (
        <div className="flex justify-center items-center py-6">
          <Loader2 className={`animate-spin ${colors.text}`} size={16} />
        </div>
      ) : assets.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-slate-100 dark:border-slate-800/50 rounded-lg bg-slate-50/20 dark:bg-slate-950/10">
          <p className="text-[10px] text-slate-400 font-mono font-bold uppercase">NO_INDEXED_ARTIFACTS</p>
          <p className="text-[9.5px] text-slate-450 dark:text-slate-500 mt-1 max-w-[210px] mx-auto leading-relaxed">
            {isAuthorMode 
              ? "Upload diagrams, Frida scripts, or IoC files isolated specifically for this publication."
              : "This intelligence advisory does not have any attached scripts or capture file resources."}
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
          {assets.map((asset, index) => {
            const isImg = asset.type === "image";
            const isApk = asset.name.toLowerCase().endsWith(".apk");
            const isDeleting = deletingName === asset.name;

            return (
              <div 
                key={asset.name}
                className={`group flex flex-col p-2.5 rounded-lg border transition-all text-xs ${
                  isApk 
                    ? "border-rose-550/20 bg-rose-500/5 hover:bg-rose-500/10"
                    : "border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-950/10 hover:bg-slate-55 dark:hover:bg-slate-950/20"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {isImg ? (
                      <ImageIcon size={13} className="text-emerald-500 shrink-0" />
                    ) : isApk ? (
                      <Smartphone size={13} className="text-rose-500 shrink-0 animate-pulse" />
                    ) : asset.name.endsWith(".js") || asset.name.endsWith(".ts") || asset.name.endsWith(".py") ? (
                      <FileCode size={13} className="text-cyan-500 shrink-0" />
                    ) : (
                      <FileText size={13} className="text-slate-400 shrink-0" />
                    )}
                    <span 
                      className={`font-semibold truncate font-mono text-[11px] ${
                        isApk 
                          ? "text-rose-600 dark:text-rose-400 font-bold"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                      title={asset.name}
                    >
                      {asset.name}
                    </span>
                    {isApk && (
                      <span className="px-1 py-0.5 text-[8px] font-bold font-mono uppercase bg-rose-500/10 border border-rose-500/25 text-rose-500 rounded shrink-0">
                        APK_SAMPLE
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono whitespace-nowrap">
                    {formatSize(asset.size)}
                  </span>
                </div>

                {/* Hover / Interactive Actions bar */}
                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100/50 dark:border-slate-800/40">
                  <span className="text-[8.5px] text-slate-400 dark:text-slate-500 font-mono">
                    {new Date(asset.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {isDeleting ? (
                      <div className="flex items-center gap-1 text-[9px] font-mono">
                        <span className="text-red-500 font-bold uppercase">Delete?</span>
                        <button 
                          onClick={() => handleDelete(asset.name)}
                          className="px-1 text-red-500 hover:underline font-bold"
                        >
                          Yes
                        </button>
                        <button 
                          onClick={() => setDeletingName(null)}
                          className="px-1 text-slate-400 hover:underline"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => copyToClipboard(asset, index)}
                          title="Copy Markdown Reference to Clipboard"
                          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          {copiedIndex === index ? (
                            <Check size={11} className="text-emerald-500" />
                          ) : (
                            <Copy size={11} />
                          )}
                        </button>
                        <a
                          href={asset.url}
                          download={asset.name}
                          title="Download Asset File"
                          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Download size={11} />
                        </a>
                        {isAuthorMode && (
                          <button
                            onClick={() => setDeletingName(asset.name)}
                            title="Delete Asset"
                            className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors animate-fade-in"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
