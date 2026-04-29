import React, { useState, useRef, useEffect } from "react";
import { FileItem } from "../types";
import { File, Folder, MoreVertical, Download, Trash2, Edit2, Play, Image as ImageIcon, FileText } from "lucide-react";
import { formatBytes, cn } from "../lib/utils";
import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";

interface FileCardProps {
  item: FileItem;
  onClick: (item: FileItem) => void;
  onDelete: (item: FileItem) => Promise<void> | void;
  onRename: (item: FileItem) => Promise<void> | void;
  onDownload: (item: FileItem) => void;
  key?: React.Key;
}

export default function FileCard({ item, onClick, onDelete, onRename, onDownload }: FileCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIcon = () => {
    if (item.isDir) return <Folder className="w-10 h-10 text-blue-500 fill-blue-50" />;
    
    const ext = item.extension.toLowerCase();
    if ([".mp4", ".mkv", ".mov", ".avi"].includes(ext)) return <Play className="w-10 h-10 text-purple-500" />;
    if ([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"].includes(ext)) return <ImageIcon className="w-10 h-10 text-pink-500" />;
    if ([".pdf", ".doc", ".docx", ".txt", ".md"].includes(ext)) return <FileText className="w-10 h-10 text-orange-500" />;
    
    return <File className="w-10 h-10 text-slate-400" />;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="group relative glass rounded-3xl p-5 flex flex-col items-center text-center cursor-pointer transition-all active:scale-[0.98] shadow-lg hover:shadow-2xl hover:shadow-blue-500/10"
      onClick={() => onClick(item)}
    >
      <div className="absolute top-3 right-3" ref={menuRef}>
        <button
          className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="absolute right-0 mt-2 w-40 glass rounded-[20px] shadow-2xl z-50 overflow-hidden ring-1 ring-white/10"
            >
              <button
                className="w-full px-4 py-3 text-left text-sm text-white/70 hover:bg-white/10 flex items-center gap-3 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload(item);
                  setShowMenu(false);
                }}
              >
                <Download className="w-4 h-4 text-blue-400" /> Download
              </button>
              <button
                className="w-full px-4 py-3 text-left text-sm text-white/70 hover:bg-white/10 flex items-center gap-3 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onRename(item);
                  setShowMenu(false);
                }}
              >
                <Edit2 className="w-4 h-4 text-amber-400" /> Rename
              </button>
              <div className="border-t border-white/5" />
              <button
                className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-3 transition-colors font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item);
                  setShowMenu(false);
                }}
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mb-4 p-4 rounded-2xl bg-white/[0.03] group-hover:bg-white/[0.08] transition-colors border border-white/5 group-hover:border-white/10">
        {getIcon()}
      </div>

      <h3 className="text-sm font-bold text-white/90 truncate w-full mb-1.5 px-1 tracking-tight" title={item.name}>
        {item.name}
      </h3>
      
      <div className="flex flex-col text-[10px] text-white/30 font-bold uppercase tracking-widest">
        <span>{item.isDir ? `${item.numFiles + item.numDirs} items` : formatBytes(item.size)}</span>
        <span className="opacity-60 mt-1">{format(new Date(item.modified), "MMM d, yyyy")}</span>
      </div>
    </motion.div>
  );
}
