export const protect = (req, res, next) => {
  req.user = { id: 2, role: "admin" };
  next();
};
