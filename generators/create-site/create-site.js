#!/usr/bin/env node

// https://github.com/flatiron/prompt

const fs = require('fs');
const path = require('path');
const util = require('util');
const crypto = require('crypto');

const mkdirp = require('mkdirp').sync;
const slug = require('slug');
const omit = require('omit');

const prompt = require('prompt');
const shell = require('shelljs');
const colors = require("colors/safe");
const jp = require('jsonpath');

// Set source and destination dirs
const templatePath = `${__dirname}/templates/`;
const localPath = process.cwd();

// Extract keys to prompt for
const package_json = require(`${templatePath}/package.json`);
const sensitive_json = require(`${templatePath}/sensitive.json`);

const yes_no_pattern = /y[es]*|n[o]?/;
const yes_pattern = /y[es]/;

// Intermediary storage
const store = {};

// Set prompt as green and use the "Replace" text
prompt.message = colors.green("Package");
prompt.delimiter = ':';

// Ask for variable values
prompt.start()

const checkErrorVar = function(err, message) {
  if (err) {
    console.error(err);
    if (message) console.info(message);
    process.exit(0);
  }
}

const nextStep = (function()
{
  steps = [
    'parseSuperuser',
    'parseMailgun',
    'parseHashSecret',
    'parsePackageJson',
    'maybeMkProjectdir',
    'verifySettings',
    'createFileStructure',
    'showFeedback',
  ];
  return function() {
    const fn_name = steps.shift();
    eval(`${fn_name}()`);
  }
})();



/**
 * Steps
 */

const parseSuperuser = function()
{
  const author = package_json.author.match(/\[(.*?)\]/)[1];
  let firstName = author.split(' ')[0];
  let lastName = author.split(' ')[1];
  let emailAddress = author.match(/\<(.*?)\>/)[1];

  prompt.get({
    properties: {
      firstName: {
        description: 'your first name',
        type: 'string',
        default: firstName || undefined,
        required: true,
      },
      lastName: {
        description: 'your last name',
        type: 'string',
        default: lastName || undefined,
        required: true,
      },
      emailAddress: {
        description: 'your email-address',
        type: 'string',
        default: emailAddress || undefined,
        required: true,
      },
    }
  }, function(err, res) {
    checkErrorVar(err);
    Object.assign(sensitive_json.superuser, res)
    nextStep();
  });
}


const parseMailgun = function()
{
  prompt.get({
    properties: {
      useMailgun: {
        description: 'Set up mailgun transport? [Yes|No]',
        message: 'Must respond yes or no',
        type: 'string',
        default: 'yes',
        pattern: yes_no_pattern
      },
      apiKey: {
        description: 'mailgun api key',
        required: true,
        ask: function() {
          // only ask for proxy credentials if a proxy was set
          return prompt.history('useMailgun').value.match(yes_pattern);
        }
      },
      domain: {
        description: 'mailgun domain',
        required: true,
        default: "example.com",
        ask: function() {
          // only ask for proxy credentials if a proxy was set
          return prompt.history('useMailgun').value.match(yes_pattern);
        }
      },
      senderEmail: {
        description: 'mailgun sender email-address',
        required: true,
        default: "post@example.com",
        ask: function() {
          // only ask for proxy credentials if a proxy was set
          return prompt.history('useMailgun').value.match(yes_pattern);
        }
      },
    }
  }, function(err, res) {
    checkErrorVar(err);
    Object.assign(sensitive_json.mailgun, omit(['useMailgun'], res));
    nextStep();
  });
}


const parseHashSecret = function()
{
  sensitive_json.hashSecret = crypto.randomBytes(20).toString('hex');
  nextStep();
}


const parsePackageJson = function()
{
  const schema = {
    properties: {}
  };

  Object.assign(schema.properties, Object.keys(package_json).reduce((acc, k) => {
    if (util.isString(package_json[k])) {

      const match = package_json[k].match(/\[(.*?)\]/)

      if (match) {
        acc[k] = {
          required: true,
          description: k,
          type: 'string',
          message: k+' is required!',
        };

        if (match[1].toLowerCase() !== k) {
          acc[k].default = match[1];
        }
      }
    }

    return acc;
  }, {}));

  // Override `author.default` with `superUser` credentials
  const user = sensitive_json.superuser;
  schema.properties.author.default = `${user.firstName} ${user.lastName} <${user.emailAddress}>`

  prompt.get(schema, function(err, res) {
    checkErrorVar(err);
    Object.assign(package_json, res);
    nextStep();
  });
}


const maybeMkProjectdir = function()
{
  prompt.get({
    properties: {
      mkdir: {
        description: 'create project folder here? [Yes|No]',
        message: 'Must respond yes or no',
        type: 'string',
        default: 'yes',
        pattern: yes_no_pattern
      },
      projectDir: {
        description: 'project folder name',
        required: true,
        default: slug(package_json.name).toLowerCase(),
        ask: function() {
          // only ask for proxy credentials if a proxy was set
          return prompt.history('mkdir').value.match(yes_pattern);
        }
      }
    }
  }, function(err, res) {
    checkErrorVar(err);
    store.project_path = path.join(localPath, res.projectDir || '')
    nextStep()
  });
}


const verifySettings = function()
{
  console.info(`creating at path "${store.project_path}"`)
  prompt.get({
    properties: {
      continue: {
        description: 'proceed with project creation? [Yes|No]',
        message: 'Must respond yes or no',
        type: 'string',
        default: 'yes',
        pattern: yes_no_pattern
      }
    }
  }, function(err, res) {
    checkErrorVar(err);
    if (res.continue.match(yes_pattern)) {
      nextStep();
    }
  })
}


const createFileStructure = function()
{
  const project_path = store.project_path;

  mkdirp(project_path);

  console.info('Copying files...');
  shell.cp('-R', `${templatePath}/*`, project_path);

  // After recursive copy, write the json settings files
  fs.writeFileSync(path.join(project_path, 'package.json'), JSON.stringify(package_json, null, 2));
  fs.writeFileSync(path.join(project_path, 'sensitive.json'), JSON.stringify(sensitive_json, null, 2));

  // Npm Linking
  console.info('Linking to manifester...');
  shell.exec(`npm link manifester`, { silent: true, cwd: project_path }, function(err, stdout, stderr) {
    checkErrorVar(err, 'Could not link to manifester. Make sure you have npm-linked it allready!');
    nextStep();
  })

}

const showFeedback = function()
{
  let path_diff_str = path.relative(localPath, store.project_path);
  if (path_diff_str) {
    path_diff_str = `cd ${path_diff_str} && `
  }

  console.info('done');

  console.info(`run '${path_diff_str} npm install'`);
}

/**
 * Run first step
 */
nextStep();