import { useState, useEffect, useCallback } from 'react'
import { blink } from '@/blink/client'
import { ContextCapsule, ContextHistory } from '@/types/context'

interface RealtimeContextHook {
  contextCapsule: Partial<ContextCapsule> | null
  contextHistory: ContextHistory[]
  isConnected: boolean
  isStreaming: boolean
  updateContext: (updates: Partial<ContextCapsule>) => Promise<void>
  subscribeToContext: (userId: string) => Promise<void>
  unsubscribeFromContext: () => Promise<void>
}

// Helper functions for action hooks
const executeWebhookAction = async (config: any, capsule: Partial<ContextCapsule>) => {
  if (config.url) {
    try {
      const response = await blink.data.fetch({
        url: config.url,
        method: config.method || 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'Capsule-Context-Service/1.0'
        },
        body: { 
          context: capsule, 
          timestamp: Date.now(),
          event: 'context_changed',
          source: 'capsule'
        }
      })
      console.log('Webhook executed successfully:', response.status)
    } catch (error) {
      console.error('Webhook execution failed:', error)
    }
  }
}

const executeNotificationAction = async (config: any, capsule: Partial<ContextCapsule>) => {
  if (config.message) {
    try {
      // Enhanced notification with context interpolation
      const message = config.message
        .replace('{status}', capsule.availabilityStatus || 'unknown')
        .replace('{energy}', capsule.energyLevel?.toString() || '0')
        .replace('{timezone}', capsule.timezone || 'UTC')
      
      // For now, log the notification - could integrate with push notifications
      console.log('📱 Context Notification:', message, {
        context: capsule,
        timestamp: new Date().toISOString()
      })
      
      // Could send email notification using Blink SDK
      // await blink.notifications.email({
      //   to: user.email,
      //   subject: 'Context Update',
      //   text: message
      // })
    } catch (error) {
      console.error('Notification execution failed:', error)
    }
  }
}

const executeIntegrationUpdate = async (config: any, capsule: Partial<ContextCapsule>) => {
  try {
    // Enhanced integration updates with service-specific logic
    const statusMap = {
      available: '🟢 Available',
      focus: '🔵 Focus Mode',
      dnd: '🔴 Do Not Disturb',
      away: '🟡 Away'
    }
    
    const status = statusMap[capsule.availabilityStatus as keyof typeof statusMap] || '⚪ Unknown'
    const energyEmoji = (capsule.energyLevel || 0) > 75 ? '⚡' : (capsule.energyLevel || 0) > 50 ? '🔋' : '🪫'
    
    switch (config.service) {
      case 'slack':
        console.log('🔗 Slack Status Update:', {
          status_text: `${status} ${energyEmoji} ${capsule.energyLevel}%`,
          status_emoji: capsule.availabilityStatus === 'focus' ? ':brain:' : ':wave:',
          context: capsule
        })
        break
      
      case 'discord':
        console.log('🎮 Discord Status Update:', {
          activity: `${status} - Energy: ${capsule.energyLevel}%`,
          context: capsule
        })
        break
      
      case 'teams':
        console.log('💼 Teams Status Update:', {
          availability: capsule.availabilityStatus,
          message: `Energy: ${capsule.energyLevel}%`,
          context: capsule
        })
        break
      
      case 'calendar':
        console.log('📅 Calendar Integration:', {
          busy: capsule.availabilityStatus === 'focus' || capsule.availabilityStatus === 'dnd',
          context: capsule
        })
        break
      
      default:
        console.log('🔧 Generic Integration Update:', config, capsule)
    }
  } catch (error) {
    console.error('Integration update failed:', error)
  }
}

const executeActionHook = async (hook: any, capsule: Partial<ContextCapsule>) => {
  try {
    // Log the action hook execution
    console.log(`Executing action hook: ${hook.name}`, { hook, capsule })
    
    // Here you would implement different action types
    switch (hook.actionType) {
      case 'webhook':
        await executeWebhookAction(hook.actionConfig, capsule)
        break
      case 'notification':
        await executeNotificationAction(hook.actionConfig, capsule)
        break
      case 'integration_update':
        await executeIntegrationUpdate(hook.actionConfig, capsule)
        break
      default:
        console.warn(`Unknown action type: ${hook.actionType}`)
    }
  } catch (error) {
    console.error(`Failed to execute action hook ${hook.name}:`, error)
  }
}

const evaluateTriggerCondition = (condition: any, capsule: Partial<ContextCapsule>, updates: Partial<ContextCapsule>): boolean => {
  // Simple condition evaluation - can be expanded
  if (condition.field && condition.value !== undefined) {
    const currentValue = capsule[condition.field as keyof ContextCapsule]
    return currentValue === condition.value
  }
  
  if (condition.fieldChanged) {
    return Object.keys(updates).includes(condition.fieldChanged)
  }
  
  if (condition.field && condition.operator) {
    const currentValue = capsule[condition.field as keyof ContextCapsule] as number
    switch (condition.operator) {
      case 'lt':
        return currentValue < condition.value
      case 'gt':
        return currentValue > condition.value
      case 'eq':
        return currentValue === condition.value
      default:
        return false
    }
  }
  
  return false
}

export function useRealtimeContext(): RealtimeContextHook {
  const [contextCapsule, setContextCapsule] = useState<Partial<ContextCapsule> | null>(null)
  const [contextHistory, setContextHistory] = useState<ContextHistory[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [channel, setChannel] = useState<any>(null)

  const triggerActionHooks = useCallback(async (capsule: Partial<ContextCapsule>, updates: Partial<ContextCapsule>) => {
    try {
      // Get active action hooks for this user
      const actionHooks = await blink.db.actionHooks.list({
        where: { 
          userId: capsule.userId,
          isActive: "1" // SQLite boolean as string
        }
      })

      for (const hook of actionHooks) {
        // Check if trigger condition is met
        const shouldTrigger = evaluateTriggerCondition(hook.triggerCondition, capsule, updates)
        
        if (shouldTrigger) {
          // Execute action hook
          await executeActionHook(hook, capsule)
        }
      }
    } catch (error) {
      console.error('Failed to trigger action hooks:', error)
    }
  }, [])

  const subscribeToContext = useCallback(async (userId: string) => {
    try {
      setIsStreaming(true)
      
      // Create realtime channel for context updates
      const contextChannel = blink.realtime.channel(`context-${userId}`)
      
      await contextChannel.subscribe({
        userId,
        metadata: { type: 'context_subscriber', timestamp: Date.now() }
      })

      // Listen for context updates
      contextChannel.onMessage((message) => {
        if (message.type === 'context_update') {
          setContextCapsule(prev => ({ ...prev, ...message.data }))
          
          // Add to history
          const historyEntry: ContextHistory = {
            id: `hist_${Date.now()}`,
            userId,
            capsuleId: message.data.id || 'current',
            fieldChanged: message.data.fieldChanged || 'unknown',
            oldValue: message.data.oldValue,
            newValue: message.data.newValue,
            timestamp: Date.now()
          }
          setContextHistory(prev => [historyEntry, ...prev.slice(0, 49)]) // Keep last 50 entries
        }
      })

      // Listen for presence changes to track connection status
      contextChannel.onPresence((users) => {
        setIsConnected(users.length > 0)
      })

      setChannel(contextChannel)
      setIsConnected(true)
      setIsStreaming(false)

      // Load initial context from database
      const existingContext = await blink.db.contextCapsules.list({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        limit: 1
      })

      if (existingContext.length > 0) {
        setContextCapsule(existingContext[0])
      } else {
        // Create initial context capsule
        const initialCapsule = {
          id: `capsule_${Date.now()}`,
          userId,
          availabilityStatus: 'available' as const,
          energyLevel: 75,
          timezone: 'America/New_York',
          focusSessionActive: false,
          focusSessionDuration: 25,
          privacyScope: 'private' as const,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
        
        const newCapsule = await blink.db.contextCapsules.create(initialCapsule)
        setContextCapsule(newCapsule)
      }

      // Load recent history
      const recentHistory = await blink.db.contextHistory.list({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        limit: 20
      })
      setContextHistory(recentHistory)

    } catch (error) {
      console.error('Failed to subscribe to context:', error)
      setIsConnected(false)
      setIsStreaming(false)
    }
  }, [])

  const unsubscribeFromContext = useCallback(async () => {
    if (channel) {
      await channel.unsubscribe()
      setChannel(null)
      setIsConnected(false)
      setIsStreaming(false)
    }
  }, [channel])

  const updateContext = useCallback(async (updates: Partial<ContextCapsule>) => {
    if (!contextCapsule) return

    try {
      const updatedCapsule = { ...contextCapsule, ...updates, updatedAt: Date.now() }
      
      // Update local state immediately (optimistic update)
      setContextCapsule(updatedCapsule)

      // Save to database
      if (updatedCapsule.id) {
        await blink.db.contextCapsules.update(updatedCapsule.id, updates)
      } else {
        const newCapsule = await blink.db.contextCapsules.create({
          ...updatedCapsule,
          id: `capsule_${Date.now()}`,
          createdAt: Date.now()
        })
        setContextCapsule(newCapsule)
      }

      // Create history entry
      const historyEntry = {
        id: `hist_${Date.now()}`,
        userId: updatedCapsule.userId || '',
        capsuleId: updatedCapsule.id || 'current',
        fieldChanged: Object.keys(updates)[0],
        oldValue: contextCapsule[Object.keys(updates)[0] as keyof ContextCapsule],
        newValue: updates[Object.keys(updates)[0] as keyof Partial<ContextCapsule>],
        timestamp: Date.now()
      }
      
      await blink.db.contextHistory.create(historyEntry)
      setContextHistory(prev => [historyEntry, ...prev.slice(0, 49)])

      // Broadcast update to other subscribers
      if (channel) {
        await channel.publish('context_update', {
          ...updates,
          fieldChanged: Object.keys(updates)[0],
          oldValue: contextCapsule[Object.keys(updates)[0] as keyof ContextCapsule],
          newValue: updates[Object.keys(updates)[0] as keyof Partial<ContextCapsule>]
        })
      }

      // Trigger action hooks
      await triggerActionHooks(updatedCapsule, updates)

    } catch (error) {
      console.error('Failed to update context:', error)
      // Revert optimistic update on error
      setContextCapsule(contextCapsule)
    }
  }, [contextCapsule, channel, triggerActionHooks])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribeFromContext()
    }
  }, [unsubscribeFromContext])

  return {
    contextCapsule,
    contextHistory,
    isConnected,
    isStreaming,
    updateContext,
    subscribeToContext,
    unsubscribeFromContext
  }
}