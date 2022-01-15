package middleware

import (
	helper "cvwo-backend/helpers"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Authz validates token and authorizes users
func Authentication() gin.HandlerFunc {
	return func(c *gin.Context) {

		err := helper.ValidateToken(c.Request)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		tokenAuth, err := helper.ExtractTokenMetadata(c.Request)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Unable to retrive user"})
			c.Abort()
			return
		}

		userId, err := helper.FetchAuthRedis(tokenAuth)
		if err != nil {
			c.JSON(http.StatusUnauthorized, "Unauthorized")
			return
		}

		c.Set("userId", userId)

		c.Next()
	}
}
