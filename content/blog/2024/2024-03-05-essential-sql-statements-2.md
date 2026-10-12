---
title: "Essential SQL Statements 2: Managing Data"
description: "Blog post about SQL statements used to manage the data in database tables."
date: "2024-03-05"
tags: ["database", "sql"]
draft: false
---

This is part 2 of my blog series on Essential SQL Statements. This blog post focuses on SQL statements used to manage the data contained in database tables. Check out [Part 1 here](/blog/2024/2024-03-04-essential-sql-statements-1) and [Part 3 here](/blog/2024/2024-03-07-essential-sql-statements-3).

## Insert

The `INSERT` statement is used to add a new row to a table. You can achieve this with the below command:

```sql
INSERT INTO employees (employee_id, first_name, last_name, email, hire_date)
VALUES (1, 'Jane', 'Doe', 'jane.doe@example.com', '2024-03-04');
```

As you can see, in the above example we specified the `employee_id` because this column was not set up to auto-increment. In the case that it is, you can leave out the `employee_id` (which we wrote as the value 1 in the above example).

You can also just use the table name if you match column order correctly, however this is a weaker habit and could result in mistakes if the table changes later:

```sql
INSERT INTO employees
VALUES (1, 'Jane', 'Doe', 'jane.doe@example.com', '2024-03-04');
```

## Select

The `SELECT` statement is used to select data from a table or tables. The command looks like below:

```sql
SELECT column1, column2 FROM table_name;
```

With this statement, you can specify which columns you want to select from a table, however, you can select all the columns with `*`. This is useful for learning, but should be used with caution or avoided in a real app:

```sql
SELECT * FROM table_name;
```

`SELECT` is often used behind `GET` requests in REST APIs, since it retrieves data without changing it.

### Distinct

`SELECT DISTINCT` is used to only return distinct (unique) values. When used on a table with several duplicate values, it will collapse duplicates into a single value. It does not mean "only values that appear once." Values that appear many times still show up, just once.

For example, imagine an `employees` table with these first names:

| first_name |
|------------|
| Jane       |
| John       |
| Jane       |
| Cara       |

```sql
SELECT DISTINCT first_name FROM employees;
```

Returns:

| first_name |
|------------|
| Jane       |
| John       |
| Cara       |

`Jane` still appears, just once.

When you select more than one column, uniqueness applies to the whole combination of values in that row, not to each column on its own. For example, `SELECT DISTINCT first_name, last_name FROM employees` treats `Jane Doe` and `Jane Smith` as two different results, even though both share the first name Jane.

### Where

The `WHERE` clause is used to filter records. It works with `SELECT`, `UPDATE`, and `DELETE` to control which rows the statement affects:

```sql
SELECT * FROM employees
WHERE first_name = 'Jane';
```

The syntax looks like this:

```sql
SELECT column1, column2, ...
FROM table_name
WHERE condition;
```

### AND, OR, NOT

The `WHERE` clause can also contain one or more `AND`, `OR`, or `NOT` operators. 

```sql
SELECT first_name, last_name, email FROM employees
WHERE first_name = 'Jane' AND last_name = 'Doe';
```

`OR` returns rows that match either condition:

```sql
SELECT first_name, last_name, email FROM employees
WHERE first_name = 'Jane' OR first_name = 'John';
```

`NOT` excludes rows that match a condition:

```sql
SELECT first_name, last_name, email FROM employees
WHERE NOT first_name = 'Jane';
```

### Order By

The `ORDER BY` keyword is used to sort the result set in ascending or descending order. It is used with the `SELECT` statement and can also be combined with other clauses like `WHERE`. By default, `ORDER BY` sorts in ascending order (`ASC`) if you do not specify a direction.

```sql
SELECT first_name, last_name FROM employees
ORDER BY last_name;
```

The syntax looks like:

```sql
SELECT column1, column2, ...
FROM table_name
ORDER BY column1, column2, ... ASC|DESC;
```

### Limit

`LIMIT` puts a cap on how many rows a query returns. It is most often used with `SELECT` to retrieve a sample, a page of results, or the top N rows after sorting. Support and syntax can vary by database; the examples below use **MySQL/MariaDB/SQLite**.

```sql
SELECT first_name, last_name FROM employees
LIMIT 5;
```

Without `ORDER BY`, which 5 rows you get is not guaranteed.

```sql
SELECT first_name, last_name FROM employees
ORDER BY last_name ASC
LIMIT 5;
```

Many of these databases also let you skip rows for pagination using an offset:

```sql
SELECT first_name, last_name FROM employees
ORDER BY last_name ASC
LIMIT 5 OFFSET 10;
```

The syntax looks like below:

```sql
SELECT column1, column2
FROM table_name
LIMIT number;
```

## Update

The `UPDATE` statement is used to modify an existing record in a table.

```sql
UPDATE employees
SET email = 'new@email.com'
WHERE employee_id = 1;
```

The syntax looks like this:

```sql
UPDATE table_name
SET column1 = value1, column2 = value2, ...
WHERE condition;
```

**Note:** Make sure you use `UPDATE` with the `WHERE` clause to specify which rows are updated. Without it, every row in the table is updated.

## Delete

The `DELETE` statement is used to delete existing records in a table. This statement can be dangerous if used carelessly, so make sure you also pair this one with `WHERE` and specify exactly which rows to delete.

```sql
DELETE FROM employees WHERE employee_id = 1;
```

The syntax looks like:

```sql
DELETE FROM table_name WHERE condition;
```

## Conclusion

That covers the essential statements for managing data in your tables: `INSERT` to add rows, `SELECT` to read them (with `DISTINCT`, `WHERE`, `ORDER BY`, and `LIMIT`), `UPDATE` to change them, and `DELETE` to remove them. Together with the database and table statements from [Part 1](/blog/2024/2024-03-04-essential-sql-statements-1), you now have the core CRUD toolkit in SQL. In [Part 3: Joins and Aggregates](/blog/2024/2024-03-07-essential-sql-statements-3), I will cover combining tables with joins and summarizing data with aggregate functions.

Thanks for reading, and see you next time!

## Sources

[W3Schools SQL Tutorial](https://www.w3schools.com/sql/default.asp)

