
'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn, getStatusColor } from '@/lib/utils'
import {
  CpuChipIcon,
  MapIcon,
  TruckIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline'

interface Agent {
  id: string
  name: string
  type: string
  status: string
  description: string
  successRate: number
  lastRun: string
  totalRuns: number
  metrics?: Array<{
    metricName: string
    value: number
    timestamp: string
  }>
}

interface AgentCardProps {
  agent: Agent
  onToggle?: (agentId: string, newStatus: string) => void
}

const agentIcons = {
  LOAD_MATCHING: TruckIcon,
  ROUTE_OPTIMIZATION: MapIcon,
  FUEL_OPTIMIZATION: TruckIcon,
  COMPLIANCE_MONITORING: ShieldCheckIcon,
  CUSTOMER_COMMUNICATION: ChatBubbleLeftRightIcon,
}

export function AgentCard({ agent, onToggle }: AgentCardProps) {
  const IconComponent = agentIcons[agent.type as keyof typeof agentIcons] || CpuChipIcon
  const isActive = agent.status === 'ACTIVE'
  
  const handleToggle = () => {
    if (onToggle) {
      onToggle(agent.id, isActive ? 'INACTIVE' : 'ACTIVE')
    }
  }

  const getLatestMetric = () => {
    if (!agent.metrics || agent.metrics.length === 0) return null
    return agent.metrics[0]
  }

  const latestMetric = getLatestMetric()

  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <IconComponent className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-sm font-medium">
            {agent.name}
          </CardTitle>
        </div>
        <Badge className={cn('text-xs', getStatusColor(agent.status))}>
          {agent.status}
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-gray-600 mb-3">
          {agent.description}
        </p>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Success Rate</span>
            <span className="font-medium">
              {(agent.successRate * 100).toFixed(1)}%
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Runs</span>
            <span className="font-medium">{agent.totalRuns}</span>
          </div>
          
          {latestMetric && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                {latestMetric.metricName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
              <span className="font-medium">
                {latestMetric.value}
              </span>
            </div>
          )}
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Last Run</span>
            <span className="font-medium">
              {new Date(agent.lastRun).toLocaleTimeString()}
            </span>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={handleToggle}
            className={cn(
              'w-full px-3 py-2 text-sm font-medium rounded-md transition-colors',
              isActive
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            )}
          >
            {isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
