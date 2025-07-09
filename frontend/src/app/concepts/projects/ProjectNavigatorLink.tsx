import { Button, Flex, FlexItem } from '@patternfly/react-core';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconSize, ProjectKind } from '~/app/types';
import { getDisplayNameFromK8sResource } from '~/concepts/k8s/utils';
import { ProjectIconWithSize } from './ProjectIconWithSize';

type ProjectNavigatorLinkProps = {
  project?: ProjectKind;
};

const ProjectNavigatorLink: React.FC<ProjectNavigatorLinkProps> = ({ project }) => {
  const navigate = useNavigate();

  if (!project) {
    return null;
  }

  return (
    <Button
      variant="link"
      component="a"
      onClick={() => {
        navigate(`/projects/${project.metadata.name}`);
      }}
      data-testid="project-navigator-link"
    >
      <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }}>
        <FlexItem>Go to</FlexItem>
        <ProjectIconWithSize size={IconSize.LG} />
        <FlexItem>
          <strong>{getDisplayNameFromK8sResource(project)}</strong>
        </FlexItem>
      </Flex>
    </Button>
  );
};

export default ProjectNavigatorLink;
