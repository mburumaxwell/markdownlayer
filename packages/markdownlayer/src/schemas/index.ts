import { z } from 'zod';
import { type IsoDateParams, isodate } from './isodate';

const mod = {
  ...z,
  isodate,

  coerce: {
    ...z.coerce,
    isodate: (params?: IsoDateParams) => isodate({ coerce: true, ...params }),
  },
};

export { mod as z };
