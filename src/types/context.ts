export type AvailabilityStatus = 'available' | 'focus' | 'dnd' | 'away'
export type PrivacyScope = 'public' | 'team' | 'private'
export type MetricType = 'interruptions_prevented' | 'focus_time_preserved' | 'context_changes' | 'agent_requests'

export interface ContextCapsule {
  id: string
  userId: string
  availabilityStatus: AvailabilityStatus
  energyLevel: number
  timezone: string
  focusSessionActive: boolean
  focusSessionStartTime?: number
  focusSessionDuration: number
  privacyScope: PrivacyScope
  createdAt: number
  updatedAt: number
}

export interface ContextHistory {
  id: string
  userId: string
  capsuleId: string
  fieldChanged: string
  oldValue?: string
  newValue?: string
  timestamp: number
}

export interface ActionHook {
  id: string
  userId: string
  name: string
  triggerCondition: Record<string, any>
  actionType: string
  actionConfig: Record<string, any>
  isActive: boolean
  createdAt: number
  updatedAt: number
}

export interface UserMetric {
  id: string
  userId: string
  metricType: MetricType
  value: number
  date: string
  createdAt: number
}

export interface AgentAccessLog {
  id: string
  userId: string
  agentName: string
  accessType: string
  contextAccessed?: Record<string, any>
  timestamp: number
  ipAddress?: string
  userAgent?: string
}