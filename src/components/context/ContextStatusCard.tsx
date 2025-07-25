import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Circle, 
  Focus, 
  Moon, 
  Zap, 
  Clock, 
  Globe,
  Lock,
  Users,
  Play,
  Pause
} from 'lucide-react'
import { AvailabilityStatus, PrivacyScope } from '@/types/context'

interface ContextStatusCardProps {
  availabilityStatus: AvailabilityStatus
  energyLevel: number
  timezone: string
  focusSessionActive: boolean
  focusSessionDuration: number
  privacyScope: PrivacyScope
  onStatusChange: (status: AvailabilityStatus) => void
  onEnergyChange: (energy: number) => void
  onTimezoneChange: (timezone: string) => void
  onFocusToggle: (active: boolean) => void
  onFocusDurationChange: (duration: number) => void
  onPrivacyScopeChange: (scope: PrivacyScope) => void
}

const statusConfig = {
  available: { 
    label: 'Available', 
    color: 'bg-accent', 
    icon: Circle,
    description: 'Open to interactions and notifications'
  },
  focus: { 
    label: 'Focus Mode', 
    color: 'bg-blue-500', 
    icon: Focus,
    description: 'Deep work mode - minimal interruptions'
  },
  dnd: { 
    label: 'Do Not Disturb', 
    color: 'bg-red-500', 
    icon: Moon,
    description: 'No interruptions unless urgent'
  },
  away: { 
    label: 'Away', 
    color: 'bg-yellow-500', 
    icon: Clock,
    description: 'Not available - will respond later'
  }
}

const privacyConfig = {
  public: { label: 'Public', icon: Globe, description: 'Visible to everyone' },
  team: { label: 'Team', icon: Users, description: 'Visible to team members' },
  private: { label: 'Private', icon: Lock, description: 'Only visible to you' }
}

export function ContextStatusCard({
  availabilityStatus,
  energyLevel,
  timezone,
  focusSessionActive,
  focusSessionDuration,
  privacyScope,
  onStatusChange,
  onEnergyChange,
  onTimezoneChange,
  onFocusToggle,
  onFocusDurationChange,
  onPrivacyScopeChange
}: ContextStatusCardProps) {
  const [localEnergyLevel, setLocalEnergyLevel] = useState([energyLevel])
  const currentStatus = statusConfig[availabilityStatus]
  const currentPrivacy = privacyConfig[privacyScope]

  const handleEnergyChange = (value: number[]) => {
    setLocalEnergyLevel(value)
    onEnergyChange(value[0])
  }

  return (
    <Card className="w-full mobile-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Context Status</CardTitle>
          <Badge variant="outline" className="flex items-center gap-1 connection-indicator">
            <currentPrivacy.icon className="h-3 w-3" />
            <span className="hidden sm:inline">{currentPrivacy.label}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {/* Availability Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Availability</label>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${currentStatus.color}`} />
              <span className="text-sm text-muted-foreground">{currentStatus.label}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(statusConfig).map(([status, config]) => (
              <Button
                key={status}
                variant={availabilityStatus === status ? "default" : "outline"}
                size="sm"
                className="justify-start text-xs sm:text-sm mobile-button tap-target"
                onClick={() => onStatusChange(status as AvailabilityStatus)}
              >
                <config.icon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="truncate">{config.label}</span>
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{currentStatus.description}</p>
        </div>

        {/* Energy Level */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Energy Level
            </label>
            <span className="text-sm font-medium">{localEnergyLevel[0]}%</span>
          </div>
          <Slider
            value={localEnergyLevel}
            onValueChange={handleEnergyChange}
            max={100}
            step={5}
            className="w-full mobile-slider"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>

        {/* Focus Session */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-2">
              <Focus className="h-4 w-4" />
              Focus Session
            </label>
            <Switch
              checked={focusSessionActive}
              onCheckedChange={onFocusToggle}
              className="tap-target"
            />
          </div>
          {focusSessionActive && (
            <div className="space-y-2 pl-6">
              <div className="flex items-center gap-2">
                <Play className="h-3 w-3 text-accent" />
                <span className="text-sm text-muted-foreground">
                  Active session: {focusSessionDuration} minutes
                </span>
              </div>
              <Select
                value={focusSessionDuration.toString()}
                onValueChange={(value) => onFocusDurationChange(parseInt(value))}
              >
                <SelectTrigger className="w-full mobile-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="25">25 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Timezone */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Timezone
          </label>
          <Select value={timezone} onValueChange={onTimezoneChange}>
            <SelectTrigger className="mobile-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UTC">UTC</SelectItem>
              <SelectItem value="America/New_York">Eastern Time</SelectItem>
              <SelectItem value="America/Chicago">Central Time</SelectItem>
              <SelectItem value="America/Denver">Mountain Time</SelectItem>
              <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
              <SelectItem value="Europe/London">London</SelectItem>
              <SelectItem value="Europe/Paris">Paris</SelectItem>
              <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
              <SelectItem value="Asia/Shanghai">Shanghai</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Privacy Scope */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Privacy Scope</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(privacyConfig).map(([scope, config]) => (
              <Button
                key={scope}
                variant={privacyScope === scope ? "default" : "outline"}
                size="sm"
                className="flex-col h-auto py-2 sm:py-3 mobile-button tap-target"
                onClick={() => onPrivacyScopeChange(scope as PrivacyScope)}
              >
                <config.icon className="h-3 w-3 sm:h-4 sm:w-4 mb-1" />
                <span className="text-xs">{config.label}</span>
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{currentPrivacy.description}</p>
        </div>
      </CardContent>
    </Card>
  )
}