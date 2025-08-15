import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create Users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@isly.ai',
        name: 'Admin User',
        role: 'ADMIN',
      },
    }),
    prisma.user.create({
      data: {
        email: 'dispatcher@isly.ai',
        name: 'John Dispatcher',
        role: 'DISPATCHER',
      },
    }),
    prisma.user.create({
      data: {
        email: 'manager@isly.ai',
        name: 'Sarah Manager',
        role: 'MANAGER',
      },
    }),
  ])

  // Create Trucks
  const trucks = await Promise.all([
    prisma.truck.create({
      data: {
        unitNumber: 'T001',
        make: 'Peterbilt',
        model: '579',
        year: 2022,
        vin: '1XPWD40X1ED215001',
        plateNumber: 'TX-ABC123',
        status: 'AVAILABLE',
        currentLocation: 'Dallas, TX',
        mileage: 125000,
        fuelCapacity: 300,
        maxWeight: 80000,
      },
    }),
    prisma.truck.create({
      data: {
        unitNumber: 'T002',
        make: 'Kenworth',
        model: 'T680',
        year: 2021,
        vin: '1XKWD40X2JJ215002',
        plateNumber: 'TX-DEF456',
        status: 'IN_USE',
        currentLocation: 'Houston, TX',
        mileage: 98000,
        fuelCapacity: 280,
        maxWeight: 80000,
      },
    }),
    prisma.truck.create({
      data: {
        unitNumber: 'T003',
        make: 'Freightliner',
        model: 'Cascadia',
        year: 2023,
        vin: '3AKJHHDR5NSKG5003',
        plateNumber: 'TX-GHI789',
        status: 'AVAILABLE',
        currentLocation: 'Austin, TX',
        mileage: 45000,
        fuelCapacity: 320,
        maxWeight: 80000,
      },
    }),
  ])

  // Create Drivers
  const drivers = await Promise.all([
    prisma.driver.create({
      data: {
        name: 'Mike Johnson',
        email: 'mike.johnson@isly.ai',
        phone: '+1-555-0101',
        licenseNo: 'TX123456789',
        cdlClass: 'A',
        status: 'AVAILABLE',
        currentLocation: 'Dallas, TX',
        homeBase: 'Dallas, TX',
        hirDate: new Date('2020-03-15'),
        rating: 4.8,
        totalMiles: 450000,
        truckId: trucks[0].id,
      },
    }),
    prisma.driver.create({
      data: {
        name: 'Carlos Rodriguez',
        email: 'carlos.rodriguez@isly.ai',
        phone: '+1-555-0102',
        licenseNo: 'TX987654321',
        cdlClass: 'A',
        status: 'DRIVING',
        currentLocation: 'Houston, TX',
        homeBase: 'Houston, TX',
        hirDate: new Date('2019-07-22'),
        rating: 4.9,
        totalMiles: 520000,
        truckId: trucks[1].id,
      },
    }),
    prisma.driver.create({
      data: {
        name: 'Jennifer Smith',
        email: 'jennifer.smith@isly.ai',
        phone: '+1-555-0103',
        licenseNo: 'TX456789123',
        cdlClass: 'A',
        status: 'OFF_DUTY',
        currentLocation: 'Austin, TX',
        homeBase: 'Austin, TX',
        hirDate: new Date('2021-01-10'),
        rating: 4.7,
        totalMiles: 280000,
        truckId: trucks[2].id,
      },
    }),
  ])

  // Create Loads
  const loads = await Promise.all([
    prisma.load.create({
      data: {
        loadNumber: 'L2024-001',
        status: 'ASSIGNED',
        pickupLocation: 'Dallas, TX',
        deliveryLocation: 'Phoenix, AZ',
        pickupDate: new Date('2024-08-15T08:00:00Z'),
        deliveryDate: new Date('2024-08-16T18:00:00Z'),
        distance: 887.5,
        weight: 45000,
        commodity: 'Steel Coils',
        rate: 2850.00,
        brokerName: 'Freight Solutions LLC',
        brokerContact: 'broker@freightsolutions.com',
        specialInstructions: 'Tarps required, secure load properly',
        driverId: drivers[0].id,
        truckId: trucks[0].id,
        dispatcherId: users[1].id,
      },
    }),
    prisma.load.create({
      data: {
        loadNumber: 'L2024-002',
        status: 'IN_TRANSIT',
        pickupLocation: 'Houston, TX',
        deliveryLocation: 'Atlanta, GA',
        pickupDate: new Date('2024-08-14T06:00:00Z'),
        deliveryDate: new Date('2024-08-15T20:00:00Z'),
        distance: 789.2,
        weight: 38000,
        commodity: 'Construction Equipment',
        rate: 3200.00,
        brokerName: 'National Logistics',
        brokerContact: 'dispatch@nationallogistics.com',
        specialInstructions: 'Oversized load permit required',
        driverId: drivers[1].id,
        truckId: trucks[1].id,
        dispatcherId: users[1].id,
      },
    }),
    prisma.load.create({
      data: {
        loadNumber: 'L2024-003',
        status: 'AVAILABLE',
        pickupLocation: 'Austin, TX',
        deliveryLocation: 'Denver, CO',
        pickupDate: new Date('2024-08-16T10:00:00Z'),
        deliveryDate: new Date('2024-08-17T16:00:00Z'),
        distance: 926.8,
        weight: 42000,
        commodity: 'Machinery Parts',
        rate: 2950.00,
        brokerName: 'Southwest Freight',
        brokerContact: 'ops@southwestfreight.com',
        specialInstructions: 'Temperature sensitive, covered trailer required',
      },
    }),
  ])

  // Create AI Agents
  const agents = await Promise.all([
    prisma.agent.create({
      data: {
        name: 'Load Matching Agent',
        type: 'LOAD_MATCHING',
        status: 'ACTIVE',
        description: 'Automatically matches available loads with suitable drivers and trucks',
        config: {
          maxDistance: 500,
          preferredDriverRating: 4.5,
          considerFuelEfficiency: true,
        },
        lastRun: new Date(),
        nextRun: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        successRate: 0.85,
        totalRuns: 247,
      },
    }),
    prisma.agent.create({
      data: {
        name: 'Route Optimization Agent',
        type: 'ROUTE_OPTIMIZATION',
        status: 'ACTIVE',
        description: 'Optimizes routes for fuel efficiency and delivery time',
        config: {
          avoidTolls: false,
          prioritizeFuelStops: true,
          considerTraffic: true,
        },
        lastRun: new Date(),
        nextRun: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        successRate: 0.92,
        totalRuns: 156,
      },
    }),
    prisma.agent.create({
      data: {
        name: 'Fuel Optimization Agent',
        type: 'FUEL_OPTIMIZATION',
        status: 'ACTIVE',
        description: 'Finds best fuel prices and optimal fueling locations',
        config: {
          maxDetourMiles: 25,
          minimumSavings: 0.05,
          preferredStations: ['Pilot', 'TA', 'Loves'],
        },
        lastRun: new Date(),
        nextRun: new Date(Date.now() + 20 * 60 * 1000), // 20 minutes
        successRate: 0.78,
        totalRuns: 89,
      },
    }),
    prisma.agent.create({
      data: {
        name: 'Compliance Monitoring Agent',
        type: 'COMPLIANCE_MONITORING',
        status: 'ACTIVE',
        description: 'Monitors HOS compliance and regulatory requirements',
        config: {
          hosWarningThreshold: 30,
          checkInterval: 'hourly',
          autoAlerts: true,
        },
        lastRun: new Date(),
        nextRun: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        successRate: 0.96,
        totalRuns: 324,
      },
    }),
    prisma.agent.create({
      data: {
        name: 'Customer Communication Agent',
        type: 'CUSTOMER_COMMUNICATION',
        status: 'ACTIVE',
        description: 'Sends automated updates to customers about load status',
        config: {
          updateFrequency: 'every_4_hours',
          includeETA: true,
          sendDeliveryConfirmation: true,
        },
        lastRun: new Date(),
        nextRun: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours
        successRate: 0.88,
        totalRuns: 178,
      },
    }),
  ])

  // Create Tracking Events
  await Promise.all([
    prisma.trackingEvent.create({
      data: {
        eventType: 'PICKUP_COMPLETED',
        location: 'Dallas, TX',
        timestamp: new Date('2024-08-15T09:30:00Z'),
        notes: 'Load secured and ready for transport',
        loadId: loads[0].id,
      },
    }),
    prisma.trackingEvent.create({
      data: {
        eventType: 'IN_TRANSIT',
        location: 'Abilene, TX',
        timestamp: new Date('2024-08-15T14:15:00Z'),
        notes: 'On schedule, good weather conditions',
        loadId: loads[0].id,
      },
    }),
    prisma.trackingEvent.create({
      data: {
        eventType: 'PICKUP_COMPLETED',
        location: 'Houston, TX',
        timestamp: new Date('2024-08-14T07:45:00Z'),
        notes: 'Oversized load secured with permits',
        loadId: loads[1].id,
      },
    }),
  ])

  // Create Fuel Logs
  await Promise.all([
    prisma.fuelLog.create({
      data: {
        gallons: 125.5,
        pricePerGallon: 3.89,
        totalCost: 488.20,
        location: 'Pilot Travel Center - Dallas, TX',
        odometer: 125250,
        timestamp: new Date('2024-08-14T10:30:00Z'),
        driverId: drivers[0].id,
        truckId: trucks[0].id,
      },
    }),
    prisma.fuelLog.create({
      data: {
        gallons: 98.2,
        pricePerGallon: 3.92,
        totalCost: 384.94,
        location: 'TA Travel Center - Houston, TX',
        odometer: 98150,
        timestamp: new Date('2024-08-13T16:45:00Z'),
        driverId: drivers[1].id,
        truckId: trucks[1].id,
      },
    }),
  ])

  // Create HOS Logs
  await Promise.all([
    prisma.hOSLog.create({
      data: {
        date: new Date('2024-08-14'),
        onDutyTime: 480, // 8 hours
        drivingTime: 420, // 7 hours
        sleepTime: 600, // 10 hours
        offDutyTime: 240, // 4 hours
        violations: [],
        status: 'COMPLIANT',
        driverId: drivers[0].id,
      },
    }),
    prisma.hOSLog.create({
      data: {
        date: new Date('2024-08-14'),
        onDutyTime: 520, // 8.67 hours
        drivingTime: 480, // 8 hours
        sleepTime: 580, // 9.67 hours
        offDutyTime: 160, // 2.67 hours
        violations: ['Driving time approaching limit'],
        status: 'WARNING',
        driverId: drivers[1].id,
      },
    }),
  ])

  // Create Notifications
  await Promise.all([
    prisma.notification.create({
      data: {
        title: 'Load Assignment Complete',
        message: 'Load L2024-001 has been successfully assigned to Mike Johnson',
        type: 'SUCCESS',
        priority: 'MEDIUM',
        userId: users[1].id,
        agentId: agents[0].id,
      },
    }),
    prisma.notification.create({
      data: {
        title: 'HOS Warning',
        message: 'Carlos Rodriguez is approaching driving time limit',
        type: 'WARNING',
        priority: 'HIGH',
        userId: users[1].id,
        agentId: agents[3].id,
      },
    }),
    prisma.notification.create({
      data: {
        title: 'Fuel Savings Opportunity',
        message: 'Better fuel price found 15 miles ahead - save $12.50',
        type: 'INFO',
        priority: 'LOW',
        agentId: agents[2].id,
      },
    }),
  ])

  // Create KPIs
  await Promise.all([
    prisma.kPI.create({
      data: {
        name: 'Average Revenue Per Mile',
        value: 2.85,
        unit: 'USD',
        category: 'Financial',
      },
    }),
    prisma.kPI.create({
      data: {
        name: 'Fleet Utilization Rate',
        value: 87.5,
        unit: 'Percentage',
        category: 'Operations',
      },
    }),
    prisma.kPI.create({
      data: {
        name: 'On-Time Delivery Rate',
        value: 94.2,
        unit: 'Percentage',
        category: 'Performance',
      },
    }),
    prisma.kPI.create({
      data: {
        name: 'Average Fuel Cost Per Mile',
        value: 0.68,
        unit: 'USD',
        category: 'Financial',
      },
    }),
    prisma.kPI.create({
      data: {
        name: 'Driver Satisfaction Score',
        value: 4.6,
        unit: 'Rating',
        category: 'HR',
      },
    }),
  ])

  // Create Agent Metrics
  await Promise.all([
    prisma.agentMetric.create({
      data: {
        metricName: 'loads_matched_today',
        value: 12,
        agentId: agents[0].id,
      },
    }),
    prisma.agentMetric.create({
      data: {
        metricName: 'routes_optimized_today',
        value: 8,
        agentId: agents[1].id,
      },
    }),
    prisma.agentMetric.create({
      data: {
        metricName: 'fuel_savings_today',
        value: 245.80,
        agentId: agents[2].id,
      },
    }),
    prisma.agentMetric.create({
      data: {
        metricName: 'compliance_checks_today',
        value: 24,
        agentId: agents[3].id,
      },
    }),
  ])

  console.log('✅ Seed completed successfully!')
  console.log(`Created:`)
  console.log(`- ${users.length} users`)
  console.log(`- ${trucks.length} trucks`)
  console.log(`- ${drivers.length} drivers`)
  console.log(`- ${loads.length} loads`)
  console.log(`- ${agents.length} AI agents`)
  console.log(`- Sample tracking events, fuel logs, HOS logs, and notifications`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
