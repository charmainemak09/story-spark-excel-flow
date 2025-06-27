
export interface AcceptanceCriteria {
  id: string;
  given: string;
  when: string;
  then: string;
}

export interface UserStory {
  id: string;
  user: string;
  action: string;
  result: string;
  acceptanceCriteria: AcceptanceCriteria[];
}

export interface Epic {
  id: string;
  title: string;
  userStories: UserStory[];
}

export interface Theme {
  id: string;
  title: string;
  description: string;
  epics: Epic[];
  createdAt?: string;
  dueDate?: string;
}
