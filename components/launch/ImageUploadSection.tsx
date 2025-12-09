import { Image as ImageIcon } from 'phosphor-react';

interface ImageUploadSectionProps {
  imagePreview: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ImageUploadSection({ imagePreview, onImageChange }: ImageUploadSectionProps) {
  return (
    <div className="p-5 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
      <h2 className="text-base font-semibold text-white mb-3">Agent Image</h2>
      <label className="cursor-pointer block">
        <input
          type="file"
          accept="image/*"
          onChange={onImageChange}
          className="hidden"
          required
        />
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 flex flex-col items-center justify-center hover:border-gray-500 transition-colors" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="max-w-xs max-h-40 rounded-lg" />
          ) : (
            <>
              <ImageIcon size={48} weight="light" className="text-gray-500 mb-2" />
              <p className="text-gray-400 text-sm">Drag and drop your image here</p>
              <p className="text-gray-500 text-xs mt-1">*Max file size 60MB</p>
            </>
          )}
        </div>
      </label>
    </div>
  );
}
