import {
  CalendarDate,
  DateFormatter,
  endOfWeek,
  getLocalTimeZone,
  isToday,
  today,
} from "@internationalized/date";
import React from "react";
import {
  Button,
  Calendar,
  CalendarCell,
  CalendarGrid,
  Dialog,
  DialogTrigger,
  Heading,
  type Key,
  Menu,
  MenuItem,
  Section,
} from "react-aria-components";
import { ObsidianIcon } from "../components/obsidian-icon";
import { Popover } from "./Popover";

// TODO: Locale handling everywhere
const formatter = new DateFormatter("en-US", {
  month: "short",
  day: "numeric",
});

const weekdayFormatter = new DateFormatter("en-US", {
  weekday: "short",
});

type Props = {
  selected: CalendarDate | undefined;
  setSelected: (selected: CalendarDate | undefined) => void;
};

export const DueDateSelector: React.FC<Props> = ({ selected, setSelected }) => {
  const label = getLabel(selected);
  const suggestions = getSuggestions();

  const onSelected = (key: Key) => {
    const selected = suggestions.find((s) => s.id === key);
    if (selected === undefined) {
      return;
    }

    setSelected(selected.target);
  };

  return (
    <DialogTrigger>
      <Button className="due-date-selector" aria-label="Set due Date">
        <ObsidianIcon size={16} id="calendar" />
        {label}
      </Button>
      <Popover>
        <Dialog className="task-option-dialog task-date-menu" aria-label="Due date selector">
          {({ close }) => (
            <>
              <Menu
                onAction={(key: Key) => {
                  onSelected(key);
                  close();
                }}
                aria-label="Due date suggestions"
              >
                <Section>
                  {suggestions.map((props) => (
                    <DateSuggestion {...props} />
                  ))}
                </Section>
              </Menu>
              <hr />
              <Calendar
                aria-label="Task date"
                className="date-picker"
                value={selected ?? null}
                onChange={(date) => {
                  setSelected(date);
                  close();
                }}
                minValue={today(getLocalTimeZone())}
              >
                <header>
                  <Heading level={4} />
                  <div className="date-picker-controls">
                    <Button slot="previous">◀</Button>
                    <Button slot="next">▶</Button>
                  </div>
                </header>
                <CalendarGrid>{(date) => <CalendarCell date={date} />}</CalendarGrid>
              </Calendar>
            </>
          )}
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
};

const getLabel = (selected: CalendarDate | undefined) => {
  if (selected === undefined) {
    return "Due date";
  }

  if (isToday(selected, getLocalTimeZone())) {
    return "Today";
  }

  if (today(getLocalTimeZone()).add({ days: 1 }).compare(selected) === 0) {
    return "Tomorrow";
  }

  return formatter.format(selected.toDate(getLocalTimeZone()));
};

type DateSuggestionProps = {
  id: string;
  icon: string;
  label: string;
  target: CalendarDate | undefined;
};

const DateSuggestion: React.FC<DateSuggestionProps> = ({ id, icon, label, target }) => {
  const dayOfWeek =
    target !== undefined ? weekdayFormatter.format(target.toDate(getLocalTimeZone())) : "";

  return (
    <MenuItem id={id} aria-label={label}>
      <div className="date-suggestion-elem">
        <div className="date-suggestion-label">
          <ObsidianIcon id={icon} size={12} />
          {label}
        </div>
        <div className="date-suggestion-day">{dayOfWeek}</div>
      </div>
    </MenuItem>
  );
};

const getSuggestions = (): DateSuggestionProps[] => {
  const startOfNextWeek = endOfWeek(today(getLocalTimeZone()), "en-US").add({ days: 1 });
  const suggestions = [
    {
      id: "today",
      icon: "calendar",
      label: "Today",
      target: today(getLocalTimeZone()),
    },
    {
      id: "tomorrow",
      icon: "sun",
      label: "Tomorrow",
      target: today(getLocalTimeZone()).add({ days: 1 }),
    },
    {
      id: "next-week",
      icon: "calendar-clock",
      label: "Next week",
      target: startOfNextWeek,
    },
    {
      id: "no-date",
      icon: "ban",
      label: "No date",
      target: undefined,
    },
  ];

  return suggestions;
};
