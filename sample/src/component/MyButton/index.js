import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text } from '@tarojs/components'
import './index.scss'

class MyButton extends Component {
    onClick(e) {
        e.stopPropagation()
        console.log('aloha')
        this.props.onClick && this.props.onClick(e)
    }

    render() {
        return (
            <Button className="pages__index__component__my-button" onClick={this.onClick}>
                {this.props.name}:{this.props.children}
            </Button>
        )
    }
}
export default MyButton