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
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          accent: '#22d3ee',
          error: '#ef4444',
          info: '#06b6d4',
          success: '#10b981',
          warning: '#f59e0b',
          surface: '#1e293b',
          background: '#0f172a',
          'surface-variant': '#334155',
          'on-surface': '#f1f5f9',
          'on-surface-variant': '#cbd5e1',
          'outline': '#475569',
          'outline-variant': '#1e293b'
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