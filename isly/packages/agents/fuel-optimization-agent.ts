
import { BaseAgent } from './base-agent'

export class FuelOptimizationAgent extends BaseAgent {
  async run(): Promise<void> {
    try {
      console.log(`🔄 ${this.name} starting...`)

      // Get drivers currently on duty or driving
      const activeDrivers = await this.prisma.driver.findMany({
        where: {
          status: { in: ['ON_DUTY', 'DRIVING'] },
        },
        include: {
          truck: true,
          loads: {
            where: { status: { in: ['ASSIGNED', 'IN_TRANSIT'] } },
            take: 1,
          },
        },
      })

      let recommendationsGenerated = 0
      let totalPotentialSavings = 0

      // Simulate fuel station data (in real app, integrate with fuel APIs)
      const fuelStations = [
        { name: 'Pilot Travel Center', location: 'Dallas, TX', price: 3.85, distance: 12 },
        { name: 'TA Travel Center', location: 'Houston, TX', price: 3.92, distance: 8 },
        { name: 'Loves Travel Stop', location: 'Austin, TX', price: 3.79, distance: 15 },
        { name: 'Flying J', location: 'San Antonio, TX', price: 3.88, distance: 20 },
        { name: 'Pilot Travel Center', location: 'Phoenix, AZ', price: 3.95, distance: 25 },
      ]

      for (const driver of activeDrivers) {
        if (!driver.truck) continue

        // Simulate current fuel level (70-90% for demonstration)
        const currentFuelLevel = 0.7 + Math.random() * 0.2
        const fuelCapacity = driver.truck.fuelCapacity
        const currentFuel = currentFuelLevel * fuelCapacity

        // If fuel is below 40%, generate recommendation
        if (currentFuelLevel < 0.4) {
          // Find best fuel station within reasonable distance
          const nearbyStations = fuelStations.filter(station => station.distance <= 25)
          const bestStation = nearbyStations.reduce((best, current) => 
            current.price < best.price ? current : best
          )

          const fuelNeeded = fuelCapacity - currentFuel
          const currentPrice = 3.89 // Average market price
          const savings = (currentPrice - bestStation.price) * fuelNeeded

          if (savings > 5) { // Only recommend if saving more than $5
            await this.createNotification(
              'Fuel Savings Opportunity',
              `${driver.name}: Fuel at ${bestStation.name} (${bestStation.distance} miles) - Save $${savings.toFixed(2)}`,
              'INFO',
              'LOW'
            )

            recommendationsGenerated++
            totalPotentialSavings += savings

            console.log(`⛽ Fuel recommendation for ${driver.name}: ${bestStation.name} - $${savings.toFixed(2)} savings`)
          }
        }

        // Simulate fuel efficiency tracking
        const avgMPG = 6.5 + Math.random() * 1.5 // 6.5-8 MPG range
        await this.recordMetric(`fuel_efficiency_${driver.id}`, avgMPG)
      }

      // Record metrics
      await this.recordMetric('fuel_recommendations_today', recommendationsGenerated)
      await this.recordMetric('potential_fuel_savings_today', totalPotentialSavings)
      await this.recordMetric('active_drivers_monitored', activeDrivers.length)

      await this.updateAgentStatus('ACTIVE')
      await this.updateSuccessRate(true)

      console.log(`✅ ${this.name} completed. Generated ${recommendationsGenerated} recommendations, potential savings: $${totalPotentialSavings.toFixed(2)}.`)

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
