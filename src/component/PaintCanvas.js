import React from 'react'
import { Point, PolyTree, intersect } from './poly'
import draw from './draw'

class PaintCanvas extends React.Component {
    constructor(props) {
        super(props)
        this.foreground = React.createRef()

        this.onClick = this.onClick.bind(this)
        this.onMouseUp = this.onMouseUp.bind(this)
        this.onMouseDown = this.onMouseDown.bind(this)
        this.onMouseMove = this.onMouseMove.bind(this)
        
        this.undo = this.undo.bind(this)
        this.closePath = this.closePath.bind(this)
        this.resetPath = this.resetPath.bind(this)
        this.clearCanvas = this.clearCanvas.bind(this)
    }
    
    init() {
        let foreground = this.foreground.current
        let background = document.createElement("canvas")
        let maskground = document.createElement("canvas")
        let interactiv = document.createElement("canvas")
        
        background.width = maskground.width = interactiv.width = foreground.width
        background.height = maskground.height = interactiv.height = foreground.height
        
        this.contexts = {
            foreground: foreground.getContext('2d'),
            background: background.getContext('2d'),
            maskground: maskground.getContext('2d'),
            interactiv: interactiv.getContext('2d')
        }

        this.tree = new PolyTree(null, null)
        this.lines = []
        this.points = []
        this.poly = []

        this.redraw()
    }

    componentDidMount() {
        this.init()
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.image !== prevProps.image) {
            this.init()
        }
    }

    render() {
        if (!this.props.image && !this.props.width && !this.props.height)
            return null

        let width = this.props.width || this.props.image.width
        let height = this.props.height || this.props.image.height

        return (
            <canvas ref={this.foreground} width={width} height={height}
                onClick={this.onClick}
                onMouseUp={this.onMouseUp}
                onMouseDown={this.onMouseDown}
                onMouseMove={this.onMouseMove}
            >
            </canvas>
        )
    }

    redraw() {
        let ctx = this.contexts.foreground
        draw.clear(ctx)

        ctx.save()
        draw.drawImage(ctx, this.props.image)
        ctx.globalAlpha = .5
        draw.drawImage(ctx, this.contexts.maskground.canvas)
        ctx.globalAlpha = 1.
        draw.drawImage(ctx, this.contexts.background.canvas)
        draw.drawImage(ctx, this.contexts.interactiv.canvas)
        ctx.restore()
    }

    redrawPolygon() {
        if (this.poly.length === 0) return
        let ctx = this.contexts.interactiv

        //Draw lines
        draw.stroke(ctx, draw.polygonPath(this.poly, false))

        //Draw points
        this.poly.forEach(p => draw.drawPoint(ctx, p))
    }

    redrawBackground(poly=this.tree, level=0) {
        let ctx = this.contexts.background
        let mask = this.contexts.maskground

        //Root tree, not polygon
        if (poly === this.tree) {
            mask.save()
            // mask.fillStyle = '#ffffff'
            mask.fillStyle = '#000000'
            mask.fillRect(0, 0, this.props.image.width, this.props.image.height)
            mask.restore()
            
            draw.clear(ctx)
        }
        else {
            let path = draw.polygonPath(poly.points, true)
            draw.stroke(ctx, path)
            
            mask.save()
            //Inclusion
            if (level % 2 !== 0) {
                mask.clip(path)
                draw.clear(mask)
            }
            //Exclusion
            else {
                // mask.fillStyle = '#ffffff'
                mask.fillStyle = '#000000'
                mask.fill(path)
            }
            mask.restore()

            poly.points.forEach(p => draw.drawPoint(ctx, p))
        }

        //Draw descendant
        for (let child of poly.nodes)
            this.redrawBackground(child, level+1)
    }


    /* Event listener */
    onMouseDown(e) {}

    onMouseUp(e) {}

    onMouseMove(e) {
        this.props.onMouseMove(e)
    }

    validLine(prev, next) {
        //Exclude the last line (if present)
        let lines = this.lines.slice(0, -1)

        //Must not intersect any existing lines
        return lines.every(line => !intersect(prev, next, ...line))
    }

    onClick(e) {
        let next = new Point(e.nativeEvent.offsetX, e.nativeEvent.offsetY)

        //Try insert to the drawing polygon
        if (this.poly.length) {
            //Previous drew point
            let prev = this.poly[this.poly.length-1]
            
            //Check whether to draw or not
            if (!this.validLine(prev, next)) return

            prev.next = next
            next.prev = prev
            this.lines.push([prev, next])
        }
        
        this.points.push(next)
        this.poly.push(next)
        this.redrawPolygon()
        this.redraw()
    }


    /* Actions, to be call by React' refs */
    closePath() {
        if (this.poly.length <= 2) return

        let first = this.poly[0]
        let last = this.poly[this.poly.length - 1]
        let overlap = false
        for (let i = 0; i < this.lines.length; i++) {
            if (i === this.lines.length - 1) continue
            if (i === this.lines.length - this.poly.length + 1) continue

            if (intersect(last, first, ...this.lines[i])) {
                overlap = true
                break
            }
        }
        if (overlap) return

        this.tree.add(this.poly)
        this.lines.push([first, last])
        this.poly = []

        draw.clear(this.contexts.interactiv)
        this.redrawBackground()
        this.redraw()
    }

    resetPath() {
        if (this.poly.length > 1)
            this.lines = this.lines.slice(0, -(this.poly.length - 1))
        
        this.poly = []
        draw.clear(this.contexts.interactiv)
        this.redraw()
    }

    undo() {
        if (!this.poly.length) return
        
        this.poly.pop()
        if (this.poly.length !== 0) this.lines.pop()

        draw.clear(this.contexts.interactiv)
        this.redrawPolygon()
        this.redraw()
    }

    clearCanvas() {
        this.tree = new PolyTree(null)
        this.lines = []
        this.points = []
        this.poly = []
        
        draw.clear(this.contexts.maskground)
        draw.clear(this.contexts.background)
        draw.clear(this.contexts.interactiv)
        this.redraw()
    }

    getMask() {
        let w = this.props.image.width
        let h = this.props.image.height
        let data = this.contexts.maskground.getImageData(0, 0, w, h).data
        let mask = []
        for(let i = 0; i < h; i++) {
            mask.push([])
            for(let j = 0; j < w; j++) {
                let pixel = data[i * w * 4 + j * 4 + 3]
                mask[i].push(pixel > 200? 0: 1)
            }
        }
        return mask
    }
}

export default PaintCanvas
