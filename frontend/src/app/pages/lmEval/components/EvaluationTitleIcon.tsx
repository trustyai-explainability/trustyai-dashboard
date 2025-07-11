import * as React from 'react';
import { Flex, FlexItem } from '@patternfly/react-core';
import ModelEvaluationsIcon from '~/images/icons/modelEvaluationsIcon';

interface TitleWithIconProps {
  title: React.ReactNode;
  iconSize?: number;
  padding?: number;
}

const TitleWithIcon: React.FC<TitleWithIconProps> = ({ title, iconSize = 40, padding = 4 }) => (
  <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
    <FlexItem>
      <div
        style={{
          background: 'var(--pf-t--color--purple--10)',
          borderRadius: iconSize / 2,
          padding,
          width: iconSize,
          height: iconSize,
        }}
      >
        <ModelEvaluationsIcon
          style={{ width: iconSize - padding * 2, height: iconSize - padding * 2 }}
        />
      </div>
    </FlexItem>
    <FlexItem>{title}</FlexItem>
  </Flex>
);

export default TitleWithIcon;
