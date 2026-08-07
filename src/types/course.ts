export interface Course {
  id: string;
  code: string;
  title: string;
  instructorId: string;
  color: string;
  studentIds: string[];
}

/** Course dropdown ke liye chhota shape — list endpoint isi ko return kare to kaafi hai. */
export type CourseOption = Pick<Course, "id" | "code" | "title">;
