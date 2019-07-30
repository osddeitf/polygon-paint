import React from 'react'
import PaintCanvas from './PaintCanvas'

class Paint extends React.Component {
    constructor(props) {
        super(props)
        this.canvas = React.createRef()
        this.state = { coordinate: null }
        this.onMouseMove = this.onMouseMove.bind(this)
    }

    onMouseMove(e) {
        let x = e.nativeEvent.offsetX
        let y = e.nativeEvent.offsetY
        this.setState({ coordinate: `(${x}, ${y})` })
    }

    getRef() {
        return this.props.forwardRef || this.canvas
    }

    render() {
        return !this.props.image? null: (
            <React.Fragment>
                <PaintCanvas ref={this.getRef()} image={this.props.image} onMouseMove={this.onMouseMove}/>
                <div>{this.state.coordinate}</div>
                <div>
                    <button onClick={() => this.getRef().current.closePath()  }> Close </button>
                    <button onClick={() => this.getRef().current.undo()       }> Undo  </button>
                    <button onClick={() => this.getRef().current.resetPath()  }> Reset </button>
                    <button onClick={() => this.getRef().current.clearCanvas()}> Clear </button>
                </div>
            </React.Fragment>
        )
    }
}

export default React.forwardRef((props, ref) => (
    <Paint forwardRef={ref} {...props} />
))
