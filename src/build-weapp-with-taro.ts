/**
 * Created by v_sameli on 2018/11/7.
 */
import EventEmitter from 'events'
import program from 'commander'
import * as cp from 'child_process'
import path from 'path'

const { spawn } = cp



// import
interface buildWeappWithTaroOptions {
	cwd?: string;
	env?: NodeJS.ProcessEnv;
	args: Array<string>;
	stdio?: cp.StdioOptions;
}



/**
 * @param {Path} cwd 用于设置子进程的工作路径，默认为当前进程的工作路径
 * */
export default function buildWeappWithTaro({
	args = [],
	cwd = process.cwd(),
	env = process.env,
	stdio = "pipe"
}: buildWeappWithTaroOptions = {
		args: [],
		cwd: process.cwd(),
		env: process.env,
		stdio: 'pipe'
	}) {

	env = {
		...env,
		FORCE_COLOR: 'true'
	};

	const taroEmitter = new EventEmitter();

	console.log(process.argv.slice(process.argv.findIndex(e => e === 'build')))
	const cp = spawn(
		'taro',
		// process.argv.slice(process.argv.findIndex(e => e === 'build')),
		args,
		{
			cwd,
			env,
			stdio
		}
	);

	cp.stdout.on('data', (data: Uint8Array) => {
		if (data.toString().search('入口文件') !== -1) {

			// 这个时间节点 taro 已经完成了清空目录的操作
			taroEmitter.emit('load', data);
		}
		console.log(data.toString().trim());
	});

	cp.stderr.on('data', (data: Uint8Array) => {
		console.log(`stderr: ${data}`);
	});

	cp.on('close', (code: number) => {
		console.log(`子进程退出码：${code}`);
		taroEmitter.emit('done');
	});

	return taroEmitter;

};