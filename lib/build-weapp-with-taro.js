/**
 * Created by v_sameli on 2018/11/7.
 */

const program = require('commander');
const {spawn} = require('child_process');

module.exports = function taroBuild(){

	process.env.FORCE_COLOR = 'true';

	const cp = spawn(
		'taro',
		[...process.argv.slice(process.argv.findIndex(e=>e === 'build'))]
	);

	cp.stdout.on('data', data=>{
		if(data.toString().search('生成  工具配置  dist/project.config.json') !== -1){

		}
		console.log(data.toString().trim());
	});

	cp.stderr.on('data', data=>{
		console.log(`stderr: ${data}`);
	});

	cp.on('close', code=>{
		console.log(`子进程退出码：${code}`);
	});
};