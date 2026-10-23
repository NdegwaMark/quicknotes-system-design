# Production Scale Architecture Blueprint System Document

This file breaks down the core architecture components designed to handle **1 million active users**.

## Core High-Load Traffic & Volumetric Calculations

### Baseline Assumptions:
* Total User Base = **1,000,000 users**
* Daily Active Users (DAU) = **10% = 100,000 active users**
* Daily Operations: Average user makes **5 Read actions** and **2 Write actions** every 24 hours.

### Operations Math Breakdowns:
* **Read Volume Calculation:**
  $$\text{Total Reads/Day} = 100,000 \times 5 = 500,000 \text{ reads/day}$$
  $$\text{Reads Per Second (RPS)} = \frac{500,000}{86400 \text{ seconds}} \approx 5.78 \text{ RPS (Average Baseline)}$$
  $$\text{Peak Read Factor (10x spike load capacity support plan)} \approx \mathbf{57.8 \text{ RPS}}$$

* **Write Volumetric Calculations:**
  $$\text{Total Writes/Day} = 100,000 \times 2 = 200,000 \text{ writes/day}$$
  $$\text{Writes Per Second (WPS)} = \frac{200,000}{86400 \text{ seconds}} \approx 2.31 \text{ WPS (Average Baseline)}$$
  $$\text{Peak Write Factor (10x spike load capacity support plan)} \approx \mathbf{23.1 \text{ WPS}}$$

* **Storage Calculations (Per Year Metrics):**
  Assume an average size of **2 KB** per complete note record object (including title, body text lines, and tags index pointers metadata row elements).
  $$\text{New Notes Per Day} = 200,000 \text{ records}$$
  $$\text{Daily Storage Accumulation Rate} = 200,000 \times 2 \text{ KB} = 400,000 \text{ KB} \approx 400 \text{ MB / day}$$
  $$\text{Annual Net Storage Footprint Requirements} = 400 \text{ MB} \times 365 \approx \mathbf{146 \text{ GB / year}}$$

---

## Infrastructure Component Map Matrix Breakdown
* **Client Layer Dashboard Interface:** HTML5, CSS3 vanilla architecture asset structures, JavaScript execution handling runtime state layouts locally.
* **DNS Routing Nameservers Directory:** Route53 routing configuration setup directing client domain maps securely to delivery platforms.
* **CDN Global Edge Infrastructure Distribution Cache Channels:** Cloudflare networks layer proxying infrastructure, offloading bandwidth expenses by edge caching invariant static dependencies layout bundles (`index.html`, `style.css`, image components asset trees).
* **Load Balancer Routing Intermediary Nodes Layer:** NGINX reverse-proxy array matrix clusters running round-robin network layer load allocation distributions over downrange compute networks.
* **App Servers Compute Array Clusters Matrix:** Node.js stateless worker application runtimes grouped horizontally behind auto-scaling groups tracking hardware compute constraints parameters thresholds.
* **In-Memory Volatile Caching Memory Layer Accelerator:** Redis database instance nodes caching active session lookups and recent notes payload objects arrays to intercept reads before hitting persistent storage discs.
* **Primary SQL Structural Database Instance Storage Engine Node:** High performance scale enterprise specs PostgreSQL instance database cluster executing active writes.
* **Read Replicas Read-Only Read Scaling Infrastructure System Array:** Dedicated read-only replica PostgreSQL nodes attached asynchronously mirroring the main data writer engine cluster, fulfilling system execution queries cleanly without performance impact to active mutations pipelines.
* **Asynchronous Processing Message Queue Broker Pipeline Broker:** RabbitMQ messaging worker queue platform ingesting side-effect computations asynchronously (such as analytics events processing or system notification triggers) to maximize runtime speeds.

---

## Sequential Step-By-Step Network Execution Request Flows

### 1. `GET /notes` Execution Sequence Path
1. The user's device requests note entries from the server.
2. The network request routes through **DNS**, hits the **CDN Edge**, and targets the **Load Balancer**.
3. The Load Balancer forwards the traffic package smoothly down to the least busy **App Server Node**.
4. The App Server checks the **Redis Cache** first to see if the user's data is already in memory.
5. **Cache Hit Case:** The server returns the note details instantly to the user's screen.
6. **Cache Miss Case:** The server queries a **PostgreSQL Read Replica** instead, updates the Redis cache with the result, and then responds to the client.

### 2. `POST /notes` Execution Sequence Path
1. The user inputs their content fields onto the screen form layout and presses submit.
2. Validation rules on the client verify that the data meets format requirements.
3. The request travels past infrastructure layers directly to an active compute node worker.
4. The compute node verifies authorization and saves the data directly into the **Primary PostgreSQL Database Instance**.
5. The application server updates or invalidates the old cached data in **Redis**.
6. The server forwards background processing metrics safely down to the **RabbitMQ Message Queue Broker pipeline**.
7. The application server responds back to the client device with a success status code.

---

## Single Points of Failure (SPOF) Prevention Strategies
* **Compute Layer Failover Redundancy:** Deploy application microservices across multiple distinct infrastructure Availability Zones (AZs) using active health probes to swap traffic automatically away from failing regions.
* **Database Layer Disaster Recovery Plan:** Keep a hot standby replica attached to the primary database. If the primary instance goes down, health monitoring systems promote the standby to handle traffic instantly with minimal data impact.
* **Cache System Eviction Controls Strategy:** Deploy Redis clusters using sharded partitions alongside read-replicas. This architecture strategy prevents site-wide crashes if an isolated memory engine node fails under high peak traffic.
