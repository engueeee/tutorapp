"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Course } from "@/modules/dashboard/types";

interface EditCourseFormProps {
  course: Course;
  onSave: (updatedCourse: Partial<Course>) => void;
  onCancel: () => void;
}

export function EditCourseForm({
  course,
  onSave,
  onCancel,
}: EditCourseFormProps) {
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description || "");
  const [zoomLink, setZoomLink] = useState(course.zoomLink || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description: description || undefined,
      zoomLink: zoomLink || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Titre du cours</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Mathématiques niveau 1"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optionnel)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description du cours..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="zoomLink">Lien Zoom (optionnel)</Label>
        <Input
          id="zoomLink"
          value={zoomLink}
          onChange={(e) => setZoomLink(e.target.value)}
          placeholder="https://zoom.us/j/..."
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" className="bg-[#050f8b] hover:bg-[#050f8b]/90">
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
