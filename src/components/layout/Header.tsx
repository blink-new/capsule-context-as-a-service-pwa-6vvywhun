import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Bell, 
  Settings, 
  User, 
  LogOut, 
  Zap,
  Shield,
  Moon,
  Sun,
  Wifi,
  WifiOff
} from 'lucide-react'

interface HeaderProps {
  user?: {
    name: string
    email: string
    avatar?: string
  }
  onSignOut?: () => void
  isConnected?: boolean
}

export function Header({ user, onSignOut, isConnected = false }: HeaderProps) {
  const [isDark, setIsDark] = useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 max-w-7xl">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold">Capsule</h1>
            <p className="text-xs text-muted-foreground">Context-as-a-Service</p>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex items-center space-x-2">
          {/* Connection Status */}
          <Badge 
            variant={isConnected ? "default" : "secondary"} 
            className={`flex items-center gap-1 ${
              isConnected 
                ? "bg-accent/10 text-accent-foreground" 
                : "bg-destructive/10 text-destructive-foreground"
            }`}
          >
            {isConnected ? (
              <>
                <Wifi className="h-3 w-3" />
                <span className="hidden sm:inline">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                <span className="hidden sm:inline">Offline</span>
              </>
            )}
          </Badge>
          
          {/* Live Status */}
          <Badge variant="secondary" className="bg-accent/10 text-accent-foreground hidden sm:flex">
            <div className="mr-1 h-2 w-2 rounded-full bg-accent animate-pulse" />
            Live
          </Badge>
        </div>

        {/* User Menu */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-accent text-[10px] font-medium text-accent-foreground flex items-center justify-center">
              2
            </span>
          </Button>

          <Button variant="ghost" size="icon" onClick={toggleTheme} className="hidden sm:flex">
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  {user?.name && <p className="font-medium">{user.name}</p>}
                  {user?.email && (
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  )}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Shield className="mr-2 h-4 w-4" />
                <span>Privacy</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="sm:hidden" onClick={toggleTheme}>
                {isDark ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                <span>Toggle Theme</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}