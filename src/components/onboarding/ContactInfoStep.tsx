import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ContactInfoStepProps {
  onDataChange: (data: {
    phoneNumber: string;
    age: string;
    grade: string;
  }) => void;
  initialData?: { phoneNumber: string; age: string; grade: string };
}

export function ContactInfoStep({
  onDataChange,
  initialData,
}: ContactInfoStepProps) {
  const [phoneNumber, setPhoneNumber] = useState(
    initialData?.phoneNumber || ""
  );
  const [age, setAge] = useState(initialData?.age || "");
  const [grade, setGrade] = useState(initialData?.grade || "");

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    onDataChange({ phoneNumber: value, age, grade });
  };

  const handleAgeChange = (value: string) => {
    setAge(value);
    onDataChange({ phoneNumber, age: value, grade });
  };

  const handleGradeChange = (value: string) => {
    setGrade(value);
    onDataChange({ phoneNumber, age, grade: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-gray-600 mb-6">
          Aidez-nous à personnaliser votre expérience en fournissant quelques
          informations supplémentaires
        </p>
      </div>

      <div className="space-y-4">
        {/* Phone Number */}
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="+33 6 12 34 56 78"
            value={phoneNumber}
            onChange={(e) => handlePhoneChange(e.target.value)}
          />
          <p className="text-sm text-gray-500">
            Pour les communications importantes et les rappels de cours
          </p>
        </div>

        {/* Age */}
        <div className="space-y-2">
          <Label htmlFor="age">Âge</Label>
          <Input
            id="age"
            type="number"
            placeholder="16"
            min="5"
            max="100"
            value={age}
            onChange={(e) => handleAgeChange(e.target.value)}
          />
          <p className="text-sm text-gray-500">
            Pour adapter le contenu à votre niveau
          </p>
        </div>

        {/* Grade */}
        <div className="space-y-2">
          <Label htmlFor="grade">Niveau scolaire</Label>
          <Select value={grade} onValueChange={handleGradeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez votre niveau" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6ème">6ème</SelectItem>
              <SelectItem value="5ème">5ème</SelectItem>
              <SelectItem value="4ème">4ème</SelectItem>
              <SelectItem value="3ème">3ème</SelectItem>
              <SelectItem value="2nde">2nde</SelectItem>
              <SelectItem value="1ère">1ère</SelectItem>
              <SelectItem value="Terminale">Terminale</SelectItem>
              <SelectItem value="Bac+1">Bac+1</SelectItem>
              <SelectItem value="Bac+2">Bac+2</SelectItem>
              <SelectItem value="Bac+3">Bac+3</SelectItem>
              <SelectItem value="Bac+4">Bac+4</SelectItem>
              <SelectItem value="Bac+5">Bac+5</SelectItem>
              <SelectItem value="Autre">Autre</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500">
            Pour vous proposer des cours adaptés à votre niveau
          </p>
        </div>
      </div>
    </div>
  );
}
