# ECA Triage Accelerator - Technical Deep Dive Script

**Duration**: 8-10 minutes
**Audience**: Technical buyers, IT directors, litigation support managers
**Tone**: Technical but accessible. Explain the how, not just the what.
**Resolution**: 1920x1080 @ 2x (Retina)
**Demo account**: attorney@lawfirm.com

---

## Part 1: Platform Overview (0-60s)

**Screen**: Login page -> matters dashboard
**Narration**: "ECA Triage Accelerator is a pre-processing platform for legal e-discovery. It sits between your collection tools and your review platform - Relativity, Everlaw, DISCO. The goal: reduce data volume before you start paying per-gigabyte review platform fees."

**Click sequence**:
1. Show login page (mention SSO support)
2. Login -> matters dashboard
3. Point out navigation: Portfolio, Matters, Discovery, Ops
4. Show WorkflowRail when a matter is selected

**Key callouts**:
- Multi-tenant architecture: each firm or team is fully isolated
- Role-based access: admin, attorney, paralegal, reviewer, viewer
- Language toggle: switch between legal terminology and plain English
- Command palette: Cmd+K for power users

**Transition**: Cut to Part 2

---

## Part 2: Document Ingestion Pipeline (60-150s)

### 2A: Upload and Hashing (60-90s)

**Screen**: Documents page with upload interface
**Click sequence**:
1. Show drag-drop zone
2. Upload a mixed batch (PDFs, emails, ZIP, audio file)
3. Show SHA-256 progress bars per file
4. Show deduplication detection on a repeated file

**Narration**: "Every file is SHA-256 hashed on the client side before upload. This serves two purposes: deduplication - identical files are detected instantly - and chain of custody. The hash becomes the file's permanent identifier in content-addressed storage."

**Technical detail**: "Upload uses streaming batch processing. The browser never holds all files in memory simultaneously - critical when ingesting datasets with hundreds of thousands of files."

### 2B: Extraction and Processing (90-120s)

**Screen**: Processing status view showing active jobs
**Narration**: "After upload, the extraction pipeline kicks in. Container files - ZIPs, PSTs, MSG archives - are recursively unpacked. Each extracted document gets its own record with full provenance linking back to the parent container."

**Key callouts**:
- Checkpoint recovery: "Large archives checkpoint every 100 entries. If the worker crashes, extraction resumes from the last checkpoint - no lost work."
- Format support: "Over 50 formats: Office docs, PDFs, emails, images, audio, video, archives, CSV, JSON, XML"
- Media processing: "Audio and video files are automatically transcribed. Video gets keyframe extraction. Transcripts become searchable text."

### 2C: OCR Pipeline (120-150s)

**Screen**: Show a document with OCR results (if available in demo data)
**Narration**: "PDFs with text layers get native text extraction - fast and free. Image-only PDFs go through a tiered OCR pipeline."

**Technical detail**: "Tier one: Tesseract OCR with confidence scoring. Pages below seventy percent confidence get promoted to tier two: Gemini AI OCR. Pages below fifty percent go to Gemini Pro. All three results - baseline, AI, and reconciled final - are stored as separate artifacts. Nothing is overwritten. If baseline and AI diverge by more than thirty percent, the page is flagged for human review."

**Key callout**: "This is defensibility by design. In court, you can show exactly what the OCR produced at every tier and why the final text was chosen."

**Transition**: Cut to Part 3

---

## Part 3: AI Case Brief (150-210s)

**Screen**: Brief page with full case brief generated
**Click sequence**:
1. Navigate to Brief via WorkflowRail
2. Scroll through sections: risk assessment, cost model, collection profile
3. Show a citation card linking a brief claim to source documents
4. Click "Download PDF"
5. Show the branded PDF output

**Narration**: "The case brief is generated automatically after processing. It gives attorneys and case managers an executive summary without reading a single document. Risk assessment, estimated costs, key custodians, document type breakdown."

**Technical detail**: "Every statement in the brief cites its source documents. This is enforced at the schema level - the AI cannot produce a claim without a citation. If it tries, the output is rejected and regenerated. We call this the 'cited outputs only' contract."

**Key callout**: "The brief is not a summary of individual documents. It synthesizes patterns across the entire collection - relationships between custodians, communication timelines, recurring topics. That's the difference between search and intelligence."

**Transition**: Cut to Part 4

---

## Part 4: Search Architecture (210-360s)

### 4A: Search Modes Explained (210-260s)

**Screen**: Search page with mode selector
**Click sequence**:
1. Open mode selector, show all 5 modes
2. Execute keyword search: show BM25 results
3. Switch to hybrid mode: show combined results with better ranking

**Narration**: "Five search modes, each with different precision-cost tradeoffs."

**Mode breakdown**:
- "Keyword: Pure BM25 full-text search. Zero AI cost. Good for exact terms and known phrases."
- "Semantic: Vector similarity search using OpenAI embeddings. Finds conceptually related documents even when they don't share keywords."
- "Hybrid: Combines keyword and semantic results using reciprocal rank fusion. This is our default and our best performer - 48% precision at top-10 on the Enron benchmark, versus 31% for semantic alone."

### 4B: Advanced Search Modes (260-310s)

**Click sequence**:
1. Switch to rag_fusion mode and execute a query
2. Show the expanded query variants the AI generated
3. Switch to full mode and show reranked results

**Narration (continued)**:
- "RAG Fusion: The AI expands your query into four variants, runs hybrid search on each, and combines the results. One LLM call, significantly better recall for complex queries."
- "Full Pipeline: RAG fusion plus AI reranking. The top thirty candidates are scored by Gemini for relevance to your original query. Two LLM calls total. Maximum precision when you need it."

**Technical detail**: "The reranker processes candidates in parallel batches of three concurrent LLM calls. Typical rerank of thirty documents takes two to three seconds."

### 4C: Search Results Deep Dive (310-360s)

**Click sequence**:
1. Hover on a result to show X-ray preview
2. Click into a result to open the document viewer
3. Show citation highlighting in the document text
4. Show the search funnel visualization
5. Show search history sidebar

**Narration**: "X-ray preview gives you instant context without navigating away. The document viewer shows the full text with citation highlighting - exactly which passages the AI used for relevance scoring. The search funnel visualizes your volume reduction: total documents, search results, tagged subset."

**Key callout**: "Search results are cached for audit. Every search query, its parameters, and its results are stored with timestamps. If opposing counsel asks how you found a document, you have a complete forensic record."

**Transition**: Cut to Part 5

---

## Part 5: Review and Privilege (360-420s)

### 5A: Document Tagging (360-390s)

**Screen**: Search results with tagging workflow
**Click sequence**:
1. Show bulk selection (checkboxes on results)
2. Tag selected as "relevant"
3. Show tag counts updating in real-time
4. Navigate to Review Center

**Narration**: "Tag documents directly from search results. Relevant, privileged, needs review, or custom tags. Tags flow through to your export - only tagged documents make it into the production set."

### 5B: Privilege Detection (390-420s)

**Screen**: Review Center -> privilege queue
**Narration**: "The AI automatically flags potential attorney-client communications based on privilege keywords configured at matter creation. These go into a structured review queue where attorneys can confirm or override the classification."

**Key callout**: "Privilege decisions are logged with the reviewer's identity, timestamp, and reasoning. This is your privilege log foundation - not an afterthought, but built into the workflow."

**Transition**: Cut to Part 6

---

## Part 6: Export and Defensibility (420-480s)

### 6A: Export Formats (420-450s)

**Screen**: Export creation dialog
**Click sequence**:
1. Click "Create Export" on Production page
2. Show format selector: Relativity DAT, Everlaw, DISCO, CSV
3. Configure export options
4. Show export generating

**Narration**: "Export production-ready load files for your review platform. Standard formats that your existing tools expect - no manual conversion, no field mapping."

### 6B: Audit Trail (450-480s)

**Screen**: Audit page showing processing history
**Click sequence**:
1. Navigate to audit view
2. Show processing events for a specific document
3. Show AI decision with citation
4. Show human override logged

**Narration**: "The audit trail is not a feature - it's the foundation. Every file hash, every extraction step, every AI decision with its citations, every human override with the reviewer's identity. Content-addressed storage means files are immutable - what was uploaded is provably what was processed."

**Technical detail**: "We use content-addressed storage with SHA-256 hashing. Every document, every extracted artifact, every OCR pass is stored by its content hash. You cannot modify a file without changing its hash. This is the same integrity model used by Git and blockchain - but applied to legal evidence."

**Transition**: Cut to Part 7

---

## Part 7: Infrastructure and Security (480-540s)

**Screen**: Architecture diagram or admin view (if available), otherwise narrate over app screens

**Narration**: "The platform runs on dedicated infrastructure - no shared multi-tenant cloud where your data sits next to a competitor's. PostgreSQL with pgvector for hybrid search. Redis for job queues. All processing happens on your infrastructure or ours."

**Key callouts**:
- "Tenant isolation: every database query is scoped to your organization. Cross-tenant data access is architecturally impossible, not just policy-prohibited."
- "Role-based access control: admin, attorney, paralegal, reviewer, viewer. Each role sees only what it needs."
- "All AI models are accessed via API - your documents are never used for training. We use OpenAI for embeddings and Google Gemini for inference, both with enterprise data agreements."
- "Background workers handle processing asynchronously. Upload your documents and close the tab - everything continues running."

**Transition**: Cut to closing

---

## Closing (540-570s)

**Screen**: Return to matters dashboard
**Narration**: "That's ECA Triage Accelerator. Pre-processing that turns a hundred gigs into the five gigs you need to review, with a complete forensic audit trail for every step. No more paying to process documents you'll never look at."

**End card**: ECA logo + ecasses.com + "Start Free Trial" + "Book a Demo"

**Final narration**: "Start a free trial at ecasses dot com, or book a live demo with our team."

---

## Production Notes

- This video works best as a screen recording with voiceover (not a talking head)
- Record each part as a separate session for easy re-takes
- Use picture-in-picture for technical diagrams where helpful
- Slow cursor movements - technical buyers want to see the UI details
- Show loading states when they happen - don't edit them out
- Include keyboard shortcuts (Cmd+K) to demonstrate power-user features
- Demo data: Enron matter with 3,000+ processed documents
- All data shown must be from real processed documents
- Consider adding chapter markers in the final video for easy navigation
- Total target: 8-10 minutes. Cut Part 7 (Infrastructure) if running long.
