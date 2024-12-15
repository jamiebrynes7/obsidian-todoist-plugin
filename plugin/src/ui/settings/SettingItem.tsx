import { t } from "@/i18n";
import classNames from "classnames";
import type { OptionHTMLAttributes, PropsWithChildren } from "react";
import type React from "react";
import { useState } from "react";
import { ObsidianIcon } from "../components/obsidian-icon";

type RootProps = {
  name: string;
  description: string;
  deprecationMessage?: string;
};

const Root: React.FC<PropsWithChildren<RootProps>> = ({
  children,
  name,
  description,
  deprecationMessage,
}) => {
  const renderDeprecationNotice = deprecationMessage !== undefined;
  return (
    <div className="setting-item">
      <div className="setting-item-info">
        <div className="setting-item-name">{name}</div>
        <div className="setting-item-description">
          {description}
          {renderDeprecationNotice && <DeprecationNotice message={deprecationMessage} />}
        </div>
      </div>
      <div className="setting-item-control">{children}</div>
    </div>
  );
};

type DeprecationNoticeProps = {
  message: string;
};

const DeprecationNotice: React.FC<DeprecationNoticeProps> = ({ message }) => {
  const prefix = t().settings.deprecation.warningMessage;
  return (
    <div className="setting-item-deprecation-notice">
      <ObsidianIcon size="l" id="lucide-alert-triangle" />
      <div className="setting-item-deprecation-notice-message">
        {prefix} {message}
      </div>
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
      {icon !== undefined && <ObsidianIcon size="l" id={icon} className="setting-button-icon" />}
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

type DropdownOptionValue = OptionHTMLAttributes<HTMLOptionElement>["value"];

type DropdownControlProps<T extends DropdownOptionValue> = {
  value: T;
  options: { label: string; value: T }[];
  onClick: (val: T) => Promise<void>;
};

const DropdownControl = <T extends DropdownOptionValue>({
  value,
  options,
  onClick,
}: DropdownControlProps<T>): React.ReactNode => {
  const [selected, setSelected] = useState(value);

  const onChange = async (ev: React.ChangeEvent<HTMLSelectElement>) => {
    const val = ev.target.value as T;
    setSelected(val);
    await onClick(val);
  };

  return (
    <select className="dropdown" value={selected} onChange={onChange}>
      {options.map(({ label, value }) => (
        <option key={label} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
};

export const Setting = {
  Root: Root,
  ButtonControl: ButtonControl,
  ToggleControl: ToggleControl,
  DropdownControl: DropdownControl,
};
