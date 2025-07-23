"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface CompletionStepProps {
  userName: string;
  role: "student" | "tutor";
  onComplete: () => void;
}

export function CompletionStep({
  userName,
  role,
  onComplete,
}: CompletionStepProps) {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-center">Félicitations ! 🎉</CardTitle>
        <p className="text-center text-gray-600">
          Votre profil est maintenant complet
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Bienvenue {userName} !</h3>
          <p className="text-gray-600">
            {role === "tutor"
              ? "Votre profil de tuteur est maintenant configuré. Vous pouvez commencer à proposer vos services et recevoir des demandes d'étudiants."
              : "Votre profil d'étudiant est maintenant configuré. Vous pouvez maintenant rechercher des tuteurs et réserver des cours."}
          </p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Prochaines étapes :</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            {role === "tutor" ? (
              <>
                <li>• Créer votre premier cours</li>
                <li>• Définir vos disponibilités</li>
                <li>• Recevoir vos premières demandes</li>
              </>
            ) : (
              <>
                <li>• Rechercher des tuteurs</li>
                <li>• Réserver votre premier cours</li>
                <li>• Commencer votre apprentissage</li>
              </>
            )}
          </ul>
        </div>

        <div className="flex justify-center pt-4">
          <Button onClick={onComplete} size="lg">
            Accéder au tableau de bord
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
