import type { NavExtension, RouteExtension, AreaExtension } from './types';

const reliantAreas = ['lm-eval'];
const PLUGIN_LM_EVAL = 'lm-eval-plugin';

const extensions: (NavExtension | RouteExtension | AreaExtension)[] = [
  {
    type: 'app.area',
    properties: {
      id: PLUGIN_LM_EVAL,
      reliantAreas,
      devFlags: ['LM Eval Plugin'],
    },
  },
  {
    type: 'app.navigation/href',
    flags: {
      required: [PLUGIN_LM_EVAL],
    },
    properties: {
      id: 'lm-eval-mf',
      title: 'Model Evaluations MF',
      href: '/lm-eval',
      section: 'models',
      path: '/lm-eval/*',
    },
  },
  {
    type: 'app.route',
    flags: {
      required: [PLUGIN_LM_EVAL],
    },
    properties: {
      path: '/lm-eval/*',
      component: () => import('./LMEvalWrapper'),
    },
  },
];

export default extensions;
