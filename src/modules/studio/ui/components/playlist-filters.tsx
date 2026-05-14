"use client";

import { useState } from "react";
import { FilterIcon, ListFilterIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PlaylistFiltersProps {
  onFilterChange: (filters: {
    name?: string;
    visibility?: "public" | "private";
  }) => void;
}

export const PlaylistFilters = ({ onFilterChange }: PlaylistFiltersProps) => {
  const tStudio = useTranslations("Studio");
  const tPlaylists = useTranslations("Playlists");
  const [activeFilters, setActiveFilters] = useState<{
    name?: string;
    visibility?: "public" | "private";
  }>({});

  const [currentFilterType, setCurrentFilterType] = useState<
    "name" | "visibility" | null
  >(null);
  const [inputValue, setInputValue] = useState("");

  const handleApplyFilter = () => {
    if (!currentFilterType) return;

    const newFilters = { ...activeFilters };

    if (currentFilterType === "name") {
      newFilters.name = inputValue;
    } else if (currentFilterType === "visibility") {
      newFilters.visibility = inputValue as "public" | "private";
    }

    setActiveFilters(newFilters);
    onFilterChange(newFilters);
    setCurrentFilterType(null);
    setInputValue("");
  };

  const removeFilter = (key: keyof typeof activeFilters) => {
    const newFilters = { ...activeFilters };
    delete newFilters[key];
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAll = () => {
    setActiveFilters({});
    onFilterChange({});
  };

  return (
    <div className="flex flex-col gap-y-4 p-4 border-b">
      <div className="flex items-center gap-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-x-2">
              <ListFilterIcon className="size-4" />
              {tStudio("filterTitle")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={() => setCurrentFilterType("name")}>
              {tStudio("filterName")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCurrentFilterType("visibility")}>
              {tStudio("filterVisibility")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-x-2 flex-wrap">
          {activeFilters.name && (
            <Badge variant="secondary" className="gap-x-1 px-2 py-1">
              {tStudio("filterName")}: {activeFilters.name}
              <XIcon
                className="size-3 cursor-pointer"
                onClick={() => removeFilter("name")}
              />
            </Badge>
          )}
          {activeFilters.visibility && (
            <Badge variant="secondary" className="gap-x-1 px-2 py-1">
              {tStudio("filterVisibility")}:{" "}
              {activeFilters.visibility === "public" ? tPlaylists("public") : tPlaylists("private")}
              <XIcon
                className="size-3 cursor-pointer"
                onClick={() => removeFilter("visibility")}
              />
            </Badge>
          )}
          {Object.keys(activeFilters).length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-xs text-muted-foreground"
            >
              {tStudio("filterClearAll")}
            </Button>
          )}
        </div>
      </div>

      {currentFilterType && (
        <div className="flex items-center gap-x-2 bg-neutral-100/50 dark:bg-neutral-800/50 p-2 rounded-lg w-fit">
          <span className="text-sm font-medium">
            {currentFilterType === "name" ? tStudio("filterName") : tStudio("filterVisibility")}:
          </span>
          {currentFilterType === "visibility" ? (
            <Select
              value={inputValue}
              onValueChange={(val: string) => {
                setInputValue(val);
                const updatedFilters = {
                  ...activeFilters,
                  visibility: val as "public" | "private",
                };
                setActiveFilters(updatedFilters);
                onFilterChange(updatedFilters);
                setCurrentFilterType(null);
                setInputValue("");
              }}
            >
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder={tStudio("filterSelectVisibility")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">{tPlaylists("public")}</SelectItem>
                <SelectItem value="private">{tPlaylists("private")}</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div className="flex items-center gap-x-2">
              <Input
                placeholder={tStudio("filterNamePlaceholder")}
                value={inputValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
                className="h-9 w-[250px]"
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter") handleApplyFilter();
                  if (e.key === "Escape") setCurrentFilterType(null);
                }}
                autoFocus
              />
              <Button size="sm" onClick={handleApplyFilter}>
                {tStudio("filterApply")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentFilterType(null)}
              >
                {tStudio("cancel")}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
