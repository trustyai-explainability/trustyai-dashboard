import {
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { MoonIcon, SunIcon } from '@patternfly/react-icons';
import React from 'react';
import { useThemeContext } from './ThemeContext';

const HeaderTools: React.FC = () => {
  const { theme, setTheme } = useThemeContext();

  React.useEffect(() => {
    const htmlElement = document.getElementsByTagName('html')[0];
    if (theme === 'dark') {
      htmlElement.classList.add('pf-v6-theme-dark');
    } else {
      htmlElement.classList.remove('pf-v6-theme-dark');
    }
  }, [theme]);

  return (
    <Toolbar isFullHeight data-testid="header-tools">
      <ToolbarContent>
        <ToolbarGroup variant="action-group-plain" align={{ default: 'alignEnd' }}>
          <ToolbarItem>
            <ToggleGroup aria-label="Theme toggle group">
              <ToggleGroupItem
                aria-label="light theme"
                icon={<SunIcon />}
                isSelected={theme === 'light'}
                onChange={() => {
                  setTheme('light');
                }}
              />
              <ToggleGroupItem
                aria-label="dark theme"
                icon={<MoonIcon />}
                isSelected={theme === 'dark'}
                onChange={() => {
                  setTheme('dark');
                }}
              />
            </ToggleGroup>
          </ToolbarItem>
        </ToolbarGroup>
      </ToolbarContent>
    </Toolbar>
  );
};

export default HeaderTools;
