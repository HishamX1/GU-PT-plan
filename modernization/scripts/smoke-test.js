import http from 'node:http';

function request(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      host: '127.0.0.1',
      port: 4000,
      path,
      method,
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      const chunks = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8');
        let json = null;
        try { json = raw ? JSON.parse(raw) : null; } catch { json = null; }
        resolve({ status: res.statusCode, body: raw, json });
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

const checks = ['/api/health', '/api/catalog', '/api/colleges', '/api/programs?collegeId=1', '/', '/admin'];
for (const path of checks) {
  const result = await request(path);
  if (result.status >= 400) {
    throw new Error(`Smoke check failed for ${path}: ${result.status}`);
  }
  console.log(`${path} -> ${result.status}`);
}

const faculty = await request('/api/colleges', 'POST', { name: `Smoke Faculty ${Date.now()}` });
if (faculty.status !== 201 || !faculty.json?.id) throw new Error(`Create faculty failed: ${faculty.status}`);

const program = await request('/api/programs', 'POST', { collegeId: faculty.json.id, name: 'Smoke Program' });
if (program.status !== 201 || !program.json?.id) throw new Error(`Create program failed: ${program.status}`);

const year = await request('/api/years', 'POST', { programId: program.json.id, yearNumber: 1 });
if (year.status !== 201 || !year.json?.id) throw new Error(`Create year failed: ${year.status}`);

const semester = await request('/api/semesters', 'POST', { yearId: year.json.id, semesterNumber: 1 });
if (semester.status !== 201 || !semester.json?.id) throw new Error(`Create semester failed: ${semester.status}`);

const subjectA = await request('/api/subjects', 'POST', {
  semesterId: semester.json.id,
  subjectCode: 'SMK101',
  subjectName: 'Smoke Subject 101',
  credits: 3,
  prerequisiteSubjectIds: []
});
if (subjectA.status !== 201 || !subjectA.json?.id) throw new Error(`Create subject A failed: ${subjectA.status}`);

const subjectB = await request('/api/subjects', 'POST', {
  semesterId: semester.json.id,
  subjectCode: 'SMK102',
  subjectName: 'Smoke Subject 102',
  credits: 3,
  prerequisiteSubjectIds: [subjectA.json.id]
});
if (subjectB.status !== 201 || !subjectB.json?.id) throw new Error(`Create subject B failed: ${subjectB.status}`);

const updatedSubject = await request(`/api/subjects/${subjectB.json.id}`, 'PUT', {
  subjectName: 'Smoke Subject 102 Updated',
  prerequisiteSubjectIds: [subjectA.json.id]
});
if (updatedSubject.status !== 200) throw new Error(`Update subject failed: ${updatedSubject.status}`);

const updatedFaculty = await request(`/api/colleges/${faculty.json.id}`, 'PUT', { name: `${faculty.json.name} Updated` });
if (updatedFaculty.status !== 200) throw new Error(`Update faculty failed: ${updatedFaculty.status}`);

const deletedFaculty = await request(`/api/colleges/${faculty.json.id}`, 'DELETE');
if (deletedFaculty.status !== 200) throw new Error(`Delete faculty failed: ${deletedFaculty.status}`);

console.log('CRUD smoke flow passed.');
