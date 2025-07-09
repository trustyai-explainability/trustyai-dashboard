import * as React from 'react';
import { LMEvalKind, ProjectKind, CustomWatchK8sResult } from '~/app/types';
import { useLMEvalJob } from '~/app/hooks/useLMEvalJob';
import { ProjectsContext, byName } from '~/app/context/ProjectsContext';

type LMEvalContextType = {
  lmEval: CustomWatchK8sResult<LMEvalKind[]>;
  project?: ProjectKind | null;
  preferredProject?: ProjectKind | null;
  projects?: ProjectKind[] | null;
};

type LMEvalContextProviderProps = {
  children: React.ReactNode;
  namespace?: string;
};

const DEFAULT_LMEVAL_RESULT: CustomWatchK8sResult<LMEvalKind[]> = [[], false, undefined];

export const LMEvalContext = React.createContext<LMEvalContextType>({
  lmEval: DEFAULT_LMEVAL_RESULT,
  project: null,
  preferredProject: null,
  projects: null,
});

export const LMEvalContextProvider: React.FC<LMEvalContextProviderProps> = ({
  children,
  namespace,
}) => {
  const { projects, preferredProject } = React.useContext(ProjectsContext);
  const project = projects.find(byName(namespace)) ?? null;

  const lmEval = useLMEvalJob(namespace ?? '');

  const contextValue = React.useMemo(
    () => ({
      lmEval,
      project,
      preferredProject,
      projects,
    }),
    [lmEval, project, preferredProject, projects],
  );

  return <LMEvalContext.Provider value={contextValue}>{children}</LMEvalContext.Provider>;
};
