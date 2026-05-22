# Paper Library

The Paper Library manages your local papers in E:/paper through the Local Research Bridge.

## Architecture

PDF files remain in E:/paper. The SQLite database stores metadata, file paths, extracted text/chunks, summaries, notes, tags, and task records.

## Database Schema

### papers
- id, title, authors, year, venue, abstract, doi, arxiv_id, url
- local_path, source, tags, status
- created_at, updated_at

### paper_files
- paper_id, file_path, file_type, file_hash, size_bytes

### paper_chunks
- paper_id, chunk_index, section_title, text, token_count, embedding_id

### paper_summaries
- paper_id, summary_type, content, model

### paper_notes
- paper_id, note_type, content

### research_tasks
- task_type, topic, selected_paper_ids, status, progress, result_path, logs

## Features

### Library Status
- Bridge connection status
- Database path
- Paper count, chunk count, task count
- Paper folder path
- Output folder path

### Scan and Import
- Scan configured paper folder for PDF/MD/TXT/BIB files
- Import selected papers into database
- Re-index library
- Show number of found/new/existing papers

### Paper Search
- Keyword search (title, authors, abstract, venue)
- Tag filter
- Year filter
- Venue filter
- Status filter

### Paper Detail
- Full metadata display
- Local file path
- AI-generated summary
- Notes
- Linked tasks

### LLM Integration
- Summarize individual papers
- Batch summarize selected papers
- Results saved to paper_summaries table

## Current Limitations

- PDF text extraction is planned but not yet implemented
- FTS5 full-text search is planned
- Vector embeddings are planned
