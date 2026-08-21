export type OsFamily = 'debian' | 'rhel' | 'suse' | 'arch' | 'windows';

export type AppCategory = 
  | 'web-servers'
  | 'databases'
  | 'containers'
  | 'monitoring'
  | 'security'
  | 'runtimes';

export interface PatchCommandGuide {
  id: string;
  osName: string;
  osFamily: OsFamily;
  packageManager: string;
  checkUpdatesCmd: string;
  securityOnlyCmd: string;
  fullUpgradeCmd: string;
  singlePackageCmd: string;
  holdPackageCmd: string;
  unholdPackageCmd: string;
  historyAndRollbackCmd: string;
  cleanCacheCmd: string;
  liveKernelPatchCmd: string;
  rebootCheckCmd: string;
  autoUpdateSetup: string;
  proTips: string[];
  caveats: string[];
}

export interface PatchLifecycleStage {
  stageNumber: number;
  title: string;
  tagline: string;
  description: string;
  keyActions: string[];
  verificationCommands: string[];
  riskMitigations: string[];
  checklist: string[];
}

export interface MockServer {
  id: string;
  hostname: string;
  role: string;
  ip: string;
  os: string;
  osFamily: OsFamily;
  kernelVersion: string;
  uptime: string;
  patchStatus: 'up-to-date' | 'security-pending' | 'critical-cve' | 'reboot-required';
  pendingUpdatesCount: number;
  criticalCveCount: number;
  cves: {
    cveId: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    cvssScore: number;
    packageName: string;
    description: string;
    fixVersion: string;
  }[];
  maintenanceWindow: string;
  lastPatched: string;
}

export interface ApplicationDefinition {
  id: string;
  name: string;
  category: AppCategory;
  description: string;
  officialSite: string;
  defaultPort: number | string;
  popularUses: string[];
  supportedDistros: {
    osFamily: OsFamily;
    osName: string;
    installBash: string;
    serviceName: string;
    configFile: string;
    verifyCommand: string;
  }[];
  systemdUnitExample: string;
  dockerComposeExample: string;
  ansibleTaskExample: string;
  powershellExample?: string;
  hardeningBestPractices: string[];
  commonTroubleshooting: {
    problem: string;
    symptom: string;
    fix: string;
  }[];
}

export interface LabScenario {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  timeEstimate: string;
  category: 'patching' | 'installation' | 'troubleshooting' | 'security';
  description: string;
  scenarioBriefing: string;
  targetObjective: string;
  initialFs: Record<string, string>;
  initialServices: Record<string, 'active' | 'inactive' | 'failed'>;
  steps: {
    instruction: string;
    hint: string;
    expectedCommandRegex: RegExp | string;
    explanation: string;
  }[];
  congratulationMessage: string;
}

export interface AdminChecklistItem {
  id: string;
  category: 'Patching & Maintenance' | 'Service Installation & Hardening' | 'Disaster Recovery' | 'Monitoring & Logs';
  title: string;
  description: string;
  impactLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  commandExample?: string;
  completed: boolean;
}

export interface CheatSheetEntry {
  category: string;
  title: string;
  command: string;
  description: string;
  flags?: string;
}
