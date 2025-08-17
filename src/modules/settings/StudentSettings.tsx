"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { User, Camera, Save, Loader2, Upload, X } from "lucide-react";

export function StudentSettings() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    education: "",
    subjects: [] as string[],
    profilePhoto: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        education: user.education || "",
        subjects: user.subjects || [],
        profilePhoto: user.profilePhoto || "",
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Veuillez sélectionner une image valide");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("L'image doit faire moins de 5MB");
        return;
      }

      uploadProfilePhoto(file);
    }
  };

  const uploadProfilePhoto = async (file: File) => {
    setUploadingPhoto(true);
    try {
      // Convert file to base64 for preview and storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        setFormData((prev) => ({
          ...prev,
          profilePhoto: base64String,
        }));
        toast.success("Photo de profil mise à jour");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error("Erreur lors du téléchargement de la photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removeProfilePhoto = () => {
    setFormData((prev) => ({
      ...prev,
      profilePhoto: "",
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("Photo de profil supprimée");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/users/${user?.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await refreshUser();
        // Invalidate cache to ensure fresh data
        const { invalidateCache } = await import("@/lib/dataManager");
        invalidateCache("students");
        toast.success("Profil mis à jour avec succès");
      } else {
        toast.error("Erreur lors de la mise à jour du profil");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Paramètres</h1>
        <p className="text-gray-600">
          Gérez vos informations personnelles et votre profil d'étudiant
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Photo Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Photo de profil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-semibold text-xl overflow-hidden">
                  {formData.profilePhoto ? (
                    <img
                      src={formData.profilePhoto}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8" />
                  )}
                </div>
                {uploadingPhoto && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <Label htmlFor="profilePhoto">Sélectionner une image</Label>
                  <div className="flex gap-2 mt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Choisir une image
                    </Button>
                    {formData.profilePhoto && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={removeProfilePhoto}
                        disabled={uploadingPhoto}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                        Supprimer
                      </Button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
                <div>
                  <Label htmlFor="profilePhotoUrl">Ou entrer une URL</Label>
                  <Input
                    id="profilePhotoUrl"
                    type="url"
                    value={
                      formData.profilePhoto.startsWith("data:")
                        ? ""
                        : formData.profilePhoto
                    }
                    onChange={(e) =>
                      handleInputChange("profilePhoto", e.target.value)
                    }
                    placeholder="https://example.com/photo.jpg"
                    className="mt-1"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Formats acceptés: JPG, PNG, GIF. Taille max: 5MB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  placeholder="Votre prénom"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  placeholder="Votre nom"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="votre@email.com"
              />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Téléphone</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) =>
                  handleInputChange("phoneNumber", e.target.value)
                }
                placeholder="Votre numéro de téléphone"
              />
            </div>
          </CardContent>
        </Card>

        {/* Academic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations académiques</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="education">Niveau d'études</Label>
              <Select
                value={formData.education}
                onValueChange={(value) => handleInputChange("education", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez votre niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lycee">Lycée</SelectItem>
                  <SelectItem value="bac">Bac</SelectItem>
                  <SelectItem value="bac+2">Bac+2</SelectItem>
                  <SelectItem value="bac+3">Bac+3</SelectItem>
                  <SelectItem value="bac+4">Bac+4</SelectItem>
                  <SelectItem value="bac+5">Bac+5</SelectItem>
                  <SelectItem value="doctorat">Doctorat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="subjects">Matières d'intérêt</Label>
              <Textarea
                id="subjects"
                value={formData.subjects.join(", ")}
                onChange={(e) =>
                  handleInputChange("subjects", e.target.value.split(", "))
                }
                placeholder="Mathématiques, Physique, Chimie, Anglais..."
                rows={3}
              />
              <p className="text-sm text-gray-500 mt-1">
                Séparez les matières par des virgules
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="min-w-[120px]"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
