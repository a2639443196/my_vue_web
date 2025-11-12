export interface ActivityEntry {
  id: number
  category: 'water' | 'smoking' | 'slack' | 'game' | 'custom'
  action: string
  details: Record<string, any>
  created_at: string
  user_name?: string
}

export interface SmokingRecord {
  id: number
  count: number
  mood?: string | null
  notes?: string | null
  recorded_at: string
  created_at: string
}

export interface SlackRecord {
  id: number
  duration: number
  mood?: string | null
  notes?: string | null
  recorded_at: string
  created_at: string
}

export interface ActivityStats {
  total: number
  average: number
  streak: number
  lastActivity?: Date
}
