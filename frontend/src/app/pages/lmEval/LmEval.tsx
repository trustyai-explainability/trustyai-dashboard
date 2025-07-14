import {
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import ApplicationsPage from 'mod-arch-shared/dist/components/ApplicationsPage';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectSelectorNavigator from '~/app/concepts/projects/ProjectSelectorNavigator';
import { LMEvalContext } from '~/app/context/LMEvalContext';
import LMEvalListView from '~/app/pages/lmEvalList/LMEvalListView';
import EvaluateModelButton from './components/EvaluateModelButton';
import EvaluationTitleIcon from './components/EvaluationTitleIcon';
import LMEvalLoading from './components/LMEvalLoading';

const title = 'Model evaluation runs';
const description =
  'Select a project to view its model evaluation runs, or start a new evaluation run. Evaluation runs help determine a model’s performance by testing it against selected evaluation benchmarks called tasks.';

const LMEval = (): React.ReactElement => {
  const navigate = useNavigate();
  const { lmEval, project, preferredProject, projects } = React.useContext(LMEvalContext);
  const [lmEvalData, lmEvalLoaded, lmEvalLoadError] = lmEval;

  const emptyState = (
    <EmptyState
      headingLevel="h6"
      icon={SearchIcon}
      titleText="No model evaluation runs"
      variant={EmptyStateVariant.lg}
      data-testid="empty-state-title"
    >
      <EmptyStateBody data-testid="empty-state-body">
        No evaluation runs have been started for models in this project. Start a new evaluation run,
        or select a different project.
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <EvaluateModelButton />
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );

  return (
    <ApplicationsPage
      empty={lmEvalData.length === 0}
      emptyStatePage={emptyState}
      title={<EvaluationTitleIcon title={title} />}
      description={description}
      loadError={lmEvalLoadError}
      loaded={lmEvalLoaded}
      headerContent={
        <ProjectSelectorNavigator getRedirectPath={(ns: string) => `/modelEvaluations/${ns}`} />
      }
      provideChildrenPadding
      loadingContent={
        project ? undefined : (
          <LMEvalLoading
            title="Loading"
            description="Retrieving model evaluations from all projects in the cluster. This can take a few minutes."
            onCancel={() => {
              const redirectProject = preferredProject ?? projects?.[0];
              if (redirectProject) {
                navigate(`/modelEvaluations/${redirectProject.metadata.name}`);
              }
            }}
          />
        )
      }
    >
      <LMEvalListView lmEval={lmEvalData} />
    </ApplicationsPage>
  );
};

export default LMEval;
