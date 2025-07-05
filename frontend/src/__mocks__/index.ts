import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

type MockProjectParams = {
  displayName?: string;
  k8sName?: string;
  description?: string;
};

export const mockProjectK8sResource = ({
  displayName = '',
  k8sName = '',
  description = '',
}: MockProjectParams = {}): K8sResourceCommon => ({
  apiVersion: 'v1',
  kind: 'Project',
  metadata: {
    name: k8sName,
    annotations: {
      'openshift.io/display-name': displayName,
      'openshift.io/description': description,
    },
  },
});

export { mockK8sNameDescriptionFieldData } from './mockK8sNameDescriptionFieldData';
