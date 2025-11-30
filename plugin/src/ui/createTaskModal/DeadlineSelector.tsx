import { type CalendarDate, DateFormatter, endOfWeek, today } from "@internationalized/date";
import type React from "react";
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

import type { Deadline as ApiDeadline } from "@/api/domain/task";
import { Deadline as DataDeadline } from "@/data/deadline";
import { t } from "@/i18n";
import { timezone } from "@/infra/time";
import { ObsidianIcon } from "@/ui/components/obsidian-icon";
import { Popover } from "@/ui/createTaskModal/Popover";

const weekdayFormatter = new DateFormatter("en-US", {
  weekday: "short",
});

export type Deadline = {
  date: CalendarDate;
};

type Props = {
  selected: Deadline | undefined;
  setSelected: (selected: Deadline | undefined) => void;
};

export const DeadlineSelector: React.FC<Props> = ({ selected, setSelected }) => {
  const label = getLabel(selected);
  const suggestions = getSuggestions();

  const selectDate = (date: CalendarDate) => {
    setSelected({
      date,
    });
  };

  const selectedDateSuggestion = (key: Key) => {
    const suggestion = suggestions.find((s) => s.id === key);
    if (suggestion === undefined) {
      return;
    }

    if (suggestion.target === undefined) {
      setSelected(undefined);
    } else {
      setSelected({
        date: suggestion.target,
      });
    }
  };

  const i18n = t().createTaskModal.deadlineSelector;

  return (
    <DialogTrigger>
      <Button className="deadline-selector" aria-label={i18n.buttonLabel}>
        <ObsidianIcon size="s" id="target" />
        <span>{label}</span>
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
            </>
          )}
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
};

const getLabel = (selected: Deadline | undefined) => {
  if (selected === undefined) {
    return t().createTaskModal.deadlineSelector.placeholder;
  }

  const apiDeadline: ApiDeadline = {
    date: selected.date.toString(),
  };

  const deadlineInfo = DataDeadline.parse(apiDeadline);

  return DataDeadline.format(deadlineInfo);
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
  const dateI18n = t().dates;
  const selectorI18n = t().createTaskModal.deadlineSelector;

  const startOfNextWeek = endOfWeek(today(timezone()), "en-US").add({
    days: 1,
  });
  const suggestions = [
    {
      id: "today",
      icon: "calendar",
      label: dateI18n.today,
      target: today(timezone()),
    },
    {
      id: "tomorrow",
      icon: "sun",
      label: dateI18n.tomorrow,
      target: today(timezone()).add({ days: 1 }),
    },
    {
      id: "next-week",
      icon: "calendar-clock",
      label: dateI18n.nextWeek,
      target: startOfNextWeek,
    },
    {
      id: "no-deadline",
      icon: "ban",
      label: selectorI18n.noDeadline,
      target: undefined,
    },
  ];

  return suggestions;
};
