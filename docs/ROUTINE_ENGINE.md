# Routine Engine Specification

## Overview

The Routine Engine generates daily schedules from:
1. User profile (working hours, sleep, energy, country/weekend rules)
2. Routine block definitions (from profession template)
3. Prayer times (Aladhan API, cached daily)
4. Auto-schedulable tasks

## Algorithm

1. Check if date is a rest day → generate rest + prayer blocks only
2. Filter applicable routine blocks by day of week
3. Place blocks at `startTimeHint` or working hours start
4. Apply Friday Jumu'ah rule: office work stops at Dhuhr
5. Inject prayer blocks at exact prayer times
6. Auto-place tasks into matching energy blocks
7. Run conflict detection on final schedule

## Prayer Constraints

- Prayer blocks are immovable (`isFlexible: false`)
- Jumu'ah replaces Dhuhr on Fridays (60 min duration)
- Focus sessions should pause 5 min before prayer (notification layer)

## Energy Mapping

| Time | Default Energy |
|------|---------------|
| 5am–12pm | HIGH |
| 12pm–5pm | MEDIUM |
| 5pm–9pm | LIGHT |
| 9pm+ | PERSONAL |

Overridden by `Profile.energyProfile` JSON.

## Adaptive Rescheduling

When conflicts detected:
- Return conflict list to UI
- AI optimizer suggests redistribution
- User confirms before applying changes (unless `autoAdaptSchedule` enabled)

## Templates

6 system templates seeded: Software Engineer, UI/UX Designer, Freelancer, Student, Startup Founder, Remote Worker.

Software Engineer template based on `sahin_islamic_routine.html` reference schedule.
