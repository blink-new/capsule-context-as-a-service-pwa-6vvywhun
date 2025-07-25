import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Slack, 
  Calendar, 
  Mail, 
  MessageSquare, 
  Webhook, 
  Settings, 
  Plus,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Zap,
  Clock,
  Users
} from 'lucide-react';
import { blink } from '../../blink/client';

interface Integration {
  id: string;
  name: string;
  type: 'slack' | 'discord' | 'teams' | 'calendar' | 'email' | 'webhook' | 'zapier';
  status: 'connected' | 'disconnected' | 'error';
  enabled: boolean;
  config: Record<string, any>;
  lastSync?: Date;
  syncCount?: number;
}

interface IntegrationsPanelProps {
  currentUser: any;
}

const integrationTemplates = [
  {
    type: 'slack',
    name: 'Slack',
    icon: MessageSquare,
    description: 'Update your Slack status based on your context',
    features: ['Status sync', 'DND mode', 'Custom messages'],
    setupUrl: 'https://slack.com/oauth/v2/authorize'
  },
  {
    type: 'discord',
    name: 'Discord',
    icon: MessageSquare,
    description: 'Sync your Discord status and activity',
    features: ['Status updates', 'Rich presence', 'Server notifications'],
    setupUrl: 'https://discord.com/api/oauth2/authorize'
  },
  {
    type: 'teams',
    name: 'Microsoft Teams',
    icon: Users,
    description: 'Keep your Teams status in sync',
    features: ['Presence sync', 'Meeting awareness', 'Status messages'],
    setupUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'
  },
  {
    type: 'calendar',
    name: 'Google Calendar',
    icon: Calendar,
    description: 'Auto-update context based on calendar events',
    features: ['Meeting detection', 'Focus time blocking', 'Availability sync'],
    setupUrl: 'https://accounts.google.com/oauth/authorize'
  },
  {
    type: 'email',
    name: 'Email Notifications',
    icon: Mail,
    description: 'Send context updates via email',
    features: ['Status alerts', 'Daily summaries', 'Team notifications'],
    setupUrl: null
  },
  {
    type: 'webhook',
    name: 'Custom Webhooks',
    icon: Webhook,
    description: 'Send context data to any HTTP endpoint',
    features: ['Real-time updates', 'Custom payloads', 'Retry logic'],
    setupUrl: null
  },
  {
    type: 'zapier',
    name: 'Zapier',
    icon: Zap,
    description: 'Connect to 5000+ apps via Zapier',
    features: ['Automated workflows', 'Multi-step zaps', 'Conditional logic'],
    setupUrl: 'https://zapier.com/developer/public-invite/capsule'
  }
];

export default function IntegrationsPanel({ currentUser }: IntegrationsPanelProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('connected');

  const loadIntegrations = useCallback(async () => {
    try {
      const userIntegrations = await blink.db.integrations.list({
        where: { userId: currentUser?.id },
        orderBy: { createdAt: 'desc' }
      });
      setIntegrations(userIntegrations);
    } catch (error) {
      console.error('Failed to load integrations:', error);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (currentUser?.id) {
      loadIntegrations();
    }
  }, [currentUser?.id, loadIntegrations]);

  const connectIntegration = async (type: string) => {
    setLoading(true);
    try {
      const template = integrationTemplates.find(t => t.type === type);
      if (!template) return;

      if (template.setupUrl) {
        // For OAuth integrations, redirect to provider
        window.open(template.setupUrl, '_blank');
      } else {
        // For simple integrations, create directly
        await blink.db.integrations.create({
          id: `integration_${Date.now()}`,
          userId: currentUser?.id,
          name: template.name,
          type: type as any,
          status: 'connected',
          enabled: true,
          config: {},
          createdAt: new Date().toISOString()
        });
        loadIntegrations();
      }
    } catch (error) {
      console.error('Failed to connect integration:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleIntegration = async (integrationId: string, enabled: boolean) => {
    try {
      await blink.db.integrations.update(integrationId, { enabled });
      loadIntegrations();
    } catch (error) {
      console.error('Failed to toggle integration:', error);
    }
  };

  const testIntegration = async (integration: Integration) => {
    try {
      // Send test context update
      await blink.data.fetch({
        url: integration.config.webhookUrl || 'https://httpbin.org/post',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${integration.config.token || 'test'}`
        },
        body: {
          type: 'context_update',
          user: currentUser?.name,
          status: 'available',
          energy: 85,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          timestamp: new Date().toISOString(),
          test: true
        }
      });

      // Update last sync time
      await blink.db.integrations.update(integration.id, {
        lastSync: new Date().toISOString(),
        syncCount: (integration.syncCount || 0) + 1
      });

      loadIntegrations();
    } catch (error) {
      console.error('Failed to test integration:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const connectedIntegrations = integrations.filter(i => i.status === 'connected');
  const availableIntegrations = integrationTemplates.filter(
    template => !integrations.some(i => i.type === template.type)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Integrations</h2>
          <p className="text-gray-600">Connect your favorite tools and services</p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Zap className="w-4 h-4" />
          {connectedIntegrations.length} connected
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="connected">Connected ({connectedIntegrations.length})</TabsTrigger>
          <TabsTrigger value="available">Available ({availableIntegrations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="connected" className="space-y-4">
          {connectedIntegrations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Zap className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations connected</h3>
                <p className="text-gray-600 text-center mb-4">
                  Connect your favorite tools to automatically sync your context and reduce interruptions
                </p>
                <Button onClick={() => setActiveTab('available')}>
                  Browse Available Integrations
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {connectedIntegrations.map((integration) => {
                const template = integrationTemplates.find(t => t.type === integration.type);
                const IconComponent = template?.icon || Settings;
                
                return (
                  <Card key={integration.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-medium">{integration.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              {getStatusIcon(integration.status)}
                              <span className="capitalize">{integration.status}</span>
                              {integration.lastSync && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Last sync: {new Date(integration.lastSync).toLocaleTimeString()}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={integration.enabled}
                            onCheckedChange={(enabled) => toggleIntegration(integration.id, enabled)}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testIntegration(integration)}
                          >
                            Test
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {template && (
                        <div className="flex flex-wrap gap-2">
                          {template.features.map((feature) => (
                            <Badge key={feature} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {integration.syncCount && (
                        <div className="mt-3 text-sm text-gray-600">
                          {integration.syncCount} context updates synced
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          <div className="grid gap-4">
            {availableIntegrations.map((template) => {
              const IconComponent = template.icon;
              
              return (
                <Card key={template.type} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">{template.name}</h3>
                          <p className="text-sm text-gray-600">{template.description}</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => connectIntegration(template.type)}
                        disabled={loading}
                        className="flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Connect
                        {template.setupUrl && <ExternalLink className="w-3 h-3" />}
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {template.features.map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}