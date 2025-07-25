import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Users, 
  UserPlus, 
  Settings, 
  Eye, 
  EyeOff, 
  Clock, 
  Zap, 
  Shield,
  MessageSquare,
  Calendar,
  Activity
} from 'lucide-react';
import { blink } from '../../blink/client';
import type { ContextCapsule } from '../../types/context';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'member' | 'viewer';
  status: 'available' | 'focus' | 'dnd' | 'away';
  energy: number;
  timezone: string;
  lastSeen: Date;
  contextVisible: boolean;
}

interface TeamCollaborationProps {
  currentUser: any;
}

export default function TeamCollaboration({ currentUser }: TeamCollaborationProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const loadTeamMembers = useCallback(async () => {
    try {
      const members = await blink.db.teamMembers.list({
        where: { teamId: currentUser?.teamId || 'default' },
        orderBy: { lastSeen: 'desc' }
      });
      setTeamMembers(members);
    } catch (error) {
      console.error('Failed to load team members:', error);
    }
  }, [currentUser?.teamId]);

  useEffect(() => {
    loadTeamMembers();
  }, [loadTeamMembers]);

  const inviteTeamMember = async () => {
    if (!inviteEmail.trim()) return;
    
    setLoading(true);
    try {
      await blink.db.teamInvites.create({
        id: `invite_${Date.now()}`,
        teamId: currentUser?.teamId || 'default',
        email: inviteEmail,
        invitedBy: currentUser?.id,
        role: 'member',
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      
      // Send invitation notification
      await blink.notifications.email({
        to: inviteEmail,
        subject: 'You\'ve been invited to join a Capsule team',
        html: `
          <h2>Team Invitation</h2>
          <p>${currentUser?.name || 'Someone'} has invited you to join their Capsule team.</p>
          <p>Capsule helps teams share context and reduce interruptions through intelligent automation.</p>
          <a href="${window.location.origin}/invite?token=invite_${Date.now()}" 
             style="background: #6366F1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 16px 0;">
            Accept Invitation
          </a>
        `
      });
      
      setInviteEmail('');
      loadTeamMembers();
    } catch (error) {
      console.error('Failed to invite team member:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleContextVisibility = async (memberId: string, visible: boolean) => {
    try {
      await blink.db.teamMembers.update(memberId, {
        contextVisible: visible
      });
      loadTeamMembers();
    } catch (error) {
      console.error('Failed to update context visibility:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'focus': return 'bg-blue-500';
      case 'dnd': return 'bg-red-500';
      case 'away': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getEnergyEmoji = (energy: number) => {
    if (energy >= 80) return '⚡';
    if (energy >= 60) return '🔋';
    if (energy >= 40) return '🔋';
    if (energy >= 20) return '🪫';
    return '😴';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Team Collaboration</h2>
          <p className="text-gray-600">Share context and coordinate with your team</p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          {teamMembers.length} members
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Team Overview</TabsTrigger>
          <TabsTrigger value="context">Context Sharing</TabsTrigger>
          <TabsTrigger value="settings">Team Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Team Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(member.status)}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{member.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {member.role}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="capitalize">{member.status}</span>
                          <span className="flex items-center gap-1">
                            {getEnergyEmoji(member.energy)} {member.energy}%
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {member.timezone}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleContextVisibility(member.id, !member.contextVisible)}
                      >
                        {member.contextVisible ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="context" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Context Sharing Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Availability Status</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Share your availability status with team members to reduce interruptions
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">Always Visible</Badge>
                    <span className="text-sm text-gray-500">to team members</span>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Energy Levels</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Let your team know your energy level for better task coordination
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Optional</Badge>
                    <span className="text-sm text-gray-500">configurable per member</span>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Focus Sessions</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Share active focus sessions to prevent interruptions during deep work
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-800">Recommended</Badge>
                    <span className="text-sm text-gray-500">for better collaboration</span>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Calendar Integration</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Sync meeting schedules to automatically update availability
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Coming Soon</Badge>
                    <span className="text-sm text-gray-500">Google Calendar, Outlook</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Invite Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && inviteTeamMember()}
                />
                <Button onClick={inviteTeamMember} disabled={loading}>
                  {loading ? 'Inviting...' : 'Invite'}
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Team members will receive an email invitation to join your Capsule team
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Team Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Auto-sync context changes</h4>
                  <p className="text-sm text-gray-600">
                    Automatically share context updates with team members
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Notification preferences</h4>
                  <p className="text-sm text-gray-600">
                    Control when team members receive notifications about your context
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Integration permissions</h4>
                  <p className="text-sm text-gray-600">
                    Manage which integrations can access team context data
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Review
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}