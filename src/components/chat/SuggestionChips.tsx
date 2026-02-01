'use client';

import { motion } from 'framer-motion';
import {
  Utensils,
  Hotel,
  Landmark,
  ShoppingBag,
  Coffee,
  MapPin,
  Navigation,
  Sparkles,
} from 'lucide-react';

interface Suggestion {
  label: string;
  query: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const defaultSuggestions: Suggestion[] = [
  { label: 'Restaurants nearby', query: 'Find restaurants near me', icon: Utensils },
  { label: 'Hotels', query: 'Search for hotels', icon: Hotel },
  { label: 'Attractions', query: 'Show popular attractions', icon: Landmark },
  { label: 'Shopping', query: 'Find shopping centers', icon: ShoppingBag },
  { label: 'Cafes', query: 'Find cafes nearby', icon: Coffee },
];

const contextualSuggestions: Record<string, Suggestion[]> = {
  place_selected: [
    { label: 'Get directions', query: 'Get directions to this place', icon: Navigation },
    { label: 'Similar places', query: 'Show me similar places', icon: Sparkles },
    { label: 'Nearby', query: "What's nearby?", icon: MapPin },
  ],
  search_results: [
    { label: 'Show on map', query: 'Show all on map', icon: MapPin },
    { label: 'Best rated', query: 'Show best rated only', icon: Sparkles },
    { label: 'Open now', query: 'Filter by open now', icon: Landmark },
  ],
  directions: [
    { label: 'By transit', query: 'Show transit directions', icon: Navigation },
    { label: 'By walking', query: 'Show walking directions', icon: MapPin },
    { label: 'Alternate routes', query: 'Show alternative routes', icon: Navigation },
  ],
};

interface SuggestionChipsProps {
  suggestions?: Suggestion[];
  context?: keyof typeof contextualSuggestions;
  onSelect: (query: string) => void;
}

export function SuggestionChips({
  suggestions,
  context,
  onSelect,
}: SuggestionChipsProps) {
  const chips = suggestions ?? (context ? contextualSuggestions[context] : defaultSuggestions);

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((suggestion, index) => {
        const Icon = suggestion.icon;
        return (
          <motion.button
            key={suggestion.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(suggestion.query)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {suggestion.label}
          </motion.button>
        );
      })}
    </div>
  );
}

// Compact version for inline suggestions
export function InlineSuggestions({
  suggestions,
  onSelect,
}: {
  suggestions: string[];
  onSelect: (query: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {suggestions.map((suggestion, index) => (
        <motion.button
          key={suggestion}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onSelect(suggestion)}
          className="flex-shrink-0 px-3 py-1 bg-indigo-50 text-indigo-700 text-sm rounded-full hover:bg-indigo-100 transition-colors"
        >
          {suggestion}
        </motion.button>
      ))}
    </div>
  );
}
