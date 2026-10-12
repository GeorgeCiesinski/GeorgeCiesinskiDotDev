---
title: "Essential SQL Statements 1: Managing Databases and Tables"
description: "Blog post about SQL statements used to manage databases and tables."
date: "2024-03-04"
tags: ["database", "sql"]
draft: false
---

This is part 1 of my blog series on Essential SQL Statements. This blog post focuses on the statements used to manage databases and tables. Check out [Part 2 here](/blog/2024/2024-03-05-essential-sql-statements-2).

SQL statements are precise commands sent to a Relational Database Management System (RDBMS) to perform a task. These can be used by admins in a database GUI client or on the command line, or by the back end of an app.

## Creating Database

First, create a new database with the below command:

```sql
CREATE DATABASE database_name;
```

Then, you need to specify the database name to ensure the tables go into the right database. Here's how you do it with **MySQL/MariaDB** syntax:

```sql
USE database_name;
```

You can also see your databases by running the correct command. The exact syntax depends on the specific database system you are using, but the below example uses **MySQL/MariaDB** specific syntax:

```sql
SHOW DATABASES;
```

## Create Table

You can create a new table by running the below command:

```sql
CREATE TABLE table_name (
  column1 datatype constraint,
  column2 datatype constraint,
  ...
);
```

The most common naming convention for SQL tables and columns is lowercase `snake_case`. As you can see in the above example, when we create a table we must also define the column names and datatypes.

Here's another example:

```sql
CREATE TABLE employees (
  employee_id INT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE,
  hire_date DATE
);
```

The above example shows an `employees` table. The first column is a `PRIMARY KEY` with the datatype `INT`. The first and last names can't be left empty and are both a `VARCHAR(50)` datatype that can hold 50 characters of text. The `email` is the same, but can hold 100 characters of text. The `hire_date` is a `DATE` datatype.

**Note:** In the above example, the `PRIMARY KEY` is not set up to auto-increment, which means we will have to manage the `employee_id` ourselves. You can define the `employee_id` column so that it auto-increments, but the exact syntax depends on the database system you are using. Here is an example with MySQL:

```sql
employee_id INT AUTO_INCREMENT PRIMARY KEY,
```

## Alter Table

The `ALTER TABLE` statement is used to modify an existing table. You can carry out the below operations with this statement:

- **Add column:** Adds a new column to a table
- **Drop column:** Deletes a column in a table
- **Rename column:** Renames a column
- **Modify column:** Changes the data type, size, or constraints of a column
- **Add constraint:** Adds a new constraint
- **Rename table:** Renames a table

The syntax looks like:

```sql
-- Add column
ALTER TABLE table_name
ADD column_name datatype;

-- Drop column
ALTER TABLE table_name
DROP COLUMN column_name;

-- Rename column
ALTER TABLE table_name
RENAME COLUMN old_name TO new_name;

-- Change column datatype and add constraint (MySQL/MariaDB)
ALTER TABLE table_name
MODIFY column_name VARCHAR(100) NOT NULL;

-- Add constraint
ALTER TABLE table_name
ADD CONSTRAINT constraint_name UNIQUE (column_name);

-- Rename table
ALTER TABLE table_name
RENAME TO new_table_name;
```

**Note:** Exact `ALTER TABLE` syntax can vary by database. For example, `MODIFY` is **MySQL/MariaDB** specific. PostgreSQL uses `ALTER COLUMN ... TYPE` instead.

## Drop Table

`DROP TABLE` is used to permanently delete a table from the database.

**Note:** Be careful with this statement. This deletes a table and all of its data, so make sure you do this with care, and back up the database first!

```sql
DROP TABLE employees;
```

The syntax looks like this:

```sql
DROP TABLE table_name;
```

You can also pair it with `IF EXISTS` to avoid errors if the table is already gone:

```sql
DROP TABLE IF EXISTS table_name;
```

## Truncate Table

`TRUNCATE TABLE` is used to delete all the rows in a table, but it keeps the table structure, columns, and constraints. Unlike `DELETE`, you cannot filter with `WHERE`. Unlike `DROP TABLE`, the empty table itself remains.

```sql
TRUNCATE TABLE table_name;
```

## Conclusion

That covers the essential statements for creating and managing databases and tables: `CREATE DATABASE`, `CREATE TABLE`, `ALTER TABLE`, `DROP TABLE`, and `TRUNCATE TABLE`. These shape the structure your data lives in. In [Part 2: Managing Data](/blog/2024/2024-03-05-essential-sql-statements-2), I will cover the statements used to work with the rows inside those tables, including `INSERT`, `SELECT`, `UPDATE`, and `DELETE`.

Thanks for reading, and see you next time!

## Sources

[W3Schools SQL Tutorial](https://www.w3schools.com/sql/default.asp)
