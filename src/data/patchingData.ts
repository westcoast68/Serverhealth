import { PatchCommandGuide, PatchLifecycleStage, MockServer } from '../types';

export const PATCH_COMMAND_GUIDES: PatchCommandGuide[] = [
  {
    id: 'ubuntu-debian',
    osName: 'Ubuntu 24.04 / 22.04 LTS & Debian 12',
    osFamily: 'debian',
    packageManager: 'APT (Advanced Package Tool)',
    checkUpdatesCmd: 'sudo apt update && sudo apt list --upgradable',
    securityOnlyCmd: 'sudo apt-get --just-print upgrade 2>&1 | perl -ne \'s/Inst (\\S+) \\[(\\S+)\\] .*/$1/ and print "$1\\n"\' | grep -i security | xargs -r sudo apt-get install -y --only-upgrade',
    fullUpgradeCmd: 'sudo apt update && sudo apt dist-upgrade -y',
    singlePackageCmd: 'sudo apt update && sudo apt install --only-upgrade nginx -y',
    holdPackageCmd: 'sudo apt-mark hold linux-image-generic nginx\nsudo apt-mark showhold',
    unholdPackageCmd: 'sudo apt-mark unhold linux-image-generic',
    historyAndRollbackCmd: 'cat /var/log/dpkg.log | grep -E "upgrade|installed"\n# Or inspect APT history:\ncat /var/log/apt/history.log | tail -n 40',
    cleanCacheCmd: 'sudo apt autoremove --purge -y && sudo apt clean',
    liveKernelPatchCmd: 'sudo ua status # Canonical Ubuntu Pro Livepatch\nsudo canonical-livepatch status',
    rebootCheckCmd: 'if [ -f /var/run/reboot-required ]; then echo ">>> REBOOT REQUIRED <<<"; cat /var/run/reboot-required.pkgs; else echo "No reboot required."; fi\nsudo needrestart -r l',
    autoUpdateSetup: `sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure --priority=low unattended-upgrades
# Edit /etc/apt/apt.conf.d/50unattended-upgrades
# Ensure "origin=Ubuntu,codename=\${distro_codename}-security"; is uncommented
# Test dry run:
sudo unattended-upgrades --dry-run --debug`,
    proTips: [
      'Always run `needrestart` after patching to inspect services using old libraries in memory without restarting the whole OS.',
      'Pin critical package versions with `/etc/apt/preferences.d/` pinning to prevent unintended major version jumps.',
      'Check `/var/run/reboot-required` in monitoring tools (like Prometheus node_exporter textfile collector) to alert on pending reboots.',
      'Use `apt-get dist-upgrade` rather than simple `apt upgrade` when kernel updates introduce new dependency packages.'
    ],
    caveats: [
      'Never run `apt upgrade` without running `apt update` first; out-of-sync indexes cause 404 hash sum mismatches.',
      'Watch out for interactive prompts (like debconf config file conflicts) in automated scripts; pass `DEBIAN_FRONTEND=noninteractive` to avoid freezing cron jobs.',
      'Ensure `/boot` has at least 1GB free space before kernel upgrades to prevent dpkg broken states.'
    ]
  },
  {
    id: 'rhel-rocky-alma',
    osName: 'Red Hat Enterprise Linux 9 / Rocky Linux / AlmaLinux / CentOS Stream',
    osFamily: 'rhel',
    packageManager: 'DNF (Dandified YUM) / RPM',
    checkUpdatesCmd: 'sudo dnf check-update\nsudo dnf updateinfo summary',
    securityOnlyCmd: 'sudo dnf update --security -y\n# List security advisories:\nsudo dnf updateinfo list --security --installed',
    fullUpgradeCmd: 'sudo dnf upgrade -y',
    singlePackageCmd: 'sudo dnf upgrade-to httpd -y\n# Or update single pkg:\nsudo dnf update nginx -y',
    holdPackageCmd: 'sudo dnf versionlock add kernel* nginx*\nsudo dnf versionlock list',
    unholdPackageCmd: 'sudo dnf versionlock delete kernel*',
    historyAndRollbackCmd: 'sudo dnf history list\n# Rollback specific transaction:\nsudo dnf history info <transaction-id>\nsudo dnf history undo <transaction-id> -y',
    cleanCacheCmd: 'sudo dnf clean all && sudo dnf autoremove -y',
    liveKernelPatchCmd: 'sudo dnf install kpatch -y\nsudo kpatch list\nsudo dnf install kpatch-dnf -y',
    rebootCheckCmd: 'sudo dnf needs-restarting -r\n# Check processes needing restart:\nsudo dnf needs-restarting -s',
    autoUpdateSetup: `sudo dnf install dnf-automatic -y
# Edit /etc/dnf/automatic.conf:
# [commands]
# upgrade_type = security
# apply_updates = yes
sudo systemctl enable --now dnf-automatic.timer
sudo systemctl list-timers | grep dnf-automatic`,
    proTips: [
      'DNF history undo is a superpower! If a patch breaks your app, `sudo dnf history list` followed by `sudo dnf history undo last` immediately reverts the exact RPM states.',
      'Use `dnf updateinfo info --cve CVE-2024-XXXX` to get full CVSS details, bugzilla references, and errata classifications directly from Red Hat security repositories.',
      'Use `dnf needs-restarting -r` in CI/CD or health scripts to return returncode 1 if reboot is necessary, 0 otherwise.',
      'Always test dnf versionlock plugin in Enterprise environments where database engines must stay on strict patch minor versions.'
    ],
    caveats: [
      'Do not mix third-party repositories (EPEL, Remi) without proper `dnf config-manager --set-enabled` and priorities to prevent RPM dependency collisions.',
      'Ensure SELinux policies are updated when security packages update daemon contexts; never set SELinux to `permissive` as a lazy fix.'
    ]
  },
  {
    id: 'suse-sles',
    osName: 'SUSE Linux Enterprise Server (SLES) 15 / OpenSUSE Leap',
    osFamily: 'suse',
    packageManager: 'ZYpp / Zypper',
    checkUpdatesCmd: 'sudo zypper list-patches\nsudo zypper list-updates',
    securityOnlyCmd: 'sudo zypper patch --category security -y',
    fullUpgradeCmd: 'sudo zypper update -y',
    singlePackageCmd: 'sudo zypper update apache2 -y',
    holdPackageCmd: 'sudo zypper addlock kernel-default\nsudo zypper locks',
    unholdPackageCmd: 'sudo zypper removelock kernel-default',
    historyAndRollbackCmd: 'cat /var/log/zypp/history | tail -n 50\n# Snapper Btrfs root snapshot rollback:\nsudo snapper list\nsudo snapper rollback <snapshot-number>',
    cleanCacheCmd: 'sudo zypper clean --all',
    liveKernelPatchCmd: 'sudo zypper in kernel-livepatch-SLE15-SP5\nsudo klp status',
    rebootCheckCmd: 'sudo zypper ps -s',
    autoUpdateSetup: `sudo zypper install yast2-online-update-configuration
# Or configure cron systemd timer for security patches:
sudo zypper --non-interactive patch --category security`,
    proTips: [
      'SLES with Btrfs has native `snapper` integration. Every Zypper transaction automatically takes a pre and post snapshot of `/`, allowing instant zero-loss rollback from GRUB boot menu if the kernel fails.',
      'Use `zypper ps -s` to list all daemons currently running with deleted/unlinked shared libraries following patch updates.'
    ],
    caveats: [
      'Always verify SCC (SUSE Customer Center) subscription tokens are active with `SUSEConnect -s` before patching production clusters.'
    ]
  },
  {
    id: 'windows-server',
    osName: 'Windows Server 2025 / 2022 / 2019',
    osFamily: 'windows',
    packageManager: 'PSWindowsUpdate / Windows Update Agent / WSUS / Azure Update Manager',
    checkUpdatesCmd: `# PowerShell (Run as Administrator):
Install-Module -Name PSWindowsUpdate -Force -SkipPublisherCheck
Get-WUList`,
    securityOnlyCmd: `Get-WUInstall -Category 'Security Updates','Critical Updates' -AcceptAll -IgnoreReboot`,
    fullUpgradeCmd: `Install-WindowsUpdate -MicrosoftUpdate -AcceptAll -AutoReboot`,
    singlePackageCmd: `Get-WUInstall -KBArticleID 'KB5034441' -AcceptAll`,
    holdPackageCmd: `Hide-WUUpdate -KBArticleID 'KB5034441' -Confirm:$false\n# List hidden:\nGet-WUList -IsHidden`,
    unholdPackageCmd: `Show-WUUpdate -KBArticleID 'KB5034441' -Confirm:$false`,
    historyAndRollbackCmd: `Get-WUHistory -MaxDate (Get-Date) | Select-Object -First 20\n# Uninstall bad update:\nRemove-WindowsUpdate -KBArticleID 'KB5034441' -NoRestart`,
    cleanCacheCmd: `Stop-Service wuauserv, bits\nRemove-Item "C:\\Windows\\SoftwareDistribution\\Download\\*" -Recurse -Force\nStart-Service wuauserv, bits\n# Clean Component Store:\nDism.exe /online /Cleanup-Image /StartComponentCleanup /ResetBase`,
    liveKernelPatchCmd: `# Hotpatching (Supported on Windows Server 2022/2025 Azure Edition & Server 2025 Standard):
Get-HotpatchStatus`,
    rebootCheckCmd: `(Get-Item "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\WindowsUpdate\\Auto Update\\RebootRequired" -ErrorAction SilentlyContinue) -ne $null\n# Or with PSWindowsUpdate:\nGet-WURebootStatus`,
    autoUpdateSetup: `# Configure Group Policy via Registry for 3:00 AM Maintenance:
Set-ItemProperty -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate\\AU" -Name "AUOptions" -Value 4
Set-ItemProperty -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate\\AU" -Name "ScheduledInstallDay" -Value 7
Set-ItemProperty -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate\\AU" -Name "ScheduledInstallTime" -Value 3`,
    proTips: [
      'Use `sconfig` in Windows Server Core to quickly check updates (Option 6) and configure automatic updates (Option 5).',
      'Always test `Get-WURebootStatus` before patching clustered roles like Hyper-V Failover Clusters or SQL Server AlwaysOn Availability Groups.',
      'Run `Dism.exe /online /Cleanup-Image /AnalyzeComponentStore` to reclaim up to 10GB of storage after monthly Cumulative Updates.'
    ],
    caveats: [
      'Windows Cumulative Updates (LCU) are monolithic and cannot be partially installed. You must test the entire cumulative patch in a staging environment.',
      'Never force-kill `TrustedInstaller.exe` during patching as it can corrupt the Component-Based Servicing (CBS) registry hive.'
    ]
  }
];

export const PATCH_LIFECYCLE_STAGES: PatchLifecycleStage[] = [
  {
    stageNumber: 1,
    title: 'Vulnerability Assessment & Triage',
    tagline: 'Identify exposures, analyze CVSS/EPSS scores, and establish SLA timelines.',
    description: 'Continuously scan the server fleet against NIST NVD, vendor security advisories, and CVE feeds to prioritize critical zero-days and privilege escalation bugs.',
    keyActions: [
      'Categorize incoming patches into Emergency (CVSS > 9.0 / active exploitation), Critical (CVSS 7.0-8.9), and Routine (Regular Patch Tuesday / Monthly).',
      'Determine affected workloads (Internet-facing bastions, internal database clusters, API gateways).',
      'Check vendor errata for known regressions or breaking changes with third-party kernel drivers.'
    ],
    verificationCommands: [
      '# Debian/Ubuntu:\napt list --upgradable | grep -i security',
      '# RHEL:\ndnf updateinfo list cves --security',
      '# Query specific CVE on host:\ndnf updateinfo info --cve CVE-2024-6387'
    ],
    riskMitigations: [
      'Set an SLA target: Emergency (24-48 hours), Critical (7 days), Routine (30 days).',
      'Consult the CISA KEV (Known Exploited Vulnerabilities) catalog before deferring any patch.'
    ],
    checklist: [
      'Identified all impacted hostnames and IP addresses',
      'Verified CVSS score and checked if exploit is publicly available',
      'Determined if application dependencies will break',
      'Logged change ticket in ITSM (ServiceNow/Jira) with risk classification'
    ]
  },
  {
    stageNumber: 2,
    title: 'Pre-Patch Staging & Safety Baselines',
    tagline: 'Snapshots, health baselines, and failover validation.',
    description: 'Never patch production without an immediate recovery mechanism. Take volume snapshots, record baseline network/service metrics, and schedule maintenance windows.',
    keyActions: [
      'Create storage volume snapshots (AWS EBS, VMware vSphere Snapshot, Proxmox, or LVM snapshot).',
      'Verify disk space: at least 20% or 5GB free on `/`, `/var`, and `/boot`.',
      'Notify stakeholders and establish a maintenance window banner or broadcast with `wall`.',
      'Drain active traffic from load balancers (HAProxy, AWS ALB, NGINX Plus) or cordoning Kubernetes nodes.'
    ],
    verificationCommands: [
      '# Check free disk and inodes:\ndf -h && df -i\n# Record active listening ports:\nss -tulpn > /tmp/pre_patch_ports.txt\n# Check active systemd units:\nsystemctl list-units --type=service --state=running > /tmp/pre_patch_services.txt',
      '# Notify logged-in users:\nsudo wall "System maintenance starting in 10 minutes. Please save your work."'
    ],
    riskMitigations: [
      'Always test backup restore capability; a snapshot that cannot be booted is useless.',
      'Ensure IPMI / iDRAC / AWS EC2 Serial Console / Proxmox VNC access is reachable in case SSH fails after reboot.'
    ],
    checklist: [
      'Storage snapshot or hypervisor backup verified completed',
      'Sufficient free disk space confirmed on all partitions',
      'Baseline service state recorded to disk',
      'Emergency out-of-band console access verified'
    ]
  },
  {
    stageNumber: 3,
    title: 'Canary & Ring-Based Rollout',
    tagline: 'Deploy progressively across deployment rings to limit blast radius.',
    description: 'Deploy updates in tiered rings rather than all hosts simultaneously. Catch kernel panics, CPU regressions, or memory leaks on non-critical nodes first.',
    keyActions: [
      'Ring 0 (Dev & QA / Staging): Apply immediately, run synthetic end-to-end integration tests.',
      'Ring 1 (Canary / Pilot 5-10% of Prod): Apply, monitor latency, error rates, and CPU for 4-24 hours.',
      'Ring 2 (Production Cluster A / Secondary Replicas): Apply to secondary nodes while primary handles traffic.',
      'Ring 3 (Production Cluster B / Master Nodes): Failover cluster to newly patched nodes, then patch the remaining primary nodes.'
    ],
    verificationCommands: [
      '# Execute patch with non-interactive flags:\n# Debian/Ubuntu:\nDEBIAN_FRONTEND=noninteractive sudo apt-get -y dist-upgrade',
      '# RHEL:\nsudo dnf -y upgrade --security',
      '# Ansible canary playbook execution:\nansible-playbook -i production_inventory.ini patch.yml --limit ring1_canary'
    ],
    riskMitigations: [
      'Maintain cluster quorum at all times (never patch >50% of an odd-numbered quorum cluster simultaneously).',
      'Keep database replication lag at 0 seconds before triggering database node failover.'
    ],
    checklist: [
      'Staging environment passed test suite post-patch',
      'Canary nodes exhibited zero abnormal error log spikes',
      'Database replication synced before failover',
      'Cluster quorum maintained across patching cycle'
    ]
  },
  {
    stageNumber: 4,
    title: 'Post-Patch Verification & Health Check',
    tagline: 'Ensure all daemons, ports, sockets, and dependencies are nominal.',
    description: 'Thoroughly audit the host after update execution and optional reboot to confirm complete service restoration before releasing traffic back.',
    keyActions: [
      'Verify operating system and kernel version (`uname -r` or `[System.Environment]::OSVersion`).',
      'Check systemd failed units with `systemctl --failed` and inspect journal logs for core dumps or crashes.',
      'Verify port listening matrix matches pre-patch baseline with `diff`.',
      'Execute application health checks (HTTP 200 OK on `/healthz`, database connection pool test).'
    ],
    verificationCommands: [
      '# Verify failed services:\nsudo systemctl --failed',
      '# Compare listening ports with baseline:\nss -tulpn > /tmp/post_patch_ports.txt\ndiff /tmp/pre_patch_ports.txt /tmp/post_patch_ports.txt',
      '# Inspect errors in journal since boot:\nsudo journalctl -b -p err..emerg --no-pager | head -n 30',
      '# Synthetic endpoint verification:\ncurl -Iv https://localhost/healthz -k'
    ],
    riskMitigations: [
      'Do not rely solely on `ping`; verify deep application-layer health and database read/write queries.',
      'Re-enable load balancer traffic gradually (5% -> 25% -> 100%) to observe connection behavior.'
    ],
    checklist: [
      'Kernel and package version verified at target level',
      'Zero failed systemd units on the host',
      'All expected TCP/UDP ports are bound and accepting traffic',
      'Application health check endpoints responding 200 OK',
      'Load balancer restored to balanced state'
    ]
  },
  {
    stageNumber: 5,
    title: 'Rollback & Contingency Execution',
    tagline: 'Swift recovery in the event of kernel panic, regression, or service crash.',
    description: 'When an update triggers a regression, execute the pre-planned rollback protocol immediately to minimize downtime and preserve SLA.',
    keyActions: [
      'Kernel Panic / Unbootable Host: Select previous working kernel in GRUB / systemd-boot menu, boot into rescue mode, and set previous kernel as default.',
      'Single Package Regression: Revert using package manager history (e.g. `dnf history undo` or `apt install <pkg>=<old_version>`).',
      'Catastrophic failure: Revert hypervisor or EBS storage snapshot to exact pre-patch timestamp.',
      'Post-incident root cause analysis (RCA) and vendor bug report filing.'
    ],
    verificationCommands: [
      '# GRUB kernel rollback:\nsudo grubby --info=ALL\nsudo grubby --set-default=/boot/vmlinuz-5.15.0-XX-generic',
      '# DNF transaction undo:\nsudo dnf history list\nsudo dnf history undo <id> -y',
      '# Re-lock faulty package:\nsudo apt-mark hold <broken-pkg>',
      '# Verify rollback:\ncat /etc/os-release && uname -r'
    ],
    riskMitigations: [
      'Pre-document rollback execution steps in the maintenance ticket before touching the server.',
      'Always test kernel selection in GRUB during test environment drills.'
    ],
    checklist: [
      'Rollback trigger threshold pre-defined (e.g. >15 min downtime or critical service failure)',
      'Working previous kernel and snapshot identified',
      'Rollback executed and verified healthy',
      'Incident report filed and faulty package marked on hold'
    ]
  }
];

export const INITIAL_MOCK_SERVERS: MockServer[] = [
  {
    id: 'srv-web-01',
    hostname: 'prod-web-edge-01.us-east.corp',
    role: 'Primary Edge Reverse Proxy & TLS Gateway',
    ip: '10.0.4.12',
    os: 'Ubuntu 22.04.4 LTS',
    osFamily: 'debian',
    kernelVersion: '5.15.0-105-generic',
    uptime: '142 days, 6 hours',
    patchStatus: 'critical-cve',
    pendingUpdatesCount: 14,
    criticalCveCount: 2,
    cves: [
      {
        cveId: 'CVE-2024-6387',
        severity: 'CRITICAL',
        cvssScore: 9.8,
        packageName: 'openssh-server',
        description: 'RegreSSHion: Remote Unauthenticated Code Execution in OpenSSH server on Linux.',
        fixVersion: '1:8.9p1-3ubuntu0.10'
      },
      {
        cveId: 'CVE-2024-24576',
        severity: 'HIGH',
        cvssScore: 8.8,
        packageName: 'nginx-core',
        description: 'Command injection vulnerability in specific proxy URI decoding handlers.',
        fixVersion: '1.18.0-6ubuntu14.5'
      }
    ],
    maintenanceWindow: 'Saturday 02:00 - 04:00 UTC',
    lastPatched: '2024-03-15'
  },
  {
    id: 'srv-db-01',
    hostname: 'prod-pg-master-01.us-east.corp',
    role: 'PostgreSQL 16 High-Availability Master',
    ip: '10.0.12.5',
    os: 'RHEL 9.3 (Plow)',
    osFamily: 'rhel',
    kernelVersion: '5.14.0-362.24.1.el9_3.x86_64',
    uptime: '89 days, 14 hours',
    patchStatus: 'security-pending',
    pendingUpdatesCount: 8,
    criticalCveCount: 1,
    cves: [
      {
        cveId: 'CVE-2024-10979',
        severity: 'HIGH',
        cvssScore: 8.1,
        packageName: 'postgresql16-server',
        description: 'PostgreSQL PL/Perl environment variable manipulation privilege escalation.',
        fixVersion: '16.5-1.rhel9'
      }
    ],
    maintenanceWindow: 'Sunday 01:00 - 03:00 UTC (Failover required)',
    lastPatched: '2024-05-10'
  },
  {
    id: 'srv-db-02',
    hostname: 'prod-pg-replica-02.us-east.corp',
    role: 'PostgreSQL 16 Read Replica & Standby',
    ip: '10.0.12.6',
    os: 'RHEL 9.3 (Plow)',
    osFamily: 'rhel',
    kernelVersion: '5.14.0-362.24.1.el9_3.x86_64',
    uptime: '89 days, 14 hours',
    patchStatus: 'security-pending',
    pendingUpdatesCount: 8,
    criticalCveCount: 1,
    cves: [
      {
        cveId: 'CVE-2024-10979',
        severity: 'HIGH',
        cvssScore: 8.1,
        packageName: 'postgresql16-server',
        description: 'PostgreSQL PL/Perl environment variable manipulation privilege escalation.',
        fixVersion: '16.5-1.rhel9'
      }
    ],
    maintenanceWindow: 'Saturday 23:00 - 01:00 UTC',
    lastPatched: '2024-05-10'
  },
  {
    id: 'srv-k8s-node-01',
    hostname: 'prod-worker-01.infra.corp',
    role: 'Kubernetes Container Node / Podman Host',
    ip: '10.0.20.101',
    os: 'Ubuntu 24.04 LTS',
    osFamily: 'debian',
    kernelVersion: '6.8.0-31-generic',
    uptime: '18 days, 2 hours',
    patchStatus: 'reboot-required',
    pendingUpdatesCount: 0,
    criticalCveCount: 0,
    cves: [],
    maintenanceWindow: 'Rolling Drain Allowed',
    lastPatched: '2024-08-10'
  },
  {
    id: 'srv-auth-dc-01',
    hostname: 'corp-dc-01.ad.corp',
    role: 'Active Directory Domain Controller / DNS / Kerberos',
    ip: '10.0.2.10',
    os: 'Windows Server 2022 Datacenter',
    osFamily: 'windows',
    kernelVersion: '10.0.20348.2461',
    uptime: '62 days, 1 hour',
    patchStatus: 'critical-cve',
    pendingUpdatesCount: 5,
    criticalCveCount: 1,
    cves: [
      {
        cveId: 'CVE-2024-38077',
        severity: 'CRITICAL',
        cvssScore: 9.8,
        packageName: 'Windows Remote Desktop Licensing Service',
        description: 'Remote Code Execution in Windows Remote Desktop Licensing Service (MadLicense).',
        fixVersion: 'KB5040437'
      }
    ],
    maintenanceWindow: 'Sunday 03:00 - 05:00 UTC',
    lastPatched: '2024-06-11'
  },
  {
    id: 'srv-mon-01',
    hostname: 'ops-mon-grafana.infra.corp',
    role: 'Prometheus, Alertmanager & Grafana Monitoring',
    ip: '10.0.30.55',
    os: 'Debian 12 (Bookworm)',
    osFamily: 'debian',
    kernelVersion: '6.1.0-21-amd64',
    uptime: '190 days, 18 hours',
    patchStatus: 'up-to-date',
    pendingUpdatesCount: 0,
    criticalCveCount: 0,
    cves: [],
    maintenanceWindow: 'Flexible',
    lastPatched: '2024-08-18'
  },
  {
    id: 'srv-redis-01',
    hostname: 'prod-cache-cluster-01.us-east.corp',
    role: 'Redis 7 Session & Cache Cluster Leader',
    ip: '10.0.15.21',
    os: 'Rocky Linux 9.4 (Blue Onyx)',
    osFamily: 'rhel',
    kernelVersion: '5.14.0-427.16.1.el9_4.x86_64',
    uptime: '45 days, 8 hours',
    patchStatus: 'up-to-date',
    pendingUpdatesCount: 0,
    criticalCveCount: 0,
    cves: [],
    maintenanceWindow: 'Tuesday 04:00 - 05:00 UTC',
    lastPatched: '2024-08-05'
  }
];
