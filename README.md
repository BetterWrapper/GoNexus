# GoNexus

## About
GoNexus is an LVM clone which brings back GoAnimate and GoAnimate for Schools. It's currently private and closed source but that'll change once it's released. This is a great alternative for FlashThemes if you have these problems:
* The site is too slow and takes time to load even though I have good Wi-Fi like Starlink.
* I have problems creating an account.
* FlashThemes has serverside crashes, etc.

Codenames for the project are BetterWrapper and OrangeAura.

## Developers
* BluePeacocks
* Itinerary Jyvee
* JosephAnimate
* MysteriousOwen
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
* Fix voice clip issues in the QVM ![0%](https://progress-bar.dev/0)
* Fix custom characters and its emotions for the 2011 and 2012 videomakers ![60%](https://progress-bar.dev/60)
* Find a new site host for GoNexus ![0%](https://progress-bar.dev/0)
* Add 2 new functional scenes to Slices of Daily Life ![0%](https://progress-bar.dev/0)
* Release the final version of GoNexus ![15%](https://progress-bar.dev/15)
* Fix characters not loading in the 2010 LVM ![0%](https://progress-bar.dev/0)
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

### Nexus Setup

Once you have NodeJS installed, you will go to the Nexus folder. Open your desired terminal and run:

* Windows: Type `windows.bat`
* Mac: Type `sh mac.sh`
* Linux: Type `sh linux.sh`

If there is no app for your operating system, please let us know in the issues tab and we will make one!
