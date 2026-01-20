"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showFavoritesOnly?: boolean;
  onToggleFavorites?: () => void;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search coins...",
  showFavoritesOnly = false,
  onToggleFavorites,
}: SearchBarProps) {
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-9"
        />
      </div>
      {onToggleFavorites && (
        <Button
          type="button"
          variant={showFavoritesOnly ? "default" : "outline"}
          size="icon"
          onClick={onToggleFavorites}
          className={cn(
            "h-10 w-10 flex-shrink-0",
            showFavoritesOnly && "bg-yellow-500 hover:bg-yellow-600"
          )}
          aria-label={showFavoritesOnly ? "Show all coins" : "Show favorites only"}
        >
          <Star
            className={cn(
              "h-4 w-4",
              showFavoritesOnly && "fill-current"
            )}
          />
        </Button>
      )}
    </div>
  );
}
