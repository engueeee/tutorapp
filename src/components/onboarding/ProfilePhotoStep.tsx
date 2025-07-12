import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Upload, X } from "lucide-react";

interface ProfilePhotoStepProps {
  onPhotoChange: (photo: string) => void;
  currentPhoto?: string;
}

export function ProfilePhotoStep({
  onPhotoChange,
  currentPhoto,
}: ProfilePhotoStepProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentPhoto || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewUrl(result);
        onPhotoChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPreviewUrl(null);
    onPhotoChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-gray-600 mb-4">
          Ajoutez une photo de profil pour personnaliser votre expérience
        </p>
      </div>

      <div className="flex flex-col items-center space-y-4">
        {/* Photo Preview */}
        <div className="relative">
          {previewUrl ? (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Profile preview"
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
              />
              <Button
                size="sm"
                variant="destructive"
                onClick={handleRemovePhoto}
                className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
              <Camera className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Upload Button */}
        <div className="space-y-2">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {previewUrl ? "Changer la photo" : "Choisir une photo"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <p className="text-sm text-gray-500 text-center">
          Format recommandé : JPG, PNG • Taille max : 5MB
        </p>
      </div>
    </div>
  );
}
