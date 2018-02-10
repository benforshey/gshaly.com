# GSHaly.com
This is the private repository for the GS Haly Website Update Team.

## Requirements
### Homebrew
Homebrew is a package manager for macOS; you'll use it to install Hugo. To install Homebrew, follow the instructions on [the Homebrew website](http://brew.sh/).

### Hugo
To install Hugo, run ```brew update && brew install hugo``` in your terminal. Instructions for installing an optional dependency (Pygments) can be found in Hugo's [installation documentation](https://gohugo.io/tutorials/installing-on-mac/). You will only need to do this once.

### Node.js
To install Node.js, run ```brew update && brew install node``` in your terminal. You will only need to do this once.

## Locally Served Website
To generate and serve the website locally, first use your terminal program to navigate into the ```gshaly.com/gshaly/``` folder, then run ```npm install```. ```npm install``` downloads the required dependencies for the project. Since this project is in active development, it is wise to update your dependencies before attempting to run the project. Of course, if the dependencies have not changed (as when the project launches) you'll no longer need to run ```npm install```.

You can then run ```npm run watch``` in your terminal to translate the website's source files into their respective neccessary formats. Leave that tab of your terminal open, and open a new terminal tab. In this tab, run ```hugo server``` to serve a local version of the wesbite at [http://localhost:1313/](http://localhost:1313/).

As long as you have ```npm run watch``` running in your terminal window / tab, the website files will continue to be modified as needed. As long as you have ```hugo server``` running on your terminal window / tab, the website will continue to be served locally. If you close either terminal window / tab, you'll need to start at the beginning of the "Locally Served Website" instructions again.


## Git Workflow
I'm writing these instructions for the command line version of Git.

### Clone the Repository onto Your Computer
One time only, clone the repository with ```git clone https://github.com/benforshey/gshaly.com.git```.

### Get the Latest Changes
Before you begin working on a feature, run ```git pull --rebase origin master``` to pull the latests changes from the central repository.

### Save Your Work
As you "complete thoughts" in your code, use ```git add --all``` _adds all new files / changed files to be tracked_ and ```git commit -m 'your commit message'``` _stages the files to be pushed into our repository_. Commit messages read the best if they are written in the present imperative. E.g., ```git commit -m 'add dropdown animation to menu'```.

### Put Your Work into the Repository
Detailed instructions can be found in the [Atlassian Tutorial](https://www.atlassian.com/git/tutorials/comparing-workflows/centralized-workflow/)

1. ```git pull --rebase origin master``` _pulls any changes from the central repository_ Changes might have been published since you began developing your feature--you always want to put your work on top of the latest changes.
2. resolve any conflicts
    * run ```git status``` to see conflict details
    * edit files as needed to resolve conflicts
    * ```git add .``` to add changed files
    * ```git rebase --continue```

3. push your work ```git push origin master```
