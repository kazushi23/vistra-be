# Document Management System - Backend

A RESTful API backend for managing documents (folders and files) with support for file uploads, validation, and duplicate handling.

## Quick Start

### Prerequisites
- Node.js 22 
- MySQL 8.0+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables depending on environment
cp .env.example .env.development
cp .env.example .env.production
# Edit .env with your database credentials
```

### Database Setup

```sql
CREATE DATABASE vistra;
```

Update `.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=vistra
```

### Running the Application

#### Development Mode
```bash
npm run dev
```
Server runs on `http://localhost:5001` with hot-reload enabled.

#### Production Mode
```bash
# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

#### Testing
```bash
# IMPORTANT: Clear database before running tests
# Tests will create and manipulate data

npm run test

# Watch mode for development
npm run test:watch
```

---

## API Endpoints

### Documents
- `GET /api/v1/document` - List all documents with pagination
  - Query params: `page`, `pagesize`, `search`, `sortColumn`, `descending`
  
### Folders
- `POST /api/v1/folder/create` - Create a new folder
  - Body: `{ "name": "Folder Name" }`

### Files
- `POST /api/v1/file/create` - Upload files (max 10 per request)
  - Form-data: `files` (multipart/form-data)
  - Allowed types: PDF, DOCX, XLSX, PNG, JPG, JPEG (can be changed based on scope)
  - Max size: 5MB per file
  - Max length: 10 files

---

## Database Design

### Single Table Approach
Currently using a **single `Document` table** for both folders and files:

```typescript
@Entity()
export class Document {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 255 })
    name: string;  // Final name (e.g., "file.pdf", "Report")

    @Column({ type: "enum", enum: ["file", "folder"] })
    type: "file" | "folder";

    @Column({ type: "bigint", nullable: true })
    size?: number;  // File size in bytes (null for folders)

    @Column({ type: "varchar", length: 100 })
    createdBy: string;

    @Column({ type: "bigint" })
    createdAt: number;

    @Column({ type: "bigint" })
    updatedAt: number;
}
```

**Benefits:**
- Simple unified query for document listing
- Easy to implement and maintain
- Sufficient for current requirements

**Future Extensions (if needed):**
```typescript
// Add self-referencing for folder hierarchy
@ManyToOne(() => Document, (document) => document.children, { 
    nullable: true, 
    onDelete: "CASCADE" 
})
parent?: Document;

@OneToMany(() => Document, (document) => document.parent)
children: Document[];

// Add URL for cloud storage (S3, etc.)
@Column({ type: "varchar", length: 500, nullable: true })
url?: string;

// Add column for duplicate tracking
@Column({ type: "varchar", length: 255, nullable: true })
baseName?: string;  // Original filename before (1), (2), etc.
```

Extending to separate File and Folder column is feasible as well if each has way more independant columns. Or even adding a version history table with relationship to document works.
---

## Unique Constraints & Duplicate Handling

### Current Implementation: **NO UNIQUE CONSTRAINTS**

**Why?**
- Assignment doesn't require strict uniqueness for file and folder create
- Mimic file upload end point
- Simplifies initial implementation
- Allows duplicate folder and file names

**Behavior:**
- Folders and Files: Can have duplicate names (e.g., "Project", "Project", "report.pdf", "report.pdf")

### Future Implementation Options

- Folder: Rejected if exist for user (e.g., "Report" by user A will clash when user A create "Report")
- Files: Automatically renamed to avoid conflicts (e.g., "report.pdf" → "report(1).pdf")

If unique constraints are needed:


## Separate BaseName Column for Files (Production-Ready)
Use case: Track duplicate files while allowing multiple versions
This approach adds a baseName column to store the original filename, while name stores the final unique name with counters.
Database Schema:
```typescript
@Column({ type: "varchar", length: 255, nullable: true })
baseName?: string;  // Original: "report.pdf"

@Column({ type: "varchar", length: 255 })
name: string;  // Final: "report.pdf", "report(1).pdf", "report(2).pdf"
```
Implementation Strategy:

Lock all files with same baseName using FOR UPDATE:

```typescript
const existingFiles = await queryRunner.manager
    .createQueryBuilder(Document, "doc")
    .where("doc.baseName = :baseName", { baseName: "report.pdf" })
    .setLock("pessimistic_write")  // Critical: prevents race conditions
    .getMany();

Parse existing names to find used numbers:
```
```typescript
// Match pattern: "report.pdf", "report(1).pdf", "report(2).pdf"
const usedNumbers = new Set([0]); // 0 = base file

existingFiles.forEach(file => {
    const match = file.name.match(/report\((\d+)\)\.pdf/);
    if (match) {
        usedNumbers.add(parseInt(match[1])); // Extract: 1, 2, 3...
    }
});
```
Find smallest unused number:

```typescript
let nextNumber = 1;
while (usedNumbers.has(nextNumber)) {
    nextNumber++; // Skip to next available
}
// nextNumber = 3 if we have report.pdf, report(1).pdf, report(2).pdf
```
Save with transaction:

```typescript
const doc = new Document();
doc.name = `report(${nextNumber}).pdf`;  // "report(3).pdf"
doc.baseName = "report.pdf";             // Track original
doc.type = "file";

await queryRunner.manager.save(doc);
await queryRunner.commitTransaction();
```

Benefits:

Atomic operations - No race conditions
Correct numbering - Finds smallest gap (if report(2) deleted, next upload uses (2))
Version tracking - Query all versions: WHERE baseName = 'report.pdf'
Replace feature - Can delete old versions and keep latest

Trade-offs:

Extra column - Increases storage slightly
Complex logic - More code to maintain
Performance - Sequential processing (but necessary for correctness)

When to Use:

Need to track file versions
High-traffic uploads with duplicates
Want "replace file" functionality
Simple use case (current implementation without baseName is sufficient)

---

## Concurrency & Race Conditions (For duplicate handling)

### The Problem

When 10 users simultaneously upload "report.pdf":

```
Without locking:
User 1: Check DB → 0 files → Save as "report.pdf"     
User 2: Check DB → 0 files → Save as "report.pdf"     DUPLICATE!
User 3: Check DB → 0 files → Save as "report.pdf"     DUPLICATE!
...
Result: 10 files all named "report.pdf" (WRONG!)
```

### The Solution: Pessimistic Locking

```typescript
With FOR UPDATE lock:
User 1: LOCK rows → 0 files → Save "report.pdf" → UNLOCK
User 2: WAIT for lock... → 1 file → Save "report(1).pdf" → UNLOCK
User 3: WAIT for lock... → 2 files → Save "report(2).pdf" → UNLOCK
...
Result: report.pdf, report(1).pdf, report(2).pdf... (CORRECT!)
```

**Implementation:**
```typescript
// Pessimistic write lock prevents concurrent reads
.setLock("pessimistic_write")  // SQL: SELECT ... FOR UPDATE

// SERIALIZABLE isolation prevents phantom reads
await queryRunner.startTransaction("SERIALIZABLE");

// Retry mechanism for deadlocks
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 100;
```

---

## Testing

### Test Coverage
- Create folder successfully
- Create file successfully  
- Reject invalid file types
- Reject invalid file names
- Reject files exceeding size limit
- Reject empty files
- Reject >10 files per upload
- Pagination and search
- Invalid request validation

### Running Tests

```bash
# Clear database first
mysql -u root -p vistra -e "DROP DATABASE IF EXISTS vistra; CREATE DATABASE vistra;"
# or truncate table will do

# Run tests
npm run test

# With coverage
npm run test -- --coverage
```

---

## Architecture Decisions

### Why No Multi-Tenancy?
- Assignment doesn't require user separation
- All documents in single shared database
- `createdBy` is a static string (not actual user ID)
- Future: Add `userId` column and filter queries

### Why No Caching?
- Small dataset (suitable for assignment)
- Database queries are fast enough
- Future: Add Redis for frequently accessed folders

### Why No File Storage (S3)?
- Simplified for assignment scope
- Currently only storing metadata
- Future: Add `url` column and integrate AWS S3/Azure Blob

### Why TypeORM?
- TypeScript native
- Decorator-based (clean syntax)
- Good transaction support
- Active community

---

## Code Quality

### TypeScript Strict Mode
```json
"strict": true,
"noUncheckedIndexedAccess": true,
"exactOptionalPropertyTypes": true
```

### ESM Modules
- Using `.js` extensions in imports (ESM requirement)
- `"type": "module"` in package.json
- `moduleResolution: "nodenext"`

### Error Handling
```typescript
class HttpError extends Error {
    constructor(message: string, public statusCode: number) {
        super(message);
    }
}

// Usage
throw new HttpError("File too large", 400);
```

---

## Future Enhancements

### Phase 1: User Management
- [ ] Add User entity
- [ ] JWT authentication
- [ ] User-specific document filtering

### Phase 2: Folder Hierarchy
- [ ] Self-referencing parent-child relationships
- [ ] Move files between folders

### Phase 3: Cloud Storage
- [ ] AWS S3 integration
- [ ] Signed URLs for secure access
- [ ] Thumbnail generation

### Phase 4: Advanced Features
- [ ] File versioning
- [ ] Sharing & permissions
- [ ] Full-text search
- [ ] Audit logs
- [ ] Duplicate handling File and Folder

---

## Tech Stack

- **Runtime:** Node.js 18+
- **Language:** TypeScript 5.9
- **Framework:** Express 5
- **ORM:** TypeORM 0.3
- **Database:** MySQL 8.0
- **Testing:** Jest + Supertest
- **Validation:** Custom middleware

---

## Author

**Kazushi Fujiwara**

For questions or clarifications about implementation decisions, please reach out.