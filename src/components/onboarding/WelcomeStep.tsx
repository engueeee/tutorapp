import { CheckCircle } from "lucide-react";

interface WelcomeStepProps {
  userName: string;
}

export function WelcomeStep({ userName }: WelcomeStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mb-6">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Bienvenue sur TutorApp !
          </h2>
          <p className="text-gray-600">
            Nous sommes ravis de vous accueillir, {userName} !
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-3">
            Pourquoi compléter votre profil ?
          </h3>
          <ul className="text-left space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Personnalisation de votre expérience d'apprentissage</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>
                Mise en relation avec des tuteurs adaptés à votre niveau
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Notifications personnalisées pour vos cours</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Accès à des ressources éducatives ciblées</span>
            </li>
          </ul>
        </div>

        <div className="text-sm text-gray-500">
          <p>
            Cette configuration ne prendra que quelques minutes et vous
            permettra d'accéder à toutes les fonctionnalités de TutorApp.
          </p>
        </div>
      </div>
    </div>
  );
}
