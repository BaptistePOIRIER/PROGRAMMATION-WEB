<template>
  <div>
    <h2>Se connecter</h2>
    <input v-model="loginInfos.email" placeholder="Email">
    <input v-model="loginInfos.password" placeholder="password">
    <button @click="login()">Valider</button>
    <br>
    <router-link to='/register'>Créer un compte</router-link>
  </div>
</template>

<script>
module.exports = {
  data () {
    return {
      loginInfos: {
          email: '',
          password: ''
      }
    }
  },
  methods: {
      login() {
          this.$emit('login', this.loginInfos)
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
