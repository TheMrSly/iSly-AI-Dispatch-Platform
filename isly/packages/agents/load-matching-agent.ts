
import { BaseAgent } from './base-agent'

export class LoadMatchingAgent extends BaseAgent {
  async run(): Promise<void> {
    try {
      console.log(`🔄 ${this.name} starting...`)

      // Get available loads
      const availableLoads = await this.prisma.load.findMany({
        where: { status: 'AVAILABLE' },
        orderBy: { createdAt: 'asc' },
      })

      // Get available drivers with trucks
      const availableDrivers = await this.prisma.driver.findMany({
        where: {
          status: 'AVAILABLE',
          truck: { status: 'AVAILABLE' },
        },
        include: { truck: true },
      })

      let matchesFound = 0

      for (const load of availableLoads) {
        // Simple matching algorithm based on location proximity and driver rating
        const suitableDriver = availableDrivers.find(driver => {
          // Simulate location-based matching (in real app, use geolocation)
          const driverState = driver.currentLocation?.split(', ')[1]
          const loadState = load.pickupLocation.split(', ')[1]
          
          return (
            driverState === loadState && // Same state
            driver.rating >= 4.5 && // High-rated drivers
            driver.truck && // Has assigned truck
            load.weight <= (driver.truck.maxWeight * 0.9) // Within weight capacity
          )
        })

        if (suitableDriver) {
          // Assign load to driver
          await this.prisma.load.update({
            where: { id: load.id },
            data: {
              status: 'ASSIGNED',
              driverId: suitableDriver.id,
              truckId: suitableDriver.truckId,
            },
          })

          // Update driver status
          await this.prisma.driver.update({
            where: { id: suitableDriver.id },
            data: { status: 'ON_DUTY' },
          })

          // Update truck status
          if (suitableDriver.truckId) {
            await this.prisma.truck.update({
              where: { id: suitableDriver.truckId },
              data: { status: 'IN_USE' },
            })
          }

          matchesFound++

          // Create notification
          await this.createNotification(
            'Load Assignment Complete',
            `Load ${load.loadNumber} assigned to ${suitableDriver.name}`,
            'SUCCESS',
            'MEDIUM'
          )

          console.log(`✅ Matched load ${load.loadNumber} with driver ${suitableDriver.name}`)
        }
      }

      // Record metrics
      await this.recordMetric('loads_matched_today', matchesFound)
      await this.recordMetric('available_loads', availableLoads.length)
      await this.recordMetric('available_drivers', availableDrivers.length)

      await this.updateAgentStatus('ACTIVE')
      await this.updateSuccessRate(true)

      console.log(`✅ ${this.name} completed. Matched ${matchesFound} loads.`)

    } catch (error) {
      console.error(`❌ ${this.name} error:`, error)
      await this.updateAgentStatus('ERROR')
      await this.updateSuccessRate(false)
      await this.createNotification(
        'Agent Error',
        `${this.name} encountered an error: ${error}`,
        'ERROR',
        'HIGH'
      )
    }
  }
}
