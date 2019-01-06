import 'babel-polyfill'
import 'coffeekraken-sugar/js/features/all'
import SLayersTransitionComponent from '../../../dist/index'

const $transitionElm = document.querySelector('s-layers-transition')
$transitionElm.animateIn().then(() => {
  $transitionElm.animateOut()
})
