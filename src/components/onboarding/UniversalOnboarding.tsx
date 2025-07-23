"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface UniversalOnboardingProps {
  entityId: string;
  userName: string;
  role: "student" | "tutor";
  onComplete: () => void;
  initialData?: any;
}

export function UniversalOnboarding({
  entityId,
  userName,
  role,
  onComplete,
  initialData,
}: UniversalOnboardingProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    bio: initialData?.bio || "",
    subjects: initialData?.subjects || [],
    hourlyRate: initialData?.hourlyRate || "",
    experience: initialData?.experience || "",
    education: initialData?.education || "",
    photoUrl: initialData?.photoUrl || "",
  });

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    try {
      // Update user profile with onboarding data
      const response = await fetch(`/api/users/${entityId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          onboardingCompleted: true,
        }),
      });

      if (response.ok) {
        onComplete();
      } else {
        console.error("Failed to complete onboarding");
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Informations personnelles</h2>
            <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Votre numéro de téléphone"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              {role === "tutor"
                ? "Profil professionnel"
                : "Informations académiques"}
            </h2>
            {role === "tutor" ? (
              <>
                <div>
                  <Label htmlFor="bio">Biographie</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Parlez-nous de votre expérience..."
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="hourlyRate">Tarif horaire (€)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) =>
                      handleInputChange("hourlyRate", e.target.value)
                    }
                    placeholder="25"
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Expérience</Label>
                  <Textarea
                    id="experience"
                    value={formData.experience}
                    onChange={(e) =>
                      handleInputChange("experience", e.target.value)
                    }
                    placeholder="Décrivez votre expérience..."
                    rows={3}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="education">Niveau d'études</Label>
                  <Select
                    value={formData.education}
                    onValueChange={(value) =>
                      handleInputChange("education", value)
                    }
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
                    placeholder="Mathématiques, Physique, Chimie..."
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Finalisation</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Récapitulatif</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <strong>Nom:</strong> {formData.firstName} {formData.lastName}
                </p>
                <p>
                  <strong>Email:</strong> {formData.email}
                </p>
                <p>
                  <strong>Téléphone:</strong> {formData.phone}
                </p>
                {role === "tutor" && (
                  <>
                    <p>
                      <strong>Tarif horaire:</strong> {formData.hourlyRate}€
                    </p>
                    <p>
                      <strong>Bio:</strong> {formData.bio.substring(0, 50)}...
                    </p>
                  </>
                )}
                {role === "student" && (
                  <>
                    <p>
                      <strong>Niveau:</strong> {formData.education}
                    </p>
                    <p>
                      <strong>Matières:</strong> {formData.subjects.join(", ")}
                    </p>
                  </>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Cliquez sur "Terminer" pour finaliser votre profil.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center">
            Bienvenue {userName} ! 👋
          </CardTitle>
          <p className="text-center text-gray-600">
            Complétez votre profil pour commencer
          </p>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Étape {step} sur 3</span>
              <span className="text-sm text-gray-500">
                {Math.round((step / 3) * 100)}% terminé
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          {renderStep()}

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
            >
              Précédent
            </Button>
            <Button onClick={handleNext}>
              {step === 3 ? "Terminer" : "Suivant"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
