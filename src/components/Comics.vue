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
                    <img @click="goToDetail(comic.urls.find(seri => seri.type === 'detail') === undefined ? '#' : comic.urls.find(seri => seri.type === 'detail').url)" :src="comic.thumbnail.path + '/landscape_xlarge.jpg'">
                </figure>            
            <div class="details">
                <p>{{ comic.title }}</p>
                <p>Printed Price : $ {{ comic.prices.find(price => price.type === 'printPrice').price}}</p>
                <p>Digital Version Price : $ {{ comic.prices.find(price => price.type === 'digitalPurchasePrice') === undefined ? 'N/A' : comic.prices.find(price => price.type === 'digitalPurchasePrice').price }} <span class="cart-icon"><a :href="comic.urls.find(url => url.type === 'purchase') === undefined ? '#' : comic.urls.find(url => url.type === 'purchase').url" target="_blank" title="Purchase Digital Version"><font-awesome-icon v-show="comic.urls.find(url => url.type === 'purchase') !== undefined" icon="cart-arrow-down"/></a></span></p>
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
            let ascDescPrice = this.sortPrintPriceAsc ? 1 : -1
            this.comicsDetail.sort((c,d) => ascDescPrice * (c.prices.find(price => price.type === 'printPrice').price - d.prices.find(price => price.type === 'printPrice').price)) 
        },
        invertDigitalPriceSort(){
            this.sortDigitalPriceAsc = !this.sortDigitalPriceAsc
            let ascDescDigitalPrice = this.sortDigitalPriceAsc ? 1 : -1
            this.comicsDetail.sort((c,d) => ascDescDigitalPrice * ((c.prices.find(price => price.type === 'digitalPurchasePrice') === undefined ? 0 : c.prices.find(price => price.type === 'digitalPurchasePrice').price) - (d.prices.find(price => price.type === 'digitalPurchasePrice') === undefined ? 0 : d.prices.find(price => price.type === 'digitalPurchasePrice').price))) 
        },
        goToDetail(url){
            window.open(url, '_blank')
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

</style>
