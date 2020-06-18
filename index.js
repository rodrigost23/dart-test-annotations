//@ts-check
const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

const { GITHUB_TOKEN, GITHUB_WORKSPACE, INPUT_PATH } = process.env;

async function main() {
  try {
    let fileContents = fs.readFileSync(core.getInput('path', { required: true }), { encoding: 'utf-8' });

    let annotations = parseOutput(fileContents);

    if (annotations.length > 0) {
      annotations.forEach(a => {
        console.log(`::error ${a.file ? `file=${a.file},line=${a.line},col=${a.col}` : ''}::${a.error}${a.stackTrace ? `\\n\\n ${a.stackTrace}` : ''}`)
      });
      core.setFailed(`${annotations.length} test errors(s) found`);
    }
  } catch (error) {
    core.setFailed(error);
  }
}

/**
 * @typedef {Object} ErrorItem
 * @property {number} testID
 * @property {string} stackTrace
 * @property {string} error
 * @property {string} type
 * @property {boolean} isFailure
 */

/**
 * @typedef {Object} Annotation
 * @property {string} [file]
 * @property {number} [line]
 * @property {number} [col]
 * @property {string} error
 * @property {string} [stackTrace]
 */

/**
 * @param {string} output 
 */
function parseOutput(output) {
  /** @type {Annotation[]} */
  let annotations = [];

  if (output.length == 0) {
    return annotations;
  }

  let lines = output.trim().split(String.fromCharCode(10));

  lines.forEach(line => {
    /** @type {ErrorItem} */
    let item = JSON.parse(line);

    if (item.testID && item.error) {
      let RegExp = /([\w\\\/\.]+) (\d+):(\d+)/gi;

      let matches = RegExp.exec(item.stackTrace);

      if (matches) {
        annotations.push({
          file: matches[1],
          line: Number.parseInt(matches[2]),
          col: Number.parseInt(matches[3]),
          error: item.error.replace(/\n/g, '\\n'),
          stackTrace: item.stackTrace.replace(/\n/g, '\\n')
        });
      } else {
        annotations.push({
          error: item.error.replace(/\n/g, '\\n'),
          stackTrace: item.stackTrace.replace(/\n/g, '\\n')
        });
      }
    }
  });

  return annotations;
}

main();