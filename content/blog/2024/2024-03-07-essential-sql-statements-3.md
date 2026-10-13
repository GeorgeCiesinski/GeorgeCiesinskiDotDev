---
title: "Essential SQL Statements 3: Joins"
description: "Blog post about SQL joins for combining rows from related tables."
date: "2024-03-07"
tags: ["database", "sql"]
draft: false
---

This is part 3 of my blog series on Essential SQL Statements. This blog post focuses on combining tables with joins. Check out [Basic SQL](/blog/2024/2024-03-03-basic-sql), [Part 1](/blog/2024/2024-03-04-essential-sql-statements-1), [Part 2](/blog/2024/2024-03-05-essential-sql-statements-2), and [Part 4](/blog/2024/2024-03-09-essential-sql-statements-4).

## Join

The `JOIN` clause is used to combine rows from two or more tables based on a related column between them.

This is useful because databases store information across separate, normalized tables.

### Inner Join

An `INNER JOIN` returns only rows that have matching values in **both** tables.

The syntax looks like:

```sql
SELECT column1, column2, ...
FROM table_a
INNER JOIN table_b
ON table_a.related_column = table_b.related_column;
```

`ON` tells the database how the tables are related. You can also write `JOIN` without the word `INNER`; in most databases they mean the same thing.

For example, let's reuse the `courses` and `assignments` idea from the [Basic SQL](/blog/2024/2024-03-03-basic-sql) post. Each assignment belongs to a course through `course_id`:

**courses**

| id  | title           |
| --- | --------------- |
| 101 | Intro to SQL    |
| 102 | Data Modeling   |
| 103 | Database Design |

**assignments**

| id  | course_id | title            |
| --- | --------- | ---------------- |
| 1   | 101       | Select Basics    |
| 2   | 101       | Joins Practice   |
| 3   | 102       | ER Diagram Draft |

```sql
SELECT assignments.title AS assignment, courses.title AS course
FROM assignments
INNER JOIN courses
ON assignments.course_id = courses.id;
```

The above query only assignments that match a course. Course `103` has no assignments, so it does not appear. Every returned row has both an assignment and a course:

| assignment       | course        |
| ---------------- | ------------- |
| Select Basics    | Intro to SQL  |
| Joins Practice   | Intro to SQL  |
| ER Diagram Draft | Data Modeling |

**Note:** `LEFT`, `RIGHT`, and `FULL` joins are outer joins. They keep unmatched rows from one or both sides and fill missing columns with `NULL`. The `OUTER` keyword is optional in most databases, so `LEFT JOIN` means the same as `LEFT OUTER JOIN`.

### Left (Outer) Join

A `LEFT JOIN` returns every row from the left table. When a match exists in the right table, those columns are filled in; when it does not, the right-table columns are `NULL`. Rows that exist only in the right table are left out. As a rule of thumb, put whichever table you refuse to lose rows from after `FROM`.

```sql
SELECT assignments.title AS assignment, courses.title AS course
FROM courses
LEFT JOIN assignments
ON courses.id = assignments.course_id;
```

In this query, `courses` is the left table, so unlike `INNER JOIN` you keep every course — including **Database Design**, which has no matching assignments. The missing assignment columns show as `NULL`. Course `101` still produces two rows because it has two assignments:

| assignment       | course          |
|------------------|-----------------|
| Select Basics    | Intro to SQL    |
| Joins Practice   | Intro to SQL    |
| ER Diagram Draft | Data Modeling   |
| NULL             | Database Design |

Another thing worth noting: the result columns are returned in the same order as the columns listed after `SELECT`. Even though the "Left" table in this case is `courses`, we requested `assignments.title` before `courses.title` so the results appear in this order.

The syntax looks like:

```sql
SELECT column1, column2, ...
FROM left_table
LEFT JOIN right_table
ON left_table.related_column = right_table.related_column;
```

**Note:** The `ON` keyword introduces a boolean condition, so the column order doesn't matter here. For example, `ON left_table.related_column = right_table.related_column` is the same as `ON right_table.related_column = left_table.related_column`. The convention is to use `left_table.key = right_table.key`.

### Right (Outer) Join

A `RIGHT JOIN` returns every row from the right table. When a match exists in the left table, those columns are filled in; when it does not, the left-table columns are `NULL`. Rows that exist only in the left table are left out.

Think of a `RIGHT JOIN` as a mirror of `LEFT JOIN`. In my `LEFT JOIN` example in the previous section, I mentioned the rule of thumb that you should keep whatever table you want to return every row from after the `FROM` keyword, but the opposite is true for `RIGHT JOIN`. Instead, you should put the table you want to return every row from after the `RIGHT JOIN` keyword. Essentially, when you invert a `LEFT JOIN` to a `RIGHT JOIN`, swap the tables in `FROM` and `JOIN`.

Most people use `LEFT JOIN` for everything. There are a few good reasons for this. First, you can retrieve the same data using either `LEFT JOIN` or `RIGHT JOIN` by inverting the query. Second, many cultures read from left-to-right, so we tend to follow this paradigm in SQL as well. Third, some platforms like older SQLite versions did not support `RIGHT JOIN` at all. Because of these things, many development teams and style guides discourage its use.

Regardless, here's an example of using `RIGHT JOIN`:

```sql
SELECT assignments.title AS assignment, courses.title AS course
FROM assignments
RIGHT JOIN courses
ON assignments.course_id = courses.id;
```

The above query returns the below results. As you can see, this is the same output as the `LEFT JOIN` example in the previous section.

| assignment       | course          |
|------------------|-----------------|
| Select Basics    | Intro to SQL    |
| Joins Practice   | Intro to SQL    |
| ER Diagram Draft | Data Modeling   |
| NULL             | Database Design |

The syntax looks like this:

```sql
SELECT column1, column2, ...
FROM left_table
RIGHT JOIN right_table
ON left_table.related_column = right_table.related_column;
```

### Full (Outer) Join

A `FULL JOIN` returns all rows from both tables. Matching rows are combined where the join condition is met; where there is no match, columns from the missing side are `NULL`.

Using the same `courses` and `assignments` tables as an example:

```sql
SELECT assignments.title AS assignment, courses.title AS course
FROM courses
FULL JOIN assignments
ON courses.id = assignments.course_id;
```

With this sample data, every assignment already has a matching course, so the result looks like the `LEFT JOIN` example: all courses are kept, and **Database Design** appears with a `NULL` assignment.

| assignment       | course          |
|------------------|-----------------|
| Select Basics    | Intro to SQL    |
| Joins Practice   | Intro to SQL    |
| ER Diagram Draft | Data Modeling   |
| NULL             | Database Design |

The difference from `LEFT JOIN` or `RIGHT JOIN` shows up when **both** sides have unmatched rows. For example, if `assignments` also had a row with `course_id` `999` (which has no matching course), a `FULL JOIN` would keep that row too, with `course` shown as `NULL`. A `LEFT JOIN` from `courses` would drop it; a `RIGHT JOIN` to `courses` would drop unmatched courses instead.

| assignment       | course          |
|------------------|-----------------|
| Select Basics    | Intro to SQL    |
| Joins Practice   | Intro to SQL    |
| ER Diagram Draft | Data Modeling   |
| NULL             | Database Design |
| Orphan Homework  | NULL            |

The syntax looks like:

```sql
SELECT column1, column2, ...
FROM left_table
FULL JOIN right_table
ON left_table.related_column = right_table.related_column;
```

**Note:** Not every database supports `FULL JOIN` directly. PostgreSQL does, but MySQL does not. in MySQL, you typically emulate it by combining a `LEFT JOIN` and a `RIGHT JOIN` with `UNION`.

### Self Join

A `SELF JOIN` is not its own join type. It means you join a table to itself, still using a join like `INNER JOIN` or `LEFT JOIN`.

This is useful when two different rows in the same table are related to each other, and you need both rows' data in one result. `SELECT` alone only looks at one row at a time, so it cannot easily say "for this employee row, also grab the manager's name from another employee row."

For example, imagine an `employees` table where each person may report to another person in the same table:

| employee_id | name | manager_id |
|-------------|------|------------|
| 1           | Ava  | NULL       |
| 2           | Ben  | 1          |
| 3           | Cara | 1          |
| 4           | Dan  | 2          |

Ben's manager is Ava. That relationship is stored as `manager_id = 1` on Ben's row, while Ava's name lives on a different row. Selecting only from one row gives you manager IDs, not manager names:

```sql
SELECT name, manager_id FROM employees;
```

Table aliases were covered in [Part 2](/blog/2024/2024-03-05-essential-sql-statements-2). To get both names, treat the table as two roles with aliases — one for the employee, one for the manager:

```sql
SELECT
  employee.name AS employee,
  manager.name AS manager
FROM employees AS employee
LEFT JOIN employees AS manager
  ON employee.manager_id = manager.employee_id;
```

| employee | manager |
|----------|---------|
| Ava      | NULL    |
| Ben      | Ava     |
| Cara     | Ava     |
| Dan      | Ben     |

`LEFT JOIN` is a good fit here so employees without a manager (like Ava) still appear, with `manager` as `NULL`.

The syntax looks like:

```sql
SELECT
  a.column1,
  b.column2
FROM table_name AS a
JOIN table_name AS b
  ON a.related_column = b.related_column;
```

Aliases (`a` and `b`, or clearer names like `employee` and `manager`) are required so you can tell which copy of the table each column comes from.

## Conclusion

That covers the essential join types for combining related tables: `INNER JOIN`, `LEFT JOIN`, `RIGHT JOIN`, `FULL JOIN`, and self joins. In [Part 4: Aggregates](/blog/2024/2024-03-09-essential-sql-statements-4), I will cover summarizing data with aggregate functions, `GROUP BY`, `HAVING`, and how `WHERE` and `HAVING` differ.

Thanks for reading, and see you next time!

## Sources

- [W3Schools SQL Tutorial](https://www.w3schools.com/sql/default.asp)
- [Stack Exchange - Reason to prefer RIGHT JOIN over LEFT JOIN](https://softwareengineering.stackexchange.com/questions/336024/reason-to-prefer-right-join-over-left-join)
