---
title: "Auditing and Resolving Google Lighthouse Issues with AI"
description: "Blog post about resolving performance and accessibility bugs with AI."
date: "2026-10-14"
tags: ["google lighthouse", "accessibility", "performance", "artificial intelligence"]
draft: false
---

Oh man, times feel like they've changed. In the past, I remember the pain of finding and resolving accessibility issues with your web apps manually. These days with AI tools, the process is a lot simpler. 

In this blog post, I want to talk about auditing your website with Google Lighthouse for performance and accessibility issues. 

## What is Google Lighthouse

Google Lighthouse is an open-source automated tool that audits your websites for different kinds of performance, accessibility, and seo problems. It also evaluates your site for best practices.

This tool lets you navigate to a page and automate a series of tests. Performance tests check things like image optimization, code minification, and all sorts of other things that can affect how long pages load in desktop and mobile. It can also flag issues with SEO, such as a missing `robots.txt` file, or inaccurate meta tags. As someone who built websites for a post-secondary institution, one of its most useful features to me is the accessibility audit which flags issues that affect how easily people with different needs can access your site. This can include issues with contrast, or missing aria. 

## Auditing your Website with Google Lighthouse

Google Lighthouse is fast and easy to use. It is built in to the Google Chrome Devtools which you can access by clicking the 3 dots on the right side of the window, clicking more tools, then developer tools. 

### Opening Google Lighthouse

Once the dev tools open, you will see tabs like `Elements`, `Console` and `sources` at the top. If you keep looking through the tabs, you will find a `Lighthouse` option. Click this to open the Lighthouse control panel. 

### Configuring Google Lighthouse

From here, navigate to the page you want to test, and configure as below: 

- For the mode, leave the default `Navigation` setting. 
- Device shows Mobile and Desktop. I personally run both on each page as each reveals problems that can affect either mobile or desktop devices. 
- For categories, leave all the default checkmarks. If you want, you can check `Agentic browsing` if you want to test this too.

Finally, click `Analyze page load`, which should take less than a minute. 

### Understanding the Score and Report

Once it is finished, Lighthouse will calculate scores for 4 categories: Performance, Accessibility, Best Practices, and SEO. If the scores show 100, then congrats, Lighthouse found no problems with your site, however the report will also inform you that there are things Lighthouse can't test, and manual testing is still heavily encouraged, especially for interactive elements. 

Sometimes, one or more of the 4 categories shows a score lower than 100. If you click this score value, it will scroll the report down to the appropriate section and summarize the list of problems, as well as the elements or scripts causing the problem. This is amazing because you can see exactly which photo has optimization issues, or which link has the wrong aria. 

You can also print the report by clicking the 3 dots in the toolbar above the 4 category scores, then clicking `Print Summary`. You can either print this out, or save it as a PDF you can work through. 

### Auditing Basics

Google Lighthouse analyzes the current page, not every possible page on the site. In order to get a thorough audit of your site, you need to perform multiple tests: 

- Each page template on the site: home page, article pages, or any other pages that generate from unique templates
- Repeat these tests for each theme you have. Your dark mode theme may be fully accessible, but light mode might have contrast issues. 
- Repeat each page & theme test on desktop and mobile. Sites require different optimization for mobile, and may require different accessibility features. Because of this, pages and themes that pass in desktop mode might fail in mobile.

What works for me is to create a Github issue with a series of tests for each unique page, and repeat the tests for each theme, as well as desktop and mobile. As I work through the check list, I compile the most pressing issues (including the components/scripts causing them) into the issue. With this, you have everything you need to either work through the problems manually, or fixing it using AI tools.

## Resolving Accessibility Issues with Cursor AI

Cursor AI is one of the many AI coding tools available today. It is essentially two programs in one: an agent window where you can control different AI agents, and an IDE window that is a fork of Visual Studio Code. As someone who came from an IDE background, I prefer the IDE view and you can do almost anything that you can do from the agents window. 

Of course, as a developer, accessibility is one of your highest concerns after security, and devs should design their sites with accessibility from the start. This said, as web apps grow more complicated with more and more components, accessibility bugs may slowly crop up over time. This is where AI tools become very helpful.

AI agents are very good at reading console output, audit reports, and documentation. Once you collected the Google Lighthouse reports from each page, you can categorize them into similar issues and feed them to your AI agent. For example, I noticed that the accessibility bugs on light and dark mode in desktop have a lot of overlap affecting similar components and root issues, so I compiled these parts of the reports and asked my agent to create a plan. Once the plan was complete, I read through the root issues and proposed solution to see if it makes sense. In most cases, accessibility bugs are either missing ARIA in React components, or style issues that can be fixed with CSS/SCSS, and in my case, the plan flagged these correctly. 

I don't want to get into too much detail on this step because every site can have different issues, but the important part here is to read through the plan, research whatever you don't understand (especially as far as solutions go), and make required alterations to the plan before asking the AI to build it. In my experience, AI tools usually get it right, but there are many instances where they overlook an architectural decision you made, or are addressing the wrong problems with their solution. 

Once you are happy, you can ask the AI to build the solution. In my experience, accessibility bugs are fixed with relatively few lines of code. Most of the changes are in the CSS involving things like color contrast or element size. I was surprised to see most changes in `JSX` files were limited to a couple lines per script, and added missing features to the individual components affected. 

Of course, any competent developer could achieve the same result manually, but the payoff here is the speed at which AI can refactor multiple scripts. By using AI to fix accessibility bugs, developers can focus their energy elsewhere after reviewing the AI output and making sure all the tests pass. 

## Conclusion

## Sources

- [Introduction to Lighthouse](https://developer.chrome.com/docs/lighthouse/overview)
