import classNames from "classnames";
import { setIcon } from "obsidian";
import type React from "react";
import { useEffect } from "react";
import { useRef } from "react";
import "./styles.scss";

type Props = {
  size: number;
  id: string;
  className?: string;
};

export const ObsidianIcon: React.FC<Props> = ({ size, id, className }) => {
  const div = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (div.current === null) {
      return;
    }

    setIcon(div.current, id, size);
  }, [id, size]);

  return <div className={classNames("obsidian-icon", className)} ref={div} />;
};
