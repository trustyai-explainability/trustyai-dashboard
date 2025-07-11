import * as React from 'react';
import { Bullseye, Divider, Flex, FlexItem, MenuItem, Truncate } from '@patternfly/react-core';
import { byName, ProjectsContext } from '~/app/context/ProjectsContext';
import { IconSize, ProjectKind } from '~/app/types';
import { ProjectIconWithSize } from '~/app/concepts/projects/ProjectIconWithSize';
import SearchSelector from '~/app/concepts/projects/SearchSelector';
import { getDisplayNameFromK8sResource } from '~/concepts/k8s/utils';

type LMEvalProjectSelectorProps = {
  onSelection: (projectName: string) => void;
  namespace: string;
  invalidDropdownPlaceholder?: string;
  selectAllProjects?: boolean;
  primary?: boolean;
  filterLabel?: string;
  showTitle?: boolean;
  selectorLabel?: string;
  isFullWidth?: boolean;
  placeholder?: string;
  isLoading?: boolean;
};

const LMEvalProjectSelector: React.FC<LMEvalProjectSelectorProps> = ({
  onSelection,
  namespace,
  invalidDropdownPlaceholder,
  selectAllProjects,
  primary,
  filterLabel,
  showTitle = false,
  selectorLabel = 'Project',
  isFullWidth = false,
  placeholder = undefined,
  isLoading = false,
}) => {
  const { projects } = React.useContext(ProjectsContext);
  const selection = projects.find(byName(namespace));
  const [searchText, setSearchText] = React.useState('');
  const bySearchText = React.useCallback(
    (project: ProjectKind) =>
      !searchText ||
      getDisplayNameFromK8sResource(project).toLowerCase().includes(searchText.toLowerCase()),
    [searchText],
  );

  const selectionDisplayName = selection
    ? getDisplayNameFromK8sResource(selection)
    : (invalidDropdownPlaceholder ?? placeholder ?? namespace);

  const filteredProjects = filterLabel
    ? projects.filter((project) => project.metadata.labels?.[filterLabel] !== undefined)
    : projects;
  const visibleProjects = filteredProjects.filter(bySearchText);

  const toggleLabel = projects.length === 0 ? 'No projects' : selectionDisplayName;
  const selector = (
    <SearchSelector
      dataTestId="project-selector"
      isFullWidth={isFullWidth}
      minWidth={!isFullWidth ? '250px' : undefined}
      onSearchChange={(value) => setSearchText(value)}
      onSearchClear={() => setSearchText('')}
      searchFocusOnOpen
      searchPlaceholder="Project name"
      searchValue={searchText}
      isLoading={isLoading}
      isDisabled={isLoading}
      toggleContent={toggleLabel}
      toggleVariant={primary ? 'primary' : undefined}
    >
      <>
        {selectAllProjects && (
          <>
            <MenuItem
              key="all-projects"
              isSelected={namespace === ''}
              onClick={() => {
                onSelection('');
              }}
            >
              All projects
            </MenuItem>
            <Divider component="li" />
          </>
        )}
        {visibleProjects.length === 0 && <MenuItem isDisabled>No matching results</MenuItem>}
        {visibleProjects.map((project) => (
          <MenuItem
            key={project.metadata.name}
            isSelected={project.metadata.name === selection?.metadata.name}
            onClick={() => {
              setSearchText('');
              onSelection(project.metadata.name);
            }}
          >
            <Truncate content={getDisplayNameFromK8sResource(project)}>
              {getDisplayNameFromK8sResource(project)}
            </Truncate>
          </MenuItem>
        ))}
      </>
    </SearchSelector>
  );

  if (showTitle) {
    return (
      <Flex spaceItems={{ default: 'spaceItemsXs' }} alignItems={{ default: 'alignItemsCenter' }}>
        <ProjectIconWithSize size={IconSize.XXL} />
        <Flex
          spaceItems={{ default: 'spaceItemsSm' }}
          alignItems={{ default: 'alignItemsCenter' }}
          flex={{ default: 'flex_2' }}
        >
          <FlexItem>
            <Bullseye>{selectorLabel}</Bullseye>
          </FlexItem>
          <FlexItem flex={{ default: 'flex_1' }}>{selector}</FlexItem>
        </Flex>
      </Flex>
    );
  }
  return selector;
};

export default LMEvalProjectSelector;
