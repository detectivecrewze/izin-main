const isStudioRoute = window.location.pathname.startsWith('/studio/');
const isAdminRoute = window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/');

if (isAdminRoute) {
  void import('./admin');
} else if (isStudioRoute) {
  void import('./studio');
} else {
  void import('./main');
}
