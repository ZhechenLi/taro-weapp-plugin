import '@tarojs/async-await';
import Taro, { Component } from '@tarojs/taro';
import { Provider } from '@tarojs/redux';

import Index from './pages/index';

import configStore from './store';

import './app.scss';

const store = configStore();

class App extends Component {
  config = {
    pages: ['pages/index/index'],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: 'WeChat',
      navigationBarTextStyle: 'black'
    },
    main: 'index.js'
  };

  componentWillMount() {
    console.log(this.$router.params);
  }

  globalData = 'I am global data';

  // componentDidMount() {
  //   console.log(this.$router.params)
  // }

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render() {
    console.log(this.$router.params);
    return (
      <Provider store={store}>
        <Index />
      </Provider>
    );
  }
}

Taro.render(<App />, document.getElementById('app'));
