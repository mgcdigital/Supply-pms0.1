# Service PMS (Project Management System)

A modern web-based **Service Project Management System** designed for executing on-site services, tracking quantity-based progress, visualizing project schedules via interactive Gantt charts, and exporting live Excel execution sheets.

## Features
- **Multi-Site / Multi-Project Management**: Create, view, edit, hide, and manage multiple projects independently.
- **Quantity-Based Work Completion**:
  - Total Scope Qty & UOM (Mtr, Nos, Sets, LS).
  - Doer enters completed quantity; auto-calculates % completion.
  - Automatically transitions to `100% Completed` when completed quantity matches scope.
- **Section & Package Hierarchy**:
  - Group tasks under custom or predefined WBS sections (e.g. *Description of Work*, *Cable Schedule*, *11kv Portal S/S*, etc.).
  - Add new tasks directly under any existing section or create new sections.
- **Gantt Chart & Duration Timeline**:
  - View task durations with color-coded tags (High / Medium / Low).
  - High-contrast visual progress indicators for `0% Pending`, `In Progress`, and `100% Completed`.
- **Live Excel Export (Plan vs Actual Sync)**:
  - Generates formatted `.xlsx` sheets containing full project metadata and task execution logs with one click.
- **Offline Persistence & Backup**:
  - Auto-saves all changes in browser LocalStorage.
  - JSON backup and restore capabilities.

## Getting Started
Open `index.html` directly in any web browser, or run a local static server:
```bash
python -m http.server 8080
```
Then navigate to `http://localhost:8080/index.html`.
