// Fichier : /src/components/student/EditStudentModal.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Student } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, GraduationCap, Euro, Calendar } from "lucide-react";
import { toast } from "sonner";

interface EditStudentModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Student) => void;
}

export function EditStudentModal({
  student,
  isOpen,
  onClose,
  onSave,
}: EditStudentModalProps) {
  const [formData, setFormData] = useState<Student>({
    ...student,
    age: student.age !== undefined ? student.age : undefined,
    email: student.email || "",
    grade: student.grade || "",
    phoneNumber: student.phoneNumber || "",
    hourlyRate:
      student.hourlyRate !== undefined ? student.hourlyRate : undefined,
  });
  const [loading, setLoading] = useState(false);

  // Update form data when student prop changes
  useEffect(() => {
    setFormData({
      ...student,
      age: student.age !== undefined ? student.age : undefined,
      email: student.email || "",
      grade: student.grade || "",
      phoneNumber: student.phoneNumber || "",
      hourlyRate:
        student.hourlyRate !== undefined ? student.hourlyRate : undefined,
    });
  }, [student]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    if (name === "age") {
      const ageValue = value === "" ? undefined : parseInt(value, 10);
      if (!isNaN(ageValue as number)) {
        setFormData({ ...formData, [name]: ageValue });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          age: formData.age !== undefined ? formData.age : null,
          hourlyRate:
            formData.hourlyRate !== undefined ? formData.hourlyRate : null,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Erreur API:", errorText);
        toast.error("Erreur lors de la mise à jour de l'étudiant");
        return;
      }

      const updated = await res.json();
      onSave(updated);
      onClose();
      toast.success("Étudiant mis à jour avec succès");
    } catch (err) {
      console.error("Erreur lors de la modification", err);
      toast.error("Une erreur est survenue lors de la modification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Modifier l'étudiant
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-6"
        >
          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Informations personnelles
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="firstName"
                  className="text-sm font-medium text-gray-700"
                >
                  Prénom *
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName || ""}
                  onChange={handleChange}
                  placeholder="Prénom de l'étudiant"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="lastName"
                  className="text-sm font-medium text-gray-700"
                >
                  Nom *
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName || ""}
                  onChange={handleChange}
                  placeholder="Nom de l'étudiant"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="age"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Âge *
                </Label>
                <Input
                  id="age"
                  name="age"
                  value={
                    formData.age !== undefined && formData.age !== null
                      ? formData.age.toString()
                      : ""
                  }
                  onChange={handleChange}
                  placeholder="Âge de l'étudiant"
                  type="number"
                  min="3"
                  max="120"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="grade"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  <GraduationCap className="h-4 w-4" />
                  Niveau scolaire *
                </Label>
                <Input
                  id="grade"
                  name="grade"
                  value={formData.grade || ""}
                  onChange={handleChange}
                  placeholder="Ex: 6ème, 3ème, Terminale..."
                />
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Informations de contact
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email *
                </Label>
                <Input
                  id="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  placeholder="email@exemple.com"
                  type="email"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="phoneNumber"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  Numéro de téléphone
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber || ""}
                  onChange={handleChange}
                  placeholder="06 12 34 56 78"
                  type="tel"
                />
              </div>
            </div>
          </div>

          {/* Financial Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Euro className="h-5 w-5 text-primary" />
              Informations tarifaires
            </h3>

            <div className="space-y-2">
              <Label
                htmlFor="hourlyRate"
                className="text-sm font-medium text-gray-700"
              >
                Tarif horaire (€/h)
              </Label>
              <Input
                id="hourlyRate"
                name="hourlyRate"
                value={
                  formData.hourlyRate !== undefined &&
                  formData.hourlyRate !== null
                    ? formData.hourlyRate.toString()
                    : ""
                }
                onChange={(e) => {
                  const value = e.target.value;
                  const hourlyRateValue =
                    value === "" ? undefined : parseFloat(value);
                  if (value === "" || !isNaN(hourlyRateValue as number)) {
                    setFormData({
                      ...formData,
                      hourlyRate: hourlyRateValue,
                    });
                  }
                }}
                placeholder="25"
                type="number"
                min="0"
                step="0.01"
              />
              <p className="text-xs text-gray-500">
                Laissez vide pour utiliser le tarif par défaut
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-white font-semibold"
            >
              {loading ? "Modification..." : "Enregistrer les modifications"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
