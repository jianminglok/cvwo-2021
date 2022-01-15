package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

type Planned struct {
	Due       int    `json:"due"`
	TaskCount int    `json:"taskCount"`
	Items     []Task `json:"items"`
}

type All struct {
	Completed bool            `json:"completed"`
	TaskCount int             `json:"taskCount"`
	Items     json.RawMessage `json:"items"`
}

type Today struct {
	Due       time.Time       `json:"due"`
	TaskCount int             `json:"taskCount"`
	Items     json.RawMessage `json:"items"`
}

type Tag struct {
	Name string `json:"name"`
}

type Task struct {
	TaskID      uuid.UUID      `gorm:"primary_key"`
	Name        string         `gorm:"size:255;not null" json:"name" validate:"required"`
	Tags        pq.StringArray `gorm:"type:text[]" json:"tags"`
	Priority    string         `gorm:"size:100;not null" json:"priority"`
	Completed   bool           `json:"completed"`
	OwnerId     uuid.UUID      `json:"ownerId"`
	DueDate     time.Time      `json:"dueDate"`
	DueDateTime time.Time      `json:"dueDateTime"`
	CreatedAt   time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"createdAt"`
	UpdatedAt   time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"updatedAt"`
}
