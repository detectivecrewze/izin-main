const isStudioRoute = window.location.pathname.startsWith('/studio/');
const isAdminRoute = window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/');

// Keep every lazy import in its own loader. Passing a conditional import
// directly through Vite's preload helper can merge the dependency lists and
// attach the public-gift stylesheet to Studio/Admin routes instead.
const routeLoaders = {
  admin: () => import('./admin'),
  studio: () => import('./studio'),
  gift: () => import('./main'),
} as const;

const route = isAdminRoute ? 'admin' : isStudioRoute ? 'studio' : 'gift';
void routeLoaders[route]();
