Collectivebrain
===============
<!-- TOC -->

- [1. Dev Setup](#1-dev-setup)
  - [1.1. DB installation](#11-db-installation)
  - [1.2. NPM packages](#12-npm-packages)
  - [1.3. Seed db](#13-seed-db)
  - [1.4. Run Migrations](#14-run-migrations)
  - [1.5. Login](#15-login)

<!-- /TOC -->

# 1. Dev Setup

## 1.1. DB installation
Ensure mongodb is setup and installed

``` sh
$ brew tap mongodb/brew
$ brew install mongodb-community
$ brew services start mongodb-community
$ mongo 
$ > show dbs
```
## 1.2. NPM packages
``` sh
$ npm install


```
## 1.3. Seed db
Seed database and check there is 79 posts
``` sh
$ npm run seed
$ mongo
$> use collectivebrain
$> db.posts.count() # should be 79
```

## 1.4. Run Migrations
All migrations are in `sample_data/XXX_name_of_migration` so run them in order. like below.

``` sh
$ node sample_data/001_convertToSubCategories.js
$ node sample_data/002_convertImagesToFiles.js 
$ # etc
```

## 1.5. Login 
Should be one user added with following
  - *Username* admin@collectivehomeoffice.com
  - *password* welcome123