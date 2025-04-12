import type { DueDate as ApiDueDate } from "@/api/domain/dueDate";
import { DueDate as DataDueDate } from "@/data/dueDate";
import { t } from "@/i18n";
import { timezone } from "@/infra/time";
import { ObsidianIcon } from "@/ui/components/obsidian-icon";
import { Popover } from "@/ui/createTaskModal/Popover";
import {
  type CalendarDate,
  DateFormatter,
  type Time,
  endOfWeek,
  toCalendarDateTime,
  toZoned,
  today,
} from "@internationalized/date";
import type React from "react";
import { useState } from "react";
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
          date: today(timezone()),
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

  const i18n = t().createTaskModal.dateSelector;

  return (
    <DialogTrigger>
      <Button className="due-date-selector" aria-label={i18n.buttonLabel}>
        <ObsidianIcon size="s" id="calendar" />
        {label}
      </Button>
      <Popover maxHeight={600}>
        <Dialog className="task-option-dialog task-date-menu" aria-label={i18n.dialogLabel}>
          {({ close }) => (
            <>
              <Menu
                onAction={(key: Key) => {
                  selectedDateSuggestion(key);
                  close();
                }}
                aria-label={i18n.suggestionsLabel}
              >
                <Section>
                  {suggestions.map((props) => (
                    <DateSuggestion key={props.id} {...props} />
                  ))}
                </Section>
              </Menu>
              <hr />
              <Calendar
                aria-label={i18n.datePickerLabel}
                className="date-picker"
                value={selected?.date ?? null}
                onChange={(date) => {
                  selectDate(date);
                  close();
                }}
                minValue={today(timezone())}
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
              <div className="time-picker-container">
                <DialogTrigger>
                  <Button className="time-picker-button" aria-label="Set time">
                    <ObsidianIcon size="xs" id="clock" />
                    Time
                  </Button>
                  <Popover defaultPlacement="top">
                    <TimeDialog
                      selectedTime={selected?.time}
                      setTime={(time) => {
                        setTime(time);
                      }}
                    />
                  </Popover>
                </DialogTrigger>
                {selected?.time !== undefined && (
                  <Button
                    className="time-picker-clear-button"
                    onPress={() => setTime(undefined)}
                    aria-label="Clear time"
                  >
                    <ObsidianIcon size="xs" id="cross" />
                  </Button>
                )}
              </div>
            </>
          )}
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
};

const getLabel = (selected: DueDate | undefined) => {
  if (selected === undefined) {
    return t().createTaskModal.dateSelector.emptyDate;
  }

  const apiDueDate: ApiDueDate = {
    date: selected.date.toString(),
    datetime:
      selected.time !== undefined
        ? toZoned(toCalendarDateTime(selected.date, selected.time), timezone()).toAbsoluteString()
        : undefined,
    isRecurring: false,
  };

  const dueDate = DataDueDate.parse(apiDueDate);

  return DataDueDate.format(dueDate);
};

type DateSuggestionProps = {
  id: string;
  icon: string;
  label: string;
  target: CalendarDate | undefined;
};

const DateSuggestion: React.FC<DateSuggestionProps> = ({ id, icon, label, target }) => {
  const dayOfWeek = target !== undefined ? weekdayFormatter.format(target.toDate(timezone())) : "";

  return (
    <MenuItem id={id} aria-label={label}>
      <div className="date-suggestion-elem">
        <div className="date-suggestion-label">
          <ObsidianIcon id={icon} size="s" />
          {label}
        </div>
        <div className="date-suggestion-day">{dayOfWeek}</div>
      </div>
    </MenuItem>
  );
};

const getSuggestions = (): DateSuggestionProps[] => {
  const i18n = t().createTaskModal.dateSelector;

  const startOfNextWeek = endOfWeek(today(timezone()), "en-US").add({ days: 1 });
  const suggestions = [
    {
      id: "today",
      icon: "calendar",
      label: i18n.today,
      target: today(timezone()),
    },
    {
      id: "tomorrow",
      icon: "sun",
      label: i18n.tomorrow,
      target: today(timezone()).add({ days: 1 }),
    },
    {
      id: "next-week",
      icon: "calendar-clock",
      label: i18n.nextWeek,
      target: startOfNextWeek,
    },
    {
      id: "no-date",
      icon: "ban",
      label: i18n.noDate,
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
  const i18n = t().createTaskModal.dateSelector.timeDialog;

  return (
    <Dialog className="task-option-dialog task-time-menu" aria-label="Time selector">
      {({ close }) => (
        <>
          <TimeField className="task-time-picker" value={taskTime ?? null} onChange={setTaskTime}>
            <Label className="task-time-picker-label">{i18n.timeLabel}</Label>
            <DateInput className="task-time-picker-input">
              {(segment) => (
                <DateSegment className="task-time-picker-input-segment" segment={segment} />
              )}
            </DateInput>
          </TimeField>
          <div className="task-time-controls">
            <Button onPress={close}>{i18n.cancelButtonLabel}</Button>
            <Button
              className="mod-cta"
              onPress={() => {
                close();
                setTime(taskTime);
              }}
            >
              {i18n.saveButtonLabel}
            </Button>
          </div>
        </>
      )}
    </Dialog>
  );
};
