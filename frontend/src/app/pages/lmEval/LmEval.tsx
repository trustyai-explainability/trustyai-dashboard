import * as React from 'react';
import { PageSection, Title } from '@patternfly/react-core';

const LmEval: React.FunctionComponent = () => (
  <PageSection hasBodyWrapper={false} data-testid="lm-eval-page">
    <Title headingLevel="h1" size="lg" data-testid="lm-eval-title">
      Model Evaluation Page Title!
    </Title>
  </PageSection>
);

export { LmEval };
