import React, { useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, Image, FileText, Loader2, AlertCircle } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import { motion, AnimatePresence } from 'framer-motion';

// Import the worker directly from pdfjs-dist
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs';

// Configure the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const CHUNK_SIZE = 1024 * 1024; // 1MB chunks for large files

interface FileUploadProps {
  onFileProcessed?: (text: string) => void;
}

export function FileUpload({ onFileProcessed }: FileUploadProps) {
  const { setIsProcessing } = useChatStore();
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const workerRef = useRef<any>(null);

  const cleanText = (text: string) => {
    return text
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
      .replace(/%[0-9A-F]{2}/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/[\r\n]+/g, '\n')
      .replace(/[^\x20-\x7E\n]/g, '')
      .trim();
  };

  const processInChunks = async (data: ArrayBuffer, processor: (chunk: ArrayBuffer) => Promise<string>) => {
    const chunks = Math.ceil(data.byteLength / CHUNK_SIZE);
    let processedText = '';
    
    for (let i = 0; i < chunks; i++) {
      const chunk = data.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      const chunkText = await processor(chunk);
      processedText += chunkText;
      setUploadProgress((i + 1) / chunks * 100);
    }
    
    return processedText;
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
      setUploadProgress((i / pdf.numPages) * 100);
    }
    
    return cleanText(fullText);
  };

  const processImage = async (file: File) => {
    if (!workerRef.current) {
      workerRef.current = await createWorker();
      await workerRef.current.loadLanguage('eng');
      await workerRef.current.initialize('eng');
    }

    const { data: { text } } = await workerRef.current.recognize(file);
    return text;
  };

  const processFile = async (file: File) => {
    try {
      setError('');
      setIsProcessing(true);
      setUploadProgress(0);

      if (file.size > MAX_FILE_SIZE) {
        throw new Error('File size exceeds 50MB limit');
      }

      let text = '';

      if (file.type.startsWith('image/')) {
        text = await processImage(file);
      } else if (file.type === 'application/pdf') {
        text = await extractTextFromPDF(file);
      } else {
        const reader = new FileReader();
        text = await new Promise((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.onprogress = (event) => {
            if (event.lengthComputable) {
              setUploadProgress((event.loaded / event.total) * 100);
            }
          };
          reader.readAsText(file);
        });
      }

      const cleanedText = cleanText(text);
      if (cleanedText.trim()) {
        onFileProcessed?.(cleanedText);
      } else {
        throw new Error('No readable text found in file');
      }
    } catch (error: any) {
      setError(error.message);
      console.error('Error processing file:', error);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(processFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    multiple: false,
    maxSize: MAX_FILE_SIZE,
  });

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type === 'application/pdf') return FileText;
    return File;
  };

  return (
    <div className="h-full">
      <div
        {...getRootProps()}
        className={`
          h-full relative p-8 border-3 border-dashed rounded-xl cursor-pointer
          transition-all duration-300 ease-in-out
          ${isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 dark:border-gray-700 dark:hover:border-blue-600'
          }
        `}
      >
        <input {...getInputProps()} />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-4 text-gray-600 dark:text-gray-300 h-full justify-center"
        >
          <motion.div 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`
              w-16 h-16 rounded-full flex items-center justify-center
              ${isDragActive ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-800'}
              transition-colors duration-300
            `}
          >
            <Upload className={`
              w-8 h-8
              ${isDragActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}
              transition-colors duration-300
            `} />
          </motion.div>
          <div className="text-center">
            <p className="text-lg font-medium mb-2">
              {isDragActive
                ? 'Drop your file here'
                : 'Drag & drop your study material'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              or click to browse your files (max 50MB)
            </p>
          </div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex gap-6 mt-4"
          >
            {['image/*', 'application/pdf', 'text/plain'].map((type) => {
              const Icon = getFileIcon(type);
              return (
                <motion.div 
                  key={type}
                  whileHover={{ scale: 1.1 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {type === 'image/*' ? 'Images' : type.split('/')[1].toUpperCase()}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {uploadProgress > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/90 dark:bg-gray-800/90 flex items-center justify-center rounded-xl backdrop-blur-sm"
            >
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin mb-4" />
                <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Processing file... {Math.round(uploadProgress)}%
                </div>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute bottom-4 left-4 right-4 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg flex items-center gap-2"
            >
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}