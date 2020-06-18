//@ts-check
const core = require('@actions/core');
const fs = require('fs');

async function main() {
  try {
    let fileContents = fs.readFileSync(core.getInput('path', { required: true }), { encoding: 'utf-8' });

    let annotations = parseOutput(fileContents);

    if (annotations.length > 0) {
      annotations.forEach(a => {
        console.log(`::error ${a.file ? `file=${a.file},line=${a.line},col=${a.col}` : ''}::${a.error}${a.stackTrace ? ` ${a.stackTrace}` : ''}`)
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

      let error = item.error
        .split(/\n/g).map((line) => line.trim())
        .join('; ')
        .replace(matches[1], '')
      
      let stackTrace = item.stackTrace
        .split(/\n/g).map((line) => line.trim())
        .join('; ')
        .replace(matches[1], '')

      if (matches) {
        annotations.push({
          file: matches[1],
          line: Number.parseInt(matches[2]),
          col: Number.parseInt(matches[3]),
          error: error,
          stackTrace: stackTrace
        });
      } else {
        annotations.push({
          error: error,
          stackTrace: stackTrace
        });
      }
    }
  });

  return annotations;
}

main();