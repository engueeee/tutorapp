import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { LessonCard } from "./LessonCard";
import { QuickLessonCreationModal } from "@/components/courses/QuickLessonCreationModal";
import {
  Search,
  Filter,
  Calendar,
  Clock,
  Trash2,
  Plus,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Users,
  Edit,
  Video,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

interface Lesson {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  duration: string;
  zoomLink?: string;
  subject?: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    grade: string;
  };
  lessonStudents?: {
    student: {
      id: string;
      firstName: string;
      lastName: string;
      grade: string;
    };
  }[];
  course: {
    id: string;
    title: string;
  };
}

interface GroupedLessonsListProps {
  lessons: Lesson[];
  tutorId: string;
  loading?: boolean;
  onEditLesson?: (lessonId: string) => void;
  onDeleteLesson?: (lessonId: string) => void;
  onLessonsChanged?: () => void;
}

type SortOption = "date" | "time" | "student" | "course";
type FilterOption = "all" | "today" | "upcoming" | "past";

export function GroupedLessonsList({
  lessons,
  tutorId,
  loading = false,
  onEditLesson,
  onDeleteLesson,
  onLessonsChanged,
}: GroupedLessonsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(
    new Set()
  );
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [selectedCourseForQuickCreate, setSelectedCourseForQuickCreate] =
    useState<string>("");

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
        const studentMatch =
          lesson.student?.firstName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          lesson.student?.lastName
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        // Check multiple students
        const lessonStudentsMatch = lesson.lessonStudents?.some(
          (ls) =>
            ls.student?.firstName
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            ls.student?.lastName
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
        );

        return (
          titleMatch ||
          subjectMatch ||
          courseMatch ||
          studentMatch ||
          lessonStudentsMatch
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
          return (
            lessonDate >= today &&
            lessonDate < new Date(today.getTime() + 24 * 60 * 60 * 1000)
          );
        });
        break;
      case "upcoming":
        filtered = filtered.filter((lesson) => {
          const lessonDate = new Date(lesson.date);
          return lessonDate >= today;
        });
        break;
      case "past":
        filtered = filtered.filter((lesson) => {
          const lessonDate = new Date(lesson.date);
          return lessonDate < today;
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
          return a.student.firstName.localeCompare(b.student.firstName);
        case "course":
          return a.course.title.localeCompare(b.course.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [displayLessons, searchTerm, filterBy, sortBy]);

  // Group lessons by course
  const groupedLessons = useMemo(() => {
    const groups: Record<string, { course: any; lessons: Lesson[] }> = {};

    filteredAndSortedLessons.forEach((lesson) => {
      const courseId = lesson.course.id;
      if (!groups[courseId]) {
        groups[courseId] = {
          course: lesson.course,
          lessons: [],
        };
      }
      groups[courseId].lessons.push(lesson);
    });

    return Object.values(groups);
  }, [filteredAndSortedLessons]);

  const toggleCourseExpansion = (courseId: string) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      newExpanded.add(courseId);
    }
    setExpandedCourses(newExpanded);
  };

  const handleQuickCreate = (courseId?: string) => {
    if (courseId) {
      setSelectedCourseForQuickCreate(courseId);
    } else {
      setSelectedCourseForQuickCreate("");
    }
    setQuickCreateOpen(true);
  };

  const handleLessonCreated = () => {
    if (onLessonsChanged) {
      onLessonsChanged();
    }
    setQuickCreateOpen(false);
  };

  const handleDelete = (lessonId: string) => {
    const lesson = displayLessons.find((l) => l.id === lessonId);
    if (lesson) {
      setDeleteLesson(lesson);
      setDeleteOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteLesson) return;

    try {
      const { lessonsApi } = await import("@/lib/api");
      await lessonsApi.delete(deleteLesson.id);

      // Optimistically update local state
      setLocalLessons(
        (prev) =>
          prev?.filter((lesson) => lesson.id !== deleteLesson.id) ||
          lessons.filter((lesson) => lesson.id !== deleteLesson.id)
      );

      setDeleteOpen(false);
      setDeleteLesson(null);

      if (onLessonsChanged) {
        onLessonsChanged();
      }
    } catch (error) {
      // Handle error silently or show toast
    }
  };

  const getStudentNames = (lesson: Lesson) => {
    // Collect all unique students
    const students = new Map<string, any>();

    // Add main student
    if (lesson.student) {
      students.set(lesson.student.id, lesson.student);
    }

    // Add additional students from lessonStudents
    if (lesson.lessonStudents) {
      lesson.lessonStudents.forEach((ls) => {
        if (ls.student) {
          students.set(ls.student.id, ls.student);
        }
      });
    }

    // Convert to array and format names
    const uniqueStudents = Array.from(students.values());
    const studentNames = uniqueStudents.map(
      (s) => `${s.firstName} ${s.lastName.charAt(0).toUpperCase()}.`
    );

    if (studentNames.length <= 3) {
      return studentNames.join(" | ");
    } else {
      return studentNames.slice(0, 3).join(", ") + "...";
    }
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "dd/MM/yyyy", { locale: fr });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  return (
    <div className="space-y-6">
      {/* Header with Quick Create Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#050f8b]">Leçons</h2>
          <p className="text-gray-600">Gérez vos leçons organisées par cours</p>
        </div>
        <QuickLessonCreationModal
          tutorId={tutorId}
          onLessonCreated={handleLessonCreated}
          selectedCourseId={selectedCourseForQuickCreate}
          open={quickCreateOpen}
          onOpenChange={setQuickCreateOpen}
          trigger={
            <Button className="bg-[#050f8b] hover:bg-[#050f8b]/90">
              <Plus className="h-4 w-4 mr-2" />
              Créer une leçon
            </Button>
          }
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher une leçon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select
            value={filterBy}
            onValueChange={(value: FilterOption) => setFilterBy(value)}
          >
            <SelectTrigger className="w-32">
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
            <SelectTrigger className="w-32">
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

      {/* Grouped Lessons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        {loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-[#dfb529] h-fit animate-pulse">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5 bg-gray-200 rounded"></div>
                      <div className="min-w-0 flex-1">
                        <div className="h-5 bg-gray-200 rounded mb-2"></div>
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 bg-gray-200 rounded"></div>
                          <div className="h-4 w-16 bg-gray-200 rounded"></div>
                          <div className="h-4 w-4 bg-gray-200 rounded"></div>
                          <div className="h-4 w-16 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {[1, 2, 3].map((j) => (
                      <div
                        key={j}
                        className="p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="min-w-0 flex-1">
                            <div className="h-4 bg-gray-200 rounded mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <div className="h-6 w-6 bg-gray-200 rounded"></div>
                            <div className="h-6 w-6 bg-gray-200 rounded"></div>
                            <div className="h-6 w-6 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        ) : groupedLessons.length === 0 ? (
          <Card className="p-8 text-center col-span-full">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune leçon trouvée
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterBy !== "all"
                ? "Aucune leçon ne correspond à vos critères de recherche."
                : "Commencez par créer votre première leçon."}
            </p>
            <QuickLessonCreationModal
              tutorId={tutorId}
              onLessonCreated={handleLessonCreated}
              trigger={
                <Button className="bg-[#050f8b] hover:bg-[#050f8b]/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer une leçon
                </Button>
              }
            />
          </Card>
        ) : (
          groupedLessons.map(({ course, lessons }) => {
            const isExpanded = expandedCourses.has(course.id);
            const visibleLessons = isExpanded ? lessons : lessons.slice(0, 3);
            const hasMoreLessons = lessons.length > 3;

            return (
              <Card key={course.id} className="border-[#dfb529] h-fit">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-[#050f8b]" />
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg text-[#050f8b] truncate">
                          {course.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {lessons.length}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {
                              new Set(
                                lessons.flatMap((l) => [
                                  l.student.id,
                                  ...(l.lessonStudents?.map(
                                    (ls) => ls.student.id
                                  ) || []),
                                ])
                              ).size
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <QuickLessonCreationModal
                        tutorId={tutorId}
                        onLessonCreated={handleLessonCreated}
                        selectedCourseId={course.id}
                        trigger={
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => toggleCourseExpansion(course.id)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {visibleLessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-gray-900 truncate">
                              {lesson.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {formatDate(lesson.date)} à{" "}
                              {formatTime(lesson.startTime)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            {lesson.zoomLink && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700"
                                onClick={() =>
                                  window.open(lesson.zoomLink, "_blank")
                                }
                                title="Ouvrir le lien Zoom"
                              >
                                <Video className="h-3 w-3" />
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(lesson.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {getStudentNames(lesson)}
                        </div>
                      </div>
                    ))}
                    {hasMoreLessons && !isExpanded && (
                      <div className="text-center pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCourseExpansion(course.id)}
                          className="text-[#050f8b] hover:text-[#050f8b]/80 text-xs"
                        >
                          +{lessons.length - 3} autres
                        </Button>
                      </div>
                    )}
                    {isExpanded && hasMoreLessons && (
                      <div className="text-center pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCourseExpansion(course.id)}
                          className="text-[#050f8b] hover:text-[#050f8b]/80"
                        >
                          Voir moins
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la leçon</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Êtes-vous sûr de vouloir supprimer la leçon "{deleteLesson?.title}
              " ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>
                Supprimer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
