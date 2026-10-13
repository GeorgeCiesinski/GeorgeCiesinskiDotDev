---
title: "Essential SQL Statements 4: Aggregates"
description: "Blog post about SQL aggregate functions, GROUP BY, HAVING, and Where vs Having."
date: "2024-03-09"
tags: ["database", "sql"]
draft: true
---

This is part 4 of my blog series on Essential SQL Statements. This blog post focuses on summarizing data with aggregate functions. Check out [Basic SQL](/blog/2024-03-03-basic-sql), [Part 1](/blog/2024-03-04-essential-sql-statements-1), [Part 2](/blog/2024-03-05-essential-sql-statements-2), and [Part 3](/blog/2024-03-07-essential-sql-statements-3).

## Aggregates

### Group By

### AVG

### COUNT

### SUM

### MIN

### MAX

## Having

The `HAVING` clause is used to filter the results of a `GROUP BY` query based on aggregate functions.

Unlike the `WHERE` clause which filters individual rows before grouping, the `HAVING` clause filters groups after the aggregation has been performed.

`HAVING` syntax looks like below:

```sql
SELECT column1, aggregate_function(column2), column3, ...
FROM table_name
WHERE condition
GROUP BY column1, column3
HAVING condition -- The condition on grouped data
ORDER BY column_name;
```

## Where vs Having

## Sources

- [W3Schools SQL Tutorial](https://www.w3schools.com/sql/default.asp)
