import classNames from "classnames";
import React from "react";
import { TextArea, TextField } from "react-aria-components";
import TextareaAutosize from "react-textarea-autosize";

type Props = {
  className: string;
  placeholder: string;
  content: string;
  onChange: (content: string) => void;
  autofocus?: boolean;
};

export const TaskContentInput: React.FC<Props> = ({
  className,
  placeholder,
  content,
  onChange,
  autofocus,
}) => {
  const onInputChange = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(ev.target.value);
  };

  const classes = classNames("task-content-input", className);
  return (
    <TextField className={classes} aria-label={placeholder}>
      <TextareaAutosize
        className={classes}
        placeholder={placeholder}
        value={content}
        onChange={onInputChange}
        aria-label={placeholder}
        autoFocus={autofocus}
      />
    </TextField>
  );
};
