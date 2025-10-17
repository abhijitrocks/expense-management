
import React, { useState, useRef } from 'react';
import { Camera, X } from 'lucide-react';
import { Button } from './ui/Button';

interface ReceiptUploaderProps {
  onReceiptUpload: (base64: string | undefined) => void;
}

const ReceiptUploader: React.FC<ReceiptUploaderProps> = ({ onReceiptUpload }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        onReceiptUpload(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveReceipt = () => {
    setPreview(null);
    onReceiptUpload(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Receipt (optional)</label>
      {preview ? (
        <div className="mt-2 relative">
          <img src={preview} alt="Receipt preview" className="w-full h-32 object-cover rounded-lg" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
            onClick={handleRemoveReceipt}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-2 flex justify-center w-full px-6 py-4 border-2 border-gray-300 border-dashed rounded-md dark:border-gray-600"
        >
          <div className="space-y-1 text-center">
            <Camera className="mx-auto h-10 w-10 text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Click to upload a receipt</p>
          </div>
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ReceiptUploader;
