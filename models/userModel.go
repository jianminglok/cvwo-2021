package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID        uuid.UUID `gorm:"primary_key;"`
	FirstName *string   `gorm:"size:255;not null" json:"firstName" validate:"required,max=100"`
	LastName  *string   `gorm:"size:255;not null" json:"lastName" validate:"required,max=100"`
	Password  *string   `gorm:"size:255;not null" json:"password" validate:"required,min=8"`
	Email     *string   `gorm:"size:255;not null;unique" json:"email" validate:"email,required"`
	CreatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"createdAt"`
	UpdatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"updatedAt"`
}
