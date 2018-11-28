/**
 * Created by v_sameli on 2018/11/7.
 */

const program = require('commander');
const { spawn } = require('child_process');
const path = require('path');
const EventEmitter = require('events');

/**
 * @param {Path} cwd 用于设置子进程的工作路径，默认为当前进程的工作路径
 * */
module.exports = function buildWeappWithTaro({
	cwd = process.cwd(),
	env,
	stdio = 'pipe'
} = {}) {

	env = {
		...process.env,
		...env,
		FORCE_COLOR: 'true'
	};

	const taroEmitter = new EventEmitter();

	const cp = spawn(
		'taro',
		process.argv.slice(process.argv.findIndex(e => e === 'build')),
		{
			cwd,
			env,
			stdio
		}
	);

	cp.stdout.on('data', data => {
		if(data.toString().search('入口文件') !== -1) {

			// 这个时间节点 taro 已经完成了清空目录的操作
			taroEmitter.emit('load', data);
		}
		console.log(data.toString().trim());
	});

	cp.stderr.on('data', data => {
		console.log(`stderr: ${data}`);
	});

	cp.on('close', code => {
		console.log(`子进程退出码：${code}`);
		taroEmitter.emit('done');
	});

	return taroEmitter;

};