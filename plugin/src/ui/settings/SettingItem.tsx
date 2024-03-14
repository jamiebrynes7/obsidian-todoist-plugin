import classNames from "classnames";
import type { PropsWithChildren } from "react";
import React, { useState } from "react";
import { ObsidianIcon } from "../components/obsidian-icon";

type RootProps = {
  name: string;
  description: string;
};

const Root: React.FC<PropsWithChildren<RootProps>> = ({ children, name, description }) => {
  return (
    <div className="setting-item">
      <div className="setting-item-info">
        <div className="setting-item-name">{name}</div>
        <div className="setting-item-description">{description}</div>
      </div>
      <div className="setting-item-control">{children}</div>
    </div>
  );
};

type ButtonProps = {
  label: string;
  icon?: string;
  onClick: () => void;
  disabled?: boolean;
};

const ButtonControl: React.FC<ButtonProps> = ({ label, icon, onClick, disabled }) => {
  return (
    <button className="mod-cta" onClick={onClick} type="button" disabled={disabled}>
      {icon !== undefined && <ObsidianIcon size={24} id={icon} className="setting-button-icon" />}
      {label}
    </button>
  );
};

type ToggleControl = {
  value: boolean;
  onClick: (val: boolean) => Promise<void>;
};

const ToggleControl: React.FC<ToggleControl> = ({ value, onClick }) => {
  const [isToggled, setIsToggled] = useState(value);

  const onToggle = async () => {
    const val = !isToggled;
    setIsToggled(val);
    await onClick(val);
  };

  const className = classNames("checkbox-container", { "is-enabled": isToggled });
  return <div className={className} onClick={onToggle} onKeyDown={onToggle} />;
};

export const Setting = {
  Root: Root,
  ButtonControl: ButtonControl,
  ToggleControl: ToggleControl,
};
