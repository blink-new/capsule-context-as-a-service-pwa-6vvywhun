import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Activity, 
  Clock, 
  Zap, 
  Focus, 
  Globe, 
  Users, 
  Lock,
  Bot,
  Smartphone,
  Monitor,
  RefreshCw
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ContextEvent {
  id: string
  type: 'status_change' | 'energy_update' | 'focus_session' | 'agent_access' | 'automation_trigger'
  title: string
  description: string
  timestamp: number
  metadata?: Record<string, any>
  source?: 'user' | 'agent' | 'automation'
  icon?: React.ComponentType<{ className?: string }>
}

interface ContextFeedProps {
  events?: ContextEvent[]
  isLoading?: boolean
  onRefresh?: () => void
}

// Mock data for demonstration
const mockEvents: ContextEvent[] = [
  {
    id: '1',
    type: 'status_change',
    title: 'Status changed to Focus Mode',
    description: 'Switched from Available to Focus Mode for deep work session',
    timestamp: Date.now() - 5 * 60 * 1000, // 5 minutes ago
    source: 'user',
    icon: Focus,
    metadata: { from: 'available', to: 'focus' }
  },
  {
    id: '2',
    type: 'agent_access',
    title: 'Calendar Agent accessed context',
    description: 'Checked availability for meeting scheduling',
    timestamp: Date.now() - 12 * 60 * 1000, // 12 minutes ago
    source: 'agent',
    icon: Bot,
    metadata: { agent: 'Calendar Agent', action: 'read_availability' }
  },
  {
    id: '3',
    type: 'energy_update',
    title: 'Energy level updated',
    description: 'Energy increased from 65% to 85% after coffee break',
    timestamp: Date.now() - 25 * 60 * 1000, // 25 minutes ago
    source: 'user',
    icon: Zap,
    metadata: { from: 65, to: 85 }
  },
  {
    id: '4',
    type: 'automation_trigger',
    title: 'Slack status updated',
    description: 'Automatically set Slack status to "In a meeting" based on calendar',
    timestamp: Date.now() - 45 * 60 * 1000, // 45 minutes ago
    source: 'automation',
    icon: Smartphone,
    metadata: { integration: 'Slack', action: 'status_update' }
  },
  {
    id: '5',
    type: 'focus_session',
    title: 'Focus session completed',
    description: 'Completed 25-minute Pomodoro session with 0 interruptions',
    timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
    source: 'user',
    icon: Focus,
    metadata: { duration: 25, interruptions: 0 }
  }
]

const eventTypeConfig = {
  status_change: { color: 'bg-blue-500', label: 'Status' },
  energy_update: { color: 'bg-yellow-500', label: 'Energy' },
  focus_session: { color: 'bg-purple-500', label: 'Focus' },
  agent_access: { color: 'bg-green-500', label: 'Agent' },
  automation_trigger: { color: 'bg-orange-500', label: 'Automation' }
}

const sourceConfig = {
  user: { icon: Monitor, label: 'Manual' },
  agent: { icon: Bot, label: 'Agent' },
  automation: { icon: RefreshCw, label: 'Auto' }
}

export function ContextFeed({ events = mockEvents, isLoading = false, onRefresh }: ContextFeedProps) {
  const [filter, setFilter] = useState<string>('all')

  const filteredEvents = events.filter(event => 
    filter === 'all' || event.type === filter
  )

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Context Feed
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          {Object.entries(eventTypeConfig).map(([type, config]) => (
            <Button
              key={type}
              variant={filter === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(type)}
            >
              {config.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] px-6">
          <div className="space-y-4 pb-6">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No context events yet</p>
                <p className="text-sm">Your context changes will appear here</p>
              </div>
            ) : (
              filteredEvents.map((event) => {
                const EventIcon = event.icon || Activity
                const typeConfig = eventTypeConfig[event.type]
                const sourceInfo = sourceConfig[event.source || 'user']
                
                return (
                  <div key={event.id} className="flex gap-3 group">
                    {/* Timeline indicator */}
                    <div className="flex flex-col items-center">
                      <div className={`h-8 w-8 rounded-full ${typeConfig.color} flex items-center justify-center`}>
                        <EventIcon className="h-4 w-4 text-white" />
                      </div>
                      <div className="w-px h-full bg-border mt-2 group-last:hidden" />
                    </div>
                    
                    {/* Event content */}
                    <div className="flex-1 min-w-0 pb-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm">{event.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {event.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant="outline" className="text-xs">
                            <sourceInfo.icon className="h-3 w-3 mr-1" />
                            {sourceInfo.label}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {typeConfig.label}
                        </Badge>
                      </div>
                      
                      {/* Metadata display */}
                      {event.metadata && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          {event.type === 'energy_update' && event.metadata.from && event.metadata.to && (
                            <span>{event.metadata.from}% → {event.metadata.to}%</span>
                          )}
                          {event.type === 'focus_session' && event.metadata.duration && (
                            <span>{event.metadata.duration} min • {event.metadata.interruptions} interruptions</span>
                          )}
                          {event.type === 'agent_access' && event.metadata.agent && (
                            <span>{event.metadata.agent}</span>
                          )}
                          {event.type === 'automation_trigger' && event.metadata.integration && (
                            <span>{event.metadata.integration}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}