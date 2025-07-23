import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ListItemProps {
  title: string;
  subtitle?: string;
  description?: string;
  avatar?: {
    src?: string;
    fallback: string;
  };
  badges?: string[];
  actions?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function ListItem({
  title,
  subtitle,
  description,
  avatar,
  badges,
  actions,
  onClick,
  className,
  children,
}: ListItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {avatar && (
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatar.src} alt={title} />
          <AvatarFallback>{avatar.fallback}</AvatarFallback>
        </Avatar>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-gray-900 truncate">{title}</h3>
          {badges?.map((badge, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {badge}
            </Badge>
          ))}
        </div>

        {subtitle && <p className="text-sm text-gray-600 mb-1">{subtitle}</p>}

        {description && (
          <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
        )}

        {children}
      </div>

      {actions && (
        <div className="flex items-center gap-2 ml-auto">{actions}</div>
      )}
    </div>
  );
}
