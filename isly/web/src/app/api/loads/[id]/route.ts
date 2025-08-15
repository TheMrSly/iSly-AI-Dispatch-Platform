
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const load = await prisma.load.findUnique({
      where: { id },
      include: {
        driver: true,
        truck: true,
        dispatcher: true,
        trackingEvents: {
          orderBy: { timestamp: 'desc' },
        },
      },
    })

    if (!load) {
      return NextResponse.json(
        { error: 'Load not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(load)
  } catch (error) {
    console.error('Error fetching load:', error)
    return NextResponse.json(
      { error: 'Failed to fetch load' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    
    const load = await prisma.load.update({
      where: { id },
      data: {
        ...data,
        pickupDate: data.pickupDate ? new Date(data.pickupDate) : undefined,
        deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : undefined,
      },
      include: {
        driver: true,
        truck: true,
        dispatcher: true,
      },
    })

    return NextResponse.json(load)
  } catch (error) {
    console.error('Error updating load:', error)
    return NextResponse.json(
      { error: 'Failed to update load' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.load.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting load:', error)
    return NextResponse.json(
      { error: 'Failed to delete load' },
      { status: 500 }
    )
  }
}
