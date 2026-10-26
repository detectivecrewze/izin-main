const isStudioRoute = window.location.pathname.startsWith('/studio/');

if (isStudioRoute) {
  void import('./studio');
} else {
  void import('./main');
}
