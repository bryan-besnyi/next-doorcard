export interface TimeBlock {
  id: string
  day: string
  startTime: string
  endTime: string
  activity: string
}

export interface BasicInfo {
  name: string
  doorcardName: string
  officeNumber: string
  term: string
  year: string
}

export interface Doorcard extends BasicInfo {
  id: string
  timeBlocks: TimeBlock[]
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface DoorcardDraft {
  id: string
  userId: string
  data: {
    name?: string
    doorcardName?: string
    officeNumber?: string
    term?: string
    year?: string
    timeBlocks?: TimeBlock[]
    currentStep?: number
    basicInfo?: Record<string, string>
    general?: string[]
  }
  lastUpdated: Date
}

