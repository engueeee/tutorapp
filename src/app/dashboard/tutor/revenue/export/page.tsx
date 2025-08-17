import { ExportRevenuePdf } from "@/components/dashboard/ExportRevenuePdf";

export default function RevenueExportPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-400 text-transparent bg-clip-text mb-2">
          Export des revenus
        </h1>
        <p className="text-gray-600">
          Générez et téléchargez des rapports PDF détaillés de vos revenus
        </p>
      </div>

      <ExportRevenuePdf />
    </div>
  );
}
