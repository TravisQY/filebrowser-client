/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import Login from "./components/Login";
import Explorer from "./components/Explorer";
import { AuthState } from "./types";

export default function App() {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const savedAuth = localStorage.getItem("fb_auth");
    if (savedAuth) {
      try {
        setAuth(JSON.parse(savedAuth));
      } catch (e) {
        localStorage.removeItem("fb_auth");
      }
    }
    setIsInitializing(false);
  }, []);

  const handleLogin = (serverUrl: string, token: string) => {
    const newAuth = { serverUrl, token };
    setAuth(newAuth);
    localStorage.setItem("fb_auth", JSON.stringify(newAuth));
  };

  const handleLogout = () => {
    setAuth(null);
    localStorage.removeItem("fb_auth");
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Mesh Background Decoration */}
      <div className="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 antialiased selection:bg-blue-500/30">
        {auth ? (
          <Explorer auth={auth} onLogout={handleLogout} />
        ) : (
          <Login onLogin={handleLogin} />
        )}
      </div>
    </div>
  );
}

