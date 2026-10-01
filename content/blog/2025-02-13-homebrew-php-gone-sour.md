---
title: "Homebrew PHP gone sour"
description: "Blog post about how I broke homebrew PHP, and how I subsequently fixed it."
date: "2025-02-13"
tags: ["drupal", "homebrew", "php"]
draft: false
---

I was preparing to launch a new website for my company next week when I noticed that NPM gave me a message that it is updated and to run a global command to update it. This command resulted in an error as the node version was not compatible with the new NPM version. I could of course ignore it as NPM is only used for a script I wrote to track changes to `scss` files and generate `css` that Drupal can use.

## Souring the brew

After doing some research, I decided to run `brew update && brew upgrade` to update all my packages, including NPM. While this updates the homebrew packages, the job was not yet done. Node is still outdated, so the next step was to run `nvm install --lts` and `nvm use --lts`. Now the global command should finally work:

```bash
npm install -g npm
```

So far so good, the error looks to be resolved, however one problem was replaced with another.

It turns out that homebrew updated all my packages just like I asked, including PHP. The latest version of PHP, version 8.4.3, has deprecated some functions which are used throughout Drupal core and modules. Version 8.4.3 is also so fresh that Drupal core and many modules have not been updated yet to address this change, and the result is this string of warnings that pops up on the home page:

```bash
Deprecated: Psy\info(): Implicitly marking parameter $config as nullable is deprecated, the explicit nullable type must be used instead in /Users/ciesinsg/Documents/Repositories/its/vendor/psy/psysh/src/functions.php on line 131

Deprecated: ckeditor5_premium_features_editor_xss_filter_alter(): Implicitly marking parameter $original_format as nullable is deprecated, the explicit nullable type must be used instead in /Users/ciesinsg/Documents/Repositories/its/web/modules/contrib/ckeditor5_premium_features/ckeditor5_premium_features.module on line 76

Deprecated: backtrace_error_handler(): Implicitly marking parameter $context as nullable is deprecated, the explicit nullable type must be used instead in /Users/ciesinsg/Documents/Repositories/its/web/modules/contrib/devel/devel.module on line 188

(...continues for a while)
```

Unfortunately, I would not know the reason for this until much later.

## Severity of the Problem

As the cause of this was unclear. I correctly concluded PHP must have updated and core and several modules must be using depracated code.

I went to the Status Report page and saw that there was updates for core and several modules. I Attempted to update Drupal core using composer, however this resulted in a mixture of success and errors. Upon further inspection, the errors appeared to actually be warnings which interrupted composer's output, so technically composer succeeded but thought there was an error.

I went to `(url)/update.php` and proceeded to run the database updates as normal. This also resulted in an error, but once again it looks like the database update was successful and returned a status of 200. I tested the site and to my dismay, there were still deprecated warnings across the home page.

I have had an update go bad before, and it is terrible not knowing if you broke your website or not. In this case, it looked like the errors were false positives, and despite the depracated warnings, the website appeared to still work.

## Finding the Problem and Fixing it

Then it clicked. I realized that when I ran the brew updates earlier, PHP had automatically been updated like I asked. Furthermore, the core and module devs will likely require time to update everything. I decided to roll back my PHP to fix the problem. But this, like all things, are not as easy as they sound when using Homebrew.

The first step was to find the available PHP versions with `brew search php`. Homebrew outputted a number of versions including `php@8.3`. I installed it with `brew install php@8.3`. As two PHP versions are now installed, the next step was to unlink 8.4 and link 8.3. This is done with `brew unlink php` and `brew link php@8.3 --force --overwrite`. Running `php -v` showed the correct version, so I restarted php with `brew services restart php`. This worked, but the user was showing as me instead of the root user, so I had to run the command again with sudo, which worked.

Unfortunately, this did not fix the problem (yet). `php -v` shows 8.3.16, but Drupal still sees 8.4.3 and shows the deprecated messages. `brew services list` shows that the php@8.3 is in an error state. I tailed the PHP log and noticed `unable to bind listening socket for address '127.0.0.1:9000': Address already in use (48)` indicating port 9000 is likely in use. I completely stopped all the PHP processes using:

```bash
brew services stop php
brew services stop php@8.3
brew services stop php@8.4
sudo pkill php-fpm
```

Then I started PHP again with `brew services start php@8.3`. This finally resolved the error state, and the website even saw the correct version of PHP being used... that is until I restarted. Upon restarting my macbook, the website seemingly reverted to PHP 8.4 and the deprecated warnings returned.

After more research and pulled out hairs, I realized that even if I used `brew services stop php` and stopped all the versions of PHP listed, the site was still working, and still thought it was on PHP 8.4. At this point I thought I was going crazy. The website must be using some version of PHP, likely the one bundled with mac, instead of the homebrew versions. I opened my httpd config file with `vim $(brew --prefix)/etc/httpd/httpd.conf` and noticed that the config was trying to load a generic php binary: 

```bash
/opt/homebrew/opt/php/lib/httpd/modules/libphp.so
```

As I had multiple versions installed, this defaulted to the highest version, 8.4. The solution at this point was so simple, it is crazy to look at this whole blog post in retrospect. All I had to do was change this line to `/opt/homebrew/opt/php@8.3/lib/httpd/modules/libphp.so` and `run brew services restart httpd`.

And just like that, Drupal recognized the correct version of PHP, and there were no more depracated messages. But wait... what if I restart? After restarting my computer, I was very happy to see the problem appears to be permanently resolved.

## Sour Brews

So do you like what I did with the title? Anyways, I learned a few things from this breakdown. First and most importantly, **don't update unrelated things right before deploying a site**. In my mind, I thought that updating would ensure that any bug that might break the deployment could be resolved, but as you can see it can also cause new and unexpected bugs. Next, I learned **how to change homebrew binaries for php**. Not only do you have to change it in homebrew itself, but you also have to change it at the server level so that it isn't loading the wrong binary.

With this cataclysm narrowly avoided, I must return to testing the site to see if I broke anything else, and to prepare it for deployment next week.

Until next time!
