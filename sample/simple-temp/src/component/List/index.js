import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'


class List extends Component {

    render() {
        return (
            <View>
                List
                {
                    this.props.data.map((e, i) => {
                        if (i === 1) {
                            return <View>{e.key}: {e.value} lololo</View>
                        }

                        return <View>{e.key}: {e.value}</View>
                    })
                }</View>

        )
    }
}
export default List