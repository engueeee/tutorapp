"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OnboardingStepProps {
  title: string;
  description: string;
  children: ReactNode;
  onNext: () => void;
  onBack: () => void;
  canProceed?: boolean;
  step: number;
  totalSteps: number;
}

export function OnboardingStep({
  title,
  description,
  children,
  onNext,
  onBack,
  canProceed = true,
  step,
  totalSteps,
}: OnboardingStepProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center">{title}</CardTitle>
          <p className="text-center text-gray-600">{description}</p>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Étape {step} sur {totalSteps}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round((step / totalSteps) * 100)}% terminé
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {children}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack} disabled={step === 1}>
              Précédent
            </Button>
            <Button onClick={onNext} disabled={!canProceed}>
              {step === totalSteps ? "Terminer" : "Suivant"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
