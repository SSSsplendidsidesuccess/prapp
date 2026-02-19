"use client";

import React, { useState } from 'react';
import { FileText, Eye, Trash2, Download, MoreVertical } from 'lucide-react';
import { Document } from '@/types/documents';
import { DocumentStatusBadge } from './DocumentStatusBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface DocumentTableProps {
  documents: Document[];
  onView: (document: Document) => void;
  onDelete: (document: Document) => void;
  isLoading?: boolean;
}

export function DocumentTable({
  documents,
  onView,
  onDelete,
  isLoading = false,
}: DocumentTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (doc: Document) => {
    setDeletingId(doc.id);
    try {
      await onDelete(doc);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const getFileIcon = (fileType: string) => {
    return <FileText className="w-5 h-5 text-amber-400" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading documents...</p>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-slate-600" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No documents yet</h3>
        <p className="text-sm text-slate-400 max-w-sm">
          Upload your first document to start building your knowledge base
        </p>
      </div>
    );
  }

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-slate-900/50">
            <TableHead className="text-slate-400">Document</TableHead>
            <TableHead className="text-slate-400">Type</TableHead>
            <TableHead className="text-slate-400">Size</TableHead>
            <TableHead className="text-slate-400">Status</TableHead>
            <TableHead className="text-slate-400">Uploaded</TableHead>
            <TableHead className="text-slate-400 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow
              key={doc.id}
              className="border-white/10 hover:bg-slate-900/50 transition-colors"
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  {getFileIcon(doc.file_type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {doc.filename}
                    </p>
                    {doc.chunk_count > 0 && (
                      <p className="text-xs text-slate-500">
                        {doc.chunk_count} chunks
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-slate-300 uppercase">
                  {doc.file_type}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-slate-300">
                  {formatFileSize(doc.file_size)}
                </span>
              </TableCell>
              <TableCell>
                <DocumentStatusBadge status={doc.status} size="sm" />
              </TableCell>
              <TableCell>
                <span className="text-sm text-slate-400">
                  {formatDate(doc.uploaded_at)}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-slate-900 border-white/10"
                  >
                    <DropdownMenuItem
                      onClick={() => onView(doc)}
                      className="text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(doc)}
                      disabled={deletingId === doc.id}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {deletingId === doc.id ? 'Deleting...' : 'Delete'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
