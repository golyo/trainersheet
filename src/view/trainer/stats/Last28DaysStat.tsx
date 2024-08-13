import { useMemo } from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import MemberEventStat from './MemberEventStat';
import { useUtils } from '../../calendar/const.ts';

export default function Last28DaysStat() {
  const utils = useUtils();
  const { t } = useTranslation();

  const interval = useMemo(() => ({
    from: utils.toJsDate(utils.addDays(new Date(), -28)),
    to: new Date(),
  }), [utils]);

  return (
    <>
      <Typography variant="h3">{t('trainer.last28DaysStats')}</Typography>
      <MemberEventStat interval={interval} />
    </>
  );
}