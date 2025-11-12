export interface NavigationCard {
  id: string
  title: string
  description: string
  icon: string
  color: string
  to?: string
  externalUrl?: string
  badge?: string
  highlight?: boolean
}
