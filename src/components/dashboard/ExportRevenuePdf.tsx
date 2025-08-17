"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/datepicker";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  Calendar,
  DollarSign,
  Clock,
  User,
  FileText,
  AlertCircle,
  CheckCircle,
  Users,
  X,
} from "lucide-react";
import {
  format,
  parseISO,
  isAfter,
  isBefore,
  startOfDay,
  endOfDay,
  subDays,
  subMonths,
  subYears,
  startOfYear,
} from "date-fns";
import { fr } from "date-fns/locale";
import { useAuth } from "@/context/AuthContext";

// Types
interface LessonDetail {
  id: string;
  date: string;
  duration: string;
  title: string;
  student: {
    firstName: string;
    lastName: string;
  };
  price: number;
  courseTitle?: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

interface ExportRevenuePdfProps {
  className?: string;
}

// Predefined periods
const PERIOD_OPTIONS = [
  { label: "1 semaine", value: "1w", days: 7 },
  { label: "1 mois", value: "1m", months: 1 },
  { label: "3 mois", value: "3m", months: 3 },
  { label: "6 mois", value: "6m", months: 6 },
  { label: "1 an", value: "1y", years: 1 },
  { label: "Depuis le début", value: "start", special: "start" },
];

// Utility functions
function formatCurrency(value: number): string {
  return value.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

function formatDate(dateString: string): string {
  return format(parseISO(dateString), "dd/MM/yyyy", { locale: fr });
}

function formatDuration(duration: string): string {
  if (!duration) return "0h";

  const cleanDuration = duration.trim().toLowerCase();

  if (cleanDuration.includes("h")) {
    const parts = cleanDuration.split("h");
    if (parts.length === 2) {
      const hours = parseFloat(parts[0]) || 0;
      const minutes = parseFloat(parts[1]) || 0;
      return `${hours}h${minutes ? `${minutes}min` : ""}`;
    } else if (parts.length === 1) {
      const hours = parseFloat(parts[0]) || 0;
      return `${hours}h`;
    }
  }

  if (cleanDuration.includes(":")) {
    const [h, m] = cleanDuration.split(":").map(Number);
    return `${h}h${m ? `${m}min` : ""}`;
  }

  if (cleanDuration.includes(".")) {
    const hours = parseFloat(cleanDuration);
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h${minutes ? `${minutes}min` : ""}`;
  }

  const minutes = parseInt(cleanDuration, 10);
  if (!isNaN(minutes)) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins ? `${mins}min` : ""}`;
  }

  return "0h";
}

import {
  useRevenueExport,
  type RevenueExportData,
  type LessonExportDetail,
} from "@/hooks/useRevenueExport";

// Alias pour la compatibilité
type RevenueData = RevenueExportData;

// Note: PDF generation is now handled server-side via /api/revenue/generate-pdf

export function ExportRevenuePdf({ className }: ExportRevenuePdfProps) {
  const { user, token } = useAuth();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<string>("all");
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [authTimeout, setAuthTimeout] = useState(false);

  // Vérifier l'authentification et initialiser les dates
  useEffect(() => {
    // Attendre que le contexte d'authentification soit initialisé
    if (typeof window === "undefined") return;

    // Vérifier si l'utilisateur est authentifié
    if (!user || !token) {
      // Vérifier directement dans localStorage comme fallback
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (!storedToken || !storedUser) {
        window.location.href = "/login";
        return;
      }

      // Si on a les données dans localStorage mais pas dans le contexte,
      // on attend un peu plus pour que le contexte se mette à jour

      // Timeout après 3 secondes si le contexte ne se met pas à jour
      const timeout = setTimeout(() => {
        setAuthTimeout(true);
        setAuthChecked(true);

        // Initialiser avec le mois en cours
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const startDateStr = format(firstDay, "yyyy-MM-dd");
        const endDateStr = format(lastDay, "yyyy-MM-dd");

        setStartDate(startDateStr);
        setEndDate(endDateStr);
        setSelectedPeriod("1m"); // Définir 1 mois comme période par défaut
      }, 3000);

      return () => clearTimeout(timeout);
    }

    setAuthChecked(true);

    // Initialiser avec le mois en cours
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Le jour 0 du mois suivant = dernier jour du mois actuel

    const startDateStr = format(firstDay, "yyyy-MM-dd");
    const endDateStr = format(lastDay, "yyyy-MM-dd");

    setStartDate(startDateStr);
    setEndDate(endDateStr);
    setSelectedPeriod("1m"); // Définir 1 mois comme période par défaut
  }, [user, token]);

  // Fetch students for filter
  useEffect(() => {
    if (!user || user.role !== "tutor") return;

    // Fetch students
    fetch(`/api/students?tutorId=${user.id}`)
      .then(async (res) => {
        if (res.ok) {
          const studentsData = await res.json();
          setStudents(studentsData);
        }
      })
      .catch(console.error);
  }, [user]);

  const { data, loading, error } = useRevenueExport(
    startDate,
    endDate,
    selectedStudent
  );

  // Function to set period based on selection
  const handlePeriodSelect = (periodValue: string) => {
    const now = new Date();
    const endDateStr = format(now, "yyyy-MM-dd");
    let startDateStr = "";

    const period = PERIOD_OPTIONS.find((p) => p.value === periodValue);

    if (period) {
      if (period.special === "start") {
        // Depuis le début (1er janvier de l'année en cours)
        const startOfCurrentYear = startOfYear(now);
        startDateStr = format(startOfCurrentYear, "yyyy-MM-dd");
      } else if (period.days) {
        // Période en jours
        const startDate = subDays(now, period.days);
        startDateStr = format(startDate, "yyyy-MM-dd");
      } else if (period.months) {
        // Période en mois
        const startDate = subMonths(now, period.months);
        startDateStr = format(startDate, "yyyy-MM-dd");
      } else if (period.years) {
        // Période en années
        const startDate = subYears(now, period.years);
        startDateStr = format(startDate, "yyyy-MM-dd");
      }

      setStartDate(startDateStr);
      setEndDate(endDateStr);
      setSelectedPeriod(periodValue);
    }
  };

  const handleGeneratePDF = async () => {
    // Utiliser le token du contexte ou celui de localStorage comme fallback
    const authToken = token || localStorage.getItem("token");
    const authUser = user || JSON.parse(localStorage.getItem("user") || "null");

    if (!authUser || !authToken) {
      alert("Vous devez être connecté pour générer le PDF");
      return;
    }

    setIsGenerating(true);

    try {
      // Appeler l'API serveur pour générer le PDF
      const response = await fetch("/api/revenue/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          tutorId: authUser?.id,
          startDate,
          endDate,
          studentId: selectedStudent !== "all" ? selectedStudent : undefined,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expiré ou invalide
          alert("Votre session a expiré. Veuillez vous reconnecter.");
          window.location.href = "/login";
          return;
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.pdfData) {
        // Créer un lien de téléchargement avec les données base64
        const link = document.createElement("a");
        link.href = result.pdfData;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error("Erreur lors de la génération du PDF");
      }
    } catch (error) {
      alert("Erreur lors de la génération du PDF. Veuillez réessayer.");
    } finally {
      setIsGenerating(false);
    }
  };

  const isValidPeriod =
    startDate && endDate && isAfter(parseISO(endDate), parseISO(startDate));

  const hasActiveFilters = selectedStudent !== "all";

  const clearFilters = () => {
    setSelectedStudent("all");
  };

  // Afficher un état de chargement pendant la vérification de l'authentification
  if (!authChecked) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <LoadingSpinner />
          <span className="ml-2 text-gray-600">
            {authTimeout
              ? "Initialisation de l'export..."
              : "Vérification de l'authentification..."}
          </span>
        </CardContent>
      </Card>
    );
  }

  // Vérifier que l'utilisateur est un tuteur
  const currentUser =
    user || JSON.parse(localStorage.getItem("user") || "null");
  if (currentUser?.role !== "tutor") {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Accès non autorisé
            </h3>
            <p className="text-gray-600">
              Cette fonctionnalité est réservée aux tuteurs.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <FileText className="h-5 w-5" />
          Export du rapport de revenus
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Sélecteur de période */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Période d'analyse
          </h3>

          {/* Périodes prédéfinies */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Périodes prédéfinies
            </label>
            <div className="flex flex-wrap gap-2">
              {PERIOD_OPTIONS.map((period) => (
                <Badge
                  key={period.value}
                  variant={
                    selectedPeriod === period.value ? "primary" : "outline"
                  }
                  className={`cursor-pointer hover:bg-primary/10 transition-colors ${
                    selectedPeriod === period.value
                      ? "bg-primary text-white"
                      : "bg-white text-gray-700 border-gray-300"
                  }`}
                  onClick={() => handlePeriodSelect(period.value)}
                >
                  {period.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Sélecteur de dates personnalisées */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Période personnalisée
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de début
                </label>
                <DatePicker
                  value={startDate}
                  onChange={(date) => {
                    setStartDate(date);
                    setSelectedPeriod(""); // Clear predefined period when custom dates are selected
                  }}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de fin
                </label>
                <DatePicker
                  value={endDate}
                  onChange={(date) => {
                    setEndDate(date);
                    setSelectedPeriod(""); // Clear predefined period when custom dates are selected
                  }}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {startDate && endDate && !isValidPeriod && (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">
                La date de fin doit être postérieure à la date de début.
              </span>
            </div>
          )}
        </div>

        {/* Filtre par étudiant */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Filtres</h3>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrer par étudiant
              </label>
              <Select
                value={selectedStudent}
                onValueChange={setSelectedStudent}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les étudiants" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les étudiants</SelectItem>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.firstName} {student.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Effacer les filtres
                </Button>
              </div>
            )}
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {selectedStudent !== "all" && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <Users className="h-3 w-3" />
                    Étudiant:{" "}
                    {
                      students.find((s) => s.id === selectedStudent)?.firstName
                    }{" "}
                    {students.find((s) => s.id === selectedStudent)?.lastName}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Aperçu des données */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
            <span className="ml-2 text-gray-600">
              Chargement des données...
            </span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {data && !loading && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Aperçu du rapport
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-primary to-primary-600 text-white p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm opacity-90">Revenu total</span>
                </div>
                <div className="text-2xl font-bold">
                  {formatCurrency(data.revenueTotal)}
                </div>
              </div>

              <div className="bg-gradient-to-r from-secondary to-secondary-600 text-white p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm opacity-90">Leçons</span>
                </div>
                <div className="text-2xl font-bold">{data.lessons.length}</div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm opacity-90">Élèves uniques</span>
                </div>
                <div className="text-2xl font-bold">
                  {
                    new Set(
                      data.lessons.map(
                        (l) => l.student.firstName + l.student.lastName
                      )
                    ).size
                  }
                </div>
              </div>
            </div>

            {/* Liste des leçons */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">
                Leçons incluses dans le rapport
              </h4>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {data.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {lesson.title}
                        </div>
                        <div className="text-sm text-gray-600">
                          {lesson.student.firstName} {lesson.student.lastName} •{" "}
                          {formatDate(lesson.date)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-primary">
                        {formatCurrency(lesson.price)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDuration(lesson.duration)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!data && !loading && isValidPeriod && (
          <EmptyState
            icon={<FileText className="h-12 w-12 text-gray-400" />}
            title="Aucune donnée trouvée"
            description="Aucune leçon ou revenu n'a été trouvé pour la période et les filtres sélectionnés."
          />
        )}

        {/* Bouton d'export */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={handleGeneratePDF}
            disabled={!data || loading || !isValidPeriod || isGenerating}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            {isGenerating ? (
              <>
                <LoadingSpinner className="h-4 w-4" />
                Génération en cours...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Exporter en PDF
              </>
            )}
          </Button>
        </div>

        {/* Message d'information pendant la génération */}
        {isGenerating && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">
                Génération du PDF en cours... Veuillez patienter et ne pas
                fermer cette page.
              </span>
            </div>
          </div>
        )}

        {/* Informations supplémentaires */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>
            • Le rapport inclut toutes les leçons de la période sélectionnée
          </p>
          <p>
            • Les montants sont calculés selon les tarifs horaires en vigueur
          </p>
          <p>• Le fichier PDF sera téléchargé automatiquement</p>
          {hasActiveFilters && (
            <p>• Les filtres appliqués seront inclus dans le rapport</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
