
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatDistance(miles: number): string {
  return `${miles.toLocaleString()} mi`
}

export function formatWeight(pounds: number): string {
  return `${pounds.toLocaleString()} lbs`
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    // Load statuses
    AVAILABLE: 'bg-blue-100 text-blue-800',
    ASSIGNED: 'bg-yellow-100 text-yellow-800',
    IN_TRANSIT: 'bg-purple-100 text-purple-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    
    // Driver statuses
    ON_DUTY: 'bg-green-100 text-green-800',
    DRIVING: 'bg-blue-100 text-blue-800',
    OFF_DUTY: 'bg-gray-100 text-gray-800',
    OUT_OF_SERVICE: 'bg-red-100 text-red-800',
    
    // Truck statuses
    IN_USE: 'bg-blue-100 text-blue-800',
    MAINTENANCE: 'bg-yellow-100 text-yellow-800',
    
    // Agent statuses
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-gray-100 text-gray-800',
    ERROR: 'bg-red-100 text-red-800',
    
    // Notification types
    INFO: 'bg-blue-100 text-blue-800',
    WARNING: 'bg-yellow-100 text-yellow-800',
    SUCCESS: 'bg-green-100 text-green-800',
    ALERT: 'bg-red-100 text-red-800',
    
    // Compliance
    COMPLIANT: 'bg-green-100 text-green-800',
    VIOLATION: 'bg-red-100 text-red-800',
  }
  
  return statusColors[status] || 'bg-gray-100 text-gray-800'
}
