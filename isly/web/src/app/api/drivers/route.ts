
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where = status ? { status: status as 'AVAILABLE' | 'ON_DUTY' | 'DRIVING' | 'OFF_DUTY' | 'OUT_OF_SERVICE' } : {}

    const [drivers, total] = await Promise.all([
      prisma.driver.findMany({
        where,
        include: {
          truck: true,
          loads: {
            where: { status: { in: ['ASSIGNED', 'IN_TRANSIT'] } },
            take: 1,
          },
          hosLogs: {
            orderBy: { date: 'desc' },
            take: 1,
          },
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.driver.count({ where }),
    ])

    return NextResponse.json({
      drivers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching drivers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch drivers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const driver = await prisma.driver.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        licenseNo: data.licenseNo,
        cdlClass: data.cdlClass,
        homeBase: data.homeBase,
        hirDate: new Date(data.hirDate),
        truckId: data.truckId,
      },
      include: {
        truck: true,
      },
    })

    return NextResponse.json(driver, { status: 201 })
  } catch (error) {
    console.error('Error creating driver:', error)
    return NextResponse.json(
      { error: 'Failed to create driver' },
      { status: 500 }
    )
  }
}
