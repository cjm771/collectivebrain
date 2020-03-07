module.exports = (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
      res.clearCookie('user_sid');
  } 
  res.redirect('/login');
};