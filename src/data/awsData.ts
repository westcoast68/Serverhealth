import { AwsDomain, AwsService, ServiceMeta, QuizQuestion, Flashcard, UserProgressState } from '../types';

export const AWS_DOMAINS: Record<AwsDomain, { name: string; description: string; color: string; bgGradient: string; services: AwsService[] }> = {
  ec2_instances: {
    name: 'EC2 Virtual Servers & AMIs',
    description: 'EC2 instance families, nitro hypervisors, custom AMIs, user data bootstrap, and placement groups',
    color: '#F97316', // Orange
    bgGradient: 'from-orange-500/20 to-amber-500/10',
    services: ['EC2'],
  },
  lambda_serverless: {
    name: 'Lambda Serverless Execution',
    description: 'Event-driven invocations, concurrency limits, cold starts, SnapStart, and Hyperplane VPC networking',
    color: '#F59E0B', // Amber
    bgGradient: 'from-amber-500/20 to-yellow-500/10',
    services: ['Lambda'],
  },
  ecs_fargate: {
    name: 'ECS & Fargate Containers',
    description: 'Task definitions, Fargate serverless vs EC2 launch types, task IAM roles, and container networking',
    color: '#06B6D4', // Cyan
    bgGradient: 'from-cyan-500/20 to-blue-500/10',
    services: ['ECS'],
  },
  scaling_resilience: {
    name: 'Auto Scaling & High Availability',
    description: 'Target tracking policies, predictive scaling, multi-AZ instance distribution, and ALB health checks',
    color: '#10B981', // Emerald
    bgGradient: 'from-emerald-500/20 to-teal-500/10',
    services: ['EC2', 'ECS'],
  },
  cost_optimization: {
    name: 'Compute Cost & Sizing Optimization',
    description: 'Spot instances, Compute Savings Plans vs EC2 Instance Savings Plans, Graviton ARM, and right-sizing',
    color: '#8B5CF6', // Purple
    bgGradient: 'from-purple-500/20 to-indigo-500/10',
    services: ['EC2', 'Lambda', 'ECS'],
  },
  security_isolation: {
    name: 'Compute IAM & Security Isolation',
    description: 'IAM instance profiles, Task Roles vs Execution Roles, IMDSv2 credential security, and Security Groups',
    color: '#F43F5E', // Rose
    bgGradient: 'from-rose-500/20 to-pink-500/10',
    services: ['EC2', 'Lambda', 'ECS'],
  },
};

export const AWS_SERVICES_META: Record<AwsService, ServiceMeta> = {
  EC2: {
    id: 'EC2',
    name: 'Amazon Elastic Compute Cloud (EC2)',
    domain: 'ec2_instances',
    tagline: 'Resizable virtual compute capacity with deep OS & hypervisor control',
    iconName: 'Server',
    color: '#F97316',
    description: 'Provides scalable computing capacity using virtual servers (instances). Supports On-Demand, Spot, Reserved, and Savings Plans pricing models across General Purpose (M/T), Compute (C), Memory (R), Storage (I), and Accelerated (G/P) families.',
    examWeightPct: 40,
    coreConcepts: [
      'Instance Families: General Purpose (m7g/t4g), Compute Optimized (c7g), Memory Optimized (r7g), Storage (i3en/d3), Accelerated (g5/p4)',
      'Pricing Models: On-Demand (flexible no-commitment), Spot (up to 90% discount, 2-minute interruption notice), Compute Savings Plans (flexible 1-3yr commitment), Dedicated Hosts (compliance/BYOL)',
      'Auto Scaling Groups (ASG): Launch Templates, Target Tracking scaling, Step scaling, Instance Refresh, and Multi-AZ rebalancing',
      'Storage Lifecycle: Ephemeral Instance Store (physically attached, lost on stop) vs Persistent Elastic Block Store (EBS)',
      'Security: IMDSv2 (Session-oriented token required), Security Groups (Stateful instance firewalls), and IAM Instance Profiles'
    ],
    commonGotchas: [
      'Spot instances give only a 2-minute termination warning via EventBridge / instance metadata before reclamation',
      'Instance Store volumes are ephemeral and permanently lose data when the EC2 instance is stopped or terminated',
      'IMDSv2 requires a PUT request to fetch a session token (X-aws-ec2-metadata-token) with a TTL before querying metadata',
      'Security Groups are stateful (outbound return allowed automatically) and cannot explicitly DENY traffic (use NACLs for explicit DENY)'
    ],
    keyTradeoffs: [
      'Spot vs On-Demand: 90% cost savings for stateless/fault-tolerant batch jobs vs zero-interruption guarantee',
      'Instance Store vs EBS: Extreme IOPS & lowest latency vs persistent independent volume lifecycle and snapshotting'
    ]
  },
  Lambda: {
    id: 'Lambda',
    name: 'AWS Lambda (Serverless Compute)',
    domain: 'lambda_serverless',
    tagline: 'Zero-server event-driven execution with automatic sub-second scaling',
    iconName: 'Zap',
    color: '#F59E0B',
    description: 'Runs code in response to events without provisioning or managing servers. Automatically scales from zero to tens of thousands of concurrent requests. Pay strictly for compute duration and allocated memory.',
    examWeightPct: 35,
    coreConcepts: [
      'Execution Limits: 15-minute maximum timeout per invocation, 128 MB to 10,240 MB RAM (vCPU scales proportionally), 512 MB to 10 GB ephemeral /tmp',
      'Invocation Models: Synchronous (API Gateway, ALB - 6 MB payload), Asynchronous (S3, SNS, EventBridge - 256 KB payload with DLQs/Destinations), Polling/Stream-based (SQS, Kinesis, DynamoDB Streams)',
      'Concurrency & Cold Starts: Unreserved Concurrency (pool-wide), Reserved Concurrency (guaranteed capacity & throttle ceiling), Provisioned Concurrency (pre-warmed initialization)',
      'VPC Networking: Hyperplane ENI sharing provides instant sub-second ENI attachment without cold-start IP exhaustion',
      'IAM Security: Execution Role (grants Lambda permission to access AWS services) vs Resource-Based Policy (grants other services permission to invoke Lambda)'
    ],
    commonGotchas: [
      'Lambda execution hard-times out at 15 minutes (cannot run long-running batch servers or streaming daemons)',
      'Lambda functions are stateless; never store persistent user state or session cookies in memory across invocations',
      'Asynchronous invocations automatically retry twice with exponential backoff before sending failures to a DLQ or EventBridge Destination'
    ],
    keyTradeoffs: [
      'Lambda vs EC2: Zero idle cost & automatic auto-scaling vs 15-minute hard timeout limit and cold start latency',
      'Provisioned Concurrency vs Standard: Zero cold start latency for latency-critical APIs vs continuous hourly reservation fee'
    ]
  },
  ECS: {
    id: 'ECS',
    name: 'Amazon Elastic Container Service (ECS)',
    domain: 'ecs_fargate',
    tagline: 'Production Docker container orchestration on Fargate or EC2 clusters',
    iconName: 'Boxes',
    color: '#06B6D4',
    description: 'Highly scalable container management service that makes it easy to run, stop, and manage Docker containers on a cluster. Deploy with serverless AWS Fargate or manage your own EC2 container instances.',
    examWeightPct: 25,
    coreConcepts: [
      'Launch Types: AWS Fargate (Serverless, pay per vCPU/RAM, zero host management) vs EC2 Launch Type (host cluster control, GPU, custom AMI)',
      'Task Definitions: Declarative JSON blueprint defining container images, CPU/memory limits, port mappings, log configuration, and IAM roles',
      'ECS Services: Maintains desired count of running tasks, integrates with ALB target groups, and manages rolling or Blue/Green CodeDeploy updates',
      'IAM Roles Distinction: Task Role (permissions used by the running application code) vs Task Execution Role (permissions used by ECS agent to pull from ECR and write CloudWatch logs)',
      'Task Placement: Placement Strategies (Binpack to minimize cost, Spread across AZs for HA, Random) and Placement Constraints (attributes, distinctInstance)'
    ],
    commonGotchas: [
      'Confusing Task Execution Role with Task Role (Task Execution Role pulls ECR images & writes CloudWatch logs; Task Role is what the application container uses to query DynamoDB/S3)',
      'Fargate tasks cannot attach EBS volumes directly; use Amazon EFS volume mounts for shared persistent container storage',
      'awsvpc network mode gives each ECS task its own Elastic Network Interface (ENI) and private IP address'
    ],
    keyTradeoffs: [
      'Fargate vs EC2 Launch Type: Zero OS patching & cluster maintenance vs capacity reservation & custom kernel/daemon control',
      'Replica vs Daemon Service Strategy: Desired count distributed across cluster vs exactly one task copy on every cluster host'
    ]
  }
};

export const INITIAL_USER_PROGRESS: UserProgressState = {
  services: {
    EC2: {
      service: 'EC2',
      domain: 'ec2_instances',
      masteryScore: 42,
      totalAttempts: 12,
      correctAttempts: 5,
      wrongAttempts: 7,
      streak: 0,
      confidenceLevel: 'Critical Gap',
      lastStudiedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
      gapWeight: 85,
      recentMistakes: ['Spot Instance 2-minute interruption handling', 'IMDSv2 token session requirements', 'Instance Store vs EBS persistence']
    },
    Lambda: {
      service: 'Lambda',
      domain: 'lambda_serverless',
      masteryScore: 58,
      totalAttempts: 15,
      correctAttempts: 9,
      wrongAttempts: 6,
      streak: 1,
      confidenceLevel: 'Moderate',
      lastStudiedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      gapWeight: 65,
      recentMistakes: ['Provisioned vs Reserved Concurrency', 'Lambda 15-minute maximum timeout limit', 'Hyperplane VPC ENI architecture']
    },
    ECS: {
      service: 'ECS',
      domain: 'ecs_fargate',
      masteryScore: 48,
      totalAttempts: 10,
      correctAttempts: 5,
      wrongAttempts: 5,
      streak: 0,
      confidenceLevel: 'Low',
      lastStudiedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      gapWeight: 78,
      recentMistakes: ['Task Role vs Task Execution Role permissions', 'Fargate vs EC2 launch type storage limits', 'ECS Binpack vs Spread placement strategies']
    }
  },
  customNotes: {
    'EC2': 'Remember: Spot instances get a 2-minute warning. Instance store is lost on STOP. IMDSv2 uses PUT header token.',
    'Lambda': 'Max timeout 15 min. Provisioned concurrency solves cold starts. Payload: 6MB sync, 256KB async.',
    'ECS': 'Task Execution Role = ECR pull + logs. Task Role = app accessing S3/DynamoDB.'
  },
  bookmarkedQuestionIds: ['q-ec2-spot-1', 'q-lambda-conc-1', 'q-ecs-iam-1'],
  bookmarkedCardIds: ['fc-ec2-1', 'fc-lam-1', 'fc-ecs-1'],
  examHistory: [
    {
      id: 'mock-initial-1',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
      totalQuestions: 15,
      correctCount: 7,
      scorePercentage: 47,
      passingScore: 72,
      isPassed: false,
      totalTimeSeconds: 840,
      domainScores: {
        ec2_instances: { correct: 2, total: 5, percentage: 40 },
        lambda_serverless: { correct: 3, total: 5, percentage: 60 },
        ecs_fargate: { correct: 2, total: 5, percentage: 40 },
        scaling_resilience: { correct: 3, total: 5, percentage: 60 },
        cost_optimization: { correct: 2, total: 5, percentage: 40 },
        security_isolation: { correct: 2, total: 5, percentage: 40 }
      },
      weakestServicesFound: ['EC2', 'ECS', 'Lambda'],
      answers: []
    }
  ],
  dailyStreak: 3,
  lastActiveDate: new Date().toISOString().split('T')[0],
  totalQuestionsAnswered: 37,
  totalCardsReviewed: 45
};

export const INITIAL_QUIZ_QUESTIONS: QuizQuestion[] = [
  // ===================== EC2 INSTANCES & ARCHITECTURE =====================
  {
    id: 'q-ec2-spot-1',
    domain: 'cost_optimization',
    service: 'EC2',
    difficulty: 'Associate',
    scenario: 'A genomics research company runs nightly parallel batch processing jobs that take 6 hours to analyze DNA sequence chunks. The processing application is containerized, checkpoints state to Amazon S3 every 60 seconds, and can tolerate unexpected server terminations. Which EC2 purchasing model minimizes costs while meeting requirements?',
    options: [
      { id: 'A', text: 'On-Demand Instances' },
      { id: 'B', text: 'EC2 Spot Instances' },
      { id: 'C', text: 'Dedicated Hosts' },
      { id: 'D', text: '3-Year Standard Reserved Instances' }
    ],
    correctOptionId: 'B',
    explanation: 'Spot Instances offer discounts of up to 90% compared to On-Demand prices by utilizing spare EC2 capacity. Because the batch job checkpoints its state every 60 seconds and is stateless/fault-tolerant, it can seamlessly handle Spot 2-minute interruption notices.',
    architectureTip: 'Use EC2 Auto Scaling with mixed instances policies and Spot allocation strategy "capacity-optimized" to automatically launch Spot instances from the pools with the lowest chance of interruption.',
    whyWrong: {
      'A': 'On-Demand instances charge full price without discounts, which is wasteful for fault-tolerant batch workloads.',
      'C': 'Dedicated Hosts are the most expensive EC2 option, designed for strict regulatory compliance and dedicated physical socket licensing (e.g. Oracle/Windows).',
      'D': 'Reserved Instances require a continuous 24/7 financial commitment for 3 years, which is inefficient for batch jobs running only 6 hours per day.'
    },
    tags: ['EC2', 'Spot Instances', 'Cost Optimization', 'Batch Processing'],
    keywordRadar: [
      {
        keyword: 'minimizes costs while meeting requirements',
        category: 'constraint',
        meaning: 'Primary optimization goal. Immediately rules out expensive Dedicated Hosts and full-price On-Demand.',
        targetConcept: 'EC2 Spot Instances'
      },
      {
        keyword: 'checkpoints state to Amazon S3 every 60 seconds',
        category: 'workload',
        meaning: 'Guarantees the application can lose an instance without losing more than 60 seconds of progress.',
        targetConcept: 'Fault-Tolerant Architecture'
      },
      {
        keyword: 'can tolerate unexpected server terminations',
        category: 'workload',
        meaning: 'Textbook indicator that Spot Instances (with 2-minute interruption notice) are safe to use.',
        targetConcept: 'Spot Interruption Tolerance'
      }
    ]
  },
  {
    id: 'q-ec2-storage-1',
    domain: 'ec2_instances',
    service: 'EC2',
    difficulty: 'Associate',
    scenario: 'An architect is hosting a high-performance distributed cache on Amazon EC2 instances that requires 250,000 read IOPS with ultra-low sub-millisecond latency. The cache data is replicated across multiple nodes at the application layer, and cache nodes can be rebuilt from scratch in minutes if lost. What storage option provides the highest performance at lowest cost?',
    options: [
      { id: 'A', text: 'EBS Provisioned IOPS SSD (io2 Block Express)' },
      { id: 'B', text: 'EBS General Purpose SSD (gp3)' },
      { id: 'C', text: 'EC2 Instance Store (NVMe SSD)' },
      { id: 'D', text: 'Amazon EFS (Elastic File System) Max I/O' }
    ],
    correctOptionId: 'C',
    explanation: 'EC2 Instance Store provides temporary block-level storage physically attached to the host computer. It delivers the lowest latency and highest IOPS (hundreds of thousands of IOPS) with zero network overhead. Because cache data is replicated at the application layer, the ephemeral nature of Instance Store is acceptable.',
    architectureTip: 'Instance Store data does NOT survive an instance STOP or TERMINATION. Only REBOOT retains data. Never store non-replicated persistent databases directly on Instance Store.',
    whyWrong: {
      'A': 'io2 Block Express can reach high IOPS, but it travels over the EBS network bus and carries high provisioned IOPS costs.',
      'B': 'gp3 SSD is limited to 16,000 IOPS per volume and traverses the network.',
      'D': 'EFS is a shared network file system with higher latency than local physical NVMe drives.'
    },
    tags: ['EC2', 'Instance Store', 'EBS', 'Performance'],
    keywordRadar: [
      {
        keyword: 'ultra-low sub-millisecond latency',
        category: 'constraint',
        meaning: 'Eliminates network-attached storage (EBS). Requires physically attached NVMe host storage.',
        targetConcept: 'EC2 Instance Store'
      },
      {
        keyword: 'replicated across multiple nodes at the application layer',
        category: 'workload',
        meaning: 'Mitigates the biggest risk of Instance Store (loss of data on host termination).',
        targetConcept: 'Application-Level High Availability'
      },
      {
        keyword: 'can be rebuilt from scratch in minutes if lost',
        category: 'workload',
        meaning: 'Reaffirms that persistent durability is NOT required, making ephemeral storage the ideal price-performance choice.',
        targetConcept: 'Ephemeral Storage Fit'
      }
    ]
  },
  {
    id: 'q-ec2-imds-1',
    domain: 'security_isolation',
    service: 'EC2',
    difficulty: 'Deep Dive',
    scenario: 'A security auditor discovers that an application running on EC2 has an open Server-Side Request Forgery (SSRF) vulnerability. The auditor warns that attackers could exploit this to steal temporary credentials from the EC2 Instance Metadata Service (IMDS). Which configuration immediately mitigates this risk across the fleet?',
    options: [
      { id: 'A', text: 'Enforce IMDSv2 (HttpTokens: required) and set HttpPutResponseHopLimit to 1.' },
      { id: 'B', text: 'Block port 443 on the EC2 Security Group outbound rules.' },
      { id: 'C', text: 'Attach an IAM Deny policy to the EC2 Instance Profile.' },
      { id: 'D', text: 'Configure a Network ACL rule to deny traffic to 169.254.169.254 on port 80.' }
    ],
    correctOptionId: 'A',
    explanation: 'IMDSv2 requires a session-oriented HTTP PUT request with a custom header (X-aws-ec2-metadata-token) to generate a secret token before querying metadata. SSRF attacks generally cannot forge arbitrary HTTP PUT requests with custom headers. Setting the hop limit to 1 prevents containerized workloads from traversing network boundaries to query host metadata.',
    architectureTip: 'You can enforce IMDSv2 account-wide or per-instance using AWS CLI: aws ec2 modify-instance-metadata-options --http-tokens required --http-put-response-hop-limit 1.',
    whyWrong: {
      'B': 'IMDS operates on internal link-local IP 169.254.169.254 over port 80, not external port 443.',
      'C': 'Attaching a Deny policy breaks legitimate application access to necessary AWS services.',
      'D': 'NACLs operate at subnet boundaries and cannot filter link-local 169.254.169.254 traffic on the local host.'
    },
    tags: ['EC2', 'IMDSv2', 'Security', 'SSRF', 'IAM']
  },
  {
    id: 'q-ec2-placement-1',
    domain: 'scaling_resilience',
    service: 'EC2',
    difficulty: 'Associate',
    scenario: 'A financial trading firm is deploying 10 EC2 compute instances running a tightly coupled MPI (Message Passing Interface) algorithmic calculation. The nodes exchange thousands of network packets per second and require the absolute lowest inter-node network latency possible. Which Placement Group strategy must be selected?',
    options: [
      { id: 'A', text: 'Spread Placement Group' },
      { id: 'B', text: 'Partition Placement Group' },
      { id: 'C', text: 'Cluster Placement Group' },
      { id: 'D', text: 'Multi-AZ Auto Scaling Placement' }
    ],
    correctOptionId: 'C',
    explanation: 'A Cluster Placement Group packs instances close together inside a single Availability Zone on the same physical hardware rack. This provides high-throughput, low-latency 10 Gbps – 100 Gbps network performance ideal for tightly coupled HPC and MPI workloads.',
    architectureTip: 'Spread Placement Groups put instances on distinct physical hardware racks (max 7 instances per AZ) to minimize correlated hardware failure risks.',
    whyWrong: {
      'A': 'Spread placement groups strictly separate instances across different racks, increasing inter-node latency.',
      'B': 'Partition placement groups isolate groups of instances into logical partitions for distributed systems like HDFS/Cassandra.',
      'D': 'Distributing across multiple AZs adds inter-AZ fiber transit latency (1-2ms), which degrades tightly coupled HPC algorithms.'
    },
    tags: ['EC2', 'Placement Groups', 'HPC', 'Networking']
  },
  {
    id: 'q-ec2-asg-scaling-1',
    domain: 'scaling_resilience',
    service: 'EC2',
    difficulty: 'Associate',
    scenario: 'An e-commerce website experiences sudden, unpredictable surges in traffic during flash sales. The engineering team wants their EC2 Auto Scaling Group to automatically maintain average CPU utilization across all instances at 60%, scaling in and out smoothly without complex manual threshold alarms. Which scaling policy type is recommended?',
    options: [
      { id: 'A', text: 'Target Tracking Scaling Policy' },
      { id: 'B', text: 'Simple Scaling Policy' },
      { id: 'C', text: 'Scheduled Scaling Policy' },
      { id: 'D', text: 'Step Scaling Policy with CloudWatch Metric Math' }
    ],
    correctOptionId: 'A',
    explanation: 'Target Tracking Scaling behaves like a thermostat. You specify a target metric value (e.g. ASGAverageCPUUtilization = 60%), and AWS Auto Scaling automatically creates the necessary CloudWatch alarms and calculates the exact number of instances to add or remove.',
    architectureTip: 'Combine Target Tracking with Predictive Scaling for workloads with repeating daily or weekly traffic cycles to pre-warm compute capacity ahead of expected spikes.',
    whyWrong: {
      'B': 'Simple Scaling requires manually creating multiple CloudWatch alarms and fixed instance adjustment numbers with cooldown delays.',
      'C': 'Scheduled Scaling only triggers at pre-determined calendar times, failing to react to unpredictable traffic surges.',
      'D': 'Step Scaling provides fine-grained steps (e.g. +2 instances at 70%, +5 instances at 85%) but requires more operational setup than Target Tracking.'
    },
    tags: ['EC2', 'Auto Scaling', 'Target Tracking', 'High Availability']
  },
  {
    id: 'q-ec2-nitro-1',
    domain: 'ec2_instances',
    service: 'EC2',
    difficulty: 'Associate',
    scenario: 'An engineering team is evaluating newer generation EC2 instances (such as c6g, c7g, and m6i). They want to understand why AWS Nitro System instances provide superior CPU performance, near-zero virtualization jitter, and hardware-accelerated EBS encryption compared to legacy xen-based instances. What describes the Nitro architecture?',
    options: [
      { id: 'A', text: 'Nitro offloads virtualization, networking, and storage IO functions to dedicated hardware Nitro Cards, leaving almost 100% of host CPU and RAM to user workloads.' },
      { id: 'B', text: 'Nitro compiles all guest operating systems directly into CPU microcode.' },
      { id: 'C', text: 'Nitro runs all EC2 instances inside Docker containers on bare metal servers.' },
      { id: 'D', text: 'Nitro replaces AWS VPC with public peer-to-peer mesh tunnels.' }
    ],
    correctOptionId: 'A',
    explanation: 'The AWS Nitro System is a collection of purpose-built hardware and software components. Dedicated Nitro Cards handle VPC networking, EBS storage management, security monitoring, and local NVMe storage, which relieves the host CPU of hypervisor overhead.',
    architectureTip: 'All modern EC2 instances (5th gen and newer) run on the Nitro System and enforce IMDSv2 and EBS encryption natively without CPU penalty.',
    whyWrong: {
      'B': 'Nitro does not modify guest OS microcode; it provides a lightweight Nitro Hypervisor.',
      'C': 'Nitro is hardware virtualization, not shared Docker containers.',
      'D': 'Nitro accelerates VPC networking using the Nitro Card for VPC, maintaining standard AWS network topology.'
    },
    tags: ['EC2', 'Nitro System', 'Hypervisor', 'Hardware Acceleration']
  },
  {
    id: 'q-ec2-spread-1',
    domain: 'scaling_resilience',
    service: 'EC2',
    difficulty: 'Associate',
    scenario: 'A bank requires running 6 mission-critical payment verification nodes in a single AWS Region. The bank mandates that no two instances share the same physical server rack, power supply, or network switch hardware, to isolate against correlated hardware failure. What placement group strategy must be used?',
    options: [
      { id: 'A', text: 'Cluster Placement Group' },
      { id: 'B', text: 'Spread Placement Group' },
      { id: 'C', text: 'Partition Placement Group' },
      { id: 'D', text: 'Dedicated Cluster Group' }
    ],
    correctOptionId: 'B',
    explanation: 'A Spread Placement Group strictly places each individual instance on distinct underlying hardware racks (each with its own network and power supply). A single Spread Placement Group can hold up to 7 running instances per Availability Zone.',
    architectureTip: 'Use Spread Placement Groups when you have a small number of critical instances that must be isolated from each other at the hardware rack level.',
    whyWrong: {
      'A': 'Cluster Placement Groups pack instances into the same rack or adjacent racks for low latency, increasing correlated hardware failure risk.',
      'C': 'Partition Placement Groups group multiple instances into partitions (up to hundreds of nodes), rather than isolating individual instances onto single racks.',
      'D': 'There is no AWS feature called "Dedicated Cluster Group".'
    },
    tags: ['EC2', 'Spread Placement Group', 'High Availability', 'Resilience']
  },
  {
    id: 'q-ec2-partition-1',
    domain: 'ec2_instances',
    service: 'EC2',
    difficulty: 'Associate',
    scenario: 'A data engineering team is deploying a 200-node Apache Cassandra and Hadoop HDFS distributed cluster on EC2. The cluster software is partition-aware and must ensure that data node replicas never land on the same physical server racks. Which placement group model is purpose-built for this use case?',
    options: [
      { id: 'A', text: 'Cluster Placement Group' },
      { id: 'B', text: 'Spread Placement Group (limited to 7 instances)' },
      { id: 'C', text: 'Partition Placement Group (up to 7 partitions per AZ)' },
      { id: 'D', text: 'Single AZ Default Placement' }
    ],
    correctOptionId: 'C',
    explanation: 'A Partition Placement Group divides an Availability Zone into logical partitions (up to 7 per AZ). Each partition has its own set of physical server racks. EC2 provides visibility into which partition an instance belongs to, allowing Cassandra/HDFS topologies to distribute data replicas across different partitions.',
    architectureTip: 'Partition placement groups scale up to hundreds of instances while maintaining rack-level fault isolation for large distributed storage engines.',
    whyWrong: {
      'A': 'Cluster placement groups maximize proximity, not partition fault isolation.',
      'B': 'Spread placement groups have a strict limit of 7 instances per AZ, which cannot support a 200-node cluster.',
      'D': 'Default placement provides no guarantee that instances will be distributed across distinct server racks.'
    },
    tags: ['EC2', 'Partition Placement Group', 'Big Data', 'Cassandra', 'Hadoop']
  },
  {
    id: 'q-ec2-hibernation-1',
    domain: 'ec2_instances',
    service: 'EC2',
    difficulty: 'Associate',
    scenario: 'An application takes 12 minutes to initialize its in-memory data structures from disk on cold boot. The team wants to pause the instance during off-peak hours to save compute costs and resume it instantly with the memory state intact in under 30 seconds. What feature and requirements apply?',
    options: [
      { id: 'A', text: 'EC2 Hibernation; requires an encrypted EBS root volume and RAM size under 150 GB.' },
      { id: 'B', text: 'EC2 Stop; requires Instance Store backing.' },
      { id: 'C', text: 'Auto Scaling Standby mode without EBS.' },
      { id: 'D', text: 'AWS Lambda Provisioned Concurrency snapshotting.' }
    ],
    correctOptionId: 'A',
    explanation: 'EC2 Hibernation writes the in-memory (RAM) state of the operating system directly to the EBS root volume before shutting down the instance. When started, EC2 reloads the RAM from the root volume, bypassing application boot time. It requires an encrypted EBS root volume and supported OS/instance families with RAM <= 150 GB.',
    architectureTip: 'You pay for EBS volume storage while an instance is hibernated, but you incur zero EC2 hourly instance charges.',
    whyWrong: {
      'B': 'Standard EC2 Stop clears the RAM contents, requiring a full application re-initialization on start, and cannot be used with Instance Store.',
      'C': 'Auto Scaling Standby keeps the instance running and incurring full hourly costs.',
      'D': 'Lambda Provisioned Concurrency applies to serverless functions, not EC2 virtual machines.'
    },
    tags: ['EC2', 'Hibernation', 'RAM', 'Fast Boot', 'Cost Savings']
  },
  {
    id: 'q-ec2-dedicated-1',
    domain: 'cost_optimization',
    service: 'EC2',
    difficulty: 'Associate',
    scenario: 'An enterprise must migrate an enterprise database to AWS. The software vendor contract strictly requires Bring-Your-Own-License (BYOL) licensing based on physical CPU sockets and physical CPU cores of the underlying server hardware. What EC2 tenancy model is required?',
    options: [
      { id: 'A', text: 'Default Shared Tenancy' },
      { id: 'B', text: 'Dedicated Instances' },
      { id: 'C', text: 'Dedicated Hosts' },
      { id: 'D', text: 'Spot Fleet' }
    ],
    correctOptionId: 'C',
    explanation: 'Amazon EC2 Dedicated Hosts provide a physical server dedicated entirely for your use, giving you visibility into physical sockets and physical cores. This visibility is required for server-bound software licenses (such as Microsoft Windows Server, SQL Server, or Oracle per-socket/per-core licenses).',
    architectureTip: 'Dedicated Hosts also allow controlling instance placement (host affinity) and instance reboot lifecycles via AWS License Manager.',
    whyWrong: {
      'A': 'Shared tenancy shares physical hardware with other AWS customers and provides no socket-level visibility.',
      'B': 'Dedicated Instances guarantee dedicated hardware for an account at the instance level, but do not provide visibility or control over physical sockets/cores.',
      'D': 'Spot Fleet utilizes spare shared capacity, which does not satisfy per-socket compliance licensing.'
    },
    tags: ['EC2', 'Dedicated Hosts', 'BYOL', 'Licensing', 'Compliance']
  },
  {
    id: 'q-ec2-userdata-1',
    domain: 'ec2_instances',
    service: 'EC2',
    difficulty: 'Associate',
    scenario: 'A DevOps engineer supplies a shell script in the User Data field when launching an Amazon Linux EC2 instance. When does this script execute by default?',
    options: [
      { id: 'A', text: 'Once during the initial boot cycle when the instance is launched for the very first time.' },
      { id: 'B', text: 'Every time the EC2 instance is rebooted or restarted.' },
      { id: 'C', text: 'Only when an admin logs in via SSH for the first time.' },
      { id: 'D', text: 'Continuously in the background as a systemd timer daemon.' }
    ],
    correctOptionId: 'A',
    explanation: 'By default, EC2 User Data scripts are executed by cloud-init only once during the initial instance launch boot sequence as root. They do not re-run on subsequent reboots unless cloud-init configuration is explicitly customized.',
    architectureTip: 'Logs for user data script execution are located at /var/log/cloud-init-output.log for debugging bootstrap failures.',
    whyWrong: {
      'B': 'User data does not re-run on standard reboot unless configured via cloud-boothook or mime-multipart directives.',
      'C': 'User data executes during system boot before any user logs in.',
      'D': 'User data is a one-shot execution script, not a persistent background daemon.'
    },
    tags: ['EC2', 'User Data', 'Cloud-Init', 'Bootstrap']
  },
  {
    id: 'q-ec2-ssm-1',
    domain: 'security_isolation',
    service: 'EC2',
    difficulty: 'Associate',
    scenario: 'A company security policy strictly forbids opening inbound port 22 (SSH) in Security Groups and mandates removing all SSH key pairs (.pem files) from developer laptops. How can engineers securely access EC2 instances in private subnets?',
    options: [
      { id: 'A', text: 'Use AWS Systems Manager (SSM) Session Manager with the SSM Agent and an IAM instance profile.' },
      { id: 'B', text: 'Deploy an internet-facing Bastion host in a public subnet with port 22 open to 0.0.0.0/0.' },
      { id: 'C', text: 'Enable RDP port 3389 instead of port 22.' },
      { id: 'D', text: 'Attach an Elastic IP directly to the private EC2 instance.' }
    ],
    correctOptionId: 'A',
    explanation: 'AWS Systems Manager Session Manager provides secure, auditable instance management without opening inbound firewall ports, managing bastion hosts, or distributing SSH keys. Communication is initiated outbound from the SSM Agent on the instance to the Systems Manager service over TLS.',
    architectureTip: 'Ensure the EC2 instance has outbound HTTPS connectivity to SSM endpoints (via NAT Gateway or SSM VPC Interface Endpoints) and has AmazonSSMManagedInstanceCore policy attached.',
    whyWrong: {
      'B': 'Bastion hosts with port 22 open violate the policy forbidding inbound SSH and .pem keys.',
      'C': 'RDP port 3389 is for Windows remote desktop and introduces similar port exposure risks.',
      'D': 'Attaching an Elastic IP in a private subnet does not grant internet access without an Internet Gateway and violates network isolation.'
    },
    tags: ['EC2', 'Systems Manager', 'SSM', 'Session Manager', 'Security']
  },
  {
    id: 'q-ec2-asg-lifecycle-1',
    domain: 'scaling_resilience',
    service: 'EC2',
    difficulty: 'Associate',
    scenario: 'An e-commerce backend running in an Auto Scaling Group processes long-lived WebSocket connections. When scale-in occurs, the ASG terminates instances immediately, abruptly dropping active transactions. How can the architect ensure instances wait for active transactions to drain before terminating?',
    options: [
      { id: 'A', text: 'Add an Auto Scaling Lifecycle Hook for autoscaling:EC2_INSTANCE_TERMINATING with a heartbeat timeout.' },
      { id: 'B', text: 'Disable Auto Scaling scale-in entirely.' },
      { id: 'C', text: 'Increase the EC2 instance CPU size.' },
      { id: 'D', text: 'Switch from Application Load Balancer to Classic Load Balancer.' }
    ],
    correctOptionId: 'A',
    explanation: 'ASG Lifecycle Hooks pause instance lifecycle transitions (such as Terminating:Wait). When an instance is selected for termination, the lifecycle hook transitions the instance to "Terminating:Wait", allowing a custom script or Lambda function to gracefully drain connections and checkpoint data before sending CompleteLifecycleAction.',
    architectureTip: 'Combine ASG Lifecycle Hooks with ALB Connection Draining (Deregistration Delay) to stop routing new requests while allowing in-flight requests to complete.',
    whyWrong: {
      'B': 'Disabling scale-in prevents the fleet from shrinking, leading to massive over-spending during low-traffic periods.',
      'C': 'Increasing instance size does not change termination behavior.',
      'D': 'Classic Load Balancers are legacy and do not solve instance termination synchronization.'
    },
    tags: ['EC2', 'Auto Scaling', 'Lifecycle Hooks', 'Connection Draining', 'Resilience']
  },
  {
    id: 'q-ec2-asg-health-1',
    domain: 'scaling_resilience',
    service: 'EC2',
    difficulty: 'Associate',
    scenario: 'An EC2 instance inside an Auto Scaling group behind an Application Load Balancer (ALB) is experiencing an application thread deadlock. The instance hypervisor is operational (EC2 status checks pass), but the web server returns HTTP 500 errors. Why does the ASG fail to replace the deadlocked instance by default, and how to fix it?',
    options: [
      { id: 'A', text: 'ASG uses EC2 status checks by default; switch the ASG Health Check Type to "ELB" with an appropriate grace period.' },
      { id: 'B', text: 'ALB does not support HTTP 500 error detection.' },
      { id: 'C', text: 'ASG only monitors CPU utilization metrics.' },
      { id: 'D', text: 'Reboot the Application Load Balancer.' }
    ],
    correctOptionId: 'A',
    explanation: 'By default, Auto Scaling Groups only check EC2 status checks (hardware/OS health). If an application process crashes or returns HTTP 500/502/504 errors, the EC2 status check still passes. Changing the ASG health check type to "ELB" instructs the ASG to terminate and replace instances whenever the target group reports them unhealthy.',
    architectureTip: 'Always configure an ELB Health Check Grace Period (e.g. 300 seconds) so new instances have time to boot and start their application before health checks begin.',
    whyWrong: {
      'B': 'ALBs actively evaluate target health based on HTTP response status codes.',
      'C': 'ASG health check evaluates instance and load balancer health, not just CPU.',
      'D': 'ALBs are managed multi-AZ load balancers and cannot be manually rebooted.'
    },
    tags: ['EC2', 'Auto Scaling', 'ELB Health Checks', 'Target Group', 'High Availability']
  },
  {
    id: 'q-ec2-asg-mixed-1',
    domain: 'cost_optimization',
    service: 'EC2',
    difficulty: 'Associate',
    scenario: 'A company wants an EC2 Auto Scaling Group to maintain a minimum baseline of 4 On-Demand instances for steady-state traffic, while handling unpredictable traffic surges using Spot instances across multiple instance types (c5.large, c5a.large, c6g.large) with the lowest interruption probability. How should the ASG be configured?',
    options: [
      { id: 'A', text: 'Configure a Mixed Instances Policy in the ASG with On-Demand Base Capacity=4 and Spot Allocation Strategy="capacity-optimized".' },
      { id: 'B', text: 'Create two separate ASGs and manually adjust desired count using a cron job.' },
      { id: 'C', text: 'Deploy instances in a single Cluster Placement Group.' },
      { id: 'D', text: 'Use EC2 Dedicated Hosts with Spot pricing.' }
    ],
    correctOptionId: 'A',
    explanation: 'A Mixed Instances Policy allows an ASG to combine On-Demand and Spot instances across multiple instance families within a single group. Setting "On-Demand Base Capacity" guarantees baseline stability, while "capacity-optimized" Spot allocation strategy selects Spot pools with the greatest spare capacity to minimize interruptions.',
    architectureTip: 'Always specify multiple instance types in mixed instance policies so Spot Auto Scaling can draw from dozens of distinct capacity pools.',
    whyWrong: {
      'B': 'Managing two separate ASGs with cron scripts is fragile, prone to race conditions, and lacks integrated target group scaling.',
      'C': 'Cluster placement groups optimize for network latency, not instance pricing mixtures.',
      'D': 'Dedicated Hosts do not support Spot pricing.'
    },
    tags: ['EC2', 'Mixed Instances', 'Spot Allocation', 'Cost Optimization', 'ASG']
  },
  {
    id: 'q-ec2-asg-rebalance-1',
    domain: 'scaling_resilience',
    service: 'EC2',
    difficulty: 'Associate',
    scenario: 'An Auto Scaling group is configured across 3 Availability Zones (AZ-a, AZ-b, AZ-c) with 6 instances (2 in each AZ). If AZ-a becomes temporarily unreachable and the instance in AZ-a fails its health check, how does the ASG respond?',
    options: [
      { id: 'A', text: 'The ASG terminates the failed instance and attempts to launch a replacement instance in the remaining healthy Availability Zones (AZ-b or AZ-c) to rebalance the fleet.' },
      { id: 'B', text: 'The ASG terminates all instances across all AZs.' },
      { id: 'C', text: 'The ASG pauses all scaling operations until AZ-a recovers.' },
      { id: 'D', text: 'The ASG converts all instances into Spot instances.' }
    ],
    correctOptionId: 'A',
    explanation: 'EC2 Auto Scaling actively maintains balanced capacity across all configured Availability Zones. If an instance in one AZ becomes unhealthy, the ASG will launch a new instance in an AZ with the fewest instances or healthy capacity, ensuring high availability.',
    architectureTip: 'Always configure ASGs with subnets across at least 3 Availability Zones to handle the complete loss of an entire data center zone.',
    whyWrong: {
      'B': 'The ASG isolates failure to the affected zone and preserves healthy instances.',
      'C': 'Pausing operations would lead to total application downtime if traffic remains high.',
      'D': 'Tenancy and pricing models are defined in the Launch Template and do not change automatically.'
    },
    tags: ['EC2', 'Auto Scaling', 'Multi-AZ', 'Fault Tolerance', 'Rebalancing']
  },
  {
    id: 'q-ec2-eni-1',
    domain: 'security_isolation',
    service: 'EC2',
    difficulty: 'Associate',
    scenario: 'A security appliance running on an EC2 instance needs to separate administrative management traffic from public user application traffic. Administrative traffic must only be accessible from a restricted internal subnet with strict security rules. What network architecture supports this?',
    options: [
      { id: 'A', text: 'Attach two Elastic Network Interfaces (ENIs): eth0 in the public subnet and eth1 in the private management subnet, each with its own Security Group.' },
      { id: 'B', text: 'Assign two Elastic IP addresses to a single ENI.' },
      { id: 'C', text: 'Deploy the instance in two VPCs simultaneously.' },
      { id: 'D', text: 'Use AWS Transit Gateway with no network interfaces.' }
    ],
    correctOptionId: 'A',
    explanation: 'An EC2 instance can have multiple Elastic Network Interfaces (ENIs) attached (dual-homed configuration). Each ENI can reside in a different subnet and be associated with distinct Security Groups, allowing strict isolation between management and public traffic.',
    architectureTip: 'Primary ENIs (eth0) cannot be detached from an instance, but secondary ENIs (eth1+) can be attached or detached on the fly.',
    whyWrong: {
      'B': 'Assigning two IPs to one ENI does not place the traffic in separate subnets or separate Security Groups.',
      'C': 'An EC2 instance cannot belong to two VPCs at the same time; network interfaces must belong to subnets in the same VPC as the instance.',
      'D': 'Transit Gateway connects VPCs; instances still require ENIs to communicate.'
    },
    tags: ['EC2', 'ENI', 'Networking', 'Security Groups', 'Dual-Homed']
  },
  {
    id: 'q-ec2-enhanced-networking-1',
    domain: 'ec2_instances',
    service: 'EC2',
    difficulty: 'Associate',
    scenario: 'A distributed database requires maximum packet per second (PPS) performance with low network jitter and bandwidth up to 100 Gbps. What feature should be verified on the EC2 instances and AMI?',
    options: [
      { id: 'A', text: 'Enhanced Networking using Elastic Network Adapter (ENA) device driver.' },
      { id: 'B', text: 'Classic Network Virtualization interface.' },
      { id: 'C', text: 'EC2 NAT Gateway proxy mode.' },
      { id: 'D', text: 'Software emulation mode in Linux kernel.' }
    ],
    correctOptionId: 'A',
    explanation: 'Enhanced Networking uses single-root I/O virtualization (SR-IOV) to provide high-performance networking capabilities on supported instance types. The Elastic Network Adapter (ENA) driver delivers higher bandwidth, significantly higher packet-per-second performance, and consistently lower latencies.',
    architectureTip: 'For extreme HPC and ML training workloads requiring ultra-low latency inter-node communication, AWS also offers Elastic Fabric Adapter (EFA).',
    whyWrong: {
      'B': 'Classic virtualization uses emulated virtual drivers which cause CPU bottlenecks and high latency.',
      'C': 'NAT Gateway is for outbound internet access from private subnets, not inter-instance network acceleration.',
      'D': 'Software emulation adds CPU overhead and lowers network performance.'
    },
    tags: ['EC2', 'Enhanced Networking', 'ENA', 'EFA', 'High Performance']
  },
  {
    id: 'q-ec2-instance-refresh-1',
    domain: 'scaling_resilience',
    service: 'EC2',
    difficulty: 'Associate',
    scenario: 'A new security patch requires updating the AMI in an Auto Scaling Group consisting of 100 instances. The update must roll out gradually in phases, guaranteeing that at least 80 instances remain healthy and available to serve production traffic at all times. What feature achieves this automated deployment?',
    options: [
      { id: 'A', text: 'Start an ASG Instance Refresh with Minimum Healthy Percentage set to 80% and an appropriate warm-up timer.' },
      { id: 'B', text: 'Terminate all 100 instances simultaneously and let the ASG launch 100 new instances.' },
      { id: 'C', text: 'Manually delete the Launch Template.' },
      { id: 'D', text: 'Switch the ASG Desired Capacity to 0 then back to 100.' }
    ],
    correctOptionId: 'A',
    explanation: 'ASG Instance Refresh automatically performs a rolling update of instances in an Auto Scaling group when a Launch Template or AMI changes. Setting "Minimum Healthy Percentage" to 80% guarantees that no more than 20% of capacity is taken offline at any given time during the rollout.',
    architectureTip: 'Instance Refresh supports automatic rollback if CloudWatch alarms trigger during the deployment phase.',
    whyWrong: {
      'B': 'Terminating all instances simultaneously causes a total outage for users.',
      'C': 'Deleting the Launch Template prevents new instances from launching and breaks the ASG.',
      'D': 'Setting capacity to 0 terminates the entire fleet causing immediate complete downtime.'
    },
    tags: ['EC2', 'Instance Refresh', 'Rolling Update', 'Auto Scaling', 'Zero Downtime']
  },
  {
    id: 'q-ec2-elastic-ip-1',
    domain: 'ec2_instances',
    service: 'EC2',
    difficulty: 'Associate',
    scenario: 'A company hosts a legacy licensed software daemon on a single EC2 instance. External partner firewalls allowlist the public IP address of this instance. If the underlying EC2 instance fails and must be replaced in a disaster recovery scenario, how can the company maintain the same public IP without waiting for DNS propagation?',
    options: [
      { id: 'A', text: 'Allocate an Elastic IP address (EIP) and re-associate it with the replacement EC2 instance network interface.' },
      { id: 'B', text: 'Change the public DNS A record in Route 53 with a 24-hour TTL.' },
      { id: 'C', text: 'Request a new random public IP from AWS Support.' },
      { id: 'D', text: 'Deploy the instance in an AWS Direct Connect location.' }
    ],
    correctOptionId: 'A',
    explanation: 'An Elastic IP address is a static, public IPv4 address designed for dynamic cloud computing. An Elastic IP can be rapidly detached from a failed instance and re-associated with a standby or newly launched replacement instance in the same Region, masking the failure from external clients.',
    architectureTip: 'Elastic IPs are free when attached to a running instance, but incur a small hourly charge if allocated and unattached or attached to a stopped instance.',
    whyWrong: {
      'B': 'Changing DNS records relies on client DNS caches honoring TTLs, causing delays of minutes or hours.',
      'C': 'Standard public IPs are dynamic and released when an instance is stopped or terminated; AWS Support cannot assign a specific random public IP.',
      'D': 'Direct Connect is a dedicated private fiber connection, not a public IP failover mechanism.'
    },
    tags: ['EC2', 'Elastic IP', 'Failover', 'Disaster Recovery', 'Networking']
  },

  // ===================== AWS LAMBDA SERVERLESS =====================
  {
    id: 'q-lam-limits-1',
    domain: 'lambda_serverless',
    service: 'Lambda',
    difficulty: 'Associate',
    scenario: 'A data processing workflow executes a heavy video transcoding script that takes approximately 35 minutes to complete. The developer attempts to run this on AWS Lambda, but the execution consistently fails. Why does it fail and what is the recommended serverless architecture?',
    options: [
      { id: 'A', text: 'Lambda has a hard maximum timeout limit of 15 minutes (900 seconds); migrate the task to AWS Fargate or orchestrate sub-tasks using AWS Step Functions.' },
      { id: 'B', text: 'Lambda functions cannot process video formats.' },
      { id: 'C', text: 'The developer forgot to enable Lambda Multi-AZ mode.' },
      { id: 'D', text: 'Lambda requires an attached RDS database to run longer than 5 minutes.' }
    ],
    correctOptionId: 'A',
    explanation: 'AWS Lambda enforces a strict, non-configurable maximum execution timeout of 15 minutes per invocation. Long-running batch jobs, video transcoding, or continuous polling jobs that exceed 15 minutes should be run on containerized services like AWS Fargate, AWS Batch, or broken down via AWS Step Functions.',
    architectureTip: 'If a workflow can be parallelized, use Step Functions Distributed Map to invoke hundreds of 1-minute Lambda workers simultaneously.',
    whyWrong: {
      'B': 'Lambda can process any binary data or video with appropriate libraries (e.g. FFmpeg in a Lambda Layer) if it finishes within 15 minutes.',
      'C': 'Lambda is inherently Multi-AZ and managed by AWS.',
      'D': 'RDS has no connection to Lambda invocation timeout limits.'
    },
    tags: ['Lambda', 'Timeout Limits', 'Step Functions', 'Fargate', 'Architecture']
  },
  {
    id: 'q-lam-memory-1',
    domain: 'lambda_serverless',
    service: 'Lambda',
    difficulty: 'Associate',
    scenario: 'A developer has a CPU-intensive scientific computation function deployed on AWS Lambda allocated with 512 MB of memory. The function takes 45 seconds to complete. The developer needs to reduce execution time down to under 5 seconds without altering the underlying code. How can this be accomplished?',
    options: [
      { id: 'A', text: 'Increase the allocated memory up to 10,240 MB (10 GB); AWS Lambda allocates CPU power and network bandwidth proportionally to memory.' },
      { id: 'B', text: 'Change the function timeout from 15 minutes to 1 minute.' },
      { id: 'C', text: 'Attach an EBS io2 volume to the Lambda function.' },
      { id: 'D', text: 'Migrate the function to AWS S3 Glacier.' }
    ],
    correctOptionId: 'A',
    explanation: 'In AWS Lambda, CPU power is proportional to memory allocation. At 1,769 MB of RAM, a Lambda function receives the equivalent of 1 full dedicated vCPU. At 10,240 MB (10 GB), it receives 6 dedicated vCPUs with proportional memory bus bandwidth, speeding up multi-threaded CPU-bound calculations dramatically.',
    architectureTip: 'Use the open-source AWS Lambda Power Tuning tool (state machine) to benchmark your function across memory configurations and find the optimal price-performance sweet spot.',
    whyWrong: {
      'B': 'Changing the timeout threshold only changes when Lambda kills long-running invocations; it does not accelerate CPU execution speed.',
      'C': 'Lambda cannot attach EBS block volumes directly (only EFS network file systems).',
      'D': 'S3 Glacier is an archival storage tier, not a compute execution runtime.'
    },
    tags: ['Lambda', 'Memory Allocation', 'vCPU Scaling', 'Performance Tuning']
  },
  {
    id: 'q-lam-coldstart-1',
    domain: 'lambda_serverless',
    service: 'Lambda',
    difficulty: 'Associate',
    scenario: 'An online ticketing platform experiences latency spikes (p99 latency > 2500ms) during flash sales when thousands of users hit their serverless checkout API simultaneously. Investigation reveals that the spikes are caused by initialization code and JVM startup overhead on newly spawned Lambda containers. What feature eliminates this cold start latency?',
    options: [
      { id: 'A', text: 'Configure Provisioned Concurrency for the Lambda function and alias.' },
      { id: 'B', text: 'Set Reserved Concurrency to 0.' },
      { id: 'C', text: 'Switch from API Gateway to CloudFront without Lambda.' },
      { id: 'D', text: 'Increase S3 bucket replication.' }
    ],
    correctOptionId: 'A',
    explanation: 'Provisioned Concurrency initializes a requested number of execution environments in advance (downloading code, initializing runtime, running global scope initialization). When invocations arrive, pre-warmed environments respond instantly with double-digit millisecond latency, eliminating cold starts.',
    architectureTip: 'Use Application Auto Scaling with Provisioned Concurrency on a scheduled or target-tracking basis to ramp up capacity right before scheduled flash sales.',
    whyWrong: {
      'B': 'Setting Reserved Concurrency to 0 throttles and rejects all incoming invocations, acting as a complete shutdown.',
      'C': 'CloudFront caches static assets but cannot replace dynamic transaction checkout logic.',
      'D': 'S3 replication has no impact on Lambda container initialization.'
    },
    tags: ['Lambda', 'Provisioned Concurrency', 'Cold Starts', 'Low Latency', 'Auto Scaling']
  },
  {
    id: 'q-lam-reserved-1',
    domain: 'scaling_resilience',
    service: 'Lambda',
    difficulty: 'Associate',
    scenario: 'A serverless API triggers a Lambda function that queries a relational Amazon RDS database. During traffic spikes, Lambda scales to 1,000 concurrent executions, which exhausts the RDS database connection pool and crashes the database. How can the architect protect the database while still processing requests?',
    options: [
      { id: 'A', text: 'Set a Reserved Concurrency limit on the Lambda function and deploy Amazon RDS Proxy to pool database connections.' },
      { id: 'B', text: 'Delete the Lambda execution role.' },
      { id: 'C', text: 'Increase Lambda timeout to 15 minutes.' },
      { id: 'D', text: 'Place the Lambda function in a public subnet without a NAT gateway.' }
    ],
    correctOptionId: 'A',
    explanation: 'Reserved Concurrency sets a maximum concurrency ceiling for a function, ensuring it cannot scale beyond a designated number of concurrent executions (protecting downstream databases). Combining this with Amazon RDS Proxy allows hundreds of Lambda containers to share and reuse a pooled set of database connections.',
    architectureTip: 'Reserved Concurrency serves a dual purpose: it guarantees dedicated execution capacity from the account pool AND sets an upper throttle limit.',
    whyWrong: {
      'B': 'Deleting the execution role prevents Lambda from executing at all.',
      'C': 'Increasing timeout causes connections to be held longer, worsening connection pool exhaustion.',
      'D': 'Lambda in a public subnet cannot connect to the internet or reach private RDS instances without appropriate VPC ENIs and routes.'
    },
    tags: ['Lambda', 'Reserved Concurrency', 'RDS Proxy', 'Connection Pooling', 'Resilience']
  },
  {
    id: 'q-lam-sqs-dlq-1',
    domain: 'lambda_serverless',
    service: 'Lambda',
    difficulty: 'Associate',
    scenario: 'An Amazon SQS standard queue is configured as an event source for an AWS Lambda function with a batch size of 10. A corrupted message in the queue causes the Lambda function to throw an unhandled exception every time it is processed. This blocks the queue from processing other messages. How should this be resolved?',
    options: [
      { id: 'A', text: 'Configure a Dead Letter Queue (DLQ) on the source SQS queue with a maxReceiveCount threshold.' },
      { id: 'B', text: 'Increase the SQS message retention period to 14 days.' },
      { id: 'C', text: 'Disable Lambda execution logging.' },
      { id: 'D', text: 'Change SQS queue to S3 Glacier.' }
    ],
    correctOptionId: 'A',
    explanation: 'When Lambda fails to process an SQS message, the message becomes visible again in the queue after the Visibility Timeout. If it fails repeatedly, setting a maxReceiveCount (e.g. 3) on the source SQS queue will automatically divert the "poison pill" message to an SQS Dead Letter Queue (DLQ) so normal traffic can resume.',
    architectureTip: 'Set the source SQS Visibility Timeout to at least 6 times the Lambda function timeout to prevent race conditions during retry attempts.',
    whyWrong: {
      'B': 'Increasing retention period keeps the bad message in the queue longer, compounding the blocking problem.',
      'C': 'Disabling logging prevents diagnosing the root cause of the crash.',
      'D': 'S3 Glacier is archival storage and does not act as a message queue.'
    },
    tags: ['Lambda', 'SQS', 'Dead Letter Queue', 'Event Source Mapping', 'Error Handling']
  },
  {
    id: 'q-lam-sqs-partial-1',
    domain: 'lambda_serverless',
    service: 'Lambda',
    difficulty: 'Associate',
    scenario: 'A Lambda function processes batches of 50 messages from an Amazon SQS queue. If message #27 fails due to invalid JSON formatting, the function throws an error, causing SQS to retry all 50 messages, leading to duplicate processing of the 49 valid messages. How can the function report only the single failed message back to SQS?',
    options: [
      { id: 'A', text: 'Enable "ReportBatchItemFailures" in the Lambda Event Source Mapping and return the failed message ID in batchItemFailures: [{ itemIdentifier: "msg-27" }].' },
      { id: 'B', text: 'Set SQS Batch Size to 1.' },
      { id: 'C', text: 'Delete the SQS queue and recreate it as FIFO.' },
      { id: 'D', text: 'Configure SNS topic fan-out.' }
    ],
    correctOptionId: 'A',
    explanation: 'With "ReportBatchItemFailures" enabled on the event source mapping, Lambda allows the code to catch errors on individual items in a batch and return an array of failed message IDs. SQS will only re-queue and retry the failed item, while automatically acknowledging and deleting all successful items.',
    architectureTip: 'This pattern drastically reduces duplicate message processing and saves compute costs compared to reprocessing entire batches.',
    whyWrong: {
      'B': 'Setting batch size to 1 increases API polling overhead and reduces throughput by 50x.',
      'C': 'FIFO queues enforce ordering; a failed message will still block the message group without partial batch reporting.',
      'D': 'SNS fan-out does not solve individual item failure acknowledgment in SQS batches.'
    },
    tags: ['Lambda', 'SQS', 'ReportBatchItemFailures', 'Partial Batch', 'Idempotency']
  },
  {
    id: 'q-lam-async-retry-1',
    domain: 'lambda_serverless',
    service: 'Lambda',
    difficulty: 'Associate',
    scenario: 'An Amazon S3 bucket event asynchronously invokes an AWS Lambda function whenever a new PDF invoice is uploaded. If the Lambda function encounters an internal processing error, what is the default retry behavior of asynchronous Lambda invocations?',
    options: [
      { id: 'A', text: 'Lambda automatically retries the invocation 2 additional times with exponential backoff (3 attempts total) before discarding or routing to a Destination/DLQ.' },
      { id: 'B', text: 'Lambda retries indefinitely until manual intervention.' },
      { id: 'C', text: 'Lambda does not retry and discards the event immediately.' },
      { id: 'D', text: 'Lambda reboots the S3 bucket.' }
    ],
    correctOptionId: 'A',
    explanation: 'For asynchronous invocations (e.g. S3 events, SNS, EventBridge), AWS Lambda automatically queues the event and retries failed invocations up to 2 times by default (with delay intervals). You can configure maximum retry attempts (0-2) and Maximum Age of Event (up to 6 hours), and configure on-failure Destinations.',
    architectureTip: 'Always configure Lambda Destinations on-failure (pointing to Amazon SQS, SNS, or EventBridge) to capture asynchronous failure payloads for auditing.',
    whyWrong: {
      'B': 'Lambda never retries infinitely for asynchronous events; it stops after 2 retries to prevent unbounded cost.',
      'C': 'Synchronous invocations return errors directly to the caller without automatic retries, but asynchronous invocations do retry.',
      'D': 'S3 buckets are managed storage objects that cannot be rebooted.'
    },
    tags: ['Lambda', 'Asynchronous Invocation', 'Retries', 'Destinations', 'S3 Events']
  },
  {
    id: 'q-lam-vpc-hyperplane-1',
    domain: 'lambda_serverless',
    service: 'Lambda',
    difficulty: 'Associate',
    scenario: 'Historically, placing AWS Lambda functions inside an Amazon VPC caused severe cold-start delays (10-30 seconds) and exhausted private subnet IP addresses due to ENI provisioning per container. How does AWS Lambda handle VPC networking today?',
    options: [
      { id: 'A', text: 'AWS uses AWS Hyperplane to create shared Elastic Network Interfaces (ENIs) per Security Group/Subnet combination, enabling instant sub-second ENI attachment across thousands of Lambda instances without IP exhaustion.' },
      { id: 'B', text: 'Lambda functions in VPCs now bypass VPC security groups entirely.' },
      { id: 'C', text: 'Lambda runs directly on EC2 dedicated host hypervisors.' },
      { id: 'D', text: 'Lambda requires public IPv4 addresses for every container.' }
    ],
    correctOptionId: 'A',
    explanation: 'AWS revamped Lambda VPC networking using AWS Hyperplane (the same virtualization platform powering NAT Gateways and NLBs). Lambda creates shared, pre-provisioned Hyperplane ENIs for each unique subnet and security group combination, providing dual benefits: sub-second cold starts and minimal IP address consumption.',
    architectureTip: 'To give a Lambda function in a VPC access to the internet (e.g. to call external SaaS APIs), route its subnet through a NAT Gateway in a public subnet.',
    whyWrong: {
      'B': 'Lambda functions in a VPC strictly adhere to Security Group rules assigned to the function.',
      'C': 'Lambda runs on managed microVMs (Firecracker), not user dedicated hosts.',
      'D': 'Lambda in a VPC uses private IP addresses within your designated private subnets.'
    },
    tags: ['Lambda', 'VPC Networking', 'Hyperplane', 'ENI', 'Cold Starts']
  },
  {
    id: 'q-lam-tmp-storage-1',
    domain: 'lambda_serverless',
    service: 'Lambda',
    difficulty: 'Associate',
    scenario: 'A serverless media manipulation Lambda function needs to unpack, transcode, and package an 8 GB uncompressed video archive temporarily before uploading the finished file to S3. What storage configuration within Lambda supports this?',
    options: [
      { id: 'A', text: 'Configure the Lambda Ephemeral Storage (/tmp) capacity up to 10,240 MB (10 GB).' },
      { id: 'B', text: 'Attach an AWS Snowball device to the Lambda function.' },
      { id: 'C', text: 'Store the video in Lambda execution role metadata tags.' },
      { id: 'D', text: 'Stream the video through Amazon Route 53.' }
    ],
    correctOptionId: 'A',
    explanation: 'AWS Lambda allows configuring ephemeral scratchpad storage (/tmp directory) between 512 MB and 10,240 MB (10 GB). This is ideal for unpacking large zip files, training lightweight machine learning models, or processing large media assets locally.',
    architectureTip: 'If your application requires persistent shared file storage across multiple Lambda invocations or concurrent functions, attach Amazon EFS to Lambda instead.',
    whyWrong: {
      'B': 'AWS Snowball is a physical appliance for offline petabyte data migration, not an ephemeral Lambda attachment.',
      'C': 'IAM role tags have a limit of 256 characters per tag, which cannot hold binary files.',
      'D': 'Route 53 is a DNS service and cannot transport or store video data.'
    },
    tags: ['Lambda', 'Ephemeral Storage', 'tmp', 'Media Processing', 'Storage']
  },
  {
    id: 'q-lam-snapstart-1',
    domain: 'lambda_serverless',
    service: 'Lambda',
    difficulty: 'Associate',
    scenario: 'A Java-based Spring Boot microservice running on AWS Lambda experiences cold start latencies of 6-8 seconds due to classpath scanning, framework dependency injection, and JIT compilation. What native AWS Lambda feature provides sub-second startup for Java functions with zero code changes?',
    options: [
      { id: 'A', text: 'AWS Lambda SnapStart (creates Firecracker microVM memory and disk snapshots upon publishing a version).' },
      { id: 'B', text: 'AWS CodeDeploy Blue/Green Deployments.' },
      { id: 'C', text: 'Lambda Edge Token Authentication.' },
      { id: 'D', text: 'Amazon RDS Aurora Serverless v2.' }
    ],
    correctOptionId: 'A',
    explanation: 'AWS Lambda SnapStart for Java initializes the function code ahead of time when you publish a function version, takes an encrypted snapshot of the memory and disk state of the initialized Firecracker microVM, and caches it. When invoked, Lambda resumes execution from the cached snapshot in under 200ms.',
    architectureTip: 'When using SnapStart, ensure your code does not maintain unique ephemeral state (such as unique pseudo-random numbers or temporary credentials) across snapshot restorations without using CRaC (Coordinated Restore at Checkpoint) hooks.',
    whyWrong: {
      'B': 'CodeDeploy manages deployment traffic shifting; it does not accelerate Java JVM initialization.',
      'C': 'Lambda@Edge runs lightweight JS at CloudFront edge locations, not Java SnapStart.',
      'D': 'Aurora Serverless v2 is a relational database and does not affect Java JVM startup.'
    },
    tags: ['Lambda', 'SnapStart', 'Java', 'Cold Starts', 'Firecracker']
  },
  {
    id: 'q-lam-layers-1',
    domain: 'lambda_serverless',
    service: 'Lambda',
    difficulty: 'Associate',
    scenario: 'A team maintains 25 distinct Python Lambda microservices that all require the same 120 MB bundle of dependencies (NumPy, SciPy, custom company authentication SDK). The team is frustrated by large zip deployments for every minor code fix. What feature simplifies dependency management?',
    options: [
      { id: 'A', text: 'Package the shared libraries into an AWS Lambda Layer and attach the layer to all 25 functions.' },
      { id: 'B', text: 'Check in the dependencies directly into Amazon S3 Glacier.' },
      { id: 'C', text: 'Hardcode the Python bytecode directly into environment variables.' },
      { id: 'D', text: 'Store the dependencies inside DynamoDB item attributes.' }
    ],
    correctOptionId: 'A',
    explanation: 'AWS Lambda Layers let you pull additional code, libraries, custom runtimes, or configuration files into your function execution environment. A function can attach up to 5 layers (subject to the total unzipped deployment package size limit of 250 MB). This keeps deployment zip files tiny and promotes code reuse.',
    architectureTip: 'Lambda Layers can be shared across AWS accounts or made public to distribute common tooling across an entire organization.',
    whyWrong: {
      'B': 'S3 Glacier retrieval takes minutes/hours, which cannot be loaded dynamically at Lambda execution time.',
      'C': 'Environment variables have a 4 KB total size limit, which cannot hold 120 MB of compiled C/Python libraries.',
      'D': 'DynamoDB item size limit is 400 KB, insufficient for 120 MB libraries.'
    },
    tags: ['Lambda', 'Lambda Layers', 'Code Reuse', 'Deployment Packages', 'Python']
  },
  {
    id: 'q-lam-function-url-1',
    domain: 'cost_optimization',
    service: 'Lambda',
    difficulty: 'Associate',
    scenario: 'A developer needs to expose a simple HTTPS webhook endpoint for an internal third-party payment notification system directly to a Lambda function. The webhook receives sporadic traffic (a few dozen requests per day) and does not require API caching, request throttling, or swagger schemas. What is the most cost-effective solution?',
    options: [
      { id: 'A', text: 'Create a Lambda Function URL with AWS_IAM or NONE authentication.' },
      { id: 'B', text: 'Deploy an Application Load Balancer with a Dedicated WAF.' },
      { id: 'C', text: 'Deploy an Amazon API Gateway REST API with dedicated Cache.' },
      { id: 'D', text: 'Run an EC2 instance with Nginx reverse proxy.' }
    ],
    correctOptionId: 'A',
    explanation: 'Lambda Function URLs provide a dedicated, built-in HTTPS endpoint for your Lambda function with zero additional cost (you pay only for standard Lambda compute and data transfer). It eliminates the base costs and configuration overhead of API Gateway or ALBs for simple webhooks or microservices.',
    architectureTip: 'Function URLs support CORS configuration and custom authentication via AWS_IAM (SigV4 signing) or NONE (public webhooks with secret token validation in code).',
    whyWrong: {
      'B': 'ALB costs ~$16-20/month plus data processing charges, which is expensive for a low-volume sporadic webhook.',
      'C': 'API Gateway REST API with cache carries unnecessary fixed hourly costs for low-frequency webhooks.',
      'D': 'EC2 requires 24/7 running server costs, OS patching, and management overhead.'
    },
    tags: ['Lambda', 'Function URLs', 'Cost Optimization', 'Webhooks', 'Serverless']
  },
  {
    id: 'q-lam-kms-env-1',
    domain: 'security_isolation',
    service: 'Lambda',
    difficulty: 'Associate',
    scenario: 'A company compliance rule requires that sensitive database connection strings in Lambda environment variables must be encrypted at rest using a customer-managed AWS KMS key (CMK) and decrypted at runtime with fine-grained IAM authorization. How should this be implemented?',
    options: [
      { id: 'A', text: 'Enable Lambda Environment Variable Encryption Helpers with a KMS Customer Managed Key and grant the Lambda execution role kms:Decrypt permissions.' },
      { id: 'B', text: 'Base64 encode the string in plaintext.' },
      { id: 'C', text: 'Store the password in the Lambda function name.' },
      { id: 'D', text: 'Disable KMS and store credentials in CloudWatch log groups.' }
    ],
    correctOptionId: 'A',
    explanation: 'By default, Lambda encrypts environment variables using an AWS-managed KMS key. To comply with customer-managed key policies, configure Lambda Encryption Helpers with a custom KMS key and ensure the Lambda execution role has the kms:Decrypt permission for that specific key ARN.',
    architectureTip: 'For even higher security, retrieve credentials dynamically at startup from AWS Secrets Manager or AWS Systems Manager Parameter Store with automatic credential rotation.',
    whyWrong: {
      'B': 'Base64 is an encoding format, NOT encryption; anyone can trivially decode it in milliseconds.',
      'C': 'Function names are plaintext strings visible in console, logs, and billing reports.',
      'D': 'CloudWatch log groups are for application logs, not secret credential vaults.'
    },
    tags: ['Lambda', 'KMS', 'Environment Variables', 'Encryption', 'Security']
  },
  {
    id: 'q-lam-dynamo-stream-1',
    domain: 'lambda_serverless',
    service: 'Lambda',
    difficulty: 'Associate',
    scenario: 'An accounting system requires generating an immutable audit trail entry in an S3 data lake whenever a customer record in an Amazon DynamoDB table is created, modified, or deleted. What event-driven architecture handles this reliably in real time?',
    options: [
      { id: 'A', text: 'Enable DynamoDB Streams on the table and configure a Lambda Event Source Mapping to process shard records.' },
      { id: 'B', text: 'Run a cron job on an EC2 instance that runs DynamoDB Scan every 5 minutes.' },
      { id: 'C', text: 'Configure S3 Lifecycle policies on DynamoDB.' },
      { id: 'D', text: 'Use AWS CloudTrail data events to write directly to DynamoDB.' }
    ],
    correctOptionId: 'A',
    explanation: 'DynamoDB Streams captures a time-ordered sequence of item-level modifications in any DynamoDB table (New Image, Old Image, Keys Only). Creating a Lambda event source mapping polls stream shards and triggers Lambda with batches of change records, providing real-time event-driven audit logging.',
    architectureTip: 'Configure the stream view type as "NEW_AND_OLD_IMAGES" if you need to compare before-and-after values of modified attributes.',
    whyWrong: {
      'B': 'Running periodic DynamoDB scans is expensive, causes high read capacity unit consumption, and misses intermediate updates.',
      'C': 'S3 Lifecycle policies apply to S3 objects, not DynamoDB table items.',
      'D': 'CloudTrail captures management API calls, not item-level DynamoDB table modifications.'
    },
    tags: ['Lambda', 'DynamoDB Streams', 'Event-Driven', 'Audit Logging', 'Architecture']
  },
  {
    id: 'q-lam-s3-recursion-1',
    domain: 'security_isolation',
    service: 'Lambda',
    difficulty: 'Associate',
    scenario: 'A developer creates an S3 event notification on bucket "media-uploads" for "s3:ObjectCreated:*" that triggers a Lambda function to watermark images. The Lambda function watermarks the image and uploads the output file back into the same "media-uploads" bucket. What catastrophic bug occurs and how is it prevented?',
    options: [
      { id: 'A', text: 'Infinite recursion loop leading to thousands of recursive invocations and massive billing charges; fix by writing outputs to a separate destination bucket or using distinct prefix/suffix filters (e.g. /output/).' },
      { id: 'B', text: 'S3 automatically rejects the file.' },
      { id: 'C', text: 'Lambda deletes the S3 bucket.' },
      { id: 'D', text: 'The image will lose all resolution.' }
    ],
    correctOptionId: 'A',
    explanation: 'When Lambda writes an output file to the same S3 bucket matching the event notification trigger, S3 generates another ObjectCreated event, triggering Lambda again in an infinite recursive loop that can quickly exhaust concurrency limits and generate thousands of dollars in unwanted compute fees.',
    architectureTip: 'AWS Lambda recently added automatic Recursive Loop Detection for S3 and SQS that throttles functions after 16 recursive invocations.',
    whyWrong: {
      'B': 'S3 accepts the upload normally and triggers the event again.',
      'C': 'Lambda has no authority to delete S3 buckets unless explicitly coded and granted s3:DeleteBucket.',
      'D': 'The issue is architectural infinite recursion, not image resolution.'
    },
    tags: ['Lambda', 'S3 Events', 'Recursion Loop', 'Cost Protection', 'Architecture Gotchas']
  },
  {
    id: 'q-lam-stepfunctions-express-1',
    domain: 'cost_optimization',
    service: 'Lambda',
    difficulty: 'Associate',
    scenario: 'A fintech platform processes 5,000 synchronous payment authorization requests per second. Each payment requires validating fraud rules across 3 Lambda functions and returning an approve/deny response in under 200ms. Which orchestration engine meets the ultra-high throughput and cost efficiency requirements?',
    options: [
      { id: 'A', text: 'AWS Step Functions Express Workflows (Synchronous mode).' },
      { id: 'B', text: 'AWS Step Functions Standard Workflows.' },
      { id: 'C', text: 'AWS Simple Workflow Service (SWF).' },
      { id: 'D', text: 'Amazon EC2 Cron daemons.' }
    ],
    correctOptionId: 'A',
    explanation: 'Step Functions Express Workflows are purpose-built for high-volume, event-processing workloads supporting over 100,000 executions per second with durations up to 5 minutes. Synchronous Express Workflows allow calling the state machine directly from an API and waiting for the completed response.',
    architectureTip: 'Standard Workflows charge per state transition and are designed for long-running audit-heavy workflows (up to 1 year); Express Workflows charge per execution duration and memory consumed, making them dramatically cheaper for high-TPS microservices.',
    whyWrong: {
      'B': 'Standard Workflows have a limit of 2,000 execution starts per second and cost significantly more at 5,000 TPS.',
      'C': 'SWF is a legacy workflow service requiring self-managed EC2 decider workers.',
      'D': 'Cron daemons run on time schedules (e.g. every minute) and cannot handle synchronous real-time sub-second payment routing.'
    },
    tags: ['Lambda', 'Step Functions', 'Express Workflows', 'High Throughput', 'Cost Optimization']
  },

  // ===================== ECS & FARGATE CONTAINERS =====================
  {
    id: 'q-ecs-fargate-vs-ec2-1',
    domain: 'ecs_fargate',
    service: 'ECS',
    difficulty: 'Associate',
    scenario: 'A microservices team wants to containerize 40 Node.js microservices using Amazon ECS. The team has zero dedicated infrastructure engineers and requires a solution with no EC2 host instance provisioning, zero OS security patching, and billing strictly based on the exact vCPU and memory allocated to running tasks. Which launch type should they choose?',
    options: [
      { id: 'A', text: 'AWS Fargate launch type' },
      { id: 'B', text: 'ECS EC2 launch type' },
      { id: 'C', text: 'Amazon EC2 Dedicated Hosts' },
      { id: 'D', text: 'AWS Outposts' }
    ],
    correctOptionId: 'A',
    explanation: 'AWS Fargate is a serverless compute engine for Amazon ECS that removes the need to provision, configure, or scale virtual machines. AWS handles server infrastructure, OS patching, and kernel security. You package applications into containers, specify CPU/memory requirements in task definitions, and pay only for running resources.',
    architectureTip: 'Use Fargate Spot for non-critical or fault-tolerant background tasks to reduce container compute costs by up to 70%.',
    whyWrong: {
      'B': 'The EC2 launch type requires customers to manage, patch, update, and scale the underlying EC2 cluster instances and Docker daemons.',
      'C': 'Dedicated Hosts are for dedicated physical hardware and compliance licensing, requiring maximum infrastructure management.',
      'D': 'AWS Outposts runs AWS infrastructure on-premises in a physical customer data center.'
    },
    tags: ['ECS', 'Fargate', 'Serverless Containers', 'Operational Excellence']
  },
  {
    id: 'q-ecs-task-role-1',
    domain: 'security_isolation',
    service: 'ECS',
    difficulty: 'Associate',
    scenario: 'A containerized Java application running inside an Amazon ECS task definition needs to upload generated PDF reports to an Amazon S3 bucket. Where should the IAM permissions allowing "s3:PutObject" be attached?',
    options: [
      { id: 'A', text: 'In the ECS Task Role specified in the task definition.' },
      { id: 'B', text: 'In the ECS Task Execution Role.' },
      { id: 'C', text: 'Hardcoded in an AWS credentials file inside the Docker container image.' },
      { id: 'D', text: 'In the EC2 instance profile of the underlying host.' }
    ],
    correctOptionId: 'A',
    explanation: 'The ECS Task Role is the IAM role assumed directly by the application code running inside the containers of that task. It governs permissions for AWS API calls made by the application (such as s3:PutObject, dynamodb:GetItem, sqs:SendMessage).',
    architectureTip: 'Never share a single IAM role across all containers; use fine-grained Task Roles for each distinct ECS service definition to follow the principle of least privilege.',
    whyWrong: {
      'B': 'The Task Execution Role is used by the ECS container agent (to pull private ECR images, stream logs to CloudWatch, retrieve secrets from SSM/Secrets Manager).',
      'C': 'Hardcoding IAM credentials inside container images is a severe security vulnerability that exposes keys to anyone with image read access.',
      'D': 'Using the host instance profile grants permissions to all tasks running on that host, violating security isolation.'
    },
    tags: ['ECS', 'Task Role', 'IAM', 'Security', 'Least Privilege']
  },
  {
    id: 'q-ecs-task-exec-role-1',
    domain: 'security_isolation',
    service: 'ECS',
    difficulty: 'Associate',
    scenario: 'An ECS task fails to launch with the error "CannotPullContainerError: AccessDeniedException: User is not authorized to perform: ecr:GetAuthorizationToken on resource: *". The developer confirmed the application container code has no IAM permissions yet. Which IAM role is missing or misconfigured?',
    options: [
      { id: 'A', text: 'The ECS Task Execution Role (must have AmazonECSTaskExecutionRolePolicy attached).' },
      { id: 'B', text: 'The ECS Task Role.' },
      { id: 'C', text: 'The S3 Bucket Policy.' },
      { id: 'D', text: 'The VPC Route Table.' }
    ],
    correctOptionId: 'A',
    explanation: 'The ECS Task Execution Role grants the ECS container agent permission to make AWS API calls on your behalf before the container starts. This includes authenticating with Amazon ECR to pull private images (ecr:GetAuthorizationToken, ecr:BatchGetImage) and shipping logs to CloudWatch Logs (logs:CreateLogStream, logs:PutLogEvents).',
    architectureTip: 'AWS provides a managed IAM policy named "AmazonECSTaskExecutionRolePolicy" that includes all necessary permissions for standard task startup and logging.',
    whyWrong: {
      'B': 'The Task Role is for the application inside the container, which is only used after the image is pulled and started.',
      'C': 'S3 bucket policies govern S3 access, not ECR image registry authentication.',
      'D': 'VPC route tables handle IP routing, not IAM authorization permissions.'
    },
    tags: ['ECS', 'Task Execution Role', 'ECR', 'IAM', 'Debugging']
  },
  {
    id: 'q-ecs-network-awsvpc-1',
    domain: 'ecs_fargate',
    service: 'ECS',
    difficulty: 'Associate',
    scenario: 'A financial compliance auditor requires that every microservice container running in Amazon ECS must have its own dedicated private IP address within the VPC, its own Elastic Network Interface (ENI), and individual Security Group firewall rules. Which ECS network mode is required?',
    options: [
      { id: 'A', text: 'awsvpc network mode' },
      { id: 'B', text: 'bridge network mode' },
      { id: 'C', text: 'host network mode' },
      { id: 'D', text: 'none network mode' }
    ],
    correctOptionId: 'A',
    explanation: 'In "awsvpc" mode, ECS allocates a dedicated Elastic Network Interface (ENI) and a distinct private IPv4 address to every task from the VPC subnet. Tasks can be assigned their own Security Groups and have full VPC networking parity. Note: "awsvpc" is the only network mode supported on AWS Fargate.',
    architectureTip: 'In awsvpc mode, container ports map directly 1:1 to the host interface without port translation (hostPort must equal containerPort or be left blank).',
    whyWrong: {
      'B': 'Bridge mode uses Docker virtual network bridge and port mapping on the host EC2 instance, sharing the host ENI and Security Group.',
      'C': 'Host mode maps container ports directly to the host EC2 network interface, preventing two tasks on the same host from binding to the same port.',
      'D': 'None mode completely disables external networking for the container.'
    },
    tags: ['ECS', 'awsvpc', 'Container Networking', 'Security Groups', 'Fargate']
  },
  {
    id: 'q-ecs-efs-mount-1',
    domain: 'ecs_fargate',
    service: 'ECS',
    difficulty: 'Associate',
    scenario: 'A legacy content management system (WordPress) is migrated to AWS Fargate. Multiple Fargate tasks running across multiple Availability Zones must concurrently read and write to a shared persistent POSIX file system for uploaded media assets. What storage integration should be configured?',
    options: [
      { id: 'A', text: 'Mount an Amazon EFS (Elastic File System) volume with Access Points directly in the ECS Task Definition.' },
      { id: 'B', text: 'Attach an EBS gp3 volume in Multi-Attach mode.' },
      { id: 'C', text: 'Use EC2 Instance Store NVMe.' },
      { id: 'D', text: 'Mount an Amazon S3 bucket via FTP.' }
    ],
    correctOptionId: 'A',
    explanation: 'Amazon ECS on AWS Fargate supports natively mounting Amazon EFS file systems. EFS provides a fully managed, serverless, Multi-AZ POSIX network file system that can be mounted concurrently by thousands of Fargate tasks across different AZs.',
    architectureTip: 'Use EFS Access Points to enforce POSIX user identity (UID/GID) and restrict container file access to specific application subdirectories.',
    whyWrong: {
      'B': 'EBS volumes cannot be attached to AWS Fargate tasks; Multi-Attach io2 is single-AZ only and requires cluster-aware filesystems.',
      'C': 'Instance Store is physically attached to EC2 instances and unavailable on serverless Fargate.',
      'D': 'S3 is an object store REST API, not a POSIX filesystem, and FTP is not an AWS container storage mount mechanism.'
    },
    tags: ['ECS', 'Fargate', 'EFS', 'Shared Storage', 'Multi-AZ']
  },
  {
    id: 'q-ecs-placement-binpack-1',
    domain: 'cost_optimization',
    service: 'ECS',
    difficulty: 'Associate',
    scenario: 'A DevOps engineer runs an Amazon ECS cluster on an EC2 launch type with 20 host instances. The engineer notices that tasks are scattered across all instances with low utilization, preventing the cluster Auto Scaling Group from scaling in instances to save costs. Which task placement strategy consolidates tasks onto the fewest possible EC2 instances?',
    options: [
      { id: 'A', text: 'Task Placement Strategy: binpack (based on memory or cpu)' },
      { id: 'B', text: 'Task Placement Strategy: spread (based on instanceId)' },
      { id: 'C', text: 'Task Placement Strategy: random' },
      { id: 'D', text: 'Task Placement Constraint: distinctInstance' }
    ],
    correctOptionId: 'A',
    explanation: 'The "binpack" placement strategy places tasks on container instances with the least available amount of CPU or memory. This densely packs tasks onto the minimum number of EC2 instances, leaving unused instances completely empty so the Auto Scaling group can scale them down.',
    architectureTip: 'For production workloads balancing resilience and cost, you can combine strategies: e.g. Spread across Availability Zones, then Binpack by memory within each zone.',
    whyWrong: {
      'B': 'Spread distributes tasks evenly across instances, which prevents instances from becoming idle for scale-in.',
      'C': 'Random places tasks arbitrarily with no cost optimization logic.',
      'D': 'distinctInstance is a constraint ensuring no two tasks run on the same instance, forcing high instance counts.'
    },
    tags: ['ECS', 'Binpack', 'Task Placement', 'Cost Optimization', 'EC2 Launch Type']
  },
  {
    id: 'q-ecs-placement-spread-1',
    domain: 'scaling_resilience',
    service: 'ECS',
    difficulty: 'Associate',
    scenario: 'A critical microservice runs 12 ECS tasks on an EC2 launch type across 3 Availability Zones. The architect must ensure that if an entire Availability Zone experiences a data center power outage, the remaining tasks remain evenly distributed across surviving zones without losing service availability. Which placement strategy ensures this?',
    options: [
      { id: 'A', text: 'Task Placement Strategy: spread (attribute:ecs.availability-zone)' },
      { id: 'B', text: 'Task Placement Strategy: binpack (cpu)' },
      { id: 'C', text: 'Task Placement Constraint: memberOf' },
      { id: 'D', text: 'Task Placement Strategy: random' }
    ],
    correctOptionId: 'A',
    explanation: 'The "spread" strategy places tasks evenly based on a specified attribute, such as "attribute:ecs.availability-zone". This ensures that exactly 4 tasks are placed in AZ-1, 4 in AZ-2, and 4 in AZ-3, maximizing fault tolerance against zone outages.',
    architectureTip: 'You can chain placement strategies: Spread by Availability Zone first, then Spread by host instanceId.',
    whyWrong: {
      'B': 'Binpack packs tasks onto as few instances as possible, often in a single AZ, creating single points of failure.',
      'C': 'memberOf is a placement constraint matching boolean cluster attributes, not a distribution algorithm.',
      'D': 'Random placement does not guarantee equal distribution across Availability Zones.'
    },
    tags: ['ECS', 'Spread', 'High Availability', 'Multi-AZ', 'Fault Tolerance']
  },
  {
    id: 'q-ecs-capacity-provider-1',
    domain: 'scaling_resilience',
    service: 'ECS',
    difficulty: 'Associate',
    scenario: 'A company runs containerized batch workloads on an Amazon ECS cluster with EC2 instances. When a surge of 50 new tasks is submitted, there are not enough EC2 instances available, causing tasks to remain stuck in PENDING status. How can ECS automatically provision new EC2 host instances to accommodate pending tasks?',
    options: [
      { id: 'A', text: 'Configure an ECS Capacity Provider with Auto Scaling Group (ASG) Managed Scaling and Managed Instance Protection enabled.' },
      { id: 'B', text: 'Manually launch 10 new EC2 instances in the AWS console.' },
      { id: 'C', text: 'Switch the task definitions to use host networking.' },
      { id: 'D', text: 'Set Lambda concurrency to 1,000.' }
    ],
    correctOptionId: 'A',
    explanation: 'ECS Capacity Providers with Managed Scaling automatically adjust the capacity of an EC2 Auto Scaling group based on the target capacity metric (CapacityProviderReservation). When tasks enter PENDING status due to insufficient cluster resources, the Capacity Provider signals the ASG to launch the exact number of EC2 instances required.',
    architectureTip: 'Enable "Managed Instance Protection" on the Capacity Provider to prevent the ASG from terminating container instances that are actively running ECS tasks during scale-in.',
    whyWrong: {
      'B': 'Manual provisioning does not scale dynamically and causes delays or outages during off-hours.',
      'C': 'Host networking does not resolve insufficient CPU/RAM cluster capacity.',
      'D': 'Lambda concurrency is unrelated to ECS EC2 container clusters.'
    },
    tags: ['ECS', 'Capacity Providers', 'Managed Scaling', 'Auto Scaling', 'Pending Tasks']
  },
  {
    id: 'q-ecs-exec-1',
    domain: 'security_isolation',
    service: 'ECS',
    difficulty: 'Associate',
    scenario: 'A developer needs to execute an interactive bash shell into a running container in AWS Fargate to inspect temporary files and environment variables. The security team has blocked all inbound network ports. What secure AWS tool enables interactive shell access without opening ports or SSH daemons?',
    options: [
      { id: 'A', text: 'Use ECS Exec (aws ecs execute-command) powered by AWS Systems Manager (SSM).' },
      { id: 'B', text: 'Install an OpenSSH server inside the Docker image and expose port 22.' },
      { id: 'C', text: 'Download the Docker container image from ECR to a local laptop.' },
      { id: 'D', text: 'Attach an AWS Direct Connect circuit.' }
    ],
    correctOptionId: 'A',
    explanation: 'ECS Exec uses AWS Systems Manager (SSM) Session Manager to establish a secure, encrypted bi-directional channel between the client and the running container without opening inbound ports or running SSH daemons inside the container.',
    architectureTip: 'Enable ECS Exec on the service definition via "enableExecuteCommand: true" and ensure the Task Role has permissions for ssmmessages:CreateControlChannel and related SSM actions.',
    whyWrong: {
      'B': 'Running SSH daemons in containers increases image size, introduces vulnerability surfaces, and violates security policies.',
      'C': 'Downloading the image to a local laptop does not let you inspect the live state, dynamic variables, or memory of the production Fargate task.',
      'D': 'Direct Connect is a physical network circuit, not an interactive container debugging tool.'
    },
    tags: ['ECS', 'ECS Exec', 'Fargate', 'Debugging', 'SSM Session Manager']
  },
  {
    id: 'q-ecs-secrets-1',
    domain: 'security_isolation',
    service: 'ECS',
    difficulty: 'Associate',
    scenario: 'A containerized microservice on Amazon ECS needs to connect to an external payment gateway using an API secret key. The security architect mandates that secrets must NEVER be stored in plaintext inside the Dockerfile, container image, or task definition JSON. What is the AWS best practice?',
    options: [
      { id: 'A', text: 'Store the secret in AWS Secrets Manager or SSM Parameter Store, and reference the secret ARN in the task definition "secrets" parameter.' },
      { id: 'B', text: 'Pass the secret as an unencrypted string in the "environment" array.' },
      { id: 'C', text: 'Commit the API key directly into the Git repository.' },
      { id: 'D', text: 'Bake the secret directly into the Docker image filesystem at /root/.env.' }
    ],
    correctOptionId: 'A',
    explanation: 'ECS natively integrates with AWS Secrets Manager and AWS Systems Manager Parameter Store. By specifying the secret ARN in the "secrets" block of the container definition, the ECS agent securely fetches the secret at container launch and injects it as an environment variable into the container memory.',
    architectureTip: 'Ensure the Task Execution Role (not the Task Role) has permissions for secretsmanager:GetSecretValue or ssm:GetParameters to decrypt the secret.',
    whyWrong: {
      'B': 'Plaintext environment variables are exposed in the AWS Console, ECS DescribeTaskDefinition API calls, and CloudTrail logs.',
      'C': 'Committing keys to Git creates severe security leaks and repository exposure.',
      'D': 'Baking secrets into images allows anyone with ECR pull access to extract production credentials.'
    },
    tags: ['ECS', 'Secrets Manager', 'Parameter Store', 'Security', 'Credentials']
  },
  {
    id: 'q-ecs-essential-container-1',
    domain: 'ecs_fargate',
    service: 'ECS',
    difficulty: 'Associate',
    scenario: 'An ECS task definition contains two containers: a primary Python web application container and a secondary Fluent Bit logging sidecar container. If the logging sidecar container crashes, the primary web application must continue running without terminating the entire task. How should the container definition be configured?',
    options: [
      { id: 'A', text: 'Set "essential": true for the web application container and "essential": false for the logging sidecar container.' },
      { id: 'B', text: 'Set "essential": false for both containers.' },
      { id: 'C', text: 'Deploy the sidecar on Amazon S3.' },
      { id: 'D', text: 'Set "essential": true for both containers.' }
    ],
    correctOptionId: 'A',
    explanation: 'In Amazon ECS, every task must have at least one essential container. If an essential container stops or crashes, ECS immediately stops all other containers in the task. By marking secondary sidecar containers (like metrics or log forwarders) as "essential: false", their failure will not kill the primary application.',
    architectureTip: 'Container dependencies can also be configured using "dependsOn" (e.g. START, COMPLETE, SUCCESS, HEALTHY) to control container startup ordering.',
    whyWrong: {
      'B': 'An ECS task definition requires at least one essential container (setting all to false is invalid JSON).',
      'C': 'S3 is static storage, not a container runtime.',
      'D': 'If the sidecar is marked essential: true, any transient crash of the logger terminates the production web application.'
    },
    tags: ['ECS', 'Essential Containers', 'Sidecar Pattern', 'Task Definition', 'Resilience']
  },
  {
    id: 'q-ecs-blue-green-1',
    domain: 'scaling_resilience',
    service: 'ECS',
    difficulty: 'Associate',
    scenario: 'A financial company requires zero-downtime deployments for its mission-critical ECS services. The deployment must shift 10% of production traffic to the new container version, wait 15 minutes for CloudWatch metric evaluation, and automatically roll back if HTTP 500 error rates spike. Which deployment strategy should be implemented?',
    options: [
      { id: 'A', text: 'AWS CodeDeploy Blue/Green deployment for ECS with Linear or Canary traffic shifting and CloudWatch Alarms.' },
      { id: 'B', text: 'Rolling update with maximum percent 100% and minimum healthy percent 0%.' },
      { id: 'C', text: 'Manually delete the existing ECS service.' },
      { id: 'D', text: 'Reboot the Application Load Balancer listener.' }
    ],
    correctOptionId: 'A',
    explanation: 'AWS CodeDeploy integrates with Amazon ECS to manage Blue/Green deployments. CodeDeploy provisions the new task set (Green), tests it with a test listener, shifts traffic incrementally using Canary (e.g. Canary10Percent15Minutes) or Linear routing, and automatically rolls back if CloudWatch alarms trigger.',
    architectureTip: 'Blue/Green deployments require an Application Load Balancer or Network Load Balancer with two Target Groups (one for production traffic and one for test traffic).',
    whyWrong: {
      'B': 'Rolling update with minimum percent 0% allows all instances to be terminated simultaneously, causing downtime.',
      'C': 'Deleting the service destroys all active tasks causing total immediate downtime.',
      'D': 'Rebooting the listener drops active TCP connections and does not perform traffic shifting.'
    },
    tags: ['ECS', 'CodeDeploy', 'Blue/Green', 'Canary Deployment', 'Zero Downtime']
  },
  {
    id: 'q-ecs-daemon-service-1',
    domain: 'ecs_fargate',
    service: 'ECS',
    difficulty: 'Associate',
    scenario: 'A DevOps engineer needs to run a third-party Datadog monitoring agent container on every single EC2 container instance in an Amazon ECS cluster. Whenever a new EC2 instance is added to the cluster by Auto Scaling, the monitoring container must launch on it automatically. What service scheduling strategy should be used?',
    options: [
      { id: 'A', text: 'ECS Service with Scheduling Strategy: DAEMON (EC2 launch type only).' },
      { id: 'B', text: 'ECS Service with Scheduling Strategy: REPLICA.' },
      { id: 'C', text: 'AWS Lambda cron event.' },
      { id: 'D', text: 'AWS Fargate Spot task.' }
    ],
    correctOptionId: 'A',
    explanation: 'The DAEMON service scheduling strategy deploys exactly one task on each active container instance in your cluster that meets your task placement constraints. When new instances join the cluster, ECS automatically starts the daemon task on them.',
    architectureTip: 'DAEMON scheduling strategy is only supported on the EC2 launch type (since AWS Fargate manages the underlying host infrastructure serverlessly).',
    whyWrong: {
      'B': 'REPLICA strategy places and maintains a specified number of task copies (e.g. 5 tasks) across the cluster, which may place multiple copies on one host and none on another.',
      'C': 'Lambda cron events cannot manage persistent container processes on specific EC2 hosts.',
      'D': 'Fargate does not support DAEMON scheduling because customers do not manage host instances.'
    },
    tags: ['ECS', 'Daemon Service', 'Monitoring', 'Scheduling Strategy', 'EC2 Launch Type']
  },
  {
    id: 'q-ecs-service-autoscaling-1',
    domain: 'scaling_resilience',
    service: 'ECS',
    difficulty: 'Associate',
    scenario: 'An Amazon ECS service running on AWS Fargate is fronted by an Application Load Balancer (ALB). The API experiences sudden traffic surges during marketing promotions. The architect wants to automatically scale the number of running ECS tasks based on the number of incoming HTTP requests per task. What scaling policy should be implemented?',
    options: [
      { id: 'A', text: 'Application Auto Scaling Target Tracking policy using the ALB metric "ALBRequestCountPerTarget".' },
      { id: 'B', text: 'EC2 CPU Utilization alarm.' },
      { id: 'C', text: 'S3 PutObject metric threshold.' },
      { id: 'D', text: 'Manual scaling in AWS Systems Manager.' }
    ],
    correctOptionId: 'A',
    explanation: 'ECS Service Auto Scaling uses Application Auto Scaling to adjust the desired task count. A Target Tracking scaling policy with the predefined metric "ALBRequestCountPerTarget" (e.g. 1000 requests per task) automatically adds or removes tasks proportionally to maintain the target request load per container.',
    architectureTip: 'Target tracking policies automatically calculate scaling adjustments and scale down gradually with cooldown periods to prevent thrashing.',
    whyWrong: {
      'B': 'On AWS Fargate, there are no EC2 instances, so EC2 CPU metrics do not exist.',
      'C': 'S3 PutObject metrics track object uploads, not incoming HTTP API requests.',
      'D': 'Manual scaling cannot react in real-time to sudden marketing spikes.'
    },
    tags: ['ECS', 'Service Auto Scaling', 'Target Tracking', 'ALBRequestCountPerTarget', 'Fargate']
  },

  // ===================== COMPUTE COST & OPTIMIZATION =====================
  {
    id: 'q-cost-savings-plans-1',
    domain: 'cost_optimization',
    service: 'EC2',
    difficulty: 'Associate',
    scenario: 'A global enterprise has diverse compute workloads: 50% on EC2 (various families across 4 AWS Regions), 30% on AWS Fargate containers, and 20% on AWS Lambda. The enterprise wants to commit to a 3-year hourly spend to maximize cost savings while maintaining total flexibility to migrate between EC2, Fargate, and Lambda across any Region. Which discount model should they purchase?',
    options: [
      { id: 'A', text: 'Compute Savings Plans' },
      { id: 'B', text: 'EC2 Instance Savings Plans' },
      { id: 'C', text: 'Standard Reserved Instances' },
      { id: 'D', text: 'Convertible Reserved Instances' }
    ],
    correctOptionId: 'A',
    explanation: 'Compute Savings Plans offer the greatest flexibility (up to 66% discount). They automatically apply to EC2 instance usage regardless of instance family, size, operating system, tenancy, or AWS Region, and also apply seamlessly to AWS Fargate and AWS Lambda usage.',
    architectureTip: 'Use AWS Cost Explorer Recommendations to analyze historical compute usage and calculate the optimal dollar-per-hour commitment.',
    whyWrong: {
      'B': 'EC2 Instance Savings Plans offer slightly higher discounts (up to 72%) but are locked to a specific instance family within a single Region and do NOT apply to Fargate or Lambda.',
      'C': 'Standard Reserved Instances are rigid, locked to specific instance types/Regions, and do not cover Fargate or Lambda.',
      'D': 'Convertible RIs allow modifying instance attributes but require complex manual exchanges and do not cover Lambda.'
    },
    tags: ['Compute Savings Plans', 'Cost Optimization', 'Fargate', 'Lambda', 'EC2']
  },
  {
    id: 'q-cost-optimizer-1',
    domain: 'cost_optimization',
    service: 'EC2',
    difficulty: 'Associate',
    scenario: 'A company suspects that hundreds of EC2 instances and Lambda functions are over-provisioned (e.g. running 16 vCPUs with 2% average utilization). Which native AWS machine learning service automatically analyzes CloudWatch historical metrics to recommend optimal instance types and right-sizing?',
    options: [
      { id: 'A', text: 'AWS Compute Optimizer' },
      { id: 'B', text: 'Amazon Inspector' },
      { id: 'C', text: 'AWS Shield Advanced' },
      { id: 'D', text: 'AWS Artifact' }
    ],
    correctOptionId: 'A',
    explanation: 'AWS Compute Optimizer uses machine learning to analyze historical resource utilization metrics (CPU, memory, storage IO, network) from CloudWatch to provide right-sizing recommendations for EC2 instances, Auto Scaling groups, EBS volumes, and Lambda functions.',
    architectureTip: 'To get memory utilization recommendations for EC2 instances in Compute Optimizer, install the CloudWatch Agent to publish memory metrics.',
    whyWrong: {
      'B': 'Amazon Inspector is an automated vulnerability management service that scans EC2 and ECR for CVE security flaws.',
      'C': 'AWS Shield Advanced is a managed DDoS protection service.',
      'D': 'AWS Artifact is a central repository for AWS compliance reports and agreements.'
    },
    tags: ['Compute Optimizer', 'Right-Sizing', 'Cost Optimization', 'Machine Learning', 'CloudWatch']
  },
  {
    id: 'q-ec2-graviton-1',
    domain: 'cost_optimization',
    service: 'EC2',
    difficulty: 'Associate',
    scenario: 'A software company running high-traffic Python and Node.js microservices on c5.4xlarge EC2 instances wants to reduce compute spending by 20% while increasing throughput by up to 15%. What is the most seamless architectural upgrade?',
    options: [
      { id: 'A', text: 'Switch instance family to AWS Graviton-based c7g.4xlarge instances (ARM64 architecture).' },
      { id: 'B', text: 'Downsize the c5.4xlarge instances to c5.xlarge.' },
      { id: 'C', text: 'Migrate the code to run exclusively on S3 Select.' },
      { id: 'D', text: 'Enable EBS volume encryption.' }
    ],
    correctOptionId: 'A',
    explanation: 'AWS Graviton processors (such as Graviton3 on c7g instances) use custom 64-bit ARM Neoverse cores designed by AWS. They deliver up to 25% better compute performance and up to 20% lower cost (providing ~40% better price-performance) for Linux-based open-source workloads like Python, Node.js, Java, and Go.',
    architectureTip: 'When building Docker container images for Graviton, build multi-architecture images (linux/arm64 and linux/amd64) using Docker Buildx.',
    whyWrong: {
      'B': 'Downsizing to c5.xlarge reduces CPU and RAM by 75%, leading to CPU throttling and degraded throughput.',
      'C': 'S3 Select filters S3 CSV/JSON objects; it is not a general-purpose compute runtime.',
      'D': 'EBS encryption protects data at rest but has zero effect on compute price-performance.'
    },
    tags: ['EC2', 'Graviton', 'ARM64', 'Cost Optimization', 'Performance']
  },

  // ===================== COMPUTE SECURITY & NETWORKING =====================
  {
    id: 'q-sec-imds-hop-limit-1',
    domain: 'security_isolation',
    service: 'EC2',
    difficulty: 'Associate',
    scenario: 'A containerized application runs on an EC2 instance using bridge networking. An attacker exploits an application vulnerability inside the container and attempts to query the host EC2 instance metadata service (IMDSv2) to steal the host EC2 instance profile IAM credentials. How does setting "HttpPutResponseHopLimit=1" prevent this?',
    options: [
      { id: 'A', text: 'With a hop limit of 1, the IP packet containing the IMDSv2 token cannot traverse the Docker virtual network bridge (which decrements the TTL/hop count to 0), blocking the container from fetching the token.' },
      { id: 'B', text: 'Hop limit 1 disables the network card.' },
      { id: 'C', text: 'Hop limit 1 forces all traffic through AWS WAF.' },
      { id: 'D', text: 'Hop limit 1 deletes the IAM role.' }
    ],
    correctOptionId: 'A',
    explanation: 'Every IP network bridge or routing hop decrements the IP packet Time-To-Live (TTL / hop limit) by 1. When HttpPutResponseHopLimit is set to 1, only processes running directly on the host OS can receive the token response. Packets traversing container network bridges (like Docker bridge) are dropped when their hop count hits 0.',
    architectureTip: 'This is why Launch Templates for container hosts (like Amazon ECS and EKS) enforce HttpPutResponseHopLimit=1 or require containers to use Task IAM Roles.',
    whyWrong: {
      'B': 'Hop limit applies strictly to the link-local metadata service packets, not general network card functionality.',
      'C': 'WAF is for HTTP web applications, not link-local IP routing.',
      'D': 'Hop limits do not modify or delete IAM roles.'
    },
    tags: ['EC2', 'IMDSv2', 'Hop Limit', 'Container Security', 'SSRF']
  },
  {
    id: 'q-sec-sg-stateless-1',
    domain: 'security_isolation',
    service: 'EC2',
    difficulty: 'Associate',
    scenario: 'An EC2 instance web server in a public subnet initiates an outbound HTTP request to an external third-party API on port 443. The Security Group attached to the EC2 instance allows outbound traffic to 0.0.0.0/0 on port 443, but has NO inbound rules configured. What happens to the return traffic from the API?',
    options: [
      { id: 'A', text: 'The return traffic is automatically allowed because Security Groups are stateful (connection tracking automatically permits responses).' },
      { id: 'B', text: 'The return traffic is blocked because there is no inbound rule on ephemeral ports.' },
      { id: 'C', text: 'The return traffic is diverted to CloudTrail.' },
      { id: 'D', text: 'The EC2 instance is terminated by AWS.' }
    ],
    correctOptionId: 'A',
    explanation: 'Security Groups are STATEFUL. If you send an outbound request from an instance, the response traffic for that request is automatically allowed to flow in, regardless of inbound security group rules (and vice versa for allowed inbound requests).',
    architectureTip: 'In contrast, Network ACLs (NACLs) are STATELESS and evaluate inbound and outbound rules independently, requiring explicit return rules for ephemeral ports (1024-65535).',
    whyWrong: {
      'B': 'This behavior describes stateless Network ACLs (NACLs), not stateful Security Groups.',
      'C': 'CloudTrail records API management events, not network socket packets.',
      'D': 'AWS does not terminate instances due to packet filtering.'
    },
    tags: ['Security Groups', 'Stateful', 'NACLs', 'Firewall', 'Networking']
  },
  {
    id: 'q-scale-nlb-target-group-1',
    domain: 'scaling_resilience',
    service: 'EC2',
    difficulty: 'Associate',
    scenario: 'A multiplayer gaming platform requires routing millions of concurrent TCP and UDP connections with ultra-low latency, support for static IP addresses per Availability Zone, and preservation of client source IP addresses without HTTP header modification. Which load balancer should be placed in front of the EC2 Auto Scaling group?',
    options: [
      { id: 'A', text: 'Network Load Balancer (NLB)' },
      { id: 'B', text: 'Application Load Balancer (ALB)' },
      { id: 'C', text: 'Classic Load Balancer (CLB)' },
      { id: 'D', text: 'AWS Global Accelerator without load balancer' }
    ],
    correctOptionId: 'A',
    explanation: 'Network Load Balancer (NLB) operates at the transport layer (Layer 4 - TCP/UDP/TLS). It is capable of handling millions of requests per second with ultra-low sub-millisecond latencies, provides one static Elastic IP per Availability Zone, and preserves the client source IP directly in the packet header.',
    architectureTip: 'Use ALB for Layer 7 HTTP/HTTPS path-based routing and TLS termination with WAF; use NLB for extreme performance, TCP/UDP protocols, and static IP whitelisting.',
    whyWrong: {
      'B': 'ALB operates at Layer 7 and does not support UDP, does not provide static IPs per AZ, and modifies headers (using X-Forwarded-For).',
      'C': 'Classic Load Balancers are legacy, lack modern performance optimization, and do not support UDP.',
      'D': 'Global Accelerator routes traffic to AWS endpoints but requires a backend target like an NLB, ALB, or EC2 instance.'
    },
    tags: ['NLB', 'Load Balancing', 'Layer 4', 'UDP/TCP', 'High Performance']
  },
  {
    id: 'q-scale-alb-cross-zone-1',
    domain: 'scaling_resilience',
    service: 'EC2',
    difficulty: 'Associate',
    scenario: 'An Application Load Balancer is distributed across 2 Availability Zones (AZ-A and AZ-B). AZ-A contains 8 EC2 backend instances, while AZ-B contains 2 EC2 instances. If Cross-Zone Load Balancing is ENABLED on the ALB, how is incoming client traffic distributed across the 10 instances?',
    options: [
      { id: 'A', text: 'Each of the 10 EC2 instances receives an equal share (10% of total traffic each), regardless of which AZ load balancer node received the request.' },
      { id: 'B', text: 'AZ-A receives 50% of traffic (6.25% per instance) and AZ-B receives 50% of traffic (25% per instance).' },
      { id: 'C', text: 'All traffic is routed exclusively to AZ-B.' },
      { id: 'D', text: 'The ALB drops 50% of requests as unroutable.' }
    ],
    correctOptionId: 'A',
    explanation: 'With Cross-Zone Load Balancing enabled (which is enabled by default on Application Load Balancers), each load balancer node distributes incoming traffic evenly across all registered targets in all enabled Availability Zones (10% per instance).',
    architectureTip: 'On Network Load Balancers (NLBs), Cross-Zone Load Balancing is disabled by default and regional data transfer charges apply if cross-zone traffic is enabled.',
    whyWrong: {
      'B': 'This unequal distribution occurs only when Cross-Zone Load Balancing is DISABLED.',
      'C': 'Traffic is distributed to healthy targets across all zones.',
      'D': 'ALBs route to all registered healthy targets without dropping requests.'
    },
    tags: ['ALB', 'Cross-Zone Load Balancing', 'Target Distribution', 'Resilience', 'EC2']
  }
];

export const INITIAL_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-ec2-1',
    domain: 'cost_optimization',
    service: 'EC2',
    front: 'EC2 Spot Instances: What is the interruption warning window, and what types of workloads are best suited?',
    back: 'Warning window: 2 minutes (sent via EventBridge / Instance Metadata). Best suited for stateless, fault-tolerant, flexible batch processing, big data (EMR), and containerized worker nodes.',
    architectureContext: 'Combine Spot with Auto Scaling Groups using Capacity-Optimized allocation to minimize disruption risk.',
    examGotcha: 'Spot instances are NOT for stateful single-node production relational databases or synchronous transaction APIs.',
    boxLevel: 1,
    consecutiveCorrect: 0,
    status: 'learning'
  },
  {
    id: 'fc-ec2-2',
    domain: 'ec2_instances',
    service: 'EC2',
    front: 'Instance Store vs. Elastic Block Store (EBS): When does Instance Store lose its data?',
    back: 'Instance Store data is EPHEMERAL: It is wiped on instance STOP or TERMINATION (survives OS reboot only). EBS volumes persist independently of instance lifecycle.',
    architectureContext: 'Use Instance Store for temporary scratchpads, high-IOPS replicated caches (Redis/Memcached), and distributed buffers.',
    examGotcha: 'You cannot stop an Instance Store-backed instance in the console; you can only terminate or reboot it.',
    boxLevel: 1,
    consecutiveCorrect: 0,
    status: 'learning'
  },
  {
    id: 'fc-ec2-3',
    domain: 'security_isolation',
    service: 'EC2',
    front: 'What is IMDSv2 and why is it required for AWS security compliance?',
    back: 'IMDSv2 (Instance Metadata Service v2) is a session-oriented metadata service that protects against SSRF vulnerabilities by requiring an HTTP PUT request with a token header (X-aws-ec2-metadata-token) before allowing metadata queries.',
    architectureContext: 'Enforce IMDSv2 across your AWS account using Service Control Policies (SCPs) and Launch Templates.',
    examGotcha: 'Legacy IMDSv1 allowed plain HTTP GET requests without session tokens, leaving systems vulnerable to SSRF attacks.',
    boxLevel: 2,
    consecutiveCorrect: 1,
    status: 'learning'
  },
  {
    id: 'fc-lam-1',
    domain: 'lambda_serverless',
    service: 'Lambda',
    front: 'What are the 3 key hard execution limits of AWS Lambda?',
    back: '1. Max Execution Timeout: 15 minutes (900s)\n2. Memory Allocation: 128 MB to 10,240 MB (10 GB)\n3. Ephemeral Storage (/tmp): 512 MB to 10,240 MB (10 GB)',
    architectureContext: 'CPU scales proportionally with allocated memory. At 1,769 MB, Lambda provides 1 full dedicated vCPU.',
    examGotcha: 'Synchronous payload limit is 6 MB (e.g. API Gateway); Asynchronous payload limit is 256 KB (e.g. SQS/S3).',
    boxLevel: 1,
    consecutiveCorrect: 0,
    status: 'learning'
  },
  {
    id: 'fc-lam-2',
    domain: 'lambda_serverless',
    service: 'Lambda',
    front: 'Provisioned Concurrency vs. Reserved Concurrency in AWS Lambda',
    back: 'Provisioned Concurrency keeps a specified number of execution environments pre-warmed and ready to respond in double-digit ms (eliminates cold starts).\nReserved Concurrency guarantees dedicated execution capacity and sets a maximum scaling ceiling to protect downstream systems.',
    architectureContext: 'Use Reserved Concurrency to prevent Lambda from exhausting downstream RDS connection pools.',
    examGotcha: 'Setting Reserved Concurrency to 0 completely throttles all incoming invocations for that function (useful as a kill-switch).',
    boxLevel: 2,
    consecutiveCorrect: 1,
    status: 'learning'
  },
  {
    id: 'fc-lam-3',
    domain: 'security_isolation',
    service: 'Lambda',
    front: 'Execution Role vs. Resource-Based Policy in AWS Lambda',
    back: 'Execution Role (IAM Role assumed by Lambda): Controls what AWS resources the Lambda function code can access (e.g. S3, DynamoDB, SQS).\nResource-Based Policy (attached to the Lambda function): Controls who/what is allowed to invoke the Lambda function (e.g. S3 bucket, API Gateway, another AWS account).',
    architectureContext: 'Principle of least privilege requires distinct Execution Roles per Lambda microservice.',
    examGotcha: 'If an S3 event does not trigger Lambda, check the Resource-Based Policy (lambda:InvokeFunction permission).',
    boxLevel: 1,
    consecutiveCorrect: 0,
    status: 'learning'
  },
  {
    id: 'fc-ecs-1',
    domain: 'ecs_fargate',
    service: 'ECS',
    front: 'AWS Fargate vs. ECS EC2 Launch Type: Core Architectural Tradeoff',
    back: 'AWS Fargate: Serverless containers. AWS manages underlying OS, patching, and EC2 provisioning. You pay per vCPU & RAM allocated per second.\nECS EC2: You manage the EC2 host cluster. Full control over instance types, GPU, EBS volume attachments, and custom kernel parameters.',
    architectureContext: 'Choose Fargate for standard microservices and web APIs. Choose EC2 launch type for custom GPUs or extreme compliance.',
    examGotcha: 'Fargate tasks cannot attach raw EBS volumes directly; mount Amazon EFS for shared persistent storage.',
    boxLevel: 1,
    consecutiveCorrect: 0,
    status: 'learning'
  },
  {
    id: 'fc-ecs-2',
    domain: 'security_isolation',
    service: 'ECS',
    front: 'ECS Task Role vs. ECS Task Execution Role',
    back: 'Task Role: Assumed by the container application code at runtime to call AWS APIs (e.g. DynamoDB GetItem, S3 PutObject).\nTask Execution Role: Used by the ECS Container Agent to initialize the task (pull private images from ECR, stream logs to CloudWatch, retrieve secrets from Secrets Manager).',
    architectureContext: 'Both roles are configured inside the ECS Task Definition JSON blueprint.',
    examGotcha: 'If your container fails with "CannotPullContainerError", the Task Execution Role is missing ECR permissions.',
    boxLevel: 1,
    consecutiveCorrect: 0,
    status: 'learning'
  },
  {
    id: 'fc-ecs-3',
    domain: 'ecs_fargate',
    service: 'ECS',
    front: 'ECS Task Placement: Binpack vs. Spread Strategies',
    back: 'Binpack: Places tasks on the fewest possible EC2 instances based on least available CPU/memory to minimize instance count and cost.\nSpread: Places tasks evenly across Availability Zones or instances to maximize fault tolerance and high availability.',
    architectureContext: 'Chain Spread (by AZ) with Binpack (by memory) for optimal multi-AZ resilience at minimal server cost.',
    examGotcha: 'Task placement strategies only apply to the EC2 launch type; Fargate handles placement serverlessly.',
    boxLevel: 2,
    consecutiveCorrect: 1,
    status: 'learning'
  },
  {
    id: 'fc-cost-1',
    domain: 'cost_optimization',
    service: 'EC2',
    front: 'Compute Savings Plans vs. EC2 Instance Savings Plans',
    back: 'Compute Savings Plans: Maximum flexibility (up to 66% discount). Applies across EC2 instance families, AWS Regions, AWS Fargate, and AWS Lambda.\nEC2 Instance Savings Plans: Higher discount (up to 72%), but locked to a specific instance family within a single AWS Region (does not apply to Fargate or Lambda).',
    architectureContext: 'Choose Compute Savings Plans if planning cross-service migrations from EC2 to Fargate or Lambda.',
    examGotcha: 'Neither Savings Plan requires pre-specifying instance sizes (e.g. applies to t4g.small or t4g.large automatically).',
    boxLevel: 2,
    consecutiveCorrect: 2,
    status: 'learning'
  }
];
