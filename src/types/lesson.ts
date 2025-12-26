export interface SavedLesson {
  id: string;
  subject: string;
  classLevel: string;
  country: string;
  topic: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const LESSONS_STORAGE_KEY = "teachers_aid_lessons";

export const saveLessonToStorage = (lesson: SavedLesson): void => {
  const lessons = getLessonsFromStorage();
  const existingIndex = lessons.findIndex(l => l.id === lesson.id);
  
  if (existingIndex >= 0) {
    lessons[existingIndex] = { ...lesson, updatedAt: new Date().toISOString() };
  } else {
    lessons.unshift(lesson);
  }
  
  localStorage.setItem(LESSONS_STORAGE_KEY, JSON.stringify(lessons));
};

export const getLessonsFromStorage = (): SavedLesson[] => {
  const stored = localStorage.getItem(LESSONS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const deleteLessonFromStorage = (id: string): void => {
  const lessons = getLessonsFromStorage().filter(l => l.id !== id);
  localStorage.setItem(LESSONS_STORAGE_KEY, JSON.stringify(lessons));
};

export const getLessonById = (id: string): SavedLesson | undefined => {
  return getLessonsFromStorage().find(l => l.id === id);
};
