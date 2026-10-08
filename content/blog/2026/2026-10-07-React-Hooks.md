---
title: "React Hooks"
description: "Blog post about React Hooks."
date: "2026-10-07"
tags: ["react", "react hooks", "state"]
draft: false
---

In this blog post, I want to talk about react hooks, and the essential built-in hooks. This post is a short overview: what hooks are, the rules for using them, and the essential built-in hooks you'll see most often.

## What is a Hook?

A hook is a mechanism or extension point that allows developers to intercept, modify, or extend the behavior of an existing software system without changing its core source code.

## What are React Hooks

React hooks are React's version of hooks. They are functions that let you use different React features from your components. You can either use built-in react hooks like `useState()`, or build your own custom hooks. These functions are usually named `useSomething()` with the `use` prefix, and are called inside a React function component, or inside another custom hook.

### React Hook Rules

1. Only call a hook at the top level of a component or custom hook. Don't call hooks inside of loops, conditions, try/catch blocks or nested functions.
2. Only call a hook from a React function component or another hook. This ensures all stateful logic in a component is clearly visible from its source code.

## Essential React Hooks

Below, I briefly describe the different essential react hooks and their purpose.

### useState()

`useState()` lets a component remember a value across renders and re-render when the value changes. For example, if the user types in a search box, you store the string in state so the input (and any UI that depends on it) stays in sync. Updating state with the setter is how the component reacts to user interaction over time.

You would use `useState()` for values that should drive what the UI shows, so updates re-render on purpose.

### useEffect()

`useEffect()` lets you run side effects after render, allowing you to specify what should happen in response to the rendered UI, or to sync with something outside React. For example, you could subscribe to scroll, listen for theme changes, or fetch data. `useEffect()` re-runs when its dependency list changes, and effects often return a cleanup function so subscriptions and timers don’t leak when the component updates or unmounts.

Effects are primarily used to connect and synchronize with external systems. This includes dealing with network, browser DOM, widgets from another UI library, or non-React code.

### useContext()

`useContext()` lets a component read a value from the nearest React context provider above it in the tree. That avoids passing the same props through many intermediate components (prop drilling). For example, a theme provider can hold the current preference, and any descendant can read or update it with a hook backed by `useContext()`.

### useRef()

`useRef()` holds a mutable value that persists across renders without causing a re-render when it changes. The usual case is storing a DOM node. For example a canvas or a `<pre>` can be stored so that you can read or update it in an event handler or effect. Unlike state, changing `ref.current` does not update the UI by itself.

You would use `useRef()` instead of `useState()` when the value must persist across renders, but changing it should not redraw the UI. DOM nodes are a classic case as you may need a handle to the element, and may not want to re-render every time the handle updates.

## Custom Hooks

You can write your own custom hooks to compose built-in hooks, or reuse logic. Though it isn't listed as a rule in the docs, you should name custom hooks `use_____()` to stick closer to the React hook naming convention.

An important detail worth noting is that using the `use` prefix allows the linter to enforce the Rules of hooks.

## Linting

You can use `eslint-plugin-react-hooks` to provide ESLint with rules to enforce the Rules of React. This is a key plugin if you use ESLint and makes development much smoother, ensuring you stick to good practices as much as possible.

## Conclusion

To summarize, hooks are a pretty important part of using React. Some of the essential built-in hooks are required to add state to React apps, and many of the most important React features are used by hooks.

React also has more built-in hooks such as `useReducer()` and `useMemo()`. I will be going into more details about how to use these and the essential built-in hooks in future blog posts, so make sure to check them out when I publish them!

## Sources

- [Rules of React](https://react.dev/reference/rules)
- [Built-in React Hooks](https://react.dev/reference/react/hooks)
- [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)
- [ESLint Plugin React Hooks](https://react.dev/reference/eslint-plugin-react-hooks)
