import classNames from "classnames";
import { setIcon } from "obsidian";
import type React from "react";
import { useEffect } from "react";
import { useRef } from "react";
import "./styles.scss";

type Props = {
  size: "xs" | "s" | "m" | "l" | "xl";
  id: string;
  className?: string;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "size" | "id" | "className">;

export const ObsidianIcon: React.FC<Props> = ({ size, id, className, ...rest }) => {
  const div = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (div.current === null) {
      return;
    }

    setIcon(div.current, id);
  }, [id]);

  return (
    <div
      className={classNames("obsidian-icon", className)}
      data-icon-size={size}
      ref={div}
      {...rest}
    />
  );
};
