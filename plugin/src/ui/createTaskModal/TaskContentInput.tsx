import classNames from "classnames";
import type React from "react";
import { TextField } from "react-aria-components";
import TextareaAutosize from "react-textarea-autosize";

type Props = {
  className: string;
  placeholder: string;
  content: string;
  onChange: (content: string) => void;
  autofocus?: boolean;
  onEnterKey?: () => Promise<void>;
};

export const TaskContentInput: React.FC<Props> = ({
  className,
  placeholder,
  content,
  onChange,
  onEnterKey,
  autofocus,
}) => {
  const onInputChange = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(ev.target.value);
  };

  const onKeyDown = async (ev: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (onEnterKey === undefined) {
      return;
    }

    if (ev.key === "Enter") {
      ev.preventDefault();
      await onEnterKey();
    }
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
        onKeyDown={onKeyDown}
      />
    </TextField>
  );
};
