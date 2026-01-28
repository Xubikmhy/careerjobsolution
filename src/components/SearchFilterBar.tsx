import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface FilterOption {
  value: string;
  label: string;
}

interface SearchFilterBarProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: {
    name: string;
    label: string;
    options: FilterOption[];
    value: string;
    onChange: (value: string) => void;
  }[];
  className?: string;
}

export function SearchFilterBar({
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  filters = [],
  className,
}: SearchFilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const hasActiveFilters = filters.some((f) => f.value !== 'all');

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-card"
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        {filters.length > 0 && (
          <Button
            variant={hasActiveFilters ? 'default' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary-foreground text-primary rounded-full">
                {filters.filter((f) => f.value !== 'all').length}
              </span>
            )}
          </Button>
        )}
      </div>

      {/* Filter Selects */}
      {showFilters && filters.length > 0 && (
        <div className="flex flex-wrap gap-3 p-4 bg-muted/50 rounded-lg animate-fade-in">
          {filters.map((filter) => (
            <div key={filter.name} className="min-w-[160px]">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                {filter.label}
              </label>
              <Select value={filter.value} onValueChange={filter.onChange}>
                <SelectTrigger className="bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => filters.forEach((f) => f.onChange('all'))}
            className="self-end text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
