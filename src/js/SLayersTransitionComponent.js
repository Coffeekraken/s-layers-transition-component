import SWebComponent from 'coffeekraken-sugar/js/core/SWebComponent'
import { TweenMax, TimelineMax, Expo } from 'gsap'
import dispatchEvent from 'coffeekraken-sugar/js/dom/dispatchEvent'

/**
 * Create a nice layered transition for your webapp with fully customizable look and feel.
 * @example    html
 * <s-layers-transition layers="[{color:'#ff0000',side:'left'},{color:'#00ff00',side:'right'}]"></s-layers-transition>
 *
 * @author    Olivier Bossel <olivier.bossel@gmail.com> (https://olivierbossel.com)
 * @see    https://ddd.ge    Inspiration source
 */
export default class SLayersTransitionComponent extends SWebComponent {
  /**
   * Default props
   * @definition    SWebComponent.defaultProps
   * @protected
   */
  static get defaultProps () {
    return {

      /**
       * Specify the delay in second between each layers animations
       * @prop
       * @type    {Number}
       */
      delay: 0.2,

      /**
       * Specify the duration of 1 layer animation in second
       * @prop
       * @type    {Number}
       */
      duration: 0.6,

      /**
       * Specify the delay of the second point. This will create the slope in the animation
       * @prop
       * @type    {Number}
       */
      secondPointDelay: 0.15,

      /**
       * Set the layers. One layer in composed of:
       * ```js
       * {
       *  color: '#ff0000',
       *  side: 'left' // or right
       * }
       * ```
       *
       * @prop
       * @type    {Array<Object>}
       */
      layers: [{
        color: '#242c2f',
        side: 'left'
      }, {
        color: '#f2bc2b',
        side: 'right'
      }]

    }
  }

  /**
   * Css
   * @protected
   */
  static defaultCss (componentName, componentNameDash) {
    return `
      ${componentNameDash} {
        display: none;
        pointer-events: none;
      }
      ${componentNameDash}.active {
        display: block;
        pointer-events: all;
      }
    `
  }

  /**
   * Component will mount
   * @definition    SWebComponent.componentWillMount
   * @protected
   */
  componentWillMount () {
    super.componentWillMount()

    // layers
    this._layers = []

    // create a canvas to draw in
    this.$canvasElm = document.createElement('canvas')
    const [w, h] = [this.offsetWidth, this.offsetHeight]
    this.$canvasElm.width = w
    this.$canvasElm.height = h
    this.appendChild(this.$canvasElm)

    // set the layers
    this.props.layers.forEach((layer) => {
      this._addLayer(layer.color, layer.side)
    })
  }

  /**
   * Component will receive prop
   * @definition    SWebComponent.componentWillReceiveProp
   * @protected
   */
  componentWillReceiveProp (name, newVal, oldVal) {
    switch (name) {
      case 'layers':
        this._layers = []
        // set the layers
        this.props.layers.forEach((layer) => {
          this._addLayer(layer.color, layer.side)
        })
        break
    }
  }

  /**
   * Add a layer to be drawn
   * @param    {String}    color    The color of the layer
   * @param    {String}    side    The side of the layer. Can be `left` of `right`
   * @private
   * @author    Olivier Bossel <olivier.bossel@gmail.com> (https://olivierbossel.com)
   */
  _addLayer (color, side = 'left') {
    const [w, h] = [this.offsetWidth, this.offsetHeight]
    this._layers.push({
      color,
      side,
      points: [{ x: 0, y: h }, { x: w, y: h }, { x: w, y: h }, { x: 0, y: h }]
    })
  }

  /**
   * Animate the transition in
   * @param    {Function}    onComplete    A callback when the transition is finished
   * @author    Olivier Bossel <olivier.bossel@gmail.com> (https://olivierbossel.com)
   */
  animateIn (onComplete) {
    // add the active class
    this.classList.add('active')

    setTimeout(() => {

      const ctx = this.$canvasElm.getContext('2d')
      const [w, h] = [this.offsetWidth, this.offsetHeight]
      this.$canvasElm.width = w
      this.$canvasElm.height = h
      ctx.globalCompositeOperation = 'add'

      const tl = new TimelineMax({
        onComplete: () => {
          // callback
          onComplete && onComplete(this)
          /**
           * @event
           * @name    in:complete
           * Event dispatched when the transition in is completed
           */
          dispatchEvent(this, 'in:complete')
        },
        onUpdate: () => {
          ctx.clearRect(0, 0, w, h)

          this._layers.forEach((layer, i) => {
            ctx.beginPath()
            ctx.moveTo(layer.points[0].x, layer.points[0].y)
            ctx.lineTo(layer.points[1].x, layer.points[1].y)
            ctx.lineTo(layer.points[2].x, layer.points[2].y)
            ctx.lineTo(layer.points[3].x, layer.points[3].y)
            ctx.closePath()
            ctx.fillStyle = layer.color
            ctx.fill()
          })
        }
      })

      const d = this.props.duration

      this._layers.forEach((layer, i) => {
        if (layer.side === 'left') {
          tl.insert(new TweenMax(layer.points[0], d, { y: 0, ease: Expo.easeInOut }), this.props.delay * i)
          tl.insert(new TweenMax(layer.points[1], d + this.props.secondPointDelay, { y: 0, ease: Expo.easeInOut }), this.props.delay * i)
        } else {
          tl.insert(new TweenMax(layer.points[1], d, { y: 0, ease: Expo.easeInOut }), this.props.delay * i)
          tl.insert(new TweenMax(layer.points[0], d + this.props.secondPointDelay, { y: 0, ease: Expo.easeInOut }), this.props.delay * i)
        }
      })

    })
  }

  /**
   * Animate the transition out
   * @param    {Function}    onComplete    A callback when the transition is finished
   * @author    Olivier Bossel <olivier.bossel@gmail.com> (https://olivierbossel.com)
   */
  animateOut (onComplete) {
    setTimeout(() => { // avoid flickering
      const ctx = this.$canvasElm.getContext('2d')
      const [w, h] = [this.offsetWidth, this.offsetHeight]
      this.$canvasElm.width = w
      this.$canvasElm.height = h
      ctx.globalCompositeOperation = 'add'

      const tl = new TimelineMax({
        onComplete: () => {
          // remove the active class
          this.classList.remove('active')
          // reset points
          this._layers.forEach((layer) => {
            layer.points = [{ x: 0, y: h }, { x: w, y: h }, { x: w, y: h }, { x: 0, y: h }]
          })
          // callback
          onComplete && onComplete(this)
          /**
         * @event
         * @name    out:complete
         * Event dispatched when the transition out is completed
         */
          dispatchEvent(this, 'out:complete')
        },
        onUpdate: () => {
          ctx.clearRect(0, 0, w, h)

          this._layers.forEach((layer) => {
            ctx.beginPath()
            ctx.moveTo(layer.points[0].x, layer.points[0].y)
            ctx.lineTo(layer.points[1].x, layer.points[1].y)
            ctx.lineTo(layer.points[2].x, layer.points[2].y)
            ctx.lineTo(layer.points[3].x, layer.points[3].y)
            ctx.closePath()
            ctx.fillStyle = layer.color
            ctx.fill()
          })
        }
      })

      const d = this.props.duration

      this._layers.forEach((layer, i) => {
        if (layer.side === 'left') {
          tl.insert(new TweenMax(layer.points[2], d, { y: 0, ease: Expo.easeInOut }), this.props.delay * (this._layers.length - 1) - this.props.delay * i)
          tl.insert(new TweenMax(layer.points[3], d + this.props.secondPointDelay, { y: 0, ease: Expo.easeInOut }), this.props.delay * (this._layers.length - 1) - this.props.delay * i)
        } else {
          tl.insert(new TweenMax(layer.points[2], d + this.props.secondPointDelay, { y: 0, ease: Expo.easeInOut }), this.props.delay * (this._layers.length - 1) - this.props.delay * i)
          tl.insert(new TweenMax(layer.points[3], d, { y: 0, ease: Expo.easeInOut }), this.props.delay * (this._layers.length - 1) - this.props.delay * i)
        }
      })
    })
  }
}
