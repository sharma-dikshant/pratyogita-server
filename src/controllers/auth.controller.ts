export const protect = (req, res, next) => {
  req.user = { id: 1, role: "admin" };
  next();
};
