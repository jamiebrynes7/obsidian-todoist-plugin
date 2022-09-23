export interface LabelOption {
  value: string;
  label: string;
}

export interface ProjectOrSectionRef {
  id: string;
  type: "Project" | "Section";
}

export interface ProjectOption {
  value: ProjectOrSectionRef;
  label: string;
}
