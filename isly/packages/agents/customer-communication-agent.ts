
import { BaseAgent } from './base-agent'

export class CustomerCommunicationAgent extends BaseAgent {
  async run(): Promise<void> {
    try {
      console.log(`🔄 ${this.name} starting...`)

      // Get loads that need customer updates
      const activeLoads = await this.prisma.load.findMany({
        where: {
          status: { in: ['ASSIGNED', 'IN_TRANSIT'] },
        },
        include: {
          driver: true,
          truck: true,
          trackingEvents: {
            orderBy: { timestamp: 'desc' },
            take: 1,
          },
        },
      })

      let updatesGenerated = 0
      let customersNotified = 0

      for (const load of activeLoads) {
        const lastUpdate = load.trackingEvents[0]
        const hoursSinceLastUpdate = lastUpdate 
          ? (Date.now() - lastUpdate.timestamp.getTime()) / (1000 * 60 * 60)
          : 24

        // Send update if it's been more than 4 hours since last update
        if (hoursSinceLastUpdate >= 4) {
          const updateMessage = this.generateUpdateMessage(load)
          
          // In a real app, this would send emails/SMS to customers
          // For demo, we'll create notifications and tracking events
          
          await this.createNotification(
            'Customer Update Sent',
            `Update sent for load ${load.loadNumber}: ${updateMessage}`,
            'INFO',
            'LOW'
          )

          // Create tracking event for the update
          await this.prisma.trackingEvent.create({
            data: {
              eventType: 'CUSTOMER_UPDATE',
              location: load.driver?.currentLocation || 'Unknown',
              timestamp: new Date(),
              notes: updateMessage,
              loadId: load.id,
            },
          })

          updatesGenerated++
          customersNotified++

          console.log(`📧 Customer update sent for load ${load.loadNumber}`)
        }

        // Check for delivery confirmation needed
        if (load.status === 'IN_TRANSIT') {
          const deliveryTime = new Date(load.deliveryDate).getTime()
          const currentTime = Date.now()
          
          // If delivery was supposed to happen in the last 2 hours, check for confirmation
          if (currentTime > deliveryTime && currentTime - deliveryTime < 2 * 60 * 60 * 1000) {
            await this.createNotification(
              'Delivery Confirmation Needed',
              `Load ${load.loadNumber} delivery confirmation required`,
              'WARNING',
              'HIGH'
            )
          }
        }
      }

      // Generate proactive customer communications
      const upcomingDeliveries = await this.prisma.load.findMany({
        where: {
          status: 'IN_TRANSIT',
          deliveryDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next 24 hours
          },
        },
      })

      for (const load of upcomingDeliveries) {
        const hoursUntilDelivery = (new Date(load.deliveryDate).getTime() - Date.now()) / (1000 * 60 * 60)
        
        if (hoursUntilDelivery <= 4 && hoursUntilDelivery > 2) {
          await this.createNotification(
            'Delivery Reminder Sent',
            `Delivery reminder sent for load ${load.loadNumber} - arriving in ${hoursUntilDelivery.toFixed(1)} hours`,
            'INFO',
            'LOW'
          )
          updatesGenerated++
        }
      }

      // Record metrics
      await this.recordMetric('customer_updates_sent_today', updatesGenerated)
      await this.recordMetric('customers_notified_today', customersNotified)
      await this.recordMetric('active_loads_monitored', activeLoads.length)

      await this.updateAgentStatus('ACTIVE')
      await this.updateSuccessRate(true)

      console.log(`✅ ${this.name} completed. Sent ${updatesGenerated} updates to ${customersNotified} customers.`)

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

  private generateUpdateMessage(load: any): string {
    const driver = load.driver
    const truck = load.truck
    const lastEvent = load.trackingEvents[0]

    let message = `Load ${load.loadNumber} update: `

    if (load.status === 'ASSIGNED') {
      message += `Driver ${driver?.name} has been assigned and is preparing for pickup.`
    } else if (load.status === 'IN_TRANSIT') {
      const currentLocation = lastEvent?.location || driver?.currentLocation || 'En route'
      message += `Currently ${currentLocation}. `
      
      // Calculate ETA (simplified)
      const deliveryTime = new Date(load.deliveryDate)
      const hoursUntilDelivery = (deliveryTime.getTime() - Date.now()) / (1000 * 60 * 60)
      
      if (hoursUntilDelivery > 0) {
        message += `Estimated delivery: ${deliveryTime.toLocaleDateString()} at ${deliveryTime.toLocaleTimeString()}.`
      } else {
        message += `Delivery was scheduled for ${deliveryTime.toLocaleDateString()}. Checking status...`
      }
    }

    if (driver) {
      message += ` Driver: ${driver.name} (${driver.phone})`
    }

    if (truck) {
      message += ` | Unit: ${truck.unitNumber}`
    }

    return message
  }
}
