import Taro, { Component } from '@tarojs/taro';
import { View, Button, Text } from '@tarojs/components';
import { connect } from '@tarojs/redux';

import { add, minus, asyncAdd } from '../../actions/counter';

import './index.scss';

import MyButton from '../../component/MyButton';
import List from '../../component/List';

import './temp.jpg';

// class MyButton extends Component {

//   render() {
//     return (
//       <View>
//         I'm ComponentA ?????
//       </View>
//     )
//   }
// }

// @connect(({ counter }) => ({
//   counter
// }), (dispatch) => ({
//   add() {
//     dispatch(add())
//   },
//   dec() {
//     dispatch(minus())
//   },
//   asyncAdd() {
//     dispatch(asyncAdd())
//   },
//   onClick(e) {
//     console.log(e)
//   }
// }))
class Index extends Component {
  static defaultProps = {
    a: 1,
    b: () => {},
    c() {}
  };

  config = {
    navigationBarTitleText: '首页'
  };

  componentDidMount() {
    console.log(this);
  }

  state = {
    text: 'Hello world'
  };

  onChange() {
    this.setState(pre => ({ ...pre, text: pre.text + '!' }));
  }

  render() {
    console.log(this.props);
    return (
      <View className="index">
        <Button onClick={this.onChange}>+</Button>
        <Text>{this.state.text}</Text>
      </View>
    );
  }
}

function delay(time) {
  return new Promise(res => {
    setTimeout(_ => {
      res();
    }, time);
  });
}

async function a(params) {
  while (1) {
    console.log(1);
    await delay(1000);
  }
}

a();

export default Index;
