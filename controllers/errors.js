const get404 = (req, res, next) => {
  res.status(404).render('not-found', {
    pageTitle: 'Page not found',
    path: 'not-found',
    isAuthenticated: req.session.isLoggedIn,
  });
};
const get500 = (req, res, next) => {
  res.status(500).render('500', {
    pageTitle: 'Internal Error',
    path: '500',
    isAuthenticated: req.session.isLoggedIn,
  });
};

module.exports = { get404, get500 };
