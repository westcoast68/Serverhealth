import { AdminChecklistItem, CheatSheetEntry } from '../types';

export const ADMIN_CHECKLISTS: AdminChecklistItem[] = [
  {
    id: 'chk-1',
    category: 'Patching & Maintenance',
    title: 'Pre-Patch Storage Snapshot / Hypervisor Backup',
    description: 'Always take an immutable snapshot or VM backup prior to applying kernel or database package updates.',
    impactLevel: 'CRITICAL',
    commandExample: 'aws ec2 create-snapshot --volume-id vol-xxx --description "Pre-patch backup" # or vSphere Snapshot',
    completed: true
  },
  {
    id: 'chk-2',
    category: 'Patching & Maintenance',
    title: 'Verify Partition Disk Space & Inodes',
    description: 'Ensure /boot has at least 1GB and / has at least 20% free space to avoid dpkg/rpm corruption during unpacking.',
    impactLevel: 'HIGH',
    commandExample: 'df -h && df -i',
    completed: true
  },
  {
    id: 'chk-3',
    category: 'Patching & Maintenance',
    title: 'Traffic Drain & Load Balancer Cordon',
    description: 'Remove the target node from round-robin load balancers or cordon Kubernetes worker nodes before taking them down.',
    impactLevel: 'HIGH',
    commandExample: 'kubectl cordon node-01 && kubectl drain node-01 --ignore-daemonsets',
    completed: false
  },
  {
    id: 'chk-4',
    category: 'Patching & Maintenance',
    title: 'Post-Patch Failed Unit & Listening Port Audit',
    description: 'Check for failed systemd services and compare pre-patch vs post-patch open sockets with diff.',
    impactLevel: 'CRITICAL',
    commandExample: 'systemctl --failed && ss -tulpn',
    completed: false
  },
  {
    id: 'chk-5',
    category: 'Service Installation & Hardening',
    title: 'Dedicated Non-Root System Service Users',
    description: 'Never run application daemons as root. Create dedicated system users with /bin/false or /usr/sbin/nologin shell.',
    impactLevel: 'CRITICAL',
    commandExample: 'sudo useradd -r -s /bin/false -d /var/lib/myapp -M myapp',
    completed: false
  },
  {
    id: 'chk-6',
    category: 'Service Installation & Hardening',
    title: 'Systemd Security Sandboxing Directives',
    description: 'Include ProtectSystem=strict, ProtectHome=true, PrivateTmp=true, and NoNewPrivileges=true in systemd unit files.',
    impactLevel: 'HIGH',
    commandExample: '# In [Service] section of .service file:\nProtectSystem=strict\nPrivateTmp=true',
    completed: false
  },
  {
    id: 'chk-7',
    category: 'Service Installation & Hardening',
    title: 'Firewall Default Deny & Minimal Port Rules',
    description: 'Configure UFW or firewalld with default deny incoming policy; only whitelist required ports from trusted CIDR blocks.',
    impactLevel: 'CRITICAL',
    commandExample: 'sudo ufw default deny incoming && sudo ufw allow from 10.0.0.0/16 to any port 5432 proto tcp',
    completed: false
  },
  {
    id: 'chk-8',
    category: 'Service Installation & Hardening',
    title: 'SSH Hardening (No Passwords, No Root Login)',
    description: 'Disable PermitRootLogin and PasswordAuthentication in /etc/ssh/sshd_config.d/ and enforce Ed25519 public keys.',
    impactLevel: 'CRITICAL',
    commandExample: 'PermitRootLogin no\nPasswordAuthentication no\nPubkeyAuthentication yes',
    completed: false
  },
  {
    id: 'chk-9',
    category: 'Monitoring & Logs',
    title: 'Log Rotation & Journald Storage Quotas',
    description: 'Prevent disk exhaustion by configuring SystemMaxUse=1G in /etc/systemd/journald.conf and verifying logrotate.',
    impactLevel: 'HIGH',
    commandExample: 'sudo journalctl --vacuum-size=500M && sudo logrotate -d /etc/logrotate.conf',
    completed: false
  },
  {
    id: 'chk-10',
    category: 'Monitoring & Logs',
    title: 'Node Telemetry & Host Metric Agent',
    description: 'Deploy Prometheus Node Exporter or Datadog agent with systemd process supervision and alerting thresholds.',
    impactLevel: 'MEDIUM',
    commandExample: 'sudo systemctl enable --now prometheus-node-exporter',
    completed: false
  },
  {
    id: 'chk-11',
    category: 'Disaster Recovery',
    title: 'Out-of-Band Serial / IPMI Console Reachability',
    description: 'Confirm AWS EC2 Serial Console, VMware VMRC, or iDRAC/iLO is reachable in case a network or SSH misconfiguration occurs.',
    impactLevel: 'CRITICAL',
    commandExample: 'Test console access via cloud dashboard or IPMI tool',
    completed: false
  },
  {
    id: 'chk-12',
    category: 'Disaster Recovery',
    title: 'Automated Backup Integrity Drill (Quarterly)',
    description: 'Routinely spin up a staging server from production backup dumps to verify data restoration time and zero database corruption.',
    impactLevel: 'HIGH',
    commandExample: 'pg_restore -d test_recovery /backups/prod_backup.dump',
    completed: false
  }
];

export const CHEAT_SHEET_ENTRIES: CheatSheetEntry[] = [
  {
    category: 'Performance Triage (The USE Method)',
    title: 'CPU, Memory & Load Average Instant Check',
    command: 'uptime && vmstat 1 5 && mpstat -P ALL 1 3',
    description: 'Checks run queue length, context switches, system vs user CPU time, and individual core saturation.',
    flags: 'uptime: 1, 5, 15m load averages | vmstat: r (runnable), b (blocked I/O), si/so (swap in/out)'
  },
  {
    category: 'Performance Triage (The USE Method)',
    title: 'Disk I/O Latency & Queue Utilization',
    command: 'iostat -xz 1 5',
    description: 'Examines %util, await (average wait time in ms), r/s and w/s (IOPS). %util > 80% means disk bottleneck.',
    flags: '-x: extended stats, -z: omit inactive disks'
  },
  {
    category: 'Performance Triage (The USE Method)',
    title: 'Network Socket & Connection States',
    command: 'ss -tulpn && ss -s',
    description: 'Fast replacement for netstat. Shows listening ports, process PIDs, and socket summary (TCP ESTAB, TIME-WAIT).',
    flags: '-t: tcp, -u: udp, -l: listening, -p: process name/pid, -n: numeric ports'
  },
  {
    category: 'Troubleshooting & Diagnostics',
    title: 'OOM Killer & Kernel Error Search',
    command: 'sudo dmesg -T | grep -iE "oom|killed process|segfault|error|panic|scsi|ext4|xfs"',
    description: 'Inspects ring buffer for Out-Of-Memory kernel kills, filesystem errors, or hardware SCSI timeouts with human-readable timestamps.',
    flags: '-T: human readable timestamp'
  },
  {
    category: 'Troubleshooting & Diagnostics',
    title: 'Systemd Boot Errors & Service Failure Logs',
    command: 'sudo journalctl -b -p err..emerg --no-pager | tail -n 50',
    description: 'Filters system logs for the current boot session (-b) for error (level 3) up to emergency (level 0) priorities.',
    flags: '-b: current boot, -p: priority range, --no-pager: raw output'
  },
  {
    category: 'Package & Service Operations',
    title: 'Check Which Services Need Restart After Patching',
    command: 'sudo needrestart -r l # (Debian/Ubuntu) OR sudo dnf needs-restarting -s # (RHEL)',
    description: 'Scans processes running with open file descriptors pointing to deleted or updated library binaries.',
    flags: '-r l: list only, -r a: automatically restart'
  },
  {
    category: 'Security & Access',
    title: 'Inspect Active User Sessions & Root Elevation Log',
    command: 'who && last -n 10 && sudo grep "sudo:" /var/log/auth.log | tail -n 20',
    description: 'Audits currently logged in TTYs/SSHs, recent login history, and recent sudo commands executed on host.'
  },
  {
    category: 'Windows Server & PowerShell',
    title: 'Check Windows Services & Port Listeners in PowerShell',
    command: 'Get-Service | Where-Object {$_.Status -eq "Running"} | Select-Object -First 15; Get-NetTCPConnection -State Listen | Select-Object LocalAddress, LocalPort, OwningProcess',
    description: 'PowerShell equivalent of systemctl running units and netstat listening sockets.'
  },
  {
    category: 'Windows Server & PowerShell',
    title: 'Test Remote TCP Port Connectivity (No Telnet Needed)',
    command: 'Test-NetConnection -ComputerName "10.0.12.5" -Port 5432 -InformationLevel Detailed',
    description: 'Built-in PowerShell cmdlet to verify firewall rules and TCP socket reachability with routing diagnostics.'
  }
];

export const SYSADMIN_COMMANDMENTS = [
  {
    rule: 'Rule 1: Always Test Backups, Not Just Backup Creation',
    detail: 'A backup is only as good as its tested restore process. If you have not tested restoring a snapshot or database dump in the last 90 days, you do not have a backup.'
  },
  {
    rule: 'Rule 2: Never Run `rm -rf` or Restart Daemons Blindly in Production',
    detail: 'Always check config syntax before reload (`nginx -t`, `sshd -t`, `apachectl configtest`, `named-checkconf`). Always double-check current working directory (`pwd`) before file operations.'
  },
  {
    rule: 'Rule 3: Keep an Active Root SSH Session Open When Modifying Firewall or SSHD',
    detail: 'When tweaking `/etc/ssh/sshd_config` or firewall rules (UFW/Firewalld/iptables), NEVER disconnect your current SSH shell. Open a SECOND terminal window to test connection before closing the working one.'
  },
  {
    rule: 'Rule 4: Staged Canary Rollouts Prevent Catastrophes',
    detail: 'Never push a kernel, security patch, or application update to 100% of production servers at once. Use rings (Staging -> Canary 10% -> 50% -> Master Nodes) with monitoring interval pauses.'
  },
  {
    rule: 'Rule 5: Automate Routine Work, Document Exceptions',
    detail: 'Anything you do more than twice must be codified as an Ansible playbook, Bash script, or Terraform module. Manual server configuration inevitably leads to configuration drift.'
  },
  {
    rule: 'Rule 6: Restrict Least Privilege & Sandbox Services',
    detail: 'No application daemon should run as UID 0 (root). Use systemd sandboxing directives (`ProtectSystem=strict`, `NoNewPrivileges=true`, `PrivateTmp=true`) to contain zero-day exploits.'
  }
];
