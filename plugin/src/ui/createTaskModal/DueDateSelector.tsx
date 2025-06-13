import type { DueDate as ApiDueDate } from "@/api/domain/dueDate";
import type { Duration as ApiDuration } from "@/api/domain/task";
import { DueDate as DataDueDate } from "@/data/dueDate";
import { t } from "@/i18n";
import { now, timezone } from "@/infra/time";
import { ObsidianIcon } from "@/ui/components/obsidian-icon";
import { Popover } from "@/ui/createTaskModal/Popover";
import {
  type CalendarDate,
  DateFormatter,
  Time,
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
  ListBox,
  ListBoxItem,
  Menu,
  MenuItem,
  Section,
  Select,
  SelectValue,
  TimeField,
} from "react-aria-components";

const weekdayFormatter = new DateFormatter("en-US", {
  weekday: "short",
});

export type DueDate = {
  date: CalendarDate;
  timeInfo:
    | {
        time: Time;
        duration: ApiDuration | undefined;
      }
    | undefined;
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
      setSelected({ date, timeInfo: undefined });
    } else {
      setSelected({ date, timeInfo: selected.timeInfo });
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
      setSelected({ date: suggestion.target, timeInfo: selected?.timeInfo });
    }
  };

  const setTimeInfo = (timeInfo: DueDate["timeInfo"]) => {
    if (selected === undefined) {
      if (timeInfo !== undefined) {
        setSelected({
          date: today(timezone()),
          timeInfo,
        });
      }
    } else {
      setSelected({
        date: selected.date,
        timeInfo,
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
                    <TimeDialog selectedTimeInfo={selected?.timeInfo} setTimeInfo={setTimeInfo} />
                  </Popover>
                </DialogTrigger>
                {selected?.timeInfo !== undefined && (
                  <Button
                    className="time-picker-clear-button"
                    onPress={() => setTimeInfo(undefined)}
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
      selected.timeInfo !== undefined
        ? toZoned(
            toCalendarDateTime(selected.date, selected.timeInfo.time),
            timezone(),
          ).toAbsoluteString()
        : undefined,
    isRecurring: false,
  };

  const dueDate = DataDueDate.parse(apiDueDate, selected?.timeInfo?.duration);

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
  selectedTimeInfo: DueDate["timeInfo"] | undefined;
  setTimeInfo: (timeInfo: DueDate["timeInfo"] | undefined) => void;
};

// We want enough options to get to 23h 45m.
const MAX_DURATION_SEGMENTS = (24 * 60 - 15) / 15;

const TimeDialog: React.FC<TimeDialogProps> = ({ selectedTimeInfo, setTimeInfo }) => {
  const i18n = t().createTaskModal.dateSelector.timeDialog;

  const durationOptions = [
    undefined,
    ...Array.from({ length: MAX_DURATION_SEGMENTS }, (_, i) => ({
      amount: (i + 1) * 15,
      unit: "minute" as const,
    })),
  ].map((option) => ({
    label: option === undefined ? i18n.noDuration : i18n.duration(option.amount),
    value: option,
  }));

  const initialDurationIndex = durationOptions.findIndex(
    (o) => o.value?.amount === selectedTimeInfo?.duration?.amount,
  );

  const [selectedDurationIndex, setSelectedDurationIndex] = useState<number>(
    initialDurationIndex === -1 ? 0 : initialDurationIndex,
  );
  const [taskTimeInfo, setTaskTimeInfo] = useState(selectedTimeInfo);

  const onDurationChange = (key: Key) => {
    const idx = Number(key);
    setSelectedDurationIndex(idx);

    const option = durationOptions[idx];
    if (taskTimeInfo?.time) {
      setTaskTimeInfo({
        time: taskTimeInfo.time,
        duration: option.value,
      });
    } else {
      setTaskTimeInfo({
        time: new Time(now().hour, now().minute, 0),
        duration: option.value,
      });
    }
  };

  return (
    <Dialog className="task-option-dialog task-time-menu" aria-label="Time selector">
      {({ close }) => (
        <>
          <TimeField
            className="task-time-picker"
            value={taskTimeInfo?.time ?? null}
            onChange={(time) => {
              setTaskTimeInfo({
                time,
                duration: taskTimeInfo?.duration,
              });
            }}
          >
            <Label className="task-time-picker-label">{i18n.timeLabel}</Label>
            <DateInput className="task-time-picker-input">
              {(segment) => (
                <DateSegment className="task-time-picker-input-segment" segment={segment} />
              )}
            </DateInput>
          </TimeField>
          <Select
            className="task-duration-select"
            selectedKey={selectedDurationIndex}
            onSelectionChange={onDurationChange}
          >
            <Label className="task-duration-picker-label">{i18n.durationLabel}</Label>
            <Button className="task-duration-button">
              <SelectValue />
            </Button>
            <Popover defaultPlacement="top" maxHeight={150}>
              <ListBox
                className="task-option-dialog task-duration-menu"
                aria-label={i18n.durationLabel}
              >
                {durationOptions.map((option, index) => (
                  <ListBoxItem
                    key={String(index)}
                    id={index}
                    className="duration-option"
                    textValue={option.label}
                  >
                    {option.label}
                  </ListBoxItem>
                ))}
              </ListBox>
            </Popover>
          </Select>
          <div className="task-time-controls">
            <Button onPress={close}>{i18n.cancelButtonLabel}</Button>
            <Button
              className="mod-cta"
              onPress={() => {
                close();
                setTimeInfo(taskTimeInfo);
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
