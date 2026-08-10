import { SetMetadata } from "@nestjs/common";

export const INTRAVAL_KEY = 'INTRAVAL_KEY';
export const Interval = (ms: number) => SetMetadata(INTRAVAL_KEY, ms);