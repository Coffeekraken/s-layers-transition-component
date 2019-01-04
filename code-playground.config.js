module.exports = {
  // server port
  port: 3000,

  // title
  title: 's-layers-transition-component',

  // layout
  layout: 'right',

  // compile server
  compileServer: {

    // compile server port
    port: 4000

  },

  // editors
  editors: {
    html: {
      language: 'html',
      data: `
        <h1 class="h3 m-b-small">
          Coffeekraken s-layers-transition-component
        </h1>
        <p class="p m-b-bigger">
          Create a nice layered transition for your webapp with fully customizable look and feel.
        </p>
        <button class="btn btn--primary" onClick="playTransition()">
          Play the transition again
        </button>
        <s-layers-transition></s-layers-transition>
      `
    },
    css: {
      language: 'sass',
      data: `
        @import 'node_modules/coffeekraken-sugar/index';
        @import 'node_modules/coffeekraken-s-typography-component/index';
        @import 'node_modules/coffeekraken-s-button-component/index';
        @include s-init();
        @include s-classes();
        @include s-typography-classes();
        @include s-button-classes();
        body {
          padding: s-space(bigger);
        }
        s-layers-transition {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
      `
    },
    js: {
      language: 'js',
      data: `
        import SLayersTransitionComponent from './dist/index'
        window.playTransition = function() {
          document.querySelector('s-layers-transition').animateIn((elm) => {
            elm.animateOut()
          })
        }
        playTransition()
      `
    }
  }
}
