import { K8sResourceListResult, ProjectKind } from '~/app/types';
import { genUID } from './mockUtils';

type MockResourceConfigType = {
  hasAnnotations?: boolean;
  username?: string;
  displayName?: string;
  description?: string;
  k8sName?: string;
  creationTimestamp?: string;
  enableModelMesh?: boolean;
  enableNIM?: boolean;
  isDSProject?: boolean;
  phase?: 'Active' | 'Terminating';
};

export const mockProjectK8sResource = ({
  hasAnnotations = true,
  username = 'test-user',
  displayName = 'Test Project',
  k8sName = 'test-project',
  creationTimestamp = '2023-02-14T21:43:59Z',
  enableModelMesh,
  enableNIM = false,
  description = '',
  isDSProject = true,
  phase = 'Active',
}: MockResourceConfigType): ProjectKind => ({
  kind: 'Project',
  apiVersion: 'project.openshift.io/v1',
  metadata: {
    name: k8sName,
    uid: genUID('project'),
    creationTimestamp,
    labels: {
      'kubernetes.io/metadata.name': k8sName,
      ...(enableModelMesh !== undefined && {
        'modelmesh-enabled': enableModelMesh ? 'true' : 'false',
      }),
      ...(isDSProject && { 'opendatahub.io/dashboard': 'true' }),
    },
    ...(hasAnnotations && {
      annotations: {
        ...(description && { 'openshift.io/description': description }),
        ...(displayName && { 'openshift.io/display-name': displayName }),
        ...(username && { 'openshift.io/requester': username }),
        ...(enableNIM && { 'opendatahub.io/nim-support': 'true' }),
      },
    }),
    resourceVersion: '1',
  },
  status: {
    phase,
  },
});

export const mockProjectsK8sList = (): K8sResourceListResult<ProjectKind> => ({
  apiVersion: 'project.openshift.io/v1',
  metadata: { continue: '', resourceVersion: '1462210' },
  items: [
    mockProjectK8sResource({
      k8sName: 'ds-project-1',
      displayName: 'Llama & Claude Evaluations',
      description: 'Project containing Llama and Claude model evaluation runs',
      isDSProject: true,
    }),
    mockProjectK8sResource({
      k8sName: 'ds-project-2',
      displayName: 'Mistral & Multilingual Models',
      description: 'Project for Mistral and multilingual model benchmarks',
      isDSProject: true,
    }),
    mockProjectK8sResource({
      k8sName: 'ds-project-3',
      displayName: 'GPT Model Comparisons',
      description: 'Project dedicated to GPT model comparison tests',
      isDSProject: true,
    }),
    mockProjectK8sResource({
      k8sName: 'non-ds-project-1',
      displayName: 'Non-DS Project 1',
      isDSProject: false,
    }),
    mockProjectK8sResource({
      k8sName: 'non-ds-project-2',
      displayName: 'Non-DS Project 2',
      isDSProject: false,
    }),
    mockProjectK8sResource({
      k8sName: 'non-ds-project-3',
      displayName: 'Non-DS Project 3',
      isDSProject: false,
    }),
  ],
});
