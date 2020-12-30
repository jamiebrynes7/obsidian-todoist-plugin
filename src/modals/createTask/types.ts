export interface LabelOption {
  value: number;
  label: string;
}

export interface ProjectOrSectionRef {
  id: number;
  type: "Project" | "Section";
}

export interface ProjectOption {
  value: ProjectOrSectionRef;
  label: string;
}
