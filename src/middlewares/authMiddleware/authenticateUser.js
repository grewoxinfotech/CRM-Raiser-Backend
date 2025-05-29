import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config/config.js";
import responseHandler from "../../utils/responseHandler.js";

const authenticateUser = async (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (!token || !token.startsWith("Bearer ")) {
      return responseHandler.error(res, "Invalid authorization header format");
    }
    token = token.split(" ")[1];

    token = token.replace(/^"|"$/g, "");

    if (!token) {
      return responseHandler.error(res, "Authorization token is required");
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    return responseHandler.error(res, error?.message);
  }
};

export default authenticateUser;
