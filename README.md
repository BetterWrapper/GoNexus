# GoNexus
Before reading this readme, please note that GoNexus is not affiliated with the GoAnimate/Vyond Inc trademark. We do not make any profit off of this project whatsoever.
## About
GoNexus is an LVM clone which brings back the classic GoAnimate For Schools experience while keeping things up to date with the modern era. This project could come into play if you in one of these sanarios:
* The FlashThemes site is down and I need a site to use while not taking up too much space on my computer.
* I don't trust any sketchy LVM projects i see (Example: Wrapper Online Diamond).
* I need to make animations at school but can't because FlashThemes is blocked by my school's firewall

Codenames for the project are BetterWrapper and OrangeAura.

## Project Owner
* MysteriousOwen

## Developers
* BluePeacocks
* ~~Itinerary Jyvee~~
* JosephAnimate
* Revolution909
* Abyl
* Kia

## Beta Testers
* CallMeMontie
* gaviboi
* HoodedCube
* JonsCartoonShow
* MKAnimates
* Xill/Music

## Side Developers
* Magical
  
## To Do
* Add all videomakers ![75%](https://progress-bar.dev/75)
* Fix voice clip issues in the QVM ![90%](https://progress-bar.dev/90)
* Fix custom characters and its emotions for the 2011 and 2012 videomakers ![60%](https://progress-bar.dev/60)
* Find a new site host for GoNexus ![100%](https://progress-bar.dev/100)
* Add 2 new functional scenes to Slices of Daily Life ![100%](https://progress-bar.dev/100)
* Release the final version of GoNexus ![20%](https://progress-bar.dev/20)
* Fix characters not loading in the 2010 LVM ![100%](https://progress-bar.dev/100)
* School Management System ![100%](https://progress-bar.dev/100)
* Create an interactive Getting Started Guide ![100%](https://progress-bar.dev/100)

## Final Release Version
This project will be worth the wait when it is released, but don't expect it to be released soon.

## Installation

To keep things basic, this project was built on top of GoAnimate Wrapper which uses NodeJS so obviously you will need [NodeJS](https://nodejs.org/) to get started.

### NodeJS Installation for Windows

We will be installing NodeJS via Chocolatey, which is a package manager for Windows. First, open PowerShell and run this command via administrator:
```PowerShell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```
Make sure to type Y and then Enter if it prompts you to restart.
Then, type `choco install nodejs.install` and go ahead and do the same for the prompts, and you should be done!

### NodeJS Installation for Linux

To install NodeJS on Linux, just run this command:
```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
```
Then, run this command:
```
nvm install node
```
Now, you've done it!

### NodeJS Installation for Mac
Before installing NodeJS on Mac, you need to check if you have Homebrew. Homebrew is a package manager that will install it for us.
Run `brew` and see if it finds the command. If it says something like the command does not exist, then run this command:
```
curl -fsSL -o install.sh https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh
```
After it is installed, run `brew install node`. Then, you should be done!

### GoNexus Setup

Once you have NodeJS installed, you will go to the Nexus folder. Open your desired terminal and run:

* Windows: Type `windows.bat`
* Mac: Type `sh mac.sh`
* Linux: Type `sh linux.sh`
  Use `--dev` if you want to make a developer environment, for instance `windows.bat --dev` for Windows, `sh mac.sh --dev` for Mac, and `sh linux.sh --dev` for Linux.
For a production environment, use `--prod` for instance `sh linux.sh --prod` for Linux.

If there is no app for your operating system, please let us know in the issues tab and we will make one!
