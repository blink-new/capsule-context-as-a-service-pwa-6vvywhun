import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Webhook, 
  Plus, 
  Settings, 
  Trash2, 
  Zap,
  Bell,
  Globe,
  Smartphone,
  Monitor,
  Activity
} from 'lucide-react'
import { blink } from '@/blink/client'
import { ActionHook } from '@/types/context'

interface ActionHooksPanelProps {
  userId: string
}

const actionTypeConfig = {
  webhook: { 
    label: 'Webhook', 
    icon: Webhook, 
    description: 'Send HTTP request to external URL',
    color: 'bg-blue-500'
  },
  notification: { 
    label: 'Notification', 
    icon: Bell, 
    description: 'Send push notification or email',
    color: 'bg-green-500'
  },
  integration_update: { 
    label: 'Integration Update', 
    icon: Smartphone, 
    description: 'Update status in connected apps',
    color: 'bg-purple-500'
  }
}

const triggerConditions = [
  { value: 'status_change', label: 'Status Changes' },
  { value: 'energy_low', label: 'Energy Below Threshold' },
  { value: 'energy_high', label: 'Energy Above Threshold' },
  { value: 'focus_start', label: 'Focus Session Starts' },
  { value: 'focus_end', label: 'Focus Session Ends' },
  { value: 'privacy_change', label: 'Privacy Scope Changes' }
]

const parseTriggerCondition = (condition: string) => {
  // Convert simple condition string to object
  switch (condition) {
    case 'status_change':
      return { fieldChanged: 'availabilityStatus' }
    case 'energy_low':
      return { field: 'energyLevel', operator: 'lt', value: 30 }
    case 'energy_high':
      return { field: 'energyLevel', operator: 'gt', value: 80 }
    case 'focus_start':
      return { field: 'focusSessionActive', value: true }
    case 'focus_end':
      return { field: 'focusSessionActive', value: false }
    case 'privacy_change':
      return { fieldChanged: 'privacyScope' }
    default:
      return { fieldChanged: condition }
  }
}

export function ActionHooksPanel({ userId }: ActionHooksPanelProps) {
  const [actionHooks, setActionHooks] = useState<ActionHook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newHook, setNewHook] = useState({
    name: '',
    triggerCondition: '',
    actionType: '',
    actionConfig: {},
    isActive: true
  })

  const loadActionHooks = useCallback(async () => {
    try {
      setIsLoading(true)
      const hooks = await blink.db.actionHooks.list({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      })
      setActionHooks(hooks)
    } catch (error) {
      console.error('Failed to load action hooks:', error)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadActionHooks()
  }, [userId, loadActionHooks])

  const createActionHook = async () => {
    try {
      const hook = await blink.db.actionHooks.create({
        id: `hook_${Date.now()}`,
        userId,
        name: newHook.name,
        triggerCondition: parseTriggerCondition(newHook.triggerCondition),
        actionType: newHook.actionType,
        actionConfig: newHook.actionConfig,
        isActive: newHook.isActive,
        createdAt: Date.now(),
        updatedAt: Date.now()
      })
      
      setActionHooks(prev => [hook, ...prev])
      setIsCreateDialogOpen(false)
      setNewHook({
        name: '',
        triggerCondition: '',
        actionType: '',
        actionConfig: {},
        isActive: true
      })
    } catch (error) {
      console.error('Failed to create action hook:', error)
    }
  }

  const toggleActionHook = async (hookId: string, isActive: boolean) => {
    try {
      await blink.db.actionHooks.update(hookId, { isActive })
      setActionHooks(prev => 
        prev.map(hook => 
          hook.id === hookId ? { ...hook, isActive } : hook
        )
      )
    } catch (error) {
      console.error('Failed to toggle action hook:', error)
    }
  }

  const deleteActionHook = async (hookId: string) => {
    try {
      await blink.db.actionHooks.delete(hookId)
      setActionHooks(prev => prev.filter(hook => hook.id !== hookId))
    } catch (error) {
      console.error('Failed to delete action hook:', error)
    }
  }



  const renderActionConfig = () => {
    switch (newHook.actionType) {
      case 'webhook':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                placeholder="https://api.example.com/webhook"
                value={newHook.actionConfig.url || ''}
                onChange={(e) => setNewHook(prev => ({
                  ...prev,
                  actionConfig: { ...prev.actionConfig, url: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="webhook-method">HTTP Method</Label>
              <Select
                value={newHook.actionConfig.method || 'POST'}
                onValueChange={(value) => setNewHook(prev => ({
                  ...prev,
                  actionConfig: { ...prev.actionConfig, method: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )
      
      case 'notification':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="notification-message">Message Template</Label>
              <Textarea
                id="notification-message"
                placeholder="Context changed to {status}"
                value={newHook.actionConfig.message || ''}
                onChange={(e) => setNewHook(prev => ({
                  ...prev,
                  actionConfig: { ...prev.actionConfig, message: e.target.value }
                }))}
              />
            </div>
          </div>
        )
      
      case 'integration_update':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="integration-service">Service</Label>
              <Select
                value={newHook.actionConfig.service || ''}
                onValueChange={(value) => setNewHook(prev => ({
                  ...prev,
                  actionConfig: { ...prev.actionConfig, service: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slack">Slack</SelectItem>
                  <SelectItem value="discord">Discord</SelectItem>
                  <SelectItem value="teams">Microsoft Teams</SelectItem>
                  <SelectItem value="calendar">Calendar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Activity className="h-6 w-6 animate-pulse mr-2" />
          <span>Loading action hooks...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Action Hooks
          </CardTitle>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Hook
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Action Hook</DialogTitle>
                <DialogDescription>
                  Set up automated actions that trigger when your context changes.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="hook-name">Hook Name</Label>
                  <Input
                    id="hook-name"
                    placeholder="e.g., Update Slack Status"
                    value={newHook.name}
                    onChange={(e) => setNewHook(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="trigger-condition">Trigger Condition</Label>
                  <Select
                    value={newHook.triggerCondition}
                    onValueChange={(value) => setNewHook(prev => ({ ...prev, triggerCondition: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerConditions.map(condition => (
                        <SelectItem key={condition.value} value={condition.value}>
                          {condition.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="action-type">Action Type</Label>
                  <Select
                    value={newHook.actionType}
                    onValueChange={(value) => setNewHook(prev => ({ ...prev, actionType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select action type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(actionTypeConfig).map(([type, config]) => (
                        <SelectItem key={type} value={type}>
                          <div className="flex items-center gap-2">
                            <config.icon className="h-4 w-4" />
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {renderActionConfig()}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={createActionHook}
                  disabled={!newHook.name || !newHook.triggerCondition || !newHook.actionType}
                >
                  Create Hook
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {actionHooks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No action hooks configured</p>
            <p className="text-sm">Create hooks to automate actions based on context changes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {actionHooks.map((hook) => {
              const actionConfig = actionTypeConfig[hook.actionType as keyof typeof actionTypeConfig]
              const ActionIcon = actionConfig?.icon || Zap
              const isActive = Number(hook.isActive) > 0
              
              return (
                <div 
                  key={hook.id} 
                  className={`action-hook-card ${isActive ? 'action-hook-active' : ''} flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg space-y-3 sm:space-y-0`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 sm:h-8 sm:w-8 rounded-full ${actionConfig?.color || 'bg-gray-500'} flex items-center justify-center connection-indicator ${isActive ? '' : 'disconnected'}`}>
                      <ActionIcon className="h-5 w-5 sm:h-4 sm:w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm sm:text-base">{hook.name}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {actionConfig?.description || 'Custom action'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-2">
                    <Badge 
                      variant={isActive ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {isActive ? "Active" : "Inactive"}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={isActive}
                        onCheckedChange={(checked) => toggleActionHook(hook.id, checked)}
                        className="tap-target"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteActionHook(hook.id)}
                        className="tap-target mobile-button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}