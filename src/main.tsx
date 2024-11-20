// @deno-types="@types/react"
import React, { useState, useEffect } from 'npm:react';
import { Box, render, Text } from 'npm:ink';
import { run } from "./run.ts";
import chalk from 'npm:chalk';

const Lazy = () => {
	const [ logs, setLogs ] = useState([] as string[]);

	const configPath = Deno.args[0];

    const addLog = (log: any, popLast = false) => {
        if (popLast) logs.pop();
        logs.push(`${log}`);
        setLogs([ ...logs ]);
    }

	useEffect(() => {
		if (configPath == null) {
			setLogs([
				chalk.red('No config supplied.')
			])
		} else {
			run(addLog, configPath);
		}
	}, []);

	useEffect(() => {}, []);

	return <Text>
		{logs.join('\n')}
	</Text>
};

render(<Lazy />);