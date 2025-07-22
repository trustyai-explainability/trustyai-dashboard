// Define Extension type locally since external package types are not available at build time
export type Extension<Type extends string, Properties> = {
  type: Type;
  flags?: {
    required?: string[];
  };
  properties: Properties;
};

export type ComponentCodeRef<Props = Record<string, unknown>> = () => Promise<{
  default: React.ComponentType<Props>;
}>;

export type NavItemProperties = {
  id: string;
  title: string;
  section?: string;
  dataAttributes?: { [key: string]: string };
  group?: string;
  path?: string;
};

export type HrefNavItemExtension = Extension<
  'app.navigation/href',
  NavItemProperties & {
    href: string;
    accessReview?: Record<string, unknown>;
    status?: Record<string, unknown>;
  }
>;

export type RouteExtension = Extension<
  'app.route',
  {
    path: string;
    component: ComponentCodeRef;
  }
>;

export type AreaExtension = Extension<
  'app.area',
  {
    id: string;
    reliantAreas: string[];
    devFlags?: string[];
  }
>;

export type NavExtension = HrefNavItemExtension;
