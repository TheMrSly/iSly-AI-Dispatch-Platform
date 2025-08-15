# iSly - AI-Powered Dispatch Platform

## Overview

iSly is a comprehensive AI agent platform designed specifically for flatbed trucking dispatch operations. Built with modern web technologies and powered by intelligent AI agents, iSly automates and optimizes critical dispatch workflows including load matching, route optimization, fuel management, compliance monitoring, and customer communication.

## 🚀 Features

### Core Platform Capabilities
- **AI Agent Dashboard** - Central hub for managing multiple AI agents
- **Load Management System** - Track loads, assign drivers, monitor delivery status
- **Driver Management** - Driver profiles, availability tracking, performance metrics
- **Fleet Analytics** - Real-time P&L tracking, fuel cost analysis, route efficiency
- **Communication Hub** - Automated customer updates, driver notifications
- **Compliance Monitoring** - HOS tracking, permit management, regulatory compliance

### AI Agents
1. **Load Matching Agent** - Automatically matches available loads with suitable drivers
2. **Route Optimization Agent** - Optimizes routes for fuel efficiency and delivery time
3. **Fuel Optimization Agent** - Finds best fuel prices and optimal fueling locations
4. **Compliance Agent** - Monitors HOS compliance and regulatory requirements
5. **Customer Communication Agent** - Sends automated updates to customers

## 🛠 Technology Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Prisma ORM, PostgreSQL
- **AI Agents**: Custom TypeScript agents with automated scheduling
- **UI Components**: Custom components with Heroicons
- **Database**: PostgreSQL with comprehensive trucking data models

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone and Setup
```bash
cd /home/ubuntu/isly
```

### 2. Install Dependencies
```bash
cd web
npm install
```

### 3. Database Setup
The database is already configured and seeded with sample data:
- **Database**: `isly`
- **User**: `isly_user`
- **Password**: `isly_password`
- **Host**: `localhost:5432`

### 4. Environment Configuration
Environment files are already configured:
- `web/.env` - NextJS application configuration
- `packages/agents/.env` - AI agents configuration

### 5. Start the Application

The application is already running:
- **Web Application**: http://localhost:3000
- **AI Agents**: Running in background with automated scheduling

## 📊 Sample Data

The platform comes pre-loaded with realistic trucking data:

### Users
- **Admin**: admin@isly.ai
- **Dispatcher**: dispatcher@isly.ai (John Dispatcher)
- **Manager**: manager@isly.ai (Sarah Manager)

### Fleet
- **3 Trucks**: Peterbilt 579, Kenworth T680, Freightliner Cascadia
- **3 Drivers**: Mike Johnson, Carlos Rodriguez, Jennifer Smith
- **3 Loads**: Various flatbed loads with different statuses

### AI Agents
- **5 Active Agents** with realistic performance metrics
- **Automated scheduling** with different intervals per agent type
- **Real-time notifications** and metric tracking

## 🤖 AI Agent System

### Agent Architecture
Each AI agent is built on a common `BaseAgent` class providing:
- Database connectivity via Prisma
- Notification system
- Metrics recording
- Error handling and status management

### Agent Scheduling
- **Load Matching**: Every 2 minutes
- **Route Optimization**: Every 5 minutes  
- **Fuel Optimization**: Every 10 minutes
- **Compliance Monitoring**: Every 15 minutes
- **Customer Communication**: Every 30 minutes

### Agent Capabilities

#### Load Matching Agent
- Matches available loads with suitable drivers
- Considers location proximity, driver ratings, truck capacity
- Updates load and driver statuses automatically
- Generates assignment notifications

#### Route Optimization Agent
- Analyzes active loads for route improvements
- Calculates fuel savings and distance reductions
- Updates load records with optimized routes
- Reports significant savings to dispatchers

#### Fuel Optimization Agent
- Monitors driver fuel levels (simulated)
- Finds best fuel prices along routes
- Generates fuel stop recommendations
- Tracks potential cost savings

#### Compliance Agent
- Monitors Hours of Service (HOS) compliance
- Checks for license and permit expirations
- Generates violation alerts and warnings
- Tracks compliance metrics

#### Customer Communication Agent
- Sends automated load status updates
- Generates delivery confirmations
- Provides ETA notifications
- Maintains communication logs

## 🎯 Key Performance Indicators

The platform tracks essential KPIs:
- **Average Revenue Per Mile**: $2.85
- **Fleet Utilization Rate**: 87.5%
- **On-Time Delivery Rate**: 94.2%
- **Average Fuel Cost Per Mile**: $0.68
- **Driver Satisfaction Score**: 4.6/5

## 📱 User Interface

### Dashboard
- Real-time statistics and KPIs
- AI agent status monitoring
- Recent loads and notifications
- Performance metrics visualization

### Load Management
- Load listing with filtering
- Detailed load information
- Assignment and tracking capabilities
- Route and delivery management

### Driver Management
- Driver profiles and performance
- HOS compliance monitoring
- Contact information and availability
- Truck assignments

### AI Agent Management
- Agent status and performance
- Configuration and control
- Metrics and activity logs
- Enable/disable functionality

## 🔧 API Endpoints

### Core APIs
- `GET /api/dashboard` - Dashboard summary data
- `GET /api/loads` - Load management
- `GET /api/drivers` - Driver information
- `GET /api/agents` - AI agent status
- `GET /api/kpis` - Key performance indicators
- `GET /api/notifications` - System notifications

### Features
- RESTful API design
- Pagination support
- Filtering and search
- Real-time data updates

## 🔒 Security & Compliance

### Data Protection
- Environment variable configuration
- Database connection security
- Input validation and sanitization

### Trucking Compliance
- DOT regulation monitoring
- HOS compliance tracking
- License and permit management
- Safety requirement alerts

## 🚀 Production Deployment

### Environment Setup
1. Configure production database
2. Set environment variables
3. Build and deploy Next.js application
4. Setup AI agent scheduling service
5. Configure monitoring and logging

### Scaling Considerations
- Database connection pooling
- Agent load balancing
- Caching strategies
- Real-time update optimization

## 📈 Future Enhancements

### Phase 2 Features
- Real-time GPS tracking integration
- Advanced route optimization with traffic data
- Machine learning for load matching
- Mobile driver application
- Customer self-service portal

### Integration Opportunities
- TMS system connections
- ELD device integration
- Fuel card APIs
- Load board integrations
- Payment processing systems

## 🤝 Support

For technical support or questions about the iSly platform:
- Review the codebase documentation
- Check API endpoint responses
- Monitor AI agent logs
- Analyze database schema

## 📄 License

This project is developed as a prototype for trucking dispatch operations. All code and documentation are provided for demonstration purposes.

---

**iSly Platform** - Intelligent dispatch management powered by AI agents
*Built with Next.js, PostgreSQL, and custom AI agent architecture*
