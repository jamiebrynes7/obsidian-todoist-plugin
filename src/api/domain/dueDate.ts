import moment from "moment";

export type DueDate = {
    recurring: boolean,
    date: string,
    datetime?: string,
};

export type DueDateInfo = {
    hasDate: boolean,
    hasTime: boolean,

    isOverdue: boolean,
    isToday: boolean,

    m?: moment.Moment,
}

export function getDueDateInfo(dueDate: DueDate | undefined): DueDateInfo {
    if (dueDate === undefined) {
        return {
            hasDate: false,
            hasTime: false,

            isOverdue: false,
            isToday: false,
        };
    }

    const hasTime = dueDate.datetime !== undefined;
    const date = moment(dueDate.datetime ?? dueDate.date);

    const isToday = date.isSame(new Date(), "day");
    const isOverdue = hasTime ? date.isBefore() : date.clone().add(1, "day").isBefore()

    return {
        hasDate: true,
        hasTime: hasTime,
        isToday: isToday,
        isOverdue: isOverdue,
        m: date,
    };
}
