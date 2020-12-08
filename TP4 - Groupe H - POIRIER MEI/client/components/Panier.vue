<template>
  <div>
    <h2>Mon Panier</h2>
    <article v-for="article in panier.articles" :key="article.id">
      <div class="article-img">
        <div :style="{ backgroundImage: 'url(' + articles[article.id-1].image + ')' }">
        </div>
      </div>
      <div class="article-content">
      <div class="article-title">
          <h2>{{ articles[article.id-1].name }} - {{ articles[article.id-1].price }}€ - Quantité : {{article.quantity}}</h2>
          <div v-if="articleEditQuantityId !== article.id">
            <button @click="startEditQuantity(article.id)">Modifier la quantité</button>
          </div>
          <div v-if="articleEditQuantityId == article.id">
            <input v-model="newQuantity" placeholder="Nouvelle quantité">
            <button @click="editQuantity(article.id)">Valider</button>
            <button @click="abortEditQuantity()">Annuler</button>
          </div>
      </div>
      <p>{{ articles[article.id-1].description }}</p>
      </div>
    </article>
  </div>
</template>

<script>
module.exports = {
  props: {
    articles: { type: Array, default: [] },
    panier: { type: Object }
  },
  data () {
    return {
      newQuantity: null,
      articleEditQuantityId: -1
    }
  },
  async mounted () {
  },
  methods: {
    startEditQuantity (articleId) {
      this.articleEditQuantityId = articleId
    },
    editQuantity (articleId) {
      article = {
        id: articleId,
        quantity: this.newQuantity
      }
      this.$emit('edit-quantity', article)
      this.abortEditQuantity()
    },
    abortEditQuantity () {
      this.newQuantity = null
      this.articleEditQuantityId = -1
    }
  }
}
</script>

<style scoped>
article {
  display: flex;
  background-color: lightgray;
  padding: 10px;
  margin: 10px;
  border: 2px solid black;
  border-radius: 10px;
}

button {
  background-color: rgb(231, 231, 231);
  transition: .4s;
}

button:hover {
  background-color: darkgray;
  transition: .4s;
}

.article-img {
  flex: 1;
}

.article-img div {
  width: 100px;
  height: 100px;
  background-size: cover;
}

.article-content {
  flex: 3;
}

.article-title {
  display: flex;
  justify-content: space-between;
}

textarea {
  width: 100%;
}
</style>
