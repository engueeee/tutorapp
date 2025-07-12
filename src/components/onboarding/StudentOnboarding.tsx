import { useState, useEffect } from "react";
import { OnboardingStep } from "./OnboardingStep";
import { WelcomeStep } from "./WelcomeStep";
import { ProfilePhotoStep } from "./ProfilePhotoStep";
import { ContactInfoStep } from "./ContactInfoStep";
import { CompletionStep } from "./CompletionStep";
import { toast } from "sonner";

interface StudentOnboardingProps {
  studentId: string;
  userName: string;
  onComplete: () => void;
}

interface OnboardingData {
  profilePhoto: string;
  phoneNumber: string;
  age: string;
  grade: string;
}

export function StudentOnboarding({
  studentId,
  userName,
  onComplete,
}: StudentOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    profilePhoto: "",
    phoneNumber: "",
    age: "",
    grade: "",
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePhotoChange = (photo: string) => {
    setOnboardingData((prev) => ({ ...prev, profilePhoto: photo }));
  };

  const handleContactChange = (data: {
    phoneNumber: string;
    age: string;
    grade: string;
  }) => {
    setOnboardingData((prev) => ({ ...prev, ...data }));
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: onboardingData.phoneNumber,
          profilePhoto: onboardingData.profilePhoto,
          age: onboardingData.age ? parseInt(onboardingData.age) : null,
          grade: onboardingData.grade,
          onboardingCompleted: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update student profile");
      }

      toast.success("Profil mis à jour avec succès !");
      onComplete();
    } catch (error) {
      console.error("Error updating student profile:", error);
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: // Welcome step
        return true;
      case 2: // Profile photo step
        return true; // Photo is optional
      case 3: // Contact info step
        return (
          onboardingData.phoneNumber.trim() !== "" ||
          onboardingData.age.trim() !== "" ||
          onboardingData.grade.trim() !== ""
        );
      case 4: // Completion step
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep userName={userName} />;
      case 2:
        return (
          <ProfilePhotoStep
            onPhotoChange={handlePhotoChange}
            currentPhoto={onboardingData.profilePhoto}
          />
        );
      case 3:
        return (
          <ContactInfoStep
            onDataChange={handleContactChange}
            initialData={{
              phoneNumber: onboardingData.phoneNumber,
              age: onboardingData.age,
              grade: onboardingData.grade,
            }}
          />
        );
      case 4:
        return (
          <CompletionStep
            userName={userName}
            profilePhoto={onboardingData.profilePhoto}
            phoneNumber={onboardingData.phoneNumber}
            age={onboardingData.age}
            grade={onboardingData.grade}
          />
        );
      default:
        return null;
    }
  };

  const getStepInfo = () => {
    switch (currentStep) {
      case 1:
        return {
          title: "Bienvenue sur TutorApp",
          description:
            "Commençons par configurer votre profil pour une expérience personnalisée",
        };
      case 2:
        return {
          title: "Photo de profil",
          description:
            "Ajoutez une photo pour personnaliser votre profil (optionnel)",
        };
      case 3:
        return {
          title: "Informations de contact",
          description:
            "Partagez quelques informations pour améliorer votre expérience",
        };
      case 4:
        return {
          title: "Configuration terminée",
          description: "Votre profil est maintenant prêt !",
        };
      default:
        return { title: "", description: "" };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Mise à jour de votre profil...</p>
        </div>
      </div>
    );
  }

  const stepInfo = getStepInfo();

  return (
    <OnboardingStep
      title={stepInfo.title}
      description={stepInfo.description}
      currentStep={currentStep}
      totalSteps={totalSteps}
      onNext={handleNext}
      onPrevious={handlePrevious}
      canProceed={canProceed()}
      isLastStep={currentStep === totalSteps}
    >
      {renderStep()}
    </OnboardingStep>
  );
}
