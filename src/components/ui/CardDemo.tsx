import React from "react";
import { CardVariant } from "./card";
import {
  Users,
  BookOpen,
  TrendingUp,
  Calendar,
  Star,
  Award,
} from "lucide-react";

export const CardDemo = () => {
  return (
    <div className="p-8 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Card Component Variants
        </h1>
        <p className="text-gray-600">
          Explore different card styles and configurations
        </p>
      </div>

      {/* Default Variants */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Default Variants
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardVariant
            variant="default"
            title="Default Card"
            subtitle="Simple white card with subtle shadow"
            icon={<Users className="w-8 h-8 text-blue-600" />}
            actionText="View Details"
            onClick={() => console.log("Default card clicked")}
          />

          <CardVariant
            variant="active"
            title="Active Card"
            subtitle="Green gradient with enhanced styling"
            icon={<BookOpen className="w-8 h-8 text-green-600" />}
            actionText="Get Started"
            onClick={() => console.log("Active card clicked")}
          />

          <CardVariant
            variant="gradient"
            title="Gradient Card"
            subtitle="Beautiful blue to purple gradient"
            icon={<TrendingUp className="w-8 h-8 text-white" />}
            actionText="Learn More"
            onClick={() => console.log("Gradient card clicked")}
          />
        </div>
      </div>

      {/* Outline and Elevated Variants */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Special Variants
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardVariant
            variant="outline"
            title="Outline Card"
            subtitle="Clean outline style with hover effects"
            icon={<Calendar className="w-8 h-8 text-gray-600" />}
            actionText="Schedule"
            onClick={() => console.log("Outline card clicked")}
          />

          <CardVariant
            variant="elevated"
            title="Elevated Card"
            subtitle="Lifts up on hover with enhanced shadow"
            icon={<Star className="w-8 h-8 text-yellow-500" />}
            actionText="Favorite"
            onClick={() => console.log("Elevated card clicked")}
          />

          <CardVariant
            variant="default"
            title="Custom Content"
            subtitle="Card with custom children content"
            icon={<Award className="w-8 h-8 text-purple-600" />}
            actionText="View Stats"
            onClick={() => console.log("Custom card clicked")}
          >
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Progress</span>
                <span className="text-sm font-semibold text-green-600">
                  85%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: "85%" }}
                ></div>
              </div>
            </div>
          </CardVariant>
        </div>
      </div>

      {/* Size Variants */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">Size Variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardVariant
            variant="default"
            size="sm"
            title="Small Card"
            subtitle="Compact size for tight spaces"
            icon={<Users className="w-6 h-6 text-blue-600" />}
            actionText="Quick View"
            onClick={() => console.log("Small card clicked")}
          />

          <CardVariant
            variant="active"
            size="md"
            title="Medium Card"
            subtitle="Standard size for most use cases"
            icon={<BookOpen className="w-8 h-8 text-green-600" />}
            actionText="View Details"
            onClick={() => console.log("Medium card clicked")}
          />

          <CardVariant
            variant="gradient"
            size="lg"
            title="Large Card"
            subtitle="Spacious layout for rich content"
            icon={<TrendingUp className="w-12 h-12 text-white" />}
            actionText="Explore More"
            onClick={() => console.log("Large card clicked")}
          />
        </div>
      </div>

      {/* Usage Examples */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">Usage Examples</h2>
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Basic Usage:</h3>
          <pre className="bg-white p-4 rounded border text-sm overflow-x-auto">
            {`import { CardVariant } from "@/components/ui/card";

<CardVariant
  variant="default"
  title="Card Title"
  subtitle="Card description"
  icon={<Users className="w-8 h-8 text-blue-600" />}
  actionText="Learn More"
  onClick={() => console.log("Card clicked")}
/>`}
          </pre>
        </div>
      </div>
    </div>
  );
};
