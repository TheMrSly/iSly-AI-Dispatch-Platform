
// AI Agents Worker Service
const { createClient } = require('redis');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

class AIAgentsWorker {
  constructor() {
    this.isRunning = false;
    this.concurrency = parseInt(process.env.WORKER_CONCURRENCY) || 5;
  }

  async start() {
    try {
      await redis.connect();
      console.log('✅ Connected to Redis');
      
      await prisma.$connect();
      console.log('✅ Connected to PostgreSQL');

      this.isRunning = true;
      console.log(`🚀 AI Agents Worker started with concurrency: ${this.concurrency}`);

      // Start processing jobs
      this.processJobs();
      
      // Health check endpoint
      this.startHealthCheck();

    } catch (error) {
      console.error('❌ Failed to start AI Agents Worker:', error);
      process.exit(1);
    }
  }

  async processJobs() {
    while (this.isRunning) {
      try {
        // Listen for new agent tasks
        const job = await redis.blPop('agent_tasks', 5);
        
        if (job) {
          const taskData = JSON.parse(job.element);
          await this.processAgentTask(taskData);
        }
      } catch (error) {
        console.error('Error processing job:', error);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  async processAgentTask(taskData) {
    console.log('Processing agent task:', taskData.id);
    
    try {
      // Simulate AI agent processing
      const result = await this.executeAgent(taskData);
      
      // Store result in database
      await prisma.message.create({
        data: {
          content: result.response,
          role: 'assistant',
          conversationId: taskData.conversationId
        }
      });

      // Notify completion via Redis
      await redis.publish('agent_completed', JSON.stringify({
        taskId: taskData.id,
        result: result
      }));

      console.log('✅ Task completed:', taskData.id);
    } catch (error) {
      console.error('❌ Task failed:', taskData.id, error);
      
      // Handle error
      await redis.publish('agent_failed', JSON.stringify({
        taskId: taskData.id,
        error: error.message
      }));
    }
  }

  async executeAgent(taskData) {
    // Placeholder for actual AI agent execution
    // This would integrate with OpenAI, Anthropic, etc.
    return {
      response: `AI Agent response for: ${taskData.prompt}`,
      timestamp: new Date().toISOString()
    };
  }

  startHealthCheck() {
    const http = require('http');
    
    const server = http.createServer((req, res) => {
      if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          status: 'healthy', 
          timestamp: new Date().toISOString(),
          uptime: process.uptime()
        }));
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });

    server.listen(8080, () => {
      console.log('🏥 Health check server running on port 8080');
    });
  }

  async stop() {
    this.isRunning = false;
    await redis.disconnect();
    await prisma.$disconnect();
    console.log('🛑 AI Agents Worker stopped');
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully');
  await worker.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully');
  await worker.stop();
  process.exit(0);
});

// Start the worker
const worker = new AIAgentsWorker();
worker.start().catch(console.error);
