import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Calendar } from "lucide-react";
import { SortOption, FilterOption } from "@/types";

interface SearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterBy: FilterOption;
  onFilterChange: (value: FilterOption) => void;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  searchPlaceholder?: string;
  className?: string;
}

export function SearchAndFilter({
  searchTerm,
  onSearchChange,
  filterBy,
  onFilterChange,
  sortBy,
  onSortChange,
  searchPlaceholder = "Rechercher...",
  className,
}: SearchAndFilterProps) {
  return (
    <div className={`flex flex-col sm:flex-row gap-4 ${className}`}>
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Select
          value={filterBy}
          onValueChange={(value: FilterOption) => onFilterChange(value)}
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
          onValueChange={(value: SortOption) => onSortChange(value)}
        >
          <SelectTrigger className="w-32">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Par date</SelectItem>
            <SelectItem value="time">Par heure</SelectItem>
            <SelectItem value="student">Par étudiant</SelectItem>
            <SelectItem value="course">Par cours</SelectItem>
            <SelectItem value="title">Par titre</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
