<template>
    <div id="app">
        <div v-show="isLoading" class="sk-cube-grid">
            <div class="sk-cube" :class="['sk-cube' + n]" v-for="n in 9" :key="n"></div>
        </div>
        <div class="character col-md-12 col-sm-12 col-lg-12">
                <figure class="char_image">
                    <img :src="getThumbnail + '/landscape_xlarge.jpg'">
                </figure>
        </div>
        <footer>
            {{ attributionText }}
        </footer>
    </div>
</template>

<script>
import axios from 'axios' 
import Vue from 'vue' 
const api_key = 'a5c64278ec9193f8d599cf3b075cc3eb'
var count = 0
export default {
    name : 'Character',
    data : function(){
        return {
            isLoading : false,
            character: this.$route.params.id,
            characterDetails : [],
            attributionText : ''
        }
    },
    computed :{
        getThumbnail(){
            let path = ''
            if(this.characterDetails.length > 0){
                path = this.characterDetails[0].thumbnail.path
            } 
            if(path === ''){
                path = 'http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available'
            }
            return path
        }
    },
    methods : {
        getInitialCharacter(){
            this.isLoading = true
            axios.get('https://gateway.marvel.com:443/v1/public/characters/' + this.character + '?apikey=' + api_key)
                .then(response => {
                    this.attributionText = response.data.attributionText
                    let results = response.data.data.results
                    for(let i = 0; i < results.length ; i++){
                        this.characterDetails.push(results[i])
                    }
                    console.log(this.characterDetails)
                    this.isLoading = false
            })
        }
    },
    beforeMount(){
        this.getInitialCharacter()
    }
}
</script>

<style lang="scss">
@import '../styles/custom-bootstrap.scss';
@import './node_modules/bootstrap/scss/bootstrap.scss';


</style>


