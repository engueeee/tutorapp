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
import { Search, Filter, Calendar, Clock } from "lucide-react";

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
  course: {
    id: string;
    title: string;
  };
}

interface LessonsListProps {
  lessons: Lesson[];
  onEditLesson?: (lessonId: string) => void;
  onDeleteLesson?: (lessonId: string) => void;
}

type SortOption = "date" | "time" | "student" | "course";
type FilterOption = "all" | "today" | "upcoming" | "past";

export function LessonsList({
  lessons,
  onEditLesson,
  onDeleteLesson,
}: LessonsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");

  const filteredAndSortedLessons = useMemo(() => {
    let filtered = lessons;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (lesson) =>
          lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lesson.student.firstName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          lesson.student.lastName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          lesson.course.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          lesson.subject?.toLowerCase().includes(searchTerm.toLowerCase())
      );
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
          return `${a.student.firstName} ${a.student.lastName}`.localeCompare(
            `${b.student.firstName} ${b.student.lastName}`
          );
        case "course":
          return a.course.title.localeCompare(b.course.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [lessons, searchTerm, sortBy, filterBy]);

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
          {filteredAndSortedLessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              onEdit={onEditLesson}
              onDelete={onDeleteLesson}
            />
          ))}
        </div>
      )}
    </div>
  );
}
