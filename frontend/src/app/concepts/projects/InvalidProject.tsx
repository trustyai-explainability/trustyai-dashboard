import React from 'react';
import EmptyStateErrorMessage from 'mod-arch-shared/dist/components/EmptyStateErrorMessage';
import ProjectSelectorNavigator from './ProjectSelectorNavigator';

type InvalidProjectProps = {
  title?: string;
  namespace?: string;
  getRedirectPath: (namespace: string) => string;
};

const InvalidProject: React.FC<InvalidProjectProps> = ({ namespace, title, getRedirectPath }) => (
  <EmptyStateErrorMessage
    title={title || 'Project not found'}
    bodyText={`${namespace ? `Project ${namespace}` : 'The Project'} was not found.`}
  >
    <ProjectSelectorNavigator
      getRedirectPath={getRedirectPath}
      invalidDropdownPlaceholder="Select project"
      primary
    />
  </EmptyStateErrorMessage>
);

export default InvalidProject;
