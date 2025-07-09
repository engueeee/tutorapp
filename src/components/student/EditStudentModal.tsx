// Fichier : /src/components/students/EditStudentModal.tsx

"use client";

import { useState } from "react";
import { Student } from "@/types/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function EditStudentModal({
  student,
  isOpen,
  onClose,
  onSave,
}: {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Student) => void;
}) {
  const [formData, setFormData] = useState<Student>(student);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Erreur API:", errorText);
        alert("Erreur lors de la mise à jour de l'étudiant");
        return;
      }

      const updated = await res.json();
      onSave(updated);
      onClose();
    } catch (err) {
      console.error("Erreur lors de la modification", err);
      alert("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = confirm("Supprimer cet étudiant ?");
    if (!confirmDelete) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Erreur suppression:", errorText);
        alert("Erreur lors de la suppression de l'étudiant");
        return;
      }

      onClose(); // Ferme la modale après suppression
      window.location.reload(); // Recharge la page pour mettre à jour la liste
    } catch (err) {
      console.error("Erreur lors de la suppression", err);
      alert("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier l'étudiant</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Prénom"
          />
          <Input
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Nom"
          />
          <Input
            name="age"
            value={formData.age.toString()}
            onChange={handleChange}
            placeholder="Âge"
            type="number"
          />
          <Input
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
            placeholder="Email de l'étudiant"
            type="email"
          />
          <Input
            name="grade"
            value={formData.grade || ""}
            onChange={handleChange}
            placeholder="Niveau scolaire"
          />
        </div>
        <div className="flex flex-col sm:flex-row justify-between gap-2 pt-6">
          <Button
            onClick={handleSubmit}
            disabled={loading}
            variant="primary"
            className="w-full sm:w-auto"
          >
            {loading ? "Modification..." : "Enregistrer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
