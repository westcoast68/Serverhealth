import { AwsService, AwsDomain, QuizQuestion, Flashcard } from '../src/types';

/**
 * High-yield question generator templates for offline / peak-demand resilience
 */
const SCENARIO_TEMPLATES: Record<string, Array<{
  scenario: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
  architectureTip: string;
  whyWrong: Record<string, string>;
  tags: string[];
  difficulty: 'Foundational' | 'Associate' | 'Deep Dive';
}>> = {
  VPC: [
    {
      scenario: "An enterprise application requires private EC2 instances to download patches from the internet without allowing inbound internet traffic. Which architectural setup provides high availability across two Availability Zones at the lowest operational overhead?",
      options: [
        { id: "A", text: "Deploy a single NAT Gateway in a public subnet and route traffic from private subnets in all AZs to it." },
        { id: "B", text: "Deploy one NAT Gateway in a public subnet in each AZ and configure the respective private subnet route tables to direct 0.0.0.0/0 to the AZ's NAT Gateway." },
        { id: "C", text: "Deploy an Internet Gateway in each private subnet and attach an Elastic IP address to each EC2 instance." },
        { id: "D", text: "Deploy a NAT instance configured with Auto Scaling in a private subnet with source/destination checks enabled." }
      ],
      correctOptionId: "B",
      explanation: "NAT Gateways are managed by AWS and automatically scale up to 45 Gbps. However, a NAT Gateway is an AZ-specific resource. For Multi-AZ high availability and fault isolation, deploy one NAT Gateway per public subnet in each AZ and route private subnet traffic to its local AZ NAT Gateway.",
      architectureTip: "Always create one NAT Gateway per Availability Zone for production workloads to prevent a single AZ outage from taking down internet egress for your entire VPC.",
      whyWrong: {
        A: "A single NAT Gateway creates a single point of failure and incurs cross-AZ data transfer charges.",
        C: "Internet Gateways cannot be deployed inside subnets, and putting public IPs on private instances violates security isolation.",
        D: "NAT instances are unmanaged, require manual patching, and source/destination checks must be disabled (not enabled)."
      },
      tags: ["VPC", "NAT Gateway", "High Availability", "Networking"],
      difficulty: "Associate"
    },
    {
      scenario: "A database tier in a private subnet must only accept inbound MySQL (port 3306) traffic from the application tier EC2 instances. Which security group configuration implements this with least privilege and zero hardcoded IP addresses?",
      options: [
        { id: "A", text: "Create an inbound rule on the DB Security Group allowing port 3306 from CIDR 0.0.0.0/0." },
        { id: "B", text: "Create an inbound rule on the DB Security Group allowing port 3306 with the Source set to the Application Security Group ID (sg-xxxx)." },
        { id: "C", text: "Create a Network ACL rule denying all traffic except port 3306 from the public subnet CIDR block." },
        { id: "D", text: "Attach the same Security Group to both the Application tier and Database tier instances." }
      ],
      correctOptionId: "B",
      explanation: "Security Groups can reference other Security Groups as traffic sources. Setting the DB Security Group inbound rule source to the App Security Group ID ensures only EC2 instances with the App Security Group attached can communicate over port 3306, regardless of their IP addresses.",
      architectureTip: "Security group chaining (referencing security group IDs rather than IP CIDR ranges) makes architectures elastic and immune to IP changes during Auto Scaling events.",
      whyWrong: {
        A: "0.0.0.0/0 opens database port 3306 to the entire world, creating severe security vulnerabilities.",
        C: "Network ACLs are stateless, subnet-level filters that do not support security group references.",
        D: "Using the same security group for both tiers violates the principle of separation of concerns and least privilege."
      },
      tags: ["VPC", "Security Groups", "Principle of Least Privilege"],
      difficulty: "Associate"
    }
  ],
  EFS: [
    {
      scenario: "A financial analytics workload running on Amazon Elastic Container Service (Amazon ECS) on AWS Fargate requires persistent shared POSIX storage accessible concurrently by hundreds of container tasks across multiple Availability Zones. Which storage service should be selected?",
      options: [
        { id: "A", text: "Amazon EBS Multi-Attach io2 volumes." },
        { id: "B", text: "Amazon Elastic File System (Amazon EFS) with Mount Targets in each AZ." },
        { id: "C", text: "Amazon S3 mounted via S3FS container sidecar." },
        { id: "D", text: "Amazon EC2 Instance Store volumes." }
      ],
      correctOptionId: "B",
      explanation: "Amazon EFS is a managed, serverless POSIX NFS file system natively supported by AWS Fargate. It can be mounted concurrently by thousands of instances and container tasks across multiple AZs.",
      architectureTip: "EFS is the standard persistent shared storage for AWS Fargate and container clusters requiring POSIX file semantics across Availability Zones.",
      whyWrong: {
        A: "EBS io2 Multi-Attach only works within a single Availability Zone and is not supported natively by Fargate tasks.",
        C: "S3 is object storage with REST APIs; mounting S3 as POSIX via fuse sidecars lacks true POSIX locking and consistency.",
        D: "Instance Store is temporary block storage physically attached to host hardware and is not available on Fargate."
      },
      tags: ["EFS", "Storage", "Fargate", "Containers"],
      difficulty: "Associate"
    }
  ],
  KMS: [
    {
      scenario: "A security policy requires all data in S3 buckets to be encrypted at rest using encryption keys where key rotation is automated annually and key usage can be independently audited in AWS CloudTrail. The company wants AWS to manage key availability while retaining control over key deletion and policies. Which key type meets these requirements?",
      options: [
        { id: "A", text: "AWS Managed Key (aws/s3)." },
        { id: "B", text: "Customer Managed Key (CMK) in AWS KMS." },
        { id: "C", text: "Server-Side Encryption with S3 Managed Keys (SSE-S3)." },
        { id: "D", text: "Client-Side Encryption with hardcoded master key." }
      ],
      correctOptionId: "B",
      explanation: "Customer Managed Keys (CMKs) in AWS KMS provide full control over Key Policies, IAM grants, automatic 1-year rotation, manual rotation, deletion scheduling (7-30 days), and full CloudTrail audit logging.",
      architectureTip: "Use Customer Managed KMS Keys (SSE-KMS) whenever regulatory compliance mandates key policy customization, immediate revocation capability, or rotation schedule control.",
      whyWrong: {
        A: "AWS Managed Keys cannot have their key policies edited, cannot be manually disabled or deleted, and automatic rotation is fixed at 1 year (3 years for older keys) without customization.",
        C: "SSE-S3 uses AES-256 keys managed entirely by S3 and does not generate individual key-usage events in CloudTrail.",
        D: "Hardcoding cryptographic keys violates security best practices and prevents auditability."
      },
      tags: ["KMS", "Encryption", "Security", "S3"],
      difficulty: "Associate"
    }
  ],
  S3: [
    {
      scenario: "A media company stores petabytes of video footage. Files are accessed frequently for the first 30 days after upload, accessed unpredictably 1-2 times over the next 6 months, and rarely thereafter. The access pattern is unknown in advance. What is the most cost-effective S3 storage class?",
      options: [
        { id: "A", text: "S3 Standard with a lifecycle policy moving to Glacier after 30 days." },
        { id: "B", text: "S3 Intelligent-Tiering with Archive Access tiers enabled." },
        { id: "C", text: "S3 One Zone-IA with lifecycle policy to Deep Archive." },
        { id: "D", text: "S3 Standard-IA with no lifecycle policies." }
      ],
      correctOptionId: "B",
      explanation: "S3 Intelligent-Tiering is designed for datasets with unknown or changing access patterns. It automatically moves objects between frequent, infrequent, and archive access tiers with no retrieval fees and zero operational overhead.",
      architectureTip: "S3 Intelligent-Tiering eliminates retrieval fee risk when data access patterns are unpredictable or fluctuate over time.",
      whyWrong: {
        A: "Glacier has retrieval fees and delays (minutes to hours), making it unsuitable for unpredictable active access during the 6-month window.",
        C: "One Zone-IA lacks multi-AZ durability and charges per-GB retrieval fees.",
        D: "Standard-IA incurs retrieval fees if accessed and does not automatically transition cold data."
      },
      tags: ["S3", "Intelligent-Tiering", "Cost Optimization"],
      difficulty: "Associate"
    }
  ],
  Lambda: [
    {
      scenario: "A microservices application uses AWS Lambda to process payment orders. During peak flash sales, downstream RDS PostgreSQL connections are exhausted due to hundreds of concurrent Lambda invocations. Which solution resolves connection exhaustion with minimal code changes?",
      options: [
        { id: "A", text: "Increase Lambda memory to maximum 10,240 MB." },
        { id: "B", text: "Deploy Amazon RDS Proxy between Lambda and the PostgreSQL database." },
        { id: "C", text: "Migrate the database to Amazon S3." },
        { id: "D", text: "Set Lambda Reserved Concurrency to 1." }
      ],
      correctOptionId: "B",
      explanation: "Amazon RDS Proxy pools and shares database connections established to relational databases (RDS PostgreSQL/MySQL), protecting databases from connection exhaustion caused by bursts of serverless Lambda instances.",
      architectureTip: "Always pair Lambda with Amazon RDS Proxy when querying relational databases to preserve database connection limits and reduce CPU overhead from TLS handshakes.",
      whyWrong: {
        A: "Increasing Lambda memory increases vCPU and speed, but does nothing to pool or limit database connection handles.",
        C: "S3 is object storage and cannot replace a relational ACID SQL database engine.",
        D: "Setting Reserved Concurrency to 1 throttles the entire payment processing pipeline to 1 request at a time, creating extreme bottlenecks."
      },
      tags: ["Lambda", "RDS Proxy", "Serverless", "Database"],
      difficulty: "Associate"
    }
  ],
  EC2: [
    {
      scenario: "A batch processing job processes big data workloads for 6 hours every night. The job can be interrupted and resumed without data corruption. Which EC2 purchasing option provides the highest cost discount?",
      options: [
        { id: "A", text: "On-Demand Instances." },
        { id: "B", text: "Spot Instances." },
        { id: "C", text: "Dedicated Hosts." },
        { id: "D", text: "Standard 3-Year Reserved Instances." }
      ],
      correctOptionId: "B",
      explanation: "EC2 Spot Instances offer up to 90% discount compared to On-Demand pricing. They are ideal for fault-tolerant, stateless, or checkpointable batch processing workloads that can handle 2-minute interruption notices.",
      architectureTip: "Combine Spot Instances with Auto Scaling Groups using price-capacity-optimized allocation strategies for resilient batch computing.",
      whyWrong: {
        A: "On-Demand is the most expensive per-hour model with zero commitment discount.",
        C: "Dedicated Hosts are for dedicated compliance hardware and BYOL licenses, making them significantly more expensive.",
        D: "3-Year Reserved Instances require a continuous 24/7 commitment for 3 years, which is wasteful for a job that only runs 6 hours per night."
      },
      tags: ["EC2", "Spot Instances", "Cost Optimization"],
      difficulty: "Foundational"
    }
  ],
  ECS: [
    {
      scenario: "An enterprise is deploying microservices containers to Amazon ECS. The security team mandates that containers must NEVER have root access to the underlying host OS and no EC2 instances should require operating system patching. Which configuration should be selected?",
      options: [
        { id: "A", text: "ECS on EC2 with Amazon Linux 2 AMI." },
        { id: "B", text: "ECS with AWS Fargate launch type." },
        { id: "C", text: "Docker Swarm on EC2 Spot Instances." },
        { id: "D", text: "ECS with Local Zone EC2 placement." }
      ],
      correctOptionId: "B",
      explanation: "AWS Fargate is a serverless compute engine for containers. AWS manages the underlying virtual machine isolation, OS kernel patching, and capacity, eliminating host-level administrative overhead.",
      architectureTip: "Fargate provides hypervisor-level isolation for each individual task, ensuring no task shares underlying resources with other tasks.",
      whyWrong: {
        A: "EC2 launch type requires customers to manage and patch host operating systems.",
        C: "Docker Swarm on EC2 is self-managed and requires continuous host OS maintenance.",
        D: "Local Zones still use EC2 instances that require customer OS management."
      },
      tags: ["ECS", "Fargate", "Containers", "Security"],
      difficulty: "Associate"
    }
  ],
  EBS: [
    {
      scenario: "A high-performance Oracle database on EC2 requires sustained storage throughput of 1,000 MB/s and 40,000 IOPS with sub-millisecond latency. Which EBS volume type is specifically engineered for this mission-critical workload?",
      options: [
        { id: "A", text: "General Purpose SSD (gp3)." },
        { id: "B", text: "Provisioned IOPS SSD (io2 Block Express)." },
        { id: "C", text: "Throughput Optimized HDD (st1)." },
        { id: "D", text: "Cold HDD (sc1)." }
      ],
      correctOptionId: "B",
      explanation: "EBS io2 Block Express is designed for mission-critical, high-IOPS applications. It provides up to 256,000 IOPS, 4,000 MB/s throughput, and sub-millisecond latency with 99.999% durability.",
      architectureTip: "Use gp3 for baseline workloads and reserve io2 Block Express for high-transaction I/O-intensive databases requiring predictable sub-millisecond latency.",
      whyWrong: {
        A: "gp3 maxes out at 16,000 IOPS and 1,000 MB/s throughput, but cannot match io2 Block Express sub-millisecond latency and high-tier IOPS.",
        C: "st1 is magnetic HDD optimized for large, sequential throughput (max 500 IOPS), not random database queries.",
        D: "sc1 is cold HDD for infrequently accessed data and lowest cost."
      },
      tags: ["EBS", "io2", "Storage Performance"],
      difficulty: "Associate"
    }
  ],
  "Route 53": [
    {
      scenario: "A globally distributed web application has users in Europe and North America. The architect wants European users to be routed to the Ireland (eu-west-1) ALB, and North American users routed to the Virginia (us-east-1) ALB. If an entire region goes down, traffic must fail over. Which Route 53 routing policy is required?",
      options: [
        { id: "A", text: "Simple routing policy with multiple A records." },
        { id: "B", text: "Geolocation routing policy combined with Route 53 Health Checks." },
        { id: "C", text: "Weighted routing policy with 50/50 distribution." },
        { id: "D", text: "Multivalue answer routing policy." }
      ],
      correctOptionId: "B",
      explanation: "Geolocation routing directs traffic based on the geographic location of the DNS query origin (continent/country). Pairing Geolocation records with Route 53 health checks allows automatic failover to healthy regional endpoints if an outage occurs.",
      architectureTip: "Use Geolocation routing for localization/compliance, and Latency-based routing to automatically route traffic to the AWS region that provides the lowest network latency for the client.",
      whyWrong: {
        A: "Simple routing returns records randomly with zero health checking or geographic intelligence.",
        C: "Weighted routing splits traffic based on fixed percentages (e.g. for canary testing), not user location.",
        D: "Multivalue answer returns multiple healthy records for simple DNS-level load balancing."
      },
      tags: ["Route 53", "DNS", "High Availability"],
      difficulty: "Associate"
    }
  ],
  CloudFront: [
    {
      scenario: "A media streaming website uses Amazon S3 to store private premium video files. The company wants users worldwide to stream videos via CloudFront with lowest latency, but users must only access videos if they have an active paid subscription validated by the backend. How can this be secured?",
      options: [
        { id: "A", text: "Make the S3 bucket public and restrict access with S3 Bucket Policies based on client IP." },
        { id: "B", text: "Use CloudFront Origin Access Control (OAC) to restrict S3 access, and generate CloudFront Signed URLs or Signed Cookies for authorized users." },
        { id: "C", text: "Disable CloudFront caching and enable S3 Server-Side Encryption." },
        { id: "D", text: "Create an IAM User for each subscriber to access S3 directly." }
      ],
      correctOptionId: "B",
      explanation: "CloudFront Signed URLs/Cookies allow granular access control to private cached content. Origin Access Control (OAC) ensures the origin S3 bucket only accepts requests coming through CloudFront.",
      architectureTip: "Always use Origin Access Control (OAC) with S3 and Signed URLs for individual file access or Signed Cookies for access to multiple files (e.g. streaming playlists).",
      whyWrong: {
        A: "Making the bucket public exposes paid videos and IP-based restrictions are brittle for mobile users.",
        C: "Disabling caching defeats the purpose of CloudFront and increases latency and origin egress costs.",
        D: "Creating IAM users for end-customer subscribers is an anti-pattern; IAM is strictly for cloud infrastructure administrators and AWS services."
      },
      tags: ["CloudFront", "S3", "Security", "CDN"],
      difficulty: "Associate"
    }
  ],
  RDS: [
    {
      scenario: "A web application database on Amazon RDS MySQL is experiencing slow query performance due to a 90% read to 10% write ratio during peak traffic hours. Which architecture change resolves the bottleneck with minimal refactoring?",
      options: [
        { id: "A", text: "Enable Multi-AZ deployment on the RDS instance." },
        { id: "B", text: "Deploy Amazon RDS Read Replicas and route read traffic to the replica endpoints." },
        { id: "C", text: "Migrate the database to Amazon S3 Standard." },
        { id: "D", text: "Convert the MySQL database into a DynamoDB table." }
      ],
      correctOptionId: "B",
      explanation: "RDS Read Replicas offload read-heavy database workloads. Up to 15 read replicas can be created in Amazon RDS (and Aurora) to serve read queries asynchronously while the primary instance handles writes.",
      architectureTip: "Remember: Multi-AZ is for synchronous Disaster Recovery & High Availability (standby cannot serve reads). Read Replicas are for asynchronous Scalability & Read Performance offloading.",
      whyWrong: {
        A: "Multi-AZ creates a synchronous passive standby in another AZ for failover; the standby CANNOT accept read or write traffic.",
        C: "S3 cannot execute SQL queries or replace an active transaction engine.",
        D: "Migrating from relational MySQL to NoSQL DynamoDB requires significant schema and application code rewriting."
      },
      tags: ["RDS", "Read Replicas", "Database Scaling"],
      difficulty: "Associate"
    }
  ],
  DynamoDB: [
    {
      scenario: "A real-time gaming leaderboard requires single-digit microsecond read latency for hot player profile queries. Standard DynamoDB provides single-digit millisecond latency, which is insufficient. What should the architect integrate?",
      options: [
        { id: "A", text: "Amazon DynamoDB Accelerator (DAX)." },
        { id: "B", text: "Amazon ElastiCache Redis cluster requiring application query layer rewrite." },
        { id: "C", text: "Amazon RDS Read Replicas." },
        { id: "D", text: "Increase DynamoDB Read Capacity Units (RCUs) by 10x." }
      ],
      correctOptionId: "A",
      explanation: "Amazon DynamoDB Accelerator (DAX) is a fully managed, highly available in-memory cache for DynamoDB that reduces response times from single-digit milliseconds to microsecond response times with zero application logic rewrite (API compatible).",
      architectureTip: "Use DAX for read-heavy, eventually consistent DynamoDB workloads requiring microsecond latency.",
      whyWrong: {
        B: "ElastiCache requires modifying application code to manage cache invalidation and separate API clients.",
        C: "RDS is a relational database and not a cache for DynamoDB.",
        D: "Increasing RCUs increases throughput capacity, but does not decrease physical millisecond disk/network latency to microseconds."
      },
      tags: ["DynamoDB", "DAX", "In-Memory Cache", "Performance"],
      difficulty: "Associate"
    }
  ],
  IAM: [
    {
      scenario: "An application running on an EC2 instance needs to upload generated PDF reports to an S3 bucket securely. How should the EC2 instance be granted permissions to S3?",
      options: [
        { id: "A", text: "Store IAM User access keys and secret keys inside the EC2 instance User Data script." },
        { id: "B", text: "Create an IAM Role with an S3 PutObject policy, create an Instance Profile, and attach the IAM Role to the EC2 instance." },
        { id: "C", text: "Configure the S3 bucket to allow anonymous public PUT requests." },
        { id: "D", text: "Embed IAM access keys directly in the application source code repository." }
      ],
      correctOptionId: "B",
      explanation: "IAM Roles provide temporary, automatically rotated STS credentials to EC2 instances via the Instance Metadata Service (IMDS). This eliminates hardcoded credentials completely.",
      architectureTip: "Never store static access keys on EC2 instances or containers. Always use IAM Roles for EC2 / IAM Roles for ECS Tasks / IAM Roles for Service Accounts (IRSA on EKS).",
      whyWrong: {
        A: "User Data scripts are stored in plaintext in the EC2 console and can be read by anyone with DescribeInstances permission.",
        C: "Allowing anonymous public PUT requests allows anyone on the internet to upload files and incur massive storage bills.",
        D: "Embedding credentials in source code leads to credential leaks and violates core cloud security standards."
      },
      tags: ["IAM", "IAM Roles", "Security Best Practices"],
      difficulty: "Foundational"
    }
  ],
  CloudWatch: [
    {
      scenario: "An EC2 instance memory utilization must be monitored to trigger an Auto Scaling policy when RAM usage exceeds 80%. CloudWatch by default does not show memory utilization metrics. What is the root cause and required solution?",
      options: [
        { id: "A", text: "CloudWatch cannot monitor memory under any circumstances." },
        { id: "B", text: "Memory utilization is an OS-level metric. The CloudWatch Unified Agent must be installed inside the EC2 instance to push custom memory metrics to CloudWatch." },
        { id: "C", text: "Enable Enhanced Monitoring in the AWS Management Console with one click." },
        { id: "D", text: "Upgrade the EC2 instance to a larger instance size." }
      ],
      correctOptionId: "B",
      explanation: "By default, CloudWatch hypervisor metrics only collect CPUUtilization, NetworkIn/Out, and DiskRead/WriteOps. Memory and disk space are guest OS metrics requiring the CloudWatch Unified Agent or custom metric scripts.",
      architectureTip: "Remember this high-yield exam rule: CPU, Network, and Status Checks are default hypervisor metrics. Memory utilization and Disk space consumed ALWAYS require the CloudWatch Agent.",
      whyWrong: {
        A: "CloudWatch easily monitors memory once the CloudWatch agent pushes the metric.",
        C: "Enhanced Monitoring is an RDS feature, not EC2.",
        D: "Upgrading instance size does not make OS-level memory metrics visible to the hypervisor."
      },
      tags: ["CloudWatch", "Monitoring", "EC2", "Custom Metrics"],
      difficulty: "Associate"
    }
  ],
  CloudTrail: [
    {
      scenario: "A security incident response team discovers that an S3 bucket policy was unexpectedly deleted. They need to determine exactly which IAM principal deleted the policy, the source IP address, and the timestamp. Which AWS service provides this audit trail?",
      options: [
        { id: "A", text: "Amazon CloudWatch Metrics." },
        { id: "B", text: "AWS CloudTrail Event History." },
        { id: "C", text: "AWS Trusted Advisor." },
        { id: "D", text: "Amazon VPC Flow Logs." }
      ],
      correctOptionId: "B",
      explanation: "AWS CloudTrail records all API calls made in an AWS account (who called what, when, from which IP, and what parameters). Event history stores the last 90 days of management events automatically.",
      architectureTip: "Remember the difference: CloudWatch = Performance & Health (Metrics, Logs, Alarms). CloudTrail = Governance & Auditing (API Calls, User actions, Compliance).",
      whyWrong: {
        A: "CloudWatch monitors performance metrics like latency and CPU, not identity audit logs.",
        C: "Trusted Advisor provides automated checks for cost, security, fault tolerance, and service limits.",
        D: "VPC Flow Logs capture IP traffic going to and from network interfaces, but cannot decode API request payloads or IAM identities."
      },
      tags: ["CloudTrail", "Auditing", "Governance", "Security"],
      difficulty: "Foundational"
    }
  ]
};

export function getFallbackQuizQuestions(targetServices: AwsService[], count: number = 3): QuizQuestion[] {
  const result: QuizQuestion[] = [];
  const validServices = targetServices.length > 0 ? targetServices : (['EC2', 'Lambda', 'ECS'] as AwsService[]);
  
  let idCounter = 1;
  for (const svc of validServices) {
    const templates = SCENARIO_TEMPLATES[svc] || SCENARIO_TEMPLATES['EC2'];
    for (const t of templates) {
      if (result.length >= count) break;
      result.push({
        id: `offline-q-${Date.now()}-${idCounter++}`,
        domain: (svc === 'EC2' ? 'ec2_instances' :
                 svc === 'Lambda' ? 'lambda_serverless' : 'ecs_fargate') as AwsDomain,
        service: svc,
        difficulty: t.difficulty,
        scenario: t.scenario,
        options: t.options,
        correctOptionId: t.correctOptionId,
        explanation: t.explanation,
        architectureTip: t.architectureTip,
        whyWrong: t.whyWrong,
        tags: t.tags,
        isAiGenerated: true
      });
    }
    if (result.length >= count) break;
  }

  return result;
}

export function getFallbackDiagnostic(userProgress: any): any {
  const services = userProgress?.services ? Object.values(userProgress.services) : [];
  // Sort by lowest mastery
  const sorted: any[] = services.sort((a: any, b: any) => (a.masteryScore || 50) - (b.masteryScore || 50));
  const weakest = sorted.slice(0, 2);
  const strongest = [...sorted].reverse().slice(0, 1);

  const topWeaknesses = weakest.map((s: any) => ({
    service: s.service || 'EC2',
    domain: s.domain || 'ec2_instances',
    estimatedGap: `Mastery score at ${s.masteryScore || 45}%. Error patterns indicate confusion with compute sizing, concurrency, and scaling rules.`,
    suggestedFocus: `Focus on active recall drills and exam scenario questions contrasting ${s.service} compute tradeoffs.`
  }));

  const topStrengths = strongest.map((s: any) => ({
    service: s.service || 'Lambda',
    domain: s.domain || 'lambda_serverless',
    mastery: `Demonstrating solid mastery (${s.masteryScore || 80}%) with steady review cadence.`
  }));

  const avgMastery = sorted.length > 0 
    ? Math.round(sorted.reduce((acc, curr: any) => acc + (curr.masteryScore || 50), 0) / sorted.length)
    : 62;
  const scaledScore = Math.min(1000, Math.max(100, Math.round(avgMastery * 8.5 + 120)));

  return {
    overallReadinessScore: scaledScore,
    readinessVerdict: scaledScore >= 720 ? "Ready for Exam (Passing Band)" : "Targeted Compute Remediation Required",
    topWeaknesses: topWeaknesses.length > 0 ? topWeaknesses : [
      {
        service: "EC2",
        domain: "ec2_instances",
        estimatedGap: "Struggling with Spot vs On-Demand placement strategies and Auto Scaling lifecycle hooks.",
        suggestedFocus: "Drill instance sizing and ASG target tracking policies."
      }
    ],
    topStrengths: topStrengths.length > 0 ? topStrengths : [
      {
        service: "Lambda",
        domain: "lambda_serverless",
        mastery: "Strong grasp of serverless execution models and Provisioned Concurrency."
      }
    ],
    strategicPrescription: [
      `1. Focus drills on lowest mastery services: ${weakest.map(w => w.service).join(', ') || 'EC2, ECS'}.`,
      "2. Complete 10 scenario questions on Compute scaling & resilience tradeoffs.",
      "3. Review high-yield contrast flashcards to cement Ebbinghaus retention stability."
    ],
    targetedActionPlan: `Your current estimated scaled score is ${scaledScore}/1000 (AWS Pass benchmark is 720). By systematically targeting your weakest areas (${weakest.map(w => w.service).join(', ') || 'EC2'}), you can close remaining knowledge gaps in ~3-4 days of focused active recall practice.`
  };
}

export function getFallbackCopilotAnswer(question: string): string {
  return `### AWS Compute Architecture Guidance

**Core Architectural Rule**:
For AWS certification exams and production compute systems, select compute engines based on execution model, runtime duration, statefulness, and operational maintenance requirements:
- **AWS Lambda**: Event-driven serverless compute (up to 15-minute runtime, 10 GB RAM, sub-second billing). Best for spiky, asynchronous, or stateless HTTP APIs.
- **Amazon ECS with AWS Fargate**: Serverless container orchestration. Best for long-running microservices, batch jobs over 15 minutes, or workloads requiring specific container networking (awsvpc) with zero host patching.
- **Amazon EC2**: Virtual machines with complete OS, hypervisor, and hardware-level control. Best for legacy monolithic applications, custom kernel drivers, GPU compute, or specific high-performance network configurations.

**Key Compute Tradeoffs**:
- **Pricing & Cost**: Combine EC2 Spot Instances (up to 90% discount) for stateless fault-tolerant worker nodes, Savings Plans for steady-state baseline, and On-Demand for unpredictable surges.
- **Concurrency & Scaling**: Understand the critical difference between Lambda *Reserved Concurrency* (guarantees capacity + sets hard ceiling) and *Provisioned Concurrency* (eliminates cold starts).

*(Note: Response delivered via AWS Compute Mastery Knowledge Engine)*`;
}
