// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import VueRouter from 'vue-router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faSortUp, faSortDown, faBook, faBookReader, faLink, faAddressCard, faMoneyBill,  } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faSortUp, faMoneyBill, faSortDown, faBook, faBookReader, faLink, faAddressCard)
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.config.productionTip = false

Vue.use(VueRouter)
import Home from './components/Home'
import Character from './components/Character'
import Comics from './components/Comics'
import Series from './components/Series'
import Stories from './components/Stories'

const routes = [
  {path : '/', component:Home},
  {path : '/character/:id', component:Character, name: 'character'},
  {path : '/comics/:id', component:Comics, name: 'comics'},
  {path : '/series/:id', component:Series, name: 'series'},
  {path : '/stories/:id', component:Stories, name: 'stories'}
]

const router = new VueRouter({
  routes, // short for routes: routes
  mode : 'history'
})


/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
}).$mount('#app')


