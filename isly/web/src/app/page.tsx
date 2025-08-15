
'use client'

import React, { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { StatsCard } from '@/components/dashboard/stats-card'
import { AgentCard } from '@/components/dashboard/agent-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import {
  TruckIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline'

interface DashboardData {
  summary: {
    loads: Record<string, number>
    drivers: Record<string, number>
    trucks: Record<string, number>
    revenue: { total: number; average: number }
    distance: { total: number; average: number }
  }
  recentLoads: Array<{
    id: string
    loadNumber: string
    status: string
    pickupLocation: string
    deliveryLocation: string
    rate: number
    driver?: { name: string }
    truck?: { unitNumber: string }
  }>
  recentNotifications: Array<{
    id: string
    title: string
    message: string
    type: string
    priority: string
    createdAt: string
    agent?: { name: string }
  }>
  agentStatus: Array<{
    id: string
    name: string
    type: string
    status: string
    description: string
    successRate: number
    lastRun: string
    totalRuns: number
  }>
  kpis: Array<{
    name: string
    value: number
    unit: string
    category: string
  }>
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard')
      const dashboardData = await response.json()
      setData(dashboardData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
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
      fetchDashboardData()
    } catch (error) {
      console.error('Error updating agent:', error)
    }
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

  if (!data) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Failed to load dashboard data</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to iSly dispatch management platform</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Active Loads"
            value={data.summary.loads.in_transit || 0}
            change={{ value: 12, type: 'increase' }}
            icon={<DocumentTextIcon />}
          />
          <StatsCard
            title="Available Drivers"
            value={data.summary.drivers.available || 0}
            change={{ value: 5, type: 'decrease' }}
            icon={<UserGroupIcon />}
          />
          <StatsCard
            title="Fleet Utilization"
            value={`${Math.round(((data.summary.trucks.in_use || 0) / (Object.values(data.summary.trucks).reduce((sum, count) => sum + count, 0) || 1)) * 100)}%`}
            change={{ value: 8, type: 'increase' }}
            icon={<TruckIcon />}
          />
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(data.summary.revenue.total)}
            change={{ value: 15, type: 'increase' }}
            icon={<CurrencyDollarIcon />}
          />
        </div>

        {/* AI Agents */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Agents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {data.agentStatus.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onToggle={handleAgentToggle}
              />
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Loads */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Loads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.recentLoads.map((load) => (
                    <div
                      key={load.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{load.loadNumber}</span>
                          <Badge className={getStatusColor(load.status)}>
                            {load.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {load.pickupLocation} → {load.deliveryLocation}
                        </p>
                        {load.driver && (
                          <p className="text-xs text-gray-500">
                            Driver: {load.driver.name}
                            {load.truck && ` | Unit: ${load.truck.unitNumber}`}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(load.rate)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Notifications */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.recentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          {notification.agent && (
                            <p className="text-xs text-gray-500 mt-1">
                              From: {notification.agent.name}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge className={getStatusColor(notification.type)}>
                            {notification.type}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* KPIs */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Performance Indicators</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {data.kpis.map((kpi, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {kpi.unit === 'USD' ? formatCurrency(kpi.value) : kpi.value}
                      {kpi.unit === 'Percentage' && '%'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{kpi.name}</p>
                    <p className="text-xs text-gray-500">{kpi.category}</p>
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
