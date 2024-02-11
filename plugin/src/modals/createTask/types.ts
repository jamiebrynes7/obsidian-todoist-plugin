export interface LabelOption {
  /** The label ID */
  value: string;
  /** The label name, what the user sees on screen */
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
