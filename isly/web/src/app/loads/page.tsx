
'use client'

import React, { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, formatDistance, formatWeight, getStatusColor } from '@/lib/utils'

interface Load {
  id: string
  loadNumber: string
  status: string
  pickupLocation: string
  deliveryLocation: string
  pickupDate: string
  deliveryDate: string
  distance: number
  weight: number
  commodity: string
  rate: number
  brokerName?: string
  driver?: { name: string; phone: string }
  truck?: { unitNumber: string }
  trackingEvents?: Array<{
    eventType: string
    location: string
    timestamp: string
    notes?: string
  }>
}

export default function LoadsPage() {
  const [loads, setLoads] = useState<Load[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  useEffect(() => {
    fetchLoads()
  }, [selectedStatus])

  const fetchLoads = async () => {
    try {
      const url = selectedStatus === 'all' 
        ? '/api/loads' 
        : `/api/loads?status=${selectedStatus}`
      
      const response = await fetch(url)
      const data = await response.json()
      setLoads(data.loads || [])
    } catch (error) {
      console.error('Error fetching loads:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusOptions = [
    { value: 'all', label: 'All Loads' },
    { value: 'AVAILABLE', label: 'Available' },
    { value: 'ASSIGNED', label: 'Assigned' },
    { value: 'IN_TRANSIT', label: 'In Transit' },
    { value: 'DELIVERED', label: 'Delivered' },
  ]

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="spinner h-8 w-8"></div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Load Management</h1>
            <p className="text-gray-600">Manage and track all freight loads</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Add New Load
          </button>
        </div>

        {/* Filters */}
        <div className="flex space-x-4">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedStatus(option.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedStatus === option.value
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Loads Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {loads.map((load) => (
            <Card key={load.id} className="card-hover">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{load.loadNumber}</CardTitle>
                  <Badge className={getStatusColor(load.status)}>
                    {load.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Route */}
                <div>
                  <p className="text-sm font-medium text-gray-900">Route</p>
                  <p className="text-sm text-gray-600">
                    {load.pickupLocation} → {load.deliveryLocation}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDistance(load.distance)}
                  </p>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Pickup</p>
                    <p className="text-xs text-gray-600">
                      {formatDate(load.pickupDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Delivery</p>
                    <p className="text-xs text-gray-600">
                      {formatDate(load.deliveryDate)}
                    </p>
                  </div>
                </div>

                {/* Load Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Commodity</p>
                    <p className="text-xs text-gray-600">{load.commodity}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Weight</p>
                    <p className="text-xs text-gray-600">{formatWeight(load.weight)}</p>
                  </div>
                </div>

                {/* Rate */}
                <div>
                  <p className="text-sm font-medium text-gray-900">Rate</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(load.rate)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(load.rate / load.distance)} per mile
                  </p>
                </div>

                {/* Assignment */}
                {load.driver && (
                  <div>
                    <p className="text-sm font-medium text-gray-900">Assigned To</p>
                    <p className="text-sm text-gray-600">{load.driver.name}</p>
                    {load.truck && (
                      <p className="text-xs text-gray-500">Unit: {load.truck.unitNumber}</p>
                    )}
                  </div>
                )}

                {/* Broker */}
                {load.brokerName && (
                  <div>
                    <p className="text-sm font-medium text-gray-900">Broker</p>
                    <p className="text-xs text-gray-600">{load.brokerName}</p>
                  </div>
                )}

                {/* Latest Tracking */}
                {load.trackingEvents && load.trackingEvents.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-900">Latest Update</p>
                    <p className="text-xs text-gray-600">
                      {load.trackingEvents[0].eventType} - {load.trackingEvents[0].location}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(load.trackingEvents[0].timestamp)}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <button className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors">
                    View Details
                  </button>
                  {load.status === 'AVAILABLE' && (
                    <button className="flex-1 px-3 py-2 text-sm bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors">
                      Assign Driver
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {loads.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No loads found for the selected filter</p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
