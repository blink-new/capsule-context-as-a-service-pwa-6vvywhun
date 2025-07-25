import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  Activity, 
  BarChart3, 
  Settings, 
  Zap,
  Users
} from 'lucide-react'

interface BottomNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'feed', label: 'Feed', icon: Activity, badge: 3 },
  { id: 'metrics', label: 'Metrics', icon: BarChart3 },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings }
]

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t safe-area-pb">
      <div className="container px-2 sm:px-4 max-w-7xl">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                className={`flex-col h-auto py-2 px-1 sm:px-3 relative min-w-0 ${
                  isActive 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => onTabChange(item.id)}
              >
                <div className="relative">
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5 mb-1" />
                  {item.badge && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-3 w-3 sm:h-4 sm:w-4 p-0 text-[8px] sm:text-[10px] flex items-center justify-center"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <span className="text-[10px] sm:text-xs font-medium truncate max-w-full">{item.label}</span>
                {isActive && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                )}
              </Button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}