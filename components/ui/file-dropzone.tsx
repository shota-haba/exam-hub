import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle } from 'lucide-react';

interface FileDropzoneProps {
  onFileAccepted: (file: File) => void;
  disabled?: boolean;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
}

export function FileDropzone({ 
  onFileAccepted, 
  disabled = false,
  acceptedFileTypes = ['.json'],
  maxFileSize = 10 * 1024 * 1024 // 10MB
}: FileDropzoneProps) {
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (acceptedFiles.length > 0) {
      onFileAccepted(acceptedFiles[0]);
    }
  }, [onFileAccepted]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/json': acceptedFileTypes
    },
    maxFiles: 1,
    maxSize: maxFileSize,
    disabled
  });

  return (
    <div
      {...getRootProps()}
      className={`
        relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer
        ${isDragActive && !isDragReject ? 'border-primary bg-primary-container/20' : ''}
        ${isDragReject ? 'border-error bg-error-container/20' : ''}
        ${!isDragActive && !isDragReject ? 'border-outline-variant hover:border-primary hover:bg-surface-container' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center space-y-4">
        {isDragReject ? (
          <AlertCircle className="h-12 w-12 text-error" />
        ) : (
          <div className="relative">
            <Upload className={`h-12 w-12 transition-colors ${
              isDragActive ? 'text-primary' : 'text-on-surface-variant'
            }`} />
            <FileText className="h-6 w-6 absolute -bottom-1 -right-1 text-primary" />
          </div>
        )}
        
        <div className="space-y-2">
          {isDragReject ? (
            <p className="md-body-medium text-error font-medium">
              サポートされていないファイル形式です
            </p>
          ) : isDragActive ? (
            <p className="md-body-medium text-primary font-medium">
              ファイルをドロップしてください
            </p>
          ) : (
            <>
              <p className="md-body-medium text-on-surface font-medium">
                ファイルをドラッグ&ドロップ
              </p>
              <p className="md-body-small text-on-surface-variant">
                または<span className="text-primary underline">クリックして選択</span>
              </p>
            </>
          )}
          
          <p className="md-body-small text-on-surface-variant">
            JSON形式のファイル（最大{Math.round(maxFileSize / 1024 / 1024)}MB）
          </p>
        </div>
      </div>
      
      {disabled && (
        <div className="absolute inset-0 bg-surface/50 rounded-xl flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}