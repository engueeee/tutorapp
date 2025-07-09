import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Lesson {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  duration: string;
  zoomLink?: string;
  subject?: string;
}

interface EditLessonModalProps {
  open: boolean;
  lesson: Lesson | null;
  onClose: () => void;
  onSave: (updated: Partial<Lesson>) => void;
}

export function EditLessonModal({
  open,
  lesson,
  onClose,
  onSave,
}: EditLessonModalProps) {
  const [form, setForm] = useState<Partial<Lesson>>(lesson || {});
  const [loading, setLoading] = useState(false);

  // Update form state when lesson changes
  React.useEffect(() => {
    setForm(lesson || {});
  }, [lesson]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSave(form);
    setLoading(false);
  };

  if (!lesson) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier la leçon</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="title"
            value={form.title || ""}
            onChange={handleChange}
            placeholder="Titre"
            required
          />
          <Textarea
            name="description"
            value={form.description || ""}
            onChange={handleChange}
            placeholder="Description"
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              name="date"
              type="date"
              value={form.date || ""}
              onChange={handleChange}
              required
            />
            <Input
              name="startTime"
              type="time"
              value={form.startTime || ""}
              onChange={handleChange}
              required
            />
          </div>
          <Input
            name="duration"
            value={form.duration || ""}
            onChange={handleChange}
            placeholder="Durée"
            required
          />
          <Input
            name="zoomLink"
            value={form.zoomLink || ""}
            onChange={handleChange}
            placeholder="Lien Zoom (optionnel)"
          />
          <Input
            name="subject"
            value={form.subject || ""}
            onChange={handleChange}
            placeholder="Sujet (optionnel)"
          />
          <div className="flex justify-end gap-2">
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
