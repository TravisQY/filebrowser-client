import React, { useState } from "react";
import { LogIn, Server, User, Lock, Loader2 } from "lucide-react";
import { login } from "../lib/api";
import { cn } from "../lib/utils";
import { motion } from "motion/react";

interface LoginProps {
  onLogin: (serverUrl: string, token: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [serverUrl, setServerUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const token = await login(serverUrl, username, password);
      onLogin(serverUrl, token);
    } catch (err) {
      let message = err instanceof Error ? err.message : "Failed to login.";
      
      // Handle the common "Failed to fetch" error with more context
      if (message === "Failed to fetch") {
        message = "Network error (Failed to fetch). This is usually caused by CORS configuration on your server or using HTTP on an HTTPS site (Mixed Content). Please ensure your server allows requests from this domain and uses HTTPS.";
      }
      
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-white/10 overflow-hidden"
      >
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
              <LogIn className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">FileBrowser</h1>
            <p className="text-white/40 text-center mt-1 text-sm">Connect to your self-hosted instance</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2">
                <Server className="w-3.5 h-3.5" /> Server URL
              </label>
              <input
                type="url"
                required
                placeholder="https://explorer.example.com"
                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder:text-white/20 text-white"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> Username
              </label>
              <input
                type="text"
                required
                placeholder="admin"
                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder:text-white/20 text-white"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" /> Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder:text-white/20 text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2 mt-4",
                isLoading && "cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Connect Instance</>
              )}
            </button>
          </form>
        </div>
        
        <div className="p-4 bg-white/5 border-t border-white/10 text-center text-[10px] text-white/30 uppercase tracking-widest font-semibold">
          Secure End-to-End Environment
        </div>
      </motion.div>
    </div>
  );
}
