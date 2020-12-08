const Home = window.httpVueLoader('./components/Home.vue')
const Panier = window.httpVueLoader('./components/Panier.vue')
const Register = window.httpVueLoader('./components/Register.vue')
const Login = window.httpVueLoader('./components/Login.vue')

const routes = [
  { path: '/', component: Home },
  { path: '/panier', component: Panier },
  { path: '/register', component: Register},
  { path: '/login', component: Login}
]

const router = new VueRouter({
  routes
})

var app = new Vue({
  router,
  el: '#app',
  data: {
    articles: [],
    panier: {
      createdAt: null,
      updatedAt: null,
      articles: []
    }
  },
  async mounted () {
    const res = await axios.get('/api/articles')
    this.articles = res.data
    const res2 = await axios.get('/api/panier')
    this.panier = res2.data
  },
  methods: {
    async addArticle (article) {
      const res = await axios.post('/api/article', article)
      this.articles.push(res.data)
    },
    async updateArticle (newArticle) {
      await axios.put('/api/article/' + newArticle.id, newArticle)
      const article = this.articles.find(a => a.id === newArticle.id)
      article.name = newArticle.name
      article.description = newArticle.description
      article.image = newArticle.image
      article.price = newArticle.price
    },
    async deleteArticle (articleId) {
      await axios.delete('/api/article/' + articleId)
      const index = this.articles.findIndex(a => a.id === articleId)
      this.articles.splice(index, 1)
    },
    async addToPanier (articleId) {
      const body = {
        id: articleId,
        quantity: 1
      }
      const res = await axios.post('/api/panier', body)
      this.panier.articles.push(res.data)
    },
    async removeFromPanier (articleId) {
      await axios.delete('/api/panier/' + articleId)
      const index = this.panier.articles.findIndex(a => a.id === articleId)
      this.panier.articles.splice(index, 1)
    },
    async editQuantity (article) {
      const body = {
        quantity: article.quantity
      }
      await axios.put('/api/panier/' + article.id, body)
      const index = this.panier.articles.findIndex(a => a.id === article.id)
      this.panier.articles[index].quantity = article.quantity
    },
    async pay () {
      try {
        const res = await axios.post('/api/panier/pay')
        this.panier = []
        console.log('response :', res.data)
      }
      catch {
        router.push('/login')
      }      
    },
    async createAccount (newAccount) {
      await axios.post('api/register', newAccount)
    },
    async login (loginInfos) {
      await axios.post('api/login', loginInfos)
    }
  }
})
