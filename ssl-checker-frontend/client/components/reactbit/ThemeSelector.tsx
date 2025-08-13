import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from './Button';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

const themeOptions = [
  {
    value: 'light' as const,
    label: 'Light Mode',
    icon: <Sun className="w-4 h-4" />,
  },
  {
    value: 'dark' as const,
    label: 'Dark Mode',
    icon: <Moon className="w-4 h-4" />,
  },
];

interface ThemeSelectorProps {
  compact?: boolean;
  showDescriptions?: boolean;
  className?: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ 
  compact = false, 
  showDescriptions = true,
  className 
}) => {
  const { theme, setTheme, toggleTheme } = useTheme();



  if (compact) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className={cn("relative", className)}
        title="Toggle theme"
      >
        {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
      </Button>
    );
  }

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader>
        <CardTitle>Theme</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-2">
        {themeOptions.map((option) => (
          <Button
            key={option.value}
            variant={theme === option.value ? 'default' : 'outline'}
            onClick={() => setTheme(option.value)}
            className="flex items-center gap-2"
          >
            {option.icon}
            <span>{option.label}</span>
          </Button>
        ))}
        <Button variant="ghost" onClick={toggleTheme}>
          Toggle
        </Button>
      </CardContent>
    </Card>
  );
};
