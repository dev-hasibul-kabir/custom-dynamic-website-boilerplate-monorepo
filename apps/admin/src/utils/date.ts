import moment from 'moment-timezone';

export const DATE_FORMAT = {
    DATETIME_GENERAL_TABLE: 'YYYY, MMMM Do, hh:mm:ss a',
    DATE_REPORT: 'DD-MMMM-YYYY',
    YEAR_MM: 'YYYY-MM',
    DATETIME_FILE_NAME: 'YYYY-MM-DD-HH-mm-ss',
    YEAR_MM_DD: 'YYYY-MM-DD',
    DATETIME_INPUT_HTML: 'YYYY-MM-DDTHH:mm:ss',
    DATETIME_SERVER: 'YYYY-MM-DDTHH:mm:ssZ',
};

export const getFormattedDatetime = (isoDatetime: string, format?: string) => {
    return moment(isoDatetime)
        .tz('Asia/Dhaka')
        .format(format ?? DATE_FORMAT.YEAR_MM_DD);
};

export const getCurrentDatetime = (format?: string) =>
    moment()
        .tz('Asia/Dhaka')
        .format(format ?? DATE_FORMAT.DATETIME_GENERAL_TABLE);

export const isDateExpired = (date: string) => {
    const dateToCompare = moment(date);
    const now = moment();

    if (now > dateToCompare) {
        return true;
    } else {
        return false;
    }
};

export const convertDateToIsoString = (date: Date): string => {
    const tempDate = moment(date).format(DATE_FORMAT.YEAR_MM_DD);

    console.debug({ tempDate });

    return new Date(tempDate).toISOString();
};

export const convertIsoStringToDate = (isoString: string): Date => {
    return moment(isoString, DATE_FORMAT.DATETIME_SERVER).tz('Asia/Dhaka').toDate();
};
