import jwt from 'jsonwebtoken'

export const authenticate = (req, res, next) => {
  // Acepta token por header (API normal) o por query param (PDF en nueva pestaña)
  let token = null;

  const authHeader = req.headers.authorization;
  if (authHeader) {
    token = authHeader.split(' ')[1];
  } else if (req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}
