"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload, User } from "lucide-react";

interface ProfilePhotoStepProps {
  photoUrl: string;
  onPhotoChange: (url: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ProfilePhotoStep({
  photoUrl,
  onPhotoChange,
  onNext,
  onBack,
}: ProfilePhotoStepProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // Simulate file upload - in a real app, you'd upload to a service like Cloudinary
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onPhotoChange(result);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading file:", error);
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-center">Photo de profil</CardTitle>
        <p className="text-center text-gray-600">
          Ajoutez une photo pour personnaliser votre profil
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-16 h-16 text-gray-400" />
              )}
            </div>
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </div>

          <div className="text-center">
            <Label htmlFor="photo-upload" className="cursor-pointer">
              <div className="flex items-center space-x-2 text-primary hover:text-primary/80">
                <Upload className="w-4 h-4" />
                <span>
                  {photoUrl ? "Changer la photo" : "Ajouter une photo"}
                </span>
              </div>
            </Label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <p className="text-xs text-gray-500 mt-2">PNG, JPG jusqu'à 5MB</p>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Pourquoi ajouter une photo ?</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Rendez votre profil plus personnel</li>
            <li>• Améliorez la confiance avec vos interlocuteurs</li>
            <li>• Facilitez la reconnaissance lors des cours</li>
          </ul>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            Précédent
          </Button>
          <Button onClick={onNext}>Suivant</Button>
        </div>
      </CardContent>
    </Card>
  );
}
