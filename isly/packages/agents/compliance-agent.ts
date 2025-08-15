
import { BaseAgent } from './base-agent'

export class ComplianceAgent extends BaseAgent {
  async run(): Promise<void> {
    try {
      console.log(`🔄 ${this.name} starting...`)

      // Get all active drivers
      const drivers = await this.prisma.driver.findMany({
        where: {
          status: { not: 'OUT_OF_SERVICE' },
        },
        include: {
          hosLogs: {
            where: {
              date: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
              },
            },
            orderBy: { date: 'desc' },
          },
        },
      })

      let complianceChecks = 0
      let violationsFound = 0
      let warningsIssued = 0

      for (const driver of drivers) {
        complianceChecks++

        // Check recent HOS logs
        const recentLog = driver.hosLogs[0]
        if (recentLog) {
          // Check for HOS violations
          if (recentLog.drivingTime > 660) { // 11 hours max driving
            await this.createComplianceEvent(
              driver.id,
              'HOS_VIOLATION',
              'CRITICAL',
              `Driver ${driver.name} exceeded 11-hour driving limit: ${(recentLog.drivingTime / 60).toFixed(1)} hours`
            )
            violationsFound++
          } else if (recentLog.drivingTime > 600) { // Warning at 10 hours
            await this.createNotification(
              'HOS Warning',
              `Driver ${driver.name} approaching driving time limit: ${(recentLog.drivingTime / 60).toFixed(1)} hours`,
              'WARNING',
              'HIGH'
            )
            warningsIssued++
          }

          // Check for adequate rest
          if (recentLog.sleepTime < 600) { // Less than 10 hours rest
            await this.createNotification(
              'Rest Period Warning',
              `Driver ${driver.name} had insufficient rest: ${(recentLog.sleepTime / 60).toFixed(1)} hours`,
              'WARNING',
              'MEDIUM'
            )
            warningsIssued++
          }
        }

        // Simulate other compliance checks
        const randomCheck = Math.random()
        
        // License expiration check (simulate 5% chance of upcoming expiration)
        if (randomCheck < 0.05) {
          await this.createComplianceEvent(
            driver.id,
            'LICENSE_EXPIRED',
            'HIGH',
            `Driver ${driver.name}'s CDL expires within 30 days`
          )
          violationsFound++
        }

        // DOT physical check (simulate 3% chance)
        if (randomCheck > 0.95) {
          await this.createComplianceEvent(
            driver.id,
            'INSPECTION_DUE',
            'MEDIUM',
            `Driver ${driver.name}'s DOT physical expires within 60 days`
          )
        }
      }

      // Check truck compliance
      const trucks = await this.prisma.truck.findMany({
        where: { status: { not: 'OUT_OF_SERVICE' } },
      })

      for (const truck of trucks) {
        // Simulate inspection due dates
        const randomCheck = Math.random()
        if (randomCheck < 0.02) { // 2% chance
          await this.createNotification(
            'Vehicle Inspection Due',
            `Truck ${truck.unitNumber} annual inspection due within 30 days`,
            'WARNING',
            'MEDIUM'
          )
          warningsIssued++
        }
      }

      // Record metrics
      await this.recordMetric('compliance_checks_today', complianceChecks)
      await this.recordMetric('violations_found_today', violationsFound)
      await this.recordMetric('warnings_issued_today', warningsIssued)

      await this.updateAgentStatus('ACTIVE')
      await this.updateSuccessRate(true)

      console.log(`✅ ${this.name} completed. Checked ${complianceChecks} drivers, found ${violationsFound} violations, issued ${warningsIssued} warnings.`)

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

  private async createComplianceEvent(
    driverId: string,
    eventType: 'HOS_VIOLATION' | 'WEIGHT_VIOLATION' | 'PERMIT_EXPIRED' | 'INSPECTION_DUE' | 'LICENSE_EXPIRED' | 'DOT_VIOLATION',
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    description: string
  ) {
    await this.prisma.complianceEvent.create({
      data: {
        eventType,
        severity,
        description,
        driverId,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    })

    // Also create a notification
    await this.createNotification(
      'Compliance Violation',
      description,
      'ERROR',
      severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH'
    )
  }
}
