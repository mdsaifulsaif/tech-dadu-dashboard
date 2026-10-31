"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  Link as LinkIcon,
  X,
  Star,
  ArrowLeft,
  ArrowRight,
  ImageIcon,
  Loader2,
  Check,
} from "lucide-react";

interface ImageGalleryManagerProps {
  images: string[];
  onChange: (images: string[]) => void;
  onUpload: (file: File) => Promise<string | null>;
  isUploading: boolean;
  label?: string;
  required?: boolean;
}

export const ImageGalleryManager: React.FC<ImageGalleryManagerProps> = ({
  images,
  onChange,
  onUpload,
  isUploading,
  label = "Product Images / Gallery",
  required = false,
}) => {
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    onChange([...images, trimmed]);
    setUrlInput("");
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const rest = images.filter((_, i) => i !== index);
    onChange([target, ...rest]);
  };

  const handleMove = (index: number, direction: "left" | "right") => {
    const newIdx = direction === "left" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= images.length) return;
    const copy = [...images];
    const temp = copy[index];
    copy[index] = copy[newIdx];
    copy[newIdx] = temp;
    onChange(copy);
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const uploadedUrl = await onUpload(file);
      if (uploadedUrl) {
        onChange([...images, uploadedUrl]);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-4 rounded-xl bg-theme-bg border border-theme-border space-y-3.5">
      {/* Header and Upload Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-theme-fg flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-theme-primary" />
            {label} ({images.length}) {required && <span className="text-theme-danger">*</span>}
          </span>
          <p className="text-[11px] text-theme-muted mt-0.5">
            The 1st image is your <strong>Main Thumbnail</strong>. The rest form the interactive gallery.
          </p>
        </div>

        <label className="btn-outline text-xs py-1.5 px-3 cursor-pointer inline-flex items-center justify-center gap-1.5 shrink-0">
          {isUploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5" />
          )}
          <span>{isUploading ? "Uploading..." : "Upload from Computer"}</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInputChange}
            className="hidden"
            disabled={isUploading}
          />
        </label>
      </div>

      {/* External URL Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" />
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddUrl();
              }
            }}
            placeholder="Or paste external image URL and press Enter..."
            className="input-theme input-icon-left text-xs py-2 w-full"
          />
        </div>
        <button
          type="button"
          onClick={handleAddUrl}
          disabled={!urlInput.trim()}
          className="btn-outline text-xs py-2 px-3.5 shrink-0 disabled:opacity-50"
        >
          Add Image
        </button>
      </div>

      {/* Gallery Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
          {images.map((img, idx) => {
            const isMain = idx === 0;
            return (
              <div
                key={idx}
                className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  isMain
                    ? "border-theme-primary shadow-md ring-2 ring-theme-primary/30"
                    : "border-theme-border bg-theme-surface"
                }`}
              >
                <img src={img} alt={`Gallery item ${idx + 1}`} className="w-full h-full object-cover" />

                {/* Badge if Main Thumbnail */}
                {isMain ? (
                  <div className="absolute top-1.5 left-1.5 z-10 bg-theme-primary text-theme-primary-fg text-[10px] font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    <span>Main Thumbnail</span>
                  </div>
                ) : (
                  <div className="absolute top-1.5 left-1.5 z-10 bg-black/70 text-white text-[10px] font-medium px-1.5 py-0.5 rounded opacity-80 group-hover:opacity-100">
                    #{idx + 1}
                  </div>
                )}

                {/* Hover Action Overlay */}
                <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between z-20">
                  <div className="flex items-center justify-between">
                    {/* Reordering buttons */}
                    <div className="flex gap-1">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMove(idx, "left")}
                          className="p-1 rounded bg-white/20 text-white hover:bg-white/40"
                          title="Move left"
                        >
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                      )}
                      {idx < images.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMove(idx, "right")}
                          className="p-1 rounded bg-white/20 text-white hover:bg-white/40"
                          title="Move right"
                        >
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      className="p-1 rounded bg-red-500/80 text-white hover:bg-red-500"
                      title="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Make Main Thumbnail CTA (if not already main) */}
                  {!isMain && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(idx)}
                      className="w-full text-center py-1 rounded bg-theme-primary text-theme-primary-fg text-[10px] font-bold hover:opacity-90 flex items-center justify-center gap-1"
                    >
                      <Star className="w-2.5 h-2.5" />
                      <span>Set as Main</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="border border-dashed border-theme-border rounded-xl p-6 text-center text-theme-muted text-xs">
          No images uploaded yet. Upload from computer or paste URLs above.
        </div>
      )}
    </div>
  );
};
