import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export const EmptyState = ({ icon: Icon, title, description }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 animate-in fade-in zoom-in duration-300">
      <div className="bg-muted p-6 rounded-full mb-4">
        <Icon className="size-12 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
          {description}
        </p>
      )}
    </div>
  );
};
