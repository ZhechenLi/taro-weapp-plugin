/**
 * Created by v_sameli on 2018/11/7.
 */

const program = require('commander');
const {spawn} = require('child_process');

module.exports = function taroBuild(){
	spawn(
		'taro',
		[...process.argv.slice(process.argv.findIndex(e=>e === 'build'))],
		{
			stdio: 'inherit'
		}
	);
};