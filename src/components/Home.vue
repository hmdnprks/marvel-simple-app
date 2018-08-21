<template>
    <div id="app">
        <div v-show="isLoading" class="sk-cube-grid">
            <div class="sk-cube" :class="['sk-cube' + n]" v-for="n in 9" :key="n"></div>
        </div>
        <input type="text" v-model="filterValue" placeholder="Search name">
        <div class="sort-buttons">
            <button class="btn btn-primary btn-sm" @click="invertSort()">Sort by name <font-awesome-icon :icon="sortAsc ? 'sort-up' : 'sort-down'" /></button>
            <button class="btn btn-primary btn-sm" @click="invertSortComic()">Sort by available comics <font-awesome-icon :icon="sortComicAsc ? 'sort-up' : 'sort-down'" /></button>
        </div> 
        <p class="intro">Or pick characters starts with</p>  
        <div id="nav-letters" class="letters-container">         
            <span :class="{activated : letterPicked === letter}" @click="getCharactersStartWith(letter)" class="letter-element" v-for="letter in letters" :key="letter">
                {{ letter }}
            </span>
        </div>    
        <h2>List of Marvel Characters</h2>
        <p v-show="isNoResult" class="no-result">No result available</p>
        <div class="character col-md-3 col-sm-12 col-lg-3" v-for="character in filteredAndSortedData" :key="character.id">
                <figure class="char_image">
                    <img @click="goToCharacterDetail(character.id)" :src="character.thumbnail.path + '/landscape_xlarge.jpg'">
                </figure>            
            <div class="details">
                <p @click="goToCharacterDetail(character.id)">{{ character.name }}</p>
                <p>Comics available : <font-awesome-icon icon="book"/> <span @click="character.comics.available ? goToComicsDetail(character.id) : ''" :class="character.comics.available ? 'available' : ''">{{ character.comics.available }}</span> </p>
                <p>Series available : <font-awesome-icon icon="address-card"/> <span @click="character.series.available ? goToSeriesDetail(character.id) : ''" :class="character.series.available ? 'available' : ''">{{ character.series.available }}</span> </p>        
                <div class="urls">
                    <font-awesome-icon icon="link"/> <a :href="link.url" target="_blank"  v-for="link in character.urls" :key="link.type" :title="link.type">{{ link.type === 'comiclink' ? 'comic' : link.type }}<span></span></a>
                </div>
            </div>
        </div>
        <div class="load-more-wrapper">
            <button v-show="isLoadMoreShow" @click="loadMore" class="btn btn-primary" id="load-more-button">Load more</button>
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

Vue.component('loader',{
    data : function(){
        return {
        }
    },
    template : '<div v-show="isLoading" class="sk-cube-grid"><div class="sk-cube sk-cube1"></div><div class="sk-cube sk-cube2"></div><div class="sk-cube sk-cube3"></div><div class="sk-cube sk-cube4"></div><div class="sk-cube sk-cube5"></div><div class="sk-cube sk-cube6"></div><div class="sk-cube sk-cube7"></div><div class="sk-cube sk-cube8"></div><div class="sk-cube sk-cube9"></div></div>'
})

export default {
    name : 'Home',
    data : function(){
        return {
            characters: [],
            filterValue : '',
            sortAsc : true,
            sortComicAsc : true,
            isLoadMoreShow : true,
            isLoading : false,
            letters : [],
            isStartWithLetter : false,
            letterPicked : '',
            isNoResult : false,
            attributionText : ''
        }
    },
    computed : {
        filteredAndSortedData(){
            // apply filter first
            let result = this.characters
            if(this.filterValue){
                this.isLoadMoreShow = false
                result = result.filter(item => item.name.toLowerCase().indexOf(this.filterValue.toLowerCase()) > -1)
            }

            return result
            // sort the remaining values
            
        }
    },
    methods : {
        getInitialUsers(){
            this.isLoading = true
            axios.get('https://gateway.marvel.com:443/v1/public/characters?limit=10&offset=0&apikey=' + api_key)
                .then(response => {
                    this.attributionText = response.data.attributionText
                    let results = response.data.data.results
                    for(let i = 0; i < results.length ; i++){
                        this.characters.push(results[i])
                    }
                    this.isLoading = false
                    count += results.length
            })
        },
        getCharactersStartWith(letter){
            this.characters = []
            this.isNoResult = false
            this.letterPicked = letter
            this.isStartWithLetter = true
            count = 0
            this.isLoading = true
            axios.get('https://gateway.marvel.com:443/v1/public/characters?nameStartsWith=' + letter + '&limit=10&offset=0&apikey=' + api_key)
                .then(response => {
                    let results = response.data.data.results
                    count += results.length
                    if(results.length === 0){
                        this.isLoadMoreShow = false
                        this.isNoResult = true
                    } 
                    if(response.data.data.total - count > 0) {
                        this.isLoadMoreShow = true
                    } else {
                        this.isLoadMoreShow = false
                    }
                    for(let i = 0; i < results.length ; i++){
                        this.characters.push(results[i])
                    }
                    this.isLoading = false
            })
        },
        getLetters(){
            let listNumber = Array.from(Array(10).keys())
            let listLetters = Array.apply(null, {length : 26}).map((x,i) => String.fromCharCode(65 + i))
            let list = listNumber.concat(listLetters)
            this.letters = list
        },
        scroll(character){
            window.onscroll = () => {
                let bottomOfWindow = document.documentElement.scrollTop + window.innerHeight === document.documentElement.offsetHeight
                if(bottomOfWindow){
                    axios.get('https://gateway.marvel.com:443/v1/public/characters?limit=10&offset=' + count + '&apikey=' + api_key)
                        .then(response => {
                        let results = response.data.data.results
                        for(let i = 0; i < results.length ; i++){
                            this.characters.push(results[i])
                        }
                        count += results.length
                    })
                }
            }
        },
        goToCharacterDetail(id){
            this.$router.push({ name : 'character', params : {id : id}})
        },
        goToComicsDetail(id){
            this.$router.push({ name : 'comics', params : {id : id}})
        },
        goToSeriesDetail(id){
            this.$router.push({ name : 'series', params : {id : id}})
        },
        loadMore(){
            this.isLoading = true
            let link = ''
            if(!this.isStartWithLetter){
                link = 'https://gateway.marvel.com:443/v1/public/characters?limit=10&offset=' + count + '&apikey=' + api_key
            } else {
                link = 'https://gateway.marvel.com:443/v1/public/characters?nameStartsWith=' + this.letterPicked + '&limit=10&offset=' + count + '&apikey=' + api_key 
            }
            axios.get(link)
                .then(response => {
                    let results = response.data.data.results
                    count += results.length
                    console.log(response.data.data.total - count)
                    if(results.length === 0){
                        this.isLoadMoreShow = false
                    }
                    if(response.data.data.total - count > 0) {
                        this.isLoadMoreShow = true
                    } else {
                        this.isLoadMoreShow = false
                    }
                    for(let i = 0; i < results.length ; i++){
                        this.characters.push(results[i])
                    }
                    this.isLoading = false
                    
                })
        },
        invertSort(){
            this.sortAsc = !this.sortAsc
            let ascDesc = this.sortAsc ? 1 : -1
            this.characters.sort((a,b) => ascDesc * a.name.localeCompare(b.name)) 
        },
        invertSortComic(){
            this.sortComicAsc = !this.sortComicAsc
            let ascDescComic = this.sortComicAsc ? 1 : -1
            this.characters.sort((c,d) => ascDescComic * (c.comics.available -d.comics.available)) 
        }
    },
    beforeMount(){
        this.getLetters()
        this.getInitialUsers()
    },
    mounted(){
        //this.scroll(this.character)
    }
}
</script>

<style lang="scss">
    @import '../styles/custom-bootstrap.scss';
    @import './node_modules/bootstrap/scss/bootstrap.scss';
    /* Optional Styles */
.intro{
    margin-bottom: 0;
    margin-top : 20px;
}

.letters-container{
    text-align: center;
    font-size: 1.4em;
    line-height: 3em;
    background-color: white;
    color: #A90F18;
    cursor: pointer;
    .letter-element{
        margin-right: 10px;
        text-align: center;
        &.activated{
            justify-content: center;
            align-items: center;
            border-radius: 100%;
            background: #FBDB6A;
            font-weight: 900;
            }
    }
}
 .sk-cube-grid {
    position: fixed;
    text-align: center;
    top:0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    z-index: 99;
    width: 40px;
    height: 40px;
    .sk-cube {
        width: 33%;
        height: 33%;
        background-color: #A90F18;
        float: left;
        -webkit-animation: sk-cubeGridScaleDelay 1.3s infinite ease-in-out;
        animation: sk-cubeGridScaleDelay 1.3s infinite ease-in-out;
    }
    .sk-cube1 {
        -webkit-animation-delay: 0.2s;
        animation-delay: 0.2s;
    }
    .sk-cube2 {
        -webkit-animation-delay: 0.3s;
        animation-delay: 0.3s;
    }
    .sk-cube3 {
        -webkit-animation-delay: 0.4s;
        animation-delay: 0.4s;
    }
    .sk-cube4 {
        -webkit-animation-delay: 0.1s;
        animation-delay: 0.1s;
    }
    .sk-cube5 {
        -webkit-animation-delay: 0.2s;
        animation-delay: 0.2s;
    }
    .sk-cube6 {
        -webkit-animation-delay: 0.3s;
        animation-delay: 0.3s;
    }
    .sk-cube7 {
        -webkit-animation-delay: 0s;
        animation-delay: 0s;
    }
    .sk-cube8 {
        -webkit-animation-delay: 0.1s;
        animation-delay: 0.1s;
    }
    .sk-cube9 {
        -webkit-animation-delay: 0.2s;
        animation-delay: 0.2s;
    }
}

@-webkit-keyframes sk-cubeGridScaleDelay {
  0%, 70%, 100% {
    -webkit-transform: scale3D(1, 1, 1);
    transform: scale3D(1, 1, 1);
  }

  35% {
    -webkit-transform: scale3D(0, 0, 1);
    transform: scale3D(0, 0, 1);
  }
}


@keyframes sk-cubeGridScaleDelay {
  0%, 70%, 100% {
    -webkit-transform: scale3D(1, 1, 1);
    transform: scale3D(1, 1, 1);
  }

  35% {
    -webkit-transform: scale3D(0, 0, 1);
    transform: scale3D(0, 0, 1);
  }
}
 .character {
    display: inline-block;
    height : 100%;
    background: #fefefe;
    border : 2px solid #fcfcfc;
    box-shadow: 0 1px 2px rgba(34, 25, 25, 0.4);
    border-radius: 2px;
    margin: 0 20px 15px auto;
    padding: 20px;
    transition: opacity .4s ease-in-out;
    figure{
        background: #D31F2A;
        img{
            width: 100%;
            height: auto;
            border-radius: 2px;
            opacity: 1;
            -webkit-transition: .3s ease-in-out;
            transition: .3s ease-in-out;
        }
        :hover{
            opacity: .5;
            cursor: pointer;
        }
    }

    ul>li{
        list-style: none
    }
    .details{
        p{
            &:first-child{
                 text-transform: capitalize;
                font-size: 1.5rem;
                font-weight: 900;
                &:hover{
                color :#A90F18;
                cursor: pointer;
                }  
            }
            .available{
                font-weight: 700;
                color : #A90F18;
                &:hover{
                    cursor: pointer;
                }
            }  
        }
        .urls{
            a{
                &:not(:last-child){
                    ::after{
                        content: ' | ';
                    }
                }
                
            }
        }
    }
}
.load-more-wrapper{
    position: relative;
    margin: 0 auto;
    button{
        text-align: center;
    }
}

.sort-buttons{
    display: inline-block;

}
</style>

