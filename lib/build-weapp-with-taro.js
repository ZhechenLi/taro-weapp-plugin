/**
 * Created by v_sameli on 2018/11/7.
 */

const program = require('commander');
const { spawn } = require('child_process');
const path = require('path');
const EventEmitter = require('events');


module.exports = function buildWeappWithTaro({
	cwd
}) {

	const taroEmitter = new EventEmitter();

	process.env.FORCE_COLOR = 'true';

	const cp = spawn(
		'taro',
		process.argv.slice(process.argv.findIndex(e => e === 'build')),
		{
			cwd
		}
	);

	cp.stdout.on('data', data => {
		if(data.toString().search('工具配置 ') !== -1) {

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
	});

	return taroEmitter;

};