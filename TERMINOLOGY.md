# Terminology Glossary — SecureProctor / SDC Platform

Single source of truth for user-facing wording across all ports/apps. Use the
**Canonical** term in all visible UI text, copy, labels, and email templates.
Do **not** rename code identifiers (CSS classes, element IDs, JS variables/
functions, `data-*` keys, localStorage keys, URLs) to match — this glossary is
about what users read, not internal naming.

## Ports
| Port | App | Audience |
|---|---|---|
| 3001 | index.html | Proctor Operations Console (main) |
| 3002 | online_proctor.html | Remote proctor |
| 3003 | candidate.html | Candidate |
| 3004 | voucher_ledger.html | Org voucher ledger |
| 3005 | super_admin_3005.html | Super admin |
| 3006 | org_admin.html | (placeholder) |
| 3009 | admin_portal.html | Organization admin |
| 3010 | landing_page.html | Public / sales |
| 3011 | automated_emails.html | Email templates |
| — | classroom-proctor.html / v3 / proctor_auth | In-class proctor + shared auth |

## Canonical terms
| Concept / purpose | Canonical | Deprecated synonyms |
|---|---|---|
| Person taking the exam | **Candidate** | Student, Test-taker, Examinee |
| Group sitting an exam together | **Class** | Session*, Cohort |
| The assessment itself | **Exam** | Test, Assessment |
| Prepaid exam access token | **Voucher** | Code, Voucher Hash Key |
| Proctor in-class credential | **SDC Proctor ID** | (SDC) Proctor Code |
| Proctor online credential | **Proctor License** | — |
| Course content learners study | **Learning Material** | Course |
| Earned credential | **Certificate** | (program = "Certification") |
| Integrity event hierarchy | **Alert → Flag → Incident** | — |
| Buy vouchers (verb) | **Purchase** | Procure, Buy |
| Give a voucher to someone | **Assign** | Allocate |
| Use a voucher | **Redeem** | (Activate = system state) |
| Disabled account status | **Deactivated** | Suspended, Blocked, Restricted |
| Muted alert | **Snoozed** | Silenced |
| Candidate list section | **Candidate Directory** | Candidate Repository, Master Candidate Roster |
| Org/platform finances section | **Financial Ledger** | Invoicing Ledger |
| Proctor pay section | **Earnings & Payments** | — |
| Voucher area (org vs super-admin) | **Voucher Management** (both, by design) | — |

### Voucher lifecycle status
`Not Assigned → Assigned → Activated → Redeemed`
(replaces the ledger's *Available / Bound / Revoked* wording in visible labels.)

\* **"Session"** stays only where it does **not** mean the class entity — e.g.
proctor *Session Earnings* / pay per session, login/auth sessions, and any code
identifier such as `session-detail`, `openSessionDetail`.
