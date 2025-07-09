import React from 'react';
import { IconSize } from '~/app/types';
import ProjectIcon from '~/images/icons/ProjectIcon';

export const ProjectIconWithSize: React.FC<{ size: IconSize }> = ({ size }) => (
  <ProjectIcon
    alt=""
    style={{
      width: `var(--pf-t--global--icon--size--font--${size})`,
      height: `var(--pf-t--global--icon--size--font--${size})`,
    }}
  />
);
