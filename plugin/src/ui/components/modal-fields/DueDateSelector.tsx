import {
  CalendarDate,
  DateFormatter,
  Time,
  endOfWeek,
  getLocalTimeZone,
  isToday,
  toCalendarDateTime,
  today,
} from "@internationalized/date";
import React, { useState } from "react";
import {
  Button,
  Calendar,
  CalendarCell,
  CalendarGrid,
  DateInput,
  DateSegment,
  Dialog,
  DialogTrigger,
  Heading,
  type Key,
  Label,
  Menu,
  MenuItem,
  Section,
  TimeField,
} from "react-aria-components";
import { ObsidianIcon } from "../obsidian-icon";
import { Popover } from "./Popover";

const formatter = new DateFormatter("en-US", {
  month: "short",
  day: "numeric",
});

const timeFormatter = new DateFormatter("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

const weekdayFormatter = new DateFormatter("en-US", {
  weekday: "short",
});

export type DueDate = {
  date: CalendarDate;
  time: Time | undefined;
};

type Props = {
  selected: DueDate | undefined;
  setSelected: (selected: DueDate | undefined) => void;
};

export const DueDateSelector: React.FC<Props> = ({ selected, setSelected }) => {
  const label = getLabel(selected);
  const suggestions = getSuggestions();

  const selectDate = (date: CalendarDate) => {
    if (selected === undefined) {
      setSelected({ date, time: undefined });
    } else {
      setSelected({ date, time: selected.time });
    }
  };

  const selectedDateSuggestion = (key: Key) => {
    const suggestion = suggestions.find((s) => s.id === key);
    if (suggestion === undefined) {
      return;
    }

    if (suggestion.target === undefined) {
      setSelected(undefined);
    } else {
      setSelected({ date: suggestion.target, time: selected?.time });
    }
  };

  const setTime = (time: Time | undefined) => {
    if (selected === undefined) {
      if (time !== undefined) {
        setSelected({
          date: today(getLocalTimeZone()),
          time,
        });
      }
    } else {
      setSelected({
        date: selected.date,
        time,
      });
    }
  };

  return (
    <DialogTrigger>
      <Button className="due-date-selector" aria-label="Set due Date">
        <ObsidianIcon size={16} id="calendar" />
        {label}
      </Button>
      <Popover maxHeight={600}>
        <Dialog className="task-option-dialog task-date-menu" aria-label="Due date selector">
          {({ close }) => (
            <>
              <Menu
                onAction={(key: Key) => {
                  selectedDateSuggestion(key);
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
                value={selected?.date ?? null}
                onChange={(date) => {
                  selectDate(date);
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
              <hr />
              <DialogTrigger>
                <div className="time-picker-container">
                  <Button className="time-picker-button">
                    <ObsidianIcon size={10} id="clock" />
                    Time
                  </Button>
                </div>
                <Popover defaultPlacement="top">
                  <TimeDialog
                    selectedTime={selected?.time}
                    setTime={(time) => {
                      close();
                      setTime(time);
                    }}
                  />
                </Popover>
              </DialogTrigger>
            </>
          )}
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
};

const getLabel = (selected: DueDate | undefined) => {
  if (selected === undefined) {
    return "Due date";
  }

  const date = selected.date;
  const dayPart = (() => {
    if (isToday(date, getLocalTimeZone())) {
      return "Today";
    }

    if (today(getLocalTimeZone()).add({ days: 1 }).compare(date) === 0) {
      return "Tomorrow";
    }

    return formatter.format(date.toDate(getLocalTimeZone()));
  })();

  const time = selected.time;
  const timePart = (() => {
    if (time === undefined) {
      return "";
    }

    return timeFormatter.format(
      toCalendarDateTime(today(getLocalTimeZone()), time).toDate(getLocalTimeZone()),
    );
  })();

  return [dayPart, timePart].join(" ").trimEnd();
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

type TimeDialogProps = {
  selectedTime: Time | undefined;
  setTime: (time: Time | undefined) => void;
};

const TimeDialog: React.FC<TimeDialogProps> = ({ selectedTime, setTime }) => {
  const [taskTime, setTaskTime] = useState(selectedTime);

  return (
    <Dialog className="task-option-dialog task-time-menu" aria-label="Time selector">
      {({ close }) => (
        <>
          <TimeField className="task-time-picker" value={taskTime ?? null} onChange={setTaskTime}>
            <Label className="task-time-picker-label">Time</Label>
            <DateInput className="task-time-picker-input">
              {(segment) => (
                <DateSegment className="task-time-picker-input-segment" segment={segment} />
              )}
            </DateInput>
          </TimeField>
          <div className="task-time-controls">
            <Button onPress={close}>Cancel</Button>
            <Button
              className="mod-cta"
              onPress={() => {
                close();
                setTime(taskTime);
              }}
            >
              Save
            </Button>
          </div>
        </>
      )}
    </Dialog>
  );
};
