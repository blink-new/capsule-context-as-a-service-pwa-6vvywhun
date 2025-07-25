import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'
import { 
  Shield, 
  Clock, 
  Zap, 
  TrendingUp, 
  Target,
  Activity,
  Bot,
  Focus
} from 'lucide-react'

interface MetricsDashboardProps {
  className?: string
}

// Mock data for demonstration
const weeklyData = [
  { day: 'Mon', interruptions: 12, focusTime: 4.5, energy: 75 },
  { day: 'Tue', interruptions: 8, focusTime: 6.2, energy: 82 },
  { day: 'Wed', interruptions: 15, focusTime: 3.8, energy: 68 },
  { day: 'Thu', interruptions: 6, focusTime: 7.1, energy: 88 },
  { day: 'Fri', interruptions: 10, focusTime: 5.5, energy: 79 },
  { day: 'Sat', interruptions: 3, focusTime: 2.1, energy: 85 },
  { day: 'Sun', interruptions: 2, focusTime: 1.8, energy: 90 }
]

const hourlyFocusData = [
  { hour: '9AM', focus: 85 },
  { hour: '10AM', focus: 92 },
  { hour: '11AM', focus: 78 },
  { hour: '12PM', focus: 45 },
  { hour: '1PM', focus: 35 },
  { hour: '2PM', focus: 88 },
  { hour: '3PM', focus: 95 },
  { hour: '4PM', focus: 82 },
  { hour: '5PM', focus: 65 }
]

export function MetricsDashboard({ className }: MetricsDashboardProps) {
  const totalInterruptionsPrevented = 156
  const totalFocusTimePreserved = 42.5 // hours
  const averageEnergyLevel = 81
  const contextChangesToday = 23

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interruptions Prevented</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{totalInterruptionsPrevented}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-accent">+12%</span> from last week
            </p>
            <Progress value={75} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Focus Time Preserved</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalFocusTimePreserved}h</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">+8%</span> from last week
            </p>
            <Progress value={68} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Energy</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{averageEnergyLevel}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-yellow-600">+5%</span> from last week
            </p>
            <Progress value={averageEnergyLevel} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Context Changes</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contextChangesToday}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">-15%</span> from yesterday
            </p>
            <Progress value={45} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Weekly Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="interruptions" fill="hsl(var(--destructive))" name="Interruptions" />
                <Bar dataKey="focusTime" fill="hsl(var(--primary))" name="Focus Time (h)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Focus Pattern */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Focus className="h-5 w-5" />
              Daily Focus Pattern
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={hourlyFocusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="focus" 
                  stroke="hsl(var(--accent))" 
                  fill="hsl(var(--accent))" 
                  fillOpacity={0.3}
                  name="Focus Level (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights and Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-accent/10 rounded-lg">
              <h4 className="font-medium text-sm mb-1">Peak Focus Time</h4>
              <p className="text-sm text-muted-foreground">
                Your focus is highest between 2-4 PM. Consider scheduling deep work during this window.
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-sm mb-1">Energy Pattern</h4>
              <p className="text-sm text-muted-foreground">
                Your energy dips after lunch. A 10-minute walk could help maintain afternoon productivity.
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-sm mb-1">Interruption Trend</h4>
              <p className="text-sm text-muted-foreground">
                Wednesdays have 40% more interruptions. Consider blocking calendar time for focused work.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Goals and Targets */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5" />
              Weekly Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Focus Time</span>
                <span className="text-sm text-muted-foreground">32h / 40h</span>
              </div>
              <Progress value={80} />
              <p className="text-xs text-muted-foreground">8 hours remaining to reach weekly goal</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Interruptions Prevented</span>
                <span className="text-sm text-muted-foreground">156 / 200</span>
              </div>
              <Progress value={78} />
              <p className="text-xs text-muted-foreground">44 more to reach weekly target</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Energy Consistency</span>
                <span className="text-sm text-muted-foreground">85%</span>
              </div>
              <Progress value={85} />
              <p className="text-xs text-muted-foreground">Excellent energy management this week!</p>
            </div>

            <div className="pt-2">
              <Badge variant="secondary" className="bg-accent/10 text-accent-foreground">
                <TrendingUp className="h-3 w-3 mr-1" />
                On track to beat last week's performance
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}