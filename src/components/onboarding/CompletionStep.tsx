import { CheckCircle, User, Phone, GraduationCap } from "lucide-react";

interface CompletionStepProps {
  userName: string;
  profilePhoto?: string;
  phoneNumber: string;
  age: string;
  grade: string;
}

export function CompletionStep({
  userName,
  profilePhoto,
  phoneNumber,
  age,
  grade,
}: CompletionStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Profil complété avec succès !
        </h2>
        <p className="text-gray-600 mb-6">
          Votre profil est maintenant configuré et prêt à être utilisé.
        </p>
      </div>

      {/* Profile Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Récapitulatif de votre profil
        </h3>

        <div className="space-y-4">
          {/* Profile Photo */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">{userName}</p>
              <p className="text-sm text-gray-500">Photo de profil</p>
            </div>
          </div>

          {/* Contact Info */}
          {phoneNumber && (
            <div className="flex items-center gap-4">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">{phoneNumber}</p>
                <p className="text-sm text-gray-500">Numéro de téléphone</p>
              </div>
            </div>
          )}

          {/* Age */}
          {age && (
            <div className="flex items-center gap-4">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">{age} ans</p>
                <p className="text-sm text-gray-500">Âge</p>
              </div>
            </div>
          )}

          {/* Grade */}
          {grade && (
            <div className="flex items-center gap-4">
              <GraduationCap className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">{grade}</p>
                <p className="text-sm text-gray-500">Niveau scolaire</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">Prochaines étapes</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <span>Explorer votre tableau de bord personnalisé</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <span>Consulter votre calendrier de cours</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <span>Découvrir les cours disponibles</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <span>Prendre contact avec votre tuteur</span>
          </li>
        </ul>
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>
          Vous pouvez modifier ces informations à tout moment depuis votre
          profil.
        </p>
      </div>
    </div>
  );
}
