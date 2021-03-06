#!/usr/bin/env node

const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');

const files = require('./lib/files');
const github = require('./lib/github');
const repo = require('./lib/repo');

clear();

console.log(
  chalk.cyanBright(
    figlet.textSync('initHUB', { horizontalLayout: 'full' })
  )
);

if (files.directoryExists('.git')) {
  console.log(chalk.redBright('Already a Git repository!'));
  process.exit();
}

const getGithubToken = async () => {
  // Fetch token from config store
  let token = github.getStoredGithubToken();
  if(token) {
    return token;
  }

  // No token found, use credentials to access GitHub account
  token = await github.getPersonalAccesToken();

  return token;
};

const run = async () => {
  try {
    // Retrieve & Set Authentication Token
    const token = await getGithubToken();
    github.githubAuth(token);

    // Create remote repository
    const url = await repo.createRemoteRepo();

    // Create .gitignore file
    await repo.createGitignore();

    // Set up local repository and push to remote
    await repo.setupRepo(url);

    console.log(chalk.greenBright('All done!'));
  } catch(err) {
      if (err) {
        switch (err.status) {
          case 401:
            console.log(chalk.redBright('Couldn\'t log you in. Please provide correct credentials/token.'));
            break;
          case 422:
            console.log(chalk.redBright('There is already a remote repository or token with the same name'));
            break;
          default:
            console.log(chalk.redBright(err));
        }
      }
  }
};

run();
