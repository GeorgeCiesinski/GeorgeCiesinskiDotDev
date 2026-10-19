---
title: "SOLID Design Principles"
description: "A practical walkthrough of SOLID with Python examples — SRP, OCP, LSP, ISP, and DIP — explained through a job-application domain."
date: "2026-10-17"
tags: ["object-oriented programming", "object-oriented design"]
draft: true
---

I wanted to write this blog post by expanding my knowledge about SOLID design principles. In my search for work, I noticed that a lot of job postings emphasize SOLID design principles. While this is not a new concept to me, I wanted to better understand it.

In this blog, I'm also going to use more Python code examples as my blogs typically use JavaScript examples and I want to broaden this a bit.

If any OOP terms feel unfamiliar as you read (interface, abstraction, inheritance, and so on), there’s a [Glossary](#glossary) at the end you can jump to and come back from.

## What is SOLID?

SOLID is an acronym for the first five object-oriented design (OOD) principles. The complete acronym stands for:

- **S** - Single-responsibility Principle
- **O** - Open-closed Principle
- **L** - Liskov Substitution Principle
- **I** - Interface Segregation Principle
- **D** - Dependency Inversion Principle

I'll get more into each of these further into the blog post.

## Who came up with SOLID?

The underlying design principles were popularized by Robert C. Martin (Uncle Bob). The **SOLID** acronym itself was coined later by Michael Feathers as a handy way to remember the five principles together. If you're like me and are hearing about Uncle Bob for the first time, he's a prolific software engineer and author who has been publishing programming books for many decades.

## 1. Single-Responsibility Principle (SRP)

This principle states:

> A class should have one and only one reason to change, meaning that a class should have only one job.

To go into a bit more detail, this means a class should have a single responsibility, job, or purpose within a software system. Teaching materials often treat “one reason to change” and “one job” as the same idea. In stricter readings, “reason to change” is about *who* or *what force* would cause the class to change (for example, a change in validation rules vs. a change in email delivery). For this post, the practical takeaway is still: don’t pile unrelated jobs into one class.

I like the example used in the GeeksforGeeks article. The author used an analogy of a baker baking bread. The baker's job is strictly to bake bread that meets the quality and standards required by the bakery. If the baker also provides customer service or finance, this violates the SRP.

But what about a code example? Let's start with an example of code violating the SRP:

```python
class JobApplication:
    def __init__(self, company: str, role: str, notes: str):
        self.company = company
        self.role = role
        self.notes = notes

    def validate(self) -> None:
        if not self.company or not self.role:
            raise ValueError("Company and role are required")

    def save(self) -> None:
        # persists to a database / file
        print(f"Saving application for {self.role} at {self.company}")

    def send_follow_up(self) -> None:
        # emails a reminder
        print(f"Emailing follow-up for {self.company}")
```

In the above example, the `JobApplication` class is doing three jobs: validation, storage, and email delivery. We need to change this class when any of these three jobs need to change.

So how can we align it with the first principle? We could instead create a new class for each of these jobs.

```python
class JobApplication:
    def __init__(self, company: str, role: str, notes: str):
        self.company = company
        self.role = role
        self.notes = notes


class ApplicationValidator:
    def validate(self, application: JobApplication) -> None:
        if not application.company or not application.role:
            raise ValueError("Company and role are required")


class ApplicationRepository:
    def save(self, application: JobApplication) -> None:
        print(f"Saving application for {application.role} at {application.company}")


class FollowUpNotifier:
    def send(self, application: JobApplication) -> None:
        print(f"Emailing follow-up for {application.company}")


def main() -> None:
    application = JobApplication("Acme", "Backend Engineer", "Referred by Sam")
    ApplicationValidator().validate(application)
    ApplicationRepository().save(application)
    FollowUpNotifier().send(application)


if __name__ == "__main__":
    main()
```

By adding `ApplicationValidator`, `ApplicationRepository`, and `FollowUpNotifier` classes, we've aligned our code to the Single-responsibility Principle, and we only need to change a single class whenever we need to make a change to its specific job.

## 2. Open-closed Principle (OCP)

The Open-closed Principle states:

> Objects or entities should be open for extension but closed for modification.

This means we should write our class so that we're able to extend it without modifying it.

Modification in this case means changing existing, already-working code such as methods, `elif` branches, etc. Whenever you do this, you risk breaking callers and having to update or re-run tests.

Extension means adding a new behavior alongside the existing code. This could mean a new class, module, or implementation of an interface, without rewriting the existing code.

OCP is a goal to strive for when writing code. When requirements grow, prefer adding something new over changing existing code.

Let's start with a bad example, and then fix it:

```python
class ApplicationStatusNotifier:
    def notify(self, company: str, status: str, channel: str) -> None:
        message = f"Your application at {company} is now: {status}"

        if channel == "email":
            print(f"[email] {message}")
        elif channel == "sms":
            print(f"[sms] {message}")
        elif channel == "slack":
            print(f"[slack] {message}")
        else:
            raise ValueError(f"Unknown channel: {channel}")
```

In the above example, we would have to edit this class again to add LinkedIn, Discord, or another notification method.

So how can we fix this? We can write an abstract base class that requires a `send` method, then create subclasses that each implement `send` for a different channel.

```python
from abc import ABC, abstractmethod


class StatusChannel(ABC):
    @abstractmethod  # subclasses must implement send
    def send(self, message: str) -> None:
        pass


class EmailChannel(StatusChannel):
    def send(self, message: str) -> None:
        print(f"[email] {message}")


class SmsChannel(StatusChannel):
    def send(self, message: str) -> None:
        print(f"[sms] {message}")


class SlackChannel(StatusChannel):
    def send(self, message: str) -> None:
        print(f"[slack] {message}")


class ApplicationStatusNotifier:
    def __init__(self, channels: list[StatusChannel]) -> None:
        self._channels = channels

    def notify(self, company: str, status: str) -> None:
        message = f"Your application at {company} is now: {status}"
        for channel in self._channels:
            channel.send(message)


# Later, add a new channel without touching ApplicationStatusNotifier:
class LinkedInChannel(StatusChannel):
    def send(self, message: str) -> None:
        print(f"[linkedin] {message}")


def main() -> None:
    notifier = ApplicationStatusNotifier(
        [EmailChannel(), SlackChannel(), LinkedInChannel()]
    )
    notifier.notify("Acme", "Interview scheduled")


if __name__ == "__main__":
    main()
```

`ApplicationStatusNotifier` stays closed. You don't have to reopen it for each new channel. New behavior instead comes from implementations of the abstract base class `StatusChannel`. The notifier doesn’t inherit from the channels, it holds a list of them and calls `send` on each. That’s why adding `LinkedInChannel` doesn’t require changing `ApplicationStatusNotifier`.

A quick note on the Python pieces: `abc` is part of the standard library. `StatusChannel(ABC)` is a blueprint, not a finished channel. You shouldn’t instantiate it directly (`StatusChannel()` raises a `TypeError`). `@abstractmethod` marks `send` as required: any concrete subclass must implement it, or Python won’t let you create instances of that class either. The `pass` in `StatusChannel.send` is intentional: the base class only defines the contract, not the behavior. That shared contract is why the notifier can stay closed while new channels are added as new classes.

## 3. Liskov Substitution Principle (LSP)

LSP was introduced by Barbara Liskov in 1987.

This principle states:

> Let ⁠ϕ(x) be a property provable about objects ⁠x of type T. Then ⁠ϕ(y) should be true for objects ⁠y of type S where S is a subtype of T.

This sentence seems complicated but it is simpler than you think. It means every subclass or derived class should be substitutable for their base/parent class. This ensures any subclass can be used in place of its parent class without causing unexpected behavior in the program.

GeeksforGeeks shows a classic example of this principle using a rectangle and square. A rectangle has four sides, and its height and width can be any value. A square is a rectangle with equal height and width, so we should be able to extend the properties of the rectangle class into the square class without violating LSP, right? **Wrong**. The issue here is that a square forces constraints (equal height & width) which don't apply to a rectangle, which changes the expected behavior of the parent class and violates LSP.

To explain further, let's start with a bad example:

```python
from abc import ABC, abstractmethod


class InterviewFormat(ABC):
    @abstractmethod
    def describe(self) -> str:
        pass

    @abstractmethod
    def duration_minutes(self) -> int:
        """Return how long the live interview lasts."""
        pass


class PhoneScreen(InterviewFormat):
    def describe(self) -> str:
        return "Phone screen"

    def duration_minutes(self) -> int:
        return 30


class OnsiteLoop(InterviewFormat):
    def describe(self) -> str:
        return "Onsite loop"

    def duration_minutes(self) -> int:
        return 240


class TakeHome(InterviewFormat):
    def describe(self) -> str:
        return "Take-home assignment"

    def duration_minutes(self) -> int:
        # Breaks the promise: callers expect an int duration
        raise NotImplementedError("Take-homes have no live duration")


def print_agenda(interview: InterviewFormat) -> None:
    print(f"{interview.describe()} — {interview.duration_minutes()} minutes")


def main() -> None:
    interviews: list[InterviewFormat] = [
        PhoneScreen(),
        OnsiteLoop(),
        TakeHome(),  # substituting this blows up
    ]
    for interview in interviews:
        print_agenda(interview)


if __name__ == "__main__":
    main()
```

In the above example, `print_agenda` is written for `InterviewFormat`. `PhoneScreen` and `OnsiteLoop` are good subclasses, while `TakeHome` is not. It inherits the type, but refuses the method's meaning. To be clear, `TakeHome` cannot safely substitute for `InterviewFormat` anywhere that code relies on `duration_minutes()` returning an `int`.

One way to fix it is to separate `TakeHome` into a separate class:

```python
from abc import ABC, abstractmethod


class LiveInterview(ABC):
    @abstractmethod
    def describe(self) -> str:
        pass

    @abstractmethod
    def duration_minutes(self) -> int:
        pass


class PhoneScreen(LiveInterview):
    def describe(self) -> str:
        return "Phone screen"

    def duration_minutes(self) -> int:
        return 30


class OnsiteLoop(LiveInterview):
    def describe(self) -> str:
        return "Onsite loop"

    def duration_minutes(self) -> int:
        return 240


class TakeHomeAssignment:
    def describe(self) -> str:
        return "Take-home assignment"

    def expected_hours(self) -> int:
        return 4


def print_agenda(interview: LiveInterview) -> None:
    print(f"{interview.describe()} — {interview.duration_minutes()} minutes")


def main() -> None:
    live_interviews: list[LiveInterview] = [PhoneScreen(), OnsiteLoop()]
    for interview in live_interviews:
        print_agenda(interview)

    take_home = TakeHomeAssignment()
    print(f"{take_home.describe()} — ~{take_home.expected_hours()} hours")


if __name__ == "__main__":
    main()
```

In the above example, we instead created a new class for `TakeHomeAssignment`, and this has an `expected_hours` method instead of `duration_minutes`.

This is one option to fix the problem. Another option is to share a weaker parent. For example, we can create a broader type like `Assessment` with `describe()` only, and create `LiveInterview` and `TakeHomeAssignment` as subtypes of `Assessment`. `LiveInterview(Assessment)` would add `duration_minutes()`, while `TakeHomeAssignment(Assessment)` would add `expected_hours()` instead.

As you can see, there are different ways to solve the issue, as long as the solution satisfies LSP.

**Note:** While it's not at all relevant to the blog, LSP also happens to refer to Lumpy Space Princess from Adventure Time. This sassy hilarious character is branded into my mind, so it's the first thing I think whenever I hear LSP.

## 4. Interface Segregation Principle (ISP)

This principle states:

> A client should never be forced to implement an interface that it doesn’t use, or clients shouldn’t be forced to depend on methods they do not use.

This principle applies to interfaces and is similar to the Single-responsibility Principle, with the goal of keeping interfaces specific and well-defined.

In short, clients should not be forced to depend on methods that are irrelevant to them, avoiding unnecessary dependencies. This helps prevent fat interfaces by using multiple small, client-specific interfaces, each with a clear and specific responsibility.

GeeksforGeeks uses an example of a vegetarian going to a restaurant. The waiter gives them a menu with vegetarian items, non-vegetarian items, drinks and sweets. In code, this violates ISP because the customer should receive a menu relevant to their needs instead of a generic menu with unnecessary items. Splitting the menu into smaller, specific ones reduces unnecessary dependencies and makes it easier to maintain.

Let's consider a bad example:

```python
from abc import ABC, abstractmethod


class JobCandidate(ABC):
    @abstractmethod
    def apply(self, role: str) -> None:
        ...

    @abstractmethod
    def schedule_interview(self, slot: str) -> None:
        ...

    @abstractmethod
    def accept_offer(self) -> None:
        ...


class ReferralLead(JobCandidate):
    def apply(self, role: str) -> None:
        print(f"Referral applied to {role}")

    def schedule_interview(self, slot: str) -> None:
        raise NotImplementedError

    def accept_offer(self) -> None:
        raise NotImplementedError
```

In the above example, `JobCandidate` bundles three unrelated capabilities into one interface: apply, schedule interview, and accept offer, and you need to complete all three to be a `JobCandidate`. `ReferralLead` only applies, so it has no interview-booking or offer-acceptance behavior in this flow. Python still requires these methods, so we stub them with `NotImplementedError`.

This is bad because the class is tied to methods it doesn't use, which violates ISP. It also lies to callers, and anything typed as `JobCandidate` looks like it can `schedule_interview()` and `accept_offer()`. If you later add another method to `JobCandidate`, every implementer must change, including types that don’t care about that method.

You may notice `NotImplementedError` also showed up in the LSP example. The symptom can look similar, but the root causes differ: LSP is about a subtype breaking the parent’s promise, while ISP is about a fat interface forcing a class to stub methods it never needed.

In short, it's one oversized interface that forces every candidate type to pretend it supports the full hiring process.

We can fix this by replacing it with smaller interfaces so that subclasses can implement what they use:

```python
from abc import ABC, abstractmethod


class CanApply(ABC):
    @abstractmethod
    def apply(self, role: str) -> None:
        ...


class CanInterview(ABC):
    @abstractmethod
    def schedule_interview(self, slot: str) -> None:
        ...


class CanAcceptOffer(ABC):
    @abstractmethod
    def accept_offer(self) -> None:
        ...


class ReferralLead(CanApply):
    def apply(self, role: str) -> None:
        print(f"Referral applied to {role}")


class HumanApplicant(CanApply, CanInterview, CanAcceptOffer):
    def apply(self, role: str) -> None:
        print(f"Applied to {role}")

    def schedule_interview(self, slot: str) -> None:
        print(f"Interview booked for {slot}")

    def accept_offer(self) -> None:
        print("Offer accepted")
```

In the above example, `ReferralLead` is a subtype of `CanApply` and only has to implement the `apply()` method. `HumanApplicant` opts into all three interfaces and implements each, because it actually uses apply, interview scheduling, and offer acceptance.

## 5. Dependency Inversion Principle (DIP)

This principle states:

> Entities must depend on abstractions, not on concretions. It states that the high-level module must not depend on the low-level module, but they should depend on abstractions.

To clarify this further, it means that big parts of your program should not directly depend on small, detailed parts. Instead, both should depend on general ideas, aka "interfaces". Abstractions should not depend on details. Details should depend on abstractions. This allows for more flexible and decoupled code, making it easier to change implementations without affecting other parts of the codebase.

This one took me a bit to wrap my head around, so let's go into more detail. Let's recall the `ApplicationStatusNotifier` from the example in OCP:

```python
# Without DIP: depends on a concrete detail
class ApplicationStatusNotifier:
    def notify(self, company: str, status: str) -> None:
        EmailChannel().send(f"...{company}...{status}")


# With DIP: depends on the contract; detail is passed in
class ApplicationStatusNotifier:
    def __init__(self, channel: StatusChannel) -> None:
        self._channel = channel

    def notify(self, company: str, status: str) -> None:
        self._channel.send(f"...{company}...{status}")
```

In the normal/old way, **Boss Class** directly uses a **specific tool**. For example, a Notifier uses Email.

In the **inverted** way (using DIP), **Boss Class** needs a **job description**. **Specific tools** apply for that job.

In the above example, the **Boss** is `ApplicationStatusNotifier`, the **job description** is `StatusChannel` (`send()`), and the **specific tools** are `EmailChannel`, `SlackChannel`, etc. We pass the tool in from outside instead of building email into the notifier:

```python
notifier = ApplicationStatusNotifier(EmailChannel())
# or
notifier = ApplicationStatusNotifier(SlackChannel())
```

OCP was about adding channels without editing the notifier. DIP is about not hard-wiring a concrete channel into the notifier in the first place — the notifier depends on `StatusChannel`, not on `EmailChannel` itself.

## Conclusion

SOLID isn’t a checklist you apply blindly to every class, but it is a useful set of questions to ask while designing and reviewing code, especially as requirements grow and more people touch the same codebase.

In short:

- **SRP** — Give a class one job (and one main reason to change).
- **OCP** — Prefer adding new code over repeatedly editing settled code.
- **LSP** — Subtypes must honor the parent’s promises so they can be used safely in its place.
- **ISP** — Keep interfaces small so clients aren’t forced to depend on methods they don’t use.
- **DIP** — Depend on contracts (abstractions), and plug concrete tools in from the outside.

Some of these principles overlap in practice. The notifier example shows that clearly: the same design can support **OCP** (add a channel without editing the notifier) and **DIP** (depend on `StatusChannel`, not `EmailChannel`). That’s okay! The principles all have the same goal: to create code that’s easier to change without breaking everything around it.

I’m still building intuition for these, especially DIP, but writing this out helped me expand my understanding a lot.

If you’re studying for interviews or cleaning up a project, trying a small before/after example in a domain you care about (job applications, blogs, APIs) is a good way to make SOLID feel less abstract.

## Glossary

A few terms used throughout this post:

- **Interface:** A contract that describes what something can do, without saying how it does it. In Python, this often looks like an abstract base class (for example, `StatusChannel` with a required `send()` method). Callers depend on the contract; implementations fill in the details.
- **Abstraction:** A general idea that hides messy details behind a simpler shape. `StatusChannel` is an abstraction: “something that can send a message.” You don’t need to know whether that means email, SMS, or Slack to use it.
- **Concretion:** A specific, working implementation of an abstraction. `EmailChannel` and `SlackChannel` are concretions — real classes with real behavior, not just a blueprint.
- **High-level module:** The “big idea” or policy part of the program — the code that decides *what* should happen. In the notifier example, `ApplicationStatusNotifier` is high-level: its job is “notify about an application status,” not “talk to Gmail’s servers.”
- **Low-level module:** The detailed “how” — concrete tools and infrastructure like sending email over SMTP, posting to Slack, or writing to a database. These plug into high-level code through abstractions instead of being hard-wired into it.
- **Inheritance / subclass:** Creating a new class from an existing one so it can reuse or specialize that behavior. `EmailChannel` is a subclass of `StatusChannel` — it inherits the “is a status channel” relationship and implements `send()` in its own way.
- **Abstract base class (ABC):** Python’s common way to write an interface/blueprint. You inherit from `ABC` and mark required methods with `@abstractmethod`. You typically don’t instantiate the ABC itself; subclasses provide the real implementations.
- **Composition:** Building behavior by *having* other objects rather than *being* a subtype of them. `ApplicationStatusNotifier` doesn’t inherit from `EmailChannel` — it holds a list of `StatusChannel`s and calls `send()` on each.

## Sources

- [DigitalOcean - SOLID Design Principles](https://www.digitalocean.com/community/conceptual-articles/s-o-l-i-d-the-first-five-principles-of-object-oriented-design)
- [GeeksforGeeks - Solid Principles](https://www.geeksforgeeks.org/system-design/solid-principle-in-programming-understand-with-real-life-examples/)
