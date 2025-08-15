
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get latest KPIs
    const kpis = await prisma.kPI.findMany({
      orderBy: { timestamp: 'desc' },
      take: 20,
    })

    // Calculate real-time metrics
    const [
      totalLoads,
      activeLoads,
      availableDrivers,
      totalRevenue,
      activeDrivers,
      availableTrucks,
    ] = await Promise.all([
      prisma.load.count(),
      prisma.load.count({ where: { status: { in: ['ASSIGNED', 'IN_TRANSIT'] } } }),
      prisma.driver.count({ where: { status: 'AVAILABLE' } }),
      prisma.load.aggregate({
        _sum: { rate: true },
        where: { status: 'DELIVERED' },
      }),
      prisma.driver.count({ where: { status: { in: ['ON_DUTY', 'DRIVING'] } } }),
      prisma.truck.count({ where: { status: 'AVAILABLE' } }),
    ])

    const realTimeMetrics = {
      totalLoads,
      activeLoads,
      availableDrivers,
      totalRevenue: totalRevenue._sum.rate || 0,
      activeDrivers,
      availableTrucks,
      fleetUtilization: totalLoads > 0 ? (activeLoads / totalLoads) * 100 : 0,
    }

    return NextResponse.json({
      kpis,
      realTime: realTimeMetrics,
    })
  } catch (error) {
    console.error('Error fetching KPIs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch KPIs' },
      { status: 500 }
    )
  }
}
