
import { PrismaClient } from '@prisma/client'
import {
  LoadMatchingAgent,
  RouteOptimizationAgent,
  FuelOptimizationAgent,
  ComplianceAgent,
  CustomerCommunicationAgent,
} from './index'

const prisma = new PrismaClient()

export class AgentRunner {
  private agents: Map<string, any> = new Map()
  private isRunning = false

  async initialize() {
    console.log('🚀 Initializing AI Agents...')

    // Get agent configurations from database
    const agentConfigs = await prisma.agent.findMany({
      where: { status: 'ACTIVE' },
    })

    for (const config of agentConfigs) {
      let agent
      
      switch (config.type) {
        case 'LOAD_MATCHING':
          agent = new LoadMatchingAgent(config.id, config.name)
          break
        case 'ROUTE_OPTIMIZATION':
          agent = new RouteOptimizationAgent(config.id, config.name)
          break
        case 'FUEL_OPTIMIZATION':
          agent = new FuelOptimizationAgent(config.id, config.name)
          break
        case 'COMPLIANCE_MONITORING':
          agent = new ComplianceAgent(config.id, config.name)
          break
        case 'CUSTOMER_COMMUNICATION':
          agent = new CustomerCommunicationAgent(config.id, config.name)
          break
        default:
          console.warn(`Unknown agent type: ${config.type}`)
          continue
      }

      this.agents.set(config.id, agent)
      console.log(`✅ Initialized ${config.name}`)
    }

    console.log(`🎯 ${this.agents.size} agents initialized`)
  }

  async start() {
    if (this.isRunning) {
      console.log('⚠️ Agent runner already running')
      return
    }

    this.isRunning = true
    console.log('🏃 Starting agent runner...')

    // Run agents in intervals
    this.scheduleAgentRuns()
  }

  private scheduleAgentRuns() {
    // Run different agents at different intervals
    const intervals = {
      'LOAD_MATCHING': 2 * 60 * 1000,        // 2 minutes
      'ROUTE_OPTIMIZATION': 5 * 60 * 1000,   // 5 minutes
      'FUEL_OPTIMIZATION': 10 * 60 * 1000,   // 10 minutes
      'COMPLIANCE_MONITORING': 15 * 60 * 1000, // 15 minutes
      'CUSTOMER_COMMUNICATION': 30 * 60 * 1000, // 30 minutes
    }

    for (const [agentId, agent] of this.agents) {
      // Get agent type from database
      prisma.agent.findUnique({ where: { id: agentId } }).then(agentConfig => {
        if (agentConfig && intervals[agentConfig.type]) {
          const interval = intervals[agentConfig.type]
          
          // Initial run
          setTimeout(() => {
            this.runAgent(agentId, agent)
          }, Math.random() * 10000) // Stagger initial runs

          // Recurring runs
          setInterval(() => {
            if (this.isRunning) {
              this.runAgent(agentId, agent)
            }
          }, interval)
        }
      })
    }
  }

  private async runAgent(agentId: string, agent: any) {
    try {
      await agent.run()
    } catch (error) {
      console.error(`❌ Error running agent ${agentId}:`, error)
    }
  }

  async stop() {
    this.isRunning = false
    console.log('🛑 Stopping agent runner...')

    // Disconnect all agents
    for (const [agentId, agent] of this.agents) {
      try {
        await agent.disconnect()
      } catch (error) {
        console.error(`Error disconnecting agent ${agentId}:`, error)
      }
    }

    await prisma.$disconnect()
    console.log('✅ Agent runner stopped')
  }
}

// CLI runner
if (require.main === module) {
  const runner = new AgentRunner()

  async function main() {
    await runner.initialize()
    await runner.start()

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🔄 Graceful shutdown initiated...')
      await runner.stop()
      process.exit(0)
    })

    process.on('SIGTERM', async () => {
      console.log('\n🔄 Graceful shutdown initiated...')
      await runner.stop()
      process.exit(0)
    })

    console.log('🎯 Agent runner is active. Press Ctrl+C to stop.')
  }

  main().catch(console.error)
}
