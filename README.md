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

## 2.1. Sendgrid setup
  - make sure .env `SENDGRID_API_KEY` is set and authorized sender is set to `admin@collectivehomeoffice.com` in sendgrid dashboard

## 2.2. Cloudinary
  - make sure .env `CLOUDINARY_URL` is set. Access web portal via heroku