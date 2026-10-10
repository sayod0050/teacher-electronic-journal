const STORAGE_KEY = 'teacher-journal-v1';

const defaultData = {
  classes: [
    { id: crypto.randomUUID(), name: 'Grade 8-A', grade: '8', teacher: 'Ms. Johnson', room: 'Room 12' },
    { id: crypto.randomUUID(), name: 'Grade 9-B', grade: '9', teacher: 'Mr. Owen', room: 'Room 7' },
  ],
  students: [
    { id: crypto.randomUUID(), name: 'Alice Brown', classId: '', parentName: 'Daniel Brown', parentPhone: '+123456789', parentEmail: 'daniel@example.com' },
    { id: crypto.randomUUID(), name: 'Mason Smith', classId: '', parentName: 'Emma Smith', parentPhone: '+198765432', parentEmail: 'emma@example.com' },
  ],
  lessons: [
    { id: crypto.randomUUID(), title: 'Mathematics', classId: '', day: 'Monday', time: '09:00', teacher: 'Ms. Johnson' },
    { id: crypto.randomUUID(), title: 'Literature', classId: '', day: 'Wednesday', time: '11:00', teacher: 'Mr. Owen' },
  ],
  grades: [
    { id: crypto.randomUUID(), studentId: '', classId: '', lessonId: '', assessment: 'Unit Test', mark: 88, date: '2026-10-01' },
    { id: crypto.randomUUID(), studentId: '', classId: '', lessonId: '', assessment: 'Quiz', mark: 76, date: '2026-10-05' },
  ],
};

let data = loadData();

const elements = {
  totalClasses: document.getElementById('total-classes'),
  totalStudents: document.getElementById('total-students'),
  totalLessons: document.getElementById('total-lessons'),
  avgGrade: document.getElementById('avg-grade'),
  classList: document.getElementById('class-list'),
  lessonList: document.getElementById('lesson-list'),
  studentTable: document.getElementById('student-table-body'),
  tableClassFilter: document.getElementById('table-class-filter'),
  classForm: document.getElementById('class-form'),
  studentForm: document.getElementById('student-form'),
  lessonForm: document.getElementById('lesson-form'),
  gradeForm: document.getElementById('grade-form'),
  studentClass: document.getElementById('student-class'),
  lessonClass: document.getElementById('lesson-class'),
  gradeClass: document.getElementById('grade-class'),
  gradeStudent: document.getElementById('grade-student'),
  gradeLesson: document.getElementById('grade-lesson'),
};

init();

function init() {
  if (!data || !data.classes || !data.students || !data.lessons || !data.grades) {
    data = structuredClone(defaultData);
    saveData();
  }

  ensureStudentClassMappings();
  setDefaultGradeDates();
  attachEvents();
  renderAll();
}

function attachEvents() {
  elements.classForm.addEventListener('submit', handleClassSubmit);
  elements.studentForm.addEventListener('submit', handleStudentSubmit);
  elements.lessonForm.addEventListener('submit', handleLessonSubmit);
  elements.gradeForm.addEventListener('submit', handleGradeSubmit);
  elements.gradeClass.addEventListener('change', renderGradeLessonOptions);
  elements.tableClassFilter.addEventListener('change', renderStudentTable);
}

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return null;

  try {
    return JSON.parse(saved);
  } catch (error) {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function setDefaultGradeDates() {
  const dateInput = document.getElementById('grade-date');
  if (!dateInput.value) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }
}

function ensureStudentClassMappings() {
  if (!data.classes.length) return;

  data.students.forEach((student) => {
    if (!student.classId) {
      student.classId = data.classes[0].id;
    }
  });

  data.lessons.forEach((lesson) => {
    if (!lesson.classId && data.classes.length) {
      lesson.classId = data.classes[0].id;
    }
  });

  data.grades.forEach((grade) => {
    if (!grade.classId && data.classes.length) {
      grade.classId = data.classes[0].id;
    }
    if (!grade.studentId && data.students.length) {
      grade.studentId = data.students[0].id;
    }
    if (!grade.lessonId && data.lessons.length) {
      grade.lessonId = data.lessons[0].id;
    }
  });
}

function handleClassSubmit(event) {
  event.preventDefault();

  const name = document.getElementById('class-name').value.trim();
  const grade = document.getElementById('class-grade').value.trim();
  const room = document.getElementById('class-room').value.trim();
  const teacher = document.getElementById('class-teacher').value.trim();

  if (!name || !teacher) return;

  data.classes.push({
    id: crypto.randomUUID(),
    name,
    grade,
    room,
    teacher,
  });

  saveData();
  event.target.reset();
  renderAll();
}

function handleStudentSubmit(event) {
  event.preventDefault();

  const name = document.getElementById('student-name').value.trim();
  const classId = document.getElementById('student-class').value;
  const parentName = document.getElementById('parent-name').value.trim();
  const parentPhone = document.getElementById('parent-phone').value.trim();
  const parentEmail = document.getElementById('parent-email').value.trim();

  if (!name || !classId) return;

  data.students.push({
    id: crypto.randomUUID(),
    name,
    classId,
    parentName,
    parentPhone,
    parentEmail,
  });

  saveData();
  event.target.reset();
  renderAll();
}

function handleLessonSubmit(event) {
  event.preventDefault();

  const title = document.getElementById('lesson-title').value.trim();
  const classId = document.getElementById('lesson-class').value;
  const day = document.getElementById('lesson-day').value;
  const time = document.getElementById('lesson-time').value;
  const teacher = document.getElementById('lesson-teacher').value.trim();

  if (!title || !classId) return;

  data.lessons.push({
    id: crypto.randomUUID(),
    title,
    classId,
    day,
    time,
    teacher,
  });

  saveData();
  event.target.reset();
  document.getElementById('lesson-time').value = '09:00';
  renderAll();
}

function handleGradeSubmit(event) {
  event.preventDefault();

  const studentId = document.getElementById('grade-student').value;
  const classId = document.getElementById('grade-class').value;
  const lessonId = document.getElementById('grade-lesson').value;
  const assessment = document.getElementById('grade-assessment').value.trim();
  const mark = Number(document.getElementById('grade-mark').value);
  const date = document.getElementById('grade-date').value;

  if (!studentId || !classId || !lessonId || !assessment || !date) return;

  data.grades.push({
    id: crypto.randomUUID(),
    studentId,
    classId,
    lessonId,
    assessment,
    mark,
    date,
  });

  saveData();
  event.target.reset();
  document.getElementById('grade-mark').value = 80;
  document.getElementById('grade-date').value = new Date().toISOString().split('T')[0];
  renderAll();
}

function renderAll() {
  renderSummary();
  renderClassOptions();
  renderClassList();
  renderLessonList();
  renderStudentTable();
}

function renderSummary() {
  elements.totalClasses.textContent = data.classes.length;
  elements.totalStudents.textContent = data.students.length;
  elements.totalLessons.textContent = data.lessons.length;

  const marks = data.grades.map((grade) => grade.mark).filter((mark) => !Number.isNaN(mark));
  const average = marks.length ? (marks.reduce((sum, value) => sum + value, 0) / marks.length).toFixed(0) : 0;
  elements.avgGrade.textContent = `${average}%`;
}

function renderClassOptions() {
  const options = data.classes.map((classItem) => `<option value="${classItem.id}">${classItem.name}</option>`).join('');

  elements.studentClass.innerHTML = options || '<option value="">No classes available</option>';
  elements.lessonClass.innerHTML = options || '<option value="">No classes available</option>';
  elements.gradeClass.innerHTML = options || '<option value="">No classes available</option>';
  elements.tableClassFilter.innerHTML = '<option value="all">All classes</option>' + options;

  if (data.classes.length) {
    if (!elements.studentClass.value) elements.studentClass.value = data.classes[0].id;
    if (!elements.lessonClass.value) elements.lessonClass.value = data.classes[0].id;
    if (!elements.gradeClass.value) elements.gradeClass.value = data.classes[0].id;
  }

  renderGradeStudentOptions();
  renderGradeLessonOptions();
}

function renderGradeStudentOptions() {
  const selectedClassId = elements.gradeClass.value || data.classes[0]?.id || '';
  const students = data.students.filter((student) => student.classId === selectedClassId);

  if (!students.length) {
    elements.gradeStudent.innerHTML = '<option value="">No students in this class</option>';
    return;
  }

  elements.gradeStudent.innerHTML = students
    .map((student) => `<option value="${student.id}">${student.name}</option>`)
    .join('');
}

function renderGradeLessonOptions() {
  const selectedClassId = elements.gradeClass.value || data.classes[0]?.id || '';
  const lessons = data.lessons.filter((lesson) => lesson.classId === selectedClassId);

  if (!lessons.length) {
    elements.gradeLesson.innerHTML = '<option value="">No lessons in this class</option>';
    return;
  }

  elements.gradeLesson.innerHTML = lessons
    .map((lesson) => `<option value="${lesson.id}">${lesson.title} (${lesson.day})</option>`)
    .join('');
}

function renderClassList() {
  if (!data.classes.length) {
    elements.classList.innerHTML = '<div class="empty-state">No classes added yet.</div>';
    return;
  }

  elements.classList.innerHTML = data.classes
    .map(
      (item) => `
        <div class="list-item">
          <div class="list-meta">
            <strong>${item.name}</strong>
            <span>${item.teacher} • ${item.grade || 'Grade'} • ${item.room || 'Room TBD'}</span>
          </div>
          <button class="delete-btn" data-type="class" data-id="${item.id}">Delete</button>
        </div>
      `
    )
    .join('');

  bindDeleteActions();
}

function renderLessonList() {
  if (!data.lessons.length) {
    elements.lessonList.innerHTML = '<div class="empty-state">No lessons scheduled yet.</div>';
    return;
  }

  elements.lessonList.innerHTML = data.lessons
    .map((lesson) => {
      const className = getClassName(lesson.classId);
      return `
        <div class="list-item">
          <div class="list-meta">
            <strong>${lesson.title}</strong>
            <span>${className} • ${lesson.day} • ${lesson.time || 'Time TBD'} • ${lesson.teacher || 'Teacher TBD'}</span>
          </div>
          <button class="delete-btn" data-type="lesson" data-id="${lesson.id}">Delete</button>
        </div>
      `;
    })
    .join('');

  bindDeleteActions();
}

function renderStudentTable() {
  let students = [...data.students];
  const selectedClassId = elements.tableClassFilter.value;

  if (selectedClassId !== 'all') {
    students = students.filter((student) => student.classId === selectedClassId);
  }

  if (!students.length) {
    elements.studentTable.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">No students available for the selected class.</div>
        </td>
      </tr>
    `;
    return;
  }

  elements.studentTable.innerHTML = students
    .map((student) => {
      const className = getClassName(student.classId);
      const studentGrades = data.grades.filter((grade) => grade.studentId === student.id);
      const avg = studentGrades.length
        ? (studentGrades.reduce((sum, grade) => sum + Number(grade.mark || 0), 0) / studentGrades.length).toFixed(0)
        : '0';
      const latest = studentGrades.length ? studentGrades.sort((a, b) => new Date(b.date) - new Date(a.date))[0] : null;
      const lessons = data.lessons.filter((lesson) => lesson.classId === student.classId).map((lesson) => lesson.title).join(', ') || 'No lessons';

      const badgeClass = Number(avg) >= 75 ? 'good' : Number(avg) >= 50 ? 'medium' : 'low';

      return `
        <tr>
          <td>
            <div class="student-name">
              <strong>${student.name}</strong>
              <span>${student.parentName || 'No parent info'}</span>
            </div>
          </td>
          <td>${className}</td>
          <td>
            ${student.parentPhone || '—'}<br />
            ${student.parentEmail || '—'}
          </td>
          <td>${lessons}</td>
          <td><span class="badge ${badgeClass}">${avg}%</span></td>
          <td>${latest ? `${latest.mark}% • ${latest.assessment}` : 'No marks yet'}</td>
        </tr>
      `;
    })
    .join('');
}

function bindDeleteActions() {
  document.querySelectorAll('.delete-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const type = button.dataset.type;
      const id = button.dataset.id;

      if (type === 'class') {
        data.classes = data.classes.filter((item) => item.id !== id);
        data.students = data.students.filter((student) => student.classId !== id);
        data.lessons = data.lessons.filter((lesson) => lesson.classId !== id);
        data.grades = data.grades.filter((grade) => grade.classId !== id);
      }

      if (type === 'lesson') {
        data.lessons = data.lessons.filter((item) => item.id !== id);
        data.grades = data.grades.filter((grade) => grade.lessonId !== id);
      }

      saveData();
      renderAll();
    });
  });
}

function getClassName(classId) {
  const classItem = data.classes.find((item) => item.id === classId);
  return classItem ? classItem.name : 'No class';
}

window.addEventListener('load', () => {
  const today = new Date().toISOString().split('T')[0];
  const dateField = document.getElementById('grade-date');
  if (dateField) dateField.value = today;
});

window.addEventListener('storage', () => {
  data = loadData();
  renderAll();
});

// Synchronize class selectors when grade class changes.
const gradeClassSelect = document.getElementById('grade-class');
gradeClassSelect.addEventListener('change', () => {
  renderGradeStudentOptions();
  renderGradeLessonOptions();
});
