import * as React from 'react';
import { PageSection, Title } from '@patternfly/react-core';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';

const Settings: React.FunctionComponent = () => {
  useDocumentTitle('Settings');
  return (
    <PageSection hasBodyWrapper={false}>
      <Title headingLevel="h1" size="lg">
        Settings Page Title
      </Title>
    </PageSection>
  );
};

export { Settings };
