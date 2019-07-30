import React from 'react'

class ImageFile extends React.Component {

    constructor(props) {
        super(props)
        this.loadImage = this.loadImage.bind(this)
    }

    loadImage(e) {
        let target = e.target
        if (!target.files && !target.files.length) return

        let reader = new FileReader()
        reader.onload = (e) => {
            let image = new Image()
            image.onload = () => this.props.onChange(image)
            image.src = e.target.result
        }
        reader.readAsDataURL(target.files[0])
    }

    render() {
        return <input type="file" accept="image/*" onChange={this.loadImage} />
    }
}

export default ImageFile
