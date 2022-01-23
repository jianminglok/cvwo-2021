# CVWO Task Manager (AY21/22)

Name: Lok Jian Ming

Student ID: A0236537Y

This branch contains the backend of the project built with Golang. The frontend can be found [here](https://github.com/jianminglok/cvwo-2021/tree/frontend).

## Where to access website

  The project has been deployed on a single AWS EC2 instance with the help of Docker and NGINX reverse proxy. Links to the site are provided below.

- [Frontend](https://task.jianminglok.xyz/)
- [Backend](https://task.jianminglok.xyz/api)

## How to run backend locally

1. [Clone the repo](https://github.com/jianminglok/cvwo-2021/tree/backend) and cd into it.

	```
	git clone https://github.com/jianminglok/cvwo-2021.git -b backend cvwo-backend
	cd cvwo-backend
	```

2. Run the commands below.

	```
	go run main.go
	``` 