---
title: "Leetcode: 1 - Two Sum"
description: "Blog post about solving the Two Sum problem on Leetcode."
date: "2026-10-01"
tags: ["leetcode", "algorithms", "typescript", "hashmap"]
draft: false
---

This is my first post about Leetcode. I've been doing leet code for some years now, though I have to admit I find the algorithms challenging for the medium or harder problems. I decided to start a new algorithms tag so I can document my journey through Leetcode and learn as much as possible.

The [1. Two Sum problem](https://leetcode.com/problems/two-sum) is an easy problem on Leetcode. My solution has a runtime of 0ms, beating 100% of solutions, but a memory of 57.39MB which only beats 36.90% of solutions. I opted for optimizing runtime in my answer, but there are other ways to solve this to balance runtime and memory.

## Two Sum Problem Description

Two Sum gives you an array of integers `nums`, and an integer `target`, and asks for the indices of two numbers which add up to `target`. It also specifies you can assume there's only one solution, and that you can't choose the same element twice, but that you can return the answer in any order.

## Using Nested Loops: The Brute Force Method

One of the things you learn when doing algorithms is that there are many solutions to each question. Some have drawbacks or tradeoffs over other solutions, while other solutions have fewer benefits and should be avoided.

When thinking through Two Sum, one possible solution is to use a nested loop.

In the first loop, we iterate over the `nums` array, and for each `num`, we calculate `complement = target - num`. In the second loop which is nested in the first, we check if the array contains this number and that it is not the same index as the first number. If we find `complement` in the array, we can return `num` and `complement` as our answer.

This solution works, but it has a time complexity of **O(n²) (exponential time)**. This is because using nested loops to scan through an array can result in scanning the array once for each element in the array, or `nums.length × nums.length`. If we consider `nums.length` as `n`, you can see how we get `n²`.

Let's try to solve this problem using a different tool: Hashmaps.

## What is a Hashmap?

A hashmap is a data structure that stors information in key-value pairs. This lets you look up, add or remove data using a unique key. Different languages have different versions of a hashmap. In Python for example, a `dictionary` is a type of hashmap. In TypeScript, you would use a native `Map` or a plain Javascript object: `{}`.

## Using a Hashmap

Hashmaps are an ideal tool for Two Sum because it reduces the time complexity from **O(n²)** to **O(n) (linear time)**. It lets you eliminate the nested loop and use instant look ups. Instead of scanning the array to see if the complement exists, you can ask the hashmap if the complement exists.

For example, imagine creating a map, and then using one loop to iterate through an array. For the first element, we calculate the `complement` as we did using nested loops, then we ask if the map has the complement. If not, then we add the complement to the map as the key, and its index as the value. We continue this process for each element of the array, checking each element to see if its complement exists in the array. If we find it, then we return the current index of the loop, and retreive the index of the complement from the map. This allows you to scan the array in a single pass.

## Complete Solution

Here is what the complete solution using a hashmap looks like:

```ts
/**
 * Solves 2 sum problem using hashmap at O(n) time
 */
function twoSum(nums: number[], target: number): number[] {
  // Holds nums number as key, and it's index as value
  const map = new Map<number, number>();

  for (let i = 0; i < nums.length; i++) {
    // Checks if map contains key equal to target minus nums[i]
    if (map.has(target - nums[i])) {
      // returns found value index, and current loop index
      return [map.get(target - nums[i]), i];
    }

    // Inserts current num value and index into map
    map.set(nums[i], i);
  }

  // Returns empty array if no values found
  return [];
}
```

I added comments that explain what each line does so it is easier to follow.

## Conclusion

There's not much more to say about the Two Sum problem. It is numbered as the first Leetcode problem and is considered an easy problem, but the lesson learned is still valuable.

To summarize, there are more than one way to solve many leetcode problems, and different ways can offer advantages over others. I hope you learned something from this blog, and I will continue to add to my Leetcode series to show how to solve some of my favourite problems.

See you later!
