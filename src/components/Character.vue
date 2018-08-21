<template>
    <div id="app">
        <div v-show="isLoading" class="sk-cube-grid">
            <div class="sk-cube" :class="['sk-cube' + n]" v-for="n in 9" :key="n"></div>
        </div>
        <div class="character-single col-md-8 col-sm-12 col-lg-8">
                <div class="char-image">
                    <img v-for="char in characterDetails" :key="char.id" :src="char.thumbnail.path + '/portrait_xlarge.jpg'">
                    <p class="char-title" v-for="char in characterDetails" :key="char.id">{{ char.name }}</p>
                </div>
                <div class="char-details">
                        <h4>Description</h4>
                        <p v-for="char in characterDetails" :key="char.id">{{ char.description === '' ? 'No description available' : char.description }}</p>
                        <h4>Comics Available ({{ countComics }})</h4>
                        <div class="comics-preview">
                            <div @click="goToDetail(comic.urls.find(seri => seri.type === 'detail') === undefined ? '#' : comic.urls.find(seri => seri.type === 'detail').url)" v-for="comic in comicsDetails.slice(0, 5)" :key="comic.id" class="preview-wrap">
                                <img :src="comic.thumbnail.path + '/portrait_large.jpg'">
                                <p class="image-desc">{{ comic.title }}</p>
                            </div>                       
                            <h2 v-for="char in characterDetails" :key="char.id" @click="goToComicsDetail(char.id)" v-show="countComics > 5">+ {{ countComics > 5 ? countComics - 5 : 0}}</h2>
                        </div>
                        <h4>Series Available ({{ countSeries }})</h4>
                        <div class="series-preview">
                            <div @click="goToDetail(serial.urls.find(seri => seri.type === 'detail') === undefined ? '#' : serial.urls.find(seri => seri.type === 'detail').url)" v-for="serial in seriesDetails.slice(0, 5)" :key="serial.id" class="preview-wrap">
                                <img :src="serial.thumbnail.path + '/portrait_large.jpg'">
                                <p class="image-desc">{{ serial.title }}</p>
                            </div>                       
                            <h2 v-for="char in characterDetails" :key="char.id" @click="goToSeriesDetail(char.id)" v-show="countSeries > 5">+ {{ countSeries > 5 ? countSeries - 5 : 0}}</h2>
                        </div>
                </div>
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

export default {
    name : 'Character',
    data : function(){
        return {
            isLoading : false,
            character: this.$route.params.id,
            characterDetails : [],
            comicsDetails : [],
            countComics : 0,
            countSeries : 0,
            seriesDetails : [],
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
        },
        getInitialComics(){
            this.isLoading = true
            axios.get('https://gateway.marvel.com:443/v1/public/characters/' + this.character + '/comics?limit=5&offset=0&apikey=' + api_key)
                .then(response => {
                    let results = response.data.data.results
                    this.countComics = response.data.data.total
                    for(let i = 0; i < results.length ; i++){
                        this.comicsDetails.push(results[i])
                    }
                    this.isLoading = false
            })
        },
        getInitialSeries(){
            this.isLoading = true
            axios.get('https://gateway.marvel.com:443/v1/public/characters/' + this.character + '/series?limit=5&offset=0&apikey=' + api_key)
                .then(response => {
                    let results = response.data.data.results
                    this.countSeries = response.data.data.total
                    for(let i = 0; i < results.length ; i++){
                        this.seriesDetails.push(results[i])
                    }
                    this.isLoading = false
            })
        },
        goToDetail(url){
            window.open(url, '_blank')
        },
        goToComicsDetail(id){
            this.$router.push({ name : 'comics', params : {id : id}})
        },
        goToSeriesDetail(id){
            this.$router.push({ name : 'series', params : {id : id}})
        },
    },
    beforeMount(){
        this.getInitialCharacter()
        this.getInitialComics()
        this.getInitialSeries()
    }
}
</script>

<style lang="scss">
.char-title{
    color : #A90F18;
    font-weight: 900;
}
.character-single{
    display: inline-block;
    height : 100%;
    background: #fefefe;
    border : 2px solid #fcfcfc;
    box-shadow: 0 1px 2px rgba(34, 25, 25, 0.4);
    border-radius: 2px;
    margin: 0 20px 15px auto;
    padding: 20px;
    transition: opacity .4s ease-in-out;
    .char-image{
        background: #D31F2A;
        width: 30%;
        float: left;
        p{
            padding: 5px;
            color:#FBDB6A;
            font-size: large;
        }
        img{
            width: 100%;
            height: auto;
            border-radius: 2px;
            opacity: 1;
            -webkit-transition: .3s ease-in-out;
            transition: .3s ease-in-out;
        }
        
    }
    .char-details{
        width : 70%;
        float : right;
        text-align: left;
        padding: 0 20px;
        h4{
            color : #A90F18;
        }
        .comics-preview, .series-preview{
            width: 100%;
            h2{
                display: inline;
                text-align: center;
                margin-left: 30px;
                &:hover{
                    color : #A90F18;
                    cursor: pointer;
                }
            }
            .preview-wrap{
                position: relative;
                display: inline-block;
                img{
                    padding: 10px;
                    
                }
                p.image-desc{
                    position: absolute;
                    height: 100%;
                    padding: 10px;
                    font-size: 0.9rem;
                    text-align: center;
                    top: 0;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: rgba(169,15,24, 0.75);
                    color: #fff;
                    visibility: hidden;
                    opacity: 0;
                    /* transition effect. not necessary */
                    transition: opacity .2s, visibility .2s;
                }
                &:hover{
                    cursor: pointer;
                    p.image-desc{
                        visibility: visible;
                        opacity: 1;
                    }
                }
            }
        }
    }
}
</style>


