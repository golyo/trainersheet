import { Theme } from '@emotion/react';

export interface WeekTablePalette {
  headerBGColor?: string,
  headerTextColor?: string,
  eventColors: string[],
}

export interface IPalette {
  weekPalette: WeekTablePalette,
}

export interface WeekTheme extends Theme {
  palette: IPalette;
}

const defaultTheme = {
  typography: {
    body2: { display: 'inline' },
  },
  components: {
    ModalContainer: {
      variants: [
        {
          props: { variant: 'small' },
          style: {
            minWidth: '40vw',
            maxWidth: '98vw',
          },
        },
        {
          props: { variant: 'big' },
          style: {
            minWidth: 'max(80vw, 320px)',
            maxWidth: '98vw',
          },
        },
      ],
    },
  },
};

export default defaultTheme;