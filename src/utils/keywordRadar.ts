import { KeywordRadarSignal, QuizQuestion, AwsService } from '../types';

export interface RadarLexiconEntry {
  triggerPhrase: string;
  category: 'constraint' | 'workload' | 'architecture' | 'trap';
  service: AwsService | 'General';
  deducedArchitecture: string;
  examExplanation: string;
  distractorTrap: string;
}

// Built-in radar dictionary covering AWS Solutions Architect / SysOps Compute trigger phrases
export const AWS_RADAR_DICTIONARY: Array<{
  pattern: RegExp;
  keyword: string;
  category: 'constraint' | 'workload' | 'architecture' | 'trap';
  meaning: string;
  targetConcept: string;
}> = [
  // Cost & Constraints
  {
    pattern: /minimizes?\s+costs?|lowest\s+cost|most\s+cost-effective|cost-efficient/i,
    keyword: 'minimizes costs',
    category: 'constraint',
    meaning: 'In AWS exams, this directs you away from expensive Dedicated Hosts or over-provisioned On-Demand instances toward Spot, Graviton, or Auto Scaling.',
    targetConcept: 'EC2 Spot & Savings Plans'
  },
  {
    pattern: /zero\s+operational\s+(overhead|management)|no\s+servers\s+to\s+manage|serverless/i,
    keyword: 'zero operational overhead',
    category: 'constraint',
    meaning: 'Signals AWS Lambda or AWS Fargate over self-managed EC2 instances or custom container orchestration.',
    targetConcept: 'Serverless (Lambda / Fargate)'
  },
  {
    pattern: /sub-millisecond\s+latency|ultra-low\s+latency|highest\s+iops/i,
    keyword: 'sub-millisecond latency',
    category: 'constraint',
    meaning: 'Points to physically attached NVMe EC2 Instance Store or Cluster Placement Groups rather than network-attached EBS.',
    targetConcept: 'Instance Store / Cluster Placement'
  },
  {
    pattern: /strictly\s+sequential|order\s+guaranteed|fifo/i,
    keyword: 'strictly sequential / FIFO',
    category: 'constraint',
    meaning: 'Requires SQS FIFO or Kinesis Streams with single-consumer concurrency to prevent out-of-order execution.',
    targetConcept: 'FIFO Processing'
  },
  {
    pattern: /strictly\s+less\s+than\s+15\s+minutes|15-minute|within\s+a\s+few\s+minutes/i,
    keyword: 'within 15 minutes',
    category: 'constraint',
    meaning: 'Fits comfortably within AWS Lambda max invocation timeout (15 min). If over 15 min, AWS Fargate / ECS is required.',
    targetConcept: 'Lambda 15-min Timeout Limit'
  },

  // Workload characteristics
  {
    pattern: /batch\s+processing|nightly\s+batch|parallel\s+jobs?/i,
    keyword: 'batch processing',
    category: 'workload',
    meaning: 'Identifies workloads ideal for Spot instances, EC2 Fleet capacity-optimized, or AWS Batch on Fargate.',
    targetConcept: 'Spot Batch Processing'
  },
  {
    pattern: /fault-tolerant|can\s+tolerate\s+unexpected\s+(server\s+)?terminations?|stateless/i,
    keyword: 'fault-tolerant / tolerates termination',
    category: 'workload',
    meaning: 'The textbook signal that EC2 Spot Instances can be safely deployed without risking business operations.',
    targetConcept: 'Spot Instances'
  },
  {
    pattern: /checkpoints?\s+state|replicated\s+at\s+the\s+application\s+layer/i,
    keyword: 'checkpoints state / replicated at app layer',
    category: 'workload',
    meaning: 'Confirms that if an instance terminates or local storage disappears, state is preserved in S3 or peer nodes.',
    targetConcept: 'Stateless / Ephemeral Resilience'
  },
  {
    pattern: /spiky|unpredictable\s+surges?|bursts?\s+of\s+traffic|irregular\s+traffic/i,
    keyword: 'spiky / unpredictable traffic',
    category: 'workload',
    meaning: 'Directs to Lambda auto-scaling or EC2 Step / Target Tracking scaling policies.',
    targetConcept: 'Dynamic Auto Scaling'
  },
  {
    pattern: /legacy\s+monolith|custom\s+kernel|windows\s+byol|licensing\s+per-core/i,
    keyword: 'legacy / custom kernel / BYOL licensing',
    category: 'workload',
    meaning: 'Eliminates Lambda and Fargate; requires full VM control via Amazon EC2 or Dedicated Hosts.',
    targetConcept: 'EC2 Dedicated Hosts / Custom OS'
  },
  {
    pattern: /rebuilt\s+from\s+scratch\s+in\s+minutes|can\s+be\s+rebuilt/i,
    keyword: 'can be rebuilt in minutes',
    category: 'workload',
    meaning: 'Ephemeral storage (Instance Store) is acceptable because data loss on stop is tolerable.',
    targetConcept: 'EC2 Instance Store'
  },

  // AWS Architecture Clues
  {
    pattern: /imdsv2|169\.254\.169\.254|ssrf|httptokens/i,
    keyword: 'IMDSv2 / SSRF protection',
    category: 'architecture',
    meaning: 'Requires session-oriented token (PUT request) to prevent credential theft via Server-Side Request Forgery.',
    targetConcept: 'IMDSv2 Security'
  },
  {
    pattern: /provisioned\s+concurrency|cold\s+starts?/i,
    keyword: 'provisioned concurrency / cold start',
    category: 'architecture',
    meaning: 'Keeps initialized execution environments pre-warmed for double-digit millisecond latency guarantees.',
    targetConcept: 'Lambda Provisioned Concurrency'
  },
  {
    pattern: /task\s+role\s+vs\s+task\s+execution\s+role|task\s+execution\s+role|task\s+role/i,
    keyword: 'Task Role vs Task Execution Role',
    category: 'architecture',
    meaning: 'Task Execution Role is for ECS agent (ECR pull, CloudWatch logs); Task Role is for application code accessing AWS (S3, DynamoDB).',
    targetConcept: 'ECS IAM Roles'
  },
  {
    pattern: /hyperplane\s+vpc\s+eni|vpc\s+eni\s+sharing|eni\s+exhaustion/i,
    keyword: 'Hyperplane VPC ENI',
    category: 'architecture',
    meaning: 'AWS Lambdas modern VPC architecture that provisions shared NAT ENIs instead of creating individual ENIs per cold start.',
    targetConcept: 'Lambda VPC Networking'
  },
  {
    pattern: /snapstart|microvm\s+snapshot/i,
    keyword: 'Lambda SnapStart',
    category: 'architecture',
    meaning: 'Takes Firecracker microVM snapshots during deployment to eliminate Java initialization cold starts.',
    targetConcept: 'Lambda SnapStart'
  },
  {
    pattern: /cluster\s+placement\s+group|spread\s+placement\s+group|partition\s+placement\s+group/i,
    keyword: 'Placement Group (Cluster vs Spread vs Partition)',
    category: 'architecture',
    meaning: 'Cluster = lowest network latency in single AZ; Spread = isolate hardware failure across racks (max 7 per AZ); Partition = large distributed sets (Hadoop/Kafka).',
    targetConcept: 'EC2 Placement Groups'
  },
  {
    pattern: /capacity\s+providers?|managed\s+scaling/i,
    keyword: 'ECS Capacity Provider',
    category: 'architecture',
    meaning: 'Automatically provisions and scales EC2 Auto Scaling instances on-demand as container tasks are queued.',
    targetConcept: 'ECS Capacity Providers'
  },
  {
    pattern: /graviton|arm64|price-performance/i,
    keyword: 'AWS Graviton (ARM64)',
    category: 'architecture',
    meaning: 'Delivers up to 40% better price-performance over comparable x86 instances across EC2, Lambda, and ECS Fargate.',
    targetConcept: 'Graviton Architecture'
  },
  {
    pattern: /nitro\s+(hypervisor|system)|offload/i,
    keyword: 'AWS Nitro System',
    category: 'architecture',
    meaning: 'Offloads virtualization, storage, and networking to dedicated hardware cards for near-bare-metal performance.',
    targetConcept: 'EC2 Nitro'
  },
  {
    pattern: /reportbatchitemfailures|sqs\s+partial\s+batch/i,
    keyword: 'ReportBatchItemFailures',
    category: 'architecture',
    meaning: 'Allows Lambda to return only the specific failed message IDs to SQS rather than retrying the entire batch.',
    targetConcept: 'Lambda SQS Batch Handling'
  },
  {
    pattern: /shared\s+persistent\s+file\s+system|readwritemany|efs\s+volume/i,
    keyword: 'Amazon EFS ReadWriteMany',
    category: 'architecture',
    meaning: 'Network file system allowing multiple ECS Fargate tasks or EC2 instances to simultaneously read/write persistent files.',
    targetConcept: 'Shared EFS Storage'
  },

  // Traps & Pitfalls
  {
    pattern: /ephemeral\s+storage\s+lost\s+on\s+stop|lost\s+on\s+stop|reboot\s+vs\s+stop/i,
    keyword: 'Instance Store lost on stop',
    category: 'trap',
    meaning: 'STOPPING an instance terminates host attachment and wipes instance store data forever. Only REBOOT preserves it.',
    targetConcept: 'Storage Persistence Gotcha'
  },
  {
    pattern: /continuous\s+24\/7\s+commitment|3-year\s+standard\s+reserved/i,
    keyword: 'continuous commitment trap',
    category: 'trap',
    meaning: 'Financial trap when applied to batch or intermittent workloads that run only a few hours per day.',
    targetConcept: 'Financial Commitment Trap'
  },
  {
    pattern: /hard-coded\s+credentials|iam\s+user\s+access\s+keys/i,
    keyword: 'hard-coded credentials trap',
    category: 'trap',
    meaning: 'AWS exam trap: Never embed access keys in code or AMIs. Always use IAM Instance Profiles or Task Roles.',
    targetConcept: 'IAM Credential Antipattern'
  },
  {
    pattern: /hop\s+limit\s+(of\s+)?1|httpputresponsehoplimit/i,
    keyword: 'Hop Limit 1 (IMDSv2)',
    category: 'trap',
    meaning: 'Hop limit 1 ensures packets cannot traverse an IP router or container bridge, blocking container SSRF escapes.',
    targetConcept: 'IMDSv2 Hop Limit'
  }
];

// Master Lexicon for the Radar Exam Decoder Modal
export const AWS_RADAR_LEXICON: RadarLexiconEntry[] = [
  {
    triggerPhrase: 'Minimizes costs for fault-tolerant / stateless jobs',
    category: 'constraint',
    service: 'EC2',
    deducedArchitecture: 'EC2 Spot Instances with capacity-optimized allocation',
    examExplanation: 'Spot instances provide up to 90% savings. Since the workload can withstand interruptions or checkpoints state, Spot is always the exam answer.',
    distractorTrap: 'Do not pick On-Demand or 3-Year Reserved Instances when batch jobs run only a few hours per day.'
  },
  {
    triggerPhrase: 'Sub-millisecond latency + extreme IOPS + temporary cache',
    category: 'architecture',
    service: 'EC2',
    deducedArchitecture: 'EC2 Instance Store (NVMe SSD)',
    examExplanation: 'Instance Store is physically attached to the server host, eliminating the network hop required by EBS io2 or gp3.',
    distractorTrap: 'Do not use Instance Store for persistent non-replicated databases because data is wiped when instances STOP.'
  },
  {
    triggerPhrase: 'Containerized task accessing AWS S3 / DynamoDB',
    category: 'architecture',
    service: 'ECS',
    deducedArchitecture: 'Task Role (NOT Task Execution Role)',
    examExplanation: 'Task Role provides AWS permissions directly to your containerized application code running inside the container.',
    distractorTrap: 'Task Execution Role is for the ECS container agent to pull images from ECR and send logs to CloudWatch.'
  },
  {
    triggerPhrase: 'Zero operational overhead + execution < 15 minutes',
    category: 'constraint',
    service: 'Lambda',
    deducedArchitecture: 'AWS Lambda serverless functions',
    examExplanation: 'No instances to manage, patch, or scale. Lambda scales automatically from 0 to thousands of concurrent executions.',
    distractorTrap: 'If the batch job takes more than 15 minutes, AWS Lambda cannot be used; select AWS Fargate or EC2.'
  },
  {
    triggerPhrase: 'SSRF vulnerability on EC2 instance metadata',
    category: 'architecture',
    service: 'EC2',
    deducedArchitecture: 'Enforce IMDSv2 (HttpTokens: required) with Hop Limit 1',
    examExplanation: 'IMDSv2 enforces session-oriented HTTP PUT requests with custom header tokens, neutralizing HTTP GET SSRF vectors.',
    distractorTrap: 'Security groups and NACLs cannot selectively inspect and block IMDS 169.254.169.254 without breaking AWS tooling.'
  },
  {
    triggerPhrase: 'Eliminate cold starts for latency-sensitive API',
    category: 'architecture',
    service: 'Lambda',
    deducedArchitecture: 'Lambda Provisioned Concurrency (or SnapStart for Java)',
    examExplanation: 'Provisioned Concurrency initializes execution environments beforehand so invocations respond with zero cold start penalty.',
    distractorTrap: 'Reserved Concurrency only sets a concurrency limit/ceiling; it does NOT pre-warm execution environments.'
  },
  {
    triggerPhrase: 'Tightest network latency between EC2 instances (HPC / MPI)',
    category: 'architecture',
    service: 'EC2',
    deducedArchitecture: 'Cluster Placement Group + Elastic Fabric Adapter (EFA)',
    examExplanation: 'Cluster Placement groups pack instances inside a single Availability Zone onto high-speed 100+ Gbps backplanes.',
    distractorTrap: 'Spread Placement groups do the opposite (distribute instances across distinct racks to minimize correlated failures).'
  },
  {
    triggerPhrase: 'Multiple container tasks require shared read/write storage',
    category: 'workload',
    service: 'ECS',
    deducedArchitecture: 'Amazon EFS volume mount (ReadWriteMany)',
    examExplanation: 'EBS can only attach to one EC2 instance at a time (ReadWriteOnce). EFS provides shared NFS access across multiple Fargate tasks.',
    distractorTrap: 'EBS Multi-Attach only works with io1/io2 on specific Nitro instances and requires a cluster-aware file system (not standard ext4).'
  },
  {
    triggerPhrase: 'SQS batch of 10 messages has 1 failing item',
    category: 'architecture',
    service: 'Lambda',
    deducedArchitecture: 'Lambda ReportBatchItemFailures in response payload',
    examExplanation: 'Enables partial batch responses so only the failed item ID is returned to the queue, avoiding reprocessing all 9 successful messages.',
    distractorTrap: 'Throwing an unhandled exception causes the entire batch of 10 messages to be retried by SQS.'
  },
  {
    triggerPhrase: 'Unpredictable, spiky traffic with idle periods',
    category: 'workload',
    service: 'Lambda',
    deducedArchitecture: 'AWS Lambda pay-per-request or Fargate with Target Tracking',
    examExplanation: 'You pay exactly $0 when there are zero requests. Never pay 24/7 EC2 hourly fees for idle compute.',
    distractorTrap: 'Do not recommend Reserved Instances or static EC2 fleets for bursty workloads with long idle stretches.'
  }
];

/**
 * Scans a question scenario and returns all keyword radar signals.
 * Combines explicit signals declared on the question with matched dictionary patterns.
 */
export function scanQuestionRadar(question: QuizQuestion): KeywordRadarSignal[] {
  const detected: KeywordRadarSignal[] = [];
  const addedKeywords = new Set<string>();

  // 1. Add explicitly authored signals first
  if (question.keywordRadar && question.keywordRadar.length > 0) {
    question.keywordRadar.forEach(sig => {
      detected.push(sig);
      addedKeywords.add(sig.keyword.toLowerCase());
    });
  }

  // 2. Scan scenario text with built-in dictionary
  const scenarioText = `${question.scenario} ${question.explanation}`;
  for (const entry of AWS_RADAR_DICTIONARY) {
    if (entry.pattern.test(scenarioText)) {
      if (!addedKeywords.has(entry.keyword.toLowerCase())) {
        detected.push({
          keyword: entry.keyword,
          category: entry.category,
          meaning: entry.meaning,
          targetConcept: entry.targetConcept
        });
        addedKeywords.add(entry.keyword.toLowerCase());
      }
    }
  }

  return detected;
}

/**
 * Splits scenario text into interactive segments (highlighted radar keywords vs normal text).
 * Handles case-insensitive word matching safely without regex replacement pitfalls.
 */
export function parseRadarSegments(
  scenario: string,
  signals: KeywordRadarSignal[]
): Array<{ text: string; signal?: KeywordRadarSignal }> {
  if (!signals || signals.length === 0) {
    return [{ text: scenario }];
  }

  // Collect all match spans
  interface Span {
    start: number;
    end: number;
    signal: KeywordRadarSignal;
  }

  const spans: Span[] = [];

  signals.forEach(sig => {
    // Escape regex special chars in the keyword or derive key terms
    const rawTerms = sig.keyword.split(/\s*[\/,]\s*|\s+vs\s+/i);
    rawTerms.forEach(term => {
      const clean = term.trim();
      if (clean.length < 3) return;

      const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // allow flexible whitespace
      const regexStr = `\\b${escaped.replace(/\s+/g, '\\s+')}\\b`;
      try {
        const re = new RegExp(regexStr, 'gi');
        let m: RegExpExecArray | null;
        while ((m = re.exec(scenario)) !== null) {
          spans.push({
            start: m.index,
            end: m.index + m[0].length,
            signal: sig
          });
        }
      } catch (e) {
        // fallback to substring search
        const idx = scenario.toLowerCase().indexOf(clean.toLowerCase());
        if (idx !== -1) {
          spans.push({
            start: idx,
            end: idx + clean.length,
            signal: sig
          });
        }
      }
    });
  });

  // Sort spans by start asc, end desc
  spans.sort((a, b) => a.start - b.start || b.end - a.end);

  // Filter overlapping spans
  const nonOverlapping: Span[] = [];
  let lastEnd = 0;
  for (const span of spans) {
    if (span.start >= lastEnd) {
      nonOverlapping.push(span);
      lastEnd = span.end;
    }
  }

  if (nonOverlapping.length === 0) {
    return [{ text: scenario }];
  }

  const result: Array<{ text: string; signal?: KeywordRadarSignal }> = [];
  let cursor = 0;

  for (const span of nonOverlapping) {
    if (span.start > cursor) {
      result.push({ text: scenario.slice(cursor, span.start) });
    }
    result.push({
      text: scenario.slice(span.start, span.end),
      signal: span.signal
    });
    cursor = span.end;
  }

  if (cursor < scenario.length) {
    result.push({ text: scenario.slice(cursor) });
  }

  return result;
}

export const RADAR_CATEGORY_META = {
  constraint: {
    label: 'Key Constraint / Goal',
    color: 'amber',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    highlightClass: 'bg-amber-400/20 text-amber-200 border-b-2 border-amber-400 px-1 py-0.5 rounded cursor-pointer font-semibold hover:bg-amber-400/30 transition-all',
    icon: '🎯'
  },
  workload: {
    label: 'Workload Characteristic',
    color: 'cyan',
    badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    highlightClass: 'bg-cyan-400/20 text-cyan-200 border-b-2 border-cyan-400 px-1 py-0.5 rounded cursor-pointer font-semibold hover:bg-cyan-400/30 transition-all',
    icon: '⚡'
  },
  architecture: {
    label: 'Architectural Anchor',
    color: 'purple',
    badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    highlightClass: 'bg-purple-400/20 text-purple-200 border-b-2 border-purple-400 px-1 py-0.5 rounded cursor-pointer font-semibold hover:bg-purple-400/30 transition-all',
    icon: '🏛️'
  },
  trap: {
    label: 'Elimination Trap / Pitfall',
    color: 'rose',
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    highlightClass: 'bg-rose-400/20 text-rose-200 border-b-2 border-rose-400 px-1 py-0.5 rounded cursor-pointer font-semibold hover:bg-rose-400/30 transition-all',
    icon: '⚠️'
  }
};
