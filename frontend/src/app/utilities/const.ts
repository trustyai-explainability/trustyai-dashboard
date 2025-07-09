import { WatchK8sResult } from '~/app/types';

export const DEFAULT_LIST_WATCH_RESULT: WatchK8sResult<never | never[]> = [[], false, undefined];
