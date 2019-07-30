import React from 'react'
import ImageFile from './component/ImageFile'
import Paint from './component/Paint'

class App extends React.Component {
    constructor(props) {
        super(props)
        this.ref = {
            mask: React.createRef(),
            src: React.createRef(),
            dst: React.createRef()
        }
        this.state = {
            image: null,
            width: null,
            height: null,
            map: null
        }
        this.createMap = this.createMap.bind(this)
        this.onWidthChange = this.onWidthChange.bind(this)
        this.onHeightChange = this.onHeightChange.bind(this)
        this.exportMask = this.exportMask.bind(this)
        this.exportTransform = this.exportTransform.bind(this)
    }

    onWidthChange(e) {
        this.setState({ width: e.target.value })
    }

    onHeightChange(e) {
        this.setState({ height: e.target.value })
    }

    createMap() {
        let tile = 40
        let width = this.state.width
        let height = this.state.height
        if (!width || !height) return

        let grid = document.createElement('canvas')
        grid.width = width * tile
        grid.height = height * tile

        let ctx = grid.getContext('2d')
        ctx.beginPath()
        for(let i = 0; i <= width; i++) {
            ctx.moveTo(i * tile, 0)
            ctx.lineTo(i * tile, height * tile - 1)
        }
        for(let i = 0; i <= height; i++) {
            ctx.moveTo(0, i * tile)
            ctx.lineTo(width * tile - 1, i * tile)
        }
        ctx.stroke()

        this.setState({ map: grid })
    }

    copyTextToClipboard(text) {
        var textArea = document.createElement("textarea");
      
        //
        // *** This styling is an extra step which is likely not required. ***
        //
        // Why is it here? To ensure:
        // 1. the element is able to have focus and selection.
        // 2. if element was to flash render it has minimal visual impact.
        // 3. less flakyness with selection and copying which **might** occur if
        //    the textarea element is not visible.
        //
        // The likelihood is the element won't even render, not even a
        // flash, so some of these are just precautions. However in
        // Internet Explorer the element is visible whilst the popup
        // box asking the user for permission for the web page to
        // copy to the clipboard.
        //
      
        // Place in top-left corner of screen regardless of scroll position.
        textArea.style.position = 'fixed';
        textArea.style.top = 0;
        textArea.style.left = 0;
      
        // Ensure it has a small width and height. Setting to 1px / 1em
        // doesn't work as this gives a negative w/h on some browsers.
        textArea.style.width = '2em';
        textArea.style.height = '2em';
      
        // We don't need padding, reducing the size if it does flash render.
        textArea.style.padding = 0;
      
        // Clean up any borders.
        textArea.style.border = 'none';
        textArea.style.outline = 'none';
        textArea.style.boxShadow = 'none';
      
        // Avoid flash of white box if rendered for any reason.
        textArea.style.background = 'transparent';
      
      
        textArea.value = text;
      
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
      
        document.execCommand("copy");
        document.body.removeChild(textArea);

        alert("Copied to clipboard");
    }

    exportMask() {
        console.log(this)
        let mask = this.ref.mask.current.getMask()
        this.copyTextToClipboard(JSON.stringify(mask))
    }

    exportTransform() {
        let src = [...this.ref.src.current.tree.nodes][0].points.map(x => [x.x, x.y])
        let dst = [...this.ref.dst.current.tree.nodes][0].points.map(x => [x.x, x.y])
        this.copyTextToClipboard(JSON.stringify({ src, dst }))
    }

    render() {
        return (
            <React.Fragment>
                <div className="container my-3">
                    <div className="row my-2">
                        <div className="col">
                            <span>File: </span>
                            <ImageFile onChange={image => this.setState({ image })} />
                        </div>
                    </div>
                </div>

                <div className="container my-3">
                    <div className="row">
                        <div className="col my-3">
                            <h5>Mask</h5>
                            <Paint image={this.state.image} ref={this.ref.mask}/>
                        </div>

                        <div className="col my-3">
                            <h5>Source</h5>
                            <Paint image={this.state.image} ref={this.ref.src}/>
                        </div>
                    </div>
                </div>


                <div className="container my-3">
                    <h5>Dest</h5>

                    <div className="row my-2">
                        <div className="col">
                            <span>Width: </span>
                            <input type="number" min="0" onChange={this.onWidthChange}/>
                        </div>
                    </div>
                    <div className="row my-2">
                        <div className="col">
                            <span>Height: </span>
                            <input type="number" min="0" onChange={this.onHeightChange}/>
                        </div>
                    </div>
                    <div className="row my-2">
                        <div className="col">
                            <button onClick={this.createMap}>OK</button>
                        </div>
                    </div>
                    
                    <Paint className="shadow" image={this.state.map} ref={this.ref.dst}/>
                </div>
                
                <div className="container my-3">
                    {/* <button onClick="transform()">Transform preview</button> */}
                    <button onClick={this.exportMask}>Get mask</button>
                    <button onClick={this.exportTransform}>Get transform</button>
                </div>

                {/* <div className="container my-3">
                    <canvas class="shadow"></canvas>
                </div> */}

            </React.Fragment>
        )
    }
}

export default App
