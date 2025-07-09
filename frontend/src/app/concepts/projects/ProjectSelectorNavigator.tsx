import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { byName, ProjectsContext } from '~/app/context/ProjectsContext';
import LMEvalProjectSelector from './ProjectSelector';

type ProjectSelectorNavigatorProps = {
  getRedirectPath: (namespace: string) => string;
} & Omit<React.ComponentProps<typeof LMEvalProjectSelector>, 'onSelection' | 'namespace'>;

const ProjectSelectorNavigator: React.FC<ProjectSelectorNavigatorProps> = ({ getRedirectPath }) => {
  const navigate = useNavigate();
  const { namespace } = useParams();
  const { projects, updatePreferredProject } = React.useContext(ProjectsContext);

  return (
    <LMEvalProjectSelector
      invalidDropdownPlaceholder="All projects"
      selectAllProjects
      showTitle
      onSelection={(projectName) => {
        const match = projectName ? (projects.find(byName(projectName)) ?? null) : null;
        updatePreferredProject(match);
        navigate(getRedirectPath(projectName));
      }}
      namespace={namespace ?? ''}
    />
  );
};

export default ProjectSelectorNavigator;
