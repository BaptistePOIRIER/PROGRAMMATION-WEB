<template>
  <div>
    <h2>Créer un compte</h2>
    <input v-model="newAccount.email" placeholder="Email">
    <input v-model="newAccount.password" placeholder="password">
    <button @click="createAccount()">Valider</button>
  </div>
</template>

<script>
module.exports = {
  data () {
    return {
      newAccount: {
          email: '',
          password: ''
      }
    }
  },
  methods: {
      createAccount() {
          this.$emit('create-account', this.newAccount)
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
