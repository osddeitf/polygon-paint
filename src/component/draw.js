
/* Drawing function */
function drawPoint(ctx, { x, y }) {
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.arc(x, y, 3, 0, 2 * Math.PI)
    ctx.fillStyle = '#cccccc'
    ctx.fill()
    ctx.restore()
}

function drawImage(ctx, img) {
    ctx.drawImage(img, 0, 0)
}

function stroke(ctx, path) {
    ctx.save()
    ctx.strokeStyle = '#eeeeee'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    // ctx.lineDashOffset = 5
    
    ctx.stroke(path)
    ctx.restore()
}

function polygonPath(points, closed) {
    let path = new Path2D()
    let first = points[0]
    path.moveTo(first.x, first.y)

    for(let i = 1; i < points.length; i++) {
        path.lineTo(points[i].x, points[i].y)
    }

    if (closed) {
        path.lineTo(first.x, first.y)
    }

    return path
}

function clear(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
}

export default { drawPoint, drawImage, stroke, polygonPath, clear }
