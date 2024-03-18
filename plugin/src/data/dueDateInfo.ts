import moment from "moment";
import type { DueDate } from "../api/domain/dueDate";
import { now } from "../now";

export class DueDateInfo {
  private m: moment.Moment | undefined;
  private isDateTime = false;

  constructor(dueDate: DueDate | undefined) {
    if (dueDate !== undefined) {
      this.m = moment(dueDate.datetime ?? dueDate.date);
      this.isDateTime = dueDate.datetime !== undefined;
    }
  }

  hasDueDate(): boolean {
    return this.m !== undefined;
  }

  hasTime(): boolean {
    return this.isDateTime;
  }

  isToday(): boolean {
    if (this.m === undefined) {
      return false;
    }

    return this.m.isSame(now(), "day");
  }

  isOverdue(): boolean {
    if (this.m === undefined) {
      return false;
    }

    if (this.isDateTime) {
      return this.m.isBefore(now());
    }

    return this.m.isBefore(now(), "day");
  }

  isTomorrow(): boolean {
    if (this.m === undefined) {
      return false;
    }

    return this.m.clone().add(-1, "day").isSame(now(), "day");
  }

  moment(): moment.Moment {
    if (this.m === undefined) {
      throw Error("Cannot get moment from an empty due date");
    }

    return this.m;
  }
}
