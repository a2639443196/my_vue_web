import { createVuetify } from 'vuetify'
import { md3 } from 'vuetify/blueprints'
import 'vuetify/styles'
import { VDataTable } from 'vuetify/labs/VDataTable'
import { VCalendar } from 'vuetify/labs/VCalendar'
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'

export const vuetify = createVuetify({
  blueprint: md3,
  components: {
    VDataTable,
    VCalendar,
    VSkeletonLoader
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#2563eb',
          secondary: '#7c3aed',
          accent: '#06b6d4',
          error: '#dc2626',
          info: '#0891b2',
          success: '#16a34a',
          warning: '#d97706',
          surface: '#ffffff',
          background: '#f8fafc'
        }
      },
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
          background: '#0f172a'
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