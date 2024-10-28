import type React from "react";
import { type ChangeEvent, useState } from "react";
import { Input, TextField } from "react-aria-components";

type Props = {
  initialValue: number;
  onChange: (val: number) => Promise<void>;
};

// TODO: Add more validation and reporting to user
export const AutoRefreshIntervalControl: React.FC<Props> = ({ initialValue, onChange }) => {
  const [value, setValue] = useState(`${initialValue}`);

  const onInputChange = (ev: ChangeEvent<HTMLInputElement>) => {
    setValue(ev.target.value);
  };

  const onBlur = async () => {
    if (value.trim().length === 0) {
      return;
    }

    const num = Math.floor(Number(value));
    if (num < 0) {
      return;
    }

    await onChange(num);
  };

  return (
    <TextField aria-label="Auto-refresh interval">
      <Input value={value} onChange={onInputChange} type="number" onBlur={onBlur} />
    </TextField>
  );
};
