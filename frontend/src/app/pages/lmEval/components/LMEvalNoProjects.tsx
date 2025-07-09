import * as React from 'react';
import { Button, EmptyState, EmptyStateBody, EmptyStateFooter } from '@patternfly/react-core';
import { WrenchIcon } from '@patternfly/react-icons/dist/esm/icons/wrench-icon';

const LMEvalNoProjects: React.FC = () => (
  <EmptyState
    headingLevel="h4"
    icon={WrenchIcon}
    titleText="No data science projects"
    data-testid="empty-state-title"
  >
    <EmptyStateBody data-testid="empty-state-body">
      To view model evaluations, first create a data science project.
    </EmptyStateBody>
    <EmptyStateFooter>
      <Button
        onClick={() => {
          /* TODO: Route back to creating a project */
        }}
      >
        Create project
      </Button>
    </EmptyStateFooter>
  </EmptyState>
);

export default LMEvalNoProjects;
