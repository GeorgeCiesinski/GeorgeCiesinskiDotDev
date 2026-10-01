---
title: "Tar and Gzip"
description: "Blog post about adding a path to ZSH."
date: "2024-05-27"
tags: ["terminal", "tar", "gzip"]
draft: false
---

In my previous blog, I talked about how to back up Drupal source code using a Tar command. This post goes over the basics of Tar and Gzip.

## Tar

The Tar command creates tarball archives of files and directories while preserving file permissions. This is one of the tools used to create backups of the site directories. Tar is generally used to archive whole directories and can filter through gzip.

## Gzip

The Gzip command is a file compression and decompression utility that is used to reduce the size of files while keeping the original file mode, ownership, and timestamp. Gzip is used to compress individual files.

## Anatomy of Tar Commands

```bash
# Zipping an archive
tar -czvf name-of-archive.tar.gz /path/to/directory-or-file-to-zip

# Unzipping an archive
tar -xzvf name-of-archive.tar.gz

# Flags
-c : create an archive
-x : extract
-z : compress the archive with gzip
-v : verbose
-f : specify the filename of the archive
```
