package controllers

import (
	"context"
	"fmt"
	"log"
	"os"
	"strings"

	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/golang-jwt/jwt"
	"github.com/google/uuid"

	"cvwo-backend/database"
	helper "cvwo-backend/helpers"
	"cvwo-backend/models"

	"golang.org/x/crypto/bcrypt"
)

var validate = validator.New()

var domainName = os.Getenv("DOMAIN_NAME")

func HashPassword(password string) string {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	if err != nil {
		log.Panic(err)
	}

	return string(bytes)
}

func VerifyPassword(userPassword string, providedPassword string) (bool, string) {
	err := bcrypt.CompareHashAndPassword([]byte(providedPassword), []byte(userPassword))
	check := true
	msg := ""

	if err != nil {
		msg = fmt.Sprintf("Your email or password is incorrect")
		check = false
	}

	return check, msg
}

func SignUp() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		var user models.User

		if err := c.BindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		validationErr := validate.Struct(user)
		if validationErr != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": validationErr.Error()})
			return
		}

		password := HashPassword(*user.Password)
		user.Password = &password

		user.CreatedAt, _ = time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
		user.UpdatedAt, _ = time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))

		user.ID = uuid.New()

		err := database.Client.WithContext(ctx).Debug().Create(&user).Error
		if err != nil {
			var msg string
			if strings.Contains(err.Error(), "Duplicate entry") && strings.Contains(err.Error(), "users.email") {
				msg = fmt.Sprintf("You have already signed up with that email")
			} else {
				msg = fmt.Sprintf("Error occured while creating user account")
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": msg})
			return
		}
		defer cancel()

		c.JSON(http.StatusOK, gin.H{"success": "User " + user.ID.String() + " successfully created"})
	}
}

func SignIn() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		var user models.User
		var foundUser models.User

		if err := c.BindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		err := database.Client.WithContext(ctx).Debug().Model(models.User{}).Where("email = ?", user.Email).Take(&foundUser).Error
		defer cancel()
		if err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "Your email or password is incorrect"})
			return
		}

		passwordIsValid, msg := VerifyPassword(*user.Password, *foundUser.Password)
		defer cancel()
		if passwordIsValid != true {
			c.JSON(http.StatusForbidden, gin.H{"error": msg})
			return
		}

		token, err := helper.CreateToken(foundUser.ID.String())
		if err != nil {
			c.JSON(http.StatusUnprocessableEntity, err.Error())
			return
		}

		saveErr := helper.CreateAuthRedis(foundUser.ID.String(), token)
		if saveErr != nil {
			c.JSON(http.StatusUnprocessableEntity, saveErr.Error())
		}

		c.SetCookie("access_token", token.AccessToken, int(time.Minute*15), "/", domainName, true, true)
		c.SetCookie("refresh_token", token.RefreshToken, int(time.Hour*24*7), "/", domainName, true, true)
		c.JSON(http.StatusOK, gin.H{"user_id": foundUser.ID.String(), "success": "Successfully signed in"})
	}
}

func SignOut() gin.HandlerFunc {
	return func(c *gin.Context) {
		accessUuid, err := helper.ExtractTokenSignOut(c.Request)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		token, err := helper.VerifyTokenSignOut(c.Request)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		deleted, delErr := helper.DeleteAuthRedis(accessUuid.AccessUuid)
		if delErr != nil || (deleted == 0 && token.Valid) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Error removing entry"})
			return
		}

		c.SetCookie("access_token", "", -1, "/", domainName, true, true)
		c.SetCookie("refresh_token", "", -1, "/", domainName, true, true)
		c.JSON(http.StatusOK, gin.H{"success": "Successfully signed out"})
	}
}

func Refresh() gin.HandlerFunc {
	return func(c *gin.Context) {
		refreshToken, err := c.Cookie("refresh_token")
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing refresh token"})
			return
		}

		token, err := jwt.Parse(refreshToken, func(token *jwt.Token) (interface{}, error) {
			//Make sure that the token method conform to "SigningMethodHMAC"
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(os.Getenv("SECRET_KEY")), nil
		})

		//if there is an error, the token must have expired
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Expired refresh token supplied"})
			return
		}

		//is token valid?
		if _, ok := token.Claims.(jwt.Claims); !ok && !token.Valid {
			c.JSON(http.StatusUnauthorized, err)
			return
		}

		//Since token is valid, get the uuid:
		claims, ok := token.Claims.(jwt.MapClaims) //the token claims should conform to MapClaims

		if ok && token.Valid {
			refreshUuid, ok := claims["refresh_uuid"].(string) //convert the interface to string
			if !ok {
				c.JSON(http.StatusUnprocessableEntity, err)
				return
			}

			userId := claims["user_id"].(string)

			//Delete the previous Refresh Token
			deleted, delErr := helper.DeleteAuthRedis(refreshUuid)
			if delErr != nil || deleted == 0 { //if any goes wrong
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
				return
			}

			//Create new pairs of refresh and access tokens
			token, createErr := helper.CreateToken(userId)
			if createErr != nil {
				c.JSON(http.StatusForbidden, createErr.Error())
				return
			}

			//save the tokens metadata to redis
			saveErr := helper.CreateAuthRedis(userId, token)
			if saveErr != nil {
				c.JSON(http.StatusForbidden, saveErr.Error())
				return
			}

			c.SetCookie("access_token", token.AccessToken, int(time.Minute*15), "/", domainName, true, true)
			c.SetCookie("refresh_token", token.RefreshToken, int(time.Hour*24*7), "/", domainName, true, true)
			c.JSON(http.StatusCreated, gin.H{"success": "Successfully refreshed token"})
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Expired refresh token supplied"})
		}
	}
}
