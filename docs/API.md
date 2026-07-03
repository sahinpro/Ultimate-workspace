# API Reference (v1)

Base: `/api/v1`

All endpoints require authentication unless noted. Response envelope: `{ data, error, meta? }`

## Tasks

| Method | Path | Description |
|--------|------|-------------|
| GET | /tasks | List tasks (filter: status, priority, page, limit) |
| POST | /tasks | Create task |
| PATCH | /tasks/:id | Update task |
| DELETE | /tasks/:id | Soft delete |

## Vault

| Method | Path | Description |
|--------|------|-------------|
| GET | /vault | List items (no decrypted payload) |
| POST | /vault | Create encrypted item |
| GET | /vault/:id | Decrypt and return item |
| PATCH | /vault/:id | Update item |
| DELETE | /vault/:id | Soft delete |

## Routine

| Method | Path | Description |
|--------|------|-------------|
| GET | /routine/schedule?date=&view=day\|week | Get schedule |
| POST | /routine/schedule/generate | Regenerate schedule |
| PATCH | /routine/schedule/blocks/:id | Move/resize block |
| GET | /routine/prayer-times?date= | Prayer times + next countdown |
| GET/POST | /routine/blocks | Blocks, templates, rules |
| GET | /routine/analytics?range=week | Analytics data |
| POST | /routine/optimize | AI suggestions |
