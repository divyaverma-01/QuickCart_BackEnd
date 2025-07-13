export const redirectIfAuthenticated = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  //  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1]; ????

  if (token) {
    //if loggen in, redirect from auth pages to dashboard
    return res.redirect("/"); //???
  }
  next();
};
