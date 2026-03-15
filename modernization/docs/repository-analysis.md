# Repository Analysis (Step 1)

## Original source interpretation
- Source of truth for academic plan: `../data.js`.
- Plan shape in original app: flat `courses[]` list with:
  - `code`
  - `name`
  - `semester` (1..10)
  - `prerequisites[]`
  - `credits`
- Academic year derived as `ceil(semester / 2)`.
- In-year semester derived as:
  - odd term => semester 1
  - even term => semester 2

## Extracted academic summary
- College: Galala University.
- Program: Physical Therapy Program.
- Years: 5.
- Semesters: 10.
- Subjects: 68.

## Internal normalized model
- College(1) -> Program(N)
- Program(1) -> Year(N)
- Year(1) -> Semester(N)
- Semester(1) -> Subject(N)
- Subject(N) -> Subject(N) prerequisites via junction table

## Data caveat detected
- Subject `BPT514` references prerequisite code `LIB116` that does not exist in source course list.
- This is preserved in extracted notes for traceability.
