
/**
 * Return:
 * 0: collinear
 * 1: counter-clockwise
 * 2: clockwise
 */
function orientation(a, b, c) {
    //(a.x - b.x) / (a.y - b.y) vs (a.x - c.x) / (a.y - c.y)
    let d = (a.x - b.x) * (a.y - c.y) - (a.x - c.x) * (a.y - b.y)
    if (d > 0) return 1
    if (d < 0) return -1
    return 0
}

function intersect(a, b, c, d) {
    let u = orientation(a, b, c)
    let v = orientation(a, b, d)

    if (u === v) {
        if (u === 0) {
            return  a.x >= Math.min(c.x, d.x) && a.x <= Math.max(c.x, d.x) ||
                    b.x >= Math.min(c.x, d.x) && b.x <= Math.max(c.x, d.x)
        }
        return false
    }

    return orientation(c, d, a) !== orientation(c, d, b)
}

function point_in_polygon({ x, y }, poly) {
    let cut = 0
    for (let i = 0; i < poly.length; i++) {
        let point = poly[i]
        let next = poly[(i + 1) % poly.length]

        cut += intersect({ x, y }, { x: 10000, y }, point, next)
    }
    return cut % 2 !== 0
}


class Point {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.prev = null
        this.next = null
    }
}

/* No overlapped poly tree */
class PolyTree {
    constructor(points, children) {
        this.points = points
        if (Array.isArray(children)) {
            children = children.map(x => new PolyTree(x.points, x.children))
        }
        
        this.nodes = children || new Set()
        this.add = this.add.bind(this)
    }

    add(poly) {
        let point = poly[0]
        let nested = false
        let children = new Set()

        for (let tree of this.nodes) {
            if (point_in_polygon(point, tree.points)) {
                tree.add(poly)
                nested = true
                break
            }
            if (point_in_polygon(tree.points[0], poly)) {
                children.add(tree)
            }
        }

        if (!nested) {
            for (let node of children) this.nodes.delete(node)
            this.nodes.add(new PolyTree(poly, children))
        }
    }
}

export { Point, PolyTree, intersect }
