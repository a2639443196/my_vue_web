import { createVuetify } from 'vuetify'
import { md3 } from 'vuetify/blueprints'
import 'vuetify/styles'
// Vuetify components
import { VDataTable } from 'vuetify/components/VDataTable'
import { VSkeletonLoader } from 'vuetify/components/VSkeletonLoader'
// VCalendar is a separate component
import { VCalendar } from 'vuetify/labs/VCalendar'

export const vuetify = createVuetify({
  blueprint: md3,
  components: {
    VDataTable,
    VCalendar,
    VSkeletonLoader
  },
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        colors: {
          primary: '#60a5fa',
          secondary: '#a78bfa',
          accent: '#22d3ee',
          error: '#f87171',
          info: '#38bdf8',
          success: '#34d399',
          warning: '#fbbf24',
          surface: '#0f172a',
          background: '#0b1220'
        }
      }
    }
  },
  defaults: {
    VCard: {
      elevation: 2,
      rounded: 'lg'
    },
    VBtn: {
      rounded: 'lg',
      elevation: 2
    },
    VTextField: {
      variant: 'outlined',
      density: 'default',
      rounded: 'lg'
    },
    VSelect: {
      variant: 'outlined',
      density: 'default',
      rounded: 'lg'
    },
    VChip: {
      rounded: 'pill'
    },
    VAlert: {
      rounded: 'lg'
    },
    VSnackbar: {
      rounded: 'lg'
    },
    VTooltip: {
      rounded: 'md'
    },
    VMenu: {
      rounded: 'lg'
    },
    VExpansionPanel: {
      rounded: 'lg'
    }
  },
  display: {
    mobileBreakpoint: 'md',
    thresholds: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
      xxl: 2560
    }
  }
})
