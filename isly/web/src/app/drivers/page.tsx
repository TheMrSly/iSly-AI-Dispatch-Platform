
'use client'

import React, { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, getStatusColor } from '@/lib/utils'
import { PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

interface Driver {
  id: string
  name: string
  email: string
  phone: string
  licenseNo: string
  cdlClass: string
  status: string
  currentLocation?: string
  homeBase: string
  hirDate: string
  rating: number
  totalMiles: number
  truck?: {
    unitNumber: string
    make: string
    model: string
  }
  loads?: Array<{
    loadNumber: string
    status: string
    pickupLocation: string
    deliveryLocation: string
  }>
  hosLogs?: Array<{
    date: string
    drivingTime: number
    status: string
  }>
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  useEffect(() => {
    fetchDrivers()
  }, [selectedStatus])

  const fetchDrivers = async () => {
    try {
      const url = selectedStatus === 'all' 
        ? '/api/drivers' 
        : `/api/drivers?status=${selectedStatus}`
      
      const response = await fetch(url)
      const data = await response.json()
      setDrivers(data.drivers || [])
    } catch (error) {
      console.error('Error fetching drivers:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusOptions = [
    { value: 'all', label: 'All Drivers' },
    { value: 'AVAILABLE', label: 'Available' },
    { value: 'ON_DUTY', label: 'On Duty' },
    { value: 'DRIVING', label: 'Driving' },
    { value: 'OFF_DUTY', label: 'Off Duty' },
  ]

  const getHoursFromMinutes = (minutes: number) => {
    return (minutes / 60).toFixed(1)
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

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Driver Management</h1>
            <p className="text-gray-600">Manage and monitor driver fleet</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Add New Driver
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

        {/* Drivers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {drivers.map((driver) => (
            <Card key={driver.id} className="card-hover">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{driver.name}</CardTitle>
                    <p className="text-sm text-gray-600">CDL Class {driver.cdlClass}</p>
                  </div>
                  <Badge className={getStatusColor(driver.status)}>
                    {driver.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contact Info */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <PhoneIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{driver.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{driver.email}</span>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <p className="text-sm font-medium text-gray-900">Current Location</p>
                  <p className="text-sm text-gray-600">
                    {driver.currentLocation || driver.homeBase}
                  </p>
                </div>

                {/* Truck Assignment */}
                {driver.truck && (
                  <div>
                    <p className="text-sm font-medium text-gray-900">Assigned Truck</p>
                    <p className="text-sm text-gray-600">
                      {driver.truck.unitNumber} - {driver.truck.make} {driver.truck.model}
                    </p>
                  </div>
                )}

                {/* Performance */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Rating</p>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-bold text-yellow-600">
                        {driver.rating.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-500">/ 5.0</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Total Miles</p>
                    <p className="text-sm text-gray-600">
                      {driver.totalMiles.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Current Load */}
                {driver.loads && driver.loads.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-900">Current Load</p>
                    <p className="text-sm text-gray-600">
                      {driver.loads[0].loadNumber}
                    </p>
                    <p className="text-xs text-gray-500">
                      {driver.loads[0].pickupLocation} → {driver.loads[0].deliveryLocation}
                    </p>
                  </div>
                )}

                {/* HOS Status */}
                {driver.hosLogs && driver.hosLogs.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-900">HOS Status</p>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(driver.hosLogs[0].status)}>
                        {driver.hosLogs[0].status}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {getHoursFromMinutes(driver.hosLogs[0].drivingTime)}h driven today
                      </span>
                    </div>
                  </div>
                )}

                {/* Hire Date */}
                <div>
                  <p className="text-sm font-medium text-gray-900">Hire Date</p>
                  <p className="text-xs text-gray-600">
                    {formatDate(driver.hirDate)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <button className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors">
                    View Profile
                  </button>
                  <button className="flex-1 px-3 py-2 text-sm bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors">
                    Contact
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {drivers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No drivers found for the selected filter</p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
