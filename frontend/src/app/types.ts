import { K8sResourceCommon } from 'mod-arch-shared/dist/types';

export declare type WatchK8sResult<R extends K8sResourceCommon | K8sResourceCommon[]> = [
  data: R,
  loaded: boolean,
  loadError: unknown,
];

export type CustomWatchK8sResult<R extends K8sResourceCommon | K8sResourceCommon[]> = [
  data: WatchK8sResult<R>[0],
  loaded: WatchK8sResult<R>[1],
  loadError: Error | undefined,
];

export declare type K8sResourceListResult<TResource extends K8sResourceCommon> = {
  apiVersion: string;
  items: TResource[];
  metadata: {
    resourceVersion: string;
    continue: string;
  };
};

export type DisplayNameAnnotations = Partial<{
  'openshift.io/description': string; // the description provided by the user
  'openshift.io/display-name': string; // the name provided by the user
}>;

export type DashboardLabels = {
  'opendatahub.io/dashboard': 'true';
};

export type ProjectKind = K8sResourceCommon & {
  metadata: {
    annotations?: DisplayNameAnnotations &
      Partial<{
        'openshift.io/requester': string; // the username of the user that requested this project
      }>;
    labels?: Partial<DashboardLabels>;
    name: string;
  };
  status?: {
    phase: 'Active' | 'Terminating';
  };
};

export type K8sDSGResource = K8sResourceCommon & {
  metadata: {
    annotations?: DisplayNameAnnotations &
      Partial<{
        'opendatahub.io/recommended-accelerators': string;
      }>;
    name: string;
  };
};

export type LMEvalKind = K8sResourceCommon & {
  metadata: {
    annotations?: Partial<{
      'opendatahub.io/display-name': string;
    }>;
    name: string;
    namespace: string;
  };
  spec: {
    allowCodeExecution?: boolean;
    allowOnline?: boolean;
    batchSize?: string;
    logSamples?: boolean;
    model: string;
    modelArgs?: { name: string; value: string }[];
    timeout?: number;
    taskList: {
      taskNames: string[];
    };
  };
  status?: {
    completeTime?: string;
    lastScheduleTime?: string;
    message?: string;
    podName?: string;
    reason?: string;
    results?: string;
    state?: string;
    progressBars?: {
      count: string;
      elapsedTime: string;
      message: string;
      percent: string;
      remainingTimeEstimate: string;
    }[];
  };
};

export enum IconSize {
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
  XL = 'xl',
  XXL = 'xxl',
}
