# QuickNotes Data Model Specification Schema Document

This document blueprints the persistent layer schema layout strategies selected for the underlying enterprise tier architecture.

## SQL Relational Database System Choice Justification
We opted for a **Relational Storage Model (PostgreSQL Engine Instance)** instead of NoSQL alternatives. Notes data exhibits strong transactional structure properties. We enforce integrity validations via strict primary and foreign key constraints. This protects indexing, keeps lookups fast, and ensures data remains consistent across related entities.

---

## Entity-Relationship Structural Layout Diagram Matrix
* **Users (1) <====> (N) Notes** (One-to-Many cascade setup dependency alignment mapping link)
* **Notes (1) <====> (N) Note_Tags** (One-to-Many bridge implementation structural table alignment mapping)
* **Tags (1) <====> (N) Note_Tags** (One-to-Many lookup categorization relational assignment layout map)

---

## Core Enterprise DDL Entity Database Tables Construction

```sql
-- 1. Users Account Entity Records Representation Engine
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Notes Structural Content Entry Core Engine
CREATE TABLE notes (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    title VARCHAR(100) NOT NULL,
    body TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Categorization Labeling Lookup Storage Directory Entity Table
CREATE TABLE tags (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Many-to-Many Mapping Structural Junction Bridge Intersect Entity
CREATE TABLE note_tags (
    note_id VARCHAR(64) NOT NULL,
    tag_id VARCHAR(64) NOT NULL,
    PRIMARY KEY (note_id, tag_id),
    CONSTRAINT fk_note FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    CONSTRAINT fk_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

---

## Performance Optimization Indexes

```sql
-- Index optimization to speed up queries fetching user notes sorted by date.
CREATE INDEX idx_notes_user_date ON notes(user_id, created_at DESC);
```
**Reasoning Selection Plan:** The application's main interface displays notes grouped by their owner account and ordered by creation date. Indexing this composite key pattern prevents slow sequential table scans. This keeps performance fast as scale grows toward millions of active records.

---

## Core Analytical Operation Query Implementations Examples

### Query 1: Extract 10 notes matching specified target parameters alongside associated user fields
```sql
SELECT n.id, n.title, n.body, u.username, n.created_at
FROM notes n
JOIN users u ON n.user_id = u.id
WHERE n.user_id = 'usr_9921a8f3'
ORDER BY n.created_at DESC
LIMIT 10;
```

### Query 2: Extract notes related to a specific classification tag string identifier
```sql
SELECT n.id, n.title, t.name 
FROM notes n
JOIN note_tags nt ON n.id = nt.note_id
JOIN tags t ON nt.tag_id = t.id
WHERE t.name = 'engineering';
```

### Query 3: Compute aggregations calculating current platform wide metrics per individual account layout
```sql
SELECT user_id, COUNT(*) as total_notes_count
FROM notes
GROUP BY user_id
HAVING COUNT(*) > 5;
```
