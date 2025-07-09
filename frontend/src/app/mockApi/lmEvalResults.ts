import { LMEvalKind } from '~/concepts/k8s/utils';

export const mockLMEvalResults: LMEvalKind[] = [
  {
    apiVersion: 'trustyai.opendatahub.io/v1alpha1',
    kind: 'LMEval',
    metadata: {
      name: 'llama-eval-test',
      namespace: 'default',
      annotations: {
        'opendatahub.io/display-name': 'Llama Model Evaluation Test',
      },
      resourceVersion: '1',
      uid: 'abc123-def456-ghi789',
      creationTimestamp: '2024-01-15T10:00:00Z',
    },
    spec: {
      allowCodeExecution: false,
      allowOnline: true,
      batchSize: '8',
      logSamples: true,
      model: 'llama2-7b-chat',
      modelArgs: [
        { name: 'temperature', value: '0.7' },
        { name: 'max_tokens', value: '512' },
        { name: 'top_p', value: '0.9' },
      ],
      timeout: 3600,
      taskList: {
        taskNames: ['hellaswag', 'arc_easy', 'truthfulqa'],
      },
    },
    status: {
      completeTime: '2024-01-15T11:30:00Z',
      lastScheduleTime: '2024-01-15T10:00:00Z',
      message: 'Evaluation completed successfully',
      podName: 'llama-eval-test-pod-xyz789',
      reason: 'Completed',
      state: 'Complete',
      results: JSON.stringify({
        results: {
          hellaswag: {
            alias: 'hellaswag',
            'acc,none': 0.847,
            'acc_stderr,none': 0.003,
            'acc_norm,none': 0.851,
            'acc_norm_stderr,none': 0.003,
          },
          arc_easy: {
            alias: 'arc_easy',
            'acc,none': 0.823,
            'acc_stderr,none': 0.008,
            'acc_norm,none': 0.819,
            'acc_norm_stderr,none': 0.008,
          },
          truthfulqa: {
            alias: 'truthfulqa',
            'mc1,none': 0.412,
            'mc1_stderr,none': 0.017,
            'mc2,none': 0.589,
            'mc2_stderr,none': 0.016,
          },
        },
      }),
      progressBars: [
        {
          count: '100/100',
          elapsedTime: '01:30:00',
          message: 'Evaluation completed',
          percent: '100%',
          remainingTimeEstimate: '00:00:00',
        },
      ],
    },
  },
  {
    apiVersion: 'trustyai.opendatahub.io/v1alpha1',
    kind: 'LMEval',
    metadata: {
      name: 'mistral-eval-benchmark',
      namespace: 'ml-workspace',
      annotations: {
        'opendatahub.io/display-name': 'Mistral 7B Benchmark Evaluation',
      },
      resourceVersion: '2',
      uid: 'def456-ghi789-jkl012',
      creationTimestamp: '2024-01-16T14:00:00Z',
    },
    spec: {
      allowCodeExecution: true,
      allowOnline: false,
      batchSize: '16',
      logSamples: false,
      model: 'mistral-7b-instruct',
      modelArgs: [
        { name: 'temperature', value: '0.1' },
        { name: 'max_tokens', value: '256' },
        { name: 'top_p', value: '0.95' },
      ],
      timeout: 7200,
      taskList: {
        taskNames: ['mmlu', 'gsm8k', 'humaneval'],
      },
    },
    status: {
      completeTime: undefined,
      lastScheduleTime: '2024-01-16T14:00:00Z',
      message: 'Evaluation in progress...',
      podName: 'mistral-eval-benchmark-pod-abc123',
      reason: 'Running',
      state: 'Running',
      results: JSON.stringify({
        results: {
          mmlu: {
            alias: 'mmlu',
            'acc,none': 0.673,
            'acc_stderr,none': 0.015,
          },
          gsm8k: {
            alias: 'gsm8k',
            'acc,none': 0.451,
            'acc_stderr,none': 0.014,
          },
        },
      }),
      progressBars: [
        {
          count: '47/100',
          elapsedTime: '00:45:30',
          message: 'Processing MMLU tasks',
          percent: '47%',
          remainingTimeEstimate: '00:52:30',
        },
      ],
    },
  },
  {
    apiVersion: 'trustyai.opendatahub.io/v1alpha1',
    kind: 'LMEval',
    metadata: {
      name: 'gpt-eval-failed',
      namespace: 'default',
      annotations: {
        'opendatahub.io/display-name': 'GPT Model Evaluation (Failed)',
      },
      resourceVersion: '3',
      uid: 'ghi789-jkl012-mno345',
      creationTimestamp: '2024-01-17T09:00:00Z',
    },
    spec: {
      allowCodeExecution: false,
      allowOnline: true,
      batchSize: '4',
      logSamples: true,
      model: 'gpt-3.5-turbo',
      modelArgs: [
        { name: 'temperature', value: '0.0' },
        { name: 'max_tokens', value: '1024' },
      ],
      timeout: 1800,
      taskList: {
        taskNames: ['winogrande', 'piqa'],
      },
    },
    status: {
      completeTime: '2024-01-17T09:45:00Z',
      lastScheduleTime: '2024-01-17T09:00:00Z',
      message: 'Evaluation failed: Model endpoint unreachable',
      podName: 'gpt-eval-failed-pod-def456',
      reason: 'Failed',
      state: 'Failed',
      results: undefined,
      progressBars: [
        {
          count: '0/100',
          elapsedTime: '00:45:00',
          message: 'Connection timeout',
          percent: '0%',
          remainingTimeEstimate: 'N/A',
        },
      ],
    },
  },
];
