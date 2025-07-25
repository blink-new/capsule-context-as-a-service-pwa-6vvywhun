import { useState, useEffect } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/navigation/BottomNav'
import { ContextStatusCard } from '@/components/context/ContextStatusCard'
import { ContextFeed } from '@/components/context/ContextFeed'
import { MetricsDashboard } from '@/components/metrics/MetricsDashboard'
import { ActionHooksPanel } from '@/components/automation/ActionHooksPanel'
import { useRealtimeContext } from '@/hooks/useRealtimeContext'
import { blink } from '@/blink/client'
import { AvailabilityStatus, PrivacyScope, ContextCapsule } from '@/types/context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Settings as SettingsIcon, 
  Webhook, 
  Shield, 
  Bell,
  Zap,
  Globe,
  Lock,
  Eye,
  Wifi,
  WifiOff
} from 'lucide-react'

function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  
  // Use real-time context hook
  const {
    contextCapsule,
    contextHistory,
    isConnected,
    isStreaming,
    updateContext,
    subscribeToContext,
    unsubscribeFromContext
  } = useRealtimeContext()

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
      
      // Subscribe to real-time context when user is authenticated
      if (state.user?.id && !state.isLoading) {
        subscribeToContext(state.user.id)
      } else if (!state.user) {
        unsubscribeFromContext()
      }
    })
    return unsubscribe
  }, [subscribeToContext, unsubscribeFromContext])

  const handleSignOut = () => {
    unsubscribeFromContext()
    blink.auth.logout()
  }

  const updateContextCapsule = async (updates: Partial<ContextCapsule>) => {
    await updateContext(updates)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Zap className="h-6 w-6 text-primary animate-pulse" />
          <span className="text-lg font-medium">Loading Capsule...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">Welcome to Capsule</CardTitle>
            <p className="text-muted-foreground">
              Your context-as-a-service nervous system for the agentic web
            </p>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => blink.auth.login()} 
              className="w-full"
              size="lg"
            >
              Sign In to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-4 md:space-y-6">
            {/* Mobile-first responsive layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="lg:col-span-1 space-y-4 md:space-y-6">
                {/* Context Status Card */}
                <ContextStatusCard
                  availabilityStatus={contextCapsule?.availabilityStatus || 'available'}
                  energyLevel={contextCapsule?.energyLevel || 75}
                  timezone={contextCapsule?.timezone || 'America/New_York'}
                  focusSessionActive={contextCapsule?.focusSessionActive || false}
                  focusSessionDuration={contextCapsule?.focusSessionDuration || 25}
                  privacyScope={contextCapsule?.privacyScope || 'private'}
                  onStatusChange={(status) => updateContextCapsule({ availabilityStatus: status })}
                  onEnergyChange={(energy) => updateContextCapsule({ energyLevel: energy })}
                  onTimezoneChange={(timezone) => updateContextCapsule({ timezone })}
                  onFocusToggle={(active) => updateContextCapsule({ focusSessionActive: active })}
                  onFocusDurationChange={(duration) => updateContextCapsule({ focusSessionDuration: duration })}
                  onPrivacyScopeChange={(scope) => updateContextCapsule({ privacyScope: scope })}
                />
                
                {/* Action Hooks Panel - Mobile: below context card, Desktop: same column */}
                <ActionHooksPanel userId={user.id} />
              </div>
              
              <div className="lg:col-span-2">
                <ContextFeed />
              </div>
            </div>
          </div>
        )
      
      case 'feed':
        return (
          <div className="max-w-4xl mx-auto">
            <ContextFeed />
          </div>
        )
      
      case 'metrics':
        return (
          <div className="max-w-6xl mx-auto">
            <MetricsDashboard />
          </div>
        )
      
      case 'team':
        return (
          <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Context
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  View and manage team member context visibility and sharing settings.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">JD</span>
                      </div>
                      <div>
                        <p className="font-medium">John Doe</p>
                        <p className="text-sm text-muted-foreground">Available • 85% energy</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Team</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                        <span className="text-sm font-medium">AS</span>
                      </div>
                      <div>
                        <p className="font-medium">Alice Smith</p>
                        <p className="text-sm text-muted-foreground">Focus Mode • 92% energy</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Team</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      
      case 'settings':
        return (
          <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Notifications</h4>
                      <p className="text-sm text-muted-foreground">Manage notification preferences</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Bell className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Privacy & Security</h4>
                      <p className="text-sm text-muted-foreground">Control who can access your context</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Shield className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Integrations</h4>
                      <p className="text-sm text-muted-foreground">Connect apps and services</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Webhook className="h-4 w-4 mr-2" />
                      Setup
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Action Hooks</h4>
                      <p className="text-sm text-muted-foreground">Manage automated actions</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('dashboard')}>
                      <Zap className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={user} 
        onSignOut={handleSignOut} 
        isConnected={isConnected}
        isStreaming={isStreaming}
      />
      
      <main className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 md:py-6 pb-20 max-w-7xl">
        {renderContent()}
      </main>
      
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      <Toaster />
    </div>
  )
}

export default App