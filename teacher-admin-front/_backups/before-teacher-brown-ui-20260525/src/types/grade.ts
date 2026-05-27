export interface GradeItem {
  id: number;
  studentId: number;
  subjectId: number;
  subjectName?: string;
  semester: string;
  rawScore: number;
  totalScore: number;
  average: number;
  letterGrade: string;
}