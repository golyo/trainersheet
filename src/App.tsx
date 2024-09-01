import { useEffect, useMemo } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThemeProvider } from '@emotion/react';
import { enUS, hu, Locale } from 'date-fns/locale';
import * as yup from 'yup';
import {
  CalendarViewWeek,
  Contacts,
  Groups,
  Home as HomeIcon,
  InsertChart,
  ManageAccounts,
  PermContactCalendar,
  Search,
} from '@mui/icons-material';

import { LocalizationProvider } from '@mui/x-date-pickers'
import { createTheme, ThemeOptions } from '@mui/material/styles';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'

import { FirebaseProvider } from './hooks/firebase';
import { AuthProvider } from './hooks/auth';
import { UserProvider } from './hooks/user';
import { DialogProvider } from './hooks/dialog';
import ErrorBoundary from './view/common/ErrorBoundary';
import defaultTheme from './theme/defaultTheme.ts';
import MenuDrawer, { MenuItemType } from './view/menu/MenuDrawer.tsx';

import './App.css';
import LanguageProvider from './hooks/language/LanguageProvider.tsx';

export const theme = createTheme(defaultTheme as ThemeOptions);

const VISIBLE = () => true;

const leftMenu: MenuItemType[] = [
  {
    isVisible: (user) => !!user && !!user.memberships?.length,
    label: 'menu.nextEvents',
    path: '/',
    icon: <HomeIcon />,
  },
  {
    isVisible: (user) => !!user && !!user.memberships?.length,
    label: 'menu.myCalendar',
    path: '/myCalendar',
    icon: <CalendarViewWeek />,
  },
  {
    isVisible: (user) => !!user && !!user.memberships?.length,
    label: 'menu.memberships',
    path: '/memberships',
    icon: <Contacts />,
  },
  {
    isVisible: VISIBLE,
    label: 'menu.searchTrainer',
    path: '/searchTrainer',
    icon: <Search />,
  },
];

const rightMenu: MenuItemType[] = [
  {
    isVisible: (user, trainer) => !!user && !!trainer,
    label: 'trainer.events',
    path: '/trainerEvents',
    icon: <PermContactCalendar />,
  },
  {
    isVisible: (user, trainer) => !!user && !!trainer,
    label: 'trainer.calendar',
    path: '/trainerCalendar',
    icon: <CalendarViewWeek />,
  },
  {
    isVisible: (user, trainer) => !!user && !!trainer,
    label: 'trainer.groups',
    path: '/groups',
    icon: <Groups />,
  },
  {
    isVisible: (user, trainer) => !!user && !!trainer,
    label: 'menu.userStats',
    path: '/stats',
    icon: <InsertChart />,
  },
  {
    isVisible: VISIBLE,
    label: 'login.profile',
    path: '/profile',
    icon: <ManageAccounts />,
  },
];

function App() {
  const { i18n, t } = useTranslation();

  const locale: Locale = useMemo(() => {
    return i18n.language === 'en' ? enUS : hu;
  }, [i18n])

  useEffect(() => {
    yup.setLocale({
      mixed: {
        required: t('error.required')!,
        notType: (ref) => {
          switch (ref.type) {
            case 'number':
              return  t('error.numberType');
            case 'string':
              return t('error.stringType');
            default:
              return t('error.wrongType');
          }
        },
      },
      string: {
        email: t('error.email')!,
      },
    });
  }, [t]);

  return (
    <ThemeProvider theme={theme}>
      <DialogProvider>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={locale}>
          <LanguageProvider>
            <Router>
              <FirebaseProvider>
                <AuthProvider>
                  <UserProvider>
                    <ErrorBoundary>
                      <MenuDrawer leftMenu={leftMenu} rightMenu={rightMenu}/>
                    </ErrorBoundary>
                  </UserProvider>
                </AuthProvider>
              </FirebaseProvider>
            </Router>
          </LanguageProvider>
        </LocalizationProvider>
      </DialogProvider>
    </ThemeProvider>
  );
}

export default App;
