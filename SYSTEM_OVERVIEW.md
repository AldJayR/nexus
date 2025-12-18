# Nexus System Overview - Quick Guide

## 🎯 What is Nexus?
Nexus is an internal project tracking system for student capstone teams following the Water-Scrum-Fall (WSF) methodology. It helps teams monitor progress, track deliverables, manage sprints, and collaborate.

---

## 👥 Three User Roles

### 1. 🔑 Team Lead / Project Manager
**Full Control - Sets Everything Up**
- Creates and configures the project
- Defines the 3 phases (Waterfall, Scrum, Fall) with dates
- Creates deliverables that team members must complete
- Creates sprints and assigns tasks
- **Reviews and approves** all deliverables and evidence
- Can export data and restore deleted items
- Sees full dashboards and analytics

**Key Actions:**
- Invite team members via email
- Upload meeting minutes
- Approve/reject evidence
- Monitor progress and team contributions
- Export backups

---

### 2. 👨‍💻 Team Member / Contributor
**Executes Work - Does the Tasks**
- Views all phases and deliverables (read-only setup)
- **Uploads evidence** to fulfill deliverables
- Creates and updates tasks in sprints
- Marks tasks as Blocked (with explanation)
- Adds comments to collaborate
- Tracks personal progress
- Views feedback from Team Lead

**Key Actions:**
- Upload documents for deliverables
- Update task status (Todo → In Progress → Blocked → Done)
- Add comments and ask questions
- See rejections and feedback
- Track assigned work

---

### 3. 👁️ Adviser / Observer
**Read-Only Monitoring - Evaluates Progress**
- Views entire project progress
- Reviews all submitted evidence
- Downloads summary reports
- Sees team member contributions
- **Cannot edit anything**

**Key Actions:**
- Monitor overall completion percentage
- View all evidence and deliverables
- Export reports for course records
- Verify team activity
- See timelines and deadlines

---

## 📊 Core Features by Function

| Feature                 | Team Lead | Team Member  |    Adviser    |
| ----------------------- | :-------: | :----------: | :-----------: |
| **Project Setup**       |     ✅     |      ❌       |       ❌       |
| **Create Phases**       |     ✅     |      ❌       |       ❌       |
| **Create Deliverables** |     ✅     |      ❌       |       ❌       |
| **Upload Evidence**     |     ❌     |      ✅       |       ❌       |
| **Approve Evidence**    |     ✅     |      ❌       |       ❌       |
| **Create Sprints**      |     ✅     |      ❌       |       ❌       |
| **Assign Tasks**        |     ✅     |      ❌       |       ❌       |
| **Update Tasks**        |     ✅     |      ✅       |       ❌       |
| **Add Comments**        |     ✅     |      ✅       |       ❌       |
| **View Dashboard**      | ✅ (full)  | ✅ (personal) | ✅ (read-only) |
| **Export Data**         |     ✅     |      ❌       |  ✅ (summary)  |
| **Restore Deleted**     |     ✅     |      ❌       |       ❌       |
| **Invite Users**        |     ✅     |      ❌       |       ❌       |
| **View Activity Log**   |     ✅     |      ❌       |       ✅       |

---

## 🔄 Key Workflows

### Workflow 1: Setting Up a Project
1. **Team Lead** creates project with title and description
2. **Team Lead** configures 3 phases (Waterfall, Scrum, Fall) with dates
3. **Team Lead** creates deliverables under each phase
4. **Team Lead** invites team members (emails sent with credentials)
5. **Team Members** receive invite and can log in

### Workflow 2: Submitting Deliverables
1. **Team Member** uploads evidence (PDF, document, file)
2. Deliverable status changes to "Review"
3. **Team Lead** is notified
4. **Team Lead** reviews and either:
   - Approves → Status: "Completed"
   - Requests Changes → Reverts to "In Progress"
5. **Team Member** sees feedback and resubmits if needed

### Workflow 3: Sprint Execution
1. **Team Lead** creates Sprint (e.g., "Sprint 1: 2 weeks")
2. **Team Lead** creates tasks and assigns to team members
3. **Team Members** see tasks in sprint board
4. **Team Members** update status (Todo → In Progress → Done)
5. If blocked → **Team Member** marks as "Blocked" with reason
6. **Team Lead** can unblock or help
7. **Team Lead** uploads meeting minutes at end of sprint

### Workflow 4: Monitoring Progress
1. **Team Lead** views dashboard to see completion %
2. **Team Lead** sees phase progress and team contributions
3. **Adviser** views overall progress (read-only)
4. **Adviser** can export summary report for course records

### Workflow 5: Data Backup
1. **Team Lead** can export all project data as JSON
2. **Team Lead** can download all evidence files as ZIP
3. **Team Lead** can restore accidentally deleted items
4. **Adviser** can generate formatted reports

---

## 📍 Main Pages/Routes

| Route               | Purpose                           | Who Uses                                              |
| ------------------- | --------------------------------- | ----------------------------------------------------- |
| `/login`            | Authentication                    | All roles                                             |
| `/dashboard`        | Overview & metrics                | All roles                                             |
| `/phases`           | View/manage phases & deliverables | Team Lead (edit), Others (view)                       |
| `/deliverables`     | Upload & manage evidence          | Team Member (upload), Team Lead (approve), All (view) |
| `/sprints`          | List all sprints                  | All                                                   |
| `/sprints/[id]`     | Sprint board with tasks           | All (edit tasks if assigned)                          |
| `/meetings`         | Upload & view meeting minutes     | Team Lead (upload), All (view)                        |
| `/timeline`         | Gantt chart view                  | All                                                   |
| `/settings/team`    | Invite & manage users             | Team Lead only                                        |
| `/settings/project` | Project configuration             | Team Lead only                                        |
| `/settings/data`    | Export & backup                   | Team Lead, Adviser (export)                           |

---

## 🎲 Example: Real Project Cycle

### **Project: "AI Customer Support Chatbot"**

**Week 1-2: Planning (Team Lead Setup)**
- Team Lead creates project
- Invites 5 team members + 1 adviser
- Sets up Waterfall phase: Jan 1-31
- Creates 3 deliverables:
  - Requirements Document (due Jan 15)
  - System Architecture (due Jan 25)
  - API Specification (due Jan 31)

**Week 2-3: Requirements (Team Execution)**
- Member 1 uploads Requirements Document on Jan 14
- Status: "Review" → Team Lead notified
- Team Lead reviews: Approves ✅
- Status: "Completed" → Member 1 notified

**Week 3-4: Architecture (Team + Feedback)**
- Member 2 uploads System Architecture on Jan 22
- Team Lead reviews: Requests changes ❌ (missing diagrams)
- Member 2 sees feedback, updates file
- Member 2 resubmits on Jan 24
- Team Lead approves ✅

**Week 4-6: Scrum Phase (Active Sprints)**
- Team Lead creates Sprint 1 (2 weeks)
- Assigns 10 tasks across team members
- Team Members update tasks as they work
- One task gets blocked → Member explains reason
- Sprint wraps up → Team Lead uploads meeting minutes

**Week 6-8: Adviser Monitoring**
- Adviser logs in, sees project is 60% complete
- Advisers views all submitted evidence
- Advisers downloads summary report for course records
- Evidence shows: 4/6 deliverables completed, on track

**End of Project:**
- Team Lead marks final deliverable as approved
- Project reaches 100% completion
- Team Lead exports final backup (JSON + ZIP of all files)
- Adviser generates final report

---

## 🔐 Permission Model

### Public Routes
- `/login` (anyone)

### Protected Routes (Authenticated users only)
- All other routes require login
- Role-based access controls applied

### Role-Specific Permissions

**Team Lead** can:
- ✅ Create and edit phases, deliverables, sprints, tasks
- ✅ Approve/reject evidence
- ✅ Invite users and manage roles
- ✅ Upload meeting minutes
- ✅ Export data and restore deleted items
- ✅ View full activity logs

**Team Member** can:
- ✅ Upload evidence for deliverables
- ✅ Update own assigned tasks
- ✅ Add comments
- ✅ View assigned work and feedback
- ✅ Cannot modify phases or deliverables
- ✅ Cannot invite users

**Adviser** can:
- ✅ View all data (read-only)
- ✅ Download evidence and reports
- ✅ View activity logs
- ❌ Cannot edit, delete, or create anything
- ❌ Cannot upload evidence

---

## 📋 Status Definitions

### Deliverable Status
- **Not Started** (Gray) - No work begun
- **In Progress** (Yellow) - Work is underway
- **Review** (Blue) - Evidence uploaded, waiting for approval
- **Completed** (Green) - Team Lead approved ✅

### Task Status
- **Todo** - Not started
- **In Progress** - Currently being worked on
- **Blocked** - Cannot proceed (requires explanation)
- **Done** - Completed

### Phase Status
- **Active** - Currently running
- **Completed** - Finished
- **On Hold** - Paused

---

## 💾 Data & Backups

### What Gets Tracked
- Project metadata (title, description, dates)
- Phases and deliverables
- Sprints and tasks
- Evidence uploads (with version history)
- Comments and collaboration
- Meeting minutes
- Team member contributions
- Full activity audit log

### Soft Delete (Recovery)
- Deleted items stored for 30 days
- Team Lead can restore with one click
- All related data (evidence, comments) restored
- Activity log shows who deleted and when

### Export Options
- **Full Export**: JSON of all project data + ZIP of all files
- **Summary Export**: Report for advisers (no sensitive data)
- **Evidence Archive**: ZIP of all uploaded files organized by deliverable

---

## 🎓 For Course Coordinators / Advisers

As an Adviser, your workflow:

1. **Receive Login** from Team Lead
2. **Monitor Dashboard** → See 0-100% completion
3. **Review Evidence** → Download and verify deliverables
4. **Check Activity** → See who did what and when
5. **Verify Contributions** → See each team member's effort
6. **Export Report** → Generate PDF/JSON for course records
7. **Evaluate** → Make grading decisions based on evidence

You have **full visibility** but **zero editing** permissions (read-only).

---

## 📚 Key Concepts

### Water-Scrum-Fall (WSF)
- **Waterfall**: Planning & Design phase (sequential deliverables)
- **Scrum**: Development phase (time-boxed sprints with iterations)
- **Fall**: Testing, Deployment & Closure phase

### Soft Delete
- Items marked "deleted" but stored in database
- Can be restored (unlike hard delete)
- Keeps audit trail intact
- 30-day retention minimum

### Evidence
- Files uploaded to prove deliverable completion
- Can have multiple versions (version history tracked)
- Team Lead reviews and approves
- Timestamps and uploader recorded

### Comments & Collaboration
- Threaded discussions on tasks and deliverables
- Support @mentions and notifications
- Visible to all team members
- Editable by author, deletable by Team Lead

---

## ❓ Common Questions

**Q: Can a Team Member approve deliverables?**
A: No, only Team Lead can approve. Team Members upload evidence.

**Q: What happens if evidence is rejected?**
A: Deliverable status reverts to "In Progress". Team Member sees feedback and can resubmit.

**Q: Can Team Members create tasks?**
A: No, only Team Lead creates tasks and sprints. Team Members update task status.

**Q: Can Adviser download evidence?**
A: Yes, Adviser can download and preview all evidence (read-only).

**Q: Can I restore a task deleted 40 days ago?**
A: No, soft delete retention is 30 days. After that, data cannot be recovered.

**Q: Can Team Members invite other users?**
A: No, only Team Lead can invite users via email.

**Q: What if someone marks a task as "Blocked"?**
A: They must explain why (comment required). Team Lead can then help unblock.

---

## 📞 Support & Next Steps

For detailed user stories, feature specifications, and implementation notes, see **[USER_STORIES.md](USER_STORIES.md)**.

For technical API documentation, see **server/src/modules/**.
