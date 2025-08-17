"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare, Save, X } from "lucide-react";
import { Lesson } from "@/modules/dashboard/types";
import { toast } from "sonner";

interface LessonCommentModalProps {
  lesson: Lesson;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCommentSaved?: (lesson: Lesson) => void;
}

export function LessonCommentModal({
  lesson,
  open,
  onOpenChange,
  onCommentSaved,
}: LessonCommentModalProps) {
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setComment(lesson.tutorComment || "");
      setError("");
    }
  }, [open, lesson.tutorComment]);

  const handleSave = async () => {
    if (!comment.trim()) {
      setError("Le commentaire ne peut pas être vide");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/lessons/comment`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonId: lesson.id,
          tutorComment: comment.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save comment");
      }

      const updatedLesson = await response.json();
      onCommentSaved?.(updatedLesson);
      onOpenChange(false);
      toast.success("Commentaire sauvegardé avec succès", {
        description:
          "Le résumé de la leçon a été enregistré et sera visible par l'étudiant.",
      });
    } catch (error) {
      setError(
        `Erreur lors de la sauvegarde du commentaire: ${
          error instanceof Error ? error.message : "Erreur inconnue"
        }`
      );
      toast.error("Erreur lors de la sauvegarde du commentaire");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/lessons/comment`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lessonId: lesson.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      const updatedLesson = await response.json();
      onCommentSaved?.(updatedLesson);
      onOpenChange(false);
      toast.success("Commentaire supprimé avec succès", {
        description: "Le résumé de la leçon a été supprimé.",
      });
    } catch (error) {
      setError("Erreur lors de la suppression du commentaire");
      toast.error("Erreur lors de la suppression du commentaire");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Commentaire de la leçon
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Lesson Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-1">
              {lesson.title || "Leçon sans titre"}
            </h4>
            <p className="text-sm text-gray-600">
              {formatDate(lesson.date)} • {lesson.startTime}
            </p>
            {lesson.subject && (
              <p className="text-sm text-gray-500 mt-1">
                Matière: {lesson.subject}
              </p>
            )}
          </div>

          {/* Comment Form */}
          <div className="space-y-2">
            <Label htmlFor="comment">
              Résumé de la leçon (visible par l'étudiant)
            </Label>
            <Textarea
              id="comment"
              placeholder="Décrivez ce qui a été abordé pendant cette leçon, les points importants, les exercices réalisés..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={6}
              className="resize-none"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          {lesson.tutorComment && (
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Supprimer
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || !comment.trim()}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isLoading ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
