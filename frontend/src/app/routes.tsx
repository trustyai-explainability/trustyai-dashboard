import * as React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Settings } from '@app/pages/settings/Settings';
import { NotFound } from '@app/components/NotFound/NotFound';
import { LmEval } from '@app/pages/lmEval/LmEval';
import LMEvalForm from './pages/lmEvalForm/LMEvalForm';

export interface IAppRoute {
  label?: string; // Excluding the label will exclude the route from the nav sidebar in AppLayout
  /* eslint-disable @typescript-eslint/no-explicit-any */
  element: React.ReactElement;
  /* eslint-enable @typescript-eslint/no-explicit-any */
  exact?: boolean;
  path: string;
  title: string;
  routes?: undefined;
}

export interface IAppRouteGroup {
  label: string;
  routes: IAppRoute[];
}

export type AppRouteConfig = IAppRoute | IAppRouteGroup;

const routes: AppRouteConfig[] = [
  {
    element: <LmEval />,
    exact: true,
    label: 'Model evaluations',
    path: '/',
    title: 'Model Evaluations Dashboard',
  },
  {
    element: <LMEvalForm />,
    exact: true,
    label: 'Model evaluations form',
    path: '/evaluate',
    title: 'Model Evaluations Form',
  },
  {
    label: 'Settings',
    routes: [
      {
        element: <Settings />,
        exact: true,
        label: 'Settings',
        path: '/settings',
        title: 'Settings',
      },
    ],
  },
];

const flattenedRoutes: IAppRoute[] = routes.reduce(
  (flattened, route) => [...flattened, ...(route.routes ? route.routes : [route])],
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  [] as IAppRoute[],
);

const AppRoutes = (): React.ReactElement => (
  <Routes>
    {flattenedRoutes.map(({ path, element }, idx) => (
      <Route path={path} element={element} key={idx} />
    ))}
    <Route element={<NotFound />} />
  </Routes>
);

export { AppRoutes, routes };
