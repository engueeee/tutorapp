"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ContactInfoStepProps {
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  onInputChange: (field: string, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ContactInfoStep({
  formData,
  onInputChange,
  onNext,
  onBack,
}: ContactInfoStepProps) {
  const isValid = formData.firstName && formData.lastName && formData.email;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-center">Informations personnelles</CardTitle>
        <p className="text-center text-gray-600">
          Remplissez vos informations de contact
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">Prénom *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => onInputChange("firstName", e.target.value)}
              placeholder="Votre prénom"
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName">Nom *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => onInputChange("lastName", e.target.value)}
              placeholder="Votre nom"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => onInputChange("email", e.target.value)}
            placeholder="votre@email.com"
            required
          />
        </div>

        <div>
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => onInputChange("phone", e.target.value)}
            placeholder="Votre numéro de téléphone"
          />
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            Précédent
          </Button>
          <Button onClick={onNext} disabled={!isValid}>
            Suivant
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
