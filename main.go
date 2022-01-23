package main

import (
	"os"

	middleware "cvwo-backend/middleware"
	routes "cvwo-backend/routes"

	"github.com/gin-gonic/gin"
	_ "github.com/heroku/x/hmetrics/onload"
)

func main() {
	port := os.Getenv("PORT")

	if port == "" {
		port = "8080"
	}

	router := gin.New()
	router.Use(gin.Logger())
	routes.UserRoutes(router)

	router.Use(middleware.Authentication())

	// Only allow access to tasks after signing in
	routes.TaskRoutes(router)

	router.Run(":" + port)
}
