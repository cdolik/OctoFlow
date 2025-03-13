import React, { createContext, useContext, ReactNode } from 'react';

type ThemeContextType = {
  mode: 'light' | 'dark';
  toggleColorMode: () => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleColorMode: () => {},
});

export const useThemeContext = () => useContext(ThemeContext);

type ThemeProviderProps = {
  children: ReactNode;
  initialMode?: 'light' | 'dark';
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialMode = 'light',
}) => {
  const [mode, setMode] = React.useState<'light' | 'dark'>(initialMode);

  React.useEffect(() => {
    // Load theme from localStorage if available
    const savedMode = localStorage.getItem('themeMode') as 'light' | 'dark' | null;
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  React.useEffect(() => {
    // Save theme preference to localStorage
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const toggleColorMode = React.useCallback(() => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  }, []);

  const value = React.useMemo(
    () => ({
      mode,
      toggleColorMode,
    }),
    [mode, toggleColorMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeProvider; 