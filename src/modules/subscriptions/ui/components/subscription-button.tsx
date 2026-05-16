import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  BellIcon, 
  BellRingIcon, 
  BellOffIcon, 
  ChevronDownIcon, 
  UserMinusIcon 
} from "lucide-react";

interface SubscriptionButtonProps {
  onClick: ButtonProps["onClick"];
  onUpdateLevel?: (level: "all" | "personalized" | "none") => void;
  disabled: boolean;
  isSubscribed: boolean;
  level?: "all" | "personalized" | "none" | null;
  className?: string;
  size?: ButtonProps["size"];
};

export const SubscriptionButton = ({
  onClick,
  onUpdateLevel,
  disabled,
  isSubscribed,
  level,
  className,
  size
}: SubscriptionButtonProps) => {
  const t = useTranslations("Video");

  if (!isSubscribed) {
    return (
      <Button
        size={size}
        variant="default"
        className={cn("rounded-full", className)}
        onClick={onClick}
        disabled={disabled}
      >
        {t("subscribe")}
      </Button>
    );
  }

  const LevelIcon = level === "all" ? BellRingIcon : level === "none" ? BellOffIcon : BellIcon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size={size}
          variant="secondary"
          className={cn("rounded-full gap-2", className)}
          disabled={disabled}
        >
          <LevelIcon className="size-4" />
          {t("subscribed")}
          <ChevronDownIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-xl">
        <DropdownMenuItem onClick={() => onUpdateLevel?.("all")} className="gap-3">
          <BellRingIcon className="size-5" />
          {t("all")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onUpdateLevel?.("personalized")} className="gap-3">
          <BellIcon className="size-5" />
          {t("personalized")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onUpdateLevel?.("none")} className="gap-3">
          <BellOffIcon className="size-5" />
          {t("none")}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={(e) => {
            // @ts-ignore
            onClick?.(e);
          }} 
          className="gap-3"
        >
          <UserMinusIcon className="size-5" />
          {t("unsubscribe")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
