export interface Activity {
  id: string
  userId: string
  type: 'water' | 'bowel' | 'smoking' | 'slack'
  value: number
  unit: string
  note?: string
  timestamp: Date
  createdAt: Date
  updatedAt: Date
}

export interface WaterActivity extends Activity {
  type: 'water'
  value: number // in ml
  unit: 'ml'
}

export interface BowelActivity extends Activity {
  type: 'bowel'
  value: 1 | 2 | 3 | 4 | 5 | 6 | 7 // Bristol stool scale
  unit: 'bristol'
  consistency?: string
}

export interface SmokingActivity extends Activity {
  type: 'smoking'
  value: number // number of cigarettes
  unit: 'cigarettes'
  trigger?: string
}

export interface SlackActivity extends Activity {
  type: 'slack'
  value: number // minutes spent
  unit: 'minutes'
  purpose?: string
}

export type ActivityFormData = Omit<Activity, 'id' | 'userId' | 'createdAt' | 'updatedAt'>

export interface ActivityFilter {
  type?: Activity['type']
  startDate?: Date
  endDate?: Date
}

export interface ActivityStats {
  total: number
  average: number
  streak: number
  lastActivity?: Date
}