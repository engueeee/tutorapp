import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LessonCard } from "./LessonCard";
import { Search, Filter, Calendar, Clock, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  grade?: string;
}

interface Lesson {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  duration: string;
  zoomLink?: string;
  subject?: string;
  student: Student;
  lessonStudents?: {
    student: Student;
  }[];
  course: {
    id: string;
    title: string;
  };
}

interface LessonsListProps {
  lessons: Lesson[];
  tutorId: string;
  onEditLesson?: (lessonId: string) => void;
  onDeleteLesson?: (lessonId: string) => void;
  onLessonsChanged?: () => void;
}

type SortOption = "date" | "time" | "student" | "course";
type FilterOption = "all" | "today" | "upcoming" | "past";

export function LessonsList({
  lessons,
  tutorId,
  onEditLesson,
  onDeleteLesson,
  onLessonsChanged,
}: LessonsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");

  // Edit modal state
  const [editLesson, setEditLesson] = useState<Lesson | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  // Delete dialog state
  const [deleteLesson, setDeleteLesson] = useState<Lesson | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  // Local lessons state for optimistic update
  const [localLessons, setLocalLessons] = useState<Lesson[] | null>(null);

  // Use local state if available (after edit/delete), else use prop
  const displayLessons = localLessons || lessons;

  const filteredAndSortedLessons = useMemo(() => {
    let filtered = displayLessons;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((lesson) => {
        const titleMatch = lesson.title
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const subjectMatch = lesson.subject
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
        const courseMatch = lesson.course.title
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

        // Check single student
        const singleStudentMatch =
          lesson.student &&
          (lesson.student.firstName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
            lesson.student.lastName
              .toLowerCase()
              .includes(searchTerm.toLowerCase()));

        // Check multiple students
        const multipleStudentsMatch = lesson.lessonStudents?.some(
          (ls) =>
            ls.student.firstName
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            ls.student.lastName.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return (
          titleMatch ||
          subjectMatch ||
          courseMatch ||
          singleStudentMatch ||
          multipleStudentsMatch
        );
      });
    }

    // Filter by date
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (filterBy) {
      case "today":
        filtered = filtered.filter((lesson) => {
          const lessonDate = new Date(lesson.date);
          const lessonDay = new Date(
            lessonDate.getFullYear(),
            lessonDate.getMonth(),
            lessonDate.getDate()
          );
          return lessonDay.getTime() === today.getTime();
        });
        break;
      case "upcoming":
        filtered = filtered.filter((lesson) => {
          const lessonDate = new Date(lesson.date);
          const lessonDay = new Date(
            lessonDate.getFullYear(),
            lessonDate.getMonth(),
            lessonDate.getDate()
          );
          return lessonDay >= today;
        });
        break;
      case "past":
        filtered = filtered.filter((lesson) => {
          const lessonDate = new Date(lesson.date);
          const lessonDay = new Date(
            lessonDate.getFullYear(),
            lessonDate.getMonth(),
            lessonDate.getDate()
          );
          return lessonDay < today;
        });
        break;
    }

    // Sort lessons
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "time":
          return a.startTime.localeCompare(b.startTime);
        case "student":
          // Get the first student name for sorting (either from lessonStudents or single student)
          const getStudentName = (lesson: Lesson) => {
            if (lesson.lessonStudents && lesson.lessonStudents.length > 0) {
              const firstStudent = lesson.lessonStudents[0].student;
              return `${firstStudent.firstName} ${firstStudent.lastName}`;
            }
            return `${lesson.student.firstName} ${lesson.student.lastName}`;
          };
          return getStudentName(a).localeCompare(getStudentName(b));
        case "course":
          return a.course.title.localeCompare(b.course.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [displayLessons, searchTerm, sortBy, filterBy]);

  const getStats = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const todayLessons = lessons.filter((lesson) => {
      const lessonDate = new Date(lesson.date);
      const lessonDay = new Date(
        lessonDate.getFullYear(),
        lessonDate.getMonth(),
        lessonDate.getDate()
      );
      return lessonDay.getTime() === today.getTime();
    });

    const upcomingLessons = lessons.filter((lesson) => {
      const lessonDate = new Date(lesson.date);
      const lessonDay = new Date(
        lessonDate.getFullYear(),
        lessonDate.getMonth(),
        lessonDate.getDate()
      );
      return lessonDay > today;
    });

    return {
      total: lessons.length,
      today: todayLessons.length,
      upcoming: upcomingLessons.length,
    };
  };

  const stats = getStats();

  // Edit handler
  const handleEdit = (lessonId: string) => {
    const lesson = displayLessons.find((l) => l.id === lessonId) || null;
    setEditLesson(lesson);
    setEditOpen(true);
  };
  // Save edit
  // Delete handler
  const handleDelete = (lessonId: string) => {
    const lesson = displayLessons.find((l) => l.id === lessonId) || null;
    setDeleteLesson(lesson);
    setDeleteOpen(true);
  };
  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!deleteLesson) return;
    try {
      const { lessonsApi } = await import("@/lib/api");
      await lessonsApi.delete(deleteLesson.id);

      // Optimistic update - immediately remove from UI
      setLocalLessons(displayLessons.filter((l) => l.id !== deleteLesson.id));
      setDeleteOpen(false);

      if (onLessonsChanged) onLessonsChanged();
    } catch (error) {
      // Handle error silently or show toast
      console.error("Error deleting lesson:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leçons</h2>
          <p className="text-gray-600">
            {stats.total} leçons au total • {stats.today} aujourd'hui •{" "}
            {stats.upcoming} à venir
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher par titre, étudiant, cours..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select
            value={filterBy}
            onValueChange={(value: FilterOption) => setFilterBy(value)}
          >
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="today">Aujourd'hui</SelectItem>
              <SelectItem value="upcoming">À venir</SelectItem>
              <SelectItem value="past">Passées</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={(value: SortOption) => setSortBy(value)}
          >
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Par date</SelectItem>
              <SelectItem value="time">Par heure</SelectItem>
              <SelectItem value="student">Par étudiant</SelectItem>
              <SelectItem value="course">Par cours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        {filteredAndSortedLessons.length} leçon
        {filteredAndSortedLessons.length !== 1 ? "s" : ""} trouvée
        {filteredAndSortedLessons.length !== 1 ? "s" : ""}
      </div>

      {/* Lessons Grid */}
      {filteredAndSortedLessons.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune leçon trouvée
          </h3>
          <p className="text-gray-600">
            {searchTerm || filterBy !== "all"
              ? "Essayez de modifier vos critères de recherche ou de filtres."
              : "Aucune leçon n'est programmée pour le moment."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedLessons.map((lesson) =>
            lesson.student ? (
              <LessonCard
                key={`${lesson.id}-${lesson.startTime}-${lesson.student.id}`}
                lesson={lesson as any}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ) : null
          )}
        </div>
      )}

      {/* Edit Modal - Removed as component doesn't exist */}

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la leçon</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Voulez-vous vraiment supprimer cette leçon ?
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              <Trash2 className="h-4 w-4 mr-1" /> Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
