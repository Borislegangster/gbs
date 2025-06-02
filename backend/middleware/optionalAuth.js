const jwt = require("jsonwebtoken")
const { User } = require("../models")

module.exports = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findByPk(decoded.id)

      if (user && user.status === "active") {
        req.user = user
      }
    }

    next()
  } catch (error) {
    // Continue without user if token is invalid
    next()
  }
}
