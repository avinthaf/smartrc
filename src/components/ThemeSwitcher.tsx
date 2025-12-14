import React from 'react';
import { useTheme } from '../theme/provider';
import { modernDark, modernLight, minimalDark, minimalLight } from '../theme/themes';
import { Button } from './Button';

const themes = [
  { name: 'Modern Light', value: modernLight },
  { name: 'Modern Dark', value: modernDark },
  { name: 'Minimal Light', value: minimalLight },
  { name: 'Minimal Dark', value: minimalDark },
];

export const ThemeSwitcher: React.FC = () => {
  const { setTheme, resetTheme } = useTheme();

  return (
    <div className="fixed top-4 right-4 z-50 bg-card border rounded-lg p-4 shadow-lg">
      <h3 className="text-sm font-medium mb-3">Theme Switcher</h3>
      <div className="space-y-2">
        {themes.map((theme) => (
          <Button
            key={theme.name}
            variant="outline"
            size="sm"
            onClick={() => setTheme(theme.value)}
            className="w-full justify-start"
          >
            {theme.name}
          </Button>
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={resetTheme}
          className="w-full justify-start"
        >
          Reset to Default
        </Button>
      </div>
    </div>
  );
};

export default ThemeSwitcher;
