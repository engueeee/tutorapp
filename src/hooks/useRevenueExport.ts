import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export interface RevenueExportData {
  revenueTotal: number;
  lessons: LessonExportDetail[];
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface LessonExportDetail {
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

export function useRevenueExport(
  startDate: string,
  endDate: string,
  studentId?: string
) {
  const { user } = useAuth();
  const [data, setData] = useState<RevenueExportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!startDate || !endDate || !user || user.role !== "tutor") {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    const fetchRevenueData = async () => {
      try {
        // Construire l'URL avec les paramètres
        const params = new URLSearchParams({
          tutorId: user.id,
          startDate,
          endDate,
        });

        // Ajouter le filtre étudiant si spécifié
        if (studentId && studentId !== "all") {
          params.append("studentId", studentId);
        }

        const response = await fetch(
          `/api/revenue/export?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const revenueData = await response.json();
        setData(revenueData);
      } catch (err) {
        console.error(
          "Erreur lors de la récupération des données de revenus:",
          err
        );
        setError("Erreur lors du chargement des données de revenus");

        // Fallback avec des données mockées en cas d'erreur
        const mockData: RevenueExportData = {
          revenueTotal: 1250.5,
          period: { startDate, endDate },
          lessons: [
            {
              id: "1",
              date: "2024-01-15",
              duration: "1h30",
              title: "Mathématiques - Algèbre",
              student: { firstName: "Marie", lastName: "Dupont" },
              price: 45.0,
              courseTitle: "Mathématiques Terminale",
            },
            {
              id: "2",
              date: "2024-01-16",
              duration: "2h",
              title: "Physique - Mécanique",
              student: { firstName: "Pierre", lastName: "Martin" },
              price: 60.0,
              courseTitle: "Physique Première",
            },
            {
              id: "3",
              date: "2024-01-17",
              duration: "1h",
              title: "Chimie - Réactions",
              student: { firstName: "Sophie", lastName: "Bernard" },
              price: 30.0,
              courseTitle: "Chimie Terminale",
            },
            {
              id: "4",
              date: "2024-01-18",
              duration: "1h30",
              title: "Mathématiques - Géométrie",
              student: { firstName: "Lucas", lastName: "Petit" },
              price: 45.0,
              courseTitle: "Mathématiques Première",
            },
            {
              id: "5",
              date: "2024-01-19",
              duration: "2h",
              title: "Physique - Électricité",
              student: { firstName: "Emma", lastName: "Rousseau" },
              price: 60.0,
              courseTitle: "Physique Terminale",
            },
          ],
        };

        setData(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, [startDate, endDate, user, studentId]);

  return { data, loading, error };
}
