# Proyecto Transversal

A cloud-native visit management system for residential communities, designed to demonstrate production-ready AWS architecture patterns.

## Problem Statement

Residential communities in Mexico face significant friction when managing visitor access:

- **Imprecise addresses**: Residents often don't know exact addresses, only unit numbers ("House 15" or "Oak Street")
- **Manual coordination**: Guards must call residents to verify visitor information
- **No tracking**: No visibility into visitor history or validation times
- **Cognitive overhead**: Residents waste time coordinating visits via WhatsApp groups

Current solutions rely on manual processes, phone calls, and paper logs, creating delays and security gaps.

## Project Objective

This project demonstrates **production-ready cloud-native architecture** on AWS, with a focus on:

- **Learning goal**: Achieve fluency in core AWS services through hands-on implementation
- **Portfolio goal**: Showcase architectural decision-making and trade-off analysis
- **Product goal**: Solve a real problem with a minimal but complete solution

**Nature**: Hypothetical product designed for portfolio purposes, but built with production-grade patterns and best practices.

## Solution Overview

### Primary Flow (QR-based)

1. **Resident registers visit** → System generates unique access code and public URL
2. **Resident shares URL** via WhatsApp/Messenger with visitor
3. **Visitor opens URL** → Web page displays QR code + visit information
4. **Guard scans QR** → Validates visitor information (name, count, vehicle)
5. **Guard approves** → Resident receives push notification

### Alternative Flow (no QR/cellphone)

1. **Guard searches** by visitor name or unit number
2. **System searches** within ±90min window from current time
3. **Exact match required** to show critical resident data
4. **No match** → System protects privacy, shows minimal information
5. **Guard calls resident** directly to confirm

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Resident App │  │  Guard App   │  │ Visitor Web (S3+CF)  │  │
│  │ (React Ntv)  │  │ (React Ntv)  │  │   (HTML/JS/QR)       │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
└─────────┼──────────────────┼─────────────────────┼──────────────┘
          │                  │                     │
          └──────────────────┼─────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  API Gateway    │
                    │  (REST + CORS)  │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼──────┐ ┌────▼─────┐ ┌──────▼──────┐
     │  Auth Lambda  │ │ Business │ │  Public     │
     │  (Cognito)    │ │ Lambdas  │ │  Lambda     │
     └───────────────┘ └────┬─────┘ └──────┬──────┘
                            │              │
                   ┌────────┼────────┐     │
                   │        │        │     │
              ┌────▼──┐ ┌───▼──┐ ┌──▼─────▼──┐
              │Dynamo │ │ SQS  │ │   S3      │
              │  DB   │ │      │ │ (images)  │
              └───────┘ └──┬───┘ └───────────┘
                           │
                      ┌────▼────┐
                      │  SNS    │
                      │ (push)  │
                      └─────────┘

     ┌─────────────────────────────────────────┐
     │  EventBridge (scheduled)                │
     │  → Lambda (expiration)                  │
     │  → DynamoDB (update status)             │
     └─────────────────────────────────────────┘
```

## AWS Services

| Service | Purpose | Monthly Cost (est.) |
|---------|---------|-------------------|
| Cognito | Authentication | Free tier: 50K MAUs |
| API Gateway | API exposure | Free tier: 1M calls |
| Lambda | Business logic | Free tier: 1M requests |
| DynamoDB | Data storage | Free tier: 25GB + 25 WCU/RCU |
| S3 | Visitor web page | Free tier: 5GB |
| CloudFront | CDN | Free tier: 1TB transfer |
| SQS | Notification queue | Free tier: 1M messages |
| SNS | Push notifications | Free tier: 1M publishes |
| EventBridge | Code expiration | Free tier: 1M events |
| CloudWatch | Logs and metrics | Free tier: 5GB logs |
| CDK | Infrastructure as Code | Free (local tool) |

**Total estimated cost**: $0-5/month (within free tier for first 12 months)

### Service Justifications

#### 1. Amazon Cognito
**Purpose**: Authentication and authorization for residents, guards, and admins

**Why Cognito**:
- Managed service: no auth server maintenance
- Supports multiple user pools (residents vs guards)
- Native API Gateway integration (authorizer)
- Supports MFA, social login, and custom attributes
- Security compliance (SOC, ISO, GDPR)

**Alternatives considered**:
- **Auth0**: More features, but more expensive ($23/month for 7K MAUs)
- **Firebase Auth**: Simpler, but Google vendor lock-in
- **Self-hosted (Keycloak)**: More control, but significant ops overhead

**Trade-off**: Cognito has limited UI customization, but sufficient for MVP.

#### 2. API Gateway
**Purpose**: REST API exposure, CORS handling, rate limiting, and authorization

**Why API Gateway**:
- Native Lambda integration (zero-config)
- Automatic rate limiting (abuse protection)
- API keys support for public endpoints
- Auto-generates SDKs (iOS, Android, JS)
- Pay-per-use: only pay for actual calls

**Alternatives considered**:
- **Application Load Balancer + Lambda**: More control, but more expensive ($16-20/month + Lambda costs)
- **Express.js on EC2**: More flexibility, but ops overhead (servers, scaling, security patches)

**Trade-off**: API Gateway has 10MB payload limit, but sufficient for this use case.

#### 3. AWS Lambda
**Purpose**: Business logic (API resolvers, image processing, code expiration)

**Why Lambda**:
- Serverless: no server management
- Auto-scaling: scales from 0 to thousands of requests automatically
- Pay-per-use: only pay for execution time (125ms increments)
- Native integration with all AWS services
- Native TypeScript/Node.js support

**Alternatives considered**:
- **ECS/Fargate**: More control, but more expensive ($5-10/month per task) and ops overhead
- **EC2**: More flexibility, but significant ops overhead (scaling, security, patches)

**Trade-off**: Cold starts can be problematic for latency-sensitive apps, but acceptable for this use case.

**Optimization**: Use esbuild to minimize bundle size and reduce cold starts.

#### 4. Amazon DynamoDB
**Purpose**: Structured data storage (residents, visits, guards, validations)

**Why DynamoDB**:
- Serverless: no cluster management
- Auto-scaling: scales automatically based on traffic
- Single-digit millisecond latency at any scale
- Supports transactions (for atomic operations)
- Pay-per-use: only pay for actual reads/writes
- Native Lambda integration

**Alternatives considered**:
- **RDS/Aurora (PostgreSQL)**: More familiar, but not serverless (Aurora Serverless exists but more expensive)
- **MongoDB Atlas**: More schema flexibility, but more expensive and not native AWS

**Trade-off**: DynamoDB doesn't support complex joins, but perfect for key-based access patterns.

**Design pattern**: Use single-table design with GSI to optimize queries.

#### 5. Amazon S3
**Purpose**: Static website hosting for visitor web page (HTML/CSS/JS)

**Why S3**:
- Native static website hosting
- Extremely cheap ($0.023/GB/month)
- Native CloudFront integration
- 99.999999999% durability
- Supports versioning (for rollback)

**Alternatives considered**:
- **EC2 + Nginx**: More control, but ops overhead
- **Netlify/Vercel**: More features (preview deployments), but vendor lock-in

**Trade-off**: S3 doesn't support server-side rendering, but sufficient for this use case (CSR with API fetch).

#### 6. Amazon CloudFront
**Purpose**: CDN for visitor web page (global low latency)

**Why CloudFront**:
- Native S3 integration
- Edge location caching worldwide
- Automatic HTTPS support
- Pay-per-use: only pay for transfer
- Supports custom domains and SSL certificates

**Alternatives considered**:
- **Cloudflare**: More features (DDoS protection), but not native AWS
- **Fastly**: Faster, but more expensive

**Trade-off**: CloudFront has slow propagation (5-10min for invalidations), but acceptable for this use case.

#### 7. Amazon SQS
**Purpose**: Message queue for asynchronous notification processing

**Why SQS**:
- Component decoupling (Lambda doesn't block waiting for notifications)
- Automatic retry on failure
- Dead-letter queue for failed messages
- Pay-per-use: only pay for messages
- Native Lambda integration (event source mapping)

**Alternatives considered**:
- **RabbitMQ**: More features, but ops overhead (self-hosted) or more expensive (Amazon MQ)
- **Kafka**: More throughput, but overkill for this use case

**Trade-off**: SQS has 256KB message limit, but sufficient for notifications.

#### 8. Amazon SNS
**Purpose**: Push notifications to residents (visit validation alerts)

**Why SNS**:
- Native mobile push notification support (APNS, FCM)
- Native Lambda and SQS integration
- Pay-per-use: only pay for sent notifications
- Supports fan-out (send to multiple subscribers)

**Alternatives considered**:
- **Firebase Cloud Messaging**: Simpler, but Google vendor lock-in
- **OneSignal**: More features, but more expensive ($9/month for 1K subscribers)

**Trade-off**: SNS requires APNS/FCM credentials configuration, but transparent once configured.

#### 9. Amazon EventBridge
**Purpose**: Event scheduling for automatic code expiration

**Why EventBridge**:
- Serverless event bus
- Supports scheduled events (cron expressions)
- Native Lambda integration (trigger)
- Pay-per-use: only pay for events
- Replaces CloudWatch Events (more features)

**Alternatives considered**:
- **CloudWatch Events**: Legacy, fewer features
- **Cron job on EC2**: More control, but ops overhead
- **Step Functions**: More powerful, but overkill for simple scheduling

**Trade-off**: EventBridge has 5 rules per event source limit, but sufficient for this use case.

#### 10. Amazon CloudWatch
**Purpose**: Logs, metrics, and alarms

**Why CloudWatch**:
- Centralized logs from all Lambda functions
- Automatic metrics (invocations, errors, duration)
- Alarms for errors or high latency
- Native integration with all AWS services
- Pay-per-use: only pay for stored logs

**Alternatives considered**:
- **Datadog**: More features, but more expensive ($15/host/month)
- **ELK Stack**: More control, but significant ops overhead

**Trade-off**: CloudWatch Logs can be expensive if retention policy not configured, but acceptable for this use case.

#### 11. AWS CDK (Cloud Development Kit)
**Purpose**: Infrastructure as Code (IaC) in TypeScript

**Why CDK**:
- TypeScript: reuse existing skills (no need to learn HCL or YAML)
- Reusable constructs (L1, L2, L3)
- Type safety: catches errors at compile time
- Native integration with all AWS services
- Versionable (Git)

**Alternatives considered**:
- **Terraform**: More mature, but requires learning HCL
- **SAM**: Simpler, but YAML-based and less flexible
- **CloudFormation**: More control, but YAML/JSON is verbose

**Trade-off**: CDK is newer than Terraform, but best option for greenfield projects.

## Tech Stack

- **Backend**: TypeScript, NestJS
- **Infrastructure**: AWS CDK (TypeScript)
- **Database**: DynamoDB
- **Mobile**: React Native (Expo) - Phase 2
- **Web**: HTML/CSS/JS with qrcode.js

## Project Phases

### Phase 1: Cloud Native Backend (8 weeks)

**Weeks 1-2: Setup + Auth + Data Model**
- CDK, LocalStack, NestJS setup
- Cognito authentication (residents, guards)
- DynamoDB data model

**Weeks 3-4: Visit CRUD + Public URL**
- Register visit
- Generate unique visitId
- Public endpoint: `GET /public/visits/:code`
- Cancel visit

**Weeks 5-6: Visitor Web Page**
- Static page in S3
- CloudFront CDN
- Fetch to public API
- QR generation with `qrcode.js`
- Responsive design

**Week 7: Guard Validation + Alternative Search**
- Scan QR with guard app
- Validate information
- Approve/reject
- Alternative search (without QR)
- Exact match logic
- Sensitive data protection

**Week 8: Notifications + Expiration + Deploy**
- Push notifications to residents
- Automatic expiration (EventBridge)
- Deploy to AWS real
- CloudWatch
- Production testing

### Phase 2: Mobile Client

- React Native (Expo)
- Resident app (register visits, view alerts)
- Guard app (scan QR, validate, search)
- Cognito authentication
- Push notifications

## Current Status

🚧 **In design phase** - Architecture and specifications in progress

## Documentation

- [Technical Specifications](docs/SPECIFICATIONS.md)
- [Architecture Decision Records](docs/adr/) - Coming soon

## License

This project is for educational and portfolio purposes.
