export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Accès refusé</h1>
      <p className="text-lg text-gray-700 mb-8">
        Vous n'avez pas les droits pour accéder à cette page.
      </p>
      <a href="/login" className="text-blue-600 underline">
        Retour à l'accueil
      </a>
    </div>
  );
}
