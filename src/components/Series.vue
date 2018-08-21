<template>
    <div id="app">
         <div v-show="isLoading" class="sk-cube-grid">
            <div class="sk-cube" :class="['sk-cube' + n]" v-for="n in 9" :key="n"></div>
        </div>
        <input type="text" v-model="filterValue" placeholder="Search series name">
        <div class="sort-buttons">
            <button class="btn btn-primary btn-sm" @click="invertSort()">Sort by name <font-awesome-icon :icon="sortAsc ? 'sort-up' : 'sort-down'" /></button>
            <button class="btn btn-primary btn-sm" @click="invertYearSort()">Sort by year <font-awesome-icon :icon="sortYearAsc ? 'sort-up' : 'sort-down'" /></button>
        </div>
        <p class="intro">Or pick characters starts with</p>  
        <div id="nav-letters" class="letters-container">         
            <span :class="{activated : letterPicked === letter}" @click="getSeriesStartWith(letter)" class="letter-element" v-for="letter in letters" :key="letter">
                {{ letter }}
            </span>
        </div>
        <h2 v-for="character in characterDetails" :key="character.id">List of {{ character.name }}'s Series</h2>
        <p v-show="isNoResult" class="no-result">No result available</p>
        <div class="serial col-md-4 col-sm-12 col-lg-4" v-for="serial in filteredAndSortedData" :key="serial.id">
                <figure class="char_image">
                    <img @click="goToDetail(serial.urls.find(seri => seri.type === 'detail') === undefined ? '#' : serial.urls.find(seri => seri.type === 'detail').url)" :src="serial.thumbnail.path + '/landscape_xlarge.jpg'">
                </figure>            
            <div class="details">
                <p>{{ serial.title }}</p>
                <p class="description">{{ serial.description === null ? 'No Description Available' : serial.description }}</p>
                <p><strong>Previous Series</strong> : {{serial.previous === null ? 'Not Available' : serial.previous.name }}</p>
                <p><strong>Next Series</strong> :  {{serial.next === null ? 'Not Available' : serial.next.name}} </p>
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
    name : 'Series',
    data : function(){
        return {
            isLoading : false,
            character: this.$route.params.id,
            characterName : '',
            characterDetails : [],
            seriesDetail : [],
            attributionText : '',
            filterValue : '',
            sortAsc : true,
            sortYearAsc : true,
            isLoadMoreShow : true,
            letters : [],
            isStartWithLetter : false,
            letterPicked : '',
            isNoResult : false,
        }
    },
    computed : {
        filteredAndSortedData(){
            let result = this.seriesDetail
            if(this.filterValue){
                this.isLoadMoreShow = false
                result = result.filter(item => item.title.toLowerCase().indexOf(this.filterValue.toLowerCase()) > -1)
            }
            return result            
        }
    },
    methods : {
        getInitialSeries(){
            this.isLoading = true
            axios.get('https://gateway.marvel.com:443/v1/public/characters/' + this.character + '/series?apikey=' + api_key)
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
                        this.seriesDetail.push(results[i])
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
        getSeriesStartWith(letter){
            this.seriesDetail = []
            this.isNoResult = false
            this.letterPicked = letter
            this.isStartWithLetter = true
            count = 0
            this.isLoading = true
            axios.get('https://gateway.marvel.com:443/v1/public/characters/' + this.character + '/series?titleStartsWith=' + letter + '&limit=10&offset=0&apikey=' + api_key)
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
                        this.seriesDetail.push(results[i])
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
                link = 'https://gateway.marvel.com:443/v1/public/characters/' + this.character + '/series?limit=10&offset=' + count + '&apikey=' + api_key
            } else {
                link = 'https://gateway.marvel.com:443/v1/public/characters/' + this.character + '/series?titleStartsWith=' + this.letterPicked + '&limit=10&offset=' + count + '&apikey=' + api_key 
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
                        this.seriesDetail.push(results[i])
                    }
                    this.isLoading = false
                    
                })
        },
        invertSort(){
            this.sortAsc = !this.sortAsc
            let ascDesc = this.sortAsc ? 1 : -1
            this.seriesDetail.sort((a,b) => ascDesc * a.title.localeCompare(b.title)) 
        },
        invertYearSort(){
            this.sortYearAsc = !this.sortYearAsc
            let ascDescYear = this.sortYearAsc ? 1 : -1
            this.seriesDetail.sort((c,d) => ascDescYear * (c.startYear - d.startYear)) 
        },
        goToDetail(url){
            window.open(url, '_blank')
        }
    }, 
    beforeMount(){
        this.getLetters()
        this.getInitialCharacter()
        this.getInitialSeries()
    }

    
}
</script>

<style lang="scss">
.comic, .serial {
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
        .description{
            text-align: justify;
        }
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
        span{
            a{
                &:hover {
                color : #A90F18;
                font-weight: 900;
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
</style>
