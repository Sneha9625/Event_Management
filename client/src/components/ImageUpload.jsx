import { useEffect, useRef, useState } from 'react';
import { ImagePlus, RefreshCw, X } from 'lucide-react';
import Button from './ui/Button';
import { cn } from '../utils/cn';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // must match the server's multer limit
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Drag-and-drop (or click) image picker with preview.
 * `existingUrl` = banner already saved on the server (edit page).
 * Calls onFileChange(file) with the new File, or null when removed.
 */
export default function ImageUpload({ existingUrl = '', onFileChange }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  // Object URLs use memory until revoked, so clean up the old preview
  useEffect(() => {
    return () => preview && URL.revokeObjectURL(preview);
  }, [preview]);

  const pickFile = (newFile) => {
    if (!newFile) return;
    if (!ALLOWED_TYPES.includes(newFile.type)) return setError('Only JPG, PNG or WEBP images are allowed');
    if (newFile.size > MAX_IMAGE_SIZE) return setError('Image must be 2MB or smaller');

    setError('');
    setFile(newFile);
    setPreview(URL.createObjectURL(newFile));
    onFileChange(newFile);
  };

  const removeFile = () => {
    setFile(null);
    setPreview('');
    onFileChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files[0]);
  };

  const shownImage = preview || existingUrl;

  return (
    <div>
      <p className="mb-1.5 block text-sm font-medium text-slate-700">
        Banner image <span className="font-normal text-slate-400">(optional)</span>
      </p>

      <input
        ref={inputRef}
        id="banner"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => pickFile(e.target.files[0])}
        className="sr-only"
      />

      {shownImage ? (
        <div className="relative overflow-hidden rounded-xl border border-slate-200">
          <img src={shownImage} alt="Banner preview" className="aspect-video w-full object-cover" />
          <div className="absolute right-3 top-3 flex gap-2">
            <Button size="sm" variant="outline" onClick={() => inputRef.current.click()}>
              <RefreshCw className="h-4 w-4" /> Change
            </Button>
            {/* Only a newly chosen file can be removed; the saved banner stays unless replaced */}
            {file && (
              <Button size="sm" variant="danger-outline" onClick={removeFile} aria-label="Remove selected image">
                <X className="h-4 w-4" /> Remove
              </Button>
            )}
          </div>
          {file && (
            <p className="absolute bottom-3 left-3 max-w-[70%] truncate rounded-md bg-slate-900/70 px-2 py-1 text-xs text-white">
              {file.name}
            </p>
          )}
        </div>
      ) : (
        <label
          htmlFor="banner"
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 text-center transition sm:aspect-[3/1]',
            dragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/40'
          )}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
            <ImagePlus className="h-6 w-6 text-indigo-600" aria-hidden />
          </span>
          <span className="mt-3 text-sm font-semibold text-slate-900">
            <span className="text-indigo-600">Click to upload</span> or drag and drop
          </span>
          <span className="mt-1 text-xs text-slate-500">JPG, PNG or WEBP · max 2MB</span>
        </label>
      )}

      {error && <p className="mt-1.5 text-sm text-rose-600">{error}</p>}
    </div>
  );
}
