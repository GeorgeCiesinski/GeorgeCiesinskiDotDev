---
title: "BEM Naming Convention"
description: "Blog post about using the block, element, modifier naming convention."
date: "2026-10-02"
tags: ["convention", "html", "css"]
draft: false
---

One of my common struggles throughout various projects was what kind of naming convention to use for elements. I'm a bit of a stickler when it comes to code convention, or the "right" way of doing things, so I was pleasantly surprised to discover the Block, Element, Modifier (BEM) naming convention. 

## What is BEM

BEM is a popular naming convention for classes in HTML and CSS. It works by splitting the names up into blocks, elements, and modifiers, which can be combined into a complete class name. 

## What are blocks, elements, and modifiers

### Blocks

A block is a top-level abstraction of a component. On my portfolio website, my experience section is a block, so its block name would be `.experience`. These can also contain nested blocks such as `.experience-item` which we still consider as block level abstraction.

*HTML*

```html
<article class="experience-item">
```

*CSS*

```css
.experience-item {
  ...css style
}
```

### Elements

Elements are items that are part of a block. These are shown with a double underscore followed by an element name. This is a part of the `.experience` block, so we name it as an element of that block. Using my site as an example again, a title nested in experience would be `.experience__title`. 

*HTML*

```html
<section class="experience">
  <h2 class="experience__title">Experience</h2>
  <article class="experience-item">
    <div class="experience-item__year">2024</div>
  </article>
</section>
```

### Modifiers

Modifiers modify existing blocks or elements. These are shown with a double dash, so an example of this would be adding the active modifier to an experience item. This would look like `.experience-item--active`. We can add or remove this class with JavaScript to change the styling on the fly when an item is active.

*HTML*

```html
<article class="experience-item experience-item--active">
```

*CSS*

```css
.experience-item--active {
  ...css style
}
```

One of the key takeaways here is that you can add a modifier to a block or element. 

Also worth noting, there are different ways to write modifiers. While I use double dash `--` because I like it, some sources use a single underscore `_` to name modifiers. So my above example modifier would look like `.experience-item_active` instead. 

### BEM Structure

Double-underscore `__` and double-dash `--` encode structure, while single dash is used to join words together in a single part (for example, a block called `experience-item`).

In the DOM, nesting as much as you want is fine: 

```html
<section class="experience">
  <div class="experience__content">
    <article class="experience-item">
      <div class="experience-item__middle">
        <h4 class="experience-item__title">Engineer</h4>
      </div>
    </article>
  </div>
</section>
```

This said, BEM should not mirror the chain in the class string. We don't need to write `.experience__content__item__middle__title`. Each name only encodes one relationship: "This thing belongs to this block". So even though the title is a DOM child of middle, in BEM it is considered a sibling element of middle, and both are parts of `.experience-item`. For this reason, we would call it `.experience-item__title`. 

## Why use BEM?

This convention is useful when working as a team because team members can derive the purpose and ownership of a block. It also makes code easier to maintain, and makes it easier to name elements on the fly instead of wondering if you're giving it a duplicate name. 

Another reason is block independence. A block's CSS shouldn't depend on where it sits in the tree. 

## What to avoid

1. Don't override modifiers in an unrelated component style. Don’t treat `--active` as a shared global class. Prefer a fully namespaced modifier like `.experience-item--active`, and keep its styles with that block — not reused or redefined from unrelated components.

2. Don’t force a new block to be an element of its parent when it can stand alone. An example of this is `.experience-item` which can exist on its own as a block. While it could be an element like `.experience__item`, it doesn't really need to depend on the `.experience` parent and could be it's own block. 

3. Don't make elements of elements. For example, don't name an element `block__item__title`. Instead, create a new block like `block-item` so you can name it's related element `block-item__title`. 

## Sources

- [BEM Info](https://bem.info/en/methodology/naming-convention/)
- [CSS Tricks](https://css-tricks.com/bem-101/)
