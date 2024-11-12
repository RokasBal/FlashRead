import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from '../components/axiosWrapper';
import Cookies from 'js-cookie';
import { changeFont, changeTheme } from '../components/utils/visualSettingsUtils.ts';
import { useAuth } from './AuthContext';

interface VisualSettings {
  theme: string;
  font: string;
}

interface VisualSettingsContextProps {
  visualSettings: VisualSettings | null;
  setVisualSettings: React.Dispatch<React.SetStateAction<VisualSettings | null>>;
  loading: boolean;
}

const defaultSettings: VisualSettings = {
  theme: 'Olive',
  font: 'Poppins',
};

const VisualSettingsContext = createContext<VisualSettingsContextProps | undefined>(undefined);

export const VisualSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visualSettings, setVisualSettings] = useState<VisualSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const loadSettings = async () => {
      let theme;
      let font;

      if (isAuthenticated) {
        console.log("AUTHENTICATED IN VISUALSETTINGSCONTEXT");
        theme = await fetchTheme();
        font = await fetchFont();
      } else {
        console.log("NOT AUTHENTICATED IN VISUALSETTINGSCONTEXT");
        const settingsJson = Cookies.get('visualSettings');
        if (settingsJson) {
          const settings = JSON.parse(settingsJson);
          theme = settings.theme;
          font = settings.font;
        } else {
          console.log("Loading default theme");
          theme = defaultSettings.theme;
          font = defaultSettings.font;
        }
      }

      initializeSettings(theme, font);
    };

    if (isAuthenticated !== undefined) {
      loadSettings();
    }
  }, [isAuthenticated]);

  const fetchTheme = async () => {
    const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('authToken='));
    const token = tokenCookie ? tokenCookie.split('=')[1] : null;
    try {
      const themeResponse = await axios.get('/api/User/GetThemeSettings', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return themeResponse.data.theme;
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const fetchFont = async () => {
    const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('authToken='));
    const token = tokenCookie ? tokenCookie.split('=')[1] : null;
    try {
      const fontResponse = await axios.get('/api/User/GetFontSettings', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return fontResponse.data.font;
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const initializeSettings = async (theme: string, font: string) => {
    console.log("Initializing settings with theme:", theme, "and font:", font);
    await changeTheme(theme);
    await changeFont(font);
    setVisualSettings({ theme, font });
    setLoading(false);
  }

  if (loading || visualSettings === null) {
    return <div>Loading...</div>; 
  }

  return (
    <VisualSettingsContext.Provider value={{ visualSettings, setVisualSettings, loading }}>
      {children}
    </VisualSettingsContext.Provider>
  );
};

export const useVisualSettings = (): VisualSettingsContextProps => {
  const context = useContext(VisualSettingsContext);
  if (!context) {
    throw new Error('useVisualSettings must be used within a VisualSettingsProvider');
  }
  return context;
};