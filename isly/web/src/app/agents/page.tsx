
'use client'

import React, { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { AgentCard } from '@/components/dashboard/agent-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, getStatusColor } from '@/lib/utils'

interface Agent {
  id: string
  name: string
  type: string
  status: string
  description: string
  successRate: number
  lastRun: string
  nextRun?: string
  totalRuns: number
  config: Record<string, unknown>
  metrics: Array<{
    metricName: string
    value: number
    timestamp: string
  }>
  notifications: Array<{
    id: string
    title: string
    message: string
    type: string
    createdAt: string
  }>
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAgents()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchAgents, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents')
      const data = await response.json()
      setAgents(data || [])
    } catch (error) {
      console.error('Error fetching agents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAgentToggle = async (agentId: string, newStatus: string) => {
    try {
      await fetch('/api/agents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: agentId, status: newStatus }),
      })
      
      // Refresh data
      fetchAgents()
    } catch (error) {
      console.error('Error updating agent:', error)
    }
  }

  const getAgentTypeDescription = (type: string) => {
    const descriptions = {
      LOAD_MATCHING: 'Automatically matches available loads with suitable drivers and trucks based on location, capacity, and driver ratings.',
      ROUTE_OPTIMIZATION: 'Optimizes delivery routes for fuel efficiency, time savings, and cost reduction using real-time traffic data.',
      FUEL_OPTIMIZATION: 'Finds the best fuel prices along routes and recommends optimal fueling locations to minimize costs.',
      COMPLIANCE_MONITORING: 'Monitors Hours of Service (HOS) compliance, DOT regulations, and safety requirements in real-time.',
      CUSTOMER_COMMUNICATION: 'Sends automated updates to customers about load status, delivery times, and any delays or issues.',
      FINANCIAL_TRACKING: 'Tracks revenue, expenses, and profitability metrics across all operations and generates financial reports.',
    }
    return descriptions[type as keyof typeof descriptions] || 'AI agent for dispatch operations'
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="spinner h-8 w-8"></div>
        </div>
      </MainLayout>
    )
  }

  const activeAgents = agents.filter(agent => agent.status === 'ACTIVE')
  const inactiveAgents = agents.filter(agent => agent.status !== 'ACTIVE')

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Agent Management</h1>
          <p className="text-gray-600">Monitor and control AI agents powering your dispatch operations</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{activeAgents.length}</p>
                <p className="text-sm text-gray-600">Active Agents</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-600">{inactiveAgents.length}</p>
                <p className="text-sm text-gray-600">Inactive Agents</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">
                  {agents.length > 0 ? Math.round(agents.reduce((sum, agent) => sum + agent.successRate, 0) / agents.length * 100) : 0}%
                </p>
                <p className="text-sm text-gray-600">Avg Success Rate</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">
                  {agents.reduce((sum, agent) => sum + agent.totalRuns, 0)}
                </p>
                <p className="text-sm text-gray-600">Total Runs</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Agents */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Agents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onToggle={handleAgentToggle}
              />
            ))}
          </div>
        </div>

        {/* Inactive Agents */}
        {inactiveAgents.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Inactive Agents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inactiveAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onToggle={handleAgentToggle}
                />
              ))}
            </div>
          </div>
        )}

        {/* Agent Details */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Agent Details</h2>
          <div className="space-y-6">
            {agents.map((agent) => (
              <Card key={agent.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {getAgentTypeDescription(agent.type)}
                      </p>
                    </div>
                    <Badge className={getStatusColor(agent.status)}>
                      {agent.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Performance Metrics */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Performance</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Success Rate</span>
                          <span className="text-sm font-medium">
                            {(agent.successRate * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Runs</span>
                          <span className="text-sm font-medium">{agent.totalRuns}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Last Run</span>
                          <span className="text-sm font-medium">
                            {formatDate(agent.lastRun)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Recent Metrics */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Recent Metrics</h4>
                      <div className="space-y-2">
                        {agent.metrics.slice(0, 3).map((metric, index) => (
                          <div key={index} className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              {metric.metricName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                            <span className="text-sm font-medium">{metric.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Notifications */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Recent Activity</h4>
                      <div className="space-y-2">
                        {agent.notifications.slice(0, 3).map((notification) => (
                          <div key={notification.id} className="text-sm">
                            <p className="font-medium text-gray-900">{notification.title}</p>
                            <p className="text-gray-600 text-xs">
                              {formatDate(notification.createdAt)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
