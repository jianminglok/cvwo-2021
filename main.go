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
		port = "8000"
	}

	router := gin.New()
	router.Use(gin.Logger())
	routes.UserRoutes(router)

	router.GET("/api/api-3", func(c *gin.Context) {
		c.JSON(200, gin.H{"success": "Access granted for api-3"})
	})

	router.Use(middleware.Authentication())

	routes.TaskRoutes(router)

	router.Run(":" + port)
}
