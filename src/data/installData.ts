import { ApplicationDefinition, AppCategory } from '../types';

export const ENTERPRISE_APPLICATIONS: ApplicationDefinition[] = [
  {
    id: 'nginx',
    name: 'NGINX Reverse Proxy & Web Server',
    category: 'web-servers',
    description: 'High-performance HTTP server, reverse proxy, load balancer, and TLS terminator for mission-critical web architectures.',
    officialSite: 'https://nginx.org',
    defaultPort: '80 / 443 TCP',
    popularUses: [
      'SSL/TLS Termination & HTTP/2 / HTTP/3 Gateway',
      'Reverse Proxy for Node.js, Python, Go, and Java backend apps',
      'Static Asset caching and Gzip/Brotli compression',
      'Rate limiting & DDoS edge mitigation'
    ],
    supportedDistros: [
      {
        osFamily: 'debian',
        osName: 'Ubuntu 24.04 / 22.04 LTS & Debian 12',
        installBash: `# Update index & install official NGINX package
sudo apt update
sudo apt install nginx -y

# Verify syntax & start systemd daemon
sudo nginx -t
sudo systemctl enable --now nginx

# Configure UFW Firewall rules
sudo ufw allow 'Nginx Full'
sudo ufw status verbose`,
        serviceName: 'nginx.service',
        configFile: '/etc/nginx/nginx.conf & /etc/nginx/sites-available/',
        verifyCommand: 'sudo nginx -t && sudo systemctl status nginx && curl -I http://localhost'
      },
      {
        osFamily: 'rhel',
        osName: 'RHEL 9 / Rocky Linux / AlmaLinux',
        installBash: `# Install NGINX on RHEL/Rocky
sudo dnf install nginx -y

# Allow HTTP and HTTPS through firewalld
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload

# Enable SELinux HTTP network connect (for proxying)
sudo setsebool -P httpd_can_network_connect 1

# Start and enable service
sudo nginx -t
sudo systemctl enable --now nginx`,
        serviceName: 'nginx.service',
        configFile: '/etc/nginx/nginx.conf & /etc/nginx/conf.d/*.conf',
        verifyCommand: 'sudo nginx -t && sudo systemctl status nginx'
      }
    ],
    systemdUnitExample: `[Unit]
Description=The NGINX HTTP and reverse proxy server
After=syslog.target network-online.target remote-fs.target nss-lookup.target
Wants=network-online.target

[Service]
Type=forking
PIDFile=/run/nginx.pid
ExecStartPre=/usr/sbin/nginx -t -q -g 'daemon on; master_process on;'
ExecStart=/usr/sbin/nginx -g 'daemon on; master_process on;'
ExecReload=/usr/sbin/nginx -g 'daemon on; master_process on;' -s reload
ExecStop=-/sbin/start-stop-daemon --quiet --stop --retry QUIT/5 --pidfile /run/nginx.pid
TimeoutStopSec=5
KillMode=mixed
PrivateTmp=true
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target`,
    dockerComposeExample: `services:
  nginx:
    image: nginx:1.27-alpine
    container_name: edge_proxy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./conf.d:/etc/nginx/conf.d:ro
      - ./certs:/etc/ssl/certs:ro
      - ./logs:/var/log/nginx
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost/healthz || exit 1"]
      interval: 15s
      timeout: 5s
      retries: 3
    logging:
      driver: "json-file"
      options:
        max-size: "50m"
        max-file: "5"`,
    ansibleTaskExample: `- name: Ensure Nginx is installed and hardened
  hosts: webservers
  become: yes
  tasks:
    - name: Install NGINX package
      ansible.builtin.package:
        name: nginx
        state: present

    - name: Deploy hardened nginx.conf
      ansible.builtin.template:
        src: templates/nginx.conf.j2
        dest: /etc/nginx/nginx.conf
        validate: 'nginx -t -c %s'
      notify: Restart NGINX

    - name: Ensure NGINX service is enabled and started
      ansible.builtin.systemd:
        name: nginx
        state: started
        enabled: yes`,
    hardeningBestPractices: [
      'Disable server tokens (`server_tokens off;`) to hide version numbers from port scans.',
      'Configure Diffie-Hellman parameters (`ssl_dhparam /etc/ssl/certs/dhparam.pem;`) and TLS 1.2/1.3 only.',
      'Implement strict security headers (HSTS, X-Frame-Options: SAMEORIGIN, X-Content-Type-Options: nosniff, Content-Security-Policy).',
      'Set `client_max_body_size` and `client_body_timeout` to mitigate slowloris attacks.'
    ],
    commonTroubleshooting: [
      {
        problem: 'Port 80/443 already bound (98: Address already in use)',
        symptom: 'nginx fails with `bind() to 0.0.0.0:80 failed` during start.',
        fix: 'Run `sudo ss -tulpn | grep -E "(:80|:443)"` or `sudo lsof -i :80` to find conflicting processes (e.g. Apache, old node app, or crashed nginx worker) and terminate them.'
      },
      {
        problem: '502 Bad Gateway when proxying to upstream localhost:3000',
        symptom: 'NGINX logs `connect() failed (111: Connection refused) while connecting to upstream`.',
        fix: 'Check if backend app is listening with `ss -tulpn | grep 3000`. On RHEL/SELinux, enable network proxying via `sudo setsebool -P httpd_can_network_connect 1`.'
      }
    ]
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL 16 Enterprise Database',
    category: 'databases',
    description: 'The world\'s most advanced open source relational database engine with ACID compliance, JSONB support, and robust clustering replication.',
    officialSite: 'https://www.postgresql.org',
    defaultPort: '5432 TCP',
    popularUses: [
      'Primary transactional datastore for web apps & microservices',
      'Geospatial analysis via PostGIS extension',
      'Streaming replication clusters with patroni or pgpool-II',
      'Enterprise analytics and audit compliance logging'
    ],
    supportedDistros: [
      {
        osFamily: 'debian',
        osName: 'Ubuntu 24.04 / 22.04 LTS & Debian 12',
        installBash: `# Add official PostgreSQL PGDG APT repository
sudo apt install -y curl ca-certificates gnupg
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/postgresql.gpg
echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" | sudo tee /etc/apt/sources.list.d/pgdg.list

# Install PostgreSQL 16
sudo apt update
sudo apt install -y postgresql-16 postgresql-contrib-16

# Verify and start
sudo systemctl enable --now postgresql
sudo -u postgres psql -c "SELECT version();"`,
        serviceName: 'postgresql.service',
        configFile: '/etc/postgresql/16/main/postgresql.conf & pg_hba.conf',
        verifyCommand: 'sudo -u postgres psql -c "SELECT version();" && sudo systemctl status postgresql'
      },
      {
        osFamily: 'rhel',
        osName: 'RHEL 9 / Rocky Linux 9',
        installBash: `# Install PostgreSQL 16 RPM repository
sudo dnf install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-9-x86_64/pgdg-redhat-repo-latest.noarch.rpm
sudo dnf -qy module disable postgresql

# Install PostgreSQL 16 server
sudo dnf install -y postgresql16-server postgresql16-contrib

# Initialize DB cluster & start service
sudo /usr/pgsql-16/bin/postgresql-16-setup initdb
sudo systemctl enable --now postgresql-16

# Open firewall port 5432 for internal subnet
sudo firewall-cmd --permanent --add-port=5432/tcp
sudo firewall-cmd --reload`,
        serviceName: 'postgresql-16.service',
        configFile: '/var/lib/pgsql/16/data/postgresql.conf & pg_hba.conf',
        verifyCommand: 'sudo -u postgres /usr/pgsql-16/bin/psql -c "SELECT version();"'
      }
    ],
    systemdUnitExample: `[Unit]
Description=PostgreSQL RDBMS 16 Server
After=network.target syslog.target

[Service]
Type=notify
User=postgres
Group=postgres
ExecStart=/usr/pgsql-16/bin/postgres -D /var/lib/pgsql/16/data/
ExecReload=/bin/kill -HUP $MAINPID
KillMode=mixed
KillSignal=SIGINT
TimeoutSec=300
OOMScoreAdjust=-1000

# Security Hardening Directives
ProtectSystem=strict
ProtectHome=true
PrivateTmp=true
ReadWritePaths=/var/lib/pgsql/16/data /var/log/postgresql /run/postgresql
LimitNOFILE=65536
LimitNPROC=4096

[Install]
WantedBy=multi-user.target`,
    dockerComposeExample: `services:
  postgres:
    image: postgres:16-alpine
    container_name: enterprise_db
    restart: unless-stopped
    environment:
      POSTGRES_USER: app_admin
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
      POSTGRES_DB: production_app
    ports:
      - "127.0.0.1:5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d:ro
    secrets:
      - db_password
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app_admin -d production_app"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
    driver: local

secrets:
  db_password:
    file: ./secrets/db_password.txt`,
    ansibleTaskExample: `- name: Install and configure PostgreSQL 16
  hosts: dbservers
  become: yes
  tasks:
    - name: Ensure PostgreSQL 16 is installed
      ansible.builtin.package:
        name: postgresql-16
        state: present

    - name: Configure pg_hba.conf authentication rules
      ansible.builtin.copy:
        dest: /etc/postgresql/16/main/pg_hba.conf
        content: |
          # TYPE  DATABASE        USER            ADDRESS                 METHOD
          local   all             postgres                                peer
          local   all             all                                     scram-sha-256
          host    all             all             10.0.0.0/16             scram-sha-256
      notify: Reload PostgreSQL`,
    hardeningBestPractices: [
      'Always enforce `password_encryption = scram-sha-256` instead of deprecated md5.',
      'Bind `listen_addresses` strictly to internal private IP or localhost, never `*` unless protected by VPC/firewall.',
      'Configure WAL archiving and regular `pg_dump` or `pgBackRest` backup schedules.',
      'Tune `shared_buffers = 25% of RAM`, `effective_cache_size = 50-75% of RAM`, and `work_mem` based on concurrent query workload.'
    ],
    commonTroubleshooting: [
      {
        problem: 'FATAL: password authentication failed for user or pg_hba.conf rejects connection',
        symptom: 'Client connection drops with `no pg_hba.conf entry for host`.',
        fix: 'Add host rule to `/etc/postgresql/16/main/pg_hba.conf` (e.g., `host app_db app_user 10.0.0.0/16 scram-sha-256`) and run `sudo systemctl reload postgresql`.'
      }
    ]
  },
  {
    id: 'docker',
    name: 'Docker Engine & Docker Compose',
    category: 'containers',
    description: 'Enterprise container runtime platform allowing isolation, declarative deployment, and multi-container orchestration with Docker Compose.',
    officialSite: 'https://www.docker.com',
    defaultPort: '2375 (TLS 2376) / Internal Bridge',
    popularUses: [
      'Running microservice containers with zero dependency leakage to host OS',
      'Automated CI/CD runner environments',
      'Isolated sidecar monitoring & proxy containers',
      'Local dev-to-prod parity reproduction'
    ],
    supportedDistros: [
      {
        osFamily: 'debian',
        osName: 'Ubuntu 24.04 / 22.04 LTS & Debian 12',
        installBash: `# Remove conflicting packages
for pkg in docker.io docker-doc docker-compose podman-docker containerd runc; do sudo apt-get remove $pkg; done

# Add Docker official GPG key and repo
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine & Compose plugin
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add current user to docker group (optional for non-root)
sudo usermod -aG docker $USER
sudo systemctl enable --now docker`,
        serviceName: 'docker.service',
        configFile: '/etc/docker/daemon.json',
        verifyCommand: 'sudo docker run --rm hello-world && docker compose version'
      },
      {
        osFamily: 'rhel',
        osName: 'RHEL 9 / Rocky Linux 9',
        installBash: `# Setup Docker CE repository on RHEL/Rocky
sudo dnf install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# Install Docker Engine & Compose
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Enable & start
sudo systemctl enable --now docker
sudo docker run --rm hello-world`,
        serviceName: 'docker.service',
        configFile: '/etc/docker/daemon.json',
        verifyCommand: 'sudo docker info && docker compose version'
      }
    ],
    systemdUnitExample: `[Unit]
Description=Docker Application Container Engine
Documentation=https://docs.docker.com
After=network-online.target firewalld.service containerd.service
Wants=network-online.target
Requires=docker.socket

[Service]
Type=notify
ExecStart=/usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock
ExecReload=/bin/kill -s HUP $MAINPID
TimeoutSec=0
RestartSec=2
Restart=always
LimitNOFILE=infinity
LimitNPROC=infinity
LimitCORE=infinity
TasksMax=infinity
Delegate=yes
KillMode=process
OOMScoreAdjust=-500

[Install]
WantedBy=multi-user.target`,
    dockerComposeExample: `# Hardened /etc/docker/daemon.json configuration:
# {
#   "log-driver": "json-file",
#   "log-opts": {
#     "max-size": "50m",
#     "max-file": "3"
#   },
#   "live-restore": true,
#   "userland-proxy": false,
#   "no-new-privileges": true,
#   "icc": false
# }`,
    ansibleTaskExample: `- name: Install Docker and configure daemon.json
  hosts: appnodes
  become: yes
  tasks:
    - name: Ensure /etc/docker exists
      ansible.builtin.file:
        path: /etc/docker
        state: directory
        mode: '0755'

    - name: Configure daemon log rotation & live-restore
      ansible.builtin.copy:
        dest: /etc/docker/daemon.json
        content: |
          {
            "log-driver": "json-file",
            "log-opts": { "max-size": "50m", "max-file": "3" },
            "live-restore": true
          }
      notify: Restart Docker`,
    hardeningBestPractices: [
      'Enable `"live-restore": true` in `daemon.json` so containers keep running during dockerd restarts and patching.',
      'Configure log rotation limits in `daemon.json` to prevent containers from exhausting server disk space via runaway stdout logs.',
      'Avoid exposing Docker TCP socket `0.0.0.0:2375` unauthenticated; anyone with socket access has root privileges on the host.',
      'Use Docker Content Trust (`DOCKER_CONTENT_TRUST=1`) to enforce cryptographic signature verification on pulled images.'
    ],
    commonTroubleshooting: [
      {
        problem: 'Docker disk usage fills partition (/var/lib/docker/overlay2)',
        symptom: '`df -h` shows 100% disk usage on `/var`.',
        fix: 'Run `sudo docker system prune -af --volumes` to purge stopped containers, unused networks, and dangling image layers.'
      }
    ]
  },
  {
    id: 'redis',
    name: 'Redis 7 In-Memory Datastore & Cache',
    category: 'databases',
    description: 'Ultra-fast in-memory key-value database, cache, message broker, and streaming engine with sub-millisecond latency.',
    officialSite: 'https://redis.io',
    defaultPort: '6379 TCP',
    popularUses: [
      'HTTP session storage and caching',
      'Pub/Sub messaging and job queue brokering (Celery, BullMQ, Sidekiq)',
      'Rate limiting counters and distributed mutex locks'
    ],
    supportedDistros: [
      {
        osFamily: 'debian',
        osName: 'Ubuntu 24.04 / 22.04 LTS & Debian 12',
        installBash: `# Install Redis from official Redis repository
sudo apt-get install -y lsb-release curl gpg
curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list

sudo apt-get update
sudo apt-get install -y redis

# Configure systemd supervision in /etc/redis/redis.conf
sudo sed -i 's/supervised no/supervised systemd/' /etc/redis/redis.conf
sudo systemctl enable --now redis-server`,
        serviceName: 'redis-server.service',
        configFile: '/etc/redis/redis.conf',
        verifyCommand: 'redis-cli ping && sudo systemctl status redis-server'
      },
      {
        osFamily: 'rhel',
        osName: 'RHEL 9 / Rocky Linux 9',
        installBash: `# Install Redis on RHEL
sudo dnf install -y redis
sudo systemctl enable --now redis

# Verify connection
redis-cli ping`,
        serviceName: 'redis.service',
        configFile: '/etc/redis/redis.conf',
        verifyCommand: 'redis-cli ping && sudo systemctl status redis'
      }
    ],
    systemdUnitExample: `[Unit]
Description=Advanced key-value store
After=network.target

[Service]
Type=notify
ExecStart=/usr/bin/redis-server /etc/redis/redis.conf --supervised systemd
ExecStop=/usr/bin/redis-cli shutdown
Restart=always
User=redis
Group=redis
RuntimeDirectory=redis
RuntimeDirectoryMode=0755
LimitNOFILE=65536
ProtectSystem=strict
ReadWritePaths=/var/lib/redis /var/log/redis

[Install]
WantedBy=multi-user.target`,
    dockerComposeExample: `services:
  redis:
    image: redis:7-alpine
    container_name: cache_cluster
    restart: unless-stopped
    command: ["redis-server", "--requirepass", "MyStrongRedisAuthSecretPass!", "--appendonly", "yes"]
    ports:
      - "127.0.0.1:6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

volumes:
  redis_data:`,
    ansibleTaskExample: `- name: Install and secure Redis
  hosts: cacheservers
  become: yes
  tasks:
    - name: Install Redis package
      ansible.builtin.package:
        name: redis-server
        state: present

    - name: Set Redis requirepass in redis.conf
      ansible.builtin.lineinfile:
        path: /etc/redis/redis.conf
        regexp: '^#? ?requirepass '
        line: 'requirepass {{ vault_redis_password }}'
      notify: Restart Redis`,
    hardeningBestPractices: [
      'Never bind Redis to `0.0.0.0` without authentication; unauthenticated Redis instances on public IPs are frequently hijacked by cryptominers.',
      'Always set `requirepass` in `redis.conf` and disable destructive commands (`rename-command FLUSHALL ""` and `rename-command CONFIG ""`).',
      'Set `vm.overcommit_memory = 1` in `/etc/sysctl.conf` to prevent background snapshot `BGSAVE` memory fork failures.'
    ],
    commonTroubleshooting: [
      {
        problem: 'OOM command not allowed when used memory > maxmemory',
        symptom: 'Write operations fail with `OOM command not allowed`.',
        fix: 'Configure `maxmemory` and `maxmemory-policy allkeys-lru` in `redis.conf` to automatically evict stale cache entries when RAM limit is reached.'
      }
    ]
  },
  {
    id: 'prometheus-node-exporter',
    name: 'Prometheus & Node Exporter',
    category: 'monitoring',
    description: 'Cloud native systems monitoring, time-series telemetry metrics collection, and host hardware diagnostic exporter.',
    officialSite: 'https://prometheus.io',
    defaultPort: '9090 (Prometheus) / 9100 (Node Exporter)',
    popularUses: [
      'Full server fleet CPU, memory, disk I/O, network bandwidth metric ingestion',
      'Alertmanager notifications to PagerDuty/Slack for disk fill or CPU saturation',
      'Grafana dashboard visualization backends'
    ],
    supportedDistros: [
      {
        osFamily: 'debian',
        osName: 'Ubuntu / Debian (Node Exporter Host Agent)',
        installBash: `# Install Prometheus Node Exporter agent
sudo apt update && sudo apt install -y prometheus-node-exporter

# Verify daemon status & port 9100
sudo systemctl enable --now prometheus-node-exporter
curl http://localhost:9100/metrics | head -n 20`,
        serviceName: 'prometheus-node-exporter.service',
        configFile: '/etc/default/prometheus-node-exporter',
        verifyCommand: 'curl -s http://localhost:9100/metrics | grep node_cpu_seconds_total | head -n 5'
      },
      {
        osFamily: 'rhel',
        osName: 'RHEL 9 / Rocky Linux 9 (Standalone Binary)',
        installBash: `# Download latest Node Exporter release binary
VERSION="1.8.2"
curl -LO "https://github.com/prometheus/node_exporter/releases/download/v\${VERSION}/node_exporter-\${VERSION}.linux-amd64.tar.gz"
tar -xvf node_exporter-\${VERSION}.linux-amd64.tar.gz
sudo mv node_exporter-\${VERSION}.linux-amd64/node_exporter /usr/local/bin/
rm -rf node_exporter-\${VERSION}*

# Create dedicated system user
sudo useradd -rs /bin/false node_exporter

# Create systemd service unit
sudo tee /etc/systemd/system/node_exporter.service << 'EOF'
[Unit]
Description=Node Exporter
After=network.target

[Service]
User=node_exporter
Group=node_exporter
Type=simple
ExecStart=/usr/local/bin/node_exporter
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now node_exporter`,
        serviceName: 'node_exporter.service',
        configFile: '/etc/systemd/system/node_exporter.service',
        verifyCommand: 'curl -s http://localhost:9100/metrics | head -n 10'
      }
    ],
    systemdUnitExample: `[Unit]
Description=Prometheus Server
Documentation=https://prometheus.io/docs/introduction/overview/
After=network-online.target
Wants=network-online.target

[Service]
User=prometheus
Group=prometheus
Type=simple
ExecStart=/usr/local/bin/prometheus \\
  --config.file=/etc/prometheus/prometheus.yml \\
  --storage.tsdb.path=/var/lib/prometheus/data \\
  --storage.tsdb.retention.time=30d \\
  --web.listen-address=0.0.0.0:9090 \\
  --web.enable-lifecycle
ExecReload=/bin/kill -HUP $MAINPID
Restart=always
LimitNOFILE=65536
ProtectSystem=strict
ReadWritePaths=/var/lib/prometheus/data

[Install]
WantedBy=multi-user.target`,
    dockerComposeExample: `services:
  prometheus:
    image: prom/prometheus:v2.53.0
    container_name: prometheus_core
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prom_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=15d'
      - '--web.enable-lifecycle'

  node-exporter:
    image: prom/node-exporter:v1.8.2
    container_name: host_node_exporter
    restart: unless-stopped
    pid: host
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--path.rootfs=/rootfs'

volumes:
  prom_data:`,
    ansibleTaskExample: `- name: Install and start Node Exporter
  hosts: all
  become: yes
  tasks:
    - name: Install node-exporter package
      ansible.builtin.package:
        name: prometheus-node-exporter
        state: present

    - name: Ensure service is running
      ansible.builtin.systemd:
        name: prometheus-node-exporter
        state: started
        enabled: yes`,
    hardeningBestPractices: [
      'Do not expose Prometheus port 9090 or Node Exporter port 9100 to the public Internet; protect with TLS/Basic Auth or VPN/private VPC.',
      'Enable `--web.enable-lifecycle` to allow configuration reloads via `curl -X POST http://localhost:9090/-/reload` without killing Prometheus process.',
      'Configure disk storage retention flags (`--storage.tsdb.retention.size` and `--storage.tsdb.retention.time`) to prevent out-of-disk conditions.'
    ],
    commonTroubleshooting: [
      {
        problem: 'Target state is DOWN in Prometheus Dashboard (connection refused)',
        symptom: 'Prometheus alerts with `InstanceDown`.',
        fix: 'Check if Node Exporter service is running on the target node with `sudo systemctl status node_exporter` and ensure local firewall allows port 9100 from Prometheus server IP.'
      }
    ]
  },
  {
    id: 'ssh-fail2ban',
    name: 'OpenSSH Hardening & Fail2ban',
    category: 'security',
    description: 'Enterprise bastion security stack: cryptographic SSH hardening (disabling passwords, root login) and automatic brute-force IP banning.',
    officialSite: 'https://www.fail2ban.org',
    defaultPort: '22 (Recommended custom e.g. 2222) TCP',
    popularUses: [
      'Server boundary defense against automated dictionary attacks',
      'SSH key authentication enforcement (ed25519)',
      'Automatic iptables/nftables firewall banning of malicious scans'
    ],
    supportedDistros: [
      {
        osFamily: 'debian',
        osName: 'Ubuntu 24.04 / Debian 12',
        installBash: `# Install Fail2ban
sudo apt update && sudo apt install -y fail2ban

# Create jail.local configuration
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo tee /etc/fail2ban/jail.d/ssh-custom.local << 'EOF'
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 4
bantime = 1d
findtime = 10m
EOF

# Restart Fail2ban
sudo systemctl enable --now fail2ban
sudo fail2ban-client status sshd`,
        serviceName: 'fail2ban.service',
        configFile: '/etc/ssh/sshd_config.d/*.conf & /etc/fail2ban/jail.local',
        verifyCommand: 'sudo fail2ban-client status sshd && sudo sshd -t'
      },
      {
        osFamily: 'rhel',
        osName: 'RHEL 9 / Rocky Linux 9',
        installBash: `# Install EPEL repo & fail2ban
sudo dnf install -y epel-release
sudo dnf install -y fail2ban fail2ban-systemd

# Configure jail
sudo tee /etc/fail2ban/jail.d/00-firewalld.local << 'EOF'
[DEFAULT]
banaction = firewallcmd-rich-rules[actiontype=]
banaction_allports = firewallcmd-rich-rules[actiontype=]

[sshd]
enabled = true
maxretry = 3
bantime = 24h
EOF

sudo systemctl enable --now fail2ban
sudo fail2ban-client status sshd`,
        serviceName: 'fail2ban.service',
        configFile: '/etc/fail2ban/jail.d/*.local',
        verifyCommand: 'sudo fail2ban-client status sshd'
      }
    ],
    systemdUnitExample: `[Unit]
Description=Fail2ban Service
Documentation=man:fail2ban(1)
After=network.target iptables.service firewalld.service
PartOf=iptables.service firewalld.service

[Service]
Type=simple
ExecStart=/usr/bin/fail2ban-server -xf start
ExecStop=/usr/bin/fail2ban-server stop
ExecReload=/usr/bin/fail2ban-server reload
PIDFile=/run/fail2ban/fail2ban.pid
Restart=on-failure
RestartPreventExitStatus=1

[Install]
WantedBy=multi-user.target`,
    dockerComposeExample: `# Recommended OpenSSH hardening snippet for /etc/ssh/sshd_config.d/99-hardened.conf:
# PermitRootLogin no
# PasswordAuthentication no
# PubkeyAuthentication yes
# AuthenticationMethods publickey
# KexAlgorithms curve25519-sha256,curve25519-sha256@libssh.org,diffie-hellman-group16-sha512
# Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com
# MACs hmac-sha2-512-etm@openssh.com
# MaxAuthTries 3
# ClientAliveInterval 300
# ClientAliveCountMax 2`,
    ansibleTaskExample: `- name: Harden SSH daemon configuration
  hosts: all
  become: yes
  tasks:
    - name: Disable SSH root login and passwords
      ansible.builtin.copy:
        dest: /etc/ssh/sshd_config.d/99-hardening.conf
        content: |
          PermitRootLogin no
          PasswordAuthentication no
          MaxAuthTries 3
        validate: 'sshd -t -f %s'
      notify: Restart SSHD`,
    hardeningBestPractices: [
      'ALWAYS test SSH daemon syntax with `sudo sshd -t` and KEEP an existing root terminal session open before restarting `sshd` to prevent accidental lockout!',
      'Generate modern Ed25519 SSH keys (`ssh-keygen -t ed25519 -C "admin@corp"`) instead of legacy RSA 2048-bit keys.',
      'Configure unban commands with `sudo fail2ban-client set sshd unbanip <IP>` when diagnosing legitimate admin lockouts.'
    ],
    commonTroubleshooting: [
      {
        problem: 'Locked out of server after disabling PasswordAuthentication',
        symptom: '`Permission denied (publickey)`.',
        fix: 'Access via cloud hypervisor web console / AWS Serial Console / IPMI, inspect `~/.ssh/authorized_keys` permissions (`chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys`), and verify user ownership.'
      }
    ]
  }
];

export const INSTALL_METHODS_COMPARISON = [
  {
    method: 'Native Package Manager (APT / DNF / Zypper)',
    description: 'Installs packages maintained by the distribution maintainers with unified dependency tracking and security patches.',
    pros: [
      'Integrated with OS patch management and automated updates (`unattended-upgrades`, `dnf-automatic`)',
      'Zero container overhead; native hardware performance and lowest memory footprint',
      'Native `systemd` integration and logging to `journald`'
    ],
    cons: [
      'Distro repositories often carry older, conservative software versions',
      'Dependency conflicts if multiple apps require differing shared library versions'
    ],
    bestFor: 'Core OS daemons, kernel drivers, system utilities, production databases, and security agents.'
  },
  {
    method: 'Containerized (Docker Compose / Podman / Kubernetes)',
    description: 'Encapsulates the application, exact language runtimes, and all dependencies into an isolated container image.',
    pros: [
      'Immutable deployments; works identically across Ubuntu, RHEL, Arch, or Cloud VMs',
      'Zero dependency collision on the host OS; run Python 3.8 and Python 3.12 concurrently',
      'Instant rollback by switching image tag in `docker-compose.yml`'
    ],
    cons: [
      'Requires separate container patch management (rebuilding images for CVEs)',
      'Slight network virtualization and storage layer translation overhead'
    ],
    bestFor: 'Microservices, web application stacks, CI/CD pipelines, and multi-tenant workloads.'
  },
  {
    method: 'Standalone Static Binary (Go / Rust / Release Tarballs)',
    description: 'Pre-compiled self-contained executable placed into `/usr/local/bin` managed by custom `systemd` unit.',
    pros: [
      'Zero dependencies on host system libraries (e.g. Prometheus, Caddy, Node Exporter, Terraform)',
      'Immediate access to the exact latest upstream release without waiting for distro packaging'
    ],
    cons: [
      'Must manually manage update scripts or Ansible tasks to fetch new binaries',
      'Requires writing your own `systemd` service unit file'
    ],
    bestFor: 'Observability tools (Prometheus, Grafana, Vector), DevOps CLI tools, and Go/Rust microservices.'
  },
  {
    method: 'Language-Specific Virtual Envs (Python venv / Node NVM / Ruby rbenv)',
    description: 'Isolated runtime environments created inside user directories for application-specific dependencies.',
    pros: [
      'Prevents breaking system Python/Node libraries (PEP 668 compliance on Ubuntu 24.04/Debian 12)',
      'Enables reproducible lockfiles (`package-lock.json`, `poetry.lock`)'
    ],
    cons: [
      'Requires managing `systemd` ExecStart paths pointing to `/opt/app/venv/bin/gunicorn`'
    ],
    bestFor: 'Python web applications (Django, FastAPI, Flask) and Node.js backend services.'
  }
];
