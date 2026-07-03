# Entity Relationship Diagram

See `prisma/schema.prisma` for the source of truth.

## Core Entities

- **User** — auth identity, role
- **Profile** — onboarding data, energy profile, weekend rules, prayer settings
- **Task** — todos with optional auto-schedule flag
- **VaultItem** — AES-256-GCM encrypted payloads
- **RoutineTemplate / RoutineBlock** — reusable block definitions
- **ScheduleDay / ScheduledBlock** — generated daily schedules
- **PrayerTimeCache** — daily Aladhan API cache per user
- **PersonalRule** — user-defined scheduling anchors
- **AuditLog** — vault access trail

## Vault Encryption

Envelope pattern: `deriveKey = SHA256(masterKey + userId)`. AES-256-GCM with random 12-byte IV. Auth tag appended to ciphertext.

## Indexes

- `ScheduleDay(userId, date)` unique
- `ScheduledBlock(scheduleDayId, startTime)`
- `Task(userId, status)`, `Task(userId, dueDate)`
- `PrayerTimeCache(userId, date)` unique
