package controllers

import (
	"context"
	"cvwo-backend/database"
	"cvwo-backend/models"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func CreateTask() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		var task models.Task

		userId := c.MustGet("userId").(string)

		if err := c.BindJSON(&task); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		validationErr := validate.Struct(task)
		if validationErr != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": validationErr.Error()})
			return
		}

		err := database.Client.WithContext(ctx).Debug().Model(models.User{}).Where("id = ?", userId).Error
		defer cancel()
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusBadRequest, gin.H{"error": "User cannot be found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error occured while looking for user"})
			}
			return
		}

		if userId != task.OwnerId.String() {
			c.JSON(http.StatusBadRequest, gin.H{"error": "User cannot be found"})
			return
		}

		task.TaskID = uuid.New()

		task.Completed = false
		task.CreatedAt, _ = time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
		task.UpdatedAt, _ = time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))

		if task.DueDateTime.IsZero() {
			year, month, day := time.Now().AddDate(0, 0, 1).Date()
			task.DueDateTime, _ = time.Parse(time.RFC3339, time.Date(year, month, day, 0, 0, 0, -1, time.Now().Location()).Format(time.RFC3339))
		}

		if task.DueDate.IsZero() {
			year, month, day := task.DueDateTime.AddDate(0, 0, 1).Date()
			task.DueDate, _ = time.Parse(time.RFC3339, time.Date(year, month, day, 0, 0, 0, -1, time.Now().Location()).Format(time.RFC3339))
		}

		insertErr := database.Client.WithContext(ctx).Debug().Create(&task).Error
		if insertErr != nil {
			msg := fmt.Sprintf("Error occured while creating task")
			c.JSON(http.StatusInternalServerError, gin.H{"error": msg})
			return
		}
		defer cancel()

		c.JSON(http.StatusOK, gin.H{"success": "Task " + task.TaskID.String() + " successfully created"})

	}
}

func FetchTasks() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		var tasks []models.All

		userId := c.MustGet("userId").(string)

		err := database.Client.WithContext(ctx).Debug().Model(models.User{}).Where("id = ?", userId).Error
		defer cancel()
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusBadRequest, gin.H{"error": "User cannot be found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error occured while looking for user"})
			}
			return
		}

		fetchErr := database.Client.WithContext(ctx).Debug().Raw("SELECT completed, COUNT(*) as task_count, JSON_AGG(JSON_BUILD_OBJECT('TaskID', t.task_id, 'name', t.name, 'tags', t.tags, 'priority', t.priority, 'completed', t.completed, 'ownerId', t.owner_id, 'dueDate', t.due_date, 'dueDateTime', t.due_date_time, 'createdAt', t.created_at, 'updatedAt', t.updated_at) ORDER BY created_at DESC) AS items FROM tasks t WHERE owner_id = '" + userId + "' GROUP BY completed").Find(&tasks).Error

		defer cancel()
		if fetchErr != nil {
			if errors.Is(fetchErr, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusOK, []models.Task{})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error occured while fetching tasks"})
			}
			return
		}

		c.JSON(http.StatusOK, tasks)
	}
}

func FetchPlanned() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		var tasks []models.Planned
		var todayTasks, tomorrowTasks, weekTasks, monthTasks, futureTasks []models.Task

		userId := c.MustGet("userId").(string)

		err := database.Client.WithContext(ctx).Debug().Model(models.User{}).Where("id = ?", userId).Error
		defer cancel()
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusBadRequest, gin.H{"error": "User cannot be found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error occured while looking for user"})
			}
			return
		}

		year, month, day := time.Now().AddDate(0, 0, 1).Date()
		dateToday, _ := time.Parse(time.RFC3339, time.Date(year, month, day, 0, 0, 0, -1, time.Now().Location()).Format(time.RFC3339))
		dateTomorrow, _ := time.Parse(time.RFC3339, time.Date(year, month, day+1, 0, 0, 0, -1, time.Now().Location()).Format(time.RFC3339))
		dateWeek, _ := time.Parse(time.RFC3339, time.Date(year, month, day+7, 0, 0, 0, -1, time.Now().Location()).Format(time.RFC3339))
		dateMonth, _ := time.Parse(time.RFC3339, time.Date(year, month+1, day-1, 0, 0, 0, -1, time.Now().Location()).Format(time.RFC3339))

		var fetchErr error

		fetchErr = database.Client.WithContext(ctx).Debug().Model([]models.Task{}).Where("owner_id = ? AND due_date = ? AND completed = ?", userId, dateToday, false).Order("due_date_time").Find(&todayTasks).Error
		defer cancel()
		if fetchErr != nil {
			if !errors.Is(fetchErr, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error occured while fetching tasks"})
				return
			}
		}

		fetchErr = database.Client.WithContext(ctx).Debug().Model([]models.Task{}).Where("owner_id = ? AND due_date = ? AND completed = ?", userId, dateTomorrow, false).Order("due_date_time").Find(&tomorrowTasks).Error
		defer cancel()
		if fetchErr != nil {
			if !errors.Is(fetchErr, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error occured while fetching tasks"})
				return
			}
		}

		fetchErr = database.Client.WithContext(ctx).Debug().Model([]models.Task{}).Where("owner_id = ? AND due_date > ? AND due_date <= ? AND completed = ?", userId, dateTomorrow, dateWeek, false).Order("due_date_time").Find(&weekTasks).Error
		defer cancel()
		if fetchErr != nil {
			if !errors.Is(fetchErr, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error occured while fetching tasks"})
				return
			}
		}

		fetchErr = database.Client.WithContext(ctx).Debug().Model([]models.Task{}).Where("owner_id = ? AND due_date > ? AND due_date <= ? AND completed = ?", userId, dateWeek, dateMonth, false).Order("due_date_time").Find(&monthTasks).Error
		defer cancel()
		if fetchErr != nil {
			if !errors.Is(fetchErr, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error occured while fetching tasks"})
				return
			}
		}

		fetchErr = database.Client.WithContext(ctx).Debug().Model([]models.Task{}).Where("owner_id = ? AND due_date > ? AND completed = ?", userId, dateMonth, false).Order("due_date_time").Find(&futureTasks).Error
		defer cancel()
		if fetchErr != nil {
			if !errors.Is(fetchErr, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error occured while fetching tasks"})
				return
			}
		}

		if len(todayTasks) > 0 {
			todayTasksPlanned := models.Planned{
				Due:       0,
				TaskCount: len(todayTasks),
				Items:     todayTasks,
			}

			tasks = append(tasks, todayTasksPlanned)
		}

		if len(tomorrowTasks) > 0 {
			tomorrowTasksPlanned := models.Planned{
				Due:       1,
				TaskCount: len(tomorrowTasks),
				Items:     tomorrowTasks,
			}

			tasks = append(tasks, tomorrowTasksPlanned)
		}

		if len(weekTasks) > 0 {
			weekTasksPlanned := models.Planned{
				Due:       2,
				TaskCount: len(weekTasks),
				Items:     weekTasks,
			}

			tasks = append(tasks, weekTasksPlanned)
		}

		if len(monthTasks) > 0 {
			monthTasksPlanned := models.Planned{
				Due:       3,
				TaskCount: len(monthTasks),
				Items:     monthTasks,
			}

			tasks = append(tasks, monthTasksPlanned)
		}

		if len(futureTasks) > 0 {
			futureTasksPlanned := models.Planned{
				Due:       4,
				TaskCount: len(futureTasks),
				Items:     futureTasks,
			}

			tasks = append(tasks, futureTasksPlanned)
		}

		c.JSON(http.StatusOK, tasks)
	}
}

func FetchToday() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		var tasks []models.Today

		userId := c.MustGet("userId").(string)

		err := database.Client.WithContext(ctx).Debug().Model(models.User{}).Where("id = ?", userId).Error
		defer cancel()
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusBadRequest, gin.H{"error": "User cannot be found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error occured while looking for user"})
			}
			return
		}

		year, month, day := time.Now().AddDate(0, 0, 1).Date()
		dateToday, _ := time.Parse(time.RFC3339, time.Date(year, month, day, 0, 0, 0, -1, time.Now().Location()).Format(time.RFC3339))

		fetchErr := database.Client.WithContext(ctx).Debug().Raw("SELECT DATE_TRUNC('hour', due_date_time) AS due, COUNT(*) as task_count, JSON_AGG(JSON_BUILD_OBJECT('TaskID', t.task_id, 'name', t.name, 'tags', t.tags, 'priority', t.priority, 'completed', t.completed, 'ownerId', t.owner_id, 'dueDate', t.due_date, 'dueDateTime', t.due_date_time, 'createdAt', t.created_at, 'updatedAt', t.updated_at) ORDER BY created_at DESC) AS items FROM tasks t WHERE owner_id = '" + userId + "' AND completed = false AND due_date = '" + dateToday.Format(time.RFC3339) + "'GROUP BY DATE_TRUNC('hour', due_date_time) ORDER BY due").Find(&tasks).Error
		defer cancel()
		if fetchErr != nil {
			if errors.Is(fetchErr, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusOK, []models.Task{})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error occured while fetching tasks"})
			}
			return
		}

		c.JSON(http.StatusOK, tasks)
	}
}

func FetchTasksWithFilter() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		var tasks []models.All

		tag := c.Param("tag")
		priority := c.Param("priority")
		userId := c.MustGet("userId").(string)

		err := database.Client.WithContext(ctx).Debug().Model(models.User{}).Where("id = ?", userId).Error
		defer cancel()
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusBadRequest, gin.H{"error": "User cannot be found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error occured while looking for user"})
			}
			return
		}

		var fetchErr error

		const selectQuery string = "SELECT completed, COUNT(*) as task_count, JSON_AGG(JSON_BUILD_OBJECT('TaskID', t.task_id, 'name', t.name, 'tags', t.tags, 'priority', t.priority, 'completed', t.completed, 'ownerId', t.owner_id, 'dueDate', t.due_date, 'dueDateTime', t.due_date_time, 'createdAt', t.created_at, 'updatedAt', t.updated_at) ORDER BY created_at DESC) AS items FROM tasks t "
		const orderQuery string = " GROUP BY completed"

		if tag != "" {
			fetchErr = database.Client.
				WithContext(ctx).
				Debug().
				Model(models.All{}).
				Raw(selectQuery + "WHERE owner_id = '" + userId + "' AND '" + tag + "' = ANY(tags)" + orderQuery).
				Find(&tasks).
				Error
		} else if priority != "" {
			fetchErr = database.Client.
				WithContext(ctx).
				Debug().
				Model(models.All{}).
				Raw(selectQuery + "WHERE owner_id = '" + userId + "' AND priority = '" + priority + "'" + orderQuery).
				Find(&tasks).
				Error
		} else {
			fetchErr = database.Client.
				WithContext(ctx).
				Debug().
				Model(models.All{}).
				Raw(selectQuery + "WHERE owner_id = '" + userId + orderQuery).
				Find(&tasks).
				Error
		}

		defer cancel()
		if fetchErr != nil {
			if errors.Is(fetchErr, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusOK, []models.Task{})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error occured while fetching tasks"})
			}
			return
		}

		c.JSON(http.StatusOK, tasks)
	}
}

func FetchTask() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		var task models.Task

		taskId := c.Param("taskid")
		userId := c.MustGet("userId").(string)

		err := database.Client.WithContext(ctx).Debug().Model(models.User{}).Where("id = ?", userId).Error
		defer cancel()
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusBadRequest, gin.H{"error": "User cannot be found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error occured while looking for user"})
			}
			return
		}

		fetchErr := database.Client.WithContext(ctx).Debug().Model([]models.Task{}).Where("owner_id = ? AND task_id = ?", userId, taskId).Find(&task).Error
		defer cancel()
		if fetchErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error occured while fetching task"})
			return
		}

		c.JSON(http.StatusOK, task)
	}
}

func FetchTags() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		var tags string
		var newTags []models.Tag

		userId := c.MustGet("userId").(string)

		err := database.Client.WithContext(ctx).Debug().Model(models.User{}).Where("id = ?", userId).Error
		defer cancel()
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusBadRequest, gin.H{"error": "User cannot be found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error occured while looking for user"})
			}
			return
		}

		fetchErr := database.Client.
			WithContext(ctx).
			Debug().
			Raw("SELECT JSON_AGG(JSON_BUILD_OBJECT('name', name)) FROM (SELECT DISTINCT UNNEST(tags) as name FROM tasks WHERE owner_id = '" + userId + "') t").
			Find(&tags).
			Error
		defer cancel()
		if fetchErr != nil {
			if !strings.Contains(fetchErr.Error(), "converting NULL to string is unsupported") {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error occured while fetching task"})
				return
			} else {
				c.JSON(http.StatusOK, []models.Tag{})
				return
			}
		}

		json.Unmarshal([]byte(tags), &newTags)

		c.JSON(http.StatusOK, newTags)
	}
}

func UpdateTask() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		var task models.Task

		taskId := c.Param("taskid")
		userId := c.MustGet("userId").(string)

		err := database.Client.WithContext(ctx).Debug().Model(models.User{}).Where("id = ?", userId).Error
		defer cancel()
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusBadRequest, gin.H{"error": "User cannot be found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error occured while looking for user"})
			}
			return
		}

		if err := c.BindJSON(&task); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		validationErr := validate.Struct(task)
		if validationErr != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": validationErr.Error()})
			return
		}

		task.UpdatedAt, _ = time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))

		if task.DueDateTime.IsZero() {
			year, month, day := time.Now().AddDate(0, 0, 1).Date()
			task.DueDateTime, _ = time.Parse(time.RFC3339, time.Date(year, month, day, 0, 0, 0, -1, time.Now().Location()).Format(time.RFC3339))
		}

		if task.DueDate.IsZero() {
			year, month, day := task.DueDateTime.AddDate(0, 0, 1).Date()
			task.DueDate, _ = time.Parse(time.RFC3339, time.Date(year, month, day, 0, 0, 0, -1, time.Now().Location()).Format(time.RFC3339))
		}

		updateErr := database.Client.WithContext(ctx).Debug().Model(models.Task{}).Where("task_id = ? AND owner_id = ?", taskId, userId).Updates(map[string]interface{}{"name": task.Name, "tags": task.Tags, "priority": task.Priority, "completed": task.Completed, "due_date": task.DueDate, "due_date_time": task.DueDateTime, "updated_at": task.UpdatedAt}).Error
		defer cancel()
		if updateErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error occured while updating task"})
			return
		}

		fetchErr := database.Client.WithContext(ctx).Debug().Model([]models.Task{}).Where("owner_id = ? AND task_id = ?", userId, taskId).Find(&task).Error
		defer cancel()
		if fetchErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error occured while fetching updated task"})
			return
		}

		c.JSON(http.StatusOK, task)
	}
}

func ToggleTask() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		var task models.Task

		taskId := c.Param("taskid")
		userId := c.MustGet("userId").(string)

		err := database.Client.WithContext(ctx).Debug().Model(models.User{}).Where("id = ?", userId).Error
		defer cancel()
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusBadRequest, gin.H{"error": "User cannot be found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error occured while looking for user"})
			}
			return
		}

		fetchErr := database.Client.WithContext(ctx).Debug().Model([]models.Task{}).Where("owner_id = ? AND task_id = ?", userId, taskId).Find(&task).Error
		defer cancel()
		if fetchErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error occured while fetching updated task"})
			return
		}

		task.Completed = !task.Completed
		task.UpdatedAt, _ = time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))

		updateErr := database.Client.WithContext(ctx).Debug().Model(models.Task{}).Where("task_id = ? AND owner_id = ?", taskId, userId).Updates(map[string]interface{}{"completed": task.Completed}).Error
		defer cancel()
		if updateErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error occured while updating task"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"success": "Completion status of task " + taskId + " successfully toggled"})
	}
}

func DeleteTask() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		var task models.Task

		taskId := c.Param("taskid")
		userId := c.MustGet("userId").(string)

		err := database.Client.WithContext(ctx).Debug().Model(models.User{}).Where("id = ?", userId).Error
		defer cancel()
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusBadRequest, gin.H{"error": "User cannot be found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error occured while looking for user"})
			}
			return
		}

		deleteErr := database.Client.WithContext(ctx).Debug().Model([]models.Task{}).Where("owner_id = ? AND task_id = ?", userId, taskId).Delete(&task).Error
		defer cancel()
		if deleteErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error occured while deleting task"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"success": "Task " + taskId + " successfully deleted"})
	}
}

func SearchTasks() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		var tasks []models.All

		searchQuery := c.Param("searchquery")
		userId := c.MustGet("userId").(string)

		err := database.Client.WithContext(ctx).Debug().Model(models.User{}).Where("id = ?", userId).Error
		defer cancel()
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusBadRequest, gin.H{"error": "User cannot be found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error occured while looking for user"})
			}
			return
		}

		selectQuery := "SELECT completed, COUNT(*) as task_count, JSON_AGG(JSON_BUILD_OBJECT('TaskID', t.task_id, 'name', t.name, 'tags', t.tags, 'priority', t.priority, 'completed', t.completed, 'ownerId', t.owner_id, 'dueDate', t.due_date, 'dueDateTime', t.due_date_time, 'createdAt', t.created_at, 'updatedAt', t.updated_at) ORDER BY ts_rank(ts, phraseto_tsquery('english', '" + searchQuery + "')) DESC, created_at DESC) AS items FROM tasks t "
		orderQuery := " GROUP BY completed"

		fetchErr := database.Client.
			WithContext(ctx).
			Debug().
			Model(models.All{}).
			Raw(selectQuery + "WHERE owner_id = '" + userId + "' AND ts @@ phraseto_tsquery('english', '" + searchQuery + "')" + orderQuery).
			Find(&tasks).
			Error

		defer cancel()
		if fetchErr != nil {
			if errors.Is(fetchErr, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusOK, []models.Task{})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error occured while fetching tasks"})
			}
			return
		}

		c.JSON(http.StatusOK, tasks)
	}
}
