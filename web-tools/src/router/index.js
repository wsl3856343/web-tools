import { createRouter, createWebHistory } from 'vue-router'
import JsonFormatterView from '../views/JsonFormatterView.vue'
import Base64ConverterView from '../views/Base64ConverterView.vue'
import UuidGeneratorView from '../views/UuidGeneratorView.vue'
import UrlEncoderView from '../views/UrlEncoderView.vue'
import CodeDiffView from '../views/CodeDiffView.vue'
import JwtParserView from '../views/JwtParserView.vue'
import AirShareView from '../views/AirShareView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/json-formatter'
    },
    {
      path: '/json-formatter',
      name: 'json-formatter',
      component: JsonFormatterView
    },
    {
      path: '/base64-converter',
      name: 'base64-converter',
      component: Base64ConverterView
    },
    {
      path: '/uuid-generator',
      name: 'uuid-generator',
      component: UuidGeneratorView
    },
    {
      path: '/url-encoder',
      name: 'url-encoder',
      component: UrlEncoderView
    },
    {
      path: '/code-diff',
      name: 'code-diff',
      component: CodeDiffView
    },
    {
      path: '/jwt-parser',
      name: 'jwt-parser',
      component: JwtParserView
    },
    {
      path: '/air-share',
      name: 'air-share',
      component: AirShareView
    }
  ]
})

export default router