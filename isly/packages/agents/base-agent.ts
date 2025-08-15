
import { PrismaClient } from '@prisma/client'

export abstract class BaseAgent {
  protected prisma: PrismaClient
  protected agentId: string
  protected name: string

  constructor(agentId: string, name: string) {
    this.prisma = new PrismaClient()
    this.agentId = agentId
    this.name = name
  }

  abstract run(): Promise<void>

  protected async updateAgentStatus(status: 'ACTIVE' | 'ERROR' | 'MAINTENANCE') {
    await this.prisma.agent.update({
      where: { id: this.agentId },
      data: {
        status,
        lastRun: new Date(),
        nextRun: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes default
      },
    })
  }

  protected async createNotification(
    title: string,
    message: string,
    type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS' | 'ALERT',
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM',
    userId?: string
  ) {
    await this.prisma.notification.create({
      data: {
        title,
        message,
        type,
        priority,
        userId,
        agentId: this.agentId,
      },
    })
  }

  protected async recordMetric(metricName: string, value: number) {
    await this.prisma.agentMetric.create({
      data: {
        metricName,
        value,
        agentId: this.agentId,
      },
    })
  }

  protected async incrementTotalRuns() {
    await this.prisma.agent.update({
      where: { id: this.agentId },
      data: {
        totalRuns: { increment: 1 },
      },
    })
  }

  protected async updateSuccessRate(successful: boolean) {
    const agent = await this.prisma.agent.findUnique({
      where: { id: this.agentId },
    })

    if (agent) {
      const newTotalRuns = agent.totalRuns + 1
      const currentSuccessful = Math.round(agent.successRate * agent.totalRuns)
      const newSuccessful = successful ? currentSuccessful + 1 : currentSuccessful
      const newSuccessRate = newSuccessful / newTotalRuns

      await this.prisma.agent.update({
        where: { id: this.agentId },
        data: {
          successRate: newSuccessRate,
          totalRuns: newTotalRuns,
        },
      })
    }
  }

  async disconnect() {
    await this.prisma.$disconnect()
  }
}
