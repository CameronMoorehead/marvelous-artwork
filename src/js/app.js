// jQuery for import syntax
import "./jquery-global.js"

// Animation handling library and code
import "jquery-visible"
import test from "./visibleAnimation.js"
test()

// Library for auto complete on input box
import "awesomplete"

import characterList from "../data/characterList.js"

const PUBLIC_KEY = "79dbfcf16fdbdc05010e993ee6aa2745";
const PRIVATE_KEY = "c883d3b443583b43517aa306a8a88fd62af9295d";


// Give the search form input box auto complete functionality
function inputCompletion() {
  let input = document.getElementById("charSearchInput")
  new Awesomplete(input, { list: characterList });
}

// Fetches and renders API data for marvel characters
function characterSearch() {
  $("#charSearchForm").submit(e => {
    e.preventDefault()

    let input = document.getElementById("charSearchInput")

    let url = `http://gateway.marvel.com:80/v1/public/characters`

    $("#image-dump").slideUp(400)

    $.getJSON(url, {
      apikey: PUBLIC_KEY,
      nameStartsWith: input.value
    })
      .done(character => {
        let results = character.data.results
        if (results.length > 0) {
          // place thumbnails and names
          let images = ""
          results.forEach(character => {
            let thumbnail = character.thumbnail.path + "/portrait_fantastic.jpg"
            images += `
            <div>
              <img src="${thumbnail}">
              <span>
                <h3>${character.name}</h3>
                <button type="button" class="launch" charId="${character.id}">
                  GET COMICS
                </button>
              </span>
            </div>`
          })
          // Fades in images
          $("#character-img").hide().html(images).slideDown(400)
          bindGetComics()
        } else {
          // Character not available / invalid input
          $("#character-img").hide().html(`
            <div>
              <img id="notAvailable" src="/images/not_available.jpg">
              <p>Looks like the character you searched for is not available. Please try another.</p>
            </div>
            `).slideDown(400)
        }
      })
      .fail(err => {
        console.log(err);
      });

  })
}

function bindGetComics() {
  $(".launch").click(e => {
    e.preventDefault()
    // transition in comics view
    $("#image-dump").slideDown(400)
    // transition out character selection view, reveal comics
    $("#character-img").slideUp(400, () => {
      // extract id from namedNodeMap
      let charId = e.target.attributes.getNamedItem("charId").value
      // Object for API calls
      let dateRanges = [
        {
          title: "1960's",
          selector: "sixties",
          range: "1960-01-01, 1969-12-31"
        },
        {
          title: "1970's",
          selector: "seventies",
          range: "1970-01-01, 1979-12-31"
        },
        {
          title: "1980's",
          selector: "eighties",
          range: "1980-01-01, 1989-12-31"
        },
        {
          title: "1990's",
          selector: "nineties",
          range: "1990-01-01, 1999-12-31"
        },
        {
          title: "2000's",
          selector: "naughties",
          range: "2000-01-01, 2009-12-31"
        },
        {
          title: "2010's",
          selector: "twenty-tens",
          range: "2010-01-01, 2019-12-31"
        }
      ]
      dateRanges.forEach(date => {
        getComicCovers(charId, date)
      })
    })
  })
}

// Fetches and renders API data for comics
function getComicCovers(characterId, date) {

  // the api deals a lot in ids rather than just the strings you want to use
  let url = `http://gateway.marvel.com:80/v1/public/characters/${characterId}/comics`;


  // Inform user AJAX requests have been made
  let year = document.getElementById(date.selector)
  year.innerHTML = `${date.title} images are loading...`

  $.getJSON(url, {
    apikey: PUBLIC_KEY,
    dateRange: date.range
    })
    .done(character => {
      // sort of a long dump you will need to sort through
      let comics = character.data.results
      let images = `<h2>${date.title}</h2>`
      if (comics.length > 0) {
        comics.forEach(comic => {
          if (comic.images.length > 0) {
            let imgSrc = comic.images[0].path + "/portrait_uncanny.jpg"
            images += `<img class="module" src="${imgSrc}">`
          }
        })
        // Clear Loading... AJAX text
        $("#loading").html("")
        let year = document.getElementById(date.selector)
        year.innerHTML = images
      } else {
        let year = document.getElementById(date.selector)
        year.innerHTML = `${date.title} data not available.`
      }
    })
    .fail(err => {
      // the error codes are listed on the dev site
      console.log(err);
    });
}


// Initialize
(() => {
  characterSearch()
  inputCompletion()
})()
