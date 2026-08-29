import { AwsDomain, AwsService, ServiceMeta, QuizQuestion, Flashcard, UserProgressState } from '../types';

export const AWS_DOMAINS: Record<AwsDomain, { name: string; description: string; color: string; bgGradient: string; services: AwsService[] }> = {
  compute: {
    name: 'Compute',
    description: 'EC2 virtual servers, Lambda serverless functions, and ECS container orchestration',
    color: '#F97316', // Orange
    bgGradient: 'from-orange-500/20 to-amber-500/10',
    services: ['EC2', 'Lambda', 'ECS'],
  },
  storage: {
    name: 'Storage',
    description: 'S3 scalable object storage, EBS block storage volumes, and EFS network file systems',
    color: '#3B82F6', // Blue
    bgGradient: 'from-blue-500/20 to-cyan-500/10',
    services: ['S3', 'EBS', 'EFS'],
  },
  networking: {
    name: 'Networking & Content Delivery',
    description: 'VPC isolated cloud networks, Route 53 DNS routing, and CloudFront global CDN',
    color: '#8B5CF6', // Purple
    bgGradient: 'from-purple-500/20 to-indigo-500/10',
    services: ['VPC', 'Route 53', 'CloudFront'],
  },
  database: {
    name: 'Database',
    description: 'RDS relational managed databases and DynamoDB ultra-low latency NoSQL key-value store',
    color: '#10B981', // Emerald
    bgGradient: 'from-emerald-500/20 to-teal-500/10',
    services: ['RDS', 'DynamoDB'],
  },
  security: {
    name: 'Security, Identity & Compliance',
    description: 'IAM fine-grained access control, policies, and KMS cryptographic key management',
    color: '#EF4444', // Red
    bgGradient: 'from-red-500/20 to-rose-500/10',
    services: ['IAM', 'KMS'],
  },
  management: {
    name: 'Management & Governance',
    description: 'CloudWatch performance metrics and alarms, and CloudTrail user and API activity auditing',
    color: '#EC4899', // Pink
    bgGradient: 'from-pink-500/20 to-fuchsia-500/10',
    services: ['CloudWatch', 'CloudTrail'],
  },
};

export const AWS_SERVICES_META: Record<AwsService, ServiceMeta> = {
  EC2: {
    id: 'EC2',
    name: 'Elastic Compute Cloud',
    domain: 'compute',
    tagline: 'Resizable compute capacity in the cloud',
    iconName: 'Server',
    color: '#F97316',
    description: 'Provides scalable computing capacity using virtual servers (instances). Supports On-Demand, Spot, Reserved, and Savings Plans pricing models.',
    examWeightPct: 12,
    coreConcepts: [
      'Instance types (Compute, Memory, Storage, General Purpose, Accelerated)',
      'Pricing: On-Demand, Reserved (1-3yr commitment), Spot (up to 90% discount, interruptible), Dedicated Hosts',
      'Auto Scaling Groups (ASG) & Target Tracking scaling policies',
      'Security Groups (Stateful) vs Network ACLs (Stateless)',
      'EC2 User Data scripts for automated bootstrap configuration'
    ],
    commonGotchas: [
      'Spot instances can be reclaimed with a 2-minute warning notice',
      'Instance Store volumes are ephemeral and lose data on instance stop/termination; EBS persists',
      'Security Group rules cannot block specific IP addresses (use NACLs for explicit DENY)'
    ],
    keyTradeoffs: [
      'Spot vs On-Demand: 90% cost savings vs potential 2-minute interruption',
      'Instance Store vs EBS: Extreme IOPS & zero network latency vs ephemeral data loss'
    ]
  },
  Lambda: {
    id: 'Lambda',
    name: 'AWS Lambda',
    domain: 'compute',
    tagline: 'Serverless event-driven compute execution',
    iconName: 'Zap',
    color: '#F97316',
    description: 'Runs code without provisioning or managing servers. Scales automatically from zero to thousands of concurrent requests. Pay only for compute time consumed.',
    examWeightPct: 10,
    coreConcepts: [
      '15-minute maximum execution timeout per invocation',
      'Memory allocated from 128 MB to 10,240 MB (vCPU scales proportionally with memory)',
      'Ephemeral storage (/tmp) from 512 MB to 10 GB',
      'Cold starts vs Provisioned Concurrency for instant zero-latency invocation',
      'Event source mappings (Kinesis, DynamoDB Streams, SQS) vs synchronous triggers (API Gateway)'
    ],
    commonGotchas: [
      'Lambda is stateless; never store persistent session data in memory or /tmp between executions',
      'Connecting Lambda to a VPC requires an ENI (Elastic Network Interface) and can add cold start time',
      'Max payload size: 6 MB for synchronous invocations, 256 KB for asynchronous invocations'
    ],
    keyTradeoffs: [
      'Lambda vs EC2: Zero idle cost & automatic auto-scaling vs 15-minute hard timeout limit'
    ]
  },
  ECS: {
    id: 'ECS',
    name: 'Elastic Container Service',
    domain: 'compute',
    tagline: 'Scalable container management and orchestration',
    iconName: 'Boxes',
    color: '#F97316',
    description: 'Highly scalable container orchestration service for Docker containers. Runs on AWS Fargate (serverless) or EC2 instances (full infrastructure control).',
    examWeightPct: 8,
    coreConcepts: [
      'Launch Types: Fargate (Serverless, pay per vCPU/RAM, zero server management) vs EC2 (control instance types, GPU, OS)',
      'Task Definitions (JSON blueprint: container image, CPU/memory, environment variables, IAM task role)',
      'ECS Services (maintains desired number of running task copies, integrates with ALB)',
      'Task Role (permissions for the container application) vs Task Execution Role (permissions for ECS agent to pull image from ECR, push CloudWatch logs)'
    ],
    commonGotchas: [
      'Confusing Task Execution Role with Task Role (Task Execution Role pulls ECR/writes logs; Task Role is what the container app uses to access S3/DynamoDB)',
      'Fargate tasks cannot attach EBS volumes directly; use Amazon EFS for shared persistent storage'
    ],
    keyTradeoffs: [
      'Fargate vs EC2 Launch Type: Zero OS patching & maintenance vs capacity reservation & custom daemon control'
    ]
  },
  S3: {
    id: 'S3',
    name: 'Simple Storage Service',
    domain: 'storage',
    tagline: 'Industry-leading object storage built for 99.999999999% durability',
    iconName: 'HardDrive',
    color: '#3B82F6',
    description: 'Scalable, high-speed, web-based cloud storage designed for online backup and archiving of data and application programs. Organizes data into buckets and objects.',
    examWeightPct: 14,
    coreConcepts: [
      'Storage Classes: S3 Standard, S3 Intelligent-Tiering, Standard-IA, One Zone-IA, Glacier Instant/Flexible/Deep Archive',
      'Durability: 11 9s (99.999999999%) across all classes except One Zone-IA',
      'Lifecycle Policies (transition objects automatically between storage tiers and expire after X days)',
      'Bucket Policies vs IAM Policies vs Access Control Lists (ACLs)',
      'S3 Versioning, MFA Delete, S3 Object Lock (WORM compliance), and Cross-Region Replication (CRR)'
    ],
    commonGotchas: [
      'Bucket names must be globally unique across all AWS accounts worldwide',
      'Deleting an object with versioning enabled adds a Delete Marker (does not permanently delete unless specified with version ID)',
      'S3 Glacier Deep Archive retrieval takes 12 to 48 hours (lowest cost storage in AWS)'
    ],
    keyTradeoffs: [
      'S3 Intelligent-Tiering: Small automation monitoring fee per object vs guaranteed automatic savings on unpredictable access patterns'
    ]
  },
  EBS: {
    id: 'EBS',
    name: 'Elastic Block Store',
    domain: 'storage',
    tagline: 'Persistent block storage volumes for Amazon EC2',
    iconName: 'DatabaseZap',
    color: '#3B82F6',
    description: 'Provides high-performance block-level storage volumes for use with Amazon EC2 instances. Formatted with a file system like a raw hard disk.',
    examWeightPct: 9,
    coreConcepts: [
      'Volume Types: General Purpose SSD (gp3/gp2), Provisioned IOPS SSD (io2/io1 for sub-millisecond databases), Throughput Optimized HDD (st1 for big data/logs), Cold HDD (sc1)',
      'EBS volumes are bound to a single Availability Zone (AZ)',
      'Snapshots are point-in-time incremental backups stored in Amazon S3',
      'Multi-Attach allows an io1/io2 volume to attach concurrently to up to 16 Nitro EC2 instances in the same AZ'
    ],
    commonGotchas: [
      'An EBS volume can only attach to an EC2 instance in the EXACT same Availability Zone',
      'To move an EBS volume to another AZ or Region: create a snapshot, copy snapshot to target region, create volume from snapshot'
    ],
    keyTradeoffs: [
      'gp3 vs io2: Baseline 3,000 IOPS included at low cost vs provisioned up to 64,000 IOPS for mission-critical relational DBs'
    ]
  },
  EFS: {
    id: 'EFS',
    name: 'Elastic File System',
    domain: 'storage',
    tagline: 'Serverless, fully elastic network file system (NFSv4)',
    iconName: 'FolderNetwork',
    color: '#3B82F6',
    description: 'Managed NFS file system that automatically grows and shrinks as you add and remove files. Can be mounted concurrently by thousands of EC2 instances and Lambda functions across multiple AZs.',
    examWeightPct: 7,
    coreConcepts: [
      'POSIX-compliant shared network file system (NFSv4.1 / NFSv4.0)',
      'Regional storage class stores data across multiple AZs; One Zone stores in a single AZ',
      'Supports concurrent access from hundreds of EC2 instances, ECS containers, and Lambda functions',
      'EFS Infrequent Access (EFS IA) and Lifecycle Management to reduce cost by up to 92%'
    ],
    commonGotchas: [
      'EFS is for Linux-based workloads only; for Windows native file shares, use Amazon FSx for Windows File Server',
      'EFS costs more per GB than EBS, but enables multi-instance shared read/write across AZs'
    ],
    keyTradeoffs: [
      'EFS vs EBS: Multi-AZ concurrent shared read/write vs single-AZ raw disk performance and lower baseline cost'
    ]
  },
  VPC: {
    id: 'VPC',
    name: 'Virtual Private Cloud',
    domain: 'networking',
    tagline: 'Isolated virtual network dedicated to your AWS account',
    iconName: 'Network',
    color: '#8B5CF6',
    description: 'Gives you complete control over your virtual networking environment, including selection of IP address range, subnets, route tables, network gateways, and security controls.',
    examWeightPct: 14,
    coreConcepts: [
      'CIDR block allocation (/16 to /28) & 5 reserved IP addresses per subnet (.0, .1, .2, .3, .255)',
      'Public Subnet (route to Internet Gateway) vs Private Subnet (route to NAT Gateway for outbound-only internet)',
      'Security Groups (Stateful, instance-level, ALLOW rules only) vs Network ACLs (Stateless, subnet-level, numbered rules, ALLOW & DENY)',
      'VPC Peering (non-transitive connection between 2 VPCs) vs Transit Gateway (hub-and-spoke star architecture)',
      'VPC Endpoints: Gateway Endpoints (S3, DynamoDB - Free) vs Interface Endpoints (PrivateLink, ENI, hourly cost)'
    ],
    commonGotchas: [
      'Security groups are stateful (inbound traffic automatically allows response outbound). NACLs are stateless (must explicitly configure return outbound rule)',
      'VPC Peering is NOT transitive (If VPC A peers with B, and B peers with C, A CANNOT reach C without direct peer)',
      'NAT Gateway must be deployed in a PUBLIC subnet with an Elastic IP to function'
    ],
    keyTradeoffs: [
      'Gateway VPC Endpoint vs Interface Endpoint: Free of charge for S3/DynamoDB vs PrivateLink connectivity across on-premises/direct connect'
    ]
  },
  'Route 53': {
    id: 'Route 53',
    name: 'Amazon Route 53',
    domain: 'networking',
    tagline: 'Highly available and scalable cloud Domain Name System (DNS)',
    iconName: 'Globe',
    color: '#8B5CF6',
    description: 'Scalable DNS and Domain Name Registration service designed to route end-user requests to AWS infrastructure like EC2, ALBs, S3 buckets, or external endpoints.',
    examWeightPct: 8,
    coreConcepts: [
      'Routing Policies: Simple, Weighted, Latency-based, Failover (Active-Passive), Geolocation (user location), Geoproximity (bias radius), Multi-Value Answer',
      'Alias Records (free, AWS-specific pointer to CloudFront/ALB/S3, updates automatically if AWS IP changes) vs CNAME (standard DNS record)',
      'Route 53 Health Checks (monitors endpoint health and triggers DNS failover or CloudWatch alarms)'
    ],
    commonGotchas: [
      'CNAME cannot be used for the Zone Apex / Root domain (e.g. example.com); you MUST use an Alias Record',
      'Geolocation routing routes based on the geographical location of the user/resolver, while Latency routing routes to the AWS region with lowest network latency'
    ],
    keyTradeoffs: [
      'Failover Routing vs Weighted Routing: Active-Passive Disaster Recovery vs Active-Active blue/green traffic splitting'
    ]
  },
  CloudFront: {
    id: 'CloudFront',
    name: 'Amazon CloudFront',
    domain: 'networking',
    tagline: 'Fast, secure Content Delivery Network (CDN)',
    iconName: 'Radio',
    color: '#8B5CF6',
    description: 'Global content delivery network (CDN) service that securely delivers data, videos, applications, and APIs to customers globally with low latency and high transfer speeds via Edge Locations.',
    examWeightPct: 9,
    coreConcepts: [
      'Edge Locations (cache content closer to viewers) & Regional Edge Caches',
      'Origins: S3 Bucket, Application Load Balancer, EC2 instance, or Custom HTTP server',
      'Origin Access Control (OAC) / Origin Access Identity (OAI) to restrict direct S3 bucket access so users must go through CloudFront',
      'Signed URLs & Signed Cookies for protecting premium or private media content',
      'AWS Shield Standard included automatically for L3/L4 DDoS mitigation at the edge'
    ],
    commonGotchas: [
      'To force CloudFront to fetch fresh content before TTL expires, issue a CloudFront Cache Invalidation (e.g. /*)',
      'CloudFront supports SSL/TLS via AWS Certificate Manager (ACM), but ACM certificates for CloudFront MUST be created in us-east-1 (N. Virginia)'
    ],
    keyTradeoffs: [
      'S3 Static Website vs CloudFront + S3: Single region latency vs global caching, HTTPS custom domains, and DDoS protection'
    ]
  },
  RDS: {
    id: 'RDS',
    name: 'Relational Database Service',
    domain: 'database',
    tagline: 'Managed relational database engine for MySQL, Postgres, MariaDB, Oracle, SQL Server, and Aurora',
    iconName: 'Database',
    color: '#10B981',
    description: 'Set up, operate, and scale relational databases in the cloud with automated backups, software patching, automatic failure detection, and recovery.',
    examWeightPct: 11,
    coreConcepts: [
      'Multi-AZ Deployment: Synchronous replication to standby replica in another AZ for High Availability & Disaster Recovery (automatic failover, no read scaling)',
      'Read Replicas: Asynchronous replication for read scalability (up to 15 Aurora replicas, 5 MySQL/PG replicas). Can be promoted to standalone DB',
      'Automated Backups (1 to 35 day retention, point-in-time recovery) vs Manual DB Snapshots (retained until explicitly deleted)',
      'Amazon Aurora: Cloud-native database, 5x throughput of standard MySQL, 3x PostgreSQL, storage auto-scales up to 128 TB, 6 copies across 3 AZs'
    ],
    commonGotchas: [
      'Multi-AZ is for High Availability / Disaster Recovery, NOT for read scaling (the standby cannot be queried)',
      'Read Replicas are for Read Scaling, NOT automatic failover (unless manually promoted or Aurora auto-failover is used)'
    ],
    keyTradeoffs: [
      'Multi-AZ Standby vs Read Replica: Synchronous zero-data-loss failover vs asynchronous offloading of heavy read reporting queries'
    ]
  },
  DynamoDB: {
    id: 'DynamoDB',
    name: 'Amazon DynamoDB',
    domain: 'database',
    tagline: 'Fast, flexible NoSQL database service for single-digit millisecond performance',
    iconName: 'Layers',
    color: '#10B981',
    description: 'Serverless, key-value and document NoSQL database designed for internet-scale applications with built-in security, continuous backups, automated multi-region replication, and in-memory caching.',
    examWeightPct: 10,
    coreConcepts: [
      'Primary Keys: Partition Key (Hash) alone or Composite (Partition Key + Sort Key)',
      'Capacity Modes: On-Demand (pay per request, handles unpredictable spikes) vs Provisioned (specify RCU/WCU with auto-scaling)',
      'DynamoDB Accelerator (DAX): In-memory hardware cache providing microsecond response times for read-heavy workloads',
      'DynamoDB Streams: Captures time-ordered item modifications (triggers Lambda functions for event-driven workflows)',
      'Global Tables: Multi-Region, fully replicated active-active database'
    ],
    commonGotchas: [
      'Query operation is fast and efficient (requires Partition Key). Scan operation scans the entire table and consumes huge RCUs',
      'Eventually Consistent Reads (default, consumes 0.5 RCU per 4KB) vs Strongly Consistent Reads (consumes 1 RCU per 4KB)'
    ],
    keyTradeoffs: [
      'DAX vs ElastiCache: Seamless drop-in SDK caching for DynamoDB queries vs general multi-database Redis/Memcached cache'
    ]
  },
  IAM: {
    id: 'IAM',
    name: 'Identity & Access Management',
    domain: 'security',
    tagline: 'Securely manage access to AWS services and resources',
    iconName: 'ShieldCheck',
    color: '#EF4444',
    description: 'Enables you to manage access to AWS services and resources securely. Create and manage AWS users, groups, roles, and permissions using JSON policy documents.',
    examWeightPct: 15,
    coreConcepts: [
      'Principle of Least Privilege (grant only required actions on specific ARNs)',
      'IAM Entities: Users (humans/applications), Groups (collections of users), Roles (assumed by EC2, Lambda, or federated identities)',
      'Policy Evaluation Logic: Explicit DENY always overrides any explicit ALLOW; default is implicit DENY',
      'IAM Roles vs IAM Users: Never embed long-term access keys in EC2 or Lambda code; use IAM Roles with temporary credentials via STS',
      'Multi-Factor Authentication (MFA), Root Account protection, Credential Reports, IAM Access Analyzer'
    ],
    commonGotchas: [
      'Never use the Root user for daily administrative tasks; create an IAM Admin user with MFA enabled',
      'IAM is a Global service (users, groups, and policies are synchronized across all AWS regions automatically)'
    ],
    keyTradeoffs: [
      'IAM Role with Instance Profile vs Storing AWS_ACCESS_KEY_ID in config: Automatic secure credential rotation vs high security risk'
    ]
  },
  KMS: {
    id: 'KMS',
    name: 'Key Management Service',
    domain: 'security',
    tagline: 'Managed creation and control of cryptographic encryption keys',
    iconName: 'Key',
    color: '#EF4444',
    description: 'Managed service that makes it easy for you to create and control cryptographic keys used to encrypt data across AWS services like S3, EBS, RDS, and DynamoDB.',
    examWeightPct: 8,
    coreConcepts: [
      'Customer Master Keys (KMS Keys): AWS Owned (free), AWS Managed (e.g. aws/s3), Customer Managed Keys (CMK - full rotation & policy control)',
      'Envelope Encryption: KMS protects Data Keys (plaintext & encrypted data key), which encrypt the actual data payload',
      'Key Policies (the primary way to control access to KMS keys; IAM policies alone cannot grant access without key policy delegation)',
      'Automatic annual key rotation for Customer Managed Keys',
      'KMS is Region-bound (keys created in us-east-1 cannot be used directly in eu-west-1 unless using multi-region keys)'
    ],
    commonGotchas: [
      'KMS API calls generate CloudTrail audit logs for every single encryption and decryption event',
      'If the KMS key policy does not allow root account access, the key can become permanently unmanageable'
    ],
    keyTradeoffs: [
      'Customer Managed Key (CMK) vs AWS Managed Key: Granular audit trails and rotation control ($1/month/key) vs zero key management overhead'
    ]
  },
  CloudWatch: {
    id: 'CloudWatch',
    name: 'Amazon CloudWatch',
    domain: 'management',
    tagline: 'Observability and monitoring for AWS cloud resources and applications',
    iconName: 'Activity',
    color: '#EC4899',
    description: 'Monitoring and observability service built for DevOps engineers, developers, site reliability engineers (SREs), and IT managers to collect metrics, logs, and alarms.',
    examWeightPct: 10,
    coreConcepts: [
      'CloudWatch Metrics: Standard monitoring (5-minute intervals) vs Detailed monitoring (1-minute intervals for EC2)',
      'Custom Metrics: Memory utilization, disk space utilization, and swap space require the CloudWatch Unified Agent (EC2 hypervisor does not see OS internal memory)',
      'CloudWatch Alarms: OK, ALARM, INSUFFICIENT_DATA states (can trigger EC2 auto-scaling, SNS notifications, or EC2 instance recovery)',
      'CloudWatch Logs & Logs Insights (query logs using SQL-like syntax)'
    ],
    commonGotchas: [
      'By default, EC2 metrics in CloudWatch include CPU, Network, Disk I/O, but NOT Memory/RAM (RAM requires the CloudWatch Agent)',
      'CloudWatch is about PERFORMANCE and METRICS; CloudTrail is about WHO DID WHAT (API calls & audit trail)'
    ],
    keyTradeoffs: [
      'Detailed Monitoring vs Basic: 1-minute granularity for rapid auto-scaling vs additional metric cost'
    ]
  },
  CloudTrail: {
    id: 'CloudTrail',
    name: 'AWS CloudTrail',
    domain: 'management',
    tagline: 'Track user activity and API usage for governance and compliance',
    iconName: 'FileSearch',
    color: '#EC4899',
    description: 'Enables auditing, security monitoring, and operational troubleshooting by recording user activity and API calls across your entire AWS account.',
    examWeightPct: 9,
    coreConcepts: [
      'Records WHO made WHICH API request, WHEN, from WHAT IP address, and to WHICH AWS resource',
      'Management Events (control plane operations: creating S3 bucket, launching EC2) vs Data Events (data plane: S3 GetObject, Lambda invoke - high volume)',
      'CloudTrail Trails: Multi-Region Trail (records all events across all regions) delivered to an encrypted S3 bucket and CloudWatch Logs',
      'Log File Integrity Validation using SHA-256 and digital signatures to detect tampering',
      'CloudTrail Insights: Detects anomalous API call spikes and unusual operational spikes'
    ],
    commonGotchas: [
      'Event History in CloudTrail console stores only the past 90 days of management events. To retain logs longer, configure a Trail to S3',
      'CloudTrail is for AUDITING/GOVERNANCE ("Who deleted the database?"), CloudWatch is for MONITORING/PERFORMANCE ("Why is CPU at 95%?")'
    ],
    keyTradeoffs: [
      'CloudTrail Data Events vs Management Events: Granular S3 object-level auditing vs higher ingestion cost for high-throughput buckets'
    ]
  }
};

export const INITIAL_QUIZ_QUESTIONS: QuizQuestion[] = [
  // COMPUTE (EC2, Lambda, ECS)
  {
    id: 'q-ec2-1',
    domain: 'compute',
    service: 'EC2',
    difficulty: 'Associate',
    scenario: 'A company needs to host a stateless batch processing workload that can tolerate interruptions and runs overnight for 4 hours. Which EC2 pricing model delivers the highest cost optimization?',
    options: [
      { id: 'A', text: 'On-Demand Instances' },
      { id: 'B', text: 'Spot Instances' },
      { id: 'C', text: 'Reserved Instances with a 3-year term' },
      { id: 'D', text: 'Dedicated Hosts' }
    ],
    correctOptionId: 'B',
    explanation: 'Spot Instances allow you to utilize spare Amazon EC2 capacity at steep discounts (up to 90% off On-Demand rates). Because the workload is stateless and interruption-tolerant, Spot is the optimal choice.',
    architectureTip: 'Combine EC2 Spot Fleets with Auto Scaling Groups using multiple instance types to maximize Spot availability.',
    whyWrong: {
      'A': 'On-Demand is significantly more expensive and intended for unpredictable continuous workloads without long-term commitment.',
      'C': 'Reserved Instances require a 1 or 3-year steady-state commitment, which is wasteful for an occasional 4-hour batch job.',
      'D': 'Dedicated Hosts are the most expensive option, reserved for strict compliance or BYOL (Bring Your Own License) requirements.'
    },
    tags: ['EC2', 'Cost Optimization', 'Spot Instances']
  },
  {
    id: 'q-lambda-1',
    domain: 'compute',
    service: 'Lambda',
    difficulty: 'Associate',
    scenario: 'A developer is designing a serverless image thumbnail generator. High-resolution images are uploaded to an S3 bucket, triggering an AWS Lambda function. The image processing takes up to 18 minutes for 4K video frames. What architectural issue will occur?',
    options: [
      { id: 'A', text: 'S3 cannot send asynchronous trigger notifications to AWS Lambda.' },
      { id: 'B', text: 'Lambda functions have a hard execution timeout limit of 15 minutes and will terminate before completion.' },
      { id: 'C', text: 'Lambda does not support memory allocation exceeding 3 GB.' },
      { id: 'D', text: 'Lambda functions cannot read binary image files from Amazon S3.' }
    ],
    correctOptionId: 'B',
    explanation: 'AWS Lambda has a maximum execution timeout of 15 minutes (900 seconds). Any task requiring longer continuous execution must be broken into smaller tasks, orchestrated with AWS Step Functions, or run on AWS ECS / AWS Batch.',
    architectureTip: 'For long-running compute jobs (>15 minutes), migrate containerized tasks to AWS Fargate or AWS Batch rather than extending Lambda beyond its boundaries.',
    whyWrong: {
      'A': 'S3 bucket event notifications natively integrate with AWS Lambda triggers.',
      'C': 'Lambda supports memory allocations up to 10,240 MB (10 GB), scaling vCPU proportionally.',
      'D': 'Lambda runtime environments can easily fetch binary payloads from S3 using the AWS SDK.'
    },
    tags: ['Lambda', 'Limits', 'Serverless']
  },
  {
    id: 'q-ecs-1',
    domain: 'compute',
    service: 'ECS',
    difficulty: 'Associate',
    scenario: 'A DevOps engineer wants to deploy Docker containers onto Amazon ECS without managing the underlying EC2 instances, cluster capacity, or OS security patches. Which launch type must they select?',
    options: [
      { id: 'A', text: 'Amazon EC2 Launch Type' },
      { id: 'B', text: 'AWS Fargate Launch Type' },
      { id: 'C', text: 'AWS Lambda Container Image' },
      { id: 'D', text: 'Amazon Lightsail Container Service' }
    ],
    correctOptionId: 'B',
    explanation: 'AWS Fargate is the serverless compute engine for Amazon ECS. It allows you to run containers without provisioning, configuring, or scaling virtual machine clusters.',
    architectureTip: 'With Fargate, use ECS Task Roles to grant containerized microservices least-privilege IAM permissions to other AWS services.',
    whyWrong: {
      'A': 'The EC2 Launch Type requires you to manage, patch, and monitor the EC2 host instances in your cluster.',
      'C': 'Lambda supports containers, but has a 15-minute invocation ceiling and is not the ECS launch type requested.',
      'D': 'Lightsail is a simplified VPS offering, not an Amazon ECS launch type.'
    },
    tags: ['ECS', 'Fargate', 'Containers']
  },

  // STORAGE (S3, EBS, EFS)
  {
    id: 'q-s3-1',
    domain: 'storage',
    service: 'S3',
    difficulty: 'Associate',
    scenario: 'An enterprise must archive compliance financial records for 7 years. The records are rarely accessed (once every 2-3 years) and retrieval times of 12 hours are completely acceptable. Which S3 storage class provides the absolute lowest storage cost?',
    options: [
      { id: 'A', text: 'S3 Standard-Infrequent Access (Standard-IA)' },
      { id: 'B', text: 'S3 Glacier Flexible Retrieval' },
      { id: 'C', text: 'S3 Glacier Deep Archive' },
      { id: 'D', text: 'S3 One Zone-Infrequent Access (One Zone-IA)' }
    ],
    correctOptionId: 'C',
    explanation: 'S3 Glacier Deep Archive is the lowest-cost storage tier in AWS (around $0.00099 per GB/month). It is engineered for long-term data retention with retrieval times between 12 and 48 hours.',
    architectureTip: 'Use S3 Lifecycle Policies to automatically transition objects from S3 Standard to S3 Glacier Deep Archive after 90 days.',
    whyWrong: {
      'A': 'Standard-IA is designed for data accessed once or twice a month with rapid milliseconds retrieval and costs ~10x more than Glacier Deep Archive.',
      'B': 'Glacier Flexible Retrieval costs more than Deep Archive and retrieves in 3-5 hours.',
      'D': 'One Zone-IA stores data in a single AZ (lacks multi-AZ resilience) and has higher monthly storage costs than Glacier Deep Archive.'
    },
    tags: ['S3', 'Glacier', 'Storage Classes', 'Archiving']
  },
  {
    id: 'q-ebs-1',
    domain: 'storage',
    service: 'EBS',
    difficulty: 'Associate',
    scenario: 'A database administrator needs to move an existing Amazon EBS volume attached to an EC2 instance in us-east-1a to an EC2 instance located in us-east-1b. What is the required procedure?',
    options: [
      { id: 'A', text: 'Directly detach the volume from the instance in us-east-1a and attach it to the instance in us-east-1b.' },
      { id: 'B', text: 'Take a snapshot of the EBS volume in us-east-1a, then create a new EBS volume from the snapshot in us-east-1b.' },
      { id: 'C', text: 'Enable EBS Multi-Attach on the volume and connect across AZs.' },
      { id: 'D', text: 'EBS volumes automatically mirror across all Availability Zones in the Region.' }
    ],
    correctOptionId: 'B',
    explanation: 'EBS volumes are locked to a single Availability Zone. To migrate data across Availability Zones or Regions, you must create a point-in-time Snapshot (stored in S3) and create a new volume from that snapshot in the target AZ.',
    architectureTip: 'EBS Snapshots are incremental, meaning only blocks changed since the last snapshot are stored, saving both time and cost.',
    whyWrong: {
      'A': 'EBS volumes cannot cross AZ boundaries; a volume created in us-east-1a can only attach to instances in us-east-1a.',
      'C': 'EBS Multi-Attach only works across multiple EC2 instances within the SAME Availability Zone.',
      'D': 'EBS volumes do NOT automatically mirror across AZs (that is a feature of EFS and S3).'
    },
    tags: ['EBS', 'Snapshots', 'Availability Zones']
  },
  {
    id: 'q-efs-1',
    domain: 'storage',
    service: 'EFS',
    difficulty: 'Associate',
    scenario: 'A web content management system running on an Auto Scaling group of 20 Linux EC2 instances across 3 Availability Zones requires concurrent read/write access to a shared file directory. Which AWS storage service meets this requirement?',
    options: [
      { id: 'A', text: 'Amazon EBS General Purpose SSD (gp3)' },
      { id: 'B', text: 'Amazon Elastic File System (Amazon EFS)' },
      { id: 'C', text: 'Amazon S3 Glacier Instant Retrieval' },
      { id: 'D', text: 'Amazon EC2 Instance Store' }
    ],
    correctOptionId: 'B',
    explanation: 'Amazon EFS provides a serverless, fully elastic POSIX-compliant NFS file system that can be mounted concurrently by hundreds of Linux EC2 instances across multiple Availability Zones.',
    architectureTip: 'Enable EFS Lifecycle Management to automatically transition rarely accessed files to the EFS Infrequent Access (EFS IA) tier, saving up to 92%.',
    whyWrong: {
      'A': 'Standard EBS volumes attach to a single instance in a single AZ (Multi-Attach is single AZ and requires a cluster-aware file system).',
      'C': 'S3 Glacier is an object archival store, not a POSIX file system for web servers.',
      'D': 'Instance store is ephemeral block storage physically tied to a single host instance.'
    },
    tags: ['EFS', 'NFS', 'Multi-AZ', 'Shared Storage']
  },

  // NETWORKING (VPC, Route 53, CloudFront)
  {
    id: 'q-vpc-1',
    domain: 'networking',
    service: 'VPC',
    difficulty: 'Associate',
    scenario: 'An EC2 instance located in a private subnet needs to download operating system security patches from the public internet, but must not accept any inbound connections initiated from the internet. What component is required in the public subnet?',
    options: [
      { id: 'A', text: 'Internet Gateway (IGW)' },
      { id: 'B', text: 'NAT Gateway' },
      { id: 'C', text: 'VPC Gateway Endpoint' },
      { id: 'D', text: 'Egress-Only Internet Gateway' }
    ],
    correctOptionId: 'B',
    explanation: 'A NAT (Network Address Translation) Gateway resides in a public subnet with an Elastic IP. It allows instances in a private subnet to connect outbound to the internet for updates, while preventing inbound connections from the internet.',
    architectureTip: 'For high availability in production, deploy redundant NAT Gateways in each Availability Zone where private subnets reside.',
    whyWrong: {
      'A': 'An Internet Gateway provides two-way internet access and requires a public IP on the instance, violating private subnet isolation.',
      'C': 'VPC Gateway Endpoints only connect privately to AWS S3 and DynamoDB, not the general public internet for OS patches.',
      'D': 'Egress-Only Internet Gateways are specifically for IPv6 traffic, whereas NAT Gateways handle IPv4.'
    },
    tags: ['VPC', 'NAT Gateway', 'Subnets', 'Security']
  },
  {
    id: 'q-r53-1',
    domain: 'networking',
    service: 'Route 53',
    difficulty: 'Associate',
    scenario: 'A company is designing a disaster recovery architecture with an active primary web application in us-east-1 and a passive warm standby application in us-west-2. When the health check for us-east-1 fails, traffic should automatically route to us-west-2. Which Route 53 routing policy is required?',
    options: [
      { id: 'A', text: 'Weighted Routing' },
      { id: 'B', text: 'Failover Routing' },
      { id: 'C', text: 'Latency-based Routing' },
      { id: 'D', text: 'Geolocation Routing' }
    ],
    correctOptionId: 'B',
    explanation: 'Route 53 Failover Routing is designed specifically for active-passive disaster recovery configurations. Route 53 monitors the primary record with a health check and automatically switches to the secondary standby when unhealthy.',
    architectureTip: 'Pair Route 53 Failover Routing with CloudWatch Alarms to alert site reliability engineers whenever an automated failover event triggers.',
    whyWrong: {
      'A': 'Weighted routing splits traffic proportionally (e.g. 80/20) for blue/green deployments, not primary/standby disaster recovery.',
      'C': 'Latency routing directs users to the AWS region that provides the lowest network latency.',
      'D': 'Geolocation routing directs users based on the geographic location of the DNS query request.'
    },
    tags: ['Route 53', 'DNS', 'Failover', 'Disaster Recovery']
  },
  {
    id: 'q-cf-1',
    domain: 'networking',
    service: 'CloudFront',
    difficulty: 'Associate',
    scenario: 'A global video streaming platform serves static media assets stored in an Amazon S3 bucket. Users worldwide are experiencing high latency, and the security team wants to ensure direct access to the S3 bucket URL is completely blocked so all requests must pass through CloudFront. What solution satisfies both requirements?',
    options: [
      { id: 'A', text: 'Deploy Amazon S3 Cross-Region Replication (CRR) and use public bucket policies.' },
      { id: 'B', text: 'Deploy Amazon CloudFront distribution and configure Origin Access Control (OAC) with S3 bucket policy restrictions.' },
      { id: 'C', text: 'Deploy AWS Global Accelerator with an Application Load Balancer.' },
      { id: 'D', text: 'Enable S3 Transfer Acceleration on the bucket.' }
    ],
    correctOptionId: 'B',
    explanation: 'Amazon CloudFront caches assets across global Edge Locations for low latency. Origin Access Control (OAC) secures the S3 origin by allowing access only through authenticated CloudFront requests, blocking direct public S3 URLs.',
    architectureTip: 'Origin Access Control (OAC) is the modern, recommended replacement for legacy Origin Access Identity (OAI), supporting all S3 buckets in all regions, SSE-KMS, and dynamic requests.',
    whyWrong: {
      'A': 'CRR replicates data to another region, but does not cache at global edge locations or restrict direct public access.',
      'C': 'AWS Global Accelerator optimizes TCP/UDP network routing via AWS backbone, but does not cache static content.',
      'D': 'S3 Transfer Acceleration speeds up uploads via edge locations, but does not serve as a CDN or enforce OAC origin security.'
    },
    tags: ['CloudFront', 'S3', 'OAC', 'CDN', 'Security']
  },

  // DATABASE (RDS, DynamoDB)
  {
    id: 'q-rds-1',
    domain: 'database',
    service: 'RDS',
    difficulty: 'Associate',
    scenario: 'A banking application requires a relational PostgreSQL database with automatic failover and zero data loss in the event of an Availability Zone outage. However, heavy business intelligence reporting queries are currently slowing down production write transactions. What architectural solution addresses both high availability and reporting performance?',
    options: [
      { id: 'A', text: 'Deploy an RDS Multi-AZ deployment and configure reporting queries to connect to the Multi-AZ standby replica.' },
      { id: 'B', text: 'Deploy an RDS Multi-AZ deployment for HA failover and create one or more RDS Read Replicas for reporting queries.' },
      { id: 'C', text: 'Migrate the database to Amazon DynamoDB with Global Secondary Indexes.' },
      { id: 'D', text: 'Increase the EBS volume size on the primary RDS instance.' }
    ],
    correctOptionId: 'B',
    explanation: 'RDS Multi-AZ creates a synchronous standby replica in a second AZ for High Availability and automatic failover, but the standby cannot accept read queries. RDS Read Replicas use asynchronous replication and are queryable, making them ideal for offloading heavy reporting traffic.',
    architectureTip: 'For Amazon Aurora, read replicas share the same underlying distributed storage layer, providing near-instant lag (sub-10ms) and automatic failover targets.',
    whyWrong: {
      'A': 'A standard RDS Multi-AZ standby replica is passive and CANNOT serve read or write traffic.',
      'C': 'Migrating a complex relational PostgreSQL database with relational joins and ACID constraints to DynamoDB requires complete application rewrite.',
      'D': 'Increasing disk size increases storage capacity but does not solve read contention or provide read scaling.'
    },
    tags: ['RDS', 'Multi-AZ', 'Read Replicas', 'High Availability']
  },
  {
    id: 'q-ddb-1',
    domain: 'database',
    service: 'DynamoDB',
    difficulty: 'Associate',
    scenario: 'A mobile gaming leaderboard requires a serverless database capable of handling millions of concurrent requests with single-digit millisecond latency. The gaming studio wants to further reduce read latency on top-score queries from milliseconds to microseconds. What service should they add?',
    options: [
      { id: 'A', text: 'Amazon RDS Read Replicas' },
      { id: 'B', text: 'DynamoDB Accelerator (DAX)' },
      { id: 'C', text: 'Amazon CloudWatch Detailed Metrics' },
      { id: 'D', text: 'Amazon S3 Intelligent-Tiering' }
    ],
    correctOptionId: 'B',
    explanation: 'DynamoDB Accelerator (DAX) is a fully managed, highly available, in-memory cache specifically built for Amazon DynamoDB that reduces read response times from single-digit milliseconds to microseconds at scale.',
    architectureTip: 'DAX is API-compatible with DynamoDB; you simply point your AWS SDK client to the DAX cluster endpoint without changing application query logic.',
    whyWrong: {
      'A': 'RDS is for relational databases, not a cache for Amazon DynamoDB.',
      'C': 'CloudWatch provides metric logging, not query caching.',
      'D': 'S3 Intelligent-Tiering is an object storage cost optimization tool.'
    },
    tags: ['DynamoDB', 'DAX', 'NoSQL', 'In-Memory Cache']
  },

  // SECURITY & IDENTITY (IAM, KMS)
  {
    id: 'q-iam-1',
    domain: 'security',
    service: 'IAM',
    difficulty: 'Associate',
    scenario: 'An application running on an Amazon EC2 instance needs to read configuration files stored in a private Amazon S3 bucket. According to AWS security best practices, how should credentials be supplied to the application?',
    options: [
      { id: 'A', text: 'Generate an IAM User access key (Access Key ID and Secret Access Key) and hardcode it in the application config file.' },
      { id: 'B', text: 'Create an IAM Role with an attached S3 read policy, attach the role to an EC2 Instance Profile, and assign it to the EC2 instance.' },
      { id: 'C', text: 'Store the AWS Root account credentials in the EC2 instance User Data script.' },
      { id: 'D', text: 'Configure the S3 bucket to allow public read access for anyone.' }
    ],
    correctOptionId: 'B',
    explanation: 'AWS best practices dictate never storing long-term credentials on EC2 instances. Attaching an IAM Role via an Instance Profile provides temporary, automatically rotated STS credentials directly to the instance metadata service (IMDS).',
    architectureTip: 'Enforce IMDSv2 (Instance Metadata Service Version 2) on all EC2 instances to protect against SSRF (Server-Side Request Forgery) credential theft vulnerabilities.',
    whyWrong: {
      'A': 'Hardcoding long-term access keys poses massive security breach risks if code or instance is compromised.',
      'C': 'Root account credentials should NEVER be used or stored on instances under any circumstances.',
      'D': 'Making a private S3 bucket public creates a severe data leak vulnerability.'
    },
    tags: ['IAM', 'IAM Roles', 'EC2', 'Security Best Practices']
  },
  {
    id: 'q-kms-1',
    domain: 'security',
    service: 'KMS',
    difficulty: 'Associate',
    scenario: 'A healthcare company requires all data at rest in Amazon EBS volumes, Amazon RDS databases, and Amazon S3 buckets to be encrypted using encryption keys where the company can audit every single key usage, define granular key policies, and enable automatic annual key rotation. Which KMS key type must be used?',
    options: [
      { id: 'A', text: 'AWS Owned Keys' },
      { id: 'B', text: 'Customer Managed Keys (CMKs)' },
      { id: 'C', text: 'AWS Managed Keys (aws/s3, aws/ebs)' },
      { id: 'D', text: 'Client-Side SSL/TLS Certificates' }
    ],
    correctOptionId: 'B',
    explanation: 'Customer Managed Keys (CMKs) give you complete control over key policies, IAM permissions, enabling/disabling keys, configuring automatic annual key rotation, and monitoring usage in AWS CloudTrail logs.',
    architectureTip: 'KMS uses envelope encryption: KMS protects the 256-bit plaintext data key with a root key, and the data key encrypts the data volume locally at wire speed.',
    whyWrong: {
      'A': 'AWS Owned Keys are internal to AWS services; you cannot view, manage, audit, or rotate them.',
      'C': 'AWS Managed Keys cannot have their key policies edited and do not allow manual rotation control.',
      'D': 'SSL/TLS certificates protect data in transit (over the network), not encryption at rest in storage volumes.'
    },
    tags: ['KMS', 'Encryption', 'CMK', 'Compliance']
  },

  // MANAGEMENT & MONITORING (CloudWatch, CloudTrail)
  {
    id: 'q-cw-1',
    domain: 'management',
    service: 'CloudWatch',
    difficulty: 'Associate',
    scenario: 'A systems administrator notices that default Amazon CloudWatch metrics for an EC2 Linux instance show CPU utilization, Disk I/O, and Network In/Out, but do NOT report Memory (RAM) utilization or OS disk space percentage. Why is this metric missing, and how should it be collected?',
    options: [
      { id: 'A', text: 'CloudWatch does not support RAM metrics under any circumstances.' },
      { id: 'B', text: 'The EC2 hypervisor cannot see inside the guest OS memory space; the CloudWatch Unified Agent must be installed inside the OS.' },
      { id: 'C', text: 'The EC2 instance must be upgraded from gp2 to gp3 storage.' },
      { id: 'D', text: 'CloudTrail must be enabled to collect memory statistics.' }
    ],
    correctOptionId: 'B',
    explanation: 'Amazon EC2 hypervisors operate outside the guest operating system and cannot read OS-level memory or file system disk space. To collect Memory Utilization and Disk Space metrics, you must install the Amazon CloudWatch Unified Agent on the instance.',
    architectureTip: 'Use AWS Systems Manager (SSM) Run Command or State Manager to automate the fleet-wide installation and configuration of the CloudWatch Unified Agent.',
    whyWrong: {
      'A': 'CloudWatch supports custom metrics and memory metrics via the CloudWatch agent.',
      'C': 'EBS volume type gp3 is block storage configuration, unrelated to OS memory metric collection.',
      'D': 'CloudTrail records API activity and user actions, not OS performance metrics.'
    },
    tags: ['CloudWatch', 'Metrics', 'CloudWatch Agent', 'Monitoring']
  },
  {
    id: 'q-ct-1',
    domain: 'management',
    service: 'CloudTrail',
    difficulty: 'Associate',
    scenario: 'A security incident occurred where a production database was unexpectedly deleted at 2:00 AM. The security team needs to know exactly which IAM user or role invoked the DeleteDBInstance API call, their source IP address, and the exact timestamp. Which AWS service provides this audit trail?',
    options: [
      { id: 'A', text: 'Amazon CloudWatch Logs Insights' },
      { id: 'B', text: 'AWS CloudTrail' },
      { id: 'C', text: 'AWS Trusted Advisor' },
      { id: 'D', text: 'AWS Config' }
    ],
    correctOptionId: 'B',
    explanation: 'AWS CloudTrail is the governance and compliance service that records all API calls made in your AWS account, capturing the caller identity (IAM user/role), source IP address, request parameters, and timestamp.',
    architectureTip: 'Enable CloudTrail Log File Integrity Validation to ensure that audit log files delivered to your S3 bucket have not been modified or deleted by unauthorized actors.',
    whyWrong: {
      'A': 'CloudWatch Logs stores log streams, but CloudTrail is the dedicated service that captures AWS management API calls.',
      'C': 'Trusted Advisor provides recommendations for cost, performance, security, and fault tolerance, not an API audit log.',
      'D': 'AWS Config tracks resource configuration changes over time (relationships and compliance), but CloudTrail is the exact source for "WHO executed the API call".'
    },
    tags: ['CloudTrail', 'Auditing', 'Security', 'Governance']
  }
];

export const INITIAL_FLASHCARDS: Flashcard[] = [
  // COMPUTE
  {
    id: 'fc-1',
    domain: 'compute',
    service: 'EC2',
    front: 'What are the 4 main EC2 pricing models, and when is each used?',
    back: '1. On-Demand: Short-term, unpredictable, no commitment.\n2. Spot: Up to 90% off, stateless/tolerant to 2-min termination notice.\n3. Reserved (1-3 yr): Steady-state predictable workloads.\n4. Dedicated Hosts: Strict compliance or socket-based BYOL licenses.',
    architectureContext: 'EC2 instance pricing determines up to 70% of cloud infrastructure costs.',
    examGotcha: 'Spot instances are NOT for critical non-reproducible databases. Spot is for batch rendering, CI/CD runners, and distributed analytics.',
    boxLevel: 1,
    consecutiveCorrect: 0,
    status: 'new'
  },
  {
    id: 'fc-2',
    domain: 'compute',
    service: 'Lambda',
    front: 'What are the 3 hard limits of AWS Lambda you must memorize for AWS exams?',
    back: '• Max Execution Timeout: 15 minutes (900 seconds)\n• Memory Range: 128 MB to 10,240 MB (vCPU scales proportionally)\n• Ephemeral /tmp storage: 512 MB to 10 GB\n• Sync payload limit: 6 MB (Async: 256 KB)',
    architectureContext: 'Serverless compute execution boundary.',
    examGotcha: 'If a question mentions a compute task taking 20 minutes or continuous websocket listening, Lambda CANNOT be the answer—choose ECS Fargate or Batch.',
    boxLevel: 1,
    consecutiveCorrect: 0,
    status: 'new'
  },
  {
    id: 'fc-3',
    domain: 'compute',
    service: 'ECS',
    front: 'What is the crucial difference between ECS Task Role vs ECS Task Execution Role?',
    back: '• Task Role: Used by your application code inside the container to make AWS API calls (e.g. read S3, query DynamoDB).\n• Task Execution Role: Used by the ECS container agent to pull images from ECR and send logs to CloudWatch.',
    architectureContext: 'Container security and IAM role separation.',
    examGotcha: 'If a container fails to pull an image from Amazon ECR, check the Task Execution Role, NOT the Task Role!',
    boxLevel: 1,
    consecutiveCorrect: 0,
    status: 'new'
  },

  // STORAGE
  {
    id: 'fc-4',
    domain: 'storage',
    service: 'S3',
    front: 'Compare S3 Standard vs Standard-IA vs Glacier Instant vs Glacier Deep Archive.',
    back: '• S3 Standard: Frequent access, ms retrieval, highest storage $/GB.\n• Standard-IA: Infrequent (1x/mo), ms retrieval, lower storage $, retrieval fee.\n• Glacier Instant: Rare access, ms retrieval, lowest active storage cost.\n• Glacier Deep Archive: Archival (1x/yr), 12-48 hr retrieval, cheapest storage in AWS ($0.00099/GB).',
    architectureContext: 'All tiers (except One Zone-IA) provide 99.999999999% (11 9s) durability across >= 3 AZs.',
    examGotcha: 'Objects in Glacier Deep Archive have a minimum 180-day billable storage duration; deleting early incurs a pro-rated fee.',
    boxLevel: 1,
    consecutiveCorrect: 0,
    status: 'new'
  },
  {
    id: 'fc-5',
    domain: 'storage',
    service: 'EBS',
    front: 'What is the architectural boundary constraint of an Amazon EBS Volume?',
    back: 'An EBS volume is physically bound to a SINGLE Availability Zone (AZ). It cannot be attached directly to an EC2 instance in another AZ or another Region.\nTo move data: Create a Snapshot -> Snapshot is stored in S3 -> Restore snapshot as new volume in target AZ.',
    architectureContext: 'Block-level storage attached to EC2 over internal virtual bus.',
    examGotcha: 'EBS Multi-Attach allows an io1/io2 volume to attach to up to 16 Nitro instances, but still ONLY in the same single AZ.',
    boxLevel: 1,
    consecutiveCorrect: 0,
    status: 'new'
  },
  {
    id: 'fc-6',
    domain: 'storage',
    service: 'EFS',
    front: 'When should you choose Amazon EFS over Amazon EBS?',
    back: 'Choose EFS when multiple compute instances (thousands of EC2 instances, Lambda functions, ECS containers) across MULTIPLE Availability Zones need concurrent shared read/write access to a POSIX Linux file system.',
    architectureContext: 'Managed NFSv4 file storage scaling automatically on-demand.',
    examGotcha: 'EFS is for Linux only. For Windows shared SMB file storage, use Amazon FSx for Windows File Server.',
    boxLevel: 1,
    consecutiveCorrect: 0,
    status: 'new'
  },

  // NETWORKING
  {
    id: 'fc-7',
    domain: 'networking',
    service: 'VPC',
    front: 'Security Groups vs Network ACLs (NACLs): What are the 4 critical differences?',
    back: '1. Level: SG is at Instance/ENI level; NACL is at Subnet level.\n2. State: SG is STATEFUL (outbound response automatically allowed); NACL is STATELESS (must allow return rule).\n3. Rules: SG supports ALLOW rules only; NACL supports ALLOW & DENY (numbered in order).\n4. IP Blocking: Only NACLs can explicitly block a single hostile IP address.',
    architectureContext: 'Defense in depth layer in AWS VPC networking.',
    examGotcha: 'To block a specific attacker IP (e.g. 203.0.113.50), you MUST use a NACL DENY rule. Security Groups cannot block specific IPs.',
    boxLevel: 1,
    consecutiveCorrect: 0,
    status: 'new'
  },
  {
    id: 'fc-8',
    domain: 'networking',
    service: 'Route 53',
    front: 'What is an Alias Record in Route 53, and why is it preferred over CNAME?',
    back: '• Alias Record: AWS-native DNS pointer to AWS resources (CloudFront, ALB, S3 Website, API Gateway). Free DNS queries, automatically updates when AWS IPs change.\n• Key Exam Rule: Route 53 Alias can be used at Zone Apex (root domain e.g. "example.com"), whereas DNS RFC prohibits CNAME at zone apex.',
    architectureContext: 'DNS routing and top-level apex resolution.',
    examGotcha: 'Always choose Alias Record over CNAME when pointing to AWS CloudFront or ALB!',
    boxLevel: 1,
    consecutiveCorrect: 0,
    status: 'new'
  },
  {
    id: 'fc-9',
    domain: 'networking',
    service: 'CloudFront',
    front: 'How do you prevent users from bypassing CloudFront to access an S3 bucket directly?',
    back: 'Configure Origin Access Control (OAC) on the CloudFront distribution and update the S3 Bucket Policy to allow access ONLY from the CloudFront service principal ("Service": "cloudfront.amazonaws.com") with the distribution ARN condition.',
    architectureContext: 'CDN edge security and origin protection.',
    examGotcha: 'Origin Access Identity (OAI) is legacy; OAC is the modern AWS exam standard for S3 origin security.',
    boxLevel: 1,
    consecutiveCorrect: 0,
    status: 'new'
  },

  // DATABASE
  {
    id: 'fc-10',
    domain: 'database',
    service: 'RDS',
    front: 'RDS Multi-AZ vs RDS Read Replicas: Contrast purpose, replication type, and queryability.',
    back: '• Multi-AZ:\n  - Purpose: High Availability & Disaster Recovery\n  - Replication: SYNCHRONOUS across 2 AZs\n  - Queryable: NO (Standby is passive)\n\n• Read Replicas:\n  - Purpose: Read scalability & reporting performance\n  - Replication: ASYNCHRONOUS\n  - Queryable: YES (Accepts read traffic)',
    architectureContext: 'Database reliability vs throughput scaling.',
    examGotcha: 'Multi-AZ does NOT help with read performance bottlenecks. For slow SELECT queries, add Read Replicas or ElastiCache.',
    boxLevel: 1,
    consecutiveCorrect: 0,
    status: 'new'
  },
  {
    id: 'fc-11',
    domain: 'database',
    service: 'DynamoDB',
    front: 'What is the performance difference between DynamoDB Query vs Scan?',
    back: '• Query: Searches items using the Partition Key (and optional Sort Key filter). Highly efficient, predictable low RCU consumption, single-digit ms response.\n• Scan: Reads EVERY single item in the entire table, then filters. Extremely expensive, consumes massive RCUs, slow on large datasets.',
    architectureContext: 'NoSQL schema design and index access patterns.',
    examGotcha: 'Whenever an exam question asks to optimize DynamoDB performance and reduce RCU cost, replace Scan operations with Query operations using Global Secondary Indexes (GSI).',
    boxLevel: 1,
    consecutiveCorrect: 0,
    status: 'new'
  },

  // SECURITY
  {
    id: 'fc-12',
    domain: 'security',
    service: 'IAM',
    front: 'Explain the IAM Policy Evaluation Logic: How does AWS evaluate permissions?',
    back: '1. Starts with default IMPLICIT DENY.\n2. Evaluates all applicable policies (Identity, Resource, SCPs, Permissions Boundaries).\n3. If ANY policy contains an EXPLICIT DENY, the request is IMMEDIATELY DENIED (Deny overrides everything).\n4. If there is an EXPLICIT ALLOW and NO Deny, the request is ALLOWED.\n5. Otherwise, remains DENIED.',
    architectureContext: 'Core authorization engine of AWS.',
    examGotcha: 'An explicit DENY in any attached policy overrides 100 explicit ALLOW statements.',
    boxLevel: 1,
    consecutiveCorrect: 0,
    status: 'new'
  },
  {
    id: 'fc-13',
    domain: 'security',
    service: 'KMS',
    front: 'What is Envelope Encryption in AWS KMS, and why is it used?',
    back: 'KMS uses a Key Management Key (root key) to encrypt a Data Key. The plaintext Data Key is used to encrypt the actual large data file locally in memory, then erased from memory. The Encrypted Data Key is stored alongside the encrypted data.\nBenefit: Avoids sending gigabytes of data over network to KMS API (only 256-bit keys are sent).',
    architectureContext: 'Cryptographic architecture used across S3, EBS, and RDS.',
    examGotcha: 'AWS KMS keys never leave the KMS HSMs (Hardware Security Modules); encryption of bulk data is performed locally with data keys.',
    boxLevel: 1,
    consecutiveCorrect: 0,
    status: 'new'
  },

  // MANAGEMENT
  {
    id: 'fc-14',
    domain: 'management',
    service: 'CloudWatch',
    front: 'What metrics are NOT collected by default from EC2 by CloudWatch?',
    back: 'By default, EC2 hypervisor monitors CPU, Network, and Disk I/O. It CANNOT see inside the OS, so it does NOT collect:\n• Memory / RAM utilization (%)\n• Disk space utilized / free (%)\n• OS process counts\n• Swap space usage\nFix: Install the CloudWatch Unified Agent inside the OS.',
    architectureContext: 'Guest OS vs Hypervisor observability isolation.',
    examGotcha: 'If a question asks how to create an Auto Scaling policy based on EC2 Memory/RAM utilization, the answer MUST mention the CloudWatch Agent.',
    boxLevel: 1,
    consecutiveCorrect: 0,
    status: 'new'
  },
  {
    id: 'fc-15',
    domain: 'management',
    service: 'CloudTrail',
    front: 'What is the distinct difference between CloudWatch vs CloudTrail?',
    back: '• CloudWatch: PERFORMANCE & HEALTH monitoring (CPU metrics, memory alarms, latency dashboards, application logs).\n• CloudTrail: GOVERNANCE & AUDIT trail (Who made what API call, from which IP, at what exact timestamp, on which AWS resource).',
    architectureContext: 'Observability vs Compliance audit.',
    examGotcha: 'Remember: CloudWatch = "How is it performing?" vs CloudTrail = "Who did what?"',
    boxLevel: 1,
    consecutiveCorrect: 0,
    status: 'new'
  }
];

export const INITIAL_USER_PROGRESS: UserProgressState = {
  services: {
    'EC2': { service: 'EC2', domain: 'compute', masteryScore: 55, totalAttempts: 6, correctAttempts: 4, wrongAttempts: 2, streak: 1, confidenceLevel: 'Moderate', lastStudiedAt: new Date(Date.now() - 86400000).toISOString(), gapWeight: 68, recentMistakes: ['Confused Spot 2-minute interruption tolerance with Reserved commitments'] },
    'Lambda': { service: 'Lambda', domain: 'compute', masteryScore: 40, totalAttempts: 5, correctAttempts: 2, wrongAttempts: 3, streak: 0, confidenceLevel: 'Low', lastStudiedAt: new Date(Date.now() - 172800000).toISOString(), gapWeight: 90, recentMistakes: ['Exceeded 15-minute execution hard timeout limit'] },
    'ECS': { service: 'ECS', domain: 'compute', masteryScore: 35, totalAttempts: 4, correctAttempts: 1, wrongAttempts: 3, streak: 0, confidenceLevel: 'Critical Gap', lastStudiedAt: new Date(Date.now() - 259200000).toISOString(), gapWeight: 98, recentMistakes: ['Confused Task Role with Task Execution Role ECR permissions'] },
    'S3': { service: 'S3', domain: 'storage', masteryScore: 78, totalAttempts: 9, correctAttempts: 7, wrongAttempts: 2, streak: 3, confidenceLevel: 'High', lastStudiedAt: new Date(Date.now() - 43200000).toISOString(), gapWeight: 33, recentMistakes: ['Glacier Deep Archive 12-48 hr retrieval time delay'] },
    'EBS': { service: 'EBS', domain: 'storage', masteryScore: 48, totalAttempts: 6, correctAttempts: 3, wrongAttempts: 3, streak: 0, confidenceLevel: 'Low', lastStudiedAt: new Date(Date.now() - 129600000).toISOString(), gapWeight: 78, recentMistakes: ['Tried to attach EBS across Availability Zones without snapshotting'] },
    'EFS': { service: 'EFS', domain: 'storage', masteryScore: 30, totalAttempts: 3, correctAttempts: 1, wrongAttempts: 2, streak: 0, confidenceLevel: 'Critical Gap', lastStudiedAt: new Date(Date.now() - 345600000).toISOString(), gapWeight: 105, recentMistakes: ['Did not recognize EFS as multi-AZ concurrent POSIX NFS share'] },
    'VPC': { service: 'VPC', domain: 'networking', masteryScore: 25, totalAttempts: 8, correctAttempts: 2, wrongAttempts: 6, streak: 0, confidenceLevel: 'Critical Gap', lastStudiedAt: new Date(Date.now() - 86400000).toISOString(), gapWeight: 112, recentMistakes: ['Forgot NACLs are stateless and require explicit return outbound port rules', 'Placed NAT Gateway in private subnet instead of public subnet'] },
    'Route 53': { service: 'Route 53', domain: 'networking', masteryScore: 60, totalAttempts: 5, correctAttempts: 3, wrongAttempts: 2, streak: 1, confidenceLevel: 'Moderate', lastStudiedAt: new Date(Date.now() - 60000000).toISOString(), gapWeight: 60, recentMistakes: ['Used CNAME at zone apex instead of Route 53 Alias record'] },
    'CloudFront': { service: 'CloudFront', domain: 'networking', masteryScore: 50, totalAttempts: 4, correctAttempts: 2, wrongAttempts: 2, streak: 1, confidenceLevel: 'Moderate', lastStudiedAt: new Date(Date.now() - 172800000).toISOString(), gapWeight: 75, recentMistakes: ['Missing Origin Access Control (OAC) S3 policy restriction'] },
    'RDS': { service: 'RDS', domain: 'database', masteryScore: 65, totalAttempts: 7, correctAttempts: 5, wrongAttempts: 2, streak: 2, confidenceLevel: 'Moderate', lastStudiedAt: new Date(Date.now() - 40000000).toISOString(), gapWeight: 52, recentMistakes: ['Attempted to run read queries on passive Multi-AZ standby replica'] },
    'DynamoDB': { service: 'DynamoDB', domain: 'database', masteryScore: 42, totalAttempts: 6, correctAttempts: 2, wrongAttempts: 4, streak: 0, confidenceLevel: 'Low', lastStudiedAt: new Date(Date.now() - 90000000).toISOString(), gapWeight: 87, recentMistakes: ['Used heavy Scan operation instead of Query with Partition Key and DAX'] },
    'IAM': { service: 'IAM', domain: 'security', masteryScore: 82, totalAttempts: 12, correctAttempts: 10, wrongAttempts: 2, streak: 4, confidenceLevel: 'High', lastStudiedAt: new Date(Date.now() - 20000000).toISOString(), gapWeight: 27, recentMistakes: ['Explicit Deny evaluation precedence over Multiple Allows'] },
    'KMS': { service: 'KMS', domain: 'security', masteryScore: 38, totalAttempts: 5, correctAttempts: 2, wrongAttempts: 3, streak: 0, confidenceLevel: 'Critical Gap', lastStudiedAt: new Date(Date.now() - 200000000).toISOString(), gapWeight: 93, recentMistakes: ['Did not understand envelope encryption and Customer Managed Key (CMK) rotation'] },
    'CloudWatch': { service: 'CloudWatch', domain: 'management', masteryScore: 70, totalAttempts: 7, correctAttempts: 5, wrongAttempts: 2, streak: 2, confidenceLevel: 'Moderate', lastStudiedAt: new Date(Date.now() - 50000000).toISOString(), gapWeight: 45, recentMistakes: ['Forgot CloudWatch agent required for OS Memory & Disk Space'] },
    'CloudTrail': { service: 'CloudTrail', domain: 'management', masteryScore: 62, totalAttempts: 6, correctAttempts: 4, wrongAttempts: 2, streak: 1, confidenceLevel: 'Moderate', lastStudiedAt: new Date(Date.now() - 110000000).toISOString(), gapWeight: 57, recentMistakes: ['Confused CloudTrail 90-day event history with permanent S3 retention'] }
  },
  customNotes: {},
  bookmarkedQuestionIds: ['q-vpc-1', 'q-rds-1', 'q-lambda-1'],
  bookmarkedCardIds: ['fc-7', 'fc-10'],
  examHistory: [],
  dailyStreak: 3,
  lastActiveDate: new Date().toISOString().split('T')[0],
  totalQuestionsAnswered: 86,
  totalCardsReviewed: 48
};
