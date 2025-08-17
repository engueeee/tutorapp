# Composant ExportRevenuePdf

Ce composant permet de générer et télécharger des rapports PDF de revenus personnalisés pour les tuteurs.

## Fonctionnalités

- **Sélecteur de période** : Choix de dates de début et fin pour l'analyse
- **Aperçu des données** : Visualisation des revenus et leçons avant export
- **Génération PDF** : Création d'un rapport PDF professionnel avec jsPDF
- **Design cohérent** : Utilise les couleurs et composants du design system
- **Responsive** : Interface adaptée aux différentes tailles d'écran

## Utilisation

### Import du composant

```tsx
import { ExportRevenuePdf } from "@/components/dashboard/ExportRevenuePdf";
```

### Utilisation basique

```tsx
<ExportRevenuePdf />
```

### Avec classe personnalisée

```tsx
<ExportRevenuePdf className="max-w-2xl" />
```

## Structure du PDF généré

Le PDF contient :

1. **En-tête** : Logo TutorApp et titre "Rapport financier"
2. **Informations de période** : Dates de début et fin d'analyse
3. **Résumé financier** : Revenu total, nombre de leçons, revenu moyen
4. **Détail des leçons** : Tableau avec date, titre, élève, durée, montant
5. **Pied de page** : Numérotation des pages

## API Endpoint

Le composant utilise l'endpoint `/api/revenue/export` avec les paramètres :

- `tutorId` : ID du tuteur
- `startDate` : Date de début (YYYY-MM-DD)
- `endDate` : Date de fin (YYYY-MM-DD)

## Hook personnalisé

Le composant utilise le hook `useRevenueExport` qui :

- Gère les états de chargement et d'erreur
- Récupère les données depuis l'API
- Fournit un fallback avec des données mockées en cas d'erreur

## Types de données

```tsx
interface RevenueExportData {
  revenueTotal: number;
  lessons: LessonExportDetail[];
  period: {
    startDate: string;
    endDate: string;
  };
}

interface LessonExportDetail {
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
```

## Couleurs utilisées

- **Primary** : `#050f8b` (bleu principal)
- **Secondary** : `#dfb529` (jaune/doré)
- **Text** : `#374151` (gris foncé)
- **Background** : `#f3f4f6` (gris clair)

## Dépendances

- `jsPDF` : Génération du PDF
- `date-fns` : Manipulation des dates
- `lucide-react` : Icônes
- Composants UI du design system

## Personnalisation

Pour personnaliser le PDF, modifiez la fonction `generateRevenuePDF` dans le composant. Vous pouvez :

- Changer les couleurs
- Modifier la mise en page
- Ajouter des sections supplémentaires
- Personnaliser les polices et tailles

## Exemple d'intégration dans une page

```tsx
import { ExportRevenuePdf } from "@/components/dashboard/ExportRevenuePdf";

export default function RevenueExportPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">
          Export des revenus
        </h1>
        <p className="text-gray-600">
          Générez et téléchargez des rapports PDF détaillés
        </p>
      </div>

      <ExportRevenuePdf />
    </div>
  );
}
```
