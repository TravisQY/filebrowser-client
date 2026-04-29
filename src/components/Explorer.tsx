import { useState, useEffect, useCallback, useMemo } from "react";
import { AuthState, FileItem } from "../types";
import { FileBrowserAPI } from "../lib/api";
import { 
  ChevronRight, 
  Home, 
  Plus, 
  RefreshCw, 
  Search, 
  ArrowLeft, 
  Grid, 
  List as ListIcon, 
  LogOut,
  Upload,
  FolderPlus,
  Loader2,
  AlertCircle
} from "lucide-react";
import FileCard from "./FileCard";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

interface ExplorerProps {
  auth: AuthState;
  onLogout: () => void;
}

export default function Explorer({ auth, onLogout }: ExplorerProps) {
  const [currentPath, setCurrentPath] = useState<string>("");
  const [resource, setResource] = useState<FileItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const api = useMemo(() => new FileBrowserAPI(auth), [auth]);

  const fetchResources = useCallback(async (path: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getResources(path);
      setResource(data);
    } catch (err) {
      let message = err instanceof Error ? err.message : "Failed to load files";
      
      if (message === "Failed to fetch") {
        message = "Network error (Failed to fetch). This is usually caused by CORS issues on your server or your server is currently offline. Please verify your Nginx Proxy Manager configuration.";
      }
      
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchResources(currentPath);
  }, [currentPath, fetchResources]);

  const breadcrumbs = useMemo(() => {
    const parts = currentPath.split("/").filter(Boolean);
    const result = [{ name: "Home", path: "" }];
    let cumulativePath = "";
    parts.forEach((p) => {
      cumulativePath += `/${p}`;
      result.push({ name: p, path: cumulativePath });
    });
    return result;
  }, [currentPath]);

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
  };

  const handleItemClick = (item: FileItem) => {
    if (item.isDir) {
      handleNavigate(item.url.replace(/^\/resources/, ""));
    } else {
      // Optional: Open preview or download
      window.open(api.getDownloadUrl(item.url.replace(/^\/resources/, "")), "_blank");
    }
  };

  const filteredItems = useMemo(() => {
    if (!resource?.items) return [];
    return resource.items.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [resource, searchQuery]);

  const handleCreateFolder = async () => {
    const folderName = prompt("Enter folder name:");
    if (!folderName) return;

    try {
      const path = currentPath ? `${currentPath}/${folderName}` : folderName;
      await api.createFolder(path);
      fetchResources(currentPath);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create folder");
    }
  };

  const handleDelete = async (item: FileItem) => {
    const path = item.url.replace(/^\/resources/, "");
    if (!confirm(`Are you sure you want to delete ${item.name}?`)) return;

    try {
      await api.deleteResource(path);
      fetchResources(currentPath);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete item");
    }
  };

  const handleRename = async (item: FileItem) => {
    const oldPath = item.url.replace(/^\/resources/, "");
    const newName = prompt("Enter new name:", item.name);
    if (!newName || newName === item.name) return;

    const parentPath = currentPath ? `${currentPath}/` : "";
    const newPath = `${parentPath}${newName}`;

    try {
      await api.renameResource(oldPath, newPath);
      fetchResources(currentPath);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to rename item");
    }
  };

  const handleDownload = (item: FileItem) => {
    const path = item.url.replace(/^\/resources/, "");
    window.location.href = api.getDownloadUrl(path);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/5 backdrop-blur-xl border-b border-white/10 px-4 py-4 md:px-8 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <RefreshCw className={cn("text-white w-6 h-6", isLoading && "animate-spin")} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight leading-none mb-1 shadow-sm">FileBrowser</h1>
              <div className="flex items-center text-[11px] text-white/40 font-semibold uppercase tracking-widest overflow-x-auto no-scrollbar max-w-[180px] sm:max-w-md">
                {breadcrumbs.map((bc, idx) => (
                  <div key={bc.path} className="flex items-center whitespace-nowrap">
                    {idx > 0 && <ChevronRight className="w-3 h-3 mx-1 opacity-50" />}
                    <button
                      onClick={() => handleNavigate(bc.path)}
                      className={cn(
                        "hover:text-blue-400 transition-colors uppercase",
                        idx === breadcrumbs.length - 1 && "text-white/80"
                      )}
                    >
                      {bc.name}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search resources..."
                className="pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-full focus:bg-white/10 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-sm w-72 placeholder:text-white/20 text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 hover:text-white transition-all shadow-sm"
            >
              {viewMode === "grid" ? <ListIcon className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
            </button>
            <button
              onClick={onLogout}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/10 text-white/60 hover:text-red-400 transition-all shadow-sm"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        {/* Mobile Search */}
        <div className="mb-8 relative md:hidden">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search folders & files..."
            className="w-full pl-11 pr-4 py-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl focus:ring-1 focus:ring-blue-500/50 transition-all text-sm shadow-xl placeholder:text-white/20 text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <section className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              {currentPath && (
                <button
                  onClick={() => {
                    const parts = currentPath.split("/");
                    parts.pop();
                    handleNavigate(parts.join("/"));
                  }}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 transition-all shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/30">
                <span>{filteredItems.length} items</span>
                {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCreateFolder}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-semibold text-white/80 hover:bg-white/10 transition-all shadow-sm"
              >
                <FolderPlus className="w-4 h-4 text-amber-500" />
                <span className="hidden sm:inline">New Folder</span>
              </button>
              <button
                className="flex items-center gap-3 px-6 py-2.5 bg-blue-500 rounded-xl text-sm font-bold text-white hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/30"
                onClick={() => alert("Upload feature requires specialized implementation for browser-to-server file streams.")}
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline tracking-tight">Upload</span>
              </button>
            </div>
          </div>

          {error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center glass rounded-3xl p-10">
              <div className="p-4 bg-red-500/10 rounded-2xl mb-4 border border-red-500/20">
                <AlertCircle className="w-12 h-12 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Access Denied or Server Error</h2>
              <p className="text-white/40 mb-8 max-w-sm font-medium">{error}</p>
              <button
                onClick={() => fetchResources(currentPath)}
                className="px-8 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all border border-white/10"
              >
                Refresh Connection
              </button>
            </div>
          ) : resource && filteredItems.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 text-center glass rounded-3xl p-12">
              <div className="p-6 bg-white/5 rounded-full mb-6 border border-white/5">
                <Search className="w-16 h-16 text-white/10" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Empty Directory</h2>
              <p className="text-white/30 font-medium tracking-wide">No items found in this location.</p>
            </div>
          ) : (
            <div
              className={cn(
                "grid gap-6",
                viewMode === "grid" 
                  ? "grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8" 
                  : "grid-cols-1"
              )}
            >
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item) => (
                  <FileCard
                    key={item.url}
                    item={item}
                    onClick={handleItemClick}
                    onDelete={handleDelete}
                    onRename={handleRename}
                    onDownload={handleDownload}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </main>
      
      {/* Footer / Status Bar */}
      <footer className="p-6 bg-white/5 backdrop-blur-md border-t border-white/10 text-center text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold">
        FileBrowser Mobile Explorer &bull; Ver 1.4.0 &bull; Cloud Integration Active
      </footer>
    </div>
  );
}
