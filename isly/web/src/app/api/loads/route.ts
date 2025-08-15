
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where = status ? { status: status as 'AVAILABLE' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED' } : {}

    const [loads, total] = await Promise.all([
      prisma.load.findMany({
        where,
        include: {
          driver: true,
          truck: true,
          dispatcher: true,
          trackingEvents: {
            orderBy: { timestamp: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.load.count({ where }),
    ])

    return NextResponse.json({
      loads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching loads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch loads' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const load = await prisma.load.create({
      data: {
        loadNumber: data.loadNumber,
        pickupLocation: data.pickupLocation,
        deliveryLocation: data.deliveryLocation,
        pickupDate: new Date(data.pickupDate),
        deliveryDate: new Date(data.deliveryDate),
        distance: data.distance,
        weight: data.weight,
        commodity: data.commodity,
        rate: data.rate,
        brokerName: data.brokerName,
        brokerContact: data.brokerContact,
        specialInstructions: data.specialInstructions,
        dispatcherId: data.dispatcherId,
      },
      include: {
        driver: true,
        truck: true,
        dispatcher: true,
      },
    })

    return NextResponse.json(load, { status: 201 })
  } catch (error) {
    console.error('Error creating load:', error)
    return NextResponse.json(
      { error: 'Failed to create load' },
      { status: 500 }
    )
  }
}
