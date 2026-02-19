"use client";

import React, { useCallback, useState } from 'react';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentUploadZoneProps {
  onUpload: (files: File[]) => Promise<void>;
  acceptedTypes?: string[];
  maxSize?: number;
  multiple?: boolean;
}

const DEFAULT_ACCEPTED_TYPES = ['.pdf', '.docx', '.pptx', '.txt'];
const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB

export function DocumentUploadZone({
  onUpload,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  maxSize = DEFAULT_MAX_SIZE,
  multiple = true,
}: DocumentUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `${file.name} exceeds maximum size of ${(maxSize / 1024 / 1024).toFixed(0)}MB`;
    }

    // Check file type
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(extension)) {
      return `${file.name} has unsupported file type. Accepted: ${acceptedTypes.join(', ')}`;
    }

    return null;
  };

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError(null);
    const fileArray = Array.from(files);

    // Validate all files
    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setSelectedFiles(fileArray);
  }, [acceptedTypes, maxSize]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  }, [handleFiles]);

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      await onUpload(selectedFiles);
      setSelectedFiles([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 transition-all duration-200",
          isDragging
            ? "border-amber-400 bg-amber-400/10"
            : "border-white/10 bg-slate-900/50 hover:border-amber-400/50 hover:bg-slate-900/70"
        )}
      >
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
            isDragging ? "bg-amber-400/20" : "bg-slate-800"
          )}>
            <Upload className={cn(
              "w-8 h-8 transition-colors",
              isDragging ? "text-amber-400" : "text-slate-400"
            )} />
          </div>

          <div>
            <p className="text-lg font-medium text-white mb-1">
              {isDragging ? "Drop files here" : "Drag & drop files here"}
            </p>
            <p className="text-sm text-slate-400">
              or click to browse
            </p>
          </div>

          <input
            type="file"
            multiple={multiple}
            accept={acceptedTypes.join(',')}
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
            disabled={isUploading}
          />
          <label
            htmlFor="file-upload"
            className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-medium rounded-lg cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Browse Files
          </label>

          <p className="text-xs text-slate-500">
            Supported: {acceptedTypes.join(', ')} • Max {(maxSize / 1024 / 1024).toFixed(0)}MB per file
          </p>
        </div>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-300">
            Selected Files ({selectedFiles.length})
          </h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-slate-900/50 border border-white/10 rounded-lg p-3"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  disabled={isUploading}
                  className="p-1 hover:bg-slate-800 rounded transition-colors disabled:opacity-50"
                  title="Remove file"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'File' : 'Files'}
              </>
            )}
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
