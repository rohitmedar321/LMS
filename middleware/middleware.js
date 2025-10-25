
const requireLogin = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    // console.log('cookie status :', token)

    if (!token) {
      return res.redirect("/login");
    }

    next();

  } catch (err) {
    console.error("Auth error:", err.message);
    res.redirect("/login");
  }
};

const restricUser = async (req, res, next) => {

    let token = req.cookies.token

    if(!token) res.redirect('/login')
    next()
}

export {requireLogin, restricUser}