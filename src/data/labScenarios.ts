import { LabScenario } from '../types';

export const LAB_SCENARIOS: LabScenario[] = [
  {
    id: 'lab-patch-nginx-zerodowntime',
    title: 'Zero-Downtime NGINX Security Patching',
    difficulty: 'Beginner',
    timeEstimate: '5 mins',
    category: 'patching',
    description: 'A critical CVE has been published for NGINX edge proxy. Check package status, apply the security update, verify syntax, and reload gracefully with 0 dropped connections.',
    scenarioBriefing: 'You are the primary on-call SysAdmin. The security operations center (SOC) flagged host `prod-web-01` running a vulnerable NGINX version. You need to upgrade the package and reload without killing live connections.',
    targetObjective: 'Upgrade NGINX, verify configuration syntax, and perform a graceful systemd reload.',
    initialFs: {
      '/etc/nginx/nginx.conf': 'user www-data;\nworker_processes auto;\nevents { worker_connections 1024; }\nhttp {\n  include /etc/nginx/mime.types;\n  server {\n    listen 80;\n    location / { return 200 "Healthy"; }\n  }\n}',
      '/var/log/nginx/error.log': '[warn] 4102#4102: *1 security advisory CVE-2024-24576 detected on current build',
      '/etc/os-release': 'NAME="Ubuntu"\nVERSION="22.04.4 LTS (Jammy Jellyfish)"\nID=ubuntu'
    },
    initialServices: {
      'nginx': 'active',
      'ssh': 'active'
    },
    steps: [
      {
        instruction: 'Step 1: Check pending upgradable packages on the server.',
        hint: 'Use `apt update` or `apt list --upgradable`.',
        expectedCommandRegex: /^(sudo\s+)?(apt\s+update|apt\s+list\s+--upgradable|apt-get\s+update)/i,
        explanation: 'Refreshing the APT package cache indexes the latest security errata from Canonical repositories.'
      },
      {
        instruction: 'Step 2: Apply the security upgrade specifically to NGINX.',
        hint: 'Use `sudo apt install --only-upgrade nginx -y` or `sudo apt-get install --only-upgrade nginx -y`.',
        expectedCommandRegex: /^(sudo\s+)?(apt|apt-get)\s+install\s+(--only-upgrade\s+nginx|-y\s+--only-upgrade\s+nginx|--only-upgrade\s+-y\s+nginx|nginx\s+--only-upgrade)/i,
        explanation: 'Using `--only-upgrade` ensures you only patch NGINX without accidentally pulling in major unrelated system changes.'
      },
      {
        instruction: 'Step 3: Test the NGINX configuration file syntax before applying changes.',
        hint: 'Run `sudo nginx -t`.',
        expectedCommandRegex: /^(sudo\s+)?nginx\s+-t/i,
        explanation: 'Golden SysAdmin Rule: NEVER reload or restart a web server without testing syntax first (`nginx -t`).'
      },
      {
        instruction: 'Step 4: Reload the NGINX service gracefully with systemd.',
        hint: 'Run `sudo systemctl reload nginx`.',
        expectedCommandRegex: /^(sudo\s+)?systemctl\s+reload\s+nginx(\.service)?/i,
        explanation: '`systemctl reload` sends SIGHUP to the master process, spinning up new worker processes on the new binary while old workers finish in-flight HTTP requests.'
      }
    ],
    congratulationMessage: 'Outstanding! You patched NGINX and executed a seamless zero-downtime reload. Production users experienced 0 seconds of disruption.'
  },
  {
    id: 'lab-broken-dpkg-lock',
    title: 'Diagnosing & Fixing a Broken DPKG Package Lock',
    difficulty: 'Intermediate',
    timeEstimate: '7 mins',
    category: 'troubleshooting',
    description: 'An automated background job terminated abruptly, leaving `/var/lib/dpkg/lock-frontend` locked and dpkg in an unconfigured state. Clear the lock and fix package integrity.',
    scenarioBriefing: 'A junior admin ran an upgrade over an unstable SSH connection that dropped mid-transaction. Now, all `apt` commands fail with "Could not get lock /var/lib/dpkg/lock-frontend".',
    targetObjective: 'Identify the stuck process, clear the lock safely, reconfigure broken packages, and verify package manager health.',
    initialFs: {
      '/var/lib/dpkg/lock-frontend': 'LOCKED_BY_PID_3148',
      '/var/lib/dpkg/updates/': 'partial_transaction_marker'
    },
    initialServices: {
      'apt-daily': 'failed'
    },
    steps: [
      {
        instruction: 'Step 1: Identify which PID holds the lock on the dpkg frontend lockfile.',
        hint: 'Use `fuser /var/lib/dpkg/lock-frontend` or `lsof /var/lib/dpkg/lock-frontend` or `ps aux | grep apt`.',
        expectedCommandRegex: /^(sudo\s+)?(fuser|lsof|ps)\s+.*(dpkg|apt|3148)?/i,
        explanation: 'Checking the lock holder prevents killing an active live upgrade in progress.'
      },
      {
        instruction: 'Step 2: Terminate the orphaned crashed process (PID 3148) or remove the stale lockfile.',
        hint: 'Run `sudo kill -9 3148` or `sudo rm /var/lib/dpkg/lock-frontend`.',
        expectedCommandRegex: /^(sudo\s+)?(kill\s+(-9\s+)?3148|rm\s+(-f\s+)?\/var\/lib\/dpkg\/lock(-frontend)?)/i,
        explanation: 'Removing the orphaned lock releases the mutex back to the operating system.'
      },
      {
        instruction: 'Step 3: Reconfigure any partially unpacked or unconfigured packages.',
        hint: 'Run `sudo dpkg --configure -a`.',
        expectedCommandRegex: /^(sudo\s+)?dpkg\s+--configure\s+-a/i,
        explanation: '`dpkg --configure -a` resumes interrupted post-install configuration scripts and registers packages in the status database.'
      },
      {
        instruction: 'Step 4: Fix any remaining broken dependencies with APT.',
        hint: 'Run `sudo apt install -f -y` or `sudo apt-get install -f -y`.',
        expectedCommandRegex: /^(sudo\s+)?(apt|apt-get)\s+install\s+(-f|-f\s+-y|-y\s+-f)/i,
        explanation: '`apt install -f` (fix-broken) downloads and installs missing dependent libraries to restore clean state.'
      }
    ],
    congratulationMessage: 'Great job! You recovered the package database from a corrupt locked state without corrupting system binaries.'
  },
  {
    id: 'lab-install-postgres',
    title: 'Deploying & Hardening PostgreSQL 16 on Linux',
    difficulty: 'Intermediate',
    timeEstimate: '8 mins',
    category: 'installation',
    description: 'Deploy PostgreSQL 16 database server, configure the systemd unit, verify listening ports on 5432, and test local database connectivity.',
    scenarioBriefing: 'The backend development team requested a dedicated production PostgreSQL 16 database node. You must install the package, initialize the database cluster, and enable the service.',
    targetObjective: 'Install PostgreSQL 16, start and enable the systemd daemon, and verify local psql connectivity.',
    initialFs: {
      '/etc/os-release': 'NAME="Ubuntu"\nVERSION="24.04 LTS (Noble Numbat)"\nID=ubuntu'
    },
    initialServices: {
      'postgresql': 'inactive'
    },
    steps: [
      {
        instruction: 'Step 1: Update package list and install postgresql-16 and postgresql-contrib.',
        hint: 'Run `sudo apt update && sudo apt install postgresql-16 postgresql-contrib -y`.',
        expectedCommandRegex: /^(sudo\s+)?(apt|apt-get)\s+(update\s+&&\s+(sudo\s+)?(apt|apt-get)\s+)?install\s+.*postgresql.*/i,
        explanation: 'Installs the PostgreSQL server binaries, core utilities, and standard extension packages.'
      },
      {
        instruction: 'Step 2: Enable and start the PostgreSQL systemd service.',
        hint: 'Run `sudo systemctl enable --now postgresql`.',
        expectedCommandRegex: /^(sudo\s+)?systemctl\s+(enable\s+--now\s+postgresql|start\s+postgresql(\s+&&\s+(sudo\s+)?systemctl\s+enable\s+postgresql)?)/i,
        explanation: '`--now` enables the service to start automatically on system boot and activates it immediately in a single command.'
      },
      {
        instruction: 'Step 3: Verify that PostgreSQL is actively listening on TCP port 5432.',
        hint: 'Run `sudo ss -tulpn | grep 5432` or `sudo netstat -plnt | grep 5432`.',
        expectedCommandRegex: /^(sudo\s+)?(ss|netstat)\s+.*(5432|postgres)?/i,
        explanation: 'Verifying socket listeners with `ss -tulpn` confirms the daemon is properly bound to network sockets.'
      },
      {
        instruction: 'Step 4: Execute a test SQL query as the postgres system user.',
        hint: 'Run `sudo -u postgres psql -c "SELECT version();"`.',
        expectedCommandRegex: /^(sudo\s+-u\s+postgres\s+)?psql\s+(-c\s+["']SELECT\s+version\(\);?["']|--version)/i,
        explanation: 'Connecting via the postgres peer user validates that local Unix domain socket authentication is working.'
      }
    ],
    congratulationMessage: 'Database deployment verified! PostgreSQL 16 is active, socket-bound, and operational with peer authentication.'
  },
  {
    id: 'lab-kernel-hold-rollback',
    title: 'Pinning Problematic Kernel Packages & Rollback Safety',
    difficulty: 'Advanced',
    timeEstimate: '6 mins',
    category: 'security',
    description: 'A regression was reported in `linux-image-generic`. Pin the package with apt-mark hold to prevent accidental upgrades during routine maintenance.',
    scenarioBriefing: 'A hardware RAID controller driver is incompatible with the latest kernel release. You must lock the kernel packages to prevent automated maintenance cron jobs from installing it.',
    targetObjective: 'Inspect current kernel packages, put a hold on `linux-image-generic`, and verify the hold table.',
    initialFs: {
      '/boot/config-6.1.0-21-amd64': 'CONFIG_RAID=y',
      '/etc/apt/preferences': ''
    },
    initialServices: {
      'systemd-udevd': 'active'
    },
    steps: [
      {
        instruction: 'Step 1: Check the currently running kernel version.',
        hint: 'Run `uname -r` or `uname -a`.',
        expectedCommandRegex: /^uname\s+(-r|-a)/i,
        explanation: 'Identifies the active kernel release string running in RAM.'
      },
      {
        instruction: 'Step 2: Place a package hold on the kernel meta-package linux-image-generic.',
        hint: 'Run `sudo apt-mark hold linux-image-generic linux-headers-generic`.',
        expectedCommandRegex: /^(sudo\s+)?apt-mark\s+hold\s+linux-image-generic.*/i,
        explanation: 'Holding the package marks it in the DPKG status file, instructing APT to skip it during `apt upgrade` and `apt dist-upgrade`.'
      },
      {
        instruction: 'Step 3: Verify the list of held packages.',
        hint: 'Run `sudo apt-mark showhold`.',
        expectedCommandRegex: /^(sudo\s+)?apt-mark\s+showhold/i,
        explanation: 'Confirms that the hold flag is persistently set.'
      }
    ],
    congratulationMessage: 'Safety lock applied! The kernel package is firmly pinned and will not be upgraded during automated unattended updates.'
  }
];
