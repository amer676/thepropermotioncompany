# How to Build a Document Management System

Every growing organization reaches a point where documents are scattered across email attachments, shared drives, Slack messages, and individual desktops, and no one can find anything. A 2023 IDC study found that knowledge workers spend 2.5 hours per day searching for information -- 30% of the workday -- and still fail to find what they need 50% of the time. That is not an inconvenience; it is a quantifiable drag on productivity that costs a 500-person company approximately $5 million per year in lost time.

A document management system (DMS) solves this by providing a structured, searchable, version-controlled repository for every document your organization produces and consumes. This guide covers how to build one that people will actually use, from storage architecture through access control, version management, and search.

## Storage Architecture and File Handling

The storage layer is the foundation of your DMS. The key decisions are where files physically live, how they are organized, and how you handle the sheer variety of file types that a business generates.

**Object storage as the backbone**: Store files in an object storage service like AWS S3, Google Cloud Storage, or Azure Blob Storage rather than a traditional filesystem. Object storage provides virtually unlimited capacity, built-in redundancy (99.999999999% durability for S3), lifecycle management (automatically move old files to cheaper storage tiers), and fine-grained access control. Files are stored as immutable objects identified by unique keys, which simplifies version management -- each version is a separate object rather than an overwrite.

**Database for metadata**: Store file metadata (name, type, size, owner, created date, modified date, tags, folder path, version history, access permissions) in a relational database like PostgreSQL. This separation of concerns -- files in object storage, metadata in a database -- allows fast, complex queries against metadata (find all PDFs uploaded by Jane in the last 30 days) without scanning the file storage.

**Upload handling**: Large file uploads require chunked upload support. Break files into 5-10MB chunks, upload each chunk independently (with retry capability for failed chunks), and reassemble on the server. This prevents timeout failures on large files and allows progress tracking in the UI. For files over 100MB, use presigned URLs that allow the client to upload directly to object storage, bypassing your application server entirely and avoiding memory constraints.

**File processing pipeline**: After upload, files should pass through an asynchronous processing pipeline:
1. **Virus scanning**: ClamAV or a cloud-based scanning service checks every uploaded file before it becomes available to other users.
2. **Thumbnail generation**: Generate preview thumbnails for images, PDFs, and common document types. This enables visual browsing and preview without downloading the full file.
3. **Text extraction**: Extract text content from PDFs (using a library like Apache PDFBox or pdf.js), Office documents (using Apache POI or LibreOffice in headless mode), and images with text (using OCR via Tesseract or a cloud OCR service). The extracted text feeds the full-text search index.
4. **Metadata extraction**: Pull embedded metadata (EXIF data from images, author and title from Office documents, creation dates from PDFs) and store it alongside user-provided metadata.

## Version Control and Document Lifecycle

Version control is what separates a DMS from a shared folder. Without version control, the latest version of "Q4_Budget_Final_v3_REVISED_FINAL2.xlsx" is anyone's guess. With version control, there is one document with a clean history of every change.

**Automatic versioning**: Every file save creates a new version. The previous version is retained and accessible, but the latest version is always what users see by default. Display a version history panel showing the version number, timestamp, author, and (optionally) a change description for each version.

**Check-out/check-in for collaborative editing**: When a user opens a document for editing, the system can optionally "check out" the document, preventing other users from editing simultaneously and creating conflicting versions. This is essential for organizations that work with complex documents (legal contracts, engineering drawings, financial models) where merge conflicts are not feasible. Display a clear indicator showing who has the document checked out and when.

**Comparison and rollback**: Allow users to compare any two versions visually (diff view for text documents, side-by-side for images) and roll back to any previous version. Rollback creates a new version that is a copy of the selected historical version -- it does not delete the intermediate versions.

**Retention policies**: Configure retention rules that define how long documents and their versions are kept. Common policies include:
- Keep all versions for the first 90 days.
- After 90 days, keep only the latest version plus any version explicitly marked as a milestone.
- After the retention period expires (varies by document type and regulatory requirement), either archive to cold storage or delete permanently with an audit trail of the deletion.

**Document lifecycle states**: Beyond versioning, documents progress through lifecycle states: Draft, In Review, Approved, Published, Archived, and Obsolete. Each state transition can trigger notifications, require approvals, and restrict actions (for example, an Approved document cannot be edited without first moving it back to Draft status, which requires appropriate permissions).

## Access Control and Permissions

A DMS that does not control who can see, edit, and share documents is a liability, not an asset. Especially in regulated industries (healthcare, finance, legal), document access must be auditable and enforceable.

**Folder-level and document-level permissions**: Define permissions at the folder level (all documents in the "Legal Contracts" folder inherit the folder's permissions) with the ability to override at the document level (this specific contract is restricted to the legal team lead only). Permission inheritance simplifies management for large document collections.

**Permission types**: At minimum, support Read (view and download), Write (edit and upload new versions), Admin (change permissions, delete, manage lifecycle), and No Access. Some organizations also need Comment (add annotations without editing the document) and Share (create links or grant access to others within defined limits).

**External sharing**: When documents need to be shared outside the organization -- with clients, vendors, or auditors -- provide secure sharing links with configurable expiration (7 days, 30 days, custom), password protection, download restrictions (view-only in browser, no download), and watermarking (overlay the viewer's name/email on each page to discourage unauthorized redistribution).

**Audit trail**: Log every access event: who viewed, downloaded, edited, shared, printed, or deleted each document, with a timestamp and IP address. The audit trail should be tamper-evident (append-only storage) and retained for the same period as the document itself. In regulated industries, the audit trail is often as important as the document.

## Search: Full-Text, Metadata, and Semantic

Search is the make-or-break feature of any DMS. If users cannot find documents quickly, they abandon the system and go back to emailing files around.

**Full-text search** indexes the extracted text content of every document, enabling searches that match words and phrases within the document body, not just the filename. Use Elasticsearch or a similar search engine with support for stemming, fuzzy matching, phrase matching, and relevance ranking. Weight title and filename matches higher than body content matches.

**Metadata search and faceted filtering**: Allow users to filter results by metadata fields: document type (contract, invoice, specification), date range (created/modified), author, department, project, tags, and lifecycle state. Faceted filtering displays the available filter values with result counts, helping users narrow results efficiently.

**OCR search**: Documents that exist as scanned images (PDFs from a scanner, photographed receipts, faxed documents) contain no extractable text. OCR (Optical Character Recognition) converts the image content to searchable text. Tesseract OCR handles standard printed text well. For handwritten documents, specialized OCR services (Google Cloud Vision, AWS Textract) achieve higher accuracy. Index the OCR output alongside natively extracted text so that scanned and digital documents are equally searchable.

**Saved searches and smart folders**: Allow users to save frequently used search queries and display them as virtual folders. A saved search for "all contracts modified in the last 7 days" appears as a dynamic folder that always shows current results without manual maintenance.

## Workflow and Approval Integration

Documents rarely exist in isolation. They flow through business processes: a contract is drafted, reviewed by legal, revised, approved by management, signed by both parties, and archived. A DMS that integrates document workflows eliminates the email chains, manual tracking, and lost-in-the-shuffle delays that plague document-heavy processes.

**Workflow engine basics**: Define workflow templates with sequential or parallel approval steps. Each step has an assignee (or a role from which an available user is selected), an action (approve, reject, request changes), a deadline, and escalation rules (if not acted upon within 48 hours, escalate to the assignee's manager).

**Notification and reminders**: Send email and in-app notifications when a document arrives for review, when a deadline is approaching (24 hours before), and when a decision is made. Include a direct link to the document and a one-click approve/reject action to minimize friction.

**Electronic signatures**: For documents that require formal signatures, integrate with an e-signature service (DocuSign, Adobe Sign, HelloSign) or build a basic e-signature capability (capture a typed name, timestamp, and IP address as a legally recognized electronic signature under the ESIGN Act and UETA). The signed document should be locked as a new version with the signature embedded and the unsigned version retained in the version history.

**Automated routing**: Rules-based routing directs documents to the appropriate workflow based on metadata. Invoices over $10,000 route to VP approval. Contracts with a new vendor route to legal review. Standard purchase orders under $500 are auto-approved. These rules reduce manual routing overhead and ensure compliance with approval policies.

## Regulatory Considerations by Industry

Different industries have specific requirements that shape DMS architecture:

**Healthcare (HIPAA)**: Documents containing PHI require encryption at rest and in transit, access controls with audit logging, and retention policies that comply with state medical record retention laws (typically 7 to 10 years). Business Associate Agreements must be in place with the DMS hosting provider.

**Financial services (SEC, FINRA)**: Broker-dealers must retain communications and documents per SEC Rule 17a-4, which requires WORM (Write Once, Read Many) storage that prevents modification or deletion during the retention period. The DMS must support regulatory hold and litigation hold features.

**Legal**: Attorney-client privilege requires strict access controls on privileged documents. Legal document management also requires robust conflict checking (ensuring that documents from opposing parties in a matter are not accessible to conflicted attorneys) and matter-centric organization.

**Manufacturing (ISO 9001, FDA)**: Quality management documents (SOPs, work instructions, specifications) must follow a controlled document process with formal review, approval, and distribution tracking. The DMS must demonstrate that only the current approved version is accessible to production staff, and that all previous versions are archived with complete revision history.

---

A well-built document management system pays for itself in recovered productivity, reduced risk, and organizational sanity. If your organization is drowning in unstructured files and manual document workflows, [contact us to discuss a custom DMS solution](/contact.html). We build document management systems tailored to your industry's regulatory requirements, your team's workflow needs, and your existing technology ecosystem.
