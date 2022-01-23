# CVWO Task Manager (AY21/22)

Name: Lok Jian Ming

Matriculation Number: A0236537Y

This branch contains the frontend of the project built with React, Redux Toolkit, Material UI, Axios and Typescript. The backend can be found [here](https://github.com/jianminglok/cvwo-2021/tree/backend).

## Where to access website

  The project has been deployed on a single AWS EC2 instance with the help of Docker, a modified version of [nginx-certbot](https://github.com/wmnnd/nginx-certbot) NGINX reverse proxy. Links to the site are provided below.

- [Frontend](https://task.jianminglok.xyz/)
- [Backend](https://task.jianminglok.xyz/api)

## How to deploy

1. Create an AWS EC2 instance of the type **t2.xlarge** running the **Ubuntu Server 20.04 LTS AMI (x86)** to ensure successful deployment (we will scale down the instance later on). Enable port **80** (HTTP) and **443** (HTTPS) under step 6 (Configure Security Group).

2. After the instance has been created, [allocate and associate an Elastic IP Address](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-eips.html) to it.

3. Create an **A** record for your domain name inside your domain registrar's dashboard and point it to the associated Elastic IP Address.

4. SSH into your newly created instance.

5. Install Docker and Docker Compose with the following commands:

	```
	sudo curl -L https://github.com/docker/compose/releases/download/v2.2.3/docker-compose-linux-x86_64 -o /usr/local/bin/docker-compose
	sudo chmod +x /usr/local/bin/docker-compose
	docker-compose --version
	sudo snap install docker
	```

6. Create a network so that our Dockerised frontend and backend can communicate
	```
	sudo docker network create cvwo
	```

7. Clone the [backend repo](https://github.com/jianminglok/cvwo-2021/tree/backend) from GitHub and change directory into the folder.

	```
	git clone https://github.com/jianminglok/cvwo-2021.git -b backend ~/cvwo-backend
	cd ~/cvwo-backend
	```  

8.  Edit the .env file to insert the required variables and deploy it with Docker.

	```
	vim .env
	sudo docker-compose up -d
	```

9. Clone the [frontend repo](https://github.com/jianminglok/cvwo-2021/tree/frontend) from GitHub and change directory into the folder.

	```
	git clone https://github.com/jianminglok/cvwo-2021.git -b frontend ~/cvwo-frontend
	cd ~/cvwo-frontend
	```   

10. Edit the files init-letsencrypt.sh and cvwo.conf by replacing **all** occurrences of **INSERT_DOMAIN_NAME_HERE** and **INSERT_YOUR_EMAIL_HERE** with your domain name and email respectively.

	```
	vim init-letsencrypt.sh
	vim cvwo.conf
	```

11. Give necessary permissions and start the frontend deployment with Docker.

	```
	chmod a+x init-letsencrypt.sh
	sudo chmod -R 755 ./
	sudo bash ./init-letsencrypt.sh
	sudo docker-compose up -d
	```

12. Verify that everything is working properly, and proceed to scale down your AWS EC2 instance by [changing its type](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-resize.html) to **t2.micro**.

13. To stop the frontend and/or the backend, enter the respective directory and run

	```
	sudo docker-compose down
	```

## How to run frontend locally

1. [Clone the repo](https://github.com/jianminglok/cvwo-2021/tree/frontend) and cd into it

	```
	git clone https://github.com/jianminglok/cvwo-2021.git -b frontend cvwo-frontend
	cd cvwo-frontend
	```

2. Install it and run using the commands below.

	```
	npm install
	npm start
	``` 

## Relational Database Schema

![Relational database schema](https://i.ibb.co/D8PPfvc/Untitled-2.png)