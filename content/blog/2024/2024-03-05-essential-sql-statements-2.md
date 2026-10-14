---
title: "Essential SQL Statements 2: Managing Data"
description: "Blog post about SQL statements used to manage the data in database tables."
date: "2024-03-05"
tags: ["database", "sql"]
draft: false
---

This is part 2 of my blog series on Essential SQL Statements. This blog post focuses on SQL statements used to manage the data contained in database tables. Check out [Basic SQL](/blog/2024-03-03-basic-sql), [Part 1](/blog/2024-03-04-essential-sql-statements-1), [Part 3](/blog/2024-03-07-essential-sql-statements-3), and [Part 4](/blog/2024-03-09-essential-sql-statements-4).

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
| ---------- |
| Jane       |
| John       |
| Jane       |
| Cara       |

```sql
SELECT DISTINCT first_name FROM employees;
```

Returns:

| first_name |
| ---------- |
| Jane       |
| John       |
| Cara       |

`Jane` still appears, just once.

When you select more than one column, uniqueness applies to the whole combination of values in that row, not to each column on its own. For example, `SELECT DISTINCT first_name, last_name FROM employees` treats `Jane Doe` and `Jane Smith` as two different results, even though both share the first name Jane.

### Aliases

An **alias** is a temporary name you can give to a column or table in a query. It only affects how the query is written and how the result is labelled. It doesn't rename anything in the database.

The `AS` keyword is used to define an alias.

#### Column Alias

A column alias is useful when column names are unclear, when two tables share the same column name, or when you want the output to read like a report.

Here's an example of a column alias:

```sql
SELECT first_name AS given_name, last_name AS family_name
FROM employees;
```

| given_name | family_name |
| ---------- | ----------- |
| Jane       | Doe         |

The syntax looks like:

```sql
SELECT column_name AS alias_name
FROM table_name;
```

#### Table Alias

This is useful to shorten a table name, or to refer to the same table more than once.

Table aliases become especially useful with joins, which I cover in [Part 3: Joins](/blog/2024-03-07-essential-sql-statements-3).

Here's an example of a table alias:

```sql
SELECT e.first_name, e.last_name, e.email
FROM employees AS e
WHERE e.first_name = 'Jane';
```

The syntax looks like:

```sql
SELECT alias_name.column_name
FROM table_name AS alias_name;
```

**Note:** `AS` is optional in many databases, but it is clearer to write explicitly. For example, you could also write:

```sql
SELECT e.first_name, e.last_name
FROM employees e
WHERE e.first_name = 'Jane';
```

### Union

The `UNION` operator is used to combine the result-set of two or more `SELECT` statements. It automatically removes duplicate rows from the result set.

```sql
SELECT column_name(s) FROM table1
UNION
SELECT column_name(s) FROM table2;
```

The `UNION` operator has some caveats worth knowing:

- Every `SELECT` statement within `UNION` must have the same number of columns
- The columns must have similar datatypes
- The columns must also be in the same order

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

That covers the essential statements for managing data in your tables: `INSERT` to add rows, `SELECT` to read them (with `DISTINCT`, `WHERE`, `ORDER BY`, and `LIMIT`), `UPDATE` to change them, and `DELETE` to remove them. Together with the database and table statements from [Part 1](/blog/2024-03-04-essential-sql-statements-1), you now have the core CRUD toolkit in SQL. In [Part 3: Joins](/blog/2024-03-07-essential-sql-statements-3), I will cover combining tables with joins, and in [Part 4: Aggregates](/blog/2024-03-09-essential-sql-statements-4), I will cover summarizing data with aggregate functions.

Thanks for reading, and see you next time!

## Sources

- [W3Schools SQL Tutorial](https://www.w3schools.com/sql/default.asp)
