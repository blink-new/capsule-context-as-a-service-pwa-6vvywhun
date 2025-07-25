import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  TrendingUp, 
  Clock, 
  Zap, 
  Shield, 
  Brain,
  Calendar,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Users,
  Lightbulb,
  Award
} from 'lucide-react';
import { blink } from '../../blink/client';

interface AnalyticsData {
  focusTime: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    trend: 'up' | 'down' | 'stable';
  };
  interruptions: {
    prevented: number;
    received: number;
    efficiency: number;
  };
  contextChanges: {
    total: number;
    byStatus: Record<string, number>;
    patterns: Array<{
      time: string;
      status: string;
      frequency: number;
    }>;
  };
  teamImpact: {
    membersHelped: number;
    contextShared: number;
    collaborationScore: number;
  };
  predictions: {
    nextFocusTime: string;
    optimalEnergyHours: string[];
    recommendedBreaks: string[];
  };
  insights: Array<{
    id: string;
    type: 'tip' | 'achievement' | 'warning' | 'insight';
    title: string;
    description: string;
    action?: string;
  }>;
}

interface AdvancedAnalyticsProps {
  currentUser: any;
}

export default function AdvancedAnalytics({ currentUser }: AdvancedAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [activeTab, setActiveTab] = useState('overview');

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Simulate analytics data - in real app, this would come from your analytics service
      const mockAnalytics: AnalyticsData = {
        focusTime: {
          today: 4.5,
          thisWeek: 28.5,
          thisMonth: 112,
          trend: 'up'
        },
        interruptions: {
          prevented: 47,
          received: 12,
          efficiency: 79.7
        },
        contextChanges: {
          total: 156,
          byStatus: {
            available: 45,
            focus: 38,
            dnd: 28,
            away: 45
          },
          patterns: [
            { time: '09:00', status: 'focus', frequency: 85 },
            { time: '11:00', status: 'available', frequency: 70 },
            { time: '14:00', status: 'focus', frequency: 90 },
            { time: '16:00', status: 'available', frequency: 65 }
          ]
        },
        teamImpact: {
          membersHelped: 8,
          contextShared: 234,
          collaborationScore: 92
        },
        predictions: {
          nextFocusTime: '2:30 PM',
          optimalEnergyHours: ['9:00 AM', '2:00 PM', '4:30 PM'],
          recommendedBreaks: ['11:30 AM', '3:30 PM', '5:30 PM']
        },
        insights: [
          {
            id: '1',
            type: 'achievement',
            title: 'Focus Master!',
            description: 'You\'ve maintained focus sessions 23% longer than last week',
            action: 'Keep it up!'
          },
          {
            id: '2',
            type: 'tip',
            title: 'Optimal Energy Pattern',
            description: 'Your energy peaks at 2 PM - schedule important tasks then',
            action: 'Block calendar'
          },
          {
            id: '3',
            type: 'insight',
            title: 'Team Collaboration',
            description: 'Your context sharing helped prevent 12 interruptions for teammates',
            action: 'View details'
          },
          {
            id: '4',
            type: 'warning',
            title: 'Context Switching',
            description: 'You switched contexts 34% more than usual today',
            action: 'Review patterns'
          }
        ]
      };

      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      loadAnalytics();
    }
  }, [currentUser?.id, timeRange]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <Award className="w-5 h-5 text-yellow-500" />;
      case 'tip': return <Lightbulb className="w-5 h-5 text-blue-500" />;
      case 'warning': return <Shield className="w-5 h-5 text-red-500" />;
      default: return <Brain className="w-5 h-5 text-purple-500" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Advanced Analytics</h2>
          <p className="text-gray-600">Deep insights into your context patterns and productivity</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={timeRange === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('day')}
          >
            Day
          </Button>
          <Button
            variant={timeRange === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('week')}
          >
            Week
          </Button>
          <Button
            variant={timeRange === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('month')}
          >
            Month
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Focus Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.focusTime.thisWeek}h
                </p>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  {getTrendIcon(analytics.focusTime.trend)}
                  <span>+12% vs last week</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Interruptions Prevented</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.interruptions.prevented}
                </p>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <Shield className="w-3 h-3" />
                  <span>{analytics.interruptions.efficiency}% efficiency</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Context Changes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.contextChanges.total}
                </p>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Activity className="w-3 h-3" />
                  <span>This week</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Team Impact</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.teamImpact.collaborationScore}
                </p>
                <div className="flex items-center gap-1 text-sm text-blue-600">
                  <Users className="w-3 h-3" />
                  <span>{analytics.teamImpact.membersHelped} members helped</span>
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Context Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.contextChanges.byStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          status === 'available' ? 'bg-green-500' :
                          status === 'focus' ? 'bg-blue-500' :
                          status === 'dnd' ? 'bg-red-500' : 'bg-gray-400'
                        }`} />
                        <span className="capitalize text-sm font-medium">{status}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{count}</span>
                        <div className="w-20 h-2 bg-gray-200 rounded-full">
                          <div 
                            className={`h-2 rounded-full ${
                              status === 'available' ? 'bg-green-500' :
                              status === 'focus' ? 'bg-blue-500' :
                              status === 'dnd' ? 'bg-red-500' : 'bg-gray-400'
                            }`}
                            style={{ width: `${(count / analytics.contextChanges.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Daily Patterns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.contextChanges.patterns.map((pattern) => (
                    <div key={pattern.time} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium w-16">{pattern.time}</span>
                        <Badge variant="outline" className="capitalize text-xs">
                          {pattern.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{pattern.frequency}%</span>
                        <div className="w-16 h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-indigo-500 rounded-full"
                            style={{ width: `${pattern.frequency}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Context Patterns Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Peak Focus Hours</h4>
                  <div className="flex flex-wrap gap-2">
                    {analytics.predictions.optimalEnergyHours.map((hour) => (
                      <Badge key={hour} className="bg-blue-100 text-blue-800">
                        {hour}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Recommended Break Times</h4>
                  <div className="flex flex-wrap gap-2">
                    {analytics.predictions.recommendedBreaks.map((time) => (
                      <Badge key={time} variant="outline">
                        {time}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Context Switching Frequency</h4>
                  <div className="text-sm text-gray-600">
                    You typically switch contexts every 2.3 hours, which is optimal for maintaining focus while staying responsive to your team.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI-Powered Predictions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Next Optimal Focus Time</h4>
                <p className="text-blue-800">{analytics.predictions.nextFocusTime}</p>
                <p className="text-sm text-blue-700 mt-1">
                  Based on your energy patterns and calendar availability
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Energy Forecast</h4>
                <p className="text-green-800">High energy expected at 2:00 PM today</p>
                <p className="text-sm text-green-700 mt-1">
                  Perfect time for challenging tasks or important meetings
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Interruption Risk</h4>
                <p className="text-purple-800">Low risk between 9-11 AM</p>
                <p className="text-sm text-purple-700 mt-1">
                  Your team is typically in focus mode during these hours
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {analytics.insights.map((insight) => (
              <Card key={insight.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{insight.title}</h4>
                        <Badge 
                          variant={insight.type === 'achievement' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {insight.type}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{insight.description}</p>
                      {insight.action && (
                        <Button variant="outline" size="sm">
                          {insight.action}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}