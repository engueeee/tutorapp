import { useState } from "react";
import { OnboardingStep } from "./OnboardingStep";
import { WelcomeStep } from "./WelcomeStep";
import { ProfilePhotoStep } from "./ProfilePhotoStep";
import { ContactInfoStep } from "./ContactInfoStep";
import { CompletionStep } from "./CompletionStep";
import { toast } from "sonner";

interface UniversalOnboardingProps {
  entityId: string;
  userName: string;
  role: "student" | "tutor";
  onComplete: () => void;
  initialData?: any;
}

interface OnboardingData {
  profilePhoto: string;
  phoneNumber: string;
  age?: string;
  grade?: string;
}

export function UniversalOnboarding({
  entityId,
  userName,
  role,
  onComplete,
  initialData,
}: UniversalOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    profilePhoto: initialData?.profilePhoto || "",
    phoneNumber: initialData?.phoneNumber || "",
    age: initialData?.age || "",
    grade: initialData?.grade || "",
  });

  // Students have 4 steps, tutors have 3 (no age/grade)
  const totalSteps = role === "student" ? 4 : 3;

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
    age?: string;
    grade?: string;
  }) => {
    setOnboardingData((prev) => ({ ...prev, ...data }));
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      let endpoint = "";
      let body: any = {
        phoneNumber: onboardingData.phoneNumber,
        profilePhoto: onboardingData.profilePhoto,
        onboardingCompleted: true,
      };
      if (role === "student") {
        endpoint = `/api/students/${entityId}`;
        body.age = onboardingData.age ? parseInt(onboardingData.age) : null;
        body.grade = onboardingData.grade;
      } else {
        endpoint = `/api/users/${entityId}`;
      }
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
      toast.success("Profil mis à jour avec succès !");
      onComplete();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return true;
      case 2:
        return true;
      case 3:
        if (role === "student") {
          return (
            onboardingData.phoneNumber.trim() !== "" ||
            (onboardingData.age
              ? String(onboardingData.age).trim() !== ""
              : false) ||
            (onboardingData.grade
              ? String(onboardingData.grade).trim() !== ""
              : false)
          );
        } else {
          return onboardingData.phoneNumber.trim() !== "";
        }
      case 4:
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
        if (role === "student") {
          return (
            <ContactInfoStep
              onDataChange={handleContactChange}
              initialData={{
                phoneNumber: onboardingData.phoneNumber || "",
                age: onboardingData.age || "",
                grade: onboardingData.grade || "",
              }}
            />
          );
        } else {
          // Tutor: only phone number
          return (
            <ContactInfoStep
              onDataChange={(data) =>
                handleContactChange({ phoneNumber: data.phoneNumber })
              }
              initialData={{
                phoneNumber: onboardingData.phoneNumber || "",
                age: "",
                grade: "",
              }}
            />
          );
        }
      case 4:
        return (
          <CompletionStep
            userName={userName}
            profilePhoto={onboardingData.profilePhoto}
            phoneNumber={onboardingData.phoneNumber || ""}
            age={onboardingData.age || ""}
            grade={onboardingData.grade || ""}
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
            role === "student"
              ? "Partagez quelques informations pour améliorer votre expérience"
              : "Ajoutez votre numéro de téléphone pour faciliter la communication",
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
