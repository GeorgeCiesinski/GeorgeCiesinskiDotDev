---
title: "Deciding what should be a Class"
description: ""
date: "2026-10-20"
tags: ["object-oriented programming", "object-oriented design"]
draft: true
---

In my last blog post about Object-oriented Design (OOD), I discussed OOD and Object-oriented Programming (OOP) concepts. In this blog post, I wanted to talk about how to decide which concepts to turn into a class.

## From Requirements to Classes to Objects

Classes are for concepts that have identity, data, and behaviour that should work together. So how do we decide what concepts to turn into a class? We start by understanding the problem. You can do this by breaking the requirement up into components and evaluating each one to determine which are needed for the core functions.

The following sections show one way to do this, but this isn't the only way to decide what should be a class or not.

## 1. Write the requirement in plain English

Example:

> A candidate applies to a role at a company. We store the application, validate that company and role are filled in, and email a follow-up. Later we may schedule an interview.

## 2. Separate the nouns and verbs

Nouns are candidate objects or data; verbs are candidate methods or responsibilities.

| Nouns (things)                                              | Verbs (actions)                         |
| ----------------------------------------------------------- | --------------------------------------- |
| candidate, role, company, application, follow-up, interview | apply, store, validate, email, schedule |

## 3. Filter the nouns

Not every noun requires a class. You need to ask yourself "Is this a real thing in my app, or just a label or piece of data sitting on something else?"

There are four tests you can use to decide, and a good class candidate passes more than one. So pick a noun, and go through each test:

### Identity (entity vs value)

Imagine you had two

### Data that belongs together

### Behaviour

### Lifecycle

## 4. Entities vs Values

## 5. Assigning verbs to Objects

## 6. Sketch responsibilities before code

## 7. A compact decision test

## Conclusion

## Sources

- [Extract Classes from Problem Description](https://darvishdarab.github.io/cs421_f20/docs/readings/classes/)
- [Discovering and Documenting Classes](https://www.cs.odu.edu/~tkennedy/cs330/f24/Public/classification/index.html)
- [A Laboratory for Teaching Object-oriented Thinking](https://c2.com/doc/oopsla89/paper.html)
- [GRASP - Object-oriented Design](<https://en.wikipedia.org/wiki/GRASP_(object-oriented_design)>)
