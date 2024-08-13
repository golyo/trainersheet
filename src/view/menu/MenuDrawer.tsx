/** @jsxImportSource @emotion/react */
import { useCallback, useMemo, useState, MouseEvent } from 'react';
import {
  Link, Route, Routes,
} from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AppBar,
  Button,
  CssBaseline,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import { Logout, ManageAccounts } from '@mui/icons-material';
import Login from '../login/Login';
import Verification from '../login/Verification';
import RegistrationSuccess from '../login/RegistrationSuccess';
import Register from '../login/Register';
import PasswordReset from '../login/PasswordReset';
import PasswordChange from '../login/PasswordChange';
import { User, useUser } from '../../hooks/user';
import UserCalendar from '../user/UserCalendar';
import TrainingGroups from '../trainer/TrainingGroups';
import GroupRouter from '../trainer/group/GroupRouter';
import DisplayGroup from '../trainer/group/DisplayGroup';
import Profile from '../login/Profile';
import MembersList from '../trainer/members/MembersList';
import UserMemberships from '../user/UserMemberships';
import { useAuth } from '../../hooks/auth';
import NextEvents from '../user/NextEvents';
import TrainerCalendar from '../trainer/events/TrainerCalendar';
import EventPage from '../trainer/events/EventPage';
import TrainerEvents from '../trainer/events/TrainerEvents';
import SearchTrainer from '../user/SearchTrainer';
import UserAvatar from '../common/UserAvatar';
import MonthlyMemberStat from '../trainer/stats/MonthyMemberStat';
import StatRouter from '../trainer/stats/StatRouter';
import Last28DaysStat from '../trainer/stats/Last28DaysStat';
import MemberTicketStat from '../trainer/stats/MemberTicketStat';

import styles from './MenuDrawer.style';
import { useTheme } from '@emotion/react';

export type MenuItemType = {
  label: string;
  icon?: React.ReactNode;
  isVisible: (user?: User) => boolean;
  path: string;
};

type Props = {
  leftMenu: MenuItemType[];
  rightMenu: MenuItemType[];
  subMenu?: MenuItemType[];
};

const MenuDrawer = ({ leftMenu, rightMenu }: Props) => {
  const { logout } = useAuth();
  const { user } = useUser();
  const theme = useTheme();
  const { t } = useTranslation();
  const [state, setState] = useState<{ anchorLeft: HTMLElement | null; anchorRight: HTMLElement | null; }>({ anchorLeft: null, anchorRight: null });

  const { anchorLeft, anchorRight } = state;
  const isLeftOpen = useMemo(() => Boolean(anchorLeft), [anchorLeft]);
  const isRightOpen = useMemo(() => Boolean(anchorRight), [anchorRight]);
  const css = useMemo(() => styles(theme), [theme]);
  const userName = user ? user.name : '';

  const handleRightMenu = useCallback((event: unknown) => setState((prev) => ({
    ...prev,
    anchorRight: event.currentTarget,
  })), []);

  const handleLeftMenu = useCallback((event: MouseEvent<HTMLElement>) => {
    if (!user) {
      return;
    }
    setState((prev) => ({
      ...prev,
      anchorLeft: event.currentTarget,
    }));
  }, [user]);

  const handleClose = useCallback(() => {
    setState((prev) => ({ ...prev, anchorLeft: null, anchorRight: null }));
  }, []);

  const leftVisible = useMemo(() => leftMenu.filter((menu) => user && menu.isVisible(user)), [leftMenu, user]);
  const rightVisible = useMemo(() => rightMenu.filter((menu) => user && menu.isVisible(user)), [rightMenu, user]);

  const renderMenu = useCallback((menus: MenuItemType[]) => {
    return menus.map((item) => (
      <MenuItem component={Link} to={item.path} key={item.path} onClick={handleClose}>
        {item.icon && (
          <ListItemIcon>
            {item.icon}
          </ListItemIcon>
        )}
        <ListItemText primary={t(item.label)} />
      </MenuItem>
    ));
  }, [handleClose, t]);

  console.log('TEST', theme);
  return (
    <div css={css.root}>
      <CssBaseline />
      <div>
        <AppBar position="fixed">
          <Toolbar disableGutters>
            <Button
              color="inherit"
              aria-label="Open drawer"
              aria-controls={isLeftOpen ? 'composition-menu' : undefined}
              aria-expanded={isLeftOpen ? 'true' : undefined}
              aria-haspopup="true"
              onClick={handleLeftMenu}
            >
              Trainer Sheet
            </Button>
            <Menu
              id="menu-left"
              anchorEl={anchorLeft}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={isLeftOpen}
              onClose={handleClose}
            >
              { renderMenu(leftVisible) }
            </Menu>
            <div css={css.grow}>
            </div>
            <div css={css.menuHorizontal}>
              { user && <>
                <Button
                  color="inherit"
                  onClick={handleRightMenu}
                  aria-owns={isRightOpen ? 'menu-appbar' : undefined}
                  aria-haspopup="true"
                >
                  <Typography noWrap variant="button">
                    { userName }&nbsp;
                  </Typography>
                  <UserAvatar userId={user.id} />
                </Button>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorRight}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={isRightOpen}
                  onClose={handleClose}
                >
                  { renderMenu(rightVisible) }
                  <MenuItem key="logout" onClick={logout}>
                    <ListItemIcon><Logout /></ListItemIcon>
                    <ListItemText primary={t('common.logout')} />
                  </MenuItem>
                </Menu>
              </>}
            </div>
          </Toolbar>
        </AppBar>
        <Toolbar></Toolbar>
      </div>
      <div css={css.content}>
        <div css={css.toolbar} />
        <div css={css.container}>
          <Routes>
            <Route index element={<NextEvents />} />
            <Route path="myCalendar" element={<UserCalendar />} />
            <Route path="trainerCalendar" element={<TrainerCalendar />} />
            <Route path="searchTrainer" element={<SearchTrainer />} />
            <Route path="test" element={<ManageAccounts />} />
            <Route path="memberships" element={<UserMemberships />} />
            <Route path="userStats" element={<MonthlyMemberStat />} />
            <Route path="memberships/:groupId" element={<UserMemberships />} />
            <Route path="profile" element={<Profile />} />
            <Route path="groups" element={<TrainingGroups />} />
            <Route path="trainerEvents" element={<TrainerEvents />} />
            <Route path="stats" element={<StatRouter />} >
              <Route index element={<Last28DaysStat />} />
              <Route path="monthlyStat" element={<MonthlyMemberStat />} />
              <Route path="ticketStat" element={<MemberTicketStat />} />
            </Route>
            <Route path="group/:groupId" element={<GroupRouter />} >
              <Route index element={<DisplayGroup />} />
              <Route path="members" element={<MembersList />} />
              <Route path="events" element={<TrainerEvents />} />
              <Route path="event/:eventId" element={<EventPage />} />
            </Route>
            <Route path="login" element={<Login />} />
            <Route path="verification" element={<Verification />} />
            <Route path="registrationSuccess" element={<RegistrationSuccess />} />
            <Route path="register" element={<Register />} />
            <Route path="resetPassword" element={<PasswordReset />} />
            <Route path="changePassword" element={<PasswordChange />} />
            <Route path="*">
              NOT EXISTS
            </Route>
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default MenuDrawer;
