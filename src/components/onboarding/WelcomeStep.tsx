"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WelcomeStepProps {
  userName: string;
  role: "student" | "tutor";
  onNext: () => void;
}

export function WelcomeStep({ userName, role, onNext }: WelcomeStepProps) {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-center">Bienvenue {userName} ! 👋</CardTitle>
        <p className="text-center text-gray-600">
          {role === "tutor"
            ? "Commençons par configurer votre profil de tuteur"
            : "Commençons par configurer votre profil d'étudiant"}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">{role === "tutor" ? "👨‍🏫" : "📚"}</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {role === "tutor" ? "Vous êtes tuteur" : "Vous êtes étudiant"}
          </h3>
          <p className="text-gray-600">
            {role === "tutor"
              ? "Nous allons vous aider à créer votre profil professionnel pour commencer à donner des cours."
              : "Nous allons vous aider à configurer votre profil pour trouver le tuteur idéal."}
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Ce que nous allons faire :</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Remplir vos informations personnelles</li>
            <li>• Configurer votre profil professionnel</li>
            <li>• Finaliser votre inscription</li>
          </ul>
        </div>

        <div className="flex justify-center">
          <Button onClick={onNext} size="lg">
            Commencer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
