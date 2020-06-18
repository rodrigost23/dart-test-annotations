const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

const { GITHUB_TOKEN, GITHUB_WORKSPACE, INPUT_PATH } = process.env;

async function main() {
  try {
    let fileContents = fs.readFileSync(core.getInput('path', { required: true }), { encoding: 'utf-8' });

    console.log(parseOutput(fileContents));

  } catch (error) {
    core.setFailed(error.message);
  }
}

/**
 * @typedef {Object} ErrorItem
 * @property {number} testID
 * @property {string} stackTrace
 * @property {string} error
 * @property {string} type
 * @property {bool} isFailure
 */

/**
 * @param {string} output 
 */
function parseOutput(output) {
  /** @type {(import("@octokit/types").ChecksListAnnotationsResponseData)[]} */
  let annotations = [];

  if (output.length == 0) {
    return annotations;
  }

  let lines = output.trim().split(String.fromCharCode(10));

  lines.forEach(line => {
    /** @type {ErrorItem} */
    let item = JSON.parse(line);

    if (item.testID && item.error) {
      let RegExp = /([\w\\\/\.]+)[ :](\d+):(\d+)/gi;

      if (item.isFailure) {
        let matches = RegExp.exec(item.stackTrace);
        annotations.push({
          path: matches[1],
          start_line: matches[2],
          end_line: matches[2],
          start_column: matches[3],
          end_column: matches[3],
          annotation_level: "error",
          message: item.error,
          raw_details: item.stackTrace
        });

      } else if (item.type == "error") {
        let err = item.error.replace(RegExp, "$$$$$$$&")
        err.split("$$$").forEach(err => {
          let matches = RegExp.exec(err);

          if (matches) {
            annotations.push({
              path: matches[1],
              start_line: matches[2],
              end_line: matches[2],
              start_column: matches[3],
              end_column: matches[3],
              annotation_level: "error",
              message: err,
              raw_details: item.stackTrace
            });
          }
        });
      }
    }
  });

  return annotations;
}

main();