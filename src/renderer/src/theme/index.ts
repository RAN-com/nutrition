import { createTheme, responsiveFontSizes } from '@mui/material'

export const theme = responsiveFontSizes(
  createTheme({
    spacing: () => 8,
    breakpoints: {
      values: {
        xs: 480,
        sm: 768,
        md: 1024,
        lg: 1200,
        xl: 1920
      }
    },
    direction: 'ltr',
    shape: {
      borderRadius: 8
    },

    transitions: {
      easing: {
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
      },
      duration: {
        shortest: 150,
        shorter: 200,
        short: 250,
        standard: 300,
        complex: 375,
        enteringScreen: 225,
        leavingScreen: 195
      },
      getAutoHeightDuration: (height: number) => {
        if (height > 600) {
          return 500
        }
        return height / 2
      }
    },
    zIndex: {
      mobileStepper: 1000,
      speedDial: 1050,
      appBar: 1100,
      drawer: 1200,
      modal: 1300,
      snackbar: 1400,
      tooltip: 1500,
      fab: 1600
    },
    typography: {
      fontFamily: ['DM Sans', 'sans-serif'].join(', '),
      fontSize: 16,
      fontWeightLight: 300,
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      fontWeightBold: 700,
      h1: {
        fontFamily: ['DM Sans', 'sans-serif'].join(', '),
        fontWeight: 700,
        fontSize: '56px',
        lineHeight: 1.167
      },
      h2: {
        fontFamily: ['DM Sans', 'sans-serif'].join(', '),
        fontWeight: 700,
        fontSize: '40px',
        lineHeight: 1.2
      },
      h3: {
        fontFamily: ['DM Sans', 'sans-serif'].join(', '),
        fontWeight: 700,
        fontSize: '28px',
        lineHeight: 1.167
      },
      h4: {
        fontFamily: ['DM Sans', 'sans-serif'].join(', '),
        fontWeight: 700,
        fontSize: '26px',
        lineHeight: 1.235
      },
      h5: {
        fontFamily: ['DM Sans', 'sans-serif'].join(', '),
        fontWeight: 700,
        fontSize: '22px',
        lineHeight: 1.334
      },
      h6: {
        fontFamily: ['DM Sans', 'sans-serif'].join(', '),
        fontWeight: 700,
        fontSize: '20px',
        lineHeight: 1.6
      },
      subtitle1: {
        fontFamily: ['DM Sans', 'sans-serif'].join(', '),
        fontWeight: 400,
        fontSize: '16px',
        lineHeight: 1.75
      },
      subtitle2: {
        fontFamily: ['DM Sans', 'sans-serif'].join(', '),
        fontWeight: 400,
        fontSize: '14px',
        lineHeight: 1.57
      },
      body1: {
        fontFamily: ['DM Sans', 'sans-serif'].join(', '),
        fontWeight: 400,
        fontSize: '16px',
        lineHeight: 1.5
      },
      body2: {
        fontFamily: ['DM Sans', 'sans-serif'].join(', '),
        fontWeight: 400,
        fontSize: '14px',
        lineHeight: 1.43
      },
      button: {
        fontFamily: ['DM Sans', 'sans-serif'].join(', '),
        fontWeight: 700,
        fontSize: '14px',
        lineHeight: 1.75,
        textTransform: 'uppercase'
      },
      caption: {
        fontFamily: ['DM Sans', 'sans-serif'].join(', '),
        fontWeight: 400,
        fontSize: '12px',
        lineHeight: 1.66
      },
      overline: {
        fontFamily: ['DM Sans', 'sans-serif'].join(', '),
        fontWeight: 400,
        fontSize: '10px',
        lineHeight: 2
      },
      htmlFontSize: 16,
      allVariants: {
        fontFamily: ['DM Sans', 'sans-serif'].join(', ')
      }
    }
  })
)
