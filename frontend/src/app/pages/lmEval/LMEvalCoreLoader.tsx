import ApplicationsPage from 'mod-arch-shared/dist/components/ApplicationsPage';
import * as React from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';
import { byName, ProjectsContext } from '~/app/context/ProjectsContext';
import InvalidProject from '~/app/concepts/projects/InvalidProject';
import ProjectSelectorNavigator from '~/app/concepts/projects/ProjectSelectorNavigator';
import { LMEvalContextProvider } from '~/app/context/LMEvalContext';
import LMEvalNoProjects from './components/LMEvalNoProjects';

type ApplicationPageProps = React.ComponentProps<typeof ApplicationsPage>;
type EmptyStateProps = 'emptyStatePage' | 'empty';

type LMEvalCoreLoaderProps = {
  getInvalidRedirectPath: (namespace: string) => string;
};

type ApplicationPageRenderState = Pick<ApplicationPageProps, EmptyStateProps>;

const LMEvalCoreLoader: React.FC<LMEvalCoreLoaderProps> = ({ getInvalidRedirectPath }) => {
  const { namespace } = useParams<{ namespace: string }>();
  const { projects, preferredProject } = React.useContext(ProjectsContext);
  let renderStateProps: ApplicationPageRenderState & { children?: React.ReactNode };
  if (projects.length === 0) {
    renderStateProps = {
      empty: true,
      emptyStatePage: <LMEvalNoProjects />,
    };
  } else if (namespace) {
    const foundProject = projects.find(byName(namespace));
    if (foundProject) {
      // Render the content
      return (
        <LMEvalContextProvider namespace={namespace}>
          <Outlet />
        </LMEvalContextProvider>
      );
    }

    // They ended up on a non-valid project path
    renderStateProps = {
      empty: true,
      emptyStatePage: (
        <InvalidProject namespace={namespace} getRedirectPath={getInvalidRedirectPath} />
      ),
    };
  } else {
    // Redirect the namespace suffix into the URL
    if (preferredProject) {
      return <Navigate to={getInvalidRedirectPath(preferredProject.metadata.name)} replace />;
    }
    // Go with All projects path
    return (
      <LMEvalContextProvider>
        <Outlet />
      </LMEvalContextProvider>
    );
  }

  return (
    <ApplicationsPage
      {...renderStateProps}
      title="Model evaluation runs"
      description="Select a project to view its model evaluation runs, or start a new evaluation run. Evaluation runs help determine a model’s performance by testing it against selected evaluation benchmarks called tasks."
      loaded
      headerContent={<ProjectSelectorNavigator getRedirectPath={getInvalidRedirectPath} />}
      provideChildrenPadding
    />
  );
};
export default LMEvalCoreLoader;
