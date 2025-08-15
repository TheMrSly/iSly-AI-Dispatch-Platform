
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get dashboard summary data
    const [
      loadStats,
      driverStats,
      truckStats,
      recentLoads,
      recentNotifications,
      agentStatus,
      kpis,
    ] = await Promise.all([
      // Load statistics
      prisma.load.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      
      // Driver statistics
      prisma.driver.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      
      // Truck statistics
      prisma.truck.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      
      // Recent loads
      prisma.load.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          driver: true,
          truck: true,
        },
      }),
      
      // Recent notifications
      prisma.notification.findMany({
        take: 10,
        where: { read: false },
        orderBy: { createdAt: 'desc' },
        include: {
          agent: true,
        },
      }),
      
      // Agent status
      prisma.agent.findMany({
        select: {
          id: true,
          name: true,
          type: true,
          status: true,
          description: true,
          successRate: true,
          lastRun: true,
          totalRuns: true,
        },
      }),
      
      // Key metrics
      prisma.kPI.findMany({
        orderBy: { timestamp: 'desc' },
        take: 10,
      }),
    ])

    // Calculate revenue metrics
    const revenueData = await prisma.load.aggregate({
      _sum: { rate: true },
      _avg: { rate: true },
      where: { status: 'DELIVERED' },
    })

    // Calculate distance metrics
    const distanceData = await prisma.load.aggregate({
      _sum: { distance: true },
      _avg: { distance: true },
      where: { status: { in: ['DELIVERED', 'IN_TRANSIT'] } },
    })

    const dashboard = {
      summary: {
        loads: loadStats.reduce((acc, stat) => {
          acc[stat.status.toLowerCase()] = stat._count.status
          return acc
        }, {} as Record<string, number>),
        
        drivers: driverStats.reduce((acc, stat) => {
          acc[stat.status.toLowerCase()] = stat._count.status
          return acc
        }, {} as Record<string, number>),
        
        trucks: truckStats.reduce((acc, stat) => {
          acc[stat.status.toLowerCase()] = stat._count.status
          return acc
        }, {} as Record<string, number>),
        
        revenue: {
          total: revenueData._sum.rate || 0,
          average: revenueData._avg.rate || 0,
        },
        
        distance: {
          total: distanceData._sum.distance || 0,
          average: distanceData._avg.distance || 0,
        },
      },
      
      recentLoads,
      recentNotifications,
      agentStatus,
      kpis,
    }

    return NextResponse.json(dashboard)
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
