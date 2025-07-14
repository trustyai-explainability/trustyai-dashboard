import { LMEvalKind } from '~/concepts/k8s/utils';

export const mockLMEvalResults: LMEvalKind[] = [
  {
    apiVersion: 'trustyai.opendatahub.io/v1alpha1',
    kind: 'LMEval',
    metadata: {
      name: 'llama-eval-completed',
      namespace: 'ds-project-1',
      annotations: {
        'opendatahub.io/display-name': 'Llama Model Evaluation - Completed',
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
      podName: 'llama-eval-completed-pod-xyz789',
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
          // eslint-disable-next-line camelcase
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
    },
  },
  {
    apiVersion: 'trustyai.opendatahub.io/v1alpha1',
    kind: 'LMEval',
    metadata: {
      name: 'mistral-eval-running',
      namespace: 'ds-project-2',
      annotations: {
        'opendatahub.io/display-name': 'Mistral 7B Benchmark - In Progress',
      },
      resourceVersion: '2',
      uid: 'def456-ghi789-jkl012',
      creationTimestamp: '2024-01-16T14:00:00Z',
    },
    spec: {
      allowCodeExecution: true,
      allowOnline: false,
      batchSize: '16',
      model: 'mistral-7b-instruct',
      modelArgs: [{ name: 'temperature', value: '0.1' }],
      timeout: 7200,
      taskList: {
        taskNames: ['mmlu', 'gsm8k'],
      },
    },
    status: {
      lastScheduleTime: '2024-01-16T14:00:00Z',
      message: 'Evaluation in progress...',
      podName: 'mistral-eval-running-pod-abc123',
      reason: 'Running',
      state: 'Running',
      results: JSON.stringify({
        results: {
          mmlu: {
            alias: 'mmlu',
            'acc,none': 0.673,
            'acc_stderr,none': 0.015,
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
      name: 'gpt-comparison-test',
      namespace: 'ds-project-3',
      annotations: {
        'opendatahub.io/display-name': 'GPT Model Comparison Test',
      },
      resourceVersion: '3',
      uid: 'ghi789-jkl012-mno345',
      creationTimestamp: '2024-01-17T09:00:00Z',
    },
    spec: {
      allowCodeExecution: false,
      allowOnline: true,
      batchSize: '4',
      logSamples: false,
      model: 'gpt-3.5-turbo',
      modelArgs: [
        { name: 'temperature', value: '0.3' },
        { name: 'max_tokens', value: '256' },
      ],
      timeout: 1800,
      taskList: {
        taskNames: ['arc_challenge', 'winogrande'],
      },
    },
    status: {
      completeTime: '2024-01-17T10:15:00Z',
      lastScheduleTime: '2024-01-17T09:00:00Z',
      message: 'Evaluation completed successfully',
      podName: 'gpt-comparison-test-pod-def456',
      reason: 'Completed',
      state: 'Complete',
      results: JSON.stringify({
        results: {
          // eslint-disable-next-line camelcase
          arc_challenge: {
            alias: 'arc_challenge',
            'acc,none': 0.751,
            'acc_stderr,none': 0.012,
            'acc_norm,none': 0.768,
            'acc_norm_stderr,none': 0.011,
          },
          winogrande: {
            alias: 'winogrande',
            'acc,none': 0.692,
            'acc_stderr,none': 0.013,
          },
        },
      }),
    },
  },
  {
    apiVersion: 'trustyai.opendatahub.io/v1alpha1',
    kind: 'LMEval',
    metadata: {
      name: 'claude-benchmark-suite',
      namespace: 'ds-project-1',
      annotations: {
        'opendatahub.io/display-name': 'Claude Model Benchmark Suite',
      },
      resourceVersion: '4',
      uid: 'jkl012-mno345-pqr678',
      creationTimestamp: '2024-01-18T11:30:00Z',
    },
    spec: {
      allowCodeExecution: true,
      allowOnline: false,
      batchSize: '12',
      logSamples: true,
      model: 'claude-3-sonnet',
      modelArgs: [
        { name: 'temperature', value: '0.0' },
        { name: 'max_tokens', value: '1024' },
      ],
      timeout: 5400,
      taskList: {
        taskNames: ['humaneval', 'mbpp', 'math'],
      },
    },
    status: {
      completeTime: '2024-01-18T14:45:00Z',
      lastScheduleTime: '2024-01-18T11:30:00Z',
      message: 'Evaluation completed successfully',
      podName: 'claude-benchmark-suite-pod-ghi789',
      reason: 'Completed',
      state: 'Complete',
      results: JSON.stringify({
        results: {
          humaneval: {
            alias: 'humaneval',
            'pass@1,none': 0.854,
            'pass@1_stderr,none': 0.019,
            'pass@10,none': 0.942,
            'pass@10_stderr,none': 0.012,
          },
          mbpp: {
            alias: 'mbpp',
            'pass@1,none': 0.763,
            'pass@1_stderr,none': 0.027,
          },
          math: {
            alias: 'math',
            'exact_match,none': 0.428,
            'exact_match_stderr,none': 0.031,
          },
        },
      }),
    },
  },
  {
    apiVersion: 'trustyai.opendatahub.io/v1alpha1',
    kind: 'LMEval',
    metadata: {
      name: 'multilingual-eval-pending',
      namespace: 'ds-project-2',
      annotations: {
        'opendatahub.io/display-name': 'Multilingual Model Evaluation - Pending',
      },
      resourceVersion: '5',
      uid: 'mno345-pqr678-stu901',
      creationTimestamp: '2024-01-19T08:00:00Z',
    },
    spec: {
      allowCodeExecution: false,
      allowOnline: true,
      batchSize: '6',
      logSamples: false,
      model: 'multilingual-bert-large',
      modelArgs: [{ name: 'temperature', value: '0.5' }],
      timeout: 2700,
      taskList: {
        taskNames: ['xnli', 'paws_x'],
      },
    },
    status: {
      lastScheduleTime: '2024-01-19T08:00:00Z',
      message: 'Evaluation is queued and waiting to start',
      podName: '',
      reason: 'Pending',
      state: 'Pending',
    },
  },
];
