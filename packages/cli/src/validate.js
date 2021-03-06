const fs = require('fs');
const path = require('path');
const validator = require('gltf-validator');
const Table = require('cli-table');
const { formatHeader } = require('./util');

function validate(input, options, logger) {
	const buffer = fs.readFileSync(input);
	return validator.validateBytes(new Uint8Array(buffer), {
			maxIssues: options.limit,
			ignoredIssues: options.ignore,
			externalResourceFunction: (uri) =>
			new Promise((resolve, reject) => {
				uri = path.resolve(path.dirname(input), decodeURIComponent(uri));
				fs.readFile(uri, (err, data) => {
					if (err) logger.warn(`Unable to validate "${uri}": ${err.toString()}.`)
					err ? reject(err.toString()) : resolve(data);
				});
			})
		}).then((report) => {
			printIssueSection('error', 0, report, logger);
			printIssueSection('warning', 1, report, logger);
			printIssueSection('info', 2, report, logger);
			printIssueSection('hint', 3, report, logger);
		});
}

function printIssueSection(header, severity, report, logger) {
	console.log(formatHeader(header));
	const messages = report.issues.messages.filter((msg) => msg.severity === severity);
	if (messages.length) {
		const table = new Table({head: ['code', 'message', 'severity', 'pointer']});
		table.push(...messages.map((m) => Object.values(m)));
		console.log(table.toString());
	} else {
		logger.info(`No ${header}s found.`);
	}
	console.log('\n');
}

module.exports = {validate};
