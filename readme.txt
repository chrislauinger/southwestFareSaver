This web app uses AWS's dynamoDb tables to store data. A separate python project is used to find southwest fares. 

Instructions for hosting web app from AWS ec2 instance after cloning repo: 

Create key.js and fill in info:
AWS.config.update({accessKeyId: '', secretAccessKey: ''});
AWS.config.region = ''; 

Install Packages:
sudo yum install nodejs npm --enablerepo=epel
sudo npm install http-server -g
sudo npm install angular
sudo npm install angular-resource
sudo npm install angular-ui-router
sudo npm install n3-charts
sudo npm install bootstrap
sudo npm install font-awesome
sudo npm install jquery

Startup web app:
http-server -p 8081

Find app at location of EC2 instance: 
http://ec2-52-36-124-201.us-west-2.compute.amazonaws.com:8081/app/
