package routes

import (
	controller "cvwo-backend/controllers"

	"github.com/gin-gonic/gin"
)

//UserRoutes function
func UserRoutes(incomingRoutes *gin.Engine) {
	incomingRoutes.POST("/api/users/signup", controller.SignUp())
	incomingRoutes.POST("/api/users/signin", controller.SignIn())
	incomingRoutes.POST("/api/users/signout", controller.SignOut())
	incomingRoutes.POST("/api/users/refreshtoken", controller.Refresh())
}
