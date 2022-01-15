package routes

import (
	controller "cvwo-backend/controllers"

	"github.com/gin-gonic/gin"
)

//TaskRoutes function
func TaskRoutes(incomingRoutes *gin.Engine) {
	incomingRoutes.POST("/api/tasks/create", controller.CreateTask())
	incomingRoutes.GET("/api/tasks", controller.FetchTasks())
	incomingRoutes.GET("/api/tasks/planned", controller.FetchPlanned())
	incomingRoutes.GET("/api/tasks/today", controller.FetchToday())
	incomingRoutes.GET("/api/tasks/tags", controller.FetchTags())
	incomingRoutes.GET("/api/tasks/tag/:tag", controller.FetchTasksWithFilter())
	incomingRoutes.GET("/api/tasks/priority/:priority", controller.FetchTasksWithFilter())
	incomingRoutes.GET("/api/tasks/:taskid", controller.FetchTask())
	incomingRoutes.PUT("/api/tasks/:taskid", controller.UpdateTask())
	incomingRoutes.PUT("/api/tasks/completed/:taskid", controller.ToggleTask())
	incomingRoutes.DELETE("/api/tasks/:taskid", controller.DeleteTask())
	incomingRoutes.GET("/api/tasks/search/:searchquery", controller.SearchTasks())
}
