export interface NoteFilter {
  title?: string;
  sortBy?: 'title' | 'createdAt' | 'updatedAt';
  sortOrder?: 'ASC' | 'DESC';
}
