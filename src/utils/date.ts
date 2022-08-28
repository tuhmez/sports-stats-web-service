import moment from 'moment';

export const validateDate = (date: string) => !date.includes('-') && moment(date, 'MM/DD/YYYY').isValid();