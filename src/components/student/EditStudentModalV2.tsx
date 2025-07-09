import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  contact: string;
  grade: string;
}

interface EditStudentModalV2Props {
  open: boolean;
  student: Student | null;
  onClose: () => void;
  onSave: (updated: Partial<Student>) => void;
  onDelete: (studentId: string) => void;
}

export function EditStudentModalV2({
  open,
  student,
  onClose,
  onSave,
  onDelete,
}: EditStudentModalV2Props) {
  const [form, setForm] = useState<Partial<Student>>(student || {});
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  React.useEffect(() => {
    setForm(student || {});
    setDeleteConfirm(false);
  }, [student, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSave(form);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (student) {
      setLoading(true);
      await onDelete(student.id);
      setLoading(false);
    }
  };

  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier l'étudiant</DialogTitle>
        </DialogHeader>
        {deleteConfirm ? (
          <div className="space-y-6">
            <div className="text-lg">
              Voulez-vous vraiment supprimer cet étudiant ?
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(false)}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Supprimer
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="firstName"
              value={form.firstName || ""}
              onChange={handleChange}
              placeholder="Prénom"
              required
            />
            <Input
              name="lastName"
              value={form.lastName || ""}
              onChange={handleChange}
              placeholder="Nom"
              required
            />
            <Input
              name="age"
              type="number"
              value={form.age || ""}
              onChange={handleChange}
              placeholder="Âge"
              required
            />
            <Input
              name="contact"
              value={form.contact || ""}
              onChange={handleChange}
              placeholder="Contact"
              required
            />
            <Input
              name="grade"
              value={form.grade || ""}
              onChange={handleChange}
              placeholder="Niveau scolaire"
              required
            />
            <div className="flex justify-between gap-2">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setDeleteConfirm(true)}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Supprimer
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
