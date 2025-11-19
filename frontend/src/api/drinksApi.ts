import http from './http'

export interface DrinkOption {
  id: number | string
  name: string
  amount: number
  icon?: string
  caffeineMg?: number | null
  isDefault?: boolean
}

export interface CreateDrinkPayload {
  name: string
  amount: number
  icon?: string
  caffeineMg?: number | null
}

export const drinksApi = {
  async fetchDrinkOptions(): Promise<DrinkOption[]> {
    const { data } = await http.get<DrinkOption[]>('/activities/drinks/')
    return data
  },

  async createDrink(payload: CreateDrinkPayload): Promise<DrinkOption> {
    const { data } = await http.post<DrinkOption>('/activities/drinks/', payload)
    return data
  },

  async deleteDrink(drinkId: number | string): Promise<void> {
    await http.delete(`/activities/drinks/${drinkId}/`)
  }
}

export default drinksApi