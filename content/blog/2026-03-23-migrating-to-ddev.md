---
title: "Migrating to DDEV"
description: "Blog post showing how to migrate to DDEV."
date: "2026-03-23"
tags: ["drupal", "ddev", "migration", "terminal", "sql"]
draft: false
---

## Introduction

DDEV is a Docker-based development environment built for Drupal development. I discovered this when I tried to build a new Drupal site and noticed that there is a new process. Previously, I built my websites manually with composer, php, and a local database instance, and by manually editing `hosts` and `vhosts` files. This wasn't difficult, but it was annoying to do each time you wanted to create a new site.

I was surprised by how easy it was to create the new site using DDEV. I decided to try migrating one of my existing websites to DDEV and to document the process. I hope you enjoy this blog post, and that you learn something about Drupal or DDEV!

## Backup

Step 1 of course is to backup the directory.

### Sourcecode

The below command uses **Tar** and **Gzip** to compress the website_directory.

```bash
tar -czvf ~/Documents/Backups/website_name/website_name.tar.gz website_directory
```

### Database

This website uses Mariadb, so the following sql command creates a database dump.

```bash
mysqldump -u user_name -p database_name > ~Documents/Backups/website_name/website_name.sql
```

## Pre-check

The project directory must contain:

- `web/` or `docroot/`
- `composer.json`
- and `sites/default/files`

A modern Drupal website should have these by default.

You also require some sort of container utility like [Docker](https://www.docker.com/). In my case, I am using [Orbstack](https://orbstack.dev/) on Mac.

## Migration

### Initialize DDEV Project

Once we have everything ready, we need to cd into the website_directory and run the below command:

```bash
ddev config
```

Terminal will prompt you for the project name, docroot location, and Drupal version. In my case, I was able to leave all default.

### Start DDEV

Next we run the below command:

```bash
ddev start
```

This spins up the following in Orbstack:

- Nginx / Apache container
- Mariadb container
- & PHP runtime

### Import Database

Once the containers are running, we can run the below command to import the database we exported earlier:

```bash
ddev import-db --src=~/Documents/Backups/website_name/website_name.sql
```

### Update settings.php

DDEV uses the default value `db` for database credentials. Edit your `settings.php` file to replace the database values listed below:

```bash
$databases['default']['default'] = [
'database' => 'db',
'username' => 'db',
'password' => 'db',
'host' => 'db',
'driver' => 'mysql',
'port' => '3306',
];
```

In my case, I left the remaining values as they were.

## Final Check

Depending on how you backed up or cloned your website_directory, make sure you transferred over `web/sites/default/files`, or that it still exists in the website_directory.

You may also need to change permissions if you experience any permissions related warnings/errors.

## Drupal Maintenance

Once we complete all the previous steps, we need to run a few [Drush](https://www.drush.org/) commands to update the cache and database.

```bash
ddev drush cr
ddev drush updb
```

## Access the Website

Finally, we can access the website with the below command:

```bash
ddev launch
```

The console should output a website that looks like:

[https://website-name.ddev.site](https://website-name.ddev.site)

Conclusion

I was very surprised with how simple the migration process was. This is one of the things I really like about DDEV. It lets someone with little or no Docker experience to run a Docker-based development environment. The commands are all short and simple to understand too. 

Big kudos to all the hard working Drupal devs who made this possible!
