export interface Task {
  id: string;
  question: string;
}

export interface Answer {
  id:string;
  answer: string;
}

export interface GeneratedQuestion {
  scenario: string;
  tasks: Task[];
  answers: Answer[];
  imageUrl?: string;
}

export interface Token {
  id: string;
  limit: number;
  used: number;
}
