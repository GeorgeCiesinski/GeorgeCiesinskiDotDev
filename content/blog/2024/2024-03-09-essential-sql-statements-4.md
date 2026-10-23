---
title: "Essential SQL Statements 4: Aggregates"
description: "Blog post about SQL aggregate functions, GROUP BY, HAVING, and Where vs Having."
date: "2024-03-09"
tags: ["database", "sql"]
draft: false
---

This is part 4 of my blog series on Essential SQL Statements. This blog post focuses on summarizing data with aggregate functions. Check out [Basic SQL](/blog/2024-03-03-basic-sql), [Part 1](/blog/2024-03-04-essential-sql-statements-1), [Part 2](/blog/2024-03-05-essential-sql-statements-2), and [Part 3](/blog/2024-03-07-essential-sql-statements-3).

## Aggregates

An aggregate function performs a calculation on a set of values, and returns a single value.

These are often used with the `GROUP BY` clause of the `SELECT` statement.

### GROUP BY

The `GROUP BY` clause is used to group rows that have the same values into summary rows. For example, "find the number of international students from each country". 

This clause is almost always used in conjunction with aggregate functions like `AVG()`, `COUNT()`, `SUM()` and others to perform calculations on each group.

```sql
SELECT country, COUNT(*)
FROM Students
GROUP BY country;
```

### AVG

The `AVG()` function returns the average value of a numerical column, and ignores `NULL` values in the column.

```sql
SELECT AVG(age)
FROM Students;
```

### COUNT

The `COUNT()` function returns the number of rows that match a specified criterion. 

```sql
SELECT COUNT(*)
FROM table_name
WHERE condition;
```

The behaviour of the function depends on the argument used within the parenthesis.

- `COUNT(*)`: Counts total number of rows in a table including `NULL` values.
- `COUNT(column_name)`: Counts the total number of non-`NULL` values in the column.
- `COUNT(DISTINCT column_name)`: Counts only the unique non-`NULL` values in the column.

### SUM

The `SUM()` function is used to calculate the total sum of values within a numeric column, and ignores `NULL` values in the column. 

```sql
SELECT SUM(Quantity)
FROM OrderDetails;
```

### MIN & MAX

The `MIN()` function returns the smallest value of the selected column, and works with numeric, string, and date data types. 

```sql
SELECT MIN(Price)
FROM Products;
```

The `MAX()` function returns the largest value of the selected column, and similarly to `MIN()`, it works with numeric, string, and date data types. 

```sql
SELECT MAX(Price)
FROM Products;
```

## HAVING

The `HAVING` clause is used to filter the results of a `GROUP BY` query based on aggregate functions.

`HAVING` syntax looks like below:

```sql
SELECT column1, aggregate_function(column2), column3, ...
FROM table_name
WHERE condition
GROUP BY column1, column3
HAVING condition -- The condition on grouped data
ORDER BY column_name;
```

### WHERE vs HAVING

Unlike the `WHERE` clause which filters individual rows before grouping, the `HAVING` clause filters groups after the aggregation has been performed.

`WHERE` limits which rows are included in the groups. This query counts only students aged 18 or older in each country:

```sql
SELECT country, COUNT(*)
FROM Students
WHERE age >= 18
GROUP BY country;
```

`HAVING` limits which groups appear in the result. This query counts all students per country, then keeps only countries with more than 5 students:

```sql
SELECT country, COUNT(*)
FROM Students
GROUP BY country
HAVING COUNT(*) > 5;
```

You cannot put `COUNT(*) > 5` in `WHERE`, because the count does not exist until after the rows are grouped.

## Conclusion

That covers the essential aggregate functions for summarizing data: `AVG()`, `COUNT()`, `SUM()`, `MIN()`, and `MAX()`, along with `GROUP BY` and `HAVING`. `WHERE` is used to filter rows before grouping, and `HAVING` is used to to filter groups after aggregation. 

Together with the statements from [Part 1](/blog/2024-03-04-essential-sql-statements-1), [Part 2](/blog/2024-03-05-essential-sql-statements-2), and [Part 3](/blog/2024-03-07-essential-sql-statements-3), you now have a solid foundation for working with SQL.

Thanks for reading, and see you next time!

## Sources

- [W3Schools SQL Tutorial](https://www.w3schools.com/sql/default.asp)
- [W3Schools SQL Aggregate Functions](https://www.w3schools.com/sql/sql_aggregate_functions.asp)
