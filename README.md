Collectivebrain
===============
<!-- TOC -->

- [1. Dev Setup](#1-dev-setup)
  - [1.1. Node Env](#11-node-env)
  - [1.2. Environement vars (.env)](#12-environement-vars-env)
  - [1.3. DB installation](#13-db-installation)
  - [1.4. NPM packages](#14-npm-packages)
  - [1.5. Seed db](#15-seed-db)
  - [1.6. Run Migrations](#16-run-migrations)
  - [1.7. Run tests](#17-run-tests)
  - [1.8. Start dev server + build](#18-start-dev-server--build)
  - [1.9. Login](#19-login)
- [2. Services](#2-services)
  - [2.1. Sendgrid setup](#21-sendgrid-setup)
  - [2.2. Cloudinary](#22-cloudinary)
  - [2.3. Mongo Atlas](#23-mongo-atlas)
- [3. Deployment](#3-deployment)
  - [3.1. Add env variables](#31-add-env-variables)
  - [3.2. Headless buildpack](#32-headless-buildpack)
  - [3.3. Running 'migrations' on heroku / shelling in](#33-running-migrations-on-heroku--shelling-in)
  - [3.4. checking server logs](#34-checking-server-logs)
  - [3.5. Deploying changes](#35-deploying-changes)

<!-- /TOC -->

# 1. Dev Setup

## 1.1. Node Env
This project uses node v12.4.0. Using nvm and refer to .nvmrc for more info.

## 1.2. Environement vars (.env)
We use a `.env` file to store environment variables. Make sure this is created in root and variables are properly filled out. Use .env.config as a template
``` sh
# copy .env.config and make any necessary changes
$ mv .env.config .env
```
## 1.3. DB installation
Ensure mongodb is setup and installed

``` sh
$ brew tap mongodb/brew
$ brew install mongodb-community
$ brew services start mongodb-community
$ mongo 
$ > show dbs
```
## 1.4. NPM packages
``` sh
$ npm install


```
## 1.5. Seed db
Seed database and check there is 79 posts
``` sh
$ npm run seed
$ mongo
$> use collectivebrain
$> db.posts.count() # should be 79
```

## 1.6. Run Migrations
All migrations are in `sample_data/XXX_name_of_migration` so run them in order. like below.

``` sh
$ node sample_data/001_convertToSubCategories.js
$ node sample_data/002_convertImagesToFiles.js 
$ # etc
```

## 1.7. Run tests
Using Jest, run tests via. All should pass.
```sh
$ npm test
```

## 1.8. Start dev server + build
```sh
$ npm run startDev # nodemon server
$ npm run buildWatch # webpack / react build 
$ open http://localhost:3000
```

## 1.9. Login 
Should be one user (admin) added with following
  - *Username* [email specified in .env]
  - *password* [password specified in .env]

# 2. Services
Various 3rd party services are used. Refer to shared accounts doc for credentials 
  - Sendgrid (email api)
  - Heroku (hosting)
  - ImprovMX (email forwarding)
  - godaddy (domains)
  - cloudinary (file uploads)
  - Mongo Atlas (DB)

## 2.1. Sendgrid setup
  - make sure .env `SENDGRID_API_KEY` is set and authorized sender is set to `admin@collectivehomeoffice.com` in sendgrid dashboard

## 2.2. Cloudinary
  - make sure .env `CLOUDINARY_URL` is set. Access web portal via heroku

## 2.3. Mongo Atlas
  - make sure .env `MONGODB_URI` is set on heroku to mongo atlas uri (local should be used for developement).

# 3. Deployment
  Currently `heroku` is being used for deployment. Make sure you have access to project like any other heroku project.

  ```
  $ heroku create # etc see heroku docs
  ```

## 3.1. Add env variables
Mimic `.env` file on heroku's config variables. Use `.env.config` as a template, although you should already have `.env` on your local machine.
``` sh
# to list heroku config vars
$ heroku config
# setting
$ heroku config:set FOO=BARR
```

## 3.2. Headless buildpack
WebGL is used for rendering some images #TODO
``` sh
# TDO
```

## 3.3. Running 'migrations' on heroku / shelling in
Similar to local shell into the machine and run any outstanding migration scripts to update mongo. Only run each one as they are needed.


``` sh
# shell in 
$ heroku ps:exec
$> node sample_data/001_convertToSubCategories.js
$> node sample_data/002_convertImagesToFiles.js 
$> #etc
```

## 3.4. checking server logs
``` sh
$> heroku logs --tail
```
## 3.5. Deploying changes
``` sh
$> git push heroku master
```