export interface Profile {
  id: string;
  created: string;
  updated: string;
  name: string;
  title: string;
  city: string;
  email: string;
  phone: string;
  expectSalary: string;
  yearsOfExperience: number;
  skills: string[];
  workExperience?: string;
  projects?: string;
  education?: string;
}