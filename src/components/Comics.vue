<template>
    <div id="app">
         <div v-show="isLoading" class="sk-cube-grid">
            <div class="sk-cube" :class="['sk-cube' + n]" v-for="n in 9" :key="n"></div>
        </div>
        <input type="text" v-model="filterValue" placeholder="Search comic name">
        <div class="sort-buttons">
            <button class="btn btn-primary btn-sm" @click="invertSort()">Sort by name <font-awesome-icon :icon="sortAsc ? 'sort-up' : 'sort-down'" /></button>
            <button class="btn btn-primary btn-sm" @click="invertPrintPriceSort()">Sort by printed comic price <font-awesome-icon :icon="sortPrintPriceAsc ? 'sort-up' : 'sort-down'" /></button>
            <button class="btn btn-primary btn-sm" @click="invertDigitalPriceSort()">Sort by digital comic price <font-awesome-icon :icon="sortDigitalPriceAsc ? 'sort-up' : 'sort-down'" /></button>
        </div>
        <p class="intro">Or pick characters starts with</p>  
        <div id="nav-letters" class="letters-container">         
            <span :class="{activated : letterPicked === letter}" @click="getComicsStartWith(letter)" class="letter-element" v-for="letter in letters" :key="letter">
                {{ letter }}
            </span>
        </div>
        <h2 v-for="character in characterDetails" :key="character.id">List of {{ character.name }}'s Comics</h2>
        <p v-show="isNoResult" class="no-result">No result available</p>
        <div class="comic col-md-4 col-sm-12 col-lg-4" v-for="comic in filteredAndSortedData" :key="comic.id">
                <figure class="char_image">
                    <img :src="comic.thumbnail.path + '/landscape_xlarge.jpg'">
                </figure>            
            <div class="details">
                <p>{{ comic.title }}</p>
                <p>Printed Price : $ {{ comic.prices.find(price => price.type === 'printPrice').price}}</p>
                <p>Digital Version Price : $ {{ comic.prices.find(price => price.type === 'digitalPurchasePrice').price === undefined ? 'N/A' : comic.prices.find(price => price.type === 'digitalPurchasePrice').price}}</p>


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

export default {
    name : 'Comics',
    data : function(){
        return {
            isLoading : false,
            character: this.$route.params.id,
            characterName : '',
            characterDetails : [],
            comicsDetail : [],
            attributionText : '',
            filterValue : '',
            sortAsc : true,
            sortPrintPriceAsc : true,
            sortDigitalPriceAsc : true,
            isLoadMoreShow : true,
            letters : [],
            isStartWithLetter : false,
            letterPicked : '',
            isNoResult : false,
        }
    },
    computed : {
        filteredAndSortedData(){
            let result = this.comicsDetail
            if(this.filterValue){
                this.isLoadMoreShow = false
                result = result.filter(item => item.title.toLowerCase().indexOf(this.filterValue.toLowerCase()) > -1)
            }
            return result            
        }
    },
    methods : {
        getInitialComics(){
            this.isLoading = true
            axios.get('https://gateway.marvel.com:443/v1/public/characters/' + this.character + '/comics?apikey=' + api_key)
                .then(response => {
                    this.attributionText = response.data.attributionText
                    let results = response.data.data.results
                    for(let i = 0; i < results.length ; i++){
                        this.comicsDetail.push(results[i])
                    }
                    this.isLoading = false
            })
        },
        getInitialCharacter(){
            this.isLoading = true
            axios.get('https://gateway.marvel.com:443/v1/public/characters/' + this.character + '?apikey=' + api_key)
                .then(response => {
                    let results = response.data.data.results
                    for(let i = 0; i < results.length ; i++){
                        this.characterDetails.push(results[i])
                    }
                    
                    this.isLoading = false
            })
        },
        getComicsStartWith(letter){
            this.comicsDetail = []
            this.isNoResult = false
            this.letterPicked = letter
            this.isStartWithLetter = true
            count = 0
            this.isLoading = true
            axios.get('https://gateway.marvel.com:443/v1/public/characters/' + this.character + '/comics?titleStartsWith=' + letter + '&limit=10&offset=0&apikey=' + api_key)
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
                        this.comicsDetail.push(results[i])
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
        loadMore(){
            this.isLoading = true
            let link = ''
            if(!this.isStartWithLetter){
                link = 'https://gateway.marvel.com:443/v1/public/characters/' + this.character + '/comics?limit=10&offset=' + count + '&apikey=' + api_key
            } else {
                link = 'https://gateway.marvel.com:443/v1/public/characters/' + this.character + '/comics?titleStartsWith=' + this.letterPicked + '&limit=10&offset=' + count + '&apikey=' + api_key 
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
                        this.comicsDetail.push(results[i])
                    }
                    this.isLoading = false
                    
                })
        },
        invertSort(){
            this.sortAsc = !this.sortAsc
            let ascDesc = this.sortAsc ? 1 : -1
            this.comicsDetail.sort((a,b) => ascDesc * a.title.localeCompare(b.title)) 
        },
        invertPrintPriceSort(){
            this.sortPrintPriceAsc = !this.sortPrintPriceAsc
            let ascDescPrice = this.sortPriceAsc ? 1 : -1
            this.comicsDetail.sort((c,d) => ascDescPrice * (c.prices.find(prices.type === 'printPrice').price - d.prices.find(prices.type === 'printPrice'.price))) 
        },
        invertDigitalPriceSort(){
            this.sortDigitalPriceAsc = !this.sortDigitalPriceAsc
            let ascDescDigitalPrice = this.sortDigitalPriceAsc ? 1 : -1
            this.comicsDetail.sort((c,d) => ascDescDigitalPrice * (c.prices.find(prices.type === 'digitalPurchasePrice').price - d.prices.find(prices.type === 'digitalPurchasePrice'.price))) 
        }
    }, 
    beforeMount(){
        this.getLetters()
        this.getInitialCharacter()
        this.getInitialComics()
    }
}
</script>

<style lang="scss">
    @import '../styles/custom-bootstrap.scss';
    @import './node_modules/bootstrap/scss/bootstrap.scss';
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

.comic {
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
                font-size: 1rem;
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
