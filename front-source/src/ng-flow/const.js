export const MAX_SPEECH_NODE = 5;
export const MIN_SPEECH_NODE = 1;

export const STATUS_NORMAL= '正常';
export const STATUS_SILENT = '静默';
export const STATUS_EXCEPTION = '异常';
export const STATUS_REPEAT = '复述';

export const STATUS_LIST = [STATUS_NORMAL, STATUS_SILENT, STATUS_EXCEPTION, STATUS_REPEAT];

export const STATUS_NORMAL_ENGLISH = 'main';
export const STATUS_SILENT_ENGLISH = 'quiet';
export const STATUS_EXCEPTION_ENGLISH = 'exception';
export const STATUS_REPEAT_ENGLISH = 'retell';

export const ENGLISH_STATUS_LIST = {
    [STATUS_NORMAL_ENGLISH]: STATUS_NORMAL,
    [STATUS_SILENT_ENGLISH]: STATUS_SILENT,
    [STATUS_EXCEPTION_ENGLISH]: STATUS_EXCEPTION,
    [STATUS_REPEAT_ENGLISH]: STATUS_REPEAT,
};
