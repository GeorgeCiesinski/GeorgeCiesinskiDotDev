---
title: "How to Use CHMOD"
description: "Blog post about using CHMOD to change permissions and ownership."
date: "2024-05-27"
tags: ["terminal", "chmod"]
draft: false
---

The `chmod` command is used frequently to change the permissions of directories and files in the Linux and Mac operating systems.

## Viewing and Understanding Permissions

To view the permissions of a directory or file, run the command `ls -l`. Alternatively, `ls -lh` also includes human-readable file sizes in Mebibytes (as opposed to Megabytes).

```bash
% ls -l default
total 168
-rw-r--r--@  1 ciesinsg  staff   9069 12 Jul 09:39 default.services.yml
-rw-r--r--@  1 ciesinsg  staff  35385 12 Jul 09:39 default.settings.php
drwxrwxr-x@ 10 ciesinsg  staff    320 24 Jul 15:56 files
-r--r--r--@  1 ciesinsg  staff  35997 13 Jul 09:09 settings.php
```

Each line shows the permissions for a file or a directory. The items that start with an `-` are files, while the lines that start with `d` are directories.

The next 9 characters are split into groups of three permissions, representing the `user`, `group`, and `other users` permissions in that order. The permissions are defined in a `read`, `write`, and `execute` order, where a dash means that permission is not granted to that user.

```bash
#Directory Permission Example
d         rwx     rwx     r-x
directory
          owner | group | others
          all   | all   | Read and Execute

#File Permission Example
-         rw-              r--     r--
file
          owner          | group | others
          read and write | read  | read
```

```bash
r: read
w: write
x: execute
-: permission not granted
```

## Changing Permissions

The chmod command can be used either in symbolic mode or numeric mode.

### Symbolic Mode

Symbolic mode uses symbolic characters to add, remove or set permissions.

```bash
chmod (users)(action)(permissions) (file or directory)
```

The users section uses `ugoa` symbols where each means:

```bash
u: `user` who owns the file or directory
g: `group` user
o: `other` users
a: `all` of the above users
```

The actions available are:

```bash
+: Add permission
-: Remove permission
=: Set permission
```

The main permissions are:

```bash
r: read
w: write
x: execute
```

**Example 1:** Adding write permissions to new_file.txt to all users

```bash
chmod a+w new_file.txt
```

**Example 2:** Chaining permissions for different users with a comma

```bash
chmod u=rw,go=r new_file.txt
```

**Note:** There are more permissions available at the [chmod manual](https://www.man7.org/linux/man-pages/man1/chmod.1.html), but these are less frequently used.

### Numeric Mode

Numeric mode can be used as a chmod shorthand. It consists of three numbers representing the `user`, `group`, and `others` in that order. The numbers consist of one to four possible octal digits, derived by adding up the numerical representation of each permission.

```bash
read: 4
write: 2
execute: 1
```

**Example 1:** Giving all permissions to all users with 777

```bash
rwx rwx rwx
421 421 421
7   7   7
```

**Example 2:** Granting different permissions for each user with 756

```bash
rwx r-x rw-
421 4-1 42-
7   5   6
```

Using this information, we can now demonstrate setting permissions using numeric mode:

```bash
chmod 777 new_file.txt
```

You can also chain permissions for different users with a comma:

```bash
chmod 644 new_file.txt
```

The possible numerical combinations are:

```bash
7: All permissions
6: Read and write
5: Read and execute
4: Read
3: Write and execute
2: Write
1: Execute
```

## Changing Permissions Recursively

In some cases, all the contents of the directory must be changed, including subdirectories. To do this, you can cd into the top directory and run:

```bash
chmod 775 -R *
```

## Learn More

Learn more about [Changing Permissions](https://www.man7.org/linux/man-pages/man1/chmod.1.html).
