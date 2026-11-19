---
title: "Object Oriented Design"
description: "An introduction to object-oriented design — classes, the core OOD concepts, design patterns, UML, and common pitfalls — as a foundation for writing maintainable software."
date: "2026-10-19"
tags: ["object-oriented programming", "object-oriented design", "python"]
draft: true
---

After writing my previous blog about [SOLID design principles](/blog/2026-10-17-solid-design-principles), I wanted to continue exploring Object-oriented Design (OOD) in a new post.

Today, I want to explore the core OOD concepts, design patterns, and more.

## What is Object-Oriented Design (OOD)?

Object-oriented design is the thinking & design used to solve software problems and to design system architecture that is modular, adaptable, clear, and easy to maintain.

It makes use of concepts such as classes and objects, inheritance, encapsulation, polymorphism, and more. I'll go into more detail about these concepts.

## Object-oriented Design vs Object-oriented Programming

Object-oriented Design (OOD) is the thinking behind the code. It mainly involves thinking about the problem or app, and deciding what concepts should be objects, what each object is responsible for, how they talk to each other, whether to use inheritance or composition. Another thing to plan is what should stay hidden (encapsulation) vs what should be exposed as a contract (abstraction). OOD models the problem as collaborating objects (state + behavior + responsibilities), not as a list of steps. You can think of it as the blueprint.

Object-oriented Programming (OOP) is a paradigm: a way of writing code using classes, objects, methods, inheritance, and so on. Think of it as the toolbox used to build the design. Without OOD, you can write lots of classes and still have weak design.

Both OOD and OOP share the idea of classes, inheritance, and polymorphism. The main difference is OOD decides whether/how to use those ideas, while OOP is using them in code.

## Classes and Objects

A class is a blueprint for a kind of thing in the design: what data it holds, and what it does.

**Note:** I know I used blueprint to describe OOD previously, but think of **OOD** as a conceptual blueprint for the app or code, while a **class** is code that serves as a blueprint for creating new objects.

In code, that's attributes (data), methods (behaviour), and a constructor (`__init__` used to set up a new instance).

```python
class JobApplication:  # class — the recipe
    def __init__(self, company: str, role: str):
        self.company = company
        self.role = role
```

An object is an instance of a class. You can have more than one instance of a class. The shape is the same (company & role), but the data is different. In the below example `app1` and `app2` are both instances of the `JobApplication` class.

```python
app1 = JobApplication("Acme", "Backend Engineer")    # object
app2 = JobApplication("Globex", "QA Engineer")
```

### Identity vs Equality

Identity asks: is this the same object (`is` in python).

```python
app1 = JobApplication("Acme", "Backend Engineer")
app2 = JobApplication("Acme", "Backend Engineer")
app3 = app1

app1 is app2  # False — two objects in memory
app1 is app3  # True  — same object, two names
```

Equality asks "do these count as the same value (`==` in python)?"

```python
app1 == app2  # False unless we define __eq__
              # By default, == for our class often means the same as is
```

**Note:** `__eq__` is the method Python calls when you write `==`. It means "equals", and it tells Python how to determine if two separate objects are equal. You would use this to define conditions that compare the value of their attributes.

Strings compare text instead, so using equality checks if the string value is the same:

```python
a = "Acme"
b = "Acme"
a == b  # True — same text
```

### Mutable vs Immutable

A mutable object can change while remaining the same object. Let's say someone changes their name legally. A mutable object allows you to change the value of an attribute:

```python
employee.name = "New Name"
```

An immutable object can't be edited in place. A string, number or tuple are replaced, not modified:

```python
"Acme".upper()      # Returns a new string. "Acme" stays in memory as "Acme".

company = "Acme 2"  # Rebinds a new string to the company attribute
```

## Encapsulation

Encapsulation describes bundling data and methods operating on the data into one unit, while hiding internal state & representation so other code can't break the object's invariants. Invariants are rules that must always stay true. The public surface is a small set of meaningful operations, not the object's fields.

Getters and setters are not enough on their own. If callers can still write attributes, the internals have leaked and the rules live outside the object. 

```python
def get_status(self):
    return self._status
def set_status(self, status):
    self._status = status
```

Outside code can still do something like `app.set_status("hired")`, so the object does not own the rules, callers do. This only adds extra methods around the same data.

Real encapsulation looks like this: 

```python
class JobApplication:
    _ALLOWED = {
        "draft": {"submitted", "rejected"},
        "submitted": {"rejected"},
        "rejected": set(),
    }

    def __init__(self, company: str, role: str):
        self._company = company
        self._role = role
        self._status = "draft"

    def submit(self):
        if self._status != "draft":
            raise ValueError("Already submitted")
        self._move_to("submitted")

    def reject(self) -> None:
        self._move_to("rejected")

    def _move_to(self, new_status: str) -> None:
        if new_status not in self._ALLOWED[self._status]:
            raise ValueError(f"Cannot go from {self._status} to {new_status}")
        self._status = new_status
```

So callers write `app.submit()` and the object decides if it is legal and sets the private variable. Notice how the caller doesn't need to know the `_status` field exists. 

```python
app = JobApplication("Acme", "Backend Engineer")
app.submit()  # ok
app.submit()  # raises — already submitted
```

**Note:** Java and C# have access modifiers. Python relies on convention instead: names starting with `_` are treated as private, though it's up to developers to recognize and practice this. 

## Abstraction

Abstraction means showing the essential behaviour while hiding the implementation details. Callers depend on what something does, not how. 

This is related to encapsulation, but they're not the same thing. Encapsulation keeps one object's data and rules private, while Abstraction is the public contract other code programs against. For example, "something that can send a status update" without caring whether this means email, SMS, etc. 

In Python, this often looks like an abstract base class. 

```python
from abc import ABC, abstractmethod

class StatusChannel(ABC):
  @abstractmethod
  def send(self, message: str) -> None:
    ...

class EmailChannel(StatusChannel):
    def send(self, message: str) -> None:
        print(f"[email] {message}")

class SlackChannel(StatusChannel):
    def send(self, message: str) -> None:
        print(f"[slack] {message}")

def notify(channel: StatusChannel, message: str) -> None:
    channel.send(message)  # depends on the contract, not Email vs Slack
```

In this example, `notify()` only needs a channel that can `send()`. It doesn't need to know about SMTP, webhooks, or which class you passed in. This design rule is often phrased as: program to an interface, not an implementation. 

**Note:** Java and C# have formal interface types. Python usually uses ABC + @abstractmethod for the same idea. Python also supports duck typing and typing.Protocol: if it has a send method, it can act as a channel, even without inheriting from StatusChannel. 

## Inheritance

Explain “is-a” relationships, code reuse through parent/child classes, and when inheritance helps vs when it creates fragile hierarchies. Worth noting that more inheritance is not always better.

**Beyond the source:** Fragile base class problem, and preferring shallow hierarchies.

## Polymorphism

Explain same interface, different behavior (e.g. calling `send()` on different channel types). This is what makes interchangeable objects and many design patterns work. Tie lightly to how you already used this idea in your SOLID post.

## Composition

Explain “has-a” / building objects from other objects instead of only subclassing. Cover why composition is often preferred for flexibility (your notifier holding channels is a good mental model). Contrast **inheritance vs composition** in one place so readers know when to reach for which.

## Object Relationships

**Beyond the source:** The GFG piece jumps to composition without the full relationship map. Cover briefly:

- **Association** — objects know about each other
- **Aggregation** — “has-a” with independent lifecycles (weaker ownership)
- **Composition** — “has-a” with strong ownership / shared lifecycle

Enough to read UML and talk clearly in interviews; don’t over-philosophize the aggregation debate.

## Coupling and Cohesion

**Beyond the source:** Two metrics that explain _why_ OOD advice exists:

- **High cohesion** — a class’s parts belong together (one clear purpose)
- **Low coupling** — classes don’t need deep knowledge of each other’s internals

These connect naturally to SRP/DIP later.

## Collaboration and Message Passing

**Beyond the source:** Objects don’t just “exist” — they collaborate by sending messages (calling methods). Cover simple interaction styles and one guideline worth knowing:

- **Tell, Don’t Ask** — tell an object to do work rather than pulling its data and deciding outside
- **Law of Demeter** (“don’t talk to strangers”) — avoid long chains like `a.b().c().d()` that couple you to deep structure

## How These Concepts Work Together

A short synthesis: encapsulation protects state, abstraction defines contracts, inheritance/polymorphism enable variation, composition assembles systems. Optional: one small end-to-end sketch that uses more than one concept at once.

## GRASP (Responsibility Assignment)

**Beyond the source:** GRASP is a useful companion to SOLID for _who should own which method_. Skim, don’t master all of them. Highest value ones:

- Information Expert
- Creator
- Controller
- Low Coupling / High Cohesion
- Polymorphism (as a responsibility guideline)

Frame as “questions to ask when placing behavior,” not another acronym checklist.

## Design Patterns (Overview)

You don’t need deep implementations of every pattern. Focus on _what problem each category solves_ and 1–2 examples per category:

- **Creational** (how objects are created) — e.g. Singleton, Factory Method
- **Structural** (how objects are composed) — e.g. Adapter, Composite
- **Behavioral** (how objects communicate) — e.g. Observer, Strategy

Emphasize patterns as reusable design vocabulary, not mandatory templates.

**Beyond the source:** Dependency Injection as a practical technique (passing collaborators in) — related to DIP, very common in real codebases. Caution on Singleton overuse.

## UML for Visualizing Design

Cover why diagrams help communicate structure before/with code. Prioritize what interviewers and teams actually use:

- **Class diagrams** — classes, attributes, relationships
- **Sequence diagrams** — interactions over time
- **State diagrams** — object lifecycle / transitions

Aim for “read and sketch simply,” not full UML mastery.

**Beyond the source:** How to mark association / inheritance / composition on a class diagram; one tiny “problem → class diagram → code” walkthrough.

## Designing for Change and Testability

**Beyond the source:** Good OOD makes change and testing easier. Cover briefly:

- Seams where you can substitute fakes/mocks (interfaces, injected dependencies)
- Why hard-wired globals and deep constructors hurt tests
- YAGNI vs premature abstraction — design for today’s needs with room to grow

## Common Challenges and Anti-Patterns

Learn the failure modes so you can spot them in your own code:

- Challenges: over-engineering for hypothetical futures, rigid designs that can’t change, wrong level of abstraction
- Anti-patterns: God Object, spaghetti code, lava flow (dead leftover design), excessive coupling / “object orgy”

For each, know the symptom and a practical mitigation (often ties back to SOLID).

**Beyond the source:** Anemic domain model (objects that are only data bags with all logic elsewhere), and feature envy (a method more interested in another class’s data than its own).

### The God object (or God class) anti-pattern

The God object anti-pattern is when you build one class that knows and does too much. Instead of many objects with clear jobs, you get one mega-class that holds lots of unrelated data, implements most of the behavior, and has to talk to other code constantly.

This is an extreme version of violating SRP (which I discussed in my SOLID design principles blog post).

An example of this might look like:

```python
class JobSystem:
    def validate_application(self): ...
    def save_application(self): ...
    def send_email(self): ...
    def schedule_interview(self): ...
    def score_resume(self): ...
    def generate_offer(self): ...
    def update_payroll(self): ...
    def render_dashboard(self): ...
```

So this class handles validation, saving data, sending emails, scoring resumes, and more.

This class is hard to change, hard to test, and is coupled tightly to everything that uses it. It also causes problems like merge conflicts during collaboration because the whole team has to edit one class.

To fix it, split it the way SRP suggests: validation, storage, email, payroll, and UI each get their own type (or module), so no single class runs the whole hiring system.

## How OOD Relates to SOLID

Bridge to your SOLID post: OOD concepts are the building blocks; SOLID principles are guidelines for using those blocks well. Keep this short and point readers to the SOLID article for deep dives.

## Glossary

A few terms used throughout this post:

- **Class:**
- **Object:**

## Conclusion

Summarize the mental model you want readers to leave with: find the right objects and responsibilities, connect them with clear relationships and low coupling, visualize when helpful, and watch for common anti-patterns.

## Sources

- [GeeksforGeeks - Object-Oriented Design](https://www.geeksforgeeks.org/system-design/oops-object-oriented-design/)
- [OOP vs OOD](https://dev.to/naweli_verma/oop-vs-ood-gnp)
- [The God Object](https://dilankam.medium.com/the-god-object-anti-pattern-in-software-architecture-b2b7782d6997)
- [Stackify - What is Encapsulation](https://stackify.com/oop-concept-for-beginners-what-is-encapsulation/)
- [Stackify - Abstraction in Programming](https://stackify.com/oop-concept-abstraction/)
