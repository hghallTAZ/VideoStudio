# ECA Triage Accelerator - Feature Tour Script

**Duration**: 3-4 minutes
**Audience**: Prospects evaluating the product, sales calls, website embed
**Tone**: Professional walkthrough. Show, don't tell. Let the UI speak.
**Resolution**: 1920x1080 @ 2x (Retina)
**Demo account**: attorney@lawfirm.com

---

## Intro (0-10s)

**Screen**: Matters page, fresh login
**Narration**: "This is ECA Triage Accelerator - a pre-processing platform for legal e-discovery. Let me walk you through the complete workflow from document upload to production-ready export."
**Transition**: Cut to Step 1

---

## Step 1: Create a Matter (10-30s)

**Screen**: Matters page -> click "New Matter" button
**Click sequence**:
1. Click "New Matter" in the top-right area
2. Fill in matter name: "Wilson v. Acme Corp"
3. Add matter number: "2026-CV-0847"
4. Click "Create"
5. Show new matter appear in the list

**Narration**: "Start by creating a matter - an isolated workspace for your case. Each matter has its own documents, search index, and audit trail. Assign a matter number and configure privilege keywords at creation."

**Key callouts**:
- Mention tenant isolation: "Matters are hermetically sealed - no cross-contamination between cases"
- Show the matter card appearing with status "intake"

**Transition**: Crossfade to Step 2

---

## Step 2: Upload Documents (30-60s)

**Screen**: Documents page (navigate via WorkflowRail "Evidence" button)
**Click sequence**:
1. Click "Evidence" in the WorkflowRail
2. Show the upload zone (drag-drop area)
3. Drop or select files (mix of PDFs, emails, a ZIP archive)
4. Show upload progress bars with SHA-256 hashing
5. Show document registry populating with file types and sizes

**Narration**: "Upload your source files - PSTs, MSG archives, PDFs, Office documents, ZIP archives, audio, video. Over fifty formats supported. The platform hashes every file with SHA-256 on upload for deduplication and chain of custody."

**Key callouts**:
- Duplicate detection: "If you upload the same file twice, it's automatically detected"
- Show variety of file type icons in the registry
- Mention streaming batch processing: "Handles datasets of any size without browser memory issues"

**Transition**: Crossfade to Step 3

---

## Step 3: Processing (60-90s)

**Screen**: Matter detail page showing processing status
**Click sequence**:
1. Show the processing tab or operations view
2. Point out the status chips (queued -> processing -> processed)
3. Show progress updating in real-time
4. Point out the document count increasing

**Narration**: "The platform extracts text, generates embeddings, and runs AI triage automatically. ZIP and PST archives are unpacked recursively. Image-only PDFs get OCR with tiered quality - standard Tesseract for clean pages, Gemini AI for difficult ones. Every extraction decision is logged."

**Key callouts**:
- Container extraction: "ZIPs and PSTs are recursively unpacked with checkpoint recovery"
- OCR tiering: "Difficult pages automatically escalate to AI-powered OCR"
- Background processing: "Work continues in the background - you don't need to wait"

**Transition**: Crossfade to Step 4

---

## Step 4: AI Case Brief (90-120s)

**Screen**: Brief page (click "Brief" in WorkflowRail)
**Click sequence**:
1. Click "Brief" in WorkflowRail
2. Show the generated brief with sections:
   - Risk assessment
   - Cost estimates
   - Collection profile
   - Processing summary
3. Click "Download PDF" to show branded output

**Narration**: "Once processing completes, the AI generates a case brief - risk assessment, cost estimates, key custodian profiles, and a processing plan. Download it as a branded PDF for client presentations or internal review."

**Key callouts**:
- Every claim in the brief is backed by document citations
- Brief updates as more documents are processed
- PDF output is presentation-ready

**Transition**: Crossfade to Step 5

---

## Step 5: Search and Discovery (120-170s)

**Screen**: Search page (click "Evidence" in WorkflowRail)
**Click sequence**:
1. Click "Evidence" in WorkflowRail, navigate to search
2. Show the search interface with mode selector
3. Type a query: "California energy crisis"
4. Execute search in hybrid mode (default)
5. Show results with relevance scores
6. Hover on a result to show X-ray preview card
7. Switch to "full" mode to show AI-powered reranking
8. Show the search funnel visualization (volume reduction tiers)

**Narration**: "Five search modes, each building on the last. Keyword search for exact terms. Semantic search for concepts. Hybrid combines both with reciprocal rank fusion - our default and best performer. RAG fusion expands your query automatically. Full pipeline adds AI reranking for maximum precision."

**Sub-narration (on X-ray hover)**: "Hover on any result to see an X-ray preview - key text, relevance score, and source context without leaving the results page."

**Sub-narration (on funnel)**: "The search funnel shows your volume reduction at each tier - from total documents down to your focused review set."

**Key callouts**:
- 70.7% precision validated on Enron corpus
- Hybrid mode: zero LLM calls, fast and precise
- Full mode: two LLM calls for maximum accuracy
- Show the demo search presets if in demo mode

**Transition**: Crossfade to Step 6

---

## Step 6: Review and Tagging (170-200s)

**Screen**: Search results with tagging interface
**Click sequence**:
1. Select a document from results
2. Open the document viewer (UniversalViewer)
3. Show citation highlighting in the document
4. Tag the document as "relevant" or "privileged"
5. Show the tag count updating
6. Mention the review center for batch operations

**Narration**: "Tag documents directly from search results - relevant, privileged, or needs review. Each AI triage decision shows its citations so you can verify the reasoning. For batch operations, the Review Center provides structured queues with decision logging."

**Key callouts**:
- Citation enforcement: "Every AI decision cites source text - no black box"
- Privilege detection: "Potential attorney-client communications are auto-flagged"
- Audit trail: "Every human and AI decision is logged with timestamp and user"

**Transition**: Crossfade to Step 7

---

## Step 7: Export (200-225s)

**Screen**: Export page (click "Production" in WorkflowRail)
**Click sequence**:
1. Click "Production" in WorkflowRail
2. Click "Create Export"
3. Show format selector (Relativity, Everlaw, DISCO, CSV)
4. Show export configuration options
5. Show export completing with download button

**Narration**: "Generate production-ready load files for your review platform - Relativity, Everlaw, DISCO, or standard CSV. Each export includes a cryptographic audit trail documenting every processing step, every AI decision, and every human override."

**Key callouts**:
- Court-defensible audit trail
- Standard load file formats
- Volume reduction stats in the export summary

**Transition**: Crossfade to closing

---

## Closing (225-240s)

**Screen**: Return to matters page, showing the matter with "exported" status
**Narration**: "That's the complete workflow. Upload, process, search, review, export. Turn a hundred gigs into the five gigs you need to review - with a complete audit trail for every step. Start your free trial at ecasses dot com."

**End card**: ECA logo + ecasses.com + "Start Free Trial"

---

## Production Notes

- Record each step as a separate take for easy editing
- Pause 1-2 seconds between clicks for viewer comprehension
- Keep cursor movements deliberate and smooth
- Use dark mode throughout
- Demo data: Enron matter on production server
- All search results must be from real processed documents
- If a feature is loading, show the loading state - don't skip it
- B-roll opportunities: processing progress bar, search results populating, citation cards
