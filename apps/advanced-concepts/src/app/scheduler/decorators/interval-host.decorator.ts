import { SetMetadata } from "@nestjs/common";

export const INTRAVAL_HOST_KEY = 'INTRAVAL_HOST_KEY';
export const IntervalHost = () => SetMetadata(INTRAVAL_HOST_KEY, true);