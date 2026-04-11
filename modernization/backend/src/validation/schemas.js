function isPositiveInt(value) {
  return Number.isInteger(value) && value > 0;
}
function isPositiveIntArray(values) {
  return Array.isArray(values) && values.every((value) => isPositiveInt(value));
}

function validOptionalText(value, min = 2) {
  return value === undefined || (typeof value === 'string' && value.trim().length >= min);
}

export function validateEntityId(id, label = 'id') {
  if (!isPositiveInt(id)) return `Invalid ${label}`;
  return null;
}

export function validateCollege(body) {
  if (!body || typeof body.name !== 'string' || body.name.trim().length < 2) return 'Invalid college name';
  return null;
}

export function validateCollegePatch(body) {
  if (!body || !validOptionalText(body.name, 2)) return 'Invalid college name';
  return null;
}

export function validateProgram(body) {
  if (!isPositiveInt(body?.collegeId)) return 'Invalid collegeId';
  if (typeof body?.name !== 'string' || body.name.trim().length < 2) return 'Invalid program name';
  return null;
}

export function validateProgramPatch(body) {
  if (!body || !validOptionalText(body.name, 2)) return 'Invalid program name';
  if (body.collegeId !== undefined && !isPositiveInt(body.collegeId)) return 'Invalid collegeId';
  return null;
}

export function validateYear(body) {
  if (!isPositiveInt(body?.programId)) return 'Invalid programId';
  if (!isPositiveInt(body?.yearNumber) || body.yearNumber > 20) return 'Invalid yearNumber';
  return null;
}

export function validateYearPatch(body) {
  if (!body) return 'Invalid payload';
  if (body.programId !== undefined && !isPositiveInt(body.programId)) return 'Invalid programId';
  if (body.yearNumber !== undefined && (!isPositiveInt(body.yearNumber) || body.yearNumber > 20)) return 'Invalid yearNumber';
  return null;
}

export function validateSemester(body) {
  if (!isPositiveInt(body?.yearId)) return 'Invalid yearId';
  if (![1, 2].includes(body?.semesterNumber)) return 'Invalid semesterNumber';
  return null;
}

export function validateSemesterPatch(body) {
  if (!body) return 'Invalid payload';
  if (body.yearId !== undefined && !isPositiveInt(body.yearId)) return 'Invalid yearId';
  if (body.semesterNumber !== undefined && ![1, 2].includes(body.semesterNumber)) return 'Invalid semesterNumber';
  return null;
}

export function validateSubject(body) {
  if (!isPositiveInt(body?.semesterId)) return 'Invalid semesterId';
  if (typeof body?.subjectName !== 'string' || body.subjectName.trim().length < 2) return 'Invalid subjectName';
  if (typeof body?.subjectCode !== 'string' || body.subjectCode.trim().length < 1) return 'Invalid subjectCode';
  if (!isPositiveInt(body?.credits) || body.credits > 30) return 'Invalid credits';
  if (body.notes !== undefined && body.notes !== null && typeof body.notes !== 'string') return 'Invalid notes';
  if (body.collegeId !== undefined && !isPositiveInt(body.collegeId)) return 'Invalid collegeId';
  if (body.programId !== undefined && !isPositiveInt(body.programId)) return 'Invalid programId';
  if (body.yearId !== undefined && !isPositiveInt(body.yearId)) return 'Invalid yearId';
  if (!isPositiveIntArray(body?.prerequisiteSubjectIds || [])) return 'Invalid prerequisiteSubjectIds';
  return null;
}

export function validateSubjectPatch(body) {
  if (!body) return 'Invalid payload';
  if (body.semesterId !== undefined && !isPositiveInt(body.semesterId)) return 'Invalid semesterId';
  if (body.subjectName !== undefined && (typeof body.subjectName !== 'string' || body.subjectName.trim().length < 2)) return 'Invalid subjectName';
  if (body.subjectCode !== undefined && (typeof body.subjectCode !== 'string' || body.subjectCode.trim().length < 1)) return 'Invalid subjectCode';
  if (body.credits !== undefined && (!isPositiveInt(body.credits) || body.credits > 30)) return 'Invalid credits';
  if (body.notes !== undefined && body.notes !== null && typeof body.notes !== 'string') return 'Invalid notes';
  if (body.collegeId !== undefined && !isPositiveInt(body.collegeId)) return 'Invalid collegeId';
  if (body.programId !== undefined && !isPositiveInt(body.programId)) return 'Invalid programId';
  if (body.yearId !== undefined && !isPositiveInt(body.yearId)) return 'Invalid yearId';
  if (body.prerequisiteSubjectIds !== undefined && !isPositiveIntArray(body.prerequisiteSubjectIds)) return 'Invalid prerequisiteSubjectIds';
  return null;
}
