import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { add, minus, asyncAdd } from '../../actions/counter'

import './index.scss'

// import MyButton from '../../component/MyButton'
import List from '../../component/List'

import './temp.jpg'

class MyButton extends Component {

  render() {
    return (
      <View>
        I'm ComponentA ?????
      </View>
    )
  }
}

@connect(({ counter }) => ({
  counter
}), (dispatch) => ({
  add() {
    dispatch(add())
  },
  dec() {
    dispatch(minus())
  },
  asyncAdd() {
    dispatch(asyncAdd())
  },
  onClick(e) {
    console.log(e)
  }
}))
class Index extends Component {

  config = {
    navigationBarTitleText: '首页'
  }

  componentDidMount() {
    console.log(this.$router.params)
  }

  render() {

    return (
      <View className='index'>
        <MyButton onClick={this.props.onClick} name="卧底">
          <Text>对不起</Text>
          <Text>我是差佬</Text>
        </MyButton>
        <List data={[{
          key: 'a',
          value: 'b'
        }, {
          key: 'b',
          value: 'a'
        }]}></List>
        <Button className='add_btn' onClick={this.props.add}>+</Button>
        <Button className='dec_btn' onClick={this.props.dec}>-</Button>
        <Button className='dec_btn' onClick={this.props.asyncAdd}>async</Button>
        <View><Text>{this.props.counter.num}</Text></View>
        <View><Text>Hello, World</Text></View>
      </View>
    )
  }
}



export default Index
