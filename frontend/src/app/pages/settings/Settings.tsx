import * as React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ProjectObjectType, TitleWithIcon, ApplicationsPage } from 'mod-arch-shared';
import {
  Divider,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

const Settings: React.FunctionComponent = () => (
  <ApplicationsPage
    title={
      <TitleWithIcon
        title="Model Registry Settings"
        objectType={ProjectObjectType.modelRegistrySettings}
      />
    }
    description={
      <Stack hasGutter>
        <StackItem>Manage model registry settings for all users in your organization.</StackItem>
        <StackItem>
          <Divider />
        </StackItem>
      </Stack>
    }
    loaded
    loadError={undefined}
    errorMessage="Unable to load model registries."
    empty={false}
    emptyStatePage={
      <EmptyState
        headingLevel="h5"
        icon={PlusCircleIcon}
        titleText="No model registries"
        variant={EmptyStateVariant.lg}
        data-testid="mr-settings-empty-state"
      >
        <EmptyStateBody>
          To get started, create a model registry. You can manage permissions after creation.
        </EmptyStateBody>
      </EmptyState>
    }
    provideChildrenPadding
  />
);

export { Settings };
